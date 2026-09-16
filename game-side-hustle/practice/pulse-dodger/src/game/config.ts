/**
 * 玩法数值 + 单位体系 —— 换玩法时改这个文件。
 *
 * 视觉相关的一切(颜色、字号、间距、文案)在 theme.ts,换皮时改那边。
 *
 * ── 单位体系 ──────────────────────────────────────────────
 * 整套 UI 和数值都按 **960×540 设计单位** 写,和实际渲染多少像素解耦。
 * 想换渲染分辨率,**只改 RENDER_WIDTH 一个数**,其余全部自动跟着走。
 *
 * 这套做法等价于前端的 rem:你按设计稿单位写,一个根值决定最终像素。
 */

/** 设计基准。所有布局数字都按这个宽度设计,不要改。 */
const DESIGN_WIDTH = 960;

/**
 * 实际渲染宽度 —— **改分辨率只改这一个数**。
 *
 * 选 1920 的理由:这正好是 CrazyGames 列出的最大 iframe 尺寸
 * (桌面全屏 1920×1080),意味着在平台内永远不会被放大,只会被缩小。
 * 位图放大会糊,缩小不会。
 *
 * 如果某款游戏粒子特别重、要照顾低配 Chromebook,把这里调回 960 即可,
 * 其余代码一行不用动。
 */
export const RENDER_WIDTH = 1920;

/** 设计单位 → 实际像素的换算系数 */
export const UI_SCALE = RENDER_WIDTH / DESIGN_WIDTH;

/** 把设计单位换算成实际像素。所有空间类数值都要过这个函数。 */
export const u = (designUnits: number): number => Math.round(designUnits * UI_SCALE);

// 16:9 固定。CrazyGames 列出的 8 种 iframe 尺寸全是 16:9,不需要支持别的比例。
export const GAME_WIDTH = RENDER_WIDTH;
export const GAME_HEIGHT = Math.round((RENDER_WIDTH * 9) / 16);

// ── 玩法数值 ──────────────────────────────────────────────
// 空间类(半径、速度、距离)统一写成 u(设计单位);
// 非空间类(分数、充能、毫秒、阈值)是纯数字,**不要**乘 UI_SCALE。

export const PLAYER = {
  radius: u(14),
  /**
   * 跟随指针的插值强度。表示"每 16.667ms 向目标靠拢多少比例"。
   * 注意 PlayScene 里会按实际 delta 做帧率补偿 —— 直接每帧乘会导致
   * 144Hz 显示器上跟随速度快 2.4 倍,违反 CrazyGames 的帧率一致性要求。
   */
  followLerp: 0.18,
  /** 键盘速度,设计单位 px/s */
  keyboardSpeed: u(420),
} as const;

export const MOTE = {
  radius: u(8),
  scorePerMote: 10,
  chargePerMote: 12,
} as const;

export const HAZARD = {
  radius: u(12),
  /** 出屏多远算离场,可以被回收 */
  cullPadding: u(120),
  /** 在屏幕外多远生成 */
  spawnMargin: u(40),
  /** 飞向屏幕中心时的随机偏移范围 */
  scatterX: u(220),
  scatterY: u(140),
  /** 旋转角速度范围(度/秒),纯视觉,不随分辨率变化 */
  spinRange: 120,
} as const;

export const PULSE = {
  maxCharge: 100,
  radius: u(190),
  scorePerHazardCleared: 25,
  /** 一次清掉多少个才算"爽到",触发 platform.happyTime() */
  happyTimeThreshold: 4,
} as const;

/** 存档 key。加前缀,避免和同域下别的游戏撞车。 */
export const SAVE_KEYS = {
  bestScore: 'pulse-dodger:best-score',
  runsPlayed: 'pulse-dodger:runs-played',
  userMuted: 'pulse-dodger:user-muted',
} as const;

export const BANNER_CONTAINER_ID = 'banner-bottom';
