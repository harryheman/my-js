# Декларативные операции кнопок

Invoker Commands API позволяет кнопкам запускать операции (actions) на целевых элементах декларативно с помощью атрибутов HTML. Такой подход позволяет снизить необходимость в ручных обработчиках событий и обеспечить интерактивность сразу после парсинга HTML.

Для кастомных специфичных для приложения операций можно определять собственные названия команд (commands). Кастомные команды должны начинаться с двойного дефиса (`--`) во избежание коллизий с будущими встроенными командами браузера.

## Реализация

1. Определение целевого элемента: определяем элемент, который будет реагировать на операцию. Он должен иметь уникальный `id`.
2. Настройка вызывающей кнопки (invoker button): атрибут `commandfor` предназначен для указания целевого `id`, а атрибут `command` - для определения названия кастомной команды (начинающегося с `--`).
3. Обработка события команды: добавьте обработчик события `command` к `document` (или общему предку). Это гарантирует, что событие будет захвачено, даже при отправке полифиллом или дочерним элементом. Объект события содержит свойства `command` и `target` (ссылку на элемент, определенный в `commandfor`).

## Пример: кастомные элементы управления анимацией

```html
<!-- Целевой элемент, который будет реагировать на кастомные команды -->
<div id="action-target" class="target">
  Цель операции
</div>

<!-- Декларативно привязанные к целевому элементу кнопки -->
<!-- Каждая кнопка отправляет уникальную кастомную команду, начинающуюся с '--' -->
<button commandfor="action-target" command="--spin">
  Вращение
</button>

<button commandfor="action-target" command="--grow">
  Увеличение
</button>

<button commandfor="action-target" command="--reset">
  Сброс
</button>

<script>
  // Регистрируем событие 'command' прямо на целевом элементе
  // (это необходимо, поскольку нативное событие 'command' не всплывает (bubble))
  document.getElementById('action-target').addEventListener('command', (event) => {
    // Надежная обработка нативного API и резервных вариантов
    const command = event.command || event.detail?.command;
    const target = event.currentTarget;

    // Определяем запрошенную операцию
    if (command === '--spin') {
      target.classList.toggle('is-spin');
    } else if (command === '--grow') {
      target.classList.toggle('is-grown');
    } else if (command === '--reset') {
      // Удаляем кастомные классы для возврата в начальное состояние
      target.classList.remove('is-spun', 'is-grown');
    }
  });
</script>
```

## Основные ограничения

* Названия кастомных команд должны начинаться с `--` (например, `command="--my-action"`).
* Значение атрибута `commandfor` должно совпадать со значением атрибута `id` элемента в том же дереве документа.

## Поддержка и страховка

Invoker Commands API поддерживается всеми основными браузерами с 12.12.2025.

Если Invoker Commands API не поддерживается, событие `command` не возникает. Для полной поддержки рекомендуется использовать invokers-polyfill из https://github.com/keithamus/invokers-polyfill через `npm install` или CDN.

Полифилл полностью поддерживает кастомные команды (начинающиеся с `--`) и отправляет событие `command` точно как нативный API.

### Динамический импорт (оптимизация производительности)

Для лучшей производительности полифилл следует загружать только в браузерах без поддержки. Это экономит пропускную способность и уменьшает время выполнение скрипта для пользователей современных браузеров.

```javascript
// Проверяем нативную поддержку
const hasNativeSupport = 'commandForElement' in HTMLButtonElement.prototype;

if (!hasNativeSupport) {
  // Динамически импортируем полифилл
  try {
    await import('https://cdn.jsdelivr.net/npm/invokers-polyfill@latest/dist/index.min.js');
    console.log('Полифилл Invoker Commands API загружен');
  } catch (err) {
    console.error('Ошибка загрузки полифилла:', err);
  }
}
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
