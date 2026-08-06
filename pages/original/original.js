Page({
  goBack() {
    wx.navigateBack({
      fail: () => {
        wx.reLaunch({ url: "/pages/home/home" });
      }
    });
  },
  goVideo() {
    wx.navigateTo({ url: "/pages/video-learning/video-learning" });
  },
  goBook() {
    wx.navigateTo({ url: "/pages/picture-books/picture-books" });
  }
});
