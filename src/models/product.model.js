import mongoose, { Schema } from "mongoose";

const productSchema = new Schema({
    name: {
        type: String,
        required: [true, "Product name is required"],
    },
    price: {
        type: Number,
        required: [true, "Product price is required"],
    },
    stock: {
        type: Number,
        required: [true, "Product stock is required"],
    },
    category: {
        type: String,
        enum: ["clothing", "electronics", "food"],
        lowercase: true,
        required: [true, "Product category is required"],
    },
    images: {
        type: [String],
    },
});

const Product = mongoose.model("Product", productSchema);

export default Product;
