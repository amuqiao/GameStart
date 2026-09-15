# 游戏技术栈地图

这篇文档回答：不同游戏技术栈分别解决什么问题，以及如何按渠道和游戏形态倒推选择。

本文负责：

- 技术栈分层
- Phaser、PixiJS、Three.js、Blender（3D 建模工具）、glTF/GLB（3D 模型格式）、Cocos、Unity、Godot
- 技术栈选择决策树
- 第一款游戏方向建议

## 技术栈怎么理解

游戏技术栈不是单选题，而是几层东西叠在一起。

```
语言层：JavaScript / TypeScript / C# / GDScript
渲染层：DOM / Canvas 2D / WebGL / WebGPU
游戏框架：Phaser / PixiJS / Three.js / Cocos Creator / Unity / Godot
资产工具：Blender / Aseprite / Tiled / TexturePacker / Audacity
构建工具：Vite / npm / pnpm / Webpack / engine exporter
平台 SDK：CrazyGames SDK / Poki SDK / MRAID / Telegram SDK / Discord SDK
后端服务：FastAPI / Django / Supabase / Firebase / 自建 API
数据分析：PostHog / GA4 / 平台 analytics / 自建 event log
```

这张分层图里的关键术语：

- `Canvas 2D`（浏览器 2D 绘图画布）：用于画普通 2D 游戏画面。
- `WebGL / WebGPU`（浏览器高性能图形渲染能力）：常用于 3D 或高性能 2D。
- `SDK`（平台开发包）：平台给你的开发包，用来接广告、存档、排行榜、支付等能力。
- `MRAID`（广告容器交互接口）：Playable Ads（可试玩广告）常用它打开落地页或调用广告平台能力。
- `analytics / event log`（数据事件记录）：用来知道玩家是否开始游戏、失败、通关、点击按钮。

所以你问“技术栈是通用的吗”，答案是：

```
底层能力有通用部分
平台接入不通用
资产规范半通用
打包和审核规则不通用
```

通用的部分：

- HTML / CSS / JavaScript / TypeScript
- Canvas（2D 画布） / WebGL（浏览器图形渲染）基础
- 游戏循环
- 状态机
- 输入处理
- 音频解锁
- 移动端适配
- 资源加载
- FPS（每秒帧数） / 包体优化
- GitHub / CI / 静态托管

不通用的部分：

- 广告 SDK（广告接口开发包）
- IAP（应用内购买） / 支付
- 排行榜
- 存档
- 用户身份
- 平台生命周期
- 包体限制
- 外链限制
- 审核政策
- 收入结算方式

因此正确工程结构应该是：

```
src/
  game/
    core/
    scenes/
    systems/
    assets/
  platform/
    PlatformAdapter.ts
    adapters/
      web.ts
      crazygames.ts
      poki.ts
      mraid.ts
      telegram.ts
      discord.ts
  build/
    targets/
      web/
      crazygames/
      playable-ad/
      telegram/
```

核心原则：

```
游戏核心尽量稳定
渠道差异放进 PlatformAdapter
构建差异放进 BuildPipeline
素材差异放进 AssetPipeline
```

这里的 `PlatformAdapter`（平台适配层）、`BuildPipeline`（构建管线）、`AssetPipeline`（资产管线）的作用，是把“游戏本身”和“不同平台的特殊要求”分开。

## 五步看懂任何游戏技术栈

看到一个新框架或引擎，不要先背 API，先问五个问题：

| 问题 | 你要判断什么 |
| --- | --- |
| 它怎么画画面 | DOM、Canvas 2D（2D 画布）、WebGL/WebGPU（浏览器图形渲染）、原生渲染 |
| 它怎么组织游戏 | Scene（场景）、Entity（游戏对象）、Component（组件）、Node（节点）、Prefab（预制对象模板）、Script（脚本） |
| 它怎么处理时间 | `requestAnimationFrame`、引擎 loop、delta time、暂停恢复 |
| 它怎么处理资产 | 预加载、图集、音频、字体、GLB（3D 模型单文件）、压缩、远程资源 |
| 它怎么发布 | 静态 Web、ZIP（压缩包）、单 HTML（单文件广告包）、WebGL（浏览器运行版本）、小游戏包、App 包 |

