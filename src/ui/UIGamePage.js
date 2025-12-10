import { UIPage } from "./UIPage.js";
import { GameEvents } from "../utils/Constants.js";
import {
  UIConfig,
  UIGameSymbols,
  UIGameUnicodeIcons,
} from "../configs/UIConfig.js";
import { GameConfig, PlayerConfigs } from "../configs/GameConfig.js";
import { Animator } from "../utils/Animator.js";
import { UIGamePageModals } from "./UIModals/UIGamePageModals.js";

export class UIGamePage extends UIPage {
  constructor(eventManager, stateManager, gameModesManager, translator) {
    super(eventManager, stateManager, "game-interface");
    this.gameModesManager = gameModesManager;
    this.state = stateManager.state;
    this.translator = translator;
    this.uiGamePageModals = new UIGamePageModals(
      this.eventManager,
      this.stateManager,
      this.translator
    );
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
      restartGameBtn: document.getElementById("new-game-ctr-btn"),
      hintBtn: document.getElementById("hint"),
      hintCounter: document.getElementById("hint-counter"),
      menuBtn: document.getElementById("menu-btn"),
      collectBtn: document.getElementById("collect-cards"),
      undoBtn: document.getElementById("undo-btn"),
      undoCounter: document.getElementById("undo-counter"),
    };

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
    this.elements.restartGameBtn.onclick = () => {
      this.onClickRestartGame();
    };

    this.elements.hintBtn.onclick = () => {
      this.onClickHintBtn();
    };

    this.elements.menuBtn.onclick = () => {
      if (!this.stateManager.getIsRunning()) return;
      if (!this.stateManager.getIsPaused()) {
        this.stateManager.setIsPaused(true);
        this.eventManager.emit(GameEvents.PAUSE_PLAY_TIME);
      }
      this.eventManager.emit(GameEvents.UIMENUPAGE_SHOW);
    };

    this.eventManager.on(GameEvents.SCORE_UPDATE, (score) =>
      this.updateScore(score)
    );
    this.eventManager.on(GameEvents.COLLECT_BTN_SHOW, () => {
      this.elements.collectBtn.classList.remove("hidden");
      this.setCollectBtnEvent();
    });

    this.eventManager.on(GameEvents.COLLECT_BTN_HIDDEN, () => {
      this.elements.collectBtn.classList.add("hidden");
      this.resetCollectBtnEvent();
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

    this.eventManager.on(GameEvents.SET_DEALING_CARDS, (value) => {
      if (value === GameConfig.rules.defaultDealingCardsThree) {
        this.createShufflyBtnElement();
      } else if (value === GameConfig.rules.defaultDealingCards) {
        document.getElementById("shuffle-btn")?.remove();
      }
    });
  }

  onClickRestartGame() {
    const isRestartGameModalShow =
      this.uiGamePageModals.getIsRestartGameModalShow();
    if (isRestartGameModalShow) return;
    const restartModal = this.uiGamePageModals.restartModal.modal;
    const handleModalClose = () => {
      this.uiGamePageModals.onClickRestartGameModalClose();
    };
    this.eventManager.emit(GameEvents.MODAL_SHOW, restartModal);
    this.stateManager.setActiveModal(restartModal, handleModalClose);
    this.uiGamePageModals.setIsRestartGameModalShow(true);
    this.uiGamePageModals.setRestartModalEvents()
  }

  onClickHintBtn() {
    if (!this.stateManager.getIsRunning()) return;
    this.eventManager.emit(GameEvents.HINT_BTN_CLICK);
  }

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
    this.updateTime(this.gameModesManager.getPlayTime());
    this.updateMoves(this.stateManager.getMoves());
    this.upUndoCounter(this.stateManager.getLastMovesLengths());
    this.upHintCounter(this.gameModesManager.getCurrentModeMaxHints() || 0);

    this.upAchievementIcon(this.stateManager.getAchievements().active.icon);

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
    if (this.gameModesManager.getCurrentModeMaxUndos() === Infinity) {
      this.setInfinityUndoCounter();
    } else {
      this.elements.undoCounter.innerHTML = n;
    }
  }

  setInfinityUndoCounter() {
    this.elements.undoCounter.innerHTML = UIGameSymbols.MODALS_X;
  }

  setInfinityHintCounter() {
    this.elements.hintCounter.innerHTML = UIGameSymbols.MODALS_X;
  }

  upHintCounter(n) {
    const maxHints = this.gameModesManager.getCurrentModeMaxHints();
    if (maxHints === Infinity) {
      this.setInfinityHintCounter();
    } else if (maxHints < Infinity && maxHints > 0) {
      this.elements.hintCounter.innerHTML = n;
    } else {
      this.elements.hintCounter.innerHTML = UIGameUnicodeIcons.VIDEO;
    }
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

  renderCardToStock(card) {
    const stock = this.stateManager.getCardsComponents().stock;
    this.eventManager.emit(GameEvents.RENDER_STOCK_CARD, card, stock.element);
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

  setCollectBtnEvent() {
    this.elements.collectBtn.onclick = () => {
      this.elements.collectBtn.classList.add("hidden");
      this.eventManager.emit(GameEvents.CARDS_COLLECT);
    };
  }

  resetCollectBtnEvent() {
    this.elements.collectBtn.onclick = "";
  }
}
