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
    const ua = navigator.userAgent.toLowerCase();
    const isIOS =
      /(iphone|ipad|ipod)/.test(ua) ||
      (/macintosh.*safari/.test(ua) && "ontouchstart" in window);

    // Проверяем PWA режим
    const isPWA =
      window.navigator.standalone === true ||
      window.matchMedia("(display-mode: standalone)").matches;
    console.log("window.navigator.standalone: ", window.navigator.standalone);

    if (isIOS) {
      const div = document.createElement("div");
      div.style.width = "100px";
      div.style.height = "100px";
      div.style.position = "absolute";
      div.style.left = "10%";
      div.style.top = "30%";
      div.style.transform = "translateX(-10%)";
      div.style.backgroundColor = "blue";
      div.style.color = "withe";
      div.className = "div-test";
      const ddd = window.navigator.standalone;
      div.textContent = `standalone: ${ddd}`;
      document.querySelector("body").append(div);
      if (isPWA) {
        return;
      }
      // Если не PWA - показываем инструкцию по установке
      // this.showIOSInstallPrompt();
      // return;
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

  showIOSInstallPrompt() {
    const div = document.createElement("div");
    div.innerHTML = `
    <div id="ios-install" style="
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background: rgba(0,0,0,0.95);
      z-index: 9999;
      color: white;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      padding: 20px;
    ">
      <h2>📱 Для полного экрана</h2>
      <div style="margin: 30px 0; font-size: 18px; line-height: 1.8;">
        <p>1. Откройте в <strong>Safari</strong></p>
        <p>2. Нажмите кнопку <span style="color: #007aff;">⎊ Поделиться</span></p>
        <p>3. Выберите <strong>"На экран «Домой»"</strong></p>
        <p>4. Откройте с главного экрана</p>
      </div>
      <button id="ios-install-apply-btn" style="
        padding: 12px 30px;
        background: #007aff;
        color: white;
        border: none;
        border-radius: 20px;
        font-size: 16px;
        cursor: pointer;
      ">
        Понятно
      </button>
    </div>
  `;

    const handleApplyBtn = () => {
      div.remove();
    };
    document.body.appendChild(div);
    const btn = document.getElementById("ios-install-apply-btn");
    btn.onclick = handleApplyBtn;
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
