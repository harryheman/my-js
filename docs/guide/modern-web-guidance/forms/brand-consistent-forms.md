# Форма, соответствующая бренду

Кастомизация стандартных элементов формы HTML, таких как чекбоксы и радио-кнопки, исторически была сложной. Разработчики часто сталкивались с выбором между использованием браузерных дефолтных решений и разработкой кастомных компонентов с нуля. Разработка кастомных контролов требует много времени и может легко привести к проблемам с доступностью или отсутствующим состояниям (таким как промежуточное (indeterminate) состояние чекбокса).

Свойство CSS `accent-color` предоставляет простой способ применения цвета вашего бренда к встроенным инпутам с помощью одной строки CSS, без ущерба для доступности и встроенного функционала браузера.

## Реализация

Для применения цвета вашего бренда к контролам формы:

1. Определите цвет вашего бренда: выберите цвет, представляющий ваш бренд.
2. Примените свойство `accent-color`: добавьте `accent-color` для элемента или контейнера (такого как `body` или определенная форма) в CSS.
3. Добавьте поддержку темного режима (опционально, но рекомендуется): используйте `color-scheme` для сообщения браузеру о поддержке вашим сайтом темного режима и меняйте `accent-color`, если нужно, для лучшего контраста.

## Пример кода: соответствующие бренду контролы формы

```css
:root {
  --brand-color: #6200ee;
}

/* Применяем accent-color к body или определенному контейнеру */
body {
  accent-color: var(--brand-color);
}

/* Опционально: меняем цвет бренда для темного режима при необходимости */
@media (prefers-color-scheme: dark) {
  :root {
    --brand-color: #bb86fc; /* Более светлый цвет в темном режиме */
  }
}
```

```html
<form>
  <!-- Чекбокс -->
  <label for="subscribe">
    <input type="checkbox" id="subscribe" checked>
    Подписаться на рассылку
  </label>

  <!-- Радио-кнопки -->
  <label for="plan-monthly">
    <input type="radio" id="plan-monthly" name="plan" value="monthly">
    Ежемесячная
  </label>
  <label for="plan-yearly">
    <input type="radio" id="plan-yearly" name="plan" value="yearly" checked>
    Годовая
  </label>

  <!-- Слайдер диапазона -->
  <label for="volume">Звук:</label>
  <input type="range" id="volume" min="0" max="100" value="70">

  <!-- Панель прогресса -->
  <label for="file">Прогресс загрузки:</label>
  <progress id="file" max="100" value="70">70%</progress>
</form>
```

## Стратегическая реализация и лучшие практики

- Используйте `accent-color` для легкой тематизации контролов формы для отражения вашего бренда.
- Не доверяйте слепо браузеру в обработке контраста. Хотя браузеры должны автоматически определять подходящий контрастный цвет, известные дефекты в реализациях, вроде Safari (баг WebKit 244233) и Android Chrome (баг Chromium 343503163), могут не инвертировать цвета галочек, что приводит к тому, что элементы управления становятся невидимыми или трудно различимыми при использовании цветов, которым не хватает контраста с фоном (например, светлые цвета в светлом режиме или темные цвета в темном режиме).
- Комбинируйте `accent-color` с `color-scheme: light dark` для обеспечения хорошего внешнего вида контролов в светлом и темном режимах.
- Не используйте цвет, который слишком близок к цвету фона, даже несмотря на то, что браузеры пытаются гарантировать контраст, лучше предоставлять цвет с хорошим базовым контрастом.
- Не предполагайте, что `accent-color` работает на всех элементах формы. На сегодняшний день он работает только в элементах `checkbox`, `radio`, `range` и `progress`.

## Поддержка и страховка

`accent-color` имеет ограниченную поддержку. Поддерживается в Chrome 93+ (с августа 2021 года), Edge 93+ (с сентября 2021 года) и Firefox 92+ (с сентября 2021 года). Не поддерживается в Safari.

В браузерах, которые не поддерживают `accent-color`, контролы откатываются к дефолтному браузерному виду. Для обеспечения полной согласованности бренда и высокой надежности во всех окружениях, необходимо реализовать запасную стратегию, используя устоявшуюся технику "визуально скрытого инпута".

### Прогрессивное улучшение с помощью `@supports not`

Используйте правило `@supports not` для применения резервных стилей только в том случае, если `accent-color` не поддерживается. Это гарантирует, что в современных браузерах используется простота `accent-color`, и при этом гарантируется единообразие фирменного стиля для старых браузеров.

#### 1. Структура HTML

Убедитесь, что ваши `<label>` оборачивают текст в `<span>`, чтобы можно было использовать одноуровневые селекторы в CSS:

