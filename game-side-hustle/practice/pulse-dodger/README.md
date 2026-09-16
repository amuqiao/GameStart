# Pulse Dodger

一个跑得起来的 **Phaser 3.90 + TypeScript + Vite + CrazyGames HTML5 SDK v3** 工程模板,
附带一款完整可玩的原创小游戏。

零外部素材:所有贴图在 `BootScene` 里用 `Graphics.generateTexture` 程序生成,
所有音效用 WebAudio 振荡器合成。因此提交包里**不存在任何来源不明的资源**。

```
提交包实测:3 个文件 / 1.17 MB / zip 317.8 KB
CrazyGames 上限:1500 个文件 / 250 MB / 初始下载 50 MB
移动端首页推荐位门槛(20 MB):通过
```

## UI 外壳(这是模板最值得参考的部分)

大多数 Phaser 模板只给你空场景,外壳要自己画。这里做完了,而且**逻辑和皮肤是分开的**:

| 外壳 | 触发方式 | 平台相关性 |
| --- | --- | --- |
| 加载遮罩 | 自动,**加载超过 300ms 才显示** | 平台自带 loading 时不画 |
| 主页 | 启动后 | — |
| 暂停面板 | ESC / 右上角按钮 / **窗口失焦自动触发** | — |
| 设置页 | 主页按钮,**没有可设项时入口都不出现** | 平台自带静音时少一行 |
| 结算页 | 死亡后 | 插屏广告打在这里 |

**关键机制:UI 由平台能力决定,不是写死的。** 同一份代码在 CrazyGames 上暂停面板是 2 个按钮
(外框已有静音),在自托管环境是 3 个(多一个音效开关),不需要发行前手动改代码。

## 玩法

鼠标或手指移动控制发光球。躲开红色碎片,吃蓝色能量点充能。
充满后点击或按空格释放冲击波清场,一次清掉 4 个以上会触发平台的 `happytime` 信号。
被碎片碰到就结束,每局有一次"看广告复活"的机会。

## 跑起来

```bash
npm install
npm run dev        # → http://localhost:8080
```

## 命令

| 命令 | 作用 |
| --- | --- |
| `npm run dev` | 开发服务器,改代码即时热更新 |
| `npm run typecheck` | 只做类型检查,不产出文件 |
| `npm run build` | 类型检查 + 生产构建到 `dist/` |
| `npm run preview` | 本地预览 `dist/` 的构建产物 |
| `npm run package` | 构建 + 按 CrazyGames 技术要求断言 + 打出提交用 zip |
| `npm run check:size` | 只跑体积/文件数/相对路径检查,不打包 |

## 单位体系:改一个决策只改一处

整套 UI 按 **960×540 设计单位**写,和实际渲染多少像素解耦。等价于前端的 rem。

```ts
// config.ts —— 改分辨率只改这一个数
export const RENDER_WIDTH = 1920;
export const UI_SCALE = RENDER_WIDTH / 960;
export const u = (designUnits: number) => Math.round(designUnits * UI_SCALE);
```

空间类数值全部写成 `u(设计单位)`:`radius: u(14)`、`keyboardSpeed: u(420)`、
字号 `` `${u(62)}px` ``。非空间类(分数、毫秒、阈值)是纯数字,不过 `u()`。

**实测验证过**:把 `RENDER_WIDTH` 从 1920 改成 1280,只改 1 行,
布局比例完全不变,只是渲染分辨率变了。

为什么选 1920:这正好是 CrazyGames 列出的最大 iframe 尺寸(桌面全屏 1920×1080),
意味着在平台内永远不会被放大,只会被缩小 —— 位图放大会糊,缩小不会。
某款游戏粒子太重扛不住,把这里调回 960 即可,其余代码一行不动。

## 换皮怎么换

两个文件,职责严格分开:

```
src/game/config.ts   玩法数值 + 单位体系   → 换玩法 / 换分辨率时改
src/game/theme.ts    视觉与文案            → 换皮时改
```

`theme.ts` 里有三套刻度,布局代码**不许出现裸数字**:

```ts
font:   { title, heading, score, hudScore, button, body, small }   // type scale
space:  { xs, sm, md, lg, xl }                                     // spacing scale
anchor: { heading, title, lead, meta, action, subAction, footer }  // 纵向锚点,**写成画布高度的比例**
```

`anchor` 是比例而不是绝对像素 —— 这是"改分辨率只改一个数"成立的关键,
也让几个页面的标题、主按钮、页脚自动对齐在同一高度上。

换个主题只动 `theme.ts`:改 `entity` 四个颜色 + `copy` 里的文案,
整套 UI 外壳(面板、按钮、HUD、加载条)自动跟着变,一行布局代码都不用碰。

## 目录

