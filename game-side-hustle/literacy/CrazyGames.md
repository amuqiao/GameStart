# CrazyGames 扫盲：从玩家入口到开发者变现

Last checked：2026-09-15

一句话定位：CrazyGames 不是“上传网页游戏就立刻赚钱”的网盘，而是一个带流量、审核、SDK（平台开发包）、广告分成、数据反馈和分阶段上线机制的 Web 游戏平台。

本文负责：

- 用第一性原理解释 CrazyGames 这个渠道到底解决什么问题
- 帮你理解玩家侧、开发者侧、审核侧、收益侧各自怎么运转
- 梳理 Basic Launch（基础上线）和 Full Launch（完整上线）的区别
- 解释技术栈、SDK、广告、存档、支付、排行榜、QA（质量检查）怎么接
- 给你一套从看平台、选题、做 demo、提交、迭代到收益的 Todo

本文不负责：

- 替代 CrazyGames 官方文档
- 保证平台规则永久不变
- 教你直接复制平台上的游戏
- 承诺提交后一定通过 Full Launch 或产生收益

正确读法：

1. 先理解“平台不是客户，平台是流量和规则系统”。
2. 再理解“Basic Launch 不是变现，Full Launch 才是变现入口”。
3. 最后按清单做一款可测试、可投稿、可迭代的 Web 游戏。

## 先给结论：它适合你什么，不适合你什么

适合：

- 做海外 Web 游戏平台投稿验证。
- 验证一款游戏是否有真实玩家愿意玩。
- 把 H5（HTML5 网页游戏）从“作品展示”推进到“平台分发”。
- 沉淀 CrazyGamesAdapter（CrazyGames 平台适配层），为后续 Yandex、GameDistribution、Poki 等平台复用思路。
- 做中长期分成可能性，不需要自己先买量。

不适合：

- 当成第一周立即现金流。
- 当成外包客户，期待平台直接买你的 demo。
- 把 Basic Launch（基础上线）误认为已经开始赚钱。
- 上传半成品或换皮素材包。
- 把外部广告、App Store CTA（行动按钮）、跨平台导流塞进游戏里。

## 核心洞察

CrazyGames 的本质是一个双边平台：它把“想马上玩游戏的玩家”和“想获得 Web 流量并通过广告/IAP 赚钱的开发者”连接起来；开发者的核心任务不是上传代码，而是证明游戏能让玩家快速进入、持续游玩、愿意回来，并且符合平台技术和广告规则。

## 根本问题表

| 根本问题 | 通俗说法 | 具体答案 | 常用度 |
| --- | --- | --- | --- |
| 平台要什么 | CrazyGames 为什么接你的游戏 | 玩家能快速玩、愿意留、不会被低质量内容伤害体验 | 地基 |
| 玩家怎么发现游戏 | 流量从哪里来 | 首页、分类、搜索、Hot Games（热门游戏）、New（新游戏）、Leaderboards（排行榜）、推荐位 | 地基 |
| 游戏怎么上线 | 上传后发生什么 | Basic Launch（基础上线）先测指标，表现好再进入 Full Launch（完整上线） | 地基 |
| 技术怎么接入 | 你的游戏如何和平台说话 | CrazyGames SDK（平台开发包）负责广告、事件、用户、存档、支付等能力 | 地基 |
| 怎么赚钱 | 钱从哪里来 | Full Launch 后主要靠广告分成，IAP（应用内购买）只对 selected/invite-only games（被选择或邀请的游戏）开放 | 地基 |
| 怎么不被拒 | 审核看什么 | 技术、玩法、广告、账号、多人、封面素材、平台集成、未成年人适配 | 地基 |
| 怎么迭代 | 数据如何指导下一版 | Average Play Time（平均游玩时长）、D1 Retention（次日留存）、Conversion（进入游戏转化）、反馈和收入数据 | 进阶 |

## 先把 CrazyGames 看成三层

```
玩家层：玩家打开网页，点一下就玩
  |
  v
平台层：分发、推荐、审核、广告、账号、数据、支付
  |
  v
开发者层：提交游戏、接 SDK、看数据、拿分成、持续迭代
```

你作为开发者，不是只把 `index.html` 上传上去，而是要交付一个能被平台放心分发的产品：

```
可快速加载
可直接游玩
移动端和桌面端体验正常
英文界面可读
没有侵权和外部广告
广告点不打断核心体验
SDK 事件调用正确
数据指标能证明玩家愿意玩
```

用后端视角理解：

| 后端平台 | CrazyGames |
| --- | --- |
| API Gateway（网关） | 玩家入口和分发页 |
| Service Contract（服务合同） | Platform Requirements（平台要求） |
| SDK / Client Library（客户端库） | CrazyGames SDK（平台开发包） |
| Observability（可观测性） | Developer dashboard（开发者数据面板） |
| Billing（结算） | Payouts（打款） |
| Review / Compliance（审核/合规） | QA（质量检查）和内容审核 |

