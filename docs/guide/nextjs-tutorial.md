---
sidebar_position: 2.2
title: Туториал по разработке клиент-серверного приложения с помощью Next.js
description: Туториал по разработке клиент-серверного приложения с помощью Next.js
keywords: [javascript, typescript, node.js, next.js, fullstack app, fullstack, клиент-серверное приложение, полный стек, tutorial, туториал]
tags: [javascript, typescript, ts, node.js, nodejs, next.js, nextjs, fullstack app, fullstack, клиент-серверное приложение, полный стек, tutorial, туториал]
---

Привет, друзья!

В этом туториале мы с вами разработаем клиент-серверное (фуллстек - fullstack) приложение с помощью [Next.js](https://nextjs.org/) и [TypeScript](https://www.typescriptlang.org/).

1. Наше приложение будет представлять собой блог - относительно полноценную платформу для публикации, редактирования и удаления постов.
2. Мы реализуем собственный сервис аутентификации на основе [JSON Web Tokens](https://jwt.io/) и [HTTP-куки](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies).
3. Данные пользователей и постов будут храниться в реляционной базе данных [SQLite](https://www.sqlite.org/).

Сначала мы подготовим и настроим проект, а также реализуем серверную часть приложения с помощью интерфейса роутов (API Routes), затем - разработаем клиента и проверим работоспособность приложения.

_Обратите внимание_: данный туториал рассчитан на разработчиков, которые имеют некоторый опыт работы с [React](https://ru.reactjs.org/) и [Node.js](https://nodejs.org/).

[Репозиторий с кодом проекта](https://github.com/harryheman/Blog-Posts/tree/master/fullstack-next-ts-app).

## Сервер

## Подготовка и настройка проекта

### Создание проекта и установка зависимостей

Для работы с зависимостями будет использоваться [Yarn](https://yarnpkg.com/).

Создаем новый Next.js-проект с поддержкой TS с помощью [Create Next App](https://nextjs.org/docs/api-reference/create-next-app):

```bash
yarn create next-app fullstack-next-ts-app --ts
```

<img src="https://habrastorage.org/webt/rl/9o/ni/rl9oni2indqo888lavzejtxdc2a.png" />
<br />

_Советую взглянуть на [Tabby](https://tabby.sh/) - продвинутый терминал с кучей интересных возможностей_

_Обратите внимание_, что мы выбрали [ESLint](https://eslint.org/) и директорию `src` для хранения файлов приложения, но отказались от экспериментальной директории `app`.

Устанавливаем минимальный набор npm-пакетов, необходимых для работы нашего приложения:

```bash
# производственные зависимости
yarn add @emotion/cache @emotion/react @emotion/server @emotion/styled @formkit/auto-animate @mui/icons-material @mui/joy @mui/material @prisma/client @welldone-software/why-did-you-render argon2 cookie jsonwebtoken multer next-connect react-error-boundary react-toastify swiper swr
# зависимости для разработки
yarn add -D @types/cookie @types/jsonwebtoken @types/multer babel-plugin-import prisma sass
```

- `@mui/...` - компоненты и иконки [Material UI](https://mui.com/);
- `@emotion/...` - [решение CSS-в-JS](https://emotion.sh/docs/introduction), которое используется для стилизации компонентов Material UI;
- [prisma](https://www.prisma.io/) - [ORM](https://ru.wikipedia.org/wiki/ORM) для работы с реляционными БД PostgreSQL, MySQL, SQLite и SQL Server, а также с NoSQL-БД MongoDB и CockroachDB;
- [@prisma/client](https://www.npmjs.com/package/@prisma/client) - клиент Prisma;
- [@welldone-software/why-did-you-render](https://github.com/welldone-software/why-did-you-render) - полезная утилита для отладки React-приложений, позволяющая определить причину повторного рендеринга компонента;
- [argon2](https://www.npmjs.com/package/argon2) - утилита для хэширования и проверки паролей;
- [cookie](https://www.npmjs.com/package/cookie) - утилита для работы с куки;
- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) - утилита для работы с токенами;
- [multer](https://www.npmjs.com/package/multer) - посредник (middleware) Node.js для обработки `multipart/form-data` (для работы с файлами, содержащимися в запросе);
- [next-connect](https://www.npmjs.com/package/next-connect) - библиотека, позволяющая работать с интерфейсом роутов Next.js как с роутами [Express](https://expressjs.com/ru/);
- [react-error-boundary](https://www.npmjs.com/package/react-error-boundary) - [компонент-предохранитель](https://reactjs.org/docs/error-boundaries.html) для React-приложений;
- [react-toastify](https://www.npmjs.com/package/react-toastify) - компонент и утилита для реализации уведомлений в React-приложениях;
- [swiper](https://swiperjs.com/) - продвинутый компонент слайдера;
- [swr](https://swr.vercel.app/) - хуки React для запроса (получения - fetching) данных от сервера, позволяющие обойтись без инструмента для управления состоянием (state manager);
- `@types/...` - недостающие типы TS;
- [babel-plugin-import](https://www.npmjs.com/package/babel-plugin-import) - плагин [Babel](https://babeljs.io/) для эффективной "тряски дерева" (tree shaking) при импорте компонентов MUI по названию;
- [sass](https://sass-lang.com/) - препроцессор CSS.

Мы рассмотрим большую часть этих пакетов далее и в следующей части туториала.

### Подготовка БД и настройка ORM

Для хранения данных пользователей и постов нам нужна БД. Для простоты будем использовать SQLite - в этой БД данные хранятся в виде файла на сервере. Для работы с SQLite будет использоваться Prisma.

- [Руководство по Prisma](https://my-js.org/docs/guide/prisma).

_Советую установить [это расширение для VSCode](https://marketplace.visualstudio.com/items?itemName=Prisma.prisma) для работы со схемой Prisma_

Инициализируем Prisma, находясь в корневой директории проекта:

```bash
npx prisma init
```

<img src="https://habrastorage.org/webt/x2/7m/yc/x27mycjja10txzjvpn4c2cwaqty.png" />
<br />

Выполнение этой команды приводит к генерации директории `prisma` и файла `.env`. Редактируем файл `schema.prisma` в директории `prisma`, определяя провайдер для БД в блоке `datasource` и модели пользователя, поста и лайка:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  // !
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

// модель пользователя
model User {
  id        String  @id @default(uuid())
  username  String?
  avatarUrl String?
  email     String  @unique
  password  String
  posts     Post[]
  likes     Like[]
}
// модель поста
model Post {
  id        String   @id @default(uuid())
  title     String
  content   String
  author    User     @relation(fields: [authorId], references: [id], onUpdate: Cascade, onDelete: Cascade)
  authorId  String
  likes     Like[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  // уникальное сочетание полей, используемое для обновления и удаления записи
  @@unique([id, authorId])
}
// модель лайка
model Like {
  id     String @id @default(uuid())
  user   User   @relation(fields: [userId], references: [id])
  userId String
  post   Post   @relation(fields: [postId], references: [id], onUpdate: Cascade, onDelete: Cascade)
  postId String

  @@unique([id, userId, postId])
}
```

Редактируем файл `.env`, определяя в нем путь к файлу БД:

```
DATABASE_URL="file:./dev.db"
```

Создаем и применяем миграцию к БД:

```bash
npx prisma migrate dev --name init
```

<img src="https://habrastorage.org/webt/un/am/m4/unamm4qyvayu8ivnku-z-znm44i.png" />
<br />

Выполнение этой команды приводит к генерации директории `migrations` с миграцией на [SQL](https://ru.wikipedia.org/wiki/SQL).

_Обратите внимание_: при первом выполнении `migrate dev` автоматически устанавливается и генерируется клиент Prisma. В дальнейшем при любом изменении схемы Prisma необходимо вручную выполнять команду `npx prisma generate` для обновления клиента.

Также _обратите внимание_, что для быстрого восстановления исходного состояния БД с потерей всех данных можно удалить файл `dev.db` и выполнить команду `npx prisma db push`.

Осталось настроить клиента Prisma. Создаем файл `src/utils/prisma.ts` следующего содержания:

```javascript
// https://github.com/prisma/prisma-examples/blob/latest/typescript/rest-nextjs-api-routes-auth/lib/prisma.ts
import { PrismaClient } from '@prisma/client'
declare let global: { prisma: PrismaClient }

let prisma: PrismaClient

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient()
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient()
  }
  prisma = global.prisma
}

export default prisma
```

Этот сниппет обеспечивает существование только одного экземпляра (синглтона - singleton) клиента Prisma при работе как в производственной среде, так и в среде для разработки. Дело в том, что в режиме разработки из-за [HMR](https://webpack.js.org/concepts/hot-module-replacement/) при перезагрузке модуля, импортирующего `prisma`, будет создаваться новый экземпляр клиента.

### Подготовка и настройка статических данных для клиента

Наше приложение будет состоять из 3 страниц: главной, блога и контактов. На главной странице и странице контактов будут использоваться статические данные в формате JSON. При этом данные для главной страницы будут храниться локально, а данные для страницы контактов - в [JSONBin](https://jsonbin.io/). Для главной страницы реализуем статическую генерацию с данными с помощью функции [getStaticProps](https://nextjs.org/docs/basic-features/data-fetching/get-static-props), а для страницы контактов - статическую генерацию с данными с инкрементальной регенерацией с помощью функций getStaticProps и [getStaticPaths](https://nextjs.org/docs/basic-features/data-fetching/get-static-paths). Мы еще поговорим об этом во второй части туториала.

Создаем файл `public/data/home.json` с данными для главной страницы:

```json
{
  "blocks": [
    {
      "id": 1,
      "imgSrc": "/img/landscape.jpg",
      "imgAlt": "First landscape",
      "title": "First block",
      "description": "Lorem ipsum dolor sit amet consectetur adipisicing elit. Magni amet illum recusandae numquam iste repudiandae inventore. Sit quis, impedit autem dolorum, perspiciatis tempora voluptas consectetur expedita aspernatur reiciendis labore recusandae voluptatibus, explicabo laboriosam ut temporibus doloremque! Voluptate recusandae commodi quis dolor adipisci fugiat earum? Ratione aliquam modi deserunt voluptatibus error."
    },
    {
      "id": 2,
      "imgSrc": "/img/landscape2.jpg",
      "imgAlt": "Second landscape",
      "title": "Second block",
      "description": "Lorem ipsum dolor sit amet consectetur adipisicing elit. Magni amet illum recusandae numquam iste repudiandae inventore. Sit quis, impedit autem dolorum, perspiciatis tempora voluptas consectetur expedita aspernatur reiciendis labore recusandae voluptatibus, explicabo laboriosam ut temporibus doloremque! Voluptate recusandae commodi quis dolor adipisci fugiat earum? Ratione aliquam modi deserunt voluptatibus error."
    },
    {
      "id": 3,
      "imgSrc": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
      "imgAlt": "Third landscape",
      "title": "Third block",
      "description": "Lorem ipsum dolor sit amet consectetur adipisicing elit. Magni amet illum recusandae numquam iste repudiandae inventore. Sit quis, impedit autem dolorum, perspiciatis tempora voluptas consectetur expedita aspernatur reiciendis labore recusandae voluptatibus, explicabo laboriosam ut temporibus doloremque! Voluptate recusandae commodi quis dolor adipisci fugiat earum? Ratione aliquam modi deserunt voluptatibus error."
    },
    {
      "id": 4,
      "imgSrc": "https://images.unsplash.com/photo-1434725039720-aaad6dd32dfe?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1042&q=80",
      "imgAlt": "Forth landscape",
      "title": "Forth block",
      "description": "Lorem ipsum dolor sit amet consectetur adipisicing elit. Magni amet illum recusandae numquam iste repudiandae inventore. Sit quis, impedit autem dolorum, perspiciatis tempora voluptas consectetur expedita aspernatur reiciendis labore recusandae voluptatibus, explicabo laboriosam ut temporibus doloremque! Voluptate recusandae commodi quis dolor adipisci fugiat earum? Ratione aliquam modi deserunt voluptatibus error."
    }
  ]
}
```

_Советую установить [это расширение для VSCode](https://marketplace.visualstudio.com/items?itemName=AykutSarac.jsoncrack-vscode) для визуализации данных в формате JSON_

_Обратите внимание_ на источники изображений (`imgSrc`). 2 изображения хранятся локально в директории `public/img`, а еще 2 запрашиваются с [Unsplash](https://unsplash.com/). Для того, чтобы иметь возможность получать изображения из другого источника (origin) необходимо добавить в файл `next.config.js` такую настройку:

```javascript
images: {
  domains: ['images.unsplash.com']
}
```

Авторизуемся в JSONBin, переходим в раздел "Bins", нажимаем "Create a Bin" и добавляем данные для страницы контактов (новости - файл `public/data/news.json`):

```json
{
  "news": [
    {
      "id": 1,
      "imgSrc": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
      "imgAlt": "First landscape",
      "author": "John",
      "datePublished": "2022/12/31",
      "title": "First news",
      "description": "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Blanditiis vel, odio perspiciatis alias quos et labore sit ab laborum. Laboriosam hic autem earum tempore voluptas?",
      "text": "Lorem ipsum dolor sit amet consectetur adipisicing elit. Eos recusandae aspernatur, distinctio autem quia dolor sed libero dignissimos suscipit. Earum aliquam eius eaque corporis cupiditate velit, odit ullam officia nam quibusdam ex laborum possimus eveniet aliquid adipisci assumenda necessitatibus ducimus. Enim nesciunt fuga, aperiam deserunt quia, aut itaque omnis similique molestias veniam assumenda repellendus consequuntur error exercitationem ex debitis quod quidem magni. Cupiditate iure corporis veritatis tenetur rerum, animi quisquam praesentium accusantium est quas in! Eligendi vitae corrupti sunt distinctio nisi blanditiis atque reprehenderit incidunt obcaecati corporis laborum voluptate iusto nostrum dolorum temporibus facere inventore, quaerat optio unde consequuntur velit."
    },
    {
      "id": 2,
      "imgSrc": "https://images.unsplash.com/photo-1494500764479-0c8f2919a3d8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
      "imgAlt": "Second landscape",
      "author": "Jane",
      "datePublished": "2022/12/31",
      "title": "Second news",
      "description": "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Blanditiis vel, odio perspiciatis alias quos et labore sit ab laborum. Laboriosam hic autem earum tempore voluptas?",
      "text": "Lorem ipsum dolor sit amet consectetur adipisicing elit. Eos recusandae aspernatur, distinctio autem quia dolor sed libero dignissimos suscipit. Earum aliquam eius eaque corporis cupiditate velit, odit ullam officia nam quibusdam ex laborum possimus eveniet aliquid adipisci assumenda necessitatibus ducimus. Enim nesciunt fuga, aperiam deserunt quia, aut itaque omnis similique molestias veniam assumenda repellendus consequuntur error exercitationem ex debitis quod quidem magni. Cupiditate iure corporis veritatis tenetur rerum, animi quisquam praesentium accusantium est quas in! Eligendi vitae corrupti sunt distinctio nisi blanditiis atque reprehenderit incidunt obcaecati corporis laborum voluptate iusto nostrum dolorum temporibus facere inventore, quaerat optio unde consequuntur velit."
    },
    {
      "id": 3,
      "imgSrc": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
      "imgAlt": "Third landscape",
      "author": "Bob",
      "datePublished": "2022/12/31",
      "title": "Third news",
      "description": "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Blanditiis vel, odio perspiciatis alias quos et labore sit ab laborum. Laboriosam hic autem earum tempore voluptas?",
      "text": "Lorem ipsum dolor sit amet consectetur adipisicing elit. Eos recusandae aspernatur, distinctio autem quia dolor sed libero dignissimos suscipit. Earum aliquam eius eaque corporis cupiditate velit, odit ullam officia nam quibusdam ex laborum possimus eveniet aliquid adipisci assumenda necessitatibus ducimus. Enim nesciunt fuga, aperiam deserunt quia, aut itaque omnis similique molestias veniam assumenda repellendus consequuntur error exercitationem ex debitis quod quidem magni. Cupiditate iure corporis veritatis tenetur rerum, animi quisquam praesentium accusantium est quas in! Eligendi vitae corrupti sunt distinctio nisi blanditiis atque reprehenderit incidunt obcaecati corporis laborum voluptate iusto nostrum dolorum temporibus facere inventore, quaerat optio unde consequuntur velit."
    },
    {
      "id": 4,
      "imgSrc": "https://images.unsplash.com/photo-1434725039720-aaad6dd32dfe?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1042&q=80",
      "imgAlt": "Forth landscape",
      "author": "Alice",
      "datePublished": "2022/12/31",
      "title": "Forth news",
      "description": "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Blanditiis vel, odio perspiciatis alias quos et labore sit ab laborum. Laboriosam hic autem earum tempore voluptas?",
      "text": "Lorem ipsum dolor sit amet consectetur adipisicing elit. Eos recusandae aspernatur, distinctio autem quia dolor sed libero dignissimos suscipit. Earum aliquam eius eaque corporis cupiditate velit, odit ullam officia nam quibusdam ex laborum possimus eveniet aliquid adipisci assumenda necessitatibus ducimus. Enim nesciunt fuga, aperiam deserunt quia, aut itaque omnis similique molestias veniam assumenda repellendus consequuntur error exercitationem ex debitis quod quidem magni. Cupiditate iure corporis veritatis tenetur rerum, animi quisquam praesentium accusantium est quas in! Eligendi vitae corrupti sunt distinctio nisi blanditiis atque reprehenderit incidunt obcaecati corporis laborum voluptate iusto nostrum dolorum temporibus facere inventore, quaerat optio unde consequuntur velit."
    },
    {
      "id": 5,
      "imgSrc": "https://images.unsplash.com/34/BA1yLjNnQCI1yisIZGEi_2013-07-16_1922_IMG_9873.jpg?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1171&q=80",
      "imgAlt": "Fifth landscape",
      "author": "Alice",
      "datePublished": "2022/12/31",
      "title": "Fifth news",
      "description": "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Blanditiis vel, odio perspiciatis alias quos et labore sit ab laborum. Laboriosam hic autem earum tempore voluptas?",
      "text": "Lorem ipsum dolor sit amet consectetur adipisicing elit. Eos recusandae aspernatur, distinctio autem quia dolor sed libero dignissimos suscipit. Earum aliquam eius eaque corporis cupiditate velit, odit ullam officia nam quibusdam ex laborum possimus eveniet aliquid adipisci assumenda necessitatibus ducimus. Enim nesciunt fuga, aperiam deserunt quia, aut itaque omnis similique molestias veniam assumenda repellendus consequuntur error exercitationem ex debitis quod quidem magni. Cupiditate iure corporis veritatis tenetur rerum, animi quisquam praesentium accusantium est quas in! Eligendi vitae corrupti sunt distinctio nisi blanditiis atque reprehenderit incidunt obcaecati corporis laborum voluptate iusto nostrum dolorum temporibus facere inventore, quaerat optio unde consequuntur velit."
    },
    {
      "id": 6,
      "imgSrc": "https://images.unsplash.com/photo-1429704658776-3d38c9990511?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1079&q=80",
      "imgAlt": "Sixth landscape",
      "author": "Bob",
      "datePublished": "2022/12/31",
      "title": "Sixth news",
      "description": "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Blanditiis vel, odio perspiciatis alias quos et labore sit ab laborum. Laboriosam hic autem earum tempore voluptas?",
      "text": "Lorem ipsum dolor sit amet consectetur adipisicing elit. Eos recusandae aspernatur, distinctio autem quia dolor sed libero dignissimos suscipit. Earum aliquam eius eaque corporis cupiditate velit, odit ullam officia nam quibusdam ex laborum possimus eveniet aliquid adipisci assumenda necessitatibus ducimus. Enim nesciunt fuga, aperiam deserunt quia, aut itaque omnis similique molestias veniam assumenda repellendus consequuntur error exercitationem ex debitis quod quidem magni. Cupiditate iure corporis veritatis tenetur rerum, animi quisquam praesentium accusantium est quas in! Eligendi vitae corrupti sunt distinctio nisi blanditiis atque reprehenderit incidunt obcaecati corporis laborum voluptate iusto nostrum dolorum temporibus facere inventore, quaerat optio unde consequuntur velit."
    }
  ]
}
```

Нажимаем на шестеренку и вводим `news` в качестве название бина, а также нажимаем на замочек для того, чтобы сделать бин доступным публично:

<img src="https://habrastorage.org/webt/ka/4r/nm/ka4rnmc4b0qpbn9couzhzrafswa.png" />
<br />

Нажимаем "Save Bin" и копируем BIN ID в переменную `JSONBIN_BIN_ID` в файле `.env`:

```
JSONBIN_BIN_ID=<ваш-bin-id>
```

Переходим в раздел "API KEYS", нажимаем "Create Access Key", вводим `news` в качестве названия ключа доступа и выбираем "Read" в разделе "Bins":

<img src="https://habrastorage.org/webt/0x/uc/9d/0xuc9dvdhn6erolejz1dxgsaqgc.png" />
<br />

Нажимаем "Save Access Key" и копируем значения полей "X-MASTER-KEY" и "X-ACCESS_KEY" в соответствующие переменные:

```
JSONBIN_X_MASTER_KEY=<x-master-key>
JSONBIN_X_ACCESS_KEY=<x-access-key>
```

Создаем файл `environment.d.ts` в корне проекта и определяем в нем типы переменных среды окружения:

```javascript
declare namespace NodeJS {
  interface ProcessEnv {
    JSONBIN_BIN_ID: string
    JSONBIN_X_MASTER_KEY: string
    JSONBIN_X_ACCESS_KEY: string
    // об этом чуть позже
    ID_TOKEN_SECRET: string
    ACCESS_TOKEN_SECRET: string
    COOKIE_NAME: string
  }
}
```

Подключаем этот файл в `tsconfig.json`:

```json
"include": [
  "next-env.d.ts",
  "environment.d.ts",
  "**/*.ts",
  "**/*.tsx",
],
```

Пожалуй, это все, что требуется для подготовки и настройки проекта на данном этапе.

## Аутентификация и авторизация

Для аутентификации и авторизации пользователей нашего приложения мы воспользуемся современной и одной из наиболее безопасных схем - JSON Web Tokens + Cookie. На самом высоком уровне это означает следующее:

- для хранения состояния аутентификации сервер генерирует токен идентификации (`idToken`) на основе данных пользователя (например, его ID) и записывает его в куки со специальными настройками;
- на основе куки из запроса пользователя сервер определяет, зарегистрирован ли пользователь в приложении. Если пользователь зарегистрирован, сервер извлекает ID пользователя из токена идентификации, получает данные пользователя из БД и возвращает их клиенту;
- для доступа к защищенным ресурсам сервер генерирует токен доступа (`accessToken`) и возвращает его авторизованному клиенту;
- при доступе к защищенному ресурсу сервер проверяет наличие и валидность токена доступа из заголовка `Authorization` объекта запроса.

### Посредники и утилиты авторизации

Реализуем 2 посредника и 1 утилиту авторизации:

- `cookie` - посредник для работы с куки;
- `authGuard` - посредник для предоставления доступа к защищенным ресурсам;
- `checkFields` - утилита для проверки наличия обязательных полей в теле запроса.

Начнем с определения переменных для куки в файле `.env`:

```
ID_TOKEN_SECRET="id-token-secret"
ACCESS_TOKEN_SECRET="access-token-secret"
COOKIE_NAME="uid"
```

_Обратите внимание_: в реальном приложении секреты должны быть длинными произвольно сгенерированными строками.

Определяем типы для посредника `cookie` в файле `src/types.ts`:

```javascript
import { CookieSerializeOptions } from 'cookie'
import { NextApiRequest, NextApiResponse } from 'next'

// параметры, принимаемые функцией
export type CookieArgs = {
  name: string
  value: any
  options?: CookieSerializeOptions
}

// расширяем объект ответа
export type NextApiResponseWithCookie = NextApiResponse & {
  cookie: (args: CookieArgs) => void
}

// расширяем обработчик запросов
export type NextApiHandlerWithCookie = (
  req: NextApiRequest,
  res: NextApiResponseWithCookie
) => unknown | Promise<unknown>

// определяем тип посредника
export type CookiesMiddleware = (
  handler: NextApiHandlerWithCookie
) => (req: NextApiRequest, res: NextApiResponseWithCookie) => void
```

Определяем посредника для работы с куки в файле `utils/cookie.ts`:

```javascript
import { serialize } from 'cookie'
import { NextApiResponse } from 'next'
import { CookieArgs, CookiesMiddleware } from '../types'

const cookieFn = (
  res: NextApiResponse,
  { name, value, options = {} }: CookieArgs
) => {
  const stringValue =
    typeof value === 'object' ? 'j:' + JSON.stringify(value) : String(value)

  if (typeof options.maxAge === 'number') {
    options.expires = new Date(Date.now() + options.maxAge)
    options.maxAge /= 1000
  }

  // устанавливаем заголовок `Set-Cookie`
  res.setHeader('Set-Cookie', serialize(name, String(stringValue), options))
}

const cookies: CookiesMiddleware = (handler) => (req, res) => {
  // расширяем объект ответа
  res.cookie = (args: CookieArgs) => cookieFn(res, args)

  // передаем управление следующему обработчику
  return handler(req, res)
}

export default cookies
```

Этот посредник позволяет устанавливать куки с помощью `res.cookie({ name, value, options })`.

Для применения посредника достаточно обернуть в него обработчик запросов:

```javascript
import { NextApiHandlerWithCookie } from '@/types'
import cookies from '@/utils/cookie'

const handler: NextApiHandlerWithCookie = async (req, res) => {
  console.log(res.cookie)
  // ...
}

export default cookies(handler)
```

Определяем типы для посредника `authGuard` в файле `src/types.ts`:

```javascript
export type NextApiRequestWithUserId = NextApiRequest & {
  userId: string
}

export type NextApiHandlerWithUserId = (
  req: NextApiRequestWithUserId,
  res: NextApiResponse
) => unknown | Promise<unknown>

export type AuthGuardMiddleware = (
  handler: NextApiHandlerWithUserId
) => (req: NextApiRequestWithUserId, res: NextApiResponse) => void
```

Определяем посредника для предоставления доступа к защищенным ресурсам в файле `utils/authGuard.ts`:

```javascript
import jwt from 'jsonwebtoken'
import { AuthGuardMiddleware } from '../types'

const authGuard: AuthGuardMiddleware =
  (handler) => async (req, res) => {
    // извлекаем токен доступа из заголовка `Authorization`
    // значением этого заголовка должна быть строка `Bearer [accessToken]`
    const accessToken = req.headers.authorization?.split(' ')[1]

    // если токен доступа отсутствует
    if (!accessToken) {
      return res.status(403).json({ message: 'Access token must be provided' })
    }

    // декодируем токен
    // сигнатура токена - `{ userId: string }`
    const decodedToken = (await jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET
    )) as unknown as {
      userId: string
    }

    // если полезная нагрузка отсутствует
    if (
      !decodedToken || !decodedToken.userId
    ) {
      return res.status(403).json({ message: 'Invalid token' })
    }

    // записываем id прользователя в объект запроса
    req.userId = decodedToken.userId

    // передаем управление следующему обработчику
    return handler(req, res)
  }

export default authGuard
```

Наконец, определяем утилиту для проверки наличия обязательных полей в теле запроса в файле `utils/checkFields.ts`:

```javascript
export default function checkFields<T>(obj: T, keys: Array<keyof T>) {
  for (const key of keys) {
    if (!obj[key]) {
      return false
    }
  }
  return true
}
```

Думаю, здесь все понятно.

### Роуты аутентификации и авторизации

Интерфейсы роутов определяются в директории `pages/api` и доступны по адресу `/api/*`.

Создаем в ней директорию `auth` с файлами `register.ts` и `login.ts`.

Определяем роут для регистрации:

```javascript
import { NextApiHandlerWithCookie } from '@/types'
import checkFields from '@/utils/checkFields'
import cookies from '@/utils/cookie'
import prisma from '@/utils/prisma'
import { User } from '@prisma/client'
import argon2 from 'argon2'
import jwt from 'jsonwebtoken'

const registerHandler: NextApiHandlerWithCookie = async (req, res) => {
  // извлекаем данные из тела запроса
  // одним из преимуществ использования Prisma является автоматическая генерация типов моделей
  const data: Pick<User, 'username' | 'email' | 'password'> = JSON.parse(
    req.body
  )

  // если отсутствует хотя бы одно обязательное поле
  if (!checkFields(data, ['email', 'password'])) {
    return res.status(400).json({ message: 'Some required fields are missing' })
  }

  try {
    // получаем данные пользователя
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    })

    // если данные имеются, значит, пользователь уже зарегистрирован
    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use' })
    }

    // хэшируем пароль
    const passwordHash = await argon2.hash(data.password)
    // и заменяем им оригинальный
    data.password = passwordHash

    // создаем пользователя - записываем учетные данные пользователя в БД
    const newUser = await prisma.user.create({
      data,
      // важно!
      // не "выбираем" пароль
      select: {
        id: true,
        username: true,
        email: true
      }
    })

    // генерируем токен идентификации на основе ID пользователя
    const idToken = await jwt.sign(
      { userId: newUser.id },
      process.env.ID_TOKEN_SECRET,
      {
        // срок жизни токена, т.е. время, в течение которого токен будет считаться валидным составляет 7 дней
        expiresIn: '7d'
      }
    )

    // генерируем токен доступа на основе ID пользователя
    const accessToken = await jwt.sign(
      { userId: newUser.id },
      process.env.ACCESS_TOKEN_SECRET,
      {
        // важно!
        // такой срок жизни токена доступа приемлем только при разработке приложения
        // см. ниже
        expiresIn: '1d'
      }
    )

    // записываем токен идентификации в куки
    res.cookie({
      name: process.env.COOKIE_NAME,
      value: idToken,
      // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#attributes
      // важно!
      // настройки `httpOnly: true` и `secure: true` являются обязательными
      options: {
        httpOnly: true,
        // значение данной настройки должно совпадать со значением настройки `expiresIn` токена
        maxAge: 1000 * 60 * 60 * 24 * 7,
        // куки применяется для всего приложения
        path: '/',
        // клиент и сервер живут по одному адресу
        sameSite: true,
        secure: true
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

Мы генерируем токен доступа с очень длительным сроком жизни. Это избавляет нас от необходимости его продления (генерации нового токена) в посреднике `authGuard`, например. Но это небезопасно, поэтому в производственном приложении срок жизни токена доступа должен составлять примерно 1 час. Также в реальном приложении должен быть предусмотрен механизм автоматического продления токена идентификации: в нашем приложении пользователь должен будет выполнять вход в систему один раз в неделю.

Определяем роут для авторизации:

```javascript
import { NextApiHandlerWithCookie } from '@/types'
import checkFields from '@/utils/checkFields'
import cookies from '@/utils/cookie'
import prisma from '@/utils/prisma'
import { User } from '@prisma/client'
import argon2 from 'argon2'
import jwt from 'jsonwebtoken'

const loginHandler: NextApiHandlerWithCookie = async (req, res) => {
  const data: Pick<User, 'email' | 'password'> = JSON.parse(req.body)

  if (!checkFields(data, ['email', 'password'])) {
    return res.status(400).json({ message: 'Some required fields are missing' })
  }

  try {
    // получаем данные пользователя
    const user = await prisma.user.findUnique({
      where: {
        email: data.email
      },
      // важно!
      // здесь нам нужен пароль
      select: {
        id: true,
        email: true,
        password: true,
        username: true,
        avatarUrl: true
      }
    })

    // если данные отсутствуют
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // проверяем пароль
    const isPasswordCorrect = await argon2.verify(user.password, data.password)

    // если введен неправильный пароль
    if (!isPasswordCorrect) {
      return res.status(403).json({ message: 'Wrong password' })
    }

    // генерируем токен идентификации
    const idToken = await jwt.sign(
      { userId: user.id },
      process.env.ID_TOKEN_SECRET,
      {
        expiresIn: '7d'
      }
    )

    // генерируем токен доступа
    const accessToken = await jwt.sign(
      { userId: user.id },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: '1d'
      }
    )

    // записываем токен идентификации в куки
    res.cookie({
      name: process.env.COOKIE_NAME,
      value: idToken,
      options: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        path: '/',
        sameSite: true,
        secure: true
      }
    })

    // возвращаем данные пользователя (без пароля!)
    // и токен доступа
    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatarUrl: user.avatarUrl
      },
      accessToken
    })
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'User login error' })
  }
}

export default cookies(loginHandler)
```

Создаем файл `auth/user.ts` для роута определения состояния аутентификации и получения данных пользователя:

```javascript
import prisma from '@/utils/prisma'
import jwt from 'jsonwebtoken'
import { NextApiHandler } from 'next'

const userHandler: NextApiHandler = async (req, res) => {
  // извлекаем токен идентификации из куки
  const idToken = req.cookies[process.env.COOKIE_NAME]

  // если токен отсутствует
  if (!idToken) {
    return res.status(401).json({ message: 'ID token must be provided' })
  }

  try {
    // декодируем токен
    const decodedToken = (await jwt.verify(
      idToken,
      process.env.ID_TOKEN_SECRET
    )) as unknown as { userId: string }

    // если полезная нагрузка отсутствует
    if (!decodedToken || !decodedToken.userId) {
      return res.status(403).json({ message: 'Invalid token' })
    }

    // получаем данные пользователя
    const user = await prisma.user.findUnique({
      where: { id: decodedToken.userId },
      // важно!
      // не получаем пароль
      select: {
        id: true,
        email: true,
        username: true,
        avatarUrl: true
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
        expiresIn: '1d'
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

Наконец, определяем роут для выхода пользователя из системы в файле `auth/logout.ts`:

```javascript
import { NextApiHandlerWithCookie } from '@/types'
import authGuard from '@/utils/authGuard'
import cookies from '@/utils/cookie'

const logoutHandler: NextApiHandlerWithCookie = async (req, res) => {
  // для реализации выхода пользователя из системы достаточно удалить куки
  res.cookie({
    name: process.env.COOKIE_NAME,
    value: '',
    options: {
      httpOnly: true,
      maxAge: 0,
      path: '/',
      sameSite: true,
      secure: true
    }
  })

  res.status(200).json({ message: 'Logout success' })
}

// обратите внимание, что этот роут является защищенным
export default authGuard(cookies(logoutHandler) as any)
```

Таким образом, мы реализовали 4 роута аутентификации и авторизации:

- `POST /api/register` - для регистрации пользователя;
- `POST /api/login` - для входа пользователя в систему;
- `GET /api/user` - для получения данных зарегистрированного пользователя;
- `GET /api/logout` - для выхода пользователя из системы.

## Загрузка файлов

Пользователи нашего приложения будут иметь возможность загружать аватары. Следовательно, нам необходимо реализовать роут для сохранения файлов на сервере. Для работы с файлами из запроса традиционно используется Multer.

_Обратите внимание_: для реализации всех последующих роутов будет использоваться `next-connect`.

Создаем в директории `api` файл `upload.ts` следующего содержания:

```javascript
import { NextApiRequestWithUserId } from '@/types'
import authGuard from '@/utils/authGuard'
import prisma from '@/utils/prisma'
import multer from 'multer'
import { NextApiResponse } from 'next'
import nextConnect from 'next-connect'

// создаем обработчик файлов
const upload = multer({
  storage: multer.diskStorage({
    // определяем директорию для хранения аваторов пользователей
    destination: './public/avatars',
    // важно!
    // названием файла является идентификатор пользователя + расширение исходного файла
    // это будет реализовано на клиенте
    filename: (req, file, cb) => cb(null, file.originalname)
  })
})

// создаем роут
const uploadHandler = nextConnect<
  NextApiRequestWithUserId & { file?: Express.Multer.File },
  NextApiResponse
>()

// добавляем посредника
// важно!
// поле для загрузки файла на клиенте должно называться `avatar`
// <input type="file" name="avatar" />
uploadHandler.use(upload.single('avatar'))

// обрабатываем POST-запрос
uploadHandler.post(async (req, res) => {
  // multer сохраняет файл в директории `public/avatars`
  // и записывает данные файла в объект `req.file`
  if (!req.file) {
    return res.status(500).json({ message: 'File write error' })
  }

  try {
    // обновляем данные пользователя
    const user = await prisma.user.update({
      // идентификатор пользователя хранится в объекте запроса
      // после обработки запроса посредником `authGuard`
      where: { id: req.userId },
      data: {
        // удаляем `public`
        avatarUrl: req.file.path.replace('public', '')
      },
      // важно!
      // не получаем пароль
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        email: true
      }
    })

    // возвращаем данные пользователя
    res.status(200).json(user)
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'User update error' })
  }
})

// роут является защищенным
export default authGuard(uploadHandler)

// важно!
// отключаем преобразование тела запроса в JSON
export const config = {
  api: {
    bodyParser: false
  }
}
```

Этот роут доступен по адресу `/api/upload` с помощью метода `POST`.

Следует отметить, что в нашей реализации не хватает логики для удаления старых аватаров пользователей: название файла состоит из ID пользователя и расширения файла, т.е. один пользователь может иметь несколько файлов с разными расширениями. Это касается только файлов на сервере, поле `avatarUrl` всегда будет содержать ссылку на последний загруженный файл. Также в реальном приложении имеет смысл определить логику для уменьшения размера загружаемого файла, например, путем его сжатия.

## CRUD-операции для постов и лайков

Серверная часть нашего приложения почти готова. Осталось реализовать роуты для добавления, редактирования и удаления постов, а также для добавления и удаления лайков.

_Обратите внимание_: все последующие роуты являются защищенными.

Также _обратите внимание_, что роуты для получения всех постов и одного поста по ID будут реализованы на клиенте (серверной логики на клиенте) с помощью функции [getServerSideProps](https://nextjs.org/docs/basic-features/data-fetching/get-server-side-props).

Создаем в директории `api` файл `post.ts` следующего содержания:

```javascript
import { NextApiRequestWithUserId } from '@/types'
import authGuard from '@/utils/authGuard'
import checkFields from '@/utils/checkFields'
import prisma from '@/utils/prisma'
import { Post } from '@prisma/client'
import { NextApiResponse } from 'next'
import nextConnect from 'next-connect'

const postsHandler = nextConnect<NextApiRequestWithUserId, NextApiResponse>()

// обрабатываем POST-запрос
// создание поста
postsHandler.post(async (req, res) => {
  // на самом деле `authorId` не содержится в теле запроса
  // он хранится в самом запросе
  const data: Pick<Post, 'title' | 'content' | 'authorId'> = JSON.parse(
    req.body
  )

  if (!checkFields(data, ['title', 'content'])) {
    res.status(400).json({ message: 'Some required fields are missing' })
  }

  // дополняем данные полем `authorId`
  data.authorId = req.userId

  try {
    const post = await prisma.post.create({
      data
    })
    res.status(200).json(post)
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Post create error' })
  }
})

// обработка PUT-запроса
// обновление поста
postsHandler.put(async (req, res) => {
  const data: Pick<Post, 'title' | 'content'> & {
    postId: string
  } = JSON.parse(req.body)

  if (!checkFields(data, ['title', 'content'])) {
    res.status(400).json({ message: 'Some required fields are missing' })
  }

  try {
    const post = await prisma.post.update({
      // гарантия того, что пользователь обновляем принадлежащий ему пост
      where: {
        id_authorId: { id: data.postId, authorId: req.userId }
      },
      data: {
        title: data.title,
        content: data.content
      }
    })
    res.status(200).json(post)
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Update post error' })
  }
})

// обработка DELETE-запроса
// удаление поста
postsHandler.delete(async (req, res) => {
  const id = req.query.id as string

  if (!id) {
    return res.status(400).json({
      message: 'Post ID is missing'
    })
  }

  try {
    const post = await prisma.post.delete({
      // гарантия того, что пользователь удаляет принадлежащий ему пост
      where: {
        id_authorId: {
          id,
          authorId: req.userId
        }
      }
    })
    res.status(200).json(post)
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Post remove error' })
  }
})

export default authGuard(postsHandler)
```

Во всех случаях в ответ на запрос возвращаются данные поста.

Таким образом, у нас имеется 3 роута для поста:

- `POST /api/post` - для создания поста;
- `PUT /api/post` - для обновления поста;
- `DELETE /api/post?id=<post-id>` - для удаления поста.

Определяем роут для лайков в файле `api/like.ts`:

```javascript
import { NextApiRequestWithUserId } from '@/types'
import authGuard from '@/utils/authGuard'
import checkFields from '@/utils/checkFields'
import prisma from '@/utils/prisma'
import { Like } from '@prisma/client'
import { NextApiResponse } from 'next'
import nextConnect from 'next-connect'

const likeHandler = nextConnect<NextApiRequestWithUserId, NextApiResponse>()

// обработка POST-запроса
// создание лайка
likeHandler.post(async (req, res) => {
  const data = JSON.parse(req.body) as Pick<Like, 'postId'>

  if (!checkFields(data, ['postId'])) {
    return res.status(400).json({ message: 'Some required fields are missing' })
  }

  try {
    const like = await prisma.like.create({
      data: {
        postId: data.postId,
        userId: req.userId
      }
    })
    res.status(201).json(like)
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Like create error' })
  }
})

// обработка DELETE-запроса
// удаление поста
likeHandler.delete(async (req, res) => {
  const { likeId, postId } = req.query as Record<string, string>

  if (!likeId || !postId) {
    return res
      .status(400)
      .json({ message: 'Some required queries are missing' })
  }

  try {
    const like = await prisma.like.delete({
      // гарантия того, что пользователь удаляет свой лайк конкретного поста
      where: {
        id_userId_postId: {
          id: likeId,
          userId: req.userId,
          postId
        }
      }
    })
    res.status(200).json(like)
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Like remove error' })
  }
})

export default authGuard(likeHandler)
```

Таким образом, у нас имеется 2 роута для лайка:

- `POST /api/like` - для создания лайка;
- `DELETE /api/like?likeId=<like-id>&postId=<post-id>` - для удаления лайка.

В качестве последнего штриха определяем некоторые заголовки HTTP, связанные с безопасностью, в `next.config.js` для всех роутов:

```javascript
/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-site' },
  {
    key: 'Cross-Origin-Opener-Policy',
    value: 'same-origin-allow-popups'
  },
  { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
  { key: 'Referrer-Policy', value: 'no-referrer' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains'
  },
  { key: 'Expect-CT', value: 'enforce, max-age=86400' },
  {
    key: 'Content-Security-Policy',
    value: `object-src 'none'; frame-ancestors 'self'; block-all-mixed-content; upgrade-insecure-requests`
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=()'
  }
]

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com']
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders
      }
    ]
  }
}

module.exports = nextConfig
```

- [Шпаргалка по заголовкам безопасности](https://my-js.org/docs/cheatsheet/security-headers).

## Клиент

## Настройка проекта

### Why Did You Render

[Why Did You Render](https://github.com/welldone-software/why-did-you-render) - утилита для отладки React-приложений, позволяющая определить причину повторного рендеринга компонента. Для того, чтобы иметь возможность использовать эту утилиту в Next.js-приложении необходимо сделать 2 вещи:

- настроить пресет (preset) транспилятора [Babel](https://babeljs.io/);
- инициализировать утилиту и импортировать ее в основной компонент приложения.

Настраиваем пресет Babel в файле `babel.config.js` в корне проекта:

```javascript
module.exports = function (api) {
  const isServer = api.caller((caller) => caller?.isServer)
  const isCallerDevelopment = api.caller((caller) => caller?.isDev)

  // пресеты
  const presets = [
    [
      'next/babel',
      {
        'preset-react': {
          runtime: 'automatic',
          importSource:
            // код wdyr должен выполняться только на клиенте
            // и только в режиме разработки
            !isServer && isCallerDevelopment
              ? '@welldone-software/why-did-you-render'
              : 'react'
        }
      }
    ]
  ]

  return { presets }
}
```

Инициализируем WDYR в файле `utils/wdyr.ts`:

```javascript
import React from 'react'

// код выполняется только в режиме разработки
// и только на клиенте
if (process.env.NODE_ENV === 'development' && typeof document !== 'undefined') {
  const whyDidYouRender = require('@welldone-software/why-did-you-render')
  whyDidYouRender(React, {
    trackAllPureComponents: true
  })
}

export {}
```

Импортируем WDYR в файле `_app.tsx`:

```javascript
import '@/utils/wdyr'
```

После этого для отладки в файле компонента достаточно добавить такую строчку:

```javascript
SomeComponent.whyDidYouRender = true
```

### Material UI

[Material UI](https://mui.com/) - самая популярная библиотека компонентов React. Для ее правильного использования в Next.js-приложении необходимо сделать 2 вещи:

- настроить плагин (plugin) Babel;
- настроить кэш [Emotion](https://emotion.sh/docs/introduction) - решения CSS-в-JS, которое используется MUI для стилизации компонентов.

Настраиваем плагин Babel в файле `babel.config.js`:

```javascript
module.exports = function (api) {
  // пресеты
  // ...

  // плагины
  const plugins = [
    [
      'babel-plugin-import',
      {
        libraryName: '@mui/material',
        libraryDirectory: '',
        camel2DashComponentName: false
      },
      'core'
    ]
  ]

  return { presets, plugins }
}
```

Для чего нужен этот плагин? Для уменьшения размера клиентской сборки. Проблема в том, что при импорте компонента MUI по названию, например:

```javascript
import { Button } from '@mui/material'
```

В сборку попадет весь пакет `@mui/material`, т.е. все компоненты MUI независимо от того, используются они в приложении или нет. `babel-plugin-import` преобразует именованный импорт в дефолтный, т.е. на выходе мы получаем, например:

```javascript
import Button from '@mui/material/Button'
```

Таким образом, в сборку попадают только компоненты, которые используются в приложении.

Настройка кэша Emotion необходима для предотвращения вспышки нестилизованного контента (flash of unstyled content), например, когда сначала загружаются дефолтные стили браузера и только потом стили MUI, а также для обеспечения возможности легкой перезаписи стилей MUI, т.е. кастомизации компонентов ([источник решения](https://github.com/mui/material-ui/tree/master/examples/nextjs)).

Определяем утилиту для создания кэша Emotion в файле `utils/createEmotionCache.ts`:

```javascript
import createCache from '@emotion/cache'

// Создаем на клиенте тег `meta` с `name="emotion-insertion-point"` в начале  <head>.
// Это позволяет загружать стили MUI в первоочередном порядке.
// Это также позволяет разработчикам легко перезаписывать стили MUI, например, с помощью модулей CSS.
export default function createEmotionCache() {
  let insertionPoint

  if (typeof document !== 'undefined') {
    const emotionInsertionPoint = document.querySelector<HTMLMetaElement>(
      'meta[name="emotion-insertion-point"]'
    )
    insertionPoint = emotionInsertionPoint ?? undefined
  }

  return createCache({ key: 'mui-style', insertionPoint })
}
```

Кэш необходимо создавать при запуске приложения как на сервере, так и на клиенте. Настраиваем рендеринг документа в файле `_document.tsx` (создание кэша на сервере):

```javascript
import createEmotionCache from '@/utils/createEmotionCache'
import createEmotionServer from '@emotion/server/create-instance'
import Document, {
  DocumentContext,
  Head,
  Html,
  Main,
  NextScript
} from 'next/document'

export default function MyDocument(props: any) {
  return (
    <Html lang='en'>
      <Head>
        <link rel='icon' href='data:.' />
        {/* дефолтным шрифтом MUI является Roboto, мы будем использовать Montserrat */}
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link rel='preconnect' href='https://fonts.gstatic.com' />
        <link
          href='https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500&display=swap'
          rel='stylesheet'
        />
        {/* ! */}
        <meta name='emotion-insertion-point' content='' />
        {props.emotionStyleTags}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}

// `getInitialProps` принадлежит `_document` (а не `_app`),
// это совместимо с генерацией статического контента (SSG).
MyDocument.getInitialProps = async (docContext: DocumentContext) => {
  // Порядок разрешения
  //
  // На сервере:
  // 1. app.getInitialProps
  // 2. page.getInitialProps
  // 3. document.getInitialProps
  // 4. app.render
  // 5. page.render
  // 6. document.render
  //
  // На сервере в случае ошибки:
  // 1. document.getInitialProps
  // 2. app.render
  // 3. page.render
  // 4. document.render
  //
  // На клиенте:
  // 1. app.getInitialProps
  // 2. page.getInitialProps
  // 3. app.render
  // 4. page.render

  const originalRenderPage = docContext.renderPage

  // Кэш Emotion можно распределять между всеми запросами SSR для повышения производительности.
  // Однако это может привести к глобальным побочным эффектам.
  const cache = createEmotionCache()
  const { extractCriticalToChunks } = createEmotionServer(cache)

  docContext.renderPage = () =>
    originalRenderPage({
      enhanceApp: (App: any) =>
        function EnhanceApp(props) {
          return <App emotionCache={cache} {...props} />
        }
    })

  const docProps = await Document.getInitialProps(docContext)
  // Важно. Это не позволяет Emotion рендерить невалидный HTML.
  // См. https://github.com/mui/material-ui/issues/26561#issuecomment-855286153
  const emotionStyles = extractCriticalToChunks(docProps.html)
  const emotionStyleTags = emotionStyles.styles.map((style) => (
    <style
      data-emotion={`${style.key} ${style.ids.join(' ')}`}
      key={style.key}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: style.css }}
    />
  ))

  return {
    ...docProps,
    emotionStyleTags
  }
}
```

Настраиваем рендеринг компонентов в файле `_app.tsx` (создание кэша на клиенте):

```javascript
import '@/utils/wdyr'
// глобальные стили
import '@/global.scss'
import createEmotionCache from '@/utils/createEmotionCache'
import { CacheProvider, EmotionCache } from '@emotion/react'
// сброс CSS
import CssBaseline from '@mui/material/CssBaseline'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import type { AppProps } from 'next/app'

// настраиваем тему MUI
const theme = createTheme({
  typography: {
    fontFamily: 'Montserrat, sans-serif'
  },
  components: {
    MuiListItem: {
      styleOverrides: {
        root: {
          width: 'unset'
        }
      }
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          flexGrow: 'unset'
        }
      }
    }
  }
})

// создаем клиентский кэш
const clientSideEmotionCache = createEmotionCache()

export default function App({
  Component,
  pageProps,
  emotionCache = clientSideEmotionCache
}: AppProps & { emotionCache?: EmotionCache }) {
  return (
    <>
      {/* провайдер кэша */}
      <CacheProvider value={emotionCache}>
        {/* провайдер темы */}
        <ThemeProvider theme={theme}>
          {/* сброс стилей */}
          <CssBaseline />
          {/* ... */}
        </ThemeProvider>
      </CacheProvider>
    </>
  )
}
```

## Формирование структуры компонентов

В нашем приложении будет использоваться несколько "глобальных" компонентов:

- компонент уведомлений ([react-toastify](https://www.npmjs.com/package/react-toastify));
- компонент слайдера ([swiper](https://swiperjs.com/));
- предохранитель ([react-error-boundary](https://www.npmjs.com/package/react-error-boundary)).

У нас будет общий макет (layout) для всех страниц приложения. Мы сформируем его прямо в `_app.tsx`.

Кроме того, мы будем анимировать переход между страницами с помощью [@formkit/auto-animate](https://auto-animate.formkit.com/) (данную утилиту можно рассматривать как современную альтернативу [React Transition Group](https://reactcommunity.org/react-transition-group/)).

Импортируем компоненты и стили:

```javascript
// ...
import ErrorFallback from '@/components/ErrorFallback'
import Footer from '@/components/Footer'
import CustomHead from '@/components/Head'
import Header from '@/components/Header'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import { ErrorBoundary } from 'react-error-boundary'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
```

Формируем структуру компонентов:

```javascript
export default function App({
  Component,
  pageProps,
  emotionCache = clientSideEmotionCache
}: AppProps & { emotionCache?: EmotionCache }) {
  // ссылка на анимируемый элемент
  const [animationParent] = useAutoAnimate()

  return (
    <>
      <CacheProvider value={emotionCache}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {/* компонент для добавления метаданных в `head` */}
          <CustomHead
            title='Default Title'
            description='This is default description'
          />
          {/* предохранитель */}
          <ErrorBoundary
            // резервный компонент
            FallbackComponent={ErrorFallback}
            onReset={() => window.location.reload()}
          >
            <Container
              maxWidth='xl'
              sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}
            >
              <Header />
              <Box component='main' flexGrow={1} ref={animationParent}>
                {/* компонент страницы */}
                <Component {...pageProps} />
              </Box>
              <Footer />
            </Container>
            {/* компонент уведомлений */}
            <ToastContainer autoClose={2000} hideProgressBar theme='colored' />
          </ErrorBoundary>
        </ThemeProvider>
      </CacheProvider>
    </>
  )
}
```

Компонент для добавления метаданных в раздел `head` документа (`components/head.tsx`):

```javascript
import Head from 'next/head'

type Props = {
  title: string
  description: string
  children?: JSX.Element
}

export default function CustomHead({ title, description, children }: Props) {
  return (
    <Head>
      <title>{title}</title>
      <meta name='description' content={description} />
      {children}
    </Head>
  )
}
```

Резервный компонент (`components/ErrorFallback.tsx`):

```javascript
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Typography
} from '@mui/material'

type Props = {
  error: Error
  resetErrorBoundary: (...args: Array<unknown>) => void
}

export default function ErrorFallback({ error, resetErrorBoundary }: Props) {
  return (
    <Card
      role='alert'
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: 320,
        mt: 2,
        mx: 'auto',
        pb: 2
      }}
    >
      <CardHeader title='Something went wrong' />
      <CardContent>
        <Typography variant='body1' color='error'>
          {/* сообщение об ошибке */}
          {error.message || 'Unknown error'}
        </Typography>
      </CardContent>
      <CardActions>
        {/* предлагаем пользователю перезагрузить страницу */}
        <Button
          variant='contained'
          color='success'
          onClick={resetErrorBoundary}
        >
          Reload
        </Button>
      </CardActions>
    </Card>
  )
}
```

Подвал сайта (`components/Footer.tsx`):

```javascript
import { Box, Typography } from '@mui/material'

export default function Footer() {
  return (
    <Box component='footer' p={1} bgcolor='primary.main'>
      <Typography variant='body2' textAlign='center' color='white'>
        {new Date().getFullYear()}. &copy; All rights reserved
      </Typography>
    </Box>
  )
}
```

Шапка сайта (`components/Header.tsx`):

```javascript
import { AppBar } from '@mui/material'
import DesktopMenu from './Menu/Desktop'
import MobileMenu from './Menu/Mobile'

export type PageLinks = { title: string; href: string }[]

// наше приложение состоит из 3 страниц:
// Главной, Блога и Контактов
const PAGE_LINKS = [
  { title: 'Home', href: '/' },
  { title: 'Posts', href: '/posts' },
  { title: 'About', href: '/about' }
]

export default function Header() {
  return (
    <AppBar position='relative'>
      {/* в зависимости от ширины экрана рендерится либо десктопное меню, любо мобильное */}
      <DesktopMenu links={PAGE_LINKS} />
      <MobileMenu links={PAGE_LINKS} />
    </AppBar>
  )
}
```

Десктопное меню (`components/Menu/Desktop.tsx`):

```javascript
import { List, ListItem } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import ActiveLink from '../ActiveLink'
import ProfileButton from '../Buttons/Profile'
import type { PageLinks } from '../Header'

type Props = {
  links: PageLinks
}

export default function DesktopMenu({ links }: Props) {
  const theme = useTheme()

  return (
    <List
      sx={{
        // управляем видимостью элемента на основе ширины экрана
        display: { xs: 'none', sm: 'flex' },
        justifyContent: 'flex-end',
        paddingInline: theme.spacing(1)
      }}
    >
      {links.map((link, i) => (
        <ListItem key={i}>
          <ActiveLink href={link.href} activeClassName='current'>
            {link.title}
          </ActiveLink>
        </ListItem>
      ))}
      <ProfileButton />
    </List>
  )
}
```

Данный компонент представляет собой список ссылок и кнопку профиля.

Мобильное меню (`components/Menu/Mobile.tsx`):

```javascript
import MenuIcon from '@mui/icons-material/Menu'
import { Box, Drawer, List, ListItem, ListItemButton } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useState } from 'react'
import ActiveLink from '../ActiveLink'
import ProfileButton from '../Buttons/Profile'
import type { PageLinks } from '../Header'

type Props = {
  links: PageLinks
}

export default function MobileMenu({ links }: Props) {
  const theme = useTheme()
  // ссылка на якорь для меню
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  // индикатор открытости меню
  const open = Boolean(anchorEl)

  // метод для открытия меню
  const openMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(e.currentTarget)
  }

  // метод для закрытия меню
  const closeMenu = () => {
    setAnchorEl(null)
  }

  return (
    <Box
      // управляем видимостью элемента на основе ширины экрана
      sx={{ display: { xs: 'flex', sm: 'none' } }}
      alignItems='center'
      justifyContent='space-between'
    >
      <ListItemButton
        id='menu-button'
        sx={{ borderRadius: '50%', px: theme.spacing(1) }}
        aria-controls={open ? 'mobile-menu' : undefined}
        aria-haspopup='true'
        aria-expanded={open ? 'true' : undefined}
        onClick={openMenu}
      >
        <MenuIcon />
      </ListItemButton>
      <Drawer anchor='left' open={open} onClose={closeMenu} id='mobile-menu'>
        <List sx={{ minWidth: '128px' }}>
          {links.map((link, i) => (
            <ListItem
              onClick={closeMenu}
              key={i}
              sx={{ justifyContent: 'center' }}
            >
              <ActiveLink href={link.href} activeClassName='current'>
                {link.title}
              </ActiveLink>
            </ListItem>
          ))}
        </List>
      </Drawer>
      <ProfileButton />
    </Box>
  )
}
```

Данный компонент представляет собой боковую панель со списком ссылок (+ кнопка для открытия меню) и кнопку профиля. О `ProfileButton` мы поговорим в разделе про аутентификацию и авторизацию.

С вашего позволения, в дальнейшем мы не будет рассматривать каждый используемый компонент.

Результат:

_Десктоп_

<img src="https://habrastorage.org/webt/ym/2w/ez/ym2wezspov7-vs5nbfiwxctoaoo.png" />
<br />

_Мобайл (меню закрыто)_

<img src="https://habrastorage.org/webt/tr/gq/-9/trgq-9oca_in-ye9es1x4xz93ww.png" />
<br />

_Мобайл (меню открыто)_

<img src="https://habrastorage.org/webt/2i/h6/jd/2ih6jdu2azabbcdilohpuq1qoh4.png" />
<br />

## Генерация статического контента

Генерация статического контента (или статической страницы) (static-site generation, SSG) - это процесс, в результате которого сервер генерирует готовую к использованию разметку (HTML) на этапе сборки приложения. Готовность к использованию означает, что, во-первых, клиент мгновенно получает страницу в ответ на запрос, во-вторых, такие страницы хорошо индексируются поисковыми ботами (SEO).

Статический контент бывает 2 видов: с данными и без. Статика без данных - это просто разметка. Статика с данными - это разметка, для генерации которой используются данные, доступные на этапе сборки (данные могут храниться как локально, так и удаленно). Еще раз: страница генерируется на основе данных, актуальных на момент сборки. По общему правилу, это означает невозможность обновления страницы свежими данными без создания новой сборки. Next.js позволяет обойти это ограничение с помощью генерации статического контента с инкрементальной (частичной) регенерацией.

В нашем приложении статическими являются главная страница и страница контактов. Для генерации обеих этих страниц используются данные. Данные для главной страницы хранятся локально. Предполагается, что они обновляются между сборками. Данные для страницы контактов хранятся удаленно (на [JSONBin.io](https://jsonbin.io/)). Предполагается, что они обновляются каждые 12 часов. Для обновления страницы контактов каждые 12 часов запускается процесс инкрементальной регенерации.

### Главная страница

Главная страница (`pages/index.tsx`) состоит из слайдера и 4 информационных блоков и генерируется с помощью данных, которые находятся в файле `public/data/home.json`. Для передачи данных компоненту страницы используется функция `getStaticProps`, а для чтения данных - модуль Node.js [fs](https://nodejs.org/api/fs.html):

```javascript
import Animate, { SLIDE_DIRECTION } from '@/components/AnimateIn'
import CustomHead from '@/components/Head'
import Slider from '@/components/Slider'
import type { Blocks } from '@/types'
import { useUser } from '@/utils/swr'
import { Box, Grid } from '@mui/material'
import Typography from '@mui/material/Typography'
import type { GetStaticPropsContext, InferGetStaticPropsType } from 'next'
import Image from 'next/image'
// модули Node.js
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

// компонент статической страницы
export default function Home({
  data
}: InferGetStaticPropsType<typeof getStaticProps>) {
  // данные информационных блоков
  const { blocks } = data
  // об этом позже
  const { user } = useUser()

  return (
    <>
      <CustomHead title='Home Page' description='This is Home Page' />
      <Typography variant='h4' textAlign='center' py={2}>
        Welcome, {user ? user.username || user.email : 'stranger'}
      </Typography>
      {/* слайдер */}
      <Slider slides={blocks} />
      {/* информационные блоки */}
      <Box my={2}>
        {blocks.map((block, i) => (
          {/* самописная библиотека анимации */}
          <Animate.SlideIn
            key={block.id}
            direction={i % 2 ? SLIDE_DIRECTION.RIGHT : SLIDE_DIRECTION.LEFT}
          >
            <Grid container spacing={2} my={4}>
              {i % 2 ? (
                <>
                  <Grid item md={6}>
                    <Typography variant='h5'>{block.title}</Typography>
                    <Typography variant='body1' mt={2}>
                      {block.description}
                    </Typography>
                  </Grid>
                  <Grid item md={6}>
                    <Image
                      width={1024}
                      height={320}
                      src={block.imgSrc}
                      alt={block.imgAlt}
                      style={{
                        borderRadius: '6px'
                      }}
                    />
                  </Grid>
                </>
              ) : (
                <>
                  <Grid item md={6}>
                    <Image
                      width={1024}
                      height={320}
                      src={block.imgSrc}
                      alt={block.imgAlt}
                      style={{
                        borderRadius: '6px'
                      }}
                    />
                  </Grid>
                  <Grid item md={6}>
                    <Typography variant='h5'>{block.title}</Typography>
                    <Typography variant='body1' mt={2}>
                      {block.description}
                    </Typography>
                  </Grid>
                </>
              )}
            </Grid>
          </Animate.SlideIn>
        ))}
      </Box>
    </>
  )
}

// функция генерации статического контента с данными
export async function getStaticProps(ctx: GetStaticPropsContext) {
  let data = {
    blocks: [] as Blocks
  }

  // путь к данным
  const dataPath = join(process.cwd(), 'public/data/home.json')

  try {
    // читаем файл
    const dataJson = await readFile(dataPath, 'utf-8')
    if (dataJson) {
      // преобразуем данные из строки JSON в объект JS
      data = JSON.parse(dataJson)
    }
  } catch (e) {
    console.error(e)
  }

  // передаем данные компоненту страницы в виде пропа
  return {
    props: {
      data
    }
  }
}
```

Результат:

<img src="https://habrastorage.org/webt/hw/ui/_e/hwui_e5uapmraiqhqsrvu42e26a.png" />
<br />

### Страница контактов

Страница контактов (`pages/about.tsx`) состоит из блока с приветствием и 6 новостных блоков и генерируется на основе данных, хранящихся на JSONBin.io. Для получения данных используется `fetch`. У каждой новости имеется собственная страница (`pages/news/[id].tsx`). Для передачи данных компоненту страницы контактов используется функция `getStaticProps`. А для передачи данных странице новости - функции `getStaticProps` и `getStaticPaths`. `getStaticPaths` сообщает Next.js о том, сколько у нас новостей, т.е. сколько новостных страниц необходимо сгенерировать на этапе сборки приложения.

Начнем со страницы контактов (`pages/about.tsx`):

```javascript
import Animate from '@/components/AnimateIn'
import CustomHead from '@/components/Head'
import NewsPreview from '@/components/NewsPreview'
import type { NewsArr } from '@/types'
import { Grid, Typography } from '@mui/material'
import type { GetStaticPropsContext, InferGetStaticPropsType } from 'next'

// компонент статической страницы
export default function About({
  data
}: InferGetStaticPropsType<typeof getStaticProps>) {
  // данные новостных блоков
  const { news } = data

  return (
    <>
      <CustomHead title='About Page' description='This is About Page' />
      <Typography variant='h4' textAlign='center' py={2}>
        About
      </Typography>
      {/* блок с приветствием */}
      <Typography variant='body1'>
        Lorem ipsum dolor, sit amet consectetur adipisicing elit. Doloribus,
        obcaecati necessitatibus! Doloremque numquam magni culpa atque omnis
        ipsa sequi, nostrum, provident repudiandae sint aperiam temporibus nulla
        minima quas rem ex autem dolores consequuntur! Officia laborum autem ex
        eius cumque non aspernatur blanditiis commodi quae magnam ipsa qui sunt
        dolor quos dolorum eveniet, nobis excepturi voluptatum quasi, dicta sit
        aut, corporis hic. Magni numquam, accusamus, quasi consectetur facere
        quod consequuntur aliquid illo commodi ducimus id tenetur ea molestiae
        suscipit itaque assumenda ex. Expedita rem architecto itaque, ad
        voluptate nesciunt nisi veniam modi cupiditate, amet id velit deserunt
        soluta? Ex, voluptate libero.
      </Typography>
      <Typography variant='h5' textAlign='center' py={2}>
        News
      </Typography>
      {/* новостные блоки */}
      {/* превью новости содержит ссылку на соответствующую страницу */}
      <Grid container spacing={2} pb={2}>
        {news.map((n) => (
          <Grid item md={6} lg={4} key={n.id}>
            <Animate.FadeIn>
              <NewsPreview news={n} />
            </Animate.FadeIn>
          </Grid>
        ))}
      </Grid>
    </>
  )
}

// функция генерации статического контента с данными
export async function getStaticProps(ctx: GetStaticPropsContext) {
  let data = {
    news: [] as NewsArr
  }

  try {
    const response = await fetch(
      `https://api.jsonbin.io/v3/b/${process.env.JSONBIN_BIN_ID}?meta=false`,
      {
        headers: {
          'X-Master-Key': process.env.JSONBIN_X_MASTER_KEY
        }
      }
    )
    if (!response.ok) {
      throw response
    }
    data = await response.json()
  } catch (e) {
    console.error(e)
  }

  return {
    props: {
      data
    },
    // данная настройка включает инкрементальную регенерацию
    // значением является время в секундах - 12 часов
    revalidate: 60 * 60 * 12
  }
}
```

Благодаря настройке `revalidate` страница генерируется на этапе сборки и обновляется каждые 12 часов. Это означает следующее:

- Ответ на любой запрос к странице контактов до истечения 12 часов мгновенно возвращается (доставляется) из кэша;
- по истечении 12 часов следующий запрос также получает в ответ кэшированную версию страницы;
- после этого в фоновом режиме запускается процесс регенерации страницы (вызывается `getStaticProps()` и формируется новая разметка);
- после успешной регенерации кэш инвалидируется и отображается новая страница. При провале регенерации старая страница остается неизменной.

Страница новости (`pages/news/[id].tsx`):

```javascript
import CustomHead from '@/components/Head'
import type { News, NewsArr } from '@/types'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardMedia,
  Typography
} from '@mui/material'
import { blue, red } from '@mui/material/colors'
import type {
  GetStaticPathsContext,
  GetStaticPropsContext,
  InferGetStaticPropsType
} from 'next'
import Link from 'next/link'

// компонент статической страницы
export default function ArticlePage({
  news
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <>
      <CustomHead title={news.title} description={news.text.slice(0, 10)} />
      <Box py={2}>
        <Card>
          <CardHeader
            avatar={
              <Avatar
                sx={{ bgcolor: news.id % 2 === 0 ? red[500] : blue[500] }}
                aria-label='author avatar'
              >
                {news.author.slice(0, 1)}
              </Avatar>
            }
            action={
              <Link href='/about'>
                <Button aria-label='return to about page'>
                  <ArrowBackIosNewIcon fontSize='small' />
                  <Typography variant='body2'>Back</Typography>
                </Button>
              </Link>
            }
            title={news.title}
            subheader={new Date(news.datePublished).toDateString()}
          />
          <CardMedia
            component='img'
            height='300'
            image={news.imgSrc}
            alt={news.imgAlt}
          />
          <CardContent>
            <Typography variant='body1'>{news.text}</Typography>
          </CardContent>
        </Card>
      </Box>
    </>
  )
}

// функция генерации путей статических страниц
export async function getStaticPaths(ctx: GetStaticPathsContext) {
  let data = {
    news: [] as NewsArr
  }

  try {
    // здесь нас интересуют данные всех новостей
    const response = await fetch(
      `https://api.jsonbin.io/v3/b/${process.env.JSONBIN_BIN_ID}?meta=false`,
      {
        headers: {
          'X-Master-Key': process.env.JSONBIN_X_MASTER_KEY
        }
      }
    )
    if (!response.ok) {
      throw response
    }
    data = await response.json()
  } catch (e) {
    console.error(e)
  }

  // пути страниц
  const paths = data.news.map((n) => ({
    params: { id: String(n.id) }
  }))

  // Во время сборки будут предварительно отрендерены только страницы с указанными путями
  // `{ fallback: 'blocking' }` означает, что Next.js попытается
  // отрендерить страницу по отсутствующему пути на сервере
  return {
    paths,
    fallback: 'blocking'
  }
}

export async function getStaticProps({
  params
}: GetStaticPropsContext<{ id: string }>) {
  let news = {} as News

  try {
    // здесь нас интересуют данные только одной новости
    const response = await fetch(
      `https://api.jsonbin.io/v3/b/${process.env.JSONBIN_BIN_ID}?meta=false`,
      {
        headers: {
          'X-Master-Key': process.env.JSONBIN_X_MASTER_KEY,
          'X-JSON-Path': `news[${Number(params?.id) - 1}]`
        }
      }
    )
    if (!response.ok) {
      throw response
    }
    const data = await response.json()
    news = data[0]
    // важно!
    // если данные новости с указанным id отсутствуют,
    // рендерим страницу 404
    if (!news) {
      return {
        notFound: true
      }
    }
  } catch (e) {
    console.error(e)
  }

  return {
    props: {
      news
    },
    // инкрементальная регенерация
    revalidate: 60 * 60 * 12
  }
}
```

Результат:

_Страница контактов_

<img src="https://habrastorage.org/webt/j4/wp/dy/j4wpdyqfjuxkyi_x6xekhjeatlm.png" />
<br />

_Страница новости_

<img src="https://habrastorage.org/webt/3h/h1/2j/3hh12jolxmgqphm70s-yhvm20ca.png" />
<br />

## Аутентификация, авторизация и загрузка файлов

При запуске приложение запрашивает у сервера данные пользователя. Это единственные данные, за изменением которых "наблюдает" приложение. Запрос данных пользователя реализован с помощью [SWR](https://swr.vercel.app/). SWR позволяет кэшировать данные и мутировать их при необходимости, например, после регистрации пользователя. Благодаря SWR мы можем обойтись без инструмента для управления состоянием приложения (state manager).

Определяем абстракцию над SWR для получения данных пользователя в файле `utils/swr.ts`:

```javascript
import type { User } from '@prisma/client'
import useSWRImmutable from 'swr/immutable'

async function fetcher<T>(
  input: RequestInfo | URL,
  init?: RequestInit | undefined
): Promise<T> {
  return fetch(input, init).then((res) => res.json())
}

// запрос на получение данных пользователя выполняется один раз
export function useUser() {
  // утилита возвращает данные пользователя и токен доступа, ошибку и
  // функцию инвалидации кэша (метод для мутирования данных, хранящихся в кэше)
  const { data, error, mutate } = useSWRImmutable<any>(
    '/api/auth/user',
    (url) => fetcher(url, { credentials: 'include' }),
    {
      onErrorRetry(err, key, config, revalidate, revalidateOpts) {
        return false
      }
    }
  )

  // `error` - обычная ошибка (необработанное исключение)
  // `data.message` - сообщение о кастомной ошибке, например:
  // res.status(404).json({ message: 'User not found' })
  if (error || data?.message) {
    console.log(error || data?.message)

    return {
      user: undefined,
      accessToken: undefined,
      mutate
    }
  }

  return {
    user: data?.user as User,
    accessToken: data?.accessToken as string,
    mutate
  }
}
```

### Аутентификация и авторизация

В шапке сайте имеется кнопка профиля (`ProfileButton`):

```javascript
import { useUser } from '@/utils/swr'
import { Avatar, ListItemButton } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import AuthTabs from '../AuthTabs'
import Modal from '../Modal'
import UserPanel from '../UserPanel'

export default function ProfileButton() {
  // запрашиваем данные пользователя
  const { user } = useUser()
  const theme = useTheme()

  // содержимое модального окна зависит от наличия данных пользователя
  const modalContent = user ? <UserPanel /> : <AuthTabs />

  return (
    <Modal
      // компонент, взаимодействие с которым приводит к открытию модального окна
      triggerComponent={
        <ListItemButton sx={{ borderRadius: '50%', px: theme.spacing(1) }}>
          <Avatar
            // источником аватара является либо файл, загруженный пользователей, либо дефолтное изображение
            src={user && user.avatarUrl ? user.avatarUrl : '/img/user.png'}
          />
        </ListItemButton>
      }
      modalContent={modalContent}
    />
  )
}
```

Функционал регистрации, авторизации, загрузки аватаров и выхода из системы инкапсулирован в модальном окне (`components/Modal.tsx`):

```javascript
import CloseIcon from '@mui/icons-material/Close'
import { Box, IconButton, Modal as MuiModal } from '@mui/material'
import { cloneElement, useMemo, useState } from 'react'

type Props = {
  triggerComponent: JSX.Element
  modalContent: JSX.Element
  size?: 'S' | 'M'
}

export default function Modal({
  triggerComponent,
  modalContent,
  size = 'S'
}: Props) {
  // состояние открытости модалки
  const [open, setOpen] = useState(false)

  // метод для открытия модалки
  const handleOpen = () => setOpen(true)
  // метод для закрытия модалки
  const handleClose = () => setOpen(false)

  // содержимому модалки в качестве пропа передается метод для закрытия модалки
  const content = cloneElement(modalContent, { closeModal: handleClose })

  const modalStyles = useMemo(
    () => ({
      bgcolor: 'background.paper',
      borderRadius: 1,
      boxShadow: 24,
      left: '50%',
      maxWidth: size === 'S' ? 425 : 576,
      p: 2,
      position: 'absolute' as 'absolute',
      top: '50%',
      transform: 'translate(-50%, -50%)',
      width: '100%',
      outline: 'none'
    }),
    [size]
  )

  return (
    <>
      <Box onClick={handleOpen}>{triggerComponent}</Box>
      <MuiModal open={open} onClose={handleClose}>
        <Box sx={modalStyles}>
          <IconButton
            sx={{
              position: 'absolute',
              top: '1rem',
              right: '1rem'
            }}
            onClick={handleClose}
          >
            <CloseIcon />
          </IconButton>
          {content}
        </Box>
      </MuiModal>
    </>
  )
}
```

При отсутствии данных пользователя содержимым модалки являются вкладки аутентификации (`components/AuthTabs.tsx`):

```javascript
import storageLocal from '@/utils/storageLocal'
import { Box, Tab, Tabs } from '@mui/material'
import { useEffect, useState } from 'react'
import LoginForm from './Forms/Login'
import RegisterForm from './Forms/Register'

type TabPanelProps = {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel({ children, value, index, ...otherProps }: TabPanelProps) {
  return (
    <Box
      aria-labelledby={`auth-tab-${index}`}
      display={value === index ? 'block' : 'none'}
      hidden={value !== index}
      id={`auth-tabpanel-${index}`}
      role='tabpanel'
      {...otherProps}
    >
      {value === index && children}
    </Box>
  )
}

function a11yProps(index: number) {
  return {
    id: `auth-tab-${index}`,
    'aria-controls': `auth-tabpanel-${index}`
  }
}

type Props = { closeModal?: () => void }

export default function AuthTabs({ closeModal }: Props) {
  // состояние индекса открытой вкладки
  const [tabIndex, setTabIndex] = useState(0)
  // состояние индикатора загрузки
  const [loading, setLoading] = useState(true)

  // метод для переключения вкладок
  const handleChange = (event: React.SyntheticEvent, value: number) => {
    setTabIndex(value)
  }

  // после регистрации мы не только записываем данные пользователя в БД,
  // но также фиксируем факт регистрации в локальном хранилище
  // если пользователь зарегистрирован, мы показываем ему вкладку авторизации,
  // если нет - вкладку регистрации
  useEffect(() => {
    if (storageLocal.get('user_has_been_registered')) {
      setTabIndex(1)
    }
    setLoading(false)
  }, [])

  if (loading) return null

  return (
    <>
      <Box display='flex'>
        <Tabs
          value={tabIndex}
          onChange={handleChange}
          aria-label='auth tabs'
        >
          <Tab label='Register' {...a11yProps(0)} />
          <Tab label='Login' {...a11yProps(1)} />
        </Tabs>
      </Box>
      <TabPanel value={tabIndex} index={0}>
        <RegisterForm closeModal={closeModal} />
      </TabPanel>
      <TabPanel value={tabIndex} index={1}>
        <LoginForm closeModal={closeModal} />
      </TabPanel>
    </>
  )
}
```

Форма регистрации (`components/Forms/Register.tsx`):

```javascript
import type { UserResponseData } from '@/types'
import storageLocal from '@/utils/storageLocal'
import { useUser } from '@/utils/swr'
import MailOutlineIcon from '@mui/icons-material/MailOutline'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import VpnKeyIcon from '@mui/icons-material/VpnKey'
import {
  Button,
  FormControl,
  FormHelperText,
  Input,
  InputLabel,
  Typography
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import type { User } from '@prisma/client'
import { useRouter } from 'next/router'
import { useState } from 'react'
import FormFieldsWrapper from './Wrapper'

type Props = {
  closeModal?: () => void
}

export default function RegisterForm({ closeModal }: Props) {
  const theme = useTheme()
  const router = useRouter()
  // метод для мутирования данных пользователя
  const { mutate } = useUser()

  // состояние ошибок
  const [errors, setErrors] = useState<{
    email?: boolean
    password?: boolean
    passwordConfirm?: boolean
  }>({})

  // обработчик отправки формы
  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    // данные пользователя в виде объета
    const formData = Object.fromEntries(
      new FormData(e.target as HTMLFormElement)
    ) as unknown as Pick<User, 'username' | 'email' | 'password'> & {
      passwordConfirm?: string
    }

    // валидация формы
    const _errors: typeof errors = {}
    if (formData.password.length < 6) {
      _errors.password = true
    }
    if (formData.password !== formData.passwordConfirm) {
      _errors.passwordConfirm = true
    }
    // если имеются ошибки
    if (Object.keys(_errors).length) {
      return setErrors({ ..._errors })
    }

    // удаляем лишние данные
    delete formData.passwordConfirm

    try {
      // отправляем данные на сервер
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(formData)
      })

      // если ответ имеет статус-код 409,
      // значит, пользователь уже зарегистрирован
      if (res.status === 409) {
        return setErrors({ email: true })
      } else if (!res.ok) {
        throw res
      }

      // извлекаем данные пользователя и токен доступа из ответа
      const data = await res.json() as UserResponseData
      // инвалидируем кэш
      mutate(data)
      // фиксируем факт регистрации пользователя в локальном хранилище
      storageLocal.set('user_has_been_registered', true)

      // закрываем модалку
      if (closeModal) {
        closeModal()
      }

      // перенаправляем пользователя на главную страницу
      if (router.pathname !== '/') {
        router.push('/')
      }
    } catch (e) {
      console.error(e)
    }
  }

  // обработчик ввода
  const handleInput: React.FormEventHandler<HTMLFormElement> = () => {
    // сбрасываем ошибки при наличии
    if (Object.keys(errors).length) {
      setErrors({})
    }
  }

  return (
    <FormFieldsWrapper handleSubmit={handleSubmit} handleInput={handleInput}>
      <Typography variant='h4'>Register</Typography>
      <FormControl required>
        <InputLabel htmlFor='username'>Username</InputLabel>
        <Input
          sx={{ gap: theme.spacing(1) }}
          id='username'
          name='username'
          startAdornment={<PersonOutlineIcon />}
        />
      </FormControl>
      <FormControl required error={errors.email}>
        <InputLabel htmlFor='email'>Email</InputLabel>
        <Input
          sx={{ gap: theme.spacing(1) }}
          id='email'
          type='email'
          name='email'
          startAdornment={<MailOutlineIcon />}
        />
        {errors.email && <FormHelperText>Email already in use</FormHelperText>}
      </FormControl>
      <FormControl required error={errors.password}>
        <InputLabel htmlFor='password'>Password</InputLabel>
        <Input
          sx={{ gap: theme.spacing(1) }}
          id='password'
          type='password'
          name='password'
          startAdornment={<VpnKeyIcon />}
        />
        <FormHelperText>
          Password must be at least 6 characters long
        </FormHelperText>
      </FormControl>
      <FormControl required error={errors.passwordConfirm}>
        <InputLabel htmlFor='password-confirm'>Confirm password</InputLabel>
        <Input
          sx={{ gap: theme.spacing(1) }}
          id='password-confirm'
          type='password'
          name='passwordConfirm'
          startAdornment={<VpnKeyIcon />}
        />
        {errors?.passwordConfirm && (
          <FormHelperText>Passwords must be the same</FormHelperText>
        )}
      </FormControl>
      <Button type='submit' variant='contained' color='success'>
        Register
      </Button>
    </FormFieldsWrapper>
  )
}
```

Форма авторизации почти идентична форме регистрации.

Результат:

_Форма регистрации_

<img src="https://habrastorage.org/webt/-p/7y/h-/-p7yh-lawndayohrqs42jynzfsw.png" />
<br />

_Форма авторизации_
<img src="https://habrastorage.org/webt/2f/_g/vt/2f_gvtqirhyrccwvkbarncirpmu.png" />
<br />

### Пользовательская панель

При наличии данных пользователя содержимым модалки, которая рендерится при нажатии кнопки профиля, является пользовательская панель (`components/UserPanel.tsx`), содержащая форму для загрузки аватара и кнопку для выхода пользователя из системы:

```javascript
import { Divider } from '@mui/material'
import LogoutButton from './Buttons/Logout'
import UploadForm from './Forms/Upload'

type Props = {
  closeModal?: () => void
}

export default function UserPanel({ closeModal }: Props) {
  return (
    <>
      <UploadForm closeModal={closeModal} />
      <Divider />
      <LogoutButton closeModal={closeModal} />
    </>
  )
}
```

Форма загрузки аватара (`components/Forms/Upload.tsx`):

```javascript
import { useUser } from '@/utils/swr'
import { Avatar, Box, Button, Typography } from '@mui/material'
import { useRef, useState } from 'react'
import FormFieldsWrapper from './Wrapper'

type Props = {
  closeModal?: () => void
}

export default function UploadForm({ closeModal }: Props) {
  // ссылка на элемент для превью загруженного файла
  const previewRef = useRef<HTMLImageElement | null>(null)
  // состояние файла
  const [file, setFile] = useState<File>()
  const { user, accessToken, mutate } = useUser()

  if (!user) return null

  // обработчик отправки формы
  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    if (!file) return

    e.preventDefault()

    const formData = new FormData()

    // создаем экземпляр `File`, названием которого является id пользователя + расширение файла
    const _file = new File([file], `${user.id}.${file.type.split('/')[1]}`, {
      type: file.type
    })
    formData.append('avatar', _file)

    try {
      // отправляем файл на сервер
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        headers: {
          // роут для загрузки аватара является защищенным
          Authorization: `Bearer ${accessToken}`
        }
      })

      if (!res.ok) {
        throw res
      }

      // извлекаем обновленные данные пользователя
      const user = await res.json()
      // инвалидируем кэш
      mutate({ user })

      // закрываем модалку
      if (closeModal) {
        closeModal()
      }
    } catch (e) {
      console.error(e)
    }
  }

  // обработчик изменения состояния инпута для загрузки файла
  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    if (e.target.files && previewRef.current) {
      // извлекаем файл
      const _file = e.target.files[0]
      // обновляем состояние
      setFile(_file)
      // получаем ссылку на элемент `img`
      const img = previewRef.current.children[0] as HTMLImageElement
      // формируем и устанавливаем источник изображения
      img.src = URL.createObjectURL(_file)
      img.onload = () => {
        // очищаем память
        URL.revokeObjectURL(img.src)
      }
    }
  }

  return (
    <FormFieldsWrapper handleSubmit={handleSubmit}>
      <Typography variant='h4'>Avatar</Typography>
      <Box display='flex' alignItems='center' gap={2}>
        <input
          accept='image/*'
          style={{ display: 'none' }}
          id='avatar'
          name='avatar'
          type='file'
          onChange={handleChange}
        />
        <label htmlFor='avatar'>
          <Button component='span'>Choose file</Button>
        </label>
        <Avatar alt='preview' ref={previewRef} src='/img/user.png' />
        <Button
          type='submit'
          variant='contained'
          color='success'
          disabled={!file}
        >
          Upload
        </Button>
      </Box>
    </FormFieldsWrapper>
  )
}
```

Кнопка для выхода из системы (`components/Buttons/Logout.tsx`):

```javascript
import { useUser } from '@/utils/swr'
import { Box, Button } from '@mui/material'

type Props = {
  closeModal?: () => void
}

export default function LogoutButton({ closeModal }: Props) {
  const { accessToken, mutate } = useUser()

  // обработчик нажатия кнопки
  const onClick = async () => {
    try {
      // сообщаем серверу о выходе пользователя из системы
      const response = await fetch('/api/auth/logout', {
        headers: {
          // роут является защищенным
          Authorization: `Bearer ${accessToken}`
        }
      })

      if (!response.ok) {
        throw response
      }

      // инвалидируем кэш
      mutate({ user: undefined, accessToken: undefined })

      // закрываем модалку
      if (closeModal) {
        closeModal()
      }
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <Box display='flex' justifyContent='flex-end' pt={2} pr={2}>
      <Button color='error' variant='contained' onClick={onClick}>
        Logout
      </Button>
    </Box>
  )
}
```

Результат:

_Без превью_

<img src="https://habrastorage.org/webt/ng/z6/4v/ngz64vjrbzuxrj3p03su5gzuka4.png" />
<br />

_С превью_

<img src="https://habrastorage.org/webt/sb/xg/jo/sbxgjokmrvsa12lbhfhgfmobmpk.png" />
<br />

После загрузки аватар пользователя отображается в шапке сайте на месте кнопки профиля.

## Создание, обновление, удаление и лайк постов

Для генерации страницы блога и страниц постов используется рендеринг на стороне сервера с помощью функции `getServerSideProps`. Данная функция позволяет выполнять серверный код и вызывается при каждом запросе страницы.

На странице блога (`pages/posts/index.tsx`) рендерится кнопка для создания нового поста и список постов (при наличии):

```javascript
import Animate from '@/components/AnimateIn'
import CreatePostButton from '@/components/Buttons/CreatePost'
import CustomHead from '@/components/Head'
import PostPreview from '@/components/PostPreview'
import prisma from '@/utils/prisma'
import { Divider, Grid, Typography } from '@mui/material'
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType
} from 'next'

// компонент динамической страницы
export default function Posts({
  posts
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <CustomHead title='Blog Page' description='This is Blog Page' />
      {/* кнопка для создания поста */}
      <CreatePostButton />
      <Divider />
      <Typography variant='h4' textAlign='center' py={2}>
        Posts
      </Typography>
      {/* список постов или сообщение об их отсутствии */}
      {posts.length ? (
        <Grid container spacing={2} pb={2}>
          {posts.map((post) => (
            <Grid item md={6} lg={4} key={post.id}>
              <Animate.FadeIn>
                <PostPreview post={post} />
              </Animate.FadeIn>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography mt={2}>There are no posts yet</Typography>
      )}
    </>
  )
}

// функция серверного рендеринга
export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  try {
    // получаем все посты из БД
    const posts = await prisma.post.findMany({
      select: {
        id: true,
        title: true,
        content: true,
        author: true,
        authorId: true,
        likes: true,
        createdAt: true
      }
    })
    return {
      props: {
        posts: posts.map((post) => ({
          ...post,
          // предотвращаем ошибку, связанную с несериализуеомстью объекта `Date`
          createdAt: new Date(post.createdAt).toLocaleDateString()
        }))
      }
    }
  } catch (e) {
    console.log(e)
    return {
      props: {
        posts: []
      }
    }
  }
}
```

Кнопка создания поста (`components/Button/CreatePost.tsx`):

```javascript
import { useUser } from '@/utils/swr'
import { Button } from '@mui/material'
import { toast } from 'react-toastify'
import CreatePostForm from '../Forms/CreatePost'
import Modal from '../Modal'

// при наличии данных пользователя рендерится модалка с формой для создания поста
// при отсутствии данных пользователя рендерится уведомление о необходимости авторизации
export default function CreatePostButton() {
  const { user } = useUser()

  const onClick = () => {
    toast('Authorization required', {
      type: 'warning'
    })
  }

  return user ? (
    <Modal
      triggerComponent={
        <Button variant='contained' sx={{ my: 2 }}>
          Create new post
        </Button>
      }
      modalContent={<CreatePostForm />}
      size='M'
    />
  ) : (
    <Button variant='contained' sx={{ my: 2 }} onClick={onClick}>
      Create new post
    </Button>
  )
}
```

Форма создания поста (`components/Forms/CreatePost.tsx`):

```javascript
import { useUser } from '@/utils/swr'
import { CssVarsProvider } from '@mui/joy/styles'
import Textarea from '@mui/joy/Textarea'
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  Input,
  InputLabel,
  Typography
} from '@mui/material'
import { red } from '@mui/material/colors'
import { useTheme } from '@mui/material/styles'
import type { Post } from '@prisma/client'
import { useRouter } from 'next/router'
import { useState } from 'react'
import FormFieldsWrapper from './Wrapper'

type Props = {
  closeModal?: () => void
}

export default function CreatePostForm({ closeModal }: Props) {
  const theme = useTheme()
  const { user, accessToken } = useUser()
  const router = useRouter()

  // состояние ошибок
  const [errors, setErrors] = useState<{
    content?: number
  }>({})

  if (!user) return null

  // обработка отправки формы
  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    if (!user) return
    e.preventDefault()
    // данные поста в виде объекта
    const formData = Object.fromEntries(
      new FormData(e.target as HTMLFormElement)
    ) as unknown as Pick<Post, 'title' | 'content'>

    // валидация формы
    if (formData.content.length < 50) {
      return setErrors({ content: formData.content.length })
    }

    try {
      // отправляем данные поста на сервер
      const response = await fetch('/api/post', {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: {
          // роут является защищенным
          Authorization: `Bearer ${accessToken}`
        }
      })

      if (!response.ok) {
        throw response
      }

      // извлекаем данные поста из ответа
      const post = await response.json()

      // выполняем перенаправление на страницу поста
      router.push(`/posts/${post.id}`)

      // закрываем модалку
      if (closeModal) {
        closeModal()
      }
    } catch (e) {
      console.error(e)
    }
  }

  // обработчик ввода
  const onInput = () => {
    if (Object.keys(errors).length) {
      setErrors({ content: undefined })
    }
  }

  return (
    <FormFieldsWrapper handleSubmit={handleSubmit}>
      <Typography variant='h4'>Create post</Typography>
      <FormControl required>
        <InputLabel htmlFor='title'>Title</InputLabel>
        <Input
          sx={{ gap: theme.spacing(1) }}
          id='title'
          type='text'
          name='title'
          inputProps={{
            minLength: 3
          }}
        />
      </FormControl>
      <Box>
        <InputLabel>
          Content * <Typography variant='body2'>(50 symbols min)</Typography>
          <CssVarsProvider>
            <Textarea
              name='content'
              required
              minRows={5}
              sx={{ mt: 1 }}
              onInput={onInput}
              defaultValue='Lorem ipsum dolor sit amet consectetur adipisicing elit. Soluta sed dicta eos ratione dolores doloribus magni repellendus aliquid sit dolor harum nemo porro voluptate incidunt quidem, molestias quia cum sequi minima debitis quae magnam est eius quas! Similique, enim non ad facilis dolores nulla corrupti assumenda, harum, ipsa consequuntur pariatur!'
            />
          </CssVarsProvider>
        </InputLabel>
        {errors.content && (
          <FormHelperText sx={{ color: red[500] }}>
            {50 - errors.content} symbols left
          </FormHelperText>
        )}
      </Box>
      <Button type='submit' variant='contained' color='success'>
        Create
      </Button>
    </FormFieldsWrapper>
  )
}
```

Страница поста (`pages/posts/[id].tsx`):

```javascript
import EditPostButton from '@/components/Buttons/EditPost'
import LikePostButton from '@/components/Buttons/LikePost'
import RemovePostButton from '@/components/Buttons/RemovePost'
import CustomHead from '@/components/Head'
import prisma from '@/utils/prisma'
import { useUser } from '@/utils/swr'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  Typography
} from '@mui/material'
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType
} from 'next'
import Link from 'next/link'

// компонент динамической страницы
export default function PostPage({
  post
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { user } = useUser()
  // определяем принадлежность поста пользователю
  const isPostBelongsToUser = user && user.id === post.authorId

  return (
    <>
      <CustomHead title={post.title} description={post.content.slice(0, 10)} />
      <Box py={2}>
        <Card>
          <CardHeader
            avatar={<Avatar src={post.author.avatarUrl || '/img/user.png'} />}
            action={
              <Link href='/posts'>
                <Button aria-label='return to about page'>
                  <ArrowBackIosNewIcon fontSize='small' />
                  <Typography variant='body2'>Back</Typography>
                </Button>
              </Link>
            }
            title={post.title}
            subheader={post.createdAt}
          />
          <CardMedia
            component='img'
            height='200'
            // у нет роута для загрузки изображений поста
            image='https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1172&q=80'
            alt=''
          />
          <CardContent>
            <Typography variant='body1'>{post.content}</Typography>
          </CardContent>
          {/* лайкать посты могут только авторизованные пользователи */}
          <CardActions>
            <Box display='flex' justifyContent='flex-end' gap={2} width='100%'>
              <LikePostButton post={post} />
              {/* редактировать и удалять посты могут только создавшие их пользователи */}
              {isPostBelongsToUser && (
                <>
                  <EditPostButton post={post} icon={false} />
                  <RemovePostButton
                    postId={post.id}
                    authorId={post.authorId}
                    icon={false}
                  />
                </>
              )}
            </Box>
          </CardActions>
        </Card>
      </Box>
    </>
  )
}

// функция серверного рендеринга
export async function getServerSideProps({
  params
}: GetServerSidePropsContext<{ id: string }>) {
  try {
    // получаем данные поста по id
    const post = await prisma.post.findUnique({
      where: {
        id: params?.id
      },
      select: {
        id: true,
        title: true,
        content: true,
        author: true,
        authorId: true,
        likes: true,
        createdAt: true
      }
    })
    // если данные поста отсутствуют,
    // возвращаем страницу 404
    if (!post) {
      return {
        notFound: true
      }
    }
    return {
      props: {
        post: {
          ...post,
          // предотвращаем ошибку, связанную с несериализуемостью объекта `Date`
          createdAt: new Date(post.createdAt).toLocaleDateString()
        }
      }
    }
  } catch (e) {
    console.error(e)
  }
}
```

Кнопка лайка поста (`components/Buttons/LikePost.tsx`):

```javascript
import { useUser } from '@/utils/swr'
import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import { Badge, IconButton } from '@mui/material'
import type { Like, Post } from '@prisma/client'
import { useRouter } from 'next/router'

type Props = {
  post: Omit<Post, 'createdAt' | 'updatedAt'> & {
    likes: Like[]
    createdAt: string
  }
}

export default function LikePostButton({ post }: Props) {
  const router = useRouter()
  const { user, accessToken } = useUser()
  if (!user) return null
  // определяем, лайкал ли пользователь этот пост
  const like = post.likes.find((l) => l.userId === user.id)
  const isLiked = Boolean(like)

  // если пользователь лайкал пост, удаляем лайк
  // если нет, создаем лайк
  // оба роута являются защищенными
  const likePost = async () => {
    let res: Response
    try {
      if (isLiked) {
        res = await fetch(`/api/like?likeId=${like?.id}&postId=${post.id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        })
      } else {
        res = await fetch('/api/like', {
          method: 'POST',
          body: JSON.stringify({ postId: post.id }),
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        })
      }
      if (!res.ok) throw res
      // перезагружаем страницу для повторного вызова `getServerSideProps`
      router.push(router.asPath)
    } catch (e) {
      console.log(e)
    }
  }

  return (
    <Badge
      badgeContent={post.likes.length}
      color='error'
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'left'
      }}
    >
      <IconButton onClick={likePost}>
        {isLiked ? <FavoriteIcon color='error' /> : <FavoriteBorderIcon />}
      </IconButton>
    </Badge>
  )
}
```

Кнопка удаления поста (`components/Buttons/RemovePost.tsx`):

```javascript
import { useUser } from '@/utils/swr'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import { Button, IconButton } from '@mui/material'
import { useRouter } from 'next/router'

type Props = {
  postId: string
  authorId: string
  icon?: boolean
}

export default function RemovePostButton({
  postId,
  authorId,
  icon = true
}: Props) {
  const router = useRouter()
  const { user, accessToken } = useUser()

  // проверяем наличие пользователя и его полномочия на удаление поста
  if (!user || user.id !== authorId) return null

  const removePost = async () => {
    try {
      // сообщаем серверу о необходимости удаления поста
      await fetch(`/api/post?id=${postId}`, {
        method: 'DELETE',
        headers: {
          // роут является защищенным
          Authorization: `Bearer ${accessToken}`
        }
      })
      // выполняем перенаправление на страницу блога
      router.push('/posts')
    } catch (e: unknown) {
      console.error(e)
    }
  }

  return icon ? (
    <IconButton onClick={removePost} color='error'>
      <DeleteOutlineIcon />
    </IconButton>
  ) : (
    <Button variant='contained' color='error' onClick={removePost}>
      Remove
    </Button>
  )
}
```

Кнопка редактирования поста (`components/Buttons/EditPost.tsx`):

```javascript
import { useUser } from '@/utils/swr'
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline'
import { Button, IconButton } from '@mui/material'
import type { Post } from '@prisma/client'
import EditPostForm from '../Forms/EditPost'
import Modal from '../Modal'

type Props = {
  post: Omit<Post, 'createdAt' | 'updatedAt'> & {
    createdAt: string
  }
  icon?: boolean
}

export default function EditPostButton({ post, icon = true }: Props) {
  const { user } = useUser()

  // проверяем наличие пользователя и его полномочия на редактирование поста
  if (!user || user.id !== post.authorId) return null

  return (
    <Modal
      triggerComponent={
        icon ? (
          <IconButton color='info'>
            <DriveFileRenameOutlineIcon />
          </IconButton>
        ) : (
          <Button variant='contained' color='info'>
            Edit
          </Button>
        )
      }
      modalContent={<EditPostForm post={post} />}
      size='M'
    />
  )
}
```

При нажатии этой кнопки рендерится модалка с формой для редактирования поста (`components/Forms/EditPost.tsx`), которая почти идентична форме создания поста.

Кнопки лайка, редактирования и удаления поста дублируются на странице блога в карточках превью постов в виде иконок.

Результат:

_Форма создания поста_

<img src="https://habrastorage.org/webt/kh/gl/qz/khglqzuge0y6qgjb1jladbmul50.png" />
<br />

_Страница поста_

<img src="https://habrastorage.org/webt/ce/tz/ho/cetzhofnjgiezdd2vl6j6h-z-r4.png" />
<br />

_Форма редактирования поста_

<img src="https://habrastorage.org/webt/5n/_z/k4/5n_zk4bf-rjajfc9poxotazxu9e.png" />
<br />

_Страница блога_

<img src="https://habrastorage.org/webt/ic/hb/wh/ichbwhxstgfvp4pzpdjaz0moanq.png" />
<br />

На этом разработку нашего приложения можно считать завершенной.

Надеюсь, вы узнали что-то новое и не зря потратили время.

Благодарю за внимание и happy coding!
