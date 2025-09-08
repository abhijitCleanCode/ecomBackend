import mongoose from "mongoose";
import User from "../models/user.model.js";
import { ApiError } from "../utils/apiError.util.js";

const generate_AccessToken_RefreshToken = async function (userId) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // user.refreshToken = refreshToken
    // await user.save({ validateBeforeSave: false })

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating referesh and access token"
    );
  }
};

class UserServices {
  static async registerUser(userData) {
    // basic validation
    if (
      [userData.name, userData.email, userData.password, userData.address].some(
        (field) => field?.trim() === ""
      )
    ) {
      throw new ApiError(400, "All fields are required");
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const existedUser = await User.findOne({ email: userData.email }).session(
        session
      );
      if (existedUser) {
        throw new ApiError(400, "User already exists");
      }

      const user = await User.create(
        [
          {
            ...userData,
            role: "user",
          },
        ],
        { session }
      );
      await session.commitTransaction();

      return user[0];
    } catch (error) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }

      console.log(
        "src :: services :: user.service.js :: userServices :: registerUser :: error: ",
        error
      );

      throw new ApiError(500, "Something went wrong while registering user");
    } finally {
      await session.endSession();
    }
  }

  static async loginUser(email, password) {
    if (!email || !password) {
      throw new ApiError(400, "Email and password are required");
    }

    let user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    console.log(
      "src :: services :: user.service.js :: userServices :: loginUser :: user: ",
      user
    );

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid password");
    }
    console.log("isPasswordValid: ", isPasswordValid);

    user.loginCount = (user.loginCount || 0) + 1;
    await user.save();

    const { accessToken, refreshToken } =
      await generate_AccessToken_RefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password");

    return {
      data: loggedInUser,
      accessToken,
      refreshToken,
    };
  }
}

export default UserServices;
