import mongoose, { Schema } from "mongoose";

const coupanSchema = new Schema({
    code: {
        type: String,
        required: [true, "Coupan code is required"],
        unique: [true, "Coupan code must be unique"],
        uppercase: true,
        trim: true,
    },
    description: {
        type: String,
    },
    discount: {
        type: Number,
        required: [true, "Discount amount is required"],
    },
    // eligibility criteria
    minLoginCount: {
        type: Number,
        default: 2,
    },
    minOrderValue: {
        type: Number,
        default: 2,
    },
    //validity
    validFrom: {
        type: Date,
        default: Date.now(),
    },
    validTill: {
        type: Date,
    },
    usageLimit: {
        type: Number,
        default: 1,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
});

// coupanSchema.index({ code: 1 });
coupanSchema.index({ code: 1 }, { unique: true, sparse: true });

const Coupan = mongoose.model("Coupan", coupanSchema);

export default Coupan;
