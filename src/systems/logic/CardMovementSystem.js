import { GameEvents } from "../../utils/Constants.js";

export class CardMovementSystem {
  constructor(eventManager, stateManager, audioManager) {
    this.eventManager = eventManager;
    this.stateManager = stateManager;
    this.audioManager = audioManager;
  }

  handleCardClick(card) {
    if (!card.faceUp || this.stateManager.state.game.isPaused) return;

    const gameComponents = this.stateManager.state.cardsComponents;
    console.log('gameComponents.foundations:', gameComponents.foundations);
    
    // Проверка foundation
    for (let i = 0; i < gameComponents.foundations.length; i++) {
      if (gameComponents.foundations[i].canAccept(card)) {
        this.eventManager.emit(GameEvents.CARD_TO_FOUNDATION, {
          card,
          foundationIndex: i,
        });
        return;
      }
    }

    // Проверка tableau
    for (let i = 0; i < gameComponents.tableaus.length; i++) {
      if (gameComponents.tableaus[i].canAccept(card)) {
        this.eventManager.emit(GameEvents.CARD_TO_TABLEAU, {
          card,
          tableauIndex: i,
        });
        return;
      }
    }

    this.audioManager.play(AudioName.INFO);
  }

  getCardSource(card) {
    if (card.positionData.parent.includes("tableau")) {
      return `tableau-${card.positionData.index}`;
    } else if (card.positionData.parent.includes("foundation")) {
      return `foundation-${card.positionData.index}`;
    }
    return "waste";
  }

  getElementFrom(source) {
    if (source.startsWith("tableau")) {
      const index = parseInt(source.split("-")[1]);
      return this.stateManager.state.cardsComponents.tableaus[index];
    } else if (source.startsWith("foundation")) {
      const index = parseInt(source.split("-")[1]);
      return this.stateManager.state.cardsComponents.foundations[index];
    } else if (source === "waste") {
      // this.stateManager.state.cardsComponents.waste.removeCurrentCard(card);
      // this.stateManager.state.cardsComponents.stock.removeCurrentCard(card);
      return this.stateManager.state.cardsComponents.waste;
    }
  }

  removeCardFromSource(card, source, elementFrom) {
    // ... реализация аналогична оригиналу
    if (source.startsWith("tableau")) {
      return elementFrom.removeCardsFrom(card);
    } else if (source.startsWith("foundation")) {
      return elementFrom.removeTopCard();
    } else if (source === "waste") {
      return elementFrom.removeTopCard(card);
    }
  }

  openNextCardIfNeeded(source, backStyle, faceStyle) {
    // ... реализация аналогична оригиналу
    if (!source.startsWith("tableau")) return;

    const index = parseInt(source.split("-")[1]);

    const tableau = this.stateManager.state.cardsComponents.tableaus[index];
    const card = tableau.getTopCard();
    if (card && !card.faceUp) {
      card.flip();
      this.eventManager.emit(GameEvents.CARD_FLIP, {
        card,
        backStyle,
        faceStyle,
      });
      // const score = GameConfig.rules.scoreForCardFlip;
      this.stateManager.incrementStat("cardsFlipped");
      // this.stateManager.updateScore(this.calculatePoints(score));
      this.eventManager.emit(GameEvents.AUDIO_CARD_FLIP);
      // this.eventManager.emit(
      //   GameEvents.UI_ANIMATION_POINTS_EARNED,
      //   card,
      //   score
      // );
      return card;
    }
  }
}
