export class ShopNavigation {
  constructor() {
    this.navigationContainer = document.getElementById("shop-navigation");
    this.allItemsContainer = document.getElementById("all-items-container");
    // this.allItemsContainer = document.getElementById('shop-all-items-container')
    this.scrollLeftBtn = document.getElementById("scroll-left-btn");
    this.scrollRightBtn = document.getElementById("scroll-right-btn");
    this.scrollStep = 0;
    console.log("this.width: ", this.width);

    this.init();
  }

  init() {
    // Назначаем обработчики событий
    this.scrollLeftBtn.addEventListener("click", () => this.scrollLeft());
    this.scrollRightBtn.addEventListener("click", () => this.scrollRight());

    // Обновляем видимость кнопок при скролле
    this.allItemsContainer.addEventListener("scroll", () =>
      this.updateButtonVisibility()
    );

    // Инициализируем видимость кнопок
    this.updateButtonVisibility();
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
    console.log('step: ', step);
    
    this.scrollStep = step
  }
}
