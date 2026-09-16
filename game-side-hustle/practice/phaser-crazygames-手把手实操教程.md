# Phaser + CrazyGames 手把手实操教程

面向对象:**懂后端开发,不懂游戏开发**的人。
目标:不从 0 学习,直接拿一个跑得起来的工程开始,一路做到能提交 CrazyGames。

Last verified:2026-09-16 · 本文所有命令、数字、日志都在本机实跑过,不是抄文档。

配套工程:[`pulse-dodger/`](./pulse-dodger/) —— 一个完整可玩的原创小游戏 + 工程模板。

```
实测环境:Node v25.9.0 / npm 11.12.1 / macOS
实测结果:Phaser 3.90.0 · 提交包 3 个文件 / 1.16 MB / zip 314.7 KB
```

---

## 第 0 步:先玩到,再理解

不要先读代码。先让它在你屏幕上动起来,建立"这东西是活的"的感觉。

```bash
cd game-side-hustle/practice/pulse-dodger
npm install          # 约 50 秒,113 个包
npm run dev
```

浏览器打开 **http://localhost:8080**,你应该看到:

```
PULSE DODGER
躲开红色碎片 · 吃蓝色能量 · 充满后释放冲击波
      [ 点击任意位置开始 ]
```

点一下开始。鼠标移动控制那个青色发光球,躲红色碎片,吃蓝色能量点。
右上角的条充满后,点击或按空格释放冲击波清场。

**玩三局再往下读。** 你需要知道你在改的是什么手感。

---

## 第 1 步:Phaser 概念 ↔ 后端概念对照表

这是整篇教程最值钱的一张表。游戏开发的词汇量不大,但和后端完全不重合,
卡住的人 90% 卡在"不知道这个词对应我熟悉的什么东西"。

| Phaser 概念 | 后端里的对应物 | 说明 |
| --- | --- | --- |
| `Game` | 应用实例(FastAPI app) | 整个游戏一个,持有配置和全局服务 |
| `Scene` | 路由 / 页面控制器 | 一个 Scene = 一个界面或一个玩法阶段 |
| `scene.start('Play')` | `RedirectResponse` | 切场景,旧场景被销毁 |
| `preload()` | 应用启动的 lifespan | 加载资源,做完才允许"接流量" |
| `create()` | 请求进来时的初始化 | 每次进入这个场景跑一次 |
| `update(time, delta)` | **每秒执行 60 次的定时任务** | 游戏的心脏。写错这里就掉帧 |
| `delta` | 距上次执行过了多少毫秒 | 所有移动都要乘它,否则不同设备速度不一样 |
| GameObject | ORM 实体 | 屏幕上一个东西:图片、文字、粒子 |
| Group | 集合 / 连接池 | 同类对象批量管理,带对象复用 |
| Physics Body | 实体上的约束 | 碰撞体积、速度、重力 |
| `overlap(a, b, cb)` | 事件订阅 | a 和 b 重叠时调 cb |
| Tween | 动画补间 | "把这个值在 300ms 内从 A 变到 B" |
| Texture | 静态资源 | 贴图。本项目全部程序生成,不加载文件 |

**最重要的一条**:`update()` 每秒跑 60 次。
后端里你习惯"一个请求做一件事",游戏里是"每 16 毫秒把整个世界重算一遍"。
所以 `update()` 里不能有任何慢操作 —— 不能 `await`,不能新建大对象,不能拼接大字符串。

---

## 第 2 步:工程骨架,逐个文件

```
src/
  main.ts                    ← 从这里开始读
  game/
    config.ts                所有可调数值
    core/
      GameState.ts           一局游戏的规则(纯逻辑,不碰 Phaser)
      difficulty.ts          难度曲线(纯函数,有单元测试)
    scenes/
      BootScene.ts           生成贴图 → 通知平台加载完成 → 切菜单
      MenuScene.ts           标题页
      PlayScene.ts           主玩法,最长的文件
      ResultScene.ts         结算页
    systems/audio.ts         音效
    ui/Hud.ts                分数与充能条
  platform/                  ← 第二重要,单开一节讲
```

