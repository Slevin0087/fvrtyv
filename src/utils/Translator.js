import { Translations } from "../locales/Translations.js";
import { AchievementsTranslations } from "../locales/AchievementsTranslations.js";
import { OtherTranslations } from "../locales/OtherTranslations.js";
import { ShopItemsTranslations } from "../locales/ShopItemsTranslations.js";
import { defaultData } from "../locales/constants.js";
import { UIConfig } from "../configs/UIConfig.js";

export class Translator {
  constructor() {
    this.currentLang = defaultData.currentLang;
    this.availableLangs = defaultData.availableLangs;
  }

  //   static #currentLang = defaultData.currentLang; // Приватное поле для текущего языка
  //   static #availableLangs = defaultData.availableLangs; // Поддерживаемые языки

  initLanguage(ysdk) {
    // Приоритеты: 1) сохраненный выбор, 2) язык Яндекса, 3) язык браузера
    this.currentLang =
      localStorage.getItem("gameLanguage") ||
      ysdk?.environment?.i18n?.lang ||
      navigator.language.slice(0, 2) ||
      defaultData.currentLang;

    // Корректируем, если выбранный язык не поддерживается
    if (!this.availableLangs.includes(this.currentLang)) {
      this.currentLang = defaultData.currentLang;
    }

    this.updateLanUI();
  }

  // Получение перевода для UI-элемента
  t(key) {
    return (
      Translations[this.currentLang]?.ui?.[key] ||
      Translations.en.ui[key] || // Fallback на английский
      key
    ); // Если ключ не найден
  }

  // Получение перевода для (динамического) UI-other-элемента, которого нет в Translations
  tOther(key) {
    return (
      OtherTranslations[this.currentLang]?.ui?.[key] ||
      OtherTranslations.en.ui[key] || // Fallback на английский
      key
    ); // Если ключ не найден
  }

  changeLanguage(newLang) {
    if (this.availableLangs.includes(newLang)) {
      this.currentLang = newLang;
      localStorage.setItem("gameLanguage", newLang); // Сохраняем выбор

      // document.getElementById("language-selected").value = newLang;

      this.updateLanUI(); // Обновляем интерфейс
    } else {
      console.warn(`Язык "${newLang}" не поддерживается.`);
    }
  }

  tShop(key, value) {
    return (
      ShopItemsTranslations?.[this.currentLang]?.[key]?.[value] ||
      ShopItemsTranslations.en[key]?.[value] || // Fallback на английский
      key
    ); // Если ключ не найден
  }

  tAch(key, value) {
    return (
      AchievementsTranslations?.[this.currentLang]?.[key]?.[value] ||
      AchievementsTranslations.en[key]?.[value] || // Fallback на английский
      key
    ); // Если ключ не найден
  }

  tAchOther(icon) {
    const keyH4AchStartText = UIConfig.keysForTranslations.H4_START;
    const keyH4AchEndText = UIConfig.keysForTranslations.H4_END;
    const h4AchStartText =
      OtherTranslations?.[this.currentLang]?.ui?.[keyH4AchStartText];
    const h4AchEndText =
      OtherTranslations?.[this.currentLang]?.ui?.[keyH4AchEndText];
    const h4TextContent = `${h4AchStartText} ${icon} ${h4AchEndText}`;
    const keySpanRedStart = UIConfig.keysForTranslations.SPAN_RED_START;
    const spanRedStart =
      OtherTranslations?.[this.currentLang]?.ui?.[keySpanRedStart];
    return { h4TextContent, spanRedStart };
  }

  // Плюрализация (склонение слов)
  pluralize(word, count) {
    return (
      Translations[this.currentLang]?.plurals?.[word]?.(count) ||
      `${count} ${word}`
    ); // Fallback
  }

  pluralizeByKey(key, count) {
    // 1. Проверяем, есть ли прямое правило для этого ключа
    const pluralFn = Translations[this.currentLang]?.plurals?.[key];

    if (pluralFn) {
      return pluralFn(count);
    }

    // 2. Fallback: получаем базовую форму и добавляем число
    const word = this.t(key);
    return `${count} ${word}`;
  }

  updateLanUI() {
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

  updateLanOneUI(el) {
    // Обновляем текстовые одного только элемент el
    const key = el.getAttribute("data-i18n");
    el.textContent = this.t(key);
  }

  updateLanOneOther(el) {
    // Обновляем текст одного только элемента el (динамического), которого нет в Translations
    const key = el.getAttribute("data-i18n");
    el.textContent = this.tOther(key);
  }

  updateLanShopBalance(count) {
    console.log("updateLanShopBalance count: ", count);

    const balanceContainer = document.getElementById("balance-container");
    const key = balanceContainer.getAttribute("data-i18n");
    balanceContainer.textContent = this.t(key);
    const span = document.createElement("span");
    span.id = "coins";
    span.textContent = `${this.pluralize(span.id, count)}`;
    balanceContainer.appendChild(span);
  }

  initLanguageSelect() {
    const languageSelect = document.getElementById("language-selected");

    // 1. Установим текущий язык в select
    languageSelect.value = this.currentLang;

    // 2. Добавим обработчик изменений
    languageSelect.addEventListener("change", (event) => {
      const newLang = event.target.value;
      this.changeLanguage(newLang);
    });
  }
}
