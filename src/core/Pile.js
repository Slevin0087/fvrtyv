import { Card } from "./Card.js";

export class Pile {
  constructor(type, index = 0) {
    this.type = type; // 'stock', 'waste', 'foundation', 'tableau'
    this.index = index; // индекс для идентификации
    this.cards = [];
    this.element = this.createPileElement();
    this.overlapX = 0;
    this.overlapY = 0; // переопределяется в дочерних классах
  }

  // Базовые методы, которые можно переопределять в дочерних классах
  createPileElement() {
    const element = document.createElement("div");
    element.className = `pile-${this.type}`;
    element.id = `${this.type}-${this.index}`;
    return element;
  }

  addCard(card) {
    const position = this.cards.length;
    card.positionData = this.getPositionData(position);
    this.cards.push(card);
    card.parentElement = this.element;
    this.updateCardElement(card, position);
  }

  getPositionData(position) {
    return {
      parent: `${this.type}-${this.index}`,
      position: position,
      elementPosition: this.getElementPosition(),
      index: this.index,
      offsetX: position * this.overlapX,
      offsetY: position * this.overlapY,
      zIndex: this.getZIndex(),
    };
  }

  getElementPosition() {
    return this.element.childNodes.length ? this.element.childNodes.length : 0;
  }

  getZIndex() {
    if (this.isEmpty() && this.element.childNodes.length === 0) return 0;
    else if (this.isEmpty() && this.element.childNodes.length > 0)
      return this.element.childNodes.length;
    else if (!this.isEmpty())
      return this.cards[this.cards.length - 1].positionData.zIndex + 1;
  }

  updateCardElement(card, position) {
    // Базовая реализация - может быть расширена
    // card.domElement.style.zIndex = position;
  }

  getTopCard() {
    return this.cards.length > 0 ? this.cards[this.cards.length - 1] : null;
  }

  isEmpty() {
    return this.cards.length === 0;
  }

  removeTopCard() {
    if (this.isEmpty()) return null;
    return this.cards.pop();
  }

  canAccept(card) {
    // Базовая реализация - должна быть переопределена
    return card instanceof Card;
  }

  // Общие методы для всех коллекций карт
  addCards(cards) {
    cards.forEach((card) => this.addCard(card));
  }

  updatePositions() {
    this.cards.forEach((card, index) => {
      card.positionData = this.getPositionData(index);
      this.updateCardElement(card, index);
    });
  }

  serialize() {
    return {
      type: this.type,
      index: this.index,
      cards: this.cards.map((card) => card.serialize()),
    };
  }

  static deserialize(data, cardClass = Card) {
    const pile = new this(data.index);
    pile.cards = data.cards.map((cardData) => cardClass.deserialize(cardData));
    return pile;
  }
}
