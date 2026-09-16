import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, HAZARD, MOTE, PLAYER, PULSE, u } from '../config';

/** 60Hz 下一帧的毫秒数,用作帧率补偿的基准 */
const FRAME_MS_60 = 1000 / 60;

/** 复活询问的倒计时秒数 */
const REVIVE_PROMPT_SECONDS = 5;
import { THEME } from '../theme';
import { Panel, type PanelButton } from '../ui/Panel';
import { difficultyAt } from '../core/difficulty';
import { GameState } from '../core/GameState';
import { Hud } from '../ui/Hud';
import { platform } from '../../platform';
import { audio } from '../systems/audio';

/**
 * 主玩法场景。
 *
 * 后端类比:这是 request handler —— 每帧收一次输入,跑一遍规则,写一次输出。
 * 平台相关的东西一律不在这里出现,只通过 platform() 接口走。
 */
export class PlayScene extends Phaser.Scene {
  private state!: GameState;
  private hud!: Hud;

  private player!: Phaser.Physics.Arcade.Image;
  private hazards!: Phaser.Physics.Arcade.Group;
  private motes!: Phaser.Physics.Arcade.Group;

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private spaceKey!: Phaser.Input.Keyboard.Key;

  private nextHazardAt = 0;
  private nextMoteAt = 0;
  /** 死亡处理中,用来防止同一帧内多次触发结算 */
  private resolving = false;
  /** 暂停中。和 resolving 分开:死亡流程不允许被暂停打断 */
  private paused = false;
  private pausePanel: Panel | null = null;
  private pauseButton!: Phaser.GameObjects.Text;

  constructor() {
    super('Play');
  }

  create(): void {
    this.state = new GameState();
    this.resolving = false;
    this.nextHazardAt = 0;
    this.nextMoteAt = 0;

    this.cameras.main.setBackgroundColor(THEME.bg);
    this.drawStarfield();

    this.player = this.physics.add
      .image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'tex-player')
      .setCircle(PLAYER.radius, PLAYER.radius * 1.0, PLAYER.radius * 1.0)
      .setCollideWorldBounds(true);

    this.hazards = this.physics.add.group({ allowGravity: false });
    this.motes = this.physics.add.group({ allowGravity: false });

    this.physics.add.overlap(this.player, this.motes, this.onCollectMote, undefined, this);
    this.physics.add.overlap(this.player, this.hazards, this.onHitHazard, undefined, this);

    this.hud = new Hud(this);

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.input.on('pointerdown', this.tryPulse, this);
    this.spaceKey.on('down', this.tryPulse, this);

    this.createPauseControls();

