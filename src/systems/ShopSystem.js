import { Storage } from "../utils/Storage.js";
// import { Validator } from "../utils/Validator.js";
import { ShopConfig } from "../configs/ShopConfig.js";
import { GameEvents } from "../utils/Constants.js";

export class ShopSystem {
  constructor(eventManager, stateManager) {
    this.stateManager = stateManager;
    this.eventManager = eventManager;
    this.storage = new Storage();
    // this.validator = new Validator();
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadShopItems();
  }

  setupEventListeners() {
    this.eventManager.on("shop:item:select", (itemId) =>
      this.handleItemSelect(itemId)
    );
    // this.eventManager.on(GameEvents.SHOP_ITEM_PURCHASE, (itemId) =>
    //   this.purchaseItem(itemId)
    // );
    this.eventManager.on(GameEvents.SHOP_ITEM_PURCHASE, (item) =>
      this.purchaseItem(item)
    );
    this.eventManager.on(GameEvents.SET_SELECTED_ITEMS, (item) =>
      this.setSelectedItems(item)
    );
  }

  loadShopItems() {
    const items = this.storage.getShopItems();
    const purchasedItems = this.storage.getPurchasedItems();

    this.stateManager.shop = {
      items: items.map((item) => ({
        ...item,
        owned: purchasedItems.includes(item.id),
      })),
      currentCategory: "cardFaces",
      balance: this.storage.getCoins(),
    };
  }

  handleItemSelect(itemId) {
    const item = this.stateManager.shop.items.find((i) => i.id === itemId);
    if (!item) return;

    if (item.owned) {
      this.applyItem(item);
      this.eventManager.emit(
        "ui:notification",
        `Стиль "${item.name}" применен`
      );
    } else {
      this.eventManager.emit("shop:item:preview", item);
    }
  }

  purchaseItem(item) {
    console.log("в purchaseItem:", item);

    if (this.stateManager.state.player.coins >= item.price) {
      this.eventManager.emit(GameEvents.DECREMENT_COINS, item.price);

      this.applyItem(item);

      this.stateManager.savePlayerStats();
      // this.eventManager.emit(
      //   GameEvents.UI_NOTIFICATION,
      //   `Стиль "${item.name}" куплен и применен`
      // );
    } else {
      // this.eventManager.emit(
      //   GameEvents.UI_NOTIFICATION,
       alert( "Недостаточно хусынок");
      // );
    }
  }

  applyItem(item) {
    this.stateManager.state.player.purchasedItems[item.type].ids.push(item.id);
  }

  setSelectedItems(item) {
    console.log('OOOOOOOOOOOOOOOOOO:', item);
    
    this.stateManager.state.player.selectedItems[item.type].id = item.id;
    this.stateManager.state.player.selectedItems[item.type].styleClass =
      item.styleClass;
    this.stateManager.savePlayerStats();
  }

  changeCategory(category, shopConfig) {
    this.eventManager.emit(GameEvents.SHOP_RENDER, category, shopConfig);
  }

  addCoins(amount) {
    if (!this.validator.isPositiveNumber(amount)) return;

    this.stateManager.shop.balance += amount;
    this.storage.saveCoins(this.stateManager.shop.balance);
    this.eventManager.emit(
      "shop:balance:update",
      this.stateManager.shop.balance
    );
  }
}
