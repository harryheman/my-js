---
sidebar_position: 13
---

# Mongoose

> `Mongoose` - это [ORM](https://ru.wikipedia.org/wiki/ORM) для `MongoDB`. `Mongoose` предоставляет в распоряжение разработчиков простое основанное на схемах решение для моделирования данных приложения, включающее встроенную проверку типов, валидацию, формирование запросов и хуки, отвечающие за реализацию дополнительной логики обработки запросов.

```js
const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost:27017/test', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

const Cat = mongoose.model('Cat', { name: String })

const kitty = new Cat({ name: 'Cat' })
kitty.save().then(() => console.log('мяу'))
```

## Быстрый старт

Установка

```bash
yarn add mongoose
# или
npm i mongoose
```

Подключение к БД

```js
const mongoose = require('mongoose')
const { MONGODB_URI } = require('./config.js')

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
```

Обработка ошибки и подключения

```js
const db = mongoose.connection
db.on('error', console.error.bind(console, 'Ошибка подключения: '))
db.once('open', () => {
  // Подлючение установлено
})
```

Создание схемы и модели

```js
const { Schema, model } = mongoose

const catSchema = new Schema({
  name: String
})

module.exports = model('Cat', catSchema)
```

Создание объекта

```js
const Cat = require('./Cat.js')

const kitty = new Cat({ name: 'Cat' })
```

Добавление метода

```js
catSchema.methods.speak = function () {
  const greet = this.name
    ? `Меня зовут ${this.name}`
    : `У меня нет имени`

  console.log(greet)
}

const kitty = new Cat({ name: 'Cat' })
kitty.speak() // Меня зовут Cat
```

Сохранение объекта

```js
kitty.save((err, cat) => {
  if (err) console.error(err)
  cat.speak()
})
```

Поиск всех объектов определенной модели

```js
Cat.find((err, cats) => {
  if (err) console.error(err)
  console.log(cats)
})
```

Поиск одного объекта (по имени)

```js
Cat.findOne({ name: 'Cat' }, callback)
```

Для поиска объекта можно использовать регулярное выражение.

## Схема

Создание схемы

```js
const { Schema } = required('mongoose')

const blogSchema = new Schema({
  title: String,
  author: String
  body: String
  comments: [
    {
      body: String
      createdAt: Date
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now()
  },
  hidden: Boolean,
  meta: {
    votes: Number,
    favs: Number
  }
})
```

Дополнительные поля можно добавлять с помощью метода `Schema.add()`

```js
const firstSchema = new Schema()
firstSchema.add({
  name: 'string',
  color: 'string',
  price: 'number'
})

const secondSchema = new Schema()
secondSchema.add(firstSchema).add({ year: Number })
```

---

По умолчанию `Mongoose` добавляет к схеме свойство `_id` (его можно перезаписывать)

```js
const schema = new Schema()
schema.path('_id') // ObjectId { ... }

const Model = model('Test', schema)
const doc = new Model()
doc._id // ObjectId { ... }
```

---

Кроме методов экземпляра, схема позволяет определять статические функции

```js
catSchema.statics.findByName = function(name) {
  return this.find({ name: new RegExp(name, 'i') })
}

// или
catSchema.static('findByName', function(name) { return this.find({ name: new RegExp(name, 'i') }) })

const Cat = model('Cat', catSchema)
const cats = await Cat.findByName('Kitty')
```

---

Также для определения дополнительного функционала можно использовать утилиты для формирования запроса

```js
catSchema.query.byName = function(name) { return this.where({ name: new RegExp(name, 'i') }) }

const Cat = model('Cat', catSchema)

Cat.find().byName('Cat').exec((err, cats) => {
  console.log(cats)
})

Cat.findOne().byName('Cat').exec((err, cat) => {
  console.log(cat)
})
```

---

`Mongoose` позволяет определять вторичные индексы в `Schema` на уровне пути или на уровне `schema`

```js
const catSchema = new Schema({
  name: String,
  type: String,
  tags: { type: [String], index: true } // уровень поля
})

catSchema.index({ name: 1, type: -1 }) // уровень схемы
```

При запуске приложения для каждого индекса вызывается `createIndex()`. Индексы полезны для разработки, но в продакшне их лучше не использовать. Отключить индексацию можно с помощью `autoIndex: false`

```js
mongoose.connect(MONGODB_URL, { autoIndex: false })
// или
catSchema.set('autoIndex', false)
// или
new Schema({...}, { autoIndex: false })
```

---

Схема позволяет создавать виртуальные свойства, которые можно получать и устанавливать, но которые не записываются в БД

```js
// Схема
const personSchema = new Schema({
  name: {
    first: String,
    last: String
  }
})

// Модель
const Person = model('Person', personSchema)

// Документ
const john = new Person({
  name: {
    first: 'John',
    last: 'Smith'
  }
})

// Виртуальное свойство для получения и записи полного имени
personSchema.virtual('fullName')
  .get(function() { return `${this.name.first} ${this.name.last}` })
  .set(function(str) {
    ;[this.name.first, this.name.last] = str.split(' ')
  })

john.fullName // John Smith
john.fullName = 'Jane Air'
john.fullName // Jane Air
```

### Настройки

Настройки схемы могут передаваться в виде объекта в конструктор или в виде пары ключ/значение в метод `set()`

```js
new Schema({...}, options)

const schema = new Schema({...})
schema.set(option, value)
```

- `autoIndex: bool` - определяет создание индексов (по умолчанию `true`)
- `autoCreate: bool` - определяет создание коллекций (по умолчанию `false`)
- `bufferCommands: bool` и `bufferTimaoutMs: num` - определяет, должны ли команды буферизоваться (по умолчанию `true`), и в течение какого времени (по умолчанию отсутствует)
- `capped: num` - позволяет создавать закрытые коллекции (`{ capped: 1024 }`, 1024 - размер в байтах)
- `collection: str` - определяет название коллекции (по умолчанию используется название модели)
- `id: bool` - позволяет отключать получение `_id` через виртуальный геттер `id`
- `_id: bool` - позволяет отключать создание `_id`
- `minimize: bool` - определяет удаление пустых объектов (по умолчанию `true`). Для определения пустого объекта используется утилита `$isEmpty` - `doc.$isEmpty(fieldName)`
- `strict: bool` - определяет, должны ли значения, передаваемые в конструктор модели и отсутствующие в схеме, сохраняться в БД (по умолчанию `true`, значит, не должны)
- `typeKey: str` - позволяет определять ключ типа (по умолчанию `type`)
- `validateBeforeSave: bool` - позволяет отключать валидацию объектов перед их сохранением в БД (по умолчанию `true`)
- `collation: obj` - определяет порядок разрешения коллизий, например, при совпадении двух объектов (`{collation: { locale: 'en_US', strength: 1 }}` - совпадающие ключи/значения на латинице будут игнорироваться)
- `timestamps: bool | obj` - позволяет добавлять к схеме поля `createdAt` и `updatedAt` с типом `Date`. Данным полям можно присваивать другие названия - `{ timestamps: { createdAt: 'created_at' } }`. По умолчанию для создания даты используется `new Date()`. Это можно изменить - `{ timestamps: { currentTime: () => ~~(Date.now() / 1000) } }`

---

Метод `loadClass()` позволяет создавать схемы из классов:

- методы класса становятся методами `Mongoose`
- статические методы класса становятся статическими методами `Mongoose`
- геттеры и сеттеры становятся виртуальными методами `Mongoose`

```js
class MyClass {
  myMethod() { return 42 }
  static myStatic() { return 24 }
  get myVirtual() { return 31 }
}

const schema = new Schema()
schema.loadClass(MyClass)

console.log(schema.methods) // { myMethod: ... }
console.log(schema.statics) // { myStatic: ... }
console.log(schema.virtuals) // { myVirtual: ... }
```

## SchemaTypes

### Что такое SchemaType?

Схема представляет собой объект конфигурации для модели. `SchemaType` - это объект конфигурации для определенного свойства модели. `SchemaType` определяет тип, геттеры, сеттеры и валидаторы свойства.

Доступные `SchemaTypes` (типы)

- String
- Number
- Date
- Buffer
- Boolean
- Mixed
- ObjectId
- Array
- Decimal128
- Map

### Пример

```js
const schema = new Schema({
  name: String,
  binary: Buffer,
  livilng: Boolean,
  updated: {
    type: Date,
    default: Date.now
  },
  age: {
    type: Number,
    min: 18,
    max: 65
  },
  mixed: Schema.Types.Mixed,
  _someId: Schema.Types.ObjectId,
  decimal: Schema.Types.Decimal128,
  array: [],
  ofString: [String],
  ofNumber: [Number],
  ofDates: [Date],
  ofBuffer: [Buffer],
  ofBoolean: [Boolean],
  ofMixed: [Schema.Types.Mixed],
  ofObjectId: [Schema.Types.ObjectId],
  ofArrays: [[]],
  ofArrayOfNumber: [[Number]],
  nested: {
    stuff: {
      type: String,
      lowercase: true,
      trim: true
    }
  },
  map: Map,
  mapOfString: {
    type: Map,
    of: String
  }
})
```

Существует три способа определения типа

```js
// 1
name: String
// 2
name: 'String' | 'string'
// 3
name: {
  type: String
}
```

### type

Для определения свойства с названием `type` необходимо сделать следующее

```js
new Schema({
  asset: {
    // !
    type: { type: String },
    ticker: String
  }
})
```

### Настройки

При определении типа схемы с помощью объекта можно определять дополнительные настройки.

#### Общие

- `required: bool` - определяет, является ли поле обязательным
- `default: any | fn` - значение поля по умолчанию
- `validate: fn` - функция-валидатор
- `get: fn` - кастомный геттер
- `set: fn` - кастомный сеттер
- `alias: str` - алиас, синоним, виртуальный геттер/сеттер
- `immutable: bool` - определяет, является ли поле иммутабельным (неизменяемым)
- `transform: fn` - функция, вызываемая при выполнении `Document.toJSON()`, включая `JSON.stringify()`

```js
const numberSchema = new Schema({
  intOnly: {
    type: Number,
    get: v => Math.round(v),
    set: v => Math.round(v),
    alias: 'i'
  }
})

const Number = model('Number', numberSchema)

const doc = new Number()
doc.intOnly = 2.001
doc.intOnly // 2
doc.i // 2
doc.i = 3.002
doc.intOnly // 3
doc.i // 3
```

#### Индексы

- `index: bool`
- `unique: bool` - определяет, должны ли индексы быть уникальными
- `sparse: bool` - определяет, должны ли индексы создаваться только для индексируемых полей

#### Строка

- `lowercase: bool`
- `uppercase: bool`
- `trim: bool`
- `match: RegExp` - валидатор в виде регулярного выражения
- `enum: arr` - валидатор, проверяющий, совпадает ли строка с каким-либо элементом массива
- `minLength: num`
- `maxLength: num`
- `populate: obj` - дефолтные настройки популяции (извлечения данных, заполнения данными)

#### Число

- `min: num`
- `max: num`
- `enum: arr`
- `populate: obj`

#### Дата

- `min: Date`
- `max: Date`

#### ObjectId

- `populate: obj`

### Особенности использования некоторых типов

#### Даты

При изменении даты, например, с помощью метода `setMonth()`, ее необходимо пометить с помощью `markModified()`, иначе, изменения не будут сохранены

```js
const schema = new Schema('date', { dueDate: Date })
schema.findOne((err, doc) => {
  doc.dueDate.setMonth(3)
  // это не сработает
  doc.save()

  // надо делать так
  doc.markModified('dueDate')
  doc.save()
})
```

#### Mixed (смешанный тип)

`Mongoose` не осуществляет проверку смешанных типов

```js
new Schema({ any: {} })
new Schema({ any: Object })
new Schema({ any: Schema.Types.Mixed })
new Schema({ any: mongoose.Mixed })
```

При изменении значений смешанного типа, их, как и даты, необходимо помечать с помощью `markModified`.

#### ObjectId

`ObjectId` - это специальный тип, обычно используемый для уникальных идентификаторов

```js
const carSchema = new Schema({ driver: mongoose.ObjectId })
```

`ObjectId` - это класс, а сами `ObjectIds` - это объекты, которые, обычно, представлены в виде строки. При преобразовании `ObjectId` с помощью метода `toString()`, мы получаем 24-значную шестнадцатиричную строку

```js
const Car = model('Car', carSchema)

const car = new Car()
car.driver.toString() // 5e1a0651741b255ddda996c4
```

#### Map

`MongooseMap` - это подкласс JS-класса `Map`. Ключи карт должны быть строками

```js
const userSchema = new Schema({
  socialMediaHandles: {
    type: Map,
    of: String
  }
})

const User = model('User', userSchema)
const user = new User({
  socialMediaHandles: {}
})
```

Для получения и установки значений следует использовать `get()` и `set()`

```js
user.socialMediaHandles.set('github', 'username')
// или
user.set('socialMediaHandles.github', 'username')

user.socialMediaHandles.get('github') // username
// или
user.get('socialMediaHandles.github') // username
```

Для популяции элементов в карту используется синтаксис `$*`

```js
const userSchema = new Schema({
  socialMediaHandles: {
    type: Map,
    of: new Schema({
      handle: String,
      oauth: {
        type: ObjectId,
        ref: 'OAuth'
      }
    })
  }
})
const User = model('User', userSchema)
// заполняем свойство `oauth` данными пользователя
const user = await User.findOne().populate('socialMediaHandles.$*.oauth')
```

#### Геттеры

Геттеры похожи на виртуальные свойства для полей схемы. Предположим, что мы хотим сохранять аватар пользователя в виде относительного пути и затем добавлять к нему название хоста в приложении

```js
const root = 'https://examplce.com/avatars'

const userSchema = new Schema({
  name: String,
  avatar: {
    type: String,
    get: v => `${root}/${v}`
  }
})

const User = model('User', userSchema)

const user = new User({ name: 'John', avatar: 'john.png' })
user.avatar // https://examplce.com/avatars/john.png
```

#### Схема

В качестве типов полей схемы можно использовать другие схемы

```js
const subSchema = new Schema({})

const schema = new Schema({
  data: {
    type: subSchema,
    default: {}
  }
})
```

## Подключение

Для подключения к `MongoDB` используется метод `mongoose.connect()`

```js
mongoose.connect(MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
```

Данный метод принимает строку с адресом БД и объект с настройками.

### Буферизация

За счет буферизации `Mongoose` позволяет использовать модели, не дожидаясь подключения к БД. Отключить буферизацию можно с помощью `bufferCommands: false`. Отключить ожидание создания коллекций можно с помощью `autoCreate: false`

```js
const schema = new Schema({
  name: String
}, {
  capped: { size: 1024 },
  bufferCommands: false,
  autoCreate: false
})
```

### Обработка ошибок

Существует 2 класса ошибок, возникающих при подключении к БД:

- Ошибка при первоначальном подключении. При провале подключения `Mongoose` отправляет событие `error` и промис, возвращаемый `connect()`, отклоняется. При этом, `Mongoose` не пытается выполнить повторное подключение
- Ошибка после установки начального соединения. В этом случае `Mongoose` пытается выполнить повторное подключение

Для обработки первого класса ошибок используется `catch()` или `try/catch`

```js
mongoose.connect(uri, options)
  .catch(err => handleError(err))

// или
try {
  await mongoose.connect(uri, options)
} catch (err) {
  handleError(err)
}
```

Для обработки второго класса ошибок нужно прослушивать соответствующее событие

```js
mongoose.connection.on('error', err => {
  handleError(err)
})
```

### Настройки

- `bufferCommands: bool` - позволяет отключать буферизацию
- `user: str` / `pass: str` - имя пользователя и пароль для аутентификации
- `autoIndex: bool` - позволяет отключать автоматическую индексацию
- `dbName: str` - название БД для подключения

Важные

- `useNewUrlParser: bool` - `true` означает использование нового MongoDB-парсера для разбора строки подключения (должно быть включено во избежание предупреждений)
- `useCreateIndex: bool` - `true` означает использование `createIndex()` вместо `ensureIndex()` для создания индексов (должно быть включено при индексации)
- `useFindAndModify: bool` - `false` означает использование нативного `findOneAndUpdate()` вместо `findAndModify()`
- `useUnifiedTopology: bool` - `true` означает использование нового движка MongoDB для управления подключением (должно быть включено во избежание предупреждений)
- `poolSize: num` - максимальное количество сокетов для данного подключения
- `socketTimeoutMS: num` - время, по истечении которого неактивный сокет отключается от БД
- `family: 4 | 6` - версия IP для подключения
- `authSource: str` - БД, используемая при аутентификации с помощью `user` и `pass`

### Колбек

Функция `connect()` также принимает колбек, возвращающий промис

```js
mongoose.connect(uri, options, (err) => {
  if (err) // обработка ошибки
  // успех
})

// или
mongoose.connect(uri, options).then(
  () => { /* обработка ошибки */ },
  err => { /* успех */ }
)
```

### События, возникающие при подключении

- `connecting` - начало подключения
- `connected` - успешное подключение
- `open` - эквивалент `connected`
- `disconnecting` - приложение вызвало `Connection.close()` для отключения от БД
- `disconnected` - потеря подключения
- `close` - возникает после выполнения `Connection.close()`
- `reconnected` - успешное повторное подключение
- `error` - ошибка подключения
- `fullsetup` - возникает при подключении к набору реплик (replica set), когда выполнено подключение к основной реплике и одной из вторичных
- `all` - возникает при подключении к набору реплик, когда выполнено подключение ко всем серверам
- `reconnectedFailed` - провал всех `reconnectTries` (попыток выполнения повторного подключения)

### Подключение к набору реплик

```js
mongoose.connect('mongodb://<username>:<password>@host1.com:27017,host2.com:27017,host3.com:27017/testdb')

// к одному узлу
mongoose.connect('mongodb://host1.com:port1/?replicaSet=rsName')
```

### Подключение к нескольким БД

Подключение к нескольким БД выполняется с помощью метода `createConnection()`. Существует два паттерна для выполнения такого подключения:

- Экспорт подключения и регистрация моделей для подключения в одном файле

```js
// connections/fast.js
const mongoose = require('mongoose')

const conn = mongoose.createConnection(process.env.MONGO_URI)
conn.model('User', require('../schemas/user'))

module.exports = conn

// connections/slow.js
const mongoose = require('mongoose')

const conn = mongoose.createConnection(process.env.MONGO_URI)
conn.model('User', require('../schemas/user'))
conn.model('PageView', require('../schemas/pageView'))

module.exports = conn
```

- Регистрация подключений с функцией внедрения зависимостей

```js
const mongoose = require('mongoose')

module.exports = function connFactory() {
  const conn = mongoose.createConnection(process.env.MONGO_URI)

  conn.model('User', require('../schemas/user'))
  conn.model('PageView', require('../schemas/pageView'))

  return conn
}
```

## Модель

Модели - это конструкторы, компилируемые из определений `Schema`. Экземпляр модели называется документом. Модели отвечают за создание и получение документов из БД.

### Компиляция модели

При вызове `mongoose.model()` происходит компиляция модели

```js
const schema = new Schema({ name: 'string', age: 'number' })
const User = model('User', schema)
```

Первый аргумент - название коллекции. В данном случае будет создана коллекция `users`.

*Обратите внимание*: функция `model()` создает копию `schema`. Убедитесь, что перед вызовом `model()` полностью настроили `schema` (включая определение хуков).

### Создание и сохранение документа

```js
const User = model('User', userSchema)

const user = new User({ name: 'John', age: 30 })
user.save((err) => {
  if (err) return handleError(err)
  console.log(user)
})

// или
User.create({ name: 'John', age: 30 }, (err, user) => {
  if (err) return handleError(err)
  console.log(user)
})

// или для создания нескольких документов
User.insertMany([
  {
    name: 'John',
    age: 30
  },
  {
    name: 'Jane',
    age: 20
  }
], (err) => {})
```

### Получение документов

Для получения документов из БД используются методы `find()`, `findById()`, `findOne()`, `where()` и др.

```js
User.find({ name: 'John' }).where('createdAt').gt(oneYearAgo).exec(callback)
```

### Удаление документов

Для удаления документов используются методы `deleteOne()`, `deleteMany()` и др.

```js
User.deleteOne({ name: 'John' }, (err) => {})
```

### Обновление документов

Для обновления документов используется метод `updateOne()` и др.

```js
User.updateOne({ name: 'John' }, { name: 'Bob' }, (err, res) => {
  // Обновляется как минимум один документ
  // `res.modifiedCount` содержит количество обновленных документов
  // Обновленные документы не возвращаются
})
```

Если мы хотим обновить один документ и вернуть его, то следует использовать `findOneAndUpdate()`.

### Поток изменений

Поток изменений позволяет регистрировать добавление/удаление и обновление документов

```js
const run = async () => {
  const userSchema = new Schema({
    name: String
  })
  const User = model('User', userSchema)

  // Создаем поток изменений
  // При обновлении БД отправляется (emitted) событие `change`
  User.watch()
    .on('change', data => console.log(new Date(), data))

  console.log(new Date(), 'Создание документа')
  await User.create({ name: 'John Smith' })
  console.log(new Date(), 'Документ успешно создан')
}
```

## Документ

Документы - это экземпляры моделей. Документ и модель - разные классы `Mongoose`. Класс модели является подклассом класса документа. При использовании конструктора модели создается новый документ.

### Извлечение документа

```js
const doc = await Model.findOne()
```

### Обновление документа с помощью `save()`

Документы можно изменять с помощью обычного присвоения - `Mongoose` автоматически преобразует его в оператор обновления `MongoDB`

```js
doc.name = 'foo'

// `Mongoose` отправляет `updateOne({ _id: doc._id }, { $set: { name: 'foo' } })` в `MongoDB`
await doc.save()
```

Метод `save()` возвращает промис, который при успешном завершении операции возвращает сохраненный документ

```js
doc.save().then((savedDoc) => {
  savedDoc === doc // true
})
```

При отсутствии документа с указанным `_id`, выбрасывается исключение `DocumentNotFoundError`.

### Обновление документа с помощью запросов

Если нам не хватает `save()`, то можно создать собственное обновление

```js
// Обновляем все документы в коллекции `users`
await User.updateMany({}, { $set: { name: 'John' } })
```

*Обратите внимание*, что `update()`, `updateMany()`, `findOneAndUpdate()` и др. не запускают посредников `save()`.

### Валидация

Документы подвергаются кастингу и валидации перед сохранением. Кастинг представляет собой проверку типа, а валидация - проверку дополнительных настроек (например, `min` для типа `Number`). Внутренне `Mongoose` вызывает метод документа `validate()` перед сохранением

```js
const userSchema = new Schema({ name: String, age: { type: Number, min: 18 } })
const User = model('User', userSchema)

const user = new User({ name: 'John', age: 'many' })
// Кастинг типа `Number` провален для значения `many` поля `age`
await user.validate()

const user2 = new User(name: 'Jane', age: 17)
// Значение поля `age` (17) меньше минимально допустимого значения (18)
```

### Перезапись

Существует два способа перезаписи документов (замены всех ключей документа). Первый способ - функции `Document.overwrite()` и `save()`

```js
const user = await User.findOne({ _id })

// Устанавливаем `name` и удаляем остальные свойства
user.overwrite({ name: 'John' })
await doc.save()
```

Второй способ - метод `Model.replaceOne()`

```js
await User.replaceOne({ _id }, { name: 'John' })
```

## Субдокумент (документ в документе)

Субдокументы - это документы, встроенные в другие документы. В `Mongoose` это означает, что одни схемы могут быть вложены в другие.

```js
const childSchema = new Schema({ name: String })

const parentSchema = new Schema({
  // массив субдокументов
  children: [childSchema],
  // единичный вложенный субдокумент
  child: childSchema
})
```

### Что такое субдокументы?

Субдокументы похожи на обычные документы. Вложенные схемы могут иметь посредников, кастомную логику валидации, виртуальные свойства и т.д. Главное отличие субдокументов состоит в том, что они не сохраняются индивидуально, они сохраняются вместе с родительским документом.

```js
const Parent = model('Parent', parentSchema)
const parent = new Parent({ children: [
  { name: 'John' },
  { name:'Jane' }
] })
parent.children[0].name = 'Bob'

// `parent.children[0].save()` запустит посредников
// но не сохранит документ. Для этого нужно сохранить его предка
parent.save()
```

Вызов `save()` предка запускает выполнение `save()` всех потоков. Тоже самое справедливо для `validate()`.

Дочерние посредники `pre('save')` и `pre('validate')` выполняются до родительского `pre('save')`, но после родительского `pre('validate')`

```js
// числа 1-4 будут выведены по порядку
const childSchema = new Schema({ name: String })

childSchema.pre('validate', (next) => {
  console.log(2)
  next()
})

childSchema.pre('save', (next) => {
  console.log(3)
  next()
})

const parentSchema = new Schema({
  child: childSchema
})

parentSchema.pre('validate', (next) => {
  console.log(1)
  next()
})

parentSchema.pre('save', (next) => {
  console.log(4)
  next()
})
```

### Субдокументы и вложенные пути

Вложенные пути немного отличаются от субдокументов. В приведенном ниже примере у нас имеется две схемы: одна с субдокументом `child`, другая с вложенным путем `child`

```js
// Субдокумент
const subdocSchema = new Schema({
  child: new Schema({
    name: String,
    age: Number
  })
})
const Subdoc = model('Subdoc', subdocSchema)

// Вложенный путь
const nestedSchema = new Schema({
  child: {
    name: String,
    age: Number
  }
})
const Nested = model('Nested', nestedSchema)
```

Отличия:

- экземпляры `Nested` никогда не имеют `child === undefined`. Мы может определять подсвойства `child` даже при отсутствии самого `child`. Но экземпляры `Subdoc` могут иметь `child === undefined`

```js
const doc1 = new Subdoc({})
doc1.child === undefined // true
doc1.child.name = 'test' // TypeError: cannot read property...

const doc2 = new Nested({})
doc2.child === undefined // false
console.log(doc2.child) // MongooseDocument { undefined }
doc2.child.name = 'test' // работает
```

- метод `Document.set()` выполняет объединение для вложенных путей и перезапись для субдокументов

```js
const doc1 = new Subdoc({
  child: {
    name: 'John',
    age: 30
  }
})
doc1.set({
  child: {
    age: 20
  }
})
doc1.child // { age: 20 }

const doc2 = new Nested({
  child: {
    name: 'John',
    age: 30
  }
})
doc2.set({
  child: {
    age: 20
  }
})
doc2.set({
  child: {
    age: 20
  }
})
doc2.child // { name: 'John', age: 20 }
```

### Значения субдокументов по умолчанию

Пути субдокументов имеют значение `undefined` (к ним не применяются настройки `default`) до тех пор, пока им не будет присвоено ненулевое значение

```js
const subdocSchema = new Schema({
  child: new Schema({
    name: String,
    age: {
      type: Number,
      default: 18
    }
  })
})
const Subdoc = model('Subdoc', subdocSchema)

// настройка `default` поля `age` не будет иметь эффекта, поскольку значением `child` является `undefined`
const doc = new Subdoc()
doc.child // undefined
```

### Получение субдокумента

Для поиска субдокумента по его `_id` (устанавливается по умолчанию) используется специальный метод `id()`

```js
const subdoc = parent.children.id(_id)
```

### Добавление субдокументов в массив

Такие методы как `push()`, `unshift()`, `addToSet()` и др. осуществляют прозрачный кастинг передаваемых аргументов

```js
const Parent = model('Parent', parentSchema)
const parent = new Parent()

parent.children.push({ name: 'John' })
const subdoc = parent.children[0]
console.log(subdoc) // { _id: '...', name: 'John' }
subdoc.isNew // true

parent.save()
```

Для того, чтобы создать документ без его добавления в массив, следует использовать метод `create()`

```js
const subdoc = parent.children.create({ name: 'Jane' })
```

### Удаление субдокументов

У каждого субдокумента есть метод `remove()`. Для массива субдокументов данный метод эквивалентен вызову `pull()`. Для единичного субдокумента он эквивалентен установке значения субдокумента в `null`

```js
// эквивалент `parent.children.pull(_id)`
parent.children.id(_id).remove()

// эквивалент `parent.child = null`
parent.child.remove()

parent.save()
```

### Получение предка субдокумента

Для получения непосредственного предка субдокумента используется функция `parent()`, а для получения предка верхнего уровня (для глубоко вложенных субдокументов) - функция `ownerDocument()`.

### Альтернативный синтаксис

При создании схемы с помощью массива объектов, `Mongoose` автоматически преобразует объекты в схемы

```js
const parentSchema = new Schema({
  children: [
    {
      name: String
    }
  ]
})
// эквивалент
const parentSchema = new Schema({
  children: [
    new Schema({
      name: String
    })
  ]
})
```

*Обратите внимание*, что в случае единичного объекта, вместо схемы создается вложенных путь. Для того, чтобы сообщить `Mongoose` о необходимости создания схемы для единичного объекта, следует использовать настройку `typePojoToMixed: false`

```js
const schema = new Schema({
  nested: {
    // `new Schema({ prop: String })`
    type: { prop: String },
    required: true
  }
}, { typePojoToMixed: false })
```

## Запрос

Модель предоставляет несколько статических вспомогательных функций. Каждая функция возвращает объект `Query`

- `Model.deleteMany()`
- `Model.deleteOne()`
- `Model.find()`
- `Model.findById()`
- `Model.findByIdAndDelete()`
- `Model.findByIdAndRemove()`
- `Model.findByIdAndUpdate()`
- `Model.findOne()`
- `Model.findOneAndDelete()`
- `Model.findOneAndRemove()`
- `Model.findOneAndReplace()`
- `Model.findOneAndUpdate()`
- `Model.replaceOne()`
- `Model.updateMany()`
- `Model.updateOne()`

Запрос может выполняться двумя способами:

- с помощью колбека - запрос выполняется асинхронно и результат передается в колбек
- с помощью метода `then()` запроса, что позволяет использовать его как промис

### Выполнение запроса

При выполнении запроса с помощью `callback`, запрос может быть определен в виде JSON документа

```js
const User = model('User', userSchema)

// Ищем пользователей, фамилия которых совпадает с `Smith`, выбираем поля `name` и `occupation`
User.findOne(
  { 'name.last': 'Smith' },
  'name occupation',
  (err, user) => {
    if (err) return handleError(err)
    console.log(user)
  }
)
```

Запрос выполняется, его результат передается в `callback`. Сигнатура колбеков всегда такая: `callback(error, result)`. При возникновении ошибки, параметр `error` содержит объект ошибки, а `result` является нулевым. При успешном выполнении запроса `error` является нулевым, а `result` заполняется (populate) данными из результата запроса.

`result` зависит от операции: для `findOne()` - это потенциально ненулевой единичный документ, для `find()` - список документов, для `count()` - количество документов, для `update()` - количество обновленных документов и т.д.

Пример без колбека

```js
// Ищем пользователей, фамилия которых совпадает с `Smith`
const query = User.findOne({ 'name.last', 'Smith' })

// выбираем поля `name` и `occupation`
query.select('name occupation')

// выполняем запрос
query.exec((err, user) => {
  if (err) return handleError(err)
  console.log(user)
})
```

В приведенном примере переменная `query` имеет тип `Query`. `Query` позволяет формировать запрос двумя способами

```js
// Документ JSON
User
  .find({
    'name.last': 'Smith',
    // gt - greater than, больше чем; lt - less than, меньше чем
    age: { $gt: 17, $lt: 66 },
    // in - один из вариантов
    likes: { $in: ['playing guitar', 'swimming'] }
  })
  .limit(10)
  .sort({ occupation: -1 })
  .select({ name: 1, occupation: 1 })
  .exec(callback)

// Строитель (builder) запроса
User
  .find({ 'name.last': 'Smith' })
  .where('age').gt(17).lt(66)
  .where('likes').in(['playing guitar', 'swimming'])
  .limit(10)
  .sort('-occupation')
  .select('name occupation')
  .exec(callback)
```

### Запросы не являются промисами

Несмотря на то, что у запросов есть метод `then()`, это всего лишь соглашение, они не являются промисами. В отличие от промисов, вызов `then()` запроса может привести к его многократному выполнению.

В приведенном ниже примере `updateMany()` вызывается 3 раза

```js
const q = Model.updateMany({}, {completed: true}, () => {
  console.log('Первое обновление')
})

q.then(() => {
  console.log('Второе обновление')
})
q.then(() => {
  console.log('Третье обновление')
})
```

Смешивание колбеков и промисов может привести к дублированию операций.

## Валидация

Для валидации характерно следующее:

- Она определяется в `SchemaType` (при определении схемы)
- Валидация - это посредник (middleware). `Mongoose` регистрирует ее как хук `pre('save')` для каждой схемы
- Автоматическую валидацию, выполняемую перед сохранением документа, можно отключить с помощью настройки `validateBeforeSave: false`
- Валидаторы можно запускать вручную с помощью `doc.validate(callback)` или `doc.validateSync()`
- Помечать поля как невалидные можно с помощью `doc.invalidate(...)`
- Валидаторы не запускаются для неопределенных значений, кроме валидатора `required`
- Валидаторы выполняются асинхронно и рекурсивно: при вызове `Model.save()` также выполняется валидация субдокументов. При возникновении ошибки, ее получает колбек `Model.save()`
- Можно создавать собственные валидаторы

### Встроенные валидаторы

`Mongoose` предоставляет несколько встроенных валидаторов:

- Все `SchemaTypes` имеют встроенный валидатор `required` (поле является обязательным для заполнения)
- Числа имеют валидаторы `min` и `max`
- Строки имеют валидаторы `enum`, `match`, `minLength` и `maxLength`

Значением валидатора является либо соответствующий примитив - условие, которому должно удовлетворять значение поля, либо массив, где первым элементом является примитив, а вторым - сообщение об ошибке

```js
const breakfastSchema = new Schema({
  eggs: {
    type: Number,
    min: [3, 'Слишком мало яиц'],
    max: 6
  },
  bacon: {
    type: Number,
    required: [true, 'Без бекона?']
  },
  drink: {
    type: String,
    enum: ['Кофе', 'Чай'],
    required: function () {
      return this.bacon >= 2
    }
  }
})
const Breakfast = model('Breakfast', breakfastSchema)

const badBreakfast = new Breakfast({
  eggs: 2,
  bacon: 2,
  drink: 'Молоко'
})
let error = badBreakfast.validateSync()
error.errors['eggs'].message // Слишком мало яиц
error.errors['drink'].message // `Молоко` is not a valid enum value for path `drink`

badBreakfast.drink = null
error = badBreakfast.validateSync()
error.errors['drink'].message // Path `drink` is required

badBreakfast.bacon = null
error = badBreakfast.validateSync()
error.errors['bacon'].message // Без бекона?
```

*Обратите внимание*, что настройка `unique` не является валидатором. Это утилита для генерации уникальных индексов

```js
const uniqueUsernameSchema = new Schema({
  username: {
    type: String,
    unique: true
  }
})
```

### Кастомные валидаторы

Кастомные валидаторы определяются следующим образом:

```js
const userSchema = new Schema({
  phone: {
    type: String,
    validate: {
      validator: (v) => /+7\d{10}/.test(v),
      message: props => `${props.value} не является валидным номером сотового телефона!`
    },
    required: [true, 'Номер телефона является обязательным']
  }
})

const User = model('User', userSchema)
const user = new User()

user.phone = '3214256'
let error = user.validateSync()
error.errors['phone'].message // `3214256` не является валидным номером сотового телефона!

user.phone = ''
error = user.validateSync()
error.errors['phone'].message // Номер телефона является обязательным
```

### Асинхронные кастомные валидаторы

Также существует два способа определения асинхронных кастомных валидаторов:

- с помощью `Promise.reject()`
- с помощью `Promise.resolve(false)`

```js
const userSchema = new Schema({
  name: {
    type: String,
    validate: () => Promise.reject(new Error('Упс!'))
  },
  email: {
    type: String,
    validate: {
      validator: () => Promise.resolve(false),
      message: 'Валидация email провалилась'
    }
  }
})
```

### Ошибки валидации

Если при выполнении валидации возникли ошибки, возвращается объект `errors`, каждое значение которого представляет собой объект `ValidatorError` (`unique` возвращает `DuplicateKeyError`). Объект `ValidatorError` содержит свойства `kind`, `path`, `value` и `message`. Он также может содержать свойство `reason`. Если в валидаторе было выброшено исключение, данное свойство будет содержать это исключение.

### Ошибки кастинга

Перед запуском валидаторов `Mongoose` выполняет проверку значений на соответствие типам. Данный процесс называется кастингом (casting). При провале кастинга, объект `error.errors` будет содержать объект `CastError`. Кастинг выполняется перед валидацией, при провале кастинга валидация не выполняется.

### Валидатор `required` для вложенных объектов

Для того, чтобы сделать вложенный объект обязательным, следует определить его в виде схемы

```js
// Будет выброшено исключение, поскольку `name` не является самостоятельным путем
let userSchema = new Schema({
  name: {
    first: String,
    last: String
  },
  required: true
})

const nameSchema = new Schema({
  first: String,
  last: String
})

// так будет работать
userSchema = new Schema({
  name: {
    type: nameSchema,
    required: true
  }
})
```

### Валидаторы обновления

`Mongoose` также поддерживает валидацию для операций `update()`, `updateOne()`, `updateMany()` и `findOneAndUpdate()`. По умолчанию такая валидацию отключена. Для того, чтобы ее включить, следует установить настройку `runValidators` в значение `true`

```js
const toySchema = new Schema({
  color: {
    type: String,
    validate: (v) => /red|green|blue/i.test(v), 'Недопустимый цвет'
  },
  name: String
})

const Toy = model('Toy', toySchema)

const opts = { runValidators: true }
Toy.updateOne({}, { color: 'не цвет' }, opts, (err) => {
  console.error(err) // Недопустимый цвет
})
```

*Обратите внимание*: валидаторы обновления имеют некоторые особенности, связанные с потерей контекста (`this`), успешной валидацией несуществующих путей и возможностью их использования только в некоторых операциях.

## Посредники

Посредники (промежуточное программное обеспечение, промежуточный слой, middlewares), которые тажке называются пре и пост хуками, являются функциями, перехватывающими выполнение асинхронных функций. Посредники определяются на уровне схемы и часто используются для создания плагинов.

### Типы посредников

`Mongoose` предоставляет 4 типа посредников: посредники документа, посредники модели, посредники агрегации и посредники запроса. В посредниках документов `this` указывает на документ. Такие посредники поддерживаются для следующих функций документа:

- `validate`
- `save`
- `remove`
- `updateOne`
- `deleteOne`
- `init` (хуки `init` являются синхронными)

В посредниках запросов `this` указывает на запрос. Такие посредники поддерживаются для следующих функций моделей и запросов:

- `count`
- `deleteMany`
- `deleteOne`
- `find`
- `findOne`
- `findOneAndDelete`
- `findOneAndRemove`
- `findOneAndUpdate`
- `remove`
- `update`
- `updateOne`
- `updateMany`

Посредники агрегации выполняются при вызове `call()` на агрегируемом объекте. В таких посредниках `this` указывает на объект агрегации

- `aggregate`

В посредниках модели `this` указывает на модель. Поддерживаются следующие посредники модели:

- `insertMany`

*Обратите внимание*: при определении `schema.pre('remove')` автоматически регистрируется посредник для `doc.remove()`. Для того, чтобы посредник выполнялся при вызове `Query.remove()`, следует указать `schema.pre('remove', { query: true, document: false }, fn)`.

*Обратите внимание*: в отличие от `schema.pre('remove')`, `Mongoose` по умолчанию автоматически регистрирует посредников для `Query.updateOne()` и `Query.deleteOne()`. Это означает, что `doc.updateOne()` и `Model.updateOne()` запускают хуки `updateOne`, но `this` указывает на запрос, а не на документ. Для регистрации `updateOne` или `deleteOne` в качестве посредников документа следует указать `schema.pre('updateOne', { document: true, query: false })`.

*Обратите внимание*: функция `create()` запускает хуки `save()`.

### Pre

Предварительные посредники выполняются один за другим, когда каждый посредник вызывает `next()`

```js
const schema = new Schema(...)
schema.pre('save', (next) => {
  // ...
  next()
})
```

Вместо `next()` можно использовать функцию, возвращающую промис, или `async/await`

```js
schema.pre('save', () =>
  doStuff().then(() => doMoreStuff())
)

// или
schema.pre('save', async () => {
  await doStuff()
  await doMoreStuff()
})
```

*Обратите внимание*: вызов `next()` не останавливает выполнение функции.

#### Случаи использования

Посредники могут использоваться для атомизации логики модели. Другие варианты:

- сложная валидация
- удаление зависимых документов (удаление постов пользователя при удалении самого пользователя)
- асинхронные настройки по умолчанию
- выполнение асинхронных задач

#### Ошибки в предварительных хуках

При возникновении ошибки в хуке, другие хуки или соответствующая функция не выполняются. Вместо этого, ошибка передается в колбек, а возвращенный промис отклоняется. Существует несколько способов обработки таких ошибок:

```js
schema.pre('save', (next) => {
  const err = new Error('Что-то пошло не так')
  // При вызове `next()` с аргументом, предполагается, что данный аргумент
  // является ошибкой
  next(err)
})

schema.pre('save', () =>
  // Также можно вернуть отклоненный промис
  new Promise((res, rej) => {
    reject(new Error('Что-то пошло не так'))
  })
)

schema.pre('save', () => {
  // или выбросить синхронное исключение,
  throw new Error('Что-то пошло не так')
})

schema.pre('save', async () => {
  await Promise.resolve()
  // или выбросить исключение в асинхронной функции
  throw new Error('Что-то пошло не так')
})

// Позже

// Изменения не будут сохранены в БД, поскольку в предварительном хуке возникает ошибка
doc.save((err) => {
  console.error(err) // Что-то пошло не так
})
```

### Post

Последующие посредники выполняются после метода и всех его предварительных посредников

```js
schema.post('init', (doc) => {
  console.log('%s был получен из БД', doc._id)
})

schema.post('validate', (doc) => {
  console.log('%s был проверен (но еще не сохранен)', doc._id)
})

schema.post('save', (doc) => {
  console.log('%s был сохранен', doc._id)
})

schema.post('remove', (doc) => {
  console.log('%s был удален', doc._id)
})
```

#### Асинхронные последующие хуки

Если последующий хук вызывается с 2 аргументами, `Mongoose` предполагает, что второй параметр - это функция `next()`, предназначенная для вызова следующего посредника в цепочке

```js
schema.post('save', (doc, next) => {
  const timerId = setTimeout(() => {
    console.log('post1')
    // Запускаем второй хук
    next()

    clearTimeout(timerId)
  }, 100)
})

// Не будет выполняться до вызова `next()` в первом посреднике
schema.post('save', (doc, next) => {
  console.log('post2')
  next()
})
```

### Определение посредников

Посредники и плагины должны определяться до компиляции модели посредством вызова `mongoose.model()`.

Если определение схемы и экспорт модели выполняются в одном файле, глобальные плагины должны определяться перед вызовом `require()`.

### Хуки сохранения/валидации

Функция `save()` запускает хуки `validate()`, поскольку `Mongoose` имеет встроенный хук `pre('save')`, вызывающий `validate()`. Это означает, что все хуки `pre('validate')` и `post('validate')` вызываются перед хуками `pre('save')`.

### Конфликты имен

Для `remove()` поддерживаются как хуки документов, так и хуки запросов.

Для переключения хука `remove()` между `Document.remove()` и `Model.remove()` следует передать объект с настройками в `Schema.pre()` или `Schema.post()`

```js
// Только посредник документа
schema.pre('remove', { document: true, query: false }, () => {
  console.log('Удаление документа')
})

// Только посредник запроса. Будет вызываться только для `Model.remove()`,
// но не для `doc.remove()`
schema.pre('remove', { query: true, document: false }, () => {
  console.log('Удаление')
})
```

### Посредники для обработки ошибок

Выполнение посредника, обычно, останавливается при первом вызове `next()` с ошибкой. Тем не менее, существует специальный тип последующих посредников - посредники для обработки ошибок, которые выполняются при возникновении ошибок. Такие посредники могут использоваться для вывода сообщений об ошибках в удобочитаемом формате.

Посредники для обработки ошибок определяются как посредники, в качестве первого параметра принимающие возникшую ошибку

```js
const chema = new Schema({
  name: {
    type: String,
    // При сохранении дубликата,
    // будет выброшена `MongoError` с кодом 11000
    unique: true
  }
})

// Обработчик принимает три параметра: возникшую ошибку, документ
// и функцию `next()`
schema.post('save', (err, doc, next) => {
  if (err.name === 'MongoError' && err.code === 11000) {
    next(new Error('Попытка сохранения дубликата'))
  } else {
    next()
  }
})

// Это запустит обработчик ошибок `post('save')`
User.create([{ name: 'John Smith' }, { name: 'John Smith' }])
```

Рассматриваемые посредники также работают с посредниками запросов. Мы может определить хук `post('update')`, который будет перехватывать ошибки, связанные с дубликатами

```js
schema.post('update', (err, res, next) => {
  if (err.name === 'MongoError' && err.code === 11000) {
    next(new Error('Попытка создания дубликата'))
  } else {
    next()
  }
})

const users = [
  { name: 'John Smith' },
  { name: 'Jane Air' }
]
User.create(users, (err) => {
  User.update({ name: 'Jane Air' }, { $set: { name: 'John Smith' } }, (err) => {
    console.error(err) // Попытка создания дубликата
  })
})
```

## Популяция

Функция `populate()` позволяет ссылаться на документы из других коллекций.

Популяция (заполнение, population) - это процесс автоматической замены определенных путей в документе документами из других коллекций. Мы можем заполнять пути единичными документами, несколькими документами, единичным объектом, несколькими документами или всеми документами, возвращаемыми запросом. Рассмотрим пример

```js
const { Schema, model } = require('mongoose')

const userSchema = new Schema({
  _id: Schema.Types.ObjectId,
  name: String,
  age: Number,
  posts: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Story'
    }
  ]
})

const postSchema = new Schema({
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  title: String,
  subscribers: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  ]
})

const Post = model('Post', postSchema)
const User = model('User', userSchema)
```

У нас имеется две модели. У модели `User` есть поле `posts`, значением которого является массив `ObjectId`. Настройка `ref` сообщает `Mongoose`, какую модель использовать в процессе популяции, в нашем случае такой моделью является `Post`. Все сохраняемые здесь `_id` должны быть `_id` документов из модели `Post`.

*Обратите внимание*: в качестве ссылок могут использоваться `ObjectId`, `String`, `Number` и `Buffer`. Однако, по возможности всегда следует использовать `ObjectId`.

### Сохранение ссылок

Сохранение ссылок похоже на сохранение обычных свойств: достаточно присвоить значение `_id`

```js
const author = new User({
  _id: new mongoose.Types.ObjectId(),
  name: 'John Smith',
  age: 30
})

author.save((err) => {
  if (err) return handleError(err)

  const post1 = new Post({
    title: 'Мой первый пост',
    author: author._id // присваиваем `_id` из `author`
  })

  post1.save((err) => {
    if (err) return handleError(err)
    // готово
  })
})
```

### Популяция

Заполним поле `author` поста с помощью строителя запроса

```js
Post
  .findOne({ title: 'Мой первый пост' })
  .populate('author')
  .exec((err, post) => {
    if (err) return handleError(err)

    console.log('Автором поста является %s', post.author.name)
    // Автором поста является John Smith
  })
```

### Установка заполняемых полей

```js
Post.findOne({
  title: 'Мой первый пост'
}, (err, post) => {
  if (err) return handleError(err)

  post.author = author
  console.log(post.author.name) // John Smith
})
```

### Определение заполняемости поля

Для определения заполняемости поля используется функция `populated()`

```js
post.populated('author') // truthy

post.depopulate('author')
post.populated('author') // undefined
```

Это может использоваться для получения `id` автора. Однако, специально для таких случаев `Mongoose` предоставляет геттер `_id`, позволяющий получать идентификатор независимо от заполняемости поля

```js
post.populated('author') // truthy
post.author._id // ObjectId

post.depopulate('author')
post.populated('author') // undefined

post.author._id // ObjectId, это возможно благодаря специальному геттеру
```

### Что если соответствующий документ отсутствует?

В этом случае `post.author` будет иметь значение `null`

```js
await User.deleteOne({ name: 'John Smith' })

const post = await User.findOne({ title: 'Мой первый пост' }).populate('author')
post.author // null
```

При определении `authors` в `postSchema` в виде массива, `populate()` вернет пустой массив.

### Выборка значений

Для выполнения выборки достаточно передать методу `populate()` строку в качестве второго аргумента

```js
Post
  .findOne({ title: 'Мой первый пост' })
  .populate('author', 'name') // вернется только имя автора
  .exec((err, post) => {
    if (err) return handleError(err)

    console.log('Автора зовут %s', post.author.name)
    // Автора зовут John Smith

    console.log('Автору %s лет', post.author.age)
    // Автору null лет
  })
```

### Популяция нескольких путей

```js
Post
  .find()
  .populate('author')
  .populate('subscribers')
  .exec()
```

Если для одного пути вызывается несколько `populate()`, эффект будет иметь только последний из них.

### Условные запросы и другие настройки

Что если мы хотим заполнить массив подписчиков на основе их возраста и только их именами?

```js
Post
  .find()
  .populate({
    path: 'subscribers',
    match: { age: { $gte: 21 } }, // больше или равно, greater than or equal
    // явно исключаем `_id`
    select: 'name -_id'
  }).exec()
```

При отсутствии совпадения, массив `subscribers` будет пустым.

```js
const post = await Post
  .findOne({ title: 'Мой первый пост' })
  .populate({
    path: 'author',
    name: {
      // не равно, not equal
      $ne: 'John Smith'
    }
  }).exec()

post.author // null
```

### perDocumentLimit

Для ограничения количество возвращаемых объектов можно использовать настройку `perDocumentLimit` (настройка `options.limit` работает не всегда корректно)

```js
Post.create([
  {
    title: 'Post1',
    fans: [1, 2, 3, 4, 5]
  },
  {
    title: 'Post2',
    fans: [6, 7]
  }
])

const posts = Post
  .find()
  .populate({
    path: 'fans',
    options: {
      limit: 2
    }
  })

posts[0].name // Post1
posts[0].fans.length // 2

// !
posts[1].name // Post2
posts[1].fans.length // 0

const posts = await Post
  .find()
  .populate({
    path: 'subscribers',
    perDocumentLimit: 2
  })

posts[0].name // Post1
posts[0].fans.length // 2

// !
posts[1].name // Post2
posts[1].fans.length // 2
```

### Ссылки на детей

Мы можем обнаружить, что при использовании объекта `author`, нам недоступен список постов. Это объясняется тем, что объекты `story` не были помещены (pushed) в `author.posts`.

Если у нас имеется хорошая причина для сохранения массива дочерних указателей (child pointers), мы можем `push()` документы в массив

```js
author.posts.push(post1)
author.save()
```

Это позволит комбинировать `find()` и `populate()`

```js
User
  .findOne({ name: 'John Smith' })
  .populate('posts')
  .exec((err, user) => {})
```

Возможно, мы не хотим иметь два набора указателей. В этом случае мы можем пропустить популяцию и найти нужные посты с помощью `find()`

```js
Post
  .find({ author: author._id })
  .exec((err, posts) => {})
```

### Популяция существующего документа

Для заполнения полей существующего документа используется цепочка из методов `populate()` и `Document.execPopulate()`

```js
const user = await User.findOne({ name: 'John Smith' })

user.populated('posts') // null

await user.populate('posts').execPopulate()

user.populated('posts') // массив `ObjectId`
user.posts[0].name // Post1
```

Несколько вызовов `populate()` могут быть объединены в цепочку.

### Популяция на нескольких уровнях вложенности

Предположим, что у нас имеется схема пользователя, которая "следит" за друзьями пользователя

```js
const userSchema = new Schema({
  name: String,
  friends: [
    {
      type: ObjectId,
      ref: 'User'
    }
  ]
})
```

Допустим, что мы хотим получать не только друзей пользователя, но и друзей друзей пользователя

```js
User
  .findOne({ name: 'Имярек' })
  .populate({
    path: 'friends',
    // !
    populate: {
      path: 'friends'
    }
  })
```

### Популяция между БД

Предположим, что у нас имеется схема событий и схема обсуждений. Каждое событие имеет соответствующий поток (thread) обсуждений

```js
const db1 = mongoose.createConnection(MONGO_URI1)
const db2 = mongoose.createConnection(MONGO_URI2)

const conversationSchema = new Schema({ messagesCount: Number })
const Conversation = db2.model('Conversation', conversationSchema)

const eventSchema = new Schema({
  name: String,
  conversation: {
    type: ObjectId,
    ref: Conversation // `ref` - это класс модели, а не строка
  }
})
const Event = db1.model('Event', eventSchema)

const events = await Event
  .find()
  .populate('conversations')

// или когда мы не имеем доступа к `Conversation` при определении `eventSchema`
const events = await Event
  .find()
  .populate('conversations', model: Conversation)
```

### Динамические ссылки

`Mongoose` также может осуществлять заполнение из нескольких коллекций на основе значения свойства документа. Предположим, что у нас имеется схема для комментариев. Пользователь может оставлять комментарии как к посту, так и к товару

```js
const commentSchema = new Schema({
  body: {
    type: String,
    required: true
  },
  on: {
    type: Schema.Types.ObjectId,
    required: true,
    // Для определения правильной модели `Mongoose` будет использовать свойства `onModel`
    refPath: 'onModel'
  },
  onModel: {
    type: String,
    required: true,
    enum: ['Post', 'Product']
  }
})

const Product = model('Product', new Schema({ name: String }))
const Post = model('Post', new Schema({ title: String }))
const Comment = model('Comment', commentSchema)
```

Другими словами, `refPath` позволяет определить, какую модель `Mongoose` должен использовать для каждого документа

```js
const book = await Product.create({ name: 'Book1' })
const post = await Post.create({ title: 'Post1' })

const commentOnBook = await Comment.create({
  body: 'Comment1',
  on: book._id,
  onModel: 'Product'
})

const commentOnPost = await Comment.create({
  body: 'Comment2',
  on: post._id,
  onModel: 'Post'
})

// `populate()` работает, несмотря на то, что один комментарий
// ссылается на коллекцию `Product`, а другой - на коллекцию `Post`
const comments = await Comment.find().populate('on').sort({ body: 1 })
comments[0].on.name // Book1
comments[1].on.title // Post1
```

### Популяция виртуальных свойств

Виртуальные свойства позволяют определять более сложные или тонкие отношения между документами

```js
const personSchema = new Schema({
  name: String,
  band: String
})

const bandSchema = new Schema({
  name: String
})

bandSchema.virtuals('members', {
  ref: 'Person', // Модель, которую следует использовать
  localField: 'name', // Находим людей, у которых `localField`
  foreignField: 'band', // равняется `foreignField`
  // Если `justOne` равняется `true`, `members` будет единичным документом,
  // а не массивом. По умолчанию `justOne` имеет значение `false`
  justOne: false,
  options: {
    sort: {
      name:
    },
    limit: 5
  } // настройки запроса
})

const Person = model('Person', personSchema)
const Band = model('Band', bandSchema)

/**
  * Предположим, что у есть две группы: `Guns N' Roses` и `Motley Crue`
  * и 4 человека: `Axl Rose` и `Slash` в `Guns N' Roses` и
  * `Vince Neil` и `Nikki Sixx` в `Motley Crue`
*/
Band
  .find({})
  .populate('members')
  .exec((err, bands) => {
    // `bands.members` теперь является массивом экземпляров `Person`
  })
```

Для дополнительной фильтрации результатов `populate()` можно использовать настройку `match`

```js
const personSchema = new Schema({
  name: String,
  band: String,
  isActive: Boolean
})

const bandSchema = new Schema({
  name: String
})

bandSchema.virtual('activeMembers', {
  ref: 'Person',
  localField: 'name',
  foreignField: 'band',
  justOne: false,
  match: { isActive: true }
})

bandSchema.virtual('formerMembers', {
  ref: 'Person',
  localField: 'name',
  foreignField: 'band',
  justOne: false,
  match: { isActive: false }
})
```

Для получения количества совпавших с `foreignField` документов используется настройка `count`

```js
const personSchema = new Schema({
  name: String,
  band: String
})

const bandSchema = new Schema({
  name: String
})

bandSchema.virtual('numMembers', {
  ref: 'Person',
  localField: 'name',
  foreignField: 'band',
  count: true
})

// Позже
const doc = await Band
  .findOne({ name: 'Motley Crue' })
  .populate('numMembers')
doc.numMembers // 2
```

### Популяция карт

Карты - тип, представляющий собой объект с произвольными строковыми ключами

```js
const bandSchema = new Schema({
  name: String,
  members: {
    type: Map,
    of: {
      type: ObjectId,
      ref: 'Person'
    }
  }
})
const Band = model('Band', bandSchema)
```

Карта имеет `ref`, что означает, что мы можем использовать `populate()` для ее заполнения. Допустим, у нас есть такой документ `band`

```js
const person1 = new Person({ name: 'Vince Neil' })
const person2 = new Person({ name: 'Mick Mars' })

const band = new Band({
  name: 'Motley Crue',
  members: {
    'singer': person1._id,
    'guitarist': person2._id
  }
})
```

Заполнение карты выполняется с помощью специального синтаксиса `$*`

```js
const band = await Band.findOne({ name: 'Motley Crue' }).populate('members.$*')

band.members.get('signer') // { _id: ..., name: 'Vince Neil' }
```

Мы также можем заполнять поля карт субдокументов

```js
const librarySchema = new Schema({
  name: String,
  books: {
    type: Map,
    of: new Schema({
      title: String,
      author: {
        type: 'ObjectId',
        ref: 'Person'
      }
    })
  }
})
const Library = model('Library', librarySchema)

const libraries = await Library.find().populate('books.$*.author')
```

### Популяция в посредниках

```js
// Всегда выполняем заполнение при поиске
MySchema.pre('find', function() {
  this.populate('user')
})

// Выполняем заполнение после поиска
MySchema.post('find', async (docs) => {
  for (const doc of docs) {
    if (doc.isPublish) {
      await doc.populate('user').execPopulate()
    }
  }
})

// Выполняем заполнение после сохранения
MySchema.post('save', (doc, next) => {
  doc.populate('user').execPopulate().then(() => {
    next()
  })
})
```

## API

### Mongoose

- `Mongoose()` - конструктор `Mongoose`

```js
const mongoose = require('mongoose')
mongoose instanceof mongoose.Mongoose // true
```

- `Mongoose.model()` - метод для определения или извлечения модели

```js
const { model } = require('mongoose')

module.exports = model('MyModel', schema)
```

- `Mongoose.Schema()` - конструктор схемы

```js
const { Schema } = require('mongoose')
const mySchema = new Schema({...})
```
- `Mongoose.connect()` - метод для подключения к `MongoDB`

```js
const mongoose = require('mongoose')

const MONGO_URI = require('./config')

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true
}

