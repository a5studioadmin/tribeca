/* eslint-disable no-async-promise-executor */
const fs = require("fs").promises;
const {
  toSnakeCase,
  removeSpecialCharacters,
  getFormattedDate,
  splitTitleAndContent,
  generateRandomRecentDate,
} = require("./helpers");
const { initPuppeteer } = require("./initPuppeteer");
const { initOllama } = require("./initOllama");
const {
  SCREENSHOT_FILETYPE,
  ORIGINAL_ARTICLE_CONTENT_FILENAME,
  ALTERED_ARTICLE_CONTENT_FILENAME,
  OLLAMA_MODEL,
  USE_PERSISTED_DATA,
  SAVE_RAW_HTML,
  AUTHORS,
  TAGS,
} = require("./config");
// mutable because sometimes we might want to use persisted data
// during local development
let { WEBSITES } = require("./config");

let page, browser, ollama;

async function fetchArticles(website) {
  const {
    baseUrl,
    articles,
    basePageAnchorSelector,
    basePagePaginationSelector,
    detailPageTitleSelector,
    detailPageContentSelector,
    detailPageImageSelector,
    maxNumberOfArticles,
  } = website;
  let articleLinks = [];
  const articleLinksMap = {};
  console.log(`Scraping ${baseUrl} for articles`);
  try {
    await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
    do {
      const paginationSelector = basePagePaginationSelector
        ? await page.$(basePagePaginationSelector)
        : "";
      const links = await page.$$eval(basePageAnchorSelector, (links) => {
        return links.map((link) => {
          return {
            href: link.href,
          };
        });
      });
      const previousCount = Object.keys(articleLinksMap);
      links.forEach((link) => {
        articleLinksMap[link.href] = link;
      });
      const newCount = Object.keys(articleLinksMap);
      if (previousCount === newCount) {
        console.log(
          "Finish scraping because after pagination, no new articles were found."
        );
      } else if (Object.keys(articleLinksMap)?.length >= maxNumberOfArticles) {
        console.log(
          `Finish scraping because the max amount of articles (${maxNumberOfArticles}) have already been scraped.`
        );
      } else {
        console.log(`Found ${links.length} articles(s)`);
        if (!basePagePaginationSelector) {
          console.log(`Skipping pagination for ${baseUrl}`);
          break;
        } else if (!paginationSelector) {
          console.log(`Could not find pagination element for ${baseUrl}`);
          break;
        } else {
          console.log("Navigating to next page");
          await paginationSelector.click();
          await page
            .waitForNavigation({ waitUntil: "networkidle2" })
            .catch(() => {
              console.log(
                "Unable to paginate, but will take another look to see if new articles were loaded on the same page"
              );
            });
          console.log(`Scraping ${page.url()} for articles`);
        }
      }
    } while (Object.keys(articleLinksMap)?.length <= maxNumberOfArticles);

    // by adding to a lookup table first, any duplicate articles are removed
    for (const link in articleLinksMap) {
      articleLinks.push(articleLinksMap[link]);
    }
    console.log(
      `Scraped ${articleLinks.length} article(s) from ${baseUrl}, but limiting amount to ${maxNumberOfArticles}`
    );
    articleLinks = articleLinks.slice(0, maxNumberOfArticles);

    console.log(`Fetching content for ${articleLinks.length} article(s)`);
    for (const link of articleLinks) {
      try {
        await page.goto(link.href, { waitUntil: "domcontentloaded" });
        try {
          await page.waitForSelector(detailPageImageSelector, {
            visible: true,
            timeout: 1000,
          });
        } catch {
          // some pages need to wait for the image to appear since they fade in, some do not
        }
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
            const imageSelector = document.querySelector(
              detailPageImageSelector
            );
            const image = imageSelector
              ? document.querySelector(detailPageImageSelector).src
              : null;
            return { title, image, content, href };
          },
          detailPageTitleSelector,
          detailPageContentSelector,
          detailPageImageSelector,
          link.href
        );
        if (!articleContent.image) {
          // if we couldn't find an image, attempt to pull from the open graph image
          try {
            const ogImage = await page.$$eval(
              'meta[property="og:image"]',
              (elements) => elements.map((element) => element.content)
            );
            articleContent.image = ogImage?.[0];
          } catch (error) {
            console.log("Could not pull open graph image", error?.message);
          }
        }
        if (
          articleContent.image &&
          articleContent.title &&
          articleContent.content
        ) {
          console.log("Fetched content for", articleContent.href);
          articles.push(articleContent);
        } else {
          if (!articleContent.image) {
            console.log(
              `Discarding article because image was not found (${articleContent.href})`
            );
          } else if (!articleContent.title) {
            console.log(
              `Discarding article because title was not found (${articleContent.href})`
            );
          } else if (!articleContent.content) {
            console.log(
              `Discarding article because content was not found (${articleContent.href})`
            );
          }
        }
      } catch (error) {
        console.log(`Unable to fetch ${link.href}`, error.message);
      }
    }
    console.log(`Fetched content for ${articles.length} article(s)!`);
  } catch (error) {
    console.log(`Unable to fetch ${baseUrl}`, error.message);
  }
}

