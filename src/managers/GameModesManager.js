import {
  GameModesStateNamesKeys,
  GameModesNamesKeys,
  GameModesIds,
  GameModesConfigs,
} from "../configs/GameModesConfogs.js";
import { GameEvents } from "../utils/Constants.js";

export class GameModesManager {
  constructor(eventManager, stateManager, storage) {
    this.eventManager = eventManager;
    this.stateManager = stateManager;
    this.storage = storage;
    this.nameKey = GameModesNamesKeys.CURRENT_MODE;
    this.currentModeName = GameModesIds.CLASSIC;
    this.state = null;
    this.stockDrawCountKey = GameModesStateNamesKeys.STOCK_DRAW_COUNT;
    this.maxRedealsKey = GameModesStateNamesKeys.MAX_REDEALS;
    this.stockDrawCounts = 0;
    this.maxRedealsCounts = 0;
    this.isRedeals = true;
    this.isUpLastMoves = false;
    this.playTime = 0;
    this.initState();
    this.calculateScore("moveToTableau");
    this.setupEventListeners();
  }

  initState() {
    this.initCurrentModeName();
    this.initCurrentModeRules();
    this.initCurrentModeScoring();
    this.initIsUpLastMoves();
    this.initPlayTime();
  }

  setupEventListeners() {
    this.eventManager.on(GameEvents.RESET_MODES_STATE_FOR_NEW_GAME, () => {
      this.resetForGameRestart();
    });
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

  resetForGameRestart() {
    this.initPlayTime();
  }

  resetStatsForGameRestart() {
    this.setCurrentModeName(modeName);
    this.initCurrentModeRules();
    this.initCurrentModeScoring();
    this.initIsUpLastMoves();
    this.initPlayTime();
  }

  setAllDataCurrentMode(modeName) {
    this.setCurrentModeName(modeName);
    this.initCurrentModeRules();
    this.initCurrentModeScoring();
    this.initIsUpLastMoves();
    this.initPlayTime();
    this.saveStorageCurrentModeName(modeName);
  }

  initIsUpLastMoves() {
    const maxUndos = this.getCurrentModeMaxUndos();
    if (maxUndos === Infinity || maxUndos > 0) {
      this.isUpLastMoves = true;
      return;
    } else {
      this.isUpLastMoves = false;
    }
  }

  getIsUpLastMoves() {
    return this.isUpLastMoves;
  }

  getCurrentModeMaxUndos() {
    return this.getCurrentModeRules().maxUndos;
  }

  getCurrentModeTimeLimit() {
    return this.getCurrentModeRules().timeLimit;
  }

  resetIsRedeals(boolean) {
    this.isRedeals = boolean;
  }

  setPlayTime(time) {
    this.playTime = time;
  }

  getPlayTime() {
    return this.playTime;
  }

  initPlayTime() {
    const timeLimit = this.getCurrentModeTimeLimit();
    const resultTime = timeLimit ? timeLimit : 0;
    this.setPlayTime(resultTime);
  }
}
