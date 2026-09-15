# 游戏开发框架宇宙扫盲

这篇文档回答一个问题：你只有后端开发经验，想用 AI 做游戏副业时，应该怎样从 0 建立游戏开发的完整地图，而不是被 Phaser、Unity、Godot、Blender、Shader、ECS、Playable Ads 这些词砸晕。

本文负责：

- 从第一性原理解释“游戏到底是什么”
- 从游戏诞生讲到现代 3A（高预算、高体量、高制作规格商业大作）
- 梳理游戏开发语言、框架、引擎、工具、后端、资产、发布、变现
- 解释常见游戏英文术语，并在出现处给中文含义
- 帮你判断不同框架属于哪一类、解决什么问题、适合什么副业路径

本文不负责：

- 替代具体框架教程
- 给所有工具做逐 API 讲解
- 保证每个小众框架都收录
- 替代平台官方文档审核

正确读法：

1. 先读“根本问题表”，建立骨架。
2. 再读“游戏循环”和“框架宇宙”，搞懂技术栈为什么这样分。
3. 最后读“从副业到 3A”，理解个人副业和大型游戏工业的边界。

## 核心洞察

游戏开发不是“学某个框架”，而是持续回答七个根本问题：玩家做什么、世界怎么变化、画面怎么呈现、内容怎么生产、代码怎么组织、平台怎么发布、钱和数据怎么闭环。

## 根本问题表

| 根本问题 | 通俗说法 | 具体答案 | 常用度 |
| --- | --- | --- | --- |
| 玩家做什么 | 用户怎么参与 | Input（输入）、操作反馈、目标、失败和奖励 | 地基 |
| 世界怎么变化 | 游戏每一帧怎么推进 | Game Loop（游戏循环）、State（状态）、Rules（规则）、Physics（物理） | 地基 |
| 画面和声音怎么出来 | 玩家看到和听到什么 | Render（渲染）、Animation（动画）、Audio（音频）、UI（界面） | 地基 |
| 内容从哪里来 | 角色、地图、关卡、剧情怎么生产 | Asset Pipeline（资产管线）、Blender（3D 建模工具）、Aseprite（像素绘图工具）、Tiled（地图编辑器） | 地基 |
| 工程怎么组织 | 代码和资源怎么不乱 | Scene（场景）、Entity（实体）、Component（组件）、Prefab（预制体）、ECS（实体组件系统） | 地基 |
| 游戏跑在哪里 | 浏览器、手机、PC、主机还是平台容器 | Web、Mobile、PC、Console、Mini Game、Playable Ads、Cloud | 地基 |
| 怎么商业闭环 | 怎么上线、留存、变现、迭代 | Analytics（数据分析）、Ads（广告）、IAP（应用内购买）、LiveOps（线上运营） | 进阶 |

## 先从游戏的诞生理解

游戏最早不是代码，而是“规则 + 参与 + 反馈”。

```
棋类 / 牌类 / 球类
    |
    v
规则被写进机器：街机、主机、PC
    |
    v
画面、声音、输入设备、存档、网络、支付逐渐复杂
    |
    v
现代游戏 = 规则系统 + 内容系统 + 技术系统 + 商业系统
```

所以游戏和普通后端系统的最大区别是：

| 后端系统 | 游戏系统 |
| --- | --- |
| 主要处理一次次请求 | 主要处理一帧帧世界变化 |
| Request -> Service -> DB -> Response | Input（输入）-> Update（更新）-> Rules/Physics（规则/物理）-> Render（渲染） |
| 用户等接口响应 | 玩家持续操作，系统持续反馈 |
| 数据一致性是主线 | 手感、反馈、性能、沉浸感是主线 |
| 多数界面可慢一点 | 一帧卡顿就影响体验 |

用费曼学习法讲：

> 后端像餐厅点餐：客人来一次，服务员接单，厨房做菜，上菜，结束。
>
> 游戏像正在运转的游乐设施：玩家一直操作，机器每秒几十次检查玩家动作、世界状态、碰撞、声音和画面。

这就是你必须先理解 Game Loop（游戏循环）的原因。

## Game Loop：游戏最小心脏

任何电子游戏，不管是贪吃蛇、消消乐、原神、GTA、王者荣耀，本质都绕不开这个循环：

```
Start（启动）
  -> Load Assets（加载资源）
  -> Input（读取输入）
  -> Update（更新状态）
  -> Physics / Rules（物理 / 规则）
  -> Render（渲染画面）
  -> Audio（播放声音）
  -> Next Frame（下一帧）
```

逐个拆：

| 术语 | 中文理解 | 具体发生什么 |
| --- | --- | --- |
| Frame（帧） | 一次画面刷新 | 60 FPS 表示每秒刷新 60 次 |
| FPS（每秒帧数） | 流畅度指标 | 手机 H5 常见目标是 30 或 60 FPS |
| Input（输入） | 玩家操作 | 点击、滑动、键盘、手柄、陀螺仪 |
| Update（更新） | 推进世界 | 玩家移动、敌人追踪、倒计时减少 |
| Physics（物理） | 物理模拟 | 重力、碰撞、速度、反弹、射线检测 |
| Rules（规则） | 游戏规则 | 得分、失败、通关、掉血、奖励 |
| Render（渲染） | 画出来 | 把状态变成 Canvas、WebGL、引擎画面 |
| Audio（音频） | 听觉反馈 | 点击音效、背景音乐、胜利失败音 |
| Delta Time（帧间隔） | 两帧之间过去多久 | 防止不同机器上角色移动速度不同 |

一个极简游戏伪代码：

```js
let state = {
  playerX: 100,
  score: 0,
  gameOver: false
};

function loop(deltaTime) {
  const input = readInput();
  updatePlayer(state, input, deltaTime);
  applyRules(state);
  draw(state);
  requestAnimationFrame(loop);
}
```

你不需要一开始会写完整引擎，但要知道 AI 生成的任何游戏代码都应该能被你归类到这个循环里。

## 游戏技术栈不是一层，而是一栋楼

你看到的“游戏框架：Phaser / PixiJS / Three.js / Cocos Creator / Unity / Godot”是不完整且混合的说法。更准确的分层是：

