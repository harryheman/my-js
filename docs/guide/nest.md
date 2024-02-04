---
sidebar_position: 18
title: Руководство по NestJS
description: Руководство по NestJS
keywords: ["nest.js", nestjs, nest, "node.js", nodejs]
tags: ["nest.js", nestjs, nest, "node.js", nodejs]
---

# NestJS

> WIP

[NestJS](https://nestjs.com/) - это фреймворк для разработки эффективных и масштабируемых серверных приложений на [Node.js](https://nodejs.org/en/), в котором используется прогрессивный (что означает текущую версию _ECMAScript_) _JavaScript_ с полной поддержкой TypeScript (использование последнего является опциональным) и сочетает в себе элементы объектно-ориентированного, функционального и реактивного функционального программирования.

Под капотом _Nest_ по умолчанию использует [Express](https://expressjs.com/ru/), но также позволяет переключиться [Fastify](https://www.fastify.io/).

__Установка__

```bash
yarn add global @nestjs/cli
# or
npm i -g @nestjs/cli
```

__Создание проекта__

```bash
# project-name - название создаваемого проекта
nest new [project-name]
```

### Первые шаги

Выполнение команды `nest new` приводит к генерации следующих файлов:

```
src
  app.controller.spec.ts
  app.controller.ts
  app.module.ts
  app.service.ts
  main.ts
```

- _app.controller.ts_ - базовый (basic) контроллер с одним роутом (обработчиком маршрута или пути);
- _app.controller.spec.ts_ - юнит-тесты для контроллера;
- _app.module.ts_ - корневой (root) модуль приложения;
- _app.service.ts_ - базовый сервис с одним методом;
- _main.ts_ - входной (entry) файл приложения, в котором используется класс _NestFactory_ для создания экземпляра приложения _Nest_.

_main.ts_ содержит асинхронную функцию, которая инициализирует (выполняет начальную загрузку, bootstrap) приложения:

```javascript
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  await app.listen(3000)
}
bootstrap()
```

Класс _NestFactory_ предоставляет несколько статических методов (static methods), позволяющих создавать экземпляры приложения. Метод _create_ возвращает объект приложения, соответствующий интерфейсу _INestApplication_. Этот объект предоставляет набор методов, которые будут рассмотрены в следующих разделах.

Структура проекта, создаваемого с помощью _Nest CLI_, предполагает размещение каждого модуля приложения в отдельной директории.

__Команды для запуска приложения__

Запуск приложения в производственном режиме:

```bash
yarn start
# or
npm run start
```

Запуск приложения в режиме для разработки:

```bash
yarn start:dev
# or
npm run start:dev
```

### Контроллеры / Controllers

Контроллеры отвечают за обработку входящих запросов (requests) и формирование ответов (responses).

<img src="https://habrastorage.org/webt/hf/s_/bn/hfs_bnzhfnr4wpkmxarxx8ly6hy.png" />
<br />

Для создания базового контроллера используются классы и декораторы (decorators). Декораторы связывают классы с необходимыми им метаданными и позволяют _Nest_ создавать схему маршрутизации (карту роутинга, routing map) - привязывать запросы к соответствующим контроллерам.

#### Маршрутизация

В приведенном ниже примере мы используем декоратор _@Controller_ для создания базового контроллера. Мы определяем опциональный префикс пути (path prefix) _posts_. Использование префикса пути в _@Controller_ позволяет группировать набор связанных роутов и минимизировать повторяющийся код. Например, мы можем сгруппировать набор роутов для аутентификации и авторизации с помощью префикса _auth_. Использование префикса пути избавляет от необходимости дублировать его в каждом роуте контроллера.

```javascript
// posts.controller.ts
import { Controller, Get } from '@nestjs/common'

@Controller('posts')
export class PostController {
  @Get()
  getAllPosts(): string {
    return 'Все посты'
  }
}
```

Для создания контроллера с помощью _Nest CLI_ можно выполнить команду `nest g controller posts` (g - generate).

Декоратор _@Get_ перед методом _getAllPosts_ указывает _Nest_ создать обработчик для указанной конечной точки (endpoint) для HTTP-запросов. Конечная точка соответствует методу HTTP-запроса (в данном случае _GET_) и пути роута. Путь роута для обработчика определяется посредством объединения опционального префикса пути контроллера и пути, указанного в декораторе метода. Поскольку мы определили префикс для каждого роута (`posts`) и не добавляли информацию о пути в декоратор, _Nest_ привяжет к этому роуту запросы _GET /posts_. Префикс пути _auth_ в сочетании с декоратором _@GET('user')_ приведет к привязке к роуту запросов _GET /auth/user_.

В приведенном примере при выполнении _GET-запросов_ к указанной конечной точке _Nest_ перенаправляет запрос в метод _getAllPosts_. Название метода может быть любым.

Данный метод возвращает статус-код _200_ и ответ в виде строки. _Nest_ предоставляет 2 способа формирования ответов:

- стандартный (рекомендуемый) - когда обработчик запроса возвращает объект или массив, этот объект или массив автоматически сериализуются (serialized) в _JSON_. Примитивные типы (строка, число, логическое значение и т.д.) возвращаются без сериализации. По умолчанию для _GET-запросов_ статус-кодом ответа является _200_, а для _POST-запросов_ - _201_: это можно изменить с помощью декоратора _@HttpCode_ на уровне обработчика;
- специфичный для библиотеки - мы можем использовать специфичный для библиотеки объект ответа, который может быть внедрен (встроен, injected) с помощью декоратора _@Res_ или _@Response_ в сигнатуре обработчика метода (например, _getAllPosts(@Res res)_). В данном случае мы можем использовать методы обработки ответа, предоставляемые библиотекой, например, _res.status(200).send('Все посты')_.

_Обратите внимание_: использование в обработчике декораторов _@Res_ или _@Next_ отключает стандартный подход к обработке ответов, предоставляемый _Nest_. Для того, чтобы иметь возможность использовать оба подхода одновременно (например, для внедрения объекта ответа только для установки куки или заголовков) необходимо установить настройку _passthrough_ в значение _true_ в соответствующем декораторе, например: `@Res({ passthrough: true })`.

#### Объект запроса

Обработчикам часто требуется доступ к деталям запроса. _Nest_ предоставляет доступ к объекту запроса используемой платформы (фреймворка). Мы можем получить доступ к объекту запроса, указав _Nest_ внедрить его с помощью декоратора _@Req_ в обработчике:

```javascript
import { Controller, Get, Req } from '@nestjs/common'
import { Request } from 'express'

@Controller('posts')
export class PostController {
  @Get()
  getAllPosts(@Req req: Request): string {
    return 'Все посты'
  }
}
```

Объект запроса представляет HTTP-запрос и содержит свойства для строки запроса, параметров, HTTP-заголовков и тела запроса. В большинстве случаев нам не требуется извлекать их вручную. Вместо этого, мы можем применить специальные декораторы, такие как _@Body_ или _@Query_. Вот полный список декораторов и соответствующих им объектов:

- `@Request, @Req` - `req`;
- `@Response, @Res` - `res`;
- `@Next` - `next`;
- `@Session` - `req.session`;
- `@Param(key?: string)` - `req.params / req.params[key]`;
- `@Body(key?: string)` - `req.body / req.body[key]`;
- `@Query(key?: string)` - `req.query / req.query[key]`;
- `@Headers(name?: string)` - `req.headers / req.headers[name]`;
- `@Ip` - `req.ip`;
- `@HostParam` - `req.hosts`.

#### Ресурсы

Ранее мы определили конечную точку для получения всех постов (роут _GET_). Как правило, мы также хотим предоставить конечную точку для создания новых постов. Определим обработчик _POST-запросов_:

```javascript
import { Controller, Get, Post } from '@nestjs/common'

@Controller('posts')
export class PostController {
  @Post()
  create(): string {
    return 'Новый пост'
  }

  @Get()
  getAllPosts(): string {
    return 'Все посты'
  }
}
```

_Nest_ предоставляет декораторы для всех стандартных HTTP-методов: _@Get_, _@Post_, _@Put_, _@Delete_, _@Patch_, _@Options_ и _@Head_. Декоратор _@All_ определяет конечную точку для обработки всех методов.

##### Группировка путей на уровне роута / Route wildcards

_Nest_ поддерживает роутинг на основе паттернов (регулярных выражений). Например, символ _*_ совпадает с любой комбинацией символов:

```javascript
@Get('ab*cd')
getAll(): string {
  return '*'
}
```

Путь _ab*cd_ будет совпадать с _abcd_, _ab_cd_, _abecd_ и т.д. В пути роута также могут использоваться символы _?_, _+_ и _()_. Символы _-_ и _._ интерпретируются буквально.

#### Статус-код ответа

Декоратор _@HttpCode_ позволяет определять статус-код ответа:

```javascript
// немного забегая вперед
import { Delete, Param, HttpCode } from 'nestjs/common'
import { GetUser } from 'src/auth/decorator'

@Delete()
@HttpCode(204)
remove(
  @Param('id', ParseIntPipe) postId: number,
  @GetUser('id') userId: number
) {
  return this.postService.remove({ postId, userId })
}
```

Вместо явного определения статус-кода можно использовать значение из перечисления (enum) _HttpStatus_:

```javascript
import { Delete, HttpCode, HttpStatus } from 'nestjs/common'

@Delete()
@HttpCode(HttpStatus.NO_CONTENT)
```

#### Заголовки ответа

Декоратор _@Header_ позволяет определять заголовки ответа:

```javascript
@Post()
@Header('Cache-Control', 'no-cache, no-store, must-revalidate')
create(): string {
  return 'Новый пост'
}
```

#### Перенаправление запроса

Для перенаправления запроса предназначен декоратор _@Redirect_. Он принимает 2 опциональных аргумента: _url_ и _statusCode_. Последний по умолчанию имеет значение _302_.

```javascript
@Get()
@Redirect('https://redirected.com', 301)
```

В случае, когда _url_ или _statusCode_ определяются динамически, для выполнения перенаправления из обработчика можно вернуть такой ответ:

```javascript
{
  url: string,
  statusCode: number
}
```

Возвращаемые значения перезаписывают аргументы, переданные в _@Redirect_:

```javascript
@Get()
@Redirect('https://redirected.com')
get(@Query('version') version: string) {
  if (version) {
    return {
      url: `https://redirected.com/v${version}`
    }
  }
}
```

#### Параметры запроса

Роуты со статическими путями не будут работать в случаях, когда путь включает динамические данные, являющиеся частью запроса (например, _GET posts/1_ для получения поста с идентификатором _1_). Для решения этой задачи мы можем добавить токены (tokens) параметров в путь роута для перехвата динамического значения на указанной позиции в _URL_ запроса. Доступ к параметрам роута можно получить с помощью декоратора _@Param_, который должен быть добавлен в сигнатуру метода:

```javascript
@Get(':id')
getPostById(@Param() params: Record<string, string>): string {
  console.log(params.id)
  return `Пост с идентификатором ${params.id}`
}
```

В _@Param_ мы можем явно указать интересующий нас параметр:

```javascript
@Get(':id')
getPostById(@Param('id') id: string): string {
  return `Пост с идентификатором ${id}`
}
```

#### Тело запроса

Для получения доступа к телу запроса предназначен декоратор _@Body_.

Для определения контракта (contract), которому должен соответствовать объект тела запроса в _Nest_ используется схема объекта передачи данных (Data Transfer Object, DTO), реализуемая в виде класса. Почему не в виде интерфейса _TypeScript_? Потому что классы являются частью _ECMAScript_ и остаются в скомпилированном _JavaScript_ (в отличие от интерфейсов, которые удаляются при преобразовании _TypeScript_ в _JavaScript_). В ряде случаев (например, при использовании _Pipes_, о которых мы поговорим в одном из следующих разделов), _Nest_ требуется доступ к метаданным переменной во время выполнения кода.

Определим класс _CreatePostDto_:

```javascript
// create-post.dto
export class CreatePostDto {
  title: string
  content: string
  authorId: number
}
```

И добавим его в _PostController_:

```javascript
// post.controller.ts
@Post()
async create(@Body() createPostDto: CreatePostDto) {
  return this.postService.create(createPostDto)
}
```

#### Расширенный пример контроллера

```javascript
import { Controller, Get, Query, Post, Body, Put, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common'
import { CreatePostDto, UpdatePostDto, ListAllEntities } from './dto'
import { PostService } from './post.service'

@Controller('posts')
export class PostController {
  constructor(private postService: BookmarkService) {}

  @Post()
  create(@Body() createPostDto: CreatePostDto) {
    return 'Новый пост'
  }

  @Get()
  getAllPosts(@Query() query: ListAllEntities) {
    return `Посты в количестве ${query.limit} штук`
  }

  @Get(':id')
  getPostById(@Param('id') id: string) {
    return `Пост с идентификатором ${id}`
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto
  ) {
    return `Обновленный пост с идентификатором ${id}`
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.postService.remove(id)
  }
}
```

#### Подключение контроллера к модулю

Для того, чтобы сообщить _Nest_ о существовании контроллера _PostController_, его необходимо передать в массив контроллеров модуля:

```javascript
// app.module.ts
import { Module } from '@nestjs/common'
import { PostController } from 'post/post.controller'

@Module({
  controllers: [PostController]
})
export class AppModule {}
```

### Провайдеры / Providers

Провайдеры - фундаментальная концепция _Nest_. В роли провайдеров могут выступать многие базовые классы _Nest_ - сервисы (services), репозитории (repositories), фабрики (factories), помощники (helpers) и др. Суть провайдера состоит в том, что он может быть внедрен (injected) в качестве зависимости. Это означает, что объекты могут выстраивать различные отношения с другими объектами. Функции по созданию экземпляров объектов во многом могут быть делегированы системе выполнения (runtime system) _Nest_.

<img src="https://habrastorage.org/webt/fy/w2/kn/fyw2knbrfnkeuurcxr21kpkkrd4.png" />
<br />

Провайдеры - это обычные _JS-классы_, которые определяются как _providers_ в модуле.

#### Сервисы / Services

Создадим простой сервис _PostService_. Данный сервис будет отвечать за хранение и извлечение данных. Он спроектирован для использования в _PostController_, что делает его отличным кандидатом на статус провайдера.

```javascript
// post.service.ts
import { Injectable } from '@nestjs/common'
import { PostDto, CreatePostDto } from './dto'

@Injectable()
export class PostService {
  private readonly posts: PostDto[] = []

  create(post: CreatePostDto) {
    this.posts.push(post)
  }

  getAllPosts(): PostDto[] {
    return this.posts
  }
}
```

Для создания сервиса с помощью _Nest CLI_ можно использовать команду `nest g service post`.

Наш _PostService_ - обычный класс с одним свойством и двумя методами. Новым является декоратор _@Injectable_. Этот декоратор добавляет метаданные, которые передают управление _PostService_ контейнеру инверсии управления (Inversion of Control, IoC) _Nest_. В примере также используется интерфейс _PostDto_, который может выглядеть так:

```javascript
// dto/post.dto.ts
export class PostDto {
  id: number
  title: string
  content: string
  authorId: number
  createdAt: Date
}
```

Вот как можно использовать созданный нами сервис в контроллере:

```javascript
// post.controller.ts
import { Controller, Get, Post, Body } from '@nestjs/common'
import { CreatePostDto } from './dto/create-post.dto'
import { PostService } from './post.service'
import { PostDto, CreatePostDto } from './dto'

@Controller('post')
export class PostController {
  constructor(private postService: PostService) {}

  @Post()
  async create(@Body() createPostDto: CreatePostDto) {
    this.postService.create(createPostDto)
  }

  @Get()
  async getAllPosts(): Promise<PostDto[]> {
    return this.postService.getAllPosts()
  }
}
```

_PostService_ внедряется в контроллер через конструктор класса. _Обратите внимание_ на использование ключевого слова _private_. Такое сокращение позволяет одновременно определить и инициализировать поле _postService_ в одном месте.

#### Внедрение зависимостей

В основе _Nest_ лежит мощный паттерн, известный под названием "внедрение зависимостей" (Dependency Injection).

В _Nest_ благодаря возможностям, предоставляемым _TypeScript_, управлять зависимостями очень легко, поскольку они разрешаются (resolved) по типу. В приведенном примере _Nest_ разрешает _postService_ посредством создания и возврата экземпляра _PostService_ (обычно, возвращается существующий экземпляр класса - паттерн "Одиночка" / Singleton). Данная зависимость разрешается и передается конструктору контроллера (или присваивается указанному свойству):

```javascript
constructor(private postService: PostService) {}
```

#### Регистрация провайдеров

У нас имеется провайдер (_PostService_) и его потребитель (_PostController_). Теперь нам необходимо зарегистрировать сервис для того, чтобы _Nest_ мог осуществить его внедрение. Это делается путем добавления сервиса в массив, передаваемый полю _providers_ декоратора _@Module_:

```javascript
// app.module.ts
import { Module } from '@nestjs/common'
import { PostController } from './post/post.controller'
import { PostService } from './post/post.service'

@Module({
  controllers: [PostController],
  providers: [PostService]
})
export class AppModule {}
```

После этого _Nest_ будет иметь возможность разрешать зависимости _PostController_.

Вот как на данный момент выглядит структура нашего проекта:

```
src
  post
    dto
      post.dto.ts
      create-post.dto.ts
    post.controller.ts
    post.service.ts
  app.module.ts
  main.ts
```

### Модули / Modules

Модуль - это класс, аннотированный с помощью декоратора _@Module_. Этот декоратор предоставляет _Nest_ метаданные, необходимые для организации структуры приложения.

<img src="https://habrastorage.org/webt/wc/vz/l8/wcvzl8lfdbneof2fsdc4omzmap8.png" />
<br />

В каждом приложении имеется по крайней мере один модуль - корневой (root). Корневой модуль - это начальная точка для построения графа приложения (application graph) - внутренней структуры данных, используемой _Nest_ для разрешения модулей и построения отношений и зависимостей. В большинстве приложений будет использоваться несколько модулей, инкапсулирующих близкий набор возможностей.

Декоратор _@Module_ принимает объект со следующими свойствами:

- _providers_ - провайдеры, которые инстанцируются _Nest_ и могут использоваться любыми частями, по крайней мере, данного модуля;
- _controllers_ - набор контроллеров, определенных в данном модуле для инстанцирования;
- _imports_ - список импортируемых модулей, которые экспортируют провайдеры, необходимые данному модулю;
- _exports_ - часть провайдеров, принадлежащих данному модулю, которые должны быть доступны другим модулям. Мы можем использовать сам провайдер или только его токен (значение _provide_).

Модуль инкапсулирует провайдеры по умолчанию. Это означает, что невозможно внедрить провайдеры, которые не являются частью данного модуля и не экспортируются из импортируемых им модулей. Поэтому экспортируемые провайдеры можно считать часть публичного интерфейса (_API_) модуля.

#### Модули частей приложения

_PostController_ и _PostService_ принадлежат одному и тому же домену (domain) приложения. Поскольку они тесно связаны между собой, имеет смысл вынести их в отдельный модуль. Частичный модуль просто организует код, отвечающий за определенную часть (возможность) приложения. Это помогает управлять сложностью приложения и разрабатывать, придерживаясь принципов [SOLID](https://en.wikipedia.org/wiki/SOLID), что становится особенно актуальным с ростом приложения или команды разработчиков.

Создадим _PostModule_:

```javascript
// post.module.ts
import { Module } from '@nestjs/common'
import { PostController } from './post.controller'
import { PostService } from './post.service'

@Module({
  controllers: [PostController],
  providers: [PostService]
})
export class PostModule {}
```

Для создания модуля с помощью _Nest CLI_ можно выполнить команду `nest g module post`.

Импортируем этот модуль в корневой (_AppModule_, определенный в _app.module.ts_):

```javascript
import { Module } from '@nestjs/common'
import { PostModule } from './post/post.module'

@Module({
  imports: [PostModule]
})
export class AppModule {}
```

Вот как выглядит структура нашего проекта на данный момент:

```
src
  post
    dto
      post.dto.ts
      create-post.dto.ts
    post.controller.ts
    post.module.ts
    post.service.ts
  app.module.ts
  main.ts
```

#### Распределенные модули

По умолчанию модули в _Nest_ являются "одиночками". Поэтому мы можем распределять один и тот же экземпляр любого провайдера между несколькими модулями.

<img src="https://habrastorage.org/webt/gn/mn/jd/gnmnjdphzkyivhtmzomf6qsy38k.png" />
<br />

Каждый модуль по умолчанию является распределенным (shared). Предположим, что мы хотим поделиться экземпляром _PostService_ с другими модулями. Для этого нужно экспортировать _PostService_ из модуля:

```javascript
import { Module } from '@nestjs/common'
import { PostController } from './post.controller'
import { PostService } from './post.service'

@Module({
  controller: [PostController],
  providers: [PostService],
  exports: [PostService]
})
export class PostModule {}
```

Теперь любой модуль, импортирующий _PostModule_, будет иметь доступ к _PostService_ и будет делиться этим экземпляром с модулями, импортирующими его самого.

#### Повторный экспорт модулей

Модуль может экспортировать не только внутренние провайдеры, но и импортируемые модули:

```javascript
@Module({
  imports: [CommonModule],
  exports: [CommonModule]
})
export class CoreModule {}
```

#### Внедрение зависимостей

Модуль также может внедрять провайдеры:

```javascript
import { Module } from '@nestjs/common'
import { PostController } from './post.controller'
import { PostService } from './post.service'

@Module({
  controllers: [PostController],
  providers: [PostService]
})
export class PostModule {
  constructor(private postService: PostService) {}
}
```

Тем не менее, сами модули не могут внедряться как провайдеры по причине [циклической зависимости (circular dependency)](https://tftwiki.ru/wiki/Circular_dependency).

#### Глобальные модули

Для создания глобального модуля (помощники, _ORM_ и т.д.) предназначен декоратор _@Global_:

```javascript
import { Module, Global } from '@nestjs/common'
import { PostController } from './post.controller'
import { PostService } from './post.service'

@Global()
@Module({
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService]
})
export class PostModule {}
```

Декоратор _@Global_ делает модуль глобальным. Такие модули регистрируются только один раз, обычно, в корневом модуле. В приведенном примере провайдер _PostService_ будет доступен любому модулю без необходимости импорта _PostModule_.

### Посредники / Middleware

Посредник - это функция, которая вызывается перед обработчиком маршрута. Посредники имеют доступ к объектам запроса и ответа, а также к посреднику _next_ в цикле запрос-ответ.

<img src="https://habrastorage.org/webt/bq/bk/eg/bqbkegi8pc_k8nne0ahtgakvpd0.png" />
<br />

По умолчанию посредники _Nest_ аналогичны посредникам _Express_.

Посредники предоставляют следующие возможности:

- выполнение любого кода;
- модификация объектов запроса и ответа;
- завершение цикла запрос-ответ;
- вызов следующего посредника в стеке;
- если текущий посредник не завершает цикл запрос-ответ, он должен вызвать _next()_ для передачи управления следующему посреднику. В противном случае, запрос зависнет (hanging).

Кастомный посредник может быть реализован как в виде функции, так и в виде класса с помощью декоратора _@Injectable_. Класс должен реализовывать интерфейс _NestMiddleware_, а к функции особых требований не предъявляется. Начнем с реализации посредника в виде класса:

```javascript
import { Injectable, NestMiddleware } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('Запрос...')
    next()
  }
}
```

#### Внедрение зависимостей

Посредники _Nest_ поддерживают внедрение зависимостей. Как и провайдеры или контроллеры, они могут внедрять зависимости, доступные в родительском модуле. Это делается через _constructor_.

#### Регистрация посредников

В декораторе _@Module_ нет места для посредников. Поэтому мы применяем их в с помощью метода _configure_ класса модуля. Модули, включающие посредников, должны реализовывать интерфейс _NestModule_. Применим _LoggerMiddleware_ на уровне _AppModule_:

```javascript
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common'
import { LoggerMiddleware } from './middlewares/logger.middleware'
import { PostModule } from './post/post.module'