不管框架名字怎么变，你都要看它如何处理 `input`、`update`、`render` 和 `lifecycle`。这四件事决定游戏是否真的能玩，而不只是能打开页面。

技术栈选择不是“哪个最强”，而是：

```
目标平台允许什么
目标玩法需要什么
AI 能稳定生成什么
你能验收什么
包体和性能扛不扛得住
```

## AI-first 组合推荐

| 目标 | 推荐组合 | 原因 |
| --- | --- | --- |
| 第一款 2D H5 | Phaser + TypeScript + Vite | 游戏框架完整，AI 生成稳定，适合 Web 平台 |
| 极轻 Playable Ads（可试玩广告） | 原生 JS / PixiJS + 单 HTML 构建 | 包体小，方便内联和压缩 |
| 视觉差异化 3D Demo | Three.js + TypeScript + Vite + Blender（3D 建模工具）/ GLB（3D 模型单文件） | AI 能快速搭场景，GLB（3D 模型单文件）资产链路通用 |
| 国内小游戏第二阶段 | Cocos Creator + TypeScript | 小游戏生态和多端发布更成熟 |
| 客户指定 Unity | Unity + C# + WebGL（浏览器运行版本）/ App build（应用打包） | 客户认知高，商业项目常见 |
| 开源独立游戏学习 | Godot + GDScript | 引擎轻，适合理解完整游戏工程 |

第一周只需要主攻一个组合，其他组合只做概念了解。

## 第一周默认选择

如果没有强约束，第一周默认：

```
Phaser + TypeScript + Vite
```

原因：

- 适合 2D H5 小游戏
- 有 Scene（场景）、Input（输入）、Sound（声音）、Loader（资源加载）、Physics（物理）
- AI 生成稳定
- Web 平台和静态托管友好
- 比 Unity / Cocos / Godot 的导出链路轻
- 比纯 Three.js 更少手写游戏系统

什么时候改选 Three.js：

```
3D 视觉本身就是卖点
玩法不依赖复杂物理
模型数量少
你能控制 GLB（3D 模型单文件）和贴图预算
目标是广告试玩或视觉差异化 demo
```

什么时候改选原生 JS / PixiJS：

```
目标是极轻 playable ads
包体必须极小
玩法是点击、拖拽、合成、简单 UI 动效
```

什么时候第一周不要优先选：

| 技术栈 | 暂不优先的原因 |
| --- | --- |
| Unity | WebGL（浏览器图形渲染）包体和加载链路更重，适合客户指定或中长期产品 |
| Godot | Web 导出和平台 SDK（平台开发包）生态要先验证，适合学习引擎或独立游戏 |
| Cocos Creator | 国内小游戏生态强，但账号、审核、构建链路比纯 H5 重 |
| 复杂 Three.js + 物理 | AI 能写代码，但调手感、碰撞和性能会吃掉第一周 |

这个默认选择不是否定其他技术栈，而是为了最快打通商业链路。

## 主流技术栈地图

### 原生 HTML / CSS / JS

适合：

- 超轻量点击游戏
- 益智小游戏
- Playable Ads（可试玩广告）
- 单文件广告试玩
- 很小的互动落地页

优点：

- 包体小
- AI 生成稳定
- 没有引擎学习成本
- 容易压缩成单 HTML

缺点：

- 复杂动画、粒子、碰撞、场景管理要自己组织
- 项目一复杂就容易变乱

典型用途：

```
2048
反应点击
滑动拼图
简单合成
广告试玩 Demo
```

推荐定位：

```
Playable Ads（可试玩广告）和极轻 H5（HTML5 网页游戏）的第一选择
不是复杂游戏长期维护的第一选择
```

### Phaser

Phaser 是 Web 2D 游戏框架。这里的 Web 2D 指“在浏览器里运行的二维游戏”，比如消除、跑酷、接物、排序。

适合：

