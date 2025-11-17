import { UIPage } from "./UIPage.js";
import { ShopConfig } from "../configs/ShopConfig.js";
import { GameEvents, CardSuits, CardValues } from "../utils/Constants.js";
import { Helpers } from "../utils/Helpers.js";

export class UIShopPage extends UIPage {
  constructor(eventManager, stateManager, translator, shopNavigation) {
    super(eventManager, stateManager, "shop");
    this.state = stateManager.state;
    this.translator = translator;
    this.shopNavigation = shopNavigation;
    this.elements = {
      backBtn: document.getElementById("shop-back"),
      balance: document.getElementById("coins"),
      categoryButtons: {
        faces: document.getElementById("face-btn"),
        backs: document.getElementById("shirt-btn"),
        backgrounds: document.getElementById("fon-btn"),
      },
      containers: {
        faces: document.getElementById("face-container"),
        backs: document.getElementById("shirt-container"),
        backgrounds: document.getElementById("fon-container"),
      },
      shopNavigation: document.getElementById("shop-navigation"),
      itemsContainer: document.getElementById("all-items-container"),
    };

    this.setupEventListeners();
  }

  setupEventListeners() {
    super.setupEventListeners();
    Object.entries(this.elements.categoryButtons).forEach(([category, btn]) => {
      btn.onclick = () => {
        this.eventManager.emit(GameEvents.SHOP_CATEGORY_CHANGE, category);
        this.render(this.state.shop, ShopConfig);
      };
    });

    // this.eventManager.on("shop:render", (shopState) => this.render(shopState));
    this.eventManager.on(GameEvents.SHOP_RENDER, (shopState, config) =>
      this.render(shopState, config)
    );
    this.eventManager.on(GameEvents.SHOP_BALANCE_UPDATE, (balance) =>
      this.updateBalance(balance)
    );
  }

  render(shopState, shopConfig) {
    // Очищаем контейнер
    this.elements.itemsContainer.innerHTML = "";
    // this.elements.shopNavigation.in

    // Устанавливаем активную категорию
    this.setActiveCategory(shopState.currentCategory);

    // Рендерим предметы текущей категории
    const items = shopConfig.items.filter(
      (item) =>
        item.category === this.getTypeForCategory(shopState.currentCategory)
    );

    items.forEach((item, index) => {
      const itemElement = this.createShopItemElement(item, index);
      console.log("itemElement: ", itemElement);

      this.elements.itemsContainer.append(itemElement);
      // if (itemElement && index === items.length - 1) {
      //   const itemElementWidth = this.getElementWidth(itemElement);
      //   const allItemsElementsWidths = this.getAllElementWidths(
      //     items.length,
      //     itemElementWidth
      //   );
      //   const isAllWidthsMoreNavigashion = this.isAllWidthsMoreNavigashion(
      //     allItemsElementsWidths
      //   );
      //   if (!isAllWidthsMoreNavigashion) {
      //     console.log('if (!isAllWidthsMoreNavigashion)');
      //     this.shopNavigation.setNavigationWidth(allItemsElementsWidths / 10 + allItemsElementsWidths)
      //     this.shopNavigation.setScrollBtnsHidden()
      //   } else {
      //     const width = document.documentElement.clientWidth / 1.1
      //     this.shopNavigation.setNavigationWidth(width)

      //   }
      //   this.shopNavigation.setScrollStep(itemElementWidth)
      // }
    });

    // Обновляем баланс
    this.updateBalance(this.state.player.coins);
    // Helpers.updateLanShopBalance(this.state.player.coins);
  }

