import { GameManager } from "./managers/GameManager.js";

// Запуск приложения после загрузки DOM
document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("contextmenu", function (e) {
    e.preventDefault();
  });
  const gameManager = new GameManager();
  gameManager.startApp();
});
