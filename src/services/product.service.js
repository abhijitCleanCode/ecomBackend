import mongoose from "mongoose";
import { processFilesForUpload } from "../utils/cloudinaryUpload.util.js";
import { ApiError } from "../utils/apiError.util.js";
import Product from "../models/product.model.js";
import { buildLookUpPipeline } from "../utils/dynamicLookupHelper.js";

class ProductService {
  static async createProduct(productData, files) {
    // basic validation
    if (
      [
        productData.name,
        productData.price,
        productData.stock,
        productData.category,
      ].some((field) => field?.trim() === "")
    ) {
      throw new ApiError(400, "All fields are required");
    }

    //todo check for duplicates in product collection

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      // uploads images to cloudinary
      const uploadedDocuments =
        files && files.length > 0
          ? await processFilesForUpload(files, "product")
          : [];

      console.log(
        "src :: services :: product.service.js :: createProduct :: uploadedDocuments: ",
        uploadedDocuments
      );

      const documentUrls = uploadedDocuments.reduce((acc, doc, index) => {
        acc[doc.field + index] = doc.url;
        return acc;
      }, {});
      console.log(
        "src :: services :: product.service.js :: createProduct :: documentUrls: ",
        documentUrls
      );

      // 1. create product
      const newProduct = await Product.create(
        [
          {
            ...productData,
            images: Object.values(documentUrls),
          },
        ],
        { session }
      );

      await session.commitTransaction();

      return newProduct;
    } catch (error) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }

      console.log(
        "src :: services :: product.service.js :: createProduct :: error: ",
        error.message
      );
      throw new ApiError(500, "Something went wrong while creating product");
    } finally {
      await session.endSession();
    }
  }

  static async getProductsGeneric({
    page = 1,
    limit = 25,
    filter = {},
    sort = { price: -1 },
  }) {
    // input normalization
    const DEFAULT_LIMIT = 20;
    const MAX_LIMIT = 200; // protect from huge queries

    page = Number.isNaN(Number(page)) ? 1 : Math.max(1, parseInt(page, 10));
    limit = Number.isNaN(Number(limit))
      ? DEFAULT_LIMIT
      : Math.min(MAX_LIMIT, Math.max(1, parseInt(limit, 10)));

    const queryFilter = { ...filter };

    const skip = (page - 1) * limit;

    const lookups = [];
    const projection = {
      _id: 1,
      name: 1,
      price: 1,
      stock: 1,
      category: 1,
      images: 1,
    };
    console.log(
      "src :: services :: product.service.js :: getProductsGeneric :: queryFilter: ",
      queryFilter
    );

    const pipeline = [
      { $match: queryFilter },
      ...buildLookUpPipeline(lookups, projection),
      { $sort: sort },
      { $skip: skip },
      { $limit: limit },
    ];

    const productAggregate = await Product.aggregate(pipeline);
    const total = await Product.countDocuments(queryFilter);

    if (!productAggregate || productAggregate.length === 0) {
      return {
        products: [],
        meta: { total: 0, page, limit, totalPages: 0 },
      };
    }

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return {
      products: productAggregate,
      meta: { total, page, limit, totalPages },
    };
  }
}

export default ProductService;
