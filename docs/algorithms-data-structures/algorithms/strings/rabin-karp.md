---
sidebar_position: 5
title: Алгоритм Рабина-Карпа
description: Алгоритм Рабина-Карпа
keywords: ['javascript', 'js', 'algorithms', 'алгоритмы']
tags: ['javascript', 'js', 'algorithms', 'алгоритмы']
---

# Алгоритм Рабина-Карпа

__Описание__

- [Википедия](https://ru.wikipedia.org/wiki/%D0%90%D0%BB%D0%B3%D0%BE%D1%80%D0%B8%D1%82%D0%BC_%D0%A0%D0%B0%D0%B1%D0%B8%D0%BD%D0%B0_%E2%80%94_%D0%9A%D0%B0%D1%80%D0%BF%D0%B0)
- [YouTube](https://www.youtube.com/watch?v=H4VrKHVG5qI)
- [GitHub](https://github.com/harryheman/algorithms-data-structures/blob/main/src/algorithms/strings/rabin-karp.js)

Алгоритм Рабина-Карпа (Rabin-Karp Algorithm) - это алгоритм поиска строки, который ищет шаблон, то есть подстроку, в тексте, используя хэширование.

- [Отличное видео про хэширование](https://www.youtube.com/watch?v=xV8USnjKGCU)

Алгоритм редко используется для поиска одиночного шаблона, но имеет значительную теоретическую важность и очень эффективен в поиске совпадений множественных шаблонов одинаковой длины. Хэш-функция - это функция, которая преобразует каждую строку в числовое значение, которое называется хэшем. Например, мы можем получить `hash('hello') = 5`. Алгоритм исходит из предположения, что одинаковые строки имеют одинаковый хэш. Поэтому задача поиска подстроки сводится к вычислению хэша искомого паттерна и поиск подстрок входной строки, которые имеют такой же хэш.

Однако у рассматриваемого алгоритма есть две проблемы. Во-первых, строк много, а хэшей мало, поэтому разные строки могут иметь одинаковый хэш. Другими словами, при совпадении хэшей паттерн и подстрока могут не совпадать. Поэтому совпадение паттерна с подстрокой должно проверяться путем их сравнения. Такое сравнение может занять много времени для больших подстрок. К счастью, хорошая функция хэширования, применяемая к строкам разумной длины, как правило, имеет мало коллизий, поэтому ожидаемое время поиска является приемлемым.

_Хэш-функция_

Источником производительности алгоритма Рабина-Карпа является эффективное вычисление хэшей последовательных подстрок текста. Популярной и эффективной скользящей (rolling) хэш-функцией является отпечаток Рабина (Rabin fingerprint).

Мы будем использовать полиномиальную функцию хэширования, которая почти также хороша, как отпечаток Рабина. Она преобразует каждую подстроку в число в некотором основании, причем основанием обычно является большое простое число.

_Сложность_

Для текста длиной `n` и паттернов `p` общей длиной `m` среднее и лучшее время составляет `O(n + m)` в пространстве `O(p)`, в худшем случае время составляет `O(n * m)`.

_Применение_

Одно из простейших практических применений алгоритма Рабина-Карпа состоит в определении плагиата. Алгоритм может быстро находить в документе экземпляры предложений из исходного материала, игнорируя такие детали, как регистр и пунктуация. В этом случае из-за обилия искомых строк алгоритмы однострочного поиска неэффективны.

__Реализация__

Начнем с реализации полиномиальной функции хэширования:

```javascript
// algorithms/cryptography/polynomial-hash.js
const DEFAULT_BASE = 37
const DEFAULT_MODULUS = 101

export default class PolynomialHash {
  /**
   * @param {number} [base] - Базовое число, которое используется для создания полинома.
   * @param {number} [modulus] - Модульное число, которое защищает хэш от переполнения.
   */
  constructor({ base = DEFAULT_BASE, modulus = DEFAULT_MODULUS } = {}) {
    this.base = base
    this.modulus = modulus
  }

  /**
   * Функция, создающее хэшированное значение слова.
   *
   * Временная сложность: O(word.length).
   *
   * @param {string} word - Строка для хэширования.
   * @return {number}
   */
  hash(word) {
    const charCodes = Array.from(word).map((char) => this.charToNumber(char))

    let hash = 0
    for (let charIndex = 0; charIndex < charCodes.length; charIndex += 1) {
      hash *= this.base
      hash += charCodes[charIndex]
      hash %= this.modulus
    }

    return hash
  }

  /**
   * Функция, генерирующая хэш слова на основе
   * хэша предыдущего слова (сдвинутого на один символ влево).
   *
   * Повторно вычисляет хэш слова, чтобы не анализировать все слово заново.
   *
   * Временная сложность: O(1).
   *
   * @param {number} prevHash
   * @param {string} prevWord
   * @param {string} newWord
   * @return {number}
   */
  roll(prevHash, prevWord, newWord) {
    let hash = prevHash

    const prevValue = this.charToNumber(prevWord[0])
    const newValue = this.charToNumber(newWord[newWord.length - 1])

    let prevValueMultiplier = 1
    for (let i = 1; i < prevWord.length; i += 1) {
      prevValueMultiplier *= this.base
      prevValueMultiplier %= this.modulus
    }

    hash += this.modulus
    hash -= (prevValue * prevValueMultiplier) % this.modulus

    hash *= this.base
    hash += newValue
    hash %= this.modulus

    return hash
  }

  /**
   * Преобразует символ в число.
   *
   * @param {string} char
   * @return {number}
   */
  charToNumber(char) {
    let charCode = char.codePointAt(0)

    // Проверяем, является ли символ суррогатной парой.
    const surrogate = char.codePointAt(1)
    if (surrogate !== undefined) {
      const surrogateShift = 2 ** 16
      charCode += surrogate * surrogateShift
    }

    return charCode
  }
}
```

Используем эту функцию для реализации алгоритма Рабина-Карпа:

```javascript
// algorithms/strings/rabin-karp.js
import PolynomialHash from '../cryptography/polynomial-hash'

export default function rabinKarp(text, word) {
  const hasher = new PolynomialHash()

  // Вычисляем хэш слова, который будет использоваться для сравнения с хэшами подстрок
  const wordHash = hasher.hash(word)

  let prevFrame = null
  let currentFrameHash = null

  // Перебираем все подстроки текста, которые могут совпасть
  for (let i = 0; i < text.length - word.length + 1; i++) {
    const currentFrame = text.slice(i, i + word.length)

    // Вычисляем хэш текущей подстроки
    if (!currentFrameHash) {
      currentFrameHash = hasher.hash(currentFrame)
    } else {
      currentFrameHash = hasher.roll(currentFrameHash, prevFrame, currentFrame)
    }

    prevFrame = currentFrame

    // Сравниваем хэш текущей подстроки с искомым паттерном.
    // При совпадении хэшей, проверяем равенство подстрок на случай коллизии хэшей
    if (
      wordHash === currentFrameHash &&
      text.slice(i, i + word.length) === word
    ) {
      return i
    }
  }

  return -1
}
```

__Тестирование__

```javascript
// algorithms/strings/__tests__/rabin-karp.test.js
import rabinKarp from '../rabin-karp'

describe('rabinKarp', () => {
  it('должен найти подстроки в строке', () => {
    expect(rabinKarp('', '')).toBe(0)
    expect(rabinKarp('a', '')).toBe(0)
    expect(rabinKarp('a', 'a')).toBe(0)
    expect(rabinKarp('ab', 'b')).toBe(1)
    expect(rabinKarp('abcbcglx', 'abca')).toBe(-1)
    expect(rabinKarp('abcbcglx', 'bcgl')).toBe(3)
    expect(rabinKarp('abcxabcdabxabcdabcdabcy', 'abcdabcy')).toBe(15)
    expect(rabinKarp('abcxabcdabxabcdabcdabcy', 'abcdabca')).toBe(-1)
    expect(rabinKarp('abcxabcdabxaabcdabcabcdabcdabcy', 'abcdabca')).toBe(12)
    expect(rabinKarp('abcxabcdabxaabaabaaaabcdabcdabcy', 'aabaabaaa')).toBe(11)
    expect(rabinKarp("^ !/'#'pp", " !/'#'pp")).toBe(1)
  })

  it('должен работать с большими текстами', () => {
    const text =
      'Lorem Ipsum is simply dummy text of the printing and ' +
      "typesetting industry. Lorem Ipsum has been the industry's standard " +
      'dummy text ever since the 1500s, when an unknown printer took a ' +
      'galley of type and scrambled it to make a type specimen book. It ' +
      'has survived not only five centuries, but also the leap into ' +
      'electronic typesetting, remaining essentially unchanged. It was ' +
      'popularised in the 1960s with the release of Letraset sheets ' +
      'containing Lorem Ipsum passages, and more recently with desktop' +
      'publishing software like Aldus PageMaker including versions of Lorem ' +
      'Ipsum.'

    expect(rabinKarp(text, 'Lorem')).toBe(0)
    expect(rabinKarp(text, 'versions')).toBe(549)
    expect(rabinKarp(text, 'versions of Lorem Ipsum.')).toBe(549)
    expect(rabinKarp(text, 'versions of Lorem Ipsum:')).toBe(-1)
    expect(
      rabinKarp(text, 'Lorem Ipsum passages, and more recently with'),
    ).toBe(446)
  })

  it('должен работать с символами UTF', () => {
    expect(rabinKarp('a\u{ffff}', '\u{ffff}')).toBe(1)
    expect(rabinKarp('\u0000耀\u0000', '耀\u0000')).toBe(1)
  })
})
```

Запускаем тесты:

```bash
npm run test ./algorithms/strings/__tests__/rabin-karp
```

<img src="https://habrastorage.org/webt/zc/nn/ma/zcnnmaofqwh4oitjdzq8bpa5y9k.png" />
