import express from "express";
import { CREATE_COUPAN, GET_COUPANS_GENERIC } from "../controllers/coupan.controller.js";
import { VERIFY_TOKEN } from "../middleware/auth.middleware.js";

const coupanRouter = express.Router();

coupanRouter.post("/create", VERIFY_TOKEN, CREATE_COUPAN);
coupanRouter.get("", VERIFY_TOKEN, GET_COUPANS_GENERIC);

export default coupanRouter;
