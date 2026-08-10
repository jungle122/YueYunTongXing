const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const MEDIA_COLLECTION = 'mediaAssets';
const ALLOWED_MEDIA_TYPES = ['pictureBook', 'audio', 'video'];
const MAX_GROUP_COUNT = 100;
const TEMP_URL_BATCH_SIZE = 50;

function failure(code, message) {
  return { ok: false, code: code, message: message };
}

function isAllowedGroupId(groupId) {
  return !groupId || /^[a-z0-9][a-z0-9_-]{0,63}$/.test(groupId);
}

function collectFileIDs(groups) {
  var fileIDs = [];

  groups.forEach(function(group) {
    if (group.coverFileID) fileIDs.push(group.coverFileID);
    (group.items || []).forEach(function(item) {
      if (item.fileID) fileIDs.push(item.fileID);
      if (item.posterFileID) fileIDs.push(item.posterFileID);
    });
  });

  return Array.from(new Set(fileIDs));
}

async function resolveTempURLs(fileIDs) {
  var urlMap = {};

  for (var start = 0; start < fileIDs.length; start += TEMP_URL_BATCH_SIZE) {
    var batch = fileIDs.slice(start, start + TEMP_URL_BATCH_SIZE);
    var result = await cloud.getTempFileURL({ fileList: batch });

    (result.fileList || []).forEach(function(file) {
      if ((!file.code || file.code === 'SUCCESS') && file.tempFileURL) {
        urlMap[file.fileID] = file.tempFileURL;
      }
    });
  }

  return urlMap;
}

function buildGroups(groups, urlMap) {
  return groups.map(function(group) {
    var items = (group.items || []).slice().sort(function(a, b) {
      return Number(a.sort || 0) - Number(b.sort || 0);
    }).map(function(item) {
      return {
        id: item.id,
        title: item.title || '',
        sort: Number(item.sort || 0),
        url: urlMap[item.fileID] || '',
        posterUrl: urlMap[item.posterFileID] || ''
      };
    }).filter(function(item) {
      return item.url;
    });

    return {
      groupId: group.groupId,
      title: group.title,
      sort: Number(group.sort || 0),
      coverUrl: urlMap[group.coverFileID] || '',
      items: items
    };
  }).filter(function(group) {
    return group.groupId && group.title && group.coverUrl && group.items.length;
  }).sort(function(a, b) {
    return a.sort - b.sort;
  });
}

exports.main = async function(event) {
  const wxContext = cloud.getWXContext();
  const mediaType = event && event.mediaType;
  const groupId = event && event.groupId ? String(event.groupId).trim() : '';

  if (!wxContext.OPENID) {
    return failure('IDENTITY_UNAVAILABLE', '暂时无法确认微信身份，请稍后再试');
  }
  if (ALLOWED_MEDIA_TYPES.indexOf(mediaType) === -1) {
    return failure('INVALID_MEDIA_TYPE', '媒体类型无效');
  }
  if (!isAllowedGroupId(groupId)) {
    return failure('INVALID_GROUP_ID', '媒体分组无效');
  }

  try {
    const result = await db.collection(MEDIA_COLLECTION)
      .where({ mediaType: mediaType })
      .limit(MAX_GROUP_COUNT)
      .get();
    const groups = (result.data || []).filter(function(group) {
      return group.enabled === true && (!groupId || group.groupId === groupId);
    });
    const fileIDs = collectFileIDs(groups);

    if (!fileIDs.length) {
      return { ok: true, groups: [] };
    }

    const urlMap = await resolveTempURLs(fileIDs);
    if (Object.keys(urlMap).length !== fileIDs.length) {
      console.error('Some media files could not be resolved', {
        mediaType: mediaType,
        expectedFiles: fileIDs.length,
        resolvedFiles: Object.keys(urlMap).length
      });
      return failure('MEDIA_FILE_UNAVAILABLE', '部分媒体文件暂时不可用，请联系管理员检查云存储');
    }
    const responseGroups = buildGroups(groups, urlMap);

    if (responseGroups.length !== groups.length) {
      console.error('Some media files could not be resolved', {
        mediaType: mediaType,
        expectedGroups: groups.length,
        resolvedGroups: responseGroups.length
      });
      return failure('MEDIA_FILE_UNAVAILABLE', '部分媒体文件暂时不可用，请联系管理员检查云存储');
    }

    return { ok: true, groups: responseGroups };
  } catch (error) {
    console.error('getMediaAssets failed:', error);
    return failure('SERVICE_UNAVAILABLE', '媒体服务暂时不可用，请稍后再试');
  }
};
