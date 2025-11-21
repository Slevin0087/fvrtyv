export const GameConfig = {
  earnedCoins: {
    win: 10,
  },

  rules: {
    initialScore: 0,
    scoreForFoundation: 10,
    scoreForTableauMove: 5,
    scoreForCardFlip: 2,
    penaltyForFoundationToTableau: 5,
    winScoreBonus: 100,
    hintCost: 5,
    initialMove: 1,
    defaultDealingCards: 1,
    defaultDealingCardsThree: 3,
  },

  difficulties: {
    easy: {
      timeMultiplier: 1.2,
      scoreMultiplier: 1.2,
    },
    normal: {
      timeMultiplier: 1.0,
      scoreMultiplier: 1.0,
    },
    hard: {
      timeMultiplier: 0.8,
      scoreMultiplier: 0.8,
    },
  },

  defaultPlayerStats: {
    coins: 1000,
    lastMoveQuantity: 3,
    hintQuantity: 3,
  },

  defaultSettings: {
    soundEnabled: true,
    musicVolume: 0.7,
    effectsVolume: 0.9,
    difficulty: "normal",
    cardFaceStyle: "classic",
    cardBackStyle: "blue",
    backgroundStyle: "default",
  },

  cardContainers: {
    tableau: "tableau",
    foundation: "foundation",
    waste: "waste",
    stock: "stock",
  },

  dataAttributes: {
    dataAttributeDND: "data-card-dnd",
    cardDnd: "cardDnd",
    cardParentL: "cardParent",
    cardParent: "data-card-parent",
    name: "[data-card-dnd]",
    setFAndTContainers: "fAndT",
    getFAndTContainers: "data-f-and-t",
  },

  stateForAchievements: {
    fastestWin: 0,
    moves: 0,
    score: 0,
    winsWithoutHints: 0,
    winsWithoutUndo: 0,
    minPossibleMoves: Infinity,
    unlockedMany: [],
    activeId: "",
    active: {},
  },
};

export const HintsRules = {
  priorities: {
    firstOpenDownCard: 1,
  },
};

export const PlayerConfigs = {
  initialCoins: 1000,
  initialHints: 3,
  initialUndos: 3,
  hint: {
    countUsedForIncrement: 1,
    countUsedForDecrement: 1,
  },
  undo: {
    countUsedForIncrement: 1,
  },
};
