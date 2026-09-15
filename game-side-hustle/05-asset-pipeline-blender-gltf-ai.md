# 资产管线：Blender（3D 建模工具）、glTF/GLB（3D 模型格式）与 AI 素材

这篇文档回答：游戏不只有代码，2D、3D、音频、AI 生成和版权记录应该如何配套。

本文负责：

- 2D 资产工具
- 3D 资产工具
- Blender（3D 建模工具）和 glTF/GLB（3D 模型格式）在链路里的位置
- 音频和版权记录

## 资产管线

游戏不是只有代码。

最小资产类型：

- 图标
- 封面
- 背景
- 角色
- 道具
- UI 按钮
- 字体
- 音效
- 背景音乐
- 粒子
- 3D 模型（可在 Three.js、Unity、Godot、Cocos 中加载的立体模型）
- 动画

AI-first 资产流程：

```
占位资产
  |
  v
AI 生成草案
  |
  v
统一风格
  |
  v
压缩和格式转换
  |
  v
导入游戏
  |
  v
真机测试
  |
  v
版权记录
```

### 2D 资产工具

常用工具：

- Aseprite：像素图
- Photoshop / Photopea：图片编辑
- Figma：UI
- TexturePacker：图集
- Tiled：地图编辑
- Kenney：免费游戏素材

资料：

- https://www.aseprite.org/
- https://www.photopea.com/
- https://www.figma.com/
- https://www.mapeditor.org/
- https://kenney.nl/assets

### 3D 资产工具

常用工具：

- Blender（3D 建模工具）：建模、动画、导出 GLB（3D 模型单文件）
- Meshy：AI 3D 生成工具
- Tripo：AI 3D 生成
- Mixamo：角色动作
- Poly Haven：HDRI / 贴图 / 模型
- Khronos glTF Sample Assets：测试模型，用来确认你的加载器和导出流程是否正常

资料：

- https://www.blender.org/
- https://www.meshy.ai/
- https://www.tripo3d.ai/
- https://www.mixamo.com/
- https://polyhaven.com/
- https://github.com/KhronosGroup/glTF-Sample-Assets

### 音频资产

常用工具：

- Audacity：音频编辑
- Freesound：音效
- Bfxr / jsfxr：复古音效
- Suno / Udio：音乐草案，商用权要核对

资料：

- https://www.audacityteam.org/
- https://freesound.org/
- https://sfxr.me/

### 版权记录

每个项目建议维护：

```
assets/LICENSES.md
assets/sources.csv
```

记录：

- 文件名
- 来源 URL
- 许可证
- 是否可商用
- 是否需要署名
- 是否由 AI 生成
- prompt 或生成记录
- 是否做过人工修改

平台和客户最怕的问题之一不是代码，而是素材侵权。

## 资产预算

第一周不要追求“大而全”，要给每类资产设预算。

| 类型 | 第一周建议 | 验收重点 |
| --- | --- | --- |
| 图标 | 1 个 512x512，另准备 1024x1024 源文件 | 清晰，能代表玩法 |
| 封面 | 1-3 张横竖屏截图或合成图 | 不像占位图，英文标题可读 |
| 角色/道具 | 3-8 个核心物件 | 风格一致，尺寸统一 |
| 背景 | 1-2 个场景 | 不喧宾夺主，移动端不糊 |
| UI | 按钮、进度条、分数、结算页 | 可点击区域够大 |
| 音效 | 5-10 个短音效 | 点击、得分、失败、奖励有反馈 |
| 3D 模型 | 1-5 个低模 GLB（低面数 3D 模型单文件） | 面数、贴图、动画可控 |

资产预算的意义是限制 AI 发散。你不是在做美术作品集，而是在做可上线、可报价、可复用的游戏交付包。

## Blender（3D 建模工具）最小操作清单

如果你用 Three.js / Cocos / Unity / Godot 做轻 3D，Blender（3D 建模工具）第一阶段只需要掌握这些动作：

```
导入模型
删除无用物体、灯光、相机
统一尺寸和朝向
设置 origin
应用 transform
合并或精简材质
降低面数
压缩贴图
检查动画 action
导出 GLB（3D 模型单文件）
用 glTF viewer（3D 模型预览器）预览
导入游戏真机测试
```

常见问题：

- 模型太大：减面、压缩贴图（模型表面的图片）、删隐藏物体
- 材质丢失：检查是否使用 glTF（3D 模型交换格式）支持的 PBR（基于物理的材质模型）材质
- 动画没导出：检查 NLA track / action 是否正确
- 颜色不对：检查色彩空间、灯光、贴图（模型表面的图片）连接
- 手机卡顿：先降贴图和面数，再减少实时光照和后处理

## AI 资产生产 SOP

```
1. 先让 AI 生成 moodboard / 风格关键词
2. 生成少量核心资产，不要一次生成几十个
3. 统一色板、视角、线条粗细、材质风格
4. 人工筛选能商用、能压缩、能复用的资产
5. 用工具清理背景、裁切、命名、压缩
6. 导入游戏看真实效果
7. 记录来源、许可证、prompt 和修改记录
```

命名建议：

```
asset_type_name_variant.ext

button_play_primary.png
item_gem_blue_01.png
fx_hit_soft_01.ogg
model_crate_lowpoly_01.glb
```

不要把生成记录放脑子里。以后客户或平台问素材来源时，你需要能回答。

## 素材风险红线

这些素材不要用于商业 demo：

- 明显复刻知名游戏角色、UI、音效、地图或商标
- 从其他小游戏里直接扒图、扒音频、扒模型
- 来源页面没有 license 或 license 不允许商用
- AI 生成结果长得像知名 IP
- 带水印、平台 logo、素材站预览标记
- 不知道来源的“网盘素材包”
- 客户给素材但不愿意确认版权责任

建议在每个项目保留一份记录：

```
file,path,source_url,license,commercial_use,attribution_required,ai_generated,prompt,modified_by_human,notes
button_play_primary.png,assets/images/button_play_primary.png,self-made,owned,yes,no,no,,yes,
model_crate_lowpoly_01.glb,assets/models/model_crate_lowpoly_01.glb,https://example.com,CC0,yes,no,no,,yes,decimated in Blender
```

如果无法证明可商用，就不要把它放进客户交付包。
