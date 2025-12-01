import { GameModesIds, GameModesConfigs } from "../configs/GameModesConfogs.js";
import { GameEvents } from "../utils/Constants.js";

export class GameModesManager {
  constructor(eventManager, storage) {
    this.eventManager = eventManager;
    this.storage = storage;
    this.nameKey = "";
    this.currentModeName = "";
    this.state = null;
    this.stockDrawCountKey = "stock-draw-count";
    this.maxRedealsKey = 'max-redeals'
    this.stockDrawCounts = 0;
    this.maxRedealsCounts = 0
    this.isRedeals = true
    this.initState();
    this.calculateScore("moveToTableau");
  }

  initState() {
    this.name = "currentMode";
    this.currentModeName = this.getCurrentModeName() || GameModesIds.CLASSIC;
    this.currentModeRules = GameModesConfigs[this.currentModeName].rules;
    this.currentModeScoring = GameModesConfigs[this.currentModeName].scoring;
  }

  setupEventListeners() {
    this.eventManager.on(G);
  }

  getCurrentModeName() {
    return this.storage.getItem(this.nameKey);
  }

  getCurrentModeName() {
    return this.currentModeName;
  }

  setCurrentModeName(modeName) {
    this.currentModeName = modeName;
  }

  saveCurrentModeName(modeName) {
    this.storage.saveItem(this.nameKey, modeName);
  }

  calculateScore(scoringKey) {
    const mode = GameModesConfigs[this.currentModeName];
    console.log("mode: ", mode);
    const scoring = mode.scoring[scoringKey];
    console.log("scoring: ", scoring);
  }

  getCurrentModeRules() {
    return this.currentModeRules;
  }

  getCurrentModeScoring() {
    return this.currentModeScoring;
  }

  getCurrentModeDrawCount() {
    const currentModeRules = this.getCurrentModeRules();
    return currentModeRules.drawCount;
  }

  getStockDrawCount() {
    return this.stockDrawCounts;
  }

  upStockDrawCount(count = 1) {
    this.stockDrawCounts += count;
    this.storage.saveItem(this.stockDrawCountKey, this.stockDrawCounts);
  }

  getCurrentModeMaxRedeals() {
    const currentModeRules = this.getCurrentModeRules();
    return currentModeRules.maxRedeals;
  }

  getMaxRedealsCounts() {
    return this.maxRedealsCounts
  }

  upMaxRedealsCounts(count = 1) {
    this.maxRedealsCounts += count;
    this.storage.saveItem(this.maxRedealsKey, this.maxRedealsCounts);
  }

  setIsRedeals() {    
    this.isRedeals = this.getMaxRedealsCounts() < this.getCurrentModeRules().maxRedeals
  }

  getIsRedeals() {
    return this.isRedeals
  }
}
