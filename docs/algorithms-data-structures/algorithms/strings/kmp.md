---
sidebar_position: 4
title: Алгоритм Кнута-Морриса-Пратта
description: Алгоритм Кнута-Морриса-Пратта
keywords: ['javascript', 'js', 'algorithms', 'алгоритмы']
tags: ['javascript', 'js', 'algorithms', 'алгоритмы']
---

# Алгоритм Кнута-Морриса-Пратта

__Описание__

- [Википедия](https://ru.wikipedia.org/wiki/%D0%90%D0%BB%D0%B3%D0%BE%D1%80%D0%B8%D1%82%D0%BC_%D0%9A%D0%BD%D1%83%D1%82%D0%B0_%E2%80%94_%D0%9C%D0%BE%D1%80%D1%80%D0%B8%D1%81%D0%B0_%E2%80%94_%D0%9F%D1%80%D0%B0%D1%82%D1%82%D0%B0)
- [YouTube](https://www.youtube.com/watch?v=7g-WEBj3igk)
- [GitHub](https://github.com/harryheman/algorithms-data-structures/blob/main/src/algorithms/strings/knuth-morris-pratt.js)

Алгоритм Кнута-Морриса-Пратта (КМП-алгоритм) (Knuth–Morris–Pratt algorithm) — эффективный алгоритм, осуществляющий поиск подстроки в строке, используя то, что при возникновении несоответствия само слово содержит достаточно информации, чтобы определить, где может начаться следующее совпадение, минуя лишние проверки. Время работы алгоритма линейно зависит от объема входных данных, то есть разработать асимптотически более эффективный алгоритм невозможно.

_Задача_

Даны образец (строка) `S` и строка `T`. Требуется определить индекс, начиная с которого образец `S` содержится в строке `T`. Если `S` не содержится в `T`, нужно вернуть индекс, который не может быть интерпретирован как позиция в строке (например, отрицательное число).

_Сложность_

- Временная: `O(|W| + |T|)` (что гораздо быстрее тривиального `O(|W| * |T|)`)
- пространственная: `O(|W|)`

__Реализация__

Начнем с определения функции для создания временной таблицы паттерна:

```javascript
// algorithms/strings/knuth-morris-pratt.js
function buildPatternTable(word) {
  const patternTable = [0]
  let prefixIndex = 0
  let suffixIndex = 1

  while (suffixIndex < word.length) {
    if (word[suffixIndex] === word[prefixIndex]) {
      patternTable[suffixIndex] = prefixIndex + 1
      prefixIndex += 1
      suffixIndex += 1
    } else if (prefixIndex === 0) {
      patternTable[suffixIndex] = 0
      suffixIndex += 1
    } else {
      prefixIndex = patternTable[prefixIndex - 1]
    }
  }

  return patternTable
}
```

Используем эту таблицу для решения задачи:

```javascript
export default function knuthMorrisPratt(text, word) {
  if (word.length === 0) return 0

  let textIndex = 0
  let wordIndex = 0

  const patternTable = buildPatternTable(word)

  while (textIndex < text.length) {
    if (text[textIndex] === word[wordIndex]) {
      // Найдено совпадение
      if (wordIndex === word.length - 1) {
        return textIndex - word.length + 1
      }

      textIndex += 1
      wordIndex += 1
    } else if (wordIndex > 0) {
      wordIndex = patternTable[wordIndex - 1]
    } else {
      textIndex += 1
    }
  }

  return -1
}
```

__Тестирование__

```javascript
// algorithms/strings/__tests__/knuth-morris-pratt.test.js
import knuthMorrisPratt from '../knuth-morris-pratt'

describe('knuthMorrisPratt', () => {
  it('должен найти начальные индексы слов в текстах', () => {
    expect(knuthMorrisPratt('', '')).toBe(0)
    expect(knuthMorrisPratt('a', '')).toBe(0)
    expect(knuthMorrisPratt('a', 'a')).toBe(0)
    expect(knuthMorrisPratt('abcbcglx', 'abca')).toBe(-1)
    expect(knuthMorrisPratt('abcbcglx', 'bcgl')).toBe(3)
    expect(knuthMorrisPratt('abcxabcdabxabcdabcdabcy', 'abcdabcy')).toBe(15)
    expect(knuthMorrisPratt('abcxabcdabxabcdabcdabcy', 'abcdabca')).toBe(-1)
    expect(
      knuthMorrisPratt('abcxabcdabxaabcdabcabcdabcdabcy', 'abcdabca'),
    ).toBe(12)
    expect(
      knuthMorrisPratt('abcxabcdabxaabaabaaaabcdabcdabcy', 'aabaabaaa'),
    ).toBe(11)
  })
})
```

Запускаем тесты:

```bash
npm run test ./algorithms/strings/__tests__/knuth-morris-pratt
```

<img src="https://habrastorage.org/webt/o2/ld/li/o2ldliucllzvmnitwspzbjxmzwo.png" />
