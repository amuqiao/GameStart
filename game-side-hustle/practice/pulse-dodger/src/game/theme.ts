import { u } from './config';

/**
 * 主题层 —— 换皮时**只改这个文件**。
 *
 * 这里放的全部是"视觉决策":颜色、字号、面板样式、文案。
 * 玩法数值(速度、分数、充能量)在 config.ts,换皮时不要动。
 *
 * 这条切分线是整个模板可复用性的关键:
 *   config.ts  = 游戏是什么     → 换玩法时改
 *   theme.ts   = 游戏长什么样   → 换皮时改
 * 混在一起的话,换个配色要小心绕开数值,换个难度要小心绕开颜色。
 */

export const THEME = {
  name: 'neon-dark',

  /** 画布与遮罩 */
  bg: 0x080b14,
  bgAccent: 0x121a2e,
  overlayFill: 0x0f172a,
  overlayAlpha: 0.94,
  scrimFill: 0x000000,
  scrimAlpha: 0.62,

  /** 三种实体的颜色 */
  entity: {
    player: 0x5eead4,
    playerGlow: 0x14b8a6,
    hazard: 0xf43f5e,
    hazardGlow: 0x7f1d3a,
    mote: 0x38bdf8,
    moteGlow: 0x0c4a6e,
    pulse: 0xfacc15,
  },

  /** 文字颜色,CSS 字符串形式(Phaser 文本对象要的是字符串) */
  text: {
    primary: '#e2e8f0',
    dim: '#64748b',
    accent: '#5eead4',
    warning: '#facc15',
    onAccent: '#0f172a',
  },

  /**
   * 字号刻度(type scale)。写的是设计单位,u() 换算成实际像素。
   * 各场景只许引用这里的名字,不许自己写 '24px' —— 那就是 magic number。
   */
  font: {
    title: `${u(62)}px`,
    heading: `${u(52)}px`,
    score: `${u(86)}px`,
    hudScore: `${u(40)}px`,
    button: `${u(28)}px`,
    body: `${u(18)}px`,
    /** 小字下限。设计单位 15px,在平台最小 iframe(800×450)下实际显示约 12.5px,仍可读 */
    small: `${u(15)}px`,
  },

  /**
   * 间距刻度(spacing scale)。相当于前端的 --space-*。
   * 布局里不许出现裸数字,一律引用这里的名字。
   */
  space: {
    xs: u(8),
    sm: u(16),
    md: u(24),
    lg: u(40),
    xl: u(64),
  },

  /**
   * 纵向锚点。**写成画布高度的比例,不是绝对像素。**
   *
   * 这是让"改分辨率只改一个数"成立的关键:比例不随分辨率变化,
   * 所以 GAME_HEIGHT 从 540 变成 1080 时,布局代码一行都不用动。
   *
   * 各场景按语义取用,而不是各写各的坐标 —— 这样几个页面的
   * 标题、主按钮、页脚会自动对齐在同一高度上。
   */
  anchor: {
    heading: 0.21,      // 次级页面的标题(结算、设置)
    title: 0.26,        // 主页大标题
    lead: 0.36,         // 副标题 / 大分数
    meta: 0.46,         // 次要信息(最高分、存活时间)
    action: 0.63,       // 主操作按钮
    subAction: 0.76,    // 次要操作按钮
    footer: 0.92,       // 页脚提示
  },

  /** 按钮样式 */
  button: {
    paddingX: u(28),
    paddingY: u(14),
    primaryBg: '#5eead4',
    primaryText: '#0f172a',
    warningBg: '#facc15',
    warningText: '#0f172a',
    ghostBg: '#1e293b',
    ghostText: '#e2e8f0',
  },

  /** 面板 */
  panel: {
    strokeWidth: 2,
    cornerRadius: u(10),
    defaultWidth: u(420),
    /** 排版参数:标题区高度 / 副标题行高 / 按钮行距 / 底部留白,全是设计单位 */
    headerHeight: u(82),
    subtitleHeight: u(34),
    buttonRow: u(56),
    bottomPadding: u(24),
    buttonWidthInset: u(120),
  },

  /** HUD 充能条 */
  chargeBar: {
    width: u(220),
    height: u(12),
    radius: u(6),
    /** 距画布顶部的距离,设计单位 */
    top: u(58),
    trackFill: 0x1e293b,
  },

  /** 星空背景密度 */
  starfield: {
    count: 60,
    menuCount: 46,
    minRadius: u(1),
    maxRadius: u(3),
    alpha: 0.55,
  },

  /** 所有面向玩家的文案。做多语言时把这一块换成 i18n 查表即可 */
  copy: {
    gameTitle: 'PULSE DODGER',
    tagline: '躲开红色碎片 · 吃蓝色能量 · 充满后释放冲击波',
    controls: '鼠标 / 手指移动控制 · 空格或点击释放冲击波 · ESC 暂停',
    startPrompt: '点击任意位置开始',
    bestScore: '最高分',
    settings: '设置',
    pulseReady: 'PULSE READY — 点击 / 空格',
    pauseGlyph: 'II',
    paused: '已暂停',
    resume: '继续游戏',
    quitToMenu: '回到主页',
    autoPausedHint: '窗口失去焦点,已自动暂停',
    gameOver: 'GAME OVER',
    newBest: 'NEW BEST!',
    playAgain: '再来一局',
    reviveTitle: '看一段广告,原地复活',
    reviveButton: '看广告复活',
    reviveCountdown: (n: number) => `${n} 秒后结算`,
    survivedFor: (s: number, best: number) => `存活 ${s} 秒  ·  最高分 ${best}`,
    resultTip: '提示:充能满时释放冲击波,一次清掉 4 个以上碎片分数最高',
    loading: '加载中',
    soundOn: '音效:开',
    soundOff: '音效:关',
    back: '返回',
    settingsEmptyHint: '当前平台已提供音量控制,游戏内无需重复设置',
  },
} as const;
