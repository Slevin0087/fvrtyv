import { GameEvents, AnimationOperators } from "../../utils/Constants.js";
import { GameConfig } from "../../configs/GameConfig.js";
import { AudioName } from "../../utils/Constants.js";
import { UIConfig } from "../../configs/UIConfig.js";
import { Helpers } from "../../utils/Helpers.js";
import { Animator } from "../../utils/Animator.js";

export class WinConditionSystem {
  constructor(eventManager, stateManager, audioManager) {
    this.eventManager = eventManager;
    this.stateManager = stateManager;
    this.state = this.stateManager.state;
    this.audioManager = audioManager;
    this.addition = AnimationOperators.ADDITION;
    this.translateWinBonusKey = "win_bonus";
    this.translateWinEarnedBonusKey = "you_have_earned";
    this.typeWinCheckAchievements = "win";
    this.textWins = "wins";
    this.textWinsWithoutHints = "winsWithoutHints";
    this.textWinsWithoutUndo = "winsWithoutUndo";

    this.setupEventListeners();
  }

  setupEventListeners() {
    this.eventManager.on(
      GameEvents.HANDLE_WIN,
      async () => await this.handleWin()
    );
  }

  check() {
    return this.state.cardsComponents.foundations.every((f) => f.isComplete());
  }

  async handleWin() {
    console.log("В HANDLEWIIIIIIIIIIIIIIIIN");
    this.eventManager.emit(GameEvents.STOP_PLAY_TIME);

    this.saveWinStats();
    // Animator.playWinAnimation();
    this.eventManager.emit(GameEvents.UI_ANIMATE_WIN);

    this.audioManager.play(AudioName.WIN);
    this.eventManager.emit(
      GameEvents.INCREMENT_COINS,
      GameConfig.earnedCoins.win
    );

    const textWinBonus = Helpers.t(this.translateWinBonusKey);
    const textEarned = Helpers.t(this.translateWinEarnedBonusKey);
    const textCoins = Helpers.pluralize("coins", GameConfig.earnedCoins.win);

    await Animator.animationCoinsEarned(
      `${textWinBonus}: ${this.addition}${GameConfig.rules.winScoreBonus}`
    );

    // await this.delay(UIConfig.animations.animationCoinsEarned * 1100);
    await Animator.animationCoinsEarned(`${textEarned} ${textCoins}`);

    // await this.delay(UIConfig.animations.animationCoinsEarned * 1100);

    this.eventManager.emit(
      GameEvents.CHECK_GET_ACHIEVEMENTS,
      this.typeWinCheckAchievements
    );
    this.eventManager.emit(GameEvents.GAME_END);
  }

  saveWinStats() {
    this.stateManager.incrementStat(this.textWins);
    this.eventManager.emit(
      GameEvents.ADD_POINTS,
      GameConfig.rules.winScoreBonus
    );

    // Проверяем без подсказок ли победа
    if (this.state.game.hintsUsed === 0) {
      this.stateManager.incrementStat(this.textWinsWithoutHints);
    }

    // Проверяем быструю победу, время меньше ли чем в прошлый раз
    if (this.state.game.playTime < this.state.player.fastestWin) {
      this.state.player.fastestWin = this.state.game.playTime;
    }

    // Проверяем количество ходов, меньше ли чем в прошлый раз
    if (this.state.game.moves < this.state.game.minPossibleMoves) {
      this.state.game.minPossibleMoves = this.state.game.moves;
    }

    // // Проверяется без отмен хода ли победа
    if (this.state.game.undoUsed === 0) {
      this.stateManager.incrementStat(this.textWinsWithoutUndo);
    }
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
