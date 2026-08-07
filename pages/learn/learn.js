Page({
  data: {
    isPageEntering: false
  },
  onShow() {
    this.playEntryAnimation();
  },
  playEntryAnimation() {
    this.setData({ isPageEntering: false }, () => {
      this.setData({ isPageEntering: true });
    });
  },
  goAudio() {
    wx.navigateTo({ url: "/pages/audio-learning/audio-learning" });
  },
  goText() {
    wx.navigateTo({ url: "/pages/text-science/text-science" });
  }
});
