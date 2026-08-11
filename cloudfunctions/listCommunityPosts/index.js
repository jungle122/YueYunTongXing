const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const _ = db.command;
const POSTS_COLLECTION = 'communityPosts';
const PROFILES_COLLECTION = 'userProfiles';
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 20;
const PROFILE_QUERY_BATCH_SIZE = 10;

function failure(code, message) {
  return { ok: false, code: code, message: message };
}

function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (value.$date) return new Date(value.$date);
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

async function getProfilesByOpenid(records) {
  const openids = [];
  records.forEach(function(record) {
    if (record.openid && openids.indexOf(record.openid) === -1) openids.push(record.openid);
  });
  if (openids.length === 0) return {};

  const tasks = [];
  for (let index = 0; index < openids.length; index += PROFILE_QUERY_BATCH_SIZE) {
    const batch = openids.slice(index, index + PROFILE_QUERY_BATCH_SIZE);
    tasks.push(
      db.collection(PROFILES_COLLECTION)
        .where({ openid: _.in(batch) })
        .limit(batch.length)
        .get()
    );
  }

  const results = await Promise.all(tasks);
  const profilesByOpenid = {};
  results.forEach(function(result) {
    (result.data || []).forEach(function(profile) {
      if (profile.openid) profilesByOpenid[profile.openid] = profile;
    });
  });
  return profilesByOpenid;
}

exports.main = async function(event) {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  if (!openid) return failure('IDENTITY_UNAVAILABLE', '暂时无法确认微信身份，请稍后再试');

  const input = event || {};
  const requestedLimit = Math.floor(Number(input.limit) || DEFAULT_LIMIT);
  const limit = Math.max(1, Math.min(MAX_LIMIT, requestedLimit));
  const cursorDate = toDate(input.cursor);
  const where = { status: 'visible' };
  if (cursorDate) where.createdAt = _.lt(cursorDate);

  try {
    const result = await db.collection(POSTS_COLLECTION)
      .where(where)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();
    const records = result.data || [];
    const profilesByOpenid = await getProfilesByOpenid(records);
    const avatarFileIDs = [];
    records.forEach(function(record) {
      const profile = profilesByOpenid[record.openid];
      const avatarType = profile ? profile.avatarType : record.avatarType;
      const avatar = profile ? profile.avatar : record.avatar;
      if (avatarType === 'wechat' && avatar && avatarFileIDs.indexOf(avatar) === -1) {
        avatarFileIDs.push(avatar);
      }
    });

    const avatarUrls = {};
    if (avatarFileIDs.length > 0) {
      const tempResult = await cloud.getTempFileURL({ fileList: avatarFileIDs });
      (tempResult.fileList || []).forEach(function(file) {
        if (file.status === 0 && file.tempFileURL) avatarUrls[file.fileID] = file.tempFileURL;
      });
    }

    const posts = records.map(function(record) {
      const createdAt = toDate(record.createdAt);
      const profile = profilesByOpenid[record.openid];
      const nickname = profile && profile.nickname ? profile.nickname : record.nickname;
      const avatar = profile && profile.avatar !== undefined ? profile.avatar : record.avatar;
      const avatarType = profile && profile.avatarType ? profile.avatarType : record.avatarType;
      return {
        id: record._id,
        nickname: nickname || '粤韵小伙伴',
        avatar: avatarType === 'wechat' ? (avatarUrls[avatar] || '') : (avatar || ''),
        avatarType: avatarType === 'wechat'
          ? (avatarUrls[avatar] ? 'wechat' : 'emoji')
          : (avatarType === 'sticker' ? 'sticker' : 'emoji'),
        content: record.content || '',
        time: createdAt ? createdAt.toISOString() : '',
        isMine: record.openid === openid,
        usesStudyTime: !!record.usesStudyTime,
        dataSource: record.dataSource || 'local_device'
      };
    });
    const lastRecord = records.length > 0 ? records[records.length - 1] : null;
    const lastDate = lastRecord ? toDate(lastRecord.createdAt) : null;

    return {
      ok: true,
      posts: posts,
      hasMore: records.length === limit,
      nextCursor: lastDate ? lastDate.toISOString() : ''
    };
  } catch (error) {
    console.error('listCommunityPosts failed:', error);
    return failure('SERVICE_UNAVAILABLE', '成长分享暂时加载失败，请稍后再试');
  }
};
