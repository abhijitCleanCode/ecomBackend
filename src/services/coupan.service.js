import mongoose from "mongoose";
import { generateRandom4DigitNumber } from "../utils/utils.js";
import Coupan from "../models/coupan.model.js";
import { ApiError } from "../utils/apiError.util.js";
import { buildLookUpPipeline } from "../utils/dynamicLookupHelper.js";

class CoupanService {
  static async createCoupan(coupanData) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      let createdCoupan;
      let created = false;

      while (!created) {
        try {
          const coupanCode = `COU${generateRandom4DigitNumber()}`.toUpperCase();
          coupanData.code = coupanCode;

          const newCoupan = await Coupan.create([{ ...coupanData }], {
            session,
          });
          createdCoupan = newCoupan[0];

          created = true;
        } catch (error) {
          // handle duplicate student regn
          if (error.code === 11000 && error.keyPattern?.code) {
            // retry if regn conflict occurs
            continue;
          }

          throw error;
        }
      }

      await session.commitTransaction();

      return createdCoupan;
    } catch (error) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }

      console.log(
        "src :: services :: coupan.service.js :: createCoupan :: error:",
        error.message
      );
      throw new ApiError(500, "Something went wrong while creating coupan");
    } finally {
      session.endSession();
    }
  }

  static async getCoupanGeneric({
    page = 1,
    limit = 25,
    filter = {},
    sort = { createdAt: -1 },
    userLoginCount = 1,
    isAdmin = false,
  }) {
    const DEFAULT_LIMIT = 20;
    const MAX_LIMIT = 200;

    page = Number.isNaN(Number(page)) ? 1 : Math.max(1, parseInt(page, 10));
    limit = Number.isNaN(Number(limit))
      ? DEFAULT_LIMIT
      : Math.min(MAX_LIMIT, Math.max(1, parseInt(limit, 10)));

    const queryFilter = { ...filter };
    const skip = (page - 1) * limit;

    const lookups = [];
    const projection = {
      _id: 1,
      code: 1,
      description: 1,
      minLoginCount: 1,
      minOrderValue: 1,
      validFrom: 1,
      validTill: 1,
      usageLimit: 1,
      discount: 1,
      isActive: 1,
      createdAt: 1,
      updatedAt: 1,
    };

    // base conditions
    const baseConditions = {
      ...queryFilter,
      isActive: true,
    };

    // if not admin, apply eligibility filters
    if (!isAdmin) {
      // baseConditions.validFrom = { $lte: new Date() };
      // baseConditions.$or = [
      //   { validTill: null },
      //   { validTill: { $gte: new Date() } },
      // ];
      baseConditions.minLoginCount = { $lte: userLoginCount };
    }

    const pipeline = [
      { $match: baseConditions },
      ...buildLookUpPipeline(lookups, projection),
      { $sort: sort },
      { $skip: skip },
      { $limit: limit },
    ];

    const coupanAggregate = await Coupan.aggregate(pipeline);
    const total = await Coupan.countDocuments(baseConditions);

    if (!coupanAggregate || coupanAggregate.length === 0) {
      return {
        coupans: [],
        meta: { total: 0, page, limit, totalPages: 0 },
      };
    }

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return {
      coupans: coupanAggregate,
      meta: { total, page, limit, totalPages },
    };
  }
}

export default CoupanService;
