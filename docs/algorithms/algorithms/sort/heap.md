---
sidebar_position: 5
title: Сортировка кучей
description: Сортировка кучей
keywords: ['javascript', 'js', 'algorithms', 'алгоритмы']
tags: ['javascript', 'js', 'algorithms', 'алгоритмы']
---

# Сортировка кучей

__Описание__

- [Википедия](https://ru.wikipedia.org/wiki/%D0%9F%D0%B8%D1%80%D0%B0%D0%BC%D0%B8%D0%B4%D0%B0%D0%BB%D1%8C%D0%BD%D0%B0%D1%8F_%D1%81%D0%BE%D1%80%D1%82%D0%B8%D1%80%D0%BE%D0%B2%D0%BA%D0%B0)
- [YouTube](https://www.youtube.com/watch?v=FjtQhZGf5SI)
- [Визуализация](https://www.youtube.com/watch?v=MtQL_ll5KhQ)
- [GitHub](https://github.com/harryheman/algorithms-data-structures/blob/main/src/algorithms/sorting/heap-sort.js)

Сортировка кучей (пирамидальная сортировка) (heap sort) - это алгоритм сортировки, который является своего рода улучшением сортировки выбором. Сначала список делится на отсортированную и неотсортированную части. Затем неотсортированная часть уменьшается за счет извлечения наибольшего элемента и его перемещения в отсортированную часть. Улучшением является то, что для нахождения наибольшего элемента используется не линейный поиск, а структура данных "Куча" (см. часть 2, раздел 6).

<img src="https://habrastorage.org/webt/qd/w0/5p/qdw05pto9jpnic4ac_7bi7nxhl4.gif" />
<br />

<img src="https://habrastorage.org/webt/c_/14/qm/c_14qm7m00fjyl7bbroqtdcimmy.gif" />
<br />

_Сложность_

| Лучшее   | Среднее  | Худшее   | Память | Стабильность |
|----------|----------|----------|--------|--------------|
| n log(n) | n log(n) | n log(n) | 1      | Нет          |

__Реализация__

```javascript
// algorithms/sorting/heap-sort.js
import Sort from './sort'
import MinHeap from '../../data-structures/heap/min-heap'

export default class HeapSort extends Sort {
  sort(arr) {
    const _arr = []
    // Создаем минимальную кучу
    const minHeap = new MinHeap(this.callbacks.compareCallback)

    // Добавляем элементы массива в кучу
    for (const item of arr) {
      this.callbacks.visitingCallback(item)

      minHeap.add(item)
    }

    // Теперь у нас есть куча, в которой минимальный элемент всегда находится на самом верху.
    // Извлекаем минимальные элементы по одному для формирования отсортированного массива
    while (!minHeap.isEmpty()) {
      const item = minHeap.poll()

      this.callbacks.visitingCallback(item)

      _arr.push(item)
    }

    return _arr
  }
}
```

__Тестирование__

```javascript
// algorithms/sorting/__tests__/heap-sort.test.js
import HeapSort from '../heap-sort'
import {
  equalArr,
  notSortedArr,
  reverseArr,
  sortedArr,
  SortTester,
} from '../sort-tester'

// Константы временной сложности.
// Обратите внимание, что мы не учитываем время реструктуризации кучи,
// поэтому в реальности числа будут бОльшими
const SORTED_ARRAY_VISITING_COUNT = 40
const NOT_SORTED_ARRAY_VISITING_COUNT = 40
const REVERSE_SORTED_ARRAY_VISITING_COUNT = 40
const EQUAL_ARRAY_VISITING_COUNT = 40

describe('HeapSort', () => {
  it('должен отсортировать массив', () => {
    SortTester.testSort(HeapSort)
  })

  it('должен отсортировать массив с помощью кастомной функции сравнения', () => {
    SortTester.testSortWithCustomComparator(HeapSort)
  })

  it('должен отсортировать отрицательные числа', () => {
    SortTester.testNegativeNumbersSort(HeapSort)
  })

  it('должен посетить массив одинаковых элементов указанное количество раз', () => {
    SortTester.testAlgorithmTimeComplexity(
      HeapSort,
      equalArr,
      EQUAL_ARRAY_VISITING_COUNT,
    )
  })

  it('должен посетить отсортированный массив указанное количество раз', () => {
    SortTester.testAlgorithmTimeComplexity(
      HeapSort,
      sortedArr,
      SORTED_ARRAY_VISITING_COUNT,
    )
  })

  it('должен посетить неотсортированный массив указанное количество раз', () => {
    SortTester.testAlgorithmTimeComplexity(
      HeapSort,
      notSortedArr,
      NOT_SORTED_ARRAY_VISITING_COUNT,
    )
  })

  it('должен посетить инвертированный отсортированный массив указанное количество раз', () => {
    SortTester.testAlgorithmTimeComplexity(
      HeapSort,
      reverseArr,
      REVERSE_SORTED_ARRAY_VISITING_COUNT,
    )
  })
})
```

Запускаем тесты:

```bash
npm run test ./algorithms/sorting/__tests__/heap-sort
```

<img src="https://habrastorage.org/webt/pg/qb/ji/pgqbjifnbmijg3axs6zldctn0uy.png" />
