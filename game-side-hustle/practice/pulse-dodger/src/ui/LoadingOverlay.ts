import { THEME } from '../game/theme';

/**
 * 加载遮罩。
 *
 * 三个设计决策,换游戏时值得照搬:
 *
 * 1. **必须是 DOM,不能是 Phaser 场景。**
 *    最长的一段等待发生在 Phaser 自己还没解析完的时候(引擎有 1.1MB)。
 *    这段时间里 Phaser 场景根本不存在,画不出任何东西。
 *
 * 2. **低于阈值不显示。**
 *    加载只要 80ms 却闪一下遮罩,视觉上像 bug。UI 领域的通行做法是
 *    低于 ~300ms 的加载指示器干脆不要显示。
 *
 * 3. **平台已经画了就别画。**
 *    CrazyGames 的播放器外框自带 loading 动画,你再画一个会连闪两次。
 *    靠 capabilities.platformProvidesLoadingUI 决定,而不是发行前手动删代码。
 */
const SHOW_THRESHOLD_MS = 300;

export class LoadingOverlay {
  private el: HTMLElement | null = null;
  private showTimer: number | null = null;
  private shown = false;

  constructor(private readonly enabled: boolean) {}

  /** 开始计时。超过阈值还没 finish 才真的显示。 */
  start(): void {
    if (!this.enabled) {
      return;
    }

    this.el = document.getElementById('loading-overlay');
    if (!this.el) {
      throw new Error('index.html 缺少 #loading-overlay 元素');
    }

    this.showTimer = window.setTimeout(() => {
      this.el!.hidden = false;
      this.shown = true;
    }, SHOW_THRESHOLD_MS);
  }

  setProgress(ratio: number): void {
    if (!this.shown || !this.el) {
      return;
    }
    const bar = this.el.querySelector<HTMLElement>('.loading-bar-fill');
    if (bar) {
      bar.style.width = `${Math.round(Math.max(0, Math.min(1, ratio)) * 100)}%`;
    }
  }

  finish(): void {
    if (this.showTimer !== null) {
      window.clearTimeout(this.showTimer);
      this.showTimer = null;
    }
    if (this.el) {
      this.el.hidden = true;
    }
    this.shown = false;
  }

  /** 给 index.html 用的文案,保持和主题层一致 */
  static get label(): string {
    return THEME.copy.loading;
  }
}
