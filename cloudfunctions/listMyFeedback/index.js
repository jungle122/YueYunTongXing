const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const FEEDBACKS_COLLECTION = 'feedbacks';
const MAX_RESULT_COUNT = 100;

function failure(code, message) {
  return { ok: false, code: code, message: message };
}

exports.main = async function() {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  if (!openid) {
    return failure('IDENTITY_UNAVAILABLE', '暂时无法确认微信身份，请稍后再试');
  }

  try {
    const result = await db.collection(FEEDBACKS_COLLECTION)
      .where({ openid: openid })
      .orderBy('createdAt', 'desc')
      .limit(MAX_RESULT_COUNT)
      .get();

    const feedbacks = (result.data || []).map(function(item) {
      return {
        id: item._id,
        type: item.type,
        content: item.content,
        status: item.status,
        reply: item.reply || '',
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      };
    });

    return { ok: true, feedbacks: feedbacks };
  } catch (error) {
    console.error('listMyFeedback failed:', error);
    return failure('SERVICE_UNAVAILABLE', '云服务暂时不可用，请稍后再试');
  }
};
