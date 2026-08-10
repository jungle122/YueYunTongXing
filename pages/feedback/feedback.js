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
    feedbackList: [],
    legacyFeedbackList: [],
    isSubmitting: false,
    isLoading: false,
    loadError: ''
  },

  onShow: function() {
    if (this.checkLogin()) {
      this.loadFeedbackList();
    } else {
      this.setData({
        feedbackList: [],
        legacyFeedbackList: [],
        isLoading: false,
        loadError: ''
      });
    }
  },

  checkLogin: function() {
    if (userModule.isLoggedIn()) return true;

    if (this.loginPromptVisible) return false;
    this.loginPromptVisible = true;

    var self = this;
    wx.showModal({
      title: '提示',
      content: '请先登录后再提交反馈',
      showCancel: false,
      success: function() {
        wx.navigateTo({ url: '/pages/login/login' });
      },
      complete: function() {
        self.loginPromptVisible = false;
      }
    });

    return false;
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

  submitFeedback: async function() {
    if (this.data.isSubmitting) return;

    var content = this.data.feedbackContent.trim();
    var contact = this.data.contactInfo.trim();

    if (!content) {
      wx.showToast({ title: '请输入反馈内容', icon: 'none' });
      return;
    }
    if (content.length > 500) {
      wx.showToast({ title: '反馈内容不能超过500字', icon: 'none' });
      return;
    }
    if (contact.length > 100) {
      wx.showToast({ title: '联系方式不能超过100字', icon: 'none' });
      return;
    }
    if (!userModule.getCurrentUser()) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }
    if (!wx.cloud) {
      wx.showToast({ title: '当前版本暂不支持云服务', icon: 'none', duration: 2500 });
      return;
    }

    this.setData({ isSubmitting: true });
    wx.showLoading({ title: '提交中', mask: true });

    var submitted = false;
    var submitErrorMessage = '';

    try {
      var response = await wx.cloud.callFunction({
        name: 'submitFeedback',
        data: {
          type: this.data.selectedType,
          content: content,
          contact: contact
        }
      });
      var result = response.result || {};

      if (!result.ok) {
        submitErrorMessage = result.message || '提交失败，请稍后再试';
      } else {
        this.setData({
          feedbackContent: '',
          contactInfo: '',
          selectedType: 'suggestion'
        });
        submitted = true;
      }
    } catch (error) {
      console.error('提交反馈失败:', error);
      submitErrorMessage = '云服务暂时不可用，请稍后再试';
    } finally {
      wx.hideLoading();
      this.setData({ isSubmitting: false });
    }

    if (submitErrorMessage) {
      wx.showModal({
        title: '提交失败',
        content: submitErrorMessage,
        showCancel: false
      });
      return;
    }

    if (submitted) {
      await this.loadFeedbackList(true);
      wx.showToast({ title: '提交成功，感谢反馈！', icon: 'success', duration: 2000 });
    }
  },

  loadFeedbackList: async function(silent) {
    var legacyFeedbackList = this.loadLegacyFeedbackList();

    this.setData({
      legacyFeedbackList: legacyFeedbackList,
      isLoading: !silent,
      loadError: ''
    });

    if (!wx.cloud) {
      this.setData({
        isLoading: false,
        loadError: '当前版本暂不支持云服务'
      });
      return false;
    }

    try {
      var response = await wx.cloud.callFunction({ name: 'listMyFeedback' });
      var result = response.result || {};

      if (!result.ok) {
        var serviceError = new Error(result.message || '加载反馈失败');
        serviceError.userMessage = result.message;
        throw serviceError;
      }

      this.setData({
        feedbackList: this.processCloudFeedbacks(result.feedbacks || []),
        loadError: ''
      });
      return true;
    } catch (error) {
      console.error('加载反馈失败:', error);
      var message = error.userMessage || '云服务暂时不可用，请稍后重试';
      this.setData({ loadError: message });

      if (!silent) {
        wx.showToast({ title: message, icon: 'none', duration: 2500 });
      }
      return false;
    } finally {
      this.setData({ isLoading: false });
    }
  },

  retryLoadFeedback: function() {
    this.loadFeedbackList();
  },

  processCloudFeedbacks: function(feedbacks) {
    var self = this;
    return feedbacks.map(function(item) {
      var status = ['new', 'processing', 'resolved'].indexOf(item.status) >= 0
        ? item.status
        : 'unknown';

      return {
        id: item.id,
        type: item.type,
        typeLabel: self.getTypeLabel(item.type),
        content: item.content,
        timeText: self.formatTime(item.createdAt),
        status: status,
        statusText: self.getStatusText(status),
        reply: item.reply || ''
      };
    });
  },

  loadLegacyFeedbackList: function() {
    var feedbackList = userModule.getUserStorage('feedbacks', []);
    var self = this;

    if (!Array.isArray(feedbackList)) return [];

    return feedbackList.map(function(item, index) {
      var status = item.status || 'pending';
      return {
        id: 'local_' + (item.id || index),
        type: item.type,
        typeLabel: item.typeLabel || self.getTypeLabel(item.type),
        content: item.content,
        timeText: self.formatTime(item.time),
        status: status,
        statusText: item.statusText || self.getStatusText(status),
        reply: item.reply || ''
      };
    }).reverse();
  },

  getTypeLabel: function(type) {
    for (var i = 0; i < this.data.feedbackTypes.length; i += 1) {
      var item = this.data.feedbackTypes[i];
      if (item.value === type) return item.icon + ' ' + item.label;
    }
    return '📌 其他';
  },

  getStatusText: function(status) {
    var statusMap = {
      'new': '待处理',
      'processing': '处理中',
      'resolved': '已解决',
      'pending': '待处理',
      'replied': '已回复',
      'unknown': '状态异常'
    };
    return statusMap[status] || '状态异常';
  },

  formatTime: function(value) {
    if (!value) return '时间未知';

    if (typeof value === 'object') {
      if (value.$date) value = value.$date;
      else if (value._seconds) value = value._seconds * 1000;
    }

    var d = new Date(value);
    if (isNaN(d.getTime())) return '时间未知';

    var now = new Date();
    var elapsed = now - d;

    if (elapsed >= 0 && elapsed < 60000) return '刚刚';
    if (elapsed >= 0 && elapsed < 3600000) return Math.floor(elapsed / 60000) + '分钟前';
    if (elapsed >= 0 && elapsed < 86400000) return Math.floor(elapsed / 3600000) + '小时前';

    var month = d.getMonth() + 1;
    var day = d.getDate();

    if (d.getFullYear() === now.getFullYear()) {
      return month + '月' + day + '日';
    }
    return d.getFullYear() + '年' + month + '月' + day + '日';
  }
});
