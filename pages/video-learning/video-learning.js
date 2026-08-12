const VIDEO_GROUP_ID = "video-library";
var userModule = require("../../utils/user.js");
var learningSyncModule = require("../../utils/learning-sync.js");

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
    playerLoading: false,
    playerLoadSlow: false,
    playerLoadError: "",
    isSeeking: false,
    lastVideoTime: 0,
    videoPlayStartTime: null,
    videoPlayDuration: 0,
    mediaLoading: true,
    mediaLoadError: ""
  },
  onLoad() {
    this.initVideos();
    var favorites = userModule.getUserStorage("video_favorites", {});
    this.setData({ favorites: favorites });
    this.refreshDisplayVideos();
    this.loadVideoMedia();
  },
  onShow() {
    if (this.lastMediaLoadedAt) {
      this.loadVideoMedia({ silent: true });
    }
  },
  initVideos() {
    var videos = [
      { id: "video1", title: "氹氹转", subtitle: "经典粤语童谣动画", description: "氹转，菊花圆，炒米饼，糯米团...", tags: ["经典","童谣","粤语"], poster: "", orientation: "landscape", fullscreenDirection: 90 },
      { id: "video2", title: "齐齐望过去", subtitle: "中秋节特别版", description: "齐齐望过去，一起过中秋...", tags: ["节日","童谣","中秋"], poster: "", orientation: "landscape", fullscreenDirection: 90 },
      { id: "video3", title: "月光光", subtitle: "睡前故事版", description: "月光光，照地堂，虾仔你乖乖瞓落床...", tags: ["睡前","经典","温馨"], poster: "", orientation: "landscape", fullscreenDirection: 90 },
      { id: "video4", title: "小猪佩奇洗白白大作战", subtitle: "动画联动版", description: "小猪佩奇带你学粤语童谣...", tags: ["动画","趣味","互动"], poster: "", orientation: "portrait", fullscreenDirection: 0 },
      { id: "video5", title: "喜羊羊带你齐齐望过去", subtitle: "喜羊羊联动版", description: "喜羊羊带你了解粤语童谣文化...", tags: ["动画","文化","教育"], poster: "", orientation: "landscape", fullscreenDirection: 90 },
      { id: "video6", title: "火鸡总动员之何家公鸡魔性对决", subtitle: "动画电影版", description: "火鸡总动员遇上粤语童谣...", tags: ["电影","搞笑","经典"], poster: "", orientation: "portrait", fullscreenDirection: 0 },
      { id: "video7", title: "海绵宝宝带你扒龙船", subtitle: "端午节特别版", description: "海绵宝宝学粤语童谣...", tags: ["动画","节日","趣味"], poster: "", orientation: "portrait", fullscreenDirection: 0 },
      { id: "video8", title: "走进小马宝莉的细小世界", subtitle: "小马宝莉联动版", description: "小马宝莉的粤语童谣之旅...", tags: ["动画","奇幻","童谣"], poster: "", orientation: "landscape", fullscreenDirection: 90 },
      { id: "video9", title: "当哪吒遇见氹氹转", subtitle: "国漫联动版", description: "哪吒学唱粤语童谣...", tags: ["国漫","经典","趣味"], poster: "", orientation: "portrait", fullscreenDirection: 0 },
      { id: "video10", title: "当葫芦娃唱起月光光", subtitle: "葫芦娃联动版", description: "葫芦娃的粤语童谣...", tags: ["国漫","经典","睡前"], poster: "", orientation: "landscape", fullscreenDirection: 90 },
      { id: "video11", title: "数字人带你看粤剧", subtitle: "数字人文化讲解", description: "跟随数字人走近粤剧艺术与岭南文化...", tags: ["数字人","粤剧","文化"], poster: "", orientation: "landscape", fullscreenDirection: 90 },
      { id: "video12", title: "数字人介绍齐齐望过去", subtitle: "童谣数字人讲解", description: "从画面与唱词认识童谣《齐齐望过去》...", tags: ["数字人","童谣","讲解"], poster: "", orientation: "landscape", fullscreenDirection: 90 },
      { id: "video13", title: "数字人介绍粤语童谣", subtitle: "岭南童谣入门", description: "跟随数字人了解粤语童谣的文化魅力...", tags: ["数字人","入门","文化"], poster: "", orientation: "landscape", fullscreenDirection: 90 },
      { id: "video14", title: "数字人介绍月光光", subtitle: "童谣数字人讲解", description: "跟随数字人认识经典童谣《月光光》...", tags: ["数字人","月光光","讲解"], poster: "", orientation: "landscape", fullscreenDirection: 90 },
      { id: "video15", title: "氹氹转改编", subtitle: "童谣创意改编", description: "用全新画面演绎经典粤语童谣《氹氹转》...", tags: ["改编","氹氹转","创意"], poster: "", orientation: "portrait", fullscreenDirection: 0 },
      { id: "video16", title: "落雨大改编", subtitle: "童谣创意改编", description: "生活场景里的《落雨大》趣味新演绎...", tags: ["改编","落雨大","生活"], poster: "", orientation: "portrait", fullscreenDirection: 0 },
      { id: "video17", title: "落雨大改编（二）", subtitle: "童谣创意改编", description: "岭南风情画面中的《落雨大》新演绎...", tags: ["改编","落雨大","岭南"], poster: "", orientation: "portrait", fullscreenDirection: 0 },
      { id: "video18", title: "月光光改编", subtitle: "童谣创意改编", description: "温馨亲子画面演绎经典童谣《月光光》...", tags: ["改编","月光光","亲子"], poster: "", orientation: "portrait", fullscreenDirection: 0 }
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
      var posterMap = {};
      group.items.forEach(function(item) {
        if (item.id && item.url) sourceMap[item.id] = item.url;
        if (item.id && item.posterUrl) posterMap[item.id] = item.posterUrl;
      });
      var videos = this.data.videos.map(function(video) {
        return Object.assign({}, video, {
          src: sourceMap[video.id] || "",
          poster: posterMap[video.id] || ""
        });
      });
      if (videos.some(function(video) { return !video.src || !video.poster; })) {
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
    this.clearPlayerLoadTimer();
    this.setData({ currentPlaying: video.id, playing: true, currentVideo: video, showPlayer: true, videoSrc: video.src || "", videoId: "video-" + video.id, playerLoading: true, playerLoadSlow: false, playerLoadError: "" });
    this.startPlayerLoadTimer();
    this.refreshDisplayVideos();
    this.recordLearningHistory("video", video.title, video.id);
  },
  closePlayer() {
    this.clearPlayerLoadTimer();
    this.setData({ showPlayer: false, currentVideo: null, playing: false, currentPlaying: null, videoPlayDuration: 0, playerLoading: false, playerLoadSlow: false, playerLoadError: "" });
    this.refreshDisplayVideos();
  },
  onVideoPlay() {
    this.clearPlayerLoadTimer();
    this.setData({ playing: true, isSeeking: false, videoPlayStartTime: Date.now(), playerLoading: false, playerLoadSlow: false, playerLoadError: "" });
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
    this.clearPlayerLoadTimer();
    this.setData({ playing: false, playerLoading: false, playerLoadSlow: false, playerLoadError: "视频加载失败，请检查网络后重试" });
    this.refreshDisplayVideos();
  },
  onUnload() {
    this.clearPlayerLoadTimer();
  },
  onVideoLoaded() {
    this.clearPlayerLoadTimer();
    this.setData({ playerLoading: false, playerLoadSlow: false, playerLoadError: "" });
  },
  onVideoWaiting() {
    if (this.data.isSeeking || this.bufferNoticeTimer) return;
    var self = this;
    this.bufferNoticeTimer = setTimeout(function() {
      self.bufferNoticeTimer = null;
      if (!self.data.showPlayer || self.data.isSeeking || self.data.playerLoadError) return;
      self.setData({ playerLoading: true, playerLoadSlow: false });
      self.startPlayerLoadTimer();
    }, 800);
  },
  onVideoProgress() {},
  onVideoTimeUpdate() {
    if (this.bufferNoticeTimer) {
      clearTimeout(this.bufferNoticeTimer);
      this.bufferNoticeTimer = null;
    }
    if (this.data.playerLoading && !this.data.playerLoadError) {
      this.clearPlayerLoadTimer();
      this.setData({ playerLoading: false, playerLoadSlow: false });
    }
  },
  onVideoSeeking() {
    this.clearPlayerLoadTimer();
    this.setData({ isSeeking: true, playerLoading: false, playerLoadSlow: false });
  },
  onVideoSeeked() {
    this.clearPlayerLoadTimer();
    this.setData({ isSeeking: false, playerLoading: false, playerLoadSlow: false });
  },
  onVideoFullscreenChange(e) {
    if (!e || !e.detail) return;
  },
  enterFullscreen() {
    if (!this.data.currentVideo) return;
    try {
      var ctx = wx.createVideoContext("video-" + this.data.currentVideo.id);
      if (ctx && ctx.requestFullScreen) { ctx.requestFullScreen({ direction: this.data.currentVideo.fullscreenDirection || 0 }); }
    } catch(err) { console.error("进入全屏失败:", err); }
  },
  retryVideo() {
    if (!this.data.currentVideo) return;
    this.clearPlayerLoadTimer();
    this.setData({ videoSrc: "", playerLoading: true, playerLoadSlow: false, playerLoadError: "" });
    var self = this;
    setTimeout(function() {
      if (!self.data.currentVideo) return;
      self.setData({ videoSrc: self.data.currentVideo.src });
      self.startPlayerLoadTimer();
    }, 80);
  },
  startPlayerLoadTimer() {
    this.clearPlayerLoadTimer();
    var self = this;
    this.playerLoadTimer = setTimeout(function() {
      if (self.data.showPlayer && self.data.playerLoading && !self.data.playerLoadError) {
        self.setData({ playerLoadSlow: true });
      }
    }, 5000);
  },
  clearPlayerLoadTimer() {
    if (this.playerLoadTimer) {
      clearTimeout(this.playerLoadTimer);
      this.playerLoadTimer = null;
    }
    if (this.bufferNoticeTimer) {
      clearTimeout(this.bufferNoticeTimer);
      this.bufferNoticeTimer = null;
    }
  },
  noop() {},
  toggleFavorite(e) {
    var video = e.currentTarget.dataset.video;
    var prev = !!this.data.favorites[video.id];
    var key = "favorites." + video.id;
    this.setData({ [key]: !prev });
    try {
      userModule.setUserStorage("video_favorites", this.data.favorites);
      learningSyncModule.markDirty();
    } catch(e) {}
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
      var history = userModule.getUserStorage("learningHistory", []);
      var today = new Date().toDateString();
      var existingIndex = -1;
      for (var i = 0; i < history.length; i++) {
        if (history[i].itemId === itemId && history[i].type === type && new Date(history[i].timestamp).toDateString() === today) { existingIndex = i; break; }
      }
      if (existingIndex >= 0) { history[existingIndex].timestamp = new Date().toISOString(); }
      else { history.push({ type: type, title: title, itemId: itemId, timestamp: new Date().toISOString(), duration: 0 }); }
      if (history.length > 100) { history.splice(0, history.length - 100); }
      userModule.setUserStorage("learningHistory", history);
      learningSyncModule.markDirty();
    } catch (e) { console.error("记录学习历史失败:", e); }
  },
  updateLearningHistoryDuration(type, itemId, duration) {
    try {
      var history = userModule.getUserStorage("learningHistory", []);
      for (var i = history.length - 1; i >= 0; i--) {
        if (history[i].itemId === itemId && history[i].type === type) { history[i].duration = (history[i].duration || 0) + duration; break; }
      }
      userModule.setUserStorage("learningHistory", history);
      learningSyncModule.markDirty();
    } catch (e) { console.error("更新学习历史时长失败:", e); }
  }
});
