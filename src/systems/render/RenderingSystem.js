import { UIConfig } from "../../configs/UIConfig.js";
import { Stock } from "../../core/Stock.js";
import { GameEvents } from "../../utils/Constants.js";
import { RenderStaticElements } from "./RenderStaticElements.js";
import { RenderStockElement } from "./RenderStockElement.js";

export class RenderingSystem {
  constructor(eventManager, stateManager, cardsSystem) {
    this.eventManager = eventManager;
    this.stateManager = stateManager;
    this.cardsSystem = cardsSystem;
    this.components = {};
    this.domElements = {
      gameContainer: document.getElementById("game-container"),
      rowElement: document.getElementById("row"),
      foundationsDiv: document.getElementById("foundationsDiv"),
      tableausEl: document.getElementById("tableausDiv"),
      stockDivEl: document.getElementById("stockDiv"),
      // wasteContainer: document.getElementById("waste"),
      wasteContainer: document.getElementById("waste"),
    };

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.registerComponents();
  }

  registerComponents() {
    this.components = {
      renderStaticElements: new RenderStaticElements(this.domElements),
      renderStockElement: new RenderStockElement(
        this.eventManager,
        this.stateManager,
        this.domElements,
        this.cardsSystem
      ),
    };
  }

  setupEventListeners() {
    // this.eventManager.on("card:moved", (data) => this.animateCardMove(data));
    // this.eventManager.on("card:flipped", (card) => this.animateCardFlip(card));
    // this.eventManager.on("game:undo:move", (data) =>
    //   this.animateUndoMove(data)
    // );
    // this.eventManager.on("hint:show", (hint) => this.showHint(hint));
    // this.eventManager.on("ui:theme:change", (theme) => this.applyTheme(theme));
  }

  /////////////////////////////////
  // renderGame() {
  //   // 1. Получаем данные из state
  //   const gameComponents = this.getGameComponents();
  //   console.log("gameComponents:", gameComponents);

  //   if (!gameComponents) {
  //     console.error("Game state not found");
  //     return;
  //   }

  //   const { foundations, tableaus, stock } = gameComponents;

  //   // 2. Очистка контейнеров
  //   this.clearContainers();
  //   // 3. Добавляем элементы в DOM
  //   this.addElementsInDom(foundations, tableaus, stock);
  //   this.renderStockElement(stock);
  //   this.renderStockCards(stock);
  //   this.addStockEventListeners(stock);

  //   setTimeout(() => {
  //     // // Раздача карт в tableau
  //     for (let i = 0; i < 7; i++) {
  //       for (let j = 0; j <= i; j++) {
  //         const card = stock.deal();
  //         card.faceUp = j === i;
  //         this.eventManager.emit(
  //           GameEvents.ANIMATE_STOCK_CARD_MOVE,
  //           card,
  //           stock.element,
  //           tableaus[i].element,
  //           j
  //         );
  //         tableaus[i].addCard(card);
  //         if (card.faceUp) {
  //           const backStyle =
  //             this.stateManager.state.player.selectedItems.backs.styleClass;
  //           const faceStyle =
  //             this.stateManager.state.player.selectedItems.faces.styleClass;

  //           setTimeout(() => {
  //             this.eventManager.emit(
  //               GameEvents.CARD_FLIP,
  //               card,
  //               backStyle,
  //               faceStyle
  //             );
  //           }, 500);
  //         }
  //       }
  //     }
  //     console.log("tableaus:", tableaus);
  //   }, 200);

  //   // 3. Рендеринг эелементы карт
  // }

  renderStaticElements(foundations, tableaus) {
    this.components.renderStaticElements.render(foundations, tableaus);
  }

  renderStockElement(stock, waste) {
    if (!stock || !waste) {
      console.error("Invalid stock || waste");
      return;
    }
    this.components.renderStockElement.render(stock, waste);
  }

  renderCards() {
    console.log("В РЕНДЕРЕ КАРТ");

    const gameComponents = this.getGameComponents();
    const { foundations, tableaus, stock } = gameComponents;
    // Очищаем старые карты
    this.clearAllCards();
    // Рендерим карты в foundations
    this.renderCardsForFoundation(foundations);
    // Рендерим карты в tableau
    this.renderCardsForTableau(tableaus);
    // Устанавливаем стили для stock добавив класс
    this.renderStockElement(stock);
    // Рендерим карту в waste
    this.renderCardsForWaste(stock);
    this.addStockEventListeners(stock);
  }

  renderCardsForFoundation(foundations) {
    foundations.forEach((foundation, i) => {
      if (foundation.cards.length > 0) {
        const card = foundation.cards[foundation.cards.length - 1];
        this.renderCard(card, `foundation-${i}`, 0);
      }
    });
  }

  renderCardsForTableau(tableaus) {
    tableaus.forEach((tableau, i) => {
      tableau.cards.forEach((card, j) => {
        this.renderCard(card, `tableau-${i}`, j);
      });
    });
  }

  renderCardsForWaste(stock) {
    const wasteCard = stock.getWasteCard();
    if (wasteCard) {
      this.renderCard(wasteCard, "waste", 0);
    }
  }

