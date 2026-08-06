<template>
  <view class="picture-books-page">
    <view class="bg-stars"></view>
    <view class="container">
      <view class="header">
        <view class="back-btn" @tap="goBack">←</view>
        <text class="page-title">绘本欣赏</text>
        <view></view>
      </view>

      <!-- 绘本选择器 -->
      <view class="book-selector">
        <text class="selector-title">📚 选择绘本</text>
        <view class="book-buttons">
          <button
            v-for="book in books"
            :key="book.id"
            class="book-btn"
            :class="{ active: currentBookId === book.id }"
            @tap="selectBook(book.id)"
          >{{ book.title }}</button>
        </view>
      </view>

      <!-- 绘本查看器 -->
      <view class="book-viewer">
        <text class="book-title">{{ currentBook.title }}</text>
        <text class="book-page-info">第 {{ currentPageIndex + 1 }} 页 / 共 {{ currentBook.pages.length }} 页</text>
        <image 
          :key="imageKey + '-' + currentPageIndex"
          :src="getCurrentPagePath()" 
          mode="widthFix" 
          class="book-image"
          :lazy-load="false"
          :show-menu-by-longpress="false"
          @error="onImageError"
          @load="onImageLoad"
        />
        <view class="page-controls">
          <button 
            class="page-btn" 
            :disabled="currentPageIndex === 0"
            @tap="previousPage"
          >← 上一页</button>
          <button 
            class="page-btn" 
            :disabled="currentPageIndex >= currentBook.pages.length - 1"
            @tap="nextPage"
          >下一页 →</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'PictureBooksPage',
  data() {
    return {
      books: [
        {
          id: 'dangdang',
          title: '氹氹转',
          pages: [
            'https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/picture-books/dangdang/dangdang/page1.jpg',
            'https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/picture-books/dangdang/dangdang/page2.jpg',
            'https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/picture-books/dangdang/dangdang/page3.jpg',
            'https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/picture-books/dangdang/dangdang/page4.jpg',
            'https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/picture-books/dangdang/dangdang/page5.jpg',
            'https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/picture-books/dangdang/dangdang/page6.jpg',
            'https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/picture-books/dangdang/dangdang/page7.jpg',
            'https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/picture-books/dangdang/dangdang/page8.jpg',
            'https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/picture-books/dangdang/dangdang/page9.jpg',
            'https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/picture-books/dangdang/dangdang/page10.jpg',
            'https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/picture-books/dangdang/dangdang/page11.jpg'
          ]
        },
        {
          id: 'qiqi',
          title: '齐齐望过去',
          pages: [
            'https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/picture-books/qiqi/qiqi/page1.jpg',
            'https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/picture-books/qiqi/qiqi/page2.jpg',
            'https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/picture-books/qiqi/qiqi/page3.jpg',
            'https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/picture-books/qiqi/qiqi/page4.jpg',
            'https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/picture-books/qiqi/qiqi/page5.jpg',
            'https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/picture-books/qiqi/qiqi/page6.jpg',
            'https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/picture-books/qiqi/qiqi/page7.jpg'
          ]
        },
        {
          id: 'yueguang',
          title: '月光光',
          pages: [
            'https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/picture-books/yueguang/yueguang/page1.jpg',
            'https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/picture-books/yueguang/yueguang/page2.jpg',
            'https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/picture-books/yueguang/yueguang/page3.jpg',
            'https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/picture-books/yueguang/yueguang/page4.jpg',
            'https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/picture-books/yueguang/yueguang/page5.jpg',
            'https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/picture-books/yueguang/yueguang/page6.jpg',
            'https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/picture-books/yueguang/yueguang/page7.jpg',
            'https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/picture-books/yueguang/yueguang/page8.jpg',
            'https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/picture-books/yueguang/yueguang/page9.jpg',
            'https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/picture-books/yueguang/yueguang/page10.jpg',
            'https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/picture-books/yueguang/yueguang/page11.jpg',
            'https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/picture-books/yueguang/yueguang/page12.jpg',
            'https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/picture-books/yueguang/yueguang/page13.jpg',
            'https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/picture-books/yueguang/yueguang/page14.jpg',
            'https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/picture-books/yueguang/yueguang/page15.jpg'
          ]
        }
      ],
      currentBookId: 'dangdang',
      currentPageIndex: 0,
      imageKey: 0 // 用于强制重新渲染图片组件
    };
  },
  computed: {
    currentBook() {
      return this.books.find(b => b.id === this.currentBookId) || this.books[0];
    }
  },
  onLoad() {
    this.loadBooksFromJSON();
  },
  methods: {
    goBack() {
      uni.navigateBack({
        fail: () => {
          uni.reLaunch({ url: '/pages/original/original' });
        }
      });
    },
    loadBooksFromJSON() {
      uni.request({
        url: '/static/indexes/picture-books.json',
        success: (res) => {
          if (res.statusCode === 200 && Array.isArray(res.data) && res.data.length > 0) {
            // 使用 JSON.parse(JSON.stringify()) 确保数据是纯对象，避免响应式 Proxy
            const booksData = JSON.parse(JSON.stringify(res.data));
            this.books = booksData.map(book => {
              // 确保 pages 是字符串数组，直接使用 JSON 中的完整 URL
              const pages = (book.pages || []).map(page => {
                // 确保 page 是字符串
                let pageStr = '';
                
                if (typeof page === 'string') {
                  pageStr = page.trim(); // 去除可能的空白字符
                } else if (page && typeof page === 'object') {
                  // 如果是对象，尝试获取 url 属性
                  if (page.url && typeof page.url === 'string') {
                    pageStr = page.url.trim();
                  } else {
                    // 如果是对象但没有 url，尝试转换为字符串
                    pageStr = String(page).trim();
                  }
                } else {
                  pageStr = String(page).trim();
                }
                
                // 如果已经是完整的 HTTP URL，直接使用
                if (pageStr && (pageStr.startsWith('http://') || pageStr.startsWith('https://'))) {
                  return pageStr;
                }
                
                // 如果不是 HTTP URL，构建 OSS URL
                // 注意：OSS 实际路径是 picture-books/{bookId}/{bookId}/pageX.jpg
                const base = 'https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com';
                const fileName = pageStr.split('/').pop() || pageStr.split('\\').pop() || pageStr;
                const fullUrl = `${base}/picture-books/${book.id}/${book.id}/${fileName}`;
                console.log('构建图片 URL:', fullUrl);
                return fullUrl;
              });
              
              return {
                id: book.id,
                title: book.title,
                pages: pages
              };
            });
            this.currentBookId = this.books[0].id;
            this.currentPageIndex = 0;
            console.log('绘本数据加载完成，共', this.books.length, '本绘本');
          }
        },
        fail: (err) => {
          console.error('加载绘本列表失败:', err);
          console.log('使用默认数据');
        }
      });
    },
    selectBook(bookId) {
      this.currentBookId = bookId;
      this.currentPageIndex = 0;
      // 强制重新渲染图片
      this.imageKey++;
    },
    getCurrentPagePath() {
      if (!this.currentBook || !this.currentBook.pages || this.currentPageIndex === undefined) {
        console.warn('getCurrentPagePath: 缺少必要数据');
        return '';
      }
      
      const pageData = this.currentBook.pages[this.currentPageIndex];
      if (!pageData) {
        console.warn('页面数据为空，索引:', this.currentPageIndex);
        return '';
      }
      
      // 直接处理字符串类型（最常见情况）
      if (typeof pageData === 'string') {
        const trimmed = pageData.trim();
        // 如果已经是完整的 HTTP URL，直接返回
        if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
          return trimmed;
        }
        // 如果不是完整 URL，构建 OSS URL
        // 注意：OSS 实际路径是 picture-books/{bookId}/{bookId}/pageX.jpg
        const base = 'https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com';
        const bookId = this.currentBookId || this.currentBook.id || 'dangdang';
        // 提取文件名，如果已经是文件名，直接使用
        let fileName = trimmed;
        if (trimmed.includes('/')) {
          fileName = trimmed.split('/').pop() || trimmed;
        } else if (trimmed.includes('\\')) {
          fileName = trimmed.split('\\').pop() || trimmed;
        }
        // 如果文件名不包含扩展名，添加 .jpg
        if (!fileName.includes('.')) {
          fileName = `page${this.currentPageIndex + 1}.jpg`;
        }
        const fullUrl = `${base}/picture-books/${bookId}/${bookId}/${fileName}`;
        return fullUrl;
      }
      
      // 如果是对象，尝试获取 url 属性
      if (typeof pageData === 'object' && pageData !== null) {
        if (pageData.url && typeof pageData.url === 'string') {
          const url = pageData.url.trim();
          if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
          }
        }
      }
      
      // 兜底：构建 OSS URL
      // 注意：OSS 实际路径是 picture-books/{bookId}/{bookId}/pageX.jpg
      const base = 'https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com';
      const bookId = this.currentBookId || this.currentBook.id || 'dangdang';
      const pageStr = String(pageData).trim();
      let fileName = pageStr;
      if (pageStr.includes('/')) {
        fileName = pageStr.split('/').pop() || `page${this.currentPageIndex + 1}.jpg`;
      } else if (pageStr.includes('\\')) {
        fileName = pageStr.split('\\').pop() || `page${this.currentPageIndex + 1}.jpg`;
      } else if (!pageStr.includes('.')) {
        fileName = `page${this.currentPageIndex + 1}.jpg`;
      }
      const fullUrl = `${base}/picture-books/${bookId}/${bookId}/${fileName}`;
      console.log('构建图片 URL (兜底):', fullUrl);
      return fullUrl;
    },
    previousPage() {
      if (this.currentPageIndex > 0) {
        this.currentPageIndex--;
        // 强制重新渲染图片
        this.imageKey++;
      }
    },
    nextPage() {
      if (this.currentPageIndex < this.currentBook.pages.length - 1) {
        this.currentPageIndex++;
        // 强制重新渲染图片
        this.imageKey++;
      }
    },
    onImageLoad(e) {
      const imagePath = this.getCurrentPagePath();
      console.log('图片加载成功:', imagePath);
    },
    onImageError(e) {
      const imagePath = this.getCurrentPagePath();
      console.error('图片加载失败:', {
        path: imagePath,
        error: e,
        currentBook: this.currentBook ? this.currentBook.id : 'unknown',
        currentPageIndex: this.currentPageIndex,
        fullPath: imagePath
      });
      
      // 尝试重试加载（通过更新 key 强制重新渲染）
      setTimeout(() => {
        this.imageKey++;
        console.log('尝试重新加载图片，新 key:', this.imageKey);
      }, 500);
      
      // 如果还是失败，提示用户
      uni.showToast({
        title: '图片加载失败，请检查网络或图片是否存在',
        icon: 'none',
        duration: 3000
      });
    }
  }
};
</script>

