Page({
  data: {
    isPageEntering: false,
    isLoggedIn: false,
    userNickname: "",
    userAvatar: "",
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
  checkLoginStatus() {
    const nickname = wx.getStorageSync("userNickname");
    const avatar = wx.getStorageSync("userAvatar");
    const selectedAvatar = wx.getStorageSync("selectedAvatar");
    if (nickname || selectedAvatar) {
      this.setData({ isLoggedIn: true, userNickname: nickname || "用户" });
      if (selectedAvatar) {
        const avatarMap = {
          "1": "https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/Avatars/Avatar1.png",
          "2": "https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/Avatars/Avatar2.png",
          "3": "https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/Avatars/Avatar3.png"
        };
        this.setData({ userAvatar: avatarMap[String(selectedAvatar)] || "" });
      } else {
        this.setData({ userAvatar: avatar || "" });
      }
    } else {
      this.setData({ isLoggedIn: false, userNickname: "", userAvatar: "" });
    }
  },
  loadStats() {
    const history = wx.getStorageSync("learningHistory") || "[]";
    const historyList = JSON.parse(history);
    const learningDaysSet = new Set();
    historyList.forEach((item) => {
      const date = new Date(item.timestamp).toDateString();
      learningDaysSet.add(date);
    });
    const favoriteGroups = ["audio_likes", "video_favorites", "text_science_collections", "picture_book_favorites"];
    let favoriteCount = favoriteGroups.reduce((total, storageKey) => {
      const group = wx.getStorageSync(storageKey) || {};
      return total + Object.keys(group).filter((key) => !!group[key]).length;
    }, 0);
    const currentStreak = this.calculateStreak(historyList);
    this.setData({
      "stats.learningDays": learningDaysSet.size,
      "stats.favoriteCount": favoriteCount,
      "stats.currentStreak": currentStreak
    });
  },
  calculateStreak(historyList) {
    if (!historyList || historyList.length === 0) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dates = [].concat(Array.from(new Set(historyList.map(function(item) {
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
