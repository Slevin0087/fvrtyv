import {
  GameEvents,
  AnimationDurations,
  AnimationDegs,
} from "../../utils/Constants.js";
import { GameConfig } from "../../configs/GameConfig.js";
import { UIConfig } from "../../configs/UIConfig.js";

export class RenderStockElement {
  constructor(
    eventManager,
    stateManager,
    gameLogicSystem,
    domElements,
    cardsSystem
  ) {
    this.eventManager = eventManager;
    this.stateManager = stateManager;
    this.gameLogicSystem = gameLogicSystem;
    this.domElements = domElements;
    this.cardsSystem = cardsSystem;
    this.wasteCardFlip = AnimationDurations.WASTE_CARD_FLIP;
    this.degsCardFlip = AnimationDegs.CARD_FLIP;
    this.cardContainers = GameConfig.cardContainers;
    this.isClickAllowed = true;
    this.clickLimitTime =
      UIConfig.animations.cardMoveDuration +
      UIConfig.animations.cardFlipDuration * 1000;

    this.setupEventListeners();
  }

  setupEventListeners() {
    this.eventManager.on(
      GameEvents.ADD_STOCK_EVENTS,
      async (stock, waste) => await this.handleStockElement(stock, waste)
    );
  }

  render(stock, waste) {
    this.domElements.stockDivEl.innerHTML = "";
    this.domElements.stockDivEl.append(stock.element, waste.element);
    this.renderStockCards(stock);
    this.addStockEventListeners(stock, waste);
  }

  addStockEventListeners(stock, waste) {
    stock.element.removeEventListener(
      "click",
      async () => await this.handleStockElement(stock, waste)
    );
    stock.element.addEventListener(
      "click",
      async () => await this.handleStockElement(stock, waste)
    );
  }

  async handleStockElement(stock, waste) {
    console.log("КЛИК ПО STOCK ЭЛЕМЕНТУ");
    if (!this.isClickAllowed) {
      return; // Если клики запрещены, ничего не делаем
    }
    if (!this.stateManager.state.firstCardClick) {
      this.stateManager.state.firstCardClick = true;
      this.eventManager.emit(GameEvents.START_PLAY_TIME, 0);
    }
    if (stock.stockCardPosition < 0 && waste.isEmpty()) return;
    else if (stock.stockCardPosition < 0) {
      this.isClickAllowed = false;
      console.log("stockCardPosition < 0");
      stock.recycleWaste(waste);
      this.renderStockCards(stock);
      waste.element.querySelectorAll(".card").forEach((el) => {
        el.remove();
      });
      await this.delay(this.clickLimitTime);
      this.isClickAllowed = true; // Разрешаем клики после задержки
      return;
    }
    this.isClickAllowed = false;
    console.log("stockCardPosition >= 0");
    const card = stock.getWasteCard();
    if (card) {
      console.log("card(getWasteCard) при клике по stock:", card);

      this.eventManager.emit(GameEvents.AUDIO_CARD_CLICK);
      await this.gameLogicSystem.handleCardMove({
        card,
        containerToIndex: 0,
        containerTo: waste,
        containerToName: this.cardContainers.waste,
      });
      await this.flipCard(card);
      this.eventManager.emit(
        GameEvents.SET_CARD_DATA_ATTRIBUTE,
        card.domElement,
        GameConfig.dataAttributes.cardParent,
        card.positionData.parent
      );
      this.eventManager.emit(
        GameEvents.SET_CARD_DATA_ATTRIBUTE,
        card.domElement,
        GameConfig.dataAttributes.cardDnd
      );
    }
    await this.delay(this.clickLimitTime);
    this.isClickAllowed = true; // Разрешаем клики после задержки
    // this.cardsSystem.removeHandleCard(card);
    // this.cardsSystem.handleCard(card);
  }

  renderStockCards(stock) {
    stock.cards.forEach((card) => {
      this.renderStockCard(card, stock.element);
      this.updateStockCardPosition(card);
    });
  }

  renderStockCard(card, container) {
    // Создаем новый элемент карты
    const cardElement = document.createElement("div");
    cardElement.className = `card ${card.color}`;
    cardElement.dataset.suit = card.suit;
    cardElement.dataset.value = card.value;

    cardElement.classList.add(
      this.stateManager.state.player.selectedItems.backs.styleClass
    );

    // Сохраняем ссылку на DOM элемент в карте
    card.domElement = cardElement;
    this.cardsSystem.removeHandleCard(card);
    container.append(cardElement);
  }

  updateStockCardPosition(card) {
    const offsetX = card.positionData.offsetX;
    const offsetY = card.positionData.offsetY;

    const zIndex = card.positionData.zIndex;
    card.domElement.style.transform = `translateX(${offsetX}px) translateY(${offsetY}px)`;
    card.domElement.style.zIndex = zIndex;
  }

  async flipCard(card) {
    try {
      console.log("card, которая попадает в flipCard:", card);

      this.eventManager.emit(GameEvents.CARD_FLIP, card);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
