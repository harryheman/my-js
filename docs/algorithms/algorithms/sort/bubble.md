---
sidebar_position: 2
title: Сортировка пузырьком
description: Сортировка пузырьком
keywords: ['javascript', 'js', 'algorithms', 'алгоритмы']
tags: ['javascript', 'js', 'algorithms', 'алгоритмы']
---

# Сортировка пузырьком

__Описание__

- [Википедия](https://ru.wikipedia.org/wiki/%D0%A1%D0%BE%D1%80%D1%82%D0%B8%D1%80%D0%BE%D0%B2%D0%BA%D0%B0_%D0%BF%D1%83%D0%B7%D1%8B%D1%80%D1%8C%D0%BA%D0%BE%D0%BC)
- [YouTube](https://www.youtube.com/watch?v=XXHFjKaIlHI)
- [Визуализация](https://www.youtube.com/watch?v=nmhjrI-aW5o)
- [GitHub](https://github.com/harryheman/algorithms-data-structures/blob/main/src/algorithms/sorting/bubble-sort.js)

Пузырьковая сортировка (bubble sort) - это простой алгоритм сортировки, который перебирает список, сравнивает пары соседних элементов и меняет их местами при необходимости. Перебор списка повторяется до тех пор, пока все элементы не будут расположены в правильном порядке.

<img src="https://habrastorage.org/webt/eg/6g/vc/eg6gvcp2nf27et5sszaqm5hqnyo.gif" />
<br />

_Сложность_

| Лучшее | Среднее | Худшее | Память | Стабильность |
|--------|---------|--------|--------|--------------|
| n      | n^2     | n^2    | 1      | Да           |

__Реализация__

Начнем с реализации суперкласса сортировки:

```javascript
// algorithms/sorting/sort.js
import Comparator from '../../utils/comparator'

export default class Sort {
  constructor(originalCallbacks) {
    // Коллбэки сортировки
    this.callbacks = Sort.initSortingCallbacks(originalCallbacks)
    // Функция сравнения элементов
    this.comparator = new Comparator(this.callbacks.compareCallback)
  }

  // Коллбэки сортировки
  static initSortingCallbacks(originalCallbacks) {
    const callbacks = originalCallbacks || {}
    const stubCallback = () => {}

    // Вызывается при сравнении элементов
    callbacks.compareCallback = callbacks.compareCallback || undefined
    // Вызывается при посещении элемента
    callbacks.visitingCallback = callbacks.visitingCallback || stubCallback

    return callbacks
  }

  // Метод сортировки реализуется подклассом
  sort() {
    throw new Error('Метод сортировки не реализован')
  }
}
```

Напомню, как выглядит класс `Comparator`:

```javascript
// utils/comparator.js
export default class Comparator {
  constructor(fn) {
    this.compare = fn || Comparator.defaultCompare
  }

  // Дефолтная функция сравнения узлов
  static defaultCompare(a, b) {
    if (a === b) {
      return 0
    }
    return a < b ? -1 : 1
  }

  // Проверка на равенство
  equal(a, b) {
    return this.compare(a, b) === 0
  }

  // Меньше чем
  lessThan(a, b) {
    return this.compare(a, b) < 0
  }

  // Больше чем
  greaterThan(a, b) {
    return this.compare(a, b) > 0
  }

  // Меньше или равно
  lessThanOrEqual(a, b) {
    return this.lessThan(a, b) || this.equal(a, b)
  }

  // Больше или равно
  greaterThanOrEqual(a, b) {
    return this.greaterThan(a, b) || this.equal(a, b)
  }

  // Инверсия сравнения
  reverse() {
    const original = this.compare
    this.compare = (a, b) => original(b, a)
  }
}
```

Реализуем подкласс сортировки пузырьком:

```javascript
// algorithms/sorting/bubble-sort.js
import Sort from './sort'

export default class BubbleSort extends Sort {
  sort(arr) {
    // Индикатор перестановки элементов массива
    let swapped = false
    // Копируем оригинальный массив во избежание его модификации
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/structuredClone
    const _arr = structuredClone(arr)

    // Перебираем все элементы массива, начиная со второго
    for (let i = 1; i < _arr.length; i++) {
      swapped = false

      this.callbacks.visitingCallback(_arr[i])

      // Обратите внимание, что здесь мы двигаемся до `i`
      for (let j = 0; j < _arr.length - i; j++) {
        this.callbacks.visitingCallback(_arr[j])

        // Меняем элементы местами, если они расположены в неправильном порядке
        if (this.comparator.lessThan(_arr[j + 1], _arr[j])) {
          ;[_arr[j], _arr[j + 1]] = [_arr[j + 1], _arr[j]]

          // Обновляем индикатор
          swapped = true
        }
      }

      // Это означает, что массив отсортирован
      if (!swapped) {
        return _arr
      }
    }

    return _arr
  }
}
```

__Тестирования__

Создадим несколько тестовых массивов и вспомогательный класс для тестирования:

```javascript
// algorithms/sorting/sort-tester.js
export const sortedArr = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
]
export const reverseArr = [
  20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1,
]
export const notSortedArr = [
  15, 8, 5, 12, 10, 1, 16, 9, 11, 7, 20, 3, 2, 6, 17, 18, 4, 13, 14, 19,
]
export const equalArr = [
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
]
export const negativeArr = [-1, 0, 5, -10, 20, 13, -7, 3, 2, -3]
export const negativeArrSorted = [-10, -7, -3, -1, 0, 2, 3, 5, 13, 20]

export class SortTester {
  // Проверяет корректность сортировки
  // с помощью переданного метода (класса) сортировки
  static testSort(SortingClass) {
    const sorter = new SortingClass()

    expect(sorter.sort([])).toEqual([])
    expect(sorter.sort([1])).toEqual([1])
    expect(sorter.sort([1, 2])).toEqual([1, 2])
    expect(sorter.sort([2, 1])).toEqual([1, 2])
    expect(sorter.sort([3, 4, 2, 1, 0, 0, 4, 3, 4, 2])).toEqual([
      0, 0, 1, 2, 2, 3, 3, 4, 4, 4,
    ])
    expect(sorter.sort(sortedArr)).toEqual(sortedArr)
    expect(sorter.sort(reverseArr)).toEqual(sortedArr)
    expect(sorter.sort(notSortedArr)).toEqual(sortedArr)
    expect(sorter.sort(equalArr)).toEqual(equalArr)
  }

  // Проверяет корректность сортировки отрицательных чисел
  static testNegativeNumbersSort(SortingClass) {
    const sorter = new SortingClass()
    expect(sorter.sort(negativeArr)).toEqual(negativeArrSorted)
  }

  // Проверяет корректность сортировки
  // с помощью кастомной функции сравнения элементов
  static testSortWithCustomComparator(SortingClass) {
    const callbacks = {
      compareCallback: (a, b) => {
        if (a.length === b.length) {
          return 0
        }
        return a.length < b.length ? -1 : 1
      },
    }

    const sorter = new SortingClass(callbacks)

    expect(sorter.sort([''])).toEqual([''])
    expect(sorter.sort(['a'])).toEqual(['a'])
    expect(sorter.sort(['aa', 'a'])).toEqual(['a', 'aa'])
    expect(sorter.sort(['aa', 'q', 'bbbb', 'ccc'])).toEqual([
      'q',
      'aa',
      'ccc',
      'bbbb',
    ])
    expect(sorter.sort(['aa', 'aa'])).toEqual(['aa', 'aa'])
  }

  // Проверяет стабильность сортировки
  static testSortStability(SortingClass) {
    const callbacks = {
      compareCallback: (a, b) => {
        if (a.length === b.length) {
          return 0
        }
        return a.length < b.length ? -1 : 1
      },
    }

    const sorter = new SortingClass(callbacks)

    expect(sorter.sort(['bb', 'aa', 'c'])).toEqual(['c', 'bb', 'aa'])
    expect(sorter.sort(['aa', 'q', 'a', 'bbbb', 'ccc'])).toEqual([
      'q',
      'a',
      'aa',
      'ccc',
      'bbbb',
    ])
  }

  // Проверяет временную сложность сортировки
  static testAlgorithmTimeComplexity(
    SortingClass,
    arrayToBeSorted,
    numberOfVisits,
  ) {
    const visitingCallback = jest.fn()
    const callbacks = { visitingCallback }
    const sorter = new SortingClass(callbacks)

    sorter.sort(arrayToBeSorted)

    expect(visitingCallback).toHaveBeenCalledTimes(numberOfVisits)
  }
}
```

Тестируем пузырьковую сортировку:

```javascript
// algorithms/sorting/__tests__/bubble-sort.test.js
import BubbleSort from '../bubble-sort'
import {
  equalArr,
  notSortedArr,
  reverseArr,
  sortedArr,
  SortTester,
} from '../sort-tester'

// Константы временной сложности
const SORTED_ARRAY_VISITING_COUNT = 20
const NOT_SORTED_ARRAY_VISITING_COUNT = 189
const REVERSE_SORTED_ARRAY_VISITING_COUNT = 209
const EQUAL_ARRAY_VISITING_COUNT = 20

describe('BubbleSort', () => {
  it('должен отсортировать массив', () => {
    SortTester.testSort(BubbleSort)
  })

  it('должен отсортировать массив с помощью кастомной функции сравнения элементов', () => {
    SortTester.testSortWithCustomComparator(BubbleSort)
  })

  it('должен выполнить стабильную сортировку', () => {
    SortTester.testSortStability(BubbleSort)
  })

  it('должен отсортировать отрицательные числа', () => {
    SortTester.testNegativeNumbersSort(BubbleSort)
  })

  it('должен посетить элементы массива одинаковых элементов указанное количество раз', () => {
    SortTester.testAlgorithmTimeComplexity(
      BubbleSort,
      equalArr,
      EQUAL_ARRAY_VISITING_COUNT,
    )
  })

  it('должен посетить элементы отсортированного массива указанное количество раз', () => {
    SortTester.testAlgorithmTimeComplexity(
      BubbleSort,
      sortedArr,
      SORTED_ARRAY_VISITING_COUNT,
    )
  })

  it('должен посетить элементы неотсортированного массив указанное количество раз', () => {
    SortTester.testAlgorithmTimeComplexity(
      BubbleSort,
      notSortedArr,
      NOT_SORTED_ARRAY_VISITING_COUNT,
    )
  })

  it('должен посетить элементы инвертированного отсортированного массива указанное количество раз', () => {
    SortTester.testAlgorithmTimeComplexity(
      BubbleSort,
      reverseArr,
      REVERSE_SORTED_ARRAY_VISITING_COUNT,
    )
  })
})
```

Запускаем тесты:

```bash
npm run test ./algorithms/sorting/__tests__/bubble-sort
```

<img src="https://habrastorage.org/webt/82/wy/b8/82wyb8ki_-dajodgnzgsigef3fi.png" />
