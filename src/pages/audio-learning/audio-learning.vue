<template>
  <view class="audio-learning-page">
    <view class="bg-stars"></view>
    <view class="container">
      <view class="header">
        <view class="back-btn" @tap="goBack">←</view>
        <text class="page-title">音频学习</text>
        <view></view>
      </view>
      <!-- 收藏提示框 -->
      <view v-if="showToast" class="collect-toast">
        <text class="toast-icon">{{ toastIcon }}</text>
        <text class="toast-text">{{ toastText }}</text>
      </view>

      <view class="content">
        <view v-if="songs.length === 0" class="empty-tip">加载中...</view>
        <view v-for="song in songs" :key="song.id" class="audio-card">
          <view class="audio-header">
            <view class="audio-icon">{{ getSongIcon(song.id) }}</view>
            <view class="audio-info">
              <text class="audio-title">{{ song.title }}</text>
              <text class="audio-author">{{ song.artist }}</text>
            </view>
            <view class="audio-actions">
              <button class="play-btn" @tap="togglePlay(song)">{{ getPlayButtonText(song) }}</button>
              <button class="like-btn" :class="{liked: likes[song.id]}" @tap="toggleLike(song)">{{ likes[song.id] ? '💖' : '❤️' }}</button>
            </view>
          </view>
          <view class="card-actions">
            <button class="lyric-btn" @tap="toggleLyric(song)">{{ lyricOpen[song.id] ? '收起歌词' : '展开歌词' }}</button>
          </view>
          <view v-if="lyricOpen[song.id]" class="lyrics">
            <text v-for="(l,idx) in (song.lyrics||[])" :key="idx" class="lyric-line">{{ l }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>
<script>
export default {
  name: 'AudioLearningPage',
  data(){
    return {
      songs: [],
      audio: null,
      current: null,
      playing: false,
      likes: {},
      progressMap: {},
      lyricOpen: {},
      showToast: false,
      toastText: '',
      toastIcon: '',
      playStartTime: null, // 记录播放开始时间
      playDuration: 0, // 记录播放时长
      isLoadingAudio: false, // UI: 正在缓冲/等待 canplay
      tapGuardTs: 0 // 点击节流
    };
  },
  mounted(){
    this.loadStorageData();
    this.initAudio();
    this.loadAudioList();
  },
  beforeUnmount(){
    if(this.audio){
      this.audio.stop();
      this.audio.destroy();
    }
  },
  methods:{
    goBack() {
      uni.navigateBack({
        fail: () => {
          uni.reLaunch({ url: '/pages/learn/learn' });
        }
      });
    },
    loadAudioList(){
      // 小程序中直接使用数据，避免路径问题
      const base = 'https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/songs';
      const defaultSongs = [
        {"id":"song1","title":"小星星","artist":"经典粤语童谣，学习基础发音","src": `${base}/song1.mp3`, "lyrics": ["一闪一闪小星星，","一闪一闪亮晶晶，","好似钻石天空高，","高高挂天空闪烁。"]},
        {"id":"song2","title":"三只小猪","artist":"经典粤语童谣，学习基础发音","src": `${base}/song2.mp3`, "lyrics": ["三只小猪，三只小猪，","一间屋，起得好坚固。","大猪呀，起间屋，用茅草，","大野狼一到，呼呼声吹跌咗。"]},
        {"id":"song3","title":"小小姑娘","artist":"经典粤语童谣，学习基础发音","src": `${base}/song3.mp3`, "lyrics": ["小小姑娘，清早起床，","提着花篮上市场，","穿过大街走进小巷。"]},
        {"id":"song4","title":"小鸭学游泳","artist":"经典粤语童谣，学习基础发音","src": `${base}/song4.mp3`, "lyrics": ["呷呷呷呷，妈妈说道，","看着湖上水花惊怕了。","大着那胆儿，努力游啊，","你不必怕怕。"]},
        {"id":"song5","title":"花 树 草","artist":"经典粤语童谣，学习基础发音","src": `${base}/song5.mp3`, "lyrics": ["青草处处，多么轻软","小心青草，不要踩断。","树木高高，多么庄健，","绿叶遮荫香风送。"]},
        {"id":"song6","title":"河边有只羊","artist":"经典粤语童谣，学习基础发音","src": `${base}/song6.mp3`, "lyrics": ["河边有只羊，羊边有只象，","象边有只马骝仔，","好似你咁样。"]},
        {"id":"song18","title":"月光光","artist":"经典粤语童谣，学习基础发音","src": `${base}/song18.mp3`, "lyrics": ["月光光，照地堂，","虾仔你乖乖瞓落床。","听朝阿妈要赶插秧啰，","阿爷睇牛佢上山岗喔。"]},
        {"id":"song19","title":"落雨大","artist":"经典粤语童谣，学习基础发音","src": `${base}/song19.mp3`, "lyrics": ["落雨大，水浸街，","阿哥担柴上街卖，","阿嫂出街着花鞋。","花鞋花袜花腰带。"]},
        {"id":"song20","title":"氹氹转","artist":"经典粤语童谣，学习基础发音","src": `${base}/song20.mp3`, "lyrics": ["氹氹转，菊花圆，","炒米饼，糯米团。","阿妈叫我睇龙船，","我唔睇，睇鸡仔。"]},
        {"id":"song21","title":"何家公鸡何家猜","artist":"经典粤语童谣，学习基础发音","src": `${base}/song21.mp3`, "lyrics": ["何家公鸡何家猜，","何家小鸡何家猜，","何家公鸡何家猜，","何家母鸡咯嗒嗒。"]},
        {"id":"song22","title":"洗白白","artist":"经典粤语童谣，学习基础发音","src": `${base}/song22.mp3`, "lyrics": ["洗白白，洗白白，","倒开盆水啰，洗白白。","个身白白似雪花，","倒开盆水啰，洗白白。"]}
      ];
      
      // 先立即设置默认数据，确保页面有内容显示
      this.songs = defaultSongs;
      console.log('初始化歌曲列表，数量:', this.songs.length);
      
      // 不再从本地 /static/indexes/audio.json 读取，避免小程序环境请求本地路径报错
      // 如需远程下发播放清单，可在此处请求你自己的线上 JSON，并按上方 fixed 规则映射到 OSS 路径
    },
    loadStorageData(){
      try {
        const likes = uni.getStorageSync('audio_likes') || {};
        const prog = uni.getStorageSync('audio_progress') || {};
        const lyric = uni.getStorageSync('audio_lyric_open') || {};
        this.likes = likes;
        this.progressMap = prog;
        this.lyricOpen = lyric;
      } catch(e) {
        console.error('加载存储数据失败:', e);
      }
    },
    initAudio(){
      // 全局音频策略（解决 iOS 静音键/混音导致无声问题）
      try {
        if (typeof uni.setInnerAudioOption === 'function') {
          uni.setInnerAudioOption({
            obeyMuteSwitch: false,
            mixWithOther: true,
            speakerOn: true
          });
        }
      } catch(e) { console.log('setInnerAudioOption 调用失败:', e); }

      // 初始化一个空的音频实例；实际播放时会销毁并新建，确保 iOS 下稳定
      if (this.audio) {
        try { this.audio.stop(); } catch(e){}
        try { this.audio.destroy(); } catch(e){}
      }
      this.audio = uni.createInnerAudioContext();
      this.audio.obeyMuteSwitch = false;
      this.audio.volume = 1.0;
      this.audio.loop = false;
      this.audio._canplayHandled = false;
      this.audio._pendingPlay = false;

      this.audio.onPlay(() => {
        this.playing = true;
        this.audio._pendingPlay = false;
        this.isLoadingAudio = false;
        this.playStartTime = Date.now();
        if(this.current) {
          this.recordLearningHistory('audio', this.current.title, this.current.id);
        }
      });
      this.audio.onPause(() => {
        this.playing = false;
        this.isLoadingAudio = false;
        if(this.playStartTime) {
          this.playDuration += Math.floor((Date.now() - this.playStartTime) / 1000);
          this.playStartTime = null;
        }
      });
      this.audio.onStop(() => {
        this.playing = false;
        this.audio._pendingPlay = false;
        this.isLoadingAudio = false;
        if(this.playStartTime) {
          this.playDuration += Math.floor((Date.now() - this.playStartTime) / 1000);
          this.playStartTime = null;
        }
      });
      this.audio.onEnded(() => {
        this.playing = false;
        this.audio._pendingPlay = false;
        this.isLoadingAudio = false;
        if(this.playStartTime && this.current) {
          const duration = Math.floor((Date.now() - this.playStartTime) / 1000);
          this.playDuration += duration;
          this.updateLearningHistoryDuration('audio', this.current.id, this.playDuration);
          this.playStartTime = null;
          this.playDuration = 0;
        }
        if(this.current){
          this.updateProgress(this.current, 100);
        }
      });
      this.audio.onTimeUpdate(() => {
        if(!this.current) return;
        if(this.audio.duration > 0){
          const percent = Math.min(100, Math.floor((this.audio.currentTime / this.audio.duration) * 100));
          this.updateProgress(this.current, percent);
        }
      });
      this.audio.onError((err) => {
        console.error('音频播放错误:', err);
        this.audio._pendingPlay = false;
        this.audio._canplayHandled = false;
        this.isLoadingAudio = false;
        uni.showToast({ title: '音频播放失败', icon: 'none' });
      });
    },
    getSongIcon(songId){
      const iconMap = {
        'song1': '⭐',
        'song2': '🐷',
        'song3': '👧',
        'song4': '🦆',
        'song5': '🌸',
        'song6': '🐑',
        'song18': '🌙',
        'song19': '🌧️',
        'song20': '🌀',
        'song21': '🐓',
        'song22': '🚿'
      };
      return iconMap[songId] || '🎵';
    },
    getPlayButtonText(song){
      if(this.current && this.current.id === song.id && (this.playing || this.isLoadingAudio)){
        return '⏸️';
      }
      return '▶️';
    },
    togglePlay(song){
      // 节流：300ms 内忽略重复点击
      const now = Date.now();
      if (now - this.tapGuardTs < 300) return;
      this.tapGuardTs = now;
      // 如果点击的是同一首歌且正在播放，则暂停
      if(this.current && this.current.id === song.id && this.playing){
        this.audio.pause();
        return;
      }
      
      // 如果点击的是同一首歌且已暂停，则继续播放
      if(this.current && this.current.id === song.id && !this.playing){
        this.audio.play();
        return;
      }
      
      // 如果点击的是不同首歌，从头播放新歌
      // 先保存之前的播放时长
      if(this.current && this.playStartTime) {
        const duration = Math.floor((Date.now() - this.playStartTime) / 1000);
        this.playDuration += duration;
        this.updateLearningHistoryDuration('audio', this.current.id, this.playDuration);
        this.playStartTime = null;
        this.playDuration = 0;
      } else if(this.current && this.playDuration > 0) {
        this.updateLearningHistoryDuration('audio', this.current.id, this.playDuration);
        this.playDuration = 0;
      }
      
      if(this.audio){
        try{ this.audio.stop(); } catch(e){}
        try{ this.audio.destroy(); } catch(e){}
      }
      // 为新歌曲创建全新的实例，避免 iOS 上 audioInstance 未就绪
      this.initAudio();
      this.current = song;
      const base = 'https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/songs';
      const normalizedId = (song.id || '').startsWith('song') ? song.id : `song${song.id}`;
      const audioSrc = `${base}/${normalizedId}.mp3`;
      
      // 重置 canplay 标记
      this.audio._canplayHandled = false;
      this.audio._pendingPlay = false;
      
      // 设置音频源并仅在 canplay 后播放
      this.isLoadingAudio = true; // 仅标记加载中，不提前置 playing，以免阻塞 canplay 触发播放
      this.playing = false;
      this.audio._pendingPlay = true;
      this.audio._canplayHandled = false;
      this.audio.src = audioSrc;
      console.log('设置音频源，路径:', audioSrc);
      const canplayHandler = () => {
        if (this.audio && this.audio._pendingPlay) {
          this.audio._canplayHandled = true;
          try { this.audio.play(); } catch(e) { console.log('play 调用失败', e); }
        }
        if (this.audio && typeof this.audio.offCanplay === 'function') {
          try { this.audio.offCanplay(canplayHandler); } catch(e){}
        }
      };
      if (typeof this.audio.onCanplay === 'function') {
        this.audio.onCanplay(canplayHandler);
      }
      // 冗余兜底：100ms 后再尝试一次，降低等待感知
      setTimeout(() => {
        if (this.audio && this.audio._pendingPlay && !this.playing) {
          try { this.audio.play(); } catch(e){}
        }
      }, 120);
    },
    updateProgress(song, percent){
      if(!song) return;
      this.progressMap[song.id] = percent;
      uni.setStorageSync('audio_progress', this.progressMap);
    },
    toggleLike(song){
      const cur = !!this.likes[song.id];
      this.likes[song.id] = !cur;
      uni.setStorageSync('audio_likes', this.likes);
      
      // 显示自定义提示框
      this.toastText = !cur ? '收藏成功' : '取消收藏';
      // 收藏成功显示💖，取消收藏显示❤️
      this.toastIcon = !cur ? '💖' : '❤️';
      this.showToast = true;
      
      // 1.5秒后隐藏
      setTimeout(() => {
        this.showToast = false;
      }, 1500);
    },
    toggleLyric(song){
      const open = !!this.lyricOpen[song.id];
      this.lyricOpen[song.id] = !open;
      uni.setStorageSync('audio_lyric_open', this.lyricOpen);
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
          // 如果已存在，更新时间戳（表示再次学习）
          history[existingIndex].timestamp = new Date().toISOString();
        } else {
          // 如果不存在，添加新记录
          history.push({
            type: type,
            title: title,
            itemId: itemId,
            timestamp: new Date().toISOString(),
            duration: 0 // 初始时长为0，播放结束时更新
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
    },
    updateLearningHistoryDuration(type, itemId, duration) {
      try {
        const historyStr = uni.getStorageSync('learningHistory') || '[]';
        const history = JSON.parse(historyStr);
        
        // 找到最近的匹配记录并更新时长
        for (let i = history.length - 1; i >= 0; i--) {
          if (history[i].itemId === itemId && history[i].type === type) {
            history[i].duration = (history[i].duration || 0) + duration;
            break;
          }
        }
        
        uni.setStorageSync('learningHistory', JSON.stringify(history));
      } catch (e) {
        console.error('更新学习历史时长失败:', e);
      }
    }
  }
};
</script>
<style scoped>
.audio-learning-page {
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
  font-size: 32rpx;
  text-decoration: none;
}

.page-title {
  font-size: 36rpx;
  font-weight: 800;
  color: #fff;
  text-shadow: 0 0 20rpx rgba(255,215,0,0.7);
  animation: glow 2s infinite alternate;
}

.content {
  margin: 0 auto;
  max-width: 720rpx;
}

.audio-card {
  background: rgba(255,255,255,0.12);
  border: 2rpx solid rgba(255,255,255,0.22);
  border-radius: 22rpx;
  padding: 32rpx;
  margin-bottom: 36rpx;
  backdrop-filter: blur(10rpx);
}

.audio-header {
  display: flex;
  align-items: center;
  margin-bottom: 18rpx;
}

.audio-icon {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: linear-gradient(45deg, #4facfe 0%, #00f2fe 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 34rpx;
  margin-right: 18rpx;
  box-shadow: 0 4rpx 15rpx rgba(79, 172, 254, 0.3);
  flex-shrink: 0;
}

.audio-info {
  flex: 1;
  min-width: 0;
}

.audio-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #fff;
  margin-bottom: 8rpx;
  display: block;
}

.audio-author {
  font-size: 22rpx;
  color: rgba(255,255,255,0.9);
  display: block;
}

.audio-actions {
  display: flex;
  align-items: center;
  gap: 12rpx;
  flex-shrink: 0;
}

.play-btn {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  border: 2rpx solid rgba(255,255,255,0.3);
  color: #fff;
  font-size: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
}

.play-btn:active {
  transform: scale(0.95);
}

.like-btn {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  border: 2rpx solid rgba(255,255,255,0.3);
  color: #fff;
  font-size: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
}

.like-btn.liked {
  background: linear-gradient(45deg, #f093fb 0%, #f5576c 100%);
}

.like-btn:active {
  transform: scale(0.95);
}

.card-actions {
  display: flex;
  gap: 16rpx;
  margin-top: 16rpx;
}

.lyric-btn {
  background: rgba(255,255,255,0.2);
  color: #fff;
  border-radius: 18rpx;
  padding: 8rpx 22rpx;
  border: 0;
  font-size: 26rpx;
}

.lyric-btn:active {
  transform: scale(0.95);
}

.lyrics {
  margin-top: 16rpx;
  padding: 20rpx;
  background: rgba(255,255,255,0.08);
  border-radius: 14rpx;
  border-left: 4rpx solid #4facfe;
}

.lyric-line {
  display: block;
  color: rgba(255,255,255,0.9);
  font-size: 24rpx;
  line-height: 1.8;
  margin-bottom: 8rpx;
}

.lyric-line:last-child {
  margin-bottom: 0;
}

.empty-tip {
  text-align: center;
  color: rgba(255,255,255,0.8);
  font-size: 28rpx;
  padding: 100rpx 0;
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
  0%, 100% {
    opacity: 0.4;
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
