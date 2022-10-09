---
sidebar_position: 17
title: Руководство по использованию веб-потоков в Node.js
description: Руководство по использованию веб-потоков в Node.js
keywords: ["node.js", nodejs, web-streams, stream, веб-потоки, поток]
tags: ["node.js", nodejs, web-streams, stream, веб-потоки, поток]
---

# Web Streams

[Источник](https://2ality.com/2022/06/web-streams-nodejs.html).

Веб-потоки (web streams) - это стандарт для потоков (streams), который поддерживается всеми основными веб-платформами: веб-браузерами, [Node.js](https://nodejs.org/) и [Deno](https://deno.land/). Потоки - это абстракция для чтения и записи данных последовательно, небольшими частями из любого вида источника - файлов, данных, находящихся на сервере, и т.д.

Например, глобальная функция [fetch](https://developer.mozilla.org/ru/docs/Web/API/Fetch_API/Using_Fetch) (которая используется для загрузки онлайн-ресурсов) асинхронно возвращает ответ (`Response`), содержащий свойство `body` с веб-потоком.

## 1. Что такое веб-поток?

Поток - это структура данных (data structure) для доступа к таким данным, как:

- файлы;
- данные, находящиеся на сервере;
- и т.д.

Двумя основными преимуществами потоков являются:

- возможность работы с большим количеством данных благодаря тому, что потоки разделяют их на небольшие части (называемые "чанками"/chunks), которые могут обрабатываться по одному за раз;
- возможность использования одной структуры данных для обработки разных данных, что облегчает повторное использование кода.

Веб-потоки ("веб" часто опускается) - это относительно новый стандарт, изначально поддерживаемый браузерами, но теперь поддерживаемый также `Node.js` и `Deno`, как показано в [этой таблице](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API#browser_compatibility).

Чанки бывают 2 видов:

- текстовые потоки (text streams): строки;
- бинарные потоки (потоки байтов) (binary streams): [Uint8Array](https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) (разновидность [TypedArray](https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) (типизированных массивов)).

### 1.1. Виды потоков

Существует 3 основных вида потоков:

- `RS` (поток для чтения) (далее - `RS`) используется для чтения данных из источника (source). Код, который это делает, называется потребителем (consumer);
- `WS` (поток для записи) (далее - `WS`) используется для записи данных в приемник (sink). Код, который это делает, называется производителем (producer);
- `TS` (поток для преобразования) (далее - `TS`) состоит из 2 потоков:
  - он получает данные от записывающей стороны (стороны для записи) (writable side), `WS`;
  - он отправляет данные читающей стороне (стороне для чтения) (readable side), `RS`.

Основная идея `TS` состоит в преобразовании данных, проходящих через туннель (конвейер) (pipe). Другими словами, данные записываются на стороне для записи и после преобразования читаются на стороне для чтения. Следующие `TS` встроены в большинство платформ, поддерживающих `JavaScript`:

- поскольку строки в `JS` имеют кодировку `UTF-16`, данные в кодировке `UTF-8` обрабатываются как двоичные. `TextDecoderStream` конвертирует такие данные в строки;
- `TextEncoderStream` конвертирует строки в данные в кодировке `UTF-8`;
- `CompressionStream` сжимает двоичные данные в `GZIP` и другие форматы сжатия;
- `DecompressionStream` извлекает данные из `GZIP` и других форматов.

`RS`, `WS` и `TS` могут применяться для передачи текстовых или бинарных данных. В статье мы будем в основном говорить о текстовых данных. Байтовые потоки для бинарных данных кратко упоминаются в конце.

### 1.2. Конвейер

"Туннелирование" (piping) - это операция, позволяющая объединять (pipe) `RS` и `WS`: до тех пор, пока `RS` производит данные, данная операция читает их и записывает в `WS`. При объединении 2 потоков мы получаем надежный способ передачи данных из одной локации в другую (например, для копирования файла). Однако, можно объединить больше 2 потоков и получить конвейер для обработки данных разными способами. Пример конвейера:

- начинается с `RS`;
- затем следует `TS`;
- цепочка (chain) заканчивается `WS`.

### 1.3. Противодавление

Одной из проблем конвейера может стать ситуация, когда один из звеньев цепочки получает больше данных, чем можем обработать в данный момент. Противодавление (обратное давление) (backpressure) позволяет решить эту задачу: получатель сообщает отправителю о необходимости временно прекратить передачу данных во избежание перегрузки (переполнения).

Другими словами, противодавление - это сигнал, передающийся от перегруженного звена к началу цепочки. Представим, что у нас имеется такая цепочка:

```
RS -> TS -> WS
```

Путь противодавления будет следующим:

- `WS` сигнализирует, что не справляется с обработкой данных;
- конвейер прекращает читать данные из `TS`;
- данные аккумулируются (накапливаются) внутри `TS` (это называется буферизацией/buffering);
- `TS` сигнализирует о заполненности;
- конвейер перестает читать данные из `RS`.

Мы достигли начала цепочки. Пока данные накапливаются внутри `RS`, у `WS` есть время на восстановление. После восстановления `WS` сигнализирует о готовности к получению данных. Этот сигнал также передается в начало цепочки, и обработка данных возобновляется.

### 1.4. Поддержка потоков в `Node.js`

В `Node.js` потоки доступны из 2 источников:

- из модуля `node:stream/web`;
- через глобальные переменные (как в браузере).

На данный момент только один `API` напрямую поддерживает потоки в `Node.js` - `Fetch API`:

```javascript
const response = await fetch("https://exmple.com");
const readableStream = response.body;
```

Для всего остального следует использовать один из следующих статических методов модуля `node:stream` для преобразования `Node.js-потока` в веб-поток, и наоборот:

- `Readable`:
  - `Readable.toWeb(nodeReadable)`;
  - `Readable.fromWeb(webReadableStream, options?)`;
- `Writable`:
  - `Writable.toWeb(nodeWritable)`;
  - `Writable.fromWeb(webWritableStream, options)`;
- `Duplex`:
  - `Duplex.toWeb(nodeDuplex)`;
  - `Duplex.fromWeb(webTransformStream, options?)`.

`FileHandle` - еще один `API`, частично поддерживающий потоки через метод `readableWebStream`.

## 2. Чтение из `RS`

`RS` позволяют читать чанки данных из разных источников. Они имеют следующую сигнатуру:

```javascript
interface RS<TChunk> {
  getReader(): ReadableStreamDefaultReader<TChunk>;

  readonly locked: boolean;

  [Symbol.asyncIterator](): AsyncIterator<TChunk>;

  cancel(reason?: any): Promise<void>;

  pipeTo(
    destination: WS<TChunk>,
    options?: StreamPipeOptions
  ): Promise<void>;

  pipeThrough<TChunk2>(
    transform: ReadableWritablePair<TChunk2, TChunk>,
    options?: StreamPipeOptions
  ): RS<TChunk2>;

  // Не рассматривается в статье
  tee(): [RS<TChunk>, RS<TChunk>];
}

interface StreamPipeOptions {
  signal?: AbortSignal;
  preventClose?: boolean;
  preventAbort?: boolean;
  preventCancel?: boolean;
}
```

Свойства:

- `getReader()`: возвращает `Reader` - объект, позволяющий читать из `RS`. `Readers` похожи на итераторы, возвращаемые перебираемыми сущностями;
- `locked`: одновременно может использоваться только один `Reader` для одного `RS`. `RS` блокируется на время использования `Reader`, `getReader()` в этот период вызываться не может;
- `[Symbol.asyncIterator]()`: данный метод делает `RS` [асинхронно перебираемыми](https://exploringjs.com/impatient-js/ch_async-iteration.html). В настоящее время он реализован только для некоторых платформ;
- `cancel()`: отменяет поток, поскольку потребитель больше в нем не заинтересован. `reason` (причина) передается в базовый источник (underlying source) `RS` (об этом позже). Возвращаемый промис разрешается после выполнения этой операции;
- `pipeTo()`: передает содержимое `RS` в `WS`. Возвращаемый промис разрешается после выполнения этой операции. `pipeTo()` обеспечивает корректную передачу противодавления, сигналов закрытия, ошибок и т.п. по цепочке. В качестве второго параметра он принимает следующие настройки:
  - `signal`: позволяет передавать `AbortSignal` для прерывания цепочки с помощью `AbortController`;
  - `preventClose`: если имеет значение `true`, предотвращает закрытие `WS` при закрытии `RS`. Может быть полезным при подключении нескольких `RS` к одному `WS`;
  - остальные настройки в статье не рассматриваются. Почитать о них можно [здесь](https://streams.spec.whatwg.org/#rs-prototype);
- `pipeThrough()`: подключает `RS` к `ReadableWritablePair` (по сути, `TS`, об этом позже). Возвращает результирующий `RS` (сторону для чтения `ReadableWritablePair`).

Существует 2 способа потребления `RS`:

- `Readers`;
- асинхронный перебор.

### 2.1. Потребление `RS` через `Readers`

Для чтения данных из `RS` могут использоваться `Readers`. Они имеют следующую сигнатуру:

```javascript
interface ReadableStreamGenericReader {
  readonly closed: Promise<undefined>;
  cancel(reason?: any): Promise<void>;
}

interface ReadableStreamDefaultReader<TChunk>
  extends ReadableStreamGenericReader
{
  releaseLock(): void;
  read(): Promise<ReadableStreamReadResult<TChunk>>;
}

interface ReadableStreamReadResult<TChunk> {
  done: boolean;
  value: TChunk | undefined;
}
```

Свойства:

- `closed`: данный промис разрешается после закрытия потока. Он отклоняется при возникновении ошибки или в случае, когда блокировка `Reader` снимается до закрытия потока;
- `cancel()`: в активном `Reader` данный метод отменяет соответствующий `RS`;
- `releaseLock()`: деактивирует `Reader` и разблокирует поток;
- `read()`: возвращает промис для `ReadableStreamReadResult` (обертка для чанка) с 2 свойствами:
  - `done`: логическое значение - `false`, если чанки могут читаться, `true` после последнего чанка;
  - `value`: чанк или `undefined` после последнего чанка.

`RS` похожи на итерируемые сущности, `Readers` - на итераторы, а `ReadableStreamReadResult` - на объекты, возвращаемые методом `next` итераторов.

Код, демонстрирующий протокол использования `Readers`:

```javascript
const reader = readableStream.getReader(); // 1

assert.equal(readableStream.locked, true); // 2

try {
  while (true) {
    const { done, value: chunk } = await reader.read(); // 3

    if (done) break;
    // Используем `chunk`
  }
} finally {
  reader.releaseLock(); // 4
}
```

__Получение `Reader`__. Мы можем читать прямо из `RS`. Сначала получаем `Reader` (1). Каждый `RS` может иметь только один `Reader`. После получения `Reader` `RS` блокируется (2). Перед следующим вызовом `getReader()` необходимо вызвать `releaseLock()` (4).

__Чтение чанков__. `read()` возвращает промис для объекта со свойствами `done` и `value` (3). После чтения последнего чанка `done` принимает значение `true`. Это похоже на то, как в `JS` работает асинхронный перебор.

#### 2.1.1. Пример: чтение файла через `RS`

В следующем примере читаются чанки (строки) из текстового файла `data.txt`:

```javascript
import * as fs from "node:fs";
import { Readable } from "node:stream";

const nodeReadable = fs.createReadStream(
  "data.txt",
  { encoding: "utf-8" }
);

const webReadableStream = Readable.toWeb(nodeReadable); // 1

const reader = webReadableStream.getReader();

try {
  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    console.log(value);
  }
} finally {
  reader.releaseLock();
}
```

Поток `Node.js` конвертируется в веб-поток. Затем приведенный выше протокол используется для чтения чанков.

#### 2.1.2. Пример: формирование строки из содержимого `RS`

В следующем примере чанки из `RS` объединяются в возвращаемую строку:

```javascript
async function readableStreamToString(readableStream) {
  const reader = readableStream.getReader();

  try {
    let result = "";

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        return result; // 1
      }

      result += value;
    }
  } finally {
    reader.releaseLock(); // 2
  }
}
```

Блок `finally` выполняется всегда, независимо от результата блока `try`. Поэтому блокировка корректно снимается (2) после возвращения результата (1).

### 2.2. Потребление `RS` с помощью асинхронного перебора

`RS` можно потреблять с помощью асинхронного перебора:

```javascript
const iterator = readableStream[Symbol.iterator]();

let exhaustive = false;

try {
  while (true) {
    let chunk;

    ({ done: exhaustive, value: chunk } = await iterator.next());

    if (exhaustive) break;

    console.log(chunk);
  }
} finally {
  // Если цикл был прерван до окончательного (exhaustive) перебора
  // (через исключение или `return`), мы должны вызвать `iterator.return`
  if (!exhaustive) {
    iterator.return();
  }
}
```

К счастью, цикл `for-await-of` обрабатывает все детали асинхронного перебора автоматически:

```javascript
for await (const chunk of readableStream) {
  console.log(chunk);
}
```

#### 2.2.1. Пример: использование асинхронного перебора для чтения потока

```javascript
import * as fs from "node:fs";
import { Readable } from "node:stream";

const nodeReadable = fs.createReadStream(
  "data.txt",
  { encoding: "utf-8" }
);

const webReadableStream = Readable.toWeb(nodeReadable);

for await (const chunk of webReadableStream) {
  console.log(chunk);
}
```

#### 2.2.2. В настоящее время браузеры не поддерживают асинхронный перебор `RS`

В данный момент асинхронный перебор `RS` поддерживается `Node.js` и `Deno`, но не браузерами. Соответствующее [обращение GitHub](https://github.com/whatwg/streams/issues/778).

Обертка из [предложения в отчете о багах Chromium](https://bugs.chromium.org/p/chromium/issues/detail?id=929585#c10):

```javascript
async function* getAsyncIterableFor(readableStream) {
  const reader = readableStream.getReader();

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) return;

      yield value;
    }
  } finally {
    reader.releaseLock();
  }
}
```

### 2.3. Создание конвейера

`RS` предоставляют 2 метода для создания конвейера:

- `readableStream.pipeTo(writeableStream)`: синхронно возвращает промис `p`. Он асинхронно читает все чанки `RS` и записывает их в `WS`. После завершения чтения `p` разрешается.

Мы увидим примеры использования `pipeTo()`, когда будем говорить о `WS`.

- `readableStream.pipeThrough(transformStream)` подключает `RS` к `transformStream.writable` и возвращает `transformStream.readable` (каждый `TS` содержит эти свойства и ссылается на записывающую и читающую стороны). Другими словами, данная операция представляет собой создание нового `RS` посредством подключения `TS` к `RS`.

Мы увидим примеры использования `pipeThrough()`, когда будем говорить о `TS`.

## 3. Превращение источников данных в `RS` с помощью упаковки

Для чтения внешнего источника с помощью `RS`, его можно обернуть в объект-адаптер и передать в конструктор `RS`. Объект-адаптер называется базовым источником (underlying source) `RS` (стратегии помещения в очередь (queuing strategies) рассматриваются ниже, в разделе, посвященном противодавлению):

```javascript
new ReadableStream(underlyingSource?, queuingStrategy?)
```

Интерфейс базовых источников:

```javascript
interface UnderlyingSource<TChunk> {
  start?(
    controller: ReadableStreamController<TChunk>
  ): void | Promise<void>;

  pull?(
    controller: ReadableStreamController<TChunk>
  ): void | Promise<void>;

  cancel?(reason?: any): void | Promise<void>;

  // Используются только в байтовых потоках и в данном разделе не рассматриваются
  type: "bytes" | undefined;
  autoAllocateChunkSize: bigint;
}
```

Эти методы вызываются в следующих случаях:

- `start(controller)`: вызывается сразу после вызова конструктора `RS`;
- `pull(controller)`: вызывается при появлении свободного места (пространства, комнаты) (room) во внутренней очереди `RS`. Он вызывается снова и снова до тех пор, пока очередь не будет заполнена. Данный метод вызывается только после завершения `start()`. Если `pull()` ничего не помещает в очередь, он больше не вызывается;
- `cancel(reason)`: вызывается, если потребитель `RS` вызывает `readableStream.cancel()` или `reader.cancel().reason` является значением, переданным этим методам.

Каждый из приведенных методов может вернуть промис, до разрешения которого другие операции выполняться не будут. Это может быть полезным при выполнении асинхронных задач.

`controller`, передаваемый в `start()` и `pull()` позволяет им получать доступ к потоку. Он имеет следующую сигнатуру:

```javascript
type ReadableStreamController<TChunk> =
  | ReadableStreamDefaultController<TChunk>
  // не рассматривается
  | ReadableByteStreamController<TChunk>;

interface ReadableStreamDefaultController<TChunk> {
  enqueue(chunk?: TChunk): void;

  readonly desiredSize: number | null;

  close(): void;

  error(err?: any): void;
}
```

Методы (чанки - это строки):

- `enqueue(chunk)`: помещает `chunk` во внутреннюю очередь `RS`;
- `desiredSize`: количество свободного пространства очереди, в которое пишет `enqueue()`. Имеет значение `0` при заполнении очереди и отрицательное значение при превышении максимального размера очереди. Если желаемый размер (desired size) `<= 0`, помещение в очередь следует прекратить;
  - если поток закрыт, его `desiredSize` равен `0`;
  - если поток находится в состоянии ошибки, его `desiredSize` равен `null`;
- `close()`: закрывает `RS`. Потребители буду иметь возможность опустошать очередь, но после этого поток закончится. Важно, чтобы базовый источник вызывал данный метод, в противном случае, чтение потока никогда не закончится;
- `error(err)`: переводит поток в состояние ошибки - последующие взаимодействия с ним будут проваливаться со значением `err`.

### 3.1. Первый пример реализации базового источника

В первом примере реализуется только метод `start()`. Случаи использования `pull()` рассматриваются в следующем подразделе:

```javascript
const readableStream = new ReadableStream({
  start(controller) {
    controller.enqueue("Первая строка\n"); // (1)
    controller.enqueue("Вторая строка\n"); // (2)
    controller.close(); // (3)
  },
});

for await (const chunk of readableStream) {
  console.log(chunk);
}
/**
 * Первая строка\n
 * Вторая строка\n
*/
```

Мы использует контроллер для создания потока с 2 чанками (1 и 2). Важно закрыть поток (3). В противном случае, цикл `for-await-of` никогда не завершится.

_Обратите внимание_: данный способ помещения чанков в очередь не является полностью безопасным - существует риск превышения возможностей внутренней очереди. Скоро мы увидим, как избежать такого риска.

### 3.2. Использование `RS` для оборачивания push- или pull-источника

Распространенным сценарием является преобразование push- или pull-источника в `RS`. Вид источника (push или pull) определяет, как мы обращаемся к `RS` из `UnderlyingSource`:

- push-источник: такой источник уведомляет нас о появлении новых данных. Для регистрации обработчиков и поддержки структур данных используется метод `start`. Если полученных данных слишком много и желаемый размер перестал быть положительным, источник приостанавливается. При последующем вызове `pull()` источник может быть возобновлен. Приостановка внешнего источника в ответ на отрицательность желаемого размера называется применением противодавления (applying backpressure);
- pull-источник: такой источник опрашивается на наличие новых данных - часто асинхронно. Поэтому, как правило, данные извлекаются при вызове `pull()`, а не при вызове `start()`.

#### 3.2.1. Пример: создание `RS` из push-источника с поддержкой противодавления

В следующем примере `RS` оборачивает сокет, который "пушит" нам данные (вызывает нас):

```javascript
function makeReadableBackpressureSocketStream(host, port) {
  const socket = createBackpressureSocket(host, port);

  return new RS({
    start(controller) {
      socket.ondata = (event) => {
        controller.enqueue(event.data);

        if (controller.desiredSize <= 0) {
          // Внутренняя очередь заполнилась, передаем
          // сигнал противодавления базовому источнику
          socket.readStop();
        }
      };

      socket.onend = () => controller.close();

      socket.onerror = () => controller.error(
        new Error("Возникла ошибка!"));
    },

    pull() {
      // Данный метод вызывается, если внутренняя очередь опустела, но
      // потребитель потока хочет еще данных.
      // Возобновляем ранее приостановленный поток данных
      socket.readStart();
    },

    cancel() {
      socket.close();
    },
  });
}
```

#### 3.2.2. Пример: создание `RS` из pull-источника

Вспомогательная функция `iterableToReadableStream` принимает итерируемую сущность с чанками и преобразует их в `RS`:

```javascript
/**
 * @param iterable итерируемая сущность (асинхронная или синхронная)
 */
 function iterableToReadableStream(iterable) {
  return new RS({
    start() {
      if (typeof iterable[Symbol.asyncIterator] === "function") {

        this.iterator = iterable[Symbol.asyncIterator]();

      } else if (typeof iterable[Symbol.iterator] === "function") {

        this.iterator = iterable[Symbol.iterator]();

      } else {
        throw new Error(iterable + " не является итерируемой сущностью");
      }
    },

    async pull(controller) {
      if (this.iterator === null) return;
      // Синхронные итераторы возвращают обычные значение (не промисы)
      // однако для `await` это неважно, значения просто передаются дальше
      const { value, done } = await this.iterator.next();

      if (done) {
        this.iterator = null;
        controller.close();
        return;
      }

      controller.enqueue(value);
    },

    cancel() {
      this.iterator = null;
      controller.close();
    },
  });
}
```

Создадим асинхронную функцию-генератор и преобразуем ее в `RS`:

```javascript
async function* genAsyncIterable() {
  yield "как";
  yield "твои";
  yield "дела?";
}

const readableStream = iterableToReadableStream(genAsyncIterable());

for await (const chunk of readableStream) {
  console.log(chunk);
}
/**
 * как
 * твои
 * дела?
*/

// iterableToReadableStream() также работает с синхронными сущностями
const syncIterable = ["всем", "привет"];

const readableStream = iterableToReadableStream(syncIterable);

for await (const chunk of readableStream) {
  console.log(chunk);
}
/**
 * всем
 * привет
*/
```

Возможно, в будущем появится статический вспомогательный метод `RS.from()`, предоставляющий этот функционал из коробки (см. [этот пул-реквест](https://github.com/whatwg/streams/pull/1083)).

## 4. Запись в `WS`

`WS` позволяют записывать чанки данных в разные приемники. Они имеют следующую сигнатуру:

```javascript
interface WS<TChunk> {
  getWriter(): WritableStreamDefaultWriter<TChunk>;

  readonly locked: boolean;

  close(): Promise<void>;

  abort(reason?: any): Promise<void>;
}
```

Свойства:

- `getWriter()`: возвращает `Writer` - объект, через который осуществляется запись в `WS`;
- `locked`: один `WS` может одновременно иметь одного `Writer`. До тех пор, пока `Writer` используется, `WS` блокируется, а метод `getWriter()` вызываться не может;
- `close()`: закрывает поток:
  - базовый приемник (underlying sink) (об этом позже) продолжает получать чанки из очереди;
  - все попытки записи тихо завершаются ничем (без ошибок);
  - метод возвращает промис, который разрешается после успешной записи в приемник всех чанков из очереди и закрытия приемника. При возникновении ошибки промис отклоняется;
- `abort()`: прерывает поток:
  - поток переводится в состояние ошибки;
  - промис разрешается после закрытия приемника и отклоняется при возникновении ошибки.

Существует 2 способа записи данных в `WS`:

- с помощью `Writers`;
- через подключение к `WS`.

### 4.1. Запись в `WS` с помощью `Writers`

`Writers` имеют следующую сигнатуру:

```javascript
interface WritableStreamDefaultWriter<TChunk> {
  readonly desiredSize: number | null;

  readonly ready: Promise<undefined>;

  write(chunk?: TChunk): Promise<void>;

  releaseLock(): void;

  close(): Promise<void>;

  readonly closed: Promise<undefined>;

  abort(reason?: any): Promise<void>;
}
```

Свойства:

- `desiredSize`: количество свободного места в очереди `WS`. Если имеет значение `0`, значит, очередь заполнена, если имеет отрицательное значение - превышен максимальный размер очереди. Таким образом, если желаемый размер `<= 0`, запись следует прекратить;
  - если поток закрыт, желаемый размер равен `0`;
  - если поток находится в состоянии ошибки, желаемый размер равен `null`;
- `ready`: возвращает промис, который разрешается при получении желаемым размером положительного значения. Это означает, что отсутствует активное противодавление и запись может быть продолжена. Если желаемый размер вновь становится non-positive, создается и возвращается новый ожидающий (pending) промис;
- `write()`: записывает чанк в поток. Возвращает промис, который разрешается после записи и отклоняется при ошибке;
- `releaseLock()`: снимает блокировку потока;
- `close()`: имеет тот же эффект, что закрытие потока;
- `closed`: возвращает промис, разрешающийся при закрытии потока;
- `abort()`: имеет тот же эффект, что прерывание потока.

Код, демонстрирующий протокол использования `Writers`:

```javascript
const writer = writableStream.getWriter(); // (1)

assert.equal(writableStream.locked, true); // (2)

try {
  // Записываем чанки (об этом позже)
} finally {
  writer.releaseLock(); // (3)
}
```

Мы можем писать прямо в `WS`. Сначала создается `Writer` (1). После получения `Writer` `WS` блокируется (2). Перед последующим вызовом `getWriter()` следует вызвать `releaseLock()` (3).

Существует 3 способа записи чанков.

#### 4.1.1. Подход 1: ожидание `write()` (неэффективная обработка противодавления)

Первый подход заключается в ожидании каждого результата `write()`:

```javascript
await writer.write("Чанк 1");
await writer.write("Чанк 2");
await writer.close();
```

Промис, возвращаемый `write()`, разрешается после успешной записи переданного чанка. Что означает "успешная запись", зависит от реализации `WS`, например, в случае с файлом, чанк может быть отправлен в операционную систему, но находиться в кеше, т.е. не быть фактически записанным на диск.

Промис, возвращаемый `close()`, разрешается после закрытия потока.

Недостаток данного подходя: ожидание успешной записи означает, что очередь не используется. Как следствие, снижается скорость передачи данных.

#### 4.1.2. Подход 2: игнорирование отклонения `write()` (игнорирование противодавления)

Второй подход предполагает игнорирование промисов, возвращаемых `write()`, и ожидание только промиса, возвращаемого `close()`:

```javascript
writer.write("Чанк 1").catch(() => {}); // (1)
writer.write("Чанк 2").catch(() => {}); // (2)
await writer.close(); // Cообщения об ошибках
```

Синхронный вызов `write()` помещает чанки во внутреннюю очередь `WS`. Мы не ждем записи чанков. Однако ожидание `close()` означает ожидание опустения очереди и успешной записи чанков.

Вызов `catch()` (1 и 2) необходим, поскольку позволяет избежать предупреждений о необработанных отклонениях промиса при возникновении проблем с записью. Мы может игнорировать сообщения об ошибках, возвращаемые `write()`, потому что `close()` возвращает такие же сообщения.

Можно даже реализовать вспомогательную функцию для игнорирования отклонений:

```javascript
ignoreRejections(
  writer.write("Чанк 1"),
  writer.write("Чанк 2"),
);
await writer.close(); // Сообщения об ошибках

function ignoreRejections(...promises) {
  for (const promise of promises) {
    promise.catch(() => {});
  }
}
```

Недостаток данного подхода: противодавление игнорируется. Мы просто исходим из предположения, что очередь является достаточно большой для размещения всех данных, которые записываются.

#### 4.1.3. Подход 3: ожидание `ready` (эффективная обработка противодавления)

Ожидание геттера `ready` позволяет эффективно обрабатывать противодавление:

```javascript
await writer.ready; // Сообщения об ошибках
// Сколько осталось свободного пространства?
console.log(writer.desiredSize);
writer.write("Чанк 1").catch(() => {});

await writer.ready; // Сообщения об ошибках
// Сколько осталось свободного пространства?
console.log(writer.desiredSize);
writer.write("Чанк 2").catch(() => {});

await writer.close(); // Сообщения об ошибках
```

Промис в `ready` разрешается при переходе потока от состояния наличия противодавления к состоянию его отсутствия.

#### 4.1.4. Пример: запись файла с помощью `Writer`

```javascript
import * as fs from "node:fs";
import { Writable } from "node:stream";

const nodeWritable = fs.createWriteStream(
  "data.txt",
  { encoding: "utf-8" }
); // (1)

const webWritableStream = Writable.toWeb(nodeWritable); // (2)

const writer = webWritableStream.getWriter();

try {
  await writer.write("Первая строка\n");
  await writer.write("Вторая строка\n");
  await writer.close();
} finally {
  writer.releaseLock()
}
```

Создаем поток `Node.js` для файла `data.txt` (1). Конвертируем этот поток в веб-поток (2). Используем `Writer` для записи в него строк.

### 4.2. Подключение к `WS`

Вместо использования `Writers`, в `WS` можно писать прямо из `RS`:

```javascript
await readableStream.pipeTo(writableStream);
```

Промис из `pipeTo()` разрешается при успешном подключении.

#### 4.2.1. Подключение происходит асинхронно

Подключение выполняется после завершения или приостановки текущей задачи. Это демонстрирует следующий код:

```javascript
const readableStream = new RS({ // (1)
  start(controller) {
    controller.enqueue("Первая строка\n");
    controller.enqueue("Вторая строка\n");
    controller.close();
  },
});

const writableStream = new WritableStream({ // (2)
  write(chunk) {
    console.log("ЗАПИСЬ " + JSON.stringify(chunk));
  },

  close() {
    console.log("ЗАКРЫТИЕ WS");
  },
});


console.log("До .pipeTo()");

const promise = readableStream.pipeTo(writableStream); // (3)

promise.then(() => console.log("Промис разрешен"));

console.log("После .pipeTo()");
/**
 * До .pipeTo()
 * После .pipeTo()
 * ЗАПИСЬ "Первая строка\n"
 * ЗАПИСЬ "Вторая строка\n"
 * ЗАКРЫТИЕ WS
 * Промис разрешен
*/
```

Создаем `RS` (1). Создаем `WS` (2).

Видим, что `pipeTo()` (3) выполняется незамедлительно. В новой задаче чанки читаются и записываются. Затем `WS` закрывается и `promise` разрешается.

#### 4.2.2. Пример: подключение к `WS` для файла

В следующем примере мы создаем `WS` для файла и подключаем к нему `RS`:

```javascript
const webReadableStream = new RS({ // (1)
  async start(controller) {
    controller.enqueue("Первая строка\n");
    controller.enqueue("Вторая строка\n");
    controller.close();
  },
});

const nodeWritable = fs.createWriteStream( // (2)
  "data.txt",
  { encoding: "utf-8" }
);

const webWritableStream = Writable.toWeb(nodeWritable); // (3)

await webReadableStream.pipeTo(webWritableStream); // (4)
```

Создаем `RS` (1). Создаем поток `Node.js` для файла `data.txt` (2). Конвертируем данный поток в веб-поток (3). Подключаем `webReadableStream` к `RS` для файла.

#### 4.2.3. Пример: запись двух `RS` в один `WS`

```javascript
const createReadableStream = (prefix) =>
  new ReadableStream({
    async start(controller) {
      controller.enqueue(prefix + "чанк 1");
      controller.enqueue(prefix + "чанк 2");
      controller.close();
    },
  });

const writableStream = new WritableStream({
  write(chunk) {
    console.log("ЗАПИСЬ " + JSON.stringify(chunk));
  },

  close() {
    console.log("ЗАКРЫТИЕ");
  },

  abort(err) {
    console.log("ПРЕРЫВАНИЕ " + err);
  },
});

await createReadableStream("Поток 1: ")
  .pipeTo(writableStream, { preventClose: true }); // (1)

await createReadableStream("Поток 2: ")
  .pipeTo(writableStream, { preventClose: true }); // (2)

await writableStream.close();
/**
 * ЗАПИСЬ "Поток 1: чанк 1"
 * ЗАПИСЬ "Поток 1: чанк 2"
 * ЗАПИСЬ "Поток 2: чанк 1"
 * ЗАПИСЬ "Поток 2: чанк 2"
 * ЗАКРЫТИЕ
*/
```

Мы указываем `pipeTo()` не закрывать `WS` после закрытия `RS` (1 и 2). Поэтому `WS` остается открытым, и к нему можно подключать другие `RS`.

## 5. Превращение приемников данных в `WS` с помощью упаковки

Для того, чтобы иметь возможность записывать данные во внешний приемник через `WS`, этот источник необходимо обернуть в объект-адаптер, который называется базовым приемником (underlying sink):

```javascript
new WritableStream(underlyingSink?, queuingStrategy?);
```

Базовые приемники имеют следующую сигнатуру:

```javascript
interface UnderlyingSink<TChunk> {
  start?(
    controller: WritableStreamDefaultController
  ): void | Promise<void>;

  write?(
    chunk: TChunk,
    controller: WritableStreamDefaultController
  ): void | Promise<void>;

  close?(): void | Promise<void>;

  abort?(reason?: any): void | Promise<void>;
}
```

Свойства:

- `start(controller)`: вызывается сразу после вызова конструктора `WS`. Для асинхронных операций можно возвращать промис. Данный метод позволяет подготовиться к записи;
- `write(chunk, controller)`: вызывается при готовности нового чанка к записи в приемник. Здесь можно отслеживать противодавление, возвращая промис, который разрешается при деактивации противодавления;
- `close()`: вызывается после вызова `writeStream.close()` и записи всех чанков из очереди. Данный метод позволяет выполнять очистку после записи;
- `abort(reason)`: вызывается в случае вызова `writeStream.abort()` или `writer.abort()`. `reason` - это значение, переданное этим методам.

Параметр `controller` методов `start` и `write` позволяет переводить `WS` в состояние ошибки. Он имеет следующую сигнатуру:

```javascript
interface WritableStreamDefaultController {
  readonly signal: AbortSignal;
  error(err?: any): void;
}
```

- `signal`: `AbortSignal`, позволяющий прерывать запись или закрывать операцию при закрытии потока;
- `error(err)`: закрывает `WS`, последующие взаимодействия с ним буду проваливаться со значением `err`.

### 5.1. Пример: трассировка `RS`

В следующем примере `RS` подключается к `WS` для отслеживания того, как `RS` производит чанки:

```javascript
const readableStream = new RS({
  start(controller) {
    controller.enqueue("Первый чанк");
    controller.enqueue("Второй чанк");
    controller.close();
  },
});

await readableStream.pipeTo(
  new WritableStream({
    write(chunk) {
      console.log("ЗАПИСЬ " + JSON.stringify(chunk));
    },

    close() {
      console.log("ЗАКРЫТИЕ");
    },

    abort(err) {
      console.log("ПРЕРЫВАНИЕ " + err);
    },
  })
);
/**
 * ЗАПИСЬ "Первый чанк"
 * ЗАПИСЬ "Второй чанк"
 * ЗАКРЫТИЕ
*/
```

### 5.2. Пример: формирование строки из записываемых чанков

В следующем примере мы создаем подкласс `WS`, который собирает все записываемые чанки в строку. Метод `getString` обеспечивает доступ к строке:

```javascript
class WritableStringStream extends WS {
  #string = "";

  constructor() {
    super({
      // Нам нужен доступ к `this` `WritableStringStream`,
      // поэтому мы используем стрелочную функцию
      write: (chunk) => {
        this.#string += chunk;
      },
    });
  }

  getString() {
    return this.#string;
  }
}

const stringStream = new WritableStringStream();

const writer = stringStream.getWriter();

try {
  await writer.write("Как");
  await writer.write(" твои ");
  await writer.write(" дела?");
  await writer.close();
} finally {
  writer.releaseLock()
}

assert.equal(
  stringStream.getString(),
  "Как твои дела?"
);
```

Недостатком данного подхода является смешение `API`: `WS API` и `API` нашего строкового потока. Альтернативой является делегирование ответственности `WS` вместо его расширения:

```javascript
function createWritableStringStream() {
  let string = "";

  return {
    stream: new WS({
      write(chunk) {
        string += chunk;
      },
    }),

    getString() {
      return string;
    },
  };
}

const stringStream = createWritableStringStream();

const writer = stringStream.stream.getWriter();

try {
  await writer.write("Как");
  await writer.write(" твои ");
  await writer.write(" дела?");
  await writer.close();
} finally {
  writer.releaseLock()
}

assert.equal(
  stringStream.getString(),
  "Как твои дела?"
);
```

Эта функциональность также может быть реализована с помощью класса (вместо фабричной функции для объектов).

## 6. Использование `TS`

`TS`:

- получает входные данные через сторону для записи (writable side), `WS`;
- может преобразовывать входные данные;
- позволяет читать результат через сторону для чтения (readable side), `RS`.

Основным способом применения `TS` является пропускание через них данных (pipe through) для преобразования:

```javascript
const transformedStream = readableStream.pipeThrough(transformStream);
```

`pipeThrough()` подключает `RS` к стороне для записи `TS` и возвращает его сторону для чтения. Другими словами, создается новый `RS`, который является преобразованной версией `RS`.

`pipeThrough()` принимает не только `TS`, но также любой объект, соответствующий такому контракту:

```javascript
interface ReadableWritablePair<RChunk, WChunk> {
  readable: RS<RChunk>;
  writable: WS<WChunk>;
}
```

### 6.1. Стандартные `TS`

`Node.js` поддерживает следующие стандартные `TS`:

- [Кодирование (стандарт WHATWG)](https://encoding.spec.whatwg.org/) - [TextEncoderStream](https://developer.mozilla.org/en-US/docs/Web/API/TextEncoderStream#browser_compatibility) и [TextDecoderStream](https://developer.mozilla.org/en-US/docs/Web/API/TextDecoderStream#browser_compatibility):
  - данные потоки поддерживают не только `UTF-8`, но и многие [устаревшие кодировки](https://encoding.spec.whatwg.org/#names-and-labels);
  - единичная кодовая точка (code point) Юникода кодируется в единицы кода `UFT-8`, размером до 4 байт. В байтовый потоках единицы кода могут разделяться на чанки. `TextDecoderStream` обеспечивает их правильную обработку;
  - доступны на большинстве `JS-платформ`;
- [Потоки для сжатия (групповой черновик сообщества W3C)](https://wicg.github.io/compression/) - [CompressionStream](https://developer.mozilla.org/en-US/docs/Web/API/CompressionStream) и [DecompressionStream](https://developer.mozilla.org/en-US/docs/Web/API/DecompressionStream):
  - [поддерживаемые форматы сжатия](https://wicg.github.io/compression/#supported-formats): `deflate`, `deflate-raw`, `gzip`;
  - доступны на многих `JS-платформах`.

#### 6.1.1. Пример: декодирование потока байтов в кодировке `UTF-8`

```javascript
const response = await fetch("https://example.com");
const readableByteStream = response.body;

const readableStream = readableByteStream
  .pipeThrough(new TextDecoderStream("utf-8"));

for await (const stringChunk of readableStream) {
  console.log(stringChunk);
}
```

`response.body` - это `ReadableByteStream` (доступный для чтения поток байтов), чанки которого являются экземплярами `Uint8Array`. Мы пропускаем этот поток через `TextDecoderStream` для получения потока, содержащего строковые чанки.

_Обратите внимание_: декодирование каждого байтового чанка по отдельности (например, с помощью `TextDecoder`) работать не будет, поскольку байты единицы кода могут находиться в разных чанках.

#### 6.1.2. Пример: создание доступного для чтения строкового потока для стандартного входа

Следующий модуль `Node.js` выводит в терминал все, что получает через стандартный вход:

```javascript
import { Readable } from "node:stream";

const webStream = Readable.toWeb(process.stdin)
  .pipeThrough(new TextDecoderStream("utf-8"));

for await (const chunk of webStream) {
  console.log(">>>", chunk);
}
```

Доступ к стандартному входу можно получить через поток, хранящийся в `process.stdin`. Без указания кодировки для потока и его преобразования с помощью `Readable.toWeb()` создается байтовый поток. Он пропускается через `TextDecoderStream` для получения текстового потока.

_Обратите внимание_: мы обрабатываем стандартный вход инкрементально - как только очередной чанк становится доступным, он выводится в терминал. Другими словами, нам не нужно ждать завершения ввода. Это может быть полезным при большом количестве данных или в случае, когда данные приходят с перерывами.

## 7. Реализация кастомных `TS`

Кастомный `TS` можно реализовать путем передачи объекта `Transformer` в конструктор `TS`. Данный объект имеет следующую сигнатуру:

```javascript
interface Transformer<TInChunk, TOutChunk> {
  start?(
    controller: TransformStreamDefaultController<TOutChunk>
  ): void | Promise<void>;

  transform?(
    chunk: TInChunk,
    controller: TransformStreamDefaultController<TOutChunk>
  ): void | Promise<void>;

  flush?(
    controller: TransformStreamDefaultController<TOutChunk>
  ): void | Promise<void>;
}
```

Свойства:

- `start(controller)`: вызывается сразу после вызова конструктора `TS`. Данный метод позволяет подготовиться к преобразованиям;
- `transform(chunk, controller)`: выполняет преобразования. Получает входной чанк и может использовать его параметр `controller` для помещения в очередь одного или нескольких преобразованных выходных чанков. Также может ничего не помещать в очередь;
- `flush(controller)`: вызывается после успешного преобразования всех чанков. Данный метод позволяет выполнять очистку.

Каждый из этих методов может возвращать промис, до разрешения которого выполнение кода приостанавливается. Это может быть полезным при выполнении асинхронных операций.

Параметр `controller` имеет следующую сигнатуру:

```javascript
interface TransformStreamDefaultController<TOutChunk> {
  enqueue(chunk?: TOutChunk): void;

  readonly desiredSize: number | null;

  terminate(): void;

  error(err?: any): void;
}
```

Свойства:

- `enqueue(chunk)`: помещает чанк в сторону для чтения (вывод) `TS`;
- `desiredSize`: возвращает желаемый размер внутренней очереди стороны для чтения (вывода) `TS`;
- `terminate()`: закрывает сторону для чтения (вывод) и переводит сторону для записи (вход) `TS` в состояние ошибки. Может использоваться в случае, когда преобразователь не заинтересован в оставшихся чанках стороны для записи (входа) и хочет их пропустить;
- `error(err)`: переводит `TS` в состояние ошибки, последующие взаимодействия с ним будут проваливаться со значением `err`.

Что насчет противодавления? Противодавление передается от стороны для чтения (выхода) к стороне для записи (вход). Обычно, преобразования не сильно влияют на количество данных. Поэтому по умолчанию преобразователи игнорируют противодавление. Тем не менее, оно может быть обнаружено через `transformStreamDefaultController.desiredSize` и передано посредством возврата промиса из `transformer.transform()`.

### 7.1. Пример: преобразование потока произвольных чанков в поток строк

Следующий подкласс `TS` преобразует поток произвольных чанков в поток, где каждый чанк занимает ровно одну строку. Каждый чанк, за исключением последнего, заканчивается символом `\n` в `Unix` и символами `\r\n` в `Windows`:

```javascript
class ChunksToLinesTransformer {
  #previous = "";

  transform(chunk, controller) {
    let startSearch = this.#previous.length;

    this.#previous += chunk;

    while (true) {
      // Работает для EOL === "\n" и EOL === "\r\n"
      const eolIndex = this.#previous.indexOf("\n", startSearch);

      if (eolIndex < 0) break;

      // Строка включает EOL
      const line = this.#previous.slice(0, eolIndex + 1);

      controller.enqueue(line);

      this.#previous = this.#previous.slice(eolIndex + 1);

      startSearch = 0;
    }
  }

  flush(controller) {
    // Выполняем очистку и помещаем в очередь оставшийся текст
    if (this.#previous.length > 0) {
      controller.enqueue(this.#previous);
    }
  }
}

class ChunksToLinesStream extends TS {
  constructor() {
    super(new ChunksToLinesTransformer());
  }
}

const stream = new RS({
  async start(controller) {
    controller.enqueue("несколько\nстрок\nтекста");
    controller.close();
  },
});

const transformStream = new ChunksToLinesStream();

const transformed = stream.pipeThrough(transformStream);

for await (const line of transformed) {
  console.log(">>>", JSON.stringify(line));
}
/**
 * >>> "несколько\n"
 * >>> "строк\n"
 * >>> "текста"
*/
```

_Обратите внимание_: `Deno` имеет встроенный [TextLineStream](https://doc.deno.land/https://deno.land/std@0.141.0/streams/mod.ts/~/TextLineStream) со схожим функционалом.

### 7.2. Асинхронные генераторы также отлично подходят для преобразования потока

Поскольку `RS` являются асинхронно перебираемыми, мы можем использовать асинхронные генераторы для их преобразования. Это делает код очень элегантным:

```javascript
const stream = new RS({
  async start(controller) {
    controller.enqueue("раз");
    controller.enqueue("два");
    controller.enqueue("три");
    controller.close();
  },
});

async function* prefixChunks(prefix, asyncIterable) {
  for await (const chunk of asyncIterable) {
    yield "> " + chunk;
  }
}

const transformedAsyncIterable = prefixChunks("> ", stream);

for await (const transformedChunk of transformedAsyncIterable) {
  console.log(transformedChunk);
}
/**
 * > раз
 * > два
 * > три
*/
```

## 8. Детали противодавления

Рассмотрим такой конвейер:

```javascript
rs.pipeThrough(ts).pipeTo(ws);
```

Подключения, создаваемые этим выражением (`pipeThrough()` использует `pipeTo()` для подключения `rs` к стороне для записи `ts`):

```javascript
rs -pipeTo-> ts{writable,readable} -pipeTo-> ws
```

Наблюдения:

- базовый источник `rs` может быть представлен как элемент цепочки, предшествующий `rs`;
- базовый приемник `ws` может быть представлен как элемент цепочки, следующий за `ws`;
- каждый поток имеет внутренний буфер: буферы `RS` следуют за базовыми источниками, буферы `WS` находятся перед базовыми приемниками.

Предположим, что базовый приемник `ws` является медленным, что привело к заполнению буфера `ws`. В этом случае происходит следующее:

- `ws` сигнализирует о заполненности;
- `pipeTo` прекращает чтение данных из `ts.readable`;
- `ts.readable` сигнализирует о заполненности;
- `ts` прекращает передачу чанков из `ts.writable` в `ts.readable`;
- `ts.writable` сигнализирует о заполненности;
- `pipeTo` прекращает читать данные из `rs`;
- `rs` сообщает о заполненности базовому источнику;
- базовый источник приостанавливается.

Этот пример показывает, что нам требуется 2 вида функционала:

- сущности, получающие данные, должны иметь возможность посылать сигнал противодавления;
- сущности, отправляющие данные, должны реагировать на сигналы противодавления.

Посмотрим, как данный функционал реализуется в веб-потоках.

### 8.1. Сигнализация противодавления

Сигнал о противодавлении посылается сущностями, которые получают данные. Веб-потоки имеют 2 таких сущности:

- `WS` получает данные через метод `write` объекта `Writer`;
- `RS` получает данные при вызове метода `enqueue` объекта `ReadableStreamDefaultController` базового источника.

В обоих случаях входные данные буферизуются с помощью очередей. Сигнал о противодавлении возникает при заполнении очереди. Как его можно обнаружить?

Вот где находятся очереди:

- очередь `WS` хранится внутри `WritableStreamDefaultController`;
- очередь `RS` хранится внутри `ReadableStreamDefaultController`.

Желаемый размер (desired size) - это число, означающее количество свободного места (пространства, комнаты) (room) в очереди:

- если свободное место имеется, число положительное;
- если места нет, число равно `0`;
- если очередь переполнена, число отрицательное.

Поэтому противодавление применяется, когда желаемый размер `<= 0`. Размер доступен через геттер `desiredSize` объекта, содержащего очередь.

Как вычисляется желаемый размер? Через объект, определяющий так называемую стратегию помещения в очередь (queuing strategy). `RS` и `WS` имеют дефолтные стратегии помещения в очередь, которые могут быть перезаписаны через опциональный параметр их конструкторов. Интерфейс [QueuingStrategy](https://streams.spec.whatwg.org/#dictdef-queuingstrategy) содержит 2 свойства:

- метод `size(chunk)` возвращает размер `chunk`;
  - текущий размер очереди - это сумма размеров содержащихся в ней чанков;
- свойство `highWaterMark` (верхняя отметка) определяет максимальный размер очереди.

_Желаемый размер очереди - это верхняя отметка минус текущий размер очереди_:

```javascript
desiredSize = highWaterMark - [chunks].reduce((x, y) => x + y, 0);
```

### 8.2. Обработка противодавления

Сущности, отправляющие данные, должны реагировать на противодавление.

#### 8.2.1. Код, записывающий данные в `WS` через `Writer`

- Мы можем ждать разрешения промиса в `writer.ready`. В это время мы заблокированы, и достигается противодавление. Промис разрешается при появлении свободного места в очереди. Разрешение запускается, когда значение `writer.desiredSize` становится пложительным;
- в качестве альтернативы, можно ждать разрешения промиса, возвращаемого `writer.write()`. В это время очередь не заполняется.

Также имеется возможность указывать размер чанков в `writer.desiredSize`.

#### 8.2.2. Базовый источник `RS`

Объект базового источника, который передается `RS`, оборачивает внешний источник. Он является звеном цепочки, располагающимся перед `RS`.

- Базовые pull-источники запрашивают новые данные при появлении комнаты в очереди. При отсутствии комнаты противодавление выполняется автоматически, поскольку данные не запрашиваются;
- базовые push-источники должны проверять `controller.desiredSize` после помещения чего-либо в очередь: если желаемый размер `<=0`, они должны выполнять противодавление путем приостановки их внешних источников.

#### 8.2.3. Базовый приемник `WS`

Объект базового приемника, передаваемый в `WS`, оборачивает внешний приемник. Он является звеном цепочки, располагающимся после `WS`.

Каждый внешний источник сообщает о противодавлении по-разному (в некоторых случаях этого вообще не происходит). Базовый источник может оказывать противодавление путем возврата промиса из метода `write`, который разрешается после завершения записи. В стандарте веб-потоков имеется [пример того, как это работает](https://streams.spec.whatwg.org/#example-ws-backpressure).

#### 8.2.4. `TS` (writable-readable)

`TS` подключает сторону для записи к стороне для чтения путем реализации базового приемника для первой и базового источника для второй. Он имеет внутренний слот `[[backpressure]]`, который является индикатором активности противодавления.

- Метод `write` базового приемника стороны для записи асинхронно ожидает завершения внутреннего противодавления перед передачей очередного чанка преобразователю `TS` ([TransformStreamDefaultSinkWriteAlgorithm](https://streams.spec.whatwg.org/#transform-stream-default-sink-write-algorithm)). Преобразователь может использовать очередь через `TransformStreamDefaultController`. _Обратите внимание_: `write()` возвращает промис, который разрешается после выполнения метода. До разрешения этого промиса `WS` буферизует входящие запросы на запись с помощью очереди. Поэтому противодавление стороны для записи реализуется через очередь и ее желаемый размер;
- противодавление `TS` активируется, если чанк помещается в очередь с помощью `TransformStreamDefaultController` и очередь стороны для чтения становится полной ((TransformStreamDefaultControllerEnqueue)[https://streams.spec.whatwg.org/#transform-stream-default-controller-enqueue]);
- противодавление `TS` может быть деактивировано, если что-либо читается из `Reader` ((ReadableStreamDefaultReaderRead)[https://streams.spec.whatwg.org/#readable-stream-default-reader-read]);
  - если в очереди имеются комнаты, возможно, пришло время вызвать `pull()` ((`[[PullSteps]]`)[https://streams.spec.whatwg.org/#rs-default-controller-private-pull]);
  - `pull()` базового источника стороны для чтения деактивирует противодавление ((TransformStreamDefaultSourcePullAlgorithm)[https://streams.spec.whatwg.org/#transform-stream-default-source-pull]).

#### 8.2.5. `pipeTo()` (RS -> WS)

`pipeTo()` читает чанки из `RS` через `Reader` и записывает их в `WS` через `Writer`. Он приостанавливается, когда `writer.desiredSize <= 0` (шаг 15 (ReadableStreamPipeTo)[https://streams.spec.whatwg.org/#readable-stream-pipe-to]).

## 9. Потоки байтов

До сих пор мы говорили о текстовых потоках, потоках, чанки которых представляют собой строки. Но `Web streams API` также поддерживает потоки байтов для двоичных данных, где чанки являются `Uint8Arrays` (типизированными массивами):

- `RS` имеют специальный режим (mode) `bytes`;
- для `WS` неважно, чем являются чанки, строками или `Uint8Arrays`. Следовательно, каким потоком является экземпляр `WS` зависит от того, что способен обрабатывать базовый приемник;
- какой вид чанков способен обрабатывать `TS` также зависит от его `Transformer`.

Посмотрим, как создать доступный для чтения поток байтов.

### 9.1. Доступный для чтения поток байтов

Тип создаваемого конструктором `RS` потока зависит от опционального свойства `type` его опционального первого параметра `underlyingSource`:

- если `type` не указан или `underlyingSource` не передан, создается текстовый поток;
- если `type` имеет значение `"bytes"` (строка), новый экземпляр будет представлять собой поток байтов:

```javascript
const readableByteStream = new RS({
  type: "bytes",
  async start() {}
  // ...
});
```

На что влияет режим `bytes`?

В дефолтном режиме базовый источник может возвращать любой вид чанков. В "байтовом" режиме чанки должны быть `ArrayBufferViews`, т.е. `TypedArrays` (такими как `Uint8Arrays`) или `DataViews`.

Доступный для чтения поток байтов может создавать 2 вида `Reader`:

- `getReader()` возвращает экземпляр `ReadableStreamDefaultReader`;
- `getReader({ mode: "byob" })` возвращает экземпляр `ReadableStreamBYOBReader`.

`BYOB` расшифровывается как `Bring Your Own Buffer` (предоставьте собственный буфер) и означает, что мы может передать буфер (`ArrayBufferView`) в `reader.read()`. После этого данный `ArrayBufferView` отключается и больше не используется. Однако `read()` возвращает данные в виде нового `ArrayBufferView`, который имеет тот же тип и обращается к той же области того же самого `ArrayBuffer`.

Кроме того, доступные для чтения потоки байтов имеют разные контроллеры: они являются экземплярами `ReadableByteStreamController` (а не `ReadableStreamDefaultController`). Помимо принуждения (forcing) базовых источников помещать в очередь `ArrayBufferViews` (`TypedArrays` или `DataViews`), они поддерживают `ReadableStreamBYOBReaders` через свойство [byobRequest](https://streams.spec.whatwg.org/#rbs-controller-prototype). В стандарте веб-потоков приведено [2 примера использования `byobRequest`](https://streams.spec.whatwg.org/#creating-examples).

### 9.2. Пример: бесконечный доступный для чтения поток байтов, заполняемый произвольными данными

В следующем примере создается бесконечный доступный для чтения поток байтов, заполняющий чанки произвольными данными:

```javascript
import { promisify } from "node:util";
import { randomFill } from "node:crypto";

const asyncRandomFill = promisify(randomFill);

const readableByteStream = new RS({
  type: "bytes",

  async pull(controller) {
    const byobRequest = controller.byobRequest;

    await asyncRandomFill(byobRequest.view);

    byobRequest.respond(byobRequest.view.byteLength);
  },
});

const reader = readableByteStream.getReader({ mode: "byob" });

const buffer = new Uint8Array(10); // (1)

const firstChunk = await reader.read(buffer); // (2)
console.log(firstChunk);
```

Поскольку `readableByteStream` является бесконечным, мы не можем перебрать его в цикле. Поэтому читается только его первый чанк (2).

Созданный буфер (1) передается в `reader.read()` (2) и после этого становится недоступным для чтения.

### 9.3. Пример: сжатие доступного для чтения потока байтов

В следующем примере создается доступный для чтения поток байтов, который пропускается через поток, сжимающий данные в формат `GZIP`:

```javascript
const readableByteStream = new RS({
  type: "bytes",

  start(controller) {
    // 256 нулей
    controller.enqueue(new Uint8Array(256));
    controller.close();
  },
});

const transformedStream = readableByteStream.pipeThrough(
  new CompressionStream("gzip"));

await logChunks(transformedStream);

async function logChunks(readableByteStream) {
  const reader = transformedStream.getReader();

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      console.log(value);
    }
  } finally {
    reader.releaseLock();
  }
}
```

### 9.4. Пример: чтение веб-страницы с помощью `fetch()`

Результат `fetch()` разрешается объектом ответа, свойство `body` которого представляет собой доступный для чтения поток байтов. Данный поток преобразуется в текстовый поток с помощью `TextDecoderStream`:

```javascript
const response = await fetch("https://example.com");
const readableByteStream = response.body;

const readableStream = readableByteStream.pipeThrough(
  new TextDecoderStream("utf-8"));

for await (const stringChunk of readableStream) {
  console.log(stringChunk);
}
```

## 10. Специфичные для `Node.js` вспомогательные функции

`Node.js` - единственная на сегодняшний день платформа, поддерживающая следующие вспомогательные функции, именуемые [utility consumers](https://nodejs.org/api/webstreams.html#utility-consumers) (утилитами потребления?):

```javascript
import {
  arrayBuffer,
  blob,
  buffer,
  json,
  text,
} from "node:stream/consumers";
```

Эти функции преобразуют веб `RS`, `Readables` `Node.js` и `AsyncIterators` в промисы, которые разрешаются:

- `ArrayBuffers` - `arrayBuffer()`;
- `Blobs` - `blob()`;
- буферами `Node.js` - `buffer()`;
- объектами `JSON` - `json()`;
- строками - `text()`.

Предполагается, что бинарные данные имеют кодировку `UTF-8`:

```javascript
import * as streamConsumers from "node:stream/consumers";

const readableByteStream = new RS({
  type: "bytes",

  start(controller) {
    // TextEncoder преобразует строки в  Uint8Arrays в кодировке UTF-8
    const encoder = new TextEncoder();

    const view = encoder.encode(`"😀"`);

    assert.deepEqual(
      view,
      Uint8Array.of(34, 240, 159, 152, 128, 34)
    );

    controller.enqueue(view);

    controller.close();
  },
});

const jsonData = await streamConsumers.json(readableByteStream);

assert.equal(jsonData, "😀");
```

Строковые потоки работают, как ожидается:

```javascript
import * as streamConsumers from "node:stream/consumers";

const readableByteStream = new RS({
  start(controller) {
    controller.enqueue(`"😀"`);

    controller.close();
  },
});

const jsonData = await streamConsumers.json(readableByteStream);

assert.equal(jsonData, "😀");
```

Мы рассмотрели далеко не все аспекты `API` веб-потоков. Вот несколько [ссылок для дальнейшего изучения этого интерфейса](https://2ality.com/2022/06/web-streams-nodejs.html#further-reading).