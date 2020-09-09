<p align="center">
  <img height="250" src="./docs/img/generating.gif">
</p>
<h1 align="center"> code-gif-generator </h1>
<p align="center">
  <b>Generate scrolling GIFs from code snippets</b>
</p>

## Description

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

### API

### Presets



## License
[MIT](./LICENSE)
