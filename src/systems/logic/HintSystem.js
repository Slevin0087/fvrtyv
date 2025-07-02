export class HintSystem {
  constructor(eventManager, stateManager, audioManager) {
    this.eventManager = eventManager;
    this.stateManager = stateManager;
    this.audioManager = audioManager;
  }

  provide() {
    if (this.stateManager.state.game.score < 5) {
      this.eventManager.emit(
        "ui:notification",
        "Нужно минимум 5 очков для подсказки"
      );
      this.audioManager.play("error");
      return;
    }

    const hint = this.findBestHint();
    // ... остальная логика
  }

  findBestHint() {
    // ... реализация аналогична оригиналу
  }
}
