---
slug: nodejs-module-bundler
title: Разрабатываем сборщик модулей на Node.js
description: Туториал по разработке простого сборщика модулей на Node.js
authors: harryheman
tags: ['node.js', nodejs, javascript, js, module bundler, bundler, bundle, webpack, tutorial, сборщик модулей, сборщик, сборка, туториал]
image: https://habrastorage.org/webt/4-/hn/8w/4-hn8wkkaeafijehpfybkgcounq.png
---

<img src="https://habrastorage.org/webt/4-/hn/8w/4-hn8wkkaeafijehpfybkgcounq.png" alt="" />

Привет, друзья!

Вам когда-нибудь хотелось узнать, как работают сборщики модулей (module bundlers) _JavaScript_ типа [Webpack](https://webpack.js.org/) или [Parcel](https://parceljs.org/), что называется, под капотом. Если хотелось, тогда эта статья для вас.

В данном туториале мы разработаем простой сборщик модулей на [Node.js](https://nodejs.org/en/), который будет компилировать все модули приложения в один минифицированный файл с кодом, соответствующим стандарту _ES5_.

> [Источник вдохновения](https://github.com/ronami/minipack).

> [Репозиторий с кодом проекта](https://github.com/harryheman/Blog-Posts/tree/master/nodejs-bundler).

<!--truncate-->

## Введение

Как правило, сборщики компилируют небольшие части кода в один большой файл, который доставляется в браузер для выполнения. Эти небольшие части кода - просто _JS-файлы_, зависимости между которыми представлены в виде [системы модулей](https://webpack.js.org/concepts/modules).

Сборщики используют концепцию входного (entry) файла. Вместо того, чтобы подключать несколько скриптов в разметке для их выполнения браузером, мы сообщаем сборщику о том, какой файл является входной точкой (entrypoint) приложения, т.е. о том, какой файл является главным или основным файлом приложения. В этом файле происходит формирование (bootstrap) кода всего приложения.

Сборщик начинает с основного файла и пытается определить, от каких файлов он зависит. Затем он пытается "понять", на каких файлах основаны зависимые файлы. Так продолжается до тех пор, пока сборщик не вычислит все модули приложения, а также связи между ними. Данный процесс называется формированием графа зависимостей (dependency graph).

Мы создадим граф зависимостей и используем его для упаковки (package) всех модулей в одну сборку (bundle).

_Обратите внимание_: наш сборщик будет очень простым. Это означает, что при его разработке мы оставим без внимания такие важные вещи, как предотвращение циклических зависимостей (cyclic dependencies), кеширование экспорта модулей, однократный разбор (parsing) каждого модуля и т.д.

## Подготовка и настройка проекта

Для разработки сборщика будут использоваться следующие _npm-пакеты_:

- [babel-core](https://www.npmjs.com/package/babel-core): ядро транспилятора [Babel](https://babeljs.io/) для компиляции кода;
- [babel-preset-env](https://www.npmjs.com/package/babel-preset-env): пресет _Babel_ для компиляции _JS-кода_, в котором используется синтаксис _ES6+_, в _ES5-код_, поддерживаемый большинством браузеров;
- [babel-traverse](https://www.npmjs.com/package/babel-traverse): утилита для модификации узлов (nodes) абстрактного синтаксического дерева (Abstract Syntax Tree, AST); используется совместно с _babylon_ (см. ниже);
- [babylon](https://www.npmjs.com/package/babylon): парсер (parser) _JS_, используемый в _Babel_;
- [fs-extra](https://www.npmjs.com/package/fs-extra): расширенный модуль [fs](https://nodejs.org/api/fs.html);
- [uglify-js](https://www.npmjs.com/package/uglify-js): утилита для разбора, минификации, сжатия и форматирования _JS-кода_.

Я не буду останавливаться на том, что такое компиляция кода и из каких этапов состоит данный процесс. Почитать об этом можно [здесь](https://my-js.org/blog/js-compiler/) и [здесь](https://my-js.org/blog/ts-compiler/).

Создаем директорию, переходим в нее, инициализируем _Node.js-проект_ и устанавливаем зависимости:

```bash
mkdir nodejs-bundler
cd $!

yarn init -yp
# or
npm init -y

yarn add babel-core babel-preset-env babel-traverse babylon fs-extra uglify-js
# or
npm i ...
```

Определяем команды для выполнения сборки и запуска кода в файле _package.json_:

```json
"scripts": {
  "build": "node bundle.js",
  "start": "node build/index.js"
}
```

Как видите, код сборщика будет находиться в файле _bundle.js_, а сама сборка будет записываться в файл _index.js_, находящийся в директории _build_.

Создаем файл _bundler.config.json_ с настройками для сборщика:

```json
{
  "entryPoint": "src/main.js",
  "outDir": "build"
}
```

Здесь определяется входная точка (основной файл) приложения (_src/main.js_) и название директории для сборки (_build_).

Создаем директорию _src_ с тремя файлами:

```bash
mkdir src
cd $!

touch who.js greeting.js main.js
```

Содержимое этих файлов будет следующим:

```js
// who.js
export const who = process.argv.slice(2)[0]

// greeting.js
import { who } from './who.js'

const greeting = `Привет, ${who || 'незнакомец'}!`

export default greeting

// main.js
import greeting from './message.js'

console.log(greeting)
```

Логика работы приложения следующая:

- Сначала в файле _who.js_ мы разбираем аргументы командной строки (переданные при выполнении команды `start` в терминале) (`process.argv`), и записываем первый (несистемный) аргумент (`process.argv.slice(2)[0]`) в переменную _who_. Эта переменная экспортируется по названию (именованный экспорт).
- В файле _greeting.js_ формируется приветствие с использованием переменной _who_, импортируемой из одноименного файла. Приветствие записывается в переменную _greeting_, которая экспортируется по умолчанию.
- В файле _main.js_ мы импортируем переменную _greeting_ из одноименного файла и просто выводим приветствие в консоль.

_Обратите внимание_: для работы с модулями (их экспорта/импорта) используется синтаксис _ESM_, который был введен стандартом _ECMAScript2015_ (_ES6_).

Итак, наша задача состоит в том, чтобы компилировать код модулей из _ES6_ в _ES5_ и собрать модули в один минифицированный _JS-файл_ (_build/index.js_). При этом, разумеется, приложение должно остаться полностью работоспособным.

## Разработка сборщика

Создаем файл _bundle.js_.

Импортируем пакеты:

```js
const fs = require('fs-extra')
const path = require('path')
const babylon = require('babylon')
// обратите внимание на синтаксис импорта
const traverse = require('babel-traverse').default
const { transformFromAst } = require('babel-core')
const UglifyJS = require('uglify-js')
```

Определяем "генератор" идентификатора модуля:

```js
let ID = 0
```

Определяем функцию для чтения содержимого файла и извлечения его зависимостей:

```js
// Функция принимает абсолютный путь к файлу
function createAsset(filename) {
  // ...
}
```

Читаем содержимое файла как строку:

```js
const content = fs.readFileSync(filename, 'utf-8')
```

Определяем зависимые модули.

Это можно сделать посредством поиска в файле ключевого слова `import`, но такой подход является не слишком надежным. Поэтому используем _JS-парсер_. Парсеры - это инструменты, которые умеют читать и понимать _JS-код_. Они генерируют _AST_. Вот [отличный онлайн-инструмент для представления любого JS-кода в виде AST](https://astexplorer.net/).

_AST_ содержит большое количество информации о коде, которая позволяет, в частности, определить, что данный код "пытается сделать".

```js
const ast = babylon.parse(content, {
  // режим парсинга кода
  sourceType: 'module'
})
```

Определяем массив для относительных путей зависимых модулей:

```js
const dependencies = []
```

Перебираем (traverse) узлы (nodes) AST и определяем зависимые модули. Для этого выполняется поиск инструкций импорта (import statements). При наличии такой инструкции, импортируемое значение добавляется в массив зависимостей:

```js
traverse(ast, {
  ImportDeclaration: ({ node }) => {
    dependencies.push(node.source.value)
  }
})
```

Генерируем уникальный идентификатор модуля:

```js
const id = ID++
```

Мы используем _ESM_ и другие возможности _JS_, которые могут поддерживаться не всеми браузерами. Для обеспечения выполнения кода сборки всеми браузерами транспилируем код модуля с помощью _Babel_:

```js
const { code } = transformFromAst(ast, null, {
    presets: ['env']
  })
```

Настройка `presets` - это набор правил транспиляции кода. `babel-preset-env` используется для транспиляции исходного кода (_ES6_) в код, поддерживаемый большинством браузеров (_ES5_).

Возвращаем всю информацию о модуле:

```js
return {
  id,
  filename,
  dependencies,
  code
}
```

Определяем функцию для построения графа зависимостей:

```js
// Функция принимает путь к файлу
function createGraph(entry) {
  // ...
}
```

В теле этой функции мы извлекаем зависимости каждого модуля, начиная с основного файла. Затем извлекаем зависимости каждой зависимости. Этот процесс повторяется до тех пор, пока не будут определены все модули приложения и их связи между собой. В результате получаем граф зависимостей.

Разбираем основной файл:

```js
const mainAsset = createAsset(entry)
```

Для разбора зависимостей каждого модуля используется очередь:

```js
const queue = [mainAsset]
```

Перебираем элементы очереди.

Изначально в очереди имеется только один элемент, но в процессе перебора в нее помещаются новые элементы. Цикл заканчивается, когда очередь становится пустой:

```js
for (const asset of queue) {
  // Каждый элемент может иметь зависимые модули (список их относительных путей).
  // Мы перебираем их, разбираем с помощью `createAsset()` и
  // записываем в свойство `mapping`
  asset.mapping = {}

  // Название директории, в которой находится данный модуль
  const dirname = path.dirname(asset.filename)

  // Перебираем список относительных путей
  asset.dependencies.forEach((relativePath) => {
    /**
     * Наша функция `createAsset` принимает абсолютный путь к файлу.
     * Массив зависимостей - это массив относительных путей.
     * Эти пути являются относительными к импортирующему их файлу.
     * Мы можем получить абсолютный путь из относительного посредством
     * объединения относительного пути с путем родительской директории элемента.
     */
    const absolutePath = path.join(dirname, relativePath)

    // Разбираем элемент, читаем его содержимое и извлекаем зависимости
    const child = createAsset(absolutePath)

    // Для нас очень важным является тот факт, что `asset` зависит от (основан на) `child`.
    // Мы выражаем это отношение посредством добавления нового свойства в `mapping`
    asset.mapping[relativePath] = child.id

    // Помещаем `child` в очередь для того,
    // чтобы его зависимости также были перебраны и разобраны
    queue.push(child)
  })
}
```

Возвращаем граф зависимостей - массив всех модулей целевого (target) приложения:

```js
return queue
```

Определяем функцию для генерации сборки:

```js
function createBundle(graph) {
  // ...
}
```

Функция принимает граф зависимостей - объект с информацией о каждом модуле приложения. Наша сборка будет содержать единственную автоматически вызываемую функцию (Immediately Invoked Function Expression, IIFE): `(function () {})()`.

Определяем переменную для модулей:

```js
let modules = ''
```

Формируем объект, передаваемый в тело _IIFE_. _Обратите внимание:_ генерируемая строка оборачивается в фигурные скобки (`{}`), поэтому для каждого модуля добавляется строка в формате `key: value`:

```js
graph.forEach((m) => {
  /**
   * Каждый модуль (объект) содержит точку входа (entry).
   * Мы используем `id` модуля в качестве ключа и массив в качестве значения.
   * Первым значением массива является код модуля, обернутый в функцию.
   * Это связано с тем, что код модуля должен быть ограничен его областью видимости (scope):
   * определение переменной в одном модуле не должно влиять на другие модули
   * или глобальную область видимости.
   *
   * После транспиляции модули будут использовать систему модулей `CommonJS`:
   * они будут принимать объекты `require`, `module` и `exports`.
   * Эти объекты недоступны в браузере, поэтому мы реализуем их самостоятельно
   * и внедряем в функциональную обертку.
   *
   * Второе значение массива - это результат стрингификации (stringification) связей между модулем и его зависимостями.
   * Данный объект выглядит так:
   * { "./relative/path": "1" }
   * Это связано с тем, что транспилированый код модуля вызывает `require()` с относительным путем.
   * При вызове этой функции мы должны знать, какой модуль в графе
   * соответствует данному относительному пути.
   */
  modules += `${m.id}: [
    function (require, module, exports) {
      ${m.code}
    },
    ${JSON.stringify(m.mapping)}
  ],`
})
// обратите внимание на запятую в конце (после `]`)
```

Определяем _IIFE_.

Начинаем с создания функции `require`: она принимает `id` модуля и выполняет его поиск в объекте `modules`. Применяем деструктуризацию массива для извлечения обертки-функции и объекта зависимостей модуля.

Код модуля вызывает `require()` с относительным путем вместо `id` модуля. Однако функция `require` ожидает `id` модуля. Кроме того, 2 модуля могут `require()` одинаковый относительный путь, но разные модули.

Для решения этих задач при запросе модуля создаем новую функцию `require` для модуля. Эта функция будет специфичной для данного модуля и будет способна преобразовывать относительные пути в `id` с помощью объекта `mapping`. `mapping` - это объект, представляющий связи между относительными путями и `id` модулей для данного модуля.

Наконец, в случае с `CommonJS`, при запросе модуль может выставлять (expose) значения (делать их доступными для внешнего мира) путем мутирования объекта `exports`. После модификации кодом модуля объект `exports` возвращается из функции `require`.

```js
const result = `
  (function(modules) {
    function require(id) {
      const [fn, mapping] = modules[id]

      function localRequire(name) {
        return require(mapping[name])
      }

      const module = { exports: {} }

      fn(localRequire, module, module.exports)

      return module.exports
    }

    require(0)
  })({ ${modules} })
`
```

Возвращаем результат:

```js
return result
```

Определяем основную функцию сборщика:

```js
function pack() {
  // ...
}
```

Читаем файл с настройками и выполняем несколько проверок:

```js
// Путь к файлу с настройками
const PATH_TO_CONFIG = path.join(__dirname, 'bundler.config.json')
// Если такой файл отсутствует
if (!fs.pathExistsSync(PATH_TO_CONFIG)) {
  throw new Error('Config is required.')
}

// Читаем файл с настройками. Получаем `JS-объект`
const config = fs.readJSONSync(PATH_TO_CONFIG)
// Если не определена входная точка приложения
if (
  !config.entryPoint ||
  typeof config.entryPoint !== 'string' ||
  !config.entryPoint.trim()
) {
  throw new Error('Entrypoint is required.')
}
// Если не определена директория для сборки
if (
  !config.outDir ||
  typeof config.outDir !== 'string' ||
  !config.outDir.trim()
) {
  throw new Error('Outdir is required.')
}
```

Создаем граф зависимостей, генерируем сборку и минифицируем код:

```js
// Создаем граф зависимостей
const graph = createGraph(path.join(__dirname, config.entryPoint))
// Генерируем сборку
const result = createBundle(graph)
// Минифицируем код
const { code } = UglifyJS.minify(result)
```

Записываем сборку в соответствующую директорию:

```js
// Путь к директории для сборки
const PATH_TO_BUILD = path.join(__dirname, config.outDir)
// Удаляем предыдущую сборку
if (fs.pathExistsSync(PATH_TO_BUILD)) {
  fs.removeSync(PATH_TO_BUILD)
}

// Создаем директорию для сборки
fs.mkdirpSync(PATH_TO_BUILD)
// Записываем сборку
fs.writeFileSync(`${PATH_TO_BUILD}/index.js`, code, 'utf8')

// Сообщаем об успехе
console.log('Bundle created.')
```

Вызываем функцию:

```js
pack()
```

<details>
<summary>Полный код сборщика:</summary>

```js
const fs = require('fs-extra')
const path = require('path')
const babylon = require('babylon')
const traverse = require('babel-traverse').default
const { transformFromAst } = require('babel-core')
const UglifyJS = require('uglify-js')

let ID = 0

function createAsset(filename) {
  const content = fs.readFileSync(filename, 'utf-8')

  const ast = babylon.parse(content, {
    sourceType: 'module'
  })

  const dependencies = []

  traverse(ast, {
    ImportDeclaration: ({ node }) => {
      dependencies.push(node.source.value)
    }
  })

  const id = ID++

  const { code } = transformFromAst(ast, null, {
    presets: ['env']
  })

  return {
    id,
    filename,
    dependencies,
    code
  }
}

function createGraph(entry) {
  const mainAsset = createAsset(entry)

  const queue = [mainAsset]

  for (const asset of queue) {
    asset.mapping = {}

    const dirname = path.dirname(asset.filename)

    asset.dependencies.forEach((relativePath) => {
      const absolutePath = path.join(dirname, relativePath)

      const child = createAsset(absolutePath)

      asset.mapping[relativePath] = child.id

      queue.push(child)
    })
  }

  return queue
}

function createBundle(graph) {
  let modules = ''

  graph.forEach((m) => {
    modules += `${m.id}: [
      function (require, module, exports) {
        ${m.code}
      },
      ${JSON.stringify(m.mapping)}
    ],`
  })

  const result = `
    (function(modules) {
      function require(id) {
        const [fn, mapping] = modules[id]

        function localRequire(name) {
          return require(mapping[name])
        }

        const module = { exports: {} }

        fn(localRequire, module, module.exports)

        return module.exports
      }

      require(0)
    })({ ${modules} })
  `

  return result
}

function pack() {
  const PATH_TO_CONFIG = path.join(__dirname, 'bundler.config.json')
  if (!fs.pathExistsSync(PATH_TO_CONFIG)) {
    throw new Error('Config is required.')
  }

  const config = fs.readJSONSync(PATH_TO_CONFIG)
  if (
    !config.entryPoint ||
    typeof config.entryPoint !== 'string' ||
    !config.entryPoint.trim()
  ) {
    throw new Error('Entrypoint is required.')
  }
  if (
    !config.outDir ||
    typeof config.outDir !== 'string' ||
    !config.outDir.trim()
  ) {
    throw new Error('Outdir is required.')
  }

  const graph = createGraph(path.join(__dirname, config.entryPoint))
  const result = createBundle(graph)
  const { code } = UglifyJS.minify(result)

  const PATH_TO_BUILD = path.join(__dirname, config.outDir)
  if (fs.pathExistsSync(PATH_TO_BUILD)) {
    fs.removeSync(PATH_TO_BUILD)
  }
  fs.mkdirpSync(PATH_TO_BUILD)
  fs.writeFileSync(`${PATH_TO_BUILD}/index.js`, code, 'utf-8')

  console.log('Bundle created.')
}
pack()
```

</details>

Отлично, мы закончили разработку нашего сборщика модулей. Осталось убедиться в его работоспособности.

## Проверка работоспособности

Находясь в корневой директории проекта (_nodejs-bundler_), выполняем команду `yarn build` или `npm run build`:

<img src="https://habrastorage.org/webt/g4/tc/ol/g4tcol8efe2rsq1gx2f1207_fww.png" alt="" />
<br />

Выполнение данной команды приводит к генерации файла _build/index.js_ следующего содержания:

```js
!function(n){!function t(e){const[o,s]=n[e];e={exports:{}};return o(function(e){return t(s[e])},e,e.exports),e.exports}(0)}({0:[function(e,t,o){"use strict";var e=e("./greeting.js"),e=(e=e)&&e.__esModule?e:{default:e};console.log(e.default)},{"./greeting.js":1}],1:[function(e,t,o){"use strict";Object.defineProperty(o,"__esModule",{value:!0});e="Привет, "+(e("./who.js").who||"незнакомец")+"!";o.default=e},{"./who.js":2}],2:[function(e,t,o){"use strict";Object.defineProperty(o,"__esModule",{value:!0});o.who=process.argv.slice(2)[0]},{}]});
```

Это минифицированнуая ES5-версия всего кода нашего приложения.

Выполняем команду `yarn start` или `npm start`:

<img src="https://habrastorage.org/webt/kq/jc/s4/kqjcs4zgzhutdik1jfstyynn5ta.png" alt="" />
<br />

Получаем приветствие "Привет, незнакомец!" в терминале.

Передаем имя приветствуемого в терминале - `yarn start Игорь` или `npm start Игорь`:

<img src="https://habrastorage.org/webt/x4/ud/sx/x4udsxqyfpkrv5rgqob_jy9eyow.png" alt="" />
<br />

Получаем приветствие "Привет, Игорь!".

Код сборки работает, как ожидается.

Благодарю за внимание и happy coding!
