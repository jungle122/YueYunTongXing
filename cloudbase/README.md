# CloudBase 媒体目录

`mediaAssets` 是绘本、音频、视频共用的媒体清单。小程序不直接读取该集合，而是通过 `getMediaAssets` 云函数取得私有存储文件的临时地址。

## 初始化

1. 在 CloudBase 控制台的文档数据库中新建集合 `mediaAssets`。
2. 将集合的数据权限设为“所有用户不可读写”。
3. 在集合管理中选择“导入”，上传 `mediaAssets.seed.jsonl`，文件格式仍选择 JSON。
4. 文件格式选择 JSON，首次导入选择 Insert；以后使用同一批 `_id` 更新时选择 Upsert。
5. 部署 `cloudfunctions/getMediaAssets`，选择“上传并部署：云端安装依赖”。

仅新增音频和视频时，可以导入 `mediaAssets.audio-video.insert.json`；首次使用 Insert，重复导入同一 `_id` 时使用 Upsert。

导入文件采用 JSON Lines 格式，每行是一个完整文档。File ID 可以放入数据库，但临时 HTTPS 地址不能入库；临时地址由云函数在用户打开页面时生成。

## 统一字段

- `mediaType`：`pictureBook`、`audio` 或 `video`
- `groupId`：媒体分组的稳定英文标识
- `title`：分组标题
- `coverFileID`：封面文件的 CloudBase File ID
- `sourceFileID`：可选的原始 PDF 或源文件 File ID，不直接返回给小程序
- `items`：分组内页面、音频或视频条目
- `sort`：显示顺序
- `enabled`：是否允许小程序读取

普通用户不能向云函数传入任意 File ID。云函数只解析 `mediaAssets` 中由管理员登记且 `enabled: true` 的文件。
