var STICKER_AVATARS = [
  { id: 'sticker-01', name: '贴纸1', src: '/static/avatars/sticker-01.jpg' },
  { id: 'sticker-02', name: '贴纸2', src: '/static/avatars/sticker-02.jpg' },
  { id: 'sticker-03', name: '贴纸3', src: '/static/avatars/sticker-03.jpg' },
  { id: 'sticker-04', name: '贴纸4', src: '/static/avatars/sticker-04.jpg' },
  { id: 'sticker-05', name: '贴纸5', src: '/static/avatars/sticker-05.jpg' },
  { id: 'sticker-06', name: '贴纸6', src: '/static/avatars/sticker-06.jpg' },
  { id: 'sticker-07', name: '贴纸7', src: '/static/avatars/sticker-07.jpg' }
];

function findStickerIndex(src) {
  for (var i = 0; i < STICKER_AVATARS.length; i++) {
    if (STICKER_AVATARS[i].src === src) return i;
  }
  return -1;
}

module.exports = {
  STICKER_AVATARS: STICKER_AVATARS,
  findStickerIndex: findStickerIndex
};
