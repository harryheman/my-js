# Эффект параллакса при прокрутке

Эффект параллакса (parallax effect) при прокрутке - это визуальная техника, когда разные слои контента двигаются с разной скоростью по мере прокрутки страницы пользователем. Это создает иллюзию глубины, когда элементы переднего плана кажутся движущимися быстрее, чем элементы фона, что создает вовлекающий и захватывающий опыт просмотра. Этот эффект легко реализовать с помощью анимации CSS, управляемой прокруткой (Scroll-Driven Animations), которая позволяет привязывать анимацию к положению прокрутки контейнера.

## Реализация

Базовый эффект параллакса можно реализовать следующим образом:

1. Создаем элемент-обертку: этот элемент просто группирует все слои эффекта. Это не прокручиваемый элемент, поэтому его переполнение должно быть обрезано. Также устанавливаем ему `height`, совпадающую с высотой одного слоя эффекта:

```html
<div class="wrapper">
  …
</div>
```

```css
.wrapper {
  overflow: clip;
  height: 100vh; /* Высота одного слоя эффекта параллакса */
}
```

2. Определяем слои: внутри обертки добавляем отдельные слои, которые будут двигаться с разной скоростью:

```html
<div class="wrapper">
  <div class="layer">СЛОЙ 0</div>
  <div class="layer">СЛОЙ 1</div>
  <div class="layer">СЛОЙ 2</div>
  …
</div>
```

3. Добавляем анимацию перемещения: определяем анимацию CSS, которая меняет свойство `transform` слоев. Для эффекта параллакса, как правило, используется `translateY` для вертикального перемещения слоев:

```css
@keyframes parallax {
  from {
    transform: translateY(700px);
  }
}
```

4. Настраиваем `view-timeline`: для привязки анимации к положению прокрутки, создаем `view-timeline` на обертке и применяем ее к слоям:

```css
.wrapper {
  view-timeline: --wrapper;
}

.layer {
  animation: parallax linear both;
  animation-timeline: --wrapper;
}
```

5. Добавляем задержку (staggering) между анимациями - для того, чтобы слои двигались с разной скоростью, можно применить одну из двух основных техник: задержка в ключевых кадрах или задержка в `animation-range`.

    В обоих подходах могут использоваться фиксированные значения или  `sibling-index()`/`sibling-count()`. Фиксированные значения проще и также полезны при ограниченном числе слоев. `sibling-index()`/`sibling-count()` полезны, когда слоев много.

    * Задержка в ключевых кадрах:

      С помощью фиксированных значений можно определить кастомное свойство для каждого слоя для ручного управления эффектом параллакса:

      ```css
      .layer:nth-child(1) { --offset: 100px; }
      .layer:nth-child(2) { --offset: 200px; }
      .layer:nth-child(3) { --offset: 300px; }

      @keyframes parallax {
        from {
          transform: translateY(var(--offset));
        }
      }
      ```

      Функция `sibling-index()` возвращает индекс потомка среди сиблингов, который можно использовать для автоматического вычисления задержки:

      ```css
      @keyframes parallax {
        from {
          transform: translateY(calc(100px * sibling-index()));
        }
      }
      ```

    * Задержка в `animation-range`:

      С помощью фиксированных значений можно явно определить границы `animation-range` отдельно для каждого слоя:

      ```css
      .layer:nth-child(1) { animation-range: entry 25% exit 50%; }
      .layer:nth-child(2) { animation-range: entry 25% exit 75%; }
      .layer:nth-child(3) { animation-range: entry 25% exit 100%; }
      ```

      С помощью `sibling-index()` и `sibling-count()` можно вычислить диапазон математически на основе общего количества слоев (`sibling-count()`):

      ```css
      .layer {
        animation-range: entry 25% exit calc(100% / sibling-count() * sibling-index());
      }
      ```

## Пример кода

```css
@keyframes parallax {
  from {
    transform: translateY(calc(100px * sibling-index()));
  }
}

.wrapper {
  view-timeline: --wrapper;
}

.layer {
  animation: parallax linear both;
  animation-timeline: --wrapper;
}

@media (prefers-reduced-motion: reduce) {
  .layer {
    animation: none;
  }
}
```

В качестве альтернативы можно использовать свойство `animation-range` для достижения аналогичного эффекта:

