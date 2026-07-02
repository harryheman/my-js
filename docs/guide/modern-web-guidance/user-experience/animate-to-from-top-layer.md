# Анимация отображения и скрытия элемента верхнего уровня

Элементы, которые рендерятся на "верхнем слое" (top layer) (такие как `<dialog>`, элементы с атрибутом `popover` или всплывающие подсказки) исторически было сложно анимировать, поскольку они переключаются между `display: none` и видимым состоянием. Современный CSS предоставляет `@starting-style`, `transition-behavior: allow-discrete` и свойство `overlay` для включения плавных переходов входа и выхода таких элементов. Обратите внимание, что в примерах ниже используется нативная вложенность CSS.

## Реализация

### 1. Включаем дискретные переходы

Для анимации свойства `display`, нужно установить `transition-behavior: allow-discrete`. Это позволяет элементу оставаться видимым при анимации выхода. При использовании сокращения `transition`, обязательно добавляйте `transition-behavior: allow-discrete` после него. В противном случае, `transition-behavior` будет сброшено.

```css
.box {
  /* Будет сброшено `transition` */
  transition-behavior: allow-discrete;
  /* Устанавливает `transition-behavior: normal` */
  transition: opacity .3s;
}
```

### 2. Свойство `overlay`

Когда элемент перемещается на или с верхнего слоя, нужно анимировать его свойство `overlay`. Это гарантирует, что элемент останется в верхнем слое на протяжении всей анимации, предотвращая его преждевременное обрезание (clip) другими элементами или областью просмотра.

### 3. Анимация входа с помощью `@starting-style`

Используйте правило `@starting-style` для определения стилей, от которых должен выполняться переход, при первом рендеринге элемента или изменении его `display` с `none`.

### 4. Анимация затенения

Псевдоэлемент `::backdrop` может анимироваться схожим образом путем применения переходов к его собственным свойствам.

## Пример

```css
/* 1. Определяем видимое (открытое) состояние */
dialog[open],
[popover]:popover-open {
  opacity: 1;
  transform: scale(1);

  /* 2. Определяем начальное состояние для входа (должно следовать за открытым состоянием) */
  @starting-style {
    opacity: 0;
    transform: scale(0.9);
  }
}

/* 3. Определяем базовое (закрытое/выходное) состояние и переходы */
dialog,
[popover] {
  opacity: 0;
  transform: scale(0.9);

  /* Переход отображения и наложения для элементов верхнего уровня */
  transition-property: opacity, transform, display, overlay;
  transition-duration: 0.3s;
  transition-timing-function: ease-out;
  transition-behavior: allow-discrete;
}

/* 4. Анимируем затенение */
dialog::backdrop,
[popover]::backdrop {
  background-color: rgba(0, 0, 0, 0);
  /* Сокращение `transition` также может использоваться с `allow-discrete` */
  transition:
    display 0.3s allow-discrete,
    overlay 0.3s allow-discrete,
    background-color 0.3s ease-out;
}

dialog[open]::backdrop,
[popover]:popover-open::backdrop {
  background-color: rgba(0, 0, 0, 0.5);

  @starting-style {
    background-color: rgba(0, 0, 0, 0);
  }
}

/* 5. Учитываем предпочтения пользователя по снижению движения */
@media (prefers-reduced-motion: reduce) {
  dialog,
  [popover] {
    /* Отключаем движение и сокращаем продолжительность затухания */
    transform: none;
    transition-duration: 0.1s;
  }

  @starting-style {
    dialog[open],
    [popover]:popover-open {
      transform: none;
    }
  }
}
```

## Ограничения и доступность

- Включайте `overlay` в список `transition` для любого элемента, перемещающегося на или с верхнего слоя.
- Используйте `allow-discrete` для перехода свойства `display`.
- Учитывайте предпочтения пользователя по снижению движения с помощью `prefers-reduced-motion` путем упрощения переходов (например, удаляя преобразования и сокращая продолжительность).
- Помещайте блок `@starting-style` внутри или после селектора "открытого" состояния для обеспечения правильной каскадности.
- Не используйте `@starting-style` для анимации выхода; такие анимации определяются переходом к базовому (закрытому) состоянию.

## Поддержка и страховка

#### Анимация элементов верхнего уровня

Правило `@starting-style` поддерживается всеми основными браузерами с 06.08.2024.
Свойство `transition-behavior` - также с 06.08.2024. Свойство `overlay` имеет ограниченную поддержку браузеров. Поддерживается в Chrome 117+ и Edge 117+ (с сентября 2023 года). Не поддерживается в Firefox и Safari.

В браузерах без поддержки элементы верхнего уровня будут появляться и исчезать мгновенно. Для анимации этих переходов в старых браузерах, нужно использовать JavaScript для координации классов и обрабатывать события `transitionend` или использовать Web Animations API.

```javascript
// Определение поддержки анимации элементов верхнего уровня
const supportsTopLayerAnimation =
  window.CSS &&
  CSS.supports('transition-behavior', 'allow-discrete') &&
  CSS.supports('overlay', 'auto');

if (!supportsTopLayerAnimation) {
  // Ручной резерв JS для анимации входа/выхода:
  // 1. Добавляем класс `.is-opening` для входа.
  // 2. При закрытии, добавляем класс `.is-closing`, ждем события
  // `transitionend`, затем вызываем `.close()` или скрываем поповер.
}
```

#### popover

Атрибут `popover` поддерживается всеми основными браузерами с 27.01.2025.

В браузерах без поддержки можно использовать полифилл `@oddbird/popover-polyfill`:

```html
<script type="module">
  if (!HTMLElement.prototype.hasOwnProperty('popover')) {
    await import('https://unpkg.com/@oddbird/popover-polyfill');
  }
</script>
```

Для поддержки легаси без полифилла можно использовать `position: fixed` и ручное вычисление координат с помощью метода `getBoundingClientRect()`.
