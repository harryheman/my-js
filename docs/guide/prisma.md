---
sidebar_position: 5
title: Руководство по Prisma
description: Руководство по Prisma
keywords: ['javascript', 'js', 'typescript', 'ts', 'node.js', 'nodejs', 'node', 'prisma', 'orm', 'guide', 'руководство']
---

# Prisma

> [Prisma](https://www.prisma.io/) - это современное [ORM](https://ru.wikipedia.org/wiki/ORM) (Object Relational Mapping - объектно-реляционное отображение или связывание) для [Node.js](https://nodejs.org/en/) и [TypeScript](https://www.typescriptlang.org/). Проще говоря, `Prisma` - это инструмент, позволяющий работать с реляционными (`PostgreSQL`, `MySQL`, `SQL Server`, `SQLite`) и нереляционной (`MongoDB`) базами данных с помощью `JavaScript` или `TypeScript` без использования [`SQL`](https://ru.wikipedia.org/wiki/SQL) (хотя такая возможность имеется).

## Инициализация проекта

Создаем директорию, переходим в нее и инициализируем `Node.js-проект`:

```bash
mkdir prisma-test
cd prisma-test

yarn init -yp
# or
npm init -y
```

Устанавливаем `Prisma` в качестве зависимости для разработки:

```bash
yarn add -D prisma

# or
npm i -D prisma
```

Инициализируем проект `Prisma`:

```bash
npx prisma init
```

Это приводит к генерации файлов `prisma/schema.prisma` и `.env`.

В файле `.env` содержится переменная `DATABASE_URL`, значением которой является путь к (адрес) БД. Файл `schema.prisma` мы рассмотрим позже.

## CLI

[Интерфейс командной строки](https://ru.wikipedia.org/wiki/%D0%98%D0%BD%D1%82%D0%B5%D1%80%D1%84%D0%B5%D0%B9%D1%81_%D0%BA%D0%BE%D0%BC%D0%B0%D0%BD%D0%B4%D0%BD%D0%BE%D0%B9_%D1%81%D1%82%D1%80%D0%BE%D0%BA%D0%B8) (Command line interface, CLI) `Prisma` предоставляет следующие основные возможности (команды):

- `init` - создает шаблон `Prisma-проекта`:
  - `--datasource-provider` - провайдер для работы с БД: `sqlite`, `postgresql`, `mysql`, `sqlserver` или `mongodb` (перезаписывает `datasource` из `schema.prisma`);
  - `--url` - адрес БД (перезаписывает `DATABASE_URL`)

```bash
npx prisma init --datasource-provider mysql --url mysql://user:password@localhost:3306/mydb
```

- `generate` - генерирует клиента `Prisma` на основе схемы (`schema.prisma`). Клиент `Prisma` предоставляет [программный интерфейс приложения](https://ru.wikipedia.org/wiki/API) (Application Programming Interface, API) для работы с моделями и типы для `TypeScript`

```bash
npx prisma generate
```

- `db`
  - `pull` - генерирует модели на основе существующей схемы БД

```bash
npx prisma db pull
```

  - `push` - синхронизирует состояние схемы `Prisma` с БД без выполнения миграций. БД создается при отсутствии. Используется для прототипировании БД и в локальной разработке. Также может быть полезной в случае ограниченного доступа к БД, например, при использовании БД, предоставляемой облачными провайдерами, такими как [`ElephantSQL`](https://www.elephantsql.com/) или [`Heroku`](https://www.heroku.com/)

```bash
npx prisma db push
```

  - `seed` - выполняет скрипт для наполнения БД начальными (фиктивными) данными. Путь к соответствующему файлу определяется в `package.json`

```json
"prisma": {
  "seed": "node prisma/seed.js"
}
```

```bash
npx prisma seed
```

- `migrate`
  - `dev` - выполняет миграцию для разработки:
    - `--name` - название миграции

```bash
npx prisma migrate dev --name init
```

Это приводит к созданию БД при ее отсутствии, генерации файла `prisma/migrations/migration_name.sql`, выполнению инструкции из этого файла (синхронизации БД со схемой) и генерации (регенерации) клиента (`prisma generate`).

Данная команда должна выполняться после каждого изменения схемы.

  - `reset` - удаляет и заново создает БД или выполняет "мягкий сброс", удаляя все данные, таблицы, индексы и другие артефакты

```bash
npx prisma migrate reset
```

  - `deploy` - выполняет производственную миграцию

```bash
npx prisma migrate deploy
```

- `studio` - позволяет просматривать и управлять данными, хранящимися в БД, в интерактивном режиме:
  - `--browser`, `-b` - название браузера (по умолчанию используется дефолтный браузер);
  - `--port`, `-p` - номер порта (по умолчанию - `5555`)

```bash
npx prisma studio

# без автоматического открытия вкладки браузера
npx prisma studio -b none
```

Подробнее о `CLI` можно почитать [здесь](https://www.prisma.io/docs/reference/api-reference/command-reference).

## Схема

В файле `schema.prisma` мы видим такие строки:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

- `datasource` - источник данных:
  - `provider` - название провайдера для доступа к БД: `sqlite`, `postgresql`, `mysql`, `sqlserver` или `mongodb` (по умолчанию - `postgresql`);
  - `url` - адрес БД (по умолчанию - значение переменной `DATABASE_URL`);
  - `shadowDatabaseUrl` - адрес "теневой" БД (для БД, предоставляемых облачными провайдерами): используется для миграций для разработки (`prisma migrate dev`);
- `generator` - генератор клиента на основе схемы:
  - `provider` - провайдер генератора (единственным доступным на сегодняшний день провайдером является `prisma-client-js`);
  - `binaryTargets` - определяет операционную систему для клиента `Prisma`. Значением по умолчанию является `native`, но иногда это приходится указывать явно, например, при использовании клиента в `Docker-контейнере` (в этом случае также приходится явно выполнять `prisma generate`)

```prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native"]
}

datasource db {
  provider          = "postgresql"
  url               = env("DATABASE_URL")
  shadowDatabaseUrl = env("SHADOW_DATABASE_URL")
}
```

Для работы со схемой удобно пользоваться расширением [`Prisma`](https://marketplace.visualstudio.com/items?itemName=Prisma.prisma) для `VSCode`. Соответствующий раздел в файле `settings.json` должен выглядеть так:

```json
"[prisma]": {
  "editor.defaultFormatter": "Prisma.prisma"
}
```

Определим в схеме модели для пользователя (`User`) и поста (`Post`):

```prisma
model User {
  id         String   @id @default(uuid()) @db.Uuid
  email      String   @unique
  hash       String   @map("password_hash")
  first_name String?
  last_name  String?
  age        Int?
  role       Role     @default(USER)
  posts      Post[]
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt

  @@map("users")
}

model Post {
  id         String   @id @default(uuid())
  title      String
  content    String
  published  Boolean
  author_id  String
  author     User     @relation(fields: [author_id], references: [id])
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt

  @@map("posts")
}

enum Role {
  USER
  ADMIN
}
```

Вот что мы здесь видим:

- `id`, `email`, `hash` etc. - названия полей (колонок таблицы);
- `@map` привязывает поле схемы (`hash`) к указанной колонке таблицы (`password_hash`). `@map` не меняет название колонки в БД и поля в генерируемом клиенте. Для `MongoDB` использование `@map` для `@id` является обязательным: `id String @default(auto()) @map("_id") @db.ObjectId`;
- `String`, `Int`, `DateTime` etc. - типы данных (см. ниже);
- `@db.Uuid` - тип данных, специфичный для одной или нескольких БД (в данном случае `PostgreSQL`);
- модификатор `?` после названия типа означает, что данное поле является опциональным (необязательным, может иметь значение `NULL`);
- модификатор `[]` после названия типа означает, что значением данного поля является список (массив). Такое поле не может быть опциональным;
- префикс `@` означает атрибут поля, а префикс `@@` - атрибут блока (модели, таблицы). Некоторые атрибуты принимают параметры;
- атрибут `@id` означает, что данное поле является первичным (основным) ключом таблицы (`PRIMARY KEY`) (идентификатор модели). Такое поле не может быть опциональным;
- атрибут `@default` присваивает полю указанное значение по умолчанию (при отсутствии значения поля) (`DEFAULT`). Дефолтными могут быть статические значения (`42`, `hi`) или значения, генерируемые функциями `autoincrement`, `dbgenerated`, `cuid`, `uuid` и `now` (функции атрибутов; см. ниже);
- атрибут `@unique` означает, что значение поля должно быть уникальным в пределах таблицы (`UNIQUE`). Таблица должна иметь хотя бы одно поле `@id` или `@unique`;
- атрибут `@relation` указывает на существование отношений между таблицами. В данном случае между таблицами `users` и `posts` существуют отношения один-ко-многим (one-to-many, 1-n) - у одного пользователя может быть несколько постов (`FOREIGN KEY / REFERENCES`) (об отношениях мы поговорим отдельно);
- атрибут `@updatedAt` обновляет поле текущими датой и временем при любой модификации записи;
- у нас имеется перечисление (enum), значения которого используются в качестве значений поля `role` модели `User` (значением по умолчанию является `USER`);
- атрибут `@@map` привязывает название модели к названию таблицы в БД. `@@map` не меняет название таблицы в БД и модели в генерируемом клиенте.

### Типы данных

Допустимыми в названиях полей являются следующие символы: `[A-Za-z][A-Za-z0-9_]*`.

- `String` - строка переменной длины (для `PostgreSQL` - это тип `text`);
- `Boolean` - логическое значение: `true` или `false` (`boolean`);
- `Int` - целое число (`integer`);
- `BigInt` - [`BigInt`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt) (`integer`);
- `Float` - число с плавающей точкой (запятой) (`double precision`);
- `Decimal` (`decimal(65,30)`);
- `DateTime` - дата и время в формате [`ISO 8601`](https://ru.wikipedia.org/wiki/ISO_8601);
- `Json` - объект в формате `JSON` (`jsonb`);
- `Bytes` (`bytea`).

Атрибут `@db` позволяет использовать типы данных, специфичные для одной или нескольких БД.

### Атрибуты

Кроме упомянутых выше, в схеме можно использовать следующие атрибуты:

- `@@id` - определяет составной (composite) первичный ключ таблицы, например, `@@id[title, author]` (в данном случае соответствующее поле будет называться `title_author` - это можно изменить);
- `@@unique` - определяет составное ограничение уникальности (unique constraint) для указанных полей (такие поля не могут быть опциональными), например, `@@unique([title, author])`;
- `@@index` - определяет индекс в БД (`INDEX`), например, `@@index([title, author])`;
- `@ignore`, `@@ignore` - используется для обозначения невалидных полей и моделей, соответственно.

### Функции атрибутов

- `auto` - представляет дефолтные значения, генерируемые БД (только для `MongoDB`);
- `autoincrement` - генерирует последовательные целые числа (`SERIAL` в `PostgreSQL`, не поддерживается `MongoDB`);
- `cuid` - генерирует глобальный уникальный идентификатор на основе спецификации [`cuid`](https://github.com/ericelliott/cuid);
- `uuid` - генерирует глобальный уникальный идентификатор на основе спецификации [`UUID`](https://ru.wikipedia.org/wiki/UUID);
- `now` - возвращает текущую отметку времени (timestamp) (`CURRENT_TIMESTAMP` в `PostgreSQL`);
- `dbgenerated` - представляет дефолтные значения, которые не могут быть выражены в схеме (например, `random()`).

Подробнее о схеме можно почитать [здесь](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference).

### Отношения

Атрибут `@relation` указывает на существование отношений между моделями (таблицами). Он принимает следующие параметры:

- `name?: string` - название отношения;
- `fields?: [field1, field2, ...fieldN]` - список полей текущей модели (в нашем случае это `[author_id]` модели `Post`); _обратите внимание_: само поле определяется отдельно);
- `references: [field1, field2, ...fieldN]` - список полей другой модели (стороны отношений) (в нашем случае это `[id]` модели `User`).

В приведенной выше схеме полями, указывающими на существование отношений между моделями `User` и `Post`, являются поля `posts` и `author`. Эти поля существуют только на уровне `Prisma`, в БД они не создаются. Скалярное поле `author_id` также существует только на уровне `Prisma` - это внешний ключ (`FOREIGN KEY`), соединяющий `Post` с `User`.

Как известно, существует 3 вида отношений:

- один-к-одному (one-to-one, 1-1);
- один-ко-многим (one-to-many, 1-n);
- многие-ко-многим (many-to-many, m-n).

Атрибут `@relation` является обязательным только для отношений `1-1` и `1-n`.

Предположим, что в нашей схеме имеются такие модели:

```prisma
model User {
  id      Int      @id @default(autoincrement())
  posts   Post[]
  profile Profile?
}

model Profile {
  id     Int  @id @default(autoincrement())
  user   User @relation(fields: [userId], references: [id])
  userId Int
}

model Post {
  id         Int        @id @default(autoincrement())
  author     User       @relation(fields: [authorId], references: [id])
  authorId   Int
  categories Category[]
}

model Category {
  id    Int    @id @default(autoincrement())
  posts Post[]
}
```

Вот что мы здесь видим:

- между моделями `User` и `Profile` существуют отношения `1-1` - у одного пользователя может быть только один профиль;
- между моделями `User` и `Post` существуют отношения `1-n` - у одного пользователя может быть несколько постов;
- между моделями `Post` и `Category` существуют отношения `m-n` - один пост может принадлежать к нескольким категориям, в одну категорию может входить несколько постов.

Подробнее об отношениях можно почитать [здесь](https://www.prisma.io/docs/concepts/components/prisma-schema/relations).

## Клиент

Импортируем и создаем экземпляр клиента `Prisma`:

```js
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default prisma
```

Иногда может потребоваться делать так:

```js
const Prisma = require('prisma')

const prisma = new Prisma.PrismaClient()

module.exports = prisma
```

### Запросы

#### findUnique

`findUnique` позволяет извлекать единичные записи по идентификатору или уникальному полю.

__Сигнатура__

```js
findUnique({
  where: condition,
  select?: fields,
  include?: relations,
  rejectOnNotFound?: boolean
})
```

Модификатор `?` означает, что поле является опциональным.

- `condition` - условие для выборки;
- `fields` - поля для выборки;
- `relations` - отношения (связанные поля) для выборки;
- `rejectOnNotFound` - если имеет значение `true`, при отсутствии записи выбрасывается исключение `NotFoundError`. Если имеет значение `false`, при отсутствии записи возвращается `null`.

__Пример__

```js
async function getUserById(id) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id
      }
    })
    return user
  } catch(e) {
    onError(e)
  }
}
```

#### findFirst

`findFirst` возвращает первую запись, соответствующую заданному критерию.

__Сигнатура__

```js
findFirst({
  where?: condition,
  select?: fields,
  include?: relations,
  rejectOnNotFound?: boolean,
  distinct?: field,
  orderBy?: order,
  cursor?: position,
  skip?: number,
  take?: number
})
```

- `distinct` - фильтрация по определенному полю;
- `orderBy` - сортировка по определенному полю и в определенном порядке;
- `cursor` - позиция начала списка (как правило, `id` или другое уникальное значение);
- `skip` - количество пропускаемых записей;
- `take` - количество возвращаемых записей (в данном случае может иметь значение `1` или `-1`: во втором случае возвращается последняя запись.

__Пример__

```js
async function getLastPostByAuthorId(author_id) {
  try {
    const post = await prisma.post.findFirst({
      where: {
        author_id
      },
      orderBy: {
        created_at: 'asc'
      },
      take: -1
    })
    return post
  } catch(e) {
    onError(e)
  }
}
```

#### findMany

`findMany` возвращает все записи, соответствующие заданному критерию.

__Сигнатура__

```js
findMany({
  where?: condition,
  select?: fields,
  include?: relations,
  rejectOnNotFound?: boolean,
  distinct?: field,
  orderBy?: order,
  cursor?: position,
  skip?: number,
  take?: number
})
```

__Пример__

```js
async function getAllPostsByAuthorId(author_id) {
  try {
    const posts = await prisma.post.findMany({
      where: {
        author_id
      },
      orderBy: {
        updated_at: 'desc'
      }
    })
    return posts
  } catch(e) {
    onError(e)
  }
}
```

#### create

`create` создает новую запись.

__Сигнатура__

```js
create({
  data: _data,
  select?: fields,
  include?: relations
})
```

- `_data` - данные создаваемой записи.

__Пример__

```js
async function createUserWithProfile(data) {
  const { email, password, firstName, lastName, age } = data
  try {
    const hash = await argon2.hash(password)
    const user = await prisma.user.create({
      data: {
        email,
        hash,
        profile: {
          create: {
            first_name: firstName,
            last_name: lastName,
            age
          }
        }
      },
      select: {
        email: true
      },
      include: {
        profile: true
      }
    })
    return user
  } catch(e) {
    onError(e)
  }
}
```

#### update

`update` обновляет существующую запись.

__Сигнатура__

```js
update({
  data: _data,
  where: condition,
  select?: fields,
  include?: relations
})
```

__Пример__

```js
async function updateUserById(id, changes) {
  const { email, age } = changes
  try {
    const user = await prisma.user.update({
      where: {
        id
      },
      data: {
        email,
        profile: {
          update: {
            age
          }
        }
      },
      select: {
        email: true
      },
      include: {
        profile: true
      }
    })
    return user
  } catch(e) {
    onError(e)
  }
}
```

#### upsert

`upsert` обновляет существующую или создает новую запись.

__Сигнатура__

```js
upsert({
  create: _data,
  update: _data,
  where: condition,
  select?: fields,
  include?: relations
})
```

__Пример__

```js
async function updateOrCreateUser(data) {
  const { userName, email, password } = data
  try {
    const hash = await argon2.hash(password)
    const user = await prisma.user.create({
      where: { user_name: userName },
      update: {
        email,
        hash
      },
      create: {
        email,
        hash,
        user_name: userName
      },
      select: { user_name: true, email: true }
    })
    return user
  } catch(e) {
    onError(e)
  }
}
```

#### delete

`delete` удаляет существующую запись по идентификатору или уникальному полю.

__Сигнатура__

```js
delete({
  where: condition,
  select?: fields,
  include?: relations
})
```

__Пример__

```js
async function removeUserById(id) {
  try {
    await prisma.user.delete({
      where: {
        id
      }
    })
  } catch(e) {
    onError(e)
  }
}
```

#### createMany

`createMany` создает несколько записей с помощью одной транзакции (о транзакциях мы поговорим отдельно).

__Пример__

```js
createMany({
  data: _data[],
  skipDuplicates?: boolean
})
```

- `_data[]` - данные для создаваемых записей в виде массива;
- `skipDuplicates` - при значении `true` создаются только уникальные записи.

__Пример__

```js
// предположим, что `users` - это массив объектов
async function createUsers(users) {
  try {
    const users = await prisma.user.createMany({
      data: users
    })
    return users
  } catch(e) {
    onError(e)
  }
}
```

#### updateMany

`updateMany` обновляет несколько существующих записей за один раз и возвращает количество (sic) обновленных записей.

__Сигнатура__

```js
updateMany({
  data: _data[],
  where?: condition
})
```

__Пример__

```js
async function updateProductsByCategory(category, newDiscount) {
  try {
    const count = await prisma.product.updateMany({
      where: {
        category
      },
      data: {
        discount: newDiscount
      }
    })
    return count
  } catch(e) {
    onError(e)
  }
}
```

#### deleteMany

`deleteMany` удаляет несколько записей с помощью одной транзакции и возвращает количество удаленных записей.

__Сигнатура__

```js
deleteMany({
  where?: condition
})
```

__Пример__

```js
async function removeAllPostsByUserId(author_id) {
  try {
    const count = await prisma.post.deleteMany({
      where: {
        author_id
      }
    })
    return count
  } catch(e) {
    onError(e)
  }
}
```

#### count

`count` возвращает количество записей, соответствующих заданному критерию.

__Сигнатура__

```js
count({
  where?: condition,
  select?: fields,
  cursor?: position,
  orderBy?: order,
  skip?: number,
  take?: number
})
```

__Пример__

```js
async function countUsersWithPublishedPosts() {
  try {
    const count = await prisma.user.count({
      where: {
        post: {
          some: {
            published: true
          }
        }
      }
    })
    return count
  } catch(e) {
    onError(e)
  }
}
```

#### aggregate

`aggregate` выполняет [агрегирование](https://ru.wikipedia.org/wiki/%D0%90%D0%B3%D1%80%D0%B5%D0%B3%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D0%B5_(%D0%BF%D1%80%D0%BE%D0%B3%D1%80%D0%B0%D0%BC%D0%BC%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D0%B5)) полей.

__Сигнатура__

```js
aggregate({
  where?: condition,
  select?: fields,
  cursor?: position,
  orderBy?: order,
  skip?: number,
  take?: number,

  _count: count,
  _avg: avg,
  _sum: sum,
  _min: min,
  _max: max
})
```

- `_count` - возвращает количество совпадающих записей или не `null-полей`;
- `_avg` - возвращает среднее значение определенного поля;
- `_sum` - возвращает сумму значений определенного поля;
- `_min` - возвращает наименьшее значение определенного поля;
- `_max` - возвращает наибольшее значение определенного поля.

__Пример__

```js
async function getAllUsersCountAndMinMaxProfileViews() {
  try {
    const result = await prisma.user.aggregate({
      _count: {
        _all: true
      },
      _max: {
        profileViews: true
      },
      _min: {
        profileViews: true
      }
    })
    return result
  } catch(e) {
    onError(e)
  }
}
```

#### groupBy

`groupBy` выполняет группировку полей.

__Сигнатура__

```js
groupBy({
  by?: by,
  having?: having,

  where?: condition,
  orderBy?: order,
  skip?: number,
  take?: number,

  _count: count,
  _avg: avg,
  _sum: sum,
  _min: min,
  _max: max
})
```

- `by` - определяет поле или комбинацию полей для группировки записей;
- `having` - позволяет фильтровать группы по агрегируемому значению.

__Пример__

В следующем примере мы выполняем группировку по `country / city`, где среднее значение `profileViews` превышает `100`, и возвращаем общее количество (`_sum`) `profileViews` для каждой группы. Запрос также возвращает количество всех (`_all`) записей в каждой группе и все записи с не `null` значениями поля `city` в каждой группе:

```js
async function getUsers() {
  try {
    const result = await prisma.user.groupBy({
      by: ['country', 'city'],
      _count: {
        _all: true,
        city: true
      },
      _sum: {
        profileViews: true
      },
      orderBy: {
        country: 'desc'
      },
      having: {
        profileViews: {
          _avg: {
            gt: 100
          }
        }
      }
    })
    return result
  } catch(e) {
    onError(e)
  }
}
```

### Настройки

#### select

`select` определяет, какие поля включаются в возвращаемый объект.

```js
const user = await prisma.user.findUnique({
  where: { email },
  select: {
    id: true,
    email: true,
    first_name: true,
    last_name: true,
    age: true
  }
})

// or
const usersWithPosts = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    posts: {
      select: {
        id: true,
        title: true,
        content: true,
        author_id: true,
        created_at: true
      }
    }
  }
})

// or
const usersWithPostsAndComments = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    posts: {
      include: {
        comments: true
      }
    }
  }
})
```

#### include

`include` определяет, какие отношения (связанные записи) включаются в возвращаемый объект.

```js
const userWithPostsAndComments = await prisma.user.findUnique({
  where: { email },
  include: {
    posts: true,
    comments: true
  }
})
```

#### where

`where` определяет один или более фильтр (о фильтрах мы поговорим отдельно), применяемый к свойствам записи или связанных записей:

```js
const admins = await prisma.user.findMany({
  where: {
    email: {
      contains: 'admin'
    }
  }
})
```

#### orderBy

`orderBy` определяет поля и порядок сортировки. Возможными значениями `orderBy` являются `asc` и `desc`.

```js
const usersByPostCount = await prisma.user.findMany({
  orderBy: {
    posts: {
      count: 'desc'
    }
  }
})
```

#### distinct

`distinct` определяет поля, которые должны быть уникальными в возвращаемом объекте.

```js
const distinctCities = await prisma.user.findMany({
  select: {
    city: true,
    country: true
  },
  distinct: ['city']
})
```

### Вложенные запросы

- `create: { data } | [{ data1 }, { data2 }, ...{ dataN }]` - добавляет новую связанную запись или набор записей в родительскую запись. `create` доступен при создании (`create`) новой родительской записи или обновлении (`update`) существующей родительской записи

```js
const user = await prisma.user.create({
  data: {
    email,
    profile: {
      // вложенный запрос
      create: {
        first_name,
        last_name
      }
    }
  }
})
```

- `createMany: [{ data1 }, { data2 }, ...{ dataN }]` - добавляет набор новых связанных записей в родительскую запись. `createMany` доступен при создании (`create`) новой родительской записи или обновлении (`update`) существующей родительской записи

```js
const userWithPosts = await prisma.user.create({
  data: {
    email,
    posts: {
      // !
      createMany: {
        data: posts
      }
    }
  }
})
```

- `update: { data } | [{ data1 }, { data2 }, ...{ dataN }]` - обновляет одну или более связанных записей

```js
const user = await prisma.user.update({
  where: { email },
  data: {
    profile: {
      // !
      update: { age }
    }
  }
})
```

- `updateMany: { data } | [{ data1 }, { data2 }, ...{ dataN }]` - обновляет массив связанных записей. Поддерживается фильтрация

```js
const result = await prisma.user.update({
  where: { id },
  data: {
    posts: {
      // !
      updateMany: {
        where: {
          published: false
        },
        data: {
          like_count: 0
        }
      }
    }
  }
})
```

- `upsert: { data } | [{ data1 }, { data2 }, ...{ dataN }]` - обновляет существующую связанную запись или создает новую

```js
const user = await prisma.user.update({
  where: { email },
  data: {
    profile: {
      // !
      upsert: {
        create: { age },
        update: { age }
      }
    }
  }
})
```

- `delete: boolean | { data } | [{ data1 }, { data2 }, ...{ dataN }]` - удаляет связанную запись. Родительская запись при этом не удаляется

```js
const user = await prisma.user.update({
  where: { email },
  data: {
    profile: {
      delete: true
    }
  }
})
```

- `deleteMany: { data } | [{ data1 }, { data2 }, ...{ dataN }]` - удаляет связанные записи. Поддерживается фильтрация

```js
const user = await prisma.user.update({
  where: { id },
  data: {
    age,
    posts: {
      // !
      deleteMany: {}
    }
  }
})
```

- `set: { data } | [{ data1 }, { data2 }, ...{ dataN }]` - перезаписывает значение связанной записи

```js
const userWithPosts = await prisma.user.update({
  where: { email },
  data: {
    posts: {
      // !
      set: newPosts
    }
  }
})
```

- `connect` - подключает запись к существующей связанной записи по идентификатору или уникальному полю

```js
const user = await prisma.post.create({
  data: {
    title,
    content,
    author: {
      connect: { email }
    }
  }
})
```

- `connectOrCreate` - подключает запись к существующей связанной записи по идентификатору или уникальному полю либо создает связанную запись при отсутствии таковой;
- `disconnect` - отключает родительскую запись от связанной без удаления последней. `disconnect` доступен только если отношение является опциональным.

### Фильтры и операторы

#### Фильтры

- `equals` - значение равняется `n`

```js
const usersWithNameHarry = await prisma.user.findMany({
  where: {
    name: {
      equals: 'Harry'
    }
  }
})

// `equals` может быть опущено
const usersWithNameHarry = await prisma.user.findMany({
  where: {
    name: 'Harry'
  }
})
```

- `not` - значение не равняется `n`;
- `in` - значение `n` содержится в списке (массиве)

```js
const usersWithNameAliceOrBob = await prisma.user.findMany({
  where: {
    user_name: {
      // !
      in: ['Alice', 'Bob']
    }
  }
})
```

- `notIn` - `n` не содержится в списке;
- `lt` - `n` меньше `x`

```js
const notPopularPosts = await prisma.post.findMany({
  where: {
    likeCount: {
      lt: 100
    }
  }
})
```

- `lte` - `n` меньше или равно `x`;
- `gt` - `n` больше `x`;
- `gte` - `n` больше или равно `x`;
- `contains` - `n` содержит `x`

```js
const admins = await prisma.user.findMany({
  where: {
    email: {
      contains: 'admin'
    }
  }
})
```

- `startsWith` - `n` начинается с `x`

```js
const usersWithNameStartsWithA = await prisma.user.findMany({
  where: {
    user_name: {
      startsWith: 'A'
    }
  }
})
```

- `endsWith` - `n` заканчивается `x`.

#### Операторы

- `AND` - все условия должны возвращать `true`

```js
const notPublishedPostsAboutTypeScript = await prisma.post.findMany({
  where: {
    AND: [
      {
        title: {
          contains: 'TypeScript'
        }
      },
      {
        published: false
      }
    ]
  }
})
```

_Обратите внимание_: оператор указывается до названия поля (снаружи поля), а фильтр после (внутри).

- `OR` - хотя бы одно условие должно возвращать `true`;
- `NOT` - все условия должны возвращать `false`.

### Фильтры для связанных записей

- `some` - возвращает все связанные записи, соответствующие одному или более критерию фильтрации

```js
const usersWithPostsAboutTypeScript = await prisma.user.findMany({
  where: {
    posts: {
      some: {
        title: {
          contains: 'TypeScript'
        }
      }
    }
  }
})
```

- `every` - возвращает все связанные записи, соответствующие всем критериям;
- `none` - возвращает все связанные записи, не соответствующие ни одному критерию;
- `is` - возвращает все связанные записи, соответствующие критерию;
- `notIs` - возвращает все связанные записи, не соответствующие критерию.

### Методы клиента

- `$disconnect` - закрывает соединение с БД, которое было установлено после вызова метода `$connect` (данный метод чаще всего не требуется вызывать явно), и останавливает движок запросов (query engine) `Prisma`

```js
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedDb() {
  try {
    await prisma.model.create(data)
  } catch (e) {
    onError(e)
  } finally {
    // !
    await prisma.$disconnect()
  }
}
```

- `$use` - добавляет посредника (middleware)

```js
prisma.$use(async (params, next) => {
  console.log('Это посредник')

  // работаем с `params`

  return next(params)
})
```

  - `next` - представляет "следующий уровень" в стеке посредников. Таким уровнем может быть следующий посредник или движок запросов `Prisma`;
  - `params` - объект со следующими свойствами:
    - `action` - тип запроса, например, `create` или `findMany`;
    - `args` - аргументы, переданные в запрос, например, `where` или `data`;
    - `model` - модель, например, `User` или `Post`;
    - `runInTransaction` - возвращает `true`, если запрос был запущен в контексте транзакции;

- методы `$queryRaw`, `$executeRaw` и `$runCommandRaw` предназначены для работы с `SQL`. Почитать о них можно [здесь](https://www.prisma.io/docs/concepts/components/prisma-client/raw-database-access);
- `$transaction` - выполняет запросы в контексте транзакции (см. ниже).

Подробнее о клиенте можно почитать [здесь](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference).

### Транзакции

Транзакция - это последовательность операций чтения/записи, которые обрабатываются как единое целое, т.е. либо все операции завершаются успешно, либо все операции отклоняются с ошибкой.

`Prisma` позволяет использовать транзакции тремя способами:

- вложенные запросы (см. выше): операции с родительскими и связанными записями выполняются в контексте одной транзакции

```js
const newUserWithProfile = await prisma.user.create({
  data: {
    email,
    profile: {
      // !
      create: {
        first_name,
        last_name
      }
    }
  }
})
```

- пакетированные/массовые (batch/bulk) транзакции: выполнение нескольких операций за один раз с помощью таких запросов, как `createMany`, `updateMany` и `deleteMany`

```js
const removedUser = await prisma.user.delete({
  where: {
    email
  }
})

// !
await prisma.post.deleteMany({
  where: {
    author_id: removedUser.id
  }
})
```

- вызов метода `$transaction`.

#### $transaction

Интерфейс `$transaction` может быть использован в двух формах:

- `$transaction([ query1, query2, ...queryN ])` - принимает массив последовательно выполняемых запросов;
- `$transaction(fn)` - принимает функцию, которая может включать запросы и другой код.

Пример транзакции, возвращающей посты, в заголовке которых встречается слово `TypeScript` и общее количество постов:

```js
const [postsAboutTypeScript, totalPostCount] = await prisma.$transaction([
  prisma.post.findMany({ where: { title: { contains: 'TypeScript' } } }),
  prisma.post.count()
])
```

В `$transaction` допускается использование `SQL`:

```js
const [userNames, updatedUser] = await prisma.$transaction([
  prisma.$queryRaw`SELECT 'user_name' FROM users`,
  prisma.$executeRaw`UPDATE users SET user_name = 'Harry' WHERE id = 42`
])
```

#### Интерактивные транзакции

Интерактивные транзакции предоставляют разработчикам больший контроль над выполняемыми в контексте транзакции операциями. В данный момент они имеют статус экспериментальной возможности, которую можно включить следующим образом:

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["interactiveTransactions"]
}
```

Рассмотрим пример совершения платежа.

Предположим, что у `Alice` и `Bob` имеется по `100$` на счетах (account), и `Alice` хочет отправить `Bob` свои `100$`.

```js
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function transfer(from, to, amount) {
  try {
    await prisma.$transaction(async (prisma) => {
      // 1. Уменьшаем баланс отправителя
      const sender = await prisma.account.update({
        data: {
          balance: {
            decrement: amount
          }
        },
        where: {
          email: from
        }
      })

      // 2. Проверяем, что баланс отправителя после уменьшения >= 0
      if (sender.balance < 0) {
        throw new Error(`${from} имеет недостаточно средств для отправки ${amount}`)
      }

      // 3. Увеличиваем баланс получателя
      const recipient = await prisma.account.update({
        data: {
          balance: {
            increment: amount
          }
        },
        where: {
          email: to
        }
      })

      return recipient
    })
  } catch(e) {
    // обрабатываем ошибку
  }
}

async function main() {
  // эта транзакция разрешится
  await transfer('alice@mail.com', 'bob@mail.com', 100)
  // а эта провалится
  await transfer('alice@mail.com', 'bob@mail.com', 100)
}

main().finally(() => {
  prisma.$disconnect()
})
```

Подробнее о транзакциях можно почитать [здесь](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
