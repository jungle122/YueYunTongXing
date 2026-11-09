# 原创剧场原型

当前选定 A：index.html 使用 A 的拼图，selected.css 对齐学习天地的实际标题样式；播放键改为官方 Phosphor Regular play-circle 完整 SVG（MIT），不再叠加 CSS 圆圈。preview.html 为调整前后对比，before-selected.html 保留上一版 A，collage-comparison.html 保留三方案。学习天地及正式页面未修改。本轮未生成或重绘插画。

2026-11-06 当前：preview.html 展示三套素材拼贴细节方案，等待选择。collage.html?v=a|b|c 共用一套模板、collage.css 和 original.js，不改已确认页面或正式小程序。before-collage.html 保留本轮修改前版本，index.html 也保持原样。

- A 规整拼图：六块大小错落的绘本内页，薄纸托底。
- B 错落拼贴：不规则外轮廓、回形针与手册便笺。
- C 夹页便笺：蓝灰衬纸和铜色回形针组织绘本画面。
- 图 1 胶卷、图 5 书堆、图 7 回形针经 imagegen 编辑为透明 PNG；属于参考图加工输出，非逐像素无损裁切。原始来源及授权未核实，不标为商用授权。
- 绘本内页：static/picture-books/dangdang/page3、page5；moonlight/page3、page5；look/page3、page5。由 CSS 裁切展示，原图未改。
- check-collage.cjs 检查三方案在 320、390、430 宽度下的溢出、图片加载、三个入口及手册重试。视频/绘本入口目前仍是演示弹窗，不代表列表页已经完成。

以下为上一轮记录：

index.html 是当前三段布局细化版；before.html 保留用户截图对应的旧版。preview.html 同为 390×844 可交互对比，也可切换 320/430。
refined.css 仅覆盖本轮细节，original.css 与 original.js 继续共用；此前 variants.html 三个探索版本保留，不是当前选择。
书册实际使用 assets/notebook.png，作者 Vijay Verma，3dicons V1，CC0；CSS 色相与饱和度适配，未重画。sources.json 仍保留三方案素材来源，当前页仅引用其中书册。
视频入口、绘本集合入口和课程手册入口功能保留。手册为加载及重试演示，未连接云服务；不改正式小程序，不进入下一页。
