import { GameEvents, CardValues } from "../utils/Constants.js";

export class AutoMoveManager {
  // constructor(game) {
  constructor(eventManager, stateManager) {
    this.eventManager = eventManager;
    this.stateManager = stateManager;
    this.state = this.stateManager.state;
    // this.game = game;
    this.isProcessing = false;

    this.init();
  }

  init() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.eventManager.onAsync(
      GameEvents.CHECK_AND_AUTO_MOVE,
      async (card, foundation) => await this.checkAndAutoMove(card, foundation)
    );
  }

  // Основной метод для проверки автопереноса после хода
  async checkAndAutoMove(card, foundation) {
    if (this.isProcessing) return;

    this.isProcessing = true;

    try {
      let nextCard = null;
      let fromTableau = null;
      const tableaus = this.stateManager.getCardsComponents().tableaus;

      for (let tableau of tableaus) {
        const tableauTopCard = tableau.getTopCard();
        if (
          tableauTopCard &&
          foundation.canAccept(tableauTopCard, this.stateManager.getCardsComponents())
        ) {
          nextCard = tableauTopCard;
          fromTableau = tableau;
          return
        }
      }

      if (!nextCard) return;
      else if (nextCard) {
        // Автоматически перемещаем карту
        await this.autoMoveCard(nextCard, foundation, fromTableau);
      }

      // Продолжаем проверять следующие карты, пока находим подходящие

      // currentCard = nextCard;
      //   }
    } finally {
      this.isProcessing = false;
    }
  }

  // Поиск следующей карты для foundation
  findNextCardForFoundation(card) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // const currentRank = this.getCardRank(card);
        const currentRank = card.value;
        // const suit = this.getCardSuit(card);
        const suit = card.suit;
        const nextRank = this.getNextRank(currentRank, CardValues);

        if (!nextRank) {
          resolve(null);
          return;
        }

        // Ищем карту в столбцах
        const cardInTableaus = this.findCardInTableaus(
          card,
          this.stateManager.getCardsComponents()
        );
        if (cardInTableaus && this.canAutoMoveFromTableau(cardInTableaus)) {
          resolve(cardInTableaus);
          return;
        }

        // Ищем карту в стоке
        const cardInStock = this.findCardInStock(nextRank, suit);
        if (cardInStock) {
          resolve(cardInStock);
          return;
        }

        resolve(null);
      }, 100); // Небольшая задержка для плавности
    });
  }

  // Автоматическое перемещение карты
  async autoMoveCard(card, foundation, fromTableau) {
    return new Promise((resolve) => {
      setTimeout(async () => {
        // Получаем исходное положение карты
        // const sourceElement = this.getCardSource(card);

        // Проверяем, можно ли перемещать (не нарушит ли это логику игры)
        if (!this.validateAutoMove(card, fromTableau)) {
          resolve(false);
          return;
        }

        // Анимируем перемещение
        await this.animateAutoMove(card, foundation);

        // Обновляем игровое состояние
        // this.updateGameState(card, sourceElement, foundation);

        resolve(true);
      }, 150);
    });
  }

  // ВАЖНО: Проверка безопасности автопереноса
  validateAutoMove(card, sourceElement) {
    const sourceType = this.getSourceType(sourceElement);

    switch (sourceType) {
      case "column":
        return this.validateColumnAutoMove(card, sourceElement);

      case "stock":
        return this.validateStockAutoMove(card, sourceElement);

      default:
        return false;
    }
  }

  // Проверка автопереноса из столбца
  validateColumnAutoMove(card, columnElement) {
    const columnCards = this.getColumnCards(columnElement);
    const cardIndex = columnCards.indexOf(card);

    // Если карта не верхняя в столбце - нельзя перемещать
    if (cardIndex !== columnCards.length - 1) {
      return false;
    }

    // Проверяем, не блокирует ли карта закрытые карты под ней
    const hiddenCards = this.getHiddenCardsInColumn(columnElement);
    if (hiddenCards.length > 0) {
      // Если есть закрытые карты, автоперенос возможен
      return true;
    }

    // Если нет закрытых карт, проверяем, не нужна ли карта для последовательности
    const sequenceImportance = this.checkSequenceImportance(
      card,
      columnElement
    );
    return !sequenceImportance;
  }

  // Проверка автопереноса из стока
  validateStockAutoMove(card, stockElement) {
    // Из стока можно всегда перемещать, так как это не влияет на столбцы
    return true;
  }

  // Проверка важности карты для последовательности в столбце
  checkSequenceImportance(card, columnElement) {
    const columnCards = this.getColumnCards(columnElement);
    const cardIndex = columnCards.indexOf(card);

    // Если карта последняя в столбце - не важна для последовательности
    if (cardIndex === columnCards.length - 1) {
      return false;
    }

    // Проверяем, является ли карта частью нисходящей последовательности
    const sequenceBelow = this.getSequenceBelow(card, columnCards, cardIndex);

    // Если карта начинает значительную последовательность - она важна
    return sequenceBelow.length >= 2; // Например, последовательность из 2+ карт
  }

  // Анимация автопереноса
  animateAutoMove(card, foundation) {
    return new Promise((resolve) => {
      const cardElement = this.getCardElement(card);
      const foundationRect = foundation.getBoundingClientRect();

      // Создаем клон для анимации (чтобы не трогать оригинал до подтверждения)
      const clone = cardElement.cloneNode(true);
      clone.style.position = "fixed";
      clone.style.zIndex = "10000";
      clone.style.left = cardElement.getBoundingClientRect().left + "px";
      clone.style.top = cardElement.getBoundingClientRect().top + "px";
      document.body.appendChild(clone);

      // Анимация перемещения
      clone.style.transition = "all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
      clone.style.transform = `translate(${
        foundationRect.left - clone.getBoundingClientRect().left
      }px, 
                                              ${
                                                foundationRect.top -
                                                clone.getBoundingClientRect()
                                                  .top
                                              }px)`;

      setTimeout(() => {
        document.body.removeChild(clone);
        resolve();
      }, 500);
    });
  }

  // Вспомогательные методы
  getCardRank(card) {
    return card.dataset.rank || card.getAttribute("data-rank");
  }

  getCardSuit(card) {
    return card.dataset.suit || card.getAttribute("data-suit");
  }

  getNextRank(currentRank, ranks) {
    const currentIndex = ranks.indexOf(currentRank);
    return currentIndex >= 0 && currentIndex < ranks.length - 1
      ? ranks[currentIndex + 1]
      : null;
  }

  findCardInTableaus(foundationCard, cardsComponents) {
    // Реализация поиска карты в столбцах
    const tableaus = cardsComponents.tableaus;
    for (let tableau of tableaus) {
      const tableauCards = tableau.cards;
      for (let tableauCard of tableauCards) {
        if (
          foundationCard.suit === tableauCard.suit &&
          foundationCard.isPreviousInSequence(tableauCard) &&
          tableau.getTopCard() === card
        ) {
          return card;
        }
      }
    }
    return null;
  }

  findCardInStock(rank, suit) {
    // Реализация поиска карты в стоке
    const stock = document.querySelector(".stock");
    if (stock) {
      const cards = stock.querySelectorAll(".card");
      for (let card of cards) {
        if (
          this.getCardRank(card) === rank &&
          this.getCardSuit(card) === suit
        ) {
          return card;
        }
      }
    }
    return null;
  }

  canAutoMoveFromTableau(card) {
    const column = card.closest(".column");
    const cards = column.querySelectorAll(".card");
    return card === cards[cards.length - 1]; // Только верхняя карта
  }

  getCardSource(card) {
    return card.closest(".column, .stock");
  }

  getSourceType(sourceElement) {
    if (sourceElement.classList.contains("column")) return "column";
    if (sourceElement.classList.contains("stock")) return "stock";
    return "unknown";
  }

  updateGameState(card, sourceElement, foundation) {
    // Удаляем карту из исходного положения
    card.remove();

    // Добавляем карту в foundation
    foundation.appendChild(card);

    // Обновляем состояние игры
    this.game.updateScore(5); // Бонус за автоперенос
    this.game.checkWinCondition();

    // Запускаем анимацию приземления
    FoundationAnimation.playSuccessAnimation(card, foundation);
  }
}
