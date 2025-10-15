import { GameEvents } from "./Constants.js";
import { GameConfig } from "../configs/GameConfig.js";
import { UIConfig } from "../configs/UIConfig.js";
import { Translator } from "./Translator.js";

export class Animator {
  constructor() {
    this.animationsQueue = [];
    this.isAnimating = false;
  }
  static animateStockCardMove(params, duration = 500) {
    return new Promise((resolve, reject) => {
      try {
        const { card, tableau } = params;
        console.log("card animateStockCardMove: ", card, card.faceUp);

        const cardElement = card.domElement;
        const oldOffsetX = card.positionData.offsetX;
        const oldOffsetY = card.positionData.offsetY;

        // Запоминаем начальное положение
        const initialRect = cardElement.getBoundingClientRect();

        tableau.addCard(card);

        const newOffsetX = card.positionData.offsetX;
        const newOffsetY = card.positionData.offsetY;
        // Меняем родителя
        tableau.element.append(cardElement);
        void cardElement.offsetHeight; // Это заставляет браузер применить стили

        const lastRect = cardElement.getBoundingClientRect();
        cardElement.style.zIndex = `100`;

        // Получаем конечное положение и вычисляем разницу
        const deltaX = initialRect.left - lastRect.left + oldOffsetX;
        const deltaY = initialRect.top - lastRect.top + oldOffsetY;

        // Временно возвращаем элемент в начальную позицию с помощью transform
        // cardElement.style.transform = `translate(${oldOffsetX}px, ${oldOffsetY}px)`;

        // Запускаем анимацию к конечному состоянию
        const animation = cardElement.animate(
          [
            { transform: `translate(${deltaX}px, ${deltaY}px)` },
            { transform: `translate(${newOffsetX}px, ${newOffsetY}px)` },
          ],
          {
            duration,
            easing: "linear",
            // fill: "backwards",
          }
        );

        animation.onfinish = () => {
          // Убедимся, что конечное состояние зафиксировано
          cardElement.style.transform = `translate(${newOffsetX}px, ${newOffsetY}px)`;
          cardElement.style.zIndex = `${card.positionData.zIndex}`;
          resolve();
        };

        animation.oncancel = () => {
          // onError(new Error("Animation was cancelled"));
          reject();
        };
      } catch (error) {
        console.log(error);
      }
    });
  }

  static async animateCardMove(
    card,
    source,
    elementFrom,
    containerTo,
    movementSystem,
    duration = 3000
  ) {
    console.log("animateCardMove source: ", source);
    const removedCards = movementSystem.removeCardFromSource(
      card,
      source,
      elementFrom
    );
    console.log("removedCards: ", removedCards);

    // Звук перемещения карты, даже если перемещаются одновременно много карт, это бывавет только в tableau
    // должен быть только один раз звук перемещения, за одно перемещение
    movementSystem.eventManager.emit(GameEvents.AUDIO_CARD_MOVE);

    // Создаем массив промисов для всех анимаций
    const animationPromises = await removedCards.map((card) => {
      return new Promise((resolve, reject) => {
        const cardElement = card.domElement;
        const initialRect = cardElement.getBoundingClientRect();
        const oldOffsetX = card.positionData.offsetX;
        const oldOffsetY = card.positionData.offsetY;

        containerTo.addCard(card);
        containerTo.element.append(cardElement);

        const newOffsetX = card.positionData.offsetX;
        const newOffsetY = card.positionData.offsetY;
        void cardElement.offsetHeight;

        const lastRect = cardElement.getBoundingClientRect();
        cardElement.style.zIndex = "100";

        const deltaX = initialRect.left - lastRect.left + oldOffsetX;
        const deltaY = initialRect.top - lastRect.top + oldOffsetY;

        const animation = cardElement.animate(
          [
            { transform: `translate(${deltaX}px, ${deltaY}px)` },
            { transform: `translate(${newOffsetX}px, ${newOffsetY}px)` },
          ],
          { duration, easing: "linear" }
        );

        animation.onfinish = () => {
          cardElement.style.transform = `translate(${newOffsetX}px, ${newOffsetY}px)`;
          cardElement.style.zIndex = `${card.positionData.zIndex}`;
          resolve();
        };

        animation.oncancel = () => {
          reject(new Error("Animation was cancelled"));
        };
      });
    });

    // Ждем завершения ВСЕХ анимаций
    await Promise.all(animationPromises);
  }

