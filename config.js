const VIEWPORT_WIDTH = 2560;
const VIEWPORT_HEIGHT = 1440;
const SCREENSHOT_FILETYPE = "png";
const MAX_NUMBER_OF_ARTICLES_PER_WEBSITE = 2;
const HEADLINE_MAX_CHARACTERS = 75;
const ALTERED_CONTENT_MAX_PARAGRAPHS = 4;
const ORIGINAL_ARTICLE_CONTENT_FILENAME = "./data/articles_original.json";
const ALTERED_ARTICLE_CONTENT_FILENAME = "./data/articles_altered.json";

// Additional model configuration options
// https://github.com/ollama/ollama/blob/main/docs/modelfile.md#valid-parameters-and-values

const WRITER_PERSONALITY_ONE = "You are mario from super mario brothers";
const WRITER_PERSONALITY_TWO = "You are spider man";

const SYSTEM_PROMPT = `You will be supplied text containing a specific writer personality in the first sentence, followed by the content of a random news article, and you are to re-write the article from the perspective of your believes, including an article title that you should add to the first sentence of your output. If the article is a national news story (as opposed to a local news story), you should more strongly emphasize your beliefs through your writing. To summarize, your output should be a newline-delimited string of text with the first sentence as an article title that you generated (which should should be a short, one-sentence news headline length that has a max character length of ${HEADLINE_MAX_CHARACTERS}, and should not contain any asterisks or quotations), followed by the article the content you generated (which should be limited to ${ALTERED_CONTENT_MAX_PARAGRAPHS} paragraphs). You should respond with response only.`;
const OLLAMA_MODEL = "llama3:latest";

const MODELFILE = `
FROM ${OLLAMA_MODEL}
SYSTEM ${SYSTEM_PROMPT}
`;

const WEBSITES = [
  {
    baseUrl: "https://whnynews.com/category/news/local",
    templateName: "whnynews_local",
    personality: WRITER_PERSONALITY_ONE,
    basePageAnchorSelector: "a.td-image-wrap",
    basePagePaginationSelector: "i.page-nav-icon.td-icon-menu-right",
    detailPageTitleSelector: "h1.tdb-title-text",
    detailPageImageSelector: "img.entry-thumb.td-animation-stack-type0-2",
    detailPageContentSelector:
      "div.td_block_wrap.tdb_single_content.tdi_106.td-pb-border-top.td_block_template_1.td-post-content.tagdiv-type",
    articles: [],
  },
  {
    baseUrl: "https://whnynews.com/category/news/national/",
    templateName: "whnynews_national",
    personality: WRITER_PERSONALITY_TWO,
    basePageAnchorSelector: "a.td-image-wrap",
    basePagePaginationSelector: "i.page-nav-icon.td-icon-menu-right",
    detailPageTitleSelector: "h1.tdb-title-text",
    detailPageImageSelector: "img.entry-thumb.td-animation-stack-type0-2",
    detailPageContentSelector:
      "div.td_block_wrap.tdb_single_content.tdi_106.td-pb-border-top.td_block_template_1.td-post-content.tagdiv-type",
    articles: [],
  },
];

module.exports = {
  VIEWPORT_WIDTH,
  VIEWPORT_HEIGHT,
  SCREENSHOT_FILETYPE,
  MAX_NUMBER_OF_ARTICLES_PER_WEBSITE,
  HEADLINE_MAX_CHARACTERS,
  ALTERED_CONTENT_MAX_PARAGRAPHS,
  ORIGINAL_ARTICLE_CONTENT_FILENAME,
  ALTERED_ARTICLE_CONTENT_FILENAME,
  OLLAMA_MODEL,
  MODELFILE,
  WEBSITES,
};
