const { Ollama } = require("ollama");
const puppeteer = require("puppeteer");
const fs = require("fs").promises;
const {
  toSnakeCase,
  removeSurroundingQuotes,
  getFormattedDate,
  splitTitleAndContent,
} = require("./helpers");
const {
  VIEWPORT_WIDTH,
  VIEWPORT_HEIGHT,
  SCREENSHOT_FILETYPE,
  MAX_NUMBER_OF_ARTICLES_PER_WEBSITE,
  ORIGINAL_ARTICLE_CONTENT_FILENAME,
  ALTERED_ARTICLE_CONTENT_FILENAME,
  OLLAMA_MODEL,
  MODELFILE,
  WEBSITES,
} = require("./config");

let page;
let browser;
const ollama = new Ollama();

async function initOllama() {
  // Set up ollama
  await ollama.create({
    model: OLLAMA_MODEL,
    modelfile: MODELFILE,
    stream: false,
  });
  const response = await ollama.list();
  console.log(
    "Available ollama models:",
    response.models.map((model) => model.name)
  );
}

async function initPuppeteer() {
  browser = await puppeteer.launch();
  page = await browser.newPage();
  page.on("console", (message) => {
    if (!message.text().includes("JQMIGRATE")) {
      console.log("PAGE LOG:", message.text());
    }
  });
  await page.setViewport({
    width: VIEWPORT_WIDTH,
    height: VIEWPORT_HEIGHT,
  });
}

async function fetchArticles(website) {
  const {
    baseUrl,
    detailPageTitleSelector,
    detailPageContentSelector,
    detailPageImageSelector,
    templateName,
  } = website;
  console.log("Beginning scraping of", baseUrl);
  try {
    await page.goto(baseUrl, { waitUntil: "networkidle0" });
    let articleLinks = await page.$$eval(
      website.basePageAnchorSelector,
      (links) => {
        return links.map((link) => {
          return {
            href: link.href,
            title: link.title,
          };
        });
      }
    );

    articleLinks = articleLinks.slice(0, MAX_NUMBER_OF_ARTICLES_PER_WEBSITE);
    console.log(`Found ${articleLinks.length} article(s)`);

    let index = 0;
    for (const link of articleLinks) {
      await page.goto(link.href, { waitUntil: "networkidle0" });
      console.log("Fetching content for", link.title);
      if (index === 0) {
        const content = await page.content();
        await fs.writeFile(`./templates/${templateName}.html`, content);
        console.log("Saved article detail template to", `${templateName}.html`);
      }
      index++;
      const articleContent = await page.evaluate(
        (
          detailPageTitleSelector,
          detailPageContentSelector,
          detailPageImageSelector,
          href
        ) => {
          const title = document.querySelector(
            detailPageTitleSelector
          ).innerText;
          const content = document.querySelector(
            detailPageContentSelector
          ).innerText;
          const image = document.querySelector(detailPageImageSelector).src;
          return { title, image, content, href };
        },
        detailPageTitleSelector,
        detailPageContentSelector,
        detailPageImageSelector,
        link.href
      );
      website.articles.push(articleContent);
    }
  } catch (error) {
    console.error("Error during scraping:", error);
  }
}

async function fetchAllArticles() {
  const promises = WEBSITES.map(async (website) => {
    return await fetchArticles(website);
  });
  await Promise.all(promises);
  console.log(`Finished scraping of ${WEBSITES.length} website(s)!`);
  await fs.writeFile(
    ORIGINAL_ARTICLE_CONTENT_FILENAME,
    JSON.stringify(WEBSITES),
    "utf8"
  );
  console.log(
    `All article content has been saved to ${ORIGINAL_ARTICLE_CONTENT_FILENAME}`
  );
}

async function generateAlteredArticleContent() {
  console.log(
    "Generating perspective for all article(s) based on the system prompt"
  );
  for (const website of WEBSITES) {
    for (const article of website.articles) {
      console.log("Generating perspective for", article.title);
      const response = await ollama.chat({
        model: OLLAMA_MODEL,
        messages: [{ role: "user", content: article.content }],
      });
      const { title, content } = splitTitleAndContent(response.message.content);
      article.title = removeSurroundingQuotes(title);
      article.content = content;
    }
  }
  await fs.writeFile(
    ALTERED_ARTICLE_CONTENT_FILENAME,
    JSON.stringify(WEBSITES),
    "utf8"
  );
  console.log(
    `All newly altered article content for ${WEBSITES.length} website(s) has been saved to ${ALTERED_ARTICLE_CONTENT_FILENAME}.`
  );
}

async function rewriteArticlesUsingAlteredContent() {
  console.log("Re-writing article(s) using altered content");
  const formattedDate = getFormattedDate();
  for (const website of WEBSITES) {
    const directory = `./screenshots/${formattedDate}/${website.templateName}`;
    await fs.mkdir(directory, { recursive: true });
    console.log("Created screenshots directory", directory);
    for (const article of website.articles) {
      console.log("Re-writing", article.title);
      await page.goto(article.href, { waitUntil: "networkidle0" });
      const updates = [
        { selector: website.detailPageTitleSelector, newText: article.title },
        {
          selector: website.detailPageContentSelector,
          newText: article.content,
        },
      ];
      await page.evaluate((updates) => {
        updates.forEach((update) => {
          const element = document.querySelector(update.selector);
          if (element) {
            element.innerText = update.newText;
          } else {
            console.log(`Element not found for selector: ${update.selector}`);
          }
        });
      }, updates);
      await page.screenshot({
        path: `${directory}/${toSnakeCase(
          article.title
        )}.${SCREENSHOT_FILETYPE}`,
        fullPage: false,
        type: SCREENSHOT_FILETYPE,
      });
    }
  }
  console.log(
    `Finished re-writing articles for ${WEBSITES.length} website(s).`
  );
}

async function main() {
  try {
    // Set up ollama
    await initOllama();

    // Set up puppeteer
    await initPuppeteer();

    // Scrape articles from all websites and save the contents to a json object
    await fetchAllArticles();

    // Generate altered article content, which will be saved to a new json file
    await generateAlteredArticleContent();

    // Generate altered article content, which will be saved to a new json file
    // and generate screenshots for each article (VIEWPORT_WIDTH x VIEWPORT_HEIGHT)
    await rewriteArticlesUsingAlteredContent();
  } catch (error) {
    console.warn(error);
  } finally {
    if (browser?.close) {
      await browser.close();
    }
  }
}

main();
