import { UIPage } from "./UIPage.js";
import { GameEvents } from "../utils/Constants.js";

export class UIGreetingsPage extends UIPage {
  constructor(eventManager, stateManager) {
    super(eventManager, stateManager, "greetings-page");
    this.eventManager = eventManager;
    this.stateManager = stateManager;
    this.elements = {
      playGameBtn: document.getElementById("greetings-page-btn-play-game"),
    };
  }

  setupEventListeners() {
    this.elements.playGameBtn.onclick = async () => {
      this.stateManager.setGreetingsPageUsed(true);
      this.stateManager.saveGameState();
      await this.onClickPlayGameBtn();
    };
  }

  async onClickPlayGameBtn() {
    this.eventManager.emit(GameEvents.RESET_STATE_FOR_NEW_GAME);
    await this.eventManager.emitAsync(GameEvents.SET_NEW_GAME);
    this.stateManager.setIsRunning(true);
    this.stateManager.setIsPaused(false);
    this.eventManager.emit(GameEvents.UI_UPDATE_GAME_PAGE);
  }
}
