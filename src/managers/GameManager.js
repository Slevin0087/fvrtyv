import { GameEvents } from "../utils/Constants.js";
import { Game } from "../core/Game.js";
import { EventManager } from "./EventManager.js";
import { StateManager } from "./StateManager.js";
import { UIManager } from "./UIManager.js";
import { AudioManager } from "./AudioManager.js";
import { CardsManager } from "./CardsManager.js";
import { Storage } from "../utils/Storage.js";

export class GameManager {
  constructor() {
    this.lastTime = 0;
    this.game = null;
    // this.init();
  }

  init() {}

  async startApp() {
    // 1. Инициализация менеджеров
    this.eventManager = new EventManager();
    this.stogare = new Storage(this.eventManager);
    this.stateManager = new StateManager(this.eventManager, this.stogare);
    this.uiManager = new UIManager(this.eventManager, this.stateManager);
    this.audioManager = new AudioManager(this.eventManager, this.stateManager);
    this.cardsManager = new CardsManager(this.eventManager, this.stateManager);
    this.game = new Game(
      this.eventManager,
      this.stateManager,
      this.audioManager,
      this.cardsManager.systems.cardsSystem
    );

    this.registerComponents();
    await this.setupEventListeners();
    this.gameLoop(0);
    // 2. Загрузка необходимых данных
    // await this.loadAssets();

    // 3. Создание экземпляра игры

    // 4. Старт игрового процесса
    // await this.game.start();
  }

  async setupEventListeners() {
    this.eventManager.on(GameEvents.SET_NEW_GAME, () => {
      this.cardsManager.setCards();
      this.game.renderGame(this.cardsManager.components);
      this.cardsManager.dealTableauCards();
    });
    this.eventManager.on(GameEvents.GAME_RESTART, () => this.game.restart());
  }

  registerComponents() {
    this.eventManager.emit(GameEvents.SET_CURRENT_GAME, this.game);
  }

  gameLoop(timestamp) {
    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;

    // if (this.state.currentGame && this.state.currentGame.update) {
    //   this.state.currentGame.update(deltaTime / 1000);
    //   // console.log('в gameLoop timestamp:', this.state.currentGame.update);
    // }

    if (this.game.update) {
      this.game.update(deltaTime / 1000);
    }

    // console.log('/////////////////////////////////////////////////////////////////////////////////////////');

    requestAnimationFrame((t) => {
      this.gameLoop(t);
    });
  }
}
