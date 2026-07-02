# Анимированный селект

[API кастомизируемого селекта](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Customizable_select) предоставляет декларативный основанный на CSS способ анимации элементов `<select>` и их раскрывающихся вариантов выбора. Путем сочетания `appearance: base-select` с современными техниками анимации CSS, такими как `@starting-style`, и поведением перехода `allow-discrete` - можно создавать гибкие плавные переходы для элементов верхнего уровня (top layer) без помощи тяжелых библиотек JavaScript.

Ранее анимация нативных выпадающих слоев селектов была невозможной, поскольку их UI рендерился за пределами доступных ограничений области просмотра. С `appearance: base-select` пикер становится стилизуемым и анимируемым, как любой другой элемент на странице.

## Реализация

Для реализации анимированного селекта:

1. Включаем кастомизацию: применяем `appearance: base-select` к элементу `<select>` и псевдоэлементу `::picker(select)`.
2. Включаем переходы автоматического изменения размера (опционально): определяем `interpolate-size: allow-keywords` (обычно на `:root`) для разрешения браузеру совершать переходы между дискретными значениями, такими как `height: auto` и `height: 0`.
3. Анимируем верхнеуровневый контейнер: применяем стандартные стили входа/выхода к `::picker(select)`. Для включения перехода прозрачности при движении от `display: none` к `display: block`, следует использовать `transition-behavior: allow-discrete` (часто пишется сокращенно `transition: display 0.3s allow-discrete`).
4. Подключаемся к открытому состоянию с помощью `@starting-style`: используем `@starting-style` для определения начальных стилей, которые браузер должен вычислить до начала перехода. Например, если мы хотим затухания/исчезновения, следует установить `opacity: 0` внутри блока `@starting-style`.
5. Вращаем иконку: используем селекторы фокуса или активного состояния псевдоэлемента, такие как `:open::picker-icon`, для применения переходов (таких как вращение и перемещение) для стрелки.

## Пример кода: плавное масштабирование и затухание селекта

В следующем примере показан кастомный селект, стилизованный с помощью стандартной анимации страницы для контейнера выбора:

```html
<!-- Всегда используйте <label>, подключенный к селекту через 'for', для доступности -->
<label for="theme-select">Визуальная тема</label>
<select id="theme-select" class="animated-select" name="theme">
  <!-- <button> внутри <select> становится видимым триггером при appearance: base-select -->
  <button>
    <!-- <selectedcontent> автоматически отображает контент выбранного <option> -->
    <selectedcontent></selectedcontent>
  </button>
  <option value="system">
    <!-- Важно: декоративные встроенные SVG должны содержать aria-hidden="true" для предотвращения их распознавания устройствами чтения с экрана -->
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
      <line x1="8" y1="21" x2="16" y2="21"></line>
      <line x1="12" y1="17" x2="12" y2="21"></line>
    </svg>
    Системная дефолтная
  </option>
  <option value="light">
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
    Светлый UI
  </option>
</select>
```

```css
/* Включаем кастомизацию селекта */
.animated-select,
.animated-select::picker(select) {
  appearance: base-select;
}

/* Включаем переходы ключевых слов (как правило, устанавливается глобально на :root) */
:root {
  interpolate-size: allow-keywords;
}

/* Стилизуем видимый триггер и вращение иконки */
.animated-select {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.875rem 1rem;
  font-size: 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.animated-select::picker-icon {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.animated-select:open::picker-icon {
  transform: rotate(180deg);
}

/*
 * Контейнер выбора.
 * Использует анимации верхнего уровня с хуками видимости `allow-discrete`
 */
.animated-select::picker(select) {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px -3px rgba(0,0,0,0.1);
  padding: 0.5rem;
  margin-top: 0.25rem;
  width: anchor-size(width);
  overflow: hidden;

  /* Ключевая настройка перехода для анимации поповера */
  transition:
    display 0.4s allow-discrete,
    overlay 0.4s allow-discrete,
    opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1),
    height 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  opacity: 0;
  height: 0;
}

/* Открытое состояние */
.animated-select:open::picker(select) {
  opacity: 1;
  height: auto;
}

/* @starting-style - подключение перехода к первому открытию поповера */
@starting-style {
  .animated-select:open::picker(select) {
    opacity: 0;
    height: 0;
  }
}

/* Поддержка SVG внутри вариантов выбора и выбранного контента */
.animated-select option svg,
.animated-select selectedcontent svg {
  flex-shrink: 0; /* Предотвращаем сплющивание иконок */
  width: 1.25rem;
  height: 1.25rem;
}

/* Важно: предоставляем несколько индикаторов (например, жирный шрифт и отчетливый фон) для выбранного состояния, чтобы избежать передачи состояния только по цвету */
.animated-select option:checked {
  font-weight: 700;
  background-color: #f1f5f9;
}

/* Обеспечение безопасности копирования и вставки для пользователей с чувствительностью к движению */
@media (prefers-reduced-motion: reduce) {
  .animated-select::picker(select),
  .animated-select::picker-icon {
    transition: none !important;
  }
}
```

## Стратегическая реализация и лучшие практики

- Используйте `@starting-style`, когда требуется, чтобы анимация запускалась именно тогда, когда элемент переходит из `display: none` в видимое состояние.
- Не используйте специальную блокировку прокрутки. Элементы верхнего слоя, управляемые `base-select`, должны обеспечивать возможность нативного закрытия выпадающего слоя при клике по фону.
- Проверяйте предпочтения ограниченного движения. Всегда оборачивайте ограничения анимации в медиа-запрос `prefers-reduced-motion`, чтобы обеспечить доступность для тех, кто страдает укачиванием.
- Тестируйте поведение макета. Установка `appearance: base-select` удаляет дефолтное поведение браузера масштабирования селекта на основе самого длинного варианта выбора. Может потребоваться установка фиксированной ширины или использование ограничений flex/grid для предотвращения сдвигов макета.
- Убедитесь, что `<select>` содержит атрибут `name` и имеет связанный с ним `<label>`. Это гарантирует, что даже при наличии кастомного UI компонент останется доступным для программ чтения с экрана и будет корректно работать со стандартными отправками форм.

## Поддержка и страховка

Кастомизируемый `<select>` на сегодняшний день имеет ограниченную поддержку браузеров. Поддерживается в Chrome 135+ и Edge 135+ (с апреля 2025 года). Не поддерживается в Firefox и Safari.

В браузерах, которые пока не поддерживают `appearance: base-select`, элемент `<select>` мягко деградирует к стандартному системному выпадающему слою.

- Нетекстовый контент игнорируется: старые браузеры удаляют теги HTML (такие как `<svg>` или `<div>`) внутри тегов `<option>` и рендерят только текстовые узлы. Убедитесь, что текстовый контент `<option>` читаем и осмыслен сам по себе.
- Обработка структуры HTML: стандартные парсеры могут игнорировать теги `<button>` и `<selectedcontent>` внутри `<select>` или считать их невалидными. Для прогрессивного улучшения не требуются тяжелые полифилы JavaScript, если стандартный текст рассматривается как читаемый запасной вариант.

```javascript
document.addEventListener("DOMContentLoaded", () => {
  // Проверяем поддержку значения "base-select"
  if (!CSS.supports("appearance", "base-select")) {
    // Кастомизация селекта не поддерживается
  }
});
```
