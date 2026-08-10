const VIDEO_GROUP_ID = "video-library";
const TEMP_URL_REFRESH_INTERVAL = 90 * 60 * 1000;

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
    favoriteCount: 0,
    showPlayer: false,
    currentVideo: null,
    videoSrc: "",
    videoId: "",
    contain: "contain",
    isSeeking: false,
    lastVideoTime: 0,
    videoPlayStartTime: null,
    videoPlayDuration: 0,
    mediaLoading: true,
    mediaLoadError: ""
  },
  onLoad() {
    this.initVideos();
    var favorites = wx.getStorageSync("video_favorites") || {};
    this.setData({ favorites: favorites });
    this.refreshDisplayVideos();
    this.loadVideoMedia();
  },
  onShow() {
    if (this.lastMediaLoadedAt && Date.now() - this.lastMediaLoadedAt >= TEMP_URL_REFRESH_INTERVAL) {
      this.loadVideoMedia({ silent: true });
    }
  },
  initVideos() {
    var videos = [
      { id: "video1", title: "氹氹转", subtitle: "经典粤语童谣动画", description: "氹转，菊花圆，炒米饼，糯米团...", tags: ["经典","童谣","粤语"], poster: "/static/covers/video1.png" },
      { id: "video2", title: "齐齐望过去", subtitle: "中秋节特别版", description: "齐齐望过去，一起过中秋...", tags: ["节日","童谣","中秋"], poster: "/static/covers/video2.png" },
      { id: "video3", title: "月光光", subtitle: "睡前故事版", description: "月光光，照地堂，虾仔你乖乖瞓落床...", tags: ["睡前","经典","温馨"], poster: "/static/covers/video3.png" },
      { id: "video4", title: "小猪佩奇洗白白大作战", subtitle: "动画联动版", description: "小猪佩奇带你学粤语童谣...", tags: ["动画","趣味","互动"], poster: "/static/covers/video4.png" },
      { id: "video5", title: "喜羊羊带你齐齐望过去", subtitle: "喜羊羊联动版", description: "喜羊羊带你了解粤语童谣文化...", tags: ["动画","文化","教育"], poster: "/static/covers/video5.png" },
      { id: "video6", title: "火鸡总动员之何家公鸡魔性对决", subtitle: "动画电影版", description: "火鸡总动员遇上粤语童谣...", tags: ["电影","搞笑","经典"], poster: "/static/covers/video6.png" },
      { id: "video7", title: "海绵宝宝带你扒龙船", subtitle: "端午节特别版", description: "海绵宝宝学粤语童谣...", tags: ["动画","节日","趣味"], poster: "/static/covers/video7.png" },
      { id: "video8", title: "走进小马宝莉的细小世界", subtitle: "小马宝莉联动版", description: "小马宝莉的粤语童谣之旅...", tags: ["动画","奇幻","童谣"], poster: "/static/covers/video8.png" },
      { id: "video9", title: "当哪吒遇见氹氹转", subtitle: "国漫联动版", description: "哪吒学唱粤语童谣...", tags: ["国漫","经典","趣味"], poster: "/static/covers/video9.png" },
      { id: "video10", title: "当葫芦娃唱起月光光", subtitle: "葫芦娃联动版", description: "葫芦娃的粤语童谣...", tags: ["国漫","经典","睡前"], poster: "/static/covers/video10.png" }
    ];
    this.setData({ videos: videos });
    this.refreshDisplayVideos();
  },
  async loadVideoMedia(options) {
    if (this.isMediaRequesting) return;
    var silent = options && options.silent;
    this.isMediaRequesting = true;
    if (!silent) this.setData({ mediaLoading: true, mediaLoadError: "" });

    try {
      var response = await wx.cloud.callFunction({
        name: "getMediaAssets",
        data: { mediaType: "video", groupId: VIDEO_GROUP_ID }
      });
      var result = response && response.result;
      if (!result || !result.ok) {
        throw new Error(result && result.message ? result.message : "视频服务暂时不可用");
      }
      var group = (result.groups || [])[0];
      if (!group || !group.items || group.items.length !== this.data.videos.length) {
        throw new Error("部分视频资源暂时不可用");
      }
      var sourceMap = {};
      group.items.forEach(function(item) {
        if (item.id && item.url) sourceMap[item.id] = item.url;
      });
      var videos = this.data.videos.map(function(video) {
        return Object.assign({}, video, { src: sourceMap[video.id] || "" });
      });
      if (videos.some(function(video) { return !video.src; })) {
        throw new Error("部分视频资源暂时不可用");
      }
      this.lastMediaLoadedAt = Date.now();
      this.setData({ videos: videos, mediaLoading: false, mediaLoadError: "" });
      this.refreshDisplayVideos();
    } catch (error) {
      console.error("加载视频资源失败:", error);
      this.setData({
        mediaLoading: false,
        mediaLoadError: error && error.message ? error.message : "视频服务暂时不可用，请稍后重试"
      });
    } finally {
      this.isMediaRequesting = false;
    }
  },
  refreshDisplayVideos() {
    var self = this;
    var coverThemes = ["cover-coral", "cover-honey", "cover-sage", "cover-sky"];
    var favoriteCount = 0;
    var displayVideos = self.data.videos.map(function(v, index) {
      var d = JSON.parse(JSON.stringify(v));
      d.isPlaying = self.data.currentPlaying === v.id && self.data.playing;
      d.playIcon = d.isPlaying ? "❚❚" : "▶";
      d.playLabel = d.isPlaying ? "播放中" : "观看作品";
      d.isLiked = !!self.data.favorites[v.id];
      d.favoriteLabel = d.isLiked ? "已收藏" : "收藏";
      d.orderText = index < 9 ? "0" + (index + 1) : String(index + 1);
      d.themeClass = coverThemes[index % coverThemes.length];
      if (d.isLiked) favoriteCount++;
      return d;
    });
    this.setData({ displayVideos: displayVideos, favoriteCount: favoriteCount });
  },
  goBack() {
    wx.navigateBack({ fail: function() { wx.switchTab({ url: "/pages/original/original" }); } });
  },
  playVideo(e) {
    var video = e.currentTarget.dataset.video;
    if (!video.src) {
      wx.showToast({ title: this.data.mediaLoadError || "视频正在加载，请稍后重试", icon: "none" });
      return;
    }
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
  },
  closePlayer() {
    this.setData({ showPlayer: false, currentVideo: null, playing: false, currentPlaying: null, videoPlayDuration: 0 });
    this.refreshDisplayVideos();
  },
  onVideoPlay() {
    this.setData({ playing: true, videoPlayStartTime: Date.now() });
    this.refreshDisplayVideos();
    if (this.data.currentVideo) { this.recordLearningHistory("video", this.data.currentVideo.title, this.data.currentVideo.id); }
  },
  onVideoPause() {
    this.setData({ playing: false });
    if (this.data.videoPlayStartTime) { this.setData({ videoPlayDuration: this.data.videoPlayDuration + Math.floor((Date.now() - this.data.videoPlayStartTime) / 1000), videoPlayStartTime: null }); }
    this.refreshDisplayVideos();
  },
  onVideoEnded() {
    this.setData({ playing: false, currentPlaying: null });
    if (this.data.videoPlayStartTime && this.data.currentVideo) {
      this.setData({ videoPlayDuration: this.data.videoPlayDuration + Math.floor((Date.now() - this.data.videoPlayStartTime) / 1000), videoPlayStartTime: null });
      this.updateLearningHistoryDuration("video", this.data.currentVideo.id, this.data.videoPlayDuration);
      this.setData({ videoPlayDuration: 0 });
    }
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
    if (!e || !e.detail) return;
  },
  enterFullscreen() {
    if (!this.data.currentVideo) return;
    try {
      var ctx = wx.createVideoContext("video-" + this.data.currentVideo.id);
      if (ctx && ctx.requestFullScreen) { ctx.requestFullScreen({ direction: 90 }); }
    } catch(err) { console.error("进入全屏失败:", err); }
  },
  noop() {},
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
