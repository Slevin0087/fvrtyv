export class UndoSystem {
  constructor(eventManager, stateManager, audioManager) {
    this.eventManager = eventManager;
    this.stateManager = stateManager;
    this.audioManager = audioManager;
  }

  execute() {
    if (!this.stateManager.state.game.lastMove) {
      this.audioManager.play(AudioName.INFO);
      return;
    }

    const { card, from, to } = this.stateManager.state.game.lastMove;
    this.eventManager.emit("game:undo:move", { card, from, to });
  }
}
