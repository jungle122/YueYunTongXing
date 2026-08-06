Page({
  goBack() {
    const pages = getCurrentPages();
    if (pages && pages.length > 1) {
      wx.navigateBack();
    } else {
      wx.reLaunch({ url: "/pages/home/home" });
    }
  },
  startChain() {
    wx.redirectTo({ url: "/pages/chain-game/chain-game" });
  },
  startElimination() {
    wx.redirectTo({ url: "/pages/elimination-game/elimination-game" });
  },
  startPuzzle() {
    wx.redirectTo({ url: "/pages/puzzle-game/puzzle-game" });
  }
});
