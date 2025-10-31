---
sidebar_position: 18.1
title: Настройка Express 5 для продакшна в 2025 году
description: Настройка Express 5 для продакшна в 2025 году
keywords: ['javascript', 'js', 'node.js', 'nodesj', 'node', 'express.js', 'expressjs', 'express', 'tutorial', 'туториал', 'фреймворк для разработки веб-серверов']
tags: ['javascript', 'js', 'node.js', 'nodesj', 'node', 'express.js', 'expressjs', 'express', 'tutorial', 'туториал', 'фреймворк для разработки веб-серверов']
---

> [Источник](https://www.reactsquad.io/blog/how-to-set-up-express-5-in-2025)

# Настройка Express 5 для продакшна в 2025 году

Эта статья поможет вам создать приложение [Express 5](https://expressjs.com/) с поддержкой [TypeScript](https://www.typescriptlang.org/).

Вы настроите готовый к продакшну проект с помощью различных инструментов для линтинга, тестирования и проверки типов. В случае, если вы новичок в REST API, не волнуйтесь, эта статья также включает объяснения основных концепций, которые следует знать, таких как маршрутизация (роутинг) и аутентификация.

Настоятельно рекомендую писать код вместе со мной. Мы будем использовать подход "Разработка через тестирование" (test-driven development, TDD) для создания REST API, который может стать основой вашего следующего приложения Express.

_Прим. пер.:_ в коде оригинальной статьи встречаются устаревшие (deprecated) свойства и методы. Также некоторые оригинальные тесты работают нестабильно. Я позволил себе внести необходимые коррективы. Однако, учитывая объем материала, я вполне мог что-то упустить, поэтому [вот ссылка на мой вариант полностью работоспособного кода приложения](https://github.com/harryheman/express-ts-app).

# Инициализация проекта

Создаем новую директорию для проекта:

```bash
mkdir express-ts-app
cd express-ts-app
```

Инициализируем проект с помощью `npm`:

```bash
npm init -y
```

Создаем файл `package.json` в директории проекта.

Модифицируем поле `"main"` и добавляем `"type": "module"` в этот файл:

```json
{
  "main": "dist/index.js",
  "type": "module"
  // Другие поля...
}
```

Устанавливаем Express:

```bash
npm i express
```

Устанавливаем TypeScript и необходимые определения типов как зависимости для разработки:

```bash
npm i -D typescript tsx @types/node @types/express
```

Инициализируем TypeScript:

```bash
npx tsc --init
```

Эта команда создает файл `tsconfig.json`. Обновляем его следующим образом:

```json
{
  "compilerOptions": {
    "allowJs": true,
    "esModuleInterop": true,
    "isolatedModules": true,
    "lib": [
      "ESNext"
    ],
    "module": "NodeNext",
    "moduleDetection": "force",
    "noImplicitOverride": true,
    "noUncheckedIndexedAccess": true,
    "outDir": "dist",
    "paths": {
      "~/*": [
        "./src/*"
      ]
    },
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "sourceMap": true,
    "strict": true,
    "target": "ES2023",
    "verbatimModuleSyntax": true
  },
  "exclude": [
    "node_modules",
    "dist"
  ],
  "include": [
    "src/**/*"
  ]
}
```

Создаем директорию `src` для исходных файлов приложения:

```bash
mkdir src
```

Внутри `src` создаем файл `index.ts`:

```typescript
import express from 'express';

const app = express();
const port = Number(process.env.PORT) || 3000;

app.get('/', (request, response) => {
  response.send('Express + TypeScript Server');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
```

Добавляем в `package.json` скрипты для запуска и сборки приложения:

```json
"scripts": {
  "build": "tsc",
  "start": "node dist/index.js",
  "dev": "tsx watch src/index.ts"
}
```

- `build` компилирует TS в JS
- `start` запускает скомпилированный код JS
- `dev` запускает код TS напрямую с перезагрузкой в реальном времени (hot reload)

Запускаем сервер для разработки:

```bash
npm run dev
```

Переходим по адресу `http://localhost:3000` и убеждаемся в корректной работе сервера.

Для быстрой проверки работоспособности сервера можно использовать `curl`:

```bash
curl http://localhost:3000
Express + TypeScript Server
```

# ESLint и Prettier

Устанавливаем [ESLint](https://eslint.org/) и [Prettier](https://prettier.io/) для обеспечения согласованного стиля кода и раннего перехвата потенциальных ошибок:

```bash
npm i -D eslint typescript-eslint eslint-config-prettier eslint-plugin-prettier eslint-plugin-simple-import-sort eslint-plugin-unicorn prettier @vitest/eslint-plugin
```

Создаем файл `prettier.config.js`. Мне нравятся следующие настройки, но вы можете изменить их на свой вкус:

```js
export default {
  arrowParens: 'avoid',
  bracketSameLine: false,
  bracketSpacing: true,
  htmlWhitespaceSensitivity: 'css',
  insertPragma: false,
  jsxSingleQuote: false,
  plugins: [],
  printWidth: 80,
  proseWrap: 'always',
  quoteProps: 'as-needed',
  requirePragma: false,
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'all',
  useTabs: false,
};
```

_Прим. пер.:_ я добавил в этот файл `endOfLine: 'auto'` для правильной обработки символов переноса строки в Windows.

Создаем файл `eslint.config.js`:

```js
import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import vitest from '@vitest/eslint-plugin';

export default defineConfig([
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  eslintPluginUnicorn.configs['recommended'],
  {
    files: ['**/*.{js,ts}'],
    ignores: ['**/*.js', 'dist/**/*', 'node_modules/**/*'],
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'unicorn/better-regex': 'warn',
      'unicorn/no-process-exit': 'off',
      'unicorn/no-array-reduce': 'off',
      'unicorn/prevent-abbreviations': 'off',
    },
  },
  {
    files: ['src/**/*.test.{js,ts}'],
    ...vitest.configs.recommended,
  },
  eslintPluginPrettierRecommended,
]);

```

Эта настройка комбинирует несколько наборов правил ESLint.

Сначала расширяются рекомендуемые правила JS и TS, затем добавляются предложения Unicorn по улучшению кода (некоторые из них кастомизируются).

Она также включает плагин `simple-import-sort` для автоматической сортировки инструкций импорта и экспорта.

Для тестов применяются рекомендуемые правила [Vitest](https://vitest.dev/) для обеспечения их следования лучшим практикам.

Наконец, добавляется плагин Prettier для интеграции форматирования кода в процесс линтинга, поэтому код остается одновременно синтаксически верным и стилистически согласованным.

Добавляем в `package.json` скрипты для линтинга и форматирования:

```json
"scripts": {
  "format": "prettier --write .",
  "lint": "eslint .",
  "lint:fix": "eslint . --fix",
}
```

# Vitest и Supertest

Устанавливаем зависимости для тестирования:

```bash
npm i -D vitest vite-tsconfig-paths supertest @types/supertest @faker-js/faker
```

Создаем файл `vitest.config.ts`:

```typescript
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: { environment: 'node' },
});
```

Добавляем скрипт для запуска тестов в `package.json`:

```json
"scripts": {
  "test": "vitest"
}
```

# Разделение на сервер и приложение

Файл `src/index.ts` сейчас выполняет 2 функции. Он является и приложением, и сервером.

В контексте создания REST API с помощью Express "app" указывает на приложение Express. Приложение содержит посредников (промежуточное ПО, middleware) и роуты, а также обрабатывает запросы HTTP. Другими словами, приложение - это логика, выполняемая на сервере.

"server" - это сервер HTTP. Он регистрирует сетевые соединения и создается при вызове `app.listen()`.

_Прим. пер.:_ автор предлагает удалить `index.ts` и создать 2 новых файла. Я предлагаю сделать немного проще.

Создаем файл `src/app.ts`:

```typescript
import express from 'express';

export function buildApp() {
  const app = express();

  // Посредник для разбора (парсинга) JSON
  app.use(express.json());

  return app;
}
```

Посредник `express.json()` нужен для обработки данных в формате JSON из входящих запросов.

Модифицируем файл `src/index.ts`:

```typescript
import { buildApp } from './app.js';

const port = Number(process.env.PORT) || 3000;
const app = buildApp();

// Запускаем сервер и перехватываем возвращаемый экземпляр сервера
const server = app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

// Обрабатываем сигнал SIGTERM для мягкой (gracefully) остановки сервера
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
```

Обратите внимание на расширение `.js` при импорте файла `app.ts`. При указании `"module": "NodeNext"` в `tsconfig.json` TS следует правилу разрешения модулей Node.js, которое требует явного указания расширений в импортах. Несмотря на то, что мы пишем код на TS, он компилируется в JS, поэтому нужно импортировать файлы `.js` (например, `import { buildApp } from './app.js'`). Это гарантирует, что Node.js обнаружит правильные файлы во время выполнения, и предотвращает ошибки.

# Логгирование

При создании серверов необходимо мониторить поведение системы путем отслеживания запросов, что помогает в поиске и устранении проблем. Популярным решением является использование такого посредника, как `morgan`.

Устанавливаем зависимости:

```bash
npm i morgan && npm i -D @types/morgan
```

Добавляем `morgan` в приложение:

```typescript
// src/index.ts
import morgan from 'morgan';

import { buildApp } from './app.js';

const port = Number(process.env.PORT) || 3000;
const app = buildApp();

// Настраиваем логгирование с помощью `morgan` на основе среды выполнения кода
const environment = process.env.NODE_ENV || 'development';
app.use(environment === 'development' ? morgan('dev') : morgan('tiny'));

const server = app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
```

Формат логов `morgan` настраивается в зависимости от среды выполнения кода. Формат `dev` предоставляет цветные логи для локальной разработки, а `tiny` - минимальные логи для продакшна.

`morgan` лучше настраивать в коде сервера, поскольку в тестах будет использоваться `buildApp()`. Настройка `morgan` в коде приложения будет загромождать вывод тестов лишними логами.

# Группировка по функционалу

Перед реализацией первой фичи (feature), обсудим общую структуру приложения Express.

В этом туториале файлы будут группироваться по функционалу (фичам). Вот типичная структура такого приложения Express:

```
.
├── eslint.config.js
├── package-lock.json
├── package.json
├── prettier.config.js
├── src
│   ├── app.ts
│   ├── features
│   │   ├── другие фичи...
│   │   └── feature
│   │       ├── ...
│   │       ├── feature-model.ts
│   │       ├── feature-controller.ts
│   │       ├── feature-routes.ts
│   │       └── feature.test.ts
│   ├── другие директории...
│   ├── routes.ts
│   └── server.ts
├── tsconfig.json
└── vitest.config.ts
```

При разработке приложения Express, как правило, следуют шаблону MVC:

- __model (модель)__ - это код, взаимодействующий с базой данных или внешними API
- __view (представление)__ - код, отвечающий за отображение данных и пользовательский интерфейс
- __controller (контроллер)__ - логика, выполняемая при доступе к роуту. Он соединяет модель и представление, обновляет модель и определяет представление для отображения

Если ваше приложение - это чистый бэкенд REST API, как в этом туториале, вам не нужен слой представления.

# Роуты, конечные точки и контроллеры

В дизайне API роут (route) определяет путь (path) и метод HTTP (например, GET, POST), которые используются клиентом для доступа к определенному ресурсу или функционалу. Конечная точка (endpoint) - это определенный URL, по которому доступен этот ресурс или функционал. Контроллер содержит логику, выполняемую при доступе к роуту. Таким образом, роуты и конечные точки определяют, как и где клиенты могут получить ресурсы, а контроллеры - что происходит при доступе к этим роутам.

Роуты и конечные точки часто используются как синонимы, но технически:

- роут представляет собой комбинацию метода HTTP и пути URL
- конечная точка представляет собой конкретный URL (который может содержать метод при выполнении полной операции API)
- контроллер - это контейнер для связанных методов/операций/обработчиков. Обычно, в нем определяется логика обработки запросов к роутам/конечным точкам
- метод/операция (action) - функция контроллера для обработки определенных запросов

Рассмотрим такой запрос HTTP:

```
GET https://api.example.com/users/123
```

- __конечная точка__ - https://api.example.com/users/123
- __роут__ - GET /users/:id
- __операция контроллера__ - функция `getUserById` (операция/метод/обработчик) в объекте `userController` и/или в файле `user-controller.ts`

В случае длинных роутов, таких как `/api/v1/organizations/:slug/members/:id`, конечная точки может выглядеть так:

```
GET https://api.example.com/api/v1/organizations/acme/members/123
```

Каждая часть роута имеет свое название:

- __/api__ - основной путь (base path) или пространство имен (namespace) API
- __/v1__ - сегмент версии API
- __/organizations__ - путь первичного (primary) ресурса
- __/:slug__ - параметр роута для идентификатора организации
- __/members__ - путь вложенного (nested) ресурса
‍ - __/:id__ - параметр роута для идентификатора участника

# Конечная точка проверки здоровья

Приложение настроено, и мы готовы писать первый тест для первой фичи.

Начнем с создания простой конечной точки проверки здоровья (health check). Такие конечные точки позволяют системам мониторинга, таким как балансировщики нагрузки или оркестраторы (например, Kubernetes), определять, что приложение работает правильно и готово к обработке траффика. Эти системы помогают обнаружить проблемы, такие как упавшие процессы, сервисы или зависимости. Оркестраторы позволяют восстанавливать состояние приложение и мягко откатывать новые версии.

Создаем тест для конечной точки проверки здоровья:

```typescript
// src/features/health-check/health-check.test.ts
import request from 'supertest';
import { describe, expect, test } from 'vitest';

import { buildApp } from '~/app.js';

describe('/api/v1/health-check', () => {
  test('дано: запрос GET, ожидается: возврат статуса 200 с сообщением, отметкой времени и временем работы', async () => {
    const app = buildApp();

    const actual = await request(app).get('/api/v1/health-check').expect(200);
    const expected = {
      message: 'OK',
      timestamp: expect.any(Number),
      uptime: expect.any(Number),
    };

    expect(actual.body).toEqual(expected);
  });
});
```

Добавляем контроллер с одним обработчиком для конечной точки проверки здоровья:

```typescript
// src/features/health-check/health-check-controller.ts
import type { NextFunction, Request, Response } from 'express';

export async function healthCheckHandler(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const body = {
      message: 'OK',
      timestamp: Date.now(),
      uptime: process.uptime(),
    };
    response.json(body);
  } catch (error) {
    next(error);
  }
}
```

Здесь мы просто создаем объект, содержащий сообщение, отметку времени и время работы, и отправляем его в формате JSON с дефолтным статусом 200.

Мы используем блок `try-catch` для обработки ошибок и вызываем функцию `next` для передачи ошибки соответствующему посреднику. Мы не создавали таких посредников, поэтому Express будет использовать своего встроенного посредника для обработки ошибок. Этот обработчик выводит ошибку в консоль и отправляет простой ответ с ошибкой клиенту, например, статус-код HTTP `500` и сообщение `Internal Server Error`.

Каждая фича должна иметь хотя бы одного контроллера и один роутер. Создаем роутер:

```typescript
// src/features/health-check/health-check-routes.ts
import { Router } from 'express';

import { healthCheckHandler } from './health-check-controller.js';

const router = Router();

router.get('/', healthCheckHandler);

export { router as healthCheckRoutes };
```

Создаем основной файл для всех роутов:

```typescript
// src/routes.ts
import { Router } from 'express';

import { healthCheckRoutes } from '~/features/health-check/health-check-routes.js';

export const apiV1Router = Router();

apiV1Router.use('/health-check', healthCheckRoutes);
```

Мы определяем основной путь `/health-check` для роутов проверки здоровья, где `/health-check` - это путь основного ресурса.

В дальнейшем при миграции API в файле `routes.ts` можно определить другую версию API (например, `apiV2Router`).

Добавляем роуты в приложение:

```typescript
// src/app.ts
import type { Express } from 'express';
import express from 'express';

import { apiV1Router } from './routes.js';

export function buildApp(): Express {
  const app = express();

  app.use(express.json());

  // Группируем роуты под /api/v1
  app.use('/api/v1', apiV1Router);

  return app;
}
```

Запускаем тест:

```bash
npm run test

✓ src/features/health-check/health-check.test.ts (1 test) 10ms
   ✓ /api/v1/health-check > given: a GET request, should: return a 200 with a message, timestamp and uptime

 Test Files  1 passed (1)
      Tests  1 passed (1)
   Start at  14:01:14
   Duration  99ms

 PASS  Waiting for file changes...
       press h to show help, press q to quit
```

# asyncHandler

Шаблон использования `next()` в обработчиках является довольно утомительным. Он заставляет использовать 3 аргумента, добавляет дополнительный слой и делает код менее читаемым и более объемным.

Создадим вспомогательную функцию, оборачивающую обработчик в блок `try-catch` и вызывающую `next()` с ошибкой:

```typescript
// src/utils/async-handler.ts
import type { NextFunction, Request, Response } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';
import type { ParsedQs } from 'qs';

/**
 * Утилита, оборачивающая асинхронный обработчик роута (без `next()`), чтобы любая ошибка автоматически
 * передавалась в `next()`. Это позволяет избежать включения блоков `try/catch` в каждый асинхронный обработчик.
 *
 * @param fn Асинхронный обработчик запросов Express, возвращающий промис.
 * @returns Стандартный обработчик запросов Express.
 */
export function asyncHandler<
  P = ParamsDictionary,
  ResponseBody = unknown,
  RequestBody = unknown,
  RequestQuery = ParsedQs,
  LocalsObject extends Record<string, unknown> = Record<string, unknown>,
>(
  function_: (
    request: Request<P, ResponseBody, RequestBody, RequestQuery, LocalsObject>,
    response: Response<ResponseBody, LocalsObject>,
  ) => Promise<void>,
): (
  request: Request<P, ResponseBody, RequestBody, RequestQuery, LocalsObject>,
  response: Response<ResponseBody, LocalsObject>,
  next: NextFunction,
) => Promise<void> {
  return async function (
    request: Request<P, ResponseBody, RequestBody, RequestQuery, LocalsObject>,
    response: Response<ResponseBody, LocalsObject>,
    next: NextFunction,
  ): Promise<void> {
    try {
      await function_(request, response);
    } catch (error) {
      next(error);
    }
  };
}
```

Здесь много строчек кода - все ради того, чтобы TS был счастлив. На самом деле, все сводится к этому:

```typescript
// temp-async-handler.js
function asyncHandler(fn) {
  return async function (request, response, next) {
    try {
      await fn(request, response);
    } catch (error) {
      next(error);
    }
  };
}
```

Мы вызываем `asyncHandler()` с обработчиком, и она возвращает новый обработчик, который можно использовать в роутере.

Это позволяет упростить код обработчика:

```typescript
// src/features/health-check/health-check-controller.ts
import type { Request, Response } from 'express';

export async function healthCheckHandler(request: Request, response: Response) {
  const body = {
    message: 'OK',
    timestamp: Date.now(),
    uptime: process.uptime(),
  };
  response.json(body);
}
```

Добавляем `asyncHandler()` в файл `health-check-routes.ts`:

```typescript
import { Router } from 'express';

import { asyncHandler } from '~/utils/async-handler.js';

import { healthCheckHandler } from './health-check-controller.js';

const router = Router();

router.get('/', asyncHandler(healthCheckHandler));

export { router as healthCheckRoutes };
```

# База данных

В этом туториале мы будем использовать [Prisma](https://www.prisma.io/) с PostgreSQL. Установите [сервер Postgres](https://postgresapp.com/) для создания локальной БД.

_Прим. пер.:_ команда для создания Postgres в [Docker](https://www.docker.com/):

```bash
docker run --name db -p 5432:5432 -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=mydb -v postgres_data:/var/lib/postgresql/data -d postgres
```

Устанавливаем зависимости:

```bash
npm i -D prisma && npm i @prisma/client @paralleldrive/cuid2
```

Инициализируем Prisma:

```bash
npx prisma init
```

Эта команда генерирует файлы `.env` и `prisma/prisma.schema`. Убедитесь, что переменная `DATABASE_URL` в `.env` содержит правильные данные для подключения к БД.

_Прим. пер.:_ `DATABASE_URL` для Postgres в Docker:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mydb?schema=public"
```

Добавляем следующие скрипты в `package.json`:

```json
"prisma:deploy": "npx prisma migrate deploy && npx prisma generate",
"prisma:migrate": "npx prisma migrate dev --name",
"prisma:push": "npx prisma db push && npx prisma generate",
"prisma:seed": "tsx ./prisma/seed.ts",
"prisma:setup": "prisma generate && prisma migrate deploy && prisma db push",
"prisma:studio": "npx prisma studio",
"prisma:wipe": "npx prisma migrate reset --force && npx prisma db push",
```

Для этого туториала важен только скрипт `prisma:setup`. Он создает БД и генерирует клиента Prisma.

Полное объяснение всех скриптов можно найти в моей статье ["How To Set Up Next.js 15 For Production In 2025"](https://janhesters.com/blog/how-to-set-up-nextjs-15-for-production-in-2025).

Добавляем модель `UserProfile` в файл `prisma/schema.prisma`:

```
model UserProfile {
  id             String   @id @default(cuid(2))
  email          String   @unique
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  name           String   @default("")
  hashedPassword String
}
```

_Прим. пер.:_ рекомендую установить [расширение Prisma для VSCode](https://marketplace.visualstudio.com/items?itemName=Prisma.prisma).

Выполняем команду `npm run prisma:setup`.

Создаем файл `database.ts` для подключения к БД:

```typescript
// src/database.ts
import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}
```

_Прим. пер.:_ это позволяет избежать создания нового экземпляра Prisma при каждой hot reload в режиме для разработки.

# Фасады

При работе с любым внешним API, БД или другим сервисом хорошей идеей является создание фасада (facade). Фасад - это обертка сервиса, предоставляющая упрощенный интерфейс для сложной подсистемы.

Фасады полезны по двум причинам:

1. __Рост сопротивления поставщиков__ - фасады позволяют быстро оборачивать поставщиков (провайдеров). Например, переключение с Postgres на MongoDB путем одного изменения. Мы обновляем реализацию (структуру) фасада, а код, использующий фасад, остается прежним.
2. __Упрощение кода__ - фасад ограничивает API тем, что нам требуется. Он уменьшает количество кода, который надо писать, поскольку мы передаем лишь нужные аргументы и получаем только нужные нам значения. Код также становится чище за счет описательных названий функций.

Создаем файл для фасада:

```typescript
// src/features/user-profile/user-profile-model.ts
import { prisma } from '~/database.js';
import type { Prisma, UserProfile } from '~/generated/prisma/index.js';

/* CREATE */

/**
 * Сохраняет профиль пользователя в БД.
 *
 * @param userProfile Профиль пользователя для сохранения.
 * @returns Сохраненный профиль пользователя.
 */
export async function saveUserProfileToDatabase(
  userProfile: Prisma.UserProfileCreateInput,
) {
  return prisma.userProfile.create({ data: userProfile });
}

/* READ */

/**
 * Извлекает профиль пользователя по его id.
 *
 * @param id Идентификатор профиля пользователя.
 * @returns Профиль пользователя или `null`.
 */
export async function retrieveUserProfileFromDatabaseById(
  id: UserProfile['id'],
) {
  return prisma.userProfile.findUnique({ where: { id } });
}

/**
 * Извлекает профиль пользователя по его email.
 *
 * @param email email профиля пользователя.
 * @returns Профиль пользователя или `null`.
 */
export async function retrieveUserProfileFromDatabaseByEmail(
  email: UserProfile['email'],
) {
  return prisma.userProfile.findUnique({ where: { email } });
}

/**
 * Извлекает несколько профилей пользователей.
 *
 * @param page Номер страницы (начиная с 1).
 * @param pageSize Количество профилей на страницу.
 * @returns Список профилей пользователей.
 */
export async function retrieveManyUserProfilesFromDatabase({
  page = 1,
  pageSize = 10,
}: {
  page?: number;
  pageSize?: number;
}) {
  const skip = (page - 1) * pageSize;
  return prisma.userProfile.findMany({
    skip,
    take: pageSize,
    orderBy: { createdAt: 'desc' },
  });
}

/* UPDATE */

/**
 * Обновляет профиль пользователя по его id.
 *
 * @param id Идентификатор профиля пользователя.
 * @param data Новые данные профиля.
 * @returns Обновленный профиль пользователя.
 */
export async function updateUserProfileInDatabaseById({
  id,
  data,
}: {
  id: UserProfile['id'];
  data: Prisma.UserProfileUpdateInput;
}) {
  return prisma.userProfile.update({ where: { id }, data });
}

/* DELETE */

/**
 * Удаляет профиль пользователя по его id.
 *
 * @param id Идентификатор профиля пользователя.
 * @returns Удаленный профиль пользователя.
 */
export async function deleteUserProfileFromDatabaseById(id: UserProfile['id']) {
  return prisma.userProfile.delete({ where: { id } });
}
```

_Прим. пер.:_ обратите внимание, что в оригинале типы `Prisma` и `UserProfile` импортируются из `@prisma/client`. В новых версиях Prisma они должны импортироваться из `~/generated/prisma/index.js`.

Как правило, мы создаем полный набор операций CRUD (Create, Read, Update, Delete) для любой модели в соответствующем файле.

Для создания профиля пользователя экспортируется функция, принимающая профиль и записывающая его в БД с помощью метода Prisma `create`. Это демонстрирует шаблон фасада в действии: Prisma, сложная подсистема, предоставляет большой API со множеством возможностей, но фасад упрощает его до простого сохранения одного профиля пользователя.

В разделе чтения имеются функции для извлечения профиля пользователя по уникальному id или email, а также функция для получения нескольких профилей с пагинацией и упорядочением по убыванию (самые последние (по времени создания) профили находятся в начале списка).

Операция обновления обрабатывается функцией, принимающей id и набор новых данных и обновляющей соответствующий профиль пользователя в БД.

Наконец, функция `deleteUserProfileFromDatabaseById` удаляет профиль с указанным id.

# Фабричные функции

__Фабричная функция__ (factory function) - это просто функция, которая возвращает объект. Этот объект обычно представляет осмысленную единицу приложения, такую как запись в БД, кастомная структура данных или объект в ООП. Позже мы будем использовать фабричные функции для создания фиктивных данных для тестов.

Создаем общий тип `Factory`, который будет использоваться любой фабрикой:

```typescript
// src/utils/types.ts
/**
 * Произвольная фабричная функция с сигнатурой `Shape`.
 */
export type Factory<Shape> = (object?: Partial<Shape>) => Shape;
```

Этот тип позволяет перезаписывать дефолтные значения объекта, обеспечивая наличия всех необходимых свойств.

Создаем фабричную функцию для профиля пользователя:

```typescript
// src/features/user-profile/user-profile-factories.ts
import { faker } from '@faker-js/faker';
import { createId } from '@paralleldrive/cuid2';

import type { UserProfile } from '~/generated/prisma/index.js';
import type { Factory } from '~/utils/types.js';

export const createPopulatedUserProfile: Factory<UserProfile> = ({
  id = createId(),
  email = faker.internet.email(),
  name = faker.person.fullName(),
  updatedAt = faker.date.recent({ days: 10 }),
  createdAt = faker.date.past({ years: 3, refDate: updatedAt }),
  hashedPassword = faker.string.uuid(),
} = {}) => ({ id, email, name, createdAt, updatedAt, hashedPassword });
```

Эта функция позволяет легко создавать профили пользователей с фиктивными данными.

# Валидация

Для валидации поисковых строк (queries) и тел запросов (request bodies) мы будем использовать [Zod](https://zod.dev/). Обычно, для этого используется `express-validator`, но он плохо работает с TS, поскольку Express не умеет выводить типы структур данных.

Устанавливаем `zod`:

```bash
npm i zod
```

Создаем посредника для валидации:

```typescript
import type { Request, Response } from 'express';
import type { ZodType } from 'zod';
import { ZodError } from 'zod';

export function createValidate(key: 'body' | 'query' | 'params') {
  return async function validate<T>(
    schema: ZodType<T>,
    request: Request,
    response: Response,
  ): Promise<T> {
    try {
      const result = await schema.parseAsync(request[key]);
      return result;
    } catch (error) {
      if (error instanceof ZodError) {
        response
          .status(400)
          .json({ message: 'Bad Request', errors: error.issues });
        throw new Error('Validation failed');
      }
      throw error;
    }
  };
}

export const validateBody = createValidate('body');
export const validateQuery = createValidate('query');
export const validateParams = createValidate('params');
```

Функция `createValidate` принимает ключ и возвращает функцию для валидации тела запроса, поисковой строки или параметров запроса с помощью метода `parseAsync` схемы Zod.

Если вам интересно, в чем разница между `body`, `query` и `params`, вот краткое объяснение:

- `body` содержит данные, отправляемые в качестве полезной нагрузки (payload) запроса (часто используется с методами POST, PUT и др.) и обычно разбираемые с помощью посредника, такого как `body-parser`
- `query` содержит пары "ключ-значение" из поисковой строки URL (часть после `?`), часто используется для фильтрации или пагинации
- `params` содержит параметры роута, определенные в пути URL (например, `id` в `/users/:id`), используется для захвата определенных сегментов URL

Помните, я сказал, что `express-validator` плохо работает с TS? `express-validator` обычно используется так:

```typescript
import express from 'express';
import { query } from 'express-validator';

const app = express();

app.use(express.json());
app.get('/hello', query('person').notEmpty(), (request, response) => {
  response.send(`Hello, ${request.query.person}!`);
});

app.listen(3000);
```

В этом сниппете TS не знает, что `request.query.person` - это `string`, поскольку `express-validator` запускается во время выполнения, а система типов TS обладает информацией лишь о статических типах, предоставленных Express.

Но благодаря функции `validateQuery`, TS знает, что `person` является строкой.

Вот как можно использовать ее в коде:

```typescript
// temp-validate-query-example.ts
import express from 'express';
import { z } from 'zod';

import { validateQuery } from '../middleware/validate';

const app = express();

// Определяем схему Zod для параметров поисковой строки
const helloQuerySchema = z.object({
  person: z.string().min(1, { message: 'person is required' }),
});

app.get('/hello', async (request, response, next) => {
  try {
    // Валидируем и парсим `query` с помощью нашего кастомного валидатора
    const query = await validateQuery(helloQuerySchema, request, response);

    // TS теперь знает, что `query.person` - это `string`
    response.send(`Hello, ${query.person}!`);
  } catch (error) {
    // Правильно обрабатываем ошибки (ошибки валидации уже отправлены клиенту)
    next(error);
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
```

# Куки

Еще одна вещь, которую должен уметь делать сервер - это читать куки (cookie). По умолчанию Express умеет добавлять куки в ответы, но читать их из запросов не может.

Устанавливаем соответствующего посредника:

```bash
npm i cookie-parser && npm i -D @types/cookie-parser
```

Добавляем его в приложение:

```typescript
// src/app.ts
import cookieParser from 'cookie-parser';
import type { Express } from 'express';
import express from 'express';

import { apiV1Router } from './routes.js';

export function buildApp(): Express {
  const app = express();

  app.use(express.json());
  // Посредник для чтения куки, содержащихся в запросе
  app.use(cookieParser());

  app.use('/api/v1', apiV1Router);

  return app;
}
```

Теперь любой запрос будет иметь объект `request.cookies`, содержащий куки, отправленные клиентом.

# Аутентификация

Большинству приложений требуется какая-то форма аутентификации. В этом туториале мы будем использовать токены JWT в куки для аутентификации запросов. Пользователи будут использовать классическую комбинацию email и пароля для аутентификации.

Однако, важно отметить, что [пароли устарели](https://medium.com/javascript-scene/passwords-are-obsolete-how-to-secure-your-app-and-protect-your-users-1cd6c7b7c3bc). Перестаньте собирать и хранить пароли. Пароли являются слабыми, поскольку они могут копироваться, похищаться и взламываться грубой силой (brute force). Используйте [passkeys](https://safety.google/authentication/passkey/) для сильного логина и email OTP (one-time password - одноразовый пароль) только в качестве резерва.

_Прим. пер.:_ у passkeys есть свои недостатки, поэтому утверждение о том, что пароли устарели, является довольно спорным.

Все, что вы узнаете об обработке токенов JWT и куки будет полезным, независимо от метода аутентификации.

Аутентификация будет работать через куки. При регистрации или входе в систему пользователя, куки добавляется в ответ, отправляемый клиенту. Браузер автоматически отправляет куки в каждом запросе к серверу. Сервер читает куки и использует их для аутентификации пользователя. Кроме этого, роут `register` будет создавать профиль пользователя и сохранять его в БД. Роут `logout` будет отправлять ответ, указывающий браузеру удалить куки.

# Вход в систему

Начнем с роута `login`. Создаем файл `src/features/user-authentication/user-authentication.test.ts`:

```typescript
import { createId } from '@paralleldrive/cuid2';
import request from 'supertest';
import { describe, expect, onTestFinished, test } from 'vitest';

import { buildApp } from '~/app.js';

import { createPopulatedUserProfile } from '../user-profile/user-profile-factories.js';
import {
  deleteUserProfileFromDatabaseById,
  saveUserProfileToDatabase,
} from '../user-profile/user-profile-model.js';
import { hashPassword } from './user-authentication-helpers.js';

async function setup({ password = 'password' }: { password?: string } = {}) {
  const app = buildApp();

  const userProfile = await saveUserProfileToDatabase(
    createPopulatedUserProfile({
      hashedPassword: await hashPassword(password),
    }),
  );

  onTestFinished(async () => {
    await deleteUserProfileFromDatabaseById(userProfile.id);
  });

  return { app, userProfile };
}

describe('/api/v1/login', () => {
  test('дано: валидные данные существующего пользователя, ожидается: возврат статуса 200 и установка JWT куки', async () => {
    const password = createId();
    const { app, userProfile } = await setup({ password });

    const actual = await request(app)
      .post('/api/v1/login')
      .send({ email: userProfile.email, password })
      .expect(200);

    expect(actual.body).toEqual({ message: 'Logged in successfully' });
    // Проверяем установку HTTP-only куки. По каким-то причинам
    // supertest типизирует куки как строку, хотя это массив
    const cookies = actual.headers['set-cookie'] as unknown as string[];
    expect(cookies).toBeDefined();
    expect(cookies.some(cookie => cookie.includes('jwt='))).toEqual(true);
  });

  test('дано: валидные данные несуществующего пользователя, ожидается: возврат статуса 401', async () => {
    const { app } = await setup();

    const { body: actual } = await request(app)
      .post('/api/v1/login')
      .send({ email: 'non-existing@test.com', password: 'password' })
      .expect(401);
    const expected = { message: 'Invalid credentials' };

    expect(actual).toEqual(expected);
  });

  test('дано: валидный email, но неверный пароль существующего пользователя, ожидается: возврат статуса 401', async () => {
    const { app, userProfile } = await setup();

    const actual = await request(app)
      .post('/api/v1/login')
      .send({ email: userProfile.email, password: 'invalid password' })
      .expect(401);

    expect(actual.body).toEqual({ message: 'Invalid credentials' });
  });

  test('дано: невалидные данные, ожидается: возврат статуса 400', async () => {
    const { app } = await setup();

    const { body: actual } = await request(app)
      .post('/api/v1/login')
      .send({})
      .expect(400);
    const expected = {
      message: 'Bad Request',
      errors: [
        {
          code: 'invalid_type',
          expected: 'string',
          message: 'Invalid input: expected string, received undefined',
          path: ['email'],
        },
        {
          code: 'invalid_type',
          expected: 'string',
          message: 'Invalid input: expected string, received undefined',
          path: ['password'],
        },
      ],
    };

    expect(actual).toEqual(expected);
  });
});
```

Сначала мы определяем функцию `setup`, которая создает приложение и пользователя с хэшированным паролем и записывает его в БД. Обработчик `onTestFinished` удаляет профиль пользователя после завершения тестов.

Функции `hashPassword` пока нет, но скоро мы ее создадим. Как правило, при TDD нормальной практикой считается использование несуществующих функций, поскольку к ним также можно рекурсивно применить TDD. Обычно, сначала создается пустая версия, чтобы проходили импорты, а уже затем реализуется поведение.

Затем определяется тест для роута `/api/v1/login`.

Сначала тестируется счастливый путь (happy path), когда пользователь существует и данные являются валидными.

Затем обрабатывается 4 тест-кейса:

1. Валидные данные существующего пользователя.
2. Валидные данные несуществующего пользователя.
3. Неверный пароль существующего пользователя.
4. Невалидные данные в теле запроса.

Каждый тест проверяет правильный статус-код HTTP и корректное тело ответа.

Для реализации роута и его тестов необходимо несколько вспомогательных функций.

Нам нужна функция для хэширования пароля, еще одна для сравнения пароля с хэшем, функция для генерации токена JWT для пользователя и функция для установки куки JWT. Кроме того, нам нужна функция проверки валидности токена и функция для извлечения токена JWT из куки запроса. Напишем тесты для этих функций.

Функции `hashPassword` и `getIsPasswordValid` будут использоваться вместе, поэтому и тестировать их имеет смысл совместно:

```typescript
// src/features/user-authentication/user-authentication-helpers.test.ts
import { createId } from '@paralleldrive/cuid2';
import { describe, expect, test } from 'vitest';

import {
  getIsPasswordValid,
  hashPassword,
} from './user-authentication-helpers.js';

describe('getIsPasswordValid() & hashPassword()', () => {
  test('дано: пароль, ожидается: хэшированный пароль', async () => {
    const password = createId();
    const hashedPassword = await hashPassword(password);

    const actual = await getIsPasswordValid(password, hashedPassword);
    const expected = true;

    expect(actual).toEqual(expected);
  });
});
```

Сначала мы используем `hashPassword()` для хэширования пароля, затем - `getIsPasswordValid()` для его валидации.

Пароли можно хэшировать с помощью библиотеки `bcrypt`. Устанавливаем ее:

```bash
npm i bcrypt && npm i -D @types/bcrypt
```

Реализуем обе функции:

```typescript
// src/features/user-authentication/user-authentication-helpers.ts
import bcrypt from 'bcrypt';

/**
 * Хэширует пароль.
 *
 * @param password Пароль для хэширования.
 * @returns Хэшированный пароль.
 */
export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10);
}

/**
 * Сравнивает пароль с хэшированным паролем.
 *
 * @param password Пароль для сравнения.
 * @param hashedPassword Хэшированный пароль для сравнения.
 * @returns true, если пароль валиден, иначе false.
 */
export async function getIsPasswordValid(
  password: string,
  hashedPassword: string,
) {
  return await bcrypt.compare(password, hashedPassword);
}
```

Теперь тесты должны проходить.

Добавляем тест для функции генерации токена JWT:

```typescript
// src/features/user-authentication/user-authentication-helpers.test.js
// Другие импорты...
import {
  generateJwtToken,
  getIsPasswordValid,
  hashPassword,
} from './user-authentication-helpers.js';

// Другие тесты...

describe('generateJwtToken()', () => {
  test('дано: профиль пользователя, ожидается: токен JWT', () => {
    const userProfile = {
      id: 'ozlnvq593weqj51j5p69adul',
      email: 'Jamarcus.Haag44@hotmail.com',
      name: 'Dr. Philip Lindgren',
      createdAt: new Date('2022-09-25T20:03:54.119Z'),
      updatedAt: new Date('2025-01-29T11:25:38.342Z'),
      hashedPassword: 'b6d93ffb-8093-4940-bd1f-c9e8020851e4',
    };
    const jwtToken = generateJwtToken(userProfile);

    const actual = jwtToken.startsWith('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
    const expected = true;

    expect(actual).toEqual(expected);
  });
});
```

В этом тесте мы создаем простой профиль пользователя, генерируем токен для него и проверяем, что токен начинается с определенной строки. Это строка может различаться в зависимости от среды выполнения кода и переменной `JWT_SECRET`, которую мы установим при реализации следующей функции.

Нам потребуется еще несколько пакетов:

```bash
npm i dotenv jsonwebtoken && npm i -D @types/jsonwebtoken
```

Реализуем функцию:

```typescript
// src/features/user-authentication/user-authentication-helpers.ts
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

import type { UserProfile } from '~/generated/prisma/index.js';

dotenv.config();

// Другие функции...

/**
 * Генерирует токен JWT. Не забудьте определить process.env.JWT_SECRET.
 *
 * @param userProfile Профиль пользователя, для которого генерируется токен.
 * @returns Сгенерированный токен JWT.
 */
export function generateJwtToken(userProfile: UserProfile) {
  const tokenPayload = {
    id: userProfile.id,
    email: userProfile.email,
  };
  return jwt.sign(tokenPayload, process.env.JWT_SECRET as string, {
    expiresIn: 60 * 60 * 24 * 365, // 1 год
  });
}
```

`dotenv.config()` загружает переменные среды из файла `.env` в `process.env`.

Добавляем в `.env` переменную `JWT_SECRET`:

```
JWT_SECRET=your-jwt-secret
```

Функция `generateJwtToken` принимает профиль пользователя, извлекает из него `id` и `email` и создает токен JWT на их основе. Она подписывает токен секретом из среды окружения и устанавливает срок жизни токена в 1 год.

Теперь тест должен проходить.

Последняя функция, которую необходимо создать перед реализацией роута, - функция для установки куки JWT. Для этой функции не нужны тесты, поскольку для ее юнит-тестирования придется мокать (mock) объект `Response` Express, и тестироваться будет в основном этот мок, а не функция. Такие функции обычно тестируются с помощью интеграционных тестов.

```typescript
// src/features/user-authentication/user-authentication-helpers.ts
// Другие импорты...
import type { Response } from 'express';
import jwt from 'jsonwebtoken';

// Другие функции...

export const JWT_COOKIE_NAME = 'jwt';

/**
 * Устанавливает куки JWT.
 *
 * @param response Объект ответа для установки куки.
 * @param token Токен JWT для установки.
 */
export function setJwtCookie(response: Response, token: string) {
  response.cookie(JWT_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // используем безопасные куки в продакшне
    sameSite: 'strict',
  });
}
```

Настройки куки:

- `httpOnly` - куки недоступна с помощью JS, что защищает от межсайтового скриптинга (cross-site scripting, XSS), предотвращая чтение токена "злыми" скриптами
- `secure` - куки отправляется только по HTTPS, когда `NODE_ENV` установлена в `production`
- `sameSite` - куки ограничивается установившим ее сайтом, что предотвращает ее отправку с запросами, инициированными сторонними сервисами

Теперь мы можем реализовать роут `/api/v1/login`:

```typescript
// src/features/user-authentication/user-authentication-controller.ts
import type { Request, Response } from 'express';
import { z } from 'zod';

import { validateBody } from '~/middleware/validate.js';

import {
  retrieveUserProfileFromDatabaseByEmail,
} from '../user-profile/user-profile-model.js';
import {
  generateJwtToken,
  getIsPasswordValid,
  setJwtCookie,
} from './user-authentication-helpers.js';

export async function login(request: Request, response: Response) {
  // Валидируем тело запроса на наличие валидного email и пароля
  // из 8 символов, минимум
  const body = await validateBody(
    z.object({
      email: z.email(),
      password: z.string().min(8),
    }),
    request,
    response,
  );

  // Пытаемся найти пользователя в БД по email
  const user = await retrieveUserProfileFromDatabaseByEmail(body.email);

  if (user) {
    const isPasswordValid = await getIsPasswordValid(
      body.password,
      user.hashedPassword,
    );

    if (isPasswordValid) {
      // Генерируем токен JWT, устанавливаем HTTP-only куки и возвращаем
      // статус 200 и сообщение об успехе
      const token = generateJwtToken(user);
      setJwtCookie(response, token);
      response.status(200).json({ message: 'Logged in successfully' });
    } else {
      // Если пароль невалиден, возвращаем статус 401 и сообщение об ошибке
      response.status(401).json({ message: 'Invalid credentials' });
    }
  } else {
    // Если пользователь не найден, возвращаем ошибку Unauthorized
    response.status(401).json({ message: 'Invalid credentials' });
  }
}
```

Мы определяем асинхронную функцию `login` для обработки аутентификации пользователей. Функция начинается с валидации тела входящего запроса с помощью посредника `validateBody` со схемой Zod. Эта схема проверяет, что тело содержит валидный email и пароль, состоящий как минимум из 8 символов.

После валидации функция пытается извлечь пользователя из БД по email путем вызова `retrieveUserProfileFromDatabaseByEmail()`. Если пользователь найден, функция проверяет пароль путем его сравнения с сохраненным хэшем с помощью функции `getIsPasswordValid`.

Если пароль верный, функция генерирует токен JWT с помощью `generateJwtToken()`, устанавливает этот токен как HTTP-only куки в ответ с помощью `setJwtCookie()` и, наконец, отправляет ответ со статусом 200 и сообщением об успехе. Если пользователь не найден или указан неверный пароль, функция возвращает статус 401 с сообщением "Invalid credentials".

Тесты все еще падают, поскольку роут не добавлен в роутер.

```typescript
// src/features/user-authentication/user-authentication-routes.ts
import { Router } from 'express';

import { asyncHandler } from '~/utils/async-handler.js';

import { login } from './user-authentication-controller.js';

const router = Router();

router.post('/login', asyncHandler(login));

export { router as userAuthenticationRoutes };
```

Роутер также должен быть добавлен в `apiV1Router`:

```typescript
// src/routes.ts
import { Router } from 'express';

import { healthCheckRoutes } from '~/features/health-check/health-check-routes.js';
import { userAuthenticationRoutes } from '~/features/user-authentication/user-authentication-routes.js';

export const apiV1Router = Router();

apiV1Router.use('/health-check', healthCheckRoutes);
apiV1Router.use(userAuthenticationRoutes);
```

Обратите внимание на отсутствие сегмента `/authentication`. Это объясняется тем, что мы хотим, чтобы эти роуты были доступными на верхнем уровне API через `/login`, `/register` и `/logout`.

Теперь тесты должны проходить.

# Регистрация

Обычно, начинают с реализации роута регистрации, но роут логина проще, поэтому мы начали с него.

Добавляем тесты для роута регистрации:

```typescript
// src/features/user-authentication/user-authentication.test.ts
describe('/api/v1/register', () => {
  test('дано: валидные данные для регистрации, ожидается: создание пользователя и возврат статуса 201', async () => {
    const app = buildApp();
    const email = 'test@example.com';
    const password = 'password123';

    const { body: actual } = await request(app)
      .post('/api/v1/register')
      .send({ email, password })
      .expect(201);

    expect(actual).toEqual({ message: 'User registered successfully' });

    // Проверяем запись пользователя в БД
    const createdUser = await retrieveUserProfileFromDatabaseByEmail(email);
    expect(createdUser).toBeDefined();
    expect(createdUser?.email).toEqual(email);

    // Очистка
    if (createdUser) {
      await deleteUserProfileFromDatabaseById(createdUser.id);
    }
  });

  test('дано: email, который уже существует, ожидается: возврат статуса 409', async () => {
    const password = createId();
    const { app, userProfile } = await setup({ password });

    const { body: actual } = await request(app)
      .post('/api/v1/register')
      .send({ email: userProfile.email, password: 'newpassword123' })
      .expect(409);

    expect(actual).toEqual({ message: 'User already exists' });
  });

  test('дано: невалидные данные для регистрации, ожидается: возврат статуса 400', async () => {
    const app = buildApp();

    const { body: actual } = await request(app)
      .post('/api/v1/register')
      .send({})
      .expect(400);

    expect(actual).toEqual({
      message: 'Bad Request',
      errors: [
        {
          code: 'invalid_type',
          expected: 'string',
          message: 'Invalid input: expected string, received undefined',
          path: ['email'],
        },
        {
          code: 'invalid_type',
          expected: 'string',
          message: 'Invalid input: expected string, received undefined',
          path: ['password'],
        },
      ],
    });
  });
});
```

Сначала тест проверяет передачу валидных данных для регистрации - нового email и пароля. Затем создается новый пользователь и возвращается статус 201 с сообщением об успехе.

Второй тест проверяет, что попытка регистрации аккаунта с email, который уже использовался, возвращает статус 409 с сообщением об ошибке, что предотвращает дублирование аккаунтов.

Третий тест проверяет, что конечная точка возвращает статус 400 и правильно обрабатывает невалидные данные для регистрации.

У нас есть все необходимое для реализации роута регистрации:

```typescript
// src/features/user-authentication/user-authentication-controller.ts
// Другие импорты...
import {
  retrieveUserProfileFromDatabaseByEmail,
  saveUserProfileToDatabase,
} from '../user-profile/user-profile-model.js';
import {
  generateJwtToken,
  getIsPasswordValid,
  hashPassword,
  setJwtCookie,
} from './user-authentication-helpers.js';

// Другие обработчики...

export async function register(request: Request, response: Response) {
  // Валидируем тело запроса на наличие валидного email и пароля
  // из 8 символов, минимум
  const body = await validateBody(
    z.object({
      email: z.email(),
      password: z.string().min(8),
    }),
    request,
    response,
  );

  // Проверяем наличие пользователя с этим email
  const existingUser = await retrieveUserProfileFromDatabaseByEmail(body.email);

  if (existingUser) {
    response.status(409).json({ message: 'User already exists' });
  } else {
    // Хэшируем пароль и создаем профиль пользователя
    const hashedPassword = await hashPassword(body.password);
    const user = await saveUserProfileToDatabase({
      email: body.email,
      hashedPassword,
    });

    const token = generateJwtToken(user);
    setJwtCookie(response, token);

    response.status(201).json({ message: 'User registered successfully' });
  }
}
```

Мы валидируем email и пароль пользователя, как обычно, и проверяем, что пользователь еще не регистрировался.

Далее, мы хэшируем пароль и создаем профиль пользователя. Затем генерируем токен JWT, устанавливаем его как HTTP-only куки и отправляем статус 201 с сообщением об успехе.

Обратите внимание, что мы не выбрасываем ошибку 400 явно. Это связано с тем, что посредник `validateBody()` сам выбрасывает такую ошибку, если тело запроса является невалидным.

```typescript
// src/features/user-authentication/user-authentication-routes.ts
import { Router } from 'express';

import { asyncHandler } from '~/utils/async-handler.js';

import { login, register } from './user-authentication-controller.js';

const router = Router();

router.post('/login', asyncHandler(login));
router.post('/register', asyncHandler(register));

export { router as userAuthenticationRoutes };
```

Теперь тесты должны проходить.

# Выход из системы

Для проверки выхода из системы требуется только один тест, поскольку все, что нужно сделать роуту, - указать браузеру удалить куки JWT:

```typescript
// src/features/user-authentication/user-authentication.test.ts
describe('/api/v1/logout', () => {
  test('дано: любой запрос POST, ожидается: очистка JWT куки и возврат статуса 200', async () => {
    const { app } = await setup();

    const response = await request(app).post('/api/v1/logout').expect(200);

    expect(response.body).toEqual({ message: 'Logged out successfully' });

    // Проверяем очистку куки
    const cookies = response.headers['set-cookie'] as unknown as string[];
    expect(cookies).toBeDefined();
    expect(cookies).toEqual([
      'jwt=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Strict',
    ]);
  });
});
```

Для реализации роута выхода из системы требуется еще одна вспомогательная функция:

```typescript
// src/features/user-authentication/user-authentication-helpers.ts
/**
 * Модифицирует ответ, указываю браузеру удалить куки JWT.
 *
 * @param response Объект ответа для очистки куки.
 */
export function clearJwtCookie(response: Response) {
  response.clearCookie(JWT_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
}
```

Теперь мы можем реализовать сам роут:

```typescript
// src/features/user-authentication/user-authentication-controller.ts
// Другие импорты...
import {
  clearJwtCookie,
  generateJwtToken,
  getIsPasswordValid,
  hashPassword,
  setJwtCookie,
} from './user-authentication-helpers.js';

// Другие обработчики...

export async function logout(request: Request, response: Response) {
  clearJwtCookie(response);

  response.status(200).json({ message: 'Logged out successfully' });
}
```

Добавляем его в роутер:

```typescript
// src/features/user-authentication/user-authentication-routes.ts
import { Router } from 'express';

import { asyncHandler } from '~/utils/async-handler.js';

import { login, logout, register } from './user-authentication-controller.js';

const router = Router();

router.post('/login', asyncHandler(login));
router.post('/register', asyncHandler(register));
router.post('/logout', asyncHandler(logout));

export { router as userAuthenticationRoutes };
```

Теперь тесты должны проходить.

# Посредник аутентификации

Еще одна необходимая функция, связанная с аутентификацией, - это посредник для защиты роутов от доступа неаутентифицированных пользователей.

Нам не нужны тесты для этой функции, поскольку этот посредник:

- может тестироваться только с помощью моков
- будет тестироваться в интеграционных тестах

Если хотите, можете самостоятельно написать тест для функции `isTokenValid`.

```typescript
// src/features/user-authentication/user-authentication-helpers.ts
// Другие импорты...
import type { Request, Response } from 'express';

/**
 * Проверяет валидность токена.
 *
 * @param token Токен для проверки.
 * @returns true, если токен валиден, иначе false.
 */
const isTokenValid = (token: jwt.JwtPayload | string) => {
  if (
    typeof token === 'object' &&
    token !== null &&
    'id' in token &&
    'email' in token
  ) {
    return true;
  }

  return false;
};

/**
 * Извлекает токен JWT из куки.
 *
 * @param request Объект запроса, содержащий куки.
 * @returns Токен JWT из куки.
 */
export function getJwtTokenFromCookie(request: Request) {
  const token = request.cookies[JWT_COOKIE_NAME];

  if (!token) {
    throw new Error('No token found');
  }

  const decodedToken = jwt.verify(token, process.env.JWT_SECRET as string);

  if (isTokenValid(decodedToken)) {
    return decodedToken;
  }

  throw new Error('Invalid token payload');
}
```

Функция `isTokenValid` проверяет, что декодированный токен имеет правильную структуру (объект с полями `id` и `email`).

Функция `getJwtTokenFromCookie` извлекает токен JWT из куки запроса по предопределенному названию куки (`JWT_COOKIE_NAME`). Далее, токен проверяется с помощью секрета, валидируется с помощью `isTokenValid()` и, если все хорошо, возвращается декодированный токен. Если токен невалиден или отсутствует, выбрасывается ошибка.

Теперь можно реализовать посредника:

```typescript
// src/middleware/require-authentication.ts
import type { Request, Response } from 'express';

import { getJwtTokenFromCookie } from '~/features/user-authentication/user-authentication-helpers.js';

/**
 * Извлекает полезную нагрузку из токена JWT.
 * Выбрасывает ошибку, если токен отсутствует или невалиден.
 *
 * @param request Объект запроса для извлечения токена.
 * @returns Полезная нагрузка токена, содержащая ID и email пользователя.
 */
export function requireAuthentication(request: Request, response: Response) {
  try {
    return getJwtTokenFromCookie(request);
  } catch {
    throw response.status(401).json({ message: 'Unauthorized' });
  }
}
```

Этот посредник может использоваться следующим образом:

```typescript
// temp-require-authentication-example.ts
import express from 'express';
import cookieParser from 'cookie-parser';

import { requireAuthentication } from '../middleware/require-authentication.js';

const app = express();
app.use(cookieParser()); // подключаем cookie-parser

app.get('/protected/profile', async (request, response, next) => {
  try {
    // Получаем полезную нагрузку токена
    const { id, email } = requireAuthentication(request, response);

    // Используем ID и email аутентифицированного пользователя в ответе
    response.status(200).json({
      message: `Hello, ${email}! Your user ID is ${id}`,
      userId: id,
    });
  } catch (error) {
    next(error);
  }
});
```

# CRUD роуты для профилей пользователей

Реализуем целую фичу.

Остался один важный вопрос: как получить аутентифицированного пользователя в тестах? Скоро вы это узнаете.

```typescript
// src/features/user-profile/user-profile.test.ts
import type { UserProfile } from '@prisma/client';
import request from 'supertest';
import { describe, expect, onTestFinished, test } from 'vitest';

import { buildApp } from '~/app.js';

import {
  generateJwtToken,
  JWT_COOKIE_NAME,
} from '../user-authentication/user-authentication-helpers.js';
import { createPopulatedUserProfile } from './user-profile-factories.js';
import {
  deleteUserProfileFromDatabaseById,
  saveUserProfileToDatabase,
} from './user-profile-model.js';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function setup(numberOfProfiles = 1) {
  const app = buildApp();

  const profiles: UserProfile[] = [];
  for (let i = 0; i < numberOfProfiles; i += 1) {
    const profile = await saveUserProfileToDatabase(
      createPopulatedUserProfile(),
    );
    profiles.push(profile);
    // Искусственная задержка для обеспечения уникальных временных меток createdAt
    await sleep(100);
  }

  const token = generateJwtToken(profiles[0]!);

  onTestFinished(async () => {
    try {
      await Promise.all(
        profiles.map(profile => deleteUserProfileFromDatabaseById(profile.id)),
      );
    } catch {
      // Нам нужен перехват ошибок для обработки тестов, удаляющих профили пользователей.
      // Если тест падает и код реализации не удаляет профили пользователей,
      // нам необходимо удалить их в блоке try.
      // Если тест проходит и код реализации удаляет профили пользователей,
      // эта очистка выбрасывает исключение
    }
  });

  return {
    app,
    token,
    profiles: profiles.toSorted(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    ),
  };
}

describe('/api/v1/user-profiles', () => {
  describe('/', () => {
    describe('GET', () => {
      test('дано: неаутентифицированный запрос, ожидается: возврат статуса 401', async () => {
        const { app } = await setup();

        const { status: actual } = await request(app).get(
          '/api/v1/user-profiles',
        );
        const expected = 401;

        expect(actual).toEqual(expected);
      });

      test('дано: существует несколько профилей, ожидается: возврат статуса 200 с пагинированными профилями', async () => {
        const { app, profiles, token } = await setup(3);
        const [first, second] = profiles as [UserProfile, UserProfile];

        const actual = await request(app)
          .get('/api/v1/user-profiles')
          .set('Cookie', [`${JWT_COOKIE_NAME}=${token}`])
          .query({ page: 1, pageSize: 2 })
          .expect(200);
        const expected = [
          {
            id: first.id,
            email: first.email,
            name: first.name,
            hashedPassword: first.hashedPassword,
            createdAt: first.createdAt.toISOString(),
            updatedAt: first.updatedAt.toISOString(),
          },
          {
            id: second.id,
            email: second.email,
            name: second.name,
            hashedPassword: second.hashedPassword,
            createdAt: second.createdAt.toISOString(),
            updatedAt: second.updatedAt.toISOString(),
          },
        ];

        expect(actual.body).toHaveLength(2);
        expect(actual.body).toEqual(expected);
      });

      test('дано: переданы параметры поисковой строки, ожидается: возврат статуса 200 с профилями запрашиваемой страницы', async () => {
        const { app, profiles, token } = await setup(5);
        const [third, fourth] = profiles.slice(2, 4) as [
          UserProfile,
          UserProfile,
        ];

        const actual = await request(app)
          .get('/api/v1/user-profiles')
          .set('Cookie', [`${JWT_COOKIE_NAME}=${token}`])
          .query({ page: 2, pageSize: 2 })
          .expect(200);
        const expected = [
          {
            id: third.id,
            email: third.email,
            name: third.name,
            createdAt: third.createdAt.toISOString(),
            updatedAt: third.updatedAt.toISOString(),
            hashedPassword: third.hashedPassword,
          },
          {
            id: fourth.id,
            email: fourth.email,
            name: fourth.name,
            createdAt: fourth.createdAt.toISOString(),
            updatedAt: fourth.updatedAt.toISOString(),
            hashedPassword: fourth.hashedPassword,
          },
        ];

        expect(actual.body).toHaveLength(2);
        expect(actual.body).toEqual(expected);
      });

      test('дано: параметры поисковой строки отсутствуют, ожидается: возврат статуса 200 с дефолтными значениями пагинации', async () => {
        const { app, profiles, token } = await setup(15);
        const firstTenProfiles = profiles.slice(0, 10);

        const actual = await request(app)
          .get('/api/v1/user-profiles')
          .set('Cookie', [`${JWT_COOKIE_NAME}=${token}`])
          .expect(200);
        const expected = firstTenProfiles.map(profile => ({
          id: profile.id,
          email: profile.email,
          name: profile.name,
          createdAt: profile.createdAt.toISOString(),
          updatedAt: profile.updatedAt.toISOString(),
          hashedPassword: profile.hashedPassword,
        }));

        expect(actual.body).toHaveLength(10);
        expect(actual.body).toEqual(expected);
      });
    });
  });
});
```

Мы снова определяем вспомогательную функцию `setup`. В ней создается приложение, несколько профилей в БД, настраивается очистка для удаления профилей после завершения тестов и генерируется токен JWT для аутентифицированного пользователя.

Далее определяется тест для конечной точки `/api/v1/user-profiles`:

- __тестирование неаутентифицированного запроса__: в этом случае GET-запрос должен возвращать статус 401
- __тестирование пагинации с несколькими профилями__: проверяется, что при наличии нескольких профилей и валидной аутентификации, GET-запрос с определенными параметрами поисковой строки (`page` и `pageSize`) возвращает корректно пагинированные профили пользователей
- __тестирование пагинации с параметрами поисковой строки__: проверяется, что запрос определенной страницы с помощью параметров поисковой строки возвращает правильный набор профилей пользователей
- __тестирование дефолтной пагинации__: проверяется, что при отсутствии параметров поисковой строки, API возвращает дефолтное количество профилей (10 в нашем случае)

В тестах аутентификация выполняется путем добавления токена JWT в запросы.

```typescript
// src/features/user-profile/user-profile-controller.ts
import type { Request, Response } from 'express';
import { z } from 'zod';

import { requireAuthentication } from '~/middleware/require-authentication.js';
import { validateQuery } from '~/middleware/validate.js';

import { retrieveManyUserProfilesFromDatabase } from './user-profile-model.js';

export async function getAllUserProfiles(request: Request, response: Response) {
  requireAuthentication(request, response);
  const query = await validateQuery(
    z.object({
      page: z.coerce.number().positive().default(1),
      pageSize: z.coerce.number().positive().default(10),
    }),
    request,
    response,
  );

  const profiles = await retrieveManyUserProfilesFromDatabase({
    page: query.page,
    pageSize: query.pageSize,
  });

  response.status(200).json(profiles);
}
```

Благодаря посреднику и фасадам реализация роута является тривиальной. Сначала проверяется, что пользователь аутентифицирован, затем валидируются параметры поисковой строки и, наконец, профили извлекаются из БД.

Добавляем обработчик:

```typescript
// src/routes.ts
import { Router } from 'express';

import { healthCheckRoutes } from '~/features/health-check/health-check-routes.js';
import { userAuthenticationRoutes } from '~/features/user-authentication/user-authentication-routes.js';
import { userProfileRoutes } from '~/features/user-profile/user-profile-routes.js';

export const apiV1Router = Router();

apiV1Router.use('/health-check', healthCheckRoutes);
apiV1Router.use(userAuthenticationRoutes);
apiV1Router.use('/user-profiles', userProfileRoutes);
```

Теперь тесты должны проходить.

Напишем тесты для получения профиля пользователя, его обновления и удаления по id:

```typescript
// src/features/user-profile/user-profile.test.ts
import { createId } from '@paralleldrive/cuid2';
import type { UserProfile } from '@prisma/client';
import request from 'supertest';
import { describe, expect, onTestFinished, test } from 'vitest';

import { buildApp } from '~/app.js';

import {
  generateJwtToken,
  JWT_COOKIE_NAME,
} from '../user-authentication/user-authentication-helpers.js';
import { createPopulatedUserProfile } from './user-profile-factories.js';
import {
  deleteUserProfileFromDatabaseById,
  saveUserProfileToDatabase,
} from './user-profile-model.js';

// Функция setup...

describe('/api/v1/user-profiles', () => {
  describe('/', () => {
    // Тесты получения списка профилей...
  });

  describe('/:id', () => {
    describe('GET', () => {
      test('дано: неаутентифицированный запрос, ожидается: возврат статуса 401', async () => {
        const { app, profiles } = await setup();
        const [profile] = profiles as [UserProfile];

        const { status: actual } = await request(app).get(
          `/api/v1/user-profiles/${profile.id}`,
        );
        const expected = 401;

        expect(actual).toEqual(expected);
      });

      test('дано: профиль существует, ожидается: возврат статуса 200 с профилем', async () => {
        const { app, profiles, token } = await setup();
        const [profile] = profiles as [UserProfile];

        const actual = await request(app)
          .get(`/api/v1/user-profiles/${profile.id}`)
          .set('Cookie', [`${JWT_COOKIE_NAME}=${token}`])
          .expect(200);
        const expected = {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          createdAt: profile.createdAt.toISOString(),
          updatedAt: profile.updatedAt.toISOString(),
          hashedPassword: profile.hashedPassword,
        };

        expect(actual.body).toEqual(expected);
      });

      test('дано: профиля не существует, ожидается: возврат статуса 404 с сообщением об ошибке', async () => {
        const { app, token } = await setup();
        const nonExistentId = createId();
        const actual = await request(app)
          .get(`/api/v1/user-profiles/${nonExistentId}`)
          .set('Cookie', [`${JWT_COOKIE_NAME}=${token}`])
          .expect(404);
        const expected = { message: 'Not Found' };

        expect(actual.body).toEqual(expected);
      });
    });

    describe('PATCH', () => {
      test('дано: неаутентифицированный запрос, ожидается: возврат статуса 401', async () => {
        const { app, profiles } = await setup();
        const [profile] = profiles as [UserProfile];
        const updates = { name: 'Updated Name' };

        const { status: actual } = await request(app)
          .patch(`/api/v1/user-profiles/${profile.id}`)
          .send(updates);
        const expected = 401;

        expect(actual).toEqual(expected);
      });

      test('дано: профиль существует и новые данные валидны, ожидается: возврат статуса 200 с обновленным профилем', async () => {
        const { app, profiles, token } = await setup();
        const [profile] = profiles as [UserProfile];

        const updates = { name: 'Updated Name', ignoredField: 'ignoreMe' };
        const actual = await request(app)
          .patch(`/api/v1/user-profiles/${profile.id}`)
          .set('Cookie', [`${JWT_COOKIE_NAME}=${token}`])
          .send(updates)
          .expect(200);
        const expected = {
          id: profile.id,
          email: profile.email,
          name: updates.name,
          createdAt: profile.createdAt.toISOString(),
          updatedAt: actual.body.updatedAt,
          hashedPassword: profile.hashedPassword,
        };

        expect(actual.body).toEqual(expected);
      });

      test('дано: невалидный id, ожидается: возврат статуса 404 с сообщением об ошибке', async () => {
        const { app, token } = await setup();
        const updates = { name: 'Updated Name' };
        const nonExistentId = createId();

        const actual = await request(app)
          .patch(`/api/v1/user-profiles/${nonExistentId}`)
          .set('Cookie', [`${JWT_COOKIE_NAME}=${token}`])
          .send(updates)
          .expect(404);
        const expected = { message: 'Not Found' };

        expect(actual.body).toEqual(expected);
      });

      test('дано: пустой объект обновления, ожидается: возврат статуса 400 с сообщением об ошибке', async () => {
        const { app, profiles, token } = await setup();
        const [profile] = profiles as [UserProfile];

        const actual = await request(app)
          .patch(`/api/v1/user-profiles/${profile.id}`)
          .set('Cookie', [`${JWT_COOKIE_NAME}=${token}`])
          .send({})
          .expect(400);
        const expected = { message: 'No valid fields to update' };

        expect(actual.body).toEqual(expected);
      });

      test('дано: попытка обновления id, ожидается: возврат статуса 400 с сообщением об ошибке', async () => {
        const { app, profiles, token } = await setup();
        const [profile] = profiles as [UserProfile];

        const updates = { id: 'new-id' };
        const actual = await request(app)
          .patch(`/api/v1/user-profiles/${profile.id}`)
          .set('Cookie', [`${JWT_COOKIE_NAME}=${token}`])
          .send(updates)
          .expect(400);
        const expected = {
          message: 'Bad Request',
          errors: [
            {
              code: 'invalid_type',
              expected: 'never',
              message: 'Invalid input: expected never, received string',
              path: ['id'],
            },
          ],
        };

        expect(actual.body).toEqual(expected);
      });

      test('дано: отсутствует id в URL, ожидается: возврат статуса 404', async () => {
        const { app, token } = await setup();
        const updates = { name: 'Updated Name' };

        const actual = await request(app)
          .patch('/api/v1/user-profiles/')
          .set('Cookie', [`${JWT_COOKIE_NAME}=${token}`])
          .send(updates);
        const expected = 404;

        expect(actual.status).toEqual(expected);
      });
    });

    describe('DELETE', () => {
      test('дано: неаутентифицированный запрос, ожидается: возврат статуса 401', async () => {
        const { app, profiles } = await setup();
        const [profile] = profiles as [UserProfile];

        const { status: actual } = await request(app).delete(
          `/api/v1/user-profiles/${profile.id}`,
        );
        const expected = 401;

        expect(actual).toEqual(expected);
      });

      test('дано: профиль существует, ожидается: возврат статуса 200 с удаленным профилем', async () => {
        const { app, profiles, token } = await setup();
        const [profile] = profiles as [UserProfile];

        const actual = await request(app)
          .delete(`/api/v1/user-profiles/${profile.id}`)
          .set('Cookie', [`${JWT_COOKIE_NAME}=${token}`])
          .expect(200);
        const expected = {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          createdAt: profile.createdAt.toISOString(),
          updatedAt: profile.updatedAt.toISOString(),
          hashedPassword: profile.hashedPassword,
        };

        expect(actual.body).toEqual(expected);
      });

      test('дано: профиля не существует, ожидается: возврат статуса 404 с сообщением об ошибке', async () => {
        const { app, token } = await setup();
        const nonExistentId = createId();

        const actual = await request(app)
          .delete(`/api/v1/user-profiles/${nonExistentId}`)
          .set('Cookie', [`${JWT_COOKIE_NAME}=${token}`])
          .expect(404);
        const expected = { message: 'Not Found' };

        expect(actual.body).toEqual(expected);
      });

      test('дано: отсутствует id в URL, ожидается: возврат статуса 404', async () => {
        const { app, token } = await setup();

        const actual = await request(app)
          .delete('/api/v1/user-profiles/')
          .set('Cookie', [`${JWT_COOKIE_NAME}=${token}`]);
        const expected = 404;

        expect(actual.status).toEqual(expected);
      });
    });
  });
});
```

Для GET-запросов тестируется извлечение профиля по его ID. Если профиль существует, API должен возвращать статус 200 с верными данными профиля; если профиля не существует, ожидается возврат статуса 404 с соответствующим сообщением об ошибке.

Для PATCH-запросов проверяется несколько сценариев обновления. В ответ на попытку неаутентифицированного обновления возвращается статус 401, а в ответ на валидные новые данные существующего профиля - статус 200 с обновленным профилем. Кроме того, тестируются крайние случаи, такие как попытка обновления несуществующего профиля, отправка пустого объекта обновления и попытка модификации иммутабельных полей, таких как ID профиля. Во всех этих случаях должны возвращаться соответствующие ответы с ошибками.

Для DELETE-запросов проверяется, что неаутентифицированное удаление отклоняется со статусом 401. При удалении существующего профиля с валидной аутентификацией ожидается возврат статуса 200 с удаленным профилем. Также тестируется, что попытка удаления несуществующего профиля или отсутствие ID профиля в URL заканчиваются статусом 404 с сообщением об ошибке.

Существует много способов реализовать эти роуты. Мы оставим проверку дубликатов Prisma, а для определения правильной ошибки может быть использована простая вспомогательная функция `getErrorMessage`. Напишем для нее тесты:

```typescript
import { faker } from '@faker-js/faker';
import { describe, expect, test } from 'vitest';

import { getErrorMessage } from './get-error-message.js';

describe('getErrorMessage()', () => {
  test('дано: ошибка, ожидается: возврат сообщения об ошибке', () => {
    const message = faker.word.words();

    expect(getErrorMessage(new Error(message))).toEqual(message);
  });

  test('дано: выброс строки, ожидается: возврат строки', () => {
    expect.assertions(1);

    const someString = faker.lorem.words();

    try {
      throw someString;
    } catch (error) {
      expect(getErrorMessage(error)).toEqual(someString);
    }
  });

  test('дано: выброс числа, ожидается: возврат числа в виде строки', () => {
    expect.assertions(1);

    const someNumber = 1;

    try {
      throw someNumber;
    } catch (error) {
      expect(getErrorMessage(error)).toEqual(String(someNumber));
    }
  });

  test('дано: ошибка, расширяющая класс ошибок, ожидается: возврат сообщения об ошибке', () => {
    class CustomError extends Error {
      public constructor(message: string) {
        super(message);
      }
    }

    const message = faker.word.words();

    expect(getErrorMessage(new CustomError(message))).toEqual(message);
  });

  test('дано: кастомный объект со свойством message, ожидается: возврат свойства message объекта', () => {
    const message = faker.word.words();

    expect(getErrorMessage({ message })).toEqual(message);
  });

  test('дано: циклическая зависимость, ожидается: правильная обработка такой зависимости', () => {
    expect.assertions(1);

    const object = { circular: this };

    try {
      throw object;
    } catch (error) {
      expect(getErrorMessage(error)).toEqual('[object Object]');
    }
  });
});
```

Эти тесты проверяют разные типы ошибок, передаваемые `getErrorMessage()`. Проверяется, что `getErrorMessage()` корректно извлекает сообщение из стандартной `Error`, возвращает строку, если выбрасывается строка или число. Также проверяется, что функция правильно обрабатывает кастомные ошибки и объекты со свойством `message`, а также справляется с циклическими зависимостями путем возврата дефолтного строкового представления объекта.

Реализуем функцию `getErrorMessage`:

```typescript
// src/utils/get-error-message.ts
type ErrorWithMessage = {
  message: string;
};

// Проверяет наличие свойства `message` в стандартных ошибках,
// кастомных ошибках и объектах
function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}

function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
  if (isErrorWithMessage(maybeError)) return maybeError;

  try {
    if (typeof maybeError === 'string') return new Error(maybeError);

    return new Error(JSON.stringify(maybeError));
  } catch {
    // JSON.stringify() выбрасывает исключение в случае циклической зависимости.
    // Мы перехватываем его здесь и приводим к строке [object Object]
    return new Error(String(maybeError));
  }
}

/**
 * Извлекает сообщение из ошибки или другого исключения.
 *
 * @param error Ошибка или другое исключение.
 * @returns Строка с сообщением об ошибке.
 *
 * @example
 *
 * Экземпляр Error:
 *
 * ```typescript
 * getErrorMessage(new Error('Something went wrong'))
 * // 'Something went wrong'
 * ```
 *
 * Объект:
 *
 * ```typescript
 * getErrorMessage({ message: 'Something went wrong' })
 * // 'Something went wrong'
 * ```
 *
 * Примитив:
 *
 * ```typescript
 * getErrorMessage('Something went wrong')
 * // 'Something went wrong'
 * ```
 */
export function getErrorMessage(error: unknown) {
  return toErrorWithMessage(error).message;
}
```

Начинаем с определения типа `ErrorWithMessage` - объекта со свойством `message` типа `string`, затем реализует защитник типа (type guard) `isErrorWithMessage` для подтверждения этого.

Далее, определяем функцию `toErrorWithMessage`, которая конвертирует любое выброшенное значение в объект `ErrorWithMessage`.

Наконец, `getErrorMessage()` извлекает свойство `message` из конвертированного объекта, обеспечивая согласованность сообщений об ошибках.

Теперь можно реализовать роуты:

```typescript
// src/features/user-profile/user-profile-controller.ts
// Другие импорты...
import {
  validateBody,
  validateParams,
  validateQuery,
} from '~/middleware/validate.js';
import { getErrorMessage } from '~/utils/get-error-message.js';

import {
  deleteUserProfileFromDatabaseById,
  retrieveManyUserProfilesFromDatabase,
  retrieveUserProfileFromDatabaseById,
  updateUserProfileInDatabaseById,
} from './user-profile-model.js';

// Обработчик получения списка профилей...

export async function getUserProfileById(request: Request, response: Response) {
  requireAuthentication(request, response);
  const { id } = await validateParams(
    z.object({ id: z.cuid2() }),
    request,
    response,
  );
  const profile = await retrieveUserProfileFromDatabaseById(id);

  if (profile) {
    response.status(200).json(profile);
  } else {
    response.status(404).json({ message: 'Not Found' });
  }
}

export async function updateUserProfile(request: Request, response: Response) {
  requireAuthentication(request, response);
  const { id } = await validateParams(
    z.object({ id: z.cuid2() }),
    request,
    response,
  );

  const body = await validateBody(
    z.object({
      email: z.email().optional(),
      name: z.string().optional(),
      id: z.never().optional(),
    }),
    request,
    response,
  );

  // Определяем наличие полей для обновления
  if (Object.keys(body).length === 0) {
    response.status(400).json({ message: 'No valid fields to update' });
    return;
  }

  // Определяем попытку обновления id
  if ('id' in body) {
    response.status(400).json({ message: 'ID cannot be updated' });
    return;
  }

  try {
    const updatedProfile = await updateUserProfileInDatabaseById({
      id,
      data: body,
    });
    response.status(200).json(updatedProfile);
  } catch (error) {
    const message = getErrorMessage(error);

    if (message.includes('No record was found for an update')) {
      response.status(404).json({ message: 'Not Found' });
    } else if (message.includes('Unique constraint failed')) {
      response.status(409).json({ message: 'Profile already exists' });
    } else {
      throw error;
    }
  }
}

export async function deleteUserProfile(request: Request, response: Response) {
  requireAuthentication(request, response);
  const { id } = await validateParams(
    z.object({ id: z.cuid2() }),
    request,
    response,
  );

  try {
    const deletedProfile = await deleteUserProfileFromDatabaseById(id);
    response.status(200).json(deletedProfile);
  } catch (error) {
    const message = getErrorMessage(error);

    if (message.includes('No record was found for a delete')) {
      response.status(404).json({ message: 'Not Found' });
    } else {
      throw error;
    }
  }
}
```

Добавляем эти роуты в роутер:

```typescript
// src/features/user-profile/user-profile-routes.ts
import { Router } from 'express';

import { asyncHandler } from '~/utils/async-handler.js';

import {
  deleteUserProfile,
  getAllUserProfiles,
  getUserProfileById,
  updateUserProfile,
} from './user-profile-controller.js';

const router = Router();

router.get('/', asyncHandler(getAllUserProfiles));
router.get('/:id', asyncHandler(getUserProfileById));
router.patch('/:id', asyncHandler(updateUserProfile));
router.delete('/:id', asyncHandler(deleteUserProfile));

export { router as userProfileRoutes };
```

Теперь тесты должны проходить.

Для создания профиля пользователя не нужен отдельный роут, поскольку за это отвечает роут регистрации. Разумеется, в некоторых приложениях у пользователей будет возможность создавать аккаунты для других пользователей. В этом случае потребуется отдельный роут.

В этом туториале мы охватили 20% навыков по работе с Express с поддержкой TypeScript, что охватывает 80% (_прим. пер.:_ я бы сказал процентов 40:)) функционала реальных приложений. Теперь идите и создайте что-нибудь классное!