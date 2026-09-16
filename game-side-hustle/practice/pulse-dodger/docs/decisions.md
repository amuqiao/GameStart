# 决策记录

## 0 · 这份文档是给谁看的、怎么用

你是 Python 后端出身,不做游戏。以后做新游戏时,你会回来读这个项目,但不会照抄它的代码——你的引擎、平台、团队规模、玩法都会不一样。这份文档记的不是"我们做了什么",是**"我们放弃了什么、以及你什么时候该反过来选"**。代码只能告诉你"是什么",这份文档告诉你"为什么不是别的"。

每条决策是同一个六段式:

- **问题**:要解决什么
- **选择**:选了什么
- **放弃**:放弃了什么
- **理由**:为什么
- **什么情况下你该选另一个**:这一项最关键。没有它,这份文档就退化成"成果展示",你只会照抄结论而不会自己判断。
- **证据**:实测数字 / Phaser 源码位置 / 测试文件

证据分为四级,标注方式不同:
- **源码核对**:我读了 `node_modules/phaser` 里的实际实现,引用到函数名(不引用行号——行号会过期,这个项目已经因此吃过亏,见下面的矛盾清单)。
- **实跑**:我在这台机器上实际执行了命令(`tsc`、`node --test`、`vite build`、`build-zip.mjs`),下面报告的都是这次实跑的原始输出。
- **测试锁住**:有专门的测试文件断言这个行为,改坏了会先炸测试。
- **待验证**:只有推理,没有实测,不要当成事实转述给别人。

**当前代码状态(写文档时刻的实跑结果,供你核对论据是否还成立)**:

| 检查 | 结果 |
|---|---|
| `npx tsc --noEmit` | **通过**,0 错误 |
| `node --test "tests/**/*.test.ts"` | **29 个测试全部通过** |
| `node scripts/check-boundaries.mjs` | **通过**(当前只有 4 条规则,见 D1) |
| `dist/`(`vite build` 产物) | 3 个文件:`index.html` 2688 B、`assets/index-*.js` ≈55–56 KB、`assets/phaser-*.js` 1194877 B,合计约 1.20 MB |
| `submissions/pulse-dodger.zip` | 334373 B ≈ **326.5 KB** |

这份文档依据的代码状态是当前 git 工作区(在 `1cfea26` 之后,大量文件未提交,目录刚经历过一次从 `config.ts / shell/ / systems/ / infra/` 到 `viewport.ts+tuning.ts / overlays/ / objects/+effects/ / composition.ts` 的重构)。**重构改了目录名和文件名,但很多注释里的旧名字没有跟着改**——这本身就是本文档要教的核心判断之一,详见下面的矛盾清单,尤其是 G0。

---

## G 节 · 注释与代码矛盾清单(建议第一遍就读完这一节)

这一节故意放在最前面。一份连自己项目里的矛盾都不敢列出来的文档,你没有理由相信它其余的部分。
写法:**说了什么 → 实际是什么 → 哪个是真的 → 对你的意义**。

> **⚠️ 这是一份「案例集」,不是待办清单。**
>
> 下面列出的矛盾都是**真实发生过**的,但绝大多数**在本文档写成的同时就被修掉了**
> —— 清理注释和撰写文档是两个并行进行的任务,撰写者读到的是修复前的代码。
> 每条后面标了当前状态。
>
> 保留这一节而不是删掉,是因为**「注释是怎么烂掉的」比「注释现在对不对」更值得学**。
> 这些矛盾的成因高度一致,而且会在任何有人维护的代码库里重演:
>
> 1. **重构改了路径,注释没跟着改** —— 最高频,而且类型检查完全看不见
> 2. **代码改了行为,注释停在旧版本** —— 比如写着「这里还不支持 X」,而 X 早就支持了
> 3. **注释在跟当时的协作者说话** —— 「这次改动」「另一个人正在改 X,我先不动」
> 4. **注释引用了行号** —— 行号必然过期
> 5. **量化举例引用的常量被删了** —— 论证还在,指代对象没了
>
> 如果你只从这份文档带走一条,建议是这条:
> **注释只描述「当前代码为什么这样」。不描述它曾经是什么样、不给别人派活、不引用行号。**

### G0. 大规模目录重命名后,注释里的旧路径没有跟着改(本次通读新发现,数量最多的一类矛盾)


> 状态:✅ **已修复** —— 全仓扫描确认无残留旧路径。
项目最近把 `config.ts` 拆成了 `viewport.ts`(单位体系)+ `tuning.ts`(玩法数值),把 `shell/` 改名成 `overlays/`,把 `systems/` 拆成了 `objects/`(生成器/控制器)+ `effects/`(特效/音频),把 `infra/PlatformScoreRepository.ts` 合并进了 `composition.ts`。但至少以下文件里的注释仍然写着旧名字:

- `src/game/theme.ts`:文件头注释说"玩法数值在 `config.ts`,换皮时不要动"——`config.ts` 已经不存在。
- `src/game/tuning.ts`:注释里三处写"见 `systems/fx.ts`"“见 `systems/feel.ts`”——实际路径是 `effects/fx.ts`、`effects/feel.ts`。
- `src/game/scenes/PlayScene.ts`:类头注释说"暂停系统/复活广告编排/星空背景在 `shell/`……玩法机件在 `systems/`",两个目录名都已改名(`overlays/`、`objects/`+`effects/`);同一文件另有两处写"见 `config.ts` PULSE...”“`config.ts` 里 `DEATH` 常量块"。
- `src/game/overlays/PauseController.ts`:注释说"`shell/` 的定位是……"、"`shell/` 不许依赖 `core/`、不许依赖 `systems/`、不许依赖具体 Scene(见 `scripts/check-boundaries.mjs`)"——这条**规则本身在当前的 `check-boundaries.mjs` 里已经不存在**了(见 G1)。
- `src/game/overlays/ReviveFlow.ts`:同样引用了"`shell/` 不许依赖 `systems/`"和"照抄整个 `shell/` 目录"。
- `src/game/objects/PlayerController.ts`、`src/game/effects/feel.ts`:引用"`shell/PauseController.ts`"。
- `src/game/ui/Panel.ts`:两处引用"`shell/PauseController.ts`、`shell/ReviveFlow.ts` 的硬约定"。
- `src/game/core/spawnBudget.ts`:引用"`config.ts` 里的 `HAZARD.poolSize`"。

**哪个是真的**:代码是真的,以上全部是注释没跟上重命名。**对你的意义**:目录改名这件事,`tsc`/测试/`check:boundaries` 全都不会报错——改名只影响字符串路径,不影响任何一层机器检查关心的东西。这是本项目"文档会过期"这条元判断(见 D1)最直接的自我印证:连**同一次提交里的注释**都会在改名后立刻过期,更不用说独立维护的 `README.md`。

### G1. `overlays/` 依赖边界规则,在注释里存在,在脚本里已经不存在


> 状态:✅ **已修复** —— 那处不实的「脚本会检查」表述已删除,只保留作为团队约定的说法。
`PauseController.ts`/`ReviveFlow.ts` 的注释多次声称"`shell/`(现 `overlays/`)不许依赖 `core/`、不许依赖 `systems/`(现 `objects/`+`effects/`)、不许依赖具体 Scene,见 `scripts/check-boundaries.mjs`"。但当前 `check-boundaries.mjs` 里只有 **4 条规则**:①只有 `game/**` 能 import phaser;②`core/` 只能依赖 `core/` 自身、`tuning.ts`、`viewport.ts`;③`effects/` 不许 import `core/`;④`platform/` 不许 import `game/`。**没有任何一条规则约束 `overlays/`**。

哪个是真的:两边都不完全"真"——注释描述的是曾经存在过的设计意图,当前脚本是有意收缩过的实现(见 D1,脚本头部写明"刻意只有四条,每条教一个不同的点,而不是追求覆盖率")。对你的意义:`overlays/` 目前不依赖 `core/`/`objects/`/`effects/` 这件事,现在完全靠人自觉维护,机器不再兜底——如果你要照抄这条边界,记得把规则也一起搬回脚本里,不要只抄注释里的说法。

### G2. `contracts.ts` 自称"只有 2 处需要手动 off",且以为 `ResultData` 只有 4 个字段


> 状态:✅ **已修复**。
`scenes/contracts.ts` 文件头写"目前项目里只有 2 处需要手动 off(例如 PlayScene 里 BLUR/VISIBLE 的解绑)",实际至少 3 处:`PauseController.bindAutoPause`(已解绑)、`effects/feel.ts` 的 `afterUnscaledDelay`(已解绑,且经实测 `tsc` 通过——见 G3,这处曾经是坏的,现在已修好)、`PlayScene.scheduleAt`(**没有**对应的 `SHUTDOWN` 解绑;目前只在死亡序列内部两个固定延时点使用,两次回调都会在场景切走之前触发,所以还没有观察到问题,但"只有 2 处"这个数字本身已经不准)。

同一个文件里,`ResultData` 的注释说"目前只有这 4 个字段……后续批次会往这里加字段(`maxCombo`/`pulsesFired`/`hazardsCleared`/`grazes`/`motesCollected` 等)",而接口定义本身**已经有 11 个字段**,注释里点名要加的 5 个字段全部已经加上。哪个是真的:代码是真的。对你的意义:这类"目前只有 N 个"的断言是最快腐烂的一类注释,除非有脚本在数(参见 D1 的"元断言"设计,以及它现在为什么换了一种做法)。

### G3. `effects/feel.ts` 的 `off` 曾经是一个真实的编译错误,现在已经修好


> 状态:✅ **已修复** —— 撰写本文时 `tsc` 已通过。
这是唯一一条我要特别提醒"不要直接相信历史记录"的矛盾:早前的规划(写于本次重构之前)记录过一次实跑,`npx tsc --noEmit` 报 `feel.ts` 里 `Cannot find name 'off'`。我这次重新读 `effects/feel.ts` 的 `afterUnscaledDelay` 函数,`off` 已经被正确声明为一个局部函数(先定义 `off`,再在 `tick` 里引用它,最后用 `scene.events.once(SHUTDOWN, off)` 绑定),重新实跑 `tsc --noEmit` **exit 0**。哪个是真的:现在的代码是对的。对你的意义:门禁的价值取决于"现在有没有人在跑它、且跑的是最新代码"——同一个错误可能在你读到这份文档时已经被修好,也可能在你读完之后又被引入,**这正是为什么第 0 节要把实跑结果和读文档的时间点绑在一起,而不是永远引用一份写死的历史数据**。

### G4. `theme.ts` 说 `ResultData` 不带 `previousBest`,代码里早就有了


> 状态:✅ **已修复**。
`theme.ts` 的 `copy.recordBroken` 注释说:"ResultData 当前不携带破纪录前的旧最高分,所以算不出精确的'超出纪录 N 分'……等 `contracts.ts` 加上 `previousBest` 字段之后再补数字版本"。实际 `contracts.ts` 的 `ResultData` 已有 `previousBest`,`GameState.finish()` 在覆盖存档前就把旧值捞出来,`ResultScene.createRecordBarCaption` 已经在用 `score - previousBest` 算精确数字(`previousBest > 0` 时报数字,否则只显示"刷新纪录!")。哪个是真的:代码是真的,`recordBroken` 文案现在只覆盖"首次破纪录(旧纪录为 0)"这一种情况。对你的意义:这类"信息丢失"完全不会崩溃,只会让某句文案永远显示不出精确数字,而且没人会主动发现——`tests/gameState.test.ts` 里专门有两条测试锁住 `previousBest` 的行为,这是它没有继续腐烂下去的原因。

### G5. `hud/RunTimeline.ts` 的注释自己和自己打架


> 状态:✅ **已修复**。
文件顶部先写"这是难度曲线在 UI 侧的镜像展示,理想情况下应该从 `core/difficulty.ts` 读同一个常量,但按本批任务的文件所有权约束不许碰 `core/`,先在这里镜像一份纯展示用的数值",紧接着下一行却是"从 `core/difficulty.ts` 导入,不再镜像一份——唯一真相在难度曲线那边"。代码本身确实是 `import { DIFFICULTY_RAMP_SECONDS, DOUBLE_SPAWN_SECONDS } from '../core/difficulty'`。哪个是真的:第二段注释和代码一致,第一段是修复前的旧版本没删干净。对你的意义:两段连续的注释,后一段会悄悄替换前一段的"当前状态",但读者很容易把两段都当成还成立的说明——写修复性注释时,旧的那段必须删,不能留着"对比"。

### G6. `effects/fx.ts` 自称"3 个常驻 emitter",实际建了 4 个


