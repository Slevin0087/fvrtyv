import { GameEvents } from "../utils/Constants.js";

export class UIPage {
  constructor(eventManager, stateManager, pageId) {
    this.eventManager = eventManager;
    this.stateManager = stateManager;
    this.state = stateManager.state;
    this.page = document.getElementById(pageId);
    this.displayPage = "";
    this.elements = {};

    if (!this.page) {
      console.error(`Element with id "${pageId}" not found`);
    }
  }

  init() {
    this.getDisplayPage();
    this.setupEventListeners();
  }

  getDisplayPage() {
    const computedStyle = window.getComputedStyle(this.page);
    this.displayPage = computedStyle.display;
  }

  setupEventListeners() {
    // Базовые слушатели (можно переопределить)
    if (this.elements.backBtn) {
      this.elements.backBtn.onclick = () => this.handleBack();
    }
  }

  handleBack() {
    this.eventManager.emit(GameEvents.BACK_BTN_CLICKED);
  }

  show() {
    this.page.classList.remove("hidden");
  }

  hide() {
    this.page.classList.add("hidden");
  }
}
