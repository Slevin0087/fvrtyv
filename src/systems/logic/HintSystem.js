import { AudioName } from "../../utils/Constants.js";
import { GameEvents } from "../../utils/Constants.js";

export class HintSystem {
  constructor(eventManager, stateManager, audioManager) {
    this.eventManager = eventManager;
    this.stateManager = stateManager;
    this.state = this.stateManager.state;
    this.audioManager = audioManager;

    this.notifDiv = document.getElementById('notif-div')
  }

  provide() {
    if (this.state.hintCounterState === 0 || this.state.hintCounterState < 0 || this.state.player.hintQuantity === 0) {
      this.audioManager.play(AudioName.INFO);
      this.eventManager.emit(
        GameEvents.HINT_NOTIF,
        "Нет подсказок"
      );
      return;
    }
    if (this.state.game.score < 5 && this.state.player.hintQuantity > 0) {
      this.audioManager.play(AudioName.INFO);
      this.eventManager.emit(
        GameEvents.HINT_NOTIF,
        "Нужно минимум 5 очков для подсказки"
      );
      return;
    }

    this.eventManager.emit(GameEvents.HINT_USED)
    const hint = this.findBestHint();
    // ... остальная логика
    if (hint) {
      this.stateManager.deductCoins(5);
      this.state.game.hintsUsed =
        (this.state.game.hintsUsed || 0) + 1;
      this.eventManager.emit(GameEvents.HINT_SHOW, hint);
    } else {
      this.audioManager.play(AudioName.INFO);
      this.eventManager.emit("ui:notification", "Нет доступных ходов");
    }
  }

  findBestHint() {
    const gameComponents = this.state.cardsComponents;
    // Сначала проверяем карты в waste
    const wasteCard = gameComponents.waste.getTopCard();
    if (wasteCard) {
      // Проверяем foundation
      for (let i = 0; i < gameComponents.foundations.length; i++) {
        if (
          gameComponents.foundations[i].canAccept(wasteCard, gameComponents)
        ) {
          return {
            card: wasteCard,
            target: `foundation-${i}`,
            type: "waste-to-foundation",
          };
        }
      }

      // Проверяем tableau
      for (let i = 0; i < gameComponents.tableaus.length; i++) {
        if (gameComponents.tableaus[i].canAccept(wasteCard)) {
          return {
            card: wasteCard,
            target: `tableau-${i}`,
            type: "waste-to-tableau",
          };
        }
      }
    }

    // Затем проверяем tableau
    for (let i = 0; i < gameComponents.tableaus.length; i++) {
      const tableau = gameComponents.tableaus[i];
      const topCard = tableau.getTopCard();

      if (!topCard) continue;

      // Проверяем foundation
      for (let j = 0; j < gameComponents.foundations.length; j++) {
        if (gameComponents.foundations[j].canAccept(topCard, gameComponents)) {
          return {
            card: topCard,
            target: `foundation-${j}`,
            type: "tableau-to-foundation",
          };
        }
      }
    }

    return null;
  }
}