## 玩家侧在哪里看

玩家侧入口：

- CrazyGames 首页：https://www.crazygames.com/
- New（新游戏）、Hot Games（热门游戏）、Updated（已更新）、Originals（原创）、Multiplayer（多人游戏）、Leaderboards（排行榜）：优先从首页导航进入，不要依赖本文里的路径永久有效。

首页和导航里常见分类：

| 分类 | 中文理解 | 你看什么 |
| --- | --- | --- |
| Action | 动作 | 操作反馈、关卡节奏、移动端手感 |
| Adventure | 冒险 | 内容包装、任务、探索感 |
| Arcade | 街机/轻量玩法 | 低门槛、短反馈、复玩 |
| Board | 桌游 | 规则清晰度、局内节奏 |
| Card | 卡牌 | 规则解释、UI 信息密度 |
| Clicker | 点击/放置 | 成长反馈、数值节奏 |
| Driving | 驾驶 | 3D 手感、物理、相机 |
| .io | 多人轻竞技 | 即时对抗、房间、网络 |
| Puzzle | 益智 | 规则可理解性、关卡扩展 |
| Shooting | 射击 | 瞄准、移动、帧率 |
| Simulation | 模拟 | 任务流、收集、经营 |
| Sports | 体育 | 规则模拟、操作手感 |
| Strategy | 策略 | 决策深度、局外成长 |
| Trivia | 问答 | 题库、本地化、节奏 |
| Word | 文字 | 英文内容质量、词库 |

你看平台游戏时，不要只玩，要拆：

```text
游戏名：
分类：
2D / 3D：
技术猜测：Phaser / Three.js / Unity WebGL / Cocos / Godot / 其他
首屏加载时间：
开始游戏需要几次点击：
核心循环：
单局时长：
失败后是否想再来：
广告可能插在哪里：
是否有排行榜：
是否有账号/存档：
移动端是否好操作：
我能否做“同玩法不同题材/不同美术/不同关卡”的原创版本：
```

## 开发者侧入口

核心入口：

- Developer Portal（开发者后台）：https://developer.crazygames.com/
- Documentation（官方文档）：https://docs.crazygames.com/
- Requirements（提交要求）：https://docs.crazygames.com/requirements/intro/
- SDK（平台开发包）：https://docs.crazygames.com/sdk/intro/
- Payouts（打款）：https://docs.crazygames.com/payouts/
- FAQ（常见问题）：https://docs.crazygames.com/faq/

开发者视角的主链路：

```
注册 Developer Portal
  -> 完成游戏基本信息
  -> 上传 Web build（网页构建产物）
  -> 用 Preview tool（预览工具）测试
  -> 提交 Basic Launch（基础上线）
  -> 看 dashboard（数据面板）里的真实表现
  -> 指标足够好，进入 Full Launch（完整上线）准备
  -> 接完整 SDK（平台开发包）和广告/存档等要求
  -> Full QA（完整质量检查）
  -> 开启广告分成或被邀请接 IAP（应用内购买）
```

## Basic Launch 与 Full Launch

这是 CrazyGames 最关键的心智模型。

```
Basic Launch（基础上线）
  = 小流量测试 + 基础审核 + 不变现

Full Launch（完整上线）
  = 全球发布 + 完整审核 + SDK 接入 + 开启变现
```

| 项目 | Basic Launch（基础上线） | Full Launch（完整上线） |
| --- | --- | --- |
| 目的 | 测真实玩家指标 | 正式全球发布和变现 |
| 受众 | 有限受众，临时测试 | 更完整的平台分发 |
| SDK | 不强制，SDK 可选 | 必须满足完整 SDK 集成要求 |
| 广告 | 禁用，不分成 | 通过 CrazyGames SDK 展示广告并分成 |
| IAP | 不可用 | 仅 selected/invite-only games 可用 |
| QA | Basic QA（基础质量检查） | Full QA（完整质量检查） |
| 关键指标 | 平均游玩时长、次日留存、进入游戏转化 | 继续看指标和收入表现 |

Basic Launch 的关键事实：

- 测试期通常是 7 到 21 天。
- 至少上线 7 天并达到 500 plays（游玩次数）后，才会结束基础测试；如果没达到 500 plays，通常到 21 天结束。
- KPI（关键指标）自动追踪，Basic Launch 不需要 SDK。
- Basic Launch 即使集成 SDK，广告仍然禁用。
- 更新可以提交，数据会在 dashboard（数据面板）按节奏刷新。

你要避免一个误解：

```text
错：提交到 CrazyGames = 马上产生收益
对：提交到 CrazyGames = 先接受真实流量测试，表现好才有 Full Launch 和变现机会
```

## CrazyGames 到底看哪些指标

平台不是只看游戏“有没有 bug”，还看真实玩家是否愿意玩。

