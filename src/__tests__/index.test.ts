import del = require('del');
import Gif from '../utils/Gif';
import { TEST_CODE_STRING, TEST_MODE, TEST_THEME, TEST_PRESET, TEST_USE_LINE_NUMBERS } from './constants';
const generateGif = require('../index');

let gif: Gif;
let gifPath: string;
beforeAll(async (done) => {
  gif = await generateGif(TEST_CODE_STRING, {
    preset: TEST_PRESET,
    mode: TEST_MODE,
    theme: TEST_THEME,
    lineNumbers: TEST_USE_LINE_NUMBERS,
  });

  done();
});

test('generate gif', () => {
  expect(gif).toBeInstanceOf(Gif);
});

test('save gif', async (done) => {
  gifPath = await gif.save();
  expect(typeof gifPath).toBe('string');
  done();
});

afterAll(async () => {
  await del(gifPath);
});