async function fetchAllArticles() {
  for (const website of WEBSITES) {
    await fetchArticles(website);
  }
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
      console.log(
        `Generating "${website.personality}" perspective for "${article.title}"`
      );
      const response = await ollama.chat({
        model: OLLAMA_MODEL,
        messages: [
          {
            role: "user",
            content: `${website.personality}. ${article.content}`,
          },
        ],
      });
      const { title, content } = splitTitleAndContent(response.message.content);
      article.title = removeSpecialCharacters(title);
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
    const directory = `./screenshots/${formattedDate}/${website.websiteName}`;
    const htmlDirectory = `${directory}/html`;
    await fs.mkdir(directory, { recursive: true });
    if (SAVE_RAW_HTML) {
      await fs.mkdir(htmlDirectory, { recursive: true });
    }
    console.log("Created screenshots directory", directory);
    await page.goto(website.template.baseUrl, {
      waitUntil: "networkidle2",
    });
    await page.waitForSelector(website.template.templatePageImageSelector, {
      visible: true,
    });
    console.log(`Loaded ${website.template.websiteName} template!`);
    if ((website.template.elementsToClick || []).length) {
      for (const index in website.template.elementsToClick) {
        const selector = website.template.elementsToClick[index];
        try {
          await page.waitForSelector(selector, {
            visible: true,
            timeout: 3000,
          });
          await page.click(selector);
          console.log("PAGE LOG: Clicked", selector);
        } catch (error) {
          console.log(error?.message || `Could not click ${selector}`);
        }
      }
    }
    for (const article of website.articles) {
      console.log("Re-writing", article.title);
      // some pages have an image fade in effect that we need to wait for
      // clear local storage
      const authorImage = AUTHORS[Math.floor(Math.random() * AUTHORS.length)];
      const updates = [
        {
          selector: website.template.templatePageTitleSelector,
          newContent: article.title,
        },
        {
          selector: website.template.templatePageContentSelector,
          newContent: article.content,
        },
        {
          selector: website.template.templatePageImageSelector,
          newContent: article.image,
          swapImage: true,
        },
        {
          selector: website.template.templatePageAuthorNameSelector,
          selectAll: true,
          newContent: AUTHORS[Math.floor(Math.random() * AUTHORS.length)].name,
        },
        {
          selector: website.template.templatePageDateSelector,
          newContent: generateRandomRecentDate(),
          selectAll: true,
        },
        {
          selector: website.template.templatePageTagSelector,
          replaceTags: true,
          tags: JSON.stringify(TAGS),
        },
        ...(website.template.templatePageAuthorImageSelectors || []).map(
          (element) => {
            return {
              selector: element,
              newContent: authorImage.image,
              swapImage: true,
            };
          }
        ),
        ...(website.template.elementsToHide || []).map((element) => {
          return {
            selector: element,
            hideElement: true,
          };
        }),
        ...(website.template.elementsToDelete || []).map((element) => {
          return {
            selector: element,
            deleteElement: true,
          };
        }),
      ];
      await page.evaluate((updates) => {
        return Promise.all(
          updates.map((update) => {
            return new Promise(async (resolve, reject) => {
              if (update.selector) {
                const element = document.querySelector(update.selector);
                if (element) {
                  if (update.swapImage) {
                    if (update.selector.includes("div")) {
                      element.style.background = `url("${update.newContent}")`;
                      element.style.backgroundImage = `url("${update.newContent}")`;
                      element.style.backgroundSize = "cover";
                      element.style.backgroundPosition = "center";
                      // As background images don't fire load events, consider a different method to ensure loading, or skip synchronization.
                      console.log(
                        `PAGE LOG: Poor support for background images, so will wait 1 second for load.`
                      );
                      setTimeout(() => resolve(), 1000);
                    } else {
                      // Clear existing srcset to ensure image loads correctly
                      element.srcset = "";
                      element.src = update.newContent;
                      element.style.objectFit = "cover";

                      element.onload = () =>
                        setTimeout(() => {
                          resolve();
                        }, 1000);
                      element.onerror = reject;
                    }
                  } else if (update.hideElement) {
                    console.log(`PAGE LOG: Hiding ${update.selector}`);
                    const elements =
                      document.querySelectorAll(update.selector) || [];
                    elements.forEach((e) => {
                      e.style.opacity = 0;
                      e.style.visibility = "hidden";
                    });
                    resolve();
                  } else if (update.deleteElement) {
                    console.log(`PAGE LOG: Deleting ${update.selector}`);
                    const elements =
                      document.querySelectorAll(update.selector) || [];
                    elements.forEach((e) => {
                      e.style.display = "none";
                    });
                    resolve();
                  } else if (update.replaceTags) {
                    const tags = JSON.parse(update.tags);
                    const elements =
                      document.querySelectorAll(update.selector) || [];
                    console.log(
                      `PAGE LOG: Replacing ${elements.length} tag(s) with ${tags.length} new tags`
                    );
                    for (let i = 0; i < elements.length; i++) {
                      const e = elements[i];
                      // delete any extra tags that we don't have hard coded names for
                      if (i > tags.length - 1) {
                        e.style.display = "none";
                      } else {
                        e.innerText = tags[i];
                      }
                    }
                    resolve();
                  } else {
                    if (update.selectAll) {
                      const elements =
                        document.querySelectorAll(update.selector) || [];
                      elements.forEach((e) => {
                        e.innerText = update.newContent;
                      });
                      resolve();
                    } else {
                      element.innerText = update.newContent;
                      resolve();
                    }
                  }
                } else {
                  console.log(
                    `PAGE LOG: Element not found for selector: ${update.selector}`
                  );
                  // resolve even if element not found to not block the Promise.all
                  resolve();
                }
              } else {
                resolve();
              }
            });
          })
        );
      }, updates);
      await page.screenshot({
        path: `${directory}/${toSnakeCase(
          article.title
        )}.${SCREENSHOT_FILETYPE}`,
        fullPage: false,
        type: SCREENSHOT_FILETYPE,
      });
      if (SAVE_RAW_HTML) {
        const html = await page.content();
        await fs.writeFile(
          `${htmlDirectory}/${toSnakeCase(article.title)}.html`,
          html
        );
      }
    }
  }
  console.log(
    `Finished re-writing articles for ${WEBSITES.length} website(s).`
  );
}

async function main() {
  try {
    if (USE_PERSISTED_DATA) {
      const persistedData = await fs.readFile(
        ALTERED_ARTICLE_CONTENT_FILENAME,
        "utf-8"
      );
      const persistedWebsites = JSON.parse(persistedData);
      let index = 0;
      persistedWebsites.forEach(() => {
        persistedWebsites[index].template = WEBSITES[index].template;
        index++;
      });
      WEBSITES = persistedWebsites;
    }
    const puppeteer = await initPuppeteer();
    page = puppeteer.page;
    browser = puppeteer.browser;
    ollama = await initOllama();

    if (!USE_PERSISTED_DATA) {
      // Scrape articles from all websites and save the contents to a json object
      await fetchAllArticles();

      // Generate altered article content, which will be saved to a new json file
      await generateAlteredArticleContent();
    }

    // Generate altered article content, which will be saved to a new json file
    // and generate screenshots for each article (VIEWPORT_WIDTH x VIEWPORT_HEIGHT)
    await rewriteArticlesUsingAlteredContent();
  } catch (error) {
    console.log(error.message);
  } finally {
    if (browser?.close) {
      console.log("Closing browser");
      await browser.close();
    }
  }
}

main();
