const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const _ = db.command;
const POSTS_COLLECTION = 'communityPosts';
const MIN_PUBLISH_INTERVAL_MS = 30 * 1000;
const MAX_DAILY_POSTS = 3;
const MAX_NICKNAME_LENGTH = 12;
const MAX_STUDY_SECONDS = 24 * 60 * 60;
const ALLOWED_EMOJI_AVATARS = ['🦊', '🐱', '🐶', ''];
const TEMPLATES = {
  study_great: { text: '今天我学习了{minutesText}，我真是太棒啦！', requiresStudy: true },
  study_energy: { text: '今日粤语能量 +{minutes}，继续努力！', requiresStudy: true },
  study_closer: { text: '我又坚持学习了{minutesText}，离目标更近一步！', requiresStudy: true },
  study_praise: { text: '今天认真学习了{minutesText}，给自己点个赞！', requiresStudy: true },
  study_progress: { text: '小小进步也是进步，我今天学习了{minutesText}！', requiresStudy: true },
  study_happy: { text: '今日学习任务完成，共{minutesText}，开心！', requiresStudy: true },
  mood_fun: { text: '今天学得很开心，粤语越来越有趣啦！' },
  mood_progress: { text: '我发现自己又进步了一点，真开心！' },
  mood_challenge: { text: '今天遇到了一点难题，但我不会放弃！' },
  mood_learned: { text: '今天又学到了新内容，收获满满！' },
  mood_better: { text: '慢慢学、天天学，我一定会越来越棒！' },
  encourage_together: { text: '小伙伴们一起加油，坚持就会有收获！' },
  encourage_checkin: { text: '谁也在学习呀？我们一起打卡吧！' },
  encourage_step: { text: '每天进步一点点，就是很棒的成长！' },
  encourage_company: { text: '学习路上有大家陪伴，真开心！' },
  goal_continue: { text: '明天我还要继续学习，保持好习惯！' },
  goal_one_more_day: { text: '我的下一个目标是再坚持一天！' },
  goal_forward: { text: '今天完成小目标，明天继续向前！' },
  goal_longer: { text: '我准备挑战更长的学习时间，加油！' }
};

function failure(code, message) {
  return { ok: false, code: code, message: message };
}

function getTime(value) {
  if (!value) return 0;
  if (value instanceof Date) return value.getTime();
  if (value.$date) return new Date(value.$date).getTime();
  return new Date(value).getTime() || 0;
}

function getChinaDayStart(now) {
  const chinaOffset = 8 * 60 * 60 * 1000;
  const chinaNow = new Date(now + chinaOffset);
  return new Date(Date.UTC(chinaNow.getUTCFullYear(), chinaNow.getUTCMonth(), chinaNow.getUTCDate()) - chinaOffset);
}

function normalizeNickname(value) {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
}

function renderTemplate(template, todayStudySeconds) {
  const minutes = Math.floor(todayStudySeconds / 60);
  return template.text
    .replace(/\{minutesText\}/g, minutes + '分钟')
    .replace(/\{minutes\}/g, String(minutes));
}

function validateAvatar(input) {
  const avatarType = input.avatarType === 'wechat' ? 'wechat' : 'emoji';
  const avatar = typeof input.avatar === 'string' ? input.avatar.trim() : '';
  if (avatarType === 'emoji') {
    if (ALLOWED_EMOJI_AVATARS.indexOf(avatar) === -1) return null;
    return { avatar: avatar, avatarType: 'emoji' };
  }
  if (
    !avatar ||
    avatar.length > 500 ||
    avatar.indexOf('cloud://') !== 0 ||
    avatar.indexOf('/community-avatars/') === -1
  ) {
    return null;
  }
  return { avatar: avatar, avatarType: 'wechat' };
}

async function isNicknameSafe(nickname, openid) {
  const checkResult = await cloud.openapi.security.msgSecCheck({
    content: nickname,
    version: 2,
    scene: 1,
    openid: openid
  });
  return !!(
    checkResult &&
    checkResult.result &&
    checkResult.result.suggest === 'pass'
  );
}

exports.main = async function(event) {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  if (!openid) return failure('IDENTITY_UNAVAILABLE', '暂时无法确认微信身份，请稍后再试');

  const input = event || {};
  const templateId = typeof input.templateId === 'string' ? input.templateId : '';
  const template = TEMPLATES[templateId];
  if (!template) return failure('INVALID_TEMPLATE', '分享句子无效，请重新选择');

  const rawStudySeconds = Number(input.todayStudySeconds);
  if (!Number.isInteger(rawStudySeconds) || rawStudySeconds < 0 || rawStudySeconds > MAX_STUDY_SECONDS) {
    return failure('INVALID_STUDY_TIME', '今日学习时长无效，请刷新后重试');
  }
  if (template.requiresStudy && rawStudySeconds < 60) {
    return failure('STUDY_TIME_REQUIRED', '再学习一会儿，就可以分享今日成果啦');
  }

  const nickname = normalizeNickname(input.nickname);
  if (!nickname) return failure('EMPTY_NICKNAME', '请先填写昵称');
  if (Array.from(nickname).length > MAX_NICKNAME_LENGTH) {
    return failure('NICKNAME_TOO_LONG', '昵称不能超过12个字');
  }

  const avatar = validateAvatar(input);
  if (!avatar) return failure('INVALID_AVATAR', '头像信息无效，请重新选择头像');

  try {
    const nicknameSafe = await isNicknameSafe(nickname, openid);
    if (!nicknameSafe) return failure('UNSAFE_NICKNAME', '昵称暂时无法用于公开展示，请修改后重试');

    const now = Date.now();
    const dayStart = getChinaDayStart(now);
    const recentResult = await db.collection(POSTS_COLLECTION)
      .where({ openid: openid, createdAt: _.gte(dayStart) })
      .orderBy('createdAt', 'desc')
      .limit(MAX_DAILY_POSTS)
      .get();
    const recentPosts = recentResult.data || [];

    if (recentPosts.length >= MAX_DAILY_POSTS) {
      return failure('DAILY_LIMIT_REACHED', '今天已经分享3次啦，明天再来吧');
    }
    if (recentPosts.length > 0) {
      const latestTime = getTime(recentPosts[0].createdAt);
      if (latestTime && now - latestTime < MIN_PUBLISH_INTERVAL_MS) {
        return failure('TOO_FREQUENT', '分享得太快了，请稍后再试');
      }
    }
    if (recentPosts.some(function(post) { return post.templateId === templateId; })) {
      return failure('DUPLICATE_TEMPLATE', '这句话今天已经分享过啦，换一句试试吧');
    }

    const content = renderTemplate(template, rawStudySeconds);
    const addResult = await db.collection(POSTS_COLLECTION).add({
      data: {
        openid: openid,
        nickname: nickname,
        avatar: avatar.avatar,
        avatarType: avatar.avatarType,
        templateId: templateId,
        content: content,
        todayStudySeconds: rawStudySeconds,
        usesStudyTime: !!template.requiresStudy,
        dataSource: 'local_device',
        status: 'visible',
        createdAt: db.serverDate(),
        updatedAt: db.serverDate()
      }
    });

    return {
      ok: true,
      post: {
        id: addResult._id,
        nickname: nickname,
        avatar: avatar.avatar,
        avatarType: avatar.avatarType,
        content: content,
        isMine: true,
        usesStudyTime: !!template.requiresStudy,
        dataSource: 'local_device'
      }
    };
  } catch (error) {
    console.error('publishCommunityPost failed:', error);
    return failure('SERVICE_UNAVAILABLE', '云端分享暂时不可用，请稍后再试');
  }
};
