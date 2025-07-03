import { Deck } from "../core/Deck.js";
import { Foundation } from "../core/Foundation.js";
import { Tableau } from "../core/Tableau.js";
import { Stock } from "../core/Stock.js";
import { GameEvents } from "../utils/Constants.js";
import { Animator } from "../utils/Animator.js";

export class CardsSystem {
  constructor(eventManager, stateManager) {
    this.eventManager = eventManager;
    this.stateManager = stateManager;
    // this.waste = waste;
    this.dragState = null;
    this.selectedCard = null;

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setCardsContainers();
  }

  setupEventListeners() {
    // this.eventManager.on(GameEvents.CARD_CLICK, (card) => this.handleCardClick(card));
    // this.eventManager.on(GameEvents.CARD_DRAG_START, (card, element) =>
    //   this.handleDragStart(card, element)
    // );
    // this.eventManager.on(GameEvents.CARD_DRAG_END, () => this.handleDragEnd());
    // this.eventManager.on(GameEvents.CARD_DROP, (target) => this.handleDrop(target));
  }

  setCardsContainers() {
    this.deck = new Deck();
    this.foundations = Array.from({ length: 4 }, (_, i) => new Foundation(i));
    this.tableaus = Array.from({ length: 7 }, (_, i) => new Tableau(i));
    this.stock = new Stock();
    this.eventManager.emit(GameEvents.SET_CARDS_COMPONENTS, {
      deck: this.deck,
      foundations: this.foundations,
      tableaus: this.tableaus,
      stock: this.stock,
      waste: this.stock.waste,
    });
  }

  setCards() {
    this.deck.reset();

    // // Раздача карт в tableau
    // for (let i = 0; i < 7; i++) {
    //   for (let j = 0; j <= i; j++) {
    //     const card = deck.deal();
    //     card.faceUp = j === i;
    //     tableaus[i].addCard(card);
    //   }
    // }

    // Оставшиеся карты в сток
    const stockCards = [];

    while (!this.deck.isEmpty()) {
      const card = this.deck.deal();
      stockCards.push(card);
      console.log("stockCards:", stockCards);
    }
    this.stock.addCards(stockCards);

    // Сброс состояния игры
    // this.eventManager.emit(GameEvents.END_SET_NEW_GAME);
  }

  async dealTableauCards() {
    try {
      for (let i = 0; i < 7; i++) {
        for (let j = 0; j <= i; j++) {
          console.log("j:", j);
          await this.dealSingleCard(this.stock, this.tableaus[i], j, j === i);
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

  // handleCardClick(card) {
  //   if (this.stateManager.state.game.isPaused) return;

  //   // Если карта уже выбрана - снимаем выделение
  //   if (this.selectedCard === card) {
  //     this.deselectCard();
  //     return;
  //   }

  //   // Выделяем новую карту
  //   this.selectCard(card);
  // }

  selectCard(card) {
    this.deselectCard();
    this.selectedCard = card;

    // Визуальное выделение карты
    this.eventManager.emit("card:select", card);

    // Подсветка возможных ходов
    this.highlightValidTargets(card);
  }

  deselectCard() {
    if (!this.selectedCard) return;

    this.eventManager.emit("card:deselect", this.selectedCard);
    this.eventManager.emit("ui:clear:highlights");
    this.selectedCard = null;
  }

  highlightValidTargets(card) {
    const { foundations, tableaus } = this.stateManager.state.game;

    // Проверка foundation
    foundations.forEach((foundation, index) => {
      if (foundation.canAccept(card)) {
        this.eventManager.emit("ui:highlight:foundation", index);
      }
    });

    // Проверка tableau
    tableaus.forEach((tableau, index) => {
      if (tableau.canAccept(card)) {
        this.eventManager.emit("ui:highlight:tableau", index);
      }
    });
  }

  handleDragStart(card, element) {
    if (this.stateManager.state.game.isPaused) return;

    this.dragState = {
      card,
      element,
      source: card.positionData.parent,
      startX: element.getBoundingClientRect().left,
      startY: element.getBoundingClientRect().top,
      offsetX: 0,
      offsetY: 0,
      validTargets: this.getValidTargets(card),
    };

    this.eventManager.emit("ui:drag:start", element);
  }

  handleDragEnd() {
    if (!this.dragState) return;

    this.eventManager.emit("ui:drag:end");
    this.dragState = null;
  }

  handleDrop(target) {
    if (!this.dragState || !target) {
      this.handleDragEnd();
      return;
    }

    const { card, source, validTargets } = this.dragState;

    // Проверяем, является ли цель валидной
    if (validTargets.includes(target)) {
      this.moveCard(card, source, target);
    } else {
      this.eventManager.emit("ui:animate:return", this.dragState);
    }

    this.handleDragEnd();
  }

  moveCard(card, source, target) {
    this.eventManager.emit("game:move:start", { card, source, target });

    // Определяем тип цели (foundation или tableau)
    const [targetType, targetIndex] = this.parseTargetId(target);

    if (targetType === "foundation") {
      this.eventManager.emit("card:to:foundation", {
        card,
        foundationIndex: targetIndex,
      });
    } else if (targetType === "tableau") {
      this.eventManager.emit("card:to:tableau", {
        card,
        tableauIndex: targetIndex,
      });
    }
  }

  getValidTargets(card) {
    const { foundations, tableaus } = this.stateManager.state.game;
    const targets = [];

    foundations.forEach((foundation, index) => {
      if (foundation.canAccept(card)) {
        targets.push(`foundation-${index}`);
      }
    });

    tableaus.forEach((tableau, index) => {
      if (tableau.canAccept(card)) {
        targets.push(`tableau-${index}`);
      }
    });

    return targets;
  }


}
