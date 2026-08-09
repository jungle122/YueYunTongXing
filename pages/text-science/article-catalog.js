var articles = [
  {
    id: "cantonese-history",
    icon: "卷",
    themeClass: "theme-history",
    sectionName: "童谣故事",
    title: "粤语童谣的历史起源",
    subtitle: "从岭南生活里，认识一首首口耳相传的童谣",
    paragraphs: ["粤语童谣是岭南文化的重要组成部分，承载着深厚的历史文化内涵。这些童谣不仅语言优美，更蕴含着丰富的民俗文化和生活智慧。"],
    tips: "粤语童谣最早可以追溯到明清时期，是岭南地区人民在长期生活中创作的智慧结晶。",
    tipsTitle: "你知道吗？",
    continuedParagraphs: ["通过学习粤语童谣，孩子们不仅能掌握粤语发音，更能了解岭南地区的传统文化，培养对家乡文化的认同感。", "粤语童谣的传承方式多样，既有口耳相传的传统方式，也有现代的教育传播。每一首童谣都承载着特定的历史背景和文化意义，是了解岭南文化的重要窗口。"],
    readTime: 3
  },
  {
    id: "festival-rhymes",
    icon: "灯",
    iconImage: "/static/ui/text-science/节日童谣.jpg",
    themeClass: "theme-festival",
    sectionName: "节日民俗",
    title: "传统节日的粤语童谣",
    subtitle: "在节日歌声中发现岭南习俗与生活记忆",
    paragraphs: ["在岭南地区，许多传统节日都有对应的粤语童谣。这些童谣不仅记录了节日的习俗，更传承了深厚的文化内涵。"],
    tips: "春节有“新年好”、中秋节有“月光光”，每个节日都有独特的童谣表达方式。",
    tipsTitle: "节日童谣特色",
    continuedParagraphs: ["传统节日的童谣让孩子在歌唱中感受节日的意义，增强文化认同感。这些童谣往往与节日的食物、活动和传统习俗紧密相关，是文化传承的重要载体。"],
    readTime: 2
  },
  {
    id: "language-features",
    icon: "声",
    iconImage: "/static/ui/text-science/语言特色.jpg",
    themeClass: "theme-language",
    sectionName: "语言奥秘",
    title: "粤语童谣的语言特色",
    subtitle: "听四言六言的节奏，感受粤语声调的音乐性",
    paragraphs: ["押韵让语言更具可记性与节奏感，是童谣传播的关键。粤语童谣在押韵方面有着独特的特点，通常采用四言或六言的形式，朗朗上口。", "拍手、跺脚等肢体节奏，帮助小朋友在律动中感知语音规律。这种互动式的学习方式，让孩子在游戏中掌握语言。"],
    features: "粤语童谣常使用儿化音和特殊的声调变化，形成独特的音乐性。例如，“小星星”中的押韵和节奏，让童谣易于记忆和传唱。",
    featuresTitle: "语言特色",
    conclusion: "语音学角度看，韵母对押韵最为关键，调值变化增加表现力。粤语的九声调系为童谣提供了丰富的音韵变化，这是普通话所不具备的优势。",
    readTime: 4
  },
  {
    id: "modern-development",
    icon: "新",
    iconImage: "/static/ui/text-science/现代发展.jpg",
    themeClass: "theme-modern",
    sectionName: "今日传承",
    title: "现代粤语童谣的发展",
    subtitle: "传统童谣如何走进今天的课堂与数字生活",
    paragraphs: ["随着时代的发展，粤语童谣也在不断演变。现代教育工作者和艺术家们将传统童谣与现代元素相结合，创造出新的表现形式。", "数字化记录与教学应用，拓展了童谣在现代教育中的价值。通过音频、视频和互动应用，童谣的学习变得更加生动有趣。"],
    features: "许多现代粤语童谣融入了教育内容，如数字、颜色、动物等，在保持传统韵味的同时，增加了教育功能。",
    featuresTitle: "现代特色",
    conclusion: "在亲子互动中，童谣是代际文化传承的重要载体。通过现代化的传播方式，粤语童谣得以在新时代继续传承和发展。",
    readTime: 3
  }
];

function cloneArticle(article) {
  return Object.assign({}, article, {
    paragraphs: (article.paragraphs || []).slice(),
    continuedParagraphs: (article.continuedParagraphs || []).slice()
  });
}

function getArticles() {
  return articles.map(cloneArticle);
}

function getArticleById(id) {
  var article = articles.find(function(item) { return item.id === id; });
  return article ? cloneArticle(article) : null;
}

module.exports = {
  getArticles: getArticles,
  getArticleById: getArticleById
};