| 指标 | 中文理解 | 为什么重要 | 你怎么优化 |
| --- | --- | --- | --- |
| Average Play Time | 平均游玩时长 | 说明核心循环是否留得住玩家 | 做更清晰目标、持续奖励、难度曲线 |
| D1 Retention | 次日留存 | 说明玩家第二天是否还记得回来 | 存档、成长、每日目标、解锁 |
| Conversion | 进入游戏转化 | 说明玩家从打开到真正开玩是否顺畅 | 减少加载、少菜单、快速进入核心玩法 |
| Loading Time | 加载时间 | Web 游戏太慢会直接流失 | 压缩资源、首包拆分、减少初始下载 |
| Crash/Error | 崩溃和报错 | 平台不会推不稳定游戏 | 真机测试、控制台清零 |
| Mobile Fit | 移动端适配 | 平台有移动端流量 | 大按钮、横竖屏、触控反馈 |

CrazyGames 文档里给过方向性参考：优秀游戏常见更长的平均游玩时长，强游戏常见能达到可观的 D1 Retention；你不要把这些当硬性保证，而要当优化方向。

官方 Basic Launch Guide（基础上线指标指南）给过两个有用参考：

- successful titles（成功作品）经常能看到 10+ minutes average play time（10 分钟以上平均游玩时长）。
- strong games（强表现游戏）经常能达到 10-15% Day 1 Retention（10%-15% 次日留存）。

这两个数不是承诺、不是所有品类通用及格线，只能作为你做第一款游戏时的“方向盘”：如果你的平均游玩时长只有几十秒，或者完全没有让玩家第二天回来的理由，进入 Full Launch 的概率就会变低。

## 提交要求怎么理解

CrazyGames 的 requirements（要求）不是单一 checklist，而是几个维度：

```
Technical（技术）
Gameplay（玩法）
Advertisement（广告）
Account integration（账号集成）
Multiplayer（多人，如适用）
In-game Purchases（应用内购买，邀请制）
Game covers（封面素材）
Quality guidelines（质量建议）
```

### Technical（技术要求）

关键点：

- Web 游戏成功很依赖玩家多久能开始玩。
- Basic Implementation（基础实现）有文件大小、首包、文件数量等限制。
- Basic Implementation（基础实现）常见硬限制包括：initial download size（初始下载大小）不超过 50MB、total file size（总文件大小）不超过 250MB、file count（文件数量）不超过 1500。
- 如果想获得 mobile homepage（移动端首页）资格，initial download size（初始下载大小）要按更严格的 20MB 目标控制。
- 如果接了 SDK（平台开发包），初始下载大小的度量和 `Gameplay start`（进入可玩状态）事件有关。
- 外部加载资源会被 QA（质量检查）按进入 gameplay（可玩状态）的时间评估。
- 如果做 sitelock（域名锁），要白名单 CrazyGames 多个域名和移动 App 来源。
- 如果收集额外 personal data（个人数据），要处理 Privacy Policy（隐私政策）或 Terms（条款）提示。

你要转成工程要求：

```text
首屏只加载必要资源
大资源延后加载
游戏不要依赖自己域名的慢接口才能开始
不要把菜单前的 loading 做得太长
所有平台事件都从 PlatformAdapter（平台适配层）调用
把 50MB / 20MB / 250MB / 1500 files 写进构建检查脚本
```

### Gameplay（玩法要求）

关键点：

- 文本和图片要在桌面 iframe（内嵌窗口）、全屏、移动端上可读。
- 游戏需要 English localization（英文本地化）。
- 物理表现要在不同刷新率下保持一致，例如 60Hz、144Hz、165Hz。
- 控制要直觉，桌面和移动端都要合理。
- 不能粗糙、抄袭、低质量、未成年人不适配。
- Full Implementation（完整实现）要求新用户尽快落到 gameplay（可玩状态），如果游戏特性不允许，也要尽量少点击。

你要转成验收项：

```text
英文界面没有机翻硬伤
800x450、1366x768、1920x1080 都能看
移动端按钮不小于手指可点范围
delta time（帧间隔）驱动物理和移动
菜单不要绕太多层
不要自带 fullscreen（全屏）按钮
不要在游戏里放外部 App Store CTA（行动按钮）
```

### Advertisement（广告要求）

CrazyGames 的广告不是你想怎么插就怎么插。

关键点：

- Basic Launch（基础上线）阶段广告禁用，不会分成。
- 只能通过 CrazyGames SDK（平台开发包）请求广告。
- 常见广告类型包括 video ads（视频广告）、midgame ads（局间/中途广告）、rewarded ads（激励广告）、in-game banners（游戏内横幅）。
- 广告不能打断 active gameplay（正在游玩）。
- 广告应该出现在 natural break（自然暂停点），比如关卡结束、死亡、回合结束、地图切换。
- midgame ads（局间广告）频率由 SDK 和平台规则控制；官方资源里提到平台会自动执行频率限制，你不要自己写激进的广告轰炸逻辑。
- 激励广告必须由玩家主动选择，并给明确奖励。
- 不要 chain multiple ads（链式连续广告），不要 deceptive trigger（欺骗触发）。
- 广告规则不合规可能被直接拒绝，而且不一定给你很详细的修改反馈。

