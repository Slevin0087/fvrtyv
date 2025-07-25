import { Translations } from "../locales/Translations.js";

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

  static #currentLang = "ru"; // Приватное поле для текущего языка
  static #availableLangs = ["ru", "en", "abaza", "tr"]; // Поддерживаемые языки
  static #translations = Translations; // Импортированный объект переводов

  // Инициализация языка (вызывается при старте игры)
  // static initLanguage(ysdk) {
  //   this.#currentLang =
  //     ysdk?.environment?.i18n?.lang || navigator.language.slice(0, 2) || "ru";
  // }

  static initLanguage(ysdk) {
    // Приоритеты: 1) сохраненный выбор, 2) язык Яндекса, 3) язык браузера
    this.#currentLang =
      localStorage.getItem("gameLanguage") ||
      ysdk?.environment?.i18n?.lang ||
      navigator.language.slice(0, 2) ||
      "ru";

    // Корректируем, если выбранный язык не поддерживается
    if (!this.#availableLangs.includes(this.#currentLang)) {
      this.#currentLang = "ru";
    }

    this.updateLanUI();
  }

  // Получение перевода для UI-элемента
  static t(key) {
    return (
      Translations[this.#currentLang]?.ui?.[key] ||
      Translations.en.ui[key] || // Fallback на английский
      key
    ); // Если ключ не найден
  }

  // Плюрализация (склонение слов)
  static pluralize(word, count) {
    return (
      Translations[this.#currentLang]?.plurals?.[word]?.(count) ||
      `${count} ${word}`
    ); // Fallback
  }

  static pluralizeByKey(key, count) {
    // 1. Проверяем, есть ли прямое правило для этого ключа
    const pluralFn = Translations[this.#currentLang]?.plurals?.[key];

    if (pluralFn) {
      return pluralFn(count);
    }

    // 2. Fallback: получаем базовую форму и добавляем число
    const word = this.t(key);
    return `${count} ${word}`;
  }

  static changeLanguage(newLang) {
    if (this.#availableLangs.includes(newLang)) {
      this.#currentLang = newLang;
      localStorage.setItem("gameLanguage", newLang); // Сохраняем выбор

      // document.getElementById("language-selected").value = newLang;

      this.updateLanUI(); // Обновляем интерфейс
    } else {
      console.warn(`Язык "${newLang}" не поддерживается.`);
    }
  }

  static updateLanUI() {
    // Обновляем все текстовые элементы на странице
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      el.textContent = this.t(key);
    });

    document.getElementById("player-name").placeholder = this.t(
      "player_name_placeholder"
    );

    // Пример для динамических текстов (например, с плюрализацией)
    // const coins = 5; // Пример значения
    // document.getElementById("balance").textContent = `${this.t(
    //   "balance"
    // )}: ${coins} ${this.pluralize("хусынок", coins)}`;
  }

  static updateLanOneUI(el) {
    // Обновляем все текстовые элементы на странице
    const key = el.getAttribute("data-i18n");
    el.textContent = this.t(key);
  }

  static initLanguageSelect() {
    const languageSelect = document.getElementById("language-selected");

    // 1. Установим текущий язык в select
    languageSelect.value = this.#currentLang;

    // 2. Добавим обработчик изменений
    languageSelect.addEventListener("change", (event) => {
      const newLang = event.target.value;
      this.changeLanguage(newLang);
    });
  }
}
