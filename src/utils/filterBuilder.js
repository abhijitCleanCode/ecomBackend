import mongoose from "mongoose";

export function builProductFilter (params) {
    const filter = {};

    if (params.category) {
        filter.category = params.category;
    }

    return filter;
}

export function builOrderFilter (params) {
    const filter = {};

    if (params.userId) {
        filter.user = params.userId;
    }

    if (params.productId) {
        filter.orderItems = params.productId;
    }

    return filter;
}

export function builCoupanFilter (params) {
    const filter = {};

    return filter;
}
