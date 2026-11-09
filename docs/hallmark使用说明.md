# Hallmark 使用说明

## 已安装内容

- 安装日期：2026-10-27。
- 来源：https://github.com/Nutlope/hallmark
- 固定来源提交：`7ec868225c6caa040558c321ee0fefa0e73f83a8`。
- Skill 版本：`2.0.0`。
- 项目级位置：`.agents/skills/hallmark/`，入口为 `SKILL.md`。
- 原始 skill、参考资料、48 个主题、脚本、Codex 元数据及 MIT LICENSE 一并保留。
- 使用 Codex 内置 skill-installer 的 GitHub 安装脚本下载，没有运行第三方安装器或安装全局包。
- `.agents` 已加入 `project.config.json` 的打包忽略列表。
- 项目原有 `.gitignore` 已忽略 `.agents/`，本次保留该规则。因此安装在本机项目目录生效，不会随普通 Git 提交同步到其他电脑。

Hallmark 是给编码助手使用的 skill：一套设计流程、参考资料和检查脚本。它不是小程序组件库，也不提供新的模型。本项目用它辅助制作和评审浏览器原型，再将确认后的设计落实到微信原生页面。

## 如何调用

下一轮消息即可尝试使用 `$hallmark`；也可以直接说“使用 Hallmark……”。若未出现在可选技能列表，重启 Codex 后重新打开本项目。安装文件和脚本已验证；安装时没有通过桌面技能选择器确认展示状态。

`$hallmark` 写在聊天输入框，不是 PowerShell 命令。后面的中文说明就是任务要求。

### 先分析现状

```text
$hallmark 请评审当前小程序的首页、学习入口和播放器。
结合现有页面代码、仓库截图和下面的文创素材目录，列出最需要改的五个问题，说明设计依据；暂不改代码。
素材目录：C:\Users\14740\Desktop\粤韵童行\文创整合
这是微信原生小程序，网页专用规则请说明适用边界。
```

### 先做可交互原型（推荐）

```text
$hallmark 为“粤语童谣时光屋”制作 custom 定制设计的手机可点击原型。
先浏览素材目录：C:\Users\14740\Desktop\粤韵童行\文创整合
面向儿童及陪伴使用的家长，以阿霖和粤语童谣为线索，亲切、有趣、易读。
以项目方素材为主要视觉依据，允许使用提供的插画；不要套用营销落地页结构。
先给两个首页视觉方向及选择理由，让我选定方向后再完成原型。
核心任务：首页进入童谣列表，选择《月光光》，播放、暂停、收藏、查看歌词并返回。
原型放在 prototypes/hallmark/，不修改 pages、components 和云函数。
模拟的播放、录音或数据必须说明。按钮要有真实的原型交互反馈。
说明推荐素材、设计规则及验收任务；先验证原型，再迁移到小程序。
```

### 评审已有网页原型

```text
$hallmark audit ./prototypes/hallmark/index.html
重点检查手机阅读、操作反馈、儿童能否识别入口和素材风格一致性，只报告问题。
```

此示例中的原型文件尚未创建。`audit` 是 Hallmark 的任务指令，不是已经执行的检查。

### 确认原型后再改小程序

```text
使用 Hallmark，按已确认的 prototypes/hallmark 原型重构小程序首页和播放器。
先明确要修改的文件及网页交互如何对应微信原生组件，再落实代码。
保留现有业务功能，验证导航、播放、收藏和录音权限状态。
```

## 文创素材盘点

实际文件集中在给定目录的 `文创、` 子目录。递归统计为 67 张图片：40 PNG、25 JPEG、2 JPG；这是文件数，尚未去重。

| 内容 | 后续设计用途建议 |
| --- | --- |
| 阿霖 IP 形象、三视图、板绘风三视图 | 比较角色风格，选定统一的形象依据 |
| 粤剧小学徒、舞狮队的小淘气、龙舟小鼓手、尾巴伞四张插画 | 场景入口、内容配图、主题活动参考 |
| 四张海报 | 参考配色和构图，避免整张缩小后文字难读 |
| 两组表情包 | 筛选用于完成反馈、引导或空状态，先检查重复和清晰度 |
| 冰箱贴、扇面、抱枕、笔记本等周边效果图 | 作为视觉参考，区分产品展示图和可直接使用的平面素材 |

已抽看板绘风三视图、粤剧小学徒插画及笔记本内页效果图，部分图片带“AI生成”标识。因此不能把整个目录认定为纯手绘素材；后续逐张选择并保留来源说明。当前没有编辑、搬移、去除标识或把这些素材批量复制进小程序。

## 检查方式与边界

安装验证已通过：99 份参考文件的引用检查、48 个主题校验，以及 sloplint CLI 帮助命令。

在项目根目录运行引用检查：

```powershell
node .agents/skills/hallmark/scripts/refcheck.mjs --errors
```

网页原型创建后，可运行静态检查：

```powershell
node .agents/skills/hallmark/scripts/sloplint.mjs ./prototypes/hallmark --scope app
```

浏览器检查加 `--render`，需要 Puppeteer/Puppeteer Core 和可用的 Chrome/Chromium。本次调用渲染模块做依赖探测，返回 `no puppeteer-core found locally, globally or via HALLMARK_PUPPETEER`，因此当前未具备该脚本的浏览器检查依赖，未执行页面渲染检查，也未安装全局包。需要时可通过 `CHROME_PATH` 指定浏览器，通过 `HALLMARK_PUPPETEER` 指定依赖所在根目录。安装 skill 不等于已完成网页渲染检查。

sloplint 面向 HTML/CSS 和部分网页框架文件，不直接支持 WXML/WXSS。小程序仍需微信开发者工具和真机验证，不能把网页检查结果当成小程序通过验收。

## 资料

- Hallmark：https://github.com/Nutlope/hallmark
- Codex skill 发现和调用规则：https://learn.chatgpt.com/docs/build-skills

后续更新时先确认新版本变化，不直接覆盖本地修改。本次安装未创建 Git 提交。
