<template>
  <view class="original-page">
    <view class="bg-stars"></view>

    <view class="container">
      <view class="header">
        <view class="back-btn" @tap="goBack">←</view>
        <text class="page-title">原创</text>
        <view></view>
      </view>

      <view class="content">
        <view class="song-card" @tap="go('video')">
          <view class="song-header">
            <view class="song-icon">🎬</view>
            <view class="song-info">
              <text class="song-title">视频展示</text>
              <text class="song-author">粤语童谣视频合集</text>
            </view>
          </view>
          <text class="song-preview">观看原创粤语童谣视频，体验传统文化魅力</text>
          <view class="song-tags">
            <text class="tag">视频</text>
            <text class="tag">原创</text>
            <text class="tag">童谣</text>
          </view>
        </view>

        <view class="song-card" @tap="go('book')">
          <view class="song-header">
            <view class="song-icon">📚</view>
            <view class="song-info">
              <text class="song-title">绘本欣赏</text>
              <text class="song-author">粤语童谣绘本故事</text>
            </view>
          </view>
          <text class="song-preview">氹氹转、齐齐望过去、月光光 等经典绘本</text>
          <view class="song-tags">
            <text class="tag">绘本</text>
            <text class="tag">童谣</text>
            <text class="tag">故事</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'OriginalPage',
  methods: {
    goBack() {
      uni.navigateBack({
        fail: () => {
          uni.reLaunch({ url: '/pages/home/home' });
        }
      });
    },
    go(type) {
      if (type === 'book') return uni.navigateTo({ url: '/pages/picture-books/picture-books' });
      if (type === 'video') return uni.navigateTo({ url: '/pages/video-learning/video-learning' });
    }
  }
};
</script>

<style scoped>
.original-page {
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
  margin-bottom: 40rpx;
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
  font-weight: 800;
  color: #fff;
  text-shadow: 0 0 20rpx rgba(255,215,0,.7);
  animation: glow 2s infinite alternate;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  max-width: 900rpx;
  margin: 0 auto;
}

.song-card {
  background: rgba(255,255,255,0.12);
  border: 2rpx solid rgba(255,255,255,0.24);
  border-radius: 22rpx;
  padding: 28rpx;
  box-shadow: 0 16rpx 36rpx rgba(0,0,0,.2);
  overflow: hidden;
  transition: transform .2s ease;
}

.song-card:active {
  transform: translateY(-6rpx) scale(1.01);
}

.song-header {
  display: flex;
  align-items: center;
  margin-bottom: 18rpx;
}

.song-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: linear-gradient(45deg, #4facfe 0%, #00f2fe 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  margin-right: 20rpx;
  box-shadow: 0 8rpx 30rpx rgba(79,172,254,.3);
}

.song-title {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: #fff;
  margin-bottom: 8rpx;
}

.song-author {
  display: block;
  font-size: 24rpx;
  color: rgba(255,255,255,0.9);
}

.song-preview {
  display: block;
  font-size: 24rpx;
  color: rgba(255,255,255,0.9);
  line-height: 1.6;
  margin-top: 10rpx;
  margin-bottom: 14rpx;
}

.song-tags {
  display: flex;
  gap: 12rpx;
  flex-wrap: wrap;
}

.tag {
  background: rgba(255,255,255,0.1);
  border: 2rpx solid rgba(255,255,255,0.2);
  border-radius: 16rpx;
  padding: 6rpx 12rpx;
  font-size: 22rpx;
  color: rgba(255,255,255,0.9);
}

@keyframes starTwinkle {
  0%, 100% {
    opacity: .4;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

@keyframes glow {
  0% {
    text-shadow: 0 0 10rpx rgba(255,215,0,0.5), 0 0 20rpx rgba(255,215,0,0.3);
  }
  100% {
    text-shadow: 0 0 20rpx rgba(255,215,0,0.9), 0 0 40rpx rgba(255,215,0,0.6);
  }
}
</style>
