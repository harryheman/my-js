---
sidebar_position: 11
title: Блочная сортировка
description: Блочная сортировка
keywords: ['javascript', 'js', 'algorithms', 'алгоритмы']
tags: ['javascript', 'js', 'algorithms', 'алгоритмы']
---

# Блочная сортировка

__Описание__

- [Википедия](https://ru.wikipedia.org/wiki/%D0%91%D0%BB%D0%BE%D1%87%D0%BD%D0%B0%D1%8F_%D1%81%D0%BE%D1%80%D1%82%D0%B8%D1%80%D0%BE%D0%B2%D0%BA%D0%B0)
- [YouTube](https://www.youtube.com/watch?v=LPrF9yEKTks)
- [Визуализация](https://www.youtube.com/watch?v=VuXbEb5ywrU)
- - [GitHub](https://github.com/harryheman/algorithms-data-structures/blob/main/src/algorithms/sorting/bucket-sort.js)

Блочная сортировка (bucket sort) - это алгоритм сортировки, в котором сортируемые элементы распределяются между конечным числом отдельных блоков (карманов, корзин) так, чтобы все элементы в каждом следующем по порядку блоке были всегда больше (или меньше), чем в предыдущем. Каждый блок затем сортируется отдельно, либо рекурсивно тем же методом, либо другим. Затем элементы помещаются обратно в массив. Этот тип сортировки может обладать линейным временем выполнения.

Данный алгоритм требует знаний о природе сортируемых данных, выходящих за рамки функций "сравнить" и "поменять местами", достаточных для сортировки слиянием, сортировки кучей, быстрой сортировки, сортировки Шелла или сортировки вставками.

Преимущества: относится к классу быстрых алгоритмов с линейным временем выполнения `O(n)` (на удачных входных данных).

Недостатки: сильно деградирует при большом количестве мало отличных элементов, или же на неудачной функции получения номера корзины по содержимому элемента.

_Принцип работы_

Алгоритм работает следующим образом:

1. Инициализация массива пустых `buckets`.
2. Перебор элементов исходного массива, помещение каждого в его `bucket`.
3. Сортировка непустых блоков.
4. Объединение блоков в массив слева направо.

Распределение элементов массива по блокам:

<img src="https://habrastorage.org/webt/ic/w7/r3/icw7r33zmfghol-wtrtfve8r5k0.png" />
<br />

Сортировка элементов внутри блоков:

<img src="https://habrastorage.org/webt/gz/-1/hi/gz-1himknd65lajuc6fhoobq5jy.png" />
<br />

_Сложность_

Сложность рассматриваемого алгоритма зависит от алгоритма сортировки, применяемого к блокам, количества используемых блоков и равномерности распределения элементов в исходном массиве.

В худшем случае временная сложность алгоритма составляет `O(n^2)`, если для сортировки блоков используется сортировка вставками, которая часто для этого применяется, поскольку ожидается, что блок содержит мало элементов из исходного массива. В худшем случае все элементы исходного массива помещаются в один блок.

Если худшее время выполнения промежуточной сортировки составляет `O(n * log(n))`, то худшее время блочной сортировки также будет составлять `O(n * log(n))`.

В среднем, когда элементы исходного массива относительно равномерно распределены, может быть доказано, что блочная сортировка в среднем выполняется за `O(n + k)`, где `k` - количество блоков.

__Реализация__

```javascript
// algorithms/sorting/bucket-sort.js
import RadixSort from './radix-sort'

const sorter = new RadixSort()

export default function bucketSort(arr, bucketSize = 1) {
  // Создаем блоки
  const buckets = new Array(bucketSize).fill().map(() => [])

  // Находим минимальное значение
  const minValue = Math.min(...arr)
  // Настрой максимальное значение
  const maxValue = Math.max(...arr)

  // Определяем размер блока
  const _bucketSize = Math.ceil(Math.max(1, (maxValue - minValue) / bucketSize))

  // Распределяем элементы исходного массива по группам
  for (const item of arr) {
    const index = Math.floor((item - minValue) / _bucketSize)

    // Крайний случай для максимального значения
    if (index === bucketSize) {
      buckets[bucketSize - 1].push(item)
    } else {
      buckets[index].push(item)
    }
  }

  // Сортируем блоки
  for (let i = 0; i < buckets.length; i += 1) {
    // Используем поразрядную сортировку. Это может дать среднюю
    // временную сложность `O(n + k)` для сортировки одного блока
    // (где `k` - количество цифр самого длинного числа)
    buckets[i] = sorter.sort(buckets[i])
  }

  // Объединяем отсортированные блоки в один массив
  const sortedArr = buckets.flat()

  return sortedArr
}
```

__Тестирование__

```javascript
// algorithms/sorting/__tests__/bucket-sort.test.js
import BucketSort from '../bucket-sort'
import { equalArr, notSortedArr, reverseArr, sortedArr } from '../sort-tester'

describe('BucketSort', () => {
  it('должен отсортировать массивы чисел с разным количеством блоков', () => {
    expect(BucketSort(notSortedArr, 4)).toEqual(sortedArr)
    expect(BucketSort(equalArr, 4)).toEqual(equalArr)
    expect(BucketSort(reverseArr, 4)).toEqual(sortedArr)
    expect(BucketSort(sortedArr, 4)).toEqual(sortedArr)

    expect(BucketSort(notSortedArr, 10)).toEqual(sortedArr)
    expect(BucketSort(equalArr, 10)).toEqual(equalArr)
    expect(BucketSort(reverseArr, 10)).toEqual(sortedArr)
    expect(BucketSort(sortedArr, 10)).toEqual(sortedArr)

    expect(BucketSort(notSortedArr, 50)).toEqual(sortedArr)
    expect(BucketSort(equalArr, 50)).toEqual(equalArr)
    expect(BucketSort(reverseArr, 50)).toEqual(sortedArr)
    expect(BucketSort(sortedArr, 50)).toEqual(sortedArr)
  })

  it('должен отсортировать массивы чисел с одной группой', () => {
    expect(BucketSort(notSortedArr)).toEqual(sortedArr)
    expect(BucketSort(equalArr)).toEqual(equalArr)
    expect(BucketSort(reverseArr)).toEqual(sortedArr)
    expect(BucketSort(sortedArr)).toEqual(sortedArr)
  })
})
```

Запускаем тесты:

```bash
npm run test ./algorithms/sorting/__tests__/bucket-sort
```

<img src="https://habrastorage.org/webt/82/wy/b8/82wyb8ki_-dajodgnzgsigef3fi.png" />
