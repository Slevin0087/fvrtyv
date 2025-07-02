import { Pile } from "./Pile.js";

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

  canAccept(card) {
    if (!card.faceUp) return false;
    else if (super.isEmpty()) return card.value === "A";
    else if (
      card.positionData.parent.startsWith("tableau") &&
      card.parentElement.childNodes.length > card.position + 2
    )
      return false;
    else {
      const topCard = super.getTopCard();
      console.log('topCard:', topCard);
      
      return card.suit === topCard.suit && card.isPreviousInSequence(topCard);
    }
  }

  isComplete() {
    return this.cards.length === 13; // Все карты от A до K
  }
}
