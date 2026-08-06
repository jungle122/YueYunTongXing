Page({
  goBack() {
    const pages = getCurrentPages();
    if (pages && pages.length > 1) {
      wx.navigateBack();
    } else {
      wx.reLaunch({ url: "/pages/home/home" });
    }
  },
  goAudio() {
    wx.redirectTo({ url: "/pages/audio-learning/audio-learning" });
  },
  goParent() {
    wx.redirectTo({ url: "/pages/parent-child-singing/parent-child-singing" });
  },
  goText() {
    wx.redirectTo({ url: "/pages/text-science/text-science" });
  }
});
