---
sidebar_position: 11
title: Точка сочленения
description: Точка сочленения
keywords: ['javascript', 'js', 'algorithms', 'алгоритмы']
tags: ['javascript', 'js', 'algorithms', 'алгоритмы']
---

# Точка сочленения

__Описание__

- [Википедия](https://ru.wikipedia.org/wiki/%D0%A2%D0%BE%D1%87%D0%BA%D0%B0_%D1%81%D0%BE%D1%87%D0%BB%D0%B5%D0%BD%D0%B5%D0%BD%D0%B8%D1%8F)
- [GeekForGeeks](https://www.geeksforgeeks.org/articulation-points-or-cut-vertices-in-a-graph/)
- [YouTube](https://www.youtube.com/watch?v=2kREIkF9UAs)
- [GitHub](https://github.com/harryheman/algorithms-data-structures/blob/main/src/algorithms/graphs/articulation-points.js)

Точкой сочленения (articulation point) называется вершина графа, при удалении которой количество компонент связности возрастает. Для обозначения этого понятия также используются термины "разделяющая вершина" и "шарнир".

<img src="https://habrastorage.org/webt/xe/7b/cg/xe7bcgrnxiehafg7x5mllx5vswm.png" />
_Каждый цвет представляет компонент связности. Многоцветные вершины - точки сочленения, принадлежащие разным компонентам связности_
<br />

Вершина графа `G` называется шарниром, если подграф `G1`, полученный из графа `G` удалением вершины `v` и всех инцидентных ей ребер, состоит из большего количества компонент связности, чем исходный граф `G`.

С понятием шарнира также связано понятие двусвязности. _Двусвязный граф_ - связный граф, не содержащий шарниров. _Компонента двусвязности_ - максимальный (по включению) двусвязный подграф исходного графа. Компоненты двусвязности иногда называют блоками.

Реберным аналогом шарнира является _мост_. Мостом называется такое ребро графа, в результате удаления которого количество компонент связности в графе возрастает (см. следующий раздел).

<img src="https://habrastorage.org/webt/mk/o-/sa/mko-sanqelzqedhzrxh-g6taqfa.png" />
_Граф, содержащий два шарнира (вершины 2 и 5) и три блока (`1,2`, `2,3,4,5`, `5,6`)_
<br />

__Реализация__

Существует несколько алгоритмов для поиска точек сочленения в графе. В нашей реализации мы в очередной раз прибегнем с старому-доброму [поиску в глубину](./dfs.md):

```javascript
// algorithms/graphs/articulation-points.js
import depthFirstSearch from './depth-first-search'

// Метаданные узла
class VisitMetadata {
  constructor({ discoveryTime, lowDiscoveryTime }) {
    // Время исследования
    this.discoveryTime = discoveryTime
    // Наименьшее время исследования
    this.lowDiscoveryTime = lowDiscoveryTime
    // Счетчик независимых потомков
    this.independentChildrenCount = 0
  }
}

// Функция принимает граф
export default function articulationPoints(graph) {
  // Посещенные вершины
  const visited = {}

  // Точки сочленения
  const articulationPoints = {}

  // Время, необходимое для исследования текущего узла
  // (измеряется в количестве посещений узлов)
  let discoveryTime = 0

  const startNode = graph.getAllNodes()[0]

  // Обработчики для DFS
  const callbacks = {
    // Обработчик вхождения в узел
    enterNode: ({ currentNode, previousNode }) => {
      // Увеличиваем время исследования
      discoveryTime += 1

      // Помещаем текущий узел в посещенные
      visited[currentNode.getKey()] = new VisitMetadata({
        discoveryTime,
        lowDiscoveryTime: discoveryTime,
      })

      if (previousNode) {
        // Обновляем счетчик потомков предыдущего узла
        visited[previousNode.getKey()].independentChildrenCount += 1
      }
    },
    // Обработчик выхода из узла
    leaveNode: ({ currentNode, previousNode }) => {
      if (!previousNode) return

      // Обновляем `lowDiscoveryTime` наименьшим временем соседних узлов
      visited[currentNode.getKey()].lowDiscoveryTime = currentNode
        .getNeighbors()
        .filter((n) => n.getKey() !== previousNode.getKey())
        .reduce((minTime, n) => {
          const lowTime = visited[n.getKey()].lowDiscoveryTime
          return lowTime < minTime ? lowTime : minTime
        }, visited[currentNode.getKey()].lowDiscoveryTime)

      // Определяем, является ли предыдущий узел точкой сочленения.
      // Для этого нужно проверить два условия ИЛИ:
      // 1. Это корневой узел с (минимум) двумя независимыми потомками.
      // 2. Его время исследования <= наименьшее время соседа
      if (previousNode === startNode) {
        // Проверяем, что корневой узел имеет как минимум двух независимых потомков
        if (visited[previousNode.getKey()].independentChildrenCount > 1) {
          articulationPoints[previousNode.getKey()] = previousNode
        }
      } else {
        const currentLDT = visited[currentNode.getKey()].lowDiscoveryTime
        const parentDT = visited[previousNode.getKey()].discoveryTime
        // Проверяем, что время исследования узла <= наименьшее время соседа
        if (parentDT <= currentLDT) {
          articulationPoints[previousNode.getKey()] = previousNode
        }
      }
    },
    // Обработчик определения допустимости исследования узла
    allowTraverse: ({ nextNode }) => {
      // Запрещаем исследование посещенных узлов
      return !visited[nextNode.getKey()]
    },
  }

  // Запускаем поиск в глубину
  depthFirstSearch(graph, startNode, callbacks)

  return articulationPoints
}
```

<details>
<summary>Тесты</summary>

```javascript
// algorithms/graphs/__tests__/articulation-points.test.js
import GraphEdge from '../../../data-structures/graph/edge'
import Graph from '../../../data-structures/graph/index'
import GraphNode from '../../../data-structures/graph/node'
import articulationPoints from '../articulation-points'

describe('articulationPoints', () => {
  it('должен найти точки сочленения в простом графе', () => {
    const nodeA = new GraphNode('A')
    const nodeB = new GraphNode('B')
    const nodeC = new GraphNode('C')
    const nodeD = new GraphNode('D')

    const edgeAB = new GraphEdge(nodeA, nodeB)
    const edgeBC = new GraphEdge(nodeB, nodeC)
    const edgeCD = new GraphEdge(nodeC, nodeD)

    const graph = new Graph()

    graph.addEdge(edgeAB).addEdge(edgeBC).addEdge(edgeCD)

    const articulationPointsSet = Object.values(articulationPoints(graph))

    expect(articulationPointsSet.length).toBe(2)
    expect(articulationPointsSet[0].getKey()).toBe(nodeC.getKey())
    expect(articulationPointsSet[1].getKey()).toBe(nodeB.getKey())
  })

  it('должен найти точки сочленения в простом графе с обратным ребром #1', () => {
    const nodeA = new GraphNode('A')
    const nodeB = new GraphNode('B')
    const nodeC = new GraphNode('C')
    const nodeD = new GraphNode('D')

    const edgeAB = new GraphEdge(nodeA, nodeB)
    const edgeBC = new GraphEdge(nodeB, nodeC)
    const edgeCD = new GraphEdge(nodeC, nodeD)
    const edgeAC = new GraphEdge(nodeA, nodeC)

    const graph = new Graph()

    graph.addEdge(edgeAB).addEdge(edgeAC).addEdge(edgeBC).addEdge(edgeCD)

    const articulationPointsSet = Object.values(articulationPoints(graph))

    expect(articulationPointsSet.length).toBe(1)
    expect(articulationPointsSet[0].getKey()).toBe(nodeC.getKey())
  })

  it('должен найти точки сочленения в простом графе с обратным ребром #2', () => {
    const nodeA = new GraphNode('A')
    const nodeB = new GraphNode('B')
    const nodeC = new GraphNode('C')
    const nodeD = new GraphNode('D')
    const nodeE = new GraphNode('E')

    const edgeAB = new GraphEdge(nodeA, nodeB)
    const edgeBC = new GraphEdge(nodeB, nodeC)
    const edgeCD = new GraphEdge(nodeC, nodeD)
    const edgeAE = new GraphEdge(nodeA, nodeE)
    const edgeCE = new GraphEdge(nodeC, nodeE)

    const graph = new Graph()

    graph
      .addEdge(edgeAB)
      .addEdge(edgeAE)
      .addEdge(edgeCE)
      .addEdge(edgeBC)
      .addEdge(edgeCD)

    const articulationPointsSet = Object.values(articulationPoints(graph))

    expect(articulationPointsSet.length).toBe(1)
    expect(articulationPointsSet[0].getKey()).toBe(nodeC.getKey())
  })

  it('должен найти точки сочленения в графе', () => {
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
    const edgeAC = new GraphEdge(nodeA, nodeC)
    const edgeCD = new GraphEdge(nodeC, nodeD)
    const edgeDE = new GraphEdge(nodeD, nodeE)
    const edgeEG = new GraphEdge(nodeE, nodeG)
    const edgeEF = new GraphEdge(nodeE, nodeF)
    const edgeGF = new GraphEdge(nodeG, nodeF)
    const edgeFH = new GraphEdge(nodeF, nodeH)

    const graph = new Graph()

    graph
      .addEdge(edgeAB)
      .addEdge(edgeBC)
      .addEdge(edgeAC)
      .addEdge(edgeCD)
      .addEdge(edgeDE)
      .addEdge(edgeEG)
      .addEdge(edgeEF)
      .addEdge(edgeGF)
      .addEdge(edgeFH)

    const articulationPointsSet = Object.values(articulationPoints(graph))

    expect(articulationPointsSet.length).toBe(4)
    expect(articulationPointsSet[0].getKey()).toBe(nodeF.getKey())
    expect(articulationPointsSet[1].getKey()).toBe(nodeE.getKey())
    expect(articulationPointsSet[2].getKey()).toBe(nodeD.getKey())
    expect(articulationPointsSet[3].getKey()).toBe(nodeC.getKey())
  })

  it('должен найти точки сочленения в графе, начинающемся с корневого узла-шарнира', () => {
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
    const edgeAC = new GraphEdge(nodeA, nodeC)
    const edgeCD = new GraphEdge(nodeC, nodeD)
    const edgeDE = new GraphEdge(nodeD, nodeE)
    const edgeEG = new GraphEdge(nodeE, nodeG)
    const edgeEF = new GraphEdge(nodeE, nodeF)
    const edgeGF = new GraphEdge(nodeG, nodeF)
    const edgeFH = new GraphEdge(nodeF, nodeH)

    const graph = new Graph()

    graph
      .addEdge(edgeDE)
      .addEdge(edgeAB)
      .addEdge(edgeBC)
      .addEdge(edgeAC)
      .addEdge(edgeCD)
      .addEdge(edgeEG)
      .addEdge(edgeEF)
      .addEdge(edgeGF)
      .addEdge(edgeFH)

    const articulationPointsSet = Object.values(articulationPoints(graph))

    expect(articulationPointsSet.length).toBe(4)
    expect(articulationPointsSet[0].getKey()).toBe(nodeF.getKey())
    expect(articulationPointsSet[1].getKey()).toBe(nodeE.getKey())
    expect(articulationPointsSet[2].getKey()).toBe(nodeC.getKey())
    expect(articulationPointsSet[3].getKey()).toBe(nodeD.getKey())
  })

  it('должен найти точки сочленения еще в одном графе #1', () => {
    const nodeA = new GraphNode('A')
    const nodeB = new GraphNode('B')
    const nodeC = new GraphNode('C')
    const nodeD = new GraphNode('D')
    const nodeE = new GraphNode('E')

    const edgeAB = new GraphEdge(nodeA, nodeB)
    const edgeAC = new GraphEdge(nodeA, nodeC)
    const edgeBC = new GraphEdge(nodeB, nodeC)
    const edgeCD = new GraphEdge(nodeC, nodeD)
    const edgeDE = new GraphEdge(nodeD, nodeE)

    const graph = new Graph()

    graph
      .addEdge(edgeAB)
      .addEdge(edgeAC)
      .addEdge(edgeBC)
      .addEdge(edgeCD)
      .addEdge(edgeDE)

    const articulationPointsSet = Object.values(articulationPoints(graph))

    expect(articulationPointsSet.length).toBe(2)
    expect(articulationPointsSet[0].getKey()).toBe(nodeD.getKey())
    expect(articulationPointsSet[1].getKey()).toBe(nodeC.getKey())
  })

  it('должен найти точки сочленения еще в одном графе #2', () => {
    const nodeA = new GraphNode('A')
    const nodeB = new GraphNode('B')
    const nodeC = new GraphNode('C')
    const nodeD = new GraphNode('D')
    const nodeE = new GraphNode('E')
    const nodeF = new GraphNode('F')
    const nodeG = new GraphNode('G')

    const edgeAB = new GraphEdge(nodeA, nodeB)
    const edgeAC = new GraphEdge(nodeA, nodeC)
    const edgeBC = new GraphEdge(nodeB, nodeC)
    const edgeCD = new GraphEdge(nodeC, nodeD)
    const edgeCE = new GraphEdge(nodeC, nodeE)
    const edgeCF = new GraphEdge(nodeC, nodeF)
    const edgeEG = new GraphEdge(nodeE, nodeG)
    const edgeFG = new GraphEdge(nodeF, nodeG)

    const graph = new Graph()

    graph
      .addEdge(edgeAB)
      .addEdge(edgeAC)
      .addEdge(edgeBC)
      .addEdge(edgeCD)
      .addEdge(edgeCE)
      .addEdge(edgeCF)
      .addEdge(edgeEG)
      .addEdge(edgeFG)

    const articulationPointsSet = Object.values(articulationPoints(graph))

    expect(articulationPointsSet.length).toBe(1)
    expect(articulationPointsSet[0].getKey()).toBe(nodeC.getKey())
  })
})
```

</details>

Запускаем тесты:

```bash
npm run test ./algorithms/graphs/__tests__/articulation-points
```

<img src="https://habrastorage.org/webt/rz/uq/yz/rzuqyznhkbxu8rsqvk_fabvze0s.png" />
