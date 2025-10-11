import { AudioName } from "../utils/Constants.js";
import { AudioAchievements } from "../configs/AchievementsConfig.js";
import { GameEvents } from "../utils/Constants.js";

export class AudioManager {
  constructor(eventManager, stateManager) {
    this.eventManager = eventManager;
    this.stateManager = stateManager;
    this.sounds = new Map();
    this.backgroundMusic = null;
    this.settings = {
      soundEnabled: true,
      musicVolume: 0.7,
      effectsVolume: 0.9,
    };

    this.init();
  }

  init() {
    // this.loadSettings();
    this.preloadSounds();
    this.setupEventListeners();
  }

  preloadSounds() {
    // Основные звуковые эффекты
    this.addSound(AudioName.CLICK, "./src/assets/sounds/click.mp3");
    this.addSound(AudioName.CARD_FLIP, "./src/assets/sounds/card-flip.mp3");
    this.addSound(AudioName.CARD_MOVE, "./src/assets/sounds/card-move.mp3");
    this.addSound(AudioName.WIN, "./src/assets/sounds/win.mp3");
    this.addSound(AudioName.INFO, "./src/assets/sounds/info.mp3");
    this.addSound(AudioName.UP_SCORE, "./src/assets/sounds/up-score.mp3");

    this.addSound(
      AudioAchievements.UP_ACH,
      "./src/assets/sounds/up-achievements.mp3"
    );

    // this.addSound("error", "./src/assets/sounds/error.mp3");

    // Фоновая музыка
    this.backgroundMusic = this.createAudio(
      "./src/assets/sounds/background.mp3",
      true
    );
    this.backgroundMusic.volume = this.stateManager.state.settings.musicVolume;
  }

  setupEventListeners() {
    this.eventManager.on("audio:toggle", (enabled) =>
      this.toggleAllSounds(enabled)
    );
    this.eventManager.on("music:volume", (volume) =>
      this.setMusicVolume(volume)
    );
    this.eventManager.on("effects:volume", (volume) =>
      this.setEffectsVolume(volume)
    );

    this.eventManager.on(GameEvents.SET_SOUND_TOGGLE, (enabled) =>
      this.toggleAllSounds(enabled)
    );

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

    this.eventManager.on("game:start", () => this.playMusic());
    this.eventManager.on("game:pause", () => this.pauseMusic());
    this.eventManager.on("game:resume", () => this.resumeMusic());
    this.eventManager.on("game:exit", () => this.stopMusic());
    this.eventManager.on(GameEvents.SETTINGS_MUSIC_VOLUME, () =>
      this.setMusicVolume()
    );
  }

  loadSettings() {
    const savedSettings =
      JSON.parse(localStorage.getItem("audioSettings")) || {};
    this.settings = {
      ...this.settings,
      ...savedSettings,
    };
  }

  saveSettings() {
    localStorage.setItem("audioSettings", JSON.stringify(this.settings));
  }

  addSound(name, path, loop = false) {
    this.sounds.set(name, this.createAudio(path, loop));
  }

  createAudio(path, loop = false) {
    const audio = new Audio(path);
    audio.loop = loop;
    audio.preload = "auto";
    return audio;
  }

  play(name) {
    console.log('play(name): ', name);
    
    if (
      // !this.stateManager.state.settings.soundEnabled ||
      !this.sounds.has(name)
    )
      return;

    try {
      const sound = this.sounds.get(name);
      sound.currentTime = 0;
      sound.volume = this.stateManager.state.settings.effectsVolume;
      sound
        .play()
        .catch((e) => console.error(`Error playing sound ${name}:`, e));
    } catch (e) {
      console.error(`Error with sound ${name}:`, e);
    }
  }

  playMusic() {
    if (!this.stateManager.state.settings.soundEnabled || !this.backgroundMusic)
      return;

    try {
      this.backgroundMusic.currentTime = 0;
      this.backgroundMusic
        .play()
        .catch((e) => console.error("Error playing music:", e));
    } catch (e) {
      console.error("Music error:", e);
    }
  }

  stopMusic() {
    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
      this.backgroundMusic.currentTime = 0;
    }
  }

  pauseMusic() {
    if (this.backgroundMusic && !this.backgroundMusic.paused) {
      this.backgroundMusic.pause();
    }
  }

  resumeMusic() {
    if (this.backgroundMusic && this.stateManager.state.settings.soundEnabled) {
      this.backgroundMusic
        .play()
        .catch((e) => console.error("Error resuming music:", e));
    }
  }

  toggleAllSounds(enabled) {
    enabled ? this.resumeMusic() : this.pauseMusic();
    // this.saveSettings();
  }

  setMusicVolume() {
    if (this.backgroundMusic) {
      this.backgroundMusic.volume =
        this.stateManager.state.settings.musicVolume;
    }
  }

  setEffectsVolume(volume) {
    volume = Math.max(0, Math.min(1, volume));
    this.stateManager.state.settings.effectsVolume = volume;
    // this.saveSettings();
  }

  getState() {
    return { ...this.stateManager.state.settings };
  }
}
