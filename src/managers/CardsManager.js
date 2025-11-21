import { GameEvents } from "../utils/Constants.js";
import { CardsSystem } from "../systems/uiSystems/CardsSystem.js";
import { Deck } from "../core/Deck.js";
import { Foundation } from "../core/Foundation.js";
import { Tableau } from "../core/Tableau.js";
import { Stock } from "../core/Stock.js";
import { Waste } from "../core/Waste.js";

export class CardsManager {
  constructor(eventManager, stateManager) {
    this.eventManager = eventManager;
    this.stateManager = stateManager;
    this.components = {};
    this.systems = null;

    this.init();
  }

  init() {
    this.registerComponents();
    this.registerSystems();
  }

  registerComponents() {
    this.components = {
      deck: new Deck(),
      foundations: Array.from({ length: 4 }, (_, i) => new Foundation(i)),
      tableaus: Array.from({ length: 7 }, (_, i) => new Tableau(i)),
      stock: new Stock(),
      // waste: new Waste(),
    };
    this.stateManager.setCardsComponents(this.components)
  }

  registerSystems() {
    this.systems = {
      cardsSystem: new CardsSystem(
        this.eventManager,
        this.stateManager,
        this.components.deck,
        this.components.foundations,
        this.components.tableaus,
        this.components.stock,
        // this.components.waste,
    ),
    };
  }

  setCards() {
    this.systems.cardsSystem.setCards();
  }

  async dealTableauCards() {
    try {
      await this.systems.cardsSystem.dealTableauCards();
    } catch (error) {
      console.log(error);
      
    }
  }
}
