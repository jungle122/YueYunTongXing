const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const _ = db.command;
const POSTS_COLLECTION = 'communityPosts';
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 20;

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
    const avatarFileIDs = [];
    records.forEach(function(record) {
      if (record.avatarType === 'wechat' && record.avatar && avatarFileIDs.indexOf(record.avatar) === -1) {
        avatarFileIDs.push(record.avatar);
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
      return {
        id: record._id,
        nickname: record.nickname || '粤韵小伙伴',
        avatar: record.avatarType === 'wechat' ? (avatarUrls[record.avatar] || '') : (record.avatar || ''),
        avatarType: record.avatarType === 'wechat' && avatarUrls[record.avatar] ? 'wechat' : 'emoji',
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
