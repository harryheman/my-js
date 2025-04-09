---
sidebar_position: 7
title: Дерево
description: Дерево
keywords: ['javascript', 'js', 'algorithms', 'алгоритмы']
tags: ['javascript', 'js', 'algorithms', 'алгоритмы']
---

# Дерево

- [Википедия](https://ru.wikipedia.org/wiki/%D0%94%D0%B5%D1%80%D0%B5%D0%B2%D0%BE_(%D1%81%D1%82%D1%80%D1%83%D0%BA%D1%82%D1%83%D1%80%D0%B0_%D0%B4%D0%B0%D0%BD%D0%BD%D1%8B%D1%85))
- [GitHub](https://github.com/harryheman/algorithms-data-structures/tree/main/src/algorithms/trees)
- [Дерево - структура данных](../data-structures//tree/tree.md)

## Поиск в глубину

__Описание__

- [Википедия](https://ru.wikipedia.org/wiki/%D0%9F%D0%BE%D0%B8%D1%81%D0%BA_%D0%B2_%D0%B3%D0%BB%D1%83%D0%B1%D0%B8%D0%BD%D1%83)
- [GeekForGeeks - техники обхода дерева](https://www.geeksforgeeks.org/tree-traversals-inorder-preorder-and-postorder/)
- [GeekForGeeks - BFS и DFS](https://www.geeksforgeeks.org/bfs-vs-dfs-binary-tree/)
- [Визуализация](https://www.cs.usfca.edu/~galles/visualization/DFS.html)

Поиск в глубину (depth-first search, DFS) - один из методов обхода дерева или графа. Стратегия поиска в глубину, как и следует из названия, состоит в том, чтобы идти "вглубь" графа, насколько это возможно. Алгоритм поиска описывается рекурсивно: перебираем все исходящие из рассматриваемой вершины ребра. Если ребро ведет в вершину, которая не была рассмотрена ранее, то запускаем алгоритм от этой нерассмотренной вершины, а после возвращаемся и продолжаем перебирать ребра. Возврат происходит в том случае, если в рассматриваемой вершине не осталось ребер, которые ведут в нерассмотренную вершину. Если после завершения алгоритма не все вершины были рассмотрены, то необходимо запустить алгоритм от одной из нерассмотренных вершин.

<img src="https://habrastorage.org/webt/ig/p-/xt/igp-xtll9abataqmmy_gxlpirmq.gif" />
<br />

_Сложность_

Временная сложность данного алгоритма составляет `O(n)`, поскольку мы должны посетить все узлы и делаем это один раз.

__Реализация__

Реализация данного алгоритма не отличается большой сложностью:

```javascript
// algorithms/trees/depth-first-search.js
// Функция инициализации обработчиков
function initCallbacks(callbacks = {}) {
  const initiatedCallbacks = {}
  const stubCallback = () => {}
  const defaultAllowTraverseCallback = () => true

  // Обработчик определения допустимости обхода
  initiatedCallbacks.allowTraverse =
    callbacks.allowTraverse || defaultAllowTraverseCallback
  // Обработчик вхождения в узел
  initiatedCallbacks.enterNode = callbacks.enterNode || stubCallback
  // Обработчик выхода из узла
  initiatedCallbacks.leaveNode = callbacks.leaveNode || stubCallback

  return initiatedCallbacks
}

// Функция принимает узел и обработчики
function depthFirstSearchRecursive(node, callbacks) {
  // Вызываем обработчик вхождения в узел
  callbacks.enterNode(node)

  // Если имеется левый узел и его обход разрешен
  if (node.left && callbacks.allowTraverse(node, node.left)) {
    // Обходим левое поддерево
    depthFirstSearchRecursive(node.left, callbacks)
  }

  // Если имеется правый узел и его обход разрешен
  if (node.right && callbacks.allowTraverse(node, node.right)) {
    // Обходим правое поддерево
    depthFirstSearchRecursive(node.right, callbacks)
  }

  // Вызываем обработчик выхода из узла
  callbacks.leaveNode(node)
}

// Функция принимает начальный (корневой) узел и обработчики
export default function depthFirstSearch(root, callbacks) {
  // Инициализируем обработчики
  const _callbacks = initCallbacks(callbacks)
  // Запускаем рекурсию
  depthFirstSearchRecursive(root, _callbacks)
}
```

<details>
<summary>Тесты</summary>

```javascript
// algorithms/trees/__tests__/depth-first-search.test.js
import BinaryTreeNode from '../../../data-structures/tree/binary-tree-node'
import depthFirstSearch from '../depth-first-search'

describe('depthFirstSearch', () => {
  it('должен обойти дерево в глубину', () => {
    const nodeA = new BinaryTreeNode('A')
    const nodeB = new BinaryTreeNode('B')
    const nodeC = new BinaryTreeNode('C')
    const nodeD = new BinaryTreeNode('D')
    const nodeE = new BinaryTreeNode('E')
    const nodeF = new BinaryTreeNode('F')
    const nodeG = new BinaryTreeNode('G')

    nodeA.setLeft(nodeB).setRight(nodeC)
    nodeB.setLeft(nodeD).setRight(nodeE)
    nodeC.setLeft(nodeF).setRight(nodeG)

    expect(nodeA.toString()).toBe('D,B,E,A,F,C,G')

    const enterNodeCallback = jest.fn()
    const leaveNodeCallback = jest.fn()

    // Обходим дерево с дефолтными обработчиками
    depthFirstSearch(nodeA)

    // Обходим дерево с кастомными обработчиками
    depthFirstSearch(nodeA, {
      enterNode: enterNodeCallback,
      leaveNode: leaveNodeCallback,
    })

    expect(enterNodeCallback).toHaveBeenCalledTimes(7)
    expect(leaveNodeCallback).toHaveBeenCalledTimes(7)

    // Проверяем вход в узлы
    expect(enterNodeCallback.mock.calls[0][0].value).toEqual('A')
    expect(enterNodeCallback.mock.calls[1][0].value).toEqual('B')
    expect(enterNodeCallback.mock.calls[2][0].value).toEqual('D')
    expect(enterNodeCallback.mock.calls[3][0].value).toEqual('E')
    expect(enterNodeCallback.mock.calls[4][0].value).toEqual('C')
    expect(enterNodeCallback.mock.calls[5][0].value).toEqual('F')
    expect(enterNodeCallback.mock.calls[6][0].value).toEqual('G')

    // Проверяем выход из узлов
    expect(leaveNodeCallback.mock.calls[0][0].value).toEqual('D')
    expect(leaveNodeCallback.mock.calls[1][0].value).toEqual('E')
    expect(leaveNodeCallback.mock.calls[2][0].value).toEqual('B')
    expect(leaveNodeCallback.mock.calls[3][0].value).toEqual('F')
    expect(leaveNodeCallback.mock.calls[4][0].value).toEqual('G')
    expect(leaveNodeCallback.mock.calls[5][0].value).toEqual('C')
    expect(leaveNodeCallback.mock.calls[6][0].value).toEqual('A')
  })

  it('должен проверить возможность кастомизации обработчиков', () => {
    const nodeA = new BinaryTreeNode('A')
    const nodeB = new BinaryTreeNode('B')
    const nodeC = new BinaryTreeNode('C')
    const nodeD = new BinaryTreeNode('D')
    const nodeE = new BinaryTreeNode('E')
    const nodeF = new BinaryTreeNode('F')
    const nodeG = new BinaryTreeNode('G')

    nodeA.setLeft(nodeB).setRight(nodeC)
    nodeB.setLeft(nodeD).setRight(nodeE)
    nodeC.setLeft(nodeF).setRight(nodeG)

    expect(nodeA.toString()).toBe('D,B,E,A,F,C,G')

    const enterNodeCallback = jest.fn()
    const leaveNodeCallback = jest.fn()

    // Обходим дерево с дефолтными обработчиками
    depthFirstSearch(nodeA)

    // Обходим дерево с кастомными обработчиками
    depthFirstSearch(nodeA, {
      allowTraverse: (node, child) => {
        // Запрещаем обход левой части дерева
        return child.value !== 'B'
      },
      enterNode: enterNodeCallback,
      leaveNode: leaveNodeCallback,
    })

    expect(enterNodeCallback).toHaveBeenCalledTimes(4)
    expect(leaveNodeCallback).toHaveBeenCalledTimes(4)

    // Проверяем вход в узлы
    expect(enterNodeCallback.mock.calls[0][0].value).toEqual('A')
    expect(enterNodeCallback.mock.calls[1][0].value).toEqual('C')
    expect(enterNodeCallback.mock.calls[2][0].value).toEqual('F')
    expect(enterNodeCallback.mock.calls[3][0].value).toEqual('G')

    // Проверяем выход из узлов
    expect(leaveNodeCallback.mock.calls[0][0].value).toEqual('F')
    expect(leaveNodeCallback.mock.calls[1][0].value).toEqual('G')
    expect(leaveNodeCallback.mock.calls[2][0].value).toEqual('C')
    expect(leaveNodeCallback.mock.calls[3][0].value).toEqual('A')
  })
})
```

</details>

## Поиск в ширину

__Описание__

- [Википедия](https://ru.wikipedia.org/wiki/%D0%9F%D0%BE%D0%B8%D1%81%D0%BA_%D0%B2_%D1%88%D0%B8%D1%80%D0%B8%D0%BD%D1%83)
- [GeekForGeeks - техники обхода дерева](https://www.geeksforgeeks.org/tree-traversals-inorder-preorder-and-postorder/)
- [GeekForGeeks - BFS и DFS](https://www.geeksforgeeks.org/bfs-vs-dfs-binary-tree/)
- [Визуализация](https://www.cs.usfca.edu/~galles/visualization/BFS.html)

Поиск в ширину (breadth-first search, BFS) - один из методов обхода графа. Пусть задан граф ` G=(V,E)` и выделена исходная вершина `s`. Алгоритм поиска в ширину систематически обходит все ребра `G` для "открытия" всех вершин, достижимых из `s`, вычисляя при этом расстояние (минимальное количество ребер) от `s` до каждой достижимой вершины.

Поиск в ширину имеет такое название потому, что в процессе обхода мы идем вширь, то есть перед тем как приступить к поиску вершин на расстоянии `k+1`, выполняется обход вершин на расстоянии `k`.

<img src="https://habrastorage.org/webt/dc/16/jx/dc16jx6vxvyayt2hr_xeebrfxs4.gif" />
<br />

_Сложность_

Временная сложность данного алгоритма составляет `O(n)`, поскольку мы должны посетить все узлы и делаем это один раз.

__Реализация__

Для реализации данного алгоритма воспользуемся такой структурой данных, как [очередь (queue)](../data-structures/queue.md):

```javascript
// algorithms/trees/breadth-first-search.js
import Queue from '../../data-structures/queue'

// Функция инициализации обработчиков
function initCallbacks(callbacks = {}) {
  const initiatedCallbacks = {}
  const stubCallback = () => {}
  const defaultAllowTraverseCallback = () => true

  // Обработчик определения допустимости обхода
  initiatedCallbacks.allowTraverse =
    callbacks.allowTraverse || defaultAllowTraverseCallback
  // Обработчик вхождения в узел
  initiatedCallbacks.enterNode = callbacks.enterNode || stubCallback
  // Обработчик выхода из узла
  initiatedCallbacks.leaveNode = callbacks.leaveNode || stubCallback

  return initiatedCallbacks
}

// Функция принимает начальный (корневой) узел и обработчики
export default function breadthFirstSearch(root, callbacks) {
  // Инициализируем обработчики
  const _callbacks = initCallbacks(callbacks)
  // Создаем очередь
  const queue = new Queue()

  // Добавляем корневой узел в конец очереди
  queue.enqueue(root)

  // Пока в очереди есть элементы
  while (!queue.isEmpty()) {
    // Берем узел из начала очереди
    const node = queue.dequeue()

    // Вызываем обработчик вхождения в узел
    _callbacks.enterNode(node)

    // Если имеется левый узел и его обход разрешен
    if (node.left && _callbacks.allowTraverse(node, node.left)) {
      // Добавляем его в конец очереди
      queue.enqueue(node.left)
    }

    // Если имеется правый узел и его обход разрешен
    if (node.right && _callbacks.allowTraverse(node, node.right)) {
      // Добавляем его в конец очереди
      queue.enqueue(node.right)
    }

    // Вызываем обработчик выхода в узел
    _callbacks.leaveNode(node)
  }
}
```

<details>
<summary>Тесты</summary>

```javascript
// algorithms/trees/__tests__/breadth-first-search.test.js
import BinaryTreeNode from '../../../data-structures/tree/binary-tree-node'
import breadthFirstSearch from '../breadth-first-search'

describe('breadthFirstSearch', () => {
  it('должен обойти дерево в ширину', () => {
    const nodeA = new BinaryTreeNode('A')
    const nodeB = new BinaryTreeNode('B')
    const nodeC = new BinaryTreeNode('C')
    const nodeD = new BinaryTreeNode('D')
    const nodeE = new BinaryTreeNode('E')
    const nodeF = new BinaryTreeNode('F')
    const nodeG = new BinaryTreeNode('G')

    nodeA.setLeft(nodeB).setRight(nodeC)
    nodeB.setLeft(nodeD).setRight(nodeE)
    nodeC.setLeft(nodeF).setRight(nodeG)

    expect(nodeA.toString()).toBe('D,B,E,A,F,C,G')

    const enterNodeCallback = jest.fn()
    const leaveNodeCallback = jest.fn()

    // Обходим дерево с дефолтными обработчиками
    breadthFirstSearch(nodeA)

    // Обходим дерево с кастомными обработчиками
    breadthFirstSearch(nodeA, {
      enterNode: enterNodeCallback,
      leaveNode: leaveNodeCallback,
    })

    expect(enterNodeCallback).toHaveBeenCalledTimes(7)
    expect(leaveNodeCallback).toHaveBeenCalledTimes(7)

    // Проверяем вход в узлы
    expect(enterNodeCallback.mock.calls[0][0].value).toEqual('A')
    expect(enterNodeCallback.mock.calls[1][0].value).toEqual('B')
    expect(enterNodeCallback.mock.calls[2][0].value).toEqual('C')
    expect(enterNodeCallback.mock.calls[3][0].value).toEqual('D')
    expect(enterNodeCallback.mock.calls[4][0].value).toEqual('E')
    expect(enterNodeCallback.mock.calls[5][0].value).toEqual('F')
    expect(enterNodeCallback.mock.calls[6][0].value).toEqual('G')

    // Проверяем выход из узлов
    expect(leaveNodeCallback.mock.calls[0][0].value).toEqual('A')
    expect(leaveNodeCallback.mock.calls[1][0].value).toEqual('B')
    expect(leaveNodeCallback.mock.calls[2][0].value).toEqual('C')
    expect(leaveNodeCallback.mock.calls[3][0].value).toEqual('D')
    expect(leaveNodeCallback.mock.calls[4][0].value).toEqual('E')
    expect(leaveNodeCallback.mock.calls[5][0].value).toEqual('F')
    expect(leaveNodeCallback.mock.calls[6][0].value).toEqual('G')
  })

  it('должен проверить возможность кастомизации обработчиками', () => {
    const nodeA = new BinaryTreeNode('A')
    const nodeB = new BinaryTreeNode('B')
    const nodeC = new BinaryTreeNode('C')
    const nodeD = new BinaryTreeNode('D')
    const nodeE = new BinaryTreeNode('E')
    const nodeF = new BinaryTreeNode('F')
    const nodeG = new BinaryTreeNode('G')

    nodeA.setLeft(nodeB).setRight(nodeC)
    nodeB.setLeft(nodeD).setRight(nodeE)
    nodeC.setLeft(nodeF).setRight(nodeG)

    expect(nodeA.toString()).toBe('D,B,E,A,F,C,G')

    const enterNodeCallback = jest.fn()
    const leaveNodeCallback = jest.fn()

    // Обходим дерево с дефолтными обработчиками
    breadthFirstSearch(nodeA)

    // Обходим дерево с кастомными обработчиками
    breadthFirstSearch(nodeA, {
      allowTraverse: (_, child) => {
        // Запрещаем обход левой части дерева
        return child.value !== 'B'
      },
      enterNode: enterNodeCallback,
      leaveNode: leaveNodeCallback,
    })

    expect(enterNodeCallback).toHaveBeenCalledTimes(4)
    expect(leaveNodeCallback).toHaveBeenCalledTimes(4)

    // Проверяем вход в узлы
    expect(enterNodeCallback.mock.calls[0][0].value).toEqual('A')
    expect(enterNodeCallback.mock.calls[1][0].value).toEqual('C')
    expect(enterNodeCallback.mock.calls[2][0].value).toEqual('F')
    expect(enterNodeCallback.mock.calls[3][0].value).toEqual('G')

    // Проверяем выход из узлов
    expect(leaveNodeCallback.mock.calls[0][0].value).toEqual('A')
    expect(leaveNodeCallback.mock.calls[1][0].value).toEqual('C')
    expect(leaveNodeCallback.mock.calls[2][0].value).toEqual('F')
    expect(leaveNodeCallback.mock.calls[3][0].value).toEqual('G')
  })
})
```

</details>

Запускаем тесты:

```bash
npm run test ./algorithms/trees/__tests__
```

<img src="https://habrastorage.org/webt/m_/vb/wu/m_vbwudxdlj6xiozw_elaq1-6cq.png" />
