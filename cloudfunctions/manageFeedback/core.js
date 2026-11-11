const STATUSES = ['new', 'processing', 'resolved'];

function createHandler({ db, getOpenid, env }) {
  return async function(event = {}) {
    const openid = getOpenid();
    if (!openid) return { ok: false, message: '无法确认微信身份，请重新打开小程序' };
    const admins = String(env.FEEDBACK_ADMIN_OPENIDS || '').split(',').map((s) => s.trim()).filter(Boolean);
    const isAdmin = admins.includes(openid);
    if (event.action === 'identity') return { ok: true, isAdmin, ownOpenid: openid };
    if (!isAdmin) return { ok: false, code: 'FORBIDDEN', message: '当前微信账号没有反馈管理权限' };
    try {
      if (event.action === 'list') {
        const page = event.page === undefined ? 0 : event.page;
        const status = event.status || '';
        const rating = event.rating === undefined ? 0 : event.rating;
        if (!Number.isInteger(page) || page < 0 || page > 500 || (status && !STATUSES.includes(status)) || !Number.isInteger(rating) || rating < 0 || rating > 5) {
          return { ok: false, message: '筛选条件无效' };
        }
        const filters = {};
        if (status) filters.status = status;
        if (rating) filters.rating = rating;
        const query = db.collection('feedbacks').where(filters);
        const result = await query.orderBy('createdAt', 'desc').skip(page * 20).limit(20).get();
        const count = await db.collection('feedbacks').where(filters).count();
        return {
          ok: true, total: count.total, page,
          feedbacks: (result.data || []).map((item) => ({
            id: item._id, type: item.type, content: item.content || '',
            rating: Number.isInteger(item.rating) && item.rating >= 1 && item.rating <= 5 ? item.rating : null,
            contact: item.contact || '', status: item.status || 'new', reply: item.reply || '', createdAt: item.createdAt
          }))
        };
      }
      if (event.action === 'update') {
        if (typeof event.id !== 'string' || !/^[a-zA-Z0-9_-]{1,128}$/.test(event.id) || !STATUSES.includes(event.status) || typeof event.reply !== 'string' || event.reply.trim().length > 500) {
          return { ok: false, message: '请选择处理状态，回复不能超过500字' };
        }
        const ref = db.collection('feedbacks').doc(event.id);
        const existing = await ref.get();
        if (!existing.data) return { ok: false, message: '该反馈已不存在，请刷新列表' };
        await ref.update({ data: { status: event.status, reply: event.reply.trim(), updatedAt: db.serverDate() } });
        return { ok: true };
      }
      return { ok: false, message: '不支持的操作' };
    } catch (_) {
      return { ok: false, message: '反馈管理服务暂不可用，请检查云函数部署、集合权限和查询索引' };
    }
  };
}

module.exports = { createHandler };
