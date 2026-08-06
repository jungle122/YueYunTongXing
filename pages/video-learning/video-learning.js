Page({
  data: {
    videos: [],
    displayVideos: [],
    currentPlaying: null,
    playing: false,
    favorites: {},
    showToast: false,
    toastText: "",
    toastIcon: "",
    toastType: "",
    showPlayer: false,
    currentVideo: null,
    videoSrc: "",
    videoId: "",
    audioContext: null,
    contain: "contain",
    isSeeking: false,
    lastVideoTime: 0,
    videoPlayStartTime: null,
    videoPlayDuration: 0
  },
  onLoad() {
    this.initVideos();
    var favorites = wx.getStorageSync("video_favorites") || {};
    this.setData({ favorites: favorites });
    this.refreshDisplayVideos();
  },
  onUnload() {
    if (this.data.audioContext) { try { this.data.audioContext.stop(); } catch(e) {} try { this.data.audioContext.destroy(); } catch(e) {} }
  },
  initVideos() {
    var videos = [
      { id: "video1", title: "氹氹转", subtitle: "经典粤语童谣动画", description: "氹氹转，菊花圆，炒米饼，糯米团...", tags: ["经典","童谣","粤语"], audioSrc: "https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/songs/song20.mp3" },
      { id: "video2", title: "齐齐望过去", subtitle: "中秋节特别版", description: "齐齐望过去，一起过中秋...", tags: ["节日","童谣","中秋"], audioSrc: "https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/songs/song20.mp3" },
      { id: "video3", title: "月光光", subtitle: "睡前故事版", description: "月光光，照地堂，虾仔你乖乖瞓落床...", tags: ["睡前","经典","温馨"], audioSrc: "https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/songs/song18.mp3" },
      { id: "video4", title: "小猪佩奇洗白白大作战", subtitle: "动画联动版", description: "小猪佩奇带你学粤语童谣...", tags: ["动画","趣味","互动"], audioSrc: "https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/songs/song22.mp3" },
      { id: "video5", title: "喜羊羊带你齐齐望过去", subtitle: "喜羊羊联动版", description: "喜羊羊带你了解粤语童谣文化...", tags: ["动画","文化","教育"], audioSrc: "https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/songs/song20.mp3" },
      { id: "video6", title: "火鸡总动员之何家公鸡魔性对决", subtitle: "动画电影版", description: "火鸡总动员遇上粤语童谣...", tags: ["电影","搞笑","经典"], audioSrc: "https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/songs/song21.mp3" },
      { id: "video7", title: "海绵宝宝带你扒龙船", subtitle: "端午节特别版", description: "海绵宝宝学粤语童谣...", tags: ["动画","节日","趣味"], audioSrc: "https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/songs/song20.mp3" },
      { id: "video8", title: "走进小马宝莉的细小世界", subtitle: "小马宝莉联动版", description: "小马宝莉的粤语童谣之旅...", tags: ["动画","奇幻","童谣"], audioSrc: "https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/songs/song18.mp3" },
      { id: "video9", title: "当哪吒遇见氹氹转", subtitle: "国漫联动版", description: "哪吒学唱粤语童谣...", tags: ["国漫","经典","趣味"], audioSrc: "https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/songs/song20.mp3" },
      { id: "video10", title: "当葫芦娃唱起月光光", subtitle: "葫芦娃联动版", description: "葫芦娃的粤语童谣...", tags: ["国漫","经典","睡前"], audioSrc: "https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/songs/song18.mp3" }
    ];
    this.setData({ videos: videos });
    this.refreshDisplayVideos();
  },
  refreshDisplayVideos() {
    var self = this;
    var displayVideos = self.data.videos.map(function(v) {
      var d = JSON.parse(JSON.stringify(v));
      d.playBtnText = (self.data.currentPlaying === v.id && self.data.playing) ? "⏸️" : "▶️";
      d.isPlaying = self.data.currentPlaying === v.id && self.data.playing;
      d.likeText = self.data.favorites[v.id] ? "💖" : "❤️";
      d.isLiked = !!self.data.favorites[v.id];
      return d;
    });
    this.setData({ displayVideos: displayVideos });
  },
  goBack() {
    wx.navigateBack({ fail: function() { wx.reLaunch({ url: "/pages/original/original" }); } });
  },
  playVideo(e) {
    var video = e.currentTarget.dataset.video;
    if (this.data.currentPlaying === video.id && this.data.playing) {
      this.setData({ playing: false });
      this.refreshDisplayVideos();
      return;
    }
    if (this.data.currentPlaying === video.id && !this.data.playing) {
      this.setData({ playing: true });
      this.refreshDisplayVideos();
      return;
    }
    this.setData({ currentPlaying: video.id, playing: true, currentVideo: video, showPlayer: true, videoSrc: video.src || "", videoId: "video-" + video.id });
    this.refreshDisplayVideos();
    this.recordLearningHistory("video", video.title, video.id);
    this.prepareAudio(video.id);
  },
  prepareAudio(videoId) {
    var self = this;
    var video = null;
    for (var i = 0; i < self.data.videos.length; i++) { if (self.data.videos[i].id === videoId) { video = self.data.videos[i]; break; } }
    if (!video) return;
    var audioSrc = video.audioSrc || "";
    if (!audioSrc) return;
    if (self.data.audioContext) { try { self.data.audioContext.stop(); } catch(e) {} try { self.data.audioContext.destroy(); } catch(e) {} }
    var ac = wx.createInnerAudioContext();
    ac.obeyMuteSwitch = false; ac.volume = 1; ac.loop = false;
    ac._isPlaying = false; ac._videoId = videoId;
    ac.onPlay(function() { ac._isPlaying = true; });
    ac.onPause(function() { ac._isPlaying = false; });
    ac.onStop(function() { ac._isPlaying = false; });
    ac.onEnded(function() { ac._isPlaying = false; });
    ac.onError(function(err) { console.error("音频错误:", err); });
    ac.src = audioSrc;
    self.setData({ audioContext: ac });
  },
  closePlayer() {
    if (this.data.audioContext) { try { this.data.audioContext.stop(); } catch(e) {} try { this.data.audioContext.destroy(); } catch(e) {} }
    this.setData({ showPlayer: false, currentVideo: null, audioContext: null, playing: false, currentPlaying: null, videoPlayDuration: 0 });
    this.refreshDisplayVideos();
  },
  onVideoPlay() {
    this.setData({ playing: true, videoPlayStartTime: Date.now() });
    this.refreshDisplayVideos();
    if (this.data.currentVideo) { this.recordLearningHistory("video", this.data.currentVideo.title, this.data.currentVideo.id); }
    if (this.data.audioContext) {
      var self = this;
      setTimeout(function() { if (self.data.audioContext && !self.data.audioContext._isPlaying && self.data.playing) { try { self.data.audioContext.play(); } catch(err) {} } }, 100);
    }
  },
  onVideoPause() {
    this.setData({ playing: false });
    if (this.data.videoPlayStartTime) { this.setData({ videoPlayDuration: this.data.videoPlayDuration + Math.floor((Date.now() - this.data.videoPlayStartTime) / 1000), videoPlayStartTime: null }); }
    if (this.data.audioContext) { this.data.audioContext.pause(); }
    this.refreshDisplayVideos();
  },
  onVideoEnded() {
    this.setData({ playing: false, currentPlaying: null });
    if (this.data.videoPlayStartTime && this.data.currentVideo) {
      this.setData({ videoPlayDuration: this.data.videoPlayDuration + Math.floor((Date.now() - this.data.videoPlayStartTime) / 1000), videoPlayStartTime: null });
      this.updateLearningHistoryDuration("video", this.data.currentVideo.id, this.data.videoPlayDuration);
      this.setData({ videoPlayDuration: 0 });
    }
    if (this.data.audioContext) { try { this.data.audioContext.stop(); } catch(e) {} try { this.data.audioContext.destroy(); } catch(e) {} this.setData({ audioContext: null }); }
    this.refreshDisplayVideos();
  },
  onVideoError(e) {
    console.error("视频播放错误:", e);
    wx.showModal({ title: "视频播放提示", content: "视频加载失败，请检查网络连接", showCancel: false });
    this.closePlayer();
  },
  onVideoLoaded() {},
  onVideoWaiting() {},
  onVideoProgress() {},
  onVideoTimeUpdate() {},
  onVideoSeeked() {},
  onVideoFullscreenChange(e) {
    if (e && e.detail && e.detail.fullScreen && this.data.playing) {
      if (this.data.audioContext && !this.data.audioContext._isPlaying) { try { this.data.audioContext.play(); } catch(err) {} }
    }
  },
  enterFullscreen() {
    if (!this.data.currentVideo) return;
    try {
      var ctx = wx.createVideoContext("video-" + this.data.currentVideo.id);
      if (ctx && ctx.requestFullScreen) { ctx.requestFullScreen({ direction: 90 }); }
    } catch(err) { console.error("进入全屏失败:", err); }
  },
  toggleFavorite(e) {
    var video = e.currentTarget.dataset.video;
    var prev = !!this.data.favorites[video.id];
    var key = "favorites." + video.id;
    this.setData({ [key]: !prev });
    try { wx.setStorageSync("video_favorites", this.data.favorites); } catch(e) {}
    this.setData({ toastText: !prev ? "收藏成功" : "取消收藏", toastIcon: !prev ? "💖" : "❤️", toastType: !prev ? "success" : "cancel", showToast: true });
    this.refreshDisplayVideos();
    var self = this;
    setTimeout(function() { self.setData({ showToast: false }); }, 1500);
  },
  getVideoSrc(video) {
    if (!video || !video.src) return "";
    if (video.src.indexOf("http") === 0) return video.src;
    return "";
  },
  recordLearningHistory(type, title, itemId) {
    try {
      var historyStr = wx.getStorageSync("learningHistory") || "[]";
      var history = JSON.parse(historyStr);
      var today = new Date().toDateString();
      var existingIndex = -1;
      for (var i = 0; i < history.length; i++) {
        if (history[i].itemId === itemId && history[i].type === type && new Date(history[i].timestamp).toDateString() === today) { existingIndex = i; break; }
      }
      if (existingIndex >= 0) { history[existingIndex].timestamp = new Date().toISOString(); }
      else { history.push({ type: type, title: title, itemId: itemId, timestamp: new Date().toISOString(), duration: 0 }); }
      if (history.length > 100) { history.splice(0, history.length - 100); }
      wx.setStorageSync("learningHistory", JSON.stringify(history));
    } catch (e) { console.error("记录学习历史失败:", e); }
  },
  updateLearningHistoryDuration(type, itemId, duration) {
    try {
      var historyStr = wx.getStorageSync("learningHistory") || "[]";
      var history = JSON.parse(historyStr);
      for (var i = history.length - 1; i >= 0; i--) {
        if (history[i].itemId === itemId && history[i].type === type) { history[i].duration = (history[i].duration || 0) + duration; break; }
      }
      wx.setStorageSync("learningHistory", JSON.stringify(history));
    } catch (e) { console.error("更新学习历史时长失败:", e); }
  }
});
