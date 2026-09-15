# AI 游戏副业作战手册

版本：2026-09-14  
定位：给“懂开发、会用 Codex / Claude / 多 agent，但没有游戏开发经验”的人，用来快速理解游戏开发、平台接入和变现闭环。

这份文档不是传统“从零学游戏开发”的教程，而是一份 AI-first 的商业验证手册。

你的目标不是成为全栈游戏专家，而是在一周内跑通：

```
选渠道 -> 定玩法 -> AI 协作开发 -> 接 SDK/广告/数据 -> 上线或投放 -> 收集商业信号 -> 迭代报价/变现
```

核心判断：

```
过去：一个人一周很难完成游戏商业闭环
现在：AI + 多 agent 可以显著压缩开发和学习成本
但：AI 不能替你消除平台规则、资产版权、性能验收、玩法质量和商业分发问题
```

所以本手册的重点不是“哪个框架最简单”，而是：

```
你要先知道目标渠道如何赚钱
再倒推它需要什么游戏形态、技术栈、SDK、包体、素材和验收标准
```

## 0. 一句话结论

如果你的目标是快速用 AI 做游戏副业，建议先走三条线并行：

```
现金流线：Playable Ads / H5 小游戏外包 / 二改定制
作品线：itch.io / 自建作品页 / GitHub Pages 展示
平台线：CrazyGames / Yandex Games / GameDistribution 等 Web 游戏平台投稿
```

第一周的目标不是保证赚到钱，而是跑通最小商业闭环：

```
1 个可玩的英文 HTML5 游戏
1 个可复用 GameCore
1 套 PlatformAdapter
1 套移动端验收清单
1 个作品展示链接
1 次平台投稿或客户报价
1 次真实反馈或数据回收
```

技术栈建议不要从“我要学 Unity / Godot / Cocos / Three.js 哪个”开始，而是从渠道倒推。

```
Web 游戏平台        -> Phaser / Three.js / Cocos Creator / Unity WebGL / Godot Web
Playable Ads        -> 原生 JS / Phaser / PixiJS / Three.js，强约束包体和单文件
Telegram / Discord  -> Web App + 平台 SDK + 后端验签 / entitlement
国内小游戏          -> Cocos Creator / Unity / 原生小游戏适配
3D 展示与轻 3D 游戏 -> Three.js + Blender + glTF/GLB
中长期商业游戏      -> Unity / Godot / Cocos Creator
```


## 1. 你的真实角色

你不是传统意义上的“游戏开发新手”。

更准确的角色是：

```
AI-first 游戏产品工程师 / 技术制片人
```

你负责：

- 选商业方向
- 定平台
- 定玩法边界
- 拆任务给 AI / agent
- 验收游戏手感、性能、规则和接入
- 控制版权、平台合规和交付质量
- 对接客户或平台

AI / agent 负责：

- 生成玩法代码
- 生成 UI / 动效 / shader / adapter
- 重构和修 bug
- 查平台文档
- 写测试和验收脚本
- 生成素材草案
- 协助改包、压缩、兼容和截图

你真正需要学的不是“每个框架所有 API”，而是下面这张图：

```
商业目标
  |
  v
渠道平台规则
  |
  v
游戏形态
  |
  v
技术栈 / 引擎
  |
  v
资产管线
  |
  v
SDK / PlatformAdapter
  |
  v
测试 / 上线 / 投放 / 报价
```

只要你能把需求讲清楚、把验收标准写清楚、把平台限制看明白，AI 就能把大量实现工作压下去。


## 2. AI-first 成本模型

传统判断里，“没做过游戏”意味着：

- 要学引擎
- 要学动画
- 要学碰撞
- 要学状态机
- 要学打包
- 要学平台 SDK
- 要自己一点点调 bug

AI-first 后，成本结构变了。

```
传统成本：
学习 API + 写代码 + 调试 + 做素材 + 接平台 + 测试

AI-first 成本：
定义边界 + 拆任务 + 选平台 + 验收质量 + 修正 AI 偏差 + 商业分发
```

也就是说，代码不再是最大瓶颈。

新的瓶颈是：

- 你是否知道平台要什么
- 你是否知道游戏“好玩”的最小结构
- 你是否能判断 AI 写出来的东西有没有质量问题
- 你是否能把同一款游戏适配到不同渠道
- 你是否能拿到反馈、报价、投稿结果或收入数据

AI-first 的正确用法不是“让 AI 乱写一个游戏”，而是：

```
主 agent：维护产品规格、技术边界、验收清单
开发 agent：实现玩法、UI、动画、性能优化
平台 agent：查 SDK、接广告、接 IAP、改打包
素材 agent：生成和整理图片、音效、3D 模型
测试 agent：做移动端、桌面端、包体、FPS、异常流验收
审查 agent：检查版权、平台规则、质量和安全风险
```

你不需要先把 Phaser、Three.js、Unity、Godot、Cocos 都学完。

你需要先能回答：

```
这个游戏要投到哪里？
这个渠道靠什么变现？
它支持什么 SDK？
它禁止什么？
它接受什么格式？
它的用户在哪些设备上玩？
我怎么知道它有商业信号？
```


## 3. 游戏开发的最小心智模型

你有 Python / FastAPI / Django / Flask / 数据库经验，可以这样迁移理解。

Web 后端通常是：

```
Request -> Router -> Service -> DB -> Response
```

游戏客户端通常是：

```
Input -> Update -> Physics/Rules -> Render -> Audio -> Next Frame
```

后端是“请求响应模型”，游戏是“帧循环模型”。

### 3.1 游戏循环

游戏不是页面静态展示，而是每秒不断刷新状态。

```
while game is running:
    readInput()
    updateWorld(deltaTime)
    resolveCollision()
    renderFrame()
    playAudio()
```

浏览器里通常是：

```
function loop(time) {
  const dt = time - lastTime;
  update(dt);
  render();
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
```

你需要关注：

- `state`：玩家、敌人、分数、关卡、倒计时
- `input`：触摸、鼠标、键盘、手柄
- `update`：移动、碰撞、胜负判断
- `render`：Canvas / WebGL / DOM / CSS
- `audio`：点击后解锁、音效、背景音乐
- `lifecycle`：暂停、恢复、切后台、广告前后

### 3.2 游戏的基本模块

```
GameCore
  - 规则
  - 状态
  - 关卡
  - 分数
  - 胜负

RenderRuntime
  - Canvas 2D
  - WebGL
  - Three.js
  - Phaser
  - PixiJS
  - Cocos

InputSystem
  - touch
  - pointer
  - keyboard
  - gesture

AssetPipeline
  - image
  - sprite
  - atlas
  - audio
  - font
  - glTF / GLB

PlatformAdapter
  - ads
  - analytics
  - storage
  - leaderboard
  - share
  - payment / IAP
  - lifecycle
  - consent / privacy

BuildPipeline
  - dev
  - preview
  - zip
  - minify
  - texture compress
  - platform package
```

### 3.3 数据库和后端什么时候需要

很多第一版小游戏不需要数据库。

优先级通常是：

```
第一阶段：localStorage / IndexedDB
第二阶段：平台排行榜 / 平台存档
第三阶段：自建后端
第四阶段：账号系统 / 支付 / 反作弊 / 数据分析
```

你熟悉的 FastAPI / Django 适合放在第三阶段以后：

- 排行榜
- 用户进度
- 活动配置
- A/B 测试
- 远程关卡配置
- 支付验签
- 反作弊
- 运营数据

