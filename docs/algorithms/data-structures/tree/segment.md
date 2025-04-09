---
sidebar_position: 5
title: Дерево отрезков
description: Дерево отрезков
keywords: ['javascript', 'js', 'data structures', 'структуры данных']
tags: ['javascript', 'js', 'data structures', 'структуры данных']
---

# Дерево отрезков

__Описание__

- [Википедия](https://ru.wikipedia.org/wiki/%D0%94%D0%B5%D1%80%D0%B5%D0%B2%D0%BE_%D0%BE%D1%82%D1%80%D0%B5%D0%B7%D0%BA%D0%BE%D0%B2)
- [YouTube](https://www.youtube.com/watch?v=LEkEPE_BKQY)
- [GitHub](https://github.com/harryheman/algorithms-data-structures/blob/main/src/data-structures/tree/segment-tree.js)

Дерево отрезков (сегментов) (segment tree), также известное как статистическое дерево (statistic tree) - это структура данных, которая используется для хранения информации об отрезках (сегментах, диапазонах). Эта структура данных позволяет запрашивать, какой сегмент содержит определенное значение. По сути, дерево отрезков является статичной структурой данных - ее структура не может меняться после создания.

Дерево отрезков - это двоичное дерево (binary tree, см. часть 3, раздел 9). Корень дерева представляет весь массив. Потомки дерева представляют левую и правую половины массива. Аналогично, потомки каждого узла представляют половины массива, соответствующего узлу.

Дерево строится снизу вверх. Значение предка - это значение минимального потомка (или другое значение в зависимости от переданной функции). Построение дерева занимает время `O(n log n)`. Количество операций - это высота дерева и равняется `O(n log n)`. Для выполнения запросов диапазона (range queries) каждый узел разбивает запрос на две части, по одному подзапросу для каждого потомка. Если запрос содержит весь подмассив узла, мы можем вернуть предварительно вычисленное значение узла. Эта оптимизация позволяет добиться `O(n log n)` операций.

<img src="https://habrastorage.org/webt/gi/i6/uy/gii6uyehmtmmktqk9hlkz8zj0_w.png" />
<br />

<img src="https://habrastorage.org/webt/kw/ah/sd/kwahsdixbt1ir6lu1uvpgaph3ak.png" />
<br />

__Случаи применения__

Дерево отрезков - это структура данных, спроектированная для эффективного выполнения некоторых операций с массивами, особенно, операций, включающих запросы диапазона.

Такие деревья часто применяются в вычислительной геометрии и географических информационных системах.

Наша реализация дерева отрезков будет принимать любую функцию (принимающую два параметра), позволяя выполнять разные запросы диапазона.

Интерактивную визуализацию дерева отрезков можно посмотреть [здесь](https://visualgo.net/en/segmenttree).

__Сложность__

_Временная_

| Поиск       | Запрос диапазона |
|-------------|------------------|
| `O(log(n))` | `O(log(n))`      |

_Пространственная_

`O(n)`

__Реализация__

Начнем с реализации вспомогательной функции определения того, является ли переданное число результатом возведения числа 2 в какую-либо степень:

```javascript
// algorithms/math/is-power-of-two.js
export default function isPowerOfTwo(n) {
  // 1 (2^0) - это наименьший результат возведения числа 2 в какую-либо степень
  if (n < 1) return false

  // Выясняем, можем ли мы разделить переданное число на 2 без остатка
  let _n = n
  while (_n !== 1) {
    // Ненулевой остаток свидетельствует о том,
    // что переданное число не может быть результатом возведения числа 2
    // в какую - либо степень
    if (_n % 2 !== 0) return false
    _n /= 2
  }

  return true
}
```

Напишем тест для этой функции:

```javascript
// algorithms/math/__tests__/is-power-of-two.test.js
import isPowerOfTwo from '../is-power-of-two'

describe('isPowerOfTwo', () => {
  it('должен проверить, является ли переданное число результатом возведения числа 2 в какую-либо степень', () => {
    expect(isPowerOfTwo(-1)).toBe(false)
    expect(isPowerOfTwo(0)).toBe(false)
    expect(isPowerOfTwo(1)).toBe(true)
    expect(isPowerOfTwo(2)).toBe(true)
    expect(isPowerOfTwo(3)).toBe(false)
    expect(isPowerOfTwo(4)).toBe(true)
    expect(isPowerOfTwo(5)).toBe(false)
    expect(isPowerOfTwo(6)).toBe(false)
    expect(isPowerOfTwo(7)).toBe(false)
    expect(isPowerOfTwo(8)).toBe(true)
    expect(isPowerOfTwo(10)).toBe(false)
    expect(isPowerOfTwo(12)).toBe(false)
    expect(isPowerOfTwo(16)).toBe(true)
    expect(isPowerOfTwo(31)).toBe(false)
    expect(isPowerOfTwo(64)).toBe(true)
    expect(isPowerOfTwo(1024)).toBe(true)
    expect(isPowerOfTwo(1023)).toBe(false)
  })
})
```

Запускаем этот тест:

```bash
npm run test ./algorithms/math/__tests__/is-power-of-two
```

<img src="https://habrastorage.org/webt/v6/mp/f2/v6mpf2eclwiht3s28ion_rwa-e0.png" />
<br />

Приступаем к реализации дерева:

```javascript
// data-structures/tree/segment-tree.js
// Функция определения того, является ли переданное число
// результатом возведения числа 2 в какую-либо степень
// (далее - степенью 2)
import isPowerOfTwo from '../../algorithms/math/is-power-of-two'

export default class SegmentTree {
  constructor(arr, fn, fb) {
    this.arr = arr
    // Основная операция
    this.fn = fn
    // Резервная операция
    this.fb = fb
    // Инициализируем представление дерева в виде массива
    this.tree = this.initTree(arr)
    // Строим дерево
    this.buildTree()
  }
}
```

Метод инициализации дерева в виде массива:

```javascript
// Инициализирует представление дерева в виде массива
initTree(arr) {
  let treeLength
  const arrLength = arr.length

  if (isPowerOfTwo(arrLength)) {
    // Если длина массива является степенью 2
    treeLength = arrLength * 2 - 1
  } else {
    // Если длина массива не является степенью 2,
    // нужно найти следующее число, которое является таковым,
    // и использовать его для вычисления длины дерева.
    // Это обусловлено тем, что пустые потомки идеального
    // бинарного дерева должны быть заполнены `null`
    const currentPower = Math.floor(Math.log2(arrLength))
    const nextPower = currentPower + 1
    const nextPowerOfTwoN = 2 ** nextPower

    treeLength = nextPowerOfTwoN * 2 - 1
  }

  return new Array(treeLength).fill(null)
}
```

Метод построения дерева:

```javascript
// Строит дерево
buildTree() {
  const leftIndex = 0
  const rightIndex = this.arr.length - 1
  const position = 0
  // Обращаемся к рекурсии
  this.buildTreeRecursively(leftIndex, rightIndex, position)
}

// Строит дерево рекурсивно
buildTreeRecursively(leftIndex, rightIndex, position) {
  // Если левый и правый индексы совпадают, значит,
  // мы закончили деление пополам и добрались до листового узла.
  // Значение листа нужно копировать из массива в дерево
  if (leftIndex === rightIndex) {
    this.tree[position] = this.arr[leftIndex]
    return
  }

  // Делим массив на две равные части и обрабатываем каждую рекурсивно
  const middleIndex = Math.floor((leftIndex + rightIndex) / 2)
  // Обрабатываем левую половину
  this.buildTreeRecursively(
    leftIndex,
    middleIndex,
    this.getLeftChildIndex(position),
  )
  // Обрабатываем правую половину
  this.buildTreeRecursively(
    middleIndex + 1,
    rightIndex,
    this.getRightChildIndex(position),
  )

  // После заполнения всех листьев,
  // мы можем построить дерево снизу вверх
  // с помощью переданной функции
  this.tree[position] = this.fn(
    this.tree[this.getLeftChildIndex(position)],
    this.tree[this.getRightChildIndex(position)],
  )
}
```

Метод выполнения запроса диапазона:

```javascript
// Выполняет запрос диапазона
rangeQuery(queryLeftIndex, queryRightIndex) {
  const leftIndex = 0
  const rightIndex = this.arr.length - 1
  const position = 0
  // Обращаемся к рекурсии
  return this.rangeQueryRecursively(
    queryLeftIndex,
    queryRightIndex,
    leftIndex,
    rightIndex,
    position,
  )
}

// Выполняет запрос диапазона рекурсивно
rangeQueryRecursively(
  queryLeftIndex,
  queryRightIndex,
  leftIndex,
  rightIndex,
  position,
) {
  if (queryLeftIndex <= leftIndex && queryRightIndex >= rightIndex) {
    // Полное перекрытие
    return this.tree[position]
  }

  if (queryLeftIndex > rightIndex || queryRightIndex < leftIndex) {
    // Перекрытие отсутствует
    return this.fb
  }

  // Частичное перекрытие
  const middleIndex = Math.floor((leftIndex + rightIndex) / 2)
  const leftFnResult = this.rangeQueryRecursively(
    queryLeftIndex,
    queryRightIndex,
    leftIndex,
    middleIndex,
    this.getLeftChildIndex(position),
  )
  const rightFnResult = this.rangeQueryRecursively(
    queryLeftIndex,
    queryRightIndex,
    middleIndex + 1,
    rightIndex,
    this.getRightChildIndex(position),
  )

  // Обрабатываем узлы с помощью переданной функции
  // и возвращаем результат
  return this.fn(leftFnResult, rightFnResult)
}
```

Вспомогательные методы получения индексов потомков:

```javascript
// Возвращает индекс левого потомка
getLeftChildIndex(parentIndex) {
  return parentIndex * 2 + 1
}

// Возвращает индекс правого потомка
getRightChildIndex(parentIndex) {
  return parentIndex * 2 + 2
}
```

<details>
<summary>Полный код дерева отрезков</summary>

```javascript
// Функция определения того, является ли переданное число
// результатом возведения числа 2 в какую-либо степень
// (далее - степенью 2)
import isPowerOfTwo from '../../algorithms/math/is-power-of-two'

export default class SegmentTree {
  constructor(arr, fn, fb) {
    this.arr = arr
    // Основная операция
    this.fn = fn
    // Резервная операция
    this.fb = fb
    // Инициализируем представление дерева в виде массива
    this.tree = this.initTree(arr)
    // Строим дерево
    this.buildTree()
  }

  // Инициализирует представление дерева в виде массива
  initTree(arr) {
    let treeLength
    const arrLength = arr.length

    if (isPowerOfTwo(arrLength)) {
      // Если длина массива является степенью 2
      treeLength = arrLength * 2 - 1
    } else {
      // Если длина массива не является степенью 2,
      // нужно найти следующее число, которое является таковым,
      // и использовать его для вычисления длины дерева.
      // Это обусловлено тем, что пустые потомки идеального
      // бинарного дерева должны быть заполнены `null`
      const currentPower = Math.floor(Math.log2(arrLength))
      const nextPower = currentPower + 1
      const nextPowerOfTwoN = 2 ** nextPower

      treeLength = nextPowerOfTwoN * 2 - 1
    }

    return new Array(treeLength).fill(null)
  }

  // Строит дерево
  buildTree() {
    const leftIndex = 0
    const rightIndex = this.arr.length - 1
    const position = 0
    // Обращаемся к рекурсии
    this.buildTreeRecursively(leftIndex, rightIndex, position)
  }

  // Строит дерево рекурсивно
  buildTreeRecursively(leftIndex, rightIndex, position) {
    // Если левый и правый индексы совпадают, значит,
    // мы закончили деление пополам и добрались до листового узла.
    // Значение листа нужно копировать из массива в дерево
    if (leftIndex === rightIndex) {
      this.tree[position] = this.arr[leftIndex]
      return
    }

    // Делим массив на две равные части и обрабатываем каждую рекурсивно
    const middleIndex = Math.floor((leftIndex + rightIndex) / 2)
    // Обрабатываем левую половину
    this.buildTreeRecursively(
      leftIndex,
      middleIndex,
      this.getLeftChildIndex(position),
    )
    // Обрабатываем правую половину
    this.buildTreeRecursively(
      middleIndex + 1,
      rightIndex,
      this.getRightChildIndex(position),
    )

    // После заполнения всех листьев,
    // мы можем построить дерево снизу вверх
    // с помощью переданной функции
    this.tree[position] = this.fn(
      this.tree[this.getLeftChildIndex(position)],
      this.tree[this.getRightChildIndex(position)],
    )
  }

  // Выполняет запрос диапазона
  rangeQuery(queryLeftIndex, queryRightIndex) {
    const leftIndex = 0
    const rightIndex = this.arr.length - 1
    const position = 0
    // Обращаемся к рекурсии
    return this.rangeQueryRecursively(
      queryLeftIndex,
      queryRightIndex,
      leftIndex,
      rightIndex,
      position,
    )
  }

  // Выполняет запрос диапазона рекурсивно
  rangeQueryRecursively(
    queryLeftIndex,
    queryRightIndex,
    leftIndex,
    rightIndex,
    position,
  ) {
    if (queryLeftIndex <= leftIndex && queryRightIndex >= rightIndex) {
      // Полное перекрытие
      return this.tree[position]
    }

    if (queryLeftIndex > rightIndex || queryRightIndex < leftIndex) {
      // Перекрытие отсутствует
      return this.fb
    }

    // Частичное перекрытие
    const middleIndex = Math.floor((leftIndex + rightIndex) / 2)
    const leftFnResult = this.rangeQueryRecursively(
      queryLeftIndex,
      queryRightIndex,
      leftIndex,
      middleIndex,
      this.getLeftChildIndex(position),
    )
    const rightFnResult = this.rangeQueryRecursively(
      queryLeftIndex,
      queryRightIndex,
      middleIndex + 1,
      rightIndex,
      this.getRightChildIndex(position),
    )

    // Обрабатываем узлы с помощью переданной функции
    // и возвращаем результат
    return this.fn(leftFnResult, rightFnResult)
  }

  // Возвращает индекс левого потомка
  getLeftChildIndex(parentIndex) {
    return parentIndex * 2 + 1
  }

  // Возвращает индекс правого потомка
  getRightChildIndex(parentIndex) {
    return parentIndex * 2 + 2
  }
}
```

</details>

<details>
<summary>Тесты</summary>

```javascript
// data-structures/tree/__tests__/segment-tree.test.js
import SegmentTree from '../segment-tree'

describe('SegmentTree', () => {
  it('должен построить дерево для массива #0 с длиной, являющейся степенью 2', () => {
    const array = [-1, 2]
    const segmentTree = new SegmentTree(array, Math.min, Infinity)

    expect(segmentTree.tree).toEqual([-1, -1, 2])
    expect(segmentTree.tree.length).toBe(2 * array.length - 1)
  })

  it('должен построить дерево для массива #1 с длиной, являющейся степень 2', () => {
    const array = [-1, 2, 4, 0]
    const segmentTree = new SegmentTree(array, Math.min, Infinity)

    expect(segmentTree.tree).toEqual([-1, -1, 0, -1, 2, 4, 0])
    expect(segmentTree.tree.length).toBe(2 * array.length - 1)
  })

  it('должен построить дерево для массива #0 с длиной, НЕ являющейся степень 2', () => {
    const array = [0, 1, 2]
    const segmentTree = new SegmentTree(array, Math.min, Infinity)

    expect(segmentTree.tree).toEqual([0, 0, 2, 0, 1, null, null])
    expect(segmentTree.tree.length).toBe(2 * 4 - 1)
  })

  it('должен построить дерево для массива #1 с длиной, НЕ являющейся степень 2', () => {
    const array = [-1, 3, 4, 0, 2, 1]
    const segmentTree = new SegmentTree(array, Math.min, Infinity)

    expect(segmentTree.tree).toEqual([
      -1,
      -1,
      0,
      -1,
      4,
      0,
      1,
      -1,
      3,
      null,
      null,
      0,
      2,
      null,
      null,
    ])
    expect(segmentTree.tree.length).toBe(2 * 8 - 1)
  })

  it('должен построить максимальное дерево (предок является максимальным потомком)', () => {
    const array = [-1, 2, 4, 0]
    const segmentTree = new SegmentTree(array, Math.max, -Infinity)

    expect(segmentTree.tree).toEqual([4, 2, 4, -1, 2, 4, 0])
    expect(segmentTree.tree.length).toBe(2 * array.length - 1)
  })

  it('должен построить суммарное дерево (редок является суммой потомков)', () => {
    const array = [-1, 2, 4, 0]
    const segmentTree = new SegmentTree(array, (a, b) => a + b, 0)

    expect(segmentTree.tree).toEqual([5, 1, 4, -1, 2, 4, 0])
    expect(segmentTree.tree.length).toBe(2 * array.length - 1)
  })

  it('должен выполнить минимальный запрос диапазона на массиве с длиной, являющейся степенью 2', () => {
    const array = [-1, 3, 4, 0, 2, 1]
    const segmentTree = new SegmentTree(array, Math.min, Infinity)

    expect(segmentTree.rangeQuery(0, 5)).toBe(-1)
    expect(segmentTree.rangeQuery(0, 2)).toBe(-1)
    expect(segmentTree.rangeQuery(1, 3)).toBe(0)
    expect(segmentTree.rangeQuery(2, 4)).toBe(0)
    expect(segmentTree.rangeQuery(4, 5)).toBe(1)
    expect(segmentTree.rangeQuery(2, 2)).toBe(4)
  })

  it('должен выполнить минимальный запрос диапазона на массиве с длиной, НЕ являющейся степенью 2', () => {
    const array = [-1, 2, 4, 0]
    const segmentTree = new SegmentTree(array, Math.min, Infinity)

    expect(segmentTree.rangeQuery(0, 4)).toBe(-1)
    expect(segmentTree.rangeQuery(0, 1)).toBe(-1)
    expect(segmentTree.rangeQuery(1, 3)).toBe(0)
    expect(segmentTree.rangeQuery(1, 2)).toBe(2)
    expect(segmentTree.rangeQuery(2, 3)).toBe(0)
    expect(segmentTree.rangeQuery(2, 2)).toBe(4)
  })

  it('должен выполнить максимальный запрос диапазона', () => {
    const array = [-1, 3, 4, 0, 2, 1]
    const segmentTree = new SegmentTree(array, Math.max, -Infinity)

    expect(segmentTree.rangeQuery(0, 5)).toBe(4)
    expect(segmentTree.rangeQuery(0, 1)).toBe(3)
    expect(segmentTree.rangeQuery(1, 3)).toBe(4)
    expect(segmentTree.rangeQuery(2, 4)).toBe(4)
    expect(segmentTree.rangeQuery(4, 5)).toBe(2)
    expect(segmentTree.rangeQuery(3, 3)).toBe(0)
  })

  it('должен выполнить суммарный запрос диапазона', () => {
    const array = [-1, 3, 4, 0, 2, 1]
    const segmentTree = new SegmentTree(array, (a, b) => a + b, 0)

    expect(segmentTree.rangeQuery(0, 5)).toBe(9)
    expect(segmentTree.rangeQuery(0, 1)).toBe(2)
    expect(segmentTree.rangeQuery(1, 3)).toBe(7)
    expect(segmentTree.rangeQuery(2, 4)).toBe(6)
    expect(segmentTree.rangeQuery(4, 5)).toBe(3)
    expect(segmentTree.rangeQuery(3, 3)).toBe(0)
  })
})
```

</details>

Запускаем тесты:

```bash
npm run test ./data-structures/tree/__tests__/segment-tree
```

<img src="https://habrastorage.org/webt/0m/kn/cj/0mkncjga7hmkci-0ebhg_ae7yy4.png" />
