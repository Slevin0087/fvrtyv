export class HintsOfObviousMoves {
  constructor(eventManager, stateManager) {
    this.eventManager = eventManager;
    this.stateManager = stateManager;
    this.hints = [];
  }

  getHints() {
    this.hints = [];
    
    // ПРИОРИТЕТ 1: Открытие закрытых карт
    this.hints.push(...this.getUncoverHiddenCardsHints());
    
    // Если нет подсказок по открытию, ищем другие варианты
    if (this.hints.length === 0) {
      this.hints.push(...this.getDirectFoundationMoves());
      this.hints.push(...this.getStrategicMoves());
      this.hints.push(...this.getStockHint());
    }
    
    return this.sortHintsByPriority(this.hints);
  }

  // ПРИОРИТЕТ 1: Открытие закрытых карт
  getUncoverHiddenCardsHints() {
    const hints = [];
    const tableaus = this.stateManager.state.cardsComponents.tableaus;
    
    // Собираем все открытые карты, которые блокируют закрытые
    const blockedOpenCards = this.getAllBlockedOpenCards();
    
    // Сортируем по "ценности" - сначала карты ближе к низу (более заблокированные)
    blockedOpenCards.sort((a, b) => b.blockageLevel - a.blockageLevel);
    
    for (const blockedCardInfo of blockedOpenCards) {
      const { card, tableau, blockageLevel } = blockedCardInfo;
      
      // Проверяем все возможные ходы для этой карты
      const cardHints = this.getHintsForBlockedCard(card, tableau, blockageLevel);
      hints.push(...cardHints);
      
      // Если нашли подсказки для этой карты, добавляем и переходим к следующей
      if (cardHints.length > 0) {
        break;
      }
    }
    
    return hints;
  }

  // Получить все открытые карты, которые блокируют закрытые
  getAllBlockedOpenCards() {
    const blockedCards = [];
    const tableaus = this.stateManager.state.cardsComponents.tableaus;
    
    tableaus.forEach(tableau => {
      const cards = tableau.cards || [];
      let hasFaceDownBelow = false;
      
      // Идем снизу вверх
      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        
        if (card.faceUp === false) {
          hasFaceDownBelow = true;
        }
        
        if (card.faceUp === true && hasFaceDownBelow) {
          // Эта открытая карта блокирует закрытые снизу
          const blockageLevel = this.calculateBlockageLevel(tableau, i);
          blockedCards.push({
            card,
            tableau,
            index: i,
            blockageLevel
          });
        }
      }
    });
    
    return blockedCards;
  }

  // Рассчитать уровень блокировки (чем больше карт сверху - тем ниже приоритет)
  calculateBlockageLevel(tableau, cardIndex) {
    const cards = tableau.cards || [];
    return cards.length - cardIndex - 1; // Количество карт над этой
  }

  // Получить подсказки для заблокированной карты
  getHintsForBlockedCard(card, tableau, blockageLevel) {
    const hints = [];
    
    // ШАГ 1: Проверить можно ли переместить в foundations
    const foundationHints = this.checkFoundationMove(card, tableau);
    if (foundationHints.length > 0) {
      return foundationHints.map(hint => ({
        ...hint,
        priority: 100 - blockageLevel, // Чем меньше блокировка - тем выше приоритет
        description: `Положить ${card} в дом чтобы освободить скрытые карты`
      }));
    }
    
    // ШАГ 2: Проверить можно ли переместить в другой tableau
    const tableauHints = this.checkTableauMove(card, tableau);
    if (tableauHints.length > 0) {
      return tableauHints.map(hint => ({
        ...hint,
        priority: 90 - blockageLevel,
        description: `Переместить ${card} в другой столбец чтобы освободить скрытые карты`
      }));
    }
    
    // ШАГ 3: Проверить можно ли переместить стопкой
    const sequenceHints = this.checkSequenceMove(card, tableau);
    if (sequenceHints.length > 0) {
      return sequenceHints.map(hint => ({
        ...hint,
        priority: 80 - blockageLevel,
        description: `Переместить последовательность с ${card} чтобы освободить скрытые карты`
      }));
    }
    
    // ШАГ 4: Если карта не последняя, найти ходы чтобы она стала последней
    if (!this.isLastCard(tableau, card)) {
      const makeLastHints = this.getHintsToMakeCardLast(card, tableau);
      hints.push(...makeLastHints);
    }
    
    return hints;
  }

  // Проверить перемещение в foundations
  checkFoundationMove(card, fromTableau) {
    const hints = [];
    const foundations = this.stateManager.state.cardsComponents.foundations;
    
    foundations.forEach(foundation => {
      if (foundation.canAccept(card, this.stateManager.state.cardsComponents)) {
        hints.push(this.createHint(
          fromTableau,
          card,
          foundation,
          foundation.getTopCard(),
          95,
          `Положить ${card} в дом`
        ));
      }
    });
    
    return hints;
  }

  // Проверить перемещение в другой tableau
  checkTableauMove(card, fromTableau) {
    const hints = [];
    const tableaus = this.stateManager.state.cardsComponents.tableaus;
    
    tableaus.forEach(targetTableau => {
      if (targetTableau !== fromTableau && targetTableau.canAccept(card)) {
        hints.push(this.createHint(
          fromTableau,
          card,
          targetTableau,
          targetTableau.getTopCard(),
          85,
          `Переместить ${card} в другой столбец`
        ));
      }
    });
    
    return hints;
  }

  // Проверить перемещение стопкой
  checkSequenceMove(startCard, fromTableau) {
    const hints = [];
    const movableSequence = this.getMovableSequence(fromTableau, startCard);
    
    if (movableSequence.length <= 1) return hints; // Только одна карта - не последовательность
    
    const tableaus = this.stateManager.state.cardsComponents.tableaus;
    const movingCard = movableSequence[0]; // Первая карта последовательности
    
    tableaus.forEach(targetTableau => {
      if (targetTableau !== fromTableau && targetTableau.canAccept(movingCard)) {
        hints.push(this.createHint(
          fromTableau,
          movingCard,
          targetTableau,
          targetTableau.getTopCard(),
          80,
          `Переместить последовательность (${movableSequence.length} карт) с ${movingCard}`
        ));
      }
    });
    
    return hints;
  }

  // Получить перемещаемую последовательность начиная с карты
  getMovableSequence(tableau, startCard) {
    const cards = tableau.cards || [];
    const startIndex = cards.indexOf(startCard);
    if (startIndex === -1) return [];
    
    const sequence = [cards[startIndex]];
    
    // Проверяем карты выше (большие индексы)
    for (let i = startIndex + 1; i < cards.length; i++) {
      const currentCard = cards[i];
      const previousCard = cards[i - 1];
      
      if (this.isValidSequence(previousCard, currentCard)) {
        sequence.push(currentCard);
      } else {
        break;
      }
    }
    
    return sequence;
  }

  // Проверить является ли карта последней в tableau
  isLastCard(tableau, card) {
    const cards = tableau.cards || [];
    return cards.length > 0 && cards[cards.length - 1] === card;
  }

  // Получить подсказки чтобы сделать карту последней
  getHintsToMakeCardLast(card, tableau) {
    const hints = [];
    const cards = tableau.cards || [];
    const cardIndex = cards.indexOf(card);
    
    if (cardIndex === -1 || cardIndex === cards.length - 1) return hints;
    
    // Карты над целевой картой
    const cardsAbove = cards.slice(cardIndex + 1);
    const topCardToMove = cardsAbove[0]; // Самая нижняя из карт над целевой
    
    // ШАГ 4.1: Проверить можно ли переместить в foundations став последней
    const foundationResult = this.checkFoundationMoveIfLast(topCardToMove, tableau, card);
    if (foundationResult.length > 0) {
      hints.push(...foundationResult);
    }
    
    // ШАГ 4.2: Проверить можно ли переместить в tableau став последней
    if (hints.length === 0) {
      const tableauResult = this.checkTableauMoveIfLast(topCardToMove, tableau, card);
      hints.push(...tableauResult);
    }
    
    return hints;
  }

  checkFoundationMoveIfLast(movingCard, tableau, targetCard) {
    const hints = [];
    const foundations = this.stateManager.state.cardsComponents.foundations;
    
    foundations.forEach(foundation => {
      if (foundation.canAccept(movingCard, this.stateManager.state.cardsComponents)) {
        hints.push(this.createHint(
          tableau,
          movingCard,
          foundation,
          foundation.getTopCard(),
          75,
          `Положить ${movingCard} в дом чтобы освободить ${targetCard}`
        ));
      }
    });
    
    return hints;
  }

  checkTableauMoveIfLast(movingCard, fromTableau, targetCard) {
    const hints = [];
    const tableaus = this.stateManager.state.cardsComponents.tableaus;
    
    tableaus.forEach(targetTableau => {
      if (targetTableau !== fromTableau && targetTableau.canAccept(movingCard)) {
        hints.push(this.createHint(
          fromTableau,
          movingCard,
          targetTableau,
          targetTableau.getTopCard(),
          70,
          `Переместить ${movingCard} чтобы освободить ${targetCard}`
        ));
      }
    });
    
    return hints;
  }

  // Другие типы подсказок (если не нашли по открытию карт)
  getDirectFoundationMoves() {
    // Существующая логика перемещения в дом
    const hints = [];
    hints.push(...this.getWasteToFoundationHints());
    hints.push(...this.getTableauToFoundationHints());
    return hints;
  }

  getStrategicMoves() {
    // Стратегические ходы
    const hints = [];
    hints.push(...this.getTableauToTableauHints());
    hints.push(...this.getWasteToTableauHints());
    return hints;
  }

  getStockHint() {
    // Подсказка открыть новую карту
    const stock = this.stateManager.state.cardsComponents.stock;
    if (stock && stock.cards && stock.cards.length > 0) {
      return [this.createHint(
        null,
        null,
        stock,
        null,
        10,
        "Открыть новую карту из колоды"
      )];
    }
    return [];
  }

  // Вспомогательные методы
  isValidSequence(card1, card2) {
    const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    const card1Index = values.indexOf(card1.value);
    const card2Index = values.indexOf(card2.value);
    
    return card1Index === card2Index - 1 && card1.color !== card2.color;
  }

  createHint(fromContainer, fromCard, toContainer, toCard, priority, description) {
    return {
      fromContainer,
      fromCard,
      toContainer,
      toCard,
      priority,
      description
    };
  }

  sortHintsByPriority(hints) {
    return hints.sort((a, b) => b.priority - a.priority);
  }

  // Существующие методы
  // getWasteToFoundationHints() { /* ... */ }
  getTableauToFoundationHints() { /* ... */ }
  getTableauToTableauHints() { /* ... */ }
  getWasteToTableauHints() { /* ... */ }
