---
sidebar_position: 2
title: Поиск с переходом
description: Поиск с переходом
keywords: ['javascript', 'js', 'algorithms', 'алгоритмы']
tags: ['javascript', 'js', 'algorithms', 'алгоритмы']
---

# Поиск с переходом

__Описание__

- [Википедия](https://en.wikipedia.org/wiki/Jump_search)
- [GeekForGeeks](https://www.geeksforgeeks.org/jump-search/)
- [GitHub](https://github.com/harryheman/algorithms-data-structures/blob/main/src/algorithms/searches/jump-search.js)

Поиск с переходом (блочный поиск) (jump/block search) - это поисковый алгоритм для отсортированных массивов. Основная идея заключается в проверке меньшего количества элементов (чем при линейном поиске) за счет переходов определенными шагами или пропуска некоторых элементов, вместо проверки всех.

Например, у нас есть массив `arr` размером `n` и блок (для перехода) размером `m`. Мы проверяем индексы `arr[0]`, `arr[m]`, `arr[2 * m]`, ..., `arr[k * m]`, пока не найдем интервал `arr[k * m] < x < arr[(k+1) * m]`, где `x` - искомое значение. Затем для нахождения `x` выполняется линейный поиск, начиная с индекса `k * m`.

Каков оптимальный размер блока? В худшем случае нам придется выполнить `n/m` переходов, и если последнее проверенное значение больше, чем искомое, мы выполняем `m - 1` сравнений линейного поиска. Поэтому общее количество сравнений в худшем случае составляет `((n/m) + m - 1)`. Значение функции `((n/m) + m - 1)` будет минимальным при `m = √n`. Поэтому лучшим размером блока является `√n`. Это определяет _временную сложность_ алгоритма - `O(√n)`.

__Реализация__

```javascript
// algorithms/searches/jump-search.js
import Comparator from '../../utils/comparator'

export default function jumpSearch(sortedArr, target, fn) {
  const comparator = new Comparator(fn)
  const length = sortedArr.length
  if (!length) return -1

  // Вычисляем оптимальный шаг.
  // Общее количество сравнений в худшем случае будет ((length/step) + step - 1).
  // Значение функции ((length/step) + step - 1) будет минимальным при step = √length
  let step = Math.floor(Math.sqrt(length))

  let start = 0
  let end = step

  // Ищем блок, к которому принадлежит искомый элемент
  while (comparator.greaterThan(target, sortedArr[Math.min(end, length) - 1])) {
    // Переходим к следующему блоку
    start = end
    end += step

    if (start > length) return -1
  }

  // Выполняем линейный поиск в блоке, к которому принадлежит
  // `target`, начиная со `start`
  let currentIndex = start
  while (currentIndex < Math.min(end, length)) {
    if (comparator.equal(target, sortedArr[currentIndex])) {
      return currentIndex
    }
    currentIndex++
  }

  return -1
}
```

__Тестирование__

```javascript
// algorithms/searches/__tests__/jump-search.test.js
import jumpSearch from '../jump-search'

describe('jumpSearch', () => {
  it('должен найти числа в отсортированных массивах', () => {
    expect(jumpSearch([], 1)).toBe(-1)
    expect(jumpSearch([1], 2)).toBe(-1)
    expect(jumpSearch([1], 1)).toBe(0)
    expect(jumpSearch([1, 2], 1)).toBe(0)
    expect(jumpSearch([1, 2], 1)).toBe(0)
    expect(jumpSearch([1, 1, 1], 1)).toBe(0)
    expect(jumpSearch([1, 2, 5, 10, 20, 21, 24, 30, 48], 2)).toBe(1)
    expect(jumpSearch([1, 2, 5, 10, 20, 21, 24, 30, 48], 0)).toBe(-1)
    expect(jumpSearch([1, 2, 5, 10, 20, 21, 24, 30, 48], 0)).toBe(-1)
    expect(jumpSearch([1, 2, 5, 10, 20, 21, 24, 30, 48], 7)).toBe(-1)
    expect(jumpSearch([1, 2, 5, 10, 20, 21, 24, 30, 48], 5)).toBe(2)
    expect(jumpSearch([1, 2, 5, 10, 20, 21, 24, 30, 48], 20)).toBe(4)
    expect(jumpSearch([1, 2, 5, 10, 20, 21, 24, 30, 48], 30)).toBe(7)
    expect(jumpSearch([1, 2, 5, 10, 20, 21, 24, 30, 48], 48)).toBe(8)
  })

  it('должен найти объекты в отсортированном массиве', () => {
    const sortedArrayOfObjects = [
      { key: 1, value: 'value1' },
      { key: 2, value: 'value2' },
      { key: 3, value: 'value3' },
    ]

    const comparator = (a, b) => {
      if (a.key === b.key) return 0
      return a.key < b.key ? -1 : 1
    }

    expect(jumpSearch([], { key: 1 }, comparator)).toBe(-1)
    expect(jumpSearch(sortedArrayOfObjects, { key: 4 }, comparator)).toBe(-1)
    expect(jumpSearch(sortedArrayOfObjects, { key: 1 }, comparator)).toBe(0)
    expect(jumpSearch(sortedArrayOfObjects, { key: 2 }, comparator)).toBe(1)
    expect(jumpSearch(sortedArrayOfObjects, { key: 3 }, comparator)).toBe(2)
  })
})
```

Запускаем тесты:

```bash
npm run test ./algorithms/searches/__tests__/jump-search
```

<img src="https://habrastorage.org/webt/ir/j9/ec/irj9ecrp_6e0vq6oztqxpwajzdo.png" />