第一周不要把后端当核心，除非目标平台要求服务端验签，比如 Telegram / Discord 的付费或身份场景。


## 4. 技术栈怎么理解

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

所以你问“技术栈是通用的吗”，答案是：

```
底层能力有通用部分
平台接入不通用
资产规范半通用
打包和审核规则不通用
```

通用的部分：

- HTML / CSS / JavaScript / TypeScript
- Canvas / WebGL 基础
- 游戏循环
- 状态机
- 输入处理
- 音频解锁
- 移动端适配
- 资源加载
- FPS / 包体优化
- GitHub / CI / 静态托管

不通用的部分：

- 广告 SDK
- IAP / 支付
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


## 5. 主流技术栈地图

### 5.1 原生 HTML / CSS / JS

适合：

- 超轻量点击游戏
- 益智小游戏
- Playable Ads
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
Playable Ads 和极轻 H5 的第一选择
不是复杂游戏长期维护的第一选择
```

### 5.2 Phaser

Phaser 是 Web 2D 游戏框架。

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

- 场景 `Scene`
- 精灵 `Sprite`
- 动画 `Animation`
- 输入 `Input`
- 物理 `Arcade Physics / Matter`
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
- 移动端要重点测触摸、横竖屏、音频解锁和 FPS

官方资料：

- https://phaser.io/
- https://docs.phaser.io/
- https://github.com/phaserjs/phaser
- https://github.com/phaserjs/examples

### 5.3 PixiJS

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
当你已经有清晰 GameCore 和状态机时，用 PixiJS 做精致 2D 表现
```

官方资料：

- https://pixijs.com/
- https://github.com/pixijs/pixijs

### 5.4 Three.js

Three.js 是 Web 3D 渲染库，不是完整游戏引擎。

但在 AI-first 工作流里，它的价值被重新放大了。

原因不是 Three.js 变成了游戏引擎，而是：

```
AI 可以快速生成：
  - 场景搭建
  - 相机控制
  - glTF 加载
  - 点击交互
  - 简单物理
  - shader 草案
  - 后处理
  - 移动端适配
  - 资产压缩脚本
```

过去一个人手写 Three.js 游戏系统成本很高，现在可以通过 AI 把实现成本压低。

但你仍然要负责验收：

- 是否稳定 60 FPS / 30 FPS
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
- WebGL 视觉差异化 Demo

不适合第一周硬做：

- 大型开放世界
- 复杂联网 3D 对战
- 重物理沙盒
- 多角色复杂动画系统

推荐组合：

```
Three.js + Vite + TypeScript
Three.js + glTF/GLB + Blender
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

### 5.5 Blender

Blender 是 3D 内容创作工具，不是游戏引擎的主要运行时选择。

它在你的副业链路里非常重要，因为它解决：

- 建模
- 材质
- 动画
- 骨骼
- 贴图
- 灯光预览
- 资产检查
- glTF / GLB 导出
- 模型简化
- UV 整理

Blender 在 AI-first 流程里的位置：

```
AI 生成概念图 / 贴图 / 模型草案
        |
        v
Blender 清理、修面、减面、调材质、导出 GLB
        |
        v
