# Подсказки, отображаемые при прокрутке

## Обзор

Визуальные подсказки, такие как тени или градиенты, помогают пользователям понять, что они могут выполнить прокрутку для того, чтобы увидеть больше контента. Это руководство показывает, как создать такие подсказки с помощью `container-scroll-state-queries` (запросов состояния прокрутки контейнера) CSS, позволяющих стилизовать элементы на основе состояния прокрутки их контейнера без обработчиков прокрутки или наблюдателей (observers) JavaScript.

## Реализация

### 1. Установка контейнера прокрутки

Контейнер прокрутки должен быть определен как контейнер для запросов состояния прокрутки (scroll-state query container):

```css
.scroller {
  overflow-y: auto;
  /* Делаем элемент контейнером для запросов состояния прокрутки */
  container-type: scroll-state;
  position: relative;
}
```

### 2. Стилизация индикаторов

Помещаем элементы-индикаторы (такие как тени, градиенты или стрелки) в контейнер и стилизуем их. По умолчанию, они должны быть невидимыми. При отображении, они не должны быть интерактивными (`pointer-events: none`):

```css
.indicator-top, .indicator-bottom {
  position: sticky;
  left: 0;
  right: 0;
  height: 20px;
  opacity: 0;
  transition: opacity 0.2s;
  pointer-events: none; /* Клики должны проходить сквозь элементы */
}

.indicator-top {
  top: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.2), transparent); /* Тень */
}

.indicator-bottom {
  bottom: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.2), transparent); /* Тень */
}
```

### 3. Запрос состояния прокрутки

Используем правило `@container` с функцией `scroll-state`. Проверяем, в каком направлении прокручен контейнер, для отображения соответствующего индикатора:

```css
/* Показываем "верхний" индикатор, когда пользователь может выполнить прокрутку наверх */
@container scroll-state(scrollable: top) {
  .indicator-top {
    opacity: 1;
  }
}

/* Показываем "нижний" индикатор, когда пользователь может выполнить прокрутку вниз */
@container scroll-state(scrollable: bottom) {
  .indicator-bottom {
    opacity: 1;
  }
}
```

## Поддержка и страховка

Запросы состояния прокрутки контейнера имеют ограниченную поддержку браузеров. Поддерживаются в Chrome 133+ и Edge 133+ (с февраля 2025 года). Не поддерживаются в Firefox и Safari.

### Базовый резерв

Если функционал не поддерживается, индикаторы останутся невидимыми. Поскольку речь идет о подсказках, а не о критичной функциональности, можно не предоставлять резерв для браузеров без поддержки.

### Продвинутый резерв

Если подсказки являются обязательными, используйте `IntersectionObserver` для переключения классов CSS, когда элементы-маркеры (sentinel elements) в верхней и нижней частях прокручиваемой области входят в область прокрутки (scrollport) и выходят из нее:

```html
<!-- Элементы-маркеры, помещаемые в начало/конец прокручиваемой области -->
<div class="sentinel-top"></div>
<!-- Контент -->
<div class="sentinel-bottom"></div>
```

```css
/* Стилизуем маркеры, чтобы они не влияли на компоновку */
.sentinel-top, .sentinel-bottom {
  height: 0;
  width: 0;
  visibility: hidden;
}

.scroller.scrolled-down .indicator-top {
  opacity: 1;
}

.scroller.can-scroll-down .indicator-bottom {
  opacity: 1;
}
```

```javascript
if (!CSS.supports('container-type', 'scroll-state')) {
  const topSentinel = document.querySelector('.sentinel-top');
  const bottomSentinel = document.querySelector('.sentinel-bottom');
  const scroller = document.querySelector('.scroller');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.target === topSentinel) {
        // Если верхний маркер не пересекается, значит, выполнена прокрутка вниз
        scroller.classList.toggle('scrolled-down', !entry.isIntersecting);
      }
      if (entry.target === bottomSentinel) {
        // Если нижний маркер пересекается, значит, прокрутка достигла дна
        scroller.classList.toggle('can-scroll-down', !entry.isIntersecting);
      }
    });
  }, { root: scroller });

  observer.observe(topSentinel);
  observer.observe(bottomSentinel);
}
```
