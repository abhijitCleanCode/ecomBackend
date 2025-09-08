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

export const LOGIN_USER = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await UserServices.loginUser(email, password);

    return res
      .status(200)
      .json(new ApiResponse(200, user, "User logged in successfully"));
  } catch (error) {
    res.status(error.code || 500).json({
      success: false,
      message: error.message,
    });
  }
};
