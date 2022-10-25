---
sidebar_position: 6
title: Руководство по Sequelize
description: Руководство по Sequelize
keywords: ['javascript', 'js', 'node.js', 'nodejs', 'node', 'sequelize', 'orm', 'sql', 'guide', 'руководство']
tags: ['javascript', 'js', 'node.js', 'nodejs', 'node', 'sequelize', 'orm', 'sql', 'guide', 'руководство']
---

# Sequelize

> [Sequelize](https://sequelize.org/master/) - это [ORM](https://ru.wikipedia.org/wiki/ORM) для работы с такими реляционными базами данных как `Postgres`, `MySQL`, `MariaDB`, `SQLite` и `MSSQL`. На сегодняшний день это самое популярное решений для [Node.js](https://nodejs.org/en/).

## Начало работы

**Установка**

```bash
yarn add sequelize
# или
npm i sequelize
```

**Подключение к БД**

```js
const { Sequelize } = require('sequelize')

// Вариант 1: передача `URI` для подключения
const sequelize = new Sequelize('sqlite::memory:') // для `sqlite`
const sequelize = new Sequelize('postgres://user:pass@example.com:5432/dbname') // для `postgres`

// Вариант 2: передача параметров по отдельности
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'path/to/database.sqlite'
})

// Вариант 2: передача параметров по отдельности (для других диалектов)
const sequelize = new Sequelize('database', 'username', 'password', {
  host: 'localhost',
  dialect: /* 'mysql' | 'mariadb' | 'postgres' | 'mssql' */
})
```

**Проверка подключения**

```js
try {
  await sequelize.authenticate()
  console.log('Соединение с БД было успешно установлено')
} catch (e) {
  console.log('Невозможно выполнить подключение к БД: ', e)
}
```

По умолчанию после того, как установки соединения, оно остается открытым. Для его закрытия следует вызвать метод `sequelize.close()`.

### Модели

Модель - это абстракция, представляющая таблицу в БД.

Модель сообщает `Sequelize` несколько вещей о сущности (entity), которую она представляет: название таблицы, то, какие колонки она содержит (и их типы данных) и др.

У каждой модели есть название. Это название не обязательно должно совпадать с названием соответствующей таблицы. Обычно, модели именуются в единственном числе (например, `User`), а таблицы - во множественном (например, `Users`). `Sequelize` выполняет плюрализацию (перевод значения из единственного числа во множественное) автоматически.

Модели могут определяться двумя способами:

- путем вызова `sequelize.define(modelName, attributes, options)`
- путем расширения класса `Model` и вызова `init(attributes, options)`

После определения, модель доступна через `sequelize.model` + название модели.

В качестве примера создадим модель `User` с полями `firstName` и `lastName`.

**`sequelize.define`**

```js
const { Sequelize, DataTypes } = require('sequelize')
const sequelize = new Sequelize('sqlite::memory:')

const User = sequelize.define(
  'User',
  {
    // Здесь определяются атрибуты модели
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      // allowNull по умолчанию имеет значение true
    },
  },
  {
    // Здесь определяются другие настройки модели
  }
)

// `sequelize.define` возвращает модель
console.log(User === sequelize.models.User) // true
```

**Расширение `Model`**

```js
const { Sequelize, DataTypes, Model } = require('sequelize')
const sequelize = new Sequelize('sqlite::memory:')

class User extends Model {}

User.init(
  {
    // Здесь определяются атрибуты модели
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
    },
  },
  {
    // Здесь определяются другие настройки модели
    sequelize, // Экземпляр подключения (обязательно)
    modelName: 'User', // Название модели (обязательно)
  }
)

console.log(User === sequelize.models.User) // true
```

`sequelize.define` под капотом использует `Model.init`.

В дальнейшем я буду использовать только _первый вариант_.

Автоматическую плюрализацию названия таблицы можно отключить с помощью настройки `freezeTableName`:

```js
sequelize.define(
  'User',
  {
    // ...
  },
  {
    freezeTableName: true,
  }
)
```

или глобально:

```js
const sequelize = new Sequelize('sqlite::memory:', {
  define: {
    freeTableName: true,
  },
})
```

В этом случае таблица будет называться `User`.

Название таблицы может определяться в явном виде:

```js
sequelize.define(
  'User',
  {
    // ...
  },
  {
    tableName: 'Employees',
  }
)
```

В этом случае таблица будет называться `Employees`.

Синхронизация модели с таблицей:

- `User.sync()` - создает таблицу при отсутствии (существующая таблица остается неизменной)
- `User.sync({ force: true })` - удаляет существующую таблицу и создает новую
- `User.sync({ alter: true })` - приводит таблицу в соответствие с моделью

Пример:

```js
// Возвращается промис
await User.sync({ force: true })
console.log('Таблица для модели `User` только что была создана заново!')
```

Синхронизация всех моделей:

```js
await sequelize.sync({ force: true })
console.log('Все модели были успешно синхронизированы.')
```

Удаление таблицы:

```js
await User.drop()
console.log('Таблица `User` была удалена.')
```

Удаление всех таблиц:

```js
await sequelize.drop()
console.log('Все таблицы были удалены.')
```

`Sequelize` принимает настройку `match` с регулярным выражением, позволяющую определять группу синхронизируемых таблиц:

```js
// Выполняем синхронизацию только тех моделей, названия которых заканчиваются на `_test`
await sequelize.sync({ force: true, match: /_test$/ })
```

_Обратите внимание_: вместо синхронизации в продакшне следует использовать миграции.

По умолчанию `Sequelize` автоматически добавляет в создаваемую модель поля `createAt` и `updatedAt` с типом `DataTypes.DATE`. Это можно изменить:

```js
sequelize.define(
  'User',
  {
    // ...
  },
  {
    timestamps: false,
  }
)
```

Названные поля можно отключать по отдельности и переименовывать:

```js
sequelize.define(
  'User',
  {
    // ...
  },
  {
    timestamps: true,
    // Отключаем `createdAt`
    createdAt: false,
    // Изменяем название `updatedAt`
    updatedAt: 'updateTimestamp',
  }
)
```

Если для колонки определяется только тип данных, синтаксис определения атрибута может быть сокращен следующим образом:

```js
// до
sequelize.define('User', {
  name: {
    type: DataTypes.STRING,
  },
})

// после
sequelize.define('User', {
  name: DataTypes.STRING,
})
```

По умолчанию значением колонки является `NULL`. Это можно изменить с помощью настройки `defaultValue` (определив "дефолтное" значение):

```js
sequelize.define('User', {
  name: {
    type: DataTypes.STRING,
    defaultValue: 'John Smith',
  },
})
```

В качестве дефолтных могут использоваться специальные значения:

```js
sequelize.define('Foo', {
  bar: {
    type: DataTypes.DATE,
    // Текущие дата и время, определяемые в момент создания
    defaultValue: Sequelize.NOW,
  },
})
```

**Типы данных**

Каждая колонка должна иметь определенный тип данных.

```js
// Импорт встроенных типов данных
const { DataTypes } = require('sequelize')

// Строки
DataTypes.STRING // VARCHAR(255)
DataTypes.STRING(1234) // VARCHAR(1234)
DataTypes.STRING.BINARY // VARCHAR BINARY
DataTypes.TEXT // TEXT
DataTypes.TEXT('tiny') // TINYTEXT
DataTypes.CITEXT // CITEXT - только для `PostgreSQL` и `SQLite`

// Логические значения
DataTypes.BOOLEAN // BOOLEAN

// Числа
DataTypes.INTEGER // INTEGER
DataTypes.BIGINT // BIGINT
DataTypes.BIGINT(11) // BIGINT(11)

DataTypes.FLOAT // FLOAT
DataTypes.FLOAT(11) // FLOAT(11)
DataTypes.FLOAT(11, 10) // FLOAT(11, 10)

DataTypes.REAL // REAL - только для `PostgreSQL`
DataTypes.REAL(11) // REAL(11) - только для `PostgreSQL`
DataTypes.REAL(11, 12) // REAL(11,12) - только для `PostgreSQL`

DataTypes.DOUBLE // DOUBLE
DataTypes.DOUBLE(11) // DOUBLE(11)
DataTypes.DOUBLE(11, 10) // DOUBLE(11, 10)

DataTypes.DECIMAL // DECIMAL
DataTypes.DECIMAL(10, 2) // DECIMAL(10, 2)

// только для `MySQL`/`MariaDB`
DataTypes.INTEGER.UNSIGNED
DataTypes.INTEGER.ZEROFILL
DataTypes.INTEGER.UNSIGNED.ZEROFILL

// Даты
DataTypes.DATE // DATETIME для `mysql`/`sqlite`, TIMESTAMP с временной зоной для `postgres`
DataTypes.DATE(6) // DATETIME(6) для `mysql` 5.6.4+
DataTypes.DATEONLY // DATE без времени

// UUID
DataTypes.UUID
```

`UUID` может генерироваться автоматически:

```js
{
  type: DataTypes.UUID,
  defaultValue: Sequelize.UUIDV4
}
```

Другие типы данных:

```js
// Диапазоны (только для `postgres`)
DataTypes.RANGE(DataTypes.INTEGER) // int4range
DataTypes.RANGE(DataTypes.BIGINT) // int8range
DataTypes.RANGE(DataTypes.DATE) // tstzrange
DataTypes.RANGE(DataTypes.DATEONLY) // daterange
DataTypes.RANGE(DataTypes.DECIMAL) // numrange

// Буферы
DataTypes.BLOB // BLOB
DataTypes.BLOB('tiny') // TINYBLOB
DataTypes.BLOB('medium') // MEDIUMBLOB
DataTypes.BLOB('long') // LONGBLOB

// Перечисления - могут определяться по-другому (см. ниже)
DataTypes.ENUM('foo', 'bar')

// JSON (только для `sqlite`/`mysql`/`mariadb`/`postres`)
DataTypes.JSON

// JSONB (только для `postgres`)
DataTypes.JSONB

// другие
DataTypes.ARRAY(/* DataTypes.SOMETHING */) // массив DataTypes.SOMETHING. Только для `PostgreSQL`

DataTypes.CIDR // CIDR - только для `PostgreSQL`
DataTypes.INET // INET - только для `PostgreSQL`
DataTypes.MACADDR // MACADDR - только для `PostgreSQL`

DataTypes.GEOMETRY // Пространственная колонка. Только для `PostgreSQL` (с `PostGIS`) или `MySQL`
DataTypes.GEOMETRY('POINT') // Пространственная колонка с геометрическим типом. Только для `PostgreSQL` (с `PostGIS`) или `MySQL`
DataTypes.GEOMETRY('POINT', 4326) // Пространственная колонка с геометрическим типом и `SRID`. Только для `PostgreSQL` (с `PostGIS`) или `MySQL`
```

**Настройки колонки**

```js
const { DataTypes, Defferable } = require('sequelize')

sequelize.define('Foo', {
  // Поле `flag` логического типа по умолчанию будет иметь значение `true`
  flag: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },

  // Дефолтным значением поля `myDate` будет текущие дата и время
  myDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },

  // Настройка `allowNull` со значением `false` запрещает запись в колонку нулевых значений (NULL)
  title: { type: DataTypes.STRING, allowNull: false },

  // Создание двух объектов с одинаковым набором значений, обычно, приводит к возникновению ошибки.
  // Значением настройки `unique` может быть строка или булевое значение. В данном случае формируется составной уникальный ключ
  uniqueOne: { type: DataTypes.STRING, unique: 'compositeIndex' },
  uniqueTwo: { type: DataTypes.INTEGER, unique: 'compositeIndex' },

  // `unique` используется для обозначения полей, которые должны содержать только уникальные значения
  someUnique: { type: DataTypes.STRING, unique: true },

  // Первичные или основные ключи будут подробно рассмотрены далее
  identifier: { type: DataTypes.STRING, primaryKey: true },

  // Настройка `autoIncrement` может использоваться для создания колонки с автоматически увеличивающимися целыми числами
  incrementMe: { type: DataTypes.INTEGER, autoIncrement: true },

  // Настройка `field` позволяет кастомизировать название колонки
  fieldWithUnderscores: { type: DataTypes.STRING, field: 'field_with_underscores' },

  // Внешние ключи также будут подробно рассмотрены далее
  bar_id: {
    type: DataTypes.INTEGER,

    references: {
      // ссылка на другую модель
      model: Bar,

      // название колонки модели-ссылки с первичным ключом
      key: 'id',

      // в случае с `postres`, можно определять задержку получения внешних ключей
      deferrable: Deferrable.INITIALLY_IMMEDIATE
      /*
        `Deferrable.INITIALLY_IMMEDIATE` - проверка внешних ключей выполняется незамедлительно
        `Deferrable.INITIALLY_DEFERRED` - проверка внешних ключей откладывается до конца транзакции
        `Deferrable.NOT` - без задержки: это не позволит динамически изменять правила в транзакции
      */

      // Комментарии можно добавлять только в `mysql`/`mariadb`/`postres` и `mssql`
      commentMe: {
        type: DataTypes.STRING,
        comment: 'Комментарий'
      }
    }
  }
}, {
  // Аналог атрибута `someUnique`
  indexes: [{
    unique: true,
    fields: ['someUnique']
  }]
})
```

### Экземпляры

Наш начальный код будет выглядеть следующим образом:

```js
const { Sequelize, DataTypes } = require('sequelize')
const sequelize = new Sequelize('sqlite::memory:')

// Создаем модель для пользователя со следующими атрибутами
const User = sequelize.define('User', {
  // имя
  name: DataTypes.STRING,
  // любимый цвет - по умолчанию зеленый
  favouriteColor: {
    type: DataTypes.STRING,
    defaultValue: 'green',
  },
  // возраст
  age: DataTypes.INTEGER,
  // деньги
  cash: DataTypes.INTEGER,
})

;(async () => {
  // Пересоздаем таблицу в БД
  await sequelize.sync({ force: true })
  // дальнейший код
})()
```

Создание экземпляра:

```js
// Создаем объект
const jane = User.build({ name: 'Jane' })
// и сохраняем его в БД
await jane.save()

// Сокращенный вариант
const jane = await User.create({ name: 'Jane' })
console.log(jane.toJSON())
console.log(JSON.stringify(jane, null, 2))
```

Обновление экземпляра:

```js
const john = await User.create({ name: 'John' })
// Вносим изменение
john.name = 'Bob'
// и обновляем соответствующую запись в БД
await john.save()
```

Удаление экземпляра:

```js
await john.destroy()
```

"Перезагрузка" экземпляра:

```js
const john = await User.create({ name: 'John' })
john.name = 'Bob'

// Перезагрузка экземпляра приводит к сбросу всех полей к дефолтным значениям
await john.reload()
console.log(john.name) // John
```

Сохранение отдельных полей:

```js
const john = await User.create({ name: 'John' })
john.name = 'Bob'
john.favouriteColor = 'blue'
// Сохраняем только изменение имени
await john.save({ fields: ['name'] })

await john.reload()
console.log(john.name) // Bob
// Изменение цвета не было зафиксировано
console.log(john.favouriteColor) // green
```

Автоматическое увеличение значения поля:

```js
const john = await User.create({ name: 'John', age: 98 })

const incrementResult = await john.increment('age', { by: 2 })
// При увеличении значение на 1, настройку `by` можно опустить - increment('age')

// Обновленный пользователь будет возвращен только в `postres`, в других БД он будет иметь значение `undefined`
```

Автоматическое увеличения значений нескольких полей:

```js
const john = await User.create({ name: 'John', age: 98, cash: 1000 })

await john.increment({
  age: 2,
  cash: 500,
})
```

Также имеется возможность автоматического уменьшения значений полей (`decrement()`).

## Основы выполнения запросов

Создание экземпляра:

```js
const john = await User.create({
  firstName: 'John',
  lastName: 'Smith',
})
```

Создание экземпляра с определенными полями:

```js
const user = await User.create(
  {
    username: 'John',
    isAdmin: true,
  },
  {
    fields: ['username'],
  }
)

console.log(user.username) // John
console.log(user.isAdmin) // false
```

Получение экземпляра:

```js
// Получение одного (первого) пользователя
const firstUser = await User.find()

// Получение всех пользователей
const allUsers = await User.findAll() // SELECT * FROM ...;
```

Выборка полей:

```js
// Получение полей `foo` и `bar`
Model.findAll({
  attributes: ['foo', 'bar'],
}) // SELECT foo, bar FROM ...;

// Изменение имени поля `bar` на `baz`
Model.findAll({
  attributes: ['foo', ['bar', 'baz'], 'qux'],
}) // SELECT foo, bar AS baz, qux FROM ...;

// Выполнение агрегации
// Синоним `n_hats` является обязательным
Model.findAll({
  attributes: [
    'foo',
    [sequelize.fn('COUNT', sequelize.col('hats')), 'n_hats'],
    'bar',
  ],
}) // SELECT foo, COUNT(hats) AS n_hats, bar FROM ...;
// instance.n_hats

// Сокращение - чтобы не перечислять все атрибуты при агрегации
Model.findAll({
  attributes: {
    include: [[sequelize.fn('COUNT', sequelize.col('hats')), 'n_hast']],
  },
})

// Исключение поля из выборки
Model.findAll({
  attributes: {
    exclude: ['baz'],
  },
})
```

Настройка `where` позволяет выполнять фильтрацию возвращаемых данных. Существует большое количество операторов, которые могут использоваться совместно с `where` через `Op` (см. ниже).

```js
// Выполняем поиск поста по идентификатору его автора
// предполагается `Op.eq`
Post.findAll({
  where: {
    authorId: 2,
  },
}) // SELECT * FROM post WHERE authorId = 2;

// Полный вариант
const { Op } = require('sequelize')
Post.findAll({
  where: {
    authorId: {
      [Op.eq]: 2,
    },
  },
})

// Фильтрация по нескольким полям
// предполагается `Op.and`
Post.findAll({
  where: {
    authorId: 2,
    status: 'active',
  },
}) // SELECT * FROM post WHERE authorId = 2 AND status = 'active';

// Полный вариант
Post.findAll({
  where: {
    [Op.and]: [{ authorId: 2 }, { status: 'active' }],
  },
})

// ИЛИ
Post.findAll({
  where: {
    [Op.or]: [{ authorId: 2 }, { authorId: 3 }],
  },
}) // SELECT * FROM post WHERE authorId = 12 OR authorId = 13;

// Одинаковые названия полей можно опускать
Post.destroy({
  where: {
    authorId: {
      [Op.or]: [2, 3],
    },
  },
}) // DELETE FROM post WHERE authorId = 2 OR authorId = 3;
```

**Операторы**

```js
const { Op } = require('sequelize')

Post.findAll({
  where: {
    [Op.and]: [{ a: 1, b: 2 }],   // (a = 1) AND (b = 2)
    [Op.or]: [{ a: 1, b: 2 }],    // (a = 1) OR (b = 2)
    someAttr: {
      // Основные
      [Op.eq]: 3,       // = 3
      [Op.ne]: 4,       // != 4
      [Op.is]: null,    // IS NULL
      [Op.not]: true,   // IS NOT TRUE
      [Op.or]: [5, 6],  // (someAttr = 5) OR (someAttr = 6)

      // Использование диалекта определенной БД (`postgres`, в данном случае)
      [Op.col]: 'user.org_id',    // = 'user'.'org_id'

      // Сравнение чисел
      [Op.gt]: 6,               // > 6
      [Op.gte]: 6,              // >= 6
      [Op.lt]: 7,               // < 7
      [Op.lte]: 7,              // <= 7
      [Op.between]: [8, 10],    // BETWEEN 8 AND 10
      [Op.notBetween]: [8, 10], // NOT BETWEEN 8 AND 10

      // Другие
      [Op.all]: sequelize.literal('SELECT 1'), // > ALL (SELECT 1)

      [Op.in]: [10, 12],    // IN [1, 2]
      [Op.notIn]: [10, 12]  // NOT IN [1, 2]

      [Op.like]: '%foo',      // LIKE '%foo'
      [Op.notLike]: '%foo',   // NOT LIKE '%foo'
      [Op.startsWith]: 'foo', // LIKE 'foo%'
      [Op.endsWith]: 'foo',   // LIKE '%foo'
      [Op.substring]: 'foo',  // LIKE '%foo%'
      [Op.iLike]: '%foo',     // ILIKE '%foo' (учет регистра, только для `postgres`)
      [Op.notILike]: '%foo',        // NOT ILIKE '%foo'
      [Op.regexp]: '^[b|a|r]',      // REGEXP/~ '^[b|a|r]' (только для `mysql`/`postgres`)
      [Op.notRegexp]: '^[b|a|r]',   // NOT REGEXP/!~ '^[b|a|r]' (только для `mysql`/`postgres`),
      [Op.iRegexp]: '^[b|a|r]',     // ~* '^[b|a|r]' (только для `postgres`)
      [Op.notIRegexp]: '^[b|a|r]',  // !~* '^[b|a|r]' (только для `postgres`)

      [Op.any]: [2, 3], // ANY ARRAY[2, 3]::INTEGER (только для `postgres`)

      [Op.like]: { [Op.any]: ['foo', 'bar'] } // LIKE ANY ARRAY['foo', 'bar'] (только для `postgres`)

      // и т.д.
    }
  }
})
```

Передача массива в `where` приводит к неявному применению оператора `IN`:

```js
Post.findAll({
  where: {
    id: [1, 2, 3], // id: { [Op.in]: [1, 2, 3] }
  },
}) // ... WHERE 'post'.'id' IN (1, 2, 3)
```

Операторы `Op.and`, `Op.or` и `Op.not` могут использоваться для создания сложных операций, связанных с логическими сравнениями:

```js
const { Op } = require('sequelize')

Foo.findAll({
  where: {
    rank: {
      [Op.or]: {
        [Op.lt]: 1000,
        [Op.eq]: null
      }
    }, // rank < 1000 OR rank IS NULL
    {
      createdAt: {
        [Op.lt]: new Date(),
        [Op.gt]: new Date(new Date() - 24 * 60 * 60 * 1000)
      }
    }, // createdAt < [timestamp] AND createdAt > [timestamp]
    {
      [Op.or]: [
        {
          title: {
            [Op.like]: 'Foo%'
          }
        },
        {
          description: {
            [Op.like]: '%foo%'
          }
        }
      ]
    } // title LIKE 'Foo%' OR description LIKE '%foo%'
  }
})

// НЕ
Project.findAll({
  where: {
    name: 'Some Project',
    [Op.not]: [
      { id: [1, 2, 3] },
      {
        description: {
          [Op.like]: 'Awe%'
        }
      }
    ]
  }
})
/*
  SELECT *
  FROM 'Projects'
  WHERE (
    'Projects'.'name' = 'Some Project'
    AND NOT (
      'Projects'.'id' IN (1, 2, 3)
      OR
      'Projects'.'description' LIKE 'Awe%'
    )
  )
*/
```

"Продвинутые" запросы:

```js
Post.findAll({
  where: sequelize.where(
    sequelize.fn('char_length', sequelize.col('content')),
    7
  ),
}) // WHERE char_length('content') = 7

Post.findAll({
  where: {
    [Op.or]: [
      sequelize.where(sequelize.fn('char_length', sequelize.col('content')), 7),
      {
        content: {
          [Op.like]: 'Hello%',
        },
      },
      {
        [Op.and]: [
          { status: 'draft' },
          sequelize.where(
            sequelize.fn('char_length', sequelize.col('content')),
            {
              [Op.gt]: 8,
            }
          ),
        ],
      },
    ],
  },
})

/*
  ...
  WHERE (
    char_length("content") = 7
    OR
    "post"."content" LIKE 'Hello%'
    OR (
      "post"."status" = 'draft'
      AND
      char_length("content") > 8
    )
  )
*/
```

Длинное получилось лирическое отступление. Двигаемся дальше.

Обновление экземпляра:

```js
// Изменяем имя пользователя с `userId = 2`
await User.update(
  {
    firstName: 'John',
  },
  {
    where: {
      userId: 2,
    },
  }
)
```

Удаление экземпляра:

```js
// Удаление пользователя с `id = 2`
await User.destroy({
  where: {
    userId: 2,
  },
})

// Удаление всех пользователей
await User.destroy({
  truncate: true,
})
```

Создание нескольких экземпляров одновременно:

```js
const users = await User.bulkCreate([{ name: 'John' }, { name: 'Jane' }])

// Настройка `validate` со значением `true` заставляет `Sequelize` выполнять валидацию каждого объекта, создаваемого с помощью `bulkCreate()`
// По умолчанию валидация таких объектов не проводится
const User = sequelize.define('User', {
  name: {
    type: DataTypes.STRING,
    validate: {
      len: [2, 10],
    },
  },
})

await User.bulkCreate([{ name: 'John' }, { name: 'J' }], { validate: true }) // Ошибка!

// Настройка `fields` позволяет определять поля для сохранения
await User.bulkCreate([{ name: 'John' }, { name: 'Jane', age: 30 }], {
  fields: ['name'],
}) // Сохраняем только имена пользователей
```

**Сортировка и группировка**

Настройка `order` определяет порядок сортировки возвращаемых объектов:

```js
Submodel.findAll({
  order: [
    // Сортировка по заголовку (по убыванию)
    ['title', 'DESC'],

    // Сортировка по максимальному возврасту
    sequelize.fn('max', sequelize.col('age')),

    // То же самое, но по убыванию
    [sequelize.fn('max', sequelize.col('age')), 'DESC'],

    // Сортировка по `createdAt` из связанной модели
    [Model, 'createdAt', 'DESC'],

    // Сортировка по `createdAt` из двух связанных моделей
    [Model, AnotherModel, 'createdAt', 'DESC'],

    // и т.д.
  ],

  // Сортировка по максимальному возврасту (по убыванию)
  order: sequelize.literal('max(age) DESC'),

  // Сортировка по максимальному возрасту (по возрастанию - направление сортировки по умолчанию)
  order: sequelize.fn('max', sequelize.col('age')),

  // Сортировка по возрасту (по возрастанию)
  order: sequelize.col('age'),

  // Случайная сортировка
  order: sequelize.random(),
})

Model.findOne({
  order: [
    // возвращает `name`
    ['name'],
    // возвращает `'name' DESC`
    ['name', 'DESC'],
    // возвращает `max('age')`
    sequelize.fn('max', sequelize.col('age')),
    // возвращает `max('age') DESC`
    [sequelize.fn('max', sequelize.col('age')), 'DESC'],

    // и т.д.
  ],
})
```

Синтаксис группировки идентичен синтаксису сортировки, за исключением того, что при группировке не указывается направление. Кроме того, синтаксис группировки может быть сокращен до строки:

```js
Project.findAll({ group: 'name' }) // GROUP BY name
```

Настройки `limit` и `offset` позволяют ограничивать и/или пропускать определенное количество возвращаемых объектов:

```js
// Получаем 10 проектов
Project.findAll({ limit: 10 })

// Пропускаем 5 первых объектов
Project.findAll({ offset: 5 })

// Пропускаем 5 первых объектов и возвращаем 10
Project.findAll({ offset: 5, limit: 10 })
```

`Sequelize` предоставляет несколько полезных утилит:

```js
// Определяем число вхождений
console.log(
  `В настоящий момент в БД находится ${await Project.count()} проектов.`
)

const amount = await Project.count({
  where: {
    projectId: {
      [Op.gt]: 25,
    },
  },
})
console.log(
  `В настоящий момент в БД находится ${amount} проектов с идентификатором больше 25.`
)

// max, min, sum
// Предположим, что у нас имеется 3 пользователя 20, 30 и 40 лет
await User.max('age') // 40
await User.max('age', { where: { age: { [Op.lt]: 31 } } }) // 30
await User.min('age') // 20
await User.min('age', { where: { age: { [Op.gt]: 21 } } }) // 30
await User.sum('age') // 90
await User.sum('age', { where: { age: { [op.gt]: 21 } } }) // 70
```

### Поисковые запросы

Настройка `raw` со значением `true` отключает "оборачивание" ответа, возвращаемого `SELECT`, в экземпляр модели.

- `findAll()` - возвращает все экземпляры модели
- `findByPk()` - возвращает один экземпляр по первичному ключу

```js
const project = await Project.findByPk(123)
```

- `findOne()` - возвращает первый или один экземпляр модели (это зависит от того, указано ли условие для поиска)

```js
const project = await Project.findOne({ where: { projectId: 123 } })
```

- `findOrCreate()` - возвращает или создает и возвращает экземпляр, а также логическое значение - индикатор создания экземпляра. Настройка `defaults` используется для определения значений по умолчанию. При ее отсутствии, для заполнения полей используется значение, указанное в условии

```js
// Предположим, что у нас имеется пустая БД с моделью `User`, у которой имеются поля `username` и `job`
const [user, created] = await User.findOrCreate({
  where: { username: 'John' },
  defaults: {
    job: 'JavaScript Developer',
  },
})
```

- `findAndCountAll()` - комбинация `findAll()` и `count`. Может быть полезным при использовании настроек `limit` и `offset`, когда мы хотим знать точное число записей, совпадающих с запросом. Возвращает объект с двумя свойствами:
  - `count` - количество записей, совпадающих с запросом (целое число)
  - `rows` - массив объектов

```js
const { count, rows } = await Project.findAndCountAll({
  where: {
    title: {
      [Op.like]: 'foo%',
    },
  },
  offset: 10,
  limit: 5,
})
```

### Геттеры, сеттеры и виртуальные атрибуты

`Sequelize` позволяет определять геттеры и сеттеры для атрибутов моделей, а также _виртуальные атрибуты_ - атрибуты, которых не существует в таблице и которые заполняются или наполняются (имеется ввиду популяция) `Serquelize` автоматически. Последние могут использоваться, например, для упрощения кода.

Геттер - это функция `get()`, определенная для колонки:

```js
const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    get() {
      const rawValue = this.getDataValue(username)
      return rawValue ? rawValue.toUpperCase() : null
    },
  },
})
```

Геттер вызывается автоматически при чтении поля.

_Обратите внимание_: для получения значения поля в геттере мы использовали метод `getDataValue()`. Если вместо этого указать `this.username`, то мы попадем в бесконечный цикл.

Сеттер - это функция `set()`, определенная для колонки. Она принимает значение для установки:

```js
const User = sequelize.define('user', {
  username: DataTypes.STRING,
  password: {
    type: DataTypes.STRING,
    set(value) {
      // Перед записью в БД пароли следует "хэшировать" с помощью криптографической функции
      this.setDataValue('password', hash(value))
    },
  },
})
```

Сеттер вызывается автоматически при создании экземпляра.

В сеттере можно использовать значения других полей:

```js
const User = sequelize.define('User', {
  username: DatTypes.STRING,
  password: {
    type: DataTypes.STRING,
    set(value) {
      // Используем значение поля `username`
      this.setDataValue('password', hash(this.username + value))
    },
  },
})
```

Геттеры и сеттеры можно использовать совместно. Допустим, что у нас имеется модель `Post` с полем `content` неограниченной длины, и в целях экономии памяти мы решили хранить в БД содержимое поста в сжатом виде. _Обратите внимание_: многие современные БД выполняют сжатие (компрессию) данных автоматически.

```js
const { gzipSync, gunzipSync } = require('zlib')

const Post = sequelize.define('post', {
  content: {
    type: DataTypes.TEXT,
    get() {
      const storedValue = this.getDataValue('content')
      const gzippedBuffer = Buffer.from(storedValue, 'base64')
      const unzippedBuffer = gunzipSync(gzippedBuffer)
      return unzippedBuffer.toString()
    },
    set(value) {
      const gzippedBuffer = gzipSync(value)
      this.setDataValue('content', gzippedBuffer.toString('base64'))
    },
  },
})
```

Представим, что у нас имеется модель `User` с полями `firstName` и `lastName`, и мы хотим получать полное имя пользователя. Для этого мы можем создать виртуальный атрибут со специальным типом `DataTypes.VIRTUAL`:

```js
const User = sequelize.define('user', {
  firstName: DataTypes.STRING,
  lastName: DataTypes.STRING,
  fullName: {
    type: DataTypes.VIRTUAL,
    get() {
      return `${this.firstName} ${this.lastName}`
    },
    set(value) {
      throw new Error('Нельзя этого делать!')
    },
  },
})
```

В таблице не будет колонки `fullName`, однако мы сможем получать значение этого поля, как если бы оно существовало на самом деле.

### Валидация и ограничения

Наша моделька будет выглядеть так:

```js
const { Sequelize, Op, DataTypes } = require('sequelize')
const sequelize = new Sequelize('sqlite::memory:')

const User = sequelize.define('user', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  hashedPassword: {
    type: DataTypes.STRING(64),
    is: /^[0-9a-f]{64}$/i,
  },
})
```

Отличие между выполнением валидации и применением или наложением органичение на значение поля состоит в следующем:

- валидация выполняется на уровне `Sequelize`; для ее выполнения можно использовать любую функцию, как встроенную, так и кастомную; при провале валидации, SQL-запрос в БД не отправляется;
- ограничение определяется на уровне `SQL`; примером ограничения является настройка `unique`; при провале ограничения, запрос в БД все равно отправляется

В приведенном примере мы ограничили уникальность имени пользователя с помощью настройки `unique`. При попытке записать имя пользователя, которое уже существует в БД, возникнет ошибка `SequelizeUniqueConstraintError`.

По умолчанию колонки таблицы могут быть пустыми (нулевыми). Настройка `allowNull` со значением `false` позволяет это запретить. _Обратите внимание_: без установки данной настройки хотя бы для одного поля, можно будет выполнить такой запрос: `User.create({})`.

Валидаторы позволяют проводить проверку в отношении каждого атрибута модели. Валидация автоматически выполняется при запуске методов `create()`, `update()` и `save()`. Ее также можно запустить вручную с помощью `validate()`.

Как было отмечено ранее, мы можем определять собственные валидаторы или использовать встроенные (предоставляемые библиотекой <a href="https://github.com/validatorjs/validator.js">`validator.js`</a>).

```js
sequelize.define('foo', {
  bar: {
    type: DataTypes.STRING,
    validate: {
      is: /^[a-z]+$/i, // определение совпадения с регулярным выражением
      not: /^[a-z]+$/i, // определение отсутствия совпадения с регуляркой
      isEmail: true,
      isUrl: true,
      isIP: true,
      isIPv4: true,
      isIPv6: true,
      isAlpha: true,
      isAlphanumeric: true,
      isNumeric: true,
      isInt: true,
      isFloat: true,
      isDecimal: true,
      isLowercase: true,
      isUppercase: true,
      notNull: true,
      isNull: true,
      notEmpty: true,
      equals: 'определенное значение',
      contains: 'foo', // определение наличия подстроки
      notContains: 'bar', // определение отсутствия подстроки
      notIn: [['foo', 'bar']], // определение того, что значение НЕ является одним из указанных
      isIn: [['foo', 'bar']], // определение того, что значение является одним из указанных
      len: [2, 10], // длина строки должна составлять от 2 до 10 символов
      isUUID: true,
      isDate: true,
      isAfter: '2021-06-12',
      isBefore: '2021-06-15',
      max: 65,
      min: 18,
      isCreditCard: true,

      // Примеры кастомных валидаторов
      isEven(value) {
        if (parseInt(value) % 2 !== 0) {
          throw new Error('Разрешены только четные числа!')
        }
      },
      isGreaterThanOtherField(value) {
        if (parseInt(value) < parseInt(this.otherField)) {
          throw new Error(
            `Значение данного поля должно быть больше значения ${otherField}!`
          )
        }
      },
    },
  },
})
```

Для кастомизации сообщения об ошибке можно использовать объект со свойством `msg`:

```js
isInt: {
  msg: 'Значение должно быть целым числом!'
}
```

В этом случае для указания аргументов используется свойство `args`:

```js
isIn: {
  args: [['ru', 'en']],
  msg: 'Язык должен быть русским или английским!'
}
```

Для поля, которое может иметь значение `null`, встроенные валидаторы пропускаются. Это означает, что мы, например, можем определить поле, которое либо должно содержать строку длиной 5-10 символов, либо должно быть пустым:

```js
const User = sequelize.define('user', {
  username: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [5, 10],
    },
  },
})
```

_Обратите внимание_, что для нулевых полей кастомные валидаторы выполняются:

```js
const User = sequelize.define('user', {
  age: DataTypes.INTEGER,
  name: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      customValidator(value) {
        if (value === null && this.age < 18) {
          throw new Error('Нулевые значения разрешены только совершеннолетним!')
        }
      },
    },
  },
})
```

Мы можем выполнять валидацию не только отдельных полей, но и модели в целом. В следующем примере мы проверяем наличие или отсутствии как поля `latitude`, так и поля `longitude` (либо должны быть указаны оба поля, либо не должно быть указано ни одного):

```js
const Place = sequelize.define(
  'place',
  {
    name: DataTypes.STRING,
    address: DataTypes.STRING,
    latitude: {
      type: DataTypes.INTEGER,
      validate: {
        min: -90,
        max: 90,
      },
    },
    longitude: {
      type: DataTypes.INTEGER,
      validate: {
        min: -180,
        max: 180,
      },
    },
  },
  {
    validate: {
      bothCoordsOrNone() {
        if (!this.latitude !== !this.longitude) {
          throw new Error(
            'Либо укажите и долготу, и широту, либо ничего не указывайте!'
          )
        }
      },
    },
  }
)
```

### Необработанные запросы

`sequelize.query()` позволяет выполнять необработанные `SQL-запросы` (raw queries). По умолчанию данная функция возвращает массив с результатами и объект с метаданными, при этом, содержание последнего зависит от используемого диалекта.

```js
const [results, metadata] = await sequelize.query(
  "UPDATE users SET username = 'John' WHERE userId = 123"
)
```

Если нам не нужны метаданные, для правильного форматирования результата можно воспользоваться специальными типами запроса (query types):

```js
const { QueryTypes } = require('sequelize')

const users = await sequelize.query('SELECT * FROM users', {
  // тип запроса - выборка
  type: QueryTypes.SELECT,
})
```

Для привязки результатов необработанного запроса к модели используются настройки `model` и, опционально, `mapToModel`:

```js
const projects = await sequelize.query('SELECT * FROM projects', {
  model: Project,
  mapToModel: true,
})
```

Пример использования других настроек:

```js
sequelize.query('SELECT 1', {
  // "логгирование" - функция или `false`
  logging: console.log,

  // если `true`, возвращается только первый результат
  plain: false,

  // если `true`, для выполнения запроса не нужна модель
  raw: false,

  // тип выполняемого запроса
  type: QueryTypes.SELECT,
})
```

Если название атрибута в таблице содержит точки, то результирующий объект может быть преобразован во вложенные объекты с помощью настройки `nest`.

Без `nest: true`:

```js
const records = await sequelize.query('SELECT 1 AS `foo.bar.baz`', {
  type: QueryTypes.SELECT,
})
console.log(JSON.stringify(records[0], null, 2))
// { 'foo.bar.baz': 1 }
```

С `nest: true`:

```js
const records = await sequelize.query('SELECT 1 AS `foo.bar.baz`', {
  type: QueryTypes.SELECT,
  nest: true,
})
console.log(JSON.stringify(records[0], null, 2))
/*
{
  'foo': {
    'bar': {
      'baz': 1
    }
  }
}
*/
```

Замены при выполнении запроса могут производиться двумя способами:

- с помощью именованных параметров (начинающихся с `:`)
- с помощью неименованных параметров (представленных `?`)

Заменители (placeholders) передаются в настройку `replacements` в виде массива (для неименованных параметров) или в виде объекта (для именованных параметров):

- если передан массив, `?` заменяется элементами массива в порядке их следования
- если передан объект, `:key` заменяются ключами объекта. При отсутствии в объекте ключей для заменяемых значений, а также в случае, когда ключей в объекте больше, чем заменяемых значений, выбрасывается исключение

```js
sequelize.query('SELECT * FROM projects WHERE status = ?', {
  replacements: ['active'],
  type: QueryTypes.SELECT,
})

sequelize.query('SELECT * FROM projects WHERE status = :status', {
  replacements: { status: 'active' },
  type: QueryTypes.SELECT,
})
```

Продвинутые примеры замены:

```js
// Замена производится при совпадении с любым значением из массива
sequelize.query('SELECT * FROM projects WHERE status IN(:status)', {
  replacements: { status: ['active', 'inactive'] },
  type: QueryTypes.SELECT,
})

// Замена выполняется для всех пользователей, имена которых начинаются с `J`
sequelize.query('SELECT * FROM users WHERE name LIKE :search_name', {
  replacements: { search_name: 'J%' },
  type: QueryTypes.SELECT,
})
```

Кроме замены, можно выполнять привязку (bind) параметров. Привязка похожа на замену, но заменители обезвреживаются (escaped) и вставляются в запрос, отправляемый в БД, а связанные параметры отправляются в БД по отдельности. Связанные параметры обозначаются с помощью `$число` или `$строка`:

- если передан массив, `$1` будет указывать на его первый элемент (`bind[0]`)
- если передан объект, `$key` будет указывать на `object['key']`. Каждый ключ объекта должен начинаться с буквы. `$1` является невалидным ключом, даже если существует `object['1']`
- в обоих случаях для сохранения знака `$` может использоваться `$$`

Связанные параметры не могут быть ключевыми словами `SQL`, названиями таблиц или колонок. Они игнорируются внутри текста, заключенного в кавычки. Кроме того, в `postgres` может потребоваться указывать тип связываемого параметра в случае, когда он не может быть выведен на основании контекста - `$1::varchar`.

```js
sequelize.query(
  'SELECT *, "текст с литеральным $$1 и литеральным $$status" AS t FROM projects WHERE status = $1',
  {
    bind: ['active'],
    type: QueryTypes.SELECT,
  }
)

sequelize.query(
  'SELECT *, "текст с литеральным $$1 и литеральным $$status" AS t FROM projects WHERE status = $status',
  {
    bind: { status: 'active' },
    type: QueryTypes.SELECT,
  }
)
```

## Ассоциации

`Sequelize` поддерживает стандартные ассоциации или отношения между моделями: один-к-одному (One-To-One), один-ко-многим (One-To-Many), многие-ко-многим (Many-To-Many).

Существует 4 типа ассоциаций:

- `HasOne`
- `BelongsTo`
- `HasMany`
- `BelongsToMany`

**Определение ассоциации**

Предположим, что у нас имеется 2 модели, `A` и `B`. Вот как можно определить между ними связь:

```js
const A = sequelize.define('A' /* ... */)
const B = sequelize.define('B' /* ... */)

A.hasOne(B)
A.belongsTo(B)
A.hasMany(B)
A.belongsToMany(B)
```

Все эти функции принимают объект с настройками (для первых трех он является опциональным, для последнего - обязательным). В настройках должно быть определено как минимум свойство `through`:

```js
A.hasOne(B, {
  /* настройки */
})
A.belongsTo(B, {
  /* настройки */
})
A.hasMany(B, {
  /* настройки */
})
A.belongsToMany(B, { through: 'C' /* другие настройки */ })
```

Порядок определения ассоциаций имеет принципиальное значение. В приведенных примерах `A` - это модель-источник (source), а `B` - это целевая модель (target). Запомните эти термины.

`A.hasOne(B)` означает, что между `A` и `B` существуют отношения один-к-одному, при этом, внешний ключ (foreign key) определяется в целевой модели (`B`).

`A.belongsTo(B)` - отношения один-к-одному, внешний ключ определяется в источнике (`A`).

`A.hasMany(B)` - отношения один-ко-многим, внешний ключ определяется в целевой модели (`B`).

В этих случаях `Sequelize` автоматически добавляет внешние ключи (при их отсутствии) в соответствующие модели (таблицы).

`A.belongsToMany(B, { through: 'C' })` означает, что между `A` и `B` существуют отношения многие-ко-многим, таблица `C` выступает в роли связующего звена между ними через внешние ключи (например, `aId` и `bId`). `Sequelize` автоматически создает модель `C` при ее отсутствии, определяя в ней соответствующие ключи.

**Определение стандартных отношений**

Как правило, ассоциации используются парами:

- для создания отношений один-к-одному используются `hasOne()` и `belongsTo()`
- для один-ко-многим - `hasMany()` и `belongsTo()`
- для многие-ко-многим - два `belongsToMany()`. _Обратите внимание_, что существуют также отношения "супер многие-ко-многим", где одновременно используется `6` ассоциаций

**Один-к-одному**

_Обратите внимание_: для того, чтобы решить, в какой из двух таблиц должен быть определен внешний ключ, следует ответить на вопрос о том, какая из таблиц может существовать без другой.

Предположим, что у нас имеется две модели, `Foo` и `Bar`. Мы хотим установить между ними отношения один-к-одному таким образом, чтобы `Bar` содержала атрибут `fooId`. Это можно реализовать так:

```js
Foo.hasOne(Bar)
Bar.belongsTo(Foo)
```

Дальнейший вызов `Bar.sync()` приведет к отправке в БД следующего запроса:

```sql
CREATE TABLE IF NOT EXISTS "foos" (
  /* ... */
);
CREATE TABLE IF NOT EXISTS "bars" (
  /* ... */
  "fooId" INTEGER REFERENCES "foos" ("id") ON DELETE SET NULL ON UPDATE CASCADE
  /* ... */
);
```

При создании ассоциации могут использоваться некоторые настройки.

Пример кастомизации поведения при удалении и обновлении внешнего ключа:

```js
Foo.hasOne(Bar, {
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT'
})
Bar.belongsTo(Foo)
```

Возможными вариантами здесь являются: `RESTRICT`, `CASCADE`, `NO ACTION`, `SET DEFAULT` и `SET NULL`.

Название внешнего ключа, которое в приведенном примере по умолчанию имеет значение `fooId`, можно кастомизировать. Причем, это можно делать как в `hasOne()`, так и в `belongsTo()`:

```js
// 1
Foo.hasOne(Bar, {
  foreignKey: 'myFooId'
})
Bar.belongsTo(Foo)

// 2
Foo.hasOne(Bar, {
  foreignKey: {
    name: 'myFooId'
  }
})
Bar.belongsTo(Foo)

// 3
Foo.hasOne(Bar)
Bar.belongsTo(Foo, {
  foreignKey: 'myFooId'
})

// 4
Foo.hasOne(Bar)
Bar.belongsTo(Foo, {
  foreignKey: {
    name: 'myFooId'
  }
})
```

В случае кастомизации внешнего ключа с помощью объекта, можно определять его тип, значение по умолчанию, ограничения и т.д. Например, в качестве типа внешнего ключа можно использовать `DataTypes.UUID` вместо дефолтного `INTEGER`:

```js
Foo.hasOne(Bar, {
  foreignKey: {
    type: DataTypes.UUID
  }
})
Bar.belongsTo(Foo)
```

По умолчанию ассоциация является опциональной, т.е. `fooId` может иметь значение `null` - `Bar` может существовать без `Foo`. Для того, чтобы это изменить, можно установить такое ограничение:

```js
Foo.hasOne(Bar, {
  foreignKey: {
    allowNull: false
  }
})
```

**Один-ко-многим**

_Обратите внимание_: в данном случае вопрос о том, в какой из двух таблиц должен быть определен внешний ключ не является актуальным, поскольку такой ключ может быть определен только в целевой модели.

Предположим, что у нас имеется две модели, `Team` и `Player`, и мы хотим определить между ними отношения один-ко-многим: в одной команде может быть несколько игроков, но каждый игрок может принадлежат только к одной команде.

```js
Team.hasMany(Player)
Player.belongsTo(Team)
```

В данном случае в БД будет отправлен такой запрос:

```sql
CREATE TABLE IF NOT EXISTS "Teams" (
  /* ... */
);
CREATE TABLE IF NOT EXISTS "Players" (
  /* ... */
  "TeamId" INTEGER REFERENCES "Teams" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  /* ... */
);
```

Как и в случае с отношениями один-к-одному, рассматриваемую ассоциацию можно настраивать различными способами.

```js
Team.hasMany(Player, {
  foreignKey: 'clubId'
})
Player.belongsTo(Team)
```

**Многие-ко-многим**

_Обратите внимание_: в отличие от первых двух ассоциаций, внешний ключ не может быть определен ни в одной из связанных таблиц. Для этого используется так называемая "соединительная таблица" (junction, join, through table).

Предположим, что у нас имеется две модели, `Movie` (фильм) и `Actor` (актер), и мы хотим определить между ними отношения многие-ко-многим: актер может принимать участие в съемках нескольких фильмов, а в фильме может сниматься несколько актеров. Соединительная таблица будет называться `ActorMovies` и содержать внешние ключи `actorId` и `movieId`.

```js
const Movie = sequelize.define('Movie', { name: DataTypes.STRING })
const Actor = sequelize.define('Actor', { name: DataTypes.STRING })
Movie.belongsToMany(Actor, { through: 'ActorMovies' })
Actor.belongsToMany(Movie, { through: 'ActorMovies' })
```

В данном случае в `postgres`, например, будет отправлен такой запрос:

```sql
CREATE TABLE IF NOT EXISTS "ActorMovies" (
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
  "MovieId" INTEGER REFERENCES "Movies" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "ActorId" INTEGER REFERENCES "Actors" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  PRIMARY KEY ("MovieId","ActorId")
);
```

Как упоминалось ранее, `Sequelize` создает соединительную таблицу автоматически. Но мы вполне можем сделать это самостоятельно:

```js
const Movie = sequelize.define('Movie', { name: DataTypes.STRING })
const Actor = sequelize.define('Actor', { name: DataTypes.STRING })
const ActorMovies = sequelize.define('ActorMovies', {
  MovieId: {
    type: DataTypes.INTEGER,
    references: {
      model: Movie, // или 'Movies'
      key: 'id'
    }
  },
  ActorId: {
    type: DataTypes.INTEGER,
    references: {
      model: Actor, // или 'Actors'
      key: 'id'
    }
  }
})
Movie.belongsToMany(Actor, { through: ActorMovies })
Actor.belongsToMany(Movie, { through: ActorMovies })
```

В этом случае в БД будет отправлен такой запрос:

```sql
CREATE TABLE IF NOT EXISTS "ActorMovies" (
  "MovieId" INTEGER NOT NULL REFERENCES "Movies" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "ActorId" INTEGER NOT NULL REFERENCES "Actors" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
  UNIQUE ("MovieId", "ActorId"),     -- Note: Sequelize generated this UNIQUE constraint but
  PRIMARY KEY ("MovieId","ActorId")  -- it is irrelevant since it's also a PRIMARY KEY
);
```

**Выполнение запросов, включающих ассоциации**

Предположим, что у нас имеется две модели, `Ship` (корабль) и `Captain` (капитан). Между этими моделями существуют отношения один-к-одному. Внешние ключи могут иметь значение `null`. Это означает, что корабль может существовать без капитана, и наоборот.

```js
const Ship = sequelize.define(
  'Ship',
  {
    name: DataTypes.STRING,
    crewCapacity: DataTypes.INTEGER,
    amountOfSails: DataTypes.INTEGER
  },
  { timestamps: false }
)
const Captain = sequelize.define(
  'Captain',
  {
    name: DataTypes.STRING,
    skillLevel: {
      type: DataTypes.INTEGER,
      validate: { min: 1, max: 10 }
    }
  },
  { timestamps: false }
)
Captain.hasOne(Ship)
Ship.belongsTo(Captain)
```

**Немедленная загрузка и отложенная загрузка**

"Ленивая" (lazy) или отложенная загрузка позволяет получать ассоциации (т.е. связанные экземпляры) по мере необходимости, а "нетерпеливая" (eager) или немедленная загрузка предполагает получение всех ассоциаций сразу при выполнении запроса.

**Пример ленивой загрузки**

```js
const awesomeCaptain = await Captain.findOne({
  where: {
    name: 'Jack Sparrow'
  }
})
// выполняем какие-то операции с капитаном
// получаем его корабль
const hisShip = await awesomeCaptain.getShip()
// выполняем операции с кораблем
```

В данном случае мы выполняем два запроса - корабль запрашивается при необходимости. Это позволяет сэкономить время и память. _Обратите внимание_: метод `getShip()` был создан автоматически, автоматически создаются и другие методы (см. ниже).

**Пример нетерпеливой загрузки**

```js
const awesomeCaptaint = await Captain.findOne({
  where: {
    name: 'Jack Sparrow'
  },
  // сразу получаем корабль, которым управляет данный капитан
  include: Ship
})
```

**Создание, обновление и удаление ассоциаций**

Для создания, обновления и удаления ассоциаций можно использовать как обычные запросы:

```js
Bar.create({
  name: 'Bar',
  fooId: 3
})
// создаем `Bar`, принадлежащую `Foo` c `id` = 3
```

так и специальные методы/миксины (микшины, примеси, mixins) (см. ниже).

**Синонимы ассоциаций и кастомные внешние ключи**

Немного упростим пример с кораблями и капитанами:

```js
const Ship = sequelize.define(
  'Ship',
  { name: DataTypes.STRING },
  { timestamps: false }
)
const Captain = sequelize.define(
  'Captain',
  { name: DataTypes.STRING },
  { timestamps: false }
)
```

Вызов `Ship.belongsTo(Captain)` приводит к автоматическому созданию внешнего ключа и "геттеров":

```js
Ship.belongsTo(Captain)

console.log((await Ship.findAll({ include: Captain })).toJSON())
// или
console.log((await Ship.findAll({ include: 'Captain' })).toJSON())

const ship = await Ship.findOne()
console.log((await ship.getCaptain()).toJSON())
```

Название внешнего ключа может быть указано при определении ассоциации:

```js
Ship.belongsTo(Captain, { foreignKey: 'bossId' })
```

Внешний ключ также может быть определен в виде синонима:

```js
Ship.belongsTo(Captain, { as: 'leader' })

// будет выброшено исключение
console.log((await Ship.findAll({ include: Captain })).toJSON())
// следует использовать синоним
console.log((await Ship.findAll({ include: 'leader' })).toJSON())
```

Синонимы могут использоваться, например, для определения двух разных ассоциаций между одними и теми же моделями. Например, если у нас имеются модели `Mail` и `Person`, может потребоваться связать их дважды для представления `sender` (отправителя) и `receiver` (получателя) электронной почты. Если мы этого не сделаем, то вызов `mail.getPerson()` будет двусмысленным. Благодаря синонимам мы получим два метода: `mail.getSender()` и `mail.getReceiver()`.

При определении синонимов для ассоциаций `hasOne()` или `belongsTo()`, следует использовать сингулярную форму (единственное число), а для ассоциаций `hasMany()` или `belongsToMany()` - плюральную (множественное число).

Ничто не мешает нам использовать оба способа определения внешних ключей одновременно:

```js
Ship.belongsTo(Captain, { as: 'leader', foreignKey: 'bossId' })
```

**Специальные методы/миксины**

При определении ассоциации между двумя моделями, экземпляры этих моделей получают специальные методы для взаимодействия с другой частью ассоциации. Конкретные методы зависят от типа ассоциации. Предположим, что у нас имеется две связанные модели, `Foo` и `Bar`.

**`Foo.hasOne(Bar)`**

- `foo.getBar()`
- `foo.setBar()`
- `foo.createBar()`

```js
const foo = await Foo.create({ name: 'foo' })
const bar = await Bar.create({ name: 'bar' })
const bar2 = await Bar.create({ name: 'another bar' })

console.log(await foo.getBar()) // null

await foo.setBar(bar)
console.log(await foo.getBar().name) // bar

await foo.createBar({ name: 'and another bar' })
console.log(await foo.getBar().name) // and another bar

await foo.setBar(null) // удаляем ассоциацию
console.log(await foo.getBar()) // null
```

**`Foo.belongsTo(Bar)`**

- `foo.getBar()`
- `foo.setBar()`
- `foo.createBar()`

**`Foo.hasMany`**

- `foo.getBars()`
- `foo.countBars()`
- `foo.hasBar()`
- `foo.hasBars()`
- `foo.setBars()`
- `foo.addBar()`
- `foo.addBars()`
- `foo.removeBar()`
- `foo.removeBars()`
- `foo.createBar()`

```js
const foo = await Foo.create({ name: 'foo' })
const bar = await Bar.create({ name: 'bar' })
const bar2 = await Bar.create({ name: 'another bar' })

console.log(await foo.getBars()) // []
console.log(await foo.countBars()) // 0
console.log(await foo.hasBar(bar)) // false

await foo.addBars([bar, bar2])
console.log(await foo.countBars) // 2

await foo.addBar(bar)
console.log(await foo.countBars()) // 2
console.log(await foo.hasBar(bar)) // true

await foo.removeBar(bar2)
console.log(await foo.countBars()) // 1

await foo.createBar({ name: 'and another bar' })
console.log(await foo.countBars()) // 2

await foo.setBars([])
console.log(await foo.countBars()) // 0
```

Геттеры принимают такие же настройки, что и обычные поисковые методы (такие как `findAll()`):

```js
const easyTasks = await project.getTasks({
  where: {
    difficulty: {
      [Op.lte]: 5
    }
  }
})

const taskTitles = (
  await project.getTasks({
    attributes: ['title'],
    raw: true
  })
).map((task) => task.title)
```

**`Foo.belongsToMany(Bar, { through: Baz })`**

- `foo.getBars()`
- `foo.countBars()`
- `foo.hasBar()`
- `foo.hasBars()`
- `foo.setBars()`
- `foo.addBar()`
- `foo.addBars()`
- `foo.removeBar()`
- `foo.removeBars()`
- `foo.createBar()`

Для формирования названий методов вместо названия модели может использоваться синоним, например:

```js
Task.hasOne(User, { as: 'Author' })
```

- `task.getAuthor()`
- `task.setAuthor()`
- `task.createAuthor()`

_Обратите внимание_: как было отмечено ранее, ассоциации определяются в паре. Это объясняется тем, что обе модели должны знать о существовании ассоциации между ними.

- допустим, что мы определили только ассоциацию `Foo.hasOne(Bar)`

```js
// это будет работать
await Foo.findOne({ include: Bar })

// а здесь будет выброшено исключение
await Bar.findOne({ include: Foo })
```

- если мы определим пару ассоциаций, то все будет в порядке

```js
Bar.belongsTo(Foo)

// работает
await Foo.findOne({ include: Bar })

// и это тоже
await Bar.findOne({ include: Foo })
```

Синонимы позволяют определять несколько ассоциаций между одними и теми же моделями:

```js
Team.hasOne(Game, { as: 'HomeTeam', foreignKey: 'homeTeamId' })
Team.hasOne(Game, { as: 'AwayTeam', foreignKey: 'awayTeamId' })
Game.belongsTo(Team)
```

**Создание ассоциаций с помощью полей, которые не являются первичными ключами**

В качестве внешних ключей могут использоваться не только основные ключи, но и другие поля. Единственным требованием к полю, используемому в качестве внешнего ключа, является то, что его значение должно быть уникальным, в противном случае, это не будет иметь смысла.

**`belongsTo()`**

Ассоциация `A.belongsTo(B)` приводит к созданию внешнего ключа в модели-источнике (`A`).

Снова вернемся к примеру с кораблями и ограничим уникальность имен капитанов:

```js
const Ship = sequelize.define(
  'Ship',
  { name: DataTypes.STRING },
  { timestamps: false }
)
const Captain = sequelize.define(
  'Captain',
  {
    name: { type: DataTypes.STRING, unique: true }
  },
  { timestamp: false }
)
```

Теперь в качестве внешнего ключа вместо `captainId` можно использовать `captainName`. Для этого в ассоциации необходимо определить настройки `targetKey` и `foreignKey`:

```js
Ship.belongsTo(Captain, { targetKey: 'name', foreignKey: 'captainName' })
```

После этого мы можем делать так:

```js
await Captain.create({ name: 'Jack Sparrow' })
const ship = Ship.create({ name: 'Black Pearl', captainName: 'Jack Sparrow' })
console.log((await ship.getCaptain()).name) // Jack Sparrow
```

**`hasOne()` и `hasMany()`**

В данном случае вместо `targetKey` определяется настройка `sourceKey`:

```js
const Foo = sequelize.define(
  'foo',
  {
    name: {
      type: DataTypes.STRING,
      unique: true
    }
  },
  {
    timestamps: false
  }
)
const Bar = sequelize.define(
  'bar',
  {
    title: {
      type: DataTypes.STRING,
      unique: true
    }
  },
  {
    timestamps: false
  }
)
const Baz = sequelize.define(
  'baz',
  {
    summary: DataTypes.STRING
  },
  {
    timestamps: false
  }
)
Foo.hasOne(Bar, { sourceKey: 'name', foreignKey: 'fooName' })
Bar.hasMany(Baz, { sourceKey: 'title', foreignKey: 'barTitle' })

await Bar.setFoo('Название для `Foo`')
await Bar.addBar('Название для `Bar`')
```

**`belongsToMany()`**

В данном случае необходимо определить два внешних ключа в соединительной таблице.

```js
const Foo = sequelize.define(
  'foo',
  {
    name: { type: DataTypes.STRING, unique: true }
  },
  { timestamps: false }
)
const Bar = sequelize.define(
  'bar',
  {
    title: { type: DataTypes.STRING, unique: true }
  },
  { timestamps: false }
)
```

Далее выполняется один из следующих 4 шагов:

- между `Foo` и `Bar` определяются отношения многие-ко-многим с помощью дефолтных первичных ключей

```js
Foo.belongsToMany(Bar, { through: 'foo_bar' })
```

- отношения определяются с помощью основного ключа для `Foo` и кастомного ключа для `Bar`

```js
Foo.belongsToMany(Bar, { through: 'foo_bar', targetKey: 'title' })
```

- отношения определяются с помощью кастомного ключа для `Foo` и первичного ключа для `Bar`

```js
Foo.belongsToMany(Bar, { through: 'foo_bar', sourceKey: 'name' })
```

- отношения определяются с помощью кастомных ключей для обеих моделей

```js
Foo.belongsToMany(Bar, {
  through: 'foo_bar',
  sourceKey: 'name',
  targetKey: 'title'
})
```

Еще раз в качестве напоминания:

- `A.belongsTo(B)` - внешний ключ хранится в модели-источнике (`A`), ссылка (`targetKey`) - в целевой модели (`B`)
- `A.hasOne(B)` и `A.hasMany(B)` - внешний ключ хранится в целевой модели (`B`), а ссылка (`sourceKey`) - в источнике (`A`)
- `A.belongsToMany(B)` - используется соединительная таблица, в которой хранятся ключи для `sourceKey` и `targetKey`, `sourceKey` соответствует некоторому полю в источнике (`A`), `targetKey` - некоторому полю в целевой модели (`B`)

### "Параноик"

`Sequelize` поддерживает создание так называемых "параноидальных" (paranoid) таблиц. Из таких таблиц данные по-настоящему не удаляются. Вместо этого, в них добавляется колонка `deletedAt` в момент выполнения запроса на удаление. Это означает, что в таких таблицах выполняется мягкое удаление (soft-deletion).

Для создания параноика используется настройка `paranoid: true`. _Обратите внимание_: для работы такой таблицы требуется фиксация времени создания и обновления таблицы. Поэтому для них нельзя устанавливать `timestamps: false`. Название поля `deletedAt` можно кастомизировать.

```js
const Post = sequelize.define(
  'post',
  {
    // атрибуты
  },
  {
    paranoid: true,
    deletedAt: 'destroyTime'
  }
)
```

При вызове метода `destroy()` производится мягкое удаление:

```js
await Post.destroy({
  where: {
    id: 1
  }
}) // UPDATE "posts" SET "deletedAt"=[timestamp] WHERE "deletedAt" IS NULL AND "id" = 1;
```

Для окончательного удаления параноика следует использовать настройку `force: true`:

```js
await Post.destroy({
  where: {
    id: 1
  },
  force: true
})
```

Для восстановления "удаленного" значения используется метод `restore()`:

```js
const post = await Post.create({ title: 'test' })
await post.destroy()
console.log('Пост удален мягко!')
await post.restore()
console.log('Пост восстановлен!')

// восстанавливаем "удаленные" посты, набравшие больше 100 лайков, с помощью статического метода `restore()`
await Post.restore({
  where: {
    likes: {
      [Op.gt]: 100
    }
  }
})
```

По умолчанию запросы, выполняемые `Sequelize`, будут игнорировать "удаленные" записи. Это означает, что метод `findAll()`, например, вернет только "неудаленные" записи, а метод `findByPk()` при передаче ему первичного ключа "удаленной" записи, вернет `null`.

Для учета "удаленных" записей при выполнении запроса используется настройка `paranoid: false`:

```js
await Post.findByPk(123) // null
await Post.findByPk(123, { paranoid: false }) // post

await Post.findAll({
  where: { foo: 'bar' }
}) // []
await Post.findAll(
  {
    where: { foo: 'bar' }
  },
  { paranoid: false }
) // [post]
```

### Нетерпеливая загрузка

Нетерпеливая загрузка - это одновременная загрузка основной и связанных с ней моделей. На уровне `SQL` это означает одно или более соединение (join).

В `Sequelize` нетерпеливая загрузка, обычно, выполняется с помощью настройки `include`.

В дальнейших примерах будут использоваться следующие модели:

```js
const User = sequelize.define('User', { name: DataTypes.STRING })
const Task = sequelize.define('Task', { name: DataTypes.STRING })
const Tool = sequelize.define(
  'Tool',
  {
    name: DataTypes.STRING,
    size: DataTypes.STRING
  },
  { timestamps: false }
)
User.hasMany(Task)
Task.belongsTo(User)
User.hasMany(Tool, { as: 'Instruments' })
```

**Получение одного связанного экземпляра**

```js
const tasks = await Task.findAll({ include: User })
console.log(JSON.stringify(tasks, null, 2))
/*
[{
  "name": "A Task",
  "id": 1,
  "userId": 1,
  "user": {
    "name": "John Smith",
    "id": 1
  }
}]
*/
```

**Получение всех связанных экземпляров**

```js
const users = await User.findAll({ include: Task })
console.log(JSON.stringify(users, null, 2))
/*
[{
  "name": "John Smith",
  "id": 1,
  "tasks": [{
    "name": "A Task",
    "id": 1,
    "userId": 1
  }]
}]
*/
```

**Получение ассоциации через синоним**

В случае с синонимами, вместо `include` используются настройки `model` и `as`.

```js
const users = await User.findAll({
  include: { model: Tool, as: 'Instruments' }
})
console.log(JSON.stringify(users, null, 2))
/*
[{
  "name": "John Doe",
  "id": 1,
  "Instruments": [{
    "name": "Scissor",
    "id": 1,
    "userId": 1
  }]
}]
*/
```

Существуют и другие способы получения ассоциаций через синонимы:

```js
User.findAll({ include: 'Instruments' })
User.findAll({ include: { assosiation: 'Instruments' } })
```

**Фильтрация с помощью нетерпеливой загрузки**

Настройка `required` позволяет фильтровать результат выполняемого запроса - конвертировать `OUTER JOIN` в `INNER JOIN`. В следующем примере возвращаются только те пользователи, у которых есть задачи:

```js
User.findAll({
  include: {
    model: Task,
    required: true
  }
})
```

**Фильтрация на уровне связанной модели**

Фильтрацию на уровне связанной модели можно выполнять с помощью настройки `where`. В следующем примере возвращаются только пользователи, у которых имеется хотя бы один инструмент НЕ маленького размера:

```js
User.findAll({
  include: {
    model: Tool,
    as: 'Instruments',
    where: {
      size: {
        [Op.ne]: 'small'
      }
    }
  }
})
```

Генерируемый `SQL-запрос` выглядит так:

```sql
SELECT
  `user`.`id`,
  `user`.`name`,
  `Instruments`.`id` AS `Instruments.id`,
  `Instruments`.`name` AS `Instruments.name`,
  `Instruments`.`size` AS `Instruments.size`,
  `Instruments`.`userId` AS `Instruments.userId`
FROM `users` AS `user`
INNER JOIN `tools` AS `Instruments` ON
  `user`.`id` = `Instruments`.`userId` AND
  `Instruments`.`size` != 'small';
```

В следующем примере настройка `where` применяется для фильтрации значений связанной модели с помощью функции `Sequelize.col()`:

```js
Project.findAll({
  include: {
    model: Task,
    where: {
      state: Sequelize.col('project.state')
    }
  }
})
```

**Сложная фильтрация с помощью `where` на верхнем уровне**

`Sequelize` предоставляет специальный синтаксис `$nested.column$` для реализации фильтрации значений вложенных колонок с помощью `where`:

```js
User.findAll({
  where: {
    '$Instruments.size$': { [Op.ne]: 'small' }
  },
  include: [
    {
      model: Tool,
      as: 'Instruments'
    }
  ]
})
```

Генерируемый `SQL-запрос` выглядит так:

```sql
SELECT
  `user`.`id`,
  `user`.`name`,
  `Instruments`.`id` AS `Instruments.id`,
  `Instruments`.`name` AS `Instruments.name`,
  `Instruments`.`size` AS `Instruments.size`,
  `Instruments`.`userId` AS `Instruments.userId`
FROM `users` AS `user`
LEFT OUTER JOIN `tools` AS `Instruments` ON
  `user`.`id` = `Instruments`.`userId`
WHERE `Instruments`.`size` != 'small';
```

При этом, уровень вложенности фильтруемых колонок значения не имеет.

Для лучшего понимания разницы между использование внутреннего `where` (в `include`) с настройкой `required` и без нее, а также использованием `where` на верхнем уровне с помощью синтаксиса `$nested.column$`, рассмотрим 4 примера:

```js
// внутренний `where` с `required: true` по умолчанию
await User.findAll({
  include: {
    model: Tool,
    as: 'Instruments',
    where: {
      size: {
        [Op.ne]: 'small'
      }
    }
  }
})

// внутренний `where` с `required: false`
await User.findAll({
  include: {
    model: Tool,
    as: 'Instruments',
    where: {
      size: {
        [Op.ne]: 'small'
      },
      required: false
    }
  }
})

// использование `where` на верхнем уровне с `required: false`
await User.findAll({
  where: {
    '$Instruments.size$': {
      [Op.ne]: 'small'
    }
  },
  include: {
    model: Tool,
    as: 'Instruments'
  }
})

// использование `where` на верхнем уровне с `required: true`
await User.findAll({
  where: {
    '$Instruments.size$': {
      [Op.ne]: 'small'
    }
  },
  include: {
    model: Tool,
    as: 'Instruments',
    required: true
  }
})
```

Генерируемые `SQL-запросы`:

```sql
--
SELECT [...] FROM `users` AS `user`
INNER JOIN `tools` AS `Instruments` ON
  `user`.`id` = `Instruments`.`userId`
  AND `Instruments`.`size` != 'small';

--
SELECT [...] FROM `users` AS `user`
LEFT OUTER JOIN `tools` AS `Instruments` ON
  `user`.`id` = `Instruments`.`userId`
  AND `Instruments`.`size` != 'small';

--
SELECT [...] FROM `users` AS `user`
LEFT OUTER JOIN `tools` AS `Instruments` ON
  `user`.`id` = `Instruments`.`userId`
WHERE `Instruments`.`size` != 'small';

--
SELECT [...] FROM `users` AS `user`
INNER JOIN `tools` AS `Instruments` ON
  `user`.`id` = `Instruments`.`userId`
WHERE `Instruments`.`size` != 'small';
```

`include` может принимать массив связанных моделей:

```js
Foo.findAll({
  include: [
    {
      model: Bar,
      required: true
    },
    {
      model: Baz,
      where: {
        /* ... */
      }
    },
    Qux // сокращение для `{ model: Qux }`
  ]
})
```

**Нетерпеливая загрузка в случае с отношениями многие-ко-многим**

В данном случае `Sequelize` автоматически добавляет соединительную таблицу:

```js
const Foo = sequelize.define('Foo', { name: DataTypes.STRING })
const Bar = sequelize.define('Bar', { name: DataTypes.STRING })
Foo.belongsToMany(Bar, { through: 'Foo_Bar' })
Bar.belongsToMany(Foo, { through: 'Foo_Bar' })

await sequelize.sync()
const foo = await Foo.create({ name: 'foo' })
const bar = await Bar.create({ name: 'bar' })
await foo.addBar(bar)
const fetchedFoo = Foo.findOne({ include: Bar })
copnsole.log(JSON.stringify(fetchedFoo, null, 2))
/*
{
  "id": 1,
  "name": "foo",
  "Bars": [
    {
      "id": 1,
      "name": "bar",
      "Foo_Bar": {
        "FooId": 1,
        "BarId": 1
      }
    }
  ]
}
*/
```

Настройка `attributes` позволяет определять включаемые в ответ поля соединительной таблицы:

```js
Foo.findAll({
  include: [
    {
      model: Bar,
      through: {
        attributes: [
          /* атрибуты соединительной таблицы */
        ]
      }
    }
  ]
})
```

В случае, когда нам не нужны такие поля, в `attributes` передается пустой массив:

```js
Foo.findOne({
  include: {
    model: Bar,
    attributes: []
  }
})
/*
{
  "id": 1,
  "name": "foo",
  "Bars": [
    {
      "id": 1,
      "name": "bar"
    }
  ]
}
*/
```

Включаемые поля соединительной таблицы можно фильтровать с помощью настройки `where`:

```js
User.findAll({
  include: [
    {
      model: Project,
      through: {
        where: {
          completed: true
        }
      }
    }
  ]
})
```

Генерируемый `SQL-запрос` (`sqlite`):

```sql
SELECT
  `User`.`id`,
  `User`.`name`,
  `Projects`.`id` AS `Projects.id`,
  `Projects`.`name` AS `Projects.name`,
  `Projects->User_Project`.`completed` AS `Projects.User_Project.completed`,
  `Projects->User_Project`.`UserId` AS `Projects.User_Project.UserId`,
  `Projects->User_Project`.`ProjectId` AS `Projects.User_Project.ProjectId`
FROM `Users` AS `User`
LEFT OUTER JOIN `User_Projects` AS `Projects->User_Project` ON
  `User`.`id` = `Projects->User_Project`.`UserId`
LEFT OUTER JOIN `Projects` AS `Projects` ON
  `Projects`.`id` = `Projects->User_Project`.`ProjectId` AND
  `Projects->User_Project`.`completed` = 1;
```

Для включения всех связанных моделей используются настройки `all` и `nested`:

```js
// получаем все модели, связанные с `User`
User.findAll({ include: { all: true } })

// получаем все модели, связанные с `User`, вместе со связанными с ними моделями
User.findAll({ include: { all: true, nested: true } })
```

**Сортировка связанных экземпляров при нетерпеливой загрузке**

Для сортировки связанных экземпляров используется настройка `order` (на верхнем уровне):

```js
Company.findAll({
  include: Division,
  order: [
    // массив для сортировки начинается с модели
    // затем следует название поля и порядок сортировки
    [Division, 'name', 'ASC']
  ]
})

Company.findAll({
  include: Division,
  order: [[Division, 'name', 'DESC']]
})

Company.findAll({
  // с помощью синонима
  include: { model: Division, as: 'Div' },
  order: [[{ model: Division, as: 'Div' }, 'name', 'DESC']]
})

Company.findAll({
  // несколько уровней вложенности
  include: {
    model: Division,
    include: Department
  },
  order: [[Division, Department, 'name', 'DESC']]
})
```

В случае с отношениями многие-ко-многим, у нас имеется возможность выполнять сортировку по атрибутам соединительной таблицы. Предположим, что между моделями `Division` и `Department` существуют такие отношения, а соединительная таблица между ними называется `DepartmentDivision`:

```js
Company.findAll({
  include: {
    model: Division,
    include: Department
  },
  order: [[Division, DepartmentDivision, 'name', 'ASC']]
})
```

**Вложенная нетерпеливая загрузка**

Вложенная нетерпеливая загрузка может использоваться для загрузки всех связанных экземпляров связанного экземпляра:

```js
const users = await User.findAll({
  include: {
    model: Tool,
    as: 'Instruments',
    include: {
      model: Teacher,
      include: [
        /* и т.д. */
      ]
    }
  }
})
console.log(JSON.stringify(users, null, 2))
/*
[{
  "name": "John Smith",
  "id": 1,
  "Instruments": [{ // ассоциация 1:M и N:M
    "name": "Scissor",
    "id": 1,
    "userId": 1,
    "Teacher": { // ассоциация 1:1
      "name": "Jimi Hendrix"
    }
  }]
}]
*/
```

Данный запрос выполняет внешнее соединение (`OUTER JOIN`). Применение настройки `where` к связанной модели произведет внутреннее соединение (`INNER JOIN`) - будут возвращены только экземпляры, которые имеют совпадающие подмодели. Для получения всех родительских экземпляров используется настройка `required: false`:

```js
User.findAll({
  include: [
    {
      model: Tool,
      as: 'Instruments',
      include: [
        {
          model: Teacher,
          where: {
            school: 'Woodstock Music School'
          },
          required: false
        }
      ]
    }
  ]
})
```

Данный запрос вернет всех пользователей и их инструменты, но только тех учителей, которые связаны с `Woodstock Music School`.

Утилита `findAndCountAll()` поддерживает `include`. При этом, только модели, помеченные как `required`, будут учитываться `count`.

```js
User.findAndCountAll({
  include: [{ model: Profile, required: true }],
  limit: 3
})
```

В данном случае мы получим 3 пользователей, у которых есть профили. Если мы опустим `required`, то получим 3 пользователей, независимо от того, имеется у них профиль или нет. Включение `where` в `include` автоматически делает его обязательным.

```js
User.findAndCountAll({
  include: [{ model: Profile, where: { active: true } }],
  limit: 3
})
```

### Создание экземпляров с ассоциациями

Экземпляр может быть создан сразу с вложенной ассоциацией. Однако, выполнение обновлений и удалений вложенных объектов в настоящее время не поддерживается.

**`belongsTo()`, `hasMany()`, `hasOne()`**

Рассмотрим пример:

```js
const Product = sequelize.define('product', {
  title: DataTypes.STRING
})
const User = sequelize.define('user', {
  firstName: DataTypes.STRING,
  lastName: DataTypes.STRING
})
const Address = sequelize.define('address', {
  type: DataTypes.STRING,
  line1: DataTypes.STRING,
  line2: DataTypes.STRING,
  city: DataTypes.STRING,
  state: DataTypes.STRING,
  zip: DataTypes.STRING
})
// сохраняем значения, возвращаемые при создании ассоциации для дальнейшего использования
Product.User = Product.belongsTo(User)
User.Address = User.hasMany(Address)
```

Новый `Product`, `User` и один или более `Address` могут быть созданы одновременно:

```js
const product = await Product.create(
  {
    title: 'Product',
    user: {
      firstName: 'John',
      lastName: 'Smith',
      addresses: [
        {
          type: 'home',
          line1: 'street',
          city: 'city',
          state: 'state',
          zip: '12345'
        }
      ]
    }
  },
  {
    include: [
      {
        assosiation: Product.User,
        include: [User.Addresses]
      }
    ]
  }
)
```

_Обратите внимание_: наша модель называется `user` с маленькой буквы `u`. Это означает, что свойство объекта также должно называться `user`. Если бы мы определили модель как `User`, то для соответствующего свойства нужно было бы использовать `User`. То же самое касается `addresses`, учитывая плюрализацию (перевод во множетвенное число).

Последний пример может быть расширен для поддержки ассоциаций:

```js
const Creator = Product.belongsTo(User, { as: 'creator' })

const product = await Product.create(
  {
    title: 'Chair',
    creator: {
      firstName: 'John',
      lastName: 'Smith'
    }
  },
  {
    include: [Creator]
  }
)
```

Имеется возможность связать продукт с несколькими тегами. Соответствующая настройка может выглядеть так:

```js
const Tag = sequelize.define('tag', {
  name: DataTypes.STRING
})
Product.hasMany(Tag)
// или `belongsToMany()`
```

Теперь создадим продукт с несколькими тегами:

```js
const product = await Product.create(
  {
    id: 1,
    title: 'Chair',
    tags: [{ name: 'Alpha' }, { name: 'Beta' }]
  },
  {
    include: [Tag]
  }
)
```

И с поддержкой синонимов:

```js
const Categories = Product.hasMany(Tag, { as: 'categories' })

const product = awaity Product.create({
  id: 1,
  title: 'Chair',
  categories: [
    { id: 1, name: 'Alpha' },
    { id: 2, name: 'Beta' }
  ]
}, {
  include: [{
    association: Categories,
    as: 'categories'
  }]
})
```

### Продвинутые ассоциации M:N

Начнем с создания ассоциации многие-ко-многим между моделями `User` и `Profile`:

```js
const User = sequelize.define(
  'user',
  {
    username: DataTypes.STRING,
    points: DataTypes.INTEGER
  },
  { timestamps: false }
)
const Profile = sequelize.define(
  'profile',
  {
    name: DataTypes.STRING
  },
  { timastamps: false }
)

User.belongsToMany(Profile, { through: 'User_Profiles' })
Profile.belongsToMany(User, { through: 'User_Profiles' })
```

Передавая строку в `through`, мы просим `Sequelize` автоматически создать модель - соединительную таблицу `User_Profiles`, содержащую 2 колонки: `userId` и `profileId`. В эти колонки будут записываться уникальные композиционные (unique composite) ключи.

Определение соединительной таблицы самостоятельно имеет некоторые преимущества по сравнению с ее автоматической генерацией. Мы, например, можем определять дополнительные атрибуты в такой таблице:

```js
const User_Profile = sequelize.define(
  'User_Profile',
  {
    selfGranted: DataTypes.BOOLEAN
  },
  { timestamps: false }
)
```

После этого мы можем получать дооплнительную информацию из соединительной таблицы. Например, при вызове `user.addProfile()` мы можем передавать значения для дополнительной колонки с помощью настройки `through`:

```js
const amidala = await User.create({ username: 'p4dm3', points: 1000 })
const queen = await Profile.create({ name: 'Queen' })
await amidala.addProfile(queen, { through: { selfGranted: false } })
```

Как отмечалось, все отношения могут быть определены в одном вызове `create()`.

```js
const amidala = await User.create(
  {
    username: 'p4dm3',
    points: 1000,
    profiles: [
      {
        name: 'Queen',
        User_Profile: {
          selfGranted: true
        }
      }
    ]
  },
  {
    include: Profile
  }
)
```

Вероятно, вы заметили, что в таблице `User_Profiles` отсутствует поле `id`. Дело в том, что такая таблица содержит уникальный композиционный ключ, название которого генерируется автоматически, но это можно изменить с помощью настройки `uniqueKey`:

```js
User.belongsToMany(Profile, {
  through: User_Profile,
  uniqueKey: 'customUnique'
})
```

Также вместо уникального, в соединительной таблице можно определить первичный ключ:

```js
const User_Profile = sequelize.define(
  'User_Profile',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    selfGranted: DataTypes.BOOLEAN
  },
  { timestamps: false }
)
```

**Ассоциация "супер многие-ко-многим"**

Наши модели будут выглядеть так:

```js
const User = sequelize.define(
  'user',
  {
    username: DataTypes.STRING,
    points: DataTypes.INTEGER
  },
  { timestamps: false }
)

const Profile = sequelize.define(
  'profile',
  {
    name: DataTypes.STRING
  },
  { timestamps: false }
)

// соединительная таблица
const Grant = sequelize.define(
  'grant',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    selfGranted: DataTypes.BOOLEAN
  },
  { timestamps: false }
)
```

Определяем отношения многие-ко-многим между моделями `User` и `Profile` через модель `Grant`:

```js
User.belongsToMany(Profile, { through: Grant })
Profile.belongsToMany(User, { through: Grant })
```

Что если вместо определения отношения многие-ко-многим мы сделаем так?

```js
// определяем отношение один-ко-многим между `User` и `Grant`
User.hasMany(Grant)
Grant.belongsTo(User)

// определяем отношение один-ко-многим между `Profile` и `Grant`
Profile.hasMany(Grant)
Grant.belongsTo(Profile)
```

Результат будет таким же! Это объясняется тем, что `User.hasMany(Grant)` и `Profile.hasMany(Grant)` запишут `userId` и `profileId` в `Grant`.

Это показывает, что отношения многие-ко-многим не сильно отличаются от двух ассоциаций один-ко-многим. Единственным отличием между ними является то, как будет работать нетерпеливая загрузка:

```js
// многие-ко-многим позволяет делать так
User.findAll({ include: Profile })
Profile.findAll({ include: User })
// но не так
User.findAll({ include: Grant })
Profile.findAll({ include: Grant })
Grant.findAll({ include: User })
Grant.findAll({ include: Profile })

// с другой стороны, пара ассоциаций один-ко-многим позволяет делать следующее
User.findAll({ include: Grant })
Profile.findAll({ include: Grant })
Grant.findAll({ include: User })
Grant.findAll({ include: Profile })
// но не так
User.findAll({ include: Profile })
Profile.findAll({ include: User })

// хотя мы можем имитировать нечто похожее
User.findAll({
  include: {
    model: Grant,
    include: Profile
  }
})
/*
  Это похоже на `User.findAll({ include: Profile })`, но
  структура результирующего объекта будет немного другой.
  Вместо `user.profiles[].grant` мы получим `user.grants[].profiles[]`
*/
```

На самом деле, для успешного выполнения всех указанных выше операций достаточно скомбинировать оба подхода:

```js
User.belongsToMany(Profile, { through: Grant })
Profile.belongsToMany(User, { through: Grant })
User.hasMany(Grant)
Grant.belongsTo(User)
Profile.hasMany(Grant)
Grant.belongsTo(Profile)

// все работает
User.findAll({ include: Profile })
Profile.findAll({ include: User })
User.findAll({ include: Grant })
Profile.findAll({ include: Grant })
Grant.findAll({ include: User })
Grant.findAll({ include: Profile })
```

Это позволяет выполнять все виды вложенных включений:

```js
User.findAll({
  include: [
    {
      model: Grant,
      include: [User, Profile]
    },
    {
      model: Profile,
      include: {
        model: User,
        include: {
          model: Grant,
          include: [User, Profile]
        }
      }
    }
  ]
})
```

**Синонимы и кастомные названия для ключей**

В случае с ассоциацией многие-ко-многим синонимы определяются следующим образом:

```js
Product.belongsToMany(Category, { as: 'groups', through: 'product_categories' })
Category.belongsToMany(Product, { as: 'items', through: 'product_categories' })

// НЕ работает
await Product.findAll({ include: Category })

// работает
await Product.findAll({
  include: {
    model: Category,
    as: 'groups'
  }
})

// это тоже работает
await Product.findAll({ include: 'groups' })
```

Вот как выглядит `SQL-запрос` на создание таблицы `product_categories`:

```sql
CREATE TABLE IF NOT EXISTS `product_categories` (
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  `productId` INTEGER NOT NULL REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  `categoryId` INTEGER NOT NULL REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  PRIMARY KEY (`productId`, `categoryId`)
);
```

Как мы видим, внешними ключами являются `productId` и `categoryId`. Для изменения этих названий используются настройки `foreignKey` и `otherKey`, соответственно (`foreignKey` определяет ключ для модели-источника, а `otherKey` - для целевой модели).

```js
Product.belongsToMany(Category, {
  through: 'product_categories',
  foreignKey: 'objectId', // заменяет `productId`
  otherKey: 'typeIf' // заменяет `categoryId`
})
Category.belongsToMany(Product, {
  through: 'product_categories',
  foreignKey: 'typeId', //  заменяет `categoryId`
  otherKey: 'objectId' //  заменяет `productId`
})
```

Соответствующий `SQL-запрос`:

```sql
CREATE TABLE IF NOT EXISTS `product_categories` (
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  `objectId` INTEGER NOT NULL REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  `typeId` INTEGER NOT NULL REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  PRIMARY KEY (`objectId`, `typeId`)
);
```

_Обратите внимание_: настройки `foreignKey` и `otherKey` должны определяться в обоих вызовах. Если определить их только в одном вызове, поведение `Sequelize` будет непредсказуемым.

`Sequelize` также поддерживает циклические отношения многие-ко-многим:

```js
Person.belongsToMany(Person, { as: 'Children', through: 'PersonChildren' })
// это создаст таблицу `PersonChildren` с идентификаторами объектов
```

**Определение возвращаемых атрибутов соединительной таблицы**

По умолчанию при нетерпеливой загрузке в случае с ассоциацией многие-ко-многим возвращается такой объект (`User.findOne({ include: Profile })`):

```js
{
  "id": 4,
  "username": "p4dm3",
  "points": 1000,
  "profiles": [
    {
      "id": 6,
      "name": "queen",
      "grant": {
        "userId": 4,
        "profileId": 6,
        "selfGranted": false
      }
    }
  ]
}
```

Внешний объект - это `User`, у этого объекта есть поле `profiles` - массив `Profile`, у каждого `Profile` есть дополнительное поле `grant` - экземпляр `Grant`.

Для того, чтобы получить только некоторые поля из соединительной таблицы используется настройка `attributes`:

```js
User.findOne({
  include: {
    model: Profile,
    through: {
      attributes: ['selfGranted']
    }
  }
})
/*
{
  "id": 4,
  "username": "p4dm3",
  "points": 1000,
  "profiles": [
    {
      "id": 6,
      "name": "queen",
      "grant": {
        "selfGranted": false
      }
    }
  ]
}
*/
```

Для исключения поля `grant` из результатов запроса можно указать `attributes: []`.

При использовании миксинов (например, `user.getProfiles()`), вместо методов для поиска (например, `User.findAll()`), для фильтрации полей соединительной таблицы используется настройка `joinTableAttributes`:

```js
user.getProfiles({ joinTableAttributes: ['selfGranted'] })
/*
[
  {
    "id": 6,
    "name": "queen",
    "grant": {
      "selfGranted": false
    }
  }
]
*/
```

**Ассоциация многие-ко-многим-ко-многим и т.д.**

Предположим, что мы моделируем игру. У нас есть игроки и команды. Команды играют в игры. Игроки могут менять команды в середине чемпионата (но не в середине игры). В одной игре участвует две команды, в каждой команде имеется свой набор игроков (для текущей игры).

Начнем с определения соответствующих моделей:

```js
const Player = sequelize.define('Player', { username: DataTypes.STRING })
const Team = sequelize.define('Team', { name: DataTypes.STRING })
const Game = sequelize.define('Game', { name: DataTypes.INTEGER })
```

Вопрос: как определить ассоциацию между этими моделями?

Первое, что можно заметить:

- одна игра имеет несколько связанных с ней команд (тех, которые играют в этой игре)
- одна команда может принимать участие в нескольких играх

Это означает, что между моделями `Game` и `Team` должны существовать отношения многие-ко-многим. Реализуем супер-вариант названной ассоциации (как в предыдущем примере):

```js
const GameTeam = sequelize.define('GameTeam', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  }
})
Team.belongsToMany(Game, { through: GameTeam })
Game.belongsToMany(Team, { through: GameTeam })
GameTeam.belongsTo(Game)
GameTeam.belongsTo(Team)
Game.hasMany(GameTeam)
Team.hasMany(GameTeam)
```

С игроками все несколько сложнее. Набор игроков, формирующих команду, зависит не только от команды, но также от того, в какой игре данная команда участвует. Поэтому нам не нужна ассоциация многие-ко-многим между `Player` и `Team`. Нам также не нужна ассоциация многие-ко-многим между `Player` и `Game`. Вместо привязки `Player` к одной из указанных моделей, нам требуется ассоциация между `Player` и чем-то вроде "парного ограничения команда-игра", поскольку именно пара (команда + игра) определяет набор игроков. Внезапно, то, что мы искали, оказывается соединительной таблицей `GameTeam`! Учитывая, что конкретная пара команда-игра определяет несколько игроков и один игрок может участвовать в нескольких парах, нам требуется ассоциация многие-ко-многим между `Player` и `GameTeam`.

Для обеспечения максимальной гибкости снова прибегнем к супер-версии M:N:

```js
const PlayerGameTeam = sequelize.define('PlayerGameTeam', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  }
})
Player.belongsToMany(GameTeam, { through: PlayerGameTeam })
GameTeam.belongsToMany(Player, { through: PlayerGameTeam })
PlayerGameTeam.belongsTo(Player)
PlayerGameTeam.belongsTo(GameTeam)
Player.hasMany(PlayerGameTeam)
GameTeam.hasMany(PlayerGameTeam)
```

Эта ассоциация делает именно то, что мы хотим.

Полный пример выглядит так:

```js
const { Sequelize, Op, Model, DataTypes } = require('sequelize')

const sequelize = new Sequelize('sqlite::memory:', {
  define: { timestamps: false } // Просто, чтобы не повторяться
})

const Player = sequelize.define('Player', { username: DataTypes.STRING })
const Team = sequelize.define('Team', { name: DataTypes.STRING })
const Game = sequelize.define('Game', { name: DataTypes.INTEGER })

// Ассоциация супер-многие-ко-многим между `Game` и `Team`
const GameTeam = sequelize.define('GameTeam', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  }
})
Team.belongsToMany(Game, { through: GameTeam })
Game.belongsToMany(Team, { through: GameTeam })
GameTeam.belongsTo(Game)
GameTeam.belongsTo(Team)
Game.hasMany(GameTeam)
Team.hasMany(GameTeam)

// Ассоциация супер-многие-ко-многим между `Player` и `GameTeam`
const PlayerGameTeam = sequelize.define('PlayerGameTeam', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  }
})
Player.belongsToMany(GameTeam, { through: PlayerGameTeam })
GameTeam.belongsToMany(Player, { through: PlayerGameTeam })
PlayerGameTeam.belongsTo(Player)
PlayerGameTeam.belongsTo(GameTeam)
Player.hasMany(PlayerGameTeam)
GameTeam.hasMany(PlayerGameTeam)
;(async () => {
  await sequelize.sync()
  // Создаем игроков
  await Player.bulkCreate([
    { username: 's0me0ne' },
    { username: 'empty' },
    { username: 'greenhead' },
    { username: 'not_spock' },
    { username: 'bowl_of_petunias' }
  ])
  // Создаем игры
  await Game.bulkCreate([
    { name: 'The Big Clash' },
    { name: 'Winter Showdown' },
    { name: 'Summer Beatdown' }
  ])
  // Создаем команды
  await Team.bulkCreate([
    { name: 'The Martians' },
    { name: 'The Earthlings' },
    { name: 'The Plutonians' }
  ])

  // Начнем с определения того, какая команда в какой игре участвует. Это можно сделать
  // несколькими способами, например, посредством вызова `setTeams()` для каждой игры.
  // Однако, для чистоты эксперимента, мы используем явные вызовы `create()`
  await GameTeam.bulkCreate([
    { GameId: 1, TeamId: 1 }, // эта `GameTeam` получит `id` 1
    { GameId: 1, TeamId: 2 }, // и т.д.
    { GameId: 2, TeamId: 1 },
    { GameId: 2, TeamId: 3 },
    { GameId: 3, TeamId: 2 },
    { GameId: 3, TeamId: 3 }
  ])

  // Теперь определим игроков.
  // Сделаем это только для второй игры (Winter Showdown).
  await PlayerGameTeam.bulkCreate([
    { PlayerId: 1, GameTeamId: 3 }, // s0me0ne играет за The Martians
    { PlayerId: 3, GameTeamId: 3 }, // и т.д.
    { PlayerId: 4, GameTeamId: 4 },
    { PlayerId: 5, GameTeamId: 4 }
  ])

  // После этого мы можем выполнять запросы!
  const game = await Game.findOne({
    where: {
      name: 'Winter Showdown'
    },
    include: {
      model: GameTeam,
      include: [
        {
          model: Player,
          through: { attributes: [] } // Скрываем нежелательные вложенные объекты `PlayerGameTeam` из результатов
        },
        Team
      ]
    }
  })

  console.log(`Обнаружена игра: "${game.name}"`)
  for (let i = 0; i < game.GameTeams.length; i++) {
    const team = game.GameTeams[i].Team
    const players = game.GameTeams[i].Players
    console.log(
      `- Команда "${team.name}" играет в игру "${game.name}" со следующими игроками:`
    )
    console.log(players.map((p) => `--- ${p.username}`).join('\n'))
  }
})()
```

Вывод:

```
Обнаружена игра: "Winter Showdown"
- Команда "The Martians" играет в игру "Winter Showdown" со следующими игроками:
--- s0me0ne
--- greenhead
- Команда "The Plutonians" играет в игру "Winter Showdown" со следующими игроками:
--- not_spock
--- bowl_of_petunias
```

### Область видимости ассоциаций

Область видимости ассоциаций (assosiation scopes) похожа на области видимости моделей в том, что обе автоматически применяют к запросам такие вещи, как предложение `where`; разница между ними состоит в том, что область модели применяется к вызовам статических методов для поиска, а область ассоциации - к вызовам поисковых методов экземпляра (таким как миксины).

Пример применения области ассоциации для отношений один-ко-многим:

```js
// настройка
const Foo = sequelize.define('foo', { name: DataTypes.STRING })
const Bar = sequelize.define('bar', { status: DataTypes.STRING })
Foo.hasMany({Bar, {
  scope: {
    status: 'open'
  },
  as: 'openBars'
}})

await sequelize.sync()
const foo = await Foo.create({ name: 'Foo' })

await foo.getOpenBars()
```

Последний вызов приводит к генерации такого запроса:

```sql
SELECT
    `id`, `status`, `createdAt`, `updatedAt`, `fooId`
FROM `bars` AS `bar`
WHERE `bar`.`status` = 'open' AND `bar`.`fooId` = 1;
```

Мы видим, что область ассоциации `{ status: 'open' }` была автоматически добавлена в предложение `WHERE`.

На самом деле, мы можем добиться такого же поведения с помощью стандартной области видимости:

```js
Bar.addScope('open', {
  where: {
    status: 'open',
  },
})
Foo.hasMany(Bar)
Foo.hasMany(Bar.scope('open'), { as: 'openBars' })
```

После этого, вызов `foo.getOpenBars()` вернет аналогичный результат.

### Полиморфные ассоциации

Полиморфная ассоциация (polymorphic assosiation) состоит из двух и более ассоциаций, взаимодействующих с одним внешним ключом.

Предположим, что у нас имеется три модели: `Image`, `Video` и `Comment`. Первые две модели - это то, что может разместить пользователь. Мы хотим разрешить комментирование этих вещей. На первый вгляд, может показаться, что требуются такие ассоциации:

- ассоциация один-ко-многим между `Image` и `Comment`

```js
Image.hasMany(Comment)
Comment.belongsTo(Image)
```

- ассоциация один-ко-многим между `Video` и `Comment`

```js
Video.hasMany(Comment)
Comment.belongsTo(Video)
```

Однако, это может привести к тому, что `Sequelize` создаст в таблице `Comment` два внешних ключа: `imageId` и `videoId`. Такая структура означает, что комментарий добавляется одновременно к одному изображению и одному видео, что не соответствует действительности. Нам нужно, чтобы `Comment` указывал на единичный `Commentable`, абстрактную полиморфную сущность, представляющую либо `Image`, либо `Video`.

Перед настройкой такой ассоциации, рассмотрим пример ее использования:

```js
const image = await Image.create({ url: 'http://example.com' })
const comment = await image.createComment({ content: 'Круто!' })

copnsole.log(comment.commentableId === image.id) //  true

// Мы можем получать информацию о том, с каким типом `commentable` связан комментарий
console.log(comment.commentableType) // Image

// Мы можем использовать полиморфный метод для извлечения связанного `commentable`,
// независимо от того, чем он является, `Image` или `Video`
const associatedCommentable = await comment.getCommentable()
// Обратите внимание: `associatedCommentable` - это не то же самое, что `image`
```

__Создание полиассоциации один-ко-многим__

Для настройки полиассоциации для приведенного выше примера (полиассоциации один-ко-многим) необходимо выполнить следующие шаги:

- определить строковое поле `commentableType` в модели `Comment`
- определить ассоциацию `hasMany` и `belongsTo` между `Image` / `Video` и `Comment`
  - отключить ограничения (`{ constraints: false }`), поскольку один и тот же внешний ключ будет ссылаться на несколько таблиц
  - определить соответствущую область видимости ассоциации
- для поддержки ленивой загрузки - определить новый метод экземпляра `getCommentable()` в модели `Comment`, который под капотом будет вызывать правильный миксин для получения соответствующего `commentable`
- для поддержки нетерпеливой загрузки - определить хук `afterFind()` в модели `Comment`, автоматически заполняющий поле `commentable` каждого экземпляра
- для предотвращения ошибок при нетерпеливой загрузке, можно удалять поля `image` и `video` из экземпляров комментария в хуке `afterFind()`, оставляя в них только абстрактное поле `commentable`

```js
// Вспомогательная функция
const capitilize = ([first, ...rest]) =>
  `${first.toUpperCase()}${rest.join('').toLowerCase()}`

const Image = sequelize.define('image', {
  title: DataTypes.STRING,
  url: DataTypes.STRING,
})
const Video = sequelize.define('video', {
  title: DataTypes.STRING,
  text: DataTypes.STRING,
})

// в данном случае нам необходимо создать статическое поле, поэтому мы используем расширение `Model`
class Comment extends Model {
  getCommentable(options) {
    if (!this.commentableType) return Promise.resolve(null)
    const mixinMethodName = `get${capitilize(this.commentableType)}`
    return this[mixinMethodName](options)
  }
}
Comment.init(
  {
    title: DataTypes.STRING,
    commentableId: DataTypes.INTEGER,
    commentableType: DataTypes.STRING,
  },
  { sequelize, modelName: 'comment' }
)

Image.hasMany(Comment, {
  foreignKey: 'commentableId',
  constraints: false,
  scope: {
    commentableType: 'image',
  },
})
Comment.belongsTo(Image, { foreignKey: 'commentableId', constraints: false })

Video.hasMany(Comment, {
  foreignKey: 'commentableId',
  constraints: false,
  scope: {
    commentableType: 'video',
  },
})
Comment.belongsTo(Video, { foreignKey: 'commentableId', constraints: false })

Comment.addHook('afterFind', (findResult) => {
  if (!Array.isArray(findResult)) findResult = [findResult]
  for (const instance of findResult) {
    if (instance.commentableType === 'image' && instance.image !== undefined) {
      instance.commentable = instance.image
    } else if (
      instance.commentableType === 'video' &&
      instance.video !== undefined
    ) {
      instance.commentable = instance.video
    }
    // Для предотвращения ошибок
    delete instance.image
    delete inctance.dataValues.image
    delete instance.video
    delete instance.dataValues.video
  }
})
```

Поскольку колонка `commentableId` ссылается на несколько таблиц (в данном случае две), мы не можем применить к ней ограничение `REFERENCES`. Поэтому мы указываем `constraints: false`.

Обратите внимание на следующее:

- ассоциация `Image -> Comment` определяет область `{ commentableType: 'image' }`
- ассоциация `Video -> Comment` определяет область `{ commentableType: 'video' }`

Эти области автоматически применяются при использовании ассоциативных функций. Несколько примеров:

- `image.getComments()`

```sql
SELECT 'id', 'title', 'commentableType', 'commentableId', 'createdAt', 'updatedAt'
FROM 'comments' AS 'comment'
WHERE 'comment'.'commentableType' = 'image' AND 'comment'.'commentableId' = 1;
```

Мы видим, что `'comment'.'commentableType' = 'image'` была автоматически добавлена в предложение `WHERE`. Это именно то, чего мы хотели добиться.

- `image.createComment({ title: 'Круто!' })`

```sql
INSERT INTO 'comments' (
  'id', 'title', 'commentableType', 'commentableId', 'createdAt', 'updatedAt'
) VALUES (
  DEFAULT, 'Круто!', 'image', 1,
  '[timestamp]', '[timestamp]'
) RETURNING *;
```

- `image.addComment(comment)`

```sql
UPDATE 'comments'
SET 'commentableId'=1, 'commentableType'='image', 'updatedAt'='2018-04-17 05:38:43.948 +00:00'
WHERE 'id' IN (1)
```

**Полиморфная ленивая загрузка**

Метод экземпляра `getCommentable()` предоставляет абстракцию для ленивой загрузки связанного `commentable` - комментария, принадлежащего `Image` или `Video`.

Это работает благодаря преобразованию строки `commentableType` в вызов правильного миксина (`getImage()` или `getVideos()`, соответственно).

Обратите внимание, что приведенная выше реализация `getCommentable()`:

- возвращает `null` при отсутствии ассоциации
- позволяет передавать объект с настройками в `getCommentable(options)`, подобно любому другому (стандартному) методу. Это может пригодиться, например, при определении условий или включений.

**Полиморфная нетерпеливая загрузка**

Теперь мы хотим выполнить полиморфную нетерпеливую загрузку связанных `commentable` для одного (или более) комментария:

```js
const comment = await Comment.findOne({
  include: [
    /* Что сюда поместить? */
  ],
})
console.log(comment.commentable) // Наша цель
```

Решение состоит во включении `Image` и `Video` для того, чтобы хук `afterFind()` мог автоматически добавить поле `commentable` в экземпляр.

Например:

```js
const comments = await Comment.findAll({
  include: [Image, Video],
})
for (const comment of comments) {
  const message = `Найден комментарий #${comment.id} с типом '${comment.commentableType}':\n`
  console.log(message, comment.commentable.toJSON())
}
```

Вывод:

```
Найден комментарий #1 с типом 'image':
{
  id: 1,
  title: 'Круто!',
  url: 'http://example.com',
  createdAt: [timestamp],
  updatedAt: [timestamp]
}
```

__Настройка полиассоциации многие-ко-многим__

Предположим, что вместо комментариев у нас имеются теги. Соответственно, вместо `commentables` у нас будут `taggables`. Один `taggable` может иметь несколько тегов, в то же время один тег может быть помещен в несколько `taggable`.

Для настройки рассматриваемой полиассоциации необходимо выполнить следующие шаги:

- явно создать соединительную модель, определив в ней два внешних ключа: `tagId` и `taggableId` (данная таблица будет соединять `Tag` и `taggable`)
- определить в соединительной таблице строковое поле `taggableType`
- определить ассоциацию `belongsToMany()` между двумя моделями и `Tag`:
- отключить ограничения (`{ constraints: false }`), поскольку один и тот же внешний ключ будет ссылаться на несколько таблиц
- определить соответствующие области видимости ассоциаций
- определить новый метод экземпляра `getTaggables()` в модели `Tag`, который под капотом будет вызывать правильный миксин для получения соответствующих `taggables`

```js
class Tag extends Model {
  getTaggables(options) {
    const images = await this.getImages(options)
    const videos = this.getVideos(options)
    // Объединяем изображения и видео в один массив `taggables`
    return images.concat(videos)
  }
}
Tag.init({
  name: DataTypes.STRING
}, { sequelize, moelName: 'tag' })

