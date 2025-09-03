import mongoose from "mongoose";
import User from "../models/user.model.js";
import { ApiError } from "../utils/apiError.util.js";

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

      console.log("src :: services :: user.service.js :: userServices :: registerUser :: error: ", error);

      throw new ApiError(500, "Something went wrong while registering user");
    } finally {
      await session.endSession();
    }
  }
}

export default UserServices;
