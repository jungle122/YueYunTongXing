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
  startChain() {
    wx.navigateTo({ url: "/pages/chain-game/chain-game" });
  },
  startElimination() {
    wx.navigateTo({ url: "/pages/elimination-game/elimination-game" });
  },
  startPuzzle() {
    wx.navigateTo({ url: "/pages/puzzle-game/puzzle-game" });
  },
  startPicturePuzzle() {
    wx.navigateTo({ url: "/pages/picture-puzzle-game/picture-puzzle-game" });
  }
});
