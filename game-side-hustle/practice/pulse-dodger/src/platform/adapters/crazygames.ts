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
    interstitialAds: true,
    rewardedAds: true,
    banners: true,
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
   * 插屏广告。requestAd 是回调式的,这里包成 Promise。
   * adError 在"播放出错"和"当前没有广告库存"两种情况下都会触发,
   * 对插屏而言两者处理方式相同:结束等待,让游戏继续。
   */
  showInterstitial(reason: string): Promise<void> {
    return new Promise<void>((resolve) => {
      this.sdk.ad.requestAd('midgame', {
        adStarted: () => console.info(`[ad] midgame 开始: ${reason}`),
        adFinished: () => {
          console.info(`[ad] midgame 播放完成: ${reason}`);
          resolve();
        },
        adError: (error) => {
          console.info(`[ad] midgame 未播放(无库存或出错): ${reason}`, error);
          resolve();
        },
      });
    });
  }

  /**
   * 激励视频。返回值直接决定发不发奖 —— 这是整个适配层最关键的一行逻辑。
   *   adFinished -> true : 玩家完整看完了,发奖
   *   adError    -> false: 中途关闭 / 无库存 / 出错,**不发奖**
   * 把 adError 也当成 true 会导致奖励白送;把 adFinished 漏掉会导致该发不发。
   */
  showRewarded(reason: string): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.sdk.ad.requestAd('rewarded', {
        adStarted: () => console.info(`[ad] rewarded 开始: ${reason}`),
        adFinished: () => {
          console.info(`[ad] rewarded 看完,发奖: ${reason}`);
          resolve(true);
        },
        adError: (error) => {
          console.info(`[ad] rewarded 未完成,不发奖: ${reason}`, error);
          resolve(false);
        },
      });
    });
  }

  async showBanner(containerId: string): Promise<void> {
    await this.sdk.banner.requestResponsiveBanner(containerId);
  }

  clearBanners(): void {
    this.sdk.banner.clearAllBanners();
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
