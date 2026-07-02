# Декларативное управление диалогами и поповерами

Invoker Commands API позволяет переключать видимость элементов `<dialog>` и `[popover]` с помощью одних кнопок HTML, снижая необходимость использования кастомных обработчиков событий JavaScript.

Атрибуты `commandfor` (целевой идентификатор) и `command` (операция) элемента `<button>` позволяют браузеру автоматически обрабатывать изменения состояния видимости, управлять фокусом и выполнять привязки доступности (такие как `aria-expanded`). Этот декларативный подход является рекомендуемым, поскольку он удаляет хрупкий шаблонный код, обеспечивает интерактивность сразу после парсинга HTML и гарантирует надежный нативно доступный опыт пользователя.

## Реализация декларативных поповеров

Видимость поповера может переключаться с помощью одной кнопки:

```html
<!-- Атрибут `commandfor` привязывает вызывающего (invoker) к идентификатору целевого элемента, чтобы браузер знал, чем управлять. -->
<!-- Атрибут `command` определяет операцию для выполнения. Используйте 'toggle-popover' для автоматической обработки переключения состояния видимости -->
<button commandfor="my-popover" command="toggle-popover">
  Переключить видимость поповера
</button>

<!-- Целевой элемент должен содержать атрибут `popover`, чтобы управляться как поповер -->
<div id="my-popover" popover>
  <p>Контент поповера.</p>
</div>
```

Для управления открытием и закрытием поповера с помощью отдельных кнопок можно использовать команды `show-popover` и `hide-popover`:

```html
<!-- Используйте 'show-popover' для явного открытия поповера. Повторное нажатие этой кнопки не закроет поповер -->
<button commandfor="my-explicit-popover" command="show-popover">
  Открыть поповер
</button>

<div id="my-explicit-popover" popover="manual">
  <p>Этот поповер явно открывается и закрывается отдельными кнопками.</p>

  <!-- Используйте 'hide-popover' для явного закрытия поповера -->
  <button commandfor="my-explicit-popover" command="hide-popover">
    Закрыть поповер
  </button>
</div>
```

## Реализация декларативных модальных диалогов

В отличие от поповеров, в модальных диалогах, как правило, используются отдельные кнопки открытия и закрытия. Используйте команду `show-modal` для отрытия диалога как модального окна:

```html
<!-- Используйте `command="show-modal"` для отображения диалога как модального окна, захвата фокуса и блокировки взаимодействия с остальной страницей. -->
<!-- Атрибут `commandfor` соединяет кнопку с ИД диалога -->
<button commandfor="confirm-dialog" command="show-modal">
  Открыть подтверждение
</button>

<dialog id="confirm-dialog">
  <p>Вы уверены, что хотите продолжить?</p>

  <!-- Используйте `command="close"` для закрытия диалога -->
  <button commandfor="confirm-dialog" command="close">
    Отмена
  </button>
</dialog>
```

## Поддержка и страховка

Invoker Commands API поддерживается всеми основными браузерами с 12.12.2025.
Popover API - с 27.01.2025.

В старых браузерах нужно использовать полифиллы.

### Страховка Invoker Commands API

Определяйте поддержку путем проверки свойства `commandForElement` в прототипе `HTMLButtonElement`. Не проверяйте объект `window` или `document`. Полифилл следует импортировать динамически, когда отсутствует нативная поддержка.Обрабатывайте событие `command` прямо на целевом элементе, поскольку оно не всплывает.

**Вариант 1: использование сборщика**

Установите полифилл с помощью npm (`npm install invokers-polyfill`). Это подход для проектов, в которых используется сборщик модулей (такой как Vite или Webpack) или карты импортов (import maps).

```javascript
// Определяем поддержку.
// Условно загружаем полифилл для браузеров без поддержки
if (!('commandForElement' in HTMLButtonElement.prototype)) {
  import('invokers-polyfill');
}
```

**Вариант 2: использование CDN**

Для проектов без сборщика динамически импортируйте полифилл прямо из CDN внутри `<script type="module">`:

```html
<script type="module">
  // Определяем поддержку.
  // Условно загружаем полифилл для браузеров без поддержки
  if (!('commandForElement' in HTMLButtonElement.prototype)) {
    import('https://esm.run/invokers-polyfill');
  }
</script>
```

### Ручная страховка (традиционный шаблон)

Вместо полифилла, можно использовать комбинацию делегирования событий для отправки событий и реестра команд для обработки операций. Это распространенный архитектурный шаблон веб-разработки, который остается высокоэффективным и масштабируемым.

```javascript
// 1. Определяем реестр операций для более чистой логики
const commandRegistry = {
  '--spin': (target) => target.classList.toggle('is-spun'),
  '--grow': (target) => target.classList.toggle('is-grown'),
  '--reset': (target) => target.classList.remove('is-spun', 'is-grown'),
};

const supportsInvokers = 'commandForElement' in HTMLButtonElement.prototype;

// 2. Резерв: отправляем события вручную при отсутствии нативной поддержки
if (!supportsInvokers) {
  document.addEventListener('click', (event) => {
    const button = event.target.closest('button[commandfor]');
    if (!button) return;

    const target = document.getElementById(button.getAttribute('commandfor'));
    const command = button.getAttribute('command');

    if (target && command) {
      target.dispatchEvent(new CustomEvent('command', {
        bubbles: true,
        detail: { command }
      }));
    }
  });
}

// 3. Унифицированный обработчик: регистрируется прямо на целевом элементе
document.getElementById('action-target').addEventListener('command', (event) => {
  const command = event.command || event.detail?.command;
  const target = event.currentTarget;
  const action = commandRegistry[command];

  if (action) {
    action(target);
  }
});
```

### Страховка Popover API

Для поддержки атрибута `popover` в старых браузерах используйте `@oddbird/popover-polyfill`.

Определяйте поддержку путем проверки свойства `popover` в прототипе `HTMLElement`. Условно инициализируйте полифилл при отсутствии поддержки.

**Вариант 1: использование сборщика**

Установите пакет с помощью npm (`npm install @oddbird/popover-polyfill`). Этот метод требует сборщика или карт импортов для разрешения пути модуля.

```javascript
// Определяем поддержку.
// Условно загружаем полифилл для браузеров без поддержки
if (!('popover' in HTMLElement.prototype)) {
  import('@oddbird/popover-polyfill/fn').then(({ apply }) => {
    apply();
  });
}
```

**Вариант 2: использование CDN**

Для проектов без сборщика динамически импортируйте полифилл из CDN внутри `<script type="module">`:

```html
<script type="module">
  // Определяем поддержку.
  // Условно загружаем полифилл для браузеров без поддержки
  if (!('popover' in HTMLElement.prototype)) {
    import('https://unpkg.com/@oddbird/popover-polyfill@latest/dist/popover-fn.js').then(({ apply }) => {
      apply();
    });
  }
</script>
```

Используйте `:is()` или `:where()` для объединения `:popover-open` с соответствующим классом полифилла, в противном случае, браузеры без поддержки `:popover-open` проигнорируют правило целиком:

```css
[popover]:is(:popover-open, .\:popover-open) {
  display: block;
}
```