> 状态:✅ **已修复** —— 注释改成不写死 emitter 数量,避免下次增减又对不上。
`Fx` 类头注释和 `emitterFor` 里的报错提示都说"3 个常驻 emitter(mote 色/hazard 色/pulse 色)"，但构造函数里实际建了 4 个:多了 `THEME.entity.player`,专门给死亡爆炸用,注释自己也解释了"以前 PlayScene 每次死亡现建一个临时 emitter,那部分粒子还绕过了 particleCap,现在改成常驻的第 4 个"。哪个是真的:代码(4 个)是真的,"3 个"是这次改动之前的数字没有跟着改。

### G7. `fx.ts` 里 `burst()` 的文档注释挂在了 `explode()` 头上


> 状态:✅ **已修复** —— 孤立的文档块已搬回 `burst()` 头上。
`Fx` 类里连续两段 JSDoc:第一段完整讲了 `count` 是"强度单位"、单次最多 48 颗封顶、默认值 2 对应"1 个物体死亡"的视觉密度——这些全是 `burst()` 的行为;但紧跟着这段注释的是第二段("一次性大爆炸(死亡用)……")和 `explode()` 函数本身,`burst()` 定义在更下面,**没有自己的文档注释**。哪个是真的:代码结构是真的(两个函数确实存在且职责不同),只是第一段文档挂错了宿主。对你的意义:两段连着写的 JSDoc,前一段会静默失去它原本描述的函数,工具链不会给任何提示——写文档注释时,函数和它紧邻的下一个函数之间最好留一个空行以上的视觉区隔,便于人眼核对"这段注释到底在说谁"。

### G8. `objects/HazardSpawner.ts` 里 `killAndHide` 的源码出处写错了


> 状态:✅ **已修复** —— 出处更正为 `gameobjects/group/Group.js`。
注释说"已核实源码(`gameobjects/components/Actions.js` / `GameObject.js`)",实际 `killAndHide` 定义在 `node_modules/phaser/src/gameobjects/group/Group.js` 的 `killAndHide` 方法里(只做 `setActive(false)` + `setVisible(false)`)。结论是对的(它确实不碰物理 body),出处是错的。对你的意义:"已核实"三个字要能被复核——写"我读过源码"这种断言时,附上能让别人一分钟内验证的具体位置,而不是含糊的目录名。

### G9. 大量"本批任务/主 agent/另一个 agent"式的施工期口吻残留在决策注释里


> 状态:✅ **已修复**。
`tuning.ts` 里至少 6 处"本批任务不许碰 `theme.ts`,先放这里 / `TODO(theme)`"(`TOUCH_OFFSET_Y`、`PULSE` 的 `ring2*`/hitstop/shake/zoom 一整段、`FX` 整段、`GRAZE` 的表现参数、`DEATH` 整段);`scenes/transition.ts` 里"如果主 agent 接线时原样保留这 420ms……这个改动必须由主 agent 在 `PlayScene.ts` 里做"和"theme.ts 当前正被另一个 agent 并行修改";`scenes/contracts.ts` 的"接线由主 agent 负责替换各场景文件里的裸字符串"(实际全部场景已经在用 `SCENES.*`,没有裸字符串了);`PlayScene.ts` 里"不许碰 `core/` 去加实时 getter"(解释为什么 `tutorialMotesCollected`/`tutorialPulsesFired` 要在场景里单独维护一份)。这些都不是设计理由,是**当时的协作流程约束**,对现在的读者是噪音,而且伪装成了设计说明。**判断标准**:注释里一旦出现"本批/本次任务/另一个 agent/主 agent"这类词,基本可以确定它已经过期,该找机会把"为什么"重新提炼成不依赖协作上下文的说法(参照 D3/D4 那样的写法)。

### G10. `theme.ts` 里 `starfield.menuCount = 46` 是死代码,且和它引出的教学案例对不上


> 状态:✅ **已修复** —— `menuCount` 死字段已删除。原理仍然成立,过期的只是那个具体数字。
`theme.ts` 定义了 `starfield.menuCount: 46`,全项目搜索没有任何地方引用它。而 `MenuScene.drawBackdrop` 的注释举了一个具体数字做量化论证:"46 个圆 = 每帧约 4600 次小对象分配,而主菜单恰好是玩家停留最久的画面"——但 `MenuScene` 现在直接 `new Backdrop(this)`,贴的是 `BootScene` 用 `THEME.starfield.count`(60,不是 46)烘好的共享贴图 `tex-starfield`,并不会每帧重画,更谈不上"46 个圆每帧分配"。哪个是真的:代码行为(烘成贴图、不再每帧画)是真的,"46"这个具体数字是修复之前、`MenuScene` 还在自己用 `Graphics` 画星空时的遗留数值,`menuCount` 字段本身也没人用了。对你的意义:即使是"我们已经优化过"的教学性注释,里面的具体数字也会在后续改动里失去指代对象——量化证据比定性描述更有说服力,但也更容易在重构后对不上号,值得回头检查它引用的常量是否还在被使用。

### 附:两处"不算矛盾但不一致"

- `ResultScene.ts` 引用 `../core/adCadence.ts` 时带了 `.ts` 扩展名,同文件其余 import 都不带。按 `core/GameState.ts` 定义的规则,只有会被 `node --test` 直接执行的文件才需要显式扩展名,`ResultScene.ts` 不会被 node 直接执行——不算错,但说明这条规则的适用边界没有被完全内化。
- ~~`dom/LoadingOverlay.label` 和 `effects/audio.ts` 的 `hit()` 都是无调用方的死代码~~ —— **两者已删除**。值得留下的判断是:`tsconfig` 的 `noUnusedLocals` **管不到导出的公开成员**,所以跨文件从未被引用的 `public` 方法能一路躲过类型门。这是这个项目里「类型系统唯一看不见的坑」,发现它只能靠人工 grep 调用方。

---

## A 组 · 架构与边界

### A1. 为什么不引入事件总线(event bus / pub-sub)

- **问题**:场景之间怎么传数据、系统之间怎么互相通知。
- **选择**:`scene.start(key, data)` + 一份共享类型契约(`scenes/contracts.ts` 里的 `SCENES` / `ResultData` / `SceneDataMap` / 泛型 `fadeToScene<K>`)。
- **放弃**:自造一层事件总线。
- **理由**:Phaser 本身已经有三级事件系统(`game.events` 跨场景、`scene.events` 场景生命周期、`GameObject.emit` 单对象),再叠一层自造总线,表面上"更解耦",实际是拿类型安全换字符串——事件名和 payload 形状又变回两边各写各的匿名约定。更关键的是,本项目的场景跳转数据流是**编译期完全已知的静态单向树**(`Boot → Menu → Play → Result → Play → ...`),每条边的发送方和接收方永远恰好是 1 对 1,不存在"多个模块都关心同一份数据"的广播场景——这正是总线该出场的前提,而这里从头到尾都不成立。
- **什么情况下你该选另一个**:接收方数量在编译期未知、或会动态增减(成就系统、埋点、多插件同时监听同一事件);同一份数据要被 3 个以上互不认识的模块消费;你需要"发了就不管"的解耦,而不是"跳过去"的传参。一句话判据:**这份数据的接收方还是不是 1 个?**
- **证据**:`src/game/scenes/contracts.ts` 文件头论证段;`SCENES as const` 定义;`ResultData`/`SceneDataMap` 及末尾的 `satisfies Record<SceneKey, unknown>` 编译期自检;`src/game/scenes/transition.ts` 的 `fadeToScene<K extends SceneKey>` 泛型签名把场景 key 和 payload 类型钉在一起。

### A2. 为什么 `core/` 必须零 Phaser 依赖(以及为什么这条约束会牵连到 `.ts` 扩展名和构造函数写法)

- **问题**:规则层(玩法状态与数值)能不能脱离引擎和浏览器被推演、被测试。
- **选择**:`core/` 不许 import `phaser`/`platform`/`theme`,由 `scripts/check-boundaries.mjs` 的规则 2 机器强制(只能依赖 `core/` 自身、`../tuning.ts`、`../viewport.ts`);`core/` 内部相对 import 一律显式写 `.ts` 扩展名;`tsconfig.json` 开 `allowImportingTsExtensions`;`core/` 里不使用 TS 的构造函数参数属性写法(`constructor(private readonly x)`)。
- **放弃**:让 `GameState` 直接持有 `scene`、直接调用 `platform().save()`;或者为了测它而引入 jsdom / headless Phaser。
- **理由**:`package.json` 的 `test` 脚本是 `node --test "tests/**/*.test.ts"`,直接把 `.ts` 当 ESM 执行,走的是**标准 Node ESM 解析,不认省略扩展名**,不带扩展名会 `ERR_MODULE_NOT_FOUND`;只被 Vite 打包的文件(`scenes/*` 等)不受这条约束,约束的传染范围就到"会被 node 直接执行的文件"为止。构造函数参数属性也被禁——Node 的 `--experimental-strip-types`(本项目跑测试靠它直接执行 `.ts`)只做语法剥离,不支持这种需要类型信息才能展开的语法糖,写了会在 `node --test` 下直接抛 `SyntaxError`。
- **什么情况下你该选另一个**:测试跑在 vitest/jest 这类带打包器的 runner 里时,`.ts` 扩展名约束完全不需要,不要照抄;如果"规则"本身离不开引擎数据结构(物理求解、寻路),硬剥离出来只会写一堆 DTO 转换,不如接受耦合、改用集成测试兜底。
- **证据**:`src/game/core/GameState.ts` 文件头两段注释(扩展名原因、strip-types 原因);`src/game/core/spawnBudget.ts` 文件头同一条说明;`tsconfig.json` 的 `allowImportingTsExtensions: true`;`package.json` 的 `test` 脚本;`scripts/check-boundaries.mjs` 规则 2;实跑 `node --test` 29 个测试全过。

### A3. 为什么 `ScoreRepository` 要依赖注入,而 `platform()` / `audio` 不注入

- **问题**:哪些依赖值得抽成接口 + 注入,哪些不值得。
- **选择**:只有存档走接口(`ScoreRepository`)+ 构造函数注入 + 唯一组装点 `src/game/composition.ts`;平台适配器(`platform()`)和音频系统(`audio`)是模块级单例,直接 import 使用。
- **放弃**:DI 容器/服务定位器;或者给每个系统都套一层接口。
- **理由**:判据是"**运行期有没有第二个实现要顶替进来**"。存档有:生产是 `PlatformScoreRepository`(现在直接定义在 `composition.ts` 里,不再单独放一个 `infra/` 目录),测试是 `tests/fakes/InMemoryScoreRepository.ts`。`platform()` 的多实现切换发生在**启动时一次性探测**(`initPlatform()`),不是运行期切换,注入进来只会让每个构造函数多一个参数;`audio` 在 node 测试里根本不会被执行到(规则层不发声,`core/` 也不允许 import 它)。ESM 模块本身就是天然单例容器,一个模块级常量就是全部的 wiring。
- **FastAPI 类比**:`ScoreRepository` 接口 ≈ `Depends` 的抽象类型;`PlatformScoreRepository` ≈ 生产用的 `Depends(get_db)`;`InMemoryScoreRepository` ≈ `app.dependency_overrides[get_db] = fake`;`composition.ts` ≈ 应用启动时的那次 wiring。
- **什么情况下你该选另一个**:同一进程内要同时存在两个平台实现(比如平台迁移期双写);或者你要在测试里断言"广告被调用了几次"——这时 `platform()` 就该注入。反过来,如果你的项目连一个"运行期会被替换"的依赖都没有,连 `composition.ts` 都不用建。
- **证据**:`src/game/composition.ts` 全文;`src/game/core/GameState.ts` 构造函数与文件头注释;`src/game/core/ScoreRepository.ts`;`tests/fakes/InMemoryScoreRepository.ts`;`tests/gameState.test.ts` 全部用例。

### A4. 为什么 `ScoreRepository` 的方法名是领域语言而不是 `get/set`

- **问题**:存档接口该长什么样。
- **选择**:`loadBestScore()` / `saveBestScore(v)` / `loadRunsPlayed()` / `saveRunsPlayed(v)`。
- **放弃**:`get(key)` / `set(key, value)`。
- **理由**:领域语言让 `SAVE_KEYS`(`src/game/keys.ts`)的字符串 key 和"字符串转整数"的解析细节永远关在生产实现(`composition.ts` 的 `readInt`)里,domain 层(`GameState`)看不到 key 就不可能拼错 key。
- **什么情况下你该选另一个**:存档项有几十条且大部分同构(比如一张设置项表)时,领域语言会退化成几十个样板方法,那时 `get/set` + 一层 schema 校验更省事。
- **证据**:`src/game/core/ScoreRepository.ts` 全文;`src/game/composition.ts` 的 `PlatformScoreRepository`。

### A5. 为什么"读不到"和"读坏了"要区别对待

