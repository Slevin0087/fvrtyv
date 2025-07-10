import { GameEvents, AudioName } from "../../utils/Constants.js";
import { GameConfig } from "../../configs/GameConfig.js";

export class CardMovementSystem {
  constructor(eventManager, stateManager, audioManager) {
    this.eventManager = eventManager;
    this.stateManager = stateManager;
    this.audioManager = audioManager;
    this.cardContainers = GameConfig.cardContainers;
  }

  handleCardClick(card) {
    if (!card.faceUp || this.stateManager.state.game.isPaused) return false;

    const gameComponents = this.stateManager.state.cardsComponents;
    // Проверка foundation
    for (let i = 0; i < gameComponents.foundations.length; i++) {
      if (gameComponents.foundations[i].canAccept(card, gameComponents)) {
        this.audioManager.play(AudioName.CLICK);
        const containerTo = gameComponents.foundations[i];
        const containerToName = this.cardContainers.foundation;
        this.eventManager.emit(GameEvents.CARD_MOVE, {
          card,
          containerToIndex: i,
          containerTo,
          containerToName,
        });
        return;
      }
    }

    // Проверка tableau
    for (let i = 0; i < gameComponents.tableaus.length; i++) {
      if (gameComponents.tableaus[i].canAccept(card)) {
        this.audioManager.play(AudioName.CLICK);
        const containerTo = gameComponents.tableaus[i];
        const containerToName = this.cardContainers.tableau;
        this.eventManager.emit(GameEvents.CARD_MOVE, {
          card,
          containerToIndex: i,
          containerTo,
          containerToName,
        });
        return;
      }
    }

    this.audioManager.play(AudioName.INFO);
    return false;
  }

  getCardSource(card) {
    if (card.positionData.parent.includes(this.cardContainers.tableau)) {
      return `${this.cardContainers.tableau}-${card.positionData.index}`;
    } else if (
      card.positionData.parent.includes(this.cardContainers.foundation)
    ) {
      return `${this.cardContainers.foundation}-${card.positionData.index}`;
    } else if (card.positionData.parent.includes(this.cardContainers.stock)) {
      return `${this.cardContainers.stock}-${card.positionData.index}`;
    }
    return this.cardContainers.waste;
  }

  getElementFrom(source) {
    if (source.startsWith(this.cardContainers.tableau)) {
      const index = parseInt(source.split("-")[1]);
      return this.stateManager.state.cardsComponents.tableaus[index];
    } else if (source.startsWith(this.cardContainers.foundation)) {
      const index = parseInt(source.split("-")[1]);
      return this.stateManager.state.cardsComponents.foundations[index];
    } else if (source.startsWith(this.cardContainers.stock)) {
      return this.stateManager.state.cardsComponents.stock;
    } else if (source.startsWith(this.cardContainers.waste)) {
      // this.stateManager.state.cardsComponents.waste.removeCurrentCard(card);
      // this.stateManager.state.cardsComponents.stock.removeCurrentCard(card);
      return this.stateManager.state.cardsComponents.waste;
    }
  }

  removeCardFromSource(card, source, elementFrom) {
    // ... реализация аналогична оригиналу
    if (source.startsWith(this.cardContainers.tableau)) {
      return elementFrom.removeCardsFrom(card);
    } else if (source.startsWith(this.cardContainers.foundation)) {
      return [elementFrom.removeTopCard()];
    } else if (source.startsWith(this.cardContainers.stock)) {
      return [elementFrom.removeTopCard(card)];
    } else if (source.startsWith(this.cardContainers.waste)) {
      return [elementFrom.removeTopCard(card)];
    }
  }

  openNextCardIfNeeded(source) {
    if (!source.startsWith(this.cardContainers.tableau)) return null;

    const index = parseInt(source.split("-")[1]);

    const tableau = this.stateManager.state.cardsComponents.tableaus[index];
    const card = tableau.getTopCard();
    if (card && !card.faceUp) {
      card.flip();
      this.eventManager.emit(GameEvents.CARD_FLIP, card);
      this.stateManager.incrementStat("cardsFlipped");
      return card;
    }
  }
}
