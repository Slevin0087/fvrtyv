import { UIPage } from "./UIPage.js";
import { GameEvents } from "../utils/Constants.js";

export class UIPlayerStatePage extends UIPage {
  constructor(eventManager, stateManager) {
    super(eventManager, stateManager, "player-state");
    this.elements = {
      backBtn: document.getElementById("btn-back-st-player"),
    };
  }

  render() {
    const statePlayer = this.stateManager.state.player;
    const container = document.getElementById("player-state-content");
    container.innerHTML = "";
    container.innerHTML = `<table class="p-state-table table">
      <tr>
        <td class="left-td">Имя:</td>
        <td class="right-td">${statePlayer.name}</td>
      </tr>
      <tr>
        <td class="left-td">Хусынки:</td>
        <td class="right-td">${statePlayer.coins}</td>
      </tr>
      <tr>
        <td class="left-td">Сыграно игр:</td>
        <td class="right-td">${statePlayer.gamesPlayed}</td>
      </tr>
      <tr>
        <td class="left-td">Выиграно игр:</td>
        <td class="right-td">${statePlayer.wins}</td>
      </tr>
      <tr>
        <td class="left-td">Лучший счет:</td>
        <td class="right-td">${statePlayer.highestScore}</td>
      </tr>
      <tr>
        <td class="left-td">Лучшее время:</td>
        <td class="right-td"></td>
      </tr>
      <tr>
        <td class="left-td">Достижение:</td>
        <td class="right-td">${statePlayer.achievements.active.icon}</td>
      </tr>`;
  }

  show() {
    super.show();
    this.render();
    // await Animator.fadeIn(this.page, this.displayPage);
  }
}
