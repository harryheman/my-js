---
sidebar_position: 22
title: Шпаргалка по Cors
description: Шпаргалка по Cors
keywords: ['javascript', 'js', 'node.js', 'nodejs', 'node', 'cors', 'cross-origin resource sharing', 'npm', 'registry', 'package', 'cheatsheet', 'шпаргалка', 'реестр', 'библиотека', 'пакет', 'распределение ресурсов между источниками']
tags: ['javascript', 'js', 'node.js', 'nodejs', 'node', 'cors', 'cross-origin resource sharing', 'npm', 'registry', 'package', 'cheatsheet', 'шпаргалка', 'реестр', 'библиотека', 'пакет', 'распределение ресурсов между источниками']
---

# Cors

> [Cors](https://www.npmjs.com/package/cors) - это посредник (middleware) для `Express-приложений`, предназначенный для настройки `HTTP-заголовков`, связанных с [CORS](https://developer.mozilla.org/ru/docs/Web/HTTP/CORS) (Cross-Origin Resource Sharing - возможность использования ресурсов из другого источника).

_Установка_

```bash
yarn add cors
# или
npm i cors
```

_Примеры использования_

```js
// включаем `CORS` для всех запросов
const express = require('express')
const cors = require('cors')

const app = express()
app.use(cors())

app.get('/users/:id', (_, res) => {
  res.json({ msg: 'CORS включен для всех запросов!' })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`CORS-сервер запущен на порту ${PORT}`)
})

// включаем `CORS` для одного маршрута
app.get('/users/:id', cors(), (_, res) => {
  res.json({ msg: 'CORS включен только для этого маршрута!' })
})

// настраиваем `CORS`
const corsOptions = {
  origin: 'https://example.com',
  optionSuccessStatus: 200, // для старых браузеров и SmartTV
}

app.get('/users/:id', cors(corsOptions), (_, res) => {
  res.json({ msg: 'CORS включен только для example.com' })
})
```

Пример динамического включения `CORS`:

```js
const whitelist = ['https://exmaple.com', 'https://another.org']
const corsOptions = {
  origin: (origin, cb) => {
    if (whitelist.indexOf(origin) > -1) {
      cb(null, true)
    } else {
      cb(new Error('Запрещено CORS'))
    }
  },
}

app.get('/users/:id', cors(corsOptions), (_, res) => {
  res.json({ msg: 'CORS включен только для доменов из белого списка' })
})
```

Для того, чтобы не блокировать запросы от сервера к серверу или REST-инструменты, в функцию проверки источника следует добавить `!origin`:

```js
const corsOptions = {
  origin: (origin, cb) => {
    if (whitelist.indexOf(origin) > -1 || !origin) {
      cb(null, true)
    } else {
      cb(new Error('Запрещено CORS'))
    }
  },
}
```

_Включение `CORS` для предварительных запросов_

Некоторые запросы считаются сложными и требуют отправки предварительных запросов `OPTIONS`. Примерами сложных запросов могут быть запросы, отправляемые методами, отличными от `GET/HEAD/POST` (например, `DELETE`), или запросы, содержащие кастомные заголовки. Для включения `CORS` для сложных запросов следует использовать дополнительный обработчик `OPTIONS`:

```js
app.options('/users/:id', cors())
app.delete('/users/:id', cors(), (_, res) => {
  res.json({ msg: 'CORS включен!' })
})
```

Включить `CORS` для всех сложных запросов можно так:

```js
app.options('*', cors())
```

_Настройки_

- `origin` - настраивает заголовок <a href="https://developer.mozilla.org/ru/docs/Web/HTTP/Headers/Access-Control-Allow-Origin">`Access-Control-Allow-Origin`</a>. Возможные значения:
  - `boolean` - `false` отключает `CORS`, `true` включает для источника запроса, определенного с помощью `req.header('Origin')`
  - `string` - включает `CORS` для определенного источника
  - `regexp` - включает `CORS` для источников, совпадающих с регулярным выражением
  - `array` - включает `CORS`для источников, указанных в массиве. Каждый источник может быть строкой или регуляркой
  - `function` - функция для определения логики включения `CORS`. Данная функция в качестве первого аргумента принимает источник запроса, в качестве второго - колбек в виде `(error: object, allow: boolean) => void`
- `methods` - настраивает заголовок <a href="https://developer.mozilla.org/ru/docs/Web/HTTP/Headers/Access-Control-Allow-Methods">`Access-Control-Allow-Methods`</a>. Принимает строку или массив с разрешенными методами
- `allowedHeaders` - настраивает заголовок <a href="https://developer.mozilla.org/ru/docs/Web/HTTP/Headers/Access-Control-Allow-Headers">`Access-Control-Allow-Headers`</a>. Принимает строку или массив с разрешенными заголовками
- `exposedHeaders` - настраивает заголовок <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Expose-Headers">`Access-Control-Expose-Headers`</a>. Принимает строку или массив с разрешенными кастомными заголовками. По умолчанию данная натройка отключена
- `credentials` - настраивает заголовок <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Credentials">`Access-Control-Allow-Credentials`</a>. Принимает логическое значение. По умолчанию данная настройка отключена
- `maxAge` - настраивает заголовок <a href="https://developer.mozilla.org/ru/docs/Web/HTTP/Headers/Access-Control-Max-Age">`Access-Control-Max-Age`</a>. Принимает целое число. Отключена по умолчанию
- `preflightContinue` - передает предварительный CORS-ответ следующему обработчику
- `optionsSuccessStatus` - предоставляет статус-код для успешного разрешения запросов `OPTIONS` (для некоторых старых браузеров)

Настройки по умолчанию:

```json
{
  "origin": "*",
  "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
  "preflightContinue": false,
  "optionsSuccessStatus": 204
}
```
