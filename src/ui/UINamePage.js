import { UIPage } from "./UIPage.js";
import { GameEvents } from "../utils/Constants.js";

export class UINamePage extends UIPage {
  constructor(eventManager, stateManager) {
    super(eventManager, stateManager, "player-page");
    this.state = stateManager.state;
    this.elements = {
      form: document.getElementById("player-form"),
      input: document.getElementById("player-name"),
      submitBtn: document.getElementById("submit-name"),
      skipBtn: document.getElementById("skip-name"),
      errorMsg: document.getElementById("name-error"),
    };
  }

  setupEventListeners() {
    this.elements.form.onsubmit = (e) => this.handleSubmit(e);
    this.elements.skipBtn.onclick = () => this.handleSkip();
    this.eventManager.on(GameEvents.SET_NAME_IN_INPUT, () =>
      this.setNameInInput()
    );
  }

  setNameInInput() {
    const value =
      this.state.player.name === ""
        ? this.elements.input.placeholder
        : this.state.player.name;
    this.elements.input.value = value;
  }

  handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const name = formData.get(this.elements.input.name).trim();
    this.eventManager.emit(GameEvents.PLAYER_NAME_SET, name);
    this.eventManager.emit(GameEvents.UI_NAME_HIDE);
  }

  handleSkip() {
    // this.eventManager.emit(GameEvents.PLAYER_NAME_SET, this.state.player.name);
    this.eventManager.emit(GameEvents.UI_NAME_HIDE);
  }

  showError(message) {
    this.elements.errorMsg.textContent = message;
    this.elements.errorMsg.classList.remove("hidden");
    this.elements.submitBtn.disabled = true;
  }

  hideError() {
    this.elements.errorMsg.classList.add("hidden");
    this.elements.submitBtn.disabled = false;
  }

  saveName(name) {
    this.state.player.name = name;
    this.stateManager.storage.savePlayerStats(this.state.player);
  }

  show() {
    super.show();
    this.elements.input.focus();
  }

  reset() {
    this.otherElements.input.value = "";
    this.hideError();
  }
}
