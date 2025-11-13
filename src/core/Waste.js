import { Pile } from "./Pile.js";
import { UIConfig } from "../configs/UIConfig.js";
import { GameConfig } from "../configs/GameConfig.js";

export class Waste extends Pile {
  constructor() {
    super("waste");
    this.overlapX = UIConfig.layout.card.wasteOverlapX;
    this.overlapY = UIConfig.layout.card.wasteOverlapY; // Смещение для отображения веера карт
    this.oneOverlapX = UIConfig.layout.card.wasteOneOverlapX;
    this.maxVisibleCards = UIConfig.layout.card.wasteMaxVisibleCards;
    this.setOverlapX();
    this.maxOverlapX = this.oneOverlapX * (this.maxVisibleCards - 1);
    this.element = super.createPileElement();
    this.topThreeCards = [];
  }

  canAccept(card) {
    return card.faceUp;
  }

  addCard(card) {
    console.log("addCard(card) this.cards: ", this.cards);

    super.addCard(card);
    if (card.domElement) {
      card.removeDataAttribute(GameConfig.dataAttributes.cardParent);
      card.removeDataAttribute(GameConfig.dataAttributes.dataAttributeDND);
    }
    card.setDataAttribute(
      GameConfig.dataAttributes.cardParent,
      card.positionData.parent
    );
    // у дом элемента waste нет первого дочернего элемента span,
    // поэтому можно позицию у карт начинать с 0
    card.positionData.offsetX = 0;
    card.positionData.offsetY = 0;
    this.uppp();
    console.log("card.positionData.offsetX: ", card);
  }

  uppp() {
    this.topThreeCards = [];
    this.cards.forEach((card, index) => {
      console.log("uppp() card: ", card);
      
      // Рассчитываем позицию от конца массива
      const positionFromEnd = this.cards.length - 1 - index;
      console.log("positionFromEnd: ", positionFromEnd);
      
      if (positionFromEnd < this.maxVisibleCards) {
        const getPropertyValueCardWidth = this.element.offsetWidth;
        console.log('getPropertyValueCardWidth: ', getPropertyValueCardWidth);
        
        this.oneOverlapX = getPropertyValueCardWidth / 3
        // Это последние 3 карты (или меньше, если карт мало)
        card.positionData.offsetX = positionFromEnd * this.oneOverlapX;

        card.positionData.offsetY = this.overlapY * 20 * positionFromEnd;
        this.topThreeCards.push(card);
      } else {
        // Остальные карты (те, что "под" видимыми)
        card.positionData.offsetX = this.maxOverlapX;
      }
    });
    return this.topThreeCards;
  }

  setOverlapX() {
    const width = window.innerWidth;
    const breakpoints = [
      { max: 400, multiplier: 1.1, base: "wasteOneOverlapX" },
      { max: 425, multiplier: 1.2, base: "wasteOneOverlapX" },
      { max: 450, multiplier: 1, base: "wasteOneOverlapX" },
      { max: 500, multiplier: 1.2, base: "wasteOneOverlapX" },
      { max: 525, multiplier: 1.4, base: "wasteOneOverlapX" },
      { max: 550, multiplier: 1.6, base: "wasteOneOverlapX" },
      { max: 600, multiplier: 1.7, base: "wasteOneOverlapX" },
      { max: 620, multiplier: 1.8, base: "wasteOneOverlapX" },
      { max: 650, multiplier: 1.8, base: "wasteOneOverlapX" },
      { max: 700, multiplier: 1.9, base: "wasteOneOverlapX" },
      { max: 725, multiplier: 1.9, base: "wasteOneOverlapX" },
      { max: 745, multiplier: 2, base: "wasteOneOverlapX" },
      { max: 768, multiplier: 2.1, base: "wasteOneOverlapX" },
      { max: 800, multiplier: 2.2, base: "wasteOneOverlapX" },
      { max: 850, multiplier: 2.2, base: "wasteOneOverlapX" },
      { max: 870, multiplier: 2.2, base: "wasteOneOverlapX" },
      { max: 900, multiplier: 2.2, base: "wasteOneOverlapX" },
      { max: 1000, multiplier: 2.4, base: "wasteOneOverlapX" },
      { max: 1100, multiplier: 2.3, base: "wasteOneOverlapX" },
      { max: 1150, multiplier: 2.3, base: "wasteOneOverlapX" },
      { max: 1200, multiplier: 1.5, base: "wasteOneOverlapX1024px" },
      { max: 1500, multiplier: 1.7, base: "wasteOneOverlapX1024px" },
      { max: 1600, multiplier: 1.7, base: "wasteOneOverlapX1024px" },
      { max: Infinity, multiplier: 2.2, base: "wasteOneOverlapX1024px" },
    ];

    const config = breakpoints.find((bp) => width <= bp.max);
    this.oneOverlapX = UIConfig.layout.card[config.base] * config.multiplier;
    console.log("this.oneOverlapX: ", this.oneOverlapX);

    return this.oneOverlapX;
  }
}
