export class FoundationAnimation {
  // Конфигурация анимаций
  static config = {
    card: {
      duration: 500,
      easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      keyframes: [
        { transform: "scale(1)", boxShadow: "0 0 0 rgba(255, 215, 0, 0)" },
        {
          transform: "scale(1.1)",
          boxShadow: "0 4px 20px rgba(255, 215, 0, 0.6)",
        },
        { transform: "scale(1)", boxShadow: "0 0 0 rgba(255, 215, 0, 0)" },
      ],
    },

    foundation: {
      duration: 600,
      easing: "ease-in-out",
      keyframes: [
        { boxShadow: "0 0 0 rgba(76, 175, 80, 0)", borderColor: "transparent" },
        {
          boxShadow: "0 0 12px rgba(76, 175, 80, 0.6)",
          borderColor: "rgba(76, 175, 80, 0.3)",
        },
        { boxShadow: "0 0 0 rgba(76, 175, 80, 0)", borderColor: "transparent" },
      ],
    },

    stackBounce: {
      duration: 400,
      easing: "cubic-bezier(0.68, -0.55, 0.27, 1.55)",
      keyframes: [
        { transform: "translateY(0)" },
        { transform: "translateY(-3px)" },
        { transform: "translateY(0)" },
      ],
    },
  };

  /**
   * Запускает все анимации успешного перемещения карты в фундамент
   * @param {Card} card - Объект карты
   * @param {Foundation} foundation - Объект фундамента
   * @param {Object} options - Опции анимации
   * @returns {Function} Функция для отмены всех анимаций
   */
  static playSuccessAnimation(card, foundation, options = {}) {
    const cardElement = card.domElement;
    const foundationElement = foundation.element;
    const allCards = foundation.cards.map((card) => card.domElement);

    // Запускаем все анимации
    const cardAnimation = this.animateCardLanding(cardElement, options);
    const foundationAnimation = this.animateFoundationGlow(
      foundationElement,
      options
    );
    const stackAnimations = this.animateStackBounce(allCards, options);

    // Возвращаем функцию для отмены всех анимаций
    return () => {
      cardAnimation?.cancel();
      foundationAnimation?.cancel();
      stackAnimations?.forEach((anim) => anim.cancel());
    };
  }

  /**
   * Анимация "приземления" карты с золотым свечением
   * @param {HTMLElement} cardElement - DOM элемент карты
   * @param {Object} options - Опции анимации
   * @returns {Animation} Объект анимации для контроля
   */
  static animateCardLanding(cardElement, options = {}) {
    if (!this.isValidElement(cardElement)) {
      console.warn("Invalid card element for animation");
      return null;
    }

    // Объединяем конфигурацию с опциями
    const config = {
      ...this.config.card,
      ...options.card,
    };

    // Создаем и запускаем анимацию
    const animation = cardElement.animate(config.keyframes, {
      duration: config.duration,
      easing: config.easing,
      fill: "forwards",
    });

    // Автоматически восстанавливаем стили после анимации
    animation.onfinish = () => {
      // CSSOM не позволяет напрямую удалить инлайн-стили, установленные Web Animations API
      // Вместо этого сбрасываем через CSS класс или setTimeout
      setTimeout(() => {
        cardElement.style.transform = "";
        cardElement.style.boxShadow = "";
      }, 0);
    };

    // Обработка отмены анимации
    animation.oncancel = () => {
      cardElement.style.transform = "";
      cardElement.style.boxShadow = "";
    };

    return animation;
  }

  /**
   * Анимация пульсирующего свечения фундамента
   * @param {HTMLElement} foundationElement - DOM элемент фундамента
   * @param {Object} options - Опции анимации
   * @returns {Animation} Объект анимации для контроля
   */
  static animateFoundationGlow(foundationElement, options = {}) {
    if (!this.isValidElement(foundationElement)) {
      console.warn("Invalid foundation element for animation");
      return null;
    }

    const config = {
      ...this.config.foundation,
      ...options.foundation,
    };

    const animation = foundationElement.animate(config.keyframes, {
      duration: config.duration,
      easing: config.easing,
      iterations: 2, // Два цикла для эффекта пульсации
      direction: "alternate", // Туда-обратно
    });

    // Восстанавливаем стили после анимации
    animation.onfinish = () => {
      setTimeout(() => {
        foundationElement.style.boxShadow = "";
        foundationElement.style.borderColor = "";
      }, 0);
    };

    animation.oncancel = () => {
      foundationElement.style.boxShadow = "";
      foundationElement.style.borderColor = "";
    };

    return animation;
  }

