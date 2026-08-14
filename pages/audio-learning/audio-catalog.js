var AUDIO_GROUP_ID = "audio-lessons";
var TEMP_URL_REFRESH_INTERVAL = 90 * 60 * 1000;
var AVAILABLE_SONG_IDS = ["song18", "song19", "song20", "song21", "song22", "song23"];
var GAME_SONG_IDS = ["song24", "song25", "song26", "song27", "song28"];
var MEDIA_AUDIO_IDS = AVAILABLE_SONG_IDS.concat(GAME_SONG_IDS);
var audioSourceMap = {};
var sourceLoadedAt = 0;
var sourceLoadPromise = null;
var GAME_EFFECT_SOURCES = {
  select: "/static/audio/game/select.wav",
  correct: "/static/audio/game/correct.wav",
  wrong: "/static/audio/game/wrong.wav",
  complete: "/static/audio/game/complete.wav"
};

var songs = [
  {
    id: "song18",
    title: "月光光",
    lesson: "第一课",
    themeClass: "theme-moon",
    backgroundImage: "/static/ui/learn/月光光.jpg",
    lyrics: ["月光光，照地堂", "虾仔你乖乖瞓落床", "听朝阿妈要赶插秧啰", "阿爷睇牛佢上山岗喔", "虾仔你快高长大喔", "帮手阿爷去睇牛羊喔", "", "月光光，照地堂", "虾仔你乖乖瞓落床", "听朝阿爸要捕鱼虾啰", "阿嫲织网要织到天光哦", "虾仔你快高长大啰", "划艇撒网就更在行哦"],
    tips: ["适合睡前轻声传唱", "放慢速度，营造安静温馨的氛围", "可以和孩子聊聊歌词里的旧时生活"]
  },
  {
    id: "song23",
    title: "齐齐望过去",
    lesson: "第六课",
    themeClass: "theme-look",
    backgroundImage: "/static/ui/learn/齐齐望过去.jpg",
    lyrics: ["齐齐望过去，清溪里有只青蛙想跳水", "齐齐望过去，小屋里有只猪仔真风趣", "有只了哥，吱吱喳喳想驳嘴", "齐齐望过去，山窿里面有只狮子竟饮醉"],
    tips: ["和孩子一起找歌词里的元素", "可以画一画歌词中的画面", "适合户外活动时传唱"]
  },
  {
    id: "song19",
    title: "落雨大",
    lesson: "第二课",
    themeClass: "theme-rain",
    backgroundImage: "/static/ui/learn/落雨大.jpg",
    lyrics: ["落雨大，水浸街", "阿哥担柴上街卖", "阿嫂出街着花鞋", "花鞋、花袜、花腰带", "珍珠蝴蝶两边排"],
    tips: ["雨天传唱更容易感受歌曲画面", "可以用拍手或轻敲桌面模仿雨声", "唱完后找一找歌词中的传统生活场景"]
  },
  {
    id: "song20",
    title: "氹氹转",
    lesson: "第三课",
    themeClass: "theme-circle",
    backgroundImage: "/static/ui/learn/氹氹转.jpg",
    lyrics: ["氹氹转，菊花园", "炒米饼，糯米团", "五月初五系龙舟节呀", "阿妈叫我去睇龙船", "我唔睇，睇鸡仔", "鸡仔大，拎去卖", "卖得几多钱？", "卖得五百钱", "卖咗钱来起花园", "", "我有只风车仔，佢转得好好睇", "睇佢氹氹转呀菊花园", "睇佢氹氹转，氹氹转又转"],
    tips: ["可以手拉手轻轻转圈传唱", "在每句结尾加入拍手节拍", "和孩子找一找歌词里的岭南事物"]
  },
  {
    id: "song21",
    title: "何家公鸡何家猜",
    lesson: "第四课",
    themeClass: "theme-rooster",
    backgroundImage: "/static/ui/learn/何家公鸡何家猜.jpg",
    lyrics: ["真怪诞呀又有趣", "你望望公园里", "有四百只鸡鸡咯咯咯", "是何家的不知道", "", "何家公鸡何家猜", "何家小鸡何家猜", "何家公鸡何家猜", "何家母鸡咯咯咯", "", "猴子哥哥熊先生", "松鼠妹妹牛叔叔", "黄狗爸爸羊妈妈", "来猜来猜唷"],
    tips: ["可以把传唱变成轮流猜谜游戏", "一起模仿公鸡和母鸡的叫声", "家长唱前半句，让孩子接后半句"]
  },
  {
    id: "song22",
    title: "洗白白",
    lesson: "第五课",
    themeClass: "theme-bath",
    backgroundImage: "/static/ui/learn/洗白白.jpg",
    lyrics: ["洗白白，洗白白，人人话我好宝宝。", "洗白白，洗白白，肥皂都香滑。", "虱乸虱乸人害怕，", "污糟邋遢实太差。", "洗白白，洗白白，才是好小孩。"],
    tips: ["可以在洗澡前后一起传唱", "配合洗手、擦脸等动作增加趣味", "用歌曲帮助孩子养成卫生习惯"]
  }
];

