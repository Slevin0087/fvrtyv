import { Pile } from "./Pile.js";
import { Waste } from "./Waste.js";
import { UIConfig } from "../configs/UIConfig.js";
import { GameConfig } from "../configs/GameConfig.js";

export class Stock extends Pile {
  constructor() {
    super("stock");
    this.overlapX = UIConfig.layout.card.stockOverlapX;
    this.overlapY = UIConfig.layout.card.stockOverlapY; // Небольшое смещение для стока
    this.element = this.createPileElement();
    this.stockCardPosition = 0;
  }

  createPileElement() {
    const element = super.createPileElement();
    const span = document.createElement("span");
    // span.innerHTML = '<svg viewBox="0 0 24 24" width="90"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>';
    span.textContent = "↺";
    span.classList.add("stock-span");
    element.append(span);
    return element;
  }

  deal() {
    if (this.isEmpty()) return null;
    const card = this.cards.pop();
    // card.flip(true);
    this.stockCardPosition--;
    return card;
  }

  addCards(cards) {
    console.log("addCards(cards) cards: ", cards);
    super.addCards(cards);
    this.stockCardPosition = this.cards.length - 1;
    console.log("addCards(cards) this.cards: ", this.cards);
  }

  addCard(card) {
    const position = this.cards.length - 1;
    card.positionData = this.getPositionData(position);
    card.parentElement = this.element;
    console.log('card.faceUp ДОООО: ', card.faceUp);
    
    card.flip(false);
    console.log('card.faceUp ПОСЛЕ: ', card.faceUp);

    card.removeDataAttribute(GameConfig.dataAttributes.cardParent);
    card.removeDataAttribute(GameConfig.dataAttributes.dataAttributeDND);
    card.setDataAttribute(
      GameConfig.dataAttributes.cardParent,
      card.positionData.parent
    );
    this.cards.push(card);
    this.stockCardPosition++;
  }

  getWasteCard() {
    const card = this.cards[this.stockCardPosition];
    if (card) {
      card.flip(true);
      this.stockCardPosition--;
      return card;
    }
    return null;
  }

  recycleWaste(waste) {
    this.cards = [];
    this.addCards(waste.cards.reverse());
    this.stockCardPosition = this.cards.length - 1;
    waste.cards = [];
  }

  getNTopCards(n) {
    if (this.isEmpty()) return null;
    const lastNCards = this.cards.slice(-n);
    console.log("lastNCards: ", lastNCards);

    lastNCards.forEach((card) => {
      card.flip(true);
      // this.stockCardPosition--;
    });
    return lastNCards;
  }

  removeTopCard() {
    if (this.isEmpty()) return null;
    // return this.cards.pop();
    this.stockCardPosition--;
    return super.removeTopCard();
  }
}
