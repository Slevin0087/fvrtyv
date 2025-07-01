export class EventManager {
  constructor() {
    this.listeners = new Map();
  }

  on(event, callback) {
    // console.log(`${event}: ${callback}`);
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  emit(event, ...args) {
    console.log('event, ...args:', event, ...args);

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

  async emitAsync(event, ...args) {
    console.log('event, ...args:', event, ...args);
    
    const handlers = this.listeners[event];
    if (!handlers) return;

    const promises = [];
    for (const handler of handlers) {
      promises.push(handler(...args));
    }

    await Promise.all(promises);
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
