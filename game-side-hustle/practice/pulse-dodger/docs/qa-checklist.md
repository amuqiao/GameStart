# 提交前 QA 清单

每次 `npm run package` 之后、上传之前,逐条过一遍。打勾才提交。

## 自动检查(脚本已覆盖)

`npm run package` 跑五道门,任何一道红了都出不了包:

```
check:boundaries → test → tsc --noEmit → vite build → build-zip 断言
```

第一道门 `check:boundaries` 断言的是四条依赖边界规则:

- [x] 只有 `src/game/**` 可以 import phaser(引擎依赖有边界,`dom/`、`platform/` 换引擎时不用动)
- [x] `core/` 只依赖 `core/` 自身和 `tuning`(规则层能被 `node --test` 直接跑,不需要浏览器和引擎)
- [x] `effects/` 不许 import `core/`(依赖是单向的:表现可以被规则驱动,规则不知道表现存在)
- [x] `platform/` 不许 import `game/`(平台适配层不知道引擎也不知道游戏,能整块搬到别的项目)
- [x] 全部单元测试通过
- [x] 类型检查通过
- [x] 总体积 ≤ 250 MB
- [x] 文件数 ≤ 1500
- [x] 初始下载 ≤ 50 MB(想要移动端首页推荐位:≤ 20 MB)
- [x] `index.html` 中没有绝对路径
- [x] zip 根目录直接是 `index.html`,没有多套一层文件夹
- [x] **池容量 ≥ 难度曲线峰值 × 1.5**(`spawnBudget` 实算,调难度曲线撑爆池子会被测试先抓到)

## 手动检查(脚本查不了,但 QA 会查)

### SDK 生命周期

- [ ] 打开游戏,控制台出现 `Requesting game loading start` 和 `loading stop`
- [ ] 点开始进入游戏,出现 `gameplayStart`
- [ ] 死亡/回到菜单,出现 `gameplayStop`
- [ ] 破纪录时出现 `happytime`

### 平台静音(**最常见的退回原因**)

- [ ] 点播放器外框的喇叭按钮 → 游戏音效立刻停止
- [ ] 再点一次 → 音效恢复
- [ ] 广告播放期间游戏自身音效是静音的

### 广告

- [ ] 激励视频**完整看完**才发奖(这里是复活)
- [ ] 激励视频**中途关闭**不发奖
- [ ] 没有广告库存时游戏不卡死,照常继续
- [ ] 广告播放期间游戏是暂停的
- [ ] 第一局结束**不**弹插屏广告
- [ ] banner 不遮挡玩法区域

### 输入与适配

- [ ] 鼠标可玩
- [ ] 键盘方向键可玩
- [ ] 触屏可玩(Chrome DevTools 设备模拟即可验证)
- [ ] **触屏:拖动移动时不会误放冲击波**(第一根手指只管移动,第二根手指才放技能)
- [ ] **触屏:球显示在手指上方**,不被手指盖住
- [ ] **玩家不能移出屏幕**(四个角都试一下,球应该始终完整可见)
- [ ] 窗口缩放不变形、不裁切
- [ ] 手机上长按不出现文字选中/放大菜单

### 帧率一致性(CrazyGames 明文要求)

> "The game's physics must perform consistently across different monitor refresh rates (e.g. 144 Hz, 165 Hz)."

- [ ] **60Hz 和 144Hz 下,同样操作的存活时间应该接近**
- [ ] 判断标准:凡是手写的每帧插值,代码里必须出现 `delta`。没出现就要怀疑
- [ ] Arcade 的 velocity、Tween、`time.delayedCall` 由引擎做 delta 修正,不用管

### 清晰度(容易漏)

- [ ] **1920×1080 全屏下文字和贴图是锐利的**,不是被拉伸糊掉的
- [ ] 最小 iframe(800×450)下最小号文字仍然可读
- [ ] ⚠️ 用 960×540 截图验证会**看不出**清晰度问题(那个尺寸恰好 1:1),必须用 1920×1080

### 存档

- [ ] 破纪录后刷新页面,最高分还在
- [ ] 存档 key 带游戏前缀,不会和同域其他游戏冲突

### 界面完整性(**必须靠截图,build 通过不代表画出来了**)

这一节是用血换来的。曾经出现过 `npm run build` 五道门全绿、全部单元测试通过、类型检查干净,
但**主页的开始按钮根本没渲染出来,游戏进不去**的情况。

根因是 Phaser 的一个陷阱:给 Text 的 style 传 `fixedWidth: undefined`,
`GetValue` 用 `hasOwnProperty` 判断,显式 undefined 会**通过**,于是返回 undefined 而不是默认值 0;
而 `Text.updateText()` 只在 `fixedWidth === 0` 时才给 `this.width` 赋值,
结果 width 永远是 undefined,`setOrigin(0.5)` 算出 NaN,**整个对象被画在 NaN 坐标上**。

`fixedWidth?: number` 在类型上完全合法,所以 tsc 不报;不崩溃,所以测试不抓。

- [ ] **每个场景都实际截图看过**:Menu / Play / Result / Settings / 暂停面板 / 复活面板
- [ ] 所有按钮都真的画出来了,而且点得动
- [ ] 文字之间没有重叠、没有互相压行
- [ ] 给 Phaser 传 style 对象时,不确定的键**按需拼装**,不要写 `key: maybeUndefined`

### 浏览器

- [ ] Chrome 正常
- [ ] Edge 正常
- [ ] Safari 正常(可选,但影响推荐权重)

### 性能(低配设备)

CrazyGames 要求在 4GB 内存的 Chromebook 上流畅运行。

- [ ] Chrome DevTools → Performance → 录 60 秒 → 看 Memory 曲线的锯齿幅度和 GC 次数
- [ ] 锯齿明显说明有对象在被频繁创建销毁,查有没有漏掉对象池
- [ ] ⚠️ 池化之后**禁止用 `delayedCall` 持有池化对象的引用** —— 那个对象可能已被回收并复用成另一个实体,
      回调会误伤活着的新对象。表现是"偶尔有东西自己消失",极难复现。改用 `update()` 里扫时间戳
