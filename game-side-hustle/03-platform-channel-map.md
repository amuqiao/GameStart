# 平台渠道与变现地图

这篇文档回答：不同平台怎么接入、适合什么游戏形态、有哪些硬性规则、怎么变现，以及接单报价时哪些边界必须提前写清楚。

本文负责：

- 平台优先的判断方式
- 海外 Web 游戏平台和 Playable Ads（可试玩广告）
- Telegram、Discord、国内小游戏
- 平台规则复查矩阵
- 变现方式、报价逻辑和合同风险

快速定位：

```
先判断渠道：看“渠道地图”
先判断优先级：看“平台优先级建议”
先判断怎么赚钱：看“变现方式地图”
先判断怎么报价和避坑：看“接单和合同风险”
```

## 平台优先，而不是技术栈优先

你前面的纠偏是对的：

```
不是先选技术栈，再找平台
而是先分析平台，再倒推技术栈
```

因为平台决定：

- 用户是谁
- 怎么分发
- 怎么赚钱
- 支持什么 SDK（平台开发包）
- 包体限制
- 是否允许外部请求
- 是否允许第三方广告
- 是否要求移动端适配
- 是否有审核
- 是否有独占
- 是否能结算到个人

技术栈只是达成平台目标的工具。

## 平台规则核对流程

平台规则变化快，每次真正开做前都要重新核对，不要只看这份文档。

```
1. 打开官方开发者文档
2. 查 SDK（平台开发包）接入方式
3. 查广告、IAP（应用内购买）、存档、排行榜是否必须走平台 API
4. 查包体、文件数量、外部请求、localStorage（浏览器本地键值存储）、WebGL（浏览器图形渲染）版本限制
5. 查审核流程、质量要求、内容限制、素材版权要求
6. 查结算门槛、国家/地区限制、个人开发者是否可收款
7. 把结果写进 docs/platform-notes.md，再开始接入
```

硬约束优先级：

```
禁止项 > 包体和性能 > SDK（平台开发包）事件顺序 > 商业结算 > 推荐优化
```

如果一个平台明确禁止外部请求、第三方广告或本地存储，就不要在 Adapter（平台适配层）里偷偷兜底，要在构建目标中禁用相关能力。

`docs/platform-notes.md` 建议字段。这里的 KYC 是身份认证，IAP 是应用内购买，orientation 是横竖屏方向：

```
Platform:
Last checked:
Official docs:
Account/KYC:
Payout:
SDK:
Ads:
Storage:
Leaderboard:
Payment/IAP:
External requests:
File size:
File count:
Orientation:
Audio policy:
Review flow:
Content restrictions:
Asset/license requirements:
Blocking issues:
Next action:
```

## 渠道选择评分表

第一周选平台时，不要只看平台名气，用下面这张表打分。

| 评分项 | 1 分 | 3 分 | 5 分 |
| --- | --- | --- | --- |
| 现金接近度 | 很难直接收钱 | 有分成但周期长 | 可报价、可接单、可快速反馈 |
| 首周可执行性 | 账号/审核卡很久 | 能准备但未必提交 | 一周内能发链接、投稿或报价 |
| 账号/收款门槛 | 需要复杂资质 | 需要 KYC（身份认证）或合同 | 个人可先展示或报价 |
| SDK（平台开发包）复杂度 | 身份/支付/服务端复杂 | 广告/存档中等 | 静态包或简单 SDK（平台开发包） |
| 包体/外链限制 | 强限制且改造大 | 有限制但可控 | 普通 Web 包可跑 |
| 可复用性 | 只能一次性用 | 能部分复用 | GameCore（游戏核心逻辑） / Adapter（平台适配层） / 素材可复用 |

第一周建议：

```
展示页 / itch.io / GitHub Pages：用来证明作品存在
Playable Ads（可试玩广告）样片：用来接近现金流
CrazyGames 投稿准备：用来验证平台化能力
```

选择渠道前必须问：

- 我现在能不能注册账号？
- 我现在能不能收款？
- 我是否需要 KYC（身份认证）、税务、企业主体或合同？
- 审核周期是否会超过第一周？
- 是否允许个人开发者提交？
- 是否需要先接 SDK（平台开发包）才能测试？
- 拒稿后有没有可复用的展示价值？

如果收款、审核或账号会卡住，就把它从“第一周收入目标”降级为“第一周准备目标”。

## 渠道地图

### CrazyGames

定位：

```
Web 游戏平台，适合投稿 HTML5（网页技术标准）游戏
```

可能技术栈：

- Phaser
- Three.js
- Cocos Creator Web
- Unity WebGL（Unity 导出的浏览器版本）
- Godot Web
- 原生 JS

