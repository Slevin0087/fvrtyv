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
    this.card = null;

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

    const { target, x, y } = event;

    const isDraggable = target.closest(
      `[${GameConfig.dataAttributes.dataAttributeDND}]`
    );

    if (isDraggable === null) return;
    this.currentDraggingCard = isDraggable;
    const gameComponents = this.stateManager.state.cardsComponents;
    const source = this.currentDraggingCard.dataset[this.dataCardParent];

    this.card = this.getCard(source, gameComponents); 
    this.offsetX = x;
    this.offsetY = y;
  }

  onPointerMove(event) {
    if (!this.currentDraggingCard) return;
    const x = event.clientX - this.offsetX + this.card.positionData.offsetX;
    const y = event.clientY - this.offsetY + this.card.positionData.offsetY;

    // Если перемещение больше 5px — считаем это drag’ом
    if (Math.abs(x) > 5 || Math.abs(y) > 5) {
      this.currentDraggingCard.classList.add("is-dragging");
      this.isDragging = true;
      this.currentDraggingCard.style.zIndex = "100";
      this.currentDraggingCard.style.transform = `translate(${x}px, ${y}px)`;
    }
  }

  onPointerUp() {
    if (!this.currentDraggingCard) return;

    if (!this.isDragging) {
      this.eventManager.emit(GameEvents.CARD_CLICK, this.card);
      this.resetDragState();
      return;
    }

    const computedStyle = window.getComputedStyle(this.currentDraggingCard);
    const returnAnimation = this.currentDraggingCard.animate(
      [
        { transform: computedStyle.transform },
        {
          transform: `translate(${this.card.positionData.offsetX}px, ${this.card.positionData.offsetY}px)`,
        },
      ],
      { duration: 3000, easing: "ease-out" }
    );

    returnAnimation.onfinish = () => {
      this.currentDraggingCard.style.transform = `translate(${this.card.positionData.offsetX}px, ${this.card.positionData.offsetY}px)`;
      this.currentDraggingCard.style.zIndex = this.card.positionData.zIndex;
      this.currentDraggingCard.classList.remove("is-dragging");
      this.resetDragState();
    };
  }

  // onPointerUp(event) {
  //   console.log("onPointerUp event:", event);
  //   if (this.currentDraggingCard === null) return;
  //   const x = event.clientX;
  //   const y = event.clientY;
  //   const gameComponents = this.stateManager.state.cardsComponents;
  //   console.log("this.dataCardParent:", this.dataCardParent);
  //   const source = this.currentDraggingCard.dataset[this.dataCardParent];
  //   console.log("source:", source);

  //   const card = this.getCard(source, gameComponents);
  //   console.log("card:", card);
  //   if (this.isDragging === false) {
  //     console.log("в if");

  //     this.eventManager.emit(GameEvents.CARD_CLICK, card);
  //     this.currentDraggingCard = null;
  //     return;
  //   }
  //   console.log("после if", x, y);

  //   this.isDragging = false;
  //   // Запоминаем текущие координаты
  //   const currentRect = this.currentDraggingCard.getBoundingClientRect();

  //   this.newDifferenceX = x - currentRect.left;
  //   this.newDifferenceY = y - currentRect.top;

  //   console.log("this.newDifferenceX, this.newDifferenceY:", this.newDifferenceX, this.newDifferenceY);

  //   const startX = 0;
  //   const startY = 0;
  //   console.log("this.oldX, this.oldY:", this.oldX, this.oldY);
  //   console.log(
  //     "currentRect.left, currentRect.top:",
  //     currentRect.left,
  //     currentRect.top
  //   );
  //   const endX = this.newDifferenceX - x;
  //   const endY = this.newDifferenceY - y;
  //   console.log("endX, endY:", endX, endY);
  //   // Создаем анимацию возврата
  //   // this.currentDraggingCard.left = currentRect.left;
  //   // this.currentDraggingCard.top = currentRect.top;
  //   // void this.currentDraggingCard.offsetHeight;

  //   const returnAnimation = this.currentDraggingCard.animate(
  //     [
  //       {
  //         transform: `translate(${startX + card.positionData.offsetX}px, ${
  //           startY + card.positionData.offsetY
  //         }px)`,
  //         // left: `${currentRect.left}px`,
  //         // top: `${currentRect.top}px`,
  //       },
  //       {
  //         transform: `translate(${endX}px, ${endY}px)`,
  //         // left: `${card.positionData.offsetX}px`,
  //         // top: `${card.positionData.offsetY}px`,
  //       },
  //     ],
  //     {
  //       duration: 3000,
  //       easing: "ease-out",
  //     }
  //   );

  //   // По завершении анимации
  //   returnAnimation.onfinish = () => {
  //     console.log('card.positionData.offsetY:', card.positionData.offsetY);

  //     this.currentDraggingCard.style.transform = `translate(${card.positionData.offsetX}px, ${card.positionData.offsetY}px)`;
  //     // this.currentDraggingCard.style.transform = "none";
  //     // this.currentDraggingCard.style.left = `${card.positionData.offsetX}px`;
  //     // this.currentDraggingCard.style.top = `${card.positionData.offsetY}px`;
  //     this.currentDraggingCard.style.zIndex = card.positionData.zIndex;
  //     this.currentDraggingCard.classList.remove("is-dragging");
  //     this.resetDragState();
  //   };

  //   // Если анимация не поддерживается - мгновенный возврат
  //   returnAnimation.oncancel = () => {
  //     this.currentDraggingCard.style.transform = "none";
  //     this.currentDraggingCard.style.left = `${this.oldX}px`;
  //     this.currentDraggingCard.style.top = `${this.oldY}px`;
  //     this.resetDragState();
  //   };

  //   // this.currentDraggingCard.style.left = `${this.offsetX}px`;
  //   // this.currentDraggingCard.style.top = `${this.offsetY}px`;
  //   // setTimeout(() => {
  //   //   this.currentDraggingCard.style.transform = "none";
  //   //   // this.currentDraggingCard.style.left = `${this.oldX}px`;
  //   //   // this.currentDraggingCard.style.top = `${this.oldY}px`;

  //   // }, 2000);
  // }

  // Новый метод для сброса состояния
  resetDragState() {
    this.currentDraggingCard = null;
    this.isDragging = false;
    this.offsetX = null;
    this.offsetY = null;
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
      const card = gameComponents.waste.getTopCard();
      console.log("в source.startsWith(this.cardContainers.waste) card", card);

      //   gameComponents.waste.cards.forEach((card) => {
      if (card.domElement === this.currentDraggingCard) {
        cardElement = card;
      }
      //   });
      return cardElement;
    }
    return cardElement;
  }
}
