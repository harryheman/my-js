---
sidebar_position: 13
title: Компонента сильной связности
description: Компонента сильной связности
keywords: ['javascript', 'js', 'algorithms', 'алгоритмы']
tags: ['javascript', 'js', 'algorithms', 'алгоритмы']
---

# Компонента сильной связности

__Описание__

- [Википедия](https://ru.wikipedia.org/wiki/%D0%9A%D0%BE%D0%BC%D0%BF%D0%BE%D0%BD%D0%B5%D0%BD%D1%82%D0%B0_%D1%81%D0%B8%D0%BB%D1%8C%D0%BD%D0%BE%D0%B9_%D1%81%D0%B2%D1%8F%D0%B7%D0%BD%D0%BE%D1%81%D1%82%D0%B8)
- [YouTube](https://www.youtube.com/watch?v=RpgcYiky7uw)
- [YouTube](https://www.youtube.com/watch?v=rZkauRhHKGo)

Ориентированный граф называется _сильно связным/связанным_ (strongly connected), если любые две его вершины `s` и `t` сильно связаны, то есть если существует ориентированный путь из `s` в `t` и одновременно ориентированный путь из `t` в `s`.

_Компонентами сильной связности_ графа называются его максимальные по включению сильно связные подграфы. _Областью сильной связности_ называется множество вершин компонентов сильной связности.

<img src="https://habrastorage.org/webt/6y/yk/je/6yykjevnhy08shelpkczcgff2ye.png" />
<br />

Направленный граф, не принадлежащий к классу сильно связных графов, содержит некоторый набор сильно связных компонент, и некоторый набор ориентированных ребер, идущих от одной компоненты к другой.

Любая вершина графа сильно связана сама с собой.

_Алгоритмы_

Простейший алгоритм решения задачи о поиске сильно связных компонент в ориентированном графе работает следующим образом:

1. При помощи [транзитивного замыкания](https://ru.wikipedia.org/wiki/%D0%A2%D1%80%D0%B0%D0%BD%D0%B7%D0%B8%D1%82%D0%B8%D0%B2%D0%BD%D0%BE%D0%B5_%D0%B7%D0%B0%D0%BC%D1%8B%D0%BA%D0%B0%D0%BD%D0%B8%D0%B5) проверяем, достижима ли `t` из `s`, и `s` из `t`, для всех пар `s` и `t`.
2. Затем определяем такой неориентированный граф, в котором для каждой такой пары содержится ребро.
3. Поиск компонент связности такого неориентированного графа дает компоненты сильной связности.

Очевидно, что основное время работы данного алгоритма занимает транзитивное замыкание.

Также существует три алгоритма, решающих данную задачу за линейное время. Это алгоритмы [Косарайю](https://ru.wikipedia.org/wiki/%D0%90%D0%BB%D0%B3%D0%BE%D1%80%D0%B8%D1%82%D0%BC_%D0%9A%D0%BE%D1%81%D0%B0%D1%80%D0%B0%D0%B9%D1%8E), [поиска компонент сильной связности с двумя стеками](https://ru.wikipedia.org/wiki/%D0%90%D0%BB%D0%B3%D0%BE%D1%80%D0%B8%D1%82%D0%BC_%D0%BF%D0%BE%D0%B8%D1%81%D0%BA%D0%B0_%D0%BA%D0%BE%D0%BC%D0%BF%D0%BE%D0%BD%D0%B5%D0%BD%D1%82_%D1%81%D0%B8%D0%BB%D1%8C%D0%BD%D0%BE%D0%B9_%D1%81%D0%B2%D1%8F%D0%B7%D0%BD%D0%BE%D1%81%D1%82%D0%B8_%D1%81_%D0%B4%D0%B2%D1%83%D0%BC%D1%8F_%D1%81%D1%82%D0%B5%D0%BA%D0%B0%D0%BC%D0%B8) и [Тарьяна](https://ru.wikipedia.org/wiki/%D0%90%D0%BB%D0%B3%D0%BE%D1%80%D0%B8%D1%82%D0%BC_%D0%A2%D0%B0%D1%80%D1%8C%D1%8F%D0%BD%D0%B0).

__Реализация__

В нашей реализации будет использоваться такой алгоритм, как [поиск в глубину](./dfs.md), и такая структура данных, как [стек](../../data-structures/stack.md):

```javascript
// algorithms/graphs/strongly-connected-components.js
import Stack from '../../data-structures/stack'
import depthFirstSearch from './depth-first-search'

// Функция принимает граф.
// Возвращает стек узлов, упорядоченных по времени исследования
function getNodesSortedByDfsFinishTime(graph) {
  // Список посещенных узлов
  const visited = {}

  // Стек узлов по времени исследования (измеряется в количестве посещений узлов).
  // Все узлы в этом стеке отсортированы по времени исследования в порядке убывания.
  // Узел, который был исследован первым, будет находиться внизу стека, а
  // узел, который был исследован последним, будет находиться наверху стека
  const stack = new Stack()

  // Список непосещенных узлов
  const unvisited = graph.getAllNodes().reduce((a, c) => {
    a[c.getKey()] = c
    return a
  }, {})

  // Обработчики для DFS
  const callbacks = {
    // Обработчик вхождения в узел
    enterNode: ({ currentNode }) => {
      // Добавляем узел в посещенные
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

  // Перебираем непосещенные узлы и обходим их в глубину
  while (Object.keys(unvisited).length) {
    const startKey = Object.keys(unvisited)[0]
    const startNode = unvisited[startKey]
    delete unvisited[startKey]

    depthFirstSearch(graph, startNode, callbacks)
  }

  return stack
}

// Функция принимает граф и стек узлов, упорядоченных по времени исследования.
// Возвращает наборы компонент связности
function getSCCSets(graph, stack) {
  // Наборы компонент связности
  const sets = []
  // Текущий компонент связности
  let set = []
  // Список посещенных узлов
  const visited = {}

  // Обработчики для DFS
  const callbacks = {
    // Обработчик вхождения в узел
    enterNode: ({ currentNode }) => {
      // Добавляем узел в текущий компонент связности
      set.push(currentNode)
      // Добавляем узел в посещенные
      visited[currentNode.getKey()] = currentNode
    },
    // Обработчик выхода из узла
    leaveNode: ({ previousNode }) => {
      // Если узел является корневым, значит, мы нашли новый компонент связности
      if (!previousNode) {
        // Добавляем текущий компонент связности в наборы
        sets.push(set.slice())
      }
    },
    // Обработчик определения допустимости обхода следующего узла
    allowTraverse: ({ nextNode }) => {
      // Запрещаем обход посещенных узлов
      return !visited[nextNode.getKey()]
    },
  }

  // Перебираем стек узлов и обходим их в глубину
  while (!stack.isEmpty()) {
    const node = stack.pop()

    set = []

    if (!visited[node.getKey()]) {
      depthFirstSearch(graph, node, callbacks)
    }
  }

  return sets
}

// Функция принимает граф
export default function stronglyConnectedComponents(graph) {
  // Получаем стек узлов, упорядоченных по времени исследования
  const stack = getNodesSortedByDfsFinishTime(graph)
  // Инвертируем граф
  graph.reverse()
  // Получаем и возвращаем наборы компонент связности
  return getSCCSets(graph, stack)
}
```

<details>
<summary>Тесты</summary>

```javascript
// algorithms/graphs/__tests__/strongly-connected-components.test.js
import GraphEdge from '../../../data-structures/graph/edge'
import Graph from '../../../data-structures/graph/index'
import GraphNode from '../../../data-structures/graph/node'
import stronglyConnectedComponents from '../strongly-connected-components'

describe('stronglyConnectedComponents', () => {
  it('должен обнаружить сильно связанные компоненты в простом графе', () => {
    const nodeA = new GraphNode('A')
    const nodeB = new GraphNode('B')
    const nodeC = new GraphNode('C')
    const nodeD = new GraphNode('D')

    const edgeAB = new GraphEdge(nodeA, nodeB)
    const edgeBC = new GraphEdge(nodeB, nodeC)
    const edgeCA = new GraphEdge(nodeC, nodeA)
    const edgeCD = new GraphEdge(nodeC, nodeD)

    const graph = new Graph(true)

    graph.addEdge(edgeAB).addEdge(edgeBC).addEdge(edgeCA).addEdge(edgeCD)

    const components = stronglyConnectedComponents(graph)

    expect(components).toBeDefined()
    expect(components.length).toBe(2)

    expect(components[0][0].getKey()).toBe(nodeA.getKey())
    expect(components[0][1].getKey()).toBe(nodeC.getKey())
    expect(components[0][2].getKey()).toBe(nodeB.getKey())

    expect(components[1][0].getKey()).toBe(nodeD.getKey())
  })

  it('должен обнаружить сильно связанные компоненты в графе', () => {
    const nodeA = new GraphNode('A')
    const nodeB = new GraphNode('B')
    const nodeC = new GraphNode('C')
    const nodeD = new GraphNode('D')
    const nodeE = new GraphNode('E')
    const nodeF = new GraphNode('F')
    const nodeG = new GraphNode('G')
    const nodeH = new GraphNode('H')
    const nodeI = new GraphNode('I')
    const nodeJ = new GraphNode('J')
    const nodeK = new GraphNode('K')

    const edgeAB = new GraphEdge(nodeA, nodeB)
    const edgeBC = new GraphEdge(nodeB, nodeC)
    const edgeCA = new GraphEdge(nodeC, nodeA)
    const edgeBD = new GraphEdge(nodeB, nodeD)
    const edgeDE = new GraphEdge(nodeD, nodeE)
    const edgeEF = new GraphEdge(nodeE, nodeF)
    const edgeFD = new GraphEdge(nodeF, nodeD)
    const edgeGF = new GraphEdge(nodeG, nodeF)
    const edgeGH = new GraphEdge(nodeG, nodeH)
    const edgeHI = new GraphEdge(nodeH, nodeI)
    const edgeIJ = new GraphEdge(nodeI, nodeJ)
    const edgeJG = new GraphEdge(nodeJ, nodeG)
    const edgeJK = new GraphEdge(nodeJ, nodeK)

    const graph = new Graph(true)

    graph
      .addEdge(edgeAB)
      .addEdge(edgeBC)
      .addEdge(edgeCA)
      .addEdge(edgeBD)
      .addEdge(edgeDE)
      .addEdge(edgeEF)
      .addEdge(edgeFD)
      .addEdge(edgeGF)
      .addEdge(edgeGH)
      .addEdge(edgeHI)
      .addEdge(edgeIJ)
      .addEdge(edgeJG)
      .addEdge(edgeJK)

    const components = stronglyConnectedComponents(graph)

    expect(components).toBeDefined()
    expect(components.length).toBe(4)

    expect(components[0][0].getKey()).toBe(nodeG.getKey())
    expect(components[0][1].getKey()).toBe(nodeJ.getKey())
    expect(components[0][2].getKey()).toBe(nodeI.getKey())
    expect(components[0][3].getKey()).toBe(nodeH.getKey())

    expect(components[1][0].getKey()).toBe(nodeK.getKey())

    expect(components[2][0].getKey()).toBe(nodeA.getKey())
    expect(components[2][1].getKey()).toBe(nodeC.getKey())
    expect(components[2][2].getKey()).toBe(nodeB.getKey())

    expect(components[3][0].getKey()).toBe(nodeD.getKey())
    expect(components[3][1].getKey()).toBe(nodeF.getKey())
    expect(components[3][2].getKey()).toBe(nodeE.getKey())
  })
})
```

</details>

Запускаем тесты:

```bash
npm run test ./algorithms/graphs/__tests__/strongly-connected-components
```

<img src="https://habrastorage.org/webt/wa/dp/1w/wadp1wkqiz7hkog1kr46djthxtw.png" />
