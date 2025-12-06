import { AudioName } from "../utils/Constants.js";
import { AudioAchievements } from "../configs/AchievementsConfig.js";
import { GameEvents } from "../utils/Constants.js";

export class AudioManager {
  constructor(eventManager, stateManager) {
    this.eventManager = eventManager;
    this.stateManager = stateManager;

    // Проверяем, что Howler загружен
    if (typeof Howl === "undefined") {
      console.error("Howler.js not loaded! Add CDN to your HTML");
      return;
    }

    // Коллекция звуков
    this.sounds = new Map();

    // Фоновая музыка
    this.backgroundMusic = null;

    // Простая инициализация
    // this.setupAudioUnlock();
    this.preloadSounds();
    this.setupEventListeners();
  }

  /**
   * Разблокировка аудио на iOS/Android
   */
  // setupAudioUnlock() {
  //   // Howler сам управляет разблокировкой, но помогаем ему
  //   const unlockHandler = () => {
  //     if (Howler.ctx && Howler.ctx.state === "suspended") {
  //       Howler.ctx.resume();
  //     }

  //     // Проигрываем тихий звук для активации аудио
  //     this.playUnlockSound();
  //   };

  //   // Вешаем на основные жесты
  //   const events = ["click", "touchstart", "mousedown"];
  //   events.forEach((event) => {
  //     document.addEventListener(event, unlockHandler, { once: true });
  //   });
  // }

  /**
   * Предзагрузка звуков
   */
  preloadSounds() {
    console.log("Preloading sounds with Howler...");

    // Основные звуки - создаем с пулом для одновременного воспроизведения
    this.createSound(AudioName.CLICK, "./src/assets/sounds/click.mp3", 0.3, 2);
    this.createSound(
      AudioName.CARD_FLIP,
      "./src/assets/sounds/card-flip.mp3",
      0.5,
      3
    );
    this.createSound(
      AudioName.CARD_MOVE,
      "./src/assets/sounds/card-move.mp3",
      0.4,
      3
    );
    this.createSound(AudioName.WIN, "./src/assets/sounds/win.mp3", 0.8, 1);
    this.createSound(AudioName.INFO, "./src/assets/sounds/info.mp3", 0.6, 1);
    this.createSound(
      AudioName.UP_SCORE,
      "./src/assets/sounds/up-score.mp3",
      0.6,
      2
    );
    this.createSound(
      AudioAchievements.UP_ACH,
      "./src/assets/sounds/up-achievements.mp3",
      0.7,
      1
    );

    // Фоновая музыка
    this.createBackgroundMusic();
  }

  /**
   * Создание звука с настройками
   */
  createSound(name, path, volume = 0.5, poolSize = 3) {
    const sound = new Howl({
      src: [path],
      volume: volume,
      preload: true,
      pool: poolSize, // Количество экземпляров для одновременного воспроизведения
      html5: false, // Используем Web Audio API когда возможно
      onload: () => {
        console.log(`✓ Sound loaded: ${name}`);
      },
      onloaderror: (id, error) => {
        console.warn(`✗ Failed to load ${name}:`, error);
      },
    });

    this.sounds.set(name, sound);
  }

  /**
   * Создание фоновой музыки
   */
  createBackgroundMusic() {
    this.backgroundMusic = new Howl({
      src: ["./src/assets/sounds/background.mp3"],
      volume: this.stateManager.getMusicVolume() || 0.5,
      loop: true,
      preload: true,
      // html5: true, // Для музыки лучше использовать HTML5 Audio
      html5: false,
      onplayerror: () => {
        console.log("Background music blocked - needs user interaction");
      },
    });
  }

  /**
   * Воспроизведение звука
   */
  play(name, options = {}) {
    // Проверяем включены ли звуки
    if (!this.stateManager.getSoundEnabled()) {
      return null;
    }

    // Получаем звук
    const sound = this.sounds.get(name);
    if (!sound) {
      console.warn(`Sound not found: ${name}`);
      return null;
    }

    const { volume = null, rate = 1.0, onEnd = null } = options;

    try {
      // Воспроизводим звук
      const soundId = sound.play();

      // Применяем настройки если есть
      if (volume !== null) {
        sound.volume(volume, soundId);
      }

      if (rate !== 1.0) {
        sound.rate(rate, soundId);
      }

      // Колбэк при окончании
      if (onEnd) {
        sound.once("end", onEnd, soundId);
      }

      return {
        id: soundId,
        stop: () => sound.stop(soundId),
      };
    } catch (error) {
      console.error(`Error playing "${name}":`, error);
      return null;
    }
  }

