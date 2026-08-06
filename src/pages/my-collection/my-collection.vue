<template>
  <view class="collection-page">
    <view class="bg-stars"></view>

    <view class="container">
      <view class="header">
        <view class="back-btn" @tap="goBack">←</view>
        <text class="page-title">我的收藏</text>
        <view></view>
      </view>

      <view class="content">
        <view v-if="favorites.length === 0" class="empty-state">
          <text class="empty-icon">📭</text>
          <text class="empty-text">暂无收藏内容</text>
          <text class="empty-hint">快去收藏喜欢的童谣和视频吧！</text>
        </view>

        <view v-else class="collection-list">
          <view 
            v-for="(item, index) in favorites" 
            :key="index"
            class="collection-item"
          >
            <view class="item-icon">{{ getItemIcon(item.type) }}</view>
            <view class="item-info">
              <text class="item-title">{{ item.title }}</text>
              <text class="item-desc">已收藏 · {{ getItemTypeName(item.type) }} · {{ formatDate(item.favorited_at) }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'MyCollectionPage',
  data() {
    return {
      favorites: []
    };
  },
  onLoad() {
    this.loadFavorites();
  },
  onShow() {
    this.loadFavorites();
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
    loadFavorites() {
      const favorites = [];

      // 获取音频收藏（从 audio_likes 读取）
      try {
        const audioLikes = uni.getStorageSync('audio_likes') || {};
        Object.keys(audioLikes).forEach(songId => {
          if (audioLikes[songId] === true) {
            // 提取数字 ID（song1 -> 1, song2 -> 2）
            const numId = songId.replace('song', '');
            const audioData = this.getAudioDataById(parseInt(numId) || songId);
            if (audioData) {
              favorites.push({
                id: songId,
                title: audioData.title,
                type: 'audio',
                favorited_at: new Date().toISOString()
              });
            }
          }
        });
      } catch (e) {
        console.error('读取音频收藏失败:', e);
      }

      // 获取视频收藏（从 video_favorites 读取）
      try {
        const videoFavorites = uni.getStorageSync('video_favorites') || {};
        Object.keys(videoFavorites).forEach(videoId => {
          if (videoFavorites[videoId] === true) {
            const videoData = this.getVideoDataById(videoId);
            if (videoData) {
              favorites.push({
                id: videoId,
                title: videoData.title,
                type: 'video',
                favorited_at: new Date().toISOString()
              });
            }
          }
        });
      } catch (e) {
        console.error('读取视频收藏失败:', e);
      }

      // 获取文章收藏（从 text_science_collections 读取）
      try {
        const textCollections = uni.getStorageSync('text_science_collections') || {};
        Object.keys(textCollections).forEach(articleId => {
          if (textCollections[articleId] === true) {
            favorites.push({
              id: articleId,
              title: this.getArticleTitleById(articleId),
              type: 'article',
              favorited_at: new Date().toISOString()
            });
          }
        });
      } catch (e) {
        console.error('读取文章收藏失败:', e);
      }

      // 按收藏时间倒序排序
      this.favorites = favorites.sort((a, b) => new Date(b.favorited_at) - new Date(a.favorited_at));
    },
    getArticleTitleById(id) {
      const articleMap = {
        'cantonese-history': '粤语童谣的历史起源',
        'festival-rhymes': '传统节日的粤语童谣',
        'language-features': '粤语童谣的语言特色',
        'modern-development': '现代粤语童谣的发展'
      };
      return articleMap[id] || '未知文章';
    },
    getAudioDataById(id) {
      // 支持数字 ID 和字符串 ID (如 song1)
      const numId = typeof id === 'string' ? parseInt(id.replace('song', '')) : id;
      const audioList = [
        { id: 1, title: "小星星" },
        { id: 2, title: "三只小猪" },
        { id: 3, title: "小小姑娘" },
        { id: 4, title: "小鸭学游泳" },
        { id: 5, title: "花 树 草" },
        { id: 6, title: "河边有只羊" },
        { id: 18, title: "月光光" },
        { id: 19, title: "落雨大" },
        { id: 20, title: "氹氹转" },
        { id: 21, title: "何家公鸡何家猜" },
        { id: 22, title: "洗白白" }
      ];
      return audioList.find(item => item.id === numId);
    },
    getVideoDataById(id) {
      const videoList = [
        { id: 'video1', title: "《氹氹转》" },
        { id: 'video2', title: "《齐齐望过去》" },
        { id: 'video3', title: "《月光光》" },
        { id: 'video4', title: "小猪佩奇\"洗白白\"大作战！" },
        { id: 'video5', title: "喜羊羊带你\"齐齐望过去\"！" },
        { id: 'video6', title: "火鸡总动员之\"何家公鸡\"魔性对决" },
        { id: 'video7', title: "海绵宝宝带你\"扒龙船\"！" },
        { id: 'video8', title: "《走进小马宝莉的细小世界》" },
        { id: 'video9', title: "当哪吒遇见\"氹氹转\"" },
        { id: 'video10', title: "《当葫芦娃唱起月光光》" }
      ];
      return videoList.find(item => item.id === id);
    },
    getItemIcon(type) {
      const icons = {
        'audio': '🎵',
        'video': '🎬',
        'article': '📖'
      };
      return icons[type] || '📄';
    },
    getItemTypeName(type) {
      const names = {
        'audio': '音频',
        'video': '视频',
        'article': '文章'
      };
      return names[type] || '未知';
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (date.toDateString() === today.toDateString()) {
        return '今天';
      } else if (date.toDateString() === yesterday.toDateString()) {
        return '昨天';
      } else {
        return date.toLocaleDateString('zh-CN');
      }
    }
  }
};
</script>

<style scoped>
.collection-page {
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
  gap: 20rpx;
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

.collection-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.collection-item {
  background: rgba(255,255,255,0.12);
  border: 2rpx solid rgba(255,255,255,0.24);
  border-radius: 22rpx;
  padding: 28rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 8rpx 24rpx rgba(0,0,0,.15);
}

.item-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: rgba(255,255,255,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  margin-right: 24rpx;
  flex-shrink: 0;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.item-title {
  display: block;
  font-size: 30rpx;
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