接入重点：

- CrazyGames SDK（CrazyGames 平台开发包）
- 广告事件
- 游戏暂停/恢复
- 质量审核
- 移动端适配
- 不要带外部平台品牌或不允许的第三方广告

变现方式：

- 平台广告分成
- 部分游戏可能有 IAP（应用内购买）机会

适合你做什么：

```
做一款英文 Web 小游戏，作为第一批平台投稿目标之一
```

官方资料：

- https://developer.crazygames.com/
- https://docs.crazygames.com/
- https://docs.crazygames.com/sdk/intro/
- https://docs.crazygames.com/sdk/faq/

### Yandex Games

定位：

```
Web / HTML5（网页游戏）平台，覆盖多地区流量
```

可能技术栈：

- Phaser
- Three.js
- Cocos Creator Web
- Unity WebGL（Unity 导出的浏览器版本）
- Godot Web
- 原生 JS

接入重点：

- Yandex Games SDK（Yandex 平台开发包）
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

### GameDistribution

定位：

```
Web 游戏分发与广告变现渠道
```

可能技术栈：

- Phaser
- Three.js
- Cocos Creator Web
- Unity WebGL（Unity 导出的浏览器版本）
- Godot Web
- 原生 JS

接入重点：

- GameDistribution SDK（GameDistribution 平台开发包）
- 广告事件
- 平台包体和审核要求
- 不同站点分发兼容

变现方式：

- 广告分成

官方资料：

- https://gamedistribution.com/
- https://gamedistribution.com/sdk/

### Poki

定位：

```
高质量精选 Web 游戏平台
```

可能技术栈：

- Phaser
- Cocos Creator Web
- Unity WebGL（Unity 导出的浏览器版本）
- Three.js

接入重点：

- Poki SDK（Poki 平台开发包）
- 平台 QA
- 移动端、桌面端、平板体验
- 16:9 画布比例和等比缩放
- Incognito（浏览器无痕模式）模式可玩
- 外部请求默认阻断，字体、图片、音频、库都要打进包
- SDK（平台开发包）事件顺序正确，比如 `gameplayStart()` / `gameplayStop()` 不能连续重复触发
- 广告只能按平台规则接
- 不允许第三方广告系统
- 不支持 IAP（应用内购买），主要按 Poki 广告系统变现
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

### GameSnacks

定位：

```
轻量 HTML5（网页游戏）游戏分发生态
```

可能技术栈：

- 原生 JS
- Phaser
- PixiJS
- Three.js

接入重点：

- 必须包含 `game.json`
- 必须接 GameSnacks Developer SDK（GameSnacks 平台开发包）
- 使用 Canvas（2D 画布）或 WebGL（浏览器图形渲染）渲染
- 支持 9:16 竖屏，建议支持 16:9 和 1:1
- 必须支持 touch 和 mouse
- 初始下载必须小于平台限制，目标应尽量压到更低
- 不能直接加载第三方广告 API
- 不能使用 cookies、`localStorage`（浏览器本地键值存储）、`sessionStorage`（浏览器会话存储）、`IndexedDB`（浏览器本地数据库）
- 不能向外部服务器发请求
- 存档必须走 GameSnacks Storage interface
- 音频、暂停、恢复、广告都要走 SDK（平台开发包）指定接口
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

### itch.io

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

### Playable Ads（可试玩广告）

定位：

```
不是普通小游戏平台，而是广告投放素材
```

你做的是：

```
一个 15-60 秒可交互试玩广告
目标是让用户点击 CTA（行动按钮，比如 Install / Play Now）去下载 App 或进入落地页
```

可能技术栈：

- 原生 JS
- Phaser
- PixiJS
- Three.js
- 极少量 Cocos / Unity 导出后强压缩

接入重点：

- MRAID（移动广告容器交互接口）
- 单 HTML（所有资源尽量打进一个网页文件）或 ZIP（压缩包）
- 包体限制，各投放网络不完全一样
- 文件数量限制，各投放网络不完全一样
- 首屏加载速度
- 禁止自动跳转
- 禁止未交互播放音频
- CTA（行动按钮）通过平台 API
- 不能依赖外部网络资源

关键认知：

```
Playable Ads（可试玩广告）没有一个“万能规格”。
Google、AppLovin、Unity Ads、ironSource、TikTok、Mintegral 的包体、文件形式、MRAID（移动广告容器交互接口）版本、外链规则、测试工具和审核习惯都可能不同。
```

常见规格差异：

