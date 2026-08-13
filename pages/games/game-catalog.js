var audioCatalog = require("../audio-learning/audio-catalog.js");

var PICTURE_BOOK_GAME_GROUPS = [
  { groupId: "yueguang", songId: "song18", pageNumbers: [1, 2, 3, 4, 5, 7, 10, 11, 12], fallbackRatio: 1.5 },
  { groupId: "dangdang", songId: "song20", pageNumbers: [2, 3, 4, 5, 6, 8, 9, 10], fallbackRatio: 1.5 },
  { groupId: "qiqi", songId: "song23", pageNumbers: [1, 2, 3, 4, 5, 6, 7], fallbackRatio: 1.5 }
];

var EXTRA_SORT_PUZZLES = [
  {
    title: "拼出完整的童谣：有只雀仔跌落水",
    songId: "song24",
    pieces: ["有只雀仔跌落水", "跌落水，跌落水", "有只雀仔跌落水", "被水冲去"]
  },
  {
    title: "拼出完整的童谣：点虫虫",
    songId: "song25",
    pieces: [
      "点虫虫，虫虫飞",
      "飞来飞去似飞机",
      "一阵飞上天",
      "一阵飞落地",
      "荔枝熟，开飞机",
      "载满荔枝来探你",
      "大家都是老友记",
      "齐齐坐下吃佳果",
      "嘻嘻哈哈笑开眉"
    ]
  },
  {
    title: "拼出完整的童谣：排排坐",
    songId: "song26",
    pieces: ["排排坐，吃粉果", "猪拉柴，狗透火", "猫儿担凳，俾姑婆坐", "坐烂个凳柄，唔好赖我啵"]
  },
  {
    title: "拼出完整的童谣：打开蚊帐",
    songId: "song27",
    pieces: ["打开蚊帐，打开蚊帐", "有只蚊，有只蚊", "快啲攞把扇嚟，快啲攞把扇嚟", "拨走佢，拨走佢。"]
  },
  {
    title: "拼出完整的童谣：鸡公仔",
    songId: "song28",
    pieces: ["鸡公仔，尾婆娑", "三岁孩儿学唱歌", "唔使爹娘教导我", "自己精乖无奈何"]
  }
];

function shuffle(items) {
  var next = items.slice();
  for (var i = next.length - 1; i > 0; i--) {
    var randomIndex = Math.floor(Math.random() * (i + 1));
    var temporary = next[i];
    next[i] = next[randomIndex];
    next[randomIndex] = temporary;
  }
  return next;
}

function getLearningSongs() {
  return audioCatalog.getSongs();
}

function getSortPuzzles() {
  var learningPuzzles = getLearningSongs().map(function(song) {
    return {
      title: "拼出完整的童谣：" + song.title,
      songId: song.id,
      pieces: song.lyrics.filter(function(line) { return !!line; })
    };
  });
  return learningPuzzles.concat(EXTRA_SORT_PUZZLES).map(function(puzzle) {
    return {
      title: puzzle.title,
      songId: puzzle.songId,
      pieces: puzzle.pieces.slice()
    };
  });
}

function splitLyricLine(line) {
  var phrases = String(line || "").split(/[，。！？、,.!?；;：:]/).filter(function(phrase) {
    return phrase.trim().length >= 3;
  });
  var chunks = [];
  phrases.forEach(function(phrase) {
    var text = phrase.replace(/\s+/g, "").trim();
    while (text.length > 10) {
      chunks.push(text.slice(0, 10));
      text = text.slice(10);
    }
    if (text.length >= 3) chunks.push(text);
  });
  return chunks;
}

function getLyricTapChallenges() {
  var challenges = [];
  getLearningSongs().forEach(function(song) {
    var phrases = [];
    song.lyrics.filter(Boolean).forEach(function(line) {
      phrases = phrases.concat(splitLyricLine(line));
    });
    if (!phrases.length) return;
    challenges.push({
      songId: song.id,
      songTitle: song.title,
      title: "按顺序点出《" + song.title + "》",
      phrases: phrases
    });
  });
  return challenges;
}

function getPictureBookMappings() {
  var songMap = {};
  getLearningSongs().forEach(function(song) {
    songMap[song.id] = song;
  });
  var mappings = [];
  PICTURE_BOOK_GAME_GROUPS.forEach(function(group) {
    var song = songMap[group.songId];
    if (!song && !group.songTitle) return;
    group.pageNumbers.forEach(function(pageNumber) {
      mappings.push({
        id: group.groupId + "-page" + pageNumber,
        groupId: group.groupId,
        songId: group.songId || "",
        songTitle: song ? song.title : group.songTitle,
        pageNumber: pageNumber,
        imageIndex: pageNumber - 1,
        fallbackRatio: group.fallbackRatio
      });
    });
  });
  return mappings;
}

module.exports = {
  shuffle: shuffle,
  getSortPuzzles: getSortPuzzles,
  getLyricTapChallenges: getLyricTapChallenges,
  getPictureBookMappings: getPictureBookMappings
};
