var userModule = require('../../utils/user.js');

Page({
  data: {
    checkinStreak: 0,
    totalCheckins: 0,
    todayCheckedIn: false,
    calendarDays: [],
    leaderboard: [],
    achievements: [
      { id: 'first_learn', name: '初学者', desc: '完成第一次学习', icon: '🌱', unlocked: false },
      { id: 'checkin_3', name: '三日坚持', desc: '连续打卡3天', icon: '🔥', unlocked: false },
      { id: 'checkin_7', name: '一周达人', desc: '连续打卡7天', icon: '⭐', unlocked: false },
      { id: 'checkin_30', name: '月度之星', desc: '连续打卡30天', icon: '🏆', unlocked: false },
      { id: 'study_60', name: '小时学者', desc: '累计学习60分钟', icon: '📚', unlocked: false },
      { id: 'study_300', name: '粤语大师', desc: '累计学习300分钟', icon: '👑', unlocked: false },
      { id: 'first_message', name: '社交达人', desc: '发送第一条留言', icon: '💬', unlocked: false },
      { id: 'collect_5', name: '收藏家', desc: '收藏5个内容', icon: '💎', unlocked: false }
    ],
    messages: [],
    newMessage: ''
  },

  onLoad: function() {
    this.checkLogin();
  },

  onShow: function() {
    this.checkLogin();
    this.loadCheckinData();
    this.loadLeaderboard();
    this.loadAchievements();
    this.loadMessages();
  },

  checkLogin: function() {
    if (!userModule.isLoggedIn()) {
      wx.showModal({
        title: '提示',
        content: '请先登录后再使用社区功能',
        showCancel: false,
        success: function() {
          wx.navigateTo({ url: '/pages/login/login' });
        }
      });
    }
  },

  // === 打卡功能 ===
  loadCheckinData: function() {
    var checkins = userModule.getUserStorage('checkins', []);
    var today = this.getTodayStr();
    var todayCheckedIn = checkins.indexOf(today) >= 0;
    var streak = this.calculateStreak(checkins);

    var calendarDays = this.generateCalendarDays(checkins);

    this.setData({
      totalCheckins: checkins.length,
      todayCheckedIn: todayCheckedIn,
      checkinStreak: streak,
      calendarDays: calendarDays
    });
  },

  handleCheckin: function() {
    if (this.data.todayCheckedIn) {
      wx.showToast({ title: '今天已打卡啦', icon: 'none' });
      return;
    }

    var today = this.getTodayStr();
    var checkins = userModule.getUserStorage('checkins', []);
    if (checkins.indexOf(today) < 0) {
      checkins.push(today);
    }
    userModule.setUserStorage('checkins', checkins);

    // 更新用户总打卡天数
    var user = userModule.getCurrentUser();
    if (user) {
      userModule.updateCurrentUser({ checkinDays: checkins.length });
    }

    wx.showToast({ title: '打卡成功！', icon: 'success' });
    this.loadCheckinData();
    this.loadAchievements();
  },

  calculateStreak: function(checkins) {
    if (!checkins || checkins.length === 0) return 0;
    var sorted = checkins.slice().sort().reverse();
    var today = this.getTodayStr();
    var yesterday = this.getYesterdayStr();

    if (sorted[0] !== today && sorted[0] !== yesterday) return 0;

    var streak = 1;
    for (var i = 1; i < sorted.length; i++) {
      var prev = new Date(sorted[i - 1]);
      var curr = new Date(sorted[i]);
      var diff = (prev - curr) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  },

  generateCalendarDays: function(checkins) {
    var days = [];
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth();
    var today = this.getTodayStr();

    // 显示最近7天
    for (var i = 6; i >= 0; i--) {
      var d = new Date(now);
      d.setDate(d.getDate() - i);
      var dateStr = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      days.push({
        date: dateStr,
        day: d.getDate(),
        checked: checkins.indexOf(dateStr) >= 0,
        today: dateStr === today
      });
    }
    return days;
  },

  // === 排行榜 ===
  loadLeaderboard: function() {
    var leaderboard = userModule.getLeaderboard();
    this.setData({ leaderboard: leaderboard.slice(0, 10) });
  },

  // === 成就系统 ===
  loadAchievements: function() {
    var user = userModule.getCurrentUser();
    if (!user) return;

    var checkins = userModule.getUserStorage('checkins', []);
    var streak = this.calculateStreak(checkins);
    var totalMinutes = user.totalStudyMinutes || 0;
    var messages = userModule.getUserStorage('messages_sent', 0);

    // 当前学习模块仍使用全局本地收藏键；接入云开发后再统一迁移为用户数据。
    var favoriteGroups = ['audio_likes', 'video_favorites', 'text_science_collections', 'picture_book_favorites'];
    var favCount = favoriteGroups.reduce(function(total, storageKey) {
      var group = wx.getStorageSync(storageKey) || {};
      return total + Object.keys(group).filter(function(key) { return !!group[key]; }).length;
    }, 0);

    var achievements = this.data.achievements.map(function(item) {
      var unlocked = false;
      switch (item.id) {
        case 'first_learn': unlocked = totalMinutes > 0 || checkins.length > 0; break;
        case 'checkin_3': unlocked = streak >= 3; break;
        case 'checkin_7': unlocked = streak >= 7; break;
        case 'checkin_30': unlocked = streak >= 30; break;
        case 'study_60': unlocked = totalMinutes >= 60; break;
        case 'study_300': unlocked = totalMinutes >= 300; break;
        case 'first_message': unlocked = messages > 0; break;
        case 'collect_5': unlocked = favCount >= 5; break;
      }
      return { id: item.id, name: item.name, desc: item.desc, icon: item.icon, unlocked: unlocked };
    });

    this.setData({ achievements: achievements });
  },

  // === 留言板 ===
  loadMessages: function() {
    var messages = userModule.getUserStorage('messages', []);
    var self = this;
    var processed = messages.map(function(msg) {
      return {
        id: msg.id,
        nickname: msg.nickname,
        avatar: msg.avatar,
        avatarType: msg.avatarType || 'emoji',
        text: msg.text,
        time: msg.time,
        timeText: self.formatTime(msg.time)
      };
    });
    this.setData({ messages: processed.reverse() });
  },

  onMessageInput: function(e) {
    this.setData({ newMessage: e.detail.value });
  },

  sendMessage: function() {
    var text = this.data.newMessage.trim();
    if (!text) {
      wx.showToast({ title: '请输入留言内容', icon: 'none' });
      return;
    }

    var user = userModule.getCurrentUser();
    if (!user) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }

    var messages = userModule.getUserStorage('messages', []);
    var newMsg = {
      id: Date.now().toString(),
      nickname: user.nickname,
      avatar: user.avatar,
      avatarType: user.avatarType || 'emoji',
      text: text,
      time: new Date().toISOString()
    };
    messages.push(newMsg);
    userModule.setUserStorage('messages', messages);

    // 更新发送消息计数
    var sentCount = userModule.getUserStorage('messages_sent', 0);
    userModule.setUserStorage('messages_sent', sentCount + 1);

    this.setData({ newMessage: '' });
    wx.showToast({ title: '发送成功', icon: 'success' });
    this.loadMessages();
    this.loadAchievements();
  },

  // === 工具方法 ===
  getTodayStr: function() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  },

  getYesterdayStr: function() {
    var d = new Date();
    d.setDate(d.getDate() - 1);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  },

  formatTime: function(timeStr) {
    var elapsed = Date.now() - new Date(timeStr).getTime();
    if (elapsed < 60000) return '刚刚';
    if (elapsed < 3600000) return Math.floor(elapsed / 60000) + '分钟前';
    if (elapsed < 86400000) return Math.floor(elapsed / 3600000) + '小时前';
    var d = new Date(timeStr);
    return (d.getMonth() + 1) + '/' + d.getDate();
  }
});
