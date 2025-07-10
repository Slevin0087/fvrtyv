import { GameEvents } from "../../utils/Constants.js";
import { GameConfig } from "../../configs/GameConfig.js";
import { AudioName } from "../../utils/Constants.js";

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
    console.log('В HANDLEWIIIIIIIIIIIIIIIIN');
    this.eventManager.emit(GameEvents.STOP_PLAY_TIME);
    this.stateManager.incrementStat("wins");
    this.eventManager.emit(GameEvents.ADD_POINTS, GameConfig.rules.winScoreBonus);
    // this.stateManager.updateScore(
    //   this.calculatePoints(GameConfig.rules.winScoreBonus)
    // );

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
    this.eventManager.emit(
      GameEvents.ANIMATION_COINS_EARNED,
      `Вы заработали ${GameConfig.earnedCoins.win} хусынок`
    );
    this.eventManager.emit(GameEvents.GAME_END);
  }
}
