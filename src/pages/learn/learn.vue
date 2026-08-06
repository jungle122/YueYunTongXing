<template>
  <view class="learn-page">
    <view class="bg-stars"></view>

    <view class="container">
      <view class="header">
        <view class="back-btn" @tap="goBack">←</view>
        <text class="page-title">学习天地</text>
        <view></view>
      </view>

      <view class="content">
        <view class="learning-card" @tap="go('audio')">
          <view class="card-header">
            <view class="card-icon">🎵</view>
            <view>
              <text class="card-title">音频学习</text>
              <text class="card-description">听粤语童谣，学习正确发音</text>
            </view>
          </view>
          <view class="progress-bar"><view class="progress-fill" style="width: 75%"></view></view>
          <view class="progress-text">已完成 15/20 首</view>
        </view>

        <view class="learning-card" @tap="go('parent')">
          <view class="card-header">
            <view class="card-icon">👨‍👩‍👧‍👦</view>
            <view>
              <text class="card-title">亲子传唱</text>
              <text class="card-description">与家人一起唱粤语童谣</text>
            </view>
          </view>
          <view class="progress-bar"><view class="progress-fill" style="width: 45%"></view></view>
          <view class="progress-text">已参与 9/20 次</view>
        </view>

        <view class="learning-card" @tap="go('text')">
          <view class="card-header">
            <view class="card-icon">📖</view>
            <view>
              <text class="card-title">文字科普</text>
              <text class="card-description">了解粤语童谣的文化背景</text>
            </view>
          </view>
          <view class="progress-bar"><view class="progress-fill" style="width: 30%"></view></view>
          <view class="progress-text">已阅读 6/20 篇</view>
        </view>
      </view>
    </view>
  </view>
</template>
<script>
export default {
  name: 'LearnPage',
  methods: {
    goBack() {
      const pages = getCurrentPages();
      if (pages && pages.length > 1) {
        uni.navigateBack();
      } else {
        uni.reLaunch({ url: '/pages/home/home' });
      }
    },
    go(type) {
      if (type === 'audio') return uni.redirectTo({ url: '/pages/audio-learning/audio-learning' });
      if (type === 'parent') return uni.redirectTo({ url: '/pages/parent-child-singing/parent-child-singing' });
      if (type === 'text') return uni.redirectTo({ url: '/pages/text-science/text-science' });
    }
  }
};
</script>
<style scoped>
.learn-page { min-height: 100vh; background: linear-gradient(135deg,#667eea 0%,#764ba2 100%); position: relative; overflow: hidden; }
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
.learning-card { background: rgba(255,255,255,0.12); border: 2rpx solid rgba(255,255,255,0.24); border-radius: 22rpx; padding: 28rpx; box-shadow: 0 16rpx 36rpx rgba(0,0,0,.2); overflow: hidden; transition: transform .2s ease; }
.learning-card:active { transform: translateY(-6rpx) scale(1.01); }

.card-header { display: flex; align-items: center; margin-bottom: 18rpx; }
.card-icon { width: 80rpx; height: 80rpx; border-radius: 50%; background: linear-gradient(45deg,#4facfe 0%, #00f2fe 100%); display: flex; align-items: center; justify-content: center; font-size: 40rpx; margin-right: 20rpx; box-shadow: 0 8rpx 30rpx rgba(79,172,254,.3); }
.card-title { display: block; font-size: 30rpx; font-weight: 700; color: #fff; margin-bottom: 8rpx; }
.card-description { display: block; font-size: 24rpx; color: rgba(255,255,255,0.9); line-height: 1.6; }
.progress-bar { width: 100%; height: 12rpx; background: rgba(255,255,255,0.2); border-radius: 6rpx; margin-top: 18rpx; overflow: hidden; }
.progress-fill { height: 100%; background: linear-gradient(45deg,#4facfe,#00f2fe); border-radius: 6rpx; }
.progress-text { font-size: 22rpx; color: rgba(255,255,255,0.85); margin-top: 8rpx; text-align: right; }

@keyframes starTwinkle { 0%,100%{ opacity:.4; transform: scale(1); } 50%{ opacity:1; transform: scale(1.2); } }
@keyframes glow { 0%{ text-shadow: 0 0 10rpx rgba(255,215,0,0.5), 0 0 20rpx rgba(255,215,0,0.3); } 100%{ text-shadow: 0 0 20rpx rgba(255,215,0,0.9), 0 0 40rpx rgba(255,215,0,0.6); } }
</style>
