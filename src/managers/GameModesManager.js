export class GameModesManager {
  constructor(eventManager, storage) {
    this.eventManager = eventManager;
    this.storage = storage;
    this.currentMode = "CLASSIC";
    this.state = null;
  }
}
