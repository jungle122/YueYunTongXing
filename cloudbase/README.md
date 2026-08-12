# CloudBase 媒体目录

`mediaAssets` 是绘本、音频、视频共用的媒体清单。小程序不直接读取该集合，而是通过 `getMediaAssets` 云函数取得私有存储文件的临时地址。

## 初始化

1. 在 CloudBase 控制台的文档数据库中新建集合 `mediaAssets`。
2. 将集合的数据权限设为“所有用户不可读写”。
3. 在集合管理中选择“导入”，上传 `mediaAssets.seed.jsonl`，文件格式仍选择 JSON。
4. 文件格式选择 JSON，首次导入选择 Insert；以后使用同一批 `_id` 更新时选择 Upsert。
5. 部署 `cloudfunctions/getMediaAssets`，选择“上传并部署：云端安装依赖”。

仅新增音频和视频时，可以导入 `mediaAssets.audio-video.insert.json`；首次使用 Insert，重复导入同一 `_id` 时使用 Upsert。

游戏童谣使用同一个 `audio-lessons` 清单，但不会显示在音频学习列表。上传到 `media/audio/` 时按以下名称保存：

- `song24.m4a`：有只雀仔跌落水
- `song25.m4a`：点虫虫
- `song26.m4a`：排排坐
- `song27.m4a`：打开蚊帐
- `song28.m4a`：鸡公仔

如需替换现有《落雨大》，覆盖 `media/audio/song19.m4a`。上传完成后，以 Upsert 模式导入仅包含音频记录的 `mediaAssets.audio-lessons.upsert.json`，不要为这次操作导入视频清单。

导入文件采用 JSON Lines 格式，每行是一个完整文档。File ID 可以放入数据库，但临时 HTTPS 地址不能入库；临时地址由云函数在用户打开页面时生成。

## 统一字段

- `mediaType`：`pictureBook`、`audio` 或 `video`
- `groupId`：媒体分组的稳定英文标识
- `title`：分组标题
- `coverFileID`：封面文件的 CloudBase File ID
- `sourceFileID`：可选的原始 PDF 或源文件 File ID，不直接返回给小程序
- `items`：分组内页面、音频或视频条目
- `items[].posterFileID`：视频条目的私有云存储封面 File ID；由云函数转换为临时 `posterUrl`
- `sort`：显示顺序
- `enabled`：是否允许小程序读取

普通用户不能向云函数传入任意 File ID。云函数只解析 `mediaAssets` 中由管理员登记且 `enabled: true` 的文件。

## 视频封面迁移

1. 在私有云存储中新建目录 `media/video/covers/`。
2. 将 `video1.png`～`video10.png` 以及 `video11.jpg`～`video18.jpg` 上传到该目录，云端文件名保持不变。
3. 向 `mediaAssets` 集合导入 `mediaAssets.video-covers.upsert.json`，导入模式选择 Upsert。
4. 重新部署 `getMediaAssets` 云函数，选择“上传并部署：云端安装依赖”。
5. 真机确认 18 张封面和 18 个视频都能正常加载。

封面与视频一样保持私有；小程序只使用 `getMediaAssets` 返回的临时地址，不配置公开读取规则。

## 云端成长分享墙

互动社区的自由留言已改为固定模板分享。动态正文由云函数根据模板编号生成，前端不能提交任意正文、OpenID、状态或发布时间。

### 微信身份与角色资料

1. 在文档数据库中新建集合 `userProfiles`。
2. 将集合的数据权限设为“所有用户不可读写”，仅允许 `userProfile` 云函数访问。
3. 部署 `cloudfunctions/userProfile`，选择“上传并部署：云端安装依赖”。
4. `userProfile/config.json` 声明了昵称文本安全检测所需的 `security.msgSecCheck` 云调用权限，部署时不要漏掉该文件。

`userProfile` 从云函数微信上下文取得 OpenID，前端不能指定账号。昵称和头像仅作为可修改的角色资料；贴纸头像保存白名单本地路径，微信头像仍保存私有云存储 File ID。旧的本机昵称账号会在首次启动时绑定到当前微信身份，并复制原用户前缀下的本地数据作为兼容迁移。

### 学习数据同步

1. 在文档数据库中新建集合 `userLearningData`。
2. 将集合的数据权限设为“所有用户不可读写”，仅允许 `userLearningData` 云函数访问。
3. 部署 `cloudfunctions/userLearningData`，选择“上传并部署：云端安装依赖”。

客户端以当前微信身份为边界，同步学习历史、音频/文章进度、音频/视频/文章/绘本收藏、打卡和社区发布次数。亲子录音文件体积较大且涉及用户声音，仍只保存在本机，不进入该同步快照。旧版全局学习数据会在首次绑定微信身份时复制到新的用户专属本地键，再上传云端。

### 初始化 `communityPosts`

1. 在文档数据库中新建集合 `communityPosts`。
2. 将集合的数据权限设为“所有用户不可读写”，小程序仅通过云函数访问。
3. 新建组合索引 `openid + createdAt`，其中 `openid` 升序、`createdAt` 降序。
4. 新建组合索引 `status + createdAt`，其中 `status` 升序、`createdAt` 降序。
5. 部署以下云函数，均选择“上传并部署：云端安装依赖”：
   - `publishCommunityPost`
   - `listCommunityPosts`
   - `deleteMyCommunityPost`
6. `publishCommunityPost/config.json` 声明了昵称文本安全检测所需的 `security.msgSecCheck` 云调用权限，部署时不要漏掉该文件。

### 身份和头像

- 动态归属使用云函数微信上下文中的 OpenID，前端不能指定。
- 展示昵称沿用登录页中用户填写的昵称，云函数限制为 1～12 个字并进行内容安全检测。
- 登录页内置的 7 张贴纸头像保存在小程序本地包中，动态记录只保存经过白名单校验的本地资源路径，不上传重复图片。
- 历史 Emoji 头像仍可正常展示和发布。
- “使用微信头像”取得的是本机临时路径。用户第一次发布时，小程序会将头像上传到私有云存储的 `community-avatars/` 目录，数据库只保存 File ID。
- `listCommunityPosts` 通过云函数为头像生成临时地址；不要把头像目录改成公开读取。
- 需要在云存储权限中允许已登录的小程序用户向 `community-avatars/` 上传文件，同时保持该目录不可被客户端直接公开读取。

### 发布规则

- 每个微信用户两次发布至少间隔30秒。
- 每个微信用户每天最多发布3条。
- 同一个模板同一天只能发布一次。
- 带时长的句子使用当前手机 `learningHistory` 的今日时长快照，记录会标注 `dataSource: local_device`，不能作为权威排行榜或奖励依据。
- 用户只能软删除自己的动态；管理员可在控制台将异常记录的 `status` 改为 `hidden`。

原来的本机自由留言不迁移到云端。每日打卡和成就仍保存在本机，页面已明确标注；原本不真实的本机角色排行榜暂不展示。
