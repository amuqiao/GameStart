import Phaser from 'phaser';
import { GAME_WIDTH, PULSE } from '../config';
import { THEME } from '../theme';
import type { GameState } from '../core/GameState';

/** 游戏内 HUD:分数、最高分、充能条。只读 GameState,不写。 */
export class Hud {
  private readonly scoreText: Phaser.GameObjects.Text;
  private readonly bestText: Phaser.GameObjects.Text;
  private readonly chargeBar: Phaser.GameObjects.Graphics;
  private readonly hintText: Phaser.GameObjects.Text;

  constructor(private readonly scene: Phaser.Scene) {
    const { space, font, chargeBar } = THEME;

    this.scoreText = scene.add
      .text(space.md, space.sm, '0', {
        fontSize: font.hudScore,
        color: THEME.text.primary,
        fontStyle: 'bold',
      })
      .setDepth(100);

    this.bestText = scene.add
      .text(space.md, space.xl, '', { fontSize: font.small, color: THEME.text.dim })
      .setDepth(100);

    this.chargeBar = scene.add.graphics().setDepth(100);

    this.hintText = scene.add
      .text(GAME_WIDTH / 2, space.md, '', {
        fontSize: font.body,
        color: THEME.text.accent,
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setDepth(100);

    void chargeBar;
  }

  update(state: GameState): void {
    const { chargeBar: bar, space } = THEME;

    this.scoreText.setText(String(state.score));
    this.bestText.setText(`BEST  ${state.best}`);
    this.hintText.setText(state.pulseReady ? THEME.copy.pulseReady : '');

    // 右上角留给暂停按钮,所以充能条下移一行
    const x = GAME_WIDTH - space.md - bar.width;
    const y = bar.top;

    this.chargeBar.clear();
    this.chargeBar.fillStyle(bar.trackFill, 1);
    this.chargeBar.fillRoundedRect(x, y, bar.width, bar.height, bar.radius);

    const ratio = Phaser.Math.Clamp(state.charge / PULSE.maxCharge, 0, 1);
    if (ratio > 0) {
      this.chargeBar.fillStyle(state.pulseReady ? THEME.entity.pulse : THEME.entity.mote, 1);
      this.chargeBar.fillRoundedRect(
        x,
        y,
        Math.max(bar.height, bar.width * ratio),
        bar.height,
        bar.radius,
      );
    }

    if (state.pulseReady) {
      // 满充能时轻微呼吸,给一个"可以按了"的视觉钩子
      const alpha = 0.55 + Math.sin(this.scene.time.now / 140) * 0.35;
      const glow = THEME.space.xs / 2;
      this.chargeBar.fillStyle(THEME.entity.pulse, alpha * 0.4);
      this.chargeBar.fillRoundedRect(
        x - glow,
        y - glow,
        bar.width + glow * 2,
        bar.height + glow * 2,
        bar.radius + glow,
      );
    }
  }
}
