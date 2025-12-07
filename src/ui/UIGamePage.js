import { UIPage } from "./UIPage.js";
import { GameEvents } from "../utils/Constants.js";
import { UIConfig, UIGameUnicodeIcons } from "../configs/UIConfig.js";
import { GameConfig, PlayerConfigs } from "../configs/GameConfig.js";
import { Animator } from "../utils/Animator.js";
import { Helpers } from "../utils/Helpers.js";
import { Joker } from "../core/Joker.js";

export class UIGamePage extends UIPage {
  constructor(eventManager, stateManager, gameModesManager, translator) {
    super(eventManager, stateManager, "game-interface");
    this.gameModesManager = gameModesManager;
    this.state = stateManager.state;
    this.translator = translator;
    this.countHintUsedForIncrement = PlayerConfigs.hint.countUsedForIncrement;
    this.countHintUsedForDecrement = PlayerConfigs.hint.countUsedForDecrement;
    this.elements = {
      messageEl: document.getElementById("message"),
      scoreEl: document.getElementById("points-in-game"),
      timeEl: document.getElementById("time-display"),
      movesEl: document.getElementById("moves_span"),
      notifDiv: document.getElementById("notif-div"),
      notifDivTop: document.getElementById("notif-div-top"),
      notifDivBottom: document.getElementById("notif-div-bottom"),
      notifToasts: document.getElementById("notification-toasts"),
      achievementsIconEl: document.getElementById("achievements_span"),
      controlBtnsContainer: document.getElementById("controls-btns-container"),
      modalsWindows: document.getElementById("modals-windows"),
      restartGameBtn: document.getElementById("new-game-ctr-btn"),
      restartGameModal: document.getElementById("restart-game-modal"),
      restartGameModalClose: document.getElementById(
        "restart-game-modal-close"
      ),
      restartGameModalAgainBtn: document.getElementById(
        "game-restart-modal-again-btn"
      ),
      restartGameModalCancelBtn: document.getElementById(
        "game-restart-modal-cancel-btn"
      ),
      hintBtn: document.getElementById("hint"),
      hintCounter: document.getElementById("hint-counter"),
      menuBtn: document.getElementById("menu-btn"),
      collectBtn: document.getElementById("collect-cards"),
      undoBtn: document.getElementById("undo-btn"),
      undoCounter: document.getElementById("undo-counter"),
      // shuffleBtn: document.getElementById("shuffle-btn"),

      // Модальное окно: результаты игры
      gameResultsModal: document.getElementById("game-results-modal"),
      gameResultsModalVictoryMainBadge: document.getElementById(
        "game_results_modalvictory_main_badge"
      ),
      gameResultsModalTitle: document.getElementById(
        "game_results_modal_title"
      ),
      gameResultsModalBody: document.getElementById(
        "game-results-modal-content"
      ),
      gameResultsModalClose: document.getElementById(
        "game-results-modal-close"
      ),
      gameResultsModalApply: document.getElementById(
        "game-results-modal-its-apply-btn"
      ),
      ///////////////////
    };

    this.isRestartGameModalShow = false;
    this.isGameResultsModalShow = false;
    this.isHintNotifShow = false;
    this.hintNotifyShowTimerId = null;
  }

  init() {
    super.init();
    this.updateUI();
  }

