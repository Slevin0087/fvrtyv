# Copilot Instructions for Klondike Solitaire Game

## Project Overview
This is a **Klondike Solitaire card game** built with vanilla JavaScript and a custom event-driven architecture. The game features multiple difficulty levels, achievements, a shop system, undo/hints mechanics, and multi-language support.

## Core Architecture

### Event-Driven System (Foundation)
- **EventManager** (`src/managers/EventManager.js`): Central pub/sub system with sync (`on`/`emit`) and async (`onAsync`/`emitAsync`) modes
- All inter-component communication flows through `GameEvents` constants (`src/utils/Constants.js`)
- Components subscribe to events and emit actions; **never call methods directly between managers**
- Example: Hint usage triggers `HINT_USED` → StateManager updates count → UI re-renders

### State Management Pattern
- **StateManager** (`src/managers/StateManager.js`): Single source of truth for game state (535 lines, complex nested state)
- State includes: game progress, player stats, achievements, UI flags, animations states
- Always read state via `this.stateManager.state`, never cache old state
- State mutations emit events which trigger cascading updates

### Initialization Flow
Entry point: `src/main.js` → `GameInit.init()` initializes in strict order:
1. EventManager, Storage, StateManager
2. Translator, AutoMoveManager, UIManager
3. Systems (Logic, Rendering, UI Systems)
4. Final event: `GameEvents.SET_NAME_IN_INPUT`

**Critical**: Respect initialization order—systems depend on previous systems being ready.

## Key Components & Patterns

### Card Model (`src/core/Card.js`)
- Position metadata: `card.positionData` tracks parent container, rank, offset in stack
- Comparison methods: `isNextInSequence()`, `isSameSuit()`, `isOppositeColor()` (Klondike rules)
- DOM binding: `card.domElement` points to rendered HTML element

### Card Containers (Tableau, Foundation, Stock, Waste)
- Each container validates moves before acceptance (e.g., Foundation only accepts same suit in rank order)
- Containers managed by `CardsSystem` (`src/systems/uiSystems/CardsSystem.js`)
- GameConfig defines container names: `tableau`, `foundation`, `waste`, `stock`

### UI Page Hierarchy
- **UIPage** (`src/ui/UIPage.js`): Base class for all pages
- **UIGamePage** (`src/ui/UIGamePage.js`, 1105 lines): Main gameplay interface with 50+ element references
  - ⚠️ **Anti-patterns here**: God Object (too many responsibilities), 600+ lines commented confetti code, direct state mutations in hintUsed()
  - Controls: score, time, moves, undo/hint counters, modals (restart, game results), notifications/toasts
- Pages extend UIPage and override `setupEventListeners()`, `show()`, `hide()`
- **BaseModal** (`src/ui/BaseModal.js`): Generic modal creation from config

### Systems Organization

#### Logic Systems (`src/systems/logicSystems/`)
- **GameSetupSystem**: Initial deck creation and distribution
- **CardMovementSystem**: Validates and executes card moves (foundations/tableau)
- **DragAndDrop**: Pointer events for manual card dragging
- **HintSystem**: Calculates valid moves, **HintsOfObviousMoves** auto-hints
- **WinConditionSystem**: Detects victory
- **ScoringSystem**: Calculates points based on GameConfig rules
- **UndoSystem**: Manages move history
- **WasteSystem**: Handles stock/waste pile cycling

#### UI Systems (`src/systems/uiSystems/`)
- **CardsSystem**: DOM card element creation and positioning
- **AnimationSystem**: Async card movement animations (coordinates with StateManager)
- **AchievementSystem**: Unlocks achievements, syncs with Storage
- **ShopSystem**: Shop transactions and item selection

#### Render Systems (`src/systems/renderSystems/`)
- Static HTML rendering on init
- Dynamic card rendering on state changes

## Important Patterns

### Card Movement Flow
1. User drags card or system auto-moves it
2. `CardMovementSystem.handleCardClick()` validates move
3. Emits `GameEvents.CARD_MOVE` with move details
4. `CardMovementSystem` updates `StateManager` and animations trigger
5. UI components listen to state changes and re-render

