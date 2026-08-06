Page({
  data: {
    favorites: []
  },
  onLoad() { this.loadFavorites(); },
  onShow() { this.loadFavorites(); },
  goBack() {
    var pages = getCurrentPages();
    if (pages && pages.length > 1) { wx.navigateBack(); }
    else { wx.switchTab({ url: "/pages/profile/profile" }); }
  },
  loadFavorites() {
    var favorites = [];
    var self = this;
    try {
      var audioLikes = wx.getStorageSync("audio_likes") || {};
      Object.keys(audioLikes).forEach(function(songId) {
        if (audioLikes[songId] === true) {
          var numId = songId.replace("song", "");
          var audioData = self.getAudioDataById(parseInt(numId) || songId);
          if (audioData) {
            favorites.push({
              id: songId, title: audioData.title, type: "audio",
              icon: self.getItemIcon("audio"), typeName: self.getItemTypeName("audio"),
              dateStr: self.formatDate(new Date().toISOString()),
              favorited_at: new Date().toISOString()
            });
          }
        }
      });
    } catch (e) { console.error("读取音频收藏失败:", e); }
    try {
      var videoFavorites = wx.getStorageSync("video_favorites") || {};
      Object.keys(videoFavorites).forEach(function(videoId) {
        if (videoFavorites[videoId] === true) {
          var videoData = self.getVideoDataById(videoId);
          if (videoData) {
            favorites.push({
              id: videoId, title: videoData.title, type: "video",
              icon: self.getItemIcon("video"), typeName: self.getItemTypeName("video"),
              dateStr: self.formatDate(new Date().toISOString()),
              favorited_at: new Date().toISOString()
            });
          }
        }
      });
    } catch (e) { console.error("读取视频收藏失败:", e); }
    try {
      var textCollections = wx.getStorageSync("text_science_collections") || {};
      Object.keys(textCollections).forEach(function(articleId) {
        if (textCollections[articleId] === true) {
          favorites.push({
            id: articleId, title: self.getArticleTitleById(articleId), type: "article",
            icon: self.getItemIcon("article"), typeName: self.getItemTypeName("article"),
            dateStr: self.formatDate(new Date().toISOString()),
            favorited_at: new Date().toISOString()
          });
        }
      });
    } catch (e) { console.error("读取文章收藏失败:", e); }
    favorites.sort(function(a, b) { return new Date(b.favorited_at) - new Date(a.favorited_at); });
    this.setData({ favorites: favorites });
  },
  getArticleTitleById(id) {
    var map = { "cantonese-history": "粤语童谣的历史起源", "festival-rhymes": "传统节日的粤语童谣", "language-features": "粤语童谣的语言特色", "modern-development": "现代粤语童谣的发展" };
    return map[id] || "未知文章";
  },
  getAudioDataById(id) {
    var numId = typeof id === "string" ? parseInt(id.replace("song", "")) : id;
    var list = [
      { id: 1, title: "小星星" }, { id: 2, title: "三只小猪" }, { id: 3, title: "小小姑娘" },
      { id: 4, title: "小鸭学游泳" }, { id: 5, title: "花 树 草" }, { id: 6, title: "河边有只羊" },
      { id: 18, title: "月光光" }, { id: 19, title: "落雨大" }, { id: 20, title: "氹氹转" },
      { id: 21, title: "何家公鸡何家猜" }, { id: 22, title: "洗白白" }
    ];
    for (var i = 0; i < list.length; i++) { if (list[i].id === numId) return list[i]; }
    return null;
  },
  getVideoDataById(id) {
    var list = [
      { id: "video1", title: "《氹氹转》" }, { id: "video2", title: "《齐齐望过去》" },
      { id: "video3", title: "《月光光》" }, { id: "video4", title: "小猪佩奇洗白白大作战！" },
      { id: "video5", title: "喜羊羊带你齐齐望过去！" }, { id: "video6", title: "火鸡总动员之何家公鸡魔性对决" },
      { id: "video7", title: "海绵宝宝带你扒龙船！" }, { id: "video8", title: "《走进小马宝莉的细小世界》" },
      { id: "video9", title: "当哪吒遇见氹氹转" }, { id: "video10", title: "《当葫芦娃唱起月光光》" }
    ];
    for (var i = 0; i < list.length; i++) { if (list[i].id === id) return list[i]; }
    return null;
  },
  getItemIcon(type) { return { audio: "🎵", video: "🎬", article: "📖" }[type] || "📄"; },
  getItemTypeName(type) { return { audio: "音频", video: "视频", article: "文章" }[type] || "未知"; },
  formatDate(dateString) {
    var date = new Date(dateString);
    var today = new Date();
    var yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return "今天";
    if (date.toDateString() === yesterday.toDateString()) return "昨天";
    return date.toLocaleDateString("zh-CN");
  }
});
