import {
  GameEvents,
  AnimationDurations,
  AnimationDegs,
  AudioName,
} from "../../utils/Constants.js";
import { Animator } from "../../utils/Animator.js";
import { UIConfig } from "../../configs/UIConfig.js";
import { Helpers } from "../../utils/Helpers.js";
import { AnimationsVictory } from "../../utils/AnimationsVictory.js";

export class AnimationSystem {
  constructor(eventManager, stateManager, cardsSystem, audioManager) {
    this.eventManager = eventManager;
    this.stateManager = stateManager;
    this.audioManager = audioManager;
    this.state = this.stateManager.state;
    this.cardsSystem = cardsSystem;
    this.animationsQueue = [];
    this.isAnimating = false;
    this.cardMoveDuration = UIConfig.animations.cardMoveDuration;
    this.startMoveSpeed = UIConfig.animations.startMoveSpeed;
    this.cardFlipDuration = UIConfig.animations.cardFlipDuration;

    this.cardStockFlipDuration = UIConfig.animations.cardStockFlipDuration;
    this.wasteCardFlip = AnimationDurations.WASTE_CARD_FLIP;
    this.degsCardFlip = AnimationDegs.CARD_FLIP;
    this.degsBackCardFlip = AnimationDegs.BACK_CARD_FLIP;
    this.cardWidth = 100;
    this.cardHeight = 140;

    this.init();
  }

  init() {
    this.registerComponents();
    this.setupEventListeners();
  }

  registerComponents() {
    this.animationsVictory = new AnimationsVictory(
      this.eventManager,
      this.stateManager
    );
  }

  setupEventListeners() {
    this.eventManager.on(
      GameEvents.UI_ANIMATION_POINTS_EARNED,
      (card, score, operator) => {
        if (operator === "+") this.eventManager.emit(GameEvents.AUDIO_UP_SCORE);
        Animator.showPointsAnimation(card, score, operator);
      }
    );

    this.eventManager.on(GameEvents.ANIMATION_COINS_EARNED, (text) => {
      setTimeout(() => {
        Animator.animationCoinsEarned(text);
      }, 200);
    });

    this.eventManager.onAsync(GameEvents.CARD_FLIP, async (card) => {
      this.cardFlipDuration = this.audioManager.getSound(
        AudioName.CARD_FLIP
      ).duration;
      await this.animateCardFlip(
        card,
        this.degsCardFlip,
        this.cardFlipDuration
      );
    });

    this.eventManager.on(GameEvents.CARD_FLIP, async (card) => {
      console.log('ddddddddddddddddd');
      
      this.cardFlipDuration = this.audioManager.getSound(
        AudioName.CARD_FLIP
      ).duration;
      await this.animateCardFlip(
        card,
        this.degsCardFlip,
        this.cardFlipDuration
      );
    });

    this.eventManager.on(GameEvents.BACK_CARD_FLIP, async (card) => {
      this.cardFlipDuration = this.audioManager.getSound(
        AudioName.CARD_FLIP
      ).duration;
      await this.animateBackCardFlip(
        card,
        this.degsBackCardFlip,
        this.cardFlipDuration
      );
    });

    this.eventManager.onAsync(GameEvents.BACK_CARD_FLIP, async (card) => {
      this.cardFlipDuration = this.audioManager.getSound(
        AudioName.CARD_FLIP
      ).duration;
      await this.animateBackCardFlip(
        card,
        this.degsBackCardFlip,
        this.cardFlipDuration
      );
    });

    this.eventManager.on(
      GameEvents.ANIMATE_CARD_MOVE,
      (card, source, elementFrom, containerTo, movementSystem) => {
        Animator.animateCardMove(
          card,
          source,
          elementFrom,
          containerTo,
          movementSystem,
          this.cardMoveDuration
        );
      }
    );

    this.eventManager.on(
      GameEvents.ANIMATE_UNDO_TO_WASTE,
      (card, toElement) => {
        this.animateCardToWaste(card, toElement);
      }
    );

    this.eventManager.on(
      GameEvents.ANIMATE_CARD_TO_WASTE,
      async (card, toElement) => {
        await this.animateCardToWaste(card, toElement);

        await new Promise((resolve) =>
          setTimeout(resolve, this.wasteCardFlip * 1000)
        );

        await this.animateCardFlip(card, this.degsCardFlip, this.wasteCardFlip);
      }
    );

    this.eventManager.on(
      GameEvents.ANIMATE_CARD_WASTE_STOCK,
      (card, toElement) => {
        this.animateCardFromWaste(card, toElement);
      }
    );

    // this.eventManager.on(GameEvents.UI_ANIMATE_DEAL_CARDS, () => this.dealCardsAnimation());

    this.eventManager.on(GameEvents.UI_ANIMATE_WIN, () =>
      this.playWinAnimation()
    );
  }

