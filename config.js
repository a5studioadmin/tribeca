const authors = require("./authors.json");
const VIEWPORT_WIDTH = 2560 * 1.3;
const VIEWPORT_HEIGHT = 1440 * 1.3;
const SCREENSHOT_FILETYPE = "png";
const HEADLINE_MAX_CHARACTERS = 75;
const ALTERED_CONTENT_MAX_PARAGRAPHS = 7;
const ORIGINAL_ARTICLE_CONTENT_FILENAME = "./data/articles_original.json";
const ALTERED_ARTICLE_CONTENT_FILENAME = "./data/articles_altered.json";
const DEFAULT_PAGE_TIMEOUT = 10 * 1000;
const NUMBER_OF_ARTICLES_PER_SOURCE = 1;
const SAVE_RAW_HTML = true;
const DEBUG = true;
const USE_PERSISTED_DATA = false;

const TAGS = ["HOME", "WEATHER", "SPORTS", "OPINIONS", "WATCH", "OBITUARIES"];

const AUTHORS = authors.map((name) => {
  return {
    name,
    image: "https://source.unsplash.com/random/300x300/?face",
  };
});

// Parent company with many compatible local news sites
// https://gray.tv/companies#ourmarkets

// Additional model configuration options
// https://github.com/ollama/ollama/blob/main/docs/modelfile.md#valid-parameters-and-values

const WRITER_PERSONALITY_REPUBLICAN =
  "You are a hardcore, right leaning republican that tries to advance their agenda through their news reporting";
const WRITER_PERSONALITY_DEMOCRAT =
  "You are a hardcore, right leaning democrat that tries to advance their agenda through their news reporting";

const SYSTEM_PROMPT = `You will be supplied text containing a specific writer personality in the first sentence, followed by the content of a random news article, and you are to re-write the article from the perspective of your beliefs, including an article title that you should add to the first sentence of your output. If you perceive the article as a national news story (as opposed to a local news story), you should more strongly emphasize your beliefs through your writing. To summarize, your output should be a newline-delimited string of text with the first sentence as an article title that you generated (which should be a short, one-sentence news headline length that has a max character length of ${HEADLINE_MAX_CHARACTERS}, and should not contain any asterisks or quotations), followed by the article the content you generated (which should be exactly ${ALTERED_CONTENT_MAX_PARAGRAPHS} paragraphs in length). You should respond with response only.`;
const OLLAMA_MODEL = "llama3:latest";

const MODELFILE = `
FROM ${OLLAMA_MODEL}
SYSTEM ${SYSTEM_PROMPT}
`;

