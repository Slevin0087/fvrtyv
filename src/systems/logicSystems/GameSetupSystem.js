import { GameEvents, AnimationDurations } from "../../utils/Constants.js";
import { UIConfig } from "../../configs/UIConfig.js";
import { GameConfig } from "../../configs/GameConfig.js";
import { Animator } from "../../utils/Animator.js";

export class GameSetupSystem {
  constructor(eventManager, stateManager) {
    this.eventManager = eventManager;
    this.stateManager = stateManager;
    this.state = this.stateManager.state;
    this.cardMoveDuration = UIConfig.animations.cardMoveDuration;
    this.startMoveSpeed = UIConfig.animations.startMoveSpeed;
    // this.faceDownCards = this.stateManager.state.faceDownCards;

    this.setupEventListeners();
  }

  setupEventListeners() {
    this.eventManager.on(GameEvents.IS_FACE_DOWN_CARD, (card) =>
      this.isFaceDownCard(card)
    );

    this.eventManager.on(GameEvents.UP_FACE_DOWN_CARD, (card) =>
      this.updateFaceDownCard(card)
    );

    this.eventManager.on(GameEvents.ADD_CARD_CLICK, (card) => {
      card.domElement.addEventListener("click", this.handleCard(card));
    });
    this.eventManager.on(
      GameEvents.SET_CARD_DATA_ATTRIBUTE,
      (cardDomElement, dataAttribute, cardParent) =>
        this.setDataAttribute(cardDomElement, dataAttribute, cardParent)
    );
  }

  setCards(deck, stock) {
    deck.reset();
    const stockCards = [];
    this.state.faceDownCards = [];

    while (!deck.isEmpty()) {
      const card = deck.deal();
      stockCards.push(card);
    }
    stock.addCards(stockCards);
  }

  async dealTableauCards(stock, tableaus) {
    const tableausCounts = 7; // Количество tableau(колонок)
    for (let tableauCount = 0; tableauCount < tableausCounts; tableauCount++) {
      for (let cardCount = 0; cardCount <= tableauCount; cardCount++) {
        const isFaceUp = cardCount === tableauCount;
        await this.dealSingleCard(stock, tableaus[tableauCount], isFaceUp);
      }
    }
  }

  async dealSingleCard(stock, tableau, isFaceUp) {
    try {
      const card = stock.deal();
      if (!card) throw new Error("No cards left in stock");
      card.faceUp = isFaceUp;
      // tableau.addCard(card);
      // void card.domElement.offsetHeight
      await this.animateCardMove(card, tableau);
      if (isFaceUp) {
        await this.flipCard(card);
        this.setDataAttribute(
          card.domElement,
          GameConfig.dataAttributes.cardParent,
          card.positionData.parent
        );
        this.setDataAttribute(
          card.domElement,
          GameConfig.dataAttributes.cardDnd
        );
      } else if (!isFaceUp) this.updateFaceDownCard(card);
      // this.removeHandleCard(card);
      // this.handleCard(card);
    } catch (error) {
      throw new Error(error);
    }
  }

  async animateCardMove(card, tableau) {
    try {
      await Animator.animateStockCardMove(
        {
          card,
          tableau,
        },
        this.startMoveSpeed
      );
      this.eventManager.emit(GameEvents.AUDIO_CARD_MOVE);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async flipCard(card) {
    try {
      await this.eventManager.emitAsync(GameEvents.CARD_FLIP, card);
    } catch (error) {
      console.log("Error:", error);
    }
  }

  handleCard(card) {
    // card.domElement.addEventListener("click", () => {
    this.eventManager.emit(GameEvents.CARD_CLICK, card);
    // });
  }

  // removeHandleCard(card) {
  //   card.domElement.removeEventListener("click", () => {
  //     this.eventManager.emit(GameEvents.CARD_CLICK, card);
  //   });
  // }

  isFaceDownCard(card) {
    if (this.state.faceDownCards.length > 0) {
      this.filterFaceDownCards(card);
      if (this.state.faceDownCards.length <= 0) {
        // alert("Все карты открылись");
        this.eventManager.emit(GameEvents.COLLECT_BTN_SHOW);
        return;
      }
      return;
    }
    throw new Error("error in isFaceDownCard");
  }

  filterFaceDownCards(card) {
    const newC = this.state.faceDownCards.filter(
      (cardFaceDoun) => cardFaceDoun !== card
    );
    this.state.faceDownCards = newC;
  }

  updateFaceDownCard(card) {
    this.state.faceDownCards.push(card);
  }

  setDataAttribute(element, nameAttribite, valueAttribute = "") {
    element.dataset[nameAttribite] = valueAttribute;
  }
}
