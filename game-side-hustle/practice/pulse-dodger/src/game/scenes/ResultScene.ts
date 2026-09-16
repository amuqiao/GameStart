import Phaser from 'phaser';
import { BANNER_CONTAINER_ID, GAME_HEIGHT, GAME_WIDTH } from '../config';
import { THEME } from '../theme';
import { GameState } from '../core/GameState';
import { platform } from '../../platform';
import { audio } from '../systems/audio';

interface ResultData {
  score: number;
  best: number;
  isNewBest: boolean;
  survivedSeconds: number;
}

export class ResultScene extends Phaser.Scene {
  private result!: ResultData;

  constructor() {
    super('Result');
  }

  init(data: ResultData): void {
    this.result = data;
  }

  create(): void {
    this.cameras.main.setBackgroundColor(THEME.bg);
    const cx = GAME_WIDTH / 2;
    const y = (ratio: number): number => GAME_HEIGHT * ratio;

    this.add
      .text(cx, y(THEME.anchor.heading), this.result.isNewBest ? THEME.copy.newBest : THEME.copy.gameOver, {
        fontSize: THEME.font.heading,
        color: this.result.isNewBest ? THEME.text.warning : THEME.text.primary,
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.add
      .text(cx, y(THEME.anchor.lead), String(this.result.score), { fontSize: THEME.font.score, color: THEME.text.accent, fontStyle: 'bold' })
      .setOrigin(0.5);

    this.add
      .text(cx, y(THEME.anchor.meta), THEME.copy.survivedFor(this.result.survivedSeconds, this.result.best), {
        fontSize: THEME.font.body,
        color: THEME.text.dim,
      })
      .setOrigin(0.5);

    const again = this.add
      .text(cx, y(THEME.anchor.action), THEME.copy.playAgain, {
        fontSize: THEME.font.button,
        color: THEME.button.primaryText,
        backgroundColor: THEME.button.primaryBg,
        padding: { x: THEME.button.paddingX, y: THEME.button.paddingY },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    again.on('pointerdown', () => {
      audio.uiClick();
      void this.restart();
    });

    this.add
      .text(cx, y(THEME.anchor.footer), THEME.copy.resultTip, {
        fontSize: THEME.font.small,
        color: THEME.text.dim,
      })
      .setOrigin(0.5);

    if (platform().capabilities.banners) {
      void platform().showBanner(BANNER_CONTAINER_ID);
    }
  }

  /**
   * 插屏广告的节奏:第 1 局不打,之后每 3 局打一次。
   * 新玩家第一局就吃广告是最伤留存的做法,别这么干。
   */
  private async restart(): Promise<void> {
    const runs = GameState.runsPlayed();
    const shouldShowAd = runs > 1 && runs % 3 === 0;

    platform().clearBanners();

    if (shouldShowAd && platform().capabilities.interstitialAds) {
      // 契约:调广告之前自己停音频,await 返回后再恢复
      audio.setAdMuted(true);
      await platform().showInterstitial('restart');
      audio.setAdMuted(false);
    }

    this.scene.start('Play');
  }
}