// }


// export class HintsOfObviousMoves {
//   constructor(eventManager, stateManager) {
//     this.eventManager = eventManager;
//     this.stateManager = stateManager;
//     this.hints = [];
//     this.setupEventListeners();
//   }

//   setupEventListeners() {
//     // Реализовать подписки на события
//   }

//   findAllFaceUpAfterFaceDown() {
//     const results = [];
//     const tableaus = this.stateManager.state.cardsComponents.tableaus;

//     tableaus.forEach((tableau, tableauIndex) => {
//       const cards = tableau.cards || [];

//       for (let i = 0; i < cards.length - 1; i++) {
//         if (cards[i].faceUp === false && cards[i + 1].faceUp === true) {
//           results.push({
//             tableau,
//             tableauIndex,
//             faceDownCard: cards[i],
//             firstFaceUpCard: cards[i + 1],
//             cardIndex: i,
//           });
//           break; // Только первую пару в каждом столбце
//         }
//       }
//     });

//     return results;
//   }

  // Основной публичный метод
  // getHints() {
  //   this.hints = [];

  //   // this.hints.push(...this.getWasteToFoundationHints());
  //   // this.hints.push(...this.getWasteToTableauHints());
  //   this.hints.push(...this.getTableauToFoundationHints());
  //   this.hints.push(...this.getTableauToTableauHints());

  //   return this.sortHintsByPriority(this.hints);
  // }

  // getTopHint() {
  //   return this.hints.pop();
  // }

  // Разделяем логику на маленькие методы
  getWasteToFoundationHints() {
    const hints = [];
    const wasteTopCard =
      this.stateManager.state.cardsComponents.waste.getTopCard();

    if (!wasteTopCard) return hints;

    if (wasteTopCard.value === "A") {
      const emptyFoundation = this.findEmptyFoundation();
      if (emptyFoundation) {
        hints.push(
          this.createHint(
            this.stateManager.state.cardsComponents.waste,
            wasteTopCard,
            emptyFoundation,
            null,
            100,
            `Положить ${wasteTopCard} в пустой дом`
          )
        );
      }
    } else {
      hints.push(
        ...this.getCardToNonEmptyFoundationHints(
          this.stateManager.state.cardsComponents.waste,
          wasteTopCard
        )
      );
    }

    return hints;
  }

  getWasteToTableauHints() {
    const hints = [];
    const wasteTopCard =
      this.stateManager.state.cardsComponents.waste.getTopCard();

    if (!wasteTopCard) return hints;

    this.stateManager.state.cardsComponents.tableaus.forEach((tableau) => {
      if (tableau.canAccept(wasteTopCard)) {
        const priority = wasteTopCard.value === "K" ? 100 : 90;
        hints.push(
          this.createHint(
            this.stateManager.state.cardsComponents.waste,
            wasteTopCard,
            tableau,
            tableau.getTopCard(),
            priority,
            `Положить ${wasteTopCard} в tableau`
          )
        );
      }
    });

    return hints;
  }
  // getTableauToFoundationHints() {
  //   const hints = [];
  //   const allFaceUpAfterFaceDown = this.findAllFaceUpAfterFaceDown();
  //   console.log("allFaceUpAfterFaceDown: ", allFaceUpAfterFaceDown);

  //   if (allFaceUpAfterFaceDown.length > 0) {
  //     allFaceUpAfterFaceDown.forEach((faceUpAfterFaceDown) => {
  //       const {
  //         tableau,
  //         tableauIndex,
  //         faceDownCard,
  //         firstFaceUpCard,
  //         cardIndex,
  //       } = faceUpAfterFaceDown;

  //       if (tableau.getTopCard() === firstFaceUpCard) {
  //         const cardsComponents = this.stateManager.state.cardsComponents;
  //         const foundations = cardsComponents.foundations;
  //         foundations.forEach((foundation) => {
  //           if (foundation.canAccept(firstFaceUpCard, cardsComponents)) {
  //             console.log("if (foundation.canAccept(: ", foundation);

  //             hints.push(
  //               this.createHint(
  //                 tableau,
  //                 firstFaceUpCard,
  //                 foundation,
  //                 foundation.getTopCard(),
  //                 90,
  //                 `Положить ${firstFaceUpCard} в дом`
  //               )
  //             );
  //           }
  //         });

  //         const tableaus = cardsComponents.tableaus;
  //         tableaus.forEach((tab) => {
  //           if (tab.canAccept(firstFaceUpCard)) {
  //             hints.push(
  //               this.createHint(
  //                 tableau,
  //                 firstFaceUpCard,
  //                 tab,
  //                 tab.getTopCard(),
  //                 90,
  //                 `Положить ${firstFaceUpCard} в tableau`
  //               )
  //             );
  //           }
  //         });
  //       }
  //     });
  //   }
  //   return hints;
  // }

  getTableauToFoundationHints() {
    const hints = [];
    const tableauTopCards = this.getTableausTopCards();

    // Aces to empty foundations
    const aces = tableauTopCards.filter(
      ({ tableauTopCard }) => tableauTopCard.value === "A"
    );

    if (aces.length > 0) {
      aces.forEach(({ tableau, tableauTopCard }) => {
        const emptyFoundation = this.findEmptyFoundation();
        if (emptyFoundation) {
          hints.push(
            this.createHint(
              tableau,
              tableauTopCard,
              emptyFoundation,
              null,
              100,
              `Положить ${tableauTopCard} в пустой дом`
            )
          );
        }
      });
    }

    // Non-aces to non-empty foundations
    const nonAces = tableauTopCards.filter(
      ({ tableauTopCard }) => tableauTopCard.value !== "A"
    );
    if (nonAces.length > 0) {
      nonAces.forEach(({ tableau, tableauTopCard }) => {
        hints.push(
          ...this.getCardToNonEmptyFoundationHints(tableau, tableauTopCard)
        );
      });
    }

    return hints;
  }

  // getTableauToTableauHints() {
  //   const hints = [];

  //   return hints
  // }

  getTableauToTableauHints() {
    const hints = [];
    const tableauTopCards = this.getTableausTopCards();

    tableauTopCards.forEach(({ tableau, tableauTopCard }) => {
      this.stateManager.state.cardsComponents.tableaus.forEach(
        (targetTableau) => {
          if (
            targetTableau !== tableau &&
            targetTableau.canAccept(tableauTopCard)
          ) {
            hints.push(
              this.createHint(
                tableau,
                tableauTopCard,
                targetTableau,
                targetTableau.getTopCard(),
                90,
                `Положить ${tableauTopCard} в tableau`
              )
            );
          }
        }
      );
    });

    return hints;
  }

  // Вспомогательные методы
  getCardToNonEmptyFoundationHints(fromContainer, card) {
    const hints = [];
    const nonEmptyFoundations =
      this.stateManager.state.cardsComponents.foundations.filter(
        (foundation) => !foundation.isEmpty()
      );

    nonEmptyFoundations.forEach((foundation) => {
      if (foundation.canAccept(card, this.stateManager.state.cardsComponents)) {
        hints.push(
          this.createHint(
            fromContainer,
            card,
            foundation,
            foundation.getTopCard(),
            90,
            `Положить ${card} в дом`
          )
        );
      }
    });

    return hints;
  }

  findEmptyFoundation() {
    return this.stateManager.state.cardsComponents.foundations.find(
      (foundation) => foundation.isEmpty()
    );
  }

  createHint(
    fromContainer,
    fromCard,
    toContainer,
    toCard,
    priority,
    description
  ) {
    return {
      fromContainer,
      fromCard,
      toContainer,
      toCard,
      priority,
      description,
    };
  }

  sortHintsByPriority(hints) {
    return hints.sort((a, b) => b.priority - a.priority);
  }

  getTableausTopCards() {
    const tableauTopCards = [];
    const tableaus = this.stateManager.state.cardsComponents.tableaus;
    tableaus.forEach((tableau) => {
      const tableauTopCard = tableau.getTopCard();
      if (tableauTopCard) {
        tableauTopCards.push({ tableau, tableauTopCard });
      }
    });
    return tableauTopCards;
  }

  getFaceUpCardsInTableaus() {
    const faceUpCardsInTableaus = [];
    const tableaus = this.stateManager.state.cardsComponents.tableaus;
    tableaus.forEach((tableau) => {
      tableau.cards?.forEach((card) => {
        if (card.faceUp) faceUpCardsInTableaus.push({ tableau, card });
      });
    });
    return faceUpCardsInTableaus;
  }
}
