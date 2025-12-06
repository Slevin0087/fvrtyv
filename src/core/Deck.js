import { Card } from "./Card.js";
import { CardSuits, CardValues } from "../configs/CardsConfigs.js";
import { Helpers } from "../utils/Helpers.js";

export class Deck {
  constructor() {
    this.cards = [];
  }

  createDeck() {    
    this.cards = [];
    for (const suit of Object.values(CardSuits)) {
      for (const value of CardValues) {
        const card = new Card(suit, value)        
        this.cards.push(card);
      }
    }
  }

  shuffle() {
    this.cards = Helpers.shuffleArray(this.cards);
  }

  deal() {
    if (this.isEmpty()) return null;
    const card = this.cards.pop()    
    return card;
  }

  isEmpty() {
    return this.cards.length === 0;
  }

  reset() {
    this.createDeck();
    this.shuffle();
  }
}
