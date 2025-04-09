---
sidebar_position: 6
title: Алгоритм Беллмана-Форда
description: Алгоритм Беллмана-Форда
keywords: ['javascript', 'js', 'algorithms', 'алгоритмы']
tags: ['javascript', 'js', 'algorithms', 'алгоритмы']
---

# Алгоритм Беллмана-Форда

__Описание__

- [Википедия](https://ru.wikipedia.org/wiki/%D0%90%D0%BB%D0%B3%D0%BE%D1%80%D0%B8%D1%82%D0%BC_%D0%91%D0%B5%D0%BB%D0%BB%D0%BC%D0%B0%D0%BD%D0%B0_%E2%80%94_%D0%A4%D0%BE%D1%80%D0%B4%D0%B0)
- [YouTube](https://www.youtube.com/watch?v=cE5n2IKf7W4)
- [GitHub](https://github.com/harryheman/algorithms-data-structures/blob/main/src/algorithms/graphs/bellman-ford.js)

Алгоритм Беллмана-Форда (Bellman-Ford algorithm) - это алгоритм поиска кратчайших путей от одной вершины графа до всех остальных во взвешенном графе. В отличие от алгоритма Дейкстры, данный алгоритм допускает ребра с отрицательным весом.

Алгоритм маршрутизации [RIP](https://ru.wikipedia.org/wiki/RIP2) (алгоритм Беллмана-Форда) был впервые разработан в 1969 году, как основной для сети [ARPANET](https://ru.wikipedia.org/wiki/ARPANET).

<img src="https://habrastorage.org/webt/ap/ln/py/aplnpy4bwiw1fak5qix-zsfusay.gif" />
<br />

_Задача_

Дан ориентированный или неориентированный граф `G` со взвешенными ребрами. Длиной пути назовем сумму весов ребер, входящих в этот путь. Требуется найти кратчайшие пути от выделенной вершины `s` до всех вершин графа.

Заметим, что кратчайших путей может не существовать. Так, в графе, содержащем цикл с отрицательным суммарным весом, существует сколь угодно короткий путь от одной вершины этого цикла до другой (каждый обход цикла уменьшает длину пути). Цикл, сумма весов ребер которого отрицательна, называется отрицательным циклом.

Решение задачи будет зависеть от того, содержит ли граф отрицательные циклы.

_Сложность_

- худшая временная - `O(V x E)`, где `V` - множество вершин, а `E` - множество ребер
- лучшая временная - `O(E)`
- худшая пространственная - `O(V)`

__Реализация__

```javascript
// algorithms/graphs/bellman-ford.js
// Функция принимает граф и начальную вершину
export default function bellmanFord(graph, startNode) {
  // Расстояния
  const distances = {}
  // Предыдущие вершины
  const previous = {}

  // Расстояние до начальной вершины равняется 0
  distances[startNode.getKey()] = 0
  // Все остальные расстояния равняются бесконечности
  graph.getAllNodes().forEach((node) => {
    if (node.getKey() !== startNode.getKey()) {
      distances[node.getKey()] = Infinity
    }
    previous[node.getKey()] = null
  })

  // Нам требуется `V - 1` итераций, где `V` - множество вершин
  for (let i = 0; i < graph.getAllNodes().length - 1; i++) {
    // Перебираем все вершины на каждой итерации
    Object.keys(distances).forEach((key) => {
      const node = graph.getNodeByKey(key)

      // Перебираем все ребра
      graph.getNeighbors(node).forEach((neighbor) => {
        const edge = graph.findEdge(node, neighbor)
        // Проверяем, является ли расстояние до соседа
        // на этой итерации меньше, чем на предыдущей
        const distanceToNeighbor = distances[node.getKey()] + edge.weight
        if (distanceToNeighbor < distances[neighbor.getKey()]) {
          distances[neighbor.getKey()] = distanceToNeighbor
          previous[neighbor.getKey()] = node
        }
      })
    })
  }

  return {
    distances,
    previous,
  }
}
```

<details>
<summary>Тесты</summary>

```javascript
// algorithms/graphs/__tests__/bellman-ford.test.js
import Graph from '../../../data-structures/graph/index'
import GraphNode from '../../../data-structures/graph/node'
import GraphEdge from '../../../data-structures/graph/edge'
import bellmanFord from '../bellman-ford'

describe('bellmanFord', () => {
  it('должен найти минимальные пути до всех вершин ненаправленного графа', () => {
    const nodeA = new GraphNode('A')
    const nodeB = new GraphNode('B')
    const nodeC = new GraphNode('C')
    const nodeD = new GraphNode('D')
    const nodeE = new GraphNode('E')
    const nodeF = new GraphNode('F')
    const nodeG = new GraphNode('G')
    const nodeH = new GraphNode('H')

    const edgeAB = new GraphEdge(nodeA, nodeB, 4)
    const edgeAE = new GraphEdge(nodeA, nodeE, 7)
    const edgeAC = new GraphEdge(nodeA, nodeC, 3)
    const edgeBC = new GraphEdge(nodeB, nodeC, 6)
    const edgeBD = new GraphEdge(nodeB, nodeD, 5)
    const edgeEC = new GraphEdge(nodeE, nodeC, 8)
    const edgeED = new GraphEdge(nodeE, nodeD, 2)
    const edgeDC = new GraphEdge(nodeD, nodeC, 11)
    const edgeDG = new GraphEdge(nodeD, nodeG, 10)
    const edgeDF = new GraphEdge(nodeD, nodeF, 2)
    const edgeFG = new GraphEdge(nodeF, nodeG, 3)
    const edgeEG = new GraphEdge(nodeE, nodeG, 5)

    const graph = new Graph()
    graph
      .addNode(nodeH)
      .addEdge(edgeAB)
      .addEdge(edgeAE)
      .addEdge(edgeAC)
      .addEdge(edgeBC)
      .addEdge(edgeBD)
      .addEdge(edgeEC)
      .addEdge(edgeED)
      .addEdge(edgeDC)
      .addEdge(edgeDG)
      .addEdge(edgeDF)
      .addEdge(edgeFG)
      .addEdge(edgeEG)

    const { distances, previous } = bellmanFord(graph, nodeA)

    expect(distances).toEqual({
      H: Infinity,
      A: 0,
      B: 4,
      E: 7,
      C: 3,
      D: 9,
      G: 12,
      F: 11,
    })

    expect(previous.F.getKey()).toBe('D')
    expect(previous.D.getKey()).toBe('B')
    expect(previous.B.getKey()).toBe('A')
    expect(previous.G.getKey()).toBe('E')
    expect(previous.C.getKey()).toBe('A')
    expect(previous.A).toBeNull()
    expect(previous.H).toBeNull()
  })

  it('должен найти минимальные пути до всех вершин направленного графа с ребрами отрицательного веса', () => {
    const nodeS = new GraphNode('S')
    const nodeE = new GraphNode('E')
    const nodeA = new GraphNode('A')
    const nodeD = new GraphNode('D')
    const nodeB = new GraphNode('B')
    const nodeC = new GraphNode('C')
    const nodeH = new GraphNode('H')

    const edgeSE = new GraphEdge(nodeS, nodeE, 8)
    const edgeSA = new GraphEdge(nodeS, nodeA, 10)
    const edgeED = new GraphEdge(nodeE, nodeD, 1)
    const edgeDA = new GraphEdge(nodeD, nodeA, -4)
    const edgeDC = new GraphEdge(nodeD, nodeC, -1)
    const edgeAC = new GraphEdge(nodeA, nodeC, 2)
    const edgeCB = new GraphEdge(nodeC, nodeB, -2)
    const edgeBA = new GraphEdge(nodeB, nodeA, 1)

    const graph = new Graph(true)
    graph
      .addNode(nodeH)
      .addEdge(edgeSE)
      .addEdge(edgeSA)
      .addEdge(edgeED)
      .addEdge(edgeDA)
      .addEdge(edgeDC)
      .addEdge(edgeAC)
      .addEdge(edgeCB)
      .addEdge(edgeBA)

    const { distances, previous } = bellmanFord(graph, nodeS)

    expect(distances).toEqual({
      H: Infinity,
      S: 0,
      A: 5,
      B: 5,
      C: 7,
      D: 9,
      E: 8,
    })

    expect(previous.H).toBeNull()
    expect(previous.S).toBeNull()
    expect(previous.B.getKey()).toBe('C')
    expect(previous.C.getKey()).toBe('A')
    expect(previous.A.getKey()).toBe('D')
    expect(previous.D.getKey()).toBe('E')
  })
})
```

</details>

Запускаем тесты:

```bash
npm run test ./algorithms/graphs/__tests__/bellman-ford
```

<img src="https://habrastorage.org/webt/c1/by/-q/c1by-q5q2v1svqkji3dhfiqeqrg.png" />
