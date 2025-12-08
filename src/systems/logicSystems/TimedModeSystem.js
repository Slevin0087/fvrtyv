import { UITimedMode } from "../../ui/UIGameModes/UITimedMode.js";

export class TimedModeSystem {
  constructor(eventManager, stateManager) {
    this.eventManager = eventManager;
    this.stateManager = stateManager;
    this.fastMovesCount = 0;
    this.startTimeMove = 0;
    this.secondTimeMove = 0;
    this.maxComboTime = 4000

    this.initUIComponent()


  }

  initUIComponent() {
    this.ui = new UITimedMode()
  }

  getStartTimeMove() {
    return this.startTimeMove;
  }

  getCombo() {
    console.log("getCombo: ");
    if (this.startTimeMove === 0) {
      this.startTimeMove = Date.now();
      return;
    } else {
      this.secondTimeMove = Date.now() - this.startTimeMove;
      if (this.secondTimeMove < this.maxComboTime) {
        this.fastMovesCount++;
        this.startTimeMove = Date.now();
      } else {
        if (this.fastMovesCount > 0) {
          this.ui.comboShow(this.fastMovesCount, this.maxComboTime)
        }
        this.secondTimeMove = 0;
        this.startTimeMove = 0;
        this.fastMovesCount = 0;
      }
    }
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
