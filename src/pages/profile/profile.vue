<template>
  <view class="profile-page">
    <view class="bg-stars"></view>

    <view class="container">
      <view class="header">
        <view class="back-btn" @tap="goBack">←</view>
        <view></view>
        <view></view>
      </view>

      <view class="content">
        <!-- 登录状态显示 -->
        <view v-if="isLoggedIn" class="profile-section">
          <view class="profile-header">
            <image 
              v-if="userAvatar" 
              :src="userAvatar" 
              class="avatar" 
              mode="aspectFill"
              @tap="goToSettings"
              @error="onAvatarError"
            />
            <view v-else class="avatar">👤</view>
            <view class="user-info">
              <text class="user-name">{{ userNickname || '用户' }}</text>
              <text class="user-sub">已登录用户</text>
            </view>
          </view>
          
          <view class="stats-grid">
            <view class="stat-item">
              <text class="stat-number">{{ stats.learningDays }}</text>
              <text class="stat-label">学习天数</text>
            </view>
            <view class="stat-item">
              <text class="stat-number">{{ stats.favoriteCount }}</text>
              <text class="stat-label">收藏内容</text>
            </view>
            <view class="stat-item">
              <text class="stat-number">{{ stats.currentStreak }}</text>
              <text class="stat-label">连续学习</text>
            </view>
          </view>
        </view>

        <!-- 未登录状态显示 -->
        <view v-else class="login-section" @tap="goToSettings">
          <text class="login-title">欢迎来到粤韵童行</text>
          <text class="login-subtitle">登录后可享受更多功能</text>
          <view class="login-btn">立即登录</view>
        </view>

        <view class="menu-card" @tap="go('/pages/my-collection/my-collection')">
          <view class="menu-item">
            <view class="menu-icon collection">❤️</view>
            <view class="menu-text">
              <text class="menu-title">我的收藏</text>
              <text class="menu-subtitle">查看收藏的童谣和内容</text>
            </view>
            <text class="menu-arrow">→</text>
          </view>
        </view>

        <view class="menu-card" @tap="go('/pages/history/history')">
          <view class="menu-item">
            <view class="menu-icon history">📚</view>
            <view class="menu-text">
              <text class="menu-title">历史记录</text>
              <text class="menu-subtitle">查看学习历史和进度</text>
            </view>
            <text class="menu-arrow">→</text>
          </view>
        </view>

        <view class="menu-card" @tap="go('/pages/learning-stats/learning-stats')">
          <view class="menu-item">
            <view class="menu-icon stats">📊</view>
            <view class="menu-text">
              <text class="menu-title">学习统计</text>
              <text class="menu-subtitle">查看详细的学习数据分析</text>
            </view>
            <text class="menu-arrow">→</text>
          </view>
        </view>

        <view class="menu-card" @tap="go('/pages/settings/settings')">
          <view class="menu-item">
            <view class="menu-icon settings">⚙️</view>
            <view class="menu-text">
              <text class="menu-title">个性化设置</text>
              <text class="menu-subtitle">头像昵称、学习偏好设置</text>
            </view>
            <text class="menu-arrow">→</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ProfilePage',
  data() {
    return {
      isLoggedIn: false,
      userNickname: '',
      userAvatar: '',
      stats: {
        learningDays: 0,
        favoriteCount: 0,
        currentStreak: 0
      }
    };
  },
  onLoad() {
    this.checkLoginStatus();
    this.loadStats();
  },
  onShow() {
    this.checkLoginStatus();
    this.loadStats();
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
    go(url) {
      uni.navigateTo({ url });
    },
    goToSettings() {
      uni.navigateTo({ url: '/pages/settings/settings' });
    },
    checkLoginStatus() {
      const nickname = uni.getStorageSync('userNickname');
      const avatar = uni.getStorageSync('userAvatar');
      const selectedAvatar = uni.getStorageSync('selectedAvatar');
      
      if (nickname || selectedAvatar) {
        this.isLoggedIn = true;
        this.userNickname = nickname || '用户';
        if (selectedAvatar) {
          const avatarMap = {
            '1': 'https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/Avatars/Avatar1.png',
            '2': 'https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/Avatars/Avatar2.png',
            '3': 'https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/Avatars/Avatar3.png'
          };
          this.userAvatar = avatarMap[String(selectedAvatar)] || '';
        } else {
          this.userAvatar = avatar || '';
        }
      } else {
        this.isLoggedIn = false;
        this.userNickname = '';
        this.userAvatar = '';
      }
    },
    loadStats() {
      // 计算学习天数
      const history = uni.getStorageSync('learningHistory') || '[]';
      const historyList = JSON.parse(history);
      const learningDaysSet = new Set();
      historyList.forEach(item => {
        const date = new Date(item.timestamp).toDateString();
        learningDaysSet.add(date);
      });
      this.stats.learningDays = learningDaysSet.size;

      // 计算收藏数量
      let favoriteCount = 0;
      for (let i = 1; i <= 22; i++) {
        if (uni.getStorageSync(`favorite_audio_${i}`) === 'true') favoriteCount++;
      }
      for (let i = 1; i <= 10; i++) {
        if (uni.getStorageSync(`favorite_video_video${i}`) === 'true') favoriteCount++;
      }
      this.stats.favoriteCount = favoriteCount;

      // 计算连续学习天数
      this.stats.currentStreak = this.calculateStreak(historyList);
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
    },
    onAvatarError() {
      // 头像加载失败时，清空路径显示默认头像
      this.userAvatar = '';
    }
  }
};
</script>

