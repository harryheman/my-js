---
sidebar_position: 8
title: Максимальный подмассив
description: Максимальный подмассив
keywords: ['javascript', 'js', 'algorithms', 'алгоритмы']
tags: ['javascript', 'js', 'algorithms', 'алгоритмы']
---

# Максимальный подмассив

__Описание__

- [Википедия](https://en.wikipedia.org/wiki/Maximum_subarray_problem)
- [GeeksForGeeks](https://www.geeksforgeeks.org/largest-sum-contiguous-subarray/)
- [GitHub](https://github.com/harryheman/algorithms-data-structures/tree/main/src/algorithms/sets/maximum-subarray)

Задача максимального подмассива (max subarray) - это задача поиска подмассива в одномерном массиве `a[1..n]`, числа которого дают наибольшую сумму (числа должны следовать одно за другим).

<img src="https://habrastorage.org/webt/u-/gb/zo/u-gbzodod_34pmqna2thwjhs4to.png" />
<br />

Исходные массивы обычно содержат отрицательные и положительные числа, а также `0`. Например, для массива `[−2, 1, −3, 4, −1, 2, 1, −5, 4]` максимальным подмассивом будет `[4, -1, 2, 1]`, а его сумма - `6`.

## Реализация

Для решения задачи нахождения максимального подмассива можно применить, как минимум, 3 подхода.

__Грубая сила__

Суть этого метода состоит в двойном переборе элементов массива. Поэтому его временная сложность составляет `O(n^2)`.

```javascript
// algorithms/sets/maximum-subarray/brute-force.js
export default function bruteForce(arr) {
  let maxStartIdx = 0
  let maxLen = 0
  let maxSum = null

  for (let i = 0; i < arr.length; i++) {
    let sum = 0
    for (let j = 1; j <= arr.length - i; j++) {
      sum += arr[i + (j - 1)]
      if (!maxSum || sum > maxSum) {
        maxSum = sum
        maxStartIdx = i
        maxLen = j
      }
    }
  }

  return arr.slice(maxStartIdx, maxStartIdx + maxLen)
}
```

_Тестирование_

```javascript
// algorithms/sets/maximum-subarray/__tests__/brute-force.test.js
import bruteForce from '../brute-force'

describe('bruteForce', () => {
  it('должен найти максимальные подмассивы методом грубой силы', () => {
    expect(bruteForce([])).toEqual([])
    expect(bruteForce([0, 0])).toEqual([0])
    expect(bruteForce([0, 0, 1])).toEqual([0, 0, 1])
    expect(bruteForce([0, 0, 1, 2])).toEqual([0, 0, 1, 2])
    expect(bruteForce([0, 0, -1, 2])).toEqual([2])
    expect(bruteForce([-1, -2, -3, -4, -5])).toEqual([-1])
    expect(bruteForce([1, 2, 3, 2, 3, 4, 5])).toEqual([1, 2, 3, 2, 3, 4, 5])
    expect(bruteForce([-2, 1, -3, 4, -1, 2, 1, -5, 4])).toEqual([4, -1, 2, 1])
    expect(bruteForce([-2, -3, 4, -1, -2, 1, 5, -3])).toEqual([4, -1, -2, 1, 5])
    expect(bruteForce([1, -3, 2, -5, 7, 6, -1, 4, 11, -23])).toEqual([
      7, 6, -1, 4, 11,
    ])
  })
})
```

__Разделяй и властвуй__

При использовании этого подхода нам также приходится перебирать массив дважды. Поэтому его временная сложность также составляет `O(n^2)`.

```javascript
// algorithms/sets/maximum-subarray/divide-conquer.js
export default function divideConquer(arr) {
  const dc = (idx, pick) => {
    if (idx >= arr.length) {
      return pick ? 0 : -Infinity
    }

    return Math.max(
      // Вариант 1: берем текущий элемент и переходим к следующему
      arr[idx] + dc(idx + 1, true),
      // Вариант 2: не берем текущий элемент
      pick ? 0 : dc(idx + 1, false),
    )
  }

  return dc(0, false)
}
```

_Тестирование_

```javascript
// algorithms/sets/maximum-subarray/__tests__/divide-conquer.test.js
import divideConquer from '../divide-conquer'

describe('dcMaximumSubarraySum', () => {
  it("должен найти максимальные подмассивы методом 'Разделяй и властвуй'", () => {
    expect(divideConquer([])).toEqual(-Infinity)
    expect(divideConquer([0, 0])).toEqual(0)
    expect(divideConquer([0, 0, 1])).toEqual(1)
    expect(divideConquer([0, 0, 1, 2])).toEqual(3)
    expect(divideConquer([0, 0, -1, 2])).toEqual(2)
    expect(divideConquer([-1, -2, -3, -4, -5])).toEqual(-1)
    expect(divideConquer([1, 2, 3, 2, 3, 4, 5])).toEqual(20)
    expect(divideConquer([-2, 1, -3, 4, -1, 2, 1, -5, 4])).toEqual(6)
    expect(divideConquer([-2, -3, 4, -1, -2, 1, 5, -3])).toEqual(7)
    expect(divideConquer([1, -3, 2, -5, 7, 6, -1, 4, 11, -23])).toEqual(27)
  })
})
```

__Динамическое программирование__

Это лучшее с точки зрения времени выполнения решение, поскольку позволяет ограничиться одним перебором массива (`O(n)`).

```javascript
// algorithms/sets/maximum-subarray/dynamic-programming.js
export default function dynamicProgramming(arr) {
  let maxSum = -Infinity
  let sum = 0

  let maxStartIdx = 0
  let maxEndIdx = arr.length - 1
  let currentStartIdx = 0

  arr.forEach((item, idx) => {
    sum += item

    if (maxSum < sum) {
      maxSum = sum
      maxStartIdx = currentStartIdx
      maxEndIdx = idx
    }

    if (sum < 0) {
      sum = 0
      currentStartIdx = idx + 1
    }
  })

  return arr.slice(maxStartIdx, maxEndIdx + 1)
}
```

_Тестирование_

```javascript
// algorithms/sets/maximum-subarray/__tests__/dynamic-programming.test.js
import dynamicProgramming from '../dynamic-programming'

describe('dynamicProgramming', () => {
  it('должен найти максимальные подмассивы методом динамического программирования', () => {
    expect(dynamicProgramming([])).toEqual([])
    expect(dynamicProgramming([0, 0])).toEqual([0])
    expect(dynamicProgramming([0, 0, 1])).toEqual([0, 0, 1])
    expect(dynamicProgramming([0, 0, 1, 2])).toEqual([0, 0, 1, 2])
    expect(dynamicProgramming([0, 0, -1, 2])).toEqual([2])
    expect(dynamicProgramming([-1, -2, -3, -4, -5])).toEqual([-1])
    expect(dynamicProgramming([1, 2, 3, 2, 3, 4, 5])).toEqual([
      1, 2, 3, 2, 3, 4, 5,
    ])
    expect(dynamicProgramming([-2, 1, -3, 4, -1, 2, 1, -5, 4])).toEqual([
      4, -1, 2, 1,
    ])
    expect(dynamicProgramming([-2, -3, 4, -1, -2, 1, 5, -3])).toEqual([
      4, -1, -2, 1, 5,
    ])
    expect(dynamicProgramming([1, -3, 2, -5, 7, 6, -1, 4, 11, -23])).toEqual([
      7, 6, -1, 4, 11,
    ])
  })
})
```

Запускаем тесты:

```bash
npm run test ./algorithms/sets/maximum-subarray
```

<img src="https://habrastorage.org/webt/ym/td/47/ymtd47l6s4veqy1xxspydk22c7q.png" />
