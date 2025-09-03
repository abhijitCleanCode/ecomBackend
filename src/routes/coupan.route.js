import express from "express";
import { CREATE_COUPAN, GET_COUPANS_GENERIC } from "../controllers/coupan.controller.js";

const coupanRouter = express.Router();

coupanRouter.post("/create", CREATE_COUPAN);
coupanRouter.get("", GET_COUPANS_GENERIC);

export default coupanRouter;
