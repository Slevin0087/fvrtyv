export const UIConfig = {
  pages: {
    UINamePage: "UINamePage",
    UIMenuPage: "UIMenuPage",
    UIGamePage: "UIGamePage",
    UISettingsPage: "UISettingsPage",
    UIShopPage: "UIShopPage",
    UIPlayerStatePage: "UIPlayerStatePage",
    UINotificationPage: "UINotificationPage",
  },
  themes: {
    default: {
      colors: {
        primary: "#3498db",
        secondary: "#2ecc71",
        background: "#f5f5f5",
        text: "#333333",
        error: "#e74c3c",
        success: "#2ecc71",
        warning: "#f39c12",
      },
      fonts: {
        main: '16px "Roboto", Arial, sans-serif',
        title: 'bold 24px "Roboto", Arial, sans-serif',
        button: 'bold 14px "Roboto", Arial, sans-serif',
      },
    },
    dark: {
      colors: {
        primary: "#2980b9",
        secondary: "#27ae60",
        background: "#2c3e50",
        text: "#ecf0f1",
        error: "#c0392b",
        success: "#27ae60",
        warning: "#d35400",
      },
      fonts: {
        main: '16px "Roboto", Arial, sans-serif',
        title: 'bold 24px "Roboto", Arial, sans-serif',
        button: 'bold 14px "Roboto", Arial, sans-serif',
      },
    },
  },

  breakpoints: {
    mobile: 576,
    tablet: 768,
    desktop: 992,
    wide: 1200,
  },

  degs: {
    cardFlip: 90,
    backCardFlip: -90,
  },

  animations: {
    wasteCardFlip: 0.2,
    startMoveSpeed: 50,
    cardMoveDuration: 300,
    cardFlipDuration: 0.5,
    cardStockFlipDuration: 300,
    uiFadeDuration: 200,
    notificationDuration: 3000,
  },

  layout: {
    card: {
      width: 80,
      height: 120,
      borderRadius: 8,
      tableauOverlap: 20,
      stockOverlap: 0.2,
    },
    game: {
      padding: 20,
      maxWidth: 1200,
    },
  },

  localization: {
    defaultLanguage: "ru",
    supportedLanguages: ["ru", "en"],
  },

  playerSelectedItems: {
    cardFace: {},
    cardBack: {},
    background: {},
  },
};
