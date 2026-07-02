# Создание постоянного тура

Ознакомительные туры (onboarding tours) требуют наложений (overlays), которые должны быть открытыми до тех пор, пока пользователи взаимодействуют с выделенными возможностями. В отличие от авто-поповеров, ручные поповеры не закрываются при клике пользователя за их пределами. Комбинация `popover="manual"` с якорным позиционированием CSS (Anchor Positioning) позволяет создавать немодальные привязанные шаги тура.

## Рекомендуемая реализация

### HTML

```html
<div id="feature-target">Выделить эту возможность</div>

<!-- Обеспечиваем семантику наложения диалога и привязки доступности -->
<div id="tour-step" popover="manual" role="dialog" aria-labelledby="tour-title">
  <!-- Предположим, что <h1> предшествует этому элементу в полном документе -->
  <h2 id="tour-title">Шаг 1</h2>
  <p>Посмотрите, как использовать эту возможность.</p>
  <button popovertarget="tour-step" popovertargetaction="hide">Посмотреть</button>
</div>
```

### CSS

```css
#feature-target {
  anchor-name: --feature-target;
}

#tour-step {
  popover: manual;
  position-anchor: --feature-target;
  position-area: right center;
  inset: auto;
  margin: 1rem;
  padding: 1rem;
  border: 1px solid blue;
  border-radius: 0.5rem;
  background: aliceblue;
}
```

### JavaScript

```javascript
const tourStep = document.getElementById('tour-step');
tourStep.showPopover();
// Программно переводим фокус в немодальный поповер, чтобы пользователи клавиатуры/вспомогательных технологий сразу получили новый контекст
tourStep.querySelector('button').focus();
```

## Руководства по реализации

* Используйте `popover="manual"` для предотвращения случайного закрытия шага тура во время взаимодействия пользователя.
* Пометьте контейнер с помощью `role="dialog"` и привяжите его заголовок с помощью `aria-labelledby`.
* Переместите программный фокус в поповер сразу после его открытия во избежание потери фокуса.
* Используйте якорное позиционирование для привязки шага тура к определенному объясняемому функционалу.
* Предоставляйте явные кнопки "Закрыть" или "Дальше" в поповере с `popovertargetaction="hide"`.

## Поддержка и страховка

Popover API поддерживается всеми основными браузерами с 27.01.2025.

Рекомендуемым полифиллом является `@oddbird/popover-polyfill`:

```html
<script type="module">
  if (!HTMLElement.prototype.hasOwnProperty('popover')) {
    await import('https://unpkg.com/@oddbird/popover-polyfill');
  }
</script>
```

В качестве альтернативы без полифилла можно использовать `position: fixed` и вручную вычислять координаты с помощью метода JavaScript `getBoundingClientRect()`.

### Якорное позиционирование

Anchor Positioning API поддерживается всеми основными браузерами (в Safari пока только в качестве экспериментальной возможности).

Для поддержки старых браузеров можно использовать полифилл или резерв на чистом CSS.

#### Вариант 1: полифилл

Для эмуляции якорного позиционирования можно использовать полифилл `@oddbird/css-anchor-positioning`. Он не поддерживает неявные якори, поэтому следует добавлять явные названия якорей триггерам. Кроме того, не поддерживается свойство `position-area`, поэтому следует использовать функции `anchor()` для определения сторон привязки элемента:

```html
<script type="module">
  if (!CSS.supports('anchor-name: --foo')) {
    await import("https://unpkg.com/@oddbird/css-anchor-positioning");
  }
</script>
```

```css
#tour-step {
  left: anchor(right);
  top: anchor(top);
}
```

#### Вариант 2: чистый CSS

Вместо полифилла, можно зафиксировать положение тура в нижней части области просмотра с помощью `@supports not`:

```css
@supports not (anchor-name: --foo) {
  #tour-step {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    margin: 0;
    border-radius: 0;
  }
}
```
