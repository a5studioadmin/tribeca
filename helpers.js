import {
  ALTERED_CONTENT_MAX_PARAGRAPHS,
  HEADLINE_MAX_CHARACTERS,
  getWebsites,
} from "./config.js";

function removeSpecialCharacters(str) {
  // Remove surrounding double quotes
  if (str.length >= 2 && str[0] === '"' && str[str.length - 1] === '"') {
    str = str.substring(1, str.length - 1);
  }
  // Remove leading and trailing "**"
  str = str.replace(/^\*\*|\*\*$/g, "");
  return str;
}

function getFormattedDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
}

function formatDay(day) {
  if (day > 3 && day < 21) return day + "th"; // for most numbers
  switch (day % 10) {
    case 1:
      return day + "st";
    case 2:
      return day + "nd";
    case 3:
      return day + "rd";
    default:
      return day + "th";
  }
}

function formatDate(date) {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const day = date.getDate();
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();

  return `${month} ${formatDay(day)}, ${year}`;
}

function generateRandomRecentDate() {
  const now = new Date();
  const threeMonthsAgo = new Date(new Date().setMonth(now.getMonth() - 3));
  const randomTime =
    Math.random() * (now.getTime() - threeMonthsAgo.getTime()) +
    threeMonthsAgo.getTime();
  const randomDate = new Date(randomTime);

  return formatDate(randomDate);
}

function splitTitleAndContent(text) {
  const parts = text.split("\n");
  const title = parts.shift().trim();
  const content = parts.join("\n").trim();
  return { title, content };
}

function mixArticles(localNews = [], nationalNews = [], limitOutput) {
  const combinedArray = [...localNews, ...nationalNews];
  // Shuffle articles using the Fisher-Yates algorithm
  for (let i = combinedArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [combinedArray[i], combinedArray[j]] = [combinedArray[j], combinedArray[i]];
  }
  if (limitOutput) {
    return combinedArray.slice(0, limitOutput);
  } else {
    return combinedArray;
  }
}

function getNationalNewsArticles() {
  const nationalNewsArticles = [];
  for (const website in getWebsites()) {
    if (website.nationalNewsSource) {
      nationalNewsArticles.concat(website.articles || []);
    }
  }
  return nationalNewsArticles;
}

function generatePrompt(perspective, content) {
  return `
  You will be supplied the raw text content of a news article at the end of this prompt, and you are to re-write the article from the perspective of ${perspective}. There are several requirements in addition to re-writing the content, which are described below.

  1. The article content you generate should be at least ${ALTERED_CONTENT_MAX_PARAGRAPHS} paragraphs in length.
  2. The article content you generate should not read as op-eds, and should read as a matter of fact.
  3. In your output, the first sentence should be a short news headline that summarizes the article (from the perspective of your beliefs), and it should be a max character length of ${HEADLINE_MAX_CHARACTERS}. It should also not contain any asterisks or quotations.
  4. Your output should be response only, and should only contain the content of the newly generated article you produced and the headline as the article's first sentence. In other words, the first sentence of your output should be the article headline, followed by at least ${ALTERED_CONTENT_MAX_PARAGRAPHS} paragraphs of re-written article content. For example, your response should not include "Here is a rewritten version of the article" or similar. It should only be a title that summarizes the article from your perspective, followed by the article content you generated.

  The article content that you should re-write is below:
  
  ${content}
  `;
}

export {
  generatePrompt,
  mixArticles,
  removeSpecialCharacters,
  getNationalNewsArticles,
  getFormattedDate,
  splitTitleAndContent,
  generateRandomRecentDate,
};