  // renderStockElement(stock) {
  //   this.domElements.stockDivEl.innerHTML = "";
  //   stock.element = this.createStockElement();
  //   this.domElements.stockDivEl.append(stock.element, stock.waste.element);
  // }

  ////////////////////////////////////////////////////////

  createStockElement() {
    const element = document.createElement("div");
    const span = document.createElement("span");
    element.className = "stock";
    // element.classList.add(
    //   "stock",
    //   this.stateManager.state.player.selectedItems.backs.styleClass
    // );
    element.id = "stock";
    // span.innerHTML = '<svg viewBox="0 0 24 24" width="90"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>';
    span.textContent = "↺";
    span.classList.add("stock-span");
    element.append(span);
    return element;
  }

  addStockEventListeners(stock) {
    stock.element.addEventListener("click", () => {
      console.log("stock.element:", stock.element);
      if (stock.index < 0) {
        console.log("INDEX < 0");

        stock.recycleWaste();
        this.renderStockCards(stock);
        stock.wasteElement.querySelectorAll(".card").forEach((el) => {
          el.remove();
        });
        return;
      }
      console.log("INDEX >= 0");
      const wasteCard = stock.getWasteCard();
      console.log("WWWWWWWWWWWWWWWWWWWWWWW wasteCard:", wasteCard);

      if (wasteCard) {
        this.eventManager.emit(
          GameEvents.ANIMATE_CARD_TO_WASTE,
          wasteCard,
          stock
        );
      }
    });
  }

  clearAllCards() {
    document.querySelectorAll(".card").forEach((card) => card.remove());
  }

  getGameComponents() {
    return this.stateManager.state.currentGame?.components || null;
  }

  // после
  renderCard(card, containerId, offset = 0) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Создаем новый элемент карты
    const cardElement = document.createElement("div");
    cardElement.className = `card ${card.color}`;
    cardElement.dataset.suit = card.suit;
    cardElement.dataset.value = card.value;

    // Настройка рубашки/лица
    if (!card.faceUp) {
      cardElement.classList.add(
        this.stateManager.state.player.selectedItems.backs.styleClass
      );
    } else if (card.faceUp) {
      // Создаем элементы для символов карты
      const symbols = this.createCardSymbols(card);
      // Собираем карту
      cardElement.append(...symbols);
      cardElement.classList.add(
        this.stateManager.state.player.selectedItems.faces.styleClass
      );
    }

    // Позиционирование

    // Добавляем обработчики

    // Сохраняем ссылку на DOM элемент в карте
    card.domElement = cardElement;

    // setTimeout(() => {
    container.append(cardElement);
    // }, 1000)
    // Добавляем в DOM
    // container.append(cardElement);

    card.parentElement = container;
    this.updateCardPosition(card, containerId, offset);
    this.addCardEventListeners(card);
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

