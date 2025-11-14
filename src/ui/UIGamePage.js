import { UIPage } from "./UIPage.js";
import { GameEvents } from "../utils/Constants.js";
import { UIConfig, UIGameUnicodeIcons } from "../configs/UIConfig.js";
import { GameConfig } from "../configs/GameConfig.js";
import { Animator } from "../utils/Animator.js";
import CardsAndContainersScaler from "../utils/CardsAndContainersScaler.js";

export class UIGamePage extends UIPage {
  constructor(eventManager, stateManager, translator) {
    super(eventManager, stateManager, "game-interface");
    this.state = stateManager.state;
    this.translator = translator;
    // this.cardsAndContainersScaler = new CardsAndContainersScaler()
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
    // this.cardsAndContainersScaler
    this.updateUI();
    // this.elements.gameResultsModalBody.innerHTML = this.createGameResultsModalBody()
  }

  setupEventListeners() {
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
      this.eventManager.emit(GameEvents.UIMENUPAGE_SHOW);
    };

    this.elements.collectBtn.onclick = () => {
      this.elements.collectBtn.classList.add("hidden");
      this.eventManager.emit(GameEvents.CARDS_COLLECT);
    };

    this.eventManager.on(GameEvents.SCORE_UPDATE, (score) =>
      this.updateScore(score)
    );

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
      this.updateMoves(this.state.game.moves);
    });

    this.eventManager.on("game:message", (message, type) => {
      this.showMessage(message, type);
    });

    this.eventManager.on(GameEvents.UP_UNDO_CONTAINER, (n) =>
      this.upUndoCounter(n)
    );

    this.eventManager.on(GameEvents.SHOW_ACH_DIV, (a) =>
      Animator.animateAchievementText(this.elements.notifDiv, a)
    );

    this.elements.undoBtn.onclick = async () => {
      if (this.state.isUndoCardAnimation) return;
      await this.eventManager.emitAsync(GameEvents.UNDO_MOVE);
      this.upUndoCounter(this.stateManager.getLastMovesLengths());
    };

    this.eventManager.on(GameEvents.UP_ACHIEVENT_ICON, (boolean) =>
      this.upAchievementIcon(
        this.state.player.achievements.active.icon,
        boolean
      )
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

    // this.elements.shuffleBtn.onclick = () => {
    //   const { stock, waste } = this.state.cardsComponents;
    //   this.eventManager.emitAsync(
    //     GameEvents.SHUFFLE_CARDS_TO_STOCK,
    //     stock,
    //     waste
    //   );
    // };

    this.eventManager.on(GameEvents.CLEAR_NOTIF_HINT_CARDS, () => {
      this.elements.notifToasts.innerHTML = "";
    });

    this.eventManager.on(GameEvents.UP_HINT_CONTAINER, (n) => {
      this.upHintCounter(n);
    });

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

    this.elements.gameResultsModalApply.onclick = async () =>
      await this.onClickGameResultsModalApply();
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
    this.elements.restartGameModal.classList.remove("hidden");
    this.isRestartGameModalShow = true;
    // setTimeout(() => this.eventManager.emit(GameEvents.UI_ANIMATE_DEAL_CARDS), 1000);
  }

  async onClickRestartGameModalAgain() {
    this.elements.restartGameModal.classList.add("hidden");
    this.isRestartGameModalShow = false;
    this.stateManager.setIsRunning(false);
    await this.eventManager.emitAsync(GameEvents.GAME_RESTART);
    this.updateUI();
  }

  onClickRestartGameModalCancel() {
    this.elements.restartGameModal.classList.add("hidden");
    this.isRestartGameModalShow = false;
  }

  onClickRestartGameModalClose() {
    this.elements.restartGameModal.classList.add("hidden");
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
    this.elements.gameResultsModalBody.innerHTML = modalBody;
    this.elements.gameResultsModal.classList.remove("hidden");

    // Добавляем конфетти
    this.createVictoryConfetti();

    // // Анимация появления элементов
    // this.animateResults();
  }

  onClickGameResultsModalClose() {
    this.elements.gameResultsModal.classList.add("hidden");
    this.handleBack()
  }

  async onClickGameResultsModalApply() {
    this.elements.gameResultsModal.classList.add("hidden");
    this.isGameResultsModalShow = false;
    this.stateManager.setIsRunning(false);
    await this.eventManager.emitAsync(GameEvents.GAME_RESTART);
    this.updateUI();
  }

  //////////////////////////

  async onclickShuffleBtn() {
    const { stock, waste } = this.state.cardsComponents;
    await this.eventManager.emitAsync(
      GameEvents.SHUFFLE_CARDS_TO_STOCK,
      stock,
      waste
    );
  }

  updateUI() {
    this.updateScore(this.state.game.score);
    this.updateTime(this.state.game.playTime);
    this.updateMoves(this.state.game.moves);
    this.upUndoCounter(this.stateManager.getLastMovesLengths());
    if (this.stateManager.getNeedVideoForHints()) {
      this.upHintCounter(UIGameUnicodeIcons.VIDEO);
    } else {
      this.upHintCounter(this.state.hintCounterState || 0);
    }
    this.upAchievementIcon(this.state.player.achievements.active.icon);

    if (
      this.stateManager.state.player.dealingCards ===
      GameConfig.rules.defaultDealingCards
    ) {
      console.log(
        "this.stateManager.state.player.dealingCards: ",
        this.stateManager.state.player.dealingCards
      );
      document.getElementById("shuffle-btn")?.remove();
    } else if (
      this.stateManager.state.player.dealingCards ===
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
    this.elements.scoreEl.innerHTML = `🌟 <span class='score-span'>
    x${this.state.dealingCards}</span>: ${score}`;
  }

  updateMoves(n) {
    this.elements.movesEl.textContent = `👣: ${n}`;
  }

  upUndoCounter(n) {
    this.elements.undoCounter.textContent = n;
  }

  upHintCounter(n) {
    this.elements.hintCounter.textContent = n;
  }

  upAchievementIcon(icon, animate = false) {
    this.elements.achievementsIconEl.textContent = `🏆: ${icon}`;
    // if (animate) {
    //   const span = document.getElementById("achievements_span");
    //   this.eventManager.emit(GameEvents.AUDIO_UP_ACH);
    //   Animator.animateAchievementText(span);
    // }
  }

  creatElementForHighestScore() {
    const dataI18n = UIConfig.dataI18nValue.STATUS_BAR_RECORD_WORD;
    const div = document.createElement("div");
    const span = document.createElement("span");
    div.className = "div-highest-score";
    span.className = "span-highest-score";
    const recordWord = this.translator.t(dataI18n);
    span.textContent = `${recordWord} 🌟: ${this.state.player.highestScore}`;
    div.append(span);
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
    return `<dl class="game-results-modal-table table">
      <div class="game-results-modal-wrap-line">
        <dt
          class="game-results-modal-left-td"
          data-i18n="game_results_modal_score"
        >
          ${score}
        </dt>
        <dd class="game-results-modal-right-td">x</dd>
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

  getModalData(data) {
    console.log("в getModalData(data): ", data);

    return data;
  }

  hintUsed() {
    if (!this.stateManager.getNeedVideoForHints()) {
      // временное if, для теста, потом убрать
      this.state.hintCounterState -= 1;
      this.upHintCounter(this.state.hintCounterState);
    }
    this.eventManager.emit(GameEvents.UP_HITUSED_STATE, 1);
  }

  hintNotif(dataI18n) {
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
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const formattedMinutes = minutes.toString().padStart(2, "0");
    const formattedSeconds = seconds.toString().padStart(2, "0");
    this.elements.timeEl.textContent = `${formattedMinutes}:${formattedSeconds}`;
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
    const styleClass = this.state.player.selectedItems.backgrounds.styleClass;
    this.page.classList.add("game-interface", styleClass);
    this.updateUI();
    this.creatElementForHighestScore();
  }

  /////////////////////////////////////
  // Анимация появления результатов
  animateResults() {
    const lines = document.querySelectorAll(".game-results-modal-wrap-line");

    lines.forEach((line, index) => {
      line.style.opacity = "0";
      line.style.transform = "translateX(-50px)";

      setTimeout(() => {
        line.style.transition = "all 0.5s ease";
        line.style.opacity = "1";
        line.style.transform = "translateX(0)";
      }, 300 + index * 200);
    });
  }

  // Конфетти для победы
  createVictoryConfetti() {
    const confettiContainer = document.createElement("div");
    confettiContainer.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 10000;
  `;
    document.body.appendChild(confettiContainer);

    const colors = [
      "#ff0000",
      "#00ff00",
      "#0000ff",
      "#ffff00",
      "#ff00ff",
      "#00ffff",
      "#ff6b00",
    ];
    const symbols = ["🃏", "⭐", "🎉", "🔥", "💎", "👑", "💰"];

    for (let i = 0; i < 1000; i++) {
      setTimeout(() => {
        const confetti = document.createElement("div");
        confetti.style.cssText = `
        position: absolute;
        font-size: ${15 + Math.random() * 10}px;
        top: -30px;
        left: ${Math.random() * 100}%;
        opacity: ${0.7 + Math.random() * 0.3};
        animation: confetti-fall ${3 + Math.random() * 2}s ease-in forwards;
      `;

        if (Math.random() > 0.3) {
          confetti.textContent =
            symbols[Math.floor(Math.random() * symbols.length)];
        } else {
          confetti.style.width = "10px";
          confetti.style.height = "10px";
          confetti.style.background =
            colors[Math.floor(Math.random() * colors.length)];
          confetti.style.borderRadius = Math.random() > 0.5 ? "50%" : "0";
        }

        confettiContainer.appendChild(confetti);
        setTimeout(() => confetti.remove(), 5000);
      }, i * 30);
    }

    // CSS для анимации конфетти
    const style = document.createElement("style");
    style.textContent = `
    @keyframes confetti-fall {
      0% {
        transform: translateY(0) rotate(0deg) scale(1);
        opacity: 1;
      }
      100% {
        transform: translateY(100vh) rotate(360deg) scale(0.5);
        opacity: 0;
      }
    }
  `;
    document.head.appendChild(style);

    setTimeout(() => confettiContainer.remove(), 5000);
  }
  ////////////////////////////////////////
}