```html
<label for="subscribe-fallback">
  <input type="checkbox" id="subscribe-fallback" class="visually-hidden" checked>
  <span>Подписаться на рассылку</span>
</label>
```

#### 2. Резервный CSS

Применяем кастомные стили в блоке `@supports not`:

```css
/* Резерв для старых браузеров без поддержки accent-color */
@supports not (accent-color: var(--brand-color)) {
  /* Визуально скрываем нативный инпут с помощью канонической техники, сохраняющей доступность */
  form input[type="checkbox"].visually-hidden {
    position: absolute !important;
    clip-path: inset(50%) !important;
    overflow: hidden !important;
    width: 1px !important;
    height: 1px !important;
    margin: -1px !important;
    padding: 0 !important;
    border: 0 !important;
    white-space: nowrap !important;
  }

  /* Стилизуем подпись-обертку */
  label {
    position: relative;
    padding-left: 2rem;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
  }

  /* Кастомный квадрат для чекбокса */
  input[type="checkbox"] + span::before {
    content: "";
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 1.2rem;
    height: 1.2rem;
    border: 2px solid #ccc;
    background: white;
    border-radius: 4px;
    box-sizing: border-box;
    transition: all 0.2s ease;
  }

  /* Фокус, устанавливаемый с помощью клавиатуры */
  input[type="checkbox"]:focus-visible + span::before {
    outline: 2px solid #000;
    outline-offset: 2px;
  }

  /* Выбранное состояние */
  input[type="checkbox"]:checked + span::before {
    background-color: var(--brand-color, #6200ee);
    border-color: var(--brand-color, #6200ee);
  }

  /* Галочка (юникод) */
  input[type="checkbox"]:checked + span::after {
    content: "✓";
    position: absolute;
    left: 0.25rem;
    top: 50%;
    transform: translateY(-50%);
    color: white;
    font-weight: bold;
    font-size: 0.9rem;
  }

  /* Резерв для слайдера диапазона */
  input[type="range"] {
    -webkit-appearance: none;
    appearance: none;
    background: transparent;
  }

  /* Webkit (Chrome, Safari, Edge) */
  input[type="range"]::-webkit-slider-runnable-track {
    width: 100%;
    height: 8px;
    /* Используем градиент для отображение статического значения прогресса (например, 70%) или обновляем его с помощью JS */
    background: linear-gradient(to right, var(--brand-color, #6200ee) 70%, #ccc 70%);
    border-radius: 4px;
  }

  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    height: 16px;
    width: 16px;
    border-radius: 50%;
    background: var(--brand-color, #6200ee);
    cursor: pointer;
    margin-top: -4px; /* Центрируем по вертикали */
  }

  /* Firefox */
  input[type="range"]::-moz-range-track {
    width: 100%;
    height: 8px;
    background: #ccc;
    border-radius: 4px;
  }

  input[type="range"]::-moz-range-thumb {
    height: 16px;
    width: 16px;
    border-radius: 50%;
    background: var(--brand-color, #6200ee);
    cursor: pointer;
  }

  /* Специфичный для Firefox прогресс */
  input[type="range"]::-moz-range-progress {
    background-color: var(--brand-color, #6200ee);
    height: 8px;
    border-radius: 4px;
  }

  /* Резерв для прогресса */
  progress {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    border: none;
    background: #ccc;
    height: 8px;
    border-radius: 4px;
  }

  progress::-webkit-progress-bar {
    background-color: #ccc;
    border-radius: 4px;
  }

  progress::-webkit-progress-value {
    background-color: var(--brand-color, #6200ee);
    border-radius: 4px;
  }

  progress::-moz-progress-bar {
    background-color: var(--brand-color, #6200ee);
    border-radius: 4px;
  }
}
```

### Динамичный прогресс

Чтобы заставить заливку прогресса перемещаться с помощью ползунка диапазона в браузерах Webkit (без `accent-color`), можно использовать переменную CSS и немного JavaScript.

1. Обновляем CSS - используем переменную CSS для конечной контрольной точки градиента:

```css
input[type="range"]::-webkit-slider-runnable-track {
  background: linear-gradient(to right, var(--brand-color) var(--progress, 0%), #ccc var(--progress, 0%));
}
```

2. Добавляем JavaScript - обновляем переменную в обработчике события `input`:

```javascript
if (!CSS.supports('accent-color')) {
  const slider = document.getElementById('volume');
  slider.addEventListener('input', (e) => {
    e.target.style.setProperty('--progress', `${e.target.value}%`);
  });
}
```
