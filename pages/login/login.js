var userModule = require('../../utils/user.js');

Page({
  data: {
    nickname: '',
    emojiAvatars: [
      { emoji: '🦊', name: '小狐狸', bg: 'linear-gradient(135deg, #FFB347, #FF8C42)' },
      { emoji: '🐱', name: '小猫咪', bg: 'linear-gradient(135deg, #87CEEB, #6BB5E0)' },
      { emoji: '🐶', name: '小狗狗', bg: 'linear-gradient(135deg, #98D8C8, #7BC8B5)' }
    ],
    selectedEmoji: -1,
    wechatAvatarUrl: '',
    isLoggedIn: false
  },

  onLoad: function() {
    var user = userModule.getCurrentUser();
    if (user) {
      this.setData({
        nickname: user.nickname || '',
        isLoggedIn: true
      });
    }
  },

  onNicknameInput: function(e) {
    this.setData({ nickname: e.detail.value });
  },

  selectEmoji: function(e) {
    var index = e.currentTarget.dataset.index;
    this.setData({ selectedEmoji: index, wechatAvatarUrl: '' });
  },

  onChooseAvatar: function(e) {
    var avatarUrl = e.detail.avatarUrl;
    if (avatarUrl) {
      this.setData({ 
        wechatAvatarUrl: avatarUrl,
        selectedEmoji: -1
      });
    }
  },

  handleLogin: function() {
    var nickname = this.data.nickname.trim();
    if (!nickname) {
      wx.showToast({ title: '请输入昵称', icon: 'none' });
      return;
    }

    var avatar = '';
    var avatarType = 'emoji';

    if (this.data.wechatAvatarUrl) {
      avatar = this.data.wechatAvatarUrl;
      avatarType = 'wechat';
    } else if (this.data.selectedEmoji >= 0) {
      avatar = this.data.emojiAvatars[this.data.selectedEmoji].emoji;
      avatarType = 'emoji';
    }

    var result = userModule.register({
      nickname: nickname,
      avatar: avatar,
      avatarType: avatarType
    });

    if (result.success) {
      wx.showToast({ 
        title: result.isNew ? '角色创建成功！' : '欢迎回来！', 
        icon: 'success',
        duration: 1500
      });
      var self = this;
      setTimeout(function() {
        wx.switchTab({ url: '/pages/home/home' });
      }, 1500);
    } else {
      wx.showToast({ title: result.message, icon: 'none' });
    }
  }
});
