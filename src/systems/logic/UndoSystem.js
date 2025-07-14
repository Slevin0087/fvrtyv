import {
  GameEvents,
  AudioName,
  AnimationOperators,
} from "../../utils/Constants.js";
import { UIConfig } from "../../configs/UIConfig.js";
import { GameConfig } from "../../configs/GameConfig.js";

export class UndoSystem {
  constructor(eventManager, stateManager, animator, audioManager) {
    this.eventManager = eventManager;
    this.stateManager = stateManager;
    this.animator = animator;
    this.audioManager = audioManager;
    this.cardContainers = GameConfig.cardContainers;
    this.subtraction = AnimationOperators.SUBTRACTION;

    this.init();
  }

  init() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.eventManager.on(
      GameEvents.UNDO_MOVE,
      async () => await this.handleUndo()
    );
  }

  async handleUndo() {
    console.log("в handleUndo:", this.stateManager.state.game.lastMove);

    if (this.stateManager.state.game.lastMove.length === 0) {
      this.audioManager.play(AudioName.INFO);
      return;
    }
    // const lastMoveLength = this.stateManager.state.game.lastMove.length
    const { card, from } = this.stateManager.state.game.lastMove.pop();
    if (card.openCard) {
      const openCard = card.openCard;
      const score = GameConfig.rules.scoreForCardFlip;
      this.eventManager.emit(GameEvents.BACK_CARD_FLIP, openCard);
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
    this.reverseMove({
      card,
      from,
    });
  }

  reverseMove({ card, from }) {
    console.log("card, from:", card, from);

    const [fromType, fromIndex] = this.parseTargetId(from);
    console.log("fromType, fromIndex:", fromType, fromIndex);

    const gameComponents = this.stateManager.state.cardsComponents;

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
      const containerTo = gameComponents.waste;
      this.eventManager.emit(GameEvents.CARD_MOVE, {
        card,
        containerToIndex: 0,
        containerTo,
        containerToName: fromType,
      });
    } else if (fromType === this.cardContainers.stock) {
      const containerTo = gameComponents.stock;
      this.eventManager.emit(GameEvents.BACK_CARD_FLIP, card);
      setTimeout(() => {
        this.eventManager.emit(GameEvents.CARD_MOVE, {
          card,
          containerToIndex: 0,
          containerTo,
          containerToName: fromType,
        });
      }, UIConfig.animations.cardFlipDuration * 2000);
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
    card.isUndo = !card.isUndo;
  }

  updateLastMove(params) {
    const { card } = params;
    if (card.isUndo) return;
    if (this.isLastMove()) {
      console.log("в if (this.isLastMove())");
      card.isUndo = !card.isUndo;
      console.log("card.isUndo:", card.isUndo);

      this.stateManager.updateLastMove(params);
      return;
    }
    this.stateManager.resetLastMove();
    this.stateManager.updateLastMove(params);
  }

  isLastMove() {
    return (
      this.stateManager.state.game.lastMove.length <
      this.stateManager.state.player.lastMoveQuantity
    );
  }

  parseTargetId(targetId) {
    const [type, index] = targetId.split("-");
    return [type, parseInt(index)];
  }
}
