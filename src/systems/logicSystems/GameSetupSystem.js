import {
  GameEvents,
  AnimationDurations,
  AudioName,
} from "../../utils/Constants.js";
import { UIConfig } from "../../configs/UIConfig.js";
import { Animator } from "../../utils/Animator.js";

export class GameSetupSystem {
  constructor(eventManager, stateManager, audioManager) {
    this.eventManager = eventManager;
    this.stateManager = stateManager;
    this.audioManager = audioManager;
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

    this.eventManager.on(GameEvents.ADD_CARD_CLICK, (card) => {
      card.domElement.addEventListener("click", this.handleCard(card));
    });
    this.eventManager.on(
      GameEvents.SET_CARD_DATA_ATTRIBUTE,
      (cardDomElement, dataAttribute, cardParent) =>
        this.setDataAttribute(cardDomElement, dataAttribute, cardParent)
    );
  }

  async setCards(deck, stock) {
    deck.reset();
    const stockCards = [];
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
      if (isFaceUp) card.flip(true);
      await this.animateCardMove(card, tableau);
      if (isFaceUp) {
        await this.flipCard(card);
        // Добавление картам событий: onpointerdown, onpointermove, onpointerup
        this.eventManager.emit(
          GameEvents.ADD_ONPOINTERDOWN_TO_CARD,
          card.domElement
        );
        this.eventManager.emit(
          GameEvents.ADD_ONPOINTERMOVE_TO_CARD,
          card.domElement
        );
        this.eventManager.emit(
          GameEvents.ADD_ONPOINTERUP_TO_CARD,
          card.domElement
        );
        ///////////////////////////////
      } else if (!isFaceUp) {
        this.stateManager.pushFaceDownCard(card);
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  async animateCardMove(card, tableau) {
    try {
      const promiseAnimate = Animator.animateStockCardMove(
        {
          card,
          tableau,
        },
        this.startMoveSpeed
      );
      if (this.stateManager.getSoundEnabled()) {
        const audioCardMove = this.audioManager.getSound(AudioName.CARD_MOVE);

        const audioPlaySpeed =
          // this.startMoveSpeed / (audioCardMove.duration() * 100);
          (audioCardMove.duration() * 1000) / this.startMoveSpeed;
        const promiseAudio = audioCardMove.play({ rate: audioPlaySpeed });

        await Promise.all([promiseAudio, promiseAnimate]);
      } else {
        await promiseAnimate;
      }
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

  isFaceDownCard(card) {
    if (this.stateManager.getFaceDownCards().length > 0) {
      this.filterFaceDownCards(card);
      if (this.stateManager.getFaceDownCards().length <= 0) {
        // alert("Все карты открылись");
        this.eventManager.emit(GameEvents.COLLECT_BTN_SHOW);
        return;
      }
      return;
    }
    throw new Error("error in isFaceDownCard");
  }

  filterFaceDownCards(card) {
    const newFaceDownCards = this.state.faceDownCards.filter(
      (cardFaceDoun) => cardFaceDoun !== card
    );
    this.stateManager.upFaceDownCards(newFaceDownCards);
  }

  updateFaceDownCard(card) {
    this.state.faceDownCards.push(card);
  }

  setDataAttribute(element, nameAttribite, valueAttribute = "") {
    element.dataset[nameAttribite] = valueAttribute;
  }
}
