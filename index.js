/* eslint-disable no-async-promise-executor */
import { promises as fs } from "fs";
import {
  getFormattedDate,
  generateRandomRecentDate,
  mixArticles,
  getNationalNewsArticlesForPerspective,
  generatePrompt,
  transformLLMOutput,
} from "./helpers.js";
import { handleBrowserMessage, initPuppeteer } from "./initPuppeteer.js";
import { initOllama } from "./initOllama.js";
import {
  SCREENSHOT_FILETYPE,
  ORIGINAL_ARTICLE_CONTENT_FILENAME,
  ALTERED_ARTICLE_CONTENT_FILENAME,
  OLLAMA_MODEL,
  USE_PERSISTED_DATA,
  SAVE_RAW_HTML,
  TAGS,
  DEFAULT_PAGE_TIMEOUT,
  VIEWPORT_WIDTH,
  VIEWPORT_HEIGHT,
  getWebsites,
  setWebsites,
  WRITER_PERSPECTIVE_DEMOCRAT,
  WRITER_PERSPECTIVE_REPUBLICAN,
  WRITER_PERSPECTIVE_NEUTRAL,
} from "./config.js";
import authors from "./authors.js";
import chalk from "chalk";
import shortUUID from "short-uuid";

const ALLOW_ERROR_LOGGING = false;

const info = chalk.bold.blue;
const success = chalk.bold.green;
const warning = chalk.hex("#FFA500");
const error = ALLOW_ERROR_LOGGING ? chalk.bold.red : warning;

let page, browser, ollama;
let totalLocalArticlesFound = 0;
let totalNationalArticlesFound = 0;

