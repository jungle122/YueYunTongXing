var userModule = require('./utils/user.js');
var cloudUserModule = require('./utils/cloud-user.js');
var learningSyncModule = require('./utils/learning-sync.js');

App({
  globalData: {
    profileReady: null,
    profileError: ''
  },

  onLaunch: function() {
    console.log("App Launch");

    if (wx.setInnerAudioOption) {
      wx.setInnerAudioOption({
        obeyMuteSwitch: false,
        fail: function(error) {
          console.error("设置音频播放选项失败", error);
        }
      });
    }

    if (!wx.cloud) {
      console.error("当前微信基础库不支持云开发");
      return;
    }

    wx.cloud.init({
      env: "yueyuntongxing-dev-d0cig323c0cff"
    });

    this.globalData.profileReady = this.restoreWechatProfile();
  },

  restoreWechatProfile: async function() {
    var localUser = userModule.getCurrentUser();
    try {
      if (localUser && !localUser.cloudProfile) {
        var migrated = await cloudUserModule.saveProfile(localUser);
        await learningSyncModule.restore();
        return migrated.profile;
      }
      var cloudProfile = await cloudUserModule.restoreProfile();
      if (cloudProfile) {
        await learningSyncModule.restore();
        return cloudProfile;
      }
      if (localUser && localUser.cloudProfile) userModule.logout();
      return null;
    } catch (error) {
      console.error('恢复微信身份资料失败:', error);
      this.globalData.profileError = error && error.message ? error.message : '微信身份服务暂时不可用';
      return localUser || null;
    }
  },
  onShow: function() { console.log("App Show"); },
  onHide: function() {
    console.log("App Hide");
    learningSyncModule.syncNow().catch(function(error) {
      console.error('退出前同步学习数据失败:', error);
    });
  }
});
