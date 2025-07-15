import { AudioName } from "../../utils/Constants.js";

export class HintSystem {
  constructor(eventManager, stateManager, audioManager) {
    this.eventManager = eventManager;
    this.stateManager = stateManager;
    this.audioManager = audioManager;
  }

  provide() {
    if (this.stateManager.state.game.score < 5) {
      this.audioManager.play(AudioName.INFO);
      this.eventManager.emit(
        "ui:notification",
        "Нужно минимум 5 очков для подсказки"
      );
      return;
    }

    const hint = this.findBestHint();
    // ... остальная логика
    if (hint) {
      this.stateManager.deductCoins(5);
      this.stateManager.state.game.hintsUsed =
        (this.stateManager.state.game.hintsUsed || 0) + 1;
      this.eventManager.emit("hint:show", hint);
    } else {
      this.audioManager.play(AudioName.INFO);
      this.eventManager.emit("ui:notification", "Нет доступных ходов");
    }
  }

  findBestHint() {
    const gameComponents = this.stateManager.state.cardsComponents;
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
