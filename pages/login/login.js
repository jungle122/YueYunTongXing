var userModule = require('../../utils/user.js');
var avatarModule = require('../../utils/avatars.js');
var cloudUserModule = require('../../utils/cloud-user.js');
var learningSyncModule = require('../../utils/learning-sync.js');

Page({
  data: {
    nickname: '',
    stickerAvatars: avatarModule.STICKER_AVATARS,
    selectedSticker: 0,
    wechatAvatarUrl: '',
    isLoggedIn: false,
    isRestoring: true,
    isSaving: false,
    identityError: '',
    nicknameFocused: false
  },

  onLoad: function() {
    this.initializeProfile();
  },

  initializeProfile: async function() {
    try {
      var profileReady = getApp().globalData.profileReady;
      if (profileReady && typeof profileReady.then === 'function') await profileReady;
      var user = userModule.getCurrentUser();
      if (user && user.cloudProfile) {
        wx.showToast({ title: '已恢复微信资料', icon: 'success' });
        setTimeout(function() {
          wx.switchTab({ url: '/pages/home/home' });
        }, 500);
        return;
      }
      this.setData({
        isRestoring: false,
        identityError: getApp().globalData.profileError || ''
      });
    } catch (error) {
      this.setData({
        isRestoring: false,
        identityError: error && error.message ? error.message : '微信身份服务暂时不可用'
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

  selectSticker: function(e) {
    var index = e.currentTarget.dataset.index;
    this.setData({ selectedSticker: index, wechatAvatarUrl: '' });
  },

  onChooseAvatar: function(e) {
    var avatarUrl = e.detail.avatarUrl;
    if (avatarUrl) {
      this.setData({
        wechatAvatarUrl: avatarUrl,
        selectedSticker: -1
      });
    }
  },

  handleLogin: async function() {
    if (this.data.isSaving || this.data.isRestoring) return;
    var nickname = this.data.nickname.trim();
    if (!nickname) {
      wx.showToast({ title: '请输入昵称', icon: 'none' });
      return;
    }

    var avatar = this.data.stickerAvatars[0].src;
    var avatarType = 'sticker';

    if (this.data.wechatAvatarUrl) {
      avatar = this.data.wechatAvatarUrl;
      avatarType = 'wechat';
    } else if (this.data.selectedSticker >= 0) {
      avatar = this.data.stickerAvatars[this.data.selectedSticker].src;
      avatarType = 'sticker';
    }

    this.setData({ isSaving: true, identityError: '' });
    try {
      var currentUser = userModule.getCurrentUser() || {};
      var reusableAvatarFileID = avatarType === 'wechat' && avatar === currentUser.avatar
        ? (currentUser.communityAvatarFileID || '')
        : '';
      var result = await cloudUserModule.saveProfile({
        userId: currentUser.userId || '',
        nickname: nickname,
        avatar: avatar,
        avatarType: avatarType,
        communityAvatarFileID: reusableAvatarFileID
      });
      await learningSyncModule.restore();
      getApp().globalData.profileError = '';
      wx.showToast({
        title: result.isNew ? '角色创建成功！' : '资料已保存！',
        icon: 'success',
        duration: 1500
      });
      setTimeout(function() {
        wx.switchTab({ url: '/pages/home/home' });
      }, 1500);
    } catch (error) {
      var message = error && error.message ? error.message : '资料保存失败，请稍后再试';
      this.setData({ identityError: message });
      wx.showToast({ title: message, icon: 'none' });
    } finally {
      this.setData({ isSaving: false });
    }
  }
});
