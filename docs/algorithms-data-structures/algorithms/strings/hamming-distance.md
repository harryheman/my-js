---
sidebar_position: 2
title: Расстояние Хэмминга
description: Расстояние Хэмминга
keywords: ['javascript', 'js', 'algorithms', 'алгоритмы']
tags: ['javascript', 'js', 'algorithms', 'алгоритмы']
---

# Расстояние Хэмминга

__Описание__

- [Википедия](https://ru.wikipedia.org/wiki/%D0%A0%D0%B0%D1%81%D1%81%D1%82%D0%BE%D1%8F%D0%BD%D0%B8%D0%B5_%D0%A5%D1%8D%D0%BC%D0%BC%D0%B8%D0%BD%D0%B3%D0%B0)
- [GitHub](https://github.com/harryheman/algorithms-data-structures/blob/main/src/algorithms/strings/hamming-distance.js)

Расстояние Хэмминга (кодовое расстояние) (Hamming distance) - это число позиций, в которых соответствующие символы двух строк одинаковой длины различны. Другими словами, этот алгоритм измеряет минимальное количество замен символов, которые необходимо произвести для преобразования одной строки в другую. В более общем случае расстояние Хэмминга применяется для строк одинаковой длины и служит метрикой различия (функцией, определяющей расстояние в метрическом пространстве) объектов одинаковой размерности.

_Примеры_

Расстояние Хэмминга между:

- `"karolin"` и `"kathrin"` составляет `3`
- `"karolin"` и `"kerstin"` составляет `3`
- `1011101` и `1001001` составляет `2`
- `2173896` и `2233796` составляет `3`

__Реализация__

```javascript
// algorithms/strings/hamming-distance.js
export default function hammingDistance(x, y) {
  if (x.length !== y.length) {
    throw new Error('Строки должны иметь одинаковую длину')
  }

  let distance = 0

  for (let i = 0; i < x.length; i++) {
    if (x[i] !== y[i]) {
      distance++
    }
  }

  return distance
}
```

__Тестирование__

```javascript
// algorithms/strings/__tests__/hamming-distance.test.js
import hammingDistance from '../hamming-distance'

describe('hammingDistance', () => {
  it('должен выбросить исключение при сравнении строк разной длины', () => {
    const compareStringsOfDifferentLength = () => {
      hammingDistance('a', 'aa')
    }

    expect(compareStringsOfDifferentLength).toThrowError()
  })

  it('должен вычислить расстояния Хэмминга между двумя строками', () => {
    expect(hammingDistance('a', 'a')).toBe(0)
    expect(hammingDistance('a', 'b')).toBe(1)
    expect(hammingDistance('abc', 'add')).toBe(2)
    expect(hammingDistance('karolin', 'kathrin')).toBe(3)
    expect(hammingDistance('karolin', 'kerstin')).toBe(3)
    expect(hammingDistance('1011101', '1001001')).toBe(2)
    expect(hammingDistance('2173896', '2233796')).toBe(3)
  })
})
```

Запускаем тесты:

```bash
npm run test ./algorithms/strings/__tests__/hamming-distance
```

<img src="https://habrastorage.org/webt/_m/xt/4d/_mxt4dl8i08uve8frcoerxzyzq4.png" />
