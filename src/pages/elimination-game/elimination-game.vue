<template>
  <view class="elimination-game-page">
    <view class="bg-stars"></view>
    <view class="container">
      <view class="header">
        <view class="back-btn" @tap="goBack">←</view>
        <text class="page-title">🎮 童谣消消乐</text>
        <view></view>
      </view>

      <view class="game-info">
        <text>得分: <text class="info-value">{{ score }}</text></text>
        <text>时间: <text class="info-value">{{ timeLeft }}</text>s</text>
        <text>配对: <text class="info-value">{{ matches }}</text>/8</text>
      </view>

      <view class="message" :class="messageClass">{{ messageText }}</view>

      <view class="game-board">
        <view
          v-for="(cell, index) in gameBoard"
          :key="index"
          class="game-cell"
          :class="{ selected: cell.selected, matched: cell.matched, hidden: cell.matched }"
          @tap="selectCell(index)"
        >{{ cell.word }}</view>
      </view>

      <view class="controls">
        <button class="btn" @tap="startNewGame">🔄 新游戏</button>
        <button class="btn" @tap="showHint">💡 提示</button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'EliminationGamePage',
  data() {
    return {
      words: [
        "小星星", "亮晶晶", "三只小猪", "起间屋",
        "氹氹转", "菊花圆", "炒米饼", "糯米团"
      ],
      gameBoard: [],
      selectedCells: [],
      score: 0,
      matches: 0,
      timeLeft: 60,
      gameTimer: null,
      isGameActive: false,
      messageText: '点击两个相同的童谣词汇进行配对！',
      messageClass: ''
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
      this.gameBoard = [];
      this.selectedCells = [];
      this.score = 0;
      this.matches = 0;
      this.timeLeft = 60;
      this.isGameActive = true;
      this.messageText = '点击两个相同的童谣词汇进行配对！';
      this.messageClass = '';
      
      const pairedWords = [...this.words, ...this.words];
      pairedWords.sort(() => Math.random() - 0.5);
      
      this.gameBoard = pairedWords.map((word, index) => ({
        word: word,
        matched: false,
        selected: false,
        index: index
      }));
      
      this.updateDisplay();
      this.startTimer();
    },
    selectCell(index) {
      if (!this.isGameActive || this.gameBoard[index].matched) return;
      
      const cell = this.gameBoard[index];
      
      if (this.selectedCells.length === 0) {
        this.selectedCells.push(index);
        cell.selected = true;
      } else if (this.selectedCells.length === 1) {
        if (this.selectedCells[0] === index) return;
        
        this.selectedCells.push(index);
        cell.selected = true;
        
        setTimeout(() => {
          this.checkMatch();
        }, 500);
      }
    },
    checkMatch() {
      const [index1, index2] = this.selectedCells;
      const cell1 = this.gameBoard[index1];
      const cell2 = this.gameBoard[index2];
      
      if (cell1.word === cell2.word) {
        cell1.matched = true;
        cell2.matched = true;
        this.score += 100;
        this.matches++;
        
        this.messageText = '🎉 配对成功！';
        this.messageClass = 'success';
        
        if (this.matches === 8) {
          this.endGame(true);
        }
      } else {
        cell1.selected = false;
        cell2.selected = false;
        this.messageText = '❌ 配对失败，请再试一次！';
        this.messageClass = 'error';
      }
      
      this.selectedCells = [];
      this.updateDisplay();
      
      setTimeout(() => {
        this.messageText = '点击两个相同的童谣词汇进行配对！';
        this.messageClass = '';
      }, 2000);
    },
    startTimer() {
      if (this.gameTimer) {
        clearInterval(this.gameTimer);
      }
      this.gameTimer = setInterval(() => {
        if (this.isGameActive) {
          this.timeLeft--;
          this.updateDisplay();
          
          if (this.timeLeft <= 0) {
            this.endGame(false);
          }
        }
      }, 1000);
    },
    endGame(won) {
      this.isGameActive = false;
      if (this.gameTimer) {
        clearInterval(this.gameTimer);
      }
      
      if (won) {
        this.messageText = `🎉 恭喜你！游戏胜利！最终得分: ${this.score}`;
        this.messageClass = 'success';
      } else {
        this.messageText = `⏰ 时间到！游戏结束！最终得分: ${this.score}`;
        this.messageClass = 'error';
      }
    },
    updateDisplay() {
      // 显示已更新
    },
    startNewGame() {
      if (this.gameTimer) {
        clearInterval(this.gameTimer);
      }
      this.initGame();
    },
    showHint() {
      if (!this.isGameActive) return;
      
      for (let i = 0; i < this.gameBoard.length; i++) {
        if (!this.gameBoard[i].matched) {
          const word = this.gameBoard[i].word;
          for (let j = i + 1; j < this.gameBoard.length; j++) {
            if (!this.gameBoard[j].matched && this.gameBoard[j].word === word) {
              this.messageText = '💡 提示：这两个词汇可以配对！';
              this.messageClass = '';
              
              const hintStyle = 'background: linear-gradient(45deg, #ff6b6b, #ffa8a8);';
              this.gameBoard[i].hintStyle = hintStyle;
              this.gameBoard[j].hintStyle = hintStyle;
              
              setTimeout(() => {
                this.gameBoard[i].hintStyle = '';
                this.gameBoard[j].hintStyle = '';
              }, 1000);
              return;
            }
          }
        }
      }
    }
  }
};
</script>

<style scoped>
.elimination-game-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
  font-size: 32rpx;
  font-weight: bold;
  background: linear-gradient(45deg, #FFD700, #FFA500);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.game-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20rpx;
  font-size: 28rpx;
  color: #fff;
}
.info-value {
  font-weight: bold;
}
.message {
  font-size: 28rpx;
  margin: 20rpx 0;
  padding: 20rpx;
  border-radius: 20rpx;
  background: rgba(255,255,255,0.1);
  color: #fff;
  text-align: center;
}
.message.success {
  background: linear-gradient(45deg, #56ab2f, #a8e6cf);
}
.message.error {
  background: linear-gradient(45deg, #ff6b6b, #ffa8a8);
}
.game-board {
  display: flex;
  flex-wrap: wrap;
  margin: 40rpx 0;
  padding: 40rpx;
  background: rgba(255,255,255,0.05);
  border-radius: 30rpx;
}
.game-cell {
  width: calc(25% - 12rpx);
  margin: 6rpx;
  background: rgba(255,255,255,0.2);
  border: 4rpx solid rgba(255,255,255,0.3);
  border-radius: 20rpx;
  padding: 30rpx 15rpx;
  font-size: 24rpx;
  min-height: 120rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  box-sizing: border-box;
  text-align: center;
}
.game-cell.selected {
  background: linear-gradient(45deg, #4facfe, #00f2fe);
  border-color: #00f2fe;
}
.game-cell.matched {
  background: linear-gradient(45deg, #56ab2f, #a8e6cf);
  border-color: #4CAF50;
  animation: matchAnimation 0.5s ease;
}
.game-cell.hidden {
  opacity: 0;
  pointer-events: none;
}
.controls {
  margin: 40rpx 0;
  display: flex;
  justify-content: center;
  gap: 20rpx;
}
.btn {
  background: linear-gradient(45deg, #4facfe, #00f2fe);
  border: none;
  border-radius: 50rpx;
  padding: 24rpx 50rpx;
  color: #fff;
  font-size: 28rpx;
  font-weight: bold;
}
@keyframes starTwinkle {
  0%,100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}
@keyframes matchAnimation {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}
</style>
