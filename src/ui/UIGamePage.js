import { UIPage } from "./UIPage.js";
import { GameEvents } from "../utils/Constants.js";
import { GameConfig } from "../configs/GameConfig.js";
import { Animator } from "../utils/Animator.js";

export class UIGamePage extends UIPage {
  constructor(eventManager, stateManager) {
    super(eventManager, stateManager, "game-interface");
    this.state = stateManager.state;
    this.elements = {
      messageEl: document.getElementById("message"),
      scoreEl: document.getElementById("points-in-game"),
      timeEl: document.getElementById("time-display"),
      movesEl: document.getElementById("moves_span"),
      achDiv: document.getElementById("ach-div"),
      achievementsIconEl: document.getElementById("achievements_span"),
      restartGameBtn: document.getElementById("new-game-ctr-btn"),
      hintBtn: document.getElementById("hint"),
      menuBtn: document.getElementById("menu-btn"),
      collectBtn: document.getElementById("collect-cards"),
      undoBtn: document.getElementById("undo-btn"),
      undoCounter: document.getElementById("undo-counter"),
      hintCounter: document.getElementById("hint-counter"),
    };
  }

  init() {
    super.init();
    this.updateUI();
  }

  setupEventListeners() {
    this.elements.restartGameBtn.addEventListener("click", () => {
      this.eventManager.emit(GameEvents.GAME_RESTART);
      this.updateUI();

      // setTimeout(() => this.eventManager.emit(GameEvents.UI_ANIMATE_DEAL_CARDS), 1000);
    });

    this.elements.hintBtn.addEventListener("click", () => {
      this.eventManager.emit("hint:request");
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
      Animator.animateAchievementText(this.elements.achDiv, a)
    );

    this.elements.undoBtn.addEventListener("click", () => {
      this.eventManager.emit(GameEvents.UNDO_MOVE);
      this.upUndoCounter(this.state.game.lastMove.length);
    });

    this.eventManager.on(GameEvents.UP_ACHIEVENT_ICON, (boolen) =>
      this.upAchievementIcon(this.state.player.achievements.active.icon, boolen)
    );

    this.eventManager.on(GameEvents.UP_ACHIEVENT_DIV, (a) =>
      Animator.animationTextAchievement(this.elements.achDiv, a)
    );
  }
  updateUI() {
    this.updateScore(this.state.game.score);
    this.updateTime(this.state.game.playTime);
    this.updateMoves(this.state.game.moves);
    this.upUndoCounter(this.state.game.lastMove.length);
    this.upHintCounter(this.state.game.hintsUsed);
    this.upAchievementIcon(this.state.player.achievements.active.icon);
  }

  resetTime(minutes, seconds) {
    this.elements.timeEl.textContent = `${minutes}${minutes}:${seconds}${seconds}`;
  }

  updateScore(score) {
    console.log("score:", score);

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
    if (animate) {
      this.eventManager.emit(GameEvents.AUDIO_UP_ACH);
      Animator.animateAchievementText(
        this.elements.achievementsIconEl.textContent
      );
    }
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
    const styleClass =
      this.stateManager.state.player.selectedItems.backgrounds.styleClass;
    this.page.classList.add("game-interface", styleClass);
    this.updateUI();
  }
}