| 网络 | 常见交付形式 | 重点 |
| --- | --- | --- |
| Google Ads | ZIP（压缩包） | 常见要求 5MB 内、文件数量限制、orientation meta（横竖屏声明）、相对路径 |
| AppLovin | 单 HTML（单网页文件） | 资源内联、MRAID（广告容器接口）、不能外部请求、首次交互后开始计时 |
| Unity Ads | 单 HTML（单网页文件） | 内联压缩、MRAID（广告容器接口）、5MB 内、横竖屏都要能工作 |
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
- 不同 CTA（行动按钮）版
- 不同语言版
- 包体压缩版

参考资料：

- https://support.google.com/google-ads/answer/9981650
- https://support.applovin.com/en/growth/promoting-your-apps/welcome-to-applovin/creative-specs-and-guidelines
- https://developers.is.com/ironsource-mobile/general/playable-ad-requirements/
- https://ads.tiktok.com/help/article/playable-ads

### Telegram Mini Apps（Telegram 内嵌网页应用）

定位：

```
Telegram 内运行的 Web App / Mini App（聊天软件里的内嵌网页应用）
```

可能技术栈：

- Web 前端
- Phaser / Three.js / PixiJS
- FastAPI / Node.js 后端
- Telegram Bot（Telegram 机器人）

接入重点：

- Telegram WebApp API（Telegram 内嵌网页能力）
- initData（Telegram 传给网页的用户身份数据）服务端验签
- 用户身份
- Stars（Telegram 内虚拟支付单位）支付
- 分享传播
- Bot（Telegram 机器人）入口

变现方式：

- Telegram Stars（Telegram 内虚拟支付单位）
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

### Discord Activities

定位：

```
Discord 内嵌活动 / 社交游戏
```

可能技术栈：

- Web App（网页应用）
- Phaser / Three.js / PixiJS
- Node.js / FastAPI 后端
- Discord Embedded App SDK（Discord 内嵌应用开发包）

接入重点：

- Discord App
- Embedded App SDK（内嵌应用开发包）
- Activity iframe（Discord 内嵌网页容器）
- OAuth（授权登录） / 用户身份
- IAP（应用内购买） / Entitlements（付费权益）
- 多人房间和语音场景

变现方式：

- IAP（应用内购买）
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

### 国内小游戏渠道

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
- 广告 SDK（广告接口开发包）
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

### 长尾渠道和交易市场

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

### 平台规则复查矩阵

提交前必须复查官方文档。下面只作为路线图，不作为永久准确规则。

Last checked：2026-09-15

| 平台 | 官方入口 | 关键硬要求 | 提交前必须复查 |
| --- | --- | --- | --- |
| CrazyGames | https://docs.crazygames.com/ | Basic Launch / Full Launch（基础上线 / 完整上线）分阶段；Full Launch 才启用完整变现；SDK（平台开发包）支持 HTML5、Unity、Godot、Cocos 等；广告、云存档、数据等走 SDK | Basic 和 Full 要求、SDK v3、广告点、移动端 QA、付款门槛和收款方式 |
| Poki | https://developers.poki.com/guide/requirements-quality | 桌面/移动/平板；16:9；Incognito（无痕模式）可玩；外部请求默认阻断；只允许 Poki 广告；无 IAP（应用内购买） | SDK（平台开发包）事件顺序、CSP（内容安全策略）、广告调用、外链、隐私政策、QA 规则 |
| Yandex Games | https://yandex.com/dev/games/doc/en/ | SDK（平台开发包）、广告、排行榜、存档、本地化、审核 | 地区结算、广告规则、IAP（应用内购买）、语言、本地化要求 |
| GameDistribution | https://gamedistribution.com/sdk/ | SDK（平台开发包）广告、分发兼容、Web 包上传 | 广告触发、品牌露出、包体、审核、结算 |
| GameSnacks | https://developers.google.com/gamesnacks/developer/requirements | `game.json`、GameSnacks SDK（平台开发包）、Canvas/WebGL（2D 画布 / 浏览器图形渲染）、9:16、低端设备 30 FPS（每秒帧数）、禁止外部请求、禁止本地存储 | 初始下载、存档 API、广告 API、音频、暂停恢复、文件命名和资源列表 |
| itch.io | https://itch.io/docs/creators/ | 项目页、Web/下载包、定价和作品展示 | 收款、税务、页面素材、是否允许外链和嵌入 |
| Google Playable Ads | https://support.google.com/google-ads/answer/9981650 | ZIP（压缩包）、常见 5MB、文件数量限制、orientation meta（横竖屏声明）、相对路径、响应式 | 具体广告系列规则、外部资源例外、HTML 结构、转化口径 |
| AppLovin Playable | https://support.applovin.com/en/growth/promoting-your-apps/welcome-to-applovin/creative-specs-and-guidelines | 单 HTML（单网页文件）、常见 5MB、MRAID（广告容器接口）、无外部请求、首次交互后音频/计时、不能首点跳转 | MRAID（广告容器接口）版本、preview 工具、横竖屏、CTA（行动按钮）、WebGL fallback（图形渲染降级） |
| Unity Ads Playable | https://docs.unity.com/en-us/user-acquisition/creatives/creative-specifications | 单 HTML（单网页文件）、内联压缩、常见 5MB、MRAID（广告容器接口）、横竖屏 | overlay（覆盖层）安全区、close button（关闭按钮）、MRAID（广告容器接口）、平台审核 |
| Mintegral Playable | https://helpcenter.mintegral.com/en/docs/asset-specs | HTML playable（HTML 可试玩广告）、常见 5MB、配套 icon/main image（图标 / 主图） | 测试工具、素材尺寸、落地页、包体 |
| Telegram Mini Apps | https://core.telegram.org/bots/webapps | WebApp API（内嵌网页接口）、Bot（机器人）入口、initData（身份数据）服务端验签、Stars（虚拟支付单位） | 支付规则、身份验签、隐私、服务端接口 |
| Discord Activities | https://discord.com/developers/docs/activities/overview | iframe app（内嵌网页应用）、Embedded App SDK（内嵌应用开发包）、OAuth（授权登录）、entitlement / IAP（付费权益 / 应用内购买） | 审核、IAP 权益校验、多人场景、域名和部署 |
| 微信小游戏 | https://developers.weixin.qq.com/minigame/dev/guide/ | 小游戏运行环境、包体/分包、广告、支付、审核 | 账号资质、版号/内容、隐私、支付、广告规则 |
| 抖音小游戏 | https://developer.open-douyin.com/docs/resource/zh-CN/mini-game/introduction/usage-guide | 小游戏 SDK（平台开发包）、审核、广告、支付、平台能力 | 资质、广告分成、支付、实名/防沉迷、包体 |

