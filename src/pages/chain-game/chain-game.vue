<template>
  <view class="chain-game-page">
    <view class="bg-stars"></view>
    <view class="container">
      <view class="header">
        <view class="back-btn" @tap="goBack">←</view>
        <text class="page-title">童谣接龙</text>
        <view></view>
      </view>

      <view class="game-stats">
        <view class="stat-item">
          <view class="stat-number">{{ score }}</view>
          <view class="stat-label">得分</view>
        </view>
        <view class="stat-item">
          <view class="stat-number">{{ currentRound + 1 }}</view>
          <view class="stat-label">题目 {{ currentRound + 1 }}/3</view>
        </view>
        <view class="stat-item">
          <view class="stat-number">{{ streak }}</view>
          <view class="stat-label">连胜</view>
        </view>
      </view>

      <view class="game-area">
        <view class="question-title" v-if="currentQuestion">{{ currentQuestion.title }}</view>
        <view class="chain-display">
          <view 
            v-for="(line, idx) in displayedChain" 
            :key="idx" 
            class="chain-line"
            :class="{ current: idx === displayedChain.length - 1 }"
          >{{ line }}</view>
        </view>

        <input 
          class="answer-input" 
          v-model="userAnswer" 
          placeholder="请输入下一句童谣..."
          @confirm="submitAnswer"
          :disabled="gameOver"
        />

        <view class="game-controls">
          <button class="control-btn" @tap="submitAnswer">提交答案</button>
          <button class="control-btn hint" @tap="showHint">💡 提示</button>
          <button 
            v-if="showNextBtn" 
            class="control-btn next" 
            @tap="nextRound"
          >➡️ 下一题</button>
        </view>
      </view>
    </view>

    <!-- 结果弹窗 -->
    <view v-if="showResultModal" class="modal" @tap="closeResultModal">
      <view class="modal-content correct" @tap.stop>
        <view class="modal-title">🎉 接对了！</view>
        <view class="modal-text">+{{ currentScore }} 分</view>
        <button class="modal-btn" @tap="closeResultModal">确定</button>
      </view>
    </view>

    <!-- 错误弹窗 -->
    <view v-if="showWrongModal" class="modal" @tap="closeWrongModal">
      <view class="modal-content wrong" @tap.stop>
        <view class="modal-title">❌ 接错了！</view>
        <view class="modal-text">正确答案是：{{ correctAnswer }}</view>
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

    <!-- 提示弹窗 -->
    <view v-if="showHintModal" class="modal" @tap="closeHintModal">
      <view class="modal-content hint" @tap.stop>
        <view class="modal-title">💡 正确答案</view>
        <view class="modal-text">{{ hintAnswer }}</view>
        <button class="modal-btn" @tap="closeHintModal">确定</button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ChainGamePage',
  data() {
    return {
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
      userAnswer: '',
      currentQuestion: null,
      showNextBtn: false,
      showResultModal: false,
      showWrongModal: false,
      showGameOverModal: false,
      showHintModal: false,
      correctAnswer: '',
      hintAnswer: '',
      currentScore: 0,
      gameOver: false
    };
  },
  onLoad() {
    this.initGame();
  },
  methods: {
    goBack() {
      uni.navigateBack({
        fail: () => {
          uni.reLaunch({ url: '/pages/games/games' });
        }
      });
    },
    randomSelectUniques(array, count) {
      const shuffled = [...array].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, count);
    },
    initGame() {
      this.selectedGames = this.randomSelectUniques(this.gameData, 3);
      this.currentRound = 0;
      this.score = 0;
      this.streak = 0;
      this.gameOver = false;
      this.loadNewChain();
    },
    loadNewChain() {
      if (this.currentRound >= this.selectedGames.length) {
        this.gameOver = true;
        this.showGameOverModal = true;
        return;
      }

      const question = this.selectedGames[this.currentRound];
      this.currentQuestion = question;
      this.currentChain = [...question.chain];
      this.currentChainIndex = 0;
      this.updateChainDisplay();
      this.userAnswer = '';
      this.showNextBtn = false;
    },
    updateChainDisplay() {
      this.displayedChain = [];
      for (let i = 0; i <= this.currentChainIndex; i++) {
        this.displayedChain.push(this.currentChain[i]);
      }
    },
    submitAnswer() {
      if (!this.userAnswer.trim()) {
        this.correctAnswer = this.currentChain[this.currentChainIndex + 1];
        this.showWrongModal = true;
        return;
      }

      const correctAnswer = this.currentChain[this.currentChainIndex + 1];
      const isCorrect = this.userAnswer.trim() === correctAnswer;

      if (isCorrect) {
        const points = 10 + this.streak * 5;
        this.score += points;
        this.currentScore = points;
        this.streak += 1;
        this.showResultModal = true;
        this.currentChainIndex++;
        
        if (this.currentChainIndex + 1 >= this.currentChain.length) {
          this.showNextBtn = true;
        } else {
          this.updateChainDisplay();
        }
      } else {
        this.streak = 0;
        this.correctAnswer = correctAnswer;
        this.showWrongModal = true;
      }

      this.userAnswer = '';
    },
    showHint() {
      const correctAnswer = this.currentChain[this.currentChainIndex + 1];
      this.hintAnswer = correctAnswer;
      this.showHintModal = true;
    },
    nextRound() {
      this.currentRound++;
      this.loadNewChain();
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
    closeHintModal() {
      this.showHintModal = false;
    },
    restartGame() {
      this.showGameOverModal = false;
      this.initGame();
    }
  }
};
</script>

