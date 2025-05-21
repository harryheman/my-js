---
sidebar_position: 6
title: Сортировка слиянием
description: Сортировка слиянием
keywords: ['javascript', 'js', 'algorithms', 'алгоритмы']
tags: ['javascript', 'js', 'algorithms', 'алгоритмы']
---

# Сортировка слиянием

__Описание__

- [Википедия](https://ru.wikipedia.org/wiki/%D0%A1%D0%BE%D1%80%D1%82%D0%B8%D1%80%D0%BE%D0%B2%D0%BA%D0%B0_%D1%81%D0%BB%D0%B8%D1%8F%D0%BD%D0%B8%D0%B5%D0%BC)
- [YouTube](https://www.youtube.com/watch?v=Qs3l8_wd_34)
- [Визуализация](https://www.youtube.com/watch?v=JSceec-wEyw)
- [GitHub](https://github.com/harryheman/algorithms-data-structures/blob/main/src/algorithms/sorting/merge-sort.js)

Сортировка слиянием (merge sort) - это алгоритм сортировки, который является хорошим примером использования принципа "разделяй и властвуй". Сначала задача разбивается на несколько подзадач меньшего размера. Затем эти задачи решаются с помощью рекурсивного вызова или непосредственно, если их размер достаточно мал. Наконец, полученные решения комбинируются в финальный результат.

Сортировка слиянием выполняется в три этапа:

1. Сортируемый массив разбивается на две примерно одинаковые части.
2. Каждая часть сортируется отдельно, например, тем же самым алгоритмом.
3. Два упорядоченных массива соединяются в один.

Есть несколько нюансов:

1. Рекурсивное разбиение задачи на меньшие происходит до тех пор, пока размер массива не достигнет единицы (любой массив единичной длины можно считать отсортированным).
2. Основную идею слияния двух отсортированных массивов можно объяснить на следующем примере. Пусть мы имеем два отсортированных по возрастанию подмассива. Тогда:
  - слияние двух подмассивов в результирующий массив. На каждом шаге мы берем меньший из двух первых элементов подмассивов и записываем его в результирующий массив. Счетчики номеров элементов результирующего массива и подмассива, из которого был взят элемент, увеличиваются на 1
  - добавление остатка. Когда один из подмассивов закончился, все оставшиеся элементы другого подмассива добавляются в результирующий массив

<img src="https://habrastorage.org/webt/zl/dy/1p/zldy1p4lm5cyxmff6apc8vilyt0.gif" />
<br />

<img src="https://habrastorage.org/webt/n_/za/qz/n_zaqzcw9bvv25txhyuuqba9gcg.png" />
<br />

_Сложность_

| Лучшее   | Среднее  | Худшее   | Память | Стабильность |
|----------|----------|----------|--------|--------------|
| n log(n) | n log(n) | n log(n) | n      | Да           |

__Реализация__

```javascript
// algorithms/sorting/merge-sort.js
import Sort from './sort'

export default class MergeSort extends Sort {
  // Сортирует массив методом слияния
  sort(arr) {
    this.callbacks.visitingCallback(null)

    // Если массив пустой или содержит только один элемент,
    // возвращаем его, поскольку он уже отсортирован
    if (arr.length <= 1) {
      return arr
    }

    // Делим массив пополам
    const middleIndex = Math.floor(arr.length / 2)
    const leftArray = arr.slice(0, middleIndex)
    const rightArray = arr.slice(middleIndex, arr.length)

    // Сортируем половины
    const leftSortedArray = this.sort(leftArray)
    const rightSortedArray = this.sort(rightArray)

    // Объединяем отсортированные половины в один массив
    return this.mergeSortedArrays(leftSortedArray, rightSortedArray)
  }

  // Объединяет два отсортированных массива
  mergeSortedArrays(leftArray, rightArray) {
    const _arr = []

    // Используем указатели для исключения элементов, добавленных в массив
    let leftIndex = 0
    let rightIndex = 0

    while (leftIndex < leftArray.length && rightIndex < rightArray.length) {
      let minItem = null

      // Находим минимальный элемент подмассивов
      if (
        this.comparator.lessThanOrEqual(
          leftArray[leftIndex],
          rightArray[rightIndex],
        )
      ) {
        minItem = leftArray[leftIndex]
        // Двигаемся вправо
        leftIndex += 1
      } else {
        minItem = rightArray[rightIndex]
        // Двигаемся влево
        rightIndex += 1
      }

      // Добавляем минимальный элемент в отсортированный массив
      _arr.push(minItem)

      this.callbacks.visitingCallback(minItem)
    }

    // Добавляем оставшиеся элементы в результирующий массив
    return _arr
      .concat(leftArray.slice(leftIndex))
      .concat(rightArray.slice(rightIndex))
  }
}
```

__Тестирование__

```javascript
// algorithms/sorting/__tests__/merge-sort.test.js
import MergeSort from '../merge-sort'
import {
  equalArr,
  notSortedArr,
  reverseArr,
  sortedArr,
  SortTester,
} from '../sort-tester'

// Константы временной сложности
const SORTED_ARRAY_VISITING_COUNT = 79
const NOT_SORTED_ARRAY_VISITING_COUNT = 102
const REVERSE_SORTED_ARRAY_VISITING_COUNT = 87
const EQUAL_ARRAY_VISITING_COUNT = 79

describe('MergeSort', () => {
  it('должен отсортировать массив', () => {
    SortTester.testSort(MergeSort)
  })

  it('должен отсортировать массив с помощью кастомной функции сравнения', () => {
    SortTester.testSortWithCustomComparator(MergeSort)
  })

  it('должен выполнить стабильную сортировку', () => {
    SortTester.testSortStability(MergeSort)
  })

  it('должен отсортировать отрицательные числа', () => {
    SortTester.testNegativeNumbersSort(MergeSort)
  })

  it('должен посетить массив одинаковых элементов указанное количество раз', () => {
    SortTester.testAlgorithmTimeComplexity(
      MergeSort,
      equalArr,
      EQUAL_ARRAY_VISITING_COUNT,
    )
  })

  it('должен посетить отсортированный массив указанное количество раз', () => {
    SortTester.testAlgorithmTimeComplexity(
      MergeSort,
      sortedArr,
      SORTED_ARRAY_VISITING_COUNT,
    )
  })

  it('должен посетить неотсортированный массив указанное количество раз', () => {
    SortTester.testAlgorithmTimeComplexity(
      MergeSort,
      notSortedArr,
      NOT_SORTED_ARRAY_VISITING_COUNT,
    )
  })

  it('должен посетить инвертированный отсортированный массив указанное количество раз', () => {
    SortTester.testAlgorithmTimeComplexity(
      MergeSort,
      reverseArr,
      REVERSE_SORTED_ARRAY_VISITING_COUNT,
    )
  })
})
```

Запускаем тесты:

```bash
npm run test ./algorithms/sorting/__tests__/merge-sort
```

<img src="https://habrastorage.org/webt/uf/iv/qv/ufivqv_e-sqfalvwry1wrnesf-u.png" />
