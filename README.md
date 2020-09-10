<p align="center">
  <img height="250" src="./docs/img/generating.gif">
</p>
<h1 align="center"> code-gif-generator </h1>
<p align="center">
  <b>Generate scrolling GIFs from code snippets</b>
</p>

## Description
Code-gif-generator is a tool for generating animated GIF files from code snippets.  
Use them to spice up your blog posts, documentation, or README files.  
Build on top of CodeMirror, more than 150 programming languages are supported.

## Installation

```sh
npm install --save-dev code-gif-generator
```

## Usage

### Minimal example

#### Code

```js
const generateGif = require('code-gif-generator'):

generateGif(`console.log('Hello World!')`).then(gif => gif.save());
```

#### Output

A single frame GIF in the current working directory:  

![Screenshot: 'Hello World!](./docs/img/helloworldjs.gif)


### Gif from this README file

#### Code

```js
import generateGif from '../src/index'

const createReadmeGif = async () => {
   const readmeContent =  await fs.promises.readFile('../README.md', 'utf8');
   const gif = await generateGif(readmeContent, {
    preset: 'smooth',
    mode: 'markdown',
    theme: 'monokai',
    lineNumbers: false,
  });
   const gifPath = await gif.save('readme-content', path.resolve(__dirname, '../docs/img'));
   return gifPath;
}

createReadmeGif().then(gifPath => console.log(`Gif saved: ${gifPath}`));
```

#### Output

A scrolling GIF in the docs/img folder:  

<img alt="Screenshot: 'README.md'" src="./docs/img/readme-content.gif" width="45%">

## API

### generateGif



### Presets



## License
[MIT](./LICENSE)
