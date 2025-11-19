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
      modalsState: {
        restartGameModal: {
          created: false,
        },
      },
      dealingCards: GameConfig.rules.defaultDealingCards,
      isDealingCardsAnimation: false,
      isAnimateCardFomStockToWaste: false,
      isUndoCardAnimation: false,
      isAutoCollectBtnShow: false,
      usedAutoCollectCards: false,
      isNoHints: false,
      iscreateVictoryConfetti: false,
      activeModal: { modal: null, handlerClose: null },
      ui: this.storage.getUIStats(),
      game: this.storage.getGameStats(),
      player: this.storage.getPlayerStats(),
      settings: this.storage.getGameSettings(),
      shop: this.storage.getShopStats(),
    };
  }

  setupEventListeners() {
    this.eventManager.on(GameEvents.FIRST_CARD_CLICK, () => {
      this.setPlayerFirstCardClick(true);
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
      this.setIsRunning(true);
    });

    this.eventManager.on(GameEvents.END_SET_NEW_GAME, () => {
      this.resetScore(0);
      this.setTime(0);
      this.resetLastMoves();
      this.setPlayerFirstCardClick(false);
    });

    this.eventManager.onAsync(GameEvents.GAME_RESTART, () => {
      this.resetScore(0);
      this.setTime(0);
      this.resetLastMoves();
      this.resetMoves(0);
      this.resetAchievementsActive();
      this.resetIsNoHints(false);
      this.getDealingCardsValue();
      this.setPlayerFirstCardClick(false);
      this.setIsRunning(true);
      this.setIsPaused(false);
    });

    this.eventManager.onAsync(GameEvents.SET_NEW_GAME, () => {
      this.resetScore(0);
      this.setTime(0);
      this.resetLastMoves();
      this.resetMoves(0);
      this.resetIsNoHints(false);
      this.getDealingCardsValue();
      this.setPlayerFirstCardClick(false);
      this.setIsRunning(true);
      this.setIsPaused(false);
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
      this.setIsRunning(false);
      this.resetLastMoves();
      this.saveAllData();
      this.setIsPaused(true);
    });

    this.eventManager.on(GameEvents.SET_GAME_PAUSE_STATUS, (boolean) => {
      this.setIsPaused(boolean);
    });

    // Другие обработчики событий...
    this.eventManager.on(GameEvents.GAME_EXIT, (activePage) => {
      this.state.ui.activePage = activePage;
    });

    this.eventManager.on(GameEvents.SET_SOUND_TOGGLE, (enabled) => {
      this.state.settings.soundEnabled = enabled;
      this.saveGameSettings();
    });

    this.eventManager.on(GameEvents.SET_ASSISTANCE_IN_COLLECTION, (enabled) => {
      this.state.settings.assistanceInCollection = enabled;
      this.saveGameSettings();
    });

    this.eventManager.on(GameEvents.SET_ASSISTANCE_IN_CARD_CLICK, (enabled) => {
      this.state.settings.assistanceInCardClick = enabled;
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
      this.resetLastMoves()
    );

    this.eventManager.on(GameEvents.UP_HITUSED_STATE, (count) =>
      this.updateHintUsed(count)
    );

    this.eventManager.on(GameEvents.SET_DEALING_CARDS, (value) => {
      this.state.player.dealingCards = value;
      this.savePlayerStats();
    });

    this.eventManager.on(GameEvents.COLLECT_BTN_SHOW, () => {
      this.state.isAutoCollectBtnShow = true;
    });

    this.eventManager.on(GameEvents.COLLECT_BTN_HIDDEN, () => {
      this.state.isAutoCollectBtnShow = false;
    });

    this.eventManager.on(GameEvents.NEED_VIDEO_FOR_HINTS, (boolean) => {
      this.setNeedVideoForHints(boolean);
    });

    this.eventManager.on(GameEvents.SET_NO_HINTS, (boolean) => {
      this.setIsNoHints(boolean);
    });

    this.eventManager.on(GameEvents.TIME_UPDATE, (time) => {
      this.setTime(time);
    });
  }

  setIsRunning(boolean) {
    this.state.game.isRunning = boolean;
  }

  getIsRunning() {
    return this.state.game.isRunning;
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

  setdontShowAgainDealingCardsModal(boolean) {
    this.state.player.isDontShowAgainDealingCardsModal = boolean;
    this.savePlayerStats();
  }

  saveAllData() {
    this.saveGameState();
    this.savePlayerStats();
    this.saveGameSettings();
  }

  saveGameState() {
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

  setTime(time) {
    console.log('time: ', time);
    
    this.state.game.playTime = time;
  }

  setPlayerFirstCardClick(boolean) {
    this.state.game.playerFirstCardClick = boolean;
  }

  getPlayerFirstCardClick() {
    return this.state.game.playerFirstCardClick;
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

  resetIsNoHints(boolean) {
    this.state.isNoHints = boolean;
  }

  resetIscreateVictoryConfetti(boolean) {
    this.state.iscreateVictoryConfetti = boolean;
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

  setUsedAutoCollectCards(boolean) {
    this.state.usedAutoCollectCards = boolean;
  }

  setIsDealingCardsAnimation(boolean) {
    this.state.isDealingCardsAnimation = boolean;
  }

  setIsAnimateCardFomStockToWaste(boolean) {
    this.state.isAnimateCardFomStockToWaste = boolean;
  }

  setIsUndoCardAnimation(boolean) {
    this.state.isUndoCardAnimation = boolean;
  }

  setIsNoHints(boolean) {
    this.state.isNoHints = boolean;
  }

  getIsNoHints() {
    return this.state.isNoHints;
  }

  getDealingCardsValue() {
    const playerStats = this.storage.getPlayerStats();
    this.upDealingCardsValue(playerStats.dealingCards);
  }

  isRestartGameModalCreated() {
    return this.state.modalsState.restartGameModal.created;
  }

  setIsRestartGameModalCreated(boolen) {
    // установка true или false
    this.state.modalsState.restartGameModal.created = boolen;
  }

  setNeedVideoForHints(boolean) {
    this.state.player.needVideoForHints = boolean;
    this.savePlayerStats();
  }

  setActiveModal(modal, handlerClose) {
    this.state.activeModal.modal = modal;
    this.state.activeModal.handlerClose = handlerClose;
  }

  resetActiveModal() {
    this.state.activeModal.modal = null;
    this.state.activeModal.handlerClose = null;
  }

  getActiveModal() {
    return this.state.activeModal;
  }

  getNeedVideoForHints() {
    const playerStats = this.storage.getPlayerStats();
    return playerStats.needVideoForHints;
  }

  getIsAutoCollectBtnShow() {
    return this.state.isAutoCollectBtnShow;
  }

  setIsPaused(boolean) {
    this.state.game.isPaused = boolean;
  }

  getIsPaused() {
    const GameStats = this.storage.getGameStats();
    return GameStats.isPaused;
  }

  updateScore(points) {
    this.state.game.score += points;
    this.state.stateForAchievements.score += points;
    if (this.state.game.score > this.state.player.highestScore) {
      this.state.player.highestScore = this.state.game.score;
      this.storage.setPlayerStats(this.state.player);
      this.eventManager.emit(GameEvents.CREAT_ELEMENT_FOR_HIGHEST_SCORE);
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
