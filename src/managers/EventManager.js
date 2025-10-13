export class EventManager {
  constructor() {
    this.listeners = new Map();
    this.asyncListeners = new Map();
  }

  // Синхронная подписка
  on(event, callback) {
    console.log(`${event}: ${callback}`);
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  // Синхронный вызов событий
  emit(event, ...args) {
    console.log("event, ...args:", event, ...args);

    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((callback) => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }

  // Асинхронная подписка
  onAsync(event, callback) {
    if (!this.asyncListeners.has(event)) {
      this.asyncListeners.set(event, []);
    }
    this.asyncListeners.get(event).push(callback);
  }

  // Асинхронный вызов событий
  async emitAsync(event, ...args) {
    const asyncCallbacks = [];
    if (this.asyncListeners.has(event)) {
      asyncCallbacks.push(...this.asyncListeners.get(event));
    }
    const promises = asyncCallbacks.map(async (callback) => {
      try {
        return await callback(...args);
      } catch (error) {
        console.error(`Error in async handler for ${event}:`, error);
        throw error;
      }
    });
    return await Promise.allSettled(promises);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners
        .get(event)
        .filter((cb) => cb !== callback);
      this.listeners.set(event, callbacks);
    }
  }

  // Очистка всех подписок
  clear() {
    this.events.clear();
    this.onceCallbacks.clear();
  }
}