- 2D 休闲游戏
- 跑酷
- 消除
- 弹球
- 物理小游戏
- 平台跳跃
- Web 游戏平台投稿

你可以把 Phaser 理解成：

```
React 负责组织页面组件
Phaser 负责组织游戏场景、精灵、动画、碰撞、输入和音频
```

Phaser 提供：

- 场景 `Scene`：菜单、游玩、结算等不同游戏页面
- 精灵 `Sprite`：2D 图片对象，比如玩家、敌人、道具
- 动画 `Animation`：帧动画或补间动画
- 输入 `Input`：触摸、鼠标、键盘
- 物理 `Arcade Physics / Matter`：碰撞、重力、速度、反弹等规则
- 音频
- 资源加载
- 摄像机
- 粒子

推荐用途：

```
第一批 2D 商业验证游戏
CrazyGames / Yandex / GameDistribution 等 Web 游戏平台
可被 AI 快速生成和维护的 2D 游戏
```

注意：

- Phaser 不是 3D 引擎
- 复杂 UI 可以配合 DOM 或独立 UI 层
- 移动端要重点测触摸、横竖屏、音频解锁和 FPS（每秒帧数）

官方资料：

- https://phaser.io/
- https://docs.phaser.io/
- https://github.com/phaserjs/phaser
- https://github.com/phaserjs/examples

### PixiJS

PixiJS 更像高性能 2D 渲染库，不是完整游戏引擎。

适合：

- 2D 动效
- 粒子
- 视觉表现强的轻游戏
- 自己掌控游戏结构
- 广告试玩

优点：

- 渲染强
- 比完整引擎更轻
- 适合做高质感 2D 互动

缺点：

- 碰撞、关卡、状态管理需要自己组织
- 对新手来说，需要更强工程约束

推荐定位：

```
当你已经有清晰 GameCore（游戏核心逻辑）和状态机时，用 PixiJS 做精致 2D 表现
```

官方资料：

- https://pixijs.com/
- https://github.com/pixijs/pixijs

### Three.js

Three.js 是 Web 3D 渲染库，不是完整游戏引擎。

但在 AI-first 工作流里，它的价值被重新放大了。

原因不是 Three.js 变成了游戏引擎，而是：

```
AI 可以快速生成：
  - 场景搭建
  - 相机控制
  - glTF（3D 模型交换格式）加载
  - 点击交互
  - 简单物理
  - shader（着色器，控制材质和画面效果）草案
  - 后处理
  - 移动端适配
  - 资产压缩脚本
```

过去一个人手写 Three.js 游戏系统成本很高，现在可以通过 AI 把实现成本压低。

但你仍然要负责验收：

- 是否稳定 60 FPS / 30 FPS（每秒帧数）
- 是否手机端发热和掉帧
- 模型面数是否过高
- 贴图是否过大
- 是否加载过慢
- 是否触摸交互可靠
- 是否符合平台包体限制
- 是否适配横竖屏

Three.js 适合：

- 轻 3D 小游戏
- 3D 展示型互动
- 角色/产品展示
- 广告试玩
- 物理感不重的 3D 玩法
- WebGL（浏览器图形渲染）视觉差异化 Demo

不适合第一周硬做：

- 大型开放世界
- 复杂联网 3D 对战
- 重物理沙盒
- 多角色复杂动画系统

推荐组合：

```
Three.js + Vite + TypeScript
Three.js + glTF/GLB（3D 模型格式） + Blender
Three.js + Rapier / Cannon-es / Ammo.js
Three.js + GSAP
Three.js + lil-gui / tweakpane
Three.js + stats.js
```

React 项目可考虑：

```
React Three Fiber + drei
```

但如果目标是单个 HTML5 游戏或广告试玩，React 不一定必要。

官方资料：

- https://threejs.org/
- https://threejs.org/docs/
- https://threejs.org/manual/
- https://github.com/mrdoob/three.js/
- https://docs.pmnd.rs/react-three-fiber/getting-started/introduction
- https://github.com/pmndrs/react-three-fiber

### Blender（3D 建模工具）

