---
sidebar_position: 8
---

# Сниппеты JavaScript. Часть 1

## Число

### Решение проблемы чисел с плавающей точкой

```js
console.log(0.1 + 0.2 === 0.3) // false

const areEqual = (x, y) => x - y < Number.EPSILON

const result = 0.1 + 0.2

if (areEqual(result, 0.3)) {
  console.log('0.1 + 0.2 = 0.3') // 0.1 + 0.2 = 0.3
}
```

### Четность/нечетность числа

```js
const oddOrEven = (n) => (n % 2 === 0 ? 'even' : 'odd')
// or
const oddOrEven = (n) => (n & 1 ? 'odd' : 'even')
```

### Находится ли число в указанном диапазоне?

```js
const isInRange = (n, start, end = null) => {
  if (end && start > end) [end, start] = [start, end]
  return end === null ? n >= 0 && n < start : n >= start && n < end
}

isInRange(2, 0, 10) // true
isInRange(2, 3, 9) // false
```


### Округление числа до указанного количества знаков после запятой

```js
const round = (n, d = 0) => +`${Math.round(`${n}e${d}`)}e-${d}`
```

### Арифметическая прогрессия

```js
const arithmeticProgress = (n, max) =>
  Array.from({ length: Math.ceil(max / n) }, (_, i) => (i + 1) * n)
```

### Геометрическая прогрессия

```js
const geometricProgress = (end, start = 1, step = 2) =>
  Array.from({ length: ~~(Math.log(end / start) / Math.log(step)) + 1 }).map(
    (_, i) => start * step ** i
  )
```

### Наибольший общий делитель

```js
const gcd = (...nums) => {
  const _gcd = (x, y) => (!y ? x : gcd(y, x % y))
  return nums.reduce((a, b) => _gcd(a, b))
}
```

### Наименьшее общее кратное

```js
const lcm = (...nums) => {
  const gcd = (x, y) => (!y ? x : gcd(y, x % y))
  const _lcm = (x, y) => (x * y) / gcd(x, y)
  return nums.reduce((a, b) => _lcm(a, b))
}
```

### Преобразование арабских чисел в римские

```js
const convertToRoman = (n) => {
  const lookup = [
    ['M', 1000],
    ['CM', 900],
    ['D', 500],
    ['CD', 400],
    ['C', 100],
    ['XC', 90],
    ['L', 50],
    ['XL', 40],
    ['X', 10],
    ['IX', 9],
    ['V', 5],
    ['IV', 4],
    ['I', 1]
  ]
  return lookup.reduce((a, [k, v]) => {
    a += k.repeat(~~(n / v))
    n = n % v
    return a
  }, '')
}
```

### Среднее значение

```js
const average = (...nums) => nums.reduce((a, c) => a + c, 0) / nums.length
```

### Случайное целое число в заданном диапазоне

```js
const getRandomInt = (min, max) => ~~(min + Math.random() * (max - min + 1))
```

### Случайное положительное число в заданном диапазоне

```js
const getRandomPosiviteNum = (min, max, p) => {
  if (min < 0 || min >= max) return 'invalid'
  const n = min + Math.random() * (max - min + 1)
  return !p ? ~~n : n.toFixed(p)
}
```

### Случайный элемент массива

```js
const getRandomItem = (arr) => arr[~~(Math.random() * arr.length)]
// or
const getRandomItem = (arr) => arr[getRandomInt(0, arr.length - 1)]
```

### Площадь треугольника

```js
const getTriangleSquare = (a, b, c) => {
  const p = (a + b + c) / 2
  return (p * (p - a) * (p - b) * (p - c)) ** 0.5
}
```

### Преобразование радиан в градусы и обратно

```js
const radToDeg = (rad) => (rad * 180) / Math.PI

const degToRad = (deg) => (deg * Math.PI) / 180
```

### Преобразование километров в мили и обратно

```js
const kmToM = (km) => km * 0.621371

const mToKm = (m) => m / 0.621371
```

### Преобразование градусов Цельсия в градусы Фаренгейта и обратно

```js
const cToF = (c) => c * 1.8 + 32

const fToC = (f) => (f - 32) / 1.8
```

### Форматирование миллисекунд в дни, часы и т.д.

```js
const format = (ms) => {
  if (ms < 0) ms = -ms
  const time = {
    day: ~~(ms / 86400000),
    hour: ~~(ms / 3600000) % 24,
    minute: ~~(ms / 60000) % 60,
    second: ~~(ms / 1000) % 60,
    millisecond: ~~ms % 1000
  }
  return Object.entries(time)
    .filter((val) => val[1] !== 0)
    .map(([k, v]) => `${v} ${k}${v !== 1 ? 's' : ''}`)
    .join(', ')
}

format(34325055574)
// 397 days, 6 hours, 44 minutes, 15 seconds, 574 milliseconds
```

### Форматирование байтов

```js
const formatBytes = (num, precision = 3, addSpace = true) => {
  const UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const space = addSpace ? ' ' : ''
  const sign = num < 0 ? -num : num

  if (Math.abs(num) < 1) return num + space + UNITS[0]

  const exponent = Math.min(~~(Math.log10(sign) / 3), UNITS.length - 1)
  const _num = +(sign / 1000 ** exponent).toPrecision(precision)

  return (num < 0 && '-') + _num + space + UNITS[exponent]
}

formatBytes(-27145424323.5821, 5) // '-27.145 GB'
formatBytes(123456789, 3, false) // '123MB'
```

### Маскировка чисел

```js
const mask = (num, count = 4, mask = '*') =>
  `${num}`.slice(-count).padStart(`${num}`.length, mask)

mask(1234567890, 3) // '*******890'
mask(1234567890, -4, '$') // '$$$$567890'
```

### Расстояние между двумя точками

```js
const distance = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1)

distance(0, 0, 10, 10) // 14.142135623730951
```

## Строка

### Инверсия строки

```js
const reverseWord = (str) => [...str].reverse().join('')
reverseWord('foo') // oof

const reverseWords = (str) => str.split(' ').reverse().join(' ')
reverseWords('hello world') // world hello
// or
const reverseWords = (str) =>
  str
    .split(' ')
    .map((w) => [...w].reverse().join(''))
    .join(' ')
reverseWords('hello world') // olleh dlrow
```

### "Капитализация" строки

```js
const capitilizeWord = (str) => `${str[0].toUpperCase()}${str.slice(1)}`
capitilizeWord('foo') // Foo

const capitilizeWords = (str) =>
  str
    .split(' ')
    .map((w) => `${w[0].toUpperCase()}${w.slice(1)}`)
    .join(' ')

capitilizeWords('foo bar') // Foo Bar
```

### Сокращение строки

```js
const truncateWord = (str, n) =>
  str.length > n ? str.slice(0, n > 3 ? n : 3) + '...' : str

truncateWord('JavaScript', 4) // Java...

const truncateWords = (str, n) => str.split(' ').slice(0, n).join(' ')
truncateWords('JavaScript is awesome!', 1) // JavaScript
```

### Количество вхождений подстроки

```js
const subCount = (str, sub) => {
  let c = 0,
    i = 0
  while (true) {
    const r = str.indexOf(sub, i)
    if (r !== -1) [c, i] = [c + 1, r + 1]
    else return c
  }
}

subCount('tiktok tik tok tik', 'tik') // 3
```

### Преобразование строки

