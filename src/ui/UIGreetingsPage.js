import { UIPage } from "./UIPage.js";
import { GameEvents } from "../utils/Constants.js";

export class UIGreetingsPage extends UIPage {
  constructor(eventManager, stateManager) {
    super(eventManager, stateManager, "greetings-page");
    this.eventManager = eventManager;
    this.stateManager = stateManager;
    this.elements = {
      contentContainer: document.getElementById(
        "greetings-page-content-container"
      ),
      modeChoiceContainer: document.getElementById(
        "greetings-game-mode-choice-container"
      ),
      playGameBtn: document.getElementById("greetings-page-btn-play-game"),
      gameRulesContainer: document.getElementById("game-rules-text-container"),
      gameRulesP: document.getElementById("game-rules-text-p"),
      gameRulesClose: document.getElementById("game-rules-text-close"),
      otherSettingsP: document.getElementById("greetings-game-mode-choice-p"),
    };
  }

  setupEventListeners() {
    this.elements.playGameBtn.onclick = async () => {
      this.stateManager.setGreetingsPageUsed(true);
      this.stateManager.saveGameState();
      await this.onClickPlayGameBtn();
    };
    this.elements.gameRulesP.onclick = () => {
      this.onClickGameRulesP();
    };
    this.elements.otherSettingsP.onclick = () => {
      this.onClickOtherSettingsP();
    };
    this.elements.gameRulesClose.onclick = () => {
      this.onClickGameRulesClose();
    };
  }

  async onClickPlayGameBtn() {
    this.eventManager.emit(GameEvents.RESET_STATE_FOR_NEW_GAME);
    await this.eventManager.emitAsync(GameEvents.SET_NEW_GAME);
    this.stateManager.setIsRunning(true);
    this.stateManager.setIsPaused(false);
    this.eventManager.emit(GameEvents.UI_UPDATE_GAME_PAGE);
  }

  onClickGameRulesP() {
    this.elements.gameRulesContainer.classList.remove("hidden");
    this.elements.modeChoiceContainer.classList.add("hidden");
  }

  onClickGameRulesClose() {
    this.elements.modeChoiceContainer.classList.remove("hidden");
    this.elements.gameRulesContainer.classList.add("hidden");
  }

  onClickOtherSettingsP() {
    this.eventManager.emit(GameEvents.UI_SETTINGS_SHOW);
  }
}
