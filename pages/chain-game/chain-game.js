Page({
  data: {
    gameData: [
      { title: "氹氹转", chain: ["氹氹转，菊花圆", "炒米饼，糯米团", "阿妈叫我睇龙船", "我唔睇，睇鸡仔"] },
      { title: "月光光", chain: ["月光光，照地堂", "虾仔你乖乖瞓落床", "听朝阿妈要赶插秧", "虾仔你快高长大"] },
      { title: "有只雀仔跌落水", chain: ["有只雀仔跌落水", "跌落水，跌落水", "有只雀仔跌落水", "被水冲去"] },
      { title: "点虫虫", chain: ["点虫虫，虫虫飞", "飞到荔枝基", "荔枝熟，摘满桶", "荔枝生，摘满筐"] },
      { title: "排排坐", chain: ["排排坐，食粉果", "猫儿担凳姑婆坐", "猪拉柴，狗透火", "坐烂个屎忽唔好赖我"] },
      { title: "落雨大", chain: ["落雨大，水浸街", "阿哥担柴上街卖", "阿嫂出街着花鞋", "花鞋花袜花腰带"] },
      { title: "打开蚊帐", chain: ["打开蚊帐，打开蚊帐", "有只蚊，有只蚊", "快啲攞把扇嚟", "快啲攞把扇嚟"] },
      { title: "何家公鸡何家猜", chain: ["何家公鸡何家猜", "何家小鸡何家猜", "何家公鸡何家猜", "何家母鸡咯咯咯"] },
      { title: "鸡公仔", chain: ["鸡公仔，尾婆婆", "三岁孩儿学唱歌", "唔使爹娘教导我", "自己精乖冇奈何"] },
      { title: "跳橡筋", chain: ["小皮球，香蕉油", "一盘炒米二盘豆", "炒得豆豆好", "阿妈翻嚟吃饭啦"] }
    ],
    selectedGames: [],
    currentRound: 0,
    score: 0,
    streak: 0,
    currentChain: [],
    currentChainIndex: 0,
    displayedChain: [],
    userAnswer: "",
    currentQuestion: null,
    showNextBtn: false,
    showResultModal: false,
    showWrongModal: false,
    showGameOverModal: false,
    showHintModal: false,
    correctAnswer: "",
    hintAnswer: "",
    currentScore: 0,
    gameOver: false
  },
  onLoad() { this.initGame(); },
  goBack() {
    wx.navigateBack({ fail: function() { wx.switchTab({ url: "/pages/games/games" }); } });
  },
  randomSelectUniques(array, count) {
    var shuffled = array.slice().sort(function() { return Math.random() - 0.5; });
    return shuffled.slice(0, count);
  },
  initGame() {
    this.setData({
      selectedGames: this.randomSelectUniques(this.data.gameData, 3),
      currentRound: 0, score: 0, streak: 0, gameOver: false
    });
    this.loadNewChain();
  },
  loadNewChain() {
    if (this.data.currentRound >= this.data.selectedGames.length) {
      this.setData({ gameOver: true, showGameOverModal: true });
      return;
    }
    var question = this.data.selectedGames[this.data.currentRound];
    this.setData({
      currentQuestion: question,
      currentChain: question.chain.slice(),
      currentChainIndex: 0,
      userAnswer: "",
      showNextBtn: false
    });
    this.updateChainDisplay();
  },
  updateChainDisplay() {
    var displayed = [];
    for (var i = 0; i <= this.data.currentChainIndex; i++) {
      displayed.push({ text: this.data.currentChain[i], isLast: i === this.data.currentChainIndex });
    }
    this.setData({ displayedChain: displayed });
  },
  submitAnswer() {
    if (!this.data.userAnswer.trim()) {
      this.setData({ correctAnswer: this.data.currentChain[this.data.currentChainIndex + 1], showWrongModal: true });
      return;
    }
    var correctAnswer = this.data.currentChain[this.data.currentChainIndex + 1];
    if (this.data.userAnswer.trim() === correctAnswer) {
      var points = 10 + this.data.streak * 5;
      this.setData({ score: this.data.score + points, currentScore: points, streak: this.data.streak + 1, showResultModal: true });
      this.setData({ currentChainIndex: this.data.currentChainIndex + 1 });
      if (this.data.currentChainIndex + 1 >= this.data.currentChain.length) {
        this.setData({ showNextBtn: true });
      } else {
        this.updateChainDisplay();
      }
    } else {
      this.setData({ streak: 0, correctAnswer: correctAnswer, showWrongModal: true });
    }
    this.setData({ userAnswer: "" });
  },
  onAnswerInput(e) { this.setData({ userAnswer: e.detail.value }); },
  showHint() {
    this.setData({ hintAnswer: this.data.currentChain[this.data.currentChainIndex + 1], showHintModal: true });
  },
  nextRound() { this.setData({ currentRound: this.data.currentRound + 1 }); this.loadNewChain(); },
  closeResultModal() { this.setData({ showResultModal: false }); },
  closeWrongModal() { this.setData({ showWrongModal: false }); },
  closeGameOverModal() { this.setData({ showGameOverModal: false }); },
  closeHintModal() { this.setData({ showHintModal: false }); },
  restartGame() { this.setData({ showGameOverModal: false }); this.initGame(); }
});
