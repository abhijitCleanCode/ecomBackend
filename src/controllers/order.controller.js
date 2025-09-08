import { ApiResponse } from "../utils/apiResponse.util.js";
import OrderService from "../services/order.service.js";
import { builOrderFilter } from "../utils/filterBuilder.js";

export const CREATE_ORDER = async (req, res) => {
  const {
    orderItems,
    orderQuantity = 1,
    appliedCoupans,
    // discount,
    total,
    paymentMethod,
  } = req.body;
  const orderData = {
    //todo replace it with req.user._id
    user: req.user._id,
    orderItems,
    orderQuantity,
    appliedCoupans,
    // discount,
    total,
    paymentMethod,
  };

  try {
    const userLoginCount = req.user?.loginCount || 1;
    const order = await OrderService.createOrder(orderData, userLoginCount);

    return res
      .status(201)
      .json(new ApiResponse(201, order, "Order created successfully"));
  } catch (error) {
    res.status(error.code || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const GET_ORDERS_GENERIC = async (req, res) => {
  const { page, limit, sort, ...filterParams } = req.query;
  const filter = builOrderFilter(filterParams);

  try {
    // const isAdmin = req.user.role === "admin";
    // console.log("isAdmin: ", isAdmin);
    // if (!isAdmin) {
    //   filter.user =  req.user._id.
    //   console.log("filter: ", filter);
    // };

    const orders = await OrderService.getOrdersGeneric({
      page,
      limit,
      filter,
      sort,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, orders, "Orders fetched successfully"));
  } catch (error) {
    res.status(error.code || 500).json({
      success: false,
      message: error.message,
    });
  }
}
