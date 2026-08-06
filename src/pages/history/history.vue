<template>
  <view class="history-page">
    <view class="bg-stars"></view>

    <view class="container">
      <view class="header">
        <view class="back-btn" @tap="goBack">←</view>
        <text class="page-title">历史记录</text>
        <view></view>
      </view>

      <view class="content">
        <view v-if="historyList.length === 0" class="empty-state">
          <text class="empty-icon">📝</text>
          <text class="empty-text">暂无学习记录</text>
          <text class="empty-hint">开始学习吧，记录会在这里显示</text>
        </view>

        <view v-else>
          <view 
            v-for="(group, date) in groupedHistory" 
            :key="date"
            class="history-section"
          >
            <text class="section-title">{{ date }}</text>
            <view class="history-list">
              <view 
                v-for="(item, index) in group" 
                :key="index"
                class="history-item"
              >
                <view class="item-icon">{{ getItemIcon(item.type) }}</view>
                <view class="item-info">
                  <text class="item-title">{{ item.title }}</text>
                  <text class="item-desc">{{ getItemTypeName(item.type) }} · {{ formatDuration(item.duration) }} · {{ formatTime(item.timestamp) }}</text>
                </view>
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
  name: 'HistoryPage',
  data() {
    return {
      historyList: []
    };
  },
  computed: {
    groupedHistory() {
      const grouped = {};
      this.historyList.forEach(item => {
        const date = new Date(item.timestamp).toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        if (!grouped[date]) {
          grouped[date] = [];
        }
        grouped[date].push(item);
      });
      return grouped;
    }
  },
  onLoad() {
    this.loadHistory();
  },
  onShow() {
    this.loadHistory();
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
    loadHistory() {
      const historyStr = uni.getStorageSync('learningHistory') || '[]';
      const history = JSON.parse(historyStr);
      // 按时间倒序排序
      this.historyList = history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    },
    getItemIcon(type) {
      const icons = {
        'audio': '🎵',
        'video': '🎬',
        'article': '📖',
        'game': '🎮'
      };
      return icons[type] || '📄';
    },
    getItemTypeName(type) {
      const names = {
        'audio': '音频学习',
        'video': '视频学习',
        'article': '文章阅读',
        'game': '游戏练习'
      };
      return names[type] || '未知';
    },
    formatDuration(seconds) {
      if (!seconds || seconds === 0) return '已学习';
      const minutes = Math.floor(seconds / 60);
      if (minutes === 0) return '少于1分钟';
      return `${minutes}分钟`;
    },
    formatTime(timestamp) {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }
};
</script>

<style scoped>
.history-page {
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

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 40rpx;
  text-align: center;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 40rpx;
  opacity: 0.6;
}

.empty-text {
  display: block;
  font-size: 32rpx;
  color: #fff;
  font-weight: 600;
  margin-bottom: 16rpx;
}

.empty-hint {
  display: block;
  font-size: 26rpx;
  color: rgba(255,255,255,0.7);
}

.history-section {
  margin-bottom: 32rpx;
}

.section-title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #fff;
  margin-bottom: 16rpx;
  padding-left: 8rpx;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.history-item {
  background: rgba(255,255,255,0.12);
  border: 2rpx solid rgba(255,255,255,0.24);
  border-radius: 18rpx;
  padding: 24rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 8rpx 24rpx rgba(0,0,0,.15);
}

.item-icon {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: rgba(255,255,255,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.item-title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #fff;
}

.item-desc {
  display: block;
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

