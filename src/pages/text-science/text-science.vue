<template>
  <view class="text-science-page">
    <view class="bg-stars"></view>
    <view class="container">
      <view class="header">
        <view class="back-btn" @tap="goBack">←</view>
        <text class="page-title">文字科普</text>
        <view></view>
      </view>

      <view class="content">
        <view v-for="article in articles" :key="article.id" class="text-card" @tap="openArticle(article)">
          <view class="text-header">
            <view class="text-icon" :class="getIconClass(article.id)">{{ article.icon }}</view>
            <view class="text-info">
              <text class="text-title">{{ article.title }}</text>
              <text class="text-description">{{ article.subtitle }}</text>
            </view>
            <view class="text-actions">
              <button class="action-btn read-btn" @tap.stop="openArticle(article)">📖</button>
              <button class="action-btn collect-btn" :class="{collected: collections[article.id]}" @tap.stop="toggleCollect(article)">
                {{ collections[article.id] ? '💖' : '❤️' }}
              </button>
            </view>
          </view>
          <view class="progress-container">
            <view class="progress-bar">
              <view class="progress-fill" :style="{width: (readProgress[article.id] || 0) + '%'}"></view>
            </view>
            <text class="progress-text">已阅读 {{ readProgress[article.id] || 0 }}%</text>
          </view>
        </view>
      </view>

      <!-- 收藏提示框 -->
      <view v-if="showToast" class="collect-toast">
        <text class="toast-icon">{{ toastIcon }}</text>
        <text class="toast-text">{{ toastText }}</text>
      </view>

      <!-- 放大阅读弹窗 -->
      <view v-if="showModal" class="modal-mask" @tap="closeModal">
        <view class="modal-body" @tap.stop>
          <view class="modal-header">
            <view class="modal-header-left">
              <text class="article-section-title">📖 文章内容</text>
              <text class="modal-title">{{ currentArticle.title }}</text>
              <text class="modal-subtitle">{{ currentArticle.subtitle }}</text>
            </view>
            <button class="close-btn" @tap="closeModal">关闭</button>
          </view>
          <scroll-view scroll-y="true" class="modal-content" :scroll-top="scrollTop" @scroll="onScroll" style="height: 100%;">
            <view class="article-content">
              <view class="section-divider">
                <text class="divider-icon">■</text>
                <text class="divider-text">文章内容</text>
              </view>
              
              <view v-for="(p,idx) in (currentArticle.paragraphs || [])" :key="idx" class="article-paragraph">{{ p }}</view>
              
              <view v-if="currentArticle.tips" class="tips-box">
                <view class="tips-header">
                  <text class="tips-icon">💡</text>
                  <text class="tips-title">{{ currentArticle.tipsTitle || '你知道吗？' }}</text>
                </view>
                <text class="tips-content">{{ currentArticle.tips }}</text>
              </view>
              
              <view v-for="(p,idx) in (currentArticle.continuedParagraphs || [])" :key="'cont-' + idx" class="article-paragraph">{{ p }}</view>
              
              <view v-if="currentArticle.features" class="features-box">
                <view class="features-header">
                  <text class="features-icon">⭐</text>
                  <text class="features-title">{{ currentArticle.featuresTitle || '特色' }}</text>
                </view>
                <text class="features-content">{{ currentArticle.features }}</text>
              </view>
              
              <view v-if="currentArticle.conclusion" class="conclusion-paragraph">{{ currentArticle.conclusion }}</view>
            </view>
          </scroll-view>
          <view class="modal-footer">
            <view class="reading-time">⏰ 预计阅读时间: {{ currentArticle.readTime || 3 }}分钟</view>
            <view class="footer-actions">
              <button class="collect-btn-modal" :class="{collected: collections[currentArticle.id]}" @tap="toggleCollect(currentArticle)">{{ collections[currentArticle.id] ? '💖 已收藏' : '❤️ 收藏' }}</button>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'TextSciencePage',
  data() {
    return {
      articles: [
        {
          id: 'cantonese-history',
          icon: '📖',
          title: '粤语童谣的历史起源',
          subtitle: '了解粤语童谣的文化背景',
          paragraphs: [
            '粤语童谣是岭南文化的重要组成部分，承载着深厚的历史文化内涵。这些童谣不仅语言优美，更蕴含着丰富的民俗文化和生活智慧。'
          ],
          tips: '粤语童谣最早可以追溯到明清时期，是岭南地区人民在长期生活中创作的智慧结晶。',
          tipsTitle: '你知道吗？',
          continuedParagraphs: [
            '通过学习粤语童谣，孩子们不仅能掌握粤语发音，更能了解岭南地区的传统文化，培养对家乡文化的认同感。',
            '粤语童谣的传承方式多样，既有口耳相传的传统方式，也有现代的教育传播。每一首童谣都承载着特定的历史背景和文化意义，是了解岭南文化的重要窗口。'
          ],
          readTime: 3
        },
        {
          id: 'festival-rhymes',
          icon: '🏮',
          title: '传统节日的粤语童谣',
          subtitle: '探索节日与童谣的深厚联系',
          paragraphs: [
            '在岭南地区，许多传统节日都有对应的粤语童谣。这些童谣不仅记录了节日的习俗，更传承了深厚的文化内涵。'
          ],
          tips: '春节有"新年好"、中秋节有"月光光"，每个节日都有独特的童谣表达方式。',
          tipsTitle: '节日童谣特色',
          continuedParagraphs: [
            '传统节日的童谣让孩子在歌唱中感受节日的意义，增强文化认同感。这些童谣往往与节日的食物、活动和传统习俗紧密相关，是文化传承的重要载体。'
          ],
          readTime: 2
        },
        {
          id: 'language-features',
          icon: '💬',
          title: '粤语童谣的语言特色',
          subtitle: '四言六言与儿化尾音的音乐性',
          paragraphs: [
            '押韵让语言更具可记性与节奏感，是童谣传播的关键。粤语童谣在押韵方面有着独特的特点，通常采用四言或六言的形式，朗朗上口。',
            '拍手、跺脚等肢体节奏，帮助小朋友在律动中感知语音规律。这种互动式的学习方式，让孩子在游戏中掌握语言。'
          ],
          features: '粤语童谣常使用儿化音和特殊的声调变化，形成独特的音乐性。例如，"小星星"中的押韵和节奏，让童谣易于记忆和传唱。',
          featuresTitle: '语言特色',
          conclusion: '语音学角度看，韵母对押韵最为关键，调值变化增加表现力。粤语的九声调系为童谣提供了丰富的音韵变化，这是普通话所不具备的优势。',
          readTime: 4
        },
        {
          id: 'modern-development',
          icon: '🚀',
          title: '现代粤语童谣的发展',
          subtitle: '数字化时代下的传承与创新',
          paragraphs: [
            '随着时代的发展，粤语童谣也在不断演变。现代教育工作者和艺术家们将传统童谣与现代元素相结合，创造出新的表现形式。',
            '数字化记录与教学应用，拓展了童谣在现代教育中的价值。通过音频、视频和互动应用，童谣的学习变得更加生动有趣。'
          ],
          features: '许多现代粤语童谣融入了教育内容，如数字、颜色、动物等，在保持传统韵味的同时，增加了教育功能。',
          featuresTitle: '现代特色',
          conclusion: '在亲子互动中，童谣是代际文化传承的重要载体。通过现代化的传播方式，粤语童谣得以在新时代继续传承和发展。',
          readTime: 3
        }
      ],
      showModal: false,
      currentArticle: {},
      collections: {},
      readProgress: {},
      scrollTop: 0,
      showToast: false,
      toastText: '',
      toastIcon: ''
    };
  },
  onLoad() {
    const collections = uni.getStorageSync('text_science_collections') || {};
    const read = uni.getStorageSync('text_science_read_progress') || {};
    this.collections = collections;
    this.readProgress = read;
  },
  methods: {
    goBack() {
      uni.navigateBack({
        fail: () => {
          uni.reLaunch({ url: '/pages/learn/learn' });
        }
      });
    },
    getIconClass(id) {
      return 'icon-' + id;
    },
    openArticle(article) {
      this.currentArticle = article;
      this.showModal = true;
      this.scrollTop = 0;
      if (!this.readProgress[article.id]) {
        this.readProgress[article.id] = 10;
        this.persistRead();
      }
      // 记录学习历史
      this.recordLearningHistory('article', article.title, article.id);
    },
    closeModal() {
      this.showModal = false;
    },
    toggleCollect(article) {
      const prev = !!this.collections[article.id];
      this.collections[article.id] = !prev;
      uni.setStorageSync('text_science_collections', this.collections);
      
      // 显示自定义提示框
      this.toastText = !prev ? '收藏成功' : '取消收藏';
      // 收藏成功显示💖，取消收藏显示❤️
      this.toastIcon = !prev ? '💖' : '❤️';
      this.showToast = true;
      
      // 1.5秒后隐藏
      setTimeout(() => {
        this.showToast = false;
      }, 1500);
    },
    onScroll(e) {
      if (!this.currentArticle || !this.currentArticle.id) return;
      const id = this.currentArticle.id;
      const scrollTop = e.detail.scrollTop || 0;
      const scrollHeight = e.detail.scrollHeight || 1;
      const clientHeight = e.detail.clientHeight || 1;
      
      const scrolled = scrollTop + clientHeight;
      const progress = Math.min(100, Math.max(10, Math.floor((scrolled / scrollHeight) * 100)));
      
      if (progress !== this.readProgress[id]) {
        this.readProgress[id] = progress;
        this.persistRead();
        // 更新学习历史时长（根据阅读进度）
        this.updateLearningHistoryDuration('article', id, progress);
      }
    },
    updateLearningHistoryDuration(type, itemId, progress) {
      try {
        const historyStr = uni.getStorageSync('learningHistory') || '[]';
        const history = JSON.parse(historyStr);
        
        // 找到最近的匹配记录并更新时长
        for (let i = history.length - 1; i >= 0; i--) {
          if (history[i].itemId === itemId && history[i].type === type) {
            // 根据阅读进度估算时长（每10%进度 = 1分钟）
            history[i].duration = Math.floor(progress / 10) * 60;
            break;
          }
        }
        
        uni.setStorageSync('learningHistory', JSON.stringify(history));
      } catch (e) {
        console.error('更新学习历史时长失败:', e);
      }
    },
    persistRead() {
      uni.setStorageSync('text_science_read_progress', this.readProgress);
    },
    recordLearningHistory(type, title, itemId) {
      try {
        const historyStr = uni.getStorageSync('learningHistory') || '[]';
        const history = JSON.parse(historyStr);
        
        // 检查是否已存在相同记录（同一内容，同一天）
        const today = new Date().toDateString();
        const existingIndex = history.findIndex(item => {
          const itemDate = new Date(item.timestamp).toDateString();
          return item.itemId === itemId && item.type === type && itemDate === today;
        });
        
        if (existingIndex >= 0) {
          // 如果已存在，更新时间戳（表示再次阅读）
          history[existingIndex].timestamp = new Date().toISOString();
          // 根据阅读进度估算时长（阅读进度每增加10%估算1分钟）
          const progress = this.readProgress[itemId] || 0;
          history[existingIndex].duration = Math.floor(progress / 10) * 60;
        } else {
          // 如果不存在，添加新记录
          const progress = this.readProgress[itemId] || 0;
          history.push({
            type: type,
            title: title,
            itemId: itemId,
            timestamp: new Date().toISOString(),
            duration: Math.floor(progress / 10) * 60 // 根据阅读进度估算时长
          });
        }
        
        // 只保留最近100条记录
        if (history.length > 100) {
          history.splice(0, history.length - 100);
        }
        
        uni.setStorageSync('learningHistory', JSON.stringify(history));
      } catch (e) {
        console.error('记录学习历史失败:', e);
      }
    }
  }
};
</script>