```js
const toTitleCase = (str) =>
  str
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    .map((i) => `${i[0].toUpperCase()}${i.slice(1)}`)
    .join(' ')

toTitleCase('hello world') // Hello World
toTitleCase('hello-world') // Hello World

const toCamelCase = (str) => {
  let s =
    str &&
    str
      .match(
        /[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g
      )
      .map((c) => `${c[0].toUpperCase()}${c.slice(1).toLowerCase()}`)
      .join('')

  return `${s[0].toLowerCase()}${s.slice(1)}`
}

toCamelCase('hello world') // helloWorld
toCamelCase('hello-world') // helloWorld

const toSnakeCase = (str) =>
  str &&
  str
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    .map((c) => c.toLowerCase())
    .join('_')

toSnakeCase('helloWorld') // hello_world
toSnakeCase('hello-world') // hello_world

const toKebabCase = (str) =>
  str &&
  str
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    .map((l) => l.toLowerCase())
    .join('-')

toKebabCase('helloWorld') // hello-world
toKebabCase('hello world') // hello-world
```

### Все возможные варианты строки

```js
const getStrPermutations = (str) => {
  if (str.length <= 2) return str.length === 2 ? [str, str[1] + str[0]] : [str]

  return str
    .split('')
    .reduce(
      (a, l, i) =>
        a.concat(getStrPermutations(str.slice(0, i) + str.slice(i + 1)).map((v) => l + v)),
      []
    )
}

getStrPermutations('abc') // ['abc', 'acb', 'bac', 'bca', 'cab', 'cba']
```

### Чувствительная к языку сортировка строки

```js
const sortStr = (str) => [...str].sort((a, b) => a.localeCompare(b)).join('')

sortStr('cabbage') // aabbceg
// or
const collator = new Intl.Collator()
const sortStr = (str) =>
  [...str].sort((a, b) => collator.compare(a, b)).join('')
```

### "Плюрализация" строки

```js
const pluralize = (val, word, plural = word + 's') => {
  const p = (num, word, plural = word + 's') =>
    [1, -1].includes(Number(num)) ? word : plural
  if (typeof val === 'object') return (num, word) => p(num, word, val[word])
  return p(val, word, plural)
}

pluralize(1, 'apple') // 'apple'
pluralize(2, 'apple') // 'apples'
pluralize(2, 'person', 'people') // 'people'
```

### Перенос строки по количеству указанных символов

```js
const wordWrap = (str, max, br = '\n') =>
  str.replace(
    new RegExp(`(?![^\\n]{1,${max}}$)([^\\n]{1,${max}})\\s`, 'g'),
    '$1' + br
  )

wordWrap(
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce tempus.',
  32
)
/*
  Lorem ipsum dolor sit amet,
  consectetur adipiscing elit.
  Fusce tempus.
*/
```

### Удаление всех лишних пробелов

```js
const noSpace = (str) => str.trim().replace(/\s{2,}/g, ' ')
noSpace(' hello   world  ') // 'hello world'
```

### Размер строки в байтах

```js
const getByteSize = (str) => new Blob([str]).size

byteSize('😀') // 4
byteSize('Hello World') // 11
```

### Наличие слов в строке

```js
const ransomNote = (note, magazine) =>
  note
    .split(' ')
    .every((word) =>
      magazine.includes(word) ? (magazine = magazine.replace(word, '')) : false
    )

const words = 'The quick brown fox jumps over the lazy dog'
ransomNote('lazy dog', words) // true
ransomNote('red fox', words) // false
```

## Массив

### Извлечение i-того элемента

```js
const getNthItem = (arr, n = 0) =>
  (n === -1 ? arr.slice(n) : arr.slice(n, n + 1))[0]

getNthItem([1, 2, 3], 1) // 2
getNthItem(['a', 'b', 'c'], -3) // a
```

### Извлечение каждого i-того элемента

```js
const getEveryNthItem = (arr, n) => arr.filter((_, i) => i % n === n - 1)

getEveryNthItem([1, 2, 3, 4, 5, 6], 2) // [2, 4, 6]
```

### Создание

```js
const createArr = (n, r) => new Array(n).fill(r)

createArr(5, '😃') //  ['😃', '😃', '😃', '😃', '😃']

// or
const createArr = (n) => Array.from({ length: n }, (_, i) => i)

createArr(5) // [0, 1, 2, 3, 4]

// or
const createArr = (n, fn) => Array.from({ length: n }, fn)

createArr(10, () => +Math.random().toFixed(2))
// [0.84, 0.21, 0.43, 0.24, 0.94, 0.2, 0.91, 0.44, 0.38, 0.28]

// or
const initArrWithRange = (end, start = 0, step = 1) =>
  Array.from(
    { length: ~~((end - start + 1) / step) },
    (_, i) => i * step + start
  )

initArrWithRange(5) // [0, 1, 2, 3, 4, 5]
initArrWithRange(7, 3) // [3, 4, 5, 6, 7]
initArrWithRange(9, 0, 2) // [0, 2, 4, 6, 8]

// or
const initArrWithRange = (min, max, n = 1) =>
  Array.from({ length: n }, () => ~~(Math.random() * (max - min + 1)) + min)

initArrWithRange(12, 35, 10)
// [ 34, 14, 27, 17, 30, 27, 20, 26, 21, 14 ]
```

### Получение всех индексов элемента

```js
const getAllIndexes = (arr, v) =>
  arr.reduce((a, c, i) => (c === v ? [...a, i] : a), [])

getAllIndexes([1, 2, 3, 1, 2, 3], 1) // [0, 3]
getAllIndexes([1, 2, 3], 4) // []
```

### Все возможные варианты

```js
const getArrPermutations = (arr) => {
  if (arr.length <= 2) return arr.length === 2 ? [arr, [arr[1], arr[0]]] : arr

  return arr.reduce(
    (a, c, i) =>
      a.concat(
        getArrPermutations([...arr.slice(0, i), ...arr.slice(i + 1)]).map((v) => [
          c,
          ...v
        ])
      ),
    []
  )
}

getArrPermutations([1, 2, 3])
// [ [1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1] ]
```

### Сравнение массивов

```js
const areEqual = (a, b) => {
  if (a.length !== b.length) return false
  const _a = a.sort()
  const _b = b.sort()
  return _a.every((v, i) => v === _b[i])
}

const x = [1, 3, 5, 7, 9]
const y = [5, 3, 1, 9, 7]

areEqual(x, y) // true
```

### Удаление элементов, удовлетворяющих условию - функции

```js
const removeItems = (fn, arr) => arr.filter((...args) => !fn(...args))

removeItems((n) => n % 2 === 0, [1, 2, 3, 4, 5]) // [1, 3, 5]

removeItems((s) => s.length > 4, ['Apple', 'Pear', 'Kiwi', 'Banana'])
// ['Pear', 'Kiwi']
```

### Перемешивание

```js
const shuffle = (arr) => arr.sort(() => 0.5 - Math.random())

// тасование Фишер-Йетса
const shuffle = ([...arr]) => {
  let l = arr.length
  while (l) {
    const i = ~~(Math.random() * l--)
    ;[(arr[l], arr[i])] = [arr[i], arr[l]]
  }
  return arr
}
```

### Процент элементов, удовлетворяющих условию

```js
const percent = (arr, v) =>
  (100 * arr.reduce((a, c) => a + (c < v ? 1 : 0) + (c === v ? 0.5 : 0), 0)) / arr.length

percent([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 6) // 55
```

### Количество вхождений элемента

```js
const getCountOccur = (arr, v) =>
  arr.reduce((a, c) => (c === v ? a + 1 : a), 0)

getCountOccur([1, 1, 2, 1, 2, 3], 1) // 3
```

### Количество вхождений каждого элемента

```js
const getOccurCount = (arr) =>
  arr.reduce((a, k) => {
    a[k] = a[k] ? a[k] + 1 : 1
    return a
  }, {})

getOccurCount(['a', 'b', 'c', 'b', 'b', 'a'])
// { a: 2, b: 3, c: 1 }
```

### Пересечение (одинаковые элементы) массивов

```js
const intersect = (a, b) => a.filter((i) => b.includes(i))

intersect([1, 2, 3], [1, 2, 4]) // [1, 2]
```

### Удаление указанных элементов