## 平台优先级建议

按“你要一周内跑通商业闭环”的目标，可以这样分层。

### P0：一周内必须跑通

```
1. itch.io / GitHub Pages / 自建静态页
2. Playable Ads（可试玩广告）样片
3. CrazyGames 投稿准备
```

原因：

- 展示页能马上给客户看
- Playable Ads（可试玩广告）更接近现金流
- CrazyGames 是 Web 游戏平台投稿验证

### P1：第二批扩展

```
1. Yandex Games
2. GameDistribution
3. Newgrounds / Kongregate / Y8 等作品曝光渠道
```

原因：

- 增加分发面
- 可复用 Web 包和 PlatformAdapter（平台适配层）
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

## 变现方式地图

### 平台广告分成

适合：

- CrazyGames
- Yandex Games
- GameDistribution
- Poki
- 国内小游戏

要求：

- 游戏质量够
- 留存和时长够
- SDK（平台开发包）接入正确
- 广告点设计合理
- 平台审核通过

风险：

- 不是上传就有收入
- 流量由平台分配
- 收入取决于地区、广告库存、留存、时长

### Playable Ads（可试玩广告）外包

适合：

- 短期现金流
- 有开发能力但没游戏经验的人
- AI-first 高效率产出多版本

交付物：

- 单 HTML（单网页文件） / ZIP（压缩包）
- 竖屏版
- 横屏版
- 多语言版
- 不同 CTA（行动按钮）版
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

### IAP（应用内购买） / 虚拟商品

适合：

- Telegram Mini Apps（Telegram 内嵌网页应用）
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

不适合第一周作为主线，除非你选择的平台本身就是 IAP（应用内购买）驱动。

### 付费下载 / 打赏

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

### 游戏模板 / 源码销售

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
同一个 GameCore（游戏核心逻辑）
多套皮肤
多个 PlatformAdapter（平台适配层）
多种交付价格
```

## 接单和合同风险

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
- 是否包含平台 SDK（平台开发包）接入
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

### 报价包模板

不要只说“我会做小游戏”。你要卖一个明确交付包。

```
HTML5 Playable Ad Package

Includes:
- 1 playable HTML5 demo
- portrait or landscape version
- CTA button（行动按钮）
- basic MRAID integration（基础广告容器接口接入）
- mobile browser test
- compressed production build（压缩后的正式构建产物）
- 2 revision rounds

Optional:
- source code
- both portrait and landscape
- extra language version
- extra reskin version
- platform-specific adapter（特定平台适配层）
- 30s recording
- icon and screenshots
```

价格要按权益拆：

```
只交 build（构建产物） < 交源码 < 买断 < 独占
单平台 < 多平台
无素材 < 含素材授权
不保证审核 < 协助审核 < 包含审核修改
```