Three.js / Cocos / Unity / Godot 加载运行
```

你不需要第一周精通 Blender，但要知道几个动作：

- 导入模型
- 删除无用物体
- 设置原点
- 调整尺寸和坐标轴
- 合并材质
- 压缩贴图
- 降低面数
- 导出 glTF / GLB
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

### 5.6 glTF / GLB

glTF / GLB 是 Web 3D 和实时 3D 常用资产格式。

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

GLB 通常是一个二进制单文件：

```
model.glb
```

做 Web / 广告 / 平台分发时，GLB 更方便。

注意：

- GLB 方便，不代表一定轻
- 模型要减面
- 贴图要压缩
- 材质不要过度复杂
- 移动端要真机测试

官方资料：

- https://www.khronos.org/gltf/
- https://github.com/KhronosGroup/glTF-Sample-Models

### 5.7 Cocos Creator

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
- 平台适配仍然要看各渠道 SDK
- 对纯 Web 广告试玩来说可能偏重

推荐定位：

```
如果你后续明确要做国内小游戏渠道，Cocos Creator 值得作为第二阶段主栈
```

官方资料：

- https://www.cocos.com/en/creator
- https://docs.cocos.com/creator/manual/en/
- https://github.com/cocos/cocos-engine

### 5.8 Unity

Unity 是完整商业游戏引擎。

适合：

- 移动游戏
- 3D 游戏
- 中长期产品
- 有明确客户要求 Unity 源码或包体
- 需要成熟编辑器、动画、物理、资源系统

Unity 可以导出 WebGL，但 WebGL 尤其移动端 Web 需要谨慎验证。

AI-first 下 Unity 的价值：

- C# 代码 AI 支持很好
- 编辑器流程成熟
- 插件生态大
- 很多客户和外包需求认 Unity

主要成本：

- 安装和打包链路重
- WebGL 包体大
- 移动浏览器兼容需要实测
- 广告试玩平台对 Unity WebGL 有额外包体和加载要求

推荐定位：

```
中长期能力栈
客户指定 Unity 时优先
不是第一周验证 Web H5 副业的唯一入口
```

官方资料：

- https://unity.com/
- https://docs.unity3d.com/

### 5.9 Godot

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
- 平台 SDK 生态不如 Unity / Cocos 在商业小游戏渠道成熟

推荐定位：

```
适合学习游戏引擎思维和做独立游戏
如果目标是平台快速变现，先确认目标渠道是否接受 Godot Web 包
```

官方资料：

- https://godotengine.org/
- https://docs.godotengine.org/


## 6. 平台优先，而不是技术栈优先

你前面的纠偏是对的：

```
不是先选技术栈，再找平台
而是先分析平台，再倒推技术栈
```

因为平台决定：

- 用户是谁
- 怎么分发
- 怎么赚钱
- 支持什么 SDK
- 包体限制
- 是否允许外部请求
- 是否允许第三方广告
- 是否要求移动端适配
- 是否有审核
- 是否有独占
- 是否能结算到个人

技术栈只是达成平台目标的工具。


## 7. 渠道地图

### 7.1 CrazyGames

定位：

```
Web 游戏平台，适合投稿 HTML5 游戏
```

可能技术栈：

- Phaser
- Three.js
- Cocos Creator Web
- Unity WebGL
- Godot Web
- 原生 JS

接入重点：

- CrazyGames SDK
- 广告事件
- 游戏暂停/恢复
- 质量审核
- 移动端适配
- 不要带外部平台品牌或不允许的第三方广告

变现方式：

- 平台广告分成
- 部分游戏可能有 IAP 机会

适合你做什么：

```
做一款英文 Web 小游戏，作为第一批平台投稿目标之一
```

官方资料：

- https://developer.crazygames.com/
- https://docs.crazygames.com/
- https://docs.crazygames.com/sdk/intro/
- https://docs.crazygames.com/sdk/faq/

### 7.2 Yandex Games

定位：

```
Web / HTML5 游戏平台，覆盖多地区流量
```

可能技术栈：

- Phaser
- Three.js
- Cocos Creator Web
- Unity WebGL
- Godot Web
- 原生 JS

接入重点：

- Yandex Games SDK
- 广告
- 排行榜
- 存档
- 本地化
- 平台审核

变现方式：

- 广告
- 内购能力视平台规则和地区而定

适合你做什么：

```
英文或多语言轻量 Web 游戏
可以作为 CrazyGames 之外的第二投稿目标
```

官方资料：

- https://yandex.com/dev/games/
- https://yandex.com/dev/games/doc/en/

### 7.3 GameDistribution

定位：

```
Web 游戏分发与广告变现渠道
```

可能技术栈：

- Phaser
- Three.js
- Cocos Creator Web
- Unity WebGL
- Godot Web
- 原生 JS

接入重点：

- GameDistribution SDK
- 广告事件
- 平台包体和审核要求
- 不同站点分发兼容

变现方式：

- 广告分成

官方资料：

- https://gamedistribution.com/
- https://gamedistribution.com/sdk/

### 7.4 Poki

定位：

```
高质量精选 Web 游戏平台
```

可能技术栈：

- Phaser
- Cocos Creator Web
- Unity WebGL
- Three.js

接入重点：

- Poki SDK
- 平台 QA
- 移动端、桌面端、平板体验
- 16:9 画布比例和等比缩放
- Incognito 模式可玩
- 外部请求默认阻断，字体、图片、音频、库都要打进包
- SDK 事件顺序正确，比如 `gameplayStart()` / `gameplayStop()` 不能连续重复触发
- 广告只能按平台规则接
- 不允许第三方广告系统
- 不支持 IAP，主要按 Poki 广告系统变现
- 对游戏质量、原创性、留存更敏感

变现方式：

- 平台广告分成

适合你做什么：

```
不是第一天就冲的渠道
适合已有质量较高的游戏后再投
```

官方资料：

- https://developers.poki.com/
- https://developers.poki.com/guide/requirements-quality

### 7.5 GameSnacks

定位：

```
轻量 HTML5 游戏分发生态
```

可能技术栈：

- 原生 JS
- Phaser
- PixiJS
- Three.js

接入重点：

- 必须包含 `game.json`
- 必须接 GameSnacks Developer SDK
- 使用 Canvas 或 WebGL 渲染
- 支持 9:16 竖屏，建议支持 16:9 和 1:1
- 必须支持 touch 和 mouse
- 初始下载必须小于平台限制，目标应尽量压到更低
- 不能直接加载第三方广告 API
- 不能使用 cookies、`localStorage`、`sessionStorage`、`IndexedDB`
- 不能向外部服务器发请求
- 存档必须走 GameSnacks Storage interface
- 音频、暂停、恢复、广告都要走 SDK 指定接口
- 需要英文支持、素材权利清晰、低端设备性能过关

风险判断：

```
GameSnacks 不是“普通 Web 包上传一下”的渠道。
它更像强规范轻游戏分发生态，适合第二阶段按规则专门适配。
```

适合你做什么：

```
后续作为高标准轻量游戏渠道研究，不作为唯一第一周目标
```

官方资料：

- https://developers.google.com/gamesnacks

### 7.6 itch.io

定位：

```
独立游戏展示、销售和作品集平台
```

可能技术栈：

- Web HTML5
- Unity
- Godot
- 可下载桌面游戏

接入重点：

- 项目页
- 封面图
- 截图
- Web 嵌入或下载包
- 定价 / 打赏 / 付费下载
- 作品集展示

变现方式：

- 付费下载
- 打赏
- 自定分成
- 作为客户展示页

适合你做什么：

```
第一周必须有一个 itch.io 或自建展示页
用来给客户、平台、QQ群/Discord/Reddit 对接方看
```

官方资料：

- https://itch.io/
- https://itch.io/docs/creators/
- https://itch.io/docs/creators/faq

### 7.7 Playable Ads

定位：

```
不是普通小游戏平台，而是广告投放素材
```

你做的是：

```
一个 15-60 秒可交互试玩广告
目标是让用户点击 CTA 去下载 App 或进入落地页
```

可能技术栈：

- 原生 JS
- Phaser
- PixiJS
- Three.js
- 极少量 Cocos / Unity 导出后强压缩

接入重点：

- MRAID
- 单 HTML 或 ZIP
- 包体限制，各投放网络不完全一样
- 文件数量限制，各投放网络不完全一样
- 首屏加载速度
- 禁止自动跳转
- 禁止未交互播放音频
- CTA 通过平台 API
- 不能依赖外部网络资源

关键认知：

```
Playable Ads 没有一个“万能规格”。
Google、AppLovin、Unity Ads、ironSource、TikTok、Mintegral 的包体、文件形式、MRAID 版本、外链规则、测试工具和审核习惯都可能不同。
```

常见规格差异：

| 网络 | 常见交付形式 | 重点 |
| --- | --- | --- |
| Google Ads | ZIP | 常见要求 5MB 内、文件数量限制、orientation meta、相对路径 |
| AppLovin | 单 HTML | 资源内联、MRAID、不能外部请求、首次交互后开始计时 |
| Unity Ads | 单 HTML | 内联压缩、MRAID、5MB 内、横竖屏都要能工作 |
| Mintegral | HTML | 通常要求 5MB 内，并配套 icon / main image |
| TikTok | 平台规则为准 | 关注加载、点击行为、落地页和素材合规 |

变现方式：

- 接客户定制
- 做试玩广告素材外包
- 按条报价
- 按版本迭代收费

适合你做什么：

```
这是第一周最现实的现金流方向之一
因为客户愿意为“能投放、能转化、能改版本”的素材付费
```

需要准备：

- 15 秒版
- 30 秒版
- 竖屏版
- 横屏版
- 不同 CTA 版
- 不同语言版
- 包体压缩版

参考资料：

- https://support.google.com/google-ads/answer/9981650
- https://support.applovin.com/en/growth/promoting-your-apps/welcome-to-applovin/creative-specs-and-guidelines
- https://developers.is.com/ironsource-mobile/general/playable-ad-requirements/
- https://ads.tiktok.com/help/article/playable-ads

### 7.8 Telegram Mini Apps

定位：

```
Telegram 内运行的 Web App / Mini App
```

可能技术栈：

- Web 前端
- Phaser / Three.js / PixiJS
- FastAPI / Node.js 后端
- Telegram Bot

接入重点：

- Telegram WebApp API
- initData 服务端验签
- 用户身份
- Stars 支付
- 分享传播
- Bot 入口

变现方式：

- Telegram Stars
- 虚拟商品
- 会员能力
- 流量导入其他产品

适合你做什么：

```
第二阶段探索
如果你愿意做带账号、邀请、排行榜、付费道具的轻游戏，可以重点研究
```

官方资料：

- https://core.telegram.org/bots/webapps
- https://core.telegram.org/bots/api

### 7.9 Discord Activities

定位：

```
Discord 内嵌活动 / 社交游戏
```

可能技术栈：

- Web App
- Phaser / Three.js / PixiJS
- Node.js / FastAPI 后端
- Discord Embedded App SDK

接入重点：

- Discord App
- Embedded App SDK
- Activity iframe
- OAuth / 用户身份
- IAP / Entitlements
- 多人房间和语音场景

变现方式：

- IAP
- Subscription
- 社交玩法转化

适合你做什么：

```
不是第一周最快收钱渠道
但适合中期做社交轻游戏和海外用户
```

官方资料：

- https://discord.com/developers/docs/activities/overview
- https://discord.com/developers/docs/monetization/overview
- https://discord.com/developers/docs/monetization/implementing-iap-for-activities

### 7.10 国内小游戏渠道

主要包括：

- 微信小游戏
- 抖音小游戏
- 快手小游戏
- QQ 小游戏
- OPPO / vivo / 小米等快游戏平台

可能技术栈：

- Cocos Creator
- Unity
- LayaAir
- 原生小游戏框架

接入重点：

- 平台账号和资质
- 审核
- 广告 SDK
- 支付 / 虚拟商品
- 实名 / 防沉迷
- 隐私合规
- 版号和内容边界
- 分包加载

变现方式：

- 激励视频广告
- 插屏广告
- 内购
- 买量
- 联运

适合你做什么：

```
如果目标是国内商业化小游戏，Cocos Creator 优先级会上升
但第一周要谨慎，因为账号、资质、审核和结算链路可能比开发更慢
```

官方资料：

- https://developers.weixin.qq.com/minigame/dev/guide/
- https://developer.open-douyin.com/docs/resource/zh-CN/mini-game/introduction/usage-guide
- https://q.qq.com/wiki/develop/minigame/

### 7.11 长尾渠道和交易市场

这些渠道不一定适合第一周深入接入，但适合做分发、接单、源码销售和市场观察。

Web 游戏分发 / 授权：

- GamePix：https://www.gamepix.com/
- GameMonetize：https://gamemonetize.com/
- Armor Games：https://armorgames.com/
- Newgrounds：https://www.newgrounds.com/
- Kongregate：https://www.kongregate.com/
- Y8：https://www.y8.com/
- Gamezop：https://www.gamezop.com/
- Famobi：https://famobi.com/
- Softgames：https://www.softgames.com/
- MarketJS：https://www.marketjs.com/

源码 / 模板 / 素材市场：

- CodeCanyon：https://codecanyon.net/
- Envato Market：https://envato.com/
- itch.io assets：https://itch.io/game-assets
- Gumroad：https://gumroad.com/

外包 / 接单：

- Upwork：https://www.upwork.com/
- Fiverr：https://www.fiverr.com/
- Freelancer：https://www.freelancer.com/
- Contra：https://contra.com/
- Discord 游戏开发社区
- Reddit 游戏开发社区
- QQ 群 / 微信群低价练手单

使用方式：

```
第一周：只用它们找需求、报价、发作品链接
第二周：筛选真正有回复和付款意愿的渠道
第三周以后：再决定是否为某个渠道做专门适配
```

### 7.12 平台规则复查矩阵

提交前必须复查官方文档。下面只作为路线图，不作为永久准确规则。

Last checked：2026-09-14

| 平台 | 官方入口 | 关键硬要求 | 提交前必须复查 |
| --- | --- | --- | --- |
| CrazyGames | https://docs.crazygames.com/ | Basic Launch / Full Launch 分阶段；Full Launch 才启用完整变现；SDK 支持 HTML5、Unity、Godot、Cocos 等；广告、云存档、数据等走 SDK | Basic 和 Full 要求、SDK v3、广告点、移动端 QA、付款门槛和收款方式 |
| Poki | https://developers.poki.com/guide/requirements-quality | 桌面/移动/平板；16:9；Incognito 可玩；外部请求默认阻断；只允许 Poki 广告；无 IAP | SDK 事件顺序、CSP、广告调用、外链、隐私政策、QA 规则 |
| Yandex Games | https://yandex.com/dev/games/doc/en/ | SDK、广告、排行榜、存档、本地化、审核 | 地区结算、广告规则、IAP、语言、本地化要求 |
| GameDistribution | https://gamedistribution.com/sdk/ | SDK 广告、分发兼容、Web 包上传 | 广告触发、品牌露出、包体、审核、结算 |
| GameSnacks | https://developers.google.com/gamesnacks/developer/requirements | `game.json`、GameSnacks SDK、Canvas/WebGL、9:16、低端设备 30 FPS、禁止外部请求、禁止本地存储 | 初始下载、存档 API、广告 API、音频、暂停恢复、文件命名和资源列表 |
| itch.io | https://itch.io/docs/creators/ | 项目页、Web/下载包、定价和作品展示 | 收款、税务、页面素材、是否允许外链和嵌入 |
| Google Playable Ads | https://support.google.com/google-ads/answer/9981650 | ZIP、常见 5MB、文件数量限制、orientation meta、相对路径、响应式 | 具体广告系列规则、外部资源例外、HTML 结构、转化口径 |
| AppLovin Playable | https://support.applovin.com/en/growth/promoting-your-apps/welcome-to-applovin/creative-specs-and-guidelines | 单 HTML、常见 5MB、MRAID、无外部请求、首次交互后音频/计时、不能首点跳转 | MRAID 版本、preview 工具、横竖屏、CTA、WebGL fallback |
| Unity Ads Playable | https://docs.unity.com/en-us/user-acquisition/creatives/creative-specifications | 单 HTML、内联压缩、常见 5MB、MRAID、横竖屏 | overlay 安全区、close button、MRAID、平台审核 |
| Mintegral Playable | https://helpcenter.mintegral.com/en/docs/asset-specs | HTML playable、常见 5MB、配套 icon/main image | 测试工具、素材尺寸、落地页、包体 |
| Telegram Mini Apps | https://core.telegram.org/bots/webapps | WebApp API、Bot 入口、initData 服务端验签、Stars | 支付规则、身份验签、隐私、服务端接口 |
| Discord Activities | https://discord.com/developers/docs/activities/overview | iframe app、Embedded App SDK、OAuth、entitlement / IAP | 审核、IAP 权益校验、多人场景、域名和部署 |
| 微信小游戏 | https://developers.weixin.qq.com/minigame/dev/guide/ | 小游戏运行环境、包体/分包、广告、支付、审核 | 账号资质、版号/内容、隐私、支付、广告规则 |
| 抖音小游戏 | https://developer.open-douyin.com/docs/resource/zh-CN/mini-game/introduction/usage-guide | 小游戏 SDK、审核、广告、支付、平台能力 | 资质、广告分成、支付、实名/防沉迷、包体 |


## 8. 平台优先级建议

按“你要一周内跑通商业闭环”的目标，可以这样分层。

### P0：一周内必须跑通

```
1. itch.io / GitHub Pages / 自建静态页
2. Playable Ads 样片
3. CrazyGames 投稿准备
```

原因：

- 展示页能马上给客户看
- Playable Ads 更接近现金流
- CrazyGames 是 Web 游戏平台投稿验证

### P1：第二批扩展

```
1. Yandex Games
2. GameDistribution
3. Newgrounds / Kongregate / Y8 等作品曝光渠道
```

原因：

- 增加分发面
- 可复用 Web 包和 PlatformAdapter
- 能验证不同平台规则

### P2：质量提升后再冲

```
1. Poki
2. GameSnacks
3. YouTube Playables
```

原因：

- 门槛更高
- 选择更精选
- 不适合作为唯一第一周收入假设

### P3：中期产品化

```
1. Telegram Mini Apps
2. Discord Activities
3. 国内小游戏
4. Steam / App Store / Google Play
```

原因：

- 更像产品，不只是单个 H5 游戏
- 需要身份、支付、合规、运营、后端
- 商业潜力更大，但链路更长


## 9. 变现方式地图

### 9.1 平台广告分成

适合：

- CrazyGames
- Yandex Games
- GameDistribution
- Poki
- 国内小游戏

要求：

- 游戏质量够
- 留存和时长够
- SDK 接入正确
- 广告点设计合理
- 平台审核通过

风险：

- 不是上传就有收入
- 流量由平台分配
- 收入取决于地区、广告库存、留存、时长

### 9.2 Playable Ads 外包

适合：

- 短期现金流
- 有开发能力但没游戏经验的人
- AI-first 高效率产出多版本

交付物：

- 单 HTML / ZIP
- 竖屏版
- 横屏版
- 多语言版
- 不同 CTA 版
- 不同平台规格版
- 源码或不可编辑包

报价逻辑：

以下只是市场观察和练手参考，不是收益保证。真实价格取决于客户预算、投放网络、是否交源码、是否买断、是否独占、修改次数、是否包含素材授权和是否能过审核。

```
低价练手：100 - 500 元 / 条
稳定交付：500 - 3000 元 / 条
复杂互动：3000 - 10000+ 元 / 条
海外客户：按 USD 报价，常见从几十到数百美元起
```

注意：

- QQ 群里 B/A/S 级 7/30/150 元更像低价练手单
- 可以用来积累案例，但不能长期只靠这种单价
- 真正副业化要提高单价，卖“可投放、可迭代、能按审核反馈快速修改”的交付能力

### 9.3 IAP / 虚拟商品

适合：

- Telegram Mini Apps
- Discord Activities
- 国内小游戏
- 移动 App

要求：

- 用户身份
- 支付验签
- 权益发放
- 订单状态
- 客服和退款
- 合规

不适合第一周作为主线，除非你选择的平台本身就是 IAP 驱动。

### 9.4 付费下载 / 打赏

适合：

- itch.io
- 独立游戏
- 工具型游戏
- 小众付费作品

优点：

- 链路简单
- 可以作为作品集

缺点：

- 流量要自己解决
- 付费转化不确定

### 9.5 游戏模板 / 源码销售

适合：

- CodeCanyon
- itch.io asset
- Gumroad
- 自建页面

交付物：

- 可二改源码
- 文档
- reskin 指南
- 平台接入说明
- 素材替换说明

这是你中期可以考虑的方向：

```
同一个 GameCore
多套皮肤
多个 PlatformAdapter
多种交付价格
```

### 9.6 接单和合同风险

低价练手单可以接，但要先把边界写清楚。

必须明确：

- 是否交源码
- 是否买断
- 是否独占
- 是否允许放作品集
- 是否允许二次销售模板
- 是否客户提供素材
- 客户提供素材的版权责任归谁
- AI 生成素材的商业权利如何约定
- 是否包含平台 SDK 接入
- 是否保证审核通过
- 是否包含后续维护
- 修改次数和修改范围
- 付款节点
- 是否需要押金
- 是否支持退款

建议付款结构：

```
练手小单：
  50% 定金 + 50% 验收后交付源码/无水印包

