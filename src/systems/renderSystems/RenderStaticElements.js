import { GameConfig } from "../../configs/GameConfig.js";
import { GameEvents } from "../../utils/Constants.js";
import { gamePageElements } from "../../utils/gamePageElements.js";

export class RenderStaticElements {
  constructor(eventManager) {
    this.gamePageElements = gamePageElements;
    this.eventManager = eventManager;
  }

  render(foundations, tableaus) {
    this.clearContainers();
    this.addElementsInDom(foundations, tableaus);
  }

  addElementsInDom(foundations, tableaus) {
    this.gamePageElements.gameContainer.append(
      this.gamePageElements.rowElement,
      this.gamePageElements.tableausEl
    );
    this.gamePageElements.rowElement.append(
      this.gamePageElements.stockDivEl,
      this.gamePageElements.foundationsDiv
    );

    foundations.forEach((foundation) => {
      this.eventManager.emit(
        GameEvents.SET_CARD_DATA_ATTRIBUTE,
        foundation.element,
        GameConfig.dataAttributes.setFAndTContainers,
      );
      this.gamePageElements.foundationsDiv.append(foundation.element);
    });

    tableaus.forEach((tableau) => {
      this.eventManager.emit(
        GameEvents.SET_CARD_DATA_ATTRIBUTE,
        tableau.element,
        GameConfig.dataAttributes.setFAndTContainers
      );
      this.gamePageElements.tableausEl.append(tableau.element);
    });
  }

  clearContainers() {
    this.gamePageElements.gameContainer.innerHTML = "";
    this.gamePageElements.rowElement.innerHTML = "";
    this.gamePageElements.tableausEl.innerHTML = "";
    this.gamePageElements.foundationsDiv.innerHTML = "";
  }
}
