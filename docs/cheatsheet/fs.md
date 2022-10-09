---
sidebar_position: 32
title: Шпаргалка по модулю FS
description: Шпаргалка по модулю FS
keywords: ['node.js', 'nodejs', 'node', 'file system', 'fs', 'файловая система', 'работа с файловой системой']
tags: ['node.js', 'nodejs', 'node', 'file system', 'fs', 'файловая система', 'работа с файловой системой']
---

# File System

[Источник](https://2ality.com/2022/06/nodejs-file-system.html).

## 1. Концепции, паттерны и соглашения, используемые в ФС

В данном разделе предполагаются следующие импорты:

```javascript
import * as fs from "node:fs";
import * as fsPromises from "node:fs/promises";
```

## 1.2. Стиль функций

ФС предоставляет 3 стиля функций:

- синхронный стиль с обычными функциями:
  - `fs.readFileSync(path, options?): string | Buffer`;
- 2 асинхронных стиля:
  - с функциями обратного вызова:
    - `fs.readFile(path, options?, callback): void`;
  - с функциями, возвращающими промисы:
    - `fsPromises.readFile(path, options?): Promise<string | Buffer>`.

### 1.1.1. Синхронные функции

Синхронные функции являются самыми простыми - они сразу возвращают значения и выбрасывают ошибки в виде исключений:

```javascript
import * as fs from "node:fs";

try {
  const result = fs.readFileSync("/etc/passwd", { encoding: "utf-8" });

  console.log(result);
} catch (err) {
  console.error(err);
}
```

В статье, в основном, используется данный стиль.

### 1.1.2. Функции, основанные на промисах

Такие функции возвращают промисы, которые разрешаются результатами и отклоняются с ошибками:

```javascript
import * as fsPromises from "node:fs/promises";

try {
  const result = await fsPromises.readFile(
    "/etc/passwd", { encoding: "utf-8" });

  console.log(result);
} catch (err) {
  console.error(err);
}
```

_Обратите внимание_: промисифицированный (promisified) ФС импортируется из другого модуля.

#### 1.1.3. Функции, основанные на колбэках

Такие функции передают результат и ошибки колбэку, передаваемому им в качестве последнего аргумента:

```javascript
import * as fs from "node:fs";

fs.readFile("/etc/passwd", { encoding: "utf-8" },
  (err, result) => {
    if (err) {
      console.error(err);
      return;
    }

    console.log(result);
  }
);
```

Данный стиль в статье не используется (он считается устаревшим).

### 1.2. Доступ к файлам

- все содержимое файла можно читать и записывать в виде строки;
- потоки для чтения и записи позволяют обрабатывать файлы небольшими частями (чанками/chunks), по одной за раз. Потоки разрешают только последовательный доступ;
- для последовательного и произвольного доступа могут использоваться файловые дескрипторы или `FileHandles`, отдаленно напоминающие потоки:
  - [файловые дескрипторы](https://nodejs.org/api/fs.html#file-descriptors_1) - это целые числа, представляющие файлы. Они управляются с помощью следующих функций (у каждой синхронной версии имеется колбэк-эквивалент - `fs.open()` и т.п.):
    - `fs.openSync(path, flags?, mode?)`: открывает новый дескриптор файла по указанному пути и возвращает его;
    - `fs.closeSync(fd)`: закрывает дескриптор;
    - `fs.fchmodSync(fd, mode)`;
    - `fs.fchownSync(fd, uid, gid)`;
    - `fs.fdatasyncSync(fd)`;
    - `fs.fstatSync(fd, options?)`;
    - `fs.fsyncSync(fd)`;
    - `fs.ftruncateSync(fd, len?)`;
    - `fs.futimesSync(fd, atime, mtime)`;
  - файловые дескрипторы могут использоваться синхронным и колбэк-ФС. Промис-ФС предоставляет абстракцию - класс [FileHandle](https://nodejs.org/api/fs.html#class-filehandle), основанный на дескрипторах. Экземпляры создаются с помощью `fsPromises.open()`. Операции выполняются с помощью таких методов (не функций), как:
  - `fileHandle.close()`;
  - `fileHandle.chmod(mode)`;
  - `fileHandle.chown(uid, gid)`;
  - и др.

`FileHandles` в этой статье не рассматриваются.

### 1.3. Префиксы названий функций

#### 1.3.1. Префикс "l": символические ссылки

Функции, названия которых начинаются с буквы `l`, как правило, оперируют символическими ссылками:

- `fs.lchmodSync()`, `fs.lchmod()`, `fsPromises.lchmod()`;
- `fs.lchownSync()`, `fs.lchown()`, `fsPromises.lchown()`;
- `fs.lutimesSync()`, `fs.lutimes()`, `fsPromises.lutimes()`;
- и др.

#### 1.3.2. Префикс "f": дескрипторы файлов

Функции, названия которых начинаются с буквы `f`, как правило, управляют файловыми дескрипторами:

- `fs.fchmodSync()`, `fs.fchmod()`;
- `fs.fchownSync()`, `fs.fchown()`;
- `fs.fstatSync()`, `fs.fstat()`;
- и др.

### 1.4. Важные классы

#### 1.4.1. `URL`: альтернатива строковым путям к файловой системе

Функции, принимающие строковые пути (1), как правило, также принимают экземпляры [URL](https://nodejs.org/api/url.html) (2):

```javascript
import * as fs from "node:fs";

assert.equal(
  fs.readFileSync(
    "/tmp/data.txt", { encoding: "utf-8" }), // (1)
  "Текст"
);

assert.equal(
  fs.readFileSync(
    new URL("file:///tmp/data.txt"), { encoding: "utf-8" }), // (2)
  "Текст"
);
```

Ручное преобразование путей в `file:` кажется простым, но необходимо учитывать большое количество нюансов: процентное кодирование и декодирование, управляющие символы, буквы дисков `Windows` и т.д. Поэтому лучше применять следующие функции:

- [url.pathToFileURL](https://nodejs.org/api/url.html#urlpathtofileurlpath);
- [url.fileURLToPath](https://nodejs.org/api/url.html#urlfileurltopathurl).

`URL` будет рассмотрен в одной из следующих статей.

#### 1.4.2. Буферы

Класс [Buffer](https://nodejs.org/api/buffer.html) представляет последовательность байтов фиксированного размера. Он является подклассом [Uint8Array](https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) ([TypedArray](https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) - типизированного массива). Буферы используются, в основном, для работы с файлами, содержащими бинарные данные.

Функции, принимающие `Buffer`, также принимают `Uint8Array`. Поскольку `Uint8Arrays` являются кроссплатформенными, а `Buffers` нет, предпочтение следует отдавать первым.

Преимущество буферов состоит в возможности кодирования и декодирования текста в разные кодировки. Для кодирования или декодирования `UTF-8` в `Uint8Array` можно использовать [TextEncoder](https://developer.mozilla.org/en-US/docs/Web/API/TextEncoder) или [TextDecoder](https://developer.mozilla.org/en-US/docs/Web/API/TextDecoder). Эти классы доступны на большинстве `JavaScript-платформ`:

```javascript
> new TextEncoder().encode("café")
Uint8Array.of(99, 97, 102, 195, 169)

> new TextDecoder().decode(Uint8Array.of(99, 97, 102, 195, 169))
"café"
```

#### 1.4.3. Потоки

Некоторые функции принимают или возвращают нативные потоки данных (native streams):

- `stream.Readable`: класс для создания потоков для чтения. Модуль `node:fs` использует `fs.ReadStream`, который является подклассом `stream.Readable`;
- `stream.Writable`: класс для создания потоков для записи. Модуль `node:fs` использует `fs.WriteStream`, который является подклассом `stream.Writable`.

Вместо нативных потоков можно использовать кроссплатформенные веб-потоки (web streams), о которых рассказывалось в [одной из предыдущих статей](https://habr.com/ru/company/timeweb/blog/676210/).

## 2. Чтение и запись файлов

### 2.1. Синхронное чтение файла в строку (опционально: разбиение по строкам)

[fs.readFileSync(path, options?)](https://nodejs.org/api/fs.html#fsreadfilesyncpath-options) читает файл по указанному пути в строку (результат чтения файла возвращается в виде единой строки):

```javascript
import * as fs from "node:fs";

assert.equal(
  fs.readFileSync("data.txt", { encoding: "utf-8" }),
  "несколько\r\nстрок\nтекста"
);
```

Плюсы и минусы данного подхода (по сравнению с использованием потока):

- `+`: файл читается синхронно, делается это легко. Подходит для многих случаев;
- `-`: плохой выбор для больших файлов - обработке файла предшествует чтение всего содержимого файла.

#### 2.1.1. Разбиение текста без включения разделителей строк

Следующий код разбивает текст построчно и удаляет разделители строк (line terminators):

```javascript
const RE_EOL = /\r?\n/;

const splitLines = (str) => str.split(RE_EOL);

assert.deepEqual(
  splitLines("несколько\r\nстрок\nтекста"),
  ["несколько", "строк", "текста"]
);
```

"EOL" расшифровывается как "end of line" (конец строки).

#### 2.1.2. Разбиение текста с включением разделителей строк

```javascript
const RE_EOL = /(?<=\r?\n)/; // (1)

const splitLinesWithEols = (str) => str.split(RE_EOL);

assert.deepEqual(
  splitLinesWithEols("несколько\r\nстрок\nтекста"),
  ["несколько\r\n", "строк\n", "текста"]
);
assert.deepEqual(
  splitLinesWithEols("первый\n\nтретий"),
  ["первый\n", "\n", "третий"]
);
assert.deepEqual(
  splitLinesWithEols("EOL в конце\n"),
  ["EOL в конце\n"]
);
assert.deepEqual(
  splitLinesWithEols(""),
  [""]
);
```

На строке 1 у нас имеется регулярное выражение с [ретроспективной проверкой](https://learn.javascript.ru/regexp-lookahead-lookbehind#retrospektivnaya-proverka) (lookbehind assertion). Оно сопоставляется с тем, что предшествует `\r?\n`, но ничего не захватывает. Поэтому разделители сохраняются.

На платформах, не поддерживающих ретроспективные проверки, можно использовать такую функцию:

```javascript
function splitLinesWithEols(str) {
  if (str.length === 0) return [""];

  const lines = [];

  let prevEnd = 0;

  while (prevEnd < str.length) {
    // Поиск "\n" также означает поиск "\r\n"
    const newlineIndex = str.indexOf("\n", prevEnd);

    // Перевод на новую строку включается в строку
    const end = newlineIndex < 0 ? str.length : newlineIndex + 1;

    lines.push(str.slice(prevEnd, end));

    prevEnd = end;
  }

  return lines;
}
```

### 2.2. Построчное чтение файла с помощью потока

```javascript
import * as fs from "node:fs";
import { Readable } from "node:stream";

const nodeReadable = fs.createReadStream(
  "text-file.txt",
  { encoding: "utf-8" }
);

const webReadableStream = Readable.toWeb(nodeReadable);

const lineStream = webReadableStream.pipeThrough(new ChunksToLinesStream());

for await (const line of lineStream) {
  console.log(line);
}
/**
 * несколько\r\n
 * строк\n
 * текста
*/
```

Вот, что здесь используется:

- [fs.createReadStream(path, options?)](https://nodejs.org/api/fs.html#fscreatereadstreampath-options): создает поток (экземпляр `stream.Readable`);
- [stream.Readable.toWeb(nodeReadable)](https://nodejs.org/api/stream.html#streamreadabletowebstreamreadable): преобразует доступный для чтения поток `Node.js` в веб-поток (экземпляр `ReadableStream`);
- класс [ChunksToLinesStream](https://2ality.com/2022/06/web-streams-nodejs.html#example%3A-transforming-a-stream-of-arbitrary-chunks-to-a-stream-of-lines) представляет поток для преобразования. Чанки - это небольшие части данных,  производимые потоками. Если у нас есть поток, чанки которого представляют строки произвольной длины, и мы пропускает эти чанки через `ChunksToLinesStream`, то получаем поток с построчными чанками.

Веб-потоки являются [асинхронно итерируемыми](https://exploringjs.com/impatient-js/ch_async-iteration.html), что позволяет использовать цикл `for-await-of` для их перебора.

Плюсы и минусы данного подхода (по сравнению с чтением в строку):

- `+`: хорошо подходит для больших файлов - данные могут обрабатываться инкрементально, не нужно ждать завершения чтения всего содержимого файла;
- `-`: данные читаются асинхронно, код сложнее и его больше.

### 2.3. Синхронная запись строки в файл

[fs.writeFileSync(path, str, options?)](https://nodejs.org/api/fs.html#fswritefilesyncfile-data-options) записывает строку в файл по указанному пути. Существующий файл перезаписывается:

```javascript
import * as fs from "node:fs";

fs.writeFileSync(
  "data.txt",
  "Первая строка\nВторая строка\n",
  { encoding: "utf-8" }
);
```

Плюсы и минусы (по сравнению с потоком):

- `+`: файл записывается синхронно, делается это легко. Подходит для многих случаев;
- `-`: плохой выбор для больших файлов.

### 2.4. Синхронное добавление строки в файл

```javascript
import * as fs from "node:fs";

fs.writeFileSync(
  "data.txt",
  "Новая строка\n",
  { encoding: "utf-8", flag: "a" }
);
```

Настройка `flag` со значением `a` означает, что мы добавляем данные. [Другие возможные значения этой настройки](https://nodejs.org/api/fs.html#fswritefilesyncfile-data-options).

_Обратите внимание_: в одних функциях настройка называется `flag`, в других - `flags`.

### 2.5. Запись нескольких строк в файл с помощью потока

```javascript
import * as fs from "node:fs";
import { Writable } from "node:stream";

const nodeWritable = fs.createWriteStream(
  "data.txt",
  { encoding: "utf-8" }
);

const webWritableStream = Writable.toWeb(nodeWritable);

const writer = webWritableStream.getWriter();

try {
  await writer.write("Первая строка\n");
  await writer.write("Вторая строка\n");
  await writer.close();
} finally {
  writer.releaseLock()
}
```

Вот, что здесь используется:

- [fs.createWriteStream(path, options?)](https://nodejs.org/api/fs.html#fscreatewritestreampath-options): создает поток для записи (экземпляр `stream.Writable`);
- [stream.Writable.toWeb(streamWritable)](https://nodejs.org/api/stream.html#streamwritabletowebstreamwritable): преобразует доступный для записи поток `Node.js` в веб-поток.

Плюсы и минусы:

- `+`: хорошо подходит для больших файлов;
- `-`: запись выполняется асинхронно, код сложнее и его больше.

### 2.6. Добавление нескольких строк в файл с помощью потока

```javascript
import * as fs from "node:fs";
import { Writable } from "node:stream";

const nodeWritable = fs.createWriteStream(
  "data.txt",
  // !
  { encoding: "utf-8", flags: "a" }
);

const webWritableStream = Writable.toWeb(nodeWritable);

const writer = webWritableStream.getWriter();

try {
  await writer.write("Первая добавленная строка\n");
  await writer.write("Вторая добавленная строка\n");
  await writer.close();
} finally {
  writer.releaseLock()
}
```

## 3. Кроссплатформенная обработка разделителей строк

На разных платформах используются разные разделители строк, отмечающие конец строки:

- на `Windows` - это `\r\n`;
- на `Unix` - `\n`.

Для кроссплатформенной обработки EOL можно использовать несколько стратегий.

### 3.1. Чтение разделителей строк

При обработке строк с `EOL` иногда бывает полезным их удалять:

```javascript
const RE_EOL_REMOVE = /\r?\n$/;

function removeEol(line) {
  const match = RE_EOL_REMOVE.exec(line);

  if (!match) return line;

  return line.slice(0, match.index);
}

assert.equal(
  removeEol("Windows EOL\r\n"),
  "Windows EOL"
);
assert.equal(
  removeEol("Unix EOL\n"),
  "Unix EOL"
);
assert.equal(
  removeEol("Без EOL"),
  "Без EOL"
);
```

### 3.2. Запись разделителей строк

Для записи разделителей строк в нашем распоряжении имеется 2 варианта:

- [константа `EOL` из модуля `node:os`](https://nodejs.org/api/os.html#oseol) содержит `EOL` текущей платформы;
- можно регистрировать формат `EOL` входного файла и использовать этот формат при дальнейшей модификации данного файла.

## 4. Обход и создание директорий

### 4.1. Обход директории

Следующая функция обходит (traverse) директорию и возвращает список всех ее потомков (ее дочерних элементов, потомков дочерних элементов и т.д.):

```javascript
import * as path from "node:path";
import * as fs from "node:fs";

function* traverseDir(dirPath) {
  const dirEntries = fs.readdirSync(dirPath, {withFileTypes: true});

  // Сортируем сущности для обеспечения большей предсказуемости
  dirEntries.sort(
    (a, b) => a.name.localeCompare(b.name, "en")
  );

  for (const dirEntry of dirEntries) {
    const fileName = dirEntry.name;
    const pathName = path.join(dirPath, fileName);
    yield pathName;

    if (dirEntry.isDirectory()) {
      yield* traverseDir(pathName);
    }
  }
}
```

Здесь:

- `fs.readdirSync(path, options?)` возвращает потомков директории по указанному пути:
  - если настройка `withFileTypes` имеет значение `true`, функция возвращает записи каталога (directory entries), экземпляры [fs.Dirent](https://nodejs.org/api/fs.html#class-fsdirent). Записи каталога содержат такие свойства, как:
    - `dirent.name`;
    - `dirent.isDirectory()`;
    - `dirent.isFile()`;
    - `dirent.isSymbolicLink()`;
  - если настройка `withFileTypes` имеет значение `true` или не указана, функция возвращает список названий файлов.

Пример использования функции `traverseDir`:

```javascript
for (const filePath of traverseDir("dir")) {
  console.log(filePath);
}
/**
 * dir/dir-file.txt
 * dir/subdir
 * dir/subdir/subdir-file1.txt
 * dir/subdir/subdir-file2.csv
*/
```

### 4.2. Создание директории (`mkdir`, `mkdir -p`)

Для создания директорий можно использовать функцию [fs.mkdirSync(path, options?)](https://nodejs.org/api/fs.html#fsmkdirsyncpath-options).

`options.recursive` определяет, как создается директория по указанному пути:

- если `recursive` имеет значение `false` или отсутствует, `mkdirSync()` возвращает `undefined`. Если директория (или файл) уже существует или отсутствует родительская директория, выбрасывается исключение;
- если `recursive` имеет значение `true`, `mkdirSync()` возвращает путь первой созданной директории. Если директория (или файл) уже существует, ничего не происходит. Если отсутствует родительская директория, она создается.

Пример использования `mkdirSync()`:

```javascript
import * as fs from "node:fs";

assert.deepEqual(
  Array.from(traverseDir(".")),
  [
    "dir",
  ]
);

fs.mkdirSync("dir/sub/subsub", { recursive: true });

assert.deepEqual(
  Array.from(traverseDir(".")),
  [
    "dir",
    "dir/sub",
    "dir/sub/subsub",
  ]
);
```

### 4.3. Определение наличия директории

При создании вложенных директорий и файлов мы не всегда может быть уверены в существовании родительской директории. Следующая функция может в этом помочь:

```javascript
import * as path from "node:path";
import * as fs from "node:fs";

function ensureParentDirectory(filePath) {
  const parentDir = path.dirname(filePath);

  if (!fs.existsSync(parentDir)) {
    fs.mkdirSync(parentDir, { recursive: true });
  }
}
```

Пример использования:

```javascript
assert.deepEqual(
  Array.from(traverseDir(".")),
  [
    "dir",
  ]
);

const filePath = "dir/sub/subsub/new-file.txt";

ensureParentDirectory(filePath);

fs.writeFileSync(filePath, "content", { encoding: "utf-8" });

assert.deepEqual(
  Array.from(traverseDir(".")),
  [
    "dir",
    "dir/sub",
    "dir/sub/subsub",
    "dir/sub/subsub/new-file.txt",
  ]
);
```

### 4.4. Создание временной директории

[fs.mkdtemp(pathPrefix, options?)](https://nodejs.org/api/fs.html#fsmkdtempsyncprefix-options) создает временную директорию: она добавляет 6 произвольных символов к `pathPrefix`, создает директорию и возвращает путь.

_Обратите внимание_: `pathPrefix` не должен оканчиваться на заглавную `X`, поскольку некоторые платформы заменяют `X` произвольными символами.

Для создания временной директории внутри специфичной для операционной системы глобальной временной директории можно использовать функцию [os.tmpdir](https://nodejs.org/api/os.html#ostmpdir):

```javascript
import * as os from "node:os";
import * as path from "node:path";
import * as fs from "node:fs";

const pathPrefix = path.resolve(os.tmpdir(), "my-app");
  // например, "/var/folders/ph/sz0384m11vxf/T/my-app"

const tmpPath = fs.mkdtempSync(pathPrefix);
  // например, "/var/folders/ph/sz0384m11vxf/T/my-app1QXOXP"
```

Созданные таким способом директории автоматически не удаляются.

## 5. Копирование, переименование, перемещение файлов или директорий

### 5.1. Копирование файлов или директорий

[fs.cpSync(srcPath, destPath, options?)](https://nodejs.org/api/fs.html#fscpsyncsrc-dest-options) копирует файл или директорию из `srcPath` в `destPath`. Полезные настройки:

- `recursive` (`false` по умолчанию): директории (включая пустые) копируются только когда данная настройка имеет значение `true`;
- `force` (`true`): если имеет значение `true`, существующие файлы перезаписываются:
  - если имеет значение `false` и настройка `errorOnExist` установлена в `true`, при наличии файла выбрасывается исключение;
- `filter`: функция, позволяющая управлять тем, какие файлы копируются;
- `preserveTimestamps` (`false`): если имеет значение `true`, копии в `destPath` получат отметки времени оригиналов (время создания, последней модификации и т.п.).

Пример использования:

```javascript
import * as fs from "node:fs";

assert.deepEqual(
  Array.from(traverseDir(".")),
  [
    "dir-orig",
    "dir-orig/some-file.txt",
  ]
);

fs.cpSync("dir-orig", "dir-copy", { recursive: true });

assert.deepEqual(
  Array.from(traverseDir(".")),
  [
    "dir-copy",
    "dir-copy/some-file.txt",
    "dir-orig",
    "dir-orig/some-file.txt",
  ]
);
```

### 5.2. Переименование или перемещение файлов или директорий

[fs.renameSync(oldPath, newPath)](https://nodejs.org/api/fs.html#fsrenamesyncoldpath-newpath) переименовывает или перемещает файл или директорию из `oldPath` в `newPath`.

Пример использования данной функции для переименования директории:

```javascript
import * as fs from "node:fs";

assert.deepEqual(
  Array.from(traverseDir(".")),
  [
    "old-dir-name",
    "old-dir-name/some-file.txt",
  ]
);

fs.renameSync("old-dir-name", "new-dir-name");

assert.deepEqual(
  Array.from(traverseDir(".")),
  [
    "new-dir-name",
    "new-dir-name/some-file.txt",
  ]
);
```

Пример перемещения файла:

```javascript
assert.deepEqual(
  Array.from(traverseDir(".")),
  [
    "dir",
    "dir/subdir",
    "dir/subdir/some-file.txt",
  ]
);

fs.renameSync("dir/subdir/some-file.txt", "some-file.txt");

assert.deepEqual(
  Array.from(traverseDir(".")),
  [
    "dir",
    "dir/subdir",
    "some-file.txt",
  ]
);
```

## 6. Удаление файлов или директорий

### 6.1. Удаление файлов и директорий (`rm`, `rm -r`)

[fs.rmSync(path, options?)](https://nodejs.org/api/fs.html#fsrmsyncpath-options) удаляет файл или директорию по указанному пути. Полезные настройки:

- `recursive` (`false`): директории (включая пустые) удаляются только когда данная настройка имеет значение `true`;
- `force` (`false`): если имеет значение `false`, при отсутствии файла или директории по указанному пути выбрасывается исключение.

Пример удаления файла:

```javascript
import * as fs from "node:fs";

assert.deepEqual(
  Array.from(traverseDir(".")),
  [
    "dir",
    "dir/some-file.txt",
  ]
);

fs.rmSync("dir/some-file.txt");

assert.deepEqual(
  Array.from(traverseDir(".")),
  [
    "dir",
  ]
);
```

Пример рекурсивного удаления непустой директории:

```javascript
import * as fs from "node:fs";

assert.deepEqual(
  Array.from(traverseDir(".")),
  [
    "dir",
    "dir/subdir",
    "dir/subdir/some-file.txt",
  ]
);

fs.rmSync("dir/subdir", {recursive: true});

assert.deepEqual(
  Array.from(traverseDir(".")),
  [
    "dir",
  ]
);
```

### 6.2. Удаление пустых директорий (`rmdir`)

[fs.rmdirSync](https://nodejs.org/api/fs.html#fsrmdirsyncpath-options) удаляет пустую директорию (если директория не является пустой, выбрасывается исключение):

```javascript
import * as fs from "node:fs";

assert.deepEqual(
  Array.from(traverseDir(".")),
  [
    "dir",
    "dir/subdir",
  ]
);

fs.rmdirSync("dir/subdir");

assert.deepEqual(
  Array.from(traverseDir(".")),
  [
    "dir",
  ]
);
```

### 6.3. Создание директорий

Следующая функция очищает директорию по указанному пути:

```javascript
import * as path from "node:path";
import * as fs from "node:fs";

function clearDir(dirPath) {
  for (const fileName of fs.readdirSync(dirPath)) {
    const pathName = path.join(dirPath, fileName);

    fs.rmSync(pathName, { recursive: true });
  }
}
```

Здесь:

- `fs.readdirSync(path)` возвращает названия всех потомков директории по указанному пути;
- `fs.rmSync(path, options?)` удаляет файлы и директории.

Пример использования:

```javascript
assert.deepEqual(
  Array.from(traverseDir(".")),
  [
    "dir",
    "dir/dir-file.txt",
    "dir/subdir",
    "dir/subdir/subdir-file.txt"
  ]
);

clearDirectory("dir");

assert.deepEqual(
  Array.from(traverseDir(".")),
  [
    "dir",
  ]
);
```

### 6.4. Перемещение файлов или директорий в корзину

Библиотека [trash](https://github.com/sindresorhus/trash) перемещает файлы или директории в корзину. Она работает на `macOS`, `Windows` и `Linux`.

Пример использования:

```javascript
import trash from "trash";

await trash(["*.png", "!rainbow.png"]);
```

`trash()` принимает строку или массив строк в качестве первого параметра. Любая строка может быть паттерном поиска (glob pattern) (со звездочками и другими метасимволами).

## 7. Чтение и изменение записей файловой системы

### 7.1. Определение наличия файла или директории

[fs.existsSync(path)](https://nodejs.org/api/fs.html#fsexistssyncpath) возвращает `true`, если файл или директория по указанному пути существует:

```javascript
import * as fs from "node:fs";

assert.deepEqual(
  Array.from(traverseDir(".")),
  [
    "dir",
    "dir/some-file.txt",
  ]
);
assert.equal(
  fs.existsSync("dir"), true
);
assert.equal(
  fs.existsSync("dir/some-file.txt"), true
);
assert.equal(
  fs.existsSync("dir/non-existent-file.txt"), false
);
```

### 7.2. Получение статистики файла: является ли файл директорией, когда он был создан и т.д.

[fs.statSync(path, options?)](https://nodejs.org/api/fs.html#fsstatsyncpath-options) возвращает экземпляр [fs.Stats](https://nodejs.org/api/fs.html#class-fsstats) с полезной информацией о файле или директории по указанному пути. Основные настройки:

- `throwIfNoEntry` (`true`): если `true`, при отсутствии записи выбрасывается исключение, если `false`, возвращается `undefined`;
- `bigint` (`false`): если `true`, функция использует [BigInt](https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/BigInt) для числовых значений (таких как отметки времени, см. ниже).

Свойства экземпляров `fs.Stats`:

- вид записи:
  - `stats.isFile()`;
  - `stats.isDirectory()`;
  - `stats.isSymbolicLink()`;
- `stats.size`: размер в байтах;
- отметки времени:
  - 3 вида:
    - `stats.atime`: время последнего доступа;
    - `stats.mtime`: время последней модификации;
    - `stats.birthtime`: время создания;
  - каждый вид может использовать 3 единицы измерения, например, для `atime`:
    - `stats.atime`: экземпляр `Date`;
    - `stats.atimeMS`: миллисекунды с начала эпохи (`POSIX`);
    - `stats.atimeNs`: наносекунды с начала эпохи.

Пример реализации функции `isDirectory` с помощью `fs.statsSync()`:

```javascript
import * as fs from "node:fs";

function isDirectory(thePath) {
  const stats = fs.statSync(thePath, { throwIfNoEntry: false });

  return stats && stats.isDirectory();
}

assert.deepEqual(
  Array.from(traverseDir(".")),
  [
    "dir",
    "dir/some-file.txt",
  ]
);
assert.equal(
  isDirectory("dir"), true
);
assert.equal(
  isDirectory("dir/some-file.txt"), false
);
assert.equal(
  isDirectory("non-existent-dir"), false
);
```

### 7.3. Изменение атрибутов файла: разрешения, владелец, группа, отметки времени

Функции для модификации атрибутов файла:

- [fs.chmodSync(path, mode)](https://nodejs.org/api/fs.html#fschmodsyncpath-mode): обновляет разрешение файла;
- [fs.chownSync(path, uid, gid)](https://nodejs.org/api/fs.html#fschownsyncpath-uid-gid): обновляет владельца или группу файла;
- [fs.utimesSync(path, atime, mtime)](https://nodejs.org/api/fs.html#fsutimessyncpath-atime-mtime): обновляет отметки времени файла:
  - `atime`: время последнего доступа;
  - `mtime`: время последней модификации.

## 8. Работа со ссылками

Функции для работы с жесткими ссылками (hard links):

- [fs.linkSync(existingPath, newPath)](https://nodejs.org/api/fs.html#fslinksyncexistingpath-newpath) создает жесткую ссылку;
- [fs.unlinkSync(path)](https://nodejs.org/api/fs.html#fsunlinksyncpath) удаляет жесткую ссылку на файл и, возможно, сам файл, если удаленная ссылка была последней.

Функции для работы с символическими ссылками (symbolic links):

- [fs.symlinkSync(target, path, type?)](https://nodejs.org/api/fs.html#fssymlinksynctarget-path-type) создает символическую ссылку из `path` на `target`;
- [fs.readlinkSync(path, options?)](https://nodejs.org/api/fs.html#fsreadlinksyncpath-options) возвращает цель символической ссылки по указанному пути.

Следующие функции оперируют символическими ссылками без их разыменования (dereferencing) (обратите внимание на префикс `l`):

- [fs.lchmodSync(path, mode)](https://nodejs.org/api/fs.html#fslchmodsyncpath-mode);
- [fs.lchownSync(path, uid, gid)](https://nodejs.org/api/fs.html#fslchownsyncpath-uid-gid);
- [fs.lutimeSync(path, atime, mtime)](https://nodejs.org/api/fs.html#fslutimessyncpath-atime-mtime);
- [fs.lstatSync(path, options?)](https://nodejs.org/api/fs.html#fslstatsyncpath-options).

Еще одна полезная функция - [fs.realpathSync(path, options?)](https://nodejs.org/api/fs.html#fsrealpathsyncpath-options) вычисляет каноническое название пути посредством разрешения символов `.` и `..`, а также символических ссылок.

Настройки функций, влияющие на обработку символических ссылок:

- `fs.cpSync(srcPath, destPath, options?)`:
  - `dereference` (`false`): если `true`, копируется файл, на который указывает символическая ссылка, а не сама ссылка;
  - `verbatimSymlinks` (`false`): если `false`, обновляется указатель локации цели скопированной символической ссылки.

[Ссылки для дальнейшего изучения](https://2ality.com/2022/06/nodejs-file-system.html#further-reading).
