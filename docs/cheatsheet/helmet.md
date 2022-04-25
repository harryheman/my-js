---
sidebar_position: 25
title: Шпаргалка по Helmet
description: Шпаргалка по Helmet
keywords: ['javascript', 'js', 'node.js', 'nodejs', 'node', 'helmet', 'http headers', 'security headers', 'npm', 'registry', 'package', 'cheatsheet', 'шпаргалка', 'реестр', 'библиотека', 'пакет', 'http-заголовки', 'заголовки безопасности']
tags: ['javascript', 'js', 'node.js', 'nodejs', 'node', 'helmet', 'http headers', 'security headers', 'npm', 'registry', 'package', 'cheatsheet', 'шпаргалка', 'реестр', 'библиотека', 'пакет', 'http-заголовки', 'заголовки безопасности']
---

# Helmet

> [Helmet](https://helmetjs.github.io/) помогает защитить `Express-приложения` посредством установки `HTTP-заголовков`, связанных с безопасностью. "Это не серебряная пуля, но может помочь!"

## Быстрый старт

Установка:

```bash
yarn add helmet
# или
npm i helmet
```

Использование:

```js
const express = require('express')
const helmet = require('helmet')

const app = express()

app.use(helmet())
```

## Как это работает?

`Helmet` - это посредник (middleware) для `Express-приложений`.

Функция высшего уровня `helmet` - это обертка для 15 небольших посредников, 11 из которых включены по умолчанию:

```js
// это
app.use(helmet())

// эквивалентно следующему
app.use(helmet.contentSecurityPolicy())
app.use(helmet.dnsPrefetchControl())
app.use(helmet.expectCt())
app.use(helmet.frameguard())
app.use(helmet.hidePoweredBy())
app.use(helmet.hsts())
app.use(helmet.ieNoOpen())
app.use(helmet.noSniff())
app.use(helmet.permittedCrossDomainPolicies())
app.use(helmet.referrerPolicy())
app.use(helmet.xssFilter())
```

Пример кастомизации одного из указанных посредников:

```js
app.use(
  helmet({
    referrerPolicy: { policy: 'no-referrer' },
  })
)
```

Пример отключения посредника:

```js
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
)
```

## API

**helmet(options)**

Как было отмечено, 11 из 15 названных выше посредников включены по умолчанию. `crossOriginEmbedderPolicy`, `crossOriginOpenerPolicy`, `crossOriginResourcePolicy` и `originAgentCluster` по умолчанию отключены. Они должны включаться вручную. Как обещают разработчики `helmet`, эти заголовки будут включены по умолчанию в следующей мажорной версии `helmet`.

```js
// включаем все 11 посредников
app.use(helmet())
```

Пример отключения посредника `frameguard`:

```js
// включаем 10 посредников, отключаем `helmet.frameguard`
app.use(
  helmet({
    frameguard: false,
  })
)
```

Большинство посредников принимает объект с настройками (см. ниже). Пример настройки `frameguard`:

```js
app.use(
  helmet({
    frameguard: {
      action: 'deny',
    },
  })
)
```

_Обратите внимание_: каждый из посредников, входящих в состав `helmet`, может использоваться в качестве автономного модуля, т.е. устанавливаться и применяться отдельно.

**helmet.contentSecurityPolicy(options)**

`helmet.contentSecurityPolicy` устанавливает заголовок <a href="https://developer.mozilla.org/ru/docs/Web/HTTP/CSP">`Content-Security-Policy`</a>, который, кроме прочего, помогает предотвращать <a href="https://ru.wikipedia.org/wiki/%D0%9C%D0%B5%D0%B6%D1%81%D0%B0%D0%B9%D1%82%D0%BE%D0%B2%D1%8B%D0%B9_%D1%81%D0%BA%D1%80%D0%B8%D0%BF%D1%82%D0%B8%D0%BD%D0%B3">межсайтовый скриптинг</a>. Данный заголовок определяет источники, из которых могут загружаться ресурсы, используемые приложением.

`options.directives` - это объект. Ключи данного объекта - это названия соответствующих директив в стиле `camel case` (`defaultSrc`) или `kebab case` (`default-src`). Каждое значение - это итерируемая сущность (как правило, массив), состоящая из строк или функций для каждой директивы. Если в итераторе имеется функция, она вызывается с объектами запроса и ответа (`req` и `res`, соответственно). `default-src` может быть отключена с помощью `helmet.contentSecurityPolicy.dangerouslyDisableDefaultSrc`.

`options.reportOnly` - логическое значение, по умолчанию `false`. Если `true`, устанавливается заголовок <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy-Report-Only">`Content-Security-Policy-Report-Only`</a>.

По умолчанию применяются следующие директивы:

```
default-src 'self';
base-uri 'self';
block-all-mixed-content;
font-src 'self' https: data:;
frame-ancestors 'self';
img-src 'self' data:;
object-src 'none';
script-src 'self';
script-src-attr 'none';
style-src 'self' https: 'unsafe-inline';
upgrade-insecure-requests
```

Эти директивы можно использовать, установив значение настройки `options.useDefaults` в `true`. Получить их можно с помощью `helmet.contentSecurityPolicy.getDefaultDirectives()`.

Примеры:

```js
// устанавливаем дефолтные директивы, перезаписываем `script-src` и отключаем `style-src`
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      'script-src': [`'self'`, 'example.com'],
      'style-src': null,
    },
  })
)

// устанавливаем `Content-Security-Policy: default-src 'self'; script-src 'self' example.com; object-src 'none'; upgrade-insecure-requests`
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: false,
    directives: {
      defaultSrc: [`'self'`],
      scriptSrc: [`'self'`, 'example.com'],
      objectSrc: [`'none'`],
      upgradeInsecureRequests: [],
    },
  })
)

// устанавливаем заголовок `Content-Security-Policy-Report-Only`
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      // ...
    },
    reportOnly: true,
  })
)

// устанавливаем директиву `script-src` в значение `'self' 'nonce-e33ccde670f149c1789b1e1e113b0916'`
app.use((_, res, next) => {
  res.locals.cspNonce = crypto.randomBytes(16).toString('hex')
  next()
})
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      scriptSrc: [`'self'`, (req, res) => `'none-${res.locals.cspNonce}'`],
    },
  })
)

// отключаем `default-src` и устанавливаем `Content-Security-Policy: script-src 'self'`
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: false,
    directives: {
      'default-src': helmet.contentSecurityPolicy.dangerouslyDisableDefaultSrc,
      'script-src': [`'self'`],
    },
  })
)
```

**helmet.crossOriginEmbedderPolicy()**

`helmet.crossOriginEmbedderPolicy` устанавливает заголовок <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Embedder-Policy">`Cross-Origin-Embedder-Policy`</a> в значение `require-corp`. Данный заголовок запрещает загрузку ресурсов из других источников при отсутствии явного разрешения, предоставленного с помощью <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Cross-Origin_Resource_Policy_(CORP)">`CORP`</a> или <a href="https://developer.mozilla.org/ru/docs/Web/HTTP/CORS">`CORS`</a>.

Данный посредник не включается по умолчанию при вызове `helmet()` и должен быть включен вручную.

```js
app.use(helmet({ crossOriginEmbedderPolicy: true }))
```

**helmet.crossOriginOpenerPolicy()**

`helmet.crossOriginOpenerPolicy` устанавливает заголовок <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Opener-Policy">`Cross-Origin-Opener-Policy`</a>. Данный заголовок запрещает делиться группой контекста области просмотра с другими источниками. Это означает, что приложение нельзя будет открыть в попапе.

Данный посредник также не включается по умолчанию при вызове `helmet()` и должен быть включен вручную.

```js
app.use({ helmet({ crossOriginOpenerPolicy: true }) })

// разрешаем загрузку документа в собственные попапы
app.use(
  helmet({
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' }
  })
)
```

_`helmet.crossOriginResourcePolicy`_ устанавливает заголовок <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Resource-Policy">`Cross-Origin-Resource-Policy`</a>. Данный заголовок блокирует `no-cors` запросы из других источников. Использовать его в продакшне не рекомендуется.

_`helmet.expectCt`_ устанавливает заголовок <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Expect-CT">`Expect-CT`</a>, помогающий определять неправильно выданные сертификаты.

**helmet.referrerPolicy(options)**

`helmet.referrerPolicy` устанавливает заголовок <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy">`Referrer-Policy`</a>, который определяет, какая информация указывается в заголовке <a href="https://developer.mozilla.org/ru/docs/Web/HTTP/Headers/Referer">`Referer`</a>.

`options.policy` - это строка или массив строк, представляющие политику. Если передан массив, он будет объединен с помощью запятой, что может быть использовано для установки резервной политики. Значением по умолчанию является `no-referrer`.

**helmet.hsts(options)**

`helmet.hsts` устанавливает заголовок <a href="https://developer.mozilla.org/ru/docs/Web/HTTP/Headers/Strict-Transport-Security">`Strict-Transport-Security`</a>, который инструктирует браузер использовать `HTTPS` вместо `HTTP`.

`options.maxAge` - это количество секунд, в течение которых браузер должен предпочитать `HTTPS`. Если передано дробное число, оно округляется. Значением по умолчанию является `15552000` (180 дней).

`options.includeSubdomains` - логическое значение, определяющее, распространяется ли требование на поддомены. По умолчанию имеет значение `true`.

`options.preload` - логическое значение. Если `true`, добавляется директива <a href="https://developer.mozilla.org/ru/docs/Web/HTTP/Headers/Strict-Transport-Security#%D0%BF%D1%80%D0%B5%D0%B4%D0%B7%D0%B0%D0%B3%D1%80%D1%83%D0%B7%D0%BA%D0%B0_strict_transport_security">`preload`</a>, выражающая намерение использовать политику `HSTS`. По умолчанию имеет значение `false`.

_`helmet.noSniff`_ устанавливает заголовок <a href="https://developer.mozilla.org/ru/docs/Web/HTTP/Headers/X-Content-Type-Options">`X-Content-Type-Options`</a> в значение `nosniff`. Это позволяет предотвратить <a href="https://developer.mozilla.org/ru/docs/Web/HTTP/Basics_of_HTTP/MIME_types#mime_sniffing">`MIME sniffing`</a>.

_`helmet.originAgentCluster`_ устанавливает заголовок <a href="https://whatpr.org/html/6214/origin.html#origin-keyed-agent-clusters">`Origin-Agent-Cluster`</a>, предоставляющий механизм, позволяющий веб-приложениям изолировать свои источники. В настоящее время данный заголовок поддерживается только <a href="https://caniuse.com/?search=Origin-Agent-Cluster">`Google Chrome`</a>.

**helmet.dnsPrefetchControl(options)**

`helmet.dnsPrefetchControl` устанавливает заголовок <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-DNS-Prefetch-Control">`X-DNS-Prefetch-Control`</a> для управления предварительным получением `DNS`, что может улучшить приватность пользователей за счет производительности. Предварительное получение `DNS` - это функция, с помощью которой браузеры заранее выполняют разрешение доменного имени как для ссылок, которые пользователь может использовать для перехода на другую страницу, так и для URL-адресов ресурсов, используемых приложением, таких как изображения, `CSS`, `JavaScript` и т.д. Почитать о `preload`, `prefetch` и подобных тегах можно <a href="https://habr.com/ru/post/445264/">здесь</a>.

`options.allow` - логическое значение, индикатор включения предварительного получения `DNS`. По умолчанию имеет значение `false`.

_`helmet.ieNoOpen`_ устанавливает специфичный для `IE8` заголовок `X-Download-Options`.

**helmet.frameguard(options)**

`helmet.frameguard` устанавливает заголовок <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options">`X-Frame-Options`</a>, который помогает предотвращать <a href="https://ru.wikipedia.org/wiki/%D0%9A%D0%BB%D0%B8%D0%BA%D0%B4%D0%B6%D0%B5%D0%BA%D0%B8%D0%BD%D0%B3">кликджекинг</a>. Данный заголовок нужен для старых браузеров, которые не поддерживают директиву `frame-ancestors` политики `CSP`.

`options.action` - это строка, определяющая используемую директиву. Она может иметь два значения: `DENY` или `SAMEORIGIN`. Значением по умолчанию является `SAMEORIGIN`.

_`helmet.permittedCrossDomainPolicies`_ устанавливает заголовок <a href="https://owasp.org/www-project-secure-headers/#x-permitted-cross-domain-policies">`X-Permitted-Cross-Domain-Policies`</a>, который определяет политику для загрузки контента из других источников для клиентов (в основном, продуктов `Adobe`).

_helmet.hidePoweredBy()_ удаляет заголовок `X-Powered-By`. В случае с `express` следует использовать `app.disable('x-powered-by')`.

_helmet.xssFilter()_ устанавливает заголовок <a href="https://developer.mozilla.org/ru/docs/Web/HTTP/Headers/X-XSS-Protection">`X-XSS-Protection`</a> в значение `0`. Данный заголовок также нужен только для старых браузеров, плохо поддерживающих `CSP`.
