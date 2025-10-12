import { GameConfig } from '../configs/GameConfig.js'

export class Storage {
  constructor() {
    this.defaultUIStats = {
      activePage: "UINamePage",
    };

    this.defaultPlayerStats = {
      name: "",
      coins: GameConfig.defaultPlayerStats.coins,
      wins: 0,
      losses: 0,
      totalMoves: 0,
      lastMoveQuantity: GameConfig.defaultPlayerStats.lastMoveQuantity,
      hintQuantity: GameConfig.defaultPlayerStats.hintQuantity,
      cardsToFoundation: 0,
      highestScore: 0,
      highestTime: "",
      fastestWin: Infinity,
      gamesPlayed: 0,
      cardsFlipped: 0,
      winsWithoutHints: 0,
      winsWithoutUndo: 0,
      dealingCards: 1,
      isDontShowAgainDealingCardsModal: false,
      // minPossibleMoves: 52, // Теоретический минимум для пасьянса
      minPossibleMoves: Infinity,
      purchasedItems: {
        faces: {
          ids: ["classic_faces", "cosmo_faces", "leather_faces"],
        },
        backs: {
          ids: ["classic_back", "dice_back"],
        },
        backgrounds: {
          ids: ["classic_fon", "light_green_fon", "classic_fon_4"],
        },
      },
      selectedItems: {
        faces: {
          id: "classic_faces",
          name: "Классические",
          type: "faces",
          bgType: "styles",
          category: "cardFace",
          owned: false,
          isBought: false,
          price: 0,
          styleClass: "classic-faces",
          description: "Стандартный дизайн карт",
          rarity: "common",
          unlockCondition: null,
          previewImage: "",
          styles: {
            background: "rgb(204, 195, 195)",
          },
        },
        backs: {
          id: "classic_back",
          name: "Классическая рубашка",
          type: "backs",
          bgType: "styles",
          category: "cardBack",
          owned: false,
          isBought: false,
          price: 0,
          styleClass: "classic-back",
          description: "Классическая рубашка",
          rarity: "common",
          unlockCondition: null,
          previewImage: "assets/shop/previews/blue_back.png",
          styles: {
            background:
              "repeating-linear-gradient(45deg,#1a5a1a,#1a5a1a 10px,#165016 10px,#165016 20px)",
            color: "transparent !important",
          },
        },
        backgrounds: {
          id: "classic_fon",
          name: "Классический зелёный",
          type: "backgrounds",
          bgType: "styles",
          category: "background",
          owned: false,
          isBought: false,
          price: 0,
          styleClass: "classic-fon",
          description: "Классический фон",
          rarity: "rare",
          unlockCondition: { score: 1000 },
          previewImage: "",
          styles: {
            backgroundColor: "green",
            width: "326px",
            height: "245px",
          },
        },
      },
      achievements: {
        unlocked: ["newbie"],
        locked: [],
        activeId: "newbie",
        active: {
          id: "newbie",
          type: "start",
          title: "Новичок",
          description: "Сыграть первую игру",
          icon: "👶",
          reward: 0,
          condition: (stats) => stats.gamesPlayed >= 1,
          rarity: "common",
          hidden: false,
        },
      },
    };

    this.defaultGameStats = {
      isRunning: false,
      isPaused: false,
      playerFirstCardClick: false,
      usedAutoCollectCards: false,
      score: 0,
      moves: 0,
      playTime: 0,
      hintsUsed: 0,
      undoUsed: 0,
      lastMoves: [],
      // lastMoves: {
      //   stockLastMoves: [],
      //   otherLastMoves: [],
      // },
      difficulty: "normal",
      faceDownCards: 28,
    };

    this.defaultSettingsStats = {
      soundEnabled: false,
      theme: "default",
      language: "ru",
      musicVolume: 0.2,
      effectsVolume: 0.9,
      difficulty: "normal",
      cardFaceStyle: "classic",
      cardBackStyle: "blue",
      backgroundStyle: "default",
    };

    this.defaultShopStats = {
      currentCategory: "faces",
      purchasedItems: [],
      selectedItems: {
        cardFace: {},
        cardBack: {},
        background: {},
      },
    };
    this.init();
  }

  init() {
    this.setDefaultGameStats();
    this.setDefaultPlayerStats();
    this.setDefaultSettingsStats();
    this.setDefaultShopStats();
  }
  /////////////////////////////////////////////////////////////////////////////////////////

