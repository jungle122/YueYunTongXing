const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createHandler } = require('../core');

function feedbackFunction(recent = []) {
  const writes = [];
  const query = { where() { return this; }, orderBy() { return this; }, limit() { return this; }, get: async () => ({ data: recent }), add: async ({ data }) => { writes.push(data); return { _id: 'new-id' }; } };
  const db = { collection: () => query, serverDate: () => 'server-date' };
  const sdk = { init() {}, DYNAMIC_CURRENT_ENV: 'test', database: () => db, getWXContext: () => ({ OPENID: 'actual-user' }) };
  const module = { exports: {} };
  vm.runInNewContext(fs.readFileSync(path.resolve(__dirname, '../../submitFeedback/index.js'), 'utf8'), { require: () => sdk, exports: module.exports, console, Date });
  return { handler: module.exports.main, writes };
}

test('评分必须是整数1至5，无效评分不入库', async () => {
  for (const rating of [0, 6, -1, 2.5, '5', true, {}, []]) {
    const { handler, writes } = feedbackFunction();
    assert.equal((await handler({ type: 'suggestion', content: '建议', rating })).code, 'INVALID_RATING');
    assert.equal(writes.length, 0);
  }
});

test('允许只评分或旧客户端只提交建议，身份与时间由服务端决定', async () => {
  const rated = feedbackFunction();
  assert.equal((await rated.handler({ type: 'suggestion', content: '', rating: 5, openid: 'fake-user', status: 'resolved' })).ok, true);
  assert.equal(rated.writes[0].rating, 5);
  assert.equal(rated.writes[0].openid, 'actual-user');
  assert.equal(rated.writes[0].status, 'new');
  const legacy = feedbackFunction();
  assert.equal((await legacy.handler({ type: 'suggestion', content: '建议' })).ok, true);
  assert.equal(legacy.writes[0].rating, null);
  assert.equal((await legacy.handler({ type: 'suggestion', content: '' })).code, 'EMPTY_CONTENT');
});

test('重复提交检查包含评分，不把所有纯评分混为一条', async () => {
  const recent = [{ type: 'suggestion', content: '', rating: 4, createdAt: new Date(Date.now() - 10000) }];
  assert.equal((await feedbackFunction(recent).handler({ type: 'suggestion', content: '', rating: 4 })).code, 'DUPLICATE_FEEDBACK');
  assert.equal((await feedbackFunction(recent).handler({ type: 'suggestion', content: '', rating: 5 })).ok, true);
});

function adminDatabase() {
  const operations = [];
  const query = {
    where(filters) { operations.push(['where', filters]); return this; },
    orderBy() { return this; }, skip(value) { operations.push(['skip', value]); return this; }, limit() { return this; },
    get: async () => ({ data: [{ _id: 'feedback1', openid: 'private-user', content: '建议', rating: 4, status: 'new' }] }),
    count: async () => ({ total: 1 }),
    doc: (id) => ({ get: async () => ({ data: { _id: id } }), update: async ({ data }) => { operations.push(['update', id, data]); } })
  };
  return { operations, db: { collection: () => { operations.push(['collection']); return query; }, serverDate: () => 'server-date' } };
}

test('未配置管理员名单时无账号有权读取或更新全部反馈', async () => {
  const { db, operations } = adminDatabase();
  const handler = createHandler({ db, env: {}, getOpenid: () => 'user' });
  for (const action of ['list', 'update']) assert.equal((await handler({ action, isAdmin: true })).code, 'FORBIDDEN');
  assert.equal(operations.length, 0);
});

test('不能伪造前端OpenID提权，只能获取自己的授权标识', async () => {
  const { db, operations } = adminDatabase();
  const handler = createHandler({ db, env: { FEEDBACK_ADMIN_OPENIDS: 'admin' }, getOpenid: () => 'ordinary' });
  assert.equal((await handler({ action: 'list', openid: 'admin', role: 'admin' })).code, 'FORBIDDEN');
  const identity = await handler({ action: 'identity', openid: 'admin' });
  assert.deepEqual(identity, { ok: true, isAdmin: false, ownOpenid: 'ordinary' });
  assert.equal(operations.length, 0);
});

test('每次操作重新校验名单，撤销管理员立即失去读写权限', async () => {
  const { db } = adminDatabase();
  const env = { FEEDBACK_ADMIN_OPENIDS: ' admin, other ' };
  const handler = createHandler({ db, env, getOpenid: () => 'admin' });
  assert.equal((await handler({ action: 'list' })).ok, true);
  env.FEEDBACK_ADMIN_OPENIDS = 'other';
  assert.equal((await handler({ action: 'list' })).code, 'FORBIDDEN');
});

test('管理员筛选分页返回评分，列表不泄漏用户OpenID', async () => {
  const { db, operations } = adminDatabase();
  const handler = createHandler({ db, env: { FEEDBACK_ADMIN_OPENIDS: 'admin' }, getOpenid: () => 'admin' });
  const result = await handler({ action: 'list', status: 'new', rating: 4, page: 1 });
  assert.equal(result.feedbacks[0].rating, 4);
  assert.equal(result.feedbacks[0].openid, undefined);
  assert.equal(result.total, 1);
  assert.ok(operations.some((op) => op[0] === 'skip' && op[1] === 20));
  for (const bad of [{ page: -1 }, { rating: 6 }, { status: 'hidden' }]) assert.equal((await handler({ action: 'list', ...bad })).ok, false);
});

test('管理员只能更新处理状态、回复和更新时间', async () => {
  const { db, operations } = adminDatabase();
  const handler = createHandler({ db, env: { FEEDBACK_ADMIN_OPENIDS: 'admin' }, getOpenid: () => 'admin' });
  const result = await handler({ action: 'update', id: 'feedback1', status: 'resolved', reply: ' 已记录，谢谢 ', rating: 5, openid: 'fake', content: '改写原文' });
  assert.equal(result.ok, true);
  assert.deepEqual(operations.find((op) => op[0] === 'update')[2], { status: 'resolved', reply: '已记录，谢谢', updatedAt: 'server-date' });
  assert.equal((await handler({ action: 'update', id: 'feedback1', status: 'delete', reply: '' })).ok, false);
  assert.equal((await handler({ action: 'update', id: 'feedback1', status: 'new', reply: '字'.repeat(501) })).ok, false);
});