- **问题**:存档读取失败时该返回默认值还是抛错。
- **选择**:`readInt()`(`composition.ts`)里,`platform().load(key)` 返回 `null`(从没存过)→ 返回默认值,这是**领域语义**不是兜底;返回了值但 `Number.parseInt` 解不出合法整数(比如存档被手改坏了)→ **直接抛**。
- **放弃**:两种情况都静默返回默认值。
- **理由**:静默当 0 会把"存档损坏"变成"玩家最高分莫名归零",没人能查。
- **什么情况下你该选另一个**:这条数据是可有可无的展示项(比如昵称)、抛出去会让整个页面挂掉时,该降级而不是抛。判据是:**这条数据坏了,玩家会不会察觉并投诉**。
- **证据**:`src/game/composition.ts` 的 `readInt` 函数及其上方注释。

### A6. 为什么 `objects/`、`effects/` 里的类不许 import `GameState`

- **问题**:谁有资格改玩法状态。
- **选择**:`objects/`(`PlayerController`/`HazardSpawner`/`MoteSpawner`)和 `effects/`(`fx`/`feel`/`audio`)只接受入参、返回结果,把结果写回 `GameState` 是 `PlayScene` 一个文件的事;这条约束由 `check-boundaries.mjs` 规则 3(`effects/` 不许 import `core/`)部分机器强制,`objects/` 目前没有对应的机器规则,靠约定。
- **理由三样**(在 `HazardSpawner`/`MoteSpawner`/`PlayerController`/`feel.ts`/`fx.ts` 文件头反复出现的同一条论证):这些类可以脱离 `GameState` 单独推演;"谁改了分数"永远只有一个答案(`PlayScene`);不需要事件总线(和 A1 互相支撑)。
- **什么情况下你该选另一个**:实体数量巨大、每个实体都要读写共享状态(ECS 型架构)时,这条约束会逼出一堆参数透传,那时应该反过来让这些类拿到 world/state 的只读视图。
- **证据**:`src/game/objects/HazardSpawner.ts`、`src/game/objects/PlayerController.ts`、`src/game/effects/feel.ts`、`src/game/effects/fx.ts` 各自文件头;`PlayScene.onPulse()`(查询→改状态→表现→平台信号四段编排)。

### A7. 为什么 `overlays/` 用 hooks 注入而不是直接 import 玩法细节

- **问题**:暂停系统、复活流程要不要知道具体是哪款游戏、哪套音频系统。
- **选择**:`overlays/PauseController` 用 `PauseControllerHooks`(`onPause`/`onResume`/`canPause`/`isAudioMuted`/`toggleAudioMuted`),`overlays/ReviveFlow` 用 `ReviveFlowHooks`(`setAdMuted`)。两者都不直接 import `GameState`、`core/` 或 `effects/audio`。
- **理由**:`overlays/` 的价值在于"下一款游戏能整个目录搬走"。一旦它 import 了具体的 `PlayScene` 或 `audio`,就从"搬走"变成"改完再搬"。**注意**:目前 `check-boundaries.mjs` 里已经没有对应的机器规则约束这一层了(见 G1),这是纯靠约定维持的边界。
- **什么情况下你该选另一个**:外壳和玩法只会被用一次(一次性项目)时,hooks 是纯开销,直接 import 更短。判据是:**这段代码会不会被第二个项目用**。如果答案是"会",建议同时把边界规则补回 `check-boundaries.mjs`,不要只写在注释里(参见 G1 的教训)。
- **证据**:`src/game/overlays/PauseController.ts` 的 `PauseControllerHooks` 接口与文件头注释;`src/game/overlays/ReviveFlow.ts` 的 `ReviveFlowHooks`;`PlayScene.create()` 里两处 `new PauseController(...)` / `new ReviveFlow(...)` 的注入点。

### A8. 为什么复活配额不写在 `ReviveFlow` 里

- **问题**:"每局只能复活一次"这条规则该放在哪。
- **选择**:配额判断在 `GameState`(私有字段 `reviveUsed`,外部只能通过 `canRevive` 读、`consumeRevive()` 消耗);`ReviveFlow.offer()` 只负责"能力检测 → 询问 → 放广告 → 静音编排",不查配额,调用方(`PlayScene.afterDeath`)在调 `offer()` 之前自己先查 `state.canRevive`。
- **理由**:配额是玩法规则,值得被 `tests/gameState.test.ts` 锁住;广告编排是外壳,要能被搬走。混在一起两边都不能独立复用。
- **什么情况下你该选另一个**:如果配额本身来自平台(比如平台限制每日激励视频播放次数),它就该放在适配层(`platform/`)而不是 `core/`。
- **证据**:`src/game/core/GameState.ts` 的 `canRevive`/`consumeRevive`/`reviveUsed`;`src/game/overlays/ReviveFlow.ts` 的 `offer()`;`PlayScene.afterDeath()`;`tests/gameState.test.ts` 里"复活机会只能用一次"那条测试。

### A9. 为什么不把输入拆成 InputSystem + PlayerSystem 两层

- **问题**:读输入和移动角色要不要分开建模。
- **选择**:一个 `objects/PlayerController` 同时管"读输入"和"移动角色"。
- **理由**:躲避游戏里输入就是位移——鼠标/触屏的每次移动事件唯一要做的事是更新跟随目标,再由同一帧的位移逻辑去追。拆开的话,两个类之间除了传一个 `{x, y}` 之类的 DTO 之外没有任何独立可测/可复用的价值,是"为了分层而分层"。键盘 SPACE 触发冲击波也刻意不塞进这个类——它和移动毫无关系,由 `PlayScene` 自己绑定并调用 `onPulse()`。
- **什么情况下你该选另一个**:出现"多角色轮流控制""输入要录像回放/网络同步""重映射键位"这类需求时,输入必须独立演化,那时再拆不迟。
- **证据**:`src/game/objects/PlayerController.ts` 文件头注释与 `onPointerDown`/`onPointerMove` 的分流逻辑;`PlayScene.create()` 里 `this.input.keyboard!.addKey(...SPACE).on('down', () => this.onPulse())`。

### A10. 为什么场景 key 和 payload 要收成一份 `as const` + 映射表

- **问题**:`scene.start(key, data)` 的官方签名是 `data?: object`,两边类型完全无关联,怎么防止改名、漏字段、传错形状。
- **选择**:`scenes/contracts.ts` 里 `SCENES as const` + `SceneKey` + `SceneDataMap`(每个场景 key 对应它期望收到的 payload 类型)+ 末尾 `satisfies Record<SceneKey, unknown>` 的编译期自检 + `transition.ts` 里 `fadeToScene<K extends SceneKey>(scene, key, data?: SceneDataMap[K])` 的泛型签名。
- **放弃**:各场景写裸字符串(`'Play'`)、接收方各自声明一份独立 interface。
- **理由**:改名 `survivedSeconds → seconds` 两边都能编译通过,运行时页面显示"存活 undefined 秒";场景名手误(`'Playy'`)也不报错,只是静默卡在当前场景。收拢成一份类型后,任何一边漏改都会在 `tsc` 阶段报错。
- **什么情况下你该选另一个**:场景数量极少且永不传参时,这套是纯样板。
- **证据**:`src/game/scenes/contracts.ts` 全文;`src/game/scenes/transition.ts` 的 `fadeToScene` 签名;调用点 `PlayScene.finishRun()`、`ResultScene.init()`。

---

## B 组 · 单位体系与视觉分层

### B1. 为什么单位体系(`viewport.ts`)要和玩法数值(`tuning.ts`)分开

- **问题**:同一套布局和数值代码,怎么在任意渲染分辨率下保持比例。
- **选择**:`viewport.ts` 只装"设计单位 → 像素"的换算(`DESIGN_WIDTH`/`RENDER_WIDTH`/`UI_SCALE`/`u()`/`GAME_WIDTH`/`GAME_HEIGHT`);`tuning.ts` 只装玩法数值(速度、分数、充能量等),且规定"空间类数值一律过 `u()`,非空间类(分数、毫秒、比例、角速度)一律裸数字"。
- **放弃**:两者混在一个文件里(这也是这个项目一度用过的结构,现在已经拆开)。
- **理由**:等价于前端的 `rem`。"改分辨率只改一个数"这句话只有在这条纪律被严格执行时才成立——`tuning.ts` 的 `FX` 注释里留了一个反面案例:粒子速度原来是裸数字 `{min:60,max:230}`,在 1080p 下实际速度只有设计意图的一半,不崩溃、不报错,只是"感觉没劲",修正后变成 `u(60)`/`u(200)`。
- **什么情况下你该选另一个**:如果 UI 用 DOM/CSS 层画(不是画布内),浏览器自己有 `rem`/`vw`,再造一套 `u()` 是重复;如果游戏是像素风、要求整数像素对齐,`u()` 内部的 `Math.round` 缩放会破坏像素网格,应该改用整数倍缩放。
- **证据**:`src/game/viewport.ts` 全文;`src/game/tuning.ts` 文件头"哪些数该过 u()"的说明和 `FX.particleSpeedMin`/`FX.particleSpeedMax` 的注释。
- **待验证**:项目历史上有过"把 `RENDER_WIDTH` 从 1920 改成 1280,只改一行,布局比例完全不变"的实验记录,本次通读没有重新复跑这个实验,不确认在当前代码上是否仍然一次成立,标记待验证。

### B2. 为什么渲染分辨率选 1920 而不是 960

- **问题**:`RENDER_WIDTH` 该定多少。
- **选择**:`RENDER_WIDTH = 1920`,`GAME_HEIGHT` 按 16:9 算出 1080。
- **放弃**:960×540(或其他更小的基准分辨率)。
- **理由**:1920×1080 是 CrazyGames 列出的最大桌面全屏 iframe 尺寸,意味着平台内**永远只会被缩小,不会被放大**——位图放大会糊,缩小不会。16:9 不支持别的比例,因为 CrazyGames 列出的 iframe 尺寸全是 16:9。
- **什么情况下你该选另一个**(这条务必显眼):粒子/填充率很重的玩法、要照顾 4GB 内存 Chromebook 时,把这个数调回 960 是**第一个该拧的旋钮**,其余代码一行不动(见 B1)。
- **关联的验收陷阱**:用 960×540 截图验证清晰度会**看不出问题**(那个尺寸恰好和设计基准 1:1),必须用 1920×1080 实际截图。
- **证据**:`src/game/viewport.ts` 里 `RENDER_WIDTH` 的注释;`docs/qa-checklist.md` 的"清晰度"一节。
- **待验证**:CrazyGames 当前的 iframe 尺寸列表和上限数值来自代码注释,`scripts/build-zip.mjs` 里核对日期写的是 2026-09-16——这类平台政策会变,使用前自行复核官方文档。

### B3. 为什么纵向布局用比例锚点(`theme.ts` 的 `anchor`)而不是绝对像素

- **问题**:多个场景(Menu/Result/Settings)的标题、主按钮、页脚,怎么在不同分辨率下都对齐、又不用每个场景各写各的坐标。
- **选择**:`THEME.anchor` 是 0..1 的画布高度比例(`heading .21` / `title .26` / `lead .36` / `meta .46` / `stats .55` / `action .63` / `subAction .76` / `footer .92`),各场景统一用 `y(ratio) = GAME_HEIGHT * ratio` 取坐标。
- **放弃**:每个场景各写各的 y 坐标。
- **理由**:比例不随分辨率变化,是 `u()` 体系能闭环的前提;语义化的锚点名字让不同页面的对应元素自动对齐在同一高度,不需要人肉核对。`stats: 0.55` 单独留一档而不是和 `meta` 共用,是为了避免"大分数/进度条"和"最高分卡"挤在一起。
- **什么情况下你该选另一个**(这条必须记住,否则会滥用):比例锚点只适合**纵向定位**,横向排版这个项目用的是另一套方法——`MenuScene` 的 `Cluster`(一组元素 + 它们的总宽度)先按局部原点 0 建好、量出真实宽度,再用 `placeRowCentered` 一次性整体平移居中,因为文字宽度在建出来之前算不出来。同一文件里还有一个例子:标题下划线的 y 坐标不是固定偏移,而是"标题底边和下一行的中点"——`u(62)` 字号的实际文本高度约 160px,固定偏移会直接骑到下一行图例上,自适应中点则无论字号怎么调都不会压行。**判据:尺寸已知的用比例,尺寸要先建出来量的用"建完再摆"。**
- **证据**:`src/game/theme.ts` 的 `anchor` 定义;`src/game/scenes/MenuScene.ts` 的 `Cluster`/`placeRowCentered`/`createIdentityGroup`(标题下划线中点计算);`ResultScene.ts`/`SettingsScene.ts` 对 `THEME.anchor` 的使用。

### B4. 为什么 `viewport.ts`/`tuning.ts` 和 `theme.ts` 要切开,以及这条线现在实际破在哪里

