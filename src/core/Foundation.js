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
    if (this.isEmpty()) return card.value === "A";

    const topCard = this.getTopCard();
    return card.suit === topCard.suit && card.isNextInSequence(topCard);
  }

  isComplete() {
    return this.cards.length === 13; // Все карты от A до K
  }
}
