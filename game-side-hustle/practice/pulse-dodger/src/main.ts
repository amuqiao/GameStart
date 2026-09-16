import { createGame } from './game/main';
import { initPlatform } from './platform';
import { LoadingOverlay } from './dom/LoadingOverlay';

/**
 * 浏览器入口。这一层只做三件事:初始化平台、管加载遮罩、把游戏拉起来。
 *
 * **启动顺序很重要:先初始化平台,再创建游戏。**
 * 反过来的话 BootScene 里的 platform() 会拿不到 adapter 直接抛 ——
 * 这是刻意的"不加兜底":顺序写错就当场炸,而不是静默地跑起一个
 * 没有平台能力的游戏,等上线后才发现广告和存档全是哑的。
 *
 * 注意这个文件**不 import phaser**。引擎只存在于 src/game/ 之内,
 * 这条边界由 scripts/check-boundaries.mjs 断言。
 */
async function bootstrap(): Promise<void> {
  const adapter = await initPlatform();
  console.info(`[boot] 平台 = ${adapter.name}`);

  // 平台自带 loading 动画就不画自己的,否则会连闪两次
  const loading = new LoadingOverlay(!adapter.capabilities.platformProvidesLoadingUI);
  loading.start();

  const game = createGame();

  // 不能用 Phaser.Core.Events.READY:实测 node_modules/phaser/src/core/Game.js
  // 的 texturesReady() 里 READY 在 this.start() 之前触发,即任何场景的
  // preload/create 跑之前就已经发出 —— 现在零素材看不出问题,一旦
  // BootScene.preload() 开始真实加载素材,遮罩会在素材开始下载前就消失。
  // 改成监听 BootScene 自己在 create() 末尾发出的信号,确保贴图真的就绪。
  game.events.once('boot-complete', () => loading.finish());
  // BootScene 加载真实进度时转发过来,驱动遮罩的进度条。
  game.events.on('boot-progress', (ratio: number) => loading.setProgress(ratio));
}

void bootstrap();
