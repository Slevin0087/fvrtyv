import { GameEvents } from "../utils/Constants.js";
import { EventManager } from "../managers/EventManager.js";
import { StateManager } from "../managers/StateManager.js";
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
import { GameModesManager } from "../managers/GameModesManager.js";

export class GameInit {
  constructor() {
    this.timeInterval = null;
    this.startTime = 0;
    this.pauseAndStopTime = 0;
    this.lastTime = 0;
    this.fullScreenBtn = document.getElementById("full-screen-btn");
  }

  init() {
    // 1. Инициализация компонентов
    this.initComponents();

    // 2. Установка начального имени игрока в input
    this.eventManager.emit(GameEvents.SET_NAME_IN_INPUT);

    // 3. Инициализация слушателей событий
    this.setupEventListeners();
  }

  initComponents() {
    this.eventManager = new EventManager();
    this.storage = new Storage(this.eventManager);
    this.stateManager = new StateManager(this.eventManager, this.storage);
    this.gameModesManager = new GameModesManager(this.eventManager, this.storage)
    this.translator = new Translator();
    this.audioManager = new AudioManager(this.eventManager, this.stateManager);
    this.translator.changeLanguage(this.stateManager.getLanguage());
    this.achievementSystem = new AchievementSystem(
      this.eventManager,
      this.stateManager,
      this.storage,
      this.gameModesManager,
      this.translator
    );
    this.shopNavigation = new ShopNavigation();
    this.uiManager = new UIManager(
      this.eventManager,
      this.stateManager,
      this.gameModesManager,
      this.translator,
      this.shopNavigation
    );
    this.cardsSystem = new CardsSystem(this.eventManager, this.stateManager);
    this.animationSystem = new AnimationSystem(
      this.eventManager,
      this.stateManager,
      this.cardsSystem,
      this.audioManager
    );
    this.gameSetupSystem = new GameSetupSystem(
      this.eventManager,
      this.stateManager,
      this.audioManager
    );
    this.logicSystemsInit = new LogicSystemsInit(
      this.eventManager,
      this.stateManager,
      this.cardsSystem,
      this.audioManager,
      this.translator
    );
    this.renderStaticElements = new RenderStaticElements(this.eventManager);
    this.renderStockElement = new RenderStockElement(
      this.eventManager,
      this.stateManager,
      this.logicSystemsInit,
      this.gameModesManager,
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
  }

  setupEventListeners() {
    this.fullScreenBtn.onclick = (e) => {
      this.eventManager.emit(GameEvents.FULL_SCREEN_BTN, e);
    };
    this.eventManager.onAsync(GameEvents.SET_NEW_GAME, async () => {
      await this.setGame();
    });
    this.eventManager.onAsync(GameEvents.GAME_RESTART, async () => {
      await this.gameRestart();
    });
    this.eventManager.on(GameEvents.START_PLAY_TIME, (time) => {
      this.startTimeInterval(time);
    });
    this.eventManager.on(GameEvents.STOP_PLAY_TIME, () => {
      this.stopTimeInterval();
    });
    this.eventManager.on(GameEvents.PAUSE_PLAY_TIME, () => {
      this.pauseTimeInterval();
    });
    this.eventManager.on(GameEvents.CONTINUE_PLAY_TIME, () => {
      this.continueTimeInterval();
    });
  }

  pauseTimeInterval() {
    this.stopTimeInterval();
    this.updatePauseAndStopTime(Date.now());
  }

  continueTimeInterval() {
    const pausedDuration = Date.now() - this.pauseAndStopTime;
    this.updateStartTime(this.startTime + pausedDuration);
    this.startTimeInterval(this.startTime);
  }

  startTimeInterval(time) {
    if (this.timeInterval) return; // Уже запущен
    this.updateStartTime(time);
    this.timeInterval = setInterval(() => {
      const elapsed = (Date.now() - this.startTime) / 1000;
      this.stateManager.setTime(elapsed);
      this.eventManager.emit(GameEvents.TIME_UPDATE, elapsed);
    }, 100); // Обновление каждые 100мс (10 FPS)
  }

  stopTimeInterval() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
      this.setTimeInterval(null);
    }
  }

  async gameRestart() {
    this.eventManager.emit(GameEvents.COLLECT_BTN_HIDDEN);
    await this.setGame();
  }

  async setGame() {
    this.cardsSystem.setCardsContainers();
    const cardsComponents = this.stateManager.getCardsComponents()
    this.gameSetupSystem.setCards(
      cardsComponents.deck,
      cardsComponents.stock
    );

    this.renderStaticElements.render(
      cardsComponents.foundations,
      cardsComponents.tableaus
    );

    this.renderStockElement.render(
      cardsComponents.stock,
      cardsComponents.waste
    );
    await this.gameSetupSystem.dealTableauCards(
      cardsComponents.stock,
      cardsComponents.tableaus
    );
    console.log('this.stateManager.getFaceDownCards(): ', this.stateManager.getFaceDownCards());
    
  }

  updateStartTime(time) {
    this.startTime = time;
  }

  updatePauseAndStopTime(time) {
    this.pauseAndStopTime = time;
  }

  setTimeInterval(data) {
    this.timeInterval = data;
  }
}