  createShopItemElement(item, index) {
    const containerElement = document.createElement("div");
    const selectedItems = this.state.player.selectedItems;
    const selectedItem = selectedItems[item.type];
    const isOwned = item.id === selectedItem.id;
    const purchasedItems = this.state.player.purchasedItems;
    const purchasedItem = purchasedItems[item.type];
    const isItemBuy = purchasedItem.ids.includes(item.id);

    containerElement.className = `item-container ${isOwned ? "owned" : ""}`;
    const itemElement = document.createElement("div");
    // Действия с найденным элементом
    itemElement.className = "shop-item";
    itemElement.id = `shop-item-${index}`;
    // const itemHead = document.createElement("div");
    const itemName = document.createElement("h3");
    const shopItemContainer = document.createElement("div");
    const shopItem = document.createElement("div");
    shopItemContainer.append(shopItem);
    // itemHead.classList.add("item-head");
    shopItemContainer.classList.add("shop-item-container");
    const itemNameTranslation = this.translator.tShop(item.id, "name");
    itemName.textContent = itemNameTranslation;
    // itemHead.append(itemName);

    if (item.category === "cardFace" || item.category === "cardBack") {
      shopItem.classList.add("shop-item-card");
      const shopItem2 = document.createElement("div");
      // Применяем стили сразу
      if (item.styles) {
        Object.assign(shopItem.style, item.styles);
        if (item.category === "cardFace") {
          shopItemContainer.append(shopItem2);
          shopItem2.classList.add("shop-item-card");
          Object.assign(shopItem2.style, item.styles);
          const topSymbolA = document.createElement("span");
          topSymbolA.className = "shop-card-top-left value-red";
          topSymbolA.textContent = "A♥";

          const centerSymbolA = document.createElement("span");
          centerSymbolA.className = "shop-card-center value-red";
          centerSymbolA.textContent = "♥";

          const bottomSymbolA = document.createElement("span");
          bottomSymbolA.className = "shop-card-bottom-right value-red";
          bottomSymbolA.textContent = "A♥";

          const topSymbolK = document.createElement("span");
          topSymbolK.className = "shop-card-top-left value-black";
          topSymbolK.textContent = "K♣";

          const centerSymbolK = document.createElement("span");
          centerSymbolK.className = "shop-card-center value-black";
          centerSymbolK.textContent = "♣";

          const bottomSymbolK = document.createElement("span");
          bottomSymbolK.className = "shop-card-bottom-right value-black";
          bottomSymbolK.textContent = "K♣";

          shopItem2.append(topSymbolK, centerSymbolK, bottomSymbolK);
          shopItem.append(topSymbolA, centerSymbolA, bottomSymbolA);
        }
      } else if (!item.styles && item.previewImage) {
        let bgPositionsShopItem = null;
        if (item.category === "cardFace") {
          shopItemContainer.append(shopItem2);
          const bgPositionsShopItem2 =
            Helpers.calculateCardBgSpriteSheetPosition(
              CardSuits.CLUBS,
              CardValues[CardValues.length - 1],
              item.previewImage.manyColumns,
              item.previewImage.manyLines
            );
          bgPositionsShopItem = Helpers.calculateCardBgSpriteSheetPosition(
            CardSuits.HEARTS,
            CardValues[0],
            item.previewImage.manyColumns,
            item.previewImage.manyLines
          );
          shopItem.className = "shop-item-card-bg";
          shopItem2.className = "shop-item-card-bg";
          shopItem2.style.backgroundImage = `url(${item.previewImage.img})`;
          shopItem2.style.backgroundPosition = `${bgPositionsShopItem2.x}% ${bgPositionsShopItem2.y}%`;
          Object.assign(shopItem2.style, item.previewImage.styles);
        } else if (item.category === "cardBack") {
          bgPositionsShopItem = Helpers.calculateCardBackPosition(item);
          shopItem.className = "shop-item-card-bg-cb1";
        }
        shopItem.style.backgroundImage = `url(${item.previewImage.img})`;
        shopItem.style.backgroundPosition = `${bgPositionsShopItem.x}% ${bgPositionsShopItem.y}%`;
        Object.assign(shopItem.style, item.previewImage.styles);
      }
    } else if (item.category === "background") {
      shopItem.classList.add("shop-item-fon");
      if (item.styles) Object.assign(shopItem.style, item.styles);
      else if (item.previewImage) {
        const img = document.createElement("img");
        img.src = item.previewImage;
        shopItem.append(img);
      }
      shopItemContainer.append(shopItem);
    }

    // itemElement.append(itemHead, shopItemContainer);
    itemElement.append(shopItemContainer);
    let circle = null;
    let checkmark = null;
    let priceElement = null;

    if (isOwned) {
      if (priceElement) priceElement.remove();
      if (checkmark) checkmark.remove();
      const circle = this.createCircle(index);
      itemElement.append(circle);
    } else if (!isOwned && !isItemBuy) {
      if (circle) priceElement.remove();
      if (checkmark) checkmark.remove();
      const priceElement = document.createElement("div");
      priceElement.classList.add("shop-item-price");
      priceElement.textContent = `${item.price}x`;
      itemElement.append(priceElement);
    } else if (isItemBuy && !isOwned) {
      if (circle) circle.remove();
      if (priceElement) priceElement.remove();
      checkmark = this.createCheckMark();
      itemElement.append(checkmark);
    }
    //   if (priceElement) {
    //     priceElement.remove;
    //   }
    //   circle.classList.add("hidden");
    //   btnOrCircle.classList.remove("hidden");
    // }

    // shopItemContainer.append(priceElement);

    // const btnOrCircle = this.createBtn(item, index, isOwned, isItemBuy);

    // itemElement.append(itemHead, shopItemContainer, btnOrCircle, circle);

    itemElement.onclick = () => this.handleBtnClick(item, isOwned, isItemBuy);
    containerElement.append(itemElement);
    // if (isOwned) {
    //   circle.classList.remove("hidden");
    //   btnOrCircle.classList.add("hidden");
    // } else if (!isOwned && !isItemBuy) {
    //   btnOrCircle.classList.remove("hidden");
    //   circle.classList.add("hidden");
    // } else if (isItemBuy && !isOwned) {
    //   circle.classList.add("hidden");
    //   btnOrCircle.classList.remove("hidden");
    // }

    return containerElement;
  }