标准定制：
  30% 定金 + 40% playable demo 验收 + 30% 最终交付

买断/独占：
  单独报价，不能按普通开发价卖断长期权益
```

风险红线：

- 要你先交押金、培训费、保证金的单不要接
- 要你先完整交付源码再付款的单不要接
- 要你承诺“必过平台审核 / 必赚钱”的单不要接
- 客户不给素材授权证明，却要求你承担侵权责任的单不要接
- 买断和独占不加价的单不要接

### 9.7 报价包模板

不要只说“我会做小游戏”。你要卖一个明确交付包。

```
HTML5 Playable Ad Package

Includes:
- 1 playable HTML5 demo
- portrait or landscape version
- CTA button
- basic MRAID integration
- mobile browser test
- compressed production build
- 2 revision rounds

Optional:
- source code
- both portrait and landscape
- extra language version
- extra reskin version
- platform-specific adapter
- 30s recording
- icon and screenshots
```

价格要按权益拆：

```
只交 build < 交源码 < 买断 < 独占
单平台 < 多平台
无素材 < 含素材授权
不保证审核 < 协助审核 < 包含审核修改
```


## 10. PlatformAdapter 要考虑什么

你说“不是重写游戏，只是换 PlatformAdapter”，这个方向是对的，但 PlatformAdapter 不能只理解为“换广告 SDK”。

它至少包括：

```
Ads
Analytics
Storage
Leaderboard
Achievements
Share
Payment / IAP
User Identity
Lifecycle
Audio Unlock
Fullscreen
Orientation
Privacy / Consent
Error Reporting
Asset URL Rules
Build Flags
External Request Policy
```

### 10.1 按平台禁用能力

PlatformAdapter 不是只加能力，也要禁用能力。

```
普通 Web：
  可以 localStorage / IndexedDB，但要处理浏览器隐私模式异常。

