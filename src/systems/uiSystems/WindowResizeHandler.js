class WindowResizeHandler {
  constructor() {
    this.listeners = [];
    this.isInitialized = false;
    this.debounceTimeout = null;
    this.debounceDelay = 250;

    // Привязываем контекст один раз и сохраняем ссылку
    this.boundHandleResize = this.handleResize.bind(this);
    this.lastDimensions = null;
    this.hasTriggered = false; // Флаг: был ли уже triggerResize()
  }

  init() {
    if (this.isInitialized) return;

    // Используем сохраненную функцию
    window.addEventListener("resize", this.boundHandleResize);
    this.isInitialized = true;

    // Сразу получаем начальные размеры
    this.triggerResize();
  }

  handleResize() {
    // Debounce для оптимизации
    clearTimeout(this.debounceTimeout);
    this.debounceTimeout = setTimeout(() => {
      this.triggerResize();
    }, this.debounceDelay);
  }

  triggerResize() {
    this.lastDimensions = this.getDimensions();
    this.hasTriggered = true;

    // Оповещаем всех слушателей
    this.listeners.forEach((listener) => {
      if (typeof listener === "function") {
        listener(this.lastDimensions);
      }
    });
  }

  getDimensions() {
    return {
      //
      locationbar: window.locationbar,
      //
      isMobileDevice: this.isMobileDevice(),
      //
      visualViewport: window.visualViewport,
      // Размеры окна просмотра
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,

      // Размеры окна браузера
      outerWidth: window.outerWidth,
      outerHeight: window.outerHeight,

      // Размеры экрана устройства
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,

      // Доступные размеры (без панели задач и т.д.)
      availableWidth: window.screen.availWidth,
      availableHeight: window.screen.availHeight,

      // Pixel ratio
      pixelRatio: window.devicePixelRatio,

      // Ориентация
      orientation:
        window.screen.orientation?.type ||
        (window.innerHeight > window.innerWidth ? "portrait" : "landscape"),

      // Текущее время
      timestamp: Date.now(),
    };
  }

  addListener(callback, immediate = true) {
    if (typeof callback !== "function") return this;

    this.listeners.push(callback);

    // Если система уже срабатывала и immediate = true
    if (immediate && this.lastDimensions) {
      // Используем микротаск (Promise) для асинхронного вызова
      Promise.resolve().then(() => {
        callback(this.lastDimensions);
      });
    }

    return this;
  }

  removeListener(callback) {
    const index = this.listeners.indexOf(callback);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
    return this; // Для чейнинга
  }

  destroy() {
    // Очищаем таймаут
    clearTimeout(this.debounceTimeout);

    // Удаляем обработчик, используя сохраненную функцию
    window.removeEventListener("resize", this.boundHandleResize);

    this.listeners = [];
    this.isInitialized = false;
  }

  isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }
}

// Создаем singleton экземпляр
const windowResize = new WindowResizeHandler();

export { windowResize };
