const VIEWPORT_WIDTH = 2560 * 1.3;
const VIEWPORT_HEIGHT = 1440 * 1.3;
const WEBSITE_CONTENT_MAX_WIDTH = 1300;
const SCREENSHOT_FILETYPE = "png";
const HEADLINE_MAX_CHARACTERS = 75;
const ALTERED_CONTENT_MAX_PARAGRAPHS = 12;
const ORIGINAL_ARTICLE_CONTENT_FILENAME = "./data/articles_original.json";
const ALTERED_ARTICLE_CONTENT_FILENAME = "./data/articles_altered.json";
const DEFAULT_PAGE_TIMEOUT = 15 * 1000;
const NUMBER_OF_ARTICLES_PER_SOURCE = 100;
const REWRITE_MAX_AMOUNT_OF_ARTICLES = 10;
const SAVE_RAW_HTML = true;
const HEADLESS = false;
const LIMIT_WEBSITES = false;
const USE_PERSISTED_DATA = true;

const TAGS = ["HOME", "WEATHER", "SPORTS", "OPINIONS", "WATCH", "OBITUARIES"];

// Additional model configuration options
// https://github.com/ollama/ollama/blob/main/docs/modelfile.md#valid-parameters-and-values

const WRITER_PERSONALITY_REPUBLICAN =
  "You are a hardcore, right leaning republican that tries to advance their agenda through their news reporting";
const WRITER_PERSONALITY_DEMOCRAT =
  "You are a hardcore, left leaning democrat that tries to advance their agenda through their news reporting";
const WRITER_PERSONALITY_NEUTRAL =
  "You are a news reporter with politically neutral views";

const OLLAMA_MODEL = "llama3:latest";

const MODELFILE = `
FROM ${OLLAMA_MODEL}
`;