@Module({
  imports: [PostModule]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('post')
  }
}
```

В приведенном примере мы применяем _LoggerMiddleware_ к обработчикам маршрутов _/post_, определенным в _PostController_. Ограничить обработчики, к которым применяется посредник, можно следующим образом (_обратите внимание_ на использование перечисления _RequestMethod_):

```javascript
import { Module, NestModule, RequestMethod, MiddlewareConsumer } from '@nestjs/common'
import { LoggerMiddleware } from './middlewares/logger.middleware'
import { PostModule } from './post/post.module'

@Module({
  imports: [PostModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: 'post', method: RequestMethod.GET })
  }
}
```

_Обратите внимание_: метод _configure_ может быть асинхронным (_async/await_).

#### Перехват роутов / Route wildcards

Метод _forRoutes_ поддерживает перехват роутов с помощью паттернов:

```javascript
forRoutes({ path: 'ab*cd', method: RequestMethod.ALL })
```

#### Потребитель посредника / Middleware consumer

_MiddlewareConsumer_ - это вспомогательный класс. Он предоставляет несколько встроенных методов для управления посредником. Данные методы могут вызываться по цепочке. Метод _forRoutes_ принимает строку, несколько строк или объект _RouteInfo_, класс контроллера или несколько таких классов. В большинстве случаев мы передаем этому методу контроллеры, разделенные запятыми. Пример передачи одного контроллера:

```javascript
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common'
import { LoggerMiddleware } from './middlewares/logger.middleware'
import { PostModule } from './post/post.module'
import { PostController } from './post/post.controller'

