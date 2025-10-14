import {
  GameEvents,
  AnimationDurations,
  AnimationDegs,
} from "../../utils/Constants.js";
import { gamePageElements } from "../../utils/gamePageElements.js";
import { GameConfig } from "../../configs/GameConfig.js";
import { UIConfig } from "../../configs/UIConfig.js";
import { Animator } from "../../utils/Animator.js";
import { Helpers } from "../../utils/Helpers.js";

export class RenderStockElement {
  constructor(eventManager, stateManager, logicSystemsInit, cardsSystem) {
    this.eventManager = eventManager;
    this.stateManager = stateManager;
    this.state = this.stateManager.state;
    this.logicSystemsInit = logicSystemsInit;
    this.gamePageElements = gamePageElements;
    this.cardsSystem = cardsSystem;
    this.wasteCardFlip = AnimationDurations.WASTE_CARD_FLIP;
    this.degsCardFlip = AnimationDegs.CARD_FLIP;
    this.cardContainers = GameConfig.cardContainers;
    this.numberMoves = GameConfig.rules.initialMove;
    this.cardMoveDuration = UIConfig.animations.cardMoveDuration;
    this.backMoveCardsToStockDuration =
      UIConfig.animations.backMoveCardsToStockDuration;
    this.isClickAllowed = true;
    this.clickLimitTime =
      UIConfig.animations.cardMoveDuration +
      UIConfig.animations.cardFlipDuration * 1000;
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.eventManager.on(GameEvents.ADD_STOCK_EVENTS, async (stock, waste) => {
      await this.handleStockElement(stock, waste);
    });

    this.eventManager.onAsync(
      GameEvents.SHUFFLE_CARDS_TO_STOCK,
      async (stock, waste) => {
        await this.shuffleCardsToStock(stock, waste);
      }
    );
  }

  render(stock, waste) {
    this.gamePageElements.stockDivEl.innerHTML = "";
    this.gamePageElements.stockDivEl.append(stock.element, waste.element);
    this.renderStockCards(stock);

    // Добавление элементу stock события onclick
    stock.element.onclick = async () => {
      await this.handleStockElement(stock, waste);
    };
    ///////////////
  }

