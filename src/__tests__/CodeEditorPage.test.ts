import createEditorPage, { EditorPage, getEditorHtml } from '../utils/CodeEditorPage';
import Gif from '../utils/Gif';
const fs = require('fs');

let editorPageShort: EditorPage;
let editorPageLong: EditorPage;
const TEST_CODE_STRING = 'Hello World!';
const TEST_MODE = 'javascript';
const TEST_THEME = 'default';
const USE_LINE_NUMBERS = false;
const TEST_WIDTH = 1280;
const TEST_HEIGHT = 720;
const TEST_SCROLL_PERCENTAGE = 100;
const TEST_MAX_SCREENSHOTS = 2;

const testCode = fs.readFileSync(__filename, 'utf8');

beforeAll(async (done) => {
  editorPageShort = await createEditorPage(
    TEST_CODE_STRING,
    TEST_MODE,
    TEST_THEME,
    USE_LINE_NUMBERS,
    TEST_WIDTH,
    TEST_HEIGHT,
  );
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
