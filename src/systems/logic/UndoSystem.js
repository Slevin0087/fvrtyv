import { GameEvents, AudioName } from "../../utils/Constants.js";

export class UndoSystem {
  constructor(eventManager, stateManager, audioManager) {
    this.eventManager = eventManager;
    this.stateManager = stateManager;
    this.audioManager = audioManager;

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
    const { card, from, to } = this.stateManager.state.game.lastMove.pop();
    if (card.openCard) {
      const openCard = card.openCard;
      const backStyle =
        this.stateManager.state.player.selectedItems.backs.styleClass;
      const faceStyle =
        this.stateManager.state.player.selectedItems.faces.styleClass;
      this.eventManager.emit(GameEvents.BACK_CARD_FLIP, {
        openCard,
        backStyle,
        faceStyle,
      });
      card.openCard.faceUp = false;
      card.openCard = null;
      
    }
    this.reverseMove(card, from, to);
  }

  reverseMove(card, from, to) {
    const [fromType, fromIndex] = this.parseTargetId(from);

    if (fromType === "tableau") {
      this.eventManager.emit(GameEvents.CARD_TO_TABLEAU, {
        card,
        tableauIndex: fromIndex,
      });
    } else if (fromType === "foundation") {
      this.eventManager.emit(GameEvents.CARD_TO_FOUNDATION, {
        card,
        foundationIndex: fromIndex,
      });
    } else if (fromType === "waste") {
      this.eventManager.emit("card:to:waste", { card });
    }
    card.isUndo = !card.isUndo;
  }

  updateLastMove(params) {
    const { card } = params;
    if (card.isUndo) return;
    if (this.isLastMove()) {
      console.log("в if (this.isLastMove())");
      card.isUndo = !card.isUndo;
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