```
语言层：JavaScript / TypeScript / C# / C++ / GDScript / Lua / Rust / Java / Python
运行时层：Browser / Node 辅助工具 / .NET / JVM / Native / WASM
渲染层：DOM / Canvas 2D / WebGL / WebGPU / OpenGL / DirectX / Vulkan / Metal
框架层：Phaser / PixiJS / Three.js / Babylon.js / MonoGame / libGDX / LÖVE / raylib
引擎层：Unity / Unreal / Godot / Cocos Creator / Defold / GameMaker / Construct / GDevelop
资产层：Blender / Maya / 3ds Max / Aseprite / Spine / Tiled / Audacity / FMOD / Wwise
平台层：Steam / App Store / Google Play / Web 平台 / 小游戏平台 / 广告平台 / Discord / Telegram
商业层：Ads / IAP / Premium / Subscription / Sponsorship / Work-for-hire / LiveOps
```

关键点：

- Library（库）：给你一些能力，你自己组织工程。
- Framework（框架）：给你一套默认组织方式，你按它的生命周期写。
- Engine（引擎）：不仅给代码能力，还给编辑器、场景、资源、构建、调试、发布。
- Editor（编辑器）：可视化摆放对象、调属性、做动画、管理资源。
- Runtime（运行时）：游戏最终跑起来的那套代码和环境。

## 语言宇宙：不同语言在游戏里负责什么

| 语言 | 常见搭配 | 适合什么 | 你该怎么理解 |
| --- | --- | --- | --- |
| JavaScript | Phaser、PixiJS、Three.js、Babylon.js、PlayCanvas | H5、Playable Ads（可试玩广告）、Web 互动 | 你做海外 H5 副业最容易上手 |
| TypeScript | Phaser、Cocos Creator、Three.js、PlayCanvas | 工程化 Web 游戏、小游戏 | 比 JS 更适合 AI 协作和长期维护 |
| C# | Unity、Godot C#、MonoGame | 商业游戏、跨平台、客户项目 | 类似后端强类型业务开发，但生命周期不同 |
| C++ | Unreal、引擎底层、自研引擎 | 3A、性能敏感系统、底层渲染 | 不是副业第一阶段主线 |
| Blueprint | Unreal 可视化脚本 | 关卡逻辑、交互、原型 | 美术/策划也能搭逻辑 |
| GDScript | Godot | 独立游戏、快速原型 | 像 Python，贴合 Godot 节点模型 |
| Lua | Defold、LÖVE、Roblox Luau、部分热更新系统 | 轻量脚本、嵌入式逻辑 | 简单、快写，很多游戏用它做脚本层 |
| Rust | Bevy、Fyrox、自研工具 | 新兴引擎、数据驱动、性能安全 | 潜力大，但商业生态还在成长 |
| Java / Kotlin | libGDX、Android 原生游戏 | Android、跨平台 2D/3D | 存量和特定团队会用 |
| Python | Pygame、工具脚本、资产处理、服务器 | 学习、自动化、后端服务 | 不适合多数商业客户端主线，但适合工具和后端 |

你的优势迁移：

| 你已有后端经验 | 游戏里的对应位置 |
| --- | --- |
| API 设计 | PlatformAdapter（平台适配层）、后端接口、支付回调 |
| 数据库 | 存档、账号、排行榜、经济系统 |
| 缓存 | 会话、排行榜、活动配置、CDN 资源 |
| 日志 | Analytics（数据分析）、埋点、崩溃定位 |
| 任务队列 | 奖励发放、异步结算、反作弊检测 |
| 部署 | Web 游戏托管、后端服务、CI/CD |
| 安全 | 支付验签、排行榜防刷、账号风控 |

## 框架宇宙：不是只有 Phaser / Unity / Godot

“完整游戏框架宇宙”不能按名字硬背，要按解决问题的层级分类。

### 1. 原始底层：自己造发动机

代表：

- C / C++
- SDL（跨平台窗口、输入、音频基础库）
- GLFW（窗口和 OpenGL 上下文）
- OpenGL / DirectX / Vulkan / Metal（图形 API）
- WebGPU（浏览器新一代图形 API）
- raylib（偏学习和轻量项目的游戏编程库）

适合：

- 学底层原理
- 写自研引擎
- 做性能极限优化
- 研究渲染、物理、音频底层

不适合：

- 你第一周变现
- H5 小游戏快速交付
- 缺游戏经验时直接商业化

你应该知道它们存在，因为 Unity、Unreal、Godot 这类引擎底层都在替你处理这些问题。

### 2. Web 2D 游戏框架

代表：

| 框架 | 定位 | 语言 | 适合 |
| --- | --- | --- | --- |
| Phaser | 2D HTML5 游戏框架 | JS / TS | H5 小游戏、平台投稿、教学、广告试玩 |
| PixiJS | 2D 渲染库 | JS / TS | 高性能 2D 渲染、动效、可试玩广告 |
| Excalibur | TypeScript 2D 游戏引擎 | TS | 代码优先的小中型 2D 游戏 |
| Kaboom | 轻量 2D 游戏库 | JS | 教学、原型、小项目 |
| melonJS | HTML5 2D 游戏引擎 | JS | 传统 Web 2D 游戏 |
| CreateJS / EaselJS | Canvas 交互库 | JS | 老项目、广告互动、轻交互 |

怎么理解：

```
浏览器负责运行 JS
Canvas/WebGL 负责画图
Phaser 负责帮你管理场景、输入、动画、物理、声音、资源加载
```

副业价值：

- 最贴近 H5 小游戏
- 交付物容易是静态网页或 ZIP（压缩包）
- AI 生成代码质量相对稳定
- 容易接 CrazyGames、itch.io、Playable Ads 等路径

### 3. Web 3D 渲染库 / 引擎

代表：

