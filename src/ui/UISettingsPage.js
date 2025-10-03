import { UIPage } from "./UIPage.js";
import { GameEvents } from "../utils/Constants.js";
import { Helpers } from "../utils/Helpers.js";

export class UISettingsPage extends UIPage {
  constructor(eventManager, stateManager) {
    super(eventManager, stateManager, "settings");
    this.elements = {
      backBtn: document.getElementById("back-to-menu"),
      soundToggle: document.getElementById("sound-toggle"),
      difficultySelect: document.getElementById("difficulty"),
      musicVolume: document.getElementById("music-volume"),
      languageSelected: document.getElementById("language-selected"),
      dealingCardsOne: document.getElementById("dealing_cards-one"),
      dealingCardsThree: document.getElementById("dealing_cards-three"),
    };
  }

  setupEventListeners() {
    super.setupEventListeners();

    this.elements.soundToggle.addEventListener("change", (e) => {
      this.eventManager.emit(GameEvents.SET_SOUND_TOGGLE, e.target.checked);
    });

    this.elements.difficultySelect.addEventListener("change", (e) => {
      this.eventManager.emit(GameEvents.SET_DIFFICUTY_CHANGE, e.target.value);
    });

    this.elements.languageSelected.addEventListener("change", (e) => {
      Helpers.changeLanguage(e.target.value);
      this.eventManager.emit(GameEvents.SET_LANGUAGE_CHANGE, e.target.value);
    });

    this.elements.musicVolume.addEventListener("input", (e) => {
      const volume = Math.max(0, Math.min(1, e.target.value / 100));
      this.eventManager.emit(GameEvents.SET_MUSIC_VOLUME, parseFloat(volume));
      this.eventManager.emit(GameEvents.SETTINGS_MUSIC_VOLUME);
      this.setPropertyStyleVolume(e.target);
    });

    this.elements.dealingCardsOne.addEventListener("change", (e) => {
      if (e.target.checked) {
        this.stateManager.state.player.dealingCards = Number(e.target.value);
      }
    });

    this.elements.dealingCardsThree.addEventListener("change", (e) => {
      if (e.target.checked) {
        this.stateManager.state.player.dealingCards = Number(e.target.value);
      }
    });
  }

  render() {
    const settings = this.state.settings;
    this.elements.soundToggle.checked = settings.soundEnabled;
    this.elements.difficultySelect.value = settings.difficulty;
    this.elements.languageSelected.value = settings.language;
    this.elements.musicVolume.value = settings.musicVolume * 100;
    this.setPropertyStyleVolume(this.elements.musicVolume);
    this.elements.dealingCardsOne.checked =
      this.elements.dealingCardsOne.value ===
      String(this.stateManager.state.player.dealingCards);
    this.elements.dealingCardsThree.checked =
      this.elements.dealingCardsThree.value ===
      String(this.stateManager.state.player.dealingCards);
  }

  show() {
    super.show();
    this.render();
    // await Animator.fadeIn(this.page, this.displayPage);
  }

  setPropertyStyleVolume(element) {
    element.style.setProperty("--fill-percent", `${element.value}%`);
  }
}
