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
    const unlocked = playerState.achievements.unlocked;
    const achievements = this.achievements
      .filter((a) => a.type === type)
      .forEach((a) => {
        unlocked.forEach((u) => {
          if (a.id !== u) {
            console.log("в checkAchievements():", a);
            switch (type) {
              case "win":
                console.log('мы в switch case "win" a, u:', a, u);

                alert("сработало что-то из достижений после выигрыша");
                break;
              case "inGame":
                if (a.life === "one") {
                  const state = this.stateManager.state.player;
                  if (a.condition(state)) {
                    // unlocked.push(a.id);
                    this.setActiveAchievement(state, a);
                    this.eventManager.emit(GameEvents.UP_ACHIEVENT_ICON);
                    console.log("получено достижение:", a.title);
                  }
                } else if (a.life === "many") {
                  const state = this.stateManager.state.game;
                  if (a.condition(state)) {
                    this.setActiveAchievement(state, a);
                    this.eventManager.emit(GameEvents.UP_ACHIEVENT_ICON);
                    console.log("получено достижение:", a.title);
                  }
                }
                break;
              case "restartAndWin":
                break;
            }
          }
        });
      });
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

  setActiveAchievement(state, a) {
    state.achievements.activeId = a.id;
    state.achievements.active = a;
  }
}
