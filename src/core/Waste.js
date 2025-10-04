import { Pile } from "./Pile.js";
import { UIConfig } from "../configs/UIConfig.js";

export class Waste extends Pile {
  constructor() {
    super("waste");
    this.overlapX = UIConfig.layout.card.wasteOverlapX;
    this.overlapY = UIConfig.layout.card.wasteOverlapY; // Смещение для отображения веера карт
    this.oneOverlapX = UIConfig.layout.card.wasteOneOverlapX;
    this.maxVisibleCards = UIConfig.layout.card.wasteMaxVisibleCards;
    this.maxOverlapX = this.oneOverlapX * (this.maxVisibleCards - 1);
    this.element = super.createPileElement();
    this.topThreeCards = [];
  }

  canAccept(card) {
    return card.faceUp;
  }

  addCard(card) {
    super.addCard(card);
    // у дом элемента waste нет первого дочернего элемента span,
    // поэтому можно позицию у карт начинать с 0
    card.positionData.offsetX = 0;
    card.positionData.offsetY = 0;
    this.uppp();
    console.log(
      "ПОСЛЕ addCard this.cards, this.topThreeCards: ",
      this.cards,
      this.topThreeCards
    );
  }

  updatePositions(cardsLength, cardIndex) {
    if (cardsLength <= 1) {
      return { x: this.overlapX, y: this.overlapY };
    }
    if (cardIndex < this.maxVisibleCards) {
      const offset = this.oneOverlapX * (this.maxVisibleCards - 1 - cardIndex);
      return {
        x: Math.min(offset, this.maxOverlapX),
        y: this.overlapY,
      };
    } else {
      return {
        x: this.maxOverlapX + this.oneOverlapX,
        y: this.overlapY,
      };
    }
  }

  uppp() {
    const topThreeCards = [];
    this.cards.forEach((card, index) => {
      if (index <= this.maxVisibleCards) {
        card.positionData.offsetX = index * this.oneOverlapX + this.overlapX;
        topThreeCards.push(card);
      } else if (index >= this.maxVisibleCards) {
        console.log(
          "else if (index => this.this.maxVisibleCards) card, index: ",
          card,
          index
        );
        card.positionData.offsetX = this.maxOverlapX;
      }
    });
    this.topThreeCards = topThreeCards.reverse();
  }

  uppp() {
    const topThreeCards = [];

    this.cards.forEach((card, index) => {
      // Рассчитываем позицию от конца массива
      const positionFromEnd = this.cards.length - 1 - index;

      if (positionFromEnd < this.maxVisibleCards) {
        // Это последние 3 карты (или меньше, если карт мало)
        card.positionData.offsetX =
          positionFromEnd * this.oneOverlapX + this.overlapX;
        card.positionData.offsetY = this.overlapY;
        topThreeCards.push(card);
      } else {
        // Остальные карты (те, что "под" видимыми)
        card.positionData.offsetX = this.maxOverlapX;
      }
    });

    this.topThreeCards = topThreeCards;
  }
}