工程上必须做：

```text
adStarted -> pause game + mute audio
adFinished -> resume game + unmute audio + 发奖励（如果 rewarded）
adError -> resume game + unmute audio + 不发奖励或给非付费提示
```

注意：这里的“非付费提示”是产品提示，不是偷偷接第三方广告或绕过平台规则。

### Account / Data（账号与存档）

CrazyGames SDK 里有 user（用户）和 data（存档）能力。

data module（存档模块）的理解：

- 登录用户的数据可以同步到多个设备。
- 未登录用户会先用 LocalStorage（浏览器本地存储）。
- 用户登录后，本地数据可以同步和备份到账户。
- 如果要用 data module，需要在提交流程里打开 Progress Save（进度存档）开关，否则模块会被禁用。
- 存档 API 类似 localStorage。
- 官方文档提到 data module（存档模块）有 1MB 数据限制，接近限制会有 console warning（控制台警告），超过后可能不再备份。

你做游戏时的判断：

| 游戏类型 | 存档策略 |
| --- | --- |
| 纯 30 秒街机 demo | 本地存档可选 |
| 关卡制 puzzle | 应该保存关卡进度 |
| clicker / idle | 必须保存数值进度 |
| RPG / 策略 / 经营 | 必须认真设计存档结构 |
| 多人或 IAP | 需要服务端或平台账号配合 |

### IAP（应用内购买）

IAP 在 CrazyGames 上不是所有游戏默认开放。

关键点：

- IAP 是 invite-only（邀请制/选择性开放）。
- 需要 Full Implementation（完整实现）。
- CrazyGames 使用 Xsolla（支付服务）相关方案。
- 购买通常应该只允许 signed-in users（登录用户）。
- 如果游戏有后端或需要安全保存进度，需要配合 User module（用户模块）或 Data module（存档模块）。

你第一阶段不应该把 IAP 当主变现假设，除非平台明确邀请或你已经有强留存游戏。

### Payouts（打款）

要拿钱，不只要游戏有收入，还要完成结算资料。

关键点：

- 通过 Developer Portal 的 Account -> Billing 完成资料。
- CrazyGames 使用 Tipalti 处理开发者打款。
- 官方支持的方式包括 wire transfer（电汇）、Direct Deposit / ACH、eCheck、PayPal，具体可用性取决于国家和监管。
- 官方文档写明最低打款门槛是 100 EUR（100 欧元）。
- 打款通常按月处理；官方也说明存在 NET 60 terms（60 天账期条款），但当前目标是更早处理，实际到账还受银行、地区、方式影响。
- 打款有账期、发票、手续费、汇率和税务问题。

你要提前做：

```text
确认个人/公司主体
确认所在国家支持的收款方式
确认税务表单
确认 PayPal / 银行账户能收
不要等游戏产生收入后才发现 Billing 卡住
```

## SDK 怎么接：不要把平台代码写进游戏核心

CrazyGames SDK（平台开发包）可以理解为：

```
你的游戏
  -> PlatformAdapter（平台适配层）
  -> CrazyGames SDK（平台开发包）
  -> CrazyGames 平台能力
```

SDK 主要模块：

| 模块 | 中文理解 | 负责什么 |
| --- | --- | --- |
| ad | 视频广告模块 | midgame/rewarded 广告、广告阻断检测 |
| banner | 横幅广告模块 | 游戏内 banner（横幅） |
| game | 游戏事件模块 | loading、gameplay start/stop、设置等 |
| user | 用户模块 | 获取登录用户、账号相关能力 |
| data | 存档模块 | 保存/读取玩家数据 |
| in-game purchases | 应用内购买 | 邀请制支付能力 |

HTML5 接入时，核心顺序是：

```text
加载 crazygames-sdk-v3.js
  -> await window.CrazyGames.SDK.init()
  -> 游戏加载资源
  -> 玩家真正进入可玩状态
  -> 触发 gameplayStart
  -> 自然暂停点请求广告
  -> 广告开始时暂停和静音
  -> 广告结束/失败后恢复
```

推荐接口：

```ts
export interface PlatformAdapter {
  init(): Promise<void>;
  gameplayStart(): void;
  gameplayStop(): void;
  loadingStart?(): void;
  loadingStop?(): void;
  requestMidgameAd?(): Promise<void>;
  requestRewardedAd?(rewardId: string): Promise<"granted" | "skipped" | "error">;
  getUser?(): Promise<PlatformUser | null>;
  save?(key: string, value: string): Promise<void>;
  load?(key: string): Promise<string | null>;
}
```

