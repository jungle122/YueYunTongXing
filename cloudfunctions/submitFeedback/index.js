const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const FEEDBACKS_COLLECTION = 'feedbacks';
const ALLOWED_TYPES = ['suggestion', 'bug', 'praise', 'other'];
const MIN_SUBMIT_INTERVAL_MS = 5000;
const DUPLICATE_INTERVAL_MS = 60000;
const MAX_CONTENT_LENGTH = 500;
const MAX_CONTACT_LENGTH = 100;

function failure(code, message) {
  return { ok: false, code: code, message: message };
}

function getTime(value) {
  if (!value) return 0;
  if (value instanceof Date) return value.getTime();
  if (value.$date) return new Date(value.$date).getTime();
  return new Date(value).getTime() || 0;
}

exports.main = async function(event) {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  if (!openid) {
    return failure('IDENTITY_UNAVAILABLE', '暂时无法确认微信身份，请稍后再试');
  }

  const input = event || {};
  const type = typeof input.type === 'string' ? input.type : '';
  const content = typeof input.content === 'string' ? input.content.trim() : '';
  const contact = typeof input.contact === 'string' ? input.contact.trim() : '';

  if (ALLOWED_TYPES.indexOf(type) === -1) {
    return failure('INVALID_TYPE', '反馈类型无效，请重新选择');
  }
  if (!content) {
    return failure('EMPTY_CONTENT', '请输入反馈内容');
  }
  if (content.length > MAX_CONTENT_LENGTH) {
    return failure('CONTENT_TOO_LONG', '反馈内容不能超过500字');
  }
  if (contact.length > MAX_CONTACT_LENGTH) {
    return failure('CONTACT_TOO_LONG', '联系方式不能超过100字');
  }

  try {
    const recentResult = await db.collection(FEEDBACKS_COLLECTION)
      .where({ openid: openid })
      .orderBy('createdAt', 'desc')
      .limit(20)
      .get();

    const now = Date.now();
    const recentFeedbacks = recentResult.data || [];

    if (recentFeedbacks.length > 0) {
      const latestTime = getTime(recentFeedbacks[0].createdAt);
      if (latestTime && now - latestTime < MIN_SUBMIT_INTERVAL_MS) {
        return failure('TOO_FREQUENT', '提交太快了，请稍后再试');
      }
    }

    for (let i = 0; i < recentFeedbacks.length; i += 1) {
      const item = recentFeedbacks[i];
      const itemTime = getTime(item.createdAt);
      if (
        itemTime &&
        now - itemTime < DUPLICATE_INTERVAL_MS &&
        item.type === type &&
        item.content === content
      ) {
        return failure('DUPLICATE_FEEDBACK', '这条反馈刚刚已经提交过了');
      }
    }

    const addResult = await db.collection(FEEDBACKS_COLLECTION).add({
      data: {
        openid: openid,
        type: type,
        content: content,
        contact: contact,
        status: 'new',
        reply: '',
        createdAt: db.serverDate(),
        updatedAt: db.serverDate()
      }
    });

    return {
      ok: true,
      feedback: {
        id: addResult._id,
        type: type,
        content: content,
        status: 'new',
        reply: ''
      }
    };
  } catch (error) {
    console.error('submitFeedback failed:', error);
    return failure('SERVICE_UNAVAILABLE', '云服务暂时不可用，请稍后再试');
  }
};
