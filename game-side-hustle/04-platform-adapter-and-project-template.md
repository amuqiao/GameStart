# PlatformAdapter（平台适配层）与项目模板

这篇文档回答：如何把游戏核心和平台差异隔离，避免每换一个平台就重写游戏。

本文负责：

- PlatformAdapter（平台适配层）能力边界
- 按平台禁用能力
- 项目模板结构

## PlatformAdapter（平台适配层）要考虑什么

你说“不是重写游戏，只是换 PlatformAdapter（平台适配层）”，这个方向是对的，但 PlatformAdapter（平台适配层）不能只理解为“换广告 SDK（广告接口开发包）”。

它至少包括。下面的英文是常见接口能力名，括号里是你阅读时需要理解的职责：

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

- `Ads`：广告，比如插屏广告、激励广告。
- `Analytics`：数据事件统计，比如开始游戏、失败、通关。
- `Storage`：存档，比如本地进度、最高分。
- `Leaderboard`：排行榜。
- `Payment / IAP`（支付 / 应用内购买）：处理购买、权益解锁和订单校验。
- `Lifecycle`：生命周期，比如暂停、恢复、切后台、广告前后。
- `Audio Unlock`：音频解锁，移动浏览器通常要求用户先点击再播放声音。
- `Orientation`：横竖屏方向。
- `Privacy / Consent`：隐私和用户同意。

### 按平台禁用能力

PlatformAdapter（平台适配层）不是只加能力，也要禁用能力。

