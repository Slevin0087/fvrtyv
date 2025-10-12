import { UIPage } from "./UIPage.js";
import { GameEvents } from "../utils/Constants.js";

export class UISettingsPage extends UIPage {
  constructor(eventManager, stateManager, translator) {
    super(eventManager, stateManager, "settings");
    this.translator = translator;
    this.elements = {
      backBtn: document.getElementById("back-to-menu"),
      soundToggle: document.getElementById("sound-toggle"),
      // difficultySelect: document.getElementById("difficulty"),
      musicVolume: document.getElementById("music-volume"),
      languageSelected: document.getElementById("language-selected"),
      dealingCardsOne: document.getElementById("dealing_cards-one"),
      dealingCardsThree: document.getElementById("dealing_cards-three"),
      dealingCardsModal: document.getElementById("dealing-cards-modal"),
      dealingCardsModalClose: document.getElementById(
        "dealing-cards-modal-close"
      ),
      dealingCardsModalDontShowAgain: document.getElementById(
        "dealing-cards-modal-dont-show-again-btn"
      ),
      dealingCardsModalItsClear: document.getElementById(
        "dealing-cards-modal-its-clear-btn"
      ),
    };
  }

  setupEventListeners() {
    super.setupEventListeners();

    this.elements.soundToggle.onchange = (e) => {
      this.eventManager.emit(GameEvents.SET_SOUND_TOGGLE, e.target.checked);
    };

    // this.elements.difficultySelect.onchange = (e) => {
    //   this.eventManager.emit(GameEvents.SET_DIFFICUTY_CHANGE, e.target.value);
    // };

    this.elements.languageSelected.onchange = (e) => this.onChangeLanguage(e);

    this.elements.musicVolume.oninput = (e) => this.onInputMusicVolume(e);

    this.elements.dealingCardsOne.onchange = (e) =>
      this.onChangeDealingCards(e);

    this.elements.dealingCardsThree.onchange = (e) =>
      this.onChangeDealingCards(e);
    this.elements.dealingCardsModalDontShowAgain.onclick = () =>
      this.onClickDealingCardsModalDontShowAgain(true);
    this.elements.dealingCardsModalItsClear.onclick = () => this.onClickDealingCardsModalItsClear();
  }

  onChangeLanguage(e) {
    const volume = Math.max(0, Math.min(1, e.target.value / 100));
    this.eventManager.emit(GameEvents.SET_MUSIC_VOLUME, parseFloat(volume));
    this.eventManager.emit(GameEvents.SETTINGS_MUSIC_VOLUME);
    this.setPropertyStyleVolume(e.target);
  }

  onChangeDealingCards(e) {
    if (!this.stateManager.state.player.isDontShowAgainDealingCardsModal) {
      console.log("Больше не показывать модуль dealingCardsModal");
      this.elements.dealingCardsModal.classList.remove("hidden");
    }
    if (e.target.checked) {
      const value = Number(e.target.value);
      this.eventManager.emit(GameEvents.SET_DEALING_CARDS, value);
    }
  }

  onInputMusicVolume(e) {
    const volume = Math.max(0, Math.min(1, e.target.value / 100));
    this.eventManager.emit(GameEvents.SET_MUSIC_VOLUME, parseFloat(volume));
    this.eventManager.emit(GameEvents.SETTINGS_MUSIC_VOLUME);
    this.setPropertyStyleVolume(e.target);
  }

  onClickDealingCardsModalDontShowAgain(boolean) {
    this.stateManager.setdontShowAgainDealingCardsModal(boolean);
    this.elements.dealingCardsModal.classList.add("hidden");
  }

  onClickDealingCardsModalItsClear() {
    this.elements.dealingCardsModal.classList.add("hidden");
  }

  render() {
    const settings = this.state.settings;
    this.elements.soundToggle.checked = settings.soundEnabled;
    // this.elements.difficultySelect.value = settings.difficulty;
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
  }

  setPropertyStyleVolume(element) {
    element.style.setProperty("--fill-percent", `${element.value}%`);
  }
}
