---
sidebar_position: 2.4
title: Руководство по tRPC
description: Руководство по tRPC
keywords: [javascript, js, typescript, ts, trpc, react.js, reactjs, react, react-query, next.js, nextjs]
tags: [javascript, js, typescript, ts, trpc, react.js, reactjs, react, react-query, next.js, nextjs]
---

# tRPC

> [tRPC](https://trpc.io/) позволяет разрабатывать полностью безопасные с точки зрения типов API для клиент-серверных приложений (предпочтительной является архитектура монорепозитория). Это посредник между сервером и клиентом, позволяющий им использовать один маршрутизатор (роутер) для обработки запросов HTTP. Использование одного роутера, в свою очередь, обуславливает возможность автоматического вывода типов (type inference) входящих и исходящих данных (input/output), что особенно актуально для клиента и позволяет избежать дублирования типов или использования общих (shared) типов.

tRPC состоит из нескольких отдельных пакетов, основные из которых рассматриваются ниже.

## [@trpc/server](https://www.npmjs.com/package/@trpc/server)

```bash
npm i @trpc/server
# или
yarn add @trpc/server
```

### Определение роутеров / routers

Разработка интерфейса (API), основанного на tRPC, начинается с определения роутера.

__Инициализация tPRC__

_Важно_: tRPC должен инициализироваться только один раз.

```ts
import { initTRPC } from '@trpc/server';

const t = initTRPC.create();
 
export const router = t.router;
export const middleware = t.middleware;
export const publicProcedure = t.procedure;
```

__Определение роутера__

Определяем конечную точку интерфейса:

```ts
import * as trpc from '@trpc/server';
import { publicProcedure, router } from './trpc';
 
const appRouter = router({
  greeting: publicProcedure.query(() => 'hello tRPC v10!'),
});
 
// Экспортируем только тип маршрутизатора!
// Это предотвращает импорт серверного кода на клиенте
export type AppRouter = typeof appRouter;
```

__Продвинутое использование__

При инициализации маршрутизатора можно делать следующее:

- настраивать контексты запросов
- добавлять метаданные в процедуры
- форматировать и обрабатывать ошибки
- преобразовывать данные
- кастомизировать настройку выполнения кода (runtime)

Для кастомизации объекта `t` при инициализации может использоваться цепочка методов, например:

```ts
import { Context, Meta } from '@trpc/server';

const t = initTRPC.context<Context>().meta<Meta>().create({
  // ...
});
```

__Настройка выполнения кода__

```ts
export interface RuntimeConfig<TTypes extends RootConfigTypes> {
  /**
   * Преобразователь данных
   * @link https://trpc.io/docs/data-transformers
   */
  transformer: TTypes['transformer'];

  /**
   * Редактор ошибок
   * @link https://trpc.io/docs/error-formatting
   */
  errorFormatter: ErrorFormatter<TTypes['ctx'], any>;

  /**
   * Позволяет запускать `@trpc/server` в несерверных окружениях,
   * например, в тестах
   * @default false
   */
  allowOutsideOfServer: boolean;

  /**
   * Индикатор выполнения кода на сервере
   * @default typeof window === 'undefined' || 'Deno' in window || process.env.NODE_ENV === 'test'
   */
  isServer: boolean;

  /**
   * Индикатор выполнения кода в режиме разработки
   * Используется для определения необходимости возврата трассировки стека
   * @default process.env.NODE_ENV !== 'production'
   */
  isDev: boolean;
}
```

### Определение процедур / procedures

Процедура - это очень гибкий примитив для создания серверных функций. Для создания процедуры используется паттерн "Строитель" (builder), что позволяет определять переиспользуемые (reusable) процедуры для разных частей сервера.

__Пример без валидации входных данных__

```ts
import { router, publicProcedure } from './trpc';
import { z } from 'zod';
 
const appRouter = router({
  // Создаем открытую процедуру для пути `hello`
  hello: publicProcedure.query(() => {
    return {
      greeting: 'всем привет',
    };
  }),
});
```

__Валидация входных данных__

tRPC поддерживает yup/superstruct/zod/myzod/кастомные валидаторы. Пример использования [Zod](https://github.com/colinhacks/zod):

```ts
import { publicProcedure, router } from './trpc';
import { z } from 'zod';
 
export const appRouter = router({
  hello: publicProcedure
    // Входные данные должны быть опциональным объектом,
    // содержащий поле `name` со строковым значением
    .input(
      z
        .object({
          name: z.string(),
        })
        .optional(),
    )
    .query(({ input }) => {
      return {
        greeting: `привет, ${input?.name ?? 'народ'}`,
      };
    }),
});
 
export type AppRouter = typeof appRouter;
```

__Несколько валидаторов входных данных__

Валидаторы могут "выстраиваться" в цепочку:

```ts
// @filename: roomProcedure.ts
import { publicProcedure } from './trpc';
import { z } from 'zod';
 
/**
 * Создаем переиспользуемую открытую процедуру для комнаты чата
 */
export const roomProcedure = publicProcedure.input(
  z.object({
    roomId: z.string(),
  }),
);
 
// @filename: _app.ts
import { router } from './trpc';
import { roomProcedure } from './roomProcedure';
import { z } from 'zod';

const appRouter = router({
  sendMessage: roomProcedure
    // Добавляем дополнительную валидацию входных данных для процедуры `sendMessage`
    .input(
      z.object({
        text: z.string(),
      }),
    )
    .mutation(({ input }) => {
      // ...
    }),
});
 
export type AppRouter = typeof appRouter;
```

__Несколько процедур__

Для добавления нескольких процедур достаточно определить их в виде полей объекта, передаваемого в `t.router()`:

```ts
import { initTRPC } from '@trpc/server';

export const t = initTRPC.create();

const router = t.router;
const publicProcedure = t.procedure;

export const appRouter = router({
  hi: publicProcedure.query(() => {
    return {
      text: 'всем привет',
    };
  }),
  bye: publicProcedure.query(() => {
    return {
      text: 'всем пока',
    };
  }),
});

export type AppRouter = typeof appRouter;
```

__Переиспользуемые базовые процедуры__

Пример создания набора защищенных процедур авторизации для приложения [Next.js](https://nextjs.org/):

```ts
// @filename: context.ts
import { inferAsyncReturnType } from '@trpc/server';
import * as trpcNext from '@trpc/server/adapters/next';
import { getSession } from 'next-auth/react';
 
/**
 * Создаем контекст для входящего запроса
 * @link https://trpc.io/docs/context
 */
export async function createContext(opts: trpcNext.CreateNextContextOptions) {
  const session = await getSession({ req: opts.req });
 
  return {
    session,
  };
};
 
export type Context = inferAsyncReturnType<typeof createContext>;
 
// @filename: trpc.ts
import { initTRPC, TRPCError } from '@trpc/server';
import { Context } from './context';

const t = initTRPC.context<Context>().create();
 
/**
 * Переиспользуемый посредник, проверяющий состояние аутентификации пользователя
 **/
const isAuthed = t.middleware(({ next, ctx }) => {
  if (!ctx.session?.user?.email) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
    });
  }

  return next({
    ctx: {
      // `session` имеет ненулевое значение (non-nullable)
      session: ctx.session,
    },
  });
});
 
export const middleware = t.middleware;
export const router = t.router;

/**
 * Открытая процедура
 **/
export const publicProcedure = t.procedure;
 
/**
 * Защищенная процедура
 **/
export const protectedProcedure = t.procedure.use(isAuthed);

// @filename: _app.ts
import { protectedProcedure, publicProcedure, router } from './trpc';
import { z } from 'zod';
 
export const appRouter = router({
  createPost: protectedProcedure
    .mutation(({ ctx }) => {
      const session = ctx.session;
      // ...
    }),
  whoami: publicProcedure
    .query(({ ctx }) => {
      const session = ctx.session;
      // ...
    }),
});
```

### Объединение роутеров

__Объединение дочерних роутеров__

```ts
// @filename: trpc.ts
import { initTRPC } from '@trpc/server';
const t = initTRPC.create();

export const middleware = t.middleware;
export const router = t.router;
export const publicProcedure = t.procedure;

// @filename: routers/_app.ts
import { router } from '../trpc';
import { z } from 'zod';
 
import { userRouter } from './user';
import { postRouter } from './post';
 
const appRouter = router({
  user: userRouter, // процедуры пространства (namespace) `user`
  post: postRouter, // процедуры пространства `post`
});
 
export type AppRouter = typeof appRouter;

// @filename: routers/post.ts
import { router, publicProcedure } from '../trpc';
import { z } from 'zod';

export const postRouter = router({
  create: publicProcedure
    .input(
      z.object({
        title: z.string(),
      }),
    )
    .mutation(({ input }) => {
      // ...
    }),
  list: publicProcedure.query(() => {
    // ...
    return [];
  }),
});

// @filename: routers/user.ts
import { router, publicProcedure } from '../trpc';
import { z } from 'zod';

export const userRouter = router({
  list: publicProcedure.query(() => {
    // ...
    return [];
  }),
});
```

__Объединение с помощью `t.mergeRouters()`__

Метод `t.mergeRouters` позволяет объединять роутеры в одно пространство:

```ts
// @filename: routers/_app.ts
import { router, publicProcedure, mergeRouters } from '../trpc';
import { z } from 'zod';
 
import { userRouter } from './user';
import { postRouter } from './post';
 
const appRouter = mergeRouters(userRouter, postRouter)
 
export type AppRouter = typeof appRouter;
 
// @filename: routers/post.ts
import { router, publicProcedure } from '../trpc';
import { z } from 'zod';

export const postRouter = router({
  postCreate: publicProcedure
    .input(
      z.object({
        title: z.string(),
      }),
    )
    .mutation(({ input }) => {
      // ...
    }),
  postList: publicProcedure.query(() => {
    // ...
    return [];
  }),
});

// @filename: routers/user.ts
import { router, publicProcedure } from '../trpc';
import { z } from 'zod';
export const userRouter = router({
  userList: publicProcedure.query(() => {
    // ...
    return [];
  }),
});
```

### Контекст / context

Контекст содержит данные для процедур, такие как соединение с базой данных или информация об аутентификации.

Установка контекста состоит из 2 шагов: определение типа при инициализации и создание контекста выполнения для каждого запроса.

__Определение типа контекста__

Тип контекста определяется с помощью `initTRPC.context<TContext>()` перед `.create()`. Тип `TContext` может выводиться из типа возвращаемого функцией значения или определяться явно.

```ts
import { initTRPC, type inferAsyncReturnType } from '@trpc/server';
import type { CreateNextContextOptions } from '@trpc/server/adapters/next';
import { getSession } from 'next-auth/react';
 
export const createContext = async (opts: CreateNextContextOptions) => {
  const session = await getSession({ req: opts.req });
 
  return {
    session,
  };
};
 
const t1 = initTRPC.context<typeof createContext>().create();
t1.procedure.use(({ ctx }) => {
  // ...
});

type Context = inferAsyncReturnType<typeof createContext>;
const t2 = initTRPC.context<Context>().create();
t2.procedure.use(({ ctx }) => {
  // ...
});
```

__Создание контекста__

Функция `createContext` передается обработчику запросов, который монтирует роутер приложения, через HTTP, вызов на стороне сервера (server-side call) или помощник SSG (SSG helper).

```ts
// 1. Запрос HTTP
import { createHTTPHandler } from '@trpc/server/adapters/standalone';
import { createContext } from './context';
import { appRouter } from './router';

const handler = createHTTPHandler({
  router: appRouter,
  createContext,
});
```

```ts
// 2. Вызов на стороне сервера
import { createContext } from './context';
import { appRouter } from './router';

const caller = appRouter.createCaller(await createContext());
```

```ts
// 3. Помощник SSG
import { createProxySSGHelpers } from '@trpc/react-query/ssg';
import { createContext } from './context';
import { appRouter } from './router';

const ssg = createProxySSGHelpers({
  router: appRouter,
  ctx: await createContext(),
});
```

__Пример__

```ts
// @filename: context.ts
import type { inferAsyncReturnType } from '@trpc/server';
import type { CreateNextContextOptions } from '@trpc/server/adapters/next';
import { getSession } from 'next-auth/react';
 
/**
 * Создаем контекст для входящего запроса
 * @link https://trpc.io/docs/context
 */
export async function createContext(opts: CreateNextContextOptions) {
  const session = await getSession({ req: opts.req });
 
  return {
    session,
  };
}
 
export type Context = inferAsyncReturnType<typeof createContext>;
 
// @filename: trpc.ts
import { initTRPC, TRPCError } from '@trpc/server';
import { Context } from './context';
 
const t = initTRPC.context<Context>().create();
 
const isAuthed = t.middleware(({ next, ctx }) => {
  if (!ctx.session?.user?.email) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
    });
  }
  return next({
    ctx: {
      // `session` имеет ненулевое значение
      session: ctx.session,
    },
  });
});
 
export const middleware = t.middleware;
export const router = t.router;
 
/**
 * Открытая процедура
 */
export const publicProcedure = t.procedure;
 
/**
 * Защищенная процедура
 */
export const protectedProcedure = t.procedure.use(isAuthed);
```

__Внутренний и внешний контексты__

Иногда имеет смысл разделять контекст на внутренний и внешний.

Внутренний контекст - это контекст, который не зависит от запроса, например, соединение с БД. Соответственно, внешний контекст - это контекст, который зависит от запроса. Такой контекст доступен только для процедур, обращение к которым происходит через HTTP.

```ts
import type { inferAsyncReturnType } from '@trpc/server';
import type { CreateNextContextOptions } from '@trpc/server/adapters/next';
import { type Session, getSessionFromCookie } from './auth';

/**
 * Определяем форму (shape) внутреннего контекста
 */
interface CreateInnerContextOptions extends Partial<CreateNextContextOptions> {
  session: Session | null;
}

/**
 * Внутренний контекст. Доступен во всех процедурах,
 * что может быть полезным для:
 * - тестирования: не нужно имитировать (mock) `req/res` Next.js
 * - вызова `createSSGHelpers()` tRPC, где отсутствует `req/res`
 *
 * @see https://trpc.io/docs/context#inner-and-outer-context
 */
export async function createContextInner(opts?: CreateInnerContextOptions) {
  return {
    prisma,
    session: opts.session,
  };
}

/**
 * Внешний контекст
 *
 * @see https://trpc.io/docs/context#inner-and-outer-context
 */
export async function createContext(opts: CreateNextContextOptions) {
  const session = getSessionFromCookie(opts.req);

  const contextInner = await createContextInner({ session });

  return {
    ...contextInner,
    req: opts.req,
    res: opts.res,
  };
}

export type Context = inferAsyncReturnType<typeof createContextInner>;
```

Для того, чтобы не проверять наличие `req` и `res` для каждой процедуры, можно определить такую переиспользуемую процедуру:

```ts
export const apiProcedure = publicProcedure.use((opts) => {
  if (!opts.ctx.req || !opts.ctx.res) {
    throw new Error('В вызове отсутствует `req` или `res`.');
  }

  return opts.next({
    ctx: {
      // Перезаписываем контекст истинными `req` и `res`,
      // что также перезаписывает типы, используемые в процедуре
      req: opts.ctx.req,
      res: opts.ctx.res,
    },
  });
});
```

### Обработчик запросов / API handler

tRPC - это не сервер как таковой, он "живет" внутри сервера, такого как Next.js или [Express](https://expressjs.com/ru/). Несмотря на это, большая часть возможностей и синтаксиса tRPC является одинаковой для всех серверов. Это возможно благодаря обработчику запросов или адаптеру, который "приклеивает" запросы HTTP к серверу и tRPC.

Обработчик запросов "сидит" на роуте (обычно, `/api/trpc`, но это лишь соглашение) и обрабатывает запросы для этого роута и его потомков. Он получает запрос от сервера, использует функцию `createContext` для генерации контекста и затем передает запрос и контекст процедуре, определенной в роуте.

Он также принимает некоторые опциональные параметры, такие как `onError()` - функцию обратного вызова для обработки ошибок, возникающих в процедуре.

__Пример использования адаптера для Next.js__

```ts
import { createNextApiHandler } from '@trpc/server/adapters/next';
import { createContext } from '../../../server/trpc/context';
import { appRouter } from '../../../server/trpc/router/_app';

// Обработчик запросов
export default createNextApiHandler({
  router: appRouter, // корневой роутер, see https://trpc.io/docs/procedures
  createContext, // контекст запросов, see https://trpc.io/docs/context
});
```

__Продвинутое использование__

Обработчик запросов, создаваемый с помощью `createNextApiHandler()`, это просто функция, которая принимает объекты `req` и `res`. Это означает, что данные объекты можно модифицировать перед их передачей обработчику, например, для включения [CORS](https://developer.mozilla.org/ru/docs/Web/HTTP/CORS):

```ts
import { createNextApiHandler } from '@trpc/server/adapters/next';
import { createContext } from '../../../server/trpc/context';
import { appRouter } from '../../../server/trpc/router/_app';

// Создаем обработчик, но пока не возвращаем его
const nextApiHandler = createNextApiHandler({
  router: appRouter,
  createContext,
});

// @see https://nextjs.org/docs/api-routes/introduction
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Модифицируем объекты `req` и `res`
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Request-Method', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    return res.end();
  }

  // Передаем модифицированные `req/res` обработчику
  return nextApiHandler(req, res);
}
```

tRPC предоставляет несколько [официальных адаптеров](https://trpc.io/docs/adapters).

### Посредники / middlewares

Метод `t.procedure.use` позволяет добавлять в процедуру посредников. Посредник оборачивает (wrap) вызов процедуры и передает ей возвращаемое им значение.

__Авторизация__

В следующем примере перед выполнением процедуры `adminProcedure` проверяется, что пользователь является администратором:

```ts
import { TRPCError, initTRPC } from '@trpc/server';
 
interface Context {
  user?: {
    id: string;
    isAdmin: boolean;
    // ...
  };
}
 
const t = initTRPC.context<Context>().create();
export const middleware = t.middleware;
export const publicProcedure = t.procedure;
export const router = t.router;
 
const isAdmin = middleware(async ({ ctx, next }) => {
  if (!ctx.user?.isAdmin) {
    // См. раздел, посвященный обработке ошибок
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  return next({ ctx });
});
 
export const adminProcedure = publicProcedure.use(isAdmin);
```

```ts
import { adminProcedure, publicProcedure, router } from './trpc';
 
const adminRouter = router({
  secretPlace: adminProcedure.query(() => 'ключ'),
});
 
export const appRouter = router({
  foo: publicProcedure.query(() => 'bar'),
  admin: adminRouter,
});
```

__Логгирование__

В следующем примере автоматически логгируется время выполнения запроса:

```ts
const loggerMiddleware = middleware(async ({ path, type, next }) => {
  const start = performance.now();
  const result = await next();
  const durationMs = performance.now() - start;
  result.ok
    ? logMock('Время выполнения успешного запроса:', { path, type, durationMs })
    : logMock('Время выполнения неудачного запроса:', { path, type, durationMs });
 
  return result;
});
 
export const loggedProcedure = publicProcedure.use(loggerMiddleware);
```

__Модификация контекста__

В следующем примере посредник модифицирует свойства контекста, передаваемого процедурам:

```ts
type Context = {
  // `user` может быть не определен (nullable)
  user?: {
    id: string;
  };
};
 
const isAuthed = middleware(({ ctx, next }) => {
  // `ctx.user` не определен
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
 
  return next({
    ctx: {
      // `user` имеет ненулевое значение
      user: ctx.user,
    },
  });
});
 
const protectedProcedure = publicProcedure.use(isAuthed);
protectedProcedure.query(({ ctx }) => ctx.user);
```

### Вызовы из сервера

Функция `createCaller` возвращает экземпляр `RouterCaller`, способного выполнять запросы и мутации и позволяющего вызывать процедуры прямо из сервера.

_Важно_: `RouterCaller` не должен использоваться для вызова процедур из других процедур.

__Пример запроса__

```ts
import { initTRPC } from '@trpc/server';
import { z } from 'zod';
 
const t = initTRPC.create();
 
const router = t.router({
  // Создаем процедуру для пути `greeting`
  greeting: t.procedure
    .input(z.object({ name: z.string() }))
    .query(({ input }) => `привет, ${input.name}`),
});
 
// В качестве параметра `createCaller()` принимает контекст
const caller = router.createCaller({});
const result = await caller.greeting({ name: 'народ' });
```

__Пример мутации__

```ts
import { initTRPC } from '@trpc/server';
import { z } from 'zod';
 
const posts = ['Один', 'Два', 'Три'];
 
const t = initTRPC.create();
const router = t.router({
  post: t.router({
    add: t.procedure.input(z.string()).mutation(({ input }) => {
      posts.push(input);
      return posts;
    }),
  }),
});
 
const caller = router.createCaller({});
const result = await caller.post.add('Четыре');
```

__Пример контекста с посредником__

```ts
import { TRPCError, initTRPC } from '@trpc/server';
 
type Context = {
  user?: {
    id: string;
  };
};
const t = initTRPC.context<Context>().create();
 
const isAuthed = t.middleware(({ next, ctx }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Вы не авторизованы.',
    });
  }
 
  return next({ ctx });
});
 
const protectedProcedure = t.procedure.use(isAuthed);
 
const router = t.router({
  secret: protectedProcedure.query(({ ctx }) => ctx.user),
});
 
{
  // ❌ будет выброшено исключение, поскольку в контексте отсутствует `user`
  const caller = router.createCaller({});
 
  const result = await caller.secret();
}
 
{
  // ✅
  const authorizedCaller = router.createCaller({
    user: {
      // ...
    },
  });
  const result = await authorizedCaller.secret();
}
```

__Пример конечной точки Next.js__

```ts
import { TRPCError } from '@trpc/server';
import { getHTTPStatusCodeFromError } from '@trpc/server/http';
import type { NextApiRequest, NextApiResponse } from 'next';
import { appRouter } from '~/server/routers/_app';
 
type ResponseData = {
  data?: {
    postTitle: string;
  };
  error?: {
    message: string;
  };
};
 
export default async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
) => {
  // Идентификатор поста, которого не существует в БД
  const postId = `this-id-does-not-exist-${Math.random()}`;
 
  const caller = appRouter.createCaller({});
 
  try {
    const postResult = await caller.post.byId({ id: postId });
 
    res.status(200).json({ data: { postTitle: postResult.title } });
  } catch (cause) {
    // Если это ошибка tRPC, из нее можно извлечь дополнительную информацию
    if (cause instanceof TRPCError) {
      const httpStatusCode = getHTTPStatusCodeFromError(cause);
 
      res.status(httpStatusCode).json({ error: { message: cause.message } });
      return;
    }
 
    res.status(500).json({
      error: { message: `Ошибка получения данных поста с ID ${postId}` },
    });
  }
};
```


### Авторизация

Функция `createContext` вызывается для каждого входящего запроса, так что это подходящее место для добавления контекстуальной информации о пользователя в объект запроса.

__Создание контекста из заголовков запроса__

```ts
import * as trpc from '@trpc/server';
import { inferAsyncReturnType } from '@trpc/server';
import * as trpcNext from '@trpc/server/adapters/next';
import { decodeAndVerifyJwtToken } from '../utils';

export async function createContext({
  req,
  res,
}: trpcNext.CreateNextContextOptions) {
  // Создаем контекст на основе `req`
  // Контекст доступен во всех процедурах как объект `ctx`
  async function getUserFromHeader() {
    if (req.headers.authorization) {
      const user = await decodeAndVerifyJwtToken(
        // Authorization: 'Bearer [token]'
        req.headers.authorization.split(' ')[1],
      );
      return user;
    }
    return null;
  }
  const user = await getUserFromHeader();

  return {
    user,
  };
}
export type Context = inferAsyncReturnType<typeof createContext>;
```

_Авторизация с помощью процедуры (резолвера/resolver)_

```ts
import { TRPCError, initTRPC } from '@trpc/server';
import type { Context } from '../context';

export const t = initTRPC.context<Context>().create();

const appRouter = t.router({
  public: t.procedure
    .input(z.string().nullish())
    .query(({ input, ctx }) => `привет, ${input ?? ctx.user?.name ?? 'народ'}`),
  protected: t.procedure.query(({ ctx }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    return {
      super: 'secret'
    };
  }),
});
```

_Авторизация с помощью посредника_

```ts
import { TRPCError, initTRPC } from '@trpc/server';

export const t = initTRPC.context<Context>().create();

const isAuthed = t.middleware(({ next, ctx }) => {
  if (!ctx.user?.isAdmin) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      user: ctx.user,
    },
  });
});

// Переиспользуемый защитник
export const protectedProcedure = t.procedure.use(isAuthed);

t.router({
  public: t.procedure
    .input(z.string().nullish())
    .query(({ input, ctx }) => `hello ${input ?? ctx.user?.name ?? 'world'}`),
  admin: t.router({
    protected: protectedProcedure.query(({ ctx }) => {
      return {
        super: 'secret',
      };
    }),
  }),
});
```

### Валидация результата

Для валидации результата, возвращаемого резолвером (например, `t.procedure.query()`) используется метод `output`, который работает аналогично методу `input`, предназначенному для валидации входных данных.

_Обратите внимание_: как правило, валидация результата не требуется.

__Пример использования Zod__

```ts
import { initTRPC } from '@trpc/server';
import { z } from 'zod';

export const t = initTRPC.create();

export const appRouter = t.router({
  hello: t.procedure
    .output(
      z.object({
        greeting: z.string(),
      }),
    )
    // Ожидаемым типом результата является `{ greeting: string }`
    .query(() => {
      return {
        greeting: 'привет',
      };
    }),
});

export type AppRouter = typeof appRouter;
```

__Пример использования кастомного валидатора__

```ts
import { initTRPC } from '@trpc/server';

export const t = initTRPC.create();

export const appRouter = t.router({
  hello: t.procedure
    .output((value: any) => {
      if (value && typeof value.greeting === 'string') {
        return { greeting: value.greeting };
      }
      throw new Error('Приветствие не обнаружено.');
    })
    .query(() => {
      return {
        greeting: 'привет',
      };
    }),
});

export type AppRouter = typeof appRouter;
```

### Вывод типов

Иногда бывает полезным оборачивать интерфейс `@trpc/client` или `@trpc/react-query` другими функциями. В этом случае необходимо каким-то образом выводить типы, генерируемые роутером `@trpc/server`.

__Помощники вывода типов__

`@trpc/server` экспортирует следующие утилиты для вывода типов `AppRouter`:

- `inferRouterInputs<TRouter>`
- `inferRouterOutputs<TRouter>`

Предположим, что у нас имеется такой роутер:

```ts
// @filename: server.ts
import { initTRPC } from '@trpc/server';
import { z } from "zod";
 
const t = initTRPC.create();
 
const appRouter = t.router({
  post: t.router({
    list: t.procedure
      .query(() => {
        // Обращение к БД
        return [{ id: 1, title: 'tRPC лучший!' }];
    }),
    byId: t.procedure
      .input(z.string())
      .query(({ input }) => {
        // Обращение к БД
        return { id: 1, title: 'tRPC лучший!' };
    }),
    create: t.procedure
      .input(z.object({ title: z.string(), text: z.string(), }))
      .mutation(({ input }) => {
        // Обращение к БД
        return { id: 1, title: 'tRPC лучший!' };
    }),
  }),
});
 
export type AppRouter = typeof appRouter;
```

Типы из этого роутера можно вывести следующим образом:

```ts
// @filename: client.ts
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from './server';
 
type RouterInput = inferRouterInputs<AppRouter>;
type RouterOutput = inferRouterOutputs<AppRouter>;
 
type PostCreateInput = RouterInput['post']['create'];
type PostCreateOutput = RouterOutput['post']['create'];
```

__Вывод `TRPClientError`__

```ts
// @filename: client.ts
import { TRPCClientError } from '@trpc/client';
import type { AppRouter } from './server';
import { trpc } from './trpc';
 
export function isTRPCClientError(
  cause: unknown,
): cause is TRPCClientError<AppRouter> {
  return cause instanceof TRPCClientError;
}
 
async function main() {
  try {
    await trpc.post.byId.query('1');
  } catch (cause) {
    if (isTRPCClientError(cause)) {
      // `cause` типизирована как `TRPCClientError`
      console.log('Данные:', cause.data);
    } else {
      // ...
    }
  }
}
 
main();
```

__Вывод настроек React Query__

```ts
// @filename: trpc.ts
import {
  type inferReactQueryProcedureOptions,
  createTRPCReact
} from '@trpc/react-query';
import type { inferRouterInputs } from '@trpc/server';
import type { AppRouter } from './server';
 
export type ReactQueryOptions = inferReactQueryProcedureOptions<AppRouter>;
export type RouterInputs = inferRouterInputs<AppRouter>;
 
export const trpc = createTRPCReact<AppRouter>();
 
// @filename: usePostCreate.ts
import { type ReactQueryOptions, trpc } from './trpc';
 
type PostCreateOptions = ReactQueryOptions['post']['create'];
 
function usePostCreate(options?: PostCreateOptions) {
  const utils = trpc.useContext();
  return trpc.post.create.useMutation({
    ...options,
    onSuccess(post) {
      // Инвалидируем все запросы роутера постов
      // после создания нового поста
      utils.post.invalidate();
      options?.onSuccess?.(post);
    },
  });
}

// @filename: usePostById.ts
import { ReactQueryOptions, RouterInputs, trpc } from './trpc';
 
type PostByIdOptions = ReactQueryOptions['post']['byId'];
type PostByIdInput = RouterInputs['post']['byId'];
 
function usePostById(input: PostByIdInput, options?: PostByIdOptions) {
  return trpc.post.byId.useQuery(input, options);
}
```

### Обработка ошибок

При возникновении ошибки в процедуре, tRPC отвечает клиенту объектом, включающим свойство `error`. Это свойство содержит всю информацию, необходимую для обработки ошибки на клиенте.

Пример ответа на "плохой запрос" (bad request):

```json
{
  "id": null,
  "error": {
    "message": "\"password\" должен состоять из 4 и более символов",
    "code": -32600,
    "data": {
      "code": "BAD_REQUEST",
      "httpStatus": 400,
      "stack": "...",
      "path": "user.changepassword"
    }
  }
}
```

_Обратите внимание_: трассировка стека (`stack`) возвращается только в режиме разработки.

__Коды ошибок__

tRPC определяет [список кодов ошибок](https://trpc.io/docs/error-handling#error-codes), представляющих тип ошибки и код ответа HTTP.

Утилита `getHTTPStatusCodeFromError` позволяет извлекать код HTTP из ошибки:

```ts
import { getHTTPStatusCodeFromError } from '@trpc/server/http';
 
// Пример ошибки
const error: TRPCError = {
  name: 'TRPCError',
  code: 'BAD_REQUEST',
  message: '"password" должен состоять из 4 и более символов',
};
 
if (error instanceof TRPCError) {
  const httpCode = getHTTPStatusCodeFromError(error);
  console.log(httpCode); // 400
}
```

__Генерация исключений__

tRPC предоставляет класс `TRPCError`, являющийся подклассом `Error`, который может использоваться для представления ошибки, возникшей в процедуре.

Например, генерация такого исключения:

```ts
import { TRPCError, initTRPC } from '@trpc/server';

const t = initTRPC.create();

const appRouter = t.router({
  hello: t.procedure.query(() => {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Возникла ошибка, попробуйте позже.',
      // Опционально: передаем оригинальную ошибку для сохранения трассировки стека
      cause: theError,
    });
  }),
});
```

Приведет к такому ответу:

```json
{
  "id": null,
  "error": {
    "message": "Возникла ошибка, попробуйте позже.",
    "code": -32603,
    "data": {
      "code": "INTERNAL_SERVER_ERROR",
      "httpStatus": 500,
      "stack": "...",
      "path": "hello"
    }
  }
}
```

__Обработка ошибок__

Все ошибки, возникающие в процедуре, проходят через метод `onError` перед передачей клиенту. Это отличное место для обработки ошибок:

```ts
export default trpcNext.createNextApiHandler({
  // ...
  onError({ error, type, path, input, ctx, req }) {
    console.error('Ошибка:', error);
    if (error.code === 'INTERNAL_SERVER_ERROR') {
      // Отправляем отчет об ошибке
    }
  },
});
```

Параметр, принимаемый `onError()`, представляет собой объект, содержащий всю необходимую информацию об ошибке и контексте ее возникновения:

```ts
{
  error: TRPCError; // оригинальная ошибка
  type: 'query' | 'mutation' | 'subscription' | 'unknown';
  path: string | undefined; // путь процедуры
  input: unknown;
  ctx: Context | undefined;
  req: BaseRequest; // объект запроса
}
```

### Форматирование ошибок

__Добавление кастомного редактора (на примере zod)__

```ts
import { initTRPC } from '@trpc/server';

export const t = initTRPC.context<Context>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.code === 'BAD_REQUEST' && error.cause instanceof ZodError
            ? error.cause.flatten()
            : null,
      },
    };
  },
});
```

__Использование в React__

```ts
export function MyComponent() {
  const mutation = trpc.addPost.useMutation();

  useEffect(() => {
    mutation.mutate({ title: 'пример' });
  }, []);

  if (mutation.error?.data?.zodError) {
    // Выводится `zodError`
    return (
      <pre>Ошибка: {JSON.stringify(mutation.error.data.zodError, null, 2)}</pre>
    );
  }

  // ...
}
```

__Параметр, передаваемый `errorFormatter()`__

```ts
{
  error: TRPCError;
  type: ProcedureType | 'unknown';
  path: string | undefined;
  input: unknown;
  ctx: undefined | TContext;
  shape: DefaultErrorShape; // дефолтная форма (shape) ошибки
}
```

`DefaultErrorShape`:

```ts
interface DefaultErrorData {
  code: TRPC_ERROR_CODE_KEY;
  httpStatus: number;
  path?: string;
  stack?: string;
}

interface DefaultErrorShape
  extends TRPCErrorShape<TRPC_ERROR_CODE_NUMBER, DefaultErrorData> {
  message: string;
  code: TRPC_ERROR_CODE_NUMBER;
}
```

### Преобразователи данных / Data transformers

Мы можем преобразовывать как данные, включаемые в ответ, так и входные аргументы. Преобразователи (transformers) должны быть добавлены как на сервере, так и на клиенте.

__Использование [superjson](https://github.com/blitz-js/superjson)__

SuperJSON позволяет прозрачно передавать, например, стандартные `Date/Map/Set` между сервером и клиентом. Это позволяет возвращать указанные типы из резолверов и использовать их на клиенте без необходимости воссоздания этих объектов из JSON.

1. Устанавливаем supejson:

```bash
yarn add superjson
# или
npm i superjson
```

2. Добавляем его в `initTRPC()`:

```ts
import { initTRPC } from '@trpc/server';
import superjson from 'superjson';

export const t = initTRPC.create({
  transformer: superjson,
});
```

3. Добавляем его в `createTRPCProxyClient()` или `createTRPCNext()`:

```ts
import { createTRPCProxyClient } from '@trpc/client';
import superjson from 'superjson';
import type { AppRouter } from '~/server/routers/_app';

export const client = createTRPCProxyClient<AppRouter>({
  transformer: superjson,
  // ...
});
```

```ts
import { createTRPCNext } from '@trpc/next';
import superjson from 'superjson';
import type { AppRouter } from '~/server/routers/_app';

export const trpc = createTRPCNext<AppRouter>({
  config({ ctx }) {
    return {
      transformer: superjson,
    };
  },
  // ...
});
```

__Разные преобразователи для загрузки и скачивания__

Преобразователи могут использоваться индивидуально, например, когда преобразователь используется в одном направлении или для загрузки (upload) и скачивания (download) используются разные преобразователи (например, по причинам производительности). _Важно_: сочетание преобразователей должно быть одинаковым на сервере и клиенте.

В следующем примере superjson используется для загрузки данных, а [devalue](https://github.com/Rich-Harris/devalue) - для их скачивания: devalue является более производительным, но его использование на сервере является небезопасным.

1. Устанавливаем пакеты:

```bash
yarn add superjson devalue
```

2. Определяем преобразователь:

```ts
import { uneval } from 'devalue';
import superjson from 'superjson';

export const transformer = {
  input: superjson,
  output: {
    serialize: (object) => uneval(object),
    // Этот `eval` выполняется только на клиенте
    deserialize: (object) => eval(`(${object})`),
  },
};
```

3. Добавляем преобразователь в `initTRPC()`:

```ts
import { initTRPC } from '@trpc/server';
import { transformer } from '../../utils/trpc';

export const t = initTRPC.create({
  transformer,
});

export const appRouter = t.router({
  // ...
});
```

4. Добавляем преобразователь в `createTRPCProxyClient()`:

```ts
import { createTRPCProxyClient } from '@trpc/client';
import { transformer } from '../utils/trpc';

export const client = createTRPCProxyClient<AppRouter>({
  transformer,
  // ...
});
```

__Интерфейс `DataTransformer `__

```ts
export interface DataTransformer {
  serialize(object: any): any;
  deserialize(object: any): any;
}

interface InputDataTransformer extends DataTransformer {
  /**
   * Запускается на клиенте перед отправкой данных на сервер
   */
  serialize(object: any): any;
  /**
   * Запускается на сервере для преобразования данных перед их передачей резолверу
   */
  deserialize(object: any): any;
}

interface OutputDataTransformer extends DataTransformer {
  /**
   * Запускается на сервере перед отправкой данных клиенту
   */
  serialize(object: any): any;
  /**
   * Запускается на клиенте для преобразования данных, полученных от клиента
   */
  deserialize(object: any): any;
}

export interface CombinedDataTransformer {
  /**
   * Определяет преобразование данных, передаваемых клиентом серверу (входных данных)
   */
  input: InputDataTransformer;
  /**
   * Определяет преобразования данных, передаваемых сервером клиенту (исходящих данных)
   */
  output: OutputDataTransformer;
}
```

### Метаданные

Метод процедуры `meta` позволяет добавлять дополнительные данные для посредников.

__Создание роутера с типизированными метаданными__

```ts
import { initTRPC } from '@trpc/server';

interface Meta {
  hasAuth: boolean;
}

export const t = initTRPC.context<Context>().meta<Meta>().create();

export const appRouter = t.router({
  // ...
});
```

__Пример настроек аутентификации__

```ts
import { initTRPC } from '@trpc/server';

// ...

interface Meta {
  hasAuth: boolean;
}

export const t = initTRPC.context<Context>().meta<Meta>().create();

const isAuthed = t.middleware(async ({ meta, next, ctx }) => {
  // Проверка наличия пользователя выполняется только если `hasAuth` имеет значение `true`
  if (meta?.hasAuth && !ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({ ctx });
});

export const authedProcedure = t.procedure.use(isAuthed);

export const appRouter = t.router({
  public: authedProcedure.meta({ hasAuth: false }).query(() => {
    return {
      greeting: 'привет, незнакомец',
    };
  }),
  protected: authedProcedure.meta({ hasAuth: true }).query(({ ctx }) => {
    return {
      greeting: `привет, ${ctx.user.name}`,
    };
  }),
});
```

### Кэширование ответов

В приводимых ниже примерах используется [граничное кэширование (edge caching) Vercel](https://vercel.com/docs/concepts/functions/serverless-functions/edge-caching) для максимально быстрой доставки данных пользователям.

_Важно_: работа с кэшем предполагает крайнюю внимательность и осторожность, особенно, при обработке персональных данных. Поскольку группировка (объединение) запросов (батчинг, batching) включена по умолчанию, кэш-заголовки HTTP рекомендуется устанавливать в функции `responseMeta`. При этом, необходимо убедиться, что отсутствуют конкурентные запросы, которые могут записать в кэш персональные данные. Также рекомендуется выключать кэширование при наличии заголовков авторизации или куки.

__Кэширование приложения__

```ts
import { httpBatchLink } from '@trpc/client';
import { createTRPCNext } from '@trpc/next';
import type { AppRouter } from '../server/routers/_app';

export const trpc = createTRPCNext<AppRouter>({
  config({ ctx }) {
    if (typeof window !== 'undefined') {
      return {
        links: [
          httpBatchLink({
            url: '/api/trpc',
          }),
        ],
      };
    }

    const url = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}/api/trpc`
      : 'http://localhost:3000/api/trpc';

    return {
      links: {
        http: httpBatchLink({
          url,
        }),
      },
    };
  },
  ssr: true,
  responseMeta({ ctx, clientErrors }) {
    if (clientErrors.length) {
      // Если на клиенте возникла ошибка
      return {
        status: clientErrors[0].data?.httpStatus ?? 500,
      };
    }

    // Кэшируем ответ на 1 день и ревалидируем кэш каждую секунду
    const ONE_DAY_IN_SECONDS = 60 * 60 * 24;
    return {
      headers: {
        'cache-control': `s-maxage=1, stale-while-revalidate=${ONE_DAY_IN_SECONDS}`,
      },
    };
  },
});
```

__Кэширование ответов__

Поскольку все запросы (queries) - это обычные GET-запросы HTTP, для кэширования ответов на них можно использовать соответствующие заголовки HTTP:

```ts
import { inferAsyncReturnType, initTRPC } from '@trpc/server';
import * as trpcNext from '@trpc/server/adapters/next';

export const createContext = async ({
  req,
  res,
}: trpcNext.CreateNextContextOptions) => {
  return {
    req,
    res,
    prisma,
  };
};

type Context = inferAsyncReturnType<typeof createContext>;

export const t = initTRPC.context<Context>().create();

const waitFor = async (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const appRouter = t.router({
  public: t.router({
    slowQueryCached: t.procedure.query(async ({ ctx }) => {
      await waitFor(5000); // ждем 5 секунд

      return {
        lastUpdated: new Date().toJSON(),
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;

export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext,
  responseMeta({ ctx, paths, type, errors }) {
    // Предположим, что все открытые роуты содержат префикс `public`
    const allPublic = paths && paths.every((path) => path.includes('public'));
    // Убеждаемся в отсутствии ошибок
    const allOk = errors.length === 0;
    // Убеждаемся в том, что выполняется запрос, а не мутация
    const isQuery = type === 'query';

    if (ctx?.res && allPublic && allOk && isQuery) {
      // Кэшируем ответ
      const ONE_DAY_IN_SECONDS = 60 * 60 * 24;
      return {
        headers: {
          'cache-control': `s-maxage=1, stale-while-revalidate=${ONE_DAY_IN_SECONDS}`,
        },
      };
    }
    return {};
  },
});
```

## [@trpc/client](https://www.npmjs.com/package/@trpc/client)

### Клиент на чистом TypeScript

Одним из основных преимуществ tRPC является возможность использования серверных типов на клиенте. Для этого достаточно импортировать тип корневого роутера:

```ts
import type { AppRouter } from '../path/to/server/trpc';
```

`AppRouter` представляет сигнатуру всего интерфейса.

__Инициализация клиента tRPC__

Метод `createTRPCProxyClient` позволяет создавать типобезопасных клиентов и определять адреса серверов:

```ts
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../path/to/server/trpc';

const client = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:3000/trpc',
    }),
  ],
});
```

Примеры использования клиента:

```ts
const bilbo = await client.getUser.query('id_bilbo');
// => { id: 'id_bilbo', name: 'Bilbo' };

const frodo = await client.createUser.mutate({ name: 'Frodo' });
// => { id: 'id_frodo', name: 'Frodo' };
```

### Прерывание вызовов процедур

__@trpc/react-query__

По умолчанию tRPC не отменяет запросы, находящиеся в процессе выполнения, при размонтировании компонентов. Однако для этого достаточно установить настройку `abortOnUnmount` в значение `true`:

```ts
// @filename: utils.ts
import { createTRPCReact } from '@trpc/react-query';
 
export const trpc = createTRPCReact<AppRouter>();
trpc.createClient({
  // ...
  abortOnUnmount: true,
});
```

Это также можно реализовать на уровне запросов:

```ts
// @filename: pages/posts/[id].tsx
import { trpc } from '~/utils/trpc';
 
const PostViewPage: NextPageWithLayout = () => {
  const id = useRouter().query.id as string;
  const postQuery = trpc.post.byId.useQuery({ id }, { trpc: { abortOnUnmount: true } });
 
  // ...
}
```

_Важно_: @tanstack/react-query позволяет отменять только запросы (queries).

__@trpc/client__

При создании клиента на чистом TS достаточно передать `AbortController` в настройках запроса и вызвать метод `abort()` родительского `AbortController`:

```ts
// @filename: server.ts
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from 'server.ts';
 
const proxy = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:3000/trpc',
    }),
  ],
});
 
const ac = new AbortController();
const query = proxy.userById.query('id_bilbo', { signal: ac.signal });
 
// Отмена
ac.abort();
 
console.log(query.status);
```

_Важно_: клиент на чистом TS позволяет отменять как запросы, так и мутации (mutations).

### Ссылки / Links

Ссылки позволяют кастомизировать поток данных между клиентом и сервером tRPC. Ссылка должна следовать принципу одной ответственности, т.е. должна делать одну вещь, которой может быть либо модификация операции (запроса, мутации или подписки), либо побочный эффект (side-effect), такой как логгирование.

Ссылки могут объединяться в массив, передаваемый в качестве значения настройки `links` при создании клиента. Массив представляет цепочку ссылок (link chain). Это означает, что клиент выполняет ссылки в порядке добавления при обработке запроса и в обратном порядке при обработке ответа.

_Обратите внимание_: в приводимых ниже примерах предполагается использование Next.js.

```ts
import { httpBatchLink, loggerLink } from '@trpc/client';
import { createTRPCNext } from '@trpc/next';

export default createTRPCNext<AppRouter>({
  config() {
    const url = `http://localhost:3000`;

    return {
      links: [
        loggerLink(),
        httpBatchLink({
          url,
        }),
      ],
    };
  },
});
```

__Создание кастомной ссылки__

Ссылка - это функция, соответствующая типу `TRPCLink`. Каждая ссылка состоит из 3 частей:

1. Ссылка возвращает функцию с параметром типа `TRPCClientRuntime`. Этот аргумент предоставляется tRPC и используется для создания завершающей ссылки (terminating link). Если создание такой ссылки не планируется, можно создать функцию без параметров. В этом случае ссылка добавляется в массив `links` без вызова: `[customLink, httpBatchLink()]`.
2. Функция с шага 1 возвращает другую функцию, которая получает объект с двумя свойствами: `op` (operation) - операция, выполняемая клиентом, и `next` - функция для вызова следующей ссылки.
3. Функция с шага 2 возвращает последнюю функцию, которая возвращает функцию `observable`, предоставляемую `@trpc/server`. `observable()` принимает функцию, которая получает `observer`, который позволяет сообщить следующей ссылке то, как следует обрабатывать результат операции. В этой функции мы можем вернуть `next(op)`, оставить ее как есть или подписаться на `next()`, что позволяет ссылке обрабатывать результат операции.

```ts
import { TRPCLink } from '@trpc/client';
import { observable } from '@trpc/server/observable';
import type { AppRouter } from 'server/routers/_app';

export const customLink: TRPCLink<AppRouter> = () => {
  // Здесь происходит инициализация приложения -
  // один раз, что может быть использовано, например, для записи кэша
  return ({ next, op }) => {
    // Передача результата следующей ссылке

    // Каждая ссылка должна возвращать `observable` для обработки (propagate) результатов
    return observable((observer) => {
      console.log('Выполняется операция:', op);
      const unsubscribe = next(op).subscribe({
        next(value) {
          console.log('Получено значение:', value);
          observer.next(value);
        },
        error(err) {
          console.log('Возникла ошибка:', err);
          observer.error(err);
        },
        complete() {
          observer.complete();
        },
      });

      return unsubscribe;
    });
  };
};
```

__Завершающая ссылка__

Завершающая ссылка - это последняя ссылка в цепочке ссылок. Вместо вызова функции `next`, она отвечает за отправку операции на сервер и возврат `OperationResultEnvelope`.

Массив `links` должен содержать хотя бы одну ссылку, которая должна быть завершающей. Если `links` не содержит завершающей ссылки, операция не будет отправлена на сервер.

Рекомендуемой завершающей ссылкой является `httpBatchLink`. Другими примерами завершающих ссылок являются `httpLink` и `wsLink`.

__Управление контекстом__

Объект `op` содержит свойство `context`, значением которого являются метаданные, которые могут использоваться ссылками в процессе обработки операции. Начальное значение контекста может устанавливаться через параметр `context` резолверов (query, mutation и др.) или хука `useQuery()`.

#### httpLink

`httpLink` - это завершающая ссылка, которая отправляет операцию в процедуру через HTTP. Она поддерживает как GET, так и POST-запросы.

__Использование__

```ts
import { createTRPCProxyClient, httpLink } from '@trpc/client';
import type { AppRouter } from '../server';

const client = createTRPCProxyClient<AppRouter>({
  links: [
    httpLink({
      url: 'http://localhost:3000',
    }),
  ],
});
```

__Настройки__

```ts
export interface HTTPLinkOptions {
  url: string;
  /**
   * Добавляет полифил для fetch
   */
  fetch?: typeof fetch;
  /**
   * Добавляет полифил для AbortController
   */
  AbortController?: typeof AbortController | null;
  /**
   * Заголовки запроса или функция, возвращающая их
   * @link http://trpc.io/docs/v10/header
   */
  headers?: HTTPHeaders | (() => HTTPHeaders | Promise<HTTPHeaders>);
}
```

#### httpBatchLink

`httpBatchLink` - это завершающая ссылка, которая группирует (batch) массив отдельных операций в один запрос и отправляет его в одну процедуру по HTTP.

__Использование__

```ts
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../server';

const client = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:3000',
    }),
  ],
});
```

После этого операции могут группироваться с помощью `Promise.all()`. Следующий код приведет к отправке только одного запроса и только одного обращения к базе данных:

```ts
const posts = await Promise.all([
  trpc.post.byId.query(1);
  trpc.post.byId.query(2);
  trpc.post.byId.query(3);
])
```

__Настройки__

```ts
export interface HttpBatchLinkOptions extends HTTPLinkOptions {
  maxURLLength?: number;
}

