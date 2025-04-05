---
sidebar_position: 10
title: Граф
description: Граф
keywords: ['javascript', 'js', 'data structures', 'структуры данных']
tags: ['javascript', 'js', 'data structures', 'структуры данных']
---

# Граф

__Описание__

- [Википедия](https://ru.wikipedia.org/wiki/%D0%93%D1%80%D0%B0%D1%84_(%D0%BC%D0%B0%D1%82%D0%B5%D0%BC%D0%B0%D1%82%D0%B8%D0%BA%D0%B0))
- [YouTube](https://www.youtube.com/watch?v=VehB3eglQMQ)

Граф (graph) - это абстрактный тип данных, реализующий математические концепции направленного и ненаправленного (ориентированного и неориентированного) графов (соответствующий раздел математики называется [теорией графов](https://ru.wikipedia.org/wiki/%D0%A2%D0%B5%D0%BE%D1%80%D0%B8%D1%8F_%D0%B3%D1%80%D0%B0%D1%84%D0%BE%D0%B2)).

Граф состоит из конечного (потенциально изменяющегося) набора узлов (вершин, точек) (nodes, vertices, points), а также набора ненаправленных или, соответственно, направленных пар этих узлов. Эти пары называются ребрами (арки, линии, стрелки - для направленного графа) (edges, arcs, lines, arrows). Узлы могут быть как частью графа, так и внешними сущностями, представленными целочисленными индексами или ссылками.

Для разных областей применения графы могут различаться направленностью, ограничениями на количество ребер и дополнительными данными о вершинах и ребрах. Многие структуры, представляющие практический интерес в математике и информатике, могут быть представлены в виде графов. Например, строение Википедии можно смоделировать при помощи ориентированного графа, в котором вершинами будут выступать статьи, а ребрами - гиперссылки.

<img src="https://habrastorage.org/webt/f0/v2/gw/f0v2gwoaz-tbccnhtzc3qqyludw.png" />
<br />

_Примеры неориентированного и ориентированного графов_

_Обратите внимание:_ ребра графа часто имеют вес, который используется для определения "стоимости" пути.

[Любопытная визуализация графа](https://poloclub.github.io/argo-graph-lite/).

__Реализация__

Начнем с реализации узла графа. Для представления ребер узла целесообразно использовать связный список (см. часть 1, раздел 1):

```javascript
// data-structures/graph/node.js
// Связный список
import LinkedList from '../linked-list'

// Функция сравнения ребер
const edgeComparator = (a, b) => {
  if (a.getKey() === b.getKey()) {
    return 0
  }

  return a.getKey() < b.getKey() ? -1 : 1
}

export default class Node {
  constructor(value) {
    if (!value) {
      throw new Error('Узел графа должен иметь значение!')
    }

    // Значение узла
    this.value = value
    // Связный список ребер
    this.edges = new LinkedList(edgeComparator)
  }
}
```

Методы добавления и удаления ребер:

```javascript
// Добавляет ребро в список
addEdge(edge) {
  this.edges.append(edge)

  return this
}

// Удаляет ребро из списка
removeEdge(edge) {
  this.edges.remove(edge)

  return this
}

// Удаляет все ребра
removeAllEdges() {
  this.getEdges().forEach((edge) => {
    this.removeEdge(edge)
  })

  return this
}
```

Методы получения соседних узлов, ребер, длины и значения узла:

```javascript
// Возвращает список соседних узлов
getNeighbors() {
  const edges = this.edges.toArray()

  return edges.map((node) =>
    node.value.from === this ? node.value.to : node.value.from,
  )
}

// Возвращает список ребер в виде массива значений
getEdges() {
  return this.edges.toArray().map((node) => node.value)
}

// Возвращает длину (глубину) узла
getDegree() {
  return this.edges.toArray().length
}

// Возвращает значение узла
getKey() {
  return this.value
}
```

Методы определения наличия ребер и соседей:

```javascript
// Определяет наличие ребра
hasEdge(edge) {
  const _edge = this.edges.find({ cb: (node) => node === edge })

  return Boolean(_edge)
}

// Определяет наличие соседа
hasNeighbor(node) {
  const _node = this.edges.find({
    cb: (n) => n.to === node || n.from === node,
  })

  return Boolean(_node)
}
```

Метод поиска ребра по узлу:

```javascript
// Выполняет поиск ребра по узлу
findEdge(node) {
  const _node = this.edges.find({
    cb: (n) => n.to === node || n.from === node,
  })

  return _node ? _node.value : null
}
```

Наконец, вспомогательный метод стрингификации узла:

```javascript
// Возвращает строковое представление узла.
// Принимает кастомную функцию стрингификации
toString(cb) {
  return cb ? cb(this.value) : `${this.value}`
}
```

<details>
<summary>Полный код узла графа</summary>

```javascript
// Связный список
import LinkedList from '../linked-list'

// Функция сравнения ребер
const edgeComparator = (a, b) => {
  if (a.getKey() === b.getKey()) {
    return 0
  }

  return a.getKey() < b.getKey() ? -1 : 1
}

// Функция преобразования соседних узлов
const convertNeighbors = (node) => {
  return node.value.from === this ? node.value.to : node.value.from
}

export default class Node {
  constructor(value) {
    if (!value) {
      throw new Error('Узел графа должен иметь значение!')
    }

    // Значение узла
    this.value = value
    // Связный список ребер
    this.edges = new LinkedList(edgeComparator)
  }

  // Добавляет ребро в список
  addEdge(edge) {
    this.edges.append(edge)

    return this
  }

  // Удаляет ребро из списка
  removeEdge(edge) {
    this.edges.remove(edge)

    return this
  }

  // Удаляет все ребра
  removeAllEdges() {
    this.getEdges().forEach((edge) => {
      this.removeEdge(edge)
    })

    return this
  }

  // Возвращает список соседей
  getNeighbors() {
    const edges = this.edges.toArray()

    return edges.map(convertNeighbors)
  }

  // Возвращает список ребер в виде массива значений
  getEdges() {
    return this.edges.toArray().map((node) => node.value)
  }

  // Возвращает длину (глубину) узла
  getDegree() {
    return this.edges.toArray().length
  }

  // Возвращает значение узла
  getKey() {
    return this.value
  }

  // Определяет наличие ребра
  hasEdge(edge) {
    const _edge = this.edges.find({ cb: (node) => node === edge })

    return Boolean(_edge)
  }

  // Определяет наличие соседа
  hasNeighbor(node) {
    const _node = this.edges.find({
      cb: (n) => n.to === node || n.from === node,
    })

    return Boolean(_node)
  }

  // Выполняет поиск ребра по узлу
  findEdge(node) {
    const _node = this.edges.find({
      cb: (n) => n.to === node || n.from === node,
    })

    return _node ? _node.value : null
  }

  // Возвращает строковое представление узла.
  // Принимает кастомную функцию стрингификации
  toString(cb) {
    return cb ? cb(this.value) : `${this.value}`
  }
}
```

</details>

Код ребра графа до неприличия прост, поэтому привожу его целиком:

```javascript
// data-structures/graph/edge.js
export default class Edge {
  constructor(from, to, weight = 0) {
    // Начальный узел
    this.from = from
    // Конечный узел
    this.to = to
    // Вес ребра
    this.weight = weight
  }

  // Возвращает ключ ребра
  getKey() {
    const fromKey = this.from.getKey()
    const toKey = this.to.getKey()

    // Например, `A_B`
    return `${fromKey}_${toKey}`
  }

  // Инвертирует ребро
  reverse() {
    const tmp = this.from
    this.from = this.to
    this.to = tmp

    return this
  }

  // Преобразует ребро в строку
  toString() {
    return this.getKey()
  }
}
```

<details>
<summary>Тесты для узла</summary>

```javascript
// data-structures/graph/__tests__/node.test.js
import Node from '../node'
import Edge from '../edge'

describe('Node', () => {
  it('должен выбросить исключение при создании узла без значения', () => {
    let node = null

    function createEmptyVertex() {
      node = new Node()
    }

    expect(node).toBeNull()
    expect(createEmptyVertex).toThrow()
  })

  it('должен создать узел графа', () => {
    const node = new Node('A')

    expect(node).toBeDefined()
    expect(node.value).toBe('A')
    expect(node.toString()).toBe('A')
    expect(node.getKey()).toBe('A')
    expect(node.edges.toString()).toBe('')
    expect(node.getEdges()).toEqual([])
  })

  it('должен добавить ребра в узел и определить их наличие', () => {
    const nodeA = new Node('A')
    const nodeB = new Node('B')

    const edgeAB = new Edge(nodeA, nodeB)
    nodeA.addEdge(edgeAB)

    expect(nodeA.hasEdge(edgeAB)).toBe(true)
    expect(nodeB.hasEdge(edgeAB)).toBe(false)
    expect(nodeA.getEdges().length).toBe(1)
    expect(nodeA.getEdges()[0].toString()).toBe('A_B')
  })

  it('должен удалить определенные ребра из узла', () => {
    const nodeA = new Node('A')
    const nodeB = new Node('B')
    const nodeC = new Node('C')

    const edgeAB = new Edge(nodeA, nodeB)
    const edgeAC = new Edge(nodeA, nodeC)
    nodeA.addEdge(edgeAB).addEdge(edgeAC)

    expect(nodeA.hasEdge(edgeAB)).toBe(true)
    expect(nodeB.hasEdge(edgeAB)).toBe(false)

    expect(nodeA.hasEdge(edgeAC)).toBe(true)
    expect(nodeC.hasEdge(edgeAC)).toBe(false)

    expect(nodeA.getEdges().length).toBe(2)

    expect(nodeA.getEdges()[0].toString()).toBe('A_B')
    expect(nodeA.getEdges()[1].toString()).toBe('A_C')

    nodeA.removeEdge(edgeAB)
    expect(nodeA.hasEdge(edgeAB)).toBe(false)
    expect(nodeA.hasEdge(edgeAC)).toBe(true)
    expect(nodeA.getEdges()[0].toString()).toBe('A_C')

    nodeA.removeEdge(edgeAC)
    expect(nodeA.hasEdge(edgeAB)).toBe(false)
    expect(nodeA.hasEdge(edgeAC)).toBe(false)
    expect(nodeA.getEdges().length).toBe(0)
  })

  it('должна удалить все ребра из узла', () => {
    const nodeA = new Node('A')
    const nodeB = new Node('B')
    const nodeC = new Node('C')

    const edgeAB = new Edge(nodeA, nodeB)
    const edgeAC = new Edge(nodeA, nodeC)
    nodeA.addEdge(edgeAB).addEdge(edgeAC)

    expect(nodeA.hasEdge(edgeAB)).toBe(true)
    expect(nodeB.hasEdge(edgeAB)).toBe(false)

    expect(nodeA.hasEdge(edgeAC)).toBe(true)
    expect(nodeC.hasEdge(edgeAC)).toBe(false)

    expect(nodeA.getEdges().length).toBe(2)

    nodeA.removeAllEdges()

    expect(nodeA.hasEdge(edgeAB)).toBe(false)
    expect(nodeB.hasEdge(edgeAB)).toBe(false)

    expect(nodeA.hasEdge(edgeAC)).toBe(false)
    expect(nodeC.hasEdge(edgeAC)).toBe(false)

    expect(nodeA.getEdges().length).toBe(0)
  })

  it('должен вернуть соседей узла в случае, если текущий узел является начальным', () => {
    const nodeA = new Node('A')
    const nodeB = new Node('B')
    const nodeC = new Node('C')

    const edgeAB = new Edge(nodeA, nodeB)
    const edgeAC = new Edge(nodeA, nodeC)
    nodeA.addEdge(edgeAB).addEdge(edgeAC)

    expect(nodeB.getNeighbors()).toEqual([])

    const neighbors = nodeA.getNeighbors()

    expect(neighbors.length).toBe(2)
    expect(neighbors[0]).toEqual(nodeB)
    expect(neighbors[1]).toEqual(nodeC)
  })

  it('должен вернуть соседей узла в случае, если текущий узел является конечным', () => {
    const nodeA = new Node('A')
    const nodeB = new Node('B')
    const nodeC = new Node('C')

    const edgeBA = new Edge(nodeB, nodeA)
    const edgeCA = new Edge(nodeC, nodeA)
    nodeA.addEdge(edgeBA).addEdge(edgeCA)

    expect(nodeB.getNeighbors()).toEqual([])

    const neighbors = nodeA.getNeighbors()

    expect(neighbors.length).toBe(2)
    expect(neighbors[0]).toEqual(nodeB)
    expect(neighbors[1]).toEqual(nodeC)
  })

  it('должен определить наличие соседнего узла', () => {
    const nodeA = new Node('A')
    const nodeB = new Node('B')
    const nodeC = new Node('C')

    const edgeAB = new Edge(nodeA, nodeB)
    nodeA.addEdge(edgeAB)

    expect(nodeA.hasNeighbor(nodeB)).toBe(true)
    expect(nodeA.hasNeighbor(nodeC)).toBe(false)
  })

  it('должен найти ребро по узлу', () => {
    const nodeA = new Node('A')
    const nodeB = new Node('B')
    const nodeC = new Node('C')

    const edgeAB = new Edge(nodeA, nodeB)
    nodeA.addEdge(edgeAB)

    expect(nodeA.findEdge(nodeB)).toEqual(edgeAB)
    expect(nodeA.findEdge(nodeC)).toBeNull()
  })

  it('должен вычислить глубину узла', () => {
    const nodeA = new Node('A')
    const nodeB = new Node('B')

    expect(nodeA.getDegree()).toBe(0)

    const edgeAB = new Edge(nodeA, nodeB)
    nodeA.addEdge(edgeAB)

    expect(nodeA.getDegree()).toBe(1)

    const edgeBA = new Edge(nodeB, nodeA)
    nodeA.addEdge(edgeBA)

    expect(nodeA.getDegree()).toBe(2)

    nodeA.addEdge(edgeAB)
    expect(nodeA.getDegree()).toBe(3)

    expect(nodeA.getEdges().length).toEqual(3)
  })
})
```

</details>

Запускаем тесты:

```bash
npm run test ./data-structures/graph/__tests__/node
```

<img src="https://habrastorage.org/webt/ya/-q/c2/ya-qc2uxgtq9gfnqbfsklumorbe.png" />
<br />

<details>
<summary>Тесты для ребра</summary>

```javascript
// data-structures/graph/__tests__/edge.test.js
import Edge from '../edge'
import Node from '../node'

describe('Edge', () => {
  it('должена создать ребро графа с дефолтным весом', () => {
    const from = new Node('A')
    const to = new Node('B')
    const edge = new Edge(from, to)

    expect(edge.getKey()).toBe('A_B')
    expect(edge.toString()).toBe('A_B')
    expect(edge.from).toEqual(from)
    expect(edge.to).toEqual(to)
    expect(edge.weight).toEqual(0)
  })

  it('должена создать граф с указанным весом', () => {
    const from = new Node('A')
    const to = new Node('B')
    const edge = new Edge(from, to, 10)

    expect(edge.from).toEqual(from)
    expect(edge.to).toEqual(to)
    expect(edge.weight).toEqual(10)
  })

  it('должен инвертировать ребро', () => {
    const nodeA = new Node('A')
    const nodeB = new Node('B')
    const edge = new Edge(nodeA, nodeB, 10)

    expect(edge.from).toEqual(nodeA)
    expect(edge.to).toEqual(nodeB)
    expect(edge.weight).toEqual(10)

    edge.reverse()

    expect(edge.from).toEqual(nodeB)
    expect(edge.to).toEqual(nodeA)
    expect(edge.weight).toEqual(10)
  })
})
```

</details>

Запускаем тесты:

```bash
npm run test ./data-structures/graph/__tests__/edge
```

<img src="https://habrastorage.org/webt/su/cw/a_/sucwa_7timr-5apnebkzj7zopwy.png" />
<br />

Приступаем к реализации графа:

```javascript
// data-structures/graph/index.js
export default class Graph {
  constructor(isDirected = false) {
    // Индикатор направленности графа
    // (по умолчанию граф является ненаправленным)
    this.isDirected = isDirected
    // Узлы
    this.nodes = {}
    // Ребра
    this.edges = {}
  }
}
```

Метод добавления узла в граф и несколько "геттеров":

```javascript
// Добавляет узел в граф
addNode(newNode) {
  this.nodes[newNode.getKey()] = newNode

  return this
}

// Возвращает узел по ключу
getNodeByKey(key) {
  return this.nodes[key]
}

// Возвращает соседние узлы
getNeighbors(node) {
  return node.getNeighbors()
}

// Возвращает значения всех узлов
getAllNodes() {
  return Object.values(this.nodes)
}

// Возвращает значения всех ребер
getAllEdges() {
  return Object.values(this.edges)
}
```

Методы добавления, удаления и поиска ребер:

```javascript
// Добавляет ребро в граф
addEdge(newEdge) {
  // Пытаемся найти начальную и конечную вершины
  let from = this.getNodeByKey(newEdge.from.getKey())
  let to = this.getNodeByKey(newEdge.to.getKey())

  // Добавляем начальную вершину
  if (!from) {
    this.addNode(newEdge.from)
    from = this.getNodeByKey(newEdge.from.getKey())
  }

  // Добавляем конечную вершину
  if (!to) {
    this.addNode(newEdge.to)
    to = this.getNodeByKey(newEdge.to.getKey())
  }

  // Если ребро уже добавлено
  if (this.edges[newEdge.getKey()]) {
    throw new Error('Ребро уже добавлено!')
  } else {
    // Добавляем ребро
    this.edges[newEdge.getKey()] = newEdge
  }

  // Добавляем ребро в вершины
  if (this.isDirected) {
    from.addEdge(newEdge)
  } else {
    from.addEdge(newEdge)
    to.addEdge(newEdge)
  }

  return this
}

// Удаляет ребро из графа
removeEdge(edge) {
  if (this.edges[edge.getKey()]) {
    // Удаляем ребро
    delete this.edges[edge.getKey()]
  } else {
    throw new Error('Ребро не найдено!')
  }

  // Пытаемся найти начальную и конечную вершины
  let from = this.getNodeByKey(edge.from.getKey())
  let to = this.getNodeByKey(edge.to.getKey())

  // Удаляем ребро из вершин
  from && from.removeEdge(edge)
  to && to.removeEdge(edge)
}

// Находит ребро в графе
findEdge(from, to) {
  // Находим узел по начальному ключу
  const node = this.getNodeByKey(from.getKey())

  if (!node) return null

  // Пытаемся найти конечное ребро
  return node.findEdge(to)
}
```

Методы получения веса графа, инвертирования графа и получения индексов узлов:

```javascript
// Возвращает вес графа
getWeight() {
  // Суммируем веса всех ребер
  return this.getAllEdges().reduce((acc, edge) => acc + edge.weight, 0)
}

// Инвертирует граф
reverse() {
  // Для каждого ребра
  this.getAllEdges().forEach((edge) => {
    // Удаляем ребро из графа
    this.removeEdge(edge)

    // Инвертируем ребро
    edge.reverse()

    // Снова добавляем ребро в граф
    this.addEdge(edge)
  })

  return this
}

// Возвращает индексы узлов в виде объекта
getNodesIndices() {
  const indices = {}

  this.getAllNodes().forEach((node, index) => {
    indices[node.getKey()] = index
  })

  return indices
}
```

Метод получения матрицы смежности:

```javascript
// Возвращает матрицу смежности
getAdjacencyMatrix() {
  // Узлы
  const nodes = this.getAllNodes()
  // Индексы узлов
  const indices = this.getNodesIndices()
  // Инициализируем матрицу смежности (заполняем ее `null`)
  const matrix = new Array(nodes.length)
    .fill()
    .map(() => new Array(nodes.length).fill(null))

  // Формируем матрицу.
  // Перебираем узлы
  nodes.forEach((node, index) => {
    // Перебираем соседей узла
    node.getNeighbors().forEach((neighbor) => {
      // Индекс соседа
      const neighborIndex = indices[neighbor.getKey()]
      // [индекс узла][индекс соседа] = вес ребра
      matrix[index][neighborIndex] = this.findEdge(node, neighbor).weight
    })
  })

  return matrix
}
```

Наконец, вспомогательный метод преобразования графа в строку:

```javascript
// Возвращает строковое представление графа
toString() {
  return Object.keys(this.nodes).toString()
}
```

<details>
<summary>Полный код графа</summary>

```javascript
export default class Graph {
  constructor(isDirected = false) {
    // Индикатор направленности графа
    // (по умолчанию граф является ненаправленным)
    this.isDirected = isDirected
    // Узлы
    this.nodes = {}
    // Ребра
    this.edges = {}
  }

  // Добавляет узел в граф
  addNode(newNode) {
    this.nodes[newNode.getKey()] = newNode

    return this
  }

  // Возвращает узел по ключу
  getNodeByKey(key) {
    return this.nodes[key]
  }

  // Возвращает соседние узлы
  getNeighbors(node) {
    return node.getNeighbors()
  }

  // Возвращает значения всех узлов
  getAllNodes() {
    return Object.values(this.nodes)
  }

  // Возвращает значения всех ребер
  getAllEdges() {
    return Object.values(this.edges)
  }

  // Добавляет ребро в граф
  addEdge(newEdge) {
    // Пытаемся найти начальную и конечную вершины
    let from = this.getNodeByKey(newEdge.from.getKey())
    let to = this.getNodeByKey(newEdge.to.getKey())

    // Добавляем начальную вершину
    if (!from) {
      this.addNode(newEdge.from)
      from = this.getNodeByKey(newEdge.from.getKey())
    }

    // Добавляем конечную вершину
    if (!to) {
      this.addNode(newEdge.to)
      to = this.getNodeByKey(newEdge.to.getKey())
    }

    // Если ребро уже добавлено
    if (this.edges[newEdge.getKey()]) {
      throw new Error('Ребро уже добавлено!')
    } else {
      // Добавляем ребро
      this.edges[newEdge.getKey()] = newEdge
    }

    // Добавляем ребро в вершины
    if (this.isDirected) {
      from.addEdge(newEdge)
    } else {
      from.addEdge(newEdge)
      to.addEdge(newEdge)
    }

    return this
  }

  // Удаляет ребро из графа
  removeEdge(edge) {
    if (this.edges[edge.getKey()]) {
      // Удаляем ребро
      delete this.edges[edge.getKey()]
    } else {
      throw new Error('Ребро не найдено!')
    }

    // Пытаемся найти начальную и конечную вершины
    let from = this.getNodeByKey(edge.from.getKey())
    let to = this.getNodeByKey(edge.to.getKey())

    // Удаляем ребро из вершин
    from && from.removeEdge(edge)
    to && to.removeEdge(edge)
  }

  // Находит ребро в графе
  findEdge(from, to) {
    // Находим узел по начальному ключу
    const node = this.getNodeByKey(from.getKey())

    if (!node) return null

    // Пытаемся найти конечное ребро
    return node.findEdge(to)
  }

  // Возвращает вес графа
  getWeight() {
    // Суммируем веса всех ребер
    return this.getAllEdges().reduce((acc, edge) => acc + edge.weight, 0)
  }

  // Инвертирует граф
  reverse() {
    // Для каждого ребра
    this.getAllEdges().forEach((edge) => {
      // Удаляем ребро из графа
      this.removeEdge(edge)

      // Инвертируем ребро
      edge.reverse()

      // Снова добавляем ребро в граф
      this.addEdge(edge)
    })

    return this
  }

  // Возвращает индексы узлов в виде объекта
  getNodesIndices() {
    const indices = {}

    this.getAllNodes().forEach((node, index) => {
      indices[node.getKey()] = index
    })

    return indices
  }

  // Возвращает матрицу смежности
  getAdjacencyMatrix() {
    // Узлы
    const nodes = this.getAllNodes()
    // Индексы узлов
    const indices = this.getNodesIndices()
    // Инициализируем матрицу смежности (заполняем ее `null`)
    const matrix = new Array(nodes.length)
      .fill()
      .map(() => new Array(nodes.length).fill(null))

    // Формируем матрицу.
    // Перебираем узлы
    nodes.forEach((node, index) => {
      // Перебираем соседей узла
      node.getNeighbors().forEach((neighbor) => {
        // Индекс соседа
        const neighborIndex = indices[neighbor.getKey()]
        // [индекс узла][индекс соседа] = вес ребра
        matrix[index][neighborIndex] = this.findEdge(node, neighbor).weight
      })
    })

    return matrix
  }

  // Возвращает строковое представление графа
  toString() {
    return Object.keys(this.nodes).toString()
  }
}
```

</details>

<details>
<summary>Тесты</summary>

```javascript
// data-structures/graph/__tests__/graph.test.js
import Graph from '..'
import Node from '../node'
import Edge from '../edge'

describe('Graph', () => {
  it('должен добавить узлы в граф', () => {
    const graph = new Graph()

    const nodeA = new Node('A')
    const nodeB = new Node('B')

    graph.addNode(nodeA).addNode(nodeB)

    expect(graph.toString()).toBe('A,B')
    expect(graph.getNodeByKey(nodeA.getKey())).toEqual(nodeA)
    expect(graph.getNodeByKey(nodeB.getKey())).toEqual(nodeB)
  })

  it('должен добавить ребра в ненаправленный граф', () => {
    const graph = new Graph()

    const nodeA = new Node('A')
    const nodeB = new Node('B')

    const edgeAB = new Edge(nodeA, nodeB)

    graph.addEdge(edgeAB)

    expect(graph.getAllNodes().length).toBe(2)
    expect(graph.getAllNodes()[0]).toEqual(nodeA)
    expect(graph.getAllNodes()[1]).toEqual(nodeB)

    const graphNodeA = graph.getNodeByKey(nodeA.getKey())
    const graphNodeB = graph.getNodeByKey(nodeB.getKey())

    expect(graph.toString()).toBe('A,B')
    expect(graphNodeA).toBeDefined()
    expect(graphNodeB).toBeDefined()

    expect(graph.getNodeByKey('not existing')).toBeUndefined()

    expect(graphNodeA.getNeighbors().length).toBe(1)
    expect(graphNodeA.getNeighbors()[0]).toEqual(nodeB)
    expect(graphNodeA.getNeighbors()[0]).toEqual(graphNodeB)

    expect(graphNodeB.getNeighbors().length).toBe(1)
    expect(graphNodeB.getNeighbors()[0]).toEqual(nodeA)
    expect(graphNodeB.getNeighbors()[0]).toEqual(graphNodeA)
  })

  it('должен добавить ребра в направленный граф', () => {
    const graph = new Graph(true)

    const nodeA = new Node('A')
    const nodeB = new Node('B')

    const edgeAB = new Edge(nodeA, nodeB)

    graph.addEdge(edgeAB)

    const graphNodeA = graph.getNodeByKey(nodeA.getKey())
    const graphNodeB = graph.getNodeByKey(nodeB.getKey())

    expect(graph.toString()).toBe('A,B')
    expect(graphNodeA).toBeDefined()
    expect(graphNodeB).toBeDefined()

    expect(graphNodeA.getNeighbors().length).toBe(1)
    expect(graphNodeA.getNeighbors()[0]).toEqual(nodeB)
    expect(graphNodeA.getNeighbors()[0]).toEqual(graphNodeB)

    expect(graphNodeB.getNeighbors().length).toBe(0)
  })

  it('должен найти ребра по узлам в ненаправленном графе', () => {
    const graph = new Graph()

    const nodeA = new Node('A')
    const nodeB = new Node('B')
    const nodeC = new Node('C')

    const edgeAB = new Edge(nodeA, nodeB, 10)

    graph.addEdge(edgeAB)

    const graphEdgeAB = graph.findEdge(nodeA, nodeB)
    const graphEdgeBA = graph.findEdge(nodeB, nodeA)
    const graphEdgeAC = graph.findEdge(nodeA, nodeC)
    const graphEdgeCA = graph.findEdge(nodeC, nodeA)

    expect(graphEdgeAC).toBeNull()
    expect(graphEdgeCA).toBeNull()
    expect(graphEdgeAB).toEqual(edgeAB)
    expect(graphEdgeBA).toEqual(edgeAB)
    expect(graphEdgeAB.weight).toBe(10)
  })

  it('должен найти ребра по узлам в направленном графе', () => {
    const graph = new Graph(true)

    const nodeA = new Node('A')
    const nodeB = new Node('B')
    const nodeC = new Node('C')

    const edgeAB = new Edge(nodeA, nodeB, 10)

    graph.addEdge(edgeAB)

    const graphEdgeAB = graph.findEdge(nodeA, nodeB)
    const graphEdgeBA = graph.findEdge(nodeB, nodeA)
    const graphEdgeAC = graph.findEdge(nodeA, nodeC)
    const graphEdgeCA = graph.findEdge(nodeC, nodeA)

    expect(graphEdgeAC).toBeNull()
    expect(graphEdgeCA).toBeNull()
    expect(graphEdgeBA).toBeNull()
    expect(graphEdgeAB).toEqual(edgeAB)
    expect(graphEdgeAB.weight).toBe(10)
  })

  it('должен вернуть соседей узла', () => {
    const graph = new Graph(true)

    const nodeA = new Node('A')
    const nodeB = new Node('B')
    const nodeC = new Node('C')

    const edgeAB = new Edge(nodeA, nodeB)
    const edgeAC = new Edge(nodeA, nodeC)

    graph.addEdge(edgeAB).addEdge(edgeAC)

    const neighbors = graph.getNeighbors(nodeA)

    expect(neighbors.length).toBe(2)
    expect(neighbors[0]).toEqual(nodeB)
    expect(neighbors[1]).toEqual(nodeC)
  })

  it('должен выбросить исключение при повторном добавлении ребра', () => {
    function addSameEdgeTwice() {
      const graph = new Graph(true)

      const nodeA = new Node('A')
      const nodeB = new Node('B')

      const edgeAB = new Edge(nodeA, nodeB)

      graph.addEdge(edgeAB).addEdge(edgeAB)
    }

    expect(addSameEdgeTwice).toThrow()
  })

  it('должен вернуть список всех добавленных узлов', () => {
    const graph = new Graph(true)

    const nodeA = new Node('A')
    const nodeB = new Node('B')
    const nodeC = new Node('C')

    const edgeAB = new Edge(nodeA, nodeB)
    const edgeBC = new Edge(nodeB, nodeC)

    graph.addEdge(edgeAB).addEdge(edgeBC)

    const edges = graph.getAllEdges()

    expect(edges.length).toBe(2)
    expect(edges[0]).toEqual(edgeAB)
    expect(edges[1]).toEqual(edgeBC)
  })

  it('должен вычислить общий вес дефолтного графа', () => {
    const graph = new Graph()

    const nodeA = new Node('A')
    const nodeB = new Node('B')
    const nodeC = new Node('C')
    const nodeD = new Node('D')

    const edgeAB = new Edge(nodeA, nodeB)
    const edgeBC = new Edge(nodeB, nodeC)
    const edgeCD = new Edge(nodeC, nodeD)
    const edgeAD = new Edge(nodeA, nodeD)

    graph.addEdge(edgeAB).addEdge(edgeBC).addEdge(edgeCD).addEdge(edgeAD)

    expect(graph.getWeight()).toBe(0)
  })

  it('должен вычислить общий вес взвешенного графа', () => {
    const graph = new Graph()

    const nodeA = new Node('A')
    const nodeB = new Node('B')
    const nodeC = new Node('C')
    const nodeD = new Node('D')

    const edgeAB = new Edge(nodeA, nodeB, 1)
    const edgeBC = new Edge(nodeB, nodeC, 2)
    const edgeCD = new Edge(nodeC, nodeD, 3)
    const edgeAD = new Edge(nodeA, nodeD, 4)

    graph.addEdge(edgeAB).addEdge(edgeBC).addEdge(edgeCD).addEdge(edgeAD)

    expect(graph.getWeight()).toBe(10)
  })

  it('должен удалить ребра из графа', () => {
    const graph = new Graph()

    const nodeA = new Node('A')
    const nodeB = new Node('B')
    const nodeC = new Node('C')

    const edgeAB = new Edge(nodeA, nodeB)
    const edgeBC = new Edge(nodeB, nodeC)
    const edgeAC = new Edge(nodeA, nodeC)

    graph.addEdge(edgeAB).addEdge(edgeBC).addEdge(edgeAC)

    expect(graph.getAllEdges().length).toBe(3)

    graph.removeEdge(edgeAB)

    expect(graph.getAllEdges().length).toBe(2)
    expect(graph.getAllEdges()[0].getKey()).toBe(edgeBC.getKey())
    expect(graph.getAllEdges()[1].getKey()).toBe(edgeAC.getKey())
  })

  it('должен выбросить исключение при удалении несуществующего узла', () => {
    function deleteNotExistingEdge() {
      const graph = new Graph()

      const nodeA = new Node('A')
      const nodeB = new Node('B')
      const nodeC = new Node('C')

      const edgeAB = new Edge(nodeA, nodeB)
      const edgeBC = new Edge(nodeB, nodeC)

      graph.addEdge(edgeAB)
      graph.removeEdge(edgeBC)
    }

    expect(deleteNotExistingEdge).toThrowError()
  })

  it('должен инвертировать граф', () => {
    const nodeA = new Node('A')
    const nodeB = new Node('B')
    const nodeC = new Node('C')
    const nodeD = new Node('D')

    const edgeAB = new Edge(nodeA, nodeB)
    const edgeAC = new Edge(nodeA, nodeC)
    const edgeCD = new Edge(nodeC, nodeD)

    const graph = new Graph(true)
    graph.addEdge(edgeAB).addEdge(edgeAC).addEdge(edgeCD)

    expect(graph.toString()).toBe('A,B,C,D')
    expect(graph.getAllEdges().length).toBe(3)
    expect(graph.getNeighbors(nodeA).length).toBe(2)
    expect(graph.getNeighbors(nodeA)[0].getKey()).toBe(nodeB.getKey())
    expect(graph.getNeighbors(nodeA)[1].getKey()).toBe(nodeC.getKey())
    expect(graph.getNeighbors(nodeB).length).toBe(0)
    expect(graph.getNeighbors(nodeC).length).toBe(1)
    expect(graph.getNeighbors(nodeC)[0].getKey()).toBe(nodeD.getKey())
    expect(graph.getNeighbors(nodeD).length).toBe(0)

    graph.reverse()

    expect(graph.toString()).toBe('A,B,C,D')
    expect(graph.getAllEdges().length).toBe(3)
    expect(graph.getNeighbors(nodeA).length).toBe(0)
    expect(graph.getNeighbors(nodeB).length).toBe(1)
    expect(graph.getNeighbors(nodeB)[0].getKey()).toBe(nodeA.getKey())
    expect(graph.getNeighbors(nodeC).length).toBe(1)
    expect(graph.getNeighbors(nodeC)[0].getKey()).toBe(nodeA.getKey())
    expect(graph.getNeighbors(nodeD).length).toBe(1)
    expect(graph.getNeighbors(nodeD)[0].getKey()).toBe(nodeC.getKey())
  })

  it('должен вернуть индексы узлов', () => {
    const nodeA = new Node('A')
    const nodeB = new Node('B')
    const nodeC = new Node('C')
    const nodeD = new Node('D')

    const edgeAB = new Edge(nodeA, nodeB)
    const edgeBC = new Edge(nodeB, nodeC)
    const edgeCD = new Edge(nodeC, nodeD)
    const edgeBD = new Edge(nodeB, nodeD)

    const graph = new Graph()
    graph.addEdge(edgeAB).addEdge(edgeBC).addEdge(edgeCD).addEdge(edgeBD)

    const verticesIndices = graph.getNodesIndices()
    expect(verticesIndices).toEqual({
      A: 0,
      B: 1,
      C: 2,
      D: 3,
    })
  })

  it('должен вернуть матрицу смежности для ненаправленного графа', () => {
    const nodeA = new Node('A')
    const nodeB = new Node('B')
    const nodeC = new Node('C')
    const nodeD = new Node('D')

    const edgeAB = new Edge(nodeA, nodeB)
    const edgeBC = new Edge(nodeB, nodeC)
    const edgeCD = new Edge(nodeC, nodeD)
    const edgeBD = new Edge(nodeB, nodeD)

    const graph = new Graph()
    graph.addEdge(edgeAB).addEdge(edgeBC).addEdge(edgeCD).addEdge(edgeBD)

    const adjacencyMatrix = graph.getAdjacencyMatrix()
    expect(adjacencyMatrix).toEqual([
      [null, 0, null, null],
      [0, null, 0, 0],
      [null, 0, null, 0],
      [null, 0, 0, null],
    ])
  })

  it('должен вернуть матрицу смежности для направленного графа', () => {
    const nodeA = new Node('A')
    const nodeB = new Node('B')
    const nodeC = new Node('C')
    const nodeD = new Node('D')

    const edgeAB = new Edge(nodeA, nodeB, 2)
    const edgeBC = new Edge(nodeB, nodeC, 1)
    const edgeCD = new Edge(nodeC, nodeD, 5)
    const edgeBD = new Edge(nodeB, nodeD, 7)

    const graph = new Graph(true)
    graph.addEdge(edgeAB).addEdge(edgeBC).addEdge(edgeCD).addEdge(edgeBD)

    const adjacencyMatrix = graph.getAdjacencyMatrix()
    expect(adjacencyMatrix).toEqual([
      [null, 2, null, null],
      [null, null, 1, 7],
      [null, null, null, 5],
      [null, null, null, null],
    ])
  })
})
```

</details>

Запускаем тесты:

```bash
npm run test ./data-structures/graph/__tests__/graph
```

<img src="https://habrastorage.org/webt/pa/mt/ki/pamtkifppu8pvgvkzt7h1iokgek.png" />
