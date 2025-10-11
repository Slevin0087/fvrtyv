import { GameEvents } from "../utils/Constants.js";
import { GameConfig } from "../configs/GameConfig.js";
import { achType, achCheckName } from "../configs/AchievementsConfig.js";

export class StateManager {
  constructor(eventManager, storage) {
    this.eventManager = eventManager;
    this.storage = storage;
    this.state = null;
    this.cardContainers = GameConfig.cardContainers;
    this.typeScoreCheckAchievements = "inGame";
    this.init();
  }

  init() {
    this.state = this.getInitialState();
    this.upDealingCardsValue(this.state.player.dealingCards);
    this.state.stateForAchievements.minPossibleMoves =
      this.state.player.minPossibleMoves;
    this.state.hintCounterState = this.state.player.hintQuantity;
    this.setupEventListeners();
  }

  getInitialState() {
    return {
      stateForAchievements: {
        fastestWin: 0,
        moves: 0,
        score: 0,
        winsWithoutHints: 0,
        winsWithoutUndo: 0,
        minPossibleMoves: Infinity,
        unlockedMany: [],
        activeId: "",
        active: {},
      },
      cardsComponents: null,
      faceDownCards: [],
      dealingCards: GameConfig.rules.defaultDealingCards,
      ui: this.storage.getUIStats(),
      game: this.storage.getGameStats(),
      player: this.storage.getPlayerStats(),
      settings: this.storage.getGameSettings(),
      shop: this.storage.getShopStats(),
    };
  }

  setupEventListeners() {
    this.eventManager.on(GameEvents.FIRST_CARD_CLICK, () => {
      this.state.game.playerFirstCardClick = true;
      this.state.player.gamesPlayed++;
      this.savePlayerStats();
    });
    this.eventManager.on(GameEvents.PLAYER_NAME_SET, (name) => {
      this.state.player.name = name;
      this.savePlayerStats();
    });

    this.eventManager.on(GameEvents.INCREMENT_COINS, (coins) => {
      this.state.player.coins += coins;
      this.savePlayerStats();
    });

    this.eventManager.on(GameEvents.DECREMENT_COINS, (coins) => {
      this.state.player.coins -= coins;
      this.savePlayerStats();
    });

    this.eventManager.on(
      GameEvents.SET_ACTIV_PAGE,
      (page) => (this.state.ui.activePage = page)
    );

    this.eventManager.on(
      GameEvents.SET_CURRENT_GAME,
      (currentGame) => (this.state.currentGame = currentGame)
    );

    this.eventManager.on(
      GameEvents.SET_CARDS_COMPONENTS,
      (components) => (this.state.cardsComponents = components)
    );

    this.eventManager.on(GameEvents.GAME_NEW, () => {
      this.state.game.isRunning = true;
    });

    this.eventManager.on(GameEvents.END_SET_NEW_GAME, () => {
      this.resetScore(0);
      this.resetTime(0);
      // this.resetLastMove()
      this.resetLastMoves();
    });

    this.eventManager.on(GameEvents.GAME_RESTART, () => {
      this.resetScore(0);
      this.resetTime(0);
      // this.resetLastMove()
      this.resetLastMoves();
      this.resetMoves(0);
      this.resetAchievementsActive();
      this.getDealingCardsValue();
    });

    this.eventManager.on(GameEvents.SET_NEW_GAME, () => {
      this.resetScore(0);
      this.resetTime(0);
      // this.resetLastMove()
      this.resetLastMoves();
      this.resetMoves(0);
      this.getDealingCardsValue();
    });

    this.eventManager.on(GameEvents.SET_DIFFICUTY_CHANGE, (value) => {
      this.state.settings.difficulty = value;
      this.saveGameSettings();
    });

    this.eventManager.on(GameEvents.SET_LANGUAGE_CHANGE, (value) => {
      this.state.settings.language = value;
      this.saveGameSettings();
    });

    this.eventManager.on(GameEvents.GAME_END, () => {
      this.state.game.isRunning = false;
      // this.resetLastMove()
      this.resetLastMoves();
      this.saveAllData();
    });

    this.eventManager.on(GameEvents.GAME_PAUSE, () => {
      this.state.game.isPaused = true;
    });

    this.eventManager.on("game:resume", () => {
      this.state.game.isPaused = false;
    });

    // Другие обработчики событий...
    this.eventManager.on(GameEvents.GAME_EXIT, (activePage) => {
      this.state.ui.activePage = activePage;
    });

    this.eventManager.on(GameEvents.SET_SOUND_TOGGLE, (enabled) => {
      this.state.settings.soundEnabled = enabled;
      this.saveGameSettings();
    });

    this.eventManager.on(GameEvents.SET_MUSIC_VOLUME, (value) => {
      this.state.settings.musicVolume = value;
      this.saveGameSettings();
    });

    this.eventManager.on(GameEvents.SHOP_CATEGORY_CHANGE, (category) => {
      this.state.shop.currentCategory = category;
      this.saveShopStats();
    });

    this.eventManager.on(GameEvents.SET_SHOP_STATS, () => this.saveShopStats());
    this.eventManager.on(GameEvents.RESET_LAST_MOVES, () =>
      // this.resetLastMove()
      this.resetLastMoves()
    );

    this.eventManager.on(GameEvents.UP_HITUSED_STATE, (count) =>
      this.updateHintUsed(count)
    );

    this.eventManager.on(GameEvents.SET_DEALING_CARDS, (value) => {
      this.state.player.dealingCards = value;
      this.savePlayerStats();
    });
  }