async function fetchArticles(website) {
  const {
    baseUrl,
    articles,
    nationalNewsSource = false,
    basePageAnchorSelector,
    basePagePaginationSelector,
    detailPageTitleSelector,
    detailPageContentSelector,
    detailPageImageSelector,
    maxNumberOfArticles,
    onlyReadTopLevelTagFromDetail,
  } = website;
  let articleLinks = [];
  const articleLinksMap = {};
  console.log("\n");
  console.log(info(`Scraping ${baseUrl} for article content`));
  try {
    await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
    do {
      const paginationSelector = basePagePaginationSelector
        ? await page.$(basePagePaginationSelector)
        : "";
      const links = await page.$$eval(basePageAnchorSelector, (links) => {
        return links
          .filter((e) => e.checkVisibility())
          .map((link) => {
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
      if (
        !previousCount.length &&
        previousCount.length &&
        previousCount.length === newCount.length
      ) {
        console.log(
          success(
            "Finished scraping because after pagination, no new articles were found."
          )
        );
        break;
      } else if (newCount.length >= maxNumberOfArticles) {
        console.log(
          `Finished scraping because ${newCount.length} article(s) were scraped, which is equal or greater to the max number of articles (${maxNumberOfArticles})`
        );
        break;
      } else {
        if (newCount.length) {
          console.log(`Found ${newCount.length} articles(s)`);
        } else {
          console.log(
            error(`Did not find any articles to scrape on ${baseUrl}`)
          );
        }
        if (!basePagePaginationSelector) {
          console.log(`Skipping pagination for ${baseUrl}`);
          break;
        } else if (!paginationSelector) {
          console.log(
            error(`Could not find pagination element for ${baseUrl}`)
          );
          break;
        } else {
          console.log("Navigating to next page");
          await paginationSelector.click();
          await page
            .waitForNavigation({ waitUntil: "networkidle2" })
            .catch(() => {
              console.log(
                warning(
                  "Unable to paginate, but will take another look to see if new articles were loaded on the same page"
                )
              );
            });
          console.log(`Scraping ${page.url()} for article content`);
        }
      }
    } while (Object.keys(articleLinksMap)?.length <= maxNumberOfArticles);

    // by adding to a lookup table first, any duplicate articles are removed
    for (const link in articleLinksMap) {
      articleLinks.push(articleLinksMap[link]);
    }
    console.log(
      `Scraped ${articleLinks.length} article(s) from ${baseUrl} but limiting amount to ${maxNumberOfArticles}`
    );
    articleLinks = articleLinks.slice(0, maxNumberOfArticles);

    console.log(
      `Scraping content from ${articleLinks.length} ${
        nationalNewsSource ? "national news" : "local news"
      } article(s)`
    );
    for (const link of articleLinks) {
      try {
        await page.close();
        page = await browser.newPage();
        page.setDefaultNavigationTimeout(DEFAULT_PAGE_TIMEOUT);
        page.on("console", handleBrowserMessage);
        await page.setViewport({
          width: VIEWPORT_WIDTH,
          height: VIEWPORT_HEIGHT,
        });
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
            onlyReadTopLevelTagFromDetail,
            href
          ) => {
            const title = document.querySelector(
              detailPageTitleSelector
            ).innerText;
            let content = document.querySelector(detailPageContentSelector);
            if (onlyReadTopLevelTagFromDetail) {
              const topLevelParagraphs = Array.from(content.childNodes || [])
                .filter(
                  (node) => node.nodeName === onlyReadTopLevelTagFromDetail
                )
                .map((tag) => tag.innerText);
              content = topLevelParagraphs.join(" ");
            } else {
              content = content.innerText;
            }
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
          onlyReadTopLevelTagFromDetail,
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
          } catch (e) {
            console.log(
              error(`Could not pull open graph image: ${e?.message}`)
            );
          }
        }
        if (
          articleContent.image &&
          articleContent.title &&
          articleContent.content
        ) {
          console.log("Scraped content from", articleContent.href);
          articles.push({
            ...articleContent,
            nationalNews: nationalNewsSource,
          });
        } else {
          if (!articleContent.image) {
            console.log(
              error(
                `Discarding article because image was not found (${articleContent.href})`
              )
            );
          } else if (!articleContent.title) {
            console.log(
              error(
                `Discarding article because title was not found (${articleContent.href})`
              )
            );
          } else if (!articleContent.content) {
            console.log(
              error(
                `Discarding article because content was not found (${articleContent.href})`
              )
            );
          }
        }
      } catch (e) {
        console.log(error(`Unable to fetch ${link.href}: ${e.message}`));
      }
    }
    console.log(success(`Scraped content from ${articles.length} article(s)!`));
  } catch (e) {
    console.log(error(`Unable to fetch ${baseUrl}: ${e.message}`));
  }
  return articles.length;
}

async function fetchAllArticles() {
  const websites = getWebsites();
  for (const website of websites) {
    const numberOfArticlesFound = await fetchArticles(website);
    if (website.nationalNewsSource) {
      totalNationalArticlesFound += numberOfArticlesFound;
    } else {
      totalLocalArticlesFound += numberOfArticlesFound;
    }
  }
  const totalArticlesFound =
    totalNationalArticlesFound + totalLocalArticlesFound;
  console.log("\n");
  console.log(
    success(
      `Finished scraping of ${totalArticlesFound} article(s) (including ${totalNationalArticlesFound} national news articles) from ${websites.length} website(s), and saved content to ${ORIGINAL_ARTICLE_CONTENT_FILENAME}`
    )
  );
  await fs.writeFile(
    ORIGINAL_ARTICLE_CONTENT_FILENAME,
    JSON.stringify(getWebsites()),
    "utf8"
  );
  await page.close();
}

async function generateAlteredArticleContent() {
  console.log("\n");
  console.log(
    info(
      "Generating perspective for all article(s) based on the district's supplied writer personality"
    )
  );
  for (const website of getWebsites()) {
    if (website.nationalNewsSource) {
      const middleIndex = Math.ceil(website.articles.length / 2);
      const firstHalf = website.articles.slice(0, middleIndex);
      const secondHalf = website.articles.slice(middleIndex);
      for (const article of firstHalf) {
        console.log(
          `Generating left-leaning national news perspective for ${article.href}`
        );
        const response = await ollama.chat({
          model: OLLAMA_MODEL,
          messages: [
            {
              role: "user",
              content: generatePrompt(
                WRITER_PERSPECTIVE_DEMOCRAT,
                article.content
              ),
            },
          ],
        });
        const { title, content } = transformLLMOutput(response.message.content);
        article.title = title;
        article.content = content;
        article.perspective = WRITER_PERSPECTIVE_DEMOCRAT;
      }
      for (const article of secondHalf) {
        console.log(
          `Generating right-leaning national news perspective for ${article.href}`
        );
        const response = await ollama.chat({
          model: OLLAMA_MODEL,
          messages: [
            {
              role: "user",
              content: generatePrompt(
                WRITER_PERSPECTIVE_REPUBLICAN,
                article.content
              ),
            },
          ],
        });
        const { title, content } = transformLLMOutput(response.message.content);
        article.title = title;
        article.content = content;
        article.perspective = WRITER_PERSPECTIVE_REPUBLICAN;
      }
    } else {
      for (const article of website.articles) {
        console.log(`Generating neutral perspective for ${article.href}`);
        const response = await ollama.chat({
          model: OLLAMA_MODEL,
          messages: [
            {
              role: "user",
              content: generatePrompt(
                WRITER_PERSPECTIVE_NEUTRAL,
                article.content
              ),
            },
          ],
        });
        const { title, content } = transformLLMOutput(response.message.content);
        article.title = title;
        article.content = content;
        article.perspective = WRITER_PERSPECTIVE_NEUTRAL;
      }
    }
  }
  await fs.writeFile(
    ALTERED_ARTICLE_CONTENT_FILENAME,
    JSON.stringify(getWebsites()),
    "utf8"
  );
  console.log(
    success(
      `All newly altered article content for ${
        getWebsites().length
      } website(s) has been saved to ${ALTERED_ARTICLE_CONTENT_FILENAME}.`
    )
  );
}

async function rewriteArticlesUsingAlteredContent() {
  console.log("\n");
  console.log(info("Re-writing article(s) using altered content"));
  page = await browser.newPage();
  page.setDefaultNavigationTimeout(DEFAULT_PAGE_TIMEOUT);
  page.on("console", handleBrowserMessage);
  await page.setViewport({
    width: VIEWPORT_WIDTH,
    height: VIEWPORT_HEIGHT,
  });
  const formattedDate = getFormattedDate();
  let totalNumberOfRewrittenArticles = 0;
  for (const website of getWebsites()) {
    if (website.nationalNewsSource) {
      console.log(
        `Skipping ${website.websiteName} because it is a national new source`
      );
    } else {
      const directory = `./screenshots/${formattedDate}/${website.websiteName}`;
      const htmlDirectory = `${directory}/html`;
      await fs.mkdir(directory, { recursive: true });
      if (SAVE_RAW_HTML) {
        await fs.mkdir(htmlDirectory, { recursive: true });
      }
      console.log(`Creating article(s) for ${website.websiteName}`);
      await page.goto(website.template.baseUrl, {
        waitUntil: "networkidle2",
      });
      await page.waitForSelector(website.template.templatePageImageSelector, {
        visible: true,
      });
      if ((website.template.elementsToClick || []).length) {
        for (const index in website.template.elementsToClick) {
          const selector = website.template.elementsToClick[index];
          try {
            await page.waitForSelector(selector, {
              visible: true,
              timeout: 3000,
            });
            await page.click(selector);
            console.log(info(`PAGE LOG: Clicked ${selector}`));
          } catch (e) {
            console.log(error(e?.message || `Could not click ${selector}`));
          }
        }
      }
      if (website.articles.length === 0) {
        console.log(error(`No articles were saved for ${website.websiteName}`));
      }
      const combinedArticles = mixArticles(
        website.articles,
        getNationalNewsArticlesForPerspective(website.perspective)
      );
      for (const article of combinedArticles) {
        const prefix = shortUUID.generate();
        console.log("\n");
        console.log(`Re-writing ${article.href}`);
        // some pages have an image fade in effect that we need to wait for
        // clear local storage
        const authorImage = authors[Math.floor(Math.random() * authors.length)];
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
            selector: website.template.templatePagePrimaryColorSelector,
            newContent: website.primaryBrandColor,
            swapPrimaryColor: true,
          },
          {
            selector: website.template.templatePageAuthorNameSelector,
            selectAll: true,
            newContent:
              authors[Math.floor(Math.random() * authors.length)].name,
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
          {
            selector: website.template.templatePageShortNameSelector,
            newContent: website.websiteShortName,
            replaceWebsiteShortName: true,
          },
          {
            selector: website.template.templatePageNameSelector,
            newContent: website.websiteName,
            replaceWebsiteName: true,
          },
          {
            selector: website.template.templatePageNameNewsFromSelector,
            newContent: website.websiteName,
            replaceWebsiteNewsFromName: true,
          },
          ...(website.template.backgroundColorsToOverwrite || []).map(
            (element) => {
              return {
                selector: element,
                newContent: website.primaryBrandColor,
                overwriteBackgroundColor: true,
              };
            }
          ),
          ...(website.template.colorsToOverwrite || []).map((element) => {
            return {
              selector: element,
              newContent: website.primaryBrandColor,
              overwriteColor: true,
            };
          }),
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
          ...(website.template.classNamesToRewrite || []).map(
            ({ selector, className }) => {
              return {
                selector,
                className,
                rewriteClassName: true,
              };
            }
          ),
          ...(website.template.selectorStyles || []).map(
            ({ selector, styles }) => {
              return {
                selector,
                styles,
                applyStyles: true,
              };
            }
          ),
        ];
        await page.evaluate((updates) => {
          return Promise.all(
            updates.map((update) => {
              return new Promise(async (resolve, reject) => {
                try {
                  if (update.selector) {
                    if (update.swapPrimaryColor) {
                      console.log(
                        `PAGE LOG: Replacing primary color (${update.selector}) with ${update.newContent}`
                      );
                      document.documentElement.style.setProperty(
                        update.selector,
                        update.newContent
                      );
                      resolve();
                    } else {
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
                        } else if (update.replaceWebsiteShortName) {
                          console.log(
                            `PAGE LOG: Replacing website short name with ${update.newContent}`
                          );
                          const elements =
                            document.querySelectorAll(update.selector) || [];
                          elements.forEach((e) => {
                            e.innerText = update.newContent;
                          });
                          resolve();
                        } else if (update.overwriteBackgroundColor) {
                          console.log(
                            `PAGE LOG: Replacing background colors with ${update.newContent}`
                          );
                          const elements =
                            document.querySelectorAll(update.selector) || [];
                          elements.forEach((e) => {
                            e.style.backgroundColor = update.newContent;
                          });
                          resolve();
                        } else if (update.overwriteColor) {
                          console.log(
                            `PAGE LOG: Replacing colors with ${update.newContent}`
                          );
                          const elements =
                            document.querySelectorAll(update.selector) || [];
                          elements.forEach((e) => {
                            e.style.color = update.newContent;
                          });
                          resolve();
                        } else if (update.replaceWebsiteName) {
                          console.log(
                            `PAGE LOG: Replacing website name with "${update.newContent}"`
                          );
                          const elements =
                            document.querySelectorAll(update.selector) || [];
                          elements.forEach((e) => {
                            e.innerText = update.newContent;
                          });
                          resolve();
                        } else if (update.replaceWebsiteNewsFromName) {
                          const name = `News from the ${update.newContent}`;
                          console.log(
                            `PAGE LOG: Replacing website news from name with "${name}"`
                          );
                          const elements =
                            document.querySelectorAll(update.selector) || [];
                          elements.forEach((e) => {
                            e.innerText = name;
                          });
                          resolve();
                        } else if (update.rewriteClassName) {
                          console.log(
                            `PAGE LOG: Re-writing ${update.selector}`
                          );
                          const elements =
                            document.querySelectorAll(update.selector) || [];
                          elements.forEach((e) => {
                            e.className = update.className;
                          });
                          resolve();
                        } else if (update.deleteElement) {
                          console.log(`PAGE LOG: Deleting ${update.selector}`);
                          const elements =
                            document.querySelectorAll(update.selector) || [];
                          elements.forEach((e) => {
                            e.remove();
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
                        } else if (update.applyStyles) {
                          console.log(
                            `PAGE LOG: Applying styles to ${update.selector}`
                          );
                          const elements =
                            document.querySelectorAll(update.selector) || [];
                          elements.forEach((e) => {
                            for (const [key, value] of Object.entries(
                              update.styles || {}
                            )) {
                              e.style.setProperty(key, value);
                            }
                          });
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
                    }
                  } else {
                    resolve();
                  }
                } catch (error) {
                  console.log("PAGE LOG ERROR", error.message);
                }
              });
            })
          );
        }, updates);
        let perspective = "neutral";
        if (article.perspective === WRITER_PERSPECTIVE_REPUBLICAN) {
          perspective = "republican";
        } else if (article.perspective === WRITER_PERSPECTIVE_DEMOCRAT) {
          perspective = "democrat";
        }
        await page.screenshot({
          path: `${directory}/${prefix}_${perspective}.${SCREENSHOT_FILETYPE}`,
          fullPage: false,
          type: SCREENSHOT_FILETYPE,
        });
        if (SAVE_RAW_HTML) {
          const html = await page.content();
          await fs.writeFile(
            `${htmlDirectory}/${prefix}_${perspective}.html`,
            html
          );
        }
      }
      console.log("\n");
      console.log(
        success(
          `Finished re-writing ${combinedArticles.length} article(s) for ${website.websiteName}.`
        )
      );
      totalNumberOfRewrittenArticles += combinedArticles.length;
    }
  }
  console.log("\n");
  console.log(
    success(
      `Finished re-writing ${totalNumberOfRewrittenArticles} article(s) for ${
        getWebsites(false).length
      } website(s).`
    )
  );
}

async function main() {
  try {
    if (USE_PERSISTED_DATA) {
      console.log(info("Using persisted data!"));
      const persistedData = await fs.readFile(
        ALTERED_ARTICLE_CONTENT_FILENAME,
        "utf-8"
      );
      const persistedWebsites = JSON.parse(persistedData);
      let index = 0;
      const websites = getWebsites();
      persistedWebsites.forEach(() => {
        persistedWebsites[index] = {
          ...websites[index],
          template: websites[index].template,
          articles: persistedWebsites[index].articles,
        };
        index++;
      });
      setWebsites(persistedWebsites);
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
  } catch (e) {
    console.log(error(e.message));
  } finally {
    if (browser?.close) {
      console.log("Closing browser");
      await browser.close();
    }
  }
}

main();
