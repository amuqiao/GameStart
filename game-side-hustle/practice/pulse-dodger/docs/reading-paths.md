# 阅读路径

`README.md` 里原本有一张目录树,那是**空间组织**——回答"东西在哪"。这份文档是**时间组织**——回答"按什么顺序读,才能看懂这个项目为什么长这样"。

用法:下面 6 条主路径 + 2 条补充路径,各自独立,不需要按顺序读完,挑你现在关心的问题对应的那一条。每条路径给出:文件顺序、每个文件该看什么、大致耗时、读完能回答的问题。每条路径末尾标了对应 `docs/decisions.md` 里的决策编号——两份文档互相咬合,这份负责"从哪开始读、按什么顺序读",`decisions.md` 负责"每个判断为什么这么定、你什么时候该反过来选"。

**先读这条提醒**:代码里如果出现"本批任务"“主 agent”“另一个 agent 正在改”这类字眼,那是这个项目在重构过程中留下的协作期残留,不是设计理由,直接跳过——真正的决策理由永远在 `docs/decisions.md` 里,如果两边对不上,以 `decisions.md` 的 G 节矛盾清单为准。

---

## 路径 1 · 一个网页游戏怎么从零跑起来(约 25 分钟,6 个文件)

| 序 | 文件 | 看什么 | 时长 |
|---|---|---|---|
| 1 | `index.html`(全读,约 60 行) | SDK 的 `<script>` 标签为什么在这里、不在 bundle 里;触屏相关的三件 CSS(`user-select`/`touch-callout`/`touch-action`);`#game-root`/`#loading-overlay`/`#banner-bottom` 三个 DOM 挂载点;最后一行 `<script type="module" src="./src/main.ts">` 才是真正的 JS 入口 | 4 min |
| 2 | `src/main.ts`(全读,约 40 行) | 顺序就是全部内容:`await initPlatform()` → 建 `LoadingOverlay`(参数来自平台能力位)→ `createGame()` → 监听 `'boot-complete'`/`'boot-progress'`。重点看顶部注释里"启动顺序不能反"的原因,以及为什么不能用 `Phaser.Core.Events.READY` | 5 min |
| 3 | `src/platform/index.ts`(全读,约 30 行) | 只看两个函数:`initPlatform()` 怎么探测环境并选定 adapter、`platform()` 为什么在未初始化时直接抛错 | 3 min |
| 4 | `src/game/scenes/BootScene.ts` | `preload()` 里 `platform().loadingStart()` 和转发进度;`create()` 里 `generateTextures()` → `audio.bindPlatformSettings()` → `platform().loadingStop()` → `scene.start(Menu)` → `emit('boot-complete')`。**注意 `generateTextures()` 是"预热"不是"加载"**,后端类比是应用启动时的 lifespan/startup | 5 min |
| 5 | `src/game/scenes/MenuScene.ts` 只读 `create()` 和 `createActionGroup()` | 一个场景的装配长什么样:背景 → 身份组 → 图例 → 状态卡 → 操作组 → 页脚;开始按钮的 `onClick` 里 `audio.unlock()` + `platform().clearBanners()` + `fadeToScene` 三件事的顺序 | 4 min |
| 6 | `src/game/scenes/transition.ts` 只读 `fadeToScene()` | 场景之间怎么切;为什么切之前先 `scene.input.enabled = false` | 4 min |

**读完能回答**:
- 从浏览器打开到主页可点,一共发生了哪几步、顺序为什么不能换?
- 平台 SDK 是在什么时候、以什么方式被"选定"的?
- "加载完了"这件事到底由谁宣布,为什么不是引擎自己?
- 一个 Phaser 场景的 `preload`/`create`/`update` 分别该放什么?

**延伸**:对应 `decisions.md` 的 D5(为什么不用 `READY`)、D12(`WebAdapter` 是平等实现)。

---

## 路径 2 · 平台 SDK 怎么接才不会渗进玩法代码(约 30 分钟,7 个文件)