### `main.ts`:启动顺序不能反

```ts
async function bootstrap(): Promise<void> {
  const adapter = await initPlatform();   // 1. 先初始化平台
  new Phaser.Game({ ... });               // 2. 再创建游戏
}
```

反过来的话,`BootScene` 里的 `platform()` 会拿不到 adapter 直接抛异常。
这和后端里"先建数据库连接池,再启动 HTTP 服务"是同一件事。

### 场景的生命周期

```
BootScene.preload()  → platform.loadingStart()   告诉平台"我在加载"
BootScene.create()   → 生成贴图 → platform.loadingStop()
                     → scene.start('Menu')
MenuScene.create()   → 画标题,等第一次点击
                     → scene.start('Play')
PlayScene.create()   → platform.gameplayStart()  告诉平台"玩家真的在玩"
PlayScene.update()   → 每帧:移动 → 生成 → 清理 → 刷 HUD
           死亡     → platform.gameplayStop()
                     → scene.start('Result')
```

这条链上的每个平台信号都**不能漏**。漏了 `loadingStop`,平台会一直以为你卡在加载中。

### 规则层为什么要和 Phaser 分开

`core/difficulty.ts` 是纯函数:输入存活秒数,输出这一刻的生成参数。
不引用任何 Phaser 对象,所以可以直接在 node 里测:

```bash
npm test
```

```
✔ 开局节奏宽松,给新手喘息空间
✔ 90 秒后难度封顶,不会无限上涨
✔ 难度单调递增:间隔越来越短,速度越来越快
✔ 45 秒后开始双发
✔ 能量点供给全程稳定,否则后期无法充能
ℹ pass 5  fail 0
```

这就是后端里"把业务逻辑从 handler 里抽出来"的同一个动作。
游戏里这么做的收益更大:**手感调坏了会被测试立刻抓出来**,不用一遍遍进游戏试。

---

## 第 2.5 步:UI 外壳 —— 模板里最值得你照抄的部分

大多数 Phaser 模板(包括官方的)只给你空场景,外壳要自己画。这个模板做完了。

### 四件外壳,各自解决什么

| 外壳 | 解决的不确定性 | 触发方式 |
| --- | --- | --- |
| 加载遮罩 | "是在加载还是坏了" | 自动,**超过 300ms 才显示** |
| 主页 | "我还没准备好" + **音频解锁** | 启动后 |
| 暂停面板 | "我被打断了,损失不可逆" | ESC / 按钮 / **窗口失焦** |
| 设置页 | "默认值不合我意" | 主页按钮,**无可设项时不出现** |

### 关键设计 1:加载遮罩必须是 DOM,不能是 Phaser 场景

最长的一段等待发生在 **Phaser 自己还没解析完**的时候(引擎 1.1MB)。
这段时间里 Phaser 场景根本不存在,画不出任何东西。所以遮罩写在 `index.html` 里,
由 `src/ui/LoadingOverlay.ts` 控制显隐。

而且**低于 300ms 不显示**——加载只要 80ms 却闪一下遮罩,视觉上像 bug。

### 关键设计 2:失焦暂停(这条最容易漏)

先说清 Phaser 的默认行为,我实测读过 `node_modules/phaser/src/core/Game.js`:

| 情况 | Phaser 默认做什么 | 够不够 |
| --- | --- | --- |
| 切标签页(HIDDEN) | `loop.pause()`,**游戏确实停了** | 停是停了,但**回来时立刻自动恢复**,玩家没反应时间 |
| 点到别的窗口(BLUR) | 只设 `inFocus = false`,**游戏继续跑** | ❌ 真缺口 |

所以两种都要接管:

```ts
this.game.events.on(Phaser.Core.Events.BLUR, onBlur);      // 真缺口
this.game.events.on(Phaser.Core.Events.VISIBLE, onVisible); // 回来时不自动恢复,让玩家点继续
```

恢复时还要给缓冲,否则"点继续的瞬间被悬在头上的碎片撞死":

```ts
this.nextHazardAt = this.time.now + 600;
```

### 关键设计 3:场景切走必须解绑全局监听

