var userModule = require('../../utils/user.js');

Page({
  data: {
    isPageEntering: false,
    isLoggedIn: false,
    userNickname: "",
    userAvatar: "",
    userAvatarType: "emoji",
    stats: {
      learningDays: 0,
      favoriteCount: 0,
      currentStreak: 0
    }
  },
  onLoad() {
    this.checkLoginStatus();
    this.loadStats();
  },
  onShow() {
    this.playEntryAnimation();
    this.checkLoginStatus();
    this.loadStats();
  },
  playEntryAnimation() {
    this.setData({ isPageEntering: false }, () => {
      this.setData({ isPageEntering: true });
    });
  },
  goToMyCollection() {
    wx.navigateTo({ url: "/pages/my-collection/my-collection" });
  },
  goToHistory() {
    wx.navigateTo({ url: "/pages/history/history" });
  },
  goToLearningStats() {
    wx.navigateTo({ url: "/pages/learning-stats/learning-stats" });
  },
  goToSettings() {
    wx.navigateTo({ url: "/pages/settings/settings" });
  },
  goToLogin() {
    wx.navigateTo({ url: "/pages/login/login" });
  },
  goToFeedback() {
    wx.navigateTo({ url: "/pages/feedback/feedback" });
  },
  checkLoginStatus() {
    var user = userModule.getCurrentUser();
    if (user) {
      this.setData({
        isLoggedIn: true,
        userNickname: user.nickname || "用户",
        userAvatar: user.avatar || "",
        userAvatarType: user.avatarType || "emoji"
      });
    } else {
      this.setData({ isLoggedIn: false, userNickname: "", userAvatar: "", userAvatarType: "emoji" });
    }
  },
  loadStats() {
    var historyKey = userModule.isLoggedIn() ? userModule.getUserKey('learningHistory') : 'learningHistory';
    var history = wx.getStorageSync(historyKey);
    if (!history && historyKey !== 'learningHistory') {
      history = wx.getStorageSync('learningHistory');
    }
    history = history || "[]";
    var historyList = typeof history === 'string' ? JSON.parse(history) : history;
    if (!Array.isArray(historyList)) historyList = [];

    var learningDaysSet = new Set();
    historyList.forEach(function(item) {
      if (item && item.timestamp) {
        var date = new Date(item.timestamp).toDateString();
        learningDaysSet.add(date);
      }
    });
    var favoriteGroups = ["audio_likes", "video_favorites", "text_science_collections", "picture_book_favorites"];
    var favCount = favoriteGroups.reduce(function(total, storageKey) {
      var group = wx.getStorageSync(storageKey) || {};
      return total + Object.keys(group).filter(function(key) { return !!group[key]; }).length;
    }, 0);
    var currentStreak = this.calculateStreak(historyList);
    this.setData({
      "stats.learningDays": learningDaysSet.size,
      "stats.favoriteCount": favCount,
      "stats.currentStreak": currentStreak
    });
  },
  calculateStreak(historyList) {
    if (!historyList || historyList.length === 0) return 0;
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var dates = [].concat(Array.from(new Set(historyList.filter(function(item) { return item && item.timestamp; }).map(function(item) {
      var d = new Date(item.timestamp);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    })))).sort(function(a, b) { return b - a; });
    var streak = 0;
    var currentDate = new Date(today);
    for (var idx = 0; idx < dates.length; idx++) {
      var dateTime = dates[idx];
      var historyDate = new Date(dateTime);
      var diffDays = Math.floor((currentDate - historyDate) / (1000 * 60 * 60 * 24));
      if (diffDays <= 1) {
        streak++;
        currentDate = historyDate;
      } else {
        break;
      }
    }
    return streak;
  },
  onAvatarError() {
    this.setData({ userAvatar: "" });
  }
});
