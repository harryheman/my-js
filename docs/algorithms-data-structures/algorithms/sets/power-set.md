---
sidebar_position: 4
title: Множество всех подмножеств
description: Множество всех подмножеств
keywords: ['javascript', 'js', 'algorithms', 'алгоритмы']
tags: ['javascript', 'js', 'algorithms', 'алгоритмы']
---

# Множество всех подмножеств

__Описание__

- [Википедия](https://ru.wikipedia.org/wiki/%D0%9C%D0%BD%D0%BE%D0%B6%D0%B5%D1%81%D1%82%D0%B2%D0%BE_%D0%B2%D1%81%D0%B5%D1%85_%D0%BF%D0%BE%D0%B4%D0%BC%D0%BD%D0%BE%D0%B6%D0%B5%D1%81%D1%82%D0%B2)
- [GitHub](https://github.com/harryheman/algorithms-data-structures/tree/main/src/algorithms/sets/power-set)

Множество всех подмножеств (булеан, показательное множество) (power set) — множество, состоящее из всех подмножеств данного множества
`S` (включая пустое множество и само множество `S`); обозначается
`P(S)` или `2^S` (так как оно соответствует множеству отображений из `S` в `{0, 1}`).

Например, множеством всех подмножеств множества `{ x, y, z }` будет:

```
{
  {}, // (также обозначается как ∅ или нулевое подмножество)
  {x},
  {y},
  {z},
  {x, y},
  {x, z},
  {y, z},
  {x, y, z}
}
```

Иллюстрация элементов этого множества, упорядоченных по порядку включения:

<img src="https://habrastorage.org/webt/ls/ro/4e/lsro4erbnnghot9jjlxyb3pcxz0.png" />
<br />

_Количество подмножеств_

Если `S` - это конечное множество, содержащее `|S| = n` элементов, то количество подмножеств `S` равняется `|P(S)| = 2^n`.

## Алгоритмы

__Двоичный подход__

Биты каждого числа двоичного представления в диапазоне от `0` до `2^n` показывают, следует ли включать соответствующий элемент множества в подмножество (`1` - включать, `0` - не включать). Например, для множества `{ 1, 2, 3 }` бинарное число `0b010` означает, что в подмножество включается только второй элемент множества, т.е. `2`.

| -   | `abc` | Подмножество |
|-----|-------|--------------|
| `0` | `000` | `{}`         |
| `1` | `001` | `{c}`        |
| `2` | `010` | `{b}`        |
| `3` | `011` | `{c, b}`     |
| `4` | `100` | `{a}`        |
| `5` | `101` | `{a, c}`     |
| `6` | `110` | `{a, b}`     |
| `7` | `111` | `{a, b, c}`  |

_Реализация_

```javascript
// algorithms/sets/power-set/bitwise.js
export default function bitwise(set) {
  const subsets = []

  // Количество подмножеств - `2^n`, где `n` - количество элементов в `set`.
  // Это обусловлено тем, что для каждого элемента `set` мы будем решать,
  // включать его в подмножество или нет (2 варианта на каждый элемент)
  const numberOfCombinations = 2 ** set.length

  for (let i = 0; i < numberOfCombinations; i++) {
    const subset = []

    for (let j = 0; j < set.length; j++) {
      // Решаем, включать текущий элемента в подмножество или нет
      if (i & (1 << j)) {
        subset.push(set[j])
      }
    }

    subsets.push(subset)
  }

  return subsets
}
```

_Тестирование_

```javascript
// algorithms/sets/power-set/__tests__/bitwise.test.js
import bitwise from '../bitwise'

describe('bitwise', () => {
  it('должен вычислить множества всех подмножеств с помощью бинарного подхода', () => {
    expect(bitwise([1])).toEqual([[], [1]])

    expect(bitwise([1, 2, 3])).toEqual([
      [],
      [1],
      [2],
      [1, 2],
      [3],
      [1, 3],
      [2, 3],
      [1, 2, 3],
    ])
  })
})
```

__Рекурсивный подход__

При таком подходе мы рекурсивно пытаемся добавить следующий элемент множества в подмножество, запоминаем подмножество, затем удаляем текущий элемент и берем следующий.

_Реализация_

```javascript
// algorithms/sets/power-set/backtracking.js
export default function backtracking(
  set,
  allSubsets = [[]],
  currentSubset = [],
  start = 0,
) {
  // Перебираем элементы множества, которые могут быть добавлены в подмножество
  // без дублирования (это обеспечивается значением `start`)
  for (let i = start; i < set.length; i++) {
    // Добавляем текущий элемент в подмножество
    currentSubset.push(set[i])

    // Текущее подмножество является валидным, запоминаем его.
    // `structuredClone()` создает копию `currentSubset`.
    // Это необходимо, поскольку `currentSubset` будет модифицирован
    // в дальнейших рекурсивных вызовах
    allSubsets.push(structuredClone(currentSubset))

    // Генерируем другие подмножества для текущего подмножества.
    // В качестве значения `start` передаем `i + 1` во избежание дублирования
    backtracking(set, allSubsets, currentSubset, i + 1)

    // Удаляем последний элемент и берем следующий
    currentSubset.pop()
  }

  return allSubsets
}
```

_Тестирование_

```javascript
// algorithms/sets/power-set/__tests__/backtracking.test.js
import backtracking from '../backtracking'

describe('backtracking', () => {
  it('должен вычислить множества всех подмножеств с помощью рекурсивного подхода', () => {
    expect(backtracking([1])).toEqual([[], [1]])

    expect(backtracking([1, 2, 3])).toEqual([
      [],
      [1],
      [1, 2],
      [1, 2, 3],
      [1, 3],
      [2],
      [2, 3],
      [3],
    ])
  })
})
```

__Каскадный подход__

Вероятно, это самый простой способ создания множества всех подмножеств.

Предположим, что у нас есть множество `originalSet = [1, 2, 3]`.

Мы начинаем с пустого подмножества:

```
powerSets = [[]]
```

Добавляем первый элемент `originalSet` во все существующие подмножества:

```
[[]] ← 1 = [[], [1]]
```

Добавляем второй элемент:

```
[[], [1]] ← 2 = [[], [1], [2], [1, 2]]
```

Добавляем третий элемент:

```
[[], [1], [2], [1, 2]] ← 3 = [[], [1], [2], [1, 2], [3], [1, 3], [2, 3], [1, 2, 3]]
```

И так для всех элементов `originalSet`. На каждой итерации количество множеств удваивается, поэтому в итоге мы получаем `2^n` множеств.

_Реализация_

```javascript
// algorithms/sets/power-set/cascading.js
export default function cascading(set) {
  // Начинаем с пустого множества
  const sets = [[]]

  for (let i = 0; i < set.length; i++) {
    // Без этого мы получим бесконечный цикл,
    // поскольку длина `sets` будет увеличиваться на каждой итерации
    const len = sets.length
    for (let j = 0; j < len; j++) {
      const _set = [...sets[j], set[i]]
      sets.push(_set)
    }
  }

  return sets
}
```

_Тестирование_

```javascript
// algorithms/sets/power-set/__tests__/cascading.test.js
import cascading from '../cascading'

describe('cascading', () => {
  it('должен вычислить множества всех подмножеств с помощью каскадного подхода', () => {
    expect(cascading([1])).toEqual([[], [1]])

    expect(cascading([1, 2])).toEqual([[], [1], [2], [1, 2]])

    expect(cascading([1, 2, 3])).toEqual([
      [],
      [1],
      [2],
      [1, 2],
      [3],
      [1, 3],
      [2, 3],
      [1, 2, 3],
    ])
  })
})
```

Запускаем тесты:

```bash
npm run test ./algorithms/sets/power-set
```

<img src="https://habrastorage.org/webt/ls/nv/mu/lsnvmupb1a5c8nwiaieha1cger4.png" />
