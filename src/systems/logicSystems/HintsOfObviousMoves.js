export class HintsOfObviousMoves {
  constructor(eventManager, stateManager) {
    this.eventManager = eventManager;
    this.stateManager = stateManager;
    this.hints = []
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Реализовать подписки на события
  }

  // Основной публичный метод
  getHints() {
    this.hints = [];

    this.hints.push(...this.getWasteToFoundationHints());
    this.hints.push(...this.getWasteToTableauHints());
    this.hints.push(...this.getTableauToFoundationHints());
    this.hints.push(...this.getTableauToTableauHints());

    return this.sortHintsByPriority(this.hints);
  }
  
  getTopHint() {
    return this.hints.pop()
  }

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

  getTableauToFoundationHints() {
    const hints = [];
    const tableauTopCards = this.getTableausTopCards();

    // Aces to empty foundations
    const aces = tableauTopCards.filter(
      ({ tableauTopCard }) => tableauTopCard.value === "A"
    );

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

    // Non-aces to non-empty foundations
    const nonAces = tableauTopCards.filter(
      ({ tableauTopCard }) => tableauTopCard.value !== "A"
    );

    nonAces.forEach(({ tableau, tableauTopCard }) => {
      hints.push(
        ...this.getCardToNonEmptyFoundationHints(tableau, tableauTopCard)
      );
    });

    return hints;
  }

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
