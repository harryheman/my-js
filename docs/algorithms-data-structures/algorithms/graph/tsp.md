---
sidebar_position: 14
title: Задача коммивояжера
description: Задача коммивояжера
keywords: ['javascript', 'js', 'algorithms', 'алгоритмы']
tags: ['javascript', 'js', 'algorithms', 'алгоритмы']
---

# Задача коммивояжера

__Описание__

- [Википедия](https://ru.wikipedia.org/wiki/%D0%97%D0%B0%D0%B4%D0%B0%D1%87%D0%B0_%D0%BA%D0%BE%D0%BC%D0%BC%D0%B8%D0%B2%D0%BE%D1%8F%D0%B6%D1%91%D1%80%D0%B0)
- [YouTube](https://www.youtube.com/watch?v=r804FVgvaTo)

Задача коммивояжера (travelling salesman problem, TSP) - одна из самых известных задач [комбинаторной оптимизации](https://ru.wikipedia.org/wiki/%D0%9A%D0%BE%D0%BC%D0%B1%D0%B8%D0%BD%D0%B0%D1%82%D0%BE%D1%80%D0%BD%D0%B0%D1%8F_%D0%BE%D0%BF%D1%82%D0%B8%D0%BC%D0%B8%D0%B7%D0%B0%D1%86%D0%B8%D1%8F), заключающаяся в поиске самого выгодного маршрута, проходящего через указанные города ровно по одному разу с последующим возвратом в исходный город. В условиях задачи указываются критерий выгодности маршрута (кратчайший, самый дешевый, совокупный критерий и т.п.) и соответствующие матрицы расстояний, стоимости и т.д. Как правило, указывается, что маршрут должен проходить через каждый город только один раз - в таком случае выбор осуществляется среди [гамильтоновых циклов](https://ru.wikipedia.org/wiki/%D0%93%D0%B0%D0%BC%D0%B8%D0%BB%D1%8C%D1%82%D0%BE%D0%BD%D0%BE%D0%B2_%D1%86%D0%B8%D0%BA%D0%BB). Существует несколько частных случаев общей постановки задачи, в частности, геометрическая задача коммивояжера (также называемая планарной или евклидовой, когда матрица расстояний отражает расстояния между точками на плоскости), метрическая задача коммивояжера (когда на матрице стоимостей выполняется неравенство треугольника), симметричная и асимметричная задачи коммивояжера. Также существует обобщение задачи, так называемая [обобщенная задача коммивояжера](https://ru.wikipedia.org/wiki/%D0%9E%D0%B1%D0%BE%D0%B1%D1%89%D1%91%D0%BD%D0%BD%D0%B0%D1%8F_%D0%B7%D0%B0%D0%B4%D0%B0%D1%87%D0%B0_%D0%BA%D0%BE%D0%BC%D0%BC%D0%B8%D0%B2%D0%BE%D1%8F%D0%B6%D1%91%D1%80%D0%B0).

<img src="https://habrastorage.org/webt/za/hw/m0/zahwm0vfhmbadqqzkhjrlnefpyu.png" />
_Решение задачи коммивояжера: черная линия показывает наикратчайший возможный цикл, соединяющий все красные точки_
<br />

<img src="https://habrastorage.org/webt/mi/1f/ia/mi1fiajfszm-yczg3yg47xoanii.png" />
_Оптимальный маршрут коммивояжера через 14 крупнейших городов Германии. Указанный маршрут является самым коротким из возможных 43 589 145 600 вариантов_
<br />

Оптимизационная постановка задачи относится к классу [NP-трудных](https://ru.wikipedia.org/wiki/NP-%D1%82%D1%80%D1%83%D0%B4%D0%BD%D0%BE%D1%81%D1%82%D1%8C) задач, впрочем, как и большинство ее частных случаев. Версия "decision problem" (то есть такая, в которой ставится вопрос, существует ли маршрут не длиннее, чем заданное значение `k`) относится к классу [NP-полных задач](https://ru.wikipedia.org/wiki/NP-%D0%BF%D0%BE%D0%BB%D0%BD%D0%B0%D1%8F_%D0%B7%D0%B0%D0%B4%D0%B0%D1%87%D0%B0). Задача коммивояжера относится к числу [трансвычислительных](https://ru.wikipedia.org/wiki/%D0%A2%D1%80%D0%B0%D0%BD%D1%81%D0%B2%D1%8B%D1%87%D0%B8%D1%81%D0%BB%D0%B8%D1%82%D0%B5%D0%BB%D1%8C%D0%BD%D0%B0%D1%8F_%D0%B7%D0%B0%D0%B4%D0%B0%D1%87%D0%B0): уже при относительно небольшом числе городов (> 66) она не может быть решена методом перебора вариантов никакими теоретически мыслимыми компьютерами за время, меньшее нескольких миллиардов лет.

_Представление в виде графа_

Для возможности применения математического аппарата для решения задачи ее следует представить в виде математической модели. Задачу коммивояжера можно представить в виде модели на графе, то есть, используя вершины и ребра между ними. Таким образом, вершины графа соответствуют городам, а ребра `(i, j)` между вершинами `i` и `j` - пути сообщения между этими городами. Каждому ребру `(i, j)` можно сопоставить критерий выгодности маршрута c<sub>ij</sub> >= 0, который можно понимать как, например, расстояние между городами, время или стоимость поездки.

Гамильтоновым циклом называется маршрут, включающий ровно по одному разу каждую вершину графа.

В целях упрощения задачи и гарантии существования маршрута обычно считается, что модельный граф задачи является полностью связным, то есть, что между произвольной парой вершин существует ребро. В тех случаях, когда между отдельными городами не существует сообщения, этого можно достичь путем ввода ребер с максимальной длиной. Из-за большой длины такое ребро никогда не попадет в оптимальный маршрут, если он существует.

Таким образом, решение задачи коммивояжера - это нахождение гамильтонова цикла минимального веса в полном взвешенном графе.

В зависимости от того, какой критерий выгодности маршрута сопоставляется величине ребер, различают различные варианты задачи, важнейшими из которых являются симметричная и метрическая задачи.

_Сложность_

Поскольку коммивояжер в каждом из городов встает перед выбором следующего города из тех, что он еще не посетил, существует `(n-1)!` маршрутов для асимметричной и `(n-1)!/2` маршрутов для симметричной задачи коммивояжера. Таким образом, размер пространства поиска факториально зависит от количества городов.

Различные варианты задачи коммивояжера (метрическая, симметричная и асимметричная) NP-эквивалентны. Согласно распространенной, но недоказанной гипотезе о неравенстве классов сложности P и NP, не существует детерминированной машины Тьюринга, способной находить решения экземпляров задачи за полиномиальное время в зависимости от количества городов.

Также известно, что при условии `P !== NP` не существует алгоритма, который для некоторого полинома `p` вычислял бы такие решения задачи коммивояжера, которые отличались бы от оптимального максимум на коэффициент `2^p(n)`.

На практике поиск строго оптимального маршрута требуется не всегда. Существуют алгоритмы поиска приближенных решений для метрической задачи за полиномиальное время и нахождения маршрута максимум вдвое длиннее оптимального. До сих пор не известен ни один алгоритм с полиномиальным временем, который бы гарантировал точность лучшую, чем 1,5 от оптимальной.

_Простые методы решения_

- полный перебор
- случайный перебор
- жадные алгоритмы
- метод ближайшего соседа
- метод включения ближайшего города
- метод самого дешевого включения
- метод минимального остовного дерева
- метод имитации отжига

Все эффективные (сокращающие полный перебор) методы решения задачи коммивояжера - методы эвристические. Большинство эвристических методов находит не самый эффективный маршрут, а приближенное решение. Зачастую востребованы так называемые "any-time-алгоритмы", то есть, постепенно улучшающие некоторое текущее приближенное решение.

__Реализация__

Мы решим задачу коммивояжера с помощью грубой силы (brute force), т.е. полным перебором всех возможных путей. Это самая простая, но далеко не самая эффективная реализация алгоритма:

```javascript
// algorithms/graphs/traveling-salesman.js
// Функция принимает начальный узел, все пути
// на данной итерации и текущий путь.
// Возвращает все возможные пути
function findAllPaths(startNode, paths = [], path = []) {
  // Текущий путь
  const currentPath = [...path, startNode]

  // Посещенные узлы
  const visitedNodes = currentPath.reduce((a, n) => {
    const copy = { ...a }
    copy[n.getKey()] = n
    return copy
  }, {})

  // Непосещенные соседи
  const unvisitedNeighbors = startNode
    .getNeighbors()
    .filter((n) => !visitedNodes[n.getKey()])

  // Если непосещенных соседей не осталось,
  // то путь завершен, сохраняем его
  if (!unvisitedNeighbors.length) {
    paths.push(currentPath)
    return paths
  }

  // Перебираем непосещенных соседей
  for (const neighbor of unvisitedNeighbors) {
    // Рекурсивно исследуем их пути
    findAllPaths(neighbor, paths, currentPath)
  }

  return paths
}

// Функция принимает матрицу смежности, индексы узлов и цикл.
// Возвращает вес/стоимость цикла
function getCycleWeight(adjacencyMatrix, nodesIndices, cycle) {
  let weight = 0

  for (let i = 1; i < cycle.length; i++) {
    const fromNode = cycle[i - 1]
    const toNode = cycle[i]
    const fromIndex = nodesIndices[fromNode.getKey()]
    const toIndex = nodesIndices[toNode.getKey()]
    weight += adjacencyMatrix[fromIndex][toIndex]
  }

  return weight
}

// Функция принимает граф
export default function bfTravellingSalesman(graph) {
  const startNode = graph.getAllNodes()[0]

  // Получаем все возможные пути
  const paths = findAllPaths(startNode)

  // Нас интересуют только пути, образующие циклы
  const cycles = paths.filter((p) => {
    const lastNode = p.at(-1)
    const lastNodeNeighbors = lastNode.getNeighbors()

    return lastNodeNeighbors.includes(startNode)
  })

  // Матрица смежности
  const adjacencyMatrix = graph.getAdjacencyMatrix()
  // Индексы узлов
  const nodesIndices = graph.getNodesIndices()
  // Путь коммивояжера
  let salesmanPath = []
  // Минимальный вес пути коммивояжера
  let salesmanPathWeight = null

  // Перебираем циклы
  for (const cycle of cycles) {
    // Вычисляем вес цикла
    const cycleWeight = getCycleWeight(adjacencyMatrix, nodesIndices, cycle)

    // Нас интересует путь с минимальным весом
    if (salesmanPathWeight === null || cycleWeight < salesmanPathWeight) {
      salesmanPath = cycle
      salesmanPathWeight = cycleWeight
    }
  }

  return salesmanPath
}
```

__Тестирование__

```javascript
// algorithms/graphs/__tests__/traveling-salesman.test.js
import GraphEdge from '../../../data-structures/graph/edge'
import Graph from '../../../data-structures/graph/index'
import GraphNode from '../../../data-structures/graph/node'
import bfTravellingSalesman from '../traveling-salesman'

describe('bfTravelingSalesman', () => {
  it('должен решить задачу для простого графа', () => {
    const nodeA = new GraphNode('A')
    const nodeB = new GraphNode('B')
    const nodeC = new GraphNode('C')
    const nodeD = new GraphNode('D')

    const edgeAB = new GraphEdge(nodeA, nodeB, 1)
    const edgeBD = new GraphEdge(nodeB, nodeD, 1)
    const edgeDC = new GraphEdge(nodeD, nodeC, 1)
    const edgeCA = new GraphEdge(nodeC, nodeA, 1)

    const edgeBA = new GraphEdge(nodeB, nodeA, 5)
    const edgeDB = new GraphEdge(nodeD, nodeB, 8)
    const edgeCD = new GraphEdge(nodeC, nodeD, 7)
    const edgeAC = new GraphEdge(nodeA, nodeC, 4)
    const edgeAD = new GraphEdge(nodeA, nodeD, 2)
    const edgeDA = new GraphEdge(nodeD, nodeA, 3)
    const edgeBC = new GraphEdge(nodeB, nodeC, 3)
    const edgeCB = new GraphEdge(nodeC, nodeB, 9)

    const graph = new Graph(true)
    graph
      .addEdge(edgeAB)
      .addEdge(edgeBD)
      .addEdge(edgeDC)
      .addEdge(edgeCA)
      .addEdge(edgeBA)
      .addEdge(edgeDB)
      .addEdge(edgeCD)
      .addEdge(edgeAC)
      .addEdge(edgeAD)
      .addEdge(edgeDA)
      .addEdge(edgeBC)
      .addEdge(edgeCB)

    const salesmanPath = bfTravellingSalesman(graph)

    expect(salesmanPath.length).toBe(4)

    expect(salesmanPath[0].getKey()).toEqual(nodeA.getKey())
    expect(salesmanPath[1].getKey()).toEqual(nodeB.getKey())
    expect(salesmanPath[2].getKey()).toEqual(nodeD.getKey())
    expect(salesmanPath[3].getKey()).toEqual(nodeC.getKey())
  })
})
```

Запускаем тест:

```bash
npm run test ./algorithms/graphs/__tests__/traveling-salesman
```

<img src="https://habrastorage.org/webt/pn/ye/4l/pnye4lcdpfdtjy1zjqyofkbfopw.png" />
