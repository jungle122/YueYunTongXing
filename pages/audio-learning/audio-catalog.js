var AUDIO_BASE_URL = "https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/songs/";

var songs = [
  {
    id: "song1",
    title: "小星星",
    lesson: "第一课",
    themeClass: "theme-stars",
    backgroundImage: "/static/ui/learn/小星星.jpg",
    lyrics: ["一闪一闪小星星，", "一闪一闪亮晶晶，", "好似钻石天空高，", "高高挂天空闪烁。"],
    tips: ["家长先唱一遍，让孩子分句跟唱", "可以一边指星星，一边感受歌词画面", "鼓励孩子大胆开口，不用担心唱错"]
  },
  {
    id: "song2",
    title: "三只小猪",
    lesson: "第二课",
    themeClass: "theme-piglets",
    backgroundImage: "/static/ui/learn/三只小猪.jpg",
    lyrics: ["三只小猪，三只小猪，", "一间屋，起得好坚固。", "大猪呀，起间屋，用茅草，", "大野狼一到，呼呼声吹跌。"],
    tips: ["先听清三只小猪的角色变化", "可以和孩子分角色轮流演唱", "唱到重复句时一起拍手打节拍"]
  },
  {
    id: "song3",
    title: "小小姑娘",
    lesson: "第三课",
    themeClass: "theme-girl",
    backgroundImage: "/static/ui/learn/小小姑娘.jpg",
    lyrics: ["小小姑娘，清早起床，", "提着花篮上市场，", "穿过大街走进小巷。"],
    tips: ["边唱边做提花篮和走路的动作", "家长可以放慢速度带孩子分句跟唱", "唱完后聊聊清早出门会看到什么"]
  },
  {
    id: "song4",
    title: "小鸭学游泳",
    lesson: "第四课",
    themeClass: "theme-duck",
    backgroundImage: "/static/ui/learn/小鸭学游泳.jpg",
    lyrics: ["呷呷呷，妈妈说道，", "看着湖上水花惊怕了。", "大着那胆儿，努力游啊，", "你不必怕怕。"],
    tips: ["可以模仿小鸭划水的动作", "在重复的呷呷声中练习节拍", "用鼓励的语气唱出勇敢尝试的感觉"]
  },
  {
    id: "song5",
    title: "花 树 草",
    lesson: "第五课",
    themeClass: "theme-garden",
    backgroundImage: "/static/ui/learn/花树草.jpg",
    lyrics: ["青草处处，多么轻软", "小心青草，不要踩断。", "树木高高，多么壮健，", "绿叶遮荫香风送。"],
    tips: ["指着身边的花、树、草边认边唱", "每句唱完让孩子说出一种植物", "户外传唱时一起练习爱护花草"]
  },
  {
    id: "song6",
    title: "河边有只羊",
    lesson: "第六课",
    themeClass: "theme-river",
    backgroundImage: "/static/ui/learn/河边有只羊.jpg",
    lyrics: ["河边有只羊，羊边有只象，", "象边有只马骝仔，", "好似你咁样。"],
    tips: ["选择轻松的时间和孩子一起唱", "唱到动物时可以模仿它们的动作", "录下不同家庭成员的传唱版本"]
  },
  {
    id: "song18",
    title: "月光光",
    lesson: "第七课",
    themeClass: "theme-moon",
    backgroundImage: "/static/ui/learn/月光光.jpg",
    lyrics: ["月光光，照地堂，", "虾仔你乖乖瞓落床。", "听朝阿妈要赶插秧啰，", "阿爷睇牛佢上山岗喔。"],
    tips: ["适合睡前轻声传唱", "放慢速度，营造安静温馨的氛围", "可以和孩子聊聊歌词里的旧时生活"]
  },
  {
    id: "song23",
    title: "齐齐望过去",
    lesson: "第十二课",
    themeClass: "theme-look",
    backgroundImage: "/static/ui/learn/齐齐望过去.jpg",
    lyrics: ["齐齐望过去，", "有个风筝在飞。", "蓝天白云下面，", "小朋友们笑嘻嘻。"],
    tips: ["和孩子一起找歌词里的元素", "可以画一画歌词中的画面", "适合户外活动时传唱"]
  },
  {
    id: "song19",
    title: "落雨大",
    lesson: "第八课",
    themeClass: "theme-rain",
    backgroundImage: "/static/ui/learn/落雨大.jpg",
    lyrics: ["落雨大，水浸街，", "阿哥担柴上街卖，", "阿嫂出街着花鞋。", "花鞋花袜花腰带。"],
    tips: ["雨天传唱更容易感受歌曲画面", "可以用拍手或轻敲桌面模仿雨声", "唱完后找一找歌词中的传统生活场景"]
  },
  {
    id: "song20",
    title: "氹氹转",
    lesson: "第九课",
    themeClass: "theme-circle",
    backgroundImage: "/static/ui/learn/氹氹转.jpg",
    lyrics: ["氹氹转，菊花圆，", "炒米饼，糯米团。", "阿妈叫我睇龙船，", "我唔，睇鸡仔。"],
    tips: ["可以手拉手轻轻转圈传唱", "在每句结尾加入拍手节拍", "和孩子找一找歌词里的岭南事物"]
  },
  {
    id: "song21",
    title: "何家公鸡何家猜",
    lesson: "第十课",
    themeClass: "theme-rooster",
    backgroundImage: "/static/ui/learn/何家公鸡何家猜.jpg",
    lyrics: ["何家公鸡何家猜，", "何家小鸡何家猜，", "何家公鸡何家猜，", "何家母鸡咯嗒嗒。"],
    tips: ["可以把传唱变成轮流猜谜游戏", "一起模仿公鸡和母鸡的叫声", "家长唱前半句，让孩子接后半句"]
  },
  {
    id: "song22",
    title: "洗白白",
    lesson: "第十一课",
    themeClass: "theme-bath",
    backgroundImage: "/static/ui/learn/洗白白.jpg",
    lyrics: ["洗白白，洗白白，", "倒开盆水啰，洗白白。", "个身白白似雪花，", "倒开盆水啰，洗白白。"],
    tips: ["可以在洗澡前后一起传唱", "配合洗手、擦脸等动作增加趣味", "用歌曲帮助孩子养成卫生习惯"]
  }
];

songs.forEach(function(song) {
  song.audioSrc = AUDIO_BASE_URL + song.id + ".mp3";
});

function getSongs() {
  return songs.map(function(song) {
    return Object.assign({}, song, { lyrics: song.lyrics.slice(), tips: song.tips.slice() });
  });
}

function getSongById(id) {
  var song = songs.find(function(item) { return item.id === id; });
  return song ? Object.assign({}, song, { lyrics: song.lyrics.slice(), tips: song.tips.slice() }) : null;
}

module.exports = {
  getSongs: getSongs,
  getSongById: getSongById
};
