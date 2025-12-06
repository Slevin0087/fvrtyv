import { AudioName } from "../utils/Constants.js";
import { AudioAchievements } from "../configs/AchievementsConfig.js";
import { GameEvents } from "../utils/Constants.js";

export class AudioManager {
  constructor(eventManager, stateManager) {
    this.eventManager = eventManager;
    this.stateManager = stateManager;

    // Web Audio API контекст
    this.audioContext = null;
    this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    this.isAndroid = /Android/.test(navigator.userAgent);
    this.isMobile = this.isIOS || this.isAndroid;

    // Коллекции для звуков
    this.sounds = new Map(); // { name: AudioBuffer }
    this.activeSources = new Set(); // Активные источники звука

    // Фоновые музыки
    this.backgroundMusicSource = null;
    this.backgroundMusicBuffer = null;

    // Состояние инициализации
    this.isInitialized = false;
    this.isContextSuspended = false;
    this.pendingActions = []; // Действия, ожидающие инициализации

    // Gain nodes для контроля громкости
    this.masterGain = null;
    this.musicGain = null;
    this.effectsGain = null;

    this.settings = {
      soundEnabled: true,
      musicVolume: 0.7,
      effectsVolume: 0.9,
    };

    // Настройки по умолчанию
    this.defaultEffectsVolume = 0.9;
    this.defaultMusicVolume = 0.7;

    // Инициализация без создания AudioContext
    this.setupEventListeners();
    this.setupGestureListeners();

    console.log("AudioManager created. Waiting for user gesture...");
  }

  // ==================== ИНИЦИАЛИЗАЦИЯ ====================

  /**
   * Настройка слушателей жестов для активации аудио
   */
  setupGestureListeners() {
    // Жесты, которые активируют аудио
    const gestures = [
      "click",
      "touchstart",
      "keydown",
      "mousedown",
      "pointerdown",
      "touchend",
    ];

    const initializeOnGesture = (event) => {
      // Инициализируем только один раз
      if (!this.isInitialized) {
        console.log(`Initializing audio on ${event.type} gesture`);
        this.initializeAudioContext();

        // Удаляем все обработчики после инициализации
        gestures.forEach((gesture) => {
          document.removeEventListener(gesture, initializeOnGesture);
        });
      }

      // Для iOS также resume если контекст suspended
      if (this.audioContext && this.audioContext.state === "suspended") {
        this.resumeAudioContext();
      }
    };

    // Добавляем обработчики на все жесты
    gestures.forEach((gesture) => {
      document.addEventListener(gesture, initializeOnGesture, {
        passive: true,
        capture: true,
      });
    });

    // Также пробуем инициализировать при загрузке DOM
    if (document.readyState === "complete") {
      this.tryInitializeOnLoad();
    } else {
      window.addEventListener("load", () => this.tryInitializeOnLoad());
    }
  }

  /**
   * Попытка инициализации при загрузке страницы
   */
  tryInitializeOnLoad() {
    // Если это не мобильное устройство, можно попробовать инициализировать сразу
    if (!this.isMobile) {
      setTimeout(() => {
        if (!this.isInitialized) {
          console.log("Attempting auto-initialization for desktop");
          this.initializeAudioContext();
        }
      }, 1000);
    }
  }

  /**
   * Основная инициализация AudioContext
   */
  async initializeAudioContext() {
    if (this.isInitialized) {
      return true;
    }

    try {
      // Создаем AudioContext
      this.audioContext = new (window.AudioContext ||
        window.webkitAudioContext)({
        latencyHint: "interactive", // Для низкой задержки
        sampleRate: 44100,
      });

      console.log(`AudioContext created. State: ${this.audioContext.state}`);

      // Настраиваем аудио граф
      this.setupAudioGraph();

      // Загружаем звуки
      await this.preloadSounds();

      // Загружаем фоновую музыку
      await this.loadBackgroundMusic();

      this.isInitialized = true;
      this.isContextSuspended = this.audioContext.state === "suspended";

      // Выполняем отложенные действия
      this.processPendingActions();

      // Воспроизводим тихий звук для "разблокировки" на iOS
      if (this.isIOS) {
        this.playUnlockSound();
      }

      console.log("AudioManager fully initialized");
      return true;
    } catch (error) {
      console.error("Failed to initialize AudioContext:", error);
      return false;
    }
  }