```js
const removeItems = (arr, ...args) => arr.filter((i) => !args.includes(i))

removeItems([2, 1, 3], 1, 2) // [3]

// or
const pullItems = (arr, ...args) => {
  const state = Array.isArray(args[0]) ? args[0] : args
  const pulled = arr.filter((i) => !state.includes(i))
  arr.length = 0
  pulled.forEach((i) => arr.push(i))
  return arr
}

const arr = ['a', 'b', 'c', 'a', 'b', 'c']

pullItems(arr, 'a', 'c') // [ 'b', 'b' ]
```

### Стабильная сортировка

```js
const stableSort = (arr, fn) =>
  arr
    .map((i, _i) => ({ i, _i }))
    .sort((a, b) => fn(a.i, b.i) || a._i - b._i)
    .map(({ i }) => i)

stableSort([2, 10, 20, 1]) // 1, 2, 10, 20
```

### Фильтрация объектов

```js
const reducedFilter = (arr, keys, fn) =>
  arr.filter(fn).map((el) =>
    keys.reduce((a, k) => {
      a[k] = el[k]
      return a
    }, {})
  )

const data = [
  {
    id: 1,
    name: 'John',
    age: 23
  },
  {
    id: 2,
    name: 'Jane',
    age: 32
  }
]

reducedFilter(data, ['id', 'name'], (i) => i.age > 23)
// [ { id: 2, name: 'Jane'} ]
```

### Добавление элементов по указанному индексу (модификация `splice`)

```js
const insertAt = (arr, i, ...args) => {
  arr.splice(i + 1, 0, ...args.flat())
  return arr
}

insertAt([1, 2, 3], 1, [4, 5]) // [1, 2, 4, 5, 3]
```

### Среднее значение объектов

```js
const averageBy = (arr, fn) =>
  arr
    .map(typeof fn === 'function' ? fn : (val) => val[fn])
    .reduce((a, c) => a + c, 0) / arr.length

averageBy([{ n: 4 }, { n: 2 }, { n: 8 }, { n: 6 }], (x) => x.n) // 5
averageBy([{ n: 4 }, { n: 2 }, { n: 8 }, { n: 6 }], 'n') // 5
```

### Сжатие (объединение) массивов

```js
const zipArr = (...args) => {
  const max = Math.max(...args.map((i) => i.length))
  return Array.from({ length: max }).map((_, i) =>
    Array.from({ length: args.length }, (_, j) => args[j][i])
  )
}

zipArr(['a', 'b'], [1, 2], [true, false])
// [ ['a', 1, true], ['b', 2, false] ]
```

### Разделение на части

```js
// n - количество элементов каждой части
const chunk = (arr, n) => (arr.length > n ? [arr, arr.splice(n)] : arr)

chunk([1, 2, 3, 4, 5, 6, 7], 4) // [ [1, 2, 3, 4], [5, 6, 7] ]

// n - количество частей, на которые делится массив
const chunk = (arr, n) => {
  const size = ~~(arr.length / n)
  return Array.from({ length: n }, (_, i) =>
    arr.slice(i * size, i * size + size)
  )
}

chunk([1, 2, 3, 4, 5, 6, 7], 4) // [ [1, 2], [3, 4], [5, 6], [7] ]
```

### Выборка элементов

```js
// не удовлетворяющих условию - функции
const takeUntil = (arr, fn) => {
  for (const [i, v] of arr.entries()) {
    if (fn(v)) {
      return arr.slice(0, i)
    }
  }
  return arr
}

takeUntil([1, 2, 3, 4], (n) => n >= 3) // [1, 2]

// удовлетворяющих условию - функции
const dropWhile = (arr, fn) => {
  while (arr.length > 0 && !fn(arr[0])) {
    arr = arr.slice(1)
  }
  return arr
}

dropWhile([1, 2, 3, 4], (n) => n >= 3) // [3, 4]
```

### Наибольшее и наименьшее значение объекта

```js
const maxBy = (arr, fn) =>
  Math.max(...arr.map(typeof fn === 'function' ? fn : (val) => val[fn]))

maxBy([{ n: 4 }, { n: 2 }, { n: 8 }, { n: 6 }], 'n') // 8

const minBy = (arr, fn) =>
  Math.min(...arr.map(typeof fn === 'function' ? fn : (val) => val[fn]))

minBy([{ n: 4 }, { n: 2 }, { n: 8 }, { n: 6 }], 'n') // 2
```

### Объединение массивов по условию - функции

```js
const unionBy = (a, b, fn) => {
  const s = new Set(a.map(fn))
  return Array.from(new Set([...a, ...b.filter((x) => !s.has(fn(x)))]))
}

unionBy([2.1], [1.2, 2.3], Math.floor) // [2.1, 1.2]
unionBy([{ id: 1 }, { id: 2 }], [{ id: 2 }, { id: 3 }], (x) => x.id)
// [{ id: 1 }, { id: 2 }, { id: 3 }]
```

### Сортировка и объединение массивов

```js
const sortAndMerge = (a, b) => {
  const _a = [...a]
  const _b = [...b]

  return Array.from({ length: _a.length + _b.length }, () => {
    if (!_a.length) return _b.shift()
    else if (!_b.length) return _a.shift()
    else return _a[0] > _b[0] ? _b.shift() : _a.shift()
  })
}

sortAndMerge([1, 3, 5], [2, 4, 6]) // [1, 2, 3, 4, 5, 6]
```

### Сортировка и объединение объектов по условию - ключу объекта

```js
const combine = (a, b, p) =>
  Object.values(
    [...a, ...b].reduce((a, v) => {
      if (v[p])
        a[v[p]] = a[v[p]]
          ? { ...a[v[p]], ...v }
          : { ...v }
      return a
    }, {})
  )

const x = [
  { id: 1, name: 'John' },
  { id: 2, name: 'Jane' }
]
const y = [{ id: 1, age: 28 }, { id: 3, age: 26 }, { age: 24 }]

combine(x, y, 'id')
/*
[
  { id: 1, name: 'John', age: 28 },
  { id: 2, name: 'Jane' },
  { id: 3, age: 26 }
]
*/
```

### Суммирование значений объектов

```js
const sumBy = (arr, fn) =>
  arr.map(typeof fn === 'function')
    ? fn
    : (v) => v[fn].reduce((a, c) => a + c, 0)

sumBy([{ n: 4 }, { n: 2 }, { n: 8 }, { n: 6 }], (x) => x.n) // 20
sumBy([{ n: 4 }, { n: 2 }, { n: 8 }, { n: 6 }], 'n') // 20
```

### Группировка элементов по условию - функции

```js
// значение - количество элементов
const countBy = (arr, fn) =>
  arr.map(typeof fn === 'function' ? fn : (v) => v[fn]).reduce((a, v) => {
    a[v] = (a[v] || 0) + 1
    return a
  }, {})

countBy([6.1, 4.2, 6.3], Math.floor) // { 4: 1, 6: 2 }
countBy(['one', 'two', 'three'], 'length') // { 3: 2, 5: 1 }

// значение - массив элементов
const groupBy = (arr, fn) =>
  arr.map(typeof fn === 'function' ? fn : (v) => v[fn]).reduce((a, v, i) => {
    a[v] = (a[v] || []).concat(arr[i])
    return a
  }, {})

groupBy([6.1, 4.2, 6.3], Math.floor) // {4: [4.2], 6: [6.1, 6.3]}
groupBy(['one', 'two', 'three'], 'length') // {3: ['one', 'two'], 5: ['three']}
```

### Разделение массива по условию - функции

```js
// [ [элементы, удовлетворяющие условию], [другие элементы] ]
const bifurcateBy = (arr, fn) =>
  arr.reduce((acc, val, i) => (acc[fn(val, i) ? 0 : 1].push(val), acc), [
    [],
    []
  ])

bifurcateBy(['foo', 'bar', 'baz'], (x) => x[0] === 'b')
// [ ['bar', 'baz'], ['foo'] ]
```

