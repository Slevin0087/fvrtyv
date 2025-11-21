import { GameEvents } from "../utils/Constants.js";
import { UINamePage } from "../ui/UINamePage.js";
import { UIMenuPage } from "../ui/UIMenuPage.js";
import { UIGamePage } from "../ui/UIGamePage.js";
import { UISettingsPage } from "../ui/UISettingsPage.js";
import { UIPlayerStatePage } from "../ui/UIPlayerStatePage.js";
import { UIShopPage } from "../ui/UIShopPage.js";
import { UINotificationPage } from "../ui/UINotificationPage.js";
import { UIConfig } from "../configs/UIConfig.js";

export class UIManager {
  constructor(eventManager, stateManager, translator, shopNavigation) {
    this.components = {};
    this.eventManager = eventManager;
    this.stateManager = stateManager;
    this.translator = translator;
    this.shopNavigation = shopNavigation;
    this.pages = new Map();
    this.activePage = this.stateManager.state.ui.activePage;
    this.spinner = document.getElementById("loader");

    this.init();
  }

  init() {
    this.registerPages();
    this.setupEventListeners();
    this.hideAll();
    this.showByName(this.activePage);
  }

  registerPages() {
    // Автоматическая регистрация всех страниц
    this.registerPage(UIConfig.pages.UINamePage, UINamePage);
    this.registerPage(UIConfig.pages.UIMenuPage, UIMenuPage);
    this.registerPageForTranslation(UIConfig.pages.UIGamePage, UIGamePage);
    this.registerPageForTranslation(
      UIConfig.pages.UISettingsPage,
      UISettingsPage
    );
    this.registerShopPage(UIConfig.pages.UIShopPage, UIShopPage);
    this.registerPageForTranslation(
      UIConfig.pages.UIPlayerStatePage,
      UIPlayerStatePage
    );
    this.registerPage(UIConfig.pages.UINotificationPage, UINotificationPage);
  }

  registerPage(name, PageClass) {
    const page = new PageClass(this.eventManager, this.stateManager);
    this.pages.set(name, page);
    // Автоматическая инициализация
    if (typeof page.init === "function") {
      page.init();
    }
  }

  registerPageForTranslation(name, PageClass) {
    const page = new PageClass(
      this.eventManager,
      this.stateManager,
      this.translator
    );
    this.pages.set(name, page);
    // Автоматическая инициализация
    if (typeof page.init === "function") {
      page.init();
    }
  }

  registerShopPage(name, PageClass) {
    const page = new PageClass(
      this.eventManager,
      this.stateManager,
      this.translator,
      this.shopNavigation
    );
    this.pages.set(name, page);
  }

  showByName(activePage) {
    if (this.pages.has(activePage)) {
      this.spinner.classList.add("hidden");
      this.pages.get(activePage).show();
      return;
    }
    this.spinner.classList.remove("hidden");
  }

  setupEventListeners() {
    this.eventManager.on(GameEvents.FULL_SCREEN_BTN, (e) => {
      this.toggleFullscreen(e.target);
    });

    this.eventManager.on(GameEvents.BACK_BTN_CLICKED, () => {
      this.pageShow(UIConfig.pages.UIMenuPage);
    });

    this.eventManager.on(GameEvents.UI_NAME_HIDE, () => {
      this.pageShow(UIConfig.pages.UIMenuPage);
    });

    this.eventManager.on(GameEvents.UIMENUPAGE_SHOW, () => {
      this.pageShow(UIConfig.pages.UIMenuPage);
      this.stateManager.setActivePage(this.components.uiMenuPage);
    });

    this.eventManager.on(GameEvents.UI_SHOP_SHOW, () => {
      this.pageShow(UIConfig.pages.UIShopPage);
    });

    this.eventManager.on(GameEvents.UI_STATEPLAYER_SHOW, () => {
      this.pageShow(UIConfig.pages.UIPlayerStatePage);
    });

    this.eventManager.on(GameEvents.UI_SETTINGS_SHOW, () => {
      this.pageShow(UIConfig.pages.UISettingsPage);
    });

    this.eventManager.onAsync(GameEvents.SET_NEW_GAME, async () => {
      this.pageShow(UIConfig.pages.UIGamePage);
      // this.eventManager.emit(
      //   GameEvents.SET_ACTIV_PAGE,
      //   this.components.uiGamePage
      // );
    });

    this.eventManager.on(GameEvents.GAME_CONTINUE, () => {
      this.pageShow(UIConfig.pages.UIGamePage);
      this.stateManager.setActivePage(this.components.uiGamePage);
    });

    this.eventManager.on(
      GameEvents.UI_NOTIFICATION,
      (message, type = "info") => {
        this.components.uiNotification.addToQueue(message, type);
      }
    );
  }

  toggleFullscreen(fullScreenBtn) {
    // Проверка iOS/Safari (современный способ)
    const isIOS = () => {
      // 1. Проверка User-Agent
      const userA = navigator.userAgent;
      const isIOSUserAgent = /(iPad|iPhone|iPod)/gi.test(userA);

      // 2. Проверка по поведенческим особенностям
      const isTouchDevice = "ontouchstart" in window;
      const isAppleDevice = window.ApplePaySetupFeature || window.webkit;

      // 3. Проверка полноэкранного API
      const isFullscreenSupported =
        document.fullscreenEnabled ||
        document.webkitFullscreenEnabled ||
        document.webkitSupportsFullscreen;

      return (
        (isIOSUserAgent || isAppleDevice) &&
        isTouchDevice &&
        !isFullscreenSupported
      );
    };

    // Обработка iOS
    if (isIOS()) {
      // Специальная обработка для видео/iframe
      const videoElements = document.getElementsByTagName("video");
      if (videoElements.length > 0) {
        videoElements[0].webkitEnterFullscreen();
        fullScreenBtn.textContent = "_";
        return;
      }

      // Показываем инструкцию для iOS
      alert(
        "На iPhone:\n1. Нажмите кнопку 'Поделиться'\n2. Выберите 'На экран «Домой»'\n3. Откройте сайт из главного экрана"
      );
      return;
    }

    // Стандартная реализация для других платформ
    if (!document.fullscreenElement) {
      const elem = document.documentElement;

      // Пробуем все варианты API
      const requestFs =
        elem.requestFullscreen ||
        elem.webkitRequestFullscreen ||
        elem.webkitEnterFullscreen;

      if (requestFs) {
        requestFs
          .call(elem)
          .then(() => (fullScreenBtn.textContent = "_"))
          .catch((err) => {
            console.error("Fullscreen error:", err);
            alert("Разрешите полноэкранный режим в настройках браузера");
          });
      }
    } else {
      const exitFs = document.exitFullscreen || document.webkitExitFullscreen;

      exitFs.call(document);
      fullScreenBtn.textContent = "[ ]";
    }
  }

  hideAll() {
    this.pages.forEach((page) => {
      page.page.classList.add("hidden");
    });
  }

  pageShow(namePage) {
    this.hideAll();
    this.activePage = namePage;
    this.showByName(this.activePage);
  }
}
