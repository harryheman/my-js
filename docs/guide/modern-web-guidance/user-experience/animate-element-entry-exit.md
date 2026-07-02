# Анимация добавления и удаления элемента

Раньше переходы (transitions) CSS не могли анимировать элементы, когда они впервые добавлялись в DOM или когда их свойство `display` менялось от `none`. Правило `@starting-style` и `transition-behavior: allow-discrete` дают возможность создавать плавные анимации входа и выхода.

## Реализация

### 1. Анимация переключателей `display: none`

Для анимации переключения видимости элемента через атрибут (например, `hidden` с `display: none`):

1. Определяем видимое состояние: устанавливаем финальные значения свойства (например, `opacity: 1`) на базовый класс.
2. Определяем начальное состояние входа: используем `@starting-style` для определения значений, от которых выполняется переход, когда элемент становится видимым.
3. Включаем дискретные (discrete) переходы: включаем `display` в свойство `transition` и используем `transition-behavior: allow-discrete`.
4. Определяем состояние выхода: устанавливаем целевые значения в атрибуте `hidden`.

```css
.card {
  display: block;
  opacity: 1;
  translate: 0;
  /* Используем `transition-behavior: allow-discrete` для переходов отображения */
  transition:
    display 0.4s,
    opacity 0.4s ease-out,
    translate 0.4s ease-out;
  transition-behavior: allow-discrete;
}

/* Анимация входа: переход выполняется от этих значений при первом рендеринге */
@starting-style {
  .card {
    opacity: 0;
    translate: 0 -20px;
  }
}

/* Анимация выхода: переход выполняется к этим значениям при скрытии */
.card:where(.hidden, [hidden]) {
  display: none;
  opacity: 0;
  translate: 0 -20px;
}

/* Учитываем предпочтения пользователя по снижению движения */
@media (prefers-reduced-motion: reduce) {
  .card {
    /* Отключаем движение и сокращаем продолжительность затухания */
    translate: none;
    transition-duration: 0.1s;
  }

  @starting-style {
    .card {
      translate: none;
    }
  }

  .card:where(.hidden, [hidden]) {
    translate: none;
  }
}
```

### 2. Анимация вставки и удаления элементов DOM

Для элементов, добавляемых с помощью `appendChild()` или удаляемых с помощью `remove()`:

- Вход: используйте `@starting-style`, как показано выше. Браузер сам определит изменение стиля от "ничего" к начальным стилям элемента и запустить переход от значений `@starting-style`.
- Удаление: поскольку `element.remove()` выполняется мгновенно и не запускает  переход CSS, нужно сначала запустить анимацию выхода (например, путем добавления класса) и дождаться его завершения перед удалением узла из DOM.

```javascript
// 1. Запускаем анимацию выхода
element.setAttribute('hidden', true);

// 2. Ждем завершения всех активных переходов/анимации,
// с таймером на случай бесконечной анимации
const animations = element.getAnimations();
if (animations.length > 0) {
  await Promise.race([
    // `Promise.allSettled` обеспечивает ожидание всех переходов, даже если некоторые анимации упали
    Promise.allSettled(animations.map(a => a.finished)),
    new Promise(r => setTimeout(r, 2000))
  ]);
}

// 3. Удаляем узел из DOM
element.remove();
```

## Ограничения и доступность

- Используйте `transition-behavior: allow-discrete` при анимации `display`. Без этого, элемент исчезнет мгновенно при выходе.
- Не используйте `allow-discrete` в сокращении `transition` - это приведет к игнорированию старыми браузерами всего объявления `transition`.  По-возможности, используйте отдельное объявление `transition-behavior: allow-discrete`.
- Используйте `@starting-style` для анимации входа. Без этого, браузер пропустит первое обновление стилей элемента (начальный рендеринг или изменение `display: none`).
- Включайте `overlay` в список `transition` при анимации элементов верхнего уровня (top-layer), таких как `<dialog>` или `popover`, чтобы они оставались на верхнем уровне при анимации выхода.
- Учитывайте предпочтения пользователя по снижению движения с помощью медиа-запроса `prefers-reduced-motion`.
- Не полагайтесь на правило `@starting-style` для анимации выхода; оно определяет только начальную точку анимации входа. Анимация выхода определяется переходом к скрытому состоянию.

## Поддержка и страховка

Правило `@starting-style` поддерживается всеми основными браузерами с 06.08.2024.

В браузерах без поддержки переключение `display: none` происходит мгновенно. Определить поддержку можно в JavaScript с помощью `CSS.supports()` для условного применения ручной логики анимации.

```javascript
// Определяем поддержку дискретных переходов и `@starting-style`
const supportsModernTransitions =
  window.CSS &&
  CSS.supports('transition-behavior', 'allow-discrete');

if (!supportsModernTransitions) {
  // Реализуем ручной основанный на JS резерв для входа/выхода
}
```

### Ручная анимация входа (резерв JS)

```javascript
// Для отображения
el.style.display = '';
// Двойной requestAnimationFrame - это способ сказать браузеру:
// "Сначала покажи элемент в начальном состоянии, дождись следующего кадра,
// а уже потом переключи его в конечное состояние для запуска перехода CSS"
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    el.classList.remove('hidden');
  });
});

// Для скрытия
el.setAttribute('hidden', true);
el.addEventListener('transitionend', () => {
  if (el.classList.contains('hidden')) el.style.display = 'none';
}, { once: true });
```
