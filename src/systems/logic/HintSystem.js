import { AudioName } from "../../utils/Constants.js";
import { GameEvents } from "../../utils/Constants.js";
import { UIConfig } from "../../configs/UIConfig.js";
import { HintsOfObviousMoves } from "./HintsOfObviousMoves.js";

export class HintSystem {
  constructor(eventManager, stateManager, audioManager) {
    this.eventManager = eventManager;
    this.stateManager = stateManager;
    this.state = this.stateManager.state;
    this.audioManager = audioManager;
    this.notifDiv = document.getElementById('notif-div')

    this.setupComponents()
  }

  setupComponents() {
    this.hintsOfObviousMoves = new HintsOfObviousMoves(this.eventManager, this.stateManager)
  }

  provide() {
    console.log('this.hintsOfObviousMoves.testF: ', this.hintsOfObviousMoves.testF());
    
    if (this.state.hintCounterState === 0 || this.state.hintCounterState < 0 || this.state.player.hintQuantity === 0) {
      this.audioManager.play(AudioName.INFO);
      this.eventManager.emit(
        GameEvents.HINT_NOTIF,
        UIConfig.dataI18nValue.HINT_NOTIF_NOHINTS
      );
      return;
    }
    if (this.state.game.score < 5 && this.state.player.hintQuantity > 0) {
      this.audioManager.play(AudioName.INFO);
      this.eventManager.emit(
        GameEvents.HINT_NOTIF,
        UIConfig.dataI18nValue.HINT_NOTIF_NOPOINTS
      );
      return;
    }

    this.eventManager.emit(GameEvents.HINT_USED)
    const hints = this.hintsOfObviousMoves.testF()
    this.hintShow(hints[0])
    // const hint = this.findBestHint();
    // // ... остальная логика
    // if (hint) {
    //   this.stateManager.deductCoins(5);
    //   this.state.game.hintsUsed =
    //     (this.state.game.hintsUsed || 0) + 1;
    //   this.eventManager.emit(GameEvents.HINT_SHOW, hint);
    // } else {
    //   this.audioManager.play(AudioName.INFO);
    //   this.eventManager.emit("ui:notification", "Нет доступных ходов");
    // }
  }

  hintShow(hint) {
    const { fromCard, toCard } = hint
    fromCard.domElement.classList.add('hint-from-card')
    toCard.domElement.classList.add('hint-to-card')
    setTimeout(() => {
      fromCard.domElement.classList.remove('hint-from-card')
      toCard.domElement.classList.remove('hint-to-card')
    }, 2000)
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