function cloneSong(song) {
  return Object.assign({}, song, {
    audioSrc: audioSourceMap[song.id] || "",
    lyrics: song.lyrics.slice(),
    tips: song.tips.slice()
  });
}

function getSongs() {
  return AVAILABLE_SONG_IDS.map(function(id) {
    return songs.find(function(song) { return song.id === id; });
  }).filter(Boolean).map(function(song) {
    return cloneSong(song);
  });
}

function getSongById(id) {
  if (AVAILABLE_SONG_IDS.indexOf(id) === -1) return null;
  var song = songs.find(function(item) { return item.id === id; });
  return song ? cloneSong(song) : null;
}

function applyCloudItems(items) {
  var nextSourceMap = {};
  (items || []).forEach(function(item) {
    if (MEDIA_AUDIO_IDS.indexOf(item.id) !== -1 && item.url) {
      nextSourceMap[item.id] = item.url;
    }
  });
  var learningSourcesReady = AVAILABLE_SONG_IDS.every(function(id) {
    return !!nextSourceMap[id];
  });
  if (!learningSourcesReady) {
    throw new Error("部分音频资源暂时不可用");
  }
  audioSourceMap = nextSourceMap;
  sourceLoadedAt = Date.now();
}

async function loadCloudSources(force) {
  if (!force && sourceLoadedAt && Date.now() - sourceLoadedAt < TEMP_URL_REFRESH_INTERVAL) {
    return getSongs();
  }
  if (sourceLoadPromise) return sourceLoadPromise;

  sourceLoadPromise = wx.cloud.callFunction({
    name: "getMediaAssets",
    data: { mediaType: "audio", groupId: AUDIO_GROUP_ID }
  }).then(function(response) {
    var result = response && response.result;
    if (!result || !result.ok) {
      throw new Error(result && result.message ? result.message : "音频服务暂时不可用");
    }
    var group = (result.groups || [])[0];
    if (!group) throw new Error("暂时没有可用的音频资源");
    applyCloudItems(group.items);
    return getSongs();
  });

  try {
    return await sourceLoadPromise;
  } finally {
    sourceLoadPromise = null;
  }
}

function safeStopAndDestroy(audio) {
  if (!audio) return;
  try { audio.stop(); } catch (error) {}
  try { audio.destroy(); } catch (error) {}
}