### Определение разницы между массивами по условию - функции

```js
const differenceBy = (x, y, fn) => {
  const _x = new Set(x.map((i) => fn(i))),
    _y = new Set(y.map((i) => fn(i)))
  return [
    ...x.filter((i) => !_y.has(fn(i))),
    ...y.filter((i) => !_x.has(fn(i)))
  ]
}

differenceBy([2.1, 1.2], [2.3, 3.4], Math.floor) // [1.2, 3.4]

differenceBy(
  [{ id: 1 }, { id: 2 }, { id: 3 }],
  [{ id: 1 }, { id: 2 }, { id: 4 }],
  (i) => i.id
) // [ { id: 3 }, { id: 4 } ]
```

### Сортировка объектов по условиям - ключам объекта в виде массива

```js
const orderBy = (arr, props, orders) =>
  [...arr].sort((x, y) =>
    props.reduce((a, p, i) => {
      if (a === 0) {
        const [p1, p2] =
          orders && orders[i] === 'desc' ? [y[p], x[p]] : [x[p], y[p]]
        a = p1 > p2 ? 1 : p1 < p2 ? -1 : 0
      }
      return a
    }, 0)
  )

const users = [
  { name: 'John', age: 23 },
  { name: 'Jane', age: 22 },
  { name: 'Alice', age: 24 },
  { name: 'Bob', age: 21 }
]

orderBy(users, ['name', 'age'])
/*
[
  {name: "Alice", age: 24},
  {name: "Bob", age: 21},
  {name: "Jane", age: 22},
  {name: "John", age: 23}
]
*/
```

### Сортировка объектов по ключу и в порядке значений

```js
const orderWith = (arr, prop, order) => {
  const ordered = order.reduce((a, c, i) => {
    a[c] = i
    return a
  }, {})
  return [...arr].sort((a, b) => {
    if (ordered[a[prop]] === undefined) return 1
    if (ordered[b[prop]] === undefined) return -1
    return ordered[a[prop]] - ordered[b[prop]]
  })
}

const users = [
  { name: 'john', language: 'JavaScript' },
  { name: 'jane', language: 'TypeScript' },
  { name: 'alice', language: 'JavaScript' },
  { name: 'bob', language: 'Java' },
  { name: 'igor' },
  { name: 'harry', language: 'Python' }
]

orderWith(users, 'language', ['JavaScript', 'TypeScript', 'Java'])
/*
[
  { name: 'john', language: 'JavaScript' },
  { name: 'alice', language: 'JavaScript' },
  { name: 'jane', language: 'TypeScript' },
  { name: 'bob', language: 'Java' },
  { name: 'igor' },
  { name: 'harry', language: 'Python' }
]
*/
```

## Объект

### Является ли объект пустым?

```js
const isEmpty = (val) => val === null || !(Object.keys(val) || val).length

isEmpty('') // true
isEmpty([]) // true
isEmpty(['']) // false
isEmpty({ a: 1 }) // false
```

### Размер итерируемого объекта

```js
const getSize = (val) =>
  val ? val.length || val.size || Object.keys(val).length || 0 : 0

getSize([1, 2, 3]) // 3
getSize('size') // 4
getSize(new Set([3, 3, 2, 2, 1])) // 3
getSize({ one: 1, two: 2, three: 3 }) // 3
getSize() // 0
```

### Извлечение значений по селекторам

```js
const getValues = (from, ...selectors) =>
  [...selectors].map((s) =>
    s
      .replace(/\[([^\[\]]*)\]/g, '.$1.')
      .split('.')
      .filter((v) => v !== '')
      .reduce((a, c) => a && a[c], from)
  )

const obj = {
  selector: { to: { val: 'value to select' } },
  target: [1, 2, { a: 'test' }]
}

getValues(obj, 'selector.to.val', 'target[0]', 'target[2].a')
// ["value to select", 1, "test"]
```

### Копирование

```js
const copyObj = (obj, shallow = true) =>
  shallow ? { ...obj } : JSON.parse(JSON.stringify(obj))

const obj = {
  foo: 'bar',
  baz: {
    qux: {
      a: 'b'
    }
  }
}

const _obj = copyObj(obj)
_obj.baz.qux.a = 'c'

obj.baz.qux.a // c

const __obj = copyObj(_obj, false)
__obj.baz.qux.a = 'd'

_obj.baz.qux.a // c
```

### Рекурсивное (глубокое) копирование объекта (массива)

```js
const deepClone = (obj) => {
  if (obj === null) return null
  const clone = Object.assign({}, obj)
  Object.keys(clone).forEach(
    (key) =>
      (clone[key] =
        typeof obj[key] === 'object' ? deepClone(obj[key]) : obj[key])
  )
  if (Array.isArray(obj)) {
    clone.length = obj.length
    return Array.from(clone)
  }
  return clone
}

const a = { foo: 'bar', obj: { a: 1, b: 2 } }
const b = deepClone(a) // a !== b, a.obj !== b.obj
```

### Удаление свойств по условию - массиву ключей или функции

```js
const omitBy = (obj, arr) =>
  Object.keys(obj)
    .filter((k) => !arr.includes(k))
    .reduce((a, k) => ((a[k] = obj[k]), a), {})

omitBy({ a: 1, b: '2', c: 3 }, ['b']) // { a: 1, c: 3 }

const omitBy = (obj, fn) =>
  Object.keys(obj)
    .filter((k) => fn(obj[k], k))
    .reduce((a, k) => ((a[k] = obj[k]), a), {})

omitBy({ a: 1, b: '2', c: 3 }, (x) => typeof x === 'number')
// { a: 1, c: 3 }
```

### Извлечение свойств по условию - массиву ключей или функции

```js
const pickBy = (obj, arr) =>
  arr.reduce((a, k) => (k in obj && (a[k] = obj[k]), a), {})

pickBy({ a: 1, b: '2', c: 3 }, ['a', 'c']) // { a: 1, c: 3 }

const pickBy = (obj, fn) =>
  Object.keys(obj)
    .filter((k) => !fn(obj[k], k))
    .reduce((a, k) => ((a[k] = obj[k]), a), {})

pickBy({ a: 1, b: '2', c: 3 }, (x) => typeof x === 'number')
// { b: '2' }
```

### Извлечение глубоко вложенного свойства

```js
const getDeepVal = (obj, key) =>
  key in obj
    ? obj[key]
    : Object.values(obj).reduce((acc, val) => {
        if (acc !== undefined) return acc
        if (typeof val === 'object') return getDeepVal(val, key)
      }, undefined)

const obj = {
  foo: {
    bar: {
      baz: 'qux'
    }
  }
}

getDeepVal(obj, 'baz') // qux
getDeepVal(obj, 'qux') // undefined
```

### Извлечение свойства по условию - функции

```js
const getKey = (obj, fn) =>
  Object.keys(obj).find((key) => fn(obj[key], key, obj))

getKey(
  {
    john: { age: 23, active: true },
    jane: { age: 24, active: false },
    alice: { age: 25, active: true }
  },
  (x) => x['active']
)
// john
```

### Извлечение ключей по значению

```js
const getKeys = (obj, val) =>
  Object.keys(obj).filter((key) => obj[key] === val)

const ages = {
  John: 20,
  Jane: 22,
  Alice: 20
}

getKeys(ages, 20) // ['John', 'Alice']
```

### Объединение объектов

```js
const mergeObj = (...objects) =>
  [...objects].reduce(
    (acc, obj) =>
      Object.keys(obj).reduce((a, k) => {
        a[k] = a.hasOwnProperty(k) ? [].concat(a[k]).concat(obj[k]) : obj[k]
        return acc
      }, {}),
    {}
  )

const x = {
  a: [{ x: 2 }, { y: 4 }],
  b: 1
}

const y = {
  a: { z: 3 },
  b: [2, 3],
  c: 'foo'
}

mergeObj(x, y)
/*
{
  a: [ { x: 2 }, { y: 4 }, { z: 3 } ],
  b: [ 1, 2, 3 ],
  c: 'foo'
}
*/
```

