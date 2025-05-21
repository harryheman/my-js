---
sidebar_position: 7
title: Кратчайшая общая суперпоследовательность
description: Кратчайшая общая суперпоследовательность
keywords: ['javascript', 'js', 'algorithms', 'алгоритмы']
tags: ['javascript', 'js', 'algorithms', 'алгоритмы']
---

# Кратчайшая общая суперпоследовательность

__Описание__

- [Википедия](https://en.wikipedia.org/wiki/Shortest_common_supersequence)
- [GitHub](https://github.com/harryheman/algorithms-data-structures/blob/main/src/algorithms/sets/shortest-common-supersequence.js)

Кратчайшая общая суперпоследовательность (КОС) (shortest common supersequence, SCS) двух последовательностей `X` и `Y` - это самая короткая последовательность, содержащая `X` и `Y`.

Предположим, что у нас есть строки `str1` и `str2` и нам нужно найти кратчайшую строку, содержащую как `str1`, так и `str2`.

Эта задача тесно связана с задачей нахождения наибольшей общей подпоследовательности.

_Примеры_

- КОС для строк `geek` и `eke` - `geeke` длиной 5
- КОС для строк `AGGTAB` и `GXTXAYB` - `AGXGTXAYB` длиной 9

__Реализация__

Для реализации алгоритма нахождения КОС можно использовать алгоритм нахождения НОП, разобранный нами в предыдущем разделе.

```javascript
// algorithms/sets/shortest-common-supersequence.js
import lcsFn from './longest-common-subsequence/matrix'

export default function scs(set1, set2) {
  // Находим НОП двух множеств
  const lcs = lcsFn(set1, set2)

  // Если НОП пустая, то КОС будет просто
  // объединением множеств
  if (lcs.length === 1 && lcs[0] === '') {
    return set1.concat(set2)
  }

  // Добавляем элементы множеств в порядке перед/внутрь/после НОП
  let result = []

  let idx1 = 0
  let idx2 = 0
  let idx = 0
  let onHold1 = false
  let onHold2 = false

  while (idx < lcs.length) {
    // Добавляем элементы `set1` в правильном порядке
    if (idx1 < set1.length) {
      if (!onHold1 && set1[idx1] !== lcs[idx]) {
        result.push(set1[idx1])
        idx1++
      } else {
        onHold1 = true
      }
    }

    // Добавляем элементы `set2` в правильном порядке
    if (idx2 < set2.length) {
      if (!onHold2 && set2[idx2] !== lcs[idx]) {
        result.push(set2[idx2])
        idx2++
      } else {
        onHold2 = true
      }
    }

    // Добавляем НОП в правильном порядке
    if (onHold1 && onHold2) {
      result.push(lcs[idx])
      idx++
      idx1++
      idx2++
      onHold1 = false
      onHold2 = false
    }
  }

  // Добавляем остатки `set1`
  if (idx1 < set1.length) {
    result = result.concat(set1.slice(idx1))
  }

  // Добавляем остатки `set2`
  if (idx2 < set2.length) {
    result = result.concat(set2.slice(idx2))
  }

  return result
}
```

__Тестирование__

```javascript
// algorithms/sets/__tests__/shortest-common-supersequence.test.js
import shortestCommonSupersequence from '../shortest-common-supersequence'

describe('shortestCommonSupersequence', () => {
  it('должен найти КОС двух множеств', () => {
    // LCS (наибольшая общая последовательность) пустая
    expect(
      shortestCommonSupersequence(['A', 'B', 'C'], ['D', 'E', 'F']),
    ).toEqual(['A', 'B', 'C', 'D', 'E', 'F'])

    // LCS - "EE"
    expect(
      shortestCommonSupersequence(['G', 'E', 'E', 'K'], ['E', 'K', 'E']),
    ).toEqual(['G', 'E', 'K', 'E', 'K'])

    // LCS - "GTAB"
    expect(
      shortestCommonSupersequence(
        ['A', 'G', 'G', 'T', 'A', 'B'],
        ['G', 'X', 'T', 'X', 'A', 'Y', 'B'],
      ),
    ).toEqual(['A', 'G', 'G', 'X', 'T', 'X', 'A', 'Y', 'B'])

    // LCS - "BCBA"
    expect(
      shortestCommonSupersequence(
        ['A', 'B', 'C', 'B', 'D', 'A', 'B'],
        ['B', 'D', 'C', 'A', 'B', 'A'],
      ),
    ).toEqual(['A', 'B', 'D', 'C', 'A', 'B', 'D', 'A', 'B'])

    // LCS - "BDABA"
    expect(
      shortestCommonSupersequence(
        ['B', 'D', 'C', 'A', 'B', 'A'],
        ['A', 'B', 'C', 'B', 'D', 'A', 'B', 'A', 'C'],
      ),
    ).toEqual(['A', 'B', 'C', 'B', 'D', 'C', 'A', 'B', 'A', 'C'])
  })
})
```

Запускаем тесты:

```bash
npm run test ./algorithms/sets/__tests__/shortest-common-supersequence
```

<img src="https://habrastorage.org/webt/uv/cp/sm/uvcpsmliz2iziq0iu70dagcpybw.png" />
