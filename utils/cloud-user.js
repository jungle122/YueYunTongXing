var userModule = require('./user.js');

function ensureCloudAvailable() {
  if (!wx.cloud || !wx.cloud.callFunction) {
    throw new Error('当前版本暂不支持微信身份服务');
  }
}

async function callProfile(data) {
  ensureCloudAvailable();
  var response = await wx.cloud.callFunction({ name: 'userProfile', data: data });
  var result = response && response.result;
  if (!result || !result.ok) {
    throw new Error(result && result.message ? result.message : '微信身份服务暂时不可用');
  }
  return result;
}

async function prepareAvatar(profile) {
  if (profile.avatarType !== 'wechat') return profile.avatar || '';
  if (profile.communityAvatarFileID && profile.communityAvatarFileID.indexOf('cloud://') === 0) {
    return profile.communityAvatarFileID;
  }
  if (profile.avatar && profile.avatar.indexOf('cloud://') === 0) return profile.avatar;
  if (!profile.avatar) throw new Error('请重新选择微信头像');

  var extensionMatch = profile.avatar.match(/\.(jpg|jpeg|png|webp)(?:\?|$)/i);
  var extension = extensionMatch ? '.' + extensionMatch[1].toLowerCase() : '.jpg';
  var cloudPath = 'community-avatars/profile-' + Date.now() + '-' + Math.random().toString(36).slice(2, 10) + extension;
  var uploadResult = await wx.cloud.uploadFile({ cloudPath: cloudPath, filePath: profile.avatar });
  if (!uploadResult || !uploadResult.fileID) throw new Error('微信头像上传失败，请重试');
  return uploadResult.fileID;
}

function cacheProfile(profile, previousUserId) {
  if (!profile) return null;
  if (previousUserId && profile.userId && previousUserId !== profile.userId) {
    userModule.copyUserStorage(previousUserId, profile.userId);
  }
  return userModule.cacheProfile(profile);
}

async function restoreProfile() {
  var result = await callProfile({ action: 'get' });
  if (!result.exists || !result.profile) return null;
  return cacheProfile(result.profile, '');
}

async function saveProfile(profile) {
  var previousUserId = profile.userId || '';
  var avatar = await prepareAvatar(profile);
  var result = await callProfile({
    action: 'save',
    nickname: profile.nickname,
    avatar: avatar,
    avatarType: profile.avatarType
  });
  var cached = cacheProfile(result.profile, previousUserId);
  return { profile: cached, isNew: !!result.isNew };
}

module.exports = {
  restoreProfile: restoreProfile,
  saveProfile: saveProfile
};
