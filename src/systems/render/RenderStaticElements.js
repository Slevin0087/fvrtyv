export class RenderStaticElements {
  constructor(domElements) {
    this.domElements = domElements;
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
      this.domElements.foundationsDiv.append(foundation.element);
      console.log("в addElementsInDom:", this.domElements.foundationsDiv);
    });

    tableaus.forEach((tableau) => {
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