- **问题**:玩法数值和视觉表现要不要放在同一个文件里。
- **选择**:`tuning.ts` = 游戏是什么(换玩法改),`theme.ts` = 游戏长什么样(换皮改)。
- **理由**:混在一起的话,换配色要小心绕开数值,换难度要小心绕开颜色。
- **诚实记录现状**:这条线目前是破的。`tuning.ts` 里至少 6 处纯视觉/时序参数带着 `TODO(theme)` 停在这一侧:`TOUCH_OFFSET_Y`、`PULSE` 里 `ring2*`/hitstop/shake/zoom 一整段、`FX` 整段、`GRAZE` 的表现参数(`chainWindowMs`/`arcStrokeWidth` 等)、`DEATH` 整段。原因写在注释里是"本批任务不许碰 `theme.ts`"——那是一次协作期的文件所有权约束,不是设计决策(见 G9)。
- **什么情况下你该选另一个**:项目只会有一套皮时,这条切分是纯开销。
- **该带走的判断**:分层边界一旦没有机器守住,就会被"这次先这样"一点点侵蚀,而侵蚀记录会伪装成设计说明留在注释里。`check-boundaries.mjs` 目前守住了"phaser 依赖范围"“`core/` 的依赖范围”“`effects/` 不碰 `core/`”“`platform/` 不碰 `game/`”这四处,唯独没有守 `tuning.ts` ↔ `theme.ts` 这条线,结果就是这条线烂了。
- **证据**:`src/game/tuning.ts` 里上述各处的 `TODO(theme)` 注释;`src/game/theme.ts` 文件头的切分声明;`scripts/check-boundaries.mjs` 的规则覆盖范围。

---

## C 组 · 引擎、性能与帧

### C1. 为什么用 Phaser 自带 `Physics.Arcade.Group` 做对象池,而不自写 `Pool<T>`

- **问题**:危险物、能量点这类高频生成/回收的对象,怎么避免频繁 `new`/`destroy`。
- **选择**:`scene.physics.add.group({ classType, maxSize, allowGravity, createCallback })`,配"建 / 取 / 重置 / 还"四件套纪律。
- **放弃**:自造一个 `Pool<T>` 类。
- **理由**:引擎已经有池语义(`group.get()` 会复用 inactive 成员),再包一层只是多一个要维护的东西,还容易和 Arcade 的 body 生命周期脱节。
- **四条必须同时遵守的细则,缺一条池化就是负收益**:
  1. `maxSize` 必须设——不设的话 `isFull()` 永远 `false`,`get()` 永远在 `new`,等于没池化(`HazardSpawner`/`MoteSpawner` 构造函数里的 `maxSize: HAZARD.poolSize`/`MOTE.poolSize`)。
  2. `classType` 用 `Phaser.Physics.Arcade.Image` 不用默认的 `ArcadeSprite`——后者每帧多跑一次动画系统的 `preUpdate`,贴图不需要动画。
  3. **绝不用 `killAndHide()`**,必须 `disableBody(true, true)`(见反面教材 F2)。
  4. `get()` 不会帮你重置状态:复用前必须 `enableBody` + 重新赋值速度/角速度/缩放/透明度,并清掉上一位"房客"留下的 `setData`(比如 `grazed`/`grazePrevX/Y`),还要 `killTweensOf(obj)` 杀掉上一轮没跑完的 tween。
- **什么情况下你该选另一个**:引擎没有池语义、或者你的对象根本不是 GameObject(纯数据结构、网络包)时,自写 Pool 才是对的;如果对象的重置逻辑复杂到超过十行,包一层带 `reset()` 契约的类反而更安全。
- **证据**:`src/game/objects/HazardSpawner.ts` 的构造函数、`spawnOne`、`despawn`;`src/game/objects/MoteSpawner.ts` 同构写法;Phaser 源码 `gameobjects/group/Group.js` 的 `killAndHide` 方法。

### C2. 为什么池容量要用纯函数实算 + 测试锁住

- **问题**:`HAZARD.poolSize`/`MOTE.poolSize` 该定多大。
- **选择**:`core/spawnBudget.ts` 的 `peakHazards()`/`peakMotes()` 遍历整条难度曲线(0→120 秒,步长 0.5 秒)算理论峰值并发,`tuning.ts` 里的 `poolSize` 在此之上乘 1.5 倍安全冗余,`tests/spawnBudget.test.ts` 断言 `peak * 1.5 <= poolSize`。
- **放弃**:拍脑袋给一个"应该够了"的数。
- **理由**:池开小了的表现是"玩到某个时间点后突然没碎片了",只有玩家能发现,且极难复现。实算把这件事变成"改难度曲线时会先炸测试"的机械约束。模型本身是近似值(比如忽略了斜向飞行让实际穿屏路径更长),所以才需要 1.5 倍冗余——**近似模型和安全冗余是配套出现的一对**,不是两个独立决定。
- **一个容易错的细节**:`peakHazards()` 里必须用 `u(d.hazardSpeed)` 而不是裸的 `d.hazardSpeed`,因为生成时实际用的就是换算后的像素速度,否则算出的容量和真实生成速率会差一个 `UI_SCALE`。
- **什么情况下你该选另一个**:生成速率由玩家行为决定而不是时间曲线决定(塔防、沙盒类)时算不出封闭解,该改成"运行时统计峰值 + 上报"或直接动态扩容;对象足够廉价时,直接不设上限也可以。
- **证据**:`src/game/core/spawnBudget.ts` 全文;`src/game/tuning.ts` 里 `HAZARD.poolSize`/`MOTE.poolSize` 的注释;`tests/spawnBudget.test.ts`(实跑 3 个测试全过);`docs/qa-checklist.md` 里"池容量 ≥ 难度曲线峰值 × 1.5"一条。

### C3. 为什么所有手写的每帧插值都必须做 delta 补偿

- **问题**:Phaser 的 `update()` 跟着显示器刷新率跑,固定比例的每帧插值会在高刷屏上变快。
- **选择**:把"每 16.667ms 靠拢一个比例"换算成"每 delta 毫秒靠拢等效比例":`t = 1 - Math.pow(1 - lerp, delta / FRAME_MS_60)`。
- **理由**:CrazyGames 明文要求"physics must perform consistently across different monitor refresh rates (e.g. 144 Hz, 165 Hz)"。固定比例插值在 144Hz 上比 60Hz 快 2.4 倍、165Hz 快 2.75 倍,等于不同硬件难度不同。
- **这条纪律在项目里有四种不同形态,容易只学到一部分**:
  1. **位置插值 → 指数换算**:`objects/PlayerController.update()` 的跟随位移;`hud/PlayerRing.update()` 的充能弧阻尼跟随,用的是同一个公式。
  2. **周期动画 → 用绝对时间 `Math.sin(now / periodMs)`,不能每帧累加相位角**:`ui/Button.update()` 的呼吸缩放;`hud/PlayerRing.drawReadyPreview` 的呼吸;`hud/Tutorial.drawRing` 的旋转虚线环;`MenuScene.updateUnderline`/`updateBreathingMotes`。
  3. **定时事件 → 生成节奏用 `nextSpawnAt += interval` 而不是 `= now + interval`**:后者每次从"这一帧实际跑到的时刻"重新起算(平均晚半帧),高刷下这个偏差占比更小,导致高刷新率下生成速率比低刷新率略快(注释里给出的估算是 165Hz 比 60Hz 快约 2%)。`+=` 让生成节奏严格锚定在自己的时间线上,但也有代价:如果这条时间线落后 `now` 太多(长时间掉帧、场景冻结过),需要一个"落后超过 2 个周期就丢弃差值"的补发上限,否则会连续几帧内补发一长串。
  4. **碰撞/判定 → 用"上一帧位置 → 这一帧位置"的线段判定,而不是当前帧的点判定**:`HazardSpawner.collectNewGrazes` 用点到线段最短距离判断擦身,而不是只看当前帧的距离——低刷新率下点判定会漏判擦身,高刷新率下会重复命中,这不是速度快慢的问题,是判定方式本身跟采样密度绑定了。改成线段判定后,不管这一帧实际跨过多少像素,只要线段扫过了环带就判定命中一次,漏判/多判不再随刷新率变化。
- **不需要补偿的**:Arcade 的 `velocity`、Tween、`time.delayedCall`、Camera fade(`transition.ts` 里说明相机 fade 内部按毫秒插值,引擎已经做好了)。
- **什么情况下你该选另一个**:固定步长(fixed timestep)架构下,这些补偿都不该出现,补了反而错;只跑在自家设备上的项目也不值得。判据:**你的 `update` 步长是不是由外部硬件(显示器刷新率)决定的**。
- **证据**:`src/game/objects/PlayerController.ts` 的 `update()`;`src/game/hud/PlayerRing.ts` 的 `update()`;`src/game/objects/HazardSpawner.ts` 的 `update()`(`+=` 节奏与补发上限)与 `collectNewGrazes`(线段判定,内部 `distancePointToSegment` 函数);`docs/qa-checklist.md` 的"帧率一致性"一节;实跑 `npx tsc --noEmit` 通过、`node --test` 29 个测试全过(说明这些补偿逻辑目前编译期和单元测试层面都没有已知问题——但注意几何/时序类的手感问题单测覆盖不到,仍要靠人工在不同刷新率下实测)。

### C4. `effects/feel.ts` 的 timeScale 语义:hitstop/慢动作为什么不用 `physics.pause()`

- **问题**:怎么实现"顿帧"(hitstop)和死亡慢动作,且不能和暂停系统打架。
- **选择**:只碰 `scene.physics.world.timeScale` 和 `scene.tweens.timeScale`,从不碰 `scene.time.timeScale`;恢复时机用未缩放的 `scene.time.now` 绝对时间戳轮询 `Scenes.Events.UPDATE`(`afterUnscaledDelay` 函数),不用 `delayedCall`。
- **放弃**:`physics.pause()` / `tweens.pauseAll()` / `scene.time.timeScale` / `delayedCall`。
- **理由(三条,都有源码依据)**:
  1. `scene.time.timeScale` 会把你用来"恢复正常速度"的 `delayedCall` 自己一起拖慢(Phaser 源码 `time/Clock.js` 的 `update` 方法里 `delta *= this.timeScale`,而 `delayedCall` 的计时也挂在同一个 Clock 上),恢复逻辑被自己拖慢,时长不可控。
  2. `physics.world.isPaused`/`tweens.pauseAll()` 是**共享布尔开关**,和 `PauseController` 的暂停用的是同一组全局状态——"谁后恢复谁说了算",真实触发过的 bug 链见反面教材 F7。
  3. Phaser 源码 `time/Clock.js` 的 `update` 方法里,`this.now = time` 发生在 `if (this.paused) { return; }` **之前**,所以 `scene.time.now` 是不受 Clock 自身暂停/缩放影响的墙钟,可以安全地当恢复判据;而 `delayedCall` 挂在 Clock 的活动列表里,一旦 Clock 暂停就会被冻结。
- **最容易写反的一行**:Phaser 源码 `physics/arcade/World.js` 里 `Arcade.World#timeScale` 越大越慢(`msPerFrame = this._frameTimeMS * this.timeScale`,2.0 = 半速);`Tweens.TweenManager#timeScale` 是标准播放速率语义,越小越慢(0.5 = 半速)——两者语义相反。项目里 hitstop 用 `(physicsScale=8, tweenScale=0.15)`,死亡慢动作用 `(3, 0.45)`。
- **什么情况下你该选另一个**:引擎若没有分离的 physics/tween timeScale,只能用 pause,那时必须自己做一个"暂停原因计数器"(引用计数)而不是布尔开关。
- **证据**:`src/game/effects/feel.ts` 全文(`afterUnscaledDelay`/`hitstop`/`slowMo`);`src/game/tuning.ts` 的 `FEEL` 段;`PlayScene.handleDeath()` 用 `feel.slowMo` 编排死亡序列;Phaser 源码 `time/Clock.js`(`update` 方法)、`physics/arcade/World.js`(`timeScale` 的应用位置)。

### C5. 粒子和飘字为什么全池化 + 双层硬上限

