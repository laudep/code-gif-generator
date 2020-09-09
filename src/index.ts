import Gif from './utils/Gif';
import log from './utils/log';
import createEditorPage from './utils/CodeEditorPage';
import { GifConfiguration, PRESETS, DEFAULT_PRESET } from './constants';

/* istanbul ignore next */
const generateGif = async (
  code: string,
  mode = 'javascript',
  presetName = DEFAULT_PRESET.name,
  theme = 'material-darker',
  lineNumbers = true,
) => {
  const loadPreset = (name: string): GifConfiguration => {
    const presetToLoad = PRESETS.find((preset) => preset.name === name) || DEFAULT_PRESET;
    const config: GifConfiguration = { ...presetToLoad };
    return config;
  };

  const { width, height, framerate, delay, scrollPercentage, compression, maximumScreenshotCount } = loadPreset(
    presetName,
  );

  const editorPage = await createEditorPage(code, mode, theme, lineNumbers);
  const gif: Gif = new Gif(width, height, framerate, delay);

  await editorPage.takeScreenshotsWhileScrolling(gif, scrollPercentage, maximumScreenshotCount);

  const gifBuffer = compression ? await gif.getCompressedBuffer(compression === 'lossless') : await gif.getBuffer();

  log.info(`GIF creation done. Returning buffer.`);
  return gifBuffer;
};

export default generateGif;
