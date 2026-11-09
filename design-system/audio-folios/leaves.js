const tabs = Array.from(document.querySelectorAll('.tabs button'));
const lessons = Array.from(document.querySelectorAll('.song'));
function openLeaf(index) {
  tabs.forEach((tab, i) => tab.setAttribute('aria-pressed', String(i === index)));
  lessons.forEach((lesson, i) => lesson.hidden = Math.floor(i / 2) !== index);
}
lessons.forEach((lesson, i) => {
  const verse = document.createElement('span');
  verse.className = 'verse';
  verse.textContent = lines[i];
  lesson.append(verse);
});
tabs.forEach((tab, i) => tab.onclick = () => openLeaf(i));
openLeaf(0);