<style scoped>
.chain-game-page {
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
.question-title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 24rpx;
  color: #fff;
}
.chain-display {
  background: rgba(255,255,255,0.15);
  border: 2rpx solid rgba(255,255,255,0.2);
  border-radius: 20rpx;
  padding: 25rpx;
  margin-bottom: 25rpx;
  min-height: 140rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.chain-line {
  font-size: 28rpx;
  color: #fff;
  margin-bottom: 12rpx;
  padding: 12rpx 15rpx;
  background: rgba(255,255,255,0.08);
  border-radius: 12rpx;
  font-weight: 500;
  line-height: 1.4;
}
.chain-line.current {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  font-weight: 700;
  animation: currentLineGlow 2s ease-in-out infinite;
  box-shadow: 0 8rpx 30rpx rgba(79,172,254,0.3);
}
.answer-input {
  width: 100%;
  background: rgba(255,255,255,0.18);
  border: 2rpx solid rgba(255,255,255,0.28);
  border-radius: 24rpx;
  padding: 26rpx 28rpx;
  font-size: 34rpx;
  color: #fff;
  margin-bottom: 30rpx;
  text-align: center;
  min-height: 96rpx;
  line-height: 1.6;
  box-sizing: border-box;
}
.answer-input::placeholder {
  color: rgba(255,255,255,0.6);
}
.game-controls {
  display: flex;
  gap: 15rpx;
  justify-content: center;
  margin-top: 20rpx;
  flex-wrap: wrap;
}
.control-btn {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  border: none;
  border-radius: 30rpx;
  padding: 15rpx 30rpx;
  font-size: 28rpx;
  font-weight: 700;
  color: #fff;
  box-shadow: 0 8rpx 30rpx rgba(79,172,254,0.3);
  min-width: 120rpx;
}
.control-btn.hint {
  background: linear-gradient(45deg, #FFD700, #FFA500);
  box-shadow: 0 8rpx 30rpx rgba(255,215,0,0.3);
}
.control-btn.next {
  background: linear-gradient(45deg, #667eea, #764ba2);
  box-shadow: 0 8rpx 30rpx rgba(102,126,234,0.3);
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
.modal-content.hint {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  border: 4rpx solid #FFD700;
  box-shadow: 0 30rpx 80rpx rgba(255,215,0,0.4);
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
@keyframes currentLineGlow {
  0%,100% { box-shadow: 0 0 10rpx rgba(79,172,254,0.3); }
  50% { box-shadow: 0 0 30rpx rgba(79,172,254,0.6); }
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