| 工具 | 定位 | 语言 | 适合 |
| --- | --- | --- | --- |
| Three.js | Web 3D 渲染库 | JS / TS | 3D 展示、轻 3D 游戏、广告互动、产品可视化 |
| Babylon.js | Web 3D 游戏/渲染引擎 | JS / TS | 更工程化的 Web 3D 游戏、WebXR |
| PlayCanvas | Web 3D 引擎和在线编辑器 | JS / TS | 协作式 Web 3D、浏览器 3D 应用 |
| A-Frame | WebXR/VR 声明式框架 | HTML / JS | VR 展示、轻交互场景 |
| React Three Fiber | React 封装 Three.js | TS / React | React 项目里的 3D UI 和互动 |

你之前纠偏是对的：AI 让 Three.js 的价值上升了。

过去的问题：

- 3D 数学难
- 场景搭建慢
- shader（着色器）难写
- 交互和摄像机调试费时间

AI-first 之后：

- AI 能快速生成 Three.js 场景、相机、光照、材质、动画
- AI 能帮你改 shader（着色器）和性能问题
- Blender + GLB（3D 模型单文件）资产链路更容易打通
- 你不必完全掌握 3D 引擎，也能做出视觉差异化 demo

但判断标准仍然是：

| 问题 | 如果答案是“是” | 技术选择 |
| --- | --- | --- |
| 需要复杂 3D 关卡编辑器吗 | 是 | Unity / Godot / Cocos / Unreal |
| 主要是 3D 展示和轻互动吗 | 是 | Three.js / Babylon.js / PlayCanvas |
| 需要极小广告包体吗 | 是 | 原生 JS / PixiJS / Three.js 谨慎裁剪 |
| 需要多人、物理、角色控制完整系统吗 | 是 | 完整引擎更稳 |

### 4. 完整通用游戏引擎

代表：

| 引擎 | 语言 | 强项 | 弱点 | 副业判断 |
| --- | --- | --- | --- | --- |
| Unity | C# | 商业生态、移动端、2D/3D、资产商店、客户认知 | 授权和版本策略要关注，WebGL 包体较重 | 中长期强，客户项目常见 |
| Unreal Engine | C++ / Blueprint | 3A 画质、影视级渲染、开放世界、大型项目 | 学习和工程复杂度高 | 第一阶段不主攻，但必须知道 |
| Godot | GDScript / C# / C++ | 开源、轻量、2D 强、独立游戏友好 | 平台 SDK 生态和 Web 导出要验证 | 学习完整引擎很好 |
| Cocos Creator | TypeScript | 国内小游戏、多端发布、2D/轻 3D | 海外认知不如 Unity，生态有地域差异 | 国内小游戏和 H5 很重要 |
| Defold | Lua | 轻量、跨平台、移动端、HTML5 | 国内资料少，团队生态小 | 适合轻量项目和学习 |
| GameMaker | GML / 可视化 | 2D 独立游戏、快速制作 | 3D 和大型工程不是主线 | 适合 2D 商业独游 |

怎么理解完整引擎：

```
代码只是其中一部分
完整引擎 = 编辑器 + 场景 + 资源 + 动画 + 物理 + UI + 音频 + 构建 + 调试 + 插件生态
```

如果你只写 Web 后端，最容易低估的是“编辑器”的价值。大型游戏不是纯代码堆出来的，而是大量内容在编辑器里被生产、摆放、调参、测试。

### 5. 低代码 / 可视化游戏工具

代表：

| 工具 | 定位 | 适合 |
| --- | --- | --- |
| Construct 3 | 浏览器里的可视化游戏引擎 | 快速 2D 原型、教育、小商业游戏 |
| GDevelop | 开源 no-code（无代码）游戏引擎 | 新手、教学、快速验证玩法 |
| Buildbox | 低代码移动游戏工具 | 超休闲游戏原型 |
| Stencyl | 可视化 2D 游戏制作 | 教学、简单 2D |
| RPG Maker | RPG 制作工具 | 日式 RPG、剧情向 RPG |
| Ren'Py | 视觉小说引擎 | 文字剧情、视觉小说、轻模拟 |

对你的价值：

- 用来理解游戏概念很快
- 可以拆解玩法
- 可作为原型工具
- 不一定适合你长期工程化，因为你有开发能力，AI + 代码框架的上限更高

### 6. 平台型创作生态

代表：

| 平台 | 语言/工具 | 本质 |
| --- | --- | --- |
| Roblox Studio | Luau | 在 Roblox 生态里做游戏和变现 |
| Fortnite UEFN | Verse / Unreal 工具链 | 在 Fortnite 生态里做地图和体验 |
| Minecraft Mod / Marketplace | Java / Bedrock Add-ons | 围绕 Minecraft 生态做内容 |
| Core | Lua 类工具链 | UGC 游戏平台 |

这类不是“通用引擎”，而是“平台生态内创作”。优势是流量和社交生态，代价是规则、收益、发布都被平台强约束。

### 7. 代码优先 / 专用框架

代表：

| 框架 | 语言 | 适合 |
| --- | --- | --- |
| MonoGame | C# | 代码优先 2D/跨平台，类似 XNA 精神续作 |
| libGDX | Java | Java 跨平台 2D/3D 游戏 |
| LÖVE / Love2D | Lua | 轻量 2D 独立游戏和原型 |
| Bevy | Rust | ECS（实体组件系统）和数据驱动游戏 |
| Pygame | Python | 学习、教学、原型，不是主流商业发布 |
| PICO-8 | Lua 方言 | Fantasy Console（幻想主机），适合极小创意游戏 |

这类工具对“理解游戏原理”很好，因为它们不把所有东西藏进编辑器。

### 8. 查漏补缺名单：看到这些名字怎么归类

你不需要第一阶段都学，但要能看见名字就知道它大概在哪一层。

