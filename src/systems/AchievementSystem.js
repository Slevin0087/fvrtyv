import { GameEvents } from "../utils/Constants.js";
import { currency, AchievementsConfig } from "../configs/AchievementsConfig.js";

export class AchievementSystem {
  constructor(eventManager, stateManager, storage) {
    this.eventManager = eventManager;
    this.stateManager = stateManager;
    this.state = this.stateManager.state;
    this.storage = storage;
    // this.achievements = this.loadAchievements();
    this.achievements = AchievementsConfig;
    this.init();
  }

  init() {
    this.setupEventListeners();
    console.log("this.stogare:", this.stogare);

    // this.loadPlayerAchievements();
  }

  setupEventListeners() {
    this.eventManager.on(GameEvents.CHECK_GET_ACHIEVEMENTS, (type) =>
      this.checkAchievements(type)
    );
    this.eventManager.on("game:move", (moveData) =>
      this.checkMoveAchievements(moveData)
    );
    this.eventManager.on("game:score", (score) =>
      this.checkScoreAchievements(score)
    );
    this.eventManager.on("game:time", (time) =>
      this.checkTimeAchievements(time)
    );
  }

  loadAchievements() {
    return [
      {
        id: "first_win",
        title: "Первая победа",
        description: "Выиграйте первую игру",
        reward: 50,
        condition: (stats) => stats.wins >= 1,
        unlocked: false,
      },
      {
        id: "fast_win",
        title: "Скоростная игра",
        description: "Выиграйте менее чем за 5 минут",
        reward: 100,
        condition: (stats) => stats.fastestWin <= 300,
        unlocked: false,
      },
      // Другие достижения...
    ];
  }

  loadPlayerAchievements() {
    const unlocked = this.storage.getUnlockedAchievements();
    this.achievements.forEach((ach) => {
      ach.unlocked = unlocked.includes(ach.id);
    });
  }

  checkAchievements(type) {
    const playerState = this.storage.getPlayerStats();
    const { unlocked } = playerState.achievements;
    const { unlockedMany } = this.state.stateForAchievements;
    const achievementsFilter = this.achievements.filter(
      (a) =>
        a.type === type &&
        !unlocked.includes(a.id) &&
        !unlockedMany.includes(a.id)
    );
    console.log("achievementsFilter:", achievementsFilter);
    achievementsFilter.map((a) => {
      const state =
        a.life === "one"
          ? this.state.player
          : this.state.stateForAchievements;
      if (a.life === "one") {
        if (a.condition(state)) {
          state.achievements.unlocked.push(a.id);
          this.setActiveAchievement(state, a);
          this.storage.setPlayerStats(state);
          this.eventManager.emit(GameEvents.UP_ACHIEVENT_DIV, a);
          this.eventManager.emit(GameEvents.UP_ACHIEVENT_ICON, true);
          if (a.currency === currency.SCORE) {
            this.eventManager.emit(GameEvents.ADD_POINTS, a.reward);
            this.eventManager.emit(GameEvents.UP_ACHIEVENT_SCORE_DIV);
          }
        }
      } else if (a.life === "many") {
        if (a.condition(state)) {
          state.unlockedMany.push(a.id);
          this.setActiveAchievement(state, a, this.state.player);
          this.storage.setPlayerStats(state);
          this.eventManager.emit(GameEvents.UP_ACHIEVENT_DIV, a);
          this.eventManager.emit(GameEvents.UP_ACHIEVENT_ICON, true);
          if (a.currency === currency.SCORE) {
            console.log("вввввввввввввв iiiiiiiiiiiiiiiiifffffffffffffffff");
            this.eventManager.emit(GameEvents.ADD_POINTS, a.reward);
            setTimeout(() => {
              this.eventManager.emit(GameEvents.UP_ACHIEVENT_SCORE_DIV);
            }, 2000);
          }
        }
      }
    });
    return achievementsFilter; // Возвращаем полученные достижения
  }

  // checkWinAchievements() {
  //   this.stateManager.player.stats.wins++;
  //   this.checkAchievement("first_win");

  //   if (
  //     this.stateManager.game.currentTime <
  //     this.stateManager.player.stats.fastestWin
  //   ) {
  //     this.stateManager.player.stats.fastestWin =
  //       this.stateManager.game.currentTime;
  //     this.checkAchievement("fast_win");
  //   }

  //   this.saveStats();
  // }

  checkMoveAchievements(moveData) {
    this.player.stats.totalMoves++;
    // Проверка других достижений, связанных с ходами
    this.saveStats();
  }

  checkScoreAchievements(score) {
    if (score > this.player.stats.highestScore) {
      this.player.stats.highestScore = score;
      // Проверка достижений, связанных с очками
    }
    this.saveStats();
  }

  checkTimeAchievements(time) {
    this.game.currentTime = time;
    // Проверка достижений, связанных со временем
  }

  checkAchievement(achievementId) {
    const achievement = this.achievements.find((a) => a.id === achievementId);
    if (!achievement || achievement.unlocked) return;

    const stats = this.player.stats;
    if (achievement.condition(stats)) {
      achievement.unlocked = true;
      this.storage.unlockAchievement(achievementId);
      this.eventManager.emit("achievement:unlocked", achievement);

      if (achievement.reward) {
        this.eventManager.emit("shop:coins:add", achievement.reward);
      }
    }
  }

  saveStats() {
    this.storage.savePlayerStats(this.player.stats);
  }

  setActiveAchievement(state, a, otherState = null) {
    console.log("в setActiveAchievement:", state);
    if (otherState) {
      this.state.player.achievements.activeId = a.id;
      this.state.player.achievements.active = a;
    } else if (otherState === null) {
      state.achievements.activeId = a.id;
      state.achievements.active = a;
    }
  }
}
