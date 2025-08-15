import { GameConfig } from "../../configs/GameConfig.js";
import { GameEvents } from "../../utils/Constants.js";

export class RenderStaticElements {
  constructor(domElements, eventManager) {
    this.domElements = domElements;
    this.eventManager = eventManager;
  }

  render(foundations, tableaus) {
    this.clearContainers();
    this.addElementsInDom(foundations, tableaus);
  }

  addElementsInDom(foundations, tableaus) {
    this.domElements.gameContainer.append(
      this.domElements.rowElement,
      this.domElements.tableausEl
    );
    this.domElements.rowElement.append(
      this.domElements.stockDivEl,
      this.domElements.foundationsDiv
    );

    foundations.forEach((foundation) => {
      this.eventManager.emit(
        GameEvents.SET_CARD_DATA_ATTRIBUTE,
        foundation.element,
        GameConfig.dataAttributes.setFAndTContainers,
      );
      this.domElements.foundationsDiv.append(foundation.element);
    });

    tableaus.forEach((tableau) => {
      this.eventManager.emit(
        GameEvents.SET_CARD_DATA_ATTRIBUTE,
        tableau.element,
        GameConfig.dataAttributes.setFAndTContainers
      );
      this.domElements.tableausEl.append(tableau.element);
    });
  }

  clearContainers() {
    this.domElements.gameContainer.innerHTML = "";
    this.domElements.rowElement.innerHTML = "";
    this.domElements.tableausEl.innerHTML = "";
    this.domElements.foundationsDiv.innerHTML = "";
  }
}