  setupEventListeners() {
    this.eventManager.on(GameEvents.UI_UPDATE_GAME_PAGE, () => {
      this.updateUI();
    });
    this.elements.restartGameBtn.onclick = () => this.onClickRestartGame();

    this.elements.restartGameModalAgainBtn.onclick = async () =>
      await this.onClickRestartGameModalAgain();

    this.elements.restartGameModalCancelBtn.onclick = () =>
      this.onClickRestartGameModalCancel();

    this.elements.restartGameModalClose.onclick = () =>
      this.onClickRestartGameModalClose();

    this.elements.hintBtn.onclick = () => {
      this.onClickHintBtn();
    };

    this.elements.menuBtn.onclick = () => {
      console.log(
        "this.stateManager.getIsRunning(): ",
        this.stateManager.getIsRunning()
      );

      if (!this.stateManager.getIsRunning()) return;
      if (!this.stateManager.getIsPaused()) {
        this.stateManager.setIsPaused(true);
        this.eventManager.emit(GameEvents.PAUSE_PLAY_TIME);
      }
      this.eventManager.emit(GameEvents.UIMENUPAGE_SHOW);
    };

    this.elements.collectBtn.onclick = () => {
      this.elements.collectBtn.classList.add("hidden");
      this.eventManager.emit(GameEvents.CARDS_COLLECT);
    };

    this.eventManager.on(GameEvents.SCORE_UPDATE, (score) =>
      this.updateScore(score)
    );
    this.eventManager.on(GameEvents.HINT_BTN_CLICK_AND_NO_HINTS, () => {
      this.createJokerElementForNoHints();
    });
    this.eventManager.on(GameEvents.COLLECT_BTN_SHOW, () => {
      this.elements.collectBtn.classList.remove("hidden");
    });

    this.eventManager.on(GameEvents.COLLECT_BTN_HIDDEN, () => {
      this.elements.collectBtn.classList.add("hidden");
    });

    this.eventManager.on(GameEvents.TIME_UPDATE, (time) => {
      this.updateTime(time);
    });

    this.eventManager.on(GameEvents.UP_MOVES, () => {
      this.updateMoves(this.stateManager.state.stateForAchievements.moves);
    });

    this.eventManager.on(GameEvents.UP_UNDO_CONTAINER, (n) =>
      this.upUndoCounter(n)
    );

    this.eventManager.on(GameEvents.SHOW_ACH_DIV, (a) =>
      Animator.animateAchievementText(this.elements.notifDiv, a)
    );

    this.elements.undoBtn.onclick = async () => {
      if (this.stateManager.getIsUndoCardAnimation()) return;
      if (this.stateManager.getIsRunning()) return;
      await this.eventManager.emitAsync(GameEvents.UNDO_MOVE);
      this.upUndoCounter(this.stateManager.getLastMovesLengths());
    };

    this.eventManager.on(GameEvents.UP_ACHIEVENT_ICON, () =>
      this.upAchievementIcon(this.stateManager.getAchievements().active.icon)
    );

    this.eventManager.on(GameEvents.UP_ACHIEVENT_DIV, (a) =>
      Animator.animationTextAchievement(this.elements.notifDiv, a)
    );

    this.eventManager.on(GameEvents.UP_ACHIEVENT_SCORE_DIV, () => {
      const span = document.getElementById("points-in-game");
      Animator.animateAchievementText2(span);
    });

    this.eventManager.on(GameEvents.HINT_NOTIF, (dataI18n) =>
      this.hintNotif(dataI18n)
    );
    this.eventManager.on(GameEvents.HINT_USED, () => this.hintUsed());
    this.eventManager.on(GameEvents.CREAT_ELEMENT_FOR_HIGHEST_SCORE, () =>
      this.creatElementForHighestScore()
    );

    this.eventManager.on(
      GameEvents.CREAT_ELEMENT_FOR_NOTIF_SHUFFLED_CARDS,
      () => this.creatNotifShuffly()
    );

    this.eventManager.on(
      GameEvents.CREAT_ELEMENT_FOR_NOTIF_HINT_CARDS,
      (numberFirst, numberEnd) => {
        this.creatNotifHint(numberFirst, numberEnd);
      }
    );

    this.eventManager.on(
      GameEvents.CREAT_ELEMENT_FOR_NOTIF_HINT_STOCK,
      (text) => {
        this.creatNotifHintStock(text);
      }
    );

    this.eventManager.on(GameEvents.CLEAR_NOTIF_HINT_CARDS, () => {
      this.elements.notifToasts.innerHTML = "";
    });

    this.eventManager.on(GameEvents.UP_HINT_CONTAINER, (n) => {
      this.upHintCounter(n);
    });

    this.elements.modalsWindows.onclick = (e) => {
      if (e.target === this.elements.modalsWindows) {
        console.log("клик по modalsWindows");
        const { modal, handlerClose } = this.stateManager.getActiveModal();
        if (modal && handlerClose) {
          handlerClose();
          this.stateManager.resetActiveModal();
        }
      }
      return;
    };
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

    this.elements.gameResultsModalClose.onclick = () =>
      this.onClickGameResultsModalClose();

    this.elements.gameResultsModalApply.onclick = async () => {
      await this.onClickGameResultsModalApply();
    };
    //////////////////////////////////////////////////

    this.eventManager.on(GameEvents.SET_DEALING_CARDS, (value) => {
      if (value === GameConfig.rules.defaultDealingCardsThree) {
        this.createShufflyBtnElement();
      } else if (value === GameConfig.rules.defaultDealingCards) {
        document.getElementById("shuffle-btn")?.remove();
      }
    });
  }

