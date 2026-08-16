const MANUAL_GROUP_ID = "manual-2-4-1";
Page({
  data: {
    isPageEntering: false,
    manualOpening: false
  },
  onShow() {
    this.playEntryAnimation();
  },
  playEntryAnimation() {
    this.setData({ isPageEntering: false }, () => {
      this.setData({ isPageEntering: true });
    });
  },
  goVideo() {
    wx.navigateTo({ url: "/pages/video-learning/video-learning" });
  },
  goBook() {
    wx.navigateTo({ url: "/pages/picture-books/picture-books" });
  },
  openManual() {
    if (this.data.manualOpening) return;

    var self = this;

    this.setData({
      manualOpening: true
    });

    wx.showLoading({
      title: "手册加载中",
      mask: true
    });

    function finish(error) {
      wx.hideLoading();

      self.setData({
        manualOpening: false
      });

      if (error) {
        console.error("打开手册失败：", error);

        wx.showToast({
          title: "手册加载失败，请检查网络后重试",
          icon: "none",
          duration: 3000
        });
      }
    }

    wx.cloud.callFunction({
      name: "getMediaAssets",
      data: {
        mediaType: "document",
        groupId: MANUAL_GROUP_ID
      },

      success(response) {
        var result = response && response.result;
        var group = result && result.ok && result.groups && result.groups[0];
        var manual = group && group.items && group.items[0];

        if (!manual || !manual.url) {
          finish(new Error(result && result.message ? result.message : "手册资源尚未配置"));
          return;
        }

        wx.downloadFile({
          url: manual.url,

          success(downloadResult) {
            if (!downloadResult || downloadResult.statusCode !== 200 || !downloadResult.tempFilePath) {
              finish(new Error("没有取得手册临时文件路径"));
              return;
            }

            wx.openDocument({
              filePath: downloadResult.tempFilePath,
              fileType: "pdf",
              showMenu: true,

              success() {
                finish();
              },

              fail(error) {
                finish(error);
              }
            });
          },

          fail(error) {
            finish(error);
          }
        });
      },

      fail(error) {
        finish(error);
      }
    });
  }
});
