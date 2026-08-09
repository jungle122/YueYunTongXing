var audioCatalog = require("./audio-catalog.js");

Page({
  data: {
    songs: [],
    mediaLoading: true,
    mediaLoadError: ""
  },

  onLoad(options) {
    this.refreshSongs();
    this.pendingItemId = options && options.itemId ? decodeURIComponent(options.itemId) : "";
    this.loadAudioMedia();
  },

  onShow() {
    this.refreshSongs();
  },

  refreshSongs() {
    var likes = wx.getStorageSync("audio_likes") || {};
    var progressMap = wx.getStorageSync("audio_progress") || {};
    var songs = audioCatalog.getSongs().map(function(song, index) {
      var progress = Number(progressMap[song.id]) || 0;
      return Object.assign({}, song, {
        orderText: (index + 1 < 10 ? "0" : "") + (index + 1),
        isLiked: !!likes[song.id],
        progress: Math.max(0, Math.min(100, progress)),
        progressText: progress > 0 ? "已听 " + progress + "%" : "还未开始"
      });
    });
    this.setData({ songs: songs });
  },

  async loadAudioMedia() {
    this.setData({ mediaLoading: true, mediaLoadError: "" });
    try {
      await audioCatalog.loadCloudSources();
      this.setData({ mediaLoading: false, mediaLoadError: "" });
      this.refreshSongs();
      if (this.pendingItemId) {
        var itemId = this.pendingItemId;
        this.pendingItemId = "";
        this.openSongById(itemId);
      }
    } catch (error) {
      console.error("加载音频资源失败:", error);
      this.setData({
        mediaLoading: false,
        mediaLoadError: error && error.message ? error.message : "音频服务暂时不可用，请稍后重试"
      });
    }
  },

  openSong(event) {
    this.openSongById(event.currentTarget.dataset.id);
  },

  openSongById(id) {
    var song = id ? audioCatalog.getSongById(id) : null;
    if (!song) return;
    if (!song.audioSrc) {
      wx.showToast({ title: this.data.mediaLoadError || "音频正在加载，请稍后重试", icon: "none" });
      return;
    }
    wx.navigateTo({
      url: "/pages/audio-player/audio-player?itemId=" + encodeURIComponent(id)
    });
  }
});
