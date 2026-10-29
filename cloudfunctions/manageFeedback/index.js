const cloud = require('wx-server-sdk');
const { createHandler } = require('./core');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
exports.main = createHandler({ db: cloud.database(), getOpenid: () => cloud.getWXContext().OPENID, env: process.env });
