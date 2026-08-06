<template>
  <view class="puzzle-game-page">
    <view class="bg-stars"></view>
    <view class="container">
      <view class="header">
        <view class="back-btn" @tap="goBack">←</view>
        <text class="page-title">⭐ 童谣拼图</text>
        <view class="header-right">
          <text class="question-info">题目: {{ currentPuzzle + 1 }}/3</text>
        </view>
      </view>

      <view class="game-stats">
        <view class="stat-item">
          <view class="stat-number">{{ score }}</view>
          <view class="stat-label">得分</view>
        </view>
        <view class="stat-item">
          <view class="stat-number">{{ currentPuzzle + 1 }}</view>
          <view class="stat-label">拼图</view>
        </view>
        <view class="stat-item">
          <view class="stat-number">{{ elapsedTime }}</view>
          <view class="stat-label">时间(秒)</view>
        </view>
      </view>

      <view class="game-area">
        <view class="puzzle-title">{{ currentPuzzleData.title }}</view>
        
        <view class="puzzle-area">
          <view
            v-for="(slot, index) in puzzleSlots"
            :key="index"
            class="puzzle-slot"
            :class="{ 'drag-over': slot.dragOver, 'placed': slot.placed }"
            :data-position="index"
            @tap="placePiece(index)"
          >{{ slot.content }}</view>
        </view>

        <view class="pieces-area">
          <view
            v-for="(piece, index) in availablePieces"
            :key="index"
            class="puzzle-piece"
            :class="{ selected: selectedPieceIndex === index, used: piece.used }"
            :data-piece="piece"
            @tap="selectPiece(piece, index)"
          >{{ piece.text }}</view>
        </view>

        <view class="game-controls">
          <button class="control-btn" @tap="checkAnswer">✓ 提交答案</button>
          <button class="control-btn warning" @tap="nextPuzzle">下一题</button>
        </view>
      </view>
    </view>

    <!-- 结果弹窗 -->
    <view v-if="showResultModal" class="modal" @tap="closeResultModal">
      <view class="modal-content correct" @tap.stop>
        <view class="modal-title">🎉 拼图完成！</view>
        <view class="modal-text">+100 分</view>
        <button class="modal-btn" @tap="closeResultModal">确定</button>
      </view>
    </view>

    <!-- 错误弹窗 -->
    <view v-if="showWrongModal" class="modal" @tap="closeWrongModal">
      <view class="modal-content wrong" @tap.stop>
        <view class="modal-title">❌ 拼图不正确</view>
        <view class="modal-text">还有拼图块位置不正确，请继续调整！</view>
        <button class="modal-btn" @tap="closeWrongModal">确定</button>
      </view>
    </view>

    <!-- 游戏结束弹窗 -->
    <view v-if="showGameOverModal" class="modal" @tap="closeGameOverModal">
      <view class="modal-content game-over" @tap.stop>
        <view class="modal-title">🎊 游戏结束！</view>
        <view class="modal-text">最终得分：{{ score }} 分</view>
        <button class="modal-btn" @tap="restartGame">重新开始</button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'PuzzleGamePage',
  data() {
    return {
      puzzleData: [
        {
          title: "拼出完整的童谣：鸡公仔",
          pieces: [
            "鸡公仔，尾婆婆",
            "三岁孩儿学唱歌",
            "唔使爹娘教导我",
            "自己精乖冇奈何"
          ]
        },
        {
          title: "拼出完整的童谣：月光光",
          pieces: [
            "月光光，照地堂",
            "年卅晚，摘槟榔",
            "槟榔香，摘子姜",
            "子姜辣，买胡辣"
          ]
        },
        {
          title: "拼出完整的童谣：落雨大",
          pieces: [
            "落雨大，水浸街",
            "阿哥担柴上街卖",
            "阿嫂出街着花鞋",
            "花鞋花袜花腰带"
          ]
        }
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
    };
  },
  onLoad() {
    this.initGame();
  },
  onUnload() {
    if (this.gameTimer) {
      clearInterval(this.gameTimer);
    }
  },
  methods: {
    goBack() {
      if (this.gameTimer) {
        clearInterval(this.gameTimer);
      }
      uni.navigateBack({
        fail: () => {
          uni.reLaunch({ url: '/pages/games/games' });
        }
      });
    },
    initGame() {
      this.currentPuzzle = 0;
      this.score = 0;
      this.startTime = Date.now();
      this.updateStats();
      this.loadPuzzle();
      this.startTimer();
    },
    loadPuzzle() {
      if (this.currentPuzzle >= this.puzzleData.length) {
        this.showGameOverModal = true;
        return;
      }

      const puzzle = this.puzzleData[this.currentPuzzle];
      this.currentPuzzleData = puzzle;
      
      this.puzzleSlots = puzzle.pieces.map((piece, index) => ({
        content: '',
        expected: piece,
        position: index,
        dragOver: false,
        placed: false
      }));

      const shuffledPieces = [...puzzle.pieces].sort(() => Math.random() - 0.5);
      this.availablePieces = shuffledPieces.map((piece, index) => ({
        text: piece,
        index: index,
        used: false
      }));

      this.selectedPiece = null;
      this.selectedPieceIndex = -1;
    },
    selectPiece(piece, index) {
      if (piece.used) return;
      if (this.selectedPieceIndex === index) {
        this.selectedPiece = null;
        this.selectedPieceIndex = -1;
      } else {
        this.selectedPiece = piece.text;
        this.selectedPieceIndex = index;
      }
    },
    placePiece(slotIndex) {
      if (this.selectedPiece && this.selectedPieceIndex >= 0 && slotIndex !== undefined) {
        const slot = this.puzzleSlots[slotIndex];
        if (!slot.content) {
          slot.content = this.selectedPiece;
          slot.placed = true;
          
          const piece = this.availablePieces[this.selectedPieceIndex];
          if (piece) {
            piece.used = true;
          }
          
          this.selectedPiece = null;
          this.selectedPieceIndex = -1;
          
          setTimeout(() => {
            slot.placed = false;
          }, 1000);
        }
      }
    },
    checkAnswer() {
      let correctCount = 0;
      let totalSlots = this.puzzleSlots.length;
      
      this.puzzleSlots.forEach(slot => {
        if (slot.content === slot.expected) {
          correctCount++;
        }
      });
      
      if (correctCount === totalSlots) {
        this.score += 100;
        this.showResultModal = true;
        
        setTimeout(() => {
          this.nextPuzzle();
        }, 2000);
      } else {
        this.showWrongModal = true;
      }
    },
    nextPuzzle() {
      this.currentPuzzle++;
      this.showResultModal = false;
      this.loadPuzzle();
    },
    startTimer() {
      if (this.gameTimer) {
        clearInterval(this.gameTimer);
      }
      this.gameTimer = setInterval(() => {
        this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
      }, 1000);
    },
    updateStats() {
      // 显示已更新
    },
    closeResultModal() {
      this.showResultModal = false;
    },
    closeWrongModal() {
      this.showWrongModal = false;
    },
    closeGameOverModal() {
      this.showGameOverModal = false;
    },
    restartGame() {
      this.showGameOverModal = false;
      this.initGame();
    }
  }
};
</script>

