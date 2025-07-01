import { Pile } from "./Pile.js";
import { UIConfig } from "../configs/UIConfig.js";

export class Waste extends Pile {
  constructor() {
    super("waste");
    this.overlap = UIConfig.layout.card.stockOverlap; // Смещение для отображения веера карт
    this.element = super.createPileElement();
  }

  canAccept(card) {
    return card.faceUp;
  }

  // addCard(card) {
  //   const position = this.card.length - 1;
  //   card.position = super.getPositionData(position);
  //   // this.cards.push(card);
  // }
}
