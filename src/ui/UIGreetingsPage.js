import { UIPage } from "./UIPage.js";
import { GameEvents } from "../utils/Constants.js";
import { windowResize } from "../systems/uiSystems/WindowResizeHandler.js";
import { GameModesIds } from "../configs/GameModesConfogs.js";

export class UIGreetingsPage extends UIPage {
  constructor(eventManager, stateManager, gameModesManager, translator) {
    super(eventManager, stateManager, "greetings-page");
    this.eventManager = eventManager;
    this.stateManager = stateManager;
    this.gameModesManager = gameModesManager;
    this.translator = translator;
    this.elements = {
      contentContainer: document.getElementById(
        "greetings-page-content-container"
      ),
      modeChoiceContainer: document.getElementById(
        "greetings-game-mode-choice-container"
      ),
      desktopVersion: document.getElementById(
        "game-mode-select-desktop-version"
      ),
      desktopVersionRadioInputs: document.querySelectorAll(
        'input[name="game-mode"]'
      ),
      mobileVersion: document.getElementById("game-mode-select-mobile-version"),
      mobileVersionSelected: document.getElementById("game-mode-select-mobile"),
      playGameBtn: document.getElementById("greetings-page-btn-play-game"),
      gameRulesContainer: document.getElementById("game-rules-text-container"),
      gameRulesP: document.getElementById("game-rules-text-p"),
      gameRulesClose: document.getElementById("game-rules-text-close"),
      gameRulesClearBtn: document.getElementById("game-rules-clear-btn"),
      otherSettingsP: document.getElementById("greetings-game-mode-choice-p"),
    };

    this.previouslyChecked = null;
  }

  setupEventListeners() {
    this.elements.playGameBtn.onclick = async () => {
      this.stateManager.setGreetingsPageUsed(true);
      this.stateManager.saveGameState();
      await this.onClickPlayGameBtn();
    };
    this.elements.gameRulesP.onclick = () => {
      this.onClickGameRulesP();
    };
    this.elements.otherSettingsP.onclick = () => {
      this.onClickOtherSettingsP();
    };
    this.elements.gameRulesClose.onclick = () => {
      this.onClickGameRulesClose();
    };
    this.elements.gameRulesClearBtn.onclick = () => {
      this.onClickGameRulesClose();
    };
    // this.setHandlersForCurrentSelectedVersion();
  }

  async onClickPlayGameBtn() {
    this.eventManager.emit(GameEvents.RESET_STATE_FOR_NEW_GAME);
    await this.eventManager.emitAsync(GameEvents.SET_NEW_GAME);
    this.stateManager.setIsRunning(true);
    this.stateManager.setIsPaused(false);
    this.eventManager.emit(GameEvents.UI_UPDATE_GAME_PAGE);
  }

  onClickGameRulesP() {
    this.elements.gameRulesContainer.classList.remove("hidden");
    this.elements.modeChoiceContainer.classList.add("hidden");
  }

  onClickGameRulesClose() {
    this.elements.modeChoiceContainer.classList.remove("hidden");
    this.elements.gameRulesContainer.classList.add("hidden");
  }

  onClickOtherSettingsP() {
    this.eventManager.emit(GameEvents.UI_SETTINGS_SHOW);
  }

  onChangeModeSelected(e) {
    if (e.target.value === GameModesIds.VEGAS) {
      e.preventDefault();
      this.eventManager.emit(GameEvents.CHOICE_VEGAS_MODE);
    }
    this.gameModesManager.setAllDataCurrentMode(e.target.value);
    this.renderCurrectSelectedVersion();
  }

  renderCurrectSelectedVersion() {
    const desktopStyle = window.getComputedStyle(this.elements.desktopVersion);
    const mobileStyle = window.getComputedStyle(this.elements.mobileVersion);
        console.log(
      "desktopStyle, mobileStyle: ",
      desktopStyle.display,
      mobileStyle.display
    );
    if (desktopStyle.display !== "none" && mobileStyle.display === "none") {
      this.reRenderDisctopVersionSelected();
    } else if (
      desktopStyle.display === "none" &&
      mobileStyle.display !== "none"
    ) {
      this.reRenderMobileVersionSelected();
    }
  }

  // setHandlersForCurrentSelectedVersion() {
  //   const desktopStyle = window.getComputedStyle(this.elements.desktopVersion);
  //   const mobileStyle = window.getComputedStyle(this.elements.mobileVersion);

  //   if (desktopStyle.display !== "none" && mobileStyle.display === "none") {
  //     this.elements.desktopVersionRadioInputs.forEach((radioInput) => {
        
  //       console.log("e.target.checked: ", e.target.checked);
  //       radioInput.onchange = (e) => {
  //         this.onChangeModeSelected(e);
  //       };
  //     });
  //   } else if (
  //     desktopStyle.display === "none" &&
  //     mobileStyle.display !== "none"
  //   ) {
  //     this.elements.mobileVersionSelected.onchange = (e) => {
  //       this.onChangeModeSelected(e);
  //     };
  //   }
  // }

  resizeGameModeSelected = (dimensions) => {
    console.log("в resizeGameModeSelected");
    const div = document.createElement("div");
    div.style.width = "30px";
    div.style.height = "100px";
    div.style.position = "absolute";
    div.style.left = "50%";
    div.style.top = "50%";
    div.style.transform = "translateX(-50%)";
    div.style.backgroundColor = "blue";
    div.style.color = "withe";
    div.className = "div-test";
    const {
      locationbar,
      isMobileDevice,
      visualViewport,
      availableWidth,
      availableHeight,
    } = dimensions;
    // div.textContent = `${availableHeight}, ${isMobileDevice}`
    div.textContent = `${locationbar.visible}, ${availableHeight}, ${isMobileDevice}`;
    document.querySelector("body").append(div);
    if (availableHeight < 750) {
      this.elements.desktopVersion.classList.add("hidden");
      this.elements.mobileVersion.classList.remove("hidden");
      this.reRenderMobileVersionSelected();
    } else {
      console.log("availableHeight: ", availableHeight);
      this.elements.mobileVersion.classList.add("hidden");
      this.elements.desktopVersion.classList.remove("hidden");
      this.reRenderDisctopVersionSelected();
    }
  };

  reRenderMobileVersionSelected() {
    const mobileVersionSelected = this.elements.mobileVersionSelected;
    mobileVersionSelected.value = this.gameModesManager.getCurrentModeName();
    mobileVersionSelected.onchange = (e) => {
      this.onChangeModeSelected(e);
    };
  }

  reRenderDisctopVersionSelected() {
    this.elements.desktopVersionRadioInputs.forEach((radioInput) => {
      radioInput.checked =
        radioInput.value === this.gameModesManager.getCurrentModeName();
      radioInput.onchange = (e) => {
        this.onChangeModeSelected(e);
      };
    });
  }

  show() {
    windowResize.addListener(this.resizeGameModeSelected);
    this.renderCurrectSelectedVersion();
    super.show();
  }

  hide() {
    windowResize.removeListener(this.resizeGameModeSelected);
    super.hide();
  }
}
