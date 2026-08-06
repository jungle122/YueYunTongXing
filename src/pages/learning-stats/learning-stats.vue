<template>
  <view class="stats-page">
    <view class="bg-stars"></view>

    <view class="container">
      <view class="header">
        <view class="back-btn" @tap="goBack">←</view>
        <text class="page-title">学习统计</text>
        <view></view>
      </view>

      <view class="content">
        <view class="stats-grid">
          <view class="stat-card">
            <text class="stat-number">{{ stats.totalHours }}</text>
            <text class="stat-label">总学习时长(小时)</text>
          </view>
          <view class="stat-card">
            <text class="stat-number">{{ stats.totalLearningDays }}</text>
            <text class="stat-label">学习天数</text>
          </view>
          <view class="stat-card">
            <text class="stat-number">{{ stats.currentStreak }}</text>
            <text class="stat-label">连续学习(天)</text>
          </view>
          <view class="stat-card">
            <text class="stat-number">{{ stats.totalFavorites }}</text>
            <text class="stat-label">收藏内容</text>
          </view>
        </view>

        <view class="category-section">
          <text class="section-title">分类统计</text>
          <view class="category-list">
            <view class="category-item">
              <text class="category-icon">🎵</text>
              <view class="category-info">
                <text class="category-name">音频学习</text>
                <text class="category-desc">{{ stats.categoryStats.audio.count }}次，{{ stats.categoryStats.audio.minutes }}分钟</text>
              </view>
            </view>
            <view class="category-item">
              <text class="category-icon">🎬</text>
              <view class="category-info">
                <text class="category-name">视频学习</text>
                <text class="category-desc">{{ stats.categoryStats.video.count }}次，{{ stats.categoryStats.video.minutes }}分钟</text>
              </view>
            </view>
            <view class="category-item">
              <text class="category-icon">📖</text>
              <view class="category-info">
                <text class="category-name">文章阅读</text>
                <text class="category-desc">{{ stats.categoryStats.article.count }}次，{{ stats.categoryStats.article.minutes }}分钟</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'LearningStatsPage',
  data() {
    return {
      stats: {
        totalHours: 0,
        totalLearningDays: 0,
        currentStreak: 0,
        totalFavorites: 0,
        categoryStats: {
          audio: { count: 0, minutes: 0 },
          video: { count: 0, minutes: 0 },
          article: { count: 0, minutes: 0 }
        }
      }
    };
  },
  onLoad() {
    this.calculateStats();
  },
  onShow() {
    this.calculateStats();
  },
  methods: {
    goBack() {
      const pages = getCurrentPages();
      if (pages && pages.length > 1) {
        uni.navigateBack();
      } else {
        uni.reLaunch({ url: '/pages/home/home' });
      }
    },
    calculateStats() {
      const historyStr = uni.getStorageSync('learningHistory') || '[]';
      const history = JSON.parse(historyStr);
      
      // 计算总学习时间（秒转小时）
      const totalSeconds = history.reduce((total, item) => total + (item.duration || 0), 0);
      this.stats.totalHours = Math.floor(totalSeconds / 3600);

      // 计算学习天数
      const learningDaysSet = new Set();
      history.forEach(item => {
        const date = new Date(item.timestamp).toDateString();
        learningDaysSet.add(date);
      });
      this.stats.totalLearningDays = learningDaysSet.size;

      // 计算连续学习天数
      this.stats.currentStreak = this.calculateStreak(history);

      // 计算收藏数量
      let favoriteCount = 0;
      for (let i = 1; i <= 22; i++) {
        if (uni.getStorageSync(`favorite_audio_${i}`) === 'true') favoriteCount++;
      }
      for (let i = 1; i <= 10; i++) {
        if (uni.getStorageSync(`favorite_video_video${i}`) === 'true') favoriteCount++;
      }
      this.stats.totalFavorites = favoriteCount;

      // 按类型统计
      const categoryStats = {
        audio: { count: 0, totalTime: 0 },
        video: { count: 0, totalTime: 0 },
        article: { count: 0, totalTime: 0 }
      };

      history.forEach(item => {
        if (categoryStats[item.type]) {
          categoryStats[item.type].count++;
          categoryStats[item.type].totalTime += item.duration || 0;
        }
      });

      this.stats.categoryStats = {
        audio: {
          count: categoryStats.audio.count,
          minutes: Math.floor(categoryStats.audio.totalTime / 60)
        },
        video: {
          count: categoryStats.video.count,
          minutes: Math.floor(categoryStats.video.totalTime / 60)
        },
        article: {
          count: categoryStats.article.count,
          minutes: Math.floor(categoryStats.article.totalTime / 60)
        }
      };
    },
    calculateStreak(historyList) {
      if (!historyList || historyList.length === 0) return 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dates = [...new Set(historyList.map(item => {
        const d = new Date(item.timestamp);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      }))].sort((a, b) => b - a);

      let streak = 0;
      let currentDate = new Date(today);
      for (const dateTime of dates) {
        const historyDate = new Date(dateTime);
        const diffDays = Math.floor((currentDate - historyDate) / (1000 * 60 * 60 * 24));
        if (diffDays <= 1) {
          streak++;
          currentDate = historyDate;
        } else {
          break;
        }
      }
      return streak;
    }
  }
};
</script>

<style scoped>
.stats-page {
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
  gap: 32rpx;
  max-width: 900rpx;
  margin: 0 auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
}

.stat-card {
  background: rgba(255,255,255,0.12);
  border: 2rpx solid rgba(255,255,255,0.24);
  border-radius: 22rpx;
  padding: 32rpx;
  text-align: center;
  box-shadow: 0 8rpx 24rpx rgba(0,0,0,.15);
}

.stat-number {
  display: block;
  font-size: 48rpx;
  font-weight: 700;
  color: #fff;
  margin-bottom: 12rpx;
}

.stat-label {
  display: block;
  font-size: 24rpx;
  color: rgba(255,255,255,0.8);
}

.category-section {
  background: rgba(255,255,255,0.12);
  border: 2rpx solid rgba(255,255,255,0.24);
  border-radius: 22rpx;
  padding: 32rpx;
  box-shadow: 0 8rpx 24rpx rgba(0,0,0,.15);
}

.section-title {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #fff;
  margin-bottom: 24rpx;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.category-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: rgba(255,255,255,0.08);
  border-radius: 16rpx;
}

.category-icon {
  font-size: 48rpx;
  margin-right: 20rpx;
}

.category-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.category-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #fff;
}

.category-desc {
  font-size: 24rpx;
  color: rgba(255,255,255,0.7);
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

