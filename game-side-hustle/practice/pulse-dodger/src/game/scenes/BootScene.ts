import Phaser from 'phaser';
import { HAZARD, MOTE, PLAYER } from '../config';
import { THEME } from '../theme';
import { platform } from '../../platform';
import { audio } from '../systems/audio';

/**
 * 启动场景:生成纹理 + 发平台 loading 信号。
 *
 * 后端类比:这里相当于应用启动时的 lifespan/startup —— 建连接、预热缓存,
 * 做完才允许接流量。游戏里"允许接流量"就是切到 MenuScene。
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload(): void {
    // 告诉平台"我开始加载了"。真实项目里 this.load.image(...) 写在这里。
    platform().loadingStart();
  }

  create(): void {
    this.generateTextures();
    audio.bindPlatformSettings();

    // 加载结束。漏掉 loadingStop,平台会一直以为游戏卡在加载中。
    platform().loadingStop();

    this.scene.start('Menu');
  }

  /**
   * 用 Graphics 画好再 generateTexture 成贴图。
   * 相比每帧用 Graphics 重绘,贴图可以走批渲染,几百个物体也不掉帧。
   */
  private generateTextures(): void {
    this.makeGlowCircle('tex-player', PLAYER.radius, THEME.entity.player, THEME.entity.playerGlow);
    this.makeGlowCircle('tex-hazard', HAZARD.radius, THEME.entity.hazard, 0x7f1d3a);
    this.makeGlowCircle('tex-mote', MOTE.radius, THEME.entity.mote, 0x0c4a6e);
    this.makeSoftDot('tex-spark', 6, 0xffffff);
  }

  private makeGlowCircle(key: string, radius: number, core: number, glow: number): void {
    const size = radius * 4;
    const g = this.add.graphics();

    g.fillStyle(glow, 0.22);
    g.fillCircle(size / 2, size / 2, radius * 2);
    g.fillStyle(glow, 0.45);
    g.fillCircle(size / 2, size / 2, radius * 1.4);
    g.fillStyle(core, 1);
    g.fillCircle(size / 2, size / 2, radius);
    g.fillStyle(0xffffff, 0.75);
    g.fillCircle(size / 2 - radius * 0.28, size / 2 - radius * 0.28, radius * 0.34);

    g.generateTexture(key, size, size);
    g.destroy();
  }

  private makeSoftDot(key: string, radius: number, color: number): void {
    const size = radius * 2;
    const g = this.add.graphics();
    g.fillStyle(color, 1);
    g.fillCircle(radius, radius, radius);
    g.generateTexture(key, size, size);
    g.destroy();
  }
}
