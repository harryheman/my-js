---
sidebar_position: 8
title: Сортировка Шелла
description: Сортировка Шелла
keywords: ['javascript', 'js', 'algorithms', 'алгоритмы']
tags: ['javascript', 'js', 'algorithms', 'алгоритмы']
---

# Сортировка Шелла

__Описание__

- [Википедия](https://ru.wikipedia.org/wiki/%D0%A1%D0%BE%D1%80%D1%82%D0%B8%D1%80%D0%BE%D0%B2%D0%BA%D0%B0_%D0%A8%D0%B5%D0%BB%D0%BB%D0%B0)
- [YouTube](https://www.youtube.com/watch?v=ddeLSDsYVp8)
- [Визуализация](https://www.youtube.com/watch?v=SHcPqUe2GZM)
- [Для смеха](https://www.youtube.com/watch?v=lvts84Qfo8o)
- [GitHub](https://github.com/harryheman/algorithms-data-structures/blob/main/src/algorithms/sorting/shell-sort.js)

Сортировка Шелла (Shell sort) - это алгоритм сортировки, являющийся усовершенствованным вариантом сортировки вставками. Идея метода Шелла состоит в сравнении элементов, стоящих не только рядом, но и на определенном расстоянии друг от друга.

При сортировке Шелла сначала сравниваются и сортируются между собой значения, стоящие один от другого на некотором расстоянии `d`. После этого процедура повторяется для некоторых меньших значений `d`, а завершается сортировка Шелла упорядочиванием элементов при `d = 1` (то есть обычной сортировкой вставками).

Хотя сортировка Шелла во многих случаях медленнее, чем быстрая сортировка, она имеет ряд преимуществ:

- отсутствие потребности в памяти под стек
- отсутствие деградации при неудачных наборах данных: быстрая сортировка легко деградирует до `O(n^2)`, что хуже, чем худшее гарантированное время для сортировки Шелла

_Принцип работы_

Нужно отсортировать список `[ 35, 33, 42, 10, 14, 19, 27, 44 ]`. Берем `d = 4` (`d` - это интервал). Разбиваем массив на пары элементов `{35, 14}`, `{33, 19}`, `{42, 27}` и `{10, 44}`.

<img src="https://habrastorage.org/webt/qp/tr/el/qptrelklvpydyum8dnbi2jd4eho.jpeg" />
<br />

Сравниваем пары элементов и меняем их местами при необходимости. Новый массив выглядит так:

<img src="https://habrastorage.org/webt/_b/mf/y0/_bmfy0x-yzyeaay6vjpkzhyinx4.jpeg" />
<br />

Берем `d = 2`, получаем пары `{14, 27, 35, 42}` и `{19, 10, 33, 44}`.

<img src="https://habrastorage.org/webt/px/kp/ec/pxkpecy3xklrt8i50dzc_-yx3yq.jpeg" />
<br />

Сравниваем пары элементов и меняем их местами при необходимости. Новый массив выглядит так:

<img src="https://habrastorage.org/webt/0d/wy/pt/0dwyptarmm-avfrzozdmlhotyr4.jpeg" />
<br />

Берем `d = 1` и упорядочиваем элементы массива с помощью сортировки вставками:

<img src="https://habrastorage.org/webt/im/42/od/im42odfvn70hawaz6xw8fcwz1e8.jpeg" />
<br />

_Сложность_

| Лучшее   | Среднее                 | Худшее       | Память | Стабильность |
|----------|-------------------------|--------------|--------|--------------|
| n log(n) | Зависит от размера шага | n (log(n))^2 | 1      | Нет          |

__Реализация__

```javascript
// algorithms/sorting/shell-sort.js
import Sort from './sort'

export default class ShellSort extends Sort {
  sort(arr) {
    // Копируем оригинальный массив во избежание его модификации
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/structuredClone
    const _arr = structuredClone(arr)

    // Определяем шаг - половина массива
    let step = Math.floor(_arr.length / 2)

    // До тех пор, пока шаг больше нуля
    while (step > 0) {
      // Сравниваем все пары элементов
      for (let i = 0; i < _arr.length - step; i++) {
        let currentIndex = i
        let gapShiftedIndex = i + step

        while (currentIndex >= 0) {
          this.callbacks.visitingCallback(_arr[currentIndex])

          // Сравниваем и меняем элементы местами при необходимости
          if (
            this.comparator.lessThan(_arr[gapShiftedIndex], _arr[currentIndex])
          ) {
            const tmp = _arr[currentIndex]

            _arr[currentIndex] = _arr[gapShiftedIndex]

            _arr[gapShiftedIndex] = tmp
          }

          gapShiftedIndex = currentIndex
          currentIndex -= step
        }
      }

      // Уменьшаем шаг в 2 раза
      step = Math.floor(step / 2)
    }

    return _arr
  }
}
```

__Тестирование__

```javascript
// algorithms/sorting/__tests__/shell-sort.test.js
import ShellSort from '../shell-sort'
import {
  equalArr,
  notSortedArr,
  reverseArr,
  sortedArr,
  SortTester,
} from '../sort-tester'

// Константы временной сложности
const SORTED_ARRAY_VISITING_COUNT = 320
const NOT_SORTED_ARRAY_VISITING_COUNT = 320
const REVERSE_SORTED_ARRAY_VISITING_COUNT = 320
const EQUAL_ARRAY_VISITING_COUNT = 320

describe('ShellSort', () => {
  it('должен отсортировать массив', () => {
    SortTester.testSort(ShellSort)
  })

  it('должен отсортировать массив с помощью кастомной функции сравнения', () => {
    SortTester.testSortWithCustomComparator(ShellSort)
  })

  it('должен отсортировать отрицательные числа', () => {
    SortTester.testNegativeNumbersSort(ShellSort)
  })

  it('должен посетить массив одинаковых элементов указанное количество раз', () => {
    SortTester.testAlgorithmTimeComplexity(
      ShellSort,
      equalArr,
      EQUAL_ARRAY_VISITING_COUNT,
    )
  })

  it('должен посетить отсортированный массив указанное количество раз', () => {
    SortTester.testAlgorithmTimeComplexity(
      ShellSort,
      sortedArr,
      SORTED_ARRAY_VISITING_COUNT,
    )
  })

  it('должен посетить неотсортированный массив указанное количество раз', () => {
    SortTester.testAlgorithmTimeComplexity(
      ShellSort,
      notSortedArr,
      NOT_SORTED_ARRAY_VISITING_COUNT,
    )
  })

  it('должен посетить инвертированный отсортированный массив указанное количество раз', () => {
    SortTester.testAlgorithmTimeComplexity(
      ShellSort,
      reverseArr,
      REVERSE_SORTED_ARRAY_VISITING_COUNT,
    )
  })
})
```

Запускаем тесты:

```bash
npm run test ./algorithms/sorting/__tests__/shell-sort
```

<img src="https://habrastorage.org/webt/qp/rk/zu/qprkzu3knjsqxnduwxmiuzf8a1c.png" />
