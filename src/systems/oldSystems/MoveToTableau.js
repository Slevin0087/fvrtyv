import { GameEvents } from "../../utils/Constants.js";
import { GameConfig } from "../../configs/GameConfig.js";

export class MoveCardToTableau {
  constructor(eventManager, stateManager) {
    this.eventManager = eventManager;
    this.stateManager = stateManager;
  }

  move(data) {
    const { card, tableauIndex } = data;
    const tableauTo =
      this.stateManager.state.cardsComponents.tableaus[tableauIndex];
    // Определяем откуда взята карта
    const source = this.getCardSource(card);

    // Запоминаем ход для возможной отмены
    this.stateManager.updateLastMove({
      card,
      from: source,
      to: `tableau-${tableauIndex}`,
    });

    const index = parseInt(source.split("-")[1]);
    const elementFrom = this.stateManager.state.cardsComponents.tableaus[index];

    this.eventManager.emit(
      GameEvents.ANIMATE_CARD_MOVE,
      card,
      elementFrom,
      tableauTo
    );

    // Удаляем карту из исходного места
    const removedCards = this.removeCardFromSource(card, source, elementFrom);
    // Добавляем в tableau
    removedCards.length > 1
      ? tableauTo.addCards(removedCards)
      : tableauTo.addCard(card);

    // Рендер/Обновление карт

    // Обновляем очки
    // const points = this.calculatePoints(GameConfig.rules.scoreForTableauMove);
    // this.stateManager.updateScore(points);
    const backClass =
      this.stateManager.state.player.selectedItems.backs.styleClass;
    const faceClass =
      this.stateManager.state.player.selectedItems.faces.styleClass;
    console.log("this.openNextCard:", this.openNextCard);

    this.openNextCardIfNeeded(source, backClass, faceClass);
    // this.eventManager.emit(GameEvents.CARD_MOVED);
    // this.audioManager.play("cardPlace");
  }

  getCardSource(card) {
    // Определяем откуда взята карта (tableau, foundation, waste)
    if (card.positionData.parent.includes("tableau")) {
      return `tableau-${card.positionData.index}`;
    } else if (card.positionData.parent.includes("foundation")) {
      return `foundation-${card.positionData.index}`;
    } else {
      return "waste";
    }
  }

  removeCardFromSource(card, source, elementFrom) {
    if (source.startsWith("tableau")) {
      return elementFrom.removeCardsFrom(card);
    } else if (source.startsWith("foundation")) {
      return elementFrom.removeTopCard();
    } else if (source === "waste") {
      elementFrom.removeCurrentCard(card);
      // this.stateManager.state.cardsComponents.stock.removeCurrentCard(card);
      return card;
    }
  }

  openNextCardIfNeeded(source, backStyle, faceStyle) {
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