Blender（3D 建模工具）是 3D 内容创作工具，不是游戏引擎的主要运行时选择。

它在你的副业链路里非常重要，因为它解决：

- 建模
- 材质
- 动画
- 骨骼
- 贴图
- 灯光预览
- 资产检查
- glTF / GLB（3D 模型格式）导出
- 模型简化
- UV 整理

Blender（3D 建模工具）在 AI-first 流程里的位置：

```
AI 生成概念图 / 贴图 / 模型草案
        |
        v
Blender 清理、修面、减面、调材质、导出 GLB（3D 模型单文件）
        |
        v
Three.js / Cocos / Unity / Godot 加载运行
```

你不需要第一周精通 Blender（3D 建模工具），但要知道几个动作：

- 导入模型
- 删除无用物体
- 设置原点
- 调整尺寸和坐标轴
- 合并材质
- 压缩贴图
- 降低面数
- 导出 glTF / GLB（3D 模型格式）
- 检查动画是否随模型导出

推荐用途：

```
Three.js 轻 3D 游戏
角色展示
产品展示
广告试玩 3D 素材
Unity / Godot / Cocos 的通用 3D 资产准备
```

官方资料：

- https://www.blender.org/
- https://docs.blender.org/manual/en/latest/
- https://docs.blender.org/manual/en/latest/addons/import_export/scene_gltf2.html

### glTF / GLB（3D 模型格式）

glTF / GLB（3D 模型格式）是 Web 3D 和实时 3D 常用资产格式。你可以把 glTF 理解成 3D 模型的交换格式，把 GLB 理解成更方便传输的单文件版本。

你可以把它理解为：

```
PNG/JPG 是图片交付格式
MP3/OGG 是音频交付格式
GLB 是 3D 模型交付格式
```

glTF 通常由多个文件组成：

```
model.gltf
texture.png
buffer.bin
```

GLB（3D 模型单文件）通常是一个二进制单文件：

```
model.glb
```

做 Web / 广告 / 平台分发时，GLB（3D 模型单文件）更方便，因为它把模型数据、材质引用等内容打进一个文件，交付和加载更省事。

注意：

- GLB（3D 模型单文件）方便，不代表一定轻
- 模型要减面
- 贴图要压缩
- 材质不要过度复杂
- 移动端要真机测试

官方资料：

- https://www.khronos.org/gltf/
- https://github.com/KhronosGroup/glTF-Sample-Assets

### Cocos Creator

Cocos Creator 是跨平台游戏引擎，尤其适合 H5、移动端和国内小游戏生态。

适合：

- 微信小游戏
- 抖音小游戏
- 国内渠道
- 2D / 轻 3D 商业小游戏
- 多端发布
- 需要编辑器工作流的团队化项目

优点：

- 国内生态强
- 小游戏平台适配经验多
- 编辑器可视化
- 2D 游戏成熟
- 可导出 Web / 小游戏平台

缺点：

- 需要学习编辑器和项目结构
- 平台适配仍然要看各渠道 SDK（平台开发包）
- 对纯 Web 广告试玩来说可能偏重

推荐定位：

```
如果你后续明确要做国内小游戏渠道，Cocos Creator 值得作为第二阶段主栈
```

官方资料：

- https://www.cocos.com/en/creator
- https://docs.cocos.com/creator/manual/en/
- https://github.com/cocos/cocos-engine

### Unity

Unity 是完整商业游戏引擎。

适合：

- 移动游戏
- 3D 游戏
- 中长期产品
- 有明确客户要求 Unity 源码或包体
- 需要成熟编辑器、动画、物理、资源系统

Unity 可以导出 WebGL（浏览器运行版本），但 WebGL（浏览器运行版本）尤其移动端 Web 需要谨慎验证。

AI-first 下 Unity 的价值：

- C# 代码 AI 支持很好
- 编辑器流程成熟
- 插件生态大
- 很多客户和外包需求认 Unity

主要成本：

- 安装和打包链路重
- WebGL（浏览器运行版本）包体大
- 移动浏览器兼容需要实测
- 广告试玩平台对 Unity WebGL（浏览器运行版本）有额外包体和加载要求

