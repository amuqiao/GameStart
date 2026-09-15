# 一周商业闭环与 AI 工作流

这篇文档回答：如何在一周内完成可玩链接、样片、投稿/报价动作和反馈通道，并用 Codex / Claude / 多 agent 降低实现成本。

本文负责：

- 一周 Day 1-7 行动计划
- 验收清单
- 最小商业交付包
- Codex / Claude / 多 agent 分工
- 第二阶段升级路线
- 下一步选择

快速定位：

```
先做事：看“一周商业闭环计划”和“一周 Todo 清单”
先验收：看“验收清单”和“最小商业交付包”
先拆给 AI：看“AI 多 agent 工作流”
先决定后续方向：看“第二阶段升级路线”和“下一步”
```

## 一周商业闭环计划

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

## 本周成功标准

一周内不要用“赚到多少钱”作为唯一标准，先用能控制的证据判断闭环是否成立。

必须拿到：

- 1 个手机可玩的英文链接
- 1 个 15-30 秒录屏
- 3-5 张截图
- 1 个可复用项目模板
- 1 套 PlatformAdapter（平台适配层）草案
- 1 份平台投稿或客户报价记录
- 1 条真实外部反馈

加分项：

- 一个 playable ads（可试玩广告）单 HTML（单网页文件） / ZIP（压缩包）版本
- 一个 CrazyGames / Yandex / GameDistribution 投稿记录
- 一个 itch.io 或 GitHub Pages 展示页
- 一个报价包和报价话术
- 一次基于反馈的快速迭代

## Game Brief 模板

新项目先写这个，不要直接让 AI 开工。

下面模板里的 `Target platform` 是目标平台，`Monetization hypothesis` 是变现假设，`Orientation` 是横竖屏方向，`Adapter target` 是要接的平台适配层，`Build output` 是最终构建产物。

```
Game name:
Target platform:
Backup platform:
Monetization hypothesis:
Target device:
Orientation:
Session length:
Core action:
Win condition:
Lose condition:
Scoring:
Difficulty curve:
Visual style:
Required assets:
Tech stack:
Platform constraints:
Adapter target:
Build output:
Acceptance checklist:
What can be cut:
What must not be cut:
```

示例：

```
Game name: Color Catch Rush
Target platform: Playable Ads
Backup platform: itch.io showcase
Monetization hypothesis: client-ready playable ad sample
Target device: mobile browser
Orientation: portrait 9:16
Session length: 30 seconds
Core action: drag basket to catch matching falling items
Win condition: reach score target
Lose condition: miss too many items
Tech stack: Phaser + TypeScript + Vite
Adapter target: WebAdapter + MraidAdapter stub
Build output: hosted demo + compressed ZIP
What can be cut: leaderboard, account, complex levels
What must not be cut: touch feel, CTA, result screen, mobile performance
```

### Day 1：选渠道和游戏题材

产出：

- 选定 1 个主渠道
- 选定 1 个副渠道
- 定 1 个游戏核心循环
- 定 1 个变现假设
- 定 1 个作品展示方式

建议选择：

