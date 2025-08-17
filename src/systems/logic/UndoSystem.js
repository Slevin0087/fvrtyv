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
      this.updateLastMove(params)
    );
  }

  async handleUndo() {
    if (!this.stateManager.state.game.isRunning) return;
    if (this.stateManager.state.game.lastMove.length === 0) {
      this.audioManager.play(AudioName.INFO);
      return;
    }
    const { card, from } = this.stateManager.state.game.lastMove.pop();
    card.isUndo = true;
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
    this.stateManager.incrementGameStat(this.textUndoUsed);
  }

  reverseMove({ card, from }) {
    const [fromType, fromIndex] = this.parseTargetId(from);
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
    // card.isUndo = false;
  }

  updateLastMove(params) {
    const { card } = params;
    if (card.isUndo) {
      card.isUndo = false;
      return;
    }
    this.stateManager.updateLastMove(params);
    this.eventManager.emit(
      GameEvents.UP_UNDO_CONTAINER,
      this.stateManager.state.game.lastMove.length
    );
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
