import {
  GameEvents,
  AnimationDurations,
  AnimationDegs,
  AudioName,
} from "../../utils/Constants.js";
import { gamePageElements } from "../../utils/gamePageElements.js";
import { GameConfig } from "../../configs/GameConfig.js";
import { UIConfig } from "../../configs/UIConfig.js";
import { Animator } from "../../utils/Animator.js";
import { Helpers } from "../../utils/Helpers.js";

export class RenderStockElement {
  constructor(eventManager, stateManager, logicSystemsInit, gameModesManager) {
    this.eventManager = eventManager;
    this.stateManager = stateManager;
    this.state = this.stateManager.state;
    this.logicSystemsInit = logicSystemsInit;
    this.gameModesManager = gameModesManager;
    this.gamePageElements = gamePageElements;
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

    this.eventManager.on(GameEvents.RENDER_STOCK_CARD, (card, stockElement) => {
      this.renderStockCard(card, stockElement);
      this.updateStockCardPosition(card);
    });
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
    this.soundAndShuffleAnimateCards(20);
    const isAnimate = this.stateManager.getIsAnimateCardFromStockToWaste();
    const isRunning = this.stateManager.getIsRunning();
    const isDelingAnimate = this.stateManager.getIsDealingCardsAnimation();

    if (isAnimate || !isRunning || isDelingAnimate) {
      return; // Если клики запрещены или выполняется перемещение карты из waste, то ничего не делаем
    }
    if (!this.gameModesManager.getIsRedeals()) return;
    if (!this.stateManager.getPlayerFirstCardClick()) {
      this.stateManager.setPlayerFirstCardClick(true);
      this.eventManager.emit(GameEvents.START_PLAY_TIME, Date.now());
    }
    if (stock.stockCardPosition === 0) {
      this.gameModesManager.upMaxRedealsCounts();
      this.gameModesManager.setIsRedeals();
      if (!this.gameModesManager.getIsRedeals()) {
        stock.spanElement.textContent = "";
      }
    }
    if (stock.stockCardPosition < 0 && waste.isEmpty()) {
      stock.spanElement.textContent = "";
      return;
    } else if (stock.stockCardPosition < 0) {
      stock.spanElement.textContent = "↺";
      const isUpLastMoves = this.gameModesManager.getIsUpLastMoves();
      if (isUpLastMoves) {
        this.eventManager.emit(GameEvents.RESET_LAST_MOVES);
        this.eventManager.emit(
          GameEvents.UP_UNDO_CONTAINER,
          this.stateManager.getLastMovesLengths()
        );
      }
      // this.isClickAllowed = false;
      stock.recycleWaste(waste);
      this.renderStockCards(stock);
      waste.element.innerHTML = "";
      this.stateManager.setIsAnimateCardFromStockToWaste(false);
      // await this.delay(this.clickLimitTime);
      // this.isClickAllowed = true; // Разрешаем клики после задержки
      return;
    }
    // this.isClickAllowed = false;
    const nOfCards = this.stateManager.getDealingCards(); // СЕЙЧАС ЭТО РАВНО 3
    const nTopCards = stock.getNTopCards(nOfCards);
    let topThreeCards = [];
    let oldOffsetsTopThreeCards = [];
    if (nTopCards) {
      this.stateManager.setIsAnimateCardFromStockToWaste(true);
      let lastMovesForStock = []; // Массив для дальнейшего использования в отменах хода, где карты были перемещены из stock в waste
      let isUpLastMoves = this.gameModesManager.getIsUpLastMoves();
      this.eventManager.emit(GameEvents.AUDIO_CARD_CLICK);
      const nTopCardsReverse = nTopCards.toReversed();

      for (const card of nTopCardsReverse) {
        topThreeCards = waste.topThreeCards;

        if (topThreeCards.length > 0) {
          oldOffsetsTopThreeCards = topThreeCards.map((card) => {
            if (card === waste.getTopCard()) {
              card.removeDataAttribute(
                GameConfig.dataAttributes.dataAttributeDND
              );
              // Удаление картам событий: onpointerdown, onpointermove, onpointerup
              this.eventManager.emit(
                GameEvents.RESET_ONPOINTERDOWN_TO_CARD,
                card.domElement
              );
              this.eventManager.emit(
                GameEvents.RESET_ONPOINTERMOVE_TO_CARD,
                card.domElement
              );
              this.eventManager.emit(
                GameEvents.RESET_ONPOINTERUP_TO_CARD,
                card.domElement
              );
              ///////////////////////////////////////////
            }
            return {
              card,
              oldOffsetX: card.positionData.offsetX,
              oldOffsetY: card.positionData.offsetY,
            };
          });
        }

        // card.positionData.parent = stock.type;

        // Добавление каждой карты в массив lastMovesForStock,
        // чтобы в дальнейшем использовать отдельно для UndoSystem(отмена хода)
        isUpLastMoves = this.gameModesManager.getIsUpLastMoves();
        if (isUpLastMoves) {
          lastMovesForStock.push({
            card,
            from: stock.type,
            to: waste.type,
          });
        }
        await this.logicSystemsInit.handleCardMove({
          card,
          containerToIndex: 0,
          containerTo: waste,
          containerToName: this.cardContainers.waste,
          cardMoveDuration: this.cardMoveDuration,
        });

        await this.flipCard(card);

        if (oldOffsetsTopThreeCards.length > 0) {
          const audioCardMove = this.logicSystemsInit.audioManager.getSound(
            AudioName.CARD_MOVE
          );
          const audioDuration = audioCardMove.duration();
          const duration = audioDuration ? audioDuration * 1000 : 250;
          console.log("durationduration: ", duration);

          const promiseAnimate = Animator.animateCardFomStockToWaste(
            oldOffsetsTopThreeCards,
            duration
          );
          if (this.stateManager.getSoundEnabled()) {
            const promiseAudio = audioCardMove.play();
            // .catch((error) => {
            //   console.warn("Звук не воспроизведён:", error.name);
            //   return Promise.resolve();
            // });

            await Promise.all([promiseAudio, promiseAnimate]);
          } else {
            await promiseAnimate;
          }
        }
      }

      if (isUpLastMoves) {
        const lastMove = lastMovesForStock.toReversed();
        this.logicSystemsInit.undoSystem.updateLastMoves(lastMove);

        this.stateManager.updateMoves(this.numberMoves);
        this.eventManager.emit(GameEvents.UP_MOVES);
      }
      const wasteTopCard = waste.getTopCard();

      if (wasteTopCard) {
        wasteTopCard.setDataAttribute(
          GameConfig.dataAttributes.dataAttributeDND
        );

        // Добавление картам событий: onpointerdown, onpointermove, onpointerup
        this.eventManager.emit(
          GameEvents.ADD_ONPOINTERDOWN_TO_CARD,
          wasteTopCard.domElement
        );
        this.eventManager.emit(
          GameEvents.ADD_ONPOINTERMOVE_TO_CARD,
          wasteTopCard.domElement
        );
        this.eventManager.emit(
          GameEvents.ADD_ONPOINTERUP_TO_CARD,
          wasteTopCard.domElement
        );
        ///////////////////////////////////////////
      }
    }

    this.stateManager.setIsAnimateCardFromStockToWaste(false);
    // await this.delay(this.clickLimitTime);
    // this.isClickAllowed = true; // Разрешаем клики после задержки
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
    cardElement.className = `card-back`;
    cardElement.dataset.suit = card.suit;
    cardElement.dataset.value = card.value;
    const backStyle = this.stateManager.getSelectedItems().backs;
    if (backStyle.bgType === "images") {
      cardElement.style.backgroundImage = `url(${backStyle.previewImage.img})`;
      const bgPositions = Helpers.calculateCardBackPosition(backStyle);
      cardElement.style.backgroundPosition = `${bgPositions.x}% ${bgPositions.y}%`;
    } else {
      cardElement.classList.add(backStyle.styleClass);
    }

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
      await this.eventManager.emitAsync(GameEvents.CARD_FLIP, card);
    } catch (error) {
      console.log("Error:", error);
    }
  }

  async shuffleCardsToStock(stock, waste) {
    if (stock.isEmpty() && waste.isEmpty()) return;
    this.stateManager.setIsDealingCardsAnimation(true);
    const isSoundEnabled = this.stateManager.getSoundEnabled();
    const audioCardMove = isSoundEnabled
      ? this.logicSystemsInit.audioManager.getSound(AudioName.CARD_MOVE)
      : null;
    if (stock.isEmpty() && !waste.isEmpty()) {
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
      await Animator.animateShuffleCardsToStock(stock.cards, audioCardMove);
    } else if (!stock.isEmpty() && waste.isEmpty()) {
      const shCards = Helpers.shuffleArray(stock.cards);
      stock.cards = [];
      stock.addCards(shCards);

      await Animator.animateShuffleCardsToStock(stock.cards, audioCardMove);
    } else if (!stock.isEmpty() && !waste.isEmpty()) {
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
      await Animator.animateShuffleCardsToStock(stock.cards, audioCardMove);
    }
    this.stateManager.setIsDealingCardsAnimation(false);
    this.eventManager.on(GameEvents.AUDIO_UP_ACH);
    this.eventManager.emit(GameEvents.CREAT_ELEMENT_FOR_NOTIF_SHUFFLED_CARDS);
    await this.delay(UIConfig.delays.delayForCreateHighestScore);
    this.eventManager.emit(GameEvents.CREAT_ELEMENT_FOR_HIGHEST_SCORE);
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  soundAndShuffleAnimateCards(length) {
    const audioDuration = audioCardMove.duration();
    for (let i = 0; i <= length; i++) {
      const resultDuration = 600 + Math.random() * 400;
      const resultDelay = i * 80;
      console.log("resultDuration, resultDelay: ", resultDuration, resultDelay);
    }
  }
}
