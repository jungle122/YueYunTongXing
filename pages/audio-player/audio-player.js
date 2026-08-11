var audioCatalog = require("../audio-learning/audio-catalog.js");
var userModule = require("../../utils/user.js");
var learningSyncModule = require("../../utils/learning-sync.js");

Page({
  data: {
    song: null,
    audio: null,
    playing: false,
    isLoading: false,
    isLiked: false,
    currentTime: 0,
    duration: 0,
    currentTimeText: "00:00",
    durationText: "--:--",
    progress: 0,
    playStartedAt: 0,
    singingTips: [],
    recorder: null,
    isRecording: false,
    showRecordingModal: false,
    showRecordingComplete: false,
    recordingAudio: null,
    playingRecording: false,
    hasRecording: false,
    isSavingRecording: false,
    loadError: ""
  },

  onLoad(options) {
    var songId = options && options.itemId ? decodeURIComponent(options.itemId) : "song18";
    this.currentSongId = songId;
    this.initRecorder();
    this.loadSong(songId);
  },

  async loadSong(songId, force) {
    this.setData({ isLoading: true, loadError: "" });
    try {
      await audioCatalog.loadCloudSources(!!force);
    } catch (error) {
      console.error("加载音频资源失败:", error);
      this.setData({
        isLoading: false,
        loadError: error && error.message ? error.message : "音频服务暂时不可用，请稍后重试"
      });
      return;
    }

    var song = audioCatalog.getSongById(songId) || audioCatalog.getSongs()[0];
    if (!song || !song.audioSrc) {
      this.setData({ isLoading: false, loadError: "音频资源暂时不可用，请稍后重试" });
      return;
    }
    var likes = userModule.getUserStorage("audio_likes", {});
    var progressMap = userModule.getUserStorage("audio_progress", {});
    var progress = Number(progressMap[song.id]) || 0;

    this.setData({
      song: song,
      isLiked: !!likes[song.id],
      progress: Math.max(0, Math.min(100, progress)),
      singingTips: song.tips || [],
      hasRecording: !!this.getRecordingPath(song.id)
    });
    this.initAudio(song);
  },

  retryAudioMedia() {
    this.loadSong(this.currentSongId || "song18", true);
  },

  onHide() {
    if (this.data.audio && this.data.playing) {
      this.data.audio.pause();
    }
    if (this.data.recordingAudio && this.data.playingRecording) {
      this.data.recordingAudio.pause();
    }
    if (this.data.recorder && this.data.isRecording) {
      this.stopRecording();
    }
  },

  onUnload() {
    this.disposeAudio();
    this.disposeRecordingAudio();
    if (this.data.recorder && this.data.isRecording) {
      try { this.data.recorder.stop(); } catch (e) {}
    }
  },

  initAudio(song) {
    var self = this;
    var audio = wx.createInnerAudioContext();
    audio.volume = 1;
    audio.loop = false;
    audio._restoredPosition = false;

    audio.onCanplay(function() {
      setTimeout(function() {
        if (!self.data.audio) return;
        var duration = Number(audio.duration) || 0;
        self.setData({
          isLoading: false,
          duration: duration,
          durationText: self.formatTime(duration)
        });
        if (!audio._restoredPosition && duration > 0 && self.data.progress > 0 && self.data.progress < 100) {
          audio._restoredPosition = true;
          try { audio.seek(duration * self.data.progress / 100); } catch (e) {}
        }
      }, 120);
    });

    audio.onPlay(function() {
      self.setData({ playing: true, isLoading: false, playStartedAt: Date.now() });
      self.recordLearningHistory();
    });

    audio.onPause(function() {
      self.commitListeningDuration();
      self.persistProgress(self.data.progress);
      self.setData({ playing: false, isLoading: false });
    });

    audio.onStop(function() {
      self.commitListeningDuration();
      self.persistProgress(self.data.progress);
      self.setData({ playing: false, isLoading: false });
    });

    audio.onEnded(function() {
      self.commitListeningDuration();
      self.persistProgress(100);
      self.setData({
        playing: false,
        isLoading: false,
        currentTime: 0,
        currentTimeText: "00:00",
        progress: 100
      });
    });

    audio.onTimeUpdate(function() {
      var duration = Number(audio.duration) || self.data.duration || 0;
      var currentTime = Number(audio.currentTime) || 0;
      var progress = duration > 0 ? Math.min(100, Math.round(currentTime / duration * 100)) : 0;
      self.setData({
        currentTime: currentTime,
        duration: duration,
        currentTimeText: self.formatTime(currentTime),
        durationText: duration > 0 ? self.formatTime(duration) : "--:--",
        progress: progress
      });
    });

    audio.onError(function(error) {
      console.error("音频播放失败:", error);
      self.setData({ playing: false, isLoading: false });
      wx.showToast({ title: "音频暂时无法播放", icon: "none" });
    });

    audio.src = song.audioSrc;
    this.setData({ audio: audio });
  },

  togglePlay() {
    var audio = this.data.audio;
    if (!audio) return;
    if (this.data.isRecording) {
      wx.showToast({ title: "请先结束当前录音", icon: "none" });
      return;
    }
    if (this.data.recordingAudio && this.data.playingRecording) {
      this.data.recordingAudio.pause();
    }
    if (this.data.playing) {
      audio.pause();
      return;
    }
    this.setData({ isLoading: true });
    try { audio.play(); } catch (e) {
      this.setData({ isLoading: false });
    }
  },

  playPrevious() {
    this.openAdjacentSong(-1);
  },

  playNext() {
    this.openAdjacentSong(1);
  },

  openAdjacentSong(offset) {
    if (!this.data.song) return;
    var songs = audioCatalog.getSongs();
    var currentId = this.data.song.id;
    var currentIndex = songs.findIndex(function(item) {
      return item.id === currentId;
    });
    if (currentIndex < 0) return;
    var nextSong = songs[(currentIndex + offset + songs.length) % songs.length];
    this.disposeAudio();
    this.disposeRecordingAudio();
    wx.redirectTo({
      url: "/pages/audio-player/audio-player?itemId=" + encodeURIComponent(nextSong.id)
    });
  },

  handleSliderChange(event) {
    this.seekTo(Number(event.detail.value) || 0);
  },

  seekTo(seconds) {
    if (!this.data.audio) return;
    try { this.data.audio.seek(seconds); } catch (e) {}
    var duration = this.data.duration || 0;
    var progress = duration > 0 ? Math.min(100, Math.round(seconds / duration * 100)) : 0;
    this.setData({
      currentTime: seconds,
      currentTimeText: this.formatTime(seconds),
      progress: progress
    });
    this.persistProgress(progress);
  },

  toggleLike() {
    var song = this.data.song;
    if (!song) return;
    var likes = userModule.getUserStorage("audio_likes", {});
    var nextLiked = !this.data.isLiked;
    likes[song.id] = nextLiked;
    userModule.setUserStorage("audio_likes", likes);
    learningSyncModule.markDirty();
    this.setData({ isLiked: nextLiked });
    wx.showToast({ title: nextLiked ? "已收藏这首歌" : "已取消收藏", icon: "none" });
  },

  initRecorder() {
    var self = this;
    var recorder = wx.getRecorderManager();
    recorder.onStop(function(result) {
      var filePath = result && result.tempFilePath;
      self.setData({ isRecording: false, showRecordingModal: false });
      if (!filePath || !self.data.song) return;
      self.setData({ isSavingRecording: true });
      self.saveRecording(self.data.song.id, filePath);
    });
    recorder.onError(function(error) {
      console.error("录音失败:", error);
      self.setData({ isRecording: false, showRecordingModal: false, isSavingRecording: false });
      wx.showToast({ title: "录音失败，请稍后重试", icon: "none" });
    });
    this.setData({ recorder: recorder });
  },

  toggleRecording() {
    if (!this.data.recorder) return;
    if (this.data.isRecording) {
      this.stopRecording();
      return;
    }
    if (this.data.audio && this.data.playing) this.data.audio.pause();
    if (this.data.recordingAudio && this.data.playingRecording) this.data.recordingAudio.pause();
    this.setData({ isRecording: true, showRecordingModal: true });
    try {
      var systemInfo = wx.getSystemInfoSync();
      var isIOS = (systemInfo.platform || "").toLowerCase() === "ios";
      this.data.recorder.start({
        duration: 60000,
        sampleRate: isIOS ? 44100 : 16000,
        numberOfChannels: 1,
        encodeBitRate: isIOS ? 128000 : 96000,
        format: isIOS ? "aac" : "mp3"
      });
    } catch (e) {
      this.data.recorder.start({ duration: 60000, sampleRate: 16000, numberOfChannels: 1, encodeBitRate: 96000, format: "mp3" });
    }
  },

  stopRecording() {
    if (!this.data.recorder || !this.data.isRecording) return;
    try { this.data.recorder.stop(); } catch (e) {
      this.setData({ isRecording: false, showRecordingModal: false });
    }
  },

  noop() {},

  playRecording() {
    if (!this.data.song || this.data.isRecording) {
      if (this.data.isRecording) wx.showToast({ title: "请先结束当前录音", icon: "none" });
      return;
    }
    if (this.data.recordingAudio && this.data.playingRecording) {
      this.data.recordingAudio.pause();
      return;
    }
    var recordingPath = this.getRecordingPath(this.data.song.id);
    if (!recordingPath) {
      wx.showToast({ title: "还没有录音，先唱一遍吧", icon: "none" });
      return;
    }
    if (this.data.audio && this.data.playing) this.data.audio.pause();
    this.playRecordingFile(recordingPath);
  },

  playRecordingFile(filePath) {
    var self = this;
    if (!this.data.recordingAudio) {
      var recordingAudio = wx.createInnerAudioContext();
      recordingAudio.volume = 1;
      recordingAudio.loop = false;
      recordingAudio.onPlay(function() { self.setData({ playingRecording: true }); });
      recordingAudio.onPause(function() { self.setData({ playingRecording: false }); });
      recordingAudio.onStop(function() { self.setData({ playingRecording: false }); });
      recordingAudio.onEnded(function() { self.setData({ playingRecording: false }); });
      recordingAudio.onError(function(error) {
        console.error("回听录音失败:", error);
        self.setData({ playingRecording: false });
        wx.showToast({ title: "录音暂时无法播放", icon: "none" });
      });
      this.setData({ recordingAudio: recordingAudio });
    }
    this.data.recordingAudio.src = filePath;
    try { this.data.recordingAudio.play(); } catch (e) {
      wx.showToast({ title: "录音暂时无法播放", icon: "none" });
    }
  },

  saveRecording(songId, filePath) {
    var self = this;
    wx.saveFile({
      tempFilePath: filePath,
      success: function(result) {
        var savedPath = result.savedFilePath || filePath;
        var recordings = wx.getStorageSync("parent_child_recordings") || {};
        recordings[songId] = savedPath;
        wx.setStorageSync("parent_child_recordings", recordings);
        self.setData({
          hasRecording: true,
          isSavingRecording: false,
          showRecordingComplete: true
        });
        setTimeout(function() { self.setData({ showRecordingComplete: false }); }, 2000);
      },
      fail: function(error) {
        console.error("保存录音失败:", error);
        self.setData({ isSavingRecording: false });
        wx.showToast({ title: "录音保存失败", icon: "none" });
      }
    });
  },

  getRecordingPath(songId) {
    try {
      var recordings = wx.getStorageSync("parent_child_recordings") || {};
      return recordings[songId] || "";
    } catch (e) {
      return "";
    }
  },

  disposeRecordingAudio() {
    if (!this.data.recordingAudio) return;
    try { this.data.recordingAudio.stop(); } catch (e) {}
    try { this.data.recordingAudio.destroy(); } catch (e) {}
    this.setData({ recordingAudio: null, playingRecording: false });
  },

  disposeAudio() {
    if (!this.data.audio) return;
    this.commitListeningDuration();
    this.persistProgress(this.data.progress);
    try { this.data.audio.stop(); } catch (e) {}
    try { this.data.audio.destroy(); } catch (e) {}
    this.setData({ audio: null, playing: false, isLoading: false });
  },

  persistProgress(progress) {
    if (!this.data.song) return;
    var progressMap = userModule.getUserStorage("audio_progress", {});
    progressMap[this.data.song.id] = Math.max(0, Math.min(100, Math.round(progress || 0)));
    userModule.setUserStorage("audio_progress", progressMap);
    learningSyncModule.markDirty();
  },

  formatTime(seconds) {
    var total = Math.max(0, Math.floor(Number(seconds) || 0));
    var minutes = Math.floor(total / 60);
    var remainSeconds = total % 60;
    return (minutes < 10 ? "0" : "") + minutes + ":" + (remainSeconds < 10 ? "0" : "") + remainSeconds;
  },

  recordLearningHistory() {
    var song = this.data.song;
    if (!song) return;
    try {
      var history = userModule.getUserStorage("learningHistory", []);
      var today = new Date().toDateString();
      var existingIndex = -1;
      for (var i = 0; i < history.length; i++) {
        if (history[i].itemId === song.id && history[i].type === "audio" && new Date(history[i].timestamp).toDateString() === today) {
          existingIndex = i;
          break;
        }
      }
      if (existingIndex >= 0) {
        history[existingIndex].timestamp = new Date().toISOString();
      } else {
        history.push({ type: "audio", title: song.title, itemId: song.id, timestamp: new Date().toISOString(), duration: 0 });
      }
      if (history.length > 100) history.splice(0, history.length - 100);
      userModule.setUserStorage("learningHistory", history);
      learningSyncModule.markDirty();
    } catch (e) {
      console.error("记录学习历史失败:", e);
    }
  },

  commitListeningDuration() {
    if (!this.data.song || !this.data.playStartedAt) return;
    var seconds = Math.max(0, Math.floor((Date.now() - this.data.playStartedAt) / 1000));
    this.setData({ playStartedAt: 0 });
    if (!seconds) return;
    try {
      var history = userModule.getUserStorage("learningHistory", []);
      for (var i = history.length - 1; i >= 0; i--) {
        if (history[i].itemId === this.data.song.id && history[i].type === "audio") {
          history[i].duration = (history[i].duration || 0) + seconds;
          break;
        }
      }
      userModule.setUserStorage("learningHistory", history);
      learningSyncModule.markDirty();
    } catch (e) {
      console.error("更新学习时长失败:", e);
    }
  }
});
