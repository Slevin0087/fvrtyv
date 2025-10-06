import { GameInit } from "./core/GameInit.js";

// Запуск приложения после загрузки DOM
document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("contextmenu", function (e) {
    e.preventDefault();
  });
  const gameInit = new GameInit();
  gameInit.init();
});
