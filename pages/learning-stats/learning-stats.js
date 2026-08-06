Page({
  data: {
    stats: {
      totalHours: 0,
      totalLearningDays: 0,
      currentStreak: 0,
      totalFavorites: 0,
      categoryStats: {
        audio: { count: 0, minutes: 0 },
        video: { count: 0, minutes: 0 },
        article: { count: 0, minutes: 0 }
      }
    }
  },
  onLoad() { this.calculateStats(); },
  onShow() { this.calculateStats(); },
  goBack() {
    var pages = getCurrentPages();
    if (pages && pages.length > 1) { wx.navigateBack(); }
    else { wx.reLaunch({ url: "/pages/home/home" }); }
  },
  calculateStats() {
    var historyStr = wx.getStorageSync("learningHistory") || "[]";
    var history = JSON.parse(historyStr);
    var totalSeconds = history.reduce(function(total, item) { return total + (item.duration || 0); }, 0);
    var totalHours = Math.floor(totalSeconds / 3600);
    var learningDaysSet = {};
    history.forEach(function(item) {
      var date = new Date(item.timestamp).toDateString();
      learningDaysSet[date] = true;
    });
    var totalLearningDays = Object.keys(learningDaysSet).length;
    var currentStreak = this.calculateStreak(history);
    var favoriteCount = 0;
    for (var i = 1; i <= 22; i++) { if (wx.getStorageSync("favorite_audio_" + i) === "true") favoriteCount++; }
    for (var j = 1; j <= 10; j++) { if (wx.getStorageSync("favorite_video_video" + j) === "true") favoriteCount++; }
    var catStats = { audio: { count: 0, totalTime: 0 }, video: { count: 0, totalTime: 0 }, article: { count: 0, totalTime: 0 } };
    history.forEach(function(item) {
      if (catStats[item.type]) { catStats[item.type].count++; catStats[item.type].totalTime += item.duration || 0; }
    });
    this.setData({
      "stats.totalHours": totalHours,
      "stats.totalLearningDays": totalLearningDays,
      "stats.currentStreak": currentStreak,
      "stats.totalFavorites": favoriteCount,
      "stats.categoryStats.audio.count": catStats.audio.count,
      "stats.categoryStats.audio.minutes": Math.floor(catStats.audio.totalTime / 60),
      "stats.categoryStats.video.count": catStats.video.count,
      "stats.categoryStats.video.minutes": Math.floor(catStats.video.totalTime / 60),
      "stats.categoryStats.article.count": catStats.article.count,
      "stats.categoryStats.article.minutes": Math.floor(catStats.article.totalTime / 60)
    });
  },
  calculateStreak(historyList) {
    if (!historyList || historyList.length === 0) return 0;
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var dateSet = {};
    historyList.forEach(function(item) {
      var d = new Date(item.timestamp);
      d.setHours(0, 0, 0, 0);
      dateSet[d.getTime()] = true;
    });
    var dates = Object.keys(dateSet).map(Number).sort(function(a, b) { return b - a; });
    var streak = 0;
    var currentDate = new Date(today);
    for (var idx = 0; idx < dates.length; idx++) {
      var historyDate = new Date(dates[idx]);
      var diffDays = Math.floor((currentDate - historyDate) / (1000 * 60 * 60 * 24));
      if (diffDays <= 1) { streak++; currentDate = historyDate; }
      else { break; }
    }
    return streak;
  }
});