  // registerComponents() {
  //   this.components = {
  //     animator: Animator(),
  //   }
  // }

  dealCardsAnimation() {
    const tableauElements = [];
    const stockElement = document.getElementById("stock");
    this.state.currentGame.components.tableaus.forEach((tableau) => {
      tableauElements.push(tableau.element);
    });
    Animator.dealCardsAnimation(stockElement, tableauElements);
  }

  // animateCardMove(card, fromId, toId, callback) {
  //   const animation = async () => {
  //     this.isAnimating = true;

  //     const fromElement = document.getElementById(fromId);
  //     const toElement = document.getElementById(toId);
  //     const cardElement = card.cardEl;

  //     if (!fromElement || !toElement || !cardElement) {
  //       console.error("Animation elements not found");
  //       this.isAnimating = false;
  //       return;
  //     }

  //     // Сохраняем исходное положение
  //     const originalPosition = {
  //       parent: cardElement.parentNode,
  //       zIndex: cardElement.style.zIndex,
  //       transform: cardElement.style.transform,
  //     };

  //     // Подготовка к анимации
  //     cardElement.style.zIndex = "1000";
  //     document.body.appendChild(cardElement);

  //     // Анимация перемещения
  //     await Animator.move({
  //       element: cardElement,
  //       from: fromElement,
  //       to: toElement,
  //       duration: 300,
  //     });

  //     // Возвращаем карту в DOM
  //     if (callback) callback();

  //     // Восстанавливаем исходные стили
  //     cardElement.style.zIndex = originalPosition.zIndex;
  //     cardElement.style.transform = originalPosition.transform;

  //     this.isAnimating = false;
  //     this.processQueue();
  //   };

  //   this.addToQueue(animation);
  // }

  // animateCardFlip(card, backClass, faceClass) {
  //   // console.log("в аниматоре");

  //   const animation = async () => {
  //     this.isAnimating = true;

  //     await Animator.flipCard(card, backClass, faceClass);

  //     this.isAnimating = false;
  //     this.processQueue();
  //   };

  //   this.addToQueue(animation);
  // }

  // async animateCardToWaste(card, stock, backClass, faceClass) {
  //   Animator.animateCardToWaste(wasteCard, stock);
  //   setTimeout(() => {
  //     this.animateCardFlip(wasteCard, backClass, faceClass);
  //     setTimeout(() => {
  //       const wasteOverlap =
  //         (stock.wasteElement.childNodes.length - 1) * stock.stockOverlap;
  //       wasteCard.domElement.style.transform = `translateX(${wasteOverlap}px) translateY(${-wasteOverlap}px)`;
  //     }, 300);
  //   }, this.cardStockFlipDuration);
  // }

  async animateCardToWaste(card, toElement) {
    await Animator.animateCardToWaste(card, toElement);
  }

  async animateCardFromWaste(card, toElement) {
    await Animator.animateCardToWaste(card, toElement);

    await new Promise((resolve) =>
      setTimeout(resolve, this.wasteCardFlip * 1000)
    );

    await this.animateBackCardFlip(card, this.degsCardFlip, this.wasteCardFlip);
  }

  async animateCardFlip(card, deg, duration) {
    console.log("duration: ", duration);

    if (!card.domElement || card.isAnimating) return;
    try {
      const cardDomElement = card.domElement;
      const { backStyle, faceStyle } = this.cardsSystem.getCardStyles();

      card.isAnimating = true;

      const promiseAnimate = Animator.flipCard(
        card,
        () => {
          // Колбэк на середине анимации (90 градусов)
          cardDomElement.innerHTML = "";
          cardDomElement.className = "";
          if (backStyle.bgType === "images") {
            this.eventManager.emit(GameEvents.RESET_CARD_BG_IMAGE, card);
          }
          if (faceStyle.bgType === "styles") {
            this.eventManager.emit(
              GameEvents.ADD_CARD_FRONT_CLASS,
              faceStyle,
              card
            );
          } else if (faceStyle.bgType === "images") {
            this.eventManager.emit(
              GameEvents.ADD_CARD_FRONT_IMAGE,
              card,
              faceStyle
            );
          }
          cardDomElement.classList.add("card-front", card.color);
        },
        deg,
        this.eventManager,
        duration
      );

      if (this.stateManager.getSoundEnabled()) {
        const audioCardMove = this.audioManager.getSound(AudioName.CARD_FLIP);

        // const audioPlaySpeed =
        //   this.startMoveSpeed / (audioCardMove.duration * 100);

        // audioCardMove.playbackRate = audioPlaySpeed;

        const promiseAudio = audioCardMove.play().catch((error) => {
          console.warn("Звук не воспроизведён:", error.name);
          return Promise.resolve();
        });

        await Promise.all([promiseAudio, promiseAnimate]);
      } else {
        await promiseAnimate;
      }
    } catch (error) {
      console.error("Card flip failed:", error);
      throw error;
    } finally {
      card.isAnimating = false;
    }
  }

