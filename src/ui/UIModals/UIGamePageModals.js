import { UIGameUnicodeIcons } from "../../configs/UIConfig.js";
import { GameEvents } from "../../utils/Constants.js";

export class UIGamePageModals {
  constructor(eventManager, stateManager, translator) {
    this.eventManager = eventManager;
    this.stateManager = stateManager;
    this.translator = translator;
    // Модальное окно: рестарт игры
    this.restartModal = {
      modal: document.getElementById("restart-game-modal"),
      modalClose: document.getElementById("restart-game-modal-close"),
      modalAgainBtn: document.getElementById("game-restart-modal-again-btn"),
      modalCancelBtn: document.getElementById("game-restart-modal-cancel-btn"),
    };
    // Модальное окно: результаты игры
    this.gameResultModal = {
      modal: document.getElementById("game-results-modal"),
      modalVictoryMainBadge: document.getElementById(
        "game_results_modalvictory_main_badge"
      ),
      modalTitle: document.getElementById("game_results_modal_title"),
      modalBody: document.getElementById("game-results-modal-content"),
      modalClose: document.getElementById("game-results-modal-close"),
      modalApply: document.getElementById("game-results-modal-its-apply-btn"),
      ///////////////////
    };

    this.isRestartGameModalShow = false;
    this.isGameResultsModalShow = false;

    this.setupEventListeners();
  }

  setupEventListeners() {
    ///////////////////////// События модального окна: результаты игры
    this.eventManager.on(
      GameEvents.GAME_RESULTS_MODAL_SHOW,
      (
        textWinBonusScoreLeftPathForResultModal,
        textWinBonusScoreRightPathForResultModal,
        textEarnedWinLeftPathForResultModal,
        textEarnedWinRightPathForResultModal
      ) => {
        this.gameResultsModalShow(
          textWinBonusScoreLeftPathForResultModal,
          textWinBonusScoreRightPathForResultModal,
          textEarnedWinLeftPathForResultModal,
          textEarnedWinRightPathForResultModal
        );
      }
    );
  }

  async onClickRestartGameModalAgain() {
    this.eventManager.emit(GameEvents.MODAL_HIDE);
    this.isRestartGameModalShow = false;
    this.eventManager.emit(GameEvents.STOP_PLAY_TIME);
    this.eventManager.emit(GameEvents.RESET_STATE_FOR_NEW_GAME);
    this.eventManager.emit(GameEvents.RESET_MODES_STATE_FOR_NEW_GAME);
    await this.eventManager.emitAsync(GameEvents.GAME_RESTART);
    this.stateManager.setIsRunning(true);
    this.stateManager.setIsPaused(false);
    this.eventManager.emit(GameEvents.UI_UPDATE_GAME_PAGE);
  }

  onClickRestartGameModalClose() {
    this.eventManager.emit(GameEvents.MODAL_HIDE);
    this.isRestartGameModalShow = false;
  }

  // Инициализация событий модального окна: результаты игры
  gameResultsModalShow(
    textWinBonusScoreLeftPathForResultModal,
    textWinBonusScoreRightPathForResultModal,
    textEarnedWinLeftPathForResultModal,
    textEarnedWinRightPathForResultModal
  ) {
    const modalBody = this.createGameResultsModalBody(
      textWinBonusScoreLeftPathForResultModal,
      textWinBonusScoreRightPathForResultModal,
      textEarnedWinLeftPathForResultModal,
      textEarnedWinRightPathForResultModal
    );
    const title = this.translator.t("game_results_modal_title");
    this.gameResultModal.modalTitle.textContent = title;
    const badgeText = this.translator.t("game_results_modalvictory_main_badge");
    this.gameResultModal.modalVictoryMainBadge.textContent = badgeText;
    this.gameResultModal.modalApply.textContent = this.translator.t(
      "btn_game_results_modal_apply"
    );
    this.gameResultModal.modalBody.innerHTML = modalBody;
    const handleModalClose = () => {
      this.onClickGameResultsModalClose();
    };
    this.stateManager.setActiveModal(this.gameResultModal.modal, handleModalClose);
    this.setGameResultModalEvents()
  }

  onClickGameResultsModalClose() {
    this.eventManager.emit(GameEvents.MODAL_HIDE);
    this.handleBack();
  }

  async onClickGameResultsModalApply() {
    this.eventManager.emit(GameEvents.MODAL_HIDE);
    this.isGameResultsModalShow = false;
    this.eventManager.emit(GameEvents.RESET_STATE_FOR_NEW_GAME);
    await this.eventManager.emitAsync(GameEvents.GAME_RESTART);
    this.stateManager.setIsRunning(true);
    this.stateManager.setIsPaused(false);
    this.eventManager.emit(GameEvents.UI_UPDATE_GAME_PAGE);
  }
  //////////////////////////

