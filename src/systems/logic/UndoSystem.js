import { GameEvents, AudioName } from "../../utils/Constants.js";
import { UIConfig } from "../../configs/UIConfig.js";
import { GameConfig } from "../../configs/GameConfig.js";

export class UndoSystem {
  constructor(eventManager, stateManager, audioManager) {
    this.eventManager = eventManager;
    this.stateManager = stateManager;
    this.audioManager = audioManager;
    this.cardContainers = GameConfig.cardContainers;

    this.init();
  }

  init() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.eventManager.on(GameEvents.UNDO_MOVE, () => this.handleUndo());
  }

  handleUndo() {
    console.log("в handleUndo:", this.stateManager.state.game.lastMove);

    if (this.stateManager.state.game.lastMove.length === 0) {
      this.audioManager.play(AudioName.INFO);
      return;
    }
    // const lastMoveLength = this.stateManager.state.game.lastMove.length
    const { card, from, to, elementFrom, movementSystem } =
      this.stateManager.state.game.lastMove.pop();
    const backStyle =
      this.stateManager.state.player.selectedItems.backs.styleClass;
    const faceStyle =
      this.stateManager.state.player.selectedItems.faces.styleClass;
    if (card.openCard) {
      const openCard = card.openCard;
      const score = GameConfig.rules.scoreForCardFlip;
      this.eventManager.emit(
        GameEvents.BACK_CARD_FLIP,
        openCard,
        backStyle,
        faceStyle
      );
      new Promise((resolve) => {
        setTimeout(() => {
          this.eventManager.emit(
            GameEvents.UI_ANIMATION_POINTS_EARNED,
            openCard,
            score
          );
          this.eventManager.emit(GameEvents.ADD_POINTS, -score);
          card.openCard = null;
        }, UIConfig.animations.cardFlipDuration * 1000);
        resolve();
      });
    }
    this.reverseMove({
      card,
      from,
      to,
      backStyle,
      faceStyle,
    });
  }

  reverseMove({ card, from, to, backStyle, faceStyle }) {
    const [fromType, fromIndex] = this.parseTargetId(from);
    const gameComponents = this.stateManager.state.cardsComponents;

    if (fromType === this.cardContainers.tableau) {
      const toContainer = gameComponents.tableaus[fromIndex];
      this.eventManager.emit(GameEvents.CARD_MOVE, {
        card,
        i: fromIndex,
        toContainer,
        nameToContainer: fromType,
      });
    } else if (fromType === this.cardContainers.foundation) {
      const toContainer = gameComponents.foundations[fromIndex];
      this.eventManager.emit(GameEvents.CARD_MOVE, {
        card,
        i: fromIndex,
        toContainer,
        nameToContainer: fromType,
      });
    } else if (fromType === "waste") {
      const toElement = this.stateManager.state.cardsComponents.waste;
      this.eventManager.emit(
        GameEvents.ANIMATE_CARD_WASTE_STOCK,
        card,
        toElement.element,
        backStyle,
        faceStyle
      );
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
