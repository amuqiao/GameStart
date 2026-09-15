# AI 游戏副业作战手册

一句话定位：这是一套给“懂开发、会用 Codex / Claude / 多 agent、但没有游戏开发经验”的 AI-first 游戏副业作战手册。

## 心智模型

你不是在从零学习传统游戏开发，而是在搭建一条可重复的商业验证链路。

```
渠道/客户需求
  |
  v
游戏形态和核心循环
  |
  v
技术栈和资产管线
  |
  v
PlatformAdapter（平台适配层） / SDK（平台开发包） / 构建
  |
  v
上线、投稿、报价或投放
  |
  v
反馈、数据、收入信号
  |
  v
迭代或停止
```

核心原则：

- 先按渠道和变现方式倒推技术栈，不要先陷入“学哪个引擎”。
- AI 能压缩代码、素材草案、测试和文档成本，但不能替你消除平台规则、版权、性能和商业分发问题。
- 正文拆成 7 个主题文档；`readme.md` 只做入口、心智模型和索引，不计入主题文档数量。

## 使用方式

这套文档不是阅读材料，而是执行材料。

每次启动一个新游戏项目时，按这个顺序走：

```
1. 先选 1 个主渠道和 1 个备选渠道
2. 写清玩法核心循环和目标设备
3. 选技术栈和资产管线
4. 生成项目模板和 PlatformAdapter（平台适配层）
5. 用 AI 多 agent（多个 AI 子任务执行者）并行做玩法、UI、资产、接入、测试
6. 产出可玩链接、截图、视频、报价包或投稿材料
7. 根据平台反馈、客户反馈、数据反馈决定迭代还是停止
```

第一周的目标不是“研究完游戏行业”，而是证明：

```
我能做出可玩的英文 H5（手机浏览器可运行的 HTML5 网页）小游戏
我能按平台规则打包
我能给客户或平台一个可评估的链接
我能拿到一次真实反馈
```

## 第一周最短路径

三条线并行：

- 现金流线：Playable Ads（可试玩广告） / H5（HTML5 网页游戏）小游戏外包 / 二改定制。
- 作品线：itch.io / 自建作品页 / GitHub Pages 展示。
- 平台线：CrazyGames / Yandex Games / GameDistribution 等 Web 游戏平台投稿。

最小商业闭环：

- 1 个可玩的英文 HTML5（网页技术标准）游戏。
- 1 个可复用 GameCore（游戏核心逻辑）。
- 1 套 PlatformAdapter（平台适配层）。
- 1 套移动端验收清单。
- 1 个作品展示链接。
- 1 次平台投稿或客户报价。
- 1 次真实反馈或数据回收。

## 阅读路径

| 你现在的问题 | 先读 |
| --- | --- |
| 我完全不懂游戏开发，想先扫盲游戏框架、语言、引擎、3A 和完整流程 | [literacy/game-dev-framework-universe.md](literacy/game-dev-framework-universe.md) |
| 我想搞懂 CrazyGames 是什么、怎么投稿、怎么变现、有哪些坑 | [literacy/CrazyGames.md](literacy/CrazyGames.md) |
| 我想开始实操，每天做一款 CrazyGames 候选游戏并提交记录 | [practice/crazygames-daily-launch-plan.md](practice/crazygames-daily-launch-plan.md) |
| 我想理解这个副业到底怎么跑 | [01-ai-first-game-mindset.md](01-ai-first-game-mindset.md) |
| 我想知道 Phaser、Three.js、Blender（3D 建模工具）、Cocos、Unity、Godot 怎么选 | [02-game-tech-stack-map.md](02-game-tech-stack-map.md) |
| 我想知道海外平台、国内平台、Playable Ads（可试玩广告）怎么接入 | [03-platform-channel-map.md](03-platform-channel-map.md) |
| 我准备开始建项目，想知道代码结构和 PlatformAdapter（平台适配层）怎么拆 | [04-platform-adapter-and-project-template.md](04-platform-adapter-and-project-template.md) |
| 我不懂游戏素材、Blender（3D 建模工具）、GLB（3D 模型单文件）、AI 资产和版权 | [05-asset-pipeline-blender-gltf-ai.md](05-asset-pipeline-blender-gltf-ai.md) |
| 我想一周内跑通 demo、投稿、报价和反馈 | [06-week-one-commercial-loop.md](06-week-one-commercial-loop.md) |
| 我只想找官方链接、GitHub demo、素材站和平台入口 | [07-links-and-open-source-demos.md](07-links-and-open-source-demos.md) |
| 我想知道怎么报价、分成、避开合同坑 | [03-platform-channel-map.md](03-platform-channel-map.md) |
| 我想知道怎么用 Codex / Claude / 多 agent（AI 子任务执行者）协作开发 | [06-week-one-commercial-loop.md](06-week-one-commercial-loop.md) |

