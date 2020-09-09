import createEditorPage, { EditorPage, getEditorHtml } from '../utils/CodeEditorPage';
import Gif from '../utils/Gif';
import fs = require('fs');

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

let editorPageShort: EditorPage;
let editorPageLong: EditorPage;
let testCode: string;

beforeAll(async (done) => {
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

test('single screenshot gif', async (done) => {
  const gif = new Gif();
  expect(
    await editorPageShort.takeScreenshotsWhileScrolling(gif, TEST_SCROLL_PERCENTAGE, TEST_MAX_SCREENSHOTS),
  ).toEqual(true);
  done();
});

test('multi screenshot gif', async (done) => {
  const TEST_TIMEOUT = 30000;
  const gif = new Gif();
  jest.setTimeout(TEST_TIMEOUT);
  expect(await editorPageLong.takeScreenshotsWhileScrolling(gif, TEST_SCROLL_PERCENTAGE, TEST_MAX_SCREENSHOTS)).toEqual(
    true,
  );
  done();
});

afterAll(async () => {
  await editorPageShort.close();
  await editorPageLong.close();
});
