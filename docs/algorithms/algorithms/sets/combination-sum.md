---
sidebar_position: 9
title: Комбинация сумм
description: Комбинация сумм
keywords: ['javascript', 'js', 'algorithms', 'алгоритмы']
tags: ['javascript', 'js', 'algorithms', 'алгоритмы']
---

# Комбинация сумм

__Описание__

- [GeeksForGeeks](https://www.geeksforgeeks.org/combinational-sum/)
- [GitHub](https://github.com/harryheman/algorithms-data-structures/blob/main/src/algorithms/sets/combination-sum.js)

Дан набор чисел (`candidates`) (без дубликатов) и целевое число (`target`). Необходимо найти все уникальные комбинации чисел `candidates`, сумма которых равняется `target`.

Дополнительные условия:

- одно и тоже число `candidates` может использоваться многократно
- все числа (включая `target`) являются положительными
- решение не должно содержать повторений

_Примеры_

```
Дано:
candidates = [2,3,6,7], target = 7,

Решение:
[
  [7],
  [2,2,3]
]
```

```
Дано:
candidates = [2,3,5], target = 8,

Решение:
[
  [2,2,2,2],
  [2,3,3],
  [3,5]
]
```

_Объяснение_

Поскольку задача состоит в получении всех возможных результатов, а не лучшего результата и не количества результатов, нам не требуется динамическое программирование. Для решения задачи достаточно рекурсивного подхода.

Пример дерева решений для `candidates = [2, 3]` и `target = 6`:

```
                0
              /   \
           +2      +3
          /   \      \
       +2       +3    +3
      /  \     /  \     \
    +2    ✘   ✘   ✘     ✓
   /  \
  ✓    ✘
```

__Реализация__

```javascript
// algorithms/sets/combination-sum.js
function combinationSumRecursive(
  candidates,
  remainingSum,
  finalCombinations = [],
  currentCombination = [],
  startFrom = 0,
) {
  if (remainingSum < 0) {
    // Добавив кандидата, мы опустились ниже `0`.
    // Это означает, что последний кандидат неприемлем
    return finalCombinations
  }

  if (remainingSum === 0) {
    // Если после добавления кандидата, мы получили `0`,
    // нужно сохранить текущую комбинацию, поскольку
    // это одно из искомых решений
    finalCombinations.push(currentCombination.slice())

    return finalCombinations
  }

  // Если мы пока не получили `0`, продолжаем добавлять оставшихся кандидатов
  for (let i = startFrom; i < candidates.length; i++) {
    const currentCandidate = candidates[i]

    currentCombination.push(currentCandidate)

    combinationSumRecursive(
      candidates,
      remainingSum - currentCandidate,
      finalCombinations,
      currentCombination,
      i,
    )

    // Возвращаемся назад, исключаем текущего кандидата и пробуем другого
    currentCombination.pop()
  }

  return finalCombinations
}

export default function combinationSum(candidates, target) {
  return combinationSumRecursive(candidates, target)
}
```

__Тестирование__

```javascript
// algorithms/sets/__tests__/combination-sum.test.js
import combinationSum from '../combination-sum'

describe('combinationSum', () => {
  it('должен найти все комбинации чисел для получения указанной суммы', () => {
    expect(combinationSum([1], 4)).toEqual([[1, 1, 1, 1]])

    expect(combinationSum([2, 3, 6, 7], 7)).toEqual([[2, 2, 3], [7]])

    expect(combinationSum([2, 3, 5], 8)).toEqual([
      [2, 2, 2, 2],
      [2, 3, 3],
      [3, 5],
    ])

    expect(combinationSum([2, 5], 3)).toEqual([])

    expect(combinationSum([], 3)).toEqual([])
  })
})
```

Запускаем тесты:

```bash
npm run test ./algorithms/sets/__tests__/combination-sum
```

<img src="https://habrastorage.org/webt/j2/u2/dx/j2u2dxtfmm-g9uvuod0xptnbsqm.png" />
