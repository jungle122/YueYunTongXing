var gameCatalog = require("../games/game-catalog.js");
var gameAudioModule = require("../audio-learning/audio-catalog.js");

var MEDIA_TYPE = "pictureBook";
var GRID_SIZE = 3;
var TILE_COUNT = GRID_SIZE * GRID_SIZE;
var MAX_BOARD_WIDTH = 600;
var MAX_BOARD_HEIGHT = 900;
var MAX_TRAY_TILE_WIDTH = 160;
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
  var trayTileWidth = roundLayoutValue(Math.min(MAX_TRAY_TILE_WIDTH, tileWidth * 0.82));
  var trayScale = trayTileWidth / tileWidth;
  var trayTileHeight = roundLayoutValue(tileHeight * trayScale);
  var trayImageWidth = roundLayoutValue(trayTileWidth * GRID_SIZE);
  var trayImageHeight = roundLayoutValue(trayTileHeight * GRID_SIZE);

  return {
    ratio: ratio,
    boardWidth: boardWidth,
    boardHeight: boardHeight,
    tileWidth: tileWidth,
    tileHeight: tileHeight,
    trayTileWidth: trayTileWidth,
    trayTileHeight: trayTileHeight,
    trayScale: trayScale,
    trayImageWidth: trayImageWidth,
    trayImageHeight: trayImageHeight,
    boardStyle: "width:" + boardWidth + "rpx;height:" + boardHeight + "rpx;grid-template-columns:repeat(3," + tileWidth + "rpx);grid-template-rows:repeat(3," + tileHeight + "rpx);",
    previewStyle: "width:" + boardWidth + "rpx;height:" + boardHeight + "rpx;",
    slotStyle: "width:" + tileWidth + "rpx;height:" + tileHeight + "rpx;",
    trayStyle: "grid-template-columns:repeat(3," + trayTileWidth + "rpx);",
    trayTileStyle: "width:" + trayTileWidth + "rpx;height:" + trayTileHeight + "rpx;"
  };
}

