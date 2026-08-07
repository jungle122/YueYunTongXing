var userModule = require('../../utils/user.js');

Page({
  data: {
    isLoggedIn: false,
    nickname: '',
    dailyReminder: true,
    difficultyLevels: ['入门', '初级', '中级', '高级'],
    difficultyIndex: 1,
    emojiAvatars: [
      { emoji: '🦊', name: '小狐狸', bg: 'linear-gradient(135deg, #FFB347, #FF8C42)' },
      { emoji: '🐱', name: '小猫咪', bg: 'linear-gradient(135deg, #87CEEB, #6BB5E0)' },
      { emoji: '🐶', name: '小狗狗', bg: 'linear-gradient(135deg, #98D8C8, #7BC8B5)' }
    ],
    selectedEmoji: -1,
    currentAvatar: '',
    avatarType: 'emoji',
    wechatAvatarUrl: ''
  },

  onLoad: function() {
    this.loadSettings();
  },

  loadSettings: function() {
    var user = userModule.getCurrentUser();
    var isLoggedIn = !!user;
    
    var nickname = user ? (user.nickname || '') : (wx.getStorageSync('userNickname') || '');
    var dailyReminder = wx.getStorageSync('dailyReminder');
    var difficulty = wx.getStorageSync('difficultyLevel') || '初级';
    var idx = this.data.difficultyLevels.indexOf(difficulty);
    if (idx === -1) idx = 1;

    var currentAvatar = '';
    var avatarType = 'emoji';
    var selectedEmoji = -1;
    var wechatAvatarUrl = '';

    if (user) {
      currentAvatar = user.avatar || '';
      avatarType = user.avatarType || 'emoji';
      if (avatarType === 'emoji') {
        for (var i = 0; i < this.data.emojiAvatars.length; i++) {
          if (this.data.emojiAvatars[i].emoji === currentAvatar) {
            selectedEmoji = i;
            break;
          }
        }
      } else if (avatarType === 'wechat') {
        wechatAvatarUrl = currentAvatar;
      }
    } else {
      // Legacy support
      var selectedAvatar = wx.getStorageSync('selectedAvatar');
      if (selectedAvatar) {
        var avatarMap = {
          '1': 'https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/Avatars/Avatar1.png',
          '2': 'https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/Avatars/Avatar2.png',
          '3': 'https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/Avatars/Avatar3.png'
        };
        currentAvatar = avatarMap[String(selectedAvatar)] || '';
        avatarType = 'image';
      }
    }

    this.setData({
      isLoggedIn: isLoggedIn,
      nickname: nickname,
      dailyReminder: dailyReminder !== false,
      difficultyIndex: idx,
      currentAvatar: currentAvatar,
      avatarType: avatarType,
      selectedEmoji: selectedEmoji,
      wechatAvatarUrl: wechatAvatarUrl
    });
  },

  selectEmoji: function(e) {
    var index = e.currentTarget.dataset.index;
    this.setData({
      selectedEmoji: index,
      currentAvatar: this.data.emojiAvatars[index].emoji,
      avatarType: 'emoji',
      wechatAvatarUrl: ''
    });
  },

  onChooseAvatar: function(e) {
    var avatarUrl = e.detail.avatarUrl;
    if (avatarUrl) {
      this.setData({
        wechatAvatarUrl: avatarUrl,
        currentAvatar: avatarUrl,
        avatarType: 'wechat',
        selectedEmoji: -1
      });
    }
  },

  onNicknameInput: function(e) {
    this.setData({ nickname: e.detail.value });
  },

  onReminderChange: function(e) {
    this.setData({ dailyReminder: e.detail.value });
  },

  onDifficultyChange: function(e) {
    this.setData({ difficultyIndex: e.detail.value });
  },

  saveSettings: function() {
    var nickname = this.data.nickname.trim();
    if (!nickname) {
      wx.showToast({ title: '请输入昵称', icon: 'none' });
      return;
    }

    // Update user module
    if (userModule.isLoggedIn()) {
      userModule.updateCurrentUser({
        nickname: nickname,
        avatar: this.data.currentAvatar,
        avatarType: this.data.avatarType
      });
    } else {
      // Register/update via user module
      userModule.register({
        nickname: nickname,
        avatar: this.data.currentAvatar,
        avatarType: this.data.avatarType
      });
    }

    // Save legacy storage keys for backward compatibility
    wx.setStorageSync('userNickname', nickname);
    wx.setStorageSync('dailyReminder', this.data.dailyReminder);
    wx.setStorageSync('difficultyLevel', this.data.difficultyLevels[this.data.difficultyIndex]);

    wx.showToast({ title: '设置已保存', icon: 'success', duration: 1500 });
    
    var self = this;
    setTimeout(function() {
      var pages = getCurrentPages();
      if (pages && pages.length > 1) {
        wx.navigateBack();
      } else {
        wx.switchTab({ url: '/pages/profile/profile' });
      }
    }, 1500);
  },

  handleLogout: function() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: function(res) {
        if (res.confirm) {
          userModule.logout();
          wx.showToast({ title: '已退出登录', icon: 'success' });
          setTimeout(function() {
            wx.navigateTo({ url: '/pages/login/login' });
          }, 1500);
        }
      }
    });
  },

  goBack: function() {
    var pages = getCurrentPages();
    if (pages && pages.length > 1) {
      wx.navigateBack();
    } else {
      wx.switchTab({ url: '/pages/profile/profile' });
    }
  }
});