// Явно определяем соединительную таблицу
const Tag_Taggable = sequelize.define('tag_taggable', {
  tagId: {
    type: DataTypes.INTEGER,
    unique: 'tt_unique_constraint'
  },
  taggableId: {
    type: DataTypes.INTEGER,
    unique: 'tt_unique_contraint'
  },
  taggableType: {
    type: DataTypes.STRING,
    unique: 'tt_unique_constraint'
  }
})

Image.belongsToMany(Tag, {
  through: {
    model: Tag_Taggable,
    unique: false,
    scope: {
      taggableType: 'image'
    }
  },
  foreignKey: 'taggableId',
  constraints: false
})
Tag.belongsToMany(Image, {
  through: {
    model: Tag_Taggable,
    unique: false,
    foreignKey: 'tagId',
    constraints: false
  }
})

Video.belongsToMany(Tag, {
  through: {
    model: Tag_Taggable,
    unique: false,
    scope: {
      taggableType 'video'
    }
  },
  foreignKey: 'taggableId',
  constraints: false
})
Tag.belongsToMany(Video, {
  through: {
    model: Tag_Taggable,
    unique: false
  },
  foreignKey: 'tagId',
  constraints: false
})
```

- `image.getTags()`

```sql
SELECT
  `tag`.`id`,
  `tag`.`name`,
  `tag`.`createdAt`,
  `tag`.`updatedAt`,
  `tag_taggable`.`tagId` AS `tag_taggable.tagId`,
  `tag_taggable`.`taggableId` AS `tag_taggable.taggableId`,
  `tag_taggable`.`taggableType` AS `tag_taggable.taggableType`,
  `tag_taggable`.`createdAt` AS `tag_taggable.createdAt`,
  `tag_taggable`.`updatedAt` AS `tag_taggable.updatedAt`