  //////////// handleStockElement Срабатывает при клике по stock эелементу
  async handleStockElement(stock, waste) {
    console.log(
      "КЛИК ПО STOCK ЭЛЕМЕНТУ this.isClickAllowed: ",
      this.isClickAllowed
    );
    if (!this.isClickAllowed || !this.state.game.isRunning) {
      return; // Если клики запрещены или выполняется перемещение карты из waste,
      //  то ничего не делаем
    }
    if (!this.state.game.playerFirstCardClick) {
      this.state.game.playerFirstCardClick = true;
      this.eventManager.emit(GameEvents.START_PLAY_TIME, 0);
    }
    if (stock.stockCardPosition < 0 && waste.isEmpty()) {
      stock.element.querySelector(".stock-span").textContent = "";
      return;
    } else if (stock.stockCardPosition < 0) {
      stock.element.querySelector(".stock-span").textContent = "↺";
      this.eventManager.emit(GameEvents.RESET_LAST_MOVES);
      this.eventManager.emit(
        GameEvents.UP_UNDO_CONTAINER,
        this.stateManager.getLastMovesLengths()
      );
      this.isClickAllowed = false;
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
    const nOfCards = this.state.dealingCards; // СЕЙЧАС ЭТО РАВНО 3
    const nTopCards = stock.getNTopCards(nOfCards);
    console.log("nTopCards: ", nTopCards);
    let topThreeCards = [];
    let oldOffsetsTopThreeCards = [];
    if (nTopCards) {
      let lastMovesForStock = []; // Массив для дальнейшего использования в отменах хода, где карты были перемещены из stock в waste
      this.eventManager.emit(GameEvents.AUDIO_CARD_CLICK);
      const nTopCardsReverse = nTopCards.toReversed();
      // const nTopCardsReverse = nTopCards
      console.log("nTopCardsReverse: ", nTopCardsReverse);

      for (const card of nTopCardsReverse) {
        // console.log('getEventListeners(card.domElement): ', getEventListeners(card.domElement));

        console.log("for (const card of nTopCardsReverse): ", card);
        console.log("topThreeCards: ", topThreeCards);
        topThreeCards = waste.topThreeCards;
        oldOffsetsTopThreeCards = topThreeCards.map((card) => {
          return {
            card,
            oldOffsetX: card.positionData.offsetX,
            oldOffsetY: card.positionData.offsetY,
          };
        });
        card.positionData.parent = stock.type;

        // Добавление каждой карты в массив lastMovesForStock,
        // чтобы в дальнейшем использовать отдельно для UndoSystem(отмена хода)
        lastMovesForStock.push({
          card,
          from: stock.type,
          to: waste.type,
        });

        await this.logicSystemsInit.handleCardMove({
          card,
          containerToIndex: 0,
          containerTo: waste,
          containerToName: this.cardContainers.waste,
          cardMoveDuration: this.cardMoveDuration,
        });

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
        ///////////////////////////////////////////

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

      console.log("lastMovesForStock: ", lastMovesForStock);
      const lastMove = lastMovesForStock.toReversed();
      this.logicSystemsInit.undoSystem.updateLastMoves(lastMove);

      this.stateManager.updateMoves(this.numberMoves);
      this.eventManager.emit(GameEvents.UP_MOVES);
    }
    if (oldOffsetsTopThreeCards.length > 0) {
      await Animator.animateCardFomStockToWaste(oldOffsetsTopThreeCards);
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

    cardElement.classList.add(this.state.player.selectedItems.backs.styleClass);

    // Сохраняем ссылку на DOM элемент в карте
    card.domElement = cardElement;
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
      console.log("1. Before emitAsync");

      // Тест 1: Проверяем возвращаемое значение
      await this.eventManager.emitAsync(GameEvents.CARD_FLIP, card);
      // console.log("2. After emitAsync, promiseEvent:", promiseEvent);
      // console.log(
      //   "3. Is promiseEvent a Promise?",
      //   promiseEvent instanceof Promise
      // );

      // Тест 2: Проверяем асинхронность
      // await promiseEvent;
      console.log("4. After await");
    } catch (error) {
      console.log("Error:", error);
    }
  }

  async shuffleCardsToStock(stock, waste) {
    console.log("cccccccccccc");

    if (stock.isEmpty() && waste.isEmpty()) return;
    if (stock.isEmpty() && !waste.isEmpty()) {
      const cards = waste.cards.toReversed();
      for (const card of cards) {
        const move = await this.eventManager.emitAsync(
          GameEvents.BACK_MOVE_CARDS_TO_STOCK,
          stock,
          card,
          "stock",
          this.backMoveCardsToStockDuration
        );
        await move;
      }

      const shCards = Helpers.shuffleArray(stock.cards);
      stock.cards = [];
      stock.addCards(shCards);
      await Animator.animateShuffleCardsToStock(stock.cards);
    }
    if (!stock.isEmpty() && waste.isEmpty()) {
      const shCards = Helpers.shuffleArray(stock.cards);
      stock.cards = [];
      stock.addCards(shCards);
      await Animator.animateShuffleCardsToStock(stock.cards);
    }
    if (!stock.isEmpty() && !waste.isEmpty()) {
      const cards = waste.cards.toReversed();
      for (const card of cards) {
        await this.eventManager.emitAsync(
          GameEvents.BACK_MOVE_CARDS_TO_STOCK,
          stock,
          card,
          "stock",
          this.backMoveCardsToStockDuration
        );
      }

      const shCards = Helpers.shuffleArray(stock.cards);
      stock.cards = [];
      stock.addCards(shCards);
      await Animator.animateShuffleCardsToStock(stock.cards);
    }
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// // // Создаем анимации для всех карт
// const animations = stock.cards.map((card, index) => {
//   return new Promise((resolve, reject) => {
//     const cardElement = card.domElement;

//     const animate = cardElement.animate(
//       [
//         { transform: "translate(0, 0) rotate(0deg)", offset: 0 },
//         {
//           transform: `translate(${(Math.random() - 0.5) * 25}px, ${
//             (Math.random() - 0.5) * 15
//           }px) rotate(${(Math.random() - 0.5) * 40}deg)`,
//           offset: 0.5,
//         },
//         { transform: "translate(0, 0) rotate(0deg)", offset: 1 },
//       ],

//       {
//         duration: 600 + Math.random() * 400,
//         delay: index * 80,
//         easing: "cubic-bezier(0.4, 0, 0.2, 1)",
//       }
//     );

//     animate.onfinish = () => {
//       cardElement.style.transform = `translate(${card.positionData.offsetX}px, ${card.positionData.offsetY}px)`;
//       cardElement.style.zIndex = `${card.positionData.zIndex}`;
//       resolve();
//     };

//     animate.oncancel = () => {
//       reject(new Error("Animation was cancelled"));
//     };
//   });
// });

// // Ждем завершения всех анимаций
// await Promise.all(animations);
