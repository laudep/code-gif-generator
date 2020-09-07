import createEditorPage, { EditorPage } from '../utils/CodeEditorPage';
import Gif from '../utils/Gif';

let editorPage: EditorPage;

beforeAll(async () => {
  editorPage = await createEditorPage('Hello World!');
});

test('construct editor page helper', async (done) => {
  expect(editorPage).toBeInstanceOf(EditorPage);
  done();
});

test('scrolling screenshots without passing gif', async (done) => {
  expect(
    await editorPage.takeScreenshotsWhileScrolling((null as unknown) as Gif, 3, 3).catch((err: TypeError) => err),
  ).toBeInstanceOf(Error);
  done();
});

afterAll(async () => {
  await editorPage.close();
});
