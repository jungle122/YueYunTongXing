const https = require('node:https');

function problem(code, message) {
  return Object.assign(new Error(message), { code });
}

function getConfig(env) {
  const provider = env.AI_PROVIDER || 'dashscope';
  const presets = {
    dashscope: { baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1', model: 'qwen-plus' },
    deepseek: { baseURL: 'https://api.deepseek.com', model: 'deepseek-flash' },
    custom: { baseURL: '', model: '' }
  };
  if (!presets[provider]) throw problem('AI_CONFIG_INVALID', 'AI 服务商配置有误');
  const baseURL = (env.AI_BASE_URL || presets[provider].baseURL).replace(/\/+$/, '');
  let url;
  try { url = new URL(baseURL + '/chat/completions'); } catch (_) {
    throw problem('AI_CONFIG_INVALID', '请配置正确的模型服务地址');
  }
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) {
    throw problem('AI_CONFIG_INVALID', '模型服务地址必须是无凭据的 HTTPS Base URL');
  }
  const model = String(env.AI_MODEL || presets[provider].model).trim();
  const apiKey = String(env.AI_API_KEY || '').trim();
  if (!apiKey || !model) throw problem('AI_NOT_CONFIGURED', 'AI 服务尚未配置，请联系管理员');
  return { provider, url, model, apiKey };
}

function buildPayload(config, messages) {
  const payload = { model: config.model, messages, stream: false, max_tokens: 700 };
  if (config.provider === 'dashscope') payload.enable_thinking = false;
  if (config.provider === 'deepseek') payload.thinking = { type: 'disabled' };
  return payload;
}

function parseResponse(status, raw) {
  if (status === 401 || status === 403) throw problem('AI_AUTH_FAILED', '模型服务鉴权失败，请管理员检查密钥、地域和模型权限');
  if (status === 429) throw problem('AI_BUSY', '模型服务繁忙或额度不足，请稍后再试');
  if (status < 200 || status >= 300) throw problem('AI_UPSTREAM_ERROR', '模型服务暂时无法回答，请稍后再试');
  let data;
  try { data = JSON.parse(raw); } catch (_) { throw problem('AI_BAD_RESPONSE', '模型服务返回格式异常，请稍后重试'); }
  const choice = data && data.choices && data.choices[0];
  const content = choice && choice.message && choice.message.content;
  if (!choice || choice.finish_reason === 'length') throw problem('AI_BAD_RESPONSE', '这次回答未能完整生成，请缩小问题后再试');
  if (typeof content !== 'string' || !content.trim() || content.length > 1800) {
    throw problem('AI_BAD_RESPONSE', '这次未能生成合适的讲解，请换个问法');
  }
  return content.trim();
}

function complete(config, messages) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(buildPayload(config, messages));
    const req = https.request(config.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + config.apiKey, 'Content-Length': Buffer.byteLength(body) }
    }, (res) => {
      const chunks = [];
      let bytes = 0;
      res.on('data', (chunk) => {
        bytes += chunk.length;
        if (bytes > 1024 * 1024) {
          res.destroy();
          req.destroy(problem('AI_BAD_RESPONSE', '模型服务返回内容过大'));
        } else chunks.push(chunk);
      });
      res.on('error', reject);
      res.on('end', () => {
        try { resolve(parseResponse(res.statusCode, Buffer.concat(chunks).toString('utf8'))); } catch (error) { reject(error); }
      });
    });
    const timer = setTimeout(() => req.destroy(problem('AI_TIMEOUT', '讲解生成超时，请稍后再试')), 18000);
    req.on('close', () => clearTimeout(timer));
    req.on('error', (error) => reject(error.code && error.code.startsWith('AI_') ? error : problem('AI_NETWORK_ERROR', '暂时无法连接模型服务，请稍后再试')));
    req.end(body);
  });
}

module.exports = { getConfig, buildPayload, parseResponse, complete, problem };