| 序 | 文件 | 看什么 | 时长 |
|---|---|---|---|
| 1 | `src/platform/crazygames.d.ts`(全读,约 95 行) | 没有官方类型时怎么手写;为什么 `window.CrazyGames?` 是可选的;为什么故意不声明用不到的模块(购买/排行榜/多人房间) | 4 min |
| 2 | `src/platform/PlatformAdapter.ts`(全读,约 75 行) | **这条路径最该被抄走的一个文件**。能力位的两类划分(`interstitialAds` 这类 vs `platformProvidesAudioToggle` 这类);生命周期信号(`loadingStart`/`gameplayStart`/`happyTime`);`showRewarded` 返回 boolean 的那段注释;存档为什么是同步的 | 6 min |
| 3 | `src/platform/adapters/crazygames.ts`(全读,约 130 行) | 回调式 SDK 怎么包成 Promise;对比 `showInterstitial`(两种回调都 resolve)和 `showRewarded`(resolve `true`/`false`)——**同一种回调,两种语义** | 5 min |
| 4 | `src/platform/adapters/web.ts`(全读,约 65 行) | 为什么它是"平等的目标平台"而不是"兜底"(见文件头注释);能力位全 `false` 之后 UI 怎么自动变化;`showRewarded` 为什么恒返回 `false` | 3 min |
| 5 | `src/game/composition.ts`(全读,约 65 行) | 平台调用怎么被关在这一层:`PlatformScoreRepository` 的 `readInt` 里两种"空"的区别("从没存过"和"存档损坏") | 4 min |
| 6 | `src/game/overlays/ReviveFlow.ts`(全读,约 120 行) | 调用方的契约责任:能力检测 → 询问 → 设静音 + `scene.pause()` → 播广告 → `finally` 撤销;以及"复活配额判断为什么不在这里" | 4 min |
| 7 | `scripts/check-boundaries.mjs` 只读 `RULES` 数组 | 规则 1(只有 `game/**` 能 import phaser)和规则 4(`platform/` 不许 import `game/`)怎么把这条边界钉成机器检查 | 2 min |

对照阅读(各 2 分钟,任选):`SettingsScene.settingsRows()` + `MenuScene.createSettingsEntry()` + `PauseController.pause()` —— 同一个能力位(`platformProvidesAudioToggle`)驱动三处 UI。

**读完能回答**:
- 玩法代码想放一个广告,它能看到的最大表面积是什么?
- 换一个发行平台要改哪些文件、绝对不用改哪些?
- 为什么"没有广告库存"和"广告播放失败"在插屏里可以合并、在激励视频里必须分开?
- 平台能力位应该怎么设计,才能让 UI 自动适配而不是发行前手改代码?

**延伸**:对应 `decisions.md` 的 D6(能力位驱动 UI)、D7(激励视频返回值)、D11(SDK 类型手写)、D12(`WebAdapter` 不是兜底)、A3/A7(依赖注入与 hooks)。

---

## 路径 3 · 玩法逻辑怎么写才能脱离引擎测试(约 30 分钟,8 个文件)

| 序 | 文件 | 看什么 | 时长 |
|---|---|---|---|
| 1 | `src/game/core/ScoreRepository.ts`(全读,16 行) | 一个只有 4 个方法的接口,为什么方法名是领域语言而不是 `get/set` | 2 min |
| 2 | `src/game/core/GameState.ts`(全读,约 215 行) | 文件头两段注释(为什么 import 要带 `.ts` 扩展名、为什么不用构造函数参数属性写法);`collectMote()` 里"加分乘倍率、充能不乘";`grazeHazard()` 的经济性推算;`finish()` 里 `previousBest` 必须先捞出来再覆盖存档 | 9 min |
| 3 | `src/game/composition.ts`(全读,约 65 行) | 全项目唯一的依赖组装点;为什么这里不需要 DI 容器 | 2 min |
| 4 | `tests/fakes/InMemoryScoreRepository.ts`(全读,27 行) | fake 长什么样;和 FastAPI 的 `app.dependency_overrides` 的对应关系 | 2 min |
| 5 | `tests/gameState.test.ts`(全读,约 120 行) | 规则层测试盯的是**不变量**(充能封顶、破纪录才写存档、复活只能一次、`previousBest` 保留);注意"隔开连击窗口以排除 combo 干扰"这类测试写法 | 5 min |
| 6 | `src/game/core/difficulty.ts` + `tests/difficulty.test.ts` | 纯函数难度曲线;常量为什么导出给 UI 用、为什么不许写成 `RAMP * 0.5`;测试怎么断言"单调递增"这种形状而不是具体数值 | 4 min |
| 7 | `src/game/core/adCadence.ts` + `tests/adCadence.test.ts` | 变现策略也是 domain;一条纯函数 + 三条测试就锁住了"第一局不弹广告" | 3 min |
| 8 | `package.json` 的 `test` 脚本 + `tsconfig.json` 的 `allowImportingTsExtensions` | `node --test "tests/**/*.test.ts"` 直接跑 `.ts` 是整条链的前提;`allowImportingTsExtensions` 是它的代价 | 3 min |

