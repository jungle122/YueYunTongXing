var userModule = require('../../utils/user.js');
var communityModule = require('../../utils/community.js');

Page({
  data: {
    checkinStreak: 0,
    totalCheckins: 0,
    todayCheckedIn: false,
    calendarDays: [],
    achievements: [
      { id: 'first_learn', name: '初学者', desc: '完成第一次学习', icon: '🌱', unlocked: false },
      { id: 'checkin_3', name: '三日坚持', desc: '连续打卡3天', icon: '🔥', unlocked: false },
      { id: 'checkin_7', name: '一周达人', desc: '连续打卡7天', icon: '⭐', unlocked: false },
      { id: 'checkin_30', name: '月度之星', desc: '连续打卡30天', icon: '🏆', unlocked: false },
      { id: 'study_60', name: '小时学者', desc: '累计学习60分钟', icon: '📚', unlocked: false },
      { id: 'study_300', name: '粤语大师', desc: '累计学习300分钟', icon: '👑', unlocked: false },
      { id: 'first_message', name: '分享达人', desc: '发布第一条成长分享', icon: '💬', unlocked: false },
      { id: 'collect_5', name: '收藏家', desc: '收藏5个内容', icon: '💎', unlocked: false }
    ],
    todayStudySeconds: 0,
    todayStudyText: '今天还没有学习记录',
    templateGroups: [],
    templateGroupLabels: [],
    currentTemplateOptions: [],
    selectedGroupIndex: -1,
    selectedGroupLabel: '',
    selectedTemplateIndex: -1,
    selectedTemplateLabel: '',
    selectedTemplateId: '',
    selectedTemplateText: '',
    posts: [],
    postsLoading: false,
    postsLoadingMore: false,
    postsError: '',
    nextCursor: '',
    hasMorePosts: false,
    isPublishing: false
  },

  onLoad: function() {
    this.refreshStudyData();
  },

  onShow: function() {
    if (!this.checkLogin()) return;
    this.refreshStudyData();
    this.loadCheckinData();
    this.loadAchievements();
    this.loadPosts(true);
  },

  onPullDownRefresh: function() {
    var self = this;
    this.refreshStudyData();
    this.loadCheckinData();
    this.loadAchievements();
    this.loadPosts(true).finally(function() {
      wx.stopPullDownRefresh();
    });
  },

  onReachBottom: function() {
    this.loadMorePosts();
  },

  checkLogin: function() {
    if (userModule.isLoggedIn()) return true;
    wx.showModal({
      title: '提示',
      content: '请先登录后再使用社区功能',
      showCancel: false,
      success: function() {
        wx.navigateTo({ url: '/pages/login/login' });
      }
    });
    return false;
  },

  refreshStudyData: function() {
    var stats = communityModule.getLearningStats();
    var templateGroups = communityModule.getTemplateGroups(stats.todaySeconds);
    var todayStudyText = '今天还没有学习记录';
    if (stats.todaySeconds > 0 && stats.todayMinutes < 1) {
      todayStudyText = '今日学习不到1分钟';
    } else if (stats.todayMinutes >= 1) {
      todayStudyText = '今日学习 ' + stats.todayMinutes + ' 分钟';
    }

    var selectedGroupIndex = this.data.selectedGroupIndex;
    if (selectedGroupIndex < 0 || selectedGroupIndex >= templateGroups.length) selectedGroupIndex = -1;
    var currentTemplates = selectedGroupIndex >= 0 ? templateGroups[selectedGroupIndex].templates : [];
    var selectedTemplateIndex = -1;
    if (this.data.selectedTemplateId) {
      for (var index = 0; index < currentTemplates.length; index += 1) {
        if (currentTemplates[index].id === this.data.selectedTemplateId && !currentTemplates[index].disabled) {
          selectedTemplateIndex = index;
          break;
        }
      }
    }
    var selectedTemplate = selectedTemplateIndex >= 0 ? currentTemplates[selectedTemplateIndex] : null;
    var selectedTemplateText = selectedTemplate
      ? communityModule.renderTemplate(selectedTemplate.id, stats.todaySeconds)
      : '';
    this.setData({
      todayStudySeconds: stats.todaySeconds,
      todayStudyText: todayStudyText,
      templateGroups: templateGroups,
      templateGroupLabels: templateGroups.map(function(group) { return group.icon + ' ' + group.title; }),
      currentTemplateOptions: this.formatTemplateOptions(currentTemplates),
      selectedGroupIndex: selectedGroupIndex,
      selectedGroupLabel: selectedGroupIndex >= 0 ? templateGroups[selectedGroupIndex].icon + ' ' + templateGroups[selectedGroupIndex].title : '',
      selectedTemplateIndex: selectedTemplateIndex,
      selectedTemplateLabel: selectedTemplate ? selectedTemplate.text : '',
      selectedTemplateId: selectedTemplate ? selectedTemplate.id : '',
      selectedTemplateText: selectedTemplateText
    });
  },

  formatTemplateOptions: function(templates) {
    return (templates || []).map(function(template) {
      return {
        id: template.id,
        text: template.text,
        disabled: template.disabled,
        displayText: template.disabled ? template.text + '（学习满1分钟后可选）' : template.text
      };
    });
  },

  // === 本机打卡功能 ===
  loadCheckinData: function() {
    var checkins = userModule.getUserStorage('checkins', []);
    var today = this.getTodayStr();
    this.setData({
      totalCheckins: checkins.length,
      todayCheckedIn: checkins.indexOf(today) >= 0,
      checkinStreak: this.calculateStreak(checkins),
      calendarDays: this.generateCalendarDays(checkins)
    });
  },

  handleCheckin: function() {
    if (this.data.todayCheckedIn) {
      wx.showToast({ title: '今天已打卡啦', icon: 'none' });
      return;
    }

    var today = this.getTodayStr();
    var checkins = userModule.getUserStorage('checkins', []);
    if (checkins.indexOf(today) < 0) checkins.push(today);
    userModule.setUserStorage('checkins', checkins);

    var user = userModule.getCurrentUser();
    if (user) userModule.updateCurrentUser({ checkinDays: checkins.length });

    wx.showToast({ title: '打卡成功！', icon: 'success' });
    this.loadCheckinData();
    this.loadAchievements();
  },

  calculateStreak: function(checkins) {
    if (!checkins || checkins.length === 0) return 0;
    var sorted = checkins.slice().sort().reverse();
    var today = this.getTodayStr();
    var yesterday = this.getYesterdayStr();
    if (sorted[0] !== today && sorted[0] !== yesterday) return 0;

    var streak = 1;
    for (var i = 1; i < sorted.length; i += 1) {
      var prev = new Date(sorted[i - 1]);
      var curr = new Date(sorted[i]);
      if ((prev - curr) / (1000 * 60 * 60 * 24) === 1) streak += 1;
      else break;
    }
    return streak;
  },

  generateCalendarDays: function(checkins) {
    var days = [];
    var now = new Date();
    var today = this.getTodayStr();
    for (var i = 6; i >= 0; i -= 1) {
      var date = new Date(now);
      date.setDate(date.getDate() - i);
      var dateStr = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
      days.push({
        date: dateStr,
        day: date.getDate(),
        checked: checkins.indexOf(dateStr) >= 0,
        today: dateStr === today
      });
    }
    return days;
  },

  // === 本机成就系统 ===
  loadAchievements: function() {
    if (!userModule.getCurrentUser()) return;

    var checkins = userModule.getUserStorage('checkins', []);
    var streak = this.calculateStreak(checkins);
    var totalMinutes = communityModule.getLearningStats().totalMinutes;
    var postsSent = userModule.getUserStorage('community_posts_sent', 0);
    var favoriteGroups = ['audio_likes', 'video_favorites', 'text_science_collections', 'picture_book_favorites'];
    var favCount = favoriteGroups.reduce(function(total, storageKey) {
      var group = wx.getStorageSync(storageKey) || {};
      return total + Object.keys(group).filter(function(key) { return !!group[key]; }).length;
    }, 0);

    var achievements = this.data.achievements.map(function(item) {
      var unlocked = false;
      switch (item.id) {
        case 'first_learn': unlocked = totalMinutes > 0 || checkins.length > 0; break;
        case 'checkin_3': unlocked = streak >= 3; break;
        case 'checkin_7': unlocked = streak >= 7; break;
        case 'checkin_30': unlocked = streak >= 30; break;
        case 'study_60': unlocked = totalMinutes >= 60; break;
        case 'study_300': unlocked = totalMinutes >= 300; break;
        case 'first_message': unlocked = postsSent > 0; break;
        case 'collect_5': unlocked = favCount >= 5; break;
      }
      return { id: item.id, name: item.name, desc: item.desc, icon: item.icon, unlocked: unlocked };
    });
    this.setData({ achievements: achievements });
  },

  // === 云端成长分享 ===
  onTemplateGroupChange: function(event) {
    var groupIndex = Number(event.detail.value);
    var group = this.data.templateGroups[groupIndex];
    if (!group) return;
    this.setData({
      selectedGroupIndex: groupIndex,
      selectedGroupLabel: group.icon + ' ' + group.title,
      currentTemplateOptions: this.formatTemplateOptions(group.templates),
      selectedTemplateIndex: -1,
      selectedTemplateLabel: '',
      selectedTemplateId: '',
      selectedTemplateText: ''
    });
  },

  onTemplateChange: function(event) {
    var templateIndex = Number(event.detail.value);
    var option = this.data.currentTemplateOptions[templateIndex];
    if (!option) return;
    if (option.disabled) {
      wx.showToast({ title: '再学习一会儿，就可以分享今日成果啦', icon: 'none' });
      return;
    }
    this.setData({
      selectedTemplateIndex: templateIndex,
      selectedTemplateLabel: option.text,
      selectedTemplateId: option.id,
      selectedTemplateText: communityModule.renderTemplate(option.id, this.data.todayStudySeconds)
    });
  },

  publishPost: async function() {
    if (this.data.isPublishing) return;
    if (!this.data.selectedTemplateId) {
      wx.showToast({ title: '请先选择一句话', icon: 'none' });
      return;
    }
    var user = userModule.getCurrentUser();
    if (!user) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }
    if (!wx.cloud || !wx.cloud.callFunction) {
      wx.showToast({ title: '当前版本暂不支持云服务', icon: 'none' });
      return;
    }

    this.setData({ isPublishing: true });
    try {
      var avatarData = await this.prepareCommunityAvatar(user);
      var response = await wx.cloud.callFunction({
        name: 'publishCommunityPost',
        data: {
          templateId: this.data.selectedTemplateId,
          todayStudySeconds: this.data.todayStudySeconds,
          nickname: user.nickname,
          avatar: avatarData.avatar,
          avatarType: avatarData.avatarType
        }
      });
      var result = response && response.result;
      if (!result || !result.ok) {
        throw new Error(result && result.message ? result.message : '发布失败，请稍后再试');
      }

      var sentCount = userModule.getUserStorage('community_posts_sent', 0);
      userModule.setUserStorage('community_posts_sent', sentCount + 1);
      this.setData({
        selectedTemplateIndex: -1,
        selectedTemplateLabel: '',
        selectedTemplateId: '',
        selectedTemplateText: ''
      });
      wx.showToast({ title: '分享成功', icon: 'success' });
      this.loadAchievements();
      await this.loadPosts(true);
    } catch (error) {
      console.error('发布成长分享失败:', error);
      wx.showToast({ title: error && error.message ? error.message : '发布失败，请稍后再试', icon: 'none' });
    } finally {
      this.setData({ isPublishing: false });
    }
  },

  prepareCommunityAvatar: async function(user) {
    if (user.avatarType !== 'wechat' || !user.avatar) {
      return { avatar: user.avatar || '', avatarType: 'emoji' };
    }
    if (user.communityAvatarFileID && user.communityAvatarFileID.indexOf('cloud://') === 0) {
      return { avatar: user.communityAvatarFileID, avatarType: 'wechat' };
    }
    if (user.avatar.indexOf('cloud://') === 0) {
      return { avatar: user.avatar, avatarType: 'wechat' };
    }

    var extensionMatch = user.avatar.match(/\.(jpg|jpeg|png|webp)(?:\?|$)/i);
    var extension = extensionMatch ? '.' + extensionMatch[1].toLowerCase() : '.jpg';
    var cloudPath = 'community-avatars/' + Date.now() + '-' + Math.random().toString(36).slice(2, 10) + extension;
    try {
      var uploadResult = await wx.cloud.uploadFile({ cloudPath: cloudPath, filePath: user.avatar });
      if (!uploadResult || !uploadResult.fileID) throw new Error('头像上传失败');
      userModule.updateCurrentUser({ communityAvatarFileID: uploadResult.fileID });
      return { avatar: uploadResult.fileID, avatarType: 'wechat' };
    } catch (error) {
      console.error('上传社区头像失败:', error);
      throw new Error('头像已失效，请回到登录页重新选择头像');
    }
  },

  loadPosts: async function(reset) {
    if (!wx.cloud || !wx.cloud.callFunction) {
      this.setData({ postsError: '当前版本暂不支持云服务', postsLoading: false, postsLoadingMore: false });
      return;
    }
    if (reset) {
      if (this.data.postsLoading) return;
      this.setData({ postsLoading: true, postsError: '', nextCursor: '', hasMorePosts: false });
    } else {
      if (this.data.postsLoadingMore || !this.data.hasMorePosts) return;
      this.setData({ postsLoadingMore: true });
    }

    try {
      var response = await wx.cloud.callFunction({
        name: 'listCommunityPosts',
        data: { limit: 20, cursor: reset ? '' : this.data.nextCursor }
      });
      var result = response && response.result;
      if (!result || !result.ok) {
        throw new Error(result && result.message ? result.message : '成长分享暂时加载失败');
      }
      var self = this;
      var nextPosts = (result.posts || []).map(function(post) {
        return Object.assign({}, post, { timeText: self.formatTime(post.time) });
      });
      this.setData({
        posts: reset ? nextPosts : this.data.posts.concat(nextPosts),
        postsError: '',
        nextCursor: result.nextCursor || '',
        hasMorePosts: !!result.hasMore
      });
    } catch (error) {
      console.error('加载成长分享失败:', error);
      this.setData({ postsError: error && error.message ? error.message : '成长分享暂时加载失败' });
    } finally {
      this.setData({ postsLoading: false, postsLoadingMore: false });
    }
  },

  retryLoadPosts: function() {
    this.loadPosts(true);
  },

  loadMorePosts: function() {
    this.loadPosts(false);
  },

  requestDeletePost: function(event) {
    var postId = event.currentTarget.dataset.id;
    var self = this;
    wx.showModal({
      title: '删除分享',
      content: '确定删除这条成长分享吗？',
      confirmColor: '#cf684b',
      success: function(result) {
        if (result.confirm) self.deletePost(postId);
      }
    });
  },

  deletePost: async function(postId) {
    try {
      var response = await wx.cloud.callFunction({
        name: 'deleteMyCommunityPost',
        data: { postId: postId }
      });
      var result = response && response.result;
      if (!result || !result.ok) {
        throw new Error(result && result.message ? result.message : '删除失败，请稍后再试');
      }
      this.setData({
        posts: this.data.posts.filter(function(post) { return post.id !== postId; })
      });
      wx.showToast({ title: '已删除', icon: 'success' });
    } catch (error) {
      console.error('删除成长分享失败:', error);
      wx.showToast({ title: error && error.message ? error.message : '删除失败，请稍后再试', icon: 'none' });
    }
  },

  getTodayStr: function() {
    var date = new Date();
    return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
  },

  getYesterdayStr: function() {
    var date = new Date();
    date.setDate(date.getDate() - 1);
    return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
  },

  formatTime: function(timeStr) {
    var time = new Date(timeStr).getTime();
    if (!time) return '';
    var elapsed = Math.max(0, Date.now() - time);
    if (elapsed < 60000) return '刚刚';
    if (elapsed < 3600000) return Math.floor(elapsed / 60000) + '分钟前';
    if (elapsed < 86400000) return Math.floor(elapsed / 3600000) + '小时前';
    var date = new Date(time);
    return (date.getMonth() + 1) + '/' + date.getDate();
  }
});
