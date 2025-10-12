import { UIPage } from "./UIPage.js";
import { GameEvents } from "../utils/Constants.js";
import {
  UIGameRestartModalBodyData,
  UIGameRestartModalFooterData,
  UIModalFooterBtnsEventIds,
} from "../configs/UIConfig.js";

export class BaseModal extends UIPage {
  constructor(eventManager, stateManager, translator) {
    super(eventManager, stateManager, "base-modal");
    this.eventManager = eventManager;
    this.stateManager = stateManager;
    this.translator = translator;
    console.log("constructor в BaseModal");
  }

  init() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.eventManager.on(
      GameEvents.CREAT_GAME_RESTART_MODAL,
      (parameters, footerBtnsEvents) => {
        const modal = this.createModal(parameters, footerBtnsEvents);
        const body = document.querySelector("body");
        body.append(modal);
        this.stateManager.setIsRestartGameModalCreated(true);
      }
    );
  }

  createModal(modalParameters, footerBtnsEvents) {
    console.log("в createModal modalParameters: ", modalParameters);

    const { modal, header, headerBtn, closeSpan, title, body, footer } =
      modalParameters;

    // Создание главного контейнера модуля
    const modalContainer = document.createElement("div");
    modalContainer.id = modal.id || "";
    modalContainer.className = modal.className || "";

    // Создание header модуля и добавление его в главный контейнер модуля
    const modalHeader = document.createElement("div");
    modalHeader.id = header.id || "";
    modalHeader.className = header.className || "";
    modalContainer.append(modalHeader);

    // Создание кнопки закрытия модуля(x) и добавление его в header модуля
    const headerCloseBtn = document.createElement("div");
    headerCloseBtn.id = headerBtn.id;
    headerCloseBtn.className = headerBtn.className || "";
    modalHeader.append(headerCloseBtn);

    // Создание span для кнопки закрытия модуля(x) и добавление его в кнопку
    const closeSpanX = document.createElement("span");
    closeSpanX.id = closeSpan.id || "";
    closeSpanX.className = closeSpan.className || "";
    closeSpanX.innerHTML = closeSpan.textContent;
    headerCloseBtn.append(closeSpanX);

    // Создание header->title и добавление его в header модуля
    const modalHeaderTitle = document.createElement("div");
    modalHeaderTitle.id = title.id || "";
    modalHeaderTitle.className = title.className || "";
    modalHeaderTitle.setAttribute(title.dataI18n, title.dataI18nValue);
    modalHeaderTitle.textContent = this.translator.t(title.dataI18nValue);
    modalHeader.append(modalHeaderTitle);

    // Создание span элемента для текста, который будет находиться в header->title
    // и добавление его в header->title
    const headerTitleSpan = document.createElement("span");
    headerTitleSpan.id = title.spanId || "";
    headerTitleSpan.className = title.spanClassName || "";
    modalHeaderTitle.append(headerTitleSpan);

    // Создание тела модуля и добавление его в главный контейнер модуля
    const modalBody = this.createGameRestartBody(UIGameRestartModalBodyData);
    modalContainer.append(modalBody);

    // Создание footer и добавление его в в главный контейнер модуля
    const modalFooter = this.createGameRestartFooter(
      UIGameRestartModalFooterData,
      footerBtnsEvents
    );
    modalContainer.append(modalFooter);

    return modalContainer;
  }

  createGameRestartBody(parameters) {
    const { body, span } = parameters;

    // Создание body(тела) модуля
    const modalBody = document.createElement("div");
    modalBody.id = body.id || "";
    modalBody.className = body.className || "";

    // Создание span элемента, так как в body restartGameModal только span элемент
    // и добавбление его в body
    const bodySpan = document.createElement("span");
    bodySpan.id = span.id || "";
    bodySpan.className = span.className || "";
    bodySpan.setAttribute(span.dataI18n, span.dataI18nValue);
    bodySpan.textContent = this.translator.t(span.dataI18nValue);
    modalBody.append(bodySpan);

    return modalBody;
  }

  createGameRestartFooter(parameters, footerBtnsEvents) {
    const { footer, buttons } = parameters;
    const { cancel, again } = footerBtnsEvents;
    // Создание footer модуля
    const modalFooter = document.createElement("div");
    modalFooter.id = footer.id || "";
    modalFooter.className = footer.className || "";

    // Проход по массиву buttons, создание кнопок и добавление их в footer
    // в проходе по массиву buttons, так же устанавливается textContent через this.translator.t()
    // this.translator.t() по dataI18nValue находит переведённое слово с установленного языка
    buttons.forEach((btn) => {
      const footerBtn = document.createElement("button");
      footerBtn.id = btn.id || "";
      footerBtn.className = btn.className || "";
      footerBtn.setAttribute(btn.dataI18n, btn.dataI18nValue);
      footerBtn.textContent = this.translator.t(btn.dataI18nValue);
      if (btn.eventId === UIModalFooterBtnsEventIds.cancel) {
        footerBtn[btn.type] = () => cancel();
      } else if (btn.eventId === UIModalFooterBtnsEventIds.again) {
        footerBtn[btn.type] = () => again();
      }
      modalFooter.append(footerBtn);
    });

    return modalFooter;
  }
}