Poki：
  外部请求默认阻断；本地存储要考虑 Incognito；广告只能走 Poki SDK。

GameSnacks：
  不能使用 cookies / localStorage / sessionStorage / IndexedDB；
  不能向外部服务器请求数据；
  存档、广告、音频、暂停恢复都必须走 GameSnacks SDK。

Playable Ads：
  通常不依赖持久存储；
  不依赖外部请求；
  CTA 走 MRAID 或投放网络指定 API；
  音频必须等首次交互后再播放。

Telegram / Discord：
  身份、支付、权益不要只在前端信任；
  需要服务端验签或校验 entitlement。
```

建议接口：

```
export interface PlatformAdapter {
  name: string;

  init(): Promise<void>;

  showInterstitial(reason: string): Promise<void>;
  showRewarded(reason: string): Promise<boolean>;

  track(eventName: string, payload?: Record<string, unknown>): void;

  save(key: string, value: unknown): Promise<void>;
  load<T>(key: string): Promise<T | null>;

  submitScore?(score: number, meta?: Record<string, unknown>): Promise<void>;
  unlockAchievement?(id: string): Promise<void>;

  share?(payload: SharePayload): Promise<void>;
  purchase?(sku: string): Promise<PurchaseResult>;

  onPause?(handler: () => void): void;
  onResume?(handler: () => void): void;
}
```

游戏核心只能依赖接口，不能直接依赖平台 SDK。

```
错误结构：
GameScene -> CrazyGames.SDK.ad.requestAd()

正确结构：
GameScene -> platform.showInterstitial("level_complete")
```

这样你才能做到：

```
同一游戏
  -> WebAdapter
  -> CrazyGamesAdapter
  -> PokiAdapter
  -> YandexAdapter
  -> MraidAdapter
  -> TelegramAdapter
  -> DiscordAdapter
```

### 10.2 各平台 Adapter 差异

| 平台 | Adapter 重点 | 技术风险 |
| --- | --- | --- |
| 普通 Web | localStorage、analytics、全屏、分享 | 浏览器兼容 |
| CrazyGames | SDK、广告、暂停恢复、平台事件 | 审核和 SDK 调用时机 |
| Poki | Poki SDK、广告、质量要求 | 规则更严格 |
| Yandex | SDK、广告、排行榜、存档、本地化 | 文档和地区规则 |
| Playable Ads | MRAID、CTA、包体、无外链 | 平台规格差异大 |
| Telegram | WebApp、initData、Stars、Bot | 服务端验签和支付 |
| Discord | Embedded App SDK、entitlement、IAP | 身份和付费权益 |
| 国内小游戏 | 广告、支付、登录、分包、隐私 | 审核和资质 |


## 11. 资产管线

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
- 3D 模型
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

### 11.1 2D 资产工具

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

### 11.2 3D 资产工具

常用工具：

- Blender：建模、动画、导出 GLB
- Meshy：AI 3D 生成
- Tripo：AI 3D 生成
- Mixamo：角色动作
- Poly Haven：HDRI / 贴图 / 模型
- Khronos glTF Sample Models：测试模型

资料：

- https://www.blender.org/
- https://www.meshy.ai/
- https://www.tripo3d.ai/
- https://www.mixamo.com/
- https://polyhaven.com/
- https://github.com/KhronosGroup/glTF-Sample-Models

### 11.3 音频资产

常用工具：

- Audacity：音频编辑
- Freesound：音效
- Bfxr / jsfxr：复古音效
- Suno / Udio：音乐草案，商用权要核对

资料：

- https://www.audacityteam.org/
- https://freesound.org/
- https://sfxr.me/

### 11.4 版权记录

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


## 12. AI 多 agent 工作流

你不是让一个 AI 从头写完整游戏，而是让多个 agent 分工。

### 12.1 主 agent 负责

```
产品定义
平台选择
验收标准
目录结构
核心架构
任务拆分
最终集成
质量决策
```

### 12.2 可并行 agent

```
platform-research agent：
  查目标平台 SDK、包体、广告、审核、结算规则

