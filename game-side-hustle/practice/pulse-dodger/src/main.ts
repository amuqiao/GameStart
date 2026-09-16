import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from './game/config';
import { THEME } from './game/theme';
import { BootScene } from './game/scenes/BootScene';
import { MenuScene } from './game/scenes/MenuScene';
import { PlayScene } from './game/scenes/PlayScene';
import { ResultScene } from './game/scenes/ResultScene';
import { SettingsScene } from './game/scenes/SettingsScene';
import { initPlatform } from './platform';
import { LoadingOverlay } from './ui/LoadingOverlay';

/**
 * 启动顺序很重要:**先初始化平台,再创建 Phaser**。
 * 反过来的话 BootScene 里的 platform() 会拿不到 adapter 直接抛。
 */
async function bootstrap(): Promise<void> {
  const adapter = await initPlatform();
  console.info(`[boot] 平台 = ${adapter.name}`);

  // 平台自带 loading 动画就不画自己的,否则会连闪两次
  const loading = new LoadingOverlay(!adapter.capabilities.platformProvidesLoadingUI);
  loading.start();

  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game-root',
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: THEME.bg,
    scale: {
      // FIT + CENTER_BOTH:桌面全屏、手机横屏加黑边,两边都不变形。
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
      default: 'arcade',
      arcade: { gravity: { x: 0, y: 0 }, debug: false },
    },
    // 顺序即启动顺序:Boot 跑完自己切到 Menu
    scene: [BootScene, MenuScene, PlayScene, ResultScene, SettingsScene],
  });

  // Boot 场景创建完 = 贴图就绪 = 真正可以开始玩了
  game.events.once(Phaser.Core.Events.READY, () => loading.finish());
}

void bootstrap();
