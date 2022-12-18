---
slug: slider-table-sync
title: Синхронизация слайдера и таблицы в React-приложении
description: Туториал по синхронизации слайдера и таблицы в React-приложении
authors: harryheman
tags: [react.js, reactjs, react, slider, table, sync]
---

Привет, друзья!

В данном туториале я хочу поделиться с вами опытом решения одной интересной практической задачи.

Предположим, что у нас имеется страница сравнения товаров. На этой странице отображается слайдер с карточками товаров и таблица с их характеристиками. Задача состоит в том, чтобы синхронизировать переключение слайдов и прокрутку таблицы. Условия следующие:

- ширина таблицы должна соответствовать ширине слайдера;
- ширина колонки таблицы должна соответствовать ширине слайда;
- слайды можно переключать с помощью перетаскивания, нажатия на кнопки управления и элементы пагинации;
- таблицу можно прокручивать с помощью колесика мыши (на десктопе) и перемещения указателя (на телефоне);
- при взаимодействии пользователя с одним компонентом второй должен реагировать соответствующим образом: при переключении слайда должна выполняться прокрутка таблицы, при прокрутке таблицы - переключение слайдов.

> [Репозиторий с кодом проекта](https://github.com/harryheman/Blog-Posts/tree/master/react-slider-table).

<!--truncate-->

## Подготовка и настройка проекта

Для работы с зависимостями я буду использовать [Yarn](https://yarnpkg.com/). Проект будет реализован на [React](https://ru.reactjs.org/) и [TypeScript](https://www.typescriptlang.org/).

Создаем шаблон проекта с помощью [Vite](https://vitejs.dev/):

```bash
# react-slider-table - название проекта
# react-ts - используемый шаблон
yarn create vite react-slider-table --template react-ts
```

Переходим в созданную директорию, устанавливаем зависимости и запускаем сервер для разработки:

```bash
cd react-slider-table
yarn
yarn dev
```

Для реализации слайдера будет использоваться библиотека [Swiper](https://swiperjs.com/) (для синхронизации слайдера и таблицы мы будем использовать некоторые возможности, предоставляемые `Swiper`, поэтому в рамках туториала рекомендую использовать именно эту библиотеку). Устанавливаем ее:

```bash
yarn add swiper
yarn add -D @types/swiper
```

Импортируем стили слайдера в файле `main.tsx`:

```tsx
import "swiper/css";
// для модулей навигации и пагинации
import "swiper/css/navigation";
import "swiper/css/pagination";
```

Определяем минимальные стили в файле `index.css` (файл `App.css` можно удалить):

```css
@import url("https://fonts.googleapis.com/css2?family=Montserrat&display=swap");

* {
  font-family: "Montserrat", sans-serif;
}

body {
  margin: 0;
}

.app {
  margin: 0 auto;
  padding: 1rem;
  width: 768px;
}

img {
  max-width: 100%;
  object-fit: cover;
}

.table-wrapper {
  overflow: scroll;
  scrollbar-width: none;
}

.table-wrapper::-webkit-scrollbar {
  display: none;
}

table {
  border-collapse: collapse;
  overflow: hidden;
}

td {
  border: 1px solid gray;
  padding: 0.25rem;
  text-align: center;
}

.feature-name-row td {
  font-weight: bold;
  text-align: left;
}

.feature-name {
  position: relative;
}
```

_Обратите внимание_, что мы фиксируем ширину основного контейнера приложения (`.app`), поскольку хотим сосредоточится на синхронизации слайдера и таблицы (реализация отзывчивого дизайна потребует некоторых дополнительных вычислений).

Создаем файл `types.ts` следующего содержания:

```tsx
export type Feature = {
  id: number;
  value: string;
};

export type Item = {
  id: number;
  title: string;
  imageUrl: string;
  price: number;
  features: Feature[];
};

export type Items = Item[];
```

Создаем файл `data.ts` следующего содержания:

```tsx
import { Items } from "./types";

const items: Items = [
  {
    id: 1,
    title: "Title",
    imageUrl: `https://picsum.photos/320?random=${Math.random()}`,
    price: 100,
    features: [
      {
        id: 1,
        value: "Feature",
      },
      {
        id: 2,
        value: "Feature2",
      },
      {
        id: 3,
        value: "Feature3",
      },
      {
        id: 4,
        value: "Feature4",
      },
      {
        id: 5,
        value: "Feature5",
      },
      {
        id: 6,
        value: "Feature6",
      },
    ],
  },
  {
    id: 2,
    title: "Title2",
    imageUrl: `https://picsum.photos/320?random=${Math.random()}`,
    price: 200,
    features: [
      {
        id: 1,
        value: "Feature7",
      },
      {
        id: 2,
        value: "Feature8",
      },
      {
        id: 3,
        value: "Feature9",
      },
      {
        id: 4,
        value: "Feature10",
      },
      {
        id: 5,
        value: "Feature11",
      },
      {
        id: 6,
        value: "Feature12",
      },
    ],
  },
  {
    id: 3,
    title: "Title3",
    imageUrl: `https://picsum.photos/320?random=${Math.random()}`,
    price: 300,
    features: [
      {
        id: 1,
        value: "Feature13",
      },
      {
        id: 2,
        value: "Feature14",
      },
      {
        id: 3,
        value: "Feature15",
      },
      {
        id: 4,
        value: "Feature16",
      },
      {
        id: 5,
        value: "Feature17",
      },
      {
        id: 6,
        value: "Feature18",
      },
    ],
  },
  {
    id: 4,
    title: "Title4",
    imageUrl: `https://picsum.photos/320?random=${Math.random()}`,
    price: 400,
    features: [
      {
        id: 1,
        value: "Feature19",
      },
      {
        id: 2,
        value: "Feature20",
      },
      {
        id: 3,
        value: "Feature21",
      },
      {
        id: 4,
        value: "Feature22",
      },
      {
        id: 5,
        value: "Feature23",
      },
      {
        id: 6,
        value: "Feature24",
      },
    ],
  },
  {
    id: 5,
    title: "Title5",
    imageUrl: `https://picsum.photos/320?random=${Math.random()}`,
    price: 500,
    features: [
      {
        id: 1,
        value: "Feature25",
      },
      {
        id: 2,
        value: "Feature26",
      },
      {
        id: 3,
        value: "Feature27",
      },
      {
        id: 4,
        value: "Feature28",
      },
      {
        id: 5,
        value: "Feature29",
      },
      {
        id: 6,
        value: "Feature30",
      },
    ],
  },
  {
    id: 6,
    title: "Title6",
    imageUrl: `https://picsum.photos/320?random=${Math.random()}`,
    price: 600,
    features: [
      {
        id: 1,
        value: "Feature31",
      },
      {
        id: 2,
        value: "Feature32",
      },
      {
        id: 3,
        value: "Feature33",
      },
      {
        id: 4,
        value: "Feature34",
      },
      {
        id: 5,
        value: "Feature35",
      },
      {
        id: 6,
        value: "Feature36",
      },
    ],
  },
];

export default items;
```

У нас имеется массив, содержащий 6 объектов с информацией о товарах. Каждый объект товара содержит массив, состоящий из 6 объектов с характеристиками товара.

Создаем директорию `components`.

Начнем с разработки слайдера. Создаем файл `components/Slider.tsx` следующего содержания:

```tsx
// модули
import { Navigation, Pagination } from "swiper";
// компоненты
import { Swiper, SwiperSlide } from "swiper/react";
import { Items } from "../types";

type Props = {
  items: Items;
};

// количество отображаемых слайдов
const SLIDES_PER_VIEW = 3;

function Slider({ items }: Props) {
  return (
    <Swiper
      // подключаем модули навигации и пагинации
      modules={[Navigation, Pagination]}
      // индикатор отображения навигации
      navigation={SLIDES_PER_VIEW < items.length}
      // индикатор отображения пагинации
      pagination={
        SLIDES_PER_VIEW < items.length
          ? {
              // элементы пагинации должны быть кликабельными
              clickable: true,
            }
          : undefined
      }
      // количество отображаемых слайдов
      slidesPerView={SLIDES_PER_VIEW}
    >
      {items.map((item) => (
        <SwiperSlide key={item.id}>
          <img src={item.imageUrl} alt={item.title} />
          <div>
            <h2>{item.title}</h2>
            <p>{item.price} ₽</p>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

export default Slider;
```

Импортируем и рендерим слайдер в файле `App.tsx`:

```tsx
import Slider from "./components/Slider";
import data from "./data";

function App() {
  return (
    <div className="app">
      <Slider items={data} />
    </div>
  );
}

export default App;
```

Результат:

<img src="https://habrastorage.org/webt/lf/bk/55/lfbk55os72pl1eywpe0u2m0rhoy.png" />
<br />

Теперь реализуем компонент таблицы. Создаем файл `components/Table.tsx` следующего содержания:

```tsx
import { Items } from "../types";

type Props = {
  items: Items;
};

// названия характеристик
const FEATURE_NAMES = [
  "Title",
  "Title2",
  "Title3",
  "Title4",
  "Title5",
  "Title6",
];

function Table({ items }: Props) {
  return (
    <div className="table-wrapper">
      <table>
        <tbody>
          {items.map((item, i) => (
            <React.Fragment key={item.id}>
              <tr className="feature-name-row">
                <td colSpan={items.length}>
                  <span className="feature-name">{FEATURE_NAMES[i]}</span>
                </td>
              </tr>
              <tr>
                {items.map((_, j) => {
                  const key = "" + i + j;
                  return <td key={key}>{items[j].features[i].value}</td>;
                })}
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
```

_Обратите внимание_ на 2 вещи:

- мы оборачиваем таблицу с `overflow: hidden` в контейнер с `overflow: scroll` (`.table-wrapper`);
- колонка с названием характеристики растягивается на всю ширину таблицы по количеству товаров (атрибут `colspan`), а само название оборачивается в элемент `span`: при прокрутке таблицы название характеристики должно оставаться видимым.

Импортируем и рендерим таблицу в `App.tsx`:

```tsx
import Slider from "./components/Slider";
import Table from "./components/Table";
import data from "./data";

function App() {
  return (
    <div className="app">
      <Slider items={data} />
      <Table items={data} />
    </div>
  );
}

export default App;
```

Результат:

<img src="https://habrastorage.org/webt/k2/-r/iu/k2-riu1jrwv7qpw0ys7icicswxs.png" />
<br />

Отлично, у нас есть все необходимые компоненты, можно приступать к их синхронизации.

## Синхронизация ширины слайда и колонки таблицы

Определяем состояние ширины слайда в `App.tsx`:

```tsx
const [slideWidth, setSlideWidth] = useState(0);
```

Данное состояние будет обновляться в слайдере, а использоваться - в таблице:

```tsx
<Slider
  items={data}
  // !
  setSlideWidth={setSlideWidth}
/>
<Table
  items={data}
  // !
  slideWidth={slideWidth}
/>
```

Определяем переменную для хранения ссылки на экземпляр `Swiper` в `Slider.tsx`:

```tsx
const swiperRef = useRef<TSwiper>();
```

Тип `TSwiper` выглядит так:

```tsx
// types.ts
import type Swiper from "swiper";

export type TSwiper = Swiper & {
  slides: {
    swiperSlideSize: number;
  }[];
};
```

Одним из пропов, принимаемых компонентом `Swiper`, является `onSwiper`. В качестве аргумента коллбэку этого пропа передается экземпляр `Swiper`:

```tsx
<Swiper
  onSwiper={(swiper) => {
    console.log(swiper);

    swiperRef.current = swiper as TSwiper;
  }}
  // ...
>
```

Экземпляр `Swiper` содержит массу полезных свойств:

<img src="https://habrastorage.org/webt/fq/qd/em/fqqdemayy7zoaeqczuk71nhmlx8.png" />
<br />

Интересующее нас значение ширины слайда содержится в свойстве `slides[0].swiperSlideSize`:

<img src="https://habrastorage.org/webt/-a/r3/2v/-ar32vdox8jde6ff_4wlh4l1av0.png" />
<br />

Проп `onImageReady` компонента `Swiper` принимает коллбэк для выполнения операций после загрузки всех изображений, используемых в слайдере, что в ряде случаев является критически важным для определения правильной ширины слайда:

```tsx
<Swiper
  onSwiper={(swiper) => {
    console.log(swiper);

    swiperRef.current = swiper as TSwiper;
  }}
  onImagesReady={onImagesReady}
  // ...
>
```

Определяем функцию `onImagesReady`:

```tsx
const onImagesReady = () => {
  if (!swiperRef.current) return;

  const slideWidth = swiperRef.current.slides[0].swiperSlideSize;
  setSlideWidth(slideWidth);
};
```

Применяем проп `slideWidth` в таблице с помощью встроенных стилей (в реальном приложении для этого, скорее всего, будет использоваться одно из решений `CSS-in-JS`, например, [styled-jsx](https://github.com/vercel/styled-jsx) - см. конец статьи):

```tsx
<tr
  // !
  style={{
    display: "grid",
    // 6 колонок с шириной, равной ширине слайда
    gridTemplateColumns: `repeat(${items.length}, ${slideWidth}px)`,
  }}
>
  {items.map((_, j) => {
    const key = "" + i + j;
    return <td key={key}>{items[j].features[i].value}</td>;
  })}
</tr>
```

Результат:

<img src="https://habrastorage.org/webt/uu/g9/ny/uug9nyhiuecjdghgse5osai3_sa.png" />
<br />

## Синхронизация переключения слайдов и прокрутки таблицы: обработка переключения слайдов

Определяем состояние прокрутки в `App.tsx`:

```tsx
const [scrollLeft, setScrollLeft] = useState(0);
```

Данное состояние, как и состояние ширины слайда, будет обновляться в слайдере, а использоваться - в таблице:

```tsx
<Slider
  items={data}
  setSlideWidth={setSlideWidth}
  // !
  setScrollLeft={setScrollLeft}
/>
<Table
  items={data}
  slideWidth={slideWidth}
  // !
  scrollLeft={scrollLeft}
/>
```

Проп `onSlideChange` компонента `Swiper` принимает коллбэк, позволяющий выполнять операции после переключения слайдов (любым способом):

```tsx
<Swiper
  onSlideChange={onSlideChange}
  // ...
>
```

Прежде чем определять функцию `onSlideChange`, взглянем на то, что происходит с элементом `div` с классом `swiper-wrapper` при переключении слайдов:

<img src="https://habrastorage.org/webt/fs/2l/li/fs2lliumnugjwhzwg8np06oydsm.png" />
<br />

Видим, что к данному элементу применяется встроенный стиль `transform: translate3d(x, y, z)`, где `x` - интересующее нас значение прокрутки.

Функция `onSlideChange` выглядит следующим образом:

```tsx
const onSlideChange = () => {
  if (!swiperRef.current) return;

  // извлекаем значение свойства `transform`
  const { transform } = swiperRef.current.wrapperEl.style;
  // извлекаем значение координаты `x`
  const match = transform.match(/-?\d+(\.\d+)?px/);
  if (!match) return;

  // извлекаем положительное (!) число из значения координаты `x`
  // с числами работать удобнее, чем со строками
  const scrollLeft = Math.abs(Number(match[0].replace("px", "")));
  setScrollLeft(scrollLeft);
};
```

Для того, чтобы применить проп `scrollLeft` в таблице, необходимо сделать несколько вещей.

Определяем переменные для хранения ссылок на контейнер для таблицы и саму таблицу, а также переменную для хранения ссылок на элементы с названиями характеристик:

```tsx
const tableWrapperRef = useRef<HTMLDivElement | null>(null);
const tableRef = useRef<HTMLTableElement | null>(null);
const featureNameRefs = useRef<HTMLSpanElement[]>([]);
```

Передаем ссылки соответствующим элементам:

```tsx
<div
  className="table-wrapper"
  // !
  ref={tableWrapperRef}
>
  <table
    // !
    ref={tableRef}
  >
    {/* ... */}
  </table>
</div>
```

Собираем ссылки на элементы с названиями характеристик после рендеринга компонента:

```tsx
useEffect(() => {
  if (!tableRef.current) return;

  featureNameRefs.current = [
    ...tableRef.current.querySelectorAll(".feature-name"),
  ] as HTMLSpanElement[];
}, []);
```

Наконец, выполняем прокрутку таблицы и сдвиг по оси `x` названий характеристик при изменении значения `scrollLeft`:

```tsx
useEffect(() => {
  if (!tableWrapperRef.current || !featureNameRefs.current.length) return;

  tableWrapperRef.current.scrollLeft = scrollLeft;

  featureNameRefs.current.forEach((el) => {
    el.style.left = `${scrollLeft}px`;
  });
}, [scrollLeft]);
```

Результат:

<img src="https://habrastorage.org/webt/82/km/bi/82kmbindf4jh9wyytaaniy9x9dc.png" />
<br />

Видим, что переключение слайдов перетаскиванием, нажатием кнопок управления и элементов пагинации приводит к прокрутке таблицы и сдвигу названий характеристик на правильные позиции.

## Синхронизация переключения слайдов и прокрутки таблицы: обработка прокрутки таблицы

Определяем состояние отступа по оси `x` в `App.tsx`:

```tsx
const [offsetX, setOffsetX] = useState(0);
```

Данное состояние будет обновляться в таблице, а использоваться - в слайдере:

```tsx
<Slider
  items={data}
  setSlideWidth={setSlideWidth}
  setScrollLeft={setScrollLeft}
  // !
  offsetX={offsetX}
/>
<Table
  items={data}
  slideWidth={slideWidth}
  scrollLeft={scrollLeft}
  // !
  setOffsetX={setOffsetX}
/>
```

Как при прокрутке таблицы с помощью колесика мыши, так и с помощью перемещения указателя, на обертке для таблицы возникает событие `scroll`:

```tsx
<div
  className="table-wrapper"
  // !
  onScroll={debouncedOnScroll}
  ref={tableWrapperRef}
>
```

Определяем функцию `onScroll`:

```tsx
const onScroll: React.UIEventHandler<HTMLDivElement> = useCallback(() => {
  if (!tableRef.current) return;
  // извлекаем позицию левого края таблицы по оси `x`
  const { x } = tableRef.current.getBoundingClientRect();
  // делаем число положительным
  setOffsetX(Math.abs(x));
}, []);
```

_Обратите внимание_: обработка прокрутки должна выполняться с задержкой, поскольку установка свойства `scrollLeft` приводит к возникновению события `scroll`, что может заблокировать переключение слайдов и прокрутку таблицы:

- `offsetX` передается в слайдер и используется для переключения слайдов;
- в обработчике переключения слайдов происходит обновление `scrollLeft`;
- `scrollLeft` используется для выполнения прокрутки таблицы - возникает событие `scroll`, в обработчике которого обновляется `offsetX`.

Также _обратите внимание_, что прокрутка должна выполняться мгновенно: установка стиля `scroll-behavior: smooth` или выполнение прокрутки с помощью метода `scrollTo({ left: scrollLeft, behavior: 'smooth' })` сделает поведение прокрутки непредсказуемым.

Создаем файл `hooks/useDebounce.ts` следующего содержания:

```tsx
import { useCallback, useEffect, useRef } from "react";

const useDebounce = (fn: Function, delay: number) => {
  const timeoutRef = useRef<number>();

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  }, []);

  useEffect(() => clearTimer, []);

  const cb = useCallback(
    (...args: any[]) => {
      clearTimer();
      timeoutRef.current = setTimeout(() => fn(...args), delay);
    },
    [fn, delay]
  );

  return cb;
};

export default useDebounce;
```

Этот хук возвращает функцию, которая, независимо от количества запусков, вызывается только один раз по прошествии указанного времени:

```tsx
const ON_SCROLL_DELAY = 250;

const debouncedOnScroll = useDebounce(onScroll, ON_SCROLL_DELAY);
```

Переходим к самой сложной части туториала.

Применение пропа `offsetX` в слайдере предполагает знание количества элементов пагинации, определение ближайшего к `offsetX` элемента и его программное нажатие.

Определяем переменные для хранения ссылок на элементы пагинации и их позиции по оси `x`:

```tsx
const paginationBulletRefs = useRef<HTMLSpanElement[]>([]);
const paginationBulletXCoords = useRef<number[]>([]);
```

Ссылки на элементы пагинации хранятся в свойстве `pagination.bullets` экземпляра `Swiper`. Для определения позиций элементов по оси `x` достаточно умножить индекс элемента на ширину слайда. Расширяем функцию `onImagesReady`:

```tsx
const bullets = swiperRef.current.pagination
  .bullets as unknown as HTMLSpanElement[];
if (!bullets.length) return;
paginationBulletRefs.current = bullets;

for (const i in bullets) {
  paginationBulletXCoords.current.push(slideWidth * Number(i));
}
```

Определяем эффект для выполнения программного нажатия на соответствующий элемент пагинации при изменении `offsetX`:

```tsx
useEffect(() => {
  // переменная для минимальной разницы между позицией элемента и отступом
  let min = 0;
  let i = 0;

  for (const j in paginationBulletXCoords.current) {
    // вычисляем текущую разницу
    const dif = Math.abs(paginationBulletXCoords.current[j] - offsetX);

    // текущая разница равна `0`
    if (dif === 0) {
      min = 0;
      i = 0;
      break;
    }

    // текущая разница не равна `0` и минимальная разница равна `0` или текущая разница меньше минимальной разницы
    if (dif !== 0 && (min === 0 || dif < min)) {
      min = dif;
      i = Number(j);
    }
  }

  // выполняем программное нажатие на соответствующий элемент
  if (paginationBulletRefs.current[i]) {
    paginationBulletRefs.current[i].click();
  }
}, [offsetX]);
```

_Обратите внимание_: программное нажатие на элемент пагинации приводит к вызову `onSlideChange`, который обновляет `scrollLeft`, что приводит к выравниванию таблицы и названий характеристик.

Результат:

<img src="https://habrastorage.org/webt/uc/fw/o2/ucfwo2xeeei_gckxhclkrmmj-de.png" />
<br />

Видим, что прокрутка таблицы с помощью колесика мыши или перемещения указателя приводит сначала к переключению слайда, а затем - к выравниванию таблицы и названий характеристик.

_Обратите внимание_: отсутствие задержки вызова `onScroll` сделает прокрутку более чем на один слайд за раз невозможной, т.е. прокрутка станет последовательной и пошаговой.

Обновление стилей в таблице можно упростить с помощью одного из решений `CSS-in-JS`, а именно: `styled-jsx`. Устанавливаем эту библиотеку:

```bash
yarn add styled-jsx
yarn add -D @types/styled-jsx
```

Редактируем файл `vite.config.ts`:

```tsx
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react({
      babel: { plugins: ["styled-jsx/babel"] },
    }),
  ],
});
```

Редактируем файл `vite-env.d.ts`:

```ts
/// <reference types="vite/client" />
import "react";

declare module "react" {
  interface StyleHTMLAttributes {
    jsx?: boolean;
    global?: boolean;
  }
}
```

Наконец, редактируем файл `Table.tsx`:

```tsx
import React, { useCallback, useEffect, useRef } from "react";
import useDebounce from "../hooks/useDebounce";
import { Items } from "../types";

type Props = {
  items: Items;
  slideWidth: number;
  scrollLeft: number;
  setOffsetX: React.Dispatch<React.SetStateAction<number>>;
};

const FEATURE_NAMES = [
  "Title",
  "Title2",
  "Title3",
  "Title4",
  "Title5",
  "Title6",
];

const ON_SCROLL_DELAY = 250;

function Table({ items, slideWidth, scrollLeft, setOffsetX }: Props) {
  const tableWrapperRef = useRef<HTMLDivElement | null>(null);
  const tableRef = useRef<HTMLTableElement | null>(null);

  useEffect(() => {
    if (!tableWrapperRef.current) return;

    tableWrapperRef.current.scrollLeft = scrollLeft;
  }, [scrollLeft]);

  const onScroll: React.UIEventHandler<HTMLDivElement> = useCallback(() => {
    if (!tableRef.current) return;

    const { x } = tableRef.current.getBoundingClientRect();
    setOffsetX(Math.abs(x));
  }, []);

  const debouncedOnScroll = useDebounce(onScroll, ON_SCROLL_DELAY);

  return (
    <>
      <div
        className="table-wrapper"
        onScroll={debouncedOnScroll}
        ref={tableWrapperRef}
      >
        <table ref={tableRef}>
          <tbody>
            {items.map((item, i) => (
              <React.Fragment key={item.id}>
                <tr className="feature-name-row">
                  <td colSpan={items.length}>
                    <span className="feature-name">{FEATURE_NAMES[i]}</span>
                  </td>
                </tr>
                {/* ! */}
                <tr className="feature-value-row">
                  {items.map((_, j) => {
                    const key = "" + i + j;
                    return <td key={key}>{items[j].features[i].value}</td>;
                  })}
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      {/* ! */}
      <style jsx>{`
        .feature-name {
          left: ${scrollLeft}px;
        }
        .feature-value-row {
          display: grid;
          grid-template-columns: repeat(${items.length}, ${slideWidth}px);
        }
      `}</style>
    </>
  );
}

export default Table;
```

Мы также можем отрефакторить код слайдера, упростив процесс переключения слайдов в ответ на прокрутку таблицы. Экземпляр `Swiper` предоставляет метод `slideTo`, позволяющий программно прокручивать слайдер к указанному слайду. Следовательно, вместо позиций элементов пагинации по оси `x` нам необходимо знать позиции слайдов. Эти позиции содержатся в свойстве `slidesGrid`. Кроме того, смещение слайдера по оси `x` можно извлекать из свойства `translate`. Редактируем файл `Slider.tsx`:

```tsx
import { useEffect, useRef } from "react";
import { Navigation, Pagination } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { Items, TSwiper } from "../types";

type Props = {
  items: Items;
  setSlideWidth: React.Dispatch<React.SetStateAction<number>>;
  setScrollLeft: React.Dispatch<React.SetStateAction<number>>;
  offsetX: number;
};

const SLIDES_PER_VIEW = 3;

function Slider({ items, setSlideWidth, setScrollLeft, offsetX }: Props) {
  const swiperRef = useRef<TSwiper>();
  // !
  const slidesGrid = useRef<number[]>([]);

  const onImagesReady = () => {
    if (!swiperRef.current) return;

    const slideWidth = swiperRef.current.slides[0].swiperSlideSize;

    // !
    slidesGrid.current = swiperRef.current.slidesGrid;

    setSlideWidth(slideWidth);
  };

  const onSlideChange = () => {
    if (!swiperRef.current) return;

    // !
    const scrollLeft = Math.abs(swiperRef.current.translate);
    setScrollLeft(scrollLeft);
  };

  useEffect(() => {
    if (!swiperRef.current) return;

    let min = 0;
    let i = 0;

    for (const j in slidesGrid.current) {
      const dif = Math.abs(slidesGrid.current[j] - offsetX);

      if (dif === 0) {
        min = 0;
        i = 0;
        break;
      }

      if (dif !== 0 && (min === 0 || dif < min)) {
        min = dif;
        i = Number(j);
      }
    }

    // !
    if (items[i]) {
      swiperRef.current.slideTo(i);
    }
  }, [offsetX]);

  return (
    <Swiper
      onSwiper={(swiper) => {
        console.log(swiper);

        swiperRef.current = swiper as TSwiper;
      }}
      modules={[Navigation, Pagination]}
      navigation={SLIDES_PER_VIEW < items.length}
      onImagesReady={onImagesReady}
      onSlideChange={onSlideChange}
      pagination={
        SLIDES_PER_VIEW < items.length
          ? {
              clickable: true,
            }
          : undefined
      }
      slidesPerView={SLIDES_PER_VIEW}
    >
      {items.map((item) => (
        <SwiperSlide key={item.id}>
          <img src={item.imageUrl} alt={item.title} />
          <div>
            <h2>{item.title}</h2>
            <p>{item.price} ₽</p>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

export default Slider;
```

Благодарю за внимание и happy coding!
