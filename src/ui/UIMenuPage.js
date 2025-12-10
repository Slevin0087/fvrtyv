import { UIPage } from "./UIPage.js";
import { GameEvents } from "../utils/Constants.js";

export class UIMenuPage extends UIPage {
  constructor(eventManager, stateManager) {
    super(eventManager, stateManager, "game-menu");
    this.elements = {
      newGameBtn: document.getElementById("new-game-btn"),
      settingsBtn: document.getElementById("settings-btn"),
      statePlayerBtn: document.getElementById("state-player"),
      shopBtn: document.getElementById("shop-btn"),
      exitBtn: document.getElementById("exit-btn"),
      continueBtn: document.getElementById("continue-btn"),
    };
  }

  setupEventListeners() {
    this.elements.newGameBtn.onclick = async () => {
      this.eventManager.emit(GameEvents.RESET_STATE_FOR_NEW_GAME);
      await this.eventManager.emitAsync(GameEvents.SET_NEW_GAME);
      this.stateManager.setIsRunning(true);
      this.stateManager.setIsPaused(false);
      this.eventManager.emit(GameEvents.UI_UPDATE_GAME_PAGE);
    };

    this.elements.settingsBtn.onclick = () => {
      this.eventManager.emit(GameEvents.UI_SETTINGS_SHOW);
    };

    this.elements.statePlayerBtn.onclick = () => {
      this.eventManager.emit(GameEvents.UI_STATEPLAYER_SHOW, this);
    };

    this.elements.shopBtn.onclick = () => {
      this.eventManager.emit(GameEvents.UI_SHOP_SHOW);
    };

    this.elements.exitBtn.onclick = () => {
      console.log("click exit");
    };
  }

  setContinueBtnEvent() {
    this.elements.continueBtn.onclick = () => {
      this.eventManager.emit(GameEvents.GAME_CONTINUE);
      if (
        this.stateManager.getIsPaused() &&
        this.stateManager.getIsRunning() &&
        this.stateManager.getPlayerFirstCardClick()
      ) {
        this.stateManager.setIsPaused(false);
        this.eventManager.emit(GameEvents.CONTINUE_PLAY_TIME);
      }
    };
  }

  resetContinueBtnEvent() {
    this.elements.continueBtn.onclick = "";
  }

  show() {
    super.show();
    if (this.stateManager.getIsRunning()) {
      this.elements.continueBtn.style.display = "block";
      this.setContinueBtnEvent();
    } else {
      this.elements.continueBtn.style.display = "none";
      this.resetContinueBtnEvent();
    }
  }
}
