import { MOTE, PULSE, SAVE_KEYS } from '../config';
import { platform } from '../../platform';

/**
 * 一局游戏的状态。和 Phaser 解耦,不引用任何 Scene/GameObject,
 * 这样规则可以单独推演和测试(后端里的 domain 层)。
 */
export class GameState {
  score = 0;
  charge = 0;
  elapsedMs = 0;
  /** 每局只允许复活一次,避免玩家无限看广告续命导致分数失真 */
  reviveUsed = false;

  private bestScore: number;

  constructor() {
    this.bestScore = readInt(SAVE_KEYS.bestScore, 0);
  }

  get best(): number {
    return this.bestScore;
  }

  get chargeRatio(): number {
    return this.charge / PULSE.maxCharge;
  }

  get pulseReady(): boolean {
    return this.charge >= PULSE.maxCharge;
  }

  collectMote(): void {
    this.score += MOTE.scorePerMote;
    this.charge = Math.min(PULSE.maxCharge, this.charge + MOTE.chargePerMote);
  }

  /** 释放冲击波。返回本次得分,调用方用它决定要不要触发 happyTime。 */
  spendPulse(hazardsCleared: number): number {
    this.charge = 0;
    const gained = hazardsCleared * PULSE.scorePerHazardCleared;
    this.score += gained;
    return gained;
  }

  tick(deltaMs: number): void {
    this.elapsedMs += deltaMs;
  }

  get elapsedSeconds(): number {
    return this.elapsedMs / 1000;
  }

  /** 结算。返回是否破纪录,MenuScene / ResultScene 据此展示不同文案。 */
  finish(): { isNewBest: boolean } {
    const isNewBest = this.score > this.bestScore;
    if (isNewBest) {
      this.bestScore = this.score;
      platform().save(SAVE_KEYS.bestScore, String(this.bestScore));
    }
    platform().save(SAVE_KEYS.runsPlayed, String(readInt(SAVE_KEYS.runsPlayed, 0) + 1));
    return { isNewBest };
  }

  static runsPlayed(): number {
    return readInt(SAVE_KEYS.runsPlayed, 0);
  }
}

function readInt(key: string, fallbackValue: number): number {
  const raw = platform().load(key);
  if (raw === null) {
    return fallbackValue;
  }
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed)) {
    // 存档被改坏了是真问题,要看得见,不要静默当 0 处理
    throw new Error(`存档字段 ${key} 不是合法整数: ${raw}`);
  }
  return parsed;
}
