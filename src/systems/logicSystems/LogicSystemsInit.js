import { GameEvents, AnimationOperators } from "../../utils/Constants.js";
import { GameConfig } from "../../configs/GameConfig.js";
import { GameSetupSystem } from "./GameSetupSystem.js";
import { CardMovementSystem } from "./CardMovementSystem.js";
import { ScoringSystem } from "./ScoringSystem.js";
import { WasteSystem } from "./WasteSystem.js";
import { WinConditionSystem } from "./WinConditionSystem.js";
import { HintSystem } from "./HintSystem.js";
import { UndoSystem } from "./UndoSystem.js";
import { UIConfig } from "../../configs/UIConfig.js";
import { DragAndDrop } from "./DragAndDrop.js";
import { Animator } from "../../utils/Animator.js";
import { achType, achCheckName } from "../../configs/AchievementsConfig.js";
import { FoundationAnimation } from "../../utils/FoundationAnimation.js";

export class LogicSystemsInit {
  constructor(
    eventManager,
    stateManager,
    cardsSystem,
    audioManager,
    translator
  ) {
    this.eventManager = eventManager;
    this.stateManager = stateManager;
    this.state = this.stateManager.state;
    this.cardsSystem = cardsSystem;
    this.audioManager = audioManager;
    this.translator = translator;
    this.addition = AnimationOperators.ADDITION;
    this.subtraction = AnimationOperators.SUBTRACTION;
    this.numberMoves = GameConfig.rules.initialMove;
    this.cardMoveDuration = UIConfig.animations.cardMoveDuration;
    this.typeToFoundationCheckAchievements = achType.IN_GAME;
    this.textToFoundationCheckAchievements = achCheckName.CARDS_TO_FOUNDATION;
    this.setupSystems();
    this.setupEventListeners();
  }

  setupSystems() {
    this.setupSystem = new GameSetupSystem(
      this.eventManager,
      this.stateManager
    );
    this.winSystem = new WinConditionSystem(
      this.eventManager,
      this.stateManager,
      this.audioManager,
      this.translator
    );
    this.movementSystem = new CardMovementSystem(
      this.eventManager,
      this.stateManager,
      this.audioManager
    );
    this.scoringSystem = new ScoringSystem(
      this.eventManager,
      this.stateManager
    );
    this.hintSystem = new HintSystem(
      this.eventManager,
      this.stateManager,
      this.audioManager
    );
    this.undoSystem = new UndoSystem(
      this.eventManager,
      this.stateManager,
      this.audioManager
    );
    this.wasteSystem = new WasteSystem(this.eventManager, this.stateManager);
    this.dragAndDrop = new DragAndDrop(
      this.eventManager,
      this.stateManager,
      this.audioManager,
      this.movementSystem,
      this.scoringSystem,
      this.wasteSystem
    );
  }

  setupEventListeners() {
    this.eventManager.on(GameEvents.CARD_CLICK, (card) => {
      this.handleCardClick(card);
    });

    this.eventManager.on(GameEvents.CARD_MOVE, async (data) => {
      await this.handleCardMove(data);
    });

    this.eventManager.onAsync(GameEvents.CARD_MOVE, async (data) => {
      await this.handleCardMove(data);
    });
    this.eventManager.on(GameEvents.CARDS_COLLECT, () => this.cardsCollect());
    this.eventManager.on(GameEvents.HINT_BTN_CLICK, () =>
      this.hintSystem.provide()
    );
  }

  handleCardClick(card) {
    if (this.winSystem.check()) return;
    if (
      this.state.isDealingCardsAnimation ||
      this.state.isAnimateCardFomStockToWaste
    )
      return;
    if (!this.state.game.playerFirstCardClick) {
      this.eventManager.emit(GameEvents.FIRST_CARD_CLICK);
      this.eventManager.emit(GameEvents.START_PLAY_TIME, 0);
    }
    this.movementSystem.handleCardClick(card);
  }

  async handleCardMove({
    card,
    containerToIndex,
    containerTo,
    containerToName,
    cardMoveDuration,
  }) {
    const source = this.movementSystem.getCardSource(card);
    // let openCard = null
    console.log("const source: ", source);

    const elementFrom = this.movementSystem.getElementFrom(source);
    if (!source.startsWith(GameConfig.cardContainers.stock)) {
      const lastMove = [
        {
          card,
          from: source,
          to: `${containerToName}-${containerToIndex}`,
        },
      ];
      this.undoSystem.updateLastMoves(lastMove);
    }
    const cardParentFoundationElForUndo = card.parentElement;
    await Animator.animateCardMove(
      card,
      source,
      elementFrom,
      containerTo,
      this.movementSystem,
      cardMoveDuration
    );
    if (source.startsWith(GameConfig.cardContainers.waste)) {
      await this.wasteSystem.upTopThreeCards();
    }
    if (!source.startsWith(GameConfig.cardContainers.stock)) {
      this.stateManager.updateMoves(this.numberMoves);
      this.eventManager.emit(GameEvents.UP_MOVES);
    }
    if (
      containerToName === GameConfig.cardContainers.foundation ||
      source.startsWith(GameConfig.cardContainers.foundation)
    ) {
      const score = GameConfig.rules.scoreForFoundation;
      let operator = "";
      let isSourceFromFoundation = false;
      if (containerToName === GameConfig.cardContainers.foundation) {
        FoundationAnimation.playSuccessAnimation(card, containerTo);
        operator = this.addition;
        this.scoringSystem.addPoints(score);
        this.stateManager.incrementStat(
          this.textToFoundationCheckAchievements,
          this.typeToFoundationCheckAchievements
        );
      } else if (source.startsWith(GameConfig.cardContainers.foundation)) {
        operator = this.subtraction;
        isSourceFromFoundation = !isSourceFromFoundation;
        this.scoringSystem.addPoints(-score);
      }
      if (operator === this.addition)
        this.eventManager.emit(GameEvents.AUDIO_UP_SCORE);
      Animator.showPointsAnimation(
        card,
        this.scoringSystem.calculatePointsWithDealingCards(score),
        operator,
        isSourceFromFoundation,
        cardParentFoundationElForUndo
      );
    }

    await this.handleOpenCard(card, source);

    if (
      containerToName === GameConfig.cardContainers.foundation &&
      this.state.settings.assistanceInCollection
    ) {
      console.log("в if (containerToName");

      await this.autoCardMoveToFoundations();
    }

    if (this.winSystem.check()) {
      await this.winSystem.handleWin();
    }
  }