// Выполняем подключение с минимальными настройками
mongoose.connect(
  MONGO_URI,
  options,
  (err) => {
    if (err) {
      console.error('Something went wrong: ', err.message || err)
      return
    }
    console.log('The connection to the database is successful')
  })
```

- `Mongoose.connection` - текущее подключение, эквивалент `mongoose.connections[0]`

```js
mongoose.connect(...)
mongoose.connection.on('error', (err) => handleError(err))
```

- `Mongoose.connections` - массив всех подключений

- `Mongoose.createConnection()` - синхронный метод для создания подключения, который используется для управления несколькими подключениями

```js
const db1 = mongoose.createConnection(MONGO_URI1, options)
const db2 = mongoose.createConnection(MONGO_URI2, options)
```

- `Mongoose.disconnect()` - запускает `close()` на всех соединениях одновременно

- `Mongoose.plugin()` - метод для определения глобальных плагинов

- `Mongoose.get()`, `Mongoose.set()` - методы для получения и установки глобальных настроек

```js
mongoose.set('debug', true)
```

### Schema

- `Schema()` - конструктор схемы (`Mongoose.Schema()`)

```js
const { Schema } = require('mongoose')

// автоматическое создание полей `createdAt` и `updatedAt`
const options = {
  timestamps: true
}

