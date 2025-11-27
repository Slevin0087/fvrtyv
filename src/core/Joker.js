import { GameConfig } from "../configs/GameConfig.js";

export class Joker {
  constructor() {
    this.suit = "♥";
    this.value = "JOKER";
    this.faceUp = false;
    this.isUndo = false;
    this.domElement = null;
    this.positionData = {
      parent: null, // 'stock', 'waste', 'tableau-#', 'foundation-#'
      position: null,
      elementPosition: -1,
      index: -1, // индекс в родительском массиве
      offsetX: 0,
      offsetY: 0, // смещение в столбце (для tableau)
      zIndex: 0,
    };
    this.parentElement = null;
  }

  flip(boolean) {
    this.faceUp = boolean;
  }

  setDataAttribute(nameAttribite, valueAttribute = "") {
    if (!this.domElement) return;
    this.domElement.setAttribute(nameAttribite, valueAttribute);
  }

  removeDataAttribute(nameAttribite) {
    if (!this.domElement) return;
    this.domElement.removeAttribute(nameAttribite);
  }
}