<style scoped>
.puzzle-game-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #6e45e2 0%, #88d3ce 100%);
  position: relative;
  overflow: hidden;
}
.bg-stars {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  background-image: 
    radial-gradient(4rpx 4rpx at 40rpx 60rpx, #ffffff, rgba(255,255,255,0)),
    radial-gradient(4rpx 4rpx at 120rpx 120rpx, rgba(255,255,255,0.8), rgba(255,255,255,0)),
    radial-gradient(6rpx 6rpx at 220rpx 80rpx, #ffffff, rgba(255,255,255,0));
  background-size: 700rpx 400rpx;
  animation: starTwinkle 4s ease-in-out infinite;
  z-index: 0;
}
.container {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  padding: 40rpx 28rpx 60rpx 28rpx;
  box-sizing: border-box;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30rpx;
}
.back-btn {
  width: 60rpx;
  height: 60rpx;
  line-height: 60rpx;
  text-align: center;
  border-radius: 50%;
  background: rgba(255,255,255,0.15);
  border: 2rpx solid rgba(255,255,255,0.25);
  color: #fff;
}
.page-title {
  font-size: 36rpx;
  font-weight: 900;
  color: #FFD700;
  text-shadow: 0 0 20rpx rgba(255,215,0,0.5);
  animation: titleGlow 3s ease-in-out infinite alternate;
}
.header-right {
  font-size: 24rpx;
  color: #fff;
}
.game-stats {
  display: flex;
  gap: 20rpx;
  margin-bottom: 30rpx;
  justify-content: center;
}
.stat-item {
  background: rgba(255,255,255,0.15);
  border: 2rpx solid rgba(255,255,255,0.2);
  border-radius: 20rpx;
  padding: 20rpx 15rpx;
  text-align: center;
  min-width: 90rpx;
  box-shadow: 0 8rpx 30rpx rgba(0,0,0,0.1);
}
.stat-number {
  font-size: 32rpx;
  font-weight: 800;
  color: #fff;
  margin-bottom: 8rpx;
}
.stat-label {
  font-size: 22rpx;
  color: rgba(255,255,255,0.8);
  font-weight: 500;
}
.game-area {
  background: rgba(255,255,255,0.1);
  border: 2rpx solid rgba(255,255,255,0.2);
  border-radius: 20rpx;
  padding: 30rpx;
  text-align: center;
}
.puzzle-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #fff;
  margin-bottom: 30rpx;
}
.puzzle-area {
  background: rgba(255,255,255,0.15);
  border: 2rpx solid rgba(255,255,255,0.2);
  border-radius: 15rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  min-height: 300rpx;
}
.puzzle-slot {
  background: rgba(255,255,255,0.08);
  border: 4rpx dashed rgba(255,255,255,0.3);
  border-radius: 15rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  min-height: 100rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 28rpx;
  box-sizing: border-box;
}
.puzzle-slot.drag-over {
  border-color: rgba(79,172,254,0.8);
  background: rgba(79,172,254,0.2);
  box-shadow: 0 0 40rpx rgba(79,172,254,0.3);
}
.puzzle-slot.placed {
  background: rgba(86,171,47,0.2);
  border-color: rgba(86,171,47,0.8);
  box-shadow: 0 0 30rpx rgba(86,171,47,0.4);
}
.pieces-area {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20rpx;
  margin-bottom: 30rpx;
}
.puzzle-piece {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  border: 2rpx solid rgba(255,255,255,0.2);
  border-radius: 15rpx;
  padding: 24rpx 40rpx;
  font-size: 28rpx;
  font-weight: 600;
  color: #fff;
  box-shadow: 0 8rpx 30rpx rgba(79,172,254,0.3);
  box-sizing: border-box;
}
.puzzle-piece.selected {
  border-color: #FFD700;
  box-shadow: 0 8rpx 30rpx rgba(255,215,0,0.5);
  transform: scale(1.05);
}
.puzzle-piece.used {
  opacity: 0.3;
  pointer-events: none;
}
.game-controls {
  display: flex;
  gap: 20rpx;
  justify-content: center;
  margin-top: 30rpx;
}
.control-btn {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  border: none;
  border-radius: 25rpx;
  padding: 20rpx 40rpx;
  font-size: 28rpx;
  font-weight: 600;
  color: #fff;
  box-shadow: 0 8rpx 30rpx rgba(79,172,254,0.3);
}
.control-btn.warning {
  background: linear-gradient(135deg, #f7971e 0%, #ffd200 100%);
  box-shadow: 0 8rpx 30rpx rgba(247,151,30,0.3);
}
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-content {
  background: rgba(255,255,255,0.1);
  border: 2rpx solid rgba(255,255,255,0.2);
  border-radius: 20rpx;
  padding: 40rpx;
  max-width: 90%;
  text-align: center;
  animation: modalShow 0.3s ease-out;
}
.modal-content.correct {
  background: linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%);
  border: 4rpx solid #4CAF50;
  box-shadow: 0 30rpx 80rpx rgba(86,171,47,0.4);
  animation: correctBounce 0.6s ease-out;
}
.modal-content.wrong {
  background: linear-gradient(135deg, #ff6b6b 0%, #ffa8a8 100%);
  border: 4rpx solid #f44336;
  box-shadow: 0 30rpx 80rpx rgba(255,107,107,0.4);
  animation: wrongShake 0.6s ease-out;
}
.modal-content.game-over {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: 4rpx solid #9C27B0;
  box-shadow: 0 30rpx 80rpx rgba(102,126,234,0.4);
}
.modal-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #fff;
  margin-bottom: 20rpx;
}
.modal-text {
  font-size: 28rpx;
  color: rgba(255,255,255,0.9);
  line-height: 1.6;
  margin-bottom: 30rpx;
}
.modal-btn {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  border: none;
  border-radius: 25rpx;
  padding: 20rpx 50rpx;
  font-size: 28rpx;
  font-weight: 600;
  color: #fff;
}
@keyframes starTwinkle {
  0%,100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}
@keyframes titleGlow {
  0% { text-shadow: 0 0 10rpx rgba(255,215,0,0.5), 0 0 20rpx rgba(255,215,0,0.3); }
  100% { text-shadow: 0 0 20rpx rgba(255,215,0,0.8), 0 0 40rpx rgba(255,215,0,0.6); }
}
@keyframes modalShow {
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes correctBounce {
  0% { transform: scale(0.8); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}
@keyframes wrongShake {
  0%,100% { transform: translateX(0); }
  25% { transform: translateX(-16rpx); }
  75% { transform: translateX(16rpx); }
}
</style>