FROM `tags` AS `tag`
INNER JOIN `tag_taggables` AS `tag_taggable` ON
  `tag`.`id` = `tag_taggable`.`tagId` AND
  `tag_taggable`.`taggableId` = 1 AND
  `tag_taggable`.`taggableType` = 'image';
```

- `tag.getTaggables()`

```sql
SELECT
  `image`.`id`,
  `image`.`url`,
  `image`.`createdAt`,
  `image`.`updatedAt`,
  `tag_taggable`.`tagId` AS `tag_taggable.tagId`,
  `tag_taggable`.`taggableId` AS `tag_taggable.taggableId`,
  `tag_taggable`.`taggableType` AS `tag_taggable.taggableType`,
  `tag_taggable`.`createdAt` AS `tag_taggable.createdAt`,
  `tag_taggable`.`updatedAt` AS `tag_taggable.updatedAt`
FROM `images` AS `image`
INNER JOIN `tag_taggables` AS `tag_taggable` ON
  `image`.`id` = `tag_taggable`.`taggableId` AND
  `tag_taggable`.`tagId` = 1;

SELECT
  `video`.`id`,
  `video`.`url`,
  `video`.`createdAt`,
  `video`.`updatedAt`,
  `tag_taggable`.`tagId` AS `tag_taggable.tagId`,
  `tag_taggable`.`taggableId` AS `tag_taggable.taggableId`,
  `tag_taggable`.`taggableType` AS `tag_taggable.taggableType`,
  `tag_taggable`.`createdAt` AS `tag_taggable.createdAt`,
  `tag_taggable`.`updatedAt` AS `tag_taggable.updatedAt`
