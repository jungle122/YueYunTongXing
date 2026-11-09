# 学习天地素材搭配与原创剧场局部细化

本轮：学习天地切换 A，保留精修抠图和足迹样式；原创剧场移除手册标题撕纸，其他不变。before-no-note.html 与对应 CSS 保留贴片版本。

最新选择为 A 横向手账：index.html 是当前学习天地；before-layout-a.html 保留切换前的精修 C。preview.html 展示两页前后对照，variants-comparison.html 保留三套探索。refine-cutout.py 仅用人工描边透明蒙版清理科普素材，不改变原图 RGB。学习足迹改为正文文楷及现有 Phosphor 脚印图标，删除进度条。

原创剧场恢复 A 矩形拼图；before-paper.html 保留相片框与琥珀版。paper-refinement.css 将胶卷中央改为全局同款纸纹和稍深米色底，无渐变。title-paper.png 仅裁切既有浅色撕纸，为手册标题衬底。check-refined.cjs 检查两页三种宽度和入口、完成状态。

当前入口：preview.html。三套学习天地以相同手机尺寸及学习状态比较；旧版仍在 ../paper-global/learn.html，未覆盖。只有选定后再更新统一导航中的学习天地。

- A 横向手账：图 5 粉色卷轴磁带、图 7 蓝纸、图 10 浅色撕纸；图 1 科普素材。
- B 双页便笺：图 4 米白磁带、图 9 回形针纸、图 7 蓝纸；图 1 科普素材。
- C 错落叠纸：图 3 透明磁带、图 9 回形针纸、图 6 胶带方格纸、图 7 蓝纸；图 1 科普素材。
- 新增素材只经 Pillow 透明通道处理、边缘连通背景去除、裁切及旋转。未调用生成式图像工具，未重绘插画。原附件不变；具体映射见 sources.json。
- 学习数量和入口沿用 ../paper-global/learn.js，支持首次、已有记录、全部完成三种原型状态。仍为演示数据。
- 原创剧场的图 11 相片框清除白底和中间黑色照片，原 A 六块内页拼图嵌入透明窗口；中央琥珀色在胶卷素材下方单独一层，避开外框和齿孔。旧版 before-material.html 配套独立 CSS，保留调整前外观。
- 播放图标：Phosphor Light play-circle-light，原 SVG 完整使用，MIT。https://github.com/phosphor-icons/core/blob/main/assets/light/play-circle-light.svg
- 马善政：官方 Google Fonts 源 https://github.com/google/fonts/blob/main/ofl/mashanzheng/MaShanZheng-Regular.ttf 。原有字库缺少“课、程、册”，本轮仅为原创剧场补入 14 KB 标题子集，仍为同一字体，不改变其他页。OFL 保存在 assets/MASHANZHENG-OFL.txt。
- check.cjs 验证 320、390、430 宽度、图片加载、两个学习入口、完成数量和原创三个入口。comparison.png 为同尺寸前后与三方案预览。

本轮只改原型，正式小程序未动。用户参考素材的原始出处和许可状态沿用来源记录，不擅自标为免费商用。