  getAllData() {
    // Загрузка сохраненных данных
    this.getGameStats();
    this.loadPlayerStats();
    this.loadGameSettings();
    // Загрузка магазина
    this.state.shop.purchasedItems = this.storage.getPurchasedItems();
    this.state.player.coins = this.storage.getCoins();
    this.state.achievements.unlocked = this.storage.getUnlockedAchievements();
  }

  getGameStats() {
    const savedGameState = this.storage.getGameStats();
    if (savedGameState && this.validator.isGameStateValid(savedGameState)) {
      this.state.game = {
        ...this.state.game,
        ...savedGameState,
      };
    }
  }

  loadPlayerStats() {
    // Загрузка статистики игрока
    const savedPlayerStats = this.storage.loadPlayerStats(this.state.player);
    // if (savedPlayerStats) {
    this.state.player = {
      ...this.state.player,
      ...savedPlayerStats,
    };
  }

  loadGameSettings() {
    // Загрузка настроек
    const savedSettings = this.storage.loadGameSettings(this.state.settings);
    // if (savedSettings) {
    this.state.settings = {
      ...this.state.settings,
      ...savedSettings,
    };
    // }
  }

  saveAllData() {
    this.saveGameState();
    this.savePlayerStats();
    this.saveGameSettings();
  }

  saveGameState() {
    console.log("this.state.game:", this.state.game);

    this.storage.setGameStats(this.state.game);
  }

  savePlayerStats() {
    this.storage.setPlayerStats(this.state.player);
  }

  saveGameSettings() {
    this.storage.setGameSettings(this.state.settings);
  }

  saveShopStats() {
    this.storage.setShopStats(this.state.shop);
  }

  saveUIStats() {
    this.storage.setUIStats(this.state.ui);
  }

  resetScore(score) {
    this.state.game.score = score;
    this.state.stateForAchievements.score = score;
  }

  resetTime(time) {
    this.state.game.playerFirstCardClick = false;
    this.state.game.playTime = time;
  }

  resetMoves(n) {
    this.state.game.moves = n;
    this.state.stateForAchievements.moves = n;
  }

  resetAchievementsActive() {
    this.state.stateForAchievements.unlockedMany = [];
    this.state.stateForAchievements.activeId = [];
    this.state.stateForAchievements.active = {};
  }

  addCoins(amount) {
    if (!this.validator.isPositiveNumber(amount)) return;

    this.state.player.coins += amount;
    this.storage.addCoins(amount);
    this.eventManager.emit("player:coins:updated", this.state.player.coins);
  }

  deductCoins(amount) {
    if (!this.validator.isPositiveNumber(amount)) return;

    this.state.player.coins = Math.max(0, this.state.player.coins - amount);
    this.storage.deductCoins(amount);
    this.eventManager.emit("player:coins:updated", this.state.player.coins);
  }

  addUnlockAchievement(achievementId) {
    if (this.state.achievements.unlocked.includes(achievementId)) return;

    this.state.achievements.unlocked.push(achievementId);
    this.storage.addUnlockAchievement(achievementId);
    this.eventManager.emit("achievement:unlocked", achievementId);
  }

