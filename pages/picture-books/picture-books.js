Page({
  data: {
    books: [
      { id: "dangdang", title: "氹氹转", cover: "/static/picture-books/dangdang/cover.png", pages: ["/static/picture-books/dangdang/page1.jpg","/static/picture-books/dangdang/page2.jpg","/static/picture-books/dangdang/page3.jpg","/static/picture-books/dangdang/page4.jpg","/static/picture-books/dangdang/page5.jpg","/static/picture-books/dangdang/page6.jpg","/static/picture-books/dangdang/page7.jpg","/static/picture-books/dangdang/page8.jpg","/static/picture-books/dangdang/page9.jpg","/static/picture-books/dangdang/page10.jpg"] },
      { id: "qiqi", title: "齐齐望过去", cover: "/static/picture-books/look/cover.png", pages: ["/static/picture-books/look/page1.jpg","/static/picture-books/look/page2.jpg","/static/picture-books/look/page3.jpg","/static/picture-books/look/page4.jpg","/static/picture-books/look/page5.jpg","/static/picture-books/look/page6.jpg","/static/picture-books/look/page7.jpg"] },
      { id: "yueguang", title: "月光光", cover: "/static/picture-books/moonlight/cover.png", pages: ["/static/picture-books/moonlight/page1.jpg","/static/picture-books/moonlight/page2.jpg","/static/picture-books/moonlight/page3.jpg","/static/picture-books/moonlight/page4.jpg","/static/picture-books/moonlight/page5.jpg","/static/picture-books/moonlight/page6.jpg","/static/picture-books/moonlight/page7.jpg","/static/picture-books/moonlight/page8.jpg","/static/picture-books/moonlight/page9.jpg","/static/picture-books/moonlight/page10.jpg","/static/picture-books/moonlight/page11.jpg","/static/picture-books/moonlight/page12.jpg","/static/picture-books/moonlight/page13.jpg","/static/picture-books/moonlight/page14.jpg"] }
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
  onLoad() {
    this.setData({
      books: [
        { id: "dangdang", title: "氹氹转", cover: "/static/picture-books/dangdang/cover.png", pages: ["/static/picture-books/dangdang/page1.jpg","/static/picture-books/dangdang/page2.jpg","/static/picture-books/dangdang/page3.jpg","/static/picture-books/dangdang/page4.jpg","/static/picture-books/dangdang/page5.jpg","/static/picture-books/dangdang/page6.jpg","/static/picture-books/dangdang/page7.jpg","/static/picture-books/dangdang/page8.jpg","/static/picture-books/dangdang/page9.jpg","/static/picture-books/dangdang/page10.jpg"] },
        { id: "yueguang", title: "月光光", cover: "/static/picture-books/moonlight/cover.png", pages: ["/static/picture-books/moonlight/page1.jpg","/static/picture-books/moonlight/page2.jpg","/static/picture-books/moonlight/page3.jpg","/static/picture-books/moonlight/page4.jpg","/static/picture-books/moonlight/page5.jpg","/static/picture-books/moonlight/page6.jpg","/static/picture-books/moonlight/page7.jpg","/static/picture-books/moonlight/page8.jpg","/static/picture-books/moonlight/page9.jpg","/static/picture-books/moonlight/page10.jpg","/static/picture-books/moonlight/page11.jpg","/static/picture-books/moonlight/page12.jpg","/static/picture-books/moonlight/page13.jpg","/static/picture-books/moonlight/page14.jpg"] },
        { id: "qiqi", title: "齐齐望过去", cover: "/static/picture-books/look/cover.png", pages: ["/static/picture-books/look/page1.jpg","/static/picture-books/look/page2.jpg","/static/picture-books/look/page3.jpg","/static/picture-books/look/page4.jpg","/static/picture-books/look/page5.jpg","/static/picture-books/look/page6.jpg","/static/picture-books/look/page7.jpg"] }
      ]
    });
    this.refreshCurrentBook();
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
      return page;
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
      return { id: book.id, title: book.title, cover: book.cover, pages: book.pages.length, isActive: book.id === self.data.currentBookId };
    });
    this.setData({ displayBooks: displayBooks });
  },
  goBack() {
    wx.navigateBack({ fail: function() { wx.switchTab({ url: "/pages/original/original" }); } });
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
