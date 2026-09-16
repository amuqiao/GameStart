/**
 * 难度曲线。刻意做成**纯函数**:输入存活秒数,输出这一刻的生成参数。
 * 好处是可以直接单元测试,也方便用表格核对手感,不用进游戏反复试。
 */
export interface DifficultySnapshot {
  /** 两个危险物之间的生成间隔(ms) */
  hazardIntervalMs: number;
  /** 危险物移动速度(px/s) */
  hazardSpeed: number;
  /** 每次生成几个 */
  hazardBatch: number;
  /** 能量点生成间隔(ms) */
  moteIntervalMs: number;
}

export function difficultyAt(elapsedSeconds: number): DifficultySnapshot {
  // 90 秒内从 0 线性爬到 1,之后封顶。给新手足够的"我还行"的窗口期。
  const t = Math.min(elapsedSeconds / 90, 1);

  return {
    hazardIntervalMs: lerp(900, 260, t),
    hazardSpeed: lerp(150, 400, t),
    hazardBatch: elapsedSeconds > 45 ? 2 : 1,
    // 能量点保持稳定供给,否则后期没法充能,难度会陡然失控
    moteIntervalMs: lerp(1400, 1000, t),
  };
}

function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}