  /**
   * Тихий звук для разблокировки аудио
   */
  // playUnlockSound() {
  //   // Создаем очень тихий звук для активации аудио контекста
  //   const silentSound = new Howl({
  //     src: [
  //       "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQ...",
  //     ],
  //     volume: 0.001,
  //     onend: () => silentSound.unload(),
  //   });

  //   silentSound.play();
  // }

  /**
   * Упрощенные методы для частых звуков
   */
  playCardMove() {
    return this.play(AudioName.CARD_MOVE, { volume: 0.4 });
  }

  playCardFlip() {
    return this.play(AudioName.CARD_FLIP, { volume: 0.5 });
  }

  playClick() {
    return this.play(AudioName.CLICK, { volume: 0.3 });
  }

  playWin() {
    return this.play(AudioName.WIN, { volume: 0.8 });
  }

  /**
   * Управление фоновой музыкой
   */
  playBackgroundMusic() {
    if (
      !this.stateManager.state.settings.soundEnabled ||
      !this.backgroundMusic
    ) {
      return;
    }

    try {
      if (!this.backgroundMusic.playing()) {
        this.backgroundMusic.play();
      }
    } catch (error) {
      console.log("Background music play failed:", error.message);
    }
  }

  stopBackgroundMusic() {
    if (this.backgroundMusic) {
      this.backgroundMusic.stop();
    }
  }

  pauseBackgroundMusic() {
    if (this.backgroundMusic && this.backgroundMusic.playing()) {
      this.backgroundMusic.pause();
    }
  }

  setMusicVolume(volume) {
    Howler.volume(volume); // Глобальная громкость

    if (this.backgroundMusic) {
      this.backgroundMusic.volume(volume);
    }
  }

  setEffectsVolume(volume) {
    // Устанавливаем громкость для всех звуков эффектов
    this.sounds.forEach((sound) => {
      sound.volume(volume);
    });
  }

  /**
   * Настройка слушателей событий
   */
  setupEventListeners() {
    // Основные звуки игры
    this.eventManager.on(GameEvents.AUDIO_CARD_CLICK, () => this.playClick());

    this.eventManager.on(GameEvents.AUDIO_CARD_FLIP, () => this.playCardFlip());

    this.eventManager.on(GameEvents.AUDIO_CARD_MOVE, () => this.playCardMove());

    this.eventManager.on(GameEvents.AUDIO_UP_SCORE, () =>
      this.play(AudioName.UP_SCORE)
    );

    this.eventManager.on(GameEvents.AUDIO_UP_ACH, () =>
      this.play(AudioAchievements.UP_ACH)
    );

    // Музыка
    this.eventManager.on(GameEvents.SET_MUSIC_TOGGLE, (enabled) => {
      if (enabled) {
        this.playBackgroundMusic();
      } else {
        this.stopBackgroundMusic();
      }
    });

    // Громкость
    this.eventManager.on(GameEvents.SETTINGS_MUSIC_VOLUME, () => {
      this.setMusicVolume(this.stateManager.getMusicVolume());
    });

    // Игровые события
    this.eventManager.on(GameEvents.GAME_START, () => {
      if (this.stateManager.state.settings.musicEnabled) {
        setTimeout(() => this.playBackgroundMusic(), 500);
      }
    });

    this.eventManager.on(GameEvents.GAME_PAUSE, () => {
      this.pauseBackgroundMusic();
    });

    this.eventManager.on(GameEvents.GAME_RESUME, () => {
      if (this.stateManager.state.settings.musicEnabled) {
        this.playBackgroundMusic();
      }
    });
  }

  /**
   * Получение звука для внешнего использования
   */
  getSound(name) {
    const sound = this.sounds.get(name);
    console.log('sound: ', sound);
    
    if (!sound) return null;

    return {
      name: name,
      play: (options) => this.play(name, options),
      howl: sound,
      isLoaded: () => sound.state() === "loaded",
      duration: () => sound.duration(),
      // rate: (speed, soundId) => sound.rate(speed, soundId)
    };
  }

  /**
   * Очистка ресурсов
   */
  destroy() {
    // Останавливаем и выгружаем все звуки
    this.sounds.forEach((sound) => {
      sound.stop();
      sound.unload();
    });

    if (this.backgroundMusic) {
      this.backgroundMusic.stop();
      this.backgroundMusic.unload();
    }

    this.sounds.clear();

    console.log("AudioManager destroyed");
  }
}
