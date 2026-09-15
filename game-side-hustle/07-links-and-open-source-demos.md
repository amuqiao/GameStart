# 链接与开源 Demo 索引

这篇文档回答：从哪里找官方文档、GitHub 示例、Playable Ads（可试玩广告）资料和素材工具。

本文负责：

- 开源项目和 Demo 学习清单
- Phaser、Three.js、Cocos、Godot、Unity
- Playable Ads（可试玩广告） / MRAID（移动广告容器交互接口）
- 平台官方入口和素材工具入口

使用规则：

- 优先看官方文档和官方 demo
- GitHub 项目先看最近提交、license、issue、构建命令
- 复制玩法可以，不能直接搬运素材、代码、品牌和关卡
- 平台规则变化快，真正接入前必须重新打开官方文档复查

首周只看：

```
Phaser Vite TypeScript template
Phaser examples
目标平台官方 SDK（平台开发包）
MRAID spec（广告容器接口规范） / playable ads specs（可试玩广告规格）
Kenney / Freesound
```

这里的 SDK（平台开发包）、MRAID spec（广告容器接口规范）、playable ads specs（可试玩广告规格）是第一周最该看的平台资料。

其他引擎、复杂源码、完整独立游戏案例放到第二阶段。

## 开源项目和 Demo 学习清单

### Phaser

- 官方仓库：https://github.com/phaserjs/phaser
- 官方示例：https://github.com/phaserjs/examples
- Phaser 3 + Vite 模板：https://github.com/phaserjs/template-vite
- Phaser 3 + TypeScript 模板：https://github.com/phaserjs/template-vite-ts

学习重点：

- Scene（游戏场景，比如菜单、游玩、结算）
- preload/create/update（Phaser 场景生命周期：加载资源、创建对象、每帧更新）
- Sprite（2D 图片对象，比如玩家、道具）
- Input（输入，比如触摸、鼠标、键盘）
- Arcade Physics（Phaser 的轻量物理系统）
- Animation（动画）
- Sound（声音）
- Scale Manager（缩放管理，处理不同屏幕尺寸）

### Three.js

- 官方仓库：https://github.com/mrdoob/three.js/
- 官方示例：https://threejs.org/examples/
- Three.js manual：https://threejs.org/manual/
- glTF sample assets：https://github.com/KhronosGroup/glTF-Sample-Assets
- React Three Fiber：https://github.com/pmndrs/react-three-fiber
- drei：https://github.com/pmndrs/drei

学习重点：

- Scene（3D 场景）
- Camera（相机，决定玩家从哪里看场景）
- Renderer（渲染器，把 3D 场景画到画布上）
- Mesh（网格模型，由形状和材质组成）
- Material（材质，决定表面颜色、金属感、透明度等）
- Light（灯光）
- Raycaster（射线检测，常用于鼠标/触摸点选 3D 物体）
- GLTFLoader（glTF/GLB 模型加载器）
- AnimationMixer（动画混合器，播放模型动画）
- Resize（窗口尺寸变化处理）
- Texture / dispose（贴图 / 释放资源，避免显存泄漏）

### Cocos Creator

- 引擎仓库：https://github.com/cocos/cocos-engine
- 官方文档：https://docs.cocos.com/creator/manual/en/
- 示例集合：https://github.com/cocos/cocos-example-projects

学习重点：

- Scene（场景）
- Node（节点，Cocos 里的基础对象）
- Component（组件，给节点挂行为）
- Prefab（可复用对象模板）
- Animation（动画）
- Physics（物理）
- Build targets（构建目标，比如 Web、微信小游戏、抖音小游戏）
- 小游戏平台适配

### Godot

- 引擎仓库：https://github.com/godotengine/godot
- 官方 demo：https://github.com/godotengine/godot-demo-projects
- 官方文档：https://docs.godotengine.org/

学习重点：

- Node（节点，Godot 里的基础对象）
- Scene（场景，也可以理解成可复用对象树）
- Signal（信号，Godot 的事件通知机制）
- GDScript（Godot 常用脚本语言）
- Input（输入）
- Physics（物理）
- Export（导出，把项目打包成 Web、桌面或移动端）
- Web export 限制

### Unity

- 官方示例：https://github.com/Unity-Technologies
- 官方学习：https://learn.unity.com/
- 官方文档：https://docs.unity3d.com/

学习重点：

- Scene（场景）
- GameObject（Unity 里的游戏对象）
- Component（组件，给 GameObject 挂能力）
- Prefab（可复用对象模板）
- Animator（动画控制器）
- Rigidbody（刚体，让对象参与物理运动）
- Collider（碰撞体，决定碰撞范围）
- Build Settings（构建设置）
- WebGL build（Unity 导出的浏览器版本）

### Playable Ads（可试玩广告） / MRAID（移动广告容器交互接口）

- Google playable ads：https://support.google.com/google-ads/answer/9981650
- AppLovin creative specs：https://support.applovin.com/en/growth/promoting-your-apps/welcome-to-applovin/creative-specs-and-guidelines
- ironSource playable requirements：https://developers.is.com/ironsource-mobile/general/playable-ad-requirements/
- TikTok playable ads：https://ads.tiktok.com/help/article/playable-ads
- MRAID spec（广告容器接口规范）：https://www.iab.com/guidelines/mobile-rich-media-ad-interface-definitions-mraid/

学习重点：

- single HTML / ZIP（单网页文件 / 压缩包）
- no external requests（不依赖外部网络资源）
- mraid.open（通过广告容器打开落地页）
- CTA（行动按钮，比如 Install / Play Now）
- first interaction audio（首次交互后才能播放音频）
- load time（加载时间）
- size limit（包体大小限制）

### 平台官方入口

- CrazyGames SDK（CrazyGames 平台开发包）：https://docs.crazygames.com/
- Yandex Games：https://yandex.com/dev/games/doc/en/
- GameDistribution SDK（GameDistribution 平台开发包）：https://gamedistribution.com/sdk/
- Poki developer guide：https://developers.poki.com/
- GameSnacks developer docs：https://developers.google.com/gamesnacks/
- itch.io creator docs：https://itch.io/docs/creators/
- Telegram Mini Apps（Telegram 内嵌网页应用）：https://core.telegram.org/bots/webapps
- Discord Activities：https://discord.com/developers/docs/activities/overview

学习重点：

- SDK（平台开发包）接入方式
- 包体和资源限制
- 广告 API
- 存档 API
- 审核要求
- 收款和结算条件

### 素材工具入口

- Kenney：https://kenney.nl/assets
- Poly Haven：https://polyhaven.com/
- Khronos glTF Sample Assets（3D 模型测试资产）：https://github.com/KhronosGroup/glTF-Sample-Assets
- Blender（3D 建模工具）：https://www.blender.org/
- Aseprite：https://www.aseprite.org/
- Photopea：https://www.photopea.com/
- Tiled：https://www.mapeditor.org/
- Freesound：https://freesound.org/
- Audacity：https://www.audacityteam.org/

学习重点：

- 是否允许商用
- 是否需要署名
- 是否适合移动端压缩
- 是否能导出 PNG、spritesheet（精灵图集）、GLB（3D 模型单文件）、MP3、OGG
