import { GameConfig } from "../../configs/GameConfig.js";
import { GameEvents, AnimationOperators } from "../../utils/Constants.js";
import { Animator } from "../../utils/Animator.js";
import { UIConfig } from "../../configs/UIConfig.js";

export class DragAndDrop {
  constructor(
    eventManager,
    stateManager,
    audioManager,
    movementSystem,
    scoringSystem
  ) {
    this.eventManager = eventManager;
    this.stateManager = stateManager;
    this.state = this.stateManager.state;
    this.audioManager = audioManager;
    this.movementSystem = movementSystem;
    this.scoringSystem = scoringSystem;
    this.cardContainers = GameConfig.cardContainers;
    this.currentDraggingCard = null;
    this.currentDraggingCardSource = null;
    this.cardDataAdttributes = GameConfig.dataAttributes.dataAttributeDND;
    this.dataCardParent = GameConfig.dataAttributes.cardParent;
    this.numberMoves = GameConfig.rules.initialMove;
    this.addition = AnimationOperators.ADDITION;
    this.subtraction = AnimationOperators.SUBTRACTION;
    this.gameComponents = null;

    this.offsetX = null;
    this.offsetY = null;
    this.isDragging = false;
    this.cards = null;
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
    document.addEventListener("pointerup", (event) => this.onPointerUp(event));

    // Для мобильных устройств
    // document.addEventListener("touchstart", (event) =>
    //   this.onTouchStart(event)
    // );
    // document.addEventListener("touchmove", (event) => this.onTouchMove(event));
    // document.addEventListener("touchend", (event) => this.onTouchEnd(event));
  }

  onTouchStart(event) {
    event.preventDefault(); // Предотвращаем скролл страницы
    const touch = event.touches[0];
    this.onPointerDown({
      target: touch.target,
      x: touch.clientX,
      y: touch.clientY,
    });
  }

  onTouchMove(event) {
    event.preventDefault(); // Предотвращаем скролл страницы
    const touch = event.touches[0];
    this.onPointerMove({
      clientX: touch.clientX,
      clientY: touch.clientY,
    });
  }

  onTouchEnd(event) {
    event.preventDefault();
    const touch = event.changedTouches[0];
    this.onPointerUp({
      clientX: touch.clientX,
      clientY: touch.clientY,
    });
  }

  onPointerDown(event) {
    if (
      this.state.cardsComponents.foundations.every((f) =>
        f.isComplete()
      )
    )
      return;
    const { target, x, y } = event;

    const isDraggable = target.closest(
      `[${GameConfig.dataAttributes.dataAttributeDND}]`
    );
    console.log("isDraggable:", isDraggable);

    if (isDraggable === null) return;
    this.currentDraggingCard = isDraggable;
    this.currentDraggingCardSource =
      this.currentDraggingCard.dataset[this.dataCardParent];
    this.gameComponents = this.state.cardsComponents;
    this.cards = this.getCards(
      this.currentDraggingCardSource,
      this.gameComponents
    );
    console.log("this.cards:", this.cards);

    this.offsetX = x;
    this.offsetY = y;
  }

  onPointerMove(event) {
    if (!this.currentDraggingCard) return;
    this.cards.forEach((card, index) => {
      this.currentDraggingCard = card.domElement;
      const x = event.clientX - this.offsetX + card.positionData.offsetX;
      const y = event.clientY - this.offsetY + card.positionData.offsetY;

      // Если перемещение больше 5px — считаем это drag’ом
      if (Math.abs(x) > 5 || Math.abs(y) > 5) {
        card.domElement.classList.add("is-dragging");
        this.isDragging = true;
        card.domElement.style.zIndex = `${100 + index}`;
        card.domElement.style.transform = `translate(${x}px, ${y}px)`;
      }
    });
  }