  /**
   * Настройка аудио графа (цепочки обработки звука)
   */
  setupAudioGraph() {
    if (!this.audioContext) return;

    try {
      // Создаем главный gain node
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);

      // Создаем отдельные gain nodes для музыки и эффектов
      this.musicGain = this.audioContext.createGain();
      this.effectsGain = this.audioContext.createGain();

      // Подключаем их к главному gain node
      this.musicGain.connect(this.masterGain);
      this.effectsGain.connect(this.masterGain);

      // Устанавливаем начальные значения громкости
      this.updateVolumes();

      console.log("Audio graph setup complete");
    } catch (error) {
      console.error("Failed to setup audio graph:", error);
    }
  }

  /**
   * Восстановление AudioContext если он в состоянии suspended
   */
  async resumeAudioContext() {
    if (!this.audioContext) return false;

    if (this.audioContext.state === "suspended") {
      try {
        await this.audioContext.resume();
        this.isContextSuspended = false;
        console.log("AudioContext resumed successfully");
        return true;
      } catch (error) {
        console.error("Failed to resume AudioContext:", error);
        return false;
      }
    }

    return true;
  }

  /**
   * Выполнение отложенных действий после инициализации
   */
  processPendingActions() {
    while (this.pendingActions.length > 0) {
      const action = this.pendingActions.shift();
      try {
        action();
      } catch (error) {
        console.error("Error executing pending action:", error);
      }
    }
  }

  // ==================== ЗАГРУЗКА ЗВУКОВ ====================

  /**
   * Предзагрузка всех звуковых эффектов
   */
  async preloadSounds() {
    if (!this.audioContext) {
      this.pendingActions.push(() => this.preloadSounds());
      return;
    }

    console.log("Preloading sounds...");

    const soundList = [
      { name: AudioName.CLICK, path: "./src/assets/sounds/click.mp3" },
      { name: AudioName.CARD_FLIP, path: "./src/assets/sounds/card-flip.mp3" },
      { name: AudioName.CARD_MOVE, path: "./src/assets/sounds/card-move.mp3" },
      { name: AudioName.WIN, path: "./src/assets/sounds/win.mp3" },
      { name: AudioName.INFO, path: "./src/assets/sounds/info.mp3" },
      { name: AudioName.UP_SCORE, path: "./src/assets/sounds/up-score.mp3" },
      {
        name: AudioAchievements.UP_ACH,
        path: "./src/assets/sounds/up-achievements.mp3",
      },
    ];

    // Параллельная загрузка с ограничением одновременных запросов
    const batchSize = 3;
    for (let i = 0; i < soundList.length; i += batchSize) {
      const batch = soundList.slice(i, i + batchSize);
      const promises = batch.map((sound) =>
        this.loadSoundBuffer(sound.name, sound.path)
      );

      try {
        await Promise.all(promises);
        console.log(
          `Loaded batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(
            soundList.length / batchSize
          )}`
        );
      } catch (error) {
        console.error("Error loading sound batch:", error);
      }
    }

    console.log(`All sounds preloaded. Total: ${this.sounds.size}`);
  }

  /**
   * Загрузка звукового файла в AudioBuffer
   */
  async loadSoundBuffer(name, path) {
    if (this.sounds.has(name)) {
      return this.sounds.get(name);
    }

    try {
      // Добавляем timestamp для избежания кеширования при разработке

      const isLocalhost =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";

      // const cacheBuster =
      //   process.env.NODE_ENV === "development" ? `?t=${Date.now()}` : "";

      const cacheBuster = isLocalhost ? `?t=${Date.now()}` : "";

      const fullPath = `${path}${cacheBuster}`;

      const response = await fetch(fullPath);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

      this.sounds.set(name, audioBuffer);
      console.log(
        `✓ Sound loaded: ${name} (${audioBuffer.duration.toFixed(2)}s)`
      );

      return audioBuffer;
    } catch (error) {
      console.error(`✗ Failed to load sound "${name}":`, error);

      // Создаем заглушку для отсутствующего звука
      const dummyBuffer = this.createDummySound();
      this.sounds.set(name, dummyBuffer);

      return dummyBuffer;
    }
  }

  /**
   * Создание заглушки для отсутствующего звука
   */
  createDummySound(duration = 0.1) {
    if (!this.audioContext) return null;

    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(
      1,
      sampleRate * duration,
      sampleRate
    );
    const channelData = buffer.getChannelData(0);

    // Создаем тихий звук
    for (let i = 0; i < channelData.length; i++) {
      channelData[i] = Math.random() * 0.01; // Очень тихий шум
    }

    return buffer;
  }

  /**
   * Загрузка фоновой музыки
   */
  async loadBackgroundMusic() {
    if (!this.audioContext) {
      this.pendingActions.push(() => this.loadBackgroundMusic());
      return;
    }

    try {
      const response = await fetch("./src/assets/sounds/background.mp3");
      const arrayBuffer = await response.arrayBuffer();
      this.backgroundMusicBuffer = await this.audioContext.decodeAudioData(
        arrayBuffer
      );
      console.log("Background music loaded");
    } catch (error) {
      console.error("Failed to load background music:", error);
      this.backgroundMusicBuffer = null;
    }
  }

  // ==================== ВОСПРОИЗВЕДЕНИЕ ====================

  /**
   * Основной метод воспроизведения звука
   */
  play(name, options = {}) {
    // Проверяем доступность звука
    if (!this.stateManager.getSoundEnabled()) {
      return null;
    }

    // Если еще не инициализирован, добавляем в очередь
    if (!this.isInitialized) {
      console.warn(`Audio not initialized. Queuing sound: ${name}`);
      this.pendingActions.push(() => this.play(name, options));
      return null;
    }

    // Проверяем состояние контекста
    if (!this.audioContext || this.audioContext.state === "closed") {
      console.error("AudioContext is closed");
      return null;
    }

    if (this.audioContext.state === "suspended") {
      console.warn(`AudioContext suspended. Cannot play: ${name}`);
      this.pendingActions.push(() => this.play(name, options));
      this.resumeAudioContext();
      return null;
    }

    // Проверяем наличие звука
    if (!this.sounds.has(name)) {
      console.warn(`Sound not found: ${name}`);
      return null;
    }

    try {
      const buffer = this.sounds.get(name);
      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;

      // Применяем опции
      const {
        volume = this.stateManager.getEffectsVolume() ||
          this.defaultEffectsVolume,
        playbackRate = 1.0,
        loop = false,
        onEnded = null,
      } = options;

      source.playbackRate.value = playbackRate;
      source.loop = loop;

      // Создаем gain node для контроля громкости
      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = volume;

      // Подключаем цепочку: source → gainNode → effectsGain
      source.connect(gainNode);
      gainNode.connect(this.effectsGain);

      // Запускаем воспроизведение
      source.start(0);

      // Управление завершением
      const cleanup = () => {
        if (this.activeSources.has(source)) {
          this.activeSources.delete(source);
        }
        if (onEnded) {
          onEnded();
        }
      };

      source.addEventListener("ended", cleanup);
      this.activeSources.add(source);

      // Возвращаем объект для управления звуком
      return {
        stop: () => {
          try {
            if (source.playbackState !== "finished") {
              source.stop(0);
            }
            cleanup();
          } catch (e) {
            // Источник уже остановлен
          }
        },
        setVolume: (newVolume) => {
          gainNode.gain.value = newVolume;
        },
        setPlaybackRate: (rate) => {
          source.playbackRate.value = rate;
        },
        isPlaying: () => this.activeSources.has(source),
        name: name,
      };
    } catch (error) {
      console.error(`Error playing sound "${name}":`, error);
      return null;
    }
  }

  /**
   * Воспроизведение короткого звука для разблокировки аудио на iOS
   */
  playUnlockSound() {
    if (!this.audioContext || this.audioContext.state !== "running") {
      return;
    }

    try {
      // Создаем очень короткий тихий звук
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.value = 440; // Ля первой октавы
      gainNode.gain.value = 0.0001; // Практически неслышно

      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + 0.01);

      console.log("Unlock sound played");
    } catch (error) {
      // Игнорируем ошибки при разблокировке
    }
  }

  // ==================== ФОНОВАЯ МУЗЫКА ====================

  /**
   * Воспроизведение фоновой музыки
   */
  playBackgroundMusic(loop = true) {
    if (!this.stateManager.state.settings.soundEnabled) {
      return;
    }

    if (!this.isInitialized) {
      this.pendingActions.push(() => this.playBackgroundMusic(loop));
      return;
    }

    // Останавливаем текущую музыку если она играет
    this.stopBackgroundMusic();

    if (!this.backgroundMusicBuffer || !this.audioContext) {
      console.warn("Background music not available");
      return;
    }

    try {
      this.backgroundMusicSource = this.audioContext.createBufferSource();
      this.backgroundMusicSource.buffer = this.backgroundMusicBuffer;
      this.backgroundMusicSource.loop = loop;

      this.backgroundMusicSource.connect(this.musicGain);
      this.backgroundMusicSource.start(0);

      console.log("Background music started");
    } catch (error) {
      console.error("Failed to play background music:", error);
      this.backgroundMusicSource = null;
    }
  }

  /**
   * Остановка фоновой музыки
   */
  stopBackgroundMusic() {
    if (this.backgroundMusicSource) {
      try {
        this.backgroundMusicSource.stop(0);
      } catch (e) {
        // Уже остановлено
      }
      this.backgroundMusicSource = null;
      console.log("Background music stopped");
    }
  }

  /**
   * Пауза всей аудио системы
   */
  pauseAll() {
    if (this.audioContext && this.audioContext.state === "running") {
      this.audioContext.suspend();
      this.isContextSuspended = true;
      console.log("Audio system paused");
    }
  }

  /**
   * Возобновление всей аудио системы
   */
  resumeAll() {
    if (this.audioContext && this.audioContext.state === "suspended") {
      this.audioContext.resume();
      this.isContextSuspended = false;
      console.log("Audio system resumed");
    }
  }

  // ==================== УПРАВЛЕНИЕ ====================

  /**
   * Обновление уровней громкости
   */
  updateVolumes() {
    if (!this.musicGain || !this.effectsGain) return;

    const now = this.audioContext ? this.audioContext.currentTime : 0;

    // Громкость музыки
    const musicVolume =
      this.stateManager.getMusicVolume() || this.defaultMusicVolume;
    this.musicGain.gain.setValueAtTime(musicVolume, now);

    // Громкость эффектов
    const effectsVolume =
      this.stateManager.getEffectsVolume() || this.defaultEffectsVolume;
    this.effectsGain.gain.setValueAtTime(effectsVolume, now);

    console.log(
      `Volumes updated - Music: ${musicVolume}, Effects: ${effectsVolume}`
    );
  }

  /**
   * Остановка всех звуков
   */
  stopAllSounds() {
    // Останавливаем активные источники эффектов
    this.activeSources.forEach((source) => {
      try {
        source.stop(0);
      } catch (e) {
        // Уже остановлено
      }
    });
    this.activeSources.clear();

    // Останавливаем фоновую музыку
    this.stopBackgroundMusic();

    console.log("All sounds stopped");
  }

  /**
   * Получение информации о звуке
   */
  getSound(name) {
    if (!this.sounds.has(name)) {
      console.warn(`Sound "${name}" not found`);
      return null;
    }

    const buffer = this.sounds.get(name);

    return {
      name: name,
      play: (options = {}) => this.play(name, options),
      isLoaded: () => true,
      getDuration: () => buffer.duration,
      getBuffer: () => buffer,
      getInfo: () => ({
        name: name,
        duration: buffer.duration,
        sampleRate: buffer.sampleRate,
        channels: buffer.numberOfChannels,
      }),
    };
  }

  // ==================== СЛУШАТЕЛИ СОБЫТИЙ ====================

  setupEventListeners() {
    // Музыка
    this.eventManager.on(GameEvents.SET_MUSIC_TOGGLE, (enabled) =>
      this.toggleMusic(enabled)
    );

    // Звуковые эффекты
    this.eventManager.on(GameEvents.AUDIO_CARD_CLICK, () =>
      this.play(AudioName.CLICK)
    );

    this.eventManager.on(GameEvents.AUDIO_CARD_FLIP, () =>
      this.play(AudioName.CARD_FLIP)
    );

    this.eventManager.on(GameEvents.AUDIO_CARD_MOVE, () =>
      this.play(AudioName.CARD_MOVE)
    );

    this.eventManager.on(GameEvents.AUDIO_UP_SCORE, () =>
      this.play(AudioName.UP_SCORE)
    );

    this.eventManager.on(GameEvents.AUDIO_UP_ACH, () =>
      this.play(AudioAchievements.UP_ACH)
    );

    this.eventManager.on(GameEvents.SETTINGS_MUSIC_VOLUME, () =>
      this.updateVolumes()
    );

    // Игровые события
    this.eventManager.on(GameEvents.GAME_START, () => {
      if (this.stateManager.state.settings.musicEnabled) {
        this.playBackgroundMusic();
      }
    });

    this.eventManager.on(GameEvents.GAME_PAUSE, () => {
      this.pauseAll();
    });

    this.eventManager.on(GameEvents.GAME_RESUME, () => {
      this.resumeAll();
    });

    this.eventManager.on(GameEvents.GAME_WIN, () => {
      this.play(AudioName.WIN, { volume: 1.0 });
      setTimeout(() => this.stopBackgroundMusic(), 500);
    });
  }

  /**
   * Переключение музыки
   */
  toggleMusic(enabled) {
    if (enabled) {
      this.playBackgroundMusic();
    } else {
      this.stopBackgroundMusic();
    }
  }

  // ==================== УТИЛИТЫ ====================

  /**
   * Получение статуса аудио системы
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      contextState: this.audioContext ? this.audioContext.state : "not created",
      contextSuspended: this.isContextSuspended,
      soundsLoaded: this.sounds.size,
      activeSources: this.activeSources.size,
      backgroundMusicPlaying: !!this.backgroundMusicSource,
      isMobile: this.isMobile,
      isIOS: this.isIOS,
      pendingActions: this.pendingActions.length,
    };
  }

  /**
   * Логирование статуса (для отладки)
   */
  logStatus() {
    const status = this.getStatus();
    console.group("AudioManager Status");
    console.log("Initialized:", status.initialized);
    console.log("Context State:", status.contextState);
    console.log("Sounds Loaded:", status.soundsLoaded);
    console.log("Active Sources:", status.activeSources);
    console.log("Pending Actions:", status.pendingActions);
    console.log(
      "Platform:",
      status.isIOS ? "iOS" : status.isMobile ? "Android" : "Desktop"
    );
    console.groupEnd();
  }

  /**
   * Очистка ресурсов
   */
  destroy() {
    this.stopAllSounds();

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.sounds.clear();
    this.activeSources.clear();
    this.pendingActions = [];
    this.isInitialized = false;

    console.log("AudioManager destroyed");
  }
}