| 名称 | 分类 | 主要语言/方式 | 一句话理解 |
| --- | --- | --- | --- |
| LayaAir | 国内 H5/小游戏引擎 | TypeScript / JavaScript | 国内小游戏和 H5 存量生态常见 |
| Egret（白鹭） | 国内 H5/小游戏老生态 | TypeScript | 老项目和存量代码里可能遇到 |
| Solar2D | 2D 跨平台引擎 | Lua | 轻量移动 2D 游戏 |
| HaxeFlixel | 2D 游戏框架 | Haxe | 代码优先 2D 独立游戏 |
| OpenFL | 多平台框架 | Haxe | 类似 Flash 思路的跨平台显示框架 |
| Heaps.io | 游戏框架 | Haxe | Dead Cells 等项目让它被更多人知道 |
| Flax Engine | 3D/2D 引擎 | C# / C++ | 类 Unity 的现代引擎 |
| Stride | 开源 C# 游戏引擎 | C# | C# 生态里的完整引擎 |
| O3DE | 开源 3D 引擎 | C++ | 源自 Lumberyard 的大型 3D 引擎 |
| CryEngine | 3D 引擎 | C++ / Schematyc | 高画质 3D 引擎，商业使用门槛较高 |
| Panda3D | 3D 引擎 | Python / C++ | 教学、仿真、Python 友好 |
| Ogre3D | 3D 渲染引擎 | C++ | 更偏渲染，不是完整游戏引擎 |
| jMonkeyEngine | 3D 游戏引擎 | Java | Java 生态 3D 引擎 |
| raylib | 游戏编程库 | C / 多语言绑定 | 学底层和快速原型很友好 |
| SDL | 多媒体基础库 | C / C++ | 窗口、输入、音频、图像基础能力 |
| SFML | 多媒体库 | C++ | 比 SDL 更面向对象的轻量游戏基础库 |
| Flame | Flutter 游戏引擎 | Dart | Flutter 生态做轻量 2D 游戏 |
| SpriteKit | Apple 2D 游戏框架 | Swift / Objective-C | iOS/macOS 原生 2D |
| SceneKit | Apple 3D 框架 | Swift / Objective-C | Apple 原生 3D 场景 |
| Metal | Apple 图形 API | Swift / C++ | Apple 平台底层 GPU 编程 |
| Twine | 互动小说工具 | 可视化 / HTML | 文字分支叙事 |
| Ink | 叙事脚本语言 | Ink Script | 对话和剧情分支 |
| Adventure Game Studio | 冒险游戏引擎 | AGS Script | 传统点击式冒险游戏 |
| Bitsy | 极简叙事游戏工具 | 可视化 | 小型像素叙事游戏 |

3A 或大型商业游戏里还常见 Proprietary Engine（自研/私有引擎）：

| 名称 | 常见归属 | 你该怎么理解 |
| --- | --- | --- |
| Frostbite | EA | 大型商业自研引擎，不是普通开发者主线 |
| Decima | Guerrilla / Sony 生态 | 高规格 3D 开放世界相关 |
| RAGE | Rockstar | GTA、Red Dead Redemption 背后的自研技术体系 |
| RE Engine | Capcom | 生化危机、鬼泣等项目使用 |
| id Tech | id Software | FPS 和渲染技术历史影响大 |
| Source / Source 2 | Valve | 半条命、Dota、CS 生态相关 |
| Anvil | Ubisoft | 刺客信条等大型项目相关 |

这些名字的意义不是“你要去学”，而是让你知道：3A 里很多能力不是靠公开框架直接拼出来的，而是长期积累的工具链、资产管线和工程体系。

## 中间件宇宙：游戏公司不会所有东西都自己写

Middleware（中间件）就是游戏项目里可接入的专业能力模块。

| 类别 | 常见工具 | 解决什么问题 |
| --- | --- | --- |
| 2D 物理 | Box2D、Matter.js、Planck.js | 碰撞、重力、刚体 |
| 3D 物理 | PhysX、Havok、Bullet、Jolt | 复杂物理、角色碰撞、载具 |
| 音频 | FMOD、Wwise | 音效管理、混音、动态音乐 |
| 2D 骨骼动画 | Spine、DragonBones、Live2D | 角色动画、纸片人、立绘动态 |
| 视觉特效 | Niagara、Shuriken、粒子系统 | 爆炸、烟雾、技能特效 |
| 植被/自然 | SpeedTree | 树木和自然环境资产 |
| 材质纹理 | Substance Painter、Substance Designer | PBR 材质和贴图制作 |
| 程序化内容 | Houdini | 程序化建模、地形、特效 |
| 模型优化 | Simplygon、Blender Decimate | 减面、LOD（细节层级） |
| 崩溃监控 | Sentry、Firebase Crashlytics | 线上错误和崩溃定位 |
| 版本控制 | Git LFS、Perforce | 大型二进制资产和团队协作 |
| 构建发布 | Jenkins、TeamCity、GitHub Actions | 自动构建、测试、打包 |

副业阶段的判断：

- Web/H5 小游戏：优先少用中间件，减少包体和接入复杂度。
- 3D demo：Blender + GLB + Three.js/Babylon.js 往往够用。
- Unity/Unreal 商业项目：中间件价值会快速上升。
- 3A：中间件和自研工具会成为生产力核心。

## 游戏设计宇宙：代码之外你必须知道的词

游戏不是功能列表，而是体验系统。

| 术语 | 中文理解 | 说明 |
| --- | --- | --- |
| Genre（品类） | 游戏类型 | 跑酷、消除、RPG、FPS、SLG、MOBA、塔防 |
| Core Loop（核心循环） | 玩家反复做的事 | 操作、反馈、奖励、再挑战 |
| Meta Game（局外成长） | 一局之外的成长系统 | 升级、装备、卡牌、角色养成 |
| Progression（进度） | 玩家如何变强或前进 | 关卡、等级、技能树 |
| Economy（经济系统） | 资源如何产出和消耗 | 金币、钻石、体力、道具 |
| Balance（平衡） | 难度和数值是否合理 | 敌人血量、奖励、价格、冷却 |
| Level Design（关卡设计） | 关卡如何引导玩家 | 教学、节奏、障碍、奖励 |
| Difficulty Curve（难度曲线） | 难度怎么变 | 太平会无聊，太陡会流失 |
| FTUE（首次用户体验） | 第一次打开游戏的体验 | 教学、首局、首个奖励 |
| Session（单次游玩） | 一次打开玩多久 | 超休闲可能 30 秒，RPG 可能 20 分钟 |
| Retention（留存） | 玩家会不会回来 | 商业游戏关键指标 |
| Monetization（变现） | 游戏如何赚钱 | 广告、内购、买断、订阅、赞助 |