推荐定位：

```
中长期能力栈
客户指定 Unity 时优先
不是第一周验证 Web H5（HTML5 网页游戏）副业的唯一入口
```

官方资料：

- https://unity.com/
- https://docs.unity3d.com/

### Godot

Godot 是开源游戏引擎。

适合：

- 独立游戏
- 2D 游戏
- 轻 3D 游戏
- 开源友好项目
- 桌面 / Web / 移动多端尝试

优点：

- 免费开源
- 2D 体验好
- 编辑器轻
- 社区活跃

注意：

- Godot Web 导出依赖浏览器能力
- Godot 4 的 Web、多线程、C# 等组合有现实限制
- 平台 SDK（平台开发包）生态不如 Unity / Cocos 在商业小游戏渠道成熟

推荐定位：

```
适合学习游戏引擎思维和做独立游戏
如果目标是平台快速变现，先确认目标渠道是否接受 Godot Web 包
```

官方资料：

- https://godotengine.org/
- https://docs.godotengine.org/

## 技术栈选择决策树

```
你要做的是广告试玩？
  |
  +-- 是 -> 原生 JS / Phaser / PixiJS / Three.js
  |          优先看包体、单 HTML、MRAID、CTA
  |
  +-- 否
       |
       v
你要投 Web 游戏平台？
  |
  +-- 是 -> Phaser / Three.js / Cocos Web / Unity WebGL / Godot Web
  |          优先看平台 SDK、移动端、质量审核
  |
  +-- 否
       |
       v
你要做国内小游戏？
  |
  +-- 是 -> Cocos Creator / Unity / 原生小游戏
  |          优先看账号、广告、支付、审核、资质
  |
  +-- 否
       |
       v
你要做 3D 视觉差异化？
  |
  +-- 是 -> Three.js + Blender + GLB
  |          或 Unity / Godot
  |
  +-- 否 -> Phaser / 原生 JS
```

更短的判断：

```
最快展示：原生 JS / Phaser
最快 2D 完整游戏：Phaser
最快 3D Web 差异化：Three.js + Blender（3D 建模工具） + GLB（3D 模型单文件）
国内小游戏：Cocos Creator
客户指定商业引擎：Unity
开源独立游戏学习：Godot
```

决策树里的关键术语：单 HTML（单网页文件）、MRAID（广告容器接口）、CTA（行动按钮）、Unity WebGL / Godot Web（引擎导出的浏览器版本）、GLB（3D 模型单文件）。

## 第一款游戏建议

你第一款不应该追求“技术最酷”，而应该追求：

```
可展示
可投稿
可改皮
可拆成 playable ad
可换 PlatformAdapter（平台适配层）
可被 AI 继续扩展
```

推荐 3 个方向。

### 2D 合成 / 堆叠游戏

技术栈：

```
Phaser + TypeScript + Vite
```

变现路径：

- CrazyGames 投稿
- Yandex 投稿
- Playable Ads（可试玩广告）改版
- 低价 H5（HTML5 网页游戏）定制单

优点：

- 规则简单
- 素材容易换
- 移动端友好
- AI 容易实现

### 轻 3D 拖拽 / 点击游戏

技术栈：

```
Three.js + TypeScript + Vite + Blender（3D 建模工具） + GLB（3D 模型单文件）
```

变现路径：

- Playable Ads（可试玩广告）
- 产品/角色互动展示
- itch.io 作品展示
- Web 平台投稿尝试

优点：

- 视觉差异化强
- AI 生成代码效果明显
- Blender（3D 建模工具）+ AI 资产能形成壁垒

风险：

- 性能和包体要严测
- 模型质量影响观感
- 移动端兼容要真机验收

### 益智解谜 / 排序游戏

技术栈：

```
原生 JS 或 Phaser
```

变现路径：

- Web 平台
- Playable Ads（可试玩广告）
- 模板销售

优点：

- 不依赖复杂素材
- 规则容易做关卡
- 可批量生成变体
