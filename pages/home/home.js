Page({
  data: {
    isLoggedIn: false,
    userNickname: "",
    userAvatar: "",
    alinImageSrc: "/static/alin.png",
    nicknameFirstChar: "用"
  },
  onLoad() {
    this.checkLoginStatus();
    console.log("阿霖图片路径:", this.data.alinImageSrc);
  },
  onShow() {
    this.checkLoginStatus();
  },
  checkLoginStatus() {
    const nickname = wx.getStorageSync("userNickname");
    const avatar = wx.getStorageSync("userAvatar");
    const selectedAvatar = wx.getStorageSync("selectedAvatar");
    if (nickname || selectedAvatar) {
      this.setData({ isLoggedIn: true });
      this.setData({ userNickname: nickname || "用户" });
      const firstChar = (nickname || "用户").charAt(0);
      this.setData({ nicknameFirstChar: firstChar });
      if (selectedAvatar) {
        const avatarMap = {
          "1": "https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/Avatars/Avatar1.png",
          "2": "https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/Avatars/Avatar2.png",
          "3": "https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/Avatars/Avatar3.png"
        };
        this.setData({ userAvatar: avatarMap[String(selectedAvatar)] || "" });
      } else {
        this.setData({ userAvatar: avatar || "" });
      }
    } else {
      this.setData({ isLoggedIn: false, userNickname: "", userAvatar: "" });
    }
  },
  goToProfile() {
    wx.navigateTo({ url: "/pages/profile/profile" });
  },
  onAvatarError(e) {
    console.error("头像加载失败:", e);
    this.setData({ userAvatar: "" });
  },
  handleAlinClick() {
    console.log("阿霖被点击");
  },
  navigateToModule(e) {
    const url = e.currentTarget.dataset.url;
    if (url) {
      wx.navigateTo({ url });
    }
  }
});