你用 AI 做游戏时，最容易让 AI 写代码，最难让 AI 自动做对的是这些体验判断。

## 角色分工宇宙：大型游戏为什么需要那么多人

| 角色 | 负责什么 | 你副业阶段如何替代 |
| --- | --- | --- |
| Game Designer（游戏策划） | 玩法、规则、数值、关卡 | 你自己 + AI 拆玩法 |
| Gameplay Programmer（玩法程序） | 操作、战斗、规则、交互 | Codex/Claude 主力生成 |
| Engine Programmer（引擎程序） | 渲染、内存、工具、平台 | 第一阶段尽量用现成引擎 |
| Technical Artist / TA（技术美术） | 美术和程序之间的桥 | AI + Blender 基础操作 |
| 2D Artist（2D 美术） | UI、角色、场景、图标 | AI 图像 + 素材站 + 简单修改 |
| 3D Artist（3D 美术） | 模型、材质、场景 | AI 3D + Blender 清理 |
| Animator（动画师） | 角色动作、过场动画 | 模板动画 + AI + 引擎动画系统 |
| Sound Designer（音效设计） | 音效和声音反馈 | 素材站 + AI 音频 + Audacity |
| QA Tester（测试） | 找 bug 和兼容性问题 | 真机 checklist + AI 写测试计划 |
| Producer（制作人） | 排期、范围、资源协调 | 你自己控制 scope（范围） |
| LiveOps（线上运营） | 活动、数据、版本节奏 | 第二阶段再补 |

## 常见游戏概念全图

### 场景和对象

| 术语 | 中文理解 | 说明 |
| --- | --- | --- |
| Scene（场景） | 游戏中的一个页面或世界片段 | 菜单、关卡、结算页都可以是场景 |
| Entity（实体） | 游戏世界里的一个东西 | 玩家、敌人、子弹、金币 |
| GameObject（游戏对象） | Unity 常用对象模型 | 一个对象挂多个组件 |
| Node（节点） | Godot/Cocos 常用对象模型 | 场景树上的一个节点 |
| Component（组件） | 给对象添加能力 | 碰撞、渲染、脚本、声音 |
| Prefab（预制体） | 可复用对象模板 | 敌人模板、道具模板、UI 弹窗模板 |
| Script（脚本） | 挂在对象上的逻辑 | 控制移动、攻击、交互 |

后端类比要克制，但可以这样理解：

```
后端对象：User + Order + Payment
游戏对象：Player + Enemy + Bullet

后端服务：UserService.updateProfile()
游戏脚本：PlayerController.updateMovement()
```

### 2D 画面

| 术语 | 中文理解 | 说明 |
| --- | --- | --- |
| Sprite（精灵） | 2D 图片对象 | 玩家、敌人、金币 |
| Texture（贴图） | 图片资源 | PNG、JPG、WebP |
| Spritesheet（精灵图集） | 多张小图合成一张大图 | 降低加载和切换成本 |
| Tilemap（瓦片地图） | 用小格子拼地图 | 平台跳跃、RPG 地图常用 |
| Parallax（视差滚动） | 远近背景不同速度移动 | 增加空间感 |
| Particle（粒子） | 大量小图形成特效 | 爆炸、火花、烟雾 |

### 3D 画面

| 术语 | 中文理解 | 说明 |
| --- | --- | --- |
| Mesh（网格） | 3D 模型的几何形状 | 顶点、边、面组成 |
| Material（材质） | 表面表现 | 金属、木头、玻璃、塑料 |
| Texture（贴图） | 材质使用的图片 | 颜色、法线、粗糙度等 |
| Shader（着色器） | GPU 上运行的画面程序 | 控制光照、材质、特效 |
| Camera（相机） | 观察世界的视角 | 第一人称、第三人称、俯视 |
| Light（灯光） | 照明 | 平行光、点光、聚光 |
| Rig（骨骼） | 角色动画骨架 | 控制角色动作 |
| Animation Clip（动画片段） | 一段动作 | 走路、跑步、攻击 |
| GLB（3D 模型单文件） | 适合 Web 传输的 3D 模型文件 | 常由 Blender 导出 |
| LOD（细节层级） | 远处用低精度模型 | 优化性能 |

### 物理和碰撞

| 术语 | 中文理解 | 说明 |
| --- | --- | --- |
| Collider（碰撞体） | 用来判断碰撞的形状 | 盒子、圆、胶囊、网格 |
| Rigidbody（刚体） | 受物理影响的物体 | 重力、速度、力 |
| Trigger（触发器） | 只检测进入，不挡住 | 捡金币、进入区域 |
| Raycast（射线检测） | 从一点发射一条线检测命中 | 鼠标点选、射击、地面检测 |
| Character Controller（角色控制器） | 控制角色移动的专用系统 | 比纯物理更容易调手感 |
| NavMesh（导航网格） | AI 寻路用的可走区域 | 敌人绕障碍追玩家 |

### UI 和反馈

| 术语 | 中文理解 | 说明 |
| --- | --- | --- |
| HUD（抬头显示） | 游戏内常驻信息 | 血条、分数、倒计时 |
| Menu（菜单） | 开始、暂停、设置 | 游戏外层操作 |
| Tween（补间动画） | 从 A 平滑变化到 B | 按钮弹动、数字滚动 |
| Haptic（触觉反馈） | 手机震动 | 增强点击和碰撞反馈 |
| Juice（爽感反馈） | 让操作更有感觉的细节 | 屏幕震动、粒子、音效、慢动作 |
| Onboarding（新手引导） | 教玩家怎么玩 | 第一次体验极关键 |

### 数据和商业

| 术语 | 中文理解 | 说明 |
| --- | --- | --- |
| Analytics（数据分析） | 埋点和指标 | 开始、失败、通关、广告点击 |
| Retention（留存） | 玩家是否回来 | D1、D7 留存常见 |
| ARPU（每用户平均收入） | 总收入 / 用户数 | 商业指标 |
| IAP（应用内购买） | 游戏内付费 | 道具、皮肤、会员 |
| Ads（广告） | 广告变现 | 激励视频、插屏、横幅 |
| Rewarded Video（激励视频） | 看广告得奖励 | 移动游戏常见 |
| LiveOps（线上运营） | 上线后的活动和迭代 | 活动、赛季、礼包、版本更新 |
| A/B Test（AB 测试） | 两个版本对比数据 | 测玩法、价格、UI |