gameplay agent：
  实现核心玩法、关卡、碰撞、分数、失败/胜利

ui agent：
  实现菜单、按钮、HUD、结算页、移动端布局

asset agent：
  生成、整理、压缩、命名素材

threejs / phaser agent：
  根据技术栈实现具体运行时代码

adapter agent：
  实现 PlatformAdapter 和不同平台 SDK

qa agent：
  真机、浏览器、包体、性能、异常流程测试

business agent：
  准备报价、作品页、客户私信、平台投稿材料

review agent：
  审查可维护性、版权、平台合规和交付风险
```

### 12.3 每个 agent 的任务模板

```
背景：
我要做一个面向海外平台的 HTML5 小游戏副业项目。

目标平台：
CrazyGames / Playable Ads / itch.io / ...

当前技术栈：
Phaser / Three.js / 原生 JS / ...

你的任务：
只负责 ...

输入：
- 现有文件 ...
- 平台文档 ...
- 验收标准 ...

输出：
- 修改哪些文件
- 完成哪些功能
- 剩余风险
- 如何验证

禁止：
- 不要引入无关依赖
- 不要改其他 agent 负责的文件
- 不要跳过移动端测试
- 不要使用无授权素材
```


## 13. 一周商业闭环计划

本计划里的“一周闭环”定义为：

```
可玩链接 + 样片 + 投稿/报价动作 + 反馈通道
```

它不承诺：

```
平台一定审核通过
广告分成一定到账
客户一定付款
```

因为平台审核、流量分配、客户付款、结算周期都不是纯开发变量。

### Day 1：选渠道和游戏题材

产出：

- 选定 1 个主渠道
- 选定 1 个副渠道
- 定 1 个游戏核心循环
- 定 1 个变现假设
- 定 1 个作品展示方式

建议选择：

```
主渠道：Playable Ads 客户样片
副渠道：CrazyGames 投稿准备
展示页：itch.io 或 GitHub Pages
```

游戏题材选择标准：

- 5 秒内看懂
- 10 秒内能失败或获得反馈
- 30 秒内能完成一轮
- 1 个核心操作
- 1 个明确目标
- 1 个可截图卖点
- 可移动端单手操作

不要从宏大题材开始。

适合第一批：

- 合成
- 堆叠
- 躲避
- 切割
- 弹射
- 跑酷
- 排序
- 拔针
- 填色
- 数字益智
- 轻 3D 点击/拖拽

### Day 2：做 playable prototype

产出：

- 可玩的核心循环
- 手机浏览器能跑
- 有开始、失败、胜利、重开
- 有基本音效和动效

验收：

- iPhone / Android 浏览器可玩
- 横竖屏符合预期
- 无明显卡顿
- 一局 30-60 秒
- 不需要解释就能玩

### Day 3：资产和体验统一

产出：

- 统一视觉风格
- 统一按钮和 HUD
- 封面图
- 截图
- 图标
- 音效
- 简单教程或首局引导

AI 可做：

- 生成 UI 风格
- 生成背景
- 生成角色
- 生成 3D 模型草案
- 写 CSS / Canvas / shader
- 压缩图片

你要验收：

- 不像半成品
- 英文界面自然
- 文本不溢出
- 手机端按钮够大
- 首屏加载可接受
- 资产来源可记录

### Day 4：接 PlatformAdapter

产出：

- WebAdapter
- MraidAdapter 或 CrazyGamesAdapter
- analytics event
- local save
- pause/resume
- 构建脚本

最少事件：

```
game_start
level_start
level_complete
level_fail
ad_requested
ad_completed
cta_clicked
session_end
```

Playable Ads 必须有：

- CTA
- MRAID 调用
- 禁止自动跳转
- 首次交互后音频
- 包体压缩

Web 平台必须有：

- 平台 SDK init
- 广告前暂停
- 广告后恢复
- 错误处理
- 移动端适配

### Day 5：上线展示和对接

产出：

- itch.io / GitHub Pages / 自建页
- 30 秒录屏
- 3-5 张截图
- 简短英文介绍
- 技术说明
- 可报价交付项

对接对象：

- QQ 群低价单
- Discord 游戏开发群
- Reddit 相关板块
- Upwork / Fiverr
- 独立游戏发行平台
- 广告素材代理
- 小游戏发行商

报价不要只报“我会写游戏”。

要报：

```
我能交付一个可投放 HTML5 playable ad：
- single HTML / ZIP
- portrait / landscape
- CTA
- MRAID ready
- mobile tested
- source included or not included
- 2 rounds revision
```

### Day 6：根据反馈迭代

收集：

- 是否有人愿意试玩
- 是否有人问价格
- 是否平台拒绝
- 拒绝原因是什么
- 首屏加载是否慢
- 一局是否太难
- 操作是否误触
- 是否有客户要换皮肤

迭代：

- 降低首局难度
- 强化反馈
- 增加失败后重来
- 优化首屏
- 压缩包体
- 替换素材
- 改 CTA
- 改截图和介绍

### Day 7：做商业判断

判断标准：

```
继续：
  有客户回复
  平台审核进入下一步
  玩家愿意玩超过 2 分钟
  可复用模板明显
  能快速换皮

调整：
  没人理解玩法
  包体/性能问题严重
  平台规则不适配
  素材质量拖后腿

停止：
  一周后仍无法形成可展示链接
  没有可复用资产和代码
  没有任何反馈渠道
```


## 14. 第一款游戏建议

你第一款不应该追求“技术最酷”，而应该追求：

```
可展示
可投稿
可改皮
可拆成 playable ad
可换 PlatformAdapter
可被 AI 继续扩展
```

推荐 3 个方向。

### 14.1 2D 合成 / 堆叠游戏

技术栈：

```
Phaser + TypeScript + Vite
```

变现路径：

- CrazyGames 投稿
- Yandex 投稿
- Playable Ads 改版
- 低价 H5 定制单

优点：

- 规则简单
- 素材容易换
- 移动端友好
- AI 容易实现

### 14.2 轻 3D 拖拽 / 点击游戏

技术栈：

```
Three.js + TypeScript + Vite + Blender + GLB
```

变现路径：

- Playable Ads
- 产品/角色互动展示
- itch.io 作品展示
- Web 平台投稿尝试

优点：

- 视觉差异化强
- AI 生成代码效果明显
- Blender + AI 资产能形成壁垒

风险：

- 性能和包体要严测
- 模型质量影响观感
- 移动端兼容要真机验收

### 14.3 益智解谜 / 排序游戏

技术栈：

```
原生 JS 或 Phaser
```

变现路径：

- Web 平台
- Playable Ads
- 模板销售

优点：

- 不依赖复杂素材
- 规则容易做关卡
- 可批量生成变体


## 15. 项目模板结构

建议你以后每个游戏都按这个结构。

```
game-project/
  README.md
  package.json
  vite.config.ts
  index.html
  src/
    main.ts
    game/
      core/
        GameState.ts
        rules.ts
        scoring.ts
      scenes/
        BootScene.ts
        MenuScene.ts
        PlayScene.ts
        ResultScene.ts
      systems/
        input.ts
        audio.ts
        physics.ts
        camera.ts
      ui/
        Hud.ts
        Button.ts
      assets.ts
    platform/
      PlatformAdapter.ts
      adapters/
        web.ts
        crazygames.ts
        poki.ts
        yandex.ts
        mraid.ts
        telegram.ts
    analytics/
      events.ts
  assets/
    images/
    audio/
    models/
    fonts/
    LICENSES.md
    sources.csv
  public/
  docs/
    platform-notes.md
    test-plan.md
    pitch.md
  dist/
  scripts/
    build-web.mjs
    build-playable.mjs
    check-assets.mjs
