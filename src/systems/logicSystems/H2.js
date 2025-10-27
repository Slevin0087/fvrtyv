import { UIConfig } from "../../configs/UIConfig.js";
import { CardValues } from "../../utils/Constants.js";
import { GameEvents } from "../../utils/Constants.js";

export class H2 {
  constructor(eventManager, stateManager) {
    this.eventManager = eventManager;
    this.stateManager = stateManager;
    this.blockedCards = [];
    this.hints = [];
    this.cardVAlueKing = CardValues[CardValues.length - 1];
  }

  getHints() {
    this.hints = [];
    if (this.stateManager.getIsNoHints()) {
      this.hints.push(
        this.createHint(
          null,
          null,
          null,
          null,
          10,
          UIConfig.dataI18nValue.HINT_NO_HINTS
        )
      );
      return this.hints
    }

    // Собираем все открытые карты, которые блокируют закрытые
    const blockedCardsToCardsWithFaceDown = this.getAllBlockedOpenCards();

    // ПРИОРИТЕТ 1: Открытие закрытых карт
    this.hints.push(
      // ...this.getUncoverHiddenCardsHintsFirstOnes(tableauFirstBlockedCards)

      ...this.getUncoverHiddenCardsHintsFirstOnes(
        blockedCardsToCardsWithFaceDown
      )
    );

    if (this.hints.length === 0) {
      this.hints.push(...this.getHintsToCardFromWaste());
    }

    if (this.hints.length === 0) {
      const blockedCardsToFreeUpSpace = this.getAllBlockedCardsToFreeUpSpace();
      this.hints.push(
        ...this.getUncoverHiddenCardsHintsFirstOnes(blockedCardsToFreeUpSpace)
      );
    }

    if (this.hints.length === 0) {
      this.hints.push(...this.getStockHint());
    }

    if (this.hints.length === 0) {
      this.hints.push(...this.getStockAndWasteHints());
    }
    // this.hints.push(
    //   ...this.getUncoverHiddenCardsHintsNextCardsOnes(
    //     tableauAfterFirstBlockedCards
    //   )
    // );
    // }

    if (this.hints.length === 0) {
      this.eventManager.emit(GameEvents.SET_NO_HINTS, true);
      this.hints.push(
        this.createHint(
          null,
          null,
          null,
          null,
          10,
          UIConfig.dataI18nValue.HINT_NO_HINTS
        )
      );
    }

    return this.hints;
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
      } else if (cardHints.length === 0) {
        const nextCardHints = this.getHintsForBlockedCardNextCardsOnes(
          card,
          tableau,
          nextCards
        );
        hints.push(...nextCardHints);
      }
    }

    return hints;
  }

  getHintsForBlockedCardNextCardsOnes(card, tableau, nextCards) {
    const hints = [];

    if (nextCards.length === 0) return hints;
    else if (nextCards.length > 0) {
      const suitableFoundations = this.findSuitableFoundations(card);
      console.log("suitableFoundations: ", suitableFoundations);

      if (!suitableFoundations) return [];
      else if (suitableFoundations) {
        nextCards.forEach((nextCard, index) => {
          console.log("nextCard: ", nextCard);

          const newNextCards = nextCards.slice(index + 1);
          console.log("newNextCards: ", newNextCards);

          if (newNextCards.length === 0) {
            const nextCardHints = this.getHintsForBlockedCard(
              nextCard,
              tableau,
              []
            );
            if (nextCardHints.length > 0) {
              const toCard =
                suitableFoundations.getTopCard() || suitableFoundations;
              hints.push(...nextCardHints);
              hints.push(
                this.createHint(
                  tableau,
                  card,
                  suitableFoundations,
                  toCard,
                  95,
                  "из getHintsForBlockedCardNextCardsOnes"
                )
              );
              return hints;
            }
          } else if (newNextCards.length > 0) {
            const nextCardHints = this.checkTableauMove(
              nextCard,
              tableau,
              newNextCards
            );
            if (nextCardHints.length > 0) {
              alert("nextCardHints.length > 0");
              if (nextCards[index] === tableau.getTopCard()) {
                const toCard =
                  suitableFoundations.getTopCard() || suitableFoundations;
                hints.push(...nextCardHints);
                hints.push(
                  this.createHint(
                    tableau,
                    card,
                    suitableFoundations,
                    toCard,
                    95,
                    "из getHintsForBlockedCardNextCardsOnes"
                  )
                );
              }
              return hints;
            } else if (nextCardHints.length === 0) {
              const newCardHints = this.getHintsForBlockedCardNextCardsOnes(
                nextCard,
                tableau,
                newNextCards
              );
              if (newCardHints.length === 0) return [];
            }
          }
        });
      }
    }

    return hints;
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
  getHintsForBlockedCard(card, fromContainer, nextCards) {
    const hints = [];

    // ШАГ 1: Проверить можно ли переместить в foundations
    const foundationHints = this.checkFoundationMove(card, fromContainer);
    if (foundationHints.length > 0) {
      return foundationHints.map((hint) => ({
        ...hint,
        priority: 100, // Чем меньше блокировка - тем выше приоритет
        description: `Положить ${card} в дом чтобы освободить скрытые карты`,
      }));
    }

    // ШАГ 2: Проверить можно ли переместить в другой tableau
    const tableauHints = this.checkTableauMove(card, fromContainer, nextCards);
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
  checkFoundationMove(card, fromContainer) {
    const hints = [];
    const foundations = this.stateManager.state.cardsComponents.foundations;
    const currentFoundation = foundations.find((foundation) => {
      return foundation.canAccept(
        card,
        this.stateManager.state.cardsComponents
      );
    });
    if (currentFoundation) {
      hints.push(
        this.createHint(
          fromContainer,
          card,
          currentFoundation,
          currentFoundation.getTopCard(),
          95,
          `Положить ${card} в дом`
        )
      );
    }
    return hints;
  }

  // Проверить перемещение в другой tableau
  checkTableauMove(card, fromContainer, nextCards) {
    const hints = [];
    const tableaus = this.stateManager.state.cardsComponents.tableaus;

    tableaus.forEach((targetTableau) => {
      if (targetTableau !== fromContainer && targetTableau.canAccept(card)) {
        hints.push(
          this.createHint(
            fromContainer,
            card,
            targetTableau,
            targetTableau.getTopCard(),
            85,
            `Переместить ${card} в другой столбец`,
            nextCards
          )
        );
      }
    });

    return hints;
  }

  createHint(
    fromContainer,
    fromCard,
    toContainer,
    toCard,
    priority,
    description,
    fromCardNextCards = []
  ) {
    return {
      fromContainer,
      fromCard,
      toContainer,
      toCard,
      priority,
      description,
      fromCardNextCards,
    };
  }

  findSuitableFoundations(card) {
    const foundations = this.stateManager.state.cardsComponents.foundations;
    return foundations.find((foundation) => foundation.canAcceptForHints(card));
  }

  getHintsToCardFromWaste() {
    const hints = [];
    const waste = this.stateManager.state.cardsComponents.waste;
    const card = waste.getTopCard();
    if (!card) return [];
    // Проверяем все возможные ходы для этой карты
    const cardHints = this.getHintsForBlockedCard(card, waste, []);
    hints.push(...cardHints);
    return hints;
  }

  // getHintsToFreeUpSpace(blockedCardsToFreeUpSpace) {
  //   const hints = [];
  // }

  getAllBlockedCardsToFreeUpSpace() {
    const blockedCards = [];
    const tableaus = this.stateManager.state.cardsComponents.tableaus;

    const currentTableus = tableaus.filter((tableau) => {
      return tableau.cards[0]?.faceUp === true;
    });

    if (currentTableus.length === 0) {
      return [];
    }

    currentTableus.forEach((tableau) => {
      const cards = tableau.cards || [];
      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        if (card === cards[0] && cards[0].value === this.cardVAlueKing) break;
        else if (card === tableau.getTopCard()) {
          blockedCards.push({
            card,
            tableau,
            index: i,
            nextCards: [],
          });
        } else {
          blockedCards.push({
            card,
            tableau,
            index: i,
            nextCards: tableau.getFaceUpTopCards(card),
          });
        }
      }
    });
    return blockedCards;
  }

  getStockHint() {
    const hints = [];

    // Подсказка открыть новую карту
    const stock = this.stateManager.state.cardsComponents.stock;
    if (stock && stock.cards && stock.cards.length > 0) {
      hints.push(
        this.createHint(
          null,
          null,
          stock,
          null,
          10,
          UIConfig.dataI18nValue.HINT_OPEN_NEW_CARD_FROM_DECK
        )
      );
    }
    return hints;
  }

  getStockAndWasteHints() {
    const hints = [];

    const stock = this.stateManager.state.cardsComponents.stock;
    const waste = this.stateManager.state.cardsComponents.waste;

    if (stock.isEmpty() < 0 && waste.isEmpty()) {
      return [];
    } else if (stock.stockCardPosition < 0 && !waste.isEmpty()) {
      if (waste.cards.length === 1) {
        return [];
      }
      const wasteCards = waste.cards.filter((card) => card !== waste.cards[0]);
      let hintsForWateCards = [];
      for (let i = 0; i < wasteCards.length; i++) {
        const card = wasteCards[i];
        hintsForWateCards = this.getHintsForBlockedCard(card, waste, []);
        if (hintsForWateCards.length > 0) {
          hints.push(
            this.createHint(
              null,
              null,
              stock,
              null,
              10,
              UIConfig.dataI18nValue.HINT_TURN_DECK
            )
          );
          break;
        }
      }
    }
    return hints;
  }
}