```
普通 Web：
  可以 localStorage（浏览器本地键值存储） / IndexedDB（浏览器本地数据库），但要处理浏览器隐私模式异常。

Poki：
  外部请求默认阻断；本地存储要考虑 Incognito（浏览器无痕模式）；广告只能走 Poki SDK（Poki 平台开发包）。

GameSnacks：
  不能使用 cookies / localStorage（浏览器本地键值存储） / sessionStorage（浏览器会话存储） / IndexedDB（浏览器本地数据库）；
  不能向外部服务器请求数据；
  存档、广告、音频、暂停恢复都必须走 GameSnacks SDK（GameSnacks 平台开发包）。

Playable Ads（可试玩广告）：
  通常不依赖持久存储；
  不依赖外部请求；
  CTA（行动按钮）走 MRAID（移动广告容器交互接口）或投放网络指定 API；
  音频必须等首次交互后再播放。

Telegram / Discord：
  身份、支付、权益不要只在前端信任；
  需要服务端验签或校验 entitlement（付费权益）。
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

游戏核心只能依赖接口，不能直接依赖平台 SDK（平台开发包）。

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

### 各平台 Adapter（平台适配层）差异

| 平台 | Adapter（平台适配层）重点 | 技术风险 |
| --- | --- | --- |
| 普通 Web | localStorage（浏览器本地存储）、analytics（数据统计）、全屏、分享 | 浏览器兼容 |
| CrazyGames | SDK（平台开发包）、广告、暂停恢复、平台事件 | 审核和 SDK 调用时机 |
| Poki | Poki SDK（Poki 平台开发包）、广告、质量要求 | 规则更严格 |
| Yandex | SDK（平台开发包）、广告、排行榜、存档、本地化 | 文档和地区规则 |
| Playable Ads | MRAID（广告容器接口）、CTA（行动按钮）、包体、无外链 | 平台规格差异大 |
| Telegram | WebApp（内嵌网页应用）、initData（身份数据）、Stars（虚拟支付单位）、Bot（机器人） | 服务端验签和支付 |
| Discord | Embedded App SDK（内嵌应用开发包）、entitlement（付费权益）、IAP（应用内购买） | 身份和付费权益 |
| 国内小游戏 | 广告、支付、登录、分包、隐私 | 审核和资质 |

## Adapter（平台适配层）设计原则

PlatformAdapter（平台适配层）的核心不是“哪里不支持就假装成功”，而是把平台能力显式暴露出来。

推荐每个 Adapter（具体平台适配实现）都提供能力表：

```
export interface PlatformCapabilities {
  ads: "none" | "interstitial" | "rewarded" | "platform";
  storage: "none" | "local" | "platform" | "server";
  leaderboard: "none" | "platform" | "server";
  payments: "none" | "platform" | "server-verified";
  analytics: "none" | "platform" | "custom";
  externalRequests: "allowed" | "blocked" | "limited";
}
```

调用平台能力前先做显式判断：

```
if (platform.capabilities.payments === "none") {
  throw new Error("Payments are not available on this platform.");
}
```

不要让这些情况静默成功：

- 广告没展示却当作已展示
- 激励广告失败却发奖励
- 存档失败却提示保存成功
- 支付未验签却发放道具
- 平台禁止外部请求却继续调用自建 analytics（数据统计）

这些不是“兼容性优化”，而是商业和审核风险。

## 事件命名建议

无论接哪个平台，都先统一自己的事件名，再在 Adapter（平台适配实现）里映射到平台 SDK（平台开发包）。

```
game_loaded
gameplay_start
gameplay_stop
level_start
level_complete
level_fail
ad_requested
ad_started
ad_completed
ad_failed
reward_granted
purchase_started
purchase_completed
purchase_failed
share_clicked
cta_clicked
```

好处：

- 客户报价时能说清楚事件口径
- 换平台时不用改 GameCore（游戏核心逻辑）
- 后续接 PostHog / GA4 / 平台 analytics（数据统计）更简单
- QA 可以按事件顺序验收

## 能力矩阵

先用这张表决定哪些能力能做，哪些能力必须禁止。

| 平台 | ads | storage | analytics | share | payment | leaderboard | external request |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Web | optional | local | custom | optional | unsupported | custom/server | allowed |
| CrazyGames | required/full launch | platform/local | platform | optional | platform/selected | platform | limited |
| Poki | platform | careful/incognito | platform | limited | unsupported | platform/custom | usually blocked |
| Yandex | platform | platform | platform | optional | platform | platform | limited |
| GameSnacks | platform | platform SDK（平台存档） | platform | limited | unsupported/平台规则为准 | platform/limited | blocked |
| Playable Ads | network/MRAID（投放网络 / 广告容器接口） | unsupported | network | CTA only（只允许行动按钮） | unsupported | unsupported | blocked |
| Telegram | optional/custom | server/platform | custom | platform | platform/server-verified | server | allowed |
| Discord | optional/custom | server | custom | platform | platform/server-verified | server | allowed/limited |

表头含义：

- `ads`：广告能力。
- `storage`：存档能力。
- `analytics`：数据事件统计。
- `payment`：支付能力。
- `leaderboard`：排行榜。
- `external request`：是否允许请求外部服务器。

状态解释：

- `required`：平台要求接入或商业化必须接入
- `optional`：可以接，但不是第一版必须
- `unsupported`：不要在 UI 上暴露这个能力
- `blocked`：构建目标中禁止使用
- `limited`：必须逐条核对官方规则

## Mock Adapter（模拟平台适配层）测试

每个游戏至少保留一个 `MockAdapter`（模拟平台适配层），用于本地验证。

它要能模拟：

- SDK（平台开发包）初始化成功
- SDK（平台开发包）初始化失败
- 插屏广告成功 / 失败
- 激励广告成功 / 取消 / 失败
- 存档成功 / 失败
- 切后台暂停
- 回前台恢复
- 支付成功 / 失败 / 未支持

测试目标不是“兜底成功”，而是确认失败会暴露，游戏不会进入错误商业状态。

## Build Target（构建目标）配置

不要只做一个 `npm run build`。至少区分：

```
build:web
build:crazygames
build:poki
build:yandex
build:playable
```

每个 target（构建目标）至少决定：

- 使用哪个 Adapter（平台适配实现）
- 是否允许外部请求
- 是否内联资源
- 是否压缩成单 HTML（单网页文件）
- 是否生成 ZIP（压缩包）
- 是否替换平台 SDK script（平台 SDK 脚本）
- 是否输出平台 metadata
- 是否检查包体大小

## 项目模板结构

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
