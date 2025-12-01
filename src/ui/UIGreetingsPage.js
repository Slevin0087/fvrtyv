import { UIPage } from "./UIPage.js";
import { GameEvents } from "../utils/Constants.js";

export class UIGreetingsPage extends UIPage {
  constructor(eventManager, stateManager) {
    super(eventManager, stateManager, "greetings-page");
    this.eventManager = eventManager;
    this.stateManager = stateManager;
    this.elements = {
      playGameBtn: document.getElementById("greetings-page-btn-play-game"),
      otherSettingsP: document.getElementById("greetings-game-mode-choice-p"),
    };
  }

  setupEventListeners() {
    this.elements.playGameBtn.onclick = async () => {
      this.stateManager.setGreetingsPageUsed(true);
      this.stateManager.saveGameState();
      await this.onClickPlayGameBtn();
    };
    this.elements.otherSettingsP.onclick = () => {
      this.onClickOtherSettingsP();
    };
  }

  async onClickPlayGameBtn() {
    this.eventManager.emit(GameEvents.RESET_STATE_FOR_NEW_GAME);
    await this.eventManager.emitAsync(GameEvents.SET_NEW_GAME);
    this.stateManager.setIsRunning(true);
    this.stateManager.setIsPaused(false);
    this.eventManager.emit(GameEvents.UI_UPDATE_GAME_PAGE);
  }

  onClickOtherSettingsP() {
    this.eventManager.emit(GameEvents.UI_SETTINGS_SHOW);
  }
}
