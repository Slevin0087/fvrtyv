import { UITimedMode } from "../../ui/UIGameModes/UITimedMode.js";
import {
  GameModesIds,
  GameModesConfigs,
} from "../../configs/GameModesConfogs.js";
import { GameEvents } from "../../utils/Constants.js";

export class TimedModeSystem {
  constructor(eventManager, stateManager) {
    this.eventManager = eventManager;
    this.stateManager = stateManager;
    this.id = GameModesIds.TIMED;
    this.fastMovesCount = 0;
    this.startTimeMove = 0;
    this.secondTimeMove = 0;
    this.maxComboTime = 2000;
    this.comboTimeout = null;
    this.state = GameModesConfigs[this.id];
    this.rules = this.state.rules;
    this.scoring = this.state.scoring;
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
      if (this.fastMovesCount > 0) {
        const comboTimeUp = this.calculateComboTimeUp(this.fastMovesCount);
        console.log("comboTimeUp в this.fastMovesCount > 1: ", comboTimeUp);
        this.eventManager.emit(GameEvents.UP_START_TIME, comboTimeUp * 1000)
      }
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
    if (!fastMovesCount || fastMovesCount <= 0) return;
    let result = 0;
    for (let i = 1; i <= fastMovesCount; i++) {
      result += i * this.scoring.comboBonusTime;
    }

    return result;
  }
}