  onPointerUp(event) {
    if (!this.currentDraggingCard) return;
    if (!this.isDragging) {
      this.eventManager.emit(GameEvents.CARD_CLICK, this.cards[0]);
      this.resetDragState();
      return;
    }
    if (!this.state.game.playerFirstCardClick) {
      this.state.game.playerFirstCardClick = true;
      this.eventManager.emit(GameEvents.START_PLAY_TIME, 0);
    }
    this.cards.forEach((card) => {
      card.domElement.style.visibility = "hidden";
      card.domElement.style.pointerEvents = "none";
    });

    const fromPoint = document.elementFromPoint(event.clientX, event.clientY);
    this.cards.forEach((card) => {
      card.domElement.style.visibility = "visible";
      card.domElement.style.pointerEvents = "auto";
    });
    console.log("fromPoint:", fromPoint);

    const fAndT = this.isTAndF(fromPoint);

    const target = this.getDropTarget(fromPoint);
    // const marker = document.createElement("div");
    // marker.textContent = `${target === null ? "null" : target.textContent}`;
    // marker.style.cssText = `
    //     position: fixed;
    //     left: ${event.clientX}px;
    //     top: ${event.clientY}px;
    //     width: 50px;
    //     height: 50px;
    //     background: red;
    //     border-radius: 50%;
    //     z-index: 9999;
    //     pointer-events: none;
    //     display: flex;
    //     justify-content: center;
    //     align-items: center;
    // `;
    // document.body.appendChild(marker);
    // setTimeout(() => marker.remove(), 3000);
    console.log("fAndT, target:", fAndT, target);

    if (target === null && fAndT === null) {
      this.cards.forEach((card) => {
        this.animate(card);
      });
      return;
    } else if (target === null && fAndT) {
      console.log("if");
      const source = fAndT.id;
      if (source.startsWith(this.cardContainers.tableau)) {
        const index = parseInt(source.split("-")[1]);
        if (
          this.gameComponents.tableaus[index].cards.length === 0 &&
          this.gameComponents.tableaus[index].canAccept(this.cards[0])
        ) {
          const targetSource = fAndT.dataset[this.dataCardParent];

          const [containerToName, containerToIndex] = this.parseTargetId(
            fAndT.id
          );
          this.moveFunction({
            targetSource,
            containerTo: this.gameComponents.tableaus[index],
            containerToName,
          });
        }
        this.cards.forEach((card) => this.animate(card));
      } else if (source.startsWith(this.cardContainers.foundation)) {
        const index = parseInt(source.split("-")[1]);
        if (
          this.gameComponents.foundations[index].cards.length === 0 &&
          this.gameComponents.foundations[index].canAccept(
            this.cards[0],
            this.gameComponents
          )
        ) {
          const targetSource = fAndT.dataset[this.dataCardParent];
          // console.log('');

          const [containerToName, containerToIndex] = this.parseTargetId(
            fAndT.id
          );

          this.moveFunction({
            targetSource,
            containerTo: this.gameComponents.foundations[index],
            containerToName,
          });
        }
        this.cards.forEach((card) => this.animate(card));
      }
      // } else if (target && fAndT === null) {
    } else if (target) {
      const targetSource = target.dataset[this.dataCardParent];
      console.log("targetSource:", targetSource);

      const [containerToName, containerToIndex] =
        this.parseTargetId(targetSource);
      const containerTo = this.getGameComponent(targetSource);
      const canAccept = this.isCanAccept(
        this.cards[0],
        targetSource,
        containerTo
      );
      console.log("canAccept:", canAccept);

      if (canAccept) {
        console.log("ПЕРЕД АПОМ");

        this.moveFunction({ targetSource, containerTo, containerToName });
      } else if (!canAccept) {
        this.cards.forEach((card) => {
          this.animate(card);
        });
      }
    }
  }

  animate(card) {
    const computedStyle = window.getComputedStyle(card.domElement);
    const returnAnimation = card.domElement.animate(
      [
        { transform: computedStyle.transform },
        {
          transform: `translate(${card.positionData.offsetX}px, ${card.positionData.offsetY}px)`,
        },
      ],
      { duration: 500, easing: "ease-out" }
    );

    returnAnimation.onfinish = () => {
      card.domElement.style.transform = `translate(${card.positionData.offsetX}px, ${card.positionData.offsetY}px)`;
      card.domElement.style.zIndex = card.positionData.zIndex;
      card.domElement.classList.remove("is-dragging");
      this.resetDragState();
    };
  }

