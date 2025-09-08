import express from "express";
import { LOGIN_USER, REGISTER_USER } from "../controllers/user.controller.js";

const userRouter = express.Router();

userRouter.post("/register", REGISTER_USER);
userRouter.post("/login", LOGIN_USER);

export default userRouter;
