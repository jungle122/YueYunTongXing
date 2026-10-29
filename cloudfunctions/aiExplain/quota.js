const { createHash } = require('node:crypto');
const { problem } = require('./provider');

async function ensureCounter(db, id) {
  try {
    await db.collection('aiUsage').add({ data: { _id: id, count: 0, lastRequestAt: 0 } });
  } catch (_) {
    // 重复主键不覆盖已有计数；读取也失败时拒绝调用模型。
    const existing = await db.collection('aiUsage').doc(id).get();
    if (!existing.data || !Number.isInteger(existing.data.count)) throw problem('AI_QUOTA_UNAVAILABLE', '讲解次数服务暂时不可用');
  }
}

async function reserveQuota(db, openid, now = Date.now()) {
  const day = new Date(now + 8 * 3600000).toISOString().slice(0, 10);
  const userId = day + '-' + createHash('sha256').update(openid).digest('hex');
  const globalId = day + '-all';
  await ensureCounter(db, userId);
  await ensureCounter(db, globalId);
  await db.runTransaction(async (transaction) => {
    const userRef = transaction.collection('aiUsage').doc(userId);
    const globalRef = transaction.collection('aiUsage').doc(globalId);
    const user = (await userRef.get()).data;
    const total = (await globalRef.get()).data;
    if (!user || !total || !Number.isInteger(user.count) || !Number.isInteger(total.count)) throw problem('AI_QUOTA_UNAVAILABLE', '讲解次数服务暂时不可用');
    if (user.count >= 20 || total.count >= 200) throw problem('DAILY_LIMIT', '今天的 AI 讲解次数已用完，明天再来吧');
    if (user.lastRequestAt && now - user.lastRequestAt < 10000) throw problem('RATE_LIMIT', '请稍等几秒，再问一个问题');
    await userRef.update({ data: { count: user.count + 1, lastRequestAt: now } });
    await globalRef.update({ data: { count: total.count + 1, lastRequestAt: now } });
  });
}

module.exports = { reserveQuota };
