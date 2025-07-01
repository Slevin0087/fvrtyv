import { Card } from "./Card.js";
import { CardSuits, CardValues } from "../utils/Constants.js";
import { Helpers } from "../utils/Helpers.js";

export class Deck {
  constructor() {
    this.cards = [];
  }

  createDeck() {    
    this.cards = [];
    for (const suit of Object.values(CardSuits)) {
      for (const value of CardValues) {
        this.cards.push(new Card(suit, value));
      }
    }
  }

  shuffle() {
    this.cards = Helpers.shuffleArray(this.cards);
  }

  deal() {
    if (this.isEmpty()) return null;
    return this.cards.pop();
  }

  isEmpty() {
    return this.cards.length === 0;
  }

  reset() {
    this.createDeck();
    this.shuffle();
  }
}
