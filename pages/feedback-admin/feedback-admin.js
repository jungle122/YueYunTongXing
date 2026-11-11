const STATUS_OPTIONS = [{ value: '', label: '全部状态' }, { value: 'new', label: '待处理' }, { value: 'processing', label: '处理中' }, { value: 'resolved', label: '已解决' }];
const TYPE_LABELS = { suggestion: '建议', bug: '问题', praise: '表扬', other: '其他' };

Page({
  data: { checked: false, isAdmin: false, ownOpenid: '', error: '', loading: false, saving: false, rows: [], total: 0, page: 0, statusIndex: 0, ratingIndex: 0, statusOptions: STATUS_OPTIONS, ratingOptions: ['全部评分', '1星', '2星', '3星', '4星', '5星'], editStatuses: STATUS_OPTIONS.slice(1), selected: null, editStatusIndex: 0, reply: '' },
  onLoad: function() { this._alive = true; this.checkAccess(); },
  onUnload: function() { this._alive = false; this._requestId = (this._requestId || 0) + 1; },
  call: async function(data) {
    if (!wx.cloud) throw new Error('当前版本不支持云服务');
    const response = await wx.cloud.callFunction({ name: 'manageFeedback', data });
    const result = response && response.result;
    if (!result || !result.ok) throw new Error(result && result.message ? result.message : '反馈管理服务暂不可用');
    return result;
  },
  checkAccess: async function() {
    this.setData({ error: '', loading: true });
    try {
      const result = await this.call({ action: 'identity' });
      if (!this._alive) return;
      this.setData({ checked: true, isAdmin: result.isAdmin, ownOpenid: result.ownOpenid });
      if (result.isAdmin) await this.loadRows(0);
    } catch (_) {
      if (this._alive) this.setData({ error: '暂时无法检查权限，请确认 manageFeedback 云函数已部署' });
    } finally { if (this._alive) this.setData({ loading: false }); }
  },
  copyIdentity: function() { if (this.data.ownOpenid) wx.setClipboardData({ data: this.data.ownOpenid }); },
  changeStatus: function(e) { if (this.data.loading) return; this.setData({ statusIndex: Number(e.detail.value) }); this.loadRows(0); },
  changeRating: function(e) { if (this.data.loading) return; this.setData({ ratingIndex: Number(e.detail.value) }); this.loadRows(0); },
  loadRows: async function(page) {
    const requestId = this._requestId = (this._requestId || 0) + 1;
    this.setData({ loading: true, error: '', selected: null });
    try {
      const result = await this.call({ action: 'list', page, status: STATUS_OPTIONS[this.data.statusIndex].value, rating: this.data.ratingIndex });
      if (!this._alive || requestId !== this._requestId) return;
      this.setData({ rows: result.feedbacks.map((item) => ({ ...item, typeLabel: TYPE_LABELS[item.type] || '其他', timeText: this.formatTime(item.createdAt), statusText: (STATUS_OPTIONS.find((s) => s.value === item.status) || { label: '状态异常' }).label })), total: result.total, page });
    } catch (error) {
      if (this._alive && requestId === this._requestId) this.setData({ error: error.message, rows: [] });
    } finally { if (this._alive && requestId === this._requestId) this.setData({ loading: false }); }
  },
  refresh: function() { if (!this.data.loading && !this.data.saving) this.loadRows(0); },
  previous: function() { if (!this.data.loading && this.data.page > 0) this.loadRows(this.data.page - 1); },
  next: function() { if (!this.data.loading && (this.data.page + 1) * 20 < this.data.total) this.loadRows(this.data.page + 1); },
  selectRow: function(e) {
    if (this.data.saving) return;
    const item = this.data.rows[Number(e.currentTarget.dataset.index)];
    if (item) this.setData({ selected: item, reply: item.reply, editStatusIndex: Math.max(0, this.data.editStatuses.findIndex((s) => s.value === item.status)) }, function() {
      wx.pageScrollTo({ selector: '#feedback-editor', duration: 200 });
    });
  },
  editStatus: function(e) { this.setData({ editStatusIndex: Number(e.detail.value) }); },
  editReply: function(e) { this.setData({ reply: e.detail.value }); },
  cancel: function() { if (!this.data.saving) this.setData({ selected: null }); },
  save: async function() {
    if (this.data.saving || !this.data.selected) return;
    this.setData({ saving: true, error: '' });
    try {
      await this.call({ action: 'update', id: this.data.selected.id, status: this.data.editStatuses[this.data.editStatusIndex].value, reply: this.data.reply });
      if (!this._alive) return;
      wx.showToast({ title: '已保存', icon: 'success' });
      await this.loadRows(this.data.page);
    } catch (error) { if (this._alive) this.setData({ error: error.message }); }
    finally { if (this._alive) this.setData({ saving: false }); }
  },
  formatTime: function(value) {
    const date = new Date(value && value.$date ? value.$date : value);
    if (isNaN(date.getTime())) return '时间未知';
    const pad = (n) => String(n).padStart(2, '0');
    return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()) + ' ' + pad(date.getHours()) + ':' + pad(date.getMinutes());
  }
});
