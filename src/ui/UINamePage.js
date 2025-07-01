import { UIPage } from "./UIPage.js";
import { GameEvents } from "../utils/Constants.js";

export class UINamePage extends UIPage {
  constructor(eventManager, stateManager) {
    super(eventManager, stateManager, "player-page");
    this.elements = {
      form: document.getElementById("player-form"),
      input: document.getElementById("player-name"),
      submitBtn: document.getElementById("submit-name"),
      skipBtn: document.getElementById("skip-name"),
      errorMsg: document.getElementById("name-error"),
    };

    // this.init();
  }

  init() {
    super.init();
    this.setNameInInput();
  }

  setupEventListeners() {
    this.elements.form.addEventListener("submit", (e) => this.handleSubmit(e));
    this.elements.skipBtn.addEventListener("click", () => this.handleSkip());
  }

  setNameInInput() {
    this.elements.input.value = this.stateManager.state.player.name;
  }

  handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const name = formData.get(this.elements.input.name).trim();   
    this.eventManager.emit(GameEvents.PLAYER_NAME_SET, name);
    this.eventManager.emit(GameEvents.UI_NAME_HIDE);
  }

  handleSkip() {
    this.eventManager.emit(GameEvents.PLAYER_NAME_SET, this.state.player.name);
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