  static animateCardFomStockToWaste(arr) {
    console.log("static animateCardFomStockToWaste arr: ", arr);
    return new Promise((resolve, reject) => {
      arr.forEach(({ card, oldOffsetX, oldOffsetY }) => {
        const duration = 3;
        const cardElement = card.domElement;

        // Получаем начальные координаты карты
        const initialRect = cardElement.getBoundingClientRect();
        const newOffsetX = card.positionData.offsetX;
        const newOffsetY = card.positionData.offsetY;

        void cardElement.offsetHeight; // Это заставляет браузер применить стили

        // Получаем конечную позицию
        const lastRect = cardElement.getBoundingClientRect();
        // cardElement.style.zIndex = "100";
        cardElement.style.zIndex = `${card.positionData.zIndex}`;

        const deltaX = initialRect.left - lastRect.left + oldOffsetX;
        const deltaY = initialRect.top - lastRect.top + oldOffsetY;

        // Запускаем анимацию
        const animation = cardElement.animate(
          [
            { transform: `translate(${deltaX}px, ${deltaY}px)` },
            { transform: `translate(${newOffsetX}px, ${newOffsetY}px)` },
          ],
          {
            // duration,
            easing: "linear",
          }
        );

        // По завершении фиксируем результат
        animation.onfinish = () => {
          cardElement.style.transform = `translate(${newOffsetX}px, ${newOffsetY}px)`;
          cardElement.style.zIndex = `${card.positionData.zIndex}`;
          resolve();
        };
        animation.oncancel = () => {
          reject(new Error("Animation was cancelled"));
        };
      });
    });
  }

  static async animate({
    element,
    from,
    to,
    duration,
    delay = 0,
    easing = "linear",
  }) {
    const phase1 = element.animate(
      [
        { transform: `rotate(${from.rotate}deg) scale(${from.scale})` },
        { transform: `rotate(${to.rotate}deg) scale(${to.scale})` },
      ],
      {
        duration,
        delay,
        easing,
      }
    );

    return await phase1.finished;
  }

  static animateCardToWaste(card, toElement, duration = 50) {
    return new Promise((resolve, reject) => {
      const cardElement = card.domElement;

      // Получаем начальные координаты карты
      const initialRect = cardElement.getBoundingClientRect();

      toElement.append(cardElement);
      const offsetX = card.positionData.offsetX;

      const offsetY = card.positionData.offsetY;
      void cardElement.offsetHeight; // Это заставляет браузер применить стили

      // Получаем конечную позицию
      const lastRect = cardElement.getBoundingClientRect();

      const deltaX = initialRect.left - lastRect.left;
      const deltaY = initialRect.top - lastRect.top;

      // Запускаем анимацию
      const animation = cardElement.animate(
        [
          { transform: `translate(${deltaX}px, ${deltaY}px)` },
          { transform: `translate(0, 0)` },
        ],
        {
          duration,
          easing: "linear",
        }
      );
      // По завершении фиксируем результат
      animation.onfinish = () => {
        cardElement.style.transform = `translateX(${offsetX}px) translateY(${offsetY}px)`;
        cardElement.style.zIndex = `${card.positionData.zIndex}`;
        resolve();
      };
      animation.oncancel = () => {
        reject(new Error("Animation was cancelled"));
      };
    });
  }

  static flipCard(card, onHalfFlip, deg, eventManager, duration = 1) {
    return new Promise((resolve, reject) => {
      const tl = gsap.timeline({
        onComplete: () => {
          eventManager.emit(GameEvents.AUDIO_CARD_FLIP);
          resolve();
        },
        onError: () => {
          reject(new Error("Card flip animation failed"));
        },
      });

      // Первая половина анимации - поворот на 90 градусов
      tl.to(card.domElement, {
        rotationY: deg,
        duration: duration / 2,
        ease: "power1.out",
        onComplete: () => {
          console.log("flipCard card: ", card);
          if (onHalfFlip) onHalfFlip();
        },
      });

      // Вторая половина - завершение поворота
      tl.to(card.domElement, {
        rotationY: 0,
        duration: duration / 2,
        ease: "power1.in",
      });
    });
  }

