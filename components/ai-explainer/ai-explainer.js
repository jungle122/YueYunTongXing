var ai = require('../../utils/ai');

Component({
  properties: {
    contentType: { type: String, value: '' },
    contentId: { type: String, value: '' }
  },
  data: { expanded: false, question: '', answer: '', sourceTitle: '', error: '', busy: false, consent: false },
  observers: {
    'contentType, contentId': function() {
      this._requestId = (this._requestId || 0) + 1;
      this.setData({ expanded: false, question: '', answer: '', sourceTitle: '', error: '', busy: false, consent: false });
    }
  },
  lifetimes: {
    attached: function() { this._alive = true; },
    detached: function() { this._alive = false; this._requestId = (this._requestId || 0) + 1; }
  },
  methods: {
    toggle: function() { this.setData({ expanded: !this.data.expanded }); },
    inputQuestion: function(event) { this.setData({ question: event.detail.value }); },
    changeConsent: function(event) { this.setData({ consent: event.detail.value.indexOf('agree') !== -1 }); },
    chooseQuestion: function(event) { if (!this.data.busy) this.setData({ question: event.currentTarget.dataset.question }); },
    ask: async function() {
      var question = this.data.question.trim();
      if (this.data.busy) return;
      if (!this.data.consent) { this.setData({ error: '请先确认问题处理说明' }); return; }
      if (!question || question.length > 200) { this.setData({ error: '请输入1至200字的问题' }); return; }
      var id = this._requestId = (this._requestId || 0) + 1;
      this.setData({ busy: true, error: '', answer: '', sourceTitle: '' });
      try {
        var result = await ai.callAI({ action: 'explain', contentType: this.data.contentType, contentId: this.data.contentId, question: question });
        if (!this._alive || id !== this._requestId) return;
        this.setData({ answer: result.answer, sourceTitle: result.source.title });
      } catch (error) {
        if (this._alive && id === this._requestId) this.setData({ error: error.message || '暂时无法生成讲解，请稍后再试' });
      } finally {
        if (this._alive && id === this._requestId) this.setData({ busy: false });
      }
    }
  }
});
