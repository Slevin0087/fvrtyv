import { GameEvents } from "../../utils/Constants.js";

export class RenderStockElement {
  constructor(eventManager, stateManager, domElements, cardsSystem) {
    this.eventManager = eventManager;
    this.stateManager = stateManager;
    this.domElements = domElements;
    this.cardsSystem = cardsSystem;
  }

  render(stock) {
    this.domElements.stockDivEl.innerHTML = "";
    stock.element = this.createStockElement();
    this.addStockEventListeners(stock);
    this.addWasteEventListeners(stock.waste);
    this.domElements.stockDivEl.append(stock.element, stock.waste.element);
    this.renderStockCards(stock);
  }

  createStockElement() {
    const element = document.createElement("div");
    const span = document.createElement("span");
    element.className = "stock";
    element.id = "stock";
    // span.innerHTML = '<svg viewBox="0 0 24 24" width="90"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>';
    span.textContent = "↺";
    span.classList.add("stock-span");
    element.append(span);
    return element;
  }

  addStockEventListeners(stock) {
    stock.element.removeEventListener("click", () =>
      this.handleStockElement(stock)
    );
    stock.element.addEventListener("click", () =>
      this.handleStockElement(stock)
    );
  }

  addWasteEventListeners(waste) {
    waste.element.removeEventListener("click", () =>
      this.handleWasteElement(waste)
    );
    waste.element.addEventListener("click", () =>
      this.handleWasteElement(waste)
    );
  }

  handleStockElement(stock) {
    console.log("КЛИК ПО STOCK ЭЛЕМЕНТУ");
    if (stock.index < 0 && stock.waste.isEmpty()) return;
    else if (stock.index < 0) {
      console.log("INDEX < 0");

      stock.recycleWaste();
      this.renderStockCards(stock);
      stock.waste.element.querySelectorAll(".card").forEach((el) => {
        el.remove();
      });

      return;
    }
    console.log("INDEX >= 0");
    const card = stock.getWasteCard();
    console.log("card:", card);

    if (card) {
      const backStyle =
        this.stateManager.state.player.selectedItems.backs.styleClass;
      const faceStyle =
        this.stateManager.state.player.selectedItems.faces.styleClass;
      this.eventManager.emit(
        GameEvents.ANIMATE_CARD_TO_WASTE,
        card,
        stock.waste.element,
        backStyle,
        faceStyle
      );
      this.eventManager.emit(GameEvents.AUDIO_CARD_FLIP);
      this.cardsSystem.removeHandleCard(card);
      this.cardsSystem.handleCard(card);
    }
  }

  handleWasteElement() {
    console.log("КЛИК ПО WASTE ЭЛЕМЕНТУ");
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
    const offset = card.positionData.offset;
    const zIndex = card.positionData.zIndex;
    card.domElement.style.transition = `transform 300ms linear`;
    card.domElement.style.transform = `translateX(${-offset}px) translateY(${-offset}px)`;
    card.domElement.style.zIndex = zIndex;
  }
}
