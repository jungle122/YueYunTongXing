<template>
  <view class="yyth-home">
    <!-- 背景和动效层 -->
    <view class="bg-stars"></view>

    <!-- 用户卡片 -->
      <view class="user-card" @tap="goToProfile" v-if="isLoggedIn">
      <image v-if="userAvatar" :src="userAvatar" class="avatar-img" mode="aspectFill" @error="onAvatarError" />
      <view v-else class="avatar-fallback">{{ nicknameFirstChar }}</view>
      <text class="nickname">{{ userNickname || '用户' }}</text>
    </view>

    <!-- 头部主视觉 -->
    <view class="header-section">
      <text class="main-title">粤韵童行</text>
      <view class="stars-and-music">
        <text class="icon-star">★</text>
        <text class="subtitle">让粤语童谣陪伴孩子快乐成长</text>
        <text class="icon-music">🎵</text>
      </view>
    </view>

    <!-- 四宫格主导航 -->
    <view class="nav-section">
      <view class="nav">
        <navigator class="nav-btn module-learn" url="/pages/learn/learn" open-type="redirectTo">
          <text class="nav-emoji">📚</text>
          <text class="nav-label">学习</text>
        </navigator>
        <navigator class="nav-btn module-games" url="/pages/games/games" open-type="redirectTo">
          <text class="nav-emoji">🎮</text>
          <text class="nav-label">游戏</text>
        </navigator>
        <navigator class="nav-btn module-original" url="/pages/original/original" open-type="redirectTo">
          <text class="nav-emoji">🎬</text>
          <text class="nav-label">原创</text>
        </navigator>
        <navigator class="nav-btn module-profile" url="/pages/profile/profile" open-type="redirectTo">
          <text class="nav-emoji">👤</text>
          <text class="nav-label">我的</text>
        </navigator>
      </view>
    </view>
    <!-- 吉祥物小狮子 -->
    <view class="mascot-lion">
      <text class="lion-emoji">🦁</text>
    </view>
  </view>
</template>
<script>
export default {
  name: 'HomePage',
  data() {
    return {
      isLoggedIn: false,
      userNickname: '',
      userAvatar: ''
    };
  },
  computed: {
    nicknameFirstChar() {
      return this.userNickname ? this.userNickname.charAt(0) : '用';
    }
  },
  onLoad() {
    this.checkLoginStatus();
  },
  onShow() {
    this.checkLoginStatus();
  },
  methods: {
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
    goToProfile() {
      uni.navigateTo({ url: '/pages/profile/profile' });
    },
    onAvatarError(e) {
      console.error('头像加载失败:', e);
      this.userAvatar = '';
    }
  }
};
</script>
<style scoped>
/* 背景与基础布局（小程序：使用 page 作为根视图，但此处加容器类） */
.yyth-home {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40rpx 32rpx 60rpx 32rpx;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
}

