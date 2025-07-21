import { GameConfig } from "../../configs/GameConfig.js";
import { GameEvents } from "../../utils/Constants.js";

export class DragAndDrop {
  constructor(eventManager, stateManager, audioManager, movementSystem) {
    this.eventManager = eventManager;
    this.stateManager = stateManager;
    this.audioManager = audioManager;
    this.movementSystem = movementSystem;
    this.cardContainers = GameConfig.cardContainers;
    this.currentDraggingCard = null;
    this.cardDataAdttributes = GameConfig.dataAttributes.dataAttributeDND;
    this.dataCardParent = GameConfig.dataAttributes.cardParent;
    this.offsetX = null;
    this.offsetY = null;
    this.isDragging = false;

    this.setupEventListeners();
  }

  setupEventListeners() {
    document.addEventListener("pointerdown", (event) =>
      this.onPointerDown(event)
    );
    document.addEventListener("pointermove", (event) =>
      this.onPointerMove(event)
    );
    document.addEventListener("pointerup", () => this.onPointerUp());
  }

  onPointerDown(event) {
    console.log('onPointerDown');
    
    const { target, x, y } = event;

    const isDraggable = target.closest(
      `[${GameConfig.dataAttributes.dataAttributeDND}]`
    );
    console.log('isDraggable:', isDraggable);
    
    if (isDraggable === null) return;
    this.currentDraggingCard = isDraggable;
    this.offsetX = x;
    this.offsetY = y;
  }
  
  onPointerMove(event) {
    if (!this.currentDraggingCard) return;
    const x = event.clientX - this.offsetX;
    const y = event.clientY - this.offsetY;
    console.log("x, y:", x, y);

    // Если перемещение больше 5px — считаем это drag’ом
    if (Math.abs(x) > 5 || Math.abs(y) > 5) {
      this.currentDraggingCard.classList.add("is-dragging");
      this.isDragging = true;
      this.currentDraggingCard.style.zIndex = "100";
      this.currentDraggingCard.style.left = `${x}px`;
      this.currentDraggingCard.style.top = `${y}px`;
    }
    // this.isDragging = false;
  }

  onPointerUp() {
    console.log("onPointerUp");
    if (this.currentDraggingCard === null) return;
    if (this.isDragging === false) {
      console.log("в if");

      const gameComponents = this.stateManager.state.cardsComponents;
      const source = this.currentDraggingCard.dataset[this.dataCardParent];
      const card = this.getCard(source, gameComponents);
      console.log("card:", card);

      this.eventManager.emit(GameEvents.CARD_CLICK, card);
      this.currentDraggingCard = null;
      return;
    }
    console.log("после if");

    this.offsetX = null;
    this.offsetY = null;
    this.isDragging = false;
    this.currentDraggingCard.classList.remove("is-dragging");
    this.currentDraggingCard = null;
  }

  parseTargetId(targetId) {
    const [type, index] = targetId.split("-");
    return [type, parseInt(index)];
  }

  getCard(source, gameComponents) {
    let cardElement = null;
    if (source.startsWith(this.cardContainers.tableau)) {
      const index = parseInt(source.split("-")[1]);
      gameComponents.tableaus[index].cards.forEach((card) => {
        if (card.domElement === this.currentDraggingCard) {
          cardElement = card;
        }
      });
      return cardElement;
    } else if (source.startsWith(this.cardContainers.foundation)) {
      const index = parseInt(source.split("-")[1]);
      gameComponents.foundations[index].cards.forEach((card) => {
        if (card.domElement === this.currentDraggingCard) {
          cardElement = card;
        }
      });
      return cardElement;
    } else if (source.startsWith(this.cardContainers.waste)) {
      gameComponents.waste.cards.forEach((card) => {
        if (
          gameComponents.waste.getTopCard().domElement ===
          this.currentDraggingCard
        ) {
          cardElement = card;
        }
      });
      return cardElement;
    }
    return cardElement;
  }
}
