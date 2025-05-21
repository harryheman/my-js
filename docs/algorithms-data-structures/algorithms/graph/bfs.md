---
sidebar_position: 3
title: Поиск в ширину
description: Поиск в ширину
keywords: ['javascript', 'js', 'algorithms', 'алгоритмы']
tags: ['javascript', 'js', 'algorithms', 'алгоритмы']
---

# Поиск в ширину

__Описание__

- [Обход дерева. Поиск в ширину](../tree.md)
- [GitHub](https://github.com/harryheman/algorithms-data-structures/blob/main/src/algorithms/graphs/breadth-first-search.js)

__Реализация__

При обходе графа, в отличие от обхода дерева, необходимо отслеживать посещенные узлы. Это обусловлено тем, что в дереве нет циклов и в любую вершину можно прийти только одним способом. Поэтому во время обхода из вершины есть ровно одно ребро к уже посещенному предку, а все остальные ребра ведут в новые вершины:

```javascript
// algorithms/graphs/breadth-first-search.js
import Queue from '../../data-structures/queue'

// Функция инициализации обработчиков
function initCallbacks(callbacks = {}) {
  const initiatedCallbacks = {}
  const stubCallback = () => {}
  // Замыкание
  const defaultAllowTraverseCallback = (() => {
    // Посещенные узлы
    const traversed = {}
    return ({ nextNode }) => {
      // Пропускаем следующий узел, если он уже был посещен
      if (!traversed[nextNode.getKey()]) {
        traversed[nextNode.getKey()] = true
        return true
      }
      return false
    }
  })()
  initiatedCallbacks.allowTraverse =
    callbacks.allowTraverse || defaultAllowTraverseCallback
  initiatedCallbacks.enterNode = callbacks.enterNode || stubCallback
  initiatedCallbacks.leaveNode = callbacks.leaveNode || stubCallback
  return initiatedCallbacks
}

// Функция принимает граф, начальный узел и обработчики
export default function breadthFirstSearch(graph, startNode, callbacks) {
  // Инициализируем обработчики
  const _callbacks = initCallbacks(callbacks)
  // Создаем очередь
  const queue = new Queue()

  // Добавляем начальный узел в конец очереди
  queue.enqueue(startNode)

  let previousNode = null

  // Пока очередь не является пустой
  while (!queue.isEmpty()) {
    // Извлекаем узел из начала очереди
    const currentNode = queue.dequeue()

    // Вызываем обработчик вхождения в узел
    _callbacks.enterNode({ currentNode, previousNode })

    // Перебираем соседей текущего узла
    graph.getNeighbors(currentNode).forEach((nextNode) => {
      // Если посещение следующего узла разрешено
      if (_callbacks.allowTraverse({ previousNode, currentNode, nextNode })) {
        // Помещаем его в очередь
        queue.enqueue(nextNode)
      }
    })

    // Вызываем обработчик выхода из узла
    _callbacks.leaveNode({ currentNode, previousNode })

    // Запоминаем текущий узел перед следующей итерацией
    previousNode = currentNode
  }
}
```

<details>
<summary>Тесты</summary>

```javascript
// algorithms/graphs/__tests__/breadth-first-search.test.js
import Graph from '../../../data-structures/graph/index'
import GraphNode from '../../../data-structures/graph/node'
import GraphEdge from '../../../data-structures/graph/edge'
import breadthFirstSearch from '../breadth-first-search'

describe('breadthFirstSearch', () => {
  it('должен выполнить поиск в ширину по графу', () => {
    const graph = new Graph(true)

    const nodeA = new GraphNode('A')
    const nodeB = new GraphNode('B')
    const nodeC = new GraphNode('C')
    const nodeD = new GraphNode('D')
    const nodeE = new GraphNode('E')
    const nodeF = new GraphNode('F')
    const nodeG = new GraphNode('G')
    const nodeH = new GraphNode('H')

    const edgeAB = new GraphEdge(nodeA, nodeB)
    const edgeBC = new GraphEdge(nodeB, nodeC)
    const edgeCG = new GraphEdge(nodeC, nodeG)
    const edgeAD = new GraphEdge(nodeA, nodeD)
    const edgeAE = new GraphEdge(nodeA, nodeE)
    const edgeEF = new GraphEdge(nodeE, nodeF)
    const edgeFD = new GraphEdge(nodeF, nodeD)
    const edgeDH = new GraphEdge(nodeD, nodeH)
    const edgeGH = new GraphEdge(nodeG, nodeH)

    graph
      .addEdge(edgeAB)
      .addEdge(edgeBC)
      .addEdge(edgeCG)
      .addEdge(edgeAD)
      .addEdge(edgeAE)
      .addEdge(edgeEF)
      .addEdge(edgeFD)
      .addEdge(edgeDH)
      .addEdge(edgeGH)

    expect(graph.toString()).toBe('A,B,C,G,D,E,F,H')

    const enterNodeCallback = jest.fn()
    const leaveNodeCallback = jest.fn()

    // Обходим граф с дефолтными обработчиками
    breadthFirstSearch(graph, nodeA)

    // Обходим граф с кастомными обработчиками
    breadthFirstSearch(graph, nodeA, {
      enterNode: enterNodeCallback,
      leaveNode: leaveNodeCallback,
    })

    expect(enterNodeCallback).toHaveBeenCalledTimes(8)
    expect(leaveNodeCallback).toHaveBeenCalledTimes(8)

    const enterNodeParamsMap = [
      { currentNode: nodeA, previousNode: null },
      { currentNode: nodeB, previousNode: nodeA },
      { currentNode: nodeD, previousNode: nodeB },
      { currentNode: nodeE, previousNode: nodeD },
      { currentNode: nodeC, previousNode: nodeE },
      { currentNode: nodeH, previousNode: nodeC },
      { currentNode: nodeF, previousNode: nodeH },
      { currentNode: nodeG, previousNode: nodeF },
    ]

    for (
      let callIndex = 0;
      callIndex < graph.getAllNodes().length;
      callIndex += 1
    ) {
      const params = enterNodeCallback.mock.calls[callIndex][0]
      expect(params.currentNode).toEqual(
        enterNodeParamsMap[callIndex].currentNode,
      )
      expect(params.previousNode).toEqual(
        enterNodeParamsMap[callIndex].previousNode,
      )
    }

    const leaveNodeParamsMap = [
      { currentNode: nodeA, previousNode: null },
      { currentNode: nodeB, previousNode: nodeA },
      { currentNode: nodeD, previousNode: nodeB },
      { currentNode: nodeE, previousNode: nodeD },
      { currentNode: nodeC, previousNode: nodeE },
      { currentNode: nodeH, previousNode: nodeC },
      { currentNode: nodeF, previousNode: nodeH },
      { currentNode: nodeG, previousNode: nodeF },
    ]

    for (
      let callIndex = 0;
      callIndex < graph.getAllNodes().length;
      callIndex += 1
    ) {
      const params = leaveNodeCallback.mock.calls[callIndex][0]
      expect(params.currentNode).toEqual(
        leaveNodeParamsMap[callIndex].currentNode,
      )
      expect(params.previousNode).toEqual(
        leaveNodeParamsMap[callIndex].previousNode,
      )
    }
  })

  it('должен проверить возможность кастомизации логики посещения узлов графа', () => {
    const graph = new Graph(true)

    const nodeA = new GraphNode('A')
    const nodeB = new GraphNode('B')
    const nodeC = new GraphNode('C')
    const nodeD = new GraphNode('D')
    const nodeE = new GraphNode('E')
    const nodeF = new GraphNode('F')
    const nodeG = new GraphNode('G')
    const nodeH = new GraphNode('H')

    const edgeAB = new GraphEdge(nodeA, nodeB)
    const edgeBC = new GraphEdge(nodeB, nodeC)
    const edgeCG = new GraphEdge(nodeC, nodeG)
    const edgeAD = new GraphEdge(nodeA, nodeD)
    const edgeAE = new GraphEdge(nodeA, nodeE)
    const edgeEF = new GraphEdge(nodeE, nodeF)
    const edgeFD = new GraphEdge(nodeF, nodeD)
    const edgeDH = new GraphEdge(nodeD, nodeH)
    const edgeGH = new GraphEdge(nodeG, nodeH)

    graph
      .addEdge(edgeAB)
      .addEdge(edgeBC)
      .addEdge(edgeCG)
      .addEdge(edgeAD)
      .addEdge(edgeAE)
      .addEdge(edgeEF)
      .addEdge(edgeFD)
      .addEdge(edgeDH)
      .addEdge(edgeGH)

    expect(graph.toString()).toBe('A,B,C,G,D,E,F,H')

    const enterNodeCallback = jest.fn()
    const leaveNodeCallback = jest.fn()

    // Traverse graph with enterNode and leaveNode callbacks.
    breadthFirstSearch(graph, nodeA, {
      enterNode: enterNodeCallback,
      leaveNode: leaveNodeCallback,
      allowTraverse: ({ currentNode, nextNode }) => {
        return !(currentNode === nodeA && nextNode === nodeB)
      },
    })

    expect(enterNodeCallback).toHaveBeenCalledTimes(7)
    expect(leaveNodeCallback).toHaveBeenCalledTimes(7)

    const enterNodeParamsMap = [
      { currentNode: nodeA, previousNode: null },
      { currentNode: nodeD, previousNode: nodeA },
      { currentNode: nodeE, previousNode: nodeD },
      { currentNode: nodeH, previousNode: nodeE },
      { currentNode: nodeF, previousNode: nodeH },
      { currentNode: nodeD, previousNode: nodeF },
      { currentNode: nodeH, previousNode: nodeD },
    ]

    for (let callIndex = 0; callIndex < 7; callIndex += 1) {
      const params = enterNodeCallback.mock.calls[callIndex][0]
      expect(params.currentNode).toEqual(
        enterNodeParamsMap[callIndex].currentNode,
      )
      expect(params.previousNode).toEqual(
        enterNodeParamsMap[callIndex].previousNode,
      )
    }

    const leaveNodeParamsMap = [
      { currentNode: nodeA, previousNode: null },
      { currentNode: nodeD, previousNode: nodeA },
      { currentNode: nodeE, previousNode: nodeD },
      { currentNode: nodeH, previousNode: nodeE },
      { currentNode: nodeF, previousNode: nodeH },
      { currentNode: nodeD, previousNode: nodeF },
      { currentNode: nodeH, previousNode: nodeD },
    ]

    for (let callIndex = 0; callIndex < 7; callIndex += 1) {
      const params = leaveNodeCallback.mock.calls[callIndex][0]
      expect(params.currentNode).toEqual(
        leaveNodeParamsMap[callIndex].currentNode,
      )
      expect(params.previousNode).toEqual(
        leaveNodeParamsMap[callIndex].previousNode,
      )
    }
  })
})
```

</details>

Запускаем тесты:

```bash
npm run test ./algorithms/graphs/__tests__/breadth-first-search
```

<img src="https://habrastorage.org/webt/zs/bk/9g/zsbk9gcuyojnxfypzbd-9fkyrxk.png" />
