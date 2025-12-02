export class HTMLs {
  constructor() {}

  gameRulesBody() {
    return `<!-- Декоративные уголки -->
        <div class="card-corner corner-tl"></div>
        <div class="card-corner corner-tr"></div>
        <div class="card-corner corner-bl"></div>
        <div class="card-corner corner-br"></div>
        <main>
            <!-- Общая цель -->
            <section class="rules-section goal-section">
                <div class="section-header">
                    <i class="fas fa-bullseye"></i>
                    <h2>Общая цель</h2>
                </div>
                <div class="section-content">
                    <p>Переместить все карты (52 карты + джокер) из игрового поля на <strong>фундамент</strong> (4 стопки в верхней части экрана), собрав каждую масть по возрастанию от туза до короля.</p>
                </div>
            </section>

            <!-- Игровые зоны -->
            <section class="rules-section zones-section">
                <div class="section-header">
                    <i class="fas fa-map"></i>
                    <h2>Игровые зоны</h2>
                </div>
                <div class="section-content">
                    <ul>
                        <li><strong>Фундамент (4 стопки)</strong> – собираются карты одной масти по возрастанию (Туз, 2, 3, ..., Король, Джокер в конце).</li>
                        <li><strong>Игровое поле (7 столбцов)</strong> – основное поле, где происходят перемещения.</li>
                        <li><strong>Колода</strong> – оставшиеся карты для вытягивания.</li>
                        <li><strong>Отбой</strong> – карты, вытянутые из колоды.</li>
                        <li><strong>Джокер</strong> – особая карта, может заменить любую другую карту и помещается последней на фундамент.</li>
                    </ul>
                </div>
            </section>

            <!-- Основные действия -->
            <section class="rules-section actions-section">
                <div class="section-header">
                    <i class="fas fa-mouse-pointer"></i>
                    <h2>Основные действия</h2>
                </div>
                <div class="section-content">
                    <ul>
                        <li><strong>Перетаскивание карт</strong> между столбцами</li>
                        <li><strong>Автоперенос</strong> – двойной клик перемещает карту на фундамент (если возможно)</li>
                        <li><strong>Вытягивание карт</strong> из колоды</li>
                        <li><strong>Отмена хода (Undo)</strong> – возврат на шаг назад</li>
                        <li><strong>Подсказка (Hint)</strong> – подсветка возможного хода</li>
                    </ul>
                </div>
            </section>

            <!-- Режимы игры -->
            <section class="rules-section modes-section">
                <div class="section-header">
                    <i class="fas fa-gamepad"></i>
                    <h2>Режимы игры</h2>
                </div>
                <div class="section-content">
                    <!-- Классический режим -->
                    <div class="game-mode">
                        <div class="mode-header">
                            <div class="mode-title">
                                <span class="mode-icon">🏆</span>
                                <span>1. Классический</span>
                                <span class="mode-difficulty difficulty-easy">Стандарт</span>
                            </div>
                        </div>
                        <p>Стандартные правила пасьянса</p>
                        <div class="mode-rules">
                            <div class="rule-item">
                                <i class="fas fa-draw-polygon rule-icon"></i>
                                <span>Вытягивание по <strong>3 карты</strong> из колоды</span>
                            </div>
                            <div class="rule-item">
                                <i class="fas fa-redo rule-icon"></i>
                                <span><strong>1 пересдача</strong> доступна</span>
                            </div>
                            <div class="rule-item">
                                <i class="fas fa-undo rule-icon"></i>
                                <span><strong>5 отмен</strong> и <strong>3 подсказки</strong> за игру</span>
                            </div>
                            <div class="rule-item">
                                <i class="fas fa-bolt rule-icon"></i>
                                <span>Автозавершение включено</span>
                            </div>
                        </div>
                        <p><strong>Награда:</strong> +10 хусынков за победу, +25 за идеальную игру (без отмен/подсказок)</p>
                    </div>

                    <!-- Вегасский режим -->
                    <div class="game-mode">
                        <div class="mode-header">
                            <div class="mode-title">
                                <span class="mode-icon">💰</span>
                                <span>2. Вегасский</span>
                                <span class="mode-difficulty difficulty-medium">Накопительный</span>
                            </div>
                        </div>
                        <p>Режим с накопительным счетом и ставками</p>
                        <div class="mode-rules">
                            <div class="rule-item">
                                <i class="fas fa-draw-polygon rule-icon"></i>
                                <span>Вытягивание по <strong>1 карте</strong></span>
                            </div>
                            <div class="rule-item">
                                <i class="fas fa-times-circle rule-icon"></i>
                                <span><strong>Без пересдач</strong></span>
                            </div>
                            <div class="rule-item">
                                <i class="fas fa-undo rule-icon"></i>
                                <span>Только <strong>2 отмены</strong>, подсказки отсутствуют</span>
                            </div>
                            <div class="rule-item">
                                <i class="fas fa-chart-line rule-icon"></i>
                                <span>Накопительный счет между играми</span>
                            </div>
                        </div>
                        <p><strong>Экономика:</strong> Входная плата 15 хусынков, возможен выигрыш до 100 хусынков</p>
                    </div>

                    <!-- На время -->
                    <div class="game-mode">
                        <div class="mode-header">
                            <div class="mode-title">
                                <span class="mode-icon">⏱️</span>
                                <span>3. На время</span>
                                <span class="mode-difficulty difficulty-hard">Гонка</span>
                            </div>
                        </div>
                        <p>Гонка против времени</p>
                        <div class="mode-rules">
                            <div class="rule-item">
                                <i class="fas fa-clock rule-icon"></i>
                                <span>Лимит: <strong>3 минуты</strong> на игру</span>
                            </div>
                            <div class="rule-item">
                                <i class="fas fa-stopwatch rule-icon"></i>
                                <span>Дополнительный лимит: <strong>10 секунд на ход</strong></span>
                            </div>
                            <div class="rule-item">
                                <i class="fas fa-undo rule-icon"></i>
                                <span><strong>2 отмены</strong> и <strong>1 подсказка</strong></span>
                            </div>
                            <div class="rule-item">
                                <i class="fas fa-tachometer-alt rule-icon"></i>
                                <span>Бонусы за скорость и оставшееся время</span>
                            </div>
                        </div>
                        <p><strong>Награда:</strong> до 40 хусынков за быструю победу</p>
                    </div>

                    <!-- Эксперт -->
                    <div class="game-mode">
                        <div class="mode-header">
                            <div class="mode-title">
                                <span class="mode-icon">🧠</span>
                                <span>4. Эксперт</span>
                                <span class="mode-difficulty difficulty-expert">Сложный</span>
                            </div>
                        </div>
                        <p>Максимальная сложность для профессионалов</p>
                        <div class="mode-rules">
                            <div class="rule-item">
                                <i class="fas fa-footstep rule-icon"></i>
                                <span>Лимит: <strong>200 ходов</strong> на игру</span>
                            </div>
                            <div class="rule-item">
                                <i class="fas fa-undo rule-icon"></i>
                                <span><strong>3 отмены</strong> и <strong>2 подсказки</strong></span>
                            </div>
                            <div class="rule-item">
                                <i class="fas fa-exclamation-triangle rule-icon"></i>
                                <span>Штраф за ходы из отбоя на игровое поле</span>
                            </div>
                            <div class="rule-item">
                                <i class="fas fa-ban rule-icon"></i>
                                <span>Запрещены пустые перемещения между столбцами</span>
                            </div>
                        </div>
                        <p><strong>Награда:</strong> до 55 хусынков за победу с бонусами</p>
                    </div>

                    <!-- Расслабленный -->
                    <div class="game-mode">
                        <div class="mode-header">
                            <div class="mode-title">
                                <span class="mode-icon">😌</span>
                                <span>5. Расслабленный</span>
                                <span class="mode-difficulty difficulty-easy">Обучение</span>
                            </div>
                        </div>
                        <p>Для обучения и отдыха</p>
                        <div class="mode-rules">
                            <div class="rule-item">
                                <i class="fas fa-infinity rule-icon"></i>
                                <span><strong>Безлимитные</strong> пересдачи, отмены и подсказки</span>
                            </div>
                            <div class="rule-item">
                                <i class="fas fa-robot rule-icon"></i>
                                <span>Автоподсказки и автозавершение</span>
                            </div>
                            <div class="rule-item">
                                <i class="fas fa-graduation-cap rule-icon"></i>
                                <span>Режим обучения включен</span>
                            </div>
                            <div class="rule-item">
                                <i class="fas fa-calendar-day rule-icon"></i>
                                <span>Ежедневная награда за игру</span>
                            </div>
                        </div>
                        <p><strong>Награда:</strong> бонусы за первую победу и ежедневную игру</p>
                    </div>
                </div>
            </section>

            <!-- Система очков -->
            <section class="rules-section scoring-section">
                <div class="section-header">
                    <i class="fas fa-chart-bar"></i>
                    <h2>Система очков</h2>
                </div>
                <div class="section-content">
                    <p>Очки начисляются за:</p>
                    <ul>
                        <li>Перемещение карты на фундамент: <span class="positive-score">5-15 очков</span></li>
                        <li>Переворот карты на поле: <span class="positive-score">2-10 очков</span></li>
                        <li>Сбор фундамента: <span class="positive-score">25-150 очков</span></li>
                        <li>Завершение игры: <span class="positive-score">бонусные очки</span></li>
                    </ul>
                    
                    <p>Штрафы применяются за:</p>
                    <ul>
                        <li>Использование отмены: <span class="negative-score">0-20 очков</span></li>
                        <li>Использование подсказки: <span class="negative-score">0-10 очков</span></li>
                        <li>Время (в режиме "На время"): <span class="negative-score">-2 очка/секунда</span></li>
                    </ul>
                </div>
            </section>

            <!-- Хусынки -->
            <section class="rules-section currency-section">
                <div class="section-header">
                    <i class="fas fa-coins"></i>
                    <h2>Хусынки (игровая валюта)</h2>
                </div>
                <div class="section-content">
                    <p>Хусынки начисляются за:</p>
                    <ul>
                        <li><strong>Победу в игре</strong> (5-50 хусынков)</li>
                        <li><strong>Идеальную победу</strong> (без отмен/подсказок)</li>
                        <li><strong>Сбор фундаментов</strong></li>
                        <li><strong>Ежедневную игру</strong></li>
                        <li><strong>Серии побед</strong> (в Вегасском режиме)</li>
                    </ul>
                </div>
            </section>

            <!-- Стратегические советы -->
            <section class="rules-section tips-section">
                <div class="section-header">
                    <i class="fas fa-lightbulb"></i>
                    <h2>Стратегические советы</h2>
                </div>
                <div class="section-content">
                    <div class="tips-grid">
                        <div class="tip-card">
                            <h4><i class="fas fa-eye"></i> Открывайте карты</h4>
                            <p>Старайтесь открывать закрытые карты на игровом поле - это ключ к победе.</p>
                        </div>
                        <div class="tip-card">
                            <h4><i class="fas fa-sort-amount-up"></i> Начинайте с малого</h4>
                            <p>Сначала собирайте тузы и двойки на фундамент - они открывают возможности для других карт.</p>
                        </div>
                        <div class="tip-card">
                            <h4><i class="fas fa-joker"></i> Используйте джокера</h4>
                            <p>Джокера используйте в конце для завершения стопок - он может заменить любую карту.</p>
                        </div>
                        <div class="tip-card">
                            <h4><i class="fas fa-chess-board"></i> Планируйте ходы</h4>
                            <p>В режиме с лимитом ходов планируйте перемещения заранее.</p>
                        </div>
                        <div class="tip-card">
                            <h4><i class="fas fa-calculator"></i> Считайте стоимость</h4>
                            <p>В Вегасском режиме считайте стоимость каждого действия для максимальной прибыли.</p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Условия победы -->
            <section class="rules-section win-section">
                <div class="section-header">
                    <i class="fas fa-flag-checkered"></i>
                    <h2>Условия победы</h2>
                </div>
                <div class="section-content">
                    <ul>
                        <li>Все карты перемещены на фундамент</li>
                        <li>Джокер помещен последним на любой фундамент</li>
                        <li>Игра считается завершенной успешно</li>
                    </ul>
                </div>
            </section>
        </main>

            <div class="luck-message">
                <i class="fas fa-club"></i>
                Удачи в игре!
                <i class="fas fa-spade"></i>
            </div>
            <p class="footer-note">Косынка с джокером • 5 режимов сложности • Динамические правила</p>`;
  }
}
