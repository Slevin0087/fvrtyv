import { GameInit } from "./core/GameInit.js";
import { windowResize } from "./utils/windowResize.js";

// Запуск приложения после загрузки DOM
document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("contextmenu", (e) => {
    e.preventDefault();
  });
  document.addEventListener("gesturestart", (e) => {
    e.preventDefault();
  });
  windowResize();
  const gameInit = new GameInit();
  gameInit.init();
});
