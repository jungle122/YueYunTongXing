var AUDIO_GROUP_ID = "audio-lessons";
var TEMP_URL_REFRESH_INTERVAL = 90 * 60 * 1000;
var AVAILABLE_SONG_IDS = ["song18", "song19", "song20", "song21", "song22", "song23"];
var audioSourceMap = {};
var sourceLoadedAt = 0;
var sourceLoadPromise = null;

var songs = [
  {
    id: "song18",
    title: "月光光",
    lesson: "第一课",
    themeClass: "theme-moon",
    backgroundImage: "/static/ui/learn/月光光.jpg",
    lyrics: ["月光光，照地堂，", "虾仔你乖乖瞓落床。", "听朝阿妈要赶插秧啰，", "阿爷睇牛佢上山岗喔。"],
    tips: ["适合睡前轻声传唱", "放慢速度，营造安静温馨的氛围", "可以和孩子聊聊歌词里的旧时生活"]
  },
  {
    id: "song23",
    title: "齐齐望过去",
    lesson: "第六课",
    themeClass: "theme-look",
    backgroundImage: "/static/ui/learn/齐齐望过去.jpg",
    lyrics: ["齐齐望过去，", "有个风筝在飞。", "蓝天白云下面，", "小朋友们笑嘻嘻。"],
    tips: ["和孩子一起找歌词里的元素", "可以画一画歌词中的画面", "适合户外活动时传唱"]
  },
  {
    id: "song19",
    title: "落雨大",
    lesson: "第二课",
    themeClass: "theme-rain",
    backgroundImage: "/static/ui/learn/落雨大.jpg",
    lyrics: ["落雨大，水浸街，", "阿哥担柴上街卖，", "阿嫂出街着花鞋。", "花鞋花袜花腰带。"],
    tips: ["雨天传唱更容易感受歌曲画面", "可以用拍手或轻敲桌面模仿雨声", "唱完后找一找歌词中的传统生活场景"]
  },
  {
    id: "song20",
    title: "氹氹转",
    lesson: "第三课",
    themeClass: "theme-circle",
    backgroundImage: "/static/ui/learn/氹氹转.jpg",
    lyrics: ["氹氹转，菊花圆，", "炒米饼，糯米团。", "阿妈叫我睇龙船，", "我唔，睇鸡仔。"],
    tips: ["可以手拉手轻轻转圈传唱", "在每句结尾加入拍手节拍", "和孩子找一找歌词里的岭南事物"]
  },
  {
    id: "song21",
    title: "何家公鸡何家猜",
    lesson: "第四课",
    themeClass: "theme-rooster",
    backgroundImage: "/static/ui/learn/何家公鸡何家猜.jpg",
    lyrics: ["何家公鸡何家猜，", "何家小鸡何家猜，", "何家公鸡何家猜，", "何家母鸡咯嗒嗒。"],
    tips: ["可以把传唱变成轮流猜谜游戏", "一起模仿公鸡和母鸡的叫声", "家长唱前半句，让孩子接后半句"]
  },
  {
    id: "song22",
    title: "洗白白",
    lesson: "第五课",
    themeClass: "theme-bath",
    backgroundImage: "/static/ui/learn/洗白白.jpg",
    lyrics: ["洗白白，洗白白，", "倒开盆水啰，洗白白。", "个身白白似雪花，", "倒开盆水啰，洗白白。"],
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
    if (AVAILABLE_SONG_IDS.indexOf(item.id) !== -1 && item.url) {
      nextSourceMap[item.id] = item.url;
    }
  });
  if (Object.keys(nextSourceMap).length !== AVAILABLE_SONG_IDS.length) {
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

module.exports = {
  getSongs: getSongs,
  getSongById: getSongById,
  loadCloudSources: loadCloudSources
};
