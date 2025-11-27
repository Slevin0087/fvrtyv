import { UIPage } from "./UIPage.js";
import { GameEvents } from "../utils/Constants.js";
import { GameConfig } from "../configs/GameConfig.js";

export class UISettingsPage extends UIPage {
  constructor(eventManager, stateManager, translator) {
    super(eventManager, stateManager, "settings");
    this.translator = translator;
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
      // difficultySelect: document.getElementById("difficulty"),
      musicVolume: document.getElementById("music-volume"),
      languageSelected: document.getElementById("language-selected"),
      dealingCardsBtns: {
        dealingCardsOne: document.getElementById("dealing_cards-one"),
        dealingCardsThree: document.getElementById("dealing_cards-three"),
      },
      dealingCardsModal: document.getElementById("dealing-cards-modal"),
      dealingCardsModalTitle: document.getElementById(
        "dealing_cards_modal_title"
      ),
      dealingCardsModalBody: document.getElementById(
        "dealing-cards-modal-content"
      ),
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

    this.elements.musicVolume.oninput = (e) => {
      this.onInputMusicVolume(e);
    };

    this.setEventsDealingCardsBtns();
    // this.elements.dealingCardsOne.onchange = (e) =>
    //   this.onChangeDealingCards(e);

    // this.elements.dealingCardsThree.onchange = (e) =>
    //   this.onChangeDealingCards(e);
  }

  onChangeLanguage(e) {
    this.translator.changeLanguage(e.target.value);
    this.eventManager.emit(GameEvents.SET_LANGUAGE_CHANGE, e.target.value);
  }

  onChangeDealingCards(e) {
    if (e.target.value === String(this.stateManager.getDealingCards())) {
      return;
    }
    if (!this.stateManager.getIsDontShowAgainDealingCardsModal()) {
      if (e.target) {
        console.log("Больше не показывать модуль dealingCardsModal IF");
        const value = Number(e.target.value);
        const modalBody = this.createDealingCardsModalBody(value);
        const titlePathFirst = this.translator.t("dealing_cards_modal_title");
        this.elements.dealingCardsModalTitle.textContent = `${titlePathFirst} ${value}`;
        this.elements.dealingCardsModalBody.innerHTML = modalBody;
        this.elements.dealingCardsModal.classList.remove("hidden");

        this.elements.dealingCardsModalDontShowAgain.onclick = () =>
          this.onClickDealingCardsModalDontShowAgain(true);
        this.elements.dealingCardsModalClose.onclick = () =>
          this.onClickDealingCardsModalClose();
        this.elements.dealingCardsModalItsClear.onclick = () =>
          this.onClickDealingCardsModalItsClear(value);
      }
      return;
    } else if (this.stateManager.getIsDontShowAgainDealingCardsModal()) {
      console.log("Больше не показывать модуль dealingCardsModal ELSE");

      if (e.target) {
        const value = Number(e.target.value);
        this.eventManager.emit(GameEvents.SET_DEALING_CARDS, value);
        this.setActiveDealingCardsBtns();
      }
      return;
    }
  }

  onInputMusicVolume(e) {
    const volume = Math.max(0, Math.min(1, e.target.value / 100));
    this.eventManager.emit(GameEvents.SET_MUSIC_VOLUME, parseFloat(volume));
    this.eventManager.emit(GameEvents.SETTINGS_MUSIC_VOLUME);
    this.setPropertyStyleVolume(e.target);
  }

  onClickDealingCardsModalDontShowAgain(boolean) {
    this.stateManager.setIsDontShowAgainDealingCardsModal(boolean);
    this.elements.dealingCardsModal.classList.add("hidden");
  }

  onClickDealingCardsModalClose() {
    this.elements.dealingCardsModal.classList.add("hidden");
  }

  onClickDealingCardsModalItsClear(value) {
    console.log("value: ", value);

    this.eventManager.emit(GameEvents.SET_DEALING_CARDS, value);
    this.elements.dealingCardsModal.classList.add("hidden");
    this.setActiveDealingCardsBtns();
  }

