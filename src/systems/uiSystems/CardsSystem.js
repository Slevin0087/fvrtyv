import { Deck } from "../../core/Deck.js";
import { Foundation } from "../../core/Foundation.js";
import { Tableau } from "../../core/Tableau.js";
import { Stock } from "../../core/Stock.js";
import { Waste } from "../../core/Waste.js";
import { GameEvents } from "../../utils/Constants.js";

export class CardsSystem {
  constructor(eventManager, stateManager) {
    this.eventManager = eventManager;
    this.stateManager = stateManager;
    this.state = this.stateManager.state;
    // this.waste = waste;
    this.dragState = null;
    this.selectedCard = null;
    this.faceDownCards = [];

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setCardsContainers();
  }

  setupEventListeners() {
    this.eventManager.on(GameEvents.CHANGE_CARDS_STYLES, () =>
      this.setCardsStyles()
    );
  }

  setCardsContainers() {
    this.deck = new Deck();
    this.foundations = Array.from({ length: 4 }, (_, i) => new Foundation(i));
    this.tableaus = Array.from({ length: 7 }, (_, i) => new Tableau(i));
    this.stock = new Stock();
    this.waste = new Waste();
    const cardsComponents = {
      deck: this.deck,
      foundations: this.foundations,
      tableaus: this.tableaus,
      stock: this.stock,
      waste: this.waste,
    }
    this.stateManager.setCardsComponents(cardsComponents)
  }

  getCardStyles() {
    return {
      backStyle: this.state.player.selectedItems.backs,
      faceStyle: this.state.player.selectedItems.faces,
    };
  }

  highlightValidTargets(card) {
    const { foundations, tableaus } = this.state.game;

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
    if (this.state.game.isPaused) return;

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
    const { foundations, tableaus } = this.state.game;
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

  isFaceDownCard(card) {
    if (this.faceDownCards.length > 0) {
      const newC = this.faceDownCards.filter(
        (cardFaceDoun) => cardFaceDoun !== card
      );
      this.faceDownCards = newC;
    } else if (this.faceDownCards.length <= 0) {
      alert('Все карты открылись');
      this.eventManager.emit(GameEvents.COLLECT_BTN_SHOW);
      // document.getElementById('blinking-text').classList.remove('hidden');
    }
  }

  updateFaceDownCard(card) {
    this.faceDownCards.push(card);
  }

  setCardsStyles() {
    const { foundations, tableaus, stock, waste } =
      this.stateManager.getCardsComponents();
    foundations?.forEach((foundation) =>
      this.circleCardsComponents(foundation)
    );
    tableaus?.forEach((tableau) => this.circleCardsComponents(tableau));
    this.circleCardsComponents(stock);
    this.circleCardsComponents(waste);
  }

  circleCardsComponents(cardsComponent) {
    const { backStyle, faceStyle } = this.getCardStyles();
    cardsComponent.cards?.forEach((card) => {
      if (card.faceUp) {
        card.domElement.className = "";
        card.domElement.classList.add("card", card.color, faceStyle);
      } else if (!card.faceUp) {
        card.domElement.className = "";
        card.domElement.classList.add("card", card.color, backStyle);
      }
    });
  }
}
