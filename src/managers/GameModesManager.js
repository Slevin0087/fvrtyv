import {
  GameModesStateNamesKeys,
  GameModesNamesKeys,
  GameModesIds,
  GameModesConfigs,
} from "../configs/GameModesConfogs.js";
import { GameEvents } from "../utils/Constants.js";

export class GameModesManager {
  constructor(eventManager, storage) {
    this.eventManager = eventManager;
    this.storage = storage;
    this.nameKey = GameModesNamesKeys.CURRENT_MODE;
    this.currentModeName = GameModesIds.CLASSIC;
    this.state = null;
    this.stockDrawCountKey = GameModesStateNamesKeys.STOCK_DRAW_COUNT;
    this.maxRedealsKey = GameModesStateNamesKeys.MAX_REDEALS;
    this.stockDrawCounts = 0;
    this.maxRedealsCounts = 0;
    this.isRedeals = true;
    this.initState();
    this.calculateScore("moveToTableau");
  }

  initState() {
    this.initCurrentModeName();
    this.initCurrentModeRules();
    this.initCurrentModeScoring();
  }

  setupEventListeners() {
  }

  initCurrentModeName() {
    this.currentModeName =
      this.getStorageCurrentModeName() ?? this.currentModeName;
  }

  getStorageCurrentModeName() {
    return this.storage.getItem(this.nameKey);
  }

  getCurrentModeName() {
    return this.currentModeName;
  }

  setCurrentModeName(modeName) {
    this.currentModeName = modeName;
  }

  saveStorageCurrentModeName(modeName) {
    this.storage.saveItem(this.nameKey, modeName);
  }

  initCurrentModeRules() {
    this.currentModeRules = GameModesConfigs[this.currentModeName].rules;
  }

  initCurrentModeScoring() {
    this.currentModeScoring = GameModesConfigs[this.currentModeName].scoring;
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
    return this.maxRedealsCounts;
  }

  upMaxRedealsCounts(count = 1) {
    this.maxRedealsCounts += count;
    this.storage.saveItem(this.maxRedealsKey, this.maxRedealsCounts);
  }

  setIsRedeals() {
    this.isRedeals =
      this.getMaxRedealsCounts() < this.getCurrentModeRules().maxRedeals;
  }

  getIsRedeals() {
    return this.isRedeals;
  }

  calculateScore(scoringKey) {
    const mode = GameModesConfigs[this.currentModeName];
    const scoring = mode.scoring[scoringKey];
    return scoring;
  }

  calculateScoreToFoundationMove() {
    const mode = GameModesConfigs[this.currentModeName];
  }

  calculateCoins() {
    const mode = GameModesConfigs[this.currentModeName];
  }

  calculateWinCoins() {
    const mode = GameModesConfigs[this.currentModeName];
  }

  setAllDataCurrentMode(modeName) {
    this.setCurrentModeName(modeName)
    this.initCurrentModeRules()
    this.initCurrentModeScoring()
    this.saveStorageCurrentModeName(modeName)
  }
}
