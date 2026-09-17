import type { CrazyGamesSDK } from '../crazygames.d';
import type { PlatformAdapter, PlatformCapabilities, PlatformSettings } from '../PlatformAdapter';

/**
 * CrazyGames HTML5 SDK v3 适配器。
 *
 * 契约:调用方在调广告之前必须自己暂停游戏并停音频,await 返回后再恢复。
 * 官方要求 "mute the audio and pause the game when the ad starts",
 * 由调用方在外层做,比在 adapter 里回调进游戏循环更不容易出错。
 */
export class CrazyGamesAdapter implements PlatformAdapter {
  readonly name = 'crazygames';

  readonly capabilities: PlatformCapabilities = {
    // Basic Launch 不允许广告。Full Launch 再把这三个能力打开,并重新测广告 QA。
    interstitialAds: false,
    rewardedAds: false,
    banners: false,
    cloudSave: true,
    // 播放器外框有喇叭按钮,SDK 通过 settings.muteAudio 把状态给你
    platformProvidesAudioToggle: true,
    // 外框有 loading 动画,你只需要发 loadingStart / loadingStop 信号
    platformProvidesLoadingUI: true,
  };

  private readonly sdk: CrazyGamesSDK;

  constructor(sdk: CrazyGamesSDK) {
    this.sdk = sdk;
  }

  /** 初始化失败直接抛:此时任何平台调用的结果都不可信,不能假装成功继续跑。 */
  async init(): Promise<void> {
    await this.sdk.init();
    console.info('[platform] CrazyGames SDK v3 初始化完成');
  }

  loadingStart(): void {
    this.sdk.game.loadingStart();
  }

  loadingStop(): void {
    this.sdk.game.loadingStop();
  }

  gameplayStart(): void {
    this.sdk.game.gameplayStart();
  }

  gameplayStop(): void {
    this.sdk.game.gameplayStop();
  }

  happyTime(): void {
    this.sdk.game.happytime();
  }

  reportProgress(percentage: number): void {
    const clamped = Math.max(0, Math.min(100, Math.round(percentage)));
    this.sdk.game.reportGameCompletedPercentage(clamped);
  }

  /**
   * Basic Launch 版本不请求广告。否则 Developer Portal 会报
   * "Ads were detected" 并拒绝 Basic 提交。
   */
  async showInterstitial(reason: string): Promise<void> {
    console.info(`[ad] Basic Launch 禁用插屏广告: ${reason}`);
  }

  /**
   * Basic Launch 版本不请求激励视频,所以不会发奖。Full Launch 再恢复
   * requestAd('rewarded') 并重新测"看完才发奖"。
   */
  async showRewarded(reason: string): Promise<boolean> {
    console.info(`[ad] Basic Launch 禁用激励视频,不发奖: ${reason}`);
    return false;
  }

  async showBanner(_containerId: string): Promise<void> {
    console.info('[ad] Basic Launch 禁用 banner');
  }

  clearBanners(): void {
    console.info('[ad] Basic Launch 无 banner 需要清理');
  }

  /** 走 SDK 的 data 模块 = 云存档,玩家换设备进度还在。同步 API,与 localStorage 一致。 */
  save(key: string, value: string): void {
    this.sdk.data.setItem(key, value);
  }

  load(key: string): string | null {
    return this.sdk.data.getItem(key);
  }

  getSettings(): PlatformSettings {
    const { muteAudio, disableChat } = this.sdk.game.settings;
    return { muteAudio, disableChat };
  }

  onSettingsChange(handler: (settings: PlatformSettings) => void): void {
    this.sdk.game.addSettingsChangeListener((settings) => {
      handler({ muteAudio: settings.muteAudio, disableChat: settings.disableChat });
    });
  }
}
