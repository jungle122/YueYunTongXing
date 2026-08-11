const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const COLLECTION = 'userLearningData';
const MAX_SNAPSHOT_BYTES = 600 * 1024;
const ALLOWED_KEYS = [
  'learningHistory',
  'audio_likes',
  'audio_progress',
  'video_favorites',
  'text_science_collections',
  'text_science_read_progress',
  'picture_book_favorites',
  'checkins',
  'community_posts_sent'
];

function failure(code, message) {
  return { ok: false, code: code, message: message };
}

function sanitizeSnapshot(value) {
  const input = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const output = {};
  ALLOWED_KEYS.forEach(function(key) {
    if (!Object.prototype.hasOwnProperty.call(input, key)) return;
    if (key === 'learningHistory') {
      output[key] = Array.isArray(input[key]) ? input[key].slice(-500) : [];
      return;
    }
    if (key === 'checkins') {
      output[key] = Array.isArray(input[key]) ? input[key].slice(-400) : [];
      return;
    }
    if (key === 'community_posts_sent') {
      output[key] = Math.max(0, Math.floor(Number(input[key]) || 0));
      return;
    }
    output[key] = input[key] && typeof input[key] === 'object' && !Array.isArray(input[key])
      ? input[key]
      : {};
  });
  return output;
}

exports.main = async function(event) {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  if (!openid) return failure('IDENTITY_UNAVAILABLE', '暂时无法确认微信身份，请稍后再试');

  const input = event || {};
  const action = input.action === 'save' ? 'save' : 'get';

  try {
    const result = await db.collection(COLLECTION).where({ openid: openid }).limit(1).get();
    const existing = result.data && result.data[0];

    if (action === 'get') {
      return { ok: true, exists: !!existing, snapshot: existing ? (existing.snapshot || {}) : {} };
    }

    const snapshot = sanitizeSnapshot(input.snapshot);
    const snapshotBytes = Buffer.byteLength(JSON.stringify(snapshot), 'utf8');
    if (snapshotBytes > MAX_SNAPSHOT_BYTES) {
      return failure('SNAPSHOT_TOO_LARGE', '学习数据过多，暂时无法同步');
    }

    if (existing) {
      await db.collection(COLLECTION).doc(existing._id).update({
        data: { snapshot: snapshot, updatedAt: db.serverDate() }
      });
    } else {
      await db.collection(COLLECTION).add({
        data: {
          openid: openid,
          snapshot: snapshot,
          createdAt: db.serverDate(),
          updatedAt: db.serverDate()
        }
      });
    }
    return { ok: true };
  } catch (error) {
    console.error('userLearningData failed:', error);
    return failure('SERVICE_UNAVAILABLE', '学习数据同步暂时不可用，请稍后再试');
  }
};
