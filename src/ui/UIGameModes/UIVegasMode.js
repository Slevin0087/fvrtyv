import { GameEvents } from "../../utils/Constants.js";
import { UIVegasModeModal } from "../UIModals/UIVegasModeModal.js";

export class UIVegasMode {
  constructor(eventManager, stateManager) {
    this.eventManager = eventManager;
    this.stateManager = stateManager;

    this.uiModal = new UIVegasModeModal(this.eventManager, this.stateManager);
  }

  setupEventListeners() {}

  showModal() {
    const modal = this.uiModal.vegasModal.modal;
    const handleModalClose = () => this.uiModal.onClickModalVegasClose()
    this.eventManager.emit(GameEvents.MODAL_SHOW, modal);
    this.uiModal.setVegasModalEvents();
    this.stateManager.setActiveModal(modal, handleModalClose);
  }
}
