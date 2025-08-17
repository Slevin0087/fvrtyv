import { GameEvents } from "../utils/Constants.js";
import { AchievementsConfig } from "../configs/AchievementsConfig.js";

export class AchievementSystem {
  constructor(eventManager, stateManager, storage) {
    this.eventManager = eventManager;
    this.stateManager = stateManager;
    this.storage = storage;
    // this.achievements = this.loadAchievements();
    this.achievements = AchievementsConfig;
    this.init();
  }

  init() {
    this.setupEventListeners();
    console.log('this.stogare:', this.stogare);
    
    // this.loadPlayerAchievements();
  }

  setupEventListeners() {
    this.eventManager.on(GameEvents.CHECK_WIN_ACHIEVEMENTS, () =>
      this.checkWinAchievements()
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

  checkWinAchievements() {
    const unlocked = this.storage.getPlayerStats().achievements.unlocked;
    const winAchievements = this.achievements.filter(a => a.type === "win");
    winAchievements.forEach(a => {
      unlocked.forEach(u => {
        if (a.id !== u && a.condition(this.stateManager.state.player)) {
          console.log('в checkWinAchievements():', a);
          
          alert("сработало что-то из достижений после выигрыша")
        }
      })
    })
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
    this.stateManager.player.stats.totalMoves++;
    // Проверка других достижений, связанных с ходами
    this.saveStats();
  }

  checkScoreAchievements(score) {
    if (score > this.stateManager.player.stats.highestScore) {
      this.stateManager.player.stats.highestScore = score;
      // Проверка достижений, связанных с очками
    }
    this.saveStats();
  }

  checkTimeAchievements(time) {
    this.stateManager.game.currentTime = time;
    // Проверка достижений, связанных со временем
  }

  checkAchievement(achievementId) {
    const achievement = this.achievements.find((a) => a.id === achievementId);
    if (!achievement || achievement.unlocked) return;

    const stats = this.stateManager.player.stats;
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
    this.storage.savePlayerStats(this.stateManager.player.stats);
  }
}
