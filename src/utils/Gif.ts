import GifEncoder = require('gif-encoder');
import png = require('pngjs');
import imagemin = require('imagemin');
import imageminGiflossy = require('imagemin-giflossy');
import imageminGifsicle = require('imagemin-gifsicle');
import fs = require('fs');
import path = require('path');

import log from './log';

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
const getCompressionPlugin = (lossless: boolean, compressionLevel: 1 | 2 | 3 = 2) =>
  lossless
    ? imageminGifsicle({
        optimizationLevel: compressionLevel,
      })
    : imageminGiflossy({
        lossy: 80,
        optimizationLevel: compressionLevel,
      });

const parsePngBuffer = (buffer: Buffer): Promise<png.PNG> =>
  new Promise((resolve, reject) => {
    new png.PNG().parse(buffer, (error, data) => (data ? resolve(data) : reject(error)));
  });

class Gif {
  private width: number;
  private height: number;
  private framerate: number;
  private chunks: Buffer[];
  private gif: GifEncoder;
  private buffer: Buffer | undefined;

  constructor(width = 1280, height = 720, framerate = 60, delay = 0) {
    this.width = width;
    this.height = height;
    this.framerate = framerate;
    this.chunks = [];

    this.gif = new GifEncoder(width, height);
    this.gif.setFrameRate(framerate);
    this.gif.setDelay(delay);
    this.gif.setRepeat(0); // loop indefinitely
    this.gif.on('data', (chunk: Buffer) => this.chunks.push(chunk));
    this.gif.writeHeader();
  }

  async addFrame(buffer: Buffer) {
    const image = await parsePngBuffer(buffer);
    const imageData = image.data;
    log.debug('Adding frame to gif');
    this.gif.addFrame(imageData);
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

  getBuffer(): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      if (!this.buffer) {
        this.gif.finish();
        this.gif.on('end', () => {
          this.buffer = Buffer.concat(this.chunks);
          resolve(this.buffer);
        });
        this.gif.on('error', (error) => reject(error));
      } else {
        resolve(this.buffer);
      }
    });
  }

  async save(fileName: string, compression: undefined | 'lossy' | 'losless', outDir = path.resolve(`./output/`)) {
    let buffer: Buffer;

    if (!compression) {
      buffer = await this.getBuffer();
    } else {
      buffer = await this.getCompressedBuffer(compression === 'losless');
    }

    log.info(`Saving ${fileName}`);
    const imagePath = path.resolve(outDir, `${fileName}.gif`);
    return new Promise((resolve, reject) => {
      fs.writeFile(imagePath, buffer, (err) => {
        if (err) {
          log.error(err);
          reject(err);
        }

        log.info(`Gif saved: ${imagePath}`);
        resolve(imagePath);
      });
    });
  }
}

export default Gif;