  /////////////////////////////// SETS ///////////////////////////////////////////////////
  setDefaultUIStats() {
    if (localStorage.getItem("defaultUIStats")) return;
    localStorage.setItem("defaultUIStats", JSON.stringify(this.defaultUIStats));
  }

  setDefaultGameStats() {
    if (localStorage.getItem("defaultGameStats")) return;
    localStorage.setItem(
      "defaultGameStats",
      JSON.stringify(this.defaultGameStats)
    );
  }

  setDefaultPlayerStats() {
    if (localStorage.getItem("defaultPlayerStats")) return;
    else {
      localStorage.setItem(
        "defaultPlayerStats",
        JSON.stringify(this.defaultPlayerStats)
      );
    }
  }

  setDefaultSettingsStats() {
    if (localStorage.getItem("defaultSettingsStats")) return;
    localStorage.setItem(
      "defaultSettingsStats",
      JSON.stringify(this.defaultSettingsStats)
    );
  }

  setDefaultShopStats() {
    if (localStorage.getItem("defaultShopStats")) return;
    localStorage.setItem(
      "defaultShopStats",
      JSON.stringify(this.defaultShopStats)
    );
  }
  /////////////////////////////////////////////////////////////////////////////////////////////

  ////////////////////////////////GETS /////////////////////////////////////////////////////
  getDefaultUIStats() {
    try {
      const state = JSON.parse(localStorage.getItem("defaultUIStats"));
      return state || this.defaultUIStats;
    } catch (e) {
      console.error("Error loading UI state:", e);
      return null;
    }
  }

  getDefaultGameStats() {
    try {
      const state = JSON.parse(localStorage.getItem("defaultGameStats"));
      return state || this.defaultGameStats;
    } catch (e) {
      console.error("Error loading game state:", e);
      return null;
    }
  }

  getDefaultPlayerStats() {
    try {
      const state = JSON.parse(localStorage.getItem("defaultPlayerStats"));
      return state || this.defaultPlayerStats;
    } catch (e) {
      console.error("Error loading player state:", e);
      return null;
    }
  }

  getDefaultSettingsStats() {
    try {
      const state = JSON.parse(localStorage.getItem("defaultSettingsStats"));
      return state || this.defaultSettingsStats;
    } catch (e) {
      console.error("Error loading settings state:", e);
      return null;
    }
  }

  getDefaultShopStats() {
    try {
      const state = JSON.parse(localStorage.getItem("defaultShopStats"));
      return state || this.defaultShopStats;
    } catch (e) {
      console.error("Error loading shop state:", e);
      return null;
    }
  }

  getUIStats() {
    try {
      const state = JSON.parse(localStorage.getItem("uiStats"));
      return state || this.defaultUIStats;
    } catch (e) {
      console.error("Error loading UI state:", e);
      return null;
    }
  }

  getGameStats() {
    try {
      const state = JSON.parse(localStorage.getItem("gameStats"));
      return state || this.defaultGameStats;
    } catch (e) {
      console.error("Error loading game state:", e);
      return null;
    }
  }

  getPlayerStats() {
    try {
      const state = JSON.parse(localStorage.getItem("playerStats"));
      return state || this.defaultPlayerStats;
    } catch (e) {
      console.error("Error loading game state:", e);
      return null;
    }
  }

  getGameSettings() {
    try {
      const gameSettings = JSON.parse(localStorage.getItem("gameSettings"));
      return gameSettings || this.defaultSettingsStats;
    } catch (e) {
      console.error("Error loading game settings:", e);
      return null;
    }
  }

  getShopStats() {
    try {
      const state = JSON.parse(localStorage.getItem("shopStats"));
      return state || this.defaultShopStats;
    } catch (e) {
      console.error("Error loading game settings:", e);
      return null;
    }
  }

  getShopItems() {
    const defaultItems = [
      {
        id: "classic_faces",
        name: "Классические лица",
        type: "cardFace",
        styleClass: "classic-fup",
        price: 0,
        description: "Стандартный дизайн карт",
        previewStyle: "linear-gradient(135deg, #fff, #eee)",
      },
      {
        id: "cosmo_faces",
        name: "Космический стиль",
        type: "cardFace",
        styleClass: "cosmo-fup",
        price: 100,
        description: "Футуристический дизайн карт",
        previewStyle: "linear-gradient(135deg, #6e48aa, #9d50bb)",
      },
      // Другие предметы магазина...
    ];

    return JSON.parse(localStorage.getItem("shopItems")) || defaultItems;
  }

