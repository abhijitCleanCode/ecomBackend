import mongoose from "mongoose";

export function builProductFilter (params) {
    const filter = {};

    if (params.category) {
        filter.category = params.category;
    }
    
    if (params.productId) {
        filter._id = new mongoose.Types.ObjectId(params.productId);
    }

    return filter;
}

export function builOrderFilter (params) {
    const filter = {};

    if (params.userId) {
        filter.user = new mongoose.Types.ObjectId(params.userId);
    }

    if (params.productId) {
        filter.orderItems = new mongoose.Types.ObjectId(params.productId);
    }

    return filter;
}

export function builCoupanFilter (params) {
    const filter = {};

    return filter;
}
