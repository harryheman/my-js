---
sidebar_position: 4
title: Алгоритм Краскала
description: Алгоритм Краскала
keywords: ['javascript', 'js', 'algorithms', 'алгоритмы']
tags: ['javascript', 'js', 'algorithms', 'алгоритмы']
---

# Алгоритм Краскала

__Описание__

- [Википедия - алгоритм Краскала](https://ru.wikipedia.org/wiki/%D0%90%D0%BB%D0%B3%D0%BE%D1%80%D0%B8%D1%82%D0%BC_%D0%9A%D1%80%D0%B0%D1%81%D0%BA%D0%B0%D0%BB%D0%B0)
- [Википедия - минимальное остовное дерево](https://ru.wikipedia.org/wiki/%D0%9C%D0%B8%D0%BD%D0%B8%D0%BC%D0%B0%D0%BB%D1%8C%D0%BD%D0%BE%D0%B5_%D0%BE%D1%81%D1%82%D0%BE%D0%B2%D0%BD%D0%BE%D0%B5_%D0%B4%D0%B5%D1%80%D0%B5%D0%B2%D0%BE)
- [YouTube](https://www.youtube.com/watch?v=mPObw3cJoTs)
- [GitHub](https://github.com/harryheman/algorithms-data-structures/blob/main/src/algorithms/graph/kruskal.js)

Алгоритм Краскала (или Крускала, Kruskal's algorithm) - это эффективный алгоритм построения минимального остовного дерева взвешенного связного неориентированного графа.

Минимальное остовное (покрывающее) дерево (МОД) в (неориентированном) связном взвешенном графе - это остовное дерево этого графа, имеющее минимальный возможный вес, где под весом дерева понимается сумма весов входящих в него ребер.

<img src="https://habrastorage.org/webt/s2/h0/7u/s2h07ulwhcas7gedxhhwmn8elns.png" />
<br />

Еще один пример графа и его МОД. Каждое ребро помечено весом, который здесь примерно пропорционален длине ребра:

<img src="https://habrastorage.org/webt/uc/2-/d4/uc2-d4w3_xp9oqu1mw6ibsjnapi.png" />
<br />

На этом рисунке видно, что в графе может быть более одного МОД.

_Принцип работы_

В начале текущее множество ребер устанавливается пустым. Затем, пока это возможно, проводится следующая операция: из всех ребер, добавление которых к уже имеющемуся множеству не вызовет появление в нем цикла, выбирается ребро минимального веса и добавляется к уже имеющемуся множеству. Когда таких ребер больше нет, алгоритм завершен. Подграф данного графа, содержащий все его вершины и найденное множество ребер, является его МОД.

_Сложность_

До начала работы алгоритма необходимо отсортировать ребра по весу, это требует `O(E × log(E))` времени, где `E` - множество ребер. После чего компоненты связности удобно хранить в виде системы непересекающихся множеств. Все операции в таком случае займут `O(E × α(E, V))`, где `α` - функция, обратная к [функции Аккермана](https://ru.wikipedia.org/wiki/%D0%A4%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F_%D0%90%D0%BA%D0%BA%D0%B5%D1%80%D0%BC%D0%B0%D0%BD%D0%B0). Поскольку для любых практических задач `α(E, V) < 5`, то можно принять ее за константу. Таким образом, общее время работы алгоритма Краскала можно принять за `O(E * log(E))`.

<img src="https://habrastorage.org/webt/ly/ba/ft/lybaftbk0mxaprzwrn3ypvvqlqg.gif" />
<br />

Демонстрация работы алгоритма Краскала на основе [евклидова расстояния](https://ru.wikipedia.org/wiki/%D0%95%D0%B2%D0%BA%D0%BB%D0%B8%D0%B4%D0%BE%D0%B2%D0%B0_%D0%BC%D0%B5%D1%82%D1%80%D0%B8%D0%BA%D0%B0#:~:text=%D0%95%D0%B2%D0%BA%D0%BB%D0%B8%D0%B4%D0%BE%D0%B2%D0%B0%20%D0%BC%D0%B5%D1%82%D1%80%D0%B8%D0%BA%D0%B0%20(%D0%B5%D0%B2%D0%BA%D0%BB%D0%B8%D0%B4%D0%BE%D0%B2%D0%BE%20%D1%80%D0%B0%D1%81%D1%81%D1%82%D0%BE%D1%8F%D0%BD%D0%B8%D0%B5)%20%E2%80%94,%D0%BF%D1%80%D0%BE%D1%81%D1%82%D1%80%D0%B0%D0%BD%D1%81%D1%82%D0%B2%D0%B0%2C%20%D0%B2%D1%8B%D1%87%D0%B8%D1%81%D0%BB%D1%8F%D0%B5%D0%BC%D0%BE%D0%B5%20%D0%BF%D0%BE%20%D1%82%D0%B5%D0%BE%D1%80%D0%B5%D0%BC%D0%B5%20%D0%9F%D0%B8%D1%84%D0%B0%D0%B3%D0%BE%D1%80%D0%B0.):

<img src="https://habrastorage.org/webt/ne/uy/ox/neuyox6qucdoeajwscxxqn9scae.gif" />
<br />

__Реализация__

В нашей реализации используются такие структуры данных, как [граф (graph)](../../data-structures/graph.md) и [система непересекающихся множеств (disjoint set)](../../data-structures/disjoint-set.md), а также [алгоритм быстрой сортировки (quick sort)](../sort/quick.md):

```javascript
// algorithms/graphs/kruskal.js
import DisjoinSet from '../../data-structures/disjoint-set/index'
import Graph from '../../data-structures/graph/index'
import QuickSort from '../sorting/quick-sort'

// Функция принимает граф
export default function kruskal(graph) {
  // При передаче направленного графа должно выбрасываться исключение
  if (graph.isDirected) {
    throw new Error(
      'Алгоритм Краскала работает только с ненаправленными графами',
    )
  }

  // Создаем новый граф, который будет содержать
  // минимальное остовное дерево исходного графа
  const minimumSpanningTree = new Graph()

  // Сортируем ребра графа в порядке возрастания веса
  const sortingCallbacks = {
    compareCallback: (a, b) => {
      if (a.weight === b.weight) {
        return 0
      }

      return a.weight < b.weight ? -1 : 1
    },
  }
  const sortedEdges = new QuickSort(sortingCallbacks).sort(graph.getAllEdges())

  // Создаем непересекающиеся одноэлементные множества для всех вершин графа
  const keyCb = (node) => node.getKey()
  const disjointSet = new DisjoinSet(keyCb)
  graph.getAllNodes().forEach((node) => disjointSet.makeSet(node))

  // Перебираем ребра графа, начиная с минимального, и пытаемся добавить их
  // в минимальное остовное дерево. Критерием добавления ребра является
  // формирование им цикла (если оно соединяет два узла одного подмножества)
  sortedEdges.forEach((edge) => {
    // Если добавление ребра не формирует цикл
    if (!disjointSet.isSameSet(edge.from, edge.to)) {
      // Объединяем два подмножества в одно
      disjointSet.union(edge.from, edge.to)

      // Добавляем ребро в дерево
      minimumSpanningTree.addEdge(edge)
    }
  })

  return minimumSpanningTree
}
```

<details>
<summary>Тесты</summary>

```javascript
// algorithms/graphs/__tests__/kruskal.test.js
import GraphEdge from '../../../data-structures/graph/edge'
import Graph from '../../../data-structures/graph/index'
import GraphNode from '../../../data-structures/graph/node'
import kruskal from '../kruskal'

describe('kruskal', () => {
  it('при передаче направленного графа должно выбрасываться исключение', () => {
    function applyPrimToDirectedGraph() {
      const graph = new Graph(true)

      kruskal(graph)
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

    const minimumSpanningTree = kruskal(graph)

    expect(minimumSpanningTree.getWeight()).toBe(24)
    expect(minimumSpanningTree.getAllNodes().length).toBe(
      graph.getAllNodes().length,
    )
    expect(minimumSpanningTree.getAllEdges().length).toBe(
      graph.getAllNodes().length - 1,
    )
    expect(minimumSpanningTree.toString()).toBe('E,C,A,B,D,F,G')
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

    const minimumSpanningTree = kruskal(graph)

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
npm run test ./algorithms/graphs/__tests__/kruskal
```

<img src="https://habrastorage.org/webt/vd/zr/ep/vdzreps8-cj9rd0c8w_tgybpuuo.png" />