@Module({
  imports: [PostModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes(PostController)
  }
}
```

_Обратите внимание_: метод _apply_ может принимать несколько посредников.

#### Исключение роутов

Иногда мы не хотим, чтобы посредник применялся к определенным роутам. Исключить такие роуты можно с помощью метода _exclude_, который принимает строку, несколько строк или объект _RouteInfo_:

```javascript
consumer
  .apply(LoggerMiddleware)
  .exclude(
    { path: 'post', method: RequestMethod.GET },
    { path: 'post', method: RequestMethod.POST },
    'post/(.*)',
  )
  .forRoutes(CatsController)
```

_Обратите внимание_: метод _exclude_ поддерживает перехват роутов с помощью паттернов.

#### Посредники в виде функций

Реализованный нами посредник _LoggerMiddleware_ является очень простым. У него нет членов, дополнительных методов и зависимостей. Поэтому мы вполне может реализовать его в виде функции:

```javascript
import { Request, Response, NextFunction } from 'express'

export function logger(req: Request, res: Response, next: NextFunction) {
  console.log('Запрос...')
  next()
}
```

Применяем его в _AppModule_:

```javascript
consumer
  .apply(logger)
  .forRoutes(PostController)
```

#### Несколько посредников

Для применения нескольких посредников достаточно передать их методу _apply_ через запятую:

```javascript
consumer.apply(cors(), helmet(), logger).forRoutes(PostController)
```

#### Глобальные посредники

Для применения посредника ко всем роутам приложения можно использовать метод _use_, предоставляемый экземпляром _INestApplication_:

```javascript
const app = await NestFactory.create(AppModule)
app.use(logger)
await app.listen(3000)
```

### Фильтры исключений / Exception filters

_Nest_ имеет встроенный слой для обработки исключений (exceptions layer), которые по какой-то причине не были обработаны приложением (unhandled exceptions - необработанные исключения).

<img src="https://habrastorage.org/webt/mw/6z/tz/mw6ztzk3lzscdpzzs4g1t-avijg.png" />
<br />

По умолчанию используется глобальный фильтр исключений (global exception filter), который обрабатывает исключения типа _HttpException_ (и его подклассов). В случае, когда исключение не удается распознать (когда оно не является ни _HttpException_, ни классом, наследующим от него), генерируется такой ответ в формате _JSON_:

```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

#### Стандартные исключения

_Nest_ предоставляет встроенный класс _HttpException_. В _PostController_ у нас имеется метод _getAllPosts_. Предположим, что по какой-то причине обработчик этого роута выбрасывает исключение:

```javascript
import { HttpException, HttpStatus } from '@nestjs/common'

@Get()
async getAllPosts() {
  throw new HttpException('Forbidden', HttpStatus.FORBIDDEN)
}
```

В ответ на запрос к данной конечной точке возвращается такой ответ:

```json
{
  "statusCode": 403,
  "message": "Forbidden"
}
```

Конструктор _HttpException_ принимает 2 обязательных параметра, определяющих ответ:

- параметр _response_ определяет тело ответа. Он может быть строкой или объектом;
- параметр _status_ определяет статус-код.

По умолчанию тело ответа содержит 2 свойства:

- _statusCode_: статус-код, указанный в аргументе _status_;
- _message_: краткое описание ошибки на основе _status_.

Для перезаписи _message_ достаточно передать строку в качестве _response_. Для перезаписи всего тела ответа в качестве _response_ передается такой объект:

```javascript
@Get()
async getAllPosts() {
  throw new HttpException({
    status: HttpStatus.FORBIDDEN,
    error: 'Доступ запрещен'
  }, HttpStatus.FORBIDDEN)
}
```

В этом случае ответ на запрос будет выглядеть так:

```json
{
  "status": 403,
  "error": "Доступ запрещен"
}
```

#### Встроенные исключения

_Nest_ предоставляет набор исключений, наследующих от _HttpException_. Они экспортируются из _@nestjs/common_ и представляют наиболее распространенные исключения:

- `BadRequestException`
- `UnauthorizedException`
- `NotFoundException`
- `ForbiddenException`
- `NotAcceptableException`
- `RequestTimeoutException`
- `ConflictException`
- `GoneException`
- `HttpVersionNotSupportedException`
- `PayloadTooLargeException`
- `UnsupportedMediaTypeException`
- `UnprocessableEntityException`
- `InternalServerErrorException`
- `NotImplementedException`
- `ImATeapotException`
- `MethodNotAllowedException`
- `BadGatewayException`
- `ServiceUnavailableException`
- `GatewayTimeoutException`
- `PreconditionFailedException`

#### Фильтры исключений

Фильтры исключений позволяют получить полный контроль над процессом обработки исключения и формированием содержимого ответа.

Определим фильтр исключений, отвечающий за перехват исключений, которые являются экземплярами класса _HttpException_, и реализующий кастомную логику формирования ответа. Для этого нам потребуется доступ к объектам _Request_ и _Response_. Объект _Request_ будет использоваться для извлечения _URL_ и его включения в ответ. Объект _Response_ будет использоваться для отправки ответа с помощью метода _json_:

```javascript
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common'
import { Request, Response } from 'express'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const res = ctx.getResponse<Response>()
    const req = ctx.getRequest<Request>()
    const status = exception.getStatus()

    response
      .status(status)
      .json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: req.url
      })
  }
}
```

_Обратите внимание_: все фильтры исключений должны реализовывать общий интерфейс `ExceptionFilter<T>`. Сигнатура определяется с помощью `catch(exception: T, host: ArgumentsHost)`, где _T_ - это тип исключения.

Декоратор _@Catch_ привязывает необходимые метаданные к фильтру исключений. Это сообщает _Nest_, что данный фильтр обрабатывает только исключения типа _HttpException_. Декоратор _@Catch_ может принимать несколько аргументов, разделенных через запятую, для обработки нескольких типов исключений.

#### Аргументы хоста / Arguments host

В приведенном примере мы используем объект _ArgumentsHost_ для получения доступа к объектам _Request_ и _Response_. Вспомогательные функции, предоставляемые _ArgumentsHost_, позволяют получать доступ к любому контексту выполнения, будь то HTTP-сервер, микросервисы или веб-сокеты.

#### Применение фильтров исключений

Привяжем _HttpExceptionFilter_ к методу _create_ в _PostController_:

```javascript
import { Post, UseFilters, Body, ForbiddenException } from '@nestjs/common'

@Post()
@UseFilters(HttpExceptionFilter)
async create(@Body createPostDto: CreatePostDto) {
  throw new ForbiddenException()
}
```

Декоратор _@UseFilters_ может принимать несколько фильтров через запятую.

Фильтры исключений могут применяться не только на уровне методов, но также на уровне контроллеров и даже глобально. Пример использования фильтра на уровне контроллера:

```javascript
@UseFilters(HttpExceptionFilter)
export class PostController {}
```

Пример использования фильтра на уровне всего приложения (глобально):

```javascript
async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useGlobalFilters(HttpExceptionFilter)
  await app.listen(3000)
}
bootstrap()
```

#### Перехват всех исключений

Для того, чтобы перехватывать все необработанные исключения (независимо от типа исключения), достаточно применить декоратор _@Catch_ без аргументов:

```javascript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { HttpAdapterHost } from '@nestjs/core`'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    // В некоторых случаях `httpAdapter` может быть недоступен в конструкторе,
    // поэтому нам следует получать (разрешать) его здесь
    const { httpAdapter } = this.httpAdapterHost

    const ctx = host.switchToHttp()

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR

    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
    }

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus)
  }
}
```

_HttpAdapterHost_ позволяет коду быть платформонезависимым (platform-agnostic), поскольку мы не используем зависящие от платформы объекты _Request_ и _Response_ напрямую.

### Конвейеры / Pipes

Конвейер - это класс, аннотированный с помощью декоратора _@Injectable_ и реализующий интерфейс _PipeTransform_.

<img src="https://habrastorage.org/webt/vs/ew/qp/vsewqpupaklnyrzt0ysmpufs07k.png" />
<br />

Конвейеры используются для:

- трансформации: преобразование входных данных в ожидаемый формат, например, преобразование строки в число;
- валидации: проверка корректности входных данных.

_Nest_ запускает конвейер перед вызовом обработчика маршрута, и конвейер получает аргументы, переданные последнему.

_Nest_ предоставляет несколько встроенных конвейеров. Разумеется, можно создавать собственные конвейеры.

#### Встроенные конвейеры

_Nest_ предоставляет 8 встроенных конвейеров:

- `ValidationPipe`
- `ParseIntPipe`
- `ParseFloatPipe`
- `ParseBoolPipe`
- `ParseArrayPipe`
- `ParseUUIDPipe`
- `ParseEnumPipe`
- `DefaultValuePipe`

Встроенные конвейеры экспортируются из пакета _@nestjs/common_.

Далее мы рассмотрим пример использования _ParseIntPipe_ для преобразования аргумента, переданного обработчику, в целое число (при невозможности такого преобразования выбрасывается исключение).

#### Регистрация конвейеров

Для применения конвейера нам необходимо привязать его экземпляр к соответствующему контексту. На уровне метода это можно сделать следующим образом:

```javascript
@Get(':id')
async getPostById(@Param('id', ParseIntPipe) id: number) {
  return this.postService.getPostById(id)
}
```

После этого если мы отправим _GET-запрос_ к конечной точке _http://localhost:3000/abc_, _Nest_ выбросит такое исключение:

```json
{
  "statusCode": 400,
  "message": "Validation failed (numeric string is expected)",
  "error": "Bad Request"
}
```

В этом случае код метода _getPostById_ не выполняется.

Для кастомизации поведения встроенного конвейера вместо класса передается его экземпляр:

```javascript
@Get(':id')
async getPostById(
  @Param('id', new ParseIntPipe({
    errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE
  }))
  id: number
) {
  return this.postService.getPostById(id)
}
```

#### Кастомные конвейеры

Реализуем простой конвейер _ValidationPipe_, принимающий значение и просто возвращающий его:

```javascript
import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common'

@Injectable()
export class ValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    return value
  }
}
```

_Обратите внимание_: `PipeTransform<T, R>` - это общий интерфейс, который должен быть реализован любым конвейером. _T_ - это тип входного значения (_value_), а _R_ - тип значения, возвращаемого методом _transform_.

_transform()_ принимает 2 параметра:

- _value_ - аргумент, переданный обработчику;
- _metadata_ - объект со следующими свойствами:
  - _type_ - тип аргумента: `'body' | 'query' | 'param' | 'custom'`;
  - _metatype_ - тип данных аргумента, например, `String`;
  - _data_ - строка, переданная декоратору, например, `@Body('string')`.

#### Валидация входных данных на основе схемы

Сделаем наш конвейер для валидации более полезным. Предположим, что мы хотим валидировать объект тела запроса, передаваемого методу _create_. Как нам это сделать?

Существует несколько способов валидации объекта. Одним из наиболее распространенных является валидация на основе схемы (schema-based validation). Одной из наиболее популярных библиотек для такой валидации является [Joi](https://github.com/sideway/joi).

Устанавливаем необходимые зависимости:

```bash
yarn add joi
yarn add -D @types/joi
```

```javascript
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common'
import { ObjectSchema } from 'joi'

@Injectable()
export class JoiValidationPipe implements PipeTransform {
  constructor(private schema: ObjectSchema) {}

  transform(value: any, metadata: ArgumentMetadata) {
    const { error } = this.schema.validate(value)

    if (error) {
      throw new BadRequestException('Валидация провалилась')
    }

    return value
  }
}
```

Для применения данного конвейера необходимо сделать следующее:

1. Создать экземпляр _JoiValidationPipe_.
2. Передать схему в конструктор класса конвейера.
3. Привязать конвейер к методу.

```javascript
@Post()
@UsePipes(new JoiValidationPipe(createPostSchema))
async create(@Body() createPostDto: CreatePostDto) {
  this.postService.create(createPostDto)
}
```

Существует другой, более простой способ: библиотека [class-validator](https://github.com/typestack/class-validator) позволяет выполнять валидацию с помощью декораторов.

Устанавливаем необходимые зависимости:

```javascript
yarn add class-validator class-transformer
```

Добавляем несколько декораторов-валидаторов в класс _CreatePostDto_

```javascript
// create-post.dto
import { IsString, IsInt } from 'class-validator'

export class CreatePostDto {
  @IsString()
  title: string,

  @IsString()
  content: string,

  @IsInt()
  authorId: number
}
```

Обновляем код _ValidationPipe_:

```javascript
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common'
import { validate } from 'class-validator'
import { plainToClass } from 'class-transformer'

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || this.toValidate(metatype)) {
      return value
    }

    const obj = plainToClass(metatype, value)
    const errors = await validate(object)

    if (errors.length > 0) {
      throw new BadRequestException('Валидация провалилась')
    }

    return value
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object]
    return !types.includes(metatype)
  }
}
```

_Обратите внимание_: библиотека [class-transformer](https://github.com/typestack/class-transformer) разработана тем же человеком, что и _class-validator_, поэтому они очень хорошо работают вместе.

Вспомогательная функция _toValidate_ предназначена для пропуска валидации, когда обрабатываемый аргумент имеет нативный тип _JavaScript_ (к такому аргументу нельзя добавить декораторы для валидации, поэтому выполнять ее бессмысленно).

Функция _plainToClass_ предназначена для преобразования обычного объекта _JavaScript_ в типизированный объект для применения валидации. Причина необходимости такого преобразования состоит в том, что входной объект тела запроса не содержит информации о типах, а `class-validator` нуждается в них для применения декораторов для валидации, определенных нами в _CreatePostDto_.

Привяжем _ValidationPipe_ к декоратору _@Body_:

```javascript
@Post()
async create(
  @Body(ValidationPipe) createPostDto: CreatePostDto
) {
  this.postService.create(createPostDto)
}
```

Конвейеры могут применяться на уровне параметра, метода, контроллера или глобально.

Пример глобального использования конвейера:

```javascript
// main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useGlobalPipes(ValidationPipe)
  await app.listen(3000)
}
```

#### Встроенный конвейер для валидации

На самом деле у нас нет необходимости создавать собственные конвейеры для валидации, поскольку _ValidationPipe_ предоставляется _Nest_ из коробки.

#### Кастомный конвейер для трансформации

Как отмечалось ранее, конвейеры могут использоваться не только для валидации, но и для трансформации. Рассмотрим пример кастомной реализации _ParseIntPipe_:

```javascript
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common'

