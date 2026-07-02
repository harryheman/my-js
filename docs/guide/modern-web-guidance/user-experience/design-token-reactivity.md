# Реактивные дизайн-токены

Часто автору требуется внести контекстуальные изменения в дизайн компонента. Исторически для этого приходилось использовать селекторы для применения таких изменений. Часто это означало, что хотя многие токены дизайна могут существовать в виде кастомных свойств, высокоуровневые дизайн-токены могут кодироваться только как селекторы (например, как название класса или соглашение об атрибуте) или как пропы/контекст во фреймворках JavaScript.

Запросы стилей контейнера (container style queries) позволяют авторам стилизовать элементы на основе вычисленного значения свойства их предка. Это означает, что авторы могут писать осмысленные значения токенов дизайна в таблицах стилей, не полагаясь на разметку или JavaScript для их представления.

## Реализация

Реализация реактивного токена дизайна с помощью запроса стилей контейнера является довольно простой:

1. Устанавливаем высокоуровневый дизайн-токен как кастомное свойство на контейнере. Это не обязательно должно быть зарегистрированное кастомное свойство.
2. Используем правило `@container style()` для получения значения этого кастомного свойства.
3. Применяем соответствующие стили к потомкам контейнера.

Несколько вещей, о которых следует помнить:

- контейнер, стили которого запрашиваются, не обязан содержать свойства `container-type` или `container-name`, однако, `container-name` может пригодиться для более специфичных запросов;
- сам контейнер не может стилизоваться с помощью запроса стилей контейнера.

Базовый пример:

```html
<div class="features">
  <div class="card"></div>
  <div class="card"></div>
</div>
<div class="bugs">
  <div class="card"></div>
  <div class="card"></div>
  <div class="card"></div>
  <div class="card"></div>
</div>
```

```css
.features {
  --density: spacious;
}

.bugs {
  --density: compact;
}

@container style(--density: compact) {
  .card {
    padding: 8px;
  }
}

@container style(--density: spacious) {
  .card {
    padding: 24px;
  }
}
```

## Поддержка и страховка

Запросы стилей контейнера имеют ограниченную поддержку браузеров. Поддерживаются в Chrome 111+, Edge 111+ (с марта 2023 года) и Safari 18+ (с сентября 2024 года). Не поддерживаются в Firefox.

### Использование селекторов

Для основного функционала альтернативный подход заключается в использовании селекторов. В этом примере используется атрибут `data-density` в разметке для кодирования дизайн-токена плотности, вместо кастомного свойства CSS:

```html
<div class="features" data-density="spacious">
  <div class="card"></div>
  <div class="card"></div>
</div>
<div class="bugs" data-density="compact">
  <div class="card"></div>
  <div class="card"></div>
  <div class="card"></div>
  <div class="card"></div>
</div>
```

```css
/* `:where()` позволяет избежать повышения специфичности */
:where([data-density="compact"]) .card {
  padding: var(--card-padding-compact);
}

:where([data-density="spacious"]) .card {
  padding: var(--card-padding-spacious);
}
```

Основное ограничение этого резервного варианта в том, что он не поддерживает вложенные элементы с атрибутами `data-density`: поскольку специфичность селекторов одинаковая, для определения стилей будет использоваться порядок их объявления (т.е. `[data-density="spacious"]` всегда будет иметь преимущество над `[data-density="compact"]`).

### Использование запросов стилей в качестве прогрессивного улучшения

Хотя это не рекомендуется, для того, чтобы использовать запросы стилей как прогрессивное улучшение и избежать дублирования можно создать некоторые кастомные свойства, а после них добавить запросы стилей:

```css
.card {
  --card-padding-compact: 8px;
  --card-padding-spacious: 24px;
}

:where([data-density="compact"]) .card {
  padding: var(--card-padding-compact);
}

:where([data-density="spacious"]) .card {
  padding: var(--card-padding-spacious);
}

/* Используем запросы стилей как прогрессивное улучшение: специфичность такая же, поэтому используется порядок определения */

@container style(--density: compact) {
  .card {
    padding: var(--card-padding-compact);
  }
}

@container style(--density: spacious) {
  .card {
    padding: var(--card-padding-spacious);
  }
}
```

### Определение поддержки с помощью CSS

```css
:root {
  --style-queries-supported: check;
}

.density-toggle {
  display: none;
}

@container style(--style-queries-supported) {
  .density-toggle {
    display: revert;
  }
}
```

### Определение поддержки с помощью JavaScript

```css
:root {
  --style-queries-supported: check;
}

@container style(--style-queries-supported: check) {
  body {
    --style-queries-supported: yes;
  }
}
```

```js
if (getComputedStyle(document.body).getPropertyValue("--style-queries-supported") === "yes") {
  // Используем запросы стилей контейнера
} else {
  // Используем резервный вариант
}
```
