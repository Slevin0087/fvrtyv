import { Pile } from "./Pile.js";
import { GameConfig } from "../configs/GameConfig.js";

export class Foundation extends Pile {
  constructor(index) {
    super("foundation", index);
    this.suit = null;
    this.element = this.createPileElement();
  }

  createPileElement() {
    const element = super.createPileElement();
    const span = document.createElement("span");
    span.textContent = "A";
    span.classList.add("foundation-span");
    element.append(span);
    return element;
  }

  canAccept(card, gameComponents) {
    if (!card.faceUp) return false;
    else if (
      card.value === "A" &&
      card.positionData.parent.startsWith(GameConfig.cardContainers.foundation)
    )
      return false;
    else {
      if (super.isEmpty() && !this.isCards(card, gameComponents))
        return card.value === "A";
      else if (this.isCards(card, gameComponents)) return false;
      const topCard = super.getTopCard();
      return card.suit === topCard.suit && card.isPreviousInSequence(topCard);
    }
  }

  isComplete() {
    return this.cards.length === 13; // Все карты от A до K
  }

  isCards(card, gameComponents) {
    const tableau = gameComponents.tableaus[card.positionData.index];
    const lastСard = tableau.cards[tableau.cards.length - 1];
    return card.positionData.parent.startsWith("tableau") && lastСard !== card;
  }
}
