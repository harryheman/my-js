---
sidebar_position: 9
---

# TypeScript Cheatsheet

[Источник](https://www.sitepen.com/blog/typescript-cheat-sheet)&nbsp;&nbsp;👀

## Использование

_Установка_

```bash
npm i -g typescript
# or
yarn add global typescript
```

_Запуск_

```bash
tsc
```

_Запуск с определенными настройками_

```bash
tsc --project configs/my_tsconfig.json
```

## Директивы `///`

_Ссылка на встроенные типы_

```ts
/// <reference types="react-scripts" />
```

_Ссылка на другие типы_

```ts
/// <reference path="../my-types" />
/// <reference types="node" />
```

## Комментарии для компилятора

_Отключение проверки файла_

```ts
// @ts-nocheck
```

_Включение проверки файла_

```ts
// @ts-check
```

_Игнорирование следующей строки_

```ts
// @ts-ignore
```

_Ожидание ошибки на следующей строке_

```ts
// @ts-expect-error
```

## Операторы

- `??` - оператор проверки на `null`

```ts
function getValue(n: number): number | 'nill' {
  // 'nill' возвращается, если `n` - это любое ложное значение (включая `0`)
  // return n || 'nill'

  // 'nill' возвращается, только если `n` имеет значение `null` или `undefined`
  return n ?? 'nill'
}
```

- `?.` - оператор опциональной последовательности

```ts
function countCaps(value?: string) {
  // приведенное ниже выражение будет иметь значение `undefined`,
  // если `value` имеет значение `null` или `undefined`
  // или `match` не нашел совпадений
  return value?.match(/[A-Z]/g)?.length ?? 0
}
```

- `!` - оператора утверждения ненулевого значения

```ts
let value: string | undefined

// код, инициализирующий переменную `value` (присваивающий ей какое-либо значение)

// утверждаем, что `value` имеет значение (определена)
console.log(`Значение переменной 'value' состоит из ${value!.length} символов`)
```

- `&&=`

```ts
let x
let y = 1

// присваиваем значение, только если текущее значение является истинным
x &&= 'default' // `x` по-прежнему имеет значение `undefined`
y &&= 3 // `y` теперь имеет значение `3`
```

- `||=`

```ts
let x
let y = 1

// присваиваем значение, только если текущее значение является ложным
x ||= 'default' // `x` теперь имеет значение `default`
y ||= 3 // `y` по-прежнему имеет значение `1`
```

- `??=`

```ts
let x
let y = 0

// присваиваем значение, только если текущим значением является `null` или `undefined`
x ??= 'default' // `x` теперь имеет значение `default`
y ??= 2 // `y` по-прежнему имеет значение `0`
```

## Основные типы

- `any` - отсутствие типа
- `string` - строка
- `number` - число
- `boolean` - логическое значение (`true` или `false`)
- `object` - объект (не примитивное значение)
- `undefined` - неинициализированное значение (например, переменная без значения или несуществующее свойство объекта)
- `null` - явно установленное пустое значение
- `void` - `null` или `undefined` (обычно, используется для типизации значения, возвращаемого функцией)
- `never` - значение, которое не может возникнуть (например, когда выбрасывается исключение)
- `unknown` - значение неизвестного на момент определения типа

## Объектные типы

_Объект_

```ts
{
  requiredString: string
  optionalNumber?: number
  readonly readOnlyBoolean: boolean
}
```

_Объект с произвольным количеством свойств (например, хештаблица или словарь)_

```ts
{ [key: string]: Type }
{ [key: number]: Type }
{ [key: symbol]: Type }
{ [key: `data-${string}`]: Type }
```

## Литеральные типы

- строковый - `let direction: 'left' | 'right'`
- числовой - `let roll: 1 | 2 | 3 | 4 | 5 | 6`

## Массивы и кортежи

_Массив строк_

```ts
string[]
// or
Array<string>
```

_Массив функций, возвращающих строки_

```ts
(() => string)[]
// or
{ (): string }[]
// or
Array<() => string>
```

_Кортеж_

```ts
let myTuple: [string, number, boolean?]

myTuple = ['test', 42]
```

_Произвольный кортеж_

```ts
type Numbers = [number, number]
type Strings = [string, string]

type NumAndStr = [...Numbers, ...Strings]
// [number, number, string, string]

type NumberAndRest = [number, ...string[]]
// [number, любое количество строк]

type RestAndBool = [...any[], boolean]
// [любое количество любых типов, boolean]
```

_Именованный кортеж_

```ts
type Vector2D = [x: number, y: number]

function createVector(...args: Vector2D) {}
// const createVector = (x: number, y: number) => {}
```

## Функции

_Функциональный тип_

```ts
(arg1: Type, argsN: Type) => Type
// or
{ (arg1: Type, argN: Type): Type }
```

_Конструктор_

```ts
new () => ConstructedType
// or
{ new (): ConstructedType }
```

_Функциональный тип с опциональным параметром_

```ts
(arg1: Type, optional?: Type) => ReturnType
```

_Функциональный тип с оставшимися параметрами_

```ts
(arg1: Type, ...args: Type[]) => ReturnType
```

_Функциональный тип со статическим свойством_

```ts
{ (): Type; staticProp: Type }
```

_Дефолтное значение параметра_

```ts
function fn(arg = 'default'): ReturnType {}
```

_Стрелочная функция_

```ts
(arg: Type): ReturnType => {}
// or
(arg: Type): ReturnType => someValue
```

_Типизация `this`_

```ts
function fn(this: Type, arg: string) {}
```

_Перегрузка_

```ts
function fn(x: string): number
function fn(x: number): string
function fn(x: string | number): string | number {}
```

## Объединение и пересечения

_Объединение_

```ts
let myUnion: number | string
```

_Пересечение_

```ts
let myIntersection: Foo & Bar
```

## Именованные типы

_Интерфейс_

```ts
interface Child extends Parent, SomeClass {
  requiredProp: Type
  optionalProp: Type
  optionalMethod?(arg: Type): ReturnType
}

// example
interface TodoItem {
  id: string
  text: string
  done: boolean
}
interface TodoList {
  todos: TodoItem[]
}
interface TodoActions {
  addTodo: (todo: TodoItem) => void
  updateTodo: (id: string) => void
  removeTodo: (id: string) => void
}
```

_Класс_

```ts
class Child
extends Parent

implements Child, OtherChild {
    prop: Type
    defaultProp = 'default value'
    private _privateProp: Type
    private readonly _privateReadonlyProp: Type
    static staticProp: Type

    static {
      try {
        Child.staticProp = computeStaticProp()
      } catch {
        Child.staticProp = defaultValue
      }
    }

    constructor(arg: Type) {
      super(arg)
    }

    private _privateMethod(): Type {}

    methodProp: (arg: Type) => ReturnType
    overloadedMethod(arg: Type): ReturnType
    overloadedMethod(arg: OtherType): ReturnType
    overloadedMethod(arg: CommonType): CommonReturnType {}
    static staticMethod(): ReturnType {}
    subMethod(arg: Type): ReturnType {
      super.subMethod(arg)
    }
}
```

_Перечисление (использовать не рекомендуется)_

```ts
enum Options {
  FIRST,
  EXPLICIT = 1,
  BOOLEAN = Options.FIRST | Options.EXPLICIT,
  COMPUTED = getValue()
}

enum Colors {
  Red = "#FF0000",
  Green = "#00FF00",
  Blue = "#0000FF"
}
```

_Синонимы типов_

```ts
type FullName = {
  firstName: string
  lastName: string
  middleName?: string
}

type Direction = 'left' | 'right'

type ElementCreator = (type: string) => Element

type Point = { x: number, y: number }

type Point3D = Point & { z: number }

type PointProp = keyof Point // 'x' | 'y'

const point: Point = { x: 1, y: 2 }

type PtValProp = keyof typeof prop // 'x' | 'y'

type TodoItem = {
  id: string
  text: string
  done: string
}
type TodoItemComponentProps = {
  todo: TodoItem
  updateTodo: (id: string) => void
  removeTodo: (id: string) => void
}
```

## Дженерики (общие типы)

_Функция с типом параметров_

```ts
<T>(items: T[], callback: (item: T) => T): T[]
```

_Интерфейс с несколькими типами_

```ts
interface Pair<T1, T2> {
  first: T1
  second: T2
}
```

_Ограниченный тип параметра_

```ts
<T extends ConstrainedType>(): T
```

_Дефолтный тип параметра_

```ts
<T = DefaultType>(): T
```

_Ограниченный и дефолтный тип параметра_

```ts
<T extends ConstrainedType = DefaultType>(): T
```

_Общий кортеж_

```ts
type Arr = readonly any[]

function concat(<U extends Arr, V extends Arr>(x: U, y: V): [...U, ...V] {
  return [...x, ...y]
})

const strictResult = concat([1, 2] as const, ['3', '4'] as const)
// type -> [1, 2, '3', '4']

const relaxedResult = concat([1, 2], ['3', '4'])
// type -> Array<string | number>
```

## Индексные, связанные (mapped) и условные типы

_Типы индексов (`keyof`)_

```ts
type Point = { x: number, y: number }
let pointProps: keyof Point = 'x'

function getProp<T, K extends keyof T>(
  val: T,
  propKey: K
): T[K] {}
```

_Связанные типы_

```ts
type Stringify<T> = { [P in keyof T]: string }

type Partial<T> = { [P in keyof T]?: T[P] }
```

_Условные типы_

```ts
type Swapper = <T extends number | string>
  (val: T) => T extends number ? string : number

// ===
(val: number) => string // if T is number
(val: string) => number // if T is string
```

_Условные связанные типы_

```ts
interface User {
  handle: string
  email: string
  age: number
}

type StringProps<T> = {
  [K in keyof T]: T[K] extends string ? K : never
}

type UserStrings = StringProps<User>
// 'handle' | 'email'
```

## Вспомогательные типы

_`Partial`_

```ts
Partial<{ x: number; y: number; z: number }>
// ===
{ x?: number; y?: number; z?: number }
```

_`Readonly`_

```ts
Readonly<{ x: number; y: number; z: number }>
// ===
{
  readonly x: number
  readonly y: number
  readonly z: number
}
```

_`Pick`_

```ts
Pick<{ x: number; y: number; z: number }, 'x' | 'y'>
// ===
{ x: number; y: number }
```

_`Record`_

```ts
Record<'x' | 'y' | 'z', number>
// ===
{ x: number; y: number; z: number }
```

_`Exclude`_

```ts
type Excluded = Exclude<string | number, string>
// ===
number
```

_`Extract`_

```ts
type Extracted = Extract<string | number, string>
// ===
string
```

_`NonNullable`_

```ts
type NotNull = NonNullable<string | number | void>
// ===
string | number
```

_`ReturnType`_

```ts
type ReturnType = ReturnType<() => string>
// ===
string
```

_`InstanceType`_

```ts
class Renderer {}
type Instance = InstanceType<typeof Renderer>
// ===
Renderer
```

## Предохранители

_Предикаты типа_

```ts
function isType(val: unknown): val is T {
  // возвращает `true`, если `val` имеет тип `T`
}

if (isType(val)) {
  // `val` имеет тип `T`
}
```

_`typeof`_

```ts
declare value: string | number | boolean
const isBoolean = typeof value === 'boolean'

if (typeof value === 'number') {
  // значением `value` является число
} else if (isBoolean) {
  // `value` имеет логическое значение
} else {
  // значением `value` является строка
}
```

_`instanceof`_

```ts
declare value: Date | Error | MyClass
const isMyClass = value instanceof MyClass

if (value instanceof Date) {
  // значением `value` является экземпляр `Date`
} else if (isMyClass) {
  // значением `value` является экземпляр `MyClass`
} else {
  // значением `value` является экземпляр `Error`
}
```

_`in`_

```ts
interface Dog { woof(): void }
interface Cat { meow(): void }

function speak(pet: Dog | Cat) {
  if ('woof' in pet) {
    pet.woof()
  } else {
    pet.meow()
  }
}
```

## Утверждения (присвоения)

_Утверждение типа_

```ts
let myVar = someVal as string
// or
let myVar = <string>someVal
```

_Константа (иммутабельное значение)_

```ts
let point = { x: 24, y: 42 } as const
// or
let point = <const>{ x: 24, y: 42 }
```

## Декларации

_Глобальные_

```ts
declare const foo: number

declare function greet(greeting: string): void
```

_Пространства имен_

```ts
declare namespace myLib {
  function createGreeting(s: string): string
  let numberOfGreetings: number
}

declare namespace GreetingLib {
  interface LogOptions {
    verbose?: boolean;
  }
  interface AlertOptions {
    modal: boolean;
    title?: string;
    color?: string;
  }
}
```
