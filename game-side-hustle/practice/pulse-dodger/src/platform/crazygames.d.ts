/**
 * CrazyGames HTML5 SDK v3 类型声明。
 *
 * 为什么必须手写这个文件:
 *   CrazyGames 没有公开 GitHub organization,npm 上没有官方包,也没有 @types/*。
 *   SDK 只能通过 index.html 的 <script> 标签加载,在 TypeScript 里就是一个
 *   "运行时才存在的全局变量"。不声明它,`window.CrazyGames` 会直接编译失败:
 *     TS2339: Property 'CrazyGames' does not exist on type 'Window & typeof globalThis'.
 *
 * 签名依据 https://docs.crazygames.com/sdk/ 各模块页面,核对日期 2026-09-16。
 * 只声明本项目实际用到的部分,用不到的模块(purchases / leaderboards / 多人房间)
 * 故意不写 —— 声明了却不用,反而会让人以为已经接好了。
 */

/** 播放器外框的平台级设置。游戏必须响应 muteAudio,否则 QA 会被打回。 */
export interface CrazyGamesSettings {
  muteAudio: boolean;
  disableChat: boolean;
}

/**
 * 广告回调。注意这里是回调式,不是 Promise 式。
 * adFinished = 广告正常播完;adError = 播放失败 **或者根本没有广告库存**。
 * 对 rewarded 来说,这两者的区别就是"发不发奖",绝不能混为一谈。
 */
export interface CrazyGamesAdCallbacks {
  adStarted?: () => void;
  adFinished?: () => void;
  adError?: (error: unknown) => void;
}

export type CrazyGamesAdType = 'midgame' | 'rewarded';

export interface CrazyGamesBannerOptions {
  id: string;
  width: number;
  height: number;
}

export interface CrazyGamesUser {
  username: string;
  profilePictureUrl: string;
}

export interface CrazyGamesSDK {
  init(): Promise<void>;

  game: {
    settings: CrazyGamesSettings;
    addSettingsChangeListener(listener: (settings: CrazyGamesSettings) => void): void;
    removeSettingsChangeListener(listener: (settings: CrazyGamesSettings) => void): void;
    loadingStart(): void;
    loadingStop(): void;
    gameplayStart(): void;
    gameplayStop(): void;
    happytime(): void;
    reportGameCompletedPercentage(percentage: number): void;
  };

  ad: {
    requestAd(adType: CrazyGamesAdType, callbacks?: CrazyGamesAdCallbacks): void;
  };

  banner: {
    requestBanner(options: CrazyGamesBannerOptions): Promise<void>;
    requestResponsiveBanner(containerId: string): Promise<void>;
    clearBanner(containerId: string): void;
    clearAllBanners(): void;
  };

  /** 云存档。API 形状与 localStorage 完全一致,而且是**同步**的。 */
  data: {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
    clear(): void;
  };

  user: {
    readonly isUserAccountAvailable: boolean;
    getUser(): Promise<CrazyGamesUser | null>;
    getUserToken(): Promise<string>;
    showAuthPrompt(): Promise<CrazyGamesUser>;
    addAuthListener(listener: (user: CrazyGamesUser | null) => void): void;
    removeAuthListener(listener: (user: CrazyGamesUser | null) => void): void;
  };
}

declare global {
  interface Window {
    /** SDK 脚本没加载完 / 不在 CrazyGames 环境里时为 undefined —— 所以必须是可选的。 */
    CrazyGames?: { SDK: CrazyGamesSDK };
  }
}

export {};
