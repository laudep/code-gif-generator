import generateGif from '../index';
import { TEST_CODE_STRING, TEST_MODE, TEST_THEME, TEST_PRESET, TEST_USE_LINE_NUMBERS } from './constants';

test('generate gif', async (done) => {
  expect(await generateGif(TEST_CODE_STRING, TEST_MODE, TEST_PRESET, TEST_THEME, TEST_USE_LINE_NUMBERS)).toBeInstanceOf(
    Buffer,
  );
  done();
});
