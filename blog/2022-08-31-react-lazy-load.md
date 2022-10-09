---
slug: react-lazy-load
title: Разрабатываем HOC и хук для наблюдения за элементами
description: Разрабатываем HOC и хук для наблюдения за элементами
authors: harryheman
tags: [javascript, js, react.jd, reactjs, react, typescript, ts, hook, "custom hook", "intersection observer api", "intersection observer", hoc, "higher order component", хук, "кастомный хук", компонент высшего порядка]
image: https://habrastorage.org/webt/jc/hw/st/jchwst6a3nwlxlscnmuw5tdhmry.png
---

<img src="https://habrastorage.org/webt/jc/hw/st/jchwst6a3nwlxlscnmuw5tdhmry.png" />

Привет, друзья!

В данной статье мы с вами разработаем HOC (Higher-Order Component — компонент высшего порядка) и хук (custom hook) для наблюдения за DOM-элементами на странице с помощью [Intersection Observer API](https://developer.mozilla.org/ru/docs/Web/API/Intersection_Observer_API).

Функционал нашего HOC будет похож на функционал, предоставляемый такими пакетами, как [react-lazyload](https://www.npmjs.com/package/react-lazyload) или [react-lazy-load](https://www.npmjs.com/package/react-lazy-load). Основное его назначение будет состоять в отложенной (ленивой — lazy) загрузке компонентов. Суть идеи заключается в рендеринге только тех компонентов, которые находятся в области просмотра (viewport — вьюпорт), что может существенно повысить производительность приложения.

Назначением хука будет регистрация пересечения (intersection) наблюдаемого (observable) элемента с областью просмотра (или другим элементом). Этот хук предоставляет очень интересные возможности, парочка из которых будет рассмотрена в соответствующем разделе.

[Репозиторий с кодом проекта](https://github.com/harryheman/Blog-Posts/tree/master/react-lazy-load)

При разработке инструментов я буду применять систему типов, предоставляемую [TypeScript](https://my-js.org/docs/guide/ts).

<!--truncate-->

## HOC

Предположим, что у нас имеется такой список дорогих для производительности элементов/компонентов:

```tsx
// тяжелый с точки зрения вычислений элемент списка
const Item = (props: { n: number }) => {
  console.log("render");

  return <div className="item">{props.n}</div>;
};

// список из 10 элементов
const List = () => (
  <div className="list">
    {Array.from({ length: 10 }).map((_, i) => (
        <Item key={i} n={i + 1} />
    ))}
  </div>
);

function App() {
  return <List />;
}

export default App;
```

С такими стилями:

```css
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.item {
  background-color: deepskyblue;
  display: grid;
  font-size: 2rem;
  height: 50vh;
  place-content: center;
}
```

Элемент занимает половину области просмотра. Следовательно, в области просмотра помещается всего 2 таких элемента. Есть ли смысл рендерить остальные 8? Как предотвратить рендеринг компонентов, находящихся за пределами вьюпорта? Один из вариантов — обернуть элементы в HOC для ленивой загрузки:

```tsx
import LazyLoad from "./LazyLoad";

const List = () => (
  <div className="list">
    {Array.from({ length: 10 }).map((_, i) => (
      // !
      <LazyLoad key={i}>
        <Item n={i + 1} />
      </LazyLoad>
    ))}
  </div>
);
```

Реализуем этот HOC.

Вместо компонента, находящегося за пределами вьюпорта, будет рендериться его заменитель (placeholder):

```tsx
import React from "react";

const Placeholder = (props: {
  width?: number | string;
  height?: number | string;
}) => {
  const width =
    props.width && typeof props.width === "string"
      ? props.width
      : props.width + "px";
  const height =
    props.height && typeof props.height === "string"
      ? props.height
      : props.height + "px";

  return <div className="child-placeholder" style={{ width, height }}></div>;
};
```

Заменитель принимает 2 пропа (props): значения ширины и высоты в виде чисел (пикселей) или строк. Это необходимо для предотвращения сдвигов макета страницы и корректного поведения полосы прокрутки. В идеале, ширина и высота заменителя должны совпадать с шириной и высотой ленивого компонента.

Определяем типы пропов `LazyLoad`:

```tsx
type LazyLoadProps = {
  children: JSX.Element;
  width?: number | string;
  height?: number | string;
  once?: boolean;
  observerOptions?: IntersectionObserverInit;
};
```

Компонент принимает ширину (width) и высоту (height) заменителя, дочерний компонент (children), индикатор однократности (once, об этом чуть позже) и настройки для `Intersection Observer API` (observerOptions): `root`, `rootMargin` и `threshold`:

```tsx
const LazyLoad = (props: LazyLoadProps) => {
  // todo
};

export default LazyLoad;
```

Определяем переменную для ссылки на обертку дочернего компонента и состояние для индикатора пересечения:

```tsx
const childRef = React.useRef<HTMLDivElement>(null);
const [isIntersecting, setIntersecting] = React.useState(false);
```

Определяем эффект:

```tsx
React.useEffect(() => {
  // потомок
  const child = childRef.current as HTMLDivElement;

  // наблюдатель
  const observer = new IntersectionObserver(([entry]) => {
    // обновляем состояние индикатора
    setIntersecting(entry.isIntersecting);

    // если элемент находится в области просмотра и
    // индикатор однократности имеет значение `true`
    if (props.once && entry.isIntersecting) {
      // прекращаем наблюдение
      observer.unobserve(child);
    }
  }, props.observerOptions);

  // начинаем наблюдение
  observer.observe(child);

  // прекращаем наблюдение при размонтировании компонента
  return () => observer.unobserve(child);
}, []);
```

Зачем нам индикатор однократности (once)? Дело в том, что `Intersection Observer` регистрирует не только вход, но и выход элемента из области просмотра. Поэтому компонент, находящийся за пределами вьюпорта, будет отрендерен при входе в область просмотра и снова заменен плейсхолдером при выходе из нее. Это имеет смысл только с целью снижения общей нагрузки на страницу. Обычно, повторная замена отрендеренного компонента плейсхолдером и его последующий повторный рендеринг будут негативно влиять на производительность.

Удаляем обертку при прекращении наблюдения за элементом:

```tsx
if (props.once && isIntersecting) return props.children;
```

Наконец, выполняем условный рендеринг:

```tsx
return (
  <div ref={childRef} className="lazy-load-box">
    {isIntersecting ? (
      props.children
    ) : (
      <Placeholder width={props.width} height={props.height} />
    )}
  </div>
);
```

Полный код компонента:

```tsx
import React from "react";

const Placeholder = (props: {
  width?: number | string;
  height?: number | string;
}) => {
  const width =
    props.width && typeof props.width === "string"
      ? props.width
      : props.width + "px";
  const height =
    props.height && typeof props.height === "string"
      ? props.height
      : props.height + "px";

  return <div className="child-placeholder" style={{ width, height }}></div>;
};

type LazyLoadProps = {
  children: JSX.Element;
  width?: number | string;
  height?: number | string;
  once?: boolean;
  observerOptions?: IntersectionObserverInit;
};

const LazyLoad = (props: LazyLoadProps) => {
  const childRef = React.useRef<HTMLDivElement>(null);
  const [isIntersecting, setIntersecting] = React.useState(false);

  React.useEffect(() => {
    const child = childRef.current as HTMLDivElement;

    const observer = new IntersectionObserver(([entry]) => {
      setIntersecting(entry.isIntersecting);

      if (props.once && entry.isIntersecting) {
        observer.unobserve(child);
      }
    }, props.observerOptions);

    observer.observe(child);

    return () => observer.unobserve(child);
  }, []);

  if (props.once && isIntersecting) return props.children;

  return (
    <div ref={childRef} className="lazy-load-box">
      {isIntersecting ? (
        props.children
      ) : (
        <Placeholder width={props.width} height={props.height} />
      )}
    </div>
  );
};

export default LazyLoad;
```

Посмотрим, как это работает:

```tsx
const List = () => (
  <div className="list">
    {Array.from({ length: 10 }).map((_, i) => (
      <LazyLoad key={i} height="50vh" once>
        <Item n={i + 1} />
      </LazyLoad>
    ))}
  </div>
);
```

В качестве пропов `LazyLoad` передается высота заменителя, равная высоте компонента, и индикатор однократности.

Запускаем приложение и открываем консоль инструментов разработчика в браузере:

<img src="https://habrastorage.org/webt/fg/yd/w2/fgydw26mttlcuaksjhc84beua38.png" />
<br />

Видим сообщения о рендеринге только 2 компонентов `Item` (сообщения дублируются инструментами разработчика `React`).

Переходим на вкладку `Elements`:

<img src="https://habrastorage.org/webt/5z/rt/r7/5zrtr7wkfonmbjmjg1vrykepf54.png" />
<br />

Видим, что были отрендерены только 2 первых компонента `Item`. Остальные компоненты заменены плейсхолдерами.

При прокрутке списка вместо заменителей рендерятся настоящие компоненты (один раз):

<img src="https://habrastorage.org/webt/mo/8h/e8/mo8he8bofli5oyefvbgmunyfz5e.png" />
<br />

Следует отметить, что данный подход является гораздо более производительным, чем применение метода [getBoundingClientRect](https://developer.mozilla.org/ru/docs/Web/API/Element/getBoundingClientRect), который обычно используется в пакетах для ленивой загрузки.

В качестве вызова (challenge) можете попробовать реализовать компонент для одновременного наблюдения за несколькими дочерними компонентами (`Intersection Observer API` предоставляет такую возможность).

С HOC разобрались, переходим к хуку.

## Хук

Предположим, что у нас на странице имеется такой элемент:

```tsx
function App() {
  return (
    <div className="outer">
      <div className="inner">
        <p>Follow You!</p>
      </div>
    </div>
  );
}

export default App;
```

С такими стилями:

```css
.outer {
  background-color: deepskyblue;
  height: 100vh;
  margin-top: 101vh;
  overflow: hidden;
}

.inner {
  display: grid;
  min-height: 4rem;
  overflow: hidden;
  place-content: center;
}

.inner p {
  font-size: 4rem;
  transition: 0.5s;
}
```

И мы хотим что-то делать с этим элементом и его содержимым в зависимости от того, находится ли элемент в области просмотра и какую часть вьюпорта он занимает. Что если мы хотим менять высоту внутреннего контейнера (`.inner`), прозрачность и масштаб текста (`p`)? Это может выглядеть так:

```tsx
import useOnScreen, { range } from "./useOnScreen";

function App() {
  // ссылка на элемент
  const outerRef = React.useRef<HTMLDivElement>(null);
  // см. ниже
  const { ratio, height } = useOnScreen(outerRef, {
    threshold: range(0, 1, 0.01, 2),
  });

  return (
    <div className="outer" ref={outerRef}>
      <div className="inner" style={{ height }}>
        <p
          style={{
            opacity: ratio / 100 - 0.1,
            transform: ratio > 90 ? "scale(1.25)" : "none",
          }}
        >
          Follow You!
        </p>
      </div>
    </div>
  );
}

export default App;
```

Хук `useOnScreen` принимает ссылку на элемент и настройки для `Intersection Observer API`: в данном случае такой настройкой является `threshold` с `массивом чисел от 0 до 1, шагом 0,01 и точностью 2 знака после запятой`. Среди прочего, хук возвращает процент (степень) пересечения наблюдаемого элемента с областью просмотра (ratio) и высоту его видимой части (height). Высота видимой части внешнего контейнера (outer) используется для динамического увеличения высоты внутреннего контейнера, а значение процента пересечения — для динамического уменьшения прозрачности и увеличения масштаба текста (p) при почти полном (> 90%) пересечении.

Реализуем этот хук.

Начнем с определения функции для генерации диапазона пороговых значений:

```tsx
import React from "react";

export const range = (
  start: number = 0,
  stop: number = 1,
  step: number = 0.1,
  precision: number = 1
) =>
  Array.from({ length: (stop - start) / step + 1 }, (_, i) =>
    Number((start + i * step).toFixed(precision))
  );
```

Функция принимает начало, конец диапазона, шаг и точность и возвращает соответствующий массив. Например, при вызове `range()` (без аргументов) возвращается `[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]`.

Определяем хук:

```tsx
const useOnScreen = (
  ref: React.RefObject<HTMLElement | null>,
  observerOptions?: IntersectionObserverInit
) => {
  // todo
};

export default useOnScreen;
```

Определяем локальное состояние:

```tsx
const [intersectionValues, setIntersectionValues] = React.useState({
  // индикатор пересечения
  isIntersecting: false,
  // степень пересечения
  ratio: 0,
  // ширина видимой части
  width: 0,
  // высота видимой части
  height: 0,
});
```

Определяем эффект:

```tsx
React.useEffect(() => {
  // наблюдаемый элемент
  const observable = ref.current as HTMLElement;

  // наблюдатель
  const observer = new IntersectionObserver(([entry]) => {
    // обновляем состояние
    setIntersectionValues((prevValues) => ({
      ...prevValues,
      isIntersecting: entry.isIntersecting,
      ratio: Math.round(entry.intersectionRatio * 100),
      width: Math.round(entry.intersectionRect.width),
      height: Math.round(entry.intersectionRect.height),
    }));
  }, observerOptions);

  // начинаем наблюдение
  observer.observe(observable);

  // прекращаем наблюдение при размонтировании компонента
  return () => observer.unobserve(observable);
}, []);
```

Наконец, возвращаем значения:

```tsx
return intersectionValues;
```

Полный код хука:

```tsx
import React from "react";

export const range = (
  start: number = 0,
  stop: number = 1,
  step: number = 0.1,
  precision: number = 1
) =>
  Array.from({ length: (stop - start) / step + 1 }, (_, i) =>
    Number((start + i * step).toFixed(precision))
  );

const useOnScreen = (
  ref: React.RefObject<HTMLElement | null>,
  observerOptions?: IntersectionObserverInit
) => {
  const [intersectionValues, setIntersectionValues] = React.useState({
    isIntersecting: false,
    ratio: 0,
    width: 0,
    height: 0,
  });

  React.useEffect(() => {
    const observable = ref.current as HTMLElement;

    const observer = new IntersectionObserver(([entry]) => {
      setIntersectionValues((prevValues) => ({
        ...prevValues,
        isIntersecting: entry.isIntersecting,
        ratio: Math.round(entry.intersectionRatio * 100),
        width: Math.round(entry.intersectionRect.width),
        height: Math.round(entry.intersectionRect.height),
      }));
    }, observerOptions);

    observer.observe(observable);

    return () => observer.unobserve(observable);
  }, []);

  return intersectionValues;
};

export default useOnScreen;
```

Посмотрим, как это работает:

```tsx
function App() {
  const outerRef = React.useRef<HTMLDivElement>(null);
  const { ratio, height } = useOnScreen(outerRef, {
    threshold: range(0, 1, 0.01, 2),
  });

  return (
    <div className="outer" ref={outerRef}>
      <div className="inner" style={{ height }}>
        <p
          style={{
            opacity: ratio / 100 - 0.1,
            transform: ratio > 90 ? "scale(1.25)" : "none",
          }}
        >
          Follow You!
        </p>
      </div>
    </div>
  );
}

export default App;
```

Запускаем приложение и начинаем медленно прокручивать контейнер:

<img src="https://habrastorage.org/webt/7e/hi/wl/7ehiwllxnrjporycqd_njka_hbq.png" />
<br />

Видим, как во внутреннем контейнере начинает проявляться надпись `Follow You!`.

При увеличении высоты видимой части внешнего контейнера увеличивается высота внутреннего контейнера, что позиционирует надпись по центру. Также уменьшается прозрачность и, наконец, при почти полном пересечении увеличивается масштаб текста:

<img src="https://habrastorage.org/webt/y7/xp/h5/y7xph5h7_1p_wnigu9suibrije0.png" />
<br />

Это очень простой пример использования хука `useOnScreen`. Полагаю, вы без труда найдете ему массу полезных и интересных применений.

Поиграть с кодом можно <a href="https://codesandbox.io/s/react-lazy-load-ehjdrz">здесь</a>.

Благодарю за внимание и happy coding!