/* 用户卡片占位头像 */
.user-card { position: absolute; right: 32rpx; top: 32rpx; display:flex; align-items:center; gap: 12rpx; z-index: 2; flex-direction: row-reverse; }
.avatar-fallback { width: 64rpx; height: 64rpx; border-radius: 50%; background: linear-gradient(45deg,#4facfe,#00f2fe); color:#fff; font-weight:700; font-size: 28rpx; display:flex; align-items:center; justify-content:center; }
.avatar-img { width: 64rpx; height: 64rpx; border-radius: 50%; border: 2rpx solid rgba(255,255,255,0.3); }
.nickname { color:#fff; font-weight:700; font-size: 28rpx; }

/* 星星闪烁背景（用多层径向渐变模拟） */
.bg-stars {
  position: absolute; left: 0; top: 0; right: 0; bottom: 0;
  background-image:
    radial-gradient(6rpx 6rpx at 40rpx 60rpx, #ffffff, rgba(255,255,255,0)),
    radial-gradient(4rpx 4rpx at 80rpx 140rpx, rgba(255,255,255,0.8), rgba(255,255,255,0)),
    radial-gradient(8rpx 8rpx at 180rpx 80rpx, #ffffff, rgba(255,255,255,0)),
    radial-gradient(4rpx 4rpx at 260rpx 160rpx, rgba(255,255,255,0.6), rgba(255,255,255,0));
  background-repeat: repeat;
  background-size: 700rpx 400rpx;
  animation: starTwinkle 4s ease-in-out infinite;
  pointer-events: none;
  z-index: 0;
}

.floating-elements {
  position: absolute; left: 0; top: 0; right: 0; bottom: 0; z-index: 0; pointer-events: none;
}

.glow-effects { position: absolute; left: 0; top: 0; right: 0; bottom: 0; z-index: 0; pointer-events: none; }
.glow { position: absolute; width: 200rpx; height: 200rpx; border-radius: 50%;
  background: radial-gradient(circle, rgba(255,215,0,0.25), rgba(255,215,0,0));
  animation: glowPulse 4s ease-in-out infinite; }
.glow-a { left: 80%; top: 20%; animation-delay: 0s; }
.glow-b { left: 10%; bottom: 15%; animation-delay: 2s; }

.header-section { padding: 40rpx 0 20rpx 0; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; position: relative; z-index: 1; }

.main-title {
  font-size: 64rpx; font-weight: 900; color: #fff; letter-spacing: 6rpx;
  text-shadow: 0 0 30rpx rgba(255, 215, 0, 0.5);
  animation: titleGlow 3s ease-in-out infinite alternate;
}

.subtitle { margin-top: 16rpx; font-size: 28rpx; font-weight: 600; color: rgba(255, 255, 255, 0.9); animation: subtitleFloat 4s ease-in-out infinite; }

.nav-section { margin-top: 40rpx; display: flex; align-items: center; justify-content: center; position: relative; z-index: 1; }

.nav { width: 100%; max-width: 700rpx; display: grid; grid-template-columns: 1fr 1fr; grid-row-gap: 24rpx; grid-column-gap: 24rpx; }

.nav-btn { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 220rpx; padding: 30rpx 20rpx; border-radius: 30rpx; background: rgba(255, 255, 255, 0.15); border: 2rpx solid rgba(255, 255, 255, 0.28); box-shadow: 0 16rpx 40rpx rgba(0, 0, 0, 0.18), inset 0 2rpx 0 rgba(255,255,255,0.35); color: #fff; }

.nav-emoji { font-size: 76rpx; margin-bottom: 18rpx; filter: drop-shadow(0 8rpx 16rpx rgba(0,0,0,0.3)); animation: emojiFloat 3s ease-in-out infinite; }

.nav-label { font-size: 30rpx; font-weight: 700; }

/* 吉祥物表情位置 */
.mascot-lion { position: absolute; right: 24rpx; bottom: 24rpx; z-index: 1; }
.lion-emoji { font-size: 88rpx; filter: drop-shadow(0 12rpx 22rpx rgba(0,0,0,0.25)); }

/* 粒子上浮 */
.particles { position: absolute; left: 0; top: 0; right: 0; bottom: 0; z-index: 0; pointer-events: none; }
.particle { position: absolute; width: 8rpx; height: 8rpx; background: rgba(255,255,255,0.6); border-radius: 50%; animation: particleFloat 12s linear infinite; }
.p1 { left: 10%; animation-delay: 0s; animation-duration: 15s; }
.p2 { left: 30%; animation-delay: 2s; animation-duration: 18s; }
.p3 { left: 50%; animation-delay: 4s; animation-duration: 12s; }
.p4 { left: 70%; animation-delay: 6s; animation-duration: 16s; }
.p5 { left: 90%; animation-delay: 8s; animation-duration: 14s; }

/* 动画定义 */
@keyframes titleGlow { 0% { text-shadow: 0 0 20rpx rgba(255,215,0,0.6), 0 0 40rpx rgba(255,215,0,0.4), 0 0 60rpx rgba(255,215,0,0.2); transform: scale(1); } 100% { text-shadow: 0 0 30rpx rgba(255,215,0,0.8), 0 0 60rpx rgba(255,215,0,0.6), 0 0 90rpx rgba(255,215,0,0.4); transform: scale(1.02); } }
@keyframes subtitleFloat { 0%,100%{ transform: translateY(0); opacity: .8; } 50%{ transform: translateY(-6rpx); opacity: 1; } }
@keyframes emojiFloat { 0%,100%{ transform: translateY(0) rotate(0); } 50%{ transform: translateY(-8rpx) rotate(2deg); } }
@keyframes starTwinkle { 0%,100%{ opacity:.4; transform: scale(1); } 50%{ opacity:1; transform: scale(1.2); } }
@keyframes glowPulse { 0%,100%{ opacity:.3; transform: scale(1); } 50%{ opacity:.6; transform: scale(1.2); } }
@keyframes particleFloat { 0%{ transform: translateY(100vh) rotate(0); opacity:0; } 10%{ opacity:1; } 90%{ opacity:1; } 100%{ transform: translateY(-100rpx) rotate(360deg); opacity:0; } }

/* 小屏适配 */
@media (max-width: 480px) {
  .main-title { font-size: 52rpx; }
  .subtitle { font-size: 26rpx; }
  .nav { grid-row-gap: 20rpx; grid-column-gap: 20rpx; }
  .nav-btn { min-height: 200rpx; }
  .nav-emoji { font-size: 64rpx; }
  .nav-label { font-size: 28rpx; }
}
</style>
