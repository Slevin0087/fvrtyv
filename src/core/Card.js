import { CardSuits } from "../utils/Constants.js";
import { CardValues } from "../utils/Constants.js";

export class Card {
  constructor(suit, value) {
    this.suit = suit;
    this.value = value;
    this.color = this.getColor();
    this.faceUp = false;
    this.flipped = false;
    this.isUndo = false;
    this.parentElement = null;
    this.openCard = null;
    this.positionData = {
      parent: null, // 'stock', 'waste', 'tableau-#', 'foundation-#'
      position: null,
      elementPosition: -1,
      index: -1, // индекс в родительском массиве
      offsetX: 0,
      offsetY: 0, // смещение в столбце (для tableau)
      zIndex: 0,
    };
  }

  getColor() {
    return [CardSuits.HEARTS, CardSuits.DIAMONDS].includes(this.suit)
      ? "red"
      : "black";
  }

  flip() {
    this.faceUp = !this.faceUp;
    this.flipped = !this.flipped;
    console.log("this.flipped:", this.flipped);
  }

  getSymbol() {
    return this.faceUp ? `${this.value}${this.suit}` : "";
  }

  getRank() {
    return CardValues.indexOf(this.value);
  }

  isNextInSequence(otherCard) {
    return this.getRank() === otherCard.getRank() - 1;
  }

  isPreviousInSequence(otherCard) {
    return this.getRank() === otherCard.getRank() + 1;
  }

  isSameSuit(otherCard) {
    return this.suit === otherCard.suit;
  }

  isOppositeColor(otherCard) {
    return this.color !== otherCard.color;
  }

  serialize() {
    return {
      suit: this.suit,
      value: this.value,
      faceUp: this.faceUp,
      positionData: { ...this.positionData },
    };
  }

  static deserialize(data) {
    const card = new Card(data.suit, data.value);
    card.faceUp = data.faceUp;
    card.positionData = data.positionData;
    return card;
  }
}