```


## 16. 技术栈选择决策树

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
最快 3D Web 差异化：Three.js + Blender + GLB
国内小游戏：Cocos Creator
客户指定商业引擎：Unity
开源独立游戏学习：Godot
```


## 17. 开源项目和 Demo 学习清单

### Phaser

- 官方仓库：https://github.com/phaserjs/phaser
- 官方示例：https://github.com/phaserjs/examples
- Phaser 3 + Vite 模板：https://github.com/phaserjs/template-vite
- Phaser 3 + TypeScript 模板：https://github.com/phaserjs/template-vite-ts

学习重点：

- Scene
- preload/create/update
- Sprite
- Input
- Arcade Physics
- Animation
- Sound
- Scale Manager

### Three.js

- 官方仓库：https://github.com/mrdoob/three.js/
- 官方示例：https://threejs.org/examples/
- Three.js manual：https://threejs.org/manual/
- glTF sample models：https://github.com/KhronosGroup/glTF-Sample-Models
- React Three Fiber：https://github.com/pmndrs/react-three-fiber
- drei：https://github.com/pmndrs/drei

学习重点：

- Scene
- Camera
- Renderer
- Mesh
- Material
- Light
- Raycaster
- GLTFLoader
- AnimationMixer
- Resize
- Texture / dispose

### Cocos Creator

- 引擎仓库：https://github.com/cocos/cocos-engine
- 官方文档：https://docs.cocos.com/creator/manual/en/
- 示例集合：https://github.com/cocos/cocos-example-projects

学习重点：

- Scene
- Node
- Component
- Prefab
- Animation
- Physics
- Build targets
- 小游戏平台适配

### Godot

- 引擎仓库：https://github.com/godotengine/godot
- 官方 demo：https://github.com/godotengine/godot-demo-projects
- 官方文档：https://docs.godotengine.org/

学习重点：

- Node
- Scene
- Signal
- GDScript
- Input
- Physics
- Export
- Web export 限制

### Unity

- 官方示例：https://github.com/Unity-Technologies
- 官方学习：https://learn.unity.com/
- 官方文档：https://docs.unity3d.com/

学习重点：

- Scene
- GameObject
- Component
- Prefab
- Animator
- Rigidbody
- Collider
- Build Settings
- WebGL build

### Playable Ads / MRAID

- Google playable ads：https://support.google.com/google-ads/answer/9981650
- AppLovin creative specs：https://support.applovin.com/en/growth/promoting-your-apps/welcome-to-applovin/creative-specs-and-guidelines
- ironSource playable requirements：https://developers.is.com/ironsource-mobile/general/playable-ad-requirements/
- TikTok playable ads：https://ads.tiktok.com/help/article/playable-ads
- MRAID spec：https://www.iab.com/guidelines/mobile-rich-media-ad-interface-definitions-mraid/

学习重点：

- single HTML / ZIP
- no external requests
- mraid.open
- CTA
- first interaction audio
- load time
- size limit


## 18. 验收清单

### 18.1 游戏体验

- [ ] 5 秒内知道怎么玩
- [ ] 10 秒内有反馈
- [ ] 30-60 秒可完成一轮
- [ ] 有明确胜利 / 失败
- [ ] 有重开
- [ ] 有音效
- [ ] 有基础动画
- [ ] 英文界面自然
- [ ] 按钮和触摸区域足够大
- [ ] 不像调试 Demo

### 18.2 移动端

- [ ] iPhone Safari 可玩
- [ ] Android Chrome 可玩
- [ ] 竖屏 / 横屏符合目标
- [ ] 触摸不误触
- [ ] 页面不会滚动干扰
- [ ] 音频在用户交互后播放
- [ ] 切后台再回来不乱
- [ ] 广告前后能暂停和恢复
- [ ] 不明显掉帧

### 18.3 技术

- [ ] 构建可复现
- [ ] 资源路径正确
- [ ] 没有控制台报错
- [ ] 包体符合目标平台
- [ ] 无外部不可控依赖
- [ ] PlatformAdapter 边界清楚
- [ ] GameCore 不直接调用平台 SDK
- [ ] 有最小 analytics events
- [ ] 有错误日志或调试方式

### 18.4 平台

- [ ] 已阅读目标平台最新文档
- [ ] SDK 初始化正确
- [ ] 广告调用时机符合规则
- [ ] 支付 / IAP 权益服务端可校验
- [ ] 不使用平台禁止的外链
- [ ] 不接第三方冲突广告
- [ ] 包体和文件数量符合要求
- [ ] 截图、图标、描述完整
- [ ] 隐私和版权记录完整

### 18.5 商业

- [ ] 有作品链接
- [ ] 有 30 秒录屏
- [ ] 有截图
- [ ] 有报价说明
- [ ] 有可交付范围
- [ ] 有可修改次数
- [ ] 有是否交源码说明
- [ ] 有平台规格说明
- [ ] 有客户反馈记录


## 19. 最小商业交付包

每个游戏至少准备：

```
1. playable URL
2. source code zip
3. production build zip
4. screenshots
5. 30s video
6. README
7. platform notes
8. asset license record
9. pricing / delivery note
```

README 应包含：

- 游戏名
- 一句话玩法
- 操作方式
- 技术栈
- 构建命令
- 平台适配情况
- 已知限制
- 资产来源

客户交付说明应包含：

- 是否包含源码
- 是否包含素材版权
- 是否包含平台接入
- 是否包含广告 SDK
- 是否包含多语言
- 是否包含横竖屏
- 修改次数
- 交付周期


## 20. 你应该怎么用 Codex / Claude

### 20.1 不要这样提问

```
帮我做一个小游戏
```

这个太空，AI 会随机发挥。

### 20.2 应该这样提问

```
我要做一个面向 CrazyGames 投稿和 Playable Ads 改版的 HTML5 小游戏。

技术栈：
Phaser + TypeScript + Vite

目标设备：
mobile first，竖屏 9:16，桌面也能玩

玩法：
玩家拖动挡板接住下落物，接到同色加分，接错扣血，60 秒结算。

必须包含：
- menu scene
- play scene
- result scene
- touch input
- audio unlock
- PlatformAdapter interface
- WebAdapter
- analytics events
- responsive layout

禁止：
- 不要引入大型依赖
- 不要使用外部图片 URL
- 不要直接调用平台 SDK，先走 adapter

验收：
- npm run build 成功
- 手机浏览器可玩
- 无 console error
- 一局 60 秒
- 英文界面
```