const userSchema = new Schema({
  name: {
    type: String,
    trim: true,
    minLength: [2, 'Имя слишком короткое'],
    maxLength: [12, 'Имя слишком длинное'],
    required: [true, 'Имя не может быть пустым']
  },
  age: {
    type: Number,
    min: [18, 'Ты слишком юн'],
    max: [66, 'Ты слишком стар'],
    required: true,
    default: 18
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/\w+@\w+\.\w+/, 'Неправильный адрес электронной почты'],
    requred: [true, 'Email не может быть пустым'],
    unique: true
  },
  sex: {
    type: String,
    enum: ['мужской', 'женский', 'не могу определиться'],
    required: true
  },
  phone: {
    type: String,
    validate: {
      validator: (v) => /+7\d{10}/.test(v),
      message: () => 'Неправильный номер телефона'
    },
    required: true
  },
  agree: {
    type: Boolean,
    required: true
  }
}, options)
```

- `Schema.Types` - встроенные типы схем:
  - `String`
  - `Number`
  - `Boolean`,
  - `Array`,
  - `Buffer`
  - `Date`,
  - `ObjectId`
  - `Mixed`

- `Schema.add()` - метод для добавления полей в схему

```js
parentSchema.add(childSchema).add({ color: String })
```

- `Schema.clone()` - метод для глубокого копирования схемы

- `Schema.eachPath()` - метод для перебора полей (аналог `forEach()`)

```js
schema.eachPath((pathname, schematype) => {
  console.log(pathname, schematype)
})
```

- `Schema.method()` - позволяет добавлять методы в схему

```js
const userSchema = new Schema({
  name: {
    first: String,
    last: String
  }
})
userSchema.method('fullName', function() {
  return `${this.name.first} ${this.name.last}`
})

