const cloud = require('wx-server-sdk');
const { createHandler } = require('./core');
const { complete, problem } = require('./provider');
const { reserveQuota } = require('./quota');
const catalog = require('./materials.json');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

async function isSafe(content, openid) {
  let timer;
  try {
    const result = await Promise.race([
      cloud.openapi.security.msgSecCheck({ content, version: 2, scene: 2, openid }),
      new Promise((_, reject) => { timer = setTimeout(() => reject(problem('AI_SAFETY_UNAVAILABLE', '内容检查暂时不可用，请稍后再试')), 5000); })
    ]);
    return !!(result && result.result && result.result.suggest === 'pass');
  } catch (_) {
    throw problem('AI_SAFETY_UNAVAILABLE', '内容检查暂时不可用，请稍后再试');
  } finally { clearTimeout(timer); }
}

exports.main = createHandler({
  env: process.env, catalog,
  getOpenid: () => cloud.getWXContext().OPENID,
  isSafe, complete,
  reserveQuota: (openid) => reserveQuota(db, openid)
});
