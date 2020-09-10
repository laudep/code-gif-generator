import Gif from './utils/Gif';
import log from './utils/log';
import createEditorPage from './utils/CodeEditorPage';
import { GifConfiguration, PRESETS, DEFAULT_PRESET } from './constants';

interface GenerateGifOptions {
  mode: string;
  theme: string;
  preset: 'fast' | 'default' | 'smooth';
  linenumbers: boolean;
}

/* istanbul ignore next */
/**
 * @description Generate an animated GIF for a code snippet
 * @param code the code snippet
 * @param mode the snippet's programming language (CodeMirror mode)
 * @param preset the preset name for the GIF
 * @param theme the theme to be applied to the code (CodeMirror theme)
 * @param linenumbers whether to display line numbers
 * @returns the buffer for the animated GIF
 */
const generateGif = async (
  code: string,
  { mode = 'javascript', theme = 'material-darker', preset = DEFAULT_PRESET.name, lineNumbers = true },
) => {
  const loadPreset = (name: string): GifConfiguration => {
    const presetToLoad = PRESETS.find((preset) => preset.name === name) || DEFAULT_PRESET;
    const config: GifConfiguration = { ...presetToLoad };
    return config;
  };

  const { width, height, framerate, delay, scrollPercentage, compression, maximumScreenshotCount } = loadPreset(preset);

  const editorPage = await createEditorPage(code, mode, theme, lineNumbers);
  const gif: Gif = new Gif(width, height, framerate, delay);

  await editorPage.takeScreenshotsWhileScrolling(gif, scrollPercentage, maximumScreenshotCount);

  return gif;
  //   const gifBuffer = compression ? await gif.getCompressedBuffer(compression === 'lossless') : await gif.getBuffer();

  //   log.info(`GIF creation done. Returning buffer.`);
  //   return gifBuffer;
};

export default generateGif;
