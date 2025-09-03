import express from "express";
import { CREATE_ORDER, GET_ORDERS_GENERIC } from "../controllers/order.controller.js";

const orderRouter = express.Router();

orderRouter.post("/create", CREATE_ORDER);
orderRouter.get("", GET_ORDERS_GENERIC)

export default orderRouter;
