---
slug: ts-package-manager
title: Пакетный менеджер на TypeScript
description: Туториал по разработке простого пакетного менеджера на TypeScript
authors: harryheman
tags: ['node.js', nodejs, typescript, ts, package manager, npm, yarn, tutorial, пакетный менеджер, туториал]
image: https://habrastorage.org/webt/4-/hn/8w/4-hn8wkkaeafijehpfybkgcounq.png
---

<img src="https://habrastorage.org/webt/4-/hn/8w/4-hn8wkkaeafijehpfybkgcounq.png" alt="" />

Привет, друзья!

Вам когда-нибудь хотелось узнать, как под капотом работают [пакетные менеджеры](https://ru.wikipedia.org/wiki/%D0%A1%D0%B8%D1%81%D1%82%D0%B5%D0%BC%D0%B0_%D1%83%D0%BF%D1%80%D0%B0%D0%B2%D0%BB%D0%B5%D0%BD%D0%B8%D1%8F_%D0%BF%D0%B0%D0%BA%D0%B5%D1%82%D0%B0%D0%BC%D0%B8) (Package Manager, PM) - [интерфейсы командной строки](https://ru.wikipedia.org/wiki/%D0%98%D0%BD%D1%82%D0%B5%D1%80%D1%84%D0%B5%D0%B9%D1%81_%D0%BA%D0%BE%D0%BC%D0%B0%D0%BD%D0%B4%D0%BD%D0%BE%D0%B9_%D1%81%D1%82%D1%80%D0%BE%D0%BA%D0%B8) (Command Line Interface, CLI) для установки зависимостей проектов наподобие [npm](https://www.npmjs.com/) или [yarn](https://yarnpkg.com/)? Если хотелось, тогда эта статья для вас.

В данном туториале мы разработаем простой пакетный менеджер на [Node.js](https://nodejs.org/) и [TypeScript](https://www.typescriptlang.org/). В качестве образца для подражания мы будем использовать _yarn_. Если вы не знакомы с _TS_, советую взглянуть на [эту карманную книгу](https://my-js.org/docs/guide/ts).

Наш _CLI_ будет называться _my-yarn_. В качестве [lock-файла](https://habr.com/ru/company/domclick/blog/513130/) (_yarn.lock_, _package-lock.json_) он будет использовать файл _my-yarn.yml_.

[Источник вдохновения](https://github.com/g-plane/tiny-package-manager).

[Код проекта](https://github.com/harryheman/Blog-Posts/tree/master/ts-package-manager).

<!--truncate-->

В процессе разработки `CLI` мы будем использовать несколько интересных `npm-пакетов`. Давайте начнем наше путешествие с краткого знакомства с ними.

## Пакеты

### [find-up](https://www.npmjs.com/package/find-up)

_find-up_ - это утилита для поиска файла или директории в родительских директориях.

__Установка__

```bash
yarn add find-up
```

__Использование__

```js
import { findUp } from 'find-up'
import fs from 'fs-extra'

// находим файл `package.json` (путь к нему)
const filePath = await findUp('package.json')
// читаем его содержимое как `JSON`
const fileContent = await fs.readJson(filePath)
```

### [fs-extra](https://www.npmjs.com/package/fs-extra)

_fs-extra_ - это просто [fs](https://nodejs.org/api/fs.html) на стероидах.

__Установка__

```bash
yarn add fs-extra
```

### [js-yaml](https://www.npmjs.com/package/js-yaml)

_js-yaml_ - это утилита для разбора (парсинга) файла в формате [YAML](https://ru.wikipedia.org/wiki/YAML) в объект и сериализации объекта обратно в `yaml`.

__Установка__

```bash
yarn add js-yaml
```

__Использование__

```js
import { findUp } from 'find-up'
import fs from 'fs-extra'
import yaml from 'js-yaml'

const filePath = await findUp('my-yarn.yml')
const fileContent = await fs.readFile(filePath, 'utf-8')
// разбираем файл
// метод `load` принимает строку и опциональный объект с настройками
const fileObj = yaml.load(fileContent)

// сериализуем файл
// метод `dump` принимает объект c содержимым файла и опциональный объект с настройками
await fs.writeFile(
  filePath,
  yaml.dump(fileObj, { noRefs: true, sortKeys: true })
)
// `noRefs: true` запрещает преобразование дублирующихся объектов в ссылки
// `sortKeys: true` выполняет сортировку ключей объекта при формировании файла
```

### [log-update](https://www.npmjs.com/package/log-update)

_log-update_ - это утилита для вывода сообщений в терминал с перезаписью предыдущего вывода. Может использоваться для рендеринга индикаторов прогресса, анимации и др.

__Установка__

```bash
yarn add log-update
```

__Использование__

```js
import logUpdate from 'log-update'

export function logResolving(pkgName: string) {
  logUpdate(`[1/2] Resolving: ${pkgName}`)
}
```

### [node-fetch](https://www.npmjs.com/package/node-fetch)

_node-fetch_ - это обертка над [Fetch API](https://developer.mozilla.org/ru/docs/Web/API/Fetch_API) для `Node.js`.

__Установка__

```bash
yarn add node-fetch
```

### [progress](https://www.npmjs.com/package/progress)

_progress_ - это утилита для создания индикаторов загрузки, состоящих из [ASCII-символов](https://ru.wikipedia.org/wiki/ASCII).

__Установка__

```bash
yarn add progress
```

__Использование__

```js
import logUpdate from 'log-update'
import ProgressBar from 'progress'

export function prepareInstall(total: number) {
  logUpdate('[1/2] Finished resolving.')
  // конструктор принимает строку с токенами и опциональный объект с настройками
  progress = new ProgressBar('[2/2] Installing [:bar]', {
    // символ заполнения
    complete: '#',
    // общее количество тиков (ticks)
    total
  })
}
```

### [semver](https://www.npmjs.com/package/semver)

_semver_ - это семантический "версионер" (semantic versioner) для `npm`.

__Установка__

```bash
yarn add semver
```

__Использование__

```js
import semver from 'semver'

const versions = ['1.0.0', '3.0.0', '5.0.0']
const range = '2.0.0 - 4.0.0'

// возвращает наиболее близкую к диапазону версию или `null`
semver.maxSatisfying(versions, range) // 3.0.0

// возвращает `true`, если версия удовлетворяет диапазону
semver.satisfies(versions[1], range) // true
```

### [tar](https://www.npmjs.com/package/tar)

_tar_ - это обертка над [tar](https://ru.wikipedia.org/wiki/Tar) для `Node.js`.

__Установка__

```bash
yarn add tar
```

__Использование__

```js
import fetch from 'node-fetch'
import fs from 'fs-extra'
import tar from 'tar'

// адрес реестра
const REGISTRY_URI = 'https://registry.npmjs.org'
// название пакета
const pkgName = 'nodemon'
// путь к директории для пакета
const dirPath = `${process.cwd()}/node_modules/${pkgName}`

// получаем информацию о пакете
const pkgJson = await (await fetch(`${REGISTRY_URI}/${pkgName}`)).json()
// получаем последнюю версию пакета
const latestVersion = Object.keys(pkgJson.versions).at(-1)
// путь к тарбалу (tarball) пакета
const tarUrl = pkgJson.versions[latestVersion].dist.tarball

// создаем директорию для пакета при отсутствии
if (!(await fs.pathExists(dirPath))) {
  await fs.mkdirp(dirPath)
}

// тело ответа представляет собой поток данных (application/octet-stream),
// доступный для чтения
const { body: tarReadableStream } = await fetch(tarUrl)
tarReadableStream
  // извлекаем содержимое пакета
  // `cwd` - путь к директории
  // `strip` - количество ведущих элементов пути (leading path elements) для удаления
  .pipe(tar.extract({ cwd: dirPath, strip: 1 }))
  .on('close', () =>
    console.log(`Package ${pkgName} has been successfully extracted.`)
  )
```

### [yargs](https://www.npmjs.com/package/yargs)

_yargs_ - это библиотека для разработки `CLI` с отличной [документацией](https://yargs.js.org/).

__Установка__

```bash
yarn add yargs
```

Использование `yargs` - тема для отдельной статьи. Я немного расскажу об этом, когда мы дойдем до разработки соответствующей части приложения.

## Подготовка и настройка проекта

Создаем директорию для проекта, переходим в нее и инициализируем _Node.js-проект_:

```bash
mkdir ts-package-manager
cd $!

yarn init -y
# or
npm init -y
```

Устанавливаем зависимости:

```bash
# производственные зависимости
yarn add find-up fs-extra js-yaml log-update node-fetch progress semver tar yargs
# or
npm i ...

# зависимости для разработки
# компилятор `tsc` и типы для пакетов
yarn add -D typescript @types/find-up @types/fs-extra @types/js-yaml @types/log-update @types/node-fetch @types/progress @types/semver @types/tar @types/yargs
# or
npm i -D ...
```

Редактируем файл _package.json_:

```json
{
  "name": "my-yarn",
  "private": false,
  "license": "MIT",
  "version": "0.0.1",
  "main": "dist/main.js",
  "bin": {
    "my-yarn": "dist/cli.js"
  },
  "files": [
    "dist"
  ],
  "engines": {
    "node": ">= 13.14.0"
  },
  "scripts": {
    "build": "tsc"
  },
  "type": "module",
  "devDependencies": {
    ...
  },
  "dependencies": {
    ...
  }
}
```

При запуске команды `my-yarn` будет выполняться код из файла _dist/cli.js_.

Создаем файл _tsconfig.json_ с настройками для компиляции _TS_ в _JS_ (настройками, которые будут использоваться _tsc_ при выполнении команды `build`):

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "lib": [
      "ESNext"
    ],
    "moduleResolution": "Node",
    "strict": true,
    "esModuleInterop": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "outDir": "dist"
  },
  "include": [
    "src"
  ]
}
```

Не забываем про файл _.gitignore_:

```bash
node_modules
dist
# если вы используете `yarn`
yarn-error.log
# если вы работаете на `mac`
.DS_Store
```

Все файлы нашего проекта будут находиться в директории _src_ и компилироваться в директорию _dist_. Структура директории _src_ будет следующей:

```
- cli.ts
- install.ts
- list.ts
- lock.ts
- log.ts
- main.ts
- resolve.ts
- utils.ts
```

С подготовкой и настройкой проекта мы закончили. Можно приступать к разработке _CLI_.

## CLI

Начнем с основного файла нашего _CLI_ - _main.ts_. В этом файле происходит следующее:

- функция _main_, вызываемая при выполнении команды `my-yarn install <packageName>`, в качестве аргумента принимает массив устанавливаемых пакетов, передаваемый _yargs_;
- находим и читаем файл _package.json_; предполагается, что он существует в проекте;
- извлекаем из аргумента названия устанавливаемых пакетов и расширяем ими _package.json_;
- читаем _lock-файл_; данный файл создается при отсутствии;
- получаем информацию о зависимостях на основе расширенного _package.json_;
- записываем обновленный _lock-файл_;
- устанавливаем пакеты;
- записываем обновленный _package.json_.

```js
import fs from 'fs-extra'
import { findUp } from 'find-up'
import yargs from 'yargs'
// обратите внимание, что мы импортируем `JS-файлы`
import * as utils from './utils.js'
import list, { PackageJson } from './list.js'
import install from './install.js'
import * as log from './log.js'
import * as lock from './lock.js'

export default async function main(args: yargs.Arguments) {
  // находим и читаем `package.json`
  const jsonPath = (await findUp('package.json'))!
  const root = await fs.readJson(jsonPath)

  // собираем новые пакеты, добавляемые с помощью `my-yarn install <packageName>`,
  // через аргументы `CLI`
  const additionalPackages = args._.slice(1)
  if (additionalPackages.length) {
    if (args['save-dev'] || args.dev) {
      root.devDependencies = root.devDependencies || {}

      // мы заполним эти объекты после получения информации о пакетах
      additionalPackages.forEach((pkg) => (root.devDependencies[pkg] = ''))
    } else {
      root.dependencies = root.dependencies || {}

      additionalPackages.forEach((pkg) => (root.dependencies[pkg] = ''))
    }
  }

  // в продакшне нас интересуют только производственные зависимости
  if (args.production) {
    delete root.devDependencies
  }

  // читаем `lock-файл`
  await lock.readLock()

  // получаем информацию о зависимостях
  const info = await list(root)

  // сохраняем `lock-файл` асинхронно
  lock.writeLock()

  /*
  * готовимся к установке
  * обратите внимание, что здесь мы повторно вычисляем количество пакетов
  *
  * по причине дублирования
  * количество разрешенных пакетов не будет совпадать
  * с количеством устанавливаемых пакетов
  */
  log.prepareInstall(
    Object.keys(info.topLevel).length + info.unsatisfied.length
  )

  // устанавливаем пакеты верхнего уровня
  await Promise.all(
    Object.entries(info.topLevel).map(([name, { url }]) => install(name, url))
  )

  // устанавливаем пакеты с конфликтами
  await Promise.all(
    info.unsatisfied.map((item) =>
      install(item.name, item.url, `/node_modules/${item.parent}`)
    )
  )

  // форматируем `package.json`
  beautifyPackageJson(root)

  // сохраняем `package.json`
  fs.writeJSON(jsonPath, root, { spaces: 2 })
}

// форматируем поля `dependencies` и `devDependencies`
function beautifyPackageJson(packageJson: PackageJson) {
  if (packageJson.dependencies) {
    packageJson.dependencies = utils.sortKeys(packageJson.dependencies)
  }

  if (packageJson.devDependencies) {
    packageJson.devDependencies = utils.sortKeys(packageJson.devDependencies)
  }
}
```

Рассмотрим утилиты для логгирования (_log.ts_):

- утилита `logResolving` выводит в терминал название устанавливаемого пакета;
- утилита `prepareInstall` сообщает о завершении разрешения устанавливаемых пакетов и создает индикатор прогресса установки;
- утилита `tickInstalling` обновляет индикатор прогресса установки после извлечения тарбала пакета.

```js
import logUpdate from 'log-update'
import ProgressBar from 'progress'

let progress: ProgressBar

// разрешаемый модуль
// по аналогии с `yarn`
export function logResolving(name: string) {
  logUpdate(`[1/2] Resolving: ${name}`)
}

export function prepareInstall(count: number) {
  logUpdate('[1/2] Finished resolving.')

  // индикатор прогресса установки
  progress = new ProgressBar('[2/2] Installing [:bar]', {
    complete: '#',
    total: count
  })
}

// обновляем индикатор прогресса
// после извлечения `tarball`
export function tickInstalling() {
  progress.tick()
}
```

Рассмотрим утилиты для работы с _lock-файлом_ (_lock.ts_):

- утилита `updateOrCreate` записывает информацию о пакете в _lock_;
- утилита `getItem` извлекает информацию о пакете по названию и версии;
- утилита `readLock` читает _lock_;
- утилита `writeLock` пишет _lock_.

```js
import { findUp } from 'find-up'
import fs from 'fs-extra'
import yaml from 'js-yaml'
import { Manifest } from './resolve.js'
import { Obj } from './utils.js'

interface Lock {
  // название пакета
  [index: string]: {
    // версия
    version: string
    // путь к тарбалу
    url: string
    // хеш-сумма (контрольная сумма) файла
    shasum: string
    // зависимости
    dependencies: { [dep: string]: string }
  }
}

// находим `lock-файл`
const lockPath = (await findUp('my-yarn.yml'))!

// зачем нам 2 отдельных `lock`?
// это может быть полезным при удалении пакетов

// при добавлении или удалении пакетов
// `lock` может обновляться автоматически

// старый `lock` предназначен только для чтения
const oldLock: Lock = Object.create(null)

// новый `lock` предназначен только для записи
const newLock: Lock = Object.create(null)

// записываем информацию о пакете в `lock`
export function updateOrCreate(name: string, info: Obj) {
  if (!newLock[name]) {
    newLock[name] = Object.create(null)
  }

  Object.assign(newLock[name], info)
}

/*
* извлекаем информацию о пакете по его названию и версии (семантическому диапазону)
* обратите внимание, что мы не возвращаем данные,
* а форматируем их для того,
* чтобы структура данных соответствовала реестру пакетов (`npm`)
* это позволяет сохранить логику функции `collectDeps`
* из модуля `list`
*/
export function getItem(name: string, constraint: string): Manifest | null {
  // извлекаем элемент `lock` по ключу,
  // формат вдохновлен `yarn.lock`
  const item = oldLock[`${name}@${constraint}`]

  if (!item) {
    return null
  }

  // преобразуем структуру данных
  return {
    [item.version]: {
      dependencies: item.dependencies,
      dist: { tarball: item.url, shasum: item.shasum }
    }
  }
}

// читаем `lock`
export async function readLock() {
  if (await fs.pathExists(lockPath)) {
    Object.assign(oldLock, yaml.load(await fs.readFile(lockPath, 'utf-8')))
  }
}

// сохраняем `lock`
export async function writeLock() {
  // необходимость сортировки ключей обусловлена тем,
  // что при каждом использовании менеджера
  // порядок пакетов будет разным
  //
  // сортировка может облегчить сравнение версий `lock` с помощью `git diff`
  await fs.writeFile(
    lockPath,
    yaml.dump(newLock, { sortKeys: true, noRefs: true })
  )
}
```

Утилита для установки пакета (_install.ts_):

```js
import fetch from 'node-fetch'
import tar from 'tar'
import fs from 'fs-extra'
import * as log from './log.js'

export default async function install(
  name: string,
  url: string,
  location = ''
) {
  // путь к директории для устанавливаемого пакета
  const path = `${process.cwd()}${location}/node_modules/${name}`

  // создаем директории рекурсивно
  await fs.mkdirp(path)

  const response = await fetch(url)

  /*
  * тело ответа - это поток данных, доступный для чтения
  * (readable stream, application/octet-stream)
  *
  * `tar.extract` принимает такой поток
  * это позволяет извлекать содержимое напрямую -
  * без его записи на диск
  */
  response
    .body!.pipe(tar.extract({ cwd: path, strip: 1 }))
    // обновляем индикатор прогресса установки после извлечения тарбала
    .on('close', log.tickInstalling)
}
```

Утилита для сортировки ключей объекта (_utils.ts_):

```js
export type Obj = { [key: string]: any }

export const sortKeys = (obj: Obj) =>
  Object.keys(obj)
    .sort()
    .reduce((_obj: Obj, cur) => {
      _obj[cur] = obj[cur]
      return _obj
    }, Object.create(null))
```

Теперь рассмотрим, пожалуй, самое интересное - формирование списка зависимостей верхнего уровня и зависимостей с конфликтами (дубликатов) в файле _list.ts_.

Импортируем пакеты, определяем типы и переменные:

```js
import semver from 'semver'
import resolve from './resolve.js'
import * as log from './log.js'
import * as lock from './lock.js'
import { Obj } from './utils.js'

type DependencyStack = Array<{
  name: string
  version: string
  dependencies: Obj
}>

export interface PackageJson {
  dependencies?: Obj
  devDependencies?: Obj
}

// переменная `topLevel` предназначена для выравнивания (flatten)
// дерева пакетов во избежание их дублирования
const topLevel: {
  [name: string]: { version: string; url: string }
} = Object.create(null)

// переменная `unsatisfied` предназначена для аккумулирования конфликтов (дублирующихся пакетов)
const unsatisfied: Array<{ name: string; url: string; parent: string }> = []
```

Определяем функцию для формирования списка зависимостей `collectDeps`:

```js
// @ts-ignore
async function collectDeps(
  name: string,
  constraint: string,
  stack: DependencyStack = []
) {
  // извлекаем манифест пакета из `lock` по названию и версии
  const fromLock = lock.getItem(name, constraint)

  // получаем информацию о манифесте
  //
  // если манифест отсутствует в `lock`,
  // получаем его из сети
  const manifest = fromLock || (await resolve(name))

  // выводим в терминал название разрешаемого пакета
  log.logResolving(name)

  // используем версию пакета,
  // которая ближе всего к семантическому диапазону
  //
  // если диапазон не определен,
  // используем последнюю версию
  const versions = Object.keys(manifest)
  const matched = constraint
    ? semver.maxSatisfying(versions, constraint)
    : versions.at(-1)
  if (!matched) {
    throw new Error('Cannot resolve suitable package.')
  }

  // если пакет отсутствует в `topLevel`
  if (!topLevel[name]) {
    // добавляем его
    topLevel[name] = { url: manifest[matched].dist.tarball, version: matched }
  // если пакет имеется в `topLevel` и удовлетворяет диапазону
  } else if (semver.satisfies(topLevel[name].version, constraint)) {
    // определяем наличие конфликтов
    const conflictIndex = checkStackDependencies(name, matched, stack)

    // пропускаем проверку зависимостей при наличии конфликта
    // это позволяет избежать возникновения циклических зависимостей
    if (conflictIndex === -1) return

    /*
    * из-за особенностей алгоритма, используемого `Node.js`
    * для разрешения модулей,
    * между зависимостями зависимостей могут возникать конфликты
    *
    * одним из решений данной проблемы
    * является извлечение информации о двух предыдущих зависимостях зависимости,
    * конфликтующих между собой
    */
    unsatisfied.push({
      name,
      parent: stack
        .map(({ name }) => name)
        .slice(conflictIndex - 2)
        .join('/node_modules/'),
      url: manifest[matched].dist.tarball
    })
  // если пакет уже содержится в `topLevel`
  // но имеет другую версию
  } else {
    unsatisfied.push({
      name,
      parent: stack.at(-1)!.name,
      url: manifest[matched].dist.tarball
    })
  }

  // не забываем о зависимостях зависимости
  const dependencies = manifest[matched].dependencies || null

  // записываем манифест в `lock`
  lock.updateOrCreate(`${name}@${constraint}`, {
    version: matched,
    url: manifest[matched].dist.tarball,
    shasum: manifest[matched].dist.shasum,
    dependencies
  })

  // собираем зависимости зависимости
  if (dependencies) {
    stack.push({
      name,
      version: matched,
      dependencies
    })
    await Promise.all(
      Object.entries(dependencies)
        // предотвращаем циклические зависимости
        .filter(([dep, range]) => !hasCirculation(dep, range, stack))
        .map(([dep, range]) => collectDeps(dep, range, stack.slice()))
    )
    // удаляем последний элемент
    stack.pop()
  }

  // возвращаем семантический диапазон версии
  // для добавления в `package.json`
  if (!constraint) {
    return { name, version: `^${matched}` }
  }
}
```

Определяем 2 вспомогательные функции:

```js
// данная функция определяет наличие конфликтов в зависимостях зависимости
const checkStackDependencies = (
  name: string,
  version: string,
  stack: DependencyStack
) =>
  stack.findIndex(({ dependencies }) =>
    // если пакет не является зависимостью другого пакета,
    // возвращаем `true`
    !dependencies[name] ? true : semver.satisfies(version, dependencies[name])
  )

// данная функция определяет наличие циклической зависимости
//
// если пакет содержится в стеке и имеет такую же версию
// значит, имеет место циклическая зависимость
const hasCirculation = (name: string, range: string, stack: DependencyStack) =>
  stack.some(
    (item) => item.name === name && semver.satisfies(item.version, range)
  )
```

Наконец, определяем основную функцию:

```js
// наша программа поддерживает только поля
// `dependencies` и `devDependencies`
export default async function list(rootManifest: PackageJson) {
  // добавляем в `package.json` названия и версии пакетов

  // обрабатываем производственные зависимости
  if (rootManifest.dependencies) {
    ;(
      await Promise.all(
        Object.entries(rootManifest.dependencies).map((pair) =>
          collectDeps(...pair)
        )
      )
    )
      .filter(Boolean)
      .forEach(
        (item) => (rootManifest.dependencies![item!.name] = item!.version)
      )
  }

  // обрабатываем зависимости для разработки
  if (rootManifest.devDependencies) {
    ;(
      await Promise.all(
        Object.entries(rootManifest.devDependencies).map((pair) =>
          collectDeps(...pair)
        )
      )
    )
      .filter(Boolean)
      .forEach(
        (item) => (rootManifest.devDependencies![item!.name] = item!.version)
      )
  }

  // возвращаем пакеты верхнего уровня и пакеты с конфликтами
  return { topLevel, unsatisfied }
}
```

Определяем интерфейс командной строки (_cli.ts_):

```js
#!/usr/bin/env node
import yargs from 'yargs'
import main from './main.js'

yargs
  // пример использования
  .usage('my-yarn <command> [args]')
  // получение информации о версии
  .version()
  // псевдоним
  .alias('v', 'version')
  // получение информации о порядке использования
  .help()
  // псевдоним
  .alias('h', 'help')
  // единственной командной, выполняемой нашим `CLI`,
  // будет команда `add`
  // данная команда предназначена для установки зависимостей
  .command(
    'add',
    'Install dependencies',
    (argv) => {
      // по умолчанию устанавливаются производственные зависимости
      argv.option('production', {
        type: 'boolean',
        description: 'Install production dependencies only'
      })

      // при наличии флагов `save-dev`, `dev` или `D`
      // выполняется установка зависимостей для разработки
      argv.boolean('save-dev')
      argv.boolean('dev')
      argv.alias('D', 'dev')

      return argv
    },
    // при выполнении команды `yarn add <packageName>`
    // запускается код из файла `main.js`
    main
  )
  // парсим аргументы, переданные `CLI`
  .parse()
```

На этом разработка нашего `CLI` завершена. Пришло время убедиться в его работоспособности.

## Пример

Выполняем сборку проекта с помощью команды `yarn build` или `npm run build`.

<img src="https://habrastorage.org/webt/7w/5l/cd/7w5lcdrhingn8qs5vmboa0zzjiu.png" alt="" />
<br />

Это приводит к генерации директории _dist_ с _JS-файлами_ проекта.

<img src="https://habrastorage.org/webt/8k/8h/3s/8k8h3sgiy6aotn8wg7zq52jbmzy.png" alt="" />
<br />

Находясь в корневой директории, подключаем наш _CLI_ к _npm_ с помощью команды [npm link](https://docs.npmjs.com/cli/v8/commands/npm-link) (данная команда позволяет тестировать разрабатываемые пакеты локально) и получаем список глобально установленных пакетов с помощью команды `npm -g list --depth 0`.

<img src="https://habrastorage.org/webt/rw/qr/w0/rwqrw0yainnkdzbjfqdl7y9rxyc.png" alt="" />
<br />

Видим в списке глобальных пакетов `my-yarn@0.0.1`. Для удаления _my-yarn_ необходимо выполнить команду `npm -g rm my-yarn`.

Получаем информацию о версии _my-yarn_ с помощью команды `my-yarn -v` и информацию о порядке использования _CLI_ с помощью команды `my-yarn -h`.

<img src="https://habrastorage.org/webt/5c/1i/yh/5c1iyhggene8logcmei5jzl7zy4.png" alt="" />
<br />

Разработаем простой сервер на [Express](https://expressjs.com/ru/), который будет запускаться в режиме для разработки и возвращать некоторую статическую разметку.

Создаем директорию _my-yarn_, переходим в нее и инициализируем _Node.js-проект_:

```bash
mkdir my-yarn
cd $!

yarn init -yp
# или
npm init -y
```

Создаем файл _index.html_ следующего содержания:

```html
<!DOCTYPE html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>MyYarn</title>
  </head>
  <body>
    <h1>MyYarn - простой пакетный менеджер</h1>
  </body>
</html>
```

И такой файл _index.js_:

```js
// для того, чтобы иметь возможность использовать `ESM`,
// необходимо определить `"type": "module"` в файле `package.json`
import express from 'express'

const app = express()

// возвращаем статику при получении `GET-запроса` по адресу `/my-yarn`
app.get('/my-yarn', (_, res) => {
  res.sendFile(`${process.cwd()}/index.html`)
})

const PORT = process.env.PORT || 3124
// запускаем сервер
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`)
})
```

Для работы сервера требуется пакет [express](https://www.npmjs.com/package/express), а для его запуска в режиме для разработки - пакет [nodemon](https://www.npmjs.com/package/nodemon). Мы выполним установку этих пакетов с помощью нашего _CLI_.

Находясь в директории _my-yarn_, устанавливаем _express_ с помощью команды `my-yarn add express` и _nodemon_ с помощью команды `my-yarn add -D nodemon`.

<img src="https://habrastorage.org/webt/q6/zz/lz/q6zzlzszljmbdycgbdzwlo9xdye.png" alt="" />
<br />

Это приводит к генерации директории `node_modules`, файла _my-yarn.yml_ и обновлению файла _package.json_.

Добавляем команду для запуска сервера для разработки в _package.json_:

```javascripton
"scripts": {
  "dev": "node_modules/nodemon/bin/nodemon.js"
}
```

_Обратите внимание_: наш _CLI_ не умеет выполнять скрипты, поэтому для запуска команды _dev_ мы будем использовать _yarn_. Однако, поскольку мы устанавливали зависимости с помощью _my-yarn_, у нас отсутствует файл _yarn.lock_, который используется _yarn_ для разрешения путей к пакетам. Это обуславливает необходимость указания полного пути к выполняемому файлу _nodemon_.

Запускаем сервер для разработки с помощью команды `yarn dev`.

<img src="https://habrastorage.org/webt/xl/ud/ja/xludja-5b5h6jwiduys0nl13sem.png" alt="" />
<br />

Получаем сообщение о готовности сервера к обработке запросов.

Открываем вкладку браузера по адресу _http://localhost:3124/my-yarn_.

<img src="https://habrastorage.org/webt/lb/zv/mm/lbzvmm50naadaiumlas6bi-0ffi.png" alt="" />
<br />

Получаем наш _index.html_.

Отлично. Приложение работает, как ожидается.

Пожалуй, это все, о чем я хотел рассказать вам в этой статье. Надеюсь, вам было интересно и вы не жалеете потраченного времени.

Благодарю за внимание и happy coding!