  animateTo(card) {
    const returnAnimation = card.domElement.animate(
      [
        {
          transform: `translate(${card.positionData.offsetX}px, ${card.positionData.offsetY}px)`,
        },
        {
          transform: `translate(${card.positionData.offsetX}px, ${card.positionData.offsetY}px)`,
        },
      ],
      { duration: 500, easing: "ease-out" }
    );

    returnAnimation.onfinish = () => {
      card.domElement.style.transform = `translate(${card.positionData.offsetX}px, ${card.positionData.offsetY}px)`;
      card.domElement.style.zIndex = card.positionData.zIndex;
      card.domElement.classList.remove("is-dragging");
      this.resetDragState();
    };
  }

  getDropTarget(fromPoint) {
    // Временное скрытие
    // this.cards.forEach((card) => {
    //   card.domElement.style.pointerEvents = "none";
    // });
    // // this.currentDraggingCard.style.pointerEvents = "none";

    // this.cards.forEach((card) => {
    //   card.domElement.style.pointerEvents = "";
    // });
    // this.currentDraggingCard.style.pointerEvents = "";
    const isDraggable = fromPoint.closest(
      `[${GameConfig.dataAttributes.dataAttributeDND}]`
    );

    if (isDraggable === null) return null;
    // Исключаем саму карту и ее дочерние элементы
    return isDraggable === this.currentDraggingCard ||
      this.currentDraggingCard.contains(isDraggable)
      ? null
      : isDraggable;
  }

  isTAndF(fromPoint) {
    // this.cards.forEach((card) => {
    //   card.domElement.style.pointerEvents = "none";
    // });
    // this.cards.forEach((card) => {
    //   card.domElement.style.pointerEvents = "";
    // });
    const isDraggable = fromPoint.closest(
      `[${GameConfig.dataAttributes.getFAndTContainers}]`
    );
    console.log("isDraggable в isTAndF:", isDraggable);
    if (isDraggable === null) return null;

    return isDraggable;
  }

  helpMove(event, card) {
    const x = event.clientX - this.offsetX + card.positionData.offsetX;
    const y = event.clientY - this.offsetY + card.positionData.offsetY;

    // Если перемещение больше 5px — считаем это drag’ом
    if (Math.abs(x) > 5 || Math.abs(y) > 5) {
      this.currentDraggingCard.classList.add("is-dragging");
      this.isDragging = true;
      this.currentDraggingCard.style.zIndex = "100";
      this.currentDraggingCard.style.transform = `translate(${x}px, ${y}px)`;
    }
  }

  getGameComponent(source) {
    if (source.startsWith(this.cardContainers.tableau)) {
      const index = parseInt(source.split("-")[1]);
      return this.gameComponents.tableaus[index];
    } else if (source.startsWith(this.cardContainers.foundation)) {
      const index = parseInt(source.split("-")[1]);
      return this.gameComponents.foundations[index];
    } else if (source.startsWith(this.cardContainers.waste))
      return this.gameComponents.waste;
    else if (source.startsWith(this.cardContainers.stock)) return null;
  }

  isCanAccept(card, source, containerTo) {
    console.log("card:", card);
    if (source.startsWith(this.cardContainers.tableau)) {
      console.log("в if tableau");

      return containerTo.canAccept(card);
    } else if (source.startsWith(this.cardContainers.foundation))
      return containerTo.canAccept(card, this.gameComponents);
    return false;
  }

  // Новый метод для сброса состояния
  resetDragState() {
    this.currentDraggingCard = null;
    this.isDragging = false;
    this.offsetX = null;
    this.offsetY = null;
  }

  parseTargetId(targetId) {
    console.log("targetId");

    const [type, index] = targetId.split("-");
    return [type, parseInt(index)];
  }

