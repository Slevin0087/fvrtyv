import { GameEvents } from "../../utils/Constants.js";

export class HintsOfObviousMoves {
  constructor(eventManager, stateManager) {
    this.eventManager = eventManager;
    this.stateManager = stateManager;
    this.state = this.stateManager.state;
    this.faceUpCardsInTableaus = [];
    this.setupEventListeners();
  }

  setupEventListeners() {
    // this.eventManager.on(GameEvents)
  }

  getFaceUpCardsInTableaus() {
    const tableaus = this.state.cardsComponents.tableaus;
    console.log("HintsOfObviousMoves tableaus: ", tableaus);
    tableaus.forEach(tableau => {
      tableau.cards?.forEach(card => {
        if (card.faceUp) return this.faceUpCardsInTableaus.push(card)
      });
    });
    return this.faceUpCardsInTableaus;
  }

  canAcceptForFoundations(card) {
    const foundations = this.state.cardsComponents.foundations
    
  }
}
