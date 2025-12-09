export class UIVegasMode {
  constructor() {
    this.modalInfo = document.getElementById("modal-modes-info");
  }

  setupEventListeners() {}

  createModal() {
    const container = document.createElement("div");
    container.className = "modal-modes-info-container";
    container.innerHTML = this.html();
    this.modalInfo.append(container);
  }

  showInfo() {
    this.modalInfo.classList.add("hidden");
    this.createModal();
    this.modalInfo.classList.remove("hidden");
  }

  html() {
    return `    <div class="vegas-mode-modal" id="vegas-mode-modal">
      <div class="vegas-mode-modal-header">
        <div class="vegas-mode-modal-close">
          <span class="vegas-mode-modal-close-span" id="vegas-mode-modal-close"
            >&times;</span
          >
        </div>
        <div class="vegas-mode-modal-title">
          <span class="vegas-mode-modal-title-span"
            >🎰 ВХОД В ВЕГАССКИЙ РЕЖИМ</span
          >
        </div>
      </div>
      <div class="vegas-mode-modal-content" id="vegas-mode-modal-content">
        <p class="p-required">
          Для входа в режим требуется ставка:
        </p>
        <div class="vegas-mode-entry-fee-info">-25 🪙</div>
        <div class="vegas-mode-p-content">
          <p>
            <i class="fas fa-check" style="color: #2ed573"></i> Возврат 1 хусынк
            за каждую собранную карту
          </p>
          <p>
            <i class="fas fa-check" style="color: #2ed573"></i> Победа: +30
            хусынков
          </p>
          <p>
            <i class="fas fa-check" style="color: #2ed573"></i> Идеальная
            победа: +60 хусынков
          </p>
          <p>
            <i class="fas fa-check" style="color: #2ed573"></i> Бонусы за серии
            побед
          </p>
        </div>
        <div
          style="
            background: rgba(255, 215, 0, 0.1);
            padding: 15px;
            border-radius: 10px;
            margin-top: 20px;
          "
        >
          <p class="p-footer-vegas-mode-modal">
            <i class="fas fa-exclamation-triangle"></i> Накопительный счет
            сохраняется между играми!
          </p>
        </div>
      </div>
      <div class="vegas-mode-modal-btns">
        <button
          class="vegas-mode-modal-btn"
          id="vegas-mode-modal-cancel-btn"
        >
          <i class="fas fa-times"></i> ОТМЕНА
        </button>
        <button
          class="vegas-mode-modal-btn"
          id="vegas-mode-modal-confirm-btn"
        >
          <i class="fas fa-check"></i> ПОДТВЕРДИТЬ СТАВКУ
        </button>
      </div>
    </div>`;
  }
}
