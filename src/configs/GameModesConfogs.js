export const GameModesStateNamesKeys = {
  STOCK_DRAW_COUNT: "stock-draw-count",
  MAX_REDEALS: "max-redeals",
};

export const GameModesNamesKeys = {
  CURRENT_MODE: "current-mode",
};

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
    name: "Классический",
    description: "Стандартные правила пасьянса",

    rules: {
      drawCount: 3,
      maxRedeals: 1,
      maxUndos: 3, // ↓ с 5 до 3 (более сбалансированно)
      maxHints: 3,
      autoComplete: true,
      timeLimit: null,
      moveLimit: null,
    },

    scoring: {
      // Унифицированные базовые значения
      moveToTableau: 3, // ↓ с 5 до 3 (30% от foundation)
      moveToFoundation: 10, // без изменений
      wasteToTableau: 3, // ↓ с 5 до 3
      wasteToFoundation: 10, // ↓ с 15 до 10 (унификация)
      flipCard: 5, // ↓ с 10 до 5 (50% от foundation)
      foundationComplete: 100,

      // Штрафы в очках (добавлена консистентность)
      undoPenalty: -10, // ↑ штраф с -5 до -10
      hintPenalty: -10,

      // Награда в хусынках (сбалансировано)
      husynkiReward: {
        win: 10,
        perfectWin: 25,
        foundationComplete: 5,
        // Добавлены синки
        extraUndoCost: -5, // покупка доп. отмены
        extraHintCost: -3, // покупка доп. подсказки
      },
    },
  },

  VEGAS: {
    id: GameModesIds.VEGAS,
    name: "Вегасский",
    description: "Режим с накопительным счетом и ставками",

    rules: {
      drawCount: 1,
      maxRedeals: 0,
      maxUndos: 2,
      maxHints: 0,
      autoComplete: false,
      timeLimit: null,
      moveLimit: null,
      cumulative: true,
    },

    scoring: {
      moveToTableau: 2,
      moveToFoundation: 10,
      wasteToTableau: 2,
      wasteToFoundation: 10,
      flipCard: 5,
      foundationComplete: 50,
      undoPenalty: -20, // добавлен штраф за отмену
      hintPenalty: 0,

      // Сбалансированная экономика хусынков
      husynkiReward: {
        entryFee: -25, // ↑ плата с -15 до -25
        win: 30, // ↓ с 50 до 30
        perfectWin: 60, // ↓ с 100 до 60
        paybackPerCard: 1, // ↓ с 2 до 1
        streakBonus: 15, // ↑ с 10 до 15 (акцент на сериях)
        extraUndoCost: -10, // дорогие отмены в Вегасе
        insuranceCost: -5, // страховка от проигрыша
      },
    },
  },

  TIMED: {
    id: GameModesIds.TIMED,
    name: "На время",
    description: "Гонка против времени",

    rules: {
      drawCount: 3,
      maxRedeals: 1,
      maxUndos: 2,
      maxHints: 1,
      autoComplete: false,
      timeLimit: 180,
      moveLimit: null,
      moveTimeLimit: 10,
    },

    scoring: {
      moveToTableau: 3,
      moveToFoundation: 12,
      wasteToTableau: 3,
      wasteToFoundation: 12,
      flipCard: 8,
      foundationComplete: 75,
      timeBonus: 0.5, // ↓ с 1 до 0.5 (анти-инфляция)
      timePenalty: -2,
      speedMultiplier: 1.5, // ↓ с 2 до 1.5
      undoPenalty: -15,
      hintPenalty: -10,

      husynkiReward: {
        win: 20,
        timeBonus: 3, // ↓ с 5 до 3
        speedBonus: 8, // ↓ с 10 до 8
        perfectWin: 45, // ↑ с 40 до 45 (больше разница)
        timeAttackBonus: 10, // бонус за ультра-быструю победу
      },
    },
  },

  EXPERT: {
    id: GameModesIds.EXPERT,
    name: "Эксперт",
    description: "Максимальная сложность для профессионалов",

    rules: {
      drawCount: 3,
      maxRedeals: 1,
      maxUndos: 3,
      maxHints: 2,
      autoComplete: false,
      timeLimit: null,
      moveLimit: 200,
      forcedMoves: true,
      noEmptyTableauMoves: true,
    },

    scoring: {
      moveToTableau: 2,
      moveToFoundation: 8,
      wasteToTableau: -2, // ↑ штраф с -1 до -2
      wasteToFoundation: 8,
      flipCard: 4, // ↓ с 5 до 4
      foundationComplete: 150,
      undoPenalty: -25, // ↑ штраф с -20 до -25
      hintPenalty: -15, // добавлен штраф
      movePenalty: -1, // ↑ с -0.5 до -1

      husynkiReward: {
        win: 40, // ↑ с 30 до 40
        challengeBonus: 35, // ↑ с 25 до 35
        noHintBonus: 20, // ↑ с 15 до 20
        moveEfficiency: 15, // ↑ с 10 до 15
        expertStreak: 25, // бонус за серию в экспертном режиме
        flawlessBonus: 30, // бонус за победу без штрафных ходов
      },
    },
  },

  RELAXED: {
    id: GameModesIds.RELAXED,
    name: "Расслабленный",
    description: "Для обучения и отдыха",

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
      tutorialMode: true,
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
        firstWin: 5,
        learningBonus: 10,
        dailyPlay: 2,
        tutorialComplete: 15, // награда за прохождение обучения
        achievementBonus: 5, // за первые достижения
      },
    },
  },
};

// Дополнительные системные настройки для экономики
export const EconomyConfig = {
  // Мультипликаторы за серии побед
  streakMultipliers: {
    2: { multiplier: 1.2, husynkiBonus: 5 },
    3: { multiplier: 1.5, husynkiBonus: 10 },
    5: { multiplier: 2.0, husynkiBonus: 20 },
    10: { multiplier: 3.0, husynkiBonus: 50 },
  },

  // Ежедневные задания
  dailyChallenges: {
    completeClassic: { reward: 15, difficulty: 1 },
    winWithoutUndo: { reward: 20, difficulty: 2 },
    completeExpert: { reward: 50, difficulty: 4 },
    threeWinsStreak: { reward: 30, difficulty: 3 },
    quickWin: { reward: 25, difficulty: 2 }, // победа за <5 мин
  },

  // Еженедельные вызовы
  weeklyChallenges: {
    masterCollector: { reward: 100, goal: "Собрать 20 фундаментов" },
    speedDemon: { reward: 150, goal: '5 побед в режиме "На время"' },
    perfectPlayer: { reward: 200, goal: "3 идеальные победы" },
  },

  // Синки экономики (куда тратятся хусынки)
  husynkiSinks: {
    cosmetics: {
      cardBacks: [10, 25, 50, 100],
      tableThemes: [20, 40, 75],
      cardStyles: [30, 60, 120],
    },
    gameplay: {
      extraUndo: 5,
      extraHint: 3,
      timeFreeze: 15, // заморозка времени в Timed режиме
      cardReveal: 8, // показ случайной карты
    },
    progression: {
      unlockExpert: 50, // разблокировка Expert режима
      unlockVegas: 30, // разблокировка Vegas режима
    },
  },

  // Лимиты для анти-фарма
  dailyHusynkiLimit: 200, // максимум хусынков в день
  sessionHusynkiLimit: 100, // максимум за сессию (2 часа)
  minPlayTimeForReward: 60, // минимум 60 секунд игры для получения наград
};
