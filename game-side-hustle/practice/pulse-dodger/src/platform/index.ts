import type { PlatformAdapter } from './PlatformAdapter';
import { CrazyGamesAdapter } from './adapters/crazygames';
import { WebAdapter } from './adapters/web';

export type { PlatformAdapter, PlatformCapabilities, PlatformSettings } from './PlatformAdapter';

let current: PlatformAdapter | null = null;

/**
 * 启动时一次性选定平台。
 *
 * 这里判断的是"SDK 脚本在不在",属于**环境探测**,不是异常兜底 ——
 * 一旦选定 CrazyGamesAdapter,后续 SDK 调用出错就该原样抛出去,不会偷偷退回 Web。
 */
export async function initPlatform(): Promise<PlatformAdapter> {
  const sdk = window.CrazyGames?.SDK;
  const adapter: PlatformAdapter = sdk ? new CrazyGamesAdapter(sdk) : new WebAdapter();

  await adapter.init();
  current = adapter;
  return adapter;
}

/** 游戏内部取用。initPlatform 之前调用属于调用顺序写错了,直接抛。 */
export function platform(): PlatformAdapter {
  if (!current) {
    throw new Error('platform() 在 initPlatform() 完成之前被调用');
  }
  return current;
}
