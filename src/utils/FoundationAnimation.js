// export class FoundationAnimation {
//   // Основная анимация успешного добавления карты
//   static playSuccessAnimation(card, foundation) {
//     const cardElement = card.domElement;
//     const foundationElement = foundation.element;
//     // 1. Анимация самой карты
//     cardElement.classList.add("card-landing");

//     // 2. Свечение стопки
//     foundationElement.classList.add("foundation-glow");

//     // 3. Легкое подпрыгивание всей стопки
//     // const allCards = foundationElement.querySelectorAll('.card');
//     // allCards.forEach(card => {
//     //   card.classList.add('stack-bounce');
//     // });

//     const allCards = foundation.cards.map((card) => {
//       card.domElement.classList.add("stack-bounce");
//       return card.domElement;
//     });

//     // Убираем классы анимации после завершения
//     setTimeout(() => {
//       cardElement.classList.remove("card-landing");
//       foundationElement.classList.remove("foundation-glow");
//       allCards.forEach((card) => {
//         card.classList.remove("stack-bounce");
//       });
//     }, 600);
//   }

//   // Альтернативная анимация - более сдержанная
//   static playSubtleAnimation(cardElement, foundationElement) {
//     // Только анимация карты и легкое свечение
//     cardElement.classList.add("card-landing");
//     foundationElement.classList.add("foundation-glow");

//     setTimeout(() => {
//       cardElement.classList.remove("card-landing");
//       foundationElement.classList.remove("foundation-glow");
//     }, 500);
//   }

//   // Анимация для завершения стопки (когда собрана масть)
//   static playCompleteAnimation(foundationElement) {
//     foundationElement.classList.add("foundation-glow");

//     // Усиленное свечение для завершенной стопки
//     const style = document.createElement("style");
//     style.textContent = `
//       @keyframes completeGlow {
//         0% { box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.8); }
//         50% { box-shadow: 0 0 0 20px rgba(255, 215, 0, 0.3); }
//         100% { box-shadow: 0 0 0 0 rgba(255, 215, 0, 0); }
//       }
//       .foundation-complete {
//         animation: completeGlow 1s ease-out;
//       }
//     `;
//     document.head.appendChild(style);

//     foundationElement.classList.add("foundation-complete");

//     setTimeout(() => {
//       foundationElement.classList.remove("foundation-complete");
//       foundationElement.classList.remove("foundation-glow");
//     }, 1000);
//   }
// }

// // Использование
// // После того как карта уже перемещена в стопку DOM:
// function onCardAddedToFoundation(
//   cardElement,
//   foundationElement,
//   isFoundationComplete = false
// ) {
//   if (isFoundationComplete) {
//     FoundationAnimation.playCompleteAnimation(foundationElement);
//   } else {
//     FoundationAnimation.playSuccessAnimation(cardElement, foundationElement);
//   }
// }

// // Пример вызова:
// // onCardAddedToFoundation(newCard, foundation, false);

export class FoundationAnimation {
  static playSuccessAnimation(card, foundation) {
    const cardElement = card.domElement;
    const foundationElement = foundation.element;
    // Определяем iOS
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    // 1. Анимация карты (работает везде)
    cardElement.classList.add("card-landing");

    // 2. Анимация стопки - выбираем в зависимости от платформы
    if (isIOS) {
      foundationElement.classList.add("foundation-pulse");
    } else {
      foundationElement.classList.add("foundation-glow");
    }

    // 3. Анимация подпрыгивания
    const allCards = foundation.cards.map((card) => {
      card.domElement.classList.add("stack-bounce");
      return card.domElement;
    });

    // Очистка
    setTimeout(() => {
      cardElement.classList.remove("card-landing");
      foundationElement.classList.remove("foundation-glow", "foundation-pulse");
      allCards.forEach((card) => {
        card.classList.remove("stack-bounce");
      });
    }, 600);
  }

  // Упрощенная версия для максимальной совместимости
  static playSimpleAnimation(cardElement) {
    cardElement.classList.add("card-landing");

    setTimeout(() => {
      cardElement.classList.remove("card-landing");
    }, 500);
  }
}

// Функция для принудительного перезапуска анимации (иногда помогает в iOS)
function forceAnimationRestart(element) {
  element.style.animation = "none";
  element.offsetHeight; /* trigger reflow */
  element.style.animation = null;
}
