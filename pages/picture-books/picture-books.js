Page({
  data: {
    books: [
      { id: "dangdang", title: "氹氹转", pages: ["https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/picture-books/dangdang/dangdang/page1.jpg","https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/picture-books/dangdang/dangdang/page2.jpg","https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/picture-books/dangdang/dangdang/page3.jpg","https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/picture-books/dangdang/dangdang/page4.jpg","https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/picture-books/dangdang/dangdang/page5.jpg","https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/picture-books/dangdang/dangdang/page6.jpg","https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/picture-books/dangdang/dangdang/page7.jpg","https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/picture-books/dangdang/dangdang/page8.jpg","https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/picture-books/dangdang/dangdang/page9.jpg","https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/picture-books/dangdang/dangdang/page10.jpg","https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/picture-books/dangdang/dangdang/page11.jpg"] },
      { id: "qiqi", title: "齐齐望过去", pages: ["https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/picture-books/qiqi/qiqi/page1.jpg","https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/picture-books/qiqi/qiqi/page2.jpg","https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/picture-books/qiqi/qiqi/page3.jpg","https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/picture-books/qiqi/qiqi/page4.jpg","https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/picture-books/qiqi/qiqi/page5.jpg","https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/picture-books/qiqi/qiqi/page6.jpg","https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/picture-books/qiqi/qiqi/page7.jpg"] },
      { id: "yueguang", title: "月光光", pages: ["https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/picture-books/yueguang/yueguang/page1.jpg","https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/picture-books/yueguang/yueguang/page2.jpg","https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/picture-books/yueguang/yueguang/page3.jpg","https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/picture-books/yueguang/yueguang/page4.jpg","https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/picture-books/yueguang/yueguang/page5.jpg","https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/picture-books/yueguang/yueguang/page6.jpg","https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/picture-books/yueguang/yueguang/page7.jpg","https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/picture-books/yueguang/yueguang/page8.jpg","https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/picture-books/yueguang/yueguang/page9.jpg","https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/picture-books/yueguang/yueguang/page10.jpg","https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/picture-books/yueguang/yueguang/page11.jpg","https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/picture-books/yueguang/yueguang/page12.jpg","https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/picture-books/yueguang/yueguang/page13.jpg","https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/picture-books/yueguang/yueguang/page14.jpg","https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/picture-books/yueguang/yueguang/page15.jpg"] }
    ],
    currentBookId: "dangdang",
    currentPageIndex: 0,
    imageKey: 0,
    currentBook: null,
    currentPagePath: "",
    totalPages: 0,
    currentTitle: "",
    isLastPage: false,
    isFirstPage: true,
    displayBooks: []
  },
  onLoad() { this.loadBooksFromJSON(); },
  loadBooksFromJSON() {
    var self = this;
    wx.request({
      url: "https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com/static/indexes/picture-books.json",
      success: function(res) {
        if (res.statusCode === 200 && Array.isArray(res.data) && res.data.length > 0) {
          var books = res.data.map(function(book) {
            var pages = (book.pages || []).map(function(page) {
              if (typeof page === "string" && (page.indexOf("http://") === 0 || page.indexOf("https://") === 0)) return page.trim();
              return page;
            });
            return { id: book.id, title: book.title, pages: pages };
          });
          self.setData({ books: books });
        }
        self.refreshCurrentBook();
      },
      fail: function() { self.refreshCurrentBook(); }
    });
  },
  getCurrentBook() {
    for (var i = 0; i < this.data.books.length; i++) {
      if (this.data.books[i].id === this.data.currentBookId) return this.data.books[i];
    }
    return this.data.books[0];
  },
  getCurrentPagePath() {
    var book = this.getCurrentBook();
    if (!book || !book.pages || this.data.currentPageIndex >= book.pages.length) return "";
    var page = book.pages[this.data.currentPageIndex];
    if (typeof page === "string") {
      if (page.indexOf("http") === 0) return page;
      var base = "https://yueyun-videos.oss-cn-guangzhou.aliyuncs.com";
      return base + "/picture-books/" + book.id + "/" + book.id + "/" + page;
    }
    return "";
  },
  refreshCurrentBook() {
    var book = this.getCurrentBook();
    this.setData({
      currentBook: book,
      currentTitle: book.title,
      totalPages: book.pages.length,
      currentPagePath: this.getCurrentPagePath(),
      isFirstPage: this.data.currentPageIndex === 0,
      isLastPage: this.data.currentPageIndex >= book.pages.length - 1
    });
    this.refreshDisplayBooks();
  },
  refreshDisplayBooks() {
    var self = this;
    var displayBooks = self.data.books.map(function(book) {
      return { id: book.id, title: book.title, isActive: book.id === self.data.currentBookId };
    });
    this.setData({ displayBooks: displayBooks });
  },
  goBack() {
    wx.navigateBack({ fail: function() { wx.reLaunch({ url: "/pages/original/original" }); } });
  },
  selectBook(e) {
    var bookId = e.currentTarget.dataset.bookid;
    this.setData({ currentBookId: bookId, currentPageIndex: 0, imageKey: this.data.imageKey + 1 });
    this.refreshCurrentBook();
  },
  previousPage() {
    if (this.data.currentPageIndex > 0) {
      this.setData({ currentPageIndex: this.data.currentPageIndex - 1, imageKey: this.data.imageKey + 1 });
      this.refreshCurrentBook();
    }
  },
  nextPage() {
    var book = this.getCurrentBook();
    if (this.data.currentPageIndex < book.pages.length - 1) {
      this.setData({ currentPageIndex: this.data.currentPageIndex + 1, imageKey: this.data.imageKey + 1 });
      this.refreshCurrentBook();
    }
  },
  onImageLoad() { console.log("图片加载成功"); },
  onImageError(e) {
    console.error("图片加载失败:", e);
    var self = this;
    setTimeout(function() { self.setData({ imageKey: self.data.imageKey + 1 }); }, 500);
    wx.showToast({ title: "图片加载失败，请检查网络或图片是否存在", icon: "none", duration: 3000 });
  }
});
