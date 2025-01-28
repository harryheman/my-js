---
sidebar_position: 2.3
title: Руководство по Convex
description: Руководство по Convex
keywords: [javascript, typescript, convex]
tags: [javascript, typescript, convex]
---

# Convex

На сегодняшний день Convex предоставляет реактивную базу данных смешанного типа, механизм аутентификации/авторизации, файловое хранилище, планировщик задач и инструменты интеллектуального поиска.

# Функции

## Запросы / Queries

Запросы - это сердце бэкенда. Они запрашивают данные из БД, проверяют аутентификацию или выполняют другую бизнес-логику и возвращают данные клиенту.

Пример запроса, принимающего именованные аргументы, читающего данные из БД и возвращающего результат:

```javascript
import { query } from "./_generated/server";
import { v } from "convex/values";

// Возвращает последние 100 задач из определенного списка
export const getTaskList = query({
  args: { taskListId: v.id("taskLists") },
  handler: async (ctx, args) => {
    const tasks = await ctx.db
      .query("tasks")
      .filter((q) => q.eq(q.field("taskListId"), args.taskListId))
      .order("desc")
      .take(100);
    return tasks;
  },
});
```

__Название запроса__

Запросы определяются в TypeScript/JavaScript-файлах в директории `convex`.

Путь, название файла, а также способ экспорта функции из него определяют, как клиент будет ее вызывать:

```javascript
// convex/myFunctions.ts
// Эта функция будет вызываться как `api.myFunctions.myQuery`
export const myQuery = …;

// Эта функция будет вызываться как `api.myFunctions.sum`
export const sum = …;
```

Директории могут быть вложенными:

```javascript
// convex/foo/myQueries.ts
// Эта функция будет вызываться как `api.foo.myQueries.listMessages`
export const listMessages = …;
```

Экспорты по умолчанию получают имя `default`:

```javascript
// convex/myFunctions.ts
// Эта функция будет вызываться как `api.myFunctions.default`.
export default …;
```

Аналогичные правила применяются к мутациям и операциям. В операциях HTTP используется другой подход к маршрутизации.

__Конструктор `query`__

Для определения запроса используется функция-конструктор `query`. Функция `handler` должна возвращать результат вызова запроса:

```javascript
import { query } from "./_generated/server";

export const myConstantString = query({
  handler: () => {
    return "Константная строка";
  },
});
```

__Аргументы запроса__

Запросы принимают именованные параметры. Они доступны в качестве второго параметра `handler()`:

```javascript
import { query } from "./_generated/server";

export const sum = query({
  handler: (_, args: { a: number; b: number }) => {
    return args.a + args.b;
  },
});
```

Аргументы и ответы автоматически сериализуются и десериализуются, так что в/из запроса могут свободно передаваться почти любые данные.

Для определения типов аргументов и их валидации используется объект `args` с валидаторами `v`:

```javascript
import { query } from "./_generated/server";
import { v } from "convex/values";

export const sum = query({
  args: { a: v.number(), b: v.number() },
  handler: (_, args) => {
    return args.a + args.b;
  },
});
```

Первый параметр `handler()` содержит контекст запроса.

__Ответ__

Запросы могут возвращать почти любые данные, которые автоматически сериализуются и десериализуются.

Запросы могут возвращать `undefined`, которое не является валидным значением Convex. На клиенте `undefined` из запроса преобразуется в `null`.

__Контекст запроса__

Конструктор `query` позволяет запрашивать данные и выполнять другие операции с помощью объекта `QueryCtx`, передаваемого `handler()` в качестве первого аргумента:

```javascript
import { query } from "./_generated/server";
import { v } from "convex/values";

export const myQuery = query({
  args: { a: v.number(), b: v.number() },
  handler: (ctx, args) => {
    // Работаем с `ctx`
  },
});
```

Какая часть контекста будет использоваться, зависит от задачи запроса:

- для извлечения данных из БД предназначено поле `db`. Обратите внимание, что функция `handler` может быть асинхронной:

```javascript
import { query } from "./_generated/server";
import { v } from "convex/values";

export const getTask = query({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
```

- для получения урлов файлов, хранящихся на сервере, предназначено поле `storage`
- для проверки аутентификации пользователя предназначено поле `auth`

__Разделение кода запросов с помощью утилит__

Для разделения кода запросов и повторного использования логики в нескольких функциях Convex, можно использовать вспомогательные утилиты:

```javascript
import { Id } from "./_generated/dataModel";
import { query, QueryCtx } from "./_generated/server";
import { v } from "convex/values";

export const getTaskAndAuthor = query({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.id);
    if (task === null) {
      return null;
    }
    return { task, author: await getUserName(ctx, task.authorId ?? null) };
  },
});

// Утилита, возвращающая имя пользователя (при наличии)
async function getUserName(ctx: QueryCtx, userId: Id<"users"> | null) {
  if (userId === null) {
    return null;
  }
  return (await ctx.db.get(userId))?.name;
}
```

__Использование пакетов NPM__

Запросы могут импортировать пакеты NPM из `node_modules`. Обратите внимание, что не все пакеты поддерживаются.

```bash
npm i @faker-js/faker
```

```javascript
import { query } from "./_generated/server";
import { faker } from "@faker-js/faker";

export const randomName = query({
  args: {},
  handler: () => {
    faker.seed();
    return faker.person.fullName();
  },
});
```

__Вызов запроса на клиенте__

Для вызова запроса из React используется хук `useQuery` вместе со сгенерированным объектом `api`:

```javascript
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export function MyApp() {
  const data = useQuery(api.myFunctions.sum, { a: 1, b: 2 });
  // Работаем с `data`
}
```

__Кэширование и реактивность__

Запросы имеют две замечательные особенности:

1. Кэширование: Convex автоматически кэширует результаты запроса. Повторные запросы с аналогичными аргументами получают данные из кэша.
2. Реактивность: клиенты могут подписываться на запросы для получения новых результатов при изменении нижележащих данных.

Чтобы эти особенности работали, функция `handler` должна быть детерминированной: она должна возвращать одинаковые результаты для одинаковых аргументов (включая контекст запроса).

По этой причине запросы не могут запрашивать данные из сторонних апи (для этого используются операции).

__Лимиты__

Запросы имеют ограничения на количество данных, которые они могут читать за раз, для обеспечения хорошей производительности.

## Мутации / Mutations

Мутации добавляют, обновляют и удаляют данные из БД, проверяют аутентификацию или выполняют другую бизнес-логику и опционально возвращают ответ клиенту.

Пример мутации, принимающей именованные аргументы, записывающей данные в БД и возвращающей результат:

```javascript
import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Создает новую задачу с определенным текстом
export const createTask = mutation({
  args: { text: v.string() },
  handler: async (ctx, args) => {
    const newTaskId = await ctx.db.insert("tasks", { text: args.text });
    return newTaskId;
  },
});
```

__Название мутации__

Мутации следуют тем же правилам именования, что и запросы.

Запросы и мутации могут определяться в одном файле при использовании именованного экспорта.

__Конструктор `mutation`__

Для определения мутации используется функция-конструктор `mutation`. Сама мутация выполняется функцией `handler`:

```javascript
import { mutation } from "./_generated/server";

export const mutateSomething = mutation({
  handler: () => {
    // Логика мутации
  },
});
```

В отличие от запроса, мутация может, но не должна возвращать ответ.

__Аргументы мутации__

Как и запросы, мутации принимают именованные аргументы, которые доступны через второй параметр `handler()`:

```javascript
import { mutation } from "./_generated/server";

export const mutateSomething = mutation({
  handler: (_, args: { a: number; b: number }) => {
    // Работаем с `args.a` и `args.b`

    // Опционально возвращаем ответ
    return "Успешный успех";
  },
});
```

Аргументы и ответы автоматически сериализуются и десериализуются, так что в/из мутации могут свободно передаваться почти любые данные.

Для определения типов аргументов и их валидации используется объект `args` с валидаторами `v`:

```javascript
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const mutateSomething = mutation({
  args: { a: v.number(), b: v.number() },
  handler: (_, args) => {
    // Работаем с `args.a` и `args.b`
  },
});
```

Первым параметром `handler()` является контекст мутации.

__Ответ__

Мутации могут возвращать почти любые данные, которые автоматически сериализуются и десериализуются.

Мутации могут возвращать `undefined`, которое не является валидным значением Convex. На клиенте `undefined` из мутации преобразуется в `null`.

__Контекст мутации__

Конструктор `mutation` позволяет записывать данные в БД и выполнять другие операции с помощью объекта `MutationCtx`, передаваемого в качестве первого аргумента `handler()`:

```javascript
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const mutateSomething = mutation({
  args: { a: v.number(), b: v.number() },
  handler: (ctx, args) => {
    // Работаем с `ctx`
  },
});
```

Какая часть контекста мутации будет использоваться, зависит от задачи мутации:

- для чтения и записи в БД используется поле `db`. Обратите внимание, что функция `handler` может быть асинхронной:

```javascript
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const addItem = mutation({
  args: { text: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.insert("tasks", { text: args.text });
  },
});
```

- для генерации урлов для файлов, хранящихся на сервере, используется поле `storage`
- для проверки аутентификации пользователя используется поле `auth`
- для планирования запуска функций в будущем используется поле `scheduler`

__Разделение кода мутаций с помощью утилит__

Для разделения кода мутаций и повторного использования логики в нескольких функциях Convex можно использовать вспомогательные утилиты:

```javascript
import { v } from "convex/values";
import { mutation, MutationCtx } from "./_generated/server";

export const addItem = mutation({
  args: { text: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.insert("tasks", { text: args.text });
    await trackChange(ctx, "addItem");
  },
});

// Утилита для фиксации изменения
async function trackChange(ctx: MutationCtx, type: "addItem" | "removeItem") {
  await ctx.db.insert("changes", { type });
}
```

Мутации могут вызывать утилиты, принимающие `QueryCtx` (контекст запроса) в качестве параметра, поскольку мутации могут делать тоже самое, что и запросы.

__Использование пакетов NPM__

Мутации могут импортировать пакеты NPM из `node_modules`. Обратите внимание, что не все пакеты поддерживаются.

```bash
npm i @faker-js/faker
```

```javascript
import { faker } from "@faker-js/faker";
import { mutation } from "./_generated/server";

export const randomName = mutation({
  args: {},
  handler: async (ctx) => {
    faker.seed();
    await ctx.db.insert("tasks", { text: "Привет, " + faker.person.fullName() });
  },
});
```

__Вызов мутации на клиенте__

Для вызова мутации из React используется хук `useMutation` вместе со сгенерированным объектом `api`:

```javascript
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

export function MyApp() {
  const mutateSomething = useMutation(api.myFunctions.mutateSomething);
  const handleClick = () => {
    mutateSomething({ a: 1, b: 2 });
  };
  // Вешаем `handleClick` на кнопку
  // ...
}
```

При вызове мутаций на клиенте, они выполняются по одной за раз с помощью одной упорядоченной очереди. Поэтому данные в БД редактируются в порядке вызова мутаций.

__Транзакции__

Мутации запускаются транзакционно. Это означает следующее:

1. Все чтения БД внутри транзакции получают согласованное отображение данных в БД. Поэтому можно не беспокоиться о конкурентном обновлении данных в середине выполнения мутации.
2. Все записи в БД фиксируются вместе. Если мутация записывает данные в БД, а затем выбрасывает исключение, данные не будут записаны в БД.

Для того, чтобы это работало, мутации должны быть детерминированными и не могут вызывать сторонние апи (для этого следует использовать операции).

__Лимиты__

Мутации имеют ограничения на количество данных, которые они могут читать и писать за раз, для обеспечения хорошей производительности.

## Операции / Actions

Операции могут вызывать сторонние сервисы для выполнения таких вещей, как обработка платежа с помощью Stripe. Они могут выполняться в среде JS Convex или в Node.js. Они могут взаимодействовать с БД через запросы и мутации.

__Название операции__

Операции следуют тем же правилам именования, что и запросы.

__Конструктор `action`__

Для определения операции используется функция-конструктор `action`. Сама операция выполняется функцией `handler`:

```javascript
import { action } from "./_generated/server";

export const doSomething = action({
  handler: () => {
    // Логика операции

    // Опционально возвращаем ответ
    return "Успешный успех";
  },
});
```

В отличие от запроса, операция может, но не должна возвращать ответ.

__Аргументы и ответы__

Аргументы и ответы операции следуют тем же правилам, что аргументы и ответы мутации:

```javascript
import { action } from "./_generated/server";
import { v } from "convex/values";

export const doSomething = action({
  args: { a: v.number(), b: v.number() },
  handler: (_, args) => {
    // Работем с `args.a` и `args.b`

    // Опционально возвращаем ответ
    return "Успешный успех";
  },
});
```

Первым аргументом `handler()` является контекст операции.

__Контекст операции__

Конструктор `action` позволяет взаимодействовать с БД и выполнять другие операции с помощью объекта `ActionCtx`, передаваемого `handler()` в качестве первого аргумента:

```javascript
import { action } from "./_generated/server";
import { v } from "convex/values";

export const doSomething = action({
  args: { a: v.number(), b: v.number() },
  handler: (ctx, args) => {
    // Работаем с `ctx`
  },
});
```

Какая часть контекста операции будет использоваться, зависит от задачи операции:

- для чтения данных из БД используется поле `runQuery`, выполняющее запрос:

```javascript
import { action, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const doSomething = action({
  args: { a: v.number() },
  handler: async (ctx, args) => {
    const data = await ctx.runQuery(internal.myFunctions.readData, {
      a: args.a,
    });
    // Работаем с `data`
  },
});

export const readData = internalQuery({
  args: { a: v.number() },
  handler: async (ctx, args) => {
    // Читаем данные из `ctx.db`
  },
});
```

`readData` - это внутренний запрос, который не доступен клиенту напрямую.

Операции, мутации и запросы могут определяться в одном файле.

- Для записи данных в БД используется поле `runMutation`, выполняющее мутацию:

```javascript
import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";

export const doSomething = action({
  args: { a: v.number() },
  handler: async (ctx, args) => {
    const data = await ctx.runMutation(internal.myMutations.writeData, {
      a: args.a,
    });
    // ...
  },
});
```

`writeData` - внутренняя мутация, которая не доступна клиенту напрямую.

- для генерации урлов для файлов, хранящихся на сервере, используется поле `storage`
- для проверки аутентификации пользователя используется поле `auth`
- для планирования запуска функций в будущем используется поле `scheduler`
- для векторного поиска по индексу используется поле `vectorSearch`

__Вызов сторонних апи и использование пакетов NPM__

Операции могут выполняться в кастомной среде выполнения JS Convex или в Node.js.

По умолчанию операции выполняются в среде Convex. Эта среда поддерживает функцию `fetch`:

```javascript
import { action } from "./_generated/server";

export const doSomething = action({
  args: {},
  handler: async () => {
    const data = await fetch("https://api.thirdpartyservice.com");
    // ...
  },
});
```

В среде Convex операции выполняются быстрее, чем в Node.js, поскольку им не требуется время на запуск среды перед выполнением (холодный старт).

Операции могут импортировать пакеты NPM, но не все пакеты поддерживаются.

Для выполнения операции в Node.js, нужно добавить в начало файла директиву `"use node"`. Обратите внимание, что другие функции Convex не могут выполняться в Node.js.

```javascript
"use node";

import { action } from "./_generated/server";
import SomeNpmPackage from "some-npm-package";

export const doSomething = action({
  args: {},
  handler: () => {
    // Работаем с `SomeNpmPackage`
  },
});
```

__Разделение кода операций с помощью утилит__

Для разделения кода операций и повторного использования логики в нескольких функциях Convex, можно использовать вспомогательные утилиты.

Обратите внимание, что между объектами `ActionCtx`, `QueryCtx` и `MutationCtx` общим является только поле `auth`.

__Вызов операции на клиенте__

Для вызова операций из React используется хук `useAction` вместе со сгенерированным объектом `api`:

```javascript
import { useAction } from "convex/react";
import { api } from "../convex/_generated/api";

export function MyApp() {
  const performMyAction = useAction(api.myFunctions.doSomething);
  const handleClick = () => {
    performMyAction({ a: 1 });
  };
  // Вешаем `handleClick` на кнопку
  // ...
}
```

В отличие от мутаций, операции, вызываемые на одном клиенте, выполняются параллельно. Каждая операция выполняется при достижении сервера. Последовательное выполнение операций - задача разработчика.

Обратите внимание: в большинстве случаев прямой вызов операции на клиенте является анти-паттерном. Вместо этого, операции должны планироваться мутациями:

```javascript
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalAction, mutation } from "./_generated/server";

export const mutationThatSchedulesAction = mutation({
  args: { text: v.string() },
  handler: async (ctx, { text }) => {
    const taskId = await ctx.db.insert("tasks", { text });
    // Планируем выполнение операции
    await ctx.scheduler.runAfter(0, internal.myFunctions.actionThatCallsAPI, {
      taskId,
      text,
    });
  },
});

export const actionThatCallsAPI = internalAction({
  args: { taskId: v.id("tasks"), text: v.string() },
  handler: (_, args): void => {
    // Работаем с `taskId` и `text`, например, обращаемся к апи
    // и запускаем другую мутацию для сохранения результата
  },
});
```

__Лимиты__

Таймаут операции составляет 10 минут. Лимиты памяти составляют 512 и 64 Мб для Node.js и среды выполнения Convex, соответственно.

Операции могут выполнять до 1000 одновременных операций, таких как выполнение запроса, мутации или `fetch()`.

__Обработка ошибок__

В отличие от запросов и мутаций, операции могут иметь побочные эффекты и поэтому не выполняются повторно Convex при возникновении ошибок. Ответственность за обработку таких ошибок и повторное выполнение операции ложится на разработчика.

__Висящие промисы__

Убедитесь, что все промисы в операциях ожидаются (awaited). Висящие промисы могут приводить к трудноуловимым багам.

## Операции HTTP / HTTP actions

Операции HTTP позволяют создавать HTTP апи прямо в Convex.

