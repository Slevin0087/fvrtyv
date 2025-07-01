import { Pile } from "./Pile.js";
import { UIConfig } from "../configs/UIConfig.js";

export class Tableau extends Pile {
  constructor(index) {
    super("tableau", index);
    this.overlap = UIConfig.layout.card.tableauOverlap; // Каскадное смещение карт
    this.element = this.createPileElement();
  }

  createPileElement() {
    const element = super.createPileElement();
    const span = document.createElement("span");
    span.textContent = "K";
    span.classList.add("tableau-span");
    element.append(span);
    return element;
  }

  canAccept(card) {
    if (!card.faceUp) return false;
    if (this.isEmpty()) return card.value === "K";

    const topCard = this.getTopCard();
    return card.isOppositeColor(topCard) && card.isNextInSequence(topCard);
  }

  flipTopCard() {
    const topCard = this.getTopCard();
    if (topCard && !topCard.faceUp) {
      topCard.flip();
      return true;
    }
    return false;
  }
}
