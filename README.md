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

This is an example of how to list things you need to use the software and how to install them.

- Install [npm](https://www.npmjs.com/)
  ```sh
  npm install npm@latest -g
  ```
- Download and launch [Ollama](https://ollama.com/)
- Ensure you have [node](https://nodejs.org/en) version 18.18.0 or above installed

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/github_username/repo_name.git
   ```
2. Install NPM packages
   ```sh
   npm install
   ```

## Usage

1. Optionally modify the various writer personalities in defined as `WRITER_PERSONALITY` in config.js.
2. If additional websites need to be scraped, they can be added in the `WEBSITES` array in config.js. You need to manually identify the main website's anchor links that link to article detail pages, (optionally) any identifier for pagination button(s), and the article detail page title and content identifiers.
3. Run the program
   ```sh
   npm start
   ```
4. View the outputting screenshots in the screenshots directory
