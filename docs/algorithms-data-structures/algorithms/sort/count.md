---
sidebar_position: 9
title: Сортировка подсчетом
description: Сортировка подсчетом
keywords: ['javascript', 'js', 'algorithms', 'алгоритмы']
tags: ['javascript', 'js', 'algorithms', 'алгоритмы']
---

# Сортировка подсчетом

__Описание__

- [Википедия](https://ru.wikipedia.org/wiki/%D0%A1%D0%BE%D1%80%D1%82%D0%B8%D1%80%D0%BE%D0%B2%D0%BA%D0%B0_%D0%BF%D0%BE%D0%B4%D1%81%D1%87%D1%91%D1%82%D0%BE%D0%BC)
- [YouTube](https://www.youtube.com/watch?v=eXIjpUq7yc4)
- [Визуализация](https://www.youtube.com/watch?v=7zuGmKfUt7s)
- [GitHub](https://github.com/harryheman/algorithms-data-structures/blob/main/src/algorithms/sorting/counting-sort.js)

Сортировка подсчетом (counting sort) - это алгоритм сортировки, в котором используется диапазон чисел сортируемого массива (списка) для подсчета совпадающих элементов. Применение сортировки подсчетом целесообразно лишь тогда, когда сортируемые числа имеют (их можно отобразить в) диапазон возможных значений, который достаточно мал по сравнению с сортируемым множеством, например, миллион натуральных чисел меньших 1000. Сортировка подсчетом - это алгоритм сортировки целых чисел. Он работает лучше всего, когда диапазон чисел для каждого элемента массива очень мал.

_Алгоритм_

1. На первом шаге мы считаем количество вхождений каждого элемента, содержащегося в массиве `A`. Результат записывается в массив `C`:

<img src="https://habrastorage.org/webt/60/to/cv/60tocvzrtjeb1hhec39fj1q__sm.gif" />
<br />

2. На втором шаге мы считаем, сколько элементов массива `A` меньше или равны текущему индексу. `Ci` - количество элементов, меньших или равных `i`:

<img src="https://habrastorage.org/webt/zz/jw/da/zzjwda2sfrja5jfhmzauitm75xe.png" />
<br />

3. На третьем шаге мы помещаем элементы массива `A` в правильную позицию с помощью массива `C`. Для хранения отсортированных элементов используется массив `B`:

<img src="https://habrastorage.org/webt/21/5b/hd/215bhdz2mwkgn6p3js4ojqdsckw.gif" />
<br />

_Сложность_

| Лучшее | Среднее | Худшее | Память | Стабильность | Комментарии                        |
|--------|---------|--------|--------|--------------|------------------------------------|
| n + r  | n + r   | n + r  | n + r  | Да           | r - это наибольшее число в массиве |

__Реализация__

```javascript
// algorithms/sorting/counting-sort.js
import Sort from './sort'

export default class CountingSort extends Sort {
  sort(arr, smallestItem, biggestItem) {
    // Инициализируем наименьшее и наибольшее числа
    // для построения массива сегментов (buckets) позже
    let _smallestItem = smallestItem || 0
    let _biggestItem = biggestItem || 0

    if (!smallestItem || !biggestItem) {
      arr.forEach((item) => {
        this.callbacks.visitingCallback(item)

        // Определяем наибольший элемент
        if (this.comparator.greaterThan(item, _biggestItem)) {
          _biggestItem = item
        }

        // Определяем наименьший элемент
        if (this.comparator.lessThan(item, _smallestItem)) {
          _smallestItem = item
        }
      })
    }

    // Инициализируем массив сегментов, который будет содержать
    // количество вхождений (частоту) элементов `arr`
    const buckets = new Array(_biggestItem - _smallestItem + 1).fill(0)
    arr.forEach((item) => {
      this.callbacks.visitingCallback(item)

      buckets[item - _smallestItem]++
    })

    // Добавляем предыдущие частоты к текущей для каждого числа в сегменте,
    // чтобы определить, сколько чисел меньше текущего должно стоять
    // слева от него
    for (let i = 1; i < buckets.length; i++) {
      buckets[i] += buckets[i - 1]
    }

    // Сдвигаем частоты вправо, чтобы они показывали правильные числа.
    // Если мы этого не сделаем, то `buckets[5]`, например, покажет, сколько
    // элементов, меньших 5, нужно поместить слева от 5 в отсортированном массиве,
    // ВКЛЮЧАЯ 5. После сдвига 5 будет исключено
    buckets.pop()
    buckets.unshift(0)

    // Формируем отсортированный массив
    const sortedArr = new Array(arr.length).fill(null)
    arr.forEach((item) => {
      this.callbacks.visitingCallback(item)

      // Получаем позицию элемента в отсортированном массиве
      const sortedPosition = buckets[item - _smallestItem]
      // Добавляем элемент на правильную позицию в отсортированном массиве
      sortedArr[sortedPosition] = item
      // Увеличиваем позицию текущего элемента в сегменте для будущих правильных размещений
      buckets[item - _smallestItem]++
    })

    return sortedArr
  }
}
```

__Тестирование__

```javascript
// algorithms/sorting/__tests__/counting-sort.test.js
import CountingSort from '../counting-sort'
import {
  equalArr,
  notSortedArr,
  reverseArr,
  sortedArr,
  SortTester,
} from '../sort-tester'

// Константы временной сложности
const SORTED_ARRAY_VISITING_COUNT = 60
const NOT_SORTED_ARRAY_VISITING_COUNT = 60
const REVERSE_SORTED_ARRAY_VISITING_COUNT = 60
const EQUAL_ARRAY_VISITING_COUNT = 60

describe('CountingSort', () => {
  it('должен отсортировать массив', () => {
    SortTester.testSort(CountingSort)
  })

  it('должен отсортировать отрицательные числа', () => {
    SortTester.testNegativeNumbersSort(CountingSort)
  })

  it('должен принимать максимальное/минимальное целые числа для ускорения сортировки', () => {
    const visitingCallback = jest.fn()
    const sorter = new CountingSort({ visitingCallback })

    // Определяем наибольшее число
    const biggestElement = Math.max(...notSortedArr)

    // Определяем наименьшее число
    const smallestElement = Math.min(...notSortedArr)

    const sortedArray = sorter.sort(
      notSortedArr,
      smallestElement,
      biggestElement,
    )

    expect(sortedArray).toEqual(sortedArr)
    // Обычно `visitingCallback()` вызывается 60 раз, но в данном случае
    // он должен быть вызван только 40 раз
    expect(visitingCallback).toHaveBeenCalledTimes(40)
  })

  it('должен посетить массив одинаковых элементов указанное количество раз', () => {
    SortTester.testAlgorithmTimeComplexity(
      CountingSort,
      equalArr,
      EQUAL_ARRAY_VISITING_COUNT,
    )
  })

  it('должен посетить отсортированный массив указанное количество раз', () => {
    SortTester.testAlgorithmTimeComplexity(
      CountingSort,
      sortedArr,
      SORTED_ARRAY_VISITING_COUNT,
    )
  })

  it('должен посетить неотсортированный массив указанное количество раз', () => {
    SortTester.testAlgorithmTimeComplexity(
      CountingSort,
      notSortedArr,
      NOT_SORTED_ARRAY_VISITING_COUNT,
    )
  })

  it('должен посетить инвертированный отсортированный массив указанное количество раз', () => {
    SortTester.testAlgorithmTimeComplexity(
      CountingSort,
      reverseArr,
      REVERSE_SORTED_ARRAY_VISITING_COUNT,
    )
  })
})
```

Запускаем тесты:

```bash
npm run test ./algorithms/sorting/__tests__/counting-sort
```

<img src="https://habrastorage.org/webt/p6/1-/6p/p61-6pdccmnjznczzx-5kglq9nu.png" />