```ts
this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
  this.game.events.off(Phaser.Core.Events.BLUR, onBlur);
});
```

**后端里请求结束一切自动回收,游戏里没这个保障。** 不解绑的话再次进入该场景会重复注册,
失焦一次弹出多个面板。这是 Phaser 新手最常见的 bug,而且很难查。

### 关键设计 4:UI 由平台能力决定,不是写死的

CrazyGames 的播放器外框自带喇叭按钮。你游戏内再做一个,两个开关会互相打架。
所以能力位里加了两个字段:

```ts
platformProvidesAudioToggle: boolean;   // CrazyGames: true,自托管: false
platformProvidesLoadingUI: boolean;
```

**同一份代码,实测效果**:

```
CrazyGames 路径:暂停面板 2 个按钮(继续 / 回到主页),主页无设置入口
自托管路径:    暂停面板 3 个按钮(继续 / 音效:开 / 回到主页),主页有设置入口
```

不需要发行前手动改代码。设置页如果过滤后一行都不剩,**连入口按钮都不画** ——
而不是给玩家一个空页面。

## 第 3 步:平台适配层 —— 这一层决定你以后能不能少干活

### 为什么必须有这一层

CrazyGames 的 SDK 长这样:

```js
window.CrazyGames.SDK.ad.requestAd('rewarded', { adFinished, adError });
```

如果你在 `PlayScene` 里直接写这行,那么以后上 Poki、上 itch.io、上小游戏平台,
你要在玩法代码里到处找 `window.CrazyGames` 然后改。这就是后端里
"业务代码里直接写死某个云厂商 SDK"的经典错误。

正确做法是加一层接口:

```ts
// 游戏核心只认这个
const rewarded = await platform().showRewarded('revive');
if (rewarded) { revive(); }
```

换平台只改 `src/platform/adapters/` 下的文件,玩法一行不动。

### 第一个坑:TypeScript 编译不过

CrazyGames **没有公开 GitHub organization,npm 上没有官方包,没有 `@types`**。
SDK 只能通过 `index.html` 的 `<script>` 标签加载,在 TS 眼里就是个不存在的全局变量。
你写下第一行 SDK 调用就会看到:

```
TS2339: Property 'CrazyGames' does not exist on type 'Window & typeof globalThis'.
```

解法是手写类型声明,已经放在 `src/platform/crazygames.d.ts`:

```ts
declare global {
  interface Window {
    // 必须是可选的:SDK 脚本没加载完 / 不在 CrazyGames 环境时就是 undefined
    CrazyGames?: { SDK: CrazyGamesSDK };
  }
}
```

### 第二个坑:SDK 不能打进 bundle

```html
<!-- index.html -->
<script src="https://sdk.crazygames.com/crazygames-sdk-v3.js"></script>
```

必须留在 HTML 里。不要 `import`,也不要让 Vite 去处理它。

### 平台选择不是"兜底"

```ts
export async function initPlatform(): Promise<PlatformAdapter> {
  const sdk = window.CrazyGames?.SDK;
  const adapter = sdk ? new CrazyGamesAdapter(sdk) : new WebAdapter();
  await adapter.init();
  return adapter;
}
```

这里判断的是"SDK 脚本在不在",属于**环境探测**。
一旦选定 `CrazyGamesAdapter`,后续 SDK 调用出错就该原样抛出去,
**不会偷偷退回 WebAdapter**。把异常吞掉你就永远查不出线上为什么没广告收入。

> **实测发现**:SDK 脚本在 `localhost` 上也能加载成功,会进入 local 模式。
> 所以本地开发时 `[boot] 平台 = crazygames`,而不是 `web`。
> 控制台会看到 `(local)` 后缀:
> ```
> HTML5 SDK  GAME  Requesting game loading start (local)
> HTML5 SDK  DATA  Get "pulse-dodger:best-score", returning null
> ```
> `WebAdapter` 真正生效的场景是把 `<script>` 那行删掉,或者部署到 CSP 拦截外链的环境。

---

## 第 4 步:CrazyGames SDK v3 的五件必做的事

按"不做会出什么事"排序。

### 1. 生命周期信号(不做:推荐权重掉)

