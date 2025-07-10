import { GameEvents } from "./Constants.js";

export class Animator {
  static animateStockCardMove(params, duration = 500) {
    return new Promise((resolve, reject) => {
      try {
        const { card, tableau, onComplete, onError } = params;
        
        const cardElement = card.domElement;
        const oldOffsetX = card.positionData.offsetX;
        const oldOffsetY = card.positionData.offsetY;
        console.log("в animateStockCardMove oldOffsetX, oldOffsetY", oldOffsetX, oldOffsetY);

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
        cardElement.style.zIndex = `10000`;

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

  // static animateCardMove(card, data, duration = 10) {
  //   return new Promise((resolve) => {
  //     const cardElement = card.domElement;
  //     console.log("data:", data);

  //     const offset = 20;

  //     // Получаем конечную позицию (центрируем относительно последней карты в цели)
  //     // const targetCard = data.targetCard || null;
  //     // console.log("targetCard.positionData:", targetCard?.positionData);
  //     // const targetElement = targetCard?.domElement || data.target;
  //     // console.log("targetCard, targetElement:", targetCard, targetElement);

  //     // Сбрасываем текущие трансформации
  //     gsap.set(cardElement, {
  //       x: 0,
  //       y: 0,
  //       zIndex: 1000,
  //     });

  //     // Создаем timeline для последовательной анимации
  //     const tl = gsap.timeline({
  //       onComplete: () => {
  //         // После завершения перемещаем в DOM и устанавливаем финальное положение
  //         data.target.append(cardElement);
  //         gsap.set(cardElement, {
  //           y: 0,
  //           x: 0,
  //           zIndex: 1,
  //         });
  //         resolve();
  //       },
  //     });

  //     // Анимация перемещения
  //     tl.to(cardElement, {
  //       x: () => {
  //         return data.targetRectX - data.startRectX;
  //       },
  //       y: () => {
  //         return data.targetRectY - (data.startRectY + data.offset);
  //       },
  //       duration: duration * 0.9, // 90% времени на основное движение
  //       ease: "power2.out",
  //     });

  //     // Небольшая задержка перед завершением (10% от общего времени)
  //     tl.to({}, { duration: duration * 0.1 });
  //   });
  // }

  static animateCardMove(
    card,
    source,
    elementFrom,
    containerTo,
    movementSystem,
    duration = 300
  ) {
    return new Promise((resolve, reject) => {
      console.log("card, source, elementFrom:", card, source, elementFrom);

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
        console.log("containerTo:", containerTo);

        containerTo.addCard(card);
        containerTo.element.append(cardElement);

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

  // static animateCardMove(card, target, duration = 2000) {
  //   console.log("animateCardMove called for targetElement:", target.cards);
  //   // console.trace(); // Это покажет стек вызовов

  //   return new Promise((resolve) => {
  //     const cardElement = card.domElement;
  //     const tEl = target.cards[target.cards.length - 1];
  //     const targetElement = tEl.domElement;
  //     // console.log("tEl:", tEl);

  //     const startRect = cardElement.getBoundingClientRect();
  //     const targetRect = targetElement.getBoundingClientRect();
  //     console.log("startRect, targetRect:", startRect, targetRect);

  //     const offset = 20;
  //     // console.log("offset:", offset);

  //     const deltaX = targetRect.left - startRect.left;
  //     const deltaY = (targetRect.top + offset) - startRect.top;
  //     console.log("deltaX, deltaY:", deltaX, deltaY);

  //     // Подготовка
  //     cardElement.style.transition = "none";
  //     cardElement.style.transform = "none"
  //     cardElement.style.transform = `translate(0, 0)`; // Начальная позиция
  //     cardElement.style.zIndex = "1000";

  //     // requestAnimationFrame(() => {
  //     // Анимация к цели
  //     cardElement.style.transition = `transform ${duration}ms linear`;
  //     cardElement.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
  //     setTimeout(() => {
  //       console.log("в setTimeout");

  //       cardElement.style.zIndex = `${card.positionData.position}`;
  //       target.element.appendChild(cardElement);
  //       cardElement.style.transform = `translate(0, ${
  //         (target.cards.length - 1) * offset
  //       }px)`;
  //       resolve();
  //     }, duration * 1.5);
  //   });
  // }

  static animate({
    element,
    from,
    to,
    duration,
    delay = 0,
    easing = "linear",
  }) {
    return new Promise((resolve) => {
      element.style.transition = `all ${duration}ms ${easing}`;
      element.style.transform = `rotate(${from.rotate}deg) scale(${from.scale})`;

      setTimeout(() => {
        element.style.transform = `rotate(${to.rotate}deg) scale(${to.scale})`;

        setTimeout(() => {
          resolve();
        }, duration);
      }, delay);
    });
  }

  // static flipCard(card, backClass, faceClass, duration = 0.5) {
  //   return new Promise((resolve) => {
  //     // Устанавливаем начальную позицию
  //     gsap.set(card.domElement, {
  //       rotationY: 0,
  //     });

  //     // Создаем timeline для последовательной анимации
  //     const tl = gsap.timeline({
  //       onComplete: () => resolve(),
  //     });

  //     // Первая половина - разворот на 90 градусов
  //     tl.to(card.domElement, {
  //       rotationY: 90,
  //       duration: duration / 2,
  //       ease: "power1.out",
  //       onComplete: () => {
  //         const topSymbol = document.createElement("span");
  //         topSymbol.className = "card-symbol top";
  //         topSymbol.textContent = card.getSymbol();

  //         const centerSymbol = document.createElement("span");
  //         centerSymbol.className = "card-symbol center";
  //         centerSymbol.textContent = card.suit;

  //         const bottomSymbol = document.createElement("span");
  //         bottomSymbol.className = "card-symbol bottom";
  //         bottomSymbol.textContent = card.getSymbol();
  //         card.domElement.classList.remove(backClass);
  //         card.domElement.classList.add(faceClass);
  //         card.domElement.append(topSymbol, centerSymbol, bottomSymbol);
  //         // card.flipped = !card.flipped;
  //       },
  //     });

  //     // Вторая половина - завершение разворота
  //     tl.to(card.domElement, {
  //       rotationY: 0,
  //       duration: duration / 2,
  //       ease: "power1.in",
  //       onComplete: () => {
  //         card.flipped = !card.flipped;
  //       },
  //     });
  //   });
  // }

  static animateCardToWaste(card, toElement, duration = 50) {
    return new Promise((resolve, reject) => {
      const cardElement = card.domElement;

      // 1. First - сохраняем начальное положение ДО любых изменений
      // Получаем начальные координаты карты
      const initialRect = cardElement.getBoundingClientRect();

      toElement.append(cardElement);
      const offsetX = card.positionData.offsetX;

      const offsetY = card.positionData.offsetY;
      console.log("offsetX в animateCardToWaste:", offsetX);

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
        // console.log("offset в animateCardToWaste:", offset);
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

  // static showPointsAnimation(card, points) {
  //   // Получаем DOM-элемент карты
  //   const cardElement = card.domElement;
  //   if (!cardElement) return;

  //   // Создаем элемент для отображения очков
  //   const pointsElement = document.createElement("div");
  //   pointsElement.className = "points-popup";
  //   pointsElement.textContent = `+${points}`;

  //   // Позиционируем элемент относительно карты
  //   const cardRect = cardElement.getBoundingClientRect();
  //   pointsElement.style.left = `${cardRect.left + cardRect.width / 2 - 20}px`;
  //   pointsElement.style.top = `${cardRect.top}px`;

  //   // Добавляем в DOM
  //   document.body.appendChild(pointsElement);

  //   // Удаляем элемент после завершения анимации
  //   setTimeout(() => {
  //     pointsElement.remove();
  //   }, 1500);
  // }

  static showPointsAnimation(card, points, operator) {
    const cardElement = card.domElement;
    if (!cardElement) return;

    const pointsElement = document.createElement("div");
    pointsElement.className = "points-popup";
    pointsElement.textContent = `${operator}${points}`;

    // 1. Позиционирование через transform + left/top (для iOS)
    const cardRect = cardElement.getBoundingClientRect();
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

  // static animationCoinsEarned(text, options = {}) {
  //   return new Promise((resolve) => {
  //     // Параметры по умолчанию
  //     const {
  //       duration = 2000, // Общая продолжительность анимации
  //       fontSize = "24px", // Начальный размер шрифта
  //       targetFontSize = "32px", // Размер при увеличении
  //       color = "#ffeb3b", // Цвет текста
  //       position = "center", // Позиция на экране
  //       fadeInDuration = 300, // Длительность появления
  //       fadeOutDuration = 1000, // Длительность исчезновения
  //     } = options;

  //     // Создаем элемент для текста
  //     const textElement = document.createElement("div");
  //     textElement.className = "animated-text";
  //     textElement.textContent = text;
  //     textElement.style.position = "fixed";
  //     textElement.style.color = color;
  //     textElement.style.fontSize = fontSize;
  //     textElement.style.fontWeight = "bold";
  //     textElement.style.textShadow = "0 0 5px rgba(0,0,0,0.5)";
  //     textElement.style.pointerEvents = "none";
  //     textElement.style.zIndex = "2000";
  //     textElement.style.opacity = "0";
  //     textElement.style.transition = `all ${fadeInDuration}ms ease-out`;

  //     // Позиционирование
  //     switch (position) {
  //       case "center":
  //         textElement.style.top = "50%";
  //         textElement.style.left = "50%";
  //         textElement.style.transform = "translate(-50%, -50%)";
  //         break;
  //       case "top":
  //         textElement.style.top = "20%";
  //         textElement.style.left = "50%";
  //         textElement.style.transform = "translateX(-50%)";
  //         break;
  //       case "bottom":
  //         textElement.style.bottom = "20%";
  //         textElement.style.left = "50%";
  //         textElement.style.transform = "translateX(-50%)";
  //         break;
  //       default:
  //         if (position.x !== undefined && position.y !== undefined) {
  //           textElement.style.left = `${position.x}px`;
  //           textElement.style.top = `${position.y}px`;
  //         }
  //     }

  //     document.body.appendChild(textElement);

  //     // Анимация
  //     requestAnimationFrame(() => {
  //       // Фаза 1: Появление
  //       textElement.style.opacity = "1";

  //       setTimeout(() => {
  //         // Фаза 2: Увеличение
  //         textElement.style.transition = `all ${duration / 3}ms ease-in-out`;
  //         textElement.style.fontSize = targetFontSize;

  //         setTimeout(() => {
  //           // Фаза 3: Возврат к исходному размеру
  //           textElement.style.fontSize = fontSize;

  //           setTimeout(() => {
  //             // Фаза 4: Исчезновение
  //             textElement.style.transition = `opacity ${fadeOutDuration}ms ease-out`;
  //             textElement.style.opacity = "0";

  //             setTimeout(() => {
  //               textElement.remove();
  //               resolve();
  //             }, fadeOutDuration);
  //           }, duration / 3);
  //         }, duration / 3);
  //       }, fadeInDuration);
  //     });
  //   });
  // }

  static animationCoinsEarned(text, options = {}) {
    return new Promise((resolve) => {
      // Параметры по умолчанию
      const {
        duration = 2, // Продолжительность в секундах (GSAP использует секунды)
        fontSize = "24px",
        targetFontSize = "32px",
        color = "#ffeb3b",
        position = "center",
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
}