  getUnlockedAchievements() {
    try {
      return JSON.parse(localStorage.getItem("unlockedAchievements")) || [];
    } catch {
      return [];
    }
  }

  // потом
  getPurchasedItems() {
    try {
      return JSON.parse(localStorage.getItem("purchasedItems")) || [];
    } catch {
      return [];
    }
  }
  ///////////////////////////////////////////////////////////////////////////////

  /////////////////////////////// CLEARS /////////////////////////////////////////////////////
  clearGameStats() {
    localStorage.removeItem("gameStats");
  }

  clearSessionData() {
    sessionStorage.removeItem("gameSession");
  }

  // === Helpers ===
  clearAll() {
    localStorage.clear();
    sessionStorage.clear();
  }

  // === Shop & Inventory ===
  addPurchasedItem(itemId) {
    const purchased = this.getPurchasedItems();
    if (!purchased.includes(itemId)) {
      purchased.push(itemId);
      localStorage.setItem("purchasedItems", JSON.stringify(purchased));
    }
  }

  // === Coins Economy ===
  addCoins(amount) {
    const current = this.getCoins();
    localStorage.setItem("gameCoins", current + amount);
  }

  deductCoins(amount) {
    const current = this.getCoins();
    localStorage.setItem("gameCoins", Math.max(0, current - amount));
  }

  getCoins() {
    return parseInt(localStorage.getItem("gameCoins")) || 0;
  }

  loadSessionData() {
    return JSON.parse(sessionStorage.getItem("gameSession"));
  }

  migrateLegacyData() {
    // Перенос данных из старых версий при необходимости
    if (localStorage.getItem("legacyData")) {
      // Логика миграции...
      localStorage.removeItem("legacyData");
    }
  }

  // ... существующие методы ...

  // === Achievements ===
  addUnlockAchievement(achievementId) {
    const unlocked = this.getUnlockedAchievements();
    if (!unlocked.includes(achievementId)) {
      unlocked.push(achievementId);
      localStorage.setItem("unlockedAchievements", JSON.stringify(unlocked));

      // Обновляем счетчик в статистике
      const stats = this.loadPlayerStats();
      stats.achievementsUnlocked = unlocked.length;
      this.setPlayerStats(stats);
    }
  }
  ///////////////////////////////////////////////////////////////////////////////////////

  ////////////////////////////// SAVES ////////////////////////////////////////////////////
  // === UI State ===
  setUIStats(uiStats) {
    const storage = JSON.parse(localStorage.getItem("uiStats"));
    const settingsState = {
      ...storage,
      ...uiStats,
    };
    localStorage.setItem("uiStats", JSON.stringify(settingsState));
  }

  // === Game State ===
  setGameStats(gameStats) {
    try {
      localStorage.setItem("gameStats", JSON.stringify(gameStats));
      return true;
    } catch (e) {
      console.error("Error saving game state:", e);
      return false;
    }
  }

  // === Settings ===
  setGameSettings(settings) {
    const storage = JSON.parse(localStorage.getItem("gameSettings"));
    const settingsState = {
      ...storage,
      ...settings,
    };
    localStorage.setItem("gameSettings", JSON.stringify(settingsState));
  }

  setPlayerStats(stats) {
    const storage = JSON.parse(localStorage.getItem("playerStats"));
    // console.log("в setPlayerStats", storage);
    const playerStats = {
      ...storage,
      ...stats,
    };
    localStorage.setItem("playerStats", JSON.stringify(playerStats));
    // console.log("в setPlayerStats", playerStats);
  }

  setShopStats(stats) {
    const storage = JSON.parse(localStorage.getItem("shopStats"));
    const shopStats = {
      ...storage,
      ...stats,
    };
    localStorage.setItem("shopStats", JSON.stringify(shopStats));
  }

  // === Session Data ===
  saveSessionData(data) {
    sessionStorage.setItem("gameSession", JSON.stringify(data));
  }
  /////////////////////////////////////////////////////////////////////////////////
}
