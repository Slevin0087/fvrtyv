import { UIVegasMode } from "../../ui/UIGameModes/UIVegasMode.js";
import {
  GameModesIds,
  GameModesConfigs,
} from "../../configs/GameModesConfogs.js";
import { GameEvents } from "../../utils/Constants.js";

export class VegasModeSystem {
  constructor(eventManager, stateManager) {
    this.eventManager = eventManager;
    this.stateManager = stateManager;
    this.id = GameModesIds.TIMED;
    this.state = GameModesConfigs.VEGAS;
    this.rules = this.state.rules;
    this.scoring = this.state.scoring;
    this.initComponents();
    this.setupEventListeners()
  }

  setupEventListeners() {
    this.eventManager.on(GameEvents.CHOICE_VEGAS_MODE, () => {
      this.ui.showInfo()
    })
  }

  initComponents() {
    this.ui = new UIVegasMode();
  }
}
