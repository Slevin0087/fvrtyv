// export class ShopNavigation {
//   constructor() {
//     this.navigationContainer = document.getElementById("shop-navigation");
//     this.allItemsContainer = document.getElementById("all-items-container");
//     // this.allItemsContainer = document.getElementById('shop-all-items-container')
//     this.scrollLeftBtn = document.getElementById("scroll-left-btn");
//     this.scrollRightBtn = document.getElementById("scroll-right-btn");
//     this.scrollStep = 0;
//     console.log("this.width: ", this.width);

//     this.init();
//   }

//   init() {
//     // Назначаем обработчики событий
//     this.scrollLeftBtn.addEventListener("click", () => this.scrollLeft());
//     this.scrollRightBtn.addEventListener("click", () => this.scrollRight());

//     // Обновляем видимость кнопок при скролле
//     this.allItemsContainer.addEventListener("scroll", () =>
//       this.updateButtonVisibility()
//     );

//     // Инициализируем видимость кнопок
//     this.updateButtonVisibility();
//   }

//   scrollLeft() {
//     this.allItemsContainer.scrollBy({
//       left: -this.scrollStep,
//       behavior: "smooth",
//     });
//   }

//   scrollRight() {
//     this.allItemsContainer.scrollBy({
//       left: this.scrollStep,
//       behavior: "smooth",
//     });
//   }

//   updateButtonVisibility() {
//     const scrollLeft = this.allItemsContainer.scrollLeft;
//     const scrollWidth = this.allItemsContainer.scrollWidth;
//     const clientWidth = this.allItemsContainer.clientWidth;

//     // Показываем/скрываем кнопку "влево"
//     this.scrollLeftBtn.style.visibility = scrollLeft > 0 ? "visible" : "hidden";

//     // Показываем/скрываем кнопку "вправо"
//     this.scrollRightBtn.style.visibility =
//       scrollLeft + clientWidth < scrollWidth ? "visible" : "hidden";
//   }

//   // Дополнительные методы для клавиатуры
//   handleKeydown(event) {
//     if (event.key === "ArrowLeft") {
//       this.scrollLeft();
//     } else if (event.key === "ArrowRight") {
//       this.scrollRight();
//     }
//   }

//   setScrollBtnsHidden() {
//     this.scrollLeftBtn.style.visibility = "hidden";
//     this.scrollRightBtn.style.visibility = "hidden";
//   }

//   setNavigationWidth(width) {
//     this.navigationContainer.style.width = `${width}px`;
//   }

//   setScrollStep(step) {
//     this.scrollStep = step
//   }
// }

// export class ShopNavigation {
//   constructor() {
//     this.navigationContainer = document.getElementById("shop-navigation");
//     this.allItemsContainer = document.getElementById("all-items-container");
//     // this.allItemsContainer = document.getElementById('shop-all-items-container')
//     this.scrollLeftBtn = document.getElementById("scroll-left-btn");
//     this.scrollRightBtn = document.getElementById("scroll-right-btn");
//     this.scrollStep = 0;
//     console.log("this.width: ", this.width);

//     this.init();
//   }

//   init() {
//     // Назначаем обработчики событий
//     this.scrollLeftBtn.addEventListener("click", () => this.scrollLeft());
//     this.scrollRightBtn.addEventListener("click", () => this.scrollRight());

//     // Обновляем видимость кнопок при скролле
//     this.allItemsContainer.addEventListener("scroll", () =>
//       this.updateButtonVisibility()
//     );

//     // Инициализируем видимость кнопок
//     this.updateButtonVisibility();
//   }

//   scrollLeft() {
//     this.allItemsContainer.scrollBy({
//       left: -this.scrollStep,
//       behavior: "smooth",
//     });
//   }

//   scrollRight() {
//     this.allItemsContainer.scrollBy({
//       left: this.scrollStep,
//       behavior: "smooth",
//     });
//   }

//   updateButtonVisibility() {
//     const scrollLeft = this.allItemsContainer.scrollLeft;
//     const scrollWidth = this.allItemsContainer.scrollWidth;
//     const clientWidth = this.allItemsContainer.clientWidth;

//     // Показываем/скрываем кнопку "влево"
//     this.scrollLeftBtn.style.visibility = scrollLeft > 0 ? "visible" : "hidden";

//     // Показываем/скрываем кнопку "вправо"
//     this.scrollRightBtn.style.visibility =
//       scrollLeft + clientWidth < scrollWidth ? "visible" : "hidden";
//   }

//   // Дополнительные методы для клавиатуры
//   handleKeydown(event) {
//     if (event.key === "ArrowLeft") {
//       this.scrollLeft();
//     } else if (event.key === "ArrowRight") {
//       this.scrollRight();
//     }
//   }

//   setScrollBtnsHidden() {
//     this.scrollLeftBtn.style.visibility = "hidden";
//     this.scrollRightBtn.style.visibility = "hidden";
//   }

//   setNavigationWidth(width) {
//     this.navigationContainer.style.width = `${width}px`;
//   }