```
src/
  main.ts                      启动入口。先 initPlatform 再 new Phaser.Game,顺序不能反
  game/
    config.ts                  所有可调数值集中在这里
    core/
      GameState.ts             一局游戏的规则与存档,不引用任何 Phaser 对象
      difficulty.ts            难度曲线,纯函数,可单测
    scenes/
      BootScene.ts             生成贴图 + 发 loading 信号
      MenuScene.ts             标题页
      PlayScene.ts             主玩法
      ResultScene.ts           结算页 + 插屏广告节奏
      SettingsScene.ts         设置页,内容由平台能力决定
    systems/audio.ts           WebAudio 合成音效。三源静音:平台/玩家/广告
    ui/Hud.ts                  分数与充能条
    ui/Panel.ts                通用弹出面板(暂停/设置/复活共用)
    theme.ts                   颜色/字号/间距/锚点/文案 ← 换皮只改这个
  ui/LoadingOverlay.ts         DOM 层加载遮罩,带 300ms 阈值
  platform/
    PlatformAdapter.ts         平台接口。游戏核心只认这个
    crazygames.d.ts            手写的 SDK v3 类型声明(官方没有 @types)
    adapters/
      crazygames.ts            SDK v3 实现
      web.ts                   本地/自托管实现
    index.ts                   启动时一次性选定平台
scripts/build-zip.mjs          提交包检查 + 打包
docs/
  qa-checklist.md              提交前逐条过一遍
  asset-license.csv            素材来源与授权记录
```

## 参考这个模板时,哪层照抄、哪层重写

这个模板是给你**参考改造**用的,不是一比一复用。按这个来:

| 层 | 怎么处理 | 理由 |
| --- | --- | --- |
| `src/platform/` | **直接照抄** | 平台接入逻辑每款游戏完全一样 |
| `scripts/build-zip.mjs` | **直接照抄** | 提交要求不随游戏变 |
| `src/ui/LoadingOverlay.ts`、`game/ui/Panel.ts` | **照抄,改 theme** | 外壳的时机和结构是通用的 |
| `src/game/theme.ts` | **改内容,留结构** | 换皮的全部工作在这 |
| `src/game/scenes/{Boot,Menu,Settings,Result}` | **照抄骨架,改内容** | 流程一样,文案和布局按需调 |
| `src/game/config.ts` | **重写** | 玩法数值每款不同 |
| `src/game/core/` | **重写** | 规则就是你的游戏本身 |
| `src/game/scenes/PlayScene.ts` | **重写** | 玩法循环 |

照抄的部分约占 40%,是最烦、最容易出错、最不涨知识的那 40%。

## 三条不能破的规矩

**1. 游戏核心永远不许碰 `window.CrazyGames`。**

```ts
// 错
window.CrazyGames.SDK.ad.requestAd('rewarded', { ... });
// 对
const rewarded = await platform().showRewarded('revive');
```

换平台时只改 `src/platform/adapters/`,玩法一行不动。

**2. SDK 必须留在 `index.html` 的 `<script>` 里,不许 import 进 bundle。**

CrazyGames 没有 npm 包、没有官方类型声明,SDK 只能作为运行时全局变量存在。
类型靠 `src/platform/crazygames.d.ts` 手写补上。

**3. 所有运动必须做帧率补偿。**

CrazyGames 明文要求 "physics must perform consistently across different monitor
refresh rates (e.g. 144 Hz, 165 Hz)"。Phaser 跟着显示器刷新率跑 `update()`,
所以每帧固定比例的插值在 144Hz 上会快 2.4 倍:

```ts
// 错:每帧 18%,刷新率越高跟随越快
Phaser.Math.Linear(this.player.x, world.x, PLAYER.followLerp);

// 对:换算成"每 16.667ms 18%",任何刷新率手感一致
const t = 1 - Math.pow(1 - PLAYER.followLerp, delta / FRAME_MS_60);
Phaser.Math.Linear(this.player.x, world.x, t);
```

Arcade 物理的 velocity 由 Phaser 自己做 delta 修正,不用管;
但凡是你手写的每帧插值、累加,都要自己补偿。

**4. 场景切走时必须解绑自己注册的全局监听。**

```ts
this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
  this.game.events.off(Phaser.Core.Events.BLUR, onBlur);
});
```

后端里请求结束一切自动回收,游戏里没这个保障。不解绑的话再次进入该场景会重复注册,
失焦一次弹出多个面板。这是 Phaser 新手最常见的内存/行为 bug。

**5. 激励视频的返回值就是"发不发奖"。**

`adFinished` → `true` 发奖;`adError`(中途关闭 / 没有库存 / 播放出错)→ `false` 不发奖。
把 `adError` 当成功会白送奖励,漏掉 `adFinished` 会该发不发。这是整个适配层最容易写错的一行。

## 提交到 CrazyGames

```bash
npm run package        # → submissions/pulse-dodger.zip
```

然后过一遍 `docs/qa-checklist.md`,再上传到 CrazyGames 开发者后台。
