import express from "express";
import { CREATE_ORDER, GET_ORDERS_GENERIC } from "../controllers/order.controller.js";
import { VERIFY_TOKEN } from "../middleware/auth.middleware.js";

const orderRouter = express.Router();

orderRouter.post("/create", VERIFY_TOKEN, CREATE_ORDER);
orderRouter.get("", VERIFY_TOKEN,  GET_ORDERS_GENERIC)

export default orderRouter;
