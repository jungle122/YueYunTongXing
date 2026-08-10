const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const POSTS_COLLECTION = 'communityPosts';

function failure(code, message) {
  return { ok: false, code: code, message: message };
}

exports.main = async function(event) {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  if (!openid) return failure('IDENTITY_UNAVAILABLE', '暂时无法确认微信身份，请稍后再试');

  const postId = event && typeof event.postId === 'string' ? event.postId.trim() : '';
  if (!postId || postId.length > 100) return failure('INVALID_POST_ID', '分享记录无效');

  try {
    const result = await db.collection(POSTS_COLLECTION).doc(postId).get();
    const post = result.data;
    if (!post || post.openid !== openid) {
      return failure('NOT_ALLOWED', '只能删除自己发布的内容');
    }
    if (post.status === 'deleted') return { ok: true };

    await db.collection(POSTS_COLLECTION).doc(postId).update({
      data: {
        status: 'deleted',
        updatedAt: db.serverDate()
      }
    });
    return { ok: true };
  } catch (error) {
    console.error('deleteMyCommunityPost failed:', error);
    return failure('SERVICE_UNAVAILABLE', '删除失败，请稍后再试');
  }
};
