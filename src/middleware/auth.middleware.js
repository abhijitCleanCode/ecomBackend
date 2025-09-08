import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const VERIFY_TOKEN = async (request, response, next) => {
  try {
    // 1. extract token
    const token =
      request.cookies?.accessToken ||
      request.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return response.status(401).json({ message: "Unauthorized" });
    }

    // 2. decode token
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken.id);
    if (!user) {
      return response
        .status(401)
        .json({ message: "Invalid token user not found" })
        .select("-password -__v");
    }

    // 3. attach user to request
    request.user = user;
    request.role = user.roles;

    // 4. that's all proceed
    next();
  } catch (error) {
    console.error("Error in VERIFY_TOKEN middleware:", error);
    if (error instanceof jwt.JsonWebTokenError) {
      return response.status(401).json({ message: "Invalid token" });
    }
    if (error instanceof jwt.TokenExpiredError) {
      return response.status(401).json({ message: "Token expired" });
    }

    response.status(500).json({ message: "Internal server error" });
  }
};