const TEMPLATES = [
  {
    baseUrl:
      "https://whnynews.com/2024/04/14/interim-dec-commissioner-role-given-to-resident-of-colonie/",
    websiteName: "whnynews",
    elementsToClick: [
      "button.hu-notice-close.hu-btn.hu-btn-icon.hu-btn-transparent",
    ],
    elementsToDelete: ["#tdi_25"],
    elementsToHide: [
      "div.tdb-author-descr",
      "div.td_block_wrap.td_block_title.tdi_119.td-pb-border-top.td_block_template_5.td-fix-index",
      "div.td_block_wrap.td_flex_block_1.tdi_120.td-pb-border-top.td_block_template_1.td_flex_block",
      "div.td_block_wrap.td_flex_block_1.tdi_122.td-pb-border-top.td_block_template_1.td_flex_block",
      "#tdi_129",
      "#tdi_52",
      "div.tdm_block.td_block_wrap.tdm_block_icon.tdi_84.tdm-content-horiz-left.td-pb-border-top.td_block_template_1",
      "div.td_block_wrap.tdb_single_modified_date.tdi_86.td-pb-border-top.td_block_template_1.tdb-post-meta",
    ],
    templatePageDateSelector: "time.entry-date.updated.td-module-date",
    templatePageAuthorNameSelector: "a.tdb-author-name",
    templatePageAuthorImageSelectors: [
      "img.avatar.avatar-30.photo",
      "img.avatar.avatar-96.photo.td-animation-stack-type0-2",
    ],
    templatePageTitleSelector: "h1.tdb-title-text",
    templatePageImageSelector: "img.entry-thumb.td-animation-stack-type0-2",
    templatePageContentSelector: "div.td_block_wrap.tdb_single_content",
  },
  {
    baseUrl:
      "https://demo.tagdiv.com/newspaper_today_news_pro/2022/03/17/td-post-sydney-sweeneys-euphoria-mary-jane-pumps-are-surprisingly-still-in-stock/",
    websiteName: "news_week",
    elementsToHide: [
      "#tdi_21",
      "a.td-right-demos-button",
      "div.tdb-category.td-fix-index",
      "div.vc_column.tdi_132.wpb_column.vc_column_container.tdc-column.td-pb-span4.td-is-sticky",
      "div.td_block_wrap.tdb_breadcrumbs.tdi_111.td-pb-border-top.td_block_template_1.tdb-breadcrumbs",
      "div.vc_column.tdi_147.wpb_column.vc_column_container.tdc-column.td-pb-span4.td-is-sticky",
    ],
    templatePageDateSelector: "time.entry-date.updated.td-module-date",
    templatePageAuthorNameSelector: "a.tdb-author-name",
    templatePageAuthorImageSelectors: "",
    templatePageTitleSelector: "h2.tdb-title-text",
    templatePageImageSelector: "img.entry-thumb.td-animation-stack-type0-2",
    templatePageContentSelector: "div.td_block_wrap.tdb_single_content",
    templatePageTagSelector:
      "ul#menu-td-demo-header-menu-2 > li > a > div.tdb-menu-item-text",
  },
  {
    baseUrl:
      "https://demo.tagdiv.com/newspaper_week_pro/2021/09/29/td-post-a-look-at-how-social-media-mobile-gaming-can-increase-sales/",
    websiteName: "news_today",
    elementsToHide: [
      "a.td-right-demos-button",
      "a.tdb-entry-category",
      "div.td_block_wrap.td-a-rec.td-a-rec-id-custom-spot.td-a-rec-img.tdi_140.td_block_template_1",
      "div.tdm_block.td_block_wrap.tdm_block_inline_text.tdi_141.td-pb-border-top.td_block_template_1",
      "div.td_block_wrap.td_flex_block_1.tdi_142.td-pb-border-top.td_block_template_1.td_flex_block",
    ],
    templatePageDateSelector: "time.entry-date.updated.td-module-date",
    templatePageAuthorNameSelector: "a.tdb-author-name",
    templatePageAuthorImageSelectors: "",
    templatePageTitleSelector: "h1.tdb-title-text",
    templatePageImageSelector: "div.tdb-featured-image-bg",
    templatePageContentSelector: "div.td_block_wrap.tdb_single_content",
    templatePageTagSelector:
      "ul#menu-td-demo-header-menu-3 > li > a > div.tdb-menu-item-text",
  },
  {
    baseUrl:
      "https://demo.tagdiv.com/newspaper_downtown_pro/2022/03/08/td-post-customer-engagement-marketing-new-strategy-for-the-economy/",
    websiteName: "news_downtown_pro",
    elementsToHide: [
      "a.td-right-demos-button",
      "a.tdb-entry-category",
      "div.tdm_block.td_block_wrap.tdm_block_inline_text.tdi_159.td-pb-border-top.td_block_template_1",
      "div.td_block_wrap.td_flex_block_1.tdi_160.td-pb-border-top.td_block_template_1.td_flex_block",
      "div.td_block_wrap.td-a-rec.td-a-rec-id-custom-spot.td-a-rec-img.tdi_161.td_block_template_1",
      "div.vc_column.tdi_135.wpb_column.vc_column_container.tdc-column.td-pb-span3.td-is-sticky",
    ],
    elementsToDelete: [
      "#tdi_29",
      "a.td_spot_img_all",
      "div.td_block_wrap.tdb_breadcrumbs.tdi_116.td-pb-border-top.td_block_template_1.tdb-breadcrumbs",
      // "div.vc_column.tdi_135.wpb_column.vc_column_container.tdc-column.td-pb-span3.td-is-sticky",
      // "div.vc_column.tdi_149.wpb_column.vc_column_container.tdc-column.td-pb-span3.td-is-sticky",
      "div.vc_row_inner.tdi_151.vc_row.vc_inner.wpb_row.td-pb-row",
    ],
    templatePageDateSelector: "time.entry-date.updated.td-module-date",
    templatePageAuthorNameSelector: "a.tdb-author-name",
    templatePageAuthorImageSelectors: "",
    templatePageTitleSelector: "h1.tdb-title-text",
    templatePageImageSelector: "div.tdb-featured-image-bg",
    templatePageContentSelector: "div.td_block_wrap.tdb_single_content",
    templatePageTagSelector:
      "ul#menu-td-demo-header-menu-2 > li > a > div.tdb-menu-item-text",
  },
];

