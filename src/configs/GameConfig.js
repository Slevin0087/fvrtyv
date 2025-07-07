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
};
