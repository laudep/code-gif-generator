import Gif from './utils/Gif';
import log from './utils/log';
import createEditorPage from './utils/CodeEditorPage';
import { PresetName, GifConfiguration, PRESETS, DEFAULT_PRESET } from './constants';

interface GenerateGifOptions {
  mode: string;
  theme: string;
  preset: PresetName;
  lineNumbers: boolean;
}

/* istanbul ignore next */
/**
 * @description Generate an animated GIF for a code snippet
 * @param code the code snippet
 * @param options the options for the generated GIF
 * @returns instance of the GIF helper class
 */
const generateGif = async (
  code: string,
  {
    mode = 'javascript',
    theme = 'material-darker',
    preset = DEFAULT_PRESET.name,
    lineNumbers = true,
  }: GenerateGifOptions,
) => {
  const loadPreset = (name: string): GifConfiguration => {
    const presetToLoad = PRESETS.find((p) => p.name === name) || DEFAULT_PRESET;
    const config: GifConfiguration = { ...presetToLoad };
    return config;
  };

  const { width, height, framerate, delay, scrollPercentage, compression, maximumScreenshotCount } = loadPreset(preset);

  const editorPage = await createEditorPage(code, mode, theme, lineNumbers);
  const gif: Gif = new Gif(width, height, framerate, delay);

  await editorPage.takeScreenshotsWhileScrolling(gif, scrollPercentage, maximumScreenshotCount);

  return gif;
};

exports.default = generateGif;
module.exports = exports.default;