@Injectable()
export class ParseIntPipe implements PipeTransform<string, number> {
  transform(value: string, metadata: ArgumentMetadata): number {
    const val = parseInt(value, 10)

    if (isNaN(val)) {
      throw new BadRequestException('Переданный аргумент не может быть преобразован в число')
    }

    return val
  }
}
```

Применяем этот конвейер:

```javascript
@Get(':id')
async getPostById(@Param('id', ParseIntPipe) id) {
  return this.postService.getPostById(id)
}
```

#### Конвейер для передача параметров по умолчанию

Конвейер _DefaultValuePipe_ позволяет определять дефолтные параметры:

```javascript
@Get()
async getAllPosts(
  @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  @Query('published', new DefaultValuePipe(true), ParseBoolPipe) published: boolean
) {
  return this.postService.getAllPosts({ page, published })
}
```

### Защитники/предохранители / Guards

Защитник - это класс, аннотированный с помощью декоратора _@Injectable_ и реализующий интерфейс _CanActivate_.

<img src="https://habrastorage.org/webt/-4/kj/zo/-4kjzotjmd6aok39xoygmeuk6o4.png" />
<br />

Защитники предназначены для авторизации - определения того, передавать ли запрос обработчику маршрута для дальнейшей обработки, в зависимости от определенных условий (разрешения, роли пользователя и т.д.). Защитники, в отличие от посредников, имеют доступ к экземпляру _ExecutionContext_ и по этой причине точно знают, какой код будет выполняться следующим.

_Обратите внимание_: защитники выполняются после посредников, но перед перехватчиками и конвейерами.

#### Защитник для авторизации

Реализуем простой защитник для авторизации:

```javascript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Observable } from 'rxjs'

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest()

    return validateRequest(req)
  }
}
```

Логика внутри _validateRequest_ может быть настолько простой или сложной, насколько необходимо.

Функция _canActivate_ должна возвращать логическое значение - индикатор валидности текущего запроса:

- если она возвращает _true_, запрос будет передан обработчику;
- если она возвращает _false_, запрос будет отклонен с ошибкой.

#### Контекст выполнения / Execution context

_canActivate()_ принимает один параметр - экземпляр _ExecutionContext_. _ExecutionContext_ наследует от _ArgumentsHost_. _ExecutionContext_ расширяет _ArgumentsHost_ несколькими вспомогательными методами, предоставляющими дополнительную информацию о текущем процессе выполнения (обработке запроса).

#### Аутентификация на основе роли пользователя / Role-based authentication

Реализуем более функциональный защитник, предоставляющий доступ только пользователям с определенной ролью. Начнем с определения базового защитника, разрешающего все запросы:

```javascript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Observable } from 'rxjs'

@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    return true
  }
}
```

#### Регистрация защитников

Защитники, также как и исключающие фильтры или конвейеры могут привязываться к методу, контроллеру или быть глобальными. Для привязки защитника используется декоратор _@UseGuards_ из пакета _@nestjs/common_, в качестве параметра принимающий одного или нескольких защитников, разделенных запятыми:

```javascript
@Controller('posts')
@UseGuards(RolesGuard)
export class PostController {}
```

Для установки глобального защитника используется метод _useGlobalGuard_ экземпляра приложения _Nest_:

```javascript
const app = await NestFactory.create(AppModule)
app.useGlobalGuard(RolesGuard)
```

#### Определение ролей для обработчика

Наш _RolesGuard_ работает, но пока он бесполезен. _postController_ может иметь разные схемы разрешений: одни роуты могут быть доступны всем, другие - только администраторам.

Вот где нам пригодятся кастомные метаданные. Для их добавления предназначен декоратор _@SetMetadata_ из пакета _@nestjs/common_:

```javascript
@Post()
@SetMetadata('roles', ['admin'])
async create(@Body() createPostDto: CreatePostDto) {
  this.postService.create(createPostDto)
}
```

Мы добавляем метаданные _roles_ к методу _create_ (_roles_ - о ключ, а _['admin']_ - значение). На практике _@SetMetadata_ редко используется напрямую. Давайте вынесем его в кастомный декоратор:

```javascript
import { SetMetadata } from '@nestjs/common'

export const Roles = (...roles: string[]) => SetMetadata('roles', roles)
```

Применяем его:

```javascript
@Post()
@Roles('admin')
async create(@Body() createPostDto: CreatePostDto) {
  this.postService.create(createPostDto)
}
```

#### Полный пример

Для доступа к кастомным метаданным в защитнике используется вспомогательный класс _Reflector_:

```javascript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', ctx.getHandler())

    if (!roles) {
      return true
    }

    const req = ctx.switchToHttp().getRequest()

    return matchRoles(roles, req.user.role)
  }
}
```

В приведенном примере мы исходим из предположения, что в результате аутентификации объект с данными пользователя был записан в объект запроса.

Если пользователь, который не является администратором, попытается создать пост, он получит такую ошибку:

```json
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}
```

По умолчанию _Nest_ выбрасывает исключение _ForbiddenException_. Однако в защитнике можно выбрасывать любые другие исключения:

```javascript
throw new UnauthorizedException()
```

Исключения, выбрасываемые защитниками, обрабатываются соответствующим слоем (exception layer).

### Перехватчики / Interceptors

Перехватчик - это класс, аннотированный с помощью декоратора _@Injectable_ и реализующий интерфейс _NestInterceptor_.

<img src="https://habrastorage.org/webt/5g/zs/xl/5gzsxlhv8bshrpajogrervlscma.png" />
<br />

Возможности перехватчиков:

- выполнение логики перед/после вызова метода;
- преобразования результата вызова функции;
- преобразования исключения, выброшенного методом;
- расширение поведения функции;
- полная перезапись функции в зависимости от определенных условий (например, в целях кеширования).

#### Основы

Каждый перехватчик реализует метод _intercept_, принимающий 2 параметра. Первым параметром является экземпляр контекста выполнения (_ExecutionContext_), о котором рассказывалось в разделе, посвященном защитникам. Второй параметр - обработчик вызова (_CallHandler_).

#### CallHandler

Интерфейс _CallHandler_ реализует метод _handle_, который используется для вызова метода обработчика маршрута для передачи ему управления. Если не вызвать _handle_ в _intercept_, метод обработчика не будет выполнен.

Перехватчики позволяют выполнять кастомную логику как до, так и после вызова метода обработчика. С "до" все ясно, но что позволяет перехватчику выполнять код "после"? Дело в том, что _handle_ возвращает _Observable_. Это позволяет использовать мощные операторы [RxJS](https://github.com/ReactiveX/rxjs) для дальнейшей манипуляции ответом. В терминологии [аспектно-ориентированного программирования](https://ru.wikipedia.org/wiki/%D0%90%D1%81%D0%BF%D0%B5%D0%BA%D1%82%D0%BD%D0%BE-%D0%BE%D1%80%D0%B8%D0%B5%D0%BD%D1%82%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%BD%D0%BE%D0%B5_%D0%BF%D1%80%D0%BE%D0%B3%D1%80%D0%B0%D0%BC%D0%BC%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D0%B5) это называется [точечным разрезом](https://en.wikipedia.org/wiki/Pointcut) (pointcut) - мы вставляем в эту точку дополнительную логику.

#### Перехват аспекта / Aspect interception

Первым случаем использования перехватчиков является фиксирование взаимодействия пользователя со страницей (например, сохранение действий пользователя, асинхронный вызов событий или вычисление отметки времени (timestamp)). Реализуем простой перехватчик _LoggingInterceptor_:

```javascript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: , next: ): Observable<any> {
    console.log('Перед...')

    const now = Date.now()

    return next
      .handle()
      .pipe(
        tap(() => console.log(`После... ${Date.now() - now} мс`))
      )
  }
}
```

`NestInterceptor<T, R>` - общий интерфейс, в котором _T_ означает тип `Observable<T>` (поддерживающего поток ответа - response stream), а _R_ - тип значения, обернутого `Observable<R>`.

_Обратите внимание_: перехватчики, как и контроллеры, провайдеры, защитники и др. могут внедрять зависимости через _constructor_.

Поскольку _handle()_ возвращает _Observable_, в нашем распоряжении имеется большое количество операторов для работы с потоком.

#### Регистрация перехватчиков

Для установки перехватчика используется декоратор _@UseInterceptor_ из пакета _@nestjs/common_. Подобно конвейерам или защитникам, перехватчики могут устанавливаться на уровне контроллеров, методов или глобально.

```javascript
@UseInterceptors(LoggingInterceptor)
export class PostController {}
```

Для установки глобального перехватчика используется метод _useGlobalInterceptor_ экземпляра приложения _Nest_:

```javascript
const app = await NestFactory.create(AppModule)
app.useGlobalInterceptor(LoggingInterceptor)
```

#### Обработка ответов

Как мы знаем, метод _handle_ возвращает _Observable_. Поток содержит значение из обработчика маршрута, которое можно мутировать с помощью оператора _map_ из библиотеки _RxJS_.

Создадим _TransformInterceptor_, в котором _map_ используется для присвоения объекта ответа свойству _data_ нового объекта, возвращаемого клиенту:

```javascript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export interface Response<T> {
  data: T
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(ctx: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(map((data) => ({ data })))
  }
}
```

Перехватчики отлично подходят для создания повторно используемых решений. Предположим, что мы хотим заменять все _null_ на пустую строку (`''`). Для этого достаточно изменить одну строку нашего _TransformInterceptor_ и зарегистрировать его глобально:

```javascript
return next
  .handle()
  .pipe(map((value) => value === null ? '' : value ))
```

#### Обработка исключений

Еще одним интересным случаем использования перехватчиков является обработка исключений с помощью оператора _catchError_ из библиотеки _RxJS_:

```javascript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  BadGatewayException,
  CallHandler
} from '@nestjs/common'
import { Observable, throwError } from 'rxjs'
import { catchError } from 'rxjs/operators'

@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    return next
      .handle()
      .pipe(
        catchError((err) => throwError(() => new BadGatewayException()))
      )
  }
}
```

#### Перезапись потока ответа

Существует несколько причин, по которым мы можем захотеть отключить вызов обработчика маршрута. Одной из таких причин является, например, доставка контента из кеша вместо обращения к базе данных. Рассмотрим пример такого перехватчика:

```javascript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { Observable, of } from 'rxjs'

@Injectable()
export class CacheInterceptor implements ... {
  intercept(ctx: ..., next: ...): Observable<any> {
    const isCached = true

    if (isCached) {
      return of([])
    }

    return next.handle()
  }
}
```

У нас имеется жестко заданная переменная _isCached_ и жестко заданный ответ _[]_. В данном случае мы возвращаем новый поток, генерируемый оператором _of_, поэтому обработчик маршрута не вызывается.

#### Другие операторы RxJS

Тот факт, что мы можем манипулировать потоком ответа с помощью операторов _ RxJS_, предоставляет в наше распоряжение много интересных возможностей. Допустим, мы хотим обрабатывать таймауты - прекращать выполнение запроса по истечении определенного периода времени.

```javascript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, RequestTimeoutException } from '@nestjs/common'
import { Observable, throwError, TimeoutError } from 'rxjs'
import { catchError, timeout } from 'rxjs/operators'

@Injectable()
export class TimeoutInterceptor implements ... {
  intercept(ctx: ..., next: ...): Observable<any> {
    return next.handle().pipe(
      timeout(5000),
      catchError((err) => {
        if (err instanceof TimeoutError) {
          return throwError(() => new RequestTimeoutException())
        }
        return throwError(() => err)
      })
    )
  }
}
```

В приведенном примере запрос, который обрабатывается дольше 5 секунд, отменяется.

### Кастомные декораторы маршрутов / Custom route decorators

_Nest_ позволяет легко создавать кастомные декораторы. Когда это может пригодиться?

В _Node.js_ распространенной практикой является добавление новых свойств в объект запроса. Затем эти свойства извлекаются в обработчиках запросов.

```javascript
const { user } = req
```

Для того, чтобы сделать код более читаемым и прозрачным, можно создать такой декоратор _@User_:

```javascript
import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const User = createParamDecorator(
  (data: unknown, ctx: ...) => {
    const req = ctx.switchToHttp().getRequest()

    return req.user ? req.user : null
  }
)
```

Затем мы просто применяем этот декоратор по необходимости:

```javascript
@Get()
async getPostById(@User() user: User) {
  console.log(user)
}
```

#### Передача данных

Когда поведение декоратора зависит от некоторых условий, мы можем использовать параметр _data_ для передачи аргументов фабричной функции декоратора. Одним из таких случаев является извлечение свойств из объекта запроса по ключу. Предположим, что наш слой для аутентификации валидирует запрос и добавляет пользователя в объект запроса. Сущность пользователя может выглядеть так:

```json
{
  "id": 1,
  "firstName": "Алан",
  "lastName": "Тьюринг",
  "email": "alan@mail.com",
  "roles": ["admin"]
}
```

Определим декоратор, принимающий название свойства в качестве ключа и возвращающего соответствующее значение при его наличии:

```javascript
import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const User = createParamDecorator(
  (data: string, ctx: ...) => {
    const req = ctx.switchToHttp().getRequest()
    const { user } = req

    if (!user) return null

    return data ? user[data] : user
  }
)
```

Пример использования этого декоратора:

```javascript
@Get()
async getPostById(@User('firstName') firstName: string) {
  console.log(`Привет, ${firstName}!`)
}
```

Мы можем использовать этот декоратор с разными ключами для доступа к разным свойствам.

#### Работа с конвейерами

Конвейеры могут применяться к кастомным декораторам напрямую:

```javascript
@Get()
async getPostById(
  @User(new ValidationPipe({ validateCustomDecorators: true }))
  user: User
) {
  console.log(user)
}
```

_Обратите внимание_: настройка _validateCustomDecorators_ должна быть установлена в значение _true_.

#### Композиция декораторов

_Nest_ предоставляет вспомогательный метод для композиции декораторов. Предположим, что мы хотим объединить все декораторы, связанные с аутентификацией, в одном декораторе:

```javascript
import { applyDecorators } from '@nestjs/common'

