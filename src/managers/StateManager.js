import { GameEvents } from "../utils/Constants.js";
import { GameConfig } from "../configs/GameConfig.js";

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
      stateForAchievements: GameConfig.stateForAchievements,
      // {
      //   fastestWin: 0,
      //   moves: 0,
      //   score: 0,
      //   winsWithoutHints: 0,
      //   winsWithoutUndo: 0,
      //   minPossibleMoves: Infinity,
      //   unlockedMany: [],
      //   activeId: "",
      //   active: {},
      // },
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
      this.incrementGamesPlayed(1);
      this.setIsPaused(false);
      this.savePlayerStats();
    });
    this.eventManager.on(GameEvents.PLAYER_NAME_SET, (name) => {
      this.setPlayerName(name);
      this.savePlayerStats();
    });

    this.eventManager.on(GameEvents.INCREMENT_COINS, (coins) => {
      this.incrementCoins(coins);
      this.savePlayerStats();
    });

    this.eventManager.on(GameEvents.DECREMENT_COINS, (coins) => {
      this.decrementCoins(coins);
      this.savePlayerStats();
    });

    // this.eventManager.on(
    //   GameEvents.SET_CARDS_COMPONENTS,
    //   (components) => (this.state.cardsComponents = components)
    // );

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

    this.eventManager.on(GameEvents.RESET_STATE_FOR_NEW_GAME, () => {
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

    this.eventManager.on(GameEvents.SET_LANGUAGE_CHANGE, (value) => {
      this.setLanguage(value);
      this.saveGameSettings();
    });

    this.eventManager.on(GameEvents.GAME_END, () => {
      this.setIsRunning(false);
      this.resetLastMoves();
      this.setIsPaused(true);
      this.saveAllData();
    });

    this.eventManager.on(GameEvents.SET_GAME_PAUSE_STATUS, (boolean) => {
      this.setIsPaused(boolean);
    });

    // Другие обработчики событий...
    this.eventManager.on(GameEvents.GAME_EXIT, (activePage) => {
      this.state.ui.activePage = activePage;
    });

    this.eventManager.on(GameEvents.SET_SOUND_TOGGLE, (enabled) => {
      this.setSoundEnabled(enabled);
      this.saveGameSettings();
    });

    this.eventManager.on(GameEvents.SET_MUSIC_TOGGLE, (enabled) => {
      this.setMusicEnabled(enabled);
      this.saveGameSettings();
    });

    this.eventManager.on(GameEvents.SET_ASSISTANCE_IN_COLLECTION, (enabled) => {
      this.setAssistanceInCollection(enabled);
      this.saveGameSettings();
    });

    this.eventManager.on(GameEvents.SET_ASSISTANCE_IN_CARD_CLICK, (enabled) => {
      this.setAssistanceInCardClick(enabled);
      this.saveGameSettings();
    });

    this.eventManager.on(GameEvents.SET_MUSIC_VOLUME, (value) => {
      this.setMusicVolume(value);
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
      this.incrementHintUsed(count)
    );

    this.eventManager.on(GameEvents.SET_DEALING_CARDS, (value) => {
      this.setDealingCards(value);
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

  setAssistanceInCollection(enabled) {
    this.state.settings.assistanceInCollection = enabled;
  }

  getAssistanceInCollection() {
    return this.state.settings.assistanceInCollection;
  }

  setAssistanceInCardClick(enabled) {
    this.state.settings.assistanceInCardClick = enabled;
  }

  getAssistanceInCardClick() {
    return this.state.settings.assistanceInCardClick;
  }

  setMusicEnabled(enabled) {
    this.state.settings.musicEnabled = enabled;
  }

  getMusicEnabled() {
    return this.state.settings.musicEnabled;
  }

  setSoundEnabled(enabled) {
    this.state.settings.soundEnabled = enabled;
  }

  setLanguage(value) {
    this.state.settings.language = value;
  }

  setMusicVolume(value) {
    this.state.settings.musicVolume = value;
  }

  getMusicVolume() {
    return this.state.settings.musicVolume;
  }

  setDealingCards(value) {
    this.state.player.dealingCards = value;
  }

  getDealingCards() {
    return this.state.player.dealingCards;
  }

  getLanguage() {
    return this.state.settings.language;
  }

  getSoundEnabled() {
    return this.state.settings.soundEnabled;
  }

  setCardsComponents(components) {
    this.state.cardsComponents = components;
  }
  getCardsComponents() {
    return this.state.cardsComponents;
  }

  setActivePage(page) {
    this.state.ui.activePage = page;
  }

  incrementCoins(count) {
    this.state.player.coins += count;
  }

  decrementCoins(count) {
    this.state.player.coins -= count;
  }

  incrementGamesPlayed(count) {
    this.state.player.gamesPlayed += count;
  }

  incrementUndoUsed(count) {
    this.state.player.undoUsed += count;
  }

  getUndoUsed() {
    return this.state.player.undoUsed;
  }

  decrementHintUsed(count) {
    this.state.player.hintQuantity -= count;
  }

  setPlayerName(name) {
    this.state.player.name = name;
  }

  setIsRunning(boolean) {
    this.state.game.isRunning = boolean;
  }

  getIsRunning() {
    return this.state.game.isRunning;
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

  setIsDontShowAgainDealingCardsModal(boolean) {
    this.state.player.isDontShowAgainDealingCardsModal = boolean;
    this.savePlayerStats();
  }

  getIsDontShowAgainDealingCardsModal() {
    return this.state.player.isDontShowAgainDealingCardsModal;
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
    this.state.stateForAchievements.score = score;
  }

  setTime(time) {
    this.state.game.playTime = time;
  }

  getTime() {
    return this.state.game.playTime;
  }

  // setHintsUsed()

  getHintsUsed() {
    return this.state.player.hintsUsed;
  }

  setFastestWin(time) {
    this.state.player.fastestWin = time;
  }

  getFastestWin() {
    this.state.player.fastestWin;
  }

  setPlayerFirstCardClick(boolean) {
    this.state.player.playerFirstCardClick = boolean;
  }

  getPlayerFirstCardClick() {
    return this.state.player.playerFirstCardClick;
  }

  resetMoves(n) {
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

  resetFaceDownCards() {
    this.state.faceDownCards = [];
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

  updateLastMoves(lastMove) {
    const lastMovesLengths = this.getLastMovesLengths();
    this.state.player.lastMoves = [
      ...(lastMovesLengths >= this.state.player.lastMoveQuantity
        ? this.state.player.lastMoves.slice(1)
        : this.state.player.lastMoves),
      lastMove,
    ];
  }

  resetLastMoves() {
    this.state.player.lastMoves = [];
  }

  getLastMovesLengths() {
    return this.state.player.lastMoves.length;
  }

  updateMoves(n) {
    this.state.stateForAchievements.moves += n;
    this.state.player.totalMoves += n;
  }

  getMoves() {
    return this.state.stateForAchievements.moves;
  }

  getMinPossibleMoves() {
    return this.state.stateForAchievements.minPossibleMoves;
  }

  setMinPossibleMoves(count) {
    this.state.stateForAchievements.minPossibleMoves = count;
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
  getIsDealingCardsAnimation() {
    return this.state.isDealingCardsAnimation;
  }

  setIsAnimateCardFomStockToWaste(boolean) {
    this.state.isAnimateCardFomStockToWaste = boolean;
  }

  getIsAnimateCardFomStockToWaste() {
    return this.state.isAnimateCardFomStockToWaste;
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

  // getIsPaused() {
  //   const GameStats = this.storage.getGameStats();
  //   return GameStats.isPaused;
  // }

  getIsPaused() {
    return this.state.game.isPaused;
  }

  updateScore(points) {
    // this.state.game.score += points;
    this.state.player.totalScores += points;
    this.state.stateForAchievements.score += points;
    if (
      this.state.stateForAchievements.score > this.state.player.highestScore
    ) {
      this.state.player.highestScore = this.state.stateForAchievements.score;
      this.storage.setPlayerStats(this.state.player);
      this.eventManager.emit(GameEvents.CREAT_ELEMENT_FOR_HIGHEST_SCORE);
    }
    this.eventManager.emit(
      GameEvents.SCORE_UPDATE,
      this.state.stateForAchievements.score
    );
    this.eventManager.emit(
      GameEvents.CHECK_GET_ACHIEVEMENTS,
      this.typeScoreCheckAchievements
    );
  }

  incrementHintUsed(count) {
    this.state.game.hintUsed += count;
  }

  decrementHintCounterState(count) {
    this.state.hintCounterState -= count;
  }

  getHintCounterState() {
    return this.state.hintCounterState;
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
