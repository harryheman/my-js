---
slug: nest-react-postgres-chat
title: Разрабатываем чат с помощью Nest, React и Postgres
description: Туториал по разрабатке чата с помощью Nest, React и Postgres
authors: harryheman
tags: [react.js, reactjs, react, nest.js, nestjs, socket.io, socketio, postgresql, postgres, docker-compose, docker, chat, чат]
image: https://habrastorage.org/webt/ma/po/lv/mapolvqq4uunxfqoaviv3g9km9y.jpeg
---

<img src="https://habrastorage.org/webt/ma/po/lv/mapolvqq4uunxfqoaviv3g9km9y.jpeg" />

Привет, друзья!

В данном туториале мы разработаем чат с использованием следующих технологий:

- [TypeScript](https://www.typescriptlang.org/) - статический типизатор;
- [NestJS](https://nestjs.com/) - сервер;
- [Socket.IO](https://socket.io/) - библиотека для работы в [веб-сокетами](https://ru.wikipedia.org/wiki/WebSocket);
- [React](https://ru.reactjs.org/) - клиент;
- [TailwindCSS](https://tailwindcss.com/) - библиотека для стилизации;
- [PostgreSQL](https://www.postgresql.org/) - база данных (далее - БД);
- [Prisma](https://www.prisma.io/) - [ORM](https://ru.wikipedia.org/wiki/ORM);
- [Docker](https://www.docker.com/) - платформа для разработки, доставки и запуска приложений в изолированной среде - контейнере.

Функционал чата будет таким:

- фейковая регистрация пользователей:
  - хранение имен пользователей в памяти (объекте) на сервере;
  - хранение имен и идентификаторов пользователей в [localStorage](https://developer.mozilla.org/ru/docs/Web/API/Window/localStorage) на клиенте;
- регистрация подключений и отключений пользователей на сервере и передача этой информации подключенным клиентам;
- запись, обновление и удаление сообщений из БД в реальном времени на сервере и передача этой информации клиентам.

[Репозиторий с кодом проекта](https://github.com/harryheman/Blog-Posts/tree/master/react-nest-postgres-chat).

<!--truncate-->

Материалы для изучения (опционально):

- [Карманная книга по TS](https://my-js.org/docs/guide/ts/);
- [Шпаргалка по TS](https://my-js.org/docs/cheatsheet/ts/);
- [Шпаргалка по React + TS](https://my-js.org/docs/cheatsheet/react-typescript/);
- [Руководство по NestJS](https://habr.com/ru/company/timeweb/blog/666470/);
- [Руководство по Socket.IO](https://my-js.org/docs/guide/socket/);
- [Руководство по Prisma](https://my-js.org/docs/guide/prisma/);
- [Руководство по Docker](https://my-js.org/docs/guide/docker/).

Полезные расширения для [VSCode](https://code.visualstudio.com/) (опционально):

- [Docker](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-docker);
- [ES7+ React/Redux/React-Native/JS snippets](https://marketplace.visualstudio.com/items?itemName=dsznajder.es7-react-js-snippets);
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint);
- [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode);
- [Prisma](https://marketplace.visualstudio.com/items?itemName=Prisma.prisma);
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss).

## Подготовка и настройка проекта

_Обратите внимание_: для успешного прохождения туториала на вашей машине должны быть установлены [Node.js](https://nodejs.org/en/download/) и [Docker](https://www.docker.com/products/docker-desktop/).

Для работы с зависимостями будет использоваться [Yarn](https://yarnpkg.com/).

Создаем директорию, переходим в нее и инициализируем `Node.js-проект`:

```bash
mkdir react-nest-postgres-chat
cd react-nest-postgres-chat

yarn init -yp
```

### База данных

Создаем файл `docker-compose.yml` следующего содержания:

```yaml
services:
  # название сервиса
  postgres:
    # образ
    image: postgres
    # политика перезапуска
    restart: on-failure
    # файл с переменными среды окружения
    env_file:
      - .env
    # порты
    ports:
      - 5432:5432
    # тома для постоянного хранения данных
    volumes:
      - postgres-data:/var/lib/postgresql/data

volumes:
  postgres-data:
```

Создаем файл `.env` и определяем в нем переменные среды окружения для `Postgres`:

```
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=chat
```

Запускаем сервер `Postgres` в контейнере:

```bash
docker compose up -d
```

Это приводит к созданию и запуску контейнера `react-nest-postgres-chat-1` с сервером `Postgres` в сервисе `react-nest-postgres-chat`.

<img src="https://habrastorage.org/webt/_m/nq/q8/_mnqq8km8zqt-n9bnbvucdsnhzm.png" />
<br />

БД доступна по адресу `http://localhost:5432/chat`.

### ORM

Устанавливаем `Prisma` в качестве зависимости для разработки и инициализируем ее:

```bash
yarn add -D prisma

prisma init
```

Это приводит к созданию файла `prisma/schema.prisma`. Определяем в нем модель сообщения:

```prisma
model Message {
  id        Int      @id @default(autoincrement())
  userId    String
  userName  String
  text      String
  createdAt DateTime @default(now())
}
```

Определяем переменную со строкой для подключения к БД в файле `.env`:

```
DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:5432/${POSTGRES_DB}?schema=public
```

Выполняем миграцию:

```bash
yarn prisma migrate dev --name init
```

Это приводит к созданию директории `migrations` с выполненной миграцией в формате [SQL](https://ru.wikipedia.org/wiki/SQL).

Устанавливаем клиента `Prisma` и генерируем типы:

```bash
yarn add @prisma/client

yarn prisma generate
```

### Сервер и клиент

Глобально устанавливаем [Nest CLI](https://docs.nestjs.com/cli/overview) и инициализируем `Nest-проект`:

```bash
yarn global add @nestjs/cli

# выбираем `yarn` для работы с зависимостями
nest new server
```

Создаем шаблон `React + TS` приложения с помощью [create-vite](https://www.npmjs.com/package/create-vite):

```bash
# client - название приложения (и директории)
# react-ts - используемый шаблон
yarn create vite client --template react-ts
```

Устанавливаем [concurrently](https://www.npmjs.com/package/concurrently):

```bash
yarn add concurrently
```

Определяем команду для одновременного запуска сервера и клиента в режиме разработки в файле `package.json`:

```json
"scripts": {
  "dev:client": "yarn --cwd client dev",
  "dev:server": "yarn --cwd server start:dev",
  "dev": "concurrently \"yarn dev:client\" \"yarn dev:server\""
}
```

Работоспособность приложения можно проверить, выполнив команду `yarn dev`.

На этом подготовка и настройка проекта завершены. Переходим к разработке сервера.

## Сервер

Переходим в директорию сервера и устанавливаем модули для работы с сокетами:

```bash
cd server

yarn add @nestjs/websockets @nestjs/platform-socket.io
```

Генерируем шлюз (gateway) для модуля `App`:

```bash
# g ga - generate gateway
nest g ga app
```

Приводим файлы сервера к следующей структуре:

```
- src
  - app.gateway.ts
  - app.module.ts
  - app.service.ts
  - main.ts
  - prisma.service.ts
- constants.ts
- types.ts
- ...
```

Определяем сервис `Prisma` в файле `prisma.service.ts`:

```tsx
import { INestApplication, Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on("beforeExit", async () => {
      await app.close();
    });
  }
}
```

Настраиваем данный сервис в файле `main.ts`:

```tsx
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
// !
import { PrismaService } from "./prisma.service";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // !
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  // обратите внимание на порт
  await app.listen(3001);
}
bootstrap();
```

И подключаем его в качестве провайдера в модуле `App` (`app.module.ts`):

```tsx
import { Module } from "@nestjs/common";
import { AppService } from "./app.service";
// !
import { PrismaService } from "./prisma.service";

@Module({
  imports: [],
  controllers: [],
  // !
  providers: [PrismaService, AppService]
})
export class AppModule {}
```

Определяем адрес клиента в файле `constants.ts`:

```tsx
export const CLIENT_URI = "http://localhost:3000";
```

И тип полезной нагрузки для обновления сообщения в файле `types.ts`:

```tsx
import { Prisma } from "@prisma/client";

// { id?: number, text?: string }
export type MessageUpdatePayload = Prisma.MessageWhereUniqueInput &
  Pick<Prisma.MessageUpdateInput, "text">;
```

Определяем методы для работы с сообщениями в файле `app.service.ts`:

```tsx
import { Injectable } from "@nestjs/common";
import { Message, Prisma } from "@prisma/client";
import { MessageUpdatePayload } from "types";
import { PrismaService } from "./prisma.service";

@Injectable()
export class AppService {
  // инициализация сервиса `Prisma`
  constructor(private readonly prisma: PrismaService) {}

  // получение всех сообщений
  async getMessages(): Promise<Message[]> {
    return this.prisma.message.findMany();
  }

  // удаление всех сообщений - для отладки в процессе разработки
  async clearMessages(): Promise<Prisma.BatchPayload> {
    return this.prisma.message.deleteMany();
  }

  // создание сообщения
  async createMessage(data: Prisma.MessageCreateInput) {
    return this.prisma.message.create({ data });
  }

  // обновление сообщения
  async updateMessage(payload: MessageUpdatePayload) {
    const { id, text } = payload;
    return this.prisma.message.update({ where: { id }, data: { text } });
  }

  // удаление сообщения
  async removeMessage(where: Prisma.MessageWhereUniqueInput) {
    return this.prisma.message.delete({ where });
  }
}
```

Осталось реализовать обработку событий сокетов в файле `app.gateway.ts`.

Импортируем зависимости и прочее, а также определяем переменную для хранения записей "идентификатор сокета - имя пользователя":

```tsx
import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from "@nestjs/websockets";
import { Prisma } from "@prisma/client";
import { Server, Socket } from "Socket.IO";
import { MessageUpdatePayload } from "types";
import { CLIENT_URI } from "../constants";
import { AppService } from "./app.service";

const users: Record<string, string> = {};
```

Инициализируем сокет-соединение, определяем шлюз `App` и инициализируем в нем сервис `App`:

```tsx
@WebSocketGateway({
  cors: {
    origin: CLIENT_URI // можно указать `*` для отключения `CORS`
  },
  serveClient: false,
  // название пространства может быть любым, но должно учитываться на клиенте
  namespace: "chat"
})
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly appService: AppService) {}

  /**
   * @todo
  */
}
```

Инициализируем сокет-сервер и регистрируем инициализацию:

```tsx
@WebSocketServer() server: Server;

afterInit(server: Server) {
  console.log(server);
}
```

Обрабатываем подключение и отключение клиентов:

```tsx
// подключение
handleConnection(client: Socket, ...args: any[]) {
  // обратите внимание на структуру объекта `handshake`
  const userName = client.handshake.query.userName as string;
  const socketId = client.id;
  users[socketId] = userName;

  // передаем информацию всем клиентам, кроме текущего
  client.broadcast.emit("log", `${userName} connected`);
}

// отключение
handleDisconnect(client: Socket) {
  const socketId = client.id;
  const userName = users[socketId];
  delete users[socketId];

  client.broadcast.emit("log", `${userName} disconnected`);
}
```

Наконец, обрабатываем события сокетов:

```tsx
// получение всех сообщений
@SubscribeMessage("messages:get")
async handleMessagesGet(): Promise<void> {
  const messages = await this.appService.getMessages();
  this.server.emit("messages", messages);
}

// удаление всех сообщений
@SubscribeMessage("messages:clear")
async handleMessagesClear(): Promise<void> {
  await this.appService.clearMessages();
}

// создание сообщения
@SubscribeMessage("message:post")
async handleMessagePost(
  @MessageBody()
  payload: // { userId: string, userName: string, text: string }
  Prisma.MessageCreateInput
): Promise<void> {
  const createdMessage = await this.appService.createMessage(payload);
  // можно сообщать клиентам о каждой операции по отдельности
  this.server.emit("message:post", createdMessage);
  // но мы пойдем более простым путем
  this.handleMessagesGet();
}

// обновление сообщения
@SubscribeMessage("message:put")
async handleMessagePut(
  @MessageBody()
  payload: // { id: number, text: string }
  MessageUpdatePayload
): Promise<void> {
  const updatedMessage = await this.appService.updateMessage(payload);
  this.server.emit("message:put", updatedMessage);
  this.handleMessagesGet();
}

// удаление сообщения
@SubscribeMessage("message:delete")
async handleMessageDelete(
  @MessageBody()
  payload: // { id: number }
  Prisma.MessageWhereUniqueInput
) {
  const removedMessage = await this.appService.removeMessage(payload);
  this.server.emit("message:delete", removedMessage);
  this.handleMessagesGet();
}
```

<spoiler title="Полный код app.gateway.ts:">

```tsx
import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from "@nestjs/websockets";
import { Prisma } from "@prisma/client";
import { Server, Socket } from "socket.io";
import { MessageUpdatePayload } from "types";
import { CLIENT_URI } from "../constants";
import { AppService } from "./app.service";

const users: Record<string, string> = {};

@WebSocketGateway({
  cors: {
    origin: CLIENT_URI
  },
  serveClient: false,
  namespace: "chat"
})
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly appService: AppService) {}

  @WebSocketServer() server: Server;

  @SubscribeMessage("messages:get")
  async handleMessagesGet(): Promise<void> {
    const messages = await this.appService.getMessages();
    this.server.emit("messages", messages);
  }

  @SubscribeMessage("messages:clear")
  async handleMessagesClear(): Promise<void> {
    await this.appService.clearMessages();
  }

  @SubscribeMessage("message:post")
  async handleMessagePost(
    @MessageBody()
    payload: // { userId: string, userName: string, text: string }
    Prisma.MessageCreateInput
  ): Promise<void> {
    const createdMessage = await this.appService.createMessage(payload);
    this.server.emit("message:post", createdMessage);
    this.handleMessagesGet();
  }

  @SubscribeMessage("message:put")
  async handleMessagePut(
    @MessageBody()
    payload: // { id: number, text: string }
    MessageUpdatePayload
  ): Promise<void> {
    const updatedMessage = await this.appService.updateMessage(payload);
    this.server.emit("message:put", updatedMessage);
    this.handleMessagesGet();
  }

  @SubscribeMessage("message:delete")
  async handleMessageDelete(
    @MessageBody()
    payload: // { id: number }
    Prisma.MessageWhereUniqueInput
  ) {
    const removedMessage = await this.appService.removeMessage(payload);
    this.server.emit("message:delete", removedMessage);
    this.handleMessagesGet();
  }

  afterInit(server: Server) {
    console.log(server);
  }

  handleConnection(client: Socket, ...args: any[]) {
    const userName = client.handshake.query.userName as string;
    const socketId = client.id;
    users[socketId] = userName;

    client.broadcast.emit("log", `${userName} connected`);
  }

  handleDisconnect(client: Socket) {
    const socketId = client.id;
    const userName = users[socketId];
    delete users[socketId];

    client.broadcast.emit("log", `${userName} disconnected`);
  }
}
```

</spoiler>

Подключаем шлюз в качестве провайдера в модуле `App` (`app.module.ts`):

```tsx
import { Module } from "@nestjs/common";
import { AppService } from "./app.service";
// !
import { AppGateway } from "./app.gateway";
import { PrismaService } from "./prisma.service";

@Module({
  imports: [],
  controllers: [],
  // !
  providers: [PrismaService, AppService, AppGateway]
})
export class AppModule {}
```

На этом разработка сервера завершена. Переходим к разработке клиента.

## Клиент

Переходим в директорию клиента и инициализируем `Tailwind`:

```bash
cd client

yarn add -D tailwindcss postcss autoprefixer
yarn tailwindcss init -p
```

Редактируем файл `tailwind.config.js`:

```tsx
/** @type {import('tailwindcss').Config} */
module.exports = {
  // !
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {}
  },
  plugins: []
}
```

Добавляем директивы `@tailwind` в файл `App.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Переопределяем дефолтный шрифт и добавляем несколько переиспользуемых стилей (reused styles):

```css
@layer base {
  html {
    font-family: "Montserrat", sans-serif;
  }
}

@layer components {
  #root {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
  }

  .title {
    @apply mb-4 text-2xl text-center font-bold;
  }

  .btn {
    @apply py-2 px-4 text-white rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-opacity-75 transition-all duration-150;
  }

  .btn-primary {
    @apply btn bg-blue-500 hover:bg-blue-600 focus:ring-blue-400;
  }

  .btn-success {
    @apply btn bg-green-500 hover:bg-green-600 focus:ring-green-400;
  }

  .btn-error {
    @apply btn bg-red-500 hover:bg-red-600 focus:ring-red-400;
  }

  .input {
    @apply py-2 px-4 border border-blue-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-150;
  }
}
```

Подключаем шрифт в файле `index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" href="data:." />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React Nest Postgres Chat</title>
    <!-- ! -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Montserrat&display=swap"
      rel="stylesheet"
    />
    <!-- ! -->
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Устанавливаем несколько библиотек:

```bash
yarn add socket.io-client react-icons react-timeago react-toastify
```

- [socket.io-client](https://www.npmjs.com/package/Socket.IO-client) - клиент `Socket.IO`;
- [react-icons](https://www.npmjs.com/package/react-icons) - иконки в виде компонентов;
- [react-timeago](https://www.npmjs.com/package/react-timeago) - компонент для форматирования даты и времени с обновлением в реальном времени;
- [react-toastify](https://www.npmjs.com/package/react-toastify) - библиотека для реализации всплывающих уведомлений.

Приводим файлы клиента к следующей структуре:

```
- src
  - components
    - ChatScreen.tsx
    - index.ts
    - WelcomeScreen.tsx
  - hooks
    - useChat.ts
  - App.css
  - App.tsx
  - constants.ts
  - main.ts
  - types.ts
  - utils.ts
- postcss.config.js
- tailwind.config.js
- ...
```

Определяем константы в файле `constants.ts`:

```tsx
// ключ для `localStorage`
export const USER_INFO = "user-info";
// адрес шлюза на сервере
export const SERVER_URI = "http://localhost:3001/chat";
```

Определяем типы в файле `types.ts`:

```tsx
import { Prisma } from "@prisma/client";

export type UserInfo = {
  userId: string;
  userName: string;
};

export type MessageUpdatePayload = Prisma.MessageWhereUniqueInput &
  Pick<Prisma.MessageUpdateInput, "text">;
```

И утилиты в файле `utils.ts`:

```tsx
// утилита для генерации идентификатора пользователя
export const getId = () => Math.random().toString(36).slice(2);

// утилита для работы с `localStorage`
export const storage = {
  set<T>(key: string, value: T) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  get<T>(key: string): T | null {
    return localStorage.getItem(key)
      ? JSON.parse(localStorage.getItem(key) as string)
      : null;
  }
};
```

Начнем, пожалуй, с основного компонента приложения (`App.tsx`):

```tsx
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import { ChatScreen, WelcomeScreen } from "./components";
import { USER_INFO } from "./constants";
import { UserInfo } from "./types";
import { storage } from "./utils";

function App() {
  const userInfo = storage.get<UserInfo>(USER_INFO);

  return (
    <section className="w-[480px] h-full mx-auto flex flex-col py-4">
      {userInfo ? <ChatScreen /> : <WelcomeScreen />}
    </section>
  );
}

export default App;
```

Если в локальном хранилище содержится информация о пользователе, рендерится экран чата. В противном случае, рендерится экран приветствия.

Экран приветствия (`ChatScreen.tsx`):

```tsx
import React, { useState } from "react";
import { FiUser } from "react-icons/fi";
import { USER_INFO } from "../constants";
import { UserInfo } from "../types";
import { getId, storage } from "../utils";

export const WelcomeScreen = () => {
  const [userName, setUserName] = useState("");

  const changeUserName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserName(e.target.value);
  };

  const setUserInfo = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = userName.trim();
    if (!trimmed) return;

    // генерируем идентификатор пользователя
    const userId = getId();
    // сохраняем информацию о пользователе в локальном хранилище
    storage.set<UserInfo>(USER_INFO, { userName: trimmed, userId });

    // и перезагружаем локацию
    location.reload();
  };

  return (
    <section>
      <h1 className="title">Welcome, friend!</h1>
      <form onSubmit={setUserInfo} className="flex flex-col items-center gap-4">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="username"
            className="text-lg flex items-center justify-center"
          >
            <span className="mr-1">
              <FiUser />
            </span>
            <span>What is your name?</span>
          </label>
          <input
            type="text"
            id="username"
            name="userName"
            value={userName}
            onChange={changeUserName}
            required
            autoComplete="off"
            className="input"
          />
        </div>
        <button className="btn-success">Start chat</button>
      </form>
    </section>
  );
};
```

Инкапсулируем логику обработки событий сокетов в кастомном хуке (`useChat.ts`):

```tsx
import { Message, Prisma } from "@prisma/client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { io, Socket } from "Socket.IO-client";
import { SERVER_URI, USER_INFO } from "../constants";
import { MessageUpdatePayload, UserInfo } from "../types";
import { storage } from "../utils";

// экземпляр сокета
let socket: Socket;

export const useChat = () => {
  const userInfo = storage.get<UserInfo>(USER_INFO) as UserInfo;

  // это важно: один пользователь - один сокет
  if (!socket) {
    socket = io(SERVER_URI, {
      // помните сигнатуру объекта `handshake` на сервере?
      query: {
        userName: userInfo.userName
      }
    });
  }

  const [messages, setMessages] = useState<Message[]>();
  const [log, setLog] = useState<string>();

  useEffect(() => {
    // подключение/отключение пользователя
    socket.on("log", (log: string) => {
      setLog(log);
    });

    // получение сообщений
    socket.on("messages", (messages: Message[]) => {
      setMessages(messages);
    });

    socket.emit("messages:get");
  }, []);

  // отправка сообщения
  const send = useCallback((payload: Prisma.MessageCreateInput) => {
    socket.emit("message:post", payload);
  }, []);

  // обновление сообщения
  const update = useCallback((payload: MessageUpdatePayload) => {
    socket.emit("message:put", payload);
  }, []);

  // удаление сообщения
  const remove = useCallback((payload: Prisma.MessageWhereUniqueInput) => {
    socket.emit("message:delete", payload);
  }, []);

  // очистка сообщения - для отладки при разработке
  // можно вызывать в консоли браузера, например
  window.clearMessages = useCallback(() => {
    socket.emit("messages:clear");
    location.reload();
  }, []);

  // операции
  const chatActions = useMemo(
    () => ({
      send,
      update,
      remove
    }),
    []
  );

  return { messages, log, chatActions };
};
```

Наконец, экран чата (`ChatScreen.tsx`):

```tsx
import React, { useEffect, useState } from "react";
import { FiEdit2, FiSend, FiTrash } from "react-icons/fi";
import { MdOutlineClose } from "react-icons/md";
import TimeAgo from "react-timeago";
import { Slide, toast, ToastContainer } from "react-toastify";
import { USER_INFO } from "../constants";
import { useChat } from "../hooks/useChat";
import { UserInfo } from "../types";
import { storage } from "../utils";

// уведомление о подключении/отключении пользователя
const notify = (message: string) =>
  toast.info(message, {
    position: "top-left",
    autoClose: 1000,
    hideProgressBar: true,
    transition: Slide
  });

export const ChatScreen = () => {
  const userInfo = storage.get<UserInfo>(USER_INFO) as UserInfo;
  const { userId, userName } = userInfo;

  // получаем сообщения, лог и операции
  const { messages, log, chatActions } = useChat();

  const [text, setText] = useState("");
  // индикатор состояния редактирования сообщения
  const [editingState, setEditingState] = useState(false);
  // идентификатор редактируемого сообщения
  const [editingMessageId, setEditingMessageId] = useState(0);

  const changeText = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = text.trim();
    if (!trimmed) return;

    const message = {
      userId,
      userName,
      text
    };

    // если компонент находится в состоянии редактирования
    if (editingState) {
      // обновляем сообщение
      chatActions.update({ id: editingMessageId, text });
      setEditingState(false);
    // иначе
    } else {
      // отправляем сообщение
      chatActions.send(message);
    }

    setText("");
  };

  const removeMessage = (id: number) => {
    chatActions.remove({ id });
  };

  // эффект для отображения уведомлений при изменении лога
  useEffect(() => {
    if (!log) return;

    notify(log);
  }, [log]);

  return (
    <>
      <h1 className="title">Let's Chat</h1>
      <div className="flex-1 flex flex-col">
        {messages &&
          messages.length > 0 &&
          messages.map((message) => {
            // определяем принадлежность сообщения пользователю
            const isMsgBelongsToUser = message.userId === userInfo.userId;

            return (
              <div
                key={message.id}
                // цвет фона сообщения зависит от 2 факторов:
                // 1) принадлежность пользователю;
                // 2) состояние редактирования
                className={[
                  "my-2 p-2 rounded-md text-white w-1/2",
                  isMsgBelongsToUser
                    ? "self-end bg-green-500"
                    : "self-start bg-blue-500",
                  editingState ? "bg-gray-300" : ""
                ].join(" ")}
              >
                <div className="flex justify-between text-sm mb-1">
                  <p>
                    By <span>{message.userName}</span>
                  </p>
                  <TimeAgo date={message.createdAt} />
                </div>
                <p>{message.text}</p>
                {/* пользователь может редактировать и удалять только принадлежащие ему сообщения */}
                {isMsgBelongsToUser && (
                  <div className="flex justify-end gap-2">
                    <button
                      disabled={editingState}
                      className={`${
                        editingState ? "hidden" : "text-orange-500"
                      }`}
                      // редактирование сообщения
                      onClick={() => {
                        setEditingState(true);
                        setEditingMessageId(message.id);
                        setText(message.text);
                      }}
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      disabled={editingState}
                      className={`${
                        editingState ? "hidden" : "text-red-500"
                      }`}
                      // удаление сообщения
                      onClick={() => {
                        removeMessage(message.id);
                      }}
                    >
                      <FiTrash />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
      </div>
      {/* отправка сообщения */}
      <form onSubmit={sendMessage} className="flex items-stretch">
        <div className="flex-1 flex">
          <input
            type="text"
            id="message"
            name="message"
            value={text}
            onChange={changeText}
            required
            autoComplete="off"
            className="input flex-1"
          />
        </div>
        {editingState && (
          <button
            className="btn-error"
            type="button"
            // отмена редактирования
            onClick={() => {
              setEditingState(false);
              setText("");
            }}
          >
            <MdOutlineClose fontSize={18} />
          </button>
        )}
        <button className="btn-primary">
          <FiSend fontSize={18} />
        </button>
      </form>
      {/* контейнер для уведомлений */}
      <ToastContainer />
    </>
  );
};
```

На этом разработка клиента также завершена. Посмотрим, как выглядит наш чат и убедимся в его работоспособности.

## Результат

Находясь в корневой директории проекта, выполняем команду `yarn dev` и открываем 2 вкладки браузера по адресу `http://localhost:3000` (хотя бы одну вкладку необходимо открыть в режиме инкогнито):

<img src="https://habrastorage.org/webt/gf/rx/w1/gfrxw1dcgdxy0m0rcl8ish-nxvo.png" />
<br />

Вводим имя пользователя, например, `Bob` в одной из вкладок и нажимаем `Start chat`:

<img src="https://habrastorage.org/webt/it/cv/ng/itcvngvjcg9pfw0oo7cvszppko4.png" />
<br />

Делаем то же самое (только с другим именем, например, `Alice`) в другой вкладке:

<img src="https://habrastorage.org/webt/f2/mu/pb/f2mupbl50ytfb1qe8a25ye9gryo.png" />
<br />

Получаем в первой вкладке сообщение о подключении `Alice`.

Данные пользователя можно найти в разделе `Storage -> Local Storage` вкладки `Application` инструментов разработчика в браузере:

<img src="https://habrastorage.org/webt/qe/if/qc/qeifqc3bocollapqrzib-kssrb8.png" />
<br />

Обмениваемся сообщениями:

<img src="https://habrastorage.org/webt/zt/sq/yz/ztsqyzekwoheisqxwnptczi6tn0.png" />
<br />

Как проверить, что сообщения записываются в БД? С `Prisma` - сделать это проще простого. Выполняем команду `yarn prisma studio` и в открывшейся по адресу `http://localhost:5555` вкладке выбираем модель `Message`:

<img src="https://habrastorage.org/webt/a6/47/qr/a647qrqozkex9qtn-dtekvc2ji4.png" />
<br />

Пробуем редактировать и удалять сообщения - все работает, как ожидается:

<img src="https://habrastorage.org/webt/ld/vc/g6/ldvcg62fynz1kvui2xxpok0bkb4.png" />
<br />

Закрываем одну из вкладок:

<img src="https://habrastorage.org/webt/f2/2h/hu/f22hhupahshtnifpqfmbmqvwvns.png" />
<br />

Получаем во второй вкладке сообщение об отключении `Alice`.

Открываем консоль инструментов разработчика и вызываем метод `clearMessages`. Все сообщения удаляются, вкладка перезагружается:

<img src="https://habrastorage.org/webt/kp/-t/zr/kp-tzrtv4l-d54en7enj7aev-ay.png" />
<br />

Благодарю за внимание и happy coding!