## 文档索引

- [01-ai-first-game-mindset.md](01-ai-first-game-mindset.md)：AI-first（AI 优先）成本模型、你的角色、游戏开发最小心智模型。
- [02-game-tech-stack-map.md](02-game-tech-stack-map.md)：Web/2D/3D/小游戏/引擎/框架选择。
- [03-platform-channel-map.md](03-platform-channel-map.md)：平台渠道、接入方式、变现方式、报价和合同风险。
- [04-platform-adapter-and-project-template.md](04-platform-adapter-and-project-template.md)：工程结构、PlatformAdapter（平台适配层）、项目模板。
- [05-asset-pipeline-blender-gltf-ai.md](05-asset-pipeline-blender-gltf-ai.md)：2D、3D、Blender（3D 建模工具）、glTF/GLB（3D 模型格式）、音频、版权记录。
- [06-week-one-commercial-loop.md](06-week-one-commercial-loop.md)：一周 Todo、验收清单、交付包、AI 多 agent（AI 子任务执行者）工作流、第二阶段路线。
- [07-links-and-open-source-demos.md](07-links-and-open-source-demos.md)：开源项目、官方文档、Playable Ads（可试玩广告）、素材工具链接。
- [literacy/CrazyGames.md](literacy/CrazyGames.md)：CrazyGames 平台扫盲、上线流程、SDK（平台开发包）、收益和审核风险。
- [literacy/game-dev-framework-universe.md](literacy/game-dev-framework-universe.md)：游戏开发框架、语言、引擎、资产、3A 流程扫盲。
- [practice/crazygames-daily-launch-plan.md](practice/crazygames-daily-launch-plan.md)：一天一款 CrazyGames 候选游戏的 AI-first 实操计划、开源学习源和提交清单。

## 七个主题的产出物

| 文档 | 你读完后应该产出什么 |
| --- | --- |
| 01 | 一句话定位、目标渠道、第一款游戏的边界 |
| 02 | 技术栈选择、渲染方式、资产格式、构建方式 |
| 03 | 平台优先级、变现方式、报价边界、合同红线 |
| 04 | PlatformAdapter（平台适配层）接口、项目目录、平台能力表 |
| 05 | 素材清单、版权记录、Blender（3D 建模工具） / GLB（3D 模型单文件格式）导出规则 |
| 06 | 一周 Todo、验收清单、AI agent（AI 子任务执行者）分工、交付包 |
| 07 | 官方文档、开源 demo、素材站、复查入口 |

## 维护规则

- 平台规则、结算、SDK（平台开发包）、审核、报价和接单风险变化快，更新时优先改 03-platform-channel-map.md 和 07-links-and-open-source-demos.md。
- 技术栈认知和 AI-first 心智模型相对稳定，更新时优先保持结构，不要堆零散链接。
- 7 个主题文档是当前稳定边界；不要为了“看起来更细”继续拆分。
- 旧的 [../AI游戏副业作战手册.md](../AI游戏副业作战手册.md) 只作为历史源材料保留，不再作为主入口。
