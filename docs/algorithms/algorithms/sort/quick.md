---
sidebar_position: 7
title: Быстрая сортировка
description: Быстрая сортировка
keywords: ['javascript', 'js', 'algorithms', 'алгоритмы']
tags: ['javascript', 'js', 'algorithms', 'алгоритмы']
---

# Быстрая сортировка

__Описание__

- [Википедия](https://ru.wikipedia.org/wiki/%D0%91%D1%8B%D1%81%D1%82%D1%80%D0%B0%D1%8F_%D1%81%D0%BE%D1%80%D1%82%D0%B8%D1%80%D0%BE%D0%B2%D0%BA%D0%B0)
- [YouTube](https://www.youtube.com/watch?v=4s-aG6yGGLU)
- [Грокаем алгоритмы](https://www.youtube.com/watch?v=hW6ct2ufHvs)
- [Визуализация](https://www.youtube.com/watch?v=PgBzjlCcFvc)
- [GitHub](https://github.com/harryheman/algorithms-data-structures/blob/main/src/algorithms/sorting/quick-sort.js)

Быстрая сортировка (сортировка Хоара) (quick sort) - это алгоритм сортировки, который является существенным улучшением алгоритма сортировки с помощью прямого обмена (например, сортировки пузырьком). Принципиальное отличие состоит в том, что в первую очередь производятся перестановки на наибольшем возможном расстоянии и после каждого прохода элементы делятся на две независимые группы.

Общая идея алгоритма состоит в следующем:

1. Выбираем из массива так называемый опорный (pivot) элемент. Это может быть любой элемент массива. От выбора опорного элемента не зависит корректность алгоритма, но в отдельных случаях может сильно зависеть его эффективность.
2. Сравниваем все остальные элементы с опорным и переставляем их в массиве так, чтобы разбить массив на три непрерывных отрезка, следующих друг за другом: "элементы меньшие опорного", "равные" и "большие".
3. Для отрезков меньшего и большего подмассивов выполняем рекурсивно ту же последовательность операций, если длина подмассива больше 1.

<img src="https://habrastorage.org/webt/3x/5i/wc/3x5iwcrpdbdergnajwujv_ynrto.gif" />
<br />

_Сложность_

| Лучшее   | Среднее  | Худшее | Память | Стабильность |
|----------|----------|--------|--------|--------------|
| n log(n) | n log(n) | n^2    | log(n) | Нет          |

__Реализация__

```javascript
// algorithms/sorting/quick-sort.js
import Sort from './sort'

export default class QuickSort extends Sort {
  sort(arr) {
    // Копируем оригинальный массив во избежание его модификации
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/structuredClone
    const _arr = structuredClone(arr)

    // Если массив пустой или содержит только один элемент,
    // возвращаем его, поскольку он уже отсортирован
    if (_arr.length <= 1) {
      return _arr
    }

    const leftArr = []
    const rightArr = []

    // Берем первый элемент массива в качестве опорного
    const pivot = _arr.shift()
    const centerArr = [pivot]

    // Распределяем все элементы массива между левым, центральным и правым подмассивами
    while (_arr.length) {
      const currentItem = _arr.shift()

      this.callbacks.visitingCallback(currentItem)

      if (this.comparator.equal(currentItem, pivot)) {
        centerArr.push(currentItem)
      } else if (this.comparator.lessThan(currentItem, pivot)) {
        leftArr.push(currentItem)
      } else {
        rightArr.push(currentItem)
      }
    }

    // Сортируем левый и правый подмассивы
    const leftArraySorted = this.sort(leftArr)
    const rightArraySorted = this.sort(rightArr)

    // Объединяем массивы слева направо
    return leftArraySorted.concat(centerArr, rightArraySorted)
  }
}
```

__Тестирование__

```javascript
// algorithms/sorting/__tests__/quick-sort.test.js
import QuickSort from '../quick-sort'
import {
  equalArr,
  notSortedArr,
  reverseArr,
  sortedArr,
  SortTester,
} from '../sort-tester'

// Константы временной сложности
const SORTED_ARRAY_VISITING_COUNT = 190
const NOT_SORTED_ARRAY_VISITING_COUNT = 62
const REVERSE_SORTED_ARRAY_VISITING_COUNT = 190
const EQUAL_ARRAY_VISITING_COUNT = 19

describe('QuickSort', () => {
  it('должен отсортировать массив', () => {
    SortTester.testSort(QuickSort)
  })

  it('должен отсортировать массив с помощью кастомной функции сравнения', () => {
    SortTester.testSortWithCustomComparator(QuickSort)
  })

  it('должен выполнить стабильную сортировку', () => {
    SortTester.testSortStability(QuickSort)
  })

  it('должен отсортировать отрицательные числа', () => {
    SortTester.testNegativeNumbersSort(QuickSort)
  })

  it('должен посетить массив одинаковых элементов указанное количество раз', () => {
    SortTester.testAlgorithmTimeComplexity(
      QuickSort,
      equalArr,
      EQUAL_ARRAY_VISITING_COUNT,
    )
  })

  it('должен посетить отсортированный массив указанное количество раз', () => {
    SortTester.testAlgorithmTimeComplexity(
      QuickSort,
      sortedArr,
      SORTED_ARRAY_VISITING_COUNT,
    )
  })

  it('должен посетить неотсортированный массив указанное количество раз', () => {
    SortTester.testAlgorithmTimeComplexity(
      QuickSort,
      notSortedArr,
      NOT_SORTED_ARRAY_VISITING_COUNT,
    )
  })

  it('должен посетить инвертированный отсортированный массив указанное количество раз', () => {
    SortTester.testAlgorithmTimeComplexity(
      QuickSort,
      reverseArr,
      REVERSE_SORTED_ARRAY_VISITING_COUNT,
    )
  })
})
```

Запускаем тесты:

```bash
npm run test ./algorithms/sorting/__tests__/quick-sort
```

<img src="https://habrastorage.org/webt/jo/j6/ho/joj6ho-isd40xjlrruzidljcayw.png" />
