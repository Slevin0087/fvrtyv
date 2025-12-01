import { UIPage } from "./UIPage.js";

export class UIPlayerStatePage extends UIPage {
  constructor(eventManager, stateManager, gameModesManager, translator) {
    super(eventManager, stateManager, "player-state");
    this.gameModesManager = gameModesManager
    this.translator = translator;
    this.elements = {
      backBtn: document.getElementById("btn-back-st-player"),
    };
  }

  render() {
    const statePlayer = this.stateManager.getPlayerState();
    const stateForAchievements = this.stateManager.getStateForAchievements();
    const storagePlayer = this.stateManager.storage.getPlayerStats();
    console.log("storagePlayer.fastestWin: ", storagePlayer.fastestWin);
    let fastestWin = "";
    if (storagePlayer.fastestWin === Infinity) {
      fastestWin = "00:00";
    } else {
      const hours = Math.floor(storagePlayer.fastestWin / 3600);
      const minutes = Math.floor((storagePlayer.fastestWin % 3600) / 60);
      const seconds = Math.floor(storagePlayer.fastestWin % 60);
      const formattedMinutes = minutes.toString().padStart(2, "0");
      const formattedSeconds = seconds.toString().padStart(2, "0");
      if (hours > 0) {
        const formattedHours = hours.toString().padStart(2, "0");
        fastestWin = `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
      } else {
        fastestWin = `${formattedMinutes}:${formattedSeconds}`;
      }
    }
    console.log('fastestWin: ', fastestWin);
    
    let playerName = "";
    if (statePlayer.name === "") {
      playerName = document.getElementById("player-name").placeholder;
    } else if (statePlayer.name !== "") {
      playerName = statePlayer.name;
    }
    const container = document.getElementById("player-state-content");
    container.innerHTML = "";
    container.innerHTML = `<dl class="p-state-table table">
      <div class='wrap-line'>
        <dt class="left-td" data-i18n="player_state_name">Имя:</dt>
        <dd class="right-td">${playerName}</dd>
      </div>
      <div class='wrap-line'>
        <dt class="left-td" data-i18n="player_state_coins">Хусынки:</dt>
        <dd class="right-td">${statePlayer.coins}</dd>
      </div>
      <div class='wrap-line'>
        <dt class="left-td" data-i18n="player_state_games_played">Сыграно игр:</dt>
        <dd class="right-td">${storagePlayer.gamesPlayed}</dd>
      </div>
      <div class='wrap-line'>
        <dt class="left-td" data-i18n="player_state_games_won">Выиграно игр:</dt>
        <dd class="right-td">${statePlayer.wins}</dd>
      </div>
      <div class='wrap-line'>
        <dt class="left-td" data-i18n="player_state_games_won_no_undo">Без отмен ходов:</dt>
        <dd class="right-td">${storagePlayer.winsWithoutUndo}</dd>
      </div>
      <div class='wrap-line'>
        <dt class="left-td" data-i18n="player_state_games_won_no_hints">Без подсказок:</dt>
        <dd class="right-td">${storagePlayer.winsWithoutHints}</dd>
      </div>
      <div class='wrap-line'>
        <dt class="left-td" data-i18n="player_state_best_score">Лучший счет:</dt>
        <dd class="right-td">${statePlayer.highestScore}</dd>
      </div>
      <div class='wrap-line'>
        <dt class="left-td" data-i18n="player_state_best_time">Лучшее время:</dt>
        <dd class="right-td">${fastestWin}</dd>
      </div>
      <div class='wrap-line'>
        <dt class="left-td" data-i18n="player_state_moves">Ходов за игру:</dt>
        <dd class="right-td">${stateForAchievements.moves}</dd>
      </div>
      <div class='wrap-line'>
        <dt class="left-td" data-i18n="all_player_state_moves">Ходов за всё время:</dt>
        <dd class="right-td">${storagePlayer.totalMoves}</dd>
      </div>
      <div class='wrap-line'>
        <dt class="left-td" data-i18n="player_state_achievement">Достижение:</dt>
        <dd class="right-td">${statePlayer.achievements.active.icon}</dd>
      </div>
    </dl>`;
  }

  show() {
    super.show();
    this.render();
    this.translator.updateLanUI();
  }
}
