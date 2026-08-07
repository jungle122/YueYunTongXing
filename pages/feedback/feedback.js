var userModule = require('../../utils/user.js');

Page({
  data: {
    feedbackTypes: [
      { value: 'suggestion', label: '建议', icon: '💡' },
      { value: 'bug', label: '问题', icon: '🐛' },
      { value: 'praise', label: '表扬', icon: '🌟' },
      { value: 'other', label: '其他', icon: '📌' }
    ],
    selectedType: 'suggestion',
    feedbackContent: '',
    contactInfo: '',
    feedbackList: []
  },

  onLoad: function() {
    this.checkLogin();
  },

  onShow: function() {
    this.checkLogin();
    this.loadFeedbackList();
  },

  checkLogin: function() {
    if (!userModule.isLoggedIn()) {
      wx.showModal({
        title: '提示',
        content: '请先登录后再提交反馈',
        showCancel: false,
        success: function() {
          wx.navigateTo({ url: '/pages/login/login' });
        }
      });
    }
  },

  selectType: function(e) {
    var value = e.currentTarget.dataset.value;
    this.setData({ selectedType: value });
  },

  onContentInput: function(e) {
    this.setData({ feedbackContent: e.detail.value });
  },

  onContactInput: function(e) {
    this.setData({ contactInfo: e.detail.value });
  },

  submitFeedback: function() {
    var content = this.data.feedbackContent.trim();
    if (!content) {
      wx.showToast({ title: '请输入反馈内容', icon: 'none' });
      return;
    }

    var user = userModule.getCurrentUser();
    if (!user) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }

    var feedbackList = userModule.getUserStorage('feedbacks', []);

    var typeLabel = '';
    for (var i = 0; i < this.data.feedbackTypes.length; i++) {
      if (this.data.feedbackTypes[i].value === this.data.selectedType) {
        typeLabel = this.data.feedbackTypes[i].icon + ' ' + this.data.feedbackTypes[i].label;
        break;
      }
    }

    var newFeedback = {
      id: Date.now().toString(),
      userId: user.userId,
      nickname: user.nickname,
      type: this.data.selectedType,
      typeLabel: typeLabel,
      content: content,
      contact: this.data.contactInfo,
      time: new Date().toISOString(),
      status: 'pending',
      statusText: '待处理',
      reply: ''
    };

    feedbackList.push(newFeedback);
    userModule.setUserStorage('feedbacks', feedbackList);

    this.setData({
      feedbackContent: '',
      contactInfo: '',
      selectedType: 'suggestion'
    });

    wx.showToast({ title: '提交成功，感谢反馈！', icon: 'success', duration: 2000 });
    this.loadFeedbackList();
  },

  loadFeedbackList: function() {
    var feedbackList = userModule.getUserStorage('feedbacks', []);
    var self = this;

    var processed = feedbackList.map(function(item) {
      return {
        id: item.id,
        type: item.type,
        typeLabel: item.typeLabel,
        content: item.content,
        time: item.time,
        timeText: self.formatTime(item.time),
        status: item.status,
        statusText: item.statusText || '待处理',
        reply: item.reply || ''
      };
    }).reverse();

    this.setData({ feedbackList: processed });
  },

  formatTime: function(timeStr) {
    var d = new Date(timeStr);
    var now = new Date();
    var elapsed = now - d;

    if (elapsed < 60000) return '刚刚';
    if (elapsed < 3600000) return Math.floor(elapsed / 60000) + '分钟前';
    if (elapsed < 86400000) return Math.floor(elapsed / 3600000) + '小时前';

    var month = d.getMonth() + 1;
    var day = d.getDate();

    if (d.getFullYear() === now.getFullYear()) {
      return month + '月' + day + '日';
    }
    return d.getFullYear() + '年' + month + '月' + day + '日';
  }
});
