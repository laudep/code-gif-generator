import fs = require('fs');
import path = require('path');
const generateGif = require('../src/index');

const createReadmeGif = async () => {
  const readmeContent = await fs.promises.readFile(path.resolve(__dirname, '../README.md'), 'utf8');
  const gif = await generateGif(readmeContent, {
    preset: 'ultra',
    mode: 'markdown',
    theme: 'monokai',
    lineNumbers: false,
  });
  await gif.save('readme-content', path.resolve(__dirname, '../docs/img'));
};

createReadmeGif();