let WEBSITES = [
  {
    baseUrl: "https://www.wlns.com/news/local-news/",
    websiteName: "wlns_local",
    maxNumberOfArticles: NUMBER_OF_ARTICLES_PER_SOURCE,
    template: TEMPLATES[0],
    personality: WRITER_PERSONALITY_REPUBLICAN,
    basePageAnchorSelector: "a.article-list__article-link",
    basePagePaginationSelector: "button.article-list__load-more-cta__button",
    detailPageTitleSelector: "h1.article-title",
    detailPageImageSelector: "div.article-content figure img",
    detailPageContentSelector: "div.article-content.article-body",
    articles: [],
  },
  {
    baseUrl: "https://www.13abc.com/news/",
    websiteName: "whvg_local",
    maxNumberOfArticles: NUMBER_OF_ARTICLES_PER_SOURCE,
    template: TEMPLATES[1],
    personality: WRITER_PERSONALITY_REPUBLICAN,
    basePageAnchorSelector: "h4.headline > a.text-reset",
    basePagePaginationSelector: "div.load-more",
    detailPageTitleSelector: "h1.headline",
    // image selector doesn't always find image because of shadow root
    detailPageImageSelector: "img.img-fluid.mx-auto.d-block",
    detailPageContentSelector: "div.article-body",
    articles: [],
  },
  {
    baseUrl: "https://whnynews.com/category/news/national/",
    websiteName: "whnynews_national",
    maxNumberOfArticles: NUMBER_OF_ARTICLES_PER_SOURCE,
    template: TEMPLATES[2],
    personality: WRITER_PERSONALITY_DEMOCRAT,
    basePageAnchorSelector: "a.td-image-wrap",
    basePagePaginationSelector: "i.page-nav-icon.td-icon-menu-right",
    detailPageTitleSelector: "h1.tdb-title-text",
    detailPageImageSelector: "img.entry-thumb.td-animation-stack-type0-2",
    detailPageContentSelector: "div.td_block_wrap.tdb_single_content",
    articles: [],
  },
];

module.exports = {
  VIEWPORT_WIDTH,
  VIEWPORT_HEIGHT,
  SCREENSHOT_FILETYPE,
  HEADLINE_MAX_CHARACTERS,
  ALTERED_CONTENT_MAX_PARAGRAPHS,
  ORIGINAL_ARTICLE_CONTENT_FILENAME,
  ALTERED_ARTICLE_CONTENT_FILENAME,
  OLLAMA_MODEL,
  MODELFILE,
  WEBSITES,
  AUTHORS,
  TEMPLATES,
  DEFAULT_PAGE_TIMEOUT,
  SAVE_RAW_HTML,
  DEBUG,
  USE_PERSISTED_DATA,
  TAGS,
};