```ts
platform().loadingStart();    // BootScene.preload
platform().loadingStop();     // 资源加载完
platform().gameplayStart();   // 玩家真的开始玩
platform().gameplayStop();    // 暂停 / 死亡 / 回菜单
```

平台靠这四个信号判断"玩家是不是真的在玩",直接影响它给你多少流量。

### 2. 响应平台静音(**不做:QA 直接退回**)

CrazyGames 播放器外框上有个喇叭按钮。玩家点它,你的游戏必须立刻静音。

```ts
// src/game/systems/audio.ts
bindPlatformSettings(): void {
  const adapter = platform();
  this.muted = adapter.getSettings().muteAudio;
  adapter.onSettingsChange((settings) => { this.muted = settings.muteAudio; });
}
```

这是最常见的提交退回原因,而且很多教程根本不提。

### 3. 云存档(不做:次日留存塌掉)

CrazyGames 的 `data` 模块 **API 形状和 localStorage 完全一样,而且是同步的**:

```ts
save(key: string, value: string): void { this.sdk.data.setItem(key, value); }
load(key: string): string | null { return this.sdk.data.getItem(key); }
```

注意**不要**把它包成 `Promise`。它本来就是同步的,强行 `async` 只会让调用方多写无意义的 `await`。
接了它,玩家换设备进度还在;不接,换个浏览器就从零开始。

### 4. `happytime()`(不做:广告时机变差)

玩家爽到的瞬间调它 —— 破纪录、一次清掉一大片:

```ts
if (cleared.length >= PULSE.happyTimeThreshold) {
  platform().happyTime();
}
```

平台用这个信号决定什么时候插广告最不伤体验。

### 5. 进度上报

```ts
platform().reportProgress((this.state.score / this.state.best) * 100);
```

休闲游戏没有"关卡进度",用"当前分/历史最高分"近似即可。

---

## 第 5 步:广告 —— 三个最容易写错的地方

### 错误 1:以为 `requestAd` 返回 Promise

它**不是**。它是回调式的:

```js
window.CrazyGames.SDK.ad.requestAd(adType, {
  adStarted:  () => {},
  adFinished: () => {},   // 广告正常播完
  adError:    (e) => {},  // 播放失败**或者根本没有广告库存**
});
```

所以适配层要自己包一层 Promise。

### 错误 2:把 `adError` 当成功(白送奖励)

`adError` 在"出错"和"没库存"两种情况下都会触发。对激励视频来说,
这两种情况玩家都**没看完广告**,不能发奖:

```ts
showRewarded(reason: string): Promise<boolean> {
  return new Promise((resolve) => {
    this.sdk.ad.requestAd('rewarded', {
      adFinished: () => resolve(true),    // 看完了 → 发奖
      adError:    () => resolve(false),   // 没看完 → 不发奖
    });
  });
}
```

**这个 boolean 是整个适配层最不能写错的一行。** 写反了要么白送奖励(收入归零),
要么该发不发(玩家骂街)。

调用方:

```ts
const rewarded = await platform().showRewarded('revive');
if (rewarded) { this.revive(); }   // 只有 true 才复活
```

### 错误 3:广告节奏伤留存

```ts
// ResultScene:第 1 局不打广告,之后每 3 局一次
const runs = GameState.runsPlayed();
const shouldShowAd = runs > 1 && runs % 3 === 0;
```

新玩家第一局结束就吃插屏广告,是最伤留存的做法。别这么干。

另外:广告播放期间必须暂停游戏并静音,官方文档明确要求。
本项目的契约是**调用方**自己停:

```ts
const wasMuted = audio.isMuted;
audio.setMuted(true);
await platform().showInterstitial('restart');
audio.setMuted(wasMuted);
```

### 复活流程的完整逻辑

```ts
// 每局只给一次,且必须平台真的支持激励视频才提示
if (!this.state.reviveUsed && platform().capabilities.rewardedAds) {
  const accepted = await this.askRevive();        // 5 秒倒计时的询问 UI
  if (accepted) {
    const rewarded = await platform().showRewarded('revive');
    if (rewarded) { this.revive(); return; }      // 只有真看完才复活
  }
}
this.finishRun();
```

