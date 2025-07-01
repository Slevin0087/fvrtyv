import { GameEvents } from "../utils/Constants.js";

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

    console.log("ДО ВЫЗОВА СОБЫТИЯ GameEvents.ANIMATE_CARD_MOVE", animateData);

    this.eventManager.emit(GameEvents.ANIMATE_CARD_MOVE, card, animateData);
    console.log(
      "ПОСЛЕ ВЫЗОВА СОБЫТИЯ GameEvents.ANIMATE_CARD_MOVE",
      animateData
    );
    // Удаляем карту из исходного места
    const removedCards = this.removeCardFromSource(card, source);
    console.log("ПОСЛЕ УДАЛЕНИЯ КАРТЫ ИЗ МАССИВ-КОНТЕЙНЕРА", animateData);

    // Добавляем в tableau
    removedCards.length > 1
      ? tableauTo.addCards(removedCards)
      : tableauTo.addCard(card);

    console.log("ПОСЛЕ ДОБАВЛЕНИЯ В tableauTo", animateData);
    // Рендер/Обновление карт

    // Обновляем очки
    // const points = this.calculatePoints(GameConfig.rules.scoreForTableauMove);
    // this.stateManager.updateScore(points);
    const backClass =
      this.stateManager.state.player.selectedItems.backs.styleClass;
    const faceClass =
      this.stateManager.state.player.selectedItems.faces.styleClass;
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
}
