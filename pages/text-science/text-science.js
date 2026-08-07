var articleCatalog = require("./article-catalog.js");

Page({
  data: {
    featuredArticle: null,
    articles: []
  },

  onLoad(options) {
    this.pendingArticleId = options && options.itemId ? decodeURIComponent(options.itemId) : "";
    this.refreshArticles();
  },

  onShow() {
    this.refreshArticles();
    if (this.pendingArticleId) {
      var articleId = this.pendingArticleId;
      this.pendingArticleId = "";
      this.openArticleById(articleId);
    }
  },

  refreshArticles() {
    var collections = wx.getStorageSync("text_science_collections") || {};
    var progressMap = wx.getStorageSync("text_science_read_progress") || {};
    var articles = articleCatalog.getArticles().map(function(article) {
      var progress = Math.max(0, Math.min(100, Number(progressMap[article.id]) || 0));
      article.progress = progress;
      article.progressStyle = "width:" + progress + "%";
      article.statusText = progress >= 100 ? "已读完" : (progress > 0 ? "继续阅读 " + progress + "%" : "尚未阅读");
      article.isCollected = !!collections[article.id];
      return article;
    });
    this.setData({
      featuredArticle: articles[0] || null,
      articles: articles.slice(1)
    });
  },

  openArticle(event) {
    this.openArticleById(event.currentTarget.dataset.id);
  },

  openArticleById(id) {
    if (!id || !articleCatalog.getArticleById(id)) return;
    wx.navigateTo({
      url: "/pages/article-reader/article-reader?itemId=" + encodeURIComponent(id)
    });
  }
});