为什么要这样拆：

| 不拆 PlatformAdapter | 拆 PlatformAdapter |
| --- | --- |
| 游戏核心到处调用 `window.CrazyGames.SDK` | 游戏核心只知道 adapter |
| 换平台要改全项目 | 换平台只换适配层 |
| 本地测试困难 | 可以用 MockAdapter（模拟适配层） |
| SDK 初始化失败时难定位 | 初始化集中处理 |
| AI 容易乱接平台代码 | 约束 AI 只改适配层 |

## 支持什么技术栈

CrazyGames 支持常见 Web 游戏技术栈。官方文档和 partners 页面列出的方向包括：

| 技术 | 怎么理解 | 适合你吗 |
| --- | --- | --- |
| HTML5 | 普通 Web 游戏 | 适合第一阶段 |
| Phaser | Web 2D 游戏框架 | 很适合第一阶段 |
| Pixi.js | 2D 渲染库 | 适合轻量游戏和广告互动 |
| Three.js | Web 3D 渲染库 | 适合 3D demo 和轻 3D |
| BabylonJS | Web 3D 引擎/库 | 适合更工程化 Web 3D |
| PlayCanvas | Web 3D 引擎 | 适合在线编辑器和 3D 项目 |
| Unity | 完整商业引擎，导出 WebGL | 适合中长期或客户指定 |
| Godot | 开源游戏引擎，支持 Web 导出 | 适合学习和独立游戏 |
| Cocos | 多端游戏引擎 | 适合小游戏/2D/轻 3D |
| Construct | 低代码游戏工具 | 适合快速原型 |
| GameMaker | 2D 游戏引擎 | 适合 2D 独立游戏 |
| Defold | 轻量跨平台引擎 | 可作为补充选择 |
| GDevelop | no-code（无代码）游戏引擎 | 适合理解和原型 |
| Wonderland | WebXR/3D 方向 | 特定 3D/WebXR 场景 |

你的第一阶段建议：

```text
主线：Phaser + TypeScript + Vite
视觉差异化：Three.js + TypeScript + Vite + Blender + GLB
备选：PixiJS + TypeScript
中期：Cocos Creator / Unity WebGL / Godot Web
```

## 哪些游戏更值得研究

从副业和 AI-first 视角，优先研究这些：

| 方向 | 为什么适合 | 注意点 |
| --- | --- | --- |
| Puzzle（益智） | 规则明确、关卡可扩展、移动端友好 | 需要关卡量和难度曲线 |
| Arcade（街机） | 低门槛、反馈快、适合短时游玩 | 手感和复玩很关键 |
| Clicker / Idle（点击/放置） | 成长循环清晰、留存空间大 | 数值和存档要做好 |
| Driving（驾驶） | 3D 视觉强、平台受众广 | 物理、性能、移动端操作难 |
| .io / Multiplayer（多人） | 留存和时长潜力高 | 后端、实时网络、反作弊复杂 |
| Merge（合成） | 休闲用户接受度高 | 容易同质化，要做题材和节奏差异 |
| Tower Defense（塔防） | 策略和成长结合 | 内容量和数值平衡要更多 |
| Word / Trivia（文字/问答） | 轻量、内容驱动 | 英文题库和版权/质量要求高 |

不建议第一周优先做：

- 大型开放世界
- 复杂多人 FPS
- 重度 RPG
- 大体量 3D 角色动作
- 需要大量原创剧情和美术的项目

这不是因为 AI 写不了代码，而是因为平台指标、内容量、调参、QA、性能和审核会吃掉时间。

## 竞品拆解方法

每次研究 10 个游戏，不要泛看，按同一表格拆：

| 字段 | 记录方式 |
| --- | --- |
| 游戏名 | 标题和链接 |
| 分类 | Puzzle / Arcade / Driving / ... |
| 首次进入 | 几秒到可玩，几次点击到 gameplay |
| 核心动作 | 点击、拖拽、躲避、合成、射击、驾驶 |
| 核心循环 | 操作 -> 反馈 -> 奖励 -> 下一局 |
| 留存钩子 | 关卡、解锁、皮肤、每日奖励、排行榜 |
| 失败设计 | 死亡、重试、扣血、时间耗尽 |
| 广告点猜测 | 死亡后、关卡间、奖励翻倍、暂停点 |
| 技术猜测 | 2D / 3D / WebGL / Unity / Phaser |
| 可复刻点 | 玩法结构 |
| 必须原创点 | 题材、美术、关卡、UI、音效、命名 |

你要找的是“结构可学习”，不是“素材可复制”。

## 一周内 CrazyGames 投稿路线

这条路线的目标不是一周内稳定赚钱，而是一周内拿到真实提交/预览/反馈，验证平台链路。