Операции HTTP принимают [Request](https://developer.mozilla.org/en-US/docs/Web/API/Request) и возвращают [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response) из [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API). Операции HTTP могут манипулировать запросом и ответом напрямую и взаимодействовать с данными в Convex через запросы, мутации и операции. Операции HTTP могут использоваться для получения веб-хуков из сторонних приложений или для определения публичных апи HTTP.

Операции HTTP предоставляются через `https://<ваш-урл>.convex.site` (например, `https://happy-animal-123.convex.site`).

__Определение операции HTTP__

Обработчики операций HTTP определяются с помощью конструктора `httpAction`, похожего на конструктор `action` для обычных операций:

```javascript
import { httpAction } from "./_generated/server";

export const doSomething = httpAction(async () => {
  // Логика операции
  return new Response();
});
```

Первый параметр `handler()` - объект `ActionCtx`, предоставляющий `auth`, `storage` и `scheduler`, а также `runQuery()`, `runMutation()` и `runAction()`.

Второй параметр содержит детали запроса. Операции HTTP не поддерживают валидацию аргументов, разбор аргументов из входящего запроса - задача разработчика.

Пример:

```javascript
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

export const postMessage = httpAction(async (ctx, request) => {
  const { author, body } = await request.json();

  await ctx.runMutation(internal.messages.sendOne, {
    body: `Отправлено с помощью операции HTTP: ${body}`,
    author,
  });

  return new Response(null, {
    status: 200,
  });
});
```

Для создания операции HTTP из файла `convex/http.ts|js` должен по умолчанию экспортироваться экземпляр `HttpRouter`. Для его создания используется функция `httpRouter`. Маршруты определяются с помощью метода `route`:

```javascript
// convex/http.ts
import { httpRouter } from "convex/server";
import { postMessage, getByAuthor, getByAuthorPathSuffix } from "./messages";

const http = httpRouter();

http.route({
  path: "/postMessage",
  method: "POST",
  handler: postMessage,
});

// Дополнительные роуты
http.route({
  path: "/getMessagesByAuthor",
  method: "GET",
  handler: getByAuthor,
});

// Определение роута с помощью префикса пути
http.route({
  // Будет совпадать с /getAuthorMessages/User+123, /getAuthorMessages/User+234 и т.п.
  pathPrefix: "/getAuthorMessages/",
  method: "GET",
  handler: getByAuthorPathSuffix,
});

// Роутер должен экспортироваться по умолчанию
export default http;
```

После этого операция может вызываться через HTTP и взаимодействовать с данными, хранящимися в БД Convex:

```bash
export DEPLOYMENT_NAME="happy-animal-123"
curl -d '{ "author": "User 123", "body": "Hello world" }' \
  -H 'content-type: application/json' "https://$DEPLOYMENT_NAME.convex.site/postMessage"
```

__Лимиты__

Операции HTTP запускаются в той же среде, что запросы и мутации, поэтому не имеют доступа к апи Node.js. Однако они могут вызывать операции, которые могут выполняться в Node.js.

Операции HTTP могут иметь побочные эффекты и не выполняются повторно Convex при возникновении ошибок. Обработка таких ошибок и повторное выполнение операции HTTP - задачи разработчика.

Размеры запроса и ответа ограничены 20 Мб.

Типы поддерживаемых тел запросов и ответов: `.text()`, `.json()`, `.blob()` и `.arrayBuffer()`.

__Популярные паттерны__

_Хранилище файлов_

Операции HTTP могут использоваться для загрузки и извлечения файлов.

_CORS_

Операции HTTP должны содержать заголовки [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) для получения запросов от клиента:

```javascript
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";

const http = httpRouter();

http.route({
  path: "/sendImage",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // Шаг 1: сохраняем файл
    const blob = await request.blob();
    const storageId = await ctx.storage.store(blob);

    // Шаг 2: сохраняем идентификатор файла в БД с помощью мутации
    const author = new URL(request.url).searchParams.get("author");
    await ctx.runMutation(api.messages.sendImage, { storageId, author });

    // Шаг 3: возвращаем ответ с правильными заголовками CORS
    return new Response(null, {
      status: 200,
      // Заголовки CORS
      headers: new Headers({
        // Например, https://mywebsite.com (настраивается с помощью панели управления Convex)
        "Access-Control-Allow-Origin": process.env.CLIENT_ORIGIN!,
        Vary: "origin",
      }),
    });
  }),
});

export default http;
```

Пример обработки предварительного запроса `OPTIONS`:

```javascript
// Предварительный запрос для /sendImage
http.route({
  path: "/sendImage",
  method: "OPTIONS",
  handler: httpAction(async (_, request) => {
    // Проверяем наличие необходимых заголовков
    const headers = request.headers;
    if (
      headers.get("Origin") !== null &&
      headers.get("Access-Control-Request-Method") !== null &&
      headers.get("Access-Control-Request-Headers") !== null
    ) {
      return new Response(null, {
        headers: new Headers({
          "Access-Control-Allow-Origin": process.env.CLIENT_ORIGIN!,
          "Access-Control-Allow-Methods": "POST",
          "Access-Control-Allow-Headers": "Content-Type, Digest",
          "Access-Control-Max-Age": "86400",
        }),
      });
    } else {
      return new Response();
    }
  }),
});
```

_Аутентификация_

Данные аутентифицированного пользователя можно получить с помощью `ctx.auth.getUserIdentity()`. Затем `tokenIdentifier` можно добавить в заголовок `Authorization`:

```javascript
const jwtToken = "...";

fetch("https://happy-animal-123.convex.site/myAction", {
  headers: {
    Authorization: `Bearer ${jwtToken}`,
  },
});
```

## Внутренние функции / Internal functions

Внутренние функции могут вызываться только другими функциями, т.е. не могут вызываться клиентом Convex напрямую.

По умолчанию все функции Convex являются публичными и доступны клиентам. Публичные функции могут вызываться злоумышленниками способами, приводящими к "интересным" результатам. Внутренние функции позволяют снизить этот риск. Такие функции рекомендуется использовать всегда при написании логики, которая не должна быть доступна клиенту.

Во внутренних функциях можно применять валидацию аргументов и/или аутентификацию.

__Случаи использования__

Внутренние функции предназначены для:

- вызова из операций с помощью `runQuery()` и `runMutation()`
- вызова из операций HTTP с помощью `runQuery()`, `runMutation()` и `runAction()`
- планирования их запуска в будущем в других функциях
- планирования их периодического запуска в cron-задачах
- запуска с помощью панели управления
- запуска с помощью CLI

__Определение внутренней функции__

Внутренняя функция определяется с помощью конструкторов `internalQuery`, `internalMutation` или `internalAction`. Например:

```javascript
import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const markPlanAsProfessional = internalMutation({
  args: { planId: v.id("plans") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.planId, { planType: "professional" });
  },
});
```
()
В случае передачи внутренней функции сложного объекта можно не использовать валидацию аргументов. Однако обратите внимание, что при использовании `internalQuery()` или `internalMutation()`, хорошей идеей является передача идентификаторов документов вместо документов для обеспечения того, что запрос или мутация будут работать с актуальным состоянием БД.

__Вызов внутренней функции__

Внутренние функции могут вызываться из операций и планироваться в них и мутациях с помощью объекта `internal`.

Пример публичной операции `upgrade`, вызывающей внутреннюю мутацию `plans.markPlanAsProfessional`, определенную выше:

```javascript
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const upgrade = action({
  args: {
    planId: v.id("plans"),
  },
  handler: async (ctx, args) => {
    // Обращаемся к платежной системе
    const response = await fetch("https://...");
    if (response.ok) {
      // Обновляем план на "professional" в БД Convex
      await ctx.runMutation(internal.plans.markPlanAsProfessional, {
        planId: args.planId,
      });
    }
  },
});
```

В приведенном примере пользователь не должен иметь возможности напрямую вызывать `internal.plans.markPlanAsProfessional()`.

Публичные и внутренние функции могут определяться в одном файле.

## Валидация аргументов и возвращаемых значений

Валидаторы аргументов и возвращаемых значений позволяют обеспечить, чтобы запросы, мутации и операции вызывались с аргументами и возвращали значения правильных типов.

Это важно для безопасности. Без валидации аргументов злоумышленник сможет вызывать ваши публичные функции с любыми аргументами, что может привести к неблагоприятным последствиям. TS не поможет, потому что он отсутствует во время выполнения. Валидацию аргументов рекомендуется добавлять во все производственные приложения. Для непубличных функций, которые не вызываются клиентом, рекомендуется использовать внутренние функции с опциональной валидацией.

__Добавление валидатора__

Для добавления валидации аргументов нужно передать объект со свойствами `args` и `handler` в конструкторы `query`, `mutation` или `action`. Для валидации возвращаемых значений используется свойство `returns` этого объекта:

```javascript
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const send = mutation({
  // Валидация аргументов
  args: {
    body: v.string(),
    author: v.string(),
  },
  // Валидация возвращаемого значения
  returns: v.null(),
  handler: async (ctx, args) => {
    const { body, author } = args;
    await ctx.db.insert("messages", { body, author });
  },
});
```

При использовании валидаторов типы значений выводятся автоматически.

В отличие от TS, валидация объекта выбрасывает исключение при наличии в объекте свойств, не указанных в валидаторе.

Валидатор `args: {}` также может быть полезен, поскольку TS покажет ошибку на клиенте при попытке передать аргументы в функцию без параметров.

__Поддерживаемые типы__

Все функции, как публичные, так и внутренние, поддерживают следующие типы данных. Каждый тип имеет соответствующего валидатора, который доступен через объект `v`, импортируемый из `"convex/values"`.

БД может хранить такие же типы данных.

Кроме того, можно определять объединения (unions), литералы (literals), тип `any` и опциональные поля.

__Значения Convex__

Convex поддерживает следующие типы значений:

Тип Convex | Тип TS/JS | Пример использования | Валидатор | Формат `json` для экспорта | Заметки
--- | --- | --- | --- | --- | ---
Id | string | `doc._id` | `v.id(tableName)` | string | См. раздел об идентификаторах документа
Null | null | `null` | `v.null()` | null | `undefined` не является валидным значением Convex. `undefined` конвертируется в `null` на клиенте
Int64 | bigint | `3n` | `v.int64()` | string (base10) | Int64 поддерживает только BigInt между -2^63 и 2^63-1. Convex поддерживает `bigint` в большинстве современных браузеров
Float64 | number | `3.1` | `v.number()` | number / string | Convex поддерживает все числа двойной точности согласно IEEE-764. `Infinity` и `NaN` сериализуются в строки
Boolean | boolean | `true` | `v.boolean()` | bool | -
String | string | `"abc"` | `v.string()` | string | Строки хранятся как UTF-8 и должны состоять из валидных символов Юникода. Максимальный размер строки составляет 1 Мб при кодировании в UTF-8
Bytes | ArrayBuffer | `new ArrayBuffer(8)` | `v.bytes()` | string (base64) | Convex поддерживает байтовые строки, передаваемые как `ArrayBuffer`. Максимальный размер такой строки также составляет 1 Мб
Array | Array | `[1, 3.2, "abc"]` | `v.array(values)` | array | Массивы могут содержать до 8192 значений
Object | Object | `{ a: "abc" }` | `v.object({ property: value })` | object | Convex поддерживает только "старые добрые объекты JS" (объекты со стандартным прототипом). Convex включает все перечисляемые свойства. Объекты могут содержать до 1024 сущностей. Названия полей не могут быть пустыми и не могут начинаться с `$` или `_`

__Объединения__

Объединения определяются с помощью `v.union()`:

```javascript
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export default mutation({
  args: {
    stringOrNumber: v.union(v.string(), v.number()),
  },
  handler: async ({ db }, { stringOrNumber }) => {
    //...
  },
});
```

__Литералы__

Литералы определяются с помощью `v.literal()`. Они обычно используются в сочетании с объединениями:

```javascript
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export default mutation({
  args: {
    oneTwoOrThree: v.union(
      v.literal("one"),
      v.literal("two"),
      v.literal("three"),
    ),
  },
  handler: async ({ db }, { oneTwoOrThree }) => {
    //...
  },
});
```

__Any__

Поля, которые могут содержать любое значение, определяются с помощью `v.any()`:

```javascript
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export default mutation({
  args: {
    anyValue: v.any(),
  },
  handler: async ({ db }, { anyValue }) => {
    //...
  },
});
```

Это соответствует типу `any` в TS.

__Опциональные поля__

Опциональные поля определяются с помощью `v.optional()`:

```javascript
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export default mutation({
  args: {
    optionalString: v.optional(v.string()),
    optionalNumber: v.optional(v.number()),
  },
  handler: async ({ db }, { optionalString, optionalNumber }) => {
    //...
  },
});
```

Это соответствует модификатору `?` в TS.

__Извлечение типов TS__

Тип `Infer` позволяет преобразовать валидатор Convex в тип TS. Это позволяет избежать дублирования:

```javascript
import { mutation } from "./_generated/server";
import { Infer, v } from "convex/values";

const nestedObject = v.object({
  property: v.string(),
});

// Разрешается в `{ property: string }`.
export type NestedObject = Infer<typeof nestedObject>;

export default mutation({
  args: {
    nested: nestedObject,
  },
  handler: async ({ db }, { nested }) => {
    //...
  },
});
```

## Обработка ошибок

Существует 4 причины, по которым в запросах и мутациях могут возникать ошибки:

1. Ошибки приложения: код функции достиг логического условия остановки дальнейшего выполнения, была выброшена `ConvexError`.
2. Ошибки разработчика: баг в функции (например, вызов `db.get(null)` вместо `db.get(id)`).
3. Ошибки лимитов чтения/записи: функция пытается извлечь или записать слишком большое количество данных.
4. Внутренние ошибки Convex: проблема внутри Convex.

Convex автоматически обрабатывает внутренние ошибки. В таких случаях запросы и мутации выполняются повторно до тех пор, пока не будут успешно завершены.

Обработка других типов ошибок - задача разработчика. Лучшие практики:

1. Показать пользователю соответствующий UI.
2. Отправить ошибку в соответствующий сервис.
3. Вывести ошибку в консоль и настроить потоковую передачу отчетов.

Кроме того, клиентские ошибки можно отправлять в сервисы, вроде [Sentry](https://sentry.io/), для получения дополнительной информации для отладки и наблюдения.

__Ошибки в запросах__

Если при выполнении запроса возникает ошибка, она отправляется клиенту и выбрасывается в месте вызова хука `useQuery`. Лучшим способом обработки таких ошибок являются предохранители (error boundaries).

Предохранитель позволяет перехватывать ошибки, выбрасываемые в дочерних компонентах, рендерить резервный UI и отправлять информацию в специальный сервис. Sentry даже предоставляет специальный компонент [Sentry.ErrorBoundary](https://docs.sentry.io/platforms/javascript/guides/react/components/errorboundary/).

Чем больше предохранителей используется в приложении, тем более гранулированным будет резервный UI. Самое простое - обернуть все приложение в один предохранитель:

```javascript
<StrictMode>
  <ErrorBoundary>
    <ConvexProvider client={convex}>
      <App />
    </ConvexProvider>
  </ErrorBoundary>
</StrictMode>
```

Однако при таком подходе ошибка в любом дочернем компоненте будет приводить к сбою всего приложения. Поэтому лучше оборачивать в предохранители отдельные части приложения. Тогда при возникновении ошибки в одном компоненте, другие будут функционировать в штатном режиме.

> В отличие от других фреймворков, запросы в Convex не выполняются повторно при возникновении ошибки: запросы являются детерминированными, поэтому их повторное выполнение с теми же аргументами всегда будет приводить к тем же ошибкам.

__Ошибки в мутациях__

Ошибка в мутации приводит к следующему:

1. Промис, возвращаемый из мутации, отклоняется.
2. Оптимистическое обновление откатывается.

Sentry должен автоматически сообщать о "необработанном отклонении промиса". В этом случае дополнительной обработки ошибки мутации не требуется.

Обратите внимание, что ошибки в мутациях не перехватываются предохранителями, поскольку такие ошибки не являются частью рендеринга компонентов.

Для рендеринга резервного UI при провале мутации можно использовать `.catch()` после вызова мутации:

```javascript
sendMessage(newMessageText).catch((error) => {
  // Работаем с `error`
});
```

В асинхронном обработчике можно использовать `try...catch`:

```javascript
try {
  await sendMessage(newMessageText);
} catch (error) {
  // Работаем с `error`
}
```

__Ошибки в операциях__

В отличие от запросов и мутаций, операции могут иметь побочные эффекты, поэтому при возникновении ошибок они не выполняются повторно Convex. Обработка таких ошибок - задача разработчика.

__Отличия между отчетами об ошибках в режимах разработки и продакшна__

В режиме разработки любая серверная ошибка, выброшенная на клиенте, будет включать оригинальное сообщение об ошибке и серверную трассировку стека для облегчения отладки.

В производственном режиме серверная ошибка будет включать только название функции и общее сообщение `"Server Error"` без трассировки стека. Серверные ошибки приложения будут содержать кастомные данные (в поле `data`).

Полные отчеты об ошибках в обоих режимах можно найти на странице "Logs" определенного деплоя.

__Ошибки приложения, ожидаемые провалы__

При наличии ожидаемых провалов функция может возвращать другие значения или выбрасывать `ConvexError`. Мы поговорим об этом в следующем разделе.

__Ошибки лимитов чтения/записи__

Для обеспечения высокой производительности Convex отклоняет запросы и мутации, которые пытаются читать или записывать слишком много данных.

Запросы и мутации отклоняются в следующих случаях:

- сканируется более 16_384 документов
- сканируется более 8 Мб данных
- вызывается больше 4_096 `db.get()` или `db.query()`
- JS-код функции выполняется дольше 1 сек

Кроме этого, мутации отклоняются в следующих случаях:

- записывается более 8_192 документов
- записывается более 8 Мб данных

Документы "сканируются" БД для определения документов, возвращаемых из `db.query()`. Например, `db.query("table").take(5).collect()` сканирует только 5 документов, а `db.query("table").filter(...).first()` сканирует все документы, содержащиеся в таблице `table` для определения первого документа, удовлетворяющего фильтру.

Количество вызовов `db.get()` и `db.query()` ограничено для предотвращения подписки запроса на слишком большое количество диапазонов индексов (index ranges).

При частом достижении этих лимитов рекомендуется индексировать запросы для уменьшения количества сканируемых документов, что позволяет избежать ненужных чтений БД.

### Ошибки приложения

При наличии ожидаемых провалов функция может возвращать другие значения или выбрасывать `ConvexError`.

__Возврат других значений__

При использовании TS другой тип возвращаемого значения может свидетельствовать о сценарии обработки ошибки. Например, мутация `createUser()` может возвращать:

```javascript
Id<"users"> | { error: "EMAIL_ADDRESS_IN_USE" };
```

Это позволяет не забывать о необходимости обработки ошибки в UI.

__Выбрасывание ошибок приложения__

Выброс исключения может быть более предпочтительным по следующим причинам:

- можно использовать встроенный механизм всплытия исключений из глубоко вложенных вызовов функций вместо ручного продвижения ошибки по стеку вызовов. Это также работает для вызовов `runQuery()`, `runMutation()` и `runAction()` в операциях
- выброс исключения в мутации предотвращает фиксацию (commit) ее транзакции
- на клиенте может быть проще одинаково обрабатывать все виды ошибок

Convex предоставляет подкласс ошибки `ConvexError` для передачи информации от сервера клиенту:

```javascript
import { ConvexError } from "convex/values";
import { mutation } from "./_generated/server";

export const assignRole = mutation({
  args: {
    // ...
  },
  handler: (ctx, args) => {
    const isTaken = isRoleTaken(/* ... */);
    if (isTaken) {
      throw new ConvexError("Роль уже назначена");
    }
    // ...
  },
});
```

__Полезная нагрузка `data`__

Конструктор `ConvexError` принимает все типы данных, поддерживаемые Convex. Данные записываются в свойство ошибки `data`:

```javascript
// error.data === "Сообщение об ошибке"
throw new ConvexError("Сообщение об ошибке");

// error.data === {message: "Сообщение об ошибке", code: 123, severity: "high"}
throw new ConvexError({
  message: "Сообщение об ошибке",
  code: 123,
  severity: "high",
});

// error.data === {code: 123, severity: "high"}
throw new ConvexError({
  code: 123,
  severity: "high",
});
```

Полезная нагрузка ошибки, более сложная, чем `string`, полезна для более структурированных отчетов об ошибках, а также для обработки разных типов ошибок на клиенте.

__Обработка ошибок приложения на клиенте__

На клиенте ошибки приложения также используют `ConvexError`. Полезная нагрузка ошибке содержится в свойстве `data`:

```javascript
import { ConvexError } from "convex/values";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

export function MyApp() {
  const doSomething = useMutation(api.myFunctions.mutateSomething);
  const handleSomething = async () => {
    try {
      await doSomething({ a: 1, b: 2 });
    } catch (error) {
      const errorMessage =
        // Проверяем, что имеем дело с ошибкой приложения
        error instanceof ConvexError
          ? // Получаем доступ к данным и приводим их к ожидаемому типу
            (error.data as { message: string }).message
          : // Вероятно, имеет место ошибка разработчика,
            // производственная среда не предоставляет
            // дополнительной информации клиенту
            "Возникла неожиданная ошибка";
      // Работаем с `errorMessage`
    }
  };
  // ...
}
```

## Среды выполнения

Функции Convex могут выполняться в двух средах:

- дефолтной среде Convex
- опциональной среде Node.js

__Дефолтная среда Convex__

Все серверные функции Convex пишутся на JS или TS. По умолчанию они выполняются в кастомной среде JS, очень похожей на [среду Cloudflare Workers](https://blog.cloudflare.com/cloud-computing-without-containers/), с доступом к большинству [глобальных переменных, определяемых веб-стандартами](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects).

Дефолтная среда имеет много преимуществ, включая следующие:

- отсутствие холодного старта. Среда всегда запущена и готова к моментальному выполнению функций
- последние возможности JS. Среда основана на движке V8 от Google Chrome. Это обеспечивает интерфейс, очень похожий на код клиента, способствую максимальному упрощению кода
- низкие расходы на доступ к данным. Среда спроектирована для низких расходов на доступ к данных через запросы и мутации, позволяя получать доступ к БД с помощью простого интерфейса JS

__Ограничения запросов и мутаций__

Запросы и мутации ограничиваются средой в целях обеспечения их детерминированности. Это позволяет Convex повторно выполнять их автоматически при необходимости.

Детерминизм означает, что функция, которая вызывается с одними и теми же аргументами, всегда возвращает одни и те же значения.

Convex предоставляет полезные сообщения об ошибках при написании "запрещенных" функций.

_Использование произвольных значений и времени в запросах и мутациях_

Convex предоставляет "заполненный" (seeded) псевдослучайный генератор чисел `Math.random()`, гарантирующий детерминированность функций. Заполнение генератора - скрытый параметр функции. Несколько вызовов `Math.random()` в одной функции будут возвращать разные произвольные значения. Обратите внимание, что Convex не оценивает повторно модули JS при каждом запуске функции, поэтому результат вызова `Math.random()`, сохраненный в глобальной переменной, не будет меняться между вызовами функции.

Для обеспечения воспроизводимости логики функции системное время, используемое глобально (за пределами любой функции), "заморожено" на времени деплоя. Системное время в функции "заморожено" на начале ее выполнения. `Date.now()` будет возвращать одинаковый результат на протяжении всего выполнения функции.

```javascript
const globalRand = Math.random(); // `globalRand` не меняется между запусками
const globalNow = Date.now(); // `globalNow` - это время деплоя функций

export const updateSomething = mutation({
  handler: () => {
    const now1 = Date.now(); // `now1` - время начала выполнения функции
    const rand1 = Math.random(); // `rand1` имеет новое значения при каждом запуске функции
    // implementation
    const now2 = Date.now(); // `now2` === `now1`
    const rand2 = Math.random(); // `rand1` !== `rand2`
  },
});
```

__Операции__

Операции не ограничены правилами, обеспечивающими детерминизм функций. Они могут обращаться к сторонним конечным точкам HTTP с помощью стандартной функции `fetch`.

По умолчанию операции также выполняются в кастомной среде JS. Они могут определяться в одном файле с запросами и мутациями.

__Среда Node.js__

Некоторые библиотеки JS/TS не поддерживаются дефолтной средой Convex. Поэтому Convex позволяет переключиться на Node.js 18 с помощью директивы `"use node"` в начале соответствующего файла.

В Node.js могут выполняться только операции. Для взаимодействия библиотеки для Node.js и БД Convex можно использовать утилиты `runQuery` или `runMutation` для вызова запроса или мутации, соответственно.

# База данных

БД Convex предоставляет реляционную модель данных, хранящую подобные JSON документы, которая может использоваться как со схемой, так и без нее. Она "просто работает", предоставляя предсказуемую производительность через легкий интерфейс.

Запросы и мутации читают и записывают данные через легковесный интерфейс JS. Ничего не нужно настраивать, не нужно писать SQL.

## Таблицы и документы

__Таблицы__

Деплой Convex содержит таблицы, в которых хранятся данные. Изначально деплой не содержит никаких таблиц и данных.

Таблица создается при добавлении в нее первого документа:

```javascript
// Таблица `friends` не существует
await ctx.db.insert("friends", { name: "Алекс" });
// Теперь она существует и содержит один документ
```

Определять схему или создавать таблицы явно не требуется.

__Документы__

Таблицы содержат документы. Документы очень похожи на объекты JS. Они содержат поля и значения, могут содержать вложенные массивы и объекты.

Примеры валидных документов Convex:

```javascript
{}
{"name": "Алекс"}
{"name": {"first": "Иван", "second": "Петров"}, "age": 34}
```

Документы также могут содержать ссылки на документы в других таблицах. Мы поговорим об этом в одном из следующих разделов.

## Чтение данных

Запросы и мутации могут читать данные из таблиц БД с помощью идентификаторов документа (document ids) и запросов документа (document queries).

__Чтение одного документа__

Метод [db.get](https://docs.convex.dev/api/interfaces/server.GenericDatabaseReader#get) позволяет читать документ по его ИД:

```javascript
import { query } from "./_generated/server";
import { v } from "convex/values";

export const getTask = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    // Работаем с `task`
  },
});
```

Для ограничения данных, извлекаемых из таблицы, следует использовать валидатор `v.id`.

__Запрос документов__

Запросы документа всегда начинаются с выбора таблицы с помощью метода [db.query](https://docs.convex.dev/api/interfaces/server.GenericDatabaseReader#query):

```javascript
import { query } from "./_generated/server";

export const listTasks = query({
  handler: async (ctx) => {
    const tasks = await ctx.db.query("tasks").collect();
    // Работаем с `tasks`
  },
});
```

Затем мы можем:

- фильтровать
- сортировать
- и ждать (`await`) результаты

__Фильтрация__

Метод [filter](https://docs.convex.dev/api/interfaces/server.Query#filter) позволяет фильтровать документы, возвращаемые запросом. Этот метод принимает фильтр, созданный с помощью [FilterBuilder](https://docs.convex.dev/api/interfaces/server.FilterBuilder), и выбирает только совпадающие документы.

Для фильтрации документов, содержащих определенные ключевые слова, следует использовать поисковый запрос, о котором мы поговорим позже.

__Проверка на равенство__

Следующий запрос ищет документы в таблице `users`, где `doc.name === "Алекс"`:

```javascript
// Возвращает всех пользователей с именем "Алекс"
const usersNamedAlex = await ctx.db
  .query("users")
  .filter((q) => q.eq(q.field("name"), "Алекс"))
  .collect();
```

`q` - это вспомогательный объект `FilterBuilder`. Он содержит методы для всех поддерживаемых операторов фильтрации.

Этот фильтр запускается для всех документов таблицы. Для каждого документа `q.field("name")` оценивается в свойство `name`. Затем `q.eq()` проверяет, равняется ли это свойство `"Алекс"`.

Если запрос ссылается на поле, отсутствующее в документе, возвращается `undefined`.

__Сравнения__

Фильтры также могут использоваться для сравнения значений. Следующий запрос ищет документы, где `doc.age >= 18`:

```javascript
// Возвращает всех пользователей, старше 18 лет
const adults = await ctx.db
  .query("users")
  .filter((q) => q.gte(q.field("age"), 18))
  .collect();
```

Оператор `q.gte` проверяет, что первый аргумент (`doc.age`) больше или равен второму (`18`).

Полный список оператор сравнения:

Оператор | Эквивалент в TS
--- | ---
`q.eq(l, r)` |	`l === r`
`q.neq(l, r)` |	`l !== r`
`q.lt(l, r)` |	`l < r`
`q.lte(l, r)` |	`l <= r`
`q.gt(l, r)` |	`l > r`
`q.gte(l, r)` |	`l >= r`

__Арифметика__

Запросы могут содержать простую арифметику. Следующий запрос ищет документы в таблице `carpets`, где `doc.height * doc.width > 100`:

```javascript
// Возвращает все ковры, площадью свыше 100
const largeCarpets = await ctx.db
  .query("carpets")
  .filter((q) => q.gt(q.mul(q.field("height"), q.field("width")), 100))
  .collect();
```

Полный список арифметических операторов:

Оператор | Эквивалент в TS
--- | ---
`q.add(l, r)` |	`l + r`
`q.sub(l, r)` |	`l - r`
`q.mul(l, r)` |	`l * r`
`q.div(l, r)` |	`l / r`
`q.mod(l, r)` |	`l % r`
`q.neg(x)` |	`-x`

__Комбинирование операторов__

Сложные фильтры можно создавать с помощью `q.and()`, `q.or()` и `q.not()`. Следующий запрос ищет документы, где `doc.name === "Алекс" && doc.age >= 18`:

```javascript
// Возвращает всех пользователей по имени "Алекс", старше 18 лет
const adultAlexes = await ctx.db
  .query("users")
  .filter((q) =>
    q.and(q.eq(q.field("name"), "Алекс"), q.gte(q.field("age"), 18)),
  )
  .collect();
```

Следующий запрос ищет документы, где `doc.name === "Алекс" || doc.name === "Вера"`:

```javascript
// Возвращает всех пользователей по имени "Алекс" или "Вера"
const usersNamedAlexOrEmma = await ctx.db
  .query("users")
  .filter((q) =>
    q.or(q.eq(q.field("name"), "Алекс"), q.eq(q.field("name"), "Вера")),
  )
  .collect();
```

__Порядок__

По умолчанию Convex возвращает документы, отсортированные по полю `_creationTime` (времени создания).

Для выбора порядка сортировки используется [.ord("asc" | "desc")](https://docs.convex.dev/api/interfaces/server.Query#order). По умолчанию документы сортируются по возрастанию (`asc`).

```javascript
// Возвращает все сообщения, от старых к новым
const messages = await ctx.db.query("messages").order("asc").collect();

// Возвращает все сообщения, от новым к старым
const messages = await ctx.db.query("messages").order("desc").collect();
```

При необходимости сортировки документов по другому полю и небольшом количестве документов, сортировку можно выполнить в JS:

```javascript
// Возвращает 10 лучших (по количеству лайков) сообщений
// (предполагается, что таблица "messages" маленькая)
const messages = await ctx.db.query("messages").collect();
const topTenMostLikedMessages = messages
  .sort((a, b) => b.likes - a.likes)
  .slice(0, 10);
```

Для запросов, возвращающих большое количество документов, следует использовать индексы для улучшения производительности. Документы, возвращаемые запросами, использующими индексы, сортируются по колонкам, указанным в индексах, что позволяет избежать медленного сканирования таблицы:

```javascript
// Возвращает 20 лучших (по количеству лайков) сообщений с помощью индекса "by_likes"
const messages = await ctx.db
  .query("messages")
  .withIndex("by_likes")
  .order("desc")
  .take(20);
```

__Сортировка значений разных типов__

Одно поле может содержать значения разных типов. При наличии в индексированном поле значений разных типов, порядок сортировки будет следующим: `undefined` < `null` < `bigint` < `number` < `boolean` < `string` < `ArrayBuffer` < `Array` < `Object`.

Такой же порядок сортировки используется операторами сравнения `q.lt()`, `q.lte()`, `q.gt()` и `q.gte()`.

__Извлечение результатов__

В большинстве приведенных выше примеров запросы заканчивались вызовом метода [collect](https://docs.convex.dev/api/interfaces/server.Query#collect), который возвращает все документы, удовлетворяющие фильтру. Существуют другие варианты.

_Возврат `n` результатов_

[.take(n)](https://docs.convex.dev/api/interfaces/server.Query#take) возвращает `n` результатов, совпадающих с запросом:

```javascript
// Возвращает 5 первых пользователей
const users = await ctx.db.query("users").take(5);
```

_Возврат первого результата_

[.first()](https://docs.convex.dev/api/interfaces/server.Query#first) возвращает первый документ, совпадающий с запросом, или `null`:

```javascript
// Возвращает первого пользователя с указанным email
const userOrNull = await ctx.db
  .query("users")
  .filter((q) => q.eq(q.field("email"), "test@example.com"))
  .first();
```

_Возврат уникального результата_

[.unique()](https://docs.convex.dev/api/interfaces/server.Query#unique) возвращает первый документ, совпадающий с запросом, или `null`. При наличии нескольких документов, совпадающих с запросом, выбрасывается исключение:

```javascript
// Предполагается, что таблица "counter" содержит только один документ
const counterOrNull = await ctx.db.query("counter").unique();
```

_Постраничная загрузка результатов_

[.paginate(opts)](https://docs.convex.dev/api/interfaces/server.OrderedQuery#paginate) загружает страницу результатов и возвращает [Cursor](https://docs.convex.dev/api/modules/server#cursor) для загрузки дополнительных результатов. Мы поговорим об этом позже.

__Продвинутые запросы__

В Convex нет специального языка запросов для сложной логики, вроде объединений, агрегаций и группировок. Такая логика реализуется с помощью JS. Convex гарантирует согласованность результатов.

_Объединение_

```javascript
// join
import { query } from "./_generated/server";
import { v } from "convex/values";

export const eventAttendees = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    return Promise.all(
      (event?.attendeeIds ?? []).map((userId) => ctx.db.get(userId)),
    );
  },
});
```

_Агрегация_

```javascript
// aggregation
import { query } from "./_generated/server";
import { v } from "convex/values";

export const averagePurchasePrice = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const userPurchases = await ctx.db
      .query("purchases")
      .filter((q) => q.eq(q.field("buyer"), args.email))
      .collect();
    const sum = userPurchases.reduce((a, { value: b }) => a + b, 0);
    return sum / userPurchases.length;
  },
});
```

_Группировка_

```javascript
// group by
import { query } from "./_generated/server";
import { v } from "convex/values";

export const numPurchasesPerBuyer = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const userPurchases = await ctx.db.query("purchases").collect();

    return userPurchases.reduce(
      (counts, { buyer }) => ({
        ...counts,
        [buyer]: counts[buyer] ?? 0 + 1,
      }),
      {} as Record<string, number>,
    );
  },
});
```

## Запись данных

Мутации могут добавлять, обновлять и удалять документы из таблиц БД.

__Добавление новых документов__

Для создания новых документов используется метод [db.insert](https://docs.convex.dev/api/interfaces/server.GenericDatabaseWriter#insert):

```javascript
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const createTask = mutation({
  args: { text: v.string() },
  handler: async (ctx, args) => {
    const taskId = await ctx.db.insert("tasks", { text: args.text });
    // Работаем с `taskId`
  },
});
```

Второй параметр `db.insert()` - объект JS с данными нового документа.

Метод `insert` возвращает глобально уникальный ИД созданного документа.

__Обновление существующих документов__

Для обновления существующего документа используется его ИД и один из следующих методов:

1. Метод [db.patch](https://docs.convex.dev/api/interfaces/server.GenericDatabaseWriter#patch) частично обновляет документ, поверхностно объединяя его с новыми данными. Новые поля добавляются. Существующие поля перезаписываются. Поля со значением `undefined` удаляются.

```javascript
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const updateTask = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    const { id } = args;
    console.log(await ctx.db.get(id));
    // { text: "foo", status: { done: true }, _id: ... }

    // Добавляем `tag` и перезаписываем `status`
    await ctx.db.patch(id, { tag: "bar", status: { archived: true } });
    console.log(await ctx.db.get(id));
    // { text: "foo", tag: "bar", status: { archived: true }, _id: ... }

    // Удаляем `tag` путем установки его значения в `undefined`
    await ctx.db.patch(id, { tag: undefined });
    console.log(await ctx.db.get(id));
    // { text: "foo", status: { archived: true }, _id: ... }
  },
});
```

2. Метод [db.replace](https://docs.convex.dev/api/interfaces/server.GenericDatabaseWriter#replace) полностью заменяет документ, потенциально удаляя существующие поля:

```javascript
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const replaceTask = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    const { id } = args;
    console.log(await ctx.db.get(id));
    // { text: "foo", _id: ... }

    // Полностью заменяем документ
    await ctx.db.replace(id, { invalid: true });
    console.log(await ctx.db.get(id));
    // { invalid: true, _id: ... }
  },
});
```

__Удаление документов__

Для удаления документа используется его ИД и метод [db.delete](https://docs.convex.dev/api/interfaces/server.GenericDatabaseWriter#delete):

```javascript
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const deleteTask = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
```

## Идентификатор документа / Document ID

Каждый документ в Convex имеет глобально уникальный строковый ИД, который автоматически генерируется системой:

```javascript
const userId = await ctx.db.insert("users", { name: "Михаил Лермонтов" });
```

Этот ИД может использоваться для чтения документа:

```javascript
const retrievedUser = await ctx.db.get(userId);
```

ИД хранится в поле `_id`:

```javascript
const userId = retrievedUser._id;
```

ИД также может использоваться для обновления документа на месте:

```javascript
await ctx.db.patch(userId, { name: "Федор Достоевский" });
```

Convex генерирует тип `Id` для TS на основе схемы, которая параметризована по названиям таблиц:

```javascript
import { Id } from "./_generated/dataModel";

const userId: Id<"users"> = user._id;
```

ИД являются строкой во время выполнения, но тип `Id` может использоваться для отделения ИД от других строк во время компиляции.

__Ссылки и отношения__

В Convex можно ссылаться на документ, просто добавляя его `Id` в другой документ:

```javascript
await ctx.db.insert("books", {
  title,
  ownerId: user._id,
});
```

Ссылки позволяют получать документы:

```javascript
const user = await ctx.db.get(book.ownerId);
```

И запрашивать документы:

```javascript
const myBooks = await ctx.db
  .query("books")
  .filter((q) => q.eq(q.field("ownerId"), user._id))
  .collect();
```

`Id` как ссылки позволяют создавать сложные модели данных.

Хотя Convex поддерживает вложенные объекты и массивы, документы должны иметь относительно небольшие размеры. Для структурирования данных лучше создавать отдельные таблицы, документы и ссылки.

__Сериализация ИД__

ИД - строки, которые могут легко вставляться в урлы и храниться за пределами Convex.

Можно передать строку ИД из внешнего источника (такого как урл) в функцию Convex и получить соответствующий объект. При использовании TS на клиенте можно привести строку к типу `Id`.

```javascript
import { useQuery } from "convex/react";
import { Id } from "../convex/_generated/dataModel";
import { api } from "../convex/_generated/api";

export function App() {
  const id = localStorage.getItem("myIDStorage");
  const task = useQuery(api.tasks.getTask, { taskId: id as Id<"tasks"> });
  // ...
}
```

Поскольку этот ИД извлекается из внешнего источника, необходимо использовать валидатор аргумента или метод [ctx.db.normalizeId](https://docs.convex.dev/api/interfaces/server.GenericDatabaseReader#normalizeid) для подтверждения принадлежности ИД к указанной таблице перед возвратом документа:

```javascript
import { query } from "./_generated/server";
import { v } from "convex/values";

export const getTask = query({
  args: {
    taskId: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    // ...
  },
});
```

## Типы данных

Все документы Convex определяются как объекты JS. Значения полей этих объектов могут быть любого поддерживаемого типа (см. раздел о валидации аргументов и возвращаемых значений).

Форма (shape) документов может определяться с помощью схемы, о которой мы поговорим в следующем разделе.

__Системные поля__

Каждый документ Convex имеет два автоматически генерируемых системных поля:

- `_id`: ИД документа (см. предыдущий раздел)
- `_creationTime`: время создания документа (число мс с начала эпохи)

__Лимиты__

Максимальный размер значения составляет 1 Мб. Максимальная вложенность полей составляет 16 уровней.

Названия таблиц должны состоять из символов латиницы, цифр и нижнего подчеркивания (`_`), но не могут начинаться с последнего (кроме системных полей).

__Работа с датами и временем__

Convex не предоставляет специального типа данных для работы с датой и временем. Они хранятся и извлекаются из БД в виде строк.

## Схемы

Схема - это описание

1. Таблиц проекта.
2. Типа документов в таблицах.

Хотя схема не является обязательной, ее определение гарантирует, что документы в таблицах имеют правильный тип. Добавление схемы также делает код более типобезопасным (type safety).

__Создание схемы__

Схема определяется в файле `convex/schema.ts` и выглядит так:

```javascript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  messages: defineTable({
    body: v.string(),
    user: v.id("users"),
  }),
  users: defineTable({
    name: v.string(),
    tokenIdentifier: v.string(),
  }).index("by_token", ["tokenIdentifier"]),
});
```

Эта схема содержит 2 таблицы: `messages` и `users`. Таблицы определяются с помощью функции [defineTable](https://docs.convex.dev/api/modules/server#definetable). Тип документа определяется с помощью валидатора [v](https://docs.convex.dev/api/modules/values#v). В дополнение к указанным полям Convex автоматически добавляет поля `_id` и `_creationTime`.

__Валидаторы__

Тип документа определяется с помощью валидатора `v`:

```javascript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  documents: defineTable({
    id: v.id("documents"),
    string: v.string(),
    number: v.number(),
    boolean: v.boolean(),
    nestedObject: v.object({
      property: v.string(),
    }),
  }),
});
```

`v` также позволяет определять объединения, опциональные свойства, строковые литералы и др.

_Опциональные поля_

Опциональные поля создаются с помощью `v.optional()`:

```javascript
defineTable({
  optionalString: v.optional(v.string()),
  optionalNumber: v.optional(v.number()),
});
```

Это соответствует модификатору `?` в TS.

_Объединения_

Объединения создаются с помощью `v.union()`:

```javascript
defineTable({
  stringOrNumber: v.union(v.string(), v.number()),
});
```

`v.union()` можно использовать на верхнем уровне (если таблица может содержать разные типы документов):

```javascript
defineTable(
  v.union(
    v.object({
      kind: v.literal("StringDocument"),
      value: v.string(),
    }),
    v.object({
      kind: v.literal("NumberDocument"),
      value: v.number(),
    }),
  ),
);
```

_Литералы_

Литералы создаются с помощью `v.literal()`. Этот метод обычно используется в сочетании с `v.union()`:

```javascript
defineTable({
  oneTwoOrThree: v.union(
    v.literal("one"),
    v.literal("two"),
    v.literal("three"),
  ),
});
```

_Any_

Поля, которые могут содержать значение любого типа, определяются с помощью `v.any()`:

```javascript
defineTable({
  anyValue: v.any(),
});
```

Это соответствует типу `any` в TS.

__Настройки__

В качестве второго параметра `defineTable()` принимает объект с настройками.

`schemaValidation: boolean`

Эта настройка определяет, должен ли Convex проверять соответствие новых и существующих документов схеме. По умолчанию такая проверка выполняется.

Отключить эту проверку можно так:

```javascript
defineSchema(
  {
    // Таблицы
  },
  {
    schemaValidation: false,
  },
);
```

Типы TS генерируются в любом случае.

`strictTableNameTypes: boolean`

Эта настройка определяет, позволяет ли TS работать с таблицами, не указанными в схеме. По умолчанию TS это запрещает.

Отключить эту настройку можно так:

```javascript
defineSchema(
  {
    // Таблицы
  },
  {
    strictTableNameTypes: false,
  },
);
```

Типом документов из таблиц, не указанных в схеме, является `any`.

__Валидация схемы__

Схемы автоматически "пушатся" при выполнении команд `npx convex dev` и `npx convex deploy`.

Первый пуш после добавления или модификации схемы проверяет все документы на соответствие схеме. При провале валидации, схема не пушится.

Обратите внимание, что выполняется валидация документов только из таблиц, указанных в схеме.

__Цикличные ссылки__

Рассмотрим такой пример:

```javascript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    preferencesId: v.id("preferences"),
  }),
  preferences: defineTable({
    userId: v.id("users"),
  }),
});
```

В этой схеме документы в таблице `users` содержат ссылки на документы в таблице `preferences`, и наоборот.

Создание таких ссылок в Convex невозможно.

Простейший способ решения этой задачи - сделать одну из ссылок "нулевой":

```javascript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    preferencesId: v.id("preferences"),
  }),
  preferences: defineTable({
    userId: v.union(v.id("users"), v.null()),
  }),
});
```

После этого сначала создается документ `preferences`, затем создается документ `users`, затем устанавливается ссылка на документ `preferences`:

```javascript
import { mutation } from "./_generated/server";

export default mutation(async (ctx) => {
  const preferencesId = await ctx.db.insert("preferences", {});
  const userId = await ctx.db.insert("users", { preferencesId });
  await ctx.db.patch(preferencesId, { userId });
});
```

__Типы TS__

После определения схемы, команда `npx convex dev` генерирует новые файлы `dataModel.d.ts` и `server.d.ts` с типами на основе схемы.

`Doc<TableName>`

Тип TS `Doc` из `dataModel.d.ts` предоставляет типы документов для всех таблиц. Его можно использовать как в функциях Convex, так и в компонентах React:

```javascript
import { Doc } from "../convex/_generated/dataModel";

function MessageView(props: { message: Doc<"messages"> }) {
  // ...
}
```

Для извлечения части типа документа можно использовать утилиту типа `Infer`.

__`query` и `mutation`__

Функции `query` и `mutation` имеют тот же апи, но предоставляют `db` с более точными типами. Функции вроде `db.insert` понимают схему. Запросы возвращают правильные типы документов (не `any`).

## Пагинация

Пагинированные запросы (paginated queries) - это запросы, которые возвращают постраничный список результатов.

Это может быть полезным при разработке компонентов с кнопкой "Загрузить еще" или бесконечной прокруткой.

Пагинация в Convex предполагает:

1. Написание пагинированного запроса, вызывающего `paginate(paginationOpts)`.
2. Использование хука `usePaginatedQuery`.

Обратите внимание: в настоящее время пагинированные запросы - экспериментальная возможность.

__Создание пагинированного запроса__

Convex использует пагинацию на основе курсора. Это означает, что пагинированные запросы возвращают строку [Cursor](https://docs.convex.dev/api/modules/server#cursor), которая представляет собой конец результатов текущей страницы. Для загрузки дополнительных результатов запрос вызывается снова, но уже с курсором.

Для этого Convex предоставляет запрос, который:

1. Принимает единственный аргумент - объект со свойством `paginationOpts` типа [PaginationOptions](https://docs.convex.dev/api/interfaces/server.PaginationOptions).
   - `PaginationOptions` - это объект с полями `numItems` и `cursor`
   - для валидации этого аргумента используется `paginationOptsValidator` из `convex/server`
   - объект `args` также может содержать другие поля
2. Вызывает `paginate(paginationOpts)` на запросе и возвращает результат.
   - Возвращаемая `page` (страница) в [PaginationResult](https://docs.convex.dev/api/interfaces/server.PaginationResult) - это массив документов.

```javascript
import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";

export const list = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const foo = await ctx.db
      .query("messages")
      .order("desc")
      .paginate(args.paginationOpts);
    return foo;
  },
});
```

__Дополнительные аргументы__

Кроме `paginationOpts`, объект `args` может содержать и другие поля:

```javascript
export const listWithExtraArg = query({
  args: { paginationOpts: paginationOptsValidator, author: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .filter((q) => q.eq(q.field("author"), args.author))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});
```

__Преобразование результатов__

Свойство `page` объекта, возвращаемого `paginate()`, может подвергаться дополнительным преобразованиям:

```javascript
export const listWithTransformation = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("messages")
      .order("desc")
      .paginate(args.paginationOpts);

    return {
      ...results,
      page: results.page.map((message) => ({
        author: message.author.slice(0, 1),
        body: message.body.toUpperCase(),
      })),
    };
  },
});
```

__Пагинация на стороне клиента__

Для получения пагинированных результатов на клиенте используется хук [usePaginatedQuery](https://docs.convex.dev/api/modules/react#usepaginatedquery). Этот хук предоставляет простой интерфейс для рендеринга текущих документов и запроса дополнительных. Он управляет курсором автоматически.

Хук принимает следующие параметры:

- название пагинированного запроса
- объект аргументов, передаваемых запросу, кроме `paginationOpts` (которые добавляются самим хуком)
- объект настроек с полем `initialNumItems` для загрузки первой страницы

Хук возвращает объект со следующими полями:

- `results` - массив документов
- `isLoading` - индикатор загрузки результатов
- `status` - статус пагинации:
  - `"LoadingFirstPage"` - хук загружает первую страницу
  - `"CanLoadMore"` - имеются дополнительные документы. Можно вызвать функцию `loadMore` для загрузки следующей страницы
  - `"LoadingMore"` - загрузка другой страницы
  - `"Exhausted"` - документов для загрузки не осталось (достигнут конец списка)
- `loadMore(n)` - функция для загрузки дополнительных результатов. Запускается только в случае, когда `status === "CanLoadMore"`

```javascript
import { usePaginatedQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export function App() {
  const { results, status, loadMore } = usePaginatedQuery(
    api.messages.list,
    {},
    { initialNumItems: 5 },
  );

  return (
    <div>
      {results?.map(({ _id, text }) => <div key={_id}>{text}</div>)}
      <button onClick={() => loadMore(5)} disabled={status !== "CanLoadMore"}>
        Загрузить еще
      </button>
    </div>
  );
}
```

Запросу можно передавать дополнительные аргументы:

```javascript
import { usePaginatedQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export function App() {
  const { results, status, loadMore } = usePaginatedQuery(
    api.messages.listWithExtraArg,
    { author: "Алекс" },
    { initialNumItems: 5 },
  );

  return (
    <div>
      {results?.map(({ _id, text }) => <div key={_id}>{text}</div>)}
      <button onClick={() => loadMore(5)} disabled={status !== "CanLoadMore"}>
        Загрузить еще
      </button>
    </div>
  );
}
```

__Реактивность__

Как и другие функции Convex, пагинированные запросы являются полностью реактивными. Компоненты React автоматически рендерятся повторно при добавлении, удалении и изменении пагинированного списка.

Одним из последствий этого является то, что размеры страниц в Convex могут меняться динамически.

__Ручная пагинация__

Пагинированные запросы могут использоваться за пределами React:

```javascript
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

require("dotenv").config();

const client = new ConvexHttpClient(process.env.VITE_CONVEX_URL!);

/**
 * Выводит в консоль массив,
 * содержащий все сообщения из пагинированного запроса "list",
 * путем объединения страниц результатов в один массив
 */
async function getAllMessages() {
  let continueCursor = null;
  let isDone = false;
  let page;

  const results = [];

  while (!isDone) {
    ({ continueCursor, isDone, page } = await client.query(api.messages.list, {
      paginationOpts: { numItems: 5, cursor: continueCursor },
    }));
    console.log("получено", page.length);
    results.push(...page);
  }

  console.log(results);
}

getAllMessages();
```

## Индексы

Индексы - это структура данных, которая позволяет ускорить запросы путем указания Convex порядка организации документов. Индексы также позволяют изменить порядок сортировки документов в результатах запроса.

__Определение индекса__

Индексы определяются как часть схемы. Каждый индекс состоит из:

1. Названия
   - должно быть уникальным в пределах таблицы
2. Упорядоченного списка индексируемых полей
   - для указания вложенного поля используется путь с точкой, например, `properties.name`

Для добавления индекса в таблицу используется метод [index](https://docs.convex.dev/api/classes/server.TableDefinition#index):

```javascript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Определяем таблицу "messages" с двумя индексами
export default defineSchema({
  messages: defineTable({
    channel: v.id("channels"),
    body: v.string(),
    user: v.id("users"),
  })
    .index("by_channel", ["channel"])
    .index("by_channel_user", ["channel", "user"]),
});
```

Индекс `by_channel` упорядочен по полю `channel` в схеме. Сообщения из одного канала сортируются по полю `_creationTime`, генерируемому системой автоматически.

Индекс `by_channel_user` сортирует сообщения из одного `channel` сначала по `user`, который их отправил, затем по `_creationTime`.

Индексы создаются при выполнении команд `npx convex dev` и `npx convex deploy`.

__Запрос документов с помощью индексов__

Запрос сообщений из `channel`, созданных 1-2 мин назад, будет выглядеть так:

```javascript
const messages = await ctx.db
  .query("messages")
  .withIndex("by_channel", (q) =>
    q
      .eq("channel", channel)
      .gt("_creationTime", Date.now() - 2 * 60000)
      .lt("_creationTime", Date.now() - 60000),
  )
  .collect();
```

Метод [withIndex](https://docs.convex.dev/api/interfaces/server.QueryInitializer#withindex) определяет, какой индекс запрашивать и как использовать его для выборки документов. Первым аргументом является название индекса, вторым - выражение диапазона индекса (index range expression). Выражение диапазона индекса - это описание того, какие документы должны учитываться при выполнении запроса.

Выбор индекса влияет как на форму выражения диапазона запроса, так и на порядок возвращаемых результатов. Например, при добавлении индексов `by_channel` и `by_channel_user`, можно получать результаты из одного `channel`, упорядоченные как по `_creationTime`, так и по `user`, соответственно.

```javascript
const messages = await ctx.db
  .query("messages")
  .withIndex("by_channel_user", (q) => q.eq("channel", channel))
  .collect();
```

Результатом этого запроса будут все сообщения из `channel`, отсортированные сначала по `user`, затем по `_creationTime`.

```javascript
const messages = await ctx.db
  .query("messages")
  .withIndex("by_channel_user", (q) =>
    q.eq("channel", channel).eq("user", user),
  )
  .collect();
```

Результатом этого запроса будут сообщения из `channel`, отправленные `user`, отсортированные по `_creationTime`.

Выражение диапазона индекса - это всегда цепочка из:

1. 0 или более выражений равенства, определенных с помощью [.eq](https://docs.convex.dev/api/interfaces/server.IndexRangeBuilder#eq).
2. [опционально] Выражения нижнего порога, определенного с помощью [.gt](https://docs.convex.dev/api/interfaces/server.IndexRangeBuilder#gt) или [.gte](https://docs.convex.dev/api/interfaces/server.IndexRangeBuilder#gte).
3. [опционально] Выражения верхнего порога, определенного с помощью [.lt](https://docs.convex.dev/api/interfaces/server.IndexRangeBuilder#lt) или [.lte](https://docs.convex.dev/api/interfaces/server.IndexRangeBuilder#lte).

Поля должны перебираться в индексном порядке.

Каждое выражение равенства должно сравнивать другое индексируемое поле, начиная сначала и по порядку. Верхняя и нижняя границы должны следовать за выражениями равенства и сравнивать следующее поле.

```javascript
// Не компилируется!
const messages = await ctx.db
  .query("messages")
  .withIndex("by_channel", (q) =>
    q
      .gt("_creationTime", Date.now() - 2 * 60000)
      .lt("_creationTime", Date.now() - 60000),
  )
  .collect();
```

Этот запрос является невалидным, поскольку индекс `by_channel` упорядочен по `(channel, _creationTime)` и этот диапазон запроса содержит сравнение по `_creationTime` без ограничения диапазона одним `channel`. Поскольку индекс сортируется сначала по `channel`, затем по `_creationTime`, индекс для поиска сообщений из всех каналов, созданных 1-2 мин назад, бесполезен.

Производительность запроса основана на специфичности диапазона.

Например, в этом запросе:

```javascript
const messages = await ctx.db
  .query("messages")
  .withIndex("by_channel", (q) =>
    q
      .eq("channel", channel)
      .gt("_creationTime", Date.now() - 2 * 60000)
      .lt("_creationTime", Date.now() - 60000),
  )
  .collect();
```

производительность будет основана на количестве сообщений в `channel`, созданных 1-2 мин назад.

При отсутствии диапазона индекса, запросом будут учитываться все документы в индексе.

`withIndex()` спроектирован для определения диапазонов, которые Convex может эффективно использовать для поиска индекса. Для другой фильтрации следует использовать метод `filter`.

Пример запроса чужих сообщений в `channel`:

```javascript
const messages = await ctx.db
  .query("messages")
  .withIndex("by_channel", q => q.eq("channel", channel))
  .filter(q => q.neq(q.field("user"), myUserId)
  .collect();
```

В данном случае производительность запроса будет зависеть от количества сообщений в канале.

__Сортировка с помощью индексов__

Запросы, использующие `withIndex()`, сортируются по колонкам, указанным в индексе.

Порядок колонок в индексе определяет приоритет сортировки. Последующие колонки сравниваются только при совпадении предыдущих. Последней сравнивается колонка `_creationTime`, которую Convex автоматически добавляет в конец каждого индекса.

Например, `by_channel_user` включает `channel`, `user` и `_creationTime`. Поэтому результаты запроса к `messages`, использующего `.withIndex("by_channel_user")`, будут отсортированы сначала по каналу, затем по пользователю, затем по времени создания.

Сортировка по индексам позволяет легко получать такие данные, как `n` лучших (по количеству очков) игроков, `n` последних транзакций, `n` лучших (по количеству лайков) сообщений и т.п.

Например, для получения 10 лучших игроков можно определить такой индекс:

```javascript
export default defineSchema({
  players: defineTable({
    username: v.string(),
    highestScore: v.number(),
  }).index("by_highest_score", ["highestScore"]),
});
```

И получить их с помощью `.take(10)`:

```javascript
const topScoringPlayers = await ctx.db
  .query("users")
  .withIndex("by_highest_score")
  .order("desc")
  .take(10);
```

В этом примере отсутствует выражение диапазона, поскольку нас интересуют лучшие игроки за все время. Данный запрос будет эффективным даже для большого количества данных из-за использования `take()`.

При использовании индекса без выражения диапазона, совместно с `withIndex()` всегда должен использоваться один из следующих методов:

- `first()`
- `unique()`
- `take(n)`
- `paginate(opts)`

Эти методы позволяют ограничить запрос до разумного размера, позволяя избежать полного сканирования таблицы.

Для уточнения запроса можно использовать выражение диапазона. Пример запроса 10 лучших игроков в Канаде:

```javascript
const topScoringPlayers = await ctx.db
  .query("users")
  .withIndex("by_country_highest_score", (q) => q.eq("country", "CA"))
  .order("desc")
  .take(10);
```

__Ограничения__

Convex поддерживает индексы, содержащие до 16 полей. Каждая таблица может содержать до 32 индексов. Колонки в индексах не могут дублироваться.

Системные поля (начинающиеся с `_`) в индексах использовать запрещено. Поле `_creationTime` добавляется в каждый индекс автоматически для обеспечения стабильной сортировки. Другими словами, индекс `by_creation_time` создается автоматически. Индекс `by_id` является зарезервированным.

# Аутентификация

Аутентификация позволяет идентифицировать пользователей и ограничивать им доступ к данным при необходимости.

**Convex Auth**

Аутентификация может быть реализована прямо в Convex с помощью библиотеки Convex Auth, о которой мы поговорим в следующем разделе. Это легкий способ настройки регистрации/авторизации пользователей с помощью провайдеров аутентификации, одноразовых email/СМС или паролей.

**Сторонние платформы аутентификации**

В качестве альтернативы можно использовать интеграцию Convex со сторонними провайдерами аутентификации. Это немного сложнее, но эти платформы предоставляют продвинутый функционал поверх основ аутентификации:

- [Clerk](https://docs.convex.dev/auth/clerk) - более новая платформа с лучшей поддержкой Next.js и React Native
- [Auth0](https://docs.convex.dev/auth/auth0) - более стабильная платформа с огромным количеством возможностей

## Convex Auth

Convex Auth - это библиотека для реализации аутентификации прямо в Convex. Она позволяет аутентифицировать пользователей без сервиса аутентификации или даже сервера.

- [Демо](https://labs.convex.dev/auth-example)
- [Исходный код](https://github.com/get-convex/convex-auth-example)

**Начало работы**

Для создания нового проекта с Convex и Convex Auth необходимо выполнить команду:

```bash
npm create convex@latest
```

и выбрать `React (Vite)` и `Convex Auth`.

Про добавление Convex Auth в существующий проект мы поговорим позже.

**Обзор**

Convex Auth позволяет реализовать следующие методы аутентификации:

1. Магические ссылки (magic links) и одноразовые пароли - отправка ссылки или кода по email.
2. OAuth - авторизация через Github / Google / Apple и т.д.
3. Пароли, включая сброс пароля и подтверждение email.

Библиотека не предоставляет готовых компонентов UI, но ничто не мешает скопировать код из примеров для быстрого прототипирования.

_Обратите внимание_, что Convex Auth - экспериментальная возможность. Это означает, что соответствующий код в будущем может претерпеть некоторые изменения.

**Добавление в существующий проект**

Устанавливаем необходимые пакеты:

```bash
npm i @convex-dev/auth @auth/core
```

Запускаем команду для инициализации:

```bash
npx @convex-dev/auth
```

Эта команда настраивает проект для аутентификации с помощью библиотеки. Такую настройку можно произвести [вручную](https://labs.convex.dev/auth/setup/manual).

Добавляем таблицы аутентификации в схему:

```javascript
// convex/schema.ts
import { defineSchema } from 'convex/server'
import { authTables } from '@convex-dev/auth/server'

const schema = defineSchema({
  ...authTables,
  // Другие таблицы
})

export default schema
```

Добавление провайдера аутентификации отличается в зависимости от используемого фреймворка.

_Vite_

Заменяем `ConvexProvider` из `convex/react` на `ConvexAuthProvider` из `@convex-dev/auth-react`:

```javascript
import { ConvexAuthProvider } from '@convex-dev/auth/react'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConvexReactClient } from 'convex/react'
import App from './App.tsx'
import './index.css'

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConvexAuthProvider client={convex}>
      <App />
    </ConvexAuthProvider>
  </React.StrictMode>,
)
```

_Next.js_

Оборачиваем приложение в `ConvexAuthNextjsServerProvider` из `@convex-dev/auth/nextjs/server`:

```javascript
// app/layout.tsx
import { ConvexAuthNextjsServerProvider } from '@convex-dev/auth/nextjs/server'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ConvexAuthNextjsServerProvider>
      <html lang='en'>
        <body>{children}</body>
      </html>
    </ConvexAuthNextjsServerProvider>
  )
}
```

В провайдере для клиента заменяем `ConvexProvider` из `convex/react` на `ConvexAuthNextjsProvider ` из `@convex-dev/auth/nextjs`:

```javascript
// app/ConvexClientProvider.tsx
'use client'

import { ConvexAuthNextjsProvider } from '@convex-dev/auth/nextjs'
import { ConvexReactClient } from 'convex/react'
import { ReactNode } from 'react'

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexAuthNextjsProvider client={convex}>
      {children}
    </ConvexAuthNextjsProvider>
  )
}
```

Можно обернуть в клиентский провайдер все приложение:

```javascript
// app/layout.tsx
import { ConvexAuthNextjsServerProvider } from '@convex-dev/auth/nextjs/server'
import { ConvexClientProvider } from './ConvexClientProvider'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ConvexAuthNextjsServerProvider>
      <html lang='en'>
        <body>
          <ConvexClientProvider>{children}</ConvexClientProvider>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  )
}
```

Наконец, добавляем файл `middleware.ts`, в котором используется функция `convexAuthNextjsMiddleware`:

```javascript
import { convexAuthNextjsMiddleware } from '@convex-dev/auth/nextjs/server'

export default convexAuthNextjsMiddleware()

export const config = {
  // Посредник запускается для всех роутов,
  // кроме статических ресурсов
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}
```

_React Native_

Устанавливаем [expo-secure-store](https://docs.expo.dev/versions/latest/sdk/securestore/):

```bash
npx expo install expo-secure-store
```

Заменяем `ConvexProvider` из `convex/react` на `ConvexAuthProvider` из `@convex-dev/auth-react`:

```javascript
// app/_layout.tsx
import { ConvexAuthProvider } from '@convex-dev/auth/react'
import { ConvexReactClient } from 'convex/react'
import { Stack } from 'expo-router'
import * as SecureStore from 'expo-secure-store'

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false,
})

const secureStorage = {
  getItem: SecureStore.getItemAsync,
  setItem: SecureStore.setItemAsync,
  removeItem: SecureStore.deleteItemAsync,
}

export default function RootLayout() {
  return (
    <ConvexAuthProvider client={convex} storage={secureStorage}>
      <Stack>
        <Stack.Screen name='index' />
      </Stack>
    </ConvexAuthProvider>
  )
}
```

### OAuth

Этот метод аутентификации включает 2 этапа:

1. Пользователь нажимает на кнопку для авторизации с помощью третьей стороны (GitHub, Google, Apple и т.д.).
2. Пользователь аутентифицируется на сайте третьей стороны, направляется обратно в приложение и авторизуется в нем.

Convex Auth обеспечивает безопасный обмен секретами между провайдером третьей стороны и нашим бэком.

**Провайдеры**

Convex Auth основан на [Auth.js](https://authjs.dev/).

Auth.js позволяет использовать 80 разных провайдеров OAuth.

Рассмотрим настройку OAuth с помощью GitHub, потому что она является самой простой.

**Настройка**

_Callback URL_

После регистрации в качестве разработчика у провайдера, мы обычно создаем "приложение" (app) для хранения настроек OAuth.

Среди прочего, обычно требуется настроить callback URL, а также другие URL/домены.

Источником (доменом) callback URL для Convex Auth является HTTP Actions URL, который можно найти в панели управления. Он совпадает с `CONVEX_URL`, за исключением домена верхнего уровня, которым является `.site`, а не `.cloud`.

Например, если названием деплоя является `fast-horse-123`, то HTTP Actions URL будет выглядеть как `https://fast-horse-123.convex.site`, а callback URL для GitHub так:

```
https://fast-horse-123.convex.site/api/auth/callback/github
```

_Переменные среды_

Пример настройки переменных среды для GitHub:

```bash
npx convex env set AUTH_GITHUB_ID yourgithubclientid
npx convex env set AUTH_GITHUB_SECRET yourgithubsecret
```

Подробнее про настройку переменных среды в Convex можно почитать [здесь](https://docs.convex.dev/production/environment-variables#setting-environment-variables).

_Настройка провайдера_

Добавляем настройки провайдера в массив `providers` в файле `convex/auth.ts`:

```javascript
import GitHub from '@auth/core/providers/github'
import { convexAuth } from '@convex-dev/auth/server'

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [GitHub],
})
```

_Добавление кнопки авторизации_

Поток (flow) авторизации запускается с помощью функции `signIn`, возвращаемой хуком `useAuthActions`.

Первым аргументом функции является ИД провайдера - его название в нижнем регистре (по умолчанию):

```javascript
import { useAuthActions } from '@convex-dev/auth/react'

export function SignIn() {
  const { signIn } = useAuthActions()

  return (
    <button onClick={() => void signIn('github')}>
      Войти с помощью GitHub
    </button>
  )
}
```

_Извлечение данных пользователя_

По умолчанию в таблице `users` сохраняются только `name`, `email` и `image` пользователя.

Это можно изменить с помощью метода `profile` в настройках провайдера:

```javascript
import GitHub from '@auth/core/providers/github'
import { convexAuth } from '@convex-dev/auth/server'

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [
    GitHub({
      profile(githubProfile, tokens) {
        return {
          id: githubProfile.id,
          name: githubProfile.name,
          email: githubProfile.email,
          image: githubProfile.picture,
          githubId: githubProfile.id,
        }
      },
    }),
  ],
})
```

В примере добавляется поле `githubId`. Не забудьте соответствующим образом модифицировать схему БД.

`profile()` должен обязательно возвращать поле `id` с уникальным ИД, который используется для идентификации аккаунта.

### Пароли

Этот метод аутентификации основан на секретном пароле пользователя.

Солидная аутентификация на основе пароля предполагает способ сброса пароля (обычно через email или код).

Также может потребоваться подтверждение email (при регистрации или после) для обеспечения корректности email.

_Настройка_

Авторизация с помощью email (или имени пользователя) и пароля реализуется с помощью настройки провайдера `Password`.

Настраиваем провайдера:

```javascript
import { Password } from '@convex-dev/auth/providers/Password'
import { convexAuth } from '@convex-dev/auth/server'

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [Password],
})
```

После этого можно запускать авторизацию/регистрацию при отправке формы с помощью функции `signIn`.

Регистрация и авторизация - это разные вещи. То, какой процесс выполняется, определяется с помощью поля `flow`:

```javascript
import { useAuthActions } from '@convex-dev/auth/react'

export function SignIn() {
  const { signIn } = useAuthActions()
  // Регистрация или авторизация?
  const [step, setStep] = useState<'signUp' | 'signIn'>('signIn')

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        void signIn('password', formData)
      }}
    >
      <input name='email' placeholder='Email' type='text' />
      <input name='password' placeholder='Password' type='password' />
      // Регистрация или авторизация? formaData.get("step")
      <input name='flow' value={step} type='hidden' />
      <button type='submit'>
        {step === 'signIn' ? 'Войти' : 'Зарегистрироваться'}
      </button>
      <button
        type='button'
        onClick={() => {
          setStep(step === 'signIn' ? 'signUp' : 'signIn')
        }}
      >
        {step === 'signIn' ? 'Регистрация' : 'Вход'}
      </button>
    </form>
  )
}
```

_Сброс пароля с помощью email_

Сброс пароля с помощью email включает в себя 2 этапа:

1. Пользователь запрашивает ссылку для сброса пароля на email.
2. Пользователь переходит по ссылке или вводит код на сайте и вводит новый пароль.

Провайдер `Password` поддерживает сброс пароля с помощью настройки `reset`, которая принимает провайдера email.

Создаем кастомного провайдера email:

```javascript
import Resend from '@auth/core/providers/resend'
import { Resend as ResendAPI } from 'resend'
import { alphabet, generateRandomString } from 'oslo/crypto'

export const ResendOTPPasswordReset = Resend({
  id: 'resend-otp',
  apiKey: process.env.AUTH_RESEND_KEY,
  async generateVerificationToken() {
    return generateRandomString(8, alphabet('0-9'))
  },
  async sendVerificationRequest({ identifier: email, provider, token }) {
    const resend = new ResendAPI(provider.apiKey)
    const { error } = await resend.emails.send({
      from: 'My App <onboarding@resend.dev>',
      to: [email],
      subject: 'Сброс пароля',
      text: `Код для сброса пароля: ${token}`,
    })

    if (error) {
      throw new Error('При отправке ссылки для сброса пароля произошла ошибка')
    }
  },
})
```

И используем его в `convex/auth.ts`:

```javascript
import { Password } from '@convex-dev/auth/providers/Password'
import { convexAuth } from '@convex-dev/auth/server'
import { ResendOTPPasswordReset } from './ResendOTPPasswordReset'

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [Password({ reset: ResendOTPPasswordReset })],
})
```

Поток сброса пароля идентифицируется с помощью значений `"reset"` и `"reset-verification"` настройки `flow` функции `signIn`:

```javascript
import { useAuthActions } from '@convex-dev/auth/react'

export function PasswordReset() {
  const { signIn } = useAuthActions()
  const [step, setStep] = useState<'forgot' | { email: string }>('forgot')

  return step === 'forgot' ? (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        void signIn('password', formData).then(() =>
          setStep({ email: formData.get('email') as string }),
        )
      }}
    >
      <input name='email' placeholder='Email' type='text' />
      // Начинаем сброс
      <input name='flow' value='reset' type='hidden' />
      <button type='submit'>Отправить код</button>
    </form>
  ) : (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        void signIn('password', formData)
      }}
    >
      <input name='email' value={step.email} type='hidden' />
      // Код
      <input name='code' placeholder='Code' type='text' />
      // Новый пароль
      <input name='newPassword' placeholder='New password' type='password' />
      // Завершаем сброс
      <input name='flow' value='reset-verification' type='hidden' />
      <button type='submit'>Продолжить</button>
      <button type='button' onClick={() => setStep('signIn')}>
        Отмена
      </button>
    </form>
  )
}
```

_Подтверждение email_

Провайдер `Password` поддерживает подтверждение email с помощью настройки `verify`, принимающей провайдера email.

Создаем кастомного провайдера email:

```javascript
import Resend from '@auth/core/providers/resend'
import { Resend as ResendAPI } from 'resend'
import { alphabet, generateRandomString } from 'oslo/crypto'

export const ResendOTP = Resend({
  id: 'resend-otp',
  apiKey: process.env.AUTH_RESEND_KEY,
  async generateVerificationToken() {
    return generateRandomString(8, alphabet('0-9'))
  },
  async sendVerificationRequest({ identifier: email, provider, token }) {
    const resend = new ResendAPI(provider.apiKey)
    const { error } = await resend.emails.send({
      from: 'My App <onboarding@resend.dev>',
      to: [email],
      subject: 'Подтверждение email',
      text: `Ваш код: ${token}`,
    })

    if (error) {
      throw new Error(
        'При отправке ссылки для подтверждения email возникла ошибка',
      )
    }
  },
})
```

И используем его в `convex/auth.ts`:

```javascript
import { Password } from '@convex-dev/auth/providers/Password'
import { convexAuth } from '@convex-dev/auth/server'
import { ResendOTP } from './ResendOTP'

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [Password({ verify: ResendOTP })],
})
```

`signIn()` возвращает логическое значение, которое является индикатором успешной авторизации. В следующем примере мы это не проверяем, поскольку предполагаем полное размонтирование компонента после авторизации пользователя:

```javascript
import { useAuthActions } from '@convex-dev/auth/react'

export function SignIn() {
  const { signIn } = useAuthActions()
  const [step, setStep] = useState<'signIn' | 'signUp' | { email: string }>(
    'signIn',
  )

  return step === 'signIn' || step === 'signUp' ? (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        void signIn('password', formData).then(() =>
          setStep({ email: formData.get('email') as string }),
        )
      }}
    >
      <input name='email' placeholder='Email' type='text' />
      <input name='password' placeholder='Password' type='password' />
      <input name='flow' value={step} type='hidden' />
      <button type='submit'>
        {step === 'signIn' ? 'Войти' : 'Зарегистрироваться'}
      </button>
      <button
        type='button'
        onClick={() => {
          setStep(step === 'signIn' ? 'signUp' : 'signIn')
        }}
      >
        {step === 'signIn' ? 'Регистрация' : 'Вход'}
      </button>
    </form>
  ) : (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        void signIn('password', formData)
      }}
    >
      <input name='code' placeholder='Code' type='text' />
      <input name='email' value={step.email} type='hidden' />
      <button type='submit'>Продолжить</button>
      <button type='button' onClick={() => setStep('signIn')}>
        Отмена
      </button>
    </form>
  )
}
```

_Валидация email и пароля_

Для валидации данных, вводимых пользователем, можно воспользоваться следующими решениями:

- [Zod](https://zod.dev/) для валидации email и длины пароля, а также распределения логики между клиентом и сервером
- [haveibeenpwned](https://haveibeenpwned.com/) для проверки утечки email
- [zxcvbn-ts](https://zxcvbn-ts.github.io/zxcvbn/) для проверки "силы" пароля

Для этого достаточно передать настройку `profile` в провайдер `Password`.

Пример использования Zod:

```javascript
import { Password } from '@convex-dev/auth/providers/Password'
import { z } from 'zod'

const ParamsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(16),
})

export default Password({
  profile(params) {
    const { error, data } = ParamsSchema.safeParse(params)
    if (error) {
      throw new ConvexError(error.format())
    }
    return { email: data.email }
  },
})
```

### Авторизация

**Авторизация**

Авторизация зависит от выбранного метода аутентификации.

**Выход из системы**

Для выхода из системы используется функция `signOut`:

```javascript
import { useAuthActions } from '@convex-dev/auth/react'

export function SignOut() {
  const { signOut } = useAuthActions()

  return <button onClick={signOut}>Выход</button>
}
```

**Состояние авторизации**

`convex/react` предоставляет компоненты для проверки состояния авторизации пользователя:

```javascript
import { Authenticated, Unauthenticated, AuthLoading } from 'convex/react'
import { SignIn } from './SignIn'
import { SignOut } from './SignOut'

export function App() {
  return (
    <>
      <AuthLoading>{/* Индикатор загрузки */}</AuthLoading>
      <Unauthenticated>
        <SignIn />
      </Unauthenticated>
      <Authenticated>
        <SignOut />
        <Content />
      </Authenticated>
    </>
  )
}

function Content() {
  /* Защищенный контент */
}
```

**Аутентификация операций HTTP**

Для аутентификации вызовов операций HTTP требуется токен JWT, который возвращается хуком `useAuthToken`:

```javascript
import { useAuthToken } from '@convex-dev/auth/react'

function SomeComponent() {
  const token = useAuthToken()

  const onClick = async () => {
    const response = await fetch(
      `${process.env.VITE_CONVEX_SITE_URL!}/someEndpoint`,
      // Передаем токен в заголовке авторизации
      { headers: { Authorization: `Bearer ${token}` } },
    )
    // ...
  }
  // ...
}
```

**Использование состояния аутентификации в функциях бэкенда**

Доступ к информации о текущей авторизованном пользователе в функциях Convex можно получить с помощью вспомогательных функций из `@convex-dev/auth/server`.

Функции `getAuthUserId` и `getAuthSessionId` под капотом используют встроенную функцию `ctx.auth.getUserIdentity` и предоставляют типизированный апи.

**Модель данных**

Convex Auth создает таблицы `users` и `authSession`.

При регистрации пользователя создается документ в таблице `users`.

При авторизации пользователя создается документ в таблице `authSessions`. Этот документ удаляется после истечения сессии или выхода пользователя из системы.

Один пользователь может иметь несколько активных сессий одновременно. Для веб-приложений одна сессия распределяется между всеми вкладками браузера по умолчанию.

**Получение ИД авторизованного пользователя**

Для получения ИД авторизованного пользователя вызывается `getAuthUserId()` с аргументом `ctx`:

```javascript
import { getAuthUserId } from '@convex-dev/auth/server'
import { query } from './_generated/server'

export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (userId === null) {
      return null
    }
    return await ctx.db.get(userId)
  },
})
```

**Получение ИД текущей сессии**

Для получения ИД текущей сессии вызывается `getAuthSessionId()` с аргументом `ctx`:

```javascript
import { getAuthSessionId } from '@convex-dev/auth/server'
import { query } from './_generated/server'

export const currentSession = query({
  args: {},
  handler: async (ctx) => {
    const sessionId = await getAuthSessionId(ctx)
    if (sessionId === null) {
      return null
    }
    return await ctx.db.get(sessionId)
  },
})
```

### Серверная аутентификация в Next.js

**Защита роутов**

По умолчанию все роуты доступны без аутентификации. Защитить роуты от несанкционированного доступа можно в файле `middleware.ts`:

```javascript
import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  isAuthenticatedNextjs,
  nextjsMiddlewareRedirect,
} from '@convex-dev/auth/nextjs/server'

const isSignInPage = createRouteMatcher(['/signin'])
const isProtectedRoute = createRouteMatcher(['/product(.*)'])

export default convexAuthNextjsMiddleware((request) => {
  if (isSignInPage(request) && isAuthenticatedNextjs()) {
    return nextjsMiddlewareRedirect(request, '/product')
  }
  if (isProtectedRoute(request) && !isAuthenticatedNextjs()) {
    return nextjsMiddlewareRedirect(request, '/signin')
  }
})

export const config = {
  // Посредник запускается для всех роутов,
  // кроме статических ресурсов
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}
```

Convex Auth предоставляет апи и вспомогательные функции для реализации посредника:

- `createRouteMatcher` - функция, которая использует такой же синтаксис, что и `config` посредника. Мы вызываем ее со списком паттернов, и она возвращает функцию, которая возвращает переданный `NextRequest` при совпадении роута
- функция `isAuthenticatedNextjs` возвращает индикатор авторизованности запроса. При использовании `ConvexAuthNextjsServerProvider` состояние аутентификации хранится как в http-only cookies, так и на клиенте, поэтому оно доступно также при запросах страницы
- функция `nextjsMiddlewareRedirect` - сокращение для запуска перенаправлений

```javascript
export function nextjsMiddlewareRedirect(
  request: NextRequest,
  pathname: string,
) {
  const url = request.nextUrl.clone()
  url.pathname = pathname
  return NextResponse.redirect(url)
}
```

**Предварительная и обычная загрузка данных**

Для предварительной и обычной загрузки данных на сервере Next.js из бэкенда Convex используются функции `preloadQuery` и `fetchQuery`, а также функция `convexAuthNextjsToken`:

```javascript
import { convexAuthNextjsToken } from '@convex-dev/auth/nextjs/server'
import { preloadQuery } from 'convex/nextjs'
import { api } from '@/convex/_generated/api'
import { Tasks } from './Tasks'

export async function TasksWrapper() {
  const preloadedTasks = await preloadQuery(
    api.tasks.list,
    { list: 'default' },
    { token: convexAuthNextjsToken() },
  )
  return <Tasks preloadedTasks={preloadedTasks} />
}
```

**Вызов аутентифицированных мутаций и операций**

Мутации и операции могут вызываться из серверных операций (server actions) Next.js, а также из POST и PUT-обработчиков роута (route handlers):

```javascript
import { api } from '@/convex/_generated/api'
import { fetchMutation, fetchQuery } from 'convex/nextjs'
import { revalidatePath } from 'next/cache'

export default async function PureServerPage() {
  const tasks = await fetchQuery(api.tasks.list, { list: 'default' })

  async function createTask(formData: FormData) {
    'use server'

    await fetchMutation(
      api.tasks.create,
      {
        text: formData.get('text') as string,
      },
      { token: convexAuthNextjsToken() },
    )
    revalidatePath('/example')
  }

  return <form action={createTask}>...</form>
}
```

## Clerk

[Clerk](https://clerk.com/) - это платформа аутентификации, предоставляющая авторизацию через пароли, сторонних провайдеров, одноразовые email или СМС, мультифакторную аутентификацию и управление пользователями.

- [Пример](https://github.com/get-convex/convex-demos/tree/main/clerk)

__Начало работы__

Предполагается, что у нас есть работающее приложение React с Convex.

_Регистрируемся в Clerk_

<img src="https://habrastorage.org/webt/vj/dt/3k/vjdt3kfdyaw1m7zuttow7pgjkuy.png" />
<br />

_Создаем там приложение_

<img src="https://habrastorage.org/webt/24/f8/oj/24f8oj75yfvary5wnzfh_reir1g.png" />
<br />

_Создаем шаблон JWT_

В разделе JWT Templates кликаем по New template и выбираем Convex.

Копируем Issuer URL.

Нажимаем Apply Changes.

_Обратите внимание_: токен JWT должен называться `convex`.

<img src="https://habrastorage.org/webt/jf/ok/ld/jfokldzj9yy_govqdpazrp6t5_8.png" />
<br />

_Создаем настройку аутентификации_

В директории `convex` создаем файл `auth.config.ts` с серверными настройками для валидации токенов доступа:

```javascript
export default {
  providers: [
    {
      // Issuer URL
      domain: "https://your-issuer-url.clerk.accounts.dev/",
      applicationID: "convex",
    },
  ]
};
```

_Деплоим изменения_

```bash
npx convex dev
```

_Устанавливаем Clerk_

```bash
npm install @clerk/clerk-react
```

_Получаем Publishable key в панели управления Clerk_

<img src="https://habrastorage.org/webt/c5/8b/6g/c58b6gwph9xwukzt0d3tn_ku6b8.png" />
<br />

_Настраиваем ConvexProviderWithClerk_

```javascript
// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ClerkProvider publishableKey="pk_test_...">
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <App />
      </ConvexProviderWithClerk>
    </ClerkProvider>
  </React.StrictMode>,
);
```

__Отображение UI в зависимости от состояния аутентификации__

`convex/react` и `@clerk/clerk-react` предоставляют готовые компоненты для управления состоянием аутентификации пользователя:

```javascript
import { SignInButton, UserButton } from "@clerk/clerk-react";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

function App() {
  return (
    <main>
      <Unauthenticated>
        <SignInButton />
      </Unauthenticated>
      <Authenticated>
        <UserButton />
        <Content />
      </Authenticated>
    </main>
  );
}

function Content() {
  const messages = useQuery(api.messages.getForCurrentUser);

  return <div>Защищенный контент: {messages?.length}</div>;
}

export default App;
```

__Использование состояние аутентификации в функциях Convex__

Если пользователь аутентифицирован, его информация хранится в JWT и доступна через `ctx.auth.getUserIdentity()`.

Если пользователь не аутентифицирован, `ctx.auth.getUserIdentity()` возвращает `null`.

```javascript
import { query } from "./_generated/server";

export const getForCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Unauthorized");
    }

    return await ctx.db
      .query("messages")
      .filter((q) => q.eq(q.field("author"), identity.email))
      .collect();
  },
});
```

__Авторизация и выход из системы__

Для создания потока авторизации используется компонент `SignInButton`. При ее нажатии открывается модальное окно авторизации Clerk:

```javascript
import { SignInButton } from "@clerk/clerk-react";

function App() {
  return (
    <div className="App">
      <SignInButton mode="modal" />
    </div>
  );
}
```

Для потока выхода из системы используется компонент `SignOutButton` или `UserButton`, который открывает модалку с соответствующей кнопкой.

__Авторизованные и неавторизованные отображения__

Для проверки состояния авторизованности пользователя следует использовать хук `useConvexAuth` вместо хука `useAuth` от Clerk. `useConvexAuth()` проверяет, что браузер получил токен аутентификации, необходимый для выполнения запросов к бэку Convex, а также, что бэк его провалидировал:

```javascript
import { useConvexAuth } from "convex/react";

function App() {
  const { isLoading, isAuthenticated } = useConvexAuth();

  return (
    <div className="App">
      {isAuthenticated ? "Авторизован" : "Не авторизован"}
    </div>
  );
}
```

Также можно использовать вспомогательные компоненты `Authenticated`, `Unauthenticated` и `AuthLoading` вместо одноименных компонентов Clerk. Эти компоненты используют хук `useConvex` под капотом:

```javascript
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";

function App() {
  return (
    <div className="App">
      <Authenticated>Авторизован</Authenticated>
      <Unauthenticated>Не авторизован</Unauthenticated>
      <AuthLoading>Загрузка...</AuthLoading>
    </div>
  );
}
```

_Информация о пользователе в React_

Доступ к данным пользователя можно получить с помощью хука `useAuth` от Clerk:

```javascript
import { useUser } from "@clerk/clerk-react";

export default function Badge() {
  const { user } = useUser();
  return <span>Авторизован как {user.fullName}</span>;
}
```

__Под капотом__

Поток аутентификации под капотом выглядит следующим образом:

1. Пользователь нажимает кнопку авторизации.
2. Пользователь перенаправляется на страницу, где он авторизуется с помощью метода, настроенного в Clerk.
3. После успешной авторизации Clerk направляет пользователя обратно в приложение на страницу авторизации или другую страницу, указанную в пропе `afterSignIn`.
4. `ClerkProvider` теперь знает, что пользователь аутентифицирован.
5. `ConvexProviderWithClerk` получает токен аутентификации от Clerk.
6. `ConvexReactClient` передает этот токен в бэк Convex для валидации.
7. Convex получает публичный ключ из Clerk для валидации сигнатуры токена.
8. `ConvexReactClient` уведомляется об успешной аутентификации и `ConvexProviderWithClerk` теперь знает, что пользователь аутентифицирован в Convex. Хук `useConvexAuth` возвращает `isAuthenticated: true` и компонент `Authenticated` рендерит своих потомков.

`ConvexProviderWithClerk` заботится о получении токена при необходимости, чтобы пользователь оставался аутентифицированным в Convex.

## Auth0

[Auth0](https://auth0.com/) - это платформа аутентификации, предоставляющая авторизацию через пароли, сторонних провайдеров, одноразовые email или СМС, мультифакторную аутентификацию, SSO и управление пользователями.

- [Пример](https://github.com/get-convex/convex-demos/tree/main/users-and-auth)

В целом, настройка аутентификации с помощью Auth0 похожа на настройку аутентификации с помощью Clerk, за исключением [некоторых особенностей](https://docs.convex.dev/auth/auth0).

## Аутентификация в функциях

Доступ к информации о текущей авторизованном пользователе в функциях Convex можно получить с помощью свойства `auth` объекта `QueryCtx`, `MutationCtx` или `ActionCtx`:

```javascript
import { mutation } from "./_generated/server";

export const myMutation = mutation({
  args: {
    // ...
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Unauthorized");
    }
    //...
  },
});
```

__UserIdentity__

Объект [UserIdentity](https://docs.convex.dev/api/interfaces/server.UserIdentity), возвращаемый `getUserIdentity()`, гарантировано содержит поля `tokenIdentifier`, `subject` и `issuer`. Наличие других полей зависит от используемого провайдера аутентификации, а также от настроек токенов JWT и [областей OpenID](https://openid.net/specs/openid-connect-core-1_0.html#StandardClaims).

`tokenIdentifier` - это комбинация `subject` и `issuer`, что обеспечивает уникальность ИД, даже при использовании нескольких провайдеров.

```javascript
import { mutation } from "./_generated/server";

export const myMutation = mutation({
  args: {
    // ...
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const { tokenIdentifier, name, email } = identity!;
    //...
  },
});
```

__Операции HTTP__

`getUserIdentity()` также позволяет получать доступ к данным пользователя в операциях HTTP для вызова конечных точек апи с правильным заголовком `Authorization`:

```javascript
const jwtToken = "...";

fetch("https://<deployment name>.convex.site/myAction", {
  headers: {
    Authorization: `Bearer ${jwtToken}`,
  },
});
```

## Хранение данных пользователей

_Обратите внимание_: при использовании Convex Auth данные пользователей сохраняются в БД Convex автоматически.

Хранить информацию о пользователях в БД Convex может потребоваться по следующим причинам:

- нашим функциям нужна информация о других юзерах, а не только о текущем авторизованном
- функциям нужен доступ к информации, дополнительной к полям, доступным в [Open ID Connect JWT](https://docs.convex.dev/auth/functions-auth)

Существует 2 способа хранения информации о пользователях в БД (только второй позволяет хранить информацию, не содержащуюся в JWT):

1. Вызов мутации для сохранения информации из JWT, доступную в `ctx.auth`.
2. Реализация веб-хука, вызываемого провайдером аутентификации при изменении пользовательской информации.

__Вызов мутации на клиенте__

- [Пример](https://github.com/get-convex/convex-demos/tree/main/users-and-clerk)

_Схема таблицы пользователей (опционально)_

Можно определить таблицу `"users"`, а также, опционально, индекс для эффективного поиска юзеров в БД.

В следующем примере мы используем `tokenIdentifier` из `ctx.auth.getUserIdentity()` для идентификации юзера, но с тем же успехом можно использовать `subject` или даже `email`.

```javascript
// convex/schema.ts
users: defineTable({
  name: v.string(),
  tokenIdentifier: v.string(),
}).index("by_token", ["tokenIdentifier"]),
```

_Мутация для сохранения текущего пользователя_

```javascript
// convex/users.ts
import { mutation } from "./_generated/server";

export const store = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called storeUser without authentication present");
    }

    // Проверяем наличие данных пользователя.
    // Обратите внимание: вместо индекса можно использовать
    // ctx.db.query("users")
    //  .filter(q => q.eq(q.field("tokenIdentifier"), identity.tokenIdentifier))
    //  .unique();
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    if (user !== null) {
      // Обновляем имя пользователя при необходимости
      if (user.name !== identity.name) {
        await ctx.db.patch(user._id, { name: identity.name });
      }
      return user._id;
    }
    // Создаем нового пользователя
    return await ctx.db.insert("users", {
      name: identity.name ?? "Анонимус",
      tokenIdentifier: identity.tokenIdentifier,
    });
  },
});
```

_Вызов мутации из React_

Кастомный хук, вызывающий мутацию после авторизации:

```javascript
// src/useStoreUserEffect.ts
import { useUser } from "@clerk/clerk-react";
import { useConvexAuth } from "convex/react";
import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

export function useStoreUserEffect() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const { user } = useUser();
  // Установка этого состояния означает сохранение пользователя на сервере
  const [userId, setUserId] = useState<Id<"users"> | null>(null);
  const storeUser = useMutation(api.users.store);
  // Вызываем мутацию `storeUser` для сохранения
  // текущего пользователя в таблице `users` и возврата его ИД
  useEffect(() => {
    // Если пользователь не авторизован, ничего не делаем
    if (!isAuthenticated) {
      return;
    }
    // Сохраняем пользователя в БД.
    // `storeUser()` получает данные пользователя через объект `auth`
    // на сервере. Вручную ничего передавать не нужно
    async function createUser() {
      const id = await storeUser();
      setUserId(id);
    }
    createUser();
    return () => setUserId(null);
    // Перезапускаем хук при авторизации пользователя через
    // другого провайдера
  }, [isAuthenticated, storeUser, user?.id]);
  // Комбинируем локальное состояние с состоянием из контекста
  return {
    isLoading: isLoading || (isAuthenticated && userId === null),
    isAuthenticated: isAuthenticated && userId !== null,
  };
}
```

Используем этот хук в верхнеуровневом компоненте:

```javascript
// src/App.tsx
import { SignInButton, UserButton } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useStoreUserEffect } from "./useStoreUserEffect.js";

function App() {
  const { isLoading, isAuthenticated } = useStoreUserEffect();

  return (
    <main>
      {isLoading ? (
        <>Загрузка...</>
      ) : !isAuthenticated ? (
        <SignInButton />
      ) : (
        <>
          <UserButton />
          <Content />
        </>
      )}
    </main>
  );
}

function Content() {
  const messages = useQuery(api.messages.getForCurrentUser);

  return <div>Защищенный контент: {messages?.length}</div>;
}

export default App;
```

В данном случае `useStoreUserEffect()` заменяет `useConvexAuth()`.

_Использование ИД пользователя_

После сохранения данных пользователя, его ИД может использоваться как внешний ключ (foreign key) в других документах:

```javascript
import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const send = mutation({
  args: { body: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    if (!user) {
      throw new Error("Unauthorized");
    }
    await ctx.db.insert("messages", { body: args.body, user: user._id });
    // ...
  },
});
```

_Загрузка пользователя по ИД_

```javascript
import { query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const messages = await ctx.db.query("messages").collect();

    return Promise.all(
      messages.map(async (message) => {
        // Для каждого сообщения извлекаем написавшего его
        // пользователя и добавляем его имя в поле `author`
        const user = await ctx.db.get(message.user);
        return {
          author: user?.name ?? "Анонимус",
          ...message,
        };
      }),
    );
  },
});
```

__Установка веб-хука__

Мы будем использовать Clerk, но в Auth0 [процесс похожий](https://auth0.com/docs/customize/actions/actions-overview).

В данном случае Clerk будет вызывать бэк Convex через конечную точку HTTP при регистрации пользователя, обновлении или удалении его аккаунта.

- [Пример](https://github.com/get-convex/convex-demos/tree/main/users-and-clerk-webhooks)

_Настройка конечной точки веб-хука_

На панели управления Clerk переходим в Webhooks и нажимаем "+ Add Endpoint".

Устанавливаем Endpoint URL в значение `https://<название-деплоя>.convex.site/clerk-users-webhook` (обратите внимание, что домен заканчивается на `.site`, а не на `.cloud`). Название деплоя можно найти в файле `.env.local` в директории проекта или в панели управления Convex как часть Deployment URL.

В Message Filtering выбираем user для всех пользовательских событий.

Нажимаем Create.

После сохранения конечной точки копируем Signing Secret, который должен начинаться с `whsec_`. Устанавливаем его в качестве значения переменной окружения `CLERK_WEBHOOK_SECRET` в панели управления Convex.

_Схема таблицы пользователей (опционально)_

Можно определить таблицу `"users"`, а также, опционально, индекс для эффективного поиска юзеров в БД:

```javascript
users: defineTable({
  name: v.string(),
  // Это Clerk ID, хранящийся в поле `subject` JWT
  externalId: v.string(),
}).index("byExternalId", ["externalId"]),
```

_Мутации для вставки и удаления пользователей_

```javascript
// convex/users.ts
import { internalMutation, query, QueryCtx } from "./_generated/server";
import { UserJSON } from "@clerk/backend";
import { v, Validator } from "convex/values";

// Передает данные юзера клиенту для определения
// успешности выполнения веб-хука
export const current = query({
  args: {},
  handler: async (ctx) => {
    return await getCurrentUser(ctx);
  },
});

// Вызывается при регистрации юзера или обновлении его аккаунта
export const upsertFromClerk = internalMutation({
  args: { data: v.any() as Validator<UserJSON> }, // валидации нет, мы доверяем Clerk
  async handler(ctx, { data }) {
    const userAttributes = {
      name: `${data.first_name} ${data.last_name}`,
      externalId: data.id,
    };

    const user = await userByExternalId(ctx, data.id);
    if (user === null) {
      await ctx.db.insert("users", userAttributes);
    } else {
      await ctx.db.patch(user._id, userAttributes);
    }
  },
});

// Вызывается при удалении пользователя
export const deleteFromClerk = internalMutation({
  args: { clerkUserId: v.string() },
  async handler(ctx, { clerkUserId }) {
    const user = await userByExternalId(ctx, clerkUserId);

    if (user !== null) {
      await ctx.db.delete(user._id);
    } else {
      console.warn(
        `Невозможно удалить пользователя, отсутствует его Clerk ID: ${clerkUserId}`,
      );
    }
  },
});

// Возвращает данные текущего авторизованного пользователя
// или выбрасывает исключение
export async function getCurrentUserOrThrow(ctx: QueryCtx) {
  const userRecord = await getCurrentUser(ctx);
  if (!userRecord) {
    throw new Error("Пользователь отсутствует");
  }
  return userRecord;
}

// Возвращает данные текущего авторизованного пользователя или `null`
export async function getCurrentUser(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (identity === null) {
    return null;
  }
  return await userByExternalId(ctx, identity.subject);
}

// Извлекает данные юзера по Clerk ID
async function userByExternalId(ctx: QueryCtx, externalId: string) {
  return await ctx.db
    .query("users")
    .withIndex("byExternalId", (q) => q.eq("externalId", externalId))
    .unique();
}
```

_Конечная точка веб-хука_

```javascript
// convex/http.ts
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import type { WebhookEvent } from "@clerk/backend";
import { Webhook } from "svix";

const http = httpRouter();

http.route({
  path: "/clerk-users-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const event = await validateRequest(request);
    if (!event) {
      return new Response("Возникла ошибка", { status: 400 });
    }
    switch (event.type) {
      case "user.created": // намеренное "проваливание"
      case "user.updated":
        await ctx.runMutation(internal.users.upsertFromClerk, {
          data: event.data,
        });
        break;

      case "user.deleted": {
        const clerkUserId = event.data.id!;
        await ctx.runMutation(internal.users.deleteFromClerk, { clerkUserId });
        break;
      }
      default:
        console.log("Игнорируемое событие веб-хука", event.type);
    }

    return new Response(null, { status: 200 });
  }),
});

async function validateRequest(req: Request): Promise<WebhookEvent | null> {
  const payloadString = await req.text();
  const svixHeaders = {
    "svix-id": req.headers.get("svix-id")!,
    "svix-timestamp": req.headers.get("svix-timestamp")!,
    "svix-signature": req.headers.get("svix-signature")!,
  };
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
  try {
    return wh.verify(payloadString, svixHeaders) as unknown as WebhookEvent;
  } catch (error) {
    console.error("Ошибка при подтверждении события веб-хука", error);
    return null;
  }
}

export default http;
```

_Использование данных пользователя_

```javascript
import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { getCurrentUserOrThrow } from "./users";

export const send = mutation({
  args: { body: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    await ctx.db.insert("messages", { body: args.body, userId: user._id });
  },
});
```

_Получение данных пользователя_

```javascript
export const list = query({
  args: {},
  handler: async (ctx) => {
    const messages = await ctx.db.query("messages").collect();
    return Promise.all(
      messages.map(async (message) => {
        const user = await ctx.db.get(message.user);
        return {
          author: user?.name ?? "Анонимус",
          ...message,
        };
      }),
    );
  },
});
```

_Ожидание сохранения текущего пользователя_

Хук для определения состояние аутентификации текущего юзера с проверкой наличия его данных в БД:

```javascript
// src/useCurrentUser.ts
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export function useCurrentUser() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const user = useQuery(api.users.current);
  // Комбинируем состояние аутентификации с проверкой наличия пользователя
  return {
    isLoading: isLoading || (isAuthenticated && user === null),
    isAuthenticated: isAuthenticated && user !== null,
  };
}
```

Затем можно рендерить соответствующие компоненты:

```javascript
import { useCurrentUser } from "./useCurrentUser";

export default function App() {
  const { isLoading, isAuthenticated } = useCurrentUser();

  return (
    <main>
      {isLoading ? (
        <>Загрузка...</>
      ) : isAuthenticated ? (
        <Content />
      ) : (
        <LoginPage />
      )}
    </main>
  );
}
```

# Планирование задач

Convex позволяет легко планировать разовое или периодическое выполнение функций в будущем. Это позволяет создавать длящиеся рабочие процессы, такие как отправка приветственного email через день после регистрации или регулярная проверка аккаунтов с помощью Stripe. Convex предоставляет две разных возможности для планирования:

- запланированные функции (scheduled functions) могут планироваться к выполнению в будущем другими функциями. Функции могут запускаться через минуты, дни и даже месяцы
- задачи Cron (cron jobs) планируют функции для запуска на регулярной основе, например, еженедельно

## Запланированные задачи

Convex позволяет планировать выполнение функций в будущем. Это позволяет создавать протяженные во времени рабочие процессы без необходимости настройки и поддержки очередей (queues) или другой инфраструктуры.

Запланированные функции хранятся в БД. Это означает, что их выполнение может планироваться через минуты, дни и даже месяцы. Планирование устойчиво к неожиданным сбоям и перезапускам системы.

- [Пример](https://github.com/get-convex/convex-demos/tree/main/scheduling)

__Планирование функций__

Планировать публичные и внутренние функции можно в мутациях и операциях с помощью планировщика (`scheduler`), содержащегося в соответствующем контексте.

- Метод `runAfter` планирует функцию к запуску через определенное время (delay) (измеряемое в мс)
- метод `runAt` планирует функцию к запуску в определенное время (измеряемое в мс с начала эпохи)

Остальными аргументами являются путь к функции и ее параметры.

Пример отправки сообщения с его уничтожением через 5 сек:

```javascript
import { mutation, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const sendExpiringMessage = mutation({
  args: { body: v.string(), author: v.string() },
  handler: async (ctx, args) => {
    const { body, author } = args;
    const id = await ctx.db.insert("messages", { body, author });
    // Удаляем сообщение через 5 с
    await ctx.scheduler.runAfter(5000, internal.messages.destruct, {
      messageId: id,
    });
  },
});

export const destruct = internalMutation({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.messageId);
  },
});
```

Одна функция может планировать до 1000 функций с общим размером аргументов до 8 Мб.

__Планирование в мутациях__

Планирование функций в мутациях связано с остальной мутацией. Это означает, что функция планируется только при успешном выполнении всей мутации. Если мутация проваливается, функция не выполняется, даже если была "запланирована".

__Планирование в операциях__

В отличие от мутаций, операции не являются транзакциями и могут иметь побочные эффекты. Поэтому выполнение запланированных функций не зависит от успешности операций.

__Немедленное планирование__

`runAfter(0, fn)` используется для немедленного добавления функции в очередь событий. Это похоже на `setTimeout(fn, 0)`.

Это может пригодиться, когда нужно запустить операцию, которая зависит от успеха мутации.

__Получение статуса запланированной функции__

Каждая запланированная функция сохраняется как документ в системной таблице `"_scheduled_functions"`. `runAfter()` и `runAt()` возвращают ИД запланированной функции. Данные из системных таблиц можно читать с помощью методов `db.system.get` и `db.system.query`:

```javascript
export const listScheduledMessages = query({
  args: {},
  handler: async (ctx, args) => {
    return await ctx.db.system.query("_scheduled_functions").collect();
  },
});

export const getScheduledMessage = query({
  args: {
    id: v.id("_scheduled_functions"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.system.get(args.id);
  },
});
```

Пример возвращаемого документа:

```javascript
{
  "_creationTime": 1699931054642.111,
  "_id": "3ep33196167235462543626ss0scq09aj4gqn9kdxrdr",
  "args": [{}],
  "completedTime": 1699931054690.366,
  "name": "messages.js:destruct",
  "scheduledTime": 1699931054657,
  "state": { "kind": "success" }
}
```

- `name` - путь функции
- `args` - аргументы функции
- `scheduledTime` - время планирования функции (в мс с начала эпохи)
- `completedTime` - время успешного выполнения функции (в мс с начала эпохи)
- `state` - статус функции:
  - `Pending` - функция не запускалась
  - `InProgress` - функция запущена, но еще не завершена (применяется только к операциям)
  - `Success` - функция успешно выполнена
  - `Error` - при выполнении функции возникла ошибка
  - `Cancelled` - функция была отменена через панель управления, `ctx.scheduler.cancel()` или рекурсивно родительской функцией

Результаты выполнения запланированной функции доступны в течение 7 дней.

__Отмена запланированной функции__

Ранее запланированная функция может быть отменена с помощью метода `cancel`:

```javascript
export const cancelMessage = mutation({
  args: {
    id: v.id("_scheduled_functions"),
  },
  handler: async (ctx, args) => {
    await ctx.scheduler.cancel(args.id);
  },
});
```

Эффект вызова `cancel()` зависит от состояния функции:

- если функция не запускалась, она не будет запущена
- если функция запущена, она продолжит выполняться, но планируемые ей функции не будут запущены

## Задачи Cron

Convex позволяет планировать выполнение функций на регулярной основе. Например, задачи cron могут использоваться для очистки данных с определенной периодичностью, отправки email с напоминанием в одно и тоже время каждый месяц или резервное копирование данных каждую сб.

- [Пример](https://github.com/get-convex/convex-demos/tree/main/cron-jobs)

__Определение cron-задачи__

Задачи cron определяются в файле `cron.ts` в директории `convex`:

```javascript
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "clear messages table",
  { minutes: 1 }, // каждую мин
  internal.messages.clearAll,
);

crons.monthly(
  "payment reminder",
  { day: 1, hourUTC: 16, minuteUTC: 0 }, // каждый мес в первый день в 8 утра
  internal.payments.sendPaymentEmail,
  { email: "my_email@gmail.com" }, // аргумент `sendPaymentEmail()`
);

// Альтернативный вариант с использованием синтаксиса cron
crons.cron(
  "payment reminder duplicate",
  "0 16 1 * *",
  internal.payments.sendPaymentEmail,
  { email: "my_email@gmail.com" },
);

export default crons;
```

Первый аргумент - уникальный ИД задачи cron.

Второй аргумент - время, которое зависит от используемого планировщика.

Третий аргумент - название публичной или внутренней функции, мутации или операции.

__Поддерживаемые планировщики__

- `crons.interval()` периодически запускает функцию через определенный промежуток времени, измеряемый в `seconds`, `minutes` и `hours`. Первый запуск выполняется при деплое
- `crons.cron()` - традиционный способ определения задач cron с помощью строки, содержащей 5 полей, разделенных пробелами (например, `"* * * * *"`). Время указывается в формате UTC. [Crontab Guru](https://crontab.guru/) - полезный ресурс для понимания такого синтаксиса
- `crons.hourly()`, `crons.daily()`, `crons.weekly()`, `crons.monthly()` предоставляют альтернативный синтаксис для популярных планировщиков с явными названиями аргументов

# Хранилище файлов

Файловое хранилище позволяет легко загружать файлы в приложение, скачивать файлы и отправлять их в сторонние апи, а также динамически предоставлять файлы пользователям. Поддерживаются все типы файлов.

- [Пример работы с файлами с помощью операций HTTP](https://github.com/get-convex/convex-demos/tree/main/file-storage-with-http)
- [Пример работы с файлами с помощью запросов и мутаций](https://github.com/get-convex/convex-demos/tree/main/file-storage)

_Обратите внимание:_ хранилище файлов в настоящее время является экспериментальной возможностью. Это означает, что соответствующий код в будущем может претерпеть некоторые изменения.

## Загрузка файлов

Файлы могут загружаться в Convex либо с помощью генерируемых урлов для загрузки (upload urls), либо с помощью кастомных операций HTTP.

__Загрузка файлов с помощью урлов__

Большие файлы могут загружаться прямо на сервер с помощью генерируемых урлов для загрузки. Для этого клиент должен выполнить следующее:

1. Сгенерировать урл для загрузки с помощью мутации, вызывающей `storage.generateUploadUrl()`.
2. Отправить POST-запрос с содержимым файла по урлу для загрузки и получить ИД хранилища (storage ID).
3. Сохранить ИД хранилища в БД с помощью другой мутации.

В первой мутации, которая генерирует урл для загрузки, можно управлять тем, кто может загружать файлы.

_Вызов апи для загрузки файлов со страницы_

Пример загрузки изображения при отправке формы в урл для загрузки, генерируемый мутацией:

```javascript
import { FormEvent, useRef, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

export default function App() {
  const generateUploadUrl = useMutation(api.messages.generateUploadUrl);
  const sendImage = useMutation(api.messages.sendImage);

  const imageInput = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  async function handleSendImage(event: FormEvent) {
    event.preventDefault();

    // Шаг 1: получаем короткоживущий урл для загрузки
    const postUrl = await generateUploadUrl();
    // Шаг 2: выполняем POST-запрос для загрузки файла
    const result = await fetch(postUrl, {
      method: "POST",
      headers: { "Content-Type": selectedImage!.type },
      body: selectedImage,
    });
    const { storageId } = await result.json();
    // Шаг 3: сохраняем ИД хранилища в БД
    await sendImage({ storageId, author: `User ${Math.floor(Math.random() * 10000)}` });

    setSelectedImage(null);
    imageInput.current!.value = "";
  }

  return (
    <form onSubmit={handleSendImage}>
      <input
        type="file"
        accept="image/*"
        ref={imageInput}
        onChange={(event) => setSelectedImage(event.target.files![0])}
        disabled={selectedImage !== null}
      />
      <input
        type="submit"
        value="Сохранить"
        disabled={selectedImage === null}
      />
    </form>
  );
}
```

_Генерация урла дял загрузки_

Урл для загрузки генерируется с помощью метода ` storage.generateUploadUrl` контекста мутации:

```javascript
import { mutation } from "./_generated/server";

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});
```

Эта мутации может управлять тем, кто может загружать файлы.

Урл для загрузки "живет" 1 час.

_Запись нового ИД хранилища в БД_

```javascript
import { mutation } from "./_generated/server";

export const sendImage = mutation({
  args: { storageId: v.id("_storage"), author: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.insert("messages", {
      body: args.storageId,
      author: args.author,
      format: "image",
    });
  },
});
```

_Ограничения_

Размер файлов не ограничен, но таймаут POST-запроса составляет 2 мин.

__Загрузка файлов с помощью операции HTTP__

Процесс загрузки файла можно свести к одному запросу с помощью операции HTTP, но это требует правильной настройки заголовков CORS.

Операция HTTP для загрузки файлов может управлять тем, кто может загружать файлы. Однако в настоящее время размер запроса ограничен 20 Мб. Для загрузки файлов большего размера следует использовать урлы для загрузки.

_Вызов операции HTTP для загрузки файлов со страницы_

Пример загрузки изображения при отправке формы с помощью операции HTTP:

```javascript
import { FormEvent, useRef, useState } from "react";

const convexSiteUrl = import.meta.env.VITE_CONVEX_SITE_URL;

export default function App() {
  const imageInput = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  async function handleSendImage(event: FormEvent) {
    event.preventDefault();

    // Например, https://happy-animal-123.convex.site/sendImage?author=User+123
    const sendImageUrl = new URL(`${convexSiteUrl}/sendImage`);
    sendImageUrl.searchParams.set("author", `User ${Math.floor(Math.random() * 10000)}`);

    await fetch(sendImageUrl, {
      method: "POST",
      headers: { "Content-Type": selectedImage!.type },
      body: selectedImage,
    });

    setSelectedImage(null);
    imageInput.current!.value = "";
  }

  return (
    <form onSubmit={handleSendImage}>
      <input
        type="file"
        accept="image/*"
        ref={imageInput}
        onChange={(event) => setSelectedImage(event.target.files![0])}
        disabled={selectedImage !== null}
      />
      <input
        type="submit"
        value="Сохранить"
        disabled={selectedImage === null}
      />
    </form>
  );
}
```

_Определение операции HTTP для загрузки файлов_

Файл, содержащийся в теле HTTP-запроса, сохраняется с помощью функции `storage.store` контекста операции. Эта функция возвращает `Id<"_storage">` сохраненного файла.

Для сохранения ИД хранилища в БД в операции можно вызвать соответствующую мутацию:

```javascript
// convex/https.ts
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";

const http = httpRouter();

http.route({
  path: "/sendImage",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // Шаг 1: сохраняем файл
    const blob = await request.blob();
    const storageId = await ctx.storage.store(blob);

    // Шаг 2: сохраняем ИД хранилища в БД с помощью мутации
    const author = new URL(request.url).searchParams.get("author");
    await ctx.runMutation(api.messages.sendImage, { storageId, author });

    // Шаг 3: возвращаем ответ с правильными заголовками CORS
    return new Response(null, {
      status: 200,
      // Заголовки CORS
      headers: new Headers({
        "Access-Control-Allow-Origin": process.env.CLIENT_ORIGIN!,
        Vary: "origin",
      }),
    });
  }),
});
```

Необходимо также правильно обработать предварительный запрос OPTIONS:

```javascript
http.route({
  path: "/sendImage",
  method: "OPTIONS",
  handler: httpAction(async (_, request) => {
    // Убеждаемся в наличии необходимых заголовков
    const headers = request.headers;
    if (
      headers.get("Origin") !== null &&
      headers.get("Access-Control-Request-Method") !== null &&
      headers.get("Access-Control-Request-Headers") !== null
    ) {
      return new Response(null, {
        headers: new Headers({
          "Access-Control-Allow-Origin": process.env.CLIENT_ORIGIN!,
          "Access-Control-Allow-Methods": "POST",
          "Access-Control-Allow-Headers": "Content-Type, Digest",
          "Access-Control-Max-Age": "86400",
        }),
      });
    } else {
      return new Response();
    }
  }),
});
```

## Хранение файлов

Файлы могут загружаться в Convex прямо с клиента, как мы видели в предыдущем разделе

В качестве альтернативы файлы также могут сохраняться в Convex после их получения или генерации в обычных операциях и операциях HTTP. Например, мы можем вызвать сторонний апи для генерации изображения на основе запроса пользователя и сохранить изображение в Convex.

- [Пример](https://github.com/get-convex/convex-demos/tree/main/dall-e-storage-action)

__Сохранение файлов в операциях__

Сохранение файлов в операциях похоже на загрузку файлов с помощью операций HTTP.

Такая операция состоит из следующих этапов:

1. Получение или генерация изображения.
2. Сохранение изображения с помощью `storage.store()` и получение ИД хранилища.
3. Сохранение ИД хранилища в БД с помощью мутации.

ИД хранилища соответствуют документам в системной таблице `"_storage"`, поэтому они могут валидироваться с помощью `v.id("_storage")` и типизироваться с помощью `Id<"_storage">`.

```javascript
import { action, internalMutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

export const generateAndStore = action({
  args: { prompt: v.string() },
  handler: async (ctx, args) => {
    // Генерируем `imageUrl` на основе `prompt`
    const imageUrl = "https://....";

    // Загружаем изображение
    const response = await fetch(imageUrl);
    const image = await response.blob();

    // Сохраняем изображение в Convex
    const storageId: Id<"_storage"> = await ctx.storage.store(image);

    // Записываем `storageId` в документ
    await ctx.runMutation(internal.images.storeResult, {
      storageId,
      prompt: args.prompt,
    });
  },
});

export const storeResult = internalMutation({
  args: {
    storageId: v.id("_storage"),
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    const { storageId, prompt } = args;
    await ctx.db.insert("images", { storageId, prompt });
  },
});
```

## Обслуживание файлов

Файлы, хранящиеся в Convex, могут предоставляться пользователям путем генерации урла, указывающего на файл.

__Генерация урлов файлов в запросах__

Простейшим способом доставки файлов является возврат урлов вместе с другими данными, которые требуются приложению, из запросов и мутаций.

Урл файла может генерироваться из ИД хранилища с помощью функции `storage.getUrl`:

```javascript
import { query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const messages = await ctx.db.query("messages").collect();
    return Promise.all(
      messages.map(async (message) => ({
        ...message,
        // Если сообщение является изображением, его `body` - это `Id<"_storage">`
        ...(message.format === "image"
          ? { url: await ctx.storage.getUrl(message.body) }
          : {}),
      })),
    );
  },
});
```

Урлы файлов могут использоваться в элементах `img` для рендеринга изображений:

```javascript
function Image({ message }: { message: { url: string } }) {
  return <img src={message.url} height="300px" width="auto" />;
}
```

__Обслуживание файлов в операциях HTTP__

Файлы могут обслуживаться прямо в операциях HTTP.

Функция `storage.get` генерирует [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob), который возвращается в ответе:

```javascript
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { Id } from "./_generated/dataModel";

const http = httpRouter();

http.route({
  path: "/getImage",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const { searchParams } = new URL(request.url);
    const storageId = searchParams.get("storageId")! as Id<"_storage">;
    const blob = await ctx.storage.get(storageId);
    if (blob === null) {
      return new Response("Image not found", {
        status: 404,
      });
    }
    return new Response(blob);
  }),
});

export default http;
```

Урл такой операции используется в элементе `img` для рендеринга изображения:

```javascript
const convexSiteUrl = import.meta.env.VITE_CONVEX_SITE_URL;

function Image({ storageId }: { storageId: string }) {
  const getImageUrl = new URL(`${convexSiteUrl}/getImage`);
  getImageUrl.searchParams.set("storageId", storageId);

  return <img src={getImageUrl.href} height="300px" width="auto" />;
}
```

## Удаление файлов

Файлы, хранящиеся в Convex, удаляются в мутациях и операциях HTTP с помощью функции `storage.delete`, принимающей ИД хранилища:

```javascript
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { mutation } from "./_generated/server";

export const deleteById = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    return await ctx.storage.delete(args.storageId);
  },
});
```

## Метаданные файлов

Каждый сохраненный файл отражается как документ в системной таблице `"_storage"`. Метаданные файла могут запрашиваться запросами и мутациями с помощью методов `db.system.get` и `db.system.query`:

```javascript
import { v } from "convex/values";
import { query } from "./_generated/server";

export const getMetadata = query({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.system.get(args.storageId);
  },
});

export const listAllFiles = query({
  handler: async (ctx) => {
    // Здесь также можно использовать `.paginate()`
    return await ctx.db.system.query("_storage").collect();
  },
});
```

Пример возвращаемого документа:

```json
{
  "_creationTime": 1700697415295.742,
  "_id": "3k7ty84apk2zy00ay4st1n5p9kh7tf8",
  "contentType": "image/jpeg",
  "sha256": "cb58f529b2ed5a1b8b6681d91126265e919ac61fff6a367b8341c0f46b06a5bd",
  "size": 125338
}
```

- `sha256` - кодированная в base16 контрольная сумма sha256 содержимого файла
- `size` - размер файла в байтах
- `contentType` - тип контента (`ContentType`) файла, если он указывался при загрузке

# Искусственный интеллект и поиск

Convex предоставляет простые апи для создания продуктов, в которых используются возможности ИИ и поиска.

Векторный поиск (vector search) позволяет искать документы на основе семантического значения. Он использует векторные вложения (vector embeddings) для вычисления похожести и извлечения документов, подходящих под запрос. Векторный поиск является важной частью техник, используемых при разработке ИИ, таких как [RAG](https://habr.com/ru/articles/779526/).

Полнотекстовый поиск (full text search) позволяет искать в документах ключевые слова и фразы. Он поддерживает как префиксное, так и неточное (fuzzy) совпадения. Полнотекстовый поиск, как и запросы, является реактивным и поэтому всегда актуальным.

Операции Convex позволяют обращаться к апи ИИ, записывать данные в БД и управлять UI.

## Векторный поиск

Векторный поиск позволяет искать документы, похожие на переданный вектор. Как правило, векторами будут вложения (embeddings) - числовые представления текста, изображений или аудио.

Вложения и векторный поиск позволяют предоставлять полезный контекст для больших языковых моделей (large language models, LLM) для приложений с поддержкой ИИ, рекомендательных систем и т.п.

Векторный поиск всегда является согласованным и актуальным. Мы создаем вектор и сразу используем его в векторном поиске. Однако, в отличие от полнотекстового поиска, векторный поиск доступен только в операциях.

- [Пример](https://github.com/get-convex/convex-demos/tree/main/vector-search)

Для использования вектора необходимо сделать следующее:

1. Определить векторный индекс.
2. Запустить векторный поиск в операции.

__Определение векторного индекса__

Как и индексы БД, векторные индексы - это структуры данных, предназначенные для эффективного поиска. Векторные индексы определяются как часть схемы.

Для добавления векторного индекса в таблицу используется метод `vectorIndex`. Каждый индекс имеет уникальное название и определение, содержащее:

- `vectorField: string` - название поля, индексируемого для векторного поиска
- `dimensions: number` - фиксированный размер индекса векторов. При использовании вложений, этот размер должен совпадать с их размером (например, `1536` для OpenAI)
- `filterFields?: string[]` - массив полей, индексируемых для быстрой фильтрации векторного индекса

Например, если мы хотим создать индекс для поиска еды похожей кухни, наше определение таблицы может выглядеть так:

```javascript
foods: defineTable({
  description: v.string(),
  cuisine: v.string(),
  embedding: v.array(v.float64()),
}).vectorIndex("by_embedding", {
  vectorField: "embedding",
  dimensions: 1536,
  filterFields: ["cuisine"],
}),
```

Векторные и фильтруемые поля вложенных документов могут определяться с помощью точки - `properties.name`.

__Запуск векторного поиска__

В отличие от запросов или полнотекстового поиска, векторный поиск может выполняться только в операциях.

Это обычно включает в себя 3 этапа:

1. Генерация вектора для переданных данных (например, с помощью OpenAI).
2. Использование метода `ctx.vectorSearch` для получения ИД похожих документов.
3. Загрузка документов.

Пример первых двух этапов для поиска похожей французской еды на основе описания:

```javascript
//  convex/foods.ts
import { v } from "convex/values";
import { action } from "./_generated/server";

export const similarFoods = action({
  args: {
    descriptionQuery: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Генерируем вложение с помощью стороннего апи
    const embedding = await embed(args.descriptionQuery);
    // 2. Ищем похожую еду
    const results = await ctx.vectorSearch("foods", "by_embedding", {
      vector: embedding,
      limit: 16,
      filter: (q) => q.eq("cuisine", "French"),
    });
    // ...
  },
});
```

`vectorSearch()` принимает название таблицы, название индекса и объект [VectorSearchQuery](https://docs.convex.dev/api/interfaces/server.VectorSearchQuery), описывающий поиск. Этот объект содержит следующие поля:

- `vector: number[]` - массив числе (например, вложений) для использования в поиске
- `limit?: number` - количество возвращаемых результатов (от 1 до 256)
- `filter?: Function` - выражение, ограничивающее набор результатов на основе `filterFields` в `vectorIndex()` в схеме

`vectorSearch()` возвращает массив объектов с двумя полями:

- `_id` - ИД документа
- `_score` - индикатор похожести результата (от -1 до 1)

Пример загрузки документов:

```javascript
// convex/foods.ts
export const fetchResults = internalQuery({
  args: { ids: v.array(v.id("foods")) },
  handler: async (ctx, args) => {
    const results = [];
    for (const id of args.ids) {
      const doc = await ctx.db.get(id);
      if (doc === null) {
        continue;
      }
      results.push(doc);
    }
    return results;
  },
});

export const similarFoods = action({
  args: {
    descriptionQuery: v.string(),
  },
  handler: async (ctx, args) => {
    const embedding = await embed(args.descriptionQuery);
    const results = await ctx.vectorSearch("foods", "by_embedding", {
      vector: embedding,
      limit: 16,
      filter: (q) => q.eq("cuisine", "French"),
    });
    // 3. Получаем документы
    const foods: Array<Doc<"foods">> = await ctx.runQuery(
      internal.foods.fetchResults,
      { ids: results.map((result) => result._id) },
    );
    return foods;
  },
});
```

__Фильтрация__

Фильтр французской еды:

```javascript
filter: (q) => q.eq("cuisine", "French"),
```

Фильтр французских ИЛИ индонезийских блюд:

```javascript
filter: (q) =>
  q.or(q.eq("cuisine", "French"), q.eq("cuisine", "Indonesian")),
```

Фильтр французских блюд, основным ингредиентом которых является масло:

```javascript
filter: (q) =>
  q.or(q.eq("cuisine", "French"), q.eq("mainIngredient", "butter")),
```

В данном случае `cuisine` и `mainIngredient` должны быть включены в `filterFields` в `vectorIndex()`.

__Сортировка__

Результаты всегда сортируются по похожести.

Документы с одинаковым `_score` сортируются по ИД.

__Продвинутые паттерны__

_Использование отдельной таблицы для хранения векторов_

Существует 2 варианты для хранения векторного индекса:

1. Хранение векторов в той же таблице, что и другие метаданные.
2. Хранение векторов в отдельной таблице со ссылками.

Мы уже рассмотрели первый вариант. Он проще и хорошо работает при чтении небольшого количества документов. Второй подход является более сложным, но более производительным при работе с большим количеством документов.

Таблица для фильмов и векторный индекс, поддерживающий поиск похожих фильмов, фильтруемых по жанру, могут выглядеть так:

```javascript
movieEmbeddings: defineTable({
  embedding: v.array(v.float64()),
  genre: v.string(),
}).vectorIndex("by_embedding", {
  vectorField: "embedding",
  dimensions: 1536,
  filterFields: ["genre"],
}),
movies: defineTable({
  title: v.string(),
  genre: v.string(),
  description: v.string(),
  votes: v.number(),
  embeddingId: v.optional(v.id("movieEmbeddings")),
}).index("by_embedding", ["embeddingId"]),
```

Генерация вложений и запуск векторного поиска аналогичны использованию одной таблицы. Загрузка документов отличается:

```javascript
export const fetchMovies = query({
  args: {
    ids: v.array(v.id("movieEmbeddings")),
  },
  handler: async (ctx, args) => {
    const results = [];
    for (const id of args.ids) {
      const doc = await ctx.db
        .query("movies")
        .withIndex("by_embedding", (q) => q.eq("embeddingId", id))
        .unique();
      if (doc === null) {
        continue;
      }
      results.push(doc);
    }
    return results;
  },
});
```

Получение результатов векторного поиска включает операцию для поиска и запрос или мутацию для загрузки данных.

Данные, возвращаемые операцией, не являются реактивными. Решением может быть возврат результатов векторного поиска из операции и загрузка реактивных данных с помощью запроса. В этом случае результаты поиска не будут обновляться автоматически, а данные каждого результата - будут.

__Лимиты__

Векторные индексы должны содержать:

- ровно 1 поле для векторного поиска
  - оно должно иметь тип `v.array(v.float64)` (или должно быть объединением с таким вариантом)
- ровно 1 поле `dimension` со значением между 2 и 4096
- до 16 фильтруемых полей

## Полнотекстовый поиск

Полнотекстовый поиск позволяет искать документы, которые примерно совпадают с поисковым запросом.

В отличие от обычных запросов, поисковые запросы сканируют строковые поля для поиска ключевых слов. Это может быть полезным для реализации поискового функционала приложения, например, поиска сообщений по определенным словам.

Поисковые запросы являются реактивными, согласованными, транзакционными и поддерживают пагинацию. Их результаты даже обновляются при создании новых документов с помощью мутаций.

- [Пример](https://github.com/get-convex/convex-demos/tree/main/search)

Для использования полнотекстового поиска нужно сделать следующее:

1. Определить поисковый индекс.
2. Запустить поисковый запрос.

_Обратите внимание_, что полнотекстовый поиск в настоящее время является экспериментальной возможностью. Это означает, что соответствующий код в будущем может претерпеть некоторые изменения.

Также _обратите внимание_, что пока поддерживается только английский язык. В будущем будут поддерживаться и другие языки.

__Определение поискового индекса__

Как и обычные индексы, поисковые индексы - это структуры данных, предназначенные для эффективного поиска документов. Они определяются как часть схемы.

Каждое определение индекса состоит из:

- `name: string` - название, которое должно быть уникальным в рамках таблицы
- `searchField: string` - поле, индексируемое для полнотекстового поиска
- `filterFields: string[]` - дополнительные поля для фильтрации

Для добавления поискового индекса в таблицу используется метод `searchIndex`. Например, индекс для поиска сообщений в канале, содержащих ключевое слово, может выглядеть так:

```javascript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  messages: defineTable({
    body: v.string(),
    channel: v.string(),
  }).searchIndex("search_body", {
    searchField: "body",
    filterFields: ["channel"],
  }),
});
```

Поля поиска и фильтрации во вложенных документах могут определяться с помощью точки - `properties.name`.

__Запуск поискового запроса__

Запрос 10 сообщений в канале `#general`, лучше всего совпадающих с `hello hi` может выглядеть так:

```javascript
const messages = await ctx.db
  .query("messages")
  .withSearchIndex("search_body", (q) =>
    q.search("body", "hello hi").eq("channel", "#general"),
  )
  .take(10);
```

Метод `withSearchIndex` определяет, какой поисковый индекс использовать для выборки документов. Первый аргумент - это название индекса, второй - выражение поискового фильтра (search filter expression). Выражение поискового фильтра - это описание того, какие документы Convex должен сканировать при выполнении запроса.

Выражение поискового фильтра - это всегда цепочка из:

- одного выражения поиска (search expression) для выбора поискового индекса
- 0 или более выражений равенства (equality expressions) для фильтрации документов

_Выражения поиска_

Выражения поиска выбирают поисковые индексы, фильтруют и ранжируют документы по их соответствию поисковому запросу. Convex разбивает выражение поиска на отдельные слова (которые называются терминами (terms)) и проверяет документы на совпадение им.

В приведенном примере выражение `"hello hi"` будет разбито на `"hi"` и `"hello"`.

_Выражения равенства_

В отличие от выражений поиска, выражения равенства требуют точного совпадения с указанным полем. В приведенном примере `eq("channel", "#general")` будет выбирать только документы, содержащие значение `"#general"` в поле `channel`.

Выражения равенства поддерживают поля любых типов (не только текстовые).

Для выбора документов с отсутствующим полем следует использовать `q.eq("fieldName", undefined)`.

Результаты поисковых запросов также можно фильтровать с помощью метода `filter`. Пример запроса сообщений, содержащих `"hi"`, за последние 10 мин:

```javascript
const messages = await ctx.db
  .query("messages")
  .withSearchIndex("search_body", (q) => q.search("body", "hi"))
  .filter((q) => q.gt(q.field("_creationTime", Date.now() - 10 * 60000)))
  .take(10);
```

_Извлечение результатов и пагинация_

Результаты поисковых запросов, как и результаты обычных запросов, могут извлекаться с помощью методов `collect()`, `take(n)`, `first()` и `unique()`.

Кроме того, результаты могут пагинироваться с помощью `paginate(paginationOpts)`.

Обратите внимание, что `collect()` выбросит исключение при попытке извлечь больше 1024 документов. Лучше использовать `take(n)` или пагинировать результаты.

__Сортировка__

Результаты поисковых запросов всегда возвращаются в порядке соответствия поисковой строке.

__Поиск__

_Неточный и префиксный поиск_

Полнотекстовый поиск Convex спроектирован для поддержки поиска по мере ввода. Поэтому к искомым терминам применяются правила неточного и префиксного совпадения. Это означает, что документы, соответствующие поисковому запросу, могут неточно совпадать с искомыми терминами.

В зависимости от длины термина, допускается фиксированное число опечаток в совпадениях. Опечатки определяются с помощью [расстояния Левенштейна](https://ru.wikipedia.org/wiki/%D0%A0%D0%B0%D1%81%D1%81%D1%82%D0%BE%D1%8F%D0%BD%D0%B8%D0%B5_%D0%9B%D0%B5%D0%B2%D0%B5%D0%BD%D1%88%D1%82%D0%B5%D0%B9%D0%BD%D0%B0). Правила терпимости к опечаткам следующие:

- в терминах, длиной `<=` 4, не допускается опечаток
- в терминах, длиной `<` 5 `<=` 8, допускается 1 опечатка
- в терминах, длиной `>` 8, допускается 2 опечатки

Например, выражение `search("body", "hello something")` будет совпадать со следующими документами:

- `"hillo"`
- `"somethan"`
- `"hallo somethan"`
- `"I left something in my car"`

К документам также применятся префиксный поиск. Например, выражение `search("body", "r")` будет совпадать со следующими документами:

- `"rabbit"`
- `"Rakeeb searches"`
- `"send request"`

__Лимиты__

Поисковый индекс должен содержать:

- ровно 1 поисковое поле
- до 16 фильтруемых полей

Поисковый индекс может содержать:

- до 16 терминов (слов) в выражении поиска
- до 8 фильтров

# Пример использования Convex

В качестве примера использования Convex мы рассмотрим часть исходного кода клона Slack, который разрабатывается в [этом замечательном туториале](https://www.youtube.com/watch?v=lXITA5MZIiI).

То, что у меня получилось (мой код немного отличается от кода туториала), можно найти [здесь](https://github.com/harryheman/slack-clone).

Весь код Convex находится в директории `convex` в корне проекта. Она имеет следующую структуру:

```
auth.config.ts
auth.ts
channels.ts
conversations.ts
http.ts
members.ts
messages.ts
reactions.ts
schema.ts
tsconfig.json
upload.ts
users.ts
workspaces.ts
```

В проекте для аутентификации/авторизации используется Convex Auth. Соответствующие настройки определяются в файлах `auth.ts`, `auth.config.ts` и `http.ts`. Обратите внимание на кастомизацию провайдера `Password` в `auth.ts`:

```javascript
import { Password } from '@convex-dev/auth/providers/Password'
import { DataModel } from './_generated/dataModel'

const CustomPassword = Password<DataModel>({
  profile(params) {
    return {
      email: params.email as string,
      name: params.name as string,
    }
  },
})
```

Там же мы видим использование сторонних провайдеров аутентификации GitHub и Google:

```javascript
import { convexAuth } from '@convex-dev/auth/server'
import GitHub from '@auth/core/providers/github'
import Google from '@auth/core/providers/google'

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [CustomPassword, GitHub, Google],
})
```

Компонент для регистрации пользователя выглядит следующим образом:

```javascript
// features/auth/components/sign-up-card.tsx
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { FaGithub } from 'react-icons/fa'
import { FcGoogle } from 'react-icons/fc'
import { SignInFlow } from '../types'
import { useState } from 'react'
import { TriangleAlert } from 'lucide-react'
import { useAuthActions } from '@convex-dev/auth/react'

type SignUpCardProps = {
  setState: (state: SignInFlow) => void
}

export const SignUpCard = ({ setState }: SignUpCardProps) => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  // Метод аутентификации/авторизации
  const { signIn } = useAuthActions()

  // Метод регистрации с помощью имени пользователя, email и пароля
  const onPasswordSignUp = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setPending(true)
    // Регистрируем пользователя.
    // Обратите внимание на свойство `flow`
    signIn('password', { name, email, password, flow: 'signUp' })
      .catch((e) => {
        console.error(e)
        setError('Something went wrong')
      })
      .finally(() => setPending(false))
  }

  // Метод регистрации с помощью сторонних провайдеров
  const onProviderSignUp = (value: 'github' | 'google') => {
    setPending(true)
    signIn(value).finally(() => setPending(false))
  }

  return (
    <Card className='w-full h-full p-8'>
      <CardHeader className='px-0 pt-0'>
        <CardTitle>Sign up to continue</CardTitle>
        <CardDescription>
          Use your email or another service to continue
        </CardDescription>
      </CardHeader>
      {!!error && (
        <div className='bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive mb-6'>
          <TriangleAlert className='size-4' />
          <p>{error}</p>
        </div>
      )}
      <CardContent className='space-y-5 px-0 pb-0'>
        <form className='space-y-2.5' onSubmit={onPasswordSignUp}>
          <Input
            disabled={pending}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder='Full name'
            required
          />
          <Input
            disabled={pending}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder='Email'
            type='email'
            required
          />
          <Input
            disabled={pending}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder='Password'
            type='password'
            required
          />
          <Input
            disabled={pending}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder='Confirm password'
            type='password'
            required
          />
          <Button type='submit' className='w-full' size='lg' disabled={pending}>
            Continue
          </Button>
        </form>
        <Separator />
        <div className='flex flex-col gap-y-2.5'>
          <Button
            disabled={pending}
            onClick={() => onProviderSignUp('google')}
            variant='outline'
            size='lg'
            className='w-full relative'
          >
            <FcGoogle className='size-5 absolute top-2.5 left-2.5' />
            Continue with Google
          </Button>
          <Button
            disabled={pending}
            onClick={() => onProviderSignUp('github')}
            variant='outline'
            size='lg'
            className='w-full relative'
          >
            <FaGithub className='size-5 absolute top-2.5 left-2.5' />
            Continue with GitHub
          </Button>
        </div>
        <p className='text-xs text-muted-foreground'>
          Already have an account?{' '}
          <span
            className='text-sky-700 hover:underline cursor-pointer'
            onClick={() => setState('signIn')}
          >
            Sign in
          </span>
        </p>
      </CardContent>
    </Card>
  )
}
```

Файл `schema.ts` содержит модель БД - определения таблиц:

```javascript
import { authTables } from '@convex-dev/auth/server'
import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  // Таблицы аутентификации
  ...authTables,
  // Рабочие пространства
  workspaces: defineTable({
    name: v.string(),
    userId: v.id('users'),
    joinCode: v.string(),
  }),
  // Участники рабочего пространства
  members: defineTable({
    userId: v.id('users'),
    workspaceId: v.id('workspaces'),
    role: v.union(v.literal('admin'), v.literal('member')),
  })
    .index('by_user_id', ['userId'])
    .index('by_workspace_id', ['workspaceId'])
    .index('by_workspace_id_user_id', ['workspaceId', 'userId']),
  // Каналы пространства
  channels: defineTable({
    name: v.string(),
    workspaceId: v.id('workspaces'),
  }).index('by_workspace_id', ['workspaceId']),
  // Беседы один на один между участниками пространства
  conversations: defineTable({
    workspaceId: v.id('workspaces'),
    memberOneId: v.id('members'),
    memberTwoId: v.id('members'),
  }).index('by_workspace_id', ['workspaceId']),
  // Сообщения пространства и канала, потока (комментарии к сообщению) или беседы
  messages: defineTable({
    body: v.string(),
    image: v.optional(v.id('_storage')),
    memberId: v.id('members'),
    workspaceId: v.id('workspaces'),
    channelId: v.optional(v.id('channels')),
    parentMessageId: v.optional(v.id('messages')),
    conversationId: v.optional(v.id('conversations')),
    updatedAt: v.optional(v.number()),
  })
    // Обратите внимание на количество индексов,
    // обеспечивающих высокую производительность таблицы
    .index('by_workspace_id', ['workspaceId'])
    .index('by_member_id', ['memberId'])
    .index('by_channel_id', ['channelId'])
    .index('by_conversation_id', ['conversationId'])
    .index('by_parent_message_id', ['parentMessageId'])
    .index('by_channel_id_parent_message_id_conversation_id', [
      'channelId',
      'parentMessageId',
      'conversationId',
    ]),
  // Реакции на сообщение
  reactions: defineTable({
    workspaceId: v.id('workspaces'),
    messageId: v.id('messages'),
    memberId: v.id('members'),
    value: v.string(),
  })
    .index('by_workspace_id', ['workspaceId'])
    .index('by_message_id', ['messageId'])
    .index('by_member_id', ['memberId']),
})
```

Пользователи могут отправлять текстовые сообщения и изображения. Для загрузки изображений используется генерация урлов для загрузки. Соответствующий метод определяется в файле `upload.ts`:

```javascript
import { mutation } from './_generated/server'

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl()
})
```

Методы для работы с таблицами определяются в файлах `channels.ts`, `conversations.ts`, `members.ts`, `messages.ts`, `reactions.ts`, `users.ts` и `workspaces.ts`. Рассмотрим методы для работы с каналами (таблица `"channels"`):

```javascript
import { getAuthUserId } from '@convex-dev/auth/server'
import { mutation, query } from './_generated/server'
import { ConvexError, v } from 'convex/values'

// Возвращает все каналы рабочего пространства
export const get = query({
  args: {
    // ИД пространства
    workspaceId: v.id('workspaces'),
  },
  handler: async (ctx, args) => {
    // Проверяем авторизацию пользователя
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      return []
    }

    // Проверяем, что пользователь является участником данного пространства
    const member = await ctx.db
      .query('members')
      .withIndex('by_workspace_id_user_id', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('userId', userId),
      )
      .unique()
    if (!member) {
      return []
    }

    // Извлекаем каналы и возвращаем их клиенту
    const channels = await ctx.db
      .query('channels')
      .withIndex('by_workspace_id', (q) =>
        q.eq('workspaceId', args.workspaceId),
      )
      .collect()

    return channels
  },
})

// Возвращает канал по его ИД
export const getById = query({
  args: {
    // ИД канала
    id: v.id('channels'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      return null
    }

    // Сначала извлекаем канал, потому что
    // нам нужен `workspaceId` для проверки членства пользователя
    const channel = await ctx.db.get(args.id)
    if (!channel) {
      return null
    }

    const member = await ctx.db
      .query('members')
      .withIndex('by_workspace_id_user_id', (q) =>
        q.eq('workspaceId', channel.workspaceId).eq('userId', userId),
      )
      .unique()
    if (!member) {
      return null
    }

    return channel
  },
})

// Создает канал с указанным названием
export const create = mutation({
  args: {
    // Название канала
    name: v.string(),
    // ИД пространства
    workspaceId: v.id('workspaces'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      // Мутации выбрасывают исключения
      throw new ConvexError('Unauthorized')
    }

    const member = await ctx.db
      .query('members')
      .withIndex('by_workspace_id_user_id', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('userId', userId),
      )
      .unique()
    // Каналы могут создаваться только администраторами пространства
    if (!member || member.role !== 'admin') {
      throw new ConvexError('Unauthorized')
    }

    // Пробелы в названии канала заменяются на дефисы
    const name = args.name.replace(/\s+/g, '-').toLowerCase()

    // Создаем канал и возвращаем его ИД клиенту
    const channelId = await ctx.db.insert('channels', {
      name,
      workspaceId: args.workspaceId,
    })

    return channelId
  },
})

// Обновляем название канала по его ИД
export const update = mutation({
  args: {
    // ИД канала
    id: v.id('channels'),
    // Новое название канала
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new ConvexError('Unauthorized')
    }

    const channel = await ctx.db.get(args.id)
    if (!channel) {
      throw new ConvexError('Channel not found')
    }

    const member = await ctx.db
      .query('members')
      .withIndex('by_workspace_id_user_id', (q) =>
        q.eq('workspaceId', channel.workspaceId).eq('userId', userId),
      )
      .unique()
    if (!member || member.role !== 'admin') {
      throw new ConvexError('Unauthorized')
    }

    const name = args.name.replace(/\s+/g, '-').toLowerCase()

    // Обновляем название канала и возвращаем его ИД клиенту
    await ctx.db.patch(args.id, { name })

    return args.id
  },
})

// Удаляет канал по его ИД
export const remove = mutation({
  args: {
    // ИД канала
    id: v.id('channels'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new ConvexError('Unauthorized')
    }

    const channel = await ctx.db.get(args.id)
    if (!channel) {
      throw new ConvexError('Channel not found')
    }

    const member = await ctx.db
      .query('members')
      .withIndex('by_workspace_id_user_id', (q) =>
        q.eq('workspaceId', channel.workspaceId).eq('userId', userId),
      )
      .unique()
    // Удалять каналы могут только админы
    if (!member || member.role !== 'admin') {
      throw new ConvexError('Unauthorized')
    }

    // Удаление канала влечет за собой удаление всех его сообщений
    const messages = await ctx.db
      .query('messages')
      .withIndex('by_channel_id', (q) => q.eq('channelId', args.id))
      .collect()

    // Удаляем сообщения канала
    for (const message of messages) {
      await ctx.db.delete(message._id)
    }

    // Удаляем канал и возвращаем его ИД клиенту
    await ctx.db.delete(args.id)

    return args.id
  },
})
```

Для каждого метода (функции Convex) реализован соответствующий клиентский хук React. Рассмотрим несколько хуков для работы с сообщениями (`features/messages/api`).

Хук для получения сообщения по ИД:

```javascript
// use-get-message.ts
import { useQuery } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { Id } from '../../../../convex/_generated/dataModel'

export const useGetMessage = (id: Id<'messages'>) => {
  const data = useQuery(api.messages.getById, { id })
  const isLoading = data === undefined
  return { data, isLoading }
}
```

Хук для получения пагинированных сообщений:

```javascript
// use-get-messages.ts
import { usePaginatedQuery } from 'convex/react'
import { FunctionReturnType } from 'convex/server'
import { api } from '../../../../convex/_generated/api'
import { Id } from '../../../../convex/_generated/dataModel'

// Размер пакета - каждый вызов хука возвращает 20 следующих сообщений
const BATCH_SIZE = 20

type Props = {
  channelId?: Id<'channels'>
  conversationId?: Id<'conversations'>
  parentMessageId?: Id<'messages'>
}

export type GetMessagesReturnT = FunctionReturnType<
  typeof api.messages.get
>['page']

export const useGetMessages = ({
  channelId,
  conversationId,
  parentMessageId,
}: Props) => {
  const { results, status, loadMore } = usePaginatedQuery(
    api.messages.get,
    { channelId, conversationId, parentMessageId },
    { initialNumItems: BATCH_SIZE },
  )

  return { results, status, loadMore: () => loadMore(BATCH_SIZE) }
}
```

Хук для создания сообщения:

```javascript
// use-create-message.ts
import { useMutation } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { useCallback, useState } from 'react'
import { Id } from '../../../../convex/_generated/dataModel'

type RequestT = {
  // Текст сообщения
  body: string
  workspaceId: Id<'workspaces'>
  // ИД изображения
  image?: Id<'_storage'>
  channelId?: Id<'channels'>
  parentMessageId?: Id<'messages'>
  conversationId?: Id<'conversations'>
}
type ResponseT = Id<'messages'> | null

type Options = {
  onSuccess?: (data: ResponseT) => void
  onError?: (e: Error) => void
  onSettled?: () => void
  throwError?: boolean
}

export const useCreateMessage = () => {
  const [data, setData] = useState<ResponseT>(null)
  const [error, setError] = useState<Error | null>(null)
  const [status, setStatus] = useState<
    'success' | 'error' | 'settled' | 'pending' | null
  >(null)

  const isSuccess = status === 'success'
  const isError = status === 'error'
  const isSettled = status === 'settled'
  const isPending = status === 'pending'

  const mutation = useMutation(api.messages.create)

  const mutate = useCallback(
    async (values: RequestT, options?: Options) => {
      setData(null)
      setError(null)
      setStatus('pending')
      try {
        const response = await mutation(values)
        setData(response)
        setStatus('success')
        options?.onSuccess?.(response)
        return response
      } catch (e) {
        setError(e as Error)
        setStatus('error')
        options?.onError?.(e as Error)
        if (options?.throwError) {
          throw e
        }
      } finally {
        setStatus('settled')
        options?.onSettled?.()
      }
    },
    [mutation],
  )

  return { mutate, data, error, isPending, isSuccess, isError, isSettled }
}
```

В завершение посмотрим, как эти хуки используются в соответствующих компонентах.

Пример использования `useGetMessages()` на странице канала:

```javascript
// app/workspace/[workspaceId]/channel/[channelId]/page.tsx
'use client'

import { useGetChannel } from '@/features/channels/api/use-get-channel'
import { useChannelId } from '@/hooks/use-channel-id'
import { Loader, TriangleAlert } from 'lucide-react'
import { Header } from './header'
import { ChatInput } from './chat-input'
import { useGetMessages } from '@/features/messages/api/use-get-messages'
import { MessageList } from '@/components/message-list'

export default function ChannelPage() {
  const channelId = useChannelId()

  // Извлекаем сообщения канала, статус и метод для загрузки дополнительных сообщений
  const { results, status, loadMore } = useGetMessages({ channelId })
  const { data: channel, isLoading: channelLoading } = useGetChannel(channelId)

  // Если выполняется загрузка канала или первая загрузка сообщений
  if (channelLoading || status === 'LoadingFirstPage') {
    return (
      <div className='h-full flex-1 flex items-center justify-center'>
        <Loader className='size-5 animate-spin text-muted-foreground' />
      </div>
    )
  }

  // Если канал отсутствует (это возможно в случае удаления канала админом)
  if (!channel) {
    return (
      <div className='h-full flex-1 flex items-center justify-center flex-col gap-2'>
        <TriangleAlert className='size-5 text-muted-foreground' />
        <span className='text-muted-foreground text-sm'>Channel not found</span>
      </div>
    )
  }

  return (
    <div className='flex flex-col h-full'>
      <Header title={channel.name} />
      <MessageList
        channelName={channel.name}
        channelCreationTime={channel._creationTime}
        data={results}
        loadMore={loadMore}
        isLoadingMore={status === 'LoadingMore'}
        canLoadMore={status === 'CanLoadMore'}
      />
      <ChatInput placeholder={`Message # ${channel.name}`} />
    </div>
  )
}
```

Компоненты `MessageList` и `Message` довольно объемные и сложные, поэтому мы не будем здесь их рассматривать (пусть это будет вашим ДЗ ;)).

Пример использования `useCreateMessage()` и `useGenerateUploadUrl()` в компоненте для отправки сообщений:

```javascript
import { EditorValue } from '@/components/editor'
import { useCreateMessage } from '@/features/messages/api/use-create-message'
import { useGenerateUploadUrl } from '@/features/upload/api/use-generate-upload-url'
import { useChannelId } from '@/hooks/use-channel-id'
import { useWorkspaceId } from '@/hooks/use-workspace-id'
import dynamic from 'next/dynamic'
import Quill from 'quill'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { Id } from '../../../../../../convex/_generated/dataModel'

const Editor = dynamic(() => import('@/components/editor'), {
  ssr: false,
})

type Props = {
  placeholder: string
}

type CreateMessageValues = {
  body: string
  channelId: Id<'channels'>
  workspaceId: Id<'workspaces'>
  image?: Id<'_storage'>
}

export const ChatInput = ({ placeholder }: Props) => {
  const [editorKey, setEditorKey] = useState(0)
  const [isPending, setIsPending] = useState(false)

  const editorRef = useRef<Quill | null>(null)

  const workspaceId = useWorkspaceId()
  const channelId = useChannelId()

  // Метод для генерации урла для загрузки файла
  const { mutate: generateUploadUrl } = useGenerateUploadUrl()
  // Метод создания сообщения
  const { mutate: createMessage } = useCreateMessage()

  // Обработчик отправки формы с сообщением
  const handleSubmit = async ({ body, image }: EditorValue) => {
    setIsPending(true)
    editorRef.current?.enable(false)

    try {
      // Данные для сохранения
      const values: CreateMessageValues = {
        body,
        channelId,
        workspaceId,
        image: undefined,
      }

      // Если сообщение содержит изображение
      if (image) {
        // Генерируем урл для его загрузки
        const url = await generateUploadUrl(undefined, { throwError: true })
        if (!url) {
          throw new Error('Failed to generate upload URL')
        }
        // Загружаем изображение
        const result = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': image.type,
          },
          body: image,
        })
        if (!result.ok) {
          throw new Error('Failed to upload image')
        }
        // Извлекаем ИД хранилища
        const { storageId } = await result.json()
        if (storageId) {
          // Добавляем его в данные для сохранения
          values.image = storageId
        }
      }

      // Создаем сообщение
      await createMessage(values, {
        throwError: true,
      })

      setEditorKey((k) => k + 1)
    } catch (e) {
      console.error(e)
      toast.error('Failed to send message')
    } finally {
      setIsPending(false)
      editorRef.current?.enable(true)
    }
  }

  return (
    <div className='w-full px-5'>
      <Editor
        key={editorKey}
        placeholder={placeholder}
        onSubmit={handleSubmit}
        disabled={isPending}
        innerRef={editorRef}
      />
    </div>
  )
}
```

Опять же с компонентом `Editor` я предлагаю вам разобраться самостоятельно.