export interface HTTPLinkOptions {
  url: string;
  fetch?: typeof fetch;
  AbortController?: typeof AbortController | null;
  headers?: HTTPHeaders | (() => HTTPHeaders | Promise<HTTPHeaders>);
}
```

__Ограничение длины URL__

Иногда при отправке групповых запросов URL становится слишком длинным, что приводит к ошибкам `413 Payload Too Large`, `414 URI Too Long` и `404 Not Found`. Настройка `maxURLLength` позволяет ограничить длину URL:

```ts
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../server';

const client = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:3000',
      maxURLLength: 2083,
    }),
  ],
});
```

__Отключение объединения запросов__

1. На сервере:

```ts
import { createHTTPServer } from '@trpc/server/adapters/standalone';

createHTTPServer({
  // ...
  // 👇 отключаем объединение
  batching: {
    enabled: false,
  },
});
```

или, при использовании Next.js:

```ts
export default trpcNext.createNextApiHandler({
  // ...
  batching: {
    enabled: false,
  },
});
```

2. Заменяем `httpBatchLink` на `httpLink` на клиенте. При использовании Next.js:

```ts
import type { AppRouter } from '@/server/routers/app';
import { httpLink } from '@trpc/client';
import { createTRPCNext } from '@trpc/next';

export const trpc = createTRPCNext<AppRouter>({
  config() {
    return {
      links: [
        httpLink({
          url: '/api/trpc',
        }),
      ],
    };
  },
});
```

#### wsLink

`wsLink` - это завершающая ссылка, которая используется для клиента WebSockets и подписок.

__Использование__

```ts
import { createTRPCProxyClient, createWSClient, wsLink } from '@trpc/client';
import type { AppRouter } from '../server';