  purchaseShopItem(itemId) {
    const item = ShopConfig.items.find((i) => i.id === itemId);
    if (!item || this.state.shop.purchasedItems.includes(itemId)) return false;

    if (this.state.player.coins >= item.price) {
      this.deductCoins(item.price);
      this.state.shop.purchasedItems.push(itemId);
      this.storage.purchaseItem(itemId);
      return true;
    }

    return false;
  }

  // updateLastMove(moveData) {
  //   console.log("moveData:", moveData);

  //   this.state.game.lastMove = [
  //     ...(this.state.game.lastMove.length >= this.state.player.lastMoveQuantity
  //       ? this.state.game.lastMove.slice(1)
  //       : this.state.game.lastMove),
  //     moveData,
  //   ];
  //   console.log("this.state.game.lastMove:", this.state.game.lastMove);

  // }

  updateLastMoves(lastMove) {
    // const { source, lastMove } = params;
    // console.log("source, moveData:", source, lastMove);

    const lastMovesLengths = this.getLastMovesLengths();

    // if (source.startsWith(this.cardContainers.stock)) {
    //   this.state.game.lastMoves.stockLastMoves = [
    //     ...(lastMovesLengths >= this.state.player.lastMoveQuantity
    //       ? this.state.game.lastMoves.stockLastMoves.slice(1)
    //       : this.state.game.lastMoves.stockLastMoves),
    //     lastMove,
    //   ];
    // } else {
      this.state.game.lastMoves = [
        ...(lastMovesLengths >= this.state.player.lastMoveQuantity
          ? this.state.game.lastMoves.slice(1)
          : this.state.game.lastMoves),
        lastMove,
      ];
    // }
    console.log("this.state.game.lastMoves:", this.state.game.lastMoves);
  }

  resetLastMoves() {
    this.state.game.lastMoves = [];
  }

  // resetLastMoves() {
  //   this.state.game.lastMoves.otherLastMoves = [];
  //   this.state.game.lastMoves.stockLastMoves = [];
  // }

  getLastMovesLengths() {
    return this.state.game.lastMoves.length;
  }

  updateMoves(n) {
    this.state.game.moves += n;
    this.state.stateForAchievements.moves += n;
    this.state.player.totalMoves += n;
  }

  upDealingCardsValue(value) {
    this.state.dealingCards = value;
  }

  getDealingCardsValue() {
    const playerStats = this.storage.getPlayerStats();
    this.upDealingCardsValue(playerStats.dealingCards);
  }

  updateScore(points) {
    this.state.game.score += points;
    this.state.stateForAchievements.score += points;
    if (this.state.game.score > this.state.player.highestScore) {
      this.state.player.highestScore = this.state.game.score;
      this.storage.setPlayerStats(this.state.player);
    }
    this.eventManager.emit(GameEvents.SCORE_UPDATE, this.state.game.score);
    this.eventManager.emit(
      GameEvents.CHECK_GET_ACHIEVEMENTS,
      this.typeScoreCheckAchievements
    );
  }

  updateHintUsed(count) {
    this.state.game.hintUsed += count;
  }

  incrementGameStat(statName, amount = 1) {
    try {
      if (this.state.game[statName] !== undefined) {
        this.state.game[statName] += amount;
      }
    } catch (error) {
      console.error("incrementGameStat failed:", error);
      throw error;
    }
  }

  incrementStat(statName, achType, amount = 1) {
    try {
      if (this.state.player[statName] !== undefined) {
        this.state.player[statName] += amount;
        this.eventManager.emit(GameEvents.CHECK_GET_ACHIEVEMENTS, achType);
      }
    } catch (error) {
      console.error("incrementStat failed:", error);
      throw error;
    }
  }

  resetGameState() {
    this.state.game = {
      ...this.getInitialState().game,
      difficulty: this.state.game.difficulty,
    };
    this.saveGameState();
  }

  /////////////////////////////
  loadInitialState() {
    this.loadGameSettings();
    this.loadShopState();
  }

  loadGameSettings() {
    this.state.game.settings = this.storage.loadGameSettings();
  }

  loadShopState() {
    this.state.shop.items = this.storage.getShopItems();
    this.state.shop.balance = this.storage.getCoins();
  }
}
