import { UITimedMode } from "../../ui/UIGameModes/UITimedMode.js";
import { GameModesConfigs } from "../../configs/GameModesConfogs.js";

export class TimedModeSystem {
  constructor(eventManager, stateManager) {
    this.eventManager = eventManager;
    this.stateManager = stateManager;
    this.fastMovesCount = 0;
    this.startTimeMove = 0;
    this.secondTimeMove = 0;
    this.maxComboTime = 4000;
    this.comboTimeout = null;
    this.state = GameModesConfigs.TIMED;

    this.initComponents();
  }

  initComponents() {
    this.ui = new UITimedMode();
  }

  getStartTimeMove() {
    return this.startTimeMove;
  }

  getCombo() {
    const currentTime = Date.now();
    if (this.startTimeMove === 0) {
      // Первый ход в потенциальном комбо
      this.startTimeMove = currentTime;
      this.fastMovesCount = 1; // <-- Начинаем с 1
      return;
    }

    // Проверяем время с последнего хода
    const timeSinceLastMove = currentTime - this.startTimeMove;
    if (timeSinceLastMove < this.maxComboTime) {
      // Ход сделан вовремя - увеличиваем комбо
      this.fastMovesCount++;
      this.startTimeMove = currentTime;

      // Показываем обновленное комбо
      this.eventManager.emit(GameEvents.AUDIO_SHOCK);
      this.ui.comboShow(this.fastMovesCount, this.maxComboTime);

      // Сбрасываем таймер сброса комбо
      this.resetComboTimeout();
    } else {
      // Слишком медленно - сбрасываем комбо
      if (this.fastMovesCount > 1) {
        // Показываем финальное комбо только если было больше 1
        this.eventManager.emit(GameEvents.AUDIO_SHOCK);
        this.ui.comboShow(this.fastMovesCount, this.maxComboTime);
      }

      // Начинаем новое комбо с текущего хода
      this.startTimeMove = currentTime;
      this.fastMovesCount = 1;
    }
  }

  resetComboTimeout() {
    if (this.comboTimeout) {
      clearTimeout(this.comboTimeout);
      this.comboTimeout = null;
    }

    this.comboTimeout = setTimeout(() => {
      this.startTimeMove = 0;
      this.fastMovesCount = 0;
      this.secondTimeMove = 0;
    }, this.maxComboTime);
  }

  setStartTimeMove() {
    const result =
      this.startTimeMove === 0 ? Date.now() : this.startTimeMove - Date.now();
    this.startTimeMove = result;
  }

  upFastMovesCount() {
    this.fastMovesCount++;
  }

  resetFastMovesCount() {
    this.fastMovesCount = 0;
  }

  calculateComboTimeUp(fastMovesCount) {
    for (let i = 0; i <= fastMovesCount; i++) {}
  }
}
