import { GameEvents } from "../utils/Constants.js";
import { EventManager } from "./EventManager.js";
import { StateManager } from "./StateManager.js";
import { UIManager } from "./UIManager.js";
import { AudioManager } from "./AudioManager.js";
import { Storage } from "../utils/Storage.js";
import { CardsSystem } from "../systems/CardsSystem.js";
import { GameLogicSystem } from "../systems/logic/GameLogicSystem.js";
import { RenderingSystem } from "../systems/render/RenderingSystem.js";
import { AnimationSystem } from "../systems/AnimationSystem.js";
import { ShopSystem } from "../systems/ShopSystem.js";
import { Animator } from "../utils/Animator.js";

export class GameManager {
  constructor() {
    this.timeInterval = null;
    this.startTime = 0;
    this.lastTime = 0;
    this.fullScreenBtn = document.getElementById("full-screen-btn");
  }

  startApp() {
    // 1. Инициализация менеджеров
    this.eventManager = new EventManager();
    this.stogare = new Storage(this.eventManager);
    this.stateManager = new StateManager(this.eventManager, this.stogare);
    this.uiManager = new UIManager(this.eventManager, this.stateManager);
    this.audioManager = new AudioManager(this.eventManager, this.stateManager);
    this.cardsSystem = new CardsSystem(this.eventManager, this.stateManager);
    this.animationSystem = new AnimationSystem(
      this.eventManager,
      this.stateManager,
      this.cardsSystem
    );
    // this.animator = new Animator();
    this.gameLogicSystem = new GameLogicSystem(
      this.eventManager,
      this.stateManager,
      this.cardsSystem,
      Animator,
      this.audioManager
    );
    this.renderingSystem = new RenderingSystem(
      this.eventManager,
      this.stateManager,
      this.gameLogicSystem,
      this.cardsSystem
    );
    this.shopSystem = new ShopSystem(this.eventManager, this.stateManager);
    this.setupEventListeners();
    // this.gameLoop(0);
  }

  setupEventListeners() {
    this.fullScreenBtn.addEventListener("click", (e) =>
      this.eventManager.emit(GameEvents.FULL_SCREEN_BTN, e)
    );
    this.eventManager.on(GameEvents.SET_NEW_GAME, async () => {
      await this.setGame();
    });
    this.eventManager.on(
      GameEvents.GAME_RESTART,
      async () => await this.gameRestart()
    );
    this.eventManager.on(GameEvents.START_PLAY_TIME, () =>
      this.startTimeInterval()
    );
    this.eventManager.on(GameEvents.STOP_PLAY_TIME, () => this.stopTimeInterval());
  }

  startTimeInterval() {
    if (this.timeInterval) return; // Уже запущен

    this.startTime = Date.now();
    this.timeInterval = setInterval(() => {
      const elapsed = (Date.now() - this.startTime) / 1000;
      this.stateManager.state.game.playTime = elapsed;
      this.eventManager.emit(GameEvents.TIME_UPDATE, elapsed);
    }, 100); // Обновление каждые 100мс (10 FPS)
  }

  stopTimeInterval() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
      this.timeInterval = null;
    }
  }

  // gameLoop(timestamp) {
  //   if (!this.stateManager.state.firstCardClick) return;

  //   // Первый кадр: игнорируем deltaTime, начинаем с 0
  //   if (this.lastTime === 0) {
  //     this.lastTime = timestamp;
  //     requestAnimationFrame((t) => this.gameLoop(t));
  //     return;
  //   }

  //   const deltaTime = timestamp - this.lastTime;
  //   this.lastTime = timestamp;

  //   if (this.update) {
  //     this.update(deltaTime / 1000);
  //   }

  //   requestAnimationFrame((t) => {
  //     this.gameLoop(t);
  //   });
  // }

  async gameRestart() {
    this.stopTimeInterval();
    await this.setGame();
  }

  async setGame() {
    this.cardsSystem.setCardsContainers();
    this.gameLogicSystem.setCards(
      this.cardsSystem.deck,
      this.cardsSystem.stock
    );

    this.renderingSystem.renderStaticElements(
      this.cardsSystem.foundations,
      this.cardsSystem.tableaus
    );

    this.renderingSystem.renderStockElement(
      this.cardsSystem.stock,
      this.cardsSystem.waste
    );
    await this.gameLogicSystem.dealTableauCards(
      this.cardsSystem.stock,
      this.cardsSystem.tableaus
    );
    this.stateManager.state.game.isRunning = true;
  }

  update(deltaTime) {
    console.log("///////////////////////////////////////////////////////");

    if (
      this.stateManager.state.game.isRunning &&
      this.stateManager.state.firstCardClick
    ) {
      this.stateManager.state.game.playTime += deltaTime;
      this.eventManager.emit(
        GameEvents.TIME_UPDATE,
        this.stateManager.state.game.playTime
      );
    }
  }
}
