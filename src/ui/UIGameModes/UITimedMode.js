export class UITimedMode {
  constructor() {
    /////////// UI /////////////
    this.comboContainer = document.getElementById("combo-container");
    this.comboElement = null;
    // this.comboTimerElement = null;
    this.comboTimeout = null;
  }

  createComboElement() {
    const comboElement = document.createElement("div");
    comboElement.id = "combo-counter";
    comboElement.className = "combo-counter";
    return comboElement;
  }

  createComboTimerElement() {
    const comboTimerElement = document.createElement("div");
    comboTimerElement.id = "combo-timer";
    comboTimerElement.className = "combo-timer";
    return comboTimerElement;
  }

  /////////////////////////////////////////////// UI ///////////////////////////////////
  updateComboDisplay(comboElement, comboCount) {
    comboElement.textContent = `COMBO x${comboCount}`;

    // Цвета в зависимости от комбо
    if (comboCount === 1) comboElement.style.color = "#4caf50ff";
    else if (comboCount === 2) comboElement.style.color = "#2196F3";
    else if (comboCount === 3) comboElement.style.color = "#9C27B0";
    else comboElement.style.color = "#FF9800";
  }

  startComboTimer(maxComboTime, comboContainer, comboTimerElement) {
    clearTimeout(this.comboTimeout);

    // Показываем прогресс-бар до сброса комбо
    const startTime = Date.now();

    const updateTimer = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.max(0, maxComboTime - elapsed);

      // Прогресс-бар
      const percent = (progress / maxComboTime) * 100;
      comboTimerElement.style.width = `${percent}%`;

      if (progress > 0) {
        requestAnimationFrame(updateTimer);
      }
    //   else {
    //     comboContainer.classList.add("hidden");
    //     comboContainer.innerHTML = "";
    //   }
    };

    updateTimer();

    // На всякий случай timeout
    this.comboTimeout = setTimeout(() => {
      comboContainer.classList.add("hidden");
      comboContainer.innerHTML = "";
    }, maxComboTime);
  }

  comboShow(fastMovesCount, maxComboTime) {
    if (this.comboContainer) this.comboContainer.innerHTML = '';
    const comboElement = this.createComboElement();
    const comboTimerElement = this.createComboTimerElement();
    this.comboContainer.append(comboElement);
    this.comboContainer.append(comboTimerElement);
    this.comboContainer.classList.remove("hidden");
    this.updateComboDisplay(comboElement, fastMovesCount);

    // Запускаем таймер до сброса комбо
    this.startComboTimer(maxComboTime, this.comboContainer, comboTimerElement);
  }

  applyComboEffects(comboCount) {
    // Визуальные эффекты
    if (comboCount >= 3) {
      // Легкая тряска экрана
      document.body.style.animation = "shake 0.1s 2";

      // Свечение карт
      document.querySelectorAll(".card").forEach((card) => {
        card.style.boxShadow = "0 0 10px gold";
      });

      setTimeout(() => {
        document.body.style.animation = "";
        document.querySelectorAll(".card").forEach((card) => {
          card.style.boxShadow = "";
        });
      }, 300);
    }

    if (comboCount >= 5) {
      // Эффект "взрыва" при супер-комбо
      const particles = this.createParticles();
      setTimeout(() => particles.remove(), 1000);
    }
  }

  ///////////////////////////////////////////////////////////////////////
}