### Configuration-Driven Design
- **GameConfig** (`src/configs/GameConfig.js`): Game rules (scoring, difficulties, defaults)
- **UIConfig** (`src/configs/UIConfig.js`): UI element configs, animation durations
- **ShopConfig** (`src/configs/ShopConfig.js`): Shop items and pricing
- **AchievementsConfig** (`src/configs/AchievementsConfig.js`): Achievement definitions

### Localization
- **Translator** (`src/utils/Translator.js`): Dynamically switches language
- Translation files in `src/locales/` (split by feature: Achievements, Shop, UI, Other)
- Always use `this.translator.translate(key)` for user-facing text

### Storage & Persistence
- **Storage** (`src/utils/Storage.js`): LocalStorage wrapper
- Persists: player stats (coins, undo/hint counts), settings (language, difficulty, sound)
- Synced with state on init via `GameInit.init()`

## AI Development Guidelines

### When Adding Features
1. **Check GameEvents** for existing events—reuse instead of creating new ones
2. **Update StateManager** if feature needs persistent state
3. **Emit events** from managers, subscribe in systems/UI
4. **Use configs** (GameConfig, UIConfig) for tunable values—don't hardcode
5. **Test in all difficulties** (easy/normal/hard modify multipliers)

### Debugging Tips
- EventManager logs all events: watch console for `event, ...args:` patterns
- StateManager state is deeply nested (1000+ lines of state)—use debugger breakpoints
- Card `positionData` tracks validation errors if moves fail
- AnimationSystem handles async card movements—check duration configs

### File Dependencies
- Core domain models: `src/core/` (Card, Deck, containers)
- All managers in: `src/managers/` (EventManager is dependency for all)
- Never import managers into other managers—use EventManager
- Systems live in `src/systems/` organized by concern (logic/render/ui)

### Naming Conventions
- Events: `UPPERCASE_SNAKE_CASE` (e.g., `CARD_MOVE`, `GAME_WIN`)
- Game containers: lowercase (e.g., `tableau-0`, `foundation-1`)
- CSS selectors use `data-*` attributes (GameConfig.dataAttributes)
- Methods handling events: `handleEventName` or `on<EventName>`

## Running & Building
- Entry: `index.html` loads `src/main.js` as ES module
- No build step required (vanilla JS)
- Open `index.html` in browser to test
- Console logs all events (disable in production)

## Common Pitfalls
- **Don't cache state**: Always read fresh from `this.stateManager.state`
- **Don't break initialization order**: Systems fail if dependencies aren't ready
- **Use EventManager for all communication**: Direct method calls break decoupling
- **Check card position before moving**: `card.positionData.parent` tells current container
- **Respect animation timing**: UI updates should not fight with AnimationSystem

## UIGamePage Specific Issues

### Critical Violations
1. **Direct state mutation**: `hintUsed()` does `this.state.hintCounterState -= 1` instead of calling StateManager
   - Fix: Use StateManager methods or emit events, never directly mutate state from UI layer
2. **Magic strings & ID hardcoding**: 50+ `document.getElementById()` calls in constructor
   - Fix: Move to UIConfig, use data-attributes pattern
3. **Abandoned code**: 600+ lines of commented confetti implementations
   - Fix: Delete dead code, use imported `createVictoryConfetti()` utility
4. **Unmanaged timers**: `hintNotifyShowTimerId` can leak if page hides before timeout fires
   - Fix: Clear timers in `hide()` method

### UIPage Development Rules
**DO:**
- Listen to events and read fresh state for updates
- Use UIConfig for all IDs, classes, animation durations
- Delegate DOM creation to helper functions/factories (NotificationFactory, ModalBuilder)
- Subscribe/unsubscribe in setupEventListeners/cleanup methods

**DON'T:**
- Put business logic in UI classes (belongs in Logic Systems)
- Mutate StateManager.state directly (call methods or emit events)
- Create 100+ line inline HTML generation (extract to templates)
- Mix async/sync event handlers—keep consistent
- Store page state separately from StateManager (use unified state)
