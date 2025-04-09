---
sidebar_position: 2
title: Прямое произведение
description: Прямое произведение
keywords: ['javascript', 'js', 'algorithms', 'алгоритмы']
tags: ['javascript', 'js', 'algorithms', 'алгоритмы']
---

# Прямое произведение

__Описание__

- [Википедия](https://ru.wikipedia.org/wiki/%D0%9F%D1%80%D1%8F%D0%BC%D0%BE%D0%B5_%D0%BF%D1%80%D0%BE%D0%B8%D0%B7%D0%B2%D0%B5%D0%B4%D0%B5%D0%BD%D0%B8%D0%B5)
- [GitHub](https://github.com/harryheman/algorithms-data-structures/blob/main/src/algorithms/sets/cartesian-product.js)

В теории множеств прямое (декартово) произведение (Cartesian product) - это математическая операция, которая возвращает множество, элементами которого являются все возможные упорядоченные пары элементов исходных множеств. Таким образом, для множеств `A` и `B` прямое произведение - это множество упорядоченных пар `(a, b)`, где `a ∈ A` и `b ∈ B`.

Прямое произведение `A x B` множеств `A={ x, y, z }` и `B={ 1, 2, 3 }`:

<img src="https://habrastorage.org/webt/j1/at/wy/j1atwyxjqv2nlhh_5oxgo56sk-c.png" />
<br />

__Реализация__

```javascript
// algorithms/sets/cartesian-product.js
export default function cartesianProduct(a, b) {
  if (!a?.length || !b?.length) return null

  return a.map((x) => b.map((y) => [x, y])).reduce((a, b) => a.concat(b), [])
}
```

__Тестирование__

```javascript
// algorithms/sets/__tests__/cartesian-product.test.js
import cartesianProduct from '../cartesian-product'

describe('cartesianProduct', () => {
  it('должен вернуть `null` при отсутствии одного из множеств', () => {
    const product1 = cartesianProduct([1], null)
    const product2 = cartesianProduct([], null)

    expect(product1).toBeNull()
    expect(product2).toBeNull()
  })

  it('должен вычислить произведение двух множеств', () => {
    const product1 = cartesianProduct([1], [1])
    const product2 = cartesianProduct([1, 2], [3, 5])

    expect(product1).toEqual([[1, 1]])
    expect(product2).toEqual([
      [1, 3],
      [1, 5],
      [2, 3],
      [2, 5],
    ])
  })
})
```

Запускаем тесты:

```bash
npm run test ./algorithms/sets/__tests__/cartesian-product
```

<img src="https://habrastorage.org/webt/n0/q3/c-/n0q3c-zgti8z7lnj0bibuqdicly.png" />
