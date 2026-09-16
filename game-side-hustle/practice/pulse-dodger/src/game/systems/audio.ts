import { SAVE_KEYS } from '../config';
import { platform } from '../../platform';

/**
 * 用 WebAudio 振荡器合成音效,不加载任何音频文件。
 *
 * 这么做有三个实际好处:
 *   1. 零素材 = 零 license 风险,提交包里没有任何来源不明的资源;
 *   2. 包体几乎不增加,直接满足 CrazyGames 的初始下载体积要求;
 *   3. 正好给"响应平台静音开关"这件必做的事一个真实的验证目标。
 */
class AudioSystem {
  private ctx: AudioContext | null = null;

  /**
   * 静音有两个独立来源,必须分开存,不能用一个 boolean:
   *   platformMuted —— 平台外框的喇叭按钮(CrazyGames 提供,玩家在游戏外点)
   *   userMuted     —— 游戏内设置页的开关(只在平台不提供时才会有)
   *   adMuted       —— 广告播放期间的临时静音
   * 合成一个 boolean 就会出现"玩家在游戏内开了声音,把平台的静音覆盖掉"这种 bug。
   */
  private platformMuted = false;
  private userMuted = false;
  private adMuted = false;

  /**
   * 浏览器要求 AudioContext 必须在用户手势里创建/恢复。
   * iOS 尤其严格,CrazyGames 技术要求里也单独点名了这一条。
   */
  unlock(): void {
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
  }

  /** 接平台静音开关。CrazyGames 播放器外框上的喇叭按钮就是走这条路径。 */
  bindPlatformSettings(): void {
    const adapter = platform();
    this.platformMuted = adapter.getSettings().muteAudio;
    adapter.onSettingsChange((settings) => {
      this.platformMuted = settings.muteAudio;
    });

    // 玩家自己的静音偏好要持久化,否则每次重开都要再关一次
    if (!adapter.capabilities.platformProvidesAudioToggle) {
      this.userMuted = adapter.load(SAVE_KEYS.userMuted) === '1';
    }
  }

  /** 设置页的开关。只在平台不提供静音时才会被调用。 */
  toggleUserMuted(): boolean {
    this.userMuted = !this.userMuted;
    platform().save(SAVE_KEYS.userMuted, this.userMuted ? '1' : '0');
    return this.userMuted;
  }

  get isUserMuted(): boolean {
    return this.userMuted;
  }

  /** 广告期间临时静音。官方要求广告开始时游戏必须静音。 */
  setAdMuted(muted: boolean): void {
    this.adMuted = muted;
  }

  /** 任意一个来源要求静音,就静音。 */
  get isMuted(): boolean {
    return this.platformMuted || this.userMuted || this.adMuted;
  }

  collect(): void {
    this.blip(660, 0.07, 'triangle', 0.18);
  }

  pulse(): void {
    this.sweep(180, 900, 0.32, 0.22);
  }

  hit(): void {
    this.sweep(420, 70, 0.45, 0.28);
  }

  uiClick(): void {
    this.blip(440, 0.05, 'square', 0.12);
  }

  private blip(freq: number, duration: number, type: OscillatorType, gain: number): void {
    const ctx = this.playableContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    env.gain.setValueAtTime(gain, ctx.currentTime);
    env.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(env).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }

  private sweep(fromFreq: number, toFreq: number, duration: number, gain: number): void {
    const ctx = this.playableContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(fromFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, toFreq), ctx.currentTime + duration);
    env.gain.setValueAtTime(gain, ctx.currentTime);
    env.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(env).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }

  /** 静音或还没解锁时返回 null —— 这是"不该发声"的正常状态,不是错误。 */
  private playableContext(): AudioContext | null {
    if (this.isMuted || !this.ctx || this.ctx.state !== 'running') {
      return null;
    }
    return this.ctx;
  }
}

export const audio = new AudioSystem();