**动手作业(强烈建议做一次)**:自己跑一遍 `npx tsc --noEmit` 和 `node --test "tests/**/*.test.ts"`,亲眼看到当前是否全绿(写文档时刻实测:两者都通过,29 个测试全过)——门禁的价值取决于"现在有没有人在跑它",不要只相信文档里写的历史结论。

**读完能回答**:
- 哪些代码值得写单测、哪些不值得?(判据:它是不是"规则")
- 一个 domain 对象要满足什么条件,才能在 node 里直接 `new` 出来断言?
- 为什么 `GameState` 能被测,而 `PlayerController` 不能?
- 依赖注入在只有一个依赖时长什么样?(答案:`composition.ts` 一行)

**延伸**:对应 `decisions.md` 的 A2(`core/` 零依赖)、A3/A4/A5(依赖注入与错误处理)、E-a/E-b/E-c(数值决策)。

---

## 路径 4 · 一帧里到底发生了什么(约 45 分钟,最硬的一条)

建议读法:**先只读 `PlayScene.update()` 本身,把它当目录,再按调用顺序展开每一层。**

| 序 | 文件/函数 | 看什么 | 时长 |
|---|---|---|---|
| 1 | `src/game/scenes/PlayScene.ts` 的 `update()` | 一帧的全貌:非 `playing` 阶段早退 → `state.tick(delta)` → `player.update(delta)` → 算难度快照 → 两个 spawner 的 `update` → graze 判定 → 冲击波范围内查询 → `PlayerRing.update` → 满充能边缘检测 → `RunTimeline.update` → `Tutorial.update` → `Hud.update`。**注意顺序:先推进状态,再表现,最后 HUD 读状态** | 6 min |
| 2 | `src/game/objects/PlayerController.ts` 的 `update()` | 输入分流(键盘 vs 指针)+ 帧率补偿 + 边界钳制,一帧内的位移是怎么算出来的 | 5 min |
| 3 | `src/game/objects/HazardSpawner.ts` 的 `update()`/`spawnOne()`/`cullOffscreen()` | 池的"取"和"还"各发生在一帧的什么位置;`+=` 的节奏锚定;出屏回收 | 6 min |
| 4 | `src/game/objects/HazardSpawner.ts` 的 `collectNewGrazes()` | 全项目最精细的一段推理:为什么用线段判定不用点判定、去重标记怎么清 | 6 min |
| 5 | `src/game/objects/MoteSpawner.ts` 的 `spawnOne()`/`cullExpired()` | `expiresAt` 时间戳回收(对照路径 6 会再看一次,这是"池化后不能用 delayedCall 持有引用"的正面案例) | 3 min |
| 6 | `src/game/core/GameState.ts` 的 `tick()` | 规则层在一帧里只做两件事:推进时间、检测连击超时断连 | 2 min |
| 7 | `src/game/hud/PlayerRing.ts`、`src/game/hud/Hud.ts`、`src/game/hud/RunTimeline.ts` | 三个"只读不写"的表现层;充能弧的阻尼跟随为什么好看;`Hud` 为什么要做"分数变了没有"的边缘检测才触发 pop 动画 | 6 min |
| 8 | `src/game/scenes/PlayScene.ts` 的 `onPulse()` | **四段编排样板:查询 → 改状态 → 表现 → 平台信号**,一眼一段 | 5 min |
| 9 | `src/game/effects/feel.ts`(全文) | 一帧里"时间本身"怎么被改写;`physics.world.timeScale` 和 `tweens.timeScale` 两个相反的语义 | 5 min |
| 10 | `src/game/scenes/PlayScene.ts` 的 `handleDeath()`/`scheduleAt()` | 一段跨越数百毫秒的多阶段编排怎么用绝对时间戳写,而不是嵌套 `delayedCall` | 6 min |

**读完能回答**:
- 一帧里"读输入 / 推进规则 / 生成回收 / 判定 / 表现 / HUD"的先后顺序为什么是这个?
- 状态被谁改、在哪个文件的哪几个函数里改?(答案:只在 `PlayScene` 的几个编排方法里)
- 需要跨多帧的效果(hitstop、错峰清场、死亡序列)有哪几种写法,各自的坑是什么?
- 如果要加一个新机制,该在这条链的哪一环插入?

