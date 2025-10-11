import { CardSuits, CardValues } from "./Constants.js";

export class Helpers {
  static shuffleArray(array) {
    // Оптимизированный алгоритм Фишера-Йетса
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  static formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  static debounce(func, wait, immediate = false) {
    let timeout;
    return function () {
      const context = this,
        args = arguments;
      const later = function () {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  }

  static throttle(func, limit) {
    let lastFunc;
    let lastRan;
    return function () {
      const context = this;
      const args = arguments;
      if (!lastRan) {
        func.apply(context, args);
        lastRan = Date.now();
      } else {
        clearTimeout(lastFunc);
        lastFunc = setTimeout(function () {
          if (Date.now() - lastRan >= limit) {
            func.apply(context, args);
            lastRan = Date.now();
          }
        }, limit - (Date.now() - lastRan));
      }
    };
  }

  static deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  static getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }

  static capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  static sanitizeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  static calculatePosition(suit, value, element, manyColumns = 13, manyLines = 4) {
    const suitIndex = [
      CardSuits.HEARTS,
      CardSuits.DIAMONDS,
      CardSuits.CLUBS,
      CardSuits.SPADES,
    ].indexOf(suit);
    const valueIndex = CardValues.indexOf(value);
    console.log("suitIndex, valueIndex:", suitIndex, valueIndex, suit, value);

    const x = (100 / (manyColumns - 1)) * valueIndex;
    const y = (100 / (manyLines - 1)) * suitIndex;

    return { x, y };
  }
}