## 资产管线：游戏不只是代码

游戏内容生产可以理解为：

```
概念设计
  -> 原画 / 模型 / 音效 / 动画
  -> 格式转换
  -> 压缩优化
  -> 导入引擎
  -> 场景摆放
  -> 真机测试
  -> 版权记录
```

常见资产类型：

| 类型 | 常见格式 | 工具 | 注意点 |
| --- | --- | --- | --- |
| 2D 图片 | PNG、JPG、WebP、SVG | Aseprite、Photoshop、Figma、TexturePacker | 包体、透明通道、图集 |
| 3D 模型 | glTF、GLB、FBX、OBJ | Blender、Maya、3ds Max | 面数、贴图、骨骼、动画 |
| 音效 | MP3、OGG、WAV | Audacity、Reaper、FMOD、Wwise | 体积、延迟、授权 |
| 字体 | TTF、OTF、WOFF | 字体网站、FontForge | 授权、多语言 |
| 地图 | JSON、TMX、引擎场景文件 | Tiled、引擎编辑器 | 坐标、碰撞层、对象层 |
| 配置 | JSON、CSV、YAML | 表格、后台、脚本 | 版本、校验、热更新 |

Blender（3D 建模工具）在 AI-first 游戏副业里的价值：

- 清理 AI 生成的 3D 模型
- 减少面数，降低移动端压力
- 合并材质，减少 draw call（绘制调用）
- 调整坐标轴和尺寸
- 导出 GLB（3D 模型单文件）
- 检查动画和骨骼是否正常

## 游戏后端：不是每个游戏都需要，但商业化经常需要

纯 H5 小游戏可能不需要后端。但下面这些能力一旦出现，就会用到你的后端经验：

| 能力 | 后端职责 | 常见技术 |
| --- | --- | --- |
| Account（账号） | 登录、身份、会话 | OAuth、JWT、平台登录 |
| Save（存档） | 存玩家进度 | PostgreSQL、Redis、对象存储 |
| Leaderboard（排行榜） | 排名、防刷、赛季结算 | Redis Sorted Set、PostgreSQL |
| Payment（支付） | 订单、验签、发货 | Stripe、平台支付、Webhook |
| Entitlement（权益） | 玩家买了什么 | 权益表、缓存、签名 |
| Matchmaking（匹配） | 找对手或队友 | 队列、房间服务 |
| Multiplayer（多人） | 同步状态 | WebSocket、UDP、房间服务器 |
| Telemetry（遥测） | 收集行为和性能数据 | PostHog、GA4、自建事件表 |
| Remote Config（远程配置） | 动态调参数 | JSON 配置、灰度、版本控制 |
| Anti-cheat（反作弊） | 防刷分、防篡改 | 服务端校验、异常检测 |

副业阶段的判断：

| 项目类型 | 是否需要后端 |
| --- | --- |
| Playable Ads（可试玩广告） | 通常不需要，甚至常常禁止外部请求 |
| 纯展示 H5 demo | 不需要 |
| Web 平台小游戏 | 看平台能力，可能只用平台 SDK |
| 排行榜/账号/存档 | 需要或使用平台云能力 |
| Telegram / Discord 社交游戏 | 通常需要 |
| IAP（应用内购买） | 强烈建议需要服务端验签 |
| 多人实时游戏 | 需要，且复杂度明显上升 |

## 从小游戏到 3A：规模差异在哪里

### 个人 H5 小游戏

典型团队：

- 1 个开发
- AI 辅助代码和素材
- 少量开源或 AI 素材
- 1-2 周做 demo

核心问题：

- 玩法是否 10 秒可理解
- 手机端是否顺滑
- 包体是否合格
- 平台是否可提交
- 是否能报价或拿到分成

### 独立游戏

典型团队：

- 1-10 人
- 可能持续 3 个月到数年
- 更重视创意、美术风格、完成度

核心问题：

- 是否有足够内容量
- 是否能打磨手感
- 是否有发行和社区运营
- 是否能上 Steam、itch.io、移动商店

### AA / 中型商业游戏

典型团队：

- 数十人到上百人
- 专职程序、美术、策划、制作人、QA（质量测试）

核心问题：

- 内容生产效率
- 工具链
- 性能优化
- 平台认证
- 项目管理

### 3A 大作

3A 不是一种技术栈，而是一种工业规模。

通常包含：

| 方向 | 具体系统 |
| --- | --- |
| Engine Team（引擎团队） | 渲染、内存、资源加载、工具、平台适配 |
| Gameplay Team（玩法团队） | 战斗、移动、任务、交互、AI |
| Rendering Team（渲染团队） | 光照、阴影、后处理、材质、性能 |
| Animation Team（动画团队） | 动作捕捉、状态机、角色动画 |
| Tools Team（工具团队） | 编辑器插件、自动化、构建农场 |
| Art Team（美术团队） | 角色、场景、特效、UI、技术美术 |
| Design Team（策划团队） | 关卡、数值、经济、任务、叙事 |
| Audio Team（音频团队） | 音效、音乐、语音、中间件 |
| QA Team（测试团队） | 功能测试、兼容性、平台认证 |
| Backend Team（后端团队） | 账号、匹配、存档、支付、活动 |
| LiveOps Team（运营团队） | 赛季、活动、礼包、社区 |

3A 的技术难点：

- 巨量资产如何加载，不让玩家等太久
- 开放世界如何 Streaming（流式加载）
- 角色动画如何自然切换
- NPC AI（非玩家角色智能）如何可信
- 物理和碰撞如何稳定
- 多平台性能如何一致
- 大团队如何避免互相阻塞
- 构建、测试、发布如何自动化

所以从副业视角看 3A，你不是要一周做 3A，而是要理解它把哪些问题放大了：

```
小游戏：一个人能同时关心玩法、画面、发布、变现
3A：每个子问题都会变成一个团队甚至一个部门
```