const wsClient = createWSClient({
  url: 'ws://localhost:3000',
});

const trpcClient = createTRPCProxyClient<AppRouter>({
  links: [wsLink<AppRouter>({ client: wsClient })],
});
```

__Настройки__

```ts
export interface WebSocketLinkOptions {
  client: TRPCWebSocketClient;
}

function createWSClient(opts: WebSocketClientOptions) => TRPCWebSocketClient

export interface WebSocketClientOptions {
  url: string;
  WebSocket?: typeof WebSocket;
  retryDelayMs?: typeof retryDelay;
  onOpen?: () => void;
  onClose?: (cause?: { code?: number }) => void;
}
```

#### splitLink

`splitLink` - это ссылка, которая позволяет разделять поток выполнения цепочки ссылок на основе определенного условия. Обязательными являются как ветка `true`, так и ветка `false`. Каждая ветка может содержать как одну ссылку, так и несколько ссылок в виде массива.

_Обратите внимание_: каждая ветка должна содержать завершающую ссылку.

__Использование__

Рассмотрим пример отключения объединения для некоторых запросов.

1. Настраиваем клиента:

```ts
import {
  createTRPCProxyClient,
  httpBatchLink,
  httpLink,
  splitLink,
} from '@trpc/client';
import type { AppRouter } from '../server';

