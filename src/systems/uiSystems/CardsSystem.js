import { Deck } from "../../core/Deck.js";
import { Foundation } from "../../core/Foundation.js";
import { Tableau } from "../../core/Tableau.js";
import { Stock } from "../../core/Stock.js";
import { Waste } from "../../core/Waste.js";
import { GameEvents } from "../../utils/Constants.js";
import { Helpers } from "../../utils/Helpers.js";

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
    this.eventManager.on(GameEvents.CHANGE_CARDS_STYLES, (item) =>
      this.setCardsStyles(item)
    );

    this.eventManager.on(GameEvents.RESET_CARD_BG_IMAGE, (card) => {
      this.resetCardDomElementBgImage(card);
    });

    this.eventManager.on(GameEvents.ADD_CARD_FRONT_IMAGE, (card, faceStyle) => {
      this.addCardFrontImage(card, faceStyle);
    });

    this.eventManager.on(GameEvents.ADD_CARD_FRONT_CLASS, (faceStyle, card) => {
      this.addCardFrontClass(faceStyle, card);
    });

    this.eventManager.on(
      GameEvents.ADD_CARD_BACK_IMAGE,
      (backStyle, cardDomElement) => {
        this.addCardBackImage(backStyle, cardDomElement);
      }
    );

    this.eventManager.on(
      GameEvents.ADD_CARD_BACK_CLASS,
      (backStyle, cardDomElement) => {
        this.addCardBackClass(backStyle, cardDomElement);
      }
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
    };
    this.stateManager.setCardsComponents(cardsComponents);
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
      alert("Все карты открылись");
      this.eventManager.emit(GameEvents.COLLECT_BTN_SHOW);
      // document.getElementById('blinking-text').classList.remove('hidden');
    }
  }

  updateFaceDownCard(card) {
    this.faceDownCards.push(card);
  }

  setCardsStyles(item) {
    if (item.category !== "cardFace" && item.category !== "cardBack") {
      return;
    } else {
      const { foundations, tableaus, stock, waste } =
        this.stateManager.getCardsComponents();
      const tableausCards = tableaus.flatMap((t) => t.cards);
      const foundationsCards = foundations.flatMap((f) => f.cards);
      const allCards = [
        ...tableausCards,
        ...foundationsCards,
        ...stock.cards,
        ...waste.cards,
      ];
      const selectedItem = this.stateManager.getSelectedItemOne(item.type);
      console.log("selectedItem: ", selectedItem);
      if (selectedItem.bgType === "images") {
        if (item.category === "cardBack") {
          for (const card of allCards) {
            if (!card.faceUp) {
              card.domElement.style.backgroundImage = `url(${selectedItem.previewImage.img})`;
              const bgPositions =
                Helpers.calculateCardBackPosition(selectedItem);
              card.domElement.style.backgroundPosition = `${bgPositions.x}% ${bgPositions.y}%`;
            } else {
              continue;
            }
          }
        } else if (item.category === "cardFace") {
          for (const card of allCards) {
            if (card.faceUp) {
              this.resetCardDomElementBgImage(card);
              card.domElement.style.backgroundImage = `url(${selectedItem.previewImage.img})`;
              const bgPositions = Helpers.calculateCardBgSpriteSheetPosition(
                card.suit,
                card.value,
                selectedItem.previewImage.manyColumns,
                selectedItem.previewImage.manyLines
              );
              card.domElement.style.backgroundPosition = `${bgPositions.x}% ${bgPositions.y}%`;
            } else {
              continue;
            }
          }
        }
      } else {
        if (item.category === "cardBack") {
          card.domElement.classList.add(selectedItem.styleClass);
        } else if (item.category === "cardFace") {
          card.domElement.classList.add(selectedItem.styleClass);
        }
      }
    }
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

  resetCardDomElementBgImage(card) {
    card.domElement.style.backgroundImage = "";
    card.domElement.style.backgroundSize = "";
    card.domElement.style.backgroundPosition = "";
  }

  addCardFrontImage(card, faceStyle) {
    card.domElement.style.backgroundImage = `url(${faceStyle.previewImage.img})`;
    const elementPositions = Helpers.calculateCardBgSpriteSheetPosition(
      card.suit,
      card.value,
      faceStyle.previewImage.manyColumns,
      faceStyle.previewImage.manyLines
    );
    card.domElement.style.backgroundPosition = `${elementPositions.x}% ${elementPositions.y}%`;
  }

  addCardFrontClass(faceStyle, card) {
    const topSymbol = document.createElement("span");
    topSymbol.className = "card-symbol top";
    topSymbol.textContent = card.getSymbol();

    const centerSymbol = document.createElement("span");
    centerSymbol.className = "card-symbol center";
    centerSymbol.textContent = card.suit;

    const bottomSymbol = document.createElement("span");
    bottomSymbol.className = "card-symbol bottom";
    bottomSymbol.textContent = card.getSymbol();
    card.domElement.classList.add(faceStyle.styleClass);
    card.domElement.append(topSymbol, centerSymbol, bottomSymbol);
  }

  addCardBackImage(backStyle, cardDomElement) {
    cardDomElement.style.backgroundImage = `url(${backStyle.previewImage.img})`;
    const bgPositions = Helpers.calculateCardBackPosition(backStyle);
    cardDomElement.style.backgroundPosition = `${bgPositions.x}% ${bgPositions.y}%`;
  }

  addCardBackClass(backStyle, cardDomElement) {
    cardDomElement.classList.add(backStyle.styleClass);
  }
}
