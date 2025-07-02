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

export class GameManager {
  constructor() {
    this.lastTime = 0;
    this.game = null;
    // this.init();
  }

  init() {}

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
      this.stateManager
    );
    this.gameLogicSystem = new GameLogicSystem(
      this.eventManager,
      this.stateManager,
      this.audioManager
    );
    this.renderingSystem = new RenderingSystem(
      this.eventManager,
      this.stateManager,
      this.cardsSystem
    );
    this.setupEventListeners();
    this.gameLoop(0);
    // 2. Загрузка необходимых данных
    // await this.loadAssets();

    // 3. Создание экземпляра игры

    // 4. Старт игрового процесса
    // await this.game.start();
  }

  setupEventListeners() {
    this.eventManager.on(GameEvents.SET_NEW_GAME, async () => {
      this.gameLogicSystem.setCards(
        this.cardsSystem.deck,
        this.cardsSystem.stock
      );

      this.renderingSystem.renderStaticElements(
        this.cardsSystem.foundations,
        this.cardsSystem.tableaus
      );

      this.renderingSystem.renderStockElement(this.cardsSystem.stock);
      await this.gameLogicSystem.dealTableauCards(
        this.cardsSystem.stock,
        this.cardsSystem.tableaus
      );
    });
    this.eventManager.on(GameEvents.GAME_RESTART, () => this.game.restart());
  }

  gameLoop(timestamp) {
    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;

    // if (this.state.currentGame && this.state.currentGame.update) {
    //   this.state.currentGame.update(deltaTime / 1000);
    //   // console.log('в gameLoop timestamp:', this.state.currentGame.update);
    // }

    if (this.update) {
      this.update(deltaTime / 1000);
    }

    // console.log('/////////////////////////////////////////////////////////////////////////////////////////');

    requestAnimationFrame((t) => {
      this.gameLoop(t);
    });
  }

  update(deltaTime) {
    console.log("///////////////////////////////////////////////////////");

    if (this.stateManager.state.game.isRunning) {
      this.stateManager.state.game.playTime += deltaTime;
      // this.eventManager.emit(
      //   GameEvents.TIME_UPDATE,
      //   this.stateManager.state.game.playTime
      // );
    }
  }
}
