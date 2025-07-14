import { Pile } from "./Pile.js";
import { UIConfig } from "../configs/UIConfig.js";

export class Waste extends Pile {
  constructor() {
    super("waste");
    this.overlapX = UIConfig.layout.card.wasteOverlapX;
    this.overlapY = UIConfig.layout.card.wasteOverlapY; // Смещение для отображения веера карт
    this.element = super.createPileElement();
  }

  canAccept(card) {
    return card.faceUp;
  }

  addCard(card) {
    super.addCard(card);
    card.positionData.offsetX = (this.cards.length - 1) * this.overlapX;
  }
}