## 如何看懂任何游戏框架

以后你遇到一个新框架，不要先问“火不火”，按 10 个问题扫：

| 问题 | 你要找什么 |
| --- | --- |
| 它跑在哪里 | Web、Mobile、PC、Console、平台容器 |
| 它用什么语言 | JS、TS、C#、C++、Lua、Rust、GDScript |
| 它是库、框架还是引擎 | 只负责渲染，还是有编辑器和构建 |
| 它怎么组织对象 | Scene、Node、GameObject、Entity、Component、ECS |
| 它怎么画 | Canvas、WebGL、WebGPU、OpenGL、DirectX、Vulkan |
| 它怎么处理输入 | Touch、Mouse、Keyboard、Gamepad |
| 它有没有物理 | Arcade Physics、Box2D、Bullet、PhysX、Jolt |
| 它怎么管资源 | Loader、Asset Bundle、Addressables、Content Pipeline |
| 它怎么发布 | HTML、ZIP、APK、IPA、EXE、Steam、Console 包 |
| 它怎么接平台 | SDK、广告、支付、存档、排行榜、审核 |

只要这 10 个问题能回答，你就不会被新名词带偏。

## 副业视角的技术栈选择

你的目标不是“成为所有引擎专家”，而是用 AI 把商业链路跑通。

### 最短变现路径

| 渠道/产品 | 优先技术栈 | 原因 |
| --- | --- | --- |
| Playable Ads（可试玩广告） | 原生 JS / PixiJS / Phaser / Three.js | 交付通常是 HTML/ZIP，包体和移动端体验关键 |
| 海外 H5 平台 | Phaser / Three.js / Cocos Creator / Unity WebGL / Godot Web | 平台接受 Web 游戏，SDK 接入是重点 |
| 3D 视觉 demo | Three.js / Babylon.js / PlayCanvas + Blender + GLB | AI 能快速生成视觉差异化 |
| 国内小游戏 | Cocos Creator / Unity / LayaAir | 国内生态和平台适配更成熟 |
| 客户指定商业项目 | Unity / Cocos Creator / Unreal | 客户认知和交付规范更稳定 |
| 独立游戏学习 | Godot / Unity / GameMaker / Defold | 更接近完整游戏工程 |

### 你第一阶段要掌握的不是 API，而是边界

| 你要知道 | 不必一开始精通 |
| --- | --- |
| Phaser 是 Web 2D 游戏框架 | Phaser 每个类的 API |
| PixiJS 是 2D 渲染库 | 自己写完整编辑器 |
| Three.js 是 Web 3D 渲染库 | 线性代数和渲染管线全部细节 |
| Unity 是完整商业引擎 | Unity 全平台发布细节 |
| Godot 是开源完整引擎 | GDExtension 和源码编译 |
| Cocos Creator 适合小游戏生态 | 所有小游戏平台差异 |
| Blender 是资产生产/清理工具 | 专业建模师水平 |

AI-first 的关键变化：

```
过去：不会写游戏代码 = 做不了
现在：不会判断游戏工程结构 = 做不稳
```

写代码成本下降后，你的瓶颈变成：

- 需求切小
- 选对渠道
- 选对交付格式
- 判断 AI 代码是否符合游戏循环
- 判断素材是否合法
- 判断移动端是否真的能跑
- 判断平台 SDK 是否接对
- 判断这个 demo 能否报价

## 游戏开发完整流程

### 0. 市场和渠道

先问：

- 给谁玩
- 在哪里玩
- 为什么平台需要它
- 靠什么赚钱
- 交付物是什么格式

### 1. Concept（概念）

产出：

- 一句话玩法
- 目标用户
- 参考游戏
- 核心循环
- 变现假设

核心循环例子：

```
看到目标 -> 操作 -> 成功/失败 -> 得分/奖励 -> 再来一次
```

### 2. Prototype（原型）

目标不是好看，而是验证：

- 操作是否成立
- 规则是否有趣
- 失败是否清楚
- 30 秒内是否愿意再玩一次

### 3. Vertical Slice（垂直切片）

这是一个完整但很小的成品切片。

包括：

- 一段可玩的核心玩法
- 基础 UI
- 音效
- 结算
- 移动端适配
- 平台适配层
- 可演示或可投稿

副业 demo 最接近这个阶段。

### 4. Production（量产）

开始做更多：

- 关卡
- 角色
- 道具
- 皮肤
- 新机制
- 更多美术和音效

### 5. Polish（打磨）

打磨不是装饰，是提升体验：

- 操作延迟
- 按钮反馈
- 碰撞容错
- 动画节奏
- 音效同步
- 失败提示
- 加载体验
- 低端机性能

### 6. QA（质量测试）

测试内容：

- 功能是否对
- 不同屏幕是否适配
- 包体是否合格
- 是否报错
- 是否断网可处理
- 平台 SDK 是否按要求调用
- 广告、支付、存档是否可靠

### 7. Launch（上线）

包括：

- 平台提交
- 素材页
- 隐私政策
- 版本号
- 构建包
- 审核反馈处理
- 收款配置

### 8. LiveOps（线上运营）

上线后继续：

- 看数据
- 修 bug
- 调难度
- 加活动
- 调广告点
- 做 A/B Test（AB 测试）
- 更新内容

## 官方入口索引

这些不是推荐顺序，而是“你以后看到名词时知道去哪看官方解释”。

