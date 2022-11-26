---
slug: motion-control
title: Управление содержимым веб-страницы с помощью жестов
description: Следующий этап развития Веба
authors: harryheman
tags: [javascript, js, web page, motion control, gestures, machine learning, управление движением, жесты, машинное обучение]
image: https://habrastorage.org/webt/tb/2u/fx/tb2ufxookpot0mirap8x-dzoedg.jpeg
---

<img src="https://habrastorage.org/webt/tb/2u/fx/tb2ufxookpot0mirap8x-dzoedg.jpeg" />

Привет, друзья!

Еще недавно управление содержимым веб-страницы с помощью жестов можно было наблюдать разве что в фантастических фильмах. Сегодня все, что для этого требуется - видеокамера и браузер (и библиотека от `Google`).

В данном туториале мы рассмотрим 5 примеров:

- получение данных с видеокамеры и их отрисовка на холсте (canvas);
- обнаружение и отслеживание кисти руки;
- управление "курсором" с помощью указательного пальца;
- определение жеста "щипок" (pinch);
- нажатие кнопки с помощью щипка.

Все примеры будут реализованы на чистом `JavaScript`.

Источником вдохновения для меня послужила [эта замечательная статья](https://www.smashingmagazine.com/2022/10/motion-controls-browser/).

Для обнаружения и отслеживания руки и жестов будет использоваться [MediaPipe](https://google.github.io/mediapipe/). Для работы с зависимостями - [Yarn](https://yarnpkg.com/).

Код примеров можно найти в [этом репозитории](https://github.com/harryheman/Blog-Posts/tree/master/motion-controls).

<!--truncate-->

## Подготовка и настройка проекта

Создаем шаблон проекта на чистом `JS` с помощью [Vite](https://vitejs.dev/):

```bash
# motion-controls - название проекта
# vanilla - используемый шаблон
yarn create vite motion-controls --template vanilla
```

Переходим в созданную директорию, устанавливаем зависимости и запускаем сервер для разработки:

```bash
cd motion-controls
yarn
yarn dev
```

Редактируем содержимое `body` в файле `index.html`:

```html
<video></video>
<canvas></canvas>

<script type="module" src="/js/get-video-data.js"></script>
```

## Получение видеоданных и их отрисовка на холсте

Создаем директорию `js` в корне проекта и файл `get-video-data.js` в ней.

Получаем ссылки на элементы `video` и `canvas`, а также на контекст рисования 2D-графики:

```javascript
const video$ = document.querySelector("video");
const canvas$ = document.querySelector("canvas");
const ctx = canvas$.getContext("2d");
```

Определяем ширину и высоту холста, а также требования ([constraints](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia#parameters)) к потоку видеоданных:

```javascript
const width = 320;
const height = 480;

canvas$.width = width;
canvas$.height = height;

const constraints = {
  audio: false,
  video: { width, height },
};
```

Получаем доступ к устройству ввода видеоданных пользователя с помощью метода [getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia); передаем поток в элемент `video` с помощью атрибута [srcObject](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/srcObject); после загрузки метаданных, запускаем воспроизведение видео и вызываем метод [requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame), передавая ему функцию `drawVideoFrame` в качестве аргумента:

```javascript
navigator.mediaDevices
  // `getUserMedia` возвращает промис
  .getUserMedia(constraints)
  .then((stream) => {
    video$.srcObject = stream;

    video$.onloadedmetadata = () => {
      video$.play();

      requestAnimationFrame(drawVideoFrame);
    };
  })
  .catch(console.error);
```

Наконец, определяем функцию отрисовки видеокадра на холсте с помощью метода [drawImage](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage):

```javascript
function drawVideoFrame() {
  ctx.drawImage(video$, 0, 0, width, height);

  requestAnimationFrame(drawVideoFrame);
}
```

_Обратите внимание_: двойной вызов `requestAnimationFrame` запускает бесконечный цикл анимации с частотой кадров, которая зависит от устройства, но обычно составляет 60 кадров в секунду (60 frames per second, FPS). Частоту отрисовки кадров можно регулировать с помощью аргумента `timestamp`, передаваемого коллбэку `requestAnimationFrame` ([пример](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame#examples)):

```javascript
function drawVideoFrame(timestamp) {
  // ...
}
```

Результат:

<img src="https://habrastorage.org/webt/p-/w4/j0/p-w4j0ei0eg2cq7y1p2xdmmd0ni.png" />
<br />

## Обнаружение и отслеживание кисти руки

Для обнаружения и отслеживания руки нам потребуется несколько дополнительных зависимостей:

```bash
yarn add @mediapipe/camera_utils @mediapipe/drawing_utils @mediapipe/hands
```

[MediaPipe Hands](https://google.github.io/mediapipe/solutions/hands.html) сначала обнаруживает кисти рук, затем определяет 21 контрольную точку (3D landmarks), которыми являются суставы, для каждой кисти. Вот как это выглядит:

<img src="https://habrastorage.org/webt/ip/d0/zp/ipd0zpor4yaekpai7gylg9s-bx4.png" />
<br />

Создаем в директории `js` файл `track-hand-motions.js`.

Импортируем зависимости:

```javascript
import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { Hands, HAND_CONNECTIONS } from "@mediapipe/hands";
```

Конструктор `Camera` позволяет создавать экземпляры для управления видеокамерой и имеет следующую сигнатуру:

```javascript
export declare class Camera implements CameraInterface {
  constructor(video: HTMLVideoElement, options: CameraOptions);
  start(): Promise<void>;
  // мы не будем использовать этот метод
  stop(): Promise<void>;
}
```

Конструктор принимает элемент `video` и такие настройки:

```javascript
export declare interface CameraOptions {
  // коллбэк, вызываемый при захвате кадра
  onFrame: () => Promise<void>| null;
  // камера
  facingMode?: 'user'|'environment';
  // ширина кадра
  width?: number;
  // высота кадра
  height?: number;
}
```

Метод `start` запускает процесс захвата кадров.

---

Конструктор `Hands` позволяет создавать экземпляры для обнаружения кистей рук и имеет следующую сигнатуру:

```javascript
export declare class Hands implements HandsInterface {
  constructor(config?: HandsConfig);
  onResults(listener: ResultsListener): void;
  send(inputs: InputMap): Promise<void>;
  setOptions(options: Options): void;
  // еще несколько методов, которые нами использоваться не будут
}
```

Конструктор принимает такую настройку:

```javascript
export interface HandsConfig {
  locateFile?: (path: string, prefix?: string) => string;
}
```

Этот коллбэк загружает дополнительные файлы, необходимые для создания экземпляра:

```bash
hand_landmark_lite.tflite
hands_solution_packed_assets_loader.js
hands_solution_simd_wasm_bin.js
hands.binarypb
hands_solution_packed_assets.data
hands_solution_simd_wasm_bin.wasm
```

Метод `setOptions` позволяет устанавливать следующие настройки обнаружения:

```javascript
export interface Options {
  selfieMode?: boolean;
  maxNumHands?: number;
  modelComplexity?: 0|1;
  minDetectionConfidence?: number;
  minTrackingConfidence?: number;
}
```

Об этих настройках можно почитать [здесь](https://google.github.io/mediapipe/solutions/hands.html#configuration-options). Мы установим настройки `maxNumHands: 1` для обнаружения только одной кисти и `modelComplexity: 0` для повышения производительности за счет снижения точности обнаружения.

Метод `send` используется для обработки единичного кадра данных. Он вызывается в методе `onFrame` экземпляра `Camera`.

Метод `onResults` принимает коллбэк для обработки результатов обнаружения кисти.

---

Метод `drawLandmarks` позволяет рисовать контрольные точки кисти и имеет следующую сигнатуру:

```javascript
export declare function drawLandmarks(
    ctx: CanvasRenderingContext2D, landmarks?: NormalizedLandmarkList,
    style?: DrawingOptions): void;
```

Он принимает контекст рисования, контрольные точки и следующие стили:

```javascript
export declare interface DrawingOptions {
  color?: string|CanvasGradient|CanvasPattern|
      Fn<Data, string|CanvasGradient|CanvasPattern>;
  fillColor?: string|CanvasGradient|CanvasPattern|
      Fn<Data, string|CanvasGradient|CanvasPattern>;
  lineWidth?: number|Fn<Data, number>;
  radius?: number|Fn<Data, number>;
  visibilityMin?: number;
}
```

Метод `drawConnectors` позволяет рисовать соединительные линии между контрольными точками и имеет следующую сигнатуру:

```javascript
export declare function drawConnectors(
    ctx: CanvasRenderingContext2D, landmarks?: NormalizedLandmarkList,
    connections?: LandmarkConnectionArray, style?: DrawingOptions): void;
```

Он принимает контекст рисования, контрольные точки, пары начального и конечного индексов контрольных точек (`HAND_CONNECTIONS`) и стили.

Возвращаемся к редактированию `track-hand-motions.js`.

Делаем тоже самое, что в предыдущем примере:

```javascript
const video$ = document.querySelector("video");
const canvas$ = document.querySelector("canvas");
const ctx = canvas$.getContext("2d");

const width = 320;
const height = 480;
canvas$.width = width;
canvas$.height = height;
```

Определяем функцию обработки результатов обнаружения кисти:

```javascript
function onResults(results) {
  // из всего объекта результатов нас интересует только свойство `multiHandLandmarks`,
  // которое содержит массивы контрольных точек обнаруженных кистей
  if (!results.multiHandLandmarks.length) return;

  // при обнаружении 2 кистей, например, `multiHandLandmarks` будет содержать 2 массива контрольных точек
  console.log("@landmarks", results.multiHandLandmarks[0]);

  // рисуем видеокадр
  ctx.save();
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(results.image, 0, 0, width, height);

  // перебираем массивы контрольных точек
  // мы могли бы обойтись без итерации, поскольку у нас имеется лишь один массив,
  // но такое решение является более гибким
  for (const landmarks of results.multiHandLandmarks) {
    // рисуем точки
    drawLandmarks(ctx, landmarks, { color: "#FF0000", lineWidth: 2 });
    // рисуем линии
    drawConnectors(ctx, landmarks, HAND_CONNECTIONS, {
      color: "#00FF00",
      lineWidth: 4,
    });
  }

  ctx.restore();
}
```

Создаем экземпляр для обнаружения кисти, устанавливаем настройки и регистрируем обработчик результатов:

```javascript
const hands = new Hands({
  locateFile: (file) => `../node_modules/@mediapipe/hands/${file}`,
});
hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 0,
});
hands.onResults(onResults);
```

Наконец, создаем экземпляр для управления видеокамерой, регистрируем обработчик, устанавливаем настройки и запускаем процесс захвата кадров:

```javascript
const camera = new Camera(video$, {
  onFrame: async () => {
    await hands.send({ image: video$ });
  },
  facingMode: undefined,
  width,
  height,
});
camera.start();
```

_Обратите внимание_: по умолчанию настройка `facingMode` имеет значение `user` - источником видеоданных является фронтальная (передняя) камера ноутбука. Поскольку в моем случае таким источником является `USB-камера`, значением данной настройки должно быть `undefined`.

Массив контрольных точек обнаруженной кисти выглядит так:

<img src="https://habrastorage.org/webt/b0/kc/qr/b0kcqrzh2m_avg3cjvyeqv0brxc.png" />
<br />

Индексы соответствуют суставам кисти согласно приведенному выше изображению. Например, индексом первого сверху сустава указательного пальца является `7`. Каждая контрольная точка имеет координаты `x`, `y` и `z` в диапазоне от 0 до 1.

Результат выполнения кода примера:

<img src="https://habrastorage.org/webt/kl/k8/nr/klk8nrdtlqrjol62i2-dj2ivsra.png" />
<img src="https://habrastorage.org/webt/jj/0q/uc/jj0quc_slasv_4jhoajse5wckea.png" />
<img src="https://habrastorage.org/webt/5y/mw/o-/5ymwo-ysiio_iunn4t04ard9ba4.png" />
<br />

## Управление "курсором" с помощью указательного пальца

Следующая задача - научиться управлять положением элементов на странице.

Добавляем в `index.html` такой `div`:

```html
<div class="cursor"></div>
```

И определяем некоторые стили в файле `style.css`:

```css
body {
  margin: 0;
  overflow: hidden;
}

canvas {
  display: none;
}

video {
  max-width: 100vw;
  max-height: 100vh;
}

.cursor {
  height: 0;
  left: 0;
  position: absolute;
  top: 0;
  transition: transform 0.1s;
  width: 0;
  z-index: 10;
}

.cursor::after {
  background-color: #0275d8;
  border-radius: 50%;
  content: "";
  display: block;
  height: 40px;
  left: 0;
  position: absolute;
  top: 0;
  transform: translate(-50%, -50%);
  width: 40px;
}
```

Создаем в директории `js` файл `move-cursor-by-finger.js`.

Импортируем зависимости и стили:

```javascript
import { Camera } from "@mediapipe/camera_utils";
import { Hands } from "@mediapipe/hands";
import "../style.css";
```

Получаем ссылки на `DOM-элементы` и определяем ширину и высоту захватываемого видеокадра, равную ширине и высоте области просмотра:

```javascript
const video$ = document.querySelector("video");
const cursor$ = document.querySelector(".cursor");

const width = window.innerWidth;
const height = window.innerHeight;
```

Для облегчения работы с массивом контрольных точек можно определить такую карту поиска:

```javascript
const handParts = {
  wrist: 0,
  thumb: { base: 1, middle: 2, topKnuckle: 3, tip: 4 },
  indexFinger: { base: 5, middle: 6, topKnuckle: 7, tip: 8 },
  middleFinger: { base: 9, middle: 10, topKnuckle: 11, tip: 12 },
  ringFinger: { base: 13, middle: 14, topKnuckle: 15, tip: 16 },
  pinky: { base: 17, middle: 18, topKnuckle: 19, tip: 20 },
};
```

Создаем экземпляры для управления камерой и обнаружения кисти:

```javascript
const hands = new Hands({
  locateFile: (file) => `../node_modules/@mediapipe/hands/${file}`,
});
hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 0,
});
hands.onResults(onResults);

const camera = new Camera(video$, {
  onFrame: async () => {
    await hands.send({ image: video$ });
  },
  facingMode: undefined,
  width,
  height,
});
camera.start();
```

Мы хотим управлять положением "курсора" с помощью первого сверху сустава указательного пальца - `handParts.indexFinger.topKnuckle` + координаты контрольной точки необходимо преобразовывать в координаты страницы - для этого удобно использовать такие единицы измерения, как `vw` и `vh` (ширина и высота области просмотра). Определяем соответствующие функции:

```javascript
const getCursorCoords = (landmarks) =>
  landmarks[handParts.indexFinger.topKnuckle];

const convertCoordsToDomPosition = ({ x, y }) => ({
  x: `${x * 100}vw`,
  y: `${y * 100}vh`,
});
```

Определяем функцию позиционирования "курсора":

```javascript
function updateCursorPosition(landmarks) {
  const cursorCoords = getCursorCoords(landmarks);
  if (!cursorCoords) return;

  const { x, y } = convertCoordsToDomPosition(cursorCoords);

  cursor$.style.transform = `translate(${x}, ${y})`;
}
```

Наконец, определяем функцию обработки результатов обнаружения кисти:

```javascript
function onResults(handData) {
  if (!handData.multiHandLandmarks.length) return;

  updateCursorPosition(handData.multiHandLandmarks[0]);
}
```

_Обратите внимание_: для того, чтобы "отзеркалить" координату `x` контрольной точки (если возникнет такая необходимость) можно сделать так - `x = -x + 1`.

Результат выполнения кода примера:

<img src="https://habrastorage.org/webt/1l/ma/vh/1lmavhydcpgq0lerkw_wjq_8hp8.png" />
<br />

## Определение жеста "щипок"

Щипок (pinch) как жест представляет собой _сведение кончиков указательного и большого пальцев на достаточно близкое расстояние_.

<img src="https://habrastorage.org/webt/zd/ik/ha/zdikhaa8aqpfopi9x6uvitntgfg.png" />
<br />

"Достаточно близкое расстояние - это сколько?" - спросите вы. Автор указанной в начале статьи определяет это расстояние как `0.8` для координат `x` и `y` и `0.11` для координаты `z`. Я согласен с его вычислениями. Выглядит это следующим образом:

```javascript
const distance = {
    x: Math.abs(fingerTip.x - thumbTip.x),
    y: Math.abs(fingerTip.y - thumbTip.y),
    z: Math.abs(fingerTip.z - thumbTip.z),
  };
const areFingersCloseEnough =
  distance.x < 0.08 && distance.y < 0.08 && distance.z < 0.11;
```

Еще несколько важных моментов:

- мы хотим регистрировать и обрабатывать начало, продолжение и окончание щипка (`pinch_start`, `pinch_move` и `pinch_stop`, соответственно);
- для определения перехода щипка из одного состояния в другое (начало -> конец, или наоборот), требуется сохранять предыдущее состояние;
- определение перехода должно выполняться с некоторое задержкой, например, `250 мс`.

Для данного примера нам не нужен "курсор". Редактируем `index.html`:

```html
<!-- <div class="cursor"></div> -->
```

Создаем в директории `js` файл `detect-pinch-gesture.js`.

Начало кода идентично коду предыдущего примера, за исключением того, что мы не работаем с "курсором":

```javascript
import { Camera } from "@mediapipe/camera_utils";
import { Hands } from "@mediapipe/hands";

const video$ = document.querySelector("video");

const width = window.innerWidth;
const height = window.innerHeight;

const handParts = {
  wrist: 0,
  thumb: { base: 1, middle: 2, topKnuckle: 3, tip: 4 },
  indexFinger: { base: 5, middle: 6, topKnuckle: 7, tip: 8 },
  middleFinger: { base: 9, middle: 10, topKnuckle: 11, tip: 12 },
  ringFinger: { base: 13, middle: 14, topKnuckle: 15, tip: 16 },
  pinky: { base: 17, middle: 18, topKnuckle: 19, tip: 20 },
};

const hands = new Hands({
  locateFile: (file) => `../node_modules/@mediapipe/hands/${file}`,
});
hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 0,
});
hands.onResults(onResults);

const camera = new Camera(video$, {
  onFrame: async () => {
    await hands.send({ image: video$ });
  },
  facingMode: undefined,
  width,
  height,
});
camera.start();

// решил переименовать данную функцию, поскольку речь идет все-таки не о координатах курсора, а о координатах сустава пальца
const getFingerCoords = (landmarks) =>
  landmarks[handParts.indexFinger.topKnuckle];

function onResults(handData) {
  if (!handData.multiHandLandmarks.length) return;

  updatePinchState(handData.multiHandLandmarks[0]);
}
```

Определяем типы событий, задержку и состояние щипка:

```javascript
const PINCH_EVENTS = {
  START: "pinch_start",
  MOVE: "pinch_move",
  STOP: "pinch_stop",
};

const OPTIONS = {
  PINCH_DELAY_MS: 250,
};

const state = {
  isPinched: false,
  pinchChangeTimeout: null,
};
```

Объявляем функцию определения щипка:

```javascript
function isPinched(landmarks) {
  const fingerTip = landmarks[handParts.indexFinger.tip];
  const thumbTip = landmarks[handParts.thumb.tip];
  if (!fingerTip || !thumbTip) return;

  const distance = {
    x: Math.abs(fingerTip.x - thumbTip.x),
    y: Math.abs(fingerTip.y - thumbTip.y),
    z: Math.abs(fingerTip.z - thumbTip.z),
  };

  const areFingersCloseEnough =
    distance.x < 0.08 && distance.y < 0.08 && distance.z < 0.11;

  return areFingersCloseEnough;
}
```

Определяем функцию, создающую кастомное событие с помощью конструктора [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent) и вызывающую его с помощью метода [dispatchEvent](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent):

```javascript
// функция принимает название события и данные - координаты пальца
function triggerEvent({ eventName, eventData }) {
  const event = new CustomEvent(eventName, { detail: eventData });
  document.dispatchEvent(event);
}
```

Определяем функцию обновления состояния щипка:

```javascript
function updatePinchState(landmarks) {
  // определяем предыдущее состояние
  const wasPinchedBefore = state.isPinched;
  // определяем начало или окончание щипка
  const isPinchedNow = isPinched(landmarks);
  // определяем переход состояния
  const hasPassedPinchThreshold = isPinchedNow !== wasPinchedBefore;
  // определяем задержку обновления состояния
  const hasWaitStarted = !!state.pinchChangeTimeout;

  // если имеет место переход состояния и мы не находимся в режиме ожидания
  if (hasPassedPinchThreshold && !hasWaitStarted) {
    // вызываем соответствующее событие с задержкой
    registerChangeAfterWait(landmarks, isPinchedNow);
  }

  // если состояние осталось прежним
  if (!hasPassedPinchThreshold) {
    // отменяем режим ожидания
    cancelWaitForChange();

    // если щипок продолжается
    if (isPinchedNow) {
      // вызываем соответствующее событие
      triggerEvent({
        eventName: PINCH_EVENTS.MOVE,
        eventData: getFingerCoords(landmarks),
      });
    }
  }
}
```

Определяем функции обновления состояния и отмены ожидания:

```javascript
function registerChangeAfterWait(landmarks, isPinchedNow) {
  state.pinchChangeTimeout = setTimeout(() => {
    state.isPinched = isPinchedNow;

    triggerEvent({
      eventName: isPinchedNow ? PINCH_EVENTS.START : PINCH_EVENTS.STOP,
      eventData: getFingerCoords(landmarks),
    });
  }, OPTIONS.PINCH_DELAY_MS);
}

function cancelWaitForChange() {
  clearTimeout(state.pinchChangeTimeout);
  state.pinchChangeTimeout = null;
}
```

Определяем обработчики начала, продолжения и окончания щипка (просто выводим координаты верхнего сустава указательного пальца в консоль):

```javascript
function onPinchStart(eventInfo) {
  const fingerCoords = eventInfo.detail;
  console.log("Pinch started", fingerCoords);
}

function onPinchMove(eventInfo) {
  const fingerCoords = eventInfo.detail;
  console.log("Pinch moved", fingerCoords);
}

function onPinchStop(eventInfo) {
  const fingerCoords = eventInfo.detail;
  console.log("Pinch stopped", fingerCoords);
}
```

И регистрируем их:

```javascript
document.addEventListener(PINCH_EVENTS.START, onPinchStart);
document.addEventListener(PINCH_EVENTS.MOVE, onPinchMove);
document.addEventListener(PINCH_EVENTS.STOP, onPinchStop);
```

<spoiler title="Полный код примера:">

```javascript
import { Camera } from "@mediapipe/camera_utils";
import { Hands } from "@mediapipe/hands";

const video$ = document.querySelector("video");

const width = window.innerWidth;
const height = window.innerHeight;

const handParts = {
  wrist: 0,
  thumb: { base: 1, middle: 2, topKnuckle: 3, tip: 4 },
  indexFinger: { base: 5, middle: 6, topKnuckle: 7, tip: 8 },
  middleFinger: { base: 9, middle: 10, topKnuckle: 11, tip: 12 },
  ringFinger: { base: 13, middle: 14, topKnuckle: 15, tip: 16 },
  pinky: { base: 17, middle: 18, topKnuckle: 19, tip: 20 },
};

const hands = new Hands({
  locateFile: (file) => `../node_modules/@mediapipe/hands/${file}`,
});
hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 0,
});
hands.onResults(onResults);

const camera = new Camera(video$, {
  onFrame: async () => {
    await hands.send({ image: video$ });
  },
  facingMode: undefined,
  width,
  height,
});
camera.start();

const getFingerCoords = (landmarks) =>
  landmarks[handParts.indexFinger.topKnuckle];

function onResults(handData) {
  if (!handData.multiHandLandmarks.length) return;

  updatePinchState(handData.multiHandLandmarks[0]);
}

const PINCH_EVENTS = {
  START: "pinch_start",
  MOVE: "pinch_move",
  STOP: "pinch_stop",
};

const OPTIONS = {
  PINCH_DELAY_MS: 250,
};

const state = {
  isPinched: false,
  pinchChangeTimeout: null,
};

function isPinched(landmarks) {
  const fingerTip = landmarks[handParts.indexFinger.tip];
  const thumbTip = landmarks[handParts.thumb.tip];
  if (!fingerTip || !thumbTip) return;

  const distance = {
    x: Math.abs(fingerTip.x - thumbTip.x),
    y: Math.abs(fingerTip.y - thumbTip.y),
    z: Math.abs(fingerTip.z - thumbTip.z),
  };

  const areFingersCloseEnough =
    distance.x < 0.08 && distance.y < 0.08 && distance.z < 0.11;

  return areFingersCloseEnough;
}

function triggerEvent({ eventName, eventData }) {
  const event = new CustomEvent(eventName, { detail: eventData });
  document.dispatchEvent(event);
}

function updatePinchState(landmarks) {
  const wasPinchedBefore = state.isPinched;
  const isPinchedNow = isPinched(landmarks);
  const hasPassedPinchThreshold = isPinchedNow !== wasPinchedBefore;
  const hasWaitStarted = !!state.pinchChangeTimeout;

  if (hasPassedPinchThreshold && !hasWaitStarted) {
    registerChangeAfterWait(landmarks, isPinchedNow);
  }

  if (!hasPassedPinchThreshold) {
    cancelWaitForChange();

    if (isPinchedNow) {
      triggerEvent({
        eventName: PINCH_EVENTS.MOVE,
        eventData: getFingerCoords(landmarks),
      });
    }
  }
}

function registerChangeAfterWait(landmarks, isPinchedNow) {
  state.pinchChangeTimeout = setTimeout(() => {
    state.isPinched = isPinchedNow;

    triggerEvent({
      eventName: isPinchedNow ? PINCH_EVENTS.START : PINCH_EVENTS.STOP,
      eventData: getFingerCoords(landmarks),
    });
  }, OPTIONS.PINCH_DELAY_MS);
}

function cancelWaitForChange() {
  clearTimeout(state.pinchChangeTimeout);
  state.pinchChangeTimeout = null;
}

function onPinchStart(eventInfo) {
  const fingerCoords = eventInfo.detail;
  console.log("Pinch started", fingerCoords);
}

function onPinchMove(eventInfo) {
  const fingerCoords = eventInfo.detail;
  console.log("Pinch moved", fingerCoords);
}

function onPinchStop(eventInfo) {
  const fingerCoords = eventInfo.detail;
  console.log("Pinch stopped", fingerCoords);
}

document.addEventListener(PINCH_EVENTS.START, onPinchStart);
document.addEventListener(PINCH_EVENTS.MOVE, onPinchMove);
document.addEventListener(PINCH_EVENTS.STOP, onPinchStop);
```

</spoiler>

Результат выполнения кода примера с закомментированным `console.log("Pinch moved", fingerCoords);`:

<img src="https://habrastorage.org/webt/9_/sf/cq/9_sfcqzwehlu-owjcusnfbymfck.png" />
<br />

Обработка продолжения щипка:

<img src="https://habrastorage.org/webt/ou/nc/uw/ouncuwc7duce7-brv6bvhx16mak.png" />
<br />

## Нажатие кнопки с помощью щипка

Итак, мы научились получать координаты суставов пальцев и определять щипок. Этого вполне достаточно для взаимодействия с элементами на странице. Реализуем нажатие кнопки с помощью щипка.

Редактируем `index.html`, добавляя в него второй "курсор", контейнер для счетчика кликов и кнопку:

```html
<div class="cursor2"></div>
<div class="counter-box">
  <p>0</p>
  <button>Click me by pinch</button>
</div>
```

Редактируем `style.css`:

```css
body {
  margin: 0;
  overflow: hidden;
}

canvas {
  display: none;
}

video {
  max-width: 100vw;
  max-height: 100vh;
}

.cursor,
.cursor2 {
  height: 0;
  left: 0;
  position: absolute;
  top: 0;
  transition: transform 0.1s;
  width: 0;
  z-index: 10;
}

.cursor::after,
.cursor2::after {
  background-color: #0275d8;
  border-radius: 50%;
  content: "";
  display: block;
  height: 50px;
  left: 0;
  position: absolute;
  top: 0;
  transform: translate(-50%, -50%);
  width: 50px;
}

.cursor2::after {
  background-color: #5cb85c;
  width: 20px;
  height: 20px;
}

.counter-box {
  left: 50%;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
}

p {
  font-size: 2rem;
  text-align: center;
}

button {
  border-radius: 4px;
  border: 2px solid #0275d8;
  font-size: 1rem;
  padding: 1rem;
}
```

Создаем в директории `js` файл `click-button-by-pinch.js`.

Импортируем зависимости, стили, получаем ссылки на `DOM-элементы` и данные о прямоугольнике кнопки с помощью метода [getBoundingClientRect](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect):

```javascript
import { Camera } from "@mediapipe/camera_utils";
import { Hands } from "@mediapipe/hands";
import "../style.css";

const video$ = document.querySelector("video");
const cursor$ = document.querySelector(".cursor2");
const counter$ = document.querySelector("p");
const button$ = document.querySelector("button");
// кнопка статична, поэтому данные можно получить сразу
const buttonRect = button$.getBoundingClientRect();
```

Определяем переменную для счетчика кликов и регистрируем обработчик нажатия кнопки:

```javascript
let count = 0;

button$.addEventListener("click", () => {
  counter$.textContent = ++count;
});
```

Остальной код идентичен коду предыдущего примера, за исключением следующего:

- получаем координаты кончика указательного пальца:

```javascript
const getFingerCoords = (landmarks) => landmarks[handParts.indexFinger.tip];
```

- в функции `updateCursorPosition` мы не только позиционируем "курсор", но также определяем пересечение курсора с кнопкой и стилизуем границы кнопки соответствующим образом:

```javascript
function updateCursorPosition(landmarks) {
  const fingerCoords = getFingerCoords(landmarks);
  if (!fingerCoords) return;

  const { x, y } = convertCoordsToDomPosition(fingerCoords);

  cursor$.style.transform = `translate(${x}, ${y})`;

  const hit = isIntersected();
  if (hit) {
    button$.style.border = "2px solid #5cb85c";
  } else {
    button$.style.border = "2px solid #0275d8";
  }
}
```

- объявляем функцию определения пересечения "курсора" с кнопкой:

```javascript
function isIntersected() {
  const cursorRect = cursor$.getBoundingClientRect();

  // пересечение имеет место, когда прямоугольник "курсора" целиком находится внутри прямоугольника кнопки
  const hit =
    cursorRect.x >= buttonRect.x &&
    cursorRect.y >= buttonRect.y &&
    cursorRect.x + cursorRect.width <= buttonRect.x + buttonRect.width &&
    cursorRect.y + cursorRect.height <= buttonRect.y + buttonRect.height;

  return hit;
}
```

- обрабатывается только начало щипка:

```javascript
const PINCH_EVENTS = {
  START: "pinch_start",
  // для соблюдения контракта
  STOP: "pinch_stop",
};

function updatePinchState(landmarks) {
  const wasPinchedBefore = state.isPinched;
  const isPinchedNow = isPinched(landmarks);
  const hasPassedPinchThreshold = isPinchedNow !== wasPinchedBefore;
  const hasWaitStarted = !!state.pinchChangeTimeout;

  if (hasPassedPinchThreshold && !hasWaitStarted) {
    registerChangeAfterWait(landmarks, isPinchedNow);
  }

  if (!hasPassedPinchThreshold) {
    cancelWaitForChange();
  }
}

document.addEventListener(PINCH_EVENTS.START, onPinchStart);
```

- обработка начала щипка состоит в нажатии кнопки при нахождении в состоянии пересечения:

```javascript
function onPinchStart() {
  const hit = isIntersected();

  if (hit) {
    button$.click();
  }
}
```

<spoiler title="Полный код примера:">

```javascript
import { Camera } from "@mediapipe/camera_utils";
import { Hands } from "@mediapipe/hands";
import "../style.css";

const video$ = document.querySelector("video");
const cursor$ = document.querySelector(".cursor2");
const counter$ = document.querySelector("p");
const button$ = document.querySelector("button");
const buttonRect = button$.getBoundingClientRect();

let count = 0;

button$.addEventListener("click", () => {
  counter$.textContent = ++count;
});

const width = window.innerWidth;
const height = window.innerHeight;

const handParts = {
  wrist: 0,
  thumb: { base: 1, middle: 2, topKnuckle: 3, tip: 4 },
  indexFinger: { base: 5, middle: 6, topKnuckle: 7, tip: 8 },
  middleFinger: { base: 9, middle: 10, topKnuckle: 11, tip: 12 },
  ringFinger: { base: 13, middle: 14, topKnuckle: 15, tip: 16 },
  pinky: { base: 17, middle: 18, topKnuckle: 19, tip: 20 },
};

const hands = new Hands({
  locateFile: (file) => `../node_modules/@mediapipe/hands/${file}`,
});
hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 0,
});
hands.onResults(onResults);

const camera = new Camera(video$, {
  onFrame: async () => {
    await hands.send({ image: video$ });
  },
  facingMode: undefined,
  width,
  height,
});
camera.start();

const getFingerCoords = (landmarks) => landmarks[handParts.indexFinger.tip];

const convertCoordsToDomPosition = ({ x, y }) => ({
  x: `${x * 100}vw`,
  y: `${y * 100}vh`,
});

function updateCursorPosition(landmarks) {
  const fingerCoords = getFingerCoords(landmarks);
  if (!fingerCoords) return;

  const { x, y } = convertCoordsToDomPosition(fingerCoords);

  cursor$.style.transform = `translate(${x}, ${y})`;

  const hit = isIntersected();
  if (hit) {
    button$.style.border = "2px solid #5cb85c";
  } else {
    button$.style.border = "2px solid #0275d8";
  }
}

function onResults(handData) {
  if (!handData.multiHandLandmarks.length) return;

  updateCursorPosition(handData.multiHandLandmarks[0]);

  updatePinchState(handData.multiHandLandmarks[0]);
}

const PINCH_EVENTS = {
  START: "pinch_start",
  STOP: "pinch_stop",
};

const OPTIONS = {
  PINCH_DELAY_MS: 250,
};

const state = {
  isPinched: false,
  pinchChangeTimeout: null,
};

function isPinched(landmarks) {
  const fingerTip = landmarks[handParts.indexFinger.tip];
  const thumbTip = landmarks[handParts.thumb.tip];
  if (!fingerTip || !thumbTip) return;

  const distance = {
    x: Math.abs(fingerTip.x - thumbTip.x),
    y: Math.abs(fingerTip.y - thumbTip.y),
    z: Math.abs(fingerTip.z - thumbTip.z),
  };

  const areFingersCloseEnough =
    distance.x < 0.08 && distance.y < 0.08 && distance.z < 0.11;

  return areFingersCloseEnough;
}

function isIntersected() {
  const cursorRect = cursor$.getBoundingClientRect();

  const hit =
    cursorRect.x >= buttonRect.x &&
    cursorRect.y >= buttonRect.y &&
    cursorRect.x + cursorRect.width <= buttonRect.x + buttonRect.width &&
    cursorRect.y + cursorRect.height <= buttonRect.y + buttonRect.height;

  return hit;
}

function triggerEvent({ eventName, eventData }) {
  const event = new CustomEvent(eventName, { detail: eventData });
  document.dispatchEvent(event);
}

function updatePinchState(landmarks) {
  const wasPinchedBefore = state.isPinched;
  const isPinchedNow = isPinched(landmarks);
  const hasPassedPinchThreshold = isPinchedNow !== wasPinchedBefore;
  const hasWaitStarted = !!state.pinchChangeTimeout;

  if (hasPassedPinchThreshold && !hasWaitStarted) {
    registerChangeAfterWait(landmarks, isPinchedNow);
  }

  if (!hasPassedPinchThreshold) {
    cancelWaitForChange();
  }
}

function registerChangeAfterWait(landmarks, isPinchedNow) {
  state.pinchChangeTimeout = setTimeout(() => {
    state.isPinched = isPinchedNow;

    triggerEvent({
      eventName: isPinchedNow ? PINCH_EVENTS.START : PINCH_EVENTS.STOP,
      eventData: getFingerCoords(landmarks),
    });
  }, OPTIONS.PINCH_DELAY_MS);
}

function cancelWaitForChange() {
  clearTimeout(state.pinchChangeTimeout);
  state.pinchChangeTimeout = null;
}

function onPinchStart() {
  const hit = isIntersected();

  if (hit) {
    button$.click();
  }
}

document.addEventListener(PINCH_EVENTS.START, onPinchStart);
```

</spoiler>

Результат выполнения кода примера:

<img src="https://habrastorage.org/webt/bj/m3/qx/bjm3qxlr74j7sebrlodb2awgi34.png" />
<br />

Когда я прочитал указанную в начале статью, первой моей мыслью было: "А будущее-то, оказывается, уже наступило" :)

Как вы сами понимаете, возможности по использованию рассмотренной технологии безграничны, так что дерзайте.

Благодарю за внимание и happy coding!
