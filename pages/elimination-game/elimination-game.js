Page({
  data: {
    words: ["小星星","亮晶晶","三只小猪","起间屋","氹氹转","菊花圆","炒米饼","糯米团"],
    gameBoard: [],
    selectedCells: [],
    score: 0,
    matches: 0,
    timeLeft: 60,
    gameTimer: null,
    isGameActive: false,
    messageText: "点击两个相同的童谣词汇进行配对！",
    messageClass: ""
  },
  onLoad() { this.initGame(); },
  onUnload() { if (this.data.gameTimer) { clearInterval(this.data.gameTimer); } },
  goBack() {
    if (this.data.gameTimer) { clearInterval(this.data.gameTimer); }
    wx.navigateBack({ fail: function() { wx.reLaunch({ url: "/pages/games/games" }); } });
  },
  initGame() {
    var self = this;
    if (self.data.gameTimer) { clearInterval(self.data.gameTimer); }
    var pairedWords = self.data.words.concat(self.data.words);
    pairedWords.sort(function() { return Math.random() - 0.5; });
    var board = pairedWords.map(function(word, index) {
      return { word: word, matched: false, selected: false, index: index };
    });
    self.setData({ gameBoard: board, selectedCells: [], score: 0, matches: 0, timeLeft: 60, isGameActive: true, messageText: "点击两个相同的童谣词汇进行配对！", messageClass: "" });
    self.startTimer();
  },
  selectCell(e) {
    var index = e.currentTarget.dataset.index;
    if (!this.data.isGameActive || this.data.gameBoard[index].matched) return;
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
      this.setData({ ["gameBoard[" + idx1 + "].matched"]: true, ["gameBoard[" + idx2 + "].matched"]: true, score: this.data.score + 100, matches: this.data.matches + 1, messageText: "🎉 配对成功！", messageClass: "success" });
      if (this.data.matches === 8) { this.endGame(true); }
    } else {
      this.setData({ ["gameBoard[" + idx1 + "].selected"]: false, ["gameBoard[" + idx2 + "].selected"]: false, messageText: "❌ 配对失败，请再试一次！", messageClass: "error" });
    }
    this.setData({ selectedCells: [] });
    var self = this;
    setTimeout(function() { self.setData({ messageText: "点击两个相同的童谣词汇进行配对！", messageClass: "" }); }, 2000);
  },
  startTimer() {
    var self = this;
    if (self.data.gameTimer) { clearInterval(self.data.gameTimer); }
    var timer = setInterval(function() {
      if (self.data.isGameActive) {
        self.setData({ timeLeft: self.data.timeLeft - 1 });
        if (self.data.timeLeft <= 0) { self.endGame(false); }
      }
    }, 1000);
    self.setData({ gameTimer: timer });
  },
  endGame(won) {
    this.setData({ isGameActive: false });
    if (this.data.gameTimer) { clearInterval(this.data.gameTimer); }
    if (won) { this.setData({ messageText: "🎉 恭喜你！游戏胜利！最终得分: " + this.data.score, messageClass: "success" }); }
    else { this.setData({ messageText: "⏰ 时间到！游戏结束！最终得分: " + this.data.score, messageClass: "error" }); }
  },
  startNewGame() { this.initGame(); },
  showHint() {
    if (!this.data.isGameActive) return;
    var board = this.data.gameBoard;
    for (var i = 0; i < board.length; i++) {
      if (!board[i].matched) {
        for (var j = i + 1; j < board.length; j++) {
          if (!board[j].matched && board[j].word === board[i].word) {
            this.setData({ messageText: "💡 提示：这两个词汇可以配对！", messageClass: "" });
            return;
          }
        }
      }
    }
  }
});