FROM `videos` AS `video`
INNER JOIN `tag_taggables` AS `tag_taggable` ON
  `video`.`id` = `tag_taggable`.`taggableId` AND
  `tag_taggable`.`tagId` = 1;
```

**Применение области ассоциации к целевой модели**

Область ассоциации может применяться не только к соединительной таблице, но и к целевой модели.

Добавим тегам статус. Для получения всех тегов со статусом `pending` определим еще одну ассоциацию `belongsToMany()` между `Image` и `Tag`, применив область ассоциации как к соединительной таблице, так и к целевой модели:

```js
Image.belongsToMany(Tag, {
  through: {
    model: Tag_Taggable,
    unique: false,
    scope: {
      taggableType: 'image',
    },
  },
  scope: {
    status: 'pending',
  },
  as: 'pendingTags',
  foreignKey: 'taggableId',
  constraints: false,
})
```

После этого, вызов `image.getPendingTags()` приведет к генерации такого запроса:

```sql
SELECT
  `tag`.`id`,
  `tag`.`name`,
  `tag`.`status`,
  `tag`.`createdAt`,
  `tag`.`updatedAt`,
  `tag_taggable`.`tagId` AS `tag_taggable.tagId`,
  `tag_taggable`.`taggableId` AS `tag_taggable.taggableId`,
  `tag_taggable`.`taggableType` AS `tag_taggable.taggableType`,
  `tag_taggable`.`createdAt` AS `tag_taggable.createdAt`,
  `tag_taggable`.`updatedAt` AS `tag_taggable.updatedAt`
