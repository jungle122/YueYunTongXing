var audioCatalog = require("./audio-catalog.js");

Page({
  data: {
    songs: []
  },

  onLoad(options) {
    this.refreshSongs();
    if (options && options.itemId) {
      this.openSongById(decodeURIComponent(options.itemId));
    }
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

  openSong(event) {
    this.openSongById(event.currentTarget.dataset.id);
  },

  openSongById(id) {
    if (!id || !audioCatalog.getSongById(id)) return;
    wx.navigateTo({
      url: "/pages/audio-player/audio-player?itemId=" + encodeURIComponent(id)
    });
  }
});
