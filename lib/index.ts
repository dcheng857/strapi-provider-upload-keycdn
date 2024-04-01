"use strict";

import { ReadStream } from "fs";
import ftp from "promise-ftp";
import tinypngAPI from "./tinypng";

interface IFile {
  name: string;
  alternativeText?: string;
  caption?: string;
  width?: number;
  height?: number;
  formats?: Record<string, unknown>;
  hash: string;
  ext?: string;
  mime: string;
  size: number;
  sizeInBytes: number;
  url: string;
  previewUrl?: string;
  path?: string;
  provider?: string;
  provider_metadata?: Record<string, unknown>;
  stream?: ReadStream;
  buffer?: Buffer;
}

interface IConfig {
  uploadPath: string;
  baseUrl: string;
  host: string;
  user: string;
  password: string;
  port: number;
  tinifyKey?: string;
  tinifyInclude?: string[];
}

const getSleepTime = (sizeInBytes) => {
  const sizeInMB: number = parseFloat((sizeInBytes / (1024 * 1024)).toFixed(2));
  return sizeInMB > 0 ? sizeInMB * 2000 : 2000;
};

const sleep = (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

const errLog = (...args: any[]) => {
  if (process.env.NODE_ENV !== "production") {
    console.debug(">>>>>>> upload keycdn <<<<<<<");
    console.debug(...args);
  }
};

const stream2buffer = async (stream: ReadStream): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const _buf: any[] = [];
    stream.on("data", (chunk: any) => _buf.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(_buf)));
    stream.on("error", (err: any) => reject(err));
  });
};

const getConnection = async (config: IConfig, sleepTime: number) => {
  let client = new ftp();
  try {
    await client.connect({
      host: config.host,
      user: config.user,
      password: config.password,
      port: config.port,
    });
    return client;
  } catch (err) {
    errLog(err);

    // when more than 3 connections as the same user error occur, wait and reconnect to the KeyCDN
    client.destroy();
    await sleep(sleepTime);
    console.log("reconnect to keycdn");
    return getConnection(config, sleepTime);
  }
};

const ftpUpload = (config: IConfig, file: IFile) =>
  new Promise(async (resolve, reject) => {
    // prepare the file content
    if (file.stream) {
      file.buffer = await stream2buffer(file.stream);
    }

    const sizeInBytes: number = Buffer.byteLength(file.buffer);

    // compass the target image
    if (
      config.tinifyKey &&
      config.tinifyInclude?.includes(file.ext.replace(".", ""))
    ) {
      file.buffer = await tinypngAPI.compassImage(
        config.tinifyKey,
        file.buffer
      );
    }

    const sleepTime: number = getSleepTime(sizeInBytes);
    const client = await getConnection(config, sleepTime);

    // prepare the file path
    const path: string = config?.uploadPath ? `${config.uploadPath}/` : "";
    const fileName: string = `${file.hash}${file.ext}`;
    const fullPath: string = `${path}${fileName}`;

    // start to upload file
    client
      .put(file.buffer, fullPath)
      .then(function () {
        file.url = `${config.baseUrl}/${fileName}`;
        delete file.buffer;
        client.destroy();

        resolve(file);
      })
      .catch(function (err: any) {
        client.end();
        errLog(err);
        reject(err);
      });
  });

const ftpDelete = (config: IConfig, file: IFile) =>
  new Promise(async (resolve, reject) => {
    const sleepTime: number = getSleepTime(file.size);
    const client = await getConnection(config, sleepTime);

    // prepare the file path
    const path: string = config?.uploadPath ? `${config.uploadPath}/` : "";
    const fileName: string = `${file.hash}${file.ext}`;
    const fullPath: string = `${path}${fileName}`;

    // start to delete file
    client
      .delete(fullPath)
      .then(function () {
        client.destroy();
        resolve("");
      })
      .catch(function (err: any) {
        client.end();
        errLog(err);
        reject(err);
      });
  });

module.exports = {
  provider: "keycdn",
  name: "KeyCDN",
  init: (config: IConfig) => {
    return {
      uploadStream: (file: IFile) => ftpUpload(config, file),
      upload: (file: IFile) => ftpUpload(config, file),
      delete: (file: IFile) => ftpDelete(config, file),
    };
  },
};
