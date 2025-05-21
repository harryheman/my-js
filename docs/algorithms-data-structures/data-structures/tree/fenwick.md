---
sidebar_position: 6
title: Дерево Фенвика
description: Дерево Фенвика
keywords: ['javascript', 'js', 'data structures', 'структуры данных']
tags: ['javascript', 'js', 'data structures', 'структуры данных']
---

# Дерево Фенвика

__Описание__

- [Википедия](https://ru.wikipedia.org/wiki/%D0%94%D0%B5%D1%80%D0%B5%D0%B2%D0%BE_%D0%A4%D0%B5%D0%BD%D0%B2%D0%B8%D0%BA%D0%B0)
- [YouTube](https://www.youtube.com/watch?v=muW1tOyqUZ4)
- [GitHub](https://github.com/harryheman/algorithms-data-structures/blob/main/src/data-structures/tree/fenwick-tree.js)

Дерево Фенвика (Fenwick tree) или двоичное индексированное дерево (ДИД, binary indexed tree, BIT) - это структура данных, которая позволяет эффективно обновлять элементы и вычислять их суммы.

По сравнению с обычным массивом, ДИД позволяет достичь лучшего баланса между двумя операциями: обновлением элементов и вычислением суммы элементов. В массиве `n` чисел можно хранить либо сами числа, либо их суммы. В первом случае вычисление суммы чисел занимает линейное время. Во втором случае обновление элемента занимает линейное время. Противоположные операции выполняются за константное время. ДИД позволяет выполнять обе операции за время `O(log n)`. Это достигается за счет представления чисел в виде дерева, где значением каждого узла является сумма чисел поддерева. Структура дерева позволяет выполнять операции за `O(log n)` доступов к узлам.

__Особенности реализации__

ДИД представлено в виде массива. Каждый узел дерева хранит сумму узлов некоторого поддерева. Размер ДИД равен `n`, где `n` - размер исходного массива. В нашей реализации будет использоваться размер `n+1` для простоты. Индексация начинается с 1.

<img src="https://habrastorage.org/webt/v-/ox/oz/v-oxozce98rjgk36iyylbb3kgiu.png" />
<br />

_Пример получения суммы элементов с помощью ДИД_

- каждый узел имеет индекс (синий) и значение по индексу (зеленый)
- при запросе суммы `i`, возвращается сумма `BITree[i]` и всех предков `i`
- индекс предка `i` может быть получен с помощью следующей формулы: `parent(i) = i - i & (-i)`. Данная операция удаляет последний установленный бит `i`. Например, если `i=12`, то `parent(i)` вернет `8`

Анимированный пример создания ДИД для массива `[1, 2, 3, 4, 5]` путем добавления элементов одного за другим:

<img src="https://habrastorage.org/webt/pv/8v/1o/pv8v1o_ftl9czbpx9v49fhpafwq.gif" />
<br />

Интерактивную визуализацию ДИД можно посмотреть [здесь](https://visualgo.net/en/fenwicktree).

__Сложность__

_Временная_

| Запрос суммы | Обновление  |
|--------------|-------------|
| `O(log(n))`  | `O(log(n))` |

_Пространственная_

`O(n)`

__Реализация__

Приступаем к реализации дерева Фенвика:

```javascript
// data-structures/tree/fenwick-tree.js
export default class FenwickTree {
  // Конструктор создает дерево Фенвика размера `size`,
  // однако, размер дерева `n+1`, потому что индексация начинается с `1`
  constructor(size) {
    this.size = size
    // Заполняем массив нулями
    this.tree = new Array(size + 1).fill(0)
  }
}
```

Метод добавления значения к существующему на определенной позиции:

```javascript
// Прибавляет значение к существующему на указанной позиции
increase(position, value) {
  if (position < 1 || position > this.size) {
    throw new Error('Позиция находится за пределами разрешенного диапазона')
  }

  // magic! :D
  for (let i = position; i <= this.size; i += i & -i) {
    this.tree[i] += value
  }

  return this
}
```

Метод получения суммы от индекса 1 до определенной позиции:

```javascript
// Возвращает сумму от индекса 1 до указанной позиции
query(position) {
  if (position < 1 || position > this.size) {
    throw new Error('Позиция находится за пределами разрешенного диапазона')
  }

  let sum = 0

  // magic! :D
  for (let i = position; i > 0; i -= i & -i) {
    sum += this.tree[i]
  }

  return sum
}
```

Метод получения суммы между двумя индексами:

```javascript
// Возвращает сумму от `leftIndex` до `rightIndex`
queryRange(leftIndex, rightIndex) {
  if (leftIndex > rightIndex) {
    throw new Error('Левый индекс не может превышать правый')
  }

  if (leftIndex === 1) {
    return this.query(rightIndex)
  }

  return this.query(rightIndex) - this.query(leftIndex - 1)
}
```

<details>
<summary>Полный код дерева Фенвика</summary>

```javascript
export default class FenwickTree {
  // Конструктор создает дерево Фенвика размера `size`,
  // однако, размер дерева `n+1`, потому что индексация начинается с `1`
  constructor(size) {
    this.size = size
    // Заполняем массив нулями
    this.tree = new Array(size + 1).fill(0)
  }

  // Прибавляет значение к существующему на указанной позиции
  increase(position, value) {
    if (position < 1 || position > this.size) {
      throw new Error('Позиция находится за пределами разрешенного диапазона')
    }

    // magic! :D
    for (let i = position; i <= this.size; i += i & -i) {
      this.tree[i] += value
    }

    return this
  }

  // Возвращает сумму от индекса 1 до указанной позиции
  query(position) {
    if (position < 1 || position > this.size) {
      throw new Error('Позиция находится за пределами разрешенного диапазона')
    }

    let sum = 0

    // magic! :D
    for (let i = position; i > 0; i -= i & -i) {
      sum += this.tree[i]
    }

    return sum
  }

  // Возвращает сумму от `leftIndex` до `rightIndex`
  queryRange(leftIndex, rightIndex) {
    if (leftIndex > rightIndex) {
      throw new Error('Левый индекс не может превышать правый')
    }

    if (leftIndex === 1) {
      return this.query(rightIndex)
    }

    return this.query(rightIndex) - this.query(leftIndex - 1)
  }
}
```

</details>

<details>
<summary>Тесты</summary>

```javascript
// data-structures/tree/__tests__/fenwick-tree.test.js
import FenwickTree from '../fenwick-tree'

describe('FenwickTree', () => {
  it('должен создать деревья правильного размера', () => {
    const tree1 = new FenwickTree(5)
    expect(tree1.tree.length).toBe(5 + 1)

    for (let i = 0; i < 5; i += 1) {
      expect(tree1.tree[i]).toBe(0)
    }

    const tree2 = new FenwickTree(50)
    expect(tree2.tree.length).toBe(50 + 1)
  })

  it('должен создать правильное дерево', () => {
    const inputArray = [3, 2, -1, 6, 5, 4, -3, 3, 7, 2, 3]

    const tree = new FenwickTree(inputArray.length)
    expect(tree.tree.length).toBe(inputArray.length + 1)

    inputArray.forEach((value, index) => {
      tree.increase(index + 1, value)
    })

    expect(tree.tree).toEqual([0, 3, 5, -1, 10, 5, 9, -3, 19, 7, 9, 3])

    expect(tree.query(1)).toBe(3)
    expect(tree.query(2)).toBe(5)
    expect(tree.query(3)).toBe(4)
    expect(tree.query(4)).toBe(10)
    expect(tree.query(5)).toBe(15)
    expect(tree.query(6)).toBe(19)
    expect(tree.query(7)).toBe(16)
    expect(tree.query(8)).toBe(19)
    expect(tree.query(9)).toBe(26)
    expect(tree.query(10)).toBe(28)
    expect(tree.query(11)).toBe(31)

    expect(tree.queryRange(1, 1)).toBe(3)
    expect(tree.queryRange(1, 2)).toBe(5)
    expect(tree.queryRange(2, 4)).toBe(7)
    expect(tree.queryRange(6, 9)).toBe(11)

    tree.increase(3, 1)

    expect(tree.query(1)).toBe(3)
    expect(tree.query(2)).toBe(5)
    expect(tree.query(3)).toBe(5)
    expect(tree.query(4)).toBe(11)
    expect(tree.query(5)).toBe(16)
    expect(tree.query(6)).toBe(20)
    expect(tree.query(7)).toBe(17)
    expect(tree.query(8)).toBe(20)
    expect(tree.query(9)).toBe(27)
    expect(tree.query(10)).toBe(29)
    expect(tree.query(11)).toBe(32)

    expect(tree.queryRange(1, 1)).toBe(3)
    expect(tree.queryRange(1, 2)).toBe(5)
    expect(tree.queryRange(2, 4)).toBe(8)
    expect(tree.queryRange(6, 9)).toBe(11)
  })

  it('должен правильно выполнить запросы', () => {
    const tree = new FenwickTree(5)

    tree.increase(1, 4)
    tree.increase(3, 7)

    expect(tree.query(1)).toBe(4)
    expect(tree.query(3)).toBe(11)
    expect(tree.query(5)).toBe(11)
    expect(tree.queryRange(2, 3)).toBe(7)

    tree.increase(2, 5)
    expect(tree.query(5)).toBe(16)

    tree.increase(1, 3)
    expect(tree.queryRange(1, 1)).toBe(7)
    expect(tree.query(5)).toBe(19)
    expect(tree.queryRange(1, 5)).toBe(19)
  })

  it('должен выбросить исключения', () => {
    const tree = new FenwickTree(5)

    const increaseAtInvalidLowIndex = () => {
      tree.increase(0, 1)
    }

    const increaseAtInvalidHighIndex = () => {
      tree.increase(10, 1)
    }

    const queryInvalidLowIndex = () => {
      tree.query(0)
    }

    const queryInvalidHighIndex = () => {
      tree.query(10)
    }

    const rangeQueryInvalidIndex = () => {
      tree.queryRange(3, 2)
    }

    expect(increaseAtInvalidLowIndex).toThrowError()
    expect(increaseAtInvalidHighIndex).toThrowError()
    expect(queryInvalidLowIndex).toThrowError()
    expect(queryInvalidHighIndex).toThrowError()
    expect(rangeQueryInvalidIndex).toThrowError()
  })
})
```

</details>

Запускаем тесты:

```bash
npm run test ./data-structures/tree/__tests__/fenwick-tree
```

<img src="https://habrastorage.org/webt/wd/at/id/wdatid69rzmiw0ysf9pyveyvqqm.png" />
