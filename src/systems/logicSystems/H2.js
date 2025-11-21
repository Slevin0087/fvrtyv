import { UIConfig } from "../../configs/UIConfig.js";
import {
  GameEvents,
  CardValues,
  CountValuesOfEachCard,
} from "../../utils/Constants.js";

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
      return this.hints;
    }

    if (this.stateManager.getIsAutoCollectBtnShow()) {
      this.hints.push(
        this.createHint(
          null,
          null,
          null,
          null,
          10,
          UIConfig.dataI18nValue.HINT_CLICK_AUTO_COLLECT_BTN
        )
      );
      return this.hints;
    }

    // Собираем все открытые карты, которые блокируют закрытые
    const blockedCardsToCardsWithFaceDown = this.getAllBlockedOpenCards();

    // ПРИОРИТЕТ 1: Открытие закрытых карт
    if (blockedCardsToCardsWithFaceDown.length > 0) {
      this.hints.push(...this.getCardsHints(blockedCardsToCardsWithFaceDown));
    }

    if (this.hints.length === 0) {
      this.hints.push(...this.getHintsToCardFromWaste());
    }

    if (this.hints.length === 0) {
      const blockedCardsToFreeUpSpace = this.getAllBlockedCardsToFreeUpSpace();
      if (blockedCardsToFreeUpSpace.length > 0) {
        this.hints.push(...this.getCardsHints(blockedCardsToFreeUpSpace));
      }
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

  ///////////////////////////////////////////////////////
  getHintsViaSimilarCard(originalCard, originalFromContainer) {
    const hints = [];
    const similarCardData = this.getSimilarInValueAndColorCard(
      originalCard,
      originalFromContainer
    );

    if (similarCardData === null) {
      return hints;
    }

    const {
      card: similarCard,
      fromContainer: similarFromContainer,
      nextCards: similarNextCards,
    } = similarCardData;

    // Если аналогичная карта заблокирована, ищем ходы для неё
    if (similarNextCards.length > 0) {
      const similarCardHints = this.getHintsForBlockedCard(
        similarCard,
        similarFromContainer,
        similarNextCards
      );

      if (similarCardHints.length > 0) {
        hints.push(...similarCardHints);

        // После освобождения аналогичной карты, можем переместить исходную карту
        const targetMoveHints = this.checkTableauMove(
          originalCard,
          originalFromContainer,
          []
        );
        hints.push(...targetMoveHints);
      }
    } else {
      // Аналогичная карта уже доступна - можем переместить исходную карту к ней
      const directMoveHints = this.checkTableauMove(
        originalCard,
        originalFromContainer,
        []
      );
      hints.push(...directMoveHints);
    }

    return hints;
  }

  //////////////////////////////////

  // ПРИОРИТЕТ 1: Открытие закрытых карт
  getCardsHints(tableauFirstBlockedCards) {
    const hints = [];

    for (const blockedCard of tableauFirstBlockedCards) {
      const { card, fromContainer, nextCards } = blockedCard;

      // Проверяем все возможные ходы для этой карты
      const cardHints = this.getHintsForBlockedCard(
        card,
        fromContainer,
        nextCards
      );
      hints.push(...cardHints);

      // Если нашли подсказки для этой карты, добавляем и переходим к следующей
      if (cardHints.length > 0) {
        break;
      } else {

        // if (allHintsToFoundations.length === 0) {
          const hintsFromWasteToTableau = this.getHintsFromWasteToTableau(
            card,
            fromContainer,
            nextCards
          );
          hints.push(...hintsFromWasteToTableau);
        // }
        if (nextCards.length === 0) {
          // const allHintsToFoundations = this.getAllHintsToFoundations(
          //   card,
          //   fromContainer,
          //   nextCards
          // );
          // hints.push(...allHintsToFoundations);

          // const foundationToTableauHints = this.getFoundationToTableauHints(
          //   card,
          //   fromContainer
          // );
          // hints.push(...foundationToTableauHints);
          // if (foundationToTableauHints.length === 0) {
          //   const hintsViaSimilarCard = this.getHintsViaSimilarCard(
          //     card,
          //     fromContainer
          //   );
          //   hints.push(...hintsViaSimilarCard);
          // }
        } else {
          //////////////////////////////
          const nextCardHints = this.getHintsForBlockedCardNextCardsOnes(
            card,
            fromContainer,
            nextCards
          );
          hints.push(...nextCardHints);
        }
      }
    }

    return hints;
  }

  getFoundationToTableauHints(tableauCard, fromTableau, foundation) {
    const hints = [];
    // for (const foundation of foundations) {
    const foundationСards = foundation.cards;
    for (const foundationСard of foundationСards) {
      if (!this.isSuitableFoundationCard(foundationСard, tableauCard)) {
        continue;
      }
      if (foundationСard === foundation.getTopCard()) {
        // Карта верхняя в foundation
        const hintsFromFoundation = this.tryMoveTopFoundationCard(
          foundation,
          card,
          fromTableau,
          tableauCard
        );
        if (hintsFromFoundation.length > 0) {
          hints.push(...hintsFromFoundation);
          return hints; // Нашли ходы - возвращаем массив
        }
      } else {
        // Карта не верхняя - нужно переместить верхние карты
        const hintsCardsFromFoundation = this.tryMoveNonTopFoundationCard(
          foundation,
          fromTableau,
          tableauCard
        );
        if (hintsCardsFromFoundation.length > 0) {
          hints.push(...hintsCardsFromFoundation);
          return hints; // Нашли ходы - возвращаем массив
        }
      }
    }
    // }
    return hints;
  }

  // Вспомогательные методы для упрощения логики
  isSuitableFoundationCard(foundationCard, tableauCard) {
    return (
      foundationCard.value !== "A" &&
      foundationCard.value !== "K" &&
      tableauCard.isOppositeColor(foundationCard) &&
      tableauCard.isNextInSequence(foundationCard)
    );
  }

  isSuitableCardToFoundation(toCard, foundation, cardsComponents, fromCard) {
    return (
      toCard &&
      foundation.canAccept(toCard, cardsComponents) &&
      fromCard.suit === toCard.suit &&
      fromCard.isPreviousInSequence(toCard)
    );
  }

  isSuitableCardToTableau(fromCard, toCard) {
    return (
      toCard.value !== "A" &&
      fromCard.isOppositeColor(toCard) &&
      fromCard.isNextInSequence(toCard)
    );
  }

  tryMoveTopFoundationCard(
    foundation,
    foundationCard,
    fromTableau,
    tableauCard
  ) {
    const hints = [];
    const tableaus = this.stateManager.getCardsComponents().tableaus;
    for (const tableau of tableaus) {
      if (tableau !== fromTableau && tableau.canAccept(foundationCard)) {
        hints.push(
          this.createHint(
            foundation,
            foundationCard,
            tableau,
            tableau.getTopCard(),
            75,
            "Move card from foundation to free space"
          ),
          this.createHint(
            fromTableau,
            tableauCard,
            tableau,
            tableau.getTopCard(),
            75,
            "Move target card to freed space"
          )
        );
      }
    }

    return hints; // Не нашли - возвращаем пустой массив
  }

  tryMoveNonTopFoundationCard(foundation, fromTableau, tableauCard) {
    const hints = [];
    const tableaus = this.stateManager.getCardsComponents().tableaus;
    const foundationTopCards = foundation.getTopCardsToHints(card);
    const hintsToTopCards = [];
    let toContainer = null;
    for (let i = foundationTopCards.length - 1; i >= 0; i--) {
      const foundationTopCard = foundationTopCards[i];
      for (const tableau of tableaus) {
        if (tableau.canAccept(foundationTopCard) && tableau !== fromTableau) {
          hintsToTopCards.push(
            this.createHint(
              foundation,
              foundationTopCard,
              tableau,
              tableau.getTopCard(),
              75,
              "fdfdf",
              []
            )
          );
          toContainer = tableau;
          break;
        }
      }
    }
    if (hintsToTopCards.length === foundationTopCards.length) {
      hints.push(
        ...hintsToTopCards,
        this.createHint(
          fromTableau,
          tableauCard,
          toContainer,
          toContainer.getTopCard(),
          75,
          "dfdfdfd",
          []
        )
      );
    }

    return hints;
  }

  getHintsForBlockedCardNextCardsOnes(card, tableau, nextCards) {
    console.log(
      "заход в getHintsForBlockedCardNextCardsOnes: ",
      card,
      tableau,
      nextCards
    );

    const hints = [];

    if (nextCards.length === 0) return hints;
    const suitableFoundations = this.findSuitableFoundations(card);
    console.log("suitableFoundations: ", suitableFoundations);

    if (!suitableFoundations) return hints;
    for (let i = 0; i > nextCards.length; i++) {
      const newNextCards = nextCards.slice(i + 1);
      if (newNextCards.length === 0) {
      }
    }
    nextCards.forEach((nextCard, index) => {
      const newNextCards = nextCards.slice(index + 1);
      if (newNextCards.length === 0) {
        console.log("if (newNextCards.length === 0)");

        const nextCardHints = this.getHintsForBlockedCard(
          nextCard,
          tableau,
          []
        );
        if (nextCardHints.length > 0) {
          console.log(
            "if (newNextCards.length === 0), if (nextCardHints.length > 0)"
          );
          hints.push(...nextCardHints);
          hints.push(
            this.createHint(
              tableau,
              card,
              suitableFoundations,
              suitableFoundations.getTopCard(),
              95,
              "из getHintsForBlockedCardNextCardsOnes"
            )
          );
          return hints;
        }
      } else {
        console.log("else if (newNextCards.length > 0)");

        const nextCardHints = this.checkTableauMove(
          nextCard,
          tableau,
          newNextCards
        );
        if (nextCardHints.length > 0) {
          if (nextCards[index] === tableau.getTopCard()) {
            hints.push(...nextCardHints);
            hints.push(
              this.createHint(
                tableau,
                card,
                suitableFoundations,
                suitableFoundations.getTopCard(),
                95,
                "из getHintsForBlockedCardNextCardsOnes"
              )
            );
          }
          return hints;
        } else {
          console.log("else в цикле");

          const newCardHints = this.getHintsForBlockedCardNextCardsOnes(
            nextCard,
            tableau,
            newNextCards
          );
          if (newCardHints.length === 0) return [];
          else {
            hints.push(...newCardHints);
            return hints;
          }
        }
      }
    });

    return hints;
  }

  // Получить все открытые карты, которые блокируют закрытые
  getAllBlockedOpenCards() {
    const blockedCards = [];
    const tableaus = this.stateManager.getCardsComponents().tableaus;

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
            blockedCards.push({
              card,
              fromContainer: tableau,
              index: i,
              nextCards: [],
            });
          } else {
            blockedCards.push({
              card,
              fromContainer: tableau,
              tableau,
              index: i,
              nextCards: tableau.getFaceUpTopCards(card),
            });
          }
          break;
        }
      }
    });

    return blockedCards;
  }

  getSimilarInValueAndColorCard(firstCard, fromContainer) {
    console.log("firstCard: ", firstCard);

    const tableaus = this.stateManager.getCardsComponents().tableaus;

    for (const tableau of tableaus) {
      if (tableau.cards.length === 0) continue;
      const similarCard = tableau.cards.find(
        (card) =>
          card.faceUp &&
          card.value === firstCard.value &&
          card.color === firstCard.color &&
          fromContainer !== tableau
      );

      if (similarCard) {
        return {
          card: similarCard,
          fromContainer: tableau,
          nextCards:
            similarCard === tableau.getTopCard()
              ? []
              : tableau.getFaceUpTopCards(similarCard),
        };
      }
    }
    return null;
  }

  // Получить подсказки для заблокированной карты
  getHintsForBlockedCard(card, fromContainer, nextCards) {
    const hints = [];
    // ШАГ 1: Проверить можно ли переместить в foundations
    const foundationHints = this.checkFoundationMove(
      card,
      fromContainer,
      nextCards
    );
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
    } else {
      const waste = this.stateManager.getCardsComponents().waste;
      if (fromContainer !== waste) {
        const wasteTopCard = waste.getTopCard();
        if (wasteTopCard && this.isSuitableCardToTableau(card, wasteTopCard)) {
          for (const tableau of this.stateManager.getCardsComponents()
            .tableaus) {
            if (tableau.canAccept(wasteTopCard)) {
              hints.push(
                this.createHint(
                  waste,
                  wasteTopCard,
                  tableau,
                  tableau.getTopCard(),
                  90,
                  `Переместить ${card} в другой столбец чтобы освободить скрытые карты`
                )
              );
              hints.push(
                this.createHint(
                  fromContainer,
                  card,
                  tableau,
                  tableau.getTopCard(),
                  90,
                  `Переместить ${card} в другой столбец чтобы освободить скрытые карты`
                )
              );
              break;
            }
          }
        }
      }
    }
    return hints;
  }

  // Проверить перемещение в foundations
  checkFoundationMove(card, fromContainer, nextCards = []) {
    const hints = [];
    const cardsComponents = this.stateManager.getCardsComponents();
    for (const foundation of cardsComponents.foundations) {
      if (foundation.canAccept(card, cardsComponents)) {
        hints.push(
          this.createHint(
            fromContainer,
            card,
            foundation,
            foundation.getTopCard(),
            95,
            `Положить ${card} в дом`,
            nextCards
          )
        );
        break;
      } else {
        const waste = cardsComponents.waste;
        if (waste !== fromContainer) {
          const wasteTopCard = waste.getTopCard();
          if (
            wasteTopCard &&
            this.isSuitableCardToFoundation(
              wasteTopCard,
              foundation,
              cardsComponents,
              card
            )
          ) {
            hints.push(
              this.createHint(
                waste,
                waste.getTopCard(),
                foundation,
                foundation.getTopCard(),
                95,
                `Положить ${card} в дом`,
                nextCards
              )
            );
            hints.push(
              this.createHint(
                fromContainer,
                fromCard,
                foundation,
                foundation.getTopCard(),
                95,
                `Положить ${card} в дом`,
                nextCards
              )
            );
            break;
          }
        }
      }
    }

    return hints;
  }

  // Проверить перемещение в другой tableau
  checkTableauMove(card, fromContainer, nextCards) {
    const hints = [];
    const tableaus = this.stateManager.getCardsComponents().tableaus;

    for (const tableau of tableaus) {
      if (tableau.canAccept(card) && tableau !== fromContainer) {
        hints.push(
          this.createHint(
            fromContainer,
            card,
            tableau,
            tableau.getTopCard(),
            85,
            `Переместить ${card} в другой столбец`,
            nextCards
          )
        );
        break;
      }
    }

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
    const foundations = this.stateManager.getCardsComponents().foundations;
    return foundations.find((foundation) => foundation.canAcceptForHints(card));
  }

  getHintsToCardFromWaste() {
    const hints = [];
    const waste = this.stateManager.getCardsComponents().waste;
    const card = waste.getTopCard();
    if (!card) return [];
    // Проверяем все возможные ходы для этой карты
    const cardHints = this.getHintsForBlockedCard(card, waste, []);
    hints.push(...cardHints);
    return hints;
  }

  getHintsFromWasteToTableau(fromCard, fromContainer, nextCards) {
    const hints = [];
    const waste = this.stateManager.getCardsComponents().waste;
    const wasteTopCard = waste.getTopCard();
    if (wasteTopCard && this.isSuitableCardToTableau(fromCard, wasteTopCard)) {
      for (const tableau of this.stateManager.getCardsComponents().tableaus) {
        if (tableau.canAccept(wasteTopCard)) {
          hints.push(
            this.createHint(
              waste,
              wasteTopCard,
              tableau,
              tableau.getTopCard(),
              85,
              "ffff",
              nextCards
            )
          );
          hints.push(
            this.createHint(
              fromContainer,
              fromCard,
              tableau,
              tableau.getTopCard(),
              85,
              "ffff",
              nextCards
            )
          );
        }
      }
    }
    return hints;
  }

  // getHintsToFreeUpSpace(blockedCardsToFreeUpSpace) {
  //   const hints = [];
  // }

  getAllBlockedCardsToFreeUpSpace() {
    const blockedCards = [];
    const tableaus = this.stateManager.getCardsComponents().tableaus;

    const firstCardValueKingTableaus = tableaus.filter((tableau) => {
      return tableau.cards[0]?.value === this.cardVAlueKing;
    });

    if (firstCardValueKingTableaus.length - 1 === CountValuesOfEachCard) {
      return [];
    }

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
    const stock = this.stateManager.getCardsComponents().stock;
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

    const stock = this.stateManager.getCardsComponents().stock;
    const waste = this.stateManager.getCardsComponents().waste;

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

  getAllHintsToFoundations(fromCard, fromContainer, nextCards) {
    const hints = [];
    const cardsComponents = this.stateManager.getCardsComponents();
    for (const foundation of cardsComponents.foundations) {
      const toFoundationOrCard = foundation.isEmpty()
        ? foundation
        : foundation.getTopCard();
      if (nextCards.length === 0) {
        const waste = cardsComponents.waste;
        if (
          this.isSuitableCardToFoundation(
            waste.getTopCard(),
            foundation,
            cardsComponents,
            fromCard
          )
        ) {
          hints.push(
            this.createHint(
              waste,
              waste.getTopCard(),
              foundation,
              toFoundationOrCard
            )
          );
          hints.push(
            this.createHint(
              fromContainer,
              fromCard,
              foundation,
              toFoundationOrCard
            )
          );
        }
        if (hints.length === 0) {
          const foundationToTableauHints = this.getFoundationToTableauHints(
            fromCard,
            fromContainer,
            foundation
          );
          hints.push(...foundationToTableauHints);
        }
      }
    }
    return hints;
  }
}
