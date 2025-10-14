const defaultValues = {
  tableauOverlapY: 20,
  tableauOverlapY1024px: 30,
};

const UIModalFooterBtnsEventIds = {
  cancel: 'cancel',
  again:'again'
}

const UIConfig = {
  pages: {
    UINamePage: "UINamePage",
    UIMenuPage: "UIMenuPage",
    UIGamePage: "UIGamePage",
    UISettingsPage: "UISettingsPage",
    UIShopPage: "UIShopPage",
    UIPlayerStatePage: "UIPlayerStatePage",
    UINotificationPage: "UINotificationPage",
    BaseModal: "BaseModal",
  },
  dataI18nValue: {
    HINT_NOTIF_NOHINTS: "hint_notif_nohints",
    HINT_NOTIF_NOPOINTS: "hint_notif_nopoints",
    STATUS_BAR_RECORD_WORD: "status_bar_record_word",
  },
  keysForTranslations: {
    H4_START: "h4_ach_start_text",
    H4_END: "h4_ach_end_text",
    SPAN_RED_START: "ach_info_span_red_start",
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
    cardMoveDuration: 200,
    cardFlipDuration: 0.2,
    cardStockFlipDuration: 300,
    uiFadeDuration: 200,
    notificationDuration: 3000,
    clickLimitTime: 500,
    animationCoinsEarned: 3,
    animationWinPointsEarned: 2,
    backMoveCardsToStockDuration: 25,
  },

  layout: {
    card: {
      width: 80,
      height: 120,
      borderRadius: 8,
      // tableauOverlapY: 20,
      tableauOverlapY: defaultValues.tableauOverlapY,
      tableauOverlapY1024px: defaultValues.tableauOverlapY1024px,
      wasteOverlapX: 0.2,
      wasteOverlapY: -0.2,
      wasteOneOverlapX: defaultValues.tableauOverlapY,
      wasteOneOverlapX1024px: defaultValues.tableauOverlapY1024px,
      wasteMaxVisibleCards: 3,
      stockOverlapX: -0.2,
      stockOverlapY: -0.2,
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

const UIGameRestartModalData = {
  modal: {
    id: "restart-game-modal",
    className: "restart-game-modal",
  },
  header: {
    id: "",
    className: "restart-game-modal-header",
  },
  headerBtn: {
    id: "",
    className: "restart-game-modal-close",
  },
  closeSpan: {
    id: "restart-game-modal-close",
    className: "restart-game-modal-close-span",
    textContent: "&times;",
  },
  title: {
    id: "",
    className: "restart-game-modal-title",
    dataI18n: "data-i18n",
    dataI18nValue: "game_restart_modal_title",
  },
  body: {
    id: "",
    className: "restart-game-modal-content",
  },
  footer: {
    id: "",
    className: "game-restart-modal-btns",
  },
};

const UIGameRestartModalBodyData = {
  body: {
    id: "",
    className: "restart-game-modal-content",
  },
  span: {
    id: "",
    className: "",
    dataI18n: "data-i18n",
    dataI18nValue: "game_restart_modal_cancel_content",
  },
};

const UIGameRestartModalFooterData = {
  footer: {
    id: "",
    className: "game-restart-modal-btns",
  },
  buttons: [
    {
      id: "game-restart-modal-cancel-btn",
      className: "game-restart-modal-cancel-btn",
      dataI18n: "data-i18n",
      dataI18nValue: "btn_game_restart_modal_cancel",
      type: "onclick",
      eventId: UIModalFooterBtnsEventIds.cancel,
    },
    {
      id: "game-restart-modal-again-btn",
      className: "game-restart-modal-again-btn",
      dataI18n: "data-i18n",
      dataI18nValue: "btn_game_restart_modal_again",
      type: "onclick",
      eventId: UIModalFooterBtnsEventIds.again,
    },
  ],
};



export {
  UIConfig,
  UIGameRestartModalData,
  UIGameRestartModalBodyData,
  UIModalFooterBtnsEventIds,
  UIGameRestartModalFooterData,
};