### 20.3 让 AI 并行的关键

你要把文件边界拆开。

```
agent A：只做 src/game/core
agent B：只做 src/game/scenes
agent C：只做 src/platform
agent D：只做 assets 和压缩
agent E：只做 docs 和投稿材料
agent F：只做 review 和 test
```

不要让多个 agent 同时改同一个文件。


## 21. 一周 Todo 清单

### Day 1

- [ ] 选择主渠道：Playable Ads / CrazyGames / itch.io
- [ ] 选择副渠道
- [ ] 写 1 页 game brief
- [ ] 确定技术栈
- [ ] 找 3 个同类竞品
- [ ] 写验收清单
- [ ] 初始化项目模板

### Day 2

- [ ] 实现核心玩法
- [ ] 实现开始 / 失败 / 胜利 / 重开
- [ ] 接入基础音效
- [ ] 手机浏览器测试
- [ ] 录制第一版视频

### Day 3

- [ ] 替换占位素材
- [ ] 统一 UI
- [ ] 加动画和反馈
- [ ] 做图标和封面
- [ ] 建立资产版权记录
- [ ] 压缩图片和音频

### Day 4

- [ ] 抽象 PlatformAdapter
- [ ] 实现 WebAdapter
- [ ] 实现目标平台 Adapter
- [ ] 加 analytics events
- [ ] 加 pause/resume
- [ ] 打生产包

### Day 5

- [ ] 发布展示页
- [ ] 整理截图
- [ ] 整理 30 秒录屏
- [ ] 写英文介绍
- [ ] 写报价说明
- [ ] 向 5-20 个潜在渠道/客户发送 Demo

### Day 6

- [ ] 收集反馈
- [ ] 修复移动端问题
- [ ] 优化首屏加载
- [ ] 优化新手引导
- [ ] 做 1 个换皮版本
- [ ] 做 1 个 playable ad 规格版本

### Day 7

- [ ] 复盘数据
- [ ] 判断继续 / 调整 / 停止
- [ ] 形成模板
- [ ] 记录平台接入经验
- [ ] 更新报价
- [ ] 规划第二款游戏


## 22. 第二阶段升级路线

### 第 1-2 周

目标：

```
形成 1 个可复用 HTML5 游戏模板
```

重点：

- Phaser 或 Three.js 主栈稳定
- PlatformAdapter 稳定
- playable build 稳定
- 移动端测试流程稳定
- 有 2-3 个作品链接

### 第 3-4 周

目标：

```
形成可报价服务
```

重点：

- playable ads 报价包
- reskin 服务
- 平台投稿服务
- 模板售卖
- 形成案例页

### 第 2-3 月

目标：

```
进入更高价值渠道
```

可选方向：

- Cocos Creator 国内小游戏
- Telegram Mini Apps
- Discord Activities
- Unity 客户单
- Three.js 3D playable ads
- 游戏模板商城


## 23. 常见误区

### 误区 1：先系统学完游戏引擎

不需要。

你要先知道渠道要什么，再围绕目标学习最小必要知识。

### 误区 2：AI 能解决全部问题

AI 能降低开发成本，但不能替你确认：

- 平台规则
- 版权
- 商业需求
- 用户反馈
- 真机性能
- 客户付款

### 误区 3：Three.js 不是游戏框架，所以不能用

不准确。

Three.js 确实不是完整游戏框架，但 AI-first 下它非常适合：

- 轻 3D 游戏
- 3D 展示互动
- playable ads
- 视觉差异化 Demo

关键不是它是不是“完整引擎”，而是你能不能把游戏范围控制在：

```
AI 能生成
你能验收
手机能跑
平台能接
客户能理解
```

### 误区 4：上线平台就能赚钱

不准确。

平台上传只是开始。收入取决于：

- 审核通过
- 获得流量
- 留存
- 时长
- 广告填充
- 地区
- 玩法质量
- 迭代能力

### 误区 5：低价单没有价值

也不准确。

低价单可以用来：

- 练交付
- 拿真实需求
- 做案例
- 验证流程

但不能长期停留在低价单。你的目标应该是把低价单沉淀成：

```
模板
作品集
报价包
平台适配经验
客户案例
```


## 24. 最推荐的起步方案

如果现在就开始，不要纠结“唯一正确技术栈”，而是按目标选第一款。

目标是视觉差异化、Playable Ads 样片、作品集展示：

```
第一款：
轻 3D 拖拽 / 点击游戏

技术栈：
Three.js + TypeScript + Vite + Blender + GLB

同时准备：
1. Web 展示版
2. Playable Ads 版
3. CrazyGames 投稿版

原因：
1. 能体现 AI + Three.js 的视觉优势
2. 能让你学习 Blender / GLB / WebGL 资产管线
3. 可做广告试玩
4. 可做平台投稿
5. 可展示给客户
```

目标是最快完成 2D 平台投稿、可维护模板和批量换皮：

```
第一款：
2D 合成 / 堆叠 / 排序游戏

技术栈：
Phaser + TypeScript + Vite

同时准备：
1. Web 展示版
2. CrazyGames 投稿版
3. Playable Ads 简化版
```

我的倾向：

```
你已经有开发能力，又有 Codex / Claude / 多 agent，
可以直接把 Three.js + Blender + GLB 纳入第一批路线。
这不是因为 Three.js 变成了完整游戏引擎，
而是因为 AI 能显著降低 WebGL 场景、交互、资产加载和移动端适配的实现成本。

前提是：
玩法要轻，验收要硬，平台规则要先查。
```


## 25. 本文档和旧 Todo.md 的关系

旧 `Todo.md` 更像连续讨论后的累积记录。

这份文档重新定义为主文档：

```
AI游戏副业作战手册.md
  - 保留 AI-first 前提
  - 按平台和变现倒推技术栈
  - 明确 Three.js / Blender / glTF 的位置
  - 明确 PlatformAdapter 的边界
  - 明确一周商业闭环
  - 明确多 agent 工作流
```

建议后续处理：

```
1. 先把本文档作为主文档使用
2. 从 Todo.md 里只迁移仍有价值的链接或细节
3. 确认无遗漏后，再删除或归档 Todo.md
```

本次已显式迁入：

- Three.js / Blender / glTF / GLB
- 平台规则复查矩阵
- GameSnacks / Poki / Playable Ads 的硬约束
- 长尾渠道和交易市场
- CodeCanyon / Envato / Upwork / Fiverr / Freelancer
- 押金、买断、独占、源码交付、素材版权等接单风险

仍建议保留旧 `Todo.md` 到至少完成第一款游戏后再删，因为第一款实战中可能还会发现历史讨论里有可用细节。


## 26. 下一步

你现在最应该做的不是继续泛泛研究，而是选一个第一款游戏。

建议决策只保留两个选项：

```
选项 A：Phaser 2D 合成 / 排序游戏
目标：最快完成平台投稿和 playable ad 改版

选项 B：Three.js 轻 3D 拖拽 / 点击游戏
目标：用 AI + Blender + GLB 做出视觉差异化作品
```

选定后，立刻产出：

- `game-brief.md`
- `platform-targets.md`
- `acceptance-checklist.md`
- 项目模板
- 第一版 playable prototype

不要再以“我还不懂游戏开发”为暂停理由。

你真正要补的是：

```
平台规则
玩法结构
资产管线
验收标准
商业对接
```

这些都可以边做边学，并且非常适合 AI-first 工作流。
