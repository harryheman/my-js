---
sidebar_position: 8
title: Определение цикла
description: Определение цикла
keywords: ['javascript', 'js', 'algorithms', 'алгоритмы']
tags: ['javascript', 'js', 'algorithms', 'алгоритмы']
---

# Определение цикла

__Описание__

_Общая информация_

- [Википедия](https://ru.wikipedia.org/wiki/%D0%A6%D0%B8%D0%BA%D0%BB_(%D1%82%D0%B5%D0%BE%D1%80%D0%B8%D1%8F_%D0%B3%D1%80%D0%B0%D1%84%D0%BE%D0%B2))
- [GitHub](https://github.com/harryheman/algorithms-data-structures/tree/main/src/algorithms/graphs/detect-cycle)

_Циклы в ненаправленных графах_

- [GeekForGeeks](https://www.geeksforgeeks.org/detect-cycle-undirected-graph/)
- [YouTube](https://www.youtube.com/watch?v=n_t0a_8H8VY&list=PLLXdhg_r2hKA7DPDsunoDZ-Z769jWn4R8)

_Циклы в направленных графах_

- [GeekForGeeks](https://www.geeksforgeeks.org/detect-cycle-in-a-graph/)
- [YouTube](https://www.youtube.com/watch?v=rKQaZuoUR4M&list=PLLXdhg_r2hKA7DPDsunoDZ-Z769jWn4R8)

В теории графов два типа объектов обычно называются циклами.

Один тип циклов, чаще называющиеся _замкнутым обходом_, состоит из последовательности вершин, начинающейся и заканчивающейся в той же самой вершине, и каждые две последовательные вершины в последовательности смежны. Другой тип циклов, иногда называемых _простыми циклами_, - это замкнутые обходы без повторного прохода по ребру или посещения вершины дважды, за исключением начальной и конечной вершин. Простые циклы можно описать набором ребер, в отличие от замкнутых обходов, в которых наборы ребер (с возможным повторением) не определяют однозначно порядок вершин. Ориентированный цикл в ориентированном графе - это последовательность вершин, начинающаяся и завершающаяся в той же самой вершине, и в этой последовательности для любых двух последовательных вершин существует дуга из более ранней в более позднюю. Такое же различие между простыми циклами и обходами, как выше, можно определить и для ориентированных графов.

<img src="https://habrastorage.org/webt/xm/ic/mt/xmicmtdkcjcv5vkqjipoxjajpss.png" />
_Граф с окрашенными ребрами для иллюстрации пути `H-A-B`, замкнутого пути или обхода с повторением вершин `B-D-E-F-D-C-B` и цикла без повторения ребер или вершин `H-D-G-H`_

_Поиск цикла_

Неориентированный граф имеет цикл в том и только в том случае, когда поиск в глубину (DFS) находит ребро, которое приводит к уже посещенной вершине (обратная дуга). Таким же образом, все обратные ребра, которые алгоритм DFS обнаруживает, являются частями циклов. Для неориентированных графов требуется только время `O(n)` для нахождения цикла в графе с `n` вершинами, поскольку максимум `n − 1` ребер могут быть ребрами дерева.

Ориентированный граф имеет цикл в том и только в том случае, когда DFS находит обратную дугу. Дуги вперед и поперечные дуги не обязательно говорят о цикле. Многие алгоритмы топологических сортировок также обнаруживают циклы, поскольку они мешают существованию топологического порядка. Если ориентированный граф разделен на компоненты сильной связности, циклы существуют только в компонентах, но не между ними, поскольку циклы сильно связаны.

Приложения алгоритмов нахождения циклов включают графы ожидания для нахождения взаимных блокировок в системах с параллельными потоками.

## Определение цикла в неориентированном графе

__Реализация__

Цикл в ненаправленном графе можно обнаружить, как минимум, двумя способами.

С помощью [поиска в глубину (DFS)](./dfs.md):

```javascript
// algorithms/graphs/detect-cycle/undirected.js
import depthFirstSearch from '../depth-first-search'

// Функция принимает граф
export default function detectUndirectedCycle(graph) {
  let cycle = null

  // Список посещенных узлов
  const visited = {}

  // Список предков каждого посещенного узла
  const parents = {}

  // Обработчики для DFS
  const callbacks = {
    // Обработчик вхождения в узел
    enterNode: ({ currentNode, previousNode }) => {
      // Если узел уже посещен, то обнаружен цикл
      if (visited[currentNode.getKey()]) {
        // Вычисляем его путь
        cycle = {}

        let current = currentNode
        let previous = previousNode

        while (currentNode.getKey() !== previous.getKey()) {
          cycle[current.getKey()] = previous
          current = previous
          previous = parents[previous.getKey()]
        }

        cycle[current.getKey()] = previous
      } else {
        // Добавляем текущий узел в посещенные
        visited[currentNode.getKey()] = currentNode
        // Обновляем список предков
        parents[currentNode.getKey()] = previousNode
      }
    },
    // Обработчик определения допустимости обхода
    allowTraverse: ({ currentNode, nextNode }) => {
      // Запрещаем обход цикла
      if (cycle) {
        return false
      }

      // Запрещаем возвращаться к предку
      const currentNodeParent = parents[currentNode.getKey()]

      return currentNodeParent?.getKey() !== nextNode.getKey()
    },
  }

  // Берем первый узел
  const startNode = graph.getAllNodes()[0]
  // Запускаем поиск в глубину
  depthFirstSearch(graph, startNode, callbacks)

  return cycle
}
```

<details>
<summary>Тесты</summary>

```javascript
// algorithms/graphs/detect-cycle/__tests__/undirected.test.js
import GraphEdge from '../../../../data-structures/graph/edge'
import Graph from '../../../../data-structures/graph/index'
import GraphNode from '../../../../data-structures/graph/node'
import detectUndirectedCycle from '../undirected'

describe('detectUndirectedCycle', () => {
  it('должен обнаружить цикл в ненаправленном графе', () => {
    const nodeA = new GraphNode('A')
    const nodeB = new GraphNode('B')
    const nodeC = new GraphNode('C')
    const nodeD = new GraphNode('D')
    const nodeE = new GraphNode('E')
    const nodeF = new GraphNode('F')

    const edgeAF = new GraphEdge(nodeA, nodeF)
    const edgeAB = new GraphEdge(nodeA, nodeB)
    const edgeBE = new GraphEdge(nodeB, nodeE)
    const edgeBC = new GraphEdge(nodeB, nodeC)
    const edgeCD = new GraphEdge(nodeC, nodeD)
    const edgeDE = new GraphEdge(nodeD, nodeE)

    const graph = new Graph()
    graph
      .addEdge(edgeAF)
      .addEdge(edgeAB)
      .addEdge(edgeBE)
      .addEdge(edgeBC)
      .addEdge(edgeCD)

    expect(detectUndirectedCycle(graph)).toBeNull()

    graph.addEdge(edgeDE)

    expect(detectUndirectedCycle(graph)).toEqual({
      B: nodeC,
      C: nodeD,
      D: nodeE,
      E: nodeB,
    })
  })
})
```

</details>

С помощью [системы непересекающихся множеств (disjoint set)](../../data-structures/disjoint-set.md):

```javascript
// algorithms/graphs/detect-cycle/undirected-disjoint-set.js
import DisjoinSet from '../../../data-structures/disjoint-set'

export default function detectUndirectedCycleUsingDisjointSet(graph) {
  // Создаем непересекающиеся одноэлементные множества для каждого узла графа
  const keyExtractor = (node) => node.getKey()
  const disjointSet = new DisjoinSet(keyExtractor)
  graph.getAllNodes().forEach((node) => disjointSet.makeSet(node))

  // Перебираем все ребра графа и проверяем, что узлы ребра принадлежат
  // разным множествам. В этом случае объединяем множества. Делаем это
  // до обнаружения узлов, которые принадлежат обоим множествам. Это
  // означает обнаружение цикла
  let cycle = false
  graph.getAllEdges().forEach((edge) => {
    if (disjointSet.isSameSet(edge.from, edge.to)) {
      cycle = true
    } else {
      disjointSet.union(edge.from, edge.to)
    }
  })

  return cycle
}
```

<details>
<summary>Тесты</summary>

```javascript
// algorithms/graphs/detect-cycle/__tests__/undirected-disjoint-set.test.js
import GraphEdge from '../../../../data-structures/graph/edge'
import Graph from '../../../../data-structures/graph/index'
import GraphNode from '../../../../data-structures/graph/node'
import detectUndirectedCycleUsingDisjointSet from '../undirected-disjoint-set'

describe('detectUndirectedCycleUsingDisjointSet', () => {
  it('должен обнаружить цикл в ненаправленном графе', () => {
    const nodeA = new GraphNode('A')
    const nodeB = new GraphNode('B')
    const nodeC = new GraphNode('C')
    const nodeD = new GraphNode('D')
    const nodeE = new GraphNode('E')
    const nodeF = new GraphNode('F')

    const edgeAF = new GraphEdge(nodeA, nodeF)
    const edgeAB = new GraphEdge(nodeA, nodeB)
    const edgeBE = new GraphEdge(nodeB, nodeE)
    const edgeBC = new GraphEdge(nodeB, nodeC)
    const edgeCD = new GraphEdge(nodeC, nodeD)
    const edgeDE = new GraphEdge(nodeD, nodeE)

    const graph = new Graph()
    graph
      .addEdge(edgeAF)
      .addEdge(edgeAB)
      .addEdge(edgeBE)
      .addEdge(edgeBC)
      .addEdge(edgeCD)

    expect(detectUndirectedCycleUsingDisjointSet(graph)).toBe(false)

    graph.addEdge(edgeDE)

    expect(detectUndirectedCycleUsingDisjointSet(graph)).toBe(true)
  })
})
```

</details>

## Определение цикла в ориентированном графе

Алгоритм определения цикла в направленном графе также можно реализовать с помощью [поиска в глубину (DFS)](./dfs.md):

```javascript
// algorithms/graphs/detect-cycle/__tests__/directed.test.js
import depthFirstSearch from '../depth-first-search'

export default function detectDirectedCycle(graph) {
  let cycle = null

  // Список предков каждого посещенного узла
  const parents = {}

  // Белый набор содержит узлы, которые еще не посещались
  const whiteSet = {}

  // Серый набор содержит узлы, которые посещаются сейчас (на текущем пути)
  const graySet = {}

  // Черный набор содержит узлы, которые полностью посещены.
  // Это означает, что были посещены все потомки узла
  const blackSet = {}

  // Обнаружение узла в сером наборе означает, что обнаружен цикл.
  // Если узел находится в сером наборе, значит,
  // его соседи или соседи его соседей сейчас посещаются

  // Инициализируем белый набор
  graph.getAllNodes().forEach((node) => {
    whiteSet[node.getKey()] = node
  })

  // Обработчики для DFS
  const callbacks = {
    // Обработчик вхождения в узел
    enterNode: ({ currentNode, previousNode }) => {
      // Если узел находится в сером наборе, значит, обнаружен цикл
      if (graySet[currentNode.getKey()]) {
        // Вычисляем его путь
        cycle = {}

        let current = currentNode
        let previous = previousNode

        while (currentNode.getKey() !== previous.getKey()) {
          cycle[current.getKey()] = previous
          current = previous
          previous = parents[previous.getKey()]
        }

        cycle[current.getKey()] = previous
      } else {
        // Добавляем текущий узел в серый набор и удаляем его из белого набора
        graySet[currentNode.getKey()] = currentNode
        delete whiteSet[currentNode.getKey()]

        // Обновляем список предков
        parents[currentNode.getKey()] = previousNode
      }
    },
    // Обработчик выхода из узла
    leaveNode: ({ currentNode }) => {
      // Если все потомки узла были посещены, удаляем его из серого набора
      // и добавляем в черный набор
      blackSet[currentNode.getKey()] = currentNode
      delete graySet[currentNode.getKey()]
    },
    // Обработчик определения допустимости обхода
    allowTraverse: ({ nextNode }) => {
      // Запрещаем обход цикла
      if (cycle) {
        return false
      }

      // Запрещаем обход черных узлов
      return !blackSet[nextNode.getKey()]
    },
  }

  // Пока в белом наборе есть узлы
  while (Object.keys(whiteSet).length) {
    // Берем первый узел
    const firstKey = Object.keys(whiteSet)[0]
    const startNode = whiteSet[firstKey]
    // Запускаем поиск в глубину
    depthFirstSearch(graph, startNode, callbacks)
  }

  return cycle
}
```

<details>
<summary>Тесты</summary>

```javascript
// algorithms/graphs/detect-cycle/__tests__/directed.test.js
import GraphEdge from '../../../../data-structures/graph/edge'
import Graph from '../../../../data-structures/graph/index'
import GraphNode from '../../../../data-structures/graph/node'
import detectDirectedCycle from '../directed'

describe('detectDirectedCycle', () => {
  it('должен обнаружить цикл в направленном графе', () => {
    const nodeA = new GraphNode('A')
    const nodeB = new GraphNode('B')
    const nodeC = new GraphNode('C')
    const nodeD = new GraphNode('D')
    const nodeE = new GraphNode('E')
    const nodeF = new GraphNode('F')

    const edgeAB = new GraphEdge(nodeA, nodeB)
    const edgeBC = new GraphEdge(nodeB, nodeC)
    const edgeAC = new GraphEdge(nodeA, nodeC)
    const edgeDA = new GraphEdge(nodeD, nodeA)
    const edgeDE = new GraphEdge(nodeD, nodeE)
    const edgeEF = new GraphEdge(nodeE, nodeF)
    const edgeFD = new GraphEdge(nodeF, nodeD)

    const graph = new Graph(true)
    graph
      .addEdge(edgeAB)
      .addEdge(edgeBC)
      .addEdge(edgeAC)
      .addEdge(edgeDA)
      .addEdge(edgeDE)
      .addEdge(edgeEF)

    expect(detectDirectedCycle(graph)).toBeNull()

    graph.addEdge(edgeFD)

    expect(detectDirectedCycle(graph)).toEqual({
      D: nodeF,
      F: nodeE,
      E: nodeD,
    })
  })
})
```

</details>

Запускаем тесты:

```bash
npm run test ./algorithms/graphs/detect-cycle/__tests__
```

<img src="https://habrastorage.org/webt/fh/mf/xq/fhmfxqr86rououz_ivixtd7jrhe.png" />
