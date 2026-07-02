# Валидация инпута после взаимодействия

## Проблема

Отображение ошибок валидации в момент, когда пользователь фокусируется на поле и начинает вводить текст, является преждевременным и отвлекает внимание. Например, когда пользователь вводит адрес электронной почты (например, "user@mail.ru") или пароль со сложными требованиями, поле технически невалидно до завершения ввода. Стилизация с помощью псевдокласса `:invalid` приводит к немедленному отображению состояния ошибки.

## Решение

Псевдокласс `:user-invalid` позволяет отображать состояние ошибки только после взаимодействия пользователя с полем или при попытке отправить форму.

### Стратегия реализации

1. Ограничение HTML: используйте стандартные атрибуты HTML5, такие как `type="email"`, `pattern` и `required` для включения встроенной браузерной валидации.
2. Визуальная обратная связь: используйте `:user-invalid` для применения стилей ошибки только после взаимодействия пользователя с полем.
3. Позитивное подкрепление: опционально используйте `:user-valid` для индикации успеха при удовлетворении требований.
4. Мягкое восстановление: как только пользователь достиг правильного формата, `:user-invalid` перестает совпадать, удаляя состояние ошибки.

## Руководство по реализации

### Случай 1: валидация электронной почты

Полагайтесь на стандартные атрибуты HTML5 для таких полей. Сообщение об ошибке скрыто по умолчанию и отображается, когда браузер определяет, что пользователь покинул поле в невалидном состоянии.

```html
<form>
  <div class="field">
    <label for="email">Адрес электронной почты</label>
    <!-- Размещайте подсказки о формате над инпутом, чтобы поповеры автозаполнения не закрывали их во время редактирования -->
    <span id="email-hint" class="hint">Формат: you@example.com</span>
    <!-- Используйте стандартные атрибуты валидации, такие как type="email" и required -->
    <input
      type="email"
      id="email"
      name="email"
      required
      autocomplete="email"
      aria-describedby="email-hint"
      aria-errormessage="email-error"
    >
    <div id="email-error" class="error-msg">
      <span aria-hidden="true">❌</span>Пожалуйста, введите правильный адрес электронной почты.
    </div>
  </div>
</form>
```

```css
.hint {
  display: block;
  color: #5f6368;
  font-size: 0.85rem;
  margin-bottom: 0.25rem;
}

.error-msg {
  display: none;
  color: #d93025;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

/*
  Применяем стили ошибки только после взаимодействия пользователя с полем.
  Используем несколько индикаторов (цвет границы/фона + иконка/текст).
*/
input:user-invalid {
  border-color: #d93025;
  background-color: #fce8e6;
}

/* Находим сообщение об ошибке, используя соседний одноуровневый селектор */
input:user-invalid + .error-msg {
  display: block;
}

/* Предоставляем индикатор успеха с помощью :user-valid */
input:user-valid {
  border-color: #188038;
}
```

### Случай 2: сложность пароля

Определяйте правило сложности, используя шаблон просмотра регулярных выражений в атрибуте `pattern`. Список правил должен отображаться над вводом, чтобы помочь пользователю, и выделяться, если есть ошибка.

```html
<form>
  <div class="field">
    <label for="password">Новый пароль</label>
    <!-- Подсказки и правила должны размещаться над инпутом, чтобы мобильные клавиатуры их не перекрывали -->
    <ul id="password-rules" class="rules-list">
      <li>Минимум 8 символов</li>
      <li>Одна заглавная буква</li>
      <li>Одна цифра</li>
      <li>Один специальный символ</li>
    </ul>
    <!-- Используйте атрибуты pattern и minlength для валидации сложного пароля -->
    <input
      type="password"
      id="password"
      autocomplete="new-password"
      required
      pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}"
      minlength="8"
      aria-describedby="password-rules"
    >
  </div>
</form>
```

```css
/* Нейтральное дефолтное состояние */
.rules-list {
  color: #5f6368;
  margin-bottom: 0.5rem;
}

/* Показываем состояние ошибки после взаимодействия */
input:user-invalid {
  border-color: #d93025;
  background-color: #fce8e6;
}

/* Подсвечиваем список правил в случае ошибки с помощью современного селектора :has() */
.field:has(input:user-invalid) .rules-list {
  color: #d93025;
  font-weight: 600;
}

/* Добавляем индикатор успеха с помощью :user-valid */
input:user-valid {
  border-color: #188038;
}

/* Скрываем список правил в случае успеха */
.field:has(input:user-valid) .rules-list {
  display: none;
}
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

1.  Доступность:
    * используйте `aria-describedby` для связывания списка правил с инпутом;
    * не скрывайте список правил до тех пор, пока инпут не станет валидным.
2. Ограничения шаблона: атрибут `pattern` ищет полное совпадение (подразумевается `^...$`). Убедитесь, что ваши регулярные выражения пароля учитывают всю строку.
3. Строгость валидации: дефолтная валидация браузера для `type="email"` довольно мягкая (например, `user@localserver` может пройти). Для более строгой валидации используйте специальную библиотеку или кастомную функцию в дополнение к `type="email"`.
4. Управление фокусом: если пользователь отправляет форму с невалидным полем, браузер устанавливает фокус на первое невалидное поле. После этого применяются стили `:user-invalid`, поскольку отправка формы считается взаимодействием.
5. Доступность: встроенный `:user-invalid` не синхронизируется автоматически с атрибутами ARIA. Следующий код JavaScript позволяет синхронизировать `aria-invalid` с визуальным состоянием:

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
