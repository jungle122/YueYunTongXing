<template>
  <view class="video-page">
    <view class="bg-stars"></view>
    <view class="container">
      <view class="header">
        <view class="back-btn" @tap="goBack">←</view>
        <text class="page-title">视频展示</text>
        <view></view>
      </view>

      <view class="content">
        <view v-for="v in videos" :key="v.id" class="video-card">
          <view class="video-header">
            <view class="video-icon">🎬</view>
            <view class="video-info">
              <text class="video-title">{{ v.title }}</text>
              <text class="video-subtitle">{{ v.subtitle }}</text>
            </view>
            <view class="video-actions">
              <button class="action-btn" :class="{playing: currentPlaying === v.id}" @tap="playVideo(v)">
                {{ currentPlaying === v.id && playing ? '⏸️' : '▶️' }}
              </button>
              <button class="action-btn" :class="{liked: favorites[v.id]}" @tap="toggleFavorite(v)">
                {{ favorites[v.id] ? '💖' : '❤️' }}
              </button>
            </view>
          </view>
          <view class="video-preview">{{ v.description }}</view>
          <view class="video-tags">
            <text v-for="(tag, idx) in v.tags" :key="idx" class="tag">{{ tag }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 收藏提示框 -->
    <view v-if="showToast" class="favorite-toast" :class="toastType">
      <view class="toast-content">
        <text class="toast-icon">{{ toastIcon }}</text>
        <text class="toast-message">{{ toastText }}</text>
      </view>
    </view>

    <!-- 视频播放器 -->
    <view v-if="showPlayer && currentVideo" class="video-player-modal" @tap="closePlayer">
      <view class="player-container" @tap.stop style="pointer-events: auto;">
        <view class="player-header">
          <text class="player-title">{{ currentVideo.title }}</text>
          <button class="close-player-btn" @tap="closePlayer">✕</button>
        </view>
        <video 
          :src="getVideoSrc(currentVideo)" 
          controls
          class="video-player"
          :id="'video-' + currentVideo.id"
          @play="onVideoPlay"
          @pause="onVideoPause"
          @ended="onVideoEnded"
          @error="onVideoError"
          @loadedmetadata="onVideoLoaded"
          @waiting="onVideoWaiting"
          @progress="onVideoProgress"
          @timeupdate="onVideoTimeUpdate"
          @seeked="onVideoSeeked"
          @fullscreenchange="onVideoFullscreenChange"
          :enable-play-gesture="true"
          :show-fullscreen-btn="false"
          :show-center-play-btn="true"
          :autoplay="false"
          :initial-time="0"
          :object-fit="contain"
          :show-play-btn="true"
          :enable-fullscreen="true"
          :page-gesture="false"
          :direction="90"
        ></video>
        <!-- 自定义全屏按钮（兜底） -->
        <view class="custom-fullscreen-btn" @tap="enterFullscreen">
          ⤢
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'VideoLearningPage',
  data() {
    return {
      videos: [],
      currentPlaying: null,
      playing: false,
      favorites: {},
      showToast: false,
      toastText: '',
      toastIcon: '',
      toastType: '',
      showPlayer: false,
      currentVideo: null,
      audioContext: null, // 音频播放上下文
      videoContext: null, // 视频播放上下文
      lastVideoTime: 0, // 记录视频的最后播放时间
      isSeeking: false, // 标记是否正在拖动进度条
      videoPlayStartTime: null, // 记录视频播放开始时间
      videoPlayDuration: 0, // 记录视频播放时长
      // 远程音频Base（可放入本地存储覆盖）
      audioBaseUrl: 'https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/songs',
      // 视频与音频的对应关系（video id -> song number）
      videoAudioMap: {
        'video1': 'song7',
        'video2': 'song8',
        'video3': 'song9',
        'video4': 'song10',
        'video5': 'song11',
        'video6': 'song12',
        'video7': 'song13',
        'video8': 'song14',
        'video9': 'song16',
        'video10': 'song17'
      }
    };
  },
  onLoad() {
    this.loadVideos();
    this.loadFavorites();
      const savedBase = uni.getStorageSync('audioBaseUrl');
      if (savedBase) this.audioBaseUrl = savedBase;
  },
  onUnload() {
    // 页面卸载时清理音频资源
    if (this.audioContext) {
      this.audioContext.stop();
      this.audioContext.destroy();
      this.audioContext = null;
    }
  },
  methods: {
    goBack() {
      if (this.currentPlaying) {
        this.stopVideo();
      }
      const pages = getCurrentPages();
      if (pages && pages.length > 1) {
        uni.navigateBack();
      } else {
        uni.reLaunch({ url: '/pages/home/home' });
      }
    },
    loadVideos() {
      const defaultVideos = [
        {
          id: "video1",
          title: "氹氹转",
          subtitle: "原创粤语童谣视频",
          description: "经典粤语童谣氹氹转演绎",
          src: "https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/videos/video1.mp4",
          poster: "",
          duration: 180,
          tags: ["原创", "氹氹转", "童谣"]
        },
        {
          id: "video2",
          title: "齐齐望过去",
          subtitle: "原创粤语童谣视频",
          description: "粤语童谣齐齐望过去视频",
          src: "https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/videos/video2.mp4",
          poster: "",
          duration: 180,
          tags: ["原创", "齐齐望过去", "童谣"]
        },
        {
          id: "video3",
          title: "月光光",
          subtitle: "原创粤语童谣视频",
          description: "粤语童谣月光光视频",
          src: "https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/videos/video3.mp4",
          poster: "",
          duration: 180,
          tags: ["原创", "月光光", "童谣"]
        },
        {
          id: "video4",
          title: "小猪佩奇\"洗白白\"大作战!",
          subtitle: "原创粤语童谣视频",
          description: "小猪佩奇\"洗白白\"大作战!粤语童谣视频",
          src: "https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/videos/video4.mp4",
          poster: "",
          duration: 200,
          tags: ["原创", "洗白白", "童谣"]
        },
        {
          id: "video5",
          title: "喜羊羊带你\"齐齐望过去\"!",
          subtitle: "原创粤语童谣视频",
          description: "喜羊羊带你\"齐齐望过去\"!粤语童谣视频",
          src: "https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/videos/video5.mp4",
          poster: "",
          duration: 190,
          tags: ["原创", "齐齐望过去", "童谣"]
        },
        {
          id: "video6",
          title: "火鸡总动员之\"何家公鸡\"魔性对决——美式火鸡暴走粤语农场！",
          subtitle: "原创粤语童谣视频",
          description: "火鸡总动员之\"何家公鸡\"魔性对决——美式火鸡暴走粤语农场！",
          src: "https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/videos/video6.mp4",
          poster: "",
          duration: 250,
          tags: ["原创", "何家公鸡何家猜", "童谣"]
        },
        {
          id: "video7",
          title: "海绵宝宝带你\"扒龙船\"！魔性粤语童谣×童年DNA动了，笑着玩转粤语！",
          subtitle: "原创粤语童谣视频",
          description: "海绵宝宝带你\"扒龙船\"！魔性粤语童谣×童年DNA动了，笑着玩转粤语！",
          src: "https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/videos/video7.mp4",
          poster: "",
          duration: 220,
          tags: ["原创", "扒龙船", "童谣"]
        },
        {
          id: "video8",
          title: "《走进小马宝莉的细小世界》——小马宝莉世界真细小",
          subtitle: "原创粤语童谣视频",
          description: "《走进小马宝莉的细小世界》——小马宝莉世界真细小",
          src: "https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/videos/video8.mp4",
          poster: "",
          duration: 210,
          tags: ["原创", "世界真细小", "童谣"]
        },
        {
          id: "video9",
          title: "当哪吒遇见\"氹氹转\"：被命运亏欠的童年，AI用童谣悄悄治愈",
          subtitle: "原创粤语童谣视频",
          description: "当哪吒遇见\"氹氹转\"：被命运亏欠的童年，AI用童谣悄悄治愈",
          src: "https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/videos/video9.mp4",
          poster: "",
          duration: 240,
          tags: ["原创", "氹氹转", "童谣"]
        },
        {
          id: "video10",
          title: "当葫芦娃唱起月光光——全网首支岭南风葫芦兄弟奇幻夜",
          subtitle: "原创粤语童谣视频",
          description: "当葫芦娃唱起月光光——全网首支岭南风葫芦兄弟奇幻夜",
          src: "https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/videos/video10.mp4",
          poster: "",
          duration: 260,
          tags: ["原创", "月光光", "童谣"]
        }
      ];
      
      this.videos = defaultVideos;
      
      uni.request({
        url: '/static/indexes/videos.json',
        success: (res) => {
          if (res.statusCode === 200 && Array.isArray(res.data) && res.data.length > 0) {
            this.videos = res.data.map(v => ({
              ...v,
              // 保存原始路径，getVideoSrc方法会处理
              src: v.src
            }));
          }
        },
        fail: () => {
          console.log('加载视频列表失败，使用默认数据');
        }
      });
    },
    loadFavorites() {
      try {
        const saved = uni.getStorageSync('video_favorites') || {};
        this.favorites = saved;
      } catch (e) {
        console.error('加载收藏状态失败:', e);
      }
    },
    playVideo(video) {
      if (this.currentPlaying === video.id && this.playing) {
        this.stopVideo();
        return;
      }
      
      // 停止之前播放的视频和音频
      if (this.currentPlaying && this.currentPlaying !== video.id) {
        // 先保存之前的播放时长
        if(this.videoPlayStartTime && this.currentVideo) {
          const duration = Math.floor((Date.now() - this.videoPlayStartTime) / 1000);
          this.videoPlayDuration += duration;
          this.updateLearningHistoryDuration('video', this.currentVideo.id, this.videoPlayDuration);
          this.videoPlayStartTime = null;
          this.videoPlayDuration = 0;
        } else if(this.currentVideo && this.videoPlayDuration > 0) {
          this.updateLearningHistoryDuration('video', this.currentVideo.id, this.videoPlayDuration);
          this.videoPlayDuration = 0;
        }
        
        const oldVideoContext = uni.createVideoContext('video-' + this.currentPlaying);
        if (oldVideoContext) {
          oldVideoContext.stop();
        }
        // 停止之前的音频
        if (this.audioContext) {
          this.audioContext.stop();
          this.audioContext.destroy();
          this.audioContext = null;
        }
      }
      
      this.currentVideo = video;
      this.currentPlaying = video.id;
      this.showPlayer = true;
      
      // 等待DOM更新
      this.$nextTick(() => {
        // video组件会自动尝试加载，不需要手动调用play
        console.log('视频播放器已打开，路径:', this.getVideoSrc(video));
        
        // 准备播放对应的音频（在视频播放前准备好）
        this.prepareAudio(video.id);
        
        // 监听视频加载完成，确保音频也能正确加载
        setTimeout(() => {
          if (this.audioContext && !this.audioContext._isPlaying) {
            // 音频已经在 prepareAudio 中准备好，等待视频播放事件触发
            console.log('音频已准备就绪，等待视频播放');
          }
        }, 500);
      });
    },
    prepareAudio(videoId) {
      // 获取对应的音频文件名
      const songName = this.videoAudioMap[videoId];
      if (!songName) {
        console.warn('未找到视频对应的音频:', videoId);
        return;
      }
      
      // 如果之前的音频还在播放，先停止
      if (this.audioContext) {
        this.audioContext.stop();
        this.audioContext.destroy();
        this.audioContext = null;
      }
      
      // 优先使用远程OSS，避免将MP3打包进小程序包
      // 如果需要自定义，请在运行时设置 uni.setStorageSync('audioBaseUrl', 'https://your-oss-domain/songs')
      let audioSrc = `${this.audioBaseUrl}/${songName}.mp3`;
      // 兜底：如果未配置远程地址，再使用静态资源（可能造成包体过大，不建议）
      if (!this.audioBaseUrl || this.audioBaseUrl.indexOf('http') !== 0) {
        audioSrc = `/static/audio/songs/${songName}.mp3`;
      }
      console.log('准备播放音频，路径:', audioSrc);
      
      this.audioContext = uni.createInnerAudioContext();
      this.audioContext.src = audioSrc;
      this.audioContext.loop = false; // 不循环
      this.audioContext.volume = 1.0; // 音量
      
      // 标记音频是否正在播放（用于判断是否需要重新播放）
      this.audioContext._isPlaying = false;
      // 标记音频是否已经处理过 canplay 事件（防止重复处理）
      this.audioContext._canplayHandled = false;
      // 记录音频对应的视频 ID（防止视频切换时混乱）
      this.audioContext._videoId = videoId;
      
      // 监听音频播放事件
      this.audioContext.onPlay(() => {
        console.log('音频开始播放');
        this.audioContext._isPlaying = true;
      });
      
      this.audioContext.onPause(() => {
        console.log('音频已暂停');
        this.audioContext._isPlaying = false;
      });
      
      this.audioContext.onStop(() => {
        console.log('音频已停止');
        this.audioContext._isPlaying = false;
      });
      
      this.audioContext.onError((res) => {
        console.error('音频播放错误:', res);
        this.audioContext._isPlaying = false;
      });
      
      this.audioContext.onEnded(() => {
        console.log('音频播放结束');
        this.audioContext._isPlaying = false;
      });
      
      // 监听音频加载完成（只处理一次，避免重复触发）
      this.audioContext.onCanplay(() => {
        // 防止重复处理
        if (this.audioContext._canplayHandled) {
          return;
        }
        
        // 检查音频是否还对应当前视频
        if (this.audioContext._videoId !== videoId || this.currentPlaying !== videoId) {
          console.log('音频已切换，忽略此次 canplay 事件');
          return;
        }
        
        this.audioContext._canplayHandled = true;
        console.log('音频已加载完成，可以播放，时长:', this.audioContext.duration, '秒');
        
        // 如果视频正在播放，自动开始播放音频（只执行一次）
        if (this.playing && this.currentPlaying === videoId) {
          // 延迟一点，确保音频完全准备好
          setTimeout(() => {
            if (this.audioContext && this.audioContext._videoId === videoId && this.playing && this.currentPlaying === videoId) {
              this.startAudioPlay();
            }
          }, 150);
        }
      });
    },
    stopVideo() {
      // 更新播放时长（如果正在播放）
      if(this.videoPlayStartTime && this.currentVideo) {
        const duration = Math.floor((Date.now() - this.videoPlayStartTime) / 1000);
        this.videoPlayDuration += duration;
        this.updateLearningHistoryDuration('video', this.currentVideo.id, this.videoPlayDuration);
        this.videoPlayStartTime = null;
        this.videoPlayDuration = 0;
      }
      
      // 停止视频
      if (this.currentPlaying) {
        const videoContext = uni.createVideoContext('video-' + this.currentPlaying);
        if (videoContext) {
          videoContext.stop();
        }
      }
      
      // 停止音频
      if (this.audioContext) {
        this.audioContext.stop();
        this.audioContext.destroy();
        this.audioContext = null;
      }
      
      this.currentPlaying = null;
      this.playing = false;
      this.showPlayer = false;
      this.currentVideo = null;
    },
    closePlayer() {
      this.stopVideo();
    },
    onVideoLoaded() {
      console.log('视频元数据加载完成');
      console.log('视频源路径:', this.getVideoSrc(this.currentVideo));
    },
    onVideoWaiting() {
      console.log('视频缓冲中...');
    },
    onVideoProgress(e) {
      // 视频缓冲进度事件
      // 不在这里同步音频，避免过于频繁
      // 音频同步由onVideoTimeUpdate处理
    },
    onVideoTimeUpdate(e) {
      // 视频时间更新事件（正常播放时的进度更新）
      // 记录视频当前播放时间，用于拖动进度条时的同步
      if (e && e.detail) {
        const currentTime = e.detail.currentTime;
        if (currentTime !== undefined && currentTime !== null) {
          this.lastVideoTime = currentTime;
          
          // 如果正在拖动进度条，同步音频（但只同步一次，避免频繁 seek）
          if (this.isSeeking && this.audioContext && this.playing) {
            // 拖动后的小幅同步调整（只在拖动时同步一次）
            const audioCurrentTime = this.audioContext.currentTime || 0;
            // 增大同步阈值，减少频繁 seek（从 0.3 秒改为 1 秒）
            if (Math.abs(currentTime - audioCurrentTime) > 1.0) {
              console.log('拖动后同步音频:', currentTime, '秒');
              try {
                this.audioContext.seek(currentTime);
              } catch (error) {
                console.error('拖动后同步音频失败:', error);
              }
              // 拖动同步完成后，立即重置标记，避免重复同步
              this.isSeeking = false;
            }
          }
          
          // 正常播放时的同步（减少同步频率，避免卡顿）
          // 只在时间差较大时（超过 2 秒）才同步，避免频繁 seek 导致卡顿
          if (!this.isSeeking && this.audioContext && this.playing) {
            const audioCurrentTime = this.audioContext.currentTime || 0;
            const timeDiff = Math.abs(currentTime - audioCurrentTime);
            // 增大同步阈值从 0.5 秒改为 2 秒，减少 seek 频率
            if (timeDiff > 2.0) {
              console.log('自动同步音频进度:', currentTime, '秒，时间差:', timeDiff.toFixed(2), '秒');
              try {
                this.audioContext.seek(currentTime);
              } catch (error) {
                console.error('自动同步音频失败:', error);
              }
            }
          }
        }
      }
    },
    onVideoSeeked(e) {
      // 视频进度条拖动完成事件
      // 这是关键：当用户拖动视频进度条时，需要同步更新音频位置
      console.log('视频进度拖动完成事件:', e);
      
      if (!this.audioContext || !this.currentPlaying) {
        console.warn('音频上下文或当前播放视频不存在');
        return;
      }
      
      // 标记正在拖动（用于 timeupdate 中的同步）
      this.isSeeking = true;
      
      // 从事件参数获取时间
      let seekedTime = null;
      if (e && e.detail && e.detail.currentTime !== undefined) {
        seekedTime = e.detail.currentTime;
      }
      
      // 如果事件参数没有时间，使用最后记录的时间
      if ((seekedTime === null || seekedTime === undefined) && this.lastVideoTime !== undefined) {
        seekedTime = this.lastVideoTime;
      }
      
      // 如果还是没有，等待 timeupdate 事件更新（延迟同步，避免立即 seek）
      if (seekedTime === null || seekedTime === undefined) {
        console.log('等待 timeupdate 事件获取拖动后的时间');
        // timeupdate 事件会在拖动后立即触发，会更新 lastVideoTime 并同步音频
        // 延迟重置 isSeeking，给 timeupdate 事件时间同步
        setTimeout(() => {
          this.isSeeking = false;
        }, 1000);
        return;
      }
      
      console.log('视频拖动到:', seekedTime, '秒，开始同步音频');
      
      try {
        // 暂停音频（避免 seek 时产生杂音）
        if (this.audioContext._isPlaying) {
          this.audioContext.pause();
        }
        
        // 同步音频到相同位置（延迟一点，确保视频位置稳定）
        setTimeout(() => {
          if (this.audioContext) {
            try {
              this.audioContext.seek(seekedTime);
              console.log('音频已跳转到:', seekedTime, '秒');
              
              // 如果视频正在播放，恢复音频播放
              if (this.playing) {
                setTimeout(() => {
                  if (this.audioContext && !this.audioContext._isPlaying) {
                    this.audioContext.play();
                    console.log('音频恢复播放');
                  }
                  // 重置拖动标记
                  this.isSeeking = false;
                }, 100);
              } else {
                this.isSeeking = false;
              }
            } catch (error) {
              console.error('同步音频进度失败:', error);
              this.isSeeking = false;
            }
          }
        }, 100);
      } catch (error) {
        console.error('同步音频进度失败:', error);
        this.isSeeking = false;
      }
    },
    onVideoFullscreenChange(e) {
      // 视频全屏状态变化事件
      console.log('视频全屏状态变化:', e);
      if (e && e.detail) {
        const { fullScreen, direction } = e.detail;
        console.log('全屏状态:', fullScreen, '方向:', direction);
        
        // 全屏状态下，确保视频和音频继续播放
        if (fullScreen && this.playing) {
          // 如果音频已停止，恢复播放
          if (this.audioContext && !this.audioContext._isPlaying) {
            this.audioContext.play();
            console.log('全屏模式下恢复音频播放');
          }
        }
      }
    },
    enterFullscreen() {
      try {
        if (!this.currentVideo) return;
        const ctx = uni.createVideoContext('video-' + this.currentVideo.id);
        if (ctx && ctx.requestFullScreen) {
          ctx.requestFullScreen({ direction: 90 });
          console.log('已调用 requestFullScreen');
        } else {
          console.warn('无法获取video上下文或不支持requestFullScreen');
        }
      } catch (err) {
        console.error('进入全屏失败:', err);
      }
    },
    onVideoPlay(e) {
      this.playing = true;
      console.log('视频开始播放');
      
      // 记录播放开始时间
      this.videoPlayStartTime = Date.now();
      // 记录学习历史
      if(this.currentVideo) {
        this.recordLearningHistory('video', this.currentVideo.title, this.currentVideo.id);
      }
      
      // 同步播放音频
      if (this.audioContext) {
        // 检查音频是否还对应当前视频
        if (this.audioContext._videoId !== this.currentVideo.id) {
          console.warn('音频不匹配当前视频，重新准备');
          this.prepareAudio(this.currentVideo.id);
          return;
        }
        
        // 检查音频是否已加载完成
        if (this.audioContext.duration <= 0) {
          console.log('音频尚未加载完成，等待加载...');
          // 音频还未加载完成，等待一下再尝试
          setTimeout(() => {
            if (this.audioContext && this.audioContext.duration > 0 && this.playing) {
              this.startAudioPlay();
            }
          }, 500);
          return;
        }
        
        // 音频已加载完成，开始播放
        this.startAudioPlay();
      } else {
        // 如果音频上下文不存在，重新准备
        console.warn('音频上下文不存在，重新准备音频');
        this.prepareAudio(this.currentVideo.id);
      }
    },
    startAudioPlay() {
      // 统一的音频播放方法，避免重复代码
      if (!this.audioContext || !this.currentVideo) {
        return;
      }
      
      // 防止重复播放
      if (this.audioContext._isPlaying) {
        console.log('音频已在播放中，跳过');
        return;
      }
      
      // 获取视频当前时间
      let seekTime = this.lastVideoTime || 0;
      
      // 如果时间大于 0 且小于音频时长，先同步位置
      if (seekTime > 0 && seekTime < this.audioContext.duration) {
        try {
          this.audioContext.seek(seekTime);
          console.log('音频已跳转到:', seekTime.toFixed(3), '秒');
        } catch (err) {
          console.warn('音频跳转失败:', err);
          seekTime = 0;
        }
      }
      
      // 延迟一点播放，确保 seek 操作完成
      setTimeout(() => {
        if (this.audioContext && !this.audioContext._isPlaying && this.playing) {
          try {
            this.audioContext.play();
            console.log('音频开始播放，当前时间:', seekTime.toFixed(3), '秒');
          } catch (err) {
            console.error('音频播放失败:', err);
          }
        }
      }, 100);
    },
    onVideoPause() {
      this.playing = false;
      console.log('视频暂停');
      
      // 更新播放时长
      if(this.videoPlayStartTime) {
        this.videoPlayDuration += Math.floor((Date.now() - this.videoPlayStartTime) / 1000);
        this.videoPlayStartTime = null;
      }
      
      // 同步暂停音频
      if (this.audioContext) {
        this.audioContext.pause();
        console.log('音频已暂停');
      }
    },
    onVideoEnded() {
      this.playing = false;
      console.log('视频播放结束');
      
      // 记录完整播放时长
      if(this.videoPlayStartTime && this.currentVideo) {
        const duration = Math.floor((Date.now() - this.videoPlayStartTime) / 1000);
        this.videoPlayDuration += duration;
        this.updateLearningHistoryDuration('video', this.currentVideo.id, this.videoPlayDuration);
        this.videoPlayStartTime = null;
        this.videoPlayDuration = 0;
      }
      
      this.currentPlaying = null;
      
      // 停止音频
      if (this.audioContext) {
        this.audioContext.stop();
        this.audioContext.destroy();
        this.audioContext = null;
      }
    },
    onVideoError(e) {
      console.error('视频播放错误:', e);
      console.error('错误详情:', JSON.stringify(e, null, 2));
      console.error('错误类型:', e.type);
      console.error('错误时间戳:', e.timeStamp);
      const videoPath = this.currentVideo ? this.getVideoSrc(this.currentVideo) : '无';
      console.error('视频路径:', videoPath);
      console.error('原始视频数据:', this.currentVideo);
      
      // 获取详细的错误信息
      const errMsg = e.detail ? e.detail.errMsg : '未知错误';
      const errCode = e.detail ? e.detail.errCode : '';
      console.error('错误消息:', errMsg);
      console.error('错误代码:', errCode);
      
      // 关闭播放器，避免卡在错误状态
      this.stopVideo();
      
      // 检查是否是本地文件不支持的错误
      if (errMsg === 'MEDIA_ERR_SRC_NOT_SUPPORTED' || errMsg.indexOf('MEDIA_ERR_SRC_NOT_SUPPORTED') !== -1) {
        uni.showModal({
          title: '视频播放限制',
          content: '微信小程序video组件不支持播放本地视频文件，需要网络URL。\n\n如需播放视频，请将视频文件上传到服务器并使用网络地址。',
          showCancel: false,
          confirmText: '我知道了',
          confirmColor: '#007AFF'
        });
      } else if (errMsg.indexOf('DEMUXER_ERROR') !== -1 || errMsg.indexOf('no supported streams') !== -1) {
        // 视频编码格式不支持的错误
        uni.showModal({
          title: '视频格式不兼容',
          content: `视频编码格式与小程序不兼容：\n\n小程序要求：\n• H.264视频编码（Baseline/Main Profile）\n• AAC音频编码\n• yuv420p像素格式\n\n当前视频可能在浏览器可播放，但小程序无法解析。\n\n解决方案：\n请使用项目中的转换脚本（convert-videos.bat）将视频转换为兼容格式后重新上传。\n\n视频路径：\n${videoPath}`,
          showCancel: false,
          confirmText: '我知道了',
          confirmColor: '#FF6B6B'
        });
      } else {
        // 其他错误
        uni.showModal({
          title: '视频加载失败',
          content: `视频加载失败：\n\n错误：${errMsg}\n\n路径：\n${videoPath}\n\n请检查网络连接或联系管理员。`,
          showCancel: false,
          confirmText: '确定',
          confirmColor: '#007AFF'
        });
      }
    },
    getVideoSrc(video) {
      if (!video || !video.src) {
        console.warn('getVideoSrc: video或src为空');
        return '';
      }
      
      let src = video.src;
      console.log('getVideoSrc - 原始路径:', src);
      
      // 如果是http/https链接，直接返回（网络URL，小程序支持）
      if (src.startsWith('http://') || src.startsWith('https://')) {
        console.log('getVideoSrc - 网络路径，直接返回:', src);
        return src;
      }
      
      // 如果是本地路径，显示错误提示
      // 小程序video组件不支持本地文件路径，只支持网络URL
      console.warn('getVideoSrc - 检测到本地路径，小程序不支持:', src);
      console.warn('请将视频上传到服务器并使用网络URL');
      
      // 返回空字符串，让video组件显示错误
      return '';
    },
    toggleFavorite(video) {
      const prev = !!this.favorites[video.id];
      this.favorites[video.id] = !prev;
      
      try {
        uni.setStorageSync('video_favorites', this.favorites);
      } catch (e) {
        console.error('保存收藏状态失败:', e);
      }
      
      this.toastText = !prev ? '收藏成功' : '取消收藏';
      this.toastIcon = !prev ? '💖' : '❤️';
      this.toastType = !prev ? 'success' : 'cancel';
      this.showToast = true;
      
      setTimeout(() => {
        this.showToast = false;
      }, 1500);
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
.video-page {
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
.content {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  max-width: 720rpx;
  margin: 0 auto;
}
.video-card {
  background: rgba(255,255,255,0.1);
  border: 2rpx solid rgba(255,255,255,0.2);
  border-radius: 20rpx;
  padding: 32rpx;
  backdrop-filter: blur(10px);
}
.video-header {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}
.video-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: linear-gradient(45deg, #4facfe 0%, #00f2fe 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  margin-right: 20rpx;
  box-shadow: 0 8rpx 30rpx rgba(79,172,254,0.3);
}
.video-info {
  flex: 1;
  min-width: 0;
}
.video-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #fff;
  margin-bottom: 8rpx;
  display: block;
  line-height: 1.4;
}
.video-subtitle {
  font-size: 24rpx;
  color: rgba(255,255,255,0.9);
  display: block;
}
.video-actions {
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
.action-btn.playing {
  background: linear-gradient(45deg, #56ab2f, #a8e6cf);
  animation: pulse 1s ease-in-out infinite;
}
.action-btn.liked {
  background: linear-gradient(45deg, #f093fb 0%, #f5576c 100%);
}
.video-preview {
  font-size: 26rpx;
  color: rgba(255,255,255,0.9);
  line-height: 1.6;
  margin-top: 20rpx;
  padding: 20rpx;
  background: rgba(255,255,255,0.05);
  border-radius: 10rpx;
  border-left: 8rpx solid #4facfe;
}
.video-tags {
  display: flex;
  gap: 12rpx;
  flex-wrap: wrap;
  margin-top: 20rpx;
}
.tag {
  background: rgba(255,255,255,0.1);
  border: 2rpx solid rgba(255,255,255,0.2);
  border-radius: 16rpx;
  padding: 8rpx 16rpx;
  font-size: 22rpx;
  color: rgba(255,255,255,0.9);
}
.video-player-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}
.player-container {
  width: 90vw;
  max-width: 800rpx;
  background: #000;
  border-radius: 20rpx;
  overflow: visible;
  position: relative;
}
.player-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 32rpx;
  background: rgba(255,255,255,0.1);
}
.player-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #fff;
  flex: 1;
}
.close-player-btn {
  width: 48rpx;
  height: 48rpx;
  background: rgba(255,255,255,0.2);
  border: none;
  border-radius: 50%;
  color: #fff;
  font-size: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.video-player {
  width: 100%;
  height: 506rpx;
  display: block;
  position: relative;
  z-index: 1;
}
.custom-fullscreen-btn {
  position: absolute;
  right: 16rpx;
  bottom: 16rpx;
  width: 64rpx;
  height: 64rpx;
  border-radius: 12rpx;
  background: rgba(255,255,255,0.2);
  color: #fff;
  font-size: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  border: 2rpx solid rgba(255,255,255,0.35);
}
.custom-fullscreen-btn:active {
  background: rgba(255,255,255,0.35);
}
.favorite-toast {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 16rpx;
  padding: 24rpx 40rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
  box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.3);
  z-index: 3000;
  animation: toastShow 0.3s ease-out;
}
.favorite-toast.success {
  background: linear-gradient(135deg, #4ecdc4, #44a08d);
}
.favorite-toast.cancel {
  background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
}
.toast-content {
  display: flex;
  align-items: center;
  gap: 12rpx;
}
.toast-icon {
  font-size: 32rpx;
}
.toast-message {
  font-size: 28rpx;
  font-weight: 600;
  color: #fff;
}
@keyframes starTwinkle {
  0%,100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}
@keyframes glow {
  0% { opacity: 0.8; }
  100% { opacity: 1; }
}
@keyframes pulse {
  0%,100% { transform: scale(1); }
  50% { transform: scale(1.05); }
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
</style>