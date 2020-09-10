import GifEncoder = require('gif-encoder');
import png = require('pngjs');
import imagemin = require('imagemin');
import imageminGiflossy = require('imagemin-giflossy');
import imageminGifsicle = require('imagemin-gifsicle');
import fs = require('fs');
import path = require('path');

import log from './log';
import { throwStatement } from '@babel/types';

/**
 *  @description Simplified interface for the gif-encoder library
 *
 * @export
 * @interface GifEncoder
 */
export interface GifEncoder {
  setFrameRate: (framerate: number) => void;
  setDelay: (delay: number) => void;
  setRepeat: (repeat: number) => void;
  writeHeader: () => void;
  addFrame: (frame: Buffer) => void;
  on: (event: string, callback: (buffer: Buffer) => void) => void;
  finish: () => void;
}

/**
 * @description Get an imagemin compression plugin
 * @param lossless whether lossless compression is required
 * @param compressionLevel how much optimization is done. Higher levels take longer, but may have better results.
 * @returns an imagemin compression plugin
 */
export const getCompressionPlugin = (lossless: boolean, compressionLevel: 1 | 2 | 3 = 2) =>
  lossless
    ? imageminGifsicle({
        optimizationLevel: compressionLevel,
      })
    : imageminGiflossy({
        lossy: 80,
        optimizationLevel: compressionLevel,
      });

/**
 * @description Convert a buffer to PNG
 * @param buffer the buffer to parse
 * @returns converted PNG image
 */
export const parsePngBuffer = (buffer: Buffer): Promise<png.PNG> =>
  new Promise((resolve, reject) => {
    new png.PNG().parse(buffer, (error, data) => (data ? resolve(data) : reject(error)));
  });

/**
 *  @description Helper class for GIF images
 *
 * @class Gif
 */
class Gif {
  private width: number;
  private height: number;
  private framerate: number;
  private chunks: Buffer[];
  private gif: GifEncoder;
  private buffer: Buffer | undefined;
  private modeName: string;

  constructor(width = 1280, height = 720, framerate = 60, delay = 0) {
    this.width = width;
    this.height = height;
    this.framerate = framerate;
    this.chunks = [];
    this.modeName = '';

    this.gif = new GifEncoder(width, height);
    this.gif.setFrameRate(framerate);
    this.gif.setDelay(delay);
    this.gif.setRepeat(0); // loop indefinitely
    this.gif.on('data', (chunk: Buffer) => this.chunks.push(chunk));
    this.gif.writeHeader();
  }

  /**
   * @description Add a frame to the current GIF animaton
   * @param frameBuffer the frame to add
   */
  async addFrame(frameBuffer: Buffer) {
    const image = await parsePngBuffer(frameBuffer);
    const imageData = image.data;
    log.debug('Adding frame to gif');
    this.gif.addFrame(imageData);
  }

  setModename(mode: string) {
    this.modeName = mode;
  }

  /**
   * @description Get the GIF's compressed buffer
   * @param lossless whether lossless compression is required
   * @returns the compressed buffer for the GIF
   */
  async getCompressedBuffer(lossless: boolean) {
    const buffer = await this.getBuffer();
    const plugin = getCompressionPlugin(lossless);
    log.info('Compressing gif');
    const compressedBuffer = await imagemin.buffer(buffer, {
      plugins: [plugin],
    });
    return compressedBuffer;
  }

  /**
   * @description Get the GIF's buffer
   * @returns the buffer for the GIF
   */
  getBuffer(): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      if (!this.buffer) {
        this.gif.finish();
        this.gif.on('end', () => {
          this.buffer = Buffer.concat(this.chunks);
          resolve(this.buffer);
        });
        /* istanbul ignore next */
        // @ts-ignore
        this.gif.on('error', (error: Error) => reject(error));
      } else {
        resolve(this.buffer);
      }
    });
  }

  getTimestampString(date = new Date()) {
    const pad2 = (n: number): string => (n < 10 ? '0' : '') + n;
    return (
      date.getFullYear() +
      pad2(date.getMonth() + 1) +
      pad2(date.getDate()) +
      pad2(date.getHours()) +
      pad2(date.getMinutes()) +
      pad2(date.getSeconds())
    );
  }

  getDefaultFilename() {
    return `${this.modeName ? this.modeName : 'gif'}_${this.getTimestampString()}`;
  }
  /**
   * @description Save the GIF to the filesystem
   * @param filename the filename for the gif (excluding extension)
   * @param compression compression to be used on the file
   * @param outDir the output directory for the GIF
   * @returns the path of the saved GIF
   */
  /* istanbul ignore next */
  async save(
    filename = this.getDefaultFilename(),
    outDir = path.resolve('./'),
    compression?: undefined | 'lossy' | 'losless',
  ): Promise<string> {
    const buffer = compression ? await this.getCompressedBuffer(compression === 'losless') : await this.getBuffer();

    const imagePath = path.resolve(outDir, `${filename}.gif`);
    log.info(`Saving: ${imagePath}`);
    await fs.promises.writeFile(imagePath, buffer);
    return imagePath;
  }
}

export default Gif;
