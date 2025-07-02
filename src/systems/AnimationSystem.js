import { GameEvents } from "../utils/Constants.js";
import { Animator } from "../utils/Animator.js";
import { UIConfig } from "../configs/UIConfig.js";

export class AnimationSystem {
  constructor(eventManager, stateManager) {
    // this.components = {};
    this.eventManager = eventManager;
    this.stateManager = stateManager;
    this.animationsQueue = [];
    this.isAnimating = false;
    this.cardMoveDuration = UIConfig.animations.cardMoveDuration;
    this.startMoveSpeed = UIConfig.animations.startMoveSpeed;
    this.cardFlipDuration = UIConfig.animations.cardFlipDuration;
    this.cardStockFlipDuration = UIConfig.animations.cardStockFlipDuration;
    this.wasteCardFlip = UIConfig.animations.wasteCardFlip;

    this.init();
  }

  init() {
    // this.registerComponents();
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.eventManager.on(
      GameEvents.UI_ANIMATION_POINTS_EARNED,
      (card, score) => {
        setTimeout(() => {
          Animator.showPointsAnimation(card, score);
        }, 200);
      }
    );

    this.eventManager.on(GameEvents.ANIMATION_COINS_EARNED, (text) => {
      setTimeout(() => {
        Animator.animationCoinsEarned(text);
      }, 200);
    });

    // this.eventManager.on("ui:animate:move", (card, from, to, callback) =>
    //   this.animateCardMove(card, from, to, callback)
    // );

    this.eventManager.on(GameEvents.CARD_FLIP, async (params) => {
      console.log("в AnimationSystems CARD_FLIP");

      await this.animateCardFlip(params, this.cardFlipDuration);
      this.eventManager.emit(GameEvents.AUDIO_CARD_FLIP);
    });

    this.eventManager.on(
      GameEvents.ANIMATE_CARD_MOVE,
      (card, source, elementFrom, elementTo, movementSystem) => {
        Animator.animateCardMove(
          card,
          source,
          elementFrom,
          elementTo,
          movementSystem,
          this.cardMoveDuration
        );
      }
    );

    this.eventManager.on(GameEvents.ANIMATE_STOCK_CARD_MOVE, async (params) => {
      console.log("ddddddddd");

      await Animator.animateStockCardMove(params, this.startMoveSpeed);
    });

    this.eventManager.on(GameEvents.ANIMATE_CARD_TO_WASTE, async (params) => {
      await this.animateCardToWaste(params);
    });

    this.eventManager.on("ui:animate:return", (dragState) =>
      this.animateReturnToSource(dragState)
    );

    this.eventManager.on("ui:animate:undo", (moveData, callback) =>
      this.animateUndoMove(moveData, callback)
    );

    // this.eventManager.on(GameEvents.UI_ANIMATE_DEAL_CARDS, () => this.dealCardsAnimation());

    this.eventManager.on("ui:animate:win", () => this.playWinAnimation());

    this.eventManager.on("card:select", (card) => this.highlightCard(card));

    this.eventManager.on("card:deselect", (card) => this.unhighlightCard(card));
  }

  // registerComponents() {
  //   this.components = {
  //     animator: Animator(),
  //   }
  // }

  dealCardsAnimation() {
    const tableauElements = [];
    const stockElement = document.getElementById("stock");
    console.log("stockElement:", stockElement);

    this.stateManager.state.currentGame.components.tableaus.forEach(
      (tableau) => {
        tableauElements.push(tableau.element);
      }
    );
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

  async animateCardToWaste(params) {
    const { card, stock, backStyle, faceStyle } = params;
    await Animator.animateCardToWaste(card, stock);

    await new Promise((resolve) =>
      setTimeout(resolve, this.wasteCardFlip * 1000)
    );

    await this.animateCardFlip(
      { card, backStyle, faceStyle },
      this.wasteCardFlip
    );
  }

  async animateCardFlip(params, duration) {
    const { card, backStyle, faceStyle } = params;
    console.log("ddddddddddddddddddddddddddddd");

    if (!card.domElement || card.isAnimating) return;

    card.isAnimating = true;
    try {
      await Animator.flipCard(
        card,
        () => {
          // Колбэк на середине анимации (90 градусов)
          card.domElement.innerHTML = "";
          const topSymbol = document.createElement("span");
          topSymbol.className = "card-symbol top";
          topSymbol.textContent = card.getSymbol();

          const centerSymbol = document.createElement("span");
          centerSymbol.className = "card-symbol center";
          centerSymbol.textContent = card.suit;

          const bottomSymbol = document.createElement("span");
          bottomSymbol.className = "card-symbol bottom";
          bottomSymbol.textContent = card.getSymbol();
          card.domElement.classList.remove(backStyle);
          card.domElement.classList.add(faceStyle);
          card.domElement.append(topSymbol, centerSymbol, bottomSymbol);
        },
        duration
      );
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

  animateUndoMove(moveData, callback) {
    const animation = async () => {
      this.isAnimating = true;

      const { card, from, to } = moveData;
      await this.animateCardMove(card, to, from, callback);

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
