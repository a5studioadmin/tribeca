const VIEWPORT_WIDTH = 2560;
const VIEWPORT_HEIGHT = 1440;
const SCREENSHOT_FILETYPE = "png";
const MAX_NUMBER_OF_ARTICLES_PER_WEBSITE = 2;
const HEADLINE_MAX_CHARACTERS = 75;
const ALTERED_CONTENT_MAX_PARAGRAPHS = 4;
const ORIGINAL_ARTICLE_CONTENT_FILENAME = "./data/articles_original.json";
const ALTERED_ARTICLE_CONTENT_FILENAME = "./data/articles_altered.json";

// https://github.com/ollama/ollama/blob/main/docs/modelfile.md#valid-parameters-and-values
const OLLAMA_MODEL = "llama3:latest";
const WRITER_PERSONALITY = "You are mario from super mario brothers.";
const SYSTEM_PROMPT = `You will be supplied the contents of a random news article and you are to re-write it from the perspective of your believes. If the article is a national news story (as opposed to a local news story), you should more strongly emphasize your beliefs through your writing. Your output should be a newline-delimited string of text with the first sentence as the article title, which should should be a short news headline length, with a max character length of ${HEADLINE_MAX_CHARACTERS} and no more than one sentence. The total length of all content returned should be limited to ${ALTERED_CONTENT_MAX_PARAGRAPHS} paragraphs.`;
const MODELFILE = `
FROM ${OLLAMA_MODEL}
SYSTEM ${WRITER_PERSONALITY} ${SYSTEM_PROMPT}
`;

const WEBSITES = [
  {
    baseUrl: "https://whnynews.com/category/news/local",
    templateName: "whnynews_local",
    basePageAnchorSelector: "a.td-image-wrap",
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
  WRITER_PERSONALITY,
  SYSTEM_PROMPT,
  MODELFILE,
  WEBSITES,
};
