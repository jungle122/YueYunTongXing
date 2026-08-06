<template>
  <view class="parent-singing-page">
    <view class="bg-stars"></view>
    <view class="container">
      <view class="header">
        <view class="back-btn" @tap="goBack">←</view>
        <text class="page-title">亲子传唱</text>
        <view></view>
      </view>
      <view class="content">
        <view v-for="song in songs" :key="song.id" class="singing-card">
          <view class="singing-header">
            <view class="singing-icon">{{ song.icon }}</view>
            <view class="singing-info">
              <text class="singing-title">{{ song.title }}</text>
              <text class="singing-description">{{ song.description }}</text>
            </view>
            <view class="singing-actions">
              <button class="action-btn" :class="{playing: currentPlaying === song.id && playing}" @tap="playSong(song)">
                {{ currentPlaying === song.id && playing ? '⏸️' : '▶️' }}
              </button>
              <button class="action-btn" :class="{recording: currentRecording === song.id}" @tap="toggleRecording(song)">
                {{ currentRecording === song.id ? '⏹️' : '🎙️' }}
              </button>
              <button class="action-btn" :class="{playing: currentPlayingRecording === song.id}" @tap="playRecording(song)">
                {{ currentPlayingRecording === song.id && playingRecording ? '⏸️' : '▶️' }}
              </button>
            </view>
          </view>
          <view class="lyrics-area">
            <view class="lyrics-title">📝 歌词</view>
            <view class="lyrics-content">
              <text v-for="(line, idx) in song.lyrics" :key="idx" class="lyric-line">{{ line }}</text>
            </view>
          </view>
          <view class="singing-tips">
            <view class="tips-title">💡 传唱小贴士</view>
            <view class="tips-list">
              <text v-for="(tip, idx) in song.tips" :key="idx" class="tip-item">{{ tip }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 录音中提示 -->
    <view v-if="showRecordingModal" class="modal-mask" @tap="stopRecording">
      <view class="modal-content recording-modal" @tap.stop>
        <view class="modal-title">🎙️ 录音中</view>
        <view class="modal-text">正在录音，请开始演唱...</view>
        <button class="modal-btn" @tap="stopRecording">停止录音</button>
      </view>
    </view>
    
    <!-- 录音完成提示 -->
    <view v-if="showRecordingComplete" class="toast-success">
      <text>✅ 录音完成</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ParentChildSingingPage',
  data() {
    return {
      songs: [
        {
          id: 'song1',
          title: '小星星',
          description: '与家人一起唱粤语童谣',
          icon: '⭐',
          src: 'https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/songs/song1.mp3',
          lyrics: ['一闪一闪小星星，', '一闪一闪亮晶晶，', '好似钻石天空高，', '高高挂天空闪烁。'],
          tips: ['• 家长先示范一遍，让孩子跟唱', '• 可以分角色演唱，增加趣味性', '• 鼓励孩子大胆开口，不要怕出错']
        },
        {
          id: 'song22',
          title: '洗白白',
          description: '温馨的洗澡时光传唱',
          icon: '🛁',
          src: 'https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/songs/song22.mp3',
          lyrics: ['洗白白，洗白白，', '倒开盆水咯，快洗白白。', '乖猪咪乱郁咋，听话唔好曳咯，', '倒开盆水咯，快洗白白。'],
          tips: ['• 可以在洗澡时一起传唱', '• 加入洗澡动作，增加趣味', '• 让孩子养成良好卫生习惯']
        },
        {
          id: 'song21',
          title: '何家公鸡何家猜',
          description: '有趣的猜谜传唱游戏',
          icon: '🐓',
          src: 'https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/songs/song21.mp3',
          lyrics: ['何家公鸡何家猜，', '何家小鸡何家猜，', '何家公鸡何家猜，', '何家母鸡咯咯咯。'],
          tips: ['• 可以玩猜谜游戏', '• 模仿鸡的叫声', '• 增加互动性和趣味性']
        },
        {
          id: 'song20',
          title: '氹氹转',
          description: '快乐的旋转传唱',
          icon: '🎠',
          src: 'https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/songs/song20.mp3',
          lyrics: ['氹氹转，菊花圆，', '炒米饼，糯米团。', '阿妈叫我睇龙船，', '我唔睇，睇鸡仔。'],
          tips: ['• 可以手拉手转圈传唱', '• 加入拍手节拍', '• 体验传统粤语文化']
        },
        {
          id: 'song19',
          title: '落雨大',
          description: '雨天传唱的温馨时光',
          icon: '🌧️',
          src: 'https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/songs/song19.mp3',
          lyrics: ['落雨大，水浸街，', '阿哥担柴上街卖，', '阿嫂出街着花鞋，', '花鞋花袜花腰带。'],
          tips: ['• 雨天时传唱更有意境', '• 可以模仿雨声', '• 了解传统生活场景']
        },
        {
          id: 'song18',
          title: '月光光',
          description: '夜晚的温馨传唱',
          icon: '🌙',
          src: 'https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/songs/song18.mp3',
          lyrics: ['月光光，照地堂，', '虾仔你乖乖瞓落床。', '听朝阿妈要赶插秧咯，', '阿爷睇牛佢上山岗。'],
          tips: ['• 适合睡前传唱', '• 营造温馨氛围', '• 帮助孩子安静入睡']
        },
        {
          id: 'song6',
          title: '河边有只羊',
          description: '创造温馨的家庭传唱氛围',
          icon: '🐑',
          src: 'https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/songs/song6.mp3',
          lyrics: ['河边有只羊，羊边有只象，', '象边有只马骝仔，', '好似你咁样。'],
          tips: ['• 选择合适的时间进行传唱', '• 营造轻松愉快的氛围', '• 记录美好的传唱时光']
        }
      ],
      audio: null,
      currentPlaying: null,
      playing: false,
      recorder: null,
      currentRecording: null,
      showRecordingModal: false,
      showRecordingComplete: false,
      recordingAudio: null,
      currentPlayingRecording: null,
      playingRecording: false,
      recordingsCache: {},
      recentRecordings: {},
      isSavingRecording: false
    };
  },
  mounted() {
    this.initAudio();
    this.initRecorder();
    this.loadRecordings();
  },
  beforeUnmount() {
    if(this.audio) {
      this.audio.stop();
      this.audio.destroy();
    }
    if(this.recorder) {
      this.recorder.stop();
    }
    if(this.recordingAudio) {
      this.recordingAudio.stop();
      this.recordingAudio.destroy();
    }
  },
  methods: {
    async ensureRecordAuth() {
      try {
        // 先检查授权
        const setting = await new Promise((resolve)=>{
          uni.getSetting({ success: resolve, fail: ()=>resolve({authSetting:{}}) });
        });
        if (!setting.authSetting || !setting.authSetting['scope.record']) {
          const auth = await new Promise((resolve)=>{
            uni.authorize({ scope: 'scope.record', success: ()=>resolve(true), fail: ()=>resolve(false) });
          });
          if (!auth) {
            await new Promise((resolve)=>{
              uni.showModal({
                title: '需要录音权限',
                content: '请在授权弹窗或设置中打开录音权限以使用录音回放功能',
                showCancel: false,
                success: resolve
              });
            });
            return false;
          }
        }
        return true;
      } catch(e) {
        return true;
      }
    },
    goBack() {
      uni.navigateBack({
        fail: () => {
          uni.reLaunch({ url: '/pages/learn/learn' });
        }
      });
    },
    initAudio() {
      // 全局音频策略，避免 iOS 静音键影响，允许与其它声音混播
      try {
        if (typeof uni.setInnerAudioOption === 'function') {
          uni.setInnerAudioOption({
            obeyMuteSwitch: false,
            mixWithOther: true,
            speakerOn: true
          });
        }
      } catch(e) { console.log('setInnerAudioOption 调用失败:', e); }

      if (this.audio) {
        try { this.audio.stop(); } catch(e){}
        try { this.audio.destroy(); } catch(e){}
      }
      this.audio = uni.createInnerAudioContext();
      this.audio.obeyMuteSwitch = false;
      this.audio.volume = 1.0;
      this.audio.loop = false;
      
      // 标记音频是否已准备好
      this.audio._canplayHandled = false;
      this.audio._pendingPlay = false;
      
      this.audio.onPlay(() => {
        this.playing = true;
        this.audio._pendingPlay = false;
        this.isLoadingAudio = false;
      });
      this.audio.onPause(() => {
        this.playing = false;
        this.isLoadingAudio = false;
      });
      this.audio.onStop(() => {
        this.playing = false;
        this.audio._pendingPlay = false;
        this.currentPlaying = null;
        this.isLoadingAudio = false;
      });
      this.audio.onEnded(() => {
        this.playing = false;
        this.audio._pendingPlay = false;
        this.currentPlaying = null;
        this.isLoadingAudio = false;
      });
      // 监听音频加载完成事件
      this.audio.onCanplay(() => {
        console.log('音频已加载完成，可以播放');
        // 如果之前有等待播放的请求且当前未播放，现在播放
        if (this.audio._pendingPlay && !this.playing) {
          // 如果已经处理过，不再重复处理（避免重复播放）
          if (this.audio._canplayHandled) {
            return;
          }
          this.audio._canplayHandled = true;
          setTimeout(() => {
            try {
              if (this.audio._pendingPlay && !this.playing) {
                this.audio.play();
                console.log('延迟播放音频');
              }
            } catch (err) {
              console.error('延迟播放失败:', err);
              this.audio._pendingPlay = false;
              uni.showToast({ title: '播放失败', icon: 'none' });
            }
          }, 50);
        }
      });
      this.audio.onError((err) => {
        console.error('音频播放错误:', err);
        this.audio._pendingPlay = false;
        this.audio._canplayHandled = false;
        this.isLoadingAudio = false;
        uni.showToast({
          title: '播放失败',
          icon: 'none'
        });
        this.playing = false;
        this.currentPlaying = null;
      });
    },
    initRecorder() {
      this.recorder = uni.getRecorderManager();
      this.recorder.onStart(() => {
        console.log('录音开始');
      });
      this.recorder.onStop((res) => {
        console.log('录音停止', res);
        const { tempFilePath } = res;
        if(tempFilePath) {
          this.isSavingRecording = true;
          this.saveRecording(this.currentRecording, tempFilePath);
          // 同步记录最近一次临时录音路径，作为兜底
          try {
            this.recentRecordings[this.currentRecording] = tempFilePath;
            const recent = uni.getStorageSync('parent_child_recent_temp') || {};
            recent[this.currentRecording] = tempFilePath;
            uni.setStorageSync('parent_child_recent_temp', recent);
          } catch(e) { console.warn('保存最近临时录音失败', e); }
          // 立刻使用临时文件进行一次即时回放，确保用户当下可听到
          try {
            this.doPlayRecording({ id: this.currentRecording }, tempFilePath);
          } catch(e) { console.warn('即时回放失败', e); }
          this.showRecordingModal = false;
          this.showRecordingComplete = true;
          setTimeout(() => {
            this.showRecordingComplete = false;
          }, 2000);
        }
        this.currentRecording = null;
      });
      this.recorder.onError((err) => {
        console.error('录音错误:', err);
        uni.showToast({
          title: '录音失败',
          icon: 'none'
        });
        this.currentRecording = null;
        this.showRecordingModal = false;
      });
    },
    playSong(song) {
      // 先停掉录音
      if(this.recordingAudio && this.playingRecording) {
        this.recordingAudio.stop();
        this.playingRecording = false;
        this.currentPlayingRecording = null;
      }
      
      // 如果点击的是同一首歌且正在播放，则暂停
      if(this.currentPlaying === song.id && this.playing){
        this.audio.pause();
        return;
      }
      
      // 如果点击的是同一首歌且已暂停，则继续播放
      if(this.currentPlaying === song.id && !this.playing){
        this.audio.play();
        return;
      }
      
      // 如果点击的是不同首歌，从头播放新歌
      // 节流：300ms内忽略重复点击
      const now = Date.now();
      if (!this.tapGuardTs) this.tapGuardTs = 0;
      if (now - this.tapGuardTs < 300) return;
      this.tapGuardTs = now;
      this.currentPlaying = song.id;
      const base = 'https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/songs';
      const normalizedId = (song.id || '').startsWith('song') ? song.id : `song${song.id}`;
      const audioSrc = `${base}/${normalizedId}.mp3`;
      
      try{ this.audio.stop(); }catch(e){}
      // 为新歌曲创建全新实例并仅在 canplay 后播放
      this.initAudio();
      this.isLoadingAudio = true;
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
      setTimeout(() => {
        if (this.audio && this.audio._pendingPlay && !this.playing) {
          try { this.audio.play(); } catch(e){}
        }
      }, 120);
    },
    async toggleRecording(song) {
      // 如果正在录制同一首歌，则停止
      if(this.currentRecording === song.id) {
        this.stopRecording();
        return;
      }
      
      // 停止当前录音
      if(this.currentRecording) {
        this.stopRecording();
      }
      
      // 权限检查
      const ok = await this.ensureRecordAuth();
      if (!ok) return;

      // 开始录音
      this.currentRecording = song.id;
      this.showRecordingModal = true;
      
      try {
        const sys = uni.getSystemInfoSync();
        const isIOS = (sys.platform || '').toLowerCase() === 'ios';
        this.recorder.start({
          duration: 60000,
          sampleRate: isIOS ? 44100 : 16000,
          numberOfChannels: 1,
          encodeBitRate: isIOS ? 128000 : 96000,
          format: isIOS ? 'aac' : 'mp3'
        });
      } catch (e) {
        // 兜底参数
        this.recorder.start({ duration: 60000, sampleRate: 16000, numberOfChannels: 1, encodeBitRate: 96000, format: 'mp3' });
      }
    },
    stopRecording() {
      if(this.recorder && this.currentRecording) {
        this.recorder.stop();
      }
      this.currentRecording = null;
      this.showRecordingModal = false;
    },
    playRecording(song) {
      // 如果正在播放同一段录音，则暂停
      if(this.currentPlayingRecording === song.id && this.playingRecording) {
        if(this.recordingAudio) {
          this.recordingAudio.pause();
        }
        return;
      }
      
      // 停止当前播放的音乐
      if(this.audio && this.playing) {
        this.audio.pause();
        this.currentPlaying = null;
      }
      
      // 获取录音文件路径
      let recordingPath = this.getRecordingPath(song.id);
      if(!recordingPath) {
        // 如果刚刚保存，还在异步 saveFile，稍等再查一次
        if (this.isSavingRecording) {
          setTimeout(() => {
            const retryPath = this.getRecordingPath(song.id);
            if (retryPath) {
              this.doPlayRecording(song, retryPath);
            } else {
              uni.showToast({ title: '没有找到录音', icon: 'none' });
            }
          }, 400);
          return;
        }
        // 尝试使用最近临时录音路径
        const recent = (this.recentRecordings && this.recentRecordings[song.id]) || ((uni.getStorageSync('parent_child_recent_temp')||{})[song.id]);
        if (recent) {
          this.doPlayRecording(song, recent);
          return;
        }
        uni.showToast({ title: '没有找到录音', icon: 'none' });
        return;
      }
      
      // 检查文件是否存在
      uni.getFileInfo({
        filePath: recordingPath,
        success: (res) => {
          console.log('录音文件存在，大小:', res.size);
          // 播放录音
          this.doPlayRecording(song, recordingPath);
        },
        fail: (err) => {
          console.error('录音文件不存在或无法访问:', err);
          uni.showToast({
            title: '录音文件不存在',
            icon: 'none'
          });
          // 清除无效的录音记录
          const recordings = uni.getStorageSync('parent_child_recordings') || {};
          delete recordings[song.id];
          uni.setStorageSync('parent_child_recordings', recordings);
        }
      });
    },
    doPlayRecording(song, recordingPath) {
      // 播放录音
      if(!this.recordingAudio) {
        this.recordingAudio = uni.createInnerAudioContext();
        this.recordingAudio.obeyMuteSwitch = false;
        try { uni.setInnerAudioOption && uni.setInnerAudioOption({ obeyMuteSwitch:false, mixWithOther:true, speakerOn:true }); } catch(e){}
        this.recordingAudio.volume = 1.0;
        this.recordingAudio.loop = false;
        this.recordingAudio._canplayHandled = false;
        this.recordingAudio._pendingPlay = false;
        
        this.recordingAudio.onPlay(() => {
          this.playingRecording = true;
          this.recordingAudio._pendingPlay = false;
        });
        this.recordingAudio.onPause(() => {
          this.playingRecording = false;
        });
        this.recordingAudio.onStop(() => {
          this.playingRecording = false;
          this.recordingAudio._pendingPlay = false;
          this.currentPlayingRecording = null;
        });
        this.recordingAudio.onEnded(() => {
          this.playingRecording = false;
          this.recordingAudio._pendingPlay = false;
          this.currentPlayingRecording = null;
        });
        this.recordingAudio.onCanplay(() => {
          if (this.recordingAudio._canplayHandled) {
            return;
          }
          this.recordingAudio._canplayHandled = true;
          console.log('录音音频已加载完成');
          if (this.recordingAudio._pendingPlay) {
            setTimeout(() => {
              try {
                this.recordingAudio.play();
              } catch (err) {
                console.error('播放录音失败:', err);
                uni.showToast({ title: '播放失败', icon: 'none' });
              }
            }, 100);
          }
        });
        this.recordingAudio.onError((err) => {
          console.error('录音播放错误:', err);
          this.recordingAudio._pendingPlay = false;
          this.recordingAudio._canplayHandled = false;
          this.playingRecording = false;
          this.currentPlayingRecording = null;
          uni.showToast({
            title: '播放失败',
            icon: 'none'
          });
        });
      }
      
      this.currentPlayingRecording = song.id;
      this.recordingAudio._canplayHandled = false;
      this.recordingAudio._pendingPlay = true;
      this.recordingAudio.src = recordingPath;
      console.log('设置录音源，路径:', recordingPath);
      
      // 如果等待超过 2 秒还没有加载完成，直接尝试播放
      setTimeout(() => {
        if (this.recordingAudio._pendingPlay && !this.playingRecording) {
          console.log('录音加载超时，尝试直接播放');
          this.recordingAudio._canplayHandled = true;
          try {
            this.recordingAudio.play();
          } catch (err) {
            console.error('播放录音失败:', err);
            this.recordingAudio._pendingPlay = false;
            uni.showToast({ title: '播放失败', icon: 'none' });
          }
        }
      }, 2000);
    },
    saveRecording(songId, filePath) {
      try {
        // 方案2（更稳）：复制到用户数据目录，使用可预测路径
        const fs = uni.getFileSystemManager ? uni.getFileSystemManager() : null;
        const userPath = (wx && wx.env && wx.env.USER_DATA_PATH) ? wx.env.USER_DATA_PATH : '';
        if (fs && userPath) {
          const useMp3 = filePath.toLowerCase().endsWith('.mp3');
          const savedPath = `${userPath}/parent_child_${songId}.${useMp3 ? 'mp3' : 'm4a'}`;
          try {
            // 若目标已存在，先删除
            fs.unlink({ filePath: savedPath, success: ()=>{}, fail: ()=>{} });
          } catch(e) {}
          fs.copyFile({
            srcPath: filePath,
            destPath: savedPath,
            success: () => {
              this.recordingsCache[songId] = savedPath;
              const recordings = uni.getStorageSync('parent_child_recordings') || {};
              recordings[songId] = savedPath;
              uni.setStorageSync('parent_child_recordings', recordings);
              console.log('录音复制到用户目录:', savedPath);
              this.isSavingRecording = false;
            },
            fail: (err) => {
              console.warn('copyFile 失败，降级使用 saveFile:', err);
              // 降级回 saveFile
              uni.saveFile({
                tempFilePath: filePath,
                success: (res) => {
                  const sp = res.savedFilePath || filePath;
                  this.recordingsCache[songId] = sp;
                  const recs = uni.getStorageSync('parent_child_recordings') || {};
                  recs[songId] = sp;
                  uni.setStorageSync('parent_child_recordings', recs);
                  this.isSavingRecording = false;
                },
                fail: () => {
                  // 最差也记住临时路径，保证本次会话可回放
                  this.recordingsCache[songId] = filePath;
                  const recs = uni.getStorageSync('parent_child_recordings') || {};
                  recs[songId] = filePath;
                  uni.setStorageSync('parent_child_recordings', recs);
                  this.isSavingRecording = false;
                }
              });
            }
          });
        } else {
          // 无 fs 能力时，回退 saveFile
          uni.saveFile({
            tempFilePath: filePath,
            success: (res) => {
              const sp = res.savedFilePath || filePath;
              this.recordingsCache[songId] = sp;
              const recs = uni.getStorageSync('parent_child_recordings') || {};
              recs[songId] = sp;
              uni.setStorageSync('parent_child_recordings', recs);
              this.isSavingRecording = false;
            },
            fail: () => {
              this.recordingsCache[songId] = filePath;
              const recs = uni.getStorageSync('parent_child_recordings') || {};
              recs[songId] = filePath;
              uni.setStorageSync('parent_child_recordings', recs);
              this.isSavingRecording = false;
            }
          });
        }
      } catch(e) {
        console.error('保存录音失败:', e);
      }
    },
    getRecordingPath(songId) {
      try {
        // 先读缓存，保证刚保存即可回放
        if (this.recordingsCache && this.recordingsCache[songId]) {
          return this.recordingsCache[songId];
        }
        const recordings = uni.getStorageSync('parent_child_recordings') || {};
        if (recordings[songId]) return recordings[songId];
        const recent = uni.getStorageSync('parent_child_recent_temp') || {};
        if (recent[songId]) return recent[songId];
        // 直接探测用户目录中的两种扩展名
        try {
          const fs = uni.getFileSystemManager ? uni.getFileSystemManager() : null;
          const userPath = (wx && wx.env && wx.env.USER_DATA_PATH) ? wx.env.USER_DATA_PATH : '';
          if (fs && userPath) {
            const tryPaths = [
              `${userPath}/parent_child_${songId}.mp3`,
              `${userPath}/parent_child_${songId}.m4a`,
              `${userPath}/parent_child_${songId}.aac`
            ];
            for (const p of tryPaths) {
              try {
                fs.accessSync && fs.accessSync(p);
                return p;
              } catch(e) {}
            }
          }
        } catch(e) { console.warn('探测用户目录失败:', e); }
        return null;
      } catch(e) {
        console.error('获取录音失败:', e);
        return null;
      }
    },
    loadRecordings() {
      // 加载已保存的录音信息
      // 这里主要用于检查哪些歌曲已经有录音
    }
  }
};
</script>