  static fadeIn(element, duration = 300) {
    return new Promise((resolve) => {
      element.style.opacity = "0";
      element.style.display = "block";
      element.style.transition = `opacity ${duration}ms ease-out`;

      requestAnimationFrame(() => {
        element.style.opacity = "1";
        setTimeout(resolve, duration);
      });
    });
  }

  static fadeOut(element, duration = 300) {
    return new Promise((resolve) => {
      element.style.opacity = "1";
      element.style.transition = `opacity ${duration}ms ease-out`;
      element.style.opacity = "0";

      setTimeout(() => {
        element.style.display = "none";
        resolve();
      }, duration);
    });
  }

  static pulse(element, duration = 1000, repeat = true) {
    element.style.animation = `pulse ${duration}ms infinite`;

    if (!repeat) {
      setTimeout(() => {
        element.style.animation = "";
      }, duration);
    }
  }

  static showPointsAnimation(
    card,
    points,
    operator,
    isSourceFromFoundation = false,
    cardParentFoundationElForUndo = null
  ) {
    const cardElement = card.domElement;
    if (!cardElement) return;

    const pointsElement = document.createElement("div");
    pointsElement.className = "points-popup";
    pointsElement.textContent = `${operator}${points}`;

    // 1. Позиционирование через transform + left/top (для iOS)
    const cardRect = isSourceFromFoundation
      ? cardParentFoundationElForUndo.getBoundingClientRect()
      : cardElement.getBoundingClientRect();
    pointsElement.style.left = `${cardRect.left + cardRect.width / 2}px`;
    pointsElement.style.top = `${cardRect.top}px`;

    // 2. Форсируем запуск анимации
    document.body.appendChild(pointsElement);
    // void pointsElement.offsetWidth; // Триггер перерасчёта стилей

    // Анимация через GSAP
    gsap.fromTo(
      pointsElement,
      {
        opacity: 1,
        x: "-50%",
        y: 0,
      },
      {
        opacity: 0,
        y: -100,
        duration: 1.2,
        ease: "power1.out",
        onComplete: () => pointsElement.remove(),
      }
    );
  }

  static animationTextAchievement(
    domElementTop,
    domElementBottom,
    dealingCards,
    achievement = {},
    duration = 5000
  ) {
    const { h4TextContent, spanRedStart, reward, currency } = achievement;
    const h4 = document.createElement("h4");
    const div = document.createElement("div");
    domElementTop.innerHTML = "";
    domElementBottom.innerHTML = "";
    domElementTop.append(h4);
    domElementBottom.append(div);
    h4.className = "ach-div-h4";
    h4.id = "ach-div-h4";
    h4.textContent = h4TextContent;
    div.className = "info-ach";
    div.id = "ach-info";
    // div.innerHTML = `
    //   <span class="ach-info-span-black">${title}:${" "}</span>
    //   <span class="ach-info-span-title-description" id="ach-info-span">${description}</span>`;
    // setTimeout(() => {
    div.innerHTML = `
        <span class="ach-info-span-black">${spanRedStart}:${" "}</span>
        <span class="ach-info-span-yellow" id="ach-info-span">${reward}x${dealingCards}${" "}</span>
        <span class="ach-info-span-title-description">${currency}</span>`;
    setTimeout(() => {
      domElementTop.innerHTML = "";
      domElementBottom.innerHTML = "";
    }, duration / 2);
    // }, duration / 2);
  }

  static animationSpansAch(spanElement, deltaX, deltaY, duration, n = 3) {
    const animateSpan = spanElement.animate(
      [
        {
          transform: `translate(${deltaX}px, ${deltaY}px)`,
        },
        { transform: `translate(0, 0)` },
      ],
      {
        duration: duration / n,
        easing: "linear",
      }
    );
    // 10. По завершении фиксируем результат
    animateSpan.onfinish = () => {
      spanElement.style.transform = `translate(0, 0)`;
      spanElement.style.zIndex = `0`;
      spanElement.remove();
    };
  }

