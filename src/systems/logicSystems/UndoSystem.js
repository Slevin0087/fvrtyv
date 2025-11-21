import {
  GameEvents,
  AudioName,
  AnimationOperators,
} from "../../utils/Constants.js";
import { UIConfig } from "../../configs/UIConfig.js";
import { GameConfig, PlayerConfigs } from "../../configs/GameConfig.js";
import { Animator } from "../../utils/Animator.js";

export class UndoSystem {
  constructor(eventManager, stateManager, audioManager) {
    this.eventManager = eventManager;
    this.stateManager = stateManager;
    this.state = this.stateManager.state;
    this.audioManager = audioManager;
    this.cardContainers = GameConfig.cardContainers;
    this.subtraction = AnimationOperators.SUBTRACTION;
    this.textUndoUsed = "undoUsed";
    this.countUndoUsedForIncrement = PlayerConfigs.undo.countUsedForIncrement;
    this.cardMoveDuration = UIConfig.animations.cardMoveDuration;

    this.setupEventListeners();
  }

  setupEventListeners() {
    this.eventManager.on(GameEvents.GET_CARD_SOURCE, (from) =>
      this.parseTargetId(from)
    );

    this.eventManager.onAsync(
      GameEvents.UNDO_MOVE,
      async () => await this.handleUndo()
    );
    this.eventManager.on(GameEvents.UP_LAST_MOVE, (lastMove) =>
      this.updateLastMoves(lastMove)
    );

    this.eventManager.onAsync(
      GameEvents.BACK_MOVE_CARDS_TO_STOCK,
      async (stock, card, fromType, backMoveDuration) => {
        await this.backMoveCardsToStock(
          stock,
          card,
          fromType,
          backMoveDuration
        );
      }
    );
  }

  async handleUndo() {
    if (!this.state.game.isRunning) return;
    if (this.stateManager.getLastMovesLengths() === 0) {
      this.audioManager.play(AudioName.INFO);
      return;
    }

    this.stateManager.setIsAnimateCardFomStockToWaste(true);

    const lastMove = this.state.player.lastMoves.pop();
    for (const { cardData, openCardData, from } of lastMove) {
      const cardToLastMove = this.findCardToLastMove(cardData);
      // card.isUndo = true;
      cardToLastMove.isUndo = true;
      console.log('openCardData: ', openCardData);
      
      if (openCardData) {
        const openCardToLastMove = this.findCardToLastMove(openCardData);;
        const score = GameConfig.rules.scoreForCardFlip;
        await this.eventManager.emitAsync(GameEvents.BACK_CARD_FLIP, openCardToLastMove);

        //////////////////// RESET подписок на события /////////////////////////
        this.eventManager.emit(
          GameEvents.RESET_ONPOINTERDOWN_TO_CARD,
          openCardToLastMove.domElement
        );
        this.eventManager.emit(
          GameEvents.RESET_ONPOINTERMOVE_TO_CARD,
          openCardToLastMove.domElement
        );
        this.eventManager.emit(
          GameEvents.RESET_ONPOINTERUP_TO_CARD,
          openCardToLastMove.domElement
        );
        ////////////////////////////////////

        await new Promise((resolve) => {
          setTimeout(() => {
            this.eventManager.emit(
              GameEvents.UI_ANIMATION_POINTS_EARNED,
              openCardToLastMove,
              score,
              this.subtraction
            );
            this.eventManager.emit(GameEvents.ADD_POINTS, -score);
            this.eventManager.emit(GameEvents.UP_FACE_DOWN_CARD, openCardToLastMove);
            cardToLastMove.openCard = null;
          }, UIConfig.animations.cardFlipDuration * 1000);
          resolve();
        });
      }
      await this.reverseMove({
        card: cardToLastMove,
        from,
      });
    }
    this.stateManager.incrementUndoUsed(this.countUndoUsedForIncrement);
    this.stateManager.setIsAnimateCardFomStockToWaste(false);
  }