  getCards(source, gameComponents) {
    console.log("source:", source);

    // let cardElement = [];
    if (source.startsWith(this.cardContainers.tableau)) {
      const index = parseInt(source.split("-")[1]);
      gameComponents.tableaus[index].cards.forEach((card) => {
        if (card.domElement === this.currentDraggingCard) {
          this.cards = gameComponents.tableaus[index].getTopCards(card);
        }
      });
      return this.cards;
    } else if (source.startsWith(this.cardContainers.foundation)) {
      const index = parseInt(source.split("-")[1]);
      gameComponents.foundations[index].cards.forEach((card) => {
        if (card.domElement === this.currentDraggingCard) {
          this.cards = [card];
        }
      });
      return this.cards;
    } else if (source.startsWith(this.cardContainers.waste)) {
      const card = gameComponents.waste.getTopCard();

      //   gameComponents.waste.cards.forEach((card) => {
      if (card.domElement === this.currentDraggingCard) {
        this.cards = [card];
      }
      //   });
      return this.cards;
    }
    // return cardElement;
  }

  moveFunction({ targetSource, containerTo, containerToName }) {
    this.eventManager.emit(GameEvents.UP_LAST_MOVE, {
      card: this.cards[0],
      from: this.currentDraggingCardSource,
      to: targetSource,
    });

    this.cards = this.movementSystem.removeCardFromSource(
      this.cards[0],
      this.currentDraggingCardSource,
      this.getGameComponent(this.currentDraggingCardSource)
    );
    this.cards.forEach((card) => {
      containerTo.addCard(card);
      containerTo.element.append(card.domElement);
      this.eventManager.emit(
        GameEvents.SET_CARD_DATA_ATTRIBUTE,
        card.domElement,
        GameConfig.dataAttributes.cardParent,
        card.positionData.parent
      );
      this.eventManager.emit(
        GameEvents.SET_CARD_DATA_ATTRIBUTE,
        card.domElement,
        GameConfig.dataAttributes.cardDnd
      );
      this.animateTo(card);
      if (
        containerToName === GameConfig.cardContainers.foundation ||
        this.currentDraggingCardSource.startsWith(
          GameConfig.cardContainers.foundation
        )
      ) {
        const score = GameConfig.rules.scoreForFoundation;
        let operator = "";
        if (containerToName === GameConfig.cardContainers.foundation)
          operator = this.addition;
        else if (
          this.currentDraggingCardSource.startsWith(
            GameConfig.cardContainers.foundation
          )
        )
          operator = this.subtraction;

        Animator.showPointsAnimation(card, score, operator);

        if (containerToName === GameConfig.cardContainers.foundation)
          this.scoringSystem.addPoints(score);
        else if (
          this.currentDraggingCardSource.startsWith(
            GameConfig.cardContainers.foundation
          )
        )
          this.scoringSystem.addPoints(-score);
      }

      if (
        this.state.cardsComponents.foundations.every((f) =>
          f.isComplete()
        )
      ) {
        this.eventManager.on(GameEvents.HANDLE_WIN);
      }

      const openCard = this.movementSystem.openNextCardIfNeeded(
        this.currentDraggingCardSource
      );

      card.openCard = openCard;
      if (openCard) {
        const score = GameConfig.rules.scoreForCardFlip;
        new Promise((resolve) => {
          setTimeout(() => {
            this.eventManager.emit(
              GameEvents.UI_ANIMATION_POINTS_EARNED,
              openCard,
              score,
              this.addition
            );
            console.log("SCORE:", score);
            this.scoringSystem.addPoints(score);
            this.eventManager.emit(
              GameEvents.SET_CARD_DATA_ATTRIBUTE,
              openCard.domElement,
              GameConfig.dataAttributes.cardParent,
              openCard.positionData.parent
            );
            this.eventManager.emit(
              GameEvents.SET_CARD_DATA_ATTRIBUTE,
              openCard.domElement,
              GameConfig.dataAttributes.cardDnd
            );
            this.eventManager.emit(GameEvents.IS_FACE_DOWN_CARD, openCard);
          }, UIConfig.animations.cardFlipDuration * 1000);
          resolve();
        });
      }
    });
    this.stateManager.updateMoves(this.numberMoves);
    this.eventManager.emit(GameEvents.UP_MOVES);
    this.resetDragState();
    return;
  }
}