function createTiles(imageUrl, layout) {
  var tiles = [];
  for (var index = 0; index < TILE_COUNT; index++) {
    var row = Math.floor(index / GRID_SIZE);
    var column = index % GRID_SIZE;
    var boardOffsetX = roundLayoutValue(column * -layout.tileWidth);
    var boardOffsetY = roundLayoutValue(row * -layout.tileHeight);
    var trayOffsetX = roundLayoutValue(boardOffsetX * layout.trayScale);
    var trayOffsetY = roundLayoutValue(boardOffsetY * layout.trayScale);
    tiles.push({
      id: "tile-" + index,
      correctIndex: index,
      imageUrl: imageUrl,
      boardImageStyle: "width:" + layout.boardWidth + "rpx;height:" + layout.boardHeight + "rpx;left:" + boardOffsetX + "rpx;top:" + boardOffsetY + "rpx;",
      trayImageStyle: "width:" + layout.trayImageWidth + "rpx;height:" + layout.trayImageHeight + "rpx;left:" + trayOffsetX + "rpx;top:" + trayOffsetY + "rpx;",
      used: false,
      selected: false
    });
  }
  return gameCatalog.shuffle(tiles);
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
    availableTiles: [],
    selectedTileIndex: -1,
    selectedTileId: "",
    selectedBoardIndex: -1,
    placedCount: 0,
    boardStyle: "",
    previewStyle: "",
    slotStyle: "",
    trayStyle: "",
    trayTileStyle: "",
    promptText: "先看看完整绘本，记住画面位置",
    boardIncorrect: false,
    score: 0,
    showGameOver: false
  },

  onLoad() {
    this.gameAudio = gameAudioModule.createGameAudio();
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
    var slots = [];
    for (var index = 0; index < TILE_COUNT; index++) {
      slots.push({ index: index, tile: null, filled: false });
    }
    this.setData({
      currentGame: game,
      phase: "preview",
      previewCountdown: 5,
      boardSlots: slots,
      availableTiles: createTiles(game.imageUrl, layout),
      selectedTileIndex: -1,
      selectedTileId: "",
      selectedBoardIndex: -1,
      placedCount: 0,
      boardStyle: layout.boardStyle,
      previewStyle: layout.previewStyle,
      slotStyle: layout.slotStyle,
      trayStyle: layout.trayStyle,
      trayTileStyle: layout.trayTileStyle,
      promptText: "先看看完整绘本，记住画面位置",
      boardIncorrect: false
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
    this.setData({
      phase: "puzzle",
      previewCountdown: 0,
      promptText: "先选一块图片，再点想放的位置"
    });
    if (this.gameAudio && this.data.currentGame.songId) {
      this.gameAudio.playMusic(this.data.currentGame.songId);
    }
  },

  selectTile(e) {
    if (this.data.phase !== "puzzle") return;
    var tileIndex = Number(e.currentTarget.dataset.index);
    var tile = this.data.availableTiles[tileIndex];
    if (!tile || tile.used) return;
    if (this.gameAudio) this.gameAudio.playEffect("select");
    var changes = {};
    if (this.data.selectedBoardIndex >= 0) {
      changes["boardSlots[" + this.data.selectedBoardIndex + "].selected"] = false;
      changes.selectedBoardIndex = -1;
    }
    if (this.data.selectedTileIndex >= 0) {
      changes["availableTiles[" + this.data.selectedTileIndex + "].selected"] = false;
    }
    if (this.data.selectedTileIndex === tileIndex) {
      changes.selectedTileIndex = -1;
      changes.selectedTileId = "";
    } else {
      changes["availableTiles[" + tileIndex + "].selected"] = true;
      changes.selectedTileIndex = tileIndex;
      changes.selectedTileId = tile.id;
    }
    this.setData(changes);
  },

  placeTile(e) {
    if (this.data.phase !== "puzzle") return;
    var slotIndex = Number(e.currentTarget.dataset.index);
    var slot = this.data.boardSlots[slotIndex];
    if (!slot) return;

    if (this.data.selectedTileIndex >= 0) {
      if (slot.filled) return;
      var tile = this.data.availableTiles[this.data.selectedTileIndex];
      if (!tile) return;
      if (this.gameAudio) this.gameAudio.playEffect("select");
      var nextPlacedCount = this.data.placedCount + 1;
      var placeChanges = {
        selectedTileIndex: -1,
        selectedTileId: "",
        placedCount: nextPlacedCount,
        boardIncorrect: false,
        promptText: nextPlacedCount === TILE_COUNT ? "已经放满，正在检查完整画面" : "继续摆放，全部放满后再检查"
      };
      placeChanges["boardSlots[" + slotIndex + "].tile"] = tile;
      placeChanges["boardSlots[" + slotIndex + "].filled"] = true;
      placeChanges["availableTiles[" + this.data.selectedTileIndex + "].used"] = true;
      placeChanges["availableTiles[" + this.data.selectedTileIndex + "].selected"] = false;
      this.setData(placeChanges, () => {
        if (nextPlacedCount === TILE_COUNT) this.checkCompletedBoard();
      });
      return;
    }

    if (!slot.filled) {
      if (this.data.selectedBoardIndex >= 0) this.moveBoardTile(this.data.selectedBoardIndex, slotIndex);
      return;
    }

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
        promptText: this.data.placedCount === TILE_COUNT ? "点两块图片可以交换位置" : "继续摆放，全部放满后再检查"
      });
      return;
    }
    this.swapBoardTiles(this.data.selectedBoardIndex, slotIndex);
  },

  moveBoardTile(fromIndex, toIndex) {
    var slots = this.data.boardSlots.slice();
    slots[toIndex] = Object.assign({}, slots[toIndex], { tile: slots[fromIndex].tile, filled: true, selected: false });
    slots[fromIndex] = Object.assign({}, slots[fromIndex], { tile: null, filled: false, selected: false });
    this.setData({
      boardSlots: slots,
      selectedBoardIndex: -1,
      boardIncorrect: false,
      promptText: "继续摆放，全部放满后再检查"
    });
  },

  swapBoardTiles(firstIndex, secondIndex) {
    var slots = this.data.boardSlots.slice();
    var firstTile = slots[firstIndex].tile;
    slots[firstIndex] = Object.assign({}, slots[firstIndex], { tile: slots[secondIndex].tile, selected: false });
    slots[secondIndex] = Object.assign({}, slots[secondIndex], { tile: firstTile, selected: false });
    this.setData({
      boardSlots: slots,
      selectedBoardIndex: -1,
      boardIncorrect: false,
      promptText: "位置已交换，正在重新检查完整画面"
    }, () => {
      if (this.data.placedCount === TILE_COUNT) this.checkCompletedBoard();
    });
  },

  checkCompletedBoard() {
    var isCorrect = this.data.boardSlots.every(function(slot, index) {
      return slot.filled && slot.tile && slot.tile.correctIndex === index;
    });
    if (isCorrect) {
      if (this.gameAudio) this.gameAudio.playEffect("complete");
      this.setData({
        phase: "roundComplete",
        boardIncorrect: false,
        promptText: "完整绘本拼好啦",
        score: this.data.score + 100
      });
      return;
    }
    if (this.gameAudio) this.gameAudio.playEffect("wrong");
    this.setData({
      boardIncorrect: true,
      promptText: "还没有拼成完整画面，点两块图片交换位置"
    });
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
