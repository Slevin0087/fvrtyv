export class UITimedMode {
  constructor() {
    /////////// UI /////////////
    this.comboTimeout = null;
  }

  createComboContainer() {
    const comboElement = document.createElement("div");
    comboElement.id = "combo-container";
    comboElement.className = "combo-container";
    return comboElement;
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
    if (comboCount === 1) comboElement.style.color = "#4CAF50";
    else if (comboCount === 2) comboElement.style.color = "#2196F3";
    else if (comboCount === 3) comboElement.style.color = "#9C27B0";
    else comboElement.style.color = "#FF9800";
  }

  startComboTimer(maxComboTime, comboContainer, comboTimerElement) {
    clearTimeout(this.comboTimeout);

    // Показываем прогресс-бар до сброса комбо
    // let timeLeft = 1500; // 1.5 секунды
    const startTime = Date.now();

    const updateTimer = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.max(0, maxComboTime - elapsed);

      // Прогресс-бар
      const percent = (progress / maxComboTime) * 100;
      comboTimerElement.style.width = `${percent}%`;

      if (progress > 0) {
        requestAnimationFrame(updateTimer);
      } else {
        // Комбо сброшено по таймауту
        // this.comboElement.style.display = "none";
        comboContainer.remove();
      }
    };

    updateTimer();

    // На всякий случай timeout
    this.comboTimeout = setTimeout(() => {
      comboContainer.remove();
    }, maxComboTime);
  }

  comboShow(fastMovesCount, maxComboTime) {
    const body = document.querySelector("body");
    const comboContainer = this.createComboContainer();
    const comboElement = this.createComboElement();
    const comboTimerElement = this.createComboTimerElement();
    comboContainer.append(comboElement);
    comboContainer.append(comboTimerElement);
    body.append(comboContainer);

    this.updateComboDisplay(comboElement, fastMovesCount);

    // Запускаем таймер до сброса комбо
    this.startComboTimer(maxComboTime, comboContainer, comboTimerElement);
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