  // createDealingCardsModalBody() {

  //   return `<div id="dealing-cards-modal" class="dealing-cards-modal hidden">
  //     <div class="dealing-cards-modal-header">
  //       <div class="dealing-cards-modal-close">
  //         <span
  //           class="dealing-cards-modal-close-span"
  //           id="dealing-cards-modal-close"
  //           >&times;</span
  //         >
  //       </div>
  //       <div class="dealing-cards-modal-title">
  //         <span data-i18n="dealing_cards_modal_title"
  //           >Раздача карт по:</span
  //         >
  //       </div>
  //     </div>
  //     <div class="dealing-cards-modal-content">
  //       <dl class="dealing-cards-modal-table table">
  //         <div class="dealing-cards-modal-wrap-line">
  //           <!-- <span class="dealing-cards-modal-body-span"></span> -->
  //           <dt
  //             class="dealing-cards-modal-left-td"
  //             data-i18n="dealing_cards_modal_score"
  //           >
  //             Очки:
  //           </dt>
  //           <dd class="dealing-cards-modal-right-td">x</dd>
  //         </div>
  //       </dl>
  //     </div>
  //     <div class="dealing-cards-modal-btns">
  //       <button
  //         class="dealing-cards-modal-dont-show-again-btn"
  //         id="dealing-cards-modal-dont-show-again-btn"
  //         data-i18n="btn_dealing_cards_modal_dont_show_again"
  //       >
  //         Больше не показывать
  //       </button>
  //       <button
  //         class="dealing-cards-modal-its_clear-btn"
  //         id="dealing-cards-modal-its-clear-btn"
  //         data-i18n="btn_dealing_cards_modal_its_clear"
  //       >
  //         Понятно
  //       </button>
  //     </div>
  //   </div>`;
  // }

  createDealingCardsModalBody(value) {
    const score = this.translator.t("dealing_cards_modal_score");
    return `<dl class="dealing-cards-modal-table table">
      <div class="dealing-cards-modal-wrap-line">
        <dt
          class="dealing-cards-modal-left-td"
          data-i18n="dealing_cards_modal_score"
        >
          ${score}
        </dt>
        <dd class="dealing-cards-modal-right-td">x${value}</dd>
      </div>
      ${this.createShufflingCardsElement(value)}
    </dl>`;
  }

  createShufflingCardsElement(value) {
    const shufflingCards = this.translator.t(
      "dealing_cards_modal_shuffling_cards"
    );
    const forViewing = this.translator.t("dealing_cards_modal_right_td");
    return value === GameConfig.rules.defaultDealingCardsThree
      ? `
        <div class="dealing-cards-modal-wrap-line">
          <dt 
            class="dealing-cards-modal-left-td"
            data-i18n="dealing_cards_modal_shuffling_cards"
          >
            ${shufflingCards}
          </dt>
          <dd
            class="dealing-cards-modal-right-td"
            data-i18n="dealing_cards_modal_right_td"
            >
            ${forViewing}
          </dd>
        </div>`
      : "";
  }

  render() {
    this.elements.musicToggle.checked = this.stateManager.getMusicEnabled();
    this.elements.soundToggle.checked = this.stateManager.getSoundEnabled();
    this.elements.assistanceInCollection.checked =
      this.stateManager.getAssistanceInCollection();
    this.elements.assistanceInCardClick.checked =
      this.stateManager.getAssistanceInCardClick();
    this.elements.languageSelected.value = this.stateManager.getLanguage();
    this.elements.musicVolume.value = this.stateManager.getMusicVolume() * 100;
    this.setPropertyStyleVolume(this.elements.musicVolume);
    this.setActiveDealingCardsBtns();
  }

  show() {
    super.show();
    this.render();
  }

  setActiveDealingCardsBtns() {
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

  setPropertyStyleVolume(element) {
    element.style.setProperty("--fill-percent", `${element.value}%`);
  }
}
