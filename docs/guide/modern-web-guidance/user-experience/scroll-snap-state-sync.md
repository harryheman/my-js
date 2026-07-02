# Синхронизация состояния привязки прокрутки

Синхронизация состояния UI с положением привязки (snap position) прокручиваемого контейнера исторически требовала сложных обработчиков прокрутки, ручных вычислений отступов прокрутки (scroll offsets) и наблюдателей пересечений (intersection observers). Событие `scrollsnapchange` предоставляет нативный, эффективный способ определения, когда прокручиваемый элемент фиксируется (settle) на новой цели привязки (snap target), что может быть полезным для синхронизации боковых панелей  или подсветки активного раздела в оглавлении.

## Реализация

### 1. Настройка привязки прокрутки в CSS

Контейнер должен иметь определенный `scroll-snap-type` и содержать потомков с `scroll-snap-align`, чтобы браузер мог отслеживать цели привязки. В длинной статье с оглавлением это можно использовать для привязки заголовков разделов к верху/началу области просмотра:

```css
main {
    /* Включаем привязку прокрутки на контейнере */
  scroll-snap-type: y proximity;
  overflow-y: auto;
}

h2 {
  /* Определяем, как заголовки выравниваются при привязке */
  scroll-snap-align: start;
}
```

### 2. Регистрация изменений привязки

Событие `scrollsnapchange` на прокручиваемом контейнере позволяет реагировать на завершение прокрутки пользователем и "докрутку" к новому элементу браузером. В следующем примере это используется для подсветки активной ссылки в сайдбаре:

```html
<!-- Оборачиваем ссылки оглавления в правильную разметку навигации -->
<nav aria-label="Table of contents">
  <ul>
    <li><a href="#section-1" aria-current="location">Раздел 1</a></li>
    <li><a href="#section-2">Раздел 2</a></li>
  </ul>
</nav>
```

```javascript
const main = document.getElementById('main');
const links = document.querySelectorAll('nav a');

// Это событие возникает, когда прокручиваемый контейнер фиксируется на новой цели привязки
main.addEventListener('scrollsnapchange', (event) => {
  // `snapTargetBlock` - вертикальная ось, `snapTargetInline` - горизонтальная
  const snappedHeader = event.snapTargetBlock;

  if (snappedHeader) {
    setSelectedParagraph(snappedHeader.id);
  }
});
```


## Доступность

Хотя события привязки прокрутки (scroll snap events) позволяют визуально синхронизировать контент с состоянием прокручиваемого контейнера, они не предоставляют эту информацию программно. Отношения между элементами, активные состояния и "живой" контент должны отражаться в дереве доступности.

Для оглавления убедитесь, что ссылки сайдбара используют `aria-current="true"` или `aria-current="location"`, когда они активны.

Кроме того, будьте осторожны при использовании значения `mandatory` для `scroll-snap-type`, поскольку оно может сделать контент между точками привязки недоступным, когда он длиннее экрана.

## Поддержка и страховка

События привязки прокрутки имеют ограниченную поддержку браузеров. Поддерживаются в Chrome 129+ и Edge 129+ (с сентября 2024 года). Не поддерживаются в Firefox и Safari.

Если `scrollsnapchange` не поддерживается, используйте `IntersectionObserver` для определения элемента, который находится в начале прокручиваемого контейнера. Обратите внимание, что это будет запускаться при начале прокрутки, а не при ее фиксации, как в случае с `scrollsnapchange`:

```javascript
// Определяем поддержку событий привязки прокрутки
if (!('onscrollsnapchange' in HTMLElement.prototype)) {
  const observer = new IntersectionObserver(
    () => {
      // При каждом изменении набора пересекающихся заголовков,
      // находим первый видимый заголовок сверху
      const topEntry = [...headers].reduce((currentTop, header) => {
        // Используем `bottom` для обработки прокрутки наверх, когда `top` еще не виден
        const {bottom} = header.getBoundingClientRect();
        // Не совпадает, если низ заголовка находится над областью прокрутки (scrollport)
        if (bottom < 0) return;
        if (!currentTop) return header;
        return bottom <
          currentTop.getBoundingClientRect().bottom
          ? header
          : currentTop;
      }, undefined);
      if (topEntry) setSelectedParagraph(topEntry.id);
    },
    { root: main, threshold: 0.9 },
  );

  // Отслеживаем все цели привязки (например, заголовки разделов)
  document.querySelectorAll('h2').forEach(header => observer.observe(header));
}
```
