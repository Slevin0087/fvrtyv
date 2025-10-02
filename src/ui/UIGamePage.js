import { UIPage } from "./UIPage.js";
import { GameEvents } from "../utils/Constants.js";
import { GameConfig } from "../configs/GameConfig.js";
import { Animator } from "../utils/Animator.js";
import { Helpers } from "../utils/Helpers.js";

export class UIGamePage extends UIPage {
  constructor(eventManager, stateManager) {
    super(eventManager, stateManager, "game-interface");
    this.state = stateManager.state;
    this.elements = {
      messageEl: document.getElementById("message"),
      scoreEl: document.getElementById("points-in-game"),
      timeEl: document.getElementById("time-display"),
      movesEl: document.getElementById("moves_span"),
      notifDiv: document.getElementById("notif-div"),
      achievementsIconEl: document.getElementById("achievements_span"),
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
    };

    this.isRestartGameModalShow = false
    this.isHintNotifShow = false;
    this.hintNotifyShowTimerId = null;
  }

  init() {
    super.init();
    this.updateUI();
  }

  setupEventListeners() {
    this.elements.restartGameBtn.addEventListener("click", () => {
      if (this.isRestartGameModalShow) return
      this.elements.restartGameModal.classList.remove("hidden");
      this.isRestartGameModalShow = true
      // setTimeout(() => this.eventManager.emit(GameEvents.UI_ANIMATE_DEAL_CARDS), 1000);
    });

    this.elements.restartGameModalAgainBtn.addEventListener("click", () => {
      this.elements.restartGameModal.classList.add("hidden");
      this.isRestartGameModalShow = false
      this.eventManager.emit(GameEvents.GAME_RESTART);
      this.updateUI();
    });

    this.elements.restartGameModalCancelBtn.addEventListener("click", () => {
      this.elements.restartGameModal.classList.add("hidden");
      this.isRestartGameModalShow = false
    });

    this.elements.restartGameModalClose.addEventListener("click", () => {
      this.elements.restartGameModal.classList.add("hidden");
      this.isRestartGameModalShow = false
    });

    this.elements.hintBtn.addEventListener("click", () => {
      this.eventManager.emit(GameEvents.HINT_BTN_CLICK);
    });

    this.elements.menuBtn.addEventListener("click", () => {
      this.eventManager.emit(GameEvents.UIMENUPAGE_SHOW);
    });

    this.elements.collectBtn.addEventListener("click", () => {
      this.elements.collectBtn.classList.add("hidden");
      this.eventManager.emit(GameEvents.CARDS_COLLECT);
    });

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

    this.elements.undoBtn.addEventListener("click", () => {
      this.eventManager.emit(GameEvents.UNDO_MOVE);
      this.upUndoCounter(this.state.game.lastMove.length);
    });

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

    this.eventManager.on(GameEvents.HINT_NOTIF, (dataI18n) => this.hintNotif(dataI18n));
    this.eventManager.on(GameEvents.HINT_USED, () => this.hintUsed());
  }

  updateUI() {
    this.updateScore(this.state.game.score);
    this.updateTime(this.state.game.playTime);
    this.updateMoves(this.state.game.moves);
    this.upUndoCounter(this.state.game.lastMove.length);
    this.upHintCounter(this.state.hintCounterState || 0);
    this.upAchievementIcon(this.state.player.achievements.active.icon);
  }

  resetTime(minutes, seconds) {
    this.elements.timeEl.textContent = `${minutes}${minutes}:${seconds}${seconds}`;
  }

  updateScore(score) {
    this.elements.scoreEl.textContent = `🌟: ${score}`;
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

  hintUsed() {
    this.state.hintCounterState -= 1;
    this.upHintCounter(this.state.hintCounterState);
    this.eventManager.emit(GameEvents.UP_HITUSED_STATE, 1);
  }

  hintNotif(dataI18n) {
    if (this.hintNotifyShowTimerId) clearTimeout(this.hintNotifyShowTimerId);
    this.elements.notifDiv.innerHTML = "";
    const p = document.createElement("p");
    p.className = "hint-notif-p";
    p.setAttribute('data-i18n', dataI18n);
    this.elements.notifDiv.append(p);
    Helpers.updateLanOneUI(p)
    this.elements.notifDiv.classList.remove("hidden");
    this.hintNotifyShowTimerId = setTimeout(() => {
      this.elements.notifDiv.classList.add("hidden");
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
  }
}