const url = `http://localhost:3000`;

const client = createTRPCProxyClient<AppRouter>({
  links: [
    splitLink({
      condition(op) {
        // Проверяем истинность свойства контекста `skipBatch`
        return op.context.skipBatch === true;
      },
      // Отключаем объединение
      true: httpLink({
        url,
      }),
      // Включаем объединение
      false: httpBatchLink({
        url,
      }),
    }),
  ],
});
```

2. Выполняем запрос без объединения:

```ts
const postResult = proxy.posts.query(null, {
  context: {
    skipBatch: true,
  },
});
```

или:

```ts
export function MyComponent() {
  const postsQuery = proxy.posts.useQuery(undefined, {
    trpc: {
      context: {
        skipBatch: true,
      },
    }
  });

  return (
    <pre>{JSON.stringify(postsQuery.data ?? null, null, 4)}</pre>
  )
})
```

__Настройки__

```ts
function splitLink<TRouter extends AnyRouter = AnyRouter>(opts: {
  condition: (op: Operation) => boolean;
  /**
   * Истинная ветка
   */
  true: TRPCLink<TRouter> | TRPCLink<TRouter>[];
  /**
   * Ложная ветка
   */
  false: TRPCLink<TRouter> | TRPCLink<TRouter>[];
}) => TRPCLink<TRouter>
```

#### loggerLink

`loggerLink` - это ссылка, позволяющая реализовать логгирование на клиенте. Логгирование означает получение подробной информации об операциях (запросах, мутациях, подписках), их запросах и ответах. По умолчанию `loggerLink()` выводит форматированные сообщения в консоль браузера. Это поведение настраивается.

__Использование__

```ts
import { createTRPCProxyClient, httpBatchLink, loggerLink } from '@trpc/client';
import type { AppRouter } from '../server';

