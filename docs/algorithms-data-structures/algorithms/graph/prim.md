---
sidebar_position: 9
title: Алгоритм Прима
description: Алгоритм Прима
keywords: ['javascript', 'js', 'algorithms', 'алгоритмы']
tags: ['javascript', 'js', 'algorithms', 'алгоритмы']
---

# Алгоритм Прима

__Описание__

- [Википедия - алгоритм Прима](https://ru.wikipedia.org/wiki/%D0%90%D0%BB%D0%B3%D0%BE%D1%80%D0%B8%D1%82%D0%BC_%D0%9F%D1%80%D0%B8%D0%BC%D0%B0)
- [Википедия - минимальное остовное дерево](https://ru.wikipedia.org/wiki/%D0%9C%D0%B8%D0%BD%D0%B8%D0%BC%D0%B0%D0%BB%D1%8C%D0%BD%D0%BE%D0%B5_%D0%BE%D1%81%D1%82%D0%BE%D0%B2%D0%BD%D0%BE%D0%B5_%D0%B4%D0%B5%D1%80%D0%B5%D0%B2%D0%BE)
- [YouTube](https://www.youtube.com/watch?v=vPHUm874EoA)
- [GitHub](https://github.com/harryheman/algorithms-data-structures/blob/main/src/algorithms/graphs/prim.js)

Алгоритм Прима (Prim's algorithm) - это алгоритм построения минимального остовного дерева взвешенного связного неориентированного графа.

Минимальное остовное (покрывающее) дерево (МОД) в (неориентированном) связном взвешенном графе - это остовное дерево этого графа, имеющее минимальный возможный вес, где под весом дерева понимается сумма весов входящих в него ребер.

<img src="https://habrastorage.org/webt/s2/h0/7u/s2h07ulwhcas7gedxhhwmn8elns.png" />
<br />

Еще один пример графа и его МОД. Каждое ребро помечено весом, который здесь примерно пропорционален длине ребра:

<img src="https://habrastorage.org/webt/uc/2-/d4/uc2-d4w3_xp9oqu1mw6ibsjnapi.png" />
<br />

На этом рисунке видно, что в графе может быть более одного МОД.

_Принцип работы_

На вход алгоритма подается связный неориентированный граф. Для каждого ребра задается его стоимость.

Сначала берется произвольная вершина и находится ребро, инцидентное данной вершине и обладающее наименьшей стоимостью. Найденное ребро и соединяемые им две вершины образуют дерево. Затем, рассматриваются ребра графа, один конец которых - уже принадлежащая дереву вершина, а другой - нет; из этих ребер выбирается ребро наименьшей стоимости. Выбираемое на каждом шаге ребро присоединяется к дереву. Рост дерева происходит до тех пор, пока не будут исчерпаны все вершины исходного графа.

Результатом работы алгоритма является МОД.

<img src="https://habrastorage.org/webt/58/vh/-p/58vh-pe2w5w_zxf50_1umbcq6f8.png" />
<br />

Демонстрация работы алгоритма Прима на основе [евклидова расстояния](https://ru.wikipedia.org/wiki/%D0%95%D0%B2%D0%BA%D0%BB%D0%B8%D0%B4%D0%BE%D0%B2%D0%B0_%D0%BC%D0%B5%D1%82%D1%80%D0%B8%D0%BA%D0%B0#:~:text=%D0%95%D0%B2%D0%BA%D0%BB%D0%B8%D0%B4%D0%BE%D0%B2%D0%B0%20%D0%BC%D0%B5%D1%82%D1%80%D0%B8%D0%BA%D0%B0%20(%D0%B5%D0%B2%D0%BA%D0%BB%D0%B8%D0%B4%D0%BE%D0%B2%D0%BE%20%D1%80%D0%B0%D1%81%D1%81%D1%82%D0%BE%D1%8F%D0%BD%D0%B8%D0%B5)%20%E2%80%94,%D0%BF%D1%80%D0%BE%D1%81%D1%82%D1%80%D0%B0%D0%BD%D1%81%D1%82%D0%B2%D0%B0%2C%20%D0%B2%D1%8B%D1%87%D0%B8%D1%81%D0%BB%D1%8F%D0%B5%D0%BC%D0%BE%D0%B5%20%D0%BF%D0%BE%20%D1%82%D0%B5%D0%BE%D1%80%D0%B5%D0%BC%D0%B5%20%D0%9F%D0%B8%D1%84%D0%B0%D0%B3%D0%BE%D1%80%D0%B0.):

<img src="https://habrastorage.org/webt/8n/lc/cw/8nlccwfpieqf-f5deba2tbbph_k.gif" />
<br />

_Псевдокод_

<img src="https://habrastorage.org/webt/ju/il/bb/juilbbh4o8tmhujsinz2zjimoos.png" />
<br />

_Сложность_

Асимптотика алгоритма зависит от способа хранения графа и способа хранения вершин, не входящих в дерево. Если приоритетная очередь `Q` реализована как обычный массив `d`, то `Extract.Min(Q)` выполняется за `O(n)`, а стоимость операции `d|u| <- w(v, u)` составляет `O(1)`. Если `Q` представляет собой [бинарную пирамиду](https://ru.wikipedia.org/wiki/%D0%94%D0%B2%D0%BE%D0%B8%D1%87%D0%BD%D0%B0%D1%8F_%D0%BA%D1%83%D1%87%D0%B0), то стоимость `Extract.Min(Q)` снижается до `O(log n)`, а стоимость `d|u| <- w(v, u)` возрастает до `O(log n)`.  При использовании [фибоначчиевых пирамид](https://ru.wikipedia.org/wiki/%D0%A4%D0%B8%D0%B1%D0%BE%D0%BD%D0%B0%D1%87%D1%87%D0%B8%D0%B5%D0%B2%D0%B0_%D0%BA%D1%83%D1%87%D0%B0) операция `Extract.Min(Q)` выполняется за `O(log n)`, а `d|u| <- w(v, u)` - за `O(1)`.

__Реализация__

Для реализации алгоритма используется [очередь с приоритетом](../../data-structures/priority-queue.md):

```javascript
// algorithms/graphs/prim.js
import Graph from '../../data-structures/graph/index'
import PriorityQueue from '../../data-structures/priority-queue'

// Функция принимает граф
export default function prim(graph) {
  // При передаче направленного графа должно выбрасываться исключение
  if (graph.isDirected) {
    throw new Error('Алгоритм Прима работает только с ненаправленными графами')
  }

  // Инициализируем новый граф, который будет содержать
  // минимальное остовное дерево (МОД) исходного графа
  const minimumSpanningTree = new Graph()

  // Эта очередь с приоритетом будет содержать все ребра,
  // начинающиеся от посещенных узлов и ранжированные по весу -
  // на каждом шаге мы всегда будем получать ребро с минимальным весом
  const edgesQueue = new PriorityQueue()

  // Набор посещенных узлов
  const visited = {}

  // Начальный узел для обхода графа
  const startNode = graph.getAllNodes()[0]

  // Добавляем начальный узел в набор посещенных узлов
  visited[startNode.getKey()] = startNode

  // Добавляем все ребра начального узла в очередь
  startNode.getEdges().forEach((graphEdge) => {
    edgesQueue.add(graphEdge, graphEdge.weight)
  })

  // Перебираем ребра, находящиеся в очереди
  while (!edgesQueue.isEmpty()) {
    // Извлекаем следующее ребро с минимальным весом
    const currentMinEdge = edgesQueue.poll()

    // Находим следующий непосещенный минимальный узел для обхода
    let nextMinNode = null
    if (!visited[currentMinEdge.from.getKey()]) {
      nextMinNode = currentMinEdge.from
    } else if (!visited[currentMinEdge.to.getKey()]) {
      nextMinNode = currentMinEdge.to
    }

    // Пропускаем итерацию, если все узлы текущего ребра уже посещены
    if (nextMinNode) {
      // Добавляем текущее минимальное ребро в МОД
      minimumSpanningTree.addEdge(currentMinEdge)

      // Добавляем узел в посещенные
      visited[nextMinNode.getKey()] = nextMinNode

      // Добавляем ребра узла в очередь
      nextMinNode.getEdges().forEach((graphEdge) => {
        // Добавляем только те ребра, которые ведут к непосещенным узлам
        if (
          !visited[graphEdge.from.getKey()] ||
          !visited[graphEdge.to.getKey()]
        ) {
          edgesQueue.add(graphEdge, graphEdge.weight)
        }
      })
    }
  }

  return minimumSpanningTree
}
```

<details>
<summary>Тесты</summary>

```javascript
// algorithms/graphs/__tests__/prim.test.js
import GraphNode from '../../../data-structures/graph/node'
import GraphEdge from '../../../data-structures/graph/edge'
import Graph from '../../../data-structures/graph/index'
import prim from '../prim'

describe('prim', () => {
  it('при передаче направленного графа должно выбрасываться исключение', () => {
    function applyPrimToDirectedGraph() {
      const graph = new Graph(true)

      prim(graph)
    }

    expect(applyPrimToDirectedGraph).toThrowError()
  })

  it('должен найти минимальное остовное дерево', () => {
    const nodeA = new GraphNode('A')
    const nodeB = new GraphNode('B')
    const nodeC = new GraphNode('C')
    const nodeD = new GraphNode('D')
    const nodeE = new GraphNode('E')
    const nodeF = new GraphNode('F')
    const nodeG = new GraphNode('G')

    const edgeAB = new GraphEdge(nodeA, nodeB, 2)
    const edgeAD = new GraphEdge(nodeA, nodeD, 3)
    const edgeAC = new GraphEdge(nodeA, nodeC, 3)
    const edgeBC = new GraphEdge(nodeB, nodeC, 4)
    const edgeBE = new GraphEdge(nodeB, nodeE, 3)
    const edgeDF = new GraphEdge(nodeD, nodeF, 7)
    const edgeEC = new GraphEdge(nodeE, nodeC, 1)
    const edgeEF = new GraphEdge(nodeE, nodeF, 8)
    const edgeFG = new GraphEdge(nodeF, nodeG, 9)
    const edgeFC = new GraphEdge(nodeF, nodeC, 6)

    const graph = new Graph()

    graph
      .addEdge(edgeAB)
      .addEdge(edgeAD)
      .addEdge(edgeAC)
      .addEdge(edgeBC)
      .addEdge(edgeBE)
      .addEdge(edgeDF)
      .addEdge(edgeEC)
      .addEdge(edgeEF)
      .addEdge(edgeFC)
      .addEdge(edgeFG)

    expect(graph.getWeight()).toEqual(46)

    const minimumSpanningTree = prim(graph)

    expect(minimumSpanningTree.getWeight()).toBe(24)
    expect(minimumSpanningTree.getAllNodes().length).toBe(
      graph.getAllNodes().length,
    )
    expect(minimumSpanningTree.getAllEdges().length).toBe(
      graph.getAllNodes().length - 1,
    )
    expect(minimumSpanningTree.toString()).toBe('A,B,C,E,D,F,G')
  })

  it('должен найти минимальное остовное дерево для простого графа', () => {
    const nodeA = new GraphNode('A')
    const nodeB = new GraphNode('B')
    const nodeC = new GraphNode('C')
    const nodeD = new GraphNode('D')

    const edgeAB = new GraphEdge(nodeA, nodeB, 1)
    const edgeAD = new GraphEdge(nodeA, nodeD, 3)
    const edgeBC = new GraphEdge(nodeB, nodeC, 1)
    const edgeBD = new GraphEdge(nodeB, nodeD, 3)
    const edgeCD = new GraphEdge(nodeC, nodeD, 1)

    const graph = new Graph()

    graph
      .addEdge(edgeAB)
      .addEdge(edgeAD)
      .addEdge(edgeBC)
      .addEdge(edgeBD)
      .addEdge(edgeCD)

    expect(graph.getWeight()).toEqual(9)

    const minimumSpanningTree = prim(graph)

    expect(minimumSpanningTree.getWeight()).toBe(3)
    expect(minimumSpanningTree.getAllNodes().length).toBe(
      graph.getAllNodes().length,
    )
    expect(minimumSpanningTree.getAllEdges().length).toBe(
      graph.getAllNodes().length - 1,
    )
    expect(minimumSpanningTree.toString()).toBe('A,B,C,D')
  })
})
```

</details>

Запускаем тесты:

```bash
npm run test ./algorithms/graphs/__tests__/prim
```

<img src="https://habrastorage.org/webt/1j/dd/hh/1jddhhgmq4py7u-tknso4t4olm8.png" />
