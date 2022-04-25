---
slug: js-compiler
title: Компилятор кода на JavaScript
description: Туториал по разработке простого компилятора кода на JavaScript
authors: harryheman
tags: [javascript, js, compiler, tutorial, компилятор, туториал]
image: https://habrastorage.org/webt/gp/rx/uj/gprxuj2skxbmhitwrnlg1ibcalm.jpeg
---

<img src="https://habrastorage.org/webt/gp/rx/uj/gprxuj2skxbmhitwrnlg1ibcalm.jpeg" alt="" />

Привет, друзья!

Представляю вашему вниманию перевод [этой замечательной статьи](https://github.com/jamiebuilds/the-super-tiny-compiler).

Сегодня мы разработаем простейший компилятор кода на `JavaScript`. Без учета комментариев наша программа будет состоять примерно из 250 строк кода.

Мы будем компилировать lisp-подобные вызовы функций в C-подобные. Например, если у нас имеется 2 функции, `add` и `subtract`, то выглядеть они будут так:

| | LISP | C |
--- | --- | ---
2 + 2 | (add 2 2) | add(2, 2)
4 - 2 | (subtract 4 2) | subtract(4, 2)
2 + (4 - 2) | (add 2 (subtract 4 2)) | add(2, subtract(4, 2))

Разумеется, это далеко не полный синтаксис LIST или C, но нам вполне этого хватит для демонстрации многих основных частей современного компилятора.

<!--truncate-->

## Введение

Процесс компиляции кода условно можно разделить на 3 стадии:

1. _Разбор или парсинг (parsing)_ - сырой или необработанный (raw) код преобразуется в абстрактное представление (abstract representation).
2. _Преобразование или трансформация (transformation)_ - всевозможные операции (манипуляции) с абстрактным представлением кода, которые зависят от задач, решаемых компилятором.
3. _Генерация кода (code generation)_ - преобразование ранее трансформированного представления в новый код.

__Парсинг__

Парсинг, как правило, состоит из 2 этапов: лексического анализа (lexical analysis) и синтаксического анализа (syntactic analysis).

1. _Лексический анализ_ заключается в разделении необработанного кода на части, которые называются токенами (tokens). Эта задача выполняется так называемым токенизатором (tokenizer) или лексером (lexer). Токены - это массив небольших объектов, описывающих изолированные (относительно автономные) части синтаксиса. Токены могут быть числами, подписями (labels) (дополнительной, служебной информацией), пунктуацией, операторами, чем угодно.
2. _Синтаксический анализ_ заключается в преобразовании токенов в представление, описывающее каждую часть синтаксиса и ее отношения с другими частями (следующей, предыдущей, обоими и т.д.). Такое представление известно под названием промежуточного (intermediate) представления кода или абстрактного синтаксического дерева (abstract syntax tree, AST). AST - это объект с несколькими уровнями вложенности, содержащий представление кода, с которым, с одной стороны, удобно работать, с другой стороны, он содержит большое количество необходимой служебной информации.

Для такого синтаксиса:

```
(add 2 (subtract 4 2))
```

Токены могут выглядеть так:

```javascript
// paren - это parenthesis - скобка
[
  { type: 'paren',  value: '(' },
  { type: 'name',   value: 'add' },
  { type: 'number', value: '2' },
  { type: 'paren',  value: '(' },
  { type: 'name',   value: 'subtract' },
  { type: 'number', value: '4' },
  { type: 'number', value: '2' },
  { type: 'paren',  value: ')' },
  { type: 'paren',  value: ')' },
]
```

А AST так:

```javascript
{
  type: 'Program',
  body: [
    {
      type: 'CallExpression',
      name: 'add',
      params: [
        {
          type: 'NumberLiteral',
          value: '2',
        },
        {
          type: 'CallExpression',
          name: 'subtract',
          params: [
            {
              type: 'NumberLiteral',
              value: '4',
            },
            {
              type: 'NumberLiteral',
              value: '2',
            }
          ]
        }
      ]
    }
  ]
}
```

__Трансформация__

Следующий тип или стадия компиляции - это трансформация кода. На этой стадии мы берем AST из последнего шага и модифицируем его. Мы можем манипулировать AST на том же языке (программирования) или перевести его на другой язык.

Посмотрим, как мы можем трансформировать наше AST.

Вы могли заметить, что в нашем AST есть элементы, которые выглядят очень похоже. Речь идет об объектах со свойством `type`. Такие объекты называются узлами (nodes) AST. Эти узлы содержат определенные свойства, описывающие одну изолированную часть дерева.

У нас может быть узел `NumberLiteral`:

```javascript
{
  type: 'NumberLiteral',
  value: '2',
}
```

Или узел `CallExpression`:

```javascript
{
  type: 'CallExpression',
  name: 'add',
  params: [/* вложенные узлы */]
}
```

В процессе трансформации AST мы можем манипулировать узлами, добавляя/удаляя/заменяя свойства, добавляя новые узлы, удаляя существующие узлы либо создавая новые сущности на его основе.

Поскольку наша цель - перевод функции на другой язык, мы сосредоточимся на создании нового AST, предназначенного для целевого (target) языка.

__Обход__

Для переноса каждого узла в новое AST, нам необходим какой-то способ для обхода (traverse) старого AST. Процесс обхода заключается в "посещении" каждого узла при движении в глубину (depth-first) (см. [поиск в глубину](https://ru.wikipedia.org/wiki/%D0%9F%D0%BE%D0%B8%D1%81%D0%BA_%D0%B2_%D0%B3%D0%BB%D1%83%D0%B1%D0%B8%D0%BD%D1%83), [поиск в ширину](https://ru.wikipedia.org/wiki/%D0%9F%D0%BE%D0%B8%D1%81%D0%BA_%D0%B2_%D1%88%D0%B8%D1%80%D0%B8%D0%BD%D1%83)).

Для приведенного выше AST порядок будет следующим:

1. `Program` - начинаем с верхнего уровня AST.
2. `CallExpression (add)` - перемещаемся к первому элементу тела (body) `Program`.
3. `NumberLiteral (2)` - перемещаемся к первому элементу параметров (`params`) `CallExpression`.
4. `CallExpression (subtract)` - перемещаемся ко второму элементу параметров `CallExpression`.
5. `NumberLiteral (4)` - перемещаемся к первому элементу параметров второго `CallExpression`.
6. `NumberLiteral (2)` - перемещаемся ко второму элементу параметров второго `CallExpression`.

Если мы будем манипулировать этим AST напрямую вместо создания отдельного AST, нам придется прибегать к помощи всевозможных абстракций. Однако в данном случае нам достаточно посетить каждый узел.

__Посетитель__

Основная идея состоит в том, что мы создаем объект "посетителя" (visitor), который содержит методы, названия которых совпадают с разными типами узлов:

```javascript
const visitor = {
  NumberLiteral() {},
  CallExpression() {}
}
```

При обходе AST мы вызываем эти методы на посетителе при "входе" (enter) в узел совпадающего типа.

Кроме самого узла имеет смысл передавать посетителю ссылку на предка этого узла:

```javascript
const visitor = {
  NumberLiteral(node, parent) {},
  CallExpression(node, parent) {}
}
```

Также существует возможность вызывать вещи на "выходе" (exit) из узла. Представим приведенное выше дерево в виде списка:

```
- Program
  - CallExpression
    - NumberLiteral
    - CallExpression
      - NumberLiteral
      - NumberLiteral
```

Спускаясь вниз по дереву, рано или поздно мы упираемся в тупик (branch with dead end - ветку с мертвым концом). После этого мы "выходим" из этой ветки. Таким образом, спускаясь вниз, мы "входим" в каждый узел, а поднимаясь, "выходим" из него.

```
-> Program (вход)
  -> CallExpression (вход)
    -> Number Literal (вход)
    <- Number Literal (выход)
    -> Call Expression (вход)
       -> Number Literal (вход)
       <- Number Literal (выход)
       -> Number Literal (вход)
       <- Number Literal (выход)
    <- CallExpression (выход)
  <- CallExpression (выход)
<- Program (выход)
```

Финальный посетитель может выглядеть так:

```javascript
const visitor = {
  NumberLiteral: {
    enter(node, parent) {},
    exit(node, parent) {}
  },
  CallExpression: {
    enter(node, parent) {},
    exit(node, parent) {}
  }
}
```

__Генерация кода__

Завершающей стадией компиляции является генерация кода. Иногда компиляторы делают вещи, пересекающиеся с трансформацией (совершают дополнительные операции), но по большей части генерация кода означает преобразование AST обратно в код.

Генераторы кода работают по-разному, некоторые используют существующие токены, другие создают отдельное представление кода, чтобы иметь возможность "печатать" (print) узлы линейно. Большинство генераторов применяет первый подход.

Наш генератор кода будет заранее знать, как "печатать" все типы узлов AST. Он будет [рекурсивно](https://ru.wikipedia.org/wiki/%D0%A0%D0%B5%D0%BA%D1%83%D1%80%D1%81%D0%B8%D1%8F) вызывать себя для печати вложенных узлов до тех пор, пока все узлы не превратятся в одну длинную строку кода.

Вот и все! Мы на самом высоком уровне рассмотрели все основные части, из которых состоит компилятор.

Приступаем к его реализации.

## Токенизатор

Начнем с первого этапа - парсинга: лексического анализа, выполняемого с помощью токенизатора.

На данном этапе мы берем строку кода и преобразуем ее в массив токенов:

```
(add 2 (subtract 4 2))   =>   [{ type: 'paren', value: '(' }, ...]
```

Определим несколько вспомогательных регулярных выражений:

```javascript
const WHITESPACE = /\s/
const NUMBERS = /[0-9]/
const LETTERS = /[a-z]/i
```

```javascript
function tokenize(input) {
  // своего рода курсор (cursor) для отслеживания нашей позиции в коде
  let current = 0

  // массив токенов
  const tokens = []

  while (current < input.length) {
    // текущий символ
    let char = input[current]

    // если текущим символом является открывающая или закрывающая скобка
    if (char === '(' || char === ')') {

      // формируем токен и помещаем его в массив
      tokens.push({
        type: 'paren',
        value: char
      })

      // инкрементируем курсор (увеличиваем его значение на 1)
      current++

      // и переходим на следующий цикл итерации
      continue
    }

    // если текущим символом является пробел,
    // просто инкрементируем курсор и
    // переходим на следующий цикл
    if (WHITESPACE.test(char)) {
      current++
      continue
    }

    // следующим типом токена является число,
    // которое может состоять из любого количества символов
    // (add 123 456)
    //      ^^^ ^^^ числовые токены
    // мы хотим "захватывать" (capture) всю последовательность символов в качестве одного токена
    if (NUMBERS.test(char)) {

      // переменная для последовательности символов, из которых состоит число
      let value = ''

      // двигаемся по последовательности до достижения символа, который не является числом
      // помещаем каждое число в последовательность и увеличиваем значение курсора
      while (NUMBERS.test(char)) {
        value += char
        char = input[++current]
      }

      // формируем токен и добавляем его в массив
      tokens.push({
        type: 'number',
        value
      })

      // переходим на следующий цикл
      continue
    }

    // добавляем поддержку для строк, окруженных двойными кавычками (")
    // (concat "foo" "bar")
    //          ^^^   ^^^ строковые токены
    if (char === '"') {
      let value = ''

      // пропускаем открывающую двойную кавычку
      char = input[++current]

      // двигаемся по последовательности до достижения закрывающей двойной кавычки
      while (char !== '"') {
        value += char
        char = input[++current]
      }

      // пропускаем закрывающую двойную кавычку
      char = input[++current]

      tokens.push({
        type: 'string',
        value
      })

      continue
    }

    // последним типом является именованный токен (токен с типом `name`)
    // данный тип представляет токен, состоящий из последовательности символов,
    // которые не являются числом
    // в нашем случае речь идет о названиях функций
    // (add 2 4)
    //  ^^^ именованный токен
    if (LETTERS.test(char)) {
      let value = ''

      while (LETTERS.test(char)) {
        value += char
        char = input[++current]
      }

      tokens.push({
        type: 'name',
        value
      })

      continue
    }

    // выбрасываем исключение при наличии в строке кода символа неизвестного типа
    throw new TypeError(`Неизвестный символ: ${char}`)
  }

  // возвращаем массив токенов
  return tokens
}
```

## Парсер

Парсер берет массив токенов и преобразует его в AST:

```
[{ type: 'paren', value: '(' }, ...]   =>   { type: 'Program', body: [...] }
```

```javascript
function parse(tokens) {
  // курсор
  let current = 0

  // в данном случае вместо цикла (`while`) мы используем рекурсию
  function walk() {
    // извлекаем текущий токен
    let token = tokens[current]

    // если типом токена является число
    if (token.type === 'number') {
      // инкрементируем курсор
      current++

      // возвращаем узел AST типа `NumberLiteral` со значением токена
      return {
        type: 'NumberLiteral',
        value: token.value
      }
    }

    // делаем тоже самое для строки
    if (token.type === 'string') {
      current++

      return {
        type: 'StringLiteral',
        value: token.value
      }
    }

    // если текущим токеном является открывающая скобка,
    // значит, далее будет название (вызов) функции
    if (token.type === 'paren' && token.value === '(') {
      // пропускаем открывающую скобку
      token = tokens[++current]

      // создаем базовый узел типа `CallExpression`
      // со значением текущего токена в качестве названия,
      // поскольку за открывающей скобкой следует именованный токен
      const node = {
        type: 'CallExpression',
        name: token.value,
        params: []
      }

      // пропускаем именованный токен
      token = tokens[++current]

      /*
       * перебираем токены, которые станут параметрами (`params`)
       * выражения вызова (`CallExpression`), до достижения закрывающей скобки
       *
       * здесь в игру вступает рекурсия. Вместо того, чтобы пытаться парсить потенциально бесконечный
       * вложенный набор узлов, мы используем рекурсию
       *
       * рассмотрим наш код на LIST. Мы видим, что
       * параметрами `add` является число и вложенное `CallExpression`,
       * которое также содержит числа
       *
       * (add 2 (subtract 4 2))
       *
       * вы также могли заметить, что в нашем массиве токенов имеется 2 закрывающие скобки
       * [
       *   { type: 'paren',  value: '(' },
       *   { type: 'name',   value: 'add' },
       *   { type: 'number', value: '2' },
       *   { type: 'paren',  value: '(' },
       *   { type: 'name',   value: 'subtract' },
       *   { type: 'number', value: '4' },
       *   { type: 'number', value: '2' },
       *   { type: 'paren',  value: ')' }, <<< закрывающая скобка
       *   { type: 'paren',  value: ')' }, <<< закрывающая скобка
       * ]
       *
       * мы используем функцию `walk` для увеличения значения курсора и
       * пропуска любых сложенных `CallExpression`
       *
       * перебираем токены до достижения токена с типом `paren` и значением закрывающей скобки
       */
      while (
        token.type !== 'paren' ||
        (token.type === 'paren' && token.value !== ')')
      ) {
        // вызываем функцию `walk`, которая возвращает узел
        // помещаем этот узел в `params`
        node.params.push(walk())
        token = tokens[current]
      }

      // пропускаем закрывающую скобку
      current++

      // и возвращаем узел
      return node
    }

    // если нам встретился токен с неизвестным типом
    throw new TypeError(`Неизвестный тип токена: ${type}`)
  }

  // создаем AST с корневым (root) узлом типа `Program`
  const ast = {
    type: 'Program',
    body: []
  }

  // вызываем `walk`, которая возвращает узлы AST
  // помещаем их в массив `ast.body`
  //
  // причина, по которой мы делаем это внутри цикла, состоит в том,
  // что в нашей программе `CallExpression` могут следовать одно за другим
  // вместо того, чтобы быть вложенными
  //
  // (add 2 2)
  // (subtract 4 2)
  //
  while (current < tokens.length) {
    ast.body.push(walk())
  }

  // возвращаем AST
  return ast
}
```

## Траверсер

Итак, у нас имеется AST, и мы хотим исследовать каждый узел с помощью посетителя. При посещении узла совпадающего типа должен вызываться соответствующий метод посетителя.

```javascript
traverse(ast, {
  Program: {
    enter(node, parent) {
      // ...
    },
    exit(node, parent) {
      // ...
    }
  },

  CallExpression: {
    enter(node, parent) {
      // ...
    },
    exit(node, parent) {
      // ...
    }
  },

  NumberLiteral: {
    enter(node, parent) {
      // ...
    },
    exit(node, parent) {
      // ...
    }
  }
})
```

```javascript
// функция принимает AST и посетителя
function traverse(ast, visitor) {

  // данная функция перебирает массив и
  // для каждого его элемента вызывает функцию `traverseNode`
  function traverseArray(array, parent) {
    array.forEach((child) => {
      traverseNode(child, parent)
    })
  }

  // данная функция принимает узел и его предка для их передачи методам посетителя
  function traverseNode(node, parent) {

    // извлекаем методы посетителя по типу узла
    const methods = visitor[node.type]

    // вызываем метод `enter` при его наличии
    if (methods && methods.enter) {
      methods.enter(node, parent)
    }

    // выполняем операцию на основе типа узла
    switch (node.type) {

      // на верхнем уровне у нас имеется узел типа `Program`
      // у этого узла имеется свойство `body` - массив узлов,
      // который мы передаем функции `traverseArray`
      //
      // поскольку `traverseArray`, в свою очередь, вызывает `traverseNode`,
      // мы выполняем рекурсивный обход дерева
      case 'Program':
        traverseArray(node.body, node)
        break

      // обходим параметры выражения вызова
      case 'CallExpression':
        traverseArray(node.params, node)
        break

      // в случае с числом и строкой узлы для посещения отсутствуют,
      // поэтому мы их пропускаем
      case 'NumberLiteral':
      case 'StringLiteral':
        break

      // если нам встретился узел с неизвестным типом
      default:
        throw new TypeError(`Неизвестный тип узла: ${node.type}`)
    }

    // вызываем метод `exit` при его наличии
    if (methods && methods.exit) {
      methods.exit(node, parent)
    }
  }

  // запускаем обход, вызывая `traverseNode` с AST, но без предка,
  // поскольку на верхнем уровне AST не имеет родительских узлов
  traverseNode(ast, null)
}
```

## Трансформер

Трансформер берет AST, передает его в функцию для обхода вместе с посетителем, что приводит к созданию нового AST.

```javascript
// оригинальное AST
const originalAst = {
  type: 'Program',
  body: [{
    type: 'CallExpression',
    name: 'add',
    params: [
      {
        type: 'NumberLiteral',
        value: '2'
      },
      {
        type: 'CallExpression',
        name: 'subtract',
        params: [
          {
            type: 'NumberLiteral',
            value: '4'
          },
          {
            type: 'NumberLiteral',
            value: '2'
          }
        ]
      }
    ]
  }]
}

// преобразованное AST
const transformedAst = {
  type: 'Program',
  body: [{
    type: 'ExpressionStatement',
    expression: {
      type: 'CallExpression',
      callee: {
        type: 'Identifier',
        name: 'add'
      },
      arguments: [
        {
          type: 'NumberLiteral',
          value: '2'
        },
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: 'subtract'
        },
        arguments: [
          {
            type: 'NumberLiteral',
            value: '4'
          },
          {
            type: 'NumberLiteral',
            value: '2'
          }
        ]
      ]
    }
  }]
}
```

```javascript
function transform(ast) {

  // новое AST
  const newAst = {
    type: 'Program',
    body: []
  }

  // я собираюсь немного схитрить. Мы будем использовать
  // свойство `context` родительского узла - узлы будут помещаться в их родительский контекст
  //
  // контекст - это ссылка *из* старого AST *на* новый
  ast._context = newAst.body

  // выполняем обход с AST и посетителем
  traverse(ast, {

    // первый метод принимает `NumberLiteral`
    NumberLiteral: {

      // мы посещаем его на входе
      enter(node, parent) {

        // создаем новый одноименный узел
        // и помещаем его в родительский контекст
        parent._context.push({
          type: 'NumberLiteral',
          value: node.value
        })
      }
    },

    // делаем тоже самое для `StringLiteral`
    StringLiteral: {
      enter(node, parent) {
        parent._context.push({
          type: 'StringLiteral',
          value: node.value
        })
      }
    },

    // далее следует `CallExpression`
    CallExpression: {
      enter(node, parent) {

        // начинаем с создания нового узла `CallExpression`
        // с вложенным `Identifier`
        let expression = {
          type: 'CallExpression',
          callee: {
            type: 'Identifier',
            name: node.name
          },
          arguments: []
        }

        // определяем новый контекст в оригинальном `CallExpression`,
        // который содержит ссылку на аргументы `expression`
        node._context = expression.arguments

        // проверяем, является ли родительский узел `CallExpression`
        // если не является
        if (parent.type !== 'CallExpression') {

          // оборачиваем `CallExpression` в `ExpressionStatement`
          // `CallExpression` верхнего уровня в `JS` являются инструкциями
          expression = {
            type: 'ExpressionStatement',
            expression
          }
        }

        // наконец, мы помещаем наше (возможно, обернутое в `ExpressionStatement`) `CallExpression` в родительский контекст
        parent._context.push(expression)
      }
    }
  })

  // и возвращаем новое AST
  return newAst
}
```

## Генерация кода

Генератор кода рекурсивно вызывает себя для преобразования каждого узла дерева в одну гигантскую строку кода.

```javascript
function generateCode(node) {

  // выполняем операцию на основе типа узла
  switch (node.type) {

    // если типом узла является `Program`, мы перебираем узлы в `body`
    // и прогоняем их через генератор кода,
    // объединяя с помощью символа перевода на новую строку
    case 'Program':
      return node.body.map(generateCode).join('\n')

    // для `ExpressionStatement` мы вызываем генератор кода для вложенного `expression`
    // и добавляем точку с запятой
    case 'ExpressionStatement':
      return `${ generateCode(node.expression) };`

    // для `CallExpression` мы формируем `callee` (вызываемого)
    // добавляем открывающую скобку,
    // перебираем узлы из массива `arguments`,
    // пропускаем их через генератор, разделяем их запятыми
    // и добавляем закрывающую скобку
    case 'CallExpression':
      return `${ generateCode(node.callee) }(${ node.arguments.map(generateCode).join(', ') })`

    // для `Identifier` мы просто возвращаем название узла
    case 'Identifier':
      return node.name

    // возвращаем значение узла
    case 'NumberLiteral':
      return node.value

    // возвращаем значение узла, обернутое в двойные кавычки
    case 'StringLiteral':
      return `"${ node.value }"`

    default:
      throw new TypeError(`Неизвестный тип узла: ${node.type}`)
  }
}
```

## Компилятор

Объединяем все части конвейера (pipeline) для создания нашего компилятора.

```
1) input  => tokenize     => tokens
2) tokens => parse        => ast
3) ast    => transform    => newAst
4) newAst => generateCode => output
```

```javascript
function compile(input) {
  const tokens = tokenize(input)
  const ast = parse(tokens)
  const newAst = transform(ast)
  const output = generateCode(newAst)

  return output
}
```

<spoiler title="Полный код компилятора без комментариев:">

```javascript
const WHITESPACE = /\s/
const NUMBERS = /[0-9]/
const LETTERS = /[a-z]/i

function tokenize(input) {
  let current = 0

  const tokens = []

  while (current < input.length) {
    let char = input[current]

    if (char === '(' || char === ')') {
      tokens.push({
        type: 'paren',
        value: char
      })

      current++

      continue
    }

    if (WHITESPACE.test(char)) {
      current++
      continue
    }

    if (NUMBERS.test(char)) {
      let value = ''

      while (NUMBERS.test(char)) {
        value += char
        char = input[++current]
      }

      tokens.push({
        type: 'number',
        value
      })

      continue
    }

    if (char === '"') {
      let value = ''

      char = input[++current]

      while (char !== '"') {
        value += char
        char = input[++current]
      }

      char = input[++current]

      tokens.push({
        type: 'string',
        value
      })

      continue
    }

    if (LETTERS.test(char)) {
      let value = ''

      while (LETTERS.test(char)) {
        value += char
        char = input[++current]
      }

      tokens.push({
        type: 'name',
        value
      })

      continue
    }

    throw new TypeError(`Неизвестный символ: ${char}`)
  }

  return tokens
}

function parse(tokens) {
  let current = 0

  function walk() {
    let token = tokens[current]

    if (token.type === 'number') {
      current++

      return {
        type: 'NumberLiteral',
        value: token.value
      }
    }

    if (token.type === 'string') {
      current++

      return {
        type: 'StringLiteral',
        value: token.value
      }
    }

    if (token.type === 'paren' && token.value === '(') {
      token = tokens[++current]

      const node = {
        type: 'CallExpression',
        name: token.value,
        params: []
      }

      token = tokens[++current]

      while (
        token.type !== 'paren' ||
        (token.type === 'paren' && token.value !== ')')
      ) {
        node.params.push(walk())
        token = tokens[current]
      }

      current++

      return node
    }

    throw new TypeError(`Неизвестный тип токена: ${type}`)
  }

  const ast = {
    type: 'Program',
    body: []
  }

  while (current < tokens.length) {
    ast.body.push(walk())
  }

  return ast
}

function traverse(ast, visitor) {
  function traverseArray(array, parent) {
    array.forEach((child) => {
      traverseNode(child, parent)
    })
  }

  function traverseNode(node, parent) {
    const methods = visitor[node.type]

    if (methods && methods.enter) {
      methods.enter(node, parent)
    }

    switch (node.type) {
      case 'Program':
        traverseArray(node.body, node)
        break

      case 'CallExpression':
        traverseArray(node.params, node)
        break

      case 'NumberLiteral':
      case 'StringLiteral':
        break

      default:
        throw new TypeError(`Неизвестный тип узла: ${node.type}`)
    }

    if (methods && methods.exit) {
      methods.exit(node, parent)
    }
  }

  traverseNode(ast, null)
}

function transform(ast) {
  const newAst = {
    type: 'Program',
    body: []
  }

  ast._context = newAst.body

  traverse(ast, {
    NumberLiteral: {
      enter(node, parent) {
        parent._context.push({
          type: 'NumberLiteral',
          value: node.value
        })
      }
    },

    StringLiteral: {
      enter(node, parent) {
        parent._context.push({
          type: 'StringLiteral',
          value: node.value
        })
      }
    },

    CallExpression: {
      enter(node, parent) {
        let expression = {
          type: 'CallExpression',
          callee: {
            type: 'Identifier',
            name: node.name
          },
          arguments: []
        }

        node._context = expression.arguments

        if (parent.type !== 'CallExpression') {
          expression = {
            type: 'ExpressionStatement',
            expression
          }
        }

        parent._context.push(expression)
      }
    }
  })

  return newAst
}

function generateCode(node) {
  switch (node.type) {
    case 'Program':
      return node.body.map(generateCode).join('\n')

    case 'ExpressionStatement':
      return `${generateCode(node.expression)};`

    case 'CallExpression':
      return `${generateCode(node.callee)}(${node.arguments
        .map(generateCode)
        .join(', ')})`

    case 'Identifier':
      return node.name

    case 'NumberLiteral':
      return node.value

    case 'StringLiteral':
      return `"${node.value}"`

    default:
      throw new TypeError(`Неизвестный тип узла: ${node.type}`)
  }
}

function compile(input) {
  const tokens = tokenize(input)
  const ast = parse(tokens)
  const newAst = transform(ast)
  const output = generateCode(newAst)

  return output
}

const lisp1 = '(add 2 2)'
const lisp2 = '(subtract 4 2)'
const lisp3 = '(add 2 (subtract 4 2))'
const c1 = compile(lisp1)
const c2 = compile(lisp2)
const c3 = compile(lisp3)
console.log([c1, c2, c3].join('\n'))
```

</spoiler>

Посмотрим, как работает наш компилятор (и работает ли?).

Определяем 3 lisp-подобные функции:

```javascript
const lisp1 = '(add 2 2)'
const lisp2 = '(subtract 4 2)'
const lisp3 = '(add 2 (subtract 4 2))'
```

Преобразуем их в C-подобные функции:

```javascript
const c1 = compile(lisp1)
const c2 = compile(lisp2)
const c3 = compile(lisp3)
```

Выводим результат в консоль:

```javascript
console.log([c1, c2, c3].join('\n'))
/*
  add(2, 2);
  subtract(4, 2);
  add(2, subtract(4, 2));
*/
```

Поздравляю! Вы только что реализовали свой первый компилятор.

Благодарю за внимание и happy coding!