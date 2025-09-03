import express from "express";
import { REGISTER_USER } from "../controllers/user.controller.js";

const userRouter = express.Router();

userRouter.post("/register", REGISTER_USER);

export default userRouter;
