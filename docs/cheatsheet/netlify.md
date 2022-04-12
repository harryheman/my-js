---
sidebar_position: 30
---

# Netlify

## Интерфейс командной строки

_Установка_

```bash
yarn global add netlify-cli
```

_Получение токена доступа_

```bash
netlify login
```

_Подключение репозитория_

```bash
netlify init
```

_Запуск сервера для разработки_

```bash
netlify dev
```

_Создание "живого" сервера для разработки_

"Живого" означает возможность одновременной работы над проектом нескольких разработчиков.

```bash
netlify dev --live
```

_Создание сборки_

```bash
netlify build
```

_Деплой (черновик)_

```bash
netlify deploy
```

_Деплой (продакшн)_

```bash
netlify deploy -p
```

_Подключение/отключение сайта_

```bash
netlify link
netlify unlink
```

_Справка_

```bash
netlify help
netlify help deploy
```

_Полезные команды_

- `env` - управление переменными среды окружения
  - `env:get`
  - `env:import`
  - `env:list`
  - `env:set`
  - `env:unset`

- `functions` - управление функциями
  - `functions:build`
  - `functions:create`
  - `functions:invoke`
  - `functions:list`
  - `functions:serve`

## Перенаправления

Правила выполнения перенаправлений определяются в файле `_redirects`.

По умолчанию при отсутствии запрашиваемой страницы выполняется перенаправления на `404.html`.

```bash
/* /index.html 200

/home              /
/blog/my-post.php  /blog/my-post
/news              /blog
/cuties            https://www.petsofnetlify.com
```

_Настройки_

- статус-код

```
/* /index.html 200
```

- принудительное перенаправление

```
/* /index.html 200!
```

- splats

```
/news/*  /blog/:splat
```

- параметры строки запроса

```
/articles id=:id tag=:tag /posts/:tag/:id 301
```

- прокси

```
/api/*  https://api.example.com/:splat  200
```

## netlify.toml

`netlify.toml` - основной файл для настройки серверной части приложения, разворачиваемого на `Netlify`.

