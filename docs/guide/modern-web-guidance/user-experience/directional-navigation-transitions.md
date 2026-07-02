# Направленные переходы навигации

В одностраничных приложениях (Single Page Applications, SPAs) маршрутизация реализуется за счет замены контента текущей страницы без перехода на новую страницу. По умолчанию, контент просто заменяется, без переходов (transitions). Направленные переходы (directional transitions) могут визуально усилить пространственные отношения между отображениями (views).

Перемещение нового контента в том направлении, в котором движется пользователь, создает мысленную карту структуры приложения. Например, продуктовый сайт может выполнять переход вправо для навигации "вперед" и влево - для "назад" или карусель может выполнять переход вверх и вниз для показа следующего и предыдущего слайдов.

## Реализация

1. Определите направление навигации: определите, пользователь двигается "вперед" или "назад" в потоке приложения. Способ определения зависит от конкретного случая.
2. Запустите переход с типами: передайте направление в массив `types` в `document.startViewTransition()` для категоризации перехода.
3. Определите направленные анимации в CSS: используйте псевдокласс `:active-view-transition-type()` для применения анимации на основе типа навигации.

## Определение ключевых кадров

Определите анимацию скольжения (sliding) в и из каждого направления. Для лучшей производительности, анимируйте изменение положения с помощью свойства `transform` или индивидуальных свойств перехода `scale`, `rotate` и `translate`. `opacity` также подходит, но избегайте анимации других свойств CSS, не проверив, что они не запускают компоновку или отрисовку.

```css
/* Скольжение элемента влево */
@keyframes slide-to-left {
  /* Анимируем `transform`, вместо `left` или `right`, для лучшей производительности */
  to { transform: translateX(-100%); }
}

/* Скольжение элемента справа налево */
@keyframes slide-from-right {
  from { transform: translateX(100%); }
}

/* Скольжение элемента вправо */
@keyframes slide-to-right {
  to { transform: translateX(100%); }
}

/* Скольжение элемента справа налево */
@keyframes slide-from-left {
  from { transform: translateX(-100%); }
}
```

## Определение настроек анимации

Используйте селектор `::view-transition-group(root)` для применения настроек анимации, которые используются всеми переходами:

```css
::view-transition-group(root){
  animation: 0.4s ease-in-out both;
}
```

## Применение направленной анимации

Используйте псевдокласс `:active-view-transition-type` для нахождения анимируемых отображений, когда активен тип "вперед" или "назад":

```css
/* Применяем прямую анимацию, когда активен тип forward */
html:active-view-transition-type(forward)::view-transition-old(root) {
  animation-name: slide-to-left;
}
html:active-view-transition-type(forward)::view-transition-new(root) {
  animation-name: slide-from-right;
}

/* Применяем обратную анимацию, когда активен тип backward */
html:active-view-transition-type(backward)::view-transition-old(root) {
  animation-name: slide-to-right;
}
html:active-view-transition-type(backward)::view-transition-new(root) {
  animation-name: slide-from-left;
}
```

## Запуск перехода

При навигации передайте соответствующий тип в метод `startViewTransition`:

```javascript
const transitionType = yourTransitionTypeLogic();
const updateDOM = yourUpdateDOMLogic();

document.startViewTransition({
  update: updateDOM,
  types: [transitionType] // Совпадает с селекторами CSS :active-view-transition-type()
});
```

## Доступность

Всегда учитывайте предпочтения пользователя по снижению движения путем отключения или упрощения анимации:

```css
@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(root) {
    animation: none !important;
  }
}
```

## Поддержка и страховка

Переходы отображения (view transitions) поддерживаются всеми основными браузерами с 14.10.2025. Переход активного отображения (active view transition) - с 13.01.2026.

View Transitions API - это прогрессивное улучшение. В браузерах без поддержки `document.startViewTransition` будет разрешаться в `undefined`. Логика навигации должна оборачиваться в проверку поддержки для обеспечения мгновенного обновления DOM без анимации, как показано в этой вспомогательной функции:

```javascript
function navigate(updateDOM, direction) {
  // Определяем поддержку
  if (!document.startViewTransition) {
    updateDOM();
    return;
  }

  // Запускаем переход с определенным типом навигации
  document.startViewTransition({
    update: updateDOM,
    types: [direction] // Совпадает с селекторами CSS :active-view-transition-type()
  });
}
```
