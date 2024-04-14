import { ReadStream } from "fs";

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
  jpgQuality?: number;
  pngQuality: [number, number];
  reconnectTimeout?: number;
}

export { IConfig, IFile };