  async animateBackCardFlip(card, deg, duration) {
    if (!card.domElement || card.isAnimating) return;

    try {
      const { backStyle, faceStyle } = this.cardsSystem.getCardStyles();
      card.isAnimating = true;
      card.flip(false);

      const promiseAnimate = Animator.flipCard(
        card,
        () => {
          // Колбэк на середине анимации (90 градусов)
          card.domElement.innerHTML = "";
          card.domElement.className = "";
          if (faceStyle.bgType === "images") {
            this.eventManager.emit(GameEvents.RESET_CARD_BG_IMAGE, card);
          }
          if (backStyle.bgType === "styles") {
            this.eventManager.emit(
              GameEvents.ADD_CARD_BACK_CLASS,
              backStyle,
              card.domElement
            );
          }
          if (backStyle.bgType === "images") {
            this.eventManager.emit(
              GameEvents.ADD_CARD_BACK_IMAGE,
              backStyle,
              card.domElement
            );
          }
          card.domElement.classList.add("card-back");
        },
        deg,
        this.eventManager,
        duration
      );
      if (this.stateManager.getSoundEnabled()) {
        const audioCardMove = this.audioManager.getSound(AudioName.CARD_FLIP);
        const promiseAudio = audioCardMove.play().catch((error) => {
          console.warn("Звук не воспроизведён:", error.name);
          return Promise.resolve();
        });

        await Promise.all([promiseAudio, promiseAnimate]);
      } else {
        await promiseAnimate;
      }
      card.isAnimating = false;
    } catch (error) {
      throw new Error(error);
    }
  }

  animateReturnToSource(dragState) {
    const animation = async () => {
      this.isAnimating = true;

      const { element, startX, startY } = dragState;
      const rect = element.getBoundingClientRect();

      await Animator.animate({
        element,
        from: { x: rect.left, y: rect.top },
        to: { x: startX, y: startY },
        duration: 300,
        easing: "ease-out",
      });

      this.isAnimating = false;
      this.processQueue();
    };

    this.addToQueue(animation);
  }

  playWinAnimation() {
    const animation = async () => {
      this.isAnimating = true;

      const cards = document.querySelectorAll(".card");
      const animations = [];

      // Анимация для каждой карты
      cards.forEach((card, index) => {
        animations.push(
          Animator.animate({
            element: card,
            from: { rotate: 0, scale: 1 },
            to: { rotate: 360, scale: 1.2 },
            duration: 1000,
            delay: index * 50,
            easing: "ease-in-out",
          }).then(() =>
            Animator.animate({
              element: card,
              from: { rotate: 360, scale: 1.2 },
              to: { rotate: 720, scale: 1 },
              duration: 1000,
              easing: "ease-in-out",
            })
          )
        );
      });

      await Promise.all(animations);
      this.isAnimating = false;
      this.processQueue();
    };

    this.addToQueue(animation);
  }

  highlightCard(card) {
    if (!card.cardEl) return;

    Animator.pulse(card.cardEl, 1000);
    card.cardEl.style.boxShadow = "0 0 15px gold";
  }

  unhighlightCard(card) {
    if (!card.cardEl) return;

    Animator.stop(card.cardEl);
    card.cardEl.style.boxShadow = "";
  }

  addToQueue(animationFn) {
    this.animationsQueue.push(animationFn);
    if (!this.isAnimating) {
      this.processQueue();
    }
  }

  processQueue() {
    if (this.animationsQueue.length > 0 && !this.isAnimating) {
      const nextAnimation = this.animationsQueue.shift();
      nextAnimation();
    }
  }
}
