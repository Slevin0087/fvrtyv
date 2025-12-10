import { GameEvents } from "../../utils/Constants.js";

export class UIVegasModeModal {
  constructor(eventManager, stateManager) {
    this.eventManager = eventManager;
    this.stateManager = stateManager;

    this.vegasModal = {
      modal: document.getElementById("vegas-mode-modal"),
      modalClose: document.getElementById("vegas-mode-modal-close"),
      modalCancelBtn: document.getElementById("vegas-mode-modal-cancel-btn"),
      modalConfirmBtn: document.getElementById("vegas-mode-modal-confirm-btn"),
    };
  }

  onClickModalVegasClose() {
    this.eventManager.emit(GameEvents.MODAL_HIDE);
  }

  onClickModalVegasConfirm() {
    console.log('клик по "ПОДТВЕРДИТЬ СТАВКУ"');
  }

  setVegasModalEvents() {
    this.vegasModal.modalClose.onclick = () => {
      this.onClickModalVegasClose();
    };
    this.vegasModal.modalCancelBtn.onclick = () => {
      this.onClickModalVegasClose();
    };
    this.vegasModal.modalConfirmBtn.onclick = () => {
      this.onClickModalVegasConfirm();
    };
  }
}
