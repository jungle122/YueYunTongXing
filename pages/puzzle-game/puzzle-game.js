Page({
  data: {
    puzzleData: [
      { title: "拼出完整的童谣：鸡公仔", pieces: ["鸡公仔，尾婆婆","三岁孩儿学唱歌","唔使爹娘教导我","自己精乖冇奈何"] },
      { title: "拼出完整的童谣：月光光", pieces: ["月光光，照地堂","年卅晚，摘槟榔","槟榔香，摘子姜","子姜辣，买胡辣"] },
      { title: "拼出完整的童谣：落雨大", pieces: ["落雨大，水浸街","阿哥担柴上街卖","阿嫂出街着花鞋","花鞋花袜花腰带"] }
    ],
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
  onLoad() { this.initGame(); },
  onUnload() { if (this.data.gameTimer) { clearInterval(this.data.gameTimer); } },
  initGame() {
    this.setData({ currentPuzzle: 0, score: 0, startTime: Date.now(), elapsedTime: 0 });
    this.loadPuzzle();
    this.startTimer();
  },
  loadPuzzle() {
    if (this.data.currentPuzzle >= this.data.puzzleData.length) {
      this.setData({ showGameOverModal: true });
      if (this.data.gameTimer) { clearInterval(this.data.gameTimer); }
      return;
    }
    var puzzle = this.data.puzzleData[this.data.currentPuzzle];
    var slots = puzzle.pieces.map(function(piece, index) {
      return { content: "", expected: piece, position: index, placeholder: "点击放入第 " + (index + 1) + " 句", dragOver: false, placed: false };
    });
    var shuffledPieces = puzzle.pieces.slice().sort(function() { return Math.random() - 0.5; });
    var pieces = shuffledPieces.map(function(piece, index) {
      return { text: piece, index: index, used: false, selected: false };
    });
    this.setData({ currentPuzzleData: puzzle, puzzleSlots: slots, availablePieces: pieces, selectedPiece: null, selectedPieceIndex: -1 });
  },
  selectPiece(e) {
    var piece = e.currentTarget.dataset.piece;
    var index = e.currentTarget.dataset.index;
    if (piece.used) return;
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
      this.setData({ score: this.data.score + 100, showResultModal: true });
    } else {
      this.setData({ showWrongModal: true });
    }
  },
  nextPuzzle() {
    this.setData({ currentPuzzle: this.data.currentPuzzle + 1, showResultModal: false });
    this.loadPuzzle();
  },
  resetPuzzle() { this.loadPuzzle(); },
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
  restartGame() { this.setData({ showGameOverModal: false }); this.initGame(); }
});
