# Pulse Dodger CrazyGames 提交前收口清单

Last updated: 2026-09-17

一句话定位：这份清单只回答一个问题：`Pulse Dodger` 当前提交状态是什么，后续还要跟进什么。

## 当前结论

当前状态：

```text
本地可控部分：已完成。
Portal 提交：已完成 Basic Launch 提交。
当前平台状态：Awaiting review / Waiting for review。
不能声称完成：还没有通过 CrazyGames QA，也还没有正式公开上架。
```

这份项目已经有 `CrazyGamesAdapter`，并且分数存档通过 `platform().save/load` 走平台适配层。在 CrazyGames 环境下，它对应 SDK data module；在本地 Web 环境下，它对应 `localStorage`。

## 本次实测记录

| 项目 | 当前状态 | 证据 |
| --- | --- | --- |
| 真机试玩 | 已通过 | 用户 2026-09-17 反馈：真机玩了一下，没啥大问题 |
| 玩家界面英文化 | 已处理 | `src/game/theme.ts` 与 `index.html` 玩家可见文案已改成英文 |
| SDK script | 已接入 | `index.html` 加载 CrazyGames HTML5 SDK v3 |
| 平台适配层 | 已接入 | `src/platform/adapters/crazygames.ts` |
| loading 事件 | 已接入 | `BootScene` 调用 `loadingStart/loadingStop` |
| gameplay 事件 | 已接入 | `PlayScene` / 场景流程调用 `gameplayStart/gameplayStop` |
| 平台静音 | 已接入 | `audio.bindPlatformSettings()` 监听 `muteAudio` |
| 云存档能力 | 已接入 | `CrazyGamesAdapter.save/load` 使用 SDK data module |
| 广告适配层 | 已接入 | `showInterstitial/showRewarded/showBanner` 已封装 |
| Basic 广告策略 | 已处理 | Basic Launch build 禁用 ads/banner SDK 调用，避免 Portal 报 `Ads were detected` |
| 本地打包 | 已通过 | 2026-09-17 执行 `npm run portal:upload` 通过 |
| 单元测试 | 已通过 | 29 passed, 0 failed |
| 类型检查 | 已通过 | `tsc --noEmit` 通过 |
| 依赖边界 | 已通过 | `check:boundaries` 通过 |
| Portal 上传目录 | 已通过 | `submissions/portal-upload/`，直接包含 `index.html` 和 `assets/` |
| Portal Preview | 已通过 | Developer Portal Preview 已可玩并完成 QA Results |
| Billing onboarding | 已完成 | 选择 `Hold Payments` 后通过提交前校验 |
| Portal 提交 | 已完成 | 当前状态 `Awaiting review` / `Waiting for review` |
| ZIP 归档 | 已生成 | `submissions/pulse-dodger.zip` 只作为离线归档，不作为当前 Portal 上传物 |
| 文件数 | 已通过 | 3 / 1500 |
| 总体积 | 已通过 | 1.19 MB / 250 MB |
| 初始下载 | 已通过 | 1.19 MB / 50 MB，满足移动端首页 20 MB 门槛 |
| 相对路径 | 已通过 | `build-zip.mjs` 检查通过 |
| 素材授权 | 已记录 | `docs/asset-license.csv`，当前素材为程序生成 / 自制 |
| Metadata | 已生成 | `materials/metadata.md` |
| 截图 | 已生成 | `materials/screenshots/menu.png`、`gameplay.png`、`result.png` |
| Cover | 已生成 | `materials/covers/landscape-1920x1080.png`、`portrait-800x1200.png`、`square-800x800.png` |
| Landscape preview video | 已生成 | `materials/videos/preview.mp4`，18 秒，无音轨 |
| Portrait preview video | 已生成 | `materials/videos/preview-portrait.mp4`，18 秒，无音轨 |

## 已生成的提交材料

