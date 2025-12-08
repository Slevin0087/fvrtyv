import { UIVegasMode } from "../../ui/UIGameModes/UIVegasMode";
import { GameModesConfigs } from "../../configs/GameModesConfogs";

export class VegasModeSystem {
  constructor() {
    this.state = GameModesConfigs.VEGAS
    this.initComponents();
  }

  initComponents() {
    this.ui = new UIVegasMode();
  }
}
