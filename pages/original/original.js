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
  goVideo() {
    wx.navigateTo({ url: "/pages/video-learning/video-learning" });
  },
  goBook() {
    wx.navigateTo({ url: "/pages/picture-books/picture-books" });
  }
});
