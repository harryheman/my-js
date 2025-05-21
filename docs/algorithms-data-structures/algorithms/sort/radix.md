---
sidebar_position: 10
title: Поразрядная сортировка
description: Поразрядная сортировка
keywords: ['javascript', 'js', 'algorithms', 'алгоритмы']
tags: ['javascript', 'js', 'algorithms', 'алгоритмы']
---

# Поразрядная сортировка

__Описание__

- [Википедия](https://ru.wikipedia.org/wiki/%D0%9F%D0%BE%D1%80%D0%B0%D0%B7%D1%80%D1%8F%D0%B4%D0%BD%D0%B0%D1%8F_%D1%81%D0%BE%D1%80%D1%82%D0%B8%D1%80%D0%BE%D0%B2%D0%BA%D0%B0)
- [YouTube](https://www.youtube.com/watch?v=DOM5ZHnf3Gw)
- [Визуализация](https://www.youtube.com/watch?v=nu4gDuFabIM)
- [GitHub](https://github.com/harryheman/algorithms-data-structures/blob/main/src/algorithms/sorting/radix-sort.js)

Поразрядная сортировка (radix sort) - это алгоритм сортировки, который выполняется за линейное время и предназначен для сортировки целых чисел, записанных цифрами. Однако поскольку в памяти компьютера любая информация представлена целыми числами, алгоритм пригоден для сортировки любых объектов, запись которых можно поделить на "разряды", например, строки и другие данные, которые можно преобразовать в набор байтов.

Сравнение производится поразрядно: сначала сравниваются значения крайнего разряда, и элементы группируются по результатам этого сравнения, затем сравниваются значения следующего разряда, соседнего, и элементы либо упорядочиваются по результатам сравнения значений этого разряда внутри образованных на предыдущем проходе групп, либо переупорядочиваются в целом, но сохраняя относительный порядок, достигнутый при предыдущей сортировке. Затем тоже самое делается для следующего разряда и т.д.

Выравнивать сравниваемые записи относительно друг друга можно в разную сторону, поэтому на практике существуют два варианта этой сортировки. Для чисел они называются в терминах значимости разрядов числа, и получается так: можно выровнять записи чисел в сторону менее значащих цифр (по правой стороне, в сторону единиц - LSD от least significant digit) или более значащих цифр (по левой стороне, со стороны более значащих разрядов - MSD от most significant digit).

При LSD-сортировке получается порядок, уместный для чисел. Например: 1, 2, 9, 10, 21, 100, 200, 201, 202, 210. Здесь значения сначала сортируются по единицам, затем по десяткам, сохраняя упорядоченность по единицам внутри десятков, затем по сотням, сохраняя упорядоченность по десяткам и единицам внутри сотен, и т.д.

При MSD-сортировке получается алфавитный порядок, который уместен для сортировки строк. Например "b, c, d, e, f, g, h, i, j, ba" отсортируется как "b, ba, c, d, e, f, g, h, i, j". Если MSD применить к числам, то получится алфавитный, а не числовой порядок: 1, 10, 100, 2, 200, 201, 202, 21, 210, 9.

_Сложность_

| Лучшее | Среднее | Худшее | Память | Стабильность | Комментарии                         |
|--------|---------|--------|--------|--------------|-------------------------------------|
| n * k  | n * k   | n * k  | n + k  | Да           | k - это длина самого длинного ключа |

<img src="https://habrastorage.org/webt/er/sz/rs/erszrszsth66hywpbjub6ocbn_e.png" />
<br />

__Реализация__

Приступаем к реализации алгоритма:

```javascript
// algorithms/sorting/radix-sort.js
import Sort from './sort'

// `charCode` (кодовая единица UTF-16) (a = 97, b = 98 и т.д.) позволяет
// привязывать символы к группам от 0 до 25 (в английском алфавите 26 букв)
const BASE_CHAR_CODE = 97
// 0-9
const NUMBER_OF_POSSIBLE_DIGITS = 10
// a-z
const ENGLISH_ALPHABET_LENGTH = 26

export default class RadixSort extends Sort {
  sort(arr) {
    // Все элементы массива должны иметь одинаковый тип
    const isArrayOfNumbers = this.isArrayOfNumbers(arr)

    // Копируем оригинальный массив во избежание его модификации
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/structuredClone
    let sortedArr = structuredClone(arr)
    // Определяем нужное количество итераций
    const numPasses = this.determineNumPasses(sortedArr)

    // Формируем сегменты
    for (let i = 0; i < numPasses; i++) {
      const buckets = isArrayOfNumbers
        ? this.placeItemsInNumBucket(sortedArr, i)
        : this.placeItemsInCharBucket(sortedArr, i, numPasses)

      // Распаковываем сегменты
      sortedArr = buckets.flat()
    }

    return sortedArr
  }
}
```

Метод `isArrayOfNumbers` определяет тип элементов массива (числа или строки), а метод `determineNumPasses` - необходимое количество итераций:

```javascript
// Количество итераций определяется длиной самого длинного элемента массива.
// Для целых чисел - это `log10(num)`, для строк - длина строки
determineNumPasses(arr) {
  if (this.isArrayOfNumbers(arr)) {
    return Math.floor(Math.log10(Math.max(...arr))) + 1
    // return Math.max(...arr.map((i) => i.toString().length))
  }

  return Math.max(...arr.map((i) => i.length))
}

isArrayOfNumbers(arr) {
  return Number.isInteger(arr[0])
}
```

Метод формирования числового сегмента:

```javascript
placeItemsInNumBucket(arr, index) {
  // Это используется ниже для определения группы,
  // к которой принадлежит число
  const modded = 10 ** (index + 1)
  const divided = 10 ** index
  const buckets = this.createBuckets(NUMBER_OF_POSSIBLE_DIGITS)

  arr.forEach((item) => {
    this.callbacks.visitingCallback(item)

    if (item < divided) {
      buckets[0].push(item)
    } else {
      // Допустим, у нас есть элемент `1052` и текущий индекс `1` (начиная с `0`). Это означает,
      // что мы хотим использовать `5` как группу. `modded` будет равняться `10 ** (1 + 1)`
      // или `100`. Поэтому мы берем `1052 % 100 (52)`, делим на `10 (5.2)` и округляем до `5`
      const currentDigit = Math.floor((item % modded) / divided)
      buckets[currentDigit].push(item)
    }
  })

  return buckets
}
```

Метод создания сегмента:

```javascript
createBuckets(size) {
  return new Array(size).fill().map(() => [])
}
```

Методы формирования строкового сегмента и получения кодовой единицы символа:

```javascript
placeItemsInCharBucket(arr, index, numPasses) {
  const buckets = this.createBuckets(ENGLISH_ALPHABET_LENGTH)

  arr.forEach((item) => {
    this.callbacks.visitingCallback(item)
    const currentBucket = this.getCharCodeOfItemAtIndex(
      item,
      index,
      numPasses,
    )
    buckets[currentBucket].push(item)
  })

  return buckets
}

getCharCodeOfItemAtIndex(item, index, numPasses) {
  // Помещаем элемент в последнюю группу,
  // если он не готов к упорядочиванию
  if (numPasses - index > item.length) {
    return ENGLISH_ALPHABET_LENGTH - 1
  }

  // Если каждый символ упорядочен, используем первый символ для определения группы,
  // иначе, перебираем символы в обратном порядке
  const charPos = index > item.length - 1 ? 0 : item.length - index - 1

  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/charCodeAt
  return item.toLowerCase().charCodeAt(charPos) - BASE_CHAR_CODE
}
```

<spoiler title="Полный код алгоритма:">

```javascript
import Sort from './sort'

// `charCode` (кодовая единица UTF-16) (a = 97, b = 98 и т.д.) позволяет
// привязывать символы к группам от 0 до 25 (в английском алфавите 26 букв)
const BASE_CHAR_CODE = 97
// 0-9
const NUMBER_OF_POSSIBLE_DIGITS = 10
// a-z
const ENGLISH_ALPHABET_LENGTH = 26

export default class RadixSort extends Sort {
  sort(arr) {
    // Все элементы массива должны иметь одинаковый тип
    const isArrayOfNumbers = this.isArrayOfNumbers(arr)

    // Копируем оригинальный массив во избежание его модификации
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/structuredClone
    let sortedArr = structuredClone(arr)
    // Определяем нужное количество итераций
    const numPasses = this.determineNumPasses(sortedArr)

    // Формируем сегменты
    for (let i = 0; i < numPasses; i++) {
      const buckets = isArrayOfNumbers
        ? this.placeItemsInNumBucket(sortedArr, i)
        : this.placeItemsInCharBucket(sortedArr, i, numPasses)

      // Распаковываем сегменты
      sortedArr = buckets.flat()
    }

    return sortedArr
  }

  placeItemsInNumBucket(arr, index) {
    // Это используется ниже для определения группы,
    // к которой принадлежит число
    const modded = 10 ** (index + 1)
    const divided = 10 ** index
    const buckets = this.createBuckets(NUMBER_OF_POSSIBLE_DIGITS)

    arr.forEach((item) => {
      this.callbacks.visitingCallback(item)

      if (item < divided) {
        buckets[0].push(item)
      } else {
        // Допустим, у нас есть элемент `1052` и текущий индекс `1` (начиная с `0`). Это означает,
        // что мы хотим использовать `5` как группу. `modded` будет равняться `10 ** (1 + 1)`
        // или `100`. Поэтому мы берем `1052 % 100 (52)`, делим на `10 (5.2)` и округляем до `5`
        const currentDigit = Math.floor((item % modded) / divided)
        buckets[currentDigit].push(item)
      }
    })

    return buckets
  }

  placeItemsInCharBucket(arr, index, numPasses) {
    const buckets = this.createBuckets(ENGLISH_ALPHABET_LENGTH)

    arr.forEach((item) => {
      this.callbacks.visitingCallback(item)
      const currentBucket = this.getCharCodeOfItemAtIndex(
        item,
        index,
        numPasses,
      )
      buckets[currentBucket].push(item)
    })

    return buckets
  }

  getCharCodeOfItemAtIndex(item, index, numPasses) {
    // Помещаем элемент в последнюю группу,
    // если он не готов к упорядочиванию
    if (numPasses - index > item.length) {
      return ENGLISH_ALPHABET_LENGTH - 1
    }

    // Если каждый символ упорядочен, используем первый символ для определения группы,
    // иначе, перебираем символы в обратном порядке
    const charPos = index > item.length - 1 ? 0 : item.length - index - 1

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/charCodeAt
    return item.toLowerCase().charCodeAt(charPos) - BASE_CHAR_CODE
  }

  // Количество итераций определяется длиной самого длинного элемента массива.
  // Для целых чисел - это `log10(num)`, для строк - длина строки
  determineNumPasses(arr) {
    if (this.isArrayOfNumbers(arr)) {
      return Math.floor(Math.log10(Math.max(...arr))) + 1
      // return Math.max(...arr.map((i) => i.toString().length))
    }

    return Math.max(...arr.map((i) => i.length))
  }

  isArrayOfNumbers(arr) {
    return Number.isInteger(arr[0])
  }

  createBuckets(size) {
    return new Array(size).fill().map(() => [])
  }
}
```

</spoiler>

__Тестирование__

```javascript
// algorithms/sorting/__tests__/radix-sort.test.js
import RadixSort from '../radix-sort'
import { SortTester } from '../sort-tester'

// Константы временной сложности
const ARRAY_OF_STRINGS_VISIT_COUNT = 24
const ARRAY_OF_INTEGERS_VISIT_COUNT = 77

describe('RadixSort', () => {
  it('должен отсортировать массивы', () => {
    SortTester.testSort(RadixSort)
  })

  it('должен посетить массив строк `n (количество строк) x m (длина самой длинной строки)` раз', () => {
    SortTester.testAlgorithmTimeComplexity(
      RadixSort,
      ['zzz', 'bb', 'a', 'rr', 'rrb', 'rrba'],
      ARRAY_OF_STRINGS_VISIT_COUNT,
    )
  })

  it('должен посетить массив целых чисел `n (количество чисел) x m (длина самого длинного числа)` раз', () => {
    SortTester.testAlgorithmTimeComplexity(
      RadixSort,
      [3, 1, 75, 32, 884, 523, 4343456, 232, 123, 656, 343],
      ARRAY_OF_INTEGERS_VISIT_COUNT,
    )
  })
})
```

Запускаем тесты:

```bash
npm run test ./algorithms/sorting/__tests__/radix-sort
```

<img src="https://habrastorage.org/webt/uv/p5/wl/uvp5wledcyci0u7bmct9g6n0lnw.png" />
