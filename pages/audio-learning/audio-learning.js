Page({
  data: {
    songs: [],
    current: null,
    playing: false,
    isLoadingAudio: false,
    audio: null,
    likes: {},
    progressMap: {},
    lyricOpen: {},
    showToast: false,
    toastText: "",
    toastIcon: "",
    tapGuardTs: 0,
    playStartTime: null,
    playDuration: 0
  },
  onLoad() {
    this.initSongs();
    this.loadStorageData();
    this.initAudio();
  },
  onShow() {
    this.refreshSongsDisplay();
  },
  onUnload() {
    if (this.data.audio) {
      try { this.data.audio.stop(); } catch(e) {}
      try { this.data.audio.destroy(); } catch(e) {}
    }
  },
  goBack() {
    if (this.data.audio) {
      try { this.data.audio.stop(); } catch(e) {}
      try { this.data.audio.destroy(); } catch(e) {}
    }
    wx.navigateBack({ fail: function() { wx.switchTab({ url: "/pages/learn/learn" }); } });
  },
  refreshSongsDisplay() {
    var self = this;
    var songs = self.data.songs.map(function(song) {
      var s = JSON.parse(JSON.stringify(song));
      s.icon = self.getSongIcon(s.id);
      s.playBtnText = (self.data.current && self.data.current.id === s.id && (self.data.playing || self.data.isLoadingAudio)) ? "⏸️" : "▶️";
      s.isLiked = !!self.data.likes[s.id];
      s.likeText = s.isLiked ? "💖" : "❤️";
      s.lyricOpen = !!self.data.lyricOpen[s.id];
      s.lyricToggleText = s.lyricOpen ? "收起歌词" : "展开歌词";
      return s;
    });
    this.setData({ songs: songs });
  },
  initSongs() {
    var defaultSongs = [
      { id: "song1", title: "小星星", artist: "粤语童谣", lyrics: ["一闪一闪小星星，","一闪一闪亮晶晶，","好似钻石天空高，","高高挂天空闪烁。"] },
      { id: "song2", title: "三只小猪", artist: "粤语童谣", lyrics: ["三只小猪盖房子，","盖了砖头小房子。"] },
      { id: "song3", title: "小小姑娘", artist: "粤语童谣", lyrics: ["小小姑娘清早起床，","提着花篮上市场。"] },
      { id: "song4", title: "小鸭学游泳", artist: "粤语童谣", lyrics: ["小鸭子嘎嘎嘎，","摇摇摆摆下了河。"] },
      { id: "song5", title: "花 树 草", artist: "粤语童谣", lyrics: ["花儿红，树儿绿，","草儿青，鸟儿唱。"] },
      { id: "song6", title: "河边有只羊", artist: "粤语童谣", lyrics: ["河边有只羊，羊边有只象，","象边有只马骝仔，","好似你咁样。"] },
      { id: "song18", title: "月光光", artist: "粤语童谣", lyrics: ["月光光，照地堂，","虾仔你乖乖瞓落床。","听朝阿妈要赶插秧咯，","阿爷睇牛佢上山岗。"] },
      { id: "song19", title: "落雨大", artist: "粤语童谣", lyrics: ["落雨大，水浸街，","阿哥担柴上街卖，","阿嫂出街着花鞋，","花鞋花袜花腰带。"] },
      { id: "song20", title: "氹氹转", artist: "粤语童谣", lyrics: ["氹氹转，菊花圆，","炒米饼，糯米团。","阿妈叫我睇龙船，","我唔睇，睇鸡仔。"] },
      { id: "song21", title: "何家公鸡何家猜", artist: "粤语童谣", lyrics: ["何家公鸡何家猜，","何家小鸡何家猜，","何家公鸡何家猜，","何家母鸡咯咯咯。"] },
      { id: "song22", title: "洗白白", artist: "粤语童谣", lyrics: ["洗白白，洗白白，","倒开盆水咯，快洗白白。","乖猪咪乱郁咋，听话唔好曳咯，","倒开盆水咯，快洗白白。"] }
    ];
    this.setData({ songs: defaultSongs });
    this.refreshSongsDisplay();
  },
  loadStorageData() {
    try {
      var likes = wx.getStorageSync("audio_likes") || {};
      var prog = wx.getStorageSync("audio_progress") || {};
      var lyric = wx.getStorageSync("audio_lyric_open") || {};
      this.setData({ likes: likes, progressMap: prog, lyricOpen: lyric });
      this.refreshSongsDisplay();
    } catch (e) { console.error("加载存储数据失败:", e); }
  },
  initAudio() {
    var self = this;
    try {
      if (typeof wx.setInnerAudioOption === "function") {
        wx.setInnerAudioOption({ obeyMuteSwitch: false, mixWithOther: true, speakerOn: true });
      }
    } catch (e) {}
    if (self.data.audio) {
      try { self.data.audio.stop(); } catch(e) {}
      try { self.data.audio.destroy(); } catch(e) {}
    }
    var audio = wx.createInnerAudioContext();
    audio.obeyMuteSwitch = false;
    audio.volume = 1;
    audio.loop = false;
    audio._canplayHandled = false;
    audio._pendingPlay = false;
    audio.onPlay(function() {
      self.setData({ playing: true, isLoadingAudio: false, playStartTime: Date.now() });
      audio._pendingPlay = false;
      self.refreshSongsDisplay();
      if (self.data.current) { self.recordLearningHistory("audio", self.data.current.title, self.data.current.id); }
    });
    audio.onPause(function() {
      self.setData({ playing: false, isLoadingAudio: false });
      if (self.data.playStartTime) {
        self.setData({ playDuration: self.data.playDuration + Math.floor((Date.now() - self.data.playStartTime) / 1000), playStartTime: null });
      }
      self.refreshSongsDisplay();
    });
    audio.onStop(function() {
      self.setData({ playing: false, isLoadingAudio: false });
      audio._pendingPlay = false;
      if (self.data.playStartTime) {
        self.setData({ playDuration: self.data.playDuration + Math.floor((Date.now() - self.data.playStartTime) / 1000), playStartTime: null });
      }
      self.refreshSongsDisplay();
    });
    audio.onEnded(function() {
      self.setData({ playing: false, isLoadingAudio: false });
      audio._pendingPlay = false;
      if (self.data.playStartTime && self.data.current) {
        var duration = Math.floor((Date.now() - self.data.playStartTime) / 1000);
        self.setData({ playDuration: self.data.playDuration + duration, playStartTime: null });
        self.updateLearningHistoryDuration("audio", self.data.current.id, self.data.playDuration);
        self.setData({ playDuration: 0 });
      }
      if (self.data.current) { self.updateProgress(self.data.current, 100); }
      self.refreshSongsDisplay();
    });
    audio.onTimeUpdate(function() {
      if (!self.data.current) return;
      if (audio.duration > 0) {
        var percent = Math.min(100, Math.floor(audio.currentTime / audio.duration * 100));
        self.updateProgress(self.data.current, percent);
      }
    });
    audio.onError(function(err) {
      console.error("音频播放错误:", err);
      audio._pendingPlay = false;
      audio._canplayHandled = false;
      self.setData({ isLoadingAudio: false });
      wx.showToast({ title: "音频播放失败", icon: "none" });
      self.refreshSongsDisplay();
    });
    self.setData({ audio: audio });
  },
  getSongIcon(songId) {
    var map = { song1: "⭐", song2: "🐷", song3: "👧", song4: "🦆", song5: "🌸", song6: "🐑", song18: "🌙", song19: "🌧️", song20: "🌀", song21: "🐓", song22: "🚿" };
    return map[songId] || "🎵";
  },
  togglePlay(e) {
    var song = e.currentTarget.dataset.song;
    var now = Date.now();
    if (now - this.data.tapGuardTs < 300) return;
    this.setData({ tapGuardTs: now });
    var self = this;
    if (self.data.current && self.data.current.id === song.id && self.data.playing) { self.data.audio.pause(); return; }
    if (self.data.current && self.data.current.id === song.id && !self.data.playing) { self.data.audio.play(); return; }
    if (self.data.current && self.data.playStartTime) {
      var duration = Math.floor((Date.now() - self.data.playStartTime) / 1000);
      self.setData({ playDuration: self.data.playDuration + duration, playStartTime: null });
      self.updateLearningHistoryDuration("audio", self.data.current.id, self.data.playDuration);
      self.setData({ playDuration: 0 });
    } else if (self.data.current && self.data.playDuration > 0) {
      self.updateLearningHistoryDuration("audio", self.data.current.id, self.data.playDuration);
      self.setData({ playDuration: 0 });
    }
    if (self.data.audio) { try { self.data.audio.stop(); } catch(e) {} try { self.data.audio.destroy(); } catch(e) {} }
    self.initAudio();
    self.setData({ current: song });
    var base = "https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/songs";
    var normalizedId = (song.id || "").indexOf("song") === 0 ? song.id : "song" + song.id;
    var audioSrc = base + "/" + normalizedId + ".mp3";
    self.setData({ isLoadingAudio: true, playing: false });
    self.data.audio._canplayHandled = false;
    self.data.audio._pendingPlay = true;
    self.data.audio.src = audioSrc;
    self.refreshSongsDisplay();
    var canplayHandler = function() {
      if (self.data.audio && self.data.audio._pendingPlay) {
        self.data.audio._canplayHandled = true;
        try { self.data.audio.play(); } catch(e) {}
      }
      if (self.data.audio && typeof self.data.audio.offCanplay === "function") { try { self.data.audio.offCanplay(canplayHandler); } catch(e) {} }
    };
    if (typeof self.data.audio.onCanplay === "function") { self.data.audio.onCanplay(canplayHandler); }
    setTimeout(function() { if (self.data.audio && self.data.audio._pendingPlay && !self.data.playing) { try { self.data.audio.play(); } catch(e) {} } }, 120);
  },
  updateProgress(song, percent) {
    if (!song) return;
    var key = "progressMap." + song.id;
    this.setData({ [key]: percent });
    wx.setStorageSync("audio_progress", this.data.progressMap);
  },
  toggleLike(e) {
    var song = e.currentTarget.dataset.song;
    var cur = !!this.data.likes[song.id];
    var key = "likes." + song.id;
    this.setData({ [key]: !cur });
    wx.setStorageSync("audio_likes", this.data.likes);
    this.setData({ toastText: !cur ? "收藏成功" : "取消收藏", toastIcon: !cur ? "💖" : "❤️", showToast: true });
    this.refreshSongsDisplay();
    var self = this;
    setTimeout(function() { self.setData({ showToast: false }); }, 1500);
  },
  toggleLyric(e) {
    var song = e.currentTarget.dataset.song;
    var open = !!this.data.lyricOpen[song.id];
    var key = "lyricOpen." + song.id;
    this.setData({ [key]: !open });
    wx.setStorageSync("audio_lyric_open", this.data.lyricOpen);
    this.refreshSongsDisplay();
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
