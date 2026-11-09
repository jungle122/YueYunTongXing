const edge = new URLSearchParams(location.search).get('edge');
if (['rules', 'cloth', 'relief'].includes(edge)) document.body.dataset.edge = edge;
const mark = {
  '未开始': '',
  '学习中': '<path d="M12 4a8 8 0 0 0 0 16Z" fill="currentColor"/>',
  '已听完': '<path d="m7.7 12 2.8 3 5.8-6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>'
};
for (const status of document.querySelectorAll('.status')) {
  const label = status.textContent;
  const row = status.closest('.song');
  row.setAttribute('aria-label', [row.getAttribute('aria-label'), label, row.querySelector('.star-icon') && '已收藏'].filter(Boolean).join('，'));
  status.title = label;
  status.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.6" fill="none"/>' + mark[label] + '</svg>';
}
document.querySelector('#completed').textContent = statuses.filter(s => s === '已听完').length + ' / 6';
document.querySelector('#completed').setAttribute('aria-label', '已听完 ' + document.querySelector('#completed').textContent + ' 首');