export function Auth(...roles: Role[]) {
  return applyDecorators(
    SetMetadata('roles', roles),
    UseGuards(AuthGuard, RolesGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Unauthorized' })
  )
}
```

Пример использования этого декоратора:

```javascript
@Get('users')
@Auth('admin')
getAllUsers()
```

### Кастомные провайдеры

#### Основы внедрения зависимостей

Внедрение зависимостей (Dependency Injection, DI) - это способ инверсии управления (Inversion of Control, IoC), когда инстанцирование (создание экземпляров) зависимостей делегируется _контейнеру IoC_ (системе выполнения - runtime system) _NestJS_.

Все начинается с определения провайдера.

В следующем примере декоратор _@Injectable_ помечает (mark) класс _PostService_ как провайдер:

```javascript
// post.service.ts
import { Injectable } from '@nestjs/common'
import { PostDto } from './dto'

@Injectable()
export class PostService {
  private readonly posts: PostDto[] = []

  getAll(): PostDto[] {
    return this.posts
  }
}
```

Затем этот провайдер внедряется в контроллер:

```javascript
// post.controller.ts
import { Controller, Get } from '@nestjs/common'
import { PostService } from './post.service'
import { PostDto } from './dto'

@Controller('posts')
export class PostController {
  // внедрение зависимости
  constructor(private postService: PostService) {}

  @Get()
  async getAll(): Promise<PostDto[]> {
    // обращение к провайдеру
    return this.postService.getAll()
  }
}
```

Наконец, провайдер регистрируется с помощью _контейнера IoC_:

```javascript
// app.module.ts
import { Module } from '@nestjs/common'
import { PostController } from './post/post.controller'
import { PostService } from './post/ost.service'

@Module({
  controllers: [PostController],
  providers: [PostService]
})
export class AppModule {}
```

В процессе _DI_ происходит следующее:

1. В _post.service.ts_ декоратор _@Injectable_ определяет класс _PostService_ как класс, доступный для управления _контейнером IoC_.
2. В _post.controller.ts_ класс _PostController_ определяет зависимость на токене (token) _PostService_ посредством его внедрения через конструктор:

```javascript
constructor(private postService: PostService) {}
```

3. В _app.module.ts_ токен _PostService_ связывается (map) с классом _PostService_ из _post.service.ts_.

При инстанцировании _PostController_ _контейнер IoC_ определяет зависимости. При обнаружении зависимости _PostService_, он изучает токен _PostService_, который возвращает класс _PostService_. Учитывая, что по умолчанию применяется паттерн проектирования _SINGLETON_ (Одиночка), _NestJS_ создает экземпляр _PostService_, кеширует его и возвращает либо сразу доставляет экземпляр _PostService_ из кеша.

#### Стандартные провайдеры

Присмотримся к декоратору _@Module_. В _app.module.ts_ определяется следующее:

```javascript
@Module({
  controllers: [PostController],
  providers: [PostProvider]
})
```

Свойство _providers_ принимает массив провайдеров. В действительности, синтаксис `providers: [PostService]` является сокращением для:

```javascript
providers: [
  {
    provide: PostService,
    useClass: PostService
  }
]
```

Теперь процесс регистрации провайдеров стал более понятным, не так ли? Здесь мы явно ассоциируем токен _PostService_ с одноименным классом. Токен используется для получения экземпляра одноименного класса.

#### Кастомные провайдеры

Случаи использования кастомных провайдеров:

- создание кастомного экземпляра класса;
- повторное использование существующего класса в другой зависимости;
- перезапись (переопределение) класса фиктивной версией в целях тестирования.

_NestJS_ предоставляет несколько способов создания кастомных провайдеров.

#### Провайдеры значения: `useValue`

`useValue` используется для внедрения константных значений, сторонних библиотек в _контейнер IoC_, а также для замены настоящей реализации объектом с фиктивными данными. Рассмотрим пример использования фиктивного _PostService_ в целях тестирования:

```javascript
import { PostService } from './post.service'

const mockPostService = {
  // ...
}

@Module({
  providers: [
    {
      provide: PostService,
      useValue: mockPostService
    }
  ]
})
```

В приведенном примере токен _PostService_ разрешится фиктивным объектом _mockPostService_. Благодаря структурной типизации _TypeScript_, в качестве значения `useValue` может передаваться любой объект с совместимым интерфейсом, включая литерал объекта или экземпляр класса, инстанцированный с помощью `new`.

#### Другие токены провайдеров

В качестве токенов провайдеров могут использоваться не только классы, но и, например, строки или символы:

```javascript
import { connection } from './connection'

@Module({
  providers: [
    {
      provide: 'CONNECTION',
      useValue: connection
    }
  ]
})
```

В приведенном примере строковый токен _CONNECTION_ ассоциируется с объектом _connection_.

Провайдеры со строковыми токенами внедряются с помощью декоратора _@Inject_:

```javascript
@Injectable()
export class PostRepository {
  constructor(@Inject('CONNECTION') connection: Connection) {}
}
```

Разумеется, в реальном приложении строковые токены лучше выносить в константы (_constants.ts_).

#### Провайдеры классов: `useClass`

`useClass` позволяет динамически определять класс, которым должен разрешаться токен. Предположим, что у нас имеется абстрактный (или дефолтный) класс _ConfigService_, и мы хотим, чтобы _NestJS_ предоставлял ту или иную реализацию данного сервиса на основе среды выполнения кода:

```javascript
const configServiceProvider = {
  provide: ConfigService,
  useClass:
    process.env.NODE_ENV === 'development'
      ? DevelopmentConfigService
      : ProductionConfigService
}

@Module({
  providers: [configServiceProvider]
})
```

#### Провайдеры фабрик: `useFactory`

`useFactory` позволяет создавать провайдеры динамически. В данном случае провайдер - это значение, возвращаемое фабричной функцией:

1. Фабричная функция принимает опциональные аргументы.
2. Опциональное свойство _inject_ принимает массив провайдеров, разрешаемых _NestJS_ и передаваемых фабричной функции в качестве аргументов в процессе инстанцирования. Эти провайдеры могут быть помечены как опциональные. Экземпляры из списка _inject_ передаются функции в качестве аргументов в том же порядке.

```javascript
const connectionFactory = {
  provide: 'CONNECTION',
  useFactory: (optionsProvider: OptionsProvider, optionalProvider?: string) => {
    const options = optionsProvider.get()
    return new DatabaseConnection(options)
  },
  inject: [OptionsProvider /* обязательно */, { token: 'SomeOptionalProvider' /* провайдер с указанным токеном может разрешаться в `undefined` */, optional: true }]
}

@Module({
  providers: [
    connectionFactory,
    OptionsProvider,
    // { provide: 'SomeOptionalProvider', useValue: 'qwerty' }
  ]
})
```

#### Провайдеры псевдонимов: `useExisting`

`useExisting` позволяет создавать псевдонимы для существующих провайдеров. В приведенном ниже примере строковый токен _AliasedLoggerService_ является псевдонимом "классового токена" _LoggerService_:

```javascript
@Injectable()
class LoggerService {
  // ...
}

const loggerAliasProvider = {
  provide: 'AliasedLoggerService',
  useExisting: LoggerService
}

@Module({
  providers: [LoggerService, loggerAliasProvider]
})
```

#### Другие провайдеры

Провайдеры могут предоставлять не только сервисы, но и другие значения, например, массив объектов с настройками в зависимости от текущей среды выполнения кода:

```javascript
const configFactory = {
  provide: 'CONFIG',
  useFactory: () => process.env.NODE_ENV === 'development' ? devConfig : prodConfig
}

@Module({
  providers: [configFactory]
})
```

#### Экспорт кастомных провайдеров

Областью видимости любого провайдера, включая кастомные, является модуль, в котором он определяется. Для обеспечения доступа к нему других модулей, провайдер должен быть экспортирован из модуля. Кастомный провайдер может экспортироваться с помощью токена или полного объекта.

Пример экспорта кастомного провайдера с помощью токена:

```javascript
const connectionFactory = {
  provide: 'CONNECTION',
  useFactory: (optionsProvider: OptionsProvider) => {
    const options = optionsProvider.get()
    return new DatabaseConnection(options)
  },
  inject: [OptionsProvider]
}

@Module({
  providers: [connectionFactory],
  exports: ['CONNECTION']
})
```

Пример экспорта кастомного провайдера с помощью объекта:

```javascript
const connectionFactory = {
  provide: 'CONNECTION',
  useFactory: (optionsProvider: OptionsProvider) => {
    const options = optionsProvider.get()
    return new DatabaseConnection(options)
  },
  inject: [OptionsProvider]
}

@Module({
  providers: [connectionFactory],
  exports: [connectionFactory]
})
```

### Асинхронные провайдеры

Что если мы не хотим обрабатывать запросы до установки соединения с базой данных? Для решения задач, связанных с отложенным запуском приложения, используются асинхронные провайдеры:

```javascript
{
  provide: 'ASYNC_CONNECTION',
  useFactory: async () => {
    const connection = await createConnection(options)
    return connection
  }
}
```

В данном случае _NestJS_ будет ждать разрешения промиса перед инстанцированием любого класса, от которого зависит провайдер.

Асинхронные провайдеры внедряются в другие компоненты с помощью токенов. В приведенном примере следует использовать конструкцию `@Inject('ASYNC_CONNECTION')`.

### Динамические модули

В большинстве случаев используются регулярные или статические (static) модули. Модули определяют группы компонентов (провайдеров или контроллеров), представляющих определенную часть приложения. Они предоставляют контекст выполнения (execution context) или область видимости (scope) для компонентов. Например, провайдеры, определенные в модуле, являются доступными (видимыми) другим членам модуля без необходимости их экспорта/импорта. Когда провайдер должен быть видимым за пределами модуля, он сначала экспортируется из хостового (host) модуля и затем импортируется в потребляющий (consuming) модуль.

Вспомним, как это выглядит.

Сначала определяется _UsersModule_ для предоставления и экспорта _UsersService_. _UsersModule_ - это хостовый модуль для _UsersService_:

```javascript
import { Module } from '@nestjs/common'
import { UsersService } from './users.service'

@Module({
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {}
```

Затем определяется _AuthModule_, который импортирует _UsersModule_, что делает экспортируемые из _UsersModule_ провайдеры доступными внутри _AuthModule_:

```javascript
import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { UsersModule } from '../users/users.module'

@Module({
  imports: [UsersModule],
  providers: [AuthService],
  exports: [AuthService]
})
export class AuthModule {}
```

Такая конструкция позволяет внедрить _UsersService_ в _AuthService_, который находится (hosted) в _AuthModule_:

```javascript
import { Injectable } from '@nestjs/common'
import { UsersService } from '../users/users.service'

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  // ...
}
```

_NestJS_ делает _UsersService_ доступным внутри _AuthModule_ следующим образом:

1. Сначала происходит инстанцирование _UsersModule_, включая транзитивный импорт модулей, потребляемых _UsersModule_, и транзитивное разрешение всех зависимостей.
2. Затем происходит инстанцирование _AppModule_. После этого экспортируемые из _UsersModule_ провайдеры становятся доступными для компонентов _AuthModule_ (так, будто они были определены в _AuthModule_).
3. Наконец, происходит внедрение _UsersService_ в _AuthService_.

#### Динамические модули

Динамический модуль позволяет импортировать один модуль в другой и кастомизировать свойства и поведение импортируемого модуля во время импорта.

#### Пример конфигурационного модуля

Предположим, что мы хотим, чтобы _ConfigModule_ принимал объект _options_, позволяющий настраивать его поведение: мы хотим иметь возможность определять директорию, в которой находится файл _.env_.

Динамические модули позволяют передавать параметры в импортируемые модули. Рассмотрим пример импорта статического _ConfigModule_ (_внимание_ на массив _imports_ в декораторе _@Module_):

```javascript
import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ConfigModule } from './config/config.module'

@Module({
  imports: [ConfigModule],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
```

Теперь рассмотрим пример импорта динамического модуля:

```javascript
import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ConfigModule } from './config/config.module'

@Module({
  imports: [ConfigModule.register({ folder: './config' })],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
```

Что здесь происходит?

1. _ConfigModule_ - это обычный класс со статическим методом _register_. Этот метод может называться как угодно, но по соглашению его следует именовать _register_ или _forRoot_.
2. Метод _register_ определяется нами, поэтому он может принимать любые параметры. Мы хотим, чтобы он принимал объект _options_.
3. Можно предположить, что _register()_ возвращает _module_, поскольку возвращаемое им значение указано в списке _imports_.

На самом деле метод _register_ возвращает _DynamicModule_. Динамический модуль - это модуль, создаваемый во время выполнения с такими же свойствами, что и статический модуль, и одним дополнительным свойством _module_. Значением этого свойства должно быть название модуля, которое должно совпадать с названием класса модуля.

Интерфейс динамического модуля возвращает модуль, но вместо того, чтобы "фиксить" свойства этого модуля в декораторе _@Module_, они определяются программно.

Что еще можно здесь сказать?

1. Свойство _imports_ декоратора _@Module_ принимает не только названия классов, но также функции, возвращающие динамические модули.
2. Динамический модуль может импортировать другие модули.

Вот как может выглядеть _ConfigModule_:

```javascript
import { DynamicModule, Module } from '@nestjs/common'
import { ConfigService } from './config.service'

@Module({})
export class ConfigModule {
  static register(): DynamicModule {
    return {
      module: ConfigModule,
      providers: [ConfigService],
      exports: [ConfigService]
    }
  }
}
```

Наш конфигурационный модуль пока бесполезен. Давайте это исправим.

#### Настройка модуля

Рассмотрим пример использования объекта _options_ для настройки сервиса _ConfigService_:

```javascript
import { Injectable } from '@nestjs/common'
import dotenv from 'dotenv'
import fs from 'fs'
import { EnvConfig } from './interfaces'

@Injectable()
export class ConfigService {
  private readonly envConfig: EnvConfig

  constructor() {
    const options = { folder: './config' }

    const fileName = `${process.env.NODE_ENV || 'development'}.env`
    const envFile = path.resolve(__dirname, '../../', options.folder, fileName)
    this.envConfig = dotenv.parse(fs.readFileSync(envFile))
  }

  get(key: string): string {
    return this.envConfig[key]
  }
}
```

Нам нужно каким-то образом внедрить объект _options_ через метод _register_ из предыдущего шага. Разумеется, для этого используется внедрение зависимостей. _ConfigModule_ предоставляет _ConfigService_. В свою очередь, _ConfigService_ зависит от объекта _options_, который передается во время выполнения. Поэтому во время выполнения _options_ должен быть привязан (bind) к _IoC контейнеру_ - это позволит _NestJS_ внедрить его в _ConfigService_. Как вы помните из раздела, посвященного провайдерам, провайдеры могут предоставлять любые значения, а не только сервисы.

Вернемся к статическому методу _register_. Помните, что мы конструируем модуль динамически и одним из свойств модуля является список провайдеров. Поэтому необходимо определить объект с настройками в качестве провайдера. Это сделает его внедряемым (injectable) в _ConfigService_:

```javascript
import { DynamicModule, Module } from '@nestjs/common'
import { ConfigService } from './config.service'

@Module({})
export class ConfigModule {
  static register(options): DynamicModule {
    return {
      module: ConfigModule,
      providers: [
        {
          provide: 'CONFIG_OPTIONS',
          useValue: options
        },
        ConfigService
      ],
      exports: [ConfigService]
    }
  }
}
```

Теперь провайдер _CONFIG\_OPTIONS_ может быть внедрен в _ConfigService_:

```javascript
import { Injectable } from '@nestjs/common'
import dotenv from 'dotenv'
import fs from 'fs'
import { EnvConfig } from './interfaces'

@Injectable()
export class ConfigService {
  private readonly envConfig: EnvConfig

  constructor(@Inject('CONFIG_OPTIONS') private options) {
    const fileName = `${process.env.NODE_ENV || 'development'}.env`
    const envFile = path.resolve(__dirname, '../../', options.folder, fileName)
    this.envConfig = dotenv.parse(fs.readFileSync(envFile))
  }

  get(key: string): string {
    return this.envConfig[key]
  }
}
```

Опять же вместо строкового токена _CONFIG\_OPTIONS_ в реальных приложениях лучше использовать константы.

#### Разница между методами `register`, `forRoot` и `forFeature`

При создании модуля с помощью:

- _register()_, предполагается, что данный динамический модуль будет использоваться только в вызывающем его модуле;
- _forRoot()_, предполагается однократная настройка динамического модуля и его повторное использование в нескольких местах;
- _forFeature()_, предполагается использование настройки _forRoot_, но имеется необходимость в модификации некоторых настроек применительно к нуждам вызывающего модуля (например, репозиторий, к которому модуль будет иметь доступ, или контекст, который будет использоваться "логгером").

### Области внедрения / Injection scopes

#### Область видимости провайдера

Провайдер может иметь одну их следующих областей видимости:

- _DEFAULT_ - в приложении используется единственный экземпляр провайдера. Жизненный цикл (lifecycle) экземпляра совпадает с жизненным циклом приложения. "Провайдеры-одиночки" (singleton providers) инстанцируются при инициализации приложения;
- _REQUEST_ - для каждого запроса создается новый экземпляр провайдера. Экземпляр уничтожается сборщиком мусора после обработки запроса;
- _TRANSIENT_ - временные (transient) провайдеры не распределяются между потребителями. Каждый потребитель, внедряющий провайдера, получает новый экземпляр.

_Обратите внимание_: в большинстве случаев рекомендуется использовать дефолтную область видимости. Распределение провайдеров между потребителями и запросами означает, что экземпляр может быть кеширован и инициализируются только один раз при запуске приложения.

#### Определение области видимости провайдера

Область видимости провайдера определяется в настройке _scope_ декоратора _@Injectable_:

```javascript
import { Injectable, Scope } from '@nestjs/common'

@Injectable({ scope: Scope.REQUEST })
export class PostService {}
```

Пример определения области видимости кастомного провайдера:

```javascript
{
  provide: 'CACHE_MANAGER',
  useClass: CacheManager,
  scope: Scope.TRANSIENT
}
```

_Обратите внимание_: по умолчанию используется область видимости _DEFAULT_.

#### Область видимости контроллера

Контроллеры также могут иметь область видимости, которая применяется ко всем определенным в них обработчикам.

Область видимости контроллера определяется с помощью настройки _scope_ декоратора _@Controller_:

```javascript
@Controller({
  path: 'post',
  scope: Scope.REQUEST
})
export class PostController {}
```

#### Иерархия областей видимости

Область видимости _REQUEST_ поднимается (всплывает) по цепочке внедрения зависимостей. Это означает, что контроллер, который основан на провайдере с областью видимости _REQUEST_, будет иметь такую же область видимости.

Предположим, что у нас имеется такой граф зависимостей: `PostController <- PostService <- PostRepository`. Если область видимости _PostService_ ограничена запросом (а другие зависимости имеют дефолтную область видимости), область видимости _PostController_ будет ограничена запросом, поскольку он зависит от внедренного сервиса. _PostRepository_, который не зависит от _PostService_, будет иметь дефолтную область видимости.

Зависимости с временной областью видимости не следуют данному паттерну. Если _PostService_ с дефолтной областью видимости внедряет _LoggerService_ с временной областью видимости, он получит новый экземпляр сервиса. Однако область видимости _PostService_ останется дефолтной, поэтому его внедрение не приведет к созданию нового экземпляра _PostService_.

#### Провайдер запроса

Доступ к объекту запроса в ограниченном запросом провайдере можно получить через объект _REQUEST_:

```javascript
import { Injectable, Scope, Inject } from '@nestjs/common'
import { REQUEST } from '@nestjs/core'
import { Request } from 'express'

@Injectable({ scope: Scope.REQUEST })
export class PostService {
  constructor(@Inject(REQUEST) private request: Request) {}
}
```

В приложениях, использующих _GraphQL_, вместо _REQUEST_ следует использовать _CONTEXT_:

```javascript
import { Injectable, Scope, Inject } from '@nestjs/common'
import { CONTEXT } from '@nestjs/graphql'

@Injectable({ scope: Scope.REQUEST })
export class PostService {
  constructor(@Inject(CONTEXT) private context) {}
}
```

### Циклическая зависимость / Circular dependency

Циклическая (круговая) зависимость возникает, когда 2 класса зависят друг от друга. Например, класс А зависит от класса Б, а класс Б зависит от класса А. Циклическая зависимость в _NestJS_ может возникнуть между модулями и провайдерами.

_NestJS_ предоставляет 2 способа для разрешения циклических зависимостей:

- использование техники передачи (перенаправления) ссылки (forward referencing);
- использование класса _ModuleRef_.

#### Передача ссылки

Передача ссылки позволяет _NestJS_ ссылаться на классы, которые еще не были определены, с помощью вспомогательно функции _forwardRef_. Например, если _PostService_ и _CommonService_ зависят друг от друга, обе стороны отношений могут использовать декоратор _@Inject_ и утилиту _forwardRef_ для разрешения циклической зависимости:

```javascript
import { Injectable, Inject, forwardRef } from '@nestjs/common'

// post.service.ts
@Injectable()
export class PostService {
  constructor(
    @Inject(forwardRef(() => CommonService))
    private commonService: CommonService
  ) {}
}

// common.service.ts
@Injectable()
export class CommonService {
  constructor(
    @Inject(forwardRef(() => PostService))
    private postService: PostService
  ) {}
}
```

Для разрешения циклической зависимости между модулями также используется утилита _forwardRef_:

```javascript
@Module({
  imports: [forwardRef(() => PostModule)]
})
export class CommonModule {}
```

### Ссылка на модуль / Module reference

Класс _ModuleRef_ предоставляет доступ к внутреннему списку провайдеров и позволяет получать ссылку на любого провайдера с помощью токена внедрения (injection token) как ключа для поиска (lookup key). Данный класс также позволяет динамически инстанцировать статические провайдеры и провайдеры с ограниченной областью видимости. _ModuleRef_ внедряется в класс обычным способом:

```javascript
import { ModuleRef } from '@nestjs/core'

@Injectable()
export class PostService {
  constructor(private moduleRef: ModuleRef) {}
}
```

#### Получение экземпляров компонентов

Метод _get_ экземпляра _ModuleRef_ позволяет извлекать провайдеры, контроллеры, защитники, перехватчики и т.п., которые существуют (были инстанцированы) в данном модуле с помощью токена внедрения/названия класса:

```javascript
@Injectable()
export class PostService implements OnModuleInit {
  private service: Service
  constructor(private moduleRef: ModuleRef) {}

  onModuleInit() {
    this.service = this.moduleRef.get(Service)
  }
}
```

_Обратите внимание_: метод _get_ не позволяет извлекать провайдеры с ограниченной областью видимости.

Для извлечения провайдера из глобального контекста (например, когда провайдер был внедрен в другой модуль) используется настройка _strict_ со значением _false_:

```javascript
this.moduleRef.get(Service, { strict: false })
```

#### Разрешение провайдеров с ограниченной областью видимости

Для динамического разрешения провайдеров с ограниченной областью видимости используется метод _resolve_, в качестве аргумента принимающий токен внедрения провайдера:

```javascript
@Injectable()
export class PostService implements OnModuleInit {
  private transientService: TransientService
  constructor(private moduleRef: ModuleRef) {}

  async onModuleInit() {
    this.transientService = await this.moduleRef.resolve(TransientService)
  }
}
```

Метод _resolve_ возвращает уникальный экземпляр провайдера из собственного поддерева контейнера внедрения зависимостей (DI container sub-tree). Каждое поддерево имеет уникальный идентификатор контекста (context identifier):

```javascript
@Injectable()
export class PostService implements OnModuleInit {
  constructor(private moduleRef: ModuleRef) {}

  async onModuleInit() {
    const transientServices = await Promise.all([
      this.moduleRef.resolve(TransientService),
      this.moduleRef.resolve(TransientService)
    ])
    console.log(transientServices[0] === transientServices[1]) // false
  }
}
```

Для генерации одного экземпляра для нескольких вызовов _resolve()_ и обеспечения распределения одного поддерева в _resolve()_ можно передать идентификатор контекста. Для генерации такого идентификатора используется класс _ContextIdFactory_ (метод _create_):

```javascript
import { ContextIdFactory } from '@nestjs/common'

@Injectable()
export class PostService implements OnModuleInit {
  constructor(private moduleRef: ModuleRef) {}

  async onModuleInit() {
    // создаем идентификатор контекста
    const contextId = ContextIdFactory.create()
    const transientServices = await Promise.all([
      // передаем идентификатор контекста
      this.moduleRef.resolve(TransientService, contextId),
      this.moduleRef.resolve(TransientService, contextId)
    ])
    console.log(transientServices[0] === transientServices[1]) // true
  }
}
```

#### Регистрация ограниченного запросом провайдера

Для регистрации кастомного объекта _REQUEST_ для созданного вручную поддерева используется метод _registerRequestByContextId_ экземпляра _ModuleRef_:

```javascript
const contextId = ContextIdFactory.create()
this.moduleRef.registerRequestByContextId(/* REQUEST_OBJECT */, contextId)
```

#### Получение текущего поддерева

Иногда может потребоваться разрешить экземпляр ограниченного запросом провайдера в пределах контекста запроса (request context). Предположим, что _PostService_ - это ограниченный запросом провайдер, и мы хотим разрешить _PostRepository_, который также является провайдером с областью видимости _REQUEST_. Для распределения одного и того же поддерева следует получить текущий идентификатор контекста вместо создания нового. Сначала объект запроса внедряется с помощью декоратора _@Inject_:

```javascript
@Injectable()
export class PostService {
  constructor(
    @Inject(REQUEST) private request: Request
  ) {}
}
```

Затем на основе объекта запроса с помощью метода _getByRequest_ класса _ContextIdFactory_ создается идентификатор контекста, который передается в метод _resolve_:

```javascript
const contextId = ContextIdFactory.getByRequest(this.request)
const postRepository = await this.moduleRef.resolve(PostRepository, contextId)
```

#### Динамическое инстанцирование кастомных классов

Для динамического инстанцирования класса, который не был зарегистрирован в качестве провайдера, используется метод _create_ экземпляра _ModuleRef_:

```javascript
@Injectable()
export class PostService implements OnModuleInit {
  private postFactory: PostFactory
  constructor(private moduleRef: ModuleRef) {}

  async onModuleInit() {
    this.postFactory = await this.moduleRef.create(PostFactory)
  }
}
```

Данная техника позволяет условно (conditional) инстанцировать классы за пределами _контейнера IoC_.

### Ленивая загрузка модулей

По умолчанию все модули загружаются при запуске приложения. В большинстве случаев это нормально. Однако, это может стать проблемой для приложений/воркеров, запущенных в бессерверной среде (serverless environment), где критичной является задержка запуска приложения ("холодный старт").

Ленивая загрузка может ускорить время запуска посредством загрузки только тех модулей, которые требуются для определенного вызова бессерверной функции. Для еще больше ускорения запуска другие модули могут загружаться асинхронно после "разогрева" такой функции.

_Обратите внимание_: в лениво загружаемых модулях и функциях не вызываются методы хуков жизненного цикла (lifecycle hooks methods).

#### Начало работы

_NestJS_ предоставляет класс _LazyModuleLoader_ для ленивой загрузки модулей, который внедряется в класс обычным способом:

```javascript
import { LazyModuleLoader } from '@nestjs/core'

@Injectable()
export class PostService {
  constructor(private lazyModuleLoader: LazyModuleLoader) {}
}
```

В качестве альтернативы ссылку на провайдер _LazyModuleLoader_ можно получить через экземпляр приложения _NestJS_:

```javascript
const lazyModuleLoader = app.get(LazyModuleLoader)
```

Далее модули загружаются с помощью такой конструкции:

```javascript
const { LazyModule } = await import('./lazy.module')
const moduleRef = await this.lazyModuleLoader.load(() => LazyModule)
```

_Обратите внимание_: лениво загружаемые модули кешируются после первого вызова метода _load_. Это означает, что последующие загрузки _LazyModule_ будут очень быстрыми и будут возвращать кешированный экземпляр вместо повторной загрузки модуля.

Метод _load_ возвращает ссылку на модуль (_LazyModule_), которая позволяет исследовать внутренний список провайдеров и получать ссылку на провайдер с помощью токена внедрения в качестве ключа для поиска.

Предположим, что у нас имеется такой _LazyModule_:

```javascript
@Module({
  providers: [LazyService],
  exports: [LazyService]
})
export class LazyModule {}
```

_Обратите внимание_: ленивые модули не могут быть зарегистрированы в качестве глобальных модулей.

Пример получения ссылки на провайдер _LazyService_:

```javascript
const { LazyModule } = await import('./lazy.module')
const moduleRef = await this.lazyModuleLoader.load(() => LazyModule)

const { LazyService } = await import('./lazy.service')
const lazyService = moduleRef.get(LazyService)
```

_Обратите внимание_: при использовании _Webpack_ файл _tsconfig.json_ должен быть обновлен следующим образом:

```json
{
  "compilerOptions": {
    "module": "esnext",
    "moduleResolution": "node"
  }
}
```

#### Ленивая загрузка контроллеров, шлюзов и резолверов

Поскольку контроллеры (или резолверы в _GraphQL_) в _NestJS_ представляют собой наборы роутов/путей/темы (или запросы/мутации), мы не можем загружать их лениво с помощью класса _LazyModuleLoader_.

#### Случаи использования лениво загружаемых модулей

Лениво загружаемые модули требуются в ситуациях, когда воркер/крон-задача (cron job)/лямда (lambda) или бессерверная функция/веб-хук (webhook) запускают разные сервисы (разную логику) в зависимости от входных аргументов (путь/дата/параметры строки запроса и т.д.).

### Контекст выполнения / Execution context

_NestJS_ предоставляет несколько вспомогательных классов, помогающих создавать приложения, работающие в разных контекстах (HTTP-сервер, микросервисы и веб-сокеты). Эти утилиты предоставляют информацию о текущем контексте выполнения, которая может использоваться для создания общих (generic) защитников, фильтров и перехватчиков.

#### ArgumentsHost

Класс _ArgumentsHost_ предоставляет методы для извлечения аргументов, переданных в обработчик. Он позволяет выбрать соответствующий контекст (HTTP, RPC (микросервисы) или веб-сокеты) для извлечения из него аргументов. Ссылка на экземпляр _ArgumentsHost_ обычно представлена в виде параметра _host_. Например, с таким параметром вызывается метод _catch_ фильтра исключений.

По сути, _ArgumentsHost_ - это абстракция над аргументами, переданными в обработчик. Например, для HTTP-сервера (при использовании `@nestjs/platform-express`) объект _host_ инкапсулирует массив _[request, response, next]_, где _request_ - это объект запроса, _response_ - объект ответа и _next_ - функция, управляющая циклом запрос-ответ приложения. Для _GraphQL-приложений_ объект _host_ содержит массив _[root, args, context, info]_.

#### Текущий контекст выполнения

Тип контекста, в котором запущено приложение, можно определить с помощью метода _getType_:

```javascript
import { GqlContextType } from '@nestjs/graphql'

if (host.getType() === 'http') {
  // ...
} else if (host.getType() === 'rpc') {
  // ...
} else if (host.getType<GqlContextType>() === 'graphql') {
  // ...
}
```

#### Аргументы обработчика хоста

Извлечь массив аргументов, переданных в обработчик, можно с помощью метода _getArgs_:

```javascript
const [req, res, next] = host.getArgs()
```

Метод _getArgByIndex_ позволяет извлекать аргументы по индексу:

```javascript
const req = host.getArgByIndex(0)
const res = host.getArgByIndex(1)
```

Перед извлечением аргументов рекомендуется переключаться (switch) на соответствующий контекст. Это можно сделать с помощью следующих методов:

```javascript
switchToHttp(): HttpArgumentsHost
switchToRpc(): RpcArgumentsHost
switchToWs(): WsArgumentsHost
```

Перепишем предыдущий пример с помощью метода _switchToHttp_. Данный метод возвращает объект _HttpArgumentsHost_, соответствующий контексту HTTP-сервера. Этот объект предоставляет 2 метода для извлечения объектов запроса и ответа:

```javascript
import { Request, Response } from 'express'

const ctx = host.switchToHttp()
const req = ctx.getRequest<Request>()
const res = ctx.getResponse<Response>()
```

Аналогичные методы имеют объекты _RpcArgumentsHost_ и _WsArgumentsHost_:

```javascript
export interface WsArgumentsHost {
  /**
   * Возвращает объект данных.
   */
  getData<T>(): T
  /**
   * Возвращает объект клиента.
   */
  getClient<T>(): T
}

export interface RpcArgumentsHost {
  /**
   * Возвращает объект данных.
   */
  getData<T>(): T

  /**
   * Возвращает объект контекста.
   */
  getContext<T>(): T
}
```

#### ExecutionContext

_ExecutionContext_ расширяет _ArgumentsHost_, предоставляя дополнительную информацию о текущем процессе выполнения. Экземпляр _ExecutionContext_ передается, например, в метод _canActivate_ защитника и метод _intercept_ перехватчика. _ExecutionContext_ предоставляет следующие методы:

```javascript
export interface ExecutionContext extends ArgumentsHost {
  /**
   * Возвращает тип (не экземпляр) контроллера, которому принадлежит текущий обработчик.
   */
  getClass<T>(): Type<T>
  /**
   * Возвращает ссылку на обработчик (метод),
   * который будет вызван при дальнейшей обработке запроса.
   */
  getHandler(): Function
}
```

Если в контексте HTTP текущим запросом является POST-запрос, привязанный к методу _create_ контроллера _PostController_, _getHandler_ вернет ссылку на _create_, а _getClass_ - тип _PostController_:

```javascript
const methodKey = ctx.getHandler().name // create
const className = ctx.getClass().name // PostController
```

Возможность получать доступ к текущему классу и методу обработчика позволяет, в частности, извлекать метаданные, установленные с помощью декоратора _@SetMetadata_.

#### Reflection и метаданные

Декоратор _@SetMetadata_ позволяет добавлять кастомные метаданные в обработчик:

```javascript
import { SetMetadata } from '@nestjs/common'

@Post()
@SetMetadata('roles', ['admin'])
async create(@Body() createPostDto: CreatePostDto) {
  this.postService.create(createPostDto)
}
```

В приведенном примере мы добавляем в метод _create_ метаданные _roles_ (_roles_ - это ключ, а _['admin']_ - значение). _@SetMetadata_ не рекомендуется использовать напрямую. Лучше вынести его в кастомный декоратор:

```javascript
import { SetMetadata } from '@nestjs/common'

export const Roles = (...roles: string[]) => SetMetadata('roles', roles)
```

Перепишем предыдущий пример:

```javascript
@Post()
@Roles('admin')
async create(@Body() createPostDto: CreatePostDto) {
  this.postService.create(createPostDto)
}
```

Для доступа к кастомным метаданным в обработчике используется вспомогательный класс _Reflector_:

```javascript
import { Reflector } from '@nestjs/core'

@Injectable()
export class RolesGuard {
  constructor(private reflector: Reflector) {}
}
```

Читаем метаданные:

```javascript
const roles = this.reflector.get<string[]>('roles', ctx.getHandler())
```

В качестве альтернативы метаданные можно добавлять на уровне контроллера, т.е. применять их ко всем обработчикам сразу:

```javascript
@Roles('admin')
@Controller('post')
export class PostController {}
```

В этом случае для извлечения метаданных в качестве второго аргумента метода _get_ следует передавать _ctx.getClass_:

```javascript
const roles = this.reflector.get<string[]>('roles', ctx.getClass())
```

Класс _Reflector_ предоставляет 2 метода для одновременного извлечения метаданных, добавленных на уровне контроллера и метода, и их комбинации.

Рассмотрим такой случай:

```javascript
@Roles('user')
@Controller('post')
export class PostController {
  @Post()
  @Roles('admin')
  async create(@Body() createPostDto: CreatePostDto) {
    this.postService.create(createPostDto)
  }
}
```

Метод _getAllAndOverride_ перезаписывает метаданные:

```javascript
const roles = this.reflector.getAllAndOverride<string[]>('roles', [
  ctx.getHandler(),
  ctx.getClass()
])
```

В данном случае переменная _roles_ будет содержать массив _['admin']_.

Метод _getAllAndMerge_ объединяет метаданные:

```javascript
const roles = this.reflector.getAllAndMerge<string[]>('roles', [
  ctx.getHandler(),
  ctx.getClass()
])
```

В этом случае переменная _roles_ будет содержать массив _['user', 'admin']_.

### События жизненного цикла / Lifecycle events

Приложение _NestJS_, как и любой элемент приложения, обладают жизненным циклом, управляемым _NestJS_. _NestJS_ предоставляет хуки жизненного цикла (lifecycle hooks), которые позволяют фиксировать ключевые события жизненного цикла и определенным образом реагировать (запускать код) при возникновении этих событий.

#### Жизненный цикл

На диаграмме ниже представлена последовательность ключевых событий жизненного цикла приложения, от его запуска до завершения процесса _Node.js_. Жизненный цикл можно разделить на 3 стадии: инициализация, выполнение (запуск) и завершение. Жизненный цикл позволяет планировать инициализацию модулей и сервисов, управлять активными подключениями и плавно (graceful) завершать работу приложения при получении соответствующего сигнала.

img
<br />

#### События жизненного цикла

События жизненного цикла возникают в процессе запуска и завершения работы приложения. _NestJS_ вызывает методы хуков, зарегистрированные на _modules_, _injectables_ и _controllers_ для каждого события.

В приведенном ниже списке методы _onModuleDestroy_, _beforeApplicationShutdown_ и _onApplicationShutdown_ вызываются только при явном вызове _app.close()_ или при получении процессом специального системного сигнала (такого как _SIGTERM_), а также при корректном вызове _enableShutdownHooks_ на уровне приложения.

_NestJS_ предоставляет следующие методы хуков:

- _onModuleInit_ - вызывается один раз после разрешения зависимостей модуля;
- _onApplicationBootstrap_ - вызывается один раз после инициализации модулей, но до регистрации обработчиков установки соединения;
- _onModuleDestroy_ - вызывается после получения сигнала о завершении работы (например, _SIGTERM_);
- _beforeApplicationShutdown_ - вызывается после _onModuleDestroy_; после завершения (разрешения или отклонения промисов), все существующие подключения закрываются (вызывается _app.close()_);
- _onApplicationShutdown_ - вызывается после закрытия всех подключений (разрешения _app.close()_).

_Обратите внимание_: хуки жизненного цикла не вызываются для классов, область видимости которых ограничена запросом.

#### Использование хуков жизненного цикла

Каждый хук представлен соответствующим интерфейсом. Реализация такого интерфейса означает регистрацию хука. Например, для регистрации хука, вызываемого после инициализации модуля на определенном классе, следует реализовать интерфейс _OnModuleInit_ посредством определения метода _onModuleInit_:

```javascript
import { Injectable, OnModuleInit } from '@nestjs/common'

@Injectable()
export class UsersService implements OnModuleInit {
  onModuleInit() {
    console.log('Инициализация модуля завершена.')
  }
}
```

#### Асинхронная инициализация модуля

Хуки _OnModuleInit_ и _OnApplicationBootstrap_ позволяют отложить процесс инициализации модуля:

```javascript
async onModuleInit(): Promise<void> {
  const response = await fetch(/* ... */)
}
```

#### Завершение работы приложения

Хуки, связанные с завершением работы приложения, по умолчанию отключены, поскольку они потребляют системные ресурсы. Для их включения следует вызвать метод _enableShutdownHooks_ на уровне приложения:

```javascript
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const ap = await NestFactory.create(AppModule)

  // включаем хуки
  app.enableShutdownHooks()

  await app.listen(3000)
}
bootstrap()
```

Когда приложение получает сигнал о завершении работы, оно вызывает зарегистрированные методы _onModuleDestroy_, _beforeApplicationShutdown_ и _onApplicationShutdown_ с соответствующим сигналом в качестве первого параметра. Если зарегистрированная функция является асинхронной (ожидает разрешения промиса), _NestJS_ будет ждать разрешения промиса:

```javascript
@Injectable()
class UserService implements OnApplicationShutdown {
  onApplicationShutdown(signal: string) {
    console.log(signal) // например, `SIGTERM`
  }
}
```

_Обратите внимание_: вызов _app.close()_ не завершает процесс _Node.js_, а только запускает хуки _OnModuleDestroy_ и _OnApplicationShutdown_, поэтому если у нас имеются счетчики (timers), длительные фоновые задачи и т.п., процесс не будет завершен автоматически.

## База данных / Database

Nest позволяет взаимодействовать с любой базой данных SQL или NoSQL. В данном разделе мы рассмотрим интеграцию с MongoDB с помощью Mongoose и SQLite с помощью Prisma.

### Mongo

Устанавливаем необходимые зависимости:

```bash
npm i @nestjs/mongoose mongoose
```

Импортируем MongooseModule в корневой AppModule:

```ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [MongooseModule.forRoot('mongodb://localhost/nest')],
})
export class AppModule {}
```

Метод `forRoot` принимает такой же объект с настройками, что и метод [mongoose.connect](https://mongoosejs.com/docs/connections.html).

__Внедрение модели__

В Mongoose все начинается со [схемы](https://mongoosejs.com/docs/guide.html). Схема соответствует коллекции в Mongo и определяет форму документов коллекции. Схемы используются для определения [моделей](https://mongoosejs.com/docs/models.html). Модели отвечают за создание и чтение документов из БД.

Схемы могут создаваться с помощью декораторов Nest или с помощью Mongoose вручную. Рекомендуется использовать первый способ, поскольку это уменьшает количество шаблонного кода и повышает читаемость кода.

Определяем `CatSchema`:

```ts
// schemas/cat.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CatDocument = HydratedDocument<Cat>;

@Schema()
export class Cat {
  @Prop()
  name: string;

  @Prop()
  age: number;

  @Prop()
  breed: string;
}

export const CatSchema = SchemaFactory.createForClass(Cat);
```

Декоратор `@Schema` помечает класс как определение схемы. Он связывает класс `Cat` с коллекцией `cats` (_обратите внимание_ на `s` в конце). Этот декоратор принимает опциональный параметр - объект с [настройками схемы](https://mongoosejs.com/docs/guide.html#options).

Декоратор `@Prop` определяет свойство документа. В `CatSchema` определено 3 свойства: `name`, `age` и `breed`. [Типы схемы](https://mongoosejs.com/docs/schematypes.html) для этих свойств автоматически выводятся благодаря метаданным TS и отражению (reflection). В более сложных случаях, когда типы не могут быть выведены автоматически, они должны определяться в явном виде:

```ts
@Prop([String])
tags: string[];
```

`@Prop()` принимает опциональный объект с [настройками свойства](https://mongoosejs.com/docs/schematypes.html#schematype-options). Эти настройки позволяют пометить свойство как обязательное, неизменяемое или определить его дефолтное значение.

`@Prop()` также используется для определения связи (отношения) с другой моделью. Например, если `Cat` имеет `Owner` (владелец), запись о котором хранится в коллекции `owners`, свойство должно иметь тип (type) и ссылку (ref):

```ts
import * as mongoose from 'mongoose';
import { Owner } from '../owners/schemas/owner.schema';

// в определении класса
@Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Owner' })
owner: Owner;
```

Для отношения "Один-ко-Многим" настройка свойства должна выглядеть так:

```ts
@Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Owner' }] })
owner: Owner[];
```

Определяем `CatsModule`:

```ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';
import { Cat, CatSchema } from './schemas/cat.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Cat.name, schema: CatSchema }])],
  controllers: [CatsController],
  providers: [CatsService],
})
export class CatsModule {}
```

`MongooseModule` предоставляет метод `forFeature` для настройки модуля, включая определение моделей, которые должны быть зарегистрированы в текущей области видимости (scope). При необходимости использования моделей в другом модуле `MongooseModule` следует добавить в раздел `exports` и импортировать `CatsModule` в другой модуль.

После регистрации схемы модель `Cat` может быть внедрена в `CatsService` с помощью декоратора `@InjectModel`:

```ts
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cat, CatDocument } from './schemas/cat.schema';
import { CreateCatDto } from './dto/create-cat.dto';

