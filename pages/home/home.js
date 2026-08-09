var userModule = require('../../utils/user.js');

Page({
  data: {
    alinImageSrc: "/static/ui/alin.png",
    hasRecentLearning: false,
    recentLearning: {
      type: "",
      title: "",
      itemId: "",
      metaText: "",
      targetUrl: "/pages/learn/learn"
    }
  },

  onLoad() {
    this.checkLogin();
    this.loadRecentLearning();
  },

  onShow() {
    this.checkLogin();
    this.loadRecentLearning();
  },

  checkLogin() {
    if (!userModule.isLoggedIn()) {
      wx.navigateTo({ url: '/pages/login/login' });
    }
  },

  loadRecentLearning() {
    try {
      const historyKey = userModule.isLoggedIn() ? userModule.getUserKey('learningHistory') : 'learningHistory';
      let storedHistory = wx.getStorageSync(historyKey);
      if (!storedHistory && historyKey !== 'learningHistory') {
        storedHistory = wx.getStorageSync('learningHistory');
      }
      storedHistory = storedHistory || "[]";
      const history = Array.isArray(storedHistory) ? storedHistory : JSON.parse(storedHistory);
      const validHistory = history
        .filter(function(item) {
          return item && item.title && item.timestamp && !Number.isNaN(new Date(item.timestamp).getTime());
        })
        .sort(function(a, b) {
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });

      if (!validHistory.length) {
        this.setData({ hasRecentLearning: false });
        return;
      }

      const latest = validHistory[0];
      const typeConfig = this.getLearningTypeConfig(latest.type);
      const durationText = this.formatDuration(latest.duration);
      const timeText = this.formatRelativeTime(latest.timestamp);
      const metaParts = [typeConfig.label];

      if (durationText) metaParts.push(durationText);
      if (timeText) metaParts.push(timeText);

      this.setData({
        hasRecentLearning: true,
        recentLearning: {
          type: latest.type || "",
          title: latest.title,
          itemId: latest.itemId || "",
          metaText: metaParts.join(" · "),
          targetUrl: typeConfig.targetUrl
        }
      });
    } catch (error) {
      console.error("读取最近学习失败:", error);
      this.setData({ hasRecentLearning: false });
    }
  },

  getLearningTypeConfig(type) {
    const configMap = {
      audio: { label: "童谣音频", targetUrl: "/pages/audio-learning/audio-learning" },
      article: { label: "文化科普", targetUrl: "/pages/text-science/text-science" },
      video: { label: "原创视频", targetUrl: "/pages/video-learning/video-learning" },
      game: { label: "游戏练习", targetUrl: "/pages/games/games" }
    };
    return configMap[type] || { label: "粤语学习", targetUrl: "/pages/learn/learn" };
  },

  formatDuration(seconds) {
    const duration = Number(seconds) || 0;
    if (duration < 60) return "";
    return "学习" + Math.floor(duration / 60) + "分钟";
  },

  formatRelativeTime(timestamp) {
    const elapsed = Date.now() - new Date(timestamp).getTime();
    if (elapsed < 0) return "刚刚";

    const minutes = Math.floor(elapsed / 60000);
    const hours = Math.floor(elapsed / 3600000);
    const days = Math.floor(elapsed / 86400000);

    if (minutes < 1) return "刚刚";
    if (minutes < 60) return minutes + "分钟前";
    if (hours < 24) return hours + "小时前";
    if (days === 1) return "昨天";
    if (days < 7) return days + "天前";

    const date = new Date(timestamp);
    return (date.getMonth() + 1) + "月" + date.getDate() + "日";
  },

  handleRecentLearning() {
    if (!this.data.hasRecentLearning) {
      wx.switchTab({ url: "/pages/learn/learn" });
      return;
    }

    const recent = this.data.recentLearning;
    const query = recent.itemId ? "?itemId=" + encodeURIComponent(recent.itemId) : "";

    if (recent.targetUrl === "/pages/learn/learn" || recent.targetUrl === "/pages/games/games") {
      wx.switchTab({ url: recent.targetUrl });
      return;
    }

    wx.navigateTo({ url: recent.targetUrl + query });
  },

  navigateToModule(event) {
    const url = event.currentTarget.dataset.url;
    if (url) wx.switchTab({ url: url });
  },

  goToCommunity() {
    wx.navigateTo({ url: "/pages/community/community" });
  }
});
