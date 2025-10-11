import {
  GameEvents,
  AudioName,
  AnimationOperators,
} from "../../utils/Constants.js";
import { UIConfig } from "../../configs/UIConfig.js";
import { GameConfig } from "../../configs/GameConfig.js";
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

    this.setupEventListeners();
  }

  setupEventListeners() {
    this.eventManager.on(GameEvents.GET_CARD_SOURCE, (from) =>
      this.parseTargetId(from)
    );

    this.eventManager.on(
      GameEvents.UNDO_MOVE,
      async () => await this.handleUndo()
    );
    this.eventManager.on(GameEvents.UP_LAST_MOVE, (params) =>
      this.updateLastMoves(params)
    );
  }

  async handleUndo() {
    if (!this.state.game.isRunning) return;
    if (this.stateManager.getLastMovesLengths() === 0) {
      this.audioManager.play(AudioName.INFO);
      return;
    }

    const lastMove = this.state.game.lastMoves.pop();
    for (const { card, from } of lastMove) {
      // lastMove.forEach(async ({ card, from }) => {
      card.isUndo = true;
      if (card.openCard) {
        const openCard = card.openCard;
        const score = GameConfig.rules.scoreForCardFlip;
        // this.eventManager.emit(GameEvents.BACK_CARD_FLIP, openCard);
        const asyncBackCardFlip = this.eventManager.emitAsync(
          GameEvents.BACK_CARD_FLIP,
          openCard
        );
        await asyncBackCardFlip;

        //////////////////// RESET подписок на события /////////////////////////
        this.eventManager.emit(
          GameEvents.RESET_ONPOINTERDOWN_TO_CARD,
          openCard.domElement
        );
        this.eventManager.emit(
          GameEvents.RESET_ONPOINTERMOVE_TO_CARD,
          openCard.domElement
        );
        this.eventManager.emit(
          GameEvents.RESET_ONPOINTERUP_TO_CARD,
          openCard.domElement
        );
        ////////////////////////////////////

        await new Promise((resolve) => {
          setTimeout(() => {
            this.eventManager.emit(
              GameEvents.UI_ANIMATION_POINTS_EARNED,
              openCard,
              score,
              this.subtraction
            );
            this.eventManager.emit(GameEvents.ADD_POINTS, -score);
            this.eventManager.emit(GameEvents.UP_FACE_DOWN_CARD, openCard);
            card.openCard = null;
          }, UIConfig.animations.cardFlipDuration * 1000);
          resolve();
        });
      }
      // const { card, from } = this.state.game.lastMove.pop();
      await this.reverseMove({
        card,
        from,
      });
      // });
    }
    this.stateManager.incrementGameStat(this.textUndoUsed);
  }

  async reverseMove({ card, from }) {
    const [fromType, fromIndex] = this.parseTargetId(from);
    const gameComponents = this.state.cardsComponents;

    if (fromType === this.cardContainers.tableau) {
      const containerTo = gameComponents.tableaus[fromIndex];
      this.eventManager.emit(GameEvents.CARD_MOVE, {
        card,
        containerToIndex: fromIndex,
        containerTo,
        containerToName: fromType,
      });
    } else if (fromType === this.cardContainers.foundation) {
      const containerTo = gameComponents.foundations[fromIndex];
      this.eventManager.emit(GameEvents.CARD_MOVE, {
        card,
        containerToIndex: fromIndex,
        containerTo,
        containerToName: fromType,
      });
    } else if (fromType === this.cardContainers.waste) {
      const waste = gameComponents.waste;
      const stock = gameComponents.stock;
      const stockSpanTextContent =
        stock.stockCardPosition < 0 && waste.isEmpty() ? "" : "↺";
      this.eventManager.emit(GameEvents.CARD_MOVE, {
        card,
        containerToIndex: 0,
        containerTo: waste,
        containerToName: fromType,
      });
      stock.element.querySelector(".stock-span").textContent =
        stockSpanTextContent;
      const topThreeCards = waste.uppp();
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
    } else if (fromType === this.cardContainers.stock) {
      const containerTo = gameComponents.stock;
      // this.eventManager.emit(GameEvents.BACK_CARD_FLIP, card);
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

  // updateLastMove(params) {
  //   const { card } = params;
  //   if (card.isUndo) {
  //     card.isUndo = false;
  //     return;
  //   }
  //   this.stateManager.updateLastMove(params);
  //   this.eventManager.emit(
  //     GameEvents.UP_UNDO_CONTAINER,
  //     this.state.game.lastMove.length
  //   );
  // }

  updateLastMoves(params) {
    const { source, lastMove } = params;
    const cards = lastMove.map(({ card }) => card);

    const isUndoCards = cards.every((card) => {
      return card.isUndo;
    });
    if (isUndoCards) {
      cards.forEach((card) => (card.isUndo = false));
      return;
    }
    this.stateManager.updateLastMoves(params);
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
}
