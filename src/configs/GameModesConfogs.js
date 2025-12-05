export const GameModesStateNamesKeys = {
  STOCK_DRAW_COUNT: "stock-draw-count",
  MAX_REDEALS: 'max-redeals',
}

export const GameModesNamesKeys = {
  CURRENT_MODE: "current-mode",
}

export const GameModesIds = {
  CLASSIC: "CLASSIC",
  VEGAS: "VEGAS",
  TIMED: "TIMED",
  EXPERT: "EXPERT",
  RELAXED: "RELAXED",
};

export const GameModesConfigs = {
  CLASSIC: {
    id: GameModesIds.CLASSIC,
    name: 'Классический',
    description: 'Стандартные правила пасьянса',
    
    rules: {
      drawCount: 3,
      maxRedeals: 1,
      maxUndos: 5,            // 5 отмен за игру
      maxHints: 3,            // 3 бесплатные подсказки
      autoComplete: true,
      timeLimit: null,
      moveLimit: null
    },
    
    scoring: {
      // Очки за действия
      moveToTableau: 5,
      moveToFoundation: 15,
      wasteToTableau: 5,
      wasteToFoundation: 15,
      flipCard: 10,
      foundationComplete: 100,
      
      // Штрафы в очках
      undoPenalty: -5,
      hintPenalty: -10,
      
      // Награда в хусынках
      husynkiReward: {
        win: 10,              // +10 хусынков за победу
        perfectWin: 25,       // +25 за победу без отмен/подсказок
        foundationComplete: 5 // +5 за каждый собранный фундамент
      }
    }
  },

  VEGAS: {
    id: GameModesIds.VEGAS, 
    name: 'Вегасский',
    description: 'Режим с накопительным счетом и ставками',
    
    rules: {
      drawCount: 1,
      maxRedeals: 0,
      maxUndos: 2,            // Всего 2 отмены
      maxHints: 0,
      autoComplete: false,
      timeLimit: null,
      moveLimit: null,
      cumulative: true
    },
    
    scoring: {
      moveToTableau: 2,
      moveToFoundation: 10,
      wasteToTableau: 2,
      wasteToFoundation: 10,
      flipCard: 5,
      foundationComplete: 50,
      
      // Экономика хусынков
      husynkiReward: {
        entryFee: -15,        // Входная плата 15 хусынков
        win: 50,              // Крупный выигрыш
        perfectWin: 100,      // Джекпот
        paybackPerCard: 2,    // Возврат за каждую карту на фундаменте
        streakBonus: 10       // Бонус за серию побед
      }
    }
  },

  TIMED: {
    id: GameModesIds.TIMED,
    name: 'На время', 
    description: 'Гонка против времени',
    
    rules: {
      drawCount: 3,
      maxRedeals: 1,
      maxUndos: 2,
      maxHints: 1,
      autoComplete: false,
      timeLimit: 180,
      moveLimit: null,
      moveTimeLimit: 10
    },
    
    scoring: {
      moveToTableau: 3,
      moveToFoundation: 12,
      wasteToTableau: 3,
      wasteToFoundation: 12,
      flipCard: 8,
      foundationComplete: 75,
      timeBonus: 1,
      timePenalty: -2,
      speedMultiplier: 2,
      undoPenalty: -15,
      
      husynkiReward: {
        win: 20,
        timeBonus: 5,         // Бонус за оставшееся время
        speedBonus: 10,       // Бонус за быстрые ходы
        perfectWin: 40
      }
    }
  },

  EXPERT: {
    id: GameModesIds.EXPERT,
    name: 'Эксперт',
    description: 'Максимальная сложность для профессионалов',
    
    rules: {
      drawCount: 3,
      maxRedeals: 1,
      maxUndos: 3,
      maxHints: 2,
      autoComplete: false,
      timeLimit: null,
      moveLimit: 200,
      forcedMoves: true,
      noEmptyTableauMoves: true
    },
    
    scoring: {
      moveToTableau: 2,
      moveToFoundation: 8,
      wasteToTableau: -1,     // Штраф за ход из отбоя
      wasteToFoundation: 8,
      flipCard: 5,
      foundationComplete: 150, // Большой бонус за сложность
      undoPenalty: -20,
      movePenalty: -0.5,
      
      husynkiReward: {
        win: 30,
        challengeBonus: 25,   // Бонус за прохождение сложного режима
        noHintBonus: 15,      // Бонус за игру без подсказок
        moveEfficiency: 10    // Бонус за эффективные ходы
      }
    }
  },

  RELAXED: {
    id: GameModesIds.RELAXED,
    name: 'Расслабленный',
    description: 'Для обучения и отдыха',
    
    rules: {
      drawCount: 3,
      maxRedeals: Infinity,
      maxUndos: Infinity,
      maxHints: Infinity,
      autoComplete: true,
      timeLimit: null,
      moveLimit: null,
      smartHints: true,
      moveSuggestions: true,
      tutorialMode: true
    },
    
    scoring: {
      moveToTableau: 1,
      moveToFoundation: 5,
      wasteToTableau: 1,
      wasteToFoundation: 5,
      flipCard: 2,
      foundationComplete: 25,
      undoPenalty: 0,
      hintPenalty: 0,
      
      husynkiReward: {
        firstWin: 5,          // Награда за первую победу
        learningBonus: 10,    // Бонус за обучение
        dailyPlay: 2          // Ежедневная награда за игру
      }
    }
  }
}