| 材料 | 状态 | 文件 |
| --- | --- | --- |
| 菜单截图 | 已生成，1920x1080 | `materials/screenshots/menu.png` |
| 游玩截图 | 已生成，1920x1080 | `materials/screenshots/gameplay.png` |
| 结算截图 | 已生成，1920x1080 | `materials/screenshots/result.png` |
| Landscape cover | 已生成，1920x1080，只写游戏名 | `materials/covers/landscape-1920x1080.png` |
| Portrait cover | 已生成，800x1200，只写游戏名 | `materials/covers/portrait-800x1200.png` |
| Square cover | 已生成，800x800，只写游戏名 | `materials/covers/square-800x800.png` |
| Landscape preview video | 已生成，18 秒，无声音、无鼠标光标、无黑屏 logo 过场 | `materials/videos/preview.mp4` |
| Portrait preview video | 已生成，18 秒，无声音、无鼠标光标、无黑屏 logo 过场 | `materials/videos/preview-portrait.mp4` |
| Portal metadata | 已生成 | `materials/metadata.md` |

## 提交后动作

| 动作 | 必须完成什么 | 记录位置 |
| --- | --- | --- |
| Portal Preview | 已完成；后续只有提交新版本时才需要重新完整 Preview | `docs/submission-log.csv` |
| 正式提交 | 已完成；当前等待 CrazyGames review | `docs/submission-log.csv` |
| 公开页验证 | 通过 QA 后拿 CrazyGames 游戏页，桌面和手机各玩一局 | `docs/submission-log.csv` |

## Submit a game 字段建议

这些是按当前项目实际能力给出的选择。

| Portal 字段 | 建议选择 | 原因 |
| --- | --- | --- |
| Launch type | `Basic` | 第一款先跑通 Basic Launch 和 QA 链路 |
| Game engine | `HTML5` | Phaser + TypeScript + Vite 最终产物是 HTML5 web build |
| Game name | `Pulse Dodger` | 与游戏内标题一致 |
| Save progress | `Yes, using the Data Module from the CrazyGames SDK` | 当前 CrazyGames adapter 已使用 SDK data module 保存最高分和游玩次数 |
| Supports mobile devices | `Yes` | 已做真机试玩，并已通过 Portal Preview |
| Online multiplayer | `No` | 当前不是多人游戏 |
| Supports CrazyGames muting audio through SDK | `Yes` | 当前已监听 SDK settings 的 `muteAudio` |
| Hosting | 上传 HTML5 build files | 当前 Portal 不收 archive，拖 `submissions/portal-upload/` 里的内容 |

## Game details 页面怎么填

这一页决定 CrazyGames 商店页如何展示你的游戏。按当前 `Pulse Dodger` 实际内容填写：

| 字段 | 建议填写 / 选择 | 说明 |
| --- | --- | --- |
| Category | `Arcade` | 当前是快节奏闪避生存类小游戏。如果后台没有 `Arcade`，选最接近的 `Casual` 或 `Action` |
| Tags | 优先选 `Avoid`、`Skill`、`Survival`、`2D`、`Singleplayer` | 最多 5 个；下拉里没有就选语义最接近的，不要选 `Multiplayer`、`Racing`、`Puzzle`、`3D` |
| Description | 使用 `materials/metadata.md` 的 `Long Description` | 页面写着 `NO HTML ALLOWED`，直接贴纯英文文本，不要加 HTML |
| Controls | 使用 `materials/metadata.md` 的 `Controls` | 桌面和移动端控制都要写清楚 |
| Google Play Store | 留空 | 当前没有 Android 商店页 |
| iOS App Store | 留空 | 当前没有 iOS 商店页 |
| Steam | 留空 | 当前没有 Steam 页面 |
| Marketing creatives URL | 留空 | 当前已有本地 cover 和视频，不需要外部素材链接 |
| Landscape cover | 上传 `materials/covers/landscape-1920x1080.png` | 1920x1080 |
| Portrait cover | 上传 `materials/covers/portrait-800x1200.png` | 800x1200 |
| Square cover | 上传 `materials/covers/square-800x800.png` | 800x800 |
| Landscape video | 上传 `materials/videos/preview.mp4` | 18 秒，无音轨 |
| Portrait video | 上传 `materials/videos/preview-portrait.mp4` | 18 秒，无音轨 |
| Mobile orientation | 保持 `Landscape` | 这里已经锁定，页面提示只能创建新 build 时修改 |
| The game works well in fullscreen | 勾选 | 当前游戏按全屏画布适配，已真机试玩 |

粘贴用描述：

