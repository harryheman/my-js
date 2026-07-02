# Взаимодействие с меню селекта

## Проблема

Для обязательных выпадающих списков (например, "Выберите страну"), стандартная валидация помечает поле как невалидное сразу, если дефолтный вариант имеет пустое значение. Это может создать визуальный шум. Ошибка должна отображаться, только если пользователь открыл меню и закрыл его, не выбрав вариант, или попытался отправить форму.

## Решение

Псевдокласс `:user-invalid` отлично работает с элементами `<select>`. Это учитывает поток взаимодействия пользователей: простая загрузка страницы или установка/снятие фокуса без внесения изменений не считаются взаимодействиями, поэтому поле остается нейтральным до тех пор, пока пользователь не сделает активный выбор.

### Стратегия реализации

1. Ограничение HTML: используйте `<select>` с `required`. Первый вариант для выбора должен иметь `value=""` и, в идеале, быть отключенным/скрытым для формирования валидного выбора.
2. Визуальная обратная связь: используйте `:user-invalid` для стилизации границ блока селекта.
3. Тайминг: браузер считает поле "подвергшимся взаимодействию", если пользователь изменил его значение (даже если он вернулся к дефолтному невалидному состоянию) перед снятием фокуса, или попытался отправить форму.

## Руководство по реализации

### 1. Структура HTML

Ключевым здесь является вариант-заполнитель (placeholder):

```html
<form>
  <div class="field">
    <label for="country">Страна</label>
    <select
      id="country"
      name="country"
      required
      aria-errormessage="country-error"
    >
      <option value="" disabled selected>Выберите страну...</option>
      <option value="ru">Россия</option>
      <option value="ch">Китай</option>
      <option value="us">США</option>
    </select>
    <div id="country-error" class="error-msg">
      Пожалуйста, выберите страну.
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
  Отображаем ошибку только после взаимодействия пользователя с меню выбора
*/
select:user-invalid {
  border-color: #d93025;
  background-color: #fce8e6;
}

select:user-invalid + .error-msg {
  display: block;
}

select:user-valid {
  border-color: #188038;
}
```

## Поддержка и страховка

Псевдоклассы `:user-valid` и `:user-invalid` поддерживаются всеми основными браузерами с 11.02.2023.

### Резерв CSS

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

### Резерв JavaScript

Используем утилиту для отслеживания состояния взаимодействия с помощью `WeakMap`. Это позволяет избежать засорения DOM "грязными" классами или атрибутами данных:

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

## Другие соображения

1. Мобильное поведение: на мобильных устройствах "размытие" возникает по-разному в зависимости от пикера OS. Рекомендуется тестировать функционал на реальных устройствах.
2. Доступность: нативный `:user-invalid` не синхронизируется автоматически с атрибутами ARIA. Для синхронизации `aria-invalid` с визуальным состоянием добавьте следующий скрипт:

```javascript
// Синхронизируем `aria-invalid` с состоянием `:user-invalid`
const syncAria = (el) => {
  el.setAttribute?.('aria-invalid', el.matches(':user-invalid') ? 'true' : 'false');
};

// Обновляем при `blur` (для отображения ошибки) и `input` (для ее очистки)
document.addEventListener('blur', (e) => syncAria(e.target), true);
document.addEventListener('input', (e) => {
  if (e.target.hasAttribute('aria-invalid')) syncAria(e.target);
});
```