  onClickRestartGame() {
    if (this.isRestartGameModalShow) return;
    this.modalShow(this.elements.restartGameModal);
    this.stateManager.setActiveModal(this.elements.restartGameModal, () =>
      this.onClickRestartGameModalClose()
    );
    this.isRestartGameModalShow = true;
    // setTimeout(() => this.eventManager.emit(GameEvents.UI_ANIMATE_DEAL_CARDS), 1000);
  }

  async onClickRestartGameModalAgain() {
    this.modalHide(this.elements.restartGameModal);
    this.isRestartGameModalShow = false;
    this.eventManager.emit(GameEvents.STOP_PLAY_TIME);
    this.eventManager.emit(GameEvents.RESET_STATE_FOR_NEW_GAME);
    this.eventManager.emit(GameEvents.RESET_MODES_STATE_FOR_NEW_GAME);
    await this.eventManager.emitAsync(GameEvents.GAME_RESTART);
    this.stateManager.setIsRunning(true);
    this.stateManager.setIsPaused(false);
    this.updateUI();
  }

  onClickRestartGameModalCancel() {
    this.modalHide(this.elements.restartGameModal);
    this.isRestartGameModalShow = false;
  }

  onClickRestartGameModalClose() {
    this.modalHide(this.elements.restartGameModal);
    this.isRestartGameModalShow = false;
  }

  onClickHintBtn() {
    if (!this.stateManager.getIsRunning()) return;
    this.eventManager.emit(GameEvents.HINT_BTN_CLICK);
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
    this.elements.gameResultsModalTitle.textContent = title;
    const badgeText = this.translator.t("game_results_modalvictory_main_badge");
    this.elements.gameResultsModalVictoryMainBadge.textContent = badgeText;
    this.elements.gameResultsModalApply.textContent = this.translator.t(
      "btn_game_results_modal_apply"
    );
    this.elements.gameResultsModalBody.innerHTML = modalBody;
    this.modalShow(this.elements.gameResultsModal);
    this.stateManager.setActiveModal(this.elements.gameResultsModal, () =>
      this.onClickGameResultsModalClose()
    );
  }

  onClickGameResultsModalClose() {
    this.modalHide(this.elements.gameResultsModal);
    this.handleBack();
  }

  async onClickGameResultsModalApply() {
    this.modalHide(this.elements.gameResultsModal);
    this.isGameResultsModalShow = false;
    this.eventManager.emit(GameEvents.RESET_STATE_FOR_NEW_GAME);
    await this.eventManager.emitAsync(GameEvents.GAME_RESTART);
    this.stateManager.setIsRunning(true);
    this.stateManager.setIsPaused(false);
    this.updateUI();
  }

  //////////////////////////

  async onclickShuffleBtn() {
    if (!this.stateManager.getIsRunning()) return;
    const { stock, waste } = this.stateManager.getCardsComponents();
    await this.eventManager.emitAsync(
      GameEvents.SHUFFLE_CARDS_TO_STOCK,
      stock,
      waste
    );
  }

  updateUI() {
    this.updateScore(this.stateManager.getScore());
    // this.updateTime(this.stateManager.getTime());
    this.updateTime(this.gameModesManager.getPlayTime());
    this.updateMoves(this.stateManager.getMoves());
    this.upUndoCounter(this.stateManager.getLastMovesLengths());
    if (this.stateManager.getNeedVideoForHints()) {
      this.upHintCounter(UIGameUnicodeIcons.VIDEO);
    } else {
      this.upHintCounter(this.stateManager.getHintCounterState() || 0);
    }
    this.upAchievementIcon(this.stateManager.getAchievements().active.icon);

    console.log(
      "this.stateManager.getDealingCards(): ",
      this.stateManager.getDealingCards()
    );

    if (
      this.stateManager.getDealingCards() ===
      GameConfig.rules.defaultDealingCards
    ) {
      document.getElementById("shuffle-btn")?.remove();
    } else if (
      this.stateManager.getDealingCards() ===
      GameConfig.rules.defaultDealingCardsThree
    ) {
      document.getElementById("shuffle-btn")?.remove();
      this.createShufflyBtnElement();
    }
  }