    container.append(cardElement);
  }

  // // после
  // renderCard(card, containerId, offset = 0) {
  //   const container = document.getElementById(containerId);
  //   if (!container) return;

  //   // Создаем новый элемент карты
  //   const cardElement = document.createElement("div");
  //   cardElement.className = `card ${card.color}`;
  //   cardElement.dataset.suit = card.suit;
  //   cardElement.dataset.value = card.value;

  //   const cardFront = document.createElement("div");
  //   const cardBack = document.createElement("div");
  //   const symbols = this.createCardSymbols(card);
  //   cardFront.classList.add(
  //     this.stateManager.state.player.selectedItems.faces.styleClass,
  //     "card-front"
  //   );

  //   cardBack.classList.add(
  //     this.stateManager.state.player.selectedItems.backs.styleClass,
  //     "card-back"
  //   );

  //   cardFront.append(...symbols);
  //   cardElement.append(cardFront, cardBack);

  //   // Настройка рубашки/лица
  //   if (!card.faceUp) {
  //     // cardFront.style.zIndex = "0";
  //     // cardBack.style.zIndex = "1";
  //     // cardBack.style.transform = "rotateY(180deg)";
  //   } else if (card.faceUp) {
  //     // cardFront.style.zIndex = "1";
  //     // cardBack.style.zIndex = "0";
  //     // cardFront.style.transform = "rotateY(85deg)";
  //     // cardBack.style.transform = "rotateY(85deg)";
  //     cardElement.style.transform = "rotateY(85deg)";
  //   }

  //   // Сохраняем ссылку на DOM элемент в карте
  //   card.domElement = cardElement;

  //   // Добавляем в DOM
  //   container.append(cardElement);

  //   card.parentElement = container;

  //   // Позиционирование
  //   this.updateCardPosition(card, containerId, offset);

  //   // Добавляем обработчики
  //   this.addCardEventListeners(cardElement, card);
  // }

  createCardSymbols(card) {
    const topSymbol = document.createElement("span");
    topSymbol.className = "card-symbol top";
    topSymbol.textContent = card.getSymbol();

    const centerSymbol = document.createElement("span");
    centerSymbol.className = "card-symbol center";
    centerSymbol.textContent = card.suit;

    const bottomSymbol = document.createElement("span");
    bottomSymbol.className = "card-symbol bottom";
    bottomSymbol.textContent = card.getSymbol();

    return [topSymbol, centerSymbol, bottomSymbol];
  }

  updateCardPosition(card, containerId, offset) {
    const isTableau = containerId.startsWith("tableau");
    const offsetPx = offset * UIConfig.layout.card.overlap;
    card.domElement.style.transition = `transform 1000ms linear`;
    card.domElement.style.transform = isTableau
      ? `translateY(${offsetPx}px)`
      : "";

    card.domElement.style.zIndex = offset;
  }

  updateStockCardPosition(card) {
    const offsetX = card.positionData.offsetX;
    const offsetY = card.positionData.offsetY;

    const zIndex = card.positionData.zIndex;
    card.domElement.style.transition = `transform 300ms linear`;
    card.domElement.style.transform = `translateX(${-offsetX}px) translateY(${-offsetY}px)`;
    card.domElement.style.zIndex = zIndex;
  }

  addCardEventListeners(card) {
    card.domElement.removeEventListener("click", () => {
      console.log("КЛИК ПО КАРТЕ");
      this.eventManager.emit(GameEvents.CARD_CLICK, card);
    });

    card.domElement.addEventListener("click", () => {
      console.log("КЛИК ПО КАРТЕ");
      this.eventManager.emit(GameEvents.CARD_CLICK, card);
    });

    // Добавляем обработчики для drag and drop
    // cardElement.addEventListener("mousedown", (e) => {
    //   this.handleDragStart(e, card, cardElement);
    // });

    // cardElement.addEventListener(
    //   "touchstart",
    //   (e) => {
    //     this.handleDragStart(e, card, cardElement);
    //   },
    //   { passive: true }
    // );
  }

  // handleDragStart(e, card, cardElement) {
  //   if (this.stateManager.game.isPaused) return;

  //   this.eventManager.emit("card:drag:start", {
  //     card,
  //     element: cardElement,
  //     clientX: e.clientX || e.touches[0].clientX,
  //     clientY: e.clientY || e.touches[0].clientY,
  //   });
  // }

  // animateCardMove({ card, from, to }) {
  //   const cardElement = card.domElement;
  //   if (!cardElement) return;

  //   const fromElement = document.getElementById(from);
  //   const toElement = document.getElementById(to);

  //   if (!fromElement || !toElement) return;

  //   // Animator.moveCard({
  //   Animator.animateCardMove({
  //     element: cardElement,
  //     from: fromElement,
  //     to: toElement,
  //     duration: UIConfig.animations.cardMoveDuration,
  //     onComplete: () => {
  //       this.cache.delete(card);
  //       // this.renderFullGame();
  //       this.renderCards();
  //     },
  //   });
  // }

  // animateCardFlip(card) {
  //   const cardElement = card.domElement;
  //   if (!cardElement) return;

  //   Animator.flipCard({
  //     element: cardElement,
  //     duration: UIConfig.animations.cardFlipDuration,
  //     onComplete: () => {
  //       cardElement.classList.remove(
  //         "face-down",
  //         this.stateManager.state.settings.cardBack
  //       );
  //       cardElement.classList.add(this.stateManager.state.settings.cardFace);
  //       this.addCardEventListeners(cardElement, card);
  //     },
  //   });
  // }

  // animateUndoMove({ card, from, to }) {
  //   // Анимация обратного перемещения
  //   this.animateCardMove({ card, from: to, to: from });
  // }

  // showHint(hint) {
  //   const { card, target } = hint;
  //   const cardElement = card.domElement;
  //   const targetElement = document.getElementById(target);

  //   if (!cardElement || !targetElement) return;

  //   // Подсвечиваем карту и цель
  //   Animator.highlightElement(cardElement, {
  //     color: "#ffeb3b",
  //     duration: 2000,
  //   });
  //   Animator.highlightElement(targetElement, {
  //     color: "#4caf50",
  //     duration: 2000,
  //   });

  //   // Показываем подсказку в UI
  //   this.eventManager.emit("ui:hint:show", hint);
  // }

  // applyTheme(themeName) {
  //   const theme = UIConfig.themes[themeName] || UIConfig.themes.default;

  //   // Применяем цвета темы
  //   document.documentElement.style.setProperty(
  //     "--primary-color",
  //     theme.colors.primary
  //   );
  //   document.documentElement.style.setProperty(
  //     "--secondary-color",
  //     theme.colors.secondary
  //   );
  //   document.documentElement.style.setProperty(
  //     "--background-color",
  //     theme.colors.background
  //   );
  //   document.documentElement.style.setProperty(
  //     "--text-color",
  //     theme.colors.text
  //   );

  //   // Применяем шрифты
  //   document.documentElement.style.setProperty("--main-font", theme.fonts.main);
  //   document.documentElement.style.setProperty(
  //     "--title-font",
  //     theme.fonts.title
  //   );
  // }

  clearCache() {
    this.cache.clear();
  }
}