```css
@keyframes parallax {
  from {
    transform: translateY(700px);
  }
}

.wrapper {
  view-timeline: --wrapper;
}

.layer {
  animation: parallax linear both;
  animation-timeline: --wrapper;
  animation-range: entry 25% exit calc(100% / sibling-count() * sibling-index());
}

@media (prefers-reduced-motion: reduce) {
  .layer {
    animation: none;
  }
}
```

## Лучшие практики

При использовании анимации, управляемой прокруткой, важно следовать нескольким лучшим практикам для обеспечения плавного и доступного (accessible) опыта:

- Включайте определение поддержки: не все браузеры поддерживают анимацию, управляемую прокруткой. Используйте `@supports ((animation-timeline: view()) and (animation-range: entry))` для определения поддержки и предоставляйте резерв для браузеров без поддержки.
  - Проверка `(animation-range: entry)` нужна для исключения браузеров с частичной поддержкой.
  - Не используйте пакет `scroll-timeline-polyfill` в качестве резерва, поскольку он поддерживает не весь функционал и имеет большое количество известных проблем.
  - Если анимация является чисто декоративной, резерв можно не предоставлять.
- Учитывайте предпочтения пользователя: некоторые пользователи предпочитают меньше движения в вебе. Используйте медиа-запрос `prefers-reduced-motion` для отключения или снижения количества анимаций для таких пользователей.
- Старайтесь анимировать только "производительные" свойства CSS: для более плавной анимации старайтесь анимировать свойства, которые могут обрабатываться потоком компоновщика браузера, такие как `transform` и `opacity`. Анимация других свойств, таких как `width` или `height`, может привести к проблемам с производительностью.
- Используйте правильный порядок определения свойств: при использовании сокращения `animation`, определяйте `animation-timeline` и `animation-range` после него, чтобы сокращение не сбрасывало временную шкалу.

При установке `animation-range`:

- Указывайте одинаковый начальный отступ для всех слоев, например, `entry 25%`.
- Указывайте всем слоям разный конечный отступ с помощью `sibling-count()` и `sibling-index()` для распределения отступов, например, `exit calc(100% / sibling-count() * sibling-index())`.

## Поддержка и страховка

Анимация, управляемая прокруткой, имеет ограниченную поддержку браузеров. Поддерживается в Chrome 115+, Edge 115+ (с июля 2023 года) и Safari 26+ (с сентября 2025 года). Не поддерживается в Firefox.

Для браузеров без поддержки можно использовать резерв для воссоздания визуальных эффектов. Резерв, как правило, создается с помощью обработчика прокрутки (для эффектов ScrollTimeline) или IntersectionObserver API (для эффектов ViewTimeline).

В браузерах с поддержкой всегда используйте нативную реализацию CSS, поскольку она гораздо более производительна.

Обратите внимание, что не все эффекты можно воссоздать с помощью резерва.

Следующий скрипт применяет резерв для браузеров, не поддерживающих анимацию, управляемую прокруткой. В нем используется `IntersectionObserver` для отслеживания видимости элемента `.wrapper` и обновления свойства `transform` слоев на основе положения прокрутки:

```js
if (!CSS.supports('(animation-timeline: view()) and (animation-range: entry)')) {
  const wrapper = document.querySelector('.wrapper');
  const layers = document.querySelectorAll('.layer');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        window.addEventListener('scroll', onScroll);
      } else {
        window.removeEventListener('scroll', onScroll);
      }
    });
  }, { threshold: 0 });

  observer.observe(wrapper);

  function onScroll() {
    const scrollY = window.scrollY;
    const wrapperRect = wrapper.getBoundingClientRect();
    const wrapperTop = wrapperRect.top + scrollY;
    const wrapperHeight = wrapperRect.height;
    const windowHeight = window.innerHeight;

    if (scrollY >= wrapperTop - windowHeight && scrollY <= wrapperTop + wrapperHeight) {
      const scrollPercent = (scrollY - (wrapperTop - windowHeight)) / (wrapperHeight + windowHeight);

      layers.forEach((layer, index) => {
        // Это соответствует эффекту, определенному в CSS выше
        const initialTranslateY = 100 * index;
        const translateY = initialTranslateY * (1 - scrollPercent);
        layer.style.transform = `translateY(${translateY}px)`;
      });
    }
  }

  // Запускаем `onScroll()` после установки начальной позиции
  onScroll();
}
```