### Преобразование объекта в строку запроса

```js
const convertObjToQuery = (params) =>
  params
    ? Object.entries(params).reduce((str, [k, v]) => {
        const s = str.length === 0 ? '?' : '&'
        str += typeof v === 'string' ? `${s}${k}=${v}` : ''
        return str
      }, '')
    : ''

convertObjToQuery({ page: '1', sort: 'desc', order: 'title' }) // ?page=1&sort=desc&order=title
```

### Глубокая "заморозка" (обеспечение иммутабельности)

```js
const deepFreeze = (obj) => {
  Object.keys(obj).forEach((key) => {
    if (typeof obj[key] === 'object') deepFreeze(obj[key])
  })
  return Object.freeze(obj)
}
```

### Сжатие (объединение) объектов

```js
const zipObj = (props, vals) =>
  props.reduce((obj, prop, i) => ((obj[prop] = vals[i]), obj), {})

zipObj(['a', 'b', 'c'], [1, 2]) // { a: 1, b: 2, c: undefined }
zipObj(['a', 'b'], [1, 2, 3]) // { a: 1, b: 2 }
```

### Сравнение объектов

```js
const areEqual = (a, b) => {
  if (a === b) return true

  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime()

  if (!a || !b || (typeof a !== 'object' && typeof b !== 'object'))
    return a === b

  if (a.prototype !== b.prototype) return false

  const keys = Object.keys(a)

  if (keys.length !== Object.keys(b).length) return false

  return keys.every((k) => areEqual(a[k], b[k]))
}

areEqual(
  { a: [2, { e: 3 }], b: [4], c: 'foo' },
  { a: [2, { e: 3 }], b: [4], c: 'foo' }
) // true
areEqual([1, 2, 3], { 0: 1, 1: 2, 2: 3 }) // true
```

### Поиск совпадения по условию - функции

```js
const matchesWith = (obj, source, fn) =>
  Object.keys(source).every((key) =>
    obj.hasOwnProperty(key) && fn
      ? fn(obj[key], source[key], key, obj, source)
      : obj[key] === source[key]
  )

const isGreet = (val) => /^h(?:i|ello)$/.test(val)
matchesWith(
  { greet: 'hello' },
  { greet: 'hi' },
  (a, b) => isGreet(a) && isGreet(b)
) // true
```

### Обеспечение возможности создания глубоко вложенных свойств

```js
const deepProp = (obj) =>
  new Proxy(obj, {
    get: (target, prop) => {
      if (!(prop in target)) target[prop] = deepProp({})
      return target[prop]
    }
  })

const obj = deepProp({})

obj.x.y.z = 'foo'

console.log(obj.x.y.z) // foo
```

### Создание итерируемого объекта

```js
const makeIterable = (obj) => {
  Object.defineProperties(obj, {
    length: {
      value: Object.keys(obj).length
    },

    [Symbol.iterator]: {
      value: function* () {
        for (const i in this) {
          yield this[i]
        }
      }
    }
  })

  return obj
}

const iterableObj = makeIterable({
  name: 'Jane',
  age: 23
})

for (const v of iterableObj) console.log(v) // Jane 23
console.log(...iterableObj) // Jane 23
```

### Создание объекта, открытого для расширения, но закрытого для модификации

```js
const makeOpenClosed = (obj) =>
  new Proxy(obj, {
    get: (target, key) => target[key],
    set: (target, key, value) => {
      if (target.hasOwnProperty(key)) {
        throw new Error('error')
      }
      target[key] = value
    }
  })

const person = makeOpenClosed({ name: 'John', age: 30 })

console.log(person.name) // John
person.sex = 'm'
person.age = 20 // error
```

## Функция

### Искусственная задержка

```js
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const printNums = async () => {
  console.log(1)
  await sleep(1000)
  console.log(2)
  await sleep(1000)
  console.log(3)
}

printNums()
// 1 2 3 с задержкой в 1 сек между каждым `console.log`
```

### Измерение времени выполнения функции

```js
const howLong = async (fn) => {
  console.time('t')
  const r = await fn()
  console.timeEnd('t')
  return r
}

howLong(printNums) // примерно 2 сек
```

### Выполнение функции только при удовлетворении условия

```js
const makeWhen = (fn, when) => (x) => fn(x) ? when(x) : x

const doubleWhenEven = makeWhen(
  (n) => !(n & 1),
  (n) => n * 2
)

doubleWhenEven(2) // 4
doubleWhenEven(1) // 1
```

### Определение типа переданного значения

```js
const getType = (v) =>
  v === undefined ? 'undefined' : v === null ? 'null' : v.constructor.name

getType([]) // Array
getType(() => {}) // Function

// or
const getType = (v) => Object.prototype.toString.call(v).slice(8, -1)

getType({}) // Object
getType(function () {}) // Function
```

### Асинхронное выполнение функции с помощью веб-воркера

```js
const runAsync = (fn) => {
  const worker = new Worker(
    URL.createObjectURL(new Blob([`postMessage((${fn})())`]), {
      type: 'application/javascript; charset=utf-8'
    })
  )
  return new Promise((res, rej) => {
    worker.onmessage = ({ data }) => {
      res(data)
      worker.terminate()
    }
    worker.onerror = (err) => {
      rej(err)
      worker.terminate()
    }
  })
}

const expensiveFn = () => {
  let res = 0
  for (let i = 0; i < 4000; i++)
    for (let j = 0; j < 700; j++)
      for (let k = 0; k < 300; k++)
        res = res + i + j + k

  return res
}

runAsync(expensiveFn).then(console.log)
// 2098740000000
```

### Последовательное выполнение промисов

```js
const runPromisesInSeq = (promises) =>
  promises.reduce((prev, next) => prev.then(next), Promise.resolve())

const sleep = (ms) =>
  new Promise((r) => {
    const id = setTimeout(() => {
      console.log(ms)
      r()
      clearTimeout(id)
    }, ms)
  })

runPromisesInSeq([() => sleep(1000), () => sleep(2000)])
```

### Определение самой производительной функции

```js
const getMostPerformFn = (fns, iter = 10) => {
  const times = fns.map((fn) => {
    const start = performance.now()

    for (let i = 0; i < iter; i++) fn()

    return performance.now() - start
  })

  const bestTime = Math.min(...times)
  const bestFn = fns[times.indexOf(bestTime)]

  return [Math.round(bestTime), bestFn]
}

const functions = [
  () => quickSort(shuffledArr),
  () => countingSort(shuffledArr),
  () => nativeSort(shuffledArr)
]

const [bestTime, bestFn] = getMostPerformFn(functions)
console.log(bestTime, bestFn)
```

### Однократное выполнение функции

```js
const callOnce = (fn) => {
  let wasCalled = false
  return function (...args) {
    if (wasCalled) return
    wasCalled = true
    return fn.apply(this, args)
  }
}
```

### Выполнение функции указанное количество раз

```js
const callTimes = (n, fn, ctx = undefined) => {
  let i = 0
  while (fn.call(ctx, i) !== false && ++i < n) {}
}

let str = ''
callTimes(5, (i) => (str += i))
console.log(str) // 012345
```

### Последовательное выполнение функций

```js
const pipe = (...fns) => fns.reduce((f, g) => (...args) => g(f(...args)))

const add5 = (x) => x + 5
const mult = (x, y) => x * y

const multAndAdd5 = pipe(mult, add5)
multAndAdd5(5, 2) // 15
```

### Последовательное выполнение асинхронных функций