**延伸**:对应 `decisions.md` 的 A6(system 不许 import GameState)、C1(对象池四件套)、C3(delta 补偿的四种形态)、C4(timeScale 语义)、C7/C8(单帧分配尖峰的处理)、F3(池化后的 delayedCall 陷阱,现存的一处)。

---

## 路径 5 · 怎么保证交付不出错(约 25 分钟)

| 序 | 文件 | 看什么 | 时长 |
|---|---|---|---|
| 1 | `package.json` 的 `scripts` 字段 | 五道门的串联顺序:`check:boundaries → test → tsc --noEmit → vite build → build-zip`(打包脚本 `npm run package`)。**注意它们的排序是按"发现成本从低到高"** | 2 min |
| 2 | `scripts/check-boundaries.mjs`(全读,约 130 行) | `RULES` 数组即架构文档;只匹配 `import`/`export` 开头的行这个细节;**`walk()` 函数"目标目录必须存在,否则直接报错退出"这段是全脚本最值得抄的部分** | 7 min |
| 3 | `tests/spawnBudget.test.ts` + `src/game/core/spawnBudget.ts` | 把"拍脑袋的池容量"变成"会先炸的断言";近似模型与 1.5 倍冗余为什么是配套出现的一对 | 5 min |
| 4 | `scripts/build-zip.mjs`(全读,约 120 行) | 阈值出处和核对日期;"初始下载"的近似算法;绝对路径检查;`archive.directory(DIST, false)` 保证 zip 根目录是 `index.html` | 5 min |
| 5 | `vite/config.prod.mjs` + `index.html` | `base: './'` 和"不许绝对路径"是同一条要求的两端;`manualChunks: { phaser: ['phaser'] }` 方便单独看引擎体积占比 | 2 min |
| 6 | `docs/qa-checklist.md`(全读,约 110 行) | **重点是"自动检查"和"手动检查"的分界线本身**:哪些事脚本能查、哪些永远只能靠人。尤其"界面完整性"一节是"五道门全绿但按钮没画出来"的血书 | 6 min |
| 7 | `docs/asset-license.csv` | 五行就是全部资产台账;零素材让这张表永远不会变复杂 | 1 min |

**动手作业**:自己跑一遍 `npm run package`(或分步跑 `node scripts/check-boundaries.mjs`、`node --test`、`npx tsc --noEmit`、`npx vite build --config vite/config.prod.mjs`、`node scripts/build-zip.mjs`),对照 `docs/decisions.md` 第 0 节表格里的实测数字,看现在是不是还是这个结果。

**读完能回答**:
- 一条约束应该写进文档、写进测试、还是写进会 `exit 1` 的脚本?判据是什么?
- 自动化检查覆盖不到的到底是哪一类问题?(答:"代码能跑"和"画面对"之间那一层)
- 门禁自己怎么证明自己没漏检?(答:目标目录必须存在,否则直接报错——而不是静默扫到 0 个文件却打勾)
- 我的项目里,哪三条约束值得今天就写成脚本?

**延伸**:对应 `decisions.md` 的 D1(架构约束写成脚本,以及脚本本身的设计迭代)、D2(提交包检查)、C2(池容量实算)、F1(界面完整性只能靠截图)。

---

## 路径 6 · 性能在低配设备上怎么兜底(约 30 分钟)

预设场景:CrazyGames 要求在 4GB 内存的 Chromebook 上流畅运行。