FROM `tags` AS `tag`
INNER JOIN `tag_taggables` AS `tag_taggable` ON
  `tag`.`id` = `tag_taggable`.`tagId` AND
  `tag_taggable`.`taggableId` = 1 AND
  `tag_taggable`.`taggableType` = 'image'
WHERE (
  `tag`.`status` = 'pending'
);
```

Мы видим, что обе области были автоматически применены:

- в `INNER JOIN` было добавлено `tag_taggable.taggableType = 'image'`
- в `WHERE` - `tag.status = 'pending'`

## Транзакции

`Sequelize` поддерживает выполнение двух видов транзакций:

1. Неуправляемые (unmanaged): завершение транзакции и отмена изменений выполняются вручную (путем вызова соответствующих методов)
2. Управляемые (managed): при возникновении ошибки изменения автоматически отменяются, а при успехе транзакции автоматически выполняется фиксация (commit) изменений

**Неуправляемые транзакции**

Начнем с примера:

```js
// Сначала мы запускаем транзакцию и сохраняем ее в переменную
const t = await sequelize.transaction()

try {
  // Затем при выполнении операций передаем транзакцию в качестве соответствующей настройки
  const user = await User.create(
    {
      firstName: 'John',
      lastName: 'Smith',
    },
    { transaction: t }
  )

  await user.addSibling(
    {
      firstName: 'Jane',
      lastName: 'Air',
    },
    { transaction: t }
  )

  // Если выполнение кода достигло этой точки,
  // значит, выполнение операций завершилось успешно -
  // фиксируем изменения
  await t.commit()
} catch (err) {
  // Если выполнение кода достигло этой точки,
  // значит, во время выполнения операций возникла ошибка -
  // отменяем изменения
  await t.rollback()
}
```

**Управляемые тразакции**

Для выполнения управляемой транзакции в `sequelize.transaction()` передается функция обратного вызова. Далее происходит следующее:

- `Sequelize` автоматически запускает транзакцию и создает объект `t`
- Затем выполняется переданный колбек, которому передается `t`
- При возникновении ошибки, изменения автоматически отменяются
- При успехе транзакции, изменения автоматически фиксируются

Таким образом, `sequelize.transaction()` либо разрешается с результатом, возвращаемым колбеком, либо отклоняется с ошибкой.

```js
try {
  const result = await sequelize.transaction(async (t) => {
    const user = await User.create(
      {
        firstName: 'John',
        lastName: 'Smith',
      },
      { transaction: t }
    )

    await user.addSibling(
      {
        firstName: 'Jane',
        lastName: 'Air',
      },
      { transaction: t }
    )

    return user
  })

  // Если выполнение кода достигло этой точки,
  // значит, выполнение операций завершилось успешно -
  // фиксируем изменения
} catch (err) {
  // Если выполнение кода достигло этой точки,
  // значит, во время выполнения операций возникла ошибка -
  // отменяем изменения
}
```

_Обратите внимание_: при выполнении управляемой транзакции, нельзя вручную вызывать методы `commit()` и `rollback()`.

**Автоматическая передача транзакции во все запросы**

В приведенных примерах транзакция передавалась вручную - `{ transaction: t }`. Для автоматической передачи транзакции во все запросы необходимо установить модуль <a href="https://github.com/Jeff-Lewis/cls-hooked">`cls-hooked`</a> (CLS - Continuation Local Storage, "длящееся" локальное хранилище) и инстанцировать пространство имен (namespace):

```js
const cls = require('cls-hooked')
const namespace = cls.createNamespace('my-namespace')
```

Затем следует использовать это пространство имен следующим образом:

```js
const Sequelize = require('sequelize')
Sequelize.useCLS(namespace)

