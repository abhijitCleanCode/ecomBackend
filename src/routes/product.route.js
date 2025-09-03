import express from "express";
import upload, { handleMulterError } from "../middleware/multer.middleware.js";
import { CREATE_PRODUCT, GET_PRODUCTS_GENERIC } from "../controllers/product.controller.js";

const productRouter = express.Router();

productRouter.post("/create", upload.any(), handleMulterError, CREATE_PRODUCT);
productRouter.get("", GET_PRODUCTS_GENERIC);

export default productRouter;
