export class OpenNextCard {
  constructor(eventManager, stateManager) {
    this.eventManager = eventManager;
    this.stateManager = stateManager;
  }

  open(source, backClass, faceClass) {
    if (!source.startsWith("tableau")) return;

    const index = parseInt(source.split("-")[1]);

    const tableau =
      this.stateManager.state.currentGame.components.tableaus[index];
    const topCard = tableau.getTopCard();
    if (topCard && !topCard.faceUp) {
      topCard.flip();
      this.eventManager.emit(
        GameEvents.CARD_FLIP,
        topCard,
        backClass,
        faceClass
      );
      const score = GameConfig.rules.scoreForCardFlip;
      this.stateManager.incrementStat("cardsFlipped");
      this.stateManager.updateScore(this.calculatePoints(score));
      this.eventManager.emit(GameEvents.AUDIO_CARD_FLIP);
      this.eventManager.emit(
        GameEvents.UI_ANIMATION_POINTS_EARNED,
        topCard,
        score
      );
      return topCard;
    }
  }
}
