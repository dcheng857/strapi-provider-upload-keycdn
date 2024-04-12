"use strict";

import { ReadStream } from "fs";
import ftp from "promise-ftp";
import compression from "./image-compression";
import { IConfig, IFile } from "./interfaces";

class KeyCDNClient {
  config: IConfig;

  // default reconnect timeout = 2 secs
  DEFAULT_RECONNECT_TIMEOUT: number = 2000;

  constructor(config: IConfig) {
    this.config = config;
  }

  sleep = (ms: number) => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  };

  errLog = (...args: any[]) => {
    if (process.env.NODE_ENV !== "production") {
      console.debug(">>>>>>> upload keycdn <<<<<<<");
      console.debug(...args);
    }
  };

  stream2buffer = async (stream: ReadStream): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
      const _buf: any[] = [];
      stream.on("data", (chunk: any) => _buf.push(chunk));
      stream.on("end", () => resolve(Buffer.concat(_buf)));
      stream.on("error", (err: any) => reject(err));
    });
  };

  getConnection = async () => {
    // get the sleep time for reconnect
    const sleepTime: number =
      this.config.reconnectTimeout ?? this.DEFAULT_RECONNECT_TIMEOUT;

    let client = new ftp();
    try {
      await client.connect({
        host: this.config.host,
        user: this.config.user,
        password: this.config.password,
        port: this.config.port,
      });
      return client;
    } catch (err) {
      // when more than 3 connections as the same user error occur, wait and reconnect to the KeyCDN
      if (err.code === 421) {
        client.destroy();
        await this.sleep(sleepTime);
        console.log("reconnect to keycdn");
        return this.getConnection();
      } else {
        this.errLog(err);
      }
    }
  };

  ftpUpload = (file: IFile) =>
    new Promise(async (resolve, reject) => {
      const self: KeyCDNClient = this;
      const extension: string = file.ext.replace(".", "");

      // prepare the file content
      if (file.stream) {
        file.buffer = await self.stream2buffer(file.stream);
      }

      // compress the image if extension match the config.tinifyInclude
      if (
        self.config.tinifyKey &&
        self.config.tinifyInclude?.includes(extension)
      ) {
        file.buffer = await compression.compressPng(
          self.config.tinifyKey,
          file.buffer
        );
      } else if (extension === "jpg" || extension === "jpeg") {
        // compress the image if extension is jpg or jpeg
        file.buffer = await compression.compressJpg(
          file.buffer,
          self.config.jpgQuality
        );
      }

      // calculate the size in kb
      const fileSizeInKb: number = Buffer.byteLength(file.buffer) / 1024;
      file.size = fileSizeInKb;

      // connect to ftp server
      const client = await self.getConnection();

      // prepare the file path
      const path: string = self.config?.uploadPath
        ? `${self.config.uploadPath}/`
        : "";
      const fileName: string = `${file.hash}${file.ext}`;
      const fullPath: string = `${path}${fileName}`;

      // start to upload file
      client
        .put(file.buffer, fullPath)
        .then(function () {
          file.url = `${self.config.baseUrl}/${fileName}`;
          delete file.buffer;
          client.destroy();

          resolve(file);
        })
        .catch(function (err: any) {
          client.end();
          self.errLog(err);
          reject(err);
        });
    });

  ftpDelete = (file: IFile) =>
    new Promise(async (resolve, reject) => {
      const self: KeyCDNClient = this;

      // connect to ftp server
      const client = await self.getConnection();

      // prepare the file path
      const path: string = self.config?.uploadPath
        ? `${self.config.uploadPath}/`
        : "";
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
          self.errLog(err);
          reject(err);
        });
    });
}

module.exports = {
  provider: "keycdn",
  name: "KeyCDN",
  init: (config: IConfig) => {
    const keyCDNClient: KeyCDNClient = new KeyCDNClient(config);
    return {
      uploadStream: (file: IFile) => keyCDNClient.ftpUpload(file),
      upload: (file: IFile) => keyCDNClient.ftpUpload(file),
      delete: (file: IFile) => keyCDNClient.ftpDelete(file),
    };
  },
};
