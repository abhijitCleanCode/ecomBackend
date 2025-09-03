import mongoose, { Schema } from "mongoose";

const orderSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User is required"],
    },
    orderItems: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: [true, "Product is required"],
    },
    orderQuantity: {
        type: Number,
        default: 1,
    },
    appliedCoupans: {
        // type: Schema.Types.ObjectId,
        // ref: "Coupan",
        // default: null,
        type: String,
        default: null,
    },
    discount: {
        type: Number,
        default: 0,
    },
    total: {
        type: Number,
    },
    paymentMethod: {
        type: String,
        enum: ["cod", "online"],
        default: "cod",
    },
}, { timestamps: true })

const Order = mongoose.model("Order", orderSchema);

export default Order;