- **问题**:冲击波一次清十几个 hazard、结算页滚分这类场景,怎么避免单帧分配尖峰。
- **选择**:`effects/fx.ts` 里 `FX.floatTextPoolSize` 个常驻 `Text` 轮转复用(`floatText()`);每种颜色一个常驻 `emitter`(`emitParticleAt` 复用,`emitter` 本身永不 `destroy`);`burst(count)` 的 `count` 是"强度单位"不是粒子数(`min(count, FX.burstUnitCap) * FX.particlesPerUnit`);再叠一层同屏硬上限 `FX.particleCap`。
- **理由**:`add.text()` 每次会新建一个 HTMLCanvas、跑一次 `measureText`、上传一张 WebGL 纹理,是本项目单次开销最大的操作;`add.particles()` 每次新建 emitter 的话,冲击波清 8 个碎片就是一帧内 8 个新 GameObject + 8 次纹理批次切换。两层截断分工明确:单次上限(`burstUnitCap`)防"一次事件挤爆预算",同屏上限(`particleCap`)防"多个事件叠加拖垮低配设备"。
- **一个真实踩过的旁路坑**:死亡爆炸原来在 `PlayScene` 现建一个临时 emitter,那部分粒子**绕过了 `particleCap`**——现在改成 `Fx.explode()`,专门"让死亡粒子也进全局预算,而不是绕过去"。`Fx` 构造函数里额外建了第 4 个常驻 emitter(`THEME.entity.player` 色)专门给它用(见 G6:这导致文件里"3 个常驻 emitter"的注释已经过期)。
- **什么情况下你该选另一个**:粒子量本来就小、或引擎自带 GPU instancing 时,这套手工预算是过度设计。
- **证据**:`src/game/effects/fx.ts` 全文(尤其 `createEmitter`/`explode`/`burst`/`floatText`/`aliveParticleCount`);`src/game/tuning.ts` 的 `FX` 段;`PlayScene.explodePlayer()`(调用 `fx.explode` 并解释为什么不现建临时 emitter);`docs/qa-checklist.md` 性能一节。

### C6. 为什么 Graphics 一律烘成贴图

- **问题**:星空背景、玩家/碎片/能量点这些视觉元素该怎么画。
- **选择**:在 `BootScene.generateTextures()` 里用 `Graphics.generateTexture` 一次性烘成 `tex-player`/`tex-hazard`/`tex-mote`/`tex-spark`/`tex-starfield` 五张贴图,之后场景里只贴 `Image`。
- **理由(量化,最有说服力)**:Phaser 的 `Graphics` **不缓存几何结果**,WebGL renderer 每帧对每个可见 `Graphics` 整体重跑一遍命令缓冲(只判断命令缓冲是否为空,没有脏检查);而每个 `fillCircle` 内部按固定 `iterStep` 拆成约 100 个点、每个点当场 `new` 一个 `Point`。`MenuScene.drawBackdrop` 的注释给出的量化例子是"46 个圆 ≈ 每帧约 4600 次小对象分配,而主菜单恰好是玩家停留最久的画面"——**注意这个具体数字目前已经和实际代码脱节**(见 G10:`MenuScene` 现在直接复用烘好的共享贴图,不再每帧画,`menuCount: 46` 这个字段也已经没人引用了),但它论证的原理(重画 Graphics 的每帧开销)本身仍然成立,只是引用的具体案例过期了。
- **什么情况下你该选另一个**:形状每帧都在变(充能弧、连击条、时间轴)时就该继续用 `Graphics`——项目里 `hud/Hud`、`hud/PlayerRing`、`hud/RunTimeline` 正是这么做的,它们每帧 `clear()` 重画。判据:**几何是不是每帧都变**。
- **证据**:`src/game/scenes/BootScene.ts` 的 `generateTextures`/`makeGlowCircle`/`makeStarfield`;`src/game/objects/Backdrop.ts`;反向例子 `src/game/hud/Hud.ts`/`PlayerRing.ts`/`RunTimeline.ts`。

### C7. 为什么一个 Tween 要驱动一组 targets,而不是逐个建

- **问题**:死亡序列里要把场上十几到二十几个实体同时变暗,该怎么写。
- **选择**:`PlayScene.dimAllExcept()` 把所有存活的 hazard/mote(排除凶手)放进**同一个** `tweens.add({ targets: [...] })`。
- **理由**:逐个 `add` 就是 N 个独立的 Tween 对象(各带自己的 `TweenData` 数组和 easing 引用),而这一帧恰好和 hitstop 解除、玩家爆炸粒子生成、震屏同时发生——**玩家最想要丝滑的那一帧,也是他决定要不要再来一局的那一帧**。
- **什么情况下你该选另一个**:每个目标的时长/延迟/缓动各不相同、合不到一个 tween 里时,该改成一个代理对象驱动的 tween + `onUpdate` 手动分发给各个目标。
- **证据**:`src/game/scenes/PlayScene.ts` 的 `dimAllExcept()`。

### C8. 冲击波清场为什么"先停 body、再错峰回收"

- **问题**:一次冲击波清掉一片碎片时,视觉/听觉上怎么表现"数量感",同时不能让已经"清掉"的碎片继续伤害玩家。
- **选择**:命中的 hazard 立即 `disableBody(false, false)`(停止移动和碰撞,但**保持可见**),按到玩家的距离排序后,第 i 个延迟 `i * PULSE.clearStaggerMs` 才播粒子 + 缩到 0 + 真正回收(`PlayScene.staggeredClear`),同一时刻播一次上行琶音 `audio.pulseHit(i)`。
- **理由**:不先停 body 的话,清场这段时间里这些碎片还能撞死玩家;错峰把"数量"变成可听可见的节奏,而不是一帧内全部消失。复活清场复用同一套表现(不给分),让玩家觉得那段广告换来的是一次真实的爆炸。
- **这里有一个本项目自己踩过的坑**(见反面教材 F3):`staggeredClear` 用 `time.delayedCall` 的闭包持有了一个已经被 `disableBody`(也就是已经"归池")的对象引用。
- **证据**:`src/game/scenes/PlayScene.ts` 的 `onPulse()`/`staggeredClear()`/`revive()`;`src/game/tuning.ts` 的 `PULSE.clearStaggerMs`/`clearShrinkMs`。

### C9. 震屏强度为什么要硬上限

- **问题**:清场数量越多,震屏该不该无限加大。
- **选择**:`effects/feel.shake()` 内部把强度截断到 `FEEL.shakeIntensityCap`;冲击波的震屏强度按命中数插值,但封顶在 `PULSE.shakeCapIntensity`(低于 `FEEL` 的硬上限)。
- **理由**:Phaser 的震屏强度是**画布高度的比例**,不是像素,所以不过 `u()`;CrazyGames 大量用户是笔记本触控板和手机,幅度再大就读不出碎片位置——**在躲避游戏里,遮挡信息的"手感"是负收益**。
- **什么情况下你该选另一个**:格斗/割草类游戏里,遮挡信息不太影响可玩性,上限可以放宽。判据:**这一帧玩家还需不需要读屏做决策**。
- **证据**:`src/game/effects/feel.ts` 的 `shake()`;`src/game/tuning.ts` 的 `FEEL.shakeIntensityCap`/`PULSE.shakeCapIntensity`/`DEATH.shakeIntensity`;`PlayScene.onPulse()` 里震屏强度的插值公式。

---

## D 组 · 交付、平台与生命周期

### D1. 为什么把架构约束写成会 `exit 1` 的脚本,而且这个脚本本身也在演化

- **问题**:分层边界怎么防止被悄悄突破。
- **选择**:`scripts/check-boundaries.mjs` 把"哪层不许依赖谁"写成正则断言,接进 `npm run build` 的第一道门。
- **理由**:文档会过期(见 G 节 14 条矛盾),而这个项目的价值很大一部分建立在分层边界上;边界被突破不会有任何人发现,直到下一款游戏复用时才痛。
- **这个脚本本身经历过一次设计迭代,值得对比着学**:更早的版本只有"规则本身",外加一段统计"没被任何规则看过的目录、报告覆盖率"的"元断言",用来防止"规则和目录结构脱节却仍然报告全部通过"。**现在的版本换了一种更直接的机制**:`walk()` 函数在某条规则指向的目录不存在时**直接 `console.error` 并 `process.exit(1)`**,而不是静默 `catch(() => [])` 返回空数组——脚本注释原话是"原来这里写的是 `readdir(dir).catch(() => [])`,后果是:规则点名的目录一旦被删掉或改名,这条规则会扫到 0 个文件、打一个 ✓、`exit 0`——护栏瞎了,但它报告自己很健康。这比没有护栏更危险。门禁的第一要务是能发现自己失效"。同时脚本头部现在明确写"规则刻意只有四条——每条教一个不同的点,而不是追求覆盖率。十条规则、100% 覆盖率,不如四条规则、四个能说清楚的理由"——也就是说,以前那种"报告扫描覆盖率"的思路被主动放弃了,改成用更小的规则集 + "目标目录必须存在"这条更硬的断言来防止同一类问题。
- **什么情况下你该选另一个**:规则会频繁变动、或团队还在探索分层时,硬门禁会变成"每次改架构先改门禁"的摩擦,那时先用 lint warning 或非阻塞 CI 检查。另外,正则匹配 `import` 行只能挡直接依赖,挡不住"通过第三个模块间接依赖",要更严就得上 `dependency-cruiser`/`madge` 这类图分析工具。**如果你选择"只写四条规则、不追求覆盖率"这条路,记得像这个脚本一样,把"规则目录必须存在"这条元检查也一起搬,不然规则集越写越少,反而更容易被沉默地绕过。**
- **证据**:`scripts/check-boundaries.mjs` 全文(尤其 `walk()` 函数头部注释与 `RULES` 数组头部注释);`package.json` 的 `build`/`check:boundaries` 脚本;实跑 `node scripts/check-boundaries.mjs` 输出"✓ 依赖边界完好",四条规则全绿。

### D2. 为什么提交包检查也写成脚本

- **问题**:CrazyGames 的体积/文件数/路径要求,怎么在本地就能发现问题。
- **选择**:`scripts/build-zip.mjs` 硬断言总体积 ≤250MB、文件数 ≤1500、初始下载 ≤50MB(移动端推荐位另提示 ≤20MB)、`index.html` 里不许有绝对路径,再打 zip,且用 `archive.directory(DIST, false)` 保证 `index.html` 在 zip 根目录。
- **理由**:让问题在本地暴露,而不是上传后被平台退回;绝对路径是上传后白屏的头号原因。
- **诚实点**:"初始下载"是**近似值**(`index.html` 自身 + 它直接引用的 js/css),脚本注释自己写明"这是近似值,但足以在体积失控时提前报警"——把近似说清楚比假装精确更有用。
- **什么情况下你该选另一个**:目标平台没有体积门槛时这套是浪费;但"打包产物结构断言"(根目录、相对路径)几乎所有 web 交付都值得抄。
- **证据**:`scripts/build-zip.mjs` 全文(阈值定义、`initialBytes` 近似算法、绝对路径正则、`archive.directory` 调用);实跑结果:3 个文件、总体积 1.20 MB、初始下载 1.20 MB、相对路径检查通过,`submissions/pulse-dodger.zip` 实际生成 334373 B ≈ 326.5 KB。

### D3. 为什么零外部素材

- **问题**:美术和音效资源从哪来。
- **选择**:所有贴图 `Graphics.generateTexture` 程序生成(见 C6),所有音效 WebAudio 振荡器 + 白噪声 buffer 合成(`effects/audio.ts`),连音频文件都没有。
- **理由三条**:①零 license 风险,提交包里不存在任何来源不明的资源,`docs/asset-license.csv` 五行记录全是 `generated-in-code`/`N/A-self-made`;②包体几乎不增加,直接满足初始下载门槛;③顺带给"响应平台静音开关"这件必做的事一个真实的验证目标——没有声音就测不出静音接没接对。
- **实测代价**:最终 `dist/` 3 个文件合计约 1.20 MB,其中 Phaser 引擎本体 `assets/phaser-*.js` 就占了 1194877 B,几乎是全部体积。**该带走的判断**:零素材省的不是包体(引擎才是大头),省的是法务和流程。
- **什么情况下你该选另一个**:玩法依赖美术辨识度时这条根本不成立;合成音效也做不出人声/音乐。判据:**你的差异化在不在美术上**。
- **证据**:`src/game/scenes/BootScene.ts` 的 `generateTextures`;`src/game/effects/audio.ts` 全文;`docs/asset-license.csv`;实测 `dist/` 三文件体积(见第 0 节表格)。

### D4. 为什么加载遮罩要有 300ms 阈值、且平台提供时不画

- **问题**:游戏加载期间怎么给玩家反馈,又不显得突兀。
- **三条决策打包成一条**:
  1. **必须是 DOM,不能是 Phaser 场景**——最长的一段等待发生在 Phaser 自己(约 1.1MB)还没解析完的时候,那时场景根本不存在,画不出任何东西。
  2. **低于 300ms 不显示**——加载只要 80ms 却闪一下遮罩,视觉上像 bug;实现是 `window.setTimeout(300ms)` 到点才把 `hidden` 置为 `false`,`finish()` 里先 `clearTimeout`。
  3. **平台已经画了就别画**——由 `capabilities.platformProvidesLoadingUI` 决定,而不是发行前手动删代码。