  setIsRestartGameModalShow(boolean) {
    this.isRestartGameModalShow = boolean;
  }

  getIsRestartGameModalShow() {
    return this.isRestartGameModalShow;
  }

  createGameResultsModalBody(
    textWinBonusScoreLeftPathForResultModal,
    textWinBonusScoreRightPathForResultModal,
    textEarnedWinLeftPathForResultModal,
    textEarnedWinRightPathForResultModal
  ) {
    const score = this.translator.t("game_results_modal_score");
    const scoreValue = this.stateManager.getScore();
    return `<dl class="game-results-modal-table table">
      <div class="game-results-modal-wrap-line">
        <dt
          class="game-results-modal-left-td"
          data-i18n="game_results_modal_score"
        >
          ${score}
        </dt>
        <dd class="game-results-modal-right-td">+${scoreValue}</dd>
      </div>
      <div class="game-results-modal-wrap-line">
        <dt
          class="game-results-modal-left-td"
        >
          ${textWinBonusScoreLeftPathForResultModal}
        </dt>
        <dd class="game-results-modal-right-td">${textWinBonusScoreRightPathForResultModal}</dd>
      </div>
      <div class="game-results-modal-wrap-line">
        <dt
          class="game-results-modal-left-td"
        >
          ${textEarnedWinLeftPathForResultModal}
        </dt>
        <dd class="game-results-modal-right-td">${textEarnedWinRightPathForResultModal}</dd>
      </div>
    </dl>`;
  }

  createGameResultsModalBody(
    textWinBonusScoreLeftPathForResultModal,
    textWinBonusScoreRightPathForResultModal,
    textEarnedWinLeftPathForResultModal,
    textEarnedWinRightPathForResultModal
  ) {
    const score = this.translator.t("game_results_modal_score");
    const scoreValue = this.stateManager.getScore();
    return `<dl class="game-results-modal-table table">
      <div class="game-results-modal-wrap-line">
        <dt
          class="game-results-modal-left-td"
          data-i18n="game_results_modal_score"
        >
          ${score}
        </dt>
        <dd class="game-results-modal-right-td">+${scoreValue}</dd>
      </div>
      <div class="game-results-modal-wrap-line">
        <dt
          class="game-results-modal-left-td"
        >
          ${textWinBonusScoreLeftPathForResultModal}
        </dt>
        <dd class="game-results-modal-right-td">${textWinBonusScoreRightPathForResultModal}</dd>
      </div>
      <div class="game-results-modal-wrap-line">
        <dt
          class="game-results-modal-left-td"
        >
          ${textEarnedWinLeftPathForResultModal}
        </dt>
        <dd class="game-results-modal-right-td">${textEarnedWinRightPathForResultModal}</dd>
      </div>
    </dl>`;
  }

  createJokerElementForNoHints() {
    const modalBody = document.createElement("div");
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

    spanClose.onclick = () =>
      this.onClickJokerElementForNoHintsModalClose(modalBody);

    jokerElement.onclick = async () =>
      await this.onClickJokerElementForNoHintsModalJoker(modalBody);

    resultButton.onclick = () =>
      this.onClickJokerElementForNoHintsModalResultButton(modalBody);

    // устанавливаем backgroundImage для jokerElement
    const faceStyles = this.stateManager.getSelectedItems().faces;
    console.log("faceStyles: ", faceStyles);

    this.eventManager.emit(
      GameEvents.SET_BG_FOR_JOKER_ELEMENT,
      jokerElement,
      faceStyles
    );
    // this.setBgForJokerElement(jokerElement);

    this.eventManager.emit(GameEvents.MODAL_HIDE);
    this.stateManager.setActiveModal(modalBody, () =>
      this.onClickJokerElementForNoHintsModalClose(modalBody)
    );
  }

  setRestartModalEvents() {
    this.restartModal.modalAgainBtn.onclick = async () => {
      await this.onClickRestartGameModalAgain();
    };

    this.restartModal.modalCancelBtn.onclick = () => {
      this.onClickRestartGameModalClose();
    };

    this.restartModal.modalClose.onclick = () => {
      this.onClickRestartGameModalClose();
    };
  }

  setGameResultModalEvents() {
    this.gameResultModal.modalClose.onclick = () => {
      this.onClickGameResultsModalClose();
    };

    this.gameResultModal.modalApply.onclick = async () => {
      await this.onClickGameResultsModalApply();
    };
  }
}
