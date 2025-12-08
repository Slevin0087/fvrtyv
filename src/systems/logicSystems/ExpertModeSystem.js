import { GameModesIds, GameModesConfigs } from "../../configs/GameModesConfogs.js";
import { UIExpertMode } from "../../ui/UIGameModes/UIExpertMode.js"

export class ExpertModeSystem {
  constructor(eventManager, stateManager) {
    this.eventManager = eventManager;
    this.stateManager = stateManager;
    this.id = GameModesIds.EXPERT;
    this.state = GameModesConfigs[this.id];
    this.rules = this.state.rules;
    this.scoring = this.state.scoring;
    this.initComponents();
  }

  initComponents() {
    this.ui = new UIExpertMode();
  }
}