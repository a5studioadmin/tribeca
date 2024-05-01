<div align="center">
  <h3 align="center">Tribeca</h3>
  <p align="center">
    This project was developed for a film in the Tribeca film festival, and is designed to take existing news websites, re-write their articles using AI, and then screenshot the results.
    <br />
  </p>
</div>

### Built With

- [Ollama](https://ollama.com/)
- [Ollama-JS](https://github.com/ollama/ollama-js)
- [Puppeteer](https://pptr.dev/)

## Getting Started

To get a local copy up and running follow these simple example steps.

### Prerequisites

- Install [npm](https://www.npmjs.com/):

```sh
npm install npm@latest -g
```

- Download and launch [Ollama](https://ollama.com/)
- Ensure you have [node](https://nodejs.org/en) version 18.18.0 or above installed

### Installation

1. Clone the repo:

```sh
  git clone https://github.com/a5studioadmin/tribeca.git
  cd tribeca
```

2. Install NPM packages:

```sh
npm install
```

## Usage

1. Optionally modify the various writer personalities in defined as `WRITER_PERSONALITY` in config.js.
2. If additional websites need to be scraped, they can be added in the `WEBSITES` array in config.js. You need to manually identify the main website's anchor links that link to article detail pages, (optionally) any identifier for pagination button(s), and the article detail page title and content identifiers.
3. Optionally modify screenshot parameters, like `VIEWPORT_WIDTH`, `VIEWPORT_HEIGHT`, and `SCREENSHOT_FILETYPE` in config.js.
4. Optionally change how many articles are produced per website using `MAX_NUMBER_OF_ARTICLES_PER_WEBSITE` in config.js.
5. Run the program:

```sh
npm start
```

6. View the outputting screenshots in the screenshots directory.
