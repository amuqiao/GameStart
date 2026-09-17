# Pulse Dodger

一款用 **Phaser 3.90 + TypeScript + Vite** 写的、接入了 **CrazyGames HTML5 SDK v3**
的原创小游戏。

**这不是一个模板,不建议整个目录复制粘贴去开新项目。** 它是一份参考:如果你和作者一样是后端
背景、不熟悉游戏开发,以后要做新游戏时,来读这个仓库、看它在每一层做了什么判断——
哪层的判断可以直接搬(比如平台适配层怎么和游戏解耦),哪层你必须自己重新想一遍
(比如玩法数值、场景循环)。判断能复用,代码本身不一定能。

零外部素材:所有贴图在 `BootScene` 里用 `Graphics.generateTexture` 程序生成,
所有音效用 WebAudio 振荡器合成。因此提交包里**不存在任何来源不明的资源**。

```
提交包实测(npm run portal:upload):3 个文件 / dist 1.19 MB / portal-upload 1.19 MB / zip 326.1 KB
CrazyGames 上限:1500 个文件 / 250 MB / 初始下载 50 MB
移动端首页推荐位门槛(20 MB):通过
```

## 玩法

鼠标或手指移动控制发光球。躲开红色碎片,吃蓝色能量点充能。
充满后点击或按空格释放冲击波清场,一次清掉 4 个以上会触发平台的 `happytime` 信号。
Basic Launch 提交版禁用广告,被碎片碰到就结束。Full Launch 再恢复广告能力时,可以重新打开
一次"看广告复活"的机会。

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
| `npm run test` | 跑 `tests/**` 下的单元测试(`node --test`,不需要浏览器) |
| `npm run check:boundaries` | 只跑依赖边界检查(见下文「五道门」第一道) |
| `npm run build` | 依次跑边界检查 → 单元测试 → 类型检查 → 生产构建到 `dist/`,任何一步失败都会中止 |
| `npm run preview` | 本地预览 `dist/` 的构建产物 |
| `npm run package` | `build` 之后再按 CrazyGames 技术要求断言体积/文件数/结构,并打出离线归档 zip |
| `npm run portal:upload` | 跑完整检查,再生成 CrazyGames 当前上传区可直接拖拽的 `submissions/portal-upload/` |
| `npm run check:size` | 只跑体积/文件数/相对路径检查,不重新构建、不打包 |

## 目录里装的是什么

详细的"我想搞懂 X,该按什么顺序读哪几个文件"交给 [`docs/reading-paths.md`](./docs/reading-paths.md)。
这里只说每个目录**装什么**——不需要读过这个项目也能看懂:

```
src/main.ts              浏览器入口,不 import phaser
src/dom/                 用真实 DOM 做的、活在 Phaser 画布之外的界面(比如加载遮罩)
src/platform/            把发行平台的 SDK 包成本工程自己的接口,游戏代码不直接碰平台全局对象
src/game/
  main.ts                createGame():创建 Phaser 实例
  viewport.ts            画布尺寸 + 设计单位换算 u()
  tuning.ts              玩法数值(所有要调的数)
  keys.ts                字符串常量的唯一出处(存档 key、DOM id、贴图 key)
  theme.ts               视觉 token(颜色/字号/间距/锚点)+ 文案
  composition.ts         接口到实现的接线(composition root)
  core/                  游戏规则本身,纯 TS,不 import 引擎,可被 node --test 直接跑
  scenes/                Phaser 场景 + 场景间怎么跳、跳时传什么
  objects/               游戏世界里的一类东西:创建、每帧更新、回收都在一个文件里
  effects/               只改变玩家感官、不改变游戏规则的东西:粒子、震屏、音效
  hud/                    游戏进行中把玩家状态显示出来的东西,只读不写
  ui/                    和玩法无关、搬到任何游戏都能用的界面控件
  overlays/              盖住画面、暂时接管输入、结束后交还控制权的模态流程
scripts/
  check-boundaries.mjs   依赖边界断言(见下文)
  build-zip.mjs          提交包体积/路径/结构断言与离线 zip 归档
  prepare-portal-upload.mjs
                         生成 Portal 可拖拽上传目录
```

关于目录命名多说一句:这套名字(`objects/` `effects/` `hud/` `overlays/`)是从社区惯例来的,
不是自创。之前用过 `shell/`、`infra/` 这两个名字,调研了 26 个 TypeScript Phaser 仓库,
两个都是 **0 命中**;`systems/` 命中 1 次,且强指向 ECS 架构(而本项目明确不用 ECS)。
用自创名的代价是读者得先读你的文档才知道那个词是什么意思——改成社区惯例,是为了让人
一眼看懂,不用先理解这个项目自己的黑话。

## 五道门

约束不写在会过期的文档里,写在会 `exit 1` 的地方。`npm run package` 依次跑:

```
check:boundaries → test → tsc --noEmit → vite build → build-zip 断言
```

任何一道红了都出不了包。第一道 `check:boundaries` 输出的就是一张依赖表
(`scripts/check-boundaries.mjs`),四条规则,每条教一个不同的判断,不追求覆盖率:

```
✓ 只有 src/game/** 可以 import phaser
    引擎依赖是有边界的:dom/ 和 platform/ 换引擎时不用动
✓ core/ 只依赖 core/ 自身和 tuning
    规则层为什么能用 node --test 直接跑,不需要浏览器和引擎
✓ effects/ 不许 import core/
    依赖是单向的:表现可以被规则驱动,规则不知道表现存在
✓ platform/ 不许 import game/
    平台适配层既不知道引擎也不知道游戏,所以能整块搬到别的项目
```

这个脚本自己也修过一个 bug,值得记一笔:原来目录不存在时是
`readdir(dir).catch(() => [])`,后果是规则点名的目录一旦被删掉或改名,
会扫到 0 个文件、打一个 ✓、`exit 0`——**护栏瞎了,但它报告自己很健康**。
现在改成目录不存在直接 `exit 1`。门禁的第一要务是能发现自己失效,
而不是"看起来一直是绿的"。

## 单位与数值怎么分层

```ts
// viewport.ts —— 改分辨率只改这一个数
export const RENDER_WIDTH = 1920;
export const UI_SCALE = RENDER_WIDTH / DESIGN_WIDTH; // DESIGN_WIDTH = 960
export const u = (designUnits: number) => Math.round(designUnits * UI_SCALE);
```

空间类数值全部写成 `u(设计单位)`:`radius: u(14)`、`keyboardSpeed: u(420)`,
字号 `` `${u(62)}px` ``。非空间类(分数、毫秒、阈值)是纯数字,不过 `u()`——
过了的话换分辨率会把游戏平衡一起改掉。

选 1920 的理由:这正好是 CrazyGames 列出的最大 iframe 尺寸(桌面全屏 1920×1080),
意味着在平台内永远不会被放大,只会被缩小——位图放大会糊,缩小不会。

三个文件职责分开,是这个项目最值得借鉴的一处分层判断:

```
src/game/tuning.ts   玩法数值(速度、分数、充能量……)   → 决定"游戏是什么"
src/game/theme.ts    颜色/字号/间距/锚点/文案          → 决定"游戏长什么样"
src/game/viewport.ts 画布尺寸 + 设计单位换算            → 决定"多少像素等于多少设计单位"
```

`theme.ts` 里有三套刻度,布局代码不许出现裸数字:`font`(字号)、`space`(间距)、
`anchor`(纵向锚点,**写成画布高度的比例**,不是绝对像素——这是"改分辨率只改一个数"
能成立的关键,也让几个页面的标题、主按钮、页脚自动对齐在同一高度上)。

## 五条不能破的规矩

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
this.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
  this.scene.game.events.off(Phaser.Core.Events.BLUR, onBlur);
});
```

后端里请求结束一切自动回收,游戏里没这个保障。不解绑的话再次进入该场景会重复注册,
失焦一次弹出多个面板。这是 Phaser 新手最常见的内存/行为 bug。

**5. 激励视频的返回值就是"发不发奖"。**

`adFinished` → `true` 发奖;`adError`(中途关闭 / 没有库存 / 播放出错)→ `false` 不发奖。
把 `adError` 当成功会白送奖励,漏掉 `adFinished` 会该发不发。这是整个适配层最容易写错的一行。

## 深入阅读

- [`docs/decisions.md`](./docs/decisions.md) —— 决策记录:每条写清"选了什么 / 放弃了什么 /
  什么情况下你该选另一个"
- [`docs/reading-paths.md`](./docs/reading-paths.md) —— 阅读路径:"你想搞懂 X →
  按这个顺序读这几个文件"
- [`docs/qa-checklist.md`](./docs/qa-checklist.md) —— 提交前 QA 清单
- [`docs/submission-ready-checklist.md`](./docs/submission-ready-checklist.md) —— 本次 CrazyGames 提交前收口清单
- [`docs/submission-log.csv`](./docs/submission-log.csv) —— 打包、材料、Portal Preview、提交状态记录

## 诚实的边界

这个项目**没有**提交过 CrazyGames 开发者后台,**没有**在 144Hz 屏幕或 Chromebook
上测过,**没有**经过多人试玩。2026-09-17 已有一次用户真机试玩反馈:"玩了一下,
没啥大问题"。文档里写的那些平台要求(帧率一致性、静音联动、低配设备性能)是照着
CrazyGames 的公开技术文档去做的,但 Portal Preview、真实 CrazyGames iframe、
Chromebook 和平台 QA 还没有验证过。把这个项目当参考的时候,请把"这里做了什么判断"
和"这个判断已经被验证过"分开看。