### Day 1：平台和选题

- [ ] 注册 Developer Portal（开发者后台）
- [ ] 阅读 Requirements（提交要求）
- [ ] 阅读 Basic Launch Guide（基础上线指标指南）
- [ ] 选 1 个分类：Puzzle / Arcade / Clicker 优先
- [ ] 拆 10 个同类游戏
- [ ] 写一句话核心循环

### Day 2：可玩原型

- [ ] Phaser / PixiJS / Three.js 选一个
- [ ] 做出 30 秒可玩的 core loop（核心循环）
- [ ] 英文 UI
- [ ] 移动端触控
- [ ] 有开始、游玩、失败、结算、重试

### Day 3：内容和体验

- [ ] 至少 5-10 个关卡或可重复变化
- [ ] 加音效和反馈
- [ ] 加简单进度或分数
- [ ] 加 tutorial（新手引导）或首局提示
- [ ] 优化 800x450、1366x768、移动端

### Day 4：平台适配层

- [ ] 抽 `PlatformAdapter`
- [ ] 实现 `WebAdapter`
- [ ] 预留 `CrazyGamesAdapter`
- [ ] 游戏核心不直接依赖 `window.CrazyGames.SDK`
- [ ] 记录 `gameplayStart` / `gameplayStop` 调用位置

### Day 5：构建和 QA

- [ ] 生产构建
- [ ] 压缩图片、音频、GLB（如果有）
- [ ] 控制台无报错
- [ ] 不依赖外部慢资源才能进入 gameplay
- [ ] 测 Chrome / Safari / 移动端
- [ ] 检查英文文本可读

### Day 6：Developer Portal 预览

- [ ] 上传 build（构建产物）
- [ ] 用 Preview tool（预览工具）查看嵌入效果
- [ ] 检查 iframe 尺寸
- [ ] 检查音频解锁
- [ ] 检查移动端方向和输入
- [ ] 准备封面、描述、控制说明

### Day 7：提交和记录

- [ ] 提交 Basic Launch
- [ ] 记录提交版本、时间、链接
- [ ] 建 tracking 表
- [ ] 收集反馈
- [ ] 根据数据决定是否继续打磨 Full Launch

## Full Launch 准备清单

如果 Basic Launch 指标不错，再做 Full Launch。

技术：

- [ ] 接 CrazyGames SDK v3
- [ ] `await SDK.init()` 初始化完成后再调用模块
- [ ] `gameplayStart` 在真正可玩时触发
- [ ] `gameplayStop` 在暂停、广告、离开玩法时正确触发
- [ ] loading start/stop 如有二次加载则接入
- [ ] adStarted / adFinished / adError 生命周期处理正确
- [ ] Data module（存档模块）只在开启 Progress Save 后使用

广告：

- [ ] 只通过 CrazyGames SDK 请求广告
- [ ] midgame ad（局间广告）只在自然暂停点请求
- [ ] rewarded ad（激励广告）由用户主动点击
- [ ] 激励广告失败不发奖励
- [ ] 广告期间暂停游戏和声音
- [ ] Basic Launch 阶段即使有广告按钮，也不能让玩家点了没效果

玩法：

- [ ] 新用户尽快进入 gameplay
- [ ] 操作直觉
- [ ] 英文 localization（本地化）
- [ ] 不包含 App Store 外链 CTA
- [ ] 不做跨平台导流
- [ ] 不侵犯已有游戏名称、素材、角色、UI

商业：

- [ ] 完成 Billing（结算资料）
- [ ] 确认收款方式
- [ ] 确认税务信息
- [ ] 看 dashboard（数据面板）里的 plays、retention、revenue
- [ ] 记录每次版本更新和指标变化

## 你作为后端开发者的优势

CrazyGames 路线里，后端不是第一天必需，但你的后端经验有价值。

| 游戏能力 | 后端对应能力 | 什么时候用 |
| --- | --- | --- |
| 排行榜 | Redis Sorted Set / 数据库排序 | 排名、赛季、反作弊 |
| 存档 | 用户数据模型 | 有成长和进度 |
| IAP | 订单、验签、发货 | 被邀请接 IAP 后 |
| 多人 | WebSocket / 房间服务 | .io 或多人游戏 |
| 反作弊 | 服务端校验 | 排行榜和奖励 |
| 数据分析 | event log / BI | 迭代玩法和广告点 |
| 配置 | remote config（远程配置） | 调难度、广告点、活动 |

第一阶段不要主动把项目做重：

```text
没有账号需求 -> 不做账号
没有多人需求 -> 不做实时后端
没有 IAP 邀请 -> 不做支付
没有排行榜需求 -> 不做服务端排名
```

## 收益模型：你到底怎么赚钱

CrazyGames 的收益不是“卖源码”，而是平台分发后的 revenue share（收入分成）。

主要路径：

