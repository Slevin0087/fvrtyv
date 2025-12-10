import { UIPage } from "./UIPage.js";
import { GameEvents } from "../utils/Constants.js";
import { GameModesIds } from "../configs/GameModesConfogs.js";
import { UISettingsModals } from "./UIModals/UISettingsModals.js";

export class UISettingsPage extends UIPage {
  constructor(eventManager, stateManager, gameModesManager, translator) {
    super(eventManager, stateManager, "settings");
    this.translator = translator;
    this.uiDealingCardsModals = new UISettingsModals(this.eventManager, this.stateManager, this.translator)
    this.gameModesManager = gameModesManager;
    this.elements = {
      backBtn: document.getElementById("back-to-menu"),
      musicToggle: document.getElementById("music-toggle"),
      soundToggle: document.getElementById("sound-toggle"),
      assistanceInCollection: document.getElementById(
        "assistance-in-collection"
      ),
      assistanceInCardClick: document.getElementById(
        "assistance-in-card-click"
      ),
      musicVolume: document.getElementById("music-volume"),
      languageSelected: document.getElementById("language-selected"),
      modesSelected: document.getElementById("modes-selected"),
      dealingCardsBtns: {
        dealingCardsOne: document.getElementById("dealing_cards-one"),
        dealingCardsThree: document.getElementById("dealing_cards-three"),
      },
    };

    this.setupEventListeners()
  }

  setupEventListeners() {
    super.setupEventListeners();

    this.elements.musicToggle.onchange = (e) => {
      this.eventManager.emit(GameEvents.SET_MUSIC_TOGGLE, e.target.checked);
    };

    this.elements.soundToggle.onchange = (e) => {
      this.eventManager.emit(GameEvents.SET_SOUND_TOGGLE, e.target.checked);
    };

    this.elements.assistanceInCollection.onchange = (e) => {
      this.eventManager.emit(
        GameEvents.SET_ASSISTANCE_IN_COLLECTION,
        e.target.checked
      );
    };

    this.elements.assistanceInCardClick.onchange = (e) => {
      this.eventManager.emit(
        GameEvents.SET_ASSISTANCE_IN_CARD_CLICK,
        e.target.checked
      );
    };

    this.elements.languageSelected.onchange = (e) => {
      this.onChangeLanguage(e);
    };

    this.elements.modesSelected.onchange = (e) => {
      this.onChangeModes(e);
    };

    this.elements.musicVolume.oninput = (e) => {
      this.onInputMusicVolume(e);
    };

    this.eventManager.on(GameEvents.RENDER_ACTIVE_DEALING_CARDS_BTNS, () => this.renderActiveDealingCardsBtns())

    this.setEventsDealingCardsBtns();
  }

  onChangeLanguage(e) {
    this.translator.changeLanguage(e.target.value);
    this.eventManager.emit(GameEvents.SET_LANGUAGE_CHANGE, e.target.value);
  }

  onChangeModes(e) {
    if (e.target.value === GameModesIds.VEGAS) {
      this.eventManager.emit(GameEvents.CHOICE_VEGAS_MODE)
    }
    this.gameModesManager.setAllDataCurrentMode(e.target.value);
  }

  onChangeDealingCards(e) {
    if (e.target.value === String(this.stateManager.getDealingCards())) {
      return;
    }
    if (!this.stateManager.getIsDontShowAgainDealingCardsModal()) {
      if (e.target) {
        console.log("Больше не показывать модуль dealingCardsModal IF");
        const value = Number(e.target.value);
        console.log('');
        
        const modalBody = this.uiDealingCardsModals.createBody(value);
        const titlePathFirst = this.translator.t("dealing_cards_modal_title");
        this.uiDealingCardsModals.elements.modalTitle.textContent = `${titlePathFirst} ${value}`;
        this.uiDealingCardsModals.elements.modalBody.innerHTML = modalBody;
        this.uiDealingCardsModals.elements.modal.classList.remove("hidden");

        this.uiDealingCardsModals.elements.modalDontShowAgain.onclick = () =>
          this.onClickDealingCardsModalDontShowAgain(true);
        this.uiDealingCardsModals.elements.modalClose.onclick = () =>
          this.onClickDealingCardsModalClose();
        this.uiDealingCardsModals.elements.modalItsClear.onclick = () =>
          this.onClickDealingCardsModalItsClear(value);
      }
      return;
    } else if (this.stateManager.getIsDontShowAgainDealingCardsModal()) {
      console.log("Больше не показывать модуль dealingCardsModal ELSE");

      if (e.target) {
        const value = Number(e.target.value);
        this.eventManager.emit(GameEvents.SET_DEALING_CARDS, value);
        this.renderActiveDealingCardsBtns();
      }
      return;
    }
  }

  onInputMusicVolume(e) {
    const volume = Math.max(0, Math.min(1, e.target.value / 100));
    this.eventManager.emit(GameEvents.SET_MUSIC_VOLUME, parseFloat(volume));
    this.eventManager.emit(GameEvents.SETTINGS_MUSIC_VOLUME);
    this.renderPropertyStyleVolume(e.target);
  }

  onClickDealingCardsModalDontShowAgain(boolean) {
    this.stateManager.setIsDontShowAgainDealingCardsModal(boolean);
    this.uiDealingCardsModals.elements.modal.classList.add("hidden");
  }

  onClickDealingCardsModalClose() {
    this.uiDealingCardsModals.elements.modal.classList.add("hidden");
  }

  onClickDealingCardsModalItsClear(value) {
    console.log("value: ", value);

    this.eventManager.emit(GameEvents.SET_DEALING_CARDS, value);
    this.uiDealingCardsModals.elements.modal.classList.add("hidden");
    this.renderActiveDealingCardsBtns();
  }

  render() {
    this.elements.musicToggle.checked = this.stateManager.getMusicEnabled();
    this.elements.soundToggle.checked = this.stateManager.getSoundEnabled();
    this.elements.assistanceInCollection.checked =
      this.stateManager.getAssistanceInCollection();
    this.elements.assistanceInCardClick.checked =
      this.stateManager.getAssistanceInCardClick();
    this.elements.languageSelected.value = this.stateManager.getLanguage();
    this.elements.modesSelected.value =
      this.gameModesManager.getCurrentModeName();
    this.elements.musicVolume.value = this.stateManager.getMusicVolume() * 100;
    this.renderPropertyStyleVolume(this.elements.musicVolume);
    this.renderActiveDealingCardsBtns();
  }

  show() {
    super.show();
    this.render();
  }

  renderActiveDealingCardsBtns() {
    Object.values(this.elements.dealingCardsBtns).forEach((btn) => {
      if (btn.value === String(this.stateManager.getDealingCardsPlayer())) {
        btn.classList.add("active-dealing-cards-btn");
        btn.disabled = true;
      } else {
        btn.classList.remove("active-dealing-cards-btn");
        btn.disabled = false;
      }
    });
  }

  setEventsDealingCardsBtns() {
    Object.values(this.elements.dealingCardsBtns).forEach((btn) => {
      btn.onclick = (e) => this.onChangeDealingCards(e);
    });
  }

  renderPropertyStyleVolume(element) {
    element.style.setProperty("--fill-percent", `${element.value}%`);
  }
}
