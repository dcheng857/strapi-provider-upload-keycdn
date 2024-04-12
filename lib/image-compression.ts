import imagemin from "imagemin";
import imageminMozjpeg from "imagemin-mozjpeg";
import tinify from "tinify";

export default {
  compressPng: async (key: string, sourceData: Buffer) => {
    tinify.key = key;
    return new Promise<Buffer>((resolve, reject) => {
      tinify
        .fromBuffer(sourceData)
        .toBuffer(function (err, resultData: Buffer) {
          if (err) reject(err);
          resolve(resultData);
        });
    });
  },
  compressJpg: async (sourceData: Buffer, quality: number = 80) => {
    return new Promise<Buffer>((resolve, reject) => {
      imagemin
        .buffer(sourceData, {
          plugins: [imageminMozjpeg({ quality: quality })],
        })
        .then((resultData) => resolve(resultData))
        .catch((err) => reject(err));
    });
  },
};
