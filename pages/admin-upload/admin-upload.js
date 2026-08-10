Page({
  data: {
    videoList: [
      { id: 'video1', title: '氹氹转', cloudName: 'media/video/video1.mp4', sourceFile: '手绘视频/氹氹转.mp4', uploaded: false },
      { id: 'video2', title: '齐齐望过去', cloudName: 'media/video/video2.mp4', sourceFile: '手绘视频/齐齐望过去.mp4', uploaded: false },
      { id: 'video3', title: '月光光', cloudName: 'media/video/video3.mp4', sourceFile: '手绘视频/月光光.mp4', uploaded: false },
      { id: 'video4', title: '小猪佩奇洗白白大作战', cloudName: 'media/video/video4.mp4', sourceFile: '童谣视频/粤语童谣原创视频/小猪佩奇+洗白白.mp4', uploaded: false },
      { id: 'video5', title: '喜羊羊带你齐齐望过去', cloudName: 'media/video/video5.mp4', sourceFile: '童谣视频/粤语童谣原创视频/喜羊羊+有只雀仔跌落水.mp4', uploaded: false },
      { id: 'video6', title: '火鸡总动员之何家公鸡魔性对决', cloudName: 'media/video/video6.mp4', sourceFile: '童谣视频/粤语童谣原创视频/火鸡总动员+何家公鸡何家猜.mp4', uploaded: false },
      { id: 'video7', title: '海绵宝宝带你扒龙船', cloudName: 'media/video/video7.mp4', sourceFile: '童谣视频/粤语童谣原创视频/海绵宝宝+香蕉船.mp4', uploaded: false },
      { id: 'video8', title: '走进小马宝莉的细小世界', cloudName: 'media/video/video8.mp4', sourceFile: '童谣视频/粤语童谣原创视频/小马宝莉+世界真小.mp4', uploaded: false },
      { id: 'video9', title: '当哪吒遇见氹氹转', cloudName: 'media/video/video9.mp4', sourceFile: '童谣视频/粤语童谣原创视频/哪吒+氹氹转.mp4', uploaded: false },
      { id: 'video10', title: '当葫芦娃唱起月光光', cloudName: 'media/video/video10.mp4', sourceFile: '童谣视频/粤语童谣原创视频/葫芦娃+月光光.mp4', uploaded: false }
    ],
    statusText: ''
  },

  uploadVideo(e) {
    var index = e.currentTarget.dataset.index;
    var video = this.data.videoList[index];
    var self = this;

    wx.chooseMessageFile({
      count: 1,
      type: 'video',
      success: function(res) {
        var file = res.tempFiles[0];
        console.log('选择了文件:', file.name, '大小:', file.size);

        self.setData({ statusText: '正在上传 ' + video.cloudName + ' ...' });

        wx.cloud.uploadFile({
          cloudPath: video.cloudName,
          filePath: file.tempFilePath,
          success: function(uploadRes) {
            console.log('上传成功:', uploadRes.fileID);
            var key = 'videoList[' + index + '].uploaded';
            self.setData({
              [key]: true,
              statusText: '✓ ' + video.cloudName + ' 上传成功！'
            });

            // 检查是否全部上传完成
            var allDone = true;
            self.data.videoList.forEach(function(v) {
              if (!v.uploaded) allDone = false;
            });
            if (allDone) {
              self.setData({ statusText: '🎉 全部10个视频上传完成！可以删除此页面了。' });
              wx.showModal({
                title: '全部上传完成',
                content: '10个视频全部上传到云存储成功！此页面可以删除了。',
                showCancel: false
              });
            }
          },
          fail: function(err) {
            console.error('上传失败:', err);
            self.setData({ statusText: '✗ 上传失败: ' + (err.errMsg || JSON.stringify(err)) });
            wx.showModal({
              title: '上传失败',
              content: JSON.stringify(err),
              showCancel: false
            });
          }
        });
      },
      fail: function(err) {
        console.error('选择文件失败:', err);
        if (err.errMsg && err.errMsg.indexOf('cancel') === -1) {
          self.setData({ statusText: '选择文件失败: ' + err.errMsg });
        }
      }
    });
  },

  checkAll() {
    var self = this;
    var fileIDs = this.data.videoList.map(function(v) {
      return 'cloud://yueyuntongxing-dev-d0cig323c0cff.7975-yueyuntongxing-dev-d0cig323c0cff-1465281015/' + v.cloudName;
    });

    wx.cloud.getTempFileURL({
      fileList: fileIDs,
      success: function(res) {
        var results = res.fileList || [];
        var status = [];
        results.forEach(function(f, i) {
          var ok = (!f.code || f.code === 'SUCCESS') && f.tempFileURL;
          var key = 'videoList[' + i + '].uploaded';
          self.setData({ [key]: ok });
          status.push(self.data.videoList[i].cloudName + ': ' + (ok ? '✓' : '✗'));
        });
        self.setData({ statusText: '检查完成:\n' + status.join('\n') });
      },
      fail: function(err) {
        console.error('检查失败:', err);
        self.setData({ statusText: '检查失败: ' + JSON.stringify(err) });
      }
    });
  }
});
