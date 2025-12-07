import {
  GameEvents,
  AnimationOperators,
  AudioName,
} from "../../utils/Constants.js";
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
    gameModesManager,
    cardsSystem,
    audioManager,
    translator
  ) {
    this.eventManager = eventManager;
    this.stateManager = stateManager;
    this.state = this.stateManager.state;
    this.gameModesManager = gameModesManager;
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
      this.stateManager,
      this.gameModesManager
    );
    this.hintSystem = new HintSystem(
      this.eventManager,
      this.stateManager,
      this.audioManager,
      this.translator
    );
    this.undoSystem = new UndoSystem(
      this.eventManager,
      this.stateManager,
      this.gameModesManager,
      this.scoringSystem,
      this.audioManager
    );
    this.wasteSystem = new WasteSystem(this.eventManager, this.stateManager, this.audioManager);
    this.dragAndDrop = new DragAndDrop(
      this.eventManager,
      this.stateManager,
      this.gameModesManager,
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

    this.eventManager.onAsync(
      GameEvents.JOKER_CARD_MOVE,
      async (jokerCard, tableaus) => {
        await this.handleJokerCardMoveFromStockToTableaus(jokerCard, tableaus);
      }
    );

    this.eventManager.on(GameEvents.CARDS_COLLECT, () => this.cardsCollect());
    this.eventManager.on(GameEvents.HINT_BTN_CLICK, () =>
      this.hintSystem.provide()
    );
  }

  handleCardClick(card) {
    if (this.winSystem.check()) return;
    if (
      this.stateManager.getIsDealingCardsAnimation() ||
      this.stateManager.getIsAnimateCardFromStockToWaste()
    )
      return;
    if (!this.stateManager.getPlayerFirstCardClick()) {
      this.eventManager.emit(GameEvents.FIRST_CARD_CLICK);
      this.eventManager.emit(GameEvents.START_PLAY_TIME);
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
    const elementFrom = this.movementSystem.getElementFrom(source);
    const cardParentFoundationElForUndo = card.parentElement;
    const promiseAnimate = Animator.animateCardMove(
      card,
      source,
      elementFrom,
      containerTo,
      this.movementSystem,
      cardMoveDuration
    );
    if (this.stateManager.getSoundEnabled()) {
      const audioCardMove = this.audioManager.getSound(AudioName.CARD_MOVE);
      const promiseAudio = audioCardMove.play()
      await Promise.all([promiseAudio, promiseAnimate]);
    } else {
      await promiseAnimate;
    }
    const isWaste = this.getIsSource(source, GameConfig.cardContainers.waste);
    if (isWaste) {
      await this.wasteSystem.upTopThreeCards();
    }
    const isFoundationName =
      containerToName === GameConfig.cardContainers.foundation;
    const isFoundation = this.getIsSource(
      source,
      GameConfig.cardContainers.foundation
    );
    if (isFoundationName || isFoundation) {
      let isSourceFromFoundation = false;
      const score =
        this.gameModesManager.getCurrentModeScoring().moveToFoundation;
      const calculatedScore =
        this.scoringSystem.calculateScoresWithDealingCards(score, card.value);
      let operator = "";
      if (isFoundationName) {
        FoundationAnimation.playSuccessAnimation(card, containerTo);
        operator = this.addition;
        this.stateManager.incrementStat(
          this.textToFoundationCheckAchievements,
          this.typeToFoundationCheckAchievements
        );
        this.scoringSystem.addScores(calculatedScore);
        this.eventManager.emit(GameEvents.AUDIO_UP_SCORE);
      } else if (isFoundation) {
        console.log('isFoundation');
        
        operator = this.subtraction;
        isSourceFromFoundation = !isSourceFromFoundation;
        this.scoringSystem.subtractScores(calculatedScore);
      }

      Animator.showPointsAnimation(
        card,
        calculatedScore,
        operator,
        isSourceFromFoundation,
        cardParentFoundationElForUndo
      );
    }

    await this.handleOpenCard(card, source);

    const isStock = this.getIsSource(source, GameConfig.cardContainers.stock);
    const isUpLastMoves = this.gameModesManager.getIsUpLastMoves();
    if (!isStock && isUpLastMoves) {
      const lastMove = [
        {
          card,
          from: source,
          to: `${containerToName}-${containerToIndex}`,
        },
      ];
      this.undoSystem.updateLastMoves(lastMove);
      this.stateManager.updateMoves(this.numberMoves);
      this.eventManager.emit(GameEvents.UP_MOVES);
    }

    if (isFoundationName && this.stateManager.getAssistanceInCollection()) {
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
      const score = this.gameModesManager.getCurrentModeScoring().flipCard;
      const calculatedScore =
        this.scoringSystem.calculateScoresWithDealingCards(
          score,
          openCard.value
        );
      this.eventManager.emit(
        GameEvents.UI_ANIMATION_POINTS_EARNED,
        openCard,
        calculatedScore,
        this.addition
      );
      this.scoringSystem.addScores(calculatedScore);

      openCard.setDataAttribute(
        GameConfig.dataAttributes.cardParent,
        openCard.positionData.parent
      );
      openCard.setDataAttribute(GameConfig.dataAttributes.dataAttributeDND);

      this.eventManager.emit(GameEvents.IS_FACE_DOWN_CARD, openCard);
    }
  }

  async autoCardMoveToFoundations() {
    const { foundations, tableaus, waste } =
      this.stateManager.getCardsComponents();

    // Фильтруем непустые foundations
    const nonEmptyFoundations = foundations.filter((f) => !f.isEmpty());

    if (nonEmptyFoundations.length === 0) return;

    for (const foundation of nonEmptyFoundations) {
      // Пытаемся переместить из waste
      const movedFromWaste = await this.tryMoveToFoundation(
        foundation,
        waste.getTopCard()
      );

      if (movedFromWaste) continue;

      // Пытаемся переместить из tableaus
      for (const tableau of tableaus) {
        const movedFromTableau = await this.tryMoveToFoundation(
          foundation,
          tableau.getTopCard()
        );

        if (movedFromTableau) break;
      }
    }
  }

  async tryMoveToFoundation(foundation, card) {
    if (!card) return false;

    const canAccept = foundation.canAccept(
      card,
      this.stateManager.getCardsComponents()
    );

    if (!canAccept) return false;

    await this.handleCardMove({
      card,
      containerToIndex: foundation.index,
      containerTo: foundation,
      containerToName: GameConfig.cardContainers.foundation,
      cardMoveDuration: this.cardMoveDuration,
    });

    return true;
  }

  async cardsCollect() {
    this.stateManager.setUsedAutoCollectCards(true);
    await this.autoCollectCards();
    this.stateManager.setUsedAutoCollectCards(false);
  }

  async autoCollectCards() {

    // Проверяем условие выхода
    if (this.winSystem.check()) return;
    else {
      const gameComponents = this.stateManager.getCardsComponents();
      const { foundations, tableaus, stock, waste } = gameComponents;
      for (const tableau of tableaus) {
        if (tableau.cards.length > 0) {
          const card = tableau.cards[tableau.cards.length - 1];
          for (let i = 0; i < foundations.length; i++) {
            const canAccept = foundations[i].canAccept(card, gameComponents)
            if (canAccept) {
              this.eventManager.emit(GameEvents.CARD_MOVE, {
                card,
                containerToIndex: i,
                containerTo: foundations[i],
                containerToName: GameConfig.cardContainers.foundation,
                cardMoveDuration: this.cardMoveDuration,
              });
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

  async handleJokerCardMoveFromStockToTableaus(jokerCard, tableau) {
    if (!this.stateManager.getJokerUsed() || this.winSystem.check()) return;
    const source = this.movementSystem.getCardSource(jokerCard);
    const elementFrom = this.movementSystem.getElementFrom(source);
  }

  // Вспомогательная функция задержки
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  getIsSource(source, name) {
    return source.startsWith(name);
  }
}
