export class Joker {
  constructor() {
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
}