  resetTime(minutes, seconds) {
    this.elements.timeEl.textContent = `${minutes}${minutes}:${seconds}${seconds}`;
  }

  updateScore(score) {
    this.elements.scoreEl.innerHTML = `🌟 <span class='score-card-dealing-span'>
    x${this.stateManager.getDealingCards()}</span><span class='score-span'>: ${score}</span>`;
  }

  updateMoves(n) {
    this.elements.movesEl.innerHTML = `👣<span class="moves-score-span">: ${n}</span>`;
  }

  upUndoCounter(n) {
    // this.elements.undoCounter.textContent = n;
    if (this.gameModesManager.getCurrentModeMaxUndos() === Infinity) {
      this.setInfinityUndoCounter();
    } else {
      this.elements.undoCounter.innerHTML = n;
    }
  }

  setInfinityUndoCounter() {
    this.elements.undoCounter.innerHTML = "&#8734;";
  }

  upHintCounter(n) {
    this.elements.hintCounter.textContent = n;
  }

  upAchievementIcon(icon) {
    this.elements.achievementsIconEl.innerHTML = `🏆<span class="achievements-icon-span">: ${icon}</span>`;
  }

  creatElementForHighestScore() {
    const dataI18n = UIConfig.dataI18nValue.STATUS_BAR_RECORD_WORD;
    const div = document.createElement("div");
    const spanRecordWord = document.createElement("span");
    const spanScore = document.createElement("span");
    div.className = "div-highest-score";
    spanRecordWord.className = "span-highest-score-record-word";
    spanScore.className = "span-highest-score";
    const recordWord = this.translator.t(dataI18n);
    spanRecordWord.textContent = `${recordWord} 🌟`;
    spanScore.textContent = `: ${this.stateManager.state.player.highestScore}`;
    div.append(spanRecordWord);
    div.append(spanScore);
    this.elements.notifDivTop.innerHTML = "";
    this.elements.notifDivTop.append(div);
  }

  creatNotifShuffly() {
    const dataI18n = UIConfig.dataI18nValue.NOTIF_SHUFFLED_CARDS_TO_STOCK;
    const div = document.createElement("div");
    const span = document.createElement("span");
    div.className = "div-notif-shuffled-cards";
    span.className = "span-notif-shuffled-cards";
    const shuffledCardsWord = this.translator.t(dataI18n);
    span.textContent = `${shuffledCardsWord}`;
    div.append(span);
    this.elements.notifDivTop.innerHTML = "";
    this.elements.notifDivTop.append(div);
  }

  creatNotifHint(numberFirst, numberEnd) {
    const dataI18nFirst = UIConfig.dataI18nValue.HINT_CARDS_NOTIF_FIRST;
    const dataI18nEnd = UIConfig.dataI18nValue.HINT_CARDS_NOTIF_END;
    const div = document.createElement("div");
    const span = document.createElement("span");
    div.className = "div-notif-hint-cards";
    span.className = "span-notif-hint-cards";
    const hintCardsWordFirst = this.translator.t(dataI18nFirst);
    const hintCardsWordEnd = this.translator.t(dataI18nEnd);
    span.textContent = `${hintCardsWordFirst} ${numberFirst} ${hintCardsWordEnd} ${numberEnd}`;
    div.append(span);
    this.elements.notifToasts.innerHTML = "";
    this.elements.notifToasts.append(div);
  }