| 序 | 文件 | 看什么 | 时长 |
|---|---|---|---|
| 1 | `docs/qa-checklist.md` 的"性能(低配设备)"一节 | 先看验收标准再看实现:录 60 秒 Performance,看 Memory 曲线的锯齿幅度和 GC 次数;锯齿明显说明有对象在被频繁创建销毁 | 2 min |
| 2 | `src/game/scenes/BootScene.ts` 的 `generateTextures()`/`makeGlowCircle()`/`makeStarfield()` | 第一层:把每帧重画变成一次烘焙(`Graphics.generateTexture`) | 4 min |
| 3 | `src/game/objects/Backdrop.ts` + `src/game/scenes/MenuScene.ts` 的 `drawBackdrop()` | 同一招用在两处;`drawBackdrop()` 里那段量化注释(Graphics 每帧重跑命令缓冲、`fillCircle` 内部按固定步长拆点当场分配)——**注意这段注释里引用的"46 个圆"这个具体数字已经和当前代码脱节,论证的原理仍然成立,但案例过期了,见 `decisions.md` 的 G10** | 4 min |
| 4 | `src/game/objects/HazardSpawner.ts` 的构造函数 + `src/game/objects/MoteSpawner.ts` 的构造函数 | 第二层:对象池四件套;`maxSize` 和 `classType` 两个必须设对的参数 | 5 min |
| 5 | `src/game/core/spawnBudget.ts` + `src/game/tuning.ts` 的 `HAZARD.poolSize`/`MOTE.poolSize` | 池开多大不是猜的 | 4 min |
| 6 | `src/game/effects/fx.ts` 的 `createEmitter()`/`burst()`/`explode()`/`aliveParticleCount()` | 第三层:粒子/飘字池化 + 单次上限 + 同屏硬上限;以及"死亡爆炸曾经绕过预算"这个旁路故事 | 5 min |
| 7 | `src/game/scenes/PlayScene.ts` 的 `dimAllExcept()` | 第四层:单帧分配尖峰的处理(一个 tween 带一整组 target),以及"它恰好发生在玩家最想要丝滑的那一帧" | 3 min |
| 8 | `src/game/viewport.ts` | 最后的总开关:`RENDER_WIDTH` 调回 960,其余代码一行不动 | 2 min |
| 9 | `src/game/objects/MoteSpawner.ts` 类头注释 | 池化的代价:一整类异步 bug 的正确性前提被改写了(对照路径 4 的第 5 步和 `decisions.md` 的 F3) | 2 min |

**读完能回答**:
- 在 Phaser 里,"每帧新建对象"的代价具体花在哪(Canvas/measureText/纹理上传/命令缓冲/几何点分配)?
- 对象池该给谁开、开多大、怎么证明够用?
- 性能预算怎么才不会被旁路绕过?
- 如果还是不够快,按什么顺序拧旋钮?(粒子上限 → 星空密度 → `RENDER_WIDTH`)

**延伸**:对应 `decisions.md` 的 B2(渲染分辨率选 1920)、C1/C2/C5/C6/C7(对象池、粒子预算、Graphics 烘焙、单帧分配尖峰)。

---

## 补充路径 A · 换皮 / 改分辨率到底要动哪几个文件(约 15 分钟)

`src/game/viewport.ts`(单位体系全文)→ `src/game/theme.ts`(全文,重点是 `font`/`space`/`anchor` 三套刻度 + `copy` 文案)→ `src/game/scenes/MenuScene.ts` 的 `Cluster`/`placeRowCentered`(横向排版,因为比例锚点管不了横向)→ `src/game/ui/Button.ts` 与 `src/game/ui/Panel.ts` 头部注释(样式全部读 `THEME`,换皮时一行不用动)→ 回头看 `src/game/tuning.ts` 里那 6 处 `TODO(theme)`(这条切分线现在没守住,见 `decisions.md` 的 B4)。

**读完能回答**:换一套配色和文案要改几个文件?哪些数值该在 `tuning.ts`、哪些该在 `theme.ts`,判据是什么?为什么这条边界会腐烂,而 `core/`/`platform/` 那几条边界没腐烂?

**延伸**:`decisions.md` 的 B1、B3、B4、D1(对比"有机器守"和"没机器守"的两种边界各自的命运)。

## 补充路径 B · 高刷新率一致性(约 20 分钟)

`docs/qa-checklist.md` 的"帧率一致性"一节(验收判据)→ `src/game/objects/PlayerController.ts` 的 `update()`(位置插值的帧率补偿公式)→ `src/game/hud/PlayerRing.ts` 的 `update()`(同一公式的第二次出现)→ `src/game/ui/Button.ts` 的 `update()`(周期动画用绝对时间)→ `src/game/objects/HazardSpawner.ts` 的 `update()`(定时事件用 `+=` 并限制补发)→ 同文件的 `collectNewGrazes()`(判定改成线段)→ `src/game/scenes/transition.ts` 头部注释(哪些地方引擎已经替你做了)。

**读完能回答**:"delta 补偿"其实是四类不同的问题,分别长什么样?哪些地方引擎已经替你做了、哪些必须自己做?怎么在 code review 里一眼看出漏补偿?

**延伸**:`decisions.md` 的 C3(delta 补偿的四种形态,全文)。