function createGameAudio(options) {
  options = options || {};
  var musicAudio = null;
  var effectAudio = null;
  var currentSongId = "";
  var musicRequested = false;
  var pageVisible = true;
  var destroyed = false;
  var loadToken = 0;
  var musicState = {
    available: false,
    playing: false,
    loading: false,
    currentTime: 0,
    duration: 0
  };

  function notifyMusicState(changes) {
    if (destroyed) return;
    musicState = Object.assign({}, musicState, changes || {});
    if (typeof options.onMusicStateChange === "function") {
      options.onMusicStateChange(Object.assign({}, musicState));
    }
  }

  function ensureEffectAudio() {
    if (effectAudio || destroyed) return effectAudio;
    effectAudio = wx.createInnerAudioContext();
    effectAudio.volume = 0.72;
    effectAudio.loop = false;
    effectAudio.onError(function(error) {
      if (!destroyed) console.error("播放游戏音效失败:", error);
    });
    return effectAudio;
  }

  function playEffect(name) {
    if (!pageVisible || destroyed || !GAME_EFFECT_SOURCES[name]) return;
    var audio = ensureEffectAudio();
    if (!audio) return;
    try { audio.stop(); } catch (error) {}
    audio.src = GAME_EFFECT_SOURCES[name];
    try { audio.play(); } catch (error) {}
  }

  async function playMusic(songId) {
    loadToken += 1;
    var token = loadToken;
    currentSongId = songId || "";
    musicRequested = !!songId;
    safeStopAndDestroy(musicAudio);
    musicAudio = null;
    notifyMusicState({
      available: !!songId,
      playing: false,
      loading: !!songId,
      currentTime: 0,
      duration: 0
    });
    if (!songId || destroyed) return false;

    try {
      await loadCloudSources();
      if (destroyed || token !== loadToken || currentSongId !== songId) return false;
      var audioSrc = audioSourceMap[songId];
      if (!audioSrc) {
        notifyMusicState({ available: false, loading: false });
        return false;
      }
      var audio = wx.createInnerAudioContext();
      audio.volume = 0.2;
      audio.loop = true;
      audio.onCanplay(function() {
        if (destroyed || audio !== musicAudio) return;
        notifyMusicState({
          available: true,
          loading: false,
          duration: Number(audio.duration) || musicState.duration || 0
        });
      });
      audio.onPlay(function() {
        if (destroyed || audio !== musicAudio) return;
        notifyMusicState({ playing: true, loading: false });
      });
      audio.onPause(function() {
        if (destroyed || audio !== musicAudio) return;
        notifyMusicState({ playing: false });
      });
      audio.onStop(function() {
        if (destroyed || audio !== musicAudio) return;
        notifyMusicState({ playing: false, currentTime: 0 });
      });
      audio.onTimeUpdate(function() {
        if (destroyed || audio !== musicAudio) return;
        notifyMusicState({
          currentTime: Number(audio.currentTime) || 0,
          duration: Number(audio.duration) || musicState.duration || 0
        });
      });
      audio.onWaiting(function() {
        if (destroyed || audio !== musicAudio) return;
        notifyMusicState({ loading: true });
      });
      audio.onError(function(error) {
        if (!destroyed) {
          notifyMusicState({ available: false, playing: false, loading: false });
          console.error("播放游戏童谣失败:", error);
        }
      });
      musicAudio = audio;
      audio.src = audioSrc;
      if (pageVisible && musicRequested) {
        try { audio.play(); } catch (error) {}
      }
      return true;
    } catch (error) {
      if (!destroyed && token === loadToken) {
        notifyMusicState({ available: false, playing: false, loading: false });
        console.error("加载游戏童谣失败:", error);
      }
      return false;
    }
  }

  function toggleMusic() {
    if (!musicAudio || !musicState.available || destroyed) return;
    if (musicState.playing || musicRequested) {
      musicRequested = false;
      try { musicAudio.pause(); } catch (error) {}
      notifyMusicState({ playing: false });
      return;
    }
    musicRequested = true;
    if (pageVisible) {
      try { musicAudio.play(); } catch (error) {}
    }
  }

  function seekMusic(seconds) {
    if (!musicAudio || !musicState.available || destroyed) return;
    var duration = Number(musicAudio.duration) || musicState.duration || 0;
    var target = Math.max(0, Number(seconds) || 0);
    if (duration > 0) target = Math.min(target, duration);
    try { musicAudio.seek(target); } catch (error) {}
    notifyMusicState({ currentTime: target, duration: duration });
  }

  function setPageVisible(visible) {
    pageVisible = !!visible;
    if (!pageVisible) {
      if (musicAudio) {
        try { musicAudio.pause(); } catch (error) {}
      }
      if (effectAudio) {
        try { effectAudio.stop(); } catch (error) {}
      }
      return;
    }
    if (musicAudio && musicRequested) {
      try { musicAudio.play(); } catch (error) {}
    }
  }

  function stopMusic() {
    loadToken += 1;
    currentSongId = "";
    musicRequested = false;
    safeStopAndDestroy(musicAudio);
    musicAudio = null;
    notifyMusicState({ available: false, playing: false, loading: false, currentTime: 0, duration: 0 });
  }

  function destroy() {
    destroyed = true;
    loadToken += 1;
    safeStopAndDestroy(musicAudio);
    safeStopAndDestroy(effectAudio);
    musicAudio = null;
    effectAudio = null;
  }

  return {
    playEffect: playEffect,
    playMusic: playMusic,
    toggleMusic: toggleMusic,
    seekMusic: seekMusic,
    setPageVisible: setPageVisible,
    stopMusic: stopMusic,
    destroy: destroy
  };
}

module.exports = {
  getSongs: getSongs,
  getSongById: getSongById,
  loadCloudSources: loadCloudSources,
  createGameAudio: createGameAudio
};
