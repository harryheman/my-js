---
sidebar_position: 18.2
title: Шпаргалка по Express API
description: Шпаргалка по Express API
keywords: ['javascript', 'js', 'node.js', 'nodesj', 'node', 'express.js', 'expressjs', 'express', 'cheatsheet', 'шпаргалка', 'фреймворк для разработки веб-серверов']
tags: ['javascript', 'js', 'node.js', 'nodesj', 'node', 'express.js', 'expressjs', 'express', 'cheatsheet', 'шпаргалка', 'фреймворк для разработки веб-серверов']
---

# Express API

> `Express` - самый популярный на сегодняшний день `Node.js-фреймворк` для разработки веб-серверов.

[Официальное руководство по `Express` на русском языке](https://expressjs.com/ru/).

## express

Создает приложение `Express`.

```js
const express = require('express')
const app = express()
```

## Методы

### express.json(options?)

Встроенный посредник, разбирающий входящие запросы в объект в формате JSON. основан на `body-parser`. Разобранные данные попадают в тело запроса (`req.body`). Если данных в запросе не было, `Content-Type` отличается от `application/json` или возникла ошибка, то возвращается пустой объект (`{}`).

```js
app.use(express.json())
```

*Обратите внимание*: форма `req.body` определяется пользователем, поэтому все свойства и значения этого объекта являются ненадежными (untrusted) и должны проходить валидацию перед использованием.

#### Настройки (options)

- `inflate: true` - обработка сжатых данных
- `limit: '100kb'` - максимальный размер тела запроса в виде числа (байты) или строки (разбирается с помощью библиотеки `bytes`)
- `reviver: null` - второй аргумент, передаваемый в `JSON.parse()`
- `strict: true` - обработка только массивов и объектов
- `type: 'application/json'` - определение медиа-типа, разбираемого посредником в виде строки, массива строк или функции
- `verify: undefined` - `verify(req, res, buf, encoding)`, где `buf` - это `Buffer` необработанного (raw) тела запроса, а `encoding` - кодировка запроса

### express.static(root, options?)

Встроенный посредник для обслуживания (serve) статических файлов. Основан на библиотеке `serve-static`.

`root` - корневая директория со статическими файлами. Файлы для обслуживанию определяются посредством комбинации `req.url` с `root`. Если запрашиваемый файл отсутствует, то вместо ответа 404, вызывается `next()` для передачи управления следующему посреднику, который может предоставлять резервный контент.

#### Настройки

- `dotfiles: 'ignore'` - обработка файлов, начинающихся с точки, например, `.env`
- `etag: true` - генерация <a href="https://ru.wikipedia.org/wiki/HTTP_ETag">`etag`</a>
- `extensions: false` - расширения резервных файлов, например, `['html', 'htm']`
- `fallthrough: true` - позволяет клиентским ошибкам проваливаться в качестве необработанных запросов
- `immutable: false` - управление директивой `immutable` в заголовке ответа `Cache-Control`. Если включено, для управления кэшированием также должна быть определена настройка `maxAge`. Директива `immutable` запрещает клиентам делать условные запросы для определения изменений файла в течение `maxAge`
- `index: 'index.html'` - индексируемый (главный) файл директории
- `lastModified: true` - устанавливает заголовок `Last-Modified` со временем последнего изменения
- `maxAge: 0` - время жизни (максимальный возраст) кэша в мс или в виде строки
- `redirect: true` - перенаправление к завершающему `/` в случае, когда название пути - это директория
- `setHeaders` - функция для установки заголовков для обслуживаемого файла. Сигнатура: `fn(res, path, stat)`, где `res` - объект ответа, `path` - адрес файла для отправки, `stat` - объект со статистикой файла для отправки

#### Пример

Из документации:

```js
const options = {
  dotfiles: 'ignore',
  etag: false,
  extensions: ['htm', 'html'],
  index: false,
  maxAge: '1d',
  redirect: false,
  setHeaders: function (res, path, stat) {
    res.set('x-timestamp', Date.now())
  }
}

app.use(express.static('public', options))
```

Обычно, нам не нужны настройки, но необходимо правильно определить путь к `root`:

```js
app.use(express.static(path.join(__dirname, 'public'))) // path.resolve()
```

### express.Router(options?)

Создает новый объект роутера.

```js
const router = express.Router()
// или
const router = require('express').Router()
```

#### Настройки

- `caseSensitive: false` - чувствительность к регистру (`/Foo` и `/foo` - одинаковые маршруты)
- `mergeParams: false` - если дочерние и родительские параметры совпадают, дочерние имеют приоритет
- `strict: false` - строгая маршрутизация (`/foo` и `/foo/` - одинаковые маршруты)

### express.urlencoded(options?)

Встроенный посредник, разбирающий полезную нагрузку строки запроса (например, в `application/x-www-form-urlencoded` значения кодируются в кортежах с ключом, разделенных символом `&`, с `=` между ключом и значением: `?foo=bar&baz=qux`). Основан на `body-parser`. В целом, поведение аналогично `express.json()`.

#### Настройки

- `extended: true` - библиотека для разбора строки запроса: `qs` - `true`, `querystring` - `false`. Грубо говоря, `extended: true` означает, что `req.body` может содержать любые значения, `extended: false` - только строки
- `inflate: true` - см. `express.json()`
- `limit: '100kb'` - см. `express.json()`
- `parameterLimit: 1000` - максимальное количество параметров
- `type: application/x-www-form-urlencoded` - см. `express.json()`
- `verify: undefined` - см. `express.json()`

## Application (приложение)

Приложение `Express`.

```js
const express = require('express')
const app = express()

app.get('/', (req, res) => {
  res.send('Привет, народ!')
})
```

Объект `app` содержит методы для

- роутинга HTTP-запросов, например, `app.METHOD` и `app.param`
- настройки посредников, `app.route()`
- рендеринга представлений (views) HTML, `app.render()`
- регистрации шаблонизаторов, `app.engine()`

### Свойства

#### app.locals

Объект, свойства которого являются локальными переменными приложения:

```js
console.log(app.locals.title) // My App
console.log(app.locals.email) // my@email.com
```

После установки, значения свойств `app.locals` будут существовать на протяжении всего жизненного цикла приложения, в отличие от `res.locals`, которые являются валидными только на протяжении жизненного цикла запроса.

Локальные переменные доступны в шаблонах, которые рендерятся в приложении. Они также доступны в посредниках через `req.app.locals`.

```js
app.locals.title = 'My App'
app.locals.email = 'my@email.com'
```

#### app.mountpath

Данное свойство содержит один или более паттернов путей монтирования субприложений (sub-apps - экземпляр `express`, который может использоваться для обработки запроса к маршруту):

```js
const express = require('express')

const app = express() // основное приложение
const admin = express() // дополнительное приложение

admin.get('/', (req, res) => {
  console.log(admin.mountpath) // /admin
  res.send('Admin Homepage')
})

app.use('/admin', admin) // монтирование дополнительного приложения
```

Это похоже на свойство `baseUrl` объекта `req`, за исключением того, что `req.baseUrl` возвращает совпавший путь URL, а не совпавшие паттерны.

- `app.router` - встроенный экземпляр роутера. Создается автоматически при первом доступе

```js
const express = require('express')
const app = express()
const { router } = app

router.get('/', (req, res) => {...})

app.listen(5000)
```

### События

#### app.on('mount', callback(parent))

Событие, возникающее при монтировании дополнительного приложения в родительское. Последнее передается в колбек.

*Обратите внимание*: дополнительные приложения не наследуют дефолтные настройки родительского приложения, но наследуют кастомные.

```js
const admin = express()

admin.on('mount', (parent) => {
  console.log('Admin Mounted')
  console.log(parent) // ссылка на родительское приложение
})

admin.get('/', (req, res) => {...})

app.use('/admin', admin)
```

### Методы

#### app.all(path, callback)

Данный метод похож на обычные методы `app.METHOD()`, но совпадает для всех глаголов HTTP.

Аргументы

- `path: '/'` - путь для которого вызывается посредник в виде строки, паттерна, регулярного выражения, массива
- `callback` - посредник, несколько посредников, разделенных запятыми, массив посредников, их комбинация

Следующий колбек выполняется для запросов к `/secret` при использовании любого HTTP-метода (GET, POST, PUT, DELETE и т.д.):

```js
app.all('/secret', (req, res, next) => {
  console.log('Доступ к закрытому разделу...')
  next() // передаем управление следующему обработчику
})
```

Проверка аутентификации и загрузка данных пользователя:

```js
app.all('*', requireAuthentication, loadUser)
```

Пример выполнения колбека для запросов к путям, которые начинаются с `/api`:

```js
app.all('/api/*', requireAuthentication)
```

#### app.delete(path, callback)

Вызывает колбек при DELETE-запросах к `path`. Аргументы идентичны аргументам `app.all()`.

```js
app.delete('/user/remove/:id', async (req, res) => {
  try {
    // извлекаем `id` из параметров запроса
    const { id } = req.params
    // используем Mongoose-модель `User` для поиска пользователя по `id`
    const user = await User.findById(id)
    // сравниваем пароли
    // в реальном приложении пароль пользователя
    // хешируется перед сохранением пользователя в базе данных
    // соответственно, логика сравнения паролей будет сложнее
    const match = user.password === req.body.password
    // если пароли не совпадают
    if (!match) return res.status(400).json({ error: 'Введен неверный пароль' })
    // удаляем пользователя
    await User.findByIdAndRemove(id)
    res.sendStatus(200)
  } catch (err) {
    res.sendStatus(500)
  }
})
```

#### app.disable(name) и app.enable(name)

`app.disable(name)` устанавливает значение настройки приложения (`name`) в значение `false`. `app.enable(name)` включает настройку.

#### app.disabled(name) и app.enabled(name)

`app.disabled(name)` возвращает `true`, если настройка отключена. `app.enabled(name)` - если настройка включена.

#### app.engine(ext, callback)

Регистрирует колбек шаблонизатора как `ext`. Используется для шаблонизаторов, которые не предоставляют `.__express` из коробки. Пример привязки `EJS` к файлам с расширением `.html`:

```js
app.engine('html', require('ejs').renderFile)
```

#### app.get(name)

Возвращает значение настройки приложения (`name`). Не путайте со следующим методом.

#### app.get(path, callback)

Вызывает колбек при GET-запросах к `path`. Аргументы идентичны аргументам `app.all()`.

Пример использования фреймворка `Passport.js` для аутентификации с помощью Google-аккаунта.

```js
app.get('/google',
  passport.authenticate('google', {
    scope: ['profile']
  }))
```

#### app.listen(path, callback?)

Запускает UNIX-сокет и регистрирует соединения по указанному адресу. Не путайте со следующим методом. Данный метод идентичен `http.Server.listen()` из `Node.js`.

#### app.listen(port, host?, backlog?, callback)

Привязывает приложение (binds) и регистрирует соединения по определенному порту и хосту. Данный метод также идентичен `http.Server.listen()`.

Если порт не указан или его значением является `0`, операционная система использует произвольный порт.

```js
const express = require('express')
const app = express()
app.listen(process.env.PORT || 5000)
```

Приложение, возвращаемое `express()` - в действительности, всего лишь функция, спроектированная для передачи в качестве колбека для обработки запросов в Node.js-сервер. Это позволяет реализовать HTTP и HTTPS версии приложения с помощью одной кодовой базы:

```js
const express = require('express')
const https = require('https')
const http = require('http')
const app = express()

http.createServer(app).listen(80)
https.createServer(options, app).listen(443)
```

Метод `app.listen()` возвращает объект `http.Server`, который (для HTTP) выглядит следующим образом:

```js
app.listen = function () {
  const server = http.createServer(this)
  return server.listen.apply(server, arguments)
}
```

### app.METHOD(path, callback)

Вызывает колбек при HTTP-запросах к `path` c использованием указанного `METHOD`. Аргументы идентичны аргументам `app.all()`.

#### Методы маршрутизации

`Express` поддерживает следующие методы HTTP-запросов:

- `checkout`
- `copy`
- `delete`
- `get`
- `head`
- `lock`
- `merge`
- `mkactivity`
- `mkcol`
- `move`
- `m-search`
- `notify`
- `options`
- `patch`
- `post`
- `purge`
- `put`
- `report`
- `search`
- `subscribe`
- `trace`
- `unlock`
- `unsubscribe`

В документации описываются наиболее популярные методы (GET, POST, PUT и DELETE), но другие методы работают точно также.

Для методов, которые преобразуются в невалидные названия переменных, следует использовать скобочную нотацию, например, `app['m-search']('/', (req, res) => {...})`.

### app.param(name, callback)

Добавляем колбек, запускаемый для параметров маршрута, где `name` - название параметра или массив таких названий. Параметрами колбека являются: объект запроса, объект ответа, посредник `next()`, значение параметра и его название (именно в таком порядке).

Если `name` - это массив, `callback` регистрируется для каждого параметра в том порядке, в котором они определены. Более того, для каждого параметра, кроме последнего, вызов `next()` запускает колбек для следюущего параметра. Вызов `next()` в колбеке последнего параметра передает управление следующему посреднику.

Например, когда в адресе маршрута имеется `:user`, можно реализовать логику загрузки данных пользователя для автоматического предоставления `req.user` маршрутизатору или выполнить валидацию входящего параметра:

```js
app.param('user', async (req, res, next, id) => {
  try {
    // пробуем получить данные пользователя и прикрепить их к объекту запроса
    const user = await User.findById(id)
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' })
    req.user = user
    next()
  } catch (err) {
    next(err)
  }
})
```

Колбек является локальным для роутера, на котором он определен.

Такие колбеки вызываются перед другими обработчиками, в которых появляется данный параметр, и они вызываются только один раз в цикле запрос-ответ, даже если параметр совпадает для нескольких маршрутизаторов:

```js
app.param('id', (req, res, next, id) => {
  console.log('Вызывается только один раз')
  next()
})

app.get('/user/:id', (req, res, next) => {
  console.log('Параметр совпадает с этим маршрутизатором')
  next()
})

app.get('/user/:id', (req, res) => {
  console.log('И с этим тоже')
  res.end()
})
```

При запросе `/user/42`, вывод в консоли будет следующим:

```
Вызывается только один раз
Параметр совпадает с этим маршрутизатором
И с этим тоже
```

```js
app.param(['id', 'page'], (req, res, next, value) => {
  console.log('Вызывается только один раз со значением ', value)
  next()
})

app.get('/user/:id/:page', (req, res, next) => {
  console.log('Есть совпадение')
  next()
})

app.get('/user/:id/:page', (req, res) => {
  console.log('И еще одно')
  res.end()
})
```

При запросе `/user/42/3` вывод в консоли будет таким:

```
Вызывается только один раз со значением 42
Вызывается только один раз со значением 3
Есть совпадение
И еще одно
```

### app.path()

Возвращает канонический путь приложения. Обычно, для получения такого пути лучше использовать `req.baseUrl()`.

### app.post(path, callback)

Вызывает колбек при POST-запросах к `path`. Аргументы идентичны аргументам `app.all()`.

Пример сохранения данных пользователя в базе данных:

```js
// в реальных приложениях записи данных пользователя в БД
// предшествует валидация этих данных,
// например, с помощью посредника `express-validator`
app.post('/user/register', registerValidators, async (req, res) => {
  const { username, password } = req.body

  // также перед тем, как сохранить пароль пользователя в БД,
  // он подвергается хешированию, например, с помощью библиотеки `bcrypt`
  const hashedPassword = await generatePassword(password)

  try {
    const newUser = new User({
      username,
      hashedPassword
    })

    const savedUser = await newUser.save()

    // для проверки аутентификации пользователя
    // используются токены, сгенерированные, например,
    // с помощью библиотеки `jsonwebtoken` (один из возможных вариантов)
    const token = generateToken(savedUser)

    res.status(200).json({ user: savedUser, token })
  } catch (err) {
    res.sendStatus(500)
  }
})
```

### app.put(path, callback)

Вызывает колбек при PUT-запросах к `path`. Аргументы идентичны аргументам `app.all()`.

Пример обновления поста:

```js
// проверка аутентификации с помощью `passport`
app.use(passport.authenticate('jwt', { session: false }))

app.put('/post/update/:id', async (req, res) => {
  try {
    await Post.findByIdAndUpdate(req.params.id, req.body)

    res.sendStatus(200)
  } catch (err) {
    res.sendStatus(500)
  }
})
```

### app.render(view, locals?, callback)

Возвращает отрендеренные HTML представления через колбек. Принимает опциональный параметр - объект с локальными переменными для представления. Похож на `res.render()`, но не может автоматически отправлять отрендеренные представления клиенту. `res.render()` использует `app.render()` для рендеринга представления.

### app.route(path)

Возвращает экземпляр роутера, который можно использовать для обработки HTTP-запросов с опциональными посредниками. Позволяет избежать дублирования названий маршрутов и связанных с этим ошибок:

```js
const app = express()

app.route('/events')
  .all((req, res, next) => {
    // запускается для всех запросов
  })
  .get((req, res, next) => {
    res.json()
  })
  .post((res, req, next) => {...})
```

### app.set(name, value)

Присваивает значение указанной настройке. Можно сохранять любые значения, кроме зарезервированных (см. ниже).

Вызов `app.set('foo', true)` идентичен вызову `app.enable('foo')`, а вызов `app.set('foo', false)` - `app.disable('foo')`.

Значение настройки можно получить с помощью `app.get()`:

```js
app.set('title', 'My Site')
app.get('title') // My Site
```

#### Настройки приложения

*Обратите внимание*, что дополнительные приложения не наследуют дефолтные настройки, но наследуют некоторые кастомные.

- `case sensitive routing: undefined` - чувствительная к регистру маршрутизация
- `env: process.env.NODE_ENV | 'development' (process.env.NODE_ENV === undefined)` - режим окружения
- `etag: weak` - устанавливает заголовок `Etag`
- `jsonp callback name: 'callback'` - определяет дефолтное название колбека JSONP
- `json escape: undefined` - включает обезвреживание JSON-ответов из `res.json`, `res.jsonp` и `res.send`. Наследуется субприложениями
- `json replacer: undefined` - аргумент `replacer` метода `JSON.stringify()`. Наследуется субприложениями
- `json spaces: undefined` - аргумент `space` метода `JSON.stringify()`. Наследуется субприложениями
- `query parser: 'extended'` - отключает разбор строки запроса при `false`, `simple` - `querystring`, `extended` - `qs`. Кастомный парсер получает полную строку запроса и должен вернуть объект с ключами строки и ее значениями
- `strict routing: undefined` - строгая маршрутизация. Наследуется субприложениями
- `subdomain offset: 2` - количество разделенных точкой частей хоста, удаляемых при доступе к поддомену
- `trust proxy: false` - указывает, что приложение использует прокси сервер, а также что для определения соединения и IP адреса клиента следует использовать заголовки `X-Forwarded-*`. *Обратите внимание*: названные заголовки легко подделываются, обнаруженные IP являются ненадежными. Массив IP, используемых клиентом для соединения, хранится в `req.ips`. Данная настройка реализована с помощью пакета `proxy-addr`. Наследуется субприложениями
- `views: process.cwd() + '/views'` - директория или массив для представлений приложения
- `view cache: true (production) | undefined` - кэширование компиляции шаблонов представлений
- `view engine: undefined` - дефолтное расширение движка рендеринга. Наследуется субприложениями
- `x-powered-by: true` - включает заголовок `X-Powered-By: Express`

### app.use(path?, callback, callback?)

Монтирует определенного посредника (или посредников) в указанный путь: посредник выполняется при совпадении запрошенного адреса с аргументом `path`. Аргументы идентичны аргументам `app.all()`.

#### Описание

Если маршрут совпадает с путем, то количество переходов не имеет значения. Например, `app.use('/apple', ...)` будет совпадать с `/apple`, `/apple/images`, `/apple/images/news` и т.д.

Поскольку путем по умолчанию является `/`, посредник без пути будет выполняться для любого запроса:

```js
app.use((req, res, next) => {
  console.log(`Текущее время ${new Date().toLocaleTimeString()}`)
  next()
})
```

Посредники выполняются последовательно, так что порядок их добавления (включения) в приложение очень важен:

```js
// данный посредник не позволит запросу выйти за его пределы
app.use((req, res, next) => {
  res.send('Ты со мной навсегда')
})

// запросы никогда не достигнут этого маршрута
app.get('/', (req, res) => {
  res.send('I miss you')
})
```

#### Посредники для обработки ошибок

Посредники для обработки ошибок отличаются от обычных посредников тем, что принимают 4 аргумента вместо 3. *Обратите внимание*: даже если вам не нужен метод `next()`, вы все равно должны его указать для соблюдения сигнатуры, в противном случае, посредник будет интерпретирован как обычный:

```js
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('Что-то сломалось')
})
```

#### Примеры путей

```js
/* path - путь */
// совпадает с путями, начинающимися с `/abcd`
app.use('/abcd', ...)

/* path pattern - паттерн пути */
// совпадает с `/abcd` и `/abd`
app.use('/abc?d', ...)

// совпадает с путями, которые начинаются с `/abcd`, `/abbcd`, `/abbbbbcd` и т.д.
app.use('/ab+cd', ...)

// совпадает с путями, которые начинаются с `/abcd`, `/abxcd`, `/abFOOcd`, `/abbArcd` и т.д.
app.use('/ab*cd', ...)

// совпадает с путями, начинающимися с `/ad` и `/abcd`
app.use('/a(bc)?d', ...)

/* регулярное выражение */
// совпадает с путями, начинающимися с `/abc` и `/xyz`
app.use(/\/abc|\/xyz/, ...)

/* массив */
// совпадает с путями, которые начинаются с `/abcd`, `/xyza`, `/lmn` и `/pqr`
app.use(['/abcd', '/xyza', /\/lmn|\/pqr/], ...)
```

#### Примеры посредников

В приведенных ниже примерах используется `app.use()`, но то же самое справедливо и в отношении `app.METHOD()` и `app.all()`.

```js
/* единичный посредник */
app.use((req, res, next) => {
  next()
})

// роутер - это валидный посредник
const router = express.Router()
router.get('/', (req, res, next) => {
  next()
})
app.use(router)

// приложение `Express` - это также валидный посредник
const sub = express()
sub.get('/', (req, res, next) => {
  next()
})
app.use(sub)

/* несколько посредников */
const r1 = express.Router()
rq.get('/', (req, res, next) => {
  next()
})

const r2 = express.Router()
r2.get('/', (req, res, next) => {
  next()
})

app.use(r1, r2)

/* массив */
const r1 = express.Router()
rq.get('/', (req, res, next) => {
  next()
})

const r2 = express.Router()
r2.get('/', (req, res, next) => {
  next()
})

app.use([r1, r2])

/* комбинация */
function mw1 (req, res, next) { next() }
function mw2 (req, res, next) { next() }

const r1 = express.Router()
r1.get('/', function (req, res, next) { next() })

const r2 = express.Router()
r2.get('/', function (req, res, next) { next() })

const sub = express()
sub.get('/', function (req, res, next) { next() })

app.use(mw1, [mw2, r1, r2], sub)
```

Примеры использования посредника `express.static()`:

```js
// обслуживание статического контента из директории `public`
// GET /style.css и т.д.
app.use(express.static(path.join(__dirname, 'public')))

// запрос должен иметь префикс `/static`
app.use('/static', express.static(path.join(__dirname, 'public')))

// отключает логгирование для статического контента
app.use(express.static(path.join(__dirname, 'public')))
app.use(morgan())

// несколько директорий со статическими файлами (`static` имеет приоритет)
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.static(path.join(__dirname, 'files')))
app.use(express.static(path.join(__dirname, 'uploads')))
```

## Request (запрос)

Объект `req` представляет собой HTTP запрос и содержит свойства для строки запроса (query string), параметров (parameters), тела (body), HTTP заголовков (HTTP headers) и т.д. Название `req` - это всего лишь соглашение, данный объект, как и объект `res` (response, ответ), могут называться как угодно, но лучше придерживаться соглашения.

```js
app.get('/', (req, res) => {
  res.send(`user ${req.params.id}`)
})
```

## Свойства

### req.app

Данное свойство содержит ссылку на экземпляр приложения, которое использует посредника. Например, если мы создаем модуль, который экспортирует посредника, и `require()` его в главном файле, тогда посредник может получить доступ к приложению через `req.app`:

```js
// index.js
app.get('/viewdir', require('./middleware.js'))
```

```js
// middleware.js
module.exports = (req, res) => {
  res.send(`Директория с представлениями - ${req.app.get('views')}`)
}
```

### req.baseUrl

Путь URL, на котором монтирован экземпляр роутера. Похож на `app.mountpath`, за исключением того, что последний возвращает совпавший паттерн пути.

```js
const greet = express()

greet.get('/jp', (req, res) => {
  console.log(req.baseUrl) // greet
  res.send('Konichiwa!')
})

app.use('/greet', greet) // загружаем роутер на `/greet`
```

### req.body

Содержит пары ключ-значение данных, содержащихся в запросе. По умолчанию имеет значение `undefined` и наполянется данными такими посредниками, как `express.json` или `multer`:

```js
const express = require('express')
const multer = require('multer')
const app = express()
const upload = multer() // для разбора `multipart/form-data`

app.use(express.json()) // для разбора `application/json`
app.use(express.urlencoded({extended: true})) // для разбора application/x-www-form-urlencoded

app.post('/profile', upload.array(), (req, res, next) => {
  console.log(req.body)
  req.json(req.body)
})
```

### req.cookies

При использовании посредника `cookie-parser` данное свойство представляет собой объект, содержащий куки, полученные из запроса, или пустой объект, если запрос не содержит куки.

```js
// Cookie: name=john
console.log(req.cookies.name) // john
```

Для получения доступа к подписанным куки используется `req.signedCookies`.

### req.fresh

Если ответ является "свежим" в клиентском кэше, возвращается `true`, иначе, возращается `false` - это означает, что кэш клиента устарел и должен быть отправлен полный ответ. При установке клиентом `Cache-Control: no-cache`, данный модуль вернет `false` для перезагрузки запроса и прозрачной обработки ответа.

### req.host

Содержит хост, полученный из заголовка `Host`. При использовании настройки `trust proxy` значением данного свойства является значение заголовка `X-Forwarded-Host`. Данный заголовок может устанавливаться клиентом или прокси. Если в запросе имеется несколько `X-Forwarded-Host`, используется значение первого заголовка.

### req.hostname

Содержит название хоста из заголовка `Host` или `X-Forwarded-Host`.

### req.ip

Содержит удаленный IP-адрес запроса. При использовании настройки `trust proxy`, значением данного свойства является последняя входная точка в заголовке `X-Forwarded-For`. Данный заголовок может устанавливаться клиентом или прокси.

### req.ips

При использовании настройки `trust proxy`, данное свойство содержит массив IP-адресов, определенных в заголовке `X-Forwarded-For`. В противном случае, его значением является пустой массив.

### req.method

Содержит строковое представление HTTP-метода запроса: GET, POST, PUT, DELETE и т.д.

### req.originalUrl

Данное свойство похоже на `req.url`, но возвращает исходный запрос, позволяя перезаписывать `req.url` для целей внутренней маршрутизации. Например, монтирование приложения с помощью `app.use()` перезапишет `req.url` точкой монтирования.

`req.originalUrl` доступен как в посредниках, так и в роутерах и представляет собой комбинацию `req.baseUrl` и `req.url`:

```js
// GET 'http://www.example.com/admin/new?sort=desc'
app.use('/admin', (req, res, next) => {
  console.log(req.originalUrl) // '/admin/new?sort=desc'
  console.log(req.baseUrl) // '/admin'
  console.log(req.path) // '/new'
  next()
})
```

### req.params

Данное свойство представляет собой объект, содержащий свойства, связанные с именованными параметрами маршрута. Например, если у нас имеется маршрут `user/:name`, тогда значение свойства `name` можно получить через `req.params.name`. Дефолтным значением является `{}`.

```js
// GET /user/john
console.log(req.params.name) // john
```

При использовании регулярного выражения для определения маршрута, группы захвата (`()`) помещаются в массив с доступом через `req.params[n]`, где `n` - итая группа захвата. Данное правило также применяется в отношении "диких карточек" (wild cards), таких как `/file/*`:

```js
// GET /file/scripts/lodash.min.js
console.log(req.params[0]) // scripts/lodash.min.js
```

Для изменения ключей в `req.params` следует использовать обработчик `app.param()`. Изменения прмиеняются только к параметрам, определенным в маршруте.

*Обратите внимание*: `Express` автоматически декодирует значения в `req.params` с помощью `decodeURIComponent()`.

### req.path

Содержит путь запрошенного URL:

```js
// example.com/users?sort=desc
console.log(req.path) // /users
```

### req.protocol

Содержит протокол URL: `http` или `https` (`trust proxy` - значение заголовка `X-Forwarded-Proto`).

### req.query

Данный объект содержит свойства для каждого параметра строки запроса. Если парсер строки запроса отключен, значением рассматриваемого свойства является `{}`.

*Обратите внимание*: значения `req.query` являются ненадежными и должны проходить валидацию перед использованием.

```js
// GET /search?q=john+smith
console.log(req.query.q) // john smith

// GET /shoes?order=desc&shoe[color]=blue&shoe[type]=converse
console.log(req.query.order) // desc

console.log(req.query.shoe.color) // blue

console.log(req.query.shoe.type) // converse

// GET /shoes?color[]=blue&color[]=black&color[]=red
console.log(req.query.color) // [blue, black, red]
```

### req.route

Содержит текущий совпавший маршрут, например:

```js
app.get('/user/:id?', function userIdHandler(req, res) => {
  console.log(req.route)
  res.send('GET')
})

/*
{ path: '/user/:id?',
  stack:
   [ { handle: [Function: userIdHandler],
       name: 'userIdHandler',
       params: undefined,
       path: undefined,
       keys: [],
       regexp: /^\/?$/i,
       method: 'get' } ],
  methods: { get: true } }
*/
```

### req.secure

Логическое свойство, имеющее значение `true`, если установлено TLS-соединение (`req.protocol === https`).

### req.signedCookies

При использовании посредника `cookie-parser`, данное свойство содержит подписанные куки из запроса, неподписанные и готовые к использованию. *Обратите внимание*: подписание куки не делает их скрытыми или зашифрованными, но защищает от подделки (поскольку секрет, используемый для подписания, является приватным). По умолчанию имеет значение `{}`.

### req.stale

Противоположность `req.fresh`. Указывает, является ли запрос устаревшим.

### req.subdomains

Массив поддоменов названия домена запроса. Настройка приложения `subdomain offset: 2` используется для определения начала сегмента с субдоменами.

### req.xhr

`true`, если значением заголовка `X-Requested-With` является `XMLHttpRequest`.

## Методы

### req.accepts(type(s))

Определяет, является ли определенный тип контента удовлетворительным (принимаемым) на основе HTTP-заголовка запроса `Accept`. Возвращает "лучшее совпадение" или `false` (в последнем случае приложение отвечает `406 'Not Acceptable'`). `type` - MIME-тип в виде строки (например, `application/json`), название расширения (`json`), список, разделенный запятыми, или массив.

### req.acceptsCharsets(charset(s))

Возвращает первую принимаемую кодировку (charset) из указанного набора на основе заголовка `Accept-Charset` или `false`.

### req.acceptsEncoding(encoding(s))

Возвращает первую принимаемую кодировку (encoding) из указанных на основе заголовка `Accept-Encoding` или `false`.

*Разница между `charset` и `encoding`*: `charset` (character set) - набор символов, привязанных к (mapped to) теоретическим, абстрактным числам под названием кодовые точки (code points). Примером такого набора является `Unicode`. `encoding` - схема, описывающая способ представления кодовых точек в байтах. Примером такой схемы является `UTF-8`. Так что, по хорошему, строка `Content-Type: text/html; charset=utf-8` должна выглядеть как `Content-Type: text/html; encoding=utf-8`.

### req.acceptsLanguages(lang(s))

Возвращает первый принимаемый язык из указанных на основе заголовка `Accept-Language` или `false`.

### req.get(field)

Возвращает значение указанного заголовка. Синоним - `req.header(field)`.

### req.is(type)

Возвращает совпавший тип контента. Если в запросе нет тела, возвращается `null`. Если совпадения не найдено, возвращается `false`.

### req.range(size, options?)

Парсер заголовка `Range`. `size` - максимальный размер ресурса. `options` - объект со свойством `combine`, определяющим, должны ли комбинироваться перекрывающиеся и смежные диапазоны (по умолчанию `false`).

Возвращается массив диапазонов или ошибки в виде отрицательных чисел:

- `-2` - плохо сформированная (malformed) строка запроса
- `-1` - неудовлетворительный (unsatisfiable) диапазон

## Response (ответ)

`res` представляет собой объект, который `Express` отправляет в ответ на запрос. Что касается названия, то оно, как и `res`, является результатом соглашения:

```js
app.get('/user/:id', (req, res) => {
  res.send(`user ${req.params.id}`)
})
```

## Свойства

### res.app

Идентично `req.app`.

### res.headersSent

Логическое значение, указывающее, были ли отправлены заголовки для ответа.

```js
app.get('/', (req, res) => {
  console.log(res.headersSent) // false
  res.send('ok')
  console.log(res.headersSent) // true
})
```

### res.locals

Объект, содержащий локальные переменные ответа, соответствующие (scoped) запросу и поэтому доступные только для представлений, которые рендерятся на протяжении текущего цикла запрос/ответ. В противном случае, данное свойство идентично `app.locals`.

`res.locals` может использоваться для предоставления информации на уровне запроса: название пути, статус пользователя, его настройки и т.д.

```js
app.use((req, res, next) => {
  res.locals.user = req.user
  res.locals.authenticated = !req.user.anonymous
  next()
})
```

## Методы

### res.append(field, value?)

Добавляет указанное значение в заголовк ответа. Если заголовок не установлен, он создается. `value` может быть строкой или массивом.

*Обратите внимание*: вызов `res.set()` после `res.append()` сбросит ранее установленное значение заголовка.

```js
res.append('Link', ['<http://localhost/>', '<http://localhost:3000/>'])
res.append('Set-Cookie', 'foo=bar; Path=/; HttpOnly')
```

### res.attachement(filename?)

Устанавливает заголовок ответа `Content-Disposition` в значение `attachment`. Если указан аргумент `filename`, тогда устанавливаются заголовок `Content-Type` (на основе расширения данного аргумента с помощью `res.type()`) и параметр `filename=` заголовка `Content-Disposition`.

```js
res.attachment()
// Content-Disposition: attachment

res.attachment('path/to/logo.png')
// Content-Disposition: attachment; filename="logo.png"
// Content-Type: image/png
```

### res.cookie(name, value, options?)

Устанавливает куки с именем `name` значение `value`. `value` может быть строкой или объектом, преобразованным в JSON. Объект `options` может содержать следующие свойства:

- `domain: app domain` - название домена
- `encode: encodeURIComponent` - синхронная функция для кодировки значения куки
- `expires` - время устаревания (expiry date) куки в GMT. Если не определено или равняется 0, создается сессионное куки
- `httpOnly` - делает куки доступным только для сервера
- `maxAge` - время жизни куки по отношению к текущему времени в мс
- `path: '/'` - адрес куки
- `secure` - делает куки доступным только через HTTPS
- `signed` - определяет, должен ли куки быть подписанным
- `sameSite` - значение атрибута `Same-Site` заголовка `Set-Cookie`

```js
res.cookie('name', 'john', { domain: '.example.com', path: '/admin', secure: true })
res.cookie('rememberme', '1', { expires: new Date(Date.now() + 86400e3).toUTCString(), httpOnly: true })
```

### res.clearCookie(name, options?)

Удаляет указанные куки. Куки удаляется только при полном совпадении `options`.

```js
res.cookie('name', 'john', { path: '/admin' })
res.clearCookie('name', { path: '/admin' })
```

### res.download(path, filename?, options?, fn?)

Передает файл в качестве `attachment`. Название файла указывается в параметре `filename`. При возникновении ошибки или завершении передачи, вызывается опциональный колбек. Для передачи файлов используется метод `res.sendFile()`. Аргумент `options` идентичен аргументу `options` в `res.sendFile()`.

```js
res.download('/report-12345.pdf')

res.download('/report-12345.pdf', 'report.pdf')

res.download('/report-12345.pdf', 'report.pdf', (err) => {
  if (err) {
    // Обрабатываем ошибку, но помним о том, что ответ мог быть отправлен частично,
    // поэтому проверяем `res.headersSent`
  } else {
    // ...
  }
})
```

### res.end(data?, encoding?)

Завершает процесс ответа. Используется для отправки ответа без данных. Для отправки ответа с данными лучше использовать `res.send()` или `res.json()`.

```js
res.end()
res.status(404).end()
```

### res.format(object)

Осуществляет согласование контента с заголовком запроса `Accept`. Для выбора обработчика используется `req.accepts()`. Если заголовок не определен, вызывается первый колбек. При несовпадении сервер отвечает `406 'Not Acceptable'` или вызывает колбек `default`.

```js
res.format({
  'text/plain': () => {
    res.send('привет')
  },

  'text/html': () => {
    res.send('<p>привет</p>')
  },

  'application/json': () => {
    res.send({ message: 'привет' })
  },

  default: () => {
    // логгируем запрос и отправляем 406
    res.status(406).send('Not Acceptable')
  }
})
```

Для того, чтобы быть менее "болтливым" (verbose) для канонизированных MIME-типов можно использовать расширения:

```js
res.format({
  text: () => {
    res.send('привет')
  },

  html: () => {
    res.send('<p>привет</p>')
  },

  json: () => {
    res.send({ message: 'привет' })
  }
})
```

### res.get(field)

Возвращает значение указанного заголовка ответа.

### res.json(body?)

Отправляет ответ в формате JSON с правильным типом контента. `body` преобразуется в JSON с помощью `JSON.stringify()`.

```js
res.json(null)
res.json({ user: 'john' })
res.status(500).json({ error: 'message' })
```

### res.jsonp(body?)

Отправляет ответ в формате JSON с поддержкой JSONP.

### res.links(links)

Добавляет указанные ссылки в заголовок ответа `Link`:

```js
res.links({
  next: 'http://api.example.com/users?page=2',
  last: 'http://api.example.com/users?page=5'
})

/*
Link: <http://api.example.com/users?page=2>; rel="next",
      <http://api.example.com/users?page=5>; rel="last"
*/
```

### res.location(path)

Устанавливает значение заголовка ответа `Location`:

```js
res.location('/foo/bar')
res.location('http://example.com')
res.location('back')
```

Путь `back` имеет специальное значение, он ссылается на URL, определенный в заголовке запроса `Referer`. Если этот заголовок не определен, он ссылается на `/`.

## res.redirect(status?, path)

Выполняет перенаправление к указанному `URL` со статусом, соответствующим одному из статус-кодов HTTP. По умолчанию статус имеет значение `302 'Found'`.

```js
res.redirect('/foo/bar')
res.redirect('http://example.com')
res.redirect(301, 'http://example.com')
res.redirect('../login')
res.redirect('back')
```

## res.render(view, locals?, callback?)

Рендерит представление и отправляет разметку клиенту. Параметры:

- `locals` - локальные переменные для представления
- `callback` - если указан, метод возвращает возможную ошибку и отрендеренную строку, при этом, ответ не отправляется. При возникновении ошибки, автоматически вызывается `next(err)`. `view` - абсолютный или относительный (настройка `views`) путь к файлу представления.

Если в пути не указано расширение, оно определяется на основе настройки `view engine`.

*Обратите внимание*: `view` выполняет операции с файловой системой, например, чтение с диска и вычисление Node.js-модулей, поэтому он не должен содержать данных, введенных пользователем.

```js
// отправляем отрендеренное представление клиенту
res.render('index')

// если указан колбек, ответ должен отправляться в явном виде
res.render('index', (err, html) => {
  res.send(html)
})

// передаем в представление локальную переменную
res.render('user', { name: 'John' }, (err, html) => {
  // ...
})
```

### res.send(body)

Отправляет HTTP-ответ.

`body` - `Buffer`, логическое значение, строка, массив или объект:

```js
res.send(Buffer.from('привет'))
res.send({ some: 'json' })
res.send('<p>some html</p>')
res.status(404).send('Не найдено!')
res.status(500).send({ error: 'Что-то сломалось' })
```

Данный метод выполняет много полезных задач, например, автоматически устанавливает заголовок `Content-Length` и обеспечивает поддержку "свежести" кэша через `HEAD` и `HTTP` .

Если `body` - это `Buffer`, тогда значением `Content-Type` является `application/octet-stream`. Если строка - `text/html`. Если объект или массив - `application/json`.

### res.sendFile(filename, options?, fn?)

Передает файл, находящийся по указанному адресу. `Content-Type` устанавливается на основе расширения файла. До тех пор, пока не определена настройка `root`, путь к файлу должен быть абсолютным.

Настройки:

- `maxAge: 0` - значение заголовка `Cache-Control` в мс или в виде строки
- `root` - корневая директория
- `lastModified: true` - устанавливает значение заголовка `Last-Modified`
- `headers` - заголовки, отправляемые с файлом
- `dotfiles: 'ignore'` - определяет, должны ли отправляться файлы, начинающиеся с точки, например, `.env`. Возможные значения: `allow`, `deny`, `ignore`
- `acceptRanges: true` - определяет обработку "диапазонных" запросов
- `cacheControl: true` - определяет включение в ответ заголовка `Cache-Control`
- `immutable: false` - см. `express.static()`

Если указан колбек, он вызывается после завершения передачи файла или при возникновении ошибки (`fn(err)`). При этом, колбек должен явно завершить цикл запрос/ответ или передать управление следующему посреднику.

```js
app.get('/file/:name', (req, res, next) => {
  const options = {
    root: path.join(__dirname, 'public'),
    dotfiles: 'deny',
    headers: {
      'x-timestamp': Date.now(),
      'x-sent': true
    }
  }

  const fileName = req.params.name
  res.sendFile(fileName, options, (err) => {
    if (err) {
      next(err)
    } else {
      console.log(`${filename} успешно отправлен`)
    }
  })
})
```

```js
app.get('/user/:uid/photos/:file', (req, res) => {
  const uid = req.params.uid
  const file = req.params.file

  req.user.mayViewFilesFrom(uid, (yes) => {
    if (yes) {
      res.sendFile(`/uploads/${uid}/${file}`)
    } else {
      res.status(403).json({ error: 'Извините, но у Вас нет доступа к этим файлам' })
    }
  })
})
```

### res.sendStatus(code)

Устанавливает статус-код ответа и отправляет его строковое представление клиенту:

```js
res.sendStatus(200) // эквивалент res.status(200).send('OK')
res.sendStatus(403) // эквивалент res.status(403).send('Forbidden')
res.sendStatus(404) // эквивалент res.status(404).send('Not Found')
res.sendStatus(500) // эквивалент res.status(500).send('Internal Server Error')
```

### res.set(field, value?)

Устанавливает `value` заголовка `field`:

```js
res.set('Content-Type', 'text/plain')

res.set({
  'Content-Type': 'text/plain',
  'Content-Length': '123',
  ETag: '12345'
})
```

Синоним `res.header()`.

### res.status(code)

Устанавлвиает статус ответа:

```js
res.status(403).end()
res.status(400).send('Неправильный запрос')
res.status(404).sendFile('/error404.html')
```

## res.type(type)

Устанавливает значение заголовка `Content-Type`.

## res.vary(field)

Добавляет поле в заголовок `Vary`.

## Router (маршрутизатор)

Методы роутера идентичны методам приложения, за исключением того, что применяются в отношении конкретного маршрута и с небольшими оговорками для `router.param()` (см. ниже).

- `router.all(path, callback?)`
- `router.METHOD(path, callback?)`
- `router.param(name, callback)` - в отличие от `app.param()`, не принимает массив параметров.

Поведение `router.param()` можно изменить, если передать только функцию. Данная функция принимает два параметра и должна вернуть посредника: первый параметр - название параметра для захвата, второй - объект, используемый для реализации посредника.

В следующем примере сигнатура `router.param()` преобразована в `router.param(name, accessId)`. Вместо того, чтобы принимать `name` и `callback`, он принимает `name` и `number`:

```js
const express, { Router } = require('express')
const app = express()
const router = Router()

// кастомизируем поведение `router.param()`
router.param((param, option) =>
  (req, res, next, val) => {
    if ( val === option) next()
    else res.sendStatus(403)
  }
)

// используем его
router.param('id', 1234)

// запускаем
router.get('/user/:id', (req, res) => {
  res.send('ok')
})

app.use(router)

app.listen(3000, () => {
  console.log('Сервер готов')
})
```

В следующем примере сигнатура `router.param()` остается прежней, но вместо колбека определена кастомная функция для валидации типа данных идентификатора пользователя:

```js
router.param((param, validator) =>
  (req, res, next, val) => {
    if (validator(val)) next()
    else res.sendStatus(403)
  }
)

router.param('id', (val) => !Number.isNaN(parseFloat(val))) && isFinite(val)
```

- `router.route(path)`
- `router.use(path?, fn?)`
