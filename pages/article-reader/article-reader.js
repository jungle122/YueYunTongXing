var articleCatalog = require("../text-science/article-catalog.js");
var userModule = require("../../utils/user.js");
var learningSyncModule = require("../../utils/learning-sync.js");

Page({
  data: {
    article: null,
    collected: false,
    progress: 0,
    progressStyle: "width:0%",
    viewportHeight: 0,
    showToast: false,
    toastText: ""
  },

  onLoad(options) {
    var articleId = options && options.itemId ? decodeURIComponent(options.itemId) : "cantonese-history";
    var article = articleCatalog.getArticleById(articleId) || articleCatalog.getArticles()[0];
    var collections = userModule.getUserStorage("text_science_collections", {});
    var progressMap = userModule.getUserStorage("text_science_read_progress", {});
    var progress = Math.max(10, Math.min(100, Number(progressMap[article.id]) || 0));
    var systemInfo = wx.getSystemInfoSync();

    this.setData({
      article: article,
      collected: !!collections[article.id],
      progress: progress,
      progressStyle: "width:" + progress + "%",
      viewportHeight: Number(systemInfo.windowHeight) || 0
    });
    this.persistProgress(progress);
    this.recordLearningHistory(article);
  },

  onReady() {
    this.detectNonScrollableArticle();
  },

  detectNonScrollableArticle() {
    var self = this;
    wx.createSelectorQuery()
      .select(".reader-scroll")
      .fields({ size: true, scrollOffset: true })
      .exec(function(results) {
        var scrollInfo = results && results[0];
        if (!scrollInfo || !self.data.article) return;
        var viewportHeight = Number(scrollInfo.height) || 0;
        var contentHeight = Number(scrollInfo.scrollHeight) || 0;
        if (viewportHeight > 0 && contentHeight > 0 && contentHeight <= viewportHeight + 1) {
          self.markArticleComplete();
        }
      });
  },

  onScroll(event) {
    if (!this.data.article) return;
    var detail = event.detail || {};
    var scrollHeight = Number(detail.scrollHeight) || 1;
    var visibleBottom = (Number(detail.scrollTop) || 0) + this.data.viewportHeight;
    var calculatedProgress = Math.max(10, Math.min(100, Math.round(visibleBottom / scrollHeight * 100)));
    var progress = Math.max(this.data.progress, calculatedProgress);
    if (progress < 100 && progress - this.data.progress < 2) return;
    if (progress === this.data.progress) return;
    this.setData({ progress: progress, progressStyle: "width:" + progress + "%" });
    this.persistProgress(progress);
    this.updateLearningHistory(progress);
  },

  onScrollToLower() {
    this.markArticleComplete();
  },

  markArticleComplete() {
    if (!this.data.article || this.data.progress >= 100) return;
    this.setData({ progress: 100, progressStyle: "width:100%" });
    this.persistProgress(100);
    this.updateLearningHistory(100);
  },

  toggleCollect() {
    if (!this.data.article) return;
    var collections = userModule.getUserStorage("text_science_collections", {});
    var nextCollected = !this.data.collected;
    collections[this.data.article.id] = nextCollected;
    userModule.setUserStorage("text_science_collections", collections);
    learningSyncModule.markDirty();
    this.setData({
      collected: nextCollected,
      showToast: true,
      toastText: nextCollected ? "已收藏这篇文章" : "已取消收藏"
    });
    var self = this;
    setTimeout(function() { self.setData({ showToast: false }); }, 1500);
  },

  persistProgress(progress) {
    if (!this.data.article) return;
    var progressMap = userModule.getUserStorage("text_science_read_progress", {});
    progressMap[this.data.article.id] = progress;
    userModule.setUserStorage("text_science_read_progress", progressMap);
    learningSyncModule.markDirty();
  },

  recordLearningHistory(article) {
    try {
      var history = userModule.getUserStorage("learningHistory", []);
      var today = new Date().toDateString();
      var existingIndex = -1;
      for (var i = 0; i < history.length; i++) {
        if (history[i].itemId === article.id && history[i].type === "article" && new Date(history[i].timestamp).toDateString() === today) {
          existingIndex = i;
          break;
        }
      }
      if (existingIndex >= 0) {
        history[existingIndex].timestamp = new Date().toISOString();
        history[existingIndex].duration = Math.floor(this.data.progress / 10) * 60;
      } else {
        history.push({ type: "article", title: article.title, itemId: article.id, timestamp: new Date().toISOString(), duration: Math.floor(this.data.progress / 10) * 60 });
      }
      if (history.length > 100) history.splice(0, history.length - 100);
      userModule.setUserStorage("learningHistory", history);
      learningSyncModule.markDirty();
    } catch (error) {
      console.error("记录文章学习历史失败:", error);
    }
  },

  updateLearningHistory(progress) {
    if (!this.data.article) return;
    try {
      var history = userModule.getUserStorage("learningHistory", []);
      for (var i = history.length - 1; i >= 0; i--) {
        if (history[i].itemId === this.data.article.id && history[i].type === "article") {
          history[i].duration = Math.floor(progress / 10) * 60;
          break;
        }
      }
      userModule.setUserStorage("learningHistory", history);
      learningSyncModule.markDirty();
    } catch (error) {
      console.error("更新文章学习历史失败:", error);
    }
  }
});
