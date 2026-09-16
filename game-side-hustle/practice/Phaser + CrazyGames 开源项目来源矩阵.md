# Phaser + CrazyGames 开源项目来源矩阵

Last verified:2026-09-16 —— 本文每个仓库的 star / 最后更新 / Phaser 版本 / 构建工具
都通过 GitHub API 实拉核对过,不是凭印象写的。

**先说结论:GitHub 上不存在一个高质量的 "Phaser + TypeScript + Vite + CrazyGames SDK v3"
现成项目可以克隆。** `crazygames` topic 下带 Phaser 的仓库全部是 0–2 star 的个人作品,
CrazyGames 本身也**没有公开的 GitHub organization**(`api.github.com/orgs/CrazyGames/repos`
返回空数组),SDK 不开源、无 npm 包、无官方 TypeScript 类型。

所以这份文档给的不是"克隆哪个",而是**拼装方案**:官方骨架 + 自己掌控的适配层 + 有选择地读别人的玩法源码。

> 想直接上手,不想读选型分析 → 去 [手把手实操教程](./phaser-crazygames-手把手实操教程.md),
> 配套工程在 [`pulse-dodger/`](./pulse-dodger/),`npm install && npm run dev` 就能玩。

---

## 0. 版本轴:先定这个,否则后面全是坑

**本文档锁定 Phaser 3.90.0。** 这不是可选项,是读下面所有表格的前提。

为什么必须先锁:官方模板 `phaserjs/template-vite-ts` 现在是 **Phaser 4.0.0**,
而社区绝大多数玩法源码是 **Phaser 3.x**。两者 API 不兼容。
如果你拿 Phaser 4 的工程配 Phaser 3 的玩法参考(尤其是喂给 AI),
产出的代码编译不过,而且你会分不清是自己写错了还是版本不对。

| | Phaser 3.90.0(本文选择) | Phaser 4.2.1 |
| --- | --- | --- |
| 网上教程 / StackOverflow | 绝大多数 | 很少 |
| 开源玩法源码 | 绝大多数 | 个位数 |
| 官方模板开箱即用 | 要手动降版本 | 是 |
| 适合 | **不懂游戏、需要查资料的人** | 已经熟悉 Phaser 的人 |

选 3.90 的代价:官方模板只有 `main` 一个分支,**没有 Phaser 3 的 tag 或 branch**,
必须手动把 `package.json` 里的 `phaser` 锁到 `3.90.0` 再验证构建。
这件事 [`pulse-dodger/`](./pulse-dodger/) 已经替你做完并实测通过了。

---

## 1. 心智模型:5 类资产,不能混用

这和你熟悉的后端开发是同构的:

```text
工程底座 = FastAPI 项目模板
能力字典 = 框架 cookbook
玩法源码 = 别人的业务系统案例
平台适配 = 支付/短信/云厂商 Provider Adapter
素材供应链 = 第三方资源和版权记录
```

| 资产类型 | 后端类比 | 解决什么 | 能不能直接复用 |
| --- | --- | --- | --- |
| 工程底座 | FastAPI template | 目录、构建、Scene、资源、SDK、QA、打包 | 可以作为项目基底 |
| 能力字典 | 框架 cookbook | 某个 API 怎么写(input、physics、audio) | 只抄小片段并改写 |
| 玩法源码 | 业务系统案例 | 一个完整玩法怎么组织 | **只学结构,重写成原创** |
| 平台适配 | Provider adapter | SDK、广告、静音、存档、事件 | **必须自己抽象,别等开源项目替你接** |
| 素材供应链 | 第三方资源 + license | 图片、音效、字体、封面 | 只用明确商用授权的 |

核心判断:

```text
不要指望一个开源项目同时满足:
工程架构好 + 玩法成熟 + SDK 最新 + 素材可商用 + 能直接上 CrazyGames。
这样的项目不存在 —— 我扫过整个 crazygames topic,最高 2 star。

正确做法:
工程底座固定下来自己掌控。
玩法源码只负责启发。
SDK 接入自己抽象。
素材自己替换和记录。
```