<style scoped>
.text-science-page { 
  min-height: 100vh; 
  background: linear-gradient(135deg,#667eea 0%,#764ba2 100%); 
  position: relative; 
  overflow: hidden; 
}
.bg-stars { 
  position: absolute; 
  inset: 0; 
  pointer-events: none; 
  background-image:
    radial-gradient(4rpx 4rpx at 40rpx 60rpx, #ffffff, rgba(255,255,255,0)),
    radial-gradient(4rpx 4rpx at 120rpx 120rpx, rgba(255,255,255,0.8), rgba(255,255,255,0)),
    radial-gradient(6rpx 6rpx at 220rpx 80rpx, #ffffff, rgba(255,255,255,0));
  background-size: 700rpx 400rpx; 
  animation: starTwinkle 4s ease-in-out infinite; 
  z-index:0; 
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
  margin: 0 auto; 
  max-width: 720rpx; 
}
.text-card { 
  background: rgba(255,255,255,0.12); 
  border: 2rpx solid rgba(255,255,255,0.22); 
  border-radius: 22rpx; 
  padding: 32rpx; 
  margin-bottom: 36rpx;
  transition: all 0.3s ease;
  box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.1);
}
.text-card:active { 
  transform: translateY(-4rpx) scale(0.98);
  box-shadow: 0 12rpx 32rpx rgba(0,0,0,0.15);
  background: rgba(255,255,255,0.15);
}
.text-header { 
  display: flex; 
  align-items: center; 
  margin-bottom: 18rpx; 
}
.text-icon { 
  width: 72rpx; 
  height: 72rpx; 
  border-radius: 50%; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  font-size: 36rpx; 
  margin-right: 18rpx; 
  flex-shrink: 0;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.2);
}
.icon-cantonese-history {
  background: linear-gradient(45deg, #4facfe 0%, #00f2fe 100%);
}
.icon-festival-rhymes {
  background: linear-gradient(45deg, #f5576c 0%, #f093fb 100%);
}
.icon-language-features {
  background: linear-gradient(45deg, #43e97b 0%, #38f9d7 100%);
}
.icon-modern-development {
  background: linear-gradient(45deg, #fa709a 0%, #fee140 100%);
}
.text-info { 
  flex: 1; 
  min-width: 0; 
}
.text-title { 
  font-size: 30rpx; 
  font-weight: 700; 
  color: #fff; 
  margin-bottom: 10rpx; 
  display:block; 
  line-height: 1.4; 
}
.text-description { 
  font-size: 24rpx; 
  color: rgba(255,255,255,0.85); 
  display:block; 
  line-height: 1.5; 
}
.text-actions { 
  display: flex; 
  gap: 12rpx; 
  margin-left: 16rpx; 
}
.action-btn { 
  width: 64rpx; 
  height: 64rpx; 
  border-radius: 50%; 
  background: rgba(255,255,255,0.15); 
  border: 2rpx solid rgba(255,255,255,0.25); 
  color: #fff; 
  font-size: 32rpx; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  padding: 0;
  transition: all 0.2s ease;
}
.action-btn:active {
  transform: scale(0.9);
  background: rgba(255,255,255,0.25);
}
.collect-btn.collected { 
  background: rgba(255,107,107,0.3); 
  border-color: rgba(255,107,107,0.5); 
}
.progress-container { 
  margin-top: 18rpx; 
}
.progress-bar { 
  width: 100%; 
  height: 6rpx; 
  background: rgba(255,255,255,0.2); 
  border-radius: 3rpx; 
  overflow: hidden; 
}
.progress-fill { 
  height: 100%; 
  background: linear-gradient(90deg, #9b85f5, #6a88ff); 
  border-radius: 3rpx; 
  transition: width 0.3s ease; 
}
.progress-text { 
  font-size: 22rpx; 
  color: rgba(255,255,255,0.85); 
  margin-top: 8rpx; 
  text-align: right; 
}

/* 弹窗样式 */
.modal-mask { 
  position: fixed; 
  inset: 0; 
  background: rgba(0,0,0,0.6); 
  display:flex; 
  align-items:center; 
  justify-content:center; 
  z-index: 1000; 
}
.modal-body { 
  width: 90vw; 
  max-width: 700rpx; 
  height: 85vh; 
  background: rgba(255,255,255,0.95); 
  border-radius: 24rpx; 
  overflow: hidden; 
  display:flex; 
  flex-direction:column; 
  box-shadow: 0 20rpx 60rpx rgba(0,0,0,0.3); 
}
.modal-header { 
  display:flex; 
  align-items:flex-start; 
  justify-content:space-between; 
  padding: 28rpx 32rpx; 
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
  border-bottom: 2rpx solid rgba(255,255,255,0.1); 
}
.modal-header-left { 
  flex: 1; 
}
.article-section-title { 
  display: block; 
  font-size: 24rpx; 
  color: rgba(255,255,255,0.8); 
  margin-bottom: 8rpx; 
}
.modal-title { 
  display: block; 
  color:#fff; 
  font-size: 32rpx; 
  font-weight: 700; 
  line-height: 1.4; 
  margin-bottom: 6rpx;
}
.modal-subtitle {
  display: block;
  font-size: 24rpx;
  color: rgba(255,255,255,0.9);
  line-height: 1.4;
}
.close-btn { 
  background: rgba(255,255,255,0.25); 
  color:#fff; 
  border:2rpx solid rgba(255,255,255,0.3); 
  padding:12rpx 28rpx; 
  border-radius: 20rpx; 
  font-size: 26rpx; 
}
.modal-content { 
  flex: 1; 
  background:#fff; 
  width: 100%;
  overflow: hidden;
}
.article-content { 
  padding: 32rpx 36rpx 40rpx; 
}
.section-divider {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
  padding-bottom: 16rpx;
  border-bottom: 2rpx solid #e0e0e0;
}
.divider-icon {
  font-size: 24rpx;
  color: #333;
  margin-right: 8rpx;
}
.divider-text {
  font-size: 26rpx;
  font-weight: 600;
  color: #333;
}
.article-paragraph { 
  display:block; 
  color:#333; 
  font-size: 28rpx; 
  line-height: 2; 
  margin-bottom: 24rpx; 
  text-align: justify; 
}
.tips-box { 
  background: linear-gradient(135deg, #fff8dc 0%, #ffeaa7 100%); 
  border-left: 6rpx solid #fdcb6e; 
  border-radius: 16rpx; 
  padding: 24rpx 28rpx; 
  margin: 28rpx 0; 
  box-shadow: 0 4rpx 12rpx rgba(253,203,110,0.2); 
}
.tips-header { 
  display: flex; 
  align-items: center; 
  margin-bottom: 16rpx; 
}
.tips-icon { 
  font-size: 32rpx; 
  margin-right: 12rpx; 
}
.tips-title { 
  font-size: 26rpx; 
  font-weight: 700; 
  color: #d63031; 
}
.tips-content { 
  display: block; 
  font-size: 26rpx; 
  line-height: 1.8; 
  color: #6c5ce7; 
}
.features-box { 
  background: linear-gradient(135deg, #e8f4f8 0%, #ddeef5 100%); 
  border-left: 6rpx solid #74b9ff; 
  border-radius: 16rpx; 
  padding: 24rpx 28rpx; 
  margin: 28rpx 0; 
  box-shadow: 0 4rpx 12rpx rgba(116,185,255,0.2); 
}
.features-header { 
  display: flex; 
  align-items: center; 
  margin-bottom: 16rpx; 
}
.features-icon { 
  font-size: 32rpx; 
  margin-right: 12rpx; 
}
.features-title { 
  font-size: 26rpx; 
  font-weight: 700; 
  color: #0984e3; 
}
.features-content { 
  display: block; 
  font-size: 26rpx; 
  line-height: 1.8; 
  color: #2d3436; 
}
.conclusion-paragraph { 
  display:block; 
  color:#555; 
  font-size: 28rpx; 
  line-height: 2; 
  margin-top: 24rpx; 
  padding-top: 24rpx; 
  border-top: 2rpx solid #e0e0e0; 
}
.modal-footer { 
  display:flex; 
  flex-direction: column; 
  gap: 16rpx; 
  padding: 20rpx 32rpx; 
  background: linear-gradient(135deg, #f5f3ff 0%, #ede7f6 100%); 
  border-top: 2rpx solid #e1bee7; 
}
.reading-time { 
  font-size: 24rpx; 
  color: #666; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
}
.footer-actions { 
  display:flex; 
  justify-content:center; 
}
.collect-btn-modal { 
  font-size: 28rpx; 
  padding: 14rpx 40rpx; 
  background: rgba(255,255,255,0.8); 
  color:#666; 
  border:2rpx solid #ddd; 
  border-radius: 24rpx; 
}
.collect-btn-modal.collected { 
  background: linear-gradient(45deg, #f093fb 0%, #f5576c 100%); 
  color:#fff; 
  border-color: transparent; 
}

/* 收藏提示框样式 */
.collect-toast {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  border-radius: 16rpx;
  padding: 24rpx 40rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
  box-shadow: 0 8rpx 24rpx rgba(79, 172, 254, 0.4);
  z-index: 2000;
  animation: toastShow 0.3s ease-out;
}
.toast-icon {
  font-size: 32rpx;
}
.toast-text {
  font-size: 28rpx;
  font-weight: 600;
  color: #fff;
}
@keyframes toastShow {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.8);
  }
  100% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

@keyframes starTwinkle { 
  0%,100%{ opacity:.4; transform: scale(1); } 
  50%{ opacity:1; transform: scale(1.2); } 
}
@keyframes glow { 
  0%{ text-shadow: 0 0 10rpx rgba(255,215,0,0.5), 0 0 20rpx rgba(255,215,0,0.3); } 
  100%{ text-shadow: 0 0 20rpx rgba(255,215,0,0.9), 0 0 40rpx rgba(255,215,0,0.6); } 
}
</style>