const client = createTRPCProxyClient<AppRouter>({
  links: [
    /**
     * Включаем полное логгирование в режиме разработки и
     * логгирование ошибок в производственном режиме
     */
    loggerLink({
      enabled: (opts) =>
        (process.env.NODE_ENV === 'development' &&
          typeof window !== 'undefined') ||
        (opts.direction === 'down' && opts.result instanceof Error),
    }),
    httpBatchLink({
      url: 'http://localhost:3000',
    }),
  ],
});
```

__Настройки__

```ts
type LoggerLinkOptions<TRouter extends AnyRouter> = {
  logger?: LogFn<TRouter>;
  /**
   * Включено ли логгирование? По умолчанию `true`
   */
  enabled?: EnabledFn<TRouter>;
  console?: ConsoleEsque;
};
```

### Кастомный заголовок

Настройка `headers` ссылок `httpBatchLink` и `httpLink` позволяет кастомизировать заголовки запроса. Она может быть как объектом, так и функцией. Функция вызывается динамически для каждого запроса.

```ts
import type { AppRouter } from '@/server/routers/app';
import { httpBatchLink } from '@trpc/client';
import { createTRPCNext } from '@trpc/next';

export let token: string;

export const trpc = createTRPCNext<AppRouter>({
  config({ ctx }) {
    return {
      links: [
        httpBatchLink({
          url: 'http://localhost:3000/api/trpc',
          /**
           * Эта функция будет вызываться при каждом запросе
           */
          headers() {
            return {
              Authorization: token,
            };
          },
        }),
      ],
    };
  },
});
```

__Использование__

```ts
const loginMutation = trpc.auth.login.useMutation({
  onSuccess({ accessToken }) {
    token = accessToken;
  },
});
```

### CORS и куки

Если клиент и сервер находятся в разных источниках (origin - протокол, домен и порт), и мы хотим прикрепить к запросу куки, то необходимо включить CORS на сервере и указать настройку `credentials: 'include'` при отправке запроса на клиенте:

```ts
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';

