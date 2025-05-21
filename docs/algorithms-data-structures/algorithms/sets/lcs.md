---
sidebar_position: 6
title: Наибольшая общая подпоследовательность
description: Наибольшая общая подпоследовательность
keywords: ['javascript', 'js', 'algorithms', 'алгоритмы']
tags: ['javascript', 'js', 'algorithms', 'алгоритмы']
---

# Наибольшая общая подпоследовательность

__Описание__

- [Википедия](https://ru.wikipedia.org/wiki/%D0%9D%D0%B0%D0%B8%D0%B1%D0%BE%D0%BB%D1%8C%D1%88%D0%B0%D1%8F_%D0%BE%D0%B1%D1%89%D0%B0%D1%8F_%D0%BF%D0%BE%D0%B4%D0%BF%D0%BE%D1%81%D0%BB%D0%B5%D0%B4%D0%BE%D0%B2%D0%B0%D1%82%D0%B5%D0%BB%D1%8C%D0%BD%D0%BE%D1%81%D1%82%D1%8C)
- [YouTube](https://www.youtube.com/watch?v=NnD96abizww&list=PLLXdhg_r2hKA7DPDsunoDZ-Z769jWn4R8)
- [GitHub](https://github.com/harryheman/algorithms-data-structures/tree/main/src/algorithms/sets/longest-common-subsequence)

Задача нахождения наибольшей общей подпоследовательности (НОП) (longest common subsequence, LCS) — задача поиска последовательности, которая является подпоследовательностью нескольких последовательностей (обычно двух). Это классическая задача информатики, которая имеет приложения, в частности, в задаче сравнения текстовых файлов (утилита `diff`), а также в биоинформатике. Она также широко используется системами контроля версий, такими как `Git`, для согласования изменений в коллекции файлов.

Подпоследовательность отличается от подстроки. Например, если есть исходная последовательность `ABCDEF`, то `ACE` будет подпоследовательностью, но не подстрокой, а `ABC` будет как подпоследовательностью, так и подстрокой.

_Примеры_

- НОП для последовательностей `ABCDGH` и `AEDFHR` - `ADH` длиной 3
- НОП для последовательностей `AGGTAB` и `GXTXAYB` - `GTAB` длиной 4

## Реализация

НОП можно реализовать, как минимум, двумя способами.

__Рекурсивный подход__

```javascript
// algorithms/sets/longest-common-subsequence/recursive.js
export default function lcsRecursive(a, b) {
  const lcs = (a, b, memo = {}) => {
    if (!a || !b) return ''

    if (memo[`${a},${b}`]) {
      return memo[`${a},${b}`]
    }

    if (a[0] === b[0]) {
      return a[0] + lcs(a.slice(1), b.slice(1), memo)
    }

    const next1 = lcs(a.slice(1), b, memo)
    const next2 = lcs(a, b.slice(1), memo)

    const nextLongest = next1.length >= next2.length ? next1 : next2
    memo[`${a},${b}`] = nextLongest

    return nextLongest
  }

  return lcs(a, b)
}
```

_Тестирование_

```javascript
// algorithms/sets/longest-common-subsequence/__tests__/recursive.test.js
import lcsRecursive from '../recursive'

describe('lcsRecursive', () => {
  it('должен рекурсивно найти НОП двух строк', () => {
    expect(lcsRecursive('', '')).toBe('')
    expect(lcsRecursive('ABC', '')).toBe('')
    expect(lcsRecursive('', 'ABC')).toBe('')
    expect(lcsRecursive('ABABC', 'BABCA')).toBe('BABC')
    expect(lcsRecursive('BABCA', 'ABCBA')).toBe('ABCA')
    expect(lcsRecursive('sea', 'eat')).toBe('ea')
    expect(lcsRecursive('algorithms', 'rithm')).toBe('rithm')
    expect(
      lcsRecursive(
        'Algorithms and data structures implemented in JavaScript',
        'Here you may find Algorithms and data structures that are implemented in JavaScript',
      ),
    ).toBe('Algorithms and data structures implemented in JavaScript')
  })
})
```

__Динамическое программирование__

Этот подход предполагает использование матрицы (см. ролик на ютубе по ссылке в начале раздела).

```javascript
// algorithms/sets/longest-common-subsequence/matrix.js
export default function lcs(a, b) {
  // Инициализируем матрицу LCS
  const matrix = new Array(b.length + 1)
    .fill(null)
    .map(() => new Array(a.length + 1).fill(null))

  // Заполняем `0` первую строку
  for (let i = 0; i <= a.length; i++) {
    matrix[0][i] = 0
  }

  // Заполняем `0` первую колонку
  for (let i = 0; i <= b.length; i++) {
    matrix[i][0] = 0
  }

  // Заполняем матрицу LCS
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1] + 1
      } else {
        matrix[i][j] = Math.max(matrix[i - 1][j], matrix[i][j - 1])
      }
    }
  }

  // Вычисляем LCS на основе матрицы
  if (!matrix[b.length][a.length]) {
    return ['']
  }

  const lcs = []
  let i = a.length
  let j = b.length

  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      // Двигаемся по диагонали "влево-верх"
      lcs.unshift(a[i - 1])
      i--
      j--
    } else if (matrix[j][i] === matrix[j][i - 1]) {
      // Двигаемся влево
      i--
    } else {
      // Двигаемся вверх
      j--
    }
  }

  return lcs
}
```

_Тестирование_

```javascript
// algorithms/sets/longest-common-subsequence/__tests__/matrix.test.js
import lcs from '../matrix'

describe('lcs', () => {
  it('должен найти НОП двух множеств', () => {
    expect(lcs([''], [''])).toEqual([''])

    expect(lcs([''], ['A', 'B', 'C'])).toEqual([''])

    expect(lcs(['A', 'B', 'C'], [''])).toEqual([''])

    expect(lcs(['A', 'B', 'C'], ['D', 'E', 'F', 'G'])).toEqual([''])

    expect(
      lcs(['A', 'B', 'C', 'D', 'G', 'H'], ['A', 'E', 'D', 'F', 'H', 'R']),
    ).toEqual(['A', 'D', 'H'])

    expect(
      lcs(['A', 'G', 'G', 'T', 'A', 'B'], ['G', 'X', 'T', 'X', 'A', 'Y', 'B']),
    ).toEqual(['G', 'T', 'A', 'B'])

    expect(
      lcs(['A', 'B', 'C', 'D', 'A', 'F'], ['A', 'C', 'B', 'C', 'F']),
    ).toEqual(['A', 'B', 'C', 'F'])
  })
})
```

Запускаем тесты:

```bash
npm run test ./algorithms/sets/longest-common-subsequence
```

<img src="https://habrastorage.org/webt/rp/ym/qj/rpymqjpt96f2axj5fepd0bx8bsa.png" />
