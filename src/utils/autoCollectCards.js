// export function autoCollectCards(cardsComponents, handleCardClick, check) {
//   const { foundations, tableaus, stock, waste } = cardsComponents;
//   if (check()) return;
//   else {
//     if (stock.cards.length > 0) {
//       stock.cards.forEach((card) => (card.faceUp = true));
//     }

//     if (waste.cards.length > 0) {
//       for (let i = 0; i < waste.cards.length; i++) {
//         const topCard = waste.cards[waste.cards.length - 1];
//         const isMove = handleCardClick(topCard);
//         if (!isMove) return;
//       }
//     }

//     tableaus.forEach((tableau) => {
//       if (tableau.cards.length > 0) {
//         const topCard = tableau.cards[tableau.cards.length - 1];
//         const isMove = handleCardClick(topCard);
//         if (!isMove) return;
//       }
//     });

//     autoCollectCards(cardsComponents, handleCardClick, check);
//   }
// }

export function autoCollectCards(cardsComponents, handleCardClick, check) {
  const { foundations, tableaus, stock, waste } = cardsComponents;

  // Проверяем условие выхода
  if (check) return true;

  let movedAnyCard = false;

  // Обрабатываем waste
  while (waste.cards.length > 0) {
    const topCard = waste.cards[waste.cards.length - 1];
    const isMove = handleCardClick(topCard);
    if (isMove) {
      movedAnyCard = true;
    } else {
      break;
    }
  }

  // Обрабатываем tableaus
  for (const tableau of tableaus) {
    if (tableau.cards.length > 0) {
      const topCard = tableau.cards[tableau.cards.length - 1];
      if (!topCard.faceUp) continue;

      const isMove = handleCardClick(topCard);
      if (isMove) {
        movedAnyCard = true;
        // После перемещения проверяем снова с начала, так как состояние изменилось
        return autoCollectCards(cardsComponents, handleCardClick, check);
      }
    }
  }

  // Если ничего не удалось переместить, выходим
  if (!movedAnyCard) return false;

  // Продолжаем процесс
  return autoCollectCards(cardsComponents, handleCardClick, check);
}
