import { GameEvents } from "../../utils/Constants.js";

export class ScoringSystem {
  constructor(eventManager, stateManager) {
    this.eventManager = eventManager;
    this.stateManager = stateManager;

    this.setupEventListeners();
  }

  setupEventListeners() {
    this.eventManager.on(GameEvents.ADD_POINTS, (points) =>
      this.addPoints(points)
    );
  }

  addPoints(points) {
    // const calculated = this.calculatePoints(points);
    const calculated = this.calculatePointsWithDealingCards(points);
    this.stateManager.updateScore(calculated);
    return calculated;
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

    calculatePointsWithDealingCards(score) {
    const dealingCards = this.stateManager.state.dealingCards;

    return Math.round(score * dealingCards);
  }
}
