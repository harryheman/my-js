# Стилизация родительского элемента

## Проблема

Часто состояние ошибки требует стилизации элементов за пределами невалидного инпута, например, изменение цвета границ родительского `fieldset`, подсветка `<label>` или отображение иконки глобальной ошибки в заголовке карточки. Исторически, это требовало использования JavaScript для переключения классов CSS на родительских элементах.

## Решение

Комбинация `:has()` с `:user-invalid` позволяет декларативно стилизовать любого предка на основе состояния валидности определенного потомка. Это позволяет инкапсулировать всю презентационную логику в CSS.

### Стратегия реализации

1. Селектор: используйте `.parent:has(:user-invalid)` для нахождения целевого контейнера.
2. Область видимости: будьте максимально конкретными во избежание проблем с производительностью. Ищите `.field-group`, вместо `body`.
3. Резерв: если `:has()` не поддерживается, для переключения классов CSS на родительском элементе нужен JS.

## Руководство по реализации

### 1. Структура HTML

```html
<form>
  <div class="card-section">
    <div class="header">
      <h3>Настройки профиля</h3>
      <span class="status-icon"></span>
    </div>

    <div class="field">
      <label for="username">Имя пользователя</label>
      <input type="text" id="username" required>
    </div>
  </div>
</form>
```

### 2. CSS

```css
/* Дефолтное состояние */
.card-section {
  border: 1px solid #ccc;
  border-left: 4px solid #ccc;
}

/*
  Логика стилизации предка:
  если карточка содержит любой невалидный инпут,
  делаем левый край всей карточки красным
*/
.card-section:has(:user-invalid) {
  border-left-color: #d93025;
  background-color: #fff8f8;
}

/* Также меняем иконку */
.card-section:has(:user-invalid) .status-icon::after {
  content: "⚠️";
}
```

## Поддержка и страховка

Псевдокласс `:user-invalid` давно поддерживается всеми основными браузерами. В старых браузерах нужно предусмотреть резерв.

### Резервный CSS

Для имитации поведения `:has()` можно использовать класс `.has-error` на предке:

```css
/* Современный подход */
.card-section:has(:user-invalid) {
  border-left-color: #d93025;
}

/* Резерв */
.card-section.has-error-fallback {
  border-left-color: #d93025;
}
```

### Резервный JavaScript

Повторно используемая утилита, которая отслеживает состояние взаимодействия с помощью `WeakMap`. Это предотвращает засорение DOM "грязными" классами или атрибутами данных:

```javascript
const UserInvalidFallback = (() => {
  const dirtyState = new WeakMap();

  const updateState = (input) => {
    const isValid = input.checkValidity();

    // Обновляем визуальное и ARIA состояния
    input.classList.toggle('user-invalid-fallback', !isValid);
    input.classList.toggle('user-valid-fallback', isValid);

    if (!isValid) {
      input.setAttribute('aria-invalid', 'true');
    } else {
      input.removeAttribute('aria-invalid');
    }
  };

  const handleEvent = (event) => {
    const input = event.target;

    if (event.type === 'reset') {
      const controls = input.elements || [];
      for (const control of controls) {
        dirtyState.delete(control);
        control.classList.remove('user-invalid-fallback');
        control.classList.remove('user-valid-fallback');
        control.removeAttribute('aria-invalid');
      }
      return;
    }

    if (!input.checkValidity) return;

    if (event.type === 'input' || event.type === 'change') {
      const state = dirtyState.get(input) || { hasInteracted: false, hasBlurred: false };
      state.hasInteracted = true;
      dirtyState.set(input, state);
      if (state.hasBlurred) {
        updateState(input);
      }
    } else if (event.type === 'blur') {
      const state = dirtyState.get(input) || { hasInteracted: false, hasBlurred: false };
      state.hasBlurred = true;
      dirtyState.set(input, state);
      if (state.hasInteracted) {
        updateState(input);
      }
    }
  };

  const init = (root = document) => {
    if (CSS.supports('selector(:user-invalid)')) return;

    root.addEventListener('blur', handleEvent, true); // Стадия захвата
    root.addEventListener('input', handleEvent);
    root.addEventListener('change', handleEvent);
    root.addEventListener('reset', handleEvent, true); // Захват сброса
  };

  return { init };
})();

// Инициализируем для определенной формы
const form = document.querySelector('#demo-form');
UserInvalidFallback.init(form);
```

```js
// 1. Инициализируем общий резерв
const form = document.querySelector('#demo-form');
UserInvalidFallback.init(form);

// 2. Добавляем специализированную логику "стилизации предка" (отдельно от резерва).
// Обрабатываем изменения валидности формы после взаимодействия
form.addEventListener('blur', (e) => {
  if (!e.target.matches('input, select, textarea')) return;

  // Находим контейнер для стилизации (синхронизация с CSS)
  const container = e.target.closest('.card-section');
  if (!container) return;

  // Проверяем, есть ли в этом контейнере невалидные инпуты
  const hasError = container.querySelector('.user-invalid-fallback');
  container.classList.toggle('has-error-fallback', !!hasError);
}, true); // Стадия захвата

// Обрабатываем события ввода для мгновенной очистки
form.addEventListener('input', (e) => {
  const container = e.target.closest('.card-section');
  if (container) {
    const hasError = container.querySelector('.user-invalid-fallback');
    container.classList.toggle('has-error-fallback', !!hasError);
  }
});

// Обрабатываем сброс формы
form.addEventListener('reset', () => {
  form.querySelectorAll('.has-error-fallback').forEach(el => {
    el.classList.remove('has-error-fallback');
  });
});
```

## Другие соображения

1.  Доступность: нативный `:user-invalid` не синхронизируется автоматически с атрибутами ARIA. Добавляем следующий JavaScript для синхронизации `aria-invalid` с визуальным состоянием:

```javascript
// Синхронизируем `aria-invalid` с `:user-invalid`
const syncAria = (el) => {
  el.setAttribute?.('aria-invalid', el.matches(':user-invalid') ? 'true' : 'false');
};

// Обновляем при `blur` (для отображения ошибки) и `input` (для ее очистки)
document.addEventListener('blur', (e) => syncAria(e.target), true);
document.addEventListener('input', (e) => {
  if (e.target.hasAttribute('aria-invalid')) syncAria(e.target);
});
```