<style scoped>
.profile-page {
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
  margin-bottom: 24rpx;
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

.content {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  max-width: 900rpx;
  margin: 0 auto;
}

.profile-section {
  background: rgba(255,255,255,0.12);
  border: 2rpx solid rgba(255,255,255,0.24);
  border-radius: 22rpx;
  padding: 28rpx;
  box-shadow: 0 16rpx 36rpx rgba(0,0,0,.2);
}

.profile-header {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
}

.avatar {
  width: 90rpx;
  height: 90rpx;
  border-radius: 50%;
  background: linear-gradient(45deg, #4facfe 0%, #00f2fe 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 44rpx;
  margin-right: 20rpx;
  overflow: hidden;
}

.user-info {
  flex: 1;
}

.user-name {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
  color: #fff;
  margin-bottom: 6rpx;
}

.user-sub {
  display: block;
  font-size: 24rpx;
  color: rgba(255,255,255,0.9);
}

.stats-grid {
  display: flex;
  flex-direction: row;
  gap: 18rpx;
}

.stat-item {
  flex: 1;
  text-align: center;
  padding: 20rpx;
  background: rgba(255,255,255,0.08);
  border-radius: 16rpx;
  border: 2rpx solid rgba(255,255,255,0.18);
}

.stat-number {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
  color: #fff;
  margin-bottom: 6rpx;
}

.stat-label {
  display: block;
  font-size: 22rpx;
  color: rgba(255,255,255,0.9);
}

.login-section {
  background: linear-gradient(45deg, #f093fb 0%, #f5576c 100%);
  border: 2rpx solid rgba(255,255,255,0.3);
  border-radius: 22rpx;
  padding: 32rpx;
  text-align: center;
  box-shadow: 0 16rpx 36rpx rgba(0,0,0,.2);
}

.login-title {
  display: block;
  font-size: 36rpx;
  font-weight: 700;
  color: #fff;
  margin-bottom: 16rpx;
}

.login-subtitle {
  display: block;
  font-size: 26rpx;
  color: rgba(255,255,255,0.9);
  margin-bottom: 24rpx;
}

.login-btn {
  display: inline-block;
  background: linear-gradient(45deg, #FFD700, #FFA500, #FFD700);
  border-radius: 50rpx;
  padding: 20rpx 60rpx;
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  box-shadow: 0 8rpx 30rpx rgba(255,215,0,.3);
}

.menu-card {
  background: rgba(255,255,255,0.12);
  border: 2rpx solid rgba(255,255,255,0.24);
  border-radius: 22rpx;
  padding: 22rpx;
  box-shadow: 0 16rpx 36rpx rgba(0,0,0,.2);
  transition: transform .2s ease;
}

.menu-card:active {
  transform: translateY(-4rpx) scale(1.01);
}

.menu-item {
  display: flex;
  align-items: center;
}

.menu-icon {
  width: 66rpx;
  height: 66rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
  margin-right: 18rpx;
  box-shadow: 0 8rpx 30rpx rgba(79,172,254,.3);
  background: linear-gradient(45deg, #4facfe 0%, #00f2fe 100%);
}

.menu-icon.collection {
  background: linear-gradient(45deg, #56ab2f 0%, #a8e6cf 100%);
}

.menu-icon.history {
  background: linear-gradient(45deg, #f7971e 0%, #ffd200 100%);
}

.menu-icon.stats {
  background: linear-gradient(45deg, #4facfe 0%, #00f2fe 100%);
}

.menu-icon.settings {
  background: linear-gradient(45deg, #FFD700, #FFA500, #FFD700);
}

.menu-text {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.menu-title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #fff;
  margin-bottom: 6rpx;
}

.menu-subtitle {
  display: block;
  font-size: 22rpx;
  color: rgba(255,255,255,0.9);
}

.menu-arrow {
  font-size: 28rpx;
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
</style>