  createCircle(index) {
    const checkmarkCircle = document.createElement("div");
    checkmarkCircle.id = `checkmarkCircle-${index}`;
    checkmarkCircle.classList.add("checkmark-circle");
    const checkmark = this.createCheckMark();
    checkmarkCircle.append(checkmark);
    return checkmarkCircle;
  }

  createCheckMark() {
    const checkmark = document.createElement("div");
    checkmark.classList.add("checkmark");
    return checkmark;
  }

  createBtn(item, index, isOwned, isItemBuy) {
    const btn = document.createElement("button");
    btn.classList.add("shop-action-btn");
    btn.id = `btn-buy-${index}`;
    if (!isOwned && !isItemBuy) {
      btn.setAttribute("data-i18n", "shop_btn_buy");
      this.translator.updateLanOneUI(btn);
      // btn.textContent = `${btn.textContent}(${item.price})`;
      btn.textContent = `${item.price}x`;
    } else if (isItemBuy) {
      btn.setAttribute("data-i18n", "shop_btn_apply");
      this.translator.updateLanOneUI(btn);
    }

    btn.onclick = () => this.handleBtnClick(item, isOwned, isItemBuy);
    return btn;
  }

  handleItemElement(targetItem, priceElement, circle) {
    console.log(
      "targetItem, priceElement, circle: ",
      targetItem,
      priceElement,
      circle
    );

    // targetItem.remove(priceElement)
    priceElement.remove();
    targetItem.append(circle);
  }

  handleBtnClick(item, isOwned, isItemBuy) {
    if (isItemBuy && !isOwned) {
      this.eventManager.emit(GameEvents.SET_SELECTED_ITEMS, item);
      this.eventManager.emit(GameEvents.CHANGE_CARDS_STYLES);
      this.render(this.state.shop, ShopConfig);
    } else if (!isItemBuy && !isOwned) {
      this.eventManager.emit(GameEvents.SHOP_ITEM_PURCHASE, item);
      this.render(this.state.shop, ShopConfig);
    }
  }

  setActiveCategory(category) {
    // Обновляем кнопки
    Object.values(this.elements.categoryButtons).forEach((btn) => {
      btn.classList.remove("active-shop-btn");
    });
    this.elements.categoryButtons[category].classList.add("active-shop-btn");

    // Обновляем контейнеры
    Object.values(this.elements.containers).forEach((container) => {
      container.style.display = "none";
    });
    this.elements.containers[category].style.display = "block";
  }

  // updateBalance(balance) {
  //   this.elements.balance.textContent = balance;
  // }

  updateBalance(balance) {
    this.translator.updateLanShopBalance(balance);
  }

  getTypeForCategory(category) {
    const mapping = {
      faces: "cardFace",
      backs: "cardBack",
      backgrounds: "background",
    };
    return mapping[category];
  }

  getElementWidth(element) {
    return element.offsetWidth;
  }

  getAllElementWidths(elementsLengths, elementWidth) {
    return elementsLengths * elementWidth;
  }

  isAllWidthsMoreNavigashion(allWidths) {
    console.log(
      "allWidths, window.offsetWidth: ",
      allWidths,
      document.documentElement.clientWidth
    );

    return allWidths > document.documentElement.clientWidth;
  }

  show() {
    super.show();
    this.render(this.state.shop, ShopConfig);
  }
}
