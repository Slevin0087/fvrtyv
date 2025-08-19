import { GameEvents } from "./Constants.js";
import { GameConfig } from "../configs/GameConfig.js";

export class Animator {
  static animateStockCardMove(params, duration = 500) {
    return new Promise((resolve, reject) => {
      try {
        const { card, tableau, onComplete, onError } = params;

        const cardElement = card.domElement;
        const oldOffsetX = card.positionData.offsetX;
        const oldOffsetY = card.positionData.offsetY;
        // FLIP: First - запоминаем начальное положение
        const initialRect = cardElement.getBoundingClientRect();

        tableau.addCard(card);
        // void cardElement.offsetHeight; // Это заставляет браузер применить стили

        const newOffsetX = card.positionData.offsetX;
        const newOffsetY = card.positionData.offsetY;
        // FLIP: Last - меняем родителя и устанавливаем конечное состояние
        tableau.element.append(cardElement);
        void cardElement.offsetHeight; // Это заставляет браузер применить стили

        // cardElement.style.transform = `translate(0, ${offset}px)`;
        const lastRect = cardElement.getBoundingClientRect();
        cardElement.style.zIndex = `100`;

        // FLIP: Invert - получаем конечное положение и вычисляем разницу
        const deltaX = initialRect.left - lastRect.left + oldOffsetX;
        const deltaY = initialRect.top - lastRect.top + oldOffsetY;

        // FLIP: Play - запускаем анимацию
        // Временно возвращаем элемент в начальную позицию с помощью transform
        cardElement.style.transform = `translate(${oldOffsetX}px, ${oldOffsetY}px)`;

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
          onComplete();
          resolve();
        };

        animation.oncancel = () => {
          onError(new Error("Animation was cancelled"));
          reject();
        };
      } catch (error) {
        console.log(error);
      }
    });
  }

  static animateCardMove(
    card,
    source,
    elementFrom,
    containerTo,
    movementSystem,
    duration = 300
  ) {
    return new Promise((resolve, reject) => {
      const removedCards = movementSystem.removeCardFromSource(
        card,
        source,
        elementFrom
      );
      removedCards.forEach((card) => {
        const cardElement = card.domElement;
        // 1. First - сохраняем начальное положение ДО любых изменений
        // Получаем начальные координаты карты
        const initialRect = cardElement.getBoundingClientRect();

        const oldOffsetX = card.positionData.offsetX;
        const oldOffsetY = card.positionData.offsetY;
        containerTo.addCard(card);
        containerTo.element.append(cardElement);
        movementSystem.eventManager.emit(
          GameEvents.SET_CARD_DATA_ATTRIBUTE,
          cardElement,
          GameConfig.dataAttributes.cardParent,
          card.positionData.parent
        );
        movementSystem.eventManager.emit(
          GameEvents.SET_CARD_DATA_ATTRIBUTE,
          cardElement,
          GameConfig.dataAttributes.cardDnd
        );
        const newOffsetX = card.positionData.offsetX;
        const newOffsetY = card.positionData.offsetY;

        void cardElement.offsetHeight; // Это заставляет браузер применить стили

        // Получаем конечную позицию
        const lastRect = cardElement.getBoundingClientRect();
        cardElement.style.zIndex = "100";

        // 5. Invert - теперь дельты будут корректны
        const deltaX = initialRect.left - lastRect.left + oldOffsetX;
        const deltaY = initialRect.top - lastRect.top + oldOffsetY;

        // 9. Запускаем анимацию
        const animation = cardElement.animate(
          [
            { transform: `translate(${deltaX}px, ${deltaY}px)` },
            { transform: `translate(${newOffsetX}px, ${newOffsetY}px)` },
          ],
          {
            duration,
            easing: "linear",
          }
        );

        // 10. По завершении фиксируем результат
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
        // fill: "forwards",
      }
    );

    return await phase1.finished;

    // // Вторая фаза анимации (продолжение вращения + возврат к исходному размеру)
    // const phase2 = element.animate(
    //   [
    //     { transform: `rotate(360deg) scale(1.2)` },
    //     { transform: `rotate(720deg) scale(1)` },
    //   ],
    //   {
    //     duration: 1000,
    //     easing: "ease-in-out",
    //     fill: "forwards",
    //   }
    // );

    // await phase2.finished;

    // Сбрасываем стили после завершения
    element.style.transform = "";
  }

  static animateCardToWaste(card, toElement, duration = 50) {
    return new Promise((resolve, reject) => {
      const cardElement = card.domElement;

      // 1. First - сохраняем начальное положение ДО любых изменений
      // Получаем начальные координаты карты
      const initialRect = cardElement.getBoundingClientRect();

      toElement.append(cardElement);
      const offsetX = card.positionData.offsetX;

      const offsetY = card.positionData.offsetY;
      void cardElement.offsetHeight; // Это заставляет браузер применить стили
      // Устанавливаем конечное положение
      // const targetTop =
      //   targetContainer === stock.wasteElement ? newOffset : oldOffset;
      // cardElement.style.position = "absolute";
      // cardElement.style.transform = `translate(${offset}px, ${-offset}px)`;
      // cardElement.style.zIndex = `10000`;
      // Снова синхронизируем
      // void cardElement.offsetHeight;

      // 4. Получаем конечную позицию
      const lastRect = cardElement.getBoundingClientRect();

      // 5. Invert - теперь дельты будут корректны
      const deltaX = initialRect.left - lastRect.left;
      const deltaY = initialRect.top - lastRect.top;

      // 9. Запускаем анимацию
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
      // 10. По завершении фиксируем результат
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
          card.flipped = !card.flipped;
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

  static animationCoinsEarned(text, options = {}) {
    return new Promise((resolve) => {
      // Параметры по умолчанию
      const {
        duration = 3, // Продолжительность в секундах (GSAP использует секунды)
        fontSize = "24px",
        targetFontSize = "32px",
        color = "#ffeb3b",
        position = "bottom",
        fadeInDuration = 0.3,
        fadeOutDuration = 1,
      } = options;

      // Создаем элемент для текста
      const textElement = document.createElement("div");
      textElement.className = "animated-text";
      textElement.textContent = text;
      textElement.style.position = "fixed";
      textElement.style.color = color;
      textElement.style.fontSize = fontSize;
      textElement.style.fontWeight = "bold";
      textElement.style.textShadow = "0 0 5px rgba(0,0,0,0.5)";
      textElement.style.pointerEvents = "none";
      textElement.style.zIndex = "2000";
      textElement.style.opacity = "0";
      textElement.style.whiteSpace = "nowrap"; // Предотвращаем перенос текста

      // Позиционирование
      switch (position) {
        case "center":
          textElement.style.left = "50%";
          textElement.style.top = "50%";
          textElement.style.transform = "translate(-50%, -50%)";
          break;
        case "top":
          textElement.style.left = "50%";
          textElement.style.top = "20%";
          textElement.style.transform = "translateX(-50%)";
          break;
        case "bottom":
          textElement.style.left = "50%";
          textElement.style.bottom = "20%";
          textElement.style.transform = "translateX(-50%)";
          break;
        default:
          if (position.x !== undefined && position.y !== undefined) {
            textElement.style.left = `${position.x}px`;
            textElement.style.top = `${position.y}px`;
          }
      }

      document.body.appendChild(textElement);

      // GSAP анимация
      const timeline = gsap.timeline({
        onComplete: () => {
          textElement.remove();
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

  static animateAchievementText() {
  const span = document.getElementById('achievements_span');  
  gsap.fromTo(span, 
    { scale: 1, opacity: 1 },
    {
      scale: 1.5,
      opacity: 0.8,
      duration: 1.2,
      yoyo: true,
      repeat: 1,
      ease: "power1.inOut"
    }
  );
}
}
