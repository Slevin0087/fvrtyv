import { GameEvents } from "../../utils/Constants.js";

export class WinConditionSystem {
  constructor(eventManager, stateManager, audioManager) {
    this.eventManager = eventManager;
    this.stateManager = stateManager;
    this.audioManager = audioManager;
  }

  check() {
    return this.stateManager.state.cardsComponents.foundations.every((f) =>
      f.isComplete()
    );
  }

  handleWin() {
    this.stateManager.incrementStat("wins");
    this.stateManager.updateScore(
      this.calculatePoints(GameConfig.rules.winScoreBonus)
    );

    // Проверяем победу без подсказок
    if (this.stateManager.state.game.hintsUsed === 0) {
      this.stateManager.incrementStat("winsWithoutHints");
    }

    // Проверяем быструю победу
    if (
      this.stateManager.state.game.time <
      this.stateManager.state.player.fastestWin
    ) {
      this.stateManager.state.player.fastestWin =
        this.stateManager.state.game.time;
    }

    this.audioManager.play(AudioName.WIN);
    // this.eventManager.emit(GameEvents.CARD_MOVED);
    this.eventManager.emit(GameEvents.UI_ANIMATE_WIN);
    this.eventManager.emit(
      GameEvents.INCREMENT_COINS,
      GameConfig.earnedCoins.win
    );
    this.eventManager.emit(
      GameEvents.ANIMATION_COINS_EARNED,
      `Вы заработали ${GameConfig.earnedCoins.win} хусынок`
    );
    this.eventManager.emit(GameEvents.GAME_END);
  }
}
