var gameAudioModule = require("../audio-learning/audio-catalog.js");

Page({
  data: {
    words: ["小星星","亮晶晶","三只小猪","起间屋","氹氹转","菊花圆","炒米饼","糯米团"],
    gameBoard: [],
    selectedCells: [],
    score: 0,
    matches: 0,
    timeLeft: 60,
    timeProgress: 100,
    gameTimer: null,
    isGameActive: false,
    messageText: "点击两张文字相同的卡片完成配对",
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
    if (this.gameAudio) this.gameAudio.destroy();
  },
  initGame() {
    var self = this;
    if (self.data.gameTimer) { clearInterval(self.data.gameTimer); }
    var pairedWords = self.data.words.concat(self.data.words);
    pairedWords.sort(function() { return Math.random() - 0.5; });
    var board = pairedWords.map(function(word, index) {
      return { word: word, matched: false, selected: false, index: index };
    });
    self.setData({ gameBoard: board, selectedCells: [], score: 0, matches: 0, timeLeft: 60, timeProgress: 100, isGameActive: true, messageText: "点击两张文字相同的卡片完成配对", messageClass: "" });
    if (self.gameAudio) self.gameAudio.playMusic("song20");
    self.startTimer();
  },
  selectCell(e) {
    var index = e.currentTarget.dataset.index;
    if (!this.data.isGameActive || this.data.gameBoard[index].matched) return;
    if (this.gameAudio) this.gameAudio.playEffect("select");
    var self = this;
    if (self.data.selectedCells.length === 0) {
      self.setData({ ["gameBoard[" + index + "].selected"]: true, selectedCells: [index] });
    } else if (self.data.selectedCells.length === 1) {
      if (self.data.selectedCells[0] === index) return;
      self.setData({ ["gameBoard[" + index + "].selected"]: true, selectedCells: [self.data.selectedCells[0], index] });
      setTimeout(function() { self.checkMatch(); }, 500);
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
      this.setData({ ["gameBoard[" + idx1 + "].matched"]: true, ["gameBoard[" + idx2 + "].matched"]: true, score: this.data.score + 100, matches: nextMatches, messageText: "🎉 配对成功！", messageClass: "success" });
      if (nextMatches === 8) { this.endGame(true); }
    } else {
      if (this.gameAudio) this.gameAudio.playEffect("wrong");
      this.setData({ ["gameBoard[" + idx1 + "].selected"]: false, ["gameBoard[" + idx2 + "].selected"]: false, messageText: "❌ 配对失败，请再试一次！", messageClass: "error" });
    }
    this.setData({ selectedCells: [] });
    var self = this;
    setTimeout(function() { self.setData({ messageText: "点击两张文字相同的卡片完成配对", messageClass: "" }); }, 2000);
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
    if (!this.data.isGameActive) return;
    if (this.gameAudio) this.gameAudio.playEffect("select");
    var board = this.data.gameBoard;
    for (var i = 0; i < board.length; i++) {
      if (!board[i].matched) {
        for (var j = i + 1; j < board.length; j++) {
          if (!board[j].matched && board[j].word === board[i].word) {
            this.setData({ messageText: "💡 提示：找找两张“" + board[i].word + "”", messageClass: "" });
            return;
          }
        }
      }
    }
  }
});
