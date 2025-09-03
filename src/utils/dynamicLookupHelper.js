// production ready dynamic aggregation pattern, it solves following problem
// 1. maintain clean api response structure, by flatanning document
// 2. let of building the chain of lookup and unwind manually

export function buildLookUpPipeline(lookups, projection) {
  const pipeline = [];

  // for each run the function for each element of an array
  lookups.forEach((stage) => {
    pipeline.push({
      // left outer join
      $lookup: {
        from: stage.from, // collection to join
        localField: stage.localField, // field from input document
        foreignField: stage.foreignField, // field from the document of collection mention in form
        as: stage.as, // output array
      },
    });

    // deconstruct the output array from input document
    pipeline.push({ $unwind: `$${stage.as}` });
  });

  // ensure flat document, mention the fields that u need from a document
  if (projection) {
    pipeline.push({ $project: projection });
  }

  return pipeline;
}
