import UserServices from "../services/user.services.js";
import { ApiResponse } from "../utils/apiResponse.util.js";

export const REGISTER_USER = async (req, res) => {
  const { name, phone, email, password, address } = req.body;
  const userData = {
    name,
    phone,
    email,
    password,
    address,
  };

  try {
    const user = await UserServices.registerUser(userData);

    return res
      .status(201)
      .json(new ApiResponse(201, user, "User registered successfully"));
  } catch (error) {
    res.status(error.code || 500).json({
      success: false,
      message: error.message,
    });
  }
};