<style scoped>
.parent-singing-page {
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

.singing-card {
  background: rgba(255,255,255,0.12);
  border: 2rpx solid rgba(255,255,255,0.22);
  border-radius: 22rpx;
  padding: 32rpx;
  margin-bottom: 36rpx;
  backdrop-filter: blur(10rpx);
}

.singing-header {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
}

.singing-icon {
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

.singing-info {
  flex: 1;
  min-width: 0;
}

.singing-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #fff;
  margin-bottom: 8rpx;
  display: block;
}

.singing-description {
  font-size: 22rpx;
  color: rgba(255,255,255,0.9);
  display: block;
}

.singing-actions {
  display: flex;
  gap: 12rpx;
  flex-shrink: 0;
}

.action-btn {
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

.action-btn.playing {
  background: linear-gradient(45deg, #56ab2f 0%, #a8e6cf 100%);
  animation: pulse 1s ease-in-out infinite;
}

.action-btn.recording {
  background: linear-gradient(45deg, #f7971e 0%, #ffd200 100%);
  animation: pulse 1s ease-in-out infinite;
}

.action-btn:active {
  transform: scale(0.95);
}

.lyrics-area {
  background: rgba(255,255,255,0.05);
  border-radius: 15rpx;
  padding: 24rpx;
  margin-top: 24rpx;
}

.lyrics-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #fff;
  margin-bottom: 16rpx;
  text-align: center;
}

.lyrics-content {
  font-size: 24rpx;
  color: rgba(255,255,255,0.9);
  line-height: 1.8;
  text-align: center;
}

.lyric-line {
  display: block;
  margin-bottom: 8rpx;
}

.lyric-line:last-child {
  margin-bottom: 0;
}

.singing-tips {
  background: rgba(255,255,255,0.1);
  border-radius: 10rpx;
  padding: 20rpx;
  margin-top: 24rpx;
}

.tips-title {
  font-size: 26rpx;
  font-weight: 600;
  color: #fff;
  margin-bottom: 12rpx;
}

.tips-list {
  font-size: 22rpx;
  color: rgba(255,255,255,0.9);
  line-height: 1.8;
}

.tip-item {
  display: block;
  margin-bottom: 8rpx;
}

.tip-item:last-child {
  margin-bottom: 0;
}

.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: 2rpx solid rgba(255,255,255,0.3);
  border-radius: 20rpx;
  padding: 40rpx;
  max-width: 80%;
  text-align: center;
  box-shadow: 0 15rpx 40rpx rgba(102, 126, 234, 0.4);
}

.modal-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #fff;
  margin-bottom: 20rpx;
}

.modal-text {
  font-size: 26rpx;
  color: rgba(255,255,255,0.9);
  line-height: 1.6;
  margin-bottom: 30rpx;
}

.modal-btn {
  background: linear-gradient(45deg, #4facfe 0%, #00f2fe 100%);
  border: none;
  border-radius: 50rpx;
  padding: 16rpx 50rpx;
  font-size: 28rpx;
  font-weight: 600;
  color: #fff;
}

.toast-success {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%);
  color: #fff;
  padding: 24rpx 48rpx;
  border-radius: 15rpx;
  box-shadow: 0 10rpx 30rpx rgba(0,0,0,0.3);
  z-index: 2000;
  font-size: 28rpx;
  font-weight: 600;
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

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}
</style>
