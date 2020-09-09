import puppeteer = require('puppeteer');
import path = require('path');
import fs = require('fs');
import log from './log';
import Gif from './Gif';

export const getEditorHtml = async (code: string, mode: string, theme: string, lineNumbers = true) => {
  const EDITOR_PATH = path.resolve(__dirname, 'editor_template.html');
  let htmlContent = await fs.promises.readFile(EDITOR_PATH, 'utf8');
  // add blank lines to compensate for zoom
  code += '\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n';
  htmlContent = htmlContent.replace('$$CODE$$', code);
  htmlContent = htmlContent.replace('$$MODE$$', mode);
  htmlContent = htmlContent.replace('$$THEME$$', theme);
  htmlContent = htmlContent.replace('$$LINENUMBERS$$', lineNumbers.toString());
  return htmlContent;
};

export class EditorPage {
  private mode: string;
  private width: number;
  private height: number;
  private browser: puppeteer.Browser;
  private page: puppeteer.Page;

  constructor(mode: string, width: number, height: number, browser: puppeteer.Browser, page: puppeteer.Page) {
    this.mode = mode;
    this.width = width;
    this.height = height;
    this.browser = browser;
    this.page = page;
  }

  takeScreenshot = async () => {
    const screenshotBuffer = await this.page.screenshot({
      type: 'png',
    });
    return screenshotBuffer;
  };

  /* istanbul ignore next */
  async determineScrollOptions(scrollPercentage: number) {
    const getPageHeight = async () =>
      await this.page.evaluate(
        () =>
          document.querySelector('body > div > div.CodeMirror-scroll > div.CodeMirror-sizer')!.getBoundingClientRect()
            .height,
      );

    const pageHeight = await getPageHeight();
    const scrollTop = await this.page.evaluate(() => document.documentElement.scrollTop);

    const startPosition =
      scrollTop +
      (await this.page.evaluate(
        () => document.querySelector('body > div > div.CodeMirror-scroll')!.getBoundingClientRect().height,
      ));

    const scrollAmount = Math.round((this.height * scrollPercentage) / 100);

    return {
      pageHeight,
      startPosition,
      scrollAmount,
    };
  }

  close() {
    log.info('Closing editor page');
    this.browser.close();
  }

  async takeScreenshotsWhileScrolling(gif: Gif, scrollPercentage: number, maxScreenshots: number) {
    gif.setModename(this.mode);
    const { pageHeight, startPosition, scrollAmount } = await this.determineScrollOptions(scrollPercentage);
    let scrolledUntil = startPosition;

    if (pageHeight <= scrolledUntil) {
      // single frame gif
      await gif.addFrame(await this.takeScreenshot());
    } else {
      let screenshotCount = 0;

      while (pageHeight > scrolledUntil && screenshotCount < maxScreenshots) {
        log.info(`Taking screenshot #${screenshotCount + 1}`);
        await gif.addFrame(await this.takeScreenshot());
        log.info(`Scrolling down by ${scrollAmount} pixels.`);

        /* istanbul ignore next */
        await this.page.evaluate((amount) => {
          const scrollElement = document.querySelector('body > div > div.CodeMirror-scroll');
          scrollElement!.scrollBy(0, amount);
        }, scrollAmount);

        scrolledUntil += scrollAmount;
        screenshotCount++;
      }
    }

    this.close();
    return true;
  }
}

const createEditorPage = async (
  code: string,
  mode = 'javascript',
  theme = 'material-darker',
  lineNumbers = true,
  pageWidth = 1280,
  pageHeight = 720,
) => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();

  log.info(`Setting page viewport to ${pageWidth}x${pageHeight}`);

  await page.setViewport({
    width: pageWidth,
    height: pageHeight,
  });

  log.info(`Selected mode '${mode}' and theme '${theme}'.`);
  const htmlContent = await getEditorHtml(code, mode, theme, lineNumbers);
  log.info(`Opening editor page`);
  await page.setContent(htmlContent, { waitUntil: 'networkidle2' });
  const session = await page.target().createCDPSession();
  await session.send('Emulation.setPageScaleFactor', {
    pageScaleFactor: 2, // 200%
  });

  const editorPage = new EditorPage(mode, pageWidth, pageHeight, browser, page);
  return editorPage;
};

export default createEditorPage;
