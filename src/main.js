import { GameInit } from "./core/GameInit.js";
// import { windowResize } from "./utils/windowResize.js";
import { windowResize } from "./systems/uiSystems/WindowResizeHandler.js";

// Запуск приложения после загрузки DOM
document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("contextmenu", (e) => {
    e.preventDefault();
  });
  document.addEventListener("gesturestart", (e) => {
    e.preventDefault();
  });
  windowResize.init();

  // Добавляем слушатель для изменений
  // const handleResize = (dimensions) => {
  //   console.log("Размер окна изменился:", dimensions);
  //   console.log("Ширина:", dimensions.innerWidth);
  //   console.log("Высота:", dimensions.innerHeight);
  //   console.log("Ориентация:", dimensions.orientation);
  // };

  // windowResize.addListener(handleResize);

  // Получить текущие размеры без ожидания события
  const current = windowResize.getDimensions();
  // console.log("Текущие размеры:", current);

  const gameInit = new GameInit();
  gameInit.init();
});