- **什么情况下你该选另一个**:加载稳定超过 2 秒的项目,阈值应该降到 0 并改成"骨架屏 + 真实进度";阈值机制本身在"加载时长方差大"时最有价值,在"总是很慢"或"总是很快"时都没意义。
- **证据**:`src/dom/LoadingOverlay.ts` 全文(`SHOW_THRESHOLD_MS`/`start`/`finish`);`src/main.ts` 的 `bootstrap()`;`index.html` 里 `#loading-overlay` 的默认 `hidden` 属性。
- **附一处死代码**(见 G 节附录):`LoadingOverlay.label` 这个静态 getter 想把加载文案统一到 `THEME.copy.loading`,但没有任何调用方,`index.html` 里的文案是硬编码的"加载中"。

### D5. 为什么不用 `Phaser.Core.Events.READY` 关闭加载遮罩

- **问题**:"引擎准备好了"和"游戏内容真的能看了"是不是同一件事。
- **选择**:`BootScene.create()` 末尾 `this.game.events.emit('boot-complete')`,`src/main.ts` 监听这个自定义事件来关闭遮罩;进度靠 `Loader.Events.PROGRESS` 转发成 `'boot-progress'`。
- **理由(源码核对)**:Phaser 源码 `core/Game.js` 的 `texturesReady` 方法里,`this.events.emit(Events.READY)` 发生在调用 `this.start()` **之前**——也就是说,`READY` 事件在任何场景的 `preload`/`create` 跑之前就已经发出。现在项目零素材,看不出问题,一旦 `BootScene.preload()` 开始真实加载素材,用 `READY` 关闭遮罩会导致遮罩在素材真正开始下载前就消失。
- **这条决策的教学价值在于"现在看不出问题"**:它是一个已经被写进代码但还没被现象触发的定时炸弹,是靠读源码而不是靠现象发现的。
- **什么情况下你该选另一个**:如果你只是想知道"引擎初始化完了"(比如埋点),`READY` 正是对的事件。判据:**你要的是引擎就绪还是内容就绪**。
- **证据**:`src/main.ts` 的 `bootstrap()` 里对 `'boot-complete'`/`'boot-progress'` 的监听及旁边的注释;`src/game/scenes/BootScene.ts` 的 `preload`/`create`;Phaser 源码 `core/Game.js` 的 `boot`/`texturesReady`/`start` 三个方法(`texturesReady` 里先 `emit(Events.READY)` 再调用 `this.start()`)。

### D6. 为什么 UI 要由平台能力位驱动

- **问题**:同一份代码要在 CrazyGames 和自托管环境跑,UI 该怎么自动适配。
- **选择**:`PlatformCapabilities` 里两类标志位要分开理解——"能不能"类(`interstitialAds`/`rewardedAds`/`banners`/`cloudSave`)和"平台是不是已经替你做了"类(`platformProvidesAudioToggle`/`platformProvidesLoadingUI`)。
- **理由**:后一类的意义是"同一份 UI 代码在不同平台上自动决定画不画,而不是每次发行前手动删一遍"。两个静音开关会互相打架,两个加载动画会闪两次。
- **落地链条(建议画成一条链来记)**:`capabilities.platformProvidesAudioToggle` → `SettingsScene.settingsRows()` 过滤掉音效行 → 过滤后为空数组 → `MenuScene.createSettingsEntry()` **连设置入口按钮都不画** → 同时 `PauseController.pause()` 里暂停面板从 3 个按钮变 2 个 → 结果:CrazyGames 上暂停面板 2 个按钮、自托管 3 个,零手改。
- **配套约束**:`effects/audio.ts` 里三个静音来源(`platformMuted`/`userMuted`/`adMuted`)必须分开存三个 boolean,合成一个就会出现"玩家在游戏内开了声音,把平台的静音覆盖掉";`isMuted` 是三者的 `or`。用户偏好只在平台不提供开关时才读存档(`bindPlatformSettings`)。
- **什么情况下你该选另一个**:能力位只在"平台差异是永久的"时值得抽;如果差异只是临时的(某平台还没上线某功能),用 feature flag/配置更合适,否则能力位会越堆越多变成配置沼泽。另外 `SettingsScene` 保留了 `rows.length === 0` 时的兜底文案("当前平台已提供音量控制"),理由是万一被直接 `scene.start('Settings')` 跳过入口按钮的过滤——这是"入口藏了但页面仍需自洽"的通用判断。
- **证据**:`src/platform/PlatformAdapter.ts` 的 `PlatformCapabilities` 接口;`src/platform/adapters/crazygames.ts`/`web.ts` 的 `capabilities` 字段;`src/game/scenes/SettingsScene.ts` 的 `settingsRows()`;`src/game/scenes/MenuScene.ts` 的 `createSettingsEntry()`;`src/game/overlays/PauseController.ts` 的 `pause()` 里对 `platformProvidesAudioToggle` 的判断;`src/game/effects/audio.ts` 的 `platformMuted`/`userMuted`/`adMuted`/`isMuted`。

### D7. 为什么激励视频的返回值必须是一个 boolean

- **问题**:插屏广告和激励视频的回调,该怎么统一成游戏侧好用的接口。
- **选择**:`showRewarded(reason): Promise<boolean>`——`adFinished` → `true`(发奖),`adError` → `false`(不发奖);`showInterstitial(reason): Promise<void>`——两种回调**都 resolve**,因为对插屏而言"播完了"和"没库存"处理方式相同:结束等待,让游戏继续。
- **理由**:`adError` 同时代表"播放出错"和"根本没有广告库存"。把 `adError` 当成功会白送奖励,漏掉 `adFinished` 会该发不发——**这是整个适配层最不能写错的一行**,而且它是**语义差异而非错误处理差异**:同一种回调,在 rewarded 里必须区分,在 interstitial 里必须合并。
- **配套契约**:广告期间必须暂停 + 静音,由**调用方在外层做**(官方要求),不在 adapter 里回调进游戏循环。`ReviveFlow.offer()` 用 `try/finally` 保证无论成败都撤静音,并且用 `scene.scene.pause()`(整场景暂停)而不是 `physics.pause()+tweens.pauseAll()`——理由是后者是共享布尔开关,会和 `PauseController`/`feel` 抢状态(见 C4)。`ResultScene.restart()` 同样是"静音 + `scene.pause()`":只静音的话,插屏播放期间结算页的滚分和进度条 tween 还在跑,广告结束回来动画已经演完了,玩家等了十几秒回来什么都没看到。
- **什么情况下你该选另一个**:如果平台 SDK 已经把"看完"和"出错"分成两个独立的 Promise 分支(有些 SDK 是 reject),就别硬转 boolean,保留异常语义更准。判据:**调用方是否需要区分"为什么没看完"**——这里不需要,所以 boolean 是最小够用的类型。
- **证据**:`src/platform/PlatformAdapter.ts` 的 `showRewarded`/`showInterstitial` 接口注释;`src/platform/adapters/crazygames.ts` 的 `showRewarded`/`showInterstitial` 实现;`src/platform/adapters/web.ts` 的 `showRewarded`("本地环境没有看完这件事,一律不发奖");`src/game/overlays/ReviveFlow.ts` 的 `offer()`;`src/game/scenes/ResultScene.ts` 的 `restart()`;`docs/qa-checklist.md` 广告一节。

### D8. 为什么场景切走必须解绑全局监听(以及这条规矩目前执行到什么程度)

- **问题**:Phaser 场景反复 `scene.start()` 重启,监听不解绑会怎样。
- **选择**:凡是往 `game.events`(跨场景)或 `scene.events`(随 `scene.start` 重启但不清空)上挂的监听,都要在 `Scenes.Events.SHUTDOWN` 里 `off`。
- **理由**:后端里请求结束一切自动回收,游戏里没有这个保障。Phaser 场景切走后 `game.events` 上的监听不会移除,不解绑的话下次进场景会重复注册,"失焦一次弹出多个面板";`Systems.shutdown()` 也**不会**清空 `scene.events`(只有 `destroy()` 才 `removeAllListeners`),而 `PlayScene` 是反复 `scene.start()` 重启的,不解绑的闭包会活到下一局,在新一局第一帧就满足条件执行。
- **什么情况下你该选另一个**:一次性场景(只进一次的 `Boot`)不解绑也不会出问题;`once` 绑定在触发后自动移除,但**没触发就切走的 `once` 仍然会泄漏**。判据:**这个场景会不会被再次 `start`**。
- **本项目当前的实际执行情况(不要假设它已经做全了)**:`PauseController.bindAutoPause()` 对 `BLUR`/`VISIBLE` 有完整的 `SHUTDOWN` 解绑;`effects/feel.ts` 的 `afterUnscaledDelay` 也有完整解绑(且当前 `tsc` 通过,见 G3);`PlayScene.scheduleAt()` **目前没有对应的 `SHUTDOWN` 解绑**——它只在死亡序列里两个固定延时点使用,两次回调都会在场景真正切走之前触发,所以还没有观察到问题,但如果以后有人往这个方法上叠加新的用法,这里就是一个潜在的泄漏点。
- **证据**:`src/game/overlays/PauseController.ts` 的 `bindAutoPause()`;`src/game/effects/feel.ts` 的 `afterUnscaledDelay()`;`src/game/scenes/PlayScene.ts` 的 `scheduleAt()`。

### D9. 失焦自动暂停的推理:为什么 `BLUR` 和 `VISIBLE` 都要接管

- **问题**:窗口失去焦点/切标签页时,游戏该不该自动暂停。
- **选择**:同时监听 `Phaser.Core.Events.BLUR` 和 `Phaser.Core.Events.VISIBLE`,都触发 `pause(true)`(带"窗口失去焦点,已自动暂停"的副标题);恢复必须玩家自己点"继续"。
- **理由(源码核对)**:Phaser 源码里,切标签页(`HIDDEN`)时 `Game.onHidden` 会自己调用 `this.loop.pause()`,游戏事实上停住了;点到别的窗口(`BLUR`)时 `TimeStep` 只设 `inFocus = false`,**游戏继续跑**——`BLUR` 才是真缺口。而 `HIDDEN` 虽然引擎停了循环,但 `Game.onVisible` 会在标签页切回来时立刻 `this.loop.resume()`,玩家还没反应过来就要操作,所以也要接管(代码接的是 `VISIBLE`,即"回来那一刻"把游戏按住)。
- **暂停两个入口的价值排序**:主动(玩家按 ESC,他知道自己按了)vs 被动(窗口失焦,玩家毫不知情)——**被动的那个更重要**。
- **配套的平台义务**:暂停期间调用 `platform().gameplayStop()`,恢复时 `gameplayStart()`,否则平台数据会虚高。
- **什么情况下你该选另一个**:回合制/非实时游戏不需要这套;需要挂机收益的游戏反而要反过来(失焦继续跑)。
- **证据**:`src/game/overlays/PauseController.ts` 的 `bindAutoPause()`/`pause()`;Phaser 源码 `core/TimeStep.js`(`blur`/`inFocus`)、`core/Game.js`(`onHidden`/`onVisible`/`onBlur` 三个方法)。

### D10. 转场为什么用 Camera fade + 事件,而不是黑矩形 + 掐时间

- **问题**:场景之间的淡入淡出该怎么实现。
- **三条子决策**:
  1. **用 `cameras.main.fadeOut`/`fadeIn` 不手搓黑矩形**:黑矩形挡不住 depth 更高、或属于别的 Camera/DOM 层的东西;会和场景内对象自己的 alpha 动画(比如 `revive()` 里玩家的无敌闪烁)互相踩踏;它是场景树里的普通 GameObject,受 `tweens.pauseAll()`/`time.paused` 影响,场景暂停时转场跟着卡住。Camera fade 是渲染管线最后一步,不属于场景对象树,天然由毫秒插值驱动。
  2. **`fadeOut` 之前必须 `scene.input.enabled = false`**:fade 不阻塞也不屏蔽输入,200ms 内玩家再点一下会触发第二次 `fadeToScene`,两次 `FADE_OUT_COMPLETE` 监听会先后各 `scene.start()` 一次,目标场景 `shutdown → init → create` 跑两遍——在 `Result`/`Settings` 这类会调用 `platform().showBanner()`/`showInterstitial()` 的场景上,意味着广告或横幅被请求两次。
  3. **用 `FADE_OUT_COMPLETE` 事件而不是 `delayedCall(FADE_OUT_MS)` 猜时长**:`delayedCall` 受 `time.paused` 影响,和相机 fade 不保证同步。
- **对称的反面**:暂停面板不能用 camera fade 做出入场动画——camera fade 对整个 Camera 输出叠色,面板也会一起被淡黑,结果是"全屏黑一下,面板忽然出现"。`ui/Panel.ts` 必须用自己 `Container` 的 scale+alpha tween。**判据:你要淡的是"整个画面"还是"画面里的一个东西"**。
- **什么情况下你该选另一个**:如果转场期间还需要玩家能取消(比如长按退出),就不能一刀切禁用输入。
- **证据**:`src/game/scenes/transition.ts` 全文(`fadeToScene`/`fadeInScene`);`src/game/ui/Panel.ts` 的入场/退场 tween。