  creatNotifHintStock(text) {
    const div = document.createElement("div");
    const span = document.createElement("span");
    div.className = "div-notif-hint-stock";
    span.className = "span-notif-hint-stock";
    span.textContent = text;
    div.append(span);
    this.elements.notifToasts.innerHTML = "";
    this.elements.notifToasts.append(div);
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

  createShufflyBtnElement() {
    const btn = document.createElement("button");
    btn.id = "shuffle-btn";
    btn.className = "controls-btn";
    btn.title = "Перетосовка";
    btn.textContent = "🎬";
    btn.onclick = async () => {
      await this.onclickShuffleBtn();
    };
    this.elements.controlBtnsContainer.append(btn);
  }

  hintUsed() {
    if (!this.stateManager.getNeedVideoForHints()) {
      // временное if, для теста, потом убрать
      this.stateManager.decrementHintCounterState(
        this.countHintUsedForDecrement
      );
      this.upHintCounter(this.stateManager.getHintCounterState());
    }
    this.stateManager.incrementHintUsed(this.countHintUsedForIncrement);
    this.eventManager.emit(
      GameEvents.UP_HITUSED_STATE,
      this.countHintUsedForIncrement
    );
  }

  hintNotif(dataI18n) {
    console.log("hintNotif");

    if (this.hintNotifyShowTimerId) clearTimeout(this.hintNotifyShowTimerId);
    this.elements.notifDivBottom.innerHTML = "";
    const p = document.createElement("p");
    p.className = "hint-notif-p";
    p.setAttribute("data-i18n", dataI18n);
    this.elements.notifDivBottom.append(p);
    this.translator.updateLanOneUI(p);
    this.hintNotifyShowTimerId = setTimeout(() => {
      this.elements.notifDivBottom.innerHTML = "";
      this.hintNotifyShowTimerId = null;
    }, 3000);
  }

  updateTime(time) {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);

    const formattedMinutes = minutes.toString().padStart(2, "0");
    const formattedSeconds = seconds.toString().padStart(2, "0");
    if (hours > 0) {
      const formattedHours = hours.toString().padStart(2, "0");
      this.elements.timeEl.textContent = `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
    } else {
      this.elements.timeEl.textContent = `${formattedMinutes}:${formattedSeconds}`;
    }
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
    spanClose.textContent = "x";
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

    this.modalShow(modalBody);
    this.stateManager.setActiveModal(modalBody, () =>
      this.onClickJokerElementForNoHintsModalClose(modalBody)
    );
  }

  onClickJokerElementForNoHintsModalResultButton(modal) {
    this.modalHide(modal);
  }

  onClickJokerElementForNoHintsModalClose(modal) {
    this.modalHide(modal);
  }

  async onClickJokerElementForNoHintsModalJoker(modalBody) {
    this.stateManager.setJokerUsed(true);
    const jokerCard = new Joker();

    // добавляем joker карту в stock
    const { tableaus, stock } = this.stateManager.getCardsComponents();
    stock.addCard(jokerCard);

    // перемещение joker карты в tableaus

    // рендер joker карты в stock, как карту с faceDown
    this.modalHide(modalBody);
    this.renderCardToStock(jokerCard);
    await this.eventManager.emitAsync(GameEvents.ANIMATE_JOKER_FLIP, jokerCard);
    jokerCard.flip(true);
    await this.eventManager.emitAsync(
      GameEvents.JOKER_HANDLE,
      jokerCard,
      tableaus
    );
    this.jokerMoveToTableaus(jokerCard, tableaus);
  }

  createJokerDomElement(id, className) {
    const jokerElement = document.createElement("div");
    jokerElement.id = id;
    jokerElement.className = className;
    return jokerElement;
  }

  jokerMoveToTableaus(jokerCard, tableaus) {}

  renderCardToStock(card) {
    const stock = this.stateManager.getCardsComponents().stock;
    this.eventManager.emit(GameEvents.RENDER_STOCK_CARD, card, stock.element);
  }

  modalShow(modal) {
    this.elements.modalsWindows.innerHTML = "";
    this.elements.modalsWindows.append(modal);
    this.elements.modalsWindows.classList.remove("hidden");
    modal.classList.remove("hidden");
  }

  modalHide(modal) {
    modal.classList.add("hidden");
    this.elements.modalsWindows.classList.add("hidden");
    this.elements.modalsWindows.innerHTML = "";
  }

  showMessage(message, type = "info") {
    this.elements.messageEl.textContent = message;
    this.elements.messageEl.className = `game-message ${type}`;

    setTimeout(() => {
      this.elements.messageEl.className = "game-message";
    }, 2000);
  }

  show() {
    this.page.className = "";
    const styleClass =
      this.stateManager.getSelectedItems().backgrounds.styleClass;
    this.page.classList.add("game-interface", styleClass);
    this.updateUI();
    this.creatElementForHighestScore();
  }
}
