import { UITimedMode } from "../../ui/UIGameModes/UITimedMode.js";

export class TimedModeSystem {
  constructor(eventManager, stateManager) {
    this.eventManager = eventManager;
    this.stateManager = stateManager;
    this.fastMovesCount = 0;
    this.startTimeMove = 0;
    this.secondTimeMove = 0;
    this.maxComboTime = 4000;

    this.initUIComponent();
  }

  initUIComponent() {
    this.ui = new UITimedMode();
  }

  getStartTimeMove() {
    return this.startTimeMove;
  }

  // getCombo() {
  //   console.log("getCombo: ");
  //   if (this.startTimeMove === 0) {
  //     this.startTimeMove = Date.now();
  //     return;
  //   } else {
  //     this.secondTimeMove = Date.now() - this.startTimeMove;
  //     if (this.secondTimeMove < this.maxComboTime) {
  //       this.fastMovesCount++;
  //       this.startTimeMove = Date.now();
  //     } else {
  //       if (this.fastMovesCount > 0) {
  //         this.ui.comboShow(this.fastMovesCount, this.maxComboTime)
  //       }
  //       this.secondTimeMove = 0;
  //       this.startTimeMove = 0;
  //       this.fastMovesCount = 0;
  //     }
  //   }
  // }

  getCombo() {
    console.log("getCombo called");

    const currentTime = Date.now();

    if (this.startTimeMove === 0) {
      // Первый ход в потенциальном комбо
      this.startTimeMove = currentTime;
      this.fastMovesCount = 1; // <-- Начинаем с 1
      // Можно показать комбо x1 сразу
      // this.ui.comboShow(this.fastMovesCount, this.maxComboTime);
      return;
    }

    // Проверяем время с последнего хода
    const timeSinceLastMove = currentTime - this.startTimeMove;

    if (timeSinceLastMove < this.maxComboTime) {
      // Ход сделан вовремя - увеличиваем комбо
      this.fastMovesCount++;
      this.startTimeMove = currentTime;

      // Показываем обновленное комбо
      this.ui.comboShow(this.fastMovesCount, this.maxComboTime);

      // Сбрасываем таймер сброса комбо
      this.resetComboTimeout();
    } else {
      // Слишком медленно - сбрасываем комбо
      if (this.fastMovesCount > 1) {
        // Показываем финальное комбо только если было больше 1
        this.ui.comboShow(this.fastMovesCount, this.maxComboTime);
      }

      // Начинаем новое комбо с текущего хода
      this.startTimeMove = currentTime;
      this.fastMovesCount = 1;
      this.ui.comboShow(this.fastMovesCount, this.maxComboTime);
    }
  }

  resetComboTimeout() {
    if (this.comboTimeout) {
      clearTimeout(this.comboTimeout);
    }

    this.comboTimeout = setTimeout(() => {
      // Автоматический сброс комбо через maxComboTime
      if (this.fastMovesCount > 1) {
        this.ui.comboShow(this.fastMovesCount, this.maxComboTime);
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
}