const User = model('User', userSchema)
const user = new User({
  name: {
    first: 'John',
    last: 'Smith'
  }
})
console.log(user.fullName()) // John Smith
```

- `Schema.path()` - метод для получения/установки путей (типов полей)

```js
schema.path('name') // возвращается тип поля `name`
schema.path('name', Number) // типом `name` теперь является `Number`
```

- `Schema.post()` - метод для определения последующих хуков

- `Schema.pre()` - метод для определения предварительных хуков

- `Schema.remove()` - метод для удаления поля или полей в случае передачи массива

- `Schema.get()`, `Schema.set()` - методы для получения и установки настроек схемы

- `Schema.static()` - позволяет добавлять статические методы в схему

```js
schema.static('findByName', function(name) {
  return this.find({ name })
})

const MyModel = model('MyModel', schema)
await MyModel.findByName('Anonymous')
```

- `Schema.virtual()` - метод для создания виртуальных типов

### Model

- `Model()` - класс, который используется для взаимодействия с `MongoDB`. Экземпляры этого класса называются документами

```js
const { Schema, model } = require('mongoose')

const userSchema = new Schema({...})
const User = model('User', userSchema)

const newUser = new User({...})

// сохраняем пользователя в БД
await newUser.save()

// получаем пользователя из БД
const user = await User.findOne({...})
```

- `Model.bulkWrite()` - позволяет отправить сразу несколько операций (переданных в виде массива) в `MongoDB`. Поддерживаемые операции:
  - `insertOne`
  - `updateOne`
  - `updateMany`
  - `deleteOne`
  - `deleteMany`
  - `replaceOne`

- `Model.estimatedDocumentCount()` - возвращает количество документов, удовлетворяющих условию

```js
User.estimatedDocumentCount({ type: 'vip' }, (err, count) => {})
```

- `Model.create()` - метод для сохранения одного или нескольких документов в БД. Данный метод запускает `save()` (и его посредников) для каждого документа

```js
await User.create({ name: 'John Smith' })

