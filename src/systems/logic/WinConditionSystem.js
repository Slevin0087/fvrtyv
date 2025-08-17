import { GameEvents, AnimationOperators } from "../../utils/Constants.js";
import { GameConfig } from "../../configs/GameConfig.js";
import { AudioName } from "../../utils/Constants.js";
import { UIConfig } from "../../configs/UIConfig.js";
import { Helpers } from "../../utils/Helpers.js";

export class WinConditionSystem {
  constructor(eventManager, stateManager, audioManager) {
    this.eventManager = eventManager;
    this.stateManager = stateManager;
    this.audioManager = audioManager;
    this.addition = AnimationOperators.ADDITION;
    this.translateWinBonusKey = "win_bonus";
    this.translateWinEarnedBonusKey = "you_have_earned";

    this.setupEventListeners();
  }

  setupEventListeners() {
    this.eventManager.on(GameEvents.HANDLE_WIN, async () => await this.handleWin());
  }

  check() {
    return this.stateManager.state.cardsComponents.foundations.every((f) =>
      f.isComplete()
    );
  }

  async handleWin() {
    console.log("В HANDLEWIIIIIIIIIIIIIIIIN");
    this.eventManager.emit(GameEvents.STOP_PLAY_TIME);
    this.stateManager.incrementStat("wins");
    this.eventManager.emit(
      GameEvents.ADD_POINTS,
      GameConfig.rules.winScoreBonus
    );

    // Проверяем победу без подсказок
    if (this.stateManager.state.game.hintsUsed === 0) {
      this.stateManager.incrementStat("winsWithoutHints");
    }

    // Проверяем быструю победу
    if (
      this.stateManager.state.game.playTime <
      this.stateManager.state.player.fastestWin
    ) {
      this.stateManager.state.player.fastestWin =
        this.stateManager.state.game.playTime;
    }

    this.audioManager.play(AudioName.WIN);
    this.eventManager.emit(GameEvents.UI_ANIMATE_WIN);

    this.eventManager.emit(
      GameEvents.INCREMENT_COINS,
      GameConfig.earnedCoins.win
    );

    const textWinBonus = Helpers.t(this.translateWinBonusKey);
    const textEarned = Helpers.t(this.translateWinEarnedBonusKey);
    const textCoins = Helpers.pluralize("coins", GameConfig.earnedCoins.win);

    this.eventManager.emit(
      GameEvents.ANIMATION_COINS_EARNED,
      `${textWinBonus}: ${this.addition}${GameConfig.rules.winScoreBonus}`
    );

    await this.delay(UIConfig.animations.animationCoinsEarned * 1100);

    this.eventManager.emit(
      GameEvents.ANIMATION_COINS_EARNED,
      `${textEarned} ${textCoins}`
    );
    this.eventManager.emit(GameEvents.CHECK_WIN_ACHIEVEMENTS);
    this.eventManager.emit(GameEvents.GAME_END);
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
