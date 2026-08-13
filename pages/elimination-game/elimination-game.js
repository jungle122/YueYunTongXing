var gameAudioModule = require("../audio-learning/audio-catalog.js");

Page({
  data: {
    words: ["小星星", "亮晶晶", "三只小猪", "起间屋", "氹氹转", "菊花圆", "炒米饼", "糯米团"],
    gameBoard: [],
    selectedCells: [],
    score: 0,
    matches: 0,
    timeLeft: 60,
    timeProgress: 100,
    gameTimer: null,
    previewTimer: null,
    isGameActive: false,
    isPreviewing: true,
    previewCountdown: 5,
    messageText: "记住卡片位置，5秒后开始！",
    messageClass: ""
  },
  onLoad() {
    this.gameAudio = gameAudioModule.createGameAudio();
    this.initGame();
  },
  onShow() { if (this.gameAudio) this.gameAudio.setPageVisible(true); },
  onHide() { if (this.gameAudio) this.gameAudio.setPageVisible(false); },
  onUnload() {
    if (this.data.gameTimer) { clearInterval(this.data.gameTimer); }
    if (this.data.previewTimer) { clearInterval(this.data.previewTimer); }
    if (this.gameAudio) this.gameAudio.destroy();
  },
  initGame() {
    var self = this;
    if (self.data.gameTimer) { clearInterval(self.data.gameTimer); }
    if (self.data.previewTimer) { clearInterval(self.data.previewTimer); }
    var pairedWords = self.data.words.concat(self.data.words);
    pairedWords.sort(function() { return Math.random() - 0.5; });
    var board = pairedWords.map(function(word, index) {
      return { word: word, matched: false, flipped: false, selected: false, index: index };
    });
    self.setData({
      gameBoard: board,
      selectedCells: [],
      score: 0,
      matches: 0,
      timeLeft: 60,
      timeProgress: 100,
      isGameActive: false,
      isPreviewing: true,
      previewCountdown: 5,
      messageText: "记住卡片位置，5秒后开始！",
      messageClass: ""
    });
    if (self.gameAudio) self.gameAudio.playMusic("song20");
    self.startPreview();
  },
  startPreview() {
    var self = this;
    var countdown = 5;
    self.setData({ isPreviewing: true, previewCountdown: countdown });
    if (self.data.previewTimer) { clearInterval(self.data.previewTimer); }
    var tick = setInterval(function() {
      countdown--;
      if (countdown <= 0) {
        clearInterval(tick);
        self.setData({ isPreviewing: false, previewCountdown: 0 });
        self.startGame();
        return;
      }
      self.setData({ previewCountdown: countdown });
    }, 1000);
    self.setData({ previewTimer: tick });
  },
  startGame() {
    var self = this;
    self.setData({ isGameActive: true, messageText: "翻开两张相同文字配对吧！", messageClass: "" });
    self.startTimer();
  },
  selectCell(e) {
    var index = e.currentTarget.dataset.index;
    if (!this.data.isGameActive || this.data.isPreviewing) return;
    if (this.data.gameBoard[index].matched || this.data.gameBoard[index].flipped) return;
    if (this.gameAudio) this.gameAudio.playEffect("select");
    var self = this;
    if (self.data.selectedCells.length === 0) {
      self.setData({
        ["gameBoard[" + index + "].flipped"]: true,
        ["gameBoard[" + index + "].selected"]: true,
        selectedCells: [index]
      });
    } else if (self.data.selectedCells.length === 1) {
      if (self.data.selectedCells[0] === index) return;
      self.setData({
        ["gameBoard[" + index + "].flipped"]: true,
        ["gameBoard[" + index + "].selected"]: true,
        selectedCells: [self.data.selectedCells[0], index]
      });
      setTimeout(function() { self.checkMatch(); }, 700);
    }
  },
  checkMatch() {
    var idx1 = this.data.selectedCells[0];
    var idx2 = this.data.selectedCells[1];
    var cell1 = this.data.gameBoard[idx1];
    var cell2 = this.data.gameBoard[idx2];
    if (cell1.word === cell2.word) {
      var nextMatches = this.data.matches + 1;
      if (this.gameAudio) this.gameAudio.playEffect("correct");
      this.setData({
        ["gameBoard[" + idx1 + "].matched"]: true,
        ["gameBoard[" + idx2 + "].matched"]: true,
        score: this.data.score + 100,
        matches: nextMatches,
        messageText: "🎉 配对成功！",
        messageClass: "success"
      });
      if (nextMatches === 8) { this.endGame(true); }
    } else {
      if (this.gameAudio) this.gameAudio.playEffect("wrong");
      this.setData({
        ["gameBoard[" + idx1 + "].flipped"]: false,
        ["gameBoard[" + idx1 + "].selected"]: false,
        ["gameBoard[" + idx2 + "].flipped"]: false,
        ["gameBoard[" + idx2 + "].selected"]: false,
        messageText: "❌ 配对失败，请再试一次！",
        messageClass: "error"
      });
    }
    this.setData({ selectedCells: [] });
    var self = this;
    setTimeout(function() { self.setData({ messageText: "翻开两张相同文字配对吧！", messageClass: "" }); }, 1500);
  },
  startTimer() {
    var self = this;
    if (self.data.gameTimer) { clearInterval(self.data.gameTimer); }
    var timer = setInterval(function() {
      if (self.data.isGameActive) {
        var nextTime = Math.max(0, self.data.timeLeft - 1);
        self.setData({ timeLeft: nextTime, timeProgress: Math.round(nextTime / 60 * 100) });
        if (nextTime <= 0) { self.endGame(false); }
      }
    }, 1000);
    self.setData({ gameTimer: timer });
  },
  endGame(won) {
    this.setData({ isGameActive: false });
    if (this.data.gameTimer) { clearInterval(this.data.gameTimer); }
    if (this.gameAudio) {
      this.gameAudio.stopMusic();
      this.gameAudio.playEffect(won ? "complete" : "wrong");
    }
    if (won) { this.setData({ messageText: "🎉 恭喜你！游戏胜利！最终得分: " + this.data.score, messageClass: "success" }); }
    else { this.setData({ messageText: "⏰ 时间到！游戏结束！最终得分: " + this.data.score, messageClass: "error" }); }
  },
  startNewGame() {
    if (this.gameAudio) this.gameAudio.playEffect("select");
    this.initGame();
  },
  showHint() {
    if (!this.data.isGameActive || this.data.isPreviewing) return;
    if (this.gameAudio) this.gameAudio.playEffect("select");
    var board = this.data.gameBoard;
    for (var i = 0; i < board.length; i++) {
      if (!board[i].matched && !board[i].flipped) {
        for (var j = i + 1; j < board.length; j++) {
          if (!board[j].matched && !board[j].flipped && board[j].word === board[i].word) {
            this.setData({
              ["gameBoard[" + i + "].flipped"]: true,
              ["gameBoard[" + j + "].flipped"]: true,
              messageText: "提示：这两张是相同的！",
              messageClass: ""
            });
            var self = this;
            var idxI = i, idxJ = j;
            setTimeout(function() {
              self.setData({
                ["gameBoard[" + idxI + "].flipped"]: false,
                ["gameBoard[" + idxJ + "].flipped"]: false
              });
            }, 2000);
            return;
          }
        }
      }
    }
  }
});