const client = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:4000/api/trpc',
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: 'include',
        });
      },
    }),
  ],
});
```

## @trpc/react-query

[Руководство по React Query](https://my-js.org/docs/guide/react-query).

### Использование с React

__Добавление tRPC в существующий проект React__

_Сервер_

1. Устанавливаем зависимости:

```bash
yarn add @trpc/server zod
```

Вместо zod можно использовать любую другую библиотеку валидации, такую как Yup, Superstruct, io-ts и т.д.

2. Включаем строгий режим (это нужно для zod):

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true
  }
}
```

или хотя бы:

```json
// tsconfig.json
{
  "compilerOptions": {
    "strictNullChecks": true
  }
}
```

3. Создаем `AppRouter`.

_Клиент_

1. Устанавливаем зависимости:

```bash
yarn add @trpc/client @trpc/server @trpc/react-query @tanstack/react-query
```

`@trpc/server` является зависимостью `@trpc/client`. `@tanstack/react-query` является зависимостью `@trpc/react-query`.

2. Создаем хуки:

```ts
import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '../server';

export const trpc = createTRPCReact<AppRouter>();
```

3. Добавляем провайдеры:

```ts
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import React, { useState } from 'react';
import { trpc } from './utils/trpc';

export function App() {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: 'http://localhost:5000/trpc',
          // optional
          headers() {
            return {
              authorization: getAuthCookie(),
            };
          },
        }),
      ],
    }),
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {/* ... */}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
```

_Обратите внимание_: в приведенном примере для создания экземпляров `queryClient` и `TRPCClient` используется хук `useState()`. Это позволяет обеспечить уникальность клиента для каждого запроса при использовании SSR. В противном случае, кэш запросов будет общим.

4. Получаем данные:

```tsx
import { trpc } from '../utils/trpc';

export default function IndexPage() {
  const hello = trpc.hello.useQuery({ text: 'клиент' });

  if (!hello.data) return <div>Загрузка...</div>;

  return (
    <div>
      <p>{hello.data.greeting}</p>
    </div>
  );
}
```

### useQuery()

Хуки tRPC - это абстракции над хуками React Query, предоставляющие некоторый дополнительный функционал.

Хук `useQuery()` предназначен для выполнения запросов.

```ts
function useQuery(
  input: TInput,
  opts?: UseTRPCQueryOptions;
)

interface UseTRPCQueryOptions
  extends UseQueryOptions {
  trpc: {
    ssr: boolean;
    abortOnUnmount: boolean;
  }
}
```

- `ssr`: отключает рендеринг на стороне сервера для данного запроса при условии, что в глобальных настройках установлено `ssr: true` (включить серверный рендеринг для отдельного запроса нельзя)
- `abortOnUnmount`: перезаписывает глобальные настройки и определяет прерывание запроса при размонтировании компонента

В качестве `input` можно передать `undefined`.

__Использование__

```ts
// @filename: utils/trpc.ts
import { initTRPC } from '@trpc/server';
import { z } from 'zod';

export const t = initTRPC.create();

export const appRouter = t.router({
  hello: t.procedure
    .input(
      z
        .object({
          name: z.string(),
        })
        .nullish(),
    )
    .query(({ input }) => {
      return {
        greeting: `привет, ${input?.name ?? 'народ'}`,
      };
    }),
});
```

```tsx
// @filename: components/MyComponent.tsx
import { trpc } from '../utils/trpc';

export function MyComponent() {
  // Входные данные (`input`) являются опциональными
  const helloNoArgs = trpc.hello.useQuery();
  const helloWithArgs = trpc.hello.useQuery({ text: 'клиент' });

  return (
    <div>
      <ul>
        <li>
          helloNoArgs ({helloNoArgs.status}):{' '}
          <pre>{JSON.stringify(helloNoArgs.data, null, 2)}</pre>
        </li>
        <li>
          helloWithArgs ({helloWithArgs.status}):{' '}
          <pre>{JSON.stringify(helloWithArgs.data, null, 2)}</pre>
        </li>
      </ul>
    </div>
  );
}
```

### useMutation()

Хук `useMutation()` предназначен для выполнения мутаций.

__Использование__

```ts
import { initTRPC } from '@trpc/server';
import { z } from 'zod';

export const t = initTRPC.create();

export const appRouter = t.router({
  login: t.procedure
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .mutation(({ input }) => {
      return {
        user: {
          name: input.name,
          role: 'ADMIN',
        },
      };
    }),
});
```

```tsx
import { trpc } from '../utils/trpc';

export function MyComponent() {
  const mutation = trpc.login.useMutation();

  const handleLogin = () => {
    const name = 'Карл Саган';

    mutation.mutate({ name });
  };

  return (
    <div>
      <h1>Авторизация</h1>
      <button onClick={handleLogin} disabled={mutation.isLoading}>
        Войти
      </button>

      {mutation.error && <p>Ошибка: {mutation.error.message}</p>}
    </div>
  );
}
```

### useInfiniteQuery()

Хук `useInfiniteQuery()` предназначен для получения большого количества данных по частям.

_Важно_: при использовании хука `useInfiniteQuery()` процедура должна принимать `cursor` любого типа (`string`, `number` и др.).

