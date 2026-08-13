var articleCatalog = require("./article-catalog.js");
var userModule = require("../../utils/user.js");

Page({
  data: {
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
    var collections = userModule.getUserStorage("text_science_collections", {});
    var progressMap = userModule.getUserStorage("text_science_read_progress", {});
    var articles = articleCatalog.getArticles().map(function(article) {
      var progress = Math.max(0, Math.min(100, Number(progressMap[article.id]) || 0));
      article.progress = progress;
      article.progressStyle = "width:" + progress + "%";
      article.statusText = progress >= 100 ? "已读完" : (progress > 0 ? "继续阅读 " + progress + "%" : "尚未阅读");
      article.isCollected = !!collections[article.id];
      return article;
    });
    this.setData({
      articles: articles
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