const TEMPLATES = [
  {
    baseUrl:
      "https://whnynews.com/2024/04/14/interim-dec-commissioner-role-given-to-resident-of-colonie/",
    elementsToClick: [
      "button.hu-notice-close.hu-btn.hu-btn-icon.hu-btn-transparent",
    ],
    elementsToDelete: [
      "#tdi_25",
      "div.vc_column.tdi_118.wpb_column.vc_column_container.tdc-column.td-pb-span4.td-is-sticky",
      "#tdi_35 > div > div.vc_column.tdi_38.td-flex-auto.wpb_column.vc_column_container.tdc-column.td-pb-span4 > div > div > div.tdi_39_rand_style.td-element-style > style",
    ],
    elementsToHide: [
      "div.tdb-author-box.td_block_wrap.tdb_single_author_box.tdi_115.tdb-content-vert-top.td-pb-border-top.td_block_template_1",
      "div.tdb-author-descr",
      "div.td_block_wrap.td_block_title.tdi_119.td-pb-border-top.td_block_template_5.td-fix-index",
      "div.td_block_wrap.td_flex_block_1.tdi_120.td-pb-border-top.td_block_template_1.td_flex_block",
      "div.td_block_wrap.td_flex_block_1.tdi_122.td-pb-border-top.td_block_template_1.td_flex_block",
      "#tdi_129",
      "#tdi_116",
      "#tdi_52",
      "div.tdm_block.td_block_wrap.tdm_block_icon.tdi_84.tdm-content-horiz-left.td-pb-border-top.td_block_template_1",
      "div.td_block_wrap.tdb_single_modified_date.tdi_86.td-pb-border-top.td_block_template_1.tdb-post-meta",
    ],
    classNamesToRewrite: [
      {
        selector:
          "div.vc_column.tdi_103.wpb_column.vc_column_container.tdc-column.td-pb-span8",
        className:
          "vc_column wpb_column vc_column_container tdc-column td-pb-span12",
      },
    ],
    colorsToOverwrite: ["a.tdb-author-name", "div.tdb-menu-item-text"],
    backgroundColorsToOverwrite: ["div.tdi_39_rand_style.td-element-style"],
    templatePageDateSelector: "time.entry-date.updated.td-module-date",
    templatePageAuthorNameSelector: "a.tdb-author-name",
    templatePageAuthorImageSelectors: [
      "img.avatar.avatar-30.photo",
      "img.avatar.avatar-96.photo.td-animation-stack-type0-2",
    ],
    templatePageTitleSelector: "h1.tdb-title-text",
    templatePageImageSelector: "img.entry-thumb.td-animation-stack-type0-2",
    templatePageContentSelector: "div.td_block_wrap.tdb_single_content",
    templatePageShortNameSelector:
      "div.tdb-block-inner.td-fix-index > a.tdb-logo-a > span.tdb-logo-text-wrap > span.tdb-logo-text-title",
    templatePageNameSelector:
      "div.tdb-block-inner.td-fix-index > a.tdb-logo-a > span.tdb-logo-text-wrap > span.tdb-logo-text-tagline",
  },
  {
    baseUrl:
      "https://demo.tagdiv.com/newspaper_today_news_pro/2022/03/17/td-post-sydney-sweeneys-euphoria-mary-jane-pumps-are-surprisingly-still-in-stock/",
    elementsToHide: [
      "a.td-right-demos-button",
      "div.tdb-category.td-fix-index",
      "div.vc_column.tdi_132.wpb_column.vc_column_container.tdc-column.td-pb-span4.td-is-sticky",
      "div.td_block_wrap.tdb_breadcrumbs.tdi_111.td-pb-border-top.td_block_template_1.tdb-breadcrumbs",
    ],
    elementsToDelete: [
      "#tdi_16",
      "#tdi_21",
      "div.vc_column.tdi_147.wpb_column.vc_column_container.tdc-column.td-pb-span4.td-is-sticky",
      "div.vc_column.tdi_132.wpb_column.vc_column_container.tdc-column.td-pb-span4.td-is-sticky",
    ],
    classNamesToRewrite: [
      {
        selector:
          "div.vc_column.tdi_129.wpb_column.vc_column_container.tdc-column.td-pb-span8",
        className:
          "vc_column tdi_129 wpb_column vc_column_container tdc-column td-pb-span12",
      },
      {
        selector:
          "div.vc_column.tdi_141.wpb_column.vc_column_container.tdc-column.td-pb-span8",
        className:
          "div.vc_column.tdi_141.wpb_column.vc_column_container.tdc-column.td-pb-span12",
      },
    ],
    selectorStyles: [
      {
        selector:
          "div.td_block_wrap.tdb_single_content.tdi_142.td-pb-border-top.td_block_template_1.td-post-content.tagdiv-type",
        styles: {
          "font-size": "18px",
        },
      },
      {
        selector: "div.td-container,div.tdc-row,div.tdc-row-composer",
        styles: {
          width: `${WEBSITE_CONTENT_MAX_WIDTH}px`,
          maxWidth: `${WEBSITE_CONTENT_MAX_WIDTH}px`,
        },
      },
    ],
    templatePageDateSelector: "time.entry-date.updated.td-module-date",
    templatePageAuthorNameSelector: "a.tdb-author-name",
    templatePageAuthorImageSelectors: "",
    templatePageTitleSelector: "h2.tdb-title-text",
    templatePageImageSelector: "img.entry-thumb.td-animation-stack-type0-2",
    templatePageContentSelector: "div.td_block_wrap.tdb_single_content",
    templatePageTagSelector:
      "ul#menu-td-demo-header-menu-2 > li > a > div.tdb-menu-item-text",
    templatePagePrimaryColorSelector: "--today-news-accent",
    templatePageNameSelector: "#tdi_34 span.tdb-logo-text-title",
  },
  {
    baseUrl:
      "https://demo.tagdiv.com/newspaper_week_pro/2021/09/29/td-post-a-look-at-how-social-media-mobile-gaming-can-increase-sales/",
    elementsToHide: [
      "a.td-right-demos-button",
      "a.tdb-entry-category",
      "div.td_block_wrap.tdb_single_next_prev.tdi_128.td-animation-stack.td-pb-border-top.td_block_template_1",
      "div.td_block_wrap.tdb_single_tags.tdi_127.td-pb-border-top.td_block_template_1",
      "div.td_block_wrap.td-a-rec.td-a-rec-id-custom-spot.td-a-rec-img.tdi_140.td_block_template_1",
      "div.tdm_block.td_block_wrap.tdm_block_inline_text.tdi_141.td-pb-border-top.td_block_template_1",
      "div.td_block_wrap.td_flex_block_1.tdi_142.td-pb-border-top.td_block_template_1.td_flex_block",
    ],
    elementsToDelete: [
      "div.tdm_block.td_block_wrap.td_block_wrap.tdm_block_popup.tdi_33.td-pb-border-top.td_block_template_1 div.tds-button.td-fix-index",
      "div.td_block_wrap.tds_menu_login.tdi_58.td_block_template_1",
      "span.tdb-logo-text-tagline",
    ],
    backgroundColorsToOverwrite: [
      ".tds-button1,.td-social-but-icon.tdi_60,.td-social-but-icon,.tds-submit-btn",
    ],
    colorsToOverwrite: [
      "#tdi_29 span.tdb-logo-text-title",
      "span.tds-check-title > a",
    ],
    templatePageDateSelector: "time.entry-date.updated.td-module-date",
    templatePageAuthorNameSelector: "a.tdb-author-name",
    templatePageAuthorImageSelectors: "",
    templatePageTitleSelector: "h1.tdb-title-text",
    templatePageImageSelector: "div.tdb-featured-image-bg",
    templatePageContentSelector: "div.td_block_wrap.tdb_single_content",
    templatePageTagSelector:
      "ul#menu-td-demo-header-menu-3 > li > a > div.tdb-menu-item-text",
    templatePageNameSelector: "#tdi_29 span.tdb-logo-text-title",
  },
  {
    baseUrl:
      "https://demo.tagdiv.com/newspaper_downtown_pro/2022/03/08/td-post-customer-engagement-marketing-new-strategy-for-the-economy/",
    elementsToHide: [
      "a.td-right-demos-button",
      "a.tdb-entry-category",
      "div.tdm_block.td_block_wrap.tdm_block_inline_text.tdi_159.td-pb-border-top.td_block_template_1",
      "div.td_block_wrap.td_flex_block_1.tdi_160.td-pb-border-top.td_block_template_1.td_flex_block",
      "div.td_block_wrap.td-a-rec.td-a-rec-id-custom-spot.td-a-rec-img.tdi_161.td_block_template_1",
      "div.vc_column.tdi_135.wpb_column.vc_column_container.tdc-column.td-pb-span3.td-is-sticky",
      "div.tdb-author-box.td_block_wrap.tdb_single_author_box.tdi_147.tdb-content-vert-center.td-pb-border-top.td_block_template_1",
    ],
    elementsToDelete: [
      "#tdi_29",
      "span.tdb-logo-svg-wrap",
      "a.td_spot_img_all",
      "div.td_block_wrap.tdb_breadcrumbs.tdi_116.td-pb-border-top.td_block_template_1.tdb-breadcrumbs",
      "div.vc_column.tdi_135.wpb_column.vc_column_container.tdc-column.td-pb-span3.td-is-sticky",
      "div.vc_column.tdi_149.wpb_column.vc_column_container.tdc-column.td-pb-span3.td-is-sticky",
      "div.vc_row_inner.tdi_151.vc_row.vc_inner.wpb_row.td-pb-row",
      "#tdi_40 > div > div.tdi_40_rand_style.td-element-style > style",
    ],
    classNamesToRewrite: [
      {
        selector:
          "div.vc_column.tdi_143.wpb_column.vc_column_container.tdc-column.td-pb-span6",
        className: "vc_column wpb_column vc_column_container tdc-column",
      },
    ],
    selectorStyles: [
      {
        selector: "#tdi_127,#tdi_132,#tdi_162",
        style: {
          width: `${WEBSITE_CONTENT_MAX_WIDTH}px`,
          maxWidth: `${WEBSITE_CONTENT_MAX_WIDTH}px`,
        },
      },
    ],
    backgroundColorsToOverwrite: ["div.tdi_40_rand_style.td-element-style"],
    templatePageDateSelector: "time.entry-date.updated.td-module-date",
    templatePageAuthorNameSelector: "a.tdb-author-name",
    templatePageAuthorImageSelectors: "",
    templatePageTitleSelector: "h1.tdb-title-text",
    templatePageImageSelector: "div.tdb-featured-image-bg",
    templatePageContentSelector: "div.td_block_wrap.tdb_single_content",
    templatePagePrimaryColorSelector: "--downtown-menu-bg-light",
    templatePageTagSelector:
      "ul#menu-td-demo-header-menu-2 > li > a > div.tdb-menu-item-text",
    templatePageShortNameSelector: "#tdi_40 span.tdb-logo-text-title",
    templatePageNameSelector: "#tdi_40 span.tdb-logo-text-tagline",
  },
];