```text
Pulse Dodger is a fast arcade survival game built around clean movement and quick reactions. Move through a neon arena, avoid incoming red shards, collect blue motes to charge your pulse, then release a blast to clear nearby danger and push your score higher. Each run is short, readable, and built for instant replay on desktop and mobile.
```

粘贴用控制说明：

```text
Desktop:
- Move with mouse.
- Click or press Space to release a pulse.
- Press Esc to pause.

Mobile:
- Drag to move.
- Tap to release a pulse when charged.
```

如果 Portal 字段文案和上表不完全一致，以后台当前表单为准；原则是只勾选当前项目已经实现且测过的能力。

## 提交前执行顺序

按这个顺序做，不要跳步：

```text
1. 保持玩法冻结，不再加新系统。
2. 执行 npm run portal:upload，确认生成 submissions/portal-upload/。
3. 执行 npm run materials，确认生成截图、cover、preview video 和 metadata。
4. 本地检查 materials 目录里的图片和视频。
5. 登录 CrazyGames Developer Portal。
6. Submit a game -> Basic -> HTML5。
7. 按“Submit a game 字段建议”填写。
8. 上传游戏文件：打开 submissions/portal-upload/，把里面的 index.html 和 assets/ 直接拖到上传区。
9. 上传 materials 目录里的截图、cover 和 preview video。
10. 在 Portal Preview 完整玩一局。
11. 记录 Preview 结果到 docs/submission-log.csv。
12. 没有 blocker 后正式 Submit。
```

当前 Portal 上传内容：

```text
path: submissions/portal-upload/
files:
  index.html
  assets/index-CoddpMvm.js
  assets/phaser-BUlrDfUd.js
size: 1224.0 KB
```

## QA Results 页面怎么选

如果重新上传 Basic build 后不再出现 `Ads were detected` 警告，按当前项目实际情况这样选：

| QA 项 | 选择 | 原因 |
| --- | --- | --- |
| First gameplay start implemented correctly | `Yes` | `gameplayStart` 在进入可玩状态后触发 |
| Complies to Gameplay requirements | `Yes` | 当前为英文界面、可玩闭环、无明显不合规内容 |
| Runs on all CrazyGames domains | `Yes` | 当前没有 sitelock，不限制域名 |
| Browser checks | `Yes` | Preview 可运行；提交前至少再用当前浏览器完整玩一局 |
| Device checks: Mobile | `Yes` | 已真机试玩；必要时用二维码再复测 |
| No external ads | `Yes` | Basic build 已禁用 CrazyGames ads/banner，也没有外部广告 SDK |
| Does not offer external login options | `Yes` | 当前没有外部登录 |
| In-game mention of Terms & Conditions and/or Privacy Policy | `N/A` | 当前不额外采集个人数据，也没有自建账号/支付 |

不要在有红色 blocker 或 `Ads were detected` 警告时勾确认继续。先修 build，再重新 Preview。

## Preview 必测点

| 场景 | 必测动作 | 通过标准 |
| --- | --- | --- |
| 加载 | 打开游戏 | 不白屏，不无限 loading |
| 菜单 | 点击 START | 能进入游戏 |
| 游玩 | 鼠标 / 触摸移动 | 玩家可控，不出界 |
| 技能 | 点击或 Space | 充能满后能释放 pulse |
| 失败 | 撞到红色碎片 | 进入结算或复活流程 |
| 复活广告 | 点击 REVIVE | 没广告库存时不发奖、不卡死；看完才复活 |
| 静音 | 切换平台静音 | 游戏音效跟随静音状态 |
| 存档 | 打出高分后刷新 | 最高分仍存在 |
| 重试 | 点击 PLAY AGAIN | 能重新开始 |
| 控制台 | 全流程观察 console | 无 uncaught error |

## 提交后跟进

提交后不要把任务视为结束。真正目标是公开游戏页可玩。

```text
T+0：记录提交时间和 Portal 状态。
T+1 起：每天检查 QA 反馈。
如果被退回：只修审核意见，不顺手大改玩法。
如果进入 Basic Launch：拿 CrazyGames 游戏页，在桌面和手机各完整玩一局。
如果公开可玩：开始记录 plays、average playtime、gameplay conversion、retention、feedback。
如果数据差：优先改首局引导、失败反馈、封面、难度曲线，不急着堆功能。
```
