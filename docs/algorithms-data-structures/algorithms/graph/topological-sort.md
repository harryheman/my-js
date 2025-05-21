---
sidebar_position: 10
title: Топологическая сортировка
description: Топологическая сортировка
keywords: ['javascript', 'js', 'algorithms', 'алгоритмы']
tags: ['javascript', 'js', 'algorithms', 'алгоритмы']
---

# Топологическая сортировка

__Описание__

- [Википедия](https://ru.wikipedia.org/wiki/%D0%A2%D0%BE%D0%BF%D0%BE%D0%BB%D0%BE%D0%B3%D0%B8%D1%87%D0%B5%D1%81%D0%BA%D0%B0%D1%8F_%D1%81%D0%BE%D1%80%D1%82%D0%B8%D1%80%D0%BE%D0%B2%D0%BA%D0%B0)
- [YouTube](https://www.youtube.com/watch?v=o0P8oNXoA_w)
- [GitHub](https://github.com/harryheman/algorithms-data-structures/blob/main/src/algorithms/graphs/topological-sort.js)

Топологическая сортировка или топологическое упорядочение (topological sort) направленного графа - это линейное упорядочение его вершин, при котором для каждого направленного ребра `uv` от вершины `u` до вершины `v`, `u` предшествует `v` в упорядочении.

Например, вершины графа могут представлять задачи, которые необходимо выполнить, а ребра могут представлять ограничения, согласно которым одна задача должна быть выполнена перед другой; в этом приложении топологическое упорядочение - это просто допустимая последовательность задач.

Топологическое упорядочение возможно тогда и только тогда, когда граф не имеет направленных циклов, то есть если он является [направленным ациклическим графом](https://en.wikipedia.org/wiki/Directed_acyclic_graph) (directed acyclic graph, DAG). Любой DAG имеет по крайней мере одно топологическое упорядочение, и существуют алгоритмы линейного времени для его построения.

<img src="https://habrastorage.org/webt/e6/yd/gb/e6ydgbndzlnsg8xeznuym1weitc.png" />
_Топологическая сортировка направленного ациклического графа: каждое ребро идет от более раннего (по порядку) (сверху слева) к более позднему (снизу справа) узлам. Направленный граф является ациклическим тогда и только тогда, когда он имеет топологическое упорядочение_
<br />

_Пример_

<img src="https://habrastorage.org/webt/in/bz/fc/inbzfcxiqyzu51xgllmrlpscrkw.png" />
<br />

Приведенный граф может быть упорядочен несколькими способами, в том числе:

- `5, 7, 3, 11, 8, 2, 9, 10` - визуально слева направо, сверху вниз
- `3, 5, 7, 8, 11, 2, 9, 10` - сначала доступная вершина с наименьшим номером
- `5, 7, 3, 8, 11, 10, 9, 2` - сначала доступная вершина с наименьшим количеством ребер
- `7, 5, 11, 3, 10, 8, 9, 2` - сначала доступная вершина с наибольшим номером
- `5, 7, 11, 2, 3, 8, 9, 10` - сверху вниз, слева направо
- `3, 7, 8, 5, 11, 10, 2, 9` - произвольный порядок

_Применение_

Топологическая сортировка часто применяется для планирования последовательности задач на основе их зависимостей. Задачи представлены вершинами, и есть ребро между `x` и `y`, если задача `x` должна быть выполнена перед `y` (например, при стирке одежды, стиральная машина должна закончить свою работу перед помещением одежды в сушилку). Здесь топологическая сортировка определяет порядок выполнения задач.

Другим применением является разрешение зависимостей. Каждая вершина - это пакет, а каждое ребро - это зависимость этого модуля от других модулей. Здесь топологическая сортировка определяет такой порядок установки зависимостей, чтобы перед установкой следующей зависимости сначала разрешались все зависимости предыдущей зависимости.

__Реализация__

Существует несколько алгоритмов для топологического упорядочения. В нашей реализации будет использоваться такой алгоритм, как [поиск в глубину](./dfs.md), и такая структура данных, как [стек](../../data-structures/stack.md):

```javascript
// algorithms/graphs/topological-sort.js
import Stack from '../../data-structures/stack'
import depthFirstSearch from './depth-first-search'

// Функция принимает граф
export default function topologicalSort(graph) {
  // Узлы, которые мы хотим посетить
  const unvisited = graph.getAllNodes().reduce((a, c) => {
    a[c.getKey()] = c
    return a
  }, {})

  // Посещенные узлы
  const visited = {}

  // Стек отсортированных узлов
  const stack = new Stack()

  // Обработчики для DFS
  const callbacks = {
    // Обработчик вхождения в узел
    enterNode: ({ currentNode }) => {
      // Добавляем узел в посещенные, если все его потомки были исследованы
      visited[currentNode.getKey()] = currentNode

      // Удаляем узел из непосещенных
      delete unvisited[currentNode.getKey()]
    },
    // Обработчик выхода из узла
    leaveNode: ({ currentNode }) => {
      // Помещаем полностью исследованный узел в стек
      stack.push(currentNode)
    },
    // Обработчик определения допустимости обхода следующего узла
    allowTraverse: ({ nextNode }) => {
      // Запрещаем обход посещенных узлов
      return !visited[nextNode.getKey()]
    },
  }

  // Перебираем непосещенные узлы
  while (Object.keys(unvisited).length) {
    const currentKey = Object.keys(unvisited)[0]
    const currentNode = unvisited[currentKey]

    depthFirstSearch(graph, currentNode, callbacks)
  }

  // Преобразуем стек в массив и возвращаем его
  return stack.toArray()
}
```

__Тестирование__

```javascript
// algorithms/graphs/__tests__/topological-sort.test.js
import GraphEdge from '../../../data-structures/graph/edge'
import Graph from '../../../data-structures/graph/index'
import GraphNode from '../../../data-structures/graph/node'
import topologicalSort from '../topological-sort'

describe('topologicalSort', () => {
  it('должен выполнить топологическую сортировку узлов графа', () => {
    const nodeA = new GraphNode('A')
    const nodeB = new GraphNode('B')
    const nodeC = new GraphNode('C')
    const nodeD = new GraphNode('D')
    const nodeE = new GraphNode('E')
    const nodeF = new GraphNode('F')
    const nodeG = new GraphNode('G')
    const nodeH = new GraphNode('H')

    const edgeAC = new GraphEdge(nodeA, nodeC)
    const edgeBC = new GraphEdge(nodeB, nodeC)
    const edgeBD = new GraphEdge(nodeB, nodeD)
    const edgeCE = new GraphEdge(nodeC, nodeE)
    const edgeDF = new GraphEdge(nodeD, nodeF)
    const edgeEF = new GraphEdge(nodeE, nodeF)
    const edgeEH = new GraphEdge(nodeE, nodeH)
    const edgeFG = new GraphEdge(nodeF, nodeG)

    const graph = new Graph(true)

    graph
      .addEdge(edgeAC)
      .addEdge(edgeBC)
      .addEdge(edgeBD)
      .addEdge(edgeCE)
      .addEdge(edgeDF)
      .addEdge(edgeEF)
      .addEdge(edgeEH)
      .addEdge(edgeFG)

    const sortedVertices = topologicalSort(graph)

    expect(sortedVertices).toBeDefined()
    expect(sortedVertices.length).toBe(graph.getAllNodes().length)
    expect(sortedVertices).toEqual([
      nodeB,
      nodeD,
      nodeA,
      nodeC,
      nodeE,
      nodeH,
      nodeF,
      nodeG,
    ])
  })
})
```

Запускаем тесты:

```bash
npm run test ./algorithms/graphs/__tests__/topological-sort
```

<img src="https://habrastorage.org/webt/dm/si/h9/dmsih9frsgqbno8e9r5wryz3gei.png" />
