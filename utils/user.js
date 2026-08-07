/**
 * 用户管理模块 - 粤语童谣时光屋
 * 提供用户注册、登录、登出、数据隔离等功能
 */

var USER_KEY = 'current_user';
var USERS_KEY = 'registered_users';

/**
 * 生成唯一用户ID
 */
function generateUserId() {
  return 'u_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
}

/**
 * 获取所有已注册用户列表
 */
function getUsers() {
  try {
    var users = wx.getStorageSync(USERS_KEY);
    if (users) return typeof users === 'string' ? JSON.parse(users) : users;
  } catch (e) {
    console.error('获取用户列表失败:', e);
  }
  return [];
}

/**
 * 保存用户列表
 */
function saveUsers(users) {
  try {
    wx.setStorageSync(USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('保存用户列表失败:', e);
  }
}

/**
 * 用户注册
 * @param {Object} userInfo - { nickname, avatar, avatarType }
 * @returns {Object} 注册后的用户对象
 */
function register(userInfo) {
  if (!userInfo || !userInfo.nickname) {
    return { success: false, message: '昵称不能为空' };
  }
  
  var users = getUsers();
  
  // 检查是否已存在同昵称用户
  for (var i = 0; i < users.length; i++) {
    if (users[i].nickname === userInfo.nickname) {
      // 已有该用户，直接登录
      setCurrentUser(users[i]);
      return { success: true, message: '登录成功', user: users[i], isNew: false };
    }
  }
  
  // 新用户注册
  var newUser = {
    userId: generateUserId(),
    nickname: userInfo.nickname,
    avatar: userInfo.avatar || '',
    avatarType: userInfo.avatarType || 'emoji', // emoji | wechat
    createTime: new Date().toISOString(),
    totalStudyMinutes: 0,
    checkinDays: 0,
    lastCheckinDate: '',
    achievements: []
  };
  
  users.push(newUser);
  saveUsers(users);
  setCurrentUser(newUser);
  
  return { success: true, message: '注册成功', user: newUser, isNew: true };
}

/**
 * 用户登录（通过昵称）
 * @param {string} nickname
 * @returns {Object}
 */
function login(nickname) {
  if (!nickname) {
    return { success: false, message: '请输入昵称' };
  }
  
  var users = getUsers();
  for (var i = 0; i < users.length; i++) {
    if (users[i].nickname === nickname) {
      setCurrentUser(users[i]);
      return { success: true, message: '登录成功', user: users[i] };
    }
  }
  
  return { success: false, message: '用户不存在，请先注册' };
}

/**
 * 设置当前用户
 */
function setCurrentUser(user) {
  try {
    wx.setStorageSync(USER_KEY, JSON.stringify(user));
  } catch (e) {
    console.error('设置当前用户失败:', e);
  }
}

/**
 * 获取当前用户信息
 * @returns {Object|null}
 */
function getCurrentUser() {
  try {
    var user = wx.getStorageSync(USER_KEY);
    if (user) return typeof user === 'string' ? JSON.parse(user) : user;
  } catch (e) {
    console.error('获取当前用户失败:', e);
  }
  return null;
}

/**
 * 更新当前用户信息
 * @param {Object} updates - 要更新的字段
 */
function updateCurrentUser(updates) {
  var user = getCurrentUser();
  if (!user) return false;
  
  // 合并更新
  for (var key in updates) {
    if (updates.hasOwnProperty(key)) {
      user[key] = updates[key];
    }
  }
  
  // 更新用户列表中的信息
  var users = getUsers();
  for (var i = 0; i < users.length; i++) {
    if (users[i].userId === user.userId) {
      users[i] = user;
      break;
    }
  }
  saveUsers(users);
  setCurrentUser(user);
  
  return true;
}

/**
 * 用户登出
 */
function logout() {
  try {
    wx.removeStorageSync(USER_KEY);
    return true;
  } catch (e) {
    console.error('登出失败:', e);
    return false;
  }
}

/**
 * 检查是否已登录
 * @returns {boolean}
 */
function isLoggedIn() {
  return getCurrentUser() !== null;
}

/**
 * 获取用户专属存储键名（数据隔离）
 * @param {string} key - 原始键名
 * @returns {string} 带用户前缀的键名
 */
function getUserKey(key) {
  var user = getCurrentUser();
  if (!user) return key;
  return 'user_' + user.userId + '_' + key;
}

/**
 * 存储用户数据
 * @param {string} key - 数据键名
 * @param {any} data - 数据内容
 */
function setUserStorage(key, data) {
  var userKey = getUserKey(key);
  try {
    if (typeof data === 'object') {
      wx.setStorageSync(userKey, JSON.stringify(data));
    } else {
      wx.setStorageSync(userKey, data);
    }
  } catch (e) {
    console.error('存储用户数据失败:', e);
  }
}

/**
 * 获取用户数据
 * @param {string} key - 数据键名
 * @param {any} defaultValue - 默认值
 * @returns {any}
 */
function getUserStorage(key, defaultValue) {
  var userKey = getUserKey(key);
  try {
    var data = wx.getStorageSync(userKey);
    if (data === '' || data === undefined || data === null) return defaultValue;
    if (typeof data === 'string') {
      try { return JSON.parse(data); } catch (e) { return data; }
    }
    return data;
  } catch (e) {
    console.error('获取用户数据失败:', e);
    return defaultValue;
  }
}

/**
 * 获取用户排行榜数据（所有用户的学习时长）
 * @returns {Array}
 */
function getLeaderboard() {
  var users = getUsers();
  var leaderboard = users.map(function(u) {
    return {
      nickname: u.nickname,
      avatar: u.avatar,
      avatarType: u.avatarType || 'emoji',
      totalStudyMinutes: u.totalStudyMinutes || 0,
      checkinDays: u.checkinDays || 0
    };
  });
  leaderboard.sort(function(a, b) {
    return b.totalStudyMinutes - a.totalStudyMinutes;
  });
  return leaderboard;
}

module.exports = {
  register: register,
  login: login,
  logout: logout,
  getCurrentUser: getCurrentUser,
  updateCurrentUser: updateCurrentUser,
  isLoggedIn: isLoggedIn,
  getUserKey: getUserKey,
  setUserStorage: setUserStorage,
  getUserStorage: getUserStorage,
  getUsers: getUsers,
  getLeaderboard: getLeaderboard
};
