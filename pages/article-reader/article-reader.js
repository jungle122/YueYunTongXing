var articleCatalog = require("../text-science/article-catalog.js");

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
    var collections = wx.getStorageSync("text_science_collections") || {};
    var progressMap = wx.getStorageSync("text_science_read_progress") || {};
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

  toggleCollect() {
    if (!this.data.article) return;
    var collections = wx.getStorageSync("text_science_collections") || {};
    var nextCollected = !this.data.collected;
    collections[this.data.article.id] = nextCollected;
    wx.setStorageSync("text_science_collections", collections);
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
    var progressMap = wx.getStorageSync("text_science_read_progress") || {};
    progressMap[this.data.article.id] = progress;
    wx.setStorageSync("text_science_read_progress", progressMap);
  },

  recordLearningHistory(article) {
    try {
      var historyValue = wx.getStorageSync("learningHistory") || "[]";
      var history = Array.isArray(historyValue) ? historyValue : JSON.parse(historyValue);
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
      wx.setStorageSync("learningHistory", JSON.stringify(history));
    } catch (error) {
      console.error("记录文章学习历史失败:", error);
    }
  },

  updateLearningHistory(progress) {
    if (!this.data.article) return;
    try {
      var historyValue = wx.getStorageSync("learningHistory") || "[]";
      var history = Array.isArray(historyValue) ? historyValue : JSON.parse(historyValue);
      for (var i = history.length - 1; i >= 0; i--) {
        if (history[i].itemId === this.data.article.id && history[i].type === "article") {
          history[i].duration = Math.floor(progress / 10) * 60;
          break;
        }
      }
      wx.setStorageSync("learningHistory", JSON.stringify(history));
    } catch (error) {
      console.error("更新文章学习历史失败:", error);
    }
  }
});
