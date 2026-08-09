App({
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
  },
  onShow: function() { console.log("App Show"); },
  onHide: function() { console.log("App Hide"); }
});