`revive()` 里要**清场**,否则复活即死,广告等于白看:

```ts
for (const obj of this.hazards.getChildren().slice()) { obj.destroy(); }
this.nextHazardAt = this.time.now + 1200;   // 再给 1.2 秒喘息
```

---

## 第 5.4 步:单位体系 —— 让"改一个决策"真的只改一处

这是整个模板最值得你搬走的一条设计。

### 问题

一开始我把画布设成 960×540,所有坐标直接写绝对像素:

```ts
.text(cx, 140, '标题')
.text(cx, 196, '副标题')
.text(cx, 340, '开始')
```

在 27 寸显示器上全屏,浏览器要把 960 宽硬拉到 2560,**放大 2.67 倍,画面明显发糊**。
想提高分辨率?得改 17 个地方。

这就是前端里的老问题:**有 color token、有 type scale,但没有 spacing scale,
布局全是 magic number。**

### 解法:设计单位(等价于前端的 rem)

```ts
// config.ts
const DESIGN_WIDTH = 960;                 // 按这个宽度设计,不改
export const RENDER_WIDTH = 1920;         // ← 改分辨率只改这一个数
export const UI_SCALE = RENDER_WIDTH / DESIGN_WIDTH;
export const u = (designUnits: number) => Math.round(designUnits * UI_SCALE);
```

**空间类**数值全部过 `u()`:

```ts
radius: u(14)            // 半径
keyboardSpeed: u(420)    // 速度 px/s
title: `${u(62)}px`      // 字号
```

**非空间类**保持纯数字,不要乘:

```ts
scorePerMote: 10         // 分数
hazardIntervalMs: 900    // 时间
happyTimeThreshold: 4    // 阈值
```

这个区分很重要。把分数也乘上去,换分辨率会把游戏平衡改掉。

### 三套刻度

`theme.ts` 里定义,布局代码**不许出现裸数字**:

```ts
font:   { title, heading, score, hudScore, button, body, small }    // 字号刻度
space:  { xs, sm, md, lg, xl }                                      // 间距刻度
anchor: { heading, title, lead, meta, action, subAction, footer }   // 纵向锚点
```

`anchor` 是关键,它写成**画布高度的比例**而不是绝对像素:

```ts
anchor: {
  title: 0.26,      // 主页大标题在 26% 高度处
  action: 0.63,     // 主按钮在 63%
  footer: 0.92,     // 页脚在 92%
}
```

用的时候:

```ts
const y = (ratio: number) => GAME_HEIGHT * ratio;
this.add.text(cx, y(THEME.anchor.title), THEME.copy.gameTitle, ...)
```

比例不随分辨率变化,所以 `GAME_HEIGHT` 从 540 变 1080 时布局代码一行都不用动。
额外好处:几个页面的标题、主按钮、页脚会**自动对齐在同一高度**,不用各写各的。

### 实测验证

改一行 `RENDER_WIDTH: 1920 → 1280`,重新构建截图:布局比例完全一致,
只有渲染分辨率变了。这条主张是实测过的,不是设计意图。

### 为什么选 1920

CrazyGames 列出的最大 iframe 尺寸就是桌面全屏 **1920×1080**。
基底设成它,意味着在平台内**永远不会被放大,只会被缩小** —— 位图放大会糊,缩小不会。

包体代价:**几乎为零**。实测 316.9 KB → 317.8 KB,只涨 0.9 KB。
因为贴图是运行时程序生成的,改的只是源码里几个数字。

⚠️ **但这个红利只属于"零素材"游戏。** 如果你用真图片,宽高各翻倍 = 面积 4 倍 =
**图片体积约 4 倍**。那时"清晰 vs 小包体"就是真取舍了。

## 第 5.5 步:换皮 —— 两个文件的分工

```
src/game/config.ts   玩法数值 + 单位体系   → 换玩法 / 换分辨率时改
src/game/theme.ts    视觉与文案 + 三套刻度 → 换皮时改
```

这条线是整个模板可复用性的关键。混在一起的话,换个配色要小心绕开数值,
换个难度要小心绕开颜色。

