import Phaser from 'phaser';
import { BANNER_CONTAINER_ID, GAME_HEIGHT, GAME_WIDTH } from '../config';
import { THEME } from '../theme';
import { GameState } from '../core/GameState';
import { platform } from '../../platform';
import { audio } from '../systems/audio';
import { settingsRows } from './SettingsScene';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create(): void {
    const y = (ratio: number): number => GAME_HEIGHT * ratio;

    this.cameras.main.setBackgroundColor(THEME.bg);
    this.drawBackdrop();

    const cx = GAME_WIDTH / 2;

    this.add
      .text(cx, y(THEME.anchor.title), THEME.copy.gameTitle, {
        fontSize: THEME.font.title,
        color: THEME.text.primary,
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.add
      .text(cx, y(THEME.anchor.lead), THEME.copy.tagline, { fontSize: THEME.font.body, color: THEME.text.dim })
      .setOrigin(0.5);

    const best = new GameState().best;
    if (best > 0) {
      this.add
        .text(cx, y(THEME.anchor.meta), `${THEME.copy.bestScore}  ${best}`, {
          fontSize: THEME.font.button,
          color: THEME.text.accent,
        })
        .setOrigin(0.5);
    }

    const start = this.add
      .text(cx, y(THEME.anchor.action), THEME.copy.startPrompt, {
        fontSize: THEME.font.button,
        color: THEME.text.primary,
        backgroundColor: '#14b8a622',
        padding: { x: THEME.button.paddingX, y: THEME.button.paddingY },
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: start,
      alpha: { from: 1, to: 0.45 },
      duration: 900,
      yoyo: true,
      repeat: -1,
    });

    this.createSettingsEntry(cx, y);

    this.add
      .text(cx, y(THEME.anchor.footer), THEME.copy.controls, {
        fontSize: THEME.font.small,
        color: THEME.text.dim,
      })
      .setOrigin(0.5);

    // banner 只在菜单和结算页展示,不遮挡玩法 —— 这是 CrazyGames 审核关注的点
    if (platform().capabilities.banners) {
      void platform().showBanner(BANNER_CONTAINER_ID);
    }

    // 用 setTimeout 之外的方式延迟一帧:避免设置按钮那次点击穿透到"开始游戏"
    this.input.once('pointerdown', () => {
      // 浏览器要求音频必须在用户手势里解锁,这是全局第一次点击,正好用来解锁
      audio.unlock();
      audio.uiClick();
      platform().clearBanners();
      this.scene.start('Play');
    });
  }

  /**
   * 设置入口**按需出现**。
   *
   * 这是"平台已提供的别重做"原则的落地:settingsRows() 会根据平台能力
   * 过滤掉不该显示的行(例如 CrazyGames 上外框已有静音,就不显示音效开关)。
   * 过滤后如果一行都不剩,连入口按钮都不画 —— 而不是给玩家一个空页面。
   */
  private createSettingsEntry(cx: number, y: (ratio: number) => number): void {
    if (settingsRows().length === 0) {
      return;
    }

    const btn = this.add
      .text(cx, y(THEME.anchor.subAction), THEME.copy.settings, {
        fontSize: THEME.font.small,
        color: THEME.text.dim,
        backgroundColor: THEME.button.ghostBg,
        padding: { x: THEME.space.md, y: THEME.space.xs },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    btn.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // 不阻止的话这次点击会同时触发上面的"点击任意位置开始"
      pointer.event.stopPropagation();
      audio.unlock();
      audio.uiClick();
      this.scene.start('Settings');
    });
  }

  private drawBackdrop(): void {
    const g = this.add.graphics();
    g.fillStyle(THEME.bgAccent, 0.5);
    for (let i = 0; i < THEME.starfield.menuCount; i++) {
      g.fillCircle(
        Phaser.Math.Between(0, GAME_WIDTH),
        Phaser.Math.Between(0, GAME_HEIGHT),
        Phaser.Math.Between(THEME.starfield.minRadius, THEME.starfield.maxRadius),
      );
    }
  }
}
