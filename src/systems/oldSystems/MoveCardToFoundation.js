import { GameEvents } from "../../utils/Constants.js";
import { GameConfig } from "../../configs/GameConfig.js";

export class MoveCardToFoundation {
  constructor(eventManager, stateManager) {
    this.eventManager = eventManager;
    this.stateManager = stateManager;
  }

  move(data) {
    const { card, foundationIndex } = data;
    const foundationTo =
      this.stateManager.state.cardsComponents.foundations[foundationIndex];
    // Определяем откуда взята карта
    const source = this.getCardSource(card);
    // Запоминаем ход для возможной отмены
    this.stateManager.updateLastMove({
      card,
      from: source,
      to: `foundation-${foundationIndex}`,
    });

    let elementFrom = null;

    if (source.startsWith("tableau")) {
      const index = parseInt(source.split("-")[1]);
      elementFrom = this.stateManager.state.cardsComponents.tableaus[index];
    } else if (source.startsWith("foundation")) {
      const index = parseInt(source.split("-")[1]);
      elementFrom = this.stateManager.state.cardsComponents.foundations[index];
    } else if (source === "waste") {
      // this.stateManager.state.cardsComponents.waste.removeCurrentCard(card);
      // this.stateManager.state.cardsComponents.stock.removeCurrentCard(card);
      elementFrom = this.stateManager.state.cardsComponents.waste;
    }

    // const index = parseInt(source.split("-")[1]);
    // const elementFrom = this.stateManager.state.cardsComponents.tableaus[index];

    // console.log('foundationTo, elementFrom:', foundationTo, elementFrom);

    this.eventManager.emit(
      GameEvents.ANIMATE_CARD_MOVE,
      card,
      elementFrom,
      foundationTo
    );

    // Удаляем карту из исходного места
    this.removeCardFromSource(card, source, elementFrom);
    // Добавляем в foundationTo
    foundationTo.addCard(card);

    this.stateManager.incrementStat("cardsToFoundation");

    // Обновляем очки
    // const points = this.calculatePoints(GameConfig.rules.scoreForFoundation);
    // this.stateManager.updateScore(points);

    // Рендер/Обновление карт
    // Открываем следующую карту в tableau, если нужно
    const backClass =
      this.stateManager.state.player.selectedItems.backs.styleClass;
    const faceClass =
      this.stateManager.state.player.selectedItems.faces.styleClass;
    this.openNextCardIfNeeded(source, backClass, faceClass);
    // this.eventManager.emit(GameEvents.CARD_MOVED);
    // setTimeout(() => {
    //   this.eventManager.emit(GameEvents.CARD_MOVED)
    // }, 1000);
    // this.audioManager.play("cardPlace");
    const score = GameConfig.rules.scoreForFoundation;
    this.eventManager.emit(GameEvents.UI_ANIMATION_POINTS_EARNED, card, score);
    // Проверяем победу
    if (this.winSystem.checkWinCondition()) {
      this.winSystem.handleWin();
      return;
    }
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

  openNextCardIfNeeded(source, cb, backStyle, faceStyle) {
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
      const score = GameConfig.rules.scoreForCardFlip;
      this.stateManager.incrementStat("cardsFlipped");
      cb(score);
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
