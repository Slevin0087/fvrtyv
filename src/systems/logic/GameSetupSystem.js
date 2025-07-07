import { GameEvents, AnimationDurations } from "../../utils/Constants.js";
import { UIConfig } from "../../configs/UIConfig.js";

export class GameSetupSystem {
  constructor(eventManager, stateManager) {
    this.eventManager = eventManager;
    this.stateManager = stateManager;
    this.cardMoveDuration = UIConfig.animations.cardMoveDuration;
  }

  setCards(deck, stock) {
    deck.reset();
    const stockCards = [];

    while (!deck.isEmpty()) {
      const card = deck.deal();
      stockCards.push(card);
    }
    stock.addCards(stockCards);
  }

  async dealTableauCards(stock, tableaus) {
    try {
      for (let i = 0; i < 7; i++) {
        for (let j = 0; j <= i; j++) {
          await this.dealSingleCard(stock, tableaus[i], j === i);
        }
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  async dealSingleCard(stock, tableau, shouldFaceUp) {
    try {
      const card = stock.deal();
      if (!card) throw new Error("No cards left in stock");
      card.faceUp = shouldFaceUp;
      // tableau.addCard(card);
      // void card.domElement.offsetHeight
      await this.animateCardMove(card, tableau);
      if (shouldFaceUp) {
        await this.flipCard(card);
      }
      this.removeHandleCard(card);
      this.handleCard(card);
    } catch (error) {
      throw new Error(error);
    }
  }

  async animateCardMove(card, tableau) {
    try {
      await new Promise((resolve, reject) => {
        console.log("в animateCardMove");
        this.eventManager.emit(GameEvents.ANIMATE_STOCK_CARD_MOVE, {
          card,
          tableau,
          onComplete: resolve,
          onError: reject,
        });
      });
      this.eventManager.emit(GameEvents.AUDIO_CARD_MOVE);
    } catch (error) {
      console.log(error);
    }
  }

  async flipCard(card) {
    try {
      // return new Promise(() => {
      this.eventManager.emit(GameEvents.CARD_FLIP, card);
      // });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  handleCard(card) {
    card.domElement.addEventListener("click", () => {
      this.eventManager.emit(GameEvents.CARD_CLICK, card);
    });
  }

  removeHandleCard(card) {
    card.domElement.removeEventListener("click", () => {
      this.eventManager.emit(GameEvents.CARD_CLICK, card);
    });
  }
}
