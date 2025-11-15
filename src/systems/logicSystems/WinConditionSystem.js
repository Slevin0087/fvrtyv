import { GameEvents, AnimationOperators } from "../../utils/Constants.js";
import { GameConfig } from "../../configs/GameConfig.js";
import { AudioName } from "../../utils/Constants.js";
import { UIConfig } from "../../configs/UIConfig.js";
import { Animator } from "../../utils/Animator.js";

export class WinConditionSystem {
  constructor(eventManager, stateManager, audioManager, translator) {
    this.eventManager = eventManager;
    this.stateManager = stateManager;
    this.state = this.stateManager.state;
    this.audioManager = audioManager;
    this.addition = AnimationOperators.ADDITION;
    this.translator = translator;
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
    return true // Удалить, для теста добавил, а потом расскоментировать строчку, которая ниже
    // return this.state.cardsComponents.foundations.every((f) => f.isComplete()); // это не удалять!!! это и должно быть тут
  }

  async handleWin() {
    console.log("В HANDLEWIIIIIIIIIIIIIIIIN");

    if (this.state.isAutoCollectBtnShow) {
      this.eventManager.emit(GameEvents.COLLECT_BTN_HIDDEN);
    }

    this.eventManager.emit(GameEvents.STOP_PLAY_TIME);

    this.saveWinStats();
    // Animator.playWinAnimation();
    this.eventManager.emit(GameEvents.UI_ANIMATE_WIN);

    this.audioManager.play(AudioName.WIN);
    this.eventManager.emit(
      GameEvents.INCREMENT_COINS,
      GameConfig.earnedCoins.win
    );

    const textWinBonus = this.translator.t(this.translateWinBonusKey);
    const textEarned = this.translator.t(this.translateWinEarnedBonusKey);
    const textCoins = this.translator.pluralize(
      "coins",
      GameConfig.earnedCoins.win
    );

    const textWinBonusScoreLeftPathForResultModal = `${textWinBonus}: `;
    const textWinBonusScoreRightPathForResultModal = `${this.addition}${GameConfig.rules.winScoreBonus}`;

    const textEarnedWinLeftPathForResultModal = `${textEarned} `;
    const textEarnedWinRightPathForResultModal = `${this.addition}${textCoins}`;

    this.eventManager.emit(
      GameEvents.CHECK_GET_ACHIEVEMENTS,
      this.typeWinCheckAchievements
    );
    this.eventManager.emit(GameEvents.GAME_END);
    this.eventManager.emit(
      GameEvents.GAME_RESULTS_MODAL_SHOW,
      textWinBonusScoreLeftPathForResultModal,
      textWinBonusScoreRightPathForResultModal,
      textEarnedWinLeftPathForResultModal,
      textEarnedWinRightPathForResultModal
    );
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