```js
const chainAsync = (fns) => {
  let i = 0
  const last = fns[fns.length - 1]
  const next = () => {
    const fn = fns[i++]
    fn === last ? fn() : fn(next)
  }
  next()
}

chainAsync([
  (next) => {
    console.log('hi!')
    setTimeout(next, 1000)
  },
  (next) => {
    console.log('how are you?')
    setTimeout(next, 1000)
  },
  () => {
    console.log('bye!')
  }
])
```

### "Привязка" функции к объекту (определение контекста метода)

```js
const bindKey =
  (obj, fn) =>
  (...args) =>
    fn.apply(obj, args)

const user = {
  name: 'John',
  age: 24
}

function greet(phrase) {
  console.log(`${phrase} My name is ${this.name}. I'm ${this.age} years old.`)
}

bindKey(user, greet)('Hi!')
// Hi! My name is John. I'm 24 years old.
```

### "Привязка" методов к объекту (определение контекста методов)

```js
const bindAll = (obj) => {
  for (const key in obj) {
    if (typeof obj[key] === 'function') {
      obj[key] = obj[key].bind(obj)
    }
  }
}

const view = {
  label: '!',
  click() {
    console.log('clicked' + this.label)
  }
}

bindAll(view)
window.addEventListener('click', view.click)
```

### Объединение функций

```js
const mergeFns =
  (...fns) =>
  (...args) =>
    fns.map((fn) => fn.apply(null, args))

const minMax = mergeFns(Math.min, Math.max)

minMax(1, 2, 3, 4, 5) // [1, 5]
```

### "Промисификация"

```js
const promisify = (fn) => (...args) =>
  new Promise((resolve, reject) =>
    fn(...args, (err, res) => (err ? reject(err) : resolve(res)))
  )

const delay = promisify((d, cb) => setTimeout(cb, d))

delay(1000).then(() => {
  console.log('Hi!')
})
```

### "Мемоизация"

```js
const memo = (fn) => {
  const cache = new Map()

  return (...args) => {
    const key = args.sort().toString()

    if (cache.has(key)) {
      console.log('From cache')
      return cache.get(key)
    } else {
      console.log('Calculated')
      const res = fn(...args)
      cache.set(key, res)
      return res
    }
  }
}

const add = (x, y) => x + y
const memoAdd = memo(add)
memoAdd(24, 42) // Calculated
memoAdd(42, 24) // From cache

// another example
const fact = (n) => (n <= 1 ? 1 : n * fact(n - 1))

const memoFact = memo(fact)

howLong(() => memoFact(150)) // 0.15
howLong(() => memoFact(150)) // 0.05

// or
const memo = (fn) =>
  new Proxy(fn, {
    cache: new Map(),
    apply(target, thisArg, args) {
      const key = args.sort().toString()
      let isCalculated = false

      if (!this.cache.has(key)) {
        this.cache.set(key, target.apply(thisArg, args))
        isCalculated = true
      }

      console.log(isCalculated)
      return this.cache.get(key)
    }
  })

const add = (x, y) => x + y
const memoAdd = memo(add)
memoAdd(24, 42) // true
memoAdd(42, 24) // false
```

### Каррирование

```js
// es5
function curry(a) {
  return function (b) {
    return function (c) {
      return a + b + c
    }
  }
}

// es6
const curry = (a) => (b) => (c) => a + b + c

curryArrowSum(1) // b => c => 1 + b + c
curryArrowSum(1)(2) // c => 3 + c
curryArrowSum(1)(2)(3) // 6

// eval is evil
const curryCalcEval = (...nums) => (op) =>
  nums.reduce((acc, cur) => (acc = eval(`acc ${op} cur`)))

curryCalcEval(1, 2, 3)('+') // 6
```

### Создание "каррированной" функции

```js
const currying = (fn) =>
  function curry(...args) {
    return fn.length <= args.length
      ? fn.apply(this, args)
      : (...moreArgs) => curry.apply(this, args.concat(moreArgs))
  }

const sum = currying((a, b, c, d) => a + b + c + d)

sum(1)(2)(3)(4) // 10
sum(3, 1)(2, 4) // 10

// or
const currying = (fn, arity = fn.length, ...args) =>
  arity <= args.length ? fn(...args) : currying.bind(null, fn, arity, ...args)

currying(Math.pow)(2)(10) // 1024
currying(Math.min, 3)(4)(2)(1) // 1
```

### Частичное применение

```js
const partial =
  (fn, ...x) =>
  (...y) =>
    fn(...x, ...y)

const greet = (phrase, name) => `${phrase}, ${name}!`
const hello = partial(greet, 'Hello')

console.log(hello('John')) // Привет, Иван!

// another example
const getFinalPrice = (discount, tax, price) => price + tax - price * discount
const getPriceWithDiscountAndTax = partial(getFinalPrice, 0.2, 10)
console.log(getPriceWithDiscountAndTax(100)) // 90
```

### "Декаррирование"

```js
const uncurry =
  (fn, n = 1) =>
  (...args) => {
    const next = (acc) => (args) => args.reduce((x, y) => x(y), acc)
    if (n > args.length) return
    return next(fn)(args.slice(0, n))
  }

const currySum = (x) => (y) => (z) => x + y + z

const sum = uncurry(currySum, 3)
console.log(sum(1, 2, 3)) // 6
```

### Debounce

```js
const debounce = (fn, ms) =>
  function (...args) {
    let prevCall = this.lastCall
    this.lastCall = Date.now()

    if (prevCall && this.lastCall - prevCall <= ms) {
      clearTimeout(this.timer)
    }

    this.timer = setTimeout(() => fn(...args), ms)
  }

const log = (...args) => console.log(`Args: ${args}`)

const debouncedLog = debounce(log, 2000)

debouncedLog(1, 2, 3)
debouncedLog(1, 2, 3)
debouncedLog(1, 2, 3)
// Args: 1, 2, 3 - один раз через 2 сек

// or
const debounce = (fn, ms) => {
  let id = null
  return (...args) => {
    clearTimeout(id)
    id = setTimeout(() => {
      clearTimeout(id)
      fn(...args)
    }, ms)
  }
}
```

### Throttle

```js
const throttle = (fn, ms) =>
  function (...args) {
    let prevCall = this.lastCall
    this.lastCall = Date.now()

    if (prevCall === undefined || this.lastCall - prevCall > ms) {
      fn(...args)
    }
  }

const log = (...args) => console.log(`Args: ${args}`)

const throttledLog = throttle(log, 2000)

throttledLog(1, 2, 3)
throttledLog(1, 2, 3)
throttledLog(1, 2, 3)
// Args: 1, 2, 3 - сразу и один раз
sleep(3000).then(() => {
  throttledLog(1, 2, 3)
  throttledLog(1, 2, 3)
})
// Args: 1, 2, 3 - через 3 секунды и один раз

// or
const throttle = (fn, ms) => {
  let id = null
  return (...args) => {
    if (id) return
    fn(...args)
    id = setTimeout(() => {
      clearTimeout(id)
      id = null
    }, ms)
  }
}
```

## DOM

### Копирование/вставка строки

```js
const copy = (text) => navigator.clipboard.writeText(text)

const paste = async (el) => {
  const text = await navigator.clipboard.readText()
  el.textContent = text
}
```

### Определение элемента, находящегося в фокусе

```js
const isFocused = (el) => el === document.activeElement
```

### Находится ли элемент в области просмотра?

```js
const isVisible = (el, part = false) => {
  const { top, left, bottom, right } = el.getBoundingClientRect()
  const { innerHeight, innerWidth } = window

  return part
    ? ((top > 0 && top < innerHeight) ||
        (bottom > 0 && bottom < innerHeight)) &&
        ((left > 0 && left < innerWidth) || (right > 0 && right < innerWidth))
    : top >= 0 && left >= 0 && bottom <= innerHeight && right <= innerWidth
}
```

### Переключение в полноэкранный режим

```js
const fullscreen = (el, mode = true) =>
  mode
    ? document.querySelector(el).requestFullscreen()
    : document.exitFullscreen()
