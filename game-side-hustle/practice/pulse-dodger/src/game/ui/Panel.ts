import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config';
import { THEME } from '../theme';
import { audio } from '../systems/audio';

/**
 * 弹出面板的通用构造器。
 *
 * 为什么值得单独抽出来:暂停、设置、复活询问三处都需要
 * "半透明遮罩 + 居中卡片 + 一列按钮",而且**都要挡住底下的点击**。
 * 不抽的话这段布局代码会被抄三遍,改一次样式要改三处。
 *
 * 样式全部读 THEME,所以换皮时这个文件一行都不用动。
 */

export type ButtonStyle = 'primary' | 'warning' | 'ghost';

export interface PanelButton {
  label: string;
  style?: ButtonStyle;
  onClick: () => void;
}

export interface PanelOptions {
  title: string;
  /** 标题下的一行小字,可选 */
  subtitle?: string;
  buttons: PanelButton[];
  /** 面板宽度,不给就按内容估 */
  width?: number;
}

export class Panel {
  private readonly container: Phaser.GameObjects.Container;
  /** 按钮文本对象,便于外部改文案(例如音效开/关切换) */
  private readonly buttonTexts: Phaser.GameObjects.Text[] = [];
  /** 副标题对象,用于倒计时这类需要每秒刷新的场景 */
  private subtitleText: Phaser.GameObjects.Text | null = null;

  constructor(scene: Phaser.Scene, options: PanelOptions) {
    const { panel, space } = THEME;
    const width = options.width ?? panel.defaultWidth;
    const buttonCount = options.buttons.length;
    // 高度按实际排版算,不要拍脑袋给个大概值 —— 否则面板底部会留一块空白
    const height =
      panel.headerHeight +
      (options.subtitle ? panel.subtitleHeight : 0) +
      buttonCount * panel.buttonRow +
      panel.bottomPadding;

    this.container = scene.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2).setDepth(500);

    // 全屏遮罩。setInteractive 是关键:挡住底下场景的点击,
    // 否则玩家点"继续"按钮旁边的空白会穿透到游戏里放技能。
    const scrim = scene.add
      .rectangle(0, 0, GAME_WIDTH * 2, GAME_HEIGHT * 2, THEME.scrimFill, THEME.scrimAlpha)
      .setInteractive();

    const card = scene.add
      .rectangle(0, 0, width, height, THEME.overlayFill, THEME.overlayAlpha)
      .setStrokeStyle(THEME.panel.strokeWidth, THEME.entity.player);

    const top = -height / 2;

    const title = scene.add
      .text(0, top + space.lg, options.title, {
        fontSize: THEME.font.button,
        color: THEME.text.primary,
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.container.add([scrim, card, title]);

    let cursorY = top + panel.headerHeight;

    if (options.subtitle) {
      const subtitle = scene.add
        .text(0, cursorY, options.subtitle, {
          fontSize: THEME.font.small,
          color: THEME.text.dim,
          align: 'center',
          wordWrap: { width: width - space.xl },
        })
        .setOrigin(0.5);
      this.subtitleText = subtitle;
      this.container.add(subtitle);
      cursorY += panel.subtitleHeight;
    }

    for (const spec of options.buttons) {
      const style = spec.style ?? 'primary';
      const text = scene.add
        .text(0, cursorY + space.md, spec.label, {
          fontSize: THEME.font.body,
          color: styleTextColor(style),
          backgroundColor: styleBgColor(style),
          padding: { x: THEME.button.paddingX, y: space.xs },
          fixedWidth: width - panel.buttonWidthInset,
          align: 'center',
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      text.on('pointerdown', () => {
        audio.uiClick();
        spec.onClick();
      });

      this.buttonTexts.push(text);
      this.container.add(text);
      cursorY += panel.buttonRow;
    }
  }

  /** 运行时改副标题,用于倒计时 */
  setSubtitle(label: string): void {
    if (!this.subtitleText) {
      throw new Error('Panel 创建时没有 subtitle,无法 setSubtitle');
    }
    this.subtitleText.setText(label);
  }

  /** 运行时改按钮文案,用于"音效:开 / 音效:关"这种就地切换 */
  setButtonLabel(index: number, label: string): void {
    const text = this.buttonTexts[index];
    if (!text) {
      throw new Error(`Panel 没有第 ${index} 个按钮`);
    }
    text.setText(label);
  }

  destroy(): void {
    this.container.destroy();
  }
}

function styleBgColor(style: ButtonStyle): string {
  if (style === 'primary') return THEME.button.primaryBg;
  if (style === 'warning') return THEME.button.warningBg;
  return THEME.button.ghostBg;
}

function styleTextColor(style: ButtonStyle): string {
  if (style === 'primary') return THEME.button.primaryText;
  if (style === 'warning') return THEME.button.warningText;
  return THEME.button.ghostText;
}
