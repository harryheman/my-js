---
sidebar_position: 23
title: Руководство по Go для JavaScript-разработчиков
description: Руководство по Go для JavaScript-разработчиков
keywords: [go, golang, javascript, js]
tags: [go, golang, javascript, js]
---

# Руководство по Go для JavaScript-разработчиков

- [Источник](https://prateeksurana.me/blog/guide-to-go-for-javascript-developers/)

После пяти лет работы JavaScript-разработчиком, занимаясь как фронтендом, так и бэкендом, я провел последний год, осваивая Go для серверной разработки. За это время мне пришлось переосмыслить многие вещи. Различия в синтаксисе, базовых принципах, подходах к организации кода и, конечно, в средах выполнения — все это довольно сильно влияет не только на производительность приложения, но и на эффективность разработчика.

Интерес к Go в JavaScript-сообществе тоже заметно вырос. Особенно после новости от Microsoft о том, что они [переписывают официальный компилятор TypeScript на Go](https://devblogs.microsoft.com/typescript/typescript-native-port/) — и обещают ускорение до 10 раз по сравнению с текущей реализацией.

Эта статья — своего рода путеводитель для JavaScript-разработчиков, которые задумываются о переходе на Go или просто хотят с ним познакомиться. Я постарался структурировать материал вокруг ключевых особенностей языка, сравнивая их с привычными концепциями из JavaScript/TypeScript. И, конечно, расскажу о "подводных камнях", с которыми столкнулся лично — с багажом мышления JS-разработчика.

В этом руководстве мы рассмотрим следующие аспекты этих языков:

- Основы
  - Компиляция и выполнение
  - Пакеты
  - Переменные
  - Структуры и типы
  - Нулевые значения
  - Указатели
  - Функции
- Массивы и срезы
- Отображения (maps)
- Сравнение
- Методы и интерфейсы
- Обработка ошибок
- Конкурентность и параллелизм
- Форматирование и линтинг

Поскольку у JavaScript имеется несколько сред выполнения, во избежание лишней путаницы, в этой статье я буду сравнивать Go с Node.js — ведь и Go, и Node в первую очередь используются на сервере. Кроме того, сегодня TypeScript фактически является стандартом в веб-разработки, поэтому большинство примеров в статье будет на нем.

## Основы

### Компиляция и выполнение

Первое фундаментальное различие - то, как выполняется код. Go — это компилируемый язык, то есть перед запуском код необходимо собрать в исполняемый бинарный файл, содержащий машинный код. В свою очередь, JavaScript интерпретируемый язык, код можно выполнять сразу, без предварительной компиляции (в V8 существует ряд оптимизаций, выполняемых в процессе JIT-компиляции — например, он умеет [выявлять "горячие" участки кода (hot paths) и компилировать их в машинный код](https://sujeet.pro/post/deep-dives/v8-internals/), но эти детали выходят за рамки статьи, поэтому углубляться в них не будем).

Например, в Node.js можно просто создать JS-файл и сразу запустить его через командную строку с помощью `node`:

```javascript
// hello.js

console.log("Hello, World!")
```

```javascript
node hello.js
Hello, World!
```

Чтобы начать работать с Go, нужно скачать бинарную версию языка под вашу операционную систему с официального сайта: https://go.dev/dl/.

Вот как выглядит классическая программа "Hello, World!" на Go:

```go
// hello.go

package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}
```

Подробности синтаксиса, использованного в примере, мы рассмотрим в следующих разделах.

Чтобы запустить эту программу, ее сначала нужно скомпилировать, а затем выполнить полученный бинарный файл:

```bash
go build hello.go

./hello
Hello, World!
```

Или можно воспользоваться командой `run`, которая компилирует и запускает программу за один шаг:

```go
go run hello.go
Hello, World!
```

Поскольку Go компилируется в нативный машинный код, для разных платформ нужно создавать отдельные бинарные файлы под соответствующую архитектуру. К счастью, в Go это делается довольно просто с помощью [переменных окружения `GOOS` и `GOARCH`](https://www.digitalocean.com/community/tutorials/building-go-applications-for-different-operating-systems-and-architectures).

### Пакеты

Любая программа на Go состоит из пакетов (модулей, package) и всегда начинается с выполнения пакета `main`. Внутри этого пакета обязательно должна быть функция с именем `main` — именно она служит точкой входа в программу. Когда выполнение `main()` завершается, программа завершает свою работу.

```go
// main.go

package main

import (
  "fmt"
)

func main() {
  fmt.Println("Hello world")
}
```

> Для краткости в остальных примерах я буду опускать `package main` и `func main()`. Если захочется посмотреть, как работает тот или иной фрагмент, можно будет воспользоваться ссылками на Go Playground.

Пакеты в Go во многом похожи на модули в JS — это просто набор связанных между собой исходных файлов. Создание и импорт пакетов в Go напоминает импорт модулей в JS. Например, в приведенном выше фрагменте мы импортируем пакет `fmt` из стандартной библиотеки Go.

> `fmt` (сокращение от format) — один из базовых пакетов в Go. Он отвечает за форматированный ввод/вывод и во многом повторяет подход, использованный в `printf` и `scanf` из языка C. В примере выше мы использовали функцию `Println`, которая выводит аргументы в дефолтном формате и добавляет перевод строки в конце.

> Далее по тексту вы также встретите функцию `Printf` — она позволяет выводить текст, отформатированный с помощью спецификаторов. Подробнее о доступных спецификаторах можно почитать в [официальной документации](https://pkg.go.dev/fmt).

Аналогично тому, как в JS-проектах используется файл `package.json`, в Go-программах есть файл `go.mod`. Это конфигурационный файл модуля, в котором содержится информация о самом модуле и его зависимостях. Пример стандартного `go.mod`:

```go
module myproject

go 1.16

require (
  github.com/gin-gonic/gin v1.7.4
  golang.org/x/text v0.3.7
)
```

Первая строка указывает путь импорта модуля, который служит его уникальным идентификатором. Вторая строка — минимально требуемая версия Go для работы модуля. Далее идут все зависимости — как прямые, так и косвенные — с указанием конкретных версий.

Чтобы создать пакет в Go, достаточно создать новую директорию с нужным именем — и все Go-файлы внутри нее автоматически будут частью этого пакета, если в начале каждого файла указано соответствующее имя с помощью директивы `package`.

Интересно реализована и система экспорта. В JS (с ESM) мы явно указываем `export`, чтобы сделать функцию или переменную доступной за пределами модуля.
В Go все проще: если имя начинается с заглавной буквы — оно экспортируется.

Пример ниже демонстрирует все вышесказанное:

```go
// go.mod

module myproject

go 1.24

// main.go

package main

import (
  "fmt"
  "myproject/fib"
)

func main() {
  sequence := fib.FibonacciSequence(10)

  // Это вызовет ошибку
  // firstFibonacciNumber := fib.fibonacci(1)

  fmt.Println("Fibonacci sequence of first 10 numbers:")
  fmt.Println(sequence)
}

// fib/fib.go

package fib

// Эта функция не экспортируется, так как ее имя начинается с маленькой буквы
func fibonacci(n int) int {
    if n <= 0 {
        return 0
    }
    if n == 1 {
        return 1
    }

    return fibonacci(n-1) + fibonacci(n-2)
}

// Эта функция экспортируется, так как ее имя начинается с заглавной буквы
func FibonacciSequence(n int) []int {
    sequence := make([]int, n)

    for i := 0; i < n; i++ {
        sequence[i] = fibonacci(i)
    }

    return sequence
}
```

- [Go Playground](https://goplay.tools/snippet/N_t92lh9TVZ)

В приведенном примере мы создали пакет `fib`, просто создав директорию с таким именем.

Обратите внимание: из двух функций экспортируется только `FibonacciSequence`, так как ее имя начинается с заглавной буквы — именно поэтому она доступна за пределами пакета.

### Переменные

Go — это язык со статической типизацией, то есть тип каждой переменной должен быть либо явно указан, либо выведен автоматически, и проверка типов выполняется еще на этапе компиляции. В отличие от JS, где переменные могут содержать значения любого типа, и типизация проверяется только во время выполнения программы.

Например, в JS вполне допустим следующий код:

```javascript
let x = 5;
let y = 2.5;
let sum = x + y;     // Все работает: 7.5
let weird = x + "2"; // Тоже "работает": "52" (но, возможно, это не совсем то, что мы ожидали получить)
```

А вот в Go с типами нужно быть гораздо осторожнее: все [примитивные типы перечислены здесь](https://go.dev/tour/basics/11).

Ключевое слово `var` в Go выполняет примерно ту же роль, что и `let` в современном JS.

```go
var x int = 5
// Или x := 5 — это короткое присваивание (short assignment),
// которое можно использовать вместо var с неявным указанием типа

var y float64 = 2.5

// Такой код не скомпилируется
sum := x + y  // Error: mismatched types int and float64

// Преобразовывать тип следует явно
sum := float64(x) + y
```

- [Go Playground](https://goplay.tools/snippet/pcBQ1yzifU2)

> Стоит отметить, что TypeScript помогает решить проблему с типами в JS, но в конечном итоге это все же лишь синтаксическое расширение JS, которое компилируется все в тот же JS.

Аналогично JS, в Go тоже есть ключевое слово `const`, которое используется для объявления констант. Объявляются они так же, как переменные, но с использованием `const` вместо `var`:

```go
const pi float64 = 3.14

// Или без указания типа, он будет определен автоматически
const s = "hello"
```

В отличие от JS, в Go с помощью `const` можно объявлять только примитивные значения — такие как символы, строки, логические и числовые типы. Для более сложных типов данных `const` в Go не применяется.

> В Go объявление переменной, которая затем не используется, приводит не к предупреждению, как это бывает в JavaScript или TypeScript при использовании линтеров, а к полноценной ошибке компиляции.

### Структуры и типы

В JS для представления набора полей используют объекты. В Go для этого существуют структуры (structs):

```go
type Person struct {
  Name string
  Age  int
}

p := Person{
  Name: "John",
  Age: 32,
}

// Создаем составную структуру
type User struct {
  Person Person
  ID     string
}

u := User{
  Person: p,
  ID:     "123",
}
```

- [Go Playground](https://goplay.tools/snippet/Ts4lLCOVenj)

> В Go поля структуры нужно именовать с заглавной буквы, чтобы они были экспортируемыми (то есть доступными в других пакетах или для [сериализации в JSON](https://pkg.go.dev/encoding/json)). Поля с именами, начинающимися со строчной буквы, не экспортируются и доступны только внутри пакета.

На первый взгляд синтаксис может показаться похожим на TypeScript — особенно на типы или интерфейсы, но поведение отличается. В TypeScript типы только определяют форму значений (контракт), поэтому допустимо передать объекты, содержащие больше полей, чем указано в типе — и это сработает без ошибок.

В Go же структуры — это конкретные типы данных, и совместимость при присваивании определяется по имени, а не по структуре. Так что если в TypeScript такой код будет работать:

```go
interface Person {
  name: string,
  age: number
}

interface User {
  name: string,
  age: number,
  username: string
}

function helloPerson(p: Person) {
  console.log(p)
}

helloPerson({
  name: "John",
  age: 32
})

const x: User = {
  name: "John",
  age: 32,
  username: "john",
}

helloPerson(x)
```

- [TypeScript Playground](https://www.typescriptlang.org/play/?#code/JYOwLgpgTgZghgYwgAgArQM4HsTIN4BQyyIcAthAFzIZhSgDmANEcnA1SQK5kBG0BAL4ECoSLEQoAqhmj5WpCtVr0QzVu04ge-KC2JdZURZxWMhImFxAIwwHMgAWEADYus6KNhAAKAA7Unt4AlPLECDjYLhAAdO4M-sEWBM5uHpg4PoTEJtQARABSWI4gefpsHNQAzABMQkkEESC0yAAe1DJyALxhJOSchcWl5ZrVNeWG0LnIeQBWQ2XJqe5Bma3BQA)

То в Go нет:

```go
type Person struct {
  Name string
  Age  int
}

type User struct {
  Name     string
  Age      int
  Username string
}

func HelloPerson(p Person) {
  fmt.Println(p)
}

func main() {
  // Этот вариант работает без ошибок
  HelloPerson(Person{
    Name: "John",
    Age:  32,
  })

  // Этот — не сработает
  x := User{
    Name:     "John",
    Age:      32,
    Username: "john",
  }

  // Error: cannot use x (type User) as type Person in argument to HelloPerson
  HelloPerson(x)

  // Чтобы все заработало, нужно выполнить явное преобразование
  // HelloPerson(Person{Name: x.Name, Age: x.Age})
}
```

- [Go Playground](https://goplay.tools/snippet/0xrXOeygwd2)

`type` в Go используется не только для определения структур. С их помощью можно определять любые значения, которые может хранить переменная:

```go
type ID int

var i ID
i = 2
```

Часто встречающийся сценарий — создание строковых перечислений (enum):

```go
type Status string

const (
  StatusPending  Status = "pending"
  StatusApproved Status = "approved"
  StatusRejected Status = "rejected"
)

type Response struct {
  Status Status
  Meta   string
}

res := Response{
  Status: StatusApproved,
  Meta:   "Request successful",
}
```

- [Go PLayground](https://goplay.tools/snippet/RTqn_jvfbs9)

В отличие от исключающих объединений (discriminated unions) в TypeScript, пользовательские типы в Go (например, `Status`) — это лишь псевдонимы для базового типа. Переменной типа `Status` можно присвоить любую строку:

```go
var s Status
s = "hello" // Это компилируется
```

- [Go PLayground](https://goplay.tools/snippet/KqOpDOvsMUv)

В TypeScript система типов является полноценно вычислимой (Turing complete), что позволяет расширять и преобразовывать существующие типы, создавать новые и выполнять сложные вычисления непосредственно на уровне типов. Это открывает возможности для продвинутой проверки типов и создания безопасных абстракций:

```go
type Person = {
  firstName: string;
  lastName: string;
  age: number;
}

// Расширенный тип, включающий все свойства Person
// и добавляющий дополнительные свойства
type Doctor = Person & {
  speciality: string;
}

type Res = { status: "success", data: Person } | { status: "error", error: string }

// Res — исключающее объединение, которое позволяет
// обращаться к разным свойствам в зависимости от статуса
function getData(res: Res) {
  switch (res.status) {
    case "success":
      console.log(res.data)
      break;
    case "error":
      console.log(res.error)
      break;
  }
}

// Тип, в котором все свойства необязательны
type OptionalDoctor = Partial<Doctor>

// Тип, содержащий только свойства firstName и speciality
type MinimalDoctor = Pick<Doctor, "firstName" | "speciality">
```

- [TypeScript Playground](https://www.typescriptlang.org/play/?#code/C4TwDgpgBAChBOBnA9gOygXigbwFBSgDMBLJYAOQEMBbCALikWHmNQHMBufKAG0qaq0GTFuy4FKbelFQBXagCMEXAL65cAeg1QAogA9gEVABMIxqKEhQA7gAtiAY1tRb-KJR48oYeMkjxgYghEKGRCWAQUVE1ta2JgZ0pjY3jiNA9vX39A4NxLaAARZAdgZHhMCKQ0KAAyHG5ESAdiD3iQYWZWTlw1PPBoACVgiuxGYEpgWUQGACJEWQcHYMQZgBooYwnKBjgq9BUoAB8cMYmp2YRfeDWoS7KO0TYoXq0oIZDiEMoNz4cWalYEzMUFkqDS6A8PGQcXYUBAyFkFmQLkoADcIDF3ItlkifoRCAgjMBMn4EDkQgp+MDqgloEwzohcIRQSVwVApMAClsABTwYIMd4ASnqBEQcWATigvOCADp6ZNEMK8AQCA4qVA5gslogVnRuCqoA40CgeBAZVC2NLEDLNuNBfqVQo+ZQANbiFVqxDQGZ3a56g2q43IU3m5CWvnW332gNQJ0QV3utQvbQAQQs-SgrBs9klkJJ2SCXz5oTAgXSPD6VgA8qXwR4iiUyhUYJQAi0eAAeBuleAAPnUrzT+Rs8WcaB4ICIpAENGglBMjCa7ba+bJhcr0AAsqxiNR68Ue83HC6uweyusZiQyIIIDMjhrGhBmq1QDNe0A)

В Go структуры в первую очередь служат контейнерами для данных и не обладают возможностями изменения типов, как это реализовано в TypeScript. Ближайший аналог этому в Go — встраивание структур (struct embedding), которое позволяет реализовать композицию и представляет собой своего рода наследование:

```go
type Person struct {
  FirstName string
  LastName  string
}

type Doctor struct {
  Person
  Speciality string
}

d := Doctor{
  Person: Person{
    FirstName: "Bruce",
    LastName:  "Banner",
  },
  Speciality: "gamma",
}

fmt.Println(d.Person.FirstName) // Bruce

// Ключи встроенных структур "поднимаются" наверх,
// поэтому этот вариант тоже работает
fmt.Println(d.FirstName) // Bruce
```

- [Go Playground](https://goplay.tools/snippet/_LJbGUj9-S1)

### Нулевые значения

Еще одна вещь, которая может сбить с толку JS-разработчика — это концепция нулевых значений в Go. В JS, если объявить переменную без присвоения значения, ее значением по умолчанию будет `undefined`:

```javascript
let x: number | undefined;

console.log(x); // undefined

x = 3

console.log(x) // 3
```

- [TypeScript Playground](https://www.typescriptlang.org/play/?#code/DYUwLgBAHgXBB2BXAtgIxAJwgHwo+AJiAGYCW8IBA3AFA0DGA9vAM6OgB0wjA5gBRQAlFQgB6UXkIlylOlAgBeCAGY6TVuxBdeAwWInKgA)

В Go, если определить переменную без явного значения, ей автоматически присваивается так называемое "нулевое значение". Вот какие значения по умолчанию получают некоторые примитивные типы:

```go
var i int // 0
var f float64 // 0
var b bool // false
var s string // ""

x := i + 7 // 7
y := !b // true
z := s + "string" // string
```

- [Go Playground](https://goplay.tools/snippet/NXPb9UiWj0z)

Аналогично, структуры в Go получают нулевые значения по умолчанию для всех своих полей:

```go
type Person struct {
    name string  // ""
    age  int     // 0
}

p := Person{} // Создает структуру Person с пустым именем и возрастом 0
```

- [Go Playground](https://goplay.tools/snippet/-Qj1pxeMWkR)

В Go есть значение `nil`, похожее на `null` в JS, но его могут принимать только переменные ссылочных (reference) типов. Чтобы понять, что это за типы, нужно разобраться с указателями (pointers) в Go.

### Указатели

В Go есть указатели, похожие на те, что используются в языках C и C++, где указатель хранит в памяти адрес, по которому находится значение.

Указатель на тип `T` объявляется с помощью синтаксиса `*T`. Нулевое значение любого указателя в Go — это `nil`.

```go
var i *int

i == nil // true
```

- [Go Playground](https://goplay.tools/snippet/QEpRTztXggP)

Оператор `&` создает указатель на свой операнд, а оператор `*` получает значение по указателю — это называется разыменованием (dereferencing) указателя:

```go
x := 42
i := &x
fmt.Println(*i) // 42

*i = 84
fmt.Println(x) // 84
```

- [Go Playground](https://goplay.tools/snippet/VjT8Pafk3xN)

Следует иметь в виду, что попытка разыменования указателя, равного `nil`, приведет к ошибке [null pointer dereference](https://www.youtube.com/watch?v=bLHL75H_VEM):

```go
var x *string

fmt.Println(*x) // panic: runtime error: invalid memory address or nil pointer dereference
```

- [Go Playground](https://goplay.tools/snippet/DdJGZo9cpkp)

Это подводит нас к важному отличию для JS-разработчиков: за исключением примитивных значений, в JS все передается по ссылке автоматически, тогда как в Go это делается явно с помощью указателей. Например, объекты в JS передаются по ссылке, поэтому если изменить объект внутри функции, изменится и исходный объект:

```javascript
let obj = { value: 42 }

function modifyObject(o) {
    o.value = 84  // Исходный объект изменяется
}

modifyObject(obj)
console.log(obj.value)  // 84
```

- [TypeScript Playground](https://www.typescriptlang.org/play/?#code/DYUwLgBA9gRgVhAvBA3hAbgQ2AVxALggBYAmCAXwChKAzHAOwGMwBLKeiAWygBMWaAngHl4IZgAooASlSUI86ADosuEEggAOIvID0OiEIBOLAOYt62aKOYQWAZy69+LED0pVK3PoJFwxYSXgpSkZ2OyhQRWAoE0C4ZWw8GQg9TSIgA)

В Go почти все передается по значению (кроме срезов (slices), отображений (maps) и каналов (channels), о чем мы поговорим позже), если не использовать указатели. Поэтому такой код в Go работать не будет:

```go
type Object struct {
  Value int
}

func modifyObject(o Object) {
  o.Value = 84
}

o := Object{Value: 42}
modifyObject(o)
fmt.Println(o.Value) // 42
```

- [Go Playground](https://goplay.tools/snippet/-nt_ZN68xMx)

Но если использовать указатели:

```go
func modifyObjectPtr(o *Object) {
  o.Value = 84  // Упрощенный синтаксис для работы со структурами,
  // фактически выполняется (*o).Value
}

o := Object{Value: 42}
modifyObjectPtr(&o)
fmt.Println(o.Value) // 84
```

- [Go Playground](https://goplay.tools/snippet/v4wI6_cRoOz)

Это связано с тем, что при передаче указателя мы передаем адрес памяти исходного объекта, что позволяет напрямую менять его значение. И это касается не только структур — указатель можно создать для любого типа, включая примитивные:

```go
func modifyValue(x *int) {
  *x = 100
}

y := 42
modifyValue(&y)
fmt.Println(y) // 100
```

- [Go Playground](https://goplay.tools/snippet/3jXZoqLjHpe)

### Функции

Мы уже вкратце рассмотрели функции в Go в предыдущем разделе, и, как вы, наверное, уже догадались, они во многом похожи на функции в JS. Их сигнатура тоже довольно схожа, за исключением ключевого слова — в Go используется `func` вместо `function`.

```javascript
func greet(name string) string {
  if name == "" {
    name = "there"
  }
  return "Hello, " + name
}
```

Как и в JS, функции в Go являются первоклассными (first-class) — их можно присваивать переменным, передавать в качестве аргументов и возвращать из других функций. Благодаря этому поддерживаются функции высшего порядка и замыкания. Например:

```go
func makeMultiplier(multiplier int) func(int) int {
  return func(x int) int {
    return x * multiplier
  }
}

double := makeMultiplier(2)

double(2) // 4
```

- [Go Playground](https://goplay.tools/snippet/I50FbD-qkr9)

В Go также можно возвращать несколько значений из функции. Этот подход особенно полезен при обработке ошибок — к этому мы еще вернемся в одном из следующих разделов:

```go
func parseName(fullName string) (string, string) {
    parts := strings.Split(fullName, " ")
    if len(parts) < 2 {
        return parts[0], ""
    }
    return parts[0], parts[1]
}

firstName, lastName := parseName("Bruce Banner")

fmt.Printf("%s, %s", lastName, firstName) // Banner, Bruce
```

- [Go Playground](https://goplay.tools/snippet/jaC8_4Xbckl)

## Массивы и срезы

В Go, в отличие от JS, массивы имеют фиксированную длину — она является частью их типа, поэтому менять ее нельзя. Пусть это и звучит как ограничение, но у Go есть удобное решение, которое мы рассмотрим позже.

Давайте освежим в памяти, как массивы работают в JS:

```javascript
let s: Array<number> = [1, 2, 3];

s.push(4)

s[1] = 0

console.log(s) // [1, 0, 3, 4]
```

Чтобы объявить массив в Go, нужно указать его размер, например так:

```go
var a [3]int
// Это создает массив из 3 элементов с нулевыми значениями: [0 0 0]

a[1] = 2 // [0 2 0]

// Можно также определить массив с начальными значениями
b := [3]int{1,2,3}
```

- [Go Playground](https://goplay.tools/snippet/N7dS0pJ_UCL)

Обратите внимание, что метода `push` нет — в Go массивы имеют фиксированную длину. И вот тут на сцену выходят срезы (slices). Срез — это динамически изменяемый и гибкий "прозрачный" доступ к массиву:

```go
c := [6]int{1,2,3,4,5,6}

d := c[1:4] // [2 3 4]
```

- [Go Playground](https://goplay.tools/snippet/dER8L-Fw4h9)

С первого взгляда это может показаться похожим на срез в JS, но важно помнить: в JS срез - это поверхностная копия массива, а в Go срез хранит ссылку на исходный массив. Поэтому в JS это работает:

```javascript
let x: Array<number> = [1, 2, 3, 4, 5, 6];

let y = x.slice(1, 4)

y[1] = 0

console.log(x, y)
// x = [1, 2, 3, 4, 5, 6]
// y = [2, 0, 4]
```

- [TypeScript Playground](https://www.typescriptlang.org/play/?#code/DYUwLgBAHgXBCCAnRBDAngHgHYFcC2ARiIgHwQC8EA2gIwA0ATHQMx0AsdArHQGwC6AbgBQQ0JDQVoAOgDOwAJYBjEAAp6bAJQi0tPpIAMIxQHssM46CnBjAcxVQ6aDRAD0L6JNp0ITCKwgcENwQ-BASlFS++t5sfEA)

Изменение среза в Go влияет на исходный массив, поэтому для приведенного выше примера:

```go
y[1] = 0

fmt.Println(x) // [1 0 3 4 5 6]
```

- [Go Playground](https://goplay.tools/snippet/ytJ5UotV5t2)

Интересная особенность — литералы срезов. Их можно создавать без указания длины массива:

```go
var a []int

// или
b := []int{1,2,3}

a == nil // true
```

- [Go Playground](https://goplay.tools/snippet/72k43lVxRwl)

Для переменной `b` создается тот же массив, что мы видели ранее, но `b` хранит срез, который ссылается на этот массив. И если вспомнить нулевые значения из предыдущего раздела, то нулевым значением для среза является `nil`, поэтому в приведенном примере `a` будет иметь значение `nil`, так как указатель на базовый массив равен `nil`.

Кроме базового массива, срезы также имеют длину и емкость: длина — это количество элементов, которые срез содержит в данный момент, а емкость — количество элементов в базовом массиве. Доступ к длине и емкости среза можно получить с помощью методов `len` и `cap`, соответственно:

```go
s := []int{1,2,3,4,5,6}

t := s[0:3]

fmt.Printf("len=%d cap=%d %v\n", len(t), cap(t), t)
// len=3 cap=6 [1 2 3]
```

- [Go Playground](https://goplay.tools/snippet/23Y5XwkkC2J)

В приведенном примере срез `t` имеет длину `3`, так как он был взят из исходного массива именно с таким количеством элементов, но исходный массив при этом имеет емкость `6`.

Также можно использовать встроенную функцию `make` для создания среза с помощью синтаксиса `make([]T, len, cap)`. Эта функция выделяет нулевой массив и возвращает срез, ссылающийся на этот массив:

```go
a := make([]int, 5)     // len(a)=5, cap(a)=5

b := make([]int, 0, 5)  // len(b)=0, cap(b)=5
```

- [Go Playground](https://goplay.tools/snippet/sSlO_jyvkoT)

В Go есть встроенная функция `append`, которая позволяет добавлять элементы в срез, не думая о его длине и емкости:

```go
a := []int{1,2,3}

a = append(a,4) // [1 2 3 4]
```

- [Go Playground](https://goplay.tools/snippet/MemMp3lI9_A)

`append()` всегда возвращает срез, который содержит все элементы исходного среза плюс добавленные значения. Если исходный массив слишком мал, чтобы вместить новые элементы, `append()` создает новый массив большего размера и возвращает срез, указывающий на этот новый массив (команда Go подробно объясняет, как это работает, [в одной из своих статей](https://go.dev/blog/slices-intro)).

В отличие от JS, в Go нет встроенных декларативных функций высшего порядка, таких как `map`, `reduce`, `filter` и т.п. Поэтому для обхода срезов или массивов используется обычный цикл `for`:

```go
for i, num := range numbers {
  fmt.Println(i, num)
}

// Или так, если требуется только само число
// for _, num := range numbers
```

- [Go Playground](https://goplay.tools/snippet/iEpJOHjTMmN)

И напоследок: как известно, в JS массивы — это не примитивный тип, поэтому они всегда передаются по ссылке:

```javascript
function modifyArray(arr) {
  arr.push(4);
  console.log("Внутри функции:", arr); // Внутри функции: [1, 2, 3, 4]
}

const myArray = [1, 2, 3];
modifyArray(myArray);
console.log("Снаружи функции:", myArray); // Снаружи функции: [1, 2, 3, 4]
```

В Go массивы передаются по значению, а срезы, как мы уже обсуждали, описывают часть массива и содержат указатель на него. Поэтому при передаче среза изменения его элементов влияют на исходный массив:

```go
func modifyArray(arr [3]int) {
  arr[0] = 100
  fmt.Println("Массив внутри функции:", arr) // Массив внутри функции: [100, 2, 3]
}

func modifySlice(slice []int) {
  slice[0] = 100
  fmt.Println("Срез внутри функции:", slice) // Срез внутри функции: [100, 2, 3]
}

myArray := [3]int{1, 2, 3}
mySlice := []int{1, 2, 3}

modifyArray(myArray)
fmt.Println("Массив после вызова функции:", myArray) // Массив после вызова функции: [1, 2, 3]

modifySlice(mySlice)
fmt.Println("Срез после вызова функции:", mySlice) // Срез после вызова функции: [100, 2, 3]
```

- [Go Playground](https://goplay.tools/snippet/EkXXRTBKYzh)

## Отображения (maps)

В Go отображения по своей сути гораздо ближе к `Map` в JS, чем к обычным JS-объектам (JSON), которые чаще всего используются для хранения пар ключ–значение.

Давайте вспомним, как работают отображения в JS:

```javascript
const userScores: Map<string, number> = new Map();

// Добавляем пары ключ–значение
userScores.set('Alice', 95);
userScores.set('Bob', 82);
userScores.set('Charlie', 90);

// Определяем интерфейс для объекта с возрастом пользователя
interface UserAgeInfo {
  age: number;
}

// Альтернативное создание Map с начальными значениями и использованием интерфейса
const userAges: Map<string, UserAgeInfo> = new Map([
  ['Alice', { age: 28 }],
  ['Bob', { age: 34 }],
  ['Charlie', { age: 22 }]
]);

// Получаем значения
console.log(userScores.get('Alice')); // 95

// Удаляем элемент
userScores.delete('Bob');

// Размер отображения (количество элементов)
console.log(userScores.size); // 2
```

- [TypeScript Playground](https://www.typescriptlang.org/play/?#code/MYewdgzgLgBArhApgJwMqmYiAuGBZAQwAcAeaZASzAHMAaGMOAWwCMUA+GAXgcQHd8xABQBKANwAoCQHppMAIIATRVWowA1ogCeAWgBuBADZxEMIgQrIIEhCnQhMEAHRIoQgOTzDFYInf0ATgBWcRskNAwsF0Q3dwAhEBZ-GAAOACZQ2wiHKNcPAGEACwJkbz9AgAZQmTkAEUQAMypTAjAYKigUBoJfGAaHGChC0yyYAmpTRIArRGAoCQ6untMAVXD5CYBJMH6YAG8JGDGJ3EZWFEkAXylZBUNO5DACKAo9U2BMZ4pwGD4KIfaYH+FCMMAMxiw8AgqkGw0BD26vgkoEgsCyGywuEIpHIqnoaxQGO2-U4PDA-EERCEAG1DjBqZ5vL5kntjohcGkUjBLgBdWh0hkJJL0VnjdkwADMABZuXyBe4iiUyiy2Ry0rKJDzqrcAOIxF40MFGEzWFEQECGRBOQwgahCLL2RxOCaxLw+PwicQwW7BG51RCWg1qVowRBgKDILRhOyRZyKAMxRAeIXubVyVAUABekwasNMTGIyPA5st1tt9vCjtyWcQXtuaSAA)

А вот как с отображениями работают в Go:

```go
// Создание отображения
userScores := map[string]int{
    "Alice":   95,
    "Bob":     82,
    "Charlie": 90,
}

type UserAge struct {
    age int
}

// Альтернативный способ создания
userAges := make(map[string]UserAge)
userAges["Alice"] = UserAge{age: 28}
userAges["Bob"] = UserAge{age: 34}
userAges["Charlie"] = UserAge{age: 22}

// Получаем значения
aliceScore := userScores["Alice"]
fmt.Println(aliceScore) // 95

// Удаляем элемент
delete(userScores, "Bob")

// Размер отображения
fmt.Println(len(userScores)) // 2
```

- [Go Playground](https://goplay.tools/snippet/SC0q91MPMrd)

Стоит отметить, что если обратиться к ключу, которого нет в `map`, то вернется нулевое значение соответствующего типа. В приведенном примере переменная `davidScore` получит значение `0`, в отличие от `undefined` в JS.

```go
davidScore := userScores["David"] // 0
```

Как же тогда понять, действительно ли элемент присутствует в `map`? При обращении к значению по ключу `map` возвращает два значения: первое — это само значение (как мы видели выше), а второе — логическое значение, которое указывает, существует ли такой ключ в `map` на самом деле:

```go
davidScore, exists := userScores["David"]
if !exists {
    fmt.Println("David not found")
}
```

- [Go Playground](https://goplay.tools/snippet/Pr2bOa4ofQi)

И, наконец, как и в случае со срезами, переменные типа `map` в Go являются указателями на внутреннюю структуру данных, поэтому они также передаются по ссылке:

```go
func modifyMap(m map[string]int) {
    m["Zack"] = 100  // Это изменение будет видно вызывающей стороне
}

scores := map[string]int{
    "Alice": 95,
    "Bob":   82,
}

fmt.Println("До:", scores)  // До: map[Alice:95 Bob:82]

modifyMap(scores)

fmt.Println("После:", scores)   // После: map[Alice:95 Bob:82 Zack:100]
```

- [Go Playground](https://goplay.tools/snippet/jNykGSnUQOx)

## Сравнения

Строгое сравнение значений в JS может порой сбивать с толку. Примитивные типы сравниваются по значению, а все остальное — по ссылке:

```javascript
let a = 5
let b = 5
console.log(a === b) // true - сравнение по значению

let str1 = "hello"
let str2 = "hello"
console.log(str1 === str2) // true - сравнение по значению

let a1 = { name: "Hulk" }
let a2 = { name: "Hulk" }
let a3 = a1

console.log(a1 === a2) // false - разные ссылки, несмотря на одинаковое содержимое
console.log(a1 === a3); // true - одна и та же ссылка
```

- [TypeScript Playground](https://www.typescriptlang.org/play/?#code/DYUwLgBAhhC8EFYBQpICM6KQYwPYDsBnXUAOmFwHMAKGWeiNASggHpWIwAnAVxAgC0EPAFsADlC4gAJowCeEAG5RgfJCnARC3AIyYARAAsQwCvo2RtXAEwHjp3ObxESIclWpW99eFest2Tl5+IVEJKVk0BWVVEHVUaG8IAG8IfCgREAAuCH0ACR5gAGt9CABfC2hbeFT0zJz8wpLyyqgAZkwoHXVnYjIKGi64Bih-Ng4AMxVCEIhpAEsJiZApfEgpCdXsEEI5nbF5sH556RA1+ewVYQIjtZwCPrcB2m8RtqYAbnGgvkEtDP4GxWZ22QA)

Но в Go все иначе: почти все сравнивается по значению — даже составные типы, такие как структуры и массивы, если только они не содержат несравнимые (incomparable) типы (например, срезы, отображения и т.д.). Например:

```go
type Person struct {
    Name string
    Age  int
}

p1 := Person{Name: "Alice", Age: 30}
p2 := Person{Name: "Alice", Age: 30}

fmt.Println("p1 == p2:", p1 == p2) // true - одинаковое содержимое, разные переменные

// Массивы сравниваются по значению
arr1 := [3]int{1, 2, 3}
arr2 := [3]int{1, 2, 3}

fmt.Println("arr1 == arr2:", arr1 == arr2) // true - одинаковое содержимое, разные переменные

// Срезы напрямую не сравниваются
tasks := []string{"Task1", "Task2", "Task3"}
tasks2 := []string{"Task1", "Task2", "Task3"}

// Это не скомпилируется:
// fmt.Println(tasks == tasks2) // invalid operation: tasks == tasks2

// Это допустимо
fmt.Println(tasks == nil) // false

// Но если структура содержит несравнимые типы, она тоже становится несравнимой
type Container struct {
    Items []int // срез — несравнимый тип
}

c1 := Container{Items: []int{1, 2, 3}}
c2 := Container{Items: []int{1, 2, 3}}

// Это не скомпилируется:
// fmt.Println("c1 == c2:", c1 == c2) // error: struct containing slice cannot be compared

// Указатели сравниваются по ссылке (адресу)
pp1 := &Person{Name: "Bob", Age: 25}
pp2 := &Person{Name: "Bob", Age: 25}
pp3 := pp1

fmt.Println("pp1 == pp2:", pp1 == pp2) // false - разные переменные
fmt.Println("pp1 == pp3:", pp1 == pp3) // true - одна и та же переменная
fmt.Println("*pp1 == *pp2:", *pp1 == *pp2) // true -  после разыменования сравниваются значения
```

- [Go Playground](https://goplay.tools/snippet/DMRAkVXJ-MY)

## Методы и интерфейсы

В JS для объединения связанных свойств и методов, описывающих некий объект из реального мира, мы используем классы. Классы в JS позволяют создавать объекты, но на самом деле они лишь упрощают работу с прототипным наследованием (prototype inheritance), скрывая его за более привычным синтаксисом (если интересно, можете почитать подробнее [в этой статье](https://prateeksurana.me/blog/how-javascript-classes-work-under-the-hood/)):

```javascript
class Rectangle {
  length: number;
  width: number;


  constructor(length: number, width: number) {
    this.length = length;
    this.width = width;
  }

  area() {
    return this.length * this.width;
  }
}

const r = new Rectangle(4, 5);
console.log(r.area()); // 20
```

- [TypeScript Playground](https://www.typescriptlang.org/play/?#code/MYGwhgzhAEBKCmwAuYB2BzE9oG8BQ00WGSAFgFzSoCuAtgEbwBOA3AdAO4CWAJmZTQbM27dsAD2qCEibVk4pgApi6flTqMmAGk681gzQEpc7QmS4QAdCrLQAvEXglSbQmdIXL3PqXu6frtAAvnjsYEzwYIrG+G7QEUjUTKjQ5lY2vgBUqR5W3mSBISF4ElJI8X6o8BxwiCgYWIoALDoArIZspRDiWNbi6IpMluGR0R3QAPQT0ABMAAxAA)

В Go нет классов, как во многих других языках программирования, но есть возможность определять методы прямо для типов. Методы — это особые функции, у которых есть специальный аргумент-приемник (receiver). Он указывается между ключевым словом `func` и названием метода. Например:

```go
type Rectangle struct {
  length float64
  width  float64
}

func (r Rectangle) Area() float64 {
  return r.length * r.width
}

func main() {
  r := Rectangle{
    length: 4,
    width:  5,
  }
  fmt.Println(r.Area()) // 20
}
```

- [Go Playground](https://goplay.tools/snippet/HWQk6JXotK8)

Поскольку методы в Go — это всего лишь функции с аргументом-приемником, приведенный пример можно переписать без каких-либо изменений в функциональности следующим образом:

```go
func Area(r Rectangle) float64 {
  return r.length * r.width
}
```

- [Go PLayground](https://goplay.tools/snippet/EzhF-H_375x)

Пример выше — это метод с приемником по значению (value receiver), то есть в переменную-приемник передается копия значения типа. Однако чаще всего методы объявляют с приемником-указателем (pointer receiver) — это позволяет изменять значение, на которое ссылается указатель:

```go
type Rectangle struct {
  length float64
  width  float64
}

func (r Rectangle) Area() float64 {
  return r.length * r.width
}

func (r *Rectangle) Double() {
  r.length = r.length * 2
  r.width = r.width * 2
}

func main() {
  r := Rectangle{
    length: 4,
    width:  5,
  }

  r.Double()
  fmt.Println(r.Area()) // 80
}
```

- [Go Playground](https://goplay.tools/snippet/hoakk7i4sGJ)

> Вызов `r.Double()` в Go автоматически преобразуется в `(&r).Double()`, так как метод `Double()` использует приемник-указатель.

Еще одно преимущество использования приемников-указателей — отсутствие необходимости копировать значение при каждом вызове метода, что существенно экономит ресурсы при работе с большими структурами.

### Интерфейсы

В TypeScript существуют `type` и `interface`, с помощью которых задается структура объекта. Как и в других языках, интерфейсы можно использовать с классами для определения сигнатур переменных и методов через ключевое слово `implements`:

```javascript
interface Shape {
  area(): number;
  perimeter(): number;
}

class Circle implements Shape {
   #radius: number

  constructor(radius: number) {
    this.#radius = radius
  }

  area(): number {
    return Math.PI * this.#radius * this.#radius;
  }

  perimeter(): number {
    return 2 * Math.PI * this.#radius;
  }
}

function printArea(s: Shape) {
    console.log(s.area())
}

let c = new Circle(3)

printArea(c)
```

- [TypeScript Playground](https://www.typescriptlang.org/play/?#code/JYOwLgpgTgZghgYwgAgMoAs4AcUG8BQyycUEcAFAJQBcyIArgLYBG0A3IcjlMIxJFCq0GLdvgC++fAgA2cAM7zkAYWBRZKXlhkQ+4JRmx5OyAMRQ4AE2D15wpqyhSiCAPYh5YKPQRhXgi2tbe1EoSmQCIiIwdGB5ADpzKxslAF5kQJTOSSJOEjIhOgdoCJMM-nooEGQAWTgY+IAFAElkACpkGLjEzNt2ztiEpKD5DiIc5E5uXn5oQpFHUqjysErqgCZ+uoaW-q6h3tHsiSkYehBfYHcuHnAAQVIKOzRMHHDIqLcPVx14mVcAObkBL5CiUSgnfA6MDIBDIdIgCAAdxUag05AAzBD8FhbmAHgUEJQgA)

Интерфейсы в Go выполняют схожую функцию: интерфейс в Go определяется как набор сигнатур методов и может содержать значение, реализующее эти методы. Например:

```go
package main

import (
  "fmt"
  "math"
)

type Shape interface {
  area() float64
  perimeter() float64
}

type Rectangle struct {
  length float64
  width  float64
}

func (r *Rectangle) area() float64 {
  return r.length * r.width
}

func (r *Rectangle) perimeter() float64 {
  return 2 * (r.length + r.width)
}

type Circle struct {
  radius float64
}

func (c *Circle) area() float64 {
  return math.Pi * c.radius * c.radius
}

func (c *Circle) perimeter() float64 {
  return 2 * math.Pi * c.radius
}

func printArea(s Shape) {
  fmt.Println(s.area())
}

func main() {
  r := &Rectangle{
    length: 4,
    width:  5,
  }

  c := &Circle{
    radius: 3,
  }

  fmt.Println("Rectangle area:")
  printArea(r)

  fmt.Println("Circle area:")
  printArea(c)
}
```

- [Go Playground](https://goplay.tools/snippet/EjS07cGLbxs)

Обратите внимание, что в приведенном примере нет ключевого слова `implements` для типа `Rectangle`, но при этом мы можем передать его в функцию, которая требует тип `Shape`. В Go тип реализует интерфейс просто путем реализации его методов.

Сначала это может показаться странным, но на самом деле это очень мощная особенность дизайна Go. Она позволяет отделить определение интерфейса от его реализации, что дает возможность создавать интерфейсы для уже существующих типов.

Под капотом интерфейсы в Go можно представить как кортеж, содержащий значение и конкретный тип. Для примера выше это будет выглядеть так:

```go
var r Shape

r = &Rectangle{
    length: 4,
    width:  5,
}

fmt.Printf("%v, %T", r, r) // &{4 5}, *main.Rectangle
```

- [Go Playground](https://goplay.tools/snippet/CKfcPbcQiZX)

Подобным образом нулевой интерфейс не содержит ни значения, ни конкретного типа, и попытка обратиться к свойству такого интерфейса вызовет ошибку обращения к нулевому указателю:

```go
var r Shape

fmt.Printf("(%v, %T)\n", r, r) // <nil>, <nil>

r.Area() // RRuntime error: nil pointer exception
```

- [Go Playground](https://goplay.tools/snippet/3qH1bG6wchL)

Переменная типа пустого интерфейса может хранить любое значение — это эквивалент типа `any` в TypeScript:

```go
var r interface{}

r = 42

r = "Bruce Banner"
```

- [Go Playground](https://goplay.tools/snippet/y9eGnKoRluB)

> В Go 1.18 добавлен тип `any`, который является просто синонимом пустого интерфейса, поэтому запись `var r any` тоже будет работать в приведенном примере.

И напоследок, в Go есть механизм утверждения типа (type assertion), который позволяет получить фактическое значение, лежащее в основе интерфейса. Например:

```go
var s Shape

s = &Circle{
  radius: 3,
}

c, ok := s.(*Circle) // c будет иметь тип *Circle
fmt.Println(c, ok) // &{3} true

r, ok := s.(*Rectangle) // r будет иметь тип *Rectangle
fmt.Println(r, ok) // <nil> false
```

- [Go Playground](https://goplay.tools/snippet/awYt73mK5iZ)

И это касается не только структур — утверждения типа также работают с примитивными типами:

```go
var i interface{} = "hello"

s, ok := i.(string)
fmt.Println(s, ok) // hello true

f, ok := i.(float64)
fmt.Println(f, ok) // 0 false
```

- [Go Playground](https://goplay.tools/snippet/JysEU1GCbiS)

## Обработка ошибок

Обработка ошибок в Go — одна из моих любимых фишек, которую JS определенно стоит перенять. В Go ошибки обрабатываются очень явно, а специальные линтеры подскажут, если мы забыли это сделать.

В JS одним из самых распространенных способов обработки ошибок является конструкция `try…catch`. Вот типичный пример функции, которая читает JSON-файлы, обрабатывает их и возвращает результат:

```javascript
async function processFiles(filePaths) {
  try {
    const fileContents = await Promise.all(
      filePaths.map(path => fs.promises.readFile(path, 'utf-8'))
    );

    const results = fileContents.map(content => JSON.parse(content));
    return results;
  } catch (error) {
    // Какая операция провалилась? Чтение файла или разбор JSON?
    // Какой файл вызвал ошибку?
    console.error("Something went wrong:", error);
    return null;
  }
}
```

Несмотря на то, что мы обрабатываем исключения, в приведенном примере невозможно точно понять, на каком этапе произошла ошибка. Чтобы это выяснить, придется оборачивать каждую операцию — например, чтение файла и парсинг JSON — в отдельный блок `try/catch`.

В Go же применяется другой подход к обработке ошибок. Функции могут возвращать несколько значений, и обычно последнее возвращаемое значение является ошибкой. Поэтому аналогичный пример в Go будет выглядеть примерно так:

```go
func processFiles(filePaths []string) ([]map[string]string, error) {
    var results []map[string]string

    for _, path := range filePaths {
        // Обработка каждой ошибки непосредственно в месте ее возникновения
        data, err := os.ReadFile(path)
        if err != nil {
            return nil, fmt.Errorf("failed to read file %s: %w", path, err)
        }

        var result map[string]string
        err = json.Unmarshal(data, &result)

        if err != nil {
            return nil, fmt.Errorf("failed to parse JSON from file %s: %w", path, err)
        }

        results = append(results, result)
    }

    return results, nil
}
```

В приведенном выше фрагменте на Go ошибки обрабатываются явно на каждом этапе, что позволяет точно понять, где и почему произошел сбой. Значение ошибки проверяется сразу после каждой потенциально ошибочной операции. Если ошибка возникает, выполнение функции немедленно прерывается, и возвращается понятное сообщение об ошибке.

Такой подход заставляет разработчиков осознанно обрабатывать все возможные ошибки, а не надеяться, что исключения будут перехвачены где-то выше по стеку вызовов.

_Прим. пер.:_ приведенные фрагменты кода на JS и Go не совсем эквивалентны. Код на JS вполне можно переписать так, чтобы получить почти такой же результат, что и в Go.

Кроме того, в Go есть специальный механизм `defer`, который позволяет отложить выполнение инструкции до момента выхода из функции. Например:

```go
func main() {
  defer fmt.Println("World")
  defer fmt.Println("Go")
  fmt.Println("Hello")
}

// Вывод:
// Hello
// Go
// World
```

- [Go Playground](https://goplay.tools/snippet/6aLLD8qxgZo)

Функции `defer` выполняются в порядке LIFO (последним вошел — первым вышел), поэтому `World` выводится в самом конце.

Функции `defer` хорошо дополняют обработку ошибок в Go: они дают возможность писать код очистки рядом с кодом выделения ресурсов, при этом выполняться он будет только после выхода из функции. Например:

```go
package main

import (
  "database/sql"
  "fmt"

  _ "github.com/lib/pq" // Драйвер PostgreSQL
)

func getUsername(userID int) (string, error) {
    // Открываем соединение с базой данных
    db, err := sql.Open("postgres", "postgresql://username:password@localhost/mydb?sslmode=disable")
    if err != nil {
        return "", fmt.Errorf("failed to connect to database: %w", err)
    }
    defer db.Close() // Это гарантирует, что соединение с базой данных будет закрыто при выходе из функции

    // Выполняем запрос
    var username string
    err = db.QueryRow("SELECT username FROM users WHERE id = $1", userID).Scan(&username)
    if err != nil {
        return "", fmt.Errorf("failed to get username: %w", err)
    }

    return username, nil
}
```

В этом примере оператор `defer`, который закрывает соединение с базой данных, стоит сразу после его открытия. Это гарантирует, что соединение будет закрыто в любом случае — при условии, что оно было успешно открыто, независимо от того, как завершится выполнение функции. Такой подход позволяет разместить код очистки рядом с кодом получения ресурса, что делает функцию более понятной.

В JS для аналогичной задачи обычно используют блок `finally`. Вот как выглядел бы приведенный пример на JS:

```javascript
const { Client } = require('pg');

async function getUsername(userId) {
    const client = new Client({
        connectionString: "postgresql://username:password@localhost/mydb"
    });

    try {
        await client.connect();

        // Выполняем запрос напрямую
        const result = await client.query("SELECT username FROM users WHERE id = $1", [userId]);

        if (result.rows.length === 0) {
            throw new Error("User not found");
        }

        return result.rows[0].username;
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    } finally {
        await client.end(); // Это эквивалентно оператору defer в Go для очистки ресурсов
    }
}
```

В Go функции `defer` можно также использовать для восстановления после паники (panic). Паника в Go — это аналог ошибки выполнения или исключения в JS. В обоих языках при возникновении такой ошибки выполнение текущей функции прекращается, начинается разматывание (unwinding) стека вызовов, и, если ошибка не была перехвачена, программа завершает работу. При этом в Go все отложенные (defer) функции продолжают выполняться по пути вверх по стеку.

В JS для обработки подобных ситуаций обычно используют `try/catch`, чтобы аккуратно перехватить ошибку во время выполнения. В Go для этого предусмотрена специальная функция `recover`, которую вызывают внутри `defer`. Например:

```go
package main

import (
  "fmt"
)

func riskyOperation() {
    defer func() {
        if r := recover(); r != nil {
            fmt.Println("Recovered from panic:", r)
        }
    }()

    // Это вызовет панику
    var arr []int
    fmt.Println(arr[1]) // Обращение за пределы массива
}

func main() {
    riskyOperation()
    fmt.Println("Program continues after recovery")
}
```

- [Go Playground](https://goplay.tools/snippet/NfqH0R3d0rA)

В приведенном примере при возникновении паники сначала выполняется отложенная функция, в которой вызывается `recover()`. Это позволяет перехватить панику и предотвратить аварийное завершение программы. Таким образом, можно [аккуратно обработать ошибку и продолжить выполнение программы](https://go.dev/blog/defer-panic-and-recover).

## Конкурентность/параллелизм

Наиболее заметное различие между Go и JavaScript — это то, как они обрабатывают конкурентность.

JS по своей сути — однопоточный язык. Однако благодаря событийно-ориентированной архитектуре он позволяет выполнять неблокирующие операции ввода-вывода с помощью колбэков (callbacks), промисов (promises) и т.д. Все это происходит в рамках основного потока. Такая модель позволяет JS достигать конкурентности без использования многопоточности.

Go, напротив, поддерживает настоящую конкурентность с помощью горутин (goroutines) — сверхлегких потоков (всего ~2 КБ каждый), которыми управляет среда выполнения Go. В отличие от однопоточной модели событий в JS, Go способен выполнять код параллельно на нескольких потоках ОС. Несмотря на то, что код Go пишется как синхронный, горутины позволяют задействовать несколько ядер процессора для выполнения задач одновременно.

Пример создания горутины:

```go
package main

import (
  "fmt"
  "time"
)

func say(s string) {
  fmt.Println(s)
}

func main() {
  go say("world")
  say("hello")

  // Мы добавили задержку, чтобы программа не завершилась
  // до того, как выполнится горутина. Существуют более
  // надежные способы управления этим — каналы и группы ожидания
  time.Sleep(100 * time.Millisecond)
}
```

- [Go Playground](https://goplay.tools/snippet/4JccVK4Q0gz)

Ключевое слово `go` в приведенном примере запускает функцию в новой горутине, которая выполняется параллельно с текущей.

Чтобы понять, как горутины соотносятся с циклом событий в JS, рассмотрим пример, в котором мы выполняем несколько API-запросов параллельно и ждем их завершения с помощью `Promise.all()`:

```javascript
const fetchData = async () => {
  try {
    // Запускаем оба запроса "параллельно"
    const postPromise = fetch('https://jsonplaceholder.typicode.com/posts/1')
      .then(response => response.json());

    const commentsPromise = fetch('https://jsonplaceholder.typicode.com/posts/1/comments')
      .then(response => response.json());

    // Ждем, пока оба промиса завершатся
    const [post, comments] = await Promise.all([postPromise, commentsPromise]);

    console.log('Post:', post);
    console.log('Comments:', comments);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

fetchData();
```

- [TypeScript Playground](https://www.typescriptlang.org/play/?#code/MYewdgzgLgBAZgUysAFgEQIZQzAvDDCATzGBgAoBKPAPhgG8AoGGKAJyIeZZgHpeYAZWxtYAIxBQUMNggCOAVwTQIMAEQBLMDAAOGNhgA2hhIbXcWoSLB0hoABTYgAthogI88JKnIByFFBQOhAAXPwAVhDgOoYYwAgoIIYAJghsAHRQRDoaoKnpoM68tiq8AIy+lBY8mSgIYOSyELaQHrh0TS3u6ZHgVJQA3NXVVtAwhc71UBCOLm5tXsgofgFBoRFRYDFxCUmpGVk5eQgFLsV20+W8E1MQldUstfWNyl1tHa-g3b0NlIPDPD4AgA6hgNLA4CA2DAJFJdE5XO5VFAQDJlEkAG4IEZfWAAbRKUAANOMXJMwNMALqeDAAdzBsFmiJORkM5AJFyZ8xJNwpMwR80p-0BOMgSROhhAAHM-PYLiFfCTCcKeKNxelJTLfABhMm3BU8vV8lUAX3GWFQFDSTjY1CYgLVJnS1qhfgAomwbYtUFopTBklgMAaYC7bUMWCbGCahoxEEtMNgqAMgA)

А вот как можно реализовать нечто подобное в Go с помощью горутин:

```go
package main

import (
  "fmt"
  "io/ioutil"
  "net/http"
  "sync"
)

func main() {
  var wg sync.WaitGroup
  var postJSON, commentsJSON string
  var postErr, commentsErr error

  // Добавляем два элемента в список ожидания
  wg.Add(2)

  // Получаем пост в отдельной горутине
  go func() {
    defer wg.Done()
    resp, err := http.Get("https://jsonplaceholder.typicode.com/posts/1")
    if err != nil {
      postErr = err
      return
    }
    defer resp.Body.Close()

    body, err := ioutil.ReadAll(resp.Body)
    if err != nil {
      postErr = err
      return
    }

    postJSON = string(body)
  }()

  // Получаем комментарии в отдельной горутине
  go func() {
    defer wg.Done()
    resp, err := http.Get("https://jsonplaceholder.typicode.com/posts/1/comments")
    if err != nil {
      commentsErr = err
      return
    }
    defer resp.Body.Close()

    body, err := ioutil.ReadAll(resp.Body)
    if err != nil {
      commentsErr = err
      return
    }

    commentsJSON = string(body)
  }()

  // Ожидаем завершения обеих горутин
  wg.Wait()

  // Обрабатываем возможные ошибки
  if postErr != nil {
    fmt.Println("Error fetching post:", postErr)
    return
  }
  if commentsErr != nil {
    fmt.Println("Error fetching comments:", commentsErr)
    return
  }

  // Выводим результаты
  fmt.Println("Post JSON:", postJSON)
  fmt.Println("Comments JSON:", commentsJSON)
}
```

- [Go PLayground](https://goplay.tools/snippet/a36f7R8WqtT)

> В приведенном примере используется `WaitGroup` из пакета `sync` — он предоставляет базовые [примитивы синхронизации](https://pkg.go.dev/sync) для Go.

> [Каналы (channels)](https://gobyexample.com/channels) — еще одна мощная возможность Go, которая позволяет горутинам обмениваться данными и синхронизировать выполнение. Мы не рассматриваем их в этом руководстве, так как они заслуживают отдельной подробной статьи, но их определенно стоит изучить, если есть желание глубже понять модель конкурентности в Go.

Ключевое отличие в приведенных примерах состоит в том, что JS достигает конкурентности за счет асинхронного ввода-вывода и цикла событий — операции ввода-вывода делегируются браузеру или Node.js, которые выполняют их вне основного потока. Однако для задач, требующих интенсивных вычислений на процессоре, JS все равно выполняется в одном основном потоке, блокируя остальное.

Go же, наоборот, поддерживает настоящий параллелизм с помощью горутин, которые могут одновременно выполняться на нескольких ядрах процессора. Вот пример того, как можно запускать ресурсоемкие вычислительные задачи параллельно с помощью горутин:

```go
package main

import (
  "fmt"
  "sync"
)

func sum(s []int, result *int, wg *sync.WaitGroup) {
  defer wg.Done() // Сообщаем, что выполнение этой горутины завершено

  sum := 0
  for _, v := range s {
    sum += v
  }
  *result = sum
}

func main() {
  s := []int{7, 2, 8, -9, 4, 0}

  var wg sync.WaitGroup
  var x, y int

  // Добавляем две горутины в группу ожидания
  wg.Add(2)

  // Запускаем горутины
  go sum(s[:len(s)/2], &x, &wg)
  go sum(s[len(s)/2:], &y, &wg)

  // Ожидаем завершения обеих горутин
  wg.Wait()

  fmt.Println(x, y, x+y)
}
```

- [Go Playground](https://goplay.tools/snippet/SUPwpsSM17e)

В приведенном примере мы выполняем "ресурсоемкую" задачу — параллельное суммирование двух половин среза с помощью горутин. В JS невозможно реализовать такую параллельность без использования [Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers) или [worker threads (в случае Node.js)](https://nodejs.org/api/worker_threads.html).

## Форматирование и линтинг

В Go есть официальный инструмент форматирования кода из стандартной библиотеки — пакет [Gofmt](https://pkg.go.dev/cmd/gofmt). В отличие от экосистемы JS, где в проектах часто используются настраиваемые инструменты вроде Prettier, Gofmt почти не поддерживает конфигурацию, но при этом является общепринятым стандартом форматирования кода [в Go](https://go.dev/blog/gofmt#format-your-code). Большинство редакторов имеют встроенные расширения, позволяющие автоматически форматировать код с его помощью.

Что касается линтинга, то в Go, как и в JS, существует множество правил и инструментов, разработанных сообществом, которые помогают находить и устранять проблемы с качеством кода. Одним из самых популярных инструментов является [`golangci-lint`](https://golangci-lint.run/welcome/install/) — раннер, который параллельно запускает десятки линтеров и поддерживает более сотни настраиваемых проверок.

## Заключение

Надеюсь, это руководство помогло вам заложить прочную основу в Go и лучше понять, чем он отличается от JavaScript — как с точки зрения самого языка, так и с точки зрения принципов его работы.

Мы рассмотрели основные концепции, но это лишь небольшая часть того, что предлагает мощная стандартная библиотека и экосистема Go. Чтобы продвинуться дальше, лучший способ — начать создавать собственные проекты. Go отлично подходит для разработки CLI-инструментов, веб-серверов, микросервисов, системных утилит и даже компиляторов.

Материалы для изучение Go:

- [Tutorial: Get started with Go](https://go.dev/doc/tutorial/getting-started)
- [Go by Example](https://gobyexample.com/)
- [Николай Тузов — Golang](https://www.youtube.com/@nikolay_tuzov)
