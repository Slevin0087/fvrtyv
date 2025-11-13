class CardsAndContainersScaler {
  constructor() {
    this.minCardSize = 8;  // минимальный размер в vmin
    this.maxCardSize = 15; // максимальный размер в vmin
    this.init();
  }
  
  init() {
    this.setupResizeHandler();
    this.updateScaling();
  }
  
  setupResizeHandler() {
    let resizeTimeout;
    const handleResize = () => {
        console.log('в handleResize');
        
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => this.updateScaling(), 100);
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
  }
  
  updateScaling() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspectRatio = width / height;
    
    let cardSize;
    
    if (aspectRatio > 1.5) {
      // Широкие экраны - ограничиваем по высоте
      cardSize = (height * 0.7) / (1.4 * 2 + 0.5);
    } else if (aspectRatio < 0.7) {
      // Высокие/узкие экраны - ограничиваем по ширине  
      cardSize = (width * 0.9) / 7;
    } else {
      // Нормальные пропорции - используем vmin логику
      cardSize = Math.min(width, height) * 0.12;
    }
    
    // Конвертируем в vmin и ограничиваем
    const vminSize = (cardSize / Math.min(width, height)) * 100;
    const clampedSize = Math.max(this.minCardSize, Math.min(this.maxCardSize, vminSize));
    
    document.documentElement.style.setProperty('--card-width', `${clampedSize}vmin`);
  }
}

// Инициализация
// new CardsAndContainersScaler();

export default CardsAndContainersScaler