@Injectable()
export class CatsService {
  constructor(@InjectModel(Cat.name) private catModel: Model<CatDocument>) {}

  async create(createCatDto: CreateCatDto): Promise<Cat> {
    const createdCat = new this.catModel(createCatDto);
    return createdCat.save();
  }

  async findAll(): Promise<Cat[]> {
    return this.catModel.find().exec();
  }
}
```

__Подключение__

Для доступа к нативному объекту [подключения Mongoose](https://mongoosejs.com/docs/api.html#Connection), это подключение необходимо внедрить в сервис с помощью декоратора `@InjectConnection`:

```ts
import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class CatsService {
  constructor(@InjectConnection() private connection: Connection) {}
}
```

__Хуки (посредники)__

Посредники (промежуточное ПО - middleware, предварительные и последующие хуки - pre/post hooks) - это функции, которым передается управление в процессе выполнения асинхронных функций. Посредники определяются на уровне схемы и могут быть полезны для написания плагинов. Вызов `pre()` и `post()` после компиляции модели в Mongoose не работает. Для регистрации хука перед регистрацией модели используется метод `forFeatureAsync` из `MongooseModule` вместе с провайдером фабрики (например, `useFactory()`). Эта техника позволяет получить доступ к объекту схемы и использовать метод `pre` или `post` для регистрации хука на этой схеме:

```ts
@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Cat.name,
        useFactory: () => {
          const schema = CatsSchema;
          schema.pre('save', function () {
            console.log('Hello from pre save');
          });
          return schema;
        },
      },
    ]),
  ],
})
export class AppModule {}
```

Фабричная функция может быть асинхронной и может внедрять зависимости с помощью `inject`:

```ts
@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Cat.name,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => {
          const schema = CatsSchema;
          schema.pre('save', function() {
            console.log(
              `${configService.get('APP_NAME')}: Hello from pre save`,
            ),
          });
          return schema;
        },
        inject: [ConfigService],
      },
    ]),
  ],
})
export class AppModule {}
```

__Плагины__

Для регистрации [плагина](https://mongoosejs.com/docs/plugins.html) также используется метод `forFeatureAsync`:

```ts
@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Cat.name,
        useFactory: () => {
          const schema = CatsSchema;
          schema.plugin(require('mongoose-autopopulate'));
          return schema;
        },
      },
    ]),
  ],
})
export class AppModule {}
```

Для регистрации плагина для всех схем используется метод `plugin` объекта `Connection`. Для доступа к этому объекту перед созданием моделей используется метод `connectionFactory`:

```ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/test', {
      connectionFactory: (connection) => {
        connection.plugin(require('mongoose-autopopulate'));
        return connection;
      }
    }),
  ],
})
export class AppModule {}
```

__Асинхронная настройка__

Для асинхронной (динамической) настройки модуля используется метод `forRootAsync`:

```ts
MongooseModule.forRootAsync({
  useFactory: () => ({
    uri: 'mongodb://localhost/nest',
  }),
});
```

Фабричная функция может быть асинхронной и может внедрять зависимости с помощью `inject`:

```ts
MongooseModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    uri: configService.get<string>('MONGODB_URI'),
  }),
  inject: [ConfigService],
});
```

### Postgres

Устанавливаем Prisma в качестве зависимости для разработки:

```bash
npm i -D prisma
```

Инициализируем Prisma:

```bash
npx prisma init
```

Это команда создает директорию `prisma` со следующими файлами:

- `schema.prisma` - определяет подключение к БД и схему БД;
- `.env` - содержит переменную среды окружения `DATABASE_URL`, которая используется для подключения к БД.

Настраиваем подключение к БД в блоке `datasource` файла `schema.prisma`:

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}
```

