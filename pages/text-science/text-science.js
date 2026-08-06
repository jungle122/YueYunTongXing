Page({
  data: {
    articles: [],
    displayArticles: [],
    showModal: false,
    currentArticle: {},
    collections: {},
    readProgress: {},
    scrollTop: 0,
    showToast: false,
    toastText: "",
    toastIcon: ""
  },
  onLoad() {
    var collections = wx.getStorageSync("text_science_collections") || {};
    var read = wx.getStorageSync("text_science_read_progress") || {};
    this.setData({ collections: collections, readProgress: read });
    this.initArticles();
  },
  initArticles() {
    var articles = [
      { id: "cantonese-history", icon: "📖", title: "粤语童谣的历史起源", subtitle: "了解粤语童谣的文化背景", paragraphs: ["粤语童谣是岭南文化的重要组成部分，承载着深厚的历史文化内涵。这些童谣不仅语言优美，更蕴含着丰富的民俗文化和生活智慧。"], tips: "粤语童谣最早可以追溯到明清时期，是岭南地区人民在长期生活中创作的智慧结晶。", tipsTitle: "你知道吗？", continuedParagraphs: ["通过学习粤语童谣，孩子们不仅能掌握粤语发音，更能了解岭南地区的传统文化，培养对家乡文化的认同感。","粤语童谣的传承方式多样，既有口耳相传的传统方式，也有现代的教育传播。每一首童谣都承载着特定的历史背景和文化意义，是了解岭南文化的重要窗口。"], readTime: 3 },
      { id: "festival-rhymes", icon: "🏮", title: "传统节日的粤语童谣", subtitle: "探索节日与童谣的深厚联系", paragraphs: ["在岭南地区，许多传统节日都有对应的粤语童谣。这些童谣不仅记录了节日的习俗，更传承了深厚的文化内涵。"], tips: "春节有\"新年好\"、中秋节有\"月光光\"，每个节日都有独特的童谣表达方式。", tipsTitle: "节日童谣特色", continuedParagraphs: ["传统节日的童谣让孩子在歌唱中感受节日的意义，增强文化认同感。这些童谣往往与节日的食物、活动和传统习俗紧密相关，是文化传承的重要载体。"], readTime: 2 },
      { id: "language-features", icon: "💬", title: "粤语童谣的语言特色", subtitle: "四言六言与儿化尾音的音乐性", paragraphs: ["押韵让语言更具可记性与节奏感，是童谣传播的关键。粤语童谣在押韵方面有着独特的特点，通常采用四言或六言的形式，朗朗上口。","拍手、跺脚等肢体节奏，帮助小朋友在律动中感知语音规律。这种互动式的学习方式，让孩子在游戏中掌握语言。"], features: "粤语童谣常使用儿化音和特殊的声调变化，形成独特的音乐性。例如，\"小星星\"中的押韵和节奏，让童谣易于记忆和传唱。", featuresTitle: "语言特色", conclusion: "语音学角度看，韵母对押韵最为关键，调值变化增加表现力。粤语的九声调系为童谣提供了丰富的音韵变化，这是普通话所不具备的优势。", readTime: 4 },
      { id: "modern-development", icon: "🚀", title: "现代粤语童谣的发展", subtitle: "数字化时代下的传承与创新", paragraphs: ["随着时代的发展，粤语童谣也在不断演变。现代教育工作者和艺术家们将传统童谣与现代元素相结合，创造出新的表现形式。","数字化记录与教学应用，拓展了童谣在现代教育中的价值。通过音频、视频和互动应用，童谣的学习变得更加生动有趣。"], features: "许多现代粤语童谣融入了教育内容，如数字、颜色、动物等，在保持传统韵味的同时，增加了教育功能。", featuresTitle: "现代特色", conclusion: "在亲子互动中，童谣是代际文化传承的重要载体。通过现代化的传播方式，粤语童谣得以在新时代继续传承和发展。", readTime: 3 }
    ];
    this.setData({ articles: articles });
    this.refreshDisplayArticles();
  },
  refreshDisplayArticles() {
    var self = this;
    var displayArticles = self.data.articles.map(function(article) {
      var a = JSON.parse(JSON.stringify(article));
      a.iconClass = "icon-" + a.id;
      a.isCollected = !!self.data.collections[a.id];
      a.collectText = a.isCollected ? "💖" : "❤️";
      a.progressWidth = "width:" + (self.data.readProgress[a.id] || 0) + "%";
      a.progressPercent = self.data.readProgress[a.id] || 0;
      return a;
    });
    this.setData({ displayArticles: displayArticles });
  },
  goBack() {
    wx.navigateBack({ fail: function() { wx.reLaunch({ url: "/pages/learn/learn" }); } });
  },
  openArticle(e) {
    var article = e.currentTarget.dataset.article;
    this.setData({ currentArticle: article, showModal: true, scrollTop: 0 });
    if (!this.data.readProgress[article.id]) {
      var key = "readProgress." + article.id;
      this.setData({ [key]: 10 });
      this.persistRead();
    }
    this.recordLearningHistory("article", article.title, article.id);
  },
  closeModal() { this.setData({ showModal: false }); },
  toggleCollect(e) {
    var article = e.currentTarget.dataset.article;
    var prev = !!this.data.collections[article.id];
    var key = "collections." + article.id;
    this.setData({ [key]: !prev });
    wx.setStorageSync("text_science_collections", this.data.collections);
    this.setData({ toastText: !prev ? "收藏成功" : "取消收藏", toastIcon: !prev ? "💖" : "❤️", showToast: true });
    this.refreshDisplayArticles();
    var self = this;
    setTimeout(function() { self.setData({ showToast: false }); }, 1500);
  },
  toggleCollectCurrent() {
    var article = this.data.currentArticle;
    var prev = !!this.data.collections[article.id];
    var key = "collections." + article.id;
    this.setData({ [key]: !prev });
    wx.setStorageSync("text_science_collections", this.data.collections);
    this.refreshDisplayArticles();
  },
  getCollectButtonText() {
    return this.data.collections[this.data.currentArticle.id] ? "💖 已收藏" : "❤️ 收藏";
  },
  isCurrentCollected() { return !!this.data.collections[this.data.currentArticle.id]; },
  onScroll(e) {
    if (!this.data.currentArticle || !this.data.currentArticle.id) return;
    var id = this.data.currentArticle.id;
    var scrollTop = e.detail.scrollTop || 0;
    var scrollHeight = e.detail.scrollHeight || 1;
    var clientHeight = e.detail.clientHeight || 1;
    var scrolled = scrollTop + clientHeight;
    var progress = Math.min(100, Math.max(10, Math.floor(scrolled / scrollHeight * 100)));
    if (progress !== this.data.readProgress[id]) {
      var key = "readProgress." + id;
      this.setData({ [key]: progress });
      this.persistRead();
      this.refreshDisplayArticles();
      this.updateLearningHistoryDuration("article", id, progress);
    }
  },
  updateLearningHistoryDuration(type, itemId, progress) {
    try {
      var historyStr = wx.getStorageSync("learningHistory") || "[]";
      var history = JSON.parse(historyStr);
      for (var i = history.length - 1; i >= 0; i--) {
        if (history[i].itemId === itemId && history[i].type === type) { history[i].duration = Math.floor(progress / 10) * 60; break; }
      }
      wx.setStorageSync("learningHistory", JSON.stringify(history));
    } catch (e) { console.error("更新学习历史时长失败:", e); }
  },
  persistRead() { wx.setStorageSync("text_science_read_progress", this.data.readProgress); },
  recordLearningHistory(type, title, itemId) {
    try {
      var historyStr = wx.getStorageSync("learningHistory") || "[]";
      var history = JSON.parse(historyStr);
      var today = new Date().toDateString();
      var existingIndex = -1;
      for (var i = 0; i < history.length; i++) {
        if (history[i].itemId === itemId && history[i].type === type && new Date(history[i].timestamp).toDateString() === today) { existingIndex = i; break; }
      }
      if (existingIndex >= 0) {
        history[existingIndex].timestamp = new Date().toISOString();
        history[existingIndex].duration = Math.floor((this.data.readProgress[itemId] || 0) / 10) * 60;
      } else {
        history.push({ type: type, title: title, itemId: itemId, timestamp: new Date().toISOString(), duration: Math.floor((this.data.readProgress[itemId] || 0) / 10) * 60 });
      }
      if (history.length > 100) { history.splice(0, history.length - 100); }
      wx.setStorageSync("learningHistory", JSON.stringify(history));
    } catch (e) { console.error("记录学习历史失败:", e); }
  }
});
