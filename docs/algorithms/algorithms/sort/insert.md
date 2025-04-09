---
sidebar_position: 4
title: Сортировка вставками
description: Сортировка вставками
keywords: ['javascript', 'js', 'algorithms', 'алгоритмы']
tags: ['javascript', 'js', 'algorithms', 'алгоритмы']
---

# Сортировка вставками

__Описание__

- [Википедия](https://ru.wikipedia.org/wiki/%D0%A1%D0%BE%D1%80%D1%82%D0%B8%D1%80%D0%BE%D0%B2%D0%BA%D0%B0_%D0%B2%D1%81%D1%82%D0%B0%D0%B2%D0%BA%D0%B0%D0%BC%D0%B8)
- [YouTube](https://www.youtube.com/watch?v=SIrdTFF8-4s)
- [Визуализация](https://www.youtube.com/watch?v=OGzPmgsI-pQ)
- [GitHub](https://github.com/harryheman/algorithms-data-structures/blob/main/src/algorithms/sorting/insertion-sort.js)

Сортировка вставками (insertion sort) - это простой алгоритм сортировки, в котором элементы списка просматриваются по одному, и каждый новый поступивший элемент размещается в подходящее место среди ранее упорядоченных элементов.

<img src="https://habrastorage.org/webt/wa/em/oi/waemoiprtiiev3wxqap9qdgpsmy.gif" />
<br />

<img src="https://habrastorage.org/webt/1r/7_/ep/1r7_ep_plmt7m-d3l25ooj1q-le.gif" />
<br />

_Сложность_

| Лучшее | Среднее | Худшее | Память | Стабильность |
|--------|---------|--------|--------|--------------|
| n      | n^2     | n^2    | 1      | Да           |

__Реализация__

```javascript
// algorithms/sorting/insertion-sort.js
import Sort from './sort'

export default class InsertionSort extends Sort {
  sort(arr) {
    // Копируем оригинальный массив во избежание его модификации
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/structuredClone
    const _arr = structuredClone(arr)

    // Перебираем все элементы массива, начиная со второго
    for (let i = 1; i < _arr.length; i++) {
      this.callbacks.visitingCallback(_arr[i])

      let currentIndex = i

      // Цикл выполняется до тех пор,
      // пока у нас имеется предыдущий элемент и
      // текущий элемент меньше предыдущего
      // (левый элемент больше правого)
      while (
        _arr[currentIndex - 1] !== undefined &&
        this.comparator.lessThan(_arr[currentIndex], _arr[currentIndex - 1])
      ) {
        this.callbacks.visitingCallback(_arr[currentIndex - 1])
        // Меняем элементы местами
        ;[_arr[currentIndex - 1], _arr[currentIndex]] = [
          _arr[currentIndex],
          _arr[currentIndex - 1],
        ]

        // Двигаемся влево
        currentIndex--
      }
    }

    return _arr
  }
}
```

__Тестирование__

```javascript
// algorithms/sorting/__tests__/insertion-sort.test.js
import InsertionSort from '../insertion-sort'
import {
  equalArr,
  notSortedArr,
  reverseArr,
  sortedArr,
  SortTester,
} from '../sort-tester'

// Константы временной сложности
const SORTED_ARRAY_VISITING_COUNT = 19
const NOT_SORTED_ARRAY_VISITING_COUNT = 100
const REVERSE_SORTED_ARRAY_VISITING_COUNT = 209
const EQUAL_ARRAY_VISITING_COUNT = 19

describe('InsertionSort', () => {
  it('должен отсортировать массив', () => {
    SortTester.testSort(InsertionSort)
  })

  it('должен отсортировать массив с помощью кастомной функции сравнения', () => {
    SortTester.testSortWithCustomComparator(InsertionSort)
  })

  it('должен выполнить стабильную сортировку', () => {
    SortTester.testSortStability(InsertionSort)
  })

  it('должен отсортировать отрицательные числа', () => {
    SortTester.testNegativeNumbersSort(InsertionSort)
  })

  it('должен посетить элементы массива одинаковых элементов указанное количество раз', () => {
    SortTester.testAlgorithmTimeComplexity(
      InsertionSort,
      equalArr,
      EQUAL_ARRAY_VISITING_COUNT,
    )
  })

  it('должен посетить элементы отсортированного массива указанное количество раз', () => {
    SortTester.testAlgorithmTimeComplexity(
      InsertionSort,
      sortedArr,
      SORTED_ARRAY_VISITING_COUNT,
    )
  })

  it('должен посетить элементы неотсортированного массива указанное количество раз', () => {
    SortTester.testAlgorithmTimeComplexity(
      InsertionSort,
      notSortedArr,
      NOT_SORTED_ARRAY_VISITING_COUNT,
    )
  })

  it('должен посетить элементы инвертированного отсортированного массива указанное количество раз', () => {
    SortTester.testAlgorithmTimeComplexity(
      InsertionSort,
      reverseArr,
      REVERSE_SORTED_ARRAY_VISITING_COUNT,
    )
  })
})
```

Запускаем тесты:

```bash
npm run test ./algorithms/sorting/__tests__/insertion-sort
```

<img src="https://habrastorage.org/webt/mm/_h/2j/mm_h2jhqmh1afuaonxctt7xopdq.png" />
