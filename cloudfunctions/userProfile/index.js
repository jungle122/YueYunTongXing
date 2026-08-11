const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const PROFILES_COLLECTION = 'userProfiles';
const MAX_NICKNAME_LENGTH = 12;
const ALLOWED_EMOJI_AVATARS = ['🦊', '🐱', '🐶', ''];
const ALLOWED_STICKER_AVATARS = [
  '/static/avatars/sticker-01.jpg',
  '/static/avatars/sticker-02.jpg',
  '/static/avatars/sticker-03.jpg',
  '/static/avatars/sticker-04.jpg',
  '/static/avatars/sticker-05.jpg',
  '/static/avatars/sticker-06.jpg',
  '/static/avatars/sticker-07.jpg'
];

function failure(code, message) {
  return { ok: false, code: code, message: message };
}

function normalizeNickname(value) {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
}

function validateAvatar(input) {
  const avatarType = input.avatarType === 'wechat'
    ? 'wechat'
    : (input.avatarType === 'sticker' ? 'sticker' : 'emoji');
  const avatar = typeof input.avatar === 'string' ? input.avatar.trim() : '';

  if (avatarType === 'sticker') {
    return ALLOWED_STICKER_AVATARS.indexOf(avatar) >= 0
      ? { avatarType: 'sticker', avatar: avatar }
      : null;
  }
  if (avatarType === 'emoji') {
    return ALLOWED_EMOJI_AVATARS.indexOf(avatar) >= 0
      ? { avatarType: 'emoji', avatar: avatar }
      : null;
  }
  if (
    avatar &&
    avatar.length <= 500 &&
    avatar.indexOf('cloud://') === 0 &&
    avatar.indexOf('/community-avatars/') >= 0
  ) {
    return { avatarType: 'wechat', avatar: avatar };
  }
  return null;
}

async function isNicknameSafe(nickname, openid) {
  const checkResult = await cloud.openapi.security.msgSecCheck({
    content: nickname,
    version: 2,
    scene: 1,
    openid: openid
  });
  return !!(
    checkResult &&
    checkResult.result &&
    checkResult.result.suggest === 'pass'
  );
}

async function resolveProfile(record) {
  let avatar = record.avatar || '';
  let communityAvatarFileID = '';
  if (record.avatarType === 'wechat' && avatar) {
    communityAvatarFileID = avatar;
    const tempResult = await cloud.getTempFileURL({ fileList: [avatar] });
    const file = tempResult.fileList && tempResult.fileList[0];
    avatar = file && file.status === 0 && file.tempFileURL ? file.tempFileURL : '';
  }
  return {
    userId: record._id,
    nickname: record.nickname || '',
    avatar: avatar,
    avatarType: record.avatarType || 'emoji',
    communityAvatarFileID: communityAvatarFileID,
    cloudProfile: true
  };
}

exports.main = async function(event) {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  if (!openid) return failure('IDENTITY_UNAVAILABLE', '暂时无法确认微信身份，请稍后再试');

  const input = event || {};
  const action = input.action === 'save' ? 'save' : 'get';

  try {
    const existingResult = await db.collection(PROFILES_COLLECTION)
      .where({ openid: openid })
      .limit(1)
      .get();
    const existing = existingResult.data && existingResult.data[0];

    if (action === 'get') {
      return { ok: true, exists: !!existing, profile: existing ? await resolveProfile(existing) : null };
    }

    const nickname = normalizeNickname(input.nickname);
    if (!nickname) return failure('EMPTY_NICKNAME', '请填写昵称');
    if (Array.from(nickname).length > MAX_NICKNAME_LENGTH) {
      return failure('NICKNAME_TOO_LONG', '昵称不能超过12个字');
    }
    const avatar = validateAvatar(input);
    if (!avatar) return failure('INVALID_AVATAR', '头像信息无效，请重新选择');
    if (!await isNicknameSafe(nickname, openid)) {
      return failure('UNSAFE_NICKNAME', '昵称暂时无法使用，请修改后重试');
    }

    if (existing) {
      await db.collection(PROFILES_COLLECTION).doc(existing._id).update({
        data: {
          nickname: nickname,
          avatar: avatar.avatar,
          avatarType: avatar.avatarType,
          updatedAt: db.serverDate()
        }
      });
      return {
        ok: true,
        isNew: false,
        profile: await resolveProfile(Object.assign({}, existing, {
          nickname: nickname,
          avatar: avatar.avatar,
          avatarType: avatar.avatarType
        }))
      };
    }

    const addResult = await db.collection(PROFILES_COLLECTION).add({
      data: {
        openid: openid,
        nickname: nickname,
        avatar: avatar.avatar,
        avatarType: avatar.avatarType,
        createdAt: db.serverDate(),
        updatedAt: db.serverDate()
      }
    });
    return {
      ok: true,
      isNew: true,
      profile: await resolveProfile({
        _id: addResult._id,
        nickname: nickname,
        avatar: avatar.avatar,
        avatarType: avatar.avatarType
      })
    };
  } catch (error) {
    console.error('userProfile failed:', error);
    return failure('SERVICE_UNAVAILABLE', '微信身份服务暂时不可用，请稍后再试');
  }
};
