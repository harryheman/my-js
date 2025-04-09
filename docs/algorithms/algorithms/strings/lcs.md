---
sidebar_position: 6
title: Наибольшая общая подстрока
description: Наибольшая общая подстрока
keywords: ['javascript', 'js', 'algorithms', 'алгоритмы']
tags: ['javascript', 'js', 'algorithms', 'алгоритмы']
---

# Наибольшая общая подстрока

__Описание__

- [Википедия](https://ru.wikipedia.org/wiki/%D0%9D%D0%B0%D0%B8%D0%B1%D0%BE%D0%BB%D1%8C%D1%88%D0%B0%D1%8F_%D0%BE%D0%B1%D1%89%D0%B0%D1%8F_%D0%BF%D0%BE%D0%B4%D1%81%D1%82%D1%80%D0%BE%D0%BA%D0%B0)
- [YouTube](https://www.youtube.com/watch?v=BysNXJHzCEs)
- [GitHub](https://github.com/harryheman/algorithms-data-structures/blob/main/src/algorithms/strings/longest-common-substring.js)

Наибольшая общая подстрока (longest common substring) - это подстрока двух или более строк, имеющая максимальную длину. Не путайте с наибольшей общей подпоследовательностью.

_Пример_

НОП строк `ABABC`, `BABCA` и `ABCBA` - строка `ABC` длиной `3`. Другими общими подстроками являются `A`, `AB`, `B`, `BA`, `BC` и `C`.

```
ABABC
  |||
 BABCA
  |||
  ABCBA
```

__Реализация__

```javascript
// algorithms/strings/longest-common-substring.js
export default function longestCommonSubstring(str1, str2) {
  const s1 = [...str1]
  const s2 = [...str2]

  const matrix = new Array(s2.length + 1)
    .fill(null)
    .map(() => new Array(s1.length + 1).fill(null))

  // Заполняем первую строку и первую колонку `0`
  for (let columnIndex = 0; columnIndex <= s1.length; columnIndex++) {
    matrix[0][columnIndex] = 0
  }
  for (let rowIndex = 0; rowIndex <= s2.length; rowIndex++) {
    matrix[rowIndex][0] = 0
  }

  let longestSubstringLength = 0
  let longestSubstringColumn = 0
  let longestSubstringRow = 0

  for (let rowIndex = 1; rowIndex <= s2.length; rowIndex++) {
    for (let columnIndex = 1; columnIndex <= s1.length; columnIndex++) {
      if (s1[columnIndex - 1] === s2[rowIndex - 1]) {
        matrix[rowIndex][columnIndex] =
          matrix[rowIndex - 1][columnIndex - 1] + 1
      } else {
        matrix[rowIndex][columnIndex] = 0
      }

      // Ищем наибольшую длину
      if (matrix[rowIndex][columnIndex] > longestSubstringLength) {
        longestSubstringLength = matrix[rowIndex][columnIndex]
        longestSubstringColumn = columnIndex
        longestSubstringRow = rowIndex
      }
    }
  }

  // Самая длинная подстрока не найдена
  if (longestSubstringLength === 0) {
    return ''
  }

  // Извлекаем самую длинную подстроку из матрицы
  // путем конкатенации символов
  let longestSubstring = ''

  while (matrix[longestSubstringRow][longestSubstringColumn] > 0) {
    longestSubstring = s1[longestSubstringColumn - 1] + longestSubstring
    longestSubstringColumn--
    longestSubstringRow--
  }

  return longestSubstring
}
```

__Тестирование__

```javascript
// algorithms/strings/__tests__/longest-common-substring.test.js
import longestCommonSubstring from '../longest-common-substring'

describe('longestCommonSubstring', () => {
  it('должен найти наибольшие общие подстроки двух строк', () => {
    expect(longestCommonSubstring('', '')).toBe('')
    expect(longestCommonSubstring('ABC', '')).toBe('')
    expect(longestCommonSubstring('', 'ABC')).toBe('')
    expect(longestCommonSubstring('ABABC', 'BABCA')).toBe('BABC')
    expect(longestCommonSubstring('BABCA', 'ABCBA')).toBe('ABC')
    expect(longestCommonSubstring('sea', 'eat')).toBe('ea')
    expect(longestCommonSubstring('algorithms', 'rithm')).toBe('rithm')
    expect(
      longestCommonSubstring(
        'Algorithms and data structures implemented in JavaScript',
        'Here you may find Algorithms and data structures that are implemented in JavaScript',
      ),
    ).toBe('Algorithms and data structures ')
  })

  it('должен правильно обрабатываться юникод', () => {
    expect(longestCommonSubstring('𐌵𐌵**ABC', '𐌵𐌵--ABC')).toBe('ABC')
    expect(longestCommonSubstring('𐌵𐌵**A', '𐌵𐌵--A')).toBe('𐌵𐌵')
    expect(longestCommonSubstring('A买B时', '买B时GD')).toBe('买B时')
    expect(
      longestCommonSubstring('After test买时 case', 'another_test买时'),
    ).toBe('test买时')
  })
})
```

Запускаем тесты:

```bash
npm run test ./algorithms/strings/__tests__/longest-common-substring
```

<img src="https://habrastorage.org/webt/i2/q_/dp/i2q_dpebr_kqeqgokj_l97kxbmk.png" />
