import { GameEvents, AudioName } from "../../utils/Constants.js";
import { GameConfig } from "../../configs/GameConfig.js";
import { achType, achCheckName } from "../../configs/AchievementsConfig.js";
import { UIConfig } from "../../configs/UIConfig.js";

export class CardMovementSystem {
  constructor(eventManager, stateManager, audioManager) {
    this.eventManager = eventManager;
    this.stateManager = stateManager;
    this.audioManager = audioManager;
    this.cardContainers = GameConfig.cardContainers;
    this.textCardsFlipped = achCheckName.CARDS_FLIPPED;
    this.typeCardFlipCheckAchievements = achType.IN_GAME;
    this.cardMoveDuration = UIConfig.animations.cardMoveDuration;
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.eventManager.onAsync(
      GameEvents.JOKER_HANDLE,
      async (jokerCard, tableaus) =>
        await this.handleJokerCard(jokerCard, tableaus)
    );
  }

  async handleCardClick(card) {
    const isFaceUp = card.faceUp;
    const isPaused = this.stateManager.getIsPaused();
    if (!isFaceUp || isPaused) return false;
    const gameComponents = this.stateManager.getCardsComponents();
    const usedAutoCollectCards = this.stateManager.getUsedAutoCollectCards();
    const audioCardMove = this.audioManager.getSound(AudioName.CARD_MOVE);
    this.cardMoveDuration = audioCardMove.duration * 10000; // поменять 10000 на 100, для теста поменял 100 на 10000

    // Проверка foundation
    for (let i = 0; i < gameComponents.foundations.length; i++) {
      const isCanAccept = gameComponents.foundations[i].canAccept(
        card,
        gameComponents
      );
      if (isCanAccept) {
        // if (!usedAutoCollectCards) this.audioManager.play(AudioName.CLICK); // расскоментить, закомментил для теста
        const containerTo = gameComponents.foundations[i];
        const containerToName = this.cardContainers.foundation;
        await this.eventManager.emitAsync(GameEvents.CARD_MOVE, {
          card,
          containerToIndex: i,
          containerTo,
          containerToName,
          cardMoveDuration: this.cardMoveDuration,
        });
        return true;
      }
    }

    // Проверка tableau
    for (let i = 0; i < gameComponents.tableaus.length; i++) {
      const isCanAccept = gameComponents.tableaus[i].canAccept(card);
      if (isCanAccept) {
        // if (!usedAutoCollectCards) this.audioManager.play(AudioName.CLICK); // расскоментить, закомментил для теста
        const containerTo = gameComponents.tableaus[i];
        const containerToName = this.cardContainers.tableau;
        await this.eventManager.emitAsync(GameEvents.CARD_MOVE, {
          card,
          containerToIndex: i,
          containerTo,
          containerToName,
          cardMoveDuration: this.cardMoveDuration,
        });
        return true;
      }
    }

    if (!usedAutoCollectCards) this.audioManager.play(AudioName.INFO);
    return false;
  }

  async handleJokerCard(jokerCard, tableaus) {
    for (let i = 0; i < tableaus.length; i++) {
      const isCanAccept = tableaus[i].canAccept(jokerCard);
      if (isCanAccept) {
        const containerTo = tableaus[i];
        const containerToName = this.cardContainers.tableau;
        await this.eventManager.emitAsync(GameEvents.CARD_MOVE, {
          card: jokerCard,
          containerToIndex: i,
          containerTo,
          containerToName,
          cardMoveDuration: this.cardMoveDuration,
        });
        return true;
      }
    }
  }

  async isCardMoveToFoundations(card, gameComponents) {
    for (let i = 0; i < gameComponents.foundations.length; i++) {
      const isCanAccept = gameComponents.foundations[i].canAccept(card, gameComponents)
      if (isCanAccept) {
        this.audioManager.play(AudioName.CLICK);
        const containerTo = gameComponents.foundations[i];
        const containerToName = this.cardContainers.foundation;
        await this.eventManager.emitAsync(GameEvents.CARD_MOVE, {
          card,
          containerToIndex: i,
          containerTo,
          containerToName,
          cardMoveDuration: this.cardMoveDuration,
        });
        return true;
      }
    }
  }

  getCardSource(card) {
    if (card.positionData.parent.includes(this.cardContainers.tableau)) {
      return `${this.cardContainers.tableau}-${card.positionData.index}`;
    } else if (
      card.positionData.parent.includes(this.cardContainers.foundation)
    ) {
      return `${this.cardContainers.foundation}-${card.positionData.index}`;
    } else if (card.positionData.parent.includes(this.cardContainers.stock)) {
      return `${this.cardContainers.stock}-0`;
    }
    return `${this.cardContainers.waste}-0`;
  }

  getElementFrom(source) {
    if (source.startsWith(this.cardContainers.tableau)) {
      const index = parseInt(source.split("-")[1]);
      return this.stateManager.getCardsComponents().tableaus[index];
    } else if (source.startsWith(this.cardContainers.foundation)) {
      const index = parseInt(source.split("-")[1]);
      return this.stateManager.getCardsComponents().foundations[index];
    } else if (source.startsWith(this.cardContainers.stock)) {
      return this.stateManager.getCardsComponents().stock;
    } else if (source.startsWith(this.cardContainers.waste)) {
      return this.stateManager.getCardsComponents().waste;
    }
  }

  removeCardFromSource(card, source, elementFrom) {
    if (source.startsWith(this.cardContainers.tableau)) {
      return elementFrom.removeCardsFrom(card);
    } else if (source.startsWith(this.cardContainers.foundation)) {
      return [elementFrom.removeTopCard()];
    } else if (source.startsWith(this.cardContainers.stock)) {
      return [elementFrom.removeTopCard()];
    } else if (source.startsWith(this.cardContainers.waste)) {
      return [elementFrom.removeTopCard()];
    }
  }

  async openNextCardIfNeeded(source) {
    if (!source.startsWith(this.cardContainers.tableau)) return null;
    console.log("source: ", source);

    const index = parseInt(source.split("-")[1]);

    const tableau = this.stateManager.getCardsComponents().tableaus[index];
    const card = tableau.getTopCard();
    if (card && !card.faceUp) {
      card.flip(true);
      await this.eventManager.emitAsync(GameEvents.CARD_FLIP, card);

      // Добавление картам событий: onpointerdown, onpointermove, onpointerup
      this.eventManager.emit(
        GameEvents.ADD_ONPOINTERDOWN_TO_CARD,
        card.domElement
      );
      this.eventManager.emit(
        GameEvents.ADD_ONPOINTERMOVE_TO_CARD,
        card.domElement
      );
      this.eventManager.emit(
        GameEvents.ADD_ONPOINTERUP_TO_CARD,
        card.domElement
      );
      /////////////////////

      this.stateManager.incrementStat(
        this.textCardsFlipped,
        this.typeCardFlipCheckAchievements
      );
      return card;
    }
    return null;
  }
}
