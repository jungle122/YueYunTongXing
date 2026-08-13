var gameAudioModule = require("../audio-learning/audio-catalog.js");

Page({
  data: {
    gameData: [
      {
        title: "氹氹转",
        songId: "song20",
        chain: [
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
        title: "月光光",
        songId: "song18",
        chain: [
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
      { title: "有只雀仔跌落水", songId: "song24", chain: ["有只雀仔跌落水", "跌落水，跌落水", "有只雀仔跌落水", "被水冲去"] },
      {
        title: "点虫虫",
        songId: "song25",
        chain: [
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
        title: "排排坐",
        songId: "song26",
        chain: ["排排坐，吃粉果", "猪拉柴，狗透火", "猫儿担凳，俾姑婆坐", "坐烂个凳柄，唔好赖我啵"]
      },
      {
        title: "落雨大",
        songId: "song19",
        chain: ["落雨大，水浸街", "阿哥担柴上街卖", "阿嫂出街着花鞋", "花鞋、花袜、花腰带", "珍珠蝴蝶两边排"]
      },
      { title: "打开蚊帐", songId: "song27", chain: ["打开蚊帐，打开蚊帐", "有只蚊，有只蚊", "快啲攞把扇嚟，快啲攞把扇嚟", "拨走佢，拨走佢。"] },
      {
        title: "何家公鸡何家猜",
        songId: "song21",
        chain: [
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
        title: "洗白白",
        songId: "song22",
        chain: [
          "洗白白，洗白白，人人话我好宝宝。",
          "洗白白，洗白白，肥皂都香滑。",
          "虱乸虱乸人害怕，",
          "污糟邋遢实太差。",
          "洗白白，洗白白，才是好小孩。"
        ]
      },
      {
        title: "齐齐望过去",
        songId: "song23",
        chain: [
          "齐齐望过去，清溪里有只青蛙想跳水",
          "齐齐望过去，小屋里有只猪仔真风趣",
          "有只了哥，吱吱喳喳想驳嘴",
          "齐齐望过去，山窿里面有只狮子竟饮醉"
        ]
      },
      { title: "鸡公仔", songId: "song28", chain: ["鸡公仔，尾婆娑", "三岁孩儿学唱歌", "唔使爹娘教导我", "自己精乖无奈何"] },
      { title: "跳橡筋", chain: ["小皮球，香蕉油", "一盘炒米二盘豆", "炒得豆豆好", "阿妈翻嚟吃饭啦"] }
    ],
    selectedGames: [],
    currentRound: 0,
    score: 0,
    streak: 0,
    currentChain: [],
    currentChainIndex: 0,
    displayedChain: [],
    currentQuestion: null,
    showNextBtn: false,
    showResultModal: false,
    showWrongModal: false,
    showGameOverModal: false,
    showHintModal: false,
    correctAnswer: "",
    hintAnswer: "",
    currentScore: 0,
    gameOver: false,
    selectedOption: -1,
    currentOptions: [],
    optionRows: [],
    bestStreak: 0
  },
  onLoad() {
    this.gameAudio = gameAudioModule.createGameAudio();
    this.initGame();
  },
  onShow() { if (this.gameAudio) this.gameAudio.setPageVisible(true); },
  onHide() { if (this.gameAudio) this.gameAudio.setPageVisible(false); },
  onUnload() { if (this.gameAudio) this.gameAudio.destroy(); },
  randomSelectUniques(array, count) {
    var shuffled = array.slice().sort(function() { return Math.random() - 0.5; });
    return shuffled.slice(0, count);
  },
  shuffleArray(array) {
    var a = array.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = a[i];
      a[i] = a[j];
      a[j] = temp;
    }
    return a;
  },
  initGame() {
    this.setData({
      selectedGames: this.randomSelectUniques(this.data.gameData, 3),
      currentRound: 0, score: 0, streak: 0, gameOver: false, bestStreak: 0
    });
    this.loadNewChain();
  },
  loadNewChain() {
    if (this.data.currentRound >= this.data.selectedGames.length) {
      this.setData({ gameOver: true, showGameOverModal: true });
      if (this.gameAudio) {
        this.gameAudio.stopMusic();
        this.gameAudio.playEffect("complete");
      }
      return;
    }
    var question = this.data.selectedGames[this.data.currentRound];
    this.setData({
      currentQuestion: question,
      currentChain: question.chain.slice(),
      currentChainIndex: 0,
      selectedOption: -1,
      showNextBtn: false
    });
    if (this.gameAudio) this.gameAudio.playMusic(question.songId || "");
    this.updateChainDisplay();
    this.generateOptions();
  },
  updateChainDisplay() {
    var displayed = [];
    for (var i = 0; i <= this.data.currentChainIndex; i++) {
      displayed.push({ text: this.data.currentChain[i], isLast: i === this.data.currentChainIndex });
    }
    this.setData({ displayedChain: displayed });
  },
  generateOptions() {
    var correctText = this.data.currentChain[this.data.currentChainIndex + 1];
    var allLines = [];
    var games = this.data.gameData;
    for (var g = 0; g < games.length; g++) {
      for (var c = 0; c < games[g].chain.length; c++) {
        var line = games[g].chain[c];
        if (line !== correctText && allLines.indexOf(line) === -1) {
          allLines.push(line);
        }
      }
    }
    var shuffled = this.shuffleArray(allLines);
    var wrongOptions = shuffled.slice(0, 3);
    var options = [{ text: correctText, isCorrect: true }];
    for (var i = 0; i < wrongOptions.length; i++) {
      options.push({ text: wrongOptions[i], isCorrect: false });
    }
    var currentOptions = this.shuffleArray(options);
    var optionRows = [];
    for (var rowStart = 0; rowStart < currentOptions.length; rowStart += 2) {
      optionRows.push({
        rowId: "row-" + rowStart,
        options: currentOptions.slice(rowStart, rowStart + 2).map(function(option, offset) {
          return Object.assign({}, option, { optionIndex: rowStart + offset });
        })
      });
    }
    this.setData({ currentOptions: currentOptions, optionRows: optionRows });
  },
  onSelectOption(e) {
    var idx = parseInt(e.currentTarget.dataset.index);
    if (this.gameAudio) this.gameAudio.playEffect("select");
    this.setData({ selectedOption: idx });
  },
  submitAnswer() {
    var selectedOption = this.data.selectedOption;
    if (selectedOption === -1) {
      return;
    }
    var correctAnswer = this.data.currentChain[this.data.currentChainIndex + 1];
    if (this.data.currentOptions[selectedOption] && this.data.currentOptions[selectedOption].isCorrect) {
      if (this.gameAudio) this.gameAudio.playEffect("correct");
      var points = 10 + this.data.streak * 5;
      var newStreak = this.data.streak + 1;
      this.setData({
        score: this.data.score + points,
        currentScore: points,
        streak: newStreak,
        bestStreak: Math.max(this.data.bestStreak, newStreak),
        showResultModal: true
      });
      var newIndex = this.data.currentChainIndex + 1;
      this.setData({ currentChainIndex: newIndex });
      this.updateChainDisplay();
      if (newIndex + 1 >= this.data.currentChain.length) {
        this.setData({ showNextBtn: true });
      } else {
        this.generateOptions();
        this.setData({ selectedOption: -1 });
      }
    } else {
      if (this.gameAudio) this.gameAudio.playEffect("wrong");
      this.setData({ streak: 0, correctAnswer: correctAnswer, showWrongModal: true });
    }
  },
  showHint() {
    if (this.gameAudio) this.gameAudio.playEffect("select");
    var fullText = this.data.currentChain[this.data.currentChainIndex + 1];
    var hintLen = fullText.length >= 4 ? 2 : 1;
    this.setData({ hintAnswer: fullText.substring(0, hintLen), showHintModal: true });
  },
  nextRound() {
    if (this.gameAudio) this.gameAudio.playEffect("select");
    this.setData({ currentRound: this.data.currentRound + 1 });
    this.loadNewChain();
  },
  closeResultModal() { this.setData({ showResultModal: false }); },
  closeWrongModal() { this.setData({ showWrongModal: false }); },
  closeGameOverModal() { this.setData({ showGameOverModal: false }); },
  closeHintModal() { this.setData({ showHintModal: false }); },
  noop() {},
  restartGame() {
    if (this.gameAudio) this.gameAudio.playEffect("select");
    this.setData({ showGameOverModal: false });
    this.initGame();
  }
});