new Sequelize(/* ... */)
```

_Обратите внимание_: мы вызываем метод `useCLS()` на конструкторе, а не на экземпляре. Это означает, что пространство имен будет доступно всем экземплярам, а также, что `CLS` - это "все или ничего", нельзя включить его только для некоторых экземпляров.

`CLS` представляет собой что-то вроде локального хранилища в виде потока для колбеков. На практике это означает, что разные цепочки из колбеков могут использовать локальные переменные из одного пространства `CLS`. После включения `CLS`, `t` автоматически передается при создании транзакции. Поскольку переменные являются частными для цепочки колбеков, одновременно может выполняться несколько транзакций:

```js
sequelize.transaction((t1) => {
  console.log(namespace.get('transaction') === t1) // true
})

sequelize.transaction((t2) => {
  console.log(namespace.get('transaction') === t2) // true
})
```

В большинстве случаев, в явном вызове `namespace.get('transaction')` нет необходимости, поскольку все запросы автоматически получают транзакцию из пространства имен:

```js
sequelize.transaction((t1) => {
  // С включенным CLS пользователь будет создан внутри транзакции
  return User.create({ name: 'John' })
})
```

**Параллельные/частичные транзакции**

С помощью последовательности запросов можно выполнять параллельные транзакции. Также имеется возможность исключать запросы из транзакции. Для управления тем, каким транзакциям принадлежит запрос, используется настройка `transaction` (обратите внимание: `SQLite` не поддерживает одновременное выполнение более одной транзакции).

С включенным `CLS`:

```js
sequelize.transaction((t1) => {
  return sequelize.transaction((t2) => {
    // С включенным `CLS` все запросы здесь по умолчанию будут использовать `t2`
    // Настройка `transaction` позволяет это изменить
    return Promise.all([
      User.create({ name: 'John' }, { transaction: null }),
      User.create({ name: 'Jane' }, { transaction: t1 }),
      User.create({ name: 'Alice' }), // этот запрос будет использовать `t2`
    ])
  })
})
```

**Уровни изоляции**

Возможные уровни изоляции при запуске транзакции:

```js
const { Transaction } = require('sequelize')

Transaction.ISOLATION_LEVELS.READ_UNCOMMITTED
Transaction.ISOLATION_LEVELS.READ_COMMITTED
Transaction.ISOLATION_LEVELS.REPEATABLE_READ
Transaction.ISOLATION_LEVELS.SERIALIZABLE
```

По умолчанию `Sequelize` использует уровень изоляции БД. Для изменения уровня изоляции используется настройка `isolationLevel`:

```js
const { Transaction } = require('sequelize')

await sequelize.transaction(
  {
    isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE,
  },
  async (t) => {
    // ...
  }
)
```

Или на уровне всего приложения:

```js
const sequelize = new Sequelize('sqlite::memory:', {
  isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE,
})
```

**Использование транзакции совместно с другими методами**

Обычно, `transaction` передается в метод вместе с другими настройками в качестве первого аргумента.

Для методов, принимающих значения, таких как `create()`, `update()` и т.п., `transaction` передается в качестве второго аргумента.

```js
await User.create({ name: 'John' }, { transaction: t })

await User.findAll({
  where: {
    name: 'Jane',
  },
  transaction: t,
})
```

**Хук `afterCommit()`**

Объект `transaction` позволяет регистрировать фиксацию изменений. Хук `afterCommit()` может быть добавлен как к управляемым, так и к неуправляемым объектам транзакции:

```js
// Управляемая транзакция
await sequelize.transaction(async (t) => {
  t.afterCommit(() => {
    // ...
  })
})

