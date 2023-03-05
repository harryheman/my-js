---
slug: service-worker-access-token
title: Хранение токена доступа в сервис-воркере
description: Хранение токена доступа в сервис-воркере
authors: harryheman
tags: [javascript, typescript, react, next.js, service worker, access token, authentication, authorization, сервис-воркер, токен доступа, аутентификация, авторизация]
---

Привет, друзья!

На днях прочитал [эту интересную статью](https://habr.com/ru/post/710552/), посвященную различным вариантам хранения токена доступа (access token) на клиенте. Мое внимание привлек вариант с использованием [сервис-воркера (service worker)](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API) (см. "Подход 4. Использование service worker"), поскольку я даже не задумывался о таком способе применения этого интерфейса.

СВ - это посредник между клиентом и сервером (своего рода прокси-сервер), который позволяет перехватывать запросы и ответы и модифицировать их тем или иным образом. Он запускается в отдельном контексте, работает в отдельном потоке и не имеет доступа к DOM. Клиент также не имеет доступа к СВ и хранимым в нем данным. Как правило, СВ используется для обеспечения работы приложения в режиме офлайн посредством кэширования критически важных для работы приложения ресурсов.

В этой статье я покажу, как реализовать простой сервис аутентификации на основе [JSONWebToken](https://jwt.io/) и [HTTP Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies) с хранением токена доступа в сервис-воркере.

Для тех, кого интересует только код, [вот ссылка на соответствующий репозиторий](https://github.com/harryheman/Blog-Posts/tree/master/access-token-service-worker).

<!--truncate-->

Для локального запуска проекта необходимо выполнить следующие команды:

```bash
# клонируем репозиторий
git init my-project
cd my-project
git remote add origin https://github.com/harryheman/Blog-Posts/tree/master/access-token-service-worker
git config core.sparseCheckout true
git sparse-checkout set access-token-service-worker
git pull origin master

# переходим в директорию проекта
cd access-token-service-worker

# устанавливаем зависимости
yarn
# или
npm i

# генерируем публичный и приватный ключи для ассиметричного шифрования/декодирования токена идентификации
yarn gen
# или
npm run gen

# создаем файл .env и копируем в него содержимое файла .env.example
# значения переменных можно не менять
move .env.example .env

# запускаем сервер для разработки
yarn dev
# или
npm run dev
```

_Обратите внимание_: может потребоваться выполнить миграцию с помощью команды `npx prisma migrate dev --name init`, а также сгенерировать клиента Prisma с помощью команды `npx prisma generate`.

Для создания шаблона приложения использовался [Yarn](https://yarnpkg.com/) и [Create Next App](https://nextjs.org/docs/api-reference/create-next-app):

```bash
yarn create next-app access-token-service-worker --typescript
```

Структура проекта:

```
- prisma - схема, модели и миграции prisma
- public
  - sw.js - логика СВ
- src
  - components - компоненты
    - CreateTodoForm.tsx - форма для создания задачи
    - Footer.tsx - подвал
    - Header.tsx - шапка
    - TodoList.tsx - список задач
  - pages - страницы
    - api - "сервер"
      - auth - роуты аутентификации и авторизации
        - login.ts - роут авторизации
        - logout.ts - выхода из системы
        - register.ts - регистрации
        - user.ts - получения данных пользователя
      - todo.ts - создания и удаления задач
    - _app.tsx
    - _document.tsx
    - index.tsx - главная страница
    - login.tsx - страница авторизации
    - register.tsx - страница регистрации
  - styles - стили
  - utils - утилиты
    - authGuard.ts - посредник для проверки доступа к защищенным роутам
    - cookies.ts - посредник для работы с куки
    - formToObj.ts - утилита для преобразования данных формы в объект
    - generateKeys.js - утилита для генерации ключей
    - prisma.ts - клиент prisma
    - registerSW.ts - функция регистрации СВ
    - swr.ts - кастомные хуки swr
  - types.ts
- .env - переменные среды окружения
- environment.d.ts - их типы
- ... - другие файлы
```

Функционал приложения является очень простым: после регистрации/авторизации пользователь получает возможность создавать/удалять задачи. Данные о пользователях и задачах хранятся в реляционной базе данных [SQLite](https://sqlite.org/). Взаимодействие с БД осуществляется с помощью объектно-реляционного отображения [Prisma](https://www.prisma.io/).

---

Клиент может отправлять на сервер следующие запросы:

- `POST /api/auth/register` - запрос на регистрацию пользователя (запись данных пользователя в БД). Тело запроса:
  - `email: string` - адрес электронной почты;
  - `password: string` - пароль;
- `POST /api/auth/login` - запрос на авторизацию (вход в систему) пользователя. Тело запроса такое же;
- `GET /api/auth/logout` - запрос на выход пользователя из системы;
- `GET /api/auth/user` - запрос на получение данных зарегистрированного пользователя;
- `GET /api/todo` - получение задач пользователя;
- `POST /api/todo` - создание задачи. Тело запроса:
  - `title: string` - название задачи;
  - `content: string` - описание задачи;
- `DELETE /api/todo?id=<todo-id>` - запрос на удаление задачи. Строка запроса (query string) должна содержать id задачи.

Все роуты `/api/auth`, кроме `/api/auth/user`, являются открытыми (общедоступными или публичными). Все роуты `/api/todo` являются закрытыми (частными или приватными).

Все роуты `/api/auth`, кроме `/api/auth/logout`, возвращают данные пользователя и токен доступа. СВ перехватывает эти ответы, извлекает из тела ответа токен, записывает его в глобальную переменную и передает данные пользователя клиенту.

Все роуты `/api/todo` требуют наличия в объекте запроса заголовка авторизации с токеном доступа - `Authorization: Bearer <accessToken>`. Клиент отправляет запрос без токена. СВ перехватывает запрос и добавляет в него токен из глобальной переменной.

Роут `/api/auth/user` требует наличия куки с токеном идентификации. Куки хранится в браузере пользователя и прикрепляется к соответствующему запросу при его выполнении.

Таким образом, клиент ничего не знает ни о токене доступа, который хранится в СВ, ни о токене аутентификации, который хранится в куки, доступной только серверу.

---

Рассмотрим процесс регистрации пользователя.

1. Пользователь заполняет форму и отправляет данные на сервер (`pages/register.tsx`):

```javascript
import formToObj from '@/utils/formToObj'
import { useUser } from '@/utils/swr'
import { User } from '@prisma/client'
import { useRouter } from 'next/router'
import { useState } from 'react'

export default function Register() {
  const router = useRouter()
  const { mutateUser } = useUser()

  const [errors, setErrors] = useState<{
    email?: boolean
  }>({})

  const onSubmit: React.FormEventHandler = async (e) => {
    e.preventDefault()

    // получаем данные формы в виде объекта
    const formData = formToObj<Pick<User, 'email' | 'password'>>(
      e.target as HTMLFormElement
    )

    try {
      // выполняем запрос
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(formData)
      })

      if (!res.ok) {
        // пользователь уже зарегистрирован
        if (res.status === 409) {
          return setErrors({ email: true })
        }
        throw res
      }

      const userData = (await res.json()) as Pick<User, 'id' | 'email'>
      // инвалидируем кэш - обновляем информацию о пользователе
      mutateUser(userData)

      // выполняем перенаправление на главную страницу
      router.push('/')
    } catch (e) {
      console.error(e)
    }
  }

  const onInput = () => {
    setErrors({})
  }

  return (
    <>
      <form onSubmit={onSubmit} onInput={onInput}>
        <label>
          Email:{' '}
          <input
            type='email'
            name='email'
            pattern='[^@\s]+@[^@\s]+\.[^@\s]+'
            required
          />
          {errors.email && (
            <p style={{ color: 'red' }}>
              <small>Email already in use</small>
            </p>
          )}
        </label>
        <label>
          Password:{' '}
          <input type='password' name='password' minLength={6} required />{' '}
        </label>
        <button>Register</button>
      </form>
    </>
  )
}
```

2. Сервер записывает данные пользователя в БД, генерирует токен идентификации и записывает его в куки, а также создает токен доступа и возвращает данные пользователя и токен доступа (`pages/api/auth/register.ts`):

```javascript
import { NextApiHandlerWithCookie } from '@/types'
import cookies from '@/utils/cookies'
import prisma from '@/utils/prisma'
import { User } from '@prisma/client'
import argon2 from 'argon2'
import { readFileSync } from 'fs'
import jwt from 'jsonwebtoken'

// читаем содержимое закрытого ключа
const PRIVATE_KEY = readFileSync('./keys/private_key.pem', 'utf8')

const registerHandler: NextApiHandlerWithCookie = async (req, res) => {
  // извлекаем данные пользователя из тела запроса
  const data: Pick<User, 'email' | 'password'> = JSON.parse(req.body)

  try {
    // получаем данные пользователя
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    })

    // если данные имеются
    // значит, пользователь уже зарегистрирован
    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use' })
    }

    // хэшируем пароль
    const passwordHash = await argon2.hash(data.password)
    // заменяем оригинальный пароль на хэш
    data.password = passwordHash

    // создаем и получаем пользователя
    const newUser = await prisma.user.create({
      data,
      // без пароля
      select: {
        id: true,
        email: true
      }
    })

    // генерируем токен идентификации с помощью закрытого ключа
    const idToken = await jwt.sign({ userId: newUser.id }, PRIVATE_KEY, {
      // срок действия - 7 дней
      expiresIn: '7d',
      algorithm: 'RS256'
    })

    // генерируем токен доступа с помощью секретного значения из переменной среды окружения
    const accessToken = await jwt.sign(
      { userId: newUser.id },
      process.env.ACCESS_TOKEN_SECRET,
      {
        // срок действия - 1 час
        expiresIn: '1h'
      }
    )

    // записываем токен идентификации в куки,
    // которая недоступна на клиенте
    res.cookie({
      name: process.env.COOKIE_NAME,
      value: idToken,
      options: {
        // обязательно
        httpOnly: true,
        secure: true,
        // настоятельно рекомендуется
        sameSite: true,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        path: '/'
      }
    })

    // возвращаем данные пользователя и токен доступа
    res.status(200).json({
      user: newUser,
      accessToken
    })
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'User register error' })
  }
}

export default cookies(registerHandler)
```

Процесс авторизации выглядит похожим образом (см. `pages/login.tsx` и `pages/api/auth/login.ts`).

Что касается выхода пользователя из системы, то для реализации этого функционала достаточно отправить запрос на клиенте (`components/Header.tsx`) и удалить куки на сервере (`pages/api/auth/logout.ts`).

---

Рассмотрим процесс получения данных пользователя.

1. При запуске приложения на главной странице (`pages/index.tsx`) выполняется запрос к `/api/auth/user`:

```javascript
import CreateTodoForm from '@/components/CreateTodoForm'
import TodoList from '@/components/TodoList'
import { useUser } from '@/utils/swr'

export default function Home() {
  // запрашиваем данные пользователя
  const { user } = useUser()

  return (
    <>
      <h1>Welcome, {user ? user.email : 'stranger'}</h1>
      <CreateTodoForm />
      <TodoList />
    </>
  )
}
```

Получение данных пользователя и его задач реализовано с помощью кастомных хуков [SWR](https://swr.vercel.app/) (`utils/swr.ts`):

```javascript
import type { Todo, User } from '@prisma/client'
import useSWRImmutable from 'swr/immutable'

function fetcher<T>(
  input: RequestInfo | URL,
  init?: RequestInit | undefined
): Promise<T> {
  return fetch(input, init).then((res) => res.json())
}

// хук для получения данных пользователя
export function useUser() {
  const { data, error, mutate } = useSWRImmutable<Pick<User, 'id' | 'email'>>(
    '/api/auth/user',
    // обратите внимание, что мы указываем браузеру прикрепить к запросу куки
    // с помощью настройки `credentials: 'include'`
    (url) => fetcher(url, { credentials: 'include' }),
    {
      onErrorRetry(err, key, config, revalidate, revalidateOpts) {
        return false
      }
    }
  )

  if (error) {
    console.log(error)
  }

  return {
    user: data?.email ? data : undefined,
    mutateUser: mutate
  }
}

// хук для получения задач пользователя
export function useTodos(shouldFetch: boolean) {
  const { data, error, mutate } = useSWRImmutable<
    Pick<Todo, 'id' | 'title' | 'content'>[]
    // данный запрос выполняется только при наличии данных пользователя,
    // индикатором чего является `shouldFetch`
  >(shouldFetch ? '/api/todo' : null, (url) => fetcher(url), {
    onErrorRetry(err, key, config, revalidate, revalidateOpts) {
      return false
    }
  })

  if (error) {
    console.log(error)
  }

  return {
    todos: Array.isArray(data) ? data : [],
    mutateTodos: mutate
  }
}
```

2. Сервер извлекает id пользователя из куки, получает данные пользователя из БД, генерирует токен доступа и возвращает данные пользователя и токен доступа (`pages/api/auth/user.ts`):

```javascript
import prisma from '@/utils/prisma'
import { readFileSync } from 'fs'
import jwt from 'jsonwebtoken'
import { NextApiHandler } from 'next'

// читаем содержимое открытого ключа
const PUBLIC_KEY = readFileSync('./keys/public_key.pem', 'utf8')

const userHandler: NextApiHandler = async (req, res) => {
  // извлекаем токен идентификации из куки
  const idToken = req.cookies[process.env.COOKIE_NAME]
  // если токен отсутствует
  if (!idToken) {
    return res.status(401).json({ message: 'ID token must be provided' })
  }

  try {
    // декодируем токен с помощью открытого ключа
    const decodedToken = (await jwt.verify(idToken, PUBLIC_KEY)) as unknown as {
      userId: string
    }

    // если полезная нагрузка отсутствует
    if (!decodedToken || !decodedToken.userId) {
      return res.status(403).json({ message: 'Invalid token' })
    }

    // получаем данные пользователя на основе id из куки
    const user = await prisma.user.findUnique({
      where: { id: decodedToken.userId },
      // без пароля
      select: {
        id: true,
        email: true
      }
    })

    // если данные отсутствуют
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // генерируем токен доступа
    const accessToken = await jwt.sign(
      { userId: user.id },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: '1h'
      }
    )

    // возвращаем данные пользователя и токен доступа
    res.status(200).json({ user, accessToken })
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'User get error' })
  }
}

export default userHandler
```

Как видим, все роуты `/api/auth`, кроме `/api/auth/logout`, возвращают токен идентификации. Он не должен дойти до клиента! :)

---

Рассмотрим процесс создания и удаления задач.

Форма для создания задачи и список задач рендерятся на главной странице (`pages/index.tsx`).

Форма выглядит следующим образом (`components/CreateTodoForm.tsx`):

```javascript
import formToObj from '@/utils/formToObj'
import { useTodos, useUser } from '@/utils/swr'
import { Todo } from '@prisma/client'
import { useRef } from 'react'

export default function CreateTodoForm() {
  const { user } = useUser()
  const { todos, mutateTodos } = useTodos(Boolean(user))
  const formRef = useRef<HTMLFormElement | null>(null)

  if (!user) return null

  const onSubmit: React.FormEventHandler = async (e) => {
    e.preventDefault()
    // получаем данные формы в виде объекта
    const formData = formToObj<Pick<Todo, 'title' | 'content'>>(
      e.target as HTMLFormElement
    )

    try {
      // выполняем запрос на создание задачи
      const res = await fetch('/api/todo', {
        method: 'POST',
        body: JSON.stringify(formData)
      })
      if (!res.ok) throw res
      const newTodo = (await res.json()) as Pick<
        Todo,
        'id' | 'title' | 'content' | 'userId'
      >
      // инвалидируем кэш - обновляем список задач
      mutateTodos([...todos, newTodo])

      // сбрасываем форму
      if (formRef.current) {
        formRef.current.reset()
      }
    } catch (e) {
      console.log(e)
    }
  }

  return (
    <div>
      <h2>New Todo</h2>
      <form onSubmit={onSubmit} ref={formRef}>
        <label>
          Title: <input type='text' name='title' required />
        </label>
        <label>
          Content:{' '}
          <textarea name='content' cols={30} rows={5} required></textarea>
        </label>
        <button>Create</button>
      </form>
    </div>
  )
}
```

Список задач (`components/TodoList.tsx`):

```javascript
import { useTodos, useUser } from '@/utils/swr'

export default function TodoList() {
  const { user } = useUser()
  const { todos, mutateTodos } = useTodos(Boolean(user))

  if (!user || !todos.length) return null

  const onClick = async (id: string) => {
    try {
      // выполняем запрос на удаление задачи
      const res = await fetch(`/api/todo?id=${id}`, {
        method: 'DELETE'
      })
      if (!res.ok) throw res
      const newTodos = todos.filter((todo) => todo.id !== id)
      // инвалидируем кэш
      mutateTodos(newTodos)
    } catch (e) {
      console.log(e)
    }
  }

  return (
    <div>
      <h2>Todo List</h2>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            <p>
              <b>{todo.title}</b>
            </p>
            <p>{todo.content}</p>
            <button onClick={() => onClick(todo.id)}>X</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

Ничего особенного.

Вот как выглядит обработчик этих запросов (`pages/api/todo.ts`):

```javascript
import { NextApiRequestWithUserId } from '@/types'
import authGuard from '@/utils/authGuard'
import prisma from '@/utils/prisma'
import { Todo } from '@prisma/client'
import { NextApiResponse } from 'next'
import nextConnect from 'next-connect'

const todoHandler = nextConnect<NextApiRequestWithUserId, NextApiResponse>()

// роут для получения задач пользователя
todoHandler.get(async (req, res) => {
  try {
    // получаем задачи из БД
    const todos = await prisma.todo.findMany({
      where: {
        userId: req.userId
      }
    })

    // возвращаем их
    res.status(200).json(todos)
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Todos get error' })
  }
})

// роут для создания задачи
todoHandler.post(async (req, res) => {
  // извлекаем данные задачи из тела запроса
  const data: Pick<Todo, 'title' | 'content' | 'userId'> = JSON.parse(req.body)
  // добавляем в данные id пользователя
  data.userId = req.userId

  try {
    // создаем задачу
    const todo = await prisma.todo.create({
      data
    })
    // возвращаем ее
    res.status(200).json(todo)
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Todo create error' })
  }
})

// роут для удаления задачи
todoHandler.delete(async (req, res) => {
  // извлекаем id задачи из строки запроса
  const id = req.query.id as string

  try {
    // удаляем задачу
    const todo = await prisma.todo.delete({
      where: {
        id_userId: {
          id,
          userId: req.userId
        }
      }
    })
    // возвращаем ее
    res.status(200).json(todo)
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Todo remove error' })
  }
})

// все роуты являются защищенными
export default authGuard(todoHandler)
```

Защита этих роутов реализована с помощью посредника `utils/authGuard.ts`:

```javascript
import jwt from 'jsonwebtoken'
import { AuthGuardMiddleware } from '../types'

const authGuard: AuthGuardMiddleware = (handler) => async (req, res) => {
  // извлекаем токен доступа из заголовка авторизации - `Authorization: 'Bearer <accessToken>'`
  const accessToken = req.headers.authorization?.split(' ')[1]

  // если токен отсутствует
  if (!accessToken) {
    return res.status(403).json({ message: 'Access token must be provided' })
  }

  try {
    // декодируем токен
    const decodedToken = (await jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET
    )) as unknown as {
      userId: string
    }

    // если полезная нагрузка отсутствует
    if (!decodedToken || !decodedToken.userId) {
      return res.status(403).json({ message: 'Invalid token' })
    }

    // записываем id пользователя в объект запроса
    req.userId = decodedToken.userId
  } catch (e: any) {
    console.log(e)
    // если истек срок действия токена
    if (e.name === 'TokenExpiredError') {
      // сервер сообщает о том, что он - чайник :)
      return res.status(418).json({ message: 'Access token has been expired' })
    }
    return res.status(403).json({ message: 'Invalid token' })
  }

  // передаем управление следующему обработчику
  return handler(req, res)
}

export default authGuard
```

Как видим, для доступа к роутам `/api/todo` требуется наличие заголовка авторизации в объекте запроса, которого у клиента нет.

---

Перейдем к самому интересному - СВ.

Регистрируем его при запуске приложения (`pages/_app.tsx`):

```javascript
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import '@/styles/globals.css'
import registerSW from '@/utils/registerSW'
import type { AppProps } from 'next/app'
import { useEffect } from 'react'

export default function App({ Component, pageProps }: AppProps) {
  // регистрируем СВ при запуске приложения
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      registerSW()
    }
  }, [])

  return (
    <>
      <Header />
      <main>
        <Component {...pageProps} />
      </main>
      <Footer />
    </>
  )
}
```

Функция регистрации СВ выглядит следующим образом (`utils/registerSW.ts`):

```javascript
export default async function registerSW() {
  try {
    const reg = await navigator.serviceWorker.register('/sw.js')
    console.log(`Registration scope: ${reg.scope}`)
  } catch (e) {
    console.log(e)
  }
}
```

Логика СВ реализована в файле `public/sw.js`:

```javascript
// установка и активация СВ нас не интересуют
// self.addEventListener('install', (e) => {})
// self.addEventListener('activate', (e) => {})

// глобальная переменная для хранения токена доступа
let accessToken

// обработка запросов
self.addEventListener('fetch', async (e) => {
  // объект запроса
  const { request } = e
  // адрес запроса
  const { url } = request

  // если выполняется запрос к нашему серверу
  if (url.startsWith(self.location.origin) && url.includes('api')) {
    // регистрируем запрос на выход из системы
    if (url.includes('logout')) {
      // просто удаляем токен
      accessToken = null

      // перехватываем запрос на регистрацию/авторизацию
    } else if (url.includes('auth')) {
      e.respondWith(
        (async () => {
          // выполняем запрос
          const res = await fetch(request)
          // если возникла ошибка
          if (!res.ok) {
            // просто возвращаем ответ
            return res
          }
          // обратите внимание, что мы клонируем объект ответа
          const data = await res.clone().json()
          // обновляем значение токена
          accessToken = data.accessToken
          // извлекаем дополнительную информацию об ответе
          const { headers, status, statusText } = res.clone()
          // возвращаем ответ без токена (!) и дополнительную информацию
          return new Response(JSON.stringify(data.user), {
            headers,
            status,
            statusText
          })
        })()
      )
    }

    // перехватываем запрос на создание/удаление задачи
    if (url.includes('todo')) {
      e.respondWith(
        (async () => {
          // выполняем запрос
          // обратите внимание, что мы клонируем объект запроса
          // здесь можно выполнять дополнительную проверку того,
          // что запрос выполняется нашим клиентом, например,
          // с помощью заголовка `Referer`
          res = await fetch(request.clone(), {
            headers: {
              // добавляем заголовок авторизации
              Authorization: `Bearer ${accessToken}`
            }
          })

          // если срок действия токена истек
          if (res.status === 418) {
            // получаем новый токен
            res = await fetch(`${self.location.origin}/api/auth/user`, {
              // прикрепляем к запросу куки
              credentials: 'include'
            })
            const data = await res.json()
            // обновляем значение токена
            accessToken = data.accessToken

            // повторяем оригинальный запрос с новым токеном
            res = await fetch(request.clone(), {
              headers: {
                Authorization: `Bearer ${accessToken}`
              }
            })
          }

          // возвращаем ответ
          return res
        })()
      )
    }
  }
})
```

Как видим, СВ перехватывает две группы запросов:

- `/api/auth/*` - из ответа на эти запросы СВ извлекает токен доступа и передает клиенту только данные пользователя;
- `/api/todo/*` - к этим запросам СВ добавляет заголовок авторизации с токеном доступа и продлевает срок действия токена при необходимости.

Надеюсь, вы узнали что-то новое и не зря потратили время.

Благодарю за внимание и happy coding!