  async handleOpenCard(card, source) {
    const openCard = await this.movementSystem.openNextCardIfNeeded(source);

    card.openCard = openCard;
    if (openCard) {
      console.log("В if (openCard): ", card, openCard);
      const score = GameConfig.rules.scoreForCardFlip;
      this.eventManager.emit(
        GameEvents.UI_ANIMATION_POINTS_EARNED,
        openCard,
        this.scoringSystem.calculatePointsWithDealingCards(score),
        this.addition
      );
      this.scoringSystem.addPoints(score);

      openCard.setDataAttribute(
        GameConfig.dataAttributes.cardParent,
        openCard.positionData.parent
      );
      openCard.setDataAttribute(GameConfig.dataAttributes.dataAttributeDND);

      this.eventManager.emit(GameEvents.IS_FACE_DOWN_CARD, openCard);
    }
  }

  async autoCardMoveToFoundations() {
    const foundations = this.state.cardsComponents.foundations;
    let foundationsNotIsEmpty = [];
    for (let foundation of foundations) {
      if (!foundation.isEmpty()) {
        foundationsNotIsEmpty.push(foundation);
      }
    }

    if (foundationsNotIsEmpty.length > 0) {
      for (let foundation of foundationsNotIsEmpty) {
        const waste = this.state.cardsComponents.waste;
        const wasteTopCard = waste.getTopCard();
        if (
          wasteTopCard &&
          foundation.canAccept(wasteTopCard, this.state.cardsComponents)
        ) {
          await this.handleCardMove({
            card: wasteTopCard,
            containerToIndex: foundation.index,
            containerTo: foundation,
            cardMoveDuration: this.cardMoveDuration,
          });
        } else {
          console.log("!wasteTopCard");
          const tableaus = this.state.cardsComponents.tableaus;
          for (let tableau of tableaus) {
            const tableauTopCard = tableau.getTopCard();
            if (
              tableauTopCard &&
              foundation.canAccept(tableauTopCard, this.state.cardsComponents)
            ) {
              await this.handleCardMove({
                card: tableauTopCard,
                containerToIndex: foundation.index,
                containerTo: foundation,
                cardMoveDuration: this.cardMoveDuration,
              });
            }
          }
        }
      }
    }
  }

  async cardsCollect() {
    this.state.game.usedAutoCollectCards = true;
    const { tableaus, stock, waste } = this.state.cardsComponents;
    await this.autoCollectCards(tableaus, stock, waste);
    this.state.game.usedAutoCollectCards = false;
  }

  async autoCollectCards(tableaus, stock, waste) {
    // Проверяем условие выхода
    if (this.winSystem.check()) return;
    else {
      const gameComponents = this.state.cardsComponents;
      for (const tableau of tableaus) {
        if (tableau.cards.length > 0) {
          const card = tableau.cards[tableau.cards.length - 1];
          for (let i = 0; i < gameComponents.foundations.length; i++) {
            if (gameComponents.foundations[i].canAccept(card, gameComponents)) {
              const containerTo = gameComponents.foundations[i];
              const containerToName = GameConfig.cardContainers.foundation;
              this.eventManager.emit(GameEvents.CARD_MOVE, {
                card,
                containerToIndex: i,
                containerTo,
                containerToName,
                cardMoveDuration: this.cardMoveDuration,
              });
              // return true;
              await this.delay(this.cardMoveDuration + 100);
              await this.autoCollectCards(tableaus, stock, waste);
            }
          }
        }
      }
      if (waste.cards.length > 0) {
        const topCard = waste.cards[waste.cards.length - 1];
        const isMove = this.movementSystem.handleCardClick(topCard);
        if (isMove) {
          await this.delay(this.cardMoveDuration + 100);
          await this.autoCollectCards(tableaus, stock, waste);
        } else if (!isMove) {
          this.eventManager.emit(GameEvents.ADD_STOCK_EVENTS, stock, waste);
          await this.delay(this.cardMoveDuration + 100);
          await this.autoCollectCards(tableaus, stock, waste);
        }
      } else if (stock.cards.length > 0) {
        this.eventManager.emit(GameEvents.ADD_STOCK_EVENTS, stock, waste);
        await this.delay(this.cardMoveDuration + 100);
        await this.autoCollectCards(tableaus, stock, waste);
      }
    }
  }

  // Вспомогательная функция задержки
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
