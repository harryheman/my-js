---
sidebar_position: 3
title: Сортировка выбором
description: Сортировка выбором
keywords: ['javascript', 'js', 'algorithms', 'алгоритмы']
tags: ['javascript', 'js', 'algorithms', 'алгоритмы']
---

# Сортировка выбором

__Описание__

- [Википедия](https://ru.wikipedia.org/wiki/%D0%A1%D0%BE%D1%80%D1%82%D0%B8%D1%80%D0%BE%D0%B2%D0%BA%D0%B0_%D0%B2%D1%8B%D0%B1%D0%BE%D1%80%D0%BE%D0%BC)
- [YouTube](https://www.youtube.com/watch?v=uCbV2xHxalk)
- [Визуализация](https://www.youtube.com/watch?v=xWBP4lzkoyM)
- [GitHub](https://github.com/harryheman/algorithms-data-structures/blob/main/src/algorithms/sorting/selection-sort.js)

Сортировка выбором (selection sort) - это простой алгоритм сортировки, который состоит из следующих шагов:

1. Находим индекс минимального значения в списке (минимальный элемент).
2. Производим замену первого неотсортированного элемента на минимальный (замена не требуется, если минимальный элемент уже находится в нужной позиции).
3. Сортируем оставшуюся часть списка, исключив из рассмотрения уже отсортированные элементы.

<img src="https://habrastorage.org/webt/ie/f1/cv/ief1cv7ux3lj0m4rbyylkqwuois.gif" />
<br />

<img src="https://habrastorage.org/webt/fv/ri/dn/fvridngvmo1me6dgbdvu3l1gi0i.gif" />
<br />

<img src="https://habrastorage.org/webt/fv/ri/dn/fvridngvmo1me6dgbdvu3l1gi0i.gif" />
<br />

_Сложность_

| Лучшее | Среднее | Худшее | Память | Стабильность |
|--------|---------|--------|--------|--------------|
| n^2    | n^2     | n^2    | 1      | Нет          |

__Реализация__

```javascript
// algorithms/sorting/selection-sort.js
import Sort from './sort'

export default class SelectionSort extends Sort {
  sort(arr) {
    // Копируем оригинальный массив во избежание его модификации
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/structuredClone
    const _arr = structuredClone(arr)

    // Перебираем все элементы массива
    for (let i = 0; i < _arr.length - 1; i++) {
      // Индекс минимального элемента
      let minIndex = i

      this.callbacks.visitingCallback(_arr[i])

      // Обратите внимание, что здесь мы двигаемся от `i + 1`
      for (let j = i + 1; j < _arr.length; j++) {
        this.callbacks.visitingCallback(_arr[j])

        if (this.comparator.lessThan(_arr[j], _arr[minIndex])) {
          minIndex = j
        }
      }

      // Если обнаружен новый минимальный элемент,
      // меняем на него текущий элемент
      if (minIndex !== i) {
        ;[_arr[i], _arr[minIndex]] = [_arr[minIndex], _arr[i]]
      }
    }

    return _arr
  }
}
```

__Тестирование__

```javascript
// algorithms/sorting/__tests__/selection-sort.test.js
import SelectionSort from '../selection-sort'
import {
  equalArr,
  notSortedArr,
  reverseArr,
  sortedArr,
  SortTester,
} from '../sort-tester'

// Константы временной сложности
const SORTED_ARRAY_VISITING_COUNT = 209
const NOT_SORTED_ARRAY_VISITING_COUNT = 209
const REVERSE_SORTED_ARRAY_VISITING_COUNT = 209
const EQUAL_ARRAY_VISITING_COUNT = 209

describe('SelectionSort', () => {
  it('должен отсортировать массив', () => {
    SortTester.testSort(SelectionSort)
  })

  it('должен отсортировать массив с помощью кастомной функции сравнения', () => {
    SortTester.testSortWithCustomComparator(SelectionSort)
  })

  it('должен отсортировать отрицательные числа', () => {
    SortTester.testNegativeNumbersSort(SelectionSort)
  })

  it('должен посетить элементы массива одинаковых элементов указанное количество раз', () => {
    SortTester.testAlgorithmTimeComplexity(
      SelectionSort,
      equalArr,
      EQUAL_ARRAY_VISITING_COUNT,
    )
  })

  it('должен посетить элементы отсортированного массива указанное количество раз', () => {
    SortTester.testAlgorithmTimeComplexity(
      SelectionSort,
      sortedArr,
      SORTED_ARRAY_VISITING_COUNT,
    )
  })

  it('должен посетить элементы неотсортированного массива указанное количество раз', () => {
    SortTester.testAlgorithmTimeComplexity(
      SelectionSort,
      notSortedArr,
      NOT_SORTED_ARRAY_VISITING_COUNT,
    )
  })

  it('должен посетить элементы инвертированного отсортированного массива указанное количество раз', () => {
    SortTester.testAlgorithmTimeComplexity(
      SelectionSort,
      reverseArr,
      REVERSE_SORTED_ARRAY_VISITING_COUNT,
    )
  })
})
```

Запускаем тесты:

```bash
npm run test ./algorithms/sorting/__tests__/selection-sort
```

<img src="https://habrastorage.org/webt/fv/ap/z7/fvapz7fqotblssdgzgxqq7g2ou8.png" />