// Неуправляемая транзакция
const t = await sequelize.transaction()
t.afterCommit(() => {
  // ...
})
await t.commit()
```

колбек, передаваемый в `afterCommit()`, является асинхронным. В данном случае:

- для управляемой транзакции: вызов `sequelize.transaction()` будет ждать его завершения
- для неуправляемой транзакции: вызов `t.commit()` будет ждать его завершения

_Обратите внимание_ на следующее:

- `afterCommit()` не запускается при отмене изменений
- он не модифицирует значение, возвращаемое транзакцией (в отличие от других хуков)

Хук `afterCommit()` можно использовать в дополнение к хукам модели для определения момента сохранения экземпляра и его доступности за пределами транзакции:

```js
User.afterSave((instance, options) => {
  if (options.transaction) {
    // Ожидаем фиксации изменений для уведомления подписчиков о сохранении экземпляра
    options.transaction.afterCommit(() => /* Уведомление */)
    return
  }
})
```

## Хуки

Хуки или события жизненного цикла (hooks) - это функции, которые вызываются до или после вызова методов `Sequelize`. Например, для установки значения модели перед ее сохранением можно использовать хук `beforeUpdate()`.

_Обратите внимание_: хуки могут использоваться только на уровне моделей.

**Доступные хуки**

`Sequelize` предоставляет большое количество хуков. Их полный список можно найти <a href="https://github.com/sequelize/sequelize/blob/v6/lib/hooks.js#L73">здесь</a>. Порядок вызова наиболее распространенных хуков следующий:

```
(1)
  beforeBulkCreate(instances, options)
  beforeBulkDestroy(options)
  beforeBulkUpdate(options)
(2)
  beforeValidate(instance, options)

[... здесь выполняется валидация ...]

(3)
  afterValidate(instance, options)
  validationFailed(instance, options, error)
(4)
  beforeCreate(instance, options)
  beforeDestroy(instance, options)
  beforeUpdate(instance, options)
  beforeSave(instance, options)
  beforeUpsert(values, options)

[... здесь выполняется создание/обновление/удаление ...]

(5)
  afterCreate(instance, options)
  afterDestroy(instance, options)
  afterUpdate(instance, options)
  afterSave(instance, options)
  afterUpsert(created, options)
(6)
  afterBulkCreate(instances, options)
  afterBulkDestroy(options)
  afterBulkUpdate(options)
```

**Определение хуков**

Аргументы в хуки передаются по ссылкам. Это означает, что мы можем модифицировать значения и это отразится на соответствующих инструкциях. Хук может содержать асинхронные операции - в этом случае функция должна возвращать промис.

Существует три способа программного добавления хуков:

```js
// 1) через метод `init()`
class User extends Model {}
User.init(
  {
    username: DataTypes.STRING,
    mood: {
      type: DataTypes.ENUM,
      values: ['счастливый', 'печальный', 'индифферентный'],
    },
  },
  {
    hooks: {
      beforeValidate: (user, options) => {
        user.mood = 'счастливый'
      },
      afterValidate: (user, options) => {
        user.username = 'Ванька'
      },
    },
    sequelize,
  }
)

// 2) через метод `addHook()`
User.addHook('beforeValidate', (user, options) => {
  user.mood = 'счастливый'
})

User.addHook('afterValidate', 'someCustomName', (user, options) => {
  return Promise.reject(
    new Error('К сожалению, я не могу позволить вам этого сделать.')
  )
})

// 3) напрямую
User.beforeCreate(async (user, options) => {
  const hashedPassword = await hashPassword(user.password)
  user.password = hashedPassword
})

User.afterValidate('myAfterHook', (user, options) => {
  user.username = 'Ванька'
})
```

_Обратите внимание_, что удаляться могут только именованные хуки:

```js
const Book = sequelize.define('book', {
  title: DataTypes.STRING,
})

Book.addHook('afterCreate', 'notifyUsers', (book, options) => {
  // ...
})
Book.removeHook('afterCreate', 'notifyUsers')
```

**Глобальные/универсальные хуки**

Глобальными называются хуки, которые выполняются для всех моделей. Особенно полезными такие хуки являются в плагинах. Они определяются двумя способами:

- в настройках конструктора (хуки по умолчанию)

```js
const sequelize = new Sequelize(/*...*/, {
  define: {
    hooks: {
      beforeCreate() {
        // ...
      }
    }
  }
})

// Дефолтные хуки запукаются при отсутствии в модели аналогичных хуков
const User = sequelize.define('user', {})
const Project = sequelize.define('project', {}, {
  hooks: {
    beforeCreate() {
      // ...
    }
  }
})

await User.create({}) // запускается глобальный хук
await Project.create({}) // запускается локальный хук
```

- с помощью `sequelize.addHook()` (постоянные хуки)

```js
sequelize.addHook('beforeCreate', () => {
  // ...
})

// Такой хук запускается независимо от наличия у модели аналогичного хука
const User = sequelize.define('user', {})
const Project = sequelize.define(
  'project',
  {},
  {
    hooks: {
      beforeCreate() {
        // ...
      },
    },
  }
)

await User.create({}) // запускается глобальный хук
await Project.create({}) // сначала запускается локальный хук, затем глобальный
```

**Хуки, связанные с подключением к БД**

Существует 4 хука, выполняемые до и после подключения к БД и отключения от нее:

- `sequelize.beforeConnect(callback)` - колбек имеет сигнатуру `async (config) => {}`
- `sequelize.afterConnect(callback)` - `async (connection, config) => {}`
- `seuqelize.beforeDisconnect(callback)` - `async (connection) => {}`
- `sequelize.afterDisconnect(callback)` - `async (connection) => {}`

Эти хуки могут использоваться для асинхронного получения полномочий (credentials) для доступа к БД или получения прямого доступа к низкоуровневому соединению с БД после его установки.

Например, мы можем асинхронно получить пароль от БД из хранилища токенов и модифицировать объект с настройками:

```js
sequelize.beforeConnect(async (config) => {
  config.password = await getAuthToken()
})
```

Рассматриваемые хуки могут быть определены только как глобальные, поскольку соединение является общим для всех моделей.

**Хуки экземпляров**

Следующие хуки будут запускаться при редактировании единичного объекта:

- `beforeValidate`
- `afterValidate`/`validationFailed`
- `beforeCreate`/`beforeUpdate`/`beforeSave`/`beforeDestroy`
- `afterCreate`/`afterUpdate`/`afterSave`/`afterDestroy`

```js
User.beforeCreate((user) => {
  if (user.accessLevel > 10 && user.username !== 'Сенсей') {
    throw new Error(
      'Вы не можете предоставить этому пользователю уровень доступа выше 10'
    )
  }
})

// Будет выброшено исключение
try {
  await User.create({ username: 'Гуру', accessLevel: 20 })
} catch (err) {
  console.error(err) // Вы не можете предоставить этому пользователю уровень доступа выше 10
}

// Ок
const user = await User.create({
  username: 'Сенсей',
  accessLevel: 20,
})
```

**Хуки моделей**

При вызове методов `bulkCreate()`, `update()` и `destroy()` запускаются следующие хуки:

- `beforeBulkCreate(callback)` - колбек имеет сигнатуру `(instances, options) => {}`
- `beforeBulkUpdate(callback)` - `(options) => {}`
- `beforeBulkDestroy(callback)` - `(options) => {}`
- `afterBulkCreate(callback)` - `(instances, options) => {}`
- `afterBulkUpdate(callback)` - `(options) => {}`
- `afterBulkDestroy(callback)` - `(options) => {}`

_Обратите внимание_: вызов методов моделей по умолчанию приводит к запуску только хуков с префиксом `bulk`. Это можно изменить с помощью настройки `{ individualHooks: true }`, но имейте ввиду, что это может крайне негативно сказаться на производительности.

```js
await Model.destroy({
  where: { accessLevel: 0 },
  individualHooks: true,
})

await Model.update(
  { username: 'John' },
  {
    where: { accessLevel: 0 },
    individualHooks: true,
  }
)
```

__Хуки и ассоциации__

_Один-к-одному и один-ко-многим_

- при использовании миксинов `add`/`set` запускаются хуки `beforeUpdate()` и `afterUpdate()`
- хуки `beforeDestroy()` и `afterDestroy()` запускаются только при наличии у ассоциаций `onDelete: 'CASCADE'` и `hooks: true`

```js
const Project = sequelize.define('project', {
  title: DataTypes.STRING,
})
const Task = sequelize.define('task', {
  title: DataTypes.STRING,
})
Project.hasMany(Task, { onDelete: 'CASCADE', hooks: true })
Task.belongsTo(Project)
```

По умолчанию `Sequelize` пытается максимально оптимизировать запросы. Например, при вызове каскадного удаления `Sequelize` выполняет:

```sql
DELETE FROM `table` WHERE associatedIdentifier = associatedIdentifier.primaryKey;
```

Однако, добавление `hooks: true` отключает оптимизации. В этом случае `Sequelize` сначала выполняет выборку связанных объектов с помощью `SELECT` и затем уничтожает каждый экземпляр по одному для обеспечения вызова соответствующих хуков с правильными параметрами.

_Многие-ко-многим_

- при использовании миксинов `add` для отношений `belongsToMany()` (когда в соединительной таблице создается как минимум одна запись) запускаются хуки `beforeBulkCreate()` и `afterBulkCreate()` соединительной таблицы
- если указано `{ individualHooks: true }`, то также вызываются индивидуальные хуки
- при использовании миксинов `remove` запускаются хуки `beforeBulkDestroy()` и `afterBulkDestroy()`, а также индивидуальные хуки при наличии `{ individualHooks: true }`

**Хуки и транзакции**

Если в оригинальном вызове была определена транзакция, она будет передана в хук вместе с другими настройками:

```js
User.addHook('afterCreate', async (user, options) => {
  // Мы можем использовать `options.transaction` для выполнения другого вызова
  // с помощью той же транзакции, которая запустила данный хук
  await User.update(
    { mood: 'печальный' },
    {
      where: {
        id: user.id,
      },
      transaction: options.transaction,
    }
  )
})

await sequelize.transaction(async (t) => {
  await User.create({
    username: 'Ванька',
    mood: 'счастливый',
    transaction: t,
  })
})
```

Если мы не передадим транзакцию в вызов `User.update()`, обновления не произойдет, поскольку созданный пользователь попадет в БД только после фиксации транзакции.

Важно понимать, что `Sequelize` автоматически использует транзакции при выполнении некоторых операций, таких как `Model.findOrCreate()`. Если хуки выполняют операции чтения или записи на основе объекта из БД или модифицируют значения объекта как в приведенном выше примере, всегда следует определять `{ transaction: options.transaction }`.

## Интерфейс запросов

Каждый экземпляр использует интерфейс запросов (query interface) для взаимодействия с БД. Методы этого интерфейса являются низкоуровневыми в сравнении с обычными методами. Но, разумеется, по сравнению с запросами SQL, они являются высокоуровневыми.

Рассмотрим несколько примеров использования методов названного интерфейса (полный список методов можно найти <a href="https://sequelize.org/master/class/lib/dialects/abstract/query-interface.js~QueryInterface.html">здесь</a>).

Получение интерфейса запросов:

```js
const { Sequelize, DataTypes } = require('sequelize')
const sequelize = new Sequelize(/* ... */)
const queryInterface = sequelize.getQueryInterface()
```

Создание таблицы:

```js
queryInterface.createTable('Person', {
  name: DataTypes.STRING,
  isBetaMember: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
})
```

Генерируемый `SQL`:

```sql
CREATE TABLE IF NOT EXISTS `Person` (
  `name` VARCHAR(255),
  `isBetaMember` TINYINT(1) NOT NULL DEFAULT 0
);
```

Добавление в таблицу новой колонки:

```js
queryInterface.addColumn('Person', 'petName', { type: DataTypes.STRING })
```

`SQL`:

```sql
ALTER TABLE `Person` ADD `petName` VARCHAR(255);
```

Изменение типа данных колонки:

```js
queryInterface.changeColumn('Person', 'foo', {
  type: DataTypes.FLOAT,
  defaultValue: 3.14,
  allowNull: false,
})
```

`SQL`:

```sql
ALTER TABLE `Person` CHANGE `foo` `foo` FLOAT NOT NULL DEFAULT 3.14;
```

Удаление колонки:

```js
queryInterface.removeColumn('Person', 'petName', {
  /* настройки */
})
```

`SQL`:

```sql
ALTER TABLE 'public'.'Person' DROP COLUMN 'petName';
```

## Стратегии именования

`Sequelize` предоставляет настройку `underscored` для моделей. Когда эта настройка имеет значение `true`, значение настройки `field` (название поля) всех атрибутов приводится к `snake_case`. Это также справедливо по отношению к внешним ключам и другим автоматически генерируемым полям.

```js
const User = sequelize.define(
  'user',
  { username: DataTypes.STRING },
  {
    underscored: true,
  }
)
const Task = sequelize.define(
  'task',
  { title: DataTypes.STRING },
  {
    underscored: true,
  }
)
User.hasMany(Task)
Task.belongsTo(User)
```

У нас имеется две модели, `User` и `Task`, обе с настройками `underscored`. Между этими моделями установлена ассоциация один-ко-многим. Также, поскольку настройка `timestamps` по умолчанию имеет значение `true`, в обеих таблицах будут автоматически созданы поля `createdAt` и `updatedAt`.

Без настройки `underscored` произойдет автоматическое создание:

- атрибута `createdAt` для каждой модели, указывающего на колонку `createdAt` каждой таблицы
- атрибута `updatedAt` для каждой модели, указывающего на колонку `updatedAt` каждой таблицы
- атрибута `userId` в модели `Task`, указыващего на колонку `userId` таблицы `task`

С настройкой `underscored` будут автоматически созданы:

- атрибут `createdAt` для каждой модели, указывающего на колонку `created_at` каждой таблицы
- атрибут `updatedAt` для каждой модели, указывающего на колонку `updated_at` каждой таблицы
- атрибут `userId` в модели `Task`, указыващего на колонку `user_id` таблицы `task`

_Обратите внимание_: в обоих случаях названия полей именуются в стиле `camelCase`.

Во втором случае вызов `sync()` приведет к генерации такого `SQL`:

```sql
CREATE TABLE IF NOT EXISTS "users" (
  "id" SERIAL,
  "username" VARCHAR(255),
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL,
  PRIMARY KEY ("id")
);
CREATE TABLE IF NOT EXISTS "tasks" (
  "id" SERIAL,
  "title" VARCHAR(255),
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL,
  "user_id" INTEGER REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  PRIMARY KEY ("id")
);
```

**Использование единственного и множественного чисел**

При определении моделей:

```js
// При определении модели должно использоваться единственное число
sequelize.define('foo', { name: DataTypes.STRING })
```

В данном случае названием соответствующей таблицы будет `foos`.

При определении ссылок в модели:

```js
sequelize.define('foo', {
  name: DataTypes.STRING,
  barId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'bars',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
})
```

При извлечении данных при нетерпеливой загрузке.

При добавлении в запрос `include`, в возвращаемом объекте создается дополнительное поле согласно следующим правилам:

- при включении данных из единичной ассоциации (`hasOne()` или `belongsTo()`) - название поля указывается в единственном числе
- при включении данных из множественной ассоциации (`hasMany()` или `belongsToMany()`) - название поля указывается во множественном числе

```js
// Foo.hasMany(Bar)
const foo = Foo.findOne({ include: Bar })
// foo.bars будет массивом

// Foo.hasOne(Bar)
const foo = Foo.findOne({ include: Bar })
// foo.bar будет объектом

// и т.д.
```

**Кастомизация названий при определении синонимов**

При определении синонима для ассоциации вместо `{ as: 'myAlias' }` можно передать объект с единичной и множественной формами таблицы:

```js
Project.belongsToMany(User, {
  as: {
    singular: 'líder',
    plural: 'líderes',
  },
})
```

Если модель будет использовать один и тот же синоним во всех ассоциациях, формы можно указать прямо в модели:

```js
const User = sequelize.define(
  'user',
  {
    /* ... */
  },
  {
    name: {
      singular: 'líder',
      plural: 'líderes',
    },
  }
)
Project.belongsToMany(User)
```

При этом, в миксинах будут использоваться правильные формы, например, `getLíder()`, `setLíderes()` и т.д.

_Обратите внимание_: при использовании `as` для изменения названия ассоциации, также будет изменено название внешнего ключа. Поэтому в данном случае также рекомендуется явно определять название внешнего ключа, причем, в обоих вызовах:

```js
Invoice.belongsTo(Subscription, {
  as: 'TheSubscription',
  foreignKey: 'subscription_id',
})
Subscription.hasMany(Invoice, { foreignKey: 'subscription_id' })
```

## Области видимости

Области видимости (scopes) (далее - области) облегчают повторное использование кода. Они позволяют определить часто используемые настройки, такие как `where`, `include`, `limit` и т.д.

**Определение**

Области определяются при создании модели и могут быть поисковыми объектами или функциями, возвращающими такие объекты, за исключением дефолтной области, которая может быть только объектом:

```js
const Project = sequelize.define(
  'project',
  {
    /* ... */
  },
  {
    defaultScope: {
      where: {
        active: true,
      },
    },
    scopes: {
      deleted: {
        where: {
          deleted: true,
        },
      },
      activeUsers: {
        include: [
          {
            model: User,
            where: { active: true }
          }
        ],
      },
      random() {
        return {
          where: {
            someNum: Math.random(),
          },
        }
      },
      accessLevel(value) {
        return {
          where: {
            accesLevel: {
              [Op.gte]: value,
            },
          },
        }
      },
    },
  }
)
```

Области также могут определяться с помощью метода `Model.addScope()`. Это может быть полезным при определении областей для включений, когда связанная модель может быть не определена в момент создания основной модели.

Дефолтная область применяется всегда. Это означает, что в приведенном примере вызов `Project.findAll()` сгенерирует такой запрос:

```sql
SELECT * FROM projects WHERE active = true;
```

Дефолтная область может быть удалена с помощью `unscoped()`, `scope(null)` или посредством вызова другой области:

```js
await Project.scope('deleted').findAll()
```

```sql
SELECT * FROM projects WHERE deleted = true;
```

Также имеется возможность включать модели из области в определение области. Это позволяет избежать дублирования `include`, `attributes` или `where`:

```js
Project.addScope('activeUsers', {
  include: [
    { model: User.scope('active') }
  ],
})
```

**Использование**

Области применяются путем вызова метода `scope(scopeName)`. Этот метод возвращает полнофункциональный экземпляр модели со всеми обычными методами: `findAll()`, `update()`, `count()`, `destroy()` и т.д.

```js
const DeletedProjects = Project.scope('deleted')
await DeletedProjects.findAll()

// Это эквивалентно следующему
await Project.findAll({
  where: {
    deleted: true,
  },
})
```

Области применяются к `find()`, `findAll()`, `count()`, `update()`, `increment()` и `destroy()`.

Области-функции могут вызываться двумя способами. Если область не принимает аргументов, она вызывается как обычно. Если область принимает аргументы, ей передается объект:

```js
await Project.scope('random', { method: ['accessLevel', 10] })
```

`SQL`:

```sql
SELECT * FROM projects WHERE someNum = 42 AND accessLevel >= 10;
```

**Объединение областей**

Объединяемые области указываются через запятую или передаются в виде массива:

```js
await Project.scope('deleted', 'activeUsers').findAll()
await Project.scope(['deleted', 'activeUsers']).findAll()
```

`SQL`:

```sql
SELECT * FROM projects
INNER JOIN users ON projects.userId = users.id
WHERE projects.deleted = true
AND users.active = true;
```

Объединение дефолтной и кастомной областей:

```js
await Project.scope('defaultScope', 'deleted').findAll()
```

При вызове нескольких областей, ключи последующих областей перезаписывают ключи предыдущих областей (по аналогии с `Object.assign()`), за исключением `where` и `include`, в которых ключи объединяются. Рассмотрим две области:

```js
Model.addScope('scope1', {
  where: {
    firstName: 'John',
    age: {
      [Op.gt]: 20,
    },
  },
  limit: 20,
})
Model.addScope('scope2', {
  where: {
    age: {
      [Op.gt]: 30,
    },
  },
  limit: 10,
})
```

Вызов `scope('scope1', 'scope2')` приведет к генерации такого предложения `WHERE`:

```sql
WHERE firstName = 'John' AND age > 30 LIMIT 10;
```

Атрибуты `limit` и `age` были перезаписаны, а `firstName` сохранен.

При объединении ключей атрибутов из нескольких областей предполагается `attributes.exclude()`. Это обеспечивает учет регистра полей при объединении, т.е. сохранение чувствительных полей в финальном результате.

Такая же логика объединения используется при прямой передаче поискового объекта в `findAll()` (и аналогичные методы):

```js
Project.scope('deleted').findAll({
  where: {
    firstName: 'Jane',
  },
})
```

`SQL`:

```sql
WHERE deleted = true AND firstName = 'Jane';
```

Если мы передадим `{ firstName: 'Jane', deleted: false }`, область `deleted` будет перезаписана.

**Объединение включений**

Включения объединяются рекурсивно на основе включаемых моделей.

Предположим, что у нас имеются такие модели с ассоциацией один-ко-многим:

```js
const Foo = sequelize.define('Foo', { name: DataTypes.STRING })
const Bar = sequelize.define('Bar', { name: DataTypes.STRING })
const Baz = sequelize.define('Baz', { name: DataTypes.STRING })
const Qux = sequelize.define('Qux', { name: DataTypes.STRING })
Foo.hasMany(Bar, { foreignKey: 'fooId' })
Bar.hasMany(Baz, { foreignKey: 'barId' })
Baz.hasMany(Qux, { foreignKey: 'bazId' })
```

Далее, предположим, что мы определили для модели `Foo` такие области:

```js
Foo.adScope('includeEverything', {
  indluce: {
    model: Bar,
    include: [
      {
        model: Baz,
        include: Qux,
      },
    ],
  },
})

