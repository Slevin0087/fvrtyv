import { UIPage } from "./UIPage.js";
import { Helpers } from "../utils/Helpers.js";

export class UIPlayerStatePage extends UIPage {
  constructor(eventManager, stateManager) {
    super(eventManager, stateManager, "player-state");
    this.elements = {
      backBtn: document.getElementById("btn-back-st-player"),
    };
  }

  render() {
    const statePlayer = this.stateManager.state.player;
    let playerName = '';
    if (statePlayer.name === "") {
      playerName = document.getElementById("player-name").placeholder;
    } else if (statePlayer.name !== "") {
      playerName = statePlayer.name
    };
    const container = document.getElementById("player-state-content");
    container.innerHTML = "";
    container.innerHTML = `<table class="p-state-table table">
      <tr>
        <td class="left-td" data-i18n="player_state_name">Имя:</td>
        <td class="right-td">${playerName}</td>
      </tr>
      <tr>
        <td class="left-td" data-i18n="player_state_coins">Хусынки:</td>
        <td class="right-td">${statePlayer.coins}</td>
      </tr>
      <tr>
        <td class="left-td" data-i18n="player_state_games_played">Сыграно игр:</td>
        <td class="right-td">${statePlayer.gamesPlayed}</td>
      </tr>
      <tr>
        <td class="left-td" data-i18n="player_state_games_won">Выиграно игр:</td>
        <td class="right-td">${statePlayer.wins}</td>
      </tr>
      <tr>
        <td class="left-td" data-i18n="player_state_best_score">Лучший счет:</td>
        <td class="right-td">${statePlayer.highestScore}</td>
      </tr>
      <tr>
        <td class="left-td" data-i18n="player_state_best_time">Лучшее время:</td>
        <td class="right-td"></td>
      </tr>
      <tr>
        <td class="left-td" data-i18n="player_state_moves">Ходы:</td>
        <td class="right-td"></td>
      </tr>
      <tr>
        <td class="left-td" data-i18n="player_state_achievement">Достижение:</td>
        <td class="right-td">${statePlayer.achievements.active.icon}</td>
      </tr>`;
  }

  show() {
    super.show();
    this.render();
    Helpers.updateLanUI();
  }
}
