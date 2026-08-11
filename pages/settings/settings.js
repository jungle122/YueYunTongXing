var userModule = require('../../utils/user.js');
var avatarModule = require('../../utils/avatars.js');
var cloudUserModule = require('../../utils/cloud-user.js');
var learningSyncModule = require('../../utils/learning-sync.js');

Page({
  data: {
    isLoggedIn: false,
    nickname: '',
    dailyReminder: true,
    difficultyLevels: ['入门', '初级', '中级', '高级'],
    difficultyIndex: 1,
    stickerAvatars: avatarModule.STICKER_AVATARS,
    selectedSticker: -1,
    currentAvatar: '',
    avatarType: 'emoji',
    wechatAvatarUrl: '',
    isRestoring: true,
    isSaving: false,
    identityError: '',
    nicknameFocused: false
  },

  onLoad: function() {
    this.initializeSettings();
  },

  initializeSettings: async function() {
    var app = getApp();
    try {
      var profileReady = app.globalData.profileReady;
      if (profileReady && typeof profileReady.then === 'function') await profileReady;
      this.loadSettings();
      this.setData({
        isRestoring: false,
        identityError: app.globalData.profileError || ''
      });
    } catch (error) {
      this.loadSettings();
      this.setData({
        isRestoring: false,
        identityError: error && error.message ? error.message : '微信身份服务暂时不可用'
      });
    }
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
    var selectedSticker = -1;
    var wechatAvatarUrl = '';

    if (user) {
      currentAvatar = user.avatar || '';
      avatarType = user.avatarType || 'emoji';
      if (avatarType === 'sticker') {
        selectedSticker = avatarModule.findStickerIndex(currentAvatar);
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
      selectedSticker: selectedSticker,
      wechatAvatarUrl: wechatAvatarUrl
    });
  },

  selectSticker: function(e) {
    var index = e.currentTarget.dataset.index;
    this.setData({
      selectedSticker: index,
      currentAvatar: this.data.stickerAvatars[index].src,
      avatarType: 'sticker',
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
        selectedSticker: -1
      });
    }
  },

  onNicknameInput: function(e) {
    this.setData({ nickname: e.detail.value });
  },

  useWechatNickname: function() {
    var self = this;
    this.setData({ nicknameFocused: false }, function() {
      self.setData({ nicknameFocused: true });
    });
  },

  onNicknameBlur: function() {
    this.setData({ nicknameFocused: false });
  },

  onReminderChange: function(e) {
    this.setData({ dailyReminder: e.detail.value });
  },

  onDifficultyChange: function(e) {
    this.setData({ difficultyIndex: e.detail.value });
  },

  saveSettings: async function() {
    if (this.data.isSaving || this.data.isRestoring) return;
    var nickname = this.data.nickname.trim();
    if (!nickname) {
      wx.showToast({ title: '请输入昵称', icon: 'none' });
      return;
    }

    var currentUser = userModule.getCurrentUser();
    this.setData({ isSaving: true, identityError: '' });
    try {
      var reusableAvatarFileID = currentUser && this.data.avatarType === 'wechat' && this.data.currentAvatar === currentUser.avatar
        ? (currentUser.communityAvatarFileID || '')
        : '';
      var result = await cloudUserModule.saveProfile({
        userId: currentUser ? (currentUser.userId || '') : '',
        nickname: nickname,
        avatar: this.data.currentAvatar,
        avatarType: this.data.avatarType,
        communityAvatarFileID: reusableAvatarFileID
      });
      if (!currentUser) await learningSyncModule.restore();
      getApp().globalData.profileError = '';
      this.setData({ isLoggedIn: true, identityError: '' });

      // 学习偏好暂时保留为本机设置，不参与账号识别。
      wx.setStorageSync('userNickname', nickname);
      wx.setStorageSync('dailyReminder', this.data.dailyReminder);
      wx.setStorageSync('difficultyLevel', this.data.difficultyLevels[this.data.difficultyIndex]);

      wx.showToast({ title: '资料已同步', icon: 'success', duration: 1500 });

      setTimeout(function() {
        var pages = getCurrentPages();
        if (pages && pages.length > 1) {
          wx.navigateBack();
        } else {
          wx.switchTab({ url: '/pages/profile/profile' });
        }
      }, 1500);
    } catch (error) {
      var message = error && error.message ? error.message : '资料同步失败，请稍后再试';
      this.setData({ identityError: message });
      wx.showToast({
        title: message,
        icon: 'none'
      });
    } finally {
      this.setData({ isSaving: false });
    }
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
