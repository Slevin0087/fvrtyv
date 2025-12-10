import { GameEvents } from "../../utils/Constants.js";
import { UIGameUnicodeIcons } from "../../configs/UIConfig.js";

export class UIModalsWindow {
  constructor(eventManager, stateManager, gameModesManager, translator) {
    this.eventManager = eventManager;
    this.stateManager = stateManager;
    this.gameModesManager = gameModesManager;
    this.translator = translator;

    this.elements = {
      modalsWindows: document.getElementById("modals-windows"),
    };

    this.allModals = {
      gameResultsModal: document.getElementById("game-results-modal"),
      restartGameModal: document.getElementById("restart-game-modal"),
      dealingCardsModal: document.getElementById("dealing-cards-modal"),
      vegasModeModal: document.getElementById("vegas-mode-modal"),
    };

    this.jokerElementForNoHints = null;

    this.init();
    this.setupEventListeners();
  }

  init() {
    this.hideAllModals();
  }

  setupEventListeners() {
    this.eventManager.on(GameEvents.MODAL_SHOW, (modal) => {
      this.modalShow(modal);
    });
    this.eventManager.on(GameEvents.MODAL_HIDE, () => {
      this.modalHide();
    });

    this.eventManager.on(GameEvents.HINT_BTN_CLICK_AND_NO_HINTS, () => {
      this.createJokerElementForNoHints();
    });
  }

  modalShow(modal) {
    this.hideAllModals();
    modal.classList.remove("hidden");
    this.elements.modalsWindows.classList.remove("hidden");
    this.setModalWindowEvent();
  }

  modalHide() {
    this.hideAllModals();
    this.elements.modalsWindows.classList.add("hidden");
    this.resetModalWindowEvent();
  }

  createJokerElementForNoHints() {
    if (this.jokerElementForNoHints) this.jokerElementForNoHints.remove();
    const modalBody = document.createElement("div");
    this.jokerElementForNoHints = modalBody;
    const header = document.createElement("div");
    const headerClose = document.createElement("div");
    const spanClose = document.createElement("span");
    const title = document.createElement("div");
    const spanTitle = document.createElement("span");
    const modalContent = document.createElement("div");
    const message = document.createElement("div");
    const messageP = document.createElement("p");

    // Создаем элемент карты JOKER
    const jokerElement = document.createElement("div");
    const jokerSpanVideo = document.createElement("span");
    const btnsContainer = document.createElement("div");
    const resultButton = document.createElement("button");
    modalBody.id = "game-over-and-no-hints";
    spanClose.id = "game-over-and-no-hints-modal-close";
    jokerSpanVideo.id = "joker-card-for-no-hints-span-video-id";
    resultButton.id = "game-over-and-no-hints-modal-result-btn";
    modalBody.className = "game-over-and-no-hints";
    header.className = "game-over-and-no-hints-modal-header";
    headerClose.className = "game-over-and-no-hints-modal-close";
    spanClose.className = "game-over-and-no-hints-modal-close-span";
    title.className = "game-over-and-no-hints-modal-title";

    spanTitle.className = "game-over-and-no-hints-modal-title-span";
    modalContent.className = "game-over-and-no-hints-modal-content";
    message.className = "game-over-and-no-hints-modal-message";
    messageP.className = "game-over-and-no-hints-modal-message-p";
    jokerElement.className = "joker-card-for-no-hints";
    jokerSpanVideo.className = "joker-card-for-no-hints-span-video";
    btnsContainer.className = "game-over-and-no-hints-modal-btns";
    resultButton.className = "game-over-and-no-hints-modal-result-btn";
    spanClose.innerHTML = "&times;";
    jokerSpanVideo.textContent = UIGameUnicodeIcons.VIDEO;
    resultButton.setAttribute(
      "data-i18n",
      "game_over_and_no_hints_modal_result_btn"
    );
    spanTitle.setAttribute(
      "data-i18n",
      "game_over_and_no_hints_modal_title_span"
    );
    messageP.setAttribute(
      "data-i18n",
      "game_over_and_no_hints_modal_message_p"
    );

    this.translator.updateLanOneUI(resultButton);
    this.translator.updateLanOneUI(messageP);
    this.translator.updateLanOneUI(spanTitle);
    this.elements.modalsWindows.append(modalBody);
    modalBody.append(header);
    modalBody.append(modalContent);
    header.append(headerClose);
    header.append(title);
    headerClose.append(spanClose);
    title.append(spanTitle);
    modalContent.append(message);
    message.append(messageP);
    modalContent.append(jokerElement);
    modalContent.append(btnsContainer);
    jokerElement.append(jokerSpanVideo);
    btnsContainer.append(resultButton);

    spanClose.onclick = () => this.onClickJokerElementForNoHintsModalClose();

    jokerElement.onclick = async () =>
      await this.onClickJokerElementForNoHintsModalJoker();

    resultButton.onclick = () =>
      this.onClickJokerElementForNoHintsModalResultButton();

    // устанавливаем backgroundImage для jokerElement
    const faceStyles = this.stateManager.getSelectedItems().faces;
    this.eventManager.emit(
      GameEvents.SET_BG_FOR_JOKER_ELEMENT,
      jokerElement,
      faceStyles
    );
    this.modalShow(modalBody);
    this.stateManager.setActiveModal(modalBody, () =>
      this.onClickJokerElementForNoHintsModalClose()
    );
  }

  onClickJokerElementForNoHintsModalResultButton() {
    this.modalHide();
  }

  onClickJokerElementForNoHintsModalClose() {
    if (this.jokerElementForNoHints) this.jokerElementForNoHints.remove();
    this.modalHide();
  }

  async onClickJokerElementForNoHintsModalJoker() {
    this.stateManager.setJokerUsed(true);
    const jokerCard = new Joker();

    // добавляем joker карту в stock
    const { tableaus, stock } = this.stateManager.getCardsComponents();
    stock.addCard(jokerCard);

    // перемещение joker карты в tableaus
    if (this.jokerElementForNoHints) this.jokerElementForNoHints.remove();
    // рендер joker карты в stock, как карту с faceDown
    this.modalHide();
    this.renderCardToStock(jokerCard);
    await this.eventManager.emitAsync(GameEvents.ANIMATE_JOKER_FLIP, jokerCard);
    jokerCard.flip(true);
    await this.eventManager.emitAsync(
      GameEvents.JOKER_HANDLE,
      jokerCard,
      tableaus
    );
  }

  createJokerDomElement(id, className) {
    const jokerElement = document.createElement("div");
    jokerElement.id = id;
    jokerElement.className = className;
    return jokerElement;
  }

  hideAllModals() {
    Object.values(this.allModals).forEach((modal) => {
      modal.classList.add("hidden");
    });
  }

  setModalWindowEvent() {
    this.elements.modalsWindows.onclick = (e) => {
      if (e.target === this.elements.modalsWindows) {
        console.log("клик по modalsWindows");
        const { modal, handlerClose } = this.stateManager.getActiveModal();
        if (modal && handlerClose) {
          console.log("handlerClose: ", handlerClose);
          handlerClose();
          this.stateManager.resetActiveModal();
        }
      }
      return;
    };
  }

  resetModalWindowEvent() {
    this.elements.modalsWindows.onclick = "";
  }
}