await User.create([
  { name: 'John Smith' },
  { name: 'Jane Air' }
])
```

- `Model.deleteMany()` - удаляет из коллекции все документы, удовлетворяющие условию. Похож на `remove()`, но удаляет все документы независимо от настройки `single`

```js
Model.deleteMany(conditions, options?, callback?)

await User.deleteMany({ name: /john/i, age: { $lte: 18 } })
```

- `Model.deleteOne(conditions, options?, callback?)` - удаляет из коллекции первый документ, удовлетворяющий условию

```js
await User.deleteOne({ name: 'John Smith' })
```

- `Model.events` - диспетчер событий, который может использоваться для глобальной обработки ошибок

```js
Model.events.on('error', err => handleError(err))
```

- `Model.find()` - метод для поиска документов

```js
Model.find(filter, projection?, options?, callback?)

// все документы
await User.find({})

// всех пользователей с именем `John`, старше 18
await User.find({ name: 'John', age: { $gt: 18 } }).exec()

// с результатами в колбеке
await User.find({ name: 'John', age: { $gt: 18 } }, (err, docs) => {})

// регулярное выражение и выборка полей
await User.find({ name: /john/i }, 'name friends').exec()

// с настройками
await User.find({ name: /john/i }, null, { skip: 10 }).exec()
```

- `Model.findById()` - метод для поиска документа по `_id`. `findById(id)` почти идентичен `findOne({ _id: id })`

```js
Model.findById(filter, projection?, options?, callback?)