Foo.addScope('limitedBars', {
  include: [
    {
      model: Bar,
      limit: 2,
    },
  ],
})

Foo.addScope('limitedBazs', {
  include: [
    {
      model: Bar,
      include: [
        {
          model: Baz,
          limit: 2,
        },
      ],
    },
  ],
})

Foo.addScope('excludedBazName', {
  include: [
    {
      model: Bar,
      include: [
        {
          model: Baz,
          attributes: {
            exclude: ['name'],
          },
        },
      ],
    },
  ],
})
```

Эти 4 области легко (и глубоко) объединяются. Например, вызов `Foo.scope('includeEverything', 'limitedBars', 'limitedBazs', 'excludedBazName')` эквивалентен следующему:

```js
await Foo.findAll({
  include: {
    model: Bar,
    limit: 2,
    include: [
      {
        model: Baz,
        limit: 2,
        attributes: {
          exclude: ['name'],
        },
        include: Qux,
      },
    ],
  },
})
```

## Подзапросы

Предположим, что у нас имеется две модели, `Post` и `Reaction`, с ассоциацией один-ко-многим:

```js
const Post = sequelize.define(
  'Post',
  {
    content: DataTypes.STRING,
  },
  { timestamps: false }
)
const Reaction = sequelize.define(
  'Reaction',
  {
    type: DataTypes.STRING,
  },
  { timestamps: false }
)

Post.hasMany(Reaction)
Reaction.belongsTo(Post)
```

Заполним эти таблицы данными:

```js
const createPostWithReactions = async (content, reactionTypes) => {
  const post = await Post.create({ content })
  await Reaction.bulkCreate(
    reactionTypes.map((type) => ({ type, postId: post.id }))
  )
  return post
}

await createPostWithReactions('My First Post', [
  'Like',
  'Angry',
  'Laugh',
  'Like',
  'Like',
  'Angry',
  'Sad',
  'Like',
])
await createPostWithReactions('My Second Post', [
  'Laugh',
  'Laugh',
  'Like',
  'Laugh',
])
```

Допустим, что мы хотим вычислить `laughReactionsCount` для каждого поста. С помощью подзапроса `SQL` это можно сделать так:

```sql
SELECT *, (
  SELECT COUNT(*)
  FROM reactions AS reaction
  WHERE
    reaction.postId = post.id
    AND
    reaction.type = 'Laugh'
) AS laughReactionsCount
FROM posts AS post;
```

Результат:

```js
[
  {
    "id": 1,
    "content": "My First Post",
    "laughReactionsCount": 1
  },
  {
    "id": 2,
    "content": "My Second Post",
    "laughReactionsCount": 3
  }
]
```

`Sequelize` предоставляет специальную утилиту `literal()` для работы с подзапросами. Данная утилита принимает подзапрос `SQL`. Т.е. `Sequelize` помогает с основным запросом, но подзапрос должен быть реализован вручную:

```js
Post.findAll({
  attributes: {
    include: [
      [
        sequelize.literal(`(
          SELECT COUNT(*)
          FROM reactions AS reaction
          WHERE
            reaction.postId = post.id
            AND
            reaction.type = 'Laugh'
        )`),
        'laughReactionsCount',
      ],
    ],
  },
})
```

Результат выполнения данного запроса будет таким же, как при выполнении SQL-запроса.

При использовании подзапросов можно выполнять группировку возвращаемых значений:

```js
Post.findAll({
  attributes: {
    include: [
      [
        sequelize.literal(`(
          SELECT COUNT(*)
          FROM reactions AS reaction
          WHERE
            reaction.postId = post.id
            AND
            reaction.type = 'Laugh'
        )`),
        'laughReactionsCount',
      ],
    ],
  },
  order: [
    [sequelize.literal('laughReactionsCount'), 'DESC']
  ],
})
```

Результат:

```js
[
  {
    "id": 2,
    "content": "My Second Post",
    "laughReactionsCount": 3
  },
  {
    "id": 1,
    "content": "My First Post",
    "laughReactionsCount": 1
  }
]
```

## Ограничения и циклические ссылки

Добавление ограничений между таблицами означает, что таблицы должны создаваться в правильном порядке при использовании `sequelize.sync()`. Если `Task` содержит ссылку на `User`, тогда таблица `User` должна быть создана первой. Иногда это может привести к циклическим ссылкам, когда `Sequelize` не может определить порядок синхронизации. Предположим, что у нас имеются документы и версии. Документ может иметь несколько версий. Он также может содержать ссылку на текущую версию.

```js
const Document = sequelize.define('Document', {
  author: DataTypes.STRING,
})
const Version = sequelize.define('Version', {
  timestamp: DataTypes.STRING,
})
Document.hasMany(Version)
Document.belongsTo(Version, {
  as: 'Current',
  foreignKey: 'currentVersionId',
})
```

Однако, это приведет к возникновению ошибки:

```
Cyclic dependency found. documents is dependent of itself. Dependency chain: documents -> versions => documents
```

Для решения этой проблемы необходимо передать `constraints: false` в одну из ассоциаций:

```js
Document.hasMany(Version)
Document.belongsTo(Version, {
  as: 'Current',
  foreignKey: 'currentVersionId',
  constraints: false,
})
```

Иногда может потребоваться указать ссылку на другую таблицу без создания ограничений или ассоциаций. В этом случае ссылку и отношения между таблицами можно определить явно:

```js
const Trainer = sequelize.define('Trainer', {
  firstName: DataTypes.STRING,
  lastName: DataTypes.STRING,
})

// `Series` будет содержать внешнюю ссылку `trainerId = Trainer.id`
// после вызова `Trainer.hasMany(series)`
const Series = sequelize.define('Series', {
  title: DataTypes.STRING,
  subTitle: DataTypes.STRING,
  description: DataTypes.TEXT,
  // Определяем отношения один-ко-многим с `Trainer`
  trainerId: {
    type: DataTypes.INTEGER,
    references: {
      model: Trainer,
      key: 'id',
    },
  },
})

// `Video` будет содержэать внешнюю ссылку `seriesId = Series.id`
// после вызова `Series.hasOne(Video)`
const Video = sequelize.define('Video', {
  title: Sequelize.STRING,
  sequence: Sequelize.INTEGER,
  description: Sequelize.TEXT,
  // Устанавливаем отношения один-ко-многим с `Series`
  seriesId: {
    type: DataTypes.INTEGER,
    references: {
      model: Series, // Может быть как строкой, представляющей название таблицы, так и моделью
      key: 'id',
    },
  },
})

Series.hasOne(Video)
Trainer.hasMany(Series)
```

## Индексы

`Sequelize` поддерживает индексирование моделей:

```js
const User = sequelize.define(
  'User',
  {
    /* атрибуты */
  },
  {
    indexes: [
      // Создаем уникальный индекс для адреса электронной почты
      {
        unique: true,
        fields: ['email'],
      },

      // Создание обратного индекса для данных с помощью оператора `jsonb_path_ops`
      {
        fields: ['data'],
        using: 'gin',
        operator: 'jsonb_path_ops',
      },

      // По умолчанию название индекса будет иметь вид `[table]_[fields]`
      // Создаем частичный индекс для нескольких колонок
      {
        name: 'public_by_author',
        fields: ['author', 'status'],
        where: {
          status: 'public',
        },
      },

      // Индекс `BTREE` с сортировкой
      {
        name: 'title_index',
        using: 'BTREE',
        fields: [
          'author',
          {
            attribute: 'title',
            collate: 'en_US',
            order: 'DESC',
            length: 5,
          },
        ],
      },
    ],
  }
)
```

## Пул соединений

Подключение к БД с помощью одного процесса означает создание одного экземпляра `Sequelize`. При инициализации `Sequelize` создает пул соединений (connection pool). Этот пул может быть настроен с помощью настройки `pool`:

```js
const sequelize = new Sequelize(/* ... */, {
  // ...
  pool: {
    min: 0,
    max: 5,
    acquire: 30000,
    idle: 10000
  }
})
```

При подключении к БД с помощью нескольких процессов, для каждого процесса создается отдельный экземпляр с максимальным размером пула подключений с учетом общего максимального размера.

## Миграции

Подобно тому, как вы используете систему контроля версий, такую как `Git`, для контроля за изменениями кодовой базы, миграции (migrations) позволяют контролировать изменения, вносимые в БД. Миграции позволяют переводить БД из одного состояния в другое и обратно: изменения состояния сохраняются в файлах миграции, описывающих, как получить новое состояние или как отменить изменения для того, чтобы вернуться к предыдущему состоянию.

Для работы с миграциями, а также для генерации шаблона проекта, используется <a href="https://github.com/sequelize/cli">интерфейс командной строки `Sequelize`</a>.

Миграция - это JS-файл, из которого экспортируется 2 функции, `up` и `down`, описывающие выполнение миграции и ее отмену, соответственно. Эти функции определяются вручную, но вызываются с помощью `CLI`. В функциях указываются необходимые запросы с помощью `sequelize.query()` или других методов.

**Установка `CLI`:**

```bash
yarn add sequelize-cli
# или
npm i sequelize-cli
```

**Генерация шаблона**

Для создания пустого проекта используется команда `init`:

```bash
sequelize-cli init
```

Будут созданы следующие директории:

- `config` - файл с настройками подключения к БД
- `models` - модели для проекта
- `migrations` - файлы с миграциями
- `seeders` - файлы для заполнения БД начальными (фиктивными) данными

**Настройка**

Далее нам нужно сообщить `CLI`, как подключиться к БД. Для этого откроем файл `config/config.json`. Он выглядит примерно так:

```js
{
  "development": {
    "username": "root",
    "password": null,
    "database": "database_development",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "test": {
    "username": "root",
    "password": null,
    "database": "database_test",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "production": {
    "username": "root",
    "password": null,
    "database": "database_production",
    "host": "127.0.0.1",
    "dialect": "mysql"
  }
}
```

Редактируем этот файл, устанавливая правильные ключи для доступа к БД и диалект `SQL`.

_Обратите внимание_: для создания БД можно выполнить команду `db:create`.

**Создание первой модели и миграции**

После настройки `CLI` можно приступать к созданию миграций. Мы создадим ее с помощью команды `model:generate`. Это команда принимает 2 настройки:

- `name`: название модели
- `attributes`: список атрибутов модели

```bash
sequelize-cli model:generate --name User --attributes firstName:string,lastName:string, email:string
```

Данная команда создаст:

- файл `user.js` в директории `models`
- файл `XXXXXXXXXXXXXX-create-user.js` в директории `migrations`

**Запуск миграций**

Для создания таблицы в БД используется команда `db:migrate`:

```bash
sequelize-cli db:migrate
```

Данная команда выполняет следующее:

- создает в БД таблицу `SequelizeMeta`. Это таблица используется для записи миграций, выполняемых для текущей БД
- выполняет поиск файлов с миграциями, которые еще не запускались. В нашем случае будет запущен файл `XXXXXXXXXXXXXX-create-user.js`
- создается таблица `Users` с колонками, определенными в миграции

**Отмена миграций**

Для отмены миграций используется команда `db:migrate:undo`:

```bash
sequelize-cli db:migrate:undo
```

Для отмены всех миграций используется команда `db:migrate:undo:all`, а для отката к определенной миграции - `db:migrate:undo:all --to XXXXXXXXXXXXXX-create-posts.js`.

**Создание скрипта для наполнения БД начальными данными**

Предположим, что мы хотим создать дефолтного пользователя в таблице `Users`. Для управления миграциями данных можно использовать сеятелей (seeders). Засеивание файла - это наполнение таблицы начальными или тестовыми данными.

Создадим файл с кодом, при выполнении которого будет выполняться создание дефолтного пользователя в таблице `Users`.

```bash
sequelize-cli seed:generate --name demo-user
```

После выполнения этой команды в директории `seeders` появится файл `XXXXXXXXXXXXXX-demo-user.js`. В нем используется такая же семантика `up / down`, что и в файлах миграций.

Отредактриуем этот файл:

```js
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Users', [
      {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john@mail.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])
  },
  down: (queryInterface, Sequelize) =>
    queryInterface.bulkDelete('Users', null, {}),
}
```

Для запуска сеятеля используется команда `db:seed:all`:

```bash
sequelize-cli db:seed:all
```

Для отмены последнего сеятеля используется команда `db:seed:undo`, для отмены определенного сеятеля - `db:seed:undo --seed seedName`, для отмены всех сеятелей - `db:seed:undo:all`.

_Обратите внимание_: отменяемыми являются только те сеятели, которые используют какое-либо хранилище (см. ниже; в отличие от миграций, информация о сеятелях не сохраняется в таблице `SequelizeMeta`).

**Шаблон миграции**

Шаблон миграции выглядит так:

```js
module.exports = {
  up: (queryInterface, Sequelize) => {
    // Логика перехода к новому состоянию
  },
  down: (queryIntarface, Sequelize) => {
    // Логика отмены изменений
  },
}
```

Мы можем создать этот файл с помощью `migration:generate`. Эта команда создаст файл `xxx-migration-skeleton.js` в директории для миграций.

```bash
sequelize-cli migration:generate --name migrationName
```

Объект `queryInterface` используется для модификации БД. Объект `Sequelize` содержит доступные типы данных, такие как `STRING` или `INTEGER`. Функции `up()` и `down()` должны возвращать промис. Рассмотрим простой пример создания/удаления таблицы `User`:

```js
module.exports = {
  up: (queryInterface, { DataTypes }) =>
    queryInterface.createTable('User', {
      name: DataTypes.STRING,
      isBetaMember: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
    }),
  down: (queryInterface) => queryInterface.dropTable('User'),
}
```

В следующем примере миграция производит два изменения в БД (добавляет две колонки в таблицу `User`) с помощью управляемой транзакции, обеспечивающей успешное выполнение всех операций или отмену изменений при возникновении ошибки:

```js
module.exports = {
  up: (queryInterface, { DataTypes }) =>
    queryInterface.sequelize.transaction((transaction) =>
      Promise.all([
        queryInterface.addColumn('User', 'petName', {
          DataTypes.STRING
        }, { transaction }),
        queryInterface.addColumn('User', 'favouriteColor', {
          type: DataTypes.STRING
        }, { transaction })
      ])
    ),
  down: (queryInterface) =>
    queryInterface.sequelize.transaction((transaction) =>
      Promise.all([
        queryInterface.removeColumn('User', 'petName', { transaction }),
        queryInterface.removeColumn('User', 'favouriteColor', { transaction })
      ])
    )
}
```

Следующий пример демонстрирует использование в миграции внешнего ключа:

```js
module.exports = {
  up: (queryInterface, { DataTypes }) =>
    queryInterface.createTable('Person', {
      name: DataTypes.STRING,
      isBetaMember: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        references: {
          model: {
            tableName: 'users',
            schema: 'schema',
          },
          key: 'id',
        },
        allowNull: false,
      },
    }),
  down: (queryInterface) => queryInterface.dropTable('Person'),
}
```

Следующий пример демонстирует использование синтаксиса `async/await`, создание уникального индекса для новой колонки и неуправляемой транзакции:

```js
module.exports = {
  async up(queryInterface, { DataTypes }) {
    const transaction = await queryInterface.sequelize.transaction()
    try {
      await queruyInterface.addColumn(
        'Person',
        'petName',
        { type: DataTypes.STRING },
        { transaction }
      )
      await queryInterface.addIndex(
        'Person',
        'petName',
        {
          fields: 'petName',
          unique: true,
          transaction
        }
      )
      await transaction.commit()
    } catch (err) {
      await transaction.rollback()
      throw err
    }
  },
  async down(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction()
    try {
      await queryInterface.removeColumn('Person'. 'petName', { transaction })
      await transaction.commit()
    } catch (err) {
      await transaction.rollback()
      throw err
    }
  }
}
```

Следующий пример демонстрирует создание уникального индекса на основе композиции из нескольких полей с условием, которое позволяет отношениям существовать много раз, но только одно будет удовлетворять условию:

```js
modulex.exports = {
  up: (queryInterface, { DataTypes }) =>
    queryInterface
      .createTable('Person', {
        name: DataTypes.STRING,
        bool: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
      })
      .then((queryInterface) =>
        queryInterface.addIndex('Person', ['name', 'bool'], {
          indicesType: 'UNIQUE',
          where: { bool: true },
        })
      ),
  down: (queryInterface) => queryInterface.dropTable('Person'),
}
```

**Хранилище**

Существует три вида хранилища:

- `sequelize` - хранит миграции и сеятелей в таблице в БД
- `json` - хранит миграции и сеятелей в JSON-файле
- `none` - ничего не хранит

_Хранилище миграций_

По умолчанию `CLI` создает в БД таблицу `SequelizeMeta` для хранения записей о миграциях. Для изменения этого поведения существует 3 настройки, которые можно добавить в файл конфигурации `.sequelizerc`. Тип хранилища указывается в настройке `migrationStorage`. При выборе типа `json`, путь к файлу можно указать в настройке `migrationStoragePath` (по умолчанию данные будут записываться в файл `sequelize-meta.json`). Для изменения названия таблицы для хранения информации о миграциях в БД используется настройка `migrationStorageTableName`. Свойства `migrationStorageTableSchema` позволяет изменить используемую таблицей `SequelizeMeta` схему.

```js
{
  "development": {
    "username": "root",
    "password": null,
    "database": "database_development",
    "host": "127.0.0.1",
    "dialect": "mysql",

    // Используем другой тип хранилища. По умолчанию: sequelize
    "migrationStorage": "json",

    // Используем другое название файла. По умолчанию: sequelize-meta.json
    "migrationStoragePath": "sequelizeMeta.json",

    // Используем другое название таблицы. По умолчанию: SequelizeMeta
    "migrationStorageTableName": "sequelize_meta",

    // Используем другую схему для таблицы `SequelizeMeta`
    "migrationStorageTableSchema": "custom_schema"
  }
}
```

_Хранилище сеятелей_

По умолчанию `Sequelize` не хранит информацию о сеятелях. Настройки файла конфигурации, которые позволяют это изменить:

- `seederStorage` - тип хранилища
- `seederStoragePath` - путь к хранилищу (по умолчанию `sequelize-data.json`)
- `seederStorageTableName` - название таблицы (по умолчанию `SequelizeData`)

```js
{
  "development": {
    "username": "root",
    "password": null,
    "database": "database_development",
    "host": "127.0.0.1",
    "dialect": "mysql",
    // Определяем другой тип хранилища. По умолчанию: none
    "seederStorage": "json",
    // Определяем другое название для файла. По умолчанию: sequelize-data.json
    "seederStoragePath": "sequelizeData.json",
    // Определяем другое название для таблицы. По умолчанию: SequelizeData
    "seederStorageTableName": "sequelize_data"
  }
}
```
