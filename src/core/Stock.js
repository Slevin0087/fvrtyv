import { Pile } from "./Pile.js";
import { Waste } from "./Waste.js";
import { UIConfig } from "../configs/UIConfig.js";

export class Stock extends Pile {
  constructor() {
    super("stock");
    this.overlap = UIConfig.layout.card.stockOverlap; // Небольшое смещение для стока
    this.waste = new Waste();
    this.element = super.createPileElement();
  }

  deal() {
    if (this.isEmpty()) return null;
    const card = this.cards.pop();
    card.faceUp = true;
    this.index--;
    return card;
  }

  addCards(cards) {
    super.addCards(cards);
    this.index = this.cards.length - 1;
  }
  addCard(card) {
    super.addCard(card);
    card.faceUp = false;
  }

  getWasteCard() {
    const card = this.cards[this.index];
    if (card) {
      card.faceUp = true; // Карты в стоке рубашкой вверх
      this.index--;
      this.waste.addCard(card);
      // card.positionData.parent = "waste";
      // card.positionData.zIndex = this.waste.length ? this.waste.length - 1 : 0;
      // this.waste.cards.push(card);
      return card;
    }
    return null;
  }

  recycleWaste() {
    this.cards = [];
    this.addCards(this.waste.cards.reverse());
    this.index = this.cards.length - 1;
    this.waste.cards = [];
  }
}