Редактируем файл `.env`:

```env
DATABASE_URL="file:./dev.db"
```

### Создание таблицы

Для создания таблицы в БД необходимо сделать следующее:

- определить модель в `schema.prisma`;
- создать и выполнить миграцию с помощью [Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate).

Определяем модели:

```prisma
model User {
  id    Int     @default(autoincrement()) @id
  email String  @unique
  name  String?
  posts Post[]
}

model Post {
  id        Int      @default(autoincrement()) @id
  title     String
  content   String?
  published Boolean? @default(false)
  author    User?    @relation(fields: [authorId], references: [id])
  authorId  Int?
}
```

Создаем и выполняем миграцию:

```bash
npx prisma migrate dev --name init
```

### Установка и генерация Prisma Client

Prisma Client - это типобезопасный (type-safe) клиент БД, генерируемый на основе моделей, позволяющий выполнять операции [CRUD](https://www.prisma.io/docs/concepts/components/prisma-client/crud) для моделей.

Устанавливаем Prisma Client:

```bash
npm i @prisma/client
```

В процессе установки автоматически вызывается команда `prisma generate` для генерации клиента в `node_modules/@prisma/client`. В дальнейшем после каждого изменения моделей данная команда должна запускаться вручную для обновления клиента.

### Использование Prisma Client в сервисах Nest

Для абстрагирования инстанцирования `PrismaClient` и подключения к БД имеет смысл создать `PrismaService`. Создаем в директории `src` файл `prisma.service.ts` следующего содержания:

```ts
import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }
}
```

Создаем файл `user.service.ts` следующего содержания:

```ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { User, Prisma } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async user(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: userWhereUniqueInput,
    });
  }

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

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

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

  async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
    return this.prisma.user.delete({
      where,
    });
  }
}
```

Создаем файл `post.service.ts` следующего содержания:

```ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Post, Prisma } from '@prisma/client';

@Injectable()
export class PostService {
  constructor(private prisma: PrismaService) {}

  async post(
    postWhereUniqueInput: Prisma.PostWhereUniqueInput,
  ): Promise<Post | null> {
    return this.prisma.post.findUnique({
      where: postWhereUniqueInput,
    });
  }

  async posts(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.PostWhereUniqueInput;
    where?: Prisma.PostWhereInput;
    orderBy?: Prisma.PostOrderByWithRelationInput;
  }): Promise<Post[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.post.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createPost(data: Prisma.PostCreateInput): Promise<Post> {
    return this.prisma.post.create({
      data,
    });
  }

  async updatePost(params: {
    where: Prisma.PostWhereUniqueInput;
    data: Prisma.PostUpdateInput;
  }): Promise<Post> {
    const { data, where } = params;
    return this.prisma.post.update({
      data,
      where,
    });
  }

  async deletePost(where: Prisma.PostWhereUniqueInput): Promise<Post> {
    return this.prisma.post.delete({
      where,
    });
  }
}
```

Эти сервисы абстрагируют GRUD-запросы, предоставляемые Prisma, и используются для определения роутов приложения.

Редактируем файл `app.controller.ts`:

```ts
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

@Controller()
export class AppController {
  constructor(
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
      where: { published: true },
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
  async createDraft(
    @Body() postData: { title: string; content?: string; authorEmail: string },
  ): Promise<PostModel> {
    const { title, content, authorEmail } = postData;
    return this.postService.createPost({
      title,
      content,
      author: {
        connect: { email: authorEmail },
      },
    });
  }

  @Post('user')
  async signupUser(
    @Body() userData: { name?: string; email: string },
  ): Promise<UserModel> {
    return this.userService.createUser(userData);
  }

  @Put('publish/:id')
  async publishPost(@Param('id') id: string): Promise<PostModel> {
    return this.postService.updatePost({
      where: { id: Number(id) },
      data: { published: true },
    });
  }

  @Delete('post/:id')
  async deletePost(@Param('id') id: string): Promise<PostModel> {
    return this.postService.deletePost({ id: Number(id) });
  }
}
```

Контроллер реализует следующие роуты:

`GET`:

- `/post/:id` - возвращает один пост по `id`;
- `/feed` - возвращает все опубликованные посты;
- `/filter-posts/:searchString` - возвращает посты, отфильтрованные по `title` или `content`.

`POST`:

- `/post` - создает новый пост:
  - тело запроса (body):
    - `title: string` (обязательно) - заголовок поста;
    - `content: string` (опционально) - содержимое поста;
    - `authorEmail: string` (обязательно) - email пользователя, создающего пост;
- `/user` - создает нового пользователя:
  - тело запроса:
    - `email: string` (обязательно) - email пользователя;
    - `name: string` (опционально) - имя пользователя.

`PUT`:

- `/publish/:id` - публикует пост с указанным `id`.

`DELETE`:

- `/post/:id` - удаляет пост с указанным `id`.

## Настройка / Configuration

Пакет `@nestjs/config` позволяет динамически загружать переменные среды окружения.

Устанавливаем его:

```bash
npm i @nestjs/config
```

Импортируем `ConfigModule` в корневой `AppModule`:

```ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot()],
})
export class AppModule {}
```