| 类别 | 名称 | 官方入口 |
| --- | --- | --- |
| Web 2D | Phaser | https://docs.phaser.io/ |
| Web 2D 渲染 | PixiJS | https://pixijs.com/ |
| Web 3D | Three.js | https://threejs.org/docs/ |
| Web 3D | Babylon.js | https://www.babylonjs.com/ |
| Web 3D | PlayCanvas | https://developer.playcanvas.com/ |
| 完整引擎 | Unity | https://docs.unity3d.com/Manual/ |
| 完整引擎 | Unreal Engine | https://dev.epicgames.com/documentation/unreal-engine/ |
| 完整引擎 | Godot | https://docs.godotengine.org/ |
| 完整引擎 | Cocos Creator | https://docs.cocos.com/creator/ |
| 完整引擎 | Defold | https://defold.com/manuals/ |
| 2D 引擎 | GameMaker | https://manual.gamemaker.io/ |
| 低代码 | Construct 3 | https://www.construct.net/en/make-games/manuals |
| 低代码 | GDevelop | https://wiki.gdevelop.io/ |
| 代码框架 | MonoGame | https://docs.monogame.net/ |
| 代码框架 | libGDX | https://libgdx.com/wiki/ |
| 代码框架 | LÖVE | https://love2d.org/wiki/Main_Page |
| 代码框架 | Bevy | https://bevy.org/learn/ |
| 学习/原型 | Pygame | https://www.pygame.org/docs/ |
| 视觉小说 | Ren'Py | https://www.renpy.org/doc/html/ |
| 3D 资产 | Blender | https://docs.blender.org/manual/ |
| 3D 模型格式 | glTF | https://www.khronos.org/gltf/ |

## 新人最容易误解的点

### 误解 1：游戏框架越完整越好

不对。完整引擎给你更多能力，也给你更多复杂度。

如果目标是 5MB playable ad（可试玩广告），Unity 或 Unreal 可能太重；如果目标是 3D 角色动作游戏，原生 JS 又可能太散。

### 误解 2：Three.js 不是游戏框架，所以不该用

不对。Three.js 不是完整游戏引擎，但可以成为 AI-first 轻 3D 商业 demo 的核心渲染层。

正确判断不是“它是不是游戏框架”，而是：

- 你需要的游戏系统有多复杂
- 你是否需要编辑器
- 你是否能控制包体
- 你是否能接平台 SDK
- 你是否能真机跑顺

### 误解 3：会写代码就等于会做游戏

不对。AI 能降低代码成本，但不能自动替你判断：

- 手感是否舒服
- 反馈是否清楚
- 关卡是否无聊
- 素材是否统一
- 平台规则是否违反
- 商业目标是否成立

### 误解 4：后端经验没用

不对。后端经验在商业化游戏里很值钱，尤其是：

- 支付
- 账号
- 排行榜
- 活动
- 数据分析
- 反作弊
- 平台回调
- 服务稳定性

只是第一周 demo 不一定需要把后端全做出来。

### 误解 5：3A 是技术问题

不完整。3A 是技术、内容、团队、资金、制作管理、发行共同放大的结果。

个人开发者可以学习 3A 的局部技术，比如相机、角色控制、资产流式加载，但不能把“做 3A”当作一周副业目标。

## 从 0 到能开工的最小学习路径

你不需要把上面全部学完才开始。你需要建立“识别能力”。

### 第 1 层：游戏心脏

必须理解：

- Game Loop（游戏循环）
- State（状态）
- Input（输入）
- Update（更新）
- Render（渲染）
- Delta Time（帧间隔）

能看懂一个最小游戏为什么能跑。

### 第 2 层：对象组织

必须理解：

- Scene（场景）
- Entity/GameObject/Node（实体/游戏对象/节点）
- Component（组件）
- Prefab（预制体）
- Script（脚本）

能看懂 Unity、Godot、Cocos、Phaser 文档里的基本组织方式。

### 第 3 层：视觉和资产

必须理解：

- Sprite（2D 精灵）
- Texture（贴图）
- Mesh（3D 网格）
- Material（材质）
- Animation（动画）
- Blender（3D 建模工具）
- GLB（3D 模型单文件）

能知道素材从哪里来，怎么进入游戏。

### 第 4 层：平台和商业

必须理解：

- SDK（平台开发包）
- PlatformAdapter（平台适配层）
- Ads（广告）
- IAP（应用内购买）
- Analytics（数据分析）
- Build Target（构建目标）

能把“游戏本体”和“平台要求”分开。

### 第 5 层：选择框架

按渠道倒推：

```
目标是 H5 / Playable Ads
  -> Phaser / PixiJS / Three.js / 原生 JS

目标是国内小游戏
  -> Cocos Creator / Unity / LayaAir

目标是完整 2D/3D 独立游戏
  -> Unity / Godot / Cocos / GameMaker / Defold

目标是高规格 3D
  -> Unity / Unreal / Godot / 自研工具链

目标是 Web 3D 视觉差异化
  -> Three.js / Babylon.js / PlayCanvas + Blender + GLB
```

## 和现有作战手册的关系

建议阅读顺序：

1. 先读本文，建立游戏开发宇宙地图。
2. 再读 `../01-ai-first-game-mindset.md`，理解 AI-first 副业成本模型。
3. 再读 `../02-game-tech-stack-map.md`，把地图收敛到你的副业技术栈。
4. 再读 `../03-platform-channel-map.md`，按渠道倒推接入方式和变现。
5. 最后读 `../06-week-one-commercial-loop.md`，执行一周商业闭环。

本文是扫盲地图；其他文档是作战手册。

## 边界与不确定

事实：

- 游戏框架、渲染库、完整引擎、低代码工具、平台创作生态不是同一类东西。
- Web 游戏常见主线是 JavaScript / TypeScript + Canvas/WebGL/WebGPU。
- Unity 主线语言是 C#，Unreal 主线是 C++ / Blueprint，Godot 主线是 GDScript / C#，Cocos Creator 主线是 TypeScript。
- 大型 3A 游戏通常依赖大型团队、复杂资产管线、工具链、QA、发行和线上运营，不只是客户端代码。

推断：

- 对你这种有后端开发能力、Codex/Claude、多 agent 工作流、目标海外变现的人，第一阶段最有商业效率的不是从 Unity/Unreal 全面学起，而是先用 Web/H5/Playable Ads 路线跑通成交和交付。
- Three.js 在 AI-first 下的价值会继续上升，因为 AI 能显著降低 3D 场景代码、shader、交互原型的编写成本，但最终瓶颈仍然是性能、资产、审美、平台规则和商业需求判断。

不确定：

- 各平台 SDK、包体、广告、支付、审核和分成规则会变化，提交前必须重新查官方文档。
- 新框架会出现，旧框架会衰退，所以本文应维护“分类法”和“判断问题”，而不是追求永久穷尽所有名字。
