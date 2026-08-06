Page({
  data: {
    nickname: "",
    dailyReminder: true,
    difficultyLevels: ["入门", "初级", "中级", "高级"],
    difficultyIndex: 1,
    selectedAvatar: "1",
    avatars: [
      { key: "1", path: "https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/Avatars/Avatar1.png" },
      { key: "2", path: "https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/Avatars/Avatar2.png" },
      { key: "3", path: "https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/Avatars/Avatar3.png" }
    ],
    selectedAvatarPath: ""
  },
  onLoad() {
    this.loadSettings();
  },
  goBack() {
    var pages = getCurrentPages();
    if (pages && pages.length > 1) {
      wx.navigateBack();
    } else {
      wx.reLaunch({ url: "/pages/home/home" });
    }
  },
  loadSettings() {
    var nickname = wx.getStorageSync("userNickname") || "";
    var dailyReminder = wx.getStorageSync("dailyReminder");
    var difficulty = wx.getStorageSync("difficultyLevel") || "初级";
    var selectedAvatar = wx.getStorageSync("selectedAvatar") || "1";
    var idx = this.data.difficultyLevels.indexOf(difficulty);
    if (idx === -1) idx = 1;
    var avatar = null;
    for (var i = 0; i < this.data.avatars.length; i++) {
      if (this.data.avatars[i].key === String(selectedAvatar)) {
        avatar = this.data.avatars[i];
        break;
      }
    }
    this.setData({
      nickname: nickname,
      dailyReminder: dailyReminder !== false,
      difficultyIndex: idx,
      selectedAvatar: selectedAvatar,
      selectedAvatarPath: avatar ? avatar.path : ""
    });
  },
  onNicknameInput(e) {
    this.setData({ nickname: e.detail.value });
  },
  onReminderChange(e) {
    this.setData({ dailyReminder: e.detail.value });
  },
  onDifficultyChange(e) {
    this.setData({ difficultyIndex: e.detail.value });
  },
  selectAvatar(e) {
    var key = e.currentTarget.dataset.key;
    this.setData({ selectedAvatar: key });
    var avatar = null;
    for (var i = 0; i < this.data.avatars.length; i++) {
      if (this.data.avatars[i].key === String(key)) {
        avatar = this.data.avatars[i];
        break;
      }
    }
    this.setData({ selectedAvatarPath: avatar ? avatar.path : "" });
  },
  saveSettings() {
    wx.setStorageSync("userNickname", this.data.nickname);
    wx.setStorageSync("dailyReminder", this.data.dailyReminder);
    wx.setStorageSync("difficultyLevel", this.data.difficultyLevels[this.data.difficultyIndex]);
    wx.setStorageSync("selectedAvatar", String(this.data.selectedAvatar));
    wx.showToast({ title: "设置已保存", icon: "success", duration: 2000 });
    var self = this;
    setTimeout(function() {
      var pages = getCurrentPages();
      if (pages && pages.length > 1) {
        wx.navigateBack();
      } else {
        wx.reLaunch({ url: "/pages/home/home" });
      }
    }, 1500);
  },
  onImageError(e) {
    console.error("头像图片加载失败:", e);
  },
  onPreviewError(e) {
    console.error("头像预览加载失败:", e);
  }
});
