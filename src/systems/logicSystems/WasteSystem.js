import { Animator } from "../../utils/Animator.js";

export class WasteSystem {
  constructor(eventManager, stateManager) {
    this.eventManager = eventManager;
    this.stateManager = stateManager;
  }

  async upTopThreeCards() {
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
    }
  }
}
