var userModule = require('./user.js');

var DATA_KEYS = [
  'learningHistory',
  'audio_likes',
  'audio_progress',
  'video_favorites',
  'text_science_collections',
  'text_science_read_progress',
  'picture_book_favorites',
  'checkins',
  'community_posts_sent'
];
var syncTimer = null;
var syncPromise = null;

function getDefaultValue(key) {
  if (key === 'learningHistory' || key === 'checkins') return [];
  if (key === 'community_posts_sent') return 0;
  return {};
}

function collectSnapshot() {
  var snapshot = {};
  DATA_KEYS.forEach(function(key) {
    snapshot[key] = userModule.getUserStorage(key, getDefaultValue(key));
  });
  return snapshot;
}

function applySnapshot(snapshot) {
  DATA_KEYS.forEach(function(key) {
    var value = snapshot && Object.prototype.hasOwnProperty.call(snapshot, key)
      ? snapshot[key]
      : getDefaultValue(key);
    userModule.setUserStorage(key, value);
  });
}

function hasLocalData(snapshot) {
  return DATA_KEYS.some(function(key) {
    var value = snapshot[key];
    if (Array.isArray(value)) return value.length > 0;
    if (value && typeof value === 'object') return Object.keys(value).length > 0;
    return Number(value) > 0;
  });
}

function isEmptyValue(value) {
  if (value === '' || value === undefined || value === null) return true;
  if (Array.isArray(value)) return value.length === 0;
  if (value && typeof value === 'object') return Object.keys(value).length === 0;
  return Number(value) === 0;
}

function migrateLegacyGlobalDataOnce() {
  var user = userModule.getCurrentUser();
  if (!user || !user.userId) return;
  var markerKey = 'learning_data_legacy_migrated';
  if (wx.getStorageSync(markerKey)) return;
  DATA_KEYS.forEach(function(key) {
    var scopedValue = userModule.getUserStorage(key, getDefaultValue(key));
    var legacyValue = wx.getStorageSync(key);
    if (isEmptyValue(scopedValue) && !isEmptyValue(legacyValue)) {
      if (typeof legacyValue === 'string') {
        try { legacyValue = JSON.parse(legacyValue); } catch (error) {}
      }
      userModule.setUserStorage(key, legacyValue);
    }
  });
  wx.setStorageSync(markerKey, user.userId);
}

async function callCloud(data) {
  if (!wx.cloud || !wx.cloud.callFunction) throw new Error('当前版本暂不支持学习数据同步');
  var response = await wx.cloud.callFunction({ name: 'userLearningData', data: data });
  var result = response && response.result;
  if (!result || !result.ok) {
    throw new Error(result && result.message ? result.message : '学习数据同步暂时不可用');
  }
  return result;
}

function getDirtyKey() {
  return userModule.getUserKey('learning_sync_dirty');
}

async function syncNow() {
  if (!userModule.isLoggedIn()) return;
  if (syncPromise) return syncPromise;
  syncPromise = callCloud({ action: 'save', snapshot: collectSnapshot() })
    .then(function() {
      wx.setStorageSync(getDirtyKey(), false);
    })
    .finally(function() {
      syncPromise = null;
    });
  return syncPromise;
}

function markDirty() {
  if (!userModule.isLoggedIn()) return;
  wx.setStorageSync(getDirtyKey(), true);
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(function() {
    syncTimer = null;
    syncNow().catch(function(error) {
      console.error('后台同步学习数据失败:', error);
    });
  }, 1200);
}

async function restore() {
  if (!userModule.isLoggedIn()) return;
  migrateLegacyGlobalDataOnce();
  var localSnapshot = collectSnapshot();
  if (wx.getStorageSync(getDirtyKey())) {
    await syncNow();
    return;
  }
  var result = await callCloud({ action: 'get' });
  if (result.exists) {
    applySnapshot(result.snapshot || {});
  } else if (hasLocalData(localSnapshot)) {
    await syncNow();
  }
}

module.exports = {
  DATA_KEYS: DATA_KEYS,
  restore: restore,
  syncNow: syncNow,
  markDirty: markDirty
};