```
主渠道：Playable Ads（可试玩广告）客户样片
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
- 写 CSS / Canvas（2D 画布） / shader（着色器，控制画面效果）
- 压缩图片

你要验收：

- 不像半成品
- 英文界面自然
- 文本不溢出
- 手机端按钮够大
- 首屏加载可接受
- 资产来源可记录

### Day 4：接 PlatformAdapter（平台适配层）

产出：

- WebAdapter（普通网页适配实现）
- MraidAdapter（广告容器适配实现）或 CrazyGamesAdapter（CrazyGames 平台适配实现）
- analytics event（数据统计事件）
- local save（本地存档）
- pause/resume（暂停/恢复）
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

Playable Ads（可试玩广告）必须有：

- CTA（行动按钮，比如 Install / Play Now）
- MRAID（移动广告容器交互接口）调用
- 禁止自动跳转
- 首次交互后音频
- 包体压缩

Web 平台必须有：

- 平台 SDK（平台开发包） init（初始化）
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
我能交付一个可投放 HTML5 playable ad（HTML5 可试玩广告）：
- single HTML（单网页文件） / ZIP（压缩包）
- portrait / landscape（竖屏 / 横屏）
- CTA（行动按钮）
- MRAID ready（已准备好广告容器接口）
- mobile tested（已做移动端测试）
- source included or not included（是否包含源码）
- 2 rounds revision（2 轮修改）
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
- 改 CTA（行动按钮）
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

## 验收清单

### 游戏体验

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

### 移动端

- [ ] iPhone Safari 可玩
- [ ] Android Chrome 可玩
- [ ] 竖屏 / 横屏符合目标
- [ ] 触摸不误触
- [ ] 页面不会滚动干扰
- [ ] 音频在用户交互后播放
- [ ] 切后台再回来不乱
- [ ] 广告前后能暂停和恢复
- [ ] 不明显掉帧

### 技术

- [ ] 构建可复现
- [ ] 资源路径正确
- [ ] 没有控制台报错
- [ ] 包体符合目标平台
- [ ] 无外部不可控依赖
- [ ] PlatformAdapter（平台适配层）边界清楚
- [ ] GameCore（游戏核心逻辑）不直接调用平台 SDK（平台开发包）
- [ ] 有最小 analytics events（数据统计事件）
- [ ] 有错误日志或调试方式

### 平台

- [ ] 已阅读目标平台最新文档
- [ ] SDK（平台开发包）初始化正确
- [ ] 广告调用时机符合规则
- [ ] 支付 / IAP（应用内购买）权益服务端可校验
- [ ] 不使用平台禁止的外链
- [ ] 不接第三方冲突广告
- [ ] 包体和文件数量符合要求
- [ ] 截图、图标、描述完整
- [ ] 隐私和版权记录完整

### 商业

- [ ] 有作品链接
- [ ] 有 30 秒录屏
- [ ] 有截图
- [ ] 有报价说明
- [ ] 有可交付范围
- [ ] 有可修改次数
- [ ] 有是否交源码说明
- [ ] 有平台规格说明
- [ ] 有客户反馈记录

## 最小商业交付包

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
- 是否包含广告 SDK（广告接口开发包）
- 是否包含多语言
- 是否包含横竖屏
- 修改次数
- 交付周期

## 一周 Todo 清单

### Day 1

- [ ] 选择主渠道：Playable Ads（可试玩广告） / CrazyGames / itch.io
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

- [ ] 抽象 PlatformAdapter（平台适配层）
- [ ] 实现 WebAdapter（普通网页适配实现）
- [ ] 实现目标平台 Adapter（平台适配实现）
- [ ] 加 analytics events（数据统计事件）
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

## 第二阶段升级路线

### 第 1-2 周

目标：

```
形成 1 个可复用 HTML5 游戏模板
```

重点：

- Phaser 或 Three.js 主栈稳定
- PlatformAdapter（平台适配层）稳定
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
- Telegram Mini Apps（Telegram 内嵌网页应用）
- Discord Activities
- Unity 客户单
- Three.js 3D playable ads
- 游戏模板商城

## AI 多 agent（AI 子任务执行者）工作流

你不是让一个 AI 从头写完整游戏，而是让多个 agent（AI 子任务执行者）分工。

### 主 agent 负责

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

### 可并行 agent（AI 子任务执行者）

下面这些英文角色名是给 AI 分工用的标签，不是固定工具名：

```
platform-research agent（平台调研 agent）：
  查目标平台 SDK（平台开发包）、包体、广告、审核、结算规则

gameplay agent（玩法 agent）：
  实现核心玩法、关卡、碰撞、分数、失败/胜利

ui agent（界面 agent）：
  实现菜单、按钮、HUD、结算页、移动端布局

asset agent（素材 agent）：
  生成、整理、压缩、命名素材

threejs / phaser agent（具体技术栈实现 agent）：
  根据技术栈实现具体运行时代码

adapter agent（平台适配 agent）：
  实现 PlatformAdapter（平台适配层）和不同平台 SDK（平台开发包）

qa agent（测试验收 agent）：
  真机、浏览器、包体、性能、异常流程测试

business agent（商业对接 agent）：
  准备报价、作品页、客户私信、平台投稿材料

review agent（审查 agent）：
  审查可维护性、版权、平台合规和交付风险
```

### 每个 agent（AI 子任务执行者）的任务模板

```
背景：
我要做一个面向海外平台的 HTML5（网页游戏）小游戏副业项目。

目标平台：
CrazyGames / Playable Ads（可试玩广告） / itch.io / ...

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

### 你应该怎么用 Codex / Claude

不要这样提问：

```
帮我做一个小游戏
```

这个太空，AI 会随机发挥。

