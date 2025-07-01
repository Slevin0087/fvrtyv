export class RenderStaticElements {
  constructor(domElements) {
    this.domElements = domElements;
  }

  render({ foundations, tableaus }) {
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
      this.domElements.foundationsDiv.append(foundation.element);
    });

    tableaus.forEach((tableau) => {
      this.domElements.tableausEl.append(tableau.element);
    });
  }
}
