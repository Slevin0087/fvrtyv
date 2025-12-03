import { GameEvents } from "../utils/Constants.js";
import { UIGreetingsPage } from "../ui/UIGreetingsPage.js";
import { UINamePage } from "../ui/UINamePage.js";
import { UIMenuPage } from "../ui/UIMenuPage.js";
import { UIGamePage } from "../ui/UIGamePage.js";
import { UISettingsPage } from "../ui/UISettingsPage.js";
import { UIPlayerStatePage } from "../ui/UIPlayerStatePage.js";
import { UIShopPage } from "../ui/UIShopPage.js";
import { UINotificationPage } from "../ui/UINotificationPage.js";
import { UIConfig } from "../configs/UIConfig.js";

export class UIManager {
  constructor(
    eventManager,
    stateManager,
    gameModesManager,
    translator,
    shopNavigation
  ) {
    this.components = {};
    this.eventManager = eventManager;
    this.stateManager = stateManager;
    this.gameModesManager = gameModesManager;
    this.translator = translator;
    this.shopNavigation = shopNavigation;
    this.pages = new Map();
    this.activePage = this.stateManager.getActivePage();
    this.spinner = document.getElementById("loader");

    this.init();
  }

  init() {
    this.registerPages();
    this.setupEventListeners();
    this.hideAll();
    if (!this.stateManager.getPlayerName()) {
      this.showByName(this.activePage);
    } else {
      console.log(
        "this.stateManager.getGreetingsPageUsed(): ",
        this.stateManager.getGreetingsPageUsed()
      );

      if (!this.stateManager.getGreetingsPageUsed()) {
        console.log("ggggggggggg");

        this.pageShow(UIConfig.pages.UIGreetingsPage);
      } else {
        this.pageShow(UIConfig.pages.UIMenuPage);
      }
    }
  }

  registerPages() {
    // Автоматическая регистрация всех страниц
    this.registerPageForTranslation(
      UIConfig.pages.UIGreetingsPage,
      UIGreetingsPage
    );
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
    // this.registerPage(UIConfig.pages.UINotificationPage, UINotificationPage);
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
      this.gameModesManager,
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
      if (!this.stateManager.getGreetingsPageUsed()) {
        this.pageShow(UIConfig.pages.UIGreetingsPage);
      } else {
        this.pageShow(UIConfig.pages.UIMenuPage);
      }
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
      console.log("userA: ", userA);

      const isIOSUserAgent = /(iPad|iPhone|iPod)/gi.test(userA);
      console.log("isIOSUserAgent: ", isIOSUserAgent);

      // 2. Проверка по поведенческим особенностям
      const isTouchDevice = "ontouchstart" in window;
      console.log("isTouchDevice: ", isTouchDevice);

      // const isAppleDevice = !!(window.ApplePaySetupFeature || window.webkit);
      // console.log('window.webkit: ', window.webkit);

      // 3. Проверка полноэкранного API
      const isFullscreenSupported =
        document.fullscreenEnabled ||
        document.webkitFullscreenEnabled ||
        document.webkitSupportsFullscreen;
      console.log("isFullscreenSupported: ", isFullscreenSupported);

      console.log(
        "&&&&&: ",
        isIOSUserAgent && isTouchDevice && !isFullscreenSupported
      );

      const div = document.createElement("div");
      div.style.width = "30px";
      div.style.height = "100px";
      div.style.position = "absolute";
      div.style.left = "30%";
      div.style.top = "30%";
      div.style.transform = "translateX(-50%)";
      div.style.backgroundColor = "blue";
      div.style.color = "withe";
      div.className = "div-test";
      div.textContent = isFullscreenSupported
      document.querySelector('body').append(div)
      return isIOSUserAgent && isTouchDevice && isFullscreenSupported;
    };

    console.log("isIOS(): ", isIOS());
    // Обработка iOS
    // if (isIOS()) {
    //   // Специальная обработка для видео/iframe
    //   const videoElements = document.getElementsByTagName("video");
    //   if (videoElements.length > 0) {
    //     videoElements[0].webkitEnterFullscreen();
    //     fullScreenBtn.textContent = "_";
    //     return;
    //   }

    //   // Показываем инструкцию для iOS
    //   alert(
    //     "На iPhone:\n1. Нажмите кнопку 'Поделиться'\n2. Выберите 'На экран «Домой»'\n3. Откройте сайт из главного экрана"
    //   );
    //   return;
    // }

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
      page.hide();
    });
  }

  pageShow(namePage) {
    this.hideAll();
    this.activePage = namePage;
    this.showByName(this.activePage);
  }
}
