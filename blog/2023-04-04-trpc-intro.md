---
slug: trpc-intro
title: Знакомьтесь, tRPC
description: Краткий обзор возможностей tRPC
authors: harryheman
tags: [javascript, js, typescript, ts, node.js, nodejs, trpc, api]
---

Hello, world!

В этом туториале мы разработаем простое типобезопасное (typesafe) клиент-серверное (fullstack) приложение с помощью [tRPC](https://trpc.io/docs/), [React](https://react.dev/) и [Express](https://expressjs.com/ru/).

tRPC позволяет разрабатывать полностью безопасные с точки зрения типов API для клиент-серверных приложений (предпочтительной является архитектура монорепозитория). Это посредник между сервером и клиентом, позволяющий им использовать один маршрутизатор (роутер) для обработки запросов HTTP. Использование одного роутера, в свою очередь, обуславливает возможность автоматического вывода типов (type inference) входящих и исходящих данных (input/output), что особенно актуально для клиента и позволяет избежать дублирования типов или использования общих (shared) типов.

Для тех, кого интересует только код, вот [ссылка на соответствующий репозиторий](https://github.com/harryheman/blog-posts/tree/master/trpc-fullstack-app).

<!--truncate-->

## Подготовка и настройка проекта

Функционал нашего приложения будет следующим:

- на сервере хранится массив с данными пользователей;
- на сервере есть конечные точки (endpoints) для:
  - получения всех пользователей;
  - получения одного пользователя по идентификатору;
  - создания нового пользователя;
- клиент запрашивает всех пользователей и рендерит список их имен;
- на клиенте есть форма для запроса одного пользователя по ID;
- на клиенте есть форма для создания нового пользователя.

Как видите, все очень просто. Давайте это реализуем.

---

Архитектура монорепозитория предполагает, что код клиента и сервера "живет" в одной директории (репозитории).

Создаем корневую директорию:

```bash
mkdir trpc-fullstack-app
cd trpc-fullstack-app
```

Создаем директорию для сервера:

```bash
mkdir server
cd server
```

_Обратите внимание_: для работы с зависимостями будет использоваться [Yarn](https://yarnpkg.com/).

Инициализируем проект [Node.js](https://nodejs.org/):

```bash
yarn init -yp
```

Устанавливаем основные зависимости:

```bash
yarn add express cors
```

Поскольку клиент и сервер будут иметь разные источники (origins) (будут запускаться на разных портах), "общение" между ними будет блокироваться [CORS](https://developer.mozilla.org/ru/docs/Web/HTTP/CORS). Пакет [cors](https://www.npmjs.com/package/cors) позволяет настраивать эту политику.

Устанавливаем зависимости для разработки:

```bash
yarn add -D typescript @types/express @types/cors
```

Создаем файл `tsconfig.json` следующего содержания:

```json
{
  "compilerOptions": {
    "allowJs": false,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "module": "esnext",
    "moduleResolution": "node",
    // директория сборки
    "outDir": "./dist",
    // директория исходников
    "rootDir": "./src",
    "skipLibCheck": true,
    "strict": true,
    "target": "es2019"
  }
}
```

Редактируем файл `package.json`:

```json
{
  // ...
  // основной файл сервера
  "main": "dist/index.js",
  // модули ES
  "type": "module",
  "scripts": {
    // компиляция TS в JS с наблюдением за изменениями файлов
    "ts:watch": "tsc -w",
    // запуск сервера с перезагрузкой после изменений
    "node:dev": "nodemon",
    // одновременное выполнение команд
    // мы установим concurrently на верхнем уровне
    "start": "concurrently \"yarn ts:watch\" \"yarn node:dev\"",
    // производственная сборка
    "build": "tsc --build && node dist/index.js"
  }
}
```

Создаем директорию `src` и дальше работаем с ней.

Создаем файл `index.ts` следующего содержания:

```javascript
import express from 'express'
import cors from 'cors'

const app = express()

app.use(cors())

// адрес сервера: http://localhost:4000
app.listen(4000, () => {
  console.log('Server running on port 4000')
})
```

Определяем тип пользователя в файле `users/types.ts`:

```javascript
export type User = {
  id: string
  name: string
}
```

Создаем массив пользователей в файле `users/db.ts`:

```javascript
import type { User } from './types'

export const users: User[] = [
  {
    id: '0',
    name: 'John Doe',
  },
  {
    id: '1',
    name: 'Richard Roe',
  },
]
```

---

Возвращаемся в корневую директорию и создаем шаблон клиента с помощью [Vite](https://vitejs.dev/):

```bash
# client - название проекта/директории
# react-ts - используемый шаблон
yarn create vite client --template react-ts
```

Vite автоматически настраивает все необходимое, нашего участия в этом процессе не требуется 😊

_Обратите внимание_: клиент будет запускаться по адресу `http://localhost:5173`

---

Находясь в корневой директории, инициализируем проект Node.js устанавливаем [concurrently](https://www.npmjs.com/package/concurrently):

```bash
yarn init -yp
yarn add concurrently
```

Определяем в `package.json` команду для одновременного запуска сервера и клиента:

```json
{
  // ...
  "scripts": {
    "dev": "concurrently \"yarn --cwd ./server start\" \"yarn --cwd ./client dev\""
  }
}
```

Это все, что требуется для подготовки и настройки проекта. Переходим к доработке сервера.

## Сервер

Нам потребуется еще 2 пакета:

```bash
yarn add @trpc/server zod
```

- [@trpc/server](https://www.npmjs.com/package/@trpc/server) - пакет для разработки конечных точек и роутеров;
- [zod](https://github.com/colinhacks/zod) - пакет для валидации данных.

Далее работаем с директорией `src`.

Создаем файл `trpc.ts` с кодом [инициализации tRPC](https://trpc.io/docs/router#initialize-trpc):

```javascript
import { initTRPC } from '@trpc/server'
import type { Context } from './context'

const t = initTRPC.context<Context>().create()

export const router = t.router
export const publicProcedure = t.procedure
```

Определяем [контекст tRPC](https://trpc.io/docs/context) в файле `context.ts`:

```javascript
import { inferAsyncReturnType } from '@trpc/server'
import * as trpcExpress from '@trpc/server/adapters/express'

const createContext = ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => {
  return {}
}

export type Context = inferAsyncReturnType<typeof createContext>

export default createContext
```

Определяем [корневой роутер/роутер приложения tRPC](https://trpc.io/docs/router#defining-a-router) в файле `router.ts`:

```javascript
import { router } from './trpc.js'
import userRouter from './user/router.js'

const appRouter = router({
  user: userRouter,
})

export default appRouter
```

Для подключения tRPC к серверу используется [обработчик запросов или адаптер](https://trpc.io/docs/api-handler). Редактируем файл `index.ts`:

```javascript
// ...
import * as trpcExpress from '@trpc/server/adapters/express'
import appRouter from './router.js'
import createContext from './context.js'

// ...
app.use(cors())

app.use(
  // суффикс пути
  // получаем http://localhost:4000/trpc
  '/trpc',
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
)

// ...

// обратите внимание: экспортируется не сам роутер, а только его тип
export type AppRouter = typeof appRouter
```

Наконец, определяем конечные точки пользователей в файле `users/router.ts`:

```javascript
import { z } from 'zod'
import { router, publicProcedure } from '../trpc.js'
import { users } from './db.js'
import type { User } from './types'
import { TRPCError } from '@trpc/server'

const userRouter = router({
  // обработка запроса на получение всех пользователей
  // выполняем запрос (query)
  getUsers: publicProcedure.query(() => {
    // просто возвращаем массив
    return users
  }),
  // обработка запроса на получение одного пользователя по ID
  getUserById: publicProcedure
    // валидация тела запроса
    // ID должен быть строкой
    .input((val: unknown) => {
      if (typeof val === 'string') return val

      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: `Invalid input: ${typeof val}`,
      })
    })
    .query((req) => {
      const { input } = req

      // ищем пользователя
      const user = users.find((u) => u.id === input)

      // если не нашли, выбрасываем исключение
      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `User with ID ${input} not found`,
        })
      }

      // если нашли, возвращаем его
      return user
    }),
  // обработка создания нового пользователя
  createUser: publicProcedure
    // тело запроса должно представлять собой объект с полем `name`,
    // значением которого должна быть строка
    .input(z.object({ name: z.string() }))
    // выполняем мутацию
    .mutation((req) => {
      const { input } = req

      // создаем пользователя
      const user: User = {
        id: `${Date.now().toString(36).slice(2)}`,
        name: input.name,
      }

      // добавляем его в массив
      users.push(user)

      // и возвращаем
      return user
    }),
})

export default userRouter
```

Финальная структура директории `server`:

```
- node_modules
- src
  - user
    - db.ts
    - router.ts
    - types.ts
  - context.ts
  - index.ts
  - router.ts
  - trpc.ts
- package.json
- tsconfig.json
- yarn.lock
```

Наш сервер полностью готов к обработке запросов клиента.

## Клиент

Здесь нам также потребуется еще 2 пакета.

```bash
# client
yarn add @trpc/client @trpc/server
```

Возможно, мы могли установить `@trpc/server` на верхнем уровне 😏

Далее работаем с директорией `src`.

Создаем файл `trpc.ts` с кодом инициализации tRPC:

```javascript
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'
// здесь могут возникнуть проблемы при использовании синонимов путей (type aliases)
import { AppRouter } from '../../server/src/index'

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:4000/trpc',
    }),
  ],
})
```

Для начала давайте просто выведем список пользователь в консоль инструментов разработчика в браузере. Редактируем файл `App.tsx` следующим образом:

```javascript
import { useEffect } from 'react'
import { trpc } from './trpc'

function App() {
  useEffect(() => {
    trpc.user.getUsers.query()
      .then(console.log)
      .catch(console.error)
  }, [])

  return (
    <div></div>
  )
}

export default App
```

Запускаем приложение. Это можно сделать 2 способами:

- выполнить команду `yarn dev` из корневой директории;
- выполнить команду `yarn start` из директории `server` и команду `yarn dev` из директории `client`.

Результат:

<img src="https://habrastorage.org/webt/mc/bz/ug/mcbzuguznhmyae3lioqnrdwphfg.png" />
<br />

Многим React-разработчикам (и мне, в том числе) нравится библиотека [React Query](https://react-query-v3.tanstack.com/), позволяющая легко получать, кэшировать и модифицировать данные. К счастью, tRPC предоставляет абстракцию над React Query. Устанавливаем еще 2 пакета:

```bash
yarn add @tanstack/react-query @trpc/react-query
```

Редактируем файл `trpc.ts`:

```javascript
import { createTRPCReact, httpBatchLink } from '@trpc/react-query'
import { AppRouter } from '../../server/src/index'

export const trpc = createTRPCReact<AppRouter>()

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: 'http://localhost:4000/trpc',
    }),
  ],
})
```

Редактируем файл `main.tsx`:

```javascript
// ...
import App from './App'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { trpc, trpcClient } from './trpc'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </trpc.Provider>
  </React.StrictMode>,
)
```

Получим пользователей и отрендерим их имена в `App.tsx`:

```javascript
function App {
  const {
    data: usersData,
    isLoading: isUsersLoading,
  } = trpc.user.getUsers.useQuery()

  if (isUsersLoading) return <div>Loading...</div>

  return (
    <div>
      <ul>
        {(usersData ?? []).map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  )
}
```

Результат:

<img src="https://habrastorage.org/webt/yy/xy/v-/yyxyv-_5_5mvoqynheliw-h_rlo.png" />
<br />

Добавляем форму для получения одного пользователя по ID:

```javascript
function App() {
  // ...

  const [userId, setUserId] = useState('0')
  const {
    data: userData,
    isLoading: isUserLoading,
    error,
  } = trpc.user.getUserById.useQuery(userId, {
    retry: false,
    refetchOnWindowFocus: false,
  })

  if (isUsersLoading || isUserLoading) return <div>Loading...</div>

  const getUserById: React.FormEventHandler = (e) => {
    e.preventDefault()
    const input = (e.target as HTMLFormElement).elements[0] as HTMLInputElement
    const userId = input.value.replace(/\s+/g, '')
    if (userId) {
      // обновление состояния ID пользователя приводит к выполнению нового/повторного запроса
      setUserId(userId)
    }
  }

  return (
    <div>
      {/* ... */}
      <div>
        <form onSubmit={getUserById}>
          <label>
            Get user by ID <input type='text' defaultValue={userId} />
          </label>
          <button>Get</button>
        </form>
        {/* Если пользователь найден */}
        {userData && <div>{userData.name}</div>}
        {/* Если пользователь не найден */}
        {error && <div>{error.message}</div>}
      </div>
    </div>
  )
}
```

Результат:

<img src="https://habrastorage.org/webt/du/rz/8r/durz8rvo2slpiaqroicuat4fj3s.png" />
<img src="https://habrastorage.org/webt/z2/3a/4w/z23a4wco7ye4qx3nxsy0dh4vhms.png" />
<br />

Наконец, добавляем форму для создания нового пользователя:

```javascript
function App() {
  const {
    data: usersData,
    isLoading: isUsersLoading,
    // метод для ручного повторного выполнения запроса
    refetch,
  } = trpc.user.getUsers.useQuery()

  // ...

  // Состояние для имени пользователя
  const [userName, setUserName] = useState('Some Body')
  // Мутация для создания пользователя
  const createUserMutation = trpc.user.createUser.useMutation({
    // После выполнения мутации необходимо повторно запросить список пользователей
    onSuccess: () => refetch(),
  })

  // ...

  // Обработка отправки формы для создания нового пользователя
  const createUser: React.FormEventHandler = (e) => {
    e.preventDefault()
    const name = userName.trim()
    if (name) {
      createUserMutation.mutate({ name })
      setUserName('')
    }
  }

  return (
    <div>
      {/* ... */}
      <form onSubmit={createUser}>
        <label>
          Create new user{' '}
          <input
            type='text'
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
        </label>
        <button>Create</button>
      </form>
    </div>
  )
}
```

Результат:

<img src="https://habrastorage.org/webt/z0/ww/cg/z0wwcgz4lvf_yffsviwdblvaihc.png" />
<br />

На этом разработку нашего приложения можно считать завершенной.

Надеюсь, вы узнали что-то новое и не зря потратили время.

Happy coding!
