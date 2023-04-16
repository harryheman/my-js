---
slug: js-ts-features
title: Возможности JavaScript и TypeScript последних лет
description: Обзор возможностей JavaScript и TypeScript последних лет
authors: harryheman
tags: [javascript, js, typescript, ts, feature, возможность]
---

Hello, world!

Представляю вашему вниманию перевод [этой замечательной статьи](https://betterprogramming.pub/all-javascript-and-typescript-features-of-the-last-3-years-629c57e73e42), посвященной возможностям JS и TS последних трех лет, которые вы могли пропустить.

<!--truncate-->

## ECMAScript

### До ES2020 (возможности, о которых многие не знают)

[Теггированые шаблонные литералы / Tagged template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates): если после названия функции указать шаблонный литерал, то функция получит части шаблонных литералов и значения шаблона, например:

```javascript
// Предположим, что мы хотим форматировать число, содержащееся в строке
function formatNumbers(strings: TemplateStringsArray, number: number): string {
  return strings[0] + number.toFixed(2) + strings[1];
}
console.log(formatNumbers`This is the value: ${0}, it's important.`);
// This is the value: 0.00, it's important.

// Или мы хотим "переводить" (в данном случае в нижний регистр) ключи переводов, содержащиеся в строке
function translateKey(key: string): string {
  return key.toLocaleLowerCase();
}
function translate(strings: TemplateStringsArray, ...expressions: string[]): string {
  return strings.reduce((accumulator, currentValue, index) => accumulator + currentValue + translateKey(expressions[index] ?? ''), '');
}
console.log(translate`Hello, this is ${'NAME'} to say ${'MESSAGE'}.`);
// Hello, this is name to say message.
```

[Символы / Symbols](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol): примитивы, представляющие собой гарантировано уникальные значения (`Symbol("foo") === Symbol("foo"); // false`), которые часто используются в качестве ключей объектов во избежание коллизий с другими ключами, например:

```javascript
const obj: { [index: string]: string } = {};

const symbolA = Symbol('a');
const symbolB = Symbol.for('b');

console.log(symbolA.description); // "a"

obj[symbolA] = 'a';
obj[symbolB] = 'b';
obj['c'] = 'c';
obj.d = 'd';

console.log(obj[symbolA]); // "a"
console.log(obj[symbolB]); // "b"
// Ключ не может быть другим символов или быть не символом
console.log(obj[Symbol('a')]); // undefined
console.log(obj['a']); // undefined

// Ключи-символы не "перечисляются" (enumerated) при использовании `for/in`.
for (const i in obj) {
  console.log(i); // "c", "d"
}
```

### ES2020

[Оператор опциональной последовательности / Optional chaining (`?.`)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining): обычно используется для безопасного доступа к свойству потенциально несуществующего/неопределенного (`undefined`) объекта, но также может использоваться для безопасного доступа по индексу к элементу потенциально несуществующего массива и вызова потенциально несуществующей функции, например:

```javascript
// Раньше:
// Если у нас был потенциально несуществующий объект,
// мы не могли легко получить доступ к его свойству
const object: { name: string } | undefined = Math.random() > 0.5 ? undefined : { name: 'test' };
const value = object.name; // TypeError: 'object' is possibly 'undefined'

// Мы должны были проверять "определенность" объекта
// Это ухудшало читаемость кода и становилось сложным в случае вложенных объектов
const objectOld: { name: string } | undefined = Math.random() > 0.5 ? undefined : { name: 'test' };
const valueOld = objectOld ? objectOld.name : undefined;

// Сейчас:
// Мы можем использовать оператор опциональной последовательности
// для безопасного доступа к свойству потенциально несуществующего объекта
const objectNew: { name: string } | undefined = Math.random() > 0.5 ? undefined : { name: 'test' };
const valueNew = objectNew?.name;

// Его также можно использовать для безопасного доступа по индексу и вызова функции
const array: string[] | undefined = Math.random() > 0.5 ? undefined : ['test'];
const item = array?.[0];
const func: (() => string) | undefined = Math.random() > 0.5 ? undefined : () => 'test';
const result = func?.();
```

[Оператор нулевого слияния / Nullish coalescing operator (`??`)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing): является альтернативой оператора `||`. Отличие между этими операторами состоит в том, что `||` применяется ко всем ложным значениям, а `??` - только к `undefined` и `null`, например:

```javascript
const value: string | undefined = Math.random() > 0.5 ? undefined : 'test';

// Раньше:
// Для условного присвоения значения переменной мы использовали оператор `||`
const anotherValue = value || 'hello';
console.log(anotherValue); // "test" или "hello"

// Это не всегда работало хорошо
const incorrectValue = '' || 'incorrect';
console.log(incorrectValue); // всегда "incorrect"
const anotherIncorrectValue = 0 || 'incorrect';
console.log(anotherIncorrectValue); // всегда "incorrect"

// Сейчас:
// Оператор нулевого слияния применяется только в отношении `undefined` и `null`
const newValue = value ?? 'hello';
console.log(newValue) // "test" или "hello"

// Ложные значения не заменяются
const correctValue = '' ?? 'incorrect';
console.log(correctValue); // всегда ""
const anotherCorrectValue = 0 ?? 'incorrect';
console.log(anotherCorrectValue); // всегда 0
```

[`import()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import): функциональное выражение динамического импорта - как `import ... from '...'`, но во время выполнения кода и с возможностью использования переменных:

```javascript
let importModule;
if (shouldImport) {
  importModule = await import('./module.mjs');
}
```

[`String.matchAll()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/matchAll): возвращает несколько совпадений регулярного выражения, включая группы захвата (capture groups), без использования циклов:

```javascript
const stringVar = 'testhello,testagain,';

// Раньше:
// Получаем совпадения, но без групп захвата
console.log(stringVar.match(/test([\w]+?),/g));
// ["testhello,", "testagain,"]

// Получаем одно совпадение с группой захвата
const singleMatch = stringVar.match(/test([\w]+?),/);
if (singleMatch) {
  console.log(singleMatch[0]); // "testhello,"
  console.log(singleMatch[1]); // "hello"
}

// Получаем все совпадения с группами захвата (метод `exec` запоминает индекс последнего совпадения)
// `execMatch` должен быть определен за пределами цикла (для сохранения состояния) и быть глобальным (флаг `g`),
// иначе цикл будет бесконечным
const regex = /test([\w]+?),/g;
let execMatch;
while ((execMatch = regex.exec(stringVar)) !== null) {
  console.log(execMatch[0]); // "testhello,", "testagain,"
  console.log(execMatch[1]); // "hello", "again"
}

// Сейчас:
// Регулярное выражение должно быть глобальным
const matchesIterator = stringVar.matchAll(/test([\w]+?),/g);
// Итерация или преобразование в массив (Array.from()), доступ по индексу запрещен
for (const match of matchesIterator) {
  console.log(match[0]); // "testhello,", "testagain,"
  console.log(match[1]); // "hello", "again"
}
```

[`Promise.allSettled()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled): похож на [`Promise.all()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all), но ожидает (любого) разрешения всех промисов, а не возвращает первую ошибку, что облегчает обработку ошибок:

```javascript
async function success1() { return 'a' };
async function success2() { return 'b' };
async function fail1() { throw 'fail 1' };
async function fail2() { throw 'fail 2' };

// Раньше:
console.log(await Promise.all([success1(), success2()])); // ["a", "b"]
// но:
try {
  await Promise.all([success1(), success2(), fail1(), fail2()]);
} catch (e) {
  console.log(e); // "fail 1"
}
// Мы перехватываем одну ошибку и не имеем доступа к "успешным" значениям

// Фикс (плохой код):
console.log(await Promise.all([ // ["a", "b", undefined, undefined]
  success1().catch(e => { console.log(e); }),
  success2().catch(e => { console.log(e); }),
  fail1().catch(e => { console.log(e); }), // "fail 1"
  fail2().catch(e => { console.log(e); })])); // "fail 2"

// Сейчас:
const results = await Promise.allSettled([success1(), success2(), fail1(), fail2()]);
const successfulResults = results
  .filter(result => result.status === 'fulfilled')
  .map(result => (result as PromiseFulfilledResult<string>).value);
console.log(successfulResults); // ["a", "b"]
results.filter(result => result.status === 'rejected').forEach(error => {
  console.log((error as PromiseRejectedResult).reason); // "fail 1", "fail 2"
});
// или:
for (const result of results) {
  if (result.status === 'fulfilled') {
    console.log(result.value); // "a", "b"
  } else if (result.status === 'rejected') {
    console.log(result.reason); // "fail 1", "fail 2"
  }
}
```

[`BigInt`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt): тип данных, позволяющий хранить (с сохранением точности) и оперировать большими (целыми) числами. Для создания значения такого типа используется либо конструктор `BigInt`, либо символ `n` в конце числа:

```javascript
// Раньше:
// JS хранит числа как числа с плавающей запятой, что всегда влечет небольшую потерю точности,
// которая существенно возрастает после определенного числа
const maxSafeInteger = 9007199254740991;
console.log(maxSafeInteger === Number.MAX_SAFE_INTEGER); // true

// БОльшие числа сравниваются некорректно
console.log(Number.MAX_SAFE_INTEGER + 1 === Number.MAX_SAFE_INTEGER + 2); // true

// Сейчас:
// Тип данных `BigInt` теоретически позволяет хранить и оперировать неопределенно большими (целыми) числами
const maxSafeIntegerPreviously = 9007199254740991n;
console.log(maxSafeIntegerPreviously); // 9007199254740991

const anotherWay = BigInt(9007199254740991);
console.log(anotherWay); // 9007199254740991

// Обратите внимание: в конструктор нельзя передавать числа, которые больше чем MAX_SAFE_INTEGER
const incorrect = BigInt(9007199254740992);
console.log(incorrect); // 9007199254740992
const incorrectAgain = BigInt(9007199254740993);
console.log(incorrectAgain); // 9007199254740992

// Но можно передавать строки или использовать другой синтаксис
const correct = BigInt('9007199254740993');
console.log(correct); // 9007199254740993
const correctAgain = 9007199254740993n;
console.log(correctAgain); // 9007199254740993

// Другие форматы также могут передаваться в виде строк
const hex = BigInt('0x1fffffffffffff');
console.log(hex); // 9007199254740991
const octal = BigInt('0o377777777777777777');
console.log(octal); // 9007199254740991
const binary = BigInt('0b11111111111111111111111111111111111111111111111111111');
console.log(binary); // 9007199254740991

// Большинство арифметических операций работает, как ожидается,
// если другой операнд также является `BigInt`
// Все операции возвращают `BigInt`
const addition = maxSafeIntegerPreviously + 2n;
console.log(addition); // 9007199254740993

const multiplication = maxSafeIntegerPreviously * 2n;
console.log(multiplication); // 18014398509481982

const subtraction = multiplication - 10n;
console.log(subtraction); // 18014398509481972

const modulo = multiplication % 10n;
console.log(modulo); // 2

const exponentiation = 2n ** 54n;
console.log(exponentiation); // 18014398509481984

const exponentiationAgain = 2n^54n;
console.log(exponentiationAgain); // 18014398509481984

const negative = exponentiation * -1n;
console.log(negative); // -18014398509481984

// Деление работает немного иначе, поскольку `BigInt` может хранить только целые числа
const division = multiplication / 2n;
console.log(division); // 9007199254740991
// Для целых чисел, которые делятся без остатка, это работает хорошо

// Иначе результат округляется до целого числа в меньшую сторону
const divisionAgain = 5n / 2n;
console.log(divisionAgain); // 2

// При проверке на равенство с помощью оператора `==`
// `BigInt` приводится к обычному числу
console.log(0n === 0); // false
console.log(0n == 0); // true

// Сравнение работает как ожидается
console.log(1n < 2); // true
console.log(2n > 1); // true
console.log(2 > 2); // false
console.log(2n > 2); // false
console.log(2n >= 2); // true

// Тип
console.log(typeof 1n); // "bigint"
```

[`globalThis`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/globalThis): предоставляет доступ к глобальным переменным, независимо от среды выполнения кода (браузер, Node.js и др.):

```javascript
console.log(globalThis.Math); // объект `Math`
```

[import.meta](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import.meta): в числе прочего, при использовании модулей ES, предоставляет доступ к URL текущего модуля:

```javascript
console.log(import.meta.url); // "file://..."
```

__export * as ... from '...'__: позволяет с легкостью повторно экспортировать (re-export) дефолтные экспорты в качестве субмодулей:

```javascript
export * as am from 'another-module'

import { am } from 'module'
```

### ES2021

[String.replaceAll()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replaceAll): заменяет все вхождения подстроки в строке, является альтернативой регулярного выражения с флагом `g`:

```javascript
const testString = 'hello/greetings everyone/everybody';
// Раньше:
// Заменяет только первое вхождение
console.log(testString.replace('/', '|'));
// 'hello|greetings everyone/everybody'

// Заменяет все вхождения
// Регулярное выражение + экранирование + глобальный флаг
console.log(testString.replace(/\//g, '|'));
// 'hello|greetings everyone|everybody'

// Сейчас:
// Заменяет все вхождения
// Чище и быстрее
console.log(testString.replaceAll('/', '|'));
// 'hello|greetings everyone|everybody'
```

[Promise.any()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/any): возвращается первое "успешное" значение. Отклоняется только при отклонении всех промисов (в этом случае возвращается `AggregateError`), в отличие от [`Promise.race()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/race), который отклоняется при отклонении любого промиса:

```javascript
async function success1() { return 'a' };
async function success2() { return 'b' };
async function fail1() { throw 'fail 1' };
async function fail2() { throw 'fail 2' };

// Раньше:
console.log(await Promise.race([success1(), success2()])); // "a"
// но:
try {
  await Promise.race([fail1(), fail2(), success1(), success2()]);
} catch (e) {
  console.log(e); // "fail 1"
}
// Перехватываем одну ошибку и не имеем доступа к "успешным" значениям

// Фикс (плохой код):
console.log(await Promise.race([ // "a"
  fail1().catch(e => { console.log(e); }), // "fail 1"
  fail2().catch(e => { console.log(e); }), // "fail 2"
  success1().catch(e => { console.log(e); }),
  success2().catch(e => { console.log(e); })]));

// Сейчас:
console.log(await Promise.any([fail1(), fail2(), success1(), success2()])); // "a"
try {
  await Promise.any([fail1(), fail2()]);
} catch (e) {
  console.log(e); // [AggregateError]
  console.log(e.errors); // ["fail 1", "fail 2"]
}
```

[Оператор присваивания нулевого слияния / Nullish coalescing assignment (`??=`)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing_assignment): присваивает новое значение переменной только в том случае, когда текущим значением переменной является `null` или `undefined`:

```javascript
let x1 = undefined;
let x2 = 'a';
const getNewValue = () => 'b';

x1 ??= 'b';
console.log(x1) // "b"

// Обратите внимание: `getNewValue()` не выполняется
x2 ??= getNewValue();
console.log(x1) // "a"
```

[Оператор присваивания логического И / Logical and assignment (`&&=`)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_AND_assignment): присваивает новое значение переменной только в том случае, когда текущим значением переменной является истинное значение:

```javascript
let x1 = undefined;
let x2 = 'a';
const getNewValue = () => 'b';

x1 &&= getNewValue();
console.log(x1) // undefined

x2 &&= 'b';
console.log(x1) // "b"
```

[Оператор присваивания логического ИЛИ / Logical or assignment (`||=`)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_OR_assignment): присваивает новое значение переменной только в том случае, когда текущим значением переменной является ложное значение:

```javascript
let x1 = undefined;
let x2 = 'a';
const getNewValue = () => 'b';

x1 ||= 'b';
console.log(x1) // "b"

x2 ||= getNewValue();
console.log(x1) // "a"
```

[`WeakRef`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakRef): содержит "слабую" ссылку на объект. Слабая ссылка не препятствует уничтожению объекта сборщиком мусора:

```javascript
const ref = new WeakRef(element);

// Получаем значение, если объект/элемент существует и не был уничтожен сборщиком мусора
const value = ref.deref;
console.log(value); // undefined
// Похоже, объекта больше нет
```

__Разделители числовых литералов / Numeric literal separators__: позволяет разделять числа для повышения читаемости, не влияет на функционал:

```javascript
const int = 1_000_000_000;
const float = 1_000_000_000.999_999_999;
const max = 9_223_372_036_854_775_807n;
const binary = 0b1011_0101_0101;
const octal = 0o1234_5670;
const hex = 0xD0_E0_F0;
```

### ES2022

[`await` верхнего уровня / Top level await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await): позволяет использовать ключевое слово `await` на верхнем уровне модулей, что избавляет от необходимости оборачивать асинхронный код в асинхронную функцию и улучшает обработку ошибок:

```javascript
async function asyncFuncSuccess() {
  return 'test';
}
async function asyncFuncFail() {
  throw new Error('Test');
}

// Раньше:
// Ждать разрешения промиса можно было только внутри асинхронной функции
// await asyncFuncSuccess(); // SyntaxError: await is only valid in async functions
// Обертка приводит к усложнению обработки ошибок и потере контроля за порядком выполнения кода
try {
  (async () => {
    console.log(await asyncFuncSuccess()); // "test"
    try {
      await asyncFuncFail();
    } catch (e) {
      // Иначе ошибки не будут перехвачены (или будут перехвачены слишком поздно с усложненной трассировкой стека)
      console.error(e); // Error: "Test"
      throw e;
    }
  })();
} catch (e) {
  // Не выполняется или выполняется слишком поздно
  console.error(e);
}
// Выводится до разрешения промиса
console.log('Hey'); // "Hey"

// Сейчас:
// Файл должен быть модулем (`"type"" "module"` в `package.json` или расширение ".mjs")
console.log(await asyncFuncSuccess()); // "test"
try {
  await asyncFuncFail();
} catch (e) {
  console.error(e); // Error: "Test"
}
// Выводится после разрешения промиса
console.log('Hello'); // "Hello"
```

[`#private`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_class_fields): делает члены класса (свойства и методы) приватными (закрытыми). Такие члены доступны только внутри класса, в котором они определены. Они не могут удаляться или определяться динамически. Любое некорректное поведение завершается синтаксической ошибкой JS. В TS-проектах для обозначения приватных членов класса используется ключевое слово `private`.

```javascript
class ClassWithPrivateField {
  #privateField;
  #anotherPrivateField = 4;

  constructor() {
    this.#privateField = 42; // Ok
    this.#privateField; // SyntaxError
    this.#undeclaredField = 444; // SyntaxError
    console.log(this.#anotherPrivateField); // 4
  }
}

const instance = new ClassWithPrivateField();
instance.#privateField === 42; // SyntaxError
```

[Статические члены класса / Static class members](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/static): делает поле класса (свойство или метод) статическим:

```javascript
class Logger {
  static id = 'Logger1';
  static type = 'GenericLogger';
  static log(message: string | Error) {
    console.log(message);
  }
}

class ErrorLogger extends Logger {
  static type = 'ErrorLogger';
  static qualifiedType;
  static log(e: Error) {
    return super.log(e.toString());
  }
}

console.log(Logger.type); // "GenericLogger"
Logger.log('Test'); // "Test"

// Инстанцирование класса, содержащего только статические поля, бесполезно и
// выполняется здесь только в целях демонстрации
const log = new Logger();

ErrorLogger.log(new Error('Test')); // Error: "Test" (инстанцирование суперкласса не меняет поведение подклассов)
console.log(ErrorLogger.type); // "ErrorLogger"
console.log(ErrorLogger.qualifiedType); // undefined
console.log(ErrorLogger.id); // "Logger1"

// Выбрасывается исключение, поскольку `log` - статический метод, а не метод экземпляра
console.log(log.log()); // log.log is not a function
```

[Статические блоки инициализации / Static initialization blocks](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Static_initialization_blocks): блок кода, который выполняется при инициализации класса. Как правило, такие блоки используются в качестве "конструкторов" статических членов классов:

```javascript
class Test {
  static staticProperty1 = 'Property 1';
  static staticProperty2;
  static {
    this.staticProperty2 = 'Property 2';
  }
}

console.log(Test.staticProperty1); // "Property 1"
console.log(Test.staticProperty2); // "Property 2"
```

__Утверждение импорта / Import assertion (пока доступно только в V8)__: определяет тип импортируемого ресурса. Может использоваться, например, для импорта JSON без необходимости его разбора:

```javascript
import json from './foo.json' assert { type: 'json' };
console.log(json.answer); // 42
```

__Индексы совпадений регулярного выражения / RegExp match indices__: начальный и конечный индексы совпадения регулярного выражения с группами захвата. Это работает с `RegExp.exec()`, `RegExp.match()` и `String.matchAll()`:

```javascript
const matchObj = /(test+)(hello+)/d.exec('start-testesthello-stop');

// Раньше:
console.log(matchObj?.index); // 9 - только начальный индекс совпадения

// Сейчас:
if (matchObj) {
  // Начальный и конечный индексы совпадения
  console.log(matchObj.indices[0]); // [9, 18]

  // Начальный и конечный индексы групп захвата
  console.log(matchObj.indices[1]); // [9, 13]
  console.log(matchObj.indices[2]); // [13, 18]
}
```

[Негативная индексация / Negative indexing](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/at): метод `Array.at` возвращает элементы массива с конца (с помощью отрицательных индексов). `at(-1)` является эквивалентом `arr[arr.length - 1]` для получения последнего элемента, но не для его установки:

```javascript
console.log([4, 5].at(-1)) // 5

const array = [4, 5];
array.at(-1) = 3; // SyntaxError
```

[`Object.hasOwn()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwn): альтернатива метода [`Object.hasOwnProperty()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwnProperty), позволяющая определять наличие в объекте указанного свойства. Работает лучше в некоторых крайних случаях:

```javascript
const obj = { name: 'test' };

console.log(Object.hasOwn(obj, 'name')); // true
console.log(Object.hasOwn(obj, 'gender')); // false
```

[Причина ошибки / Error cause](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause): при повторном выбросе исключения (re-throwing) в качестве второго аргумента в конструктор [`Error`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/Error) можно передать объект со свойством `cause`, значением которого является оригинальное исключение:

```javascript
try {
  try {
    connectToDatabase();
  } catch (err) {
    throw new Error('Не удалось подключиться к базе данных.', { cause: err });
  }
} catch (err) {
  console.log(err.cause); // ReferenceError: connectToDatabase is not defined
}
```

## TypeScript

### Основы (контекст для дальнейшего изложения)

[Дженерики / Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html): позволяют определять (передавать) параметры типов (type parameters). Это позволяет типам быть одновременно общими и типобезопасными (typesafe). Дженерики следует использовать вместо `any` или `unknown` везде, где это возможно.

```javascript
// Без дженериков:
function getFirstUnsafe(list: any[]): any {
  return list[0];
}

const firstUnsafe = getFirstUnsafe(['test']); // any

// С дженериками:
function getFirst<Type>(list: Type[]): Type {
  return list[0];
}

const first = getFirst<string>(['test']); // string

// В данном случае параметр типа может быть опущен, поскольку тип автоматически выводится (inferred) из аргумента
const firstInferred = getFirst(['test']); // string

// Параметр типа может ограничиваться с помощью ключевого слова `extends`
class List<T extends string | number> {
  private list: T[] = [];

  get(key: number): T {
    return this.list[key];
  }

  push(value: T): void {
    this.list.push(value);
  }
}

const list = new List<string>();
list.push(9);
// TypeError: Argument of type 'number' is not assignable to parameter of type 'string'.
const booleanList = new List<boolean>();
// TypeError: Type 'boolean' does not satisfy the constraint 'string | number'.
```

### До TS4 (возможности, о которых многие не знают)

[Утилиты типов / Utility types](https://www.typescriptlang.org/docs/handbook/utility-types.html#handbook-content): позволяют легко создавать типы на основе других типов.

```javascript
interface Test {
  name: string;
  age: number;
}

// `Partial` делает все свойства опциональными
type TestPartial = Partial<Test>;
// { name?: string | undefined; age?: number | undefined; }

// `Required` делает все свойства обязательными
type TestRequired = Required<TestPartial>;
// { name: string; age: number; }

// `Readonly` делает все свойства доступными только для чтения
type TestReadonly = Readonly<Test>;
// { readonly name: string; readonly age: string }

// `Record` облегчает типизацию объектов. Является более предпочтительным способом, чем использование сигнатур доступа по индексу (index signatures)
const config: Record<string, boolean> = { option: false, anotherOption: true };

// `Pick` извлекает указанные свойства
type TestLess = Pick<Test, 'name'>;
// { name: string; }
type TestBoth = Pick<Test, 'name' | 'age'>;
// { name: string; age: string; }

// `Omit` игнорирует указанные свойства
type TestFewer = Omit<Test, 'name'>;
// { age: string; }
type TestNone = Omit<Test, 'name' | 'age'>;
// {}

// `Parameters` извлекает типы параметров функции
function doSmth(value: string, anotherValue: number): string {
  return 'test';
}
type Params = Parameters<typeof doSmth>;
// [value: string, anotherValue: number]

// `ReturnType` извлекает тип значения, возвращаемого функцией
type Return = ReturnType<typeof doSmth>;
// string

// Существует много других утилит
```

[Условные типы / Conditional types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#handbook-content): позволяют определять типы условно на основе совпадения/расширения других типов. Читаются как тернарные операторы в JS.

```javascript
// Извлекает тип из массива или возвращает переданный тип
type Flatten<T> = T extends any[] ? T[number] : T;

// Извлекает тип элемента
type Str = Flatten<string[]>; //string

// Возвращает сам тип
type Num = Flatten<number>; // number
```

__Вывод типов с помощью условных типов__: некоторые дженерики могут быть выведены на основе кода. Для реализации условий на основе выводимых типов используется ключевое слово `extends`. Оно позволяет определять временные (temporary) типы:

```javascript
// Перепишем последний пример
type FlattenOld<T> = T extends any[] ? T[number] : T;

// Вместо индексации массива, мы можем просто вывести из него тип `Item`
type Flatten<T> = T extends (infer Item)[] ? Item : T;

// Что если мы хотим написать тип, извлекающий тип, возвращаемый функцией, или `undefined`?
type GetReturnType<Type> = Type extends (...args: any[]) => infer Return ? Return : undefined;

type Num = GetReturnType<() => number>; // number

type Str = GetReturnType<(x: string) => string>; // string

type Bools = GetReturnType<(a: boolean, b: boolean) => void>; // undefined
```

__Необязательные и прочие (rest) элементы кортежа__: опциональные элементы кортежа обозначаются с помощью `?`, прочие - с помощью `...`:.

```javascript
// Предположим, что длина кортежа может быть от 1 до 3
const list: [number, number?, boolean?] = [];
list[0] // number
list[1] // number | undefined
list[2] // boolean | undefined
list[3] // TypeError: Tuple type '[number, (number | undefined)?, (boolean | undefined)?]' of length '3' has no element at index '3'.

// Кортежи можно создавать на основе других типов
// Оператор `rest` можно использовать, например, для добавления элемента определенного типа в начало массива
function padStart<T extends any[]>(arr: T, pad: string): [string, ...T] {
  return [pad, ...arr];
}

const padded = padStart([1, 2], 'test'); // [string, number, number]
```

[Абстрактные классы / Abstract classes](https://www.typescriptlang.org/docs/handbook/2/classes.html#abstract-classes-and-members): абстрактные классы и абстрактные методы классов обозначаются с помощью ключевого слова `abstract`. Такие классы (методы) не могут инстанцироваться напрямую.

```javascript
abstract class Animal {
  abstract makeSound(): void;

  move(): void {
    console.log('Гуляет...');
  }
}

// Абстрактные методы должны быть реализованы при расширении класса
class Cat extends Animal {}
// CompileError: Non-abstract class 'Cat' does not implement inherited abstract member 'makeSound' from class 'Animal'

class Dog extends Animal {
  makeSound() {
    console.log('Гав!');
  }
}

// Абстрактные классы не могут инстанцироваться (как интерфейсы), а абстрактные методы не могут вызываться напрямую
new Animal();
// CompileError: Cannot create an instance of an abstract class

const dog = new Dog().makeSound(); // Гав!
```

[Сигнатуры конструктора / Construct signatures](https://www.typescriptlang.org/docs/handbook/2/functions.html#construct-signatures): позволяют определять типы конструкторов классов за пределами классов. В большинстве случаев вместо сигнатур конструкторов используются абстрактные классы.

```javascript
interface MyInterface {
  name: string;
}

interface ConstructsMyInterface {
  new(name: string): MyInterface;
}

class Test implements MyInterface {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
}

class AnotherTest {
  age: number;
}

function makeObj(n: ConstructsMyInterface) {
    return new n('hello!');
}

const obj = makeObj(Test); // Test
const anotherObj = makeObj(AnotherTest);
// TypeError: Argument of type 'typeof AnotherTest' is not assignable to parameter of type 'ConstructsMyInterface'.
```

[Утилита типа `ConstructorParameters`](https://www.typescriptlang.org/docs/handbook/utility-types.html#constructorparameterstype): извлекает типы параметров конструктора класса (но не тип самого класса).

```javascript
interface MyInterface {
  name: string;
}

interface ConstructsMyInterface {
  new(name: string): MyInterface;
}

class Test implements MyInterface {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
}

function makeObj(test: ConstructsMyInterface, ...args: ConstructorParameters<ConstructsMyInterface>) {
  return new test(...args);
}

makeObj(Test); // TypeError: Expected 2 arguments, but got 1.
const obj = makeObj(Test, 'test'); // Test
```

### TS4.0

__Типы вариативных кортежей / Variadic tuple types__: прочие (rest) элементы кортежей могут быть общими (generic). Разрешается использование нескольких прочих элементов.

```javascript
// Что если нам нужна функция, комбинирующая 2 кортежа неизвестной длины?
// Как определить возвращаемый тип?

// Раньше:
// Приходилось писать перегрузки (overloads)
declare function concat(arr1: [], arr2: []): [];
declare function concat<A>(arr1: [A], arr2: []): [A];
declare function concat<A, B>(arr1: [A], arr2: [B]): [A, B];
declare function concat<A, B, C>(arr1: [A], arr2: [B, C]): [A, B, C];
declare function concat<A, B, C, D>(arr1: [A], arr2: [B, C, D]): [A, B, C, D];
declare function concat<A, B>(arr1: [A, B], arr2: []): [A, B];
declare function concat<A, B, C>(arr1: [A, B], arr2: [C]): [A, B, C];
declare function concat<A, B, C, D>(arr1: [A, B], arr2: [C, D]): [A, B, C, D];
declare function concat<A, B, C, D, E>(arr1: [A, B], arr2: [C, D, E]): [A, B, C, D, E];
declare function concat<A, B, C>(arr1: [A, B, C], arr2: []): [A, B, C];
declare function concat<A, B, C, D>(arr1: [A, B, C], arr2: [D]): [A, B, C, D];
declare function concat<A, B, C, D, E>(arr1: [A, B, C], arr2: [D, E]): [A, B, C, D, E];
declare function concat<A, B, C, D, E, F>(arr1: [A, B, C], arr2: [D, E, F]): [A, B, C, D, E, F];
// Согласитесь, что выглядит это не очень хорошо

// Также можно было комбинировать типы
declare function concatBetter<T, U>(arr1: T[], arr2: U[]): (T | U)[];
// Но это приводило к типу (T | U)[]

// Сейчас:
// Тип вариативного кортежа позволяет легко комбинировать типы с сохранением информации о длине кортежа
declare function concatNew<T extends Arr, U extends Arr>(arr1: T, arr2: U): [...T, ...U];

const tuple = concatNew([23, 'hey', false] as [number, string, boolean], [5, 99, 20] as [number, number, number]);
console.log(tuple[0]); // 23
const element: number = tuple[1];
// TypeError: Type 'string' is not assignable to type 'number'.
console.log(tuple[6]);
// TypeError: Tuple type '[23, "hey", false, 5, 99, 20]' of length '6' has no element at index '6'.
```

__Помеченные элементы кортежа / Labeled tuple elements__: элементы кортежа могут быть именованными, например `[start: number, end: number]`. Если один элемент является именованным, то остальные элементы также должны быть именованными.

```javascript
type Foo = [first: number, second?: string, ...rest: any[]];

declare function someFunc(...args: Foo);
```

__Вывод типа свойства класса из конструктора__: при установке свойства в конструкторе тип свойства выводится автоматически.

```javascript
class Animal {
  // Раньше тип объявляемого свойства должен быть определяться вручную
  name;

  constructor(name: string) {
    this.name = name;
    console.log(this.name); // string
  }
}
```

__Поддержка тега @deprecated JSDoc__:

```javascript
/** @deprecated message */
type Test = string;

const test: Test = 'dfadsf'; // TypeError: 'Test' is deprecated.
```

### TS4.1

[Типы шаблонных литералов / Template literal types](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html#handbook-content): позволяют определять сложные строковые типы, например, путем комбинации нескольких строковых литералов.

```javascript
type VerticalDirection = 'top' | 'bottom';
type HorizontalDirection = 'left' | 'right';
type Direction = `${VerticalDirection} ${HorizontalDirection}`;

const dir1: Direction = 'top left';
const dir2: Direction = 'left';
// TypeError: Type '"left"' is not assignable to type '"top left" | "top right" | "bottom left" | "bottom right"'.
const dir3: Direction = 'left top';
// TypeError: Type '"left top"' is not assignable to type '"top left" | "top right" | "bottom left" | "bottom right"'.

// Комбинироваться также могут дженерики и утилиты типов
declare function makeId<T extends string, U extends string>(first: T, second: U): `${Capitalize<T>}-${Lowercase<U>}`;
```

[Повторная привязка ключей в связанных типах (mapped types)](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html#key-remapping-via-as): переопределение типов ключей связанных типов при сохранении типов значений - `[K in keyof T as NewKeyType]: T[K]`.

```javascript
// Предположим, что мы хотим, чтобы ключи объекта начинались с нижнего подчеркивания
const obj = { value1: 0, value2: 1, value3: 3 };
const newObj: { [Property in keyof typeof obj as `_${Property}`]: number };
// { _value1: number; _value2: number; _value3: number; }
```

__Рекурсивные условные типы__: условные типы можно использовать внутри их определений. Это позволяет распаковывать типы бесконечно вложенных значений.

```javascript
type Awaited<T> = T extends PromiseLike<infer U> ? Awaited<U> : T;

type P1 = Awaited<string>; // string
type P2 = Awaited<Promise<string>>; // string
type P3 = Awaited<Promise<Promise<string>>>; // string
```

__Поддержка тега @see JSDoc__:

```javascript
const originalValue = 1;
/**
  * Копия другого значения
  * @see originalValue
  */
const value = originalValue;
```

[`explainFiles`](https://www.typescriptlang.org/tsconfig/#explainFiles): при использовании флага CLI `--explainFiles` или установке одноименной настройки в файле `tsconfig.json`, TS сообщает, какие файлы и почему компилируются. Может быть полезным для отладки. Обратите внимание: для уменьшения вывода (output) в больших и сложных проектах можно, например, использовать команду `tsc --explainFiles | less`.

__Явное определение неиспользуемых переменных__: при деструктуризации неиспользуемые переменные могут быть помечены с помощью нижнего подчеркивания. Это предотвращает соответствующую ошибку.

```javascript
const [_first, second] = [3, 5];
console.log(second);

// или даже короче
const [_, value] = [3, 5];
console.log(value);
```

### TS4.3

[Разделение типов аксессоров](https://www.typescriptlang.org/docs/handbook/2/classes.html#getters--setters): при определении аксессоров get/set тип записи/set может быть отделен от типа чтения/get. Это позволяет сеттерам принимать значения разных типов.

```javascript
class Test {
  private _value: number;

  get value(): number {
    return this._value;
  }

  set value(value: number | string) {
    if (typeof value === 'number') {
      this._value = value;
      return;
    }
    this._value = parseInt(value, 10);
  }
}
```

`override`: индикатор перезаписи наследуемого класса. Используется для обеспечения типобезопасности в сложных паттернах наследования. Вместо ключевого слова `override` можно использовать [одноименный декоратор](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html#override).

```javascript
class Parent {
  getName(): string {
    return 'name';
  }
}

class NewParent {
  getFirstName(): string {
    return 'name';
  }
}

class Test extends Parent {
  override getName(): string {
    return 'test';
  }
}

class NewTest extends NewParent {
  override getName(): string { // TypeError: This member cannot have an 'override' modifier because it is not declared in the base class 'NewParent'.
    return 'test';
  }
}
```

__Статические сигнатуры доступа по индексу / Static index signatures__:

```javascript
// Раньше:
class Test {}

Test.test = '';
// TypeError: Property 'test' does not exist on type 'typeof Test'.

// Сейчас:
class NewTest {
  static [key: string]: string;
}

NewTest.test = '';
```

__Поддержка тега @link JSDoc__:

```javascript
const originalValue = 1;
/**
  * Копия {@link originalValue}
  */
const value = originalValue;
```

### TS4.4

[`exactOptionalPropertyTypes`](https://www.typescriptlang.org/tsconfig/#exactOptionalPropertyTypes): использование флага CLI `--exactOptionalPropertyTypes` или установка одноименной настройки в файле `tsconfig.json` запрещает неявную неопределенность поля - вместо `property?: string` следует использовать `property: string | undefined`.

```javascript
class Test {
  name?: string;
  age: number | undefined;
}

const test = new Test();
test.name = undefined;
// TypeError: Type 'undefined' is not assignable to type 'string' with 'exactOptionalPropertyTypes: true'. Consider adding 'undefined' to the type of the target.
test.age = undefined;
console.log(test.age); // undefined
```

### TS4.5

[Утилита типа `Awaited`](https://www.typescriptlang.org/docs/handbook/utility-types.html#awaitedtype): извлекает тип значения бесконечно вложенных промисов. Это также улучшает вывод типов для `Promise.all()`.

```javascript
type P1 = Awaited<string>; // string
type P2 = Awaited<Promise<string>>; // string
type P3 = Awaited<Promise<Promise<string>>>; // string
```

__Модификатор `type` в именованном импорте__: индикатор того, что значение требуется только для проверки типов и может быть удалено при компиляции.

```javascript
// Раньше:
// Импорт значений и типов приходилось разделять во избежание импорта типов после компиляции
import { something } from './file';
import type { SomeType } from './file';

// Сейчас:
// Значения и типы могут импортироваться с помощью одной инструкции
import { something, type SomeType } from './file';
```

[Утверждения `const` / `const` assertions](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes-func.html#readonly-and-const): позволяют корректно типизировать константы как литеральные типы. Это может использоваться во многих случаях и существенно повышает точность типизации. Это также делает объекты и массивы `readonly`, что предотвращает их мутации.

```javascript
// Раньше:
const obj = { name: 'foo', value: 9, toggle: false };
// { name: string; value: number; toggle: boolean; }
// Полю может присваиваться любое значение соответствующего типа
obj.name = 'bar';

const tuple = ['name', 4, true]; // (string | number | boolean)[]
// Длина кортежа и тип каждого элемента неизвестны
// Могут присваиваться любые значения соответствующих типов
tuple[0] = 0;
tuple[3] = 0;

// Сейчас:
const objNew = { name: 'foo', value: 9, toggle: false } as const;
// { readonly name: "foo"; readonly value: 9; readonly toggle: false; }
// Значения полей доступны только для чтения (не могут модифицироваться)
objNew.name = 'bar';
// TypeError: Cannot assign to 'name' because it is a read-only property.

const tupleNew = ['name', 4, true] as const; // readonly ["name", 4, true]
// Длина кортежа и тип каждого элемента теперь известны
tupleNew[0] = 0;
// TypeError: Cannot assign to '0' because it is a read-only property.
tupleNew[3] = 0;
// TypeError: Index signature in type 'readonly ["name", 4, true]' only permits reading.
```

__Автозавершение методов классов__:

<img src="https://habrastorage.org/webt/q6/xt/kv/q6xtkv6a4sq5atuyv_bjsbg2hkk.gif" />
<br />

### TS4.6

__Улучшение вывода типов при доступе по индексу__: более точный вывод типов при доступе по ключу в рамках одного объекта.

```javascript
interface AllowedTypes {
  'number': number;
  'string': string;
  'boolean': boolean;
}

//  `UnionRecord` определяет типы значений полей с помощью `AllowedTypes`
type UnionRecord<AllowedKeys extends keyof AllowedTypes> = { [Key in AllowedKeys]:
{
  kind: Key;
  value: AllowedTypes[Key];
  logValue: (value: AllowedTypes[Key]) => void;
}
}[AllowedKeys];

// `logValue` принимает только значения типа `UnionRecord`
function processRecord<Key extends keyof AllowedTypes>(record: UnionRecord<Key>) {
  record.logValue(record.value);
}

processRecord({
  kind: 'string',
  value: 'hello!',
  // `value` может иметь тип `string | number | boolean`,
  // но в данном случае правильно выводится тип `string`
  logValue: value => {
    console.log(value.toUpperCase());
  }
});
```

[Флаг CLI `--generateTrace`](https://www.typescriptlang.org/docs/handbook/compiler-options.html#compiler-options): указывает TS генерировать файл, содержащий подробности проверки типов и процесса компиляции. Может быть полезным для оптимизации сложных типов.

### TS4.7

[Поддержка модулей ES в Node.js](https://www.typescriptlang.org/tsconfig#module): для типобезопасного использования модулей ES вместо модулей CommonJS предназначена следующая настройка, устанавливаемая в файле `tsconfig.json`:

```json
{
  "compilerOptions": {
    "module": "es2020"
  }
}
```

__Поле `type` файла `package.json`__: вместо указанной выше настройки можно определить следующее поле в файле `package.json`:

```json
"type": "module"
```

__Выражения инстанцирования / Instantiation expressions__: позволяют определять параметры типов при ссылке на значения. Это позволяет конкретизировать (narrow) общие типы без создания оберток.

```javascript
class List<T> {
  private list: T[] = [];

  get(key: number): T {
    return this.list[key];
  }

  push(value: T): void {
    this.list.push(value);
  }
}

function makeList<T>(items: T[]): List<T> {
  const list = new List<T>();
  items.forEach(item => list.push(item));
  return list;
}

// Предположим, что мы хотим определить функцию, создающую список
// элементов определенного типа

// Раньше:
// Требовалось создавать функцию-обертку и передавать ей аргумент с указанием типа
function makeStringList(text: string[]) {
  return makeList(text);
}

// Сейчас:
// Можно использовать выражение инстанцирования
const makeNumberList = makeList<number>;
```

__`extends` и `infer`__: при выводе переменных типов в условных типах, они могут конкретизироваться/ограничиваться с помощью ключевого слова `extends`.

```javascript
// Предположим, что мы хотим извлекать тип первого элемента массива только в случае,
// если такой элемент является строкой
// Для этого можно применить условные типы

// Раньше:
type FirstIfStringOld<T> =
  T extends [infer S, ...unknown[]]
    ? S extends string ? S : never
    : never;

// Вместо 2 вложенных условных типов можно использовать 1
type FirstIfString<T> =
  T extends [string, ...unknown[]]
    // Извлекаем первый тип из типа `T`
    ? T[0]
    : never;
// Но код все равно выглядит не очень хорошо

// Сейчас:
type FirstIfStringNew<T> =
  T extends [infer S extends string, ...unknown[]]
    ? S
    : never;
// Обратите внимание: типизация работает как раньше, но код стал чище

type A = FirstIfStringNew<[string, number, number]>; // string
type B = FirstIfStringNew<["hello", number, number]>; // "hello"
type C = FirstIfStringNew<["hello" | "world", boolean]>; // "hello" | "world"
type D = FirstIfStringNew<[boolean, number, string]>; // never
```

__Опциональные аннотации вариативности для параметров типов__: дженерики могут вести себя по-разному при проверке на совпадение (match), например, разрешение наследования выполняется в обратном порядке для геттеров и сеттеров. Это может быть определено в явном виде для ясности.

```javascript
// Предположим, что у нас имеется интерфейс, расширяющий другой интерфейс
interface Animal {
  animalStuff: any;
}

interface Dog extends Animal {
  dogStuff: any;
}

// А также общий "геттер" и "сеттер".
type Getter<T> = () => T;

type Setter<T> = (value: T) => void;

// Если мы хотим выяснить, совпадают ли Getter<T1> и Getter<T2> или Setter<T1> и Setter<T2>,
// нам следует учитывать ковариантность (covariance)
function useAnimalGetter(getter: Getter<Animal>) {
  getter();
}

// Теперь мы можем передать `Getter` в функцию
useAnimalGetter((() => ({ animalStuff: 0 }) as Animal));
// Это работает

// Что если мы хотим использовать `Getter`, возвращающий `Dog`?
useAnimalGetter((() => ({ animalStuff: 0, dogStuff: 0 }) as Dog));
// Это работает, поскольку `Dog` - это также `Animal`

function useDogGetter(getter: Getter<Dog>) {
  getter();
}

// Если мы попытаемся сделать тоже самое для функции `useDogGetter`,
// то получим другое поведение
useDogGetter((() => ({ animalStuff: 0 }) as Animal));
// TypeError: Property 'dogStuff' is missing in type 'Animal' but required in type 'Dog'.
// Это не работает, поскольку ожидается `Dog`, а не просто `Animal`

useDogGetter((() => ({ animalStuff: 0, dogStuff: 0 }) as Dog));
// Однако, это работает

// Можно предположить, что сеттеры работает как геттеры, но это не так
function setAnimalSetter(setter: Setter<Animal>, value: Animal) {
  setter(value);
}

// Если мы передадим `Setter` такого же типа, все будет хорошо
setAnimalSetter((value: Animal) => {}, { animalStuff: 0 });

function setDogSetter(setter: Setter<Dog>, value: Dog) {
  setter(value);
}

// И здесь
setDogSetter((value: Dog) => {}, { animalStuff: 0, dogStuff: 0 });

// Но если мы передадим `Dog Setter` в функцию `setAnimalSetter`,
// поведение будет противоположным (reversed) `Getter`
setAnimalSetter((value: Dog) => {}, { animalStuff: 0, dogStuff: 0 });
// TypeError: Argument of type '(value: Dog) => void' is not assignable to parameter of type 'Setter<Animal>'.

// Обходной маневр выглядит несколько иначе
setDogSetter((value: Animal) => {}, { animalStuff: 0, dogStuff: 0 });

// Сейчас:
// Не является обязательным, но повышает читаемость кода
type GetterNew<out T> = () => T;
type SetterNew<in T> = (value: T) => void;
```

__Кастомизация разрешения модулей__: настройка `moduleSuffixes` позволяет указывать кастомные суффиксы файлов (например, `.ios`) при работе в специфических окружениях для правильного разрешения импортов.

```json
{
  "compilerOptions": {
    "moduleSuffixes": [".ios", ".native", ""]
  }
}
```

```javascript
import * as foo from './foo';
// Сначала проверяется ./foo.ios.ts, затем ./foo.native.ts и, наконец, ./foo.ts
```

__Переход к определению источника / Go to source definition__: новый пункт меню в редакторе кода. Он похож на "Перейти к определению" (Go to definition), но "предпочитает" файлы `.ts` и `.js` вместо определений типов (`.d.ts`).

### TS4.9

__Оператор `satisfies`__: позволяет проверять совместимость значения с типом без присвоения типа. Это делает вывод типов более точным при сохранении совместимости.

```javascript
// Раньше:
// Предположим, что у нас есть объект, в котором хранятся разные элементы и их цвета
const obj = {
  fireTruck: [255, 0, 0],
  bush: '#00ff00',
  ocean: [0, 0, 255]
} // { fireTruck: number[]; bush: string; ocean: number[]; }

const rgb1 = obj.fireTruck[0]; // number
const hex = obj.bush; // string

// Допустим, мы хотим ограничить типы значений объекта
// Для этого можно применить утилиту типа `Record`
const oldObj: Record<string, [number, number, number] | string> = {
  fireTruck: [255, 0, 0],
  bush: '#00ff00',
  ocean: [0, 0, 255]
} // Record<string, [number, number, number] | string>
// Но это приводит к потере типизации свойств
const oldRgb1 = oldObj.fireTruck[0]; // string | number
const oldHex = oldObj.bush; // string | number

// Сейчас:
// Оператор `satisfies` позволяет проверять совместимость значения с типом без присвоения типа
const newObj = {
  fireTruck: [255, 0, 0],
  bush: '#00ff00',
  ocean: [0, 0, 255]
} satisfies Record<string, [number, number, number] | string>
// { fireTruck: [number, number, number]; bush: string; ocean: [number, number, number]; }

// Типизация свойств сохраняется
// Более того, массив становится кортежем
const newRgb1 = newObj.fireTruck[0]; // number
const newRgb4 = newObj.fireTruck[3];
// TypeError: Tuple type '[number, number, number]' of length '3' has no element at index '3'.
const newHex = newObj.bush; // string
```

__Новые команды__: в редакторе кода появились команды "Удалить неиспользуемые импорты" (Remove unused imports) и "Сортировать импорты" (Sort imports), облегчающие управления импортами.

С возможностями TS5, можно ознакомиться [здесь](https://devblogs.microsoft.com/typescript/announcing-typescript-5-0/).

Надеюсь, вы узнали что-то новое и не зря потратили время.

Happy coding!
