---
sidebar_position: 2
title: Поиск в глубину
description: Поиск в глубину
keywords: ['javascript', 'js', 'algorithms', 'алгоритмы']
tags: ['javascript', 'js', 'algorithms', 'алгоритмы']
---

# Поиск в глубину

__Описание__

- [Обход дерева. Поиск в глубину](../tree.md)
- [GitHub](https://github.com/harryheman/algorithms-data-structures/blob/main/src/algorithms/graphs/depth-first-search.js)

__Реализация__

При обходе графа, в отличие от обхода дерева, необходимо отслеживать посещенные узлы. Это обусловлено тем, что в дереве нет циклов и в любую вершину можно прийти только одним способом. Поэтому во время обхода из вершины есть ровно одно ребро к уже посещенному предку, а все остальные ребра ведут в новые вершины:

```javascript
// algorithms/graphs/depth-first-search.js
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

// Функция принимает граф, текущий и предыдущий узлы, а также обработчики
function depthFirstSearchRecursive(
  graph,
  currentNode,
  previousNode,
  callbacks,
) {
  // Вызываем обработчик вхождения в узел
  callbacks.enterNode({ currentNode, previousNode })

  // Перебираем соседей текущего узла
  graph.getNeighbors(currentNode).forEach((nextNode) => {
    // Если узел не был посещен
    if (callbacks.allowTraverse({ previousNode, currentNode, nextNode })) {
      // Обходим его
      depthFirstSearchRecursive(graph, nextNode, currentNode, callbacks)
    }
  })

  // Вызываем обработчик выхода из узла
  callbacks.leaveNode({ currentNode, previousNode })
}

// Функция принимает граф, начальный узел и обработчики
export default function depthFirstSearch(graph, startNode, callbacks) {
  // Инициализируем обработчики
  const _callbacks = initCallbacks(callbacks)
  // Обходим граф
  depthFirstSearchRecursive(graph, startNode, null, _callbacks)
}
```

<details>
<summary>Тесты</summary>

```javascript
// algorithms/graphs/__tests__/depth-first-search.test.js
import GraphEdge from '../../../data-structures/graph/edge'
import Graph from '../../../data-structures/graph/index'
import GraphNode from '../../../data-structures/graph/node'
import depthFirstSearch from '../depth-first-search'

describe('depthFirstSearch', () => {
  it('должен выполнить поиск в глубину по графу', () => {
    const graph = new Graph(true)

    const nodeA = new GraphNode('A')
    const nodeB = new GraphNode('B')
    const nodeC = new GraphNode('C')
    const nodeD = new GraphNode('D')
    const nodeE = new GraphNode('E')
    const nodeF = new GraphNode('F')
    const nodeG = new GraphNode('G')

    const edgeAB = new GraphEdge(nodeA, nodeB)
    const edgeBC = new GraphEdge(nodeB, nodeC)
    const edgeCG = new GraphEdge(nodeC, nodeG)
    const edgeAD = new GraphEdge(nodeA, nodeD)
    const edgeAE = new GraphEdge(nodeA, nodeE)
    const edgeEF = new GraphEdge(nodeE, nodeF)
    const edgeFD = new GraphEdge(nodeF, nodeD)
    const edgeDG = new GraphEdge(nodeD, nodeG)

    graph
      .addEdge(edgeAB)
      .addEdge(edgeBC)
      .addEdge(edgeCG)
      .addEdge(edgeAD)
      .addEdge(edgeAE)
      .addEdge(edgeEF)
      .addEdge(edgeFD)
      .addEdge(edgeDG)

    expect(graph.toString()).toBe('A,B,C,G,D,E,F')

    const enterNodeCallback = jest.fn()
    const leaveNodeCallback = jest.fn()

    // Обходим граф с дефолтными обработчиками
    depthFirstSearch(graph, nodeA)

    // Обходим граф с кастомными обработчиками
    depthFirstSearch(graph, nodeA, {
      enterNode: enterNodeCallback,
      leaveNode: leaveNodeCallback,
    })

    expect(enterNodeCallback).toHaveBeenCalledTimes(graph.getAllNodes().length)
    expect(leaveNodeCallback).toHaveBeenCalledTimes(graph.getAllNodes().length)

    const enterNodeParamsMap = [
      { currentNode: nodeA, previousNode: null },
      { currentNode: nodeB, previousNode: nodeA },
      { currentNode: nodeC, previousNode: nodeB },
      { currentNode: nodeG, previousNode: nodeC },
      { currentNode: nodeD, previousNode: nodeA },
      { currentNode: nodeE, previousNode: nodeA },
      { currentNode: nodeF, previousNode: nodeE },
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
      { currentNode: nodeG, previousNode: nodeC },
      { currentNode: nodeC, previousNode: nodeB },
      { currentNode: nodeB, previousNode: nodeA },
      { currentNode: nodeD, previousNode: nodeA },
      { currentNode: nodeF, previousNode: nodeE },
      { currentNode: nodeE, previousNode: nodeA },
      { currentNode: nodeA, previousNode: null },
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

    const edgeAB = new GraphEdge(nodeA, nodeB)
    const edgeBC = new GraphEdge(nodeB, nodeC)
    const edgeCG = new GraphEdge(nodeC, nodeG)
    const edgeAD = new GraphEdge(nodeA, nodeD)
    const edgeAE = new GraphEdge(nodeA, nodeE)
    const edgeEF = new GraphEdge(nodeE, nodeF)
    const edgeFD = new GraphEdge(nodeF, nodeD)
    const edgeDG = new GraphEdge(nodeD, nodeG)

    graph
      .addEdge(edgeAB)
      .addEdge(edgeBC)
      .addEdge(edgeCG)
      .addEdge(edgeAD)
      .addEdge(edgeAE)
      .addEdge(edgeEF)
      .addEdge(edgeFD)
      .addEdge(edgeDG)

    expect(graph.toString()).toBe('A,B,C,G,D,E,F')

    const enterNodeCallback = jest.fn()
    const leaveNodeCallback = jest.fn()

    depthFirstSearch(graph, nodeA, {
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
      { currentNode: nodeG, previousNode: nodeD },
      { currentNode: nodeE, previousNode: nodeA },
      { currentNode: nodeF, previousNode: nodeE },
      { currentNode: nodeD, previousNode: nodeF },
      { currentNode: nodeG, previousNode: nodeD },
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
      { currentNode: nodeG, previousNode: nodeD },
      { currentNode: nodeD, previousNode: nodeA },
      { currentNode: nodeG, previousNode: nodeD },
      { currentNode: nodeD, previousNode: nodeF },
      { currentNode: nodeF, previousNode: nodeE },
      { currentNode: nodeE, previousNode: nodeA },
      { currentNode: nodeA, previousNode: null },
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
})
```

</details>

Запускаем тесты:

```bash
npm run test ./algorithms/graphs/__tests__/depth-first-search
```

<img src="https://habrastorage.org/webt/pi/wo/nu/piwonujv0q3fcro_2twyqgz1ong.png" />
