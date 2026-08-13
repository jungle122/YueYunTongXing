const MEDIA_TYPE = 'pictureBook';
const TEMP_URL_REFRESH_INTERVAL = 90 * 60 * 1000;
const BOOK_SUBTITLES = {
  yueguang: {
    1: '月光光，照地堂',
    3: '虾仔你乖乖瞓落床',
    4: '听朝阿妈要赶插秧啰',
    5: '阿爷睇牛佢上山岗喔',
    6: '虾仔你快高长大喔',
    7: '帮手阿爷去睇牛羊喔',
    8: '月光光，照地堂',
    9: '虾仔你乖乖瞓落床',
    11: '听朝阿爸要捕鱼虾啰',
    12: '阿嫲织网要织到天光哦',
    13: '虾仔你快高长大啰',
    14: '划艇撒网就更在行哦'
  }
};

function getMediaLoadError(error) {
  if (error && error.isUserMessage) return error.message;

  var errorText = error && (error.errMsg || error.message)
    ? String(error.errMsg || error.message)
    : '';
  if (errorText.indexOf('FUNCTION_NOT_FOUND') !== -1 || errorText.indexOf('-501000') !== -1) {
    return '媒体服务尚未部署，请联系管理员';
  }
  return '绘本加载失败，请检查网络后重试';
}

Page({
  data: {
    books: [],
    currentBookId: '',
    currentPageIndex: 0,
    imageKey: 0,
    currentBook: null,
    currentPagePath: '',
    totalPages: 0,
    currentTitle: '',
    currentSubtitle: '',
    isLastPage: false,
    isFirstPage: true,
    displayBooks: [],
    isLoading: true,
    loadError: ''
  },

  onLoad() {
    this.loadMedia();
  },

  onShow() {
    if (this.lastLoadedAt && Date.now() - this.lastLoadedAt >= TEMP_URL_REFRESH_INTERVAL) {
      this.loadMedia({ silent: true });
    }
  },

  async loadMedia(options) {
    if (this.isMediaRequesting) return;

    var silent = options && options.silent;
    this.isMediaRequesting = true;
    this.setData({
      isLoading: !silent,
      loadError: ''
    });

    try {
      var response = await wx.cloud.callFunction({
        name: 'getMediaAssets',
        data: { mediaType: MEDIA_TYPE }
      });
      var result = response && response.result;

      if (!result || !result.ok) {
        var serviceError = new Error(result && result.message ? result.message : '暂时无法加载绘本资源');
        serviceError.isUserMessage = true;
        throw serviceError;
      }

      var books = this.normalizeBooks(result.groups || []);
      if (!books.length) {
        throw new Error('暂时没有可用的绘本资源');
      }

      var currentBookId = this.data.currentBookId;
      var currentBookExists = books.some(function(book) {
        return book.id === currentBookId;
      });

      this.lastLoadedAt = Date.now();
      this.setData({
        books: books,
        currentBookId: currentBookExists ? currentBookId : books[0].id,
        currentPageIndex: currentBookExists ? this.data.currentPageIndex : 0,
        imageKey: this.data.imageKey + 1,
        isLoading: false,
        loadError: ''
      });
      this.refreshCurrentBook();
    } catch (error) {
      console.error('加载绘本资源失败:', error);
      this.setData({
        isLoading: false,
        loadError: getMediaLoadError(error)
      });
    } finally {
      this.isMediaRequesting = false;
    }
  },

  normalizeBooks(groups) {
    return groups.map(function(group) {
      var pages = (group.items || []).map(function(item) {
        return item.url;
      }).filter(Boolean);

      return {
        id: group.groupId,
        title: group.title,
        cover: group.coverUrl,
        pages: pages,
        subtitles: BOOK_SUBTITLES[group.groupId] || null
      };
    }).filter(function(book) {
      return book.id && book.title && book.cover && book.pages.length;
    });
  },

  retryMedia() {
    this.loadMedia();
  },

  getCurrentBook() {
    for (var i = 0; i < this.data.books.length; i++) {
      if (this.data.books[i].id === this.data.currentBookId) return this.data.books[i];
    }
    return this.data.books[0] || null;
  },

  getCurrentPagePath() {
    var book = this.getCurrentBook();
    if (!book || !book.pages || this.data.currentPageIndex >= book.pages.length) return '';
    return typeof book.pages[this.data.currentPageIndex] === 'string'
      ? book.pages[this.data.currentPageIndex]
      : '';
  },
  getCurrentSubtitle() {
    var book = this.getCurrentBook();
    if (!book || !book.subtitles) return '';
    var subtitle = book.subtitles[this.data.currentPageIndex + 1];
    return subtitle || '';
  },
  refreshCurrentBook() {
    var book = this.getCurrentBook();
    if (!book) return;

    var currentPageIndex = Math.min(this.data.currentPageIndex, book.pages.length - 1);
    this.setData({ currentPageIndex: currentPageIndex });
    this.setData({
      currentBook: book,
      currentTitle: book.title,
      totalPages: book.pages.length,
      currentPagePath: this.getCurrentPagePath(),
      currentSubtitle: this.getCurrentSubtitle(),
      isFirstPage: currentPageIndex === 0,
      isLastPage: currentPageIndex >= book.pages.length - 1
    });
    this.refreshDisplayBooks();
  },

  refreshDisplayBooks() {
    var self = this;
    var displayBooks = self.data.books.map(function(book) {
      return {
        id: book.id,
        title: book.title,
        cover: book.cover,
        pages: book.pages.length,
        isActive: book.id === self.data.currentBookId
      };
    });
    this.setData({ displayBooks: displayBooks });
  },

  selectBook(e) {
    var bookId = e.currentTarget.dataset.bookid;
    this.setData({
      currentBookId: bookId,
      currentPageIndex: 0,
      imageKey: this.data.imageKey + 1
    });
    this.refreshCurrentBook();
  },

  previousPage() {
    if (this.data.currentPageIndex > 0) {
      this.setData({
        currentPageIndex: this.data.currentPageIndex - 1,
        imageKey: this.data.imageKey + 1
      });
      this.refreshCurrentBook();
    }
  },

  nextPage() {
    var book = this.getCurrentBook();
    if (book && this.data.currentPageIndex < book.pages.length - 1) {
      this.setData({
        currentPageIndex: this.data.currentPageIndex + 1,
        imageKey: this.data.imageKey + 1
      });
      this.refreshCurrentBook();
    }
  },

  onImageError(e) {
    console.error('绘本图片加载失败:', e);
    wx.showToast({
      title: '图片加载失败，请检查网络后重试',
      icon: 'none',
      duration: 3000
    });
  }
});
