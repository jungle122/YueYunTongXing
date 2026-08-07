Page({
  data: {
    historyList: [],
    groupedHistory: [],
    recordCount: 0,
    dayCount: 0
  },
  onLoad() { this.loadHistory(); },
  onShow() { this.loadHistory(); },
  goBack() {
    var pages = getCurrentPages();
    if (pages && pages.length > 1) { wx.navigateBack(); }
    else { wx.switchTab({ url: "/pages/profile/profile" }); }
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
      item.themeClass = "history-" + item.type;
    });
    var grouped = {};
    var order = [];
    sorted.forEach(function(item) {
      var itemDate = new Date(item.timestamp);
      var dateKey = itemDate.toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = { date: self.formatDateLabel(itemDate), items: [] };
        order.push(dateKey);
      }
      grouped[dateKey].items.push(item);
    });
    var groupedHistory = order.map(function(dateKey) {
      var group = grouped[dateKey];
      group.count = group.items.length;
      return group;
    });
    this.setData({ historyList: sorted, groupedHistory: groupedHistory, recordCount: sorted.length, dayCount: groupedHistory.length });
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
  },
  formatDateLabel(date) {
    var today = new Date();
    var yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return "今天";
    if (date.toDateString() === yesterday.toDateString()) return "昨天";
    return date.toLocaleDateString("zh-CN", { month: "long", day: "numeric" });
  }
});
