---
sidebar_position: 6
title: Связный список
description: Связный список
keywords: ['javascript', 'js', 'algorithms', 'алгоритмы']
tags: ['javascript', 'js', 'algorithms', 'алгоритмы']
---

# Связный список

- [Википедия](https://ru.wikipedia.org/wiki/%D0%A1%D0%B2%D1%8F%D0%B7%D0%BD%D1%8B%D0%B9_%D1%81%D0%BF%D0%B8%D1%81%D0%BE%D0%BA)
- [GitHub](https://github.com/harryheman/algorithms-data-structures/tree/main/src/algorithms/linked-lists)
- [Связный список - структура данных](../data-structures//linked-list.md)

## Прямой обход

__Описание__

Задача состоит в том, чтобы обойти (посетить каждый узел) связный список в прямом порядке (от головы до хвоста).

Например, для такого связного списка:

<img src="https://habrastorage.org/webt/hv/jt/pv/hvjtpveikro3obl63wiqkxoooky.png" />
<br />

Порядок обхода будет следующим:

```
12 → 99 → 37
```

_Сложность_

Временная сложность данного алгоритма составляет `O(n)`, поскольку мы должны посетить каждый узел и делаем это один раз.

__Реализация__

Реализация алгоритма до неприличия проста:

```javascript
// algorithms/linked-lists/traverse.js
// Функция принимает связный список и обработчик посещения узла
export default function traverse(list, cb) {
  // Берем головной узел
  let node = list.head

  // Пока есть узлы
  while (node) {
    // Обрабатываем узел
    cb(node.value)
    // Берем следующий
    node = node.next
  }
}
```

__Тестирование__

```javascript
// algorithms/linked-lists/__tests__/traverse.js
import LinkedList from '../../../data-structures/linked-list'
import traverse from '../traverse'

describe('traverse', () => {
  it('должен обойти связный список в прямом порядке', () => {
    const linkedList = new LinkedList()

    linkedList.append(1).append(2).append(3)

    const nodeValues = []
    const traversalCallback = (nodeValue) => {
      nodeValues.push(nodeValue)
    }

    traverse(linkedList, traversalCallback)

    expect(nodeValues).toEqual([1, 2, 3])
  })
})
```

## Обратный обход

__Описание__

Задача состоит в том, чтобы обойти (посетить каждый узел) связный список в обратном порядке (от хвоста до головы).

Например, для такого связного списка:

<img src="https://habrastorage.org/webt/hv/jt/pv/hvjtpveikro3obl63wiqkxoooky.png" />
<br />

Порядок обхода будет следующим:

```
37 → 99 → 12
```

_Сложность_

Временная сложность данного алгоритма составляет `O(n)`, поскольку мы должны посетить каждый узел и делаем это один раз.

__Реализация__

Для обхода списка в обратном порядке достаточно применить рекурсию:

```javascript
// algorithms/linked-lists/reversal-traverse.js
// Функция принимает узел и обработчик его посещения
function reversalTraverseRecursive(node, cb) {
  // Пока есть узел
  if (node) {
    // Вызываем функцию со следующим узлом
    reversalTraverseRecursive(node.next, cb)
    // Обрабатываем узел
    cb(node.value)
  }
}

// Функция принимает связный список и обработчик посещения узла
export default function reversalTraverse(list, cb) {
  // Для того, чтобы понять рекурсию, надо сначала понять рекурсию :)
  reversalTraverseRecursive(list.head, cb)
}
```

__Тестирование__

```javascript
// algorithms/linked-lists/__tests__/reversal-traverse.js
import LinkedList from '../../../data-structures/linked-list'
import reversalTraverse from '../reversal-traverse'

describe('reversalTraverse', () => {
  it('должен обойти связный список в обратном порядке', () => {
    const linkedList = new LinkedList()

    linkedList.append(1).append(2).append(3)

    const nodeValues = []
    const traversalCallback = (nodeValue) => {
      nodeValues.push(nodeValue)
    }

    reversalTraverse(linkedList, traversalCallback)

    expect(nodeValues).toEqual([3, 2, 1])
  })
})
```

Запускаем тесты:

```bash
npm run test ./algorithms/linked-lists/__tests__
```

<img src="https://habrastorage.org/webt/du/vp/uz/duvpuzpftvp377eui-pazezramm.png" />
