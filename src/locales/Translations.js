export const Translations = {
  en: {
    ui: {
      player_name_placeholder: "Player",
      ru_btn: "Russian",
      en_btn: "English",
      tr_btn: "Turkish",
      abaza_btn: "Abaza",
      btnBackToMenu: "Back to menu",
      //   menuBtns: {
      menu_btn_new_game: "New Game",
      menu_btn_continue_game: "Continue",
      menu_btn_settings_game: "Settings",
      menu_btn_state_player: "Statistics",
      menu_btn_shop: "Shop",
      menu_btn_exit_game: "Exit",
      //   },
      //   settinsGame: {
      setting_title: "Settings",
      music_volume: "Volume:",
      span_sound_off_in: "Sounds:",
      c_setting_item: "Complexity:",
      option_easy: "Easy",
      option_medium: "Average",
      option_hard: "Complex",
      ln_setting_item: "Language",
      //   },
      //   shopGame: {
      shop_title: "Shop",
      balance: "Balance: ",
      shop_btn_apply: "Apply",
      shop_btn_buy: "Buy",
      // balanceTextContentH: "",
      btn_card_face: "Face",
      btn_card_shirt: "Shirt",
      btn_card_fon: "Background",
      //   },
      //   playerState: {
      player_state_title: "Player stats",
      player_state_name: "Name:",
      player_state_coins: "Husynks:",
      player_state_games_played: "Games played:",
      player_state_games_won: "Games won:",
      player_state_best_score: "Best score:",
      player_state_best_time: "Best time:",
      player_state_moves: "Moves:",
      player_state_achievement: "Achievement:",

      //   },
      //   gameInterface: {
      blinking_text: "Collect cards",
      undo_btn_aria_title: "Undo move",
      new_game_ctr_btn: "New Game",
      hint_btn: "Hint",
      menu_btn: "Game menu",
      //   },
      new_game: "New Game",
      restart: "Restart",
      hint: "Hint",
      win: "You Win!",
      moves: "Moves",
      time: "Time",
      // ... другие UI-тексты
      add_name: "Enter your name",
      add_name_btn: "Start the game",
      add_name_skip: "Skip",
      player_name: "Player",
      game_name: "Khusynka",
    },
    plurals: {
      coin: (count) => `${count} ${count === 1 ? "coin" : "coins"}`,
      // ... другие слова с плюрализацией
    },
  },
  ru: {
    ui: {
      player_name_placeholder: "Игрок",
      ru_btn: "Русский",
      en_btn: "Английский",
      tr_btn: "Турецкий",
      abaza_btn: "Абаза",
      btnBackToMenu: "Назад в меню",
      //   menuBtns: {
      menu_btn_new_game: "Новая игра",
      menu_btn_continue_game: "Продолжить",
      menu_btn_settings_game: "Настройки",
      menu_btn_state_player: "Статистика",
      menu_btn_shop: "Магазин",
      menu_btn_exit_game: "Выход",
      //   },
      //   settinsGame: {
      setting_title: "Настройки",
      music_volume: "Громкость:",
      span_sound_off_in: "Звуки:",
      c_setting_item: "Сложность:",
      option_easy: "Лёгкая",
      option_medium: "Средняя",
      option_hard: "Сложная",
      ln_setting_item: "Язык",
      //   },
      //   shopGame: {
      shop_title: "Магазин",
      balance: "Баланс: ",
      shop_btn_apply: "Применить",
      shop_btn_buy: "Купить",
      // balanceTextContentH: "",
      btn_card_face: "Лицо",
      btn_card_shirt: "Рубашка",
      btn_card_fon: "Фон",
      //   },
      //   playerState: {
      player_state_title: "Статистика игрока",
      player_state_name: "Имя:",
      player_state_coins: "Хусынки:",
      player_state_games_played: "Сыграно игр:",
      player_state_games_won: "Выиграно игр:",
      player_state_best_score: "Лучший счет:",
      player_state_best_time: "Лучшее время:",
      player_state_moves: "Ходы:",
      player_state_achievement: "Достижение:",
      //   },
      //   gameInterface: {
      blinking_text: "Собрать карты",
      undo_btn_aria_title: "Отменить ход",
      new_game_ctr_btn: "Новая игра",
      hint_btn: "Подсказка",
      menu_btn: "Меню игры",
      //   },
      new_game: "Новая игра",
      restart: "Заново",
      hint: "Подсказка",
      win: "Победа!",
      moves: "Ходы",
      time: "Время",
      add_name: "Введите ваше имя",
      add_name_btn: "Начать игру",
      add_name_skip: "Пропустить",
      player_name: "Игрок",
      game_name: "Хусынка",
      // ... другие UI-тексты
    },
    plurals: {
      хусынок: (count) => {
        const lastDigit = count % 10;
        const lastTwoDigits = count % 100;
        if (lastTwoDigits >= 11 && lastTwoDigits <= 19)
          return `${count} хусынок`;
        switch (lastDigit) {
          case 1:
            return `${count} хусынка`;
          case 2:
          case 3:
          case 4:
            return `${count} хусынки`;
          default:
            return `${count} хусынок`;
        }
      },
      // ... другие слова с плюрализацией
    },
  },
  abaza: {
    ui: {
      player_name_placeholder: "Ахъвмарраг|в",
      ru_btn: "Урышвбызшва",
      en_btn: "En",
      tr_btn: "Трыквбызшва",
      abaza_btn: "Х|ыбызшва",
      btnBackToMenu: "Щт|ахьла аменю",
      //   menuBtns: {
      menu_btn_new_game: "Хъвмарра ш|ыц",
      menu_btn_continue_game: "Аджвыквц|ара",
      menu_btn_settings_game: "Анырг|алра",
      menu_btn_state_player: "Астатистика",
      menu_btn_shop: "Аткван",
      menu_btn_exit_game: "Аджвылц|хра",
      //   },
      //   settinsGame: {
      setting_title: "Анырг|алра",
      music_volume: "Абжьы акъару:",
      span_sound_off_in: "Абыжьква:",
      c_setting_item: "Абаргвыра:",
      option_easy: "Майра",
      option_medium: "Йыгьбаргвым",
      option_hard: "Баргвы",
      ln_setting_item: "Абызшва",

      //   },
      //   shopGame: {
      shop_title: "Аткван",
      balance: "Ахча-баг|вча: ",
      shop_btn_apply: "Аргылра",
      shop_btn_buy: "Ахвг|ара",
      // balanceTextContentH: "",
      btn_card_face: "Аш|ахъа",
      btn_card_shirt: "Арубашка",
      btn_card_fon: "Афон",
      //   },
      //   playerState: {
      player_state_title: "Ахъвмарраг|в йстатистика",
      player_state_name: "Ахъвмарраг|в йыхьыз:",
      player_state_coins: "Х|вусынк|ата:",
      player_state_games_played: "Йаг|всхьаз хъвмаррата:",
      player_state_games_won: "Айг|айрата:",
      player_state_best_score: "Йбзидздзу асчет:",
      player_state_best_time: "Заман бзи:",
      player_state_moves: "Ацараква:",
      player_state_achievement: "Аг|атгараква:",
      //   },
      //   gameInterface: {
      blinking_text: "Ак|артква азк|к|ра",
      undo_btn_aria_title: "Аход аныххра",
      new_game_ctr_btn: "Къвмарра ш|ыц",
      hint_btn: "Аподсказка",
      menu_btn: "Ахъвмарра аменю",
      //   },
      new_game: "хъвмарра ш|ыц",
      restart: "Ш|ыцта",
      hint: "Аподсказка",
      win: "Айгъ|айра!",
      moves: "Аходква",
      time: "Азаман",
      add_name: "Уыхьыз/быхьыз таг|вы",
      add_name_btn: "Ахъвмарра алагара",
      add_name_skip: "Аг|вщтра",
      player_name: "Ахъвмарраг|в",
      game_name: "Х|вусынка",
      // ... другие UI-тексты
    },
    plurals: {
      хусынок: (count) => {
        const lastDigit = count % 10;
        const lastTwoDigits = count % 100;
        if (lastTwoDigits >= 11 && lastTwoDigits <= 19)
          return `${count} х|вусынк|ак|`;
        switch (lastDigit) {
          case 1:
            return `${count} х|вусынк|ак|`;
          case 2:
          case 3:
          case 4:
            return `${count} х|вусынк|ак|`;
          default:
            return `${count} х|вусынк|ата`;
        }
      },
      // ... другие слова с плюрализацией
    },
  },
  // Другие языки (например, турецкий)
  tr: {
    ui: {
      player_name_placeholder: "Oyuncu",
      ru_btn: "Rus dili",
      en_btn: "Ingilizce dili",
      tr_btn: "Dilimiz",
      abaza_btn: "Abaza dili",
      btnBackToMenu: "Menüye geri dön",
      //   menuBtns: {
      menu_btn_new_game: "Yeni oyun",
      menu_btn_continue_game: "Devam etmek",
      menu_btn_settings_game: "Ayarlar",
      menu_btn_state_player: "İstatistikler",
      menu_btn_shop: "Mağaza",
      menu_btn_exit_game: "Çıkış",
      //   },
      //   settinsGame: {
      setting_title: "Ayarlar",
      music_volume: "Hacim:",
      span_sound_off_in: "Sesler:",
      c_setting_item: "Karmaşıklık:",
      option_easy: "Işık",
      option_medium: "Ortalama",
      option_hard: "Karmaşık",
      ln_setting_item: "Dil",

      //   },
      //   shopGame: {
      shop_title: "Mağaza",
      balance: "Denge: ",
      shop_btn_apply: "Uygula",
      shop_btn_buy: "Satın almak",
      // balanceTextContentH: "",
      btn_card_face: "Yüz",
      btn_card_shirt: "Gömlek",
      btn_card_fon: "Arka plan",
      //   },
      //   playerState: {
      player_state_title: "Oyuncu istatistikleri",
      player_state_name: "İsim:",
      player_state_coins: "Husynki:",
      player_state_games_played: "Oynanan oyunlar:",
      player_state_games_won: "Kazanılan oyunlar:",
      player_state_best_score: "En iyi skor:",
      player_state_best_time: "En iyi zaman:",
      player_state_moves: "Hamleler:",
      player_state_achievement: "Başarı:",
      //   },
      //   gameInterface: {
      blinking_text: "Kartları topla",
      undo_btn_aria_title: "Geri alma hareketi",
      new_game_ctr_btn: "Yeni oyun",
      hint_btn: "İpucu",
      menu_btn: "Oyun menüsü",
      //   },
      new_game: "Yeni oyun",
      restart: "Tekrar",
      hint: "İpucu",
      win: "Zafer!",
      moves: "Hamleler",
      time: "Zaman",
      add_name: "Adınızı girin",
      addName_btn: "Oyunu başlat",
      add_name_skip: "Atlamak",
      player_name: "Oyuncu",
      game_name: "Khusynka",
      // ... другие UI-тексты
    },
    plurals: {
      husynok: (count) => {
        const lastDigit = count % 10;
        const lastTwoDigits = count % 100;
        if (lastTwoDigits >= 11 && lastTwoDigits <= 19)
          return `${count} husynok`;
        switch (lastDigit) {
          case 1:
            return `${count} husynok`;
          case 2:
          case 3:
          case 4:
            return `${count} husynok`;
          default:
            return `${count} husynok`;
        }
      },
      // ... другие слова с плюрализацией
    },
  },
};
