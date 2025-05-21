---
sidebar_position: 4
title: Интерполяционный поиск
description: Интерполяционный поиск
keywords: ['javascript', 'js', 'algorithms', 'алгоритмы']
tags: ['javascript', 'js', 'algorithms', 'алгоритмы']
---

# Интерполяционный поиск

__Описание__

- [Википедия](https://ru.wikipedia.org/wiki/%D0%98%D0%BD%D1%82%D0%B5%D1%80%D0%BF%D0%BE%D0%BB%D1%8F%D1%86%D0%B8%D0%BE%D0%BD%D0%BD%D1%8B%D0%B9_%D0%BF%D0%BE%D0%B8%D1%81%D0%BA)
- [GeeksForGeeks](https://www.geeksforgeeks.org/interpolation-search/)
- [GitHub](https://github.com/harryheman/algorithms-data-structures/blob/main/src/algorithms/searches/interpolation-search.js)

Интерполяционный (интерполирующий) поиск (interpolation search) основан на принципе поиска в телефонной книге или, например, в словаре. Вместо сравнения каждого элемента с искомым, как при линейном поиске, данный алгоритм производит предсказание местонахождения элемента: поиск происходит подобно двоичному, но вместо деления области поиска на две части, интерполирующий поиск производит оценку новой области поиска по расстоянию между ключом и текущим значением элемента. Другими словами, бинарный поиск учитывает лишь знак разности между ключом и текущим значением, а интерполирующий еще учитывает и модуль этой разности и по данному значению производит предсказание позиции следующего элемента для проверки. Например, если целевое значение ближе к последнему элементу массива, поиск начнется с блока, находящегося в конце массива.

Для поиска целевого значения используется следующая формула:

```
// Суть формулы - вернуть большее значение `pos`,
// когда искомый элемент ближе к `arr[hi]`, и
// меньшее значение, когда искомый элемент ближе к `arr[lo]`
pos = lo + ((x - arr[lo]) * (hi - lo) / (arr[hi] - arr[Lo]))

arr[] - исходный массив
x - целевое значение
lo - начальный индекс `arr[]`
hi - конечный индекс `arr[]`
```

В среднем интерполирующий поиск производит `log(log(n))` операций, где `n` - это число элементов исходного массива. Число необходимых операций зависит от равномерности распределения значений среди элементов. В худшем случае (например, когда значения элементов экспоненциально возрастают) интерполяционный поиск может потребовать до `O(n)` операций.

__Реализация__

```javascript
// algorithms/searches/interpolation-search.js
export default function interpolationSearch(sortedArr, target) {
  let start = 0
  let end = sortedArr.length - 1

  while (start <= end) {
    const rangeDelta = sortedArr[end] - sortedArr[start]
    const indexDelta = end - start
    const valueDelta = target - sortedArr[start]

    // Если `valueDelta` равняется `0`, значит, искомый элемент
    // в массиве отсутствует
    if (valueDelta < 0) return -1

    // Если `rangeDelta` равняется `0`, значит, подмассив содержит
    // одинаковые числа, поэтому искать нечего
    if (!rangeDelta) {
      // Это также позволяет избежать деления на 0 при поиске
      // центрального элемента ниже
      return sortedArr[start] === target ? start : -1
    }

    const middleIndex =
      start + Math.floor((valueDelta * indexDelta) / rangeDelta)

    if (sortedArr[middleIndex] === target) {
      return middleIndex
    }

    if (sortedArr[middleIndex] < target) {
      // Переходим к правой половине массива
      start = middleIndex + 1
    } else {
      // переходим к левой половине массива
      end = middleIndex - 1
    }
  }

  return -1
}
```

__Тестирование__

```javascript
// algorithms/searches/__tests/interpolation-search.test.js
import interpolationSearch from '../interpolation-search'

describe('interpolationSearch', () => {
  it('должен найти числа в отсортированных массивах', () => {
    expect(interpolationSearch([], 1)).toBe(-1)
    expect(interpolationSearch([1], 1)).toBe(0)
    expect(interpolationSearch([1], 0)).toBe(-1)
    expect(interpolationSearch([1, 1], 1)).toBe(0)
    expect(interpolationSearch([1, 2], 1)).toBe(0)
    expect(interpolationSearch([1, 2], 2)).toBe(1)
    expect(interpolationSearch([10, 20, 30, 40, 50], 40)).toBe(3)
    expect(
      interpolationSearch(
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
        14,
      ),
    ).toBe(13)
    expect(
      interpolationSearch(
        [1, 6, 7, 8, 12, 13, 14, 19, 21, 23, 24, 24, 24, 300],
        24,
      ),
    ).toBe(10)
    expect(
      interpolationSearch([1, 2, 3, 700, 800, 1200, 1300, 1400, 1900], 600),
    ).toBe(-1)
    expect(
      interpolationSearch([1, 2, 3, 700, 800, 1200, 1300, 1400, 1900], 1),
    ).toBe(0)
    expect(
      interpolationSearch([1, 2, 3, 700, 800, 1200, 1300, 1400, 1900], 2),
    ).toBe(1)
    expect(
      interpolationSearch([1, 2, 3, 700, 800, 1200, 1300, 1400, 1900], 3),
    ).toBe(2)
    expect(
      interpolationSearch([1, 2, 3, 700, 800, 1200, 1300, 1400, 1900], 700),
    ).toBe(3)
    expect(
      interpolationSearch([1, 2, 3, 700, 800, 1200, 1300, 1400, 1900], 800),
    ).toBe(4)
    expect(
      interpolationSearch([0, 2, 3, 700, 800, 1200, 1300, 1400, 1900], 1200),
    ).toBe(5)
    expect(
      interpolationSearch([1, 2, 3, 700, 800, 1200, 1300, 1400, 19000], 800),
    ).toBe(4)
    expect(interpolationSearch([0, 10, 11, 12, 13, 14, 15], 10)).toBe(1)
  })
})
```

Запускаем тесты:

```bash
npm run test ./algorithms/searches/__tests__/interpolation-search
```

<img src="https://habrastorage.org/webt/1y/8k/9f/1y8k9fi_xr4ad5sudgqcgcal7d4.png" />
