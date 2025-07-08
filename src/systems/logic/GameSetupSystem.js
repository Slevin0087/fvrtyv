import { GameEvents, AnimationDurations } from "../../utils/Constants.js";
import { UIConfig } from "../../configs/UIConfig.js";

export class GameSetupSystem {
  constructor(eventManager, stateManager) {
    this.eventManager = eventManager;
    this.stateManager = stateManager;
    this.cardMoveDuration = UIConfig.animations.cardMoveDuration;
    this.faceDownCards = [];

    this.setupEventListeners();
  }

  setupEventListeners() {
    this.eventManager.on(GameEvents.IS_FACE_DOWN_CARD, (card) =>
      this.isFaceDownCard(card)
    );

    this.eventManager.on(GameEvents.UP_FACE_DOWN_CARD, (card) =>
      this.updateFaceDownCard(card)
    );
  }

  setCards(deck, stock) {
    deck.reset();
    const stockCards = [];
    this.faceDownCards = [];

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
      } else if (!shouldFaceUp) this.updateFaceDownCard(card);
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

  isFaceDownCard(card) {
    if (this.faceDownCards.length > 0) {
      const newC = this.faceDownCards.filter(
        (cardFaceDoun) => cardFaceDoun !== card
      );
      this.faceDownCards = newC;
      console.log("isFaceDownCard:", this.faceDownCards);
      if (this.faceDownCards.length <= 0) {
        alert("Все карты открылись");
        this.eventManager.emit(GameEvents.COLLECT_BTN_SHOW);
        return;
      }
      return;
    }
    throw new Error('error in isFaceDownCard')
  }

  updateFaceDownCard(card) {
    this.faceDownCards.push(card);
    console.log("updateFaceDownCard:", this.faceDownCards);
  }
}
