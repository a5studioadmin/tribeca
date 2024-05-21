import puppeteer from "puppeteer";
import {
  HEADLESS,
  DEFAULT_PAGE_TIMEOUT,
  VIEWPORT_WIDTH,
  VIEWPORT_HEIGHT,
} from "./config.js";
import chalk from "chalk";

async function initPuppeteer() {
  const browser = await puppeteer.launch({
    headless: HEADLESS,
    args: ["--mute-audio"],
    protocolTimeout: 180_000,
  });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(DEFAULT_PAGE_TIMEOUT);
  page.on("console", (message) => {
    if (message.text().includes("PAGE LOG")) {
      if (message.text().toUpperCase().includes("ERROR")) {
        console.log(chalk.bold.red(message.text().replace("PAGE LOG: ", "")));
      } else {
        console.log(chalk.bold.blue(message.text().replace("PAGE LOG: ", "")));
      }
    }
  });
  await page.setViewport({
    width: VIEWPORT_WIDTH,
    height: VIEWPORT_HEIGHT,
  });
  return { page, browser };
}

export { initPuppeteer };
