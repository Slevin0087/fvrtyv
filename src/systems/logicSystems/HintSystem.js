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
    this.notifDiv = document.getElementById("notif-div");

    this.setupComponents();
  }

  setupComponents() {
    this.hintsOfObviousMoves = new HintsOfObviousMoves(
      this.eventManager,
      this.stateManager
    );
  }

  async provide() {
    console.log(
      "this.hintsOfObviousMoves.getHints: ",
      this.hintsOfObviousMoves.getHints()
    );

    ///////////////////////// Расскоментить, для теста закомментил
    // if (
    //   this.state.hintCounterState === 0 ||
    //   this.state.hintCounterState < 0 ||
    //   this.state.player.hintQuantity === 0
    // ) {
    //   this.audioManager.play(AudioName.INFO);
    //   this.eventManager.emit(
    //     GameEvents.HINT_NOTIF,
    //     UIConfig.dataI18nValue.HINT_NOTIF_NOHINTS
    //   );
    //   return;
    // }
    // if (this.state.game.score < 5 && this.state.player.hintQuantity > 0) {
    //   this.audioManager.play(AudioName.INFO);
    //   this.eventManager.emit(
    //     GameEvents.HINT_NOTIF,
    //     UIConfig.dataI18nValue.HINT_NOTIF_NOPOINTS
    //   );
    //   return;
    // }
    /////////////////////////////////////////////////////////

    this.eventManager.emit(GameEvents.HINT_USED);
    const hints = this.hintsOfObviousMoves.getHints();
    console.log("HINTS = : ", hints);

    if (hints.length > 0) {
      const numberEnd = hints.length;
      for (let numberFirst = 1; numberFirst <= numberEnd; numberFirst++) {
        await this.hintShow(hints[numberFirst - 1], numberFirst, numberEnd);
      }
    }
    // hints.forEach((hint) => this.hintShow(hint))
    // this.hintShow(hints[0]);
    // this.hintShow(hints);
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

  async hintShow(hint, numberFirst, numberEnd) {
    await new Promise((resolve, reject) => {
      console.log("hintShow hint: ", hint);

      const { fromCard, toContainer, toCard, description } = hint;

      if (description === "Открыть новую карту из колоды") {
        hint.toContainer.element.classList.add("hint-from-card");
        this.eventManager.emit(GameEvents.CREAT_ELEMENT_FOR_NOTIF_HINT_STOCK, description);
        setTimeout(() => {
          hint.toContainer.element.classList.remove("hint-from-card");
          this.eventManager.emit(GameEvents.CLEAR_NOTIF_HINT_CARDS);
          resolve();
        }, 2000);
      } else {
        fromCard.domElement.classList.add("hint-from-card");
        toCard
          ? toCard.domElement.classList.add("hint-to-card")
          : toContainer.element.classList.add("hint-to-card");
        this.eventManager.emit(
          GameEvents.CREAT_ELEMENT_FOR_NOTIF_HINT_CARDS,
          numberFirst,
          numberEnd
        );
        setTimeout(() => {
          fromCard.domElement.classList.remove("hint-from-card");
          toCard
            ? toCard.domElement.classList.remove("hint-to-card")
            : toContainer.element.classList.remove("hint-to-card");
          this.eventManager.emit(GameEvents.CLEAR_NOTIF_HINT_CARDS);
          resolve();
        }, 2000);
      }
    });
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