    // 平台信号:玩家真正开始玩了
    platform().gameplayStart();
  }

  // ---------------------------------------------------------------- 暂停

  /**
   * 暂停有两个入口,缺一不可:
   *   主动 —— 玩家按 ESC 或点暂停按钮,他知道自己按了
   *   被动 —— 窗口失焦,玩家毫不知情。**这个比主动的更重要**
   *
   * 关于 Phaser 的默认行为(实测 node_modules/phaser/src/core/Game.js):
   *   切标签页(HIDDEN)  → Phaser 会自己 loop.pause(),游戏事实上停住了
   *   点到别的窗口(BLUR) → Phaser 只设 inFocus=false,**游戏继续跑**
   * 所以 BLUR 是真缺口。而 HIDDEN 虽然 Phaser 停了循环,但它会在回来时
   * **立刻自动恢复**,玩家还没反应过来就要操作 —— 所以这里也接管,
   * 让玩家自己点"继续"再开始。
   */
  private createPauseControls(): void {
    this.pauseButton = this.add
      .text(GAME_WIDTH - THEME.space.md, THEME.space.sm, THEME.copy.pauseGlyph, {
        fontSize: THEME.font.body,
        color: THEME.text.dim,
        backgroundColor: '#1e293b88',
        padding: { x: THEME.space.sm, y: THEME.space.xs },
      })
      .setOrigin(1, 0)
      .setDepth(100)
      .setInteractive({ useHandCursor: true });

    this.pauseButton.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // 阻止这次点击继续冒泡去触发冲击波
      pointer.event.stopPropagation();
      this.pauseGame(false);
    });

    this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC).on('down', () => {
      if (this.paused) {
        this.resumeGame();
      } else {
        this.pauseGame(false);
      }
    });

    const onBlur = (): void => this.pauseGame(true);
    const onVisible = (): void => this.pauseGame(true);
    this.game.events.on(Phaser.Core.Events.BLUR, onBlur);
    this.game.events.on(Phaser.Core.Events.VISIBLE, onVisible);

    // **场景级清理**。Phaser 的场景切走后 game.events 上的监听不会自动移除,
    // 不解绑的话下次进 Play 会重复注册,失焦一次弹出多个面板。
    // 后端里请求结束一切自动回收,游戏里没有这个保障,必须手写。
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.game.events.off(Phaser.Core.Events.BLUR, onBlur);
      this.game.events.off(Phaser.Core.Events.VISIBLE, onVisible);
      this.pausePanel?.destroy();
      this.pausePanel = null;
    });
  }

  private pauseGame(auto: boolean): void {
    // 死亡结算 / 广告流程中不允许暂停,否则会和复活询问的倒计时打架
    if (this.paused || this.resolving) {
      return;
    }

    this.paused = true;
    this.physics.pause();
    this.tweens.pauseAll();
    this.time.paused = true;
    this.pauseButton.setVisible(false);

    // 暂停期间不算"在玩",要通知平台,否则平台数据会虚高
    platform().gameplayStop();

    const buttons: PanelButton[] = [
      { label: THEME.copy.resume, style: 'primary' as const, onClick: () => this.resumeGame() },
      { label: THEME.copy.quitToMenu, style: 'ghost' as const, onClick: () => this.quitToMenu() },
    ];

    // 平台没提供静音时,暂停面板里顺手给一个 —— 这是玩家最可能想在这里调的东西
    if (!platform().capabilities.platformProvidesAudioToggle) {
      buttons.splice(1, 0, {
        label: audio.isUserMuted ? THEME.copy.soundOff : THEME.copy.soundOn,
        style: 'ghost' as const,
        onClick: () => {
          const muted = audio.toggleUserMuted();
          this.pausePanel?.setButtonLabel(1, muted ? THEME.copy.soundOff : THEME.copy.soundOn);
        },
      });
    }

    this.pausePanel = new Panel(this, {
      title: THEME.copy.paused,
      subtitle: auto ? THEME.copy.autoPausedHint : undefined,
      buttons,
    });
  }

  private resumeGame(): void {
    if (!this.paused) {
      return;
    }

    this.paused = false;
    this.pausePanel?.destroy();
    this.pausePanel = null;
    this.pauseButton.setVisible(true);

    this.physics.resume();
    this.tweens.resumeAll();
    this.time.paused = false;

    // 给 0.6 秒缓冲再恢复生成,避免"点继续的瞬间被一直悬在头上的碎片撞死"
    this.nextHazardAt = this.time.now + 600;

    platform().gameplayStart();
  }

  private quitToMenu(): void {
    this.paused = false;
    this.time.paused = false;
    this.tweens.resumeAll();
    this.scene.start('Menu');
  }

  override update(_time: number, delta: number): void {
    if (this.resolving || this.paused) {
      return;
    }

    this.state.tick(delta);
    this.movePlayer(delta);
    this.spawnByDifficulty();
    this.cullOffscreen();
    this.hud.update(this.state);
  }

  // ---------------------------------------------------------------- 输入

  private movePlayer(delta: number): void {
    const pointer = this.input.activePointer;

    // 指针按下过或正在移动 -> 跟随指针;否则走键盘。两套输入并存,
    // 桌面和手机都能玩,这是 CrazyGames 技术要求里明确列的一条。
    const usingKeyboard =
      this.cursors.left.isDown ||
      this.cursors.right.isDown ||
      this.cursors.up.isDown ||
      this.cursors.down.isDown;

    if (usingKeyboard) {
      const step = (PLAYER.keyboardSpeed * delta) / 1000;
      const dx = (this.cursors.right.isDown ? 1 : 0) - (this.cursors.left.isDown ? 1 : 0);
      const dy = (this.cursors.down.isDown ? 1 : 0) - (this.cursors.up.isDown ? 1 : 0);
      const len = Math.hypot(dx, dy) || 1;
      this.player.x = Phaser.Math.Clamp(this.player.x + (dx / len) * step, 0, GAME_WIDTH);
      this.player.y = Phaser.Math.Clamp(this.player.y + (dy / len) * step, 0, GAME_HEIGHT);
      return;
    }

    const world = pointer.positionToCamera(this.cameras.main) as Phaser.Math.Vector2;

    // **帧率补偿**。直接每帧 lerp 固定比例会让 144Hz 显示器上的跟随速度
    // 快 2.4 倍、165Hz 快 2.75 倍 —— 等于不同硬件难度不同,
    // CrazyGames 明文要求 "physics must perform consistently across
    // different monitor refresh rates"。
    // 这里把"每帧 18%"换算成"每 16.667ms 18%",任何刷新率下手感一致。
    const t = 1 - Math.pow(1 - PLAYER.followLerp, delta / FRAME_MS_60);
    this.player.x = Phaser.Math.Linear(this.player.x, world.x, t);
    this.player.y = Phaser.Math.Linear(this.player.y, world.y, t);
  }

  private tryPulse(): void {
    if (this.resolving || this.paused || !this.state.pulseReady) {
      return;
    }

    const cleared: Phaser.Physics.Arcade.Image[] = [];
    for (const obj of this.hazards.getChildren()) {
      const hazard = obj as Phaser.Physics.Arcade.Image;
      if (!hazard.active) continue;
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, hazard.x, hazard.y);
      if (dist <= PULSE.radius) {
        cleared.push(hazard);
      }
    }

    const gained = this.state.spendPulse(cleared.length);
    audio.pulse();
    this.playShockwave();

    for (const hazard of cleared) {
      this.burst(hazard.x, hazard.y, THEME.entity.hazard);
      hazard.destroy();
    }

    if (gained > 0) {
      this.floatText(this.player.x, this.player.y - 40, `+${gained}`, THEME.entity.pulse);
    }

    // 一次清掉一大片 = 玩家爽到了。平台用这个信号优化广告时机和推荐权重。
    if (cleared.length >= PULSE.happyTimeThreshold) {
      platform().happyTime();
    }
  }

  // ---------------------------------------------------------------- 生成

  private spawnByDifficulty(): void {
    const now = this.time.now;
    const d = difficultyAt(this.state.elapsedSeconds);

    if (now >= this.nextHazardAt) {
      for (let i = 0; i < d.hazardBatch; i++) {
        this.spawnHazard(u(d.hazardSpeed));
      }
      this.nextHazardAt = now + d.hazardIntervalMs;
    }

    if (now >= this.nextMoteAt) {
      this.spawnMote();
      this.nextMoteAt = now + d.moteIntervalMs;
    }
  }

  /** 从屏幕外某条边生成,朝对侧偏随机角度飞过 —— 保证总有可躲的缝隙。 */
  private spawnHazard(speed: number): void {
    const edge = Phaser.Math.Between(0, 3);
    const margin = HAZARD.spawnMargin;
    let x = 0;
    let y = 0;

    switch (edge) {
      case 0: x = Phaser.Math.Between(0, GAME_WIDTH); y = -margin; break;
      case 1: x = GAME_WIDTH + margin; y = Phaser.Math.Between(0, GAME_HEIGHT); break;
      case 2: x = Phaser.Math.Between(0, GAME_WIDTH); y = GAME_HEIGHT + margin; break;
      default: x = -margin; y = Phaser.Math.Between(0, GAME_HEIGHT); break;
    }

    const hazard = this.hazards.create(x, y, 'tex-hazard') as Phaser.Physics.Arcade.Image;
    hazard.setCircle(HAZARD.radius, HAZARD.radius, HAZARD.radius);

    // 朝屏幕中心附近飞,加一点随机偏移,避免全部撞向正中央
    const targetX = GAME_WIDTH / 2 + Phaser.Math.Between(-HAZARD.scatterX, HAZARD.scatterX);
    const targetY = GAME_HEIGHT / 2 + Phaser.Math.Between(-HAZARD.scatterY, HAZARD.scatterY);
    const angle = Phaser.Math.Angle.Between(x, y, targetX, targetY);
    hazard.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    // 角速度是纯视觉旋转,不涉及空间距离,不需要过 u()
    hazard.setAngularVelocity(Phaser.Math.Between(-HAZARD.spinRange, HAZARD.spinRange));
  }

  private spawnMote(): void {
    const inset = THEME.space.xl;
    const mote = this.motes.create(
      Phaser.Math.Between(inset, GAME_WIDTH - inset),
      Phaser.Math.Between(inset, GAME_HEIGHT - inset),
      'tex-mote',
    ) as Phaser.Physics.Arcade.Image;
    mote.setCircle(MOTE.radius, MOTE.radius, MOTE.radius);
    mote.setScale(0);

    this.tweens.add({ targets: mote, scale: 1, duration: 220, ease: 'Back.Out' });
    // 8 秒没被吃就消失,避免屏幕上越堆越多
    this.time.delayedCall(8000, () => {
      if (mote.active) {
        this.tweens.add({ targets: mote, scale: 0, duration: 200, onComplete: () => mote.destroy() });
      }
    });
  }

  private cullOffscreen(): void {
    const pad = HAZARD.cullPadding;
    for (const obj of this.hazards.getChildren()) {
      const h = obj as Phaser.Physics.Arcade.Image;
      if (h.x < -pad || h.x > GAME_WIDTH + pad || h.y < -pad || h.y > GAME_HEIGHT + pad) {
        h.destroy();
      }
    }
  }

  // ---------------------------------------------------------------- 碰撞

  private onCollectMote: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (_player, moteObj) => {
    const mote = moteObj as Phaser.Physics.Arcade.Image;
    if (!mote.active) return;

    mote.destroy();
    this.state.collectMote();
    audio.collect();
    this.burst(mote.x, mote.y, THEME.entity.mote);

    // 用"当前分 / 历史最高分"近似进度,给平台一个能读的完成度
    if (this.state.best > 0) {
      platform().reportProgress((this.state.score / this.state.best) * 100);
    }
  };

  private onHitHazard: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = () => {
    if (this.resolving) return;
    void this.handleDeath();
  };

  private async handleDeath(): Promise<void> {
    this.resolving = true;
    this.physics.pause();
    audio.hit();
    this.cameras.main.shake(260, 0.012);
    this.burst(this.player.x, this.player.y, THEME.entity.hazard, 26);
    this.player.setVisible(false);

    platform().gameplayStop();

    // 每局只给一次复活机会,且必须平台真的支持激励视频才提示
    if (!this.state.reviveUsed && platform().capabilities.rewardedAds) {
      const accepted = await this.askRevive();
      if (accepted) {
        const rewarded = await platform().showRewarded('revive');
        // 只有真的看完广告才复活。adError / 中途关闭一律不发奖。
        if (rewarded) {
          this.revive();
          return;
        }
      }
    }

    this.finishRun();
  }

  /**
   * 复活询问。用共用的 Panel,不再手搓一套 —— 手搓的那版既没走 theme.copy
   * (以后做多语言会漏翻译),也没走 Panel(换皮时不会跟着变)。
   *
   * 5 秒倒计时:点了算接受,超时算放弃。不给"拒绝"按钮是刻意的 ——
   * 多一个按钮只会让玩家多一次决策,而超时本身就等于拒绝。
   */
  private askRevive(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      let remaining = REVIVE_PROMPT_SECONDS;

      const panel = new Panel(this, {
        title: THEME.copy.reviveTitle,
        subtitle: THEME.copy.reviveCountdown(remaining),
        buttons: [
          {
            label: THEME.copy.reviveButton,
            style: 'warning',
            onClick: () => {
              timer.remove();
              panel.destroy();
              resolve(true);
            },
          },
        ],
      });

      const timer = this.time.addEvent({
        delay: 1000,
        repeat: REVIVE_PROMPT_SECONDS - 1,
        callback: () => {
          remaining -= 1;
          panel.setSubtitle(THEME.copy.reviveCountdown(remaining));
          if (remaining <= 0) {
            panel.destroy();
            resolve(false);
          }
        },
      });
    });
  }

  private revive(): void {
    this.state.reviveUsed = true;

    // 清场给玩家一个喘息窗口,否则复活即死,广告等于白看
    for (const obj of this.hazards.getChildren().slice()) {
      (obj as Phaser.Physics.Arcade.Image).destroy();
    }

    this.player.setPosition(GAME_WIDTH / 2, GAME_HEIGHT / 2).setVisible(true).setAlpha(0.4);
    this.tweens.add({ targets: this.player, alpha: 1, duration: 200, yoyo: true, repeat: 4 });

    this.physics.resume();
    this.nextHazardAt = this.time.now + 1200;
    this.resolving = false;

    platform().gameplayStart();
  }

  private finishRun(): void {
    const { isNewBest } = this.state.finish();
    if (isNewBest) {
      platform().happyTime();
    }

    this.time.delayedCall(420, () => {
      this.scene.start('Result', {
        score: this.state.score,
        best: this.state.best,
        isNewBest,
        survivedSeconds: Math.floor(this.state.elapsedSeconds),
      });
    });
  }

  // ---------------------------------------------------------------- 表现

  private drawStarfield(): void {
    const g = this.add.graphics().setDepth(-10);
    g.fillStyle(THEME.bgAccent, 0.55);
    for (let i = 0; i < THEME.starfield.count; i++) {
      g.fillCircle(
        Phaser.Math.Between(0, GAME_WIDTH),
        Phaser.Math.Between(0, GAME_HEIGHT),
        Phaser.Math.Between(THEME.starfield.minRadius, THEME.starfield.maxRadius),
      );
    }
  }

  private playShockwave(): void {
    const ring = this.add.circle(this.player.x, this.player.y, 10).setDepth(50);
    ring.setStrokeStyle(4, THEME.entity.pulse, 1);
    this.tweens.add({
      targets: ring,
      radius: PULSE.radius,
      alpha: 0,
      duration: 380,
      ease: 'Cubic.Out',
      // Arc.radius 是带 updateData() 的 setter,tween 可以直接驱动,无需 onUpdate 回写
      onComplete: () => ring.destroy(),
    });
  }

  private burst(x: number, y: number, color: number, count = 12): void {
    const emitter = this.add.particles(x, y, 'tex-spark', {
      speed: { min: 60, max: 230 },
      lifespan: 420,
      quantity: count,
      scale: { start: 0.9, end: 0 },
      alpha: { start: 1, end: 0 },
      tint: color,
      emitting: false,
    });
    emitter.explode(count);
    this.time.delayedCall(600, () => emitter.destroy());
  }

  private floatText(x: number, y: number, label: string, color: number): void {
    const text = this.add
      .text(x, y, label, {
        fontSize: THEME.font.button,
        color: `#${color.toString(16).padStart(6, '0')}`,
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setDepth(120);

    this.tweens.add({
      targets: text,
      y: y - 48,
      alpha: 0,
      duration: 700,
      onComplete: () => text.destroy(),
    });
  }
}
