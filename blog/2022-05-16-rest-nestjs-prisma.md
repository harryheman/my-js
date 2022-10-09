---
slug: rest-nestjs-prisma
title: Разрабатываем TypeScript + NestJS + Prisma + AdminJS + Swagger REST API
description: Туториал по разработке REST API с помощью TypeScript, NestJS, Prisma, AdminJS и Swagger
authors: harryheman
tags: ["node.js", nodejs, rest, api, typescript, ts, "nest.js", nestjs, prisma, "admin.js", adminjs, swagger, tutorial, туториал]
image: https://habrastorage.org/webt/ma/po/lv/mapolvqq4uunxfqoaviv3g9km9y.jpeg
---

<img src="https://habrastorage.org/webt/ma/po/lv/mapolvqq4uunxfqoaviv3g9km9y.jpeg" />

Привет, друзья!

В данном туториале мы разработаем простой сервер на [NestJS](https://nestjs.com/), взаимодействующий с [SQLite](https://www.sqlite.org/index.html) с помощью [Prisma](https://www.prisma.io/), с административной панелью, автоматически генерируемой с помощью [AdminJS](https://docs.adminjs.co/), и описанием интерфейса, автоматически генерируемым с помощью [Swagger](https://swagger.io/). Все это будет приготовлено под соусом [TypeScript](https://www.typescriptlang.org/).

[Репозиторий с кодом проекта](https://github.com/harryheman/Blog-Posts/tree/master/nestjs-prisma).

<!--truncate-->

_NestJS_ - это фреймворк для разработки эффективных и масштабируемых серверных приложений на [Node.js](https://nodejs.org/en/). Данный фреймворк использует прогрессивный (что означает текущую версию _ECMAScript_) _JavaScript_ с полной поддержкой _TypeScript_ (использование _TypeScript_ является опциональным) и сочетает в себе элементы объектно-ориентированного, функционального и реактивного функционального программирования.

Под капотом _NestJS_ использует [Express](https://expressjs.com/ru/) (по умолчанию), но также позволяет переключиться на [Fastify](https://www.fastify.io/).

- [Руководство по NestJS](https://habr.com/ru/company/timeweb/blog/663234/)
- [Шпаргалка по Express API](https://my-js.org/docs/cheatsheet/express-api/)
- [Карманная книга по TypeScript](https://my-js.org/docs/guide/ts)
- [Шпаргалка по TypeScript](https://my-js.org/docs/cheatsheet/ts/)

_Prisma_ - это современное [объектно-реляционное отображение](https://ru.wikipedia.org/wiki/ORM) (Object Relational Mapping, ORM) для _Node.js_ и _TypeScript_. Проще говоря, _Prisma_ - это инструмент, позволяющий работать с реляционными (_PostgreSQL_, _MySQL_, _SQL Server_, _SQLite_) и нереляционной (_MongoDB_) базами данных с помощью _JavaScript_ или _TypeScript_ без использования [SQL](https://ru.wikipedia.org/wiki/SQL), хотя такая возможность все же имеется.

- [Руководство по Prisma](https://my-js.org/docs/guide/prisma)

_AdminJS_ - это инструмент, позволяющий внедрять в приложение автоматически генерируемый интерфейс админки на [React](https://ru.reactjs.org/). Интерфейс генерируется на основе моделей БД и позволяет управлять ее содержимым.

_Swagger_ - это инструмент, позволяющий внедрять в приложение автоматически генерируемое описание интерфейса. Интерфейс генерируется на основании маршрутов (роутов) приложения. Специальные комментарии позволяют формировать дополнительную информацию о конечных точках.

- [Туториал по документированию и визуализации API с помощью Swagger](https://habr.com/ru/company/timeweb/blog/594081/)

## Подготовка и настройка проекта

Глобально устанавливаем _NestJS CLI_ и создаем _NestJS-проект_,:

```bash
yarn global add @nestjs/cli
# or
npm i -g @nestjs/cli

# nestjs-prisma - название проекта/директории
nest new nestjs-prisma
```

Переходим в созданную директорию и устанавливаем _Prisma_ в качестве зависимости для разработки:

```bash
cd nestjs-prisma

yarn add -D prisma
# or
npm i -D prisma
```

Инициализируем _Prisma-проект_:

```bash
yarn prisma init
# or
npx prisma init
```

Выполнение данной команды приводит к генерации файла _prisma/schema.prisma_, определяющего подключение к БД, генератор, используемый для генерации клиента _Prisma_, и схему БД, а также файла _.env_ с переменной среды окружения _DATABASE_URL_, значением которой является строка, используемая _Prisma_ для подключения к БД.

Редактируем файл _schema.prisma_ - изменяем дефолтный провайдер _postgresql_ на _sqlite_:

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

_Обратите внимание_: для работы со схемой _Prisma_ удобно пользоваться [этим расширением для VSCode](https://marketplace.visualstudio.com/items?itemName=Prisma.prisma).

Определяем строку подключения к БД в файле _.env_:

```env
DATABASE_URL="file:./dev.db"
```

_Обратите внимание_: БД _SQLite_ - это просто файл, для работы с ним не требуется отдельный сервер.

Наша БД будет содержать 2 таблицы: для пользователей и постов.

Определяем соответствующие модели в файле _schema.prisma_:

```prisma
model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
  posts Post[]
}

model Post {
  id        Int     @id @default(autoincrement())
  title     String
  content   String?
  published Boolean @default(false)
  authorId  Int
  author    User    @relation(fields: [authorId], references: [id])
}
```

_Обратите внимание_: между таблицами существуют отношения один-ко-многим (one-to-many), т.е. одному пользователю может принадлежать несколько постов (у каждого поста должен быть автор). Также _обратите внимание_, что данные пользователя должны содержать, как минимум, адрес электронной почты, а данные поста, как минимум - заголовок и автора.

Выполняем миграцию:

```bash
# init - название миграции
yarn prisma migrate dev --name init
# or
npx prisma ...
```

Выполнение данной команды приводит к генерации файла _prisma/dev.db_, содержащего БД, и файла _prisma/migrations/20220506124711_init/migration.sql_ (у вас название директории с файлом _migration.sql_ будет другим) с миграцией на _SQL_. Также запускается установка клиента _Prisma_. Если по какой-то причине этого не произошло, клиента необходимо установить вручную:

```bash
yarn add @prisma/client
# or
npm i @prisma/client
```

_Обратите внимание_: клиент _Prisma_ устанавливается в качестве производственной зависимости.

Также _обратите внимание_, что установка клиента _Prisma_ приводит к автоматическому выполнению команды `prisma generate` для генерации типов _TypeScript_ для всевозможных вариаций моделей БД. При внесении каких-либо изменений в существующие модели, добавлении новых моделей и т.п. может потребоваться выполнить эту команду вручную для обновления клиента (приведения его в соответствие с БД).

На этом подготовка и настройка проекта завершены и можно приступать к разработке _REST API_.

## Разработка REST API

При разработке _REST API_, подключении _AdminJS_ и _Swagger_ мы будем работать с файлами, находящими в директории _src_.

Начнем с создания _PrismaService_, отвечающего за инстанцирование (создание экземпляра) _PrismaClient_ и подключение к БД (а также отключение от нее). Создаем файл _prisma.service.ts_ следующего содержания:

```javascript
import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    // подключаемся к БД при инициализации модуля
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      // закрываем приложение при отключении от БД
      await app.close();
    });
  }
}
```

Теперь займемся сервисами для обращения к БД с помощью моделей _User_ и _Post_ из схемы _Prisma_.

Создаем файл _user.service.ts_ следующего содержания:

```javascript
import { Injectable } from '@nestjs/common';
// преимущество использования `Prisma` в `TypeScript-проекте` состоит в том,
// что `Prisma` автоматически генерирует типы для моделей и их вариаций
import { User, Prisma } from '@prisma/client';
import { PrismaService } from './prisma.service';

@Injectable()
export class UserService {
  // внедряем зависимость
  constructor(private prisma: PrismaService) {}

  // получение пользователя по email
  async user(where: Prisma.UserWhereUniqueInput): Promise<User | null> {
    return this.prisma.user.findUnique({
      where,
    });
  }

  // получение всех пользователей
  async users(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<User[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  // создание пользователя
  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  // обновление пользователя
  async updateUser(params: {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUpdateInput;
  }): Promise<User> {
    const { where, data } = params;
    return this.prisma.user.update({
      data,
      where,
    });
  }

  // удаление пользователя
  async removeUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
    return this.prisma.user.delete({ where });
  }
}
```

Создаем файл _post.service.ts_ следующего содержания:

```javascript
import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Post, Prisma } from '@prisma/client';

type GetPostsParams = {
  skip?: number;
  take?: number;
  cursor?: Prisma.PostWhereUniqueInput;
  where?: Prisma.PostWhereInput;
  orderBy?: Prisma.PostOrderByWithRelationInput;
};

@Injectable()
export class PostService {
  constructor(private prisma: PrismaService) {}

  // получение поста по id
  async post(where: Prisma.PostWhereUniqueInput): Promise<Post | null> {
    return this.prisma.post.findUnique({ where });
  }

  // получение всех постов
  async posts(params: GetPostsParams) {
    return this.prisma.post.findMany(params);
  }

  // создание поста
  async createPost(data: Prisma.PostCreateInput): Promise<Post> {
    return this.prisma.post.create({ data });
  }

  // обновление поста
  async updatePost(params: {
    where: Prisma.PostWhereUniqueInput;
    data: Prisma.PostUpdateInput;
  }): Promise<Post> {
    return this.prisma.post.update(params);
  }

  // удаление поста
  async removePost(where: Prisma.PostWhereUniqueInput): Promise<Post> {
    return this.prisma.post.delete({ where });
  }
}
```

Определим несколько роутов в основном контроллере приложения. Редактируем файл _app.controller.ts_:

```javascript
import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import { PostService } from './post.service';
import { User as UserModel, Post as PostModel } from '@prisma/client';

type UserData = { email: string; name?: string };

type PostData = {
  title: string;
  content?: string;
  authorEmail: string;
};

// добавляем префикс пути
@Controller('api')
export class AppController {
  constructor(
    // внедряем зависимости
    private readonly userService: UserService,
    private readonly postService: PostService,
  ) {}

  @Get('post/:id')
  async getPostById(@Param('id') id: string): Promise<PostModel> {
    return this.postService.post({ id: Number(id) });
  }

  @Get('feed')
  async getPublishedPosts(): Promise<PostModel[]> {
    return this.postService.posts({
      where: {
        published: true,
      },
    });
  }

  @Get('filtered-posts/:searchString')
  async getFilteredPosts(
    @Param('searchString') searchString: string,
  ): Promise<PostModel[]> {
    return this.postService.posts({
      where: {
        OR: [
          {
            title: { contains: searchString },
          },
          {
            content: { contains: searchString },
          },
        ],
      },
    });
  }

  @Post('post')
  async createDraft(@Body() postData: PostData): Promise<PostModel> {
    const { title, content, authorEmail } = postData;

    return this.postService.createPost({
      title,
      content,
      author: {
        connect: { email: authorEmail },
      },
    });
  }

  @Put('publish/:id')
  async publishPost(@Param('id') id: string): Promise<PostModel> {
    return this.postService.updatePost({
      where: { id: Number(id) },
      data: { published: true },
    });
  }

  @Delete('post/:id')
  async removePost(@Param('id') id: string): Promise<PostModel> {
    return this.postService.removePost({ id: Number(id) });
  }

  @Post('user')
  async registerUser(@Body() userData: UserData): Promise<UserModel> {
    return this.userService.createUser(userData);
  }
}
```

Контроллер реализует следующие роуты:

- _GET_:
  - _/post/:id_: получение поста по _id_;
  - _/feed_: получение всех _опубликованных_ постов;
  - _filtered-posts/:searchString_: получение постов, _отфильтрованных_ по заголовку или содержимому;
- _POST_:
  - _/post_: создание поста:
    - тело запроса:
      - _title: String_ (обязательно): заголовок;
      - _content: String_ (опционально): содержимое;
      - _authorEmail: String_ (обязательно): _email_ автора;
  - _/user_: создание пользователя:
    - тело запроса:
      - _email: String_ (обязательно): адрес электронной почты;
      - _name: String_ (опционально): имя;
- _PUT_:
  - _/publish/:id_: публикация поста по _id_;
- _DELETE_:
  - _/post/:id_: удаление поста по _id_.

_Обратите внимание_: ко всем роутам будет автоматически добавлен префикс пути, определенный в контроллере (_api_). Также _обратите внимание_, что в реальном приложении большинство (если не все) роуты, связанные с постами, будут защищенными (private), т.е. доступными только зарегистрированным и авторизованным пользователям (выполняющим запрос с токеном доступа - access token).

Внедряем провайдеры в основной модуль приложения (_app.module.ts_):

```javascript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
// !
import { PrismaService } from './prisma.service';
import { UserService } from './user.service';
import { PostService } from './post.service';

@Module({
  imports: [],
  controllers: [AppController],
  // !
  providers: [PrismaService, UserService, PostService],
})
export class AppModule {}
```

Для корректной работы _Prisma_ с _enableShutdownHooks_ требуется немного отредактировать файл _main.ts_:

```javascript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // !
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);
  await app.listen(3000);
}
bootstrap();
```

На этом разработка _REST API_ завершена. Давайте убедимся в работоспособности сервера. Для этого я буду использовать [Insomnia](https://insomnia.rest/download).

Запускаем сервер в режиме для разработки:

```bash
yarn start:dev
# or
npm run start:dev
```

Сам сервер доступен по адресу _http://localhost:3000_, а определенный нами _REST API_ по адресу _http://localhost:3000/api_.

Регистрируем нового пользователя с именем _Bob_ и адресом электронной почты _bob@email.com_:

<img src="https://habrastorage.org/webt/lw/zu/au/lwzuaug6rrtdfnpo6_4otbs8c2w.png" />

Создаем от имени _Bob_ 3 поста:

<img src="https://habrastorage.org/webt/8z/zz/sx/8zzzsxsusrbim56x1dlhtfzxs_o.png" />
<img src="https://habrastorage.org/webt/na/at/rz/naatrzhy2soklglx1vxloxqkcr0.png" />
<img src="https://habrastorage.org/webt/xd/ps/34/xdps34mb8w7qnhksxxtg145a8xs.png" />

Получаем пост с _id_, равным _4_:

<img src="https://habrastorage.org/webt/jz/2q/ng/jz2qngzkyszlfqm1vtt6h6fegou.png" />

Публикуем посты с _id_, равными _5_ и _6_:

<img src="https://habrastorage.org/webt/5a/ds/jw/5adsjwqhcewd34m3q8bmz0uw5em.png" />
<img src="https://habrastorage.org/webt/55/na/vd/55navdx80cydn2rtblyuguyzaac.png" />

Получаем опубликованные посты:

<img src="https://habrastorage.org/webt/x8/xs/u8/x8xsu8vvm7jeseohaznrotil1vk.png" />

Получаем посты, в заголовке или содержимом которых встречается слово _title2_ (независимо от регистра):

<img src="https://habrastorage.org/webt/nd/so/7x/ndso7xod2_vzkliwuxavyjk-ptk.png" />

Удаляем пост с _id_, равным _5_:

<img src="https://habrastorage.org/webt/m9/pa/64/m9pa64j2dq0dudj5kwqdytkgrau.png" />

Получаем посты, в которых встречается слово _title_ (в нашем случае, все посты):

<img src="https://habrastorage.org/webt/bi/04/lb/bi04lbincdrgprykcwcavxw_-y0.png" />

Отлично, сервер работает, как ожидается.

Приступим к внедрению в приложение админки.

## Внедрение админки

_Обратите внимание_: модули _AdminJS_ для работы с _NestJS_ и _Prisma_ являются экспериментальными, т.е. находятся в стадии активной разработки. Это означает, что способ их подключения и использования в будущем может измениться.

- [Модуль для работы с NestJS](https://docs.adminjs.co/module-@adminjs_nestjs.html)
- [Модуль для работы с Prisma](https://github.com/SoftwareBrothers/adminjs-prisma)

Устанавливаем зависимости:

```bash
yarn add adminjs @adminjs/nestjs express @adminjs/express express-formidable express-session
# or
npm i ...
```

_Обратите внимание_: несмотря на то, что _Express_ является зависимостью _NestJS_ (поскольку используется в качестве дефолтной нижележащей платформы - underlying platform), для корректной работы _AdminJS_ он должен быть установлен в качестве производственной зависимости приложения. Также _обратите внимание_, что согласно документации _AdminJS_, установка пакета _express-session_ является опциональной, но на сегодняшний день это не так: без него _@adminjs/express_ категорически отказывается от сотрудничества, а без _@adminjs/express_ не работает _@adminjs/nestjs_.

Оформим код _AdminJS_ в виде отдельного модуля. Создаем файл _admin.module.ts_ следующего содержания:

```javascript
import AdminJS from 'adminjs';
// без этого `@adminjs/nestjs` по какой-то причине "не видит" `@aminjs/express`, необходимый ему для работы
import '@adminjs/express';
import { AdminModule } from '@adminjs/nestjs';
import { Database, Resource } from '@adminjs/prisma';
// мы не можем использовать `User` и `Post` из `@prisma/client`,
// поскольку нам нужны модели, а не типы,
// поэтому приходится делать так
import { PrismaClient } from '@prisma/client';
import { DMMFClass } from '@prisma/client/runtime';
1;

const prisma = new PrismaClient();
const dmmf = (prisma as any)._dmmf as DMMFClass;

AdminJS.registerAdapter({ Database, Resource });

export default AdminModule.createAdmin({
  adminJsOptions: {
    // путь к админке
    rootPath: '/admin',
    // в этом списке должны быть указаны все модели/таблицы БД,
    // доступные для редактирования
    resources: [
      {
        resource: { model: dmmf.modelMap.User, client: prisma },
      },
      {
        resource: { model: dmmf.modelMap.Post, client: prisma },
      },
    ],
  },
});
```

Подключаем (импортируем) этот модуль в _AppModule_:

```javascript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaService } from './prisma.service';
import { UserService } from './user.service';
import { PostService } from './post.service';
// !
import AdminModule from './admin.module';

@Module({
  // !
  imports: [AdminModule],
  controllers: [AppController],
  providers: [PrismaService, UserService, PostService],
})
export class AppModule {}
```

Перезапускаем сервер и переходим по адресу _http://localhost:3000/admin_:

<img src="https://habrastorage.org/webt/kb/pz/de/kbpzde9wjbyskuqv8drxcre7w34.png" />

Изучим содержимое таблицы постов. Для этого нажимаем на _Post_ на панели навигации слева:

<img src="https://habrastorage.org/webt/5a/5g/pq/5a5gpqqkv5bduui-j9mtfb_5wgg.png" />

Стандартный интерфейс админки позволяет создавать новые записи, редактировать и удалять существующие, а также фильтровать записи по полям.

Редактируем запись с _id_, равным _4_: изменяем заголовок на _Title2_, содержимое на _Content2_ и публикуем пост. Удаляем запись с _id_ === _6_ и создаем запись с заголовком _Title4_ и содержимым _Content4_:

<img src="https://habrastorage.org/webt/ij/qd/54/ijqd54akyq5o_hhxvm3jqescim0.png" />

Возвращаемся в _Insomnia_ и получаем все посты (в которых встречается слово _title_):

<img src="https://habrastorage.org/webt/f2/p2/iq/f2p2iqh2knbolpcajdg4lao8m5i.png" />

Как видим, выполненные в админке операции привели к обновлению данных в базе.

_Обратите внимание_: если функционал вашей админки будет ограничен редактированием записей в БД, лучше воспользоваться решением, предоставляемым _Prisma_, что называется, из коробки. Речь идет о _Prisma Studio_.

Запускаем _Prisma Studio_ с помощью следующей команды:

```bash
yarn prisma studio
# or
npx prisma studio
```

Переходим по адресу _http://localhost:5555_:

<img src="https://habrastorage.org/webt/oc/1o/l-/oc1ol-cqhpvxwo08oz_kkvqy5cs.png" />
<img src="https://habrastorage.org/webt/hs/jz/3d/hsjz3dqav8r_mntflgj0ymzw2es.png" />

_Prisma Studio_ предназначен исключительно для редактирования записей в БД. _AdminJS_ предоставляет более широкие возможности по работе с данными и не только.

На этом разработка админки завершена.

Приступим к внедрению в приложение документации.

## Внедрение документации

С внедрением в приложение документации все гораздо проще, поскольку _NestJS_ поддерживает _Swagger_ (_Open API_) из коробки.

Устанавливаем зависимости:

```bash
yarn add @nestjs/swagger swagger-ui-express
# or
npm i ...
```

Подключаем _Swagger_ в основном файле приложения (_main.ts_):

```javascript
import { NestFactory } from '@nestjs/core';
// swagger
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { PrismaService } from './prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // prisma
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);
  // swagger
  const config = new DocumentBuilder()
    // заголовок
    .setTitle('Title')
    // описание
    .setDescription('Description')
    // версия
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  // первый параметр - префикс пути, по которому будет доступна документация
  SwaggerModule.setup('swagger', app, document);

  await app.listen(3000);
}
bootstrap();
```

Перезапускаем сервер и переходим по адресу _http://localhost:3000/swagger_:

<img src="https://habrastorage.org/webt/9b/mc/hu/9bmchuoam_w9otnr1u_jp_6bxgu.png" />
<img src="https://habrastorage.org/webt/3s/vx/0-/3svx0-cxorcbve7l28kssphizms.png" />

Как видим, _Swagger_ успешно разрешил (обнаружил и проанализировал) все роуты нашего приложения. Форму (shape) ответов и другую дополнительную информацию о маршрутах можно определить вручную с помощью специальных комментариев.

Для того, чтобы получить сгенерированные _Swagger_ данные в виде JSON-объекта следует перейти по адресу _http://localhost:3000/swagger-json_:

<img src="https://habrastorage.org/webt/wz/bn/vd/wzbnvdk8tvjmyfcostz3pbovjp0.png" />

Подробнее о поддержке _NestJS_ спецификации _Open API_ можно почитать [здесь](https://docs.nestjs.com/openapi/introduction).

Таким образом, нам удалось минимальными усилиями реализовать относительно полноценный и полностью типизированный ("типобезопасный" - type safe) _REST API_ с автоматически генерируемой админкой и документацией.

Благодарю за внимание и happy coding!
