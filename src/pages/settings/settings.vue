<template>
  <view class="settings-page">
    <view class="bg-stars"></view>

    <view class="container">
      <view class="header">
        <view class="back-btn" @tap="goBack">←</view>
        <text class="page-title">个性化设置</text>
        <view></view>
      </view>

      <view class="content">
        <view class="setting-row">
          <text class="setting-label">昵称</text>
          <input 
            class="setting-input" 
            v-model="nickname" 
            placeholder="请输入昵称" 
            placeholder-style="color: rgba(255,255,255,0.6)"
            @input="onNicknameInput"
          />
        </view>

        <view class="setting-row">
          <text class="setting-label">每日学习提醒</text>
          <switch 
            :checked="dailyReminder" 
            @change="onReminderChange"
            color="#56ab2f"
          />
        </view>

        <view class="setting-row">
          <text class="setting-label">难度等级</text>
          <picker 
            :range="difficultyLevels" 
            :value="difficultyIndex" 
            @change="onDifficultyChange"
            mode="selector"
          >
            <view class="setting-picker">{{ difficultyLevels[difficultyIndex] }}</view>
          </picker>
        </view>

        <view class="setting-row">
          <text class="setting-label">更换头像</text>
          <image 
            v-if="selectedAvatarPath" 
            :src="selectedAvatarPath" 
            class="avatar-preview"
            mode="aspectFill"
            @error="onPreviewError"
          />
          <view v-else class="avatar-preview">👤</view>
        </view>

        <view class="avatar-selection">
          <view 
            v-for="(avatar, index) in avatars" 
            :key="index"
            :class="['avatar-option', { 'selected': selectedAvatar === avatar.key }]"
            @tap="selectAvatar(avatar.key)"
          >
            <image :src="avatar.path" class="avatar-img" mode="aspectFill" @error="onImageError" />
          </view>
        </view>

        <view class="save-btn" @tap="saveSettings">保存设置</view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'SettingsPage',
  data() {
    return {
      nickname: '',
      dailyReminder: true,
      difficultyLevels: ['入门', '初级', '中级', '高级'],
      difficultyIndex: 1,
      selectedAvatar: '1',
      avatars: [
        { key: '1', path: 'https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/Avatars/Avatar1.png' },
        { key: '2', path: 'https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/Avatars/Avatar2.png' },
        { key: '3', path: 'https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/Avatars/Avatar3.png' }
      ]
    };
  },
  computed: {
    selectedAvatarPath() {
      const avatar = this.avatars.find(a => a.key === String(this.selectedAvatar));
      return avatar ? avatar.path : '';
    }
  },
  onLoad() {
    this.loadSettings();
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
    loadSettings() {
      const nickname = uni.getStorageSync('userNickname') || '';
      const dailyReminder = uni.getStorageSync('dailyReminder');
      const difficulty = uni.getStorageSync('difficultyLevel') || '初级';
      const selectedAvatar = uni.getStorageSync('selectedAvatar') || '1';

      this.nickname = nickname;
      this.dailyReminder = dailyReminder !== false;
      this.difficultyIndex = this.difficultyLevels.indexOf(difficulty);
      if (this.difficultyIndex === -1) this.difficultyIndex = 1;
      this.selectedAvatar = selectedAvatar;
    },
    onNicknameInput(e) {
      this.nickname = e.detail.value;
    },
    onReminderChange(e) {
      this.dailyReminder = e.detail.value;
    },
    onDifficultyChange(e) {
      this.difficultyIndex = e.detail.value;
    },
    selectAvatar(key) {
      this.selectedAvatar = key;
    },
    saveSettings() {
      // 保存设置到本地存储
      uni.setStorageSync('userNickname', this.nickname);
      uni.setStorageSync('dailyReminder', this.dailyReminder);
      uni.setStorageSync('difficultyLevel', this.difficultyLevels[this.difficultyIndex]);
      uni.setStorageSync('selectedAvatar', String(this.selectedAvatar));

      // 触发首页更新
      uni.showToast({
        title: '设置已保存',
        icon: 'success',
        duration: 2000
      });

      // 延迟返回，让用户看到提示
      setTimeout(() => {
        const pages = getCurrentPages();
        if (pages && pages.length > 1) {
          uni.navigateBack();
        } else {
          uni.reLaunch({ url: '/pages/home/home' });
        }
      }, 1500);
    },
    onImageError(e) {
      console.error('头像图片加载失败:', e);
    },
    onPreviewError(e) {
      console.error('头像预览加载失败:', e);
    }
  }
};
</script>

<style scoped>
.settings-page {
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
  gap: 0;
  max-width: 900rpx;
  margin: 0 auto;
  background: rgba(255,255,255,0.12);
  border: 2rpx solid rgba(255,255,255,0.24);
  border-radius: 22rpx;
  padding: 28rpx;
  box-shadow: 0 16rpx 36rpx rgba(0,0,0,.2);
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 0;
  border-bottom: 2rpx solid rgba(255,255,255,0.1);
}

.setting-row:last-of-type {
  border-bottom: none;
}

.setting-label {
  font-size: 28rpx;
  color: #fff;
  font-weight: 600;
}

.setting-input {
  background: rgba(255,255,255,0.1);
  border: 2rpx solid rgba(255,255,255,0.2);
  border-radius: 12rpx;
  color: #fff;
  padding: 16rpx 24rpx;
  font-size: 26rpx;
  min-width: 200rpx;
  text-align: right;
}

.setting-picker {
  background: rgba(255,255,255,0.1);
  border: 2rpx solid rgba(255,255,255,0.2);
  border-radius: 12rpx;
  color: #fff;
  padding: 16rpx 24rpx;
  font-size: 26rpx;
  min-width: 200rpx;
  text-align: right;
}

.avatar-preview {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: linear-gradient(45deg, #4facfe 0%, #00f2fe 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  overflow: hidden;
}

.avatar-selection {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 32rpx;
  margin-top: 40rpx;
  padding-top: 40rpx;
  border-top: 2rpx solid rgba(255,255,255,0.1);
}

.avatar-option {
  width: 140rpx;
  height: 140rpx;
  border-radius: 50%;
  border: 6rpx solid rgba(255,255,255,0.3);
  overflow: hidden;
  transition: all 0.3s ease;
}

.avatar-option.selected {
  border-color: #FFD700;
  border-width: 8rpx;
  transform: scale(1.1);
}

.avatar-img {
  width: 100%;
  height: 100%;
}

.save-btn {
  margin-top: 60rpx;
  background: linear-gradient(45deg, #FFD700, #FFA500, #FFD700);
  border-radius: 50rpx;
  padding: 28rpx;
  text-align: center;
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  box-shadow: 0 8rpx 30rpx rgba(255,215,0,.3);
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
