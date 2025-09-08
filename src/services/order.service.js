import mongoose from "mongoose";
import Order from "../models/order.model.js";
import { ApiError } from "../utils/apiError.util.js";
import Product from "../models/product.model.js";
import Coupan from "../models/coupan.model.js";
import { buildLookUpPipeline } from "../utils/dynamicLookupHelper.js";

class OrderService {
  static async createOrder(orderDetails, userLoginCount) {
    console.log("src :: services :: order.service.js :: createOrder :: orderDetails: ", orderDetails);

    //todo basic validation

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const product = await Product.findById(orderDetails.orderItems).session(session);
      if (!product) {
        throw new ApiError(404, "Product not found");
      }
      console.log("src :: services :: order.service.js :: createOrder :: product: ", product);

      if (product.stock < orderDetails.orderQuantity) {
        throw new ApiError(400, "Insufficient stock");
      }
      // deduct stock
      product.stock -= orderDetails.orderQuantity;
      await product.save({ session });

      // calculate total
      let total = product.price * orderDetails.orderQuantity;
      let discountPrice = 0;

      if (orderDetails.appliedCoupans) {
        // check for valid coupans
        const validCoupan = await Coupan.find({
          code: orderDetails.appliedCoupans,
        });
        if (validCoupan) {
          const coupan = validCoupan[0];
          if (coupan.validFrom > Date.now()) {
            throw new ApiError(400, "Coupan is not valid yet");
          }
          if (coupan.minLoginCount > userLoginCount) {
            throw new ApiError(400, "Coupan is not applicable for this user");
          }
          discountPrice = total * (coupan.discount / 100);
          total -= discountPrice;
        }
      }

      console.log(
        "src :: services :: order.service.js :: createOrder :: total:", total);

      const newOrder = await Order.create(
        [
          {
            ...orderDetails,
            total,
            discount: discountPrice,
          },
        ],
        { session }
      );

      await session.commitTransaction();
      return newOrder[0];
    } catch (error) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }

      console.log(
        "src :: services :: order.service.js :: createOrder :: error:",
        error.message
      );
      throw new ApiError(500, "Something went wrong while creating order");
    } finally {
      await session.endSession();
    }
  }

  static async getOrdersGeneric({
    page = 1,
    limit = 25,
    filter = {},
    sort = { createdAt: -1 },
  }) {
    // fallback parameter
    const DEFAULT_LIMIT = 20;
    const MAX_LIMIT = 200; // protect from huge queries

    page = Number.isNaN(Number(page)) ? 1 : Math.max(1, parseInt(page, 10));
    limit = Number.isNaN(Number(limit))
      ? DEFAULT_LIMIT
      : Math.min(MAX_LIMIT, Math.max(1, parseInt(limit, 10)));

    const queryFilter = { ...filter };

    const skip = (page - 1) * limit;

    const lookups = [
      {
        from: "products",
        localField: "orderItems",
        foreignField: "_id",
        as: "orderItem",
      },
      {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
      }
    ];
    const projection = {
      _id: 1,
      product: "$orderItem.name",
      productCategory: "$orderItem.category",
      productListingPrice: "$orderItem.price",
      customerName: "$user.name",
      customerAddress: "$user.address",
      orderItems: 1,
      orderQuantity: 1,
      total: 1,
      discount: 1,
      createdAt: 1,
      updatedAt: 1,
      appliedCoupans: 1,
      paymentMethod: 1,
    }
    const pipeline = [
      { $match: queryFilter },
      ...buildLookUpPipeline(lookups, projection),
      { $sort: sort },
      { $skip: skip },
      { $limit: limit },
    ]

    console.log("src :: services :: order.service.js :: getOrdersGeneric :: pipeline: ", pipeline);
    const ordersAggregate = await Order.aggregate(pipeline);
    const total = await Order.countDocuments(queryFilter);
    console.log("src :: services :: order.service.js :: getOrdersGeneric :: total: ", total);

    console.log("src :: services :: order.service.js :: getOrdersGeneric :: ordersAggregate: ", ordersAggregate);

    if (!ordersAggregate || ordersAggregate.length === 0) {
      return {
        orders: [],
        meta: { total: 0, page, limit, totalPages: 0 },
      }
    }

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return {
      orders: ordersAggregate,
      meta: { total, page, limit, totalPages },
    }
  }
}

export default OrderService;
