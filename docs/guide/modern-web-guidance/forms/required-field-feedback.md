# Обратная связь обязательного поля

## Проблема

Рендеринг обязательных полей в состоянии ошибки при загрузке страницы может сбивать с толку. В идеале, обязательное поле должно выглядеть "невалидным", если пользователь попытался заполнить его и не заполнил.

## Решение

Псевдокласс `:user-invalid` решает это идеально. Для обязательного поля не будет совпадения при загрузке страницы. Совпадение будет, только если:

1. Пользователь взаимодействует с полем (например, вводит символ и удаляет его) и затем покидает его (blur), оставляя его пустым.
2. Пользователь пытается отправить форму, а поле пустое.

### Стратегия по реализации

1. Ограничение HTML: добавляем атрибут `required` инпутам.
2. Визуальная обратная связь: используем `:user-invalid` для отображения красной границы и вспомогательного текста "Обязательно".
3. Тайминг: для визуальной обратной связи полагайтесь на нативный тайминг браузера. Больше не нужны обработчики `onBlur` для добавления класса `touched`, хотя некоторый JavaScript все еще нужен ждя синхронизации атрибутов ARIA (см. ниже).

## Руководство по реализации

### 1. Структура HTML

```html
<form id="feedback-form">
  <div class="field">
    <label for="full-name">Полное имя</label>
    <input
      type="text"
      id="full-name"
      name="full-name"
      required
      aria-errormessage="name-error"
    >
    <!-- Важно: добавьте иконку или отдельный не цветовой индикатор рядом с текстом ошибки -->
    <div id="name-error" class="error-msg">
      <span aria-hidden="true">❌</span>Это поле является обязательным.
    </div>
  </div>
</form>
```

### 2. CSS

```css
.error-msg {
  display: none;
  color: #d93025;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

/*
  Подсвечиваем пустые обязательные поля, только после их "посещения" пользователем.
  Важно: предоставляйте несколько индикаторов (цвет границы + вспомогательный текст/иконка), чтобы избежать передачи состояния только цветом.
*/
input:user-invalid {
  border-color: #d93025;
  background-color: #fce8e6;
}

input:user-invalid + .error-msg {
  display: block;
}

/* Опционально: небольшой индикатор валидных обязательных полей */
input:required:user-valid {
  border-color: #188038;
  border-width: 2px;
}
```

### 3. Синхронизация состояния с помощью JavaScript

Важно: поскольку `:user-invalid` - это визуальное состояние, нужен JavaScript-мост для синхронизации `aria-invalid="true"` для вспомогательных технологий, когда пользователь покидает невалидное поле или пытается отправить форму.

```javascript
const form = document.getElementById('feedback-form');

const syncAriaInvalid = (input) => {
  if (!input.checkValidity()) {
    input.setAttribute('aria-invalid', 'true');
  } else {
    input.removeAttribute('aria-invalid');
  }
};

// Синхронизируем в blur, когда взаимодействие пользователя с полем завершается
form.addEventListener('blur', (e) => {
  if (e.target.matches('input[required]')) {
    syncAriaInvalid(e.target);
  }
}, true);

// Синхронизируем все обязательные поля при отправке формы
form.addEventListener('submit', () => {
  form.querySelectorAll('input[required]').forEach(syncAriaInvalid);
});

// Удаляем состояние ошибки после начала исправления
form.addEventListener('input', (e) => {
  if (e.target.matches('input[required]') && e.target.checkValidity()) {
    e.target.removeAttribute('aria-invalid');
  }
});
```

## Поддержка и страховка

`:user-valid` и `:user-invalid` поддерживаются всеми основными браузерами с 02.11.2023.

### Резервный CSS

```css
input:user-invalid,
input.user-invalid-fallback {
  border-color: #d93025;
  background-color: #fce8e6;
}

input:user-invalid + .error-msg,
input.user-invalid-fallback + .error-msg {
  display: block;
}
```

### Резервный JavaScript

Используем утилиту, которая отслеживает состояния взаимодействия с помощью `WeakMap`. Это позволяет избежать засорения DOM "грязными" классами или data-атрибутами.

```javascript
const UserInvalidFallback = (() => {
  const dirtyState = new WeakMap();

  const updateState = (input) => {
    const isValid = input.checkValidity();

    // Обновляем внешний вид и ARIA
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

// Применяем к определенной форме
const form = document.querySelector('#demo-form');
UserInvalidFallback.init(form);
```

## Другие соображения

1. Звездочки: рекомендуется визуально обозначать обязательные поля (например, звездочкой `*`) в подписях, чтобы пользователи знали, чего ожидать до взаимодействия.
2. Кнопки отправки: не отключайте (атрибут `disabled`) кнопку отправки формы. Если пользователь нажмет на нее, браузер автоматически вызовет `:user-invalid` для всех пустых обязательных полей и установит фокус на первом. Это отлично подходит для доступности и UX.
3. Доступность: встроенный `:user-invalid` не синхронизируется автоматически с атрибутами ARIA. Следующий код JavaScript позволяет синхронизировать `aria-invalid` с визуальным состоянием:

```javascript
// Синхронизируем aria-invalid с состоянием :user-invalid
const syncAria = (el) => {
  el.setAttribute?.('aria-invalid', el.matches(':user-invalid') ? 'true' : 'false');
};

// Обновляем в blur (для отображения ошибки) и input (для удаления ошибки)
document.addEventListener('blur', (e) => syncAria(e.target), true);
document.addEventListener('input', (e) => {
  if (e.target.hasAttribute('aria-invalid')) syncAria(e.target);
});
```
