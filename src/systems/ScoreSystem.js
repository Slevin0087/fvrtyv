export class ScoreSyctem {
  constructor(eventManager, stateManager) {
    this.eventManager = eventManager;
    this.stateManager = stateManager;
  }

  calculatePoints(score) {
    const { difficulty } = this.stateManager.state.game;
    const multiplier = {
      easy: 1.2,
      normal: 1.0,
      hard: 0.8,
    }[difficulty];

    const resultScore = Math.round(score * multiplier);
    return resultScore;
  }
}
