import createEditorPage, { EditorPage, getEditorHtml } from '../utils/CodeEditorPage';
import Gif, { parsePngBuffer, getCompressionPlugin } from '../utils/Gif';
import fs = require('fs');
import path = require('path');
import del = require('del');
import png = require('pngjs');

const tmpDir = path.resolve(__dirname, 'tmp');

import {
  TEST_CODE_STRING,
  TEST_MODE,
  TEST_THEME,
  TEST_USE_LINE_NUMBERS,
  TEST_WIDTH,
  TEST_HEIGHT,
  TEST_SCROLL_PERCENTAGE,
  TEST_MAX_SCREENSHOTS,
} from './constants';

const TEST_TIMEOUT = 30000;
jest.setTimeout(TEST_TIMEOUT);

/**
 * @description Cleans filesystem output created during test execution
 */
const cleanup = async () => del([tmpDir]);

/**
 * @description Create a directory if it doesn't exist
 * @param directory the directory to check/create
 */
const createIfNotExists = (directory: fs.PathLike) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory);
  }
};

let editorPageShort: EditorPage;
let editorPageLong: EditorPage;
let testCode: string;
let gif = new Gif();
let image: Buffer;

beforeAll(async (done) => {
  try {
    editorPageShort = await createEditorPage(
      TEST_CODE_STRING,
      TEST_MODE,
      TEST_THEME,
      TEST_USE_LINE_NUMBERS,
      TEST_WIDTH,
      TEST_HEIGHT,
    );

    // use the contents of this file as test code
    testCode = await fs.promises.readFile(__filename, 'utf8');
    editorPageLong = await createEditorPage(testCode);
    gif = new Gif();
  } catch (error) {
    console.log(error);
  }

  createIfNotExists(tmpDir);
  done();
});

test('construct editor page helper', async (done) => {
  expect(editorPageShort).toBeInstanceOf(EditorPage);
  done();
});

test('get editor HTML', async (done) => {
  expect(await getEditorHtml(testCode, 'javascript', 'material-darker')).toContain(testCode);
  done();
});

test('scrolling screenshots without passing gif', async (done) => {
  expect(
    await editorPageShort.takeScreenshotsWhileScrolling((null as unknown) as Gif, 3, 3).catch((err: TypeError) => err),
  ).toBeInstanceOf(Error);
  done();
});

test('take screenshot', async (done) => {
  expect(await editorPageShort.takeScreenshot()).toBeInstanceOf(Buffer);
  done();
});

test('get scroll options', async (done) => {
  expect(await editorPageShort.determineScrollOptions(10)).toBeInstanceOf(Object);
  done();
});

if (process.platform === 'win32') {
  test('saving single screenshot gif', async (done) => {
    await editorPageShort.takeScreenshotsWhileScrolling(gif, TEST_SCROLL_PERCENTAGE, TEST_MAX_SCREENSHOTS);
    console.log('PATH: ', tmpDir);
    const path = await gif.save('test', tmpDir, 'lossy');
    image = await fs.promises.readFile(path);
    expect(image).toBeInstanceOf(Buffer);
    done();
  });

  test('lossy compressed gif buffer', async (done) => {
    expect(await gif.getCompressedBuffer(false)).toBeInstanceOf(Buffer);
    done();
  });
}

test('determine compression plugin', () => {
  expect(getCompressionPlugin(true, 2)).toBeInstanceOf(Object);
});

test('parse gif to png', async (done) => {
  expect(await parsePngBuffer(image).catch((err: Error) => err)).toBeInstanceOf(Error);
  done();
});

test('parse empty object to png', async (done) => {
  expect(await parsePngBuffer(Buffer.from(new ArrayBuffer(2))).catch((err: Error) => err)).toBeInstanceOf(Error);
  done();
});

test('multi screenshot gif', async (done) => {
  const multiScreenshotGif = new Gif();

  expect(
    await editorPageLong.takeScreenshotsWhileScrolling(
      multiScreenshotGif,
      TEST_SCROLL_PERCENTAGE,
      TEST_MAX_SCREENSHOTS,
    ),
  ).toEqual(true);
  done();
});

test('default gif filename with unknown mode', () => {
  gif.setModename('');
  expect(gif.getDefaultFilename().substring(0, 4)).toEqual('gif_');
});

test('get string for timestamp', () => {
  expect(typeof gif.getTimestampString(new Date())).toEqual('string');
});

afterAll(async () => {
  if (editorPageShort) {
    await editorPageShort.close();
  }
  if (editorPageLong) {
    await editorPageLong.close();
  }
  await cleanup();
});
