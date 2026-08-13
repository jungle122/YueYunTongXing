var gameAudioModule = require("../audio-learning/audio-catalog.js");
var gameCatalog = require("../games/game-catalog.js");

function createTargetCharacters(text, matchedCount) {
  return text.split("").map(function(character, index) {
    return {
      id: "target-" + index,
      text: index < matchedCount ? character : "",
      state: index < matchedCount ? "matched" : (index === matchedCount ? "current" : "pending")
    };
  });
}

function createCharacterCards(text) {
  return gameCatalog.shuffle(text.split("").map(function(character, index) {
    return {
      id: "char-" + index + "-" + character,
      text: character,
      used: false
    };
  }));
}

Page({
  data: {
    selectedMode: "",
    isModePage: false,
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
    sortHintSlotIndex: -1,
    sortHintSourceSlotIndex: -1,
    sortHintPieceIndex: -1,
    sortHintText: "",
    tapChallenges: [],
    currentPhraseIndex: 0,
    currentPhrase: "",
    targetCharacters: [],
    characterCards: [],
    matchedCharacterCount: 0,
    isPhraseComplete: false,
    wrongCharacterId: "",
    tapPrompt: "听童谣，按歌词顺序点字",
    showResultModal: false,
    showWrongModal: false,
    showGameOverModal: false
  },

  onLoad(options) {
    this.gameAudio = gameAudioModule.createGameAudio();
    var mode = options && options.mode;
    if (mode === "tap" || mode === "sort") {
      this.setData({
        selectedMode: mode,
        isModePage: true,
        currentPuzzle: 0,
        score: 0,
        elapsedTime: 0,
        startTime: Date.now()
      });
      if (mode === "tap") this.initTapGame();
      else this.initSortGame();
      this.startTimer();
    }
  },

  onShow() {
    if (this.gameAudio) this.gameAudio.setPageVisible(true);
  },

  onHide() {
    if (this.gameAudio) this.gameAudio.setPageVisible(false);
  },

  onUnload() {
    this.clearGameTimer();
    if (this.gameAudio) this.gameAudio.destroy();
  },

  chooseMode(e) {
    var mode = e.currentTarget.dataset.mode;
    if (mode !== "tap" && mode !== "sort") return;
    if (this.gameAudio) this.gameAudio.playEffect("select");
    wx.navigateTo({
      url: "/pages/puzzle-game/puzzle-game?mode=" + mode
    });
  },

  backToModes() {
    this.clearGameTimer();
    if (this.gameAudio) this.gameAudio.stopMusic();
    if (this.data.isModePage) {
      wx.navigateBack({ delta: 1 });
      return;
    }
    this.setData({
      selectedMode: "",
      currentPuzzle: 0,
      score: 0,
      elapsedTime: 0,
      showResultModal: false,
      showWrongModal: false,
      showGameOverModal: false
    });
  },

  initSortGame() {
    var selected = gameCatalog.shuffle(gameCatalog.getSortPuzzles()).slice(0, 3);
    this.setData({ selectedPuzzles: selected, currentPuzzle: 0 });
    this.loadSortPuzzle();
  },

  loadSortPuzzle() {
    if (this.data.currentPuzzle >= this.data.selectedPuzzles.length) {
      this.finishGame();
      return;
    }
    var puzzle = this.data.selectedPuzzles[this.data.currentPuzzle];
    var slots = puzzle.pieces.map(function(piece, index) {
      return { content: "", pieceIndex: -1, expected: piece, position: index, placeholder: "点击放入第 " + (index + 1) + " 句", placed: false };
    });
    var pieces = gameCatalog.shuffle(puzzle.pieces).map(function(piece, index) {
      return { text: piece, index: index, used: false, selected: false };
    });
    this.setData({
      currentPuzzleData: puzzle,
      puzzleSlots: slots,
      availablePieces: pieces,
      selectedPiece: null,
      selectedPieceIndex: -1,
      sortHintSlotIndex: -1,
      sortHintSourceSlotIndex: -1,
      sortHintPieceIndex: -1,
      sortHintText: ""
    });
    if (this.gameAudio) this.gameAudio.playMusic(puzzle.songId || "");
  },

  selectPiece(e) {
    var piece = e.currentTarget.dataset.piece;
    var index = Number(e.currentTarget.dataset.index);
    if (!piece || piece.used) return;
    if (this.gameAudio) this.gameAudio.playEffect("select");
    var changes = {};
    if (this.data.selectedPieceIndex >= 0) {
      changes["availablePieces[" + this.data.selectedPieceIndex + "].selected"] = false;
    }
    if (this.data.selectedPieceIndex === index) {
      changes.selectedPiece = null;
      changes.selectedPieceIndex = -1;
    } else {
      changes.selectedPiece = piece.text;
      changes.selectedPieceIndex = index;
      changes["availablePieces[" + index + "].selected"] = true;
    }
    this.setData(changes);
  },

  placePiece(e) {
    var slotIndex = Number(e.currentTarget.dataset.position);
    var slot = this.data.puzzleSlots[slotIndex];
    if (!slot) return;

    if (!this.data.selectedPiece || this.data.selectedPieceIndex < 0) {
      if (!slot.content || slot.pieceIndex < 0) return;
      if (this.gameAudio) this.gameAudio.playEffect("select");
      var returnChanges = {
        selectedPiece: null,
        selectedPieceIndex: -1,
        sortHintSlotIndex: -1,
        sortHintSourceSlotIndex: -1,
        sortHintPieceIndex: -1,
        sortHintText: ""
      };
      returnChanges["puzzleSlots[" + slotIndex + "].content"] = "";
      returnChanges["puzzleSlots[" + slotIndex + "].pieceIndex"] = -1;
      returnChanges["availablePieces[" + slot.pieceIndex + "].used"] = false;
      this.setData(returnChanges);
      return;
    }

    if (this.gameAudio) this.gameAudio.playEffect("select");
    var selectedPieceIndex = this.data.selectedPieceIndex;
    var changes = {
      selectedPiece: null,
      selectedPieceIndex: -1,
      sortHintSlotIndex: -1,
      sortHintSourceSlotIndex: -1,
      sortHintPieceIndex: -1,
      sortHintText: ""
    };
    if (slot.content && slot.pieceIndex >= 0) {
      changes["availablePieces[" + slot.pieceIndex + "].used"] = false;
    }
    changes["puzzleSlots[" + slotIndex + "].content"] = this.data.selectedPiece;
    changes["puzzleSlots[" + slotIndex + "].pieceIndex"] = selectedPieceIndex;
    changes["puzzleSlots[" + slotIndex + "].placed"] = true;
    changes["availablePieces[" + selectedPieceIndex + "].used"] = true;
    changes["availablePieces[" + selectedPieceIndex + "].selected"] = false;
    this.setData(changes);
    var self = this;
    setTimeout(function() {
      self.setData({ ["puzzleSlots[" + slotIndex + "].placed"]: false });
    }, 600);
  },

  showSortHint() {
    var targetIndex = this.data.puzzleSlots.findIndex(function(slot) {
      return slot.content !== slot.expected;
    });
    if (targetIndex < 0) {
      this.setData({
        sortHintSlotIndex: -1,
        sortHintSourceSlotIndex: -1,
        sortHintPieceIndex: -1,
        sortHintText: "顺序已经排好，可以检查答案啦"
      });
      return;
    }

    var expected = this.data.puzzleSlots[targetIndex].expected;
    var sourceSlotIndex = this.data.puzzleSlots.findIndex(function(slot, index) {
      return index !== targetIndex && slot.content === expected;
    });
    var pieceIndex = -1;
    if (sourceSlotIndex < 0) {
      pieceIndex = this.data.availablePieces.findIndex(function(piece) {
        return !piece.used && piece.text === expected;
      });
    }
    if (this.gameAudio) this.gameAudio.playEffect("select");
    this.setData({
      sortHintSlotIndex: targetIndex,
      sortHintSourceSlotIndex: sourceSlotIndex,
      sortHintPieceIndex: pieceIndex,
      sortHintText: "先调整第 " + (targetIndex + 1) + " 句，把发亮的句子放到这里"
    });
  },

  checkAnswer() {
    var allCorrect = this.data.puzzleSlots.length > 0 && this.data.puzzleSlots.every(function(slot) {
      return slot.content === slot.expected;
    });
    if (allCorrect) {
      if (this.gameAudio) this.gameAudio.playEffect("correct");
      this.setData({ score: this.data.score + 100, showResultModal: true });
    } else {
      if (this.gameAudio) this.gameAudio.playEffect("wrong");
      this.setData({
        showWrongModal: true,
        sortHintSlotIndex: -1,
        sortHintSourceSlotIndex: -1,
        sortHintPieceIndex: -1,
        sortHintText: ""
      });
    }
  },

  resetPuzzle() {
    if (this.gameAudio) this.gameAudio.playEffect("select");
    this.loadSortPuzzle();
  },

  initTapGame() {
    var challenges = gameCatalog.shuffle(gameCatalog.getLyricTapChallenges()).slice(0, 3).map(function(challenge) {
      return Object.assign({}, challenge, {
        phrases: gameCatalog.shuffle(challenge.phrases).slice(0, Math.min(3, challenge.phrases.length))
      });
    });
    this.setData({ tapChallenges: challenges, currentPuzzle: 0, currentPhraseIndex: 0 });
    this.loadTapChallenge();
  },

  loadTapChallenge() {
    if (this.data.currentPuzzle >= this.data.tapChallenges.length) {
      this.finishGame();
      return;
    }
    var challenge = this.data.tapChallenges[this.data.currentPuzzle];
    this.setData({ currentPuzzleData: challenge, currentPhraseIndex: 0 });
    if (this.gameAudio) this.gameAudio.playMusic(challenge.songId || "");
    this.loadTapPhrase();
  },

  loadTapPhrase() {
    var challenge = this.data.tapChallenges[this.data.currentPuzzle];
    if (!challenge) return;
    var phrase = challenge.phrases[this.data.currentPhraseIndex];
    if (!phrase) {
      if (this.gameAudio) this.gameAudio.playEffect("correct");
      this.setData({ score: this.data.score + 100, showResultModal: true });
      return;
    }
    this.setData({
      currentPhrase: phrase,
      targetCharacters: createTargetCharacters(phrase, 0),
      characterCards: createCharacterCards(phrase),
      matchedCharacterCount: 0,
      isPhraseComplete: false,
      wrongCharacterId: "",
      tapPrompt: "听童谣，按歌词顺序点字"
    });
  },

  selectCharacter(e) {
    if (this.data.isPhraseComplete) return;
    var cardIndex = Number(e.currentTarget.dataset.index);
    var card = this.data.characterCards[cardIndex];
    if (!card || card.used) return;
    var expected = this.data.currentPhrase[this.data.matchedCharacterCount];
    if (card.text !== expected) {
      if (this.gameAudio) this.gameAudio.playEffect("wrong");
      this.setData({ wrongCharacterId: card.id, tapPrompt: "顺序不对，再听一听童谣" });
      var self = this;
      setTimeout(function() {
        if (self.data.wrongCharacterId === card.id) self.setData({ wrongCharacterId: "" });
      }, 650);
      return;
    }
    if (this.gameAudio) this.gameAudio.playEffect("select");
    var nextCount = this.data.matchedCharacterCount + 1;
    var changes = {
      matchedCharacterCount: nextCount,
      isPhraseComplete: nextCount >= this.data.currentPhrase.length,
      targetCharacters: createTargetCharacters(this.data.currentPhrase, nextCount),
      wrongCharacterId: ""
    };
    changes["characterCards[" + cardIndex + "].used"] = true;
    if (nextCount < this.data.currentPhrase.length) {
      changes.tapPrompt = "已找到 " + nextCount + " / " + this.data.currentPhrase.length + " 个字";
    } else {
      changes.tapPrompt = "这一句完成啦";
    }
    this.setData(changes);
    if (nextCount >= this.data.currentPhrase.length) {
      if (this.gameAudio) this.gameAudio.playEffect("correct");
      var self = this;
      setTimeout(function() {
        self.setData({ currentPhraseIndex: self.data.currentPhraseIndex + 1 });
        self.loadTapPhrase();
      }, 650);
    }
  },

  nextPuzzle() {
    if (this.gameAudio) this.gameAudio.playEffect("select");
    this.setData({
      currentPuzzle: this.data.currentPuzzle + 1,
      showResultModal: false,
      showWrongModal: false
    });
    if (this.data.selectedMode === "tap") this.loadTapChallenge();
    else this.loadSortPuzzle();
  },

  finishGame() {
    this.clearGameTimer();
    if (this.gameAudio) {
      this.gameAudio.stopMusic();
      this.gameAudio.playEffect("complete");
    }
    this.setData({ showGameOverModal: true });
  },

  restartGame() {
    if (this.gameAudio) this.gameAudio.playEffect("select");
    this.setData({
      currentPuzzle: 0,
      score: 0,
      elapsedTime: 0,
      startTime: Date.now(),
      showGameOverModal: false
    });
    if (this.data.selectedMode === "tap") this.initTapGame();
    else this.initSortGame();
    this.startTimer();
  },

  startTimer() {
    this.clearGameTimer();
    var self = this;
    var timer = setInterval(function() {
      self.setData({ elapsedTime: Math.floor((Date.now() - self.data.startTime) / 1000) });
    }, 1000);
    this.setData({ gameTimer: timer });
  },

  clearGameTimer() {
    if (this.data.gameTimer) clearInterval(this.data.gameTimer);
    this.setData({ gameTimer: null });
  },

  closeWrongModal() { this.setData({ showWrongModal: false }); },
  noop() {}
});