应该这样提问：

```
我要做一个面向 CrazyGames 投稿和 Playable Ads（可试玩广告）改版的 HTML5（网页游戏）小游戏。

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
- audio unlock（音频解锁，移动端常要求点击后才能播放声音）
- PlatformAdapter interface（平台适配层接口）
- WebAdapter（普通网页平台适配实现）
- analytics events（数据统计事件）
- responsive layout（响应式布局，适配不同屏幕）

禁止：
- 不要引入大型依赖
- 不要使用外部图片 URL
- 不要直接调用平台 SDK（平台开发包），先走 adapter（适配层）

验收：
- npm run build 成功
- 手机浏览器可玩
- 无 console error
- 一局 60 秒
- 英文界面
```

让 AI 并行的关键是拆清文件边界。

```
agent A：只做 src/game/core
agent B：只做 src/game/scenes
agent C：只做 src/platform
agent D：只做 assets 和压缩
agent E：只做 docs 和投稿材料
agent F：只做 review 和 test
```

不要让多个 agent 同时改同一个文件。

## 每天的 AI 分工方式

| 日期 | 主 agent | 并行 agent |
| --- | --- | --- |
| Day 1 | 定题材、平台、验收标准 | 平台调研、玩法竞品、素材方向 |
| Day 2 | 搭项目骨架和核心循环 | 玩法实现、UI、输入适配 |
| Day 3 | 定视觉和交互体验 | 资产生成、音效、移动端布局 |
| Day 4 | 接 PlatformAdapter（平台适配层） | SDK（平台开发包）文档核对、Adapter（适配实现）、构建脚本 |
| Day 5 | 准备对外展示 | 截图、录屏、作品页、报价材料 |
| Day 6 | 处理反馈 | Bug 修复、性能优化、包体压缩 |
| Day 7 | 做商业判断 | 复盘、报价调整、下一个渠道计划 |

每个 agent 的任务都要有验收条件：

```
输入是什么
只能改哪些文件
完成后怎么验证
哪些行为禁止
失败时报告什么
```

## Day 7 判定表

一周结束时，用数字做判断。

| 指标 | 通过线 | 没过怎么处理 |
| --- | --- | --- |
| 试玩人数 | >= 5 人 | 先发给朋友、开发群、潜在客户补反馈 |
| 有效外联 | >= 20 条 | 重写私信和报价包，继续发 |
| 有效回复 | >= 2 条 | 检查作品链接、截图、报价是否太弱 |
| 投稿/报价动作 | >= 1 次 | 当天补一次平台投稿或客户报价 |
| 移动端阻断 bug | 0 个 | 先修输入、音频、适配和崩溃 |
| 首屏卖点 | 30 秒内能看懂 | 砍玩法说明，强化视觉反馈 |
| 可复用资产 | 至少 1 套 | 沉淀模板、Adapter（平台适配层）、素材记录 |

判断结果：

```
技术没过：先修游戏和构建
体验没过：先砍功能、强化反馈
渠道没过：换外联对象或投稿平台
报价没过：改交付包和权益边界
数据没过：继续获取真实反馈，不要闭门重构
```

## Scope Cut 规则

每天如果卡住，不要加时间，先砍范围。

优先砍：

- 排行榜
- 成就
- 多语言
- 多关卡
- 复杂剧情
- 复杂 3D 物理
- 登录账号
- 自建后端
- 内购

不能砍：

- 核心操作
- 胜负反馈
- 移动端可玩
- 英文界面
- 结算页
- 截图和录屏
- 基本版权记录
- 投稿或报价动作

## 外联跟踪表

第一周必须对外发出去，否则只是练技术。

```
date,channel,target,link,message_version,status,next_action,notes
2026-09-15,Discord,game publisher,https://...,v1,sent,follow up in 2 days,
2026-09-15,QQ,小游戏单主,https://...,v1,replied,send quote,
2026-09-16,CrazyGames,submission,https://...,submit,pending,wait review,
```

## 下一步

你现在最应该做的不是继续泛泛研究，而是选一个第一款游戏。

建议决策只保留两个选项：

```
选项 A：Phaser 2D 合成 / 排序游戏
目标：最快完成平台投稿和 playable ad 改版

选项 B：Three.js 轻 3D 拖拽 / 点击游戏
目标：用 AI + Blender（3D 建模工具） + GLB（3D 模型单文件）做出视觉差异化作品
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
