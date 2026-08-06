<template>
  <view class="games-page">
    <view class="bg-stars"></view>

    <view class="container">
      <view class="header">
        <view class="back-btn" @tap="goBack">←</view>
        <text class="page-title">游戏乐园</text>
        <view style="width:40rpx;height:40rpx;"></view>
      </view>

      <view class="content">
        <view class="game-card" @tap="start('chain')">
          <view class="card-header">
            <view class="card-icon chain">🔗</view>
            <view>
              <text class="card-title">童谣接龙</text>
              <text class="card-description">根据上一句童谣接出下一句，考验记忆力</text>
            </view>
          </view>
          <view class="difficulty">
            <text class="difficulty-label">难度：</text>
            <view class="difficulty-stars">
              <view class="star filled"></view>
              <view class="star filled"></view>
              <view class="star filled"></view>
            </view>
          </view>
          <view class="game-stats">
            <view class="stat-item"><text>🎯</text><text>准确率: 72%</text></view>
            <view class="stat-item"><text>🏆</text><text>最高分: 980</text></view>
          </view>
        </view>

        <view class="game-card" @tap="start('elimination')">
          <view class="card-header">
            <view class="card-icon chain">🎮</view>
            <view>
              <text class="card-title">童谣消消乐</text>
              <text class="card-description">点击两个相同的童谣词汇进行配对，挑战记忆</text>
            </view>
          </view>
          <view class="difficulty">
            <text class="difficulty-label">难度：</text>
            <view class="difficulty-stars">
              <view class="star filled"></view>
              <view class="star filled"></view>
              <view class="star"></view>
            </view>
          </view>
          <view class="game-stats">
            <view class="stat-item"><text>🎯</text><text>准确率: 78%</text></view>
            <view class="stat-item"><text>🏆</text><text>最高分: 1200</text></view>
          </view>
        </view>

        <view class="game-card" @tap="start('puzzle')">
          <view class="card-header">
            <view class="card-icon puzzle">🧩</view>
            <view>
              <text class="card-title">童谣拼图</text>
              <text class="card-description">将打乱的童谣句子重新排列，锻炼逻辑</text>
            </view>
          </view>
          <view class="difficulty">
            <text class="difficulty-label">难度：</text>
            <view class="difficulty-stars">
              <view class="star filled"></view>
              <view class="star filled"></view>
              <view class="star"></view>
            </view>
          </view>
          <view class="game-stats">
            <view class="stat-item"><text>🎯</text><text>准确率: 85%</text></view>
            <view class="stat-item"><text>🏆</text><text>最高分: 300</text></view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>
<script>
export default {
  name: 'GamesPage',
  methods: {
    goBack() {
      const pages = getCurrentPages();
      if (pages && pages.length > 1) {
        uni.navigateBack();
      } else {
        uni.reLaunch({ url: '/pages/home/home' });
      }
    },
    start(type) {
      if (type === 'chain') {
        uni.redirectTo({ url: '/pages/chain-game/chain-game' });
      } else if (type === 'elimination') {
        uni.redirectTo({ url: '/pages/elimination-game/elimination-game' });
      } else if (type === 'puzzle') {
        uni.redirectTo({ url: '/pages/puzzle-game/puzzle-game' });
      }
    }
  }
};
</script>
<style scoped>
.games-page { min-height: 100vh; background: linear-gradient(135deg,#667eea 0%,#764ba2 100%); position: relative; overflow: hidden; }
.bg-stars { position: absolute; left: 0; top: 0; right: 0; bottom: 0; pointer-events: none; background-image:
  radial-gradient(4rpx 4rpx at 40rpx 60rpx, #ffffff, rgba(255,255,255,0)),
  radial-gradient(4rpx 4rpx at 120rpx 120rpx, rgba(255,255,255,0.8), rgba(255,255,255,0)),
  radial-gradient(6rpx 6rpx at 220rpx 80rpx, #ffffff, rgba(255,255,255,0));
  background-size: 700rpx 400rpx; animation: starTwinkle 4s ease-in-out infinite; z-index:0; }

.container { position: relative; z-index: 1; min-height: 100vh; padding: 40rpx 28rpx 60rpx 28rpx; box-sizing: border-box; }
.header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 40rpx; }
.back-btn { width: 60rpx; height: 60rpx; line-height: 60rpx; text-align: center; border-radius: 50%; background: rgba(255,255,255,0.15); border: 2rpx solid rgba(255,255,255,0.25); color: #fff; }
.page-title { font-size: 36rpx; font-weight: 800; color: #fff; text-shadow: 0 0 20rpx rgba(255,215,0,.7); animation: glow 2s infinite alternate; }

.content { display: flex; flex-direction: column; gap: 24rpx; max-width: 900rpx; margin: 0 auto; }

.game-card { background: rgba(255,255,255,0.12); border: 2rpx solid rgba(255,255,255,0.24); border-radius: 22rpx; padding: 28rpx; box-shadow: 0 16rpx 36rpx rgba(0,0,0,.2); overflow: hidden; transition: transform .2s ease; }
.game-card:active { transform: translateY(-6rpx) scale(1.01); }

.card-header { display: flex; align-items: center; margin-bottom: 18rpx; }
.card-icon { width: 80rpx; height: 80rpx; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 40rpx; margin-right: 20rpx; box-shadow: 0 8rpx 30rpx rgba(79,172,254,.3); }
.card-icon.chain { background: linear-gradient(45deg,#f7971e 0%,#ffd200 100%); }
.card-icon.puzzle { background: linear-gradient(45deg,#4facfe 0%, #00f2fe 100%); }

.card-title { display: block; font-size: 30rpx; font-weight: 700; color: #fff; margin-bottom: 8rpx; }
.card-description { display: block; font-size: 24rpx; color: rgba(255,255,255,0.9); line-height: 1.6; }

.difficulty { display: flex; align-items: center; margin-top: 16rpx; }
.difficulty-label { font-size: 22rpx; color: rgba(255,255,255,0.85); margin-right: 10rpx; }
.difficulty-stars { display: flex; gap: 6rpx; }
.star { width: 18rpx; height: 18rpx; background: linear-gradient(45deg,#FFD700,#FFA500,#FFD700); border-radius: 50%; opacity: .3; }
.star.filled { opacity: 1; }

.game-stats { display: flex; justify-content: space-between; margin-top: 18rpx; font-size: 22rpx; color: rgba(255,255,255,0.85); }
.stat-item { display: flex; align-items: center; gap: 8rpx; }

@keyframes starTwinkle { 0%,100%{ opacity:.4; transform: scale(1); } 50%{ opacity:1; transform: scale(1.2); } }
@keyframes glow { 0%{ text-shadow: 0 0 10rpx rgba(255,215,0,0.5), 0 0 20rpx rgba(255,215,0,0.3); } 100%{ text-shadow: 0 0 20rpx rgba(255,215,0,0.9), 0 0 40rpx rgba(255,215,0,0.6); } }

@media (max-width: 480px) {
  .content { gap: 20rpx; }
  .game-card { padding: 24rpx; }
  .card-icon { width: 64rpx; height: 64rpx; font-size: 32rpx; margin-right: 16rpx; }
  .card-title { font-size: 28rpx; }
  .card-description { font-size: 24rpx; }
}
</style>