```

### Определение величины прокрутки

```js
const getScrollPosition = (el = window) => ({
  x: el.pageXOffset !== undefined ? el.pageXOffset : el.scrollLeft,
  y: el.pageYOffset !== undefined ? el.pageYOffset : el.scrollTop
})
```

### Определение предпочтения пользователем темной цветовой темы (схемы)

```js
const isPrefersDark = () =>
  window &&
  window.matchMedia &&
  window.matchMedia('(prefers-color-scheme: dark)').matches
```

### Получение/установка стилей элемента

```js
const getStyle = (el, prop) => getComputedStyle(el)[prop]

const setStyle = (el, prop, val) => (el.style[prop] = val)
```

### Добавление стилей в виде объекта

```js
const setStyles = (el, styleObj) => {
  Object.assign(el.style, styleObj)
}
```

### Создание элемента с помощью шаблонных литералов

```js
const createElFromStr = (str) => {
  const el = document.createElement('div')
  el.innerHTML = str
  const child = el.fisrtElementChild
  el.remove()
  return child
}

const el = createElFromStr(
  `<div class="container">
    <p>Hi!</p>
  </div>`
)

console.log(el.className) // container

// or
const createElFromStr = (str) => {
  const parser = new DOMParser()
  const {
    body: { children }
  } = parser.parseFromString(str, 'text/html')
  return children[0]
}

// or
const createElFromStr = (str) => new Range().createContextualFragment(str)
```

### "Сериализация" формы - преобразование данных формы в строку

```js
const serializeForm = (form) =>
  Array.from(new FormData(form), (field) =>
    field.map(encodeURIComponent).join('=')
  ).join('&')
```

### Преобразование данных формы в объект

```js
const convertFormToObj = (form) =>
  Array.from(new FormData(form)).reduce(
    (acc, [key, val]) => ({
      ...acc,
      [key]: val
    }),
    {}
  )
```

```html
<form id="form">
  <div>
    <label for="name">Name</label>
    <input type="text" id="name" name="name" value="John" />
  </div>
  <div>
    <label for="age">Age</label>
    <input type="number" id="age" name="age" value="24" />
  </div>
  <button>Send</button>
</form>
```

```js
form.onsubmit = (e) => {
  e.preventDefault()

  const strData = serializeForm(form)
  const objData = convertFormToObj(form)

  console.log(strData) // name=John&age=24
  console.log(objData) // {name: 'John', age: '24'}
}
```

### Наблюдение за изменениями, происходящими в элементе

```js
const observeMutations = (el, cb, opt) => {
  const O = new MutationObserver((ms) => ms.forEach((m) => cb(m)))

  O.observe(
    el,
    Object.assign(
      {
        childList: true,
        attributes: true,
        attributeOldValue: true,
        characterData: true,
        characterDataOldValue: true,
        subtree: true
      },
      opt
    )
  )

  return O
}

observeMutations(document, console.log)
```

### Получение адресов изображений

```js
const getImgUrl = (el, dedupe = false) => {
  const urls = [...el.querySelectorAll('img')].map((i) => i.getAttribute('src'))
  return dedupe ? urls : [...new Set(urls)]
}
```

### Получение элементов по селектору

```js
const getOne = (selector, parent = document) => parent.querySelector(selector)

const getAll = (selector, parent = document) => [...parent.querySelectorAll(selector)]

const getEl = (selector, parent = document, all = false) => all ? [...parent.querySelectorAll(selector)] : parent.querySelector(selector)
```

### Скрытие/отображение элементов

```js
const hide = (val) => {
  const arr = typeof val === 'string' ? getAll(val) : [...val]
  arr.forEach((i) => {
    i.style.display = 'none'
  })
}

const show = (val) => {
  const arr = typeof val === 'string' ? getAll(val) : [...val]
  arr.forEach((i) => {
    i.style.display = ''
  })
}
```

### Определение завершения прокрутки

```js
const onScrollStop = (cb) => {
  let isScroll
  window.addEventListener(
    'scroll',
    () => {
      clearTimeout(isScroll)
      isScroll = setTimeout(() => {
        cb()
      }, 300)
    },
    false
  )
}
```

### Запуск функции при клике за пределами/внутри элемента

```js
const onClickOutside = (el, cb) => {
  document.addEventListener('click', ({ target }) => {
    if (!el.contains(target)) cb()
  })
}

const onClickInside = (el, cb) => {
  document.addEventListener('click', ({ target }) => {
    if (el.contains(target)) cb()
  })
}
```

### Запуск/остановка покадровой отрисовки

```js
const recordAnimFrames = (cb, auto = true) => {
  let isRun = false
  let raf
  const stop = () => {
    if (!isRun) return
    isRun = false
    cancelAnimationFrame(raf)
  }
  const run = () => {
    raf = requestAnimationFrame(() => {
      cb()
      if (isRun) run()
    })
  }
  const start = () => {
    if (isRun) return
    isRun = true
    run()
  }
  if (auto) start()
  return { start, stop }
}
```

### Определение наличия, добавление/удаление класса

```js
const hasClass = (el, str, part = false) =>
  !part ? el.classList.contains(str) : el.className.includes(str)

const addClass = (el, str, part = false) =>
  !part ? (el.className = str) : el.classList.add(str)

const removeClass = (el, str, part = false) =>
  !part ? (el.className = '') : el.classList.remove(str)
