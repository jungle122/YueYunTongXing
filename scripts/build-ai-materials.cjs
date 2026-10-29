const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const audio = require('../pages/audio-learning/audio-catalog');
const articles = require('../pages/text-science/article-catalog');
const catalog = {};
audio.getSongs().forEach((song) => {
  catalog['song:' + song.id] = { title: song.title, text: song.lyrics.join('\n') + '\n传唱建议：' + song.tips.join('；') };
});
articles.getArticles().forEach((article) => {
  catalog['article:' + article.id] = {
    title: article.title,
    text: [].concat(article.paragraphs, article.tips || [], article.continuedParagraphs, article.features || [], article.conclusion || []).filter(Boolean).join('\n')
  };
});
fs.writeFileSync(path.join(root, 'cloudfunctions/aiExplain/materials.json'), JSON.stringify(catalog, null, 2) + '\n');
console.log('AI material snapshot: ' + Object.keys(catalog).length + ' items');
