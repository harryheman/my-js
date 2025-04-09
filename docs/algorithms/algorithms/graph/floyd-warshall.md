---
sidebar_position: 7
title: Алгоритм Флойда-Уоршелла
description: Алгоритм Флойда-Уоршелла
keywords: ['javascript', 'js', 'algorithms', 'алгоритмы']
tags: ['javascript', 'js', 'algorithms', 'алгоритмы']
---

# Алгоритм Флойда-Уоршелла

__Описание__

- [Википедия](https://ru.wikipedia.org/wiki/%D0%90%D0%BB%D0%B3%D0%BE%D1%80%D0%B8%D1%82%D0%BC_%D0%A4%D0%BB%D0%BE%D0%B9%D0%B4%D0%B0_%E2%80%94_%D0%A3%D0%BE%D1%80%D1%88%D0%B5%D0%BB%D0%BB%D0%B0)
- [YouTube](https://www.youtube.com/watch?v=HwK67u7zaEE)
- [GitHub](https://github.com/harryheman/algorithms-data-structures/blob/main/src/algorithms/graphs/floyd-warshall.js)

Алгоритм Флойда-Уоршелла (Floyd-Warshall algorithm) - это алгоритм поиска кратчайших путей во взвешенном графе с положительным или отрицательным весом ребер (но без отрицательных циклов). За одно выполнение алгоритма будут найдены длины (суммарные веса) кратчайших путей между всеми парами вершин. Хотя он не возвращает детали самих путей, можно реконструировать пути с помощью простых модификаций алгоритма.

<img src="https://habrastorage.org/webt/18/wv/zo/18wvzov7nmw2xxw_48t-bw7u9ly.png" />
<br />

_Принцип работы_

Алгоритм Флойда-Уоршелла сравнивает все возможные пути через граф между каждой парой вершин. Он может сделать это за `O(V^3)` сравнений в графе, даже если в графе может быть до `V^2` ребер, и каждая комбинация ребер проверяется. Это достигается путем постепенного улучшения оценки кратчайшего пути между двумя вершинами, пока оценка не станет оптимальной.

Рассмотрим граф `G` с вершинами `V`, пронумерованными от `1` до `N` и функцию `shortestPath(i, j, k)`, которая возвращает кратчайший возможный путь от `i` до `j` с использованием вершин только из множества `{1, 2, ..., k}` в качестве промежуточных точек на этом пути. Теперь, учитывая эту функцию, наша цель - найти кратчайший путь от каждого `i` до каждого `j`, используя любую вершину в `{1, 2, ..., N}`.

Если `w(i,j)` - вес ребра между вершинами `i` и `j`, мы можем определить `shortestPath(i, j, k)` следующим образом:

базовый случай

<img src="https://habrastorage.org/webt/80/te/ku/80tekuvxissijpy1qpkqnqjv3nq.png" />
<br />

и рекурсивный случай

<img src="https://habrastorage.org/webt/bm/gx/xt/bmgxxtfmpse-kwgkmgeqolt2kxo.png" />
<br />

Эта формула составляет основу рассматриваемого алгоритма.

_Пример_

Пример выполнения алгоритма на графе слева внизу:

<img src="https://habrastorage.org/webt/xy/qk/s3/xyqks3cup6lbrxmbpp_3nsf4lna.png" />
<br />

Матрица расстояний на каждой итерации `k` (обновленные расстояния выделены жирным шрифтом) будет иметь вид:

k = 0

|   | 1 | 2  | 3  | 4 |
|:-:|:-:|:--:|:--:|:-:|
| 1 | 0 | ∞  | −2 | ∞ |
| 2 | 4 | 0  | 3  | ∞ |
| 3 | ∞ | ∞  | 0  | 2 |
| 4 | ∞ | −1 | ∞  | 0 |

k = 1

|   | 1 | 2 |   3   | 4 |
|:-:|:-:|:-:|:-----:|:-:|
| 1 | 0 | ∞ |  −2   | ∞ |
| 2 | 4 | 0 | **2** | ∞ |
| 3 | ∞ | ∞ |   0   | 2 |
| 4 | ∞ | − |   ∞   | 0 |

k = 2

|   |   1   | 2  |   3   | 4 |
|:-:|:-----:|:--:|:-----:|:-:|
| 1 |   0   | ∞  |  −2   | ∞ |
| 2 |   4   | 0  |   2   | ∞ |
| 3 |   ∞   | ∞  |   0   | 2 |
| 4 | **3** | −1 | **1** | 0 |


k = 3

|   | 1 | 2  | 3  |   4   |
|:-:|:-:|:--:|:--:|:-----:|
| 1 | 0 | ∞  | −2 | **0** |
| 2 | 4 | 0  | 2  | **4** |
| 3 | ∞ | ∞  | 0  |   2   |
| 4 | 3 | −1 | 1  |   0   |

k = 4

|   |   1   |   2    | 3  | 4 |
|:-:|:-----:|:------:|:--:|:-:|
| 1 |   0   | **−1** | −2 | 0 |
| 2 |   4   |   0    | 2  | 4 |
| 3 | **5** | **1**  | 0  | 2 |
| 4 |   3   |   −1   | 1  | 0 |

__Реализация__

```javascript
// algorithms/graphs/floyd-warshall.js
// Функция принимает граф
export default function floydWarshall(graph) {
  // Извлекаем все вершины
  const vertices = graph.getAllNodes()

  // Инициализируем матрицу предыдущих вершин
  const nextVertices = Array(vertices.length)
    .fill(null)
    .map(() => {
      return Array(vertices.length).fill(null)
    })

  // Инициализируем матрицу расстояний
  const distances = Array(vertices.length)
    .fill(null)
    .map(() => {
      return Array(vertices.length).fill(Infinity)
    })

  // Инициализируем `distances` расстояниями,
  // которые нам уже известны (из имеющихся ребер).
  // Также инициализируем матрицу предыдущих вершин
  vertices.forEach((startNode, startIndex) => {
    vertices.forEach((endNode, endIndex) => {
      if (startNode === endNode) {
        // Расстояние вершины до самой себя составляет 0
        distances[startIndex][endIndex] = 0
      } else {
        // Находим ребро между начальной и конечной вершинами
        const edge = graph.findEdge(startNode, endNode)

        // Если такое ребро имеется
        if (edge) {
          // Сохраняем расстояние и предыдущую вершину
          distances[startIndex][endIndex] = edge.weight
          nextVertices[startIndex][endIndex] = startNode
        } else {
          distances[startIndex][endIndex] = Infinity
        }
      }
    })
  })

  // Переходим к основной части алгоритма.
  // Объединяем все вершины в пары (от начала до конца) и проверяем,
  // существует ли между ними более короткий путь через среднюю вершину.
  // Средняя вершина также может быть одной из вершин графа.
  // Таким образом, нам требуется три цикла по всем вершинам графа:
  // для начальной, конечной и средней вершин
  vertices.forEach((middleNode, middleIndex) => {
    // Путь начинается от `startNode` с `startIndex`
    vertices.forEach((_startNode, startIndex) => {
      // Путь заканчивается `endNode` с `endIndex`
      vertices.forEach((_endNode, endIndex) => {
        // Сравниваем существующее расстояние от `startNode` до `endNode`,
        // с расстоянием от `startNode` до `endNode`, но через `middleNode`.
        // Сохраняем кратчайшее расстояние и предыдущую вершину,
        // предоставляющую этот кратчайший путь
        const distViaMiddle =
          distances[startIndex][middleIndex] + distances[middleIndex][endIndex]

        if (distances[startIndex][endIndex] > distViaMiddle) {
          // Мы нашли более короткий путь через `middleNode`
          distances[startIndex][endIndex] = distViaMiddle
          nextVertices[startIndex][endIndex] = middleNode
        }
      })
    })
  })

  // Кратчайшее расстояние от `x` до `y`: `distance[x][y]`.
  // Следующая вершина после `x` на пути от `x` до `y`: `nextVertices[x][y]`
  return { distances, nextVertices }
}
```

<details>
<summary>Тесты</summary>

```javascript
// algorithms/graphs/__tests__/floyd-warshall.test.js
import Graph from '../../../data-structures/graph/Graph'
import GraphEdge from '../../../data-structures/graph/GraphEdge'
import GraphNode from '../../../data-structures/graph/GraphNode'
import floydWarshall from '../floyd-warshall'

describe('floydWarshall', () => {
  it('должен найти минимальные пути для всех вершин ненаправленного графа', () => {
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

    // Сначала добавляем вершины в правильном порядке
    graph
      .addNode(nodeA)
      .addNode(nodeB)
      .addNode(nodeC)
      .addNode(nodeD)
      .addNode(nodeE)
      .addNode(nodeF)
      .addNode(nodeG)
      .addNode(nodeH)

    // Теперь добавляем ребра
    graph
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

    const { distances, nextVertices } = floydWarshall(graph)

    const vertices = graph.getAllNodes()

    const nodeAIndex = vertices.indexOf(nodeA)
    const nodeBIndex = vertices.indexOf(nodeB)
    const nodeCIndex = vertices.indexOf(nodeC)
    const nodeDIndex = vertices.indexOf(nodeD)
    const nodeEIndex = vertices.indexOf(nodeE)
    const nodeFIndex = vertices.indexOf(nodeF)
    const nodeGIndex = vertices.indexOf(nodeG)
    const nodeHIndex = vertices.indexOf(nodeH)

    expect(distances[nodeAIndex][nodeHIndex]).toBe(Infinity)
    expect(distances[nodeAIndex][nodeAIndex]).toBe(0)
    expect(distances[nodeAIndex][nodeBIndex]).toBe(4)
    expect(distances[nodeAIndex][nodeEIndex]).toBe(7)
    expect(distances[nodeAIndex][nodeCIndex]).toBe(3)
    expect(distances[nodeAIndex][nodeDIndex]).toBe(9)
    expect(distances[nodeAIndex][nodeGIndex]).toBe(12)
    expect(distances[nodeAIndex][nodeFIndex]).toBe(11)

    expect(nextVertices[nodeAIndex][nodeFIndex]).toBe(nodeD)
    expect(nextVertices[nodeAIndex][nodeDIndex]).toBe(nodeB)
    expect(nextVertices[nodeAIndex][nodeBIndex]).toBe(nodeA)
    expect(nextVertices[nodeAIndex][nodeGIndex]).toBe(nodeE)
    expect(nextVertices[nodeAIndex][nodeCIndex]).toBe(nodeA)
    expect(nextVertices[nodeAIndex][nodeAIndex]).toBe(null)
    expect(nextVertices[nodeAIndex][nodeHIndex]).toBe(null)
  })

  it('должен найти минимальные пути для всех вершин направленного графа', () => {
    const nodeA = new GraphNode('A')
    const nodeB = new GraphNode('B')
    const nodeC = new GraphNode('C')
    const nodeD = new GraphNode('D')

    const edgeAB = new GraphEdge(nodeA, nodeB, 3)
    const edgeBA = new GraphEdge(nodeB, nodeA, 8)
    const edgeAD = new GraphEdge(nodeA, nodeD, 7)
    const edgeDA = new GraphEdge(nodeD, nodeA, 2)
    const edgeBC = new GraphEdge(nodeB, nodeC, 2)
    const edgeCA = new GraphEdge(nodeC, nodeA, 5)
    const edgeCD = new GraphEdge(nodeC, nodeD, 1)

    const graph = new Graph(true)

    graph
      .addNode(nodeA)
      .addNode(nodeB)
      .addNode(nodeC)
      .addNode(nodeD)

    graph
      .addEdge(edgeAB)
      .addEdge(edgeBA)
      .addEdge(edgeAD)
      .addEdge(edgeDA)
      .addEdge(edgeBC)
      .addEdge(edgeCA)
      .addEdge(edgeCD)

    const { distances, nextVertices } = floydWarshall(graph)

    const vertices = graph.getAllNodes()

    const nodeAIndex = vertices.indexOf(nodeA)
    const nodeBIndex = vertices.indexOf(nodeB)
    const nodeCIndex = vertices.indexOf(nodeC)
    const nodeDIndex = vertices.indexOf(nodeD)

    expect(distances[nodeAIndex][nodeAIndex]).toBe(0)
    expect(distances[nodeAIndex][nodeBIndex]).toBe(3)
    expect(distances[nodeAIndex][nodeCIndex]).toBe(5)
    expect(distances[nodeAIndex][nodeDIndex]).toBe(6)

    expect(distances).toEqual([
      [0, 3, 5, 6],
      [5, 0, 2, 3],
      [3, 6, 0, 1],
      [2, 5, 7, 0],
    ])

    expect(nextVertices[nodeAIndex][nodeDIndex]).toBe(nodeC)
    expect(nextVertices[nodeAIndex][nodeCIndex]).toBe(nodeB)
    expect(nextVertices[nodeBIndex][nodeDIndex]).toBe(nodeC)
    expect(nextVertices[nodeAIndex][nodeAIndex]).toBe(null)
    expect(nextVertices[nodeAIndex][nodeBIndex]).toBe(nodeA)
  })

  it('должен найти минимальные пути для всех вершин направленного графа с отрицательными весами ребер', () => {
    const nodeA = new GraphNode('A')
    const nodeB = new GraphNode('B')
    const nodeC = new GraphNode('C')
    const nodeD = new GraphNode('D')
    const nodeE = new GraphNode('E')
    const nodeF = new GraphNode('F')
    const nodeG = new GraphNode('G')

    const edgeFE = new GraphEdge(nodeF, nodeE, 8)
    const edgeFA = new GraphEdge(nodeF, nodeA, 10)
    const edgeED = new GraphEdge(nodeE, nodeD, 1)
    const edgeDA = new GraphEdge(nodeD, nodeA, -4)
    const edgeDC = new GraphEdge(nodeD, nodeC, -1)
    const edgeAC = new GraphEdge(nodeA, nodeC, 2)
    const edgeCB = new GraphEdge(nodeC, nodeB, -2)
    const edgeBA = new GraphEdge(nodeB, nodeA, 1)

    const graph = new Graph(true)

    graph
      .addNode(nodeA)
      .addNode(nodeB)
      .addNode(nodeC)
      .addNode(nodeD)
      .addNode(nodeE)
      .addNode(nodeF)
      .addNode(nodeG)

    graph
      .addEdge(edgeFE)
      .addEdge(edgeFA)
      .addEdge(edgeED)
      .addEdge(edgeDA)
      .addEdge(edgeDC)
      .addEdge(edgeAC)
      .addEdge(edgeCB)
      .addEdge(edgeBA)

    const { distances, nextVertices } = floydWarshall(graph)

    const vertices = graph.getAllNodes()

    const nodeAIndex = vertices.indexOf(nodeA)
    const nodeBIndex = vertices.indexOf(nodeB)
    const nodeCIndex = vertices.indexOf(nodeC)
    const nodeDIndex = vertices.indexOf(nodeD)
    const nodeEIndex = vertices.indexOf(nodeE)
    const nodeGIndex = vertices.indexOf(nodeG)
    const nodeFIndex = vertices.indexOf(nodeF)

    expect(distances[nodeFIndex][nodeGIndex]).toBe(Infinity)
    expect(distances[nodeFIndex][nodeFIndex]).toBe(0)
    expect(distances[nodeFIndex][nodeAIndex]).toBe(5)
    expect(distances[nodeFIndex][nodeBIndex]).toBe(5)
    expect(distances[nodeFIndex][nodeCIndex]).toBe(7)
    expect(distances[nodeFIndex][nodeDIndex]).toBe(9)
    expect(distances[nodeFIndex][nodeEIndex]).toBe(8)

    expect(nextVertices[nodeFIndex][nodeGIndex]).toBe(null)
    expect(nextVertices[nodeFIndex][nodeFIndex]).toBe(null)
    expect(nextVertices[nodeAIndex][nodeBIndex]).toBe(nodeC)
    expect(nextVertices[nodeAIndex][nodeCIndex]).toBe(nodeA)
    expect(nextVertices[nodeFIndex][nodeBIndex]).toBe(nodeE)
    expect(nextVertices[nodeEIndex][nodeBIndex]).toBe(nodeD)
    expect(nextVertices[nodeDIndex][nodeBIndex]).toBe(nodeC)
    expect(nextVertices[nodeCIndex][nodeBIndex]).toBe(nodeC)
  })
})
```

</details>

Запускаем тесты:

```bash
npm run test ./algorithms/graphs/__tests__/floyd-warshall
```

<img src="https://habrastorage.org/webt/5v/6p/u_/5v6pu_6gqg7ax0m__k4rkxy3iki.png" />
