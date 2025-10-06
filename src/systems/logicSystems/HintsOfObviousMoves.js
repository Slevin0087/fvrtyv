import { GameEvents } from "../../utils/Constants.js";

export class HintsOfObviousMoves {
  constructor(eventManager, stateManager) {
    this.eventManager = eventManager;
    this.stateManager = stateManager;
    this.state = this.stateManager.state;
    this.setupEventListeners();
  }

  setupEventListeners() {
    // this.eventManager.on(GameEvents)
  }

  getTableusTopCards() {
    const tableauTopCards = [];
    const tableaus = this.state.cardsComponents.tableaus;
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
    const tableaus = this.state.cardsComponents.tableaus;
    tableaus.forEach((tableau) => {
      tableau.cards?.forEach((card) => {
        if (card.faceUp) faceUpCardsInTableaus.push({ tableau, card });
      });
    });
    return faceUpCardsInTableaus;
  }

  hintsForFoundations(tableauTopCards) {
    const hints = [];
    const tableaus = this.state.cardsComponents.tableaus;
    const foundations = this.state.cardsComponents.foundations;
    const waste = this.state.cardsComponents.waste;
    const wasteTopCard = waste.getTopCard();

    // Ищем ТУЗЫ для пустых foundations
    const emptyFoundations = foundations.filter(
      (foundation) => !foundation.getTopCard()
    );
    const aces = tableauTopCards.filter(
      ({ tableauTopCard }) => tableauTopCard.value === "A"
    );

    // Для каждого Туза создаем только ОДНУ подсказку
    aces.forEach(({ tableau, tableauTopCard }) => {
      if (emptyFoundations.length > 0) {
        // Берем первый пустой foundation
        const targetFoundation = emptyFoundations[0];

        hints.push({
          fromContainer: tableau,
          fromCard: tableauTopCard,
          toContainer: targetFoundation,
          toCard: null,
          priority: 100,
          description: `Положить ${tableauTopCard} в пустой дом`,
        });

        // Убираем использованный foundation из доступных
        emptyFoundations.shift();
      }
    });

    // Теперь обрабатываем НЕ-ТУЗЫ для непустых foundations
    const nonEmptyFoundations = foundations.filter((foundation) =>
      foundation.getTopCard()
    );
    const nonAces = tableauTopCards.filter(
      ({ tableauTopCard }) => tableauTopCard.value !== "A"
    );

    nonAces.forEach(({ tableau, tableauTopCard }) => {
      nonEmptyFoundations.forEach((foundation) => {
        if (foundation.canAccept(tableauTopCard, this.state.cardsComponents)) {
          hints.push({
            fromContainer: tableau,
            fromCard: tableauTopCard,
            toContainer: foundation,
            toCard: foundation.getTopCard(),
            priority: 90,
            description: `Положить ${tableauTopCard} в дом`,
          });
        }
      });
    });

    // Теперь обрабатываем waste, есть ли там карта и эта карта === 'A'(туз)?
    if (wasteTopCard) {
      if (wasteTopCard.value === "A") {
        // Ищем пустыe foundations
        const emptyFoundations = foundations.filter(
          (foundation) => !foundation.getTopCard()
        );

        if (emptyFoundations.length > 0) {
          // Берем первый пустой foundation
          const targetFoundation = emptyFoundations[0];
          hints.push({
            fromContainer: waste,
            fromCard: wasteTopCard,
            toContainer: targetFoundation,
            toCard: null,
            priority: 100,
            description: `Положить ${wasteTopCard} в пустой дом`,
          });
        }
      } else if (wasteTopCard.value !== "A") {
        const nonEmptyFoundations = foundations.filter((foundation) =>
          foundation.getTopCard()
        );
        nonEmptyFoundations.forEach((foundation) => {
          if (foundation.canAccept(wasteTopCard, this.state.cardsComponents)) {
            hints.push({
              fromContainer: waste,
              fromCard: wasteTopCard,
              toContainer: foundation,
              toCard: foundation.getTopCard(),
              priority: 90,
              description: `Положить ${wasteTopCard} в дом`,
            });
          }
        });
        tableaus.forEach((tableau) => {
          if (tableau.canAccept(wasteTopCard)) {
            hints.push({
              fromContainer: waste,
              fromCard: wasteTopCard,
              toContainer: tableau,
              toCard: tableau.getTopCard(),
              priority: wasteTopCard.value === 'K' ? 100 : 90,
              description: `Положить ${wasteTopCard} в tableau`,
            })
          }
        })

      }
    }

    tableauTopCards.forEach(({ tableau, tableauTopCard }) => {
      tableaus.forEach((t) => {
        if (t.canAccept(tableauTopCard) && t !== tableau) {
          hints.push({
            fromContainer: tableau,
            fromCard: tableauTopCard,
            toContainer: t,
            toCard: t.getTopCard(),
            priority: 90,
            description: `Положить ${tableauTopCard} в tableau`,
          })
        }
      })
    })

    return hints;
  }

  testF() {
    const topCards = this.getTableusTopCards();
    return this.hintsForFoundations(topCards);
  }

  canAcceptForFoundations(card) {
    const foundations = this.state.cardsComponents.foundations;
  }
}
