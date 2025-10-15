import { Animator } from "../../utils/Animator.js";
import { GameConfig } from "../../configs/GameConfig.js";
import { GameEvents } from "../../utils/Constants.js";

export class WasteSystem {
  constructor(eventManager, stateManager) {
    this.eventManager = eventManager;
    this.stateManager = stateManager;
  }

  async upTopThreeCards() {
    console.log('upTopThreeCards');
    
    const waste = this.stateManager.state.cardsComponents.waste;
    const stock = this.stateManager.state.cardsComponents.stock;
    if (stock.stockCardPosition < 0 && waste.isEmpty()) {
      stock.element.querySelector(".stock-span").textContent = "";
    }
    const topThreeCards = waste.uppp();
    const oldOffsetsTopThreeCards = topThreeCards.map((card) => {
      return {
        card,
        oldOffsetX: card.positionData.offsetX,
        oldOffsetY: card.positionData.offsetY,
      };
    });
    if (oldOffsetsTopThreeCards.length > 0) {
      await Animator.animateCardFomStockToWaste(oldOffsetsTopThreeCards);
      this.upEventsTopThreeCards(oldOffsetsTopThreeCards, waste)
    }
  }

  upEventsTopThreeCards(arr, waste) {
    arr.forEach(({ card }) => {
      if (card === waste.getTopCard()) {
        card.setDataAttribute(GameConfig.dataAttributes.dataAttributeDND);

        // Добавление картам событий: onpointerdown, onpointermove, onpointerup
        this.eventManager.emit(
          GameEvents.ADD_ONPOINTERDOWN_TO_CARD,
          card.domElement
        );
        this.eventManager.emit(
          GameEvents.ADD_ONPOINTERMOVE_TO_CARD,
          card.domElement
        );
        this.eventManager.emit(
          GameEvents.ADD_ONPOINTERUP_TO_CARD,
          card.domElement
        );
        ///////////////////////////////////////////
      } else {
        card.removeDataAttribute(GameConfig.dataAttributes.dataAttributeDND);

        // Удаление картам событий: onpointerdown, onpointermove, onpointerup
        this.eventManager.emit(
          GameEvents.RESET_ONPOINTERDOWN_TO_CARD,
          card.domElement
        );
        this.eventManager.emit(
          GameEvents.RESET_ONPOINTERMOVE_TO_CARD,
          card.domElement
        );
        this.eventManager.emit(
          GameEvents.RESET_ONPOINTERUP_TO_CARD,
          card.domElement
        );
        ///////////////////////////////////////////
      }
    });
  }
}
