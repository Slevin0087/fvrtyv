import { GameConfig } from "../../configs/GameConfig.js";

export class UISettingsModals {
  constructor(eventManager, stateManager, translator) {
    this.eventManager = eventManager;
    this.stateManager = stateManager;
    this.translator = translator
    this.elements = {
      modal: document.getElementById("dealing-cards-modal"),
      modalTitle: document.getElementById("dealing_cards_modal_title"),
      modalBody: document.getElementById("dealing-cards-modal-content"),
      modalClose: document.getElementById("dealing-cards-modal-close"),
      modalDontShowAgain: document.getElementById(
        "dealing-cards-modal-dont-show-again-btn"
      ),
      modalItsClear: document.getElementById(
        "dealing-cards-modal-its-clear-btn"
      ),
    };

    this.setupEventListeners();
  }

  setupEventListeners() {}

  createBody(value) {
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
}
