import tinify from "tinify";

export default {
  compassImage: async (key, sourceData) => {
    tinify.key = key;
    return new Promise<Buffer>((resolve, reject) => {
      tinify
        .fromBuffer(sourceData)
        .toBuffer(function (err, resultData: Buffer) {
          if (err) reject(err);
          console.log("compass finished!");
          resolve(resultData);
        });
    });
  },
};
