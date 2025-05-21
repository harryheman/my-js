---
sidebar_position: 5
title: Перестановки и комбинации
description: Перестановки и комбинации
keywords: ['javascript', 'js', 'algorithms', 'алгоритмы']
tags: ['javascript', 'js', 'algorithms', 'алгоритмы']
---

# Перестановки и комбинации

__Описание__

- [Math is fun](https://www.mathsisfun.com/combinatorics/combinations-permutations.html)
- [Шпаргалки](https://itnext.io/permutations-combinations-algorithms-cheat-sheet-68c14879aba5)
- [GitHub - перестановки](https://github.com/harryheman/algorithms-data-structures/tree/main/src/algorithms/sets/permutations)
- [GitHub - комбинации](https://github.com/harryheman/algorithms-data-structures/tree/main/src/algorithms/sets/combinations)

Когда порядок элементов не важен, это комбинация (combination).

Когда порядок элементов важен, это перестановка (permutation).

## Перестановки

__Перестановки без повторений__

Перестановка (permutation) - это перестановка элементов упорядоченного списка `S` во взаимно однозначное соответствие самому `S`.

Пример перестановок строки `ABC`:

```
ABC ACB BAC BCA CBA CAB
```

Еще один пример - первые три человека в гонке: вы не можете одновременно быть и первым, и вторым.

Количество вариантов:

```
n * (n-1) * (n -2) * ... * 1 = n! (факториал `n`)
```

_Реализация_

```javascript
// algorithms/sets/permutations/without-repetitions.js
export default function withoutRepetitions(set) {
  if (set.length === 1) {
    return [set]
  }

  const result = []

  const subset = withoutRepetitions(set.slice(1))
  const first = set[0]

  for (let i = 0; i < subset.length; i++) {
    const smaller = subset[i]
    for (let j = 0; j < smaller.length + 1; j++) {
      const permutation = [...smaller.slice(0, j), first, ...smaller.slice(j)]
      result.push(permutation)
    }
  }

  return result
}
```

_Тестирование_

```javascript
// algorithms/sets/permutations/__tests__/without-repetitions.test.js
import withoutRepetitions from '../without-repetitions'
import factorial from '../../../math/factorial'

describe('withoutRepetitions', () => {
  it('должен переставлять элементы множеств без повторений', () => {
    const permutations1 = withoutRepetitions(['A'])
    expect(permutations1).toEqual([['A']])

    const permutations2 = withoutRepetitions(['A', 'B'])
    expect(permutations2.length).toBe(2)
    expect(permutations2).toEqual([
      ['A', 'B'],
      ['B', 'A'],
    ])

    const permutations6 = withoutRepetitions(['A', 'A'])
    expect(permutations6.length).toBe(2)
    expect(permutations6).toEqual([
      ['A', 'A'],
      ['A', 'A'],
    ])

    const permutations3 = withoutRepetitions(['A', 'B', 'C'])
    expect(permutations3.length).toBe(factorial(3))
    expect(permutations3).toEqual([
      ['A', 'B', 'C'],
      ['B', 'A', 'C'],
      ['B', 'C', 'A'],
      ['A', 'C', 'B'],
      ['C', 'A', 'B'],
      ['C', 'B', 'A'],
    ])

    const permutations4 = withoutRepetitions(['A', 'B', 'C', 'D'])
    expect(permutations4.length).toBe(factorial(4))
    expect(permutations4).toEqual([
      ['A', 'B', 'C', 'D'],
      ['B', 'A', 'C', 'D'],
      ['B', 'C', 'A', 'D'],
      ['B', 'C', 'D', 'A'],
      ['A', 'C', 'B', 'D'],
      ['C', 'A', 'B', 'D'],
      ['C', 'B', 'A', 'D'],
      ['C', 'B', 'D', 'A'],
      ['A', 'C', 'D', 'B'],
      ['C', 'A', 'D', 'B'],
      ['C', 'D', 'A', 'B'],
      ['C', 'D', 'B', 'A'],
      ['A', 'B', 'D', 'C'],
      ['B', 'A', 'D', 'C'],
      ['B', 'D', 'A', 'C'],
      ['B', 'D', 'C', 'A'],
      ['A', 'D', 'B', 'C'],
      ['D', 'A', 'B', 'C'],
      ['D', 'B', 'A', 'C'],
      ['D', 'B', 'C', 'A'],
      ['A', 'D', 'C', 'B'],
      ['D', 'A', 'C', 'B'],
      ['D', 'C', 'A', 'B'],
      ['D', 'C', 'B', 'A'],
    ])

    const permutations5 = withoutRepetitions(['A', 'B', 'C', 'D', 'E', 'F'])
    expect(permutations5.length).toBe(factorial(6))
  })
})
```

__Перестановки с повторениями__

Когда разрешены дубликаты, мы говорим о перестановках с повторениями.

Примером такой перестановки может быть код замка `333`.

Количество вариантов:

```
n * n * n ... (r раз) = n^r (экспонента `r`)
```

_Реализация_

```javascript
// algorithms/sets/permutations/with-repetitions.js
export default function withRepetitions(set, length = set.length) {
  if (length === 1) {
    return set.map((i) => [i])
  }

  const result = []

  const subset = withRepetitions(set, length - 1)

  for (const i of set) {
    for (const j of subset) {
      result.push([i, ...j])
    }
  }

  return result
}
```

_Тестирование_

```javascript
// algorithms/sets/permutations/__tests__/with-repetitions.test.js
import withRepetitions from '../with-repetitions'

describe('withRepetitions', () => {
  it('должен переставлять элементы множеств с повторениями', () => {
    const permutations1 = withRepetitions(['A'])
    expect(permutations1).toEqual([['A']])

    const permutations2 = withRepetitions(['A', 'B'])
    expect(permutations2).toEqual([
      ['A', 'A'],
      ['A', 'B'],
      ['B', 'A'],
      ['B', 'B'],
    ])

    const permutations3 = withRepetitions(['A', 'B', 'C'])
    expect(permutations3).toEqual([
      ['A', 'A', 'A'],
      ['A', 'A', 'B'],
      ['A', 'A', 'C'],
      ['A', 'B', 'A'],
      ['A', 'B', 'B'],
      ['A', 'B', 'C'],
      ['A', 'C', 'A'],
      ['A', 'C', 'B'],
      ['A', 'C', 'C'],
      ['B', 'A', 'A'],
      ['B', 'A', 'B'],
      ['B', 'A', 'C'],
      ['B', 'B', 'A'],
      ['B', 'B', 'B'],
      ['B', 'B', 'C'],
      ['B', 'C', 'A'],
      ['B', 'C', 'B'],
      ['B', 'C', 'C'],
      ['C', 'A', 'A'],
      ['C', 'A', 'B'],
      ['C', 'A', 'C'],
      ['C', 'B', 'A'],
      ['C', 'B', 'B'],
      ['C', 'B', 'C'],
      ['C', 'C', 'A'],
      ['C', 'C', 'B'],
      ['C', 'C', 'C'],
    ])

    const permutations4 = withRepetitions(['A', 'B', 'C', 'D'])
    expect(permutations4.length).toBe(4 * 4 * 4 * 4)
  })
})
```

Запускаем тесты:

```bash
npm run test ./algorithms/sets/permutations
```

Результат:

<img src="https://habrastorage.org/webt/nk/yb/fh/nkybfhfv6zb-c1gup_k297rcgnu.png" />
<br />

## Комбинации

__Комбинации без повторений__

Так работают лотереи. Числа пишутся одно за другим. Побеждает счастливая комбинация, независимо от порядка чисел.

Комбинация чисел без повторений:

```
[2, 14, 15, 27, 30, 33]
```

Количество вариантов:

<img src="https://habrastorage.org/webt/rp/ia/om/rpiaomiy-ch4jxvblwvdq5l2lhc.png" />
<br />

Здесь `n` - количество вариантов для выбора, а `r` - выбранное нами количество, без повторений, порядок не важен.

Такая комбинация также называется [биномиальным коэффициентом](https://ru.wikipedia.org/wiki/%D0%91%D0%B8%D0%BD%D0%BE%D0%BC%D0%B8%D0%B0%D0%BB%D1%8C%D0%BD%D1%8B%D0%B9_%D0%BA%D0%BE%D1%8D%D1%84%D1%84%D0%B8%D1%86%D0%B8%D0%B5%D0%BD%D1%82).

_Реализация_

```javascript
// algorithms/sets/combinations/without-repetitions.js
export default function withoutRepetitions(set, length) {
  if (length === 1) {
    return set.map((i) => [i])
  }

  const result = []

  set.forEach((i, idx) => {
    const subset = withoutRepetitions(set.slice(idx + 1), length - 1)

    for (const j of subset) {
      result.push([i, ...j])
    }
  })

  return result
}
```

_Тестирование_

```javascript
// algorithms/sets/combinations/__tests__/without-repetitions.test.js
import combineWithoutRepetitions from '../without-repetitions'
import factorial from '../../../math/factorial'

describe('combineWithoutRepetitions', () => {
  it('должен комбинировать элементы множеств без повторов', () => {
    expect(combineWithoutRepetitions(['A', 'B'], 3)).toEqual([])

    expect(combineWithoutRepetitions(['A', 'B'], 1)).toEqual([['A'], ['B']])

    expect(combineWithoutRepetitions(['A'], 1)).toEqual([['A']])

    expect(combineWithoutRepetitions(['A', 'B'], 2)).toEqual([['A', 'B']])

    expect(combineWithoutRepetitions(['A', 'B', 'C'], 2)).toEqual([
      ['A', 'B'],
      ['A', 'C'],
      ['B', 'C'],
    ])

    expect(combineWithoutRepetitions(['A', 'B', 'C'], 3)).toEqual([
      ['A', 'B', 'C'],
    ])

    expect(combineWithoutRepetitions(['A', 'B', 'C', 'D'], 3)).toEqual([
      ['A', 'B', 'C'],
      ['A', 'B', 'D'],
      ['A', 'C', 'D'],
      ['B', 'C', 'D'],
    ])

    expect(combineWithoutRepetitions(['A', 'B', 'C', 'D', 'E'], 3)).toEqual([
      ['A', 'B', 'C'],
      ['A', 'B', 'D'],
      ['A', 'B', 'E'],
      ['A', 'C', 'D'],
      ['A', 'C', 'E'],
      ['A', 'D', 'E'],
      ['B', 'C', 'D'],
      ['B', 'C', 'E'],
      ['B', 'D', 'E'],
      ['C', 'D', 'E'],
    ])

    const combinationOptions = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
    const combinationSlotsNumber = 4
    const combinations = combineWithoutRepetitions(
      combinationOptions,
      combinationSlotsNumber,
    )
    const n = combinationOptions.length
    const r = combinationSlotsNumber
    const expectedNumberOfCombinations =
      factorial(n) / (factorial(r) * factorial(n - r))

    expect(combinations.length).toBe(expectedNumberOfCombinations)
  })
})
```

__Комбинации с повторениями__

Примером такой комбинации являются монеты в кармане: `(5, 5, 5, 10, 10)`.

Еще один пример - пять вкусов мороженного: `banana`, `chocolate`, `lemon`, `strawberry` и `vanilla`.

Мы можем выбрать 3. Сколько у нас вариантов?

Используем символы для вкусов - `{ b, c, l, s, v }`. Примеры вариантов:

- `{ c, c, c }`
- `{ b, l, v }`
- `{ b, v, v }`

Количество вариантов:

<img src="https://habrastorage.org/webt/0s/0f/7b/0s0f7bp1w0bw9wcqevqwbu7_rvo.gif" />
<br />

Здесь `n` - количество вариантов для выбора, дубликаты разрешены, порядок не важен.

_Реализация_

```javascript
// algorithms/sets/combinations/with-repetitions.js
export default function withRepetitions(set, length) {
  if (length === 1) {
    return set.map((i) => [i])
  }

  const result = []

  set.forEach((i, idx) => {
    const subset = withRepetitions(set.slice(idx), length - 1)

    for (const j of subset) {
      result.push([i, ...j])
    }
  })

  return result
}
```

_Тестирование_

```javascript
// algorithms/sets/combinations/__tests__/with-repetitions.test.js
import withRepetitions from '../with-repetitions'
import factorial from '../../../math/factorial'

describe('withRepetitions', () => {
  it('должен комбинировать элементы множеств с повторами', () => {
    expect(withRepetitions(['A'], 1)).toEqual([['A']])

    expect(withRepetitions(['A', 'B'], 1)).toEqual([['A'], ['B']])

    expect(withRepetitions(['A', 'B'], 2)).toEqual([
      ['A', 'A'],
      ['A', 'B'],
      ['B', 'B'],
    ])

    expect(withRepetitions(['A', 'B'], 3)).toEqual([
      ['A', 'A', 'A'],
      ['A', 'A', 'B'],
      ['A', 'B', 'B'],
      ['B', 'B', 'B'],
    ])

    expect(withRepetitions(['A', 'B', 'C'], 2)).toEqual([
      ['A', 'A'],
      ['A', 'B'],
      ['A', 'C'],
      ['B', 'B'],
      ['B', 'C'],
      ['C', 'C'],
    ])

    expect(withRepetitions(['A', 'B', 'C'], 3)).toEqual([
      ['A', 'A', 'A'],
      ['A', 'A', 'B'],
      ['A', 'A', 'C'],
      ['A', 'B', 'B'],
      ['A', 'B', 'C'],
      ['A', 'C', 'C'],
      ['B', 'B', 'B'],
      ['B', 'B', 'C'],
      ['B', 'C', 'C'],
      ['C', 'C', 'C'],
    ])

    const combinationOptions = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
    const combinationSlotsNumber = 4
    const combinations = withRepetitions(
      combinationOptions,
      combinationSlotsNumber,
    )
    const n = combinationOptions.length
    const r = combinationSlotsNumber
    const expectedNumberOfCombinations =
      factorial(r + n - 1) / (factorial(r) * factorial(n - 1))

    expect(combinations.length).toBe(expectedNumberOfCombinations)
  })
})
```

Запускаем тесты:

```bash
npm run test ./algorithms/sets/combinations
```

<img src="https://habrastorage.org/webt/uc/op/ps/ucopps3bz5alehyb6a09yzbmcpq.png" />
<br />

__Шпаргалки__

<img src="https://habrastorage.org/webt/jg/bt/cp/jgbtcpj-auel8xzuri0rcx4a23g.png" />
<br />

<img src="https://habrastorage.org/webt/ys/ta/wo/ystawo7dlpsrepzo7utlpfjx4ng.jpeg" />
<br />

<img src="https://habrastorage.org/webt/a7/ap/hv/a7aphvlvfddec1mirpr2iwmr_r8.jpeg" />
<br />

<img src="https://habrastorage.org/webt/iv/sm/wa/ivsmwa5ddghuy15ls2jrfd1m4t0.jpeg" />
