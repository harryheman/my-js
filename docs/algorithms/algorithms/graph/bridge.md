---
sidebar_position: 12
title: Мост
description: Мост
keywords: ['javascript', 'js', 'algorithms', 'алгоритмы']
tags: ['javascript', 'js', 'algorithms', 'алгоритмы']
---

# Мост

__Описание__

- [Википедия](https://ru.wikipedia.org/wiki/%D0%9C%D0%BE%D1%81%D1%82_(%D1%82%D0%B5%D0%BE%D1%80%D0%B8%D1%8F_%D0%B3%D1%80%D0%B0%D1%84%D0%BE%D0%B2))
- [GeekForGeeks](https://www.geeksforgeeks.org/bridge-in-a-graph/)
- [YouTube](https://www.youtube.com/watch?v=thLQYBlz2DM)
- [GitHub](https://github.com/harryheman/algorithms-data-structures/blob/main/src/algorithms/graphs/bridges.js)

Мост (bridge) - это ребро, удаление которого увеличивает число компонент связности. Такие ребра также известны как разрезающие ребра (cut-edge), разрезающие дуги (cut arc) или перешейки (isthmus). Эквивалентное определение - ребро является мостом в том и только в том случае, если оно не содержится ни в одном цикле.

<img src="https://habrastorage.org/webt/t0/m2/br/t0m2brq9hrvpjhotmk3ylvnlljm.png" />
_Граф с 6 мостами (выделены красным)_
<br />

<img src="https://habrastorage.org/webt/lz/kw/zt/lzkwztw_un8n6v0wcgptwyydvui.png" />
_Неориентированный связный граф, не имеющий мостов_
<br />

_Деревья и леса_

Граф с `n` вершинами может содержать не более `n-1` мостов, поскольку добавление еще одного ребра неминуемо приведет к появлению цикла. Графы, имеющие в точности `n-1` мостов, известны как _деревья_, а графы, в которых любое ребро является мостом - это _леса_.

_Связь с вершинной связностью_

Мосты тесно связаны с концепцией шарниров (см. предыдущий раздел) - вершин, которые входят в любой путь, соединяющий некоторые две вершины. Две конечные вершины моста являются шарнирами, если они не имеют степень 1, хотя ребра, не являющиеся мостами, тоже могут с обоих концов иметь шарниры. Аналогично графам без мостов, которые реберно двусвязны, графы без шарниров вершинно двусвязны.

__Реализация__

Существует несколько алгоритмов для поиска мостов в графе. В нашей реализации мы в очередной раз прибегнем с старому-доброму [поиску в глубину](./dfs.md):

```javascript
// algorithms/graphs/bridges.js
import depthFirstSearch from './depth-first-search'

// Метаданные узла
class VisitMetadata {
  constructor({ discoveryTime, lowDiscoveryTime }) {
    // Время исследования
    this.discoveryTime = discoveryTime
    // Наименьшее время исследования
    this.lowDiscoveryTime = lowDiscoveryTime
  }
}

// Функция принимает граф
export default function graphBridges(graph) {
  // Посещенные узлы
  const visited = {}
  // Мосты
  const bridges = {}

  // Время, необходимое для исследования текущего узла
  // (измеряется в количестве посещений узлов)
  let discoveryTime = 0

  const startNode = graph.getAllNodes()[0]

  // Обработчики для DFS
  const callbacks = {
    // Обработчик вхождения в узел
    enterNode: ({ currentNode }) => {
      // Увеличиваем время исследования
      discoveryTime += 1

      // Помещаем текущий узел в посещенные
      visited[currentNode.getKey()] = new VisitMetadata({
        discoveryTime,
        lowDiscoveryTime: discoveryTime,
      })
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

      // Сравниваем минимальное время исследования.
      // Если текущее время меньше, чем время предыдущего узла,
      // обновляем `lowDiscoveryTime` предыдущего узла
      const currentLDT = visited[currentNode.getKey()].lowDiscoveryTime
      const previousLDT = visited[previousNode.getKey()].lowDiscoveryTime
      if (currentLDT < previousLDT) {
        visited[previousNode.getKey()].lowDiscoveryTime = currentLDT
      }

      // Сравниваем текущее минимальное время исследования со временем предка.
      // Проверяем наличие короткого пути.
      // Если мы не можем добраться до текущего узла иначе, чем через предка,
      // значит, ребро между текущим узлом и его предком является мостом
      const parentLDT = visited[previousNode.getKey()].discoveryTime
      if (parentLDT < currentLDT) {
        const bridge = graph.findEdge(previousNode, currentNode)
        bridges[bridge.getKey()] = bridge
      }
    },
    // Обработчик определения допустимости обхода следующего узла
    allowTraverse: ({ nextNode }) => {
      // Запрещаем обход посещенных узлов
      return !visited[nextNode.getKey()]
    },
  }

  // Запускаем поиск в глубину
  depthFirstSearch(graph, startNode, callbacks)

  return bridges
}
```

<details>
<summary>Тесты</summary>

```javascript
// algorithms/graphs/__tests__/bridges.test.js
import Graph from '../../../data-structures/graph/index'
import GraphNode from '../../../data-structures/graph/node'
import GraphEdge from '../../../data-structures/graph/edge'
import graphBridges from '../bridges'

describe('graphBridges', () => {
  it('должен найти мосты в простом графе', () => {
    const nodeA = new GraphNode('A')
    const nodeB = new GraphNode('B')
    const nodeC = new GraphNode('C')
    const nodeD = new GraphNode('D')

    const edgeAB = new GraphEdge(nodeA, nodeB)
    const edgeBC = new GraphEdge(nodeB, nodeC)
    const edgeCD = new GraphEdge(nodeC, nodeD)

    const graph = new Graph()

    graph.addEdge(edgeAB).addEdge(edgeBC).addEdge(edgeCD)

    const bridges = Object.values(graphBridges(graph))

    expect(bridges.length).toBe(3)
    expect(bridges[0].getKey()).toBe(edgeCD.getKey())
    expect(bridges[1].getKey()).toBe(edgeBC.getKey())
    expect(bridges[2].getKey()).toBe(edgeAB.getKey())
  })

  it('должен найти мосты в простом графе с обратным ребром', () => {
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

    const bridges = Object.values(graphBridges(graph))

    expect(bridges.length).toBe(1)
    expect(bridges[0].getKey()).toBe(edgeCD.getKey())
  })

  it('должен найти мосты в графе', () => {
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

    const bridges = Object.values(graphBridges(graph))

    expect(bridges.length).toBe(3)
    expect(bridges[0].getKey()).toBe(edgeFH.getKey())
    expect(bridges[1].getKey()).toBe(edgeDE.getKey())
    expect(bridges[2].getKey()).toBe(edgeCD.getKey())
  })

  it('должен найти мосты в графе с несколькими корневыми узлами', () => {
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

    const bridges = Object.values(graphBridges(graph))

    expect(bridges.length).toBe(3)
    expect(bridges[0].getKey()).toBe(edgeFH.getKey())
    expect(bridges[1].getKey()).toBe(edgeDE.getKey())
    expect(bridges[2].getKey()).toBe(edgeCD.getKey())
  })

  it('должен найти мосты еще в одном графе #1', () => {
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

    const bridges = Object.values(graphBridges(graph))

    expect(bridges.length).toBe(2)
    expect(bridges[0].getKey()).toBe(edgeDE.getKey())
    expect(bridges[1].getKey()).toBe(edgeCD.getKey())
  })

  it('должен найти мосты еще в одном графе #2', () => {
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

    const bridges = Object.values(graphBridges(graph))

    expect(bridges.length).toBe(1)
    expect(bridges[0].getKey()).toBe(edgeCD.getKey())
  })
})
```

</details>

Запускаем тесты:

```bash
npm run test ./algorithms/graphs/__tests__/bridges
```

<img src="https://habrastorage.org/webt/q4/ow/at/q4owat0jtlaztqphkl4vdzsweak.png" />
