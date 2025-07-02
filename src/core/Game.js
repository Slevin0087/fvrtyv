import { GameLogicSystem } from "../systems/GameLogicSystem.js";
import { RenderingSystem } from "../systems/RenderingSystem.js";
import { GameEvents, AudioName } from "../utils/Constants.js";
import { AnimationSystem } from "../systems/AnimationSystem.js";
import { ShopSystem } from "../systems/ShopSystem.js";
import { AchievementSystem } from "../systems/AchievementSystem.js";

export class Game {
  constructor(eventManager, stateManager, audioManager) {
    this.systems = {};
    this.eventManager = eventManager;
    this.stateManager = stateManager;
    this.audioManager = audioManager;
    this.fullScreenBtn = document.getElementById("full-screen-btn");

    this.init();
  }

  init() {
    console.log("GAME INIT");
    this.registerSystems();
    this.setupEventListeners();
    // this.setupNewGame();
    // this.renderGame();
    // this.renderCards();
  }

  setupEventListeners() {
    this.fullScreenBtn.addEventListener("click", (e) =>
      this.eventManager.emit(GameEvents.FULL_SCREEN_BTN, e)
    );
    this.eventManager.on(GameEvents.CARD_CLICK, (card) => {
      console.log("в подписке на клик по карте");

      this.systems.logic.handleCardClick(card);
    });

    this.eventManager.on("hint:request", () =>
      this.systems.logic.provideHint(this.foundations, this.tableaus)
    );

    this.eventManager.on(GameEvents.GAME_WIN, () => {
      this.stateManager.state.game.isRunning = false;
      this.systems.animation.playWinAnimation();
    });

    this.eventManager.on(GameEvents.CARD_MOVED, () => this.renderCards());
    this.eventManager.on(GameEvents.RENDER_CARDS, () => this.renderCards());
  }

  registerSystems() {
    this.systems = {
      logic: new GameLogicSystem(
        this.eventManager,
        this.stateManager,
        this.audioManager
      ),
      render: new RenderingSystem(
        this.eventManager,
        this.stateManager,
      ),
      animation: new AnimationSystem(this.eventManager, this.stateManager),
      shopSystem: new ShopSystem(this.eventManager, this.stateManager),
      achievementSystem: new AchievementSystem(
        this.eventManager,
        this.stateManager
      ),
    };
  }

  // setNewGame() {
  //   this.systems.logic.setupNewGame(
  //     this.components.deck,
  //     this.components.tableaus,
  //     this.components.stock
  //   );
  // }
  // setupNewGame(deck, tableaus, stock) {
  //   deck.reset();

  //   // // Раздача карт в tableau
  //   // for (let i = 0; i < 7; i++) {
  //   //   for (let j = 0; j <= i; j++) {
  //   //     const card = deck.deal();
  //   //     card.faceUp = j === i;
  //   //     tableaus[i].addCard(card);
  //   //   }
  //   // }

  //   // Оставшиеся карты в сток
  //   const stockCards = [];

  //   while (!deck.isEmpty()) {
  //     stockCards.push(deck.deal());
  //     console.log("stockCards:", stockCards);
  //   }
  //   stock.addCards(stockCards);

  //   // Сброс состояния игры
  //   this.eventManager.emit(GameEvents.END_SET_NEW_GAME);
  // }

  renderGame(companents) {
    this.systems.render.renderGame(companents);
  }

  renderCards() {
    this.systems.render.renderCards();
  }

  restart() {
    this.registerSystems()();
    this.setNewGame();
    this.renderGame();
    // this.renderCards();
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
