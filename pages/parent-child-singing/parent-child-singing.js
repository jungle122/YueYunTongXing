Page({
  data: {
    songs: [],
    displaySongs: [],
    audio: null,
    currentPlaying: null,
    playing: false,
    recorder: null,
    currentRecording: null,
    showRecordingModal: false,
    showRecordingComplete: false,
    recordingAudio: null,
    currentPlayingRecording: null,
    playingRecording: false,
    recordingsCache: {},
    recentRecordings: {},
    isSavingRecording: false,
    isLoadingAudio: false
  },
  onLoad() {
    this.initSongs();
    this.initAudio();
    this.initRecorder();
    this.loadRecordings();
  },
  onUnload() {
    if (this.data.audio) { try { this.data.audio.stop(); } catch(e) {} try { this.data.audio.destroy(); } catch(e) {} }
    if (this.data.recorder) { try { this.data.recorder.stop(); } catch(e) {} }
    if (this.data.recordingAudio) { try { this.data.recordingAudio.stop(); } catch(e) {} try { this.data.recordingAudio.destroy(); } catch(e) {} }
  },
  initSongs() {
    var songs = [
      { id: "song1", title: "小星星", description: "与家人一起唱粤语童谣", icon: "⭐", src: "https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/songs/song1.mp3", lyrics: ["一闪一闪小星星，","一闪一闪亮晶晶，","好似钻石天空高，","高高挂天空闪烁。"], tips: ["• 家长先示范一遍，让孩子跟唱","• 可以分角色演唱，增加趣味性","• 鼓励孩子大胆开口，不要怕出错"] },
      { id: "song22", title: "洗白白", description: "温馨的洗澡时光传唱", icon: "🛁", src: "https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/songs/song22.mp3", lyrics: ["洗白白，洗白白，","倒开盆水咯，快洗白白。","乖猪咪乱郁咋，听话唔好曳咯，","倒开盆水咯，快洗白白。"], tips: ["• 可以在洗澡时一起传唱","• 加入洗澡动作，增加趣味","• 让孩子养成良好卫生习惯"] },
      { id: "song21", title: "何家公鸡何家猜", description: "有趣的猜谜传唱游戏", icon: "🐓", src: "https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/songs/song21.mp3", lyrics: ["何家公鸡何家猜，","何家小鸡何家猜，","何家公鸡何家猜，","何家母鸡咯咯咯。"], tips: ["• 可以玩猜谜游戏","• 模仿鸡的叫声","• 增加互动性和趣味性"] },
      { id: "song20", title: "氹氹转", description: "快乐的旋转传唱", icon: "🎠", src: "https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/songs/song20.mp3", lyrics: ["氹氹转，菊花圆，","炒米饼，糯米团。","阿妈叫我睇龙船，","我唔睇，睇鸡仔。"], tips: ["• 可以手拉手转圈传唱","• 加入拍手节拍","• 体验传统粤语文化"] },
      { id: "song19", title: "落雨大", description: "雨天传唱的温馨时光", icon: "🌧️", src: "https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/songs/song19.mp3", lyrics: ["落雨大，水浸街，","阿哥担柴上街卖，","阿嫂出街着花鞋，","花鞋花袜花腰带。"], tips: ["• 雨天时传唱更有意境","• 可以模仿雨声","• 了解传统生活场景"] },
      { id: "song18", title: "月光光", description: "夜晚的温馨传唱", icon: "🌙", src: "https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/songs/song18.mp3", lyrics: ["月光光，照地堂，","虾仔你乖乖瞓落床。","听朝阿妈要赶插秧咯，","阿爷睇牛佢上山岗。"], tips: ["• 适合睡前传唱","• 营造温馨氛围","• 帮助孩子安静入睡"] },
      { id: "song6", title: "河边有只羊", description: "创造温馨的家庭传唱氛围", icon: "🐑", src: "https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/songs/song6.mp3", lyrics: ["河边有只羊，羊边有只象，","象边有只马骝仔，","好似你咁样。"], tips: ["• 选择合适的时间进行传唱","• 营造轻松愉快的氛围","• 记录美好的传唱时光"] }
    ];
    this.setData({ songs: songs });
    this.refreshDisplaySongs();
  },
  refreshDisplaySongs() {
    var self = this;
    var displaySongs = self.data.songs.map(function(song) {
      var s = JSON.parse(JSON.stringify(song));
      s.playBtnText = (self.data.currentPlaying === s.id && self.data.playing) ? "⏸️" : "▶️";
      s.isPlaying = self.data.currentPlaying === s.id && self.data.playing;
      s.recordBtnText = self.data.currentRecording === s.id ? "⏹️" : "🎙️";
      s.isRecording = self.data.currentRecording === s.id;
      s.replayBtnText = (self.data.currentPlayingRecording === s.id && self.data.playingRecording) ? "⏸️" : "▶️";
      s.isReplaying = self.data.currentPlayingRecording === s.id;
      return s;
    });
    this.setData({ displaySongs: displaySongs });
  },
  goBack() {
    if (this.data.audio) { try { this.data.audio.stop(); } catch(e) {} try { this.data.audio.destroy(); } catch(e) {} }
    wx.navigateBack({ fail: function() { wx.switchTab({ url: "/pages/learn/learn" }); } });
  },
  initAudio() {
    var self = this;
    try { if (typeof wx.setInnerAudioOption === "function") { wx.setInnerAudioOption({ obeyMuteSwitch: false, mixWithOther: true, speakerOn: true }); } } catch(e) {}
    if (self.data.audio) { try { self.data.audio.stop(); } catch(e) {} try { self.data.audio.destroy(); } catch(e) {} }
    var audio = wx.createInnerAudioContext();
    audio.obeyMuteSwitch = false; audio.volume = 1; audio.loop = false;
    audio._canplayHandled = false; audio._pendingPlay = false;
    audio.onPlay(function() { self.setData({ playing: true, isLoadingAudio: false }); audio._pendingPlay = false; self.refreshDisplaySongs(); });
    audio.onPause(function() { self.setData({ playing: false, isLoadingAudio: false }); self.refreshDisplaySongs(); });
    audio.onStop(function() { self.setData({ playing: false, currentPlaying: null, isLoadingAudio: false }); audio._pendingPlay = false; self.refreshDisplaySongs(); });
    audio.onEnded(function() { self.setData({ playing: false, currentPlaying: null, isLoadingAudio: false }); audio._pendingPlay = false; self.refreshDisplaySongs(); });
    audio.onCanplay(function() {
      if (audio._pendingPlay && !self.data.playing) {
        if (audio._canplayHandled) return;
        audio._canplayHandled = true;
        setTimeout(function() { try { if (audio._pendingPlay && !self.data.playing) { audio.play(); } } catch(err) { audio._pendingPlay = false; wx.showToast({ title: "播放失败", icon: "none" }); } }, 50);
      }
    });
    audio.onError(function(err) { console.error("音频播放错误:", err); audio._pendingPlay = false; audio._canplayHandled = false; self.setData({ isLoadingAudio: false, playing: false, currentPlaying: null }); wx.showToast({ title: "播放失败", icon: "none" }); self.refreshDisplaySongs(); });
    self.setData({ audio: audio });
  },
  initRecorder() {
    var self = this;
    self.setData({ recorder: wx.getRecorderManager() });
    self.data.recorder.onStart(function() { console.log("录音开始"); });
    self.data.recorder.onStop(function(res) {
      console.log("录音停止", res);
      var tempFilePath = res.tempFilePath;
      if (tempFilePath) {
        self.setData({ isSavingRecording: true });
        self.saveRecording(self.data.currentRecording, tempFilePath);
        try { self.setData({ ["recentRecordings." + self.data.currentRecording]: tempFilePath }); } catch(e) {}
        try { wx.setStorageSync("parent_child_recent_temp", self.data.recentRecordings); } catch(e) {}
        self.setData({ showRecordingModal: false, showRecordingComplete: true });
        setTimeout(function() { self.setData({ showRecordingComplete: false }); }, 2000);
      }
      self.setData({ currentRecording: null });
      self.refreshDisplaySongs();
    });
    self.data.recorder.onError(function(err) { console.error("录音错误:", err); wx.showToast({ title: "录音失败", icon: "none" }); self.setData({ currentRecording: null, showRecordingModal: false }); self.refreshDisplaySongs(); });
  },
  playSong(e) {
    var song = e.currentTarget.dataset.song;
    if (this.data.recordingAudio && this.data.playingRecording) { this.data.recordingAudio.pause(); this.setData({ playingRecording: false, currentPlayingRecording: null }); }
    if (this.data.currentPlaying === song.id && this.data.playing) { this.data.audio.pause(); return; }
    if (this.data.currentPlaying === song.id && !this.data.playing) { this.data.audio.play(); return; }
    var self = this;
    if (self.data.audio) { try { self.data.audio.stop(); } catch(e) {} }
    self.initAudio();
    self.setData({ currentPlaying: song.id, isLoadingAudio: true, playing: false });
    var base = "https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/songs";
    var normalizedId = (song.id || "").indexOf("song") === 0 ? song.id : "song" + song.id;
    var audioSrc = base + "/" + normalizedId + ".mp3";
    self.data.audio._pendingPlay = true;
    self.data.audio._canplayHandled = false;
    self.data.audio.src = audioSrc;
    self.refreshDisplaySongs();
    var canplayHandler = function() {
      if (self.data.audio && self.data.audio._pendingPlay) { self.data.audio._canplayHandled = true; try { self.data.audio.play(); } catch(e) {} }
      if (self.data.audio && typeof self.data.audio.offCanplay === "function") { try { self.data.audio.offCanplay(canplayHandler); } catch(e) {} }
    };
    if (typeof self.data.audio.onCanplay === "function") { self.data.audio.onCanplay(canplayHandler); }
    setTimeout(function() { if (self.data.audio && self.data.audio._pendingPlay && !self.data.playing) { try { self.data.audio.play(); } catch(e) {} } }, 120);
  },
  toggleRecording(e) {
    var song = e.currentTarget.dataset.song;
    if (this.data.currentRecording === song.id) { this.stopRecording(); return; }
    if (this.data.currentRecording) { this.stopRecording(); }
    var self = this;
    self.setData({ currentRecording: song.id, showRecordingModal: true });
    self.refreshDisplaySongs();
    try {
      var sys = wx.getSystemInfoSync();
      var isIOS = (sys.platform || "").toLowerCase() === "ios";
      self.data.recorder.start({ duration: 60000, sampleRate: isIOS ? 44100 : 16000, numberOfChannels: 1, encodeBitRate: isIOS ? 128000 : 96000, format: isIOS ? "aac" : "mp3" });
    } catch(e) { self.data.recorder.start({ duration: 60000, sampleRate: 16000, numberOfChannels: 1, encodeBitRate: 96000, format: "mp3" }); }
  },
  stopRecording() {
    if (this.data.recorder && this.data.currentRecording) { this.data.recorder.stop(); }
    this.setData({ currentRecording: null, showRecordingModal: false });
    this.refreshDisplaySongs();
  },
  playRecording(e) {
    var song = e.currentTarget.dataset.song;
    if (this.data.currentPlayingRecording === song.id && this.data.playingRecording) { if (this.data.recordingAudio) { this.data.recordingAudio.pause(); } return; }
    if (this.data.audio && this.data.playing) { this.data.audio.pause(); this.setData({ currentPlaying: null }); }
    var recordingPath = this.getRecordingPath(song.id);
    if (recordingPath) { this.doPlayRecording(song, recordingPath); }
    else { wx.showToast({ title: "没有找到录音", icon: "none" }); }
  },
  doPlayRecording(song, recordingPath) {
    var self = this;
    if (!self.data.recordingAudio) {
      var recAudio = wx.createInnerAudioContext();
      recAudio.obeyMuteSwitch = false; recAudio.volume = 1; recAudio.loop = false;
      recAudio._canplayHandled = false; recAudio._pendingPlay = false;
      recAudio.onPlay(function() { self.setData({ playingRecording: true }); recAudio._pendingPlay = false; self.refreshDisplaySongs(); });
      recAudio.onPause(function() { self.setData({ playingRecording: false }); self.refreshDisplaySongs(); });
      recAudio.onStop(function() { self.setData({ playingRecording: false, currentPlayingRecording: null }); recAudio._pendingPlay = false; self.refreshDisplaySongs(); });
      recAudio.onEnded(function() { self.setData({ playingRecording: false, currentPlayingRecording: null }); recAudio._pendingPlay = false; self.refreshDisplaySongs(); });
      recAudio.onError(function(err) { console.error("录音播放错误:", err); recAudio._pendingPlay = false; self.setData({ playingRecording: false, currentPlayingRecording: null }); wx.showToast({ title: "播放失败", icon: "none" }); self.refreshDisplaySongs(); });
      self.setData({ recordingAudio: recAudio });
    }
    self.setData({ currentPlayingRecording: song.id });
    self.data.recordingAudio._canplayHandled = false;
    self.data.recordingAudio._pendingPlay = true;
    self.data.recordingAudio.src = recordingPath;
    self.refreshDisplaySongs();
    setTimeout(function() { if (self.data.recordingAudio._pendingPlay && !self.data.playingRecording) { self.data.recordingAudio._canplayHandled = true; try { self.data.recordingAudio.play(); } catch(err) { wx.showToast({ title: "播放失败", icon: "none" }); } } }, 200);
  },
  saveRecording(songId, filePath) {
    var self = this;
    try {
      var fs = wx.getFileSystemManager ? wx.getFileSystemManager() : null;
      var useMp3 = filePath.toLowerCase().indexOf(".mp3") >= 0;
      if (fs) {
        try {
          wx.getFileInfo({ filePath: filePath, success: function() {
            wx.saveFile({ tempFilePath: filePath, success: function(res) {
              var sp = res.savedFilePath || filePath;
              self.setData({ ["recordingsCache." + songId]: sp });
              var recordings = wx.getStorageSync("parent_child_recordings") || {};
              recordings[songId] = sp;
              wx.setStorageSync("parent_child_recordings", recordings);
              self.setData({ isSavingRecording: false });
            }, fail: function() { self.setData({ ["recordingsCache." + songId]: filePath }); self.setData({ isSavingRecording: false }); } });
          }, fail: function() { self.setData({ isSavingRecording: false }); } });
        } catch(e) { self.setData({ isSavingRecording: false }); }
      } else {
        wx.saveFile({ tempFilePath: filePath, success: function(res) {
          var sp = res.savedFilePath || filePath;
          self.setData({ ["recordingsCache." + songId]: sp });
          var recordings = wx.getStorageSync("parent_child_recordings") || {};
          recordings[songId] = sp;
          wx.setStorageSync("parent_child_recordings", recordings);
          self.setData({ isSavingRecording: false });
        }, fail: function() { self.setData({ isSavingRecording: false }); } });
      }
    } catch(e) { console.error("保存录音失败:", e); }
  },
  getRecordingPath(songId) {
    try {
      if (this.data.recordingsCache && this.data.recordingsCache[songId]) return this.data.recordingsCache[songId];
      var recordings = wx.getStorageSync("parent_child_recordings") || {};
      if (recordings[songId]) return recordings[songId];
      return null;
    } catch(e) { return null; }
  },
  loadRecordings() {}
});