```text
玩家玩你的游戏
  -> 平台通过 SDK 展示广告
  -> 广告产生收入
  -> CrazyGames 按规则结算分成
  -> 达到门槛后通过 payout（打款）支付
```

补充路径：

```text
被选中的游戏
  -> 接 IAP（应用内购买）
  -> 玩家购买虚拟商品或能力
  -> Xsolla / CrazyGames 支付链路
  -> 分成和打款
```

你要理解两个现实：

- 没有 Full Launch，就不要把 CrazyGames 当稳定收入来源。
- 没有足够玩家指标，就算技术接入完美，也可能没法进入 Full Launch。
- 达不到打款门槛时，收入不会立刻进入你的账户。
- 收款资料、税务信息、国家/地区支持情况都可能成为实际到账前的阻塞点。

## 源码暴露和被复制风险

CrazyGames 是 Web 游戏平台，前端构建产物天然会被浏览器加载，所以你要默认：

```text
JS 可以被下载
资源可以被看到
接口可以被抓包
完全隐藏源码不现实
```

降低风险的方法：

- 不在前端放 secret（密钥）、私有 token、后台管理接口。
- 使用 minify（压缩）和 bundle（打包），降低直接阅读成本。
- 关键服务端逻辑放后端，例如排行榜防刷、支付验签、活动奖励。
- 对公开资源保留版权记录，证明你有合法来源。
- 如果使用 sitelock（域名锁），必须按 CrazyGames 官方要求白名单平台域名和 App 来源，避免自己把真实玩家挡掉。
- 不要把完整素材库、编辑器源文件、未发布关卡都塞进首包。

真正的护城河不是“别人看不到 JS”，而是：

```text
平台账号 + 原创资产 + 持续更新 + 数据迭代 + 玩家反馈 + 分发位置
```

## 对抗式审查后的硬红线

我会从这些地方击穿一个 CrazyGames 投稿计划：

| 攻击点 | 怎么击穿 | 后果 | 加固 |
| --- | --- | --- | --- |
| 把 Basic Launch 当收入 | 一周后没有 Full Launch，也没有广告分成 | 现金流预期崩 | 文档和计划里明确 Basic 只验证，不承诺收入 |
| 包体和文件数失控 | AI 生成大量素材，首包超过目标 | 加载慢、移动端差、审核风险 | 构建脚本统计 initial/total size 和 file count |
| 广告接入乱写 | 死亡瞬间、菜单点击、开局前强插广告 | 被拒或留存暴跌 | 只在自然暂停点请求广告，广告期间暂停和静音 |
| SDK 事件位置错误 | 菜单页就触发 gameplayStart | 加载和转化数据失真 | 只在玩家真正可操作时触发 |
| 存档误用 | 没开 Progress Save 却调用 data module | 存档失效、玩家进度丢 | 提交流程和 adapter 初始化时显式检查 |
| 侵权和换皮 | 复刻名字、角色、美术、UI | 审核拒绝和法律风险 | 只学习结构，题材、美术、关卡、命名全部原创 |
| 收款资料后置 | 有收入后才发现 Billing/税务/国家限制 | 到账延迟或失败 | 注册后先完成 Billing 预检查 |
| 深链依赖 | 文档硬编码分类 URL，平台路径调整 | 调研入口失效 | 优先从首页导航和官方 docs 进入 |

## 和 Playable Ads 的区别

| 项目 | CrazyGames | Playable Ads（可试玩广告） |
| --- | --- | --- |
| 本质 | Web 游戏平台 | 广告素材 |
| 收益 | 平台广告分成 / 部分 IAP | 客户付制作费，或给自家产品导流 |
| 代码暴露 | 前端代码会暴露 | 前端代码也会暴露 |
| 重点 | 留存、时长、平台指标 | 转化、包体、广告规格 |
| 生命周期 | 可长期运营 | 常是短周期素材 |
| 成交难点 | 审核和数据表现 | 找客户和创意效果 |

你的副业组合可以是：

```text
CrazyGames：做长期作品和平台分成可能性
Playable Ads：做更快现金流和客户交付
itch.io / GitHub Pages：做作品展示
```

## 最小项目模板

推荐目录：

```text
my-crazygames-demo/
  src/
    core/
      GameCore.ts
      GameState.ts
      rules.ts
    scenes/
      BootScene.ts
      MenuScene.ts
      PlayScene.ts
      ResultScene.ts
    platform/
      PlatformAdapter.ts
      WebAdapter.ts
      CrazyGamesAdapter.ts
    ui/
    assets/
  public/
  docs/
    platform-notes.md
    submission-log.md
  package.json
  vite.config.ts
```

`platform-notes.md` 记录：

```text
Target platform: CrazyGames
Last checked: 2026-09-15
Launch target: Basic Launch
Tech stack: Phaser + TypeScript + Vite
SDK status: not required for Basic / planned for Full
Ads status: disabled in Basic
Save status: local only / Data module later
Known requirements:
  - English UI
  - readable at iframe sizes
  - initial download size controlled
  - no external ads
  - no App Store CTA in game
```

