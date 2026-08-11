var audioCatalog = require("../audio-learning/audio-catalog");
var articleCatalog = require("../text-science/article-catalog");
var userModule = require("../../utils/user.js");

Page({
  data: {
    isPageEntering: false,
    audioProgress: 0,
    audioProgressStyle: "width:0%",
    textProgress: 0,
    textProgressStyle: "width:0%"
  },
  onShow() {
    this.loadLearningProgress();
    this.playEntryAnimation();
  },
  loadLearningProgress() {
    var audioIds = audioCatalog.getSongs().map(function(song) { return song.id; });
    var articleIds = articleCatalog.getArticles().map(function(article) { return article.id; });
    var audioProgress = this.calculateCategoryProgress("audio_progress", audioIds);
    var textProgress = this.calculateCategoryProgress("text_science_read_progress", articleIds);

    this.setData({
      audioProgress: audioProgress,
      audioProgressStyle: "width:" + audioProgress + "%",
      textProgress: textProgress,
      textProgressStyle: "width:" + textProgress + "%"
    });
  },
  calculateCategoryProgress(storageKey, itemIds) {
    if (!itemIds.length) return 0;

    var progressMap = userModule.getUserStorage(storageKey, {});
    if (!progressMap || typeof progressMap !== "object" || Array.isArray(progressMap)) {
      progressMap = {};
    }

    var total = itemIds.reduce(function(sum, itemId) {
      var progress = Number(progressMap[itemId]);
      if (!Number.isFinite(progress)) progress = 0;
      return sum + Math.max(0, Math.min(100, progress));
    }, 0);
    return Math.round(total / itemIds.length);
  },
  playEntryAnimation() {
    this.setData({ isPageEntering: false }, () => {
      this.setData({ isPageEntering: true });
    });
  },
  goAudio() {
    wx.navigateTo({ url: "/pages/audio-learning/audio-learning" });
  },
  goText() {
    wx.navigateTo({ url: "/pages/text-science/text-science" });
  }
});