  async reverseMove({ card, from }) {
    const [fromType, fromIndex] = this.parseTargetId(from);
    const gameComponents = this.stateManager.getCardsComponents();

    if (fromType === this.cardContainers.tableau) {
      const containerTo = gameComponents.tableaus[fromIndex];
      const moveToTableau = this.eventManager.emitAsync(GameEvents.CARD_MOVE, {
        card,
        containerToIndex: fromIndex,
        containerTo,
        containerToName: fromType,
        cardMoveDuration: this.cardMoveDuration,
      });
      await moveToTableau;
    } else if (fromType === this.cardContainers.foundation) {
      const containerTo = gameComponents.foundations[fromIndex];
      await this.eventManager.emitAsync(GameEvents.CARD_MOVE, {
        card,
        containerToIndex: fromIndex,
        containerTo,
        containerToName: fromType,
        cardMoveDuration: this.cardMoveDuration,
      });
    } else if (fromType === this.cardContainers.waste) {
      const waste = gameComponents.waste;
      const stock = gameComponents.stock;
      const wasteTopCard = waste.getTopCard();
      if (wasteTopCard) {
        wasteTopCard.removeDataAttribute(
          GameConfig.dataAttributes.dataAttributeDND
        );

        // Удаление картам событий: onpointerdown, onpointermove, onpointerup
        this.eventManager.emit(
          GameEvents.RESET_ONPOINTERDOWN_TO_CARD,
          wasteTopCard.domElement
        );
        this.eventManager.emit(
          GameEvents.RESET_ONPOINTERMOVE_TO_CARD,
          wasteTopCard.domElement
        );
        this.eventManager.emit(
          GameEvents.RESET_ONPOINTERUP_TO_CARD,
          wasteTopCard.domElement
        );
      }
      const moveToWaste = this.eventManager.emitAsync(GameEvents.CARD_MOVE, {
        card,
        containerToIndex: 0,
        containerTo: waste,
        containerToName: fromType,
        cardMoveDuration: this.cardMoveDuration,
      });
      await moveToWaste;

      const stockSpanTextContent =
        stock.stockCardPosition < 0 && waste.isEmpty() ? "" : "↺";

      stock.element.querySelector(".stock-span").textContent =
        stockSpanTextContent;
      const topThreeCards = waste.topThreeCards;
      const oldOffsetsTopThreeCards = topThreeCards.map((card) => {
        return {
          card,
          oldOffsetX: card.positionData.offsetX,
          oldOffsetY: card.positionData.offsetY,
        };
      });
      if (oldOffsetsTopThreeCards.length > 0) {
        await Animator.animateCardFomStockToWaste(oldOffsetsTopThreeCards);
      }
      const wasteTopCardAfter = waste.getTopCard();

      if (wasteTopCardAfter) {
        wasteTopCardAfter.setDataAttribute(
          GameConfig.dataAttributes.dataAttributeDND
        );

        // Добавление картам событий: onpointerdown, onpointermove, onpointerup
        this.eventManager.emit(
          GameEvents.ADD_ONPOINTERDOWN_TO_CARD,
          wasteTopCardAfter.domElement
        );
        this.eventManager.emit(
          GameEvents.ADD_ONPOINTERMOVE_TO_CARD,
          wasteTopCardAfter.domElement
        );
        this.eventManager.emit(
          GameEvents.ADD_ONPOINTERUP_TO_CARD,
          wasteTopCardAfter.domElement
        );
        ///////////////////////////////////////////
      }
    } else if (fromType === this.cardContainers.stock) {
      const containerTo = gameComponents.stock;
      await this.backMoveCardsToStock(
        containerTo,
        card,
        fromType,
        this.cardMoveDuration
      );
      // // this.eventManager.emit(GameEvents.BACK_CARD_FLIP, card);
      // const asyncBackCardFlip = this.eventManager.emitAsync(
      //   GameEvents.BACK_CARD_FLIP,
      //   card
      // );
      // await asyncBackCardFlip;

      // const moveToStock = this.eventManager.emitAsync(GameEvents.CARD_MOVE, {
      //   card,
      //   containerToIndex: 0,
      //   containerTo,
      //   containerToName: fromType,
      // });

      // await moveToStock;

      // //////////////////// RESET подписок на события /////////////////////////
      // this.eventManager.emit(
      //   GameEvents.RESET_ONPOINTERDOWN_TO_CARD,
      //   card.domElement
      // );
      // this.eventManager.emit(
      //   GameEvents.RESET_ONPOINTERMOVE_TO_CARD,
      //   card.domElement
      // );
      // this.eventManager.emit(
      //   GameEvents.RESET_ONPOINTERUP_TO_CARD,
      //   card.domElement
      // );
      ////////////////////////////////////

      // setTimeout(() => {
      //   this.eventManager.emit(GameEvents.CARD_MOVE, {
      //     card,
      //     containerToIndex: 0,
      //     containerTo,
      //     containerToName: fromType,
      //   });
      // }, UIConfig.animations.cardFlipDuration * 2000);

      // this.eventManager.emit(
      //   GameEvents.ANIMATE_UNDO_TO_WASTE,
      //   card,
      //   containerTo.element
      // );
      // this.eventManager.emit(
      //   GameEvents.ANIMATE_CARD_WASTE_STOCK,
      //   card,
      //   toElement.element,
      // );
    }
    // card.isUndo = false;
  }

  async backMoveCardsToStock(stock, card, fromType, cardMoveDuration) {
    const containerTo = stock;
    const asyncBackCardFlip = this.eventManager.emitAsync(
      GameEvents.BACK_CARD_FLIP,
      card
    );
    await asyncBackCardFlip;

    const moveToStock = this.eventManager.emitAsync(GameEvents.CARD_MOVE, {
      card,
      containerToIndex: 0,
      containerTo,
      containerToName: fromType,
      cardMoveDuration,
    });

    await moveToStock;

    //////////////////// RESET подписок на события /////////////////////////
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
    ////////////////////////////////////
  }

  updateLastMoves(lastMove) {
    console.log('lastMove: ', lastMove);
    
    const cards = lastMove.map(({ card }) => card);

    const isUndoCards = cards.every((card) => {
      return card.isUndo;
    });
    if (isUndoCards) {
      cards.forEach((card) => (card.isUndo = false));
      return;
    }
    const convertedLastMove = lastMove.map(({ card, from, to }) => {
      const cardData = {
        suit: card.suit,
        value: card.value,
      };
      const openCardData = card.openCard
        ? { suit: card.openCard.suit, value: card.openCard.value }
        : null;
        console.log('const openCardData: ', openCardData);
        
      return { cardData, openCardData, from, to };
    });
    this.stateManager.updateLastMoves(convertedLastMove);
    this.eventManager.emit(
      GameEvents.UP_UNDO_CONTAINER,
      this.stateManager.getLastMovesLengths()
    );
  }

  isLastMove() {
    return this.state.game.lastMove.length < this.state.player.lastMoveQuantity;
  }

  parseTargetId(targetId) {
    const [type, index] = targetId.split("-");
    return [type, parseInt(index)];
  }

  findCardToLastMove(cardData) {
    const { stock, waste, foundations, tableaus } = this.stateManager.getCardsComponents();
    const allCards = [
      ...stock.cards,
      ...waste.cards,
      ...foundations.flatMap((foundation) => foundation.cards),
      ...tableaus.flatMap((tableau) => tableau.cards),
    ];
    const card = allCards.find(
      (c) => c.suit === cardData.suit && c.value === cardData.value
    );
    return card;
  }
}
