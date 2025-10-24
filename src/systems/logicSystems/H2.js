export class H2 {
  constructor(eventManager, stateManager) {
    this.eventManager = eventManager;
    this.stateManager = stateManager;
    this.blockedCards = [];
    this.hints = [];
  }

  getHints() {
    this.hints = [];

    // Собираем все открытые карты, которые блокируют закрытые
    // const { tableauFirstBlockedCards, tableauAfterFirstBlockedCards } =
    //   this.getAllBlockedOpenCards();

    const blockedCards = this.getAllBlockedOpenCards();

    // if (tableauFirstBlockedCards.length > 0) {
    //   for (const blockedCard of blockedCards) {
    //     const { card, tableau, nextCards } = blockedCard;
    //     if (nextCards.length === 0) {
    //       tableauFirstBlockedCards.push(blockedCard);
    //     } else if (nextCards.length > 0) {
    //       tableauAfterFirstBlockedCards.push(blockedCard);
    //     }
    //   }

    this.hints.push(
      // ...this.getUncoverHiddenCardsHintsFirstOnes(tableauFirstBlockedCards)

      ...this.getUncoverHiddenCardsHintsFirstOnes(blockedCards)

    );

    // this.hints.push(
    //   ...this.getUncoverHiddenCardsHintsNextCardsOnes(
    //     tableauAfterFirstBlockedCards
    //   )
    // );
    // }

    // ПРИОРИТЕТ 1: Открытие закрытых карт

    return this.hints;
    // return { tableauFirstBlockedCards, tableauAfterFirstBlockedCards };

    // return blockedCards
  }

  // ПРИОРИТЕТ 1: Открытие закрытых карт
  getUncoverHiddenCardsHintsFirstOnes(tableauFirstBlockedCards) {
    const hints = [];

    for (const blockedCard of tableauFirstBlockedCards) {
      const { card, tableau, nextCards } = blockedCard;
      // Проверяем все возможные ходы для этой карты
      const cardHints = this.getHintsForBlockedCard(card, tableau, nextCards);
      hints.push(...cardHints);

      // Если нашли подсказки для этой карты, добавляем и переходим к следующей
      if (cardHints.length > 0) {
        break;
      }
    }

    return hints;
  }

  getUncoverHiddenCardsHintsNextCardsOnes(tableauAfterFirstBlockedCards) {
    const hints = [];

    for (const blockedCard of tableauAfterFirstBlockedCards) {
      const { card, tableau } = blockedCard;
    }
  }

  // Получить все открытые карты, которые блокируют закрытые
  getAllBlockedOpenCards() {
    // let tableauFirstBlockedCards = [];
    // let tableauAfterFirstBlockedCards = [];
    const blockedCards = [];
    const tableaus = this.stateManager.state.cardsComponents.tableaus;

    tableaus.forEach((tableau) => {
      const cards = tableau.cards || [];
      let hasFaceDownBelow = false;

      // Идем снизу вверх
      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];

        if (card.faceUp === false) {
          hasFaceDownBelow = true;
        }

        if (card.faceUp === true && hasFaceDownBelow) {
          if (card === tableau.getTopCard()) {
            // tableauFirstBlockedCards.push({
            //   card,
            //   tableau,
            //   index: i,
            //   nextCards: [],
            // });

            blockedCards.push({
              card,
              tableau,
              index: i,
              nextCards: [],
            });
          } else if (card !== tableau.getTopCard()) {
            // Эта открытая карта блокирует закрытые снизу
            // const blockageLevel = this.calculateBlockageLevel(tableau, i);

            // tableauAfterFirstBlockedCards.push({
            //   card,
            //   tableau,
            //   index: i,
            //   nextCards: tableau.getFaceUpTopCards(card),
            // });

            blockedCards.push({
              card,
              tableau,
              index: i,
              nextCards: tableau.getFaceUpTopCards(card),
            });
          }
          break;
        }
      }
    });

    // return { tableauFirstBlockedCards, tableauAfterFirstBlockedCards };
    return blockedCards;
  }

  // Получить подсказки для заблокированной карты
  getHintsForBlockedCard(card, tableau, nextCards) {
    const hints = [];

    // ШАГ 1: Проверить можно ли переместить в foundations
    const foundationHints = this.checkFoundationMove(card, tableau);
    if (foundationHints.length > 0) {
      return foundationHints.map((hint) => ({
        ...hint,
        priority: 100, // Чем меньше блокировка - тем выше приоритет
        description: `Положить ${card} в дом чтобы освободить скрытые карты`,
      }));
    }

    // ШАГ 2: Проверить можно ли переместить в другой tableau
    const tableauHints = this.checkTableauMove(card, tableau, nextCards);
    if (tableauHints.length > 0) {
      return tableauHints.map((hint) => ({
        ...hint,
        priority: 90,
        description: `Переместить ${card} в другой столбец чтобы освободить скрытые карты`,
      }));
    }

    // // ШАГ 3: Проверить можно ли переместить стопкой
    // const sequenceHints = this.checkSequenceMove(card, tableau);
    // if (sequenceHints.length > 0) {
    //   return sequenceHints.map((hint) => ({
    //     ...hint,
    //     priority: 80,
    //     description: `Переместить последовательность с ${card} чтобы освободить скрытые карты`,
    //   }));
    // }

    // // ШАГ 4: Если карта не последняя, найти ходы чтобы она стала последней
    // if (!this.isLastCard(tableau, card)) {
    //   const makeLastHints = this.getHintsToMakeCardLast(card, tableau);
    //   hints.push(...makeLastHints);
    // }

    return hints;
  }

  // Проверить перемещение в foundations
  checkFoundationMove(card, fromTableau) {
    const hints = [];
    const foundations = this.stateManager.state.cardsComponents.foundations;

    foundations.forEach((foundation) => {
      if (foundation.canAccept(card, this.stateManager.state.cardsComponents)) {
        hints.push(
          this.createHint(
            fromTableau,
            card,
            foundation,
            foundation.getTopCard(),
            95,
            `Положить ${card} в дом`
          )
        );
      }
    });

    return hints;
  }

  // Проверить перемещение в другой tableau
  checkTableauMove(card, fromTableau, nextCards) {
    const hints = [];
    const tableaus = this.stateManager.state.cardsComponents.tableaus;

    tableaus.forEach((targetTableau) => {
      if (targetTableau !== fromTableau && targetTableau.canAccept(card)) {
        hints.push(
          this.createHint(
            fromTableau,
            card,
            nextCards,
            targetTableau,
            targetTableau.getTopCard(),
            85,
            `Переместить ${card} в другой столбец`
          )
        );
      }
    });

    return hints;
  }

  createHint(
    fromContainer,
    fromCard,
    fromCardNextCards = [],
    toContainer,
    toCard,
    priority,
    description
  ) {
    return {
      fromContainer,
      fromCard,
      fromCardNextCards,
      toContainer,
      toCard,
      priority,
      description,
    };
  }
}
