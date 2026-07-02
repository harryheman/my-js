# Кастомные операции кнопок

Invoker Commands API позволяет кнопкам запускать операции на целевых элементах декларативно с помощью атрибутов HTML. Этот подход уменьшает потребность в ручных обработчиках событий и отделяет UI от деталей реализации. Для кастомных специфичных для приложения операций можно определять собственные названия команд. Кастомные команды должны начинаться с двойного дефиса (`--`) во избежание коллизий с будущими встроенными командами браузера.

## Реализация

1. Определите целевой элемент: определите элемент, который будет отвечать на операцию. Добавьте ему уникальный `id`.
2. Настройте вызывающую (invoker) кнопку: используйте атрибут `commandfor` для указания `id` целевого элемента и атрибут `command` для определения названия кастомной команды (начинающегося с `--`).
3. Добавьте обработку событий `command`: зарегистрируйте обработчик событий `command` прямо на целевом элементе. Объект события содержит свойства `command` и `target` (содержащее ссылку на элемент, определенный `commandfor`).
4. Добавьте обработку состояний ARIA: кастомные команды не имеют наследуемой семантики, поэтому состояния, вроде `aria-pressed` или `aria-expanded`, должны обрабатываться вручную.

## Пример: кастомные контролы анимации

```html
<!-- Целевой элемент, который будет отвечать на кастомные команды -->
<div id="action-target" class="target">
  Цель операции
</div>

<!-- Кнопки, декларативно привязанные к целевому элементу. -->
<!-- Каждая кнопка отправляет уникальное название команды, начинающееся с '--' -->
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
  // 1. Опционально: определяем реестр операций для чистоты логики
const commandRegistry = {
  '--spin': (target, source) => {
    const isSpun = target.classList.toggle('is-spun');
    // Устанавливаем состояния ARIA, поскольку кастомные команды не имеют наследуемой семантики
    source?.setAttribute('aria-pressed', isSpun);
  },
  '--grow': (target, source) => {
    const isGrown = target.classList.toggle('is-grown');
    source?.setAttribute('aria-pressed', isGrown);
  },
  '--reset': (target) => {
    target.classList.remove('is-spun', 'is-grown');
    // Сбрасываем все состояния ARIA
    document.querySelectorAll(`button[commandfor="${target.id}"]`).forEach(btn => {
      btn.setAttribute('aria-pressed', 'false');
    });
  },
};

  // 2. Регистрируем событие 'command' прямо на целевом элементе
  // (это обязательно, поскольку 'command' не всплывает)
  document.getElementById('action-target').addEventListener('command', (event) => {
    const command = event.command;
    const target = event.target;
    const source = event.source; // event.source ссылается на кнопку-источник
    const action = commandRegistry[command];

    if (action) {
      action(target, source);
    }
  });
</script>
```

## Основные ограничения

* Все названия кастомных команд должны начинаться с `--` (например, `command="--my-action"`).
* Атрибут `commandfor` должен совпадать с `id` элемента в одном дереве документа.
* Событие `command` не всплывает (bubble). При наличии нескольких возможных целей, добавьте `{ capture: true }` к обработчику событий и выполняйте обработку на общем предке.
* Если целью может быть теневой корневой элемент (shadow root), используйте `event.composedPath()[0]`, вместо `event.target`.
* Кастомные команды не имеют наследуемой семантики, поэтому все состояния, связанные с доступностью, должны применяться вручную.

## Поддержка и страховка

Invoker Commands API поддерживается всеми основными браузерами с 12.12.2025.

Если Invoker Commands API не поддерживается, событие `command` не возникает. Для полной поддержки во всех современных браузерах рекомендуется использовать полифилл из `https://github.com/keithamus/invokers-polyfill` через `npm install` или CDN.

Этот полифилл поддерживает кастомные операции (начинающиеся с `--`) и отправляет событие `command` в точности как нативный API.

### Динамический импорт (оптимизация производительности)

Для лучшей производительности полифилл следует загружать только в браузерах без поддержки. Это экономит пропускную способность и снижает время выполнения скрипта для пользователей современных браузеров.

Обратите внимание: полифилл не управляет состояниями ARIA (такими как `aria-pressed` или `aria-expanded`) для кастомных команд. Эти состояния должны вручную синхронизироваться с обработчиком событий для обеспечения доступности сайта:

```javascript
// 1. Условная загрузка полифилла
const hasNativeSupport = 'commandForElement' in HTMLButtonElement.prototype;

if (!hasNativeSupport) {
  // Оборачиваем в асинхронное IIFE во избежание проблем с верхнеуровневым await в старых браузерах
  (async () => {
    try {
      await import('https://esm.run/invokers-polyfill');
    } catch (err) {
      console.error('Ошибка загрузки резерва:', err);
    }
  })();
}

// 2. Вручную управляем состояниями ARIA в обработчике
document.getElementById('action-target').addEventListener('command', (event) => {
  const command = event.command;
  const target = event.target;
  const source = event.source; // Кнопка, которая запустила команду

  if (command === '--spin') {
    const isSpun = target.classList.toggle('is-spun');

    // Вручную обновляем ARIA для отражения нового состояния
    source?.setAttribute('aria-pressed', isSpun);
  }
});
```

### Ручной резерв (традиционный шаблон)

Вместо полифилла, можно использовать комбинацию делегирования событий для отправки событий и реестра команд для обработки операций. Это популярный архитектурный шаблон веб-разработки, который остается высокоэффективным и масштабируемым:

```javascript
// 1. Опционально: определяем реестр операций для чистоты логики
const commandRegistry = {
  '--spin': (target) => target.classList.toggle('is-spun'),
  '--grow': (target) => target.classList.toggle('is-grown'),
  '--reset': (target) => target.classList.remove('is-spun', 'is-grown'),
};

// 2. Если CommandEvent не существует, значит, поддержка отсутствует, предоставляем резерв
if (!globalThis.CommandEvent) {
  globalThis.CommandEvent = class CommandEvent extends Event {
    constructor(type, { source, command, ...options } = {}) {
      super(type, options);
      this.source = source;
      this.command = command;
    }
  }
}

// 3. Резерв: отправляем события вручную при отсутствии поддержки
  document.addEventListener('click', (event) => {
    const button = event.composedPath().find((el) => el.matches?.("button[commandfor]"));
    if (!button) return;

    const target = document.getElementById(button.getAttribute('commandfor'));
    const command = button.getAttribute('command');

    if (target && command) {
      target.dispatchEvent(new CommandEvent('command', {
        command,
        source: button,
      }));
    }
  });

// 4. Регистрируем унифицированный обработчик прямо на целевом элементе
document.getElementById('action-target').addEventListener('command', (event) => {
  const command = event.command;
  const target = event.target;
  const action = commandRegistry[command];

  if (action) {
    action(target);
  }
 });
```
