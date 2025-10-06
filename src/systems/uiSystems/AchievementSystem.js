import { GameEvents } from "../../utils/Constants.js";
import { currency, AchievementsConfig } from "../../configs/AchievementsConfig.js";
import { Animator } from "../../utils/Animator.js";

export class AchievementSystem {
  constructor(eventManager, stateManager, storage) {
    this.eventManager = eventManager;
    this.stateManager = stateManager;
    this.state = this.stateManager.state;
    this.storage = storage;
    // this.achievements = this.loadAchievements();
    this.achievements = AchievementsConfig;
    this.isAchShow = false;
    this.showAchsQueue = [];
    this.init();
  }

  init() {
    this.setupEventListeners();

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
    console.log(
      "ВВВВВВВВВВВВВВВВВВВВВВВВ this.isAchShow, this.showAchsQueue:",
      this.isAchShow,
      this.showAchsQueue
    );

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
        a.life === "one" ? this.state.player : this.state.stateForAchievements;
      if (a.life === "one") {
        if (a.condition(state)) {
          state.achievements.unlocked.push(a.id);
          this.setActiveAchievement(a);
          this.storage.setPlayerStats(state);
          this.showAchievements(a);
          // this.eventManager.emit(GameEvents.UP_ACHIEVENT_DIV, a);
          // this.eventManager.emit(GameEvents.UP_ACHIEVENT_ICON, true);
          // if (a.currency === currency.SCORE) {
          //   this.eventManager.emit(GameEvents.ADD_POINTS, a.reward);
          //   this.eventManager.emit(GameEvents.UP_ACHIEVENT_SCORE_DIV);
          // }
        }
      } else if (a.life === "many") {
        if (a.condition(state)) {
          state.unlockedMany.push(a.id);
          this.setActiveAchievement(a, true);
          this.storage.setPlayerStats(state);
          this.showAchievements(a);
          console.log("ПОСЛЕ this.showAchievements(a)");

          // this.eventManager.emit(GameEvents.UP_ACHIEVENT_DIV, a);
          // this.eventManager.emit(GameEvents.UP_ACHIEVENT_ICON, true);
          // if (a.currency === currency.SCORE) {
          //   this.eventManager.emit(GameEvents.ADD_POINTS, a.reward);
          //   setTimeout(() => {
          //     this.eventManager.emit(GameEvents.UP_ACHIEVENT_SCORE_DIV);
          //   }, 2000);
          // }
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

  setActiveAchievement(a, many = false) {
    this.state.player.achievements.activeId = a.id;
    this.state.player.achievements.active = a;
    if (many) {
      this.state.stateForAchievements.activeId = a.id;
      this.state.stateForAchievements.active = a;
    }
  }

  showAchievements(a) {
    console.log("QQQQQQQQQQQQQQQQQQQQQQ");

    const showAchievement = async () => {
      this.isAchShow = true;

      // state.unlocked.push(a.id);
      // this.setActiveAchievement(state, a, statePlayer);
      // this.storage.setPlayerStats(state);
      const scoreEl = document.getElementById("points-in-game");
      const notifDiv = document.getElementById("notif-div");
      const achievementsIconEl = document.getElementById("achievements_span");
      const shows = [];
      shows.push(
        new Promise((resolve) => {
          Animator.animationTextAchievement(notifDiv, a);
          // Таймаут на duration анимации + немного
          setTimeout(resolve, 5500); // 5000ms + 500ms buffer
        })
      );
      shows.push(
        new Promise((resolve) => {
          this.eventManager.emit(GameEvents.UP_ACHIEVENT_ICON, true);

          Animator.animateAchievementText(achievementsIconEl);
          setTimeout(resolve, 2500); // duration анимации + buffer
        })
      );
      if (a.currency === currency.SCORE) {
        console.log("вввввввввввввв iiiiiiiiiiiiiiiiifffffffffffffffff");
        this.eventManager.emit(GameEvents.ADD_POINTS, a.reward);
        shows.push(
          new Promise((resolve) => {
            Animator.animateAchievementText(scoreEl);
            setTimeout(resolve, 2500);
          })
        );
      }

      console.log("до промисолл");

      await Promise.all(shows);
      console.log("после промисолл");

      this.isAchShow = false;
      this.processQueue();
    };
    this.addToQueue(showAchievement);
  }

  processQueue() {
    if (this.showAchsQueue.length > 0 && !this.isAchShow) {
      const nextShowAch = this.showAchsQueue.shift();
      nextShowAch();
    }
  }

  addToQueue(showAchievement) {
    this.showAchsQueue.push(showAchievement);
    console.log("this.showAchsQueue:", this.showAchsQueue);

    if (!this.isAchShow) {
      this.processQueue();
    }
  }
}
