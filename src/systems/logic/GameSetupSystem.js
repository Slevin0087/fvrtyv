import { GameEvents } from "../../utils/Constants.js";

export class GameSetupSystem {
  constructor(eventManager, stateManager) {
    this.eventManager = eventManager;
    this.stateManager = stateManager;
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
          console.log("j:", j);
          await this.dealSingleCard(stock, tableaus[i], j, j === i);
        }
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  async dealSingleCard(stock, tableau, position, shouldFaceUp) {
    try {
      const card = stock.deal();
      if (!card) throw new Error("No cards left in stock");
      card.faceUp = shouldFaceUp;
      await this.animateCardMove(
        card,
        stock.element,
        tableau.element,
        position
      );

      tableau.addCard(card);

      if (shouldFaceUp) {
        await this.flipCard(card);
      }
      this.removeHandleCard(card);
      this.handleCard(card);
    } catch (error) {
      throw new Error(error);
    }
  }

  async animateCardMove(card, fromEl, toEl, position) {
    try {
      return new Promise((resolve, reject) => {
        console.log("в animateCardMove");
        this.eventManager.emit(GameEvents.ANIMATE_STOCK_CARD_MOVE, {
          card,
          fromEl,
          toEl,
          position,
          onComplete: resolve,
          onError: reject,
        });
        this.eventManager.emit(GameEvents.AUDIO_CARD_MOVE);
      });
    } catch (error) {
      console.log(error);
    }
  }

  async flipCard(card) {
    try {
      const { backStyle, faceStyle } = this.getCardStyles();
      return new Promise((resolve) => {
        setTimeout(() => {
          this.eventManager.emit(GameEvents.CARD_FLIP, {
            card,
            backStyle,
            faceStyle,
          });
        }, 500);
        resolve();
      });
    } catch (error) {
      console.log(error);
    }
  }

  getCardStyles() {
    return {
      backStyle: this.stateManager.state.player.selectedItems.backs.styleClass,
      faceStyle: this.stateManager.state.player.selectedItems.faces.styleClass,
    };
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
