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
    this.elements.newGameBtn.onclick = () => {
      this.eventManager.emit(GameEvents.SET_NEW_GAME);
      // this.eventManager.emit("game:start");
    };

    this.elements.continueBtn.onclick = () => {
      this.eventManager.emit(GameEvents.GAME_CONTINUE);
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
      this.eventManager.emit("game:exit", this);
      this.eventManager.emit("game:end");
    };
  }

  show() {
    super.show();
    if (this.stateManager.state.game.isRunning) {
      this.elements.continueBtn.style.display = "block";
    } else this.elements.continueBtn.style.display = "none";
  }

  updateContinueButton(visible) {
    this.elements.continueBtn.style.display = visible ? "block" : "none";
  }
}