В приводимом ниже примере используется ORM [Prisma](https://my-js.org/docs/guide/prisma).

```ts
import { initTRPC } from '@trpc/server'
import { Context } from './[trpc]';

export const t = initTRPC.create()

export const appRouter = t.router({
  infinitePosts: t
    .procedure
    .input(z.object({
      limit: z.number().min(1).max(100).nullish(),
      cursor: z.number().nullish(), // курсор может иметь любой тип
    }))
    .query(({ input }) => {
      const limit = input.limit ?? 50;
      const { cursor } = input;
      const items = await prisma.post.findMany({
        take: limit + 1, // получаем дополнительный элемент, который будет использоваться в качестве следующего курсора
        where: {
          title: {
            contains: 'Prisma' // опциональный фильтр
          },
        },
        cursor: cursor ? { myCursor: cursor } : undefined,
        orderBy: {
          myCursor: 'asc',
        },
      })
      let nextCursor: typeof cursor | undefined = undefined;
      if (items.length > limit) {
        const nextItem = items.pop()
        nextCursor = nextItem!.myCursor;
      }

      return {
        items,
        nextCursor,
      };
    })
})
```

```tsx
import { trpc } from '../utils/trpc';

export function MyComponent() {
  const infiniteQuery = trpc.infinitePosts.useInfiniteQuery(
    {
      limit: 10,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      // initialCursor: 1, // можно установить начальный курсор
    },
  );

  // ...
}
```

__Утилиты__

_getInfiniteData()_

Данная утилита возвращает кэшированные данные запроса:

```ts
import { trpc } from '../utils/trpc';

export function MyComponent() {
  const utils = trpc.useContext();

  const myMutation = trpc.infinitePosts.add.useMutation({
    async onMutate({ post }) {
      await utils.infinitePosts.cancel();
      const allPosts = utils.infinitePosts.getInfiniteData({ limit: 10 });
      // ...
    },
  });
}
```

_setInfiniteData()_

Данная утилита обновляет кэшированные данные запроса:

```ts
import { trpc } from '../utils/trpc';

export function MyComponent() {
  const utils = trpc.useContext();

  const myMutation = trpc.infinitePosts.delete.useMutation({
    async onMutate({ post }) {
      await utils.infinitePosts.cancel();

      utils.infinitePosts.setInfiniteData({ limit: 10 }, (data) => {
        if (!data) {
          return {
            pages: [],
            pageParams: [],
          };
        }

        return {
          ...data,
          pages: data.pages.map((page) => ({
            ...page,
            items: page.items.filter((item) => item.status === 'published'),
          })),
        };
      });
    },
  });

  // ...
}
```

### useContext()

Хук `useContext()` (не путать со встроенным хуком React) предоставляет доступ к утилитам для управления кэшированными данными запросов tRPC. Эти утилиты являются обертками методов `queryClient` React Query.

__Использование__

`useContext()` возвращает объект со всеми запросами, определенными в роутерах. Этот объект используется по аналогии с объектом клиента `trpc`. Предположим, что в роутере `post` определен запрос `all`:

```ts
import { initTRPC } from '@trpc/server';
import { z } from 'zod';
 
const t = initTRPC.create();
 
const appRouter = t.router({
  post: t.router({
    all: t.procedure.query(() => {
      return {
        posts: [
          { id: 1, title: 'Первый пост' },
          { id: 2, title: 'Второй пост' },
        ],
      };
    }),
  }),
});
 
export type AppRouter = typeof appRouter;
```

Получаем доступ к утилитам этого запроса в компоненте:

```tsx
function MyComponent() {
  const utils = trpc.useContext();
  utils.post.all.f // fetch, fetchInfinite
  // ...
}
```

[Список утилит, предоставляемых `useContext()`](https://trpc.io/docs/useContext#helpers).

__Прокси-клиент__

`useContext()` также позволяет получить доступ к проксированому клиенту, что позволяет вызывать процедуры с помощью `async/await` без создания дополнительного клиента на чистом TS:

```tsx
import { trpc } from '../utils/trpc';

function MyComponent() {
  const [apiKey, setApiKey] = useState();
  const utils = trpc.useContext();

  return (
    <Form
      handleSubmit={async (event) => {
        const apiKey = await utils.client.apiKey.create.mutate(event);
        setApiKey(apiKey);
      }}
    >
      // ...
    </Form>
  );
}
```

__Инвалидация запросов__

Утилита `invalidate()` позволяет инвалидировать запросы (обновлять кэшированные данные). Данная утилита доступна на любом уровне. Это означает, что инвалидироваться могут как отдельные запросы, так и весь роутер.

_Инвалидация отдельного запроса_

```ts
import { trpc } from '../utils/trpc';

function MyComponent() {
  const utils = trpc.useContext();

  const mutation = trpc.post.edit.useMutation({
    onSuccess(input) {
      utils.post.all.invalidate();
      utils.post.byId.invalidate({ id: input.id }); // запросы для других id инвалидироваться не будут
    },
  });

  // ...
}
```

_Инвалидация всех роутеров_

```ts
import { initTRPC } from '@trpc/server';
import { z } from 'zod';

export const t = initTRPC.create();

export const appRouter = t.router({
  post: t.router({
    all: t.procedure.query(() => {
      return {
        posts: [
          { id: 1, title: 'Первый пост' },
          { id: 2, title: 'Второй пост' },
        ],
      };
    }),
    byId: t.procedure
      .input(
        z.object({
          id: z.string(),
        }),
      )
      .query(({ input }) => {
        return {
          post: { id: input?.id, title: 'Горизонт событий' },
        };
      }),
    edit: t.procedure
      .input(z.object({ id: z.number(), title: z.string() }))
      .mutation(({ input }) => {
        return { post: { id: input.id, title: input.title } };
      }),
  }),
  user: t.router({
    all: t.procedure.query(() => {
      return { users: [{ name: 'Ричард Фейнман' }, { name: 'Стивен Хокинг' }] };
    }),
  }),
});
```

```ts
import { trpc } from '../utils/trpc';

function MyComponent() {
  const utils = trpc.useContext();

  const invalidateAllQueriesAcrossAllRouters = () => {
    // 1️⃣
    // Будут инвалидированы все запросы всех роутеров
    utils.invalidate();
  };

  const invalidateAllPostQueries = () => {
    // 2️⃣
    // Будут инвалидированы все запросы постов
    utils.post.invalidate();
  };

  const invalidatePostById = () => {
    // 3️⃣
    // Будут инвалидированы все запросы роутера постов с входными данными `{ id: 1 }`
    utils.post.byId.invalidate({ id: 1 });
  };

  // Примеры запросов
  trpc.user.all.useQuery(); // только 1️⃣
  trpc.post.all.useQuery(); // 1️⃣ и 2️⃣
  trpc.post.byId.useQuery({ id: 1 }); // 1️⃣, 2️⃣ и 3️⃣
  trpc.post.byId.useQuery({ id: 2 }); // 1️⃣ и 2️⃣, но не 3️⃣

  // ...
}
```

__Инвалидация всего кэша при каждой мутации__

```ts
export const trpc = createTRPCReact<AppRouter, SSRContext>({
  unstable_overrides: {
    useMutation: {
      /**
       * Данная функция вызывается при успехе любой мутации
       **/
      async onSuccess(opts) {
        /**
         * @note такой порядок позволяет избежать вспышки контента (content flush)
         * во время перенаправления (redirection)
         **/

        // Вызываем `onSuccess()`, определенный в настройках`useQuery()`
        await opts.originalFn();

        // Инвалидируем все запросы
        await opts.queryClient.invalidateQueries();
      },
    },
  },
});
```

__Дополнительные настройки__

```ts
interface ProxyTRPCContextProps<TRouter extends AnyRouter, TSSRContext> {
  client: TRPCClient<TRouter>;
  /**
   * Контекст SSR при применении серверного рендеринга
   * @default null
   */
  ssrContext?: TSSRContext | null;
  /**
   * Состояние гидратации SSR
   * - `false`, если SSR не применяется
   * - `prepass` при подготовке к получению данных запроса
   * - `mounting` перед рендерингом `TRPCProvider` на клиенте
   * - `mounted` после рендеринга `TRPCProvider` на клиенте
   * @default false
   */
  ssrState?: SSRState;
  /**
   * Прерывание запросов при размонтировании компонента,
   * например, при переходе на другую страницу
   * @default false
   */
  abortOnUnmount?: boolean;
}
```

### useQueries()

Хук `useQueries()` предназначен для получения нескольких запросов за один раз.

__Использование__

Использование `useQueries()` похоже на использование одноименного хука React Query. Единственное отличие состоит в том, что он принимает функцию, возвращающую массив запросов:

```ts
const Component = (props: { postIds: string[] }) => {
  const postQueries = trpc.useQueries((t) =>
    props.post.byIds.map((id) => t.post.byId({ id })),
  );

  // ...
};
```

__Настройки отдельных запросов__

Каждому запросу в массиве можно передавать дополнительные настройки (`enabled`, `suspense`, `refetchOnWindowFocus` и т.д.):

```ts
const Component = () => {
  const [post, greeting] = trpc.useQueries((t) => [
    t.post.byId({ id: '1' }, { enabled: false }),
    t.greeting({ name: 'народ' }),
  ]);

  const onButtonClick = () => {
    post.refetch();
  };

  return (
    <div>
      <h1>{post.data && post.data.title}</h1>
      <p>{greeting.data.message}</p>
      <button onClick={onButtonClick}>Получить данные</button>
    </div>
  );
};
```

__Контекст__

В качестве второго параметра `useQueries()` принимает объект контекста, который перезаписывает дефолтный контекст:

```ts
const [post, greeting] = trpc.useQueries(
  (t) => [t.post.byId({ id: '1' }), t.greeting({ name: 'народ' })],
  myCustomContext,
);
```

### getQueryKey()

Утилита `getQueryKey()` предназначена для получения правильного ключа кэша.

```ts
// Запросы
function getQueryKey(
  procedure: AnyQueryProcedure,
  input?: DeepPartial<TInput>,
  type?: QueryType; // @default 'any'
): TRPCQueryKey;

// Роутеры
function getQueryKey(
  router: AnyRouter,
): TRPCQueryKey;

// Мутации
function getQueryKey(
  procedure: AnyMutationProcedure,
): TRPCQueryKey;

type QueryType = "query" | "infinite" | "any";
// для `useQuery` ──┘          │          │
// для `useInfiniteQuery` ─────┘          │
// для всех ──────────────────────────────┘
```

```tsx
import { useIsFetching, useQueryClient } from '@tanstack/react-query';
import { getQueryKey } from '@trpc/react-query';
import { trpc } from '~/utils/trpc';

function MyComponent() {
  const queryClient = useQueryClient();

  const posts = trpc.post.list.useQuery();

  // Определяем, находится ли запрос в процессе выполнения
  const postListKey = getQueryKey(trpc.post.list, undefined, 'query');
  const isFetching = useIsFetching(postListKey);

  // Устанавливаем настройки по умолчанию для роутера
  const postKey = getQueryKey(trpc.post);
  queryClient.setQueryDefaults(postKey, { staleTime: 30 * 60 * 1000 });

  // ...
}
```

## [@trpc/next](https://www.npmjs.com/package/@trpc/next)

Использованию tRPC с Next.js в этом руководстве уделяется особое внимание, поскольку на сегодняшний день Next.js является фреймворком №1 для создания веб-приложений любого размера и сложности.

### Использование с Next.js

Next.js позволяет разрабатывать клиента и сервер с помощью одной кодовой базы. tRPC облегчает обмен типами между ними, обеспечивая типобезопасность получения данных.

__Рекомендуемая структура файлов__

```
├── prisma  # <-- если используется prisma
│   └── ...
├── src
│   ├── pages
│   │   ├── _app.tsx  # <-- здесь используется HOC `withTRPC()`
│   │   ├── api
│   │   │   └── trpc
│   │   │       └── [trpc].ts  # <-- обработчик HTTP-запросов tRPC
│   │   └── ...
│   ├── server
│   │   ├── routers
│   │   │   ├── _app.ts  # <-- основной роутер приложения
│   │   │   ├── post.ts  # <-- дочерние роутеры
│   │   │   └── ...
│   │   ├── context.ts   # <-- контекст приложения
│   │   └── trpc.ts      # <-- утилиты процедур
│   └── utils
│       └── trpc.ts  # <-- типобезопасные хуки tRPC
└── ...
```

[Готовые шаблоны](https://trpc.io/docs/starter-projects).

__Добавление tRPC в существующий проект Next.js__

1. Устанавливаем зависимости:

```bash
yarn add @trpc/server @trpc/client @trpc/react-query @trpc/next @tanstack/react-query zod
```

2. Включаем строгий режим (для zod):

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true
  }
}
```

или хотя бы:

```json
// tsconfig.json
{
  "compilerOptions": {
    "strictNullChecks": true
  }
}
```

3. Создаем роутер tRPC:

```ts
// @filename: server/trpc.ts
import { initTRPC } from '@trpc/server';

const t = initTRPC.create();

export const router = t.router;
export const procedure = t.procedure;
```

```ts
// @filename: server/routers/_app.ts
import { z } from 'zod';
import { procedure, router } from '../trpc';

export const appRouter = router({
  hello: procedure
    .input(
      z.object({
        who: z.string(),
      }),
    )
    .query(({ input }) => {
      return {
        greeting: `привет, ${input.who}`,
      };
    }),
});

export type AppRouter = typeof appRouter;
```

```ts
// @filename: pages/api/trpc/[trpc].ts
import * as trpcNext from '@trpc/server/adapters/next';
import { appRouter } from '../../../server/routers/_app';

export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext: () => ({}),
});
```

4. Создаем хуки tRPC:

```ts
import { httpBatchLink } from '@trpc/client';
import { createTRPCNext } from '@trpc/next';
import type { AppRouter } from '../server/routers/_app';