await User.findById(id).exec()

await User.findById(id, (err, user) => {})

await User.findById(id, 'name friends').exec()
```

- `Model.findByIdAndDelete(id, options?, callback?)` - метод для поиска и удаления документа по `_id`. `findByIdAndDelete(id)` является сокращением для `findOneAndDelete({ _id: id })`

- `Model.findByIdAndRemove(id, options?, callback?)` - метод для поиска и удаления документа по `_id`. `findByIdAndRemove(id, ...)` является сокращением для `findOneAndRemove({ _id: id }, ...)`. Данный метод находит документ, удаляет его и передает обнаруженный документ в колбек

- `Model.findByIdAndUpdate(id, update, options?, callback?)` - метод для поиска и обновления документа по `_id`. `findByIdAndUpdate(id, ...)` является сокращением для `findOneAndUpdate({ _id: id }, ...)`. Данный метод находит документ, обновляет его согласно аргументу `update`, применяет `options` и передает обнаруженный документ в колбек. Важные настройки:
  - `new` - если `true`, возвращает обновленный документ, а не исходный
  - `upsert` - если `true`, объект создается при отсутствии

```js
await User.findByIdAndUpdate(id, { name: 'Jane Air' }, { new: true }, (err, user) => {})
```

- `Model.findOne(conditions?, projection?, options?, callback?)` - метод для поиска документа по условию. Объект с условиями является опциональным. Однако, если он имеет значение `null` или `undefined`, возвращается произвольный документ. Для выполнения поиска документа по `_id` следует использовать `findById()`

- `Model.findOneAndDelete(conditions, options?, callback?)` - метод для поиска и удаления документа по условию. Данный метод находит документ, удаляет его и передает обнаруженный документ в колбек

- `Model.findOneAndRemove(conditions, options?, callback?)` - метод для поиска и удаления документа. Почти идентичен `Model.findOneAndDelete()`

- `Model.findOneAndReplace(filter, replacement?, options?, callback?)` - метод для поиска и замены документа по условию. Данный метод находит документ, заменяет его и передает обнаруженный документ в колбек. Для передачи в колбек обновленного документа следует установить настройку `new` в значение `true`

- `Model.findOneAndUpdate(conditions?, update?, options?, callback?)` - метод для поиска и обновления документа по условию. Данный метод находит документ, обновляет его согласно аргументу `update`, применяет `options` и передает обнаруженный документ в колбек. Важные настройки:
  - `new` - см. `findByIdAndUpdate()`
  - `upsert` - см. `findByIdAndUpdate()`
  - `overwrite` - если `true`, документ заменяется, а не обновляется
  - `fields` - выборка полей, эквивалент `select(fields).findOneAndUpdate()`

- `Model.init()` - метод для генерации индексов при `autoIndex: false`

- `Model.insertMany(doc(s), options?, callback?)` - метод для добавления единичного документа или массива документов в БД. Все добавляемые документы должны быть валидными (если не установлено `ordered: false`). Данный метод быстрее `create()`, поскольку отправляет в БД всего одну операцию (`create()` отправляет операцию для каждого документа)

```js
const users = [
  { name: 'John' },
  { name: 'Jane' }
]

