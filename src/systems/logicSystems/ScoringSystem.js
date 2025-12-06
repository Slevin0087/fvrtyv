import { GameEvents } from "../../utils/Constants.js";
import { CardValues } from "../../configs/CardsConfigs.js";

export class ScoringSystem {
  constructor(eventManager, stateManager, gameModesManager) {
    this.eventManager = eventManager;
    this.stateManager = stateManager;
    this.gameModesManager = gameModesManager;
    this.pointsMap = this.initPointsMap();
    console.log("this.pointsMap: ", this.pointsMap);

    this.setupEventListeners();
  }

  setupEventListeners() {
    this.eventManager.on(GameEvents.ADD_POINTS, (score) =>
      this.addScores(score)
    );
  }

  initPointsMap() {
    const result = {};
    CardValues.forEach((value, index) => {
      result[value] = index + 1;
    });
    this.pointsMap = result;
    return this.pointsMap;
  }

  addScores(score) {
    this.stateManager.updateScore(score);
    return score;
  }

  subtractScores(score) {
    this.stateManager.downdateScore(score);
    return score;
  }

  calculateScoresWithDealingCards(score, cardValue) {
    const scoreUp = this.getPoints(cardValue) + score;
    const dealingCards = this.stateManager.getDealingCards();
    const resultScore = Math.round(scoreUp * dealingCards);
    return resultScore;
  }

  getPoints(value) {
    return this.pointsMap[value] || 0;
  }
}
