import ProductService from "../services/product.service.js";
import { ApiResponse } from "../utils/apiResponse.util.js";
import { builProductFilter } from "../utils/filterBuilder.js";

export const CREATE_PRODUCT = async (req, res) => {
  const { name, price, stock, category } = req.body;
  const { files } = req;

  const productData = {
    name,
    price,
    stock,
    category,
  };

  try {
    const product = await ProductService.createProduct(productData, files);

    return res
      .status(201)
      .json(new ApiResponse(201, product, "Product created successfully"));
  } catch (error) {
    res.status(error.code || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const GET_PRODUCTS_GENERIC = async (req, res) => {
  const { page, limit, sort, ...filterParams } = req.query;
  const filter = builProductFilter(filterParams);

  try {
    const products = await ProductService.getProductsGeneric({
      page,
      limit,
      filter,
      sort,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, products, "Products fetched successfully"));
  } catch (error) {
    res.status(error.code || 500).json({
      success: false,
      message: error.message,
    });
  }
};
