var gameAudioModule = require("../audio-learning/audio-catalog.js");

Page({
  data: {
    puzzleData: [
      { title: "拼出完整的童谣：鸡公仔", songId: "song28", pieces: ["鸡公仔，尾婆娑", "三岁孩儿学唱歌", "唔使爹娘教导我", "自己精乖无奈何"] },
      {
        title: "拼出童谣片段：月光光",
        songId: "song18",
        pieces: [
          "月光光，照地堂",
          "虾仔你乖乖瞓落床",
          "听朝阿妈要赶插秧啰",
          "阿爷睇牛佢上山岗喔",
          "虾仔你快高长大喔",
          "帮手阿爷去睇牛羊喔",
          "月光光，照地堂",
          "虾仔你乖乖瞓落床",
          "听朝阿爸要捕鱼虾啰",
          "阿嫲织网要织到天光哦",
          "虾仔你快高长大啰",
          "划艇撒网就更在行哦"
        ]
      },
      {
        title: "拼出完整的童谣：落雨大",
        songId: "song19",
        pieces: ["落雨大，水浸街", "阿哥担柴上街卖", "阿嫂出街着花鞋", "花鞋、花袜、花腰带", "珍珠蝴蝶两边排"]
      },
      {
        title: "拼出童谣片段：氹氹转",
        songId: "song20",
        pieces: [
          "氹氹转，菊花园",
          "炒米饼，糯米团",
          "五月初五系龙舟节呀",
          "阿妈叫我去睇龙船",
          "我唔睇，睇鸡仔",
          "鸡仔大，拎去卖",
          "卖得几多钱？",
          "卖得五百钱",
          "卖咗钱来起花园",
          "我有只风车仔，佢转得好好睇",
          "睇佢氹氹转呀菊花园",
          "睇佢氹氹转，氹氹转又转"
        ]
      },
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
        title: "拼出童谣片段：何家公鸡何家猜",
        songId: "song21",
        pieces: [
          "真怪诞呀又有趣",
          "你望望公园里",
          "有四百只鸡鸡咯咯咯",
          "是何家的不知道",
          "何家公鸡何家猜",
          "何家小鸡何家猜",
          "何家公鸡何家猜",
          "何家母鸡咯咯咯",
          "猴子哥哥熊先生",
          "松鼠妹妹牛叔叔",
          "黄狗爸爸羊妈妈",
          "来猜来猜唷"
        ]
      },
      {
        title: "拼出完整的童谣：洗白白",
        songId: "song22",
        pieces: [
          "洗白白，洗白白，人人话我好宝宝。",
          "洗白白，洗白白，肥皂都香滑。",
          "虱乸虱乸人害怕，",
          "污糟邋遢实太差。",
          "洗白白，洗白白，才是好小孩。"
        ]
      },
      {
        title: "拼出完整的童谣：齐齐望过去",
        songId: "song23",
        pieces: [
          "齐齐望过去，清溪里有只青蛙想跳水",
          "齐齐望过去，小屋里有只猪仔真风趣",
          "有只了哥，吱吱喳喳想驳嘴",
          "齐齐望过去，山窿里面有只狮子竟饮醉"
        ]
      }
    ],
    selectedPuzzles: [],
    currentPuzzle: 0,
    score: 0,
    startTime: 0,
    elapsedTime: 0,
    gameTimer: null,
    currentPuzzleData: {},
    puzzleSlots: [],
    availablePieces: [],
    selectedPiece: null,
    selectedPieceIndex: -1,
    showResultModal: false,
    showWrongModal: false,
    showGameOverModal: false
  },
  onLoad() {
    this.gameAudio = gameAudioModule.createGameAudio();
    this.initGame();
  },
  onShow() { if (this.gameAudio) this.gameAudio.setPageVisible(true); },
  onHide() { if (this.gameAudio) this.gameAudio.setPageVisible(false); },
  onUnload() {
    if (this.data.gameTimer) { clearInterval(this.data.gameTimer); }
    if (this.gameAudio) this.gameAudio.destroy();
  },
  initGame() {
    var shuffledPuzzles = this.data.puzzleData.slice();
    for (var i = shuffledPuzzles.length - 1; i > 0; i--) {
      var randomIndex = Math.floor(Math.random() * (i + 1));
      var temporary = shuffledPuzzles[i];
      shuffledPuzzles[i] = shuffledPuzzles[randomIndex];
      shuffledPuzzles[randomIndex] = temporary;
    }
    this.setData({
      selectedPuzzles: shuffledPuzzles.slice(0, 3),
      currentPuzzle: 0,
      score: 0,
      startTime: Date.now(),
      elapsedTime: 0
    });
    this.loadPuzzle();
    this.startTimer();
  },
  loadPuzzle() {
    if (this.data.currentPuzzle >= this.data.selectedPuzzles.length) {
      this.setData({ showGameOverModal: true });
      if (this.data.gameTimer) { clearInterval(this.data.gameTimer); }
      if (this.gameAudio) {
        this.gameAudio.stopMusic();
        this.gameAudio.playEffect("complete");
      }
      return;
    }
    var puzzle = this.data.selectedPuzzles[this.data.currentPuzzle];
    var slots = puzzle.pieces.map(function(piece, index) {
      return { content: "", expected: piece, position: index, placeholder: "点击放入第 " + (index + 1) + " 句", dragOver: false, placed: false };
    });
    var shuffledPieces = puzzle.pieces.slice().sort(function() { return Math.random() - 0.5; });
    var pieces = shuffledPieces.map(function(piece, index) {
      return { text: piece, index: index, used: false, selected: false };
    });
    this.setData({ currentPuzzleData: puzzle, puzzleSlots: slots, availablePieces: pieces, selectedPiece: null, selectedPieceIndex: -1 });
    if (this.gameAudio) this.gameAudio.playMusic(puzzle.songId || "");
  },
  selectPiece(e) {
    var piece = e.currentTarget.dataset.piece;
    var index = e.currentTarget.dataset.index;
    if (piece.used) return;
    if (this.gameAudio) this.gameAudio.playEffect("select");
    if (this.data.selectedPieceIndex === index) {
      this.setData({ selectedPiece: null, selectedPieceIndex: -1, ["availablePieces[" + index + "].selected"]: false });
    } else {
      if (this.data.selectedPieceIndex >= 0) {
        this.setData({ ["availablePieces[" + this.data.selectedPieceIndex + "].selected"]: false });
      }
      this.setData({ selectedPiece: piece.text, selectedPieceIndex: index, ["availablePieces[" + index + "].selected"]: true });
    }
  },
  placePiece(e) {
    var slotIndex = e.currentTarget.dataset.position;
    if (this.data.selectedPiece && this.data.selectedPieceIndex >= 0 && slotIndex !== undefined) {
      var slot = this.data.puzzleSlots[slotIndex];
      if (!slot.content) {
        if (this.gameAudio) this.gameAudio.playEffect("select");
        this.setData({
          ["puzzleSlots[" + slotIndex + "].content"]: this.data.selectedPiece,
          ["puzzleSlots[" + slotIndex + "].placed"]: true,
          ["availablePieces[" + this.data.selectedPieceIndex + "].used"]: true,
          selectedPiece: null,
          selectedPieceIndex: -1
        });
        var self = this;
        setTimeout(function() { self.setData({ ["puzzleSlots[" + slotIndex + "].placed"]: false }); }, 1000);
      }
    }
  },
  checkAnswer() {
    var correctCount = 0;
    var totalSlots = this.data.puzzleSlots.length;
    this.data.puzzleSlots.forEach(function(slot) { if (slot.content === slot.expected) { correctCount++; } });
    if (correctCount === totalSlots) {
      if (this.gameAudio) this.gameAudio.playEffect("correct");
      this.setData({ score: this.data.score + 100, showResultModal: true });
    } else {
      if (this.gameAudio) this.gameAudio.playEffect("wrong");
      this.setData({ showWrongModal: true });
    }
  },
  nextPuzzle() {
    if (this.gameAudio) this.gameAudio.playEffect("select");
    this.setData({ currentPuzzle: this.data.currentPuzzle + 1, showResultModal: false });
    this.loadPuzzle();
  },
  resetPuzzle() {
    if (this.gameAudio) this.gameAudio.playEffect("select");
    this.loadPuzzle();
  },
  startTimer() {
    var self = this;
    if (self.data.gameTimer) { clearInterval(self.data.gameTimer); }
    var timer = setInterval(function() {
      self.setData({ elapsedTime: Math.floor((Date.now() - self.data.startTime) / 1000) });
    }, 1000);
    self.setData({ gameTimer: timer });
  },
  closeWrongModal() { this.setData({ showWrongModal: false }); },
  noop() {},
  restartGame() {
    if (this.gameAudio) this.gameAudio.playEffect("select");
    this.setData({ showGameOverModal: false });
    this.initGame();
  }
});