// Parent company with many compatible local news sites
// https://gray.tv/companies#ourmarkets
let WEBSITES = [
  {
    baseUrl: "https://whnynews.com/category/news/national/",
    websiteName: "Heart of New York",
    websiteShortName: "WHNY",
    state: "New York",
    nationalNewsSource: true,
    template: TEMPLATES[0],
    personality: WRITER_PERSONALITY_NEUTRAL,
    basePageAnchorSelector: "a.td-image-wrap",
    basePagePaginationSelector: "i.page-nav-icon.td-icon-menu-right",
    detailPageTitleSelector: "h1.tdb-title-text",
    detailPageImageSelector: "img.entry-thumb.td-animation-stack-type0-2",
    detailPageContentSelector: "div.td_block_wrap.tdb_single_content",
    primaryBrandColor: "#0F5FEB",
    articles: [],
  },
  {
    baseUrl: "https://www.atlantanewsfirst.com/news/",
    websiteName: "Heart of Atlanta News",
    websiteShortName: "WHAT",
    state: "Georgia",
    district: "GA-06",
    personality: WRITER_PERSONALITY_REPUBLICAN,
    template: TEMPLATES[0],
    basePageAnchorSelector: "h4.headline > a.text-reset",
    basePagePaginationSelector: "div.load-more",
    detailPageTitleSelector: "h1.headline",
    detailPageImageSelector: "img.img-fluid.mx-auto.d-block",
    detailPageContentSelector: "div.article-body",
    onlyReadTopLevelTagFromDetail: "P",
    primaryBrandColor: "#EE272C",
    articles: [],
  },
  {
    baseUrl: "https://www.nbcphiladelphia.com/news/local/",
    websiteName: "Heart of Philadelphia News",
    websiteShortName: "WHPH",
    state: "Pennsylvania",
    district: "PA-01",
    personality: WRITER_PERSONALITY_REPUBLICAN,
    template: TEMPLATES[1],
    basePageAnchorSelector: "a.story-card__title-link",
    basePagePaginationSelector:
      "footer.content-list-footer > a.content-list-button.button",
    detailPageTitleSelector: "h1.article-headline",
    detailPageImageSelector:
      "figure.article-featured-media > div.image-container > img",
    detailPageContentSelector: "div.article-content.rich-text",
    // only pull innerText of content from top-level tag specified, and ignore any
    // promotional content or anything else that is injected into the article content
    onlyReadTopLevelTagFromDetail: "P",
    primaryBrandColor: "#EB282D",
    articles: [],
  },
  {
    baseUrl: "https://www.azfamily.com/news/",
    websiteName: "Heart of Phoenix News",
    websiteShortName: "WHAZ",
    state: "Arizona",
    district: "AZ-01",
    personality: WRITER_PERSONALITY_REPUBLICAN,
    template: TEMPLATES[2],
    basePageAnchorSelector: "h4.headline > a.text-reset",
    basePagePaginationSelector: "div.load-more",
    detailPageTitleSelector: "h1.headline",
    detailPageImageSelector: "img.img-fluid.mx-auto.d-block",
    detailPageContentSelector: "div.article-body",
    primaryBrandColor: "#E9272C",
    articles: [],
  },
  {
    baseUrl: "https://www.wilx.com/news/",
    websiteName: "Heart of Lansing News",
    websiteShortName: "WHLN",
    state: "Michigan",
    district: "MI-08",
    personality: WRITER_PERSONALITY_REPUBLICAN,
    template: TEMPLATES[3],
    basePageAnchorSelector: "h4.headline > a.text-reset",
    basePagePaginationSelector: "div.load-more",
    detailPageTitleSelector: "h1.headline",
    detailPageImageSelector: "img.img-fluid.mx-auto.d-block",
    detailPageContentSelector: "div.article-body",
    primaryBrandColor: "#AF292B",
    articles: [],
  },
  {
    baseUrl: "https://www.fox5vegas.com/news/",
    websiteName: "Heart of Vegas News",
    websiteShortName: "WHVG",
    state: "Vegas",
    district: "NV-03, NV-04",
    personality: WRITER_PERSONALITY_DEMOCRAT,
    template: TEMPLATES[0],
    basePageAnchorSelector: "h4.headline > a.text-reset",
    basePagePaginationSelector: "div.load-more",
    detailPageTitleSelector: "h1.headline",
    detailPageImageSelector: "img.img-fluid.mx-auto.d-block",
    detailPageContentSelector: "div.article-body",
    primaryBrandColor: "#0F5FEB",
    articles: [],
  },
  {
    baseUrl: "https://www.wabi.tv/news/",
    websiteName: "Heart of Maine News",
    websiteShortName: "WHME",
    newsFrom: "Bangor Maine",
    state: "Maine",
    district: "ME-02",
    personality: WRITER_PERSONALITY_DEMOCRAT,
    template: TEMPLATES[1],
    basePageAnchorSelector: "h4.headline > a.text-reset",
    basePagePaginationSelector: "div.load-more",
    detailPageTitleSelector: "h1.headline",
    detailPageImageSelector: "img.img-fluid.mx-auto.d-block",
    detailPageContentSelector: "div.article-body",
    primaryBrandColor: "#0C257A",
    articles: [],
  },
  {
    baseUrl: "https://www.wflx.com/news/",
    websiteName: "Heart of Miami News",
    websiteShortName: "WHFL",
    state: "Florida",
    district: "FL-27",
    personality: WRITER_PERSONALITY_DEMOCRAT,
    template: TEMPLATES[2],
    basePageAnchorSelector: "h4.headline > a.text-reset",
    basePagePaginationSelector: "div.load-more",
    detailPageTitleSelector: "h1.headline",
    detailPageImageSelector: "img.img-fluid.mx-auto.d-block",
    detailPageContentSelector: "div.article-body",
    primaryBrandColor: "#1B3588",
    articles: [],
  },
  {
    baseUrl: "https://www.wmtv15news.com/news/",
    websiteName: "Heart of Wisconsin News",
    websiteShortName: "WHWI",
    newsFrom: "La Crosse, Eau Claire, and Platteville",
    state: "Wisconsin",
    district: "WI-03",
    personality: WRITER_PERSONALITY_DEMOCRAT,
    template: TEMPLATES[3],
    basePageAnchorSelector: "h4.headline > a.text-reset",
    basePagePaginationSelector: "div.load-more",
    detailPageTitleSelector: "h1.headline",
    detailPageImageSelector: "img.img-fluid.mx-auto.d-block",
    detailPageContentSelector: "div.article-body",
    primaryBrandColor: "#1C13BF",
    articles: [],
  },
]
  .map((site, index) => {
    // for debug purposes
    if (LIMIT_WEBSITES && index > 0) {
      return null;
    }
    // if a specific website needs to scrap more articles than another
    // (if scraping is more error prone), maxNumberOfArticles can be defined
    // in the website config. otherwise, NUMBER_OF_ARTICLES_PER_SOURCE will be the default
    return {
      maxNumberOfArticles: NUMBER_OF_ARTICLES_PER_SOURCE,
      ...site,
    };
  })
  .filter((x) => x);

function setWebsites(persistedData) {
  WEBSITES = persistedData;
}

function getWebsites() {
  return WEBSITES;
}

export {
  VIEWPORT_WIDTH,
  VIEWPORT_HEIGHT,
  SCREENSHOT_FILETYPE,
  HEADLINE_MAX_CHARACTERS,
  ALTERED_CONTENT_MAX_PARAGRAPHS,
  ORIGINAL_ARTICLE_CONTENT_FILENAME,
  ALTERED_ARTICLE_CONTENT_FILENAME,
  OLLAMA_MODEL,
  MODELFILE,
  TEMPLATES,
  DEFAULT_PAGE_TIMEOUT,
  SAVE_RAW_HTML,
  HEADLESS,
  USE_PERSISTED_DATA,
  REWRITE_MAX_AMOUNT_OF_ARTICLES,
  TAGS,
  getWebsites,
  setWebsites,
};
