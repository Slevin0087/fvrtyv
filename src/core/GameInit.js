import { GameEvents } from "../utils/Constants.js";
import { EventManager } from "../managers/EventManager.js";
import { StateManager } from "../managers/StateManager.js";
import { AutoMoveManager } from "../managers/AutoMoveManager.js";
import { ShopNavigation } from "../utils/ShopNavigation.js";
import { UIManager } from "../managers/UIManager.js";
import { AudioManager } from "../managers/AudioManager.js";
import { Storage } from "../utils/Storage.js";
import { CardsSystem } from "../systems/uiSystems/CardsSystem.js";
import { GameSetupSystem } from "../systems/logicSystems/GameSetupSystem.js";
import { RenderStaticElements } from "../systems/renderSystems/RenderStaticElements.js";
import { RenderStockElement } from "../systems/renderSystems/RenderStockElement.js";
import { LogicSystemsInit } from "../systems/logicSystems/LogicSystemsInit.js";
import { RenderingSystemsInit } from "../systems/renderSystems/RenderingSystemsInit.js";
import { AnimationSystem } from "../systems/uiSystems/AnimationSystem.js";
import { ShopSystem } from "../systems/uiSystems/ShopSystem.js";
import { Translator } from "../utils/Translator.js";
import { AchievementSystem } from "../systems/uiSystems/AchievementSystem.js";

export class GameInit {
  constructor() {
    this.timeInterval = null;
    this.startTime = 0;
    this.lastTime = 0;
    this.fullScreenBtn = document.getElementById("full-screen-btn");
  }

  init() {
    // 1. Инициализация менеджеров
    this.eventManager = new EventManager();
    this.storage = new Storage(this.eventManager);
    this.stateManager = new StateManager(this.eventManager, this.storage);
    this.translator = new Translator()
    this.autoMoveManager = new AutoMoveManager(this.eventManager, this.stateManager)
    this.translator.changeLanguage(this.stateManager.state.settings.language);
    this.achievementSystem = new AchievementSystem(
      this.eventManager,
      this.stateManager,
      this.storage,
      this.translator,
    );
    this.shopNavigation = new ShopNavigation();
    this.uiManager = new UIManager(
      this.eventManager,
      this.stateManager,
      this.translator,
      this.shopNavigation,
    );
    this.audioManager = new AudioManager(this.eventManager, this.stateManager);
    this.cardsSystem = new CardsSystem(this.eventManager, this.stateManager);
    this.animationSystem = new AnimationSystem(
      this.eventManager,
      this.stateManager,
      this.cardsSystem
    );
    this.gameSetupSystem = new GameSetupSystem(
      this.eventManager,
      this.stateManager
    );
    this.logicSystemsInit = new LogicSystemsInit(
      this.eventManager,
      this.stateManager,
      this.cardsSystem,
      this.audioManager,
      this.translator,
    );
    this.renderStaticElements = new RenderStaticElements(this.eventManager);
    this.renderStockElement = new RenderStockElement(
      this.eventManager,
      this.stateManager,
      this.logicSystemsInit
    );
    this.renderingSystem = new RenderingSystemsInit(
      this.eventManager,
      this.stateManager,
      this.cardsSystem
    );
    this.shopSystem = new ShopSystem(
      this.eventManager,
      this.storage,
      this.stateManager
    );
    this.eventManager.emit(GameEvents.SET_NAME_IN_INPUT);
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.fullScreenBtn.onclick = (e) =>
      this.eventManager.emit(GameEvents.FULL_SCREEN_BTN, e);
    this.eventManager.onAsync(GameEvents.SET_NEW_GAME, async () => {
      await this.setGame();
    });
    this.eventManager.onAsync(
      GameEvents.GAME_RESTART,
      async () => await this.gameRestart()
    );
    // this.eventManager.on(GameEvents.START_PLAY_TIME, () =>
    //   this.startTimeInterval()
    // );
    this.eventManager.on(GameEvents.STOP_PLAY_TIME, () =>
      this.stopTimeInterval()
    );
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
    this.eventManager.emit(GameEvents.COLLECT_BTN_HIDDEN);
    await this.setGame();
  }

  async setGame() {
    this.cardsSystem.setCardsContainers();
    this.gameSetupSystem.setCards(
      this.cardsSystem.deck,
      this.cardsSystem.stock
    );

    this.renderStaticElements.render(
      this.cardsSystem.foundations,
      this.cardsSystem.tableaus
    );

    this.renderStockElement.render(
      this.cardsSystem.stock,
      this.cardsSystem.waste
    );
    await this.gameSetupSystem.dealTableauCards(
      this.cardsSystem.stock,
      this.cardsSystem.tableaus
    );
    this.stateManager.setIsRunning(true);
  }

  update(deltaTime) {
    console.log("///////////////////////////////////////////////////////");

    if (
      this.stateManager.state.game.isRunning &&
      this.stateManager.state.game.playerFirstCardClick
    ) {
      this.stateManager.state.game.playTime += deltaTime;
      this.eventManager.emit(
        GameEvents.TIME_UPDATE,
        this.stateManager.state.game.playTime
      );
    }
  }
}