User.insertMany(users, (err, users) => {})
```

- `Model.populate(doc(s), options, callback?)` - метод для заполнения ссылок единичного документа или массива документов документами из других коллекций. `options` - либо строка с указанием пути, либо объект с настройками:
  - `path` - пути для заполнения
  - `select` - выборка полей
  - `match` - условия
  - `model` - название модели для популяции
  - `options` - `sort`, `limit` и т.д.
  - `justOne`

```js
// Заполнение единичного объекта
User.findById(id, (err, user) => {
  const opts = [
    {
      path: 'company',
      match: { x: 1 },
      select: 'name'
    },
    {
      path: 'notes',
      options: { limit: 10 },
      model: 'override'
    }
  ]

  User.populate(user, opts, (err, user) => {
    console.log(user)
  })
})

// Заполнение массива объектов
User.find(match, (err, users) => {
  const opts = [
    {
      path: 'company',
      match: { x: 1 },
      select: 'name'
    }
  ]

  User.populate(users, opts).then(console.log).end()
})
```

- `Model.remove(conditions, options?, callback?)` - метод для удаления документов из коллекции по условию. Для удаления первого совпавшего документа следует установить `single: true`

```js
const result = await User.remove({ name: /john/i })
result.deletedCount // количество удаленных документов
```

- `Model.replaceOne(filter, doc, options?, callback?)` - тоже самое, что и `update()`, за исключением того, что существующий документ полностью заменяется переданным (не допускается атомарных операций типа `$set`)

- `Model.update(filter, doc, options?, callback?)` - метод для обновления документа без его возвращения. Важные настройки:
  - `upsert` - см. `findByIdAndUpdate()`
  - `multi` - позволяет обновлять несколько документов
  - `overwrite` - см. `findOneAndUpdate()`

```js
await User.update({ age: { $gt: 18 } }, { oldEnough: true }, (err, rawResponse) => {})
```

- `Model.updateOne(filter, doc, options?, callback?)` - тоже самое, что `update()`, но без настроек `multi` и `overwrite`

- `Model.updateMany(filter, docs, options?, callback?)` - тоже самое, что `update()`, но обновляются все документы, удовлетворяющие условию, независимо от настройки `multi`

- `Model.watch(pipeline?, options?)` - метод, позволяющий следить за изменениями соответствующей коллекции. Можно регистрировать следующие события:
  - `change`
  - `error`
  - `end`
  - `close`

```js
const user = await User.create({ name: 'John Smith' })
const changeStream = User.watch().on('change', change => console.log(change))
// Будет выведено следующее:
// { _id: { _data: ... },
//   operationType: 'delete',
//   ns: { db: '...', coll: 'User' },
//   documentKey: { _id: ... } }
await user.remove()
```

- `Model.where(path, val?)` - позволяет формировать запрос, передавать ему условия и возвращать его. Например, вместо

```js
User.find({ age: { $gte: 18, $lte: 66 } }, callback)
```

Можно делать так

```js
User.where('age').gte(18).lte(66).exec(callback)
```

### Document

- `Document.depopulate(path)` - принимает заполняемое поле и возвращает его к незаполненному состоянию

```js
Post.findOne().populate('author').exec((err, post) => {
  console.log(post.author.name) // John Smith
  post.depopulate('author')
  console.log(doc.author) // ObjectId
})
```

- `Document.equals()` - возвращает `true`, если документ равен другому документу. Документы сравниваются по `_id`. Если документы не имеют `_id`, используется функция `deepEqual()`

- `Document.execPopulate()` - метод для явного выполнения популяции, возвращающий промис. Используется для интеграции промисов

```js
const promise = doc
  .populate('company')
  .populate({
    path: 'notes',
    match: /airlane/,
    select: 'text',
    model: Model,
    options: opts
  })
  .execPopulate()
