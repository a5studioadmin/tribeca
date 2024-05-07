const { default: puppeteer } = require("puppeteer");
const {
  DEBUG,
  DEFAULT_PAGE_TIMEOUT,
  VIEWPORT_WIDTH,
  VIEWPORT_HEIGHT,
} = require("./config");

async function initPuppeteer() {
  const browser = await puppeteer.launch({
    headless: !DEBUG,
    args: ["--mute-audio"],
  });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(DEFAULT_PAGE_TIMEOUT);
  page.on("console", (message) => {
    if (message.text().includes("PAGE LOG")) {
      console.log(message.text());
    }
  });
  await page.setViewport({
    width: VIEWPORT_WIDTH,
    height: VIEWPORT_HEIGHT,
  });
  return { page, browser };
}

module.exports = {
  initPuppeteer,
};