function getBaseUrl() {
  if (typeof window !== 'undefined')
    // Браузер должен использовать относительный путь
    return '';

  if (process.env.VERCEL_URL)
    // Ссылка на vercel.com
    return `https://${process.env.VERCEL_URL}`;

  if (process.env.RENDER_INTERNAL_HOSTNAME)
    // Ссылка на render.com
    return `http://${process.env.RENDER_INTERNAL_HOSTNAME}:${process.env.PORT}`;

  // Ссылка на localhost
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export const trpc = createTRPCNext<AppRouter>({
  config({ ctx }) {
    return {
      links: [
        httpBatchLink({
          /**
           * Полный URL сервера нужен для того, чтобы использовать SSR
           * @link https://trpc.io/docs/ssr
           **/
          url: `${getBaseUrl()}/api/trpc`,
        }),
      ],
      /**
       * @link https://tanstack.com/query/v4/docs/reference/QueryClient
       **/
      // queryClientConfig: { defaultOptions: { queries: { staleTime: 60 } } },
    };
  },
  /**
   * @link https://trpc.io/docs/ssr
   **/
  ssr: false,
});
```

5. Настраиваем `_app.tsx`:

```tsx
import type { AppType } from 'next/app';
import { trpc } from '../utils/trpc';

const MyApp: AppType = ({ Component, pageProps }) => {
  return <Component {...pageProps} />;
};

export default trpc.withTRPC(MyApp);
```

6. Отправляем запрос:

```tsx
import { trpc } from '../utils/trpc';

export default function IndexPage() {
  const hello = trpc.hello.useQuery({ who: 'клиент' });

  if (!hello.data) {
    return <div>Загрузка...</div>;
  }
  return (
    <div>
      <p>{hello.data.greeting}</p>
    </div>
  );
}
```

__Настройки `createTRPCNext()`__

- `config`: функция, возвращающая объект с настройками клиентов tRPC и React Query. Она получает аргумент `ctx`, который среди прочего позволяет получить доступ к объекту `req` Next.js. Возвращаемое значение может содержать следующие свойства:

  - обязательные:
    - `links` для кастомизации потока данных между клиентом и сервером tRPC
  - опциональные:
    - `queryClientConfig`: настройки для `QueryClient` React Query, который используется хуками tRPC
    - `queryClient`: экземпляр `QueryClient`
    - `transformer`: преобразователь, применяемый к исходящим данным
    - `abortOnUnmount`: индикатор прерывания запросов при размонтировании компонента

- `ssr = false`: индикатор, определяющий, должен ли tRPC ждать разрешения запросов при серверном рендеринге страницы
- `responseMeta`: функция, позволяющая устанавливать заголовки и статус запроса при серверном рендеринге

```ts
import { createTRPCNext } from '@trpc/next';
import type { AppRouter } from '../pages/api/trpc/[trpc]';

export const trpc = createTRPCNext<AppRouter>({
  config({ ctx }) {
    // ...
  },
  ssr: true,
  responseMeta({ clientErrors, ctx }) {
    if (clientErrors.length) {
      return {
        status: clientErrors[0].data?.httpStatus ?? 500,
      };
    }

    const ONE_DAY_IN_SECONDS = 60 * 60 * 24;

    return {
      'Cache-Control': `s-maxage=1, stale-while-revalidate=${ONE_DAY_IN_SECONDS}`,
    };
  },
});
```

### Рендеринг на стороне сервера

Для включения SSR достаточно указать `ssr: true` в `createTRPCNext()`.

_Обратите внимание_: в этом режиме tRPC будет использовать `getInitialProps()` для предварительного выполнения (prefetch) всех запросов. Это может привести к проблемам вроде [этой](https://github.com/trpc/trpc/issues/596) при использовании `getServerSideProps()`. В качестве альтернативы можно оставить SSR отключенным и использовать утилиты SSG для предварительного выполнения запросов в `getStaticProps()` и `getServerSideProps()`.

Рассмотрим пример кэширования ответов в режиме SSR:

```ts
import { httpBatchLink } from '@trpc/client';
import { createTRPCNext } from '@trpc/next';
import superjson from 'superjson';
import type { AppRouter } from '~/api/trpc/[trpc]';

export const trpc = createTRPCNext<AppRouter>({
  config({ ctx }) {
    if (typeof window !== 'undefined') {
      // Клиентские запросы
      return {
        transformer: superjson, // опционально: добавляем `superjson` для сериализации
        links: [
          httpBatchLink({
            url: '/api/trpc',
          }),
        ],
      };
    }

    return {
      transformer: superjson,
      links: [
        httpBatchLink({
          // Серверу требуется полный URL
          url: `${getBaseUrl()}/api/trpc`,
          /**
           * Устанавливаем кастомные заголовки для каждого запроса
           * @link https://trpc.io/docs/v10/header
           */
          headers() {
            if (ctx?.req) {
              // В случае с SSR, заголовки клиента должны перенаправляться на сервер

              // При использовании Node.js 18, необходимо удалить заголовок `connection`
              const {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                connection: _connection,
                ...headers
              } = ctx.req.headers;
              return {
                ...headers,
                // Опционально: информируем сервер о выполнении SSR-запроса
                'x-ssr': '1',
              };
            }
            return {};
          },
        }),
      ],
    };
  },
  ssr: true,
});
```

```tsx
import type { AppProps } from 'next/app';
import React from 'react';
import { trpc } from '~/utils/trpc';

const MyApp: AppType = ({ Component, pageProps }: AppProps) => {
  return <Component {...pageProps} />;
};

export default trpc.withTRPC(MyApp);
```

### Генерация статического контента

При генерации статического контента запросы tRPC должны выполняться в `getStaticProps()` на каждой странице.

```tsx
import { createProxySSGHelpers } from '@trpc/react-query/ssg';
import {
  GetStaticPaths,
  GetStaticPropsContext,
  InferGetStaticPropsType,
} from 'next';
import { prisma } from 'server/context';
import { appRouter } from 'server/routers/_app';
import superjson from 'superjson';
import { trpc } from 'utils/trpc';

export async function getStaticProps(
  context: GetStaticPropsContext<{ id: string }>,
) {
  const ssg = await createProxySSGHelpers({
    router: appRouter,
    ctx: {},
    transformer: superjson, // опционально
  });
  const id = context.params?.id as string;

  // Предварительно выполняем запрос `post.byId`
  await ssg.post.byId.prefetch({ id });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      id,
    },
    revalidate: 1,
  };
}

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await prisma.post.findMany({
    select: {
      id: true,
    },
  });

  return {
    paths: posts.map((post) => ({
      params: {
        id: post.id,
      },
    })),
    // https://nextjs.org/docs/api-reference/data-fetching/get-static-paths#fallback-blocking
    fallback: 'blocking',
  };
};

export default function PostViewPage(
  props: InferGetStaticPropsType<typeof getStaticProps>,
) {
  const { id } = props;
  const postQuery = trpc.post.byId.useQuery({ id });

  if (postQuery.status !== 'success') {
    // Код в этом блоке никогда не выполнится, поскольку используется `fallback: "blocking"`
    return <h2>Загрузка...</h2>;
  }

  const { data } = postQuery;

  return (
    <>
      <h1>{data.title}</h1>
      <em>Дата создания: {data.createdAt.toLocaleDateString('ru-ru')}</em>

      <p>{data.text}</p>

      <h2>Данные:</h2>
      <pre>{JSON.stringify(data, null, 4)}</pre>
    </>
  );
}
```

### Утилиты SSG

Функция `createProxySSGHelpers()` возвращает набор утилит для предварительного выполнения запросов на сервере.

Использование этих утилит позволяет вызывать процедуры прямо на сервере без запросов HTTP по аналогии с вызовами на стороне сервера. Это также означает, что нам не нужны объекты запроса и ответа под рукой. Убедитесь, что инстанциируете утилиты контектом, не содержащим `req` и `res`. В этом сценарии рекомендуется использовать концепцию "внутреннего" и "внешнего" контекстов.

```ts
import { createProxySSGHelpers } from '@trpc/react-query/ssg';
import { createContext } from './server/context';

const ssg = createProxySSGHelpers({
  router: appRouter,
  ctx: await createContext(),
  transformer: superjson, // опционально
});
```

__Пример использования в проекте Next.js__

```tsx
import { createProxySSGHelpers } from '@trpc/react-query/ssg';
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { createContext } from 'server/context';
import { appRouter } from 'server/routers/_app';
import superjson from 'superjson';
import { trpc } from 'utils/trpc';

export async function getServerSideProps(
  context: GetServerSidePropsContext<{ id: string }>,
) {
  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: await createContext(),
    transformer: superjson,
  });
  const id = context.params?.id as string;

  /*
   * Предварительно выполняем запрос `post.byId`
   * `prefetch` не возвращает результаты и не выбрасывает исключения
   */
  await ssg.post.byId.prefetch({ id });

  // Обязательно должно возвращаться `{ props: { trpcState: ssg.dehydrate() } }`
  return {
    props: {
      trpcState: ssg.dehydrate(),
      id,
    },
  };
}

export default function PostViewPage(
  props: InferGetServerSidePropsType<typeof getServerSideProps>,
) {
  const { id } = props;

  // Запрос будет выполнен сразу благодаря `prefetch`
  const postQuery = trpc.post.byId.useQuery({ id });

  const { data } = postQuery;

  return (
    <>
      <h1>{data.title}</h1>
      <em>Дата создания: {data.createdAt.toLocaleDateString()}</em>

      <p>{data.text}</p>

      <h2>Данные:</h2>
      <pre>{JSON.stringify(data, null, 4)}</pre>
    </>
  );
}
```
