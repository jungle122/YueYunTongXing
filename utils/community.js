var TEMPLATE_GROUPS = [
  {
    id: 'achievement',
    title: '今日成果',
    icon: '🌟',
    templates: [
      { id: 'study_great', text: '今天我学习了{minutesText}，我真是太棒啦！', requiresStudy: true },
      { id: 'study_energy', text: '今日粤语能量 +{minutes}，继续努力！', requiresStudy: true },
      { id: 'study_closer', text: '我又坚持学习了{minutesText}，离目标更近一步！', requiresStudy: true },
      { id: 'study_praise', text: '今天认真学习了{minutesText}，给自己点个赞！', requiresStudy: true },
      { id: 'study_progress', text: '小小进步也是进步，我今天学习了{minutesText}！', requiresStudy: true },
      { id: 'study_happy', text: '今日学习任务完成，共{minutesText}，开心！', requiresStudy: true }
    ]
  },
  {
    id: 'mood',
    title: '学习心情',
    icon: '😊',
    templates: [
      { id: 'mood_fun', text: '今天学得很开心，粤语越来越有趣啦！' },
      { id: 'mood_progress', text: '我发现自己又进步了一点，真开心！' },
      { id: 'mood_challenge', text: '今天遇到了一点难题，但我不会放弃！' },
      { id: 'mood_learned', text: '今天又学到了新内容，收获满满！' },
      { id: 'mood_better', text: '慢慢学、天天学，我一定会越来越棒！' }
    ]
  },
  {
    id: 'encourage',
    title: '鼓励伙伴',
    icon: '🤝',
    templates: [
      { id: 'encourage_together', text: '小伙伴们一起加油，坚持就会有收获！' },
      { id: 'encourage_checkin', text: '谁也在学习呀？我们一起打卡吧！' },
      { id: 'encourage_step', text: '每天进步一点点，就是很棒的成长！' },
      { id: 'encourage_company', text: '学习路上有大家陪伴，真开心！' }
    ]
  },
  {
    id: 'goal',
    title: '明日目标',
    icon: '🌱',
    templates: [
      { id: 'goal_continue', text: '明天我还要继续学习，保持好习惯！' },
      { id: 'goal_one_more_day', text: '我的下一个目标是再坚持一天！' },
      { id: 'goal_forward', text: '今天完成小目标，明天继续向前！' },
      { id: 'goal_longer', text: '我准备挑战更长的学习时间，加油！' }
    ]
  }
];

function parseHistory(value) {
  try {
    var parsed = Array.isArray(value) ? value : JSON.parse(value || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('解析学习历史失败:', error);
    return [];
  }
}

function getLearningStats() {
  var history = parseHistory(wx.getStorageSync('learningHistory') || '[]');
  var now = new Date();
  var todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  var tomorrowStart = todayStart + 24 * 60 * 60 * 1000;
  var todaySeconds = 0;
  var totalSeconds = 0;

  history.forEach(function(item) {
    var seconds = Math.max(0, Number(item && item.duration) || 0);
    totalSeconds += seconds;
    var timestamp = new Date(item && item.timestamp).getTime();
    if (timestamp >= todayStart && timestamp < tomorrowStart) {
      todaySeconds += seconds;
    }
  });

  todaySeconds = Math.floor(todaySeconds);
  totalSeconds = Math.floor(totalSeconds);
  return {
    todaySeconds: todaySeconds,
    todayMinutes: Math.floor(todaySeconds / 60),
    totalSeconds: totalSeconds,
    totalMinutes: Math.floor(totalSeconds / 60)
  };
}

function findTemplate(templateId) {
  for (var groupIndex = 0; groupIndex < TEMPLATE_GROUPS.length; groupIndex += 1) {
    var templates = TEMPLATE_GROUPS[groupIndex].templates;
    for (var templateIndex = 0; templateIndex < templates.length; templateIndex += 1) {
      if (templates[templateIndex].id === templateId) return templates[templateIndex];
    }
  }
  return null;
}

function renderTemplate(templateId, todaySeconds) {
  var template = findTemplate(templateId);
  if (!template) return '';
  var minutes = Math.floor(Math.max(0, Number(todaySeconds) || 0) / 60);
  if (template.requiresStudy && minutes < 1) return '';
  return template.text
    .replace(/\{minutesText\}/g, minutes + '分钟')
    .replace(/\{minutes\}/g, String(minutes));
}

function getTemplateGroups(todaySeconds) {
  var hasStudy = Math.floor(Math.max(0, Number(todaySeconds) || 0) / 60) >= 1;
  return TEMPLATE_GROUPS.map(function(group) {
    return {
      id: group.id,
      title: group.title,
      icon: group.icon,
      templates: group.templates.map(function(template) {
        return {
          id: template.id,
          text: renderTemplate(template.id, todaySeconds) || template.text.replace(/\{minutesText\}/g, '今日学习时长').replace(/\{minutes\}/g, '今日分钟数'),
          disabled: !!template.requiresStudy && !hasStudy
        };
      })
    };
  });
}

module.exports = {
  getLearningStats: getLearningStats,
  getTemplateGroups: getTemplateGroups,
  findTemplate: findTemplate,
  renderTemplate: renderTemplate
};
