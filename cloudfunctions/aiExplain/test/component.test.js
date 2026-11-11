const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function createComponent(callAI) {
  let definition;
  const file = path.resolve(__dirname, '../../../components/ai-explainer/ai-explainer.js');
  vm.runInNewContext(fs.readFileSync(file, 'utf8'), {
    require: () => ({ callAI }), Component: (value) => { definition = value; }
  });
  const instance = {
    data: { ...definition.data, contentType: 'song', contentId: 'song18' },
    setData: function(values) { Object.assign(this.data, values); }
  };
  Object.assign(instance, definition.methods);
  definition.lifetimes.attached.call(instance);
  return { instance, definition };
}

test('用户未确认处理说明时不发请求，重复点击只请求一次', async () => {
  let calls = 0;
  let finish;
  const { instance } = createComponent(() => { calls++; return new Promise((resolve) => { finish = resolve; }); });
  instance.data.question = '这句是什么意思？';
  await instance.ask();
  assert.equal(calls, 0);
  instance.data.consent = true;
  const pending = instance.ask();
  await instance.ask();
  assert.equal(calls, 1);
  finish({ answer: '解释', source: { title: '月光光' } });
  await pending;
  assert.equal(instance.data.answer, '解释');
  assert.equal(instance.data.busy, false);
});

test('切换内容后旧请求不能把结果写入新内容', async () => {
  let finish;
  const { instance, definition } = createComponent(() => new Promise((resolve) => { finish = resolve; }));
  Object.assign(instance.data, { question: '这句是什么意思？', consent: true });
  const pending = instance.ask();
  instance.data.contentId = 'song19';
  definition.observers['contentType, contentId'].call(instance);
  finish({ answer: '旧歌解释', source: { title: '月光光' } });
  await pending;
  assert.equal(instance.data.answer, '');
  assert.equal(instance.data.consent, false);
  assert.equal(instance.data.busy, false);
});

test('退出页面后请求失败不会更新已销毁组件', async () => {
  let fail;
  const { instance, definition } = createComponent(() => new Promise((_, reject) => { fail = reject; }));
  Object.assign(instance.data, { question: '这句是什么意思？', consent: true });
  const pending = instance.ask();
  definition.lifetimes.detached.call(instance);
  let updates = 0;
  instance.setData = () => { updates++; };
  fail(new Error('请求失败'));
  await pending;
  assert.equal(updates, 0);
});