---

## 2. 第一层:工程底座

| 项目 | star | 最后更新 | Phaser | 构建 | 推荐度 | 怎么用 |
| --- | --- | --- | --- | --- | --- | --- |
| [pulse-dodger](./pulse-dodger/) | 本地 | 2026-09-16 | **3.90.0** | Vite 6 | **S** | 直接用。已含适配层 + 打包检查 + 可玩游戏,实测通过 |
| [phaserjs/template-vite-ts](https://github.com/phaserjs/template-vite-ts) | 194 | 2026-04-21 | **4.0.0** | Vite 6 | A | 官方骨架。**要用 3.90 必须手动降版本并重验构建** |
| [phaserjs/create-game](https://github.com/phaserjs/create-game) | 71 | 2026-04-21 | 4.x | — | A | 官方 CLI:`npx create-game@latest`,同样是 Phaser 4 |
| [ourcade/phaser3-typescript-vite-template](https://github.com/ourcade/phaser3-typescript-vite-template) | 137 | **2023-01** | 3.55.2 | Vite 3 | C | TS 4.6 / Vite 3,已停更。**只读目录结构,别 clone 运行** |

底座必须补齐的能力(`pulse-dodger` 里都有了):

```text
src/platform/PlatformAdapter.ts      平台接口 + 能力位
src/platform/crazygames.d.ts         手写 SDK 类型声明 ← 最容易被遗漏
src/platform/adapters/crazygames.ts  SDK v3 实现
src/platform/adapters/web.ts         本地/自托管实现
src/game/theme.ts                    视觉/字号/间距/锚点/文案 ← 换皮只改这个
src/game/config.ts                   玩法数值 + 单位体系 ← 换玩法/换分辨率改这个
src/game/core/                       规则层(纯逻辑,可单测)
src/game/scenes/{Boot,Menu,Play,Result,Settings}Scene.ts
src/game/ui/Panel.ts                 通用弹出面板(暂停/设置/复活共用)
src/ui/LoadingOverlay.ts             DOM 层加载遮罩,带 300ms 阈值
scripts/build-zip.mjs                体积/文件数/相对路径断言 + 打 zip
docs/qa-checklist.md                 提交前逐条过
docs/asset-license.csv               素材授权记录
```

### 为什么市面模板都不带 UI 外壳

实测:官方 `template-vite-ts` 只有 5 个**空场景**(Boot/Preloader/MainMenu/Game/GameOver),
里面就一个 logo 弹跳。我扫过的社区模板**无一带暂停面板**。

这不是社区偷懒,是理性选择:**外壳的主体是美术,一旦带上具体样式就会和你的主题冲突,你还得先删。**
模板作者面对的是"懂游戏、会自己画"的开发者。

但如果你不懂游戏,这一层就是你过不去的坎。所以**你的模板完成度门槛必须比市面模板高一层**,
高出来的正好就是 UI 外壳。这也是 `pulse-dodger` 和官方模板最大的差别。

### 关键机制一:单位体系,改一个决策只改一处

整套 UI 按 **960×540 设计单位**写,和实际渲染像素解耦 —— 等价于前端的 rem:

```ts
export const RENDER_WIDTH = 1920;              // ← 改分辨率只改这一个数
export const u = (n: number) => Math.round(n * RENDER_WIDTH / 960);
```

配合 `theme.ts` 里的三套刻度(字号 / 间距 / **纵向锚点按画布高度比例**),
布局代码里不出现任何裸数字。

**实测**:`RENDER_WIDTH` 1920 → 1280 只改 1 行,布局比例完全不变。
包体从 316.9 KB 涨到 317.8 KB,**只多 0.9 KB**(贴图是运行时生成的)。

没有这套体系的代价很具体:我最初把画布设成 960×540,在 27 寸显示器全屏时
被浏览器放大 2.67 倍,画面明显发糊;想改分辨率要动 17 处硬编码坐标。

### 关键机制二:UI 由平台能力决定

```ts
platformProvidesAudioToggle: boolean;   // CrazyGames 外框已有喇叭按钮
platformProvidesLoadingUI: boolean;     // CrazyGames 外框已有 loading 动画
```

同一份代码的实测差异:

```
CrazyGames 路径:暂停面板 2 按钮,主页无设置入口(平台已提供静音)
自托管路径:    暂停面板 3 按钮,主页有设置入口
```

不需要发行前手动改代码。这是"平台已提供的别重做"原则的落地。

---

## 3. 第二层:能力字典

遇到具体问题时查怎么写,不是完整项目。类似你查 FastAPI dependency、SQLAlchemy session。

| 项目 | star | 最后更新 | 重点看什么 | 推荐度 |
| --- | --- | --- | --- | --- |
| [phaserjs/examples](https://github.com/phaserjs/examples) | 1661 | 2026-08-24 | input、physics、particles、audio、camera、tilemap | S |
| [phaserjs/phaser](https://github.com/phaserjs/phaser) | 40.3k | 2026-08-21 | **直接读 `node_modules/phaser/src/` 源码** | S |
| [docs.phaser.io](https://docs.phaser.io/) | — | — | API、概念、对象生命周期 | S |
| [digitsensitive/phaser3-typescript](https://github.com/digitsensitive/phaser3-typescript) | 1034 | 2026-05-28 | 大量 Phaser 3 + TS 小游戏 | A |
| [ourcade/phaser3-typescript-examples](https://github.com/ourcade/phaser3-typescript-examples) | 23 | **2020-09** | — | **不推荐** |

**读源码比读文档管用。** 本次实操中就遇到一次:不确定 `Arc.radius` 能不能被 tween 驱动,
直接 `grep -n "radius" node_modules/phaser/src/gameobjects/shape/arc/Arc.js`,
两秒看到它是带 `updateData()` 的 getter/setter —— 能驱动,问题解决。

使用规则:

```text
每天只查一个具体问题:拖拽怎么写、碰撞怎么写、倒计时怎么写。
examples 里的**素材不可商用**,代码可以参考,图片音效绝不能带进提交包。
```

`digitsensitive/phaser3-typescript` 是 monorepo,**根目录 `package.json` 没有依赖**,
每个子游戏要单独进目录安装。别在根目录 `npm install` 然后以为坏了。

---

## 4. 第三层:玩法源码

学的是"业务结构",不是复制业务内容。

**先看这张表的最后两列再决定要不要点进去:**

| 项目 | star | 最后更新 | Phaser | 构建 | 学什么 | 推荐度 |
| --- | --- | --- | --- | --- | --- | --- |
| [digitsensitive/phaser3-typescript](https://github.com/digitsensitive/phaser3-typescript) | 1034 | 2026-05 | 3.x | 各子项目独立 | arcade / avoider / shooter 最小循环 | **A** |
| [ganlvtech/phaser-catch-the-cat](https://github.com/ganlvtech/phaser-catch-the-cat) | 755 | 2022-12 | 3.16.1 | webpack 4 | 六边形网格、围堵、简单 AI | B(只读源码) |
| [ourcade/phaser3-dungeon-crawler-starter](https://github.com/ourcade/phaser3-dungeon-crawler-starter) | 120 | 2022-06 | 3.22 | parcel | tilemap、对象池、场景组织 | C(只读源码) |
| [remarkablegames/phaser-platformer](https://github.com/remarkablegames/phaser-platformer) | 5 | 2026-09-14 | **4.2.1** | Vite 8 | 平台跳跃 —— **但它是 Phaser 4,与本文版本轴冲突** | C |
| [ourcade/phaser3-sokoban-template](https://github.com/ourcade/phaser3-sokoban-template) | 9 | 2023-01 | 3.22 | parcel | 网格、推箱子、关卡完成 | C(只读源码) |
| [ourcade/asteroids-template-phaser](https://github.com/ourcade/asteroids-template-phaser) | 6 | 2024-04 | 3.22 | parcel | 射击最小循环 | C(只读源码) |
| [ourcade/phaser3-breakout-matterjs-starter](https://github.com/ourcade/phaser3-breakout-matterjs-starter) | 7 | 2023-01 | 3.23 | parcel | MatterJS 反弹物理 | C(只读源码) |

**「只读源码」是什么意思**:在 GitHub 网页上读,不要 `git clone` + `npm install`。
这些仓库用的是 TypeScript 3.8(2020 年 2 月发布)和 parcel/webpack 老构建链,
在 Node 20+ 上装依赖大概率失败。你是来学玩法结构的,不是来修别人 2022 年的构建的。

**这张表和"筛选标准"那一节必须一致。** 之前的版本里给 9 star、2023 年停更的仓库标了 A,
同时筛选标准写着"几年没维护的谨慎选" —— 自相矛盾。现在按硬数据降级了。

### 复刻原则

```text
可以学:
  游戏循环 / 状态切换 / 输入处理 / 碰撞规则 / 关卡数据结构 / HUD 布局思路

必须重做:
  游戏名 / 题材 / 角色 / 背景 / 关卡数值 / UI 文案 / 配色 / 音效 / 封面
```

---

## 5. 第四层:CrazyGames 平台适配(自己掌控)

| 资料 | 链接 | 作用 |
| --- | --- | --- |
| SDK intro | https://docs.crazygames.com/sdk/intro/ | v3 安装、初始化 |
| game 模块 | https://docs.crazygames.com/sdk/game/ | loading / gameplay / happytime / settings / 进度 |
| video ads | https://docs.crazygames.com/sdk/video-ads/ | midgame、rewarded、**回调式 API** |
| banners | https://docs.crazygames.com/sdk/banners/ | requestResponsiveBanner / clearAllBanners |
| data | https://docs.crazygames.com/sdk/data/ | 云存档,**同步 API,形状同 localStorage** |
| user | https://docs.crazygames.com/sdk/user/ | 账号、token、auth listener |
| 技术要求 | https://docs.crazygames.com/requirements/technical/ | 包体、文件数、相对路径 |

### 接口(已按官方文档逐条核对)

之前版本的接口只有 7 个方法,漏掉了会被 QA 退回的静音和赚钱的 banner/云存档。
下面是 `pulse-dodger` 里实际在用的版本:

```ts
export interface PlatformAdapter {
  readonly name: string;
  readonly capabilities: PlatformCapabilities;   // 不支持的能力显式暴露,让 UI 藏按钮
  init(): Promise<void>;

  // 生命周期 —— 平台靠这些判断"玩家是不是真在玩",直接影响推荐权重
  loadingStart(): void;
  loadingStop(): void;
  gameplayStart(): void;
  gameplayStop(): void;
  happyTime(): void;
  reportProgress(percentage: number): void;

  // 广告
  showInterstitial(reason: string): Promise<void>;
  showRewarded(reason: string): Promise<boolean>;   // ← 返回值就是"发不发奖"
  showBanner(containerId: string): Promise<void>;
  clearBanners(): void;

  // 存档 —— **同步**,因为 SDK 的 data 模块本来就是同步的,别包 Promise
  save(key: string, value: string): void;
  load(key: string): string | null;

  // 平台设置 —— 不接 muteAudio,QA 会退回
  getSettings(): PlatformSettings;
  onSettingsChange(handler: (settings: PlatformSettings) => void): void;
}
```

### 三个必须知道的事实

**1. SDK 只能用 `<script>` 标签引入,并且要手写类型声明。**
没有 npm 包,没有 `@types`。不写 `.d.ts`,第一行 SDK 调用就 `TS2339` 编译失败。

**2. `requestAd` 是回调式的,不是 Promise。**
`adError` 在"播放失败"和"没有广告库存"两种情况下都会触发。
对 rewarded 来说这两种都是**没看完 → 不发奖**。写反了要么白送奖励,要么该发不发。

**3. `window.CrazyGames` 在 localhost 上也存在。**
SDK 脚本会进入 local 模式,控制台带 `(local)` 后缀。
所以本地开发时生效的是 `CrazyGamesAdapter` 而不是 `WebAdapter` —— 这一点很反直觉,
很多人以为本地一定走 fallback。

```text
游戏核心不知道 CrazyGames。
游戏核心只知道 PlatformAdapter。
换 Poki / itch.io / GameDistribution,只换 adapter,玩法一行不动。
```

---

## 6. 第五层:素材供应链

**第一款建议:一个外部素材都不用。**

`pulse-dodger` 的做法是贴图用 `Graphics.generateTexture` 程序生成,
音效用 WebAudio 振荡器合成。零 license 风险,包体几乎不增加(实测 1.16 MB,
其中 1.17 MB 是 Phaser 本身),而且正好给"响应平台静音"一个真实的验证目标。

要上真素材时:

| 资料 | 链接 | 什么时候用 |
| --- | --- | --- |
| Kenney Assets | https://kenney.nl/assets | **第一款唯一推荐**。CC0,打包下载,零心智负担 |
| Tiled | https://www.mapeditor.org/ | 需要 tilemap 关卡时 |
| OpenGameArt | https://opengameart.org/ | 第二款之后。license 很杂,逐个确认 |
| Freesound | https://freesound.org/ | 第二款之后。逐个确认 license |

> 上一版本里的 Poly Haven(3D HDRI/纹理)和 Blender 已移除。
> 对一款 2D Phaser 首发游戏贡献为 0,但学习成本很高 —— 和"不想从 0 学习"直接冲突。
> 等你做 Three.js 项目时再回来找它们。

记录模板(`docs/asset-license.csv`):

```csv
date,asset_name,type,source_url,license,used_in,modified,commercial_allowed,notes
```

`commercial_allowed` 不是明确 `yes` 的,**一律不进提交包**。

---

## 7. CrazyGames 技术硬指标

不是名词,是数字。来自[官方技术要求](https://docs.crazygames.com/requirements/technical/),
`pulse-dodger/scripts/build-zip.mjs` 里已经写成断言,超标直接 exit 1。

| 约束 | 上限 | 超了会怎样 |
| --- | --- | --- |
| 总体积 | 250 MB | 传不上去 |
| 文件数 | 1500 | 传不上去 |
| 初始下载 | 50 MB | 审核不过 |
| 移动端首页推荐位 | 20 MB | 拿不到移动端流量 |
| **只能用相对路径** | — | **上传后白屏(头号原因)** |
| zip 结构 | `index.html` 在根目录 | 多套一层文件夹会被退回 |

Vite 的 `base: './'` 解决相对路径问题,官方 Phaser 模板已经配好,别改成 `/`。

---

## 8. 筛选开源项目的标准

**这一节的标准必须和上面的推荐度一致。** 每加一个项目,先按这三条打分再定推荐度。

优先选:

```text
最后更新在 1 年以内。
Phaser 版本与你锁定的版本轴一致(本文是 3.90)。
构建工具是 Vite(不是 parcel / webpack 4)。
TypeScript,或结构清晰的 JavaScript。
license 明确。
玩法小而完整,有在线 demo 或截图。
```

只读源码,不要 clone:

```text
2 年以上没更新。
TypeScript 3.x / parcel / webpack 4 这类老构建链。
star 低于 30 且无文档。
```

不要碰:

```text
没有 license。
明显 clone 商业游戏。
素材来源不明。
强依赖后端、账号、多人、付费服务。
```

---

## 9. 让 AI 使用这些项目的正确姿势

不要说"照着这个项目改一份"。要这样给上下文:

```text
主工程:使用 pulse-dodger 模板(Phaser 3.90 + TS + Vite),保持 src/platform/ 原样不动。

参考源码:参考 <某个开源项目> 的玩法结构。注意它是 Phaser 3.x,与主工程版本一致。

允许学习:输入处理、状态流转、碰撞规则、关卡数据结构、胜负判定。

禁止复制:游戏名、素材、UI、关卡数值、角色、音效、封面、文案。

输出要求:
  1. 新玩法规则写成 src/game/core/ 下的纯函数,并配 node:test 测试
  2. CrazyGames SDK 调用只能出现在 src/platform/,PlayScene 里不许出现 window.CrazyGames
  3. 完成后必须跑通 npm run package(会自动断言体积和相对路径)
```

**一次只喂一个玩法源码。** 一次喂 20 个项目链接,AI 会把不同版本、不同架构的代码混在一起。

---

## 10. 结论

你要找的不是"一个完美开源游戏",而是一套组合:

```text
锁定的 Phaser 版本轴(3.90)
+ 一个实测能跑的工程底座(pulse-dodger)
+ 官方能力字典(examples / 源码 / docs)
+ 有选择地读的玩法源码(注意版本和维护状态)
+ 自己掌控的平台适配层
+ 零风险素材起步(程序生成 → Kenney)
```

好处:

```text
不用从 0 设计工程。
不用从 0 发明玩法结构。
不会被旧 SDK 或旧项目锁死。
AI 可以专注实现玩法,而不是反复搭基础设施。
每一款都能沉淀成下一款的模板资产。
```

## 11. 参考这个模板时,哪层照抄、哪层重写

它是给你**参考改造**的,不是一比一复用:

| 层 | 怎么处理 | 复用率 |
| --- | --- | --- |
| `src/platform/` | 直接照抄 | ~90% |
| `scripts/build-zip.mjs` | 直接照抄 | ~95% |
| `src/ui/`、`game/ui/Panel.ts` | 照抄,改 theme | ~80% |
| `game/theme.ts` | 改内容,留结构 | 结构 100%,内容 0% |
| `scenes/{Boot,Menu,Settings,Result}` | 照抄骨架,改内容 | ~70% |
| `game/config.ts` | 重写 | 0% |
| `game/core/` | 重写 | 0% |
| `scenes/PlayScene.ts` | 重写 | 0% |

**照抄的约占 40%,而且正好是最烦、最容易出错、最不涨知识的那 40%。**
剩下 60% 是你的游戏本身 —— 那部分本来就该每款都不一样,不是模板的失败。

## 12. CrazyGames 的尺寸与帧率要求(容易漏)

[官方玩法要求](https://docs.crazygames.com/requirements/gameplay/)里两条硬指标:

**① 尺寸** —— 平台列出了实际 iframe 尺寸,**全部 16:9**:

```
桌面非全屏   907×510 / 1216×684 / 1077×606 / 821×462
桌面全屏     1366×768 / 1920×1080 / 1536×864 / 1280×720
移动/平板    800×450 / 1080×607
```

要求只有一句:"Text and images must be legible on devices with `devicePixelRatio:1`"。
缩放方案不规定,自己选。`pulse-dodger` 用 `Scale.FIT` + 1920×1080 基底 ——
正好是最大 iframe,平台内永远只会缩小不会放大。

**② 帧率** —— "physics must perform consistently across different monitor
refresh rates (e.g. 144 Hz, 165 Hz)"。

Phaser 的 `update()` 跟着刷新率跑,所以每帧固定比例的插值在 144Hz 上会快 2.4 倍。
凡是你手写的每帧插值都要做 delta 补偿;Arcade 物理的 velocity 和 Tween 不用管。

**判断标准:代码里出现 `delta` 就是对的,没出现就要怀疑。**

**下一步** → [手把手实操教程](./phaser-crazygames-手把手实操教程.md)