// export const GameModes = {
//   CLASSIC: {
//     id: GameModesIds.CLASSIC,
//     name: "Классический",
//     description: "Стандартные правила пасьянса",

//     // Основные правила
//     rules: {
//       drawCount: 3, // По 3 карты из стока
//       maxRedeals: 1, // 1 перетасовка отбоя
//       maxUndos: 10, // 10 отмен ходов
//       maxHints: 5, // 5 бесплатных подсказок
//       autoComplete: true, // Автозавершение доступно
//       timeLimit: null, // Без ограничения времени
//       moveLimit: null, // Без ограничения ходов
//     },

//     // Система очков
//     scoring: {
//       moveToTableau: 5,
//       moveToFoundation: 10,
//       wasteToTableau: 5,
//       wasteToFoundation: 10,
//       flipCard: 5,
//       foundationComplete: 25,
//       undoPenalty: -2,
//       hintPenalty: -5,
//     },
//   },

//   VEGAS: {
//     id: GameModesIds.VEGAS,
//     name: "Вегасский",
//     description: "Игра на деньги с жесткими правилами",

//     rules: {
//       drawCount: 1, // Только 1 карта из стока!
//       maxRedeals: 0, // Нельзя перетасовать отбой!
//       maxUndos: 3, // Всего 3 отмены
//       maxHints: 0, // Без подсказок
//       autoComplete: false, // Нет автозавершения
//       timeLimit: null,
//       moveLimit: null,
//       cumulative: true, // Накопительный счет между играми
//     },

//     scoring: {
//       moveToTableau: 0, // Бесплатные перемещения
//       moveToFoundation: 5, // +5$ за карту на фундамент
//       wasteToTableau: 0,
//       wasteToFoundation: 5,
//       flipCard: 0,
//       foundationComplete: 0,
//       initialBet: -52, // Начальный долг
//       paybackPerCard: 5, // Возврат за карту
//     },
//   },

//   TIMED: {
//     id: GameModesIds.TIMED,
//     name: "На время",
//     description: "Гонка против времени",

//     rules: {
//       drawCount: 3,
//       maxRedeals: 1,
//       maxUndos: 3, // Всего 3 отмены
//       maxHints: 0, // Без подсказок
//       autoComplete: false,
//       timeLimit: 180, // 3 минуты!
//       moveLimit: null,
//       moveTimeLimit: 10, // 10 сек на ход
//     },

//     scoring: {
//       moveToTableau: 2,
//       moveToFoundation: 5,
//       wasteToTableau: 1,
//       wasteToFoundation: 5,
//       flipCard: 2,
//       foundationComplete: 50, // Большой бонус
//       timeBonus: 2, // +2 за секунду
//       timePenalty: -1, // -1 за просрочку
//       speedMultiplier: 2, // ×2 за быстрые ходы
//       undoPenalty: -10, // Штраф за отмену
//     },
//   },

//   EXPERT: {
//     id: GameModesIds.EXPERT,
//     name: "Эксперт",
//     description: "Максимальная сложность для профессионалов",

//     rules: {
//       drawCount: 3,
//       maxRedeals: 1,
//       maxUndos: 5,
//       maxHints: 3, // Ограниченные подсказки
//       autoComplete: false,
//       timeLimit: null,
//       moveLimit: 200, // Лимит 200 ходов!
//       forcedMoves: true, // Обязательные ходы на фундамент
//       noEmptyTableauMoves: true, // Нельзя королей на пустые столбцы
//     },

//     scoring: {
//       moveToTableau: 1, // Минимум очков
//       moveToFoundation: 3,
//       wasteToTableau: 0, // Штраф за отбой
//       wasteToFoundation: 3,
//       flipCard: 1,
//       foundationComplete: 10, // Скромный бонус
//       hintCost: -20, // Подсказка стоит 20 очков
//       undoPenalty: -5,
//       movePenalty: -1, // Штраф за каждый ход
//     },
//   },

//   RELAXED: {
//     id: GameModesIds.RELAXED,
//     name: "Расслабленный",
//     description: "Для обучения и отдыха",

//     rules: {
//       drawCount: 3,
//       maxRedeals: Infinity, // Бесконечные перетасовки!
//       maxUndos: Infinity, // Бесконечные отмены!
//       maxHints: Infinity, // Бесконечные подсказки!
//       autoComplete: true,
//       timeLimit: null,
//       moveLimit: null,
//       smartHints: true, // Умные подсказки
//       moveSuggestions: true, // Подсветка ходов
//       tutorialMode: true, // Режим обучения
//     },

//     scoring: {
//       moveToTableau: 0, // Без очков
//       moveToFoundation: 0,
//       wasteToTableau: 0,
//       wasteToFoundation: 0,
//       flipCard: 0,
//       foundationComplete: 0,
//       undoPenalty: 0,
//       hintPenalty: 0,
//     },
//   },
// };