  /**
   * Анимация подпрыгивания карт в стопке (кроме последней)
   * @param {HTMLElement[]} cards - Массив DOM элементов карт
   * @param {Object} options - Опции анимации
   * @returns {Animation[]} Массив объектов анимации
   */
  static animateStackBounce(cards, options = {}) {
    if (!Array.isArray(cards) || cards.length === 0) {
      return [];
    }

    const config = {
      ...this.config.stackBounce,
      ...options.stackBounce,
    };

    const animations = [];

    // Анимируем все карты кроме последней (новой)
    const cardsToAnimate = cards.slice(0, -1);

    cardsToAnimate.forEach((cardElement, index) => {
      if (!this.isValidElement(cardElement)) return;

      // Задержка для эффекта волны (каскадная анимация)
      const delay = index * 50;

      // Сохраняем текущее преобразование
      const currentTransform = cardElement.style.transform || "";

      // Создаем ключевые кадры с учетом текущей трансформации
      const keyframes = config.keyframes.map((frame) => ({
        transform: currentTransform
          ? `${currentTransform} ${frame.transform}`
          : frame.transform,
      }));

      const animation = cardElement.animate(keyframes, {
        duration: config.duration,
        easing: config.easing,
        delay: delay,
        fill: "forwards",
      });

      // Восстанавливаем трансформацию после анимации
      animation.onfinish = () => {
        setTimeout(() => {
          cardElement.style.transform = currentTransform;
        }, 0);
      };

      animation.oncancel = () => {
        cardElement.style.transform = currentTransform;
      };

      animations.push(animation);
    });

    return animations;
  }

  /**
   * Анимация неудачного перемещения (красное свечение)
   * @param {HTMLElement} element - DOM элемент для анимации
   * @param {Object} options - Опции анимации
   * @returns {Animation} Объект анимации
   */
  static playErrorAnimation(element, options = {}) {
    if (!this.isValidElement(element)) {
      return null;
    }

    const config = {
      duration: 300,
      easing: "ease-in-out",
      keyframes: [
        { boxShadow: "0 0 0 rgba(244, 67, 54, 0)" },
        { boxShadow: "0 0 15px rgba(244, 67, 54, 0.8)" },
        { boxShadow: "0 0 0 rgba(244, 67, 54, 0)" },
      ],
      ...options.error,
    };

    const animation = element.animate(config.keyframes, {
      duration: config.duration,
      easing: config.easing,
      iterations: 2,
      direction: "alternate",
    });

    animation.onfinish = () => {
      setTimeout(() => {
        element.style.boxShadow = "";
      }, 0);
    };

    return animation;
  }

  /**
   * Комплексная анимация для автоперемещения
   * @param {HTMLElement} cardElement - Перемещаемая карта
   * @param {HTMLElement} targetElement - Целевой элемент
   * @param {Object} options - Опции анимации
   * @returns {Animation} Объект анимации
   */
  static playAutoMoveAnimation(cardElement, targetElement, options = {}) {
    if (
      !this.isValidElement(cardElement) ||
      !this.isValidElement(targetElement)
    ) {
      return null;
    }

    // Получаем позиции элементов
    const cardRect = cardElement.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();

    // Вычисляем смещение
    const deltaX = targetRect.left - cardRect.left;
    const deltaY = targetRect.top - cardRect.top;

    const config = {
      duration: 400,
      easing: "cubic-bezier(0.68, -0.55, 0.27, 1.55)",
      keyframes: [
        {
          transform: "translate(0, 0) scale(1)",
          opacity: 1,
          zIndex: 1000,
        },
        {
          transform: `translate(${deltaX}px, ${deltaY}px) scale(0.9)`,
          opacity: 0.8,
          zIndex: 1000,
        },
      ],
      ...options.autoMove,
    };

    // Устанавливаем высокий z-index для карты во время анимации
    const originalZIndex = cardElement.style.zIndex;
    cardElement.style.zIndex = "1000";

    const animation = cardElement.animate(config.keyframes, {
      duration: config.duration,
      easing: config.easing,
      fill: "forwards",
    });

    // Восстанавливаем стили после анимации
    animation.onfinish = () => {
      setTimeout(() => {
        cardElement.style.transform = "";
        cardElement.style.opacity = "";
        cardElement.style.zIndex = originalZIndex;
      }, 0);
    };

    animation.oncancel = () => {
      cardElement.style.transform = "";
      cardElement.style.opacity = "";
      cardElement.style.zIndex = originalZIndex;
    };

    return animation;
  }

  /**
   * Проверяет валидность DOM элемента
   * @param {HTMLElement} element - Проверяемый элемент
   * @returns {boolean} Валиден ли элемент
   */
  static isValidElement(element) {
    return (
      element && typeof element.animate === "function" && element.isConnected
    );
  }

  /**
   * Устанавливает конфигурацию анимаций
   * @param {Object} newConfig - Новая конфигурация
   */
  static setConfig(newConfig) {
    this.config = {
      ...this.config,
      ...newConfig,
    };
  }

  /**
   * Создает кастомную анимацию
   * @param {HTMLElement} element - Элемент для анимации
   * @param {Array} keyframes - Ключевые кадры
   * @param {Object} options - Опции анимации
   * @returns {Animation} Объект анимации
   */
  static createCustomAnimation(element, keyframes, options = {}) {
    if (!this.isValidElement(element)) {
      return null;
    }

    const defaultOptions = {
      duration: 500,
      easing: "ease",
      fill: "forwards",
      ...options,
    };

    return element.animate(keyframes, defaultOptions);
  }
}

// Экспорт конфигурации по умолчанию для внешнего использования
export const foundationAnimationConfig = FoundationAnimation.config;
