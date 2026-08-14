var gameCatalog = require("../games/game-catalog.js");
var gameAudioModule = require("../audio-learning/audio-catalog.js");

var MEDIA_TYPE = "pictureBook";
var GRID_SIZE = 3;
var TILE_COUNT = GRID_SIZE * GRID_SIZE;
var MAX_BOARD_WIDTH = 600;
var MAX_BOARD_HEIGHT = 780;
var ROUND_COUNT = 3;

function getLoadError(error) {
  var message = error && (error.message || error.errMsg) ? String(error.message || error.errMsg) : "";
  if (message.indexOf("FUNCTION_NOT_FOUND") !== -1 || message.indexOf("-501000") !== -1) {
    return "媒体服务尚未部署，请联系管理员";
  }
  return "绘本拼图加载失败，请检查网络后重试";
}

function roundLayoutValue(value) {
  return Math.round(value * 100) / 100;
}

function createLayout(imageWidth, imageHeight, fallbackRatio) {
  var sourceWidth = Number(imageWidth || 0);
  var sourceHeight = Number(imageHeight || 0);
  var ratio = sourceWidth > 0 && sourceHeight > 0 ? sourceHeight / sourceWidth : Number(fallbackRatio || 1.5);
  var boardWidth = Math.min(MAX_BOARD_WIDTH, MAX_BOARD_HEIGHT / ratio);
  var boardHeight = boardWidth * ratio;
  var tileWidth = boardWidth / GRID_SIZE;
  var tileHeight = boardHeight / GRID_SIZE;
  tileWidth = roundLayoutValue(tileWidth);
  tileHeight = roundLayoutValue(tileHeight);
  boardWidth = roundLayoutValue(tileWidth * GRID_SIZE);
  boardHeight = roundLayoutValue(tileHeight * GRID_SIZE);
  return {
    ratio: ratio,
    boardWidth: boardWidth,
    boardHeight: boardHeight,
    tileWidth: tileWidth,
    tileHeight: tileHeight,
    boardStyle: "width:" + boardWidth + "rpx;height:" + boardHeight + "rpx;grid-template-columns:repeat(3," + tileWidth + "rpx);grid-template-rows:repeat(3," + tileHeight + "rpx);",
    previewStyle: "width:" + boardWidth + "rpx;height:" + boardHeight + "rpx;",
    slotStyle: "width:" + tileWidth + "rpx;height:" + tileHeight + "rpx;"
  };
}

function createShuffledTiles(imageUrl, layout) {
  var tiles = [];
  for (var index = 0; index < TILE_COUNT; index++) {
    var row = Math.floor(index / GRID_SIZE);
    var column = index % GRID_SIZE;
    var boardOffsetX = roundLayoutValue(column * -layout.tileWidth);
    var boardOffsetY = roundLayoutValue(row * -layout.tileHeight);
    tiles.push({
      id: "tile-" + index,
      correctIndex: index,
      imageUrl: imageUrl,
      boardImageStyle: "width:" + layout.boardWidth + "rpx;height:" + layout.boardHeight + "rpx;left:" + boardOffsetX + "rpx;top:" + boardOffsetY + "rpx;"
    });
  }
  var shuffledTiles = [];
  for (var attempt = 0; attempt < 20; attempt++) {
    shuffledTiles = gameCatalog.shuffle(tiles);
    if (shuffledTiles.every(function(tile, position) { return tile.correctIndex !== position; })) {
      return shuffledTiles;
    }
  }
  return tiles.slice(1).concat(tiles[0]);
}

function createShuffledBoard(imageUrl, layout) {
  return createShuffledTiles(imageUrl, layout).map(function(tile, index) {
    return { index: index, tile: tile, selected: false };
  });
}

function countCorrectSlots(slots) {
  return slots.filter(function(slot, index) {
    return slot.tile && slot.tile.correctIndex === index;
  }).length;
}