//   setScrollStep(step) {
//     this.scrollStep = step
//   }
// }

export class ShopNavigation {
  constructor() {
    this.navigationContainer = document.getElementById("shop-navigation");
    this.allItemsContainer = document.getElementById("all-items-container");
    this.scrollLeftBtn = document.getElementById("scroll-left-btn");
    this.scrollRightBtn = document.getElementById("scroll-right-btn");
    this.scrollStep = 0;

    // Переменные для улучшенного свайпа
    this.isSwiping = false;
    this.startX = 0;
    this.currentX = 0;
    this.scrollLeftStart = 0;
    this.swipeMultiplier = 2; // множитель для чувствительности свайпа

    console.log("this.width: ", this.width);
    this.init();
  }

  init() {
    // Назначаем обработчики событий для кнопок
    this.scrollLeftBtn.addEventListener("click", () => this.scrollLeft());
    this.scrollRightBtn.addEventListener("click", () => this.scrollRight());

    // Обновляем видимость кнопок при скролле
    this.allItemsContainer.addEventListener("scroll", () =>
      this.updateButtonVisibility()
    );

    // Добавляем обработчики свайпа
    // this.addEnhancedSwipeListeners();

    // Инициализируем видимость кнопок
    // this.updateButtonVisibility();
  }

  // Улучшенные обработчики свайпа
  addEnhancedSwipeListeners() {
    this.allItemsContainer.addEventListener(
      "touchstart",
      this.handleTouchStart.bind(this),
      { passive: false }
    );
    this.allItemsContainer.addEventListener(
      "touchmove",
      this.handleTouchMove.bind(this),
      { passive: false }
    );
    this.allItemsContainer.addEventListener(
      "touchend",
      this.handleTouchEnd.bind(this),
      { passive: true }
    );
  }

  handleTouchStart(e) {
    this.isSwiping = true;
    this.startX = e.touches[0].pageX;
    this.scrollLeftStart = this.allItemsContainer.scrollLeft;
    e.preventDefault();
  }

  handleTouchMove(e) {
    if (!this.isSwiping) return;

    e.preventDefault();
    this.currentX = e.touches[0].pageX;
    const walk = (this.currentX - this.startX) * this.swipeMultiplier;

    // Временно скрываем кнопки во время свайпа
    this.scrollLeftBtn.style.visibility = "hidden";
    this.scrollRightBtn.style.visibility = "hidden";

    this.allItemsContainer.scrollLeft = this.scrollLeftStart - walk;
  }

  handleTouchEnd() {
    this.isSwiping = false;

    // Показываем кнопки снова после небольшой задержки
    setTimeout(() => {
      this.updateButtonVisibility();
    }, 100);
  }

  scrollLeft() {
    this.allItemsContainer.scrollBy({
      left: -this.scrollStep,
      behavior: "smooth",
    });
  }

  scrollRight() {
    this.allItemsContainer.scrollBy({
      left: this.scrollStep,
      behavior: "smooth",
    });
  }

  updateButtonVisibility() {
    const scrollLeft = this.allItemsContainer.scrollLeft;
    const scrollWidth = this.allItemsContainer.scrollWidth;
    const clientWidth = this.allItemsContainer.clientWidth;

    // Показываем/скрываем кнопку "влево"
    this.scrollLeftBtn.style.visibility = scrollLeft > 0 ? "visible" : "hidden";

    // Показываем/скрываем кнопку "вправо"
    this.scrollRightBtn.style.visibility =
      scrollLeft + clientWidth < scrollWidth ? "visible" : "hidden";
  }

  // Дополнительные методы для клавиатуры
  handleKeydown(event) {
    if (event.key === "ArrowLeft") {
      this.scrollLeft();
    } else if (event.key === "ArrowRight") {
      this.scrollRight();
    }
  }

  setScrollBtnsHidden() {
    this.scrollLeftBtn.style.visibility = "hidden";
    this.scrollRightBtn.style.visibility = "hidden";
  }

  setNavigationWidth(width) {
    this.navigationContainer.style.width = `${width}px`;
  }

  setScrollStep(step) {
    console.log("step: ", step);
    this.scrollStep = step;
  }

  // Опционально: метод для настройки чувствительности свайпа
  setSwipeSensitivity(multiplier) {
    this.swipeMultiplier = multiplier;
  }

  // Опционально: уничтожение listeners при необходимости
  destroy() {
    this.scrollLeftBtn.removeEventListener("click", this.scrollLeft);
    this.scrollRightBtn.removeEventListener("click", this.scrollRight);
    this.allItemsContainer.removeEventListener(
      "scroll",
      this.updateButtonVisibility
    );

    // Удаляем свайп listeners
    this.allItemsContainer.removeEventListener(
      "touchstart",
      this.handleTouchStart
    );
    this.allItemsContainer.removeEventListener(
      "touchmove",
      this.handleTouchMove
    );
    this.allItemsContainer.removeEventListener("touchend", this.handleTouchEnd);
  }
}
