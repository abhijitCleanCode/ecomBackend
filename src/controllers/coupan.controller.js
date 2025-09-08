import CoupanService from "../services/coupan.service.js";
import { ApiResponse } from "../utils/apiResponse.util.js";
import { builCoupanFilter } from "../utils/filterBuilder.js";

export const CREATE_COUPAN = async (req, res) => {
  const { description, discount, minLoginCount, usageLimit } = req.body;
  const coupanObj = {
    description,
    discount,
    minLoginCount,
    usageLimit,
  };

  try {
    const coupan = await CoupanService.createCoupan(coupanObj);

    return res
      .status(201)
      .json(new ApiResponse(201, coupan, "Coupan created successfully"));
  } catch (error) {
    res.status(error.code || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const GET_COUPANS_GENERIC = async (req, res) => {
  const { page, limit, sort, ...filterParams } = req.query;
  const filter = builCoupanFilter(filterParams);

  try {
    // pass user’s loginCount to service
    const userLoginCount = req.user?.loginCount || 1;
    const userRole = req.user.role;

    let isAdmin = false;
    if (userRole === "admin") {
      isAdmin = true;
    }

    const coupan = await CoupanService.getCoupanGeneric({
      page,
      limit,
      filter,
      sort,
      userLoginCount,
      isAdmin
    });

    return res
      .status(200)
      .json(new ApiResponse(200, coupan, "Coupan fetched successfully"));
  } catch (error) {
    res.status(error.code || 500).json({
      success: false,
      message: error.message,
    });
  }
};