`theme.ts` 里有什么:

```ts
export const THEME = {
  bg, bgAccent, overlayFill, scrimFill,        // 画布与遮罩
  entity: { player, hazard, mote, pulse },     // 三种实体的颜色
  text:   { primary, dim, accent, warning },   // 文字色
  font:   { title, heading, score, button },   // 字号
  button: { primaryBg, ghostBg, ... },         // 按钮样式
  copy:   { gameTitle, paused, resume, ... },  // **所有面向玩家的文案**
};
```

换个主题只动这一个文件,整套 UI 外壳(面板、按钮、HUD、加载条)自动跟着变,
一行布局代码都不用碰。`copy` 单独成块是为了以后做多语言时直接换成 i18n 查表。

## 第 5.7 步:帧率一致性 —— 一条容易漏掉的硬要求

CrazyGames 在玩法要求里明文写着:

> "The game's physics must perform consistently across different monitor
> refresh rates (e.g. 144 Hz, 165 Hz)."

Phaser 的 `update()` 跟着显示器刷新率跑。所以这种写法是错的:

```ts
// 每帧向目标靠拢 18%
Phaser.Math.Linear(this.player.x, target.x, 0.18);
```

| 显示器 | update 频率 | 实际跟随速度 |
| --- | --- | --- |
| 60Hz | 60 次/秒 | 基准 |
| 144Hz | 144 次/秒 | **快 2.4 倍** |
| 165Hz | 165 次/秒 | **快 2.75 倍** |

电竞显示器的玩家操控明显更灵敏 = 难度不一样。正确写法:

```ts
const FRAME_MS_60 = 1000 / 60;
const t = 1 - Math.pow(1 - 0.18, delta / FRAME_MS_60);
Phaser.Math.Linear(this.player.x, target.x, t);
```

把"每帧 18%"换算成"每 16.667ms 18%"。

**哪些要补偿、哪些不用:**

| 写法 | 要不要补偿 |
| --- | --- |
| Arcade 物理的 `setVelocity()` | ❌ Phaser 自己做了 delta 修正 |
| `this.time.now` 判断生成时机 | ❌ 墙钟时间,与帧率无关 |
| Tween 动画 | ❌ Phaser 按时间插值 |
| **你手写的每帧插值 / 累加** | ✅ **必须自己补偿** |

判断标准很简单:**代码里出现 `delta` 就是对的,没出现就要怀疑。**

另一个方案是锁 `fps: { target: 60, forceSetTimeOut: true }`,但那会让高刷用户
画面变糊,不推荐。

## 第 6 步:素材 —— 用最省事的办法绕开授权问题

商业提交最容易死在素材授权上。本项目的做法是**一个外部素材都不用**:

**贴图程序生成**(`BootScene.generateTextures`):

```ts
const g = this.add.graphics();
g.fillStyle(glow, 0.22);
g.fillCircle(size / 2, size / 2, radius * 2);
// ... 画三层发光
g.generateTexture(key, size, size);   // 转成贴图,之后走批渲染不掉帧
g.destroy();
```

**音效用 WebAudio 振荡器合成**(`systems/audio.ts`),不加载任何音频文件。

三个好处:

1. 零 license 风险 —— 提交包里没有任何来源不明的资源
2. 包体几乎不增加 —— 实测总共 1.16 MB,其中 1.17 MB 是 Phaser 本身
3. 正好给"响应平台静音"这件必做的事一个真实的验证目标