```

Вместо `doc.populate(options).execPopulate()` можно использовать `doc.execPopulate(options)`.

- `Document.get(path, type?, options?)` - возвращает значение пути

- `Document.id` - строковое представление `_id` документа

- `Document.isNew` - индикатор новизны документа

- `Document.markModified(path)` - помечает путь как имеющий ожидающие изменения для записи в БД. Обычно, применяется в отношении смешанных типов

```js
doc.mixed.type = 'changed'
doc.markModified('mixed.type')
doc.save()
```

- `Document.overwrite(obj)` - перезаписывает значения документа значениями `obj`, кроме иммутабельных свойств. Похож на `set()`, но те свойства, которых нет в `Document.obj`, удаляются

- `Document.parent()` - если документ является субдокументом, возвращается его предок

- `Document.populate(path?, callback?)` - заполняет ссылки документа, выполняет колбек после завершения. Для того, чтобы получить промис, данный метод следует использовать совместно с `execPopulate()`

```js
doc
  .populate('company')
  .populate({
    path: 'notes',
    match: /airline/,
    select: 'text',
    model: Model,
    options: opts
  }, (err, user) => {
    console.log(doc._id === user._id) // true
  })
```

*Обратите внимание*: популяция не выполняется до передачи колбека или вызова `execPopulate()`.

- `Document.save(options?, callback?)` - сохраняет документ в БД или отправляет операцию `updateOne()` с изменениями

```js
product.sold = Date.now()
await product.save()
```

- `Document.schema` - схема документа

- `Document.set(path, val, type?, options?)` - устанавливает значение пути или нескольких путей

```js
doc.set(path, value)

doc.set({
  path: value,
  path2: {
    path: value
  }
})
```

- `validate(path(s)?, options?, callback?)` и `validateSync(path(s), options?)` - выполняют валидацию документа. `validateSync()` пропускает асинхронные валидаторы

```js
doc.validate((err) => {})
```

### Query

- `Query(options?, model?, conditions?, collection?)` - конструктор для построения запросов

```js
const query = Model.find()
query.setOptions({ lean: true })
query.collection(Model.collection)
query.where('age').gte(18).exec(callback)
```

- `Query.all(path?, val)` - определяет условие запроса `$all`

```js
Model.find().where('pets').all(['dog', 'cat'])
// или
Model.find().all('pets', ['dog', 'cat'])
```

- `Query.and(array)` - определяет аргументы для условия `$and`

```js
query.and([{ color: 'green' }, { status: 'ok' }])
```

- `Query.circle(path?, area)` - определяет условия `$center` или `$centerSphere`

```js
const area = { center: [50, 50], radius: 10, unique: true }
query.where('loc').within().circle(area)
// или
query.circle('loc', area)

// сферические вычисления
const area = { center: [50, 50], radius: 10, unique: true, spherical: true }
query.circle('loc', area)
```

- `Query.exec(operation?, callback?)` - выполняет запрос

- `Query.get(path)` - для операций обновления. Возвращает значение пути в обновлении `$set`

```js
const query = Model.updateOne({}, { $set: { name: 'John Smith' } })
query.get('name') // John Smith
```

- Условия запросов (`$condition`):
  - `gt()` - больше чем
  - `gte()` - больше или равно
  - `lt()` - меньше чем
  - `lte()` - меньше или равно
  - `in()` - диапазон, `enum`
  - `nin()` - противоположность `in()`
  - `or()` - или то, или другое
  - `nor()` - ни то, ни другое
  - `ne()` - не равно
  - `regex()` - регулярное выражение
  - `size()` - размер
  - `slice()` - срез, диапазон

- `Query.limit()` - лимит возвращаемых документов

- `Query.merge()` - объединяет запросы

- `Query.near()` - определяет условие `$near` или `$nearSphere`

```js
query.where('loc').near({ center: [10, 10] })
query.where('loc').near({ center: [10, 10], maxDistance: 5 })
query.where('loc').near({ center: [10, 10], maxDistance: 5, apherical: true })
query.near('loc', { center: [10, 10], maxDistance: 5 })
```

- `Query.post(callback)` - добавляет последующих посредников

- `Query.pre(callback)` - добавляет предварительных посредников

- `Query.select(arg)` - определяет, какие поля документа должны включаться, а какие не должны. Флаг `-` означает исключение поля, флаг `+` - принудительное включение (например, для полей, исключенных на уровне схемы)

```js
// включить поля `a` и `b`, исключив остальные
query.select('a b')
query.select(['a', 'b'])
query.select({ a: 1, b: 1 })

// исключить поля `c` и `d`
query.select('-c -d')
```

- `Query.set(path, val?)` - добавляет `$set` в запрос на обновление без изменения операции

```js
query.updateOne({}, {}).set('updatedAt', new Date())
query.updateMany({}, {}).set({ 'updatedAt', new Date() })
```

- `Query.skip(val)` - определяет количество пропускаемых документов

```js
query.skip(10).limit(5)
```

- `Query.sort(arg)` - определяет порядок сортировки (`asc`, `desc`, `ascending`, `descending`, `1`, `-1`)

```js
query.sort({ field: 'asc', test: -1 })
// или
query.sort('field -test')
```

- `Query.where(path?, val?)` - определяет путь для выполнения запросов

```js
// вместо
User.find({ age: { $gte: 18, $lte: 65 } }, callback)

// можно писать так
User.where('age').gte(18).lte(65)
```
