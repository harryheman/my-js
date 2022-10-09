---
sidebar_position: 17.2
title: TypeScript в деталях
description: TypeScript в деталях
keywords: ['javascript', 'js', 'typescript', 'ts', 'internals']
tags: ['javascript', 'js', 'typescript', 'ts', 'internals']
---

# TypeScript в деталях

[Источник](https://medium.com/@bytefer/list/mastering-typescript-series-688ee7c12807).

Спасибо [Денису Улесову](https://github.com/denis-ttk-1975) за помощь в редактировании материала.

_Обратите внимание_: предполагается, что вы имеете некоторый опыт работы с `TypeScript`. Если нет, рекомендую начать с:

- [Карманной книги по TypeScript](https://my-js.org/docs/guide/ts) или
- [Шпаргалки по TypeScript](https://my-js.org/docs/cheatsheet/ts).

## `T`, `K` и `V` в дженериках / Generics

<img src="https://habrastorage.org/webt/6j/yg/17/6jyg17pkl43smu0jxhwlim0njnu.gif" />
<br />

`T` называется параметром общего типа (generic type parameter). Это заменитель (placeholder) настоящего (actual) типа, передаваемого функции.

Суть такая: берем тип, определенный пользователем, и привязываем (chain) его к типу параметра функции и типу возвращаемого функцией значения.

<img src="https://habrastorage.org/webt/-z/ul/qw/-zulqwj_xrctzytk2_reaxwekos.gif" />
<br />

Так что все-таки означает `T`? `T` означает тип (type). На самом деле, вместо `T` можно использовать любое валидное название. Часто в сочетании с `T` используются такие общие переменные, как `K`, `V`, `E` и др.

- `K` представляет тип ключа объекта;
- `V` представляет тип значения объекта;
- `E` представляет тип элемента.

<img src="https://habrastorage.org/webt/uk/_r/dy/uk_rdymaxcj_-qfxjphhlaxstme.gif" />
<br />

Разумеется, мы не ограничены одним параметром типа - их может быть сколько угодно:

<img src="https://habrastorage.org/webt/x0/0l/eh/x00lehgykaurlzzu3x1hbwtfn7s.gif" />
<br />

При вызове функции `identity` можно явно определить действительный тип параметра типа. Или можно позволить `TypeScript` самостоятельно сделать вывод относительного него:

<img src="https://habrastorage.org/webt/m3/vy/5x/m3vy5xrj8_xd1alf6gqle02krco.gif" />
<br />

## Утилиты типа / Utility types

Утилиты типа (utility types) позволяют легко конвертировать, извлекать, исключать типы, получать параметры типов и типы значений, возвращаемых функциями.

### 1. `Partial<Type>`

Данная утилита делает все свойства `Type` опциональными (необязательными):

<img src="https://habrastorage.org/webt/on/uj/vi/onujvikybbefyno8n8y6eolvcce.jpeg" />
<br />

```ts
/**
 * Make all properties in T optional.
 * typescript/lib/lib.es5.d.ts
 */
type Partial<T> = {
    [P in keyof T]?: T[P];
};
```

<img src="https://habrastorage.org/webt/1x/2g/mi/1x2gmisencmrmup8w_uwgwqvaui.gif" />
<br />

### 2. `Required<Type>`

Данная утилита делает все свойства `Type` обязательными (она является противоположностью утилиты `Partial`):

<img src="https://habrastorage.org/webt/nl/w5/xm/nlw5xmusrdzm-bf01b9vb6w1_n4.jpeg" />
<br />

```ts
/**
 * Make all properties in T required.
 * typescript/lib/lib.es5.d.ts
 */
type Required<T> = {
    [P in keyof T]-?: T[P];
};
```

<img src="https://habrastorage.org/webt/sx/q1/gp/sxq1gprrrckhlu9navjtfvcvwqs.gif" />
<br />

### 3. `Readonly<Type>`

Данная утилита делает все свойства `Type` доступными только для чтения (`readonly`). Такие свойства являются иммутабельными (их значения нельзя изменять):

<img src="https://habrastorage.org/webt/al/dh/15/aldh15kb78l_ye0xry0wyjfrz0o.jpeg" />
<br />

```ts
/**
 * Make all properties in T readonly.
 * typescript/lib/lib.es5.d.ts
 */
type Readonly<T> = {
    readonly [P in keyof T]: T[P];
};
```

<img src="https://habrastorage.org/webt/kr/vv/li/krvvlitbpq8vtopzkclsw4lbn-o.gif" />
<br />

### 4. `Record<Keys, Type>`

Данная утилита создает новый объектный тип (object type), ключами которого являются `Keys`, а значениями свойств - `Type`. Эта утилита может использоваться для сопоставления свойств одного типа с другим типом:

<img src="https://habrastorage.org/webt/lu/kv/_k/lukv_kmpparbjcks9fb1k0a8dvs.jpeg" />
<br />

```ts
/**
 * Construct a type with a set of properties K of type T.
 * typescript/lib/lib.es5.d.ts
 */
type Record<K extends keyof any, T> = {
    [P in K]: T;
};
```

### 5. `Exclude<UnionType, ExcludedMembers>`

Данная утилита создает новый тип посредством исключения из `UnionType` всех членов объединения, которые могут быть присвоены (assignable) `ExcludedMembers`:

<img src="https://habrastorage.org/webt/_q/dd/vz/_qddvzasm3zp1xsdg79wkch9bdu.jpeg" />
<br />

```ts
/**
 * Exclude from T those types that are assignable to U.
 * typescript/lib/lib.es5.d.ts
 */
type Exclude<T, U> = T extends U ? never : T;
```

<img src="https://habrastorage.org/webt/xd/vd/ee/xdvdeemn3fxa7o4mcyg3rvf9txk.gif" />
<br />

### 6. `Extract<Type, Union>`

Данная утилита создает новый тип посредством извлечения из `Type` всех членов объединения, которые могут быть присвоены `Union`:

<img src="https://habrastorage.org/webt/ok/bg/xm/okbgxmw06mtj5k1wkr6sd6ho_yw.jpeg" />
<br />

```ts
/**
 * Extract from T those types that are assignable to U.
 * typescript/lib/lib.es5.d.ts
 */
type Extract<T, U> = T extends U ? T : never;
```

<img src="https://habrastorage.org/webt/mc/0z/ir/mc0zirbn6cvtg0xnwz0er4eal-y.gif" />
<br />

### 7. `Pick<Type, Keys>`

Данная утилита создает новый тип посредством извлечения из `Type` набора (множества) свойств `Keys` (`Keys` - строковый литерал или их объединение):

<img src="https://habrastorage.org/webt/jz/8m/gp/jz8mgpka8bqelm7zeszphd3j_cs.jpeg" />
<br />

```ts
/**
 * From T, pick a set of properties whose keys are in the union K.
 * typescript/lib/lib.es5.d.ts
 */
type Pick<T, K extends keyof T> = {
    [P in K]: T[P];
};
```

<img src="https://habrastorage.org/webt/e6/ln/dp/e6lndp5avgdwkt1_zx9135x7k8y.gif" />
<br />

### 8. `Omit<Type, Keys>`

Данная утилита создает новый тип посредством исключения из `Type` набора свойств `Keys` (`Keys` - строковый литерал или их объединение) (она является противоположностью утилиты `Pick`):

<img src="https://habrastorage.org/webt/om/ui/yi/omuiyiw23w4aiaejqoz3hgp4azs.jpeg" />
<br />

```ts
/**
 * Construct a type with the properties of T except for those
 * in type K.
 * typescript/lib/lib.es5.d.ts
 */
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;
```

<img src="https://habrastorage.org/webt/dx/bt/hu/dxbthuhtllxklqnzorjsm3zghnm.gif" />
<br />

### 9. `NonNullable<Type>`

Данная утилита создает новый тип посредством исключения из `Type` значений `null` и `undefined`:

<img src="https://habrastorage.org/webt/ru/fi/fo/rufifo7dqykz0y4-faoo3jkhvau.jpeg" />
<br />

```ts
/**
 * Exclude null and undefined from T.
 * typescript/lib/lib.es5.d.ts
 */
type NonNullable<T> = T extends null | undefined ? never : T;
```

### 10. `Parameters<Type>`

Данная утилита создает кортеж (tuple) из типов параметров функции `Type`:

<img src="https://habrastorage.org/webt/rz/xl/mg/rzxlmg4ffkpmtkjsmjz-rsmstjq.jpeg" />
<br />

```ts
/**
 * Obtain the parameters of a function type in a tuple.
 * typescript/lib/lib.es5.d.ts
 */
type Parameters<T extends (...args: any) => any> = T extends
  (...args: infer P) => any ? P : never;
```

### 11. `ReturnType<Type>`

Данная утилита извлекает тип значения, возвращаемого функцией `Type`:

<img src="https://habrastorage.org/webt/mi/6p/zw/mi6pzwjrdqa9c26swdademx-tc8.jpeg" />
<br />

```ts
/**
 * Obtain the return type of a function type.
 * typescript/lib/lib.es5.d.ts
 */
type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any;
```

### 12. `Uppercase<StringType>`

Данная утилита конвертирует строковый литеральный тип в верхний регистр:

<img src="https://habrastorage.org/webt/qg/wk/kr/qgwkkrhxduaefxpkgqxq9wyyl3o.jpeg" />
<br />

### 13. `Lowercase<StringType>`

Данная утилита конвертирует строковый литеральный тип в нижний регистр:

<img src="https://habrastorage.org/webt/8o/4m/xj/8o4mxj7_cltqrytu8lburbuwoso.jpeg" />
<br />

### 14. `Capitalize<StringType>`

Данная утилита конвертирует первый символ строкового литерального типа в верхний регистр:

<img src="https://habrastorage.org/webt/dh/ev/k6/dhevk6kwgahwtpcplhjju5zglae.jpeg" />
<br />

### 15. `Uncapitalize<StringType>`

Данная утилита конвертирует первый символ строкового литерального типа в нижний регистр:

<img src="https://habrastorage.org/webt/pq/d_/au/pqd_aurljkpe3oocrxwrd6gdxmm.jpeg" />
<br />

Кроме описанных выше, существует еще несколько встроенных утилит типа:

- `ConstructorParameters<Type>`: создает кортеж или массив из конструктора функции (речь во всех случаях идет о типах). Результатом является кортеж всех параметров типа (или тип `never`, если `Type` не является функцией);
- `InstanceType<Type>`: создает тип, состоящий из типа экземпляра конструктора функции типа `Type`:
- `ThisParameterType<Type>`: извлекает тип из параметра `this` функции. Если функция не имеет такого параметра, возвращается `unknown`.

## Классы / Classes

В объектно-ориентированных языках программирования класс - это шаблон (blueprint - проект, схема), описывающий свойства и методы, которые являются общими для всех объектов, создаваемых с помощью класса.

### 1. Свойства и методы

#### 1.1. Свойства экземпляров и статические свойства

В `TS`, как и в `JS`, класс определяется с помощью ключевого слова `class`:

```ts
class User {
    name: string;

    constructor(name: string) {
        this.name = name;
    }
}
```

В приведенном примере определяется класс `User` с одним свойством экземпляров `name`. В действительности, класс - это синтаксический сахар для функции-конструктора. Если установить результат компиляции в `ES5`, то будет сгенерирован следующий код:

```js
"use strict";
var User = /** @class */ (function () {
    function User(name) {
        this.name = name;
    }
    return User;
}());
```

Кроме свойств экземпляров, в классе могут определяться статические свойства. Такие свойства определяются с помощью ключевого слова `static`:

```ts
class User {
    static cid: string = "eft";
    name: string;

    constructor(name: string) {
        this.name = name;
    }
}
```

В чем разница между свойствами экземпляров и статическими свойствами? Посмотрим на компилируемый код:

```js
"use strict";
var User = /** @class */ (function () {
    function User(name) {
        this.name = name;
    }

    User.cid = "eft";

    return User;
}());
```

Как видим, свойства экземпляров определяются в экземпляре класса, а статические свойства - в его конструкторе.

#### 1.2. Методы экземпляров и статические методы

Кроме свойств, в классе могут определяться методы экземпляров и статические методы:

```ts
class User {
  static cid: string = "eft";
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  static printCid() {
    console.log(User.cid);
  }

  send(msg: string) {
    console.log(`${this.name} send a message: ${msg}`);
  }
}
```

В чем разница между методами экземпляров и статическими методами? Посмотрим на компилируемый код:

```js
"use strict";
var User = /** @class */ (function () {
    function User(name) {
        this.name = name;
    }

    User.printCid = function () {
        console.log(User.cid);
    };

    User.prototype.send = function (msg) {
        console.log("".concat(this.name, " send a message: ").concat(msg));
    };

    User.cid = "eft";

    return User;
}());
```

Как видим, методы экземпляров добавляются в прототип конструктора, а статические методы в сам конструктор.

### 2. Аксессоры

В классе могут определяться так называемые аксессоры (accessors). Аксессоры, которые делятся на геттеры (getters) и сеттеры (setters) могут использоваться, например, для инкапсуляции данных или их верификации:

```ts
class User {
  private _age: number = 0;

  get age(): number {
    return this._age;
  }

  set age(value: number) {
    if (value > 0 && value <= 120) {
      this._age = value;
    } else {
      throw new Error("The set age value is invalid!");
    }
  }
}
```

### 3. Наследование

Наследование (inheritance) - это иерархическая модель для связывания классов между собой. Наследование - это возможность класса наследовать функционал другого класса и расширять его новым функционалом. Наследование - это наиболее распространенный вид отношений между классами, между классами и интерфейсами, а также между интерфейсами. Наследование облегчает повторное использование кода.

Наследование реализуется с помощью ключевого слова `extends`. Расширяемый класс называется базовым (base), а расширяющий - производным (derived). Производный класс содержит все свойства и методы базового и может определять дополнительные члены.

#### 3.1. Базовый класс

```ts
class Person {
  constructor(public name: string) {}

  public say(words: string) :void {
    console.log(`${this.name} says：${words}`);
  }
}
```

#### 3.2. Производный класс

```ts
class Developer extends Person {
  constructor(name: string) {
    super(name);
    this.say("Learn TypeScript")
  }
}

const bytefer = new Developer("Bytefer");
// "Bytefer says：Learn TypeScript"
```

Класс `Developer` расширяет (extends) класс `Person`. Следует отметить, что класс может расширять только один класс (множественное наследование в `TS`, как и в `JS`, запрещено):

<img src="https://habrastorage.org/webt/gc/wm/7d/gcwm7dx6oqkqwczymh-j_gz74hg.jpeg" />
<br />

Однако мы вполне можем реализовывать (implements) несколько интерфейсов:

```ts
interface CanSay {
  say(words: string) :void
}

interface CanWalk {
  walk(): void;
}

class Person implements CanSay, CanWalk {
  constructor(public name: string) {}

  public say(words: string) :void {
    console.log(`${this.name} says：${words}`);
  }

  public walk(): void {
    console.log(`${this.name} walk with feet`);
  }
}
```

Рассмотренные классы являются конкретными (concrete). В `TS` также существуют абстрактные (abstract) классы.

### 4. Абстрактные классы

Классы, поля и методы могут быть абстрактными. Класс, определенный с помощью ключевого слова `abstract`, является абстрактным. Абстрактные классы не позволяют создавать объекты (другими словами, они не могут инстанцироваться (instantiate) напрямую):

<img src="https://habrastorage.org/webt/tw/tu/ms/twtumsoeqs2dpjsv61zkuuxf69y.jpeg" />
<br />

Абстрактный класс - это своего рода проект класса. Подклассы (subclasses) абстрактного класса должны реализовывать всех его абстрактных членов:

```ts
class Developer extends Person {
  constructor(name: string) {
    super(name);
  }

  say(words: string): void {
    console.log(`${this.name} says ${words}`);
  }
}

const bytefer = new Developer("Bytefer");

bytefer.say("I love TS!"); // Bytefer says I love TS!
```

### 5. Видимость членов

В `TS` для управления видимостью (visibility) свойств и методов класса применяются ключевые слова `public`, `protected` и `private`. Видимость означает возможность доступа к членам за пределами класса, в котором они определяются.

#### 5.1. `public`

Дефолтной видимостью членов класса является `public`. Такие члены доступны за пределами класса без каких-либо ограничений:

```ts
class Person {
  constructor(public name: string) {}

  public say(words: string) :void {
    console.log(`${this.name} says：${words}`);
  }
}
```

#### 5.2. `protected`

Такие члены являются защищенными. Это означает, что они доступны только в определяющем их классе, а также в производных от него классах:

<img src="https://habrastorage.org/webt/0x/ga/iz/0xgaizlphfh5sq85yin5atmnmnu.jpeg" />
<br />

```ts
class Developer extends Person {
  constructor(name: string) {
    super(name);

    console.log(`Base Class：${this.getClassName()}`);
  }
}
const bytefer = new Developer("Bytefer"); // "Base Class：Person"
```

#### 5.3. `private`

Такие члены являются частными (приватными). Это означает, что они доступны только в определяющем их классе:

<img src="https://habrastorage.org/webt/is/m2/na/ism2naudiz0kqojc_vkvozaov3k.jpeg" />
<br />

_Обратите внимание_: `private` не делает членов по-настоящему закрытыми. Это всего лишь соглашение (как префикс `_` в `JS`). Посмотрим на компилируемый код:

```js
"use strict";
var Person = /** @class */ (function () {
    function Person(id, name) {
        this.id = id;
        this.name = name;
    }

    return Person;
}());

var p1 = new Person(28, "bytefer");
```

#### 5.4. Частные поля

Реальные закрытые поля поддерживаются в `TS`, начиная с версии `3.8` (а в `JS` - с прошлого года):

<img src="https://habrastorage.org/webt/pv/ck/0f/pvck0fojwqvkr3xns6tk0nd-ip4.jpeg" />
<br />

Посмотрим на компилируемый код:

```js
"use strict";
var __classPrivateFieldSet = // игнорировать соответствующий код;
var _Person_name;

class Person {
    constructor(name) {
        _Person_name.set(this, void 0);
        __classPrivateFieldSet(this, _Person_name, name, "f");
    }
}

_Person_name = new WeakMap();

const bytefer = new Person("Bytefer");
```

Отличия между частными и обычными полями могут быть сведены к следующему:

- закрытые поля определяются с помощью префикса `#`;
- областью видимости приватного поля является определяющий его класс;
- в отношении частных полей не могут применяться модификаторы доступа (`public` и др.);
- приватные поля недоступны за пределами определяющего их класса.

#### 6. Выражение класса

Выражение класса (class expression) - это синтаксис, используемый дял определения классов. Как и функциональные выражения, выражения класса могут быть именованными и анонимными. В случае с именованными выражениями, название доступно только в теле класса.

Синтаксис выражений класса (квадратные скобки означают опциональность):

```ts
const MyClass = class [className] [extends] {
  // тело класса
};
```

Пример определения класса `Point`:

```ts
const Point = class {
  constructor(public x: number, public y: number) {}

  public length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
}

const p = new Point(3, 4);
console.log(p.length()); // 5
```

При определении класса с помощью выражения также можно использовать ключевое слово `extends`.

### 7. Общий класс

Для определения общего (generic) класса используется синтаксис `<T, ...>` (параметры типа) после названия класса:

```ts
class Person<T> {
  constructor(
    public cid: T,
    public name: string
  ) {}
}

const p1 = new Person<number>(28, "Lolo");
const p2 = new Person<string>("eft", "Bytefer");
```

Рассмотрим пример инстанцирования `p1`:

- при создании объекта `Person` передается тип `number` и параметры конструктора;
- в классе `Person` значение переменной типа `T` становится числом;
- наконец, параметр типа свойства `cid` в конструкторе также становится числом.

Случаи использования дженериков:

- интерфейс, функция или класс работают с несколькими типами данных;
- в интерфейсе, функции или классе тип данных используется в нескольких местах.

### 8. Сигнатура конструктора

При определении интерфейса для описания конструктора может использоваться ключевое слово `new`:

```ts
interface Point {
  new (x: number, y: number): Point;
}
```

`new (x: number, y: number)` называется сигнатурой конструктора (construct signature). Она имеет следующий синтаксис:

```ts
ConstructSignature: new TypeParametersopt ( ParameterListopt ) TypeAnnotationopt
```

`TypeParametersopt`, `ParameterListopt` и `TypeAnnotationopt` - это опциональный параметр типа, опциональный список параметров и опциональная аннотация типов, соответственно. Как применяется сигнатура конструктора? Рассмотрим пример:

```ts
interface Point {
  new (x: number, y: number): Point;
  x: number;
  y: number;
}

class Point2D implements Point {
  readonly x: number;
  readonly y: number;

constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

const point: Point = new Point2D(1, 2); // Error
```

Сообщение об ошибке выглядит так:

```ts
Type 'Point2D' is not assignable to type 'Point'.
 Type 'Point2D' provides no match for the signature 'new (x: number, y: number): Point'.ts(2322)
```

Для решения проблемы определенный ранее интерфейс `Point` нужно немного отрефакторить:

```ts
interface Point {
  x: number;
  y: number;
}

interface PointConstructor {
  new (x: number, y: number): Point;
}
```

Далее определяем фабричную функцию `newPoint`, которая используется для создания объекта `Point`, соответствующего конструктору входящего типа `PointConstructor`:

```ts
class Point2D implements Point {
  readonly x: number;
  readonly y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

function newPoint(
  pointConstructor: PointConstructor,
  x: number,
  y: number
): Point {
  return new pointConstructor(x, y);
}

const point: Point = newPoint(Point2D, 3, 4);
```

### 9. Абстрактная сигнатура конструктора

Абстрактная сигнатура конструктора была представлена в `TS 4.2` для решения таких проблем, как:

```ts
type Constructor = new (...args: any[]) => any;

abstract class Shape {
  abstract getArea(): number;
}

const Ctor: Constructor = Shape; // Error
// Type 'typeof Shape' is not assignable to type 'Constructor'.
//  Cannot assign an abstract constructor type to a non-abstract
// constructor type.ts(2322)
```

Как видим, тип абстрактного конструктора не может присваиваться типу реального конструктора. Для решения данной проблемы следует использовать абстрактную сигнатуру конструктора:

```ts
type AbstractConstructor = abstract new (...args: any[]) => any;

abstract class Shape {
  abstract getArea(): number;
}

const Ctor: AbstractConstructor = Shape; // Ok
```

Далее определяем функцию `makeSubclassWithArea` для создания подклассов класса `Shape`:

```ts
function makeSubclassWithArea(Ctor: AbstractConstructor) {
  return class extends Ctor {
    #sideLength: number;

    constructor(sideLength: number) {
      super();
      this.#sideLength = sideLength;
    }

    getArea() {
      return this.#sideLength ** 2;
    }
  };
}

const Square = makeSubclassWithArea(Shape);
```

Следует отметить, что типы реальных конструкторов типам абстрактных конструкторов присваивать можно:

```ts
abstract class Shape {
  abstract getArea(): number;
}

class Square extends Shape {
  #sideLength: number;

  constructor(sideLength: number) {
    super();
    this.#sideLength = sideLength;
  }

  getArea() {
    return this.#sideLength ** 2;
  }
}

const Ctor: AbstractConstructor = Shape; // Ok
const Ctor1: AbstractConstructor = Square; // Ok
```

В заключение кратко рассмотрим разницу между типом `class` и типом `typeof class`.

### 10. Тип `class` и тип `typeof class`

<img src="https://habrastorage.org/webt/22/if/uu/22ifuulix6us48yguv9hkf-y2yc.jpeg" />
<br />

На основе результатов приведенного примера можно сделать следующие выводы:

- при использовании класса `Person` в качестве типа значение переменной ограничивается экземпляром этого класса;
- при использовании `typeof Person` в качестве типа значение переменной ограничивается статическими свойствами и методами данного класса.

Следует отметить, что в `TS` используется система структурированных типов (structured type system), которая отличается от системы номинальных типов (nominal type system), применяемой в `Java/C++`, поэтому следующий код в `TS` будет работать без каких-либо проблем:

```ts
class Person {
  constructor(public name: string) {}
}

class SuperMan {
  constructor(public name: string) {}
}

const s1: SuperMan = new Person("Bytefer"); // Ok
```

## Связанные типы / Mapped types

Приходилось ли вам использовать вспомогательные типы `Partial`, `Required`, `Readonly` и `Pick`?

<img src="https://habrastorage.org/webt/7f/-2/_k/7f-2_k31dqnahxozjntuthgpbtc.jpeg" />
<br />

Интересно, как они реализованы?

Регистрация пользователей является распространенной задачей в веб-разработке. Определим тип `User`, в котором все ключи являются обязательными:

```ts
type User = {
  name: string
  password: string
  address: string
  phone: string
}
```

Как правило, зарегистрированные пользователи могут модифицировать некоторые данные о себе. Определим новый тип `PartialUser`, в котором все ключи являются опциональными:

```ts
type PartialUser = {
  name?: string
  password?: string
  address?: string
  phone?: string
}
```

В отдельных случаях требуется, чтобы все ключи были доступными только для чтения. Определим новый тип `ReadonlyUser`:

```ts
type ReadonlyUser = {
  readonly name: string
  readonly password: string
  readonly address: string
  readonly phone: string
}
```

Получаем много дублирующегося кода:

<img src="https://habrastorage.org/webt/hc/vq/uw/hcvquwn7fts7llojkvzgc7kakzg.jpeg" />
<br />

Как можно уменьшить его количество? Ответ - использовать сопоставленные типы, которые являются общими типами (generic types), позволяющими связывать тип исходного объекта с типом нового объекта.

<img src="https://habrastorage.org/webt/pk/kz/ed/pkkzedppalge0mugmoezn7fw6_g.jpeg" />
<br />

Синтаксис связанных типов:

<img src="https://habrastorage.org/webt/s2/ew/ay/s2ewaypt-t4bsjrwiyko-c3blre.jpeg" />
<br />

`P in K` можно сравнить с инструкцией `for..in` в `JavaScript`, она используется для перебора всех ключей типа `K`. Тип переменной `T` - это любой тип, валидный с точки зрения `TS`.

<img src="https://habrastorage.org/webt/d-/nm/wc/d-nmwcg237_lvj6bqf_30u0bhts.gif" />
<br />

В процессе связывания типов могут использоваться дополнительные модификаторы, такие как `readonly` и `?`. Соответствующие модификаторы добавляются и удаляются с помощью символов `+` и `-`. По умолчанию модификатор добавляется.

Синтаксис основных связанных типов:

```ts
{ [ P in K ] : T }
{ [ P in K ] ?: T }
{ [ P in K ] -?: T }
{ readonly [ P in K ] : T }
{ readonly [ P in K ] ?: T }
{ -readonly [ P in K ] ?: T }
```

Несколько примеров:

<img src="https://habrastorage.org/webt/qe/xe/r6/qexer6fgk4n1ocnv7c20inbik1y.jpeg" />
<br />

Переопределим тип `PartialUser` с помощью связанного типа:

```ts
type MyPartial<T> = {
  [P in keyof T]?: T[P]
}

type PartialUser = MyPartial<User>
```

`MyPartial` используется для сопоставления типов `User` и `PartialUser`. Оператор `keyof` возвращает все ключи типа в виде объединения (union type). Тип переменной `P` меняется на каждой итерации. `T[P]` используется для получения типа значения, соответствующего атрибуту типа объекта.

Демонстрация потока выполнения `MyPartial`:

<img src="https://habrastorage.org/webt/vj/l1/z1/vjl1z1gfvglzxjtkad6aodeeg_k.jpeg" />
<br />

`TS 4.1` позволяет повторно связывать ключи связанных типов с помощью ключевого слова `as`. Синтаксис выглядит так:

```ts
type MappedTypeWithNewKeys<T> = {
    [K in keyof T as NewKeyType]: T[K]
    //            ^^^^^^^^^^^^^
}
```

Тип `NewKeyType` должен быть подтипом объединения `string | number | symbol`. `as` позволяет определить вспомогательный тип, генерирующий соответствующие геттеры для объектного типа:

```ts
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K]
}

interface Person {
    name: string
    age: number
    location: string
}

type LazyPerson = Getters<Person>
// {
//   getName: () => string
//   getAge: () => number
//   getLocation: () => string
// }
```

<img src="https://habrastorage.org/webt/hv/lw/cg/hvlwcg2qb7zhdkp8plwumgcvgvu.jpeg" />
<br />

Поскольку тип, возвращаемый `keyof T` может содержать тип `symbol`, а вспомогательный тип `Capitalize` требует, чтобы обрабатываемый тип был подтипом `string`, фильтрация типов с помощью оператора `&` в данном случае является обязательной.

Повторно связываемые ключи можно фильтровать путем возвращения типа `never`:

```ts
// Удаляем свойство 'kind'
type RemoveKindField<T> = {
    [K in keyof T as Exclude<K, 'kind'>]: T[K]
}

interface Circle {
    kind: 'circle'
    radius: number
}

type KindlessCircle = RemoveKindField<Circle>
//   type KindlessCircle = {
//       radius: number
//   }
```

## Условные типы / Conditional types

Приходилось ли вам использовать утилиты типов `Exclude`, `Extract`, `NonNullable`, `Parameters` и `ReturnType`?

Все эти утилиты основаны на условных типах (conditional types):

<img src="https://habrastorage.org/webt/re/9c/-l/re9c-l5l3ss1ictmvm8pkob3ma0.gif" />
_Здесь представлена лишь часть процесса_
<br />

Краткая справка:

<img src="https://habrastorage.org/webt/ht/5m/mc/ht5mmcg-ax6n8t9nbollhsxztjo.jpeg" />
<br />

Названные утилиты используются для следующих целей:

- `Exclude` - генерирует новый тип посредством исключения из `UnionType` всех членов объединения, указанных в `ExcludedMembers`;
- `Extract` - генерирует новый тип посредством извлечения из `Type` всех членов объединения, указанных в `Union`;
- `NonNullable` - генерирует новый тип посредством исключения `null` и `undefined` из `Type`;
- `Parameters` - генерирует новый кортеж (tuple) из типов параметров функции `Type`;
- `ReturnType` - генерирует новый тип, содержащий тип значения, возвращаемого функцией `Type`.

Примеры использования этих утилит:

<img src="https://habrastorage.org/webt/tq/8c/g_/tq8cg_0a-c2jojq3_vabbix76pg.jpeg" />
<br />

Синтаксис условных типов:

```ts
T extends U ? X : Y
```

`T`, `U`, `X` и `Y` - заменители типов (см. выше). Сигнатуру можно понимать следующим образом: если `T` может быть присвоен `U`, возвращается тип `X`, иначе возвращается тип `Y`. Это чем-то напоминает тернарный оператор в `JavaScript`.

<img src="https://habrastorage.org/webt/ht/jv/p3/htjvp3me0o8scjw2l2y59vtvpji.gif" />
<br />

Как условные типы используются? Рассмотрим пример:

```ts
type IsString<T> = T extends string ? true : false;
​
type I0 = IsString<number>;  // false
type I1 = IsString<"abc">;  // true
type I2 = IsString<any>;  // boolean
type I3 = IsString<never>;  // never
```

<img src="https://habrastorage.org/webt/po/6u/wv/po6uwvfvnydqjrvyvtdmy19hxbs.gif" />
<br />

Утилита `IsString` позволяет определять, является ли действительный тип, переданный в качестве параметра типа, строковым типом. В дополнение к этому, с помощью условных типов и условных цепочек (conditional chain) можно определять несколько типов за один раз:

<img src="https://habrastorage.org/webt/9d/ve/pp/9dveppff0vo-nd4ymjyqguv7bio.jpeg" />
<br />

Условная цепочка похожа на тернарные выражения в `JS`:

<img src="https://habrastorage.org/webt/9k/kn/jj/9kknjjzqz07t5ybf-bg4vgdjb-g.jpeg" />
<br />

Вопрос: что будет, если передать `TypeName` объединение (union)?

```ts
// "string" | "function"
type T10 = TypeName<string | (() => void)>;
// "string" | "object" | "undefined"
type T11 = TypeName<string | string[] | undefined>;
```

<img src="https://habrastorage.org/webt/fs/9i/zu/fs9izufmtm4_b48d3mqzeg9syqg.gif" />
<br />

Почему типы `T10` и `T11` возвращают объединения? Это объясняется тем, что `TypeName` - это распределенный (distributed) условный тип. Условный тип называется распределенным, если проверяемый тип является "голым" (naked), т. е. не обернут в массив, кортеж, промис и т. д.

<img src="https://habrastorage.org/webt/1i/2b/gi/1i2bgiobeeop-l2ntqacurmdqkw.jpeg" />
<br />

В случае с распределенными условными типами, когда проверяемый тип является объединением, оно разбивается на несколько веток в процессе выполнения операции:

```ts
T extends U ? X : Y
T => A | B | C
A | B | C extends U ? X : Y  =>
(A extends U ? X : Y) | (B extends U ? X : Y) | (C extends U ? X : Y)
```

<img src="https://habrastorage.org/webt/9j/ms/rs/9jmsrsx8c0nyi9gb45wemg7f9iu.gif" />
<br />

Рассмотрим пример:

<img src="https://habrastorage.org/webt/hh/2i/vc/hh2ivccguqxfbgu9fgfgoelvpoi.jpeg" />
<br />

Если параметр типа обернут в условный тип, он не будет распределенным, поэтому процесс не разбивается на отдельные ветки.

Рассмотрим поток выполнения (execution flow) встроенной утилиты `Exclude`:

```ts
type Exclude<T, U> = T extends U ? never : T;
type T4 = Exclude<"a" | "b" | "c", "a" | "b">
​
("a" extends "a" | "b" ? never : "a") // => never
| ("b" extends "a" | "b" ? never : "b") // => never
| ("c" extends "a" | "b" ? never : "c") // => "c"
​
never | never | "c" // => "c"
```

<img src="https://habrastorage.org/webt/hs/qu/bp/hsqubpyvwbij-zz46cs1l_28ifu.gif" />
<br />

Пример реализации утилиты с помощью условных и связанных (mapped, см. [Заметка о Mapped Types и других полезных возможностях современного TypeScript](https://habr.com/ru/company/timeweb/blog/682748/)) типов:

<img src="https://habrastorage.org/webt/dw/oy/7g/dwoy7gpqlg-qvs9a_dxnrxrzwac.jpeg" />
<img src="https://habrastorage.org/webt/fv/xw/cs/fvxwcsrphguvdit9xlcuaredcec.jpeg" />
<br />

```ts
type FunctionPropertyNames<T> = {
    [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];
type FunctionProperties<T> = Pick<T, FunctionPropertyNames<T>>;
​
type NonFunctionPropertyNames<T> = {
    [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];
type NonFunctionProperties<T> = Pick<T, NonFunctionPropertyNames<T>>;
​
interface User {
  id: number;
  name: string;
  age: number;
  updateName(newName: string): void;
}
​
type T5 = FunctionPropertyNames<User>; // "updateName"
type T6 = FunctionProperties<User>; // { updateName: (newName: string) => void; }
type T7 = NonFunctionPropertyNames<User>; // "id" | "name" | "age"
type T8 = NonFunctionProperties<User>; // { id: number; name: string; age: number; }
```

Данные утилиты позволяют легко извлекать атрибуты функциональных и нефункциональных типов, а также связанные с ними объектные типы из типа `User`.

## Пересечения / Intersection types

Тип можно понимать как коллекцию или набор значений. Например, тип `number` можно считать множеством (set) всех чисел. 1.0, 68 принадлежат этому множеству, а "bytefer" нет, поскольку типом "bytefer" является `string`.

Тоже самое справедливо и в отношении объектных типов, которые можно понимать как коллекции объектов. Например, тип `Point` в приведенном ниже примере представляет множество объектов со свойствами `x` и `y`, значениями которых являются числа, а тип `Named` представляет множество объектов со свойством `name`, значением которого является строка:

```ts
interface Point {
  x: number;
  y: number;
}
interface Named {
  name: string;
}
```

<img src="https://habrastorage.org/webt/5d/cg/xu/5dcgxuhbzfbk2hko1cxoeli8xc8.gif" />
<br />

Согласно теории множеств (set theory), множество, содержащее элементы, принадлежащие как множеству `A`, так и множеству `B`, называется пересечением (intersection) множеств `A` и `B`:

<img src="https://habrastorage.org/webt/pd/ly/g6/pdlyg6i2lc79x_otoyzgq8fcijc.gif" />
<br />

При пересечении `Point` и `Named` создается новый тип. Объект нового типа принадлежит как `Point`, так и `Named`.

`TS` предоставляет оператор `&` для реализации операции пересечения нескольких типов. Результирующий новый тип называется пересечением (intersection type).

Правила применения оператора `&`:

- идентичность (identity): выражение `A & A` эквивалентно `A`;
- коммутативность (commutativity): `A & B` эквивалентно `B & A` (за исключением сигнатур вызова и конструктора, см. ниже);
- ассоциативность (associativity): `(A & B) & C` эквивалентно `A & (B & C)`;
- коллапсирование супертипа (supertype collapsing): `A & B` эквивалентно `A`, если `B` является супертипом `A`.

<img src="https://habrastorage.org/webt/vb/vw/s7/vbvws75kiorqidsrl1_87dingag.jpeg" />
<br />

Типы `any` и `never` являются особенными. Не считая типа `never`, пересечением любого типа с `any` является `any`.

Рассмотрим пересечение типов `Point` и `Named`:

<img src="https://habrastorage.org/webt/ss/82/hf/ss82hf1z90ejajabyxakwkcjnk0.gif" />
<br />

Новый тип `NamedPoint` содержит свойства `x`, `y` и `name`. Но что произойдет при пересечении объектов, содержащих одинаковые свойства со значениями разных типов?

```ts
interface X {
  c: string;
  d: string;
}

interface Y {
  c: number;
  e: string
}

type XY = X & Y;
type YX = Y & X;
```

В приведенном примере интерфейсы `X` и `Y` содержат свойство `c`, но значения этого свойства имеют разные типы. Может ли в данном случае значение атрибута `c` в типах `XY` и `YX` быть строкой или числом?

<img src="https://habrastorage.org/webt/32/dl/ud/32dludrkllkmoc-4p75qugtglym.gif" />
<br />

Почему типом значения свойства `c` является `never`? Дело в том, что значение `c` должно быть одновременно и строкой, и числом (`string & number`). Но такого типа не существует, поэтому типом значения `c` становится `never`.

Что произойдет в аналогичном случае с непримитивными значениями? Рассмотрим пример:

<img src="https://habrastorage.org/webt/yp/f5/iq/ypf5iqmk3rqokqyisr0ffetcblk.jpeg" />
<br />

При пересечении нескольких типов в случае, когда существует одинаковое свойство и его значением является объект, значения объединяются в соответствии с указанными выше правилами.

Кроме объектных типов, пересечение может применяться в отношении функциональных типов:

<img src="https://habrastorage.org/webt/me/li/2w/meli2wxiabdapw2okk5fyvb3tog.jpeg" />
<br />

При вызове `f(1, "bytefer")` возникает ошибка:

```ts
No overload matches this call.
  Overload 1 of 2, '(a: string, b: string): void', gave the following error.
    Argument of type 'number' is not assignable to parameter of type 'string'.
  Overload 2 of 2, '(a: number, b: number): void', gave the following error.
    Argument of type 'string' is not assignable to parameter of type 'number'.
```

В данном случае компилятор `TS` обращается к перегрузкам функции (function overloading) для выполнения операции пересечения. Для решения проблемы можно определить новый тип функции `F3` со следующей сигнатурой:

<img src="https://habrastorage.org/webt/zt/qf/dl/ztqfdlx8jetn2qeefz93vwyvk_m.jpeg" />
<br />

С помощью пересечения можно реализовать некоторые полезные утилиты типа (utility types). Например, реализуем утилиту `PartialByKeys`, которая делает типы значений указанных ключей объекта опциональными:

<img src="https://habrastorage.org/webt/7d/fs/gq/7dfsgq6q2ecnqj2ygdayx7pndeu.jpeg" />
<br />

Аналогичным способом можно реализовать утилиту `RequiredByKeys`.

## Шаблонные литеральные типы / Template literal types

При разработке веб-страниц мы часто используем компоненты `Tooltip` или `Popover` для отображения каких-либо сообщений. Для удовлетворения различных сценариев эти компоненты должны позволять устанавливать позицию сообщения, например, `top`, `bottom`, `left`, `right` и т.д.

<img src="https://habrastorage.org/webt/-j/56/yd/-j56ydbdmhnps6-bcfpk5-6akwk.jpeg" />
<br />

Соответствующий тип строковых литералов (string literals) можно определить следующим образом:

```ts
type Side = 'top' | 'right' | 'bottom' | 'left';

const side: Side = "rigth"; // Error
// Type '"rigth"' is not assignable to type 'Side'.
// Did you mean '"right"'?
```

Для многих сценариев этого будет достаточно. Но что если мы хотим расширить список доступных позиций? Например, что если сообщение должно отображаться в верхнем правом углу?

<img src="https://habrastorage.org/webt/fk/cr/9n/fkcr9njypynywne15tcbwvlirrw.jpeg" />
<br />

Определим тип `Placement` посредством расширения типа `Side`:

```ts
type Placement = Side
  | "left-start" | "left-end"
  | "right-start" | "right-end"
  | "top-start" | "top-end"
  | "bottom-start" | "bottom-end"
```

Глядя на эти строковые литералы, нетрудно заметить дублирующийся код, такой как `-start` и `-end`. Кроме того, при определении большого количества литералов легко допустить очепятку.

Существует ли лучший способ решения данной задачи? В `TS 4.1` были представлены шаблонные литеральные типы (template literal types), позволяющие делать так:

```ts
type Alignment = 'start' | 'end';
type Side = 'top' | 'right' | 'bottom' | 'left';
type AlignedPlacement = `${Side}-${Alignment}`;
type Placement = Side | AlignedPlacement;
```

Как и шаблонные строки (template strings/literals) в `JS`, шаблонные типы заключаются в обратные кавычки (\`\`) и могут содержать заменители (placeholders) в форме `${T}`. Передаваемый тип может быть `string`, `number`, `boolean` или `bigint`.

<img src="https://habrastorage.org/webt/is/kb/8w/iskb8wmgwxxhn3gnkun6p8ikoio.jpeg" />
<br />

Шаблонные типы позволяют объединять (concatenate) строковые литералы и конвертировать литералы непримитивных типов в соответствующие строковые литералы. Вот парочка примеров:

<img src="https://habrastorage.org/webt/nu/m2/ow/num2owu1godigxkbpzs1kd6bv7i.jpeg" />
<br />

```ts
type EventName<T extends string> = `${T}Changed`;
type Concat<S1 extends string, S2 extends string> = `${S1}-${S2}`;
type ToString<T extends string | number | boolean | bigint> = `${T}`;

type T0 = EventName<"foo">; // 'fooChanged'
type T1 = Concat<"Hello", "World">; // 'Hello-World'
type T2 = ToString<"bytefer" | 666 | true | -1234n>;
// "bytefer" | "true" | "666" | "-1234"
```

Вопрос: каким будет результат, если тип, переданный в утилиту `EventName` или `Concat` будет объединением? Давайте проверим:

<img src="https://habrastorage.org/webt/tq/vs/ni/tqvsnisbvuaqiaacin05mcoyzfm.jpeg" />
<br />

```ts
type T3 = EventName<"foo" | "bar" | "baz">;
// "fooChanged" | "barChanged" | "bazChanged"

type T4 = Concat<"top" | "bottom", "left" | "right">;
// "top-left" | "top-right" | "bottom-left" | "bottom-right"
```

Почему генерируется такой тип? Это объясняется тем, что в случае шаблонных типов объединения в заменителях распределяются по шаблону:

```ts
`[${A|B|C}]` => `[${A}]` | `[${B}]` | `[${C}]`
```

<img src="https://habrastorage.org/webt/26/uk/ct/26ukctljh58stmayxfbgbvel92g.gif" />
<br />

А в случае с несколькими заменителями, как в утилите `Concat`, объединения разрешаются в векторное произведение (cross product):

```ts
`${A|B}-${C|D}` => `${A}-${C}` | `${A}-${D}` | `${B}-${C}` | `${B}-${D}`
```

<img src="https://habrastorage.org/webt/az/jt/t6/azjtt6rosx4hag20jgajkzgppke.gif" />
<br />

Работая с шаблонными типами, мы также можем применять встроенные утилиты типов для работы со строками, такие как `Uppercase`, `Lowercase`, `Capitalize` и `Uncapitalize`:

```ts
type GetterName<T extends string> = `get${Capitalize<T>}`;
type Cases<T extends string> = `${Uppercase<T>} ${Lowercase<T>} ${Capitalize<T>} ${Uncapitalize<T>}`;

type T5 = GetterName<'name'>;   // "getName"
type T6 = Cases<'ts'>;          // "TS ts Ts ts"
```

Возможности шаблонных типов являются очень мощными. В сочетании с условными типами и ключевым словом `infer` можно реализовать, например, такую утилиту вывода типа (type inference):

```ts
type InferSide<T> = T extends `${infer R}-${Alignment}` ? R : T;

type T7 = InferSide<"left-start">;  // "left"
type T8 = InferSide<"right-end">;   // "right"
```

`TS 4.1` также позволяет использовать оговорку `as` для переименования ключей при сопоставлении типов:

<img src="https://habrastorage.org/webt/pp/_d/18/pp_d18lcplzxc37ftfkr4ipxizi.jpeg" />
<br />

Тип `NewKeyType` должен быть подтипом объединения `string | number | symbol`. В процессе переименования ключей посредством шаблонных типов можно реализовать некоторые полезные утилиты.

Например, определим утилиту `Getters` для генерации типов геттеров для соответствующего объекта:

<img src="https://habrastorage.org/webt/mr/ih/nf/mrihnfrfgwy_dswu0un7pfs97ds.gif" />
<br />

В приведенном примере поскольку тип, возвращаемый `keyof T`, может содержать тип `symbol`, а утилита `Capitilize` требует, чтобы обрабатываемый тип был подтипом строки, необходимо выполнить фильтрацию типов с помощью оператора `&`.

Попробует реализовать более сложную утилиту. Например, для извлечения типов из объекта с произвольными вложенными свойствами:

<img src="https://habrastorage.org/webt/r6/qa/ko/r6qakoknj1cagfplqnfxhge__pi.jpeg" />
<br />

```ts
type PropType<T, Path extends string> = string extends Path
  ? unknown
  : Path extends keyof T
    ? T[Path]
    : Path extends `${infer K}.${infer R}`
      ? K extends keyof T
        ? PropType<T[K], R>
        : unknown
      : unknown;

// см. ниже
declare function getPropValue<T, P extends string>(
  obj: T,
  path: P
): PropType<T, P>;
```

## Оператор `keyof`

Приходилось ли вам использовать утилиты типов `Partial`, `Required`, `Pick` и `Record`?

<img src="https://habrastorage.org/webt/ze/_e/0y/ze_e0yjqw_uvhfkdedsdbiwnuk4.jpeg" />
<br />

Внутри всех этих утилит используется оператор `keyof`.

В `JS` ключи объекта извлекаются с помощью метода `Object.keys`:

```js
const user = {
  id: 666,
  name: "bytefer",
}
const keys = Object.keys(user); // ["id", "name"]
```

В `TS` это делается с помощью `keyof`:

```ts
type User = {
  id: number;
  name: string;
}
type UserKeys = keyof User; // "id" | "name"
```

После получения ключа объектного типа, мы можем получить доступ к типу значения, соответствующему данному ключу, с помощью синтаксиса, аналогичного синтаксису доступа к свойству объекта:

```ts
type U1 = User["id"] // number
type U2 = User["id" | "name"] // string | number
type U3 = User[keyof User] // string | number
```

В приведенном примере используется тип индексированного доступа (indexed access type) для получения типа определенного свойства типа `User`.

Как `keyof` используется на практике? Рассмотрим пример:

```js
function getProperty(obj, key) {
  return obj[key];
}
const user = {
  id: 666,
  name: "bytefer",
}
const userName = getProperty(user, "name");
```

Функция `getProperty` принимает 2 параметра: объект (`obj`) и ключ (`key`), и возвращает значение объекта по ключу.

Перенесем данную функцию в `TS`:

<img src="https://habrastorage.org/webt/yc/_j/dq/yc_jdqjn-qsjh3trxavtlxa7fzo.jpeg" />
<br />

В сообщениях об ошибках говорится о том, что `obj` и `key` имеют неявные типы `any`. Для решения проблемы можно явно определить типы параметров:

<img src="https://habrastorage.org/webt/-9/dq/el/-9dqelqjxqn_gv0ordoqjnlalci.jpeg" />
<br />

Получаем другую ошибку. Для правильного решения следует использовать параметр общего типа (generic) и `keyof`:

```ts
function getProperty<T extends object, K extends keyof T>(
  obj: T, key: K
) {
  return obj[key];
}
```

Определяем 2 параметра типа: `T` и `K`. `extends` применяется, во-первых, для ограничения (constraint) типа, передаваемого `T`, подтипом объекта, во-вторых, для ограничения типа, передаваемого `K`, подтипом объединения ключей объекта.

При отсутствии ключа `TS` генерирует следующее сообщение об ошибке:

<img src="https://habrastorage.org/webt/y3/z7/td/y3z7tdkm8n62ytbvoh26irtrkqw.jpeg" />
<br />

Оператор `keyof` может применяться не только к объектам, но также к примитивам, типу `any`, классам и перечислениям.

<img src="https://habrastorage.org/webt/0p/l1/ah/0pl1ahdtw8vube9crs45mfsnxgy.jpeg" />
<br />

Рассмотрим поток выполнения (execution flow) утилиты `Partial`:

<img src="https://habrastorage.org/webt/on/uj/vi/onujvikybbefyno8n8y6eolvcce.jpeg" />
<br />

```ts
/**
 * Делает все свойства T опциональными.
 * typescript/lib/lib.es5.d.ts
 */
type Partial<T> = {
    [P in keyof T]?: T[P];
};
```

<img src="https://habrastorage.org/webt/1x/2g/mi/1x2gmisencmrmup8w_uwgwqvaui.gif" />
<br />

## Оператор `typeof`

Рассмотрим несколько полезных примеров использования оператора `typeof`.

__1. Получение типа объекта__

<img src="https://habrastorage.org/webt/cr/n8/yr/crn8yrrts2i7ywm0y2p8n3qkfmi.jpeg" />
<br />

Объект `man` - это обычный объект `JS`. Для определения его типа в `TS` можно использовать `type` или `interface`. Тип объекта позволяет применять встроенные утилиты типов, такие как `Partial`, `Required`, `Pick` или `Readonly`, для генерации производных типов.

Для небольших объектов ручное определение типа не составляет труда, но для больших и сложных объектов с несколькими уровнями вложенности это может быть утомительным. Вместо ручного определения типа объекта можно прибегнуть к помощи оператора `typeof`:

```ts
type Person = typeof man;

type Address = Person["address"];
```

`Person["address"]` - это тип индексированного доступа (indexed access type), позволяющий извлекать тип определенного свойства (`address`) из другого типа (`Person`).

__2. Получение типа, представляющего все ключи перечисления в виде строк__

В `TS` перечисление (enum) - это специальный тип, компилирующийся в обычный `JS-объект`:

<img src="https://habrastorage.org/webt/tn/3x/m5/tn3xm5st8_j6jqbghbyx-qxvkee.jpeg" />
<br />

Поэтому к перечислениям также можно применять оператор `typeof`. Однако в случае с перечислениями, `typeof` обычно комбинируется с оператором `keyof`:

<img src="https://habrastorage.org/webt/p5/48/js/p548jsod1phiqkonhza8b2vmil4.jpeg" />
<br />

__3. Получение типа функции__

Другим примером использования `typeof` является получение типа функции (функция в `JS` - это тоже объект). После получения типа функции можно воспользоваться встроенными утилитами типов `ReturnType` и `Parameters` для получения типа возвращаемого функцией значение и типа ее параметров:

<img src="https://habrastorage.org/webt/si/8s/mh/si8smh05eho5glzluncyiskd0qe.jpeg" />
<br />

__4. Получение типа класса__

<img src="https://habrastorage.org/webt/fy/a7/qa/fya7qambyrsntleqxcnjcnx7gme.jpeg" />
<br />

В приведенном примере `createPoint` - это фабричная функция, создающая экземпляры класса `Point`. С помощью `typeof` можно получить сигнатуру конструктора класса `Point` для реализации проверки соответствующего типа. При отсутствии `typeof` в определении типа конструктора возникнет ошибка:

<img src="https://habrastorage.org/webt/9o/rj/-x/9orj-xdyf1oj0luk3leuie3fohm.jpeg" />
<br />

__6. Получение более точного типа__

Использование `typeof` в сочетании с утверждением `const` (const assertion), представленным в `TS 3.4`, позволяет получать более точные (precise) типы:

<img src="https://habrastorage.org/webt/nv/ai/w8/nvaiw8j0-dr_ap-yo-ao2pus9us.jpeg" />
<br />

## Ключевое слово `infer`

Знаете ли вы, как извлечь тип элементов из массива типа `T0` или тип, возвращаемый функцией типа `T1`?

```ts
type T0 = string[];
type T1 = () => string;
```

Для этого можно использовать технику поиска совпадений (pattern matching), предоставляемую `TS` - сочетание условных типов (conditional types) и ключевого слова `infer`.

Условные типы позволяют определять отношения между типами, с их помощью можно определять совпадение типов. `infer` используется для определения переменной типа для хранения типа, захваченного (captured) в процессе поиска совпадений.

Рассмотрим, как можно захватить тип элементов массива типа `T0`:

```ts
type UnpackedArray<T> = T extends (infer U)[] ? U : T;
type U0 = UnpackedArray<T0>; // string
```

<img src="https://habrastorage.org/webt/re/16/jc/re16jcb71gruytibivux3uiqjei.jpeg" />
<br />

В приведенном примере `T extends (infer U)[] ? U : T` - это синтаксис условных типов, а `infer U` - это инструкция расширения (extends clause), представляющая новую переменную типа `U` для хранения предполагаемого или выводимого (inferred) типа.

Для лучшего понимания рассмотрим поток выполнения (execution flow) утилиты `UnpackedArray`:

<img src="https://habrastorage.org/webt/ge/1_/oj/ge1_ojsimvnor7-v6w3csxyu52o.gif" />
<br />

_Обратите внимание_: `infer` может использоваться только в инструкции расширения условного типа. Переменная типа, объявленная посредством `infer`, доступна только в истинной ветке (true branch) условного типа.

```ts
type Wrong1<T extends (infer U)[]> = T[0];      // Error
type Wrong2<T> = (infer U)[] extends T ? U : T; // Error
type Wrong3<T> = T extends (infer U)[] ? T : U; // Error
```

<img src="https://habrastorage.org/webt/sp/he/tx/sphetxei9qurira_kkxsdb-f38s.jpeg" />
<br />

Рассмотрим, как получить тип, возвращаемый функцией `T1`:

```ts
type UnpackedFn<T> = T extends (...args: any[]) => infer U ? U : T;
type U1 = UnpackedFn<T1>;
```

Легко, не правда ли?

_Обратите внимание_: когда речь идет о перезагрузках функции, `TS` использует последнюю сигнатуру вызова (call signature) для вывода типа.

<img src="https://habrastorage.org/webt/c3/8d/kr/c38dkrr76jqj7klfaxgckngi4kq.gif" />
<br />

Условные цепочки, рассмотренные в одном из предыдущих разделов, позволяют реализовать более мощную утилиту типа:

```ts
type Unpacked<T> =
    T extends (infer U)[] ? U :
    T extends (...args: any[]) => infer U ? U :
    T extends Promise<infer U> ? U :
    T;

type T0 = Unpacked<string>;                       // string
type T1 = Unpacked<string[]>;                     // string
type T2 = Unpacked<() => string>;                 // string
type T3 = Unpacked<Promise<string>>;              // string
type T4 = Unpacked<Promise<string>[]>;            // Promise<string>
type T5 = Unpacked<Unpacked<Promise<string>[]>>;  // string
```

<img src="https://habrastorage.org/webt/gl/mv/46/glmv46oyygtivkfbjdjaef_kqcu.jpeg" />
<br />

В приведенном примере утилита `Unpacked` позволяет легко извлекать типы элементов массивов, а также типы, возвращаемые функциями и промисами, благодаря условным типам и условным цепочкам.

Аналогичным способом можно вывести тип ключа объекта. Рассмотрим пример:

```ts
type User = {
  id: number;
  name: string;
}

type PropertyType<T> =  T extends { id: infer U, name: infer R } ? [U, R] : T;
type U3 = PropertyType<User>; // [number, string]
```

<img src="https://habrastorage.org/webt/fc/fi/m4/fcfim4xdv6kobqkoamlscnjsbpi.gif" />
<br />

В приведенном примере используется две переменных типа: `U` и `R`, представляющие типы свойств объекта `id` и `name`, соответственно. При совпадении типов возвращается кортеж (tuple).

Что будет, если определить только переменную типа `U`? Давайте проверим:

```ts
type PropertyType<T> =  T extends { id: infer U, name: infer U } ? U : T;

type U4 = PropertyType<User>; // string | number
```

<img src="https://habrastorage.org/webt/sa/ji/7n/saji7nlkhljmo8abiqn3mrty2y4.gif" />
<br />

Как видите, тип `U4` возвращает объединение (union) типов строки и числа. Почему так происходит? Дело в том, что при наличии нескольких кандидатов для одной и той же переменной типа в ковариантной позиции (covariant position), предполагается, что результирующий тип является объединением.

Тем не менее, в аналогичной ситуации, но в контрвариативной позиции (contravariant position), предполагается, что результирующий тип является пересечением (intersection):

```ts
type Bar<T> = T extends { a: (x: infer U) => void, b: (x: infer U) => void } ? U : never;

type U5 = Bar<{ a: (x: string) => void, b: (x: number) => void }>;  // string & number
```

<img src="https://habrastorage.org/webt/qv/pv/cc/qvpvccnegh2ndhdy5k4hombrnli.gif" />
<br />

В приведенном примере тип `U5` возвращает пересечение типов строки и числа, поэтому результирующим типом будет `never`.

Наконец, позвольте представить вам новую возможность, появившуюся в `TS 4.7`, которая делает процесс вывода типов более согласованным. Но сначала рассмотрим пример:

```ts
type FirstIfString<T> = T extends [infer S, ...unknown[]]
  ? S extends string
    ? S
    : never
  : never;
```

Утилита типа `FirstIsString` использует возможности условных типов, условных цепочек и `infer`. В первом условии проверяется, что переданный тип `T` является непустым кортежем. Там же определяется переменная типа `S` для хранения типа первого элемента захваченного в процессе поиска совпадений кортежа.

Во втором условии проверяется, является ли переменная `S` подтипом (subtype) строки. Если является, возвращается `string`, иначе возвращается `never`.

<img src="https://habrastorage.org/webt/5n/qt/se/5nqtsecrin27uhahelqt8zvenkq.jpeg" />
<br />

Как видите, утилита `FirstIsString` прекрасно справляется со своей задачей. Но можем ли мы ограничиться одним условным типом для достижения того же результата? `TS 4.7` позволяет добавлять опциональную инструкцию расширения в предполагаемый тип для определения явных ограничений (explicit constraints) переменной типа:

```ts
type FirstIfString<T> =
    T extends [infer S extends string, ...unknown[]]
        ? S
        : never;
```

Напоследок реализуем утилиту для преобразования объединения в пересечение:

```ts
type UnionToIntersection<U> = (
  U extends any ? (arg: U) => void : never
) extends (arg: infer R) => void
  ? R
  : never;
```

<img src="https://habrastorage.org/webt/yg/2a/ww/yg2awwdxf2euiarvk3kywteanci.jpeg" />
<br />

## Ключевое слово `declare`

Открываем файл определений `*.d.ts` и видим там ключевое слово `declare`. Знаете ли вы, для чего оно используется?

В `TS-проектах` мы часто импортируем сторонние `JS-SDK` с помощью тега `script`, например, так импортируется `Google Maps`:

```html
<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg&callback=initMap&v=weekly" defer></script>
```

Обращаемся к этому `API` после инициализации:

<img src="https://habrastorage.org/webt/nq/yu/3a/nqyu3az1urk_cwixeki7ieu0dqe.jpeg" />
<br />

Несмотря на то, что все делается в соответствии с официальной документацией, `TS` выводит сообщение об ошибке. Это связано с тем, что компилятор `TS` не может распознать глобальную переменную `google`.

Как решить эту задачу? Использовать ключевое слово `declare` для определения глобальной переменной `google`:

```ts
declare var google: any;
```

<img src="https://habrastorage.org/webt/r1/_z/ql/r1_zql7q1geyiarew26ixzank0g.jpeg" />
<br />

Но почему мы без проблем можем использовать такие глобальные переменные, как `JSON`, `Math` или `Object`? Дело в том, что эти переменные уже объявлены с помощью `declare` в файле определений `lib.es5.d.ts`:

```ts
// typescript/lib/lib.es5.d.ts
declare var JSON: JSON;
declare var Math: Math;
declare var Object: ObjectConstructor;
```

`declare` также может использоваться для определения глобальных функций, классов или перечислений (enums). Такие функции, как `eval`, `isNaN`, `encodeURI` и `parseInt` также определяются в `lib.es5.d.ts`:

```ts
declare function eval(x: string): any;
declare function isNaN(number: number): boolean;
declare function encodeURI(uri: string): string;
declare function parseInt(string: string, radix?: number): number;
```

Следует отметить, что при определении глобальной функции мы не включаем в определение конкретную реализацию этой функции.

На самом деле в большинстве случаев у нас необходимости определять глобальные переменные, предоставляемые сторонними библиотеками, самостоятельно. Для поиска соответствующих типов можно обратиться к [поисковику TypeScript](https://www.typescriptlang.org/dt/search?search=google+map) или к [проекту DefinitelyTypes](https://github.com/DefinitelyTyped/DefinitelyTyped).

<img src="https://habrastorage.org/webt/zw/dw/ae/zwdwaeamy_omlipji5_f76xxk_g.jpeg" />
<br />

Устанавливаем типы для `Google Maps` в качестве зависимости для разработки:

```ts
yarn add -D @types/google.maps
```

Для `npm-пакета` `foo` пакет с типами чаще всего будет называться `@types/foo`. Например, для библиотеки `jquery` пакет с типами называется `@types/jquery`.

Посмотрим на использование `declare` в реальном проекте. Создаем шаблон `Vue-TS-проекта` с помощью [Vite](https://vitejs.dev/):

```bash
yarn create vite test-project --template vue-ts
```

Открываем файл `client.d.ts`:

<img src="https://habrastorage.org/webt/00/gr/-n/00gr-nfgvakva059im5vxtxgb60.jpeg" />
<br />

Видим определения модулей `css`, `jpg` и `ttf`. Зачем нам эти модули? Без их определения компилятор `TS` не сможет их распознать и будет выводить сообщения об ошибках:

<img src="https://habrastorage.org/webt/ry/ed/un/ryedunzxv_idyytprebhuujj_we.jpeg" />
<br />

С помощью символа `*` можно определить один модуль для конкретного типа файлов вместо того, чтобы указывать каждый ресурс по отдельности:

<img src="https://habrastorage.org/webt/p7/wt/gc/p7wtgcxxfmqa-p7wqzuoitcrr1e.jpeg" />
<br />

`TS` также позволяет расширять типы, определенные в существующем модуле, с помощью `declare`. Например, определим свойство `$axios` в каждом экземпляре `Vue-компонента`:

```ts
import { AxiosInstance } from "axios";

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
  }
}
```

Добавляем свойство `$axios` в каждый экземпляр компонента с помощью свойства `globalProperties` объекта с настройками:

```ts
import { createApp } from "vue";
import axios from "axios";
import App from "./App.vue";

const app = createApp(App);

app.config.globalProperties.$axios = axios;

app.mount("#app");
```

И используем его в компоненте:

```ts
import { getCurrentInstance , ComponentInternalInstance} from "vue"

const { proxy } = getCurrentInstance() as ComponentInternalInstance

proxy!.$axios
  .get("https://jsonplaceholder.typicode.com/todos/1")
  .then((res) => res.json())
  .then(console.log);
```

## Определение типа объекта с динамическими свойствами

Приходилось ли вам сталкиваться с подобной ошибкой?

<img src="https://habrastorage.org/webt/1_/0f/4a/1_0f4ailh0gbqndiyyl5edtwcjy.jpeg" />
<br />

Для решения данной проблемы можно прибегнуть к помощи типа `any`:

```ts
consr user: any = {}

user.id = "TS001";
user.name = "Bytefer";
```

Но такое решение не является безопасным с точки зрения типов и нивелирует преимущества использования `TS`.

Другим решением может быть использование `type` или `interface`:

```ts
interface User {
  id: string;
  name: string;
}

const user = {} as User;
user.id = "TS001";
user.name = "Bytefer";
```

Кажется, что задача решена, но что если мы попробует добавить в объект свойство `age`?

```ts
Property 'age' does not exist on type 'User'
```

Получаем сообщение об ошибке. Что делать? Когда известны типы ключей и значений, для определения типа объекта можно воспользоваться сигнатурой доступа по индексу (index signatures). Синтаксис данной сигнатуры выглядит так:

<img src="https://habrastorage.org/webt/xw/s9/wr/xws9wrbv25mbblab2p38xnxvi00.jpeg" />
<br />

_Обратите внимание_: типом ключа может быть только строка, число, символ или строковый литерал. В свою очередь, значение может иметь любой тип.

<img src="https://habrastorage.org/webt/qp/15/vr/qp15vrykj22bebwkoin7sqz3wko.jpeg" />
<br />

Определяем тип `User` с помощью сигнатуры доступа по индексу:

```ts
interface User {
  id: string;
  name: string;
  [key: string]: string;
}
```

При использовании сигнатуры доступа по индексу можно столкнуться с такой ситуацией:

<img src="https://habrastorage.org/webt/ob/-t/g1/ob-tg1l1_ovk-fk1unluoiym4m0.jpeg" />
<br />

- Почему к соответствующему свойству можно получить доступ как с помощью строки `"1"`, так и с помощью числа `1`?
- Почему `keyof NumbersNames` возвращает объединение из строки и числа?

Это объясняется тем, что `JS` неявно приводит число к строке при использовании первого в качестве ключа объекта. `TS` применяет такой же алгоритм.

Кроме сигнатуры доступа по индексу для определения типа объекта можно использовать встроенную утилиту типа `Record`. Назначение данной утилиты состоит в следующем:

<img src="https://habrastorage.org/webt/lu/kv/_k/lukv_kmpparbjcks9fb1k0a8dvs.jpeg" />
<br />

```ts
type User = Record<string, string>

const user = {} as User;
user.id = "TS001"; // Ok
user.name = "Bytefer"; // Ok
```

В чем разница между сигнатурой доступа по индексу и утилитой `Record`? Они обе могут использоваться для определения типа объекта с неизвестными (динамическими) свойствами:

```ts
const user1: Record<string, string> = { name: "Bytefer" }; // Ok
const user2: { [key: string]: string } = { name: "Bytefer" }; // Ok
```

Однако в случае с сигнатурой тип ключа может быть только `string`, `number`, `symbol` или шаблонным литералом. В случае с `Record` ключ может быть литералом или их объединением:

<img src="https://habrastorage.org/webt/c3/he/76/c3he76cpxzmpx7hji6nltkk0buk.jpeg" />
<br />

Взглянем на внутреннюю реализацию `Record`:

```ts
/**
 * Construct a type with a set of properties K of type T.
 * typescript/lib/lib.es5.d.ts
 */
type Record<K extends keyof any, T> = {
    [P in K]: T;
};
```

## Перегрузки функции / Function overloads

Знаете ли вы, почему на представленном ниже изображении имеется столько определений функции `ref` и зачем они нужны?

<img src="https://habrastorage.org/webt/q-/dy/ko/q-dykoh3l88mhiaf3thjyrw_73s.jpeg" />
<br />

Рассмотрим пример простой функции `logError`, принимающей параметр строкового типа и выводящей сообщение об ошибке в консоль инструментов разработчика в браузере:

```ts
function logError(msg: string) {
  console.error(`Возникла ошибка: ${msg}`);
}

logError('Отсутствует обязательное поле.');
```

Что если мы хотим, чтобы данная функция также принимала несколько сообщений в виде массива?

Одним из возможных решений является использование объединения (union types):

```ts
function logError(msg: string | string[]) {
  if (typeof msg === 'string') {
    console.error(`Возникла ошибка: ${msg}`);
  } else if (Array.isArray(msg)) {
    console.error(`Возникли ошибки: ${msg.join('\n')}`);
  }
}

logError('Отсутствует обязательное поле.')
logError(['Отсутствует обязательное поле.', 'Пароль должен состоять минимум из 6 символов.'])
```

Другим решением является использование перегрузки функции (function overloading). Перегрузка функции предполагает наличие сигнатур перегрузки (overload signatures) и сигнатуры реализации (implementation signature).

<img src="https://habrastorage.org/webt/od/xs/rx/odxsrxaygssiqoyshhcl-2tynls.jpeg" />
<br />

Сигнатуры перегрузки определяют типы параметров функции и тип возвращаемого ею значения, но не содержат тела функции. Функция может иметь несколько сигнатур перегрузки:

<img src="https://habrastorage.org/webt/9w/7j/9v/9w7j9vveipawkezntxbgjeyyvt4.jpeg" />
<br />

В сигнатуре реализации для типов параметров и возвращаемого значения должны использоваться более общие типы. Сигнатура реализации также должна содержать тело функции:

<img src="https://habrastorage.org/webt/mw/yo/d4/mwyod44ew2a1jw951sbp1-d4gjs.jpeg" />
<br />

После объединения сигнатур перегрузки и сигнатуры реализации мы имеет такую картину:

<img src="https://habrastorage.org/webt/lb/q6/db/lbq6dbfpnjyqvbqackl-rvn4k7i.jpeg" />
<br />

_Обратите внимание_: вызываются только сигнатуры перегрузки. При обработке перегрузки функции `TS` анализирует список перегрузок и пытается использовать первое определение. Если определение совпадает, анализ прекращается:

<img src="https://habrastorage.org/webt/h6/ti/1e/h6ti1e_ddzlh6ghyxymxrfyvoxo.gif" />
<br />

Если вызвать функцию с типом параметра, соответствующего сигнатуре реализации, возникнет ошибка:

<img src="https://habrastorage.org/webt/e3/aw/so/e3awsoa7thonmvir6zaefnaw5py.jpeg" />
<br />

Перегружаться могут не только функции, но и методы классов. Перегрузка метода - это техника, когда вызывается один и тот же метод класса, но с разными параметрами (разными типами параметров, разным количеством параметров, разным порядком параметров и т.д.). Конкретная сигнатура метода определяется в момент передачи реального параметра.

Рассмотрим пример перегрузки метода:

```ts
class Calculator {
  add(a: number, b: number): number;
  add(a: string, b: string): string;
  add(a: string, b: number): string;
  add(a: number, b: string): string;
  add(a: string | number, b: string | number) {

if (typeof a === 'string' || typeof b === 'string') {
    return a.toString() + b.toString();
  }
    return a + b;
  }
}

const calculator = new Calculator();
const result = calculator.add('Bytefer', ' likes TS');
```