等你要上真素材了,**只用 [Kenney](https://kenney.nl/assets)**(CC0,打包下载,零心智负担),
并且每一个都登记进 `docs/asset-license.csv`:

```csv
date,asset_name,type,source_url,license,used_in,modified,commercial_allowed,notes
```

`commercial_allowed` 不是明确 `yes` 的,**一律不进提交包**。

---

## 第 7 步:打包与提交

```bash
npm run package
```

这条命令做四件事:跑测试 → 类型检查 → 生产构建 → 按 CrazyGames 技术要求断言 → 打 zip。

实测输出:

```
  CrazyGames 提交包检查
  ─────────────────────────────────────────────
  文件数             3 / 1500
  总体积          1.16 MB / 250.00 MB
  初始下载        1.16 MB / 50.00 MB
  移动端首页    符合 (需 <= 20.00 MB)
  相对路径      通过
  ─────────────────────────────────────────────
  体积明细(从大到小):
     1166.9 KB  assets/phaser-BUlrDfUd.js
       16.1 KB  assets/index-CjxLE5Hp.js
        1.8 KB  index.html

✓ 全部检查通过
✓ 提交包已生成  submissions/pulse-dodger.zip  (314.7 KB)
```

### 这四条硬指标从哪来的

来自 [CrazyGames 技术要求](https://docs.crazygames.com/requirements/technical/):

| 约束 | 上限 | 超了会怎样 |
| --- | --- | --- |
| 总体积 | 250 MB | 传不上去 |
| 文件数 | 1500 | 传不上去 |
| 初始下载 | 50 MB | 审核不过 |
| 移动端首页推荐位 | 20 MB | 拿不到移动端流量 |
| **只能用相对路径** | — | **上传后白屏** |

最后一条是白屏的头号原因。Vite 的 `base: './'` 解决它 —— 官方 Phaser 模板已经配好了,
**别手贱改成 `/`**。打包脚本里也加了断言,改错了本地就会 exit 1。

### zip 结构

`index.html` 必须在 zip **根目录**,不能多套一层文件夹:

```
pulse-dodger.zip
├── index.html          ← 必须在这一层
└── assets/
    ├── phaser-*.js
    └── index-*.js
```

### 提交前

逐条过 `docs/qa-checklist.md`。里面区分了"脚本已经自动查了的"和"脚本查不了但 QA 会查的",
后者包括最容易被退回的**平台静音**和**激励视频发奖逻辑**。

---

## 第 8 步:出问题时,按这个顺序查

| 现象 | 先查这里 |
| --- | --- |
| 上传后白屏 | `index.html` 里有没有绝对路径;`base` 是不是被改成了 `/` |
| `TS2339: Property 'CrazyGames' does not exist` | `crazygames.d.ts` 有没有被 tsconfig 的 `include` 覆盖到 |
| `platform() 在 initPlatform() 完成之前被调用` | `main.ts` 里两步的顺序反了 |
| 广告永远不播 | 打开控制台看有没有 `requestAd`;本地 local 模式行为和线上不同,以线上为准 |
| 激励视频白送奖励 | `adError` 分支是不是错写成了 `resolve(true)` |
| 手机上一碰就选中文字 | `index.html` 的 `user-select: none` / `touch-action: none` 被删了 |
| 不同设备速度不一样 | `update()` 里的移动忘了乘 `delta` |
| 帧率掉 | `update()` 里有没有新建对象、拼字符串、或者忘了 `destroy()` 离屏物体 |

### 怎么看日志

打开浏览器控制台,正常启动应该依次出现:

```
[platform] CrazyGames SDK v3 初始化完成
[boot] 平台 = crazygames
Phaser v3.90.0 (WebGL | Web Audio)
HTML5 SDK  GAME  Requesting game loading start
HTML5 SDK  GAME  Add settings change listener
HTML5 SDK  GAME  Requesting game loading stop
HTML5 SDK  GAME  Requesting gameplay start     ← 点开始之后
```

少了哪一条,就去对应的 Scene 里找那个平台调用。

---

## 第 9 步:做第二款时改什么

### 哪层照抄、哪层重写

这个模板是给你**参考改造**用的,不是一比一复用:

| 层 | 怎么处理 | 理由 |
| --- | --- | --- |
| `src/platform/` | **直接照抄** | 平台接入每款游戏完全一样 |
| `scripts/build-zip.mjs` | **直接照抄** | 提交要求不随游戏变 |
| `src/ui/LoadingOverlay.ts`、`game/ui/Panel.ts` | **照抄,改 theme** | 外壳的时机和结构是通用的 |
| `src/game/theme.ts` | **改内容,留结构** | 换皮的全部工作在这 |
| `scenes/{Boot,Menu,Settings,Result}` | **照抄骨架,改内容** | 流程一样 |
| `src/game/config.ts` | **重写** | 玩法数值每款不同 |
| `src/game/core/` | **重写** | 规则就是你的游戏本身 |
| `scenes/PlayScene.ts` | **重写** | 玩法循环 |

照抄的部分约占 40%,是最烦、最容易出错、最不涨知识的那 40%。

### 具体改哪三处

**1. `src/game/config.ts`** —— 换数值、换配色、换玩法常量。

**2. `src/game/core/`** —— 换规则。这是真正的"业务逻辑",新玩法主要工作量在这。
先写 `difficulty.ts` 风格的纯函数 + 测试,再接进场景。

**3. `src/game/scenes/PlayScene.ts`** —— 换玩法循环。

**完全不用动的**:整个 `src/platform/`、`scripts/build-zip.mjs`、`docs/qa-checklist.md`、
`vite/` 配置、`index.html`。这些就是你的"游戏版 FastAPI 模板"。

### 让 AI 帮你做第二款时,这样给上下文

```
主工程:使用 pulse-dodger 模板,保持 src/platform/ 原样不动。
参考源码:参考 <某个开源项目> 的玩法结构。
允许学习:输入处理、状态流转、碰撞规则、关卡数据结构、胜负判定。
禁止复制:游戏名、素材、UI、关卡数值、角色、音效、封面、文案。
输出要求:
  1. 新玩法的规则写成 src/game/core/ 下的纯函数,并配 node:test 测试
  2. CrazyGames SDK 调用只能出现在 src/platform/,PlayScene 里不许出现 window.CrazyGames
  3. 完成后必须跑通 npm run package
```

**不要**让 AI "照着某个项目改一份"。要它在你的模板里实现一个原创版本。

---

## 附:本教程验证过什么,没验证过什么

诚实标注,免得你踩到我没走过的路。

**已实测**:

- `npm install` / `npm test` / `npm run build` / `npm run package` 全链路通过
- 无头 Chrome 实跑,零运行时异常
- 真实的 CrazyGames SDK v3 在 localhost 加载并初始化成功,
  `loadingStart` / `loadingStop` / `gameplayStart` / `addSettingsChangeListener` /
  `data.getItem` 五个调用在控制台可见
- 菜单页、玩法页、暂停面板均正常渲染(1920×1080 原生分辨率截图确认)
- **单位体系实测**:`RENDER_WIDTH` 1920 → 1280 只改 1 行,布局比例完全不变
- **包体代价实测**:分辨率翻倍后 zip 316.9 KB → 317.8 KB,只涨 0.9 KB
- **能力位驱动 UI 双路径实测**:接入 SDK 时暂停面板 2 按钮 / 移除 SDK 脚本后 3 按钮 + 主页出现设置入口
- 暂停时 `gameplayStop` 正确触发(控制台确认)
- 提交包体积、文件数、相对路径三项断言通过(3 文件 / 1.16 MB / zip 316.9 KB)

**未实测**:

- **没有真正提交到 CrazyGames**,审核会不会因为别的原因退回,我不知道
- **广告没有在真实环境下播过** —— 本地是 local 模式,行为和线上不完全一致。
  `adFinished` / `adError` 的分支逻辑是按官方文档写的,但没有线上回放验证
- **云存档只在本地验证了读取路径**(`Get "pulse-dodger:best-score", returning null`),
  跨设备同步没测
- **没在真实手机上测过触屏**,只做了代码层面的适配
- **Safari 没测过**
- **暂停的真实交互没测过** —— 截图是靠代码触发的,没有真的按 ESC 或切窗口验证
- **加载遮罩没见过它显示** —— 当前零素材加载太快,300ms 阈值下永远不触发。
  逻辑是对的,但要等你加真素材才能看到实际效果
- **帧率补偿没在真实高刷显示器上验证过** —— 公式是标准的指数平滑,
  但我手头没有 144Hz 屏幕实测
- **早期用 960×540 截图做验证是个盲区** —— 那个尺寸恰好 1:1,
  永远暴露不出清晰度问题。现在改用 1920×1080 截图