```

### Обеззараживание и восстановление HTML

```js
const escapeHtml = (str) =>
  str.replace(
    /[&<>'"]/g,
    (tag) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
  )

escapeHtml('<a href="#">React & TypeScript</a>')
// '&lt;a href=&quot;#&quot;&gt;React &amp; TypeScript&lt;/a&gt;'

const unescapeHtml = (str) =>
  str.replace(
    /&amp;|&lt;|&gt;|&#39;|&quot;/g,
    (tag) =>
      ({
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&#39;': "'",
        '&quot;': '"'
      }[tag] || tag)
  )

unescapeHtml('&lt;a href=&quot;#&quot;&gt;React &amp; TypeScript&lt;/a&gt;')
// '<a href="#">React & TypeScript</a>'
```

## Разное

### Получение базового URL

```js
const getBaseURL = (url) => url.replace(/[?#].+/, '')

getBaseURL('http://example.com?name=John#anchor')
// http://example.com
```

### Перенаправление с HTTP на HTTPS

```js
const redirect = () => {
  if (window.location.protocol !== 'https:')
    window.location.replace('https://' + window.location.href.split('//')[1])
}
```

### Получение параметров строки запроса

```js
const searchParams = Object.fromEntries(
  new URLSearchParams(window.location.search).entries()
)

// ?name=John&age=24
console.log(searchParams)
// {name: 'John', age: '24'}
```

### Генерация URL

```js
const generateURL = (...args) =>
  args
    .join('/')
    .replace(/[\/]+/g, '/')
    .replace(/^(.+):\//, '$1://')
    .replace(/^file:/, 'file:/')
    .replace(/\/(\?|&|#[^!])/g, '$1')
    .replace(/\?/g, '&')
    .replace('&', '?')

const url = generateURL(
  'https://example.com',
  'a',
  '/b/cd',
  '?foo=1',
  '?bar=qux'
)
console.log(url)
// https://example.com/a/b/cd?foo=1&bar=qux
```

### Получение случайного HEX и RGBA цветов

```js
const getRandomHexColor = () =>
  `#${((Math.random() * 0xffffff) << 0).toString(16)}`

// 2
const getRandomRGBAColor = (opacity) => {
  const random = () => ~~(Math.random() * 255)
  return `rgba(${random()}, ${random()}, ${random()}, ${opacity})`
}
```

### Преобразование RGB в HEX

```js
const RGBToHex = (r, g, b) =>
  `#${((r << 16) + (g << 8) + b).toString(16).padStart(6, '0')}`

RGBToHex(255, 165, 1) // '#ffa501'
```

### Генерация уникального ID

```js
const getRandomStr = (length) =>
  Math.random().toString(36).slice(2).slice(0, length)
// 10 | 11 characters

// ensuring uniqueness
const memo = (fn) => {
  const cache = new Set()

  return function inner() {
    let res = fn()

    if (!isNaN(res[0])) {
      res = 'x' + res.slice(1)
    }

    if (cache.has(res)) {
      return inner()
    } else {
      cache.add(res)
      return res
    }
  }
}

const getUniqueID = memo(getRandomStr)

const id = getUniqueID()
console.log(id) // j34omfv6jk
```

### Генерация UUID

```js
const genUUID = () =>
  ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  )

genUUID() // 7982fcfe-5721-4632-bede-6000885be57d
```

### Определение разницы между датами в днях

```js
const getDaysBetween = (date1, date2) =>
  Math.ceil(Math.abs(date1.getTime() - date2.getTime()) / 86400000)

getDaysBetween(new Date('2021-02-06'), new Date('2021-02-08')) // 2
```

### Прибавление/вычитание дней

```js
const changeDay = (d, n) => {
  d.setDate(d.getDate() + n)
}

const today = new Date()
console.log(today)
// Sat Oct 16 2021...

changeDay(today, 2)

console.log(today.toLocaleDateString())
// 18.10.2021
```

### Разбор куки

```js
const parseCookie = (str) =>
  str
    .split(';')
    .map((v) => v.split('='))
    .reduce((acc, cur) => {
      acc[decodeURIComponent(cur[0].trim())] = decodeURIComponent(cur[1].trim())
      return acc
    }, {})

parseCookie('foo=bar; equation=E%3Dmc%5E2')
// { foo: "bar", equation: "E=mc^2" }
```

### Публикация/подписка

```js
const pubSub = (subscribers = []) => ({
  publish: ({ message, sender }) => {
    subscribers.forEach(({ name }) => {
      console.log(`${name} get ${message} from ${sender}`)
    })
  },
  subscribe: (subscriber) => {
    subscribers.push(subscriber)
  }
})

const pubSubObj = pubSub()

pubSubObj.subscribe({ name: 'John' })
pubSubObj.subscribe({ name: 'Jane' })

pubSubObj.publish({ message: 'Hi', sender: 'Bob' })
// John get Hi from Bob
// Jane get Hi from Bob
```

### "Шина" событий

```js
const createEventHub = () => ({
  hub: Object.create(null),
  emit(e, d) {
    ;(this.hub[e] || []).forEach((h) => h(d))
  },
  on(e, h) {
    if (!this.hub[e]) this.hub[e] = []
    this.hub[e].push(h)
  },
  off(e, h) {
    const i = (this.hub[e] || []).findIndex((handler) => handler === h)
    if (i > -1) this.hub[e].splice(i, 1)
    if (this.hub[e].length === 0) delete this.hub[e]
  }
})
```

### Разбор и подсветка синтаксиса JS или JSON-объекта

```js
const parseAndHighlightObj = (obj) => {
  const inner = (_obj) =>
    Object.entries(_obj).map(([key, value]) => {
      let type = typeof value

      const isSimpleValue =
        ['string', 'number', 'boolean'].includes(type) || !value

      if (isSimpleValue && type === 'object') {
        type = 'null'
      }

      return `
        <div class="line">
          <span class="key">${key}:</span>
          ${
            isSimpleValue
              ? `<span class="${type}">${value}</span>`
              : inner(value)
          }
        </div>
      `
    }).join('')

  return `<div class="obj">${inner(obj)}</div>`
}

const result = parseAndHighlightObj({
  a: 1,
  b: {
    c: {
      d: 'foo'
    }
  },
  2: {
    3: true
  }
})

document.body.innerHTML = result
```

```css
.obj {
  padding: 1rem;
  background-color: #3c3c3c;
  border-radius: 4px;
  color: #f0f0f0;
}

.line {
  margin-left: 1rem;
}

.line > .line {
  margin-left: 1rem;
}

.key {
  font-style: italic;
}

.number {
  color: lightblue;
}

.string {
  color: lightcoral;
}

.boolean {
  color: lightgreen;
}
```

### Получение, разбор и преобразование в таблицу данных из CSV-файла

```js
const parseCsv = (csvStr) => {
  const arr = csvStr.split('\n')

  const headers = arr.splice(0, 1)[0].split(',')

  const rows = arr.map((item) =>
    item.split(',').reduce((a, c, i) => {
      a[headers[i]] = c
      return a
    }, {})
  )

  return { headers, rows }
}

const createTable = ({ headers, rows }) => {
  headers = [...headers, 'Color']

  return /*html*/ `
  <table>
    <thead>
      <tr>
        ${headers.map((h) => /*html*/ `<th>${h}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      ${rows
        .map((v) => {
          const { Specification, Keyword, 'RGB hex value': hex } = v
          return /*html*/ `
            <tr>
              <td>${Specification}</td>
              <td>${Keyword}</td>
              <td>${hex}</td>
              <td style="background-color: ${hex};"></td>
            </tr>
          `
        })
        .join('')}
    </tbody>
  </table>
  `
}

const fetchCsv = async (url) => {
  let csvData = { headers: [], rows: [] }
  try {
    const response = await fetch(url)
    if (response.ok) {
      const csvStr = await response.text()
      csvData = parseCsv(csvStr)
    }
  } catch (e) {
    console.error(e)
  } finally {
    return csvData
  }
}

const CSSColorNamesCsvUrl =
  'https://gist.githubusercontent.com/curran/b236990081a24761f7000567094914e0/raw/cssNamedColors.csv'

fetchCsv(CSSColorNamesCsvUrl).then((csvData) => {
  const tableTemplate = createTable(csvData)

  document.body.insertAdjacentHTML('beforeend', tableTemplate)
})
```

### Рендеринг шаблонных строк и получение DOM-дерева

```js
// components
const Form = () => /*html*/ `
  <form class="form">
    <input type="text" class="input" />
    <button class="btn btn-add">Add</button>
  </form>
`

const List = (todos) => /*html */ `
  <ul class="list">
    ${todos.map(Item).join('')}
  </ul>
`

const Item = (todo) => /*html*/ `
  <li class="item">
    <input type="checkbox" ${todo.done ? 'checked' : ''} class="checkbox" />
    <span class="text" style="${
      todo.done ? 'text-decoration: line-through' : ''
    }">${todo.text}</span>
    <button class="btn remove">Remove</button>
  </li>
`

// data
const todos = [
  {
    id: '1',
    text: 'Eat',
    done: true,
    edit: false
  },
  {
    id: '2',
    text: 'Code',
    done: true,
    edit: true
  },
  {
    id: '3',
    text: 'Sleep',
    done: false,
    edit: false
  },
  {
    id: '4',
    text: 'Repeat',
    done: false,
    edit: true
  }
]

// root
const App = () => /*html */ `
  <div class="app">
    ${Form()}
    ${List(todos)}
  </div>
`

const createElFromStr = (str) => new Range().createContextualFragment(str)

const render = (root, fn) => {
  root.append(createElFromStr(fn()))
}

render(document.body, App)

const getDOMTree = (root) =>
  [...root.children].reduce((obj, el) => {
    const key = el.localName
    obj[key] = { el }

    if (el.hasAttributes()) {
      const attributes = el.getAttributeNames()
      obj[key]['attributes'] = attributes.reduce((obj, attr) => {
        obj[attr] = el.getAttribute(attr)
        return obj
      }, {})
    }

    if (el.children.length > 0) {
      obj[key]['children'] = getDOMTree(el)
    }
    return obj
  }, {})

const DOMTree = getDOMTree(document.querySelector('.app'))
console.log(DOMTree)
```