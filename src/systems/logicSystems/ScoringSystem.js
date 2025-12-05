import { GameEvents } from "../../utils/Constants.js";

export class ScoringSystem {
  constructor(eventManager, stateManager, gameModesManager) {
    this.eventManager = eventManager;
    this.stateManager = stateManager;
    this.gameModesManager = gameModesManager;

    this.setupEventListeners();
  }

  setupEventListeners() {
    this.eventManager.on(GameEvents.ADD_POINTS, (points) =>
      this.addPoints(points)
    );
  }

  addPoints(score) {
    // const calculated = this.calculatePointsWithDealingCards(score);
    this.stateManager.updateScore(score);
    return score;
  }

  calculatePoints(score) {
    const { difficulty } = this.stateManager.state.game;
    const multiplier = {
      easy: 1.2,
      normal: 1.0,
      hard: 0.8,
    }[difficulty];
    return Math.round(score * multiplier);
  }

  calculatePointsWithDealingCards(score, cardValue, operator = "+") {
    const scoreUp = this.getPoints(cardValue) + score;
    console.log('scoreUp: ', scoreUp);
    
    const dealingCards = this.stateManager.getDealingCards();
    const resultScore = Math.round(scoreUp * dealingCards)
    return operator === "+" ? resultScore : -resultScore;
  }

  getPoints(value) {
    const pointsMap = {
      "A": 1,
      "2": 2,
      "3": 3,
      "4": 4,
      "5": 5,
      "6": 6,
      "7": 7,
      "8": 8,
      "9": 9,
      "10": 10,
      "J": 10,
      "Q": 10,
      "K": 10,
    };
    return pointsMap[value] || 0;
  }
}