<style scoped>
.picture-books-page {
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
  font-size: 36rpx;
  font-weight: 800;
  background: linear-gradient(45deg, #FFD700, #FFA500, #FFD700);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: glow 2s infinite alternate;
}
.book-selector {
  background: rgba(255,255,255,0.12);
  border: 2rpx solid rgba(255,255,255,0.2);
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 30rpx;
  text-align: center;
}
.selector-title {
  display: block;
  color: #fff;
  font-size: 32rpx;
  margin-bottom: 24rpx;
  font-weight: 600;
}
.book-buttons {
  display: flex;
  gap: 16rpx;
  justify-content: center;
}
.book-btn {
  flex: 1;
  background: rgba(255,255,255,0.1);
  border: 4rpx solid transparent;
  border-radius: 12rpx;
  padding: 24rpx;
  color: #fff;
  font-size: 28rpx;
  font-weight: 600;
  transition: all 0.3s;
}
.book-btn.active {
  border-color: #FFD700;
  background: rgba(255,215,0,0.2);
  box-shadow: 0 0 40rpx rgba(255,215,0,0.3);
}
.book-viewer {
  background: rgba(255,255,255,0.12);
  border: 2rpx solid rgba(255,255,255,0.2);
  border-radius: 16rpx;
  padding: 40rpx;
  text-align: center;
  min-height: 600rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.book-title {
  font-size: 36rpx;
  font-weight: 800;
  color: #fff;
  margin-bottom: 16rpx;
  text-shadow: 0 4rpx 8rpx rgba(0,0,0,0.3);
}
.book-page-info {
  font-size: 26rpx;
  color: rgba(255,255,255,0.9);
  margin-bottom: 30rpx;
}
.book-image {
  max-width: 100%;
  max-height: 600rpx;
  border-radius: 12rpx;
  box-shadow: 0 16rpx 64rpx rgba(0,0,0,0.3);
  margin-bottom: 30rpx;
}
.page-controls {
  display: flex;
  justify-content: center;
  gap: 24rpx;
  margin-top: 30rpx;
}
.page-btn {
  background: linear-gradient(45deg, #FFD700, #FFA500, #FFD700);
  border: none;
  border-radius: 12rpx;
  padding: 20rpx 40rpx;
  font-size: 28rpx;
  font-weight: 700;
  color: #333;
  min-width: 200rpx;
  transition: all 0.3s;
}
.page-btn:disabled {
  background: rgba(255,255,255,0.2);
  color: rgba(255,255,255,0.9);
  opacity: 0.5;
}
@keyframes starTwinkle {
  0%,100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}
@keyframes glow {
  0% { opacity: 0.8; }
  100% { opacity: 1; }
}
</style>