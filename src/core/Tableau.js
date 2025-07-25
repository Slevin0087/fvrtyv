import { Pile } from "./Pile.js";
import { UIConfig } from "../configs/UIConfig.js";

export class Tableau extends Pile {
  constructor(index) {
    super("tableau", index);
    this.overlapY = UIConfig.layout.card.tableauOverlapY; // Каскадное смещение карт
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
    if (card.value === "A") false;
    if (!card.faceUp) return false;
    if (this.isEmpty()) return card.value === "K";

    const topCard = this.getTopCard();
    console.log('topCard:', topCard);
    
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

  removeCardsFrom(card) {
    const index = this.cards.indexOf(card);
    if (index >= 0) {
      const removedCards = this.cards.splice(index);
      this.updatePositions();
      return removedCards;
    }
    return [];
  }

  getTopCards(card) {
    const index = this.cards.indexOf(card);
    if (index >= 0) {
      const topCards = [];
      for (let i = index; i < this.cards.length; i++) {
        topCards.push(this.cards[i]);
      }
      return topCards;
    }
    return [];
  }
}