## 提交前自检清单

玩家体验：

- [ ] 5 秒内知道怎么玩
- [ ] 10 秒内进入核心玩法
- [ ] 失败后能立刻重试
- [ ] 手机端按钮和拖拽舒服
- [ ] 英文文本可读
- [ ] 没有 AI 图/音素材明显割裂

技术：

- [ ] 构建产物可静态托管
- [ ] 控制台无错误
- [ ] 首包大小可控
- [ ] 不依赖慢外部资源
- [ ] iOS Safari 音频解锁正常
- [ ] 不同刷新率下速度一致
- [ ] iframe 尺寸不裁切关键 UI

平台：

- [ ] 阅读最新 Requirements
- [ ] 阅读最新 Basic Launch Guide
- [ ] Developer Portal 信息完整
- [ ] 封面图、描述、控制说明准备好
- [ ] 无外部广告
- [ ] 无侵权素材和名称

商业：

- [ ] Billing 路径看过
- [ ] 收款方式可用性确认
- [ ] 提交记录可追踪
- [ ] 版本和数据变化有表格
- [ ] 不把 Basic Launch 当收入承诺

## 常见误解

### 误解 1：CrazyGames 是小游戏外包客户

不是。CrazyGames 更像平台渠道。你给它投稿，不等于它付你制作费；你收益来自平台变现后的分成。

### 误解 2：Basic Launch 就能赚钱

不对。Basic Launch 阶段广告禁用，不会共享广告收入。它的价值是给你真实流量和指标。

### 误解 3：接了 SDK 就能 Full Launch

不对。SDK 只是技术门槛，玩家指标、玩法质量、视觉质量、规则合规都要过。

### 误解 4：Web 游戏源码暴露，所以没有商业价值

不对。Web 游戏前端代码天然更容易被看到，但平台价值来自账号、流量、排名、数据、分发、更新和收益结算。你的核心壁垒应该是持续产出、平台适配、玩法迭代和资产/题材差异。

### 误解 5：AI 能写代码，所以平台审核不重要

不对。AI 能快写，但审核看的是玩家体验、规则合规、加载、广告时机、素材原创性和稳定性。

## 继续学习入口

先看官方：

- CrazyGames Documentation：https://docs.crazygames.com/
- Requirements：https://docs.crazygames.com/requirements/intro/
- Technical requirements：https://docs.crazygames.com/requirements/technical/
- Gameplay requirements：https://docs.crazygames.com/requirements/gameplay/
- Advertisement requirements：https://docs.crazygames.com/requirements/ads/
- SDK Introduction：https://docs.crazygames.com/sdk/intro/
- Video ads：https://docs.crazygames.com/sdk/video-ads/
- Data module：https://docs.crazygames.com/sdk/data/
- In-game purchases：https://docs.crazygames.com/sdk/in-game-purchases/
- Basic Launch Guide：https://docs.crazygames.com/resources/basic-launch-metrics/
- Payouts：https://docs.crazygames.com/payouts/
- FAQ：https://docs.crazygames.com/faq/

再看本地文档：

- [../03-platform-channel-map.md](../03-platform-channel-map.md)
- [../04-platform-adapter-and-project-template.md](../04-platform-adapter-and-project-template.md)
- [../06-week-one-commercial-loop.md](../06-week-one-commercial-loop.md)
- [game-dev-framework-universe.md](game-dev-framework-universe.md)

## 边界与不确定

事实：

- CrazyGames 有 Basic Launch（基础上线）和 Full Launch（完整上线）两阶段。
- Basic Launch 阶段变现禁用，Full Launch 才启用广告分成。
- SDK 覆盖广告、横幅、游戏事件、用户、存档、IAP 等平台能力。
- IAP（应用内购买）是邀请制/选择性开放能力。
- 打款需要完成 Developer Portal 里的 Billing（结算资料），并满足最低打款门槛。

推断：

- 对你这种有开发能力和 AI 多 agent 工作流的人，CrazyGames 适合作为“平台化作品验证线”，但不适合作为第一周现金流唯一来源。
- 第一周更现实的目标是完成 Basic Launch 投稿链路、拿真实预览/反馈/数据，而不是立刻产生收入。
- Phaser + TypeScript + Vite 是最稳的第一阶段路线；Three.js 更适合用来做视觉差异化 demo。

不确定：

- 平台包体、SDK、广告、支付、审核、打款规则会变化，提交前必须重新查官方文档。
- 不同品类的指标 benchmark（基准线）不会完全相同，不能用一个数值判断所有游戏。
- 首页推荐、分类推荐、Full Launch 邀请属于平台算法和人工审核共同结果，外部开发者无法完全控制。
