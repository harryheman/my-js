---
sidebar_position: 3
title: Руководство по GraphQL
description: Руководство по GraphQL
keywords: ['javascript', 'js', 'graphql', 'api', 'guide', 'руководство']
tags: ['javascript', 'js', 'graphql', 'api', 'guide', 'руководство']
---

# GraphQL

> [GraphQL](https://graphql.org/) - это язык запросов для `API` и серверного окружения, предназначенный для выполнения запросов с помощью системы типов, определенных для данных. Сервис `GraphQL` создается посредством определения типов и их полей и создания функций для каждого поля каждого типа.

## Запросы и мутации

### Поля

В простейшем случае, GraphQL позволяет запрашивать (получать) поля объекта:

```js
{
  hero {
    name
  }
}

// вывод
{
  "data": {
    "hero": {
      "name": "R2-D2"
    }
  }
}
```

С тем же успехом можно получать поля вложенных объектов:

```js
{
  hero {
    name
    # Запросы могут иметь комментарии
    friends {
      name
    }
  }
}

// вывод
{
  "data": {
    "hero": {
      "name": "R2-D2",
      "friends": [
        {
          "name": "Luke Skywalker"
        },
        {
          "name": "Han Solo"
        },
        {
          "name": "Leia Organa"
        }
      ]
    }
  }
}
```

### Аргументы

GraphQL позволяет передавать полям объектов аргументы в момент их запроса:

```js
{
  human(id: '123') {
    name
    height
  }
}

// вывод
{
  "data": {
    "human": {
      "name": "Luke Skywalker",
      "height": 1.72
    }
  }
}
```

Это, в частности, позволяет передавать аргументы нескольким полям одновременно, что может существенно сократить количество запросов к серверу:

```js
{
  human(id: '123') {
    name
    height(unit: FOOT)
  }
}

// вывод
{
  "data": {
    "human": {
      "name": "Luke Skywalker",
      "height": 5.6430448
    }
  }
}
```

Здесь мы имеем дело с перечислением (enumeration type): значение длины может быть выражено либо в метрах (METER), либо в футах (FOOT). Перечисления могут расширяться сервером.

### Синонимы

Синонимы (aliases) позволяют использовать одинаковые названия полей с разными аргументами (переименовывать возвращаемый результат):

```js
{
  # Синоним: название поля
  empireHero: hero(episode: EMPIRE) {
    name
  }
  jediHero: hero(episode: JEDI) {
    name
  }
}

// вывод
{
  "data": {
    "empireHero": {
      "name": "Luke Skywalker"
    },
    "jediHero": {
      "name": "R2-D2"
    }
  }
}
```

### Фрагменты

Фрагменты позволяют определять набор полей для повторного использования в запросах:

```js
{
  leftComparison: hero(episode: EMPIRE) {
    ...comparisonFields
  }
  rightComparison: hero(episode: JEDI) {
    ...comparisonFields
  }
}

fragment comparisonFields on Character {
  name
  appearsIn
  friends {
    name
  }
}

// вывод
{
  "data": {
    "leftComparison": {
      "name": "Luke Skywalker",
      "appearsIn": [
        "NEWHOPE",
        "EMPIRE",
        "JEDI"
      ],
      "friends": [
        {
          "name": "Han Solo"
        },
        {
          "name": "Leia Organa"
        },
        {
          "name": "C-3PO"
        },
        {
          "name": "R2-D2"
        }
      ]
    },
    "rightComparison": {
      "name": "R2-D2",
      "appearsIn": [
        "NEWHOPE",
        "EMPIRE",
        "JEDI"
      ],
      "friends": [
        {
          "name": "Luke Skywalker"
        },
        {
          "name": "Han Solo"
        },
        {
          "name": "Leia Organa"
        }
      ]
    }
  }
}
```

#### Использование переменных внутри фрагментов

Фрагменты имеют доступ к переменным, определенным в запросе или мутации:

```js
query HeroComparison($first: Int = 3) {
  leftComparison: hero(episode: EMPIRE) {
    ...comparisonFields
  }
  rightComparison: hero(episode: JEDI) {
    ...comparisonFields
  }
}

fragment comparisonFields on Character {
  name
  friendsConnection(first: $first) {
    totalCount
    edges {
      node {
        name
      }
    }
  }
}

// вывод
{
  "data": {
    "leftComparison": {
      "name": "Luke Skywalker",
      "friendsConnection": {
        "totalCount": 4,
        "edges": [
          {
            "node": {
              "name": "Han Solo"
            }
          },
          {
            "node": {
              "name": "Leia Organa"
            }
          },
          {
            "node": {
              "name": "C-3PO"
            }
          }
        ]
      }
    },
    "rightComparison": {
      "name": "R2-D2",
      "friendsConnection": {
        "totalCount": 3,
        "edges": [
          {
            "node": {
              "name": "Luke Skywalker"
            }
          },
          {
            "node": {
              "name": "Han Solo"
            }
          },
          {
            "node": {
              "name": "Leia Organa"
            }
          }
        ]
      }
    }
  }
}
```

### Название операции

Для обозначения типа операции используется ключевое слово `query`, за которым следует название операции:

```js
query HeroNameAndFriends {
  hero {
    name
    friends {
      name
    }
  }
}
```

Типом операции может быть запрос (query), мутация (mutation) или подписка (subscribe).

### Переменные

Для того, чтобы иметь возможность работать с переменными, необходимо сделать следующее:

1. Заменить статическое значение в запросе на `$variableName`
2. Определить `$variableName` в качестве параметра запроса
3. Передать `variableName: value` в транспортируемом формате (обычно, таким форматом является `JSON`)

```js
query HeroNameAndFriends($episode: Episode) {
  hero(episode: $episode) {
    name
    friends {
      name
    }
  }
}

// переменная
{
  "episode": "JEDI"
}

// вывод
{
  "data": {
    "hero": {
      "name": "R2-D2",
      "friends": [
        {
          "name": "Luke Skywalker"
        },
        {
          "name": "Han Solo"
        },
        {
          "name": "Leia Organa"
        }
      ]
    }
  }
}
```

`$episode: Episode` означает, что переменная `episode` должна соответствовать типу `Episode`. `!` после типа означает, что переменная является обязательной (в приведенном примере переменная является опциональной).

#### Дефолтные переменные

```js
query HeroNameAndFriends($episode: Episode = JEDI) {
  hero(episode: $episode) {
    name
    friends {
      name
    }
  }
}
```

### Директивы

Директивы (directives) позволяют конструировать запросы динамически:

```js
query Hero($episode: Episode, $withFriends: Boolean!) {
  hero(episode: $episode) {
    name
    friends @include(if: $withFriends)
  }
}

// переменные
{
  "episode": "JEDI",
  "withFriends": false
}

// вывод
{
  "data": {
    "hero": {
      "name": "R2-D2"
    }
  }
}
```

На сегодняшний день GraphQL предоставляет 2 директивы:

- `@include(if: Boolean)` - включение полей при удовлетворении условия
- `@skip(if: Boolean)` - пропуск полей

Директивы могут расширяться сервером.

### Мутации

Если запросы только возвращают данные, то мутации позволяют эти данные изменять. В ответ на мутацию возвращается новое состояние объекта:

```js
mutation CreateReviewForEpisode($episode: Episode!, $review: ReviewInput!) {
  createReview(episode: $episode, review: $review) {
    stars
    comment
  }
}

// переменные
{
  "episode": "JEDI",
  "review": {
    "stars": 5,
    "comment": "Это великий фильм!"
  }
}

// вывод
{
  "data": {
    "createReview": {
      "stars": 5,
      "comment": "Это великий фильм!"
    }
  }
}
```

*Обратите внимание*, что типом `$review` является специальный тип объекта - входной (или входящий) объект (или данные) (input object type).

Как и запросы, мутации могут содержать несколько полей. Основное отличие между ними состоит в том, что запросы выполняются параллельно, а мутации - последовательно. Это объясняется тем, что первая мутация должна завершиться до начала следующей, так как обе мутации могут изменять одни и те же данные.

### Встроенные фрагменты

Схемы `GraphQL` позволяют определять интерфейсы (interfaces) и альтернативные типы (union types). В случае, когда в ответ на запрос возвращается интерфейс или альтернативный тип, для доступа к данным нижележащего конкретного типа (concrete type) используются встроенные фрагменты:

```js
query HeroForEpisode($episode: Episode!) {
  hero(episode: $episode) {
    name
    ... on Droid {
      primaryFunction
    }
    ... on Human {
      height
    }
  }
}

// переменная
{
  "episode": "JEDI"
}

// вывод
{
  "data": {
    "hero": {
      "name": "R2-D2",
      "primaryFunction": "Astromech"
    }
  }
}
```

В данном запросе поле `hero` возвращает тип `Character`, который может быть `Human` или `Droid` в зависимости от аргумента `episode`. Мы можем запрашивать только те поля, которые существуют в интерфейсе `Character`, такие как `name`.

Для запроса поля конкретного типа используются встроенные фрагменты c условием. Поскольку первый аргумент помечен как `... on Droid`, поле `primaryFunction` будет выполняться, только если `Character`, возвращенный из `hero`, будет иметь тип `Droid`. Тоже самое справедливо для поля `height` типа `Human`.

### Поля с метаданными

Мета-поле `__typename` позволяет получить название типа объекта в любом месте запроса:

```js
{
  search(text: 'an') {
    __typename
    ... on Human {
      name
    }
    ... on Droid {
      name
    }
    ... on Starship {
      name
    }
  }
}

// вывод
{
  "data": {
    "search": [
      {
        "__typename": "Human",
        "name": "Han Solo"
      },
      {
        "__typename": "Human",
        "name": "Leia Organa"
      },
      {
        "__typename": "Starship",
        "name": "TIE Advanced x1"
      }
    ]
  }
}
```

## Схемы и типы

### Система типов

В следующем примере мы начинаем со специального объекта `root`, выбираем его поле `hero`, которое является объектом, затем выбираем поля `name` и `appearsIn` этого объекта:

```js
{
  hero {
    name
    appearsIn
  }
}

// вывод
{
  "data": {
    "hero": {
      "name": "R2-D2",
      "appearsIn": [
        "NEWHOPE",
        "EMPIRE",
        "JEDI"
      ]
    }
  }
}
```

Каждый GraphQL-сервис определяет набор типов, описывающих данные, которые можно запрашивать. При получении запросов, они проверяются и выполняются с помощью схемы. При этом, сервис может быть реализован на любом языке, а не только на `JavaScript`.

### Типы и поля объектов

Основными компонентами схем являются объекты (object types):

```js
type Character {
  name: String!
  appearsIn: [Episode!]!
}
```

- `Character` - это объектный тип, содержащий поля. Большая часть типов любой схемы является объектами
- `name` и `appearsIn` - поля типа `Character`. Только эти поля можно запрашивать
- `String` - один из встроенных скалярных типов (scalar types). Скалярные типы не могут содержать полей
- `String!` - означает, что поле является ненулевым, не может иметь нулевое значение, т.е. является обязательным
- `[Episode!]!` - обязательный (ненулевой) массив, содержащий объекты с обязательным типом `Episode`

### Аргументы

Каждое поле может иметь аргументы:

```js
type Starship {
  id: ID!
  name: String!
  length(unit: LengthUnit = METER): Float
}
```

Все аргументы являются именованными, т.е. аргументы передаются по названию. Аргументы могут быть обязательными или опциональными. В последнем случае можно определять дефолтные значения.

### Запрос и мутация

В схеме существует два специальных типа:

```js
schema {
  query: Query
  mutation: Mutation
}
```

Каждый сервис имеет тип `query` и может иметь тип `mutation`. Эти типы являются входными точками для запросов. Такой запрос:

```js
query {
  hero {
    name
  }
  droid(id: '123') {
    name
  }
}

// вывод
{
  "data": {
    "hero": {
      "name": "R2-D2"
    },
    "droid": {
      "name": "C-3PO"
    }
  }
}
```

Означает, что сервис должен иметь тип `Query` с полями `hero` и `droid`:

```js
type Query {
  hero(episode: Episode): Character
  droid(id: ID!): Droid
}
```

Мутации работают похожим образом.

### Скалярные типы

Объект имеет название и поля, но в определенный момент эти поля должны разрешиться в конкретные данные - скалярные типы:

```js
{
  hero {
    name
    appearsIn
  }
}

// вывод
{
  "data": {
    "hero": {
      "name": "R2-D2",
      "appearsIn": [
        "NEWHOPE",
        "EMPIRE",
        "JEDI"
      ]
    }
  }
}
```

Дефолтные скалярные типы:

- `Int` - 32-битное целое число со знаком
- `Float` - число двойной точности со знаком
- `String` - строка, последовательность символов `UTF-8`
- `Boolean` - `true` или `false`
- `ID` - уникальный идентификатор, используемый для получения объектов, а также в качестве ключей для кэша

Допускается определять кастомные скалярные типы:

```js
scalar Date
```

### Перечисления

`Enums` - специальный скалярный тип, набор допустимых значений:

```js
enum Episode {
  NEWHOPE
  EMPIRE
  JEDI
}
```

### Списки и ненулевые значения

В `GraphQL` можно определять объекты, скалярные типы и перечисления. Однако, при использовании этих типов в других частях схемы или при определении переменных запроса можно применять дополнительные модификаторы, выполняющие валидацию этих значений:

```js
type Character {
  name: String!
  appearsIn: [Episode]!
}
```

Символ `!` после названия типа означает, что данное поле является обязательным. При отсутствии значения обязательного поля выбрасывается исключение:

```js
query DroidById($id: ID!) {
  droid(id: $id) {
    name
  }
}

// переменная
{
  "id": null
}

// вывод
{
  "errors": [
    {
      "message": "Variable \"$id\" of non-null type \"ID!\" must not be null.",
      "locations": [
        {
          "line": 1,
          "column": 17
        }
      ]
    }
  ]
}
```

Списки работают похожим образом. Мы используем модификатор `[]` для пометки типа в качестве `List`. Это означает, что поле должно возвращать массив определенных типов. Модификаторы ненулевого значения и списка можно комбинировать:

```js
myField: [String!]
```

Это означает, что список сам по себе может быть пустым, но не может содержать нулевые значения:

```js
myField: null // valid
myField: [] // valid
myField: ['a', 'b'] // valid
myField: ['a', null, 'b'] // error
```

Определим ненулевой список строк:

```js
myField: [String]!
```

Это означает, что список не может быть пустым, но может содержать нулевые значения:

```js
myField: null // error
myField: [] // valid
myField: ['a', 'b'] // valid
myField: ['a', null, 'b'] // valid
```

### Интерфейсы

Интерфейс (interface) - это абстрактный тип, включающий набор полей, которые должен содержать тип для реализации данного интерфейса.

Вот пример интерфейса `Character`, представляющий любого персонажа из трилогии "Звездные войны":

```js
interface Character {
  id: ID!
  name: String!
  friends: [Character]
  appearsIn: [Episode]!
}
```

Любой тип, реализующий данный интерфейс должен содержать указанные поля с указанными аргументами и возвращаемыми типами. Вот несколько типов, реализующих `Character`:

```js
type Human implements Character {
  id: ID!
  name: String!
  friends: [Character]
  appearsIn: [Episode]!
  starships: [Starship]
  totalCredits: Int
}

type Droid implements Character {
  id: ID!
  name: String!
  friends: [Character]
  appearsIn: [Episode]!
  primaryFunction: String
}
```

Типы, реализующие интерфейсы, могут содержать дополнительные поля.

Интерфейсы могут быть полезны, когда мы хотим вернуть объект или несколько объектов, но они имеют разные типы:

```js
query HeroForEpisode($episode: Episode!) {
  hero(episode: $episode) {
    name
    primaryFunction
  }
}

// переменная
{
  "episode": "JEDI"
}

// вывод
{
  "errors": [
    {
      "message": "Cannot query field \"primaryFunction\" on type \"Character\". Did you mean to use an inline fragment on \"Droid\"?",
      "locations": [
        {
          "line": 4,
          "column": 5
        }
      ]
    }
  ]
}
```

Ошибка возникает из-за того, что интерфейс не имеет поля `primaryFunction`. Для запроса поля определенного объекта следует использовать встроенный фрагмент:

```js
query HeroForEpisode($episode: Episode!) {
  hero(episode: $episode) {
    name
    ... on Droid {
      primaryFunction
    }
  }
}

// переменная
{
  "episode": "JEDI"
}

// вывод
{
  "data": {
    "hero": {
      "name": "R2-D2",
      "primaryFunction": "Astromech"
    }
  }
}
```

### Альтернативные типы

Альтернативные типы (union types) похожи на интерфейсы, но они не определяют общие поля типов:

```js
union SearchResult = Human | Droid | Starship
```

При запросе типа `SearchResult`, мы можем получить `Human`, `Droid` или `Starship`. *Обратите внимание*: мы не можем создавать альтернативные `interface` или альтернативные `union`.

При запросе, который разрешается типом `SearchResult`, необходимо использовать встроенные фрагменты для запроса полей:

```js
{
  search(text: 'an') {
    __typename
    ... on Human {
      name
      height
    }
    ... on Droid {
      name
      primaryFunction
    }
    ... on Starship {
      name
      length
    }
  }
}

// вывод
{
  "data": {
    "search": [
      {
        "__typename": "Human",
        "name": "Han Solo",
        "height": 1.8
      },
      {
        "__typename": "Human",
        "name": "Leia Organa",
        "height": 1.5
      },
      {
        "__typename": "Starship",
        "name": "TIE Advanced x1",
        "length": 9.2
      }
    ]
  }
}
```

Поле `__typename` возвращает `String`, позволяющую разделять типы данных на клиенте.

Поскольку `Human` и `Droid` имеют общий интерфейс (`Character`), мы можем запрашивать их общие поля в одном месте:

```js
{
  search(text: "an") {
    __typename
    ... on Character {
      name
    }
    ... on Human {
      height
    }
    ... on Droid {
      primaryFunction
    }
    ... on Starship {
      name
      length
    }
  }
}
```

### Входящие данные

Входящие (или входные) данные (input types) позволяют передавать запросам и мутациям сложные объекты в качестве аргументов:

```js
input ReviewInput {
  stars: Int!
  comment: String
}
```

Вот как можно использовать этот тип в мутации:

```js
mutation CreateReviewForEpisode($episode: Episode!, $review: ReviewInput!) {
  createReview(episode: $episode, review: $review) {
    stars
    comment
  }
}

// переменные
{
  "ep": "JEDI",
  "review": {
    "stars": 5,
    "commentary": "This is a great movie!"
  }
}

// вывод
{
  "data": {
    "createReview": {
      "stars": 5,
      "commentary": "This is a great movie!"
    }
  }
}
```

Поля входных данных могут ссылаться на другие входные данные, но смешивать типы нельзя. Входные данные также не могут принимать аргументы.

## Валидация

Использование системы типов позволяет предопределять валидность запросов. Например, такой запрос будет валидным:

```js
{
  hero {
    ...NameAndAppearances
    friends {
      ...NameAndAppearances
      friends {
        ...NameAndAppearances
      }
    }
  }
}

fragment NameAndAppearances on Character {
  name
  appearsIn
}
```

Фрагмент не может ссылаться на самого себя или создавать цикл. Поэтому такой запрос будет невалидным:

```js
{
  hero {
    ...NameAndAppearancesAndFriends
  }
}

fragment NameAndAppearancesAndFriends on Character {
  name
  appearsIn
  friends {
    // здесь создается цикл
    ...NameAndAppearancesAndFriends
  }
}
```

Очевидно, что мы можем запрашивать только существующие поля. В следующем примере запрашиваемого поля не существует:

```js
{
  hero {
    // такого поля не существует
    favoriteSpaceship
  }
}
```

Когда запрашиваемое поле возвращает объект, мы должны определить, какие данные мы хотим получить из этого поля, поэтому такой запрос будет невалидным:

```js
{
  hero
}
```

Если поле является скалярным, запрос дополнительных полей приведет к ошибке:

```js
{
  hero {
    // name является скалярным значением
    name {
      firstCharacterOfName
    }
  }
}
```

Ранее было отмечено, что мы можем запрашивать только те поля, которые существуют в типе. Когда мы запрашиваем `hero`, возвращающее `Character`, мы можем запрашивать только поля `Character`. Что случится, если мы запросим основную функцию R2-D2:

```js
{
  hero {
    name
    primaryFunction
  }
}

// вывод
{
  "errors": [
    {
      "message": "Cannot query field \"primaryFunction\" on type \"Character\". Did you mean to use an inline fragment on \"Droid\"?",
      "locations": [
        {
          "line": 5,
          "column": 5
        }
      ]
    }
  ]
}
```

Данный запрос является невалидным, поскольку `primaryFunction` не является полем `Character`. Нам необходимо определить, что мы хотим получать `primaryFunction` только в случае, когда `Character` является `Droid`. Для этого можно использовать фрагменты:

```js
{
  hero {
    name
    ...DroidFields
  }
}

fragment DroidFields on Droid {
  primaryFunction
}

// вывод
{
  "data": {
    "hero": {
      "name": "R2-D2",
      "primaryFunction": "Astromech"
    }
  }
}
```

В данном случае вместо именованного фрагмента лучше использовать встроенный (именованные фрагменты хороши при многократном использовании):

```js
{
  hero {
    name
    ... on Droid {
      primaryFunction
    }
  }
}

// вывод
{
  "data": {
    "hero": {
      "name": "R2-D2",
      "primaryFunction": "Astromech"
    }
  }
}
```

## Выполнение

После валидации, запрос выполняется. Сервер возвращает результат, соответствующий форме (shape) запроса, обычно, в формате `JSON`.

Выполнение запроса предполагает наличие системы типов:

```js
type Query {
  human(id: ID!): Human
}

type Human {
  name: String
  appearsIn: [Episode]
  starships: [Starship]
}

enum Episode {
  NEWHOPE
  EMPIRE
  JEDI
}

type Starship {
  name: String
}
```

Пример запроса:

```js
{
  human(id: '123') {
    name
    appearsIn
    starships {
      name
    }
  }
}

// вывод
{
  "data": {
    "human": {
      "name": "Han Solo",
      "appearsIn": [
        "NEWHOPE",
        "EMPIRE",
        "JEDI"
      ],
      "starships": [
        {
          "name": "Millenium Falcon"
        },
        {
          "name": "Imperial shuttle"
        }
      ]
    }
  }
}
```

По сути, каждое поле - это функция или метод предыдущего типа, которая возвращает следующий тип. Каждому полю соответствует функция - `resolver`, которая вызывается при выполнении поля и возвращает новое значение.

Если поле возвращает скалярное значение, например, строку или число, его выполнение завершается. В противном случае, выполняются вложенные поля (следующая группа полей). И так до тех пор, пока каждое поле не разрешится скалярным значением.

### Корневые поля и резолверы

На верхнем уровне любого GraphQL-сервера находится тип, представляющий все входные точки API. Он называется `Root` или `Query`.

В следующем примере `Query` предоставляет поле `human`, принимающее аргумент `id`. Резолвер (функция) получает доступ к базе данных и возвращает объект `Human`:

```js
Query: {
  human(obj, args, context, info) {
    return context.db.loadHumanByID(args.id).then(
      userData => new Human(userData)
    )
  }
}
```

- `obj` - предыдущий объект (используется редко)
- `args` - переданные аргументы
- `context` - контекст, значение, предоставляемое каждому резолверу, содержащее важную информацию, например, текущего авторизованного пользователя или доступ к базе данных
- `info` - значение, содержащее специфическую для запроса информацию, а также детали схемы

### Асинхронные резолверы

В приведенном выше примере `context` используется для предоставления доступа к базе данных, что позволяет получить данные пользователя по `id`, переданному в качестве аргумента в запросе. Поскольку получение данных из БД - это асинхронная операция, возвращается промис. После получения данных создается и возвращается новый объект `Human`.

Задача по правильной обработке промисов возлагается на резолвера. В свою очередь, запрос просто ожидает получить поле `human` для того, чтобы вернуть значение его поля `name`. В процессе выполнения запроса `GraphQL` по умолчанию ожидает завершения (разрешения) всех промисов и других асинхронных операций.

### Обычные резолверы

После того, как объект `Human` стал доступен, `GraphQL` может продолжить выполнение запроса:

```js
Human: {
  name(obj, args, context, info) {
    return obj.name
  }
}
```

Система типов позволяет серверу определить, что делать дальше. Еще до того, как поле `human` вернуло какое-либо значение, `GraphQL` знал, что следующим шагом будет разрешение полей типа `Human`.

В данном случае получение имени - легкая задача. Резолвер вызывается с аргументом `obj`, который является объектом `new Human`, возвращенным предыдущим полем. Мы ожидаем, что у этого объекта имеется свойство `name`, которое можно прочитать и вернуть.

Многие библиотеки `GraphQL` выполняют такие примитивные резолверы автоматически.

### Приведение к скалярным значениям

Рассмотрим примитивный резолвер поля `appearsIn`:

```js
Human: {
  appearsIn(obj) {
    return obj.appearsIn // возвращается [ 4, 5, 6 ]
  }
}
```

Наша система типов определяет, что `appearsIn` возвращает перечисление. Вместо этого возвращается массив чисел. Что происходит?

Здесь имеет место приведение к скалярным значениям. Система типов преобразует значения, возвращаемые резолвером, в то, что соответствует контракту API (API contract). В данном случае числа 4, 5 и 6 предназначены для внутреннего использования сервером, каждое число представляет тот или иной элемент перечисления.

### Резолверы списка

Итак, в случае с `appearsIn` возвращается список чисел, разрешающихся соответствующим значением перечисления. Что происходит в случае с полем `starships`?

```js
Human: {
  starships(obj, args, context, info) {
    return obj.starshipsIDs.map(
      id => context.db.loadStarshipByID(id).then(
        shipData => new Starship(shipData)
      )
    )
  }
}
```

Резолвер данного поля возвращает не один, а несколько (список) промисов. Объект `Human` содержит список идентификаторов пилотируемых `Starship`. Все эти `id` нужно загрузить для получения соответствующих объектов.

`GraphQL` будет ожидать разрешения всех промисов перед тем, как продолжить выполнение запроса, затем загрузит поле `name` каждого элемента.

### Результат

После разрешения всех полей результаты помещаются в пары ключ/значение, где ключ - это название поле (или его синоним), а значение - разрешенное значение этого поля. Таким образом, формируется зеркальная структура запроса, которая отправляется (как правило, в формате `JSON`) клиенту.

```js
{
  human(id: '123') {
    name
    appearsIn
    starships {
      name
    }
  }
}

// вывод
{
  "data": {
    "human": {
      "name": "Han Solo",
      "appearsIn": [
        "NEWHOPE",
        "EMPIRE",
        "JEDI"
      ],
      "starships": [
        {
          "name": "Millenium Falcon"
        },
        {
          "name": "Imperial shuttle"
        }
      ]
    }
  }
}
```

## Интроспекция

Интроспекция (introspection) позволяет получать информацию о запросах, поддерживаемых схемой. Например, доступные типы можно получить через поле `__schema`:

```js
{
  __schema {
    types {
      name
    }
  }
}

// вывод
{
  "data": {
    "__schema": {
      "types": [
        {
          "name": "Query"
        },
        {
          "name": "String"
        },
        {
          "name": "ID"
        },
        {
          "name": "Mutation"
        },
        {
          "name": "Episode"
        },
        {
          "name": "Character"
        },
        {
          "name": "Int"
        },
        {
          "name": "LengthUnit"
        },
        {
          "name": "Human"
        },
        {
          "name": "Float"
        },
        {
          "name": "Droid"
        },
        {
          "name": "FriendsConnection"
        },
        {
          "name": "FriendsEdge"
        },
        {
          "name": "PageInfo"
        },
        {
          "name": "Boolean"
        },
        {
          "name": "Review"
        },
        {
          "name": "ReviewInput"
        },
        {
          "name": "Starship"
        },
        {
          "name": "SearchResult"
        },
        {
          "name": "__Schema"
        },
        {
          "name": "__Type"
        },
        {
          "name": "__TypeKind"
        },
        {
          "name": "__Field"
        },
        {
          "name": "__InputValue"
        },
        {
          "name": "__EnumValue"
        },
        {
          "name": "__Directive"
        },
        {
          "name": "__DirectiveLocation"
        }
      ]
    }
  }
}
```

- `Query, Character, Human, Episode, Droid` - типы, определенные нами в системе
- `String, Boolean` - встроенные скалярные значения, предоставляемые системой
- `__Schema, __Type, __TypeKind, __Field, __InputValue, __EnumValue, __Directive` - все, что имеет префикс `__`, является частью системы интроспекции

С чего нам начать изучение доступных запросов? Может быть, с названия типа запроса?

```js
{
  __schema {
    queryType {
      name
    }
  }
}

// вывод
{
  "data": {
    "__schema": {
      "queryType": {
        "name": "Query"
      }
    }
  }
}
```

Как нам получить информацию о конкретном типе?

```js
{
  __type(name: 'Droid') {
    name
    kind
  }
}

// вывод
{
  "data": {
    "__type": {
      "name": "Droid",
      "kind": "OBJECT"
    }
  }
}
```

`kind` возвращает перечисление `__TypeKind`, одним из значений которого является `OBJECT`. Посмотрим на `Character`:

```js
{
  __type(name: "Character") {
    name
    kind
  }
}

// вывод
{
  "data": {
    "__type": {
      "name": "Character",
      "kind": "INTERFACE"
    }
  }
}
```

Как нам получить информацию о полях объекта?

```js
{
  __type(name: 'Droid') {
    name
    fields {
      name
      type {
        name
        kind
      }
    }
  }
}

// вывод
{
  "data": {
    "__type": {
      "name": "Droid",
      "fields": [
        {
          "name": "id",
          "type": {
            "name": null,
            "kind": "NON_NULL"
          }
        },
        {
          "name": "name",
          "type": {
            "name": null,
            "kind": "NON_NULL"
          }
        },
        {
          "name": "friends",
          "type": {
            "name": null,
            "kind": "LIST"
          }
        },
        {
          "name": "friendsConnection",
          "type": {
            "name": null,
            "kind": "NON_NULL"
          }
        },
        {
          "name": "appearsIn",
          "type": {
            "name": null,
            "kind": "NON_NULL"
          }
        },
        {
          "name": "primaryFunction",
          "type": {
            "name": "String",
            "kind": "SCALAR"
          }
        }
      ]
    }
  }
}
```

`id` выглядит странно, оно не имеет названия для типа. Это обясняется тем, что данное поле является "оберткой" для `NON_NULL`. Если мы запросим `ofType` этого поля, то получим тип `ID`.

Аналогичным образом `friends` и `appearsIn` являются обертками для `LIST`.

```js
{
  __type(name: 'Droid') {
    name
    friends {
      name
      type {
        name
        kind
        ofType {
          name
          kind
        }
      }
    }
  }
}

// вывод
{
  "data": {
    "__type": {
      "name": "Droid",
      "fields": [
        {
          "name": "id",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "ID",
              "kind": "SCALAR"
            }
          }
        },
        {
          "name": "name",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "String",
              "kind": "SCALAR"
            }
          }
        },
        {
          "name": "friends",
          "type": {
            "name": null,
            "kind": "LIST",
            "ofType": {
              "name": "Character",
              "kind": "INTERFACE"
            }
          }
        },
        {
          "name": "friendsConnection",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "FriendsConnection",
              "kind": "OBJECT"
            }
          }
        },
        {
          "name": "appearsIn",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": null,
              "kind": "LIST"
            }
          }
        },
        {
          "name": "primaryFunction",
          "type": {
            "name": "String",
            "kind": "SCALAR",
            "ofType": null
          }
        }
      ]
    }
  }
}
```

Напоследок, запросим документацию:

```js
{
  __type(name: 'Droid') {
    name
    description
  }
}

// вывод
{
  "data": {
    "__type": {
      "name": "Droid",
      "description": "An autonomous mechanical character in the Star Wars universe"
    }
  }
}
```
