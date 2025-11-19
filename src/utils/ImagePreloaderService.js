// services/ImagePreloaderService.js
export class ImagePreloaderService {
  constructor() {
    this.loadedImages = new Map();
    this.isPreloaded = false;
    this.cacheKey = 'game-images-cache';
    this.imageVersion = 'v1.2'; // Меняем при обновлении картинок
  }

  async preloadGameImages(selectedItems) {
    // Проверяем, нужно ли предзагружать
    if (this.shouldSkipPreload(selectedItems)) {
      console.log('✅ Пропускаем предзагрузку - картинки уже в кеше браузера');
      this.isPreloaded = true;
      return;
    }

    const imagesToLoad = [
      {
        id: 'cardFaces',
        url: selectedItems.faces.previewImage.img,
        type: 'faces'
      },
      {
        id: 'cardBacks', 
        url: selectedItems.backs.previewImage.img,
        type: 'backs'
      },
      {
        id: 'background',
        url: selectedItems.backgrounds.previewImage || this.getBackgroundUrl(selectedItems.backgrounds.styleClass),
        type: 'background'
      }
    ];

    try {
      console.log('🔄 Начинаем предзагрузку изображений...');
      
      const loadPromises = imagesToLoad.map(({ id, url }) => 
        this.loadImageWithCache(id, url)
      );
      
      await Promise.all(loadPromises);
      this.isPreloaded = true;
      
      // Сохраняем в localStorage факт предзагрузки и версию
      this.savePreloadStatus(selectedItems);
      
      console.log('🎉 Все игровые изображения предзагружены');
    } catch (error) {
      console.error('❌ Ошибка предзагрузки изображений:', error);
    }
  }

  shouldSkipPreload(selectedItems) {
    const cacheData = this.getCacheData();
    
    if (!cacheData) return false;
    
    // Проверяем, совпадают ли выбранные предметы с закешированными
    const isSameSelection = 
      cacheData.facesUrl === selectedItems.faces.previewImage.img &&
      cacheData.backsUrl === selectedItems.backs.previewImage.img &&
      cacheData.backgroundUrl === (selectedItems.backgrounds.previewImage || this.getBackgroundUrl(selectedItems.backgrounds.styleClass));
    
    const isSameVersion = cacheData.version === this.imageVersion;
    
    return isSameSelection && isSameVersion;
  }

  savePreloadStatus(selectedItems) {
    const cacheData = {
      version: this.imageVersion,
      facesUrl: selectedItems.faces.previewImage.img,
      backsUrl: selectedItems.backs.previewImage.img,
      backgroundUrl: selectedItems.backgrounds.previewImage || this.getBackgroundUrl(selectedItems.backgrounds.styleClass),
      timestamp: Date.now()
    };
    
    localStorage.setItem(this.cacheKey, JSON.stringify(cacheData));
  }

  getCacheData() {
    try {
      return JSON.parse(localStorage.getItem(this.cacheKey));
    } catch {
      return null;
    }
  }

  loadImageWithCache(id, url) {
    return new Promise((resolve) => {
      const img = new Image();
      
      img.onload = () => {
        this.loadedImages.set(id, img);
        console.log(`✅ Загружено: ${id}`);
        resolve(img);
      };
      
      img.onerror = () => {
        console.warn(`⚠️ Не удалось предзагрузить: ${id}`);
        resolve(null); // Не блокируем приложение
      };
      
      // Браузер автоматически использует свой кеш
      img.src = `${url}?v=${this.imageVersion}`;
    });
  }

  // При смене картинок в магазине
  clearCache() {
    localStorage.removeItem(this.cacheKey);
    this.loadedImages.clear();
    this.isPreloaded = false;
  }

  // Остальные методы...
}