```bash
# Настройки в [build] являются глобальными и применяются ко всем контекстам
# при отсутствии более специфичных настроек (настроек для определенных контекстов)
[build]
  # Директория с файлами, которые должны быть прочитаны перед сборкой проекта
  # По умолчанию таковой является корневая директория
  base = "project/"

  # Директория, содержащая готовые к деплою HTML-файлы и ресурсы.
  # Путь является относительным (базовая директория).
  # В данном случае абсолютный путь будет выглядеть как `root/project/build-output`
  publish = "build-output/"

  # Команда для выполнения сборки
  command = "echo 'default context'"

# Производственный контекст (продакшн-ветка)
[context.production]
  publish = "output/"
  command = "make publish"
  environment = { ACCESS_TOKEN = "super secret", NODE_VERSION = "14.15.3" }

# Контекст преддеплоя (запросы pull/merge)
[context.deploy-preview]
  publish = "dist/"

# Другой способ определения специфичных для контекста переменных среды окружения
[context.deploy-preview.environment]
  ACCESS_TOKEN = "not so secret"

#  Контекст деплой-ветки (продашкн-ветка и запросы pull/merge)
[context.branch-deploy]
  command = "echo branch"
[context.branch-deploy.environment]
  NODE_ENV = "development"

# Контекст определенной ветки
[context.staging] # `staging` - это название ветки
  command = "echo 'staging'"
  base = "staging"

# Контекст для ветки, название которой содержит специальные символы и заключено в кавычки
[context."feat/branch"]
  command = "echo 'special branch'"
  base = "branch"

# Перенаправления и заголовки являются глобальными.
# Для определения правил, специфичных для определенного контекста,
# следует использовать файлы `_headers` и `_redirects`

# Базовый пример перенаправления
[[redirects]]
  from = "/*"
  to = "/blog/:splat"

# Правило с несколькими свойствами
[[redirects]]
  from = "/old-path"
  to = "/new-path"

  # Дефолтным HTTP-статус-кодом является 301, но это можно изменить
  status = 302

  # По умолчанию при наличии файла, путь которого определен в свойстве `from`,
  # перенаправление не выполняется.
  # При установке `force` в значение `true`,
  # правило будет иметь приоритет перед существующим файлом
  force = true

  # Перенаправление из /old-path?id=123 в /new-path.
  # Каждая комбинация параметров строки запроса
  # должна быть определена в отдельном блоке [[redirects]]
  query = {id = ":id"}

  # Перенаправление, выполняемое на основе языка или локали
  conditions = {Language = ["en"], Country = ["US"]}

  # Подпись запроса с помощью значения, определенного в переменной среды окружения
  signed = "API_SIGNATURE_TOKEN"

  # Кастомные заголовки
  [redirects.headers]
    X-From = "Netlify"
    X-Api-Key = "some-api-key-string"

# Перенаправления, основанные на статусе пользователя,
# не имеют свойства `to`
[[redirects]]
  from = "/gated-path"
  status = 200
  conditions = {Role = ["admin"]}
  force = true

# Следующее правило является рекомендованным для большинства одностраничных приложений
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# Следующее правило позволяет указывать `/api/*` вместо дефолтного `/.netlify/functions/:splat`
# при отправке запросов к API
[[redirects]]
  from = '/api/*'
  to = '/.netlify/functions/:splat'
  status = 200

# Правило с параметрами строки запроса и условиями
[[redirects]]
  from = "/old-path"
  to = "/new-path"
  query = {path = ":path"}
  conditions = {Language = ["en"], Country = ["US"], Role = ["admin"]}

## Данное правило выполняет перенаправление на сторонний API, подписывая запросы с помощью секрета
[[redirects]]
  from = "/search"
  to = "https://api.mysearch.com"
  status = 200
  force = true # принудительное перенаправление
  headers = {X-From = "Netlify"}
  signed = "API_SIGNATURE_TOKEN"

[[headers]]
  # Определяем, какие пути охватывает данный блок [[headers]]
  for = "/*"

  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    Content-Security-Policy = "frame-ancestors https://www.facebook.com"

    # Заголовки, которые могут принимать несколько значений, определяются так
    cache-control = '''
    max-age=0,
    no-cache,
    no-store,
    must-revalidate'''

    # Заголовки, связанные с безопасностью
    [headers.values]
      X-Content-Type-Options = "nosniff"
      X-Frame-Options = "DENY"
      X-XSS-Protection = "1; mode=block"
      Cross-Origin-Resource-Policy = "same-site"
      Cross-Origin-Opener-Policy = "same-origin-allow-popups"
      Cross-Origin-Embedder-Policy = "require-corp"
      Referrer-Policy = "no-referrer"
      Strict-Transport-Security = "max-age=31536000; includeSubDomains"
      Expect-CT = "enforce, max-age=86400"
      Content-Security-Policy = "object-src 'none'; script-src 'self'; img-src 'self'; frame-ancestors 'self'; require-trusted-types-for 'script'; block-all-mixed-content; upgrade-insecure-requests"
      Permissions-Policy = "camera=(), microphone=(), geolocation=(), payment=()"

[functions]
  # Директория с бессерверными функциями.
  # Путь является относительным (базовая директория)
  directory = "functions/"

# Определяем кастомный бандлер
[functions]
  node_bundler = "esbuild"

# Правила для разработки
[dev]
  command = "yarn start"
  port = 8888
  targetPort = 3000
  publish = "dist"
  jwtRolePath = "app_metadata.authorization.roles"
  jwtSecret = "MY_JWT_SECRET_VALUE"
  autoLaunch = true
  framework = "#custom"
  [dev.https]
    certFile = "cert.pem"
    keyFile = "key.pem"
```

## Функции

_Сигнатура_

```js
exports.handler = async function (event, context) {
  // серверный функционал
}
```

- `event`

```
{
  "path": "Путь",
  "httpMethod": "Название метода"
  "headers": { Заголовки }
  "queryStringParameters": { параметры строки запроса }
  "body": "Тело запроса в формате JSON"
  "isBase64Encoded": "Индикатор того, что форматом тела запроса является base64"
}
```

- `context` содержит информацию о контексте, в котором была вызвана функция. Используется в `Identity` - сервисе для аутентификации.

_Пример_

```js
exports.handler = async function (event, context) {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Hello World' })
  }
}
```

В некоторых случаях для корректной работы функций требуется указывать такие заголовки:

```js
headers: {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': 'true'
}
```

_Содержимое ответа_

```js
{
  "isBase64Encoded": true|false,
  "statusCode": httpStatusCode,
  "headers": { "headerName": "headerValue", ... },
  "multiValueHeaders": { "headerName": ["headerValue", "headerValue2", ...], ... },
  "body": "..."
}
```

_Пример отправки отчета в формате `PDF` с помощью "фоновой" функции_

"Фоновой" означает, что такая функция выполняется в фоновом режиме, не блокируя основной поток выполнения кода приложения.

```js
const { jsPDF } = require('jspdf')
const nodemailer = require('nodemailer')
const mg = require('nodemailer-mailgun-transport')

const transporter = nodemailer.createTransport(
  mg({
    auth: {
      api_key: process.env.MAILGUN_API_KEY,
      domain: process.env.MAILGUN_DOMAIN,
    },
  }),
)

exports.handler = async function (event) {
  // извлекаем из тела запроса содержимое отчета и пункт назначения
  const { content, destination } = JSON.parse(event.body)
  console.log(`Отправка отчета в формате PDF в ${destination}`)

  const report = Buffer.from(
    new jsPDF().text(content, 10, 10).output('arraybuffer'),
  )
  const info = await transporter.sendMail({
    from: process.env.MAILGUN_SENDER,
    to: destination,
    subject: 'Отчет готов!',
    text: 'Смотрите прикрепленный PDF-файл',
    attachments: [
      {
        filename: `report-${new Date().toDateString()}.pdf`,
        content: report,
        contentType: 'application/pdf',
      },
    ],
  })

  console.log(`Отчет отправлен: ${info.messageId}`)
}
```

__`TypeScript`__

_Типы_

```bash
npm install @netlify/functions
```

_Пример_

```ts
import { Handler } from '@netlify/functions'

const handler: Handler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Hello World' }),
  }
}

export { handler }
```
