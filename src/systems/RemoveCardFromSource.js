export class RemoveCardFromSource {
  constructor(eventManager, stateManager) {
    this.eventmanager = eventManager;
    this.stateManager = stateManager;
  }

  remove(card, source) {
    if (source.startsWith("tableau")) {
      const index = parseInt(source.split("-")[1]);
      return this.stateManager.state.currentGame.components.tableaus[
        index
      ].removeCardsFrom(card);
    } else if (source.startsWith("foundation")) {
      const index = parseInt(source.split("-")[1]);
      return this.stateManager.state.currentGame.components.foundations[
        index
      ].removeTopCard();
    } else if (source === "waste") {
      this.stateManager.state.currentGame.components.waste.removeCurrentCard(
        card
      );
      this.stateManager.state.currentGame.components.stock.removeCurrentCard(
        card
      );
      return card;
    }
  }
}