  static animationCoinsEarned(text, options = {}) {
    return new Promise((resolve) => {
      // Параметры по умолчанию
      const {
        duration = 3, // Продолжительность в секундах (GSAP использует секунды)
        fontSize = "0.7rem",
        targetFontSize = "0.9rem",
        fadeInDuration = 0.3,
        fadeOutDuration = 1,
      } = options;

      // Создаем элемент для текста
      // const textElement = document.createElement("div");
      // textElement.className = "animation-win-coins-score-earned";
      // textElement.textContent = text;

      const textElement = document.getElementById("notification-toasts");
      textElement.textContent = text;

      // document.body.appendChild(textElement);
      // document.getElementById("notification-toasts").append(textElement);

      // GSAP анимация
      const timeline = gsap.timeline({
        onComplete: () => {
          // textElement.remove(); // Расскоментировать, для теста скрыл
          textElement.textContent = ''
          resolve();
        },
      });

      // 1. Появление
      timeline.fromTo(
        textElement,
        { opacity: 0 },
        { opacity: 1, duration: fadeInDuration }
      );

      // 2. Увеличение текста с сохранением позиции
      timeline.to(textElement, {
        fontSize: targetFontSize,
        duration: duration / 3,
        ease: "power1.inOut",
      });

      // 3. Возврат к исходному размеру
      timeline.to(textElement, {
        fontSize: fontSize,
        duration: duration / 3,
        ease: "power1.inOut",
      });

      // 4. Исчезновение
      timeline.to(textElement, {
        opacity: 0,
        duration: fadeOutDuration,
        ease: "power1.out",
      });
    });
  }

  static animateAchievementText(element) {
    gsap.fromTo(
      element,
      { scale: 1, opacity: 1 },
      {
        scale: 1.5,
        opacity: 0.8,
        duration: 1.2,
        yoyo: true,
        repeat: 1,
        ease: "power1.inOut",
      }
    );
  }

  static animateAchievementText2(element) {
    console.log("element:", element);

    gsap.fromTo(
      element,
      { scale: 1, opacity: 1 },
      {
        scale: 2,
        opacity: 0.8,
        duration: 1.2,
        yoyo: true,
        repeat: 1,
        ease: "power1.inOut",
      }
    );
  }

  static playWinAnimation() {
    const animation = async () => {
      this.isAnimating = true;

      const cards = document.querySelectorAll(".card");
      const animations = [];

      // Анимация для каждой карты
      cards.forEach((card, index) => {
        animations.push(
          this.animate({
            element: card,
            from: { rotate: 0, scale: 1 },
            to: { rotate: 360, scale: 1.2 },
            duration: 1000,
            delay: index * 50,
            easing: "ease-in-out",
          }).then(() =>
            this.animate({
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

  static processQueue() {
    if (this.animationsQueue.length > 0 && !this.isAnimating) {
      const nextAnimation = this.animationsQueue.shift();
      nextAnimation();
    }
  }

  static addToQueue(animationFn) {
    this.animationsQueue.push(animationFn);
    if (!this.isAnimating) {
      this.processQueue();
    }
  }

  static async animateShuffleCardsToStock(cards) {
    const animations = cards.map((card, index) => {
      return new Promise((resolve, reject) => {
        const cardElement = card.domElement;

        const animate = cardElement.animate(
          [
            { transform: "translate(0, 0) rotate(0deg)", offset: 0 },
            {
              transform: `translate(${(Math.random() - 0.5) * 25}px, ${
                (Math.random() - 0.5) * 15
              }px) rotate(${(Math.random() - 0.5) * 40}deg)`,
              offset: 0.5,
            },
            { transform: "translate(0, 0) rotate(0deg)", offset: 1 },
          ],

          {
            duration: 600 + Math.random() * 400,
            delay: index * 80,
            easing: "cubic-bezier(0.4, 0, 0.2, 1)",
          }
        );

        animate.onfinish = () => {
          cardElement.style.transform = `translate(${card.positionData.offsetX}px, ${card.positionData.offsetY}px)`;
          cardElement.style.zIndex = `${card.positionData.zIndex}`;
          resolve();
        };

        animate.oncancel = () => {
          reject(new Error("Animation was cancelled"));
        };
      });
    });

    // Ждем завершения всех анимаций
    await Promise.all(animations);
  }
}
