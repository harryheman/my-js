---
sidebar_position: 5
title: Алгоритм Дейкстры
description: Алгоритм Дейкстры
keywords: ['javascript', 'js', 'algorithms', 'алгоритмы']
tags: ['javascript', 'js', 'algorithms', 'алгоритмы']
---

# Алгоритм Дейкстры

__Описание__

- [Википедия](https://ru.wikipedia.org/wiki/%D0%90%D0%BB%D0%B3%D0%BE%D1%80%D0%B8%D1%82%D0%BC_%D0%94%D0%B5%D0%B9%D0%BA%D1%81%D1%82%D1%80%D1%8B)
- [YouTube - алгоритм Дейкстры](https://www.youtube.com/watch?v=-cuoV89nRGo)
- [YouTube - алгоритм Дейкстры или как навигатор определяет оптимальный маршрут](https://www.youtube.com/watch?v=7oUt0zhv2sA)
- [GitHub](https://github.com/harryheman/algorithms-data-structures/blob/main/src/algorithms/graphs/dijkstra.js)

Алгоритм Дейкстры (Dijkstra's algorithm) - алгоритм для нахождения кратчайших путей от одной вершины графа до всех остальных. Алгоритм работает только для графов без ребер отрицательного веса и широко применяется в программировании, например, в протоколах маршрутизации [OSPF](https://ru.wikipedia.org/wiki/OSPF) и [IS-IS](https://ru.wikipedia.org/wiki/IS-IS).

__Принцип работы__

_Задача_

Дан взвешенный ориентированный граф `G(V,E)` без ребер отрицательного веса. Необходимо найти кратчайшие пути от некоторой вершины `a` графа `G` до всех остальных вершин этого графа.

_Неформальное решение_

Каждой вершине из множества вершин `V` сопоставим метку (вес) - минимальное известное расстояние от этой вершины до стартовой вершины `a`.

Алгоритм работает пошагово - на каждом шаге он "посещает" одну вершину и пытается уменьшать метки.

Работа алгоритма завершается, когда все вершины посещены.

_Инициализация_

Метка самой вершины `a` полагается равной `0`, метки остальных вершин - бесконечности (`Infinity`).

Это отражает то, что расстояния от `a` до других вершин пока неизвестны.

Все вершины графа помечаются как непосещенные.

_Шаг алгоритма_

Если все вершины посещены, алгоритм завершается.

В противном случае, из еще не посещенных вершин выбирается вершина `u`, имеющая минимальную метку.

Рассматриваем все возможные маршруты, в которых `u` является предпоследним пунктом. Вершины, в которые ведут ребра из `u`, назовем соседями этой вершины. Для каждого соседа вершины `u`, кроме отмеченных как посещенные, рассмотрим новую длину пути, равную сумме значений текущей метки `u` и длины ребра, соединяющего `u` с этим соседом.

Если полученное значение длины меньше значения метки соседа, заменим значение метки полученным значением длины. Рассмотрев всех соседей, пометим вершину `u` как посещенную и повторим шаг алгоритма.

<img src="https://habrastorage.org/webt/sh/a3/ed/sha3edunuycpomu38j9ofzyi_38.gif" />
<br />

__Сложность__

Сложность алгоритма Дейкстры зависит от способа нахождения вершины `v`, а также способа хранения множества непосещенных вершин и способа обновления меток. Обозначим через `n` количество вершин, а через `m` - количество ребер в графе `G`.

В простейшем случае, когда для поиска вершины с минимальным `d[v]` просматривается все множество вершин, а для хранения величин `d` используется массив, время работы алгоритма составляет `O(n^2)`. Основной цикл выполняется порядка `n` раз, в каждом из них на нахождение минимума тратится порядка `n` операций. На циклы по соседям каждой посещаемой вершины тратится количество операций, пропорциональное количеству ребер `m` (поскольку каждое ребро встречается в этих циклах ровно дважды и требует константное число операций). Таким образом, общее время работы алгоритма - `O(n^2+m)`, но, так как `m <= n(n-1)`, оно составляет `O(n^2)`.

__Реализация__

Для реализации алгоритма используется такая структура данных, как [очередь с приоритетом](../../data-structures/priority-queue.md):

```javascript
// algorithms/graphs/dijkstra.js
import PriorityQueue from '../../data-structures/priority-queue'

// Функция принимает граф и начальную вершину
export default function dijkstra(graph, startNode) {
  // Расстояния
  const distances = {}
  // Посещенные вершины
  const visited = {}
  // Предыдущие вершины
  const previous = {}

  const queue = new PriorityQueue()

  // Инициализируем все расстояния бесконечностью, предполагая, что
  // сейчас мы можем достичь только начальную вершину
  for (const node of graph.getAllNodes()) {
    distances[node.getKey()] = Infinity
    previous[node.getKey()] = null
  }

  // Мы находимся в начальной вершине, расстояние до нее равняется 0
  distances[startNode.getKey()] = 0

  // Добавляем текущую вершину в очередь
  queue.add(startNode, 0)

  // Перебираем вершины, пока очередь не опустеет
  while (!queue.isEmpty()) {
    // Извлекаем ближайшую вершину
    const current = queue.poll()

    // Перебираем непосещенных соседей текущей вершины
    current.getNeighbors().forEach((neighbor) => {
      // Если вершина еще не была посещена
      if (!visited[neighbor.getKey()]) {
        // Обновляем расстояние до каждого соседа
        const edge = graph.findEdge(current, neighbor)

        const existingDistanceToNeighbor = distances[neighbor.getKey()]
        const distanceFromNeighborToCurrent =
          distances[current.getKey()] + edge.weight

        // Если обнаружено более короткое расстояние
        if (distanceFromNeighborToCurrent < existingDistanceToNeighbor) {
          distances[neighbor.getKey()] = distanceFromNeighborToCurrent

          // Обновляем приоритет соседа в очереди, поскольку он может стать ближе
          if (queue.hasValue(neighbor)) {
            queue.changePriority(neighbor, distanceFromNeighborToCurrent)
          }

          // Обновляем предыдущую вершину
          previous[neighbor.getKey()] = current
        }

        // Добавляем соседа в очередь для дальнейшего посещения
        if (!queue.hasValue(neighbor)) {
          queue.add(neighbor, distances[neighbor.getKey()])
        }
      }
    })

    // Добавляем текущую вершину в посещенные во избежание повторного посещения
    visited[current.getKey()] = current
  }

  // Возвращаем набор кратчайших расстояний и
  // набор кратчайших путей ко всем вершинам графа
  return { distances, previous }
}
```

<details>
<summary>Тесты</summary>

```javascript
// algorithms/graphs/__tests__/dijkstra.test.js
import GraphEdge from '../../../data-structures/graph/edge'
import Graph from '../../../data-structures/graph/index'
import GraphNode from '../../../data-structures/graph/node'
import dijkstra from '../dijkstra'

describe('dijkstra', () => {
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

    const { distances, previous } = dijkstra(graph, nodeA)

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

  it('должен найти минимальные пути до всех вершин направленного графа с отрицательными весами ребер', () => {
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

    const { distances, previous } = dijkstra(graph, nodeS)

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

_Обратите внимание:_ наша реализация алгоритма в отдельных случаях будет работать с графами, содержащими ребра отрицательного веса. Однако сильно полагаться на нее в этом случае не стоит.

Запускаем тесты:

```bash
npm run test ./algorithms/graphs/__tests__/dijkstra
```

<img src="https://habrastorage.org/webt/ah/u1/1l/ahu11l4zhnfyleo4gmuzq4lbrqe.png" />
