import imagemin from "imagemin";
import imageminMozjpeg from "imagemin-mozjpeg";
import imageminPngquant from "imagemin-pngquant";

export default {
  compressPng: async (sourceData: Buffer, quality?: [number, number]) => {
    const config: { quality?: [number, number] } = {};

    if (config) {
      config.quality = quality;
    }

    return new Promise<Buffer>((resolve, reject) => {
      imagemin
        .buffer(sourceData, {
          plugins: [imageminPngquant(config)],
        })
        .then((resultData) => resolve(resultData))
        .catch((err) => reject(err));
    });
  },
  compressJpg: async (sourceData: Buffer, quality?: number) => {
    const config: { quality?: number } = {};

    if (config) {
      config.quality = quality;
    }

    return new Promise<Buffer>((resolve, reject) => {
      imagemin
        .buffer(sourceData, {
          plugins: [imageminMozjpeg(config)],
        })
        .then((resultData) => resolve(resultData))
        .catch((err) => reject(err));
    });
  },
};
