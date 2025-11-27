// configs/GameModes.js
export const GameModes = {
  CLASSIC: {
    id: "CLASSIC",
    name: "Классический",
    description: "Стандартные правила пасьянса",

    // Основные правила
    rules: {
      drawCount: 3, // По 3 карты из стока
      maxRedeals: 1, // 1 перетасовка отбоя
      maxUndos: 10, // 10 отмен ходов
      maxHints: 5, // 5 бесплатных подсказок
      autoComplete: true, // Автозавершение доступно
      timeLimit: null, // Без ограничения времени
      moveLimit: null, // Без ограничения ходов
    },

    // Система очков
    scoring: {
      moveToTableau: 5,
      moveToFoundation: 10,
      wasteToTableau: 5,
      wasteToFoundation: 10,
      flipCard: 5,
      foundationComplete: 25,
      undoPenalty: -2,
      hintPenalty: -5,
    },
  },

  VEGAS: {
    id: "VEGAS",
    name: "Вегасский",
    description: "Игра на деньги с жесткими правилами",

    rules: {
      drawCount: 1, // Только 1 карта из стока!
      maxRedeals: 0, // Нельзя перетасовать отбой!
      maxUndos: 3, // Всего 3 отмены
      maxHints: 0, // Без подсказок
      autoComplete: false, // Нет автозавершения
      timeLimit: null,
      moveLimit: null,
      cumulative: true, // Накопительный счет между играми
    },

    scoring: {
      moveToTableau: 0, // Бесплатные перемещения
      moveToFoundation: 5, // +5$ за карту на фундамент
      wasteToTableau: 0,
      wasteToFoundation: 5,
      flipCard: 0,
      foundationComplete: 0,
      initialBet: -52, // Начальный долг
      paybackPerCard: 5, // Возврат за карту
    },
  },

  TIMED: {
    id: "TIMED",
    name: "На время",
    description: "Гонка против времени",

    rules: {
      drawCount: 3,
      maxRedeals: 1,
      maxUndos: 3, // Всего 3 отмены
      maxHints: 0, // Без подсказок
      autoComplete: false,
      timeLimit: 180, // 3 минуты!
      moveLimit: null,
      moveTimeLimit: 10, // 10 сек на ход
    },

    scoring: {
      moveToTableau: 2,
      moveToFoundation: 5,
      wasteToTableau: 1,
      wasteToFoundation: 5,
      flipCard: 2,
      foundationComplete: 50, // Большой бонус
      timeBonus: 2, // +2 за секунду
      timePenalty: -1, // -1 за просрочку
      speedMultiplier: 2, // ×2 за быстрые ходы
      undoPenalty: -10, // Штраф за отмену
    },
  },

  EXPERT: {
    id: "EXPERT",
    name: "Эксперт",
    description: "Максимальная сложность для профессионалов",

    rules: {
      drawCount: 3,
      maxRedeals: 1,
      maxUndos: 5,
      maxHints: 3, // Ограниченные подсказки
      autoComplete: false,
      timeLimit: null,
      moveLimit: 200, // Лимит 200 ходов!
      forcedMoves: true, // Обязательные ходы на фундамент
      noEmptyTableauMoves: true, // Нельзя королей на пустые столбцы
    },

    scoring: {
      moveToTableau: 1, // Минимум очков
      moveToFoundation: 3,
      wasteToTableau: 0, // Штраф за отбой
      wasteToFoundation: 3,
      flipCard: 1,
      foundationComplete: 10, // Скромный бонус
      hintCost: -20, // Подсказка стоит 20 очков
      undoPenalty: -5,
      movePenalty: -1, // Штраф за каждый ход
    },
  },

  RELAXED: {
    id: "RELAXED",
    name: "Расслабленный",
    description: "Для обучения и отдыха",

    rules: {
      drawCount: 3,
      maxRedeals: Infinity, // Бесконечные перетасовки!
      maxUndos: Infinity, // Бесконечные отмены!
      maxHints: Infinity, // Бесконечные подсказки!
      autoComplete: true,
      timeLimit: null,
      moveLimit: null,
      smartHints: true, // Умные подсказки
      moveSuggestions: true, // Подсветка ходов
      tutorialMode: true, // Режим обучения
    },

    scoring: {
      moveToTableau: 0, // Без очков
      moveToFoundation: 0,
      wasteToTableau: 0,
      wasteToFoundation: 0,
      flipCard: 0,
      foundationComplete: 0,
      undoPenalty: 0,
      hintPenalty: 0,
    },
  },
};