### D11. SDK 为什么留在 `index.html`、类型为什么手写、以及为什么只声明用到的部分

- **问题**:CrazyGames SDK 没有 npm 包也没有官方类型,怎么接。
- **选择**:`<script src="https://sdk.crazygames.com/crazygames-sdk-v3.js">` 留在 HTML,不 import 进 bundle;类型靠手写 `src/platform/crazygames.d.ts`;`window.CrazyGames` 声明成可选(`CrazyGames?: { SDK: CrazyGamesSDK }`)。
- **理由**:平台要求 SDK 由平台侧脚本提供,打进 bundle 会拿不到真实 iframe 环境;不声明类型的话 `window.CrazyGames` 直接编译失败(`TS2339`)。可选类型是因为"SDK 没加载完/不在 CrazyGames 环境"时它确实是 `undefined`——这个可选性正是 `initPlatform()` 做环境探测的依据。
- **值得单独学的一条小决策**:`crazygames.d.ts` 只声明本项目实际用到的模块(`game`/`ad`/`banner`/`data`/`user` 里用到的方法),用不到的(购买、排行榜、多人房间)故意不写——"声明了却不用,反而会让人以为已经接好了"。
- **什么情况下你该选另一个**:SDK 有官方类型时当然直接用;如果要给团队多个项目共用,该把 `.d.ts` 抽成内部包并写全。
- **证据**:`index.html` 里的 `<script>` 标签与注释;`src/platform/crazygames.d.ts` 全文。

### D12. `WebAdapter` 是平等实现而不是兜底;`init()` 失败就抛

- **问题**:没有 CrazyGames SDK 的环境(本地开发、其他托管平台)怎么处理。
- **选择**:`initPlatform()` 只在启动时判断一次"`window.CrazyGames?.SDK` 在不在",选定后**不再互相回退**;`adapter.init()` 失败直接抛;`platform()` 在初始化前被调用也直接抛。
- **理由**:这是**环境探测**,不是异常兜底。一旦选定 `CrazyGamesAdapter`,后续 SDK 出错就该原样抛出去——init 失败意味着后续所有平台调用的结果都不可信,不能假装成功继续跑。`src/main.ts` 的启动顺序(先 `initPlatform()` 再 `new Phaser.Game`)是同一条推理:反过来的话 `BootScene` 里的 `platform()` 会拿不到 adapter。
- **什么情况下你该选另一个**:如果平台 SDK 经常抽风而游戏又不依赖它的关键路径,静默降级是合理的。判据:**降级之后玩家还能玩吗、你还能发现问题吗**。
- **证据**:`src/platform/index.ts` 的 `initPlatform()`/`platform()`;`src/platform/adapters/web.ts` 文件头("这不是兜底,是平等的目标平台实现");`src/platform/adapters/crazygames.ts` 的 `init()`;`src/main.ts` 的 `bootstrap()`。

### D13. 存档 API 为什么保持同步

- **问题**:`save`/`load` 要不要包成 Promise。
- **选择**:同步接口:`save(key, value): void`、`load(key): string | null`。
- **理由**:CrazyGames 的 `data` 模块 API 形状与 `localStorage` 一致、本身就是同步的,强行包成 Promise 只会让调用方多写无意义的 `await`,还会把 `GameState` 的构造函数(要读最高分)污染成异步。
- **什么情况下你该选另一个**:换成真正的网络云存档时必须异步,那时 `ScoreRepository` 的签名要一起变——这正是"接口按当前真实实现建模,而不是按想象中的未来建模"的例子,接口在,改起来是一处。
- **证据**:`src/platform/PlatformAdapter.ts` 的 `save`/`load` 注释;`src/platform/crazygames.d.ts` 的 `data` 模块;`src/game/core/GameState.ts` 构造函数直接同步读 `scores.loadBestScore()`。

### D14. 插屏广告节奏为什么抽成 `core/` 里的纯函数

- **问题**:第几局开始打插屏广告,这条规则该放在哪。
- **选择**:`core/adCadence.ts` 的 `shouldShowInterstitial(runsPlayed) = runsPlayed > 1 && runsPlayed % 3 === 0`,有专门的测试文件。
- **理由**:这是**变现策略**不是 UI 细节,换游戏必调、也最值得单测;第一局就塞广告是最伤新玩家留存的做法。调用约定:`GameState.finish()` 已经自增过 `runsPlayed`,传进来的是"这一局结束后总共玩了几局"。
- **测试文件里的一句注释是这条决策的灵魂**:专门防"改动时不小心让第一局也弹广告"这种伤留存的回归。
- **什么情况下你该选另一个**:节奏依赖服务端实验/分层配置时,就不该硬编码在客户端纯函数里。
- **证据**:`src/game/core/adCadence.ts` 全文;`tests/adCadence.test.ts`(实跑 3 个测试全过);`src/game/scenes/ResultScene.ts` 的 `restart()`。

---

## E 组 · 玩法数值里的可迁移判断

### E-a. 连击(combo)加分,但不加充能

- **问题**:连击倍率要不要同时影响分数和充能。
- **选择**:`GameState.collectMote()` 里,得分乘连击倍率,充能固定加 `MOTE.chargePerMote`,不乘倍率。
- **理由**:如果充能也跟着倍率走,后期高倍连击会让冲击波唾手可得,彻底失去稀缺性,也让 graze 路线相形之下毫无意义。**一个乘数只该作用在一条曲线上**。
- **什么情况下你该选另一个**:如果"连击"本身就是你想突出的核心爽点(而不是"充能"这条资源线),让它同时影响多条曲线也合理——判据是这个乘数到底想放大哪一种行为的收益。
- **证据**:`src/game/core/GameState.ts` 的 `collectMote()`;`tests/comboGraze.test.ts` 里"得分随连击倍率放大,但充能不乘倍率"这条测试。

### E-b. graze 和吃点两条路线的经济性推算,以及"数值不动"本身也是一个决策

- **问题**:擦身而过(graze)和吃能量点(mote)两条充能路线,会不会一条完全碾压另一条。
- **选择**:`GameState.grazeHazard()` 的注释里有完整推算:难度曲线后期(90 秒封顶后)危险物入场速率约 7.7 个/秒,假设玩家能贴近其中 30%(约 2.3 次/秒 graze),每次 +3 充能 → 约 6.9 充能/秒,充满 100 充能约需 14.5 秒;同期吃点路线约 12 充能/秒,约 8.3 秒充满。两条路线相差约 1.5~1.7 倍、同一量级,且 graze 风险显著更高,结论是**不调整** `GRAZE` 常量。
- **该带走的判断**:"数值不动"也是一个需要论证的决策,不是"没空改"的默认状态——这是项目里少数几处把"为什么不改"明确写下来的地方。`GRAZE.radius` 的推导同样有据:接触距离 = `PLAYER.radius + HAZARD.radius`,graze 半径取接触距离的 2 倍,让"擦身带宽"正好等于一个碎片的直径。
- **什么情况下你该选另一个**:如果你的项目里两条资源路线的比例只是"大概拍的",而不是像这里一样有具体的速率推算,建议在改动前先把类似的推算写下来,而不是靠感觉调整——推算错了也比没有推算更容易被后来者发现和纠正。
- **证据**:`src/game/core/GameState.ts` 的 `grazeHazard()` 注释;`src/game/tuning.ts` 的 `GRAZE`/`MOTE`/`PULSE` 定义。

### E-c. 难度曲线的常量为什么要导出,而不是让 UI 侧镜像一份

- **问题**:`RunTimeline` 需要知道难度爬坡的总时长和双发时刻,这两个数该写在哪。
- **选择**:`core/difficulty.ts` 导出 `DIFFICULTY_RAMP_SECONDS`/`DOUBLE_SPAWN_SECONDS`,`hud/RunTimeline.ts` 直接 import 使用,而不是自己写一份等价的数字,更不能写成 `RUN_DURATION_SECONDS * 0.5` 这种"巧合表达式"。
- **理由**:45 秒恰好是 90 秒的一半是**当前数值下的巧合**,一旦把双发时刻单独调到 40 秒,用 `* 0.5` 算出来的刻度还会停在 45,预告和实际脱节,而且不会有任何报错。
- **该带走的判断**:跨模块共享的不该是数值,而是常量的身份;巧合关系是最隐蔽的一种重复。
- **证据**:`src/game/core/difficulty.ts` 的 `DIFFICULTY_RAMP_SECONDS`/`DOUBLE_SPAWN_SECONDS`;`src/game/hud/RunTimeline.ts`(见 G5,这里两段注释一度自相矛盾,现在代码已经是 import 而不是镜像)。

### E-d. 三个缓冲窗为什么必须同时推迟 hazard 和 mote,但开局宽限期是刻意不对称的

- **问题**:暂停恢复、复活、开局这几个"玩家刚拿回控制权"的时刻,危险物和能量点的生成节奏该怎么处理。
- **选择**:`tuning.ts` 的 `RUN.resumeBufferMs`/`reviveBufferMs`/`introGraceMs`/`firstRunGraceMs`,配合 `PlayScene.bumpSpawnBuffer()` 一次性同时推迟 `hazards`/`motes` 两个生成器的下一次生成时间。**但开局宽限期只推迟 hazard,不推迟 mote**。
- **理由**:暂停恢复/复活这两个时刻,如果只推迟 hazard 而不推迟 mote,玩家点"继续"的瞬间仍可能被一颗刚好生成在原地的能量点旁边的碎片撞死;开局宽限期则相反——能量点对玩家有利,没有理由跟着延后。
- **该带走的判断**:"统一处理"和"区别对待"的分界是**收益方向**,不是表面上的对称性——同一类"缓冲窗"概念,具体要不要对称取决于它推迟的东西对玩家是好是坏。
- **证据**:`src/game/tuning.ts` 的 `RUN` 段;`src/game/scenes/PlayScene.ts` 的 `bumpSpawnBuffer()`(暂停恢复/复活时同时推迟)与 `create()` 里 `this.hazards.holdFor(...)`(开局宽限期只推迟 hazard)。

---

## F 节 · 反面教材

统一写法:**现象 → 根因(源码级)→ 为什么类型检查/测试/构建全都抓不到 → 怎么才能抓到**。这一节没有一条会让程序抛异常——**不崩溃的 bug 才是贵的**,因为没有任何自动化手段会主动报告它们的存在。

### F1. `fixedWidth: undefined` 把按钮画在 NaN 坐标上

- **现象**:`npm run build` 五道门全绿、测试全过、类型检查干净,但某个按钮根本没渲染出来。
- **根因链**:给 `Text` style 传 `fixedWidth: options.fixedWidth`,如果 `options.fixedWidth` 是 `undefined`,style 对象上会留下一个**值为 `undefined` 的自有属性**。Phaser 源码 `utils/object/GetValue.js` 用 `source.hasOwnProperty(key)` 判断"有没有传这个键",显式 `undefined` 能通过这个判断,于是返回 `undefined` 而不是默认值 0;而 `gameobjects/text/Text.js` 的文本更新逻辑只在 `style.fixedWidth === 0` 时才给 `this.width` 赋值——于是 `width` 恒为 `undefined`,`setOrigin(0.5)` 算出 `NaN`,整个对象被画在 NaN 坐标上。
- **为什么全抓不到**:`fixedWidth?: number` 在类型上完全合法,`tsc` 不报;对象存在、不崩溃,所以测试不抓;构建产物正常,所以 build 绿。**这是"自动化检查"覆盖范围的边界:它们证明的是"代码能跑",不是"画面画出来了"。**
- **修复姿势**:`ui/Button.ts` 现在按需拼装 style 对象,只有 `options.fixedWidth !== undefined` 时才把这个键放进去,不传就完全不放这个属性。
- **可迁移判断**:凡是把可选参数透传给第三方 API,先确认对方判断"没传"用的是 `hasOwnProperty` 还是 `=== undefined` 还是 `in`——三种判断对"显式传了 undefined"这件事的结论完全不同。
- **唯一的抓法**:实际截图看每个场景(`docs/qa-checklist.md` 专门有"界面完整性"一节)。
- **证据**:`src/game/ui/Button.ts` 的 `constructor`;Phaser 源码 `utils/object/GetValue.js`(`hasOwnProperty` 判断)、`gameobjects/text/Text.js`(`style.fixedWidth === 0` 才赋值 `this.width`)。

### F2. `killAndHide()` 不碰物理 body,尸体继续参与碰撞