Page({
  data: {
    isLoading: true,
    loadError: "",
    rounds: [],
    currentRound: 0,
    currentGame: {},
    phase: "preview",
    previewCountdown: 5,
    boardSlots: [],
    selectedBoardIndex: -1,
    correctCount: 0,
    boardStyle: "",
    previewStyle: "",
    slotStyle: "",
    promptText: "先看看完整绘本，记住画面位置",
    score: 0,
    showGameOver: false,
    musicLoading: false
  },

  onLoad() {
    var self = this;
    this.gameAudio = gameAudioModule.createGameAudio({
      onMusicStateChange: function(state) {
        self.setData({ musicLoading: state.loading });
      }
    });
    this.loadGames();
  },

  onShow() {
    if (this.gameAudio) this.gameAudio.setPageVisible(true);
  },

  onHide() {
    if (this.gameAudio) this.gameAudio.setPageVisible(false);
  },

  onUnload() {
    this.clearPreviewTimer();
    if (this.gameAudio) this.gameAudio.destroy();
  },

  async loadGames() {
    if (this.isLoadingGames) return;
    this.isLoadingGames = true;
    this.setData({ isLoading: true, loadError: "" });
    try {
      var response = await wx.cloud.callFunction({
        name: "getMediaAssets",
        data: { mediaType: MEDIA_TYPE }
      });
      var result = response && response.result;
      if (!result || !result.ok) {
        throw new Error(result && result.message ? result.message : "暂时无法加载绘本资源");
      }
      var mappings = gameCatalog.getPictureBookMappings();
      var groups = result.groups || [];
      var games = mappings.map(function(mapping) {
        var group = groups.find(function(item) { return item.groupId === mapping.groupId; });
        if (!group) return null;
        var imageItem = (group.items || []).find(function(item) {
          return item.id === "page" + mapping.pageNumber;
        });
        var imageUrl = imageItem && imageItem.url;
        if (!imageUrl) return null;
        return Object.assign({}, mapping, {
          imageUrl: imageUrl,
          bookTitle: group.title || mapping.songTitle
        });
      }).filter(Boolean);
      if (games.length !== mappings.length) throw new Error("部分绘本拼图资源暂时不可用");
      this.pictureGamePool = games;
      var rounds = await this.prepareRandomRounds(games);
      this.setData({
        rounds: rounds,
        currentRound: 0,
        score: 0,
        isLoading: false,
        loadError: "",
        showGameOver: false
      });
      this.startRound();
    } catch (error) {
      console.error("加载绘本拼图失败:", error);
      this.setData({ isLoading: false, loadError: getLoadError(error) });
    } finally {
      this.isLoadingGames = false;
    }
  },

  retryLoad() {
    this.loadGames();
  },

  prepareRandomRounds(games) {
    var selectedGames = gameCatalog.shuffle(games).slice(0, ROUND_COUNT);
    return Promise.all(selectedGames.map(this.prepareGameLayout.bind(this)));
  },

  prepareGameLayout(game) {
    return new Promise(function(resolve) {
      wx.getImageInfo({
        src: game.imageUrl,
        success: function(info) {
          resolve(Object.assign({}, game, {
            sourceWidth: info.width,
            sourceHeight: info.height,
            layout: createLayout(info.width, info.height, game.fallbackRatio)
          }));
        },
        fail: function(error) {
          console.warn("读取绘本尺寸失败，使用预设比例:", game.groupId, error);
          resolve(Object.assign({}, game, {
            sourceWidth: 0,
            sourceHeight: 0,
            layout: createLayout(0, 0, game.fallbackRatio)
          }));
        }
      });
    });
  },

  startRound() {
    this.clearPreviewTimer();
    var game = this.data.rounds[this.data.currentRound];
    if (!game) {
      this.finishGame();
      return;
    }
    if (this.gameAudio) this.gameAudio.stopMusic();
    var layout = game.layout || createLayout(0, 0, game.fallbackRatio);
    var slots = createShuffledBoard(game.imageUrl, layout);
    this.setData({
      currentGame: game,
      phase: "preview",
      previewCountdown: 5,
      boardSlots: slots,
      selectedBoardIndex: -1,
      correctCount: 0,
      boardStyle: layout.boardStyle,
      previewStyle: layout.previewStyle,
      slotStyle: layout.slotStyle,
      promptText: "先看看完整绘本，记住画面位置"
    });
    this.startPreviewTimer();
  },

  startPreviewTimer() {
    var self = this;
    var countdown = 5;
    this.previewTimer = setInterval(function() {
      countdown -= 1;
      if (countdown <= 0) {
        self.clearPreviewTimer();
        self.enterPuzzle();
        return;
      }
      self.setData({ previewCountdown: countdown });
    }, 1000);
  },

  clearPreviewTimer() {
    if (this.previewTimer) clearInterval(this.previewTimer);
    this.previewTimer = null;
  },

  enterPuzzle() {
    var correctCount = countCorrectSlots(this.data.boardSlots);
    this.setData({
      phase: "puzzle",
      previewCountdown: 0,
      correctCount: correctCount,
      promptText: "点一块图片，再点另一块交换位置"
    });
    if (this.gameAudio && this.data.currentGame.songId) {
      this.gameAudio.playMusic(this.data.currentGame.songId);
    }
  },

  placeTile(e) {
    if (this.data.phase !== "puzzle") return;
    var slotIndex = Number(e.currentTarget.dataset.index);
    var slot = this.data.boardSlots[slotIndex];
    if (!slot || !slot.tile) return;

    if (this.gameAudio) this.gameAudio.playEffect("select");
    if (this.data.selectedBoardIndex < 0) {
      this.setData({
        selectedBoardIndex: slotIndex,
        ["boardSlots[" + slotIndex + "].selected"]: true,
        promptText: "再点另一块，就能交换两块的位置"
      });
      return;
    }
    if (this.data.selectedBoardIndex === slotIndex) {
      this.setData({
        selectedBoardIndex: -1,
        ["boardSlots[" + slotIndex + "].selected"]: false,
        promptText: "点一块图片，再点另一块交换位置"
      });
      return;
    }
    this.swapBoardTiles(this.data.selectedBoardIndex, slotIndex);
  },

  swapBoardTiles(firstIndex, secondIndex) {
    var slots = this.data.boardSlots.slice();
    var firstTile = slots[firstIndex].tile;
    slots[firstIndex] = Object.assign({}, slots[firstIndex], { tile: slots[secondIndex].tile, selected: false });
    slots[secondIndex] = Object.assign({}, slots[secondIndex], { tile: firstTile, selected: false });
    var correctCount = countCorrectSlots(slots);
    this.setData({
      boardSlots: slots,
      selectedBoardIndex: -1,
      correctCount: correctCount,
      promptText: correctCount === TILE_COUNT ? "完整绘本拼好啦" : "继续交换，已有 " + correctCount + " 块回到正确位置"
    }, () => this.checkCompletedBoard());
  },

  checkCompletedBoard() {
    var isCorrect = this.data.boardSlots.every(function(slot, index) {
      return slot.tile && slot.tile.correctIndex === index;
    });
    if (isCorrect) {
      if (this.gameAudio) this.gameAudio.playEffect("complete");
      this.setData({
        phase: "roundComplete",
        correctCount: TILE_COUNT,
        promptText: "完整绘本拼好啦",
        score: this.data.score + 100
      });
      return;
    }
  },

  nextRound() {
    if (this.gameAudio) this.gameAudio.playEffect("select");
    this.setData({
      currentRound: this.data.currentRound + 1
    }, () => this.startRound());
  },

  skipPreview() {
    if (this.data.phase !== "preview") return;
    this.clearPreviewTimer();
    this.enterPuzzle();
  },

  finishGame() {
    this.clearPreviewTimer();
    if (this.gameAudio) {
      this.gameAudio.stopMusic();
      this.gameAudio.playEffect("complete");
    }
    this.setData({ showGameOver: true });
  },

  async restartGame() {
    if (this.isRestarting || !this.pictureGamePool || this.pictureGamePool.length < ROUND_COUNT) return;
    this.isRestarting = true;
    this.clearPreviewTimer();
    if (this.gameAudio) this.gameAudio.stopMusic();
    this.setData({ isLoading: true, loadError: "", showGameOver: false });
    try {
      var rounds = await this.prepareRandomRounds(this.pictureGamePool);
      this.setData({
        rounds: rounds,
        currentRound: 0,
        score: 0,
        isLoading: false
      }, () => this.startRound());
    } catch (error) {
      console.error("重新抽取绘本拼图失败:", error);
      this.setData({ isLoading: false, loadError: getLoadError(error) });
    } finally {
      this.isRestarting = false;
    }
  },

  onImageError(e) {
    console.error("绘本拼图图片加载失败:", e);
    wx.showToast({ title: "图片加载失败，请检查网络", icon: "none" });
  },

  noop() {}
});
