---
sidebar_position: 4
title: Вопросы по TypeScript
description: Вопросы по TypeScript для подготовки к собеседованию
keywords: ['typescript', 'ts', 'interview', 'questions', 'собеседование', 'интервью', 'вопросы']
tags: ['typescript', 'ts', 'interview', 'questions', 'собеседование', 'интервью', 'вопросы']
---

# Вопросы по TypeScript

> WIP

## В чем разница между сигнатурой индекса (Index Signature) и записью (Record)?

Сигнатура индекса используется для типизации общего (generic) объекта, т.е. объекта с произвольным количеством свойств:

```ts
interface IObj {
  [key: string]: number
}

// ok
const obj1: IObj = {
  a: 1
}

// ok
const obj2: IObj = {
  b: 2,
  c: 3
}

// !ok
const obj3: IObj = {
  d: 'foo' // Type 'string' is not assignable to type 'number'.
}
```

Рекомендуется страховаться на случай доступа к несуществующему свойству объекта:

```ts
interface IObj {
  [key: string]: number | undefined
}
```

Вспомогательная утилита `Record` также может использоваться для типизации общего объекта:

```ts
type TObj = Record<string, number>

const obj1: TObj = {
  a: 1
}

const obj2: TObj = {
  b: 2,
  c: 3
}
```

Однако `Record` чаще всего используется для типизации объекта с заранее известными ключами:

```ts
type TObj = Record<'foo' | 'bar', number>

const obj1: TObj = {
  foo: 1,
  bar: 2
}

const obj2: TObj = {
  foo: 3 // Property 'bar' is missing in type '{ foo: number; }' but required in type 'TObj'.
}
```

## В чем разница между `any` и `unknown`?

Значения, аннотированные с помощью `any` или `unknown`, могут иметь любой тип. Разница между этими специальными типами состоит в том, что `unknown` не допускает выполнения операций со значением до проверки его типа, например, путем его приведения (сужения) к более конкретному типу (type narrowing) или до присвоения (утверждения) типа (type assertion):

```ts
// ok
function unsafeInvoke(param: any) {
  param()
}
unsafeInvoke(1)
// однако во время выполнения получаем ошибку
// TypeError: param is not a function

// !ok
function unsafeInvokeUnknown(param: unknown) {
  param() // This expression is not callable. Type '{}' has no call signatures.
}

// ok
function safeInvokeUnknown(param: unknown) {
  // сужение типа
  if (typeof param === 'function') {
    param()
  }
}
```

## В чем разница между ковариантностью и контрвариативностью?

_Ковариантностью_ называется сохранение иерархии наследования исходных типов в производных типах в том же порядке. _Контравариантностью_ называется обращение иерархии исходных типов на противоположную в производных типах.

Если имеется 2 типа `S <: P`, где `S` является подтипом `P`, и `T<S> <: T<P>`, тогда тип `T` является ковариантным. Примером ковариативного типа является `Promise<T>`.

```ts
// базовый тип
class User {
  username: string

  constructor(username: string) {
    this.username = username
  }
}

// подтип
class Admin extends User {
  isAdmin: boolean

  constructor(username: string, isAdmin: boolean) {
    super(username)
    this.isAdmin = isAdmin
  }
}

// вспомогательный тип
type IsSubtype<S, P> = S extends P ? true : false

type T1 = IsSubtype<Admin, User>
// type T1 = true

type T2 = IsSubtype<Promise<Admin>, Promise<User>>
// type T2 = true
```

Если имеется 2 типа `S <: P`, где `S` является подтипом `P`, и `T<P> <: T<S>`, тогда тип `T` является контрвариативным. Тип функции является контрвариативным по типам параметров.

```ts
type Fn<Param> = (param: Param) => void

const logAdmin: Fn<Admin> = (admin) => {
  console.log(`Имя пользователя: ${admin.username}`)
  console.log(
    `Пользователь является администратором: ${admin.isAdmin.toString()}`
  )
}

const logUser: Fn<User> = (user) => {
  console.log(`Имя пользователя: ${user.username}`)
}

const logger1: Fn<Admin> = logUser
// ok

const logger2: Fn<User> = logAdmin
/*
Type 'Fn<Admin>' is not assignable to type 'Fn<User>'.
  Property 'isAdmin' is missing in type 'User' but required in type 'Admin'.
*/
```
