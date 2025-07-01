import { Animator } from "../utils/Animator.js";

export class UINotificationPage {
  constructor(eventManager) {
    this.events = eventManager;
    this.page = document.getElementById("notification-toast");
    this.notificationQueue = [];
    this.isShowing = false;

    this.init();
  }

  init() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    // this.events.on("ui:notification", (message, type = "info") => {
    //   this.addToQueue(message, type);
    // });

    this.events.on("achievement:unlocked", (achievement) => {
      this.showAchievementNotification(achievement);
    });
  }

  addToQueue(message, type) {
    console.log('В addToQueue');
    
    this.notificationQueue.push({ message, type });
    this.processQueue();
  }

  processQueue() {
    console.log('в processQueue this.isShowing:', this.isShowing);
    
    if (this.isShowing || this.notificationQueue.length === 0) return;

    const { message, type } = this.notificationQueue.shift();
    this.showNotification(message, type);
  }

  showNotification(message, type) {
    console.log('в showNotification:', message, type);
    
    this.isShowing = true;
    this.page.textContent = message;
    this.page.className = `toast ${type}`;
    this.page.classList.remove("hidden");

    // Animator.fadeIn(this.page).then(() => {
    //   setTimeout(() => {
    //     Animator.fadeOut(this.page).then(() => {
    //       this.page.classList.add("hidden");
    //       this.isShowing = false;
    //       this.processQueue();
    //     });
    //   }, 3000);
    // });
  }

  showAchievementNotification(achievement) {
    const html = `
            <div class="achievement-notification">
                <h3>Достижение разблокировано!</h3>
                <p><strong>${achievement.title}</strong></p>
                <p>${achievement.description}</p>
                ${
                  achievement.reward
                    ? `<p class="reward">+${achievement.reward} монет</p>`
                    : ""
                }
            </div>
        `;

    this.page.innerHTML = html;
    this.page.className = "toast achievement";
    this.page.classList.remove("hidden");

    Animator.fadeIn(this.page).then(() => {
      setTimeout(() => {
        Animator.fadeOut(this.page).then(() => {
          this.page.classList.add("hidden");
        });
      }, 5000);
    });
  }
}
