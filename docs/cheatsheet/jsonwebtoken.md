---
sidebar_position: 21
title: Шпаргалка по JSONWebToken
description: Шпаргалка по JSONWebToken
keywords: ['javascript', 'js', 'node.js', 'nodejs', 'node', 'jsonwebtoken', 'token', 'npm', 'registry', 'package', 'cheatsheet', 'шпаргалка', 'реестр', 'библиотека', 'пакет', 'токен']
tags: ['javascript', 'js', 'node.js', 'nodejs', 'node', 'jsonwebtoken', 'token', 'npm', 'registry', 'package', 'cheatsheet', 'шпаргалка', 'реестр', 'библиотека', 'пакет', 'токен']
---

# JSONWebToken

> [JSONWebToken](https://github.com/auth0/node-jsonwebtoken) - это библиотека для создания (подписания) и подтверждения (проверки) токенов, используемых для аутентификации/авторизации пользователей. Данная библиотека является реализацией [JSON Web Tokens](https://jwt.io/) для `Node.js`.

[Спецификация](https://tools.ietf.org/html/rfc7519).

## Установка

```bash
yarn add jsonwebtoken
# или
npm i jsonwebtoken
```

## Подписание (создание) токена

```js
const jwt = require('jsonwebtoken')

jwt.sign(payload, secretOrPrivateKey, [options, callback])

// Пример
jwt.sign({
    username: 'John',
    email: 'john@email.com'
  },
  'secret',
  {
    expiresIn: '1h'
  }
)
```

Если передан колбек, то метод выполняется асинхронно. Данный колбек получает объект ошибки `err`. В противном случае, метод выполняется синхронно, возвращая токен в виде строки.

### Аргументы

- `payload` - полезная нагрузка: объект, буфер или строка, представляющие валидный JSON. Объект преобразуется с помощью метода `JSON.stringify()`
- `secretOrPrivateKey` - строка, буфер или объект, содержащие секрет для алгоритмов HMAC или зашифрованный с помощью схемы PEM приватный ключ для RSA и ECDSA

### Настройки

- [Registered claim names](https://tools.ietf.org/html/rfc7519#section-4.1)
- [Creating and Validating JWTs](https://tools.ietf.org/html/rfc7519#section-7)

- `algorithm` (по умолчанию `HS256`)
- `expiresIn` - время, в течение которого токен считается действительным: 100 - 100 с, '100' - 100 мс, '1h' - 1 час, '2d' - 2 дня
- `notBefore` - время, по истечении которого токен будет считаться действительным
- `audience`
- `issuer`
- `jwtid`
- `subject`
- `noTimestamp`
- `header`
- `keyid`
- `mutatePayload` - если имеет значение `true`, функция `sign()` будет модифицировать объект `payload` напрямую. Это бывает полезным, когда нам нужна "сырая" ссылка на полезную нагрузку после применения к ней настроек, но до шифрования.

Настройки `expiresIn`, `notBefore`, `audience`, `subject`, `issuer` могут быть определены прямо в `payload` как `exp`, `nbf`, `aud`, `sub` и `iss`, соответственно.

Заголовок может быть кастомизирован через объект `options.header`.

В сгенерированный `jwt` по умолчанию включается `iat` (время выпуска, создания), если не определено `noTimestamp: true`.

#### Пример синхронного подписания токена с использованием `RSA SHA256`

```js
const privateKey = fs.readFileSync('private.key')
const token = jwt.sign({ name: 'John Smith' }, privateKey, { algorithm: 'RS256' })
```

#### Пример асинхронного подписания токена

```js
jwt.sign({ name: 'John Smith' }, privateKey, { algorithm: 'RS256' }, (err, token) => {
  if (err) console.error(err)
  console.log(token)
})
```

## Подтверждение (проверка) токена

```js
const jwt = required('jsonwebtoken')

jwt.verify(token, secretOrPublicKey, [options, callback])
```

Если передан колбек, то метод выполняется асинхронно. Данный колбек получает декодированную полезную нагрузку при условии валидной сигнатуры и опциональных настроек. В противном случае, выбрасывается исключение.

Без колбека метод выполняется синхронно, возвращая декодированный `payload` при условии валидной сигнатуры и опциональных настроек. В противном случае, выбрасывается исключение.

### Аргументы

- `token`
- `secretOrPublicKey` - если `jwt.verify()` вызывается асинхронно, данный аргумент может быть функцией, запрашивающей секрет или публичный ключ. Некоторые библиотеки в качестве секрета ожидают получить строку в формате base64. В этом случае вместо `secret` следует передать `Buffer.from(secret, 'base64')`

### Настройки

- `algorithms` - массив с названиями разрешенных алгоритмов (['HS256', 'HS384'])
- `audience`
- `complete` - возвращает объект `{ payload, header, signature }` вместо содержимого полезной нагрузки
- `issuer`
- `jwtid`
- `ignoreExpiration` - если `true`, время жизни токена будет игнорироваться
- `ignoreNotBefore`
- `subject`
- `clockTolerance` - допустимая разница во времени в сек
- `maxAge` - максимально допустимый "возраст" токена (100, '100', '1h', '2d')
- `clockTimestamp` - время в сек, используемое в качестве текущего для всех сравнений
- `nonce` - используется в `Open ID` для ID токенов

### Примеры

```js
// Синхронное подтверждение симметричного токена
try {
  const decoded = jwt.verify(token, 'secret')
  console.log(decoded.name) // John
} catch (err) {
  console.error(err)
}

// или
jwt.verify(token, 'secret', (err, decoded) => {
  if (err) console.error(err)
  console.log(decoded.name) // John
})

// Подтверждение асимметричного токена
const cert = fs.readFileSync('public.pem') // получаем публичный ключ
jwt.verify(token, cert, (err, decoded) => {
  if (err) console.error(err)
  console.log(decoded.name) // John
})

// Подтверждение опциональных настроек
const cert = fs.readFileSync('public.pem') // получаем публичный ключ
jwt.verify(token, cert, { audience: 'urn:john', issuer: 'urn:issuer', jwtid: 'jwtid', subject: 'subject' }, (err, decoded) => {})

// Подтверждение с помощью колбека `getKey()`
const jwksClient = require('jwks-rsa')
const client = jwksClient({
  jwksUri: 'https://example.com/.well-known/jwks.json'
})
function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    const signingKey = key.publicKey || key.rsaPublicKey
    callback(null, signingKey)
  })
}
jwt.verify(token, getKey, options, (err, decoded) => {
  if (err) console.error(err)
  console.log(decoded.name) // John
})
```

## Расшифровка (декодирование) токена

```js
jwt.decode(token, [options])
```

Метод является синхронным и возвращает расшифрованный токен без подтверждения валидности сигнатуры.

### Настройки

- `json` - принудительное применение `JSON.parse()` к `payload`
- `complete` - возвращает объект `{ payload, header }`

### Пример

```js
const decoded = jwt.decode(token)
console.log(decoded.name) // John
```

## Ошибки

- `TokenExpiredError`
  - name
  - message: 'jwt expired'
  - expiredAt
- `JsonWebTokenError`
  - name
  - messages:
    - 'invalid token'
    - 'jwt malformed'
    - 'jwt signature is required'
    - 'invalid signature'
    - 'jwt audience | issuer | id | subject invalid. expected: ...'
- `NotBeforeError`
  - name
  - message: 'jwt not active'
  - date
