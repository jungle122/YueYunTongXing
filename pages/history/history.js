Page({
  data: {
    historyList: [],
    groupedHistory: []
  },
  onLoad() { this.loadHistory(); },
  onShow() { this.loadHistory(); },
  goBack() {
    var pages = getCurrentPages();
    if (pages && pages.length > 1) { wx.navigateBack(); }
    else { wx.reLaunch({ url: "/pages/home/home" }); }
  },
  loadHistory() {
    var self = this;
    var historyStr = wx.getStorageSync("learningHistory") || "[]";
    var history = JSON.parse(historyStr);
    var sorted = history.sort(function(a, b) { return new Date(b.timestamp) - new Date(a.timestamp); });
    sorted.forEach(function(item) {
      item.icon = self.getItemIcon(item.type);
      item.typeName = self.getItemTypeName(item.type);
      item.durationText = self.formatDuration(item.duration);
      item.timeText = self.formatTime(item.timestamp);
    });
    var grouped = {};
    var order = [];
    sorted.forEach(function(item) {
      var date = new Date(item.timestamp).toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" });
      if (!grouped[date]) { grouped[date] = []; order.push(date); }
      grouped[date].push(item);
    });
    var groupedHistory = order.map(function(date) { return { date: date, items: grouped[date] }; });
    this.setData({ historyList: sorted, groupedHistory: groupedHistory });
  },
  getItemIcon(type) { return { audio: "🎵", video: "🎬", article: "📖", game: "🎮" }[type] || "📄"; },
  getItemTypeName(type) { return { audio: "音频学习", video: "视频学习", article: "文章阅读", game: "游戏练习" }[type] || "未知"; },
  formatDuration(seconds) {
    if (!seconds || seconds === 0) return "已学习";
    var minutes = Math.floor(seconds / 60);
    if (minutes === 0) return "少于1分钟";
    return minutes + "分钟";
  },
  formatTime(timestamp) {
    var date = new Date(timestamp);
    return date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
  }
});
