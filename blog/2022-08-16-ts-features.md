---
slug: ts-features
title: Заметка о полезных возможностях современного TypeScript
description: Заметка о полезных возможностях современного TypeScript
authors: harryheman
tags: [typescript, ts, modern ts, features]
---

Привет, друзья!

В данной заметке я расскажу вам о некоторых полезных возможностях современного `TypeScript`.

> [Источник](https://obaranovskyi.medium.com/10-typescript-features-you-might-not-be-using-yet-or-didnt-understand-d1f28888ea45).

<!--truncate-->

## Тип `unknown`

Тип `unknown` является безопасной (с точки зрения типов) версией типа `any`.

Начнем с того, что между ними общего.

Переменным с типами `any` и `unknown` можно присваивать любые значения:

```javascript
let anyValue: any = 'any value'
anyValue = true
anyValue = 123
console.log(anyValue) // 123

let unknownValue: unknown
unknownValue = 'unknown value'
unknownValue = true
unknownValue = 123
console.log(unknownValue) // 123
```

Однако, в отличие от `any`, `unknown` не позволяет оперировать "неизвестными" значениями.

Пример:

```javascript
const anyValue: any = 'any value'
console.log(anyValue.add())
```

Еще один:

```javascript
const anyValue: any = true
anyValue.typescript.will.not.complain.about.this.method()
```

В обоих случаях получаем ошибку времени выполнения (только во время выполнения кода).

При использовании `any` мы говорим компилятору: "Не проверяй этот код - я знаю, что делаю". Компилятор `TS`, в свою очередь, не делает никаких предположений относительно типа. Это не позволяет предотвращать ошибки на этапе компиляции кода.

Тип `unknown` позволяет заранее обнаруживать ошибки времени выполнения (на стадии компиляции). Более того, многие `IDE` обеспечивают подсветку потенциальных ошибок такого родп.

Рассмотрим несколько примеров:

```javascript
let unknownValue: unknown

unknownValue = 'unknown value'
unknownValue.toString() // Ошибка: Object is of type 'unknown'.

unknownValue = 100
const value = unknownValue + 10 // Ошибка: Object is of type 'unknown'.

unknownValue = console
unknownValue.log('test') // Ошибка: Object is of type 'unknown'.
```

При выполнении любой операции над неизвестным значением возникает ошибка.

Для того, чтобы манипулировать таким значением, требуется произвести сужение типа (type narrowing). Это можно сделать несколькими способами.

С помощью утверждения типа (type assertion):

```javascript
let unknownValue: unknown

unknownValue = function () {}

;(unknownValue as Function).call(null)
```

С помощью предохранителя типа (type guard):

```javascript
let unknownValue: unknown

unknownValue = 'unknown value'

if (typeof unknownValue === 'string') unknownValue.toString()
```

С помощью кастомного предохранителя типа:

```javascript
let unknownValue: unknown

type User = { username: string }

function isUser(maybeUser: any): maybeUser is User {
  return 'username' in maybeUser
}

unknownValue = { username: 'John' }

if (isUser(unknownValue)) {
  console.log(unknownValue.username)
}
```

С помощью функции-утверждения (assertion function):

```javascript
let unknownValue: unknown

unknownValue = 123

function isNumber(value: unknown): asserts value is number {
  if (typeof value !== 'number') throw Error('Переданное значение не является числом!')
}

isNumber(unknownValue)

unknownValue.toFixed()
```

## Индексированный тип доступа (тип поиска)

Индексированный тип доступа (indexed access type) может использоваться для поиска определенного свойства в другом типе. Рассмотрим пример:

```javascript
type User = {
  id: number
  username: string
  email: string
  address: {
    city: string
    state: string
    country: string
    postalCode: number
  }
  addons: { name: string, id: number }[]
}

type Id = User['id'] // number
type Session = User['address']
// {
//   city: string
//   state: string
//   country: string
//   postalCode: string
// }
type Street = User['address']['state'] // string
type Addons = User['addons'][number]
// {
//   name: string
//   id: number
// }
```

Здесь мы создаем новые типы `Id`, `Session`, `Street` и `Addons` на основе существующего объекта. Индексированный тип доступа можно использовать прямо в функции:

```javascript
function printAddress(address: User['address']): void {
  console.log(`
    city: ${address.city},
    state: ${address.state},
    country: ${address.country},
    postalCode: ${address.postalCode}
  `)
}
```

## Ключевое слово `infer`

Ключевое слово `infer` позволяет выводить один тип из другого внутри условного типа. Пример:

```javascript
const User = {
  id: 123,
  username: 'John',
  email: 'john@mail.com',
  addons: [
    { name: 'First addon', id: 1 },
    { name: 'Second addon', id: 2 }
  ]
}

type UnpackArray<T> = T extends (infer R)[] ? R : T

type AddonType = UnpackArray<typeof User.addons> // { name: string, id: number }
```

Тип `addon` выделен в отдельный тип.

## Функции-утверждения

Существует специальный набор функций, выбрасывающих исключения, когда происходит что-либо неожиданное. Такие функции называются "функциями-утверждениями" (assertion functions):

```javascript
function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== 'string') throw Error('Переданное значение не является строкой!')
}
```

Пример проверки объектов, включая вложенные:

```javascript
type User = {
  id: number
  username: string
  email: string
  address: {
    city: string
    state: string
    country: string
    postalCode: number
  }
}

function assertIsObject(obj: unknown, errorMessage: string = 'Неправильный объект!'): asserts obj is object {
  if(typeof obj !== 'object' || obj === null) throw new Error(errorMessage)
}

function assertIsAddress(address: unknown): asserts address is User['address'] {
  const errorMessage = 'Неправильны адрес!'
  assertIsObject(address, errorMessage)

  if(
    !('city' in address) ||
    !('state' in address) ||
    !('country' in address) ||
    !('postalCode' in address)
  ) throw new Error(errorMessage)
}

function assertIsUser(user: unknown): asserts user is User {
  const errorMessage = 'Неправильный пользователь!'
  assertIsObject(user, errorMessage)

  if(
    !('id' in user) ||
    !('username' in user) ||
    !('email' in user)
  ) throw new Error(errorMessage)

  assertIsAddress((user as User).address)
}
```

Пример использования:

```javascript
class UserWebService {
  static getUser = (id: number): User | unknown => undefined
}

const user = UserWebService.getUser(123)

assertIsUser(user) // Если пользователь является "неправильным", выбрасывается исключение

user.address.postalCode // На данном этапе мы знаем, что `user` - валидный объект
```

## Тип `never`

Тип `never` является индикатором того, что функция выбрасывает исключение или прерывает выполнение программы:

```javascript
function plus1If1(value: number): number | never {
  if(value === 1) return value + 1

  throw new Error('Ошибка!')
}
```

Пример с промисом:

```javascript
const promise = (value: number) => new Promise<number | never>((resolve, reject) => {
  if(value === 1) resolve(1 + value)

  reject(new Error('Ошибка!'))
})
```

И еще один:

```javascript
function infiniteLoop(): never {
  while (true) {
    // ...
  }
}
```

`never` также возникает в случае, когда в объединение не осталось "свободных" типов:

```javascript
function valueCheck(value: string | number) {
  if (typeof value === "string") {
    // значение является строкой
  } else if (typeof value === "number") {
    // значение является числом
  } else {
    // значение имеет тип `never`
  }
}
```

## Утверждение `const`

Использование `const` при конструировании новых буквальных выражений (literal expressions) сообщает компилятору следующее:

- типы выражения не должны расширяться (например, тип `привет` не может конвертироваться в `string`);
- свойства объектных литералов становятся доступными только для чтения (`readonly`);
- литералы массивов становятся доступными только для чтения кортежами (tuples).

Пример:

```javascript
const email = 'john@mail.com' // john@mail.com
const phones = [89876543210, 89123456780] // number[]
const session = { id: 123, name: 'qwerty123456' }
// {
//     id: number
//     name: string
// }

const username = 'John' as const // John
const roles = [ 'read', 'write'] as const // readonly ["read", "write"]
const address = { street: 'Tokyo', country: 'Japan' } as const
// {
//     readonly street: "Tokyo"
//     readonly country: "Japan"
// }


const user = {
  email,
  phones,
  session,
  username,
  roles,
  address
} as const
// {
//     readonly email: "john@mail.com"
//     readonly phones: number[]
//     readonly session: {
//       id: number
//       name: string
//     }
//     readonly username: "John"
//     readonly roles: readonly ["read", "write"]
//     readonly address: {
//         readonly street: "Tokyo"
//         readonly country: "Japan"
//     }
// }


// С утверждением `const`
// user.email = 'jane@mail.com' // Ошибка
// user.phones = [] // Ошибка
user.phones.push(89087654312)
// user.session = { name: 'test4321', id: 124 } // Ошибка
user.session.name = 'test4321'

// С "внешним" и "внутренним" утверждениями `const`
// user.username = 'Jane' // Ошибка
// user.roles.push('ReadAndWrite') // Ошибка
// user.address.city = 'Osaka' // Ошибка
```

Утверждение `const` позволяет преобразовывать массив строк в объединение:

```javascript
const roles = ['read', 'write', 'readAndWrite'] as const

type Roles = typeof roles[number]
// Эквивалентно
// type Roles = "read" | "write" | "readAndWrite"

type RolesInCapital = Capitalize<typeof roles[number]>
// Эквивалентно
// type RolesInCapital = "Read" | "Write" | "ReadAndWrite"
```

`[number]` указывает `TS` извлечь все числовые индексированные значения из массива `roles`.

## Ключевое слово `override`

Ключевое слово `override` может использоваться для обозначения перезаписываемого метода дочернего класса (начиная с `TS 4.3`):

```javascript
class Employee {
  doWork() {
    console.log('Я работаю')
  }
}

class Developer extends Employee {
  override doWork() {
    console.log('Я программирую')
  }
}
```

Вот как сделать эту "фичу" обязательной:

```json
{
  "compilerOptions": {
    "noImplicitOverride": true
  }
}
```

## Блок `static`

`static` позволяет определять блоки инициализации классов (начиная с `TS 4.4`):

```javascript
function userCount() {
  return 10
}

class User {
  id = 0
  static count: number = 0

  constructor(
    public username: string,
    public age: number
  ) {
    this.id = ++User.count
  }

  static {
    User.count += userCount()
  }
}


console.log(User.count) // 10
new User('John', 32)
new User('Jane', 23)
console.log(User.count) // 12
```

## Статические индексы и индексы экземпляров

Сигнатура индекса (index signature) позволяет устанавливать больше свойств, чем изначально определено в типе:

```javascript
class User {
  username: string
  age: number

  constructor(username: string,age: number) {
    this.username = username
    this.age = age
  }

  [propName: string]: string | number
}

const user = new User('John', 23)
user['phone'] = '+79876543210'

const something = user['something']
```

Пример использования сигнатуры статического индекса:

```javascript
class User {
  username: string
  age: number

  constructor(username: string,age: number) {
    this.username = username
    this.age = age
  }

  static [propName: string]: string | number
}

User['userCount'] = 0

const something = User['something']
```

Благодарю за внимание и happy coding!
