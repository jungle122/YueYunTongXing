function callAI(data) {
  if (!wx.cloud || !wx.cloud.callFunction) return Promise.reject(new Error('当前版本暂不支持 AI 讲解'));
  let timer;
  return Promise.race([
    wx.cloud.callFunction({ name: 'aiExplain', data: data }),
    new Promise(function(_, reject) { timer = setTimeout(function() { reject(new Error('等待讲解超时，请稍后再试')); }, 45000); })
  ]).then(function(response) {
    var result = response && response.result;
    if (!result || !result.ok) throw new Error(result && result.message ? result.message : '讲解服务暂时不可用');
    return result;
  }).catch(function(error) {
    if (error && error.errMsg) throw new Error('AI 讲解暂不可用，请联系管理员检查云函数是否已部署');
    throw error;
  }).finally(function() { clearTimeout(timer); });
}

module.exports = { callAI: callAI };