- **现象**:玩家撞到看不见的东西死掉。
- **根因**:Phaser 源码 `gameobjects/group/Group.js` 的 `killAndHide` 方法只做 `setActive(false)` + `setVisible(false)`,完全不碰 Arcade body,回收后的对象仍然留在碰撞检测里。必须用 `disableBody(true, true)`。
- **为什么抓不到**:名字里有"kill",语义上像"销毁";类型完全正确;渲染上确实消失了,肉眼验证也会通过——唯一的症状就是"玩家莫名其妙死了"。
- **可迁移判断**:引擎里"显示"和"物理"往往是两套独立的生命周期,任何一个听起来像"销毁/隐藏"的 API,都要先确认它到底动的是哪一套。
- **证据**:`src/game/objects/HazardSpawner.ts`/`MoteSpawner.ts` 的 `despawn()`(都用 `disableBody(true, true)`);Phaser 源码 `gameobjects/group/Group.js` 的 `killAndHide` 方法。**注意**:`HazardSpawner.ts` 类头注释把这个方法的出处写成了 `gameobjects/components/Actions.js`/`GameObject.js`,实际在 `group/Group.js`——出处写错了,结论没错(见 G8)。

### F3. 池化后用 `delayedCall` 持有对象引用(项目里目前还有一处在犯)

- **现象**:偶尔有能量点/碎片自己消失,极难复现,取决于对象什么时候恰好被复用。
- **根因**:池化**之前**,`this.time.delayedCall(8000, () => { if (mote.active) mote.destroy(); })` 是安全的写法——`destroy()` 之后 `active` 恒为 `false`,回调自动失效。池化**之后**,同一个 JS 对象会被 `group.get()` 反复复用成完全不同的实体,原来那个闭包 8 秒后触发时,`mote.active` 完全可能是 `true`(它已经代表了一个刚生成不久的全新对象),回调会把一个活着的新对象直接缩没/销毁。
- **为什么抓不到**:类型完全正确;逻辑在池化前是对的,是"周围环境变了"让一段没动过的代码变错;概率性触发,单元测试覆盖不到。
- **正确姿势**:把过期时间戳写进对象自己身上(`setData('expiresAt', ...)`),在 `update()` 里遍历当前活跃成员,按时间戳判断是否该回收——判断依据永远是"这个对象此刻自己身上的数据",不是闭包捕获的、可能早就代表了别的实体的对象引用。`MoteSpawner` 已经这样修好了。
- **现存的同类问题(全项目最好的教学材料,因为它现在还存在)**:`PlayScene.staggeredClear()` 里,命中的 hazard 先 `disableBody(false, false)`(此时它已经变成池里可被复用的对象),再用 `this.time.delayedCall(i * PULSE.clearStaggerMs, () => { ...对 h 播放 tween、despawn(h) })` 的闭包持有它。理论上在这几十到几百毫秒之间,`HazardSpawner.spawnOne()` 完全可能把同一个对象取走复用,随后这个延时回调会把一个活着的新碎片缩到 0 并强制回收。**"不许用 `delayedCall` 持有池化对象"这条规矩写在 `MoteSpawner.ts` 的文件头,而真正违反它的代码在 `PlayScene.staggeredClear()`。规矩写在受害者那里,没写在加害者那里。**
- **可迁移判断**:规矩要写在"会违反它的地方",不只是写在"最初发现它的地方";引入对象池不是一次局部优化,它会让所有持有对象引用的异步代码的正确性前提整体失效——换了一种资源管理方式之后,原来所有假设"对象要么活着要么已经死了"的异步代码都要重新审查一遍。
- **证据**:`src/game/objects/MoteSpawner.ts` 类头注释与 `spawnOne`/`cullExpired`;`src/game/scenes/PlayScene.ts` 的 `staggeredClear()`。

### F4. 遍历中销毁活数组(池化之后这个问题已经自然消失,但值得知道它曾经存在)

- **现象**:出屏回收时总有一部分碎片漏掉,表现为"有些碎片永远不消失"。
- **根因**:`destroy()` 会对 `group.children` 做 splice,边遍历边销毁会跳过紧随其后的元素。池化前的写法必须先 `.slice()` 拷贝一份快照才安全。
- **这条的真正教学点是它的结局**:池化之后,`disableBody()` 不再从 group 里移除任何元素(只是把对象标成不活跃、留在池里等复用),遍历中修改数组这个问题直接消失,快照拷贝也不再需要。
- **可迁移判断**:换一种资源管理方式,会让一整类 bug 和一整类防御代码同时失效;重构之后要回头删掉不再需要的防御代码,否则它会被后人当成"必须遵守的规矩"继续抄下去。
- **证据**:`src/game/objects/HazardSpawner.ts` 的 `cullOffscreen()`(现在直接遍历 `group.getChildren()`,没有额外的快照拷贝)。

### F5. `Phaser.Core.Events.READY` 早于任何场景的 preload

见 D5。现象、根因、"为什么现在看不出问题"的完整论证已经在 D5 里写清楚,这里不重复。**可迁移判断**:"就绪"是个含糊词,任何框架的 ready 事件都要先问清楚"谁就绪了";并且——**当前看不出问题不等于没问题,尤其当你写的是给未来项目参考的结构时**。

### F6. Phaser 的输入冒泡阻断走第 4 个参数,不是 `pointer.event`

- **现象**:点右上角暂停按钮,同时又放了一次冲击波。
- **根因**:`pointer.event` 是原生 DOM 事件,`stopPropagation()` 只挡 DOM 冒泡,拦不住 Phaser 自己的 input 事件链(`scene.input.on('pointerdown', ...)` 走的是这条链)。必须用回调的第 4 个参数(`Phaser.Types.Input.EventData`)上的 `stopPropagation()`。
- **为什么抓不到**:`pointer.event.stopPropagation()` 完全合法、也确实"执行了",只是挡的是另一套事件系统,没有任何报错或类型提示。
- **可迁移判断**:框架在 DOM 之上重建了自己的事件系统时,DOM 原生的控制手段大概率无效——先确认自己在哪一层。
- **证据**:`src/game/overlays/PauseController.ts` 的 `createPauseButton()` 里对 `event.stopPropagation()` 的调用与注释;对照 `src/game/objects/PlayerController.ts` 场景级的 `scene.input.on('pointerdown', ...)`。

### F7. hitstop 用共享布尔开关 → 玩家看着暂停面板死掉

- **完整触发链(教学价值极高)**:冲击波命中足够多 → 触发一段短暂 hitstop → 如果当时用的是 `physics.isPaused`+`tweens.pauseAll()` 并在固定毫秒后**无条件**写回 `isPaused = false`+`resumeAll()` → 这段 hitstop 期间窗口恰好失焦,触发自动暂停 → 暂停面板弹出 → hitstop 的计时到点,恢复回调照常执行(注意这次暂停并没有 `scene.pause()`,场景的 `update` 照跑)→ 物理世界在暂停面板背后继续步进 → 碎片继续飞 → 玩家看着暂停面板死掉。
- **可迁移判断**:两个互不知情的功能共用同一个布尔开关,等于"谁后恢复谁说了算";把状态从布尔换成数值(`timeScale`)或引用计数,两边就天然不打架。
- **现状**:这条坑已经通过 C4 描述的 `timeScale` 方案修复,当前 `effects/feel.ts` 不再碰 `physics.isPaused`/`tweens.pauseAll()`。
- **证据**:`src/game/effects/feel.ts` 文件头注释里对这条历史 bug 的完整复盘;`src/game/overlays/PauseController.ts` 的 `pause()`/`resume()`(用的是 `scene.physics.pause()`/`scene.tweens.pauseAll()`/`scene.time.paused`,和 `feel.ts` 的 `timeScale` 是两套互不冲突的机制)。

### F8. 转场期间输入没关 → 广告被请求两次

见 D10 第 2 条。**可迁移判断**:异步流程期间,外部还能继续产生新输入,引擎不会替你把这两件事互斥起来。

### F9. `activePointer` 残留 → 开局球自己飞

- **现象**:每帧读 `scene.input.activePointer` 时,场景刚创建残留的是上一个场景最后一次点击的位置(比如 `MenuScene` 按钮的落点),导致开局球自己飞;触屏抬手后 `activePointer` 位置也不会变,球会一直黏在最后触摸点上。
- **修复**:改成自己维护 `followTarget`,只在 `pointermove`/`pointerdown` 事件里更新,`update()` 只读它,不再每帧读 `activePointer`。
- **可迁移判断**:引擎的"当前输入状态"对象往往是跨场景存活的全局单例,不要把它当成"本场景专属的输入状态"。
- **证据**:`src/game/objects/PlayerController.ts` 的 `followTarget` 字段声明与 `update()`/`onPointerMove()`。

### F10. `pauseAll()` 只冻结"当时已存在"的 tween

- **现象**:暂停面板有几率"卡在半透明",进不了完整的入场动画。
- **根因**:`Panel` 的入场 tween 必须在构造函数内**同步**创建。`PauseController.pause()` 的调用顺序是先 `tweens.pauseAll()` 冻结场景里已存在的所有 tween,再 `new Panel(...)`。Phaser 的 `pauseAll()` 只遍历"当时已经存在"的 tween 逐个 pause,构造函数之后才创建的新 tween 不在那次遍历里,天然正常播放。一旦把这两行 tween 挪到 `delayedCall`/下一帧再建,就会错过这个时机窗口,有几率被后续某次 `pauseAll` 连带冻住。
- **可迁移判断**:"暂停全部"类 API 通常是一次性快照而不是持续状态,创建时机本身就是正确性的一部分。
- **证据**:`src/game/ui/Panel.ts` 构造函数末尾对入场 tween 时机的注释;`src/game/overlays/PauseController.ts` 的 `pause()` 里 `tweens.pauseAll()` 和 `new Panel(...)` 的调用顺序。

### F11. 只钳制中心点 → 球有半个身子在屏幕外;写了但从没生效的边界钳制

- **现象**:玩家球贴到屏幕边缘时,有半个球体在可视区域之外。
- **修复**:钳到 `[radius, GAME_WIDTH - radius]` 而不是 `[0, GAME_WIDTH]`。
- **同处的第二个坑**:`PlayerController` 构造函数里刻意**没有**调用 `setCollideWorldBounds(true)`,原因是玩家位置全程是直接写 `sprite.x/y`,从来没走 `velocity`,而 Arcade 物理的世界边界钳制只对 `velocity` 生效——这行代码就算写了也从来不会起作用,留着只会误导后来者以为出界已经被引擎挡住了。真正的边界钳制在 `update()` 里手写。
- **可迁移判断**:"写了但从没生效的代码"比"没写"更危险,因为它会让人误判某个防护措施已经存在。
- **证据**:`src/game/objects/PlayerController.ts` 的 `update()`(手写的 `Phaser.Math.Clamp` 边界)与构造函数里关于 `setCollideWorldBounds` 的注释。

### F12. 池复用不清 `setData` → 新对象带着上一位"房客"的状态

- **现象**:擦身计分偶尔多算或漏算一次。
- **根因**:`grazed`/`grazePrevX`/`grazePrevY` 这类挂在对象上的自定义状态,如果在 `despawn()` 和 `spawnOne()` 两处都不清理,复用后的新对象会继续带着上一轮的标记;`killTweensOf(obj)` 也要在取出时先杀一遍,否则新旧 tween 会抢同一个对象的 `scale`。
- **可迁移判断**:对象池里"重置"要覆盖的不只是引擎自带字段(位置、速度、可见性),还有你自己挂上去的所有附加状态和正在跑的动画。
- **证据**:`src/game/objects/HazardSpawner.ts` 的 `spawnOne()`/`despawn()`/`collectNewGrazes()` 里对 `grazed`/`grazePrevX/Y` 的清理与设置;`src/game/objects/MoteSpawner.ts` 的 `spawnOne()` 里 `killTweensOf(mote)`。

### F13. 用 960×540 截图验证清晰度会看不出问题

见 B2。**可迁移判断**:验证环境恰好等于设计基准分辨率时,和分辨率相关的问题会完全隐身——必须用一个和设计基准不同的实际渲染分辨率去验收。

---

## H 节 · 收尾

这份文档里每条决策的"理由"都绑死在一组具体条件上:平台是 CrazyGames、引擎是 Phaser 3.90、团队是一个人、玩法是单场景躲避类、素材是零外部资源。**条件变了,结论就要重算——这就是每条决策里"什么情况下你该选另一个"这一栏存在的全部意义。**

三条从上面所有决策里抽出来的公约数,建议带走:

1. **边界靠机器守,不靠文档守**(D1)。文档守不住的证据就在 G 节那些条目里——包括这次通读新发现的一整批目录重命名后遗留的旧路径引用(G0),它们本身就是"约束写在注释里会怎样"的最新实例。
2. **不崩溃的 bug 才是贵的**。整个 F 节没有一条会抛异常,能抓到它们的唯一手段是人工验收(截图、不同刷新率下实测、性能录制)。
3. **"现在看不出问题"不是理由**(F5/B4/F11/G10 都是这句话的不同实例)。今天零素材、单场景、一个人维护,所以很多裂缝还没暴露;这不代表裂缝不存在,只代表触发条件还没凑齐。
