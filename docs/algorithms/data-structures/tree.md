---
sidebar_position: 9
title: Дерево
description: Дерево
keywords: ['javascript', 'js', 'data structures', 'структуры данных']
tags: ['javascript', 'js', 'data structures', 'структуры данных']
---

# Дерево

- [Википедия](https://ru.wikipedia.org/wiki/%D0%94%D0%B5%D1%80%D0%B5%D0%B2%D0%BE_(%D1%81%D1%82%D1%80%D1%83%D0%BA%D1%82%D1%83%D1%80%D0%B0_%D0%B4%D0%B0%D0%BD%D0%BD%D1%8B%D1%85))
- [YouTube](https://www.youtube.com/watch?v=0BUX_PotA4c)
- [Yandex](https://www.youtube.com/watch?v=lEJzqHgyels)

Дерево (tree) - это широко распространенный абстрактный тип данных (АТД) или структура данных, реализующая этот АТД, которая симулирует иерархическую структуру дерева с корневым узлом и поддеревьями потомков с родительским узлом, представленными как связные списки.

Древовидная структура данных может быть определена рекурсивно (локально) как коллекция узлов (начиная с корневого), где каждый узел содержит значение и список ссылок на другие узлы (потомки) с тем ограничением, что ссылки не дублируются и не указывают на корень.

<img src="https://habrastorage.org/webt/ty/q7/ms/tyq7mst4eh5zamh5dy9l7lnvqr4.png" />
<br />

_Пример простого неупорядоченного дерева. Узел со значением 3 имеет двух потомков со значениями 2 и 6 и одного предка со значением 2. Корневой узел на вершине предков не имеет._

## Двоичное дерево поиска

__Описание__

- [Википедия](https://ru.wikipedia.org/wiki/%D0%94%D0%B2%D0%BE%D0%B8%D1%87%D0%BD%D0%BE%D0%B5_%D0%B4%D0%B5%D1%80%D0%B5%D0%B2%D0%BE_%D0%BF%D0%BE%D0%B8%D1%81%D0%BA%D0%B0)
- [YouTube](https://www.youtube.com/watch?v=9o_i0zzxk1s)

Двоичное (или бинарное) дерево поиска (binary search tree, BST) (ДДП), иногда называемое упорядоченным или отсортированным двоичным деревом, - это структура данных для хранения "элементов" (чисел, имен и др.) в памяти. Она позволяет выполнять быстрый поиск, добавление и удаление элементов и может использоваться для реализации динамических множеств элементов или поисковых таблиц, позволяющих искать значения по ключу (например, искать номер телефона по имени человека).

Ключи ДДП являются отсортированными, поэтому поиск и другие операции полагаются на принцип двоичного поиска: при поиске ключа (или места для его добавления) дерево обходится от корня к листьям, ключи, хранящиеся в узлах, сравниваются, и принимается решение о том, в каком поддереве, правом или левом, продолжать поиск. В среднем, это означает, что выполнение операции обходится примерно в два раза дешевле, т.е. поиск, вставка и удаление выполняются за время, пропорциональное логарифму количества элементов, хранящихся в дереве. Это лучше, чем линейное время, необходимое для поиска элемента по ключу в (неупорядоченном) массиве, но хуже, чем соответствующие операции хзш-таблицы (см. часть 2, раздел 5).

<img src="https://habrastorage.org/webt/x5/ov/ug/x5ovugz3usgw2ok9ox8nj0zqtti.png" />
<br />

_ДДП размером 9 и глубиной (высотой) 3 с корнем со значением 8._

Интерактивную визуализации ДДП можно посмотреть [здесь](https://www.cs.usfca.edu/~galles/visualization/BST.html).

__Сложность__

_Временная_

| Поиск      | Вставка    | Удаление   |
|------------|------------|------------|
| `O(log n)` | `O(log n)` | `O(log n)` |

_Пространственная_

`O(n)`

__Реализация__

Начнем с реализации суперкласса узла двоичного дерева:

```javascript
// data-structures/tree/binary-tree-node.js
import Comparator from '../../utils/comparator'
import HashTable from '../hash-table'

export default class BinaryTreeNode {
  constructor(value = null) {
    // Значение
    this.value = value
    // Левый потомок
    this.left = null
    // Правый потомок
    this.right = null
    // Предок
    this.parent = null

    // Дополнительная информация об узле
    this.meta = new HashTable()

    // Функция сравнения узлов
    this.nodeComparator = new Comparator()
  }
}
```

Несколько геттеров для получения высоты (глубины) поддеревьев:

```javascript
// Геттер высоты (глубины) левого поддерева
get leftHeight() {
  if (!this.left) {
    return 0
  }

  return this.left.height + 1
}

// Геттер высоты правого поддерева
get rightHeight() {
  if (!this.right) {
    return 0
  }

  return this.right.height + 1
}

// Геттер максимальной высоты
get height() {
  return Math.max(this.leftHeight, this.rightHeight)
}

// Геттер разницы между высотой левого и правого поддеревьев
// (фактор балансировки, баланс-фактор)
get balanceFactor() {
  return this.leftHeight - this.rightHeight
}
```

Для определения правильного места для вставки элемента нам также потребуется геттер узла, соседнего с родительским (дяди):

```javascript
// Геттер дяди
get uncle() {
  // Если нет предка, то нет и дяди
  if (!this.parent) {
    return null
  }

  // Если нет дедушки, то нет и дяди
  if (!this.parent.parent) {
    return null
  }

  // Если у дедушки нет двух потомков, то нет и дяди
  if (!this.parent.parent.left || !this.parent.parent.right) {
    return null
  }

  // Выясняем, кто является дядей
  // путем сравнения предка с потомком дедушки
  if (this.nodeComparator.equal(this.parent, this.parent.parent.left)) {
    // Дядя - правый узел
    return this.parent.parent.right
  }

  // Дядя - левый узел
  return this.parent.parent.left
}
```

Методы установки значения, левого и правого потомков:

```javascript
// Устанавливает значение
setValue(value) {
  this.value = value

  return this
}

// Устанавливает левого потомок
setLeft(node) {
  // Сбрасываем предка левого узла
  if (this.left) {
    this.left.parent = null
  }

  // Обновляем левый узел
  this.left = node

  // Делаем текущий узел предком нового левого узла
  if (this.left) {
    this.left.parent = this
  }

  return this
}

// Устанавливает правого потомка
setRight(node) {
  // Сбрасываем предка правого узла
  if (this.right) {
    this.right.parent = null
  }

  // Обновляем правый узел
  this.right = node

  // Делаем текущий узел предком нового правого узла
  if (this.right) {
    this.right.parent = this
  }

  return this
}
```

Методы удаления и замены потомка:

```javascript
// Удаляет потомка
removeChild(nodeToRemove) {
  // Если удаляется левый потомок
  if (this.left && this.nodeComparator.equal(this.left, nodeToRemove)) {
    this.left = null
    return true
  }

  // Если удаляется правый потомок
  if (this.right && this.nodeComparator.equal(this.right, nodeToRemove)) {
    this.right = null
    return true
  }

  return false
}

// Заменяет потомка
replaceChild(nodeToReplace, replacementNode) {
  if (!nodeToReplace || !replacementNode) {
    return false
  }

  // Если заменяется левый потомок
  if (this.left && this.nodeComparator.equal(this.left, nodeToReplace)) {
    this.left = replacementNode
    return true
  }

  // Если заменяется правый потомок
  if (this.right && this.nodeComparator.equal(this.right, nodeToReplace)) {
    this.right = replacementNode
    return true
  }

  return false
}
```

Метод обхода дерева в порядке возрастания ключей (симметричный обход):

```javascript
// Обходит дерево в порядке возрастания ключей (inorder, infix traverse):
// сначала обходится левое поддерево, затем корень, затем правое поддерево
traverseInOrder() {
  let result = []

  if (this.left) {
    result = result.concat(this.left.traverseInOrder())
  }

  result.push(this.value)

  if (this.right) {
    result = result.concat(this.right.traverseInOrder())
  }

  return result
}
```

Статический метод копирования узла и метод преобразования дерева в строку:

```javascript
// Статический метод копирования узла
static copyNode(sourceNode, targetNode) {
  targetNode.setValue(sourceNode.value)
  targetNode.setLeft(sourceNode.left)
  targetNode.setRight(sourceNode.right)
}

// Преобразует дерево в строку
toString() {
  return this.traverseInOrder().toString()
}
```

<details>
<summary>Полный код узла двоичного дерева</summary>

```javascript
import Comparator from '../../utils/comparator'
import HashTable from '../hash-table'

export default class BinaryTreeNode {
  constructor(value = null) {
    // Значение
    this.value = value
    // Левый потомок
    this.left = null
    // Правый потомок
    this.right = null
    // Предок
    this.parent = null

    // Дополнительная информация об узле
    this.meta = new HashTable()

    // Функция сравнения узлов
    this.nodeComparator = new Comparator()
  }

  // Геттер высоты (глубины) левого поддерева
  get leftHeight() {
    if (!this.left) {
      return 0
    }

    return this.left.height + 1
  }

  // Геттер высоты правого поддерева
  get rightHeight() {
    if (!this.right) {
      return 0
    }

    return this.right.height + 1
  }

  // Геттер максимальной высоты
  get height() {
    return Math.max(this.leftHeight, this.rightHeight)
  }

  // Геттер разницы между высотой левого и правого поддеревьев
  // (фактор балансировки)
  get balanceFactor() {
    return this.leftHeight - this.rightHeight
  }

  // Геттер дяди
  get uncle() {
    // Если нет предка, то нет и дяди
    if (!this.parent) {
      return null
    }

    // Если нет дедушки, то нет и дяди
    if (!this.parent.parent) {
      return null
    }

    // Если у дедушки нет двух потомков, то нет и дяди
    if (!this.parent.parent.left || !this.parent.parent.right) {
      return null
    }

    // Выясняем, кто является дядей
    // путем сравнения предка с потомком дедушки
    if (this.nodeComparator.equal(this.parent, this.parent.parent.left)) {
      // Дядя - правый узел
      return this.parent.parent.right
    }

    // Дядя - левый узел
    return this.parent.parent.left
  }

  // Устанавливает значение
  setValue(value) {
    this.value = value

    return this
  }

  // Устанавливает левого потомок
  setLeft(node) {
    // Сбрасываем предка левого узла
    if (this.left) {
      this.left.parent = null
    }

    // Обновляем левый узел
    this.left = node

    // Делаем текущий узел предком нового левого узла
    if (this.left) {
      this.left.parent = this
    }

    return this
  }

  // Устанавливает правого потомка
  setRight(node) {
    // Сбрасываем предка правого узла
    if (this.right) {
      this.right.parent = null
    }

    // Обновляем правый узел
    this.right = node

    // Делаем текущий узел предком нового правого узла
    if (this.right) {
      this.right.parent = this
    }

    return this
  }

  // Удаляет потомка
  removeChild(nodeToRemove) {
    // Если удаляется левый потомок
    if (this.left && this.nodeComparator.equal(this.left, nodeToRemove)) {
      this.left = null
      return true
    }

    // Если удаляется правый потомок
    if (this.right && this.nodeComparator.equal(this.right, nodeToRemove)) {
      this.right = null
      return true
    }

    return false
  }

  // Заменяет потомка
  replaceChild(nodeToReplace, replacementNode) {
    if (!nodeToReplace || !replacementNode) {
      return false
    }

    // Если заменяется левый потомок
    if (this.left && this.nodeComparator.equal(this.left, nodeToReplace)) {
      this.left = replacementNode
      return true
    }

    // Если заменяется правый потомок
    if (this.right && this.nodeComparator.equal(this.right, nodeToReplace)) {
      this.right = replacementNode
      return true
    }

    return false
  }

  // Обходит дерево в порядке возрастания ключей (inorder, infix traverse):
  // сначала обходится левое поддерево, затем корень, затем правое поддерево
  traverseInOrder() {
    let result = []

    if (this.left) {
      result = result.concat(this.left.traverseInOrder())
    }

    result.push(this.value)

    if (this.right) {
      result = result.concat(this.right.traverseInOrder())
    }

    return result
  }

  // Статический метод копирования узла
  static copyNode(sourceNode, targetNode) {
    targetNode.setValue(sourceNode.value)
    targetNode.setLeft(sourceNode.left)
    targetNode.setRight(sourceNode.right)
  }

  // Преобразует дерево в строку
  toString() {
    return this.traverseInOrder().toString()
  }
}
```

</details>

<details>
<summary>Тесты</summary>

```javascript
// data-structures/tree/__tests__/binary-tree-node.test.js
import BinaryTreeNode from '../binary-tree-node'

describe('BinaryTreeNode', () => {
  it('должен создать узел', () => {
    const node = new BinaryTreeNode()

    expect(node).toBeDefined()

    expect(node.value).toBeNull()
    expect(node.left).toBeNull()
    expect(node.right).toBeNull()

    const leftNode = new BinaryTreeNode(1)
    const rightNode = new BinaryTreeNode(3)
    const rootNode = new BinaryTreeNode(2)

    rootNode.setLeft(leftNode).setRight(rightNode)

    expect(rootNode.value).toBe(2)
    expect(rootNode.left.value).toBe(1)
    expect(rootNode.right.value).toBe(3)
  })

  it('должен установить предка', () => {
    const leftNode = new BinaryTreeNode(1)
    const rightNode = new BinaryTreeNode(3)
    const rootNode = new BinaryTreeNode(2)

    rootNode.setLeft(leftNode).setRight(rightNode)

    expect(rootNode.parent).toBeNull()
    expect(rootNode.left.parent.value).toBe(2)
    expect(rootNode.right.parent.value).toBe(2)
    expect(rootNode.right.parent).toEqual(rootNode)
  })

  it('должен обойти дерево', () => {
    const leftNode = new BinaryTreeNode(1)
    const rightNode = new BinaryTreeNode(3)
    const rootNode = new BinaryTreeNode(2)

    rootNode.setLeft(leftNode).setRight(rightNode)

    expect(rootNode.traverseInOrder()).toEqual([1, 2, 3])

    expect(rootNode.toString()).toBe('1,2,3')
  })

  it('должен удалить потомков', () => {
    const leftNode = new BinaryTreeNode(1)
    const rightNode = new BinaryTreeNode(3)
    const rootNode = new BinaryTreeNode(2)

    rootNode.setLeft(leftNode).setRight(rightNode)

    expect(rootNode.traverseInOrder()).toEqual([1, 2, 3])

    expect(rootNode.removeChild(rootNode.left)).toBe(true)
    expect(rootNode.traverseInOrder()).toEqual([2, 3])

    expect(rootNode.removeChild(rootNode.right)).toBe(true)
    expect(rootNode.traverseInOrder()).toEqual([2])

    expect(rootNode.removeChild(rootNode.right)).toBe(false)
    expect(rootNode.traverseInOrder()).toEqual([2])
  })

  it('должен заменить потомков', () => {
    const leftNode = new BinaryTreeNode(1)
    const rightNode = new BinaryTreeNode(3)
    const rootNode = new BinaryTreeNode(2)

    rootNode.setLeft(leftNode).setRight(rightNode)

    expect(rootNode.traverseInOrder()).toEqual([1, 2, 3])

    const replacementNode = new BinaryTreeNode(5)
    rightNode.setRight(replacementNode)

    expect(rootNode.traverseInOrder()).toEqual([1, 2, 3, 5])

    expect(rootNode.replaceChild(rootNode.right, rootNode.right.right)).toBe(
      true,
    )
    expect(rootNode.right.value).toBe(5)
    expect(rootNode.right.right).toBeNull()
    expect(rootNode.traverseInOrder()).toEqual([1, 2, 5])

    expect(rootNode.replaceChild(rootNode.right, rootNode.right.right)).toBe(
      false,
    )
    expect(rootNode.traverseInOrder()).toEqual([1, 2, 5])

    expect(rootNode.replaceChild(rootNode.right, replacementNode)).toBe(true)
    expect(rootNode.traverseInOrder()).toEqual([1, 2, 5])

    expect(rootNode.replaceChild(rootNode.left, replacementNode)).toBe(true)
    expect(rootNode.traverseInOrder()).toEqual([5, 2, 5])

    expect(
      rootNode.replaceChild(new BinaryTreeNode(), new BinaryTreeNode()),
    ).toBe(false)
  })

  it('должен вычислить высоту узлов', () => {
    const root = new BinaryTreeNode(1)
    const left = new BinaryTreeNode(3)
    const right = new BinaryTreeNode(2)
    const grandLeft = new BinaryTreeNode(5)
    const grandRight = new BinaryTreeNode(6)
    const grandGrandLeft = new BinaryTreeNode(7)

    expect(root.height).toBe(0)
    expect(root.balanceFactor).toBe(0)

    root.setLeft(left).setRight(right)

    expect(root.height).toBe(1)
    expect(left.height).toBe(0)
    expect(root.balanceFactor).toBe(0)

    left.setLeft(grandLeft).setRight(grandRight)

    expect(root.height).toBe(2)
    expect(left.height).toBe(1)
    expect(grandLeft.height).toBe(0)
    expect(grandRight.height).toBe(0)
    expect(root.balanceFactor).toBe(1)

    grandLeft.setLeft(grandGrandLeft)

    expect(root.height).toBe(3)
    expect(left.height).toBe(2)
    expect(grandLeft.height).toBe(1)
    expect(grandRight.height).toBe(0)
    expect(grandGrandLeft.height).toBe(0)
    expect(root.balanceFactor).toBe(2)
  })

  it('должен также вычислить высоту правых узлов', () => {
    const root = new BinaryTreeNode(1)
    const right = new BinaryTreeNode(2)

    root.setRight(right)

    expect(root.height).toBe(1)
    expect(right.height).toBe(0)
    expect(root.balanceFactor).toBe(-1)
  })

  it('должен обнулить левый и правый узлы', () => {
    const root = new BinaryTreeNode(2)
    const left = new BinaryTreeNode(1)
    const right = new BinaryTreeNode(3)

    root.setLeft(left)
    root.setRight(right)

    expect(root.left.value).toBe(1)
    expect(root.right.value).toBe(3)

    root.setLeft(null)
    root.setRight(null)

    expect(root.left).toBeNull()
    expect(root.right).toBeNull()
  })

  it('должен добавить объекты', () => {
    const obj1 = { key: 'object_1', toString: () => 'object_1' }
    const obj2 = { key: 'object_2' }

    const node1 = new BinaryTreeNode(obj1)
    const node2 = new BinaryTreeNode(obj2)

    node1.setLeft(node2)

    expect(node1.value).toEqual(obj1)
    expect(node2.value).toEqual(obj2)
    expect(node1.left.value).toEqual(obj2)

    node1.removeChild(node2)

    expect(node1.value).toEqual(obj1)
    expect(node2.value).toEqual(obj2)
    expect(node1.left).toBeNull()

    expect(node1.toString()).toBe('object_1')
    expect(node2.toString()).toBe('[object Object]')
  })

  it('должен добавить дополнительную информацию в узлы', () => {
    const redNode = new BinaryTreeNode(1)
    const blackNode = new BinaryTreeNode(2)

    redNode.meta.set('color', 'red')
    blackNode.meta.set('color', 'black')

    expect(redNode.meta.get('color')).toBe('red')
    expect(blackNode.meta.get('color')).toBe('black')
  })

  it('должен найти правильного дядю', () => {
    const grandParent = new BinaryTreeNode('grand-parent')
    const parent = new BinaryTreeNode('parent')
    const uncle = new BinaryTreeNode('uncle')
    const child = new BinaryTreeNode('child')

    expect(grandParent.uncle).toBeNull()
    expect(parent.uncle).toBeNull()

    grandParent.setLeft(parent)

    expect(parent.uncle).toBeNull()
    expect(child.uncle).toBeNull()

    parent.setLeft(child)

    expect(child.uncle).toBeNull()

    grandParent.setRight(uncle)

    expect(parent.uncle).toBeNull()
    expect(child.uncle).toBeDefined()
    expect(child.uncle).toEqual(uncle)
  })

  it('должен найти левого дядю', () => {
    const grandParent = new BinaryTreeNode('grand-parent')
    const parent = new BinaryTreeNode('parent')
    const uncle = new BinaryTreeNode('uncle')
    const child = new BinaryTreeNode('child')

    expect(grandParent.uncle).toBeNull()
    expect(parent.uncle).toBeNull()

    grandParent.setRight(parent)

    expect(parent.uncle).toBeNull()
    expect(child.uncle).toBeNull()

    parent.setRight(child)

    expect(child.uncle).toBeNull()

    grandParent.setLeft(uncle)

    expect(parent.uncle).toBeNull()
    expect(child.uncle).toBeDefined()
    expect(child.uncle).toEqual(uncle)
  })

  it('должен установить значения узла', () => {
    const node = new BinaryTreeNode('initial_value')

    expect(node.value).toBe('initial_value')

    node.setValue('new_value')

    expect(node.value).toBe('new_value')
  })

  it('должен копировать узел', () => {
    const root = new BinaryTreeNode('root')
    const left = new BinaryTreeNode('left')
    const right = new BinaryTreeNode('right')

    root.setLeft(left).setRight(right)

    expect(root.toString()).toBe('left,root,right')

    const newRoot = new BinaryTreeNode('new_root')
    const newLeft = new BinaryTreeNode('new_left')
    const newRight = new BinaryTreeNode('new_right')

    newRoot.setLeft(newLeft).setRight(newRight)

    expect(newRoot.toString()).toBe('new_left,new_root,new_right')

    BinaryTreeNode.copyNode(root, newRoot)

    expect(root.toString()).toBe('left,root,right')
    expect(newRoot.toString()).toBe('left,root,right')
  })
})
```

</details>

Запускаем тесты:

```bash
npm run test ./data-structures/tree/__tests__/binary-tree-node.test.js
```

<img src="https://habrastorage.org/webt/8g/f6/re/8gf6revmahydv9lnsu0w3ksxfbk.png" />
<br />

Приступаем к реализации узла двоичного дерева поиска:

```javascript
// data-structures/tree/binary-search-tree.js
import BinaryTreeNode from './binary-tree-node'
import Comparator from '../../utils/comparator'

export class BinarySearchTreeNode extends BinaryTreeNode {
  constructor(value = null, fn) {
    super(value)

    this.compareFn = fn
    this.nodeValueComparator = new Comparator(fn)
  }
}
```

Метод добавления значения (узла):

```javascript
// Добавляет значение (узел)
insert(value) {
  // Если значение отсутствует
  if (this.nodeValueComparator.equal(this.value, null)) {
    this.value = value

    return this
  }

  // Если новое значение меньше текущего
  if (this.nodeValueComparator.lessThan(value, this.value)) {
    // Если имеется левый потомок,
    if (this.left) {
      // добавляем значение в него
      return this.left.insert(value)
    }

    // Создаем новый узел
    const newNode = new BinarySearchTreeNode(value, this.compareFn)
    // и делаем его левым потомком
    this.setLeft(newNode)

    return newNode
  }

  // Если новое значение больше текущего
  if (this.nodeValueComparator.greaterThan(value, this.value)) {
    // Если имеется правый потомок,
    if (this.right) {
      // добавляем значение в него
      return this.right.insert(value)
    }

    // Создаем новый узел
    const newNode = new BinarySearchTreeNode(value, this.compareFn)
    // и делаем его правым потомком
    this.setRight(newNode)

    return newNode
  }

  return this
}
```

Метод удаления узла по значению:

```javascript
// Удаляет узел по значению
remove(value) {
  // Ищем удаляемый узел
  const nodeToRemove = this.find(value)

  if (!nodeToRemove) {
    return null
  }

  // Извлекаем предка
  const { parent } = nodeToRemove

  if (!nodeToRemove.left && !nodeToRemove.right) {
    // Узел является листовым, т.е. не имеет потомков
    if (parent) {
      // У узла есть предок. Просто удаляем указатель на этот узел у предка
      parent.removeChild(nodeToRemove)
    } else {
      // У узла нет предка. Обнуляем значение текущего узла
      nodeToRemove.setValue(null)
    }
  } else if (nodeToRemove.left && nodeToRemove.right) {
    // Узел имеет двух потомков.
    // Находим следующее большее значение (минимальное значение в правом поддереве)
    // и заменяем им значение текущего узла
    const nextBiggerNode = nodeToRemove.right.findMin()
    if (!this.nodeComparator.equal(nextBiggerNode, nodeToRemove.right)) {
      this.remove(nextBiggerNode.value)
      nodeToRemove.setValue(nextBiggerNode.value)
    } else {
      // В случае, когда следующее правое значение является следующим большим значением,
      // и этот узел не имеет левого потомка,
      // просто заменяем удаляемый узел правым
      nodeToRemove.setValue(nodeToRemove.right.value)
      nodeToRemove.setRight(nodeToRemove.right.right)
    }
  } else {
    // Узел имеет одного потомка.
    // Делаем этого потомка прямым потомком предка текущего узла
    const childNode = nodeToRemove.left || nodeToRemove.right

    if (parent) {
      parent.replaceChild(nodeToRemove, childNode)
    } else {
      BinaryTreeNode.copyNode(childNode, nodeToRemove)
    }
  }

  // Обнуляем предка удаленного узла
  nodeToRemove.parent = null

  return true
}
```

Методы поиска узла по значению и определения наличия узла в дереве:

```javascript
// Ищет узел по значению
find(value) {
  // Проверяем корень
  if (this.nodeValueComparator.equal(this.value, value)) {
    return this
  }

  if (this.nodeValueComparator.lessThan(value, this.value) && this.left) {
    // Проверяем левое поддерево
    return this.left.find(value)
  }

  if (this.nodeValueComparator.greaterThan(value, this.value) && this.right) {
    // Проверяем правое поддерево
    return this.right.find(value)
  }

  return null
}

// Определяет наличие узла
contains(value) {
  return Boolean(this.find(value))
}
```

Вспомогательный метод поиска минимального значения:

```javascript
// Ищет узел с минимальным значением (нижний левый)
findMin() {
  if (!this.left) {
    return this
  }

  return this.left.findMin()
}
```

<details>
<summary>Тесты</summary>

```javascript
// data-structures/tree/__tests__/binary-search-tree-node.test.js
import { BinarySearchTreeNode } from '../binary-search-tree'

describe('BinarySearchTreeNode', () => {
  it('должен создать узел', () => {
    const bstNode = new BinarySearchTreeNode(2)

    expect(bstNode.value).toBe(2)
    expect(bstNode.left).toBeNull()
    expect(bstNode.right).toBeNull()
  })

  it('должен установить значение узла', () => {
    const bstNode = new BinarySearchTreeNode()
    bstNode.insert(1)

    expect(bstNode.value).toBe(1)
    expect(bstNode.left).toBeNull()
    expect(bstNode.right).toBeNull()
  })

  it('должен добавить узлы в правильном порядке', () => {
    const bstNode = new BinarySearchTreeNode(2)
    const insertedNode1 = bstNode.insert(1)

    expect(insertedNode1.value).toBe(1)
    expect(bstNode.toString()).toBe('1,2')
    expect(bstNode.contains(1)).toBe(true)
    expect(bstNode.contains(3)).toBe(false)

    const insertedNode2 = bstNode.insert(3)

    expect(insertedNode2.value).toBe(3)
    expect(bstNode.toString()).toBe('1,2,3')
    expect(bstNode.contains(3)).toBe(true)
    expect(bstNode.contains(4)).toBe(false)

    bstNode.insert(7)

    expect(bstNode.toString()).toBe('1,2,3,7')
    expect(bstNode.contains(7)).toBe(true)
    expect(bstNode.contains(8)).toBe(false)

    bstNode.insert(4)

    expect(bstNode.toString()).toBe('1,2,3,4,7')
    expect(bstNode.contains(4)).toBe(true)
    expect(bstNode.contains(8)).toBe(false)

    bstNode.insert(6)

    expect(bstNode.toString()).toBe('1,2,3,4,6,7')
    expect(bstNode.contains(6)).toBe(true)
    expect(bstNode.contains(8)).toBe(false)
  })

  it('не должен добавлять дубликаты', () => {
    const bstNode = new BinarySearchTreeNode(2)
    bstNode.insert(1)

    expect(bstNode.toString()).toBe('1,2')
    expect(bstNode.contains(1)).toBe(true)
    expect(bstNode.contains(3)).toBe(false)

    bstNode.insert(1)

    expect(bstNode.toString()).toBe('1,2')
    expect(bstNode.contains(1)).toBe(true)
    expect(bstNode.contains(3)).toBe(false)
  })

  it('должен найти минимальный узел', () => {
    const node = new BinarySearchTreeNode(10)

    node.insert(20)
    node.insert(30)
    node.insert(5)
    node.insert(40)
    node.insert(1)

    expect(node.findMin()).not.toBeNull()
    expect(node.findMin().value).toBe(1)
  })

  it('должен добавить дополнительную информацию к узлам', () => {
    const node = new BinarySearchTreeNode(10)

    node.insert(20)
    const node1 = node.insert(30)
    node.insert(5)
    node.insert(40)
    const node2 = node.insert(1)

    node.meta.set('color', 'red')
    node1.meta.set('color', 'black')
    node2.meta.set('color', 'white')

    expect(node.meta.get('color')).toBe('red')

    expect(node.findMin()).not.toBeNull()
    expect(node.findMin().value).toBe(1)
    expect(node.findMin().meta.get('color')).toBe('white')
    expect(node.find(30).meta.get('color')).toBe('black')
  })

  it('должен найти узлы', () => {
    const node = new BinarySearchTreeNode(10)

    node.insert(20)
    node.insert(30)
    node.insert(5)
    node.insert(40)
    node.insert(1)

    expect(node.find(6)).toBeNull()
    expect(node.find(5)).not.toBeNull()
    expect(node.find(5).value).toBe(5)
  })

  it('должен удалить листовые узлы', () => {
    const bstRootNode = new BinarySearchTreeNode()

    bstRootNode.insert(10)
    bstRootNode.insert(20)
    bstRootNode.insert(5)

    expect(bstRootNode.toString()).toBe('5,10,20')

    const removed1 = bstRootNode.remove(5)
    expect(bstRootNode.toString()).toBe('10,20')
    expect(removed1).toBe(true)

    const removed2 = bstRootNode.remove(20)
    expect(bstRootNode.toString()).toBe('10')
    expect(removed2).toBe(true)
  })

  it('должен удалить узлы с одним потомком', () => {
    const bstRootNode = new BinarySearchTreeNode()

    bstRootNode.insert(10)
    bstRootNode.insert(20)
    bstRootNode.insert(5)
    bstRootNode.insert(30)

    expect(bstRootNode.toString()).toBe('5,10,20,30')

    bstRootNode.remove(20)
    expect(bstRootNode.toString()).toBe('5,10,30')

    bstRootNode.insert(1)
    expect(bstRootNode.toString()).toBe('1,5,10,30')

    bstRootNode.remove(5)
    expect(bstRootNode.toString()).toBe('1,10,30')
  })

  it('должен удалить узлы с двумя потомками', () => {
    const bstRootNode = new BinarySearchTreeNode()

    bstRootNode.insert(10)
    bstRootNode.insert(20)
    bstRootNode.insert(5)
    bstRootNode.insert(30)
    bstRootNode.insert(15)
    bstRootNode.insert(25)

    expect(bstRootNode.toString()).toBe('5,10,15,20,25,30')
    expect(bstRootNode.find(20).left.value).toBe(15)
    expect(bstRootNode.find(20).right.value).toBe(30)

    bstRootNode.remove(20)
    expect(bstRootNode.toString()).toBe('5,10,15,25,30')

    bstRootNode.remove(15)
    expect(bstRootNode.toString()).toBe('5,10,25,30')

    bstRootNode.remove(10)
    expect(bstRootNode.toString()).toBe('5,25,30')
    expect(bstRootNode.value).toBe(25)

    bstRootNode.remove(25)
    expect(bstRootNode.toString()).toBe('5,30')

    bstRootNode.remove(5)
    expect(bstRootNode.toString()).toBe('30')
  })

  it('должен удалить узел без предка', () => {
    const bstRootNode = new BinarySearchTreeNode()
    expect(bstRootNode.toString()).toBe('')

    bstRootNode.insert(1)
    bstRootNode.insert(2)
    expect(bstRootNode.toString()).toBe('1,2')

    bstRootNode.remove(1)
    expect(bstRootNode.toString()).toBe('2')

    bstRootNode.remove(2)
    expect(bstRootNode.toString()).toBe('')
  })

  it('должен удалить несуществующий узел', () => {
    const bstRootNode = new BinarySearchTreeNode()

    bstRootNode.insert(10)
    bstRootNode.insert(20)

    const removedNode = bstRootNode.remove(30)

    expect(removedNode).toBeNull()
  })

  it('должен добавить объекты', () => {
    const nodeValueComparatorCallback = (a, b) => {
      const normalizedA = a || { value: null }
      const normalizedB = b || { value: null }

      if (normalizedA.value === normalizedB.value) {
        return 0
      }

      return normalizedA.value < normalizedB.value ? -1 : 1
    }

    const obj1 = { key: 'obj1', value: 1, toString: () => 'obj1' }
    const obj2 = { key: 'obj2', value: 2, toString: () => 'obj2' }
    const obj3 = { key: 'obj3', value: 3, toString: () => 'obj3' }

    const bstNode = new BinarySearchTreeNode(obj2, nodeValueComparatorCallback)
    bstNode.insert(obj1)

    expect(bstNode.toString()).toBe('obj1,obj2')
    expect(bstNode.contains(obj1)).toBe(true)
    expect(bstNode.contains(obj3)).toBe(false)

    bstNode.insert(obj3)

    expect(bstNode.toString()).toBe('obj1,obj2,obj3')
    expect(bstNode.contains(obj3)).toBe(true)

    expect(bstNode.findMin().value).toEqual(obj1)
  })

  it('должен обнулить предка удаленного узла', () => {
    const rootNode = new BinarySearchTreeNode('foo')
    rootNode.insert('bar')
    const childNode = rootNode.find('bar')
    rootNode.remove('bar')

    expect(childNode.parent).toBeNull()
  })
})
```

</details>

Запускаем тесты:

```bash
npm run test ./data-structures/tree/__tests__/binary-search-tree-node.test.js
```

<img src="https://habrastorage.org/webt/xa/fn/cs/xafncsfzka5l6osen7_-aejs4zq.png" />
<br />

Приступаем к реализации двоичного дерева поиска:

```javascript
// data-structures/tree/binary-search-tree.js
export default class BinarySearchTree {
  constructor(compareFn) {
    // Корневой узел
    this.root = new BinarySearchTreeNode(null, compareFn)
    // Функция сравнения узлов
    this.nodeComparator = this.root.nodeComparator
  }
}
```

Все необходимые методы дерева нами уже реализованы на уровне узла, остались последние штрихи:

```javascript
// Добавляет значение (узел)
insert(value) {
  return this.root.insert(value)
}

// Удаляет узел по значению
remove(value) {
  return this.root.remove(value)
}

// Определяет наличие узла
contains(value) {
  return this.root.contains(value)
}

// Возвращает строковое представление дерева
toString() {
  return this.root.toString()
}
```

<details>
<summary>Полный код узла двоичного дерева поиска и самого дерева</summary>

```javascript
import BinaryTreeNode from './binary-tree-node'
import Comparator from '../../utils/comparator'

export class BinarySearchTreeNode extends BinaryTreeNode {
  constructor(value = null, fn) {
    super(value)

    this.compareFn = fn
    this.nodeValueComparator = new Comparator(fn)
  }

  // Добавляет значение (узел)
  insert(value) {
    // Если значение отсутствует
    if (this.nodeValueComparator.equal(this.value, null)) {
      this.value = value

      return this
    }

    // Если новое значение меньше текущего
    if (this.nodeValueComparator.lessThan(value, this.value)) {
      // Если имеется левый потомок,
      if (this.left) {
        // добавляем значение в него
        return this.left.insert(value)
      }

      // Создаем новый узел
      const newNode = new BinarySearchTreeNode(value, this.compareFn)
      // и делаем его левым потомком
      this.setLeft(newNode)

      return newNode
    }

    // Если новое значение больше текущего
    if (this.nodeValueComparator.greaterThan(value, this.value)) {
      // Если имеется правый потомок,
      if (this.right) {
        // добавляем значение в него
        return this.right.insert(value)
      }

      // Создаем новый узел
      const newNode = new BinarySearchTreeNode(value, this.compareFn)
      // и делаем его правым потомком
      this.setRight(newNode)

      return newNode
    }

    return this
  }

  // Удаляет узел по значению
  remove(value) {
    // Ищем удаляемый узел
    const nodeToRemove = this.find(value)

    if (!nodeToRemove) {
      return null
    }

    // Извлекаем предка
    const { parent } = nodeToRemove

    if (!nodeToRemove.left && !nodeToRemove.right) {
      // Узел является листовым, т.е. не имеет потомков
      if (parent) {
        // У узла есть предок. Просто удаляем указатель на этот узел у предка
        parent.removeChild(nodeToRemove)
      } else {
        // У узла нет предка. Обнуляем значение текущего узла
        nodeToRemove.setValue(null)
      }
    } else if (nodeToRemove.left && nodeToRemove.right) {
      // Узел имеет двух потомков.
      // Находим следующее большее значение (минимальное значение в правом поддереве)
      // и заменяем им значение текущего узла
      const nextBiggerNode = nodeToRemove.right.findMin()
      if (!this.nodeComparator.equal(nextBiggerNode, nodeToRemove.right)) {
        this.remove(nextBiggerNode.value)
        nodeToRemove.setValue(nextBiggerNode.value)
      } else {
        // В случае, когда следующее правое значение является следующим большим значением,
        // и этот узел не имеет левого потомка,
        // просто заменяем удаляемый узел правым
        nodeToRemove.setValue(nodeToRemove.right.value)
        nodeToRemove.setRight(nodeToRemove.right.right)
      }
    } else {
      // Узел имеет одного потомка.
      // Делаем этого потомка прямым потомком предка текущего узла
      const childNode = nodeToRemove.left || nodeToRemove.right

      if (parent) {
        parent.replaceChild(nodeToRemove, childNode)
      } else {
        BinaryTreeNode.copyNode(childNode, nodeToRemove)
      }
    }

    // Обнуляем предка удаленного узла
    nodeToRemove.parent = null

    return true
  }

  // Ищет узел по значению
  find(value) {
    // Проверяем корень
    if (this.nodeValueComparator.equal(this.value, value)) {
      return this
    }

    if (this.nodeValueComparator.lessThan(value, this.value) && this.left) {
      // Проверяем левое поддерево
      return this.left.find(value)
    }

    if (this.nodeValueComparator.greaterThan(value, this.value) && this.right) {
      // Проверяем правое поддерево
      return this.right.find(value)
    }

    return null
  }

  // Определяет наличие узла
  contains(value) {
    return Boolean(this.find(value))
  }

  // Ищет узел с минимальным значением (нижний левый)
  findMin() {
    if (!this.left) {
      return this
    }

    return this.left.findMin()
  }
}

export default class BinarySearchTree {
  constructor(compareFn) {
    // Корневой узел
    this.root = new BinarySearchTreeNode(null, compareFn)
    // Функция сравнения узлов
    this.nodeComparator = this.root.nodeComparator
  }

  // Добавляет значение
  insert(value) {
    return this.root.insert(value)
  }

  // Удаляет узел по значению
  remove(value) {
    return this.root.remove(value)
  }

  // Определяет наличие узла
  contains(value) {
    return this.root.contains(value)
  }

  // Возвращает строковое представление дерева
  toString() {
    return this.root.toString()
  }
}
```

</details>

<details>
<summary>Тесты</summary>

```javascript
// data-structures/tree/__tests__/binary-search-tree.test.js
import BinarySearchTree from '../binary-search-tree'

describe('BinarySearchTree', () => {
  it('должен создать дерево', () => {
    const bst = new BinarySearchTree()

    expect(bst).toBeDefined()
    expect(bst.root).toBeDefined()
    expect(bst.root.value).toBeNull()
    expect(bst.root.left).toBeNull()
    expect(bst.root.right).toBeNull()
  })

  it('должен добавить значения', () => {
    const bst = new BinarySearchTree()

    const insertedNode1 = bst.insert(10)
    const insertedNode2 = bst.insert(20)
    bst.insert(5)

    expect(bst.toString()).toBe('5,10,20')
    expect(insertedNode1.value).toBe(10)
    expect(insertedNode2.value).toBe(20)
  })

  it('должен определить наличие значений', () => {
    const bst = new BinarySearchTree()

    bst.insert(10)
    bst.insert(20)
    bst.insert(5)

    expect(bst.contains(20)).toBe(true)
    expect(bst.contains(40)).toBe(false)
  })

  it('должен удалить узлы', () => {
    const bst = new BinarySearchTree()

    bst.insert(10)
    bst.insert(20)
    bst.insert(5)

    expect(bst.toString()).toBe('5,10,20')

    const removed1 = bst.remove(5)
    expect(bst.toString()).toBe('10,20')
    expect(removed1).toBe(true)

    const removed2 = bst.remove(20)
    expect(bst.toString()).toBe('10')
    expect(removed2).toBe(true)
  })

  it('должен добавить объекты', () => {
    const nodeValueCompareFunction = (a, b) => {
      const normalizedA = a || { value: null }
      const normalizedB = b || { value: null }

      if (normalizedA.value === normalizedB.value) {
        return 0
      }

      return normalizedA.value < normalizedB.value ? -1 : 1
    }

    const obj1 = { key: 'obj1', value: 1, toString: () => 'obj1' }
    const obj2 = { key: 'obj2', value: 2, toString: () => 'obj2' }
    const obj3 = { key: 'obj3', value: 3, toString: () => 'obj3' }

    const bst = new BinarySearchTree(nodeValueCompareFunction)

    bst.insert(obj2)
    bst.insert(obj3)
    bst.insert(obj1)

    expect(bst.toString()).toBe('obj1,obj2,obj3')
  })

  it('должен обойти дерево и вернуть отсортированный массив', () => {
    const bst = new BinarySearchTree()

    bst.insert(10)
    bst.insert(-10)
    bst.insert(20)
    bst.insert(-20)
    bst.insert(25)
    bst.insert(6)

    expect(bst.toString()).toBe('-20,-10,6,10,20,25')
    expect(bst.root.height).toBe(2)

    bst.insert(4)

    expect(bst.toString()).toBe('-20,-10,4,6,10,20,25')
    expect(bst.root.height).toBe(3)
  })
})
```

</details>

Запускаем тесты:

```bash
npm run test ./data-structures/tree/__tests__/binary-search-tree.test.js
```

<img src="https://habrastorage.org/webt/-4/a9/rc/-4a9rcmsshsmnwjvl5w6ijsgzrw.png" />

## АВЛ-дерево

__Описание__

- [Википедия](https://ru.wikipedia.org/wiki/%D0%90%D0%92%D0%9B-%D0%B4%D0%B5%D1%80%D0%B5%D0%B2%D0%BE)
- [YouTube](https://www.youtube.com/watch?v=DB1HFCEdLxA)

АВЛ-дерево (AVL tree) - это сбалансированное по высоте двоичное дерево поиска. Для каждой вершины такого дерева высота двух ее поддеревьев не должна различаться более чем на 1. В противном случае, выполняется балансировка дерева путем одного или нескольких поворотов (вращений) смежных узлов.

<img src="https://habrastorage.org/webt/l5/om/48/l5om486fusvq7o8dy4rl2spw6v0.gif" />
<br />

_Анимация добавления нескольких элементов в АВЛ-дерево. Здесь мы наблюдаем левый, правый, правый-левый, левый-правый и правый повороты._

<img src="https://habrastorage.org/webt/4k/tx/jb/4ktxjbjjmrje-2lx6u2vo5zmzwo.png" />
<br />

_Сбалансированное АВЛ-дерево с факторами баланса (разность между высотой левого и правого поддеревьев)._

__Вращения (повороты) дерева__

<img src="https://habrastorage.org/webt/y0/xu/cl/y0xuclok4has_hjbyxaxphopyn8.jpeg" />
<img src="https://habrastorage.org/webt/y8/et/lv/y8etlvr0er1dtttao3uvocjumii.png" />
<br />

_Левое вращение._

<img src="https://habrastorage.org/webt/ov/aj/n0/ovajn04ijolefodbbdsihrep_y0.jpeg" />
<img src="https://habrastorage.org/webt/ab/he/h8/abheh8t3of8fvg0_za4o27zauey.png" />
<br />

_Правое вращение._

<img src="https://habrastorage.org/webt/ng/pd/0x/ngpd0xnfp6fffu89qlyj0vf-u2m.jpeg" />
<img src="https://habrastorage.org/webt/7k/fm/tf/7kfmtfrexx2itgz_4gxh0coqp1y.png" />
<br />

_Левое-правое вращение._

<img src="https://habrastorage.org/webt/38/87/qy/3887qy95gorbut0fnzi_t88owwq.jpeg" />
<img src="https://habrastorage.org/webt/a8/yt/si/a8ytsioqvhr314v0h182i1nlp6w.png" />
<br />

_Правое-левое вращение._

Интерактивную визуализации АВЛ-дерева можно посмотреть [здесь](https://www.cs.usfca.edu/~galles/visualization/AVLtree.html).

__Сложность__

_Временная_

| Поиск      | Вставка    | Удаление   |
|------------|------------|------------|
| `O(log n)` | `O(log n)` | `O(log n)` |

_Пространственная_

`O(n)`

__Реализация__

Приступаем к реализации АВЛ-дерева:

```javascript
// data-structures/tree/avl-tree.js
import BinarySearchTree from './binary-search-tree'

// АВЛ-дерево расширяет двоичное дерево поиска
export default class AvlTree extends BinarySearchTree {
}
```

Методы добавления и удаления узлов:

```javascript
// Добавляет значение (узел)
insert(value) {
  // Обычная вставка
  super.insert(value)

  // Поднимаемся к корню, выполняя балансировку дерева
  let currentNode = this.root.find(value)
  while (currentNode) {
    this.balance(currentNode)
    currentNode = currentNode.parent
  }
}

// Удаляет узел по значению
remove(value) {
  // Обычное удаление
  super.remove(value)

  // Балансируем дерево, начиная с корня
  this.balance(this.root)
}
```

Метод балансировки дерева:

```javascript
// Балансирует дерево
balance(node) {
  if (node.balanceFactor > 1) {
    // Левый поворот
    if (node.left.balanceFactor > 0) {
      // Левый-левый поворот
      this.rotateLeftLeft(node)
    } else if (node.left.balanceFactor < 0) {
      // Левый-правый поворот
      this.rotateLeftRight(node)
    }
  } else if (node.balanceFactor < -1) {
    // Правый поворот
    if (node.right.balanceFactor < 0) {
      // Правый-правый поворот
      this.rotateRightRight(node)
    } else if (node.right.balanceFactor > 0) {
      // Правый-левый поворот
      this.rotateRightLeft(node)
    }
  }
}
```

Методы поворотов (вращений):

```javascript
// Выполняет левый-левый поворот
rotateLeftLeft(rootNode) {
  // Удаляем левого потомка
  const leftNode = rootNode.left
  rootNode.setLeft(null)

  // Делаем левый узел потомком предка `rootNode`
  if (rootNode.parent) {
    rootNode.parent.setLeft(leftNode)
  } else if (rootNode === this.root) {
    // Если `rootNode` является корнем, делаем левый узел новым корнем
    this.root = leftNode
  }

  // Если левый узел имеет правого потомка,
  // делаем его левым потомком `rootNode`
  if (leftNode.right) {
    rootNode.setLeft(leftNode.right)
  }

  // Делаем `rootNode` правым потомком левого узла
  leftNode.setRight(rootNode)
}

// Выполняет левый-правый поворот
rotateLeftRight(rootNode) {
  // Удаляем левого потомка
  const leftNode = rootNode.left
  rootNode.setLeft(null)

  // Удаляем правого потомка левого узла
  const leftRightNode = leftNode.right
  leftNode.setRight(null)

  // Сохраняем левое поддерево `leftRightNode`
  if (leftRightNode.left) {
    leftNode.setRight(leftRightNode.left)
    leftRightNode.setLeft(null)
  }

  rootNode.setLeft(leftRightNode)
  leftRightNode.setLeft(leftNode)

  // Выполняем левый-левый поворот
  this.rotateLeftLeft(rootNode)
}

// Выполняет правый-правый поворот
rotateRightRight(rootNode) {
  // Удаляем правого потомка
  const rightNode = rootNode.right
  rootNode.setRight(null)

  // Делаем правый узел потомком предка `rootNode`
  if (rootNode.parent) {
    rootNode.parent.setRight(rightNode)
  } else if (rootNode === this.root) {
    // Если `rootNode` является корнем, делаем правый узел новым корнем
    this.root = rightNode
  }

  // Если правый узел имеет левого потомка,
  // делаем его правым потомком `rootNode`
  if (rightNode.left) {
    rootNode.setRight(rightNode.left)
  }

  // Делаем `rootNode` левым потомком правого узла
  rightNode.setLeft(rootNode)
}

// Выполняет правый-левый поворот
rotateRightLeft(rootNode) {
  // Удаляем правого потомка
  const rightNode = rootNode.right
  rootNode.setRight(null)

  // Удаляем левого потомка правого узла
  const rightLeftNode = rightNode.left
  rightNode.setLeft(null)

  // Сохраняем правое поддерево `rightLeftNode`
  if (rightLeftNode.right) {
    rightNode.setLeft(rightLeftNode.right)
    rightLeftNode.setRight(null)
  }

  rootNode.setRight(rightLeftNode)
  rightLeftNode.setRight(rightNode)

  // Выполняем правый-правый поворот
  this.rotateRightRight(rootNode)
}
```

<details>
<summary>Полный код АВЛ-дерева</summary>

```javascript
import BinarySearchTree from './binary-search-tree'

// АВЛ-дерево расширяет двоичное дерево поиска
export default class AvlTree extends BinarySearchTree {
  // Добавляет значение (узел)
  insert(value) {
    // Обычная вставка
    super.insert(value)

    // Поднимаемся к корню, выполняя балансировку дерева
    let currentNode = this.root.find(value)
    while (currentNode) {
      this.balance(currentNode)
      currentNode = currentNode.parent
    }
  }

  // Удаляет узел по значению
  remove(value) {
    // Обычное удаление
    super.remove(value)

    // Балансируем дерево, начиная с корня
    this.balance(this.root)
  }

  // Балансирует дерево
  balance(node) {
    if (node.balanceFactor > 1) {
      // Левый поворот
      if (node.left.balanceFactor > 0) {
        // Левый-левый поворот
        this.rotateLeftLeft(node)
      } else if (node.left.balanceFactor < 0) {
        // Левый-правый поворот
        this.rotateLeftRight(node)
      }
    } else if (node.balanceFactor < -1) {
      // Правый поворот
      if (node.right.balanceFactor < 0) {
        // Правый-правый поворот
        this.rotateRightRight(node)
      } else if (node.right.balanceFactor > 0) {
        // Правый-левый поворот
        this.rotateRightLeft(node)
      }
    }
  }

  // Выполняет левый-левый поворот
  rotateLeftLeft(rootNode) {
    // Удаляем левого потомка
    const leftNode = rootNode.left
    rootNode.setLeft(null)

    // Делаем левый узел потомком предка `rootNode`
    if (rootNode.parent) {
      rootNode.parent.setLeft(leftNode)
    } else if (rootNode === this.root) {
      // Если `rootNode` является корнем, делаем левый узел новым корнем
      this.root = leftNode
    }

    // Если левый узел имеет правого потомка,
    // делаем его левым потомком `rootNode`
    if (leftNode.right) {
      rootNode.setLeft(leftNode.right)
    }

    // Делаем `rootNode` правым потомком левого узла
    leftNode.setRight(rootNode)
  }

  // Выполняет левый-правый поворот
  rotateLeftRight(rootNode) {
    // Удаляем левого потомка
    const leftNode = rootNode.left
    rootNode.setLeft(null)

    // Удаляем правого потомка левого узла
    const leftRightNode = leftNode.right
    leftNode.setRight(null)

    // Сохраняем левое поддерево `leftRightNode`
    if (leftRightNode.left) {
      leftNode.setRight(leftRightNode.left)
      leftRightNode.setLeft(null)
    }

    rootNode.setLeft(leftRightNode)
    leftRightNode.setLeft(leftNode)

    // Выполняем левый-левый поворот
    this.rotateLeftLeft(rootNode)
  }

  // Выполняет правый-правый поворот
  rotateRightRight(rootNode) {
    // Удаляем правого потомка
    const rightNode = rootNode.right
    rootNode.setRight(null)

    // Делаем правый узел потомком предка `rootNode`
    if (rootNode.parent) {
      rootNode.parent.setRight(rightNode)
    } else if (rootNode === this.root) {
      // Если `rootNode` является корнем, делаем правый узел новым корнем
      this.root = rightNode
    }

    // Если правый узел имеет левого потомка,
    // делаем его правым потомком `rootNode`
    if (rightNode.left) {
      rootNode.setRight(rightNode.left)
    }

    // Делаем `rootNode` левым потомком правого узла
    rightNode.setLeft(rootNode)
  }

  // Выполняет правый-левый поворот
  rotateRightLeft(rootNode) {
    // Удаляем правого потомка
    const rightNode = rootNode.right
    rootNode.setRight(null)

    // Удаляем левого потомка правого узла
    const rightLeftNode = rightNode.left
    rightNode.setLeft(null)

    // Сохраняем правое поддерево `rightLeftNode`
    if (rightLeftNode.right) {
      rightNode.setLeft(rightLeftNode.right)
      rightLeftNode.setRight(null)
    }

    rootNode.setRight(rightLeftNode)
    rightLeftNode.setRight(rightNode)

    // Выполняем правый-правый поворот
    this.rotateRightRight(rootNode)
  }
}
```

</details>

<details>
<summary>Тесты</summary>

```javascript
// data-structures/tree/__tests__/avl-tree.test.js
import AvlTree from '../avl-tree'

describe('AvlTree', () => {
  it('должен выполнить простой левый-левый поворот', () => {
    const tree = new AvlTree()

    tree.insert(4)
    tree.insert(3)
    tree.insert(2)

    expect(tree.toString()).toBe('2,3,4')
    expect(tree.root.value).toBe(3)
    expect(tree.root.height).toBe(1)

    tree.insert(1)

    expect(tree.toString()).toBe('1,2,3,4')
    expect(tree.root.value).toBe(3)
    expect(tree.root.height).toBe(2)

    tree.insert(0)

    expect(tree.toString()).toBe('0,1,2,3,4')
    expect(tree.root.value).toBe(3)
    expect(tree.root.left.value).toBe(1)
    expect(tree.root.height).toBe(2)
  })

  it('должен выполнить сложный левый-левый поворот', () => {
    const tree = new AvlTree()

    tree.insert(30)
    tree.insert(20)
    tree.insert(40)
    tree.insert(10)

    expect(tree.root.value).toBe(30)
    expect(tree.root.height).toBe(2)
    expect(tree.toString()).toBe('10,20,30,40')

    tree.insert(25)
    expect(tree.root.value).toBe(30)
    expect(tree.root.height).toBe(2)
    expect(tree.toString()).toBe('10,20,25,30,40')

    tree.insert(5)
    expect(tree.root.value).toBe(20)
    expect(tree.root.height).toBe(2)
    expect(tree.toString()).toBe('5,10,20,25,30,40')
  })

  it('должен выполнить простой правый-правый поворот', () => {
    const tree = new AvlTree()

    tree.insert(2)
    tree.insert(3)
    tree.insert(4)

    expect(tree.toString()).toBe('2,3,4')
    expect(tree.root.value).toBe(3)
    expect(tree.root.height).toBe(1)

    tree.insert(5)

    expect(tree.toString()).toBe('2,3,4,5')
    expect(tree.root.value).toBe(3)
    expect(tree.root.height).toBe(2)

    tree.insert(6)

    expect(tree.toString()).toBe('2,3,4,5,6')
    expect(tree.root.value).toBe(3)
    expect(tree.root.right.value).toBe(5)
    expect(tree.root.height).toBe(2)
  })

  it('должен выполнить сложный правый-правый поворот', () => {
    const tree = new AvlTree()

    tree.insert(30)
    tree.insert(20)
    tree.insert(40)
    tree.insert(50)

    expect(tree.root.value).toBe(30)
    expect(tree.root.height).toBe(2)
    expect(tree.toString()).toBe('20,30,40,50')

    tree.insert(35)
    expect(tree.root.value).toBe(30)
    expect(tree.root.height).toBe(2)
    expect(tree.toString()).toBe('20,30,35,40,50')

    tree.insert(55)
    expect(tree.root.value).toBe(40)
    expect(tree.root.height).toBe(2)
    expect(tree.toString()).toBe('20,30,35,40,50,55')
  })

  it('должен выполнить левый-правый поворот', () => {
    const tree = new AvlTree()

    tree.insert(30)
    tree.insert(20)
    tree.insert(25)

    expect(tree.root.height).toBe(1)
    expect(tree.root.value).toBe(25)
    expect(tree.toString()).toBe('20,25,30')
  })

  it('должен выполнить правый-левый поворот', () => {
    const tree = new AvlTree()

    tree.insert(30)
    tree.insert(40)
    tree.insert(35)

    expect(tree.root.height).toBe(1)
    expect(tree.root.value).toBe(35)
    expect(tree.toString()).toBe('30,35,40')
  })

  it('должен создать сбалансированное дерево: кейс #1', () => {
    // @see: https://www.youtube.com/watch?v=rbg7Qf8GkQ4&t=839s
    const tree = new AvlTree()

    tree.insert(1)
    tree.insert(2)
    tree.insert(3)

    expect(tree.root.value).toBe(2)
    expect(tree.root.height).toBe(1)
    expect(tree.toString()).toBe('1,2,3')

    tree.insert(6)

    expect(tree.root.value).toBe(2)
    expect(tree.root.height).toBe(2)
    expect(tree.toString()).toBe('1,2,3,6')

    tree.insert(15)

    expect(tree.root.value).toBe(2)
    expect(tree.root.height).toBe(2)
    expect(tree.toString()).toBe('1,2,3,6,15')

    tree.insert(-2)

    expect(tree.root.value).toBe(2)
    expect(tree.root.height).toBe(2)
    expect(tree.toString()).toBe('-2,1,2,3,6,15')

    tree.insert(-5)

    expect(tree.root.value).toBe(2)
    expect(tree.root.height).toBe(2)
    expect(tree.toString()).toBe('-5,-2,1,2,3,6,15')

    tree.insert(-8)

    expect(tree.root.value).toBe(2)
    expect(tree.root.height).toBe(3)
    expect(tree.toString()).toBe('-8,-5,-2,1,2,3,6,15')
  })

  it('должен создать сбалансированное дерево: кейс #2', () => {
    // @see https://www.youtube.com/watch?v=7m94k2Qhg68
    const tree = new AvlTree()

    tree.insert(43)
    tree.insert(18)
    tree.insert(22)
    tree.insert(9)
    tree.insert(21)
    tree.insert(6)

    expect(tree.root.value).toBe(18)
    expect(tree.root.height).toBe(2)
    expect(tree.toString()).toBe('6,9,18,21,22,43')

    tree.insert(8)

    expect(tree.root.value).toBe(18)
    expect(tree.root.height).toBe(2)
    expect(tree.toString()).toBe('6,8,9,18,21,22,43')
  })

  it('должен выполнить левый-правый поворот с сохранением левого поддерева: кейс #1', () => {
    const tree = new AvlTree()

    tree.insert(30)
    tree.insert(15)
    tree.insert(40)
    tree.insert(10)
    tree.insert(18)
    tree.insert(35)
    tree.insert(45)
    tree.insert(5)
    tree.insert(12)

    expect(tree.toString()).toBe('5,10,12,15,18,30,35,40,45')
    expect(tree.root.height).toBe(3)

    tree.insert(11)

    expect(tree.toString()).toBe('5,10,11,12,15,18,30,35,40,45')
    expect(tree.root.height).toBe(3)
  })

  it('должен выполнить левый-правый поворот с сохранением левого поддерева: кейс #2', () => {
    const tree = new AvlTree()

    tree.insert(30)
    tree.insert(15)
    tree.insert(40)
    tree.insert(10)
    tree.insert(18)
    tree.insert(35)
    tree.insert(45)
    tree.insert(42)
    tree.insert(47)

    expect(tree.toString()).toBe('10,15,18,30,35,40,42,45,47')
    expect(tree.root.height).toBe(3)

    tree.insert(43)

    expect(tree.toString()).toBe('10,15,18,30,35,40,42,43,45,47')
    expect(tree.root.height).toBe(3)
  })

  it('должен удалить значения из дерева с правым-правым поворотом', () => {
    const tree = new AvlTree()

    tree.insert(10)
    tree.insert(20)
    tree.insert(30)
    tree.insert(40)

    expect(tree.toString()).toBe('10,20,30,40')

    tree.remove(10)

    expect(tree.toString()).toBe('20,30,40')
    expect(tree.root.value).toBe(30)
    expect(tree.root.left.value).toBe(20)
    expect(tree.root.right.value).toBe(40)
    expect(tree.root.balanceFactor).toBe(0)
  })

  it('должен удалить значения из дерева с левым-левым поворотом', () => {
    const tree = new AvlTree()

    tree.insert(10)
    tree.insert(20)
    tree.insert(30)
    tree.insert(5)

    expect(tree.toString()).toBe('5,10,20,30')

    tree.remove(30)

    expect(tree.toString()).toBe('5,10,20')
    expect(tree.root.value).toBe(10)
    expect(tree.root.left.value).toBe(5)
    expect(tree.root.right.value).toBe(20)
    expect(tree.root.balanceFactor).toBe(0)
  })

  it('должен выполнять балансировку дерева после удаления значений', () => {
    const tree = new AvlTree()

    tree.insert(1)
    tree.insert(2)
    tree.insert(3)
    tree.insert(4)
    tree.insert(5)
    tree.insert(6)
    tree.insert(7)
    tree.insert(8)
    tree.insert(9)

    expect(tree.toString()).toBe('1,2,3,4,5,6,7,8,9')
    expect(tree.root.value).toBe(4)
    expect(tree.root.height).toBe(3)
    expect(tree.root.balanceFactor).toBe(-1)

    tree.remove(8)

    expect(tree.root.value).toBe(4)
    expect(tree.root.balanceFactor).toBe(-1)

    tree.remove(9)

    expect(tree.contains(8)).toBeFalsy()
    expect(tree.contains(9)).toBeFalsy()
    expect(tree.toString()).toBe('1,2,3,4,5,6,7')
    expect(tree.root.value).toBe(4)
    expect(tree.root.height).toBe(2)
    expect(tree.root.balanceFactor).toBe(0)
  })
})
```

</details>

Запускаем тесты:

```bash
npm run test ./data-structures/tree/__tests__/avl-tree.test.js
```

<img src="https://habrastorage.org/webt/np/_y/wg/np_ywgfp7-clhaojn8z8qs9fdos.png" />

## Красно-черное дерево

__Описание__

- [Википедия](https://ru.wikipedia.org/wiki/%D0%9A%D1%80%D0%B0%D1%81%D0%BD%D0%BE-%D1%87%D1%91%D1%80%D0%BD%D0%BE%D0%B5_%D0%B4%D0%B5%D1%80%D0%B5%D0%B2%D0%BE)
- [YouTube](https://www.youtube.com/watch?v=qvZGUFHWChY)

Красно-черное дерево (red-black tree) (КЧД) - это один из видов самобалансирующихся двоичных деревьев поиска. Каждый узел дерева содержит дополнительный бит информации, который часто интерпретируется как цвет (красный или черный) узла. Эти цветовые биты используются для обеспечения относительной сбалансированности дерева при вставке и удалении узлов.

Баланс дерева достигается за счет окрашивания узлов в один их двух цветов способом, который удовлетворяет определенным условиям. Эти условия ограничивают то, насколько несбалансированным может быть дерево (в худшем случае). При модификации дерева, оно перестраивается и перекрашивается для восстановления необходимых свойств. Свойства определены таким образом, чтобы перестановка и перекраска могли выполняться эффективно.

<img src="https://habrastorage.org/webt/jz/xi/xn/jzxixnr2o7zynxrhzhbaeiegvha.png" />
<br />

__Свойства дерева__

В дополнение к требованиям к двоичному дереву поиска, КЧД должно соответствовать следующим критериям:

- каждый узел либо красный, либо черный
- корневой узел черный. Это правило иногда опускается. Поскольку корень всегда может быть перекрашен из красного в черный, но необязательно обратно, это правило слабо влияет на работу дерева
- все листовые узлы (NIL) черные
- если узел красный, оба его потомка черные
- любой путь от определенного узла к любому потомку NIL содержит одинаковое количество черных узлов

> Количество черных узлов всех путей от корня к листьям называется черной высотой КЧД.

Эти ограничения обеспечивают критически важное свойство КЧД: путь от корня к самому далекому листу не более, чем в 2 раза длиннее пути от корня к ближайшему листу. Результатом является примерная сбалансированность дерева. Поскольку операции вставки, удаления и поиска узла в КЧД занимают время, пропорциональное высоте дерева (в худшем случае), они являются более эффективными, чем аналогичные операции в обычном двоичном дереве поиска (опять же в худшем случае).

__Балансировка дерева в процессе вставки узлов__

_Если дядя красный_

<img src="https://habrastorage.org/webt/ds/xr/rs/dsxrrspcwk29tlzebmjh-ngeqa0.png" />
<br />

_Если дядя черный_

- левый-левый случай (`p` - левый потомок `g`, `x` - левый потомок `p`)
- правый-левый случай (`p` - левый потомок `g`, `x` - правый потомок `p`)
- правый-правый случай (`p` - правый потомок `g`, `x` - правый потомок `p`)
- правый-левый случай (`p` - правый потомок `g`, `x` - левый потомок `p`)

Левый-левый случай

<img src="https://habrastorage.org/webt/ds/3h/8v/ds3h8vhn4prtbizf2tgq3wrfjfi.png" />
<br />

Левый-правый случай

<img src="https://habrastorage.org/webt/sq/4h/d5/sq4hd5k6mawr6buvlfpv0yg6xwy.png" />
<br />

Правый-правый случай

<img src="https://habrastorage.org/webt/k0/9k/ov/k09kovb8hmfuqwu2xu3jhsyniso.png" />
<br />

Правый-левый случай

<img src="https://habrastorage.org/webt/ot/ym/wb/otymwbufk23ybwgfk0a2bc3t72u.png" />
<br />

Интерактивную визуализации КЧД можно посмотреть [здесь](https://www.cs.usfca.edu/~galles/visualization/RedBlack.html).

__Сложность__

_Временная_

| Поиск      | Вставка    | Удаление   |
|------------|------------|------------|
| `O(log n)` | `O(log n)` | `O(log n)` |

_Пространственная_

`O(n)`

__Реализация__

В рамках статьи мы реализуем только вставку новых узлов и балансировку дерева. В конце раздела будет приведена ссылка на более полную реализацию КЧД.

Приступаем к реализации:

```javascript
// data-structures/tree/red-black-tree.js
import BinarySearchTree from './binary-search-tree'

// Цвета
const COLORS = {
  red: 'red',
  black: 'black',
}

// Название поля, в котором хранится цвет
const PROP = 'color'

// Красно-черное дерево расширяет двоичное дерево поиска
export default class RedBlackTree extends BinarySearchTree {
}
```

Метод вставки значения (узла):

```javascript
// Вставляет значение (узел)
insert(value) {
  // Обычная вставка
  const insertedNode = super.insert(value)

  // Если добавляется корень,
  // if (!this.root.left && !this.root.right) {
  if (this.nodeComparator.equal(this.root, insertedNode)) {
    // делаем его черным
    this.makeNodeBlack(insertedNode)
  } else {
    // Делаем новый узел красным
    this.makeNodeRed(insertedNode)
  }

  // Выполняем балансировку дерева
  this.balance(insertedNode)

  // Возвращаем добавленный узел
  return insertedNode
}
```

Метод балансировки дерева:

```javascript
// Выполняет балансировку дерева
balance(node) {
  // В случае корневого узла балансировать нечего
  if (this.nodeComparator.equal(this.root, node)) return

  // В случае черного предка балансировать нечего
  if (this.isNodeBlack(node.parent)) return

  const grandParent = node.parent.parent

  // Если у узла есть красный дядя, то нужно выполнить перекрашивание
  if (node.uncle && this.isNodeRed(node.uncle)) {
    // Перекрашиваем предка и дядю в черный
    this.makeNodeBlack(node.parent)
    this.makeNodeBlack(node.uncle)

    if (!this.nodeComparator.equal(this.root, grandParent)) {
      // Перекрашиваем дедушку в красный, если он не является корнем
      this.makeNodeRed(grandParent)
    } else {
      // Если дедушка - черный корень, ничего не делаем,
      // поскольку корень уже имеет двух черных потоков,
      // которых мы только что перекрасили
      return
    }

    // Выполняем балансировку для перекрашенного дедушки
    this.balance(grandParent)
    // Если дядя узла черный или отсутствует, нужно выполнить повороты
  } else if (!node.uncle || this.isNodeBlack(node.uncle)) {
    if (grandParent) {
      // Дедушка, которого мы получим после вращений
      let newGrandParent

      if (this.nodeComparator.equal(node.parent, grandParent.left)) {
        // Левый поворот
        if (this.nodeComparator.equal(node, grandParent.left.left)) {
          // Левый-левый поворот
          newGrandParent = this.leftLeftRotation(grandParent)
        } else {
          // Левый-правый поворот
          newGrandParent = this.leftRightRotation(grandParent)
        }
      } else {
        // Правый поворот
        if (this.nodeComparator.equal(node, grandParent.right.right)) {
          // Правый-правый поворот
          newGrandParent = this.rightRightRotation(grandParent)
        } else {
          // Правый-левый поворот
          newGrandParent = this.rightLeftRotation(grandParent)
        }
      }

      // Если `newGrandParent` не имеет предка, делаем его корнем
      // и красим в черный
      if (newGrandParent && !newGrandParent.parent) {
        this.root = newGrandParent
        this.makeNodeBlack(this.root)
      }

      // Выполняем балансировку для нового дедушки
      this.balance(newGrandParent)
    }
  }
}
```

Методы вращений (поворотов):

```javascript
// Выполняет левый-левый поворот
leftLeftRotation(grandParentNode) {
  // Сохраняем предка дедушки
  const grandGrandParent = grandParentNode.parent

  // Определяем тип дедушки (левый или правый)
  let grandParentNodeIsLeft
  if (grandGrandParent) {
    grandParentNodeIsLeft = this.nodeComparator.equal(
      grandGrandParent.left,
      grandParentNode,
    )
  }

  // Сохраняем левого потомка дедушки
  const parentNode = grandParentNode.left

  // Сохраняем правого потомка предка
  const parentRightNode = parentNode.right

  // Делаем дедушку правым потомком предка
  parentNode.setRight(grandParentNode)

  // Делаем правого потомка предка левым потомком дедушки
  grandParentNode.setLeft(parentRightNode)

  // Заменяем дедушку предком
  if (grandGrandParent) {
    if (grandParentNodeIsLeft) {
      grandGrandParent.setLeft(parentNode)
    } else {
      grandGrandParent.setRight(parentNode)
    }
  } else {
    // Делаем предка корнем
    parentNode.parent = null
  }

  // Перекрашиваем дедушку и предка
  this.swapNodeColors(parentNode, grandParentNode)

  // Возвращаем новый корень
  return parentNode
}

// Выполняет левый-правый поворот
leftRightRotation(grandParentNode) {
  // Сохраняем левый и левый правый узлы
  const parentNode = grandParentNode.left
  const childNode = parentNode.right

  // Сохраняем левый узел потомка во избежание потери
  // левого поддерева. Позже он будет перемещен в
  // правое поддерево предка
  const childLeftNode = childNode.left

  // Делаем предка левым узлом потомка
  childNode.setLeft(parentNode)

  // Делаем левый узел потомка правым узлом предка
  parentNode.setRight(childLeftNode)

  // Помещаем левый правый узел на место левого
  grandParentNode.setLeft(childNode)

  // Выполняем левый-левый поворот
  return this.leftLeftRotation(grandParentNode)
}

// Выполняет правый-правый поворот
rightRightRotation(grandParentNode) {
  // Сохраняем предка дедушки
  const grandGrandParent = grandParentNode.parent

  // Определяем тип дедушки (левый или правый)
  let grandParentNodeIsLeft
  if (grandGrandParent) {
    grandParentNodeIsLeft = this.nodeComparator.equal(
      grandGrandParent.left,
      grandParentNode,
    )
  }

  // Сохраняем правого потомка дедушки
  const parentNode = grandParentNode.right

  // Сохраняем левого потомка предка
  const parentLeftNode = parentNode.left

  // Делаем дедушку левым потомком предка
  parentNode.setLeft(grandParentNode)

  // Делаем левого потомка предка правым потомком дедушки
  grandParentNode.setRight(parentLeftNode)

  // Заменяем дедушку предком
  if (grandGrandParent) {
    if (grandParentNodeIsLeft) {
      grandGrandParent.setLeft(parentNode)
    } else {
      grandGrandParent.setRight(parentNode)
    }
  } else {
    // Делаем предка корнем
    parentNode.parent = null
  }

  // Перекрашиваем дедушку и предка
  this.swapNodeColors(parentNode, grandParentNode)

  // Возвращаем новый корень
  return parentNode
}

// Выполняет правый-левый поворот
rightLeftRotation(grandParentNode) {
  // Сохраняем правый и правый левый узлы
  const parentNode = grandParentNode.right
  const childNode = parentNode.left

  // Сохраняем правый узел потомка во избежание потери
  // правого поддерева. Позже он будет перемещен в
  // левое поддерево предка
  const childRightNode = childNode.right

  // Делаем предка правым узлом потомка
  childNode.setRight(parentNode)

  // Делаем правый узел потомка левым узлом предка
  parentNode.setLeft(childRightNode)

  // Помещаем потомка на место предка
  grandParentNode.setRight(childNode)

  // Выполняем правый-правый поворот
  return this.rightRightRotation(grandParentNode)
}
```

Напоследок, реализуем несколько вспомогательных методов:

```javascript
// Делает узел красным
makeNodeRed(node) {
  node.meta.set(PROP, COLORS.red)

  return node
}

// Делает узел черным
makeNodeBlack(node) {
  node.meta.set(PROP, COLORS.black)

  return node
}

// Проверяет, является ли узел красным
isNodeRed(node) {
  return node.meta.get(PROP) === COLORS.red
}

// Проверяет, является ли узел черным
isNodeBlack(node) {
  return node.meta.get(PROP) === COLORS.black
}

// Проверяет, окрашен ли узел
isNodeColored(node) {
  return this.isNodeBlack(node) || this.isNodeRed(node)
}

// Перекрашивает узлы
swapNodeColors(node1, node2) {
  const node1Color = node1.meta.get(PROP)
  const node2Color = node2.meta.get(PROP)

  node1.meta.set(PROP, node2Color)
  node2.meta.set(PROP, node1Color)
}
```

<details>
<summary>Полный код красно-черного дерева</summary>

```javascript
import BinarySearchTree from './binary-search-tree'

// Цвета
const COLORS = {
  red: 'red',
  black: 'black',
}

// Название поля, в котором хранится цвет
const PROP = 'color'

// Красно-черное дерево расширяет двоичное дерево поиска
export default class RedBlackTree extends BinarySearchTree {
  // Вставляет значение (узел)
  insert(value) {
    // Обычная вставка
    const insertedNode = super.insert(value)

    // Если добавляется корень,
    // if (!this.root.left && !this.root.right) {
    if (this.nodeComparator.equal(this.root, insertedNode)) {
      // делаем его черным
      this.makeNodeBlack(insertedNode)
    } else {
      // Делаем новый узел красным
      this.makeNodeRed(insertedNode)
    }

    // Выполняем балансировку дерева
    this.balance(insertedNode)

    // Возвращаем добавленный узел
    return insertedNode
  }

  // Удаляет узел
  remove(value) {
    throw new Error(`Невозможно удалить ${value}. Метод удаления не реализован`)
  }

  // Выполняет балансировку дерева
  balance(node) {
    // В случае корневого узла балансировать нечего
    if (this.nodeComparator.equal(this.root, node)) return

    // В случае черного предка балансировать нечего
    if (this.isNodeBlack(node.parent)) return

    const grandParent = node.parent.parent

    // Если у узла есть красный дядя, то нужно выполнить перекрашивание
    if (node.uncle && this.isNodeRed(node.uncle)) {
      // Перекрашиваем предка и дядю в черный
      this.makeNodeBlack(node.parent)
      this.makeNodeBlack(node.uncle)

      if (!this.nodeComparator.equal(this.root, grandParent)) {
        // Перекрашиваем дедушку в красный, если он не является корнем
        this.makeNodeRed(grandParent)
      } else {
        // Если дедушка - черный корень, ничего не делаем,
        // поскольку корень уже имеет двух черных потоков,
        // которых мы только что перекрасили
        return
      }

      // Выполняем балансировку для перекрашенного дедушки
      this.balance(grandParent)
      // Если дядя узла черный или отсутствует, нужно выполнить повороты
    } else if (!node.uncle || this.isNodeBlack(node.uncle)) {
      if (grandParent) {
        // Дедушка, которого мы получим после вращений
        let newGrandParent

        if (this.nodeComparator.equal(node.parent, grandParent.left)) {
          // Левый поворот
          if (this.nodeComparator.equal(node, grandParent.left.left)) {
            // Левый-левый поворот
            newGrandParent = this.leftLeftRotation(grandParent)
          } else {
            // Левый-правый поворот
            newGrandParent = this.leftRightRotation(grandParent)
          }
        } else {
          // Правый поворот
          if (this.nodeComparator.equal(node, grandParent.right.right)) {
            // Правый-правый поворот
            newGrandParent = this.rightRightRotation(grandParent)
          } else {
            // Правый-левый поворот
            newGrandParent = this.rightLeftRotation(grandParent)
          }
        }

        // Если `newGrandParent` не имеет предка, делаем его корнем
        // и красим в черный
        if (newGrandParent && !newGrandParent.parent) {
          this.root = newGrandParent
          this.makeNodeBlack(this.root)
        }

        // Выполняем балансировку для нового дедушки
        this.balance(newGrandParent)
      }
    }
  }

  // Выполняет левый-левый поворот
  leftLeftRotation(grandParentNode) {
    // Сохраняем предка дедушки
    const grandGrandParent = grandParentNode.parent

    // Определяем тип дедушки (левый или правый)
    let grandParentNodeIsLeft
    if (grandGrandParent) {
      grandParentNodeIsLeft = this.nodeComparator.equal(
        grandGrandParent.left,
        grandParentNode,
      )
    }

    // Сохраняем левого потомка дедушки
    const parentNode = grandParentNode.left

    // Сохраняем правого потомка предка
    const parentRightNode = parentNode.right

    // Делаем дедушку правым потомком предка
    parentNode.setRight(grandParentNode)

    // Делаем правого потомка предка левым потомком дедушки
    grandParentNode.setLeft(parentRightNode)

    // Заменяем дедушку предком
    if (grandGrandParent) {
      if (grandParentNodeIsLeft) {
        grandGrandParent.setLeft(parentNode)
      } else {
        grandGrandParent.setRight(parentNode)
      }
    } else {
      // Делаем предка корнем
      parentNode.parent = null
    }

    // Перекрашиваем дедушку и предка
    this.swapNodeColors(parentNode, grandParentNode)

    // Возвращаем новый корень
    return parentNode
  }

  // Выполняет левый-правый поворот
  leftRightRotation(grandParentNode) {
    // Сохраняем левый и левый правый узлы
    const parentNode = grandParentNode.left
    const childNode = parentNode.right

    // Сохраняем левый узел потомка во избежание потери
    // левого поддерева. Позже он будет перемещен в
    // правое поддерево предка
    const childLeftNode = childNode.left

    // Делаем предка левым узлом потомка
    childNode.setLeft(parentNode)

    // Делаем левый узел потомка правым узлом предка
    parentNode.setRight(childLeftNode)

    // Помещаем левый правый узел на место левого
    grandParentNode.setLeft(childNode)

    // Выполняем левый-левый поворот
    return this.leftLeftRotation(grandParentNode)
  }

  // Выполняет правый-правый поворот
  rightRightRotation(grandParentNode) {
    // Сохраняем предка дедушки
    const grandGrandParent = grandParentNode.parent

    // Определяем тип дедушки (левый или правый)
    let grandParentNodeIsLeft
    if (grandGrandParent) {
      grandParentNodeIsLeft = this.nodeComparator.equal(
        grandGrandParent.left,
        grandParentNode,
      )
    }

    // Сохраняем правого потомка дедушки
    const parentNode = grandParentNode.right

    // Сохраняем левого потомка предка
    const parentLeftNode = parentNode.left

    // Делаем дедушку левым потомком предка
    parentNode.setLeft(grandParentNode)

    // Делаем левого потомка предка правым потомком дедушки
    grandParentNode.setRight(parentLeftNode)

    // Заменяем дедушку предком
    if (grandGrandParent) {
      if (grandParentNodeIsLeft) {
        grandGrandParent.setLeft(parentNode)
      } else {
        grandGrandParent.setRight(parentNode)
      }
    } else {
      // Делаем предка корнем
      parentNode.parent = null
    }

    // Перекрашиваем дедушку и предка
    this.swapNodeColors(parentNode, grandParentNode)

    // Возвращаем новый корень
    return parentNode
  }

  // Выполняет правый-левый поворот
  rightLeftRotation(grandParentNode) {
    // Сохраняем правый и правый левый узлы
    const parentNode = grandParentNode.right
    const childNode = parentNode.left

    // Сохраняем правый узел потомка во избежание потери
    // правого поддерева. Позже он будет перемещен в
    // левое поддерево предка
    const childRightNode = childNode.right

    // Делаем предка правым узлом потомка
    childNode.setRight(parentNode)

    // Делаем правый узел потомка левым узлом предка
    parentNode.setLeft(childRightNode)

    // Помещаем потомка на место предка
    grandParentNode.setRight(childNode)

    // Выполняем правый-правый поворот
    return this.rightRightRotation(grandParentNode)
  }

  // Делает узел красным
  makeNodeRed(node) {
    node.meta.set(PROP, COLORS.red)

    return node
  }

  // Делает узел черным
  makeNodeBlack(node) {
    node.meta.set(PROP, COLORS.black)

    return node
  }

  // Проверяет, является ли узел красным
  isNodeRed(node) {
    return node.meta.get(PROP) === COLORS.red
  }

  // Проверяет, является ли узел черным
  isNodeBlack(node) {
    return node.meta.get(PROP) === COLORS.black
  }

  // Проверяет, покрашен ли узел
  isNodeColored(node) {
    return this.isNodeBlack(node) || this.isNodeRed(node)
  }

  // Перекрашивает узлы
  swapNodeColors(node1, node2) {
    const node1Color = node1.meta.get(PROP)
    const node2Color = node2.meta.get(PROP)

    node1.meta.set(PROP, node2Color)
    node2.meta.set(PROP, node1Color)
  }
}
```

</details>

Более полную реализацию (каноническую, учитывая почти 10 млн установок в неделю) красно-черного дерева можно найти [здесь](https://github.com/mikolalysenko/functional-red-black-tree).

<details>
<summary>Тесты</summary>

```javascript
// data-structures/tree/__tests__/red-black-tree.test.js
import RedBlackTree from '../red-black-tree'

describe('RedBlackTree', () => {
  it('должен покрасить первый узел в черный', () => {
    const tree = new RedBlackTree()

    const firstInsertedNode = tree.insert(10)

    expect(tree.isNodeColored(firstInsertedNode)).toBe(true)
    expect(tree.isNodeBlack(firstInsertedNode)).toBe(true)
    expect(tree.isNodeRed(firstInsertedNode)).toBe(false)

    expect(tree.toString()).toBe('10')
    expect(tree.root.height).toBe(0)
  })

  it('должен окрасить новые листовые узлы в красный', () => {
    const tree = new RedBlackTree()

    const firstInsertedNode = tree.insert(10)
    const secondInsertedNode = tree.insert(15)
    const thirdInsertedNode = tree.insert(5)

    expect(tree.isNodeBlack(firstInsertedNode)).toBe(true)
    expect(tree.isNodeRed(secondInsertedNode)).toBe(true)
    expect(tree.isNodeRed(thirdInsertedNode)).toBe(true)

    expect(tree.toString()).toBe('5,10,15')
    expect(tree.root.height).toBe(1)
  })

  it('должен выполнить балансировку дерева', () => {
    const tree = new RedBlackTree()

    tree.insert(5)
    tree.insert(10)
    tree.insert(15)
    tree.insert(20)
    tree.insert(25)
    tree.insert(30)

    expect(tree.toString()).toBe('5,10,15,20,25,30')
    expect(tree.root.height).toBe(3)
  })

  it('должен выполнить балансировку в случае черного предка', () => {
    const tree = new RedBlackTree()

    const node1 = tree.insert(10)

    expect(tree.isNodeBlack(node1)).toBe(true)

    const node2 = tree.insert(-10)

    expect(tree.isNodeBlack(node1)).toBe(true)
    expect(tree.isNodeRed(node2)).toBe(true)

    const node3 = tree.insert(20)

    expect(tree.isNodeBlack(node1)).toBe(true)
    expect(tree.isNodeRed(node2)).toBe(true)
    expect(tree.isNodeRed(node3)).toBe(true)

    const node4 = tree.insert(-20)

    expect(tree.isNodeBlack(node1)).toBe(true)
    expect(tree.isNodeBlack(node2)).toBe(true)
    expect(tree.isNodeBlack(node3)).toBe(true)
    expect(tree.isNodeRed(node4)).toBe(true)

    const node5 = tree.insert(25)

    expect(tree.isNodeBlack(node1)).toBe(true)
    expect(tree.isNodeBlack(node2)).toBe(true)
    expect(tree.isNodeBlack(node3)).toBe(true)
    expect(tree.isNodeRed(node4)).toBe(true)
    expect(tree.isNodeRed(node5)).toBe(true)

    const node6 = tree.insert(6)

    expect(tree.isNodeBlack(node1)).toBe(true)
    expect(tree.isNodeBlack(node2)).toBe(true)
    expect(tree.isNodeBlack(node3)).toBe(true)
    expect(tree.isNodeRed(node4)).toBe(true)
    expect(tree.isNodeRed(node5)).toBe(true)
    expect(tree.isNodeRed(node6)).toBe(true)

    expect(tree.toString()).toBe('-20,-10,6,10,20,25')
    expect(tree.root.height).toBe(2)

    const node7 = tree.insert(4)

    expect(tree.root.left.value).toEqual(node2.value)

    expect(tree.toString()).toBe('-20,-10,4,6,10,20,25')
    expect(tree.root.height).toBe(3)

    expect(tree.isNodeBlack(node1)).toBe(true)
    expect(tree.isNodeRed(node2)).toBe(true)
    expect(tree.isNodeBlack(node3)).toBe(true)
    expect(tree.isNodeBlack(node4)).toBe(true)
    expect(tree.isNodeBlack(node4)).toBe(true)
    expect(tree.isNodeRed(node5)).toBe(true)
    expect(tree.isNodeBlack(node6)).toBe(true)
    expect(tree.isNodeRed(node7)).toBe(true)
  })

  it('должен выполнить балансировку в случае красного дяди', () => {
    const tree = new RedBlackTree()

    const node1 = tree.insert(10)
    const node2 = tree.insert(-10)
    const node3 = tree.insert(20)
    const node4 = tree.insert(-20)
    const node5 = tree.insert(6)
    const node6 = tree.insert(15)
    const node7 = tree.insert(25)
    const node8 = tree.insert(2)
    const node9 = tree.insert(8)

    expect(tree.toString()).toBe('-20,-10,2,6,8,10,15,20,25')
    expect(tree.root.height).toBe(3)

    expect(tree.isNodeBlack(node1)).toBe(true)
    expect(tree.isNodeRed(node2)).toBe(true)
    expect(tree.isNodeBlack(node3)).toBe(true)
    expect(tree.isNodeBlack(node4)).toBe(true)
    expect(tree.isNodeBlack(node5)).toBe(true)
    expect(tree.isNodeRed(node6)).toBe(true)
    expect(tree.isNodeRed(node7)).toBe(true)
    expect(tree.isNodeRed(node8)).toBe(true)
    expect(tree.isNodeRed(node9)).toBe(true)

    const node10 = tree.insert(4)

    expect(tree.toString()).toBe('-20,-10,2,4,6,8,10,15,20,25')
    expect(tree.root.height).toBe(3)

    expect(tree.root.value).toBe(node5.value)

    expect(tree.isNodeBlack(node5)).toBe(true)
    expect(tree.isNodeRed(node1)).toBe(true)
    expect(tree.isNodeRed(node2)).toBe(true)
    expect(tree.isNodeRed(node10)).toBe(true)
    expect(tree.isNodeRed(node6)).toBe(true)
    expect(tree.isNodeRed(node7)).toBe(true)
    expect(tree.isNodeBlack(node4)).toBe(true)
    expect(tree.isNodeBlack(node8)).toBe(true)
    expect(tree.isNodeBlack(node9)).toBe(true)
    expect(tree.isNodeBlack(node3)).toBe(true)
  })

  it('должен выполнить левый-левый поворот', () => {
    const tree = new RedBlackTree()

    const node1 = tree.insert(10)
    const node2 = tree.insert(-10)
    const node3 = tree.insert(20)
    const node4 = tree.insert(7)
    const node5 = tree.insert(15)

    expect(tree.toString()).toBe('-10,7,10,15,20')
    expect(tree.root.height).toBe(2)

    expect(tree.isNodeBlack(node1)).toBe(true)
    expect(tree.isNodeBlack(node2)).toBe(true)
    expect(tree.isNodeBlack(node3)).toBe(true)
    expect(tree.isNodeRed(node4)).toBe(true)
    expect(tree.isNodeRed(node5)).toBe(true)

    const node6 = tree.insert(13)

    expect(tree.toString()).toBe('-10,7,10,13,15,20')
    expect(tree.root.height).toBe(2)

    expect(tree.isNodeBlack(node1)).toBe(true)
    expect(tree.isNodeBlack(node2)).toBe(true)
    expect(tree.isNodeBlack(node5)).toBe(true)
    expect(tree.isNodeRed(node4)).toBe(true)
    expect(tree.isNodeRed(node6)).toBe(true)
    expect(tree.isNodeRed(node3)).toBe(true)
  })

  it('должен выполнить левый-правый поворот', () => {
    const tree = new RedBlackTree()

    const node1 = tree.insert(10)
    const node2 = tree.insert(-10)
    const node3 = tree.insert(20)
    const node4 = tree.insert(7)
    const node5 = tree.insert(15)

    expect(tree.toString()).toBe('-10,7,10,15,20')
    expect(tree.root.height).toBe(2)

    expect(tree.isNodeBlack(node1)).toBe(true)
    expect(tree.isNodeBlack(node2)).toBe(true)
    expect(tree.isNodeBlack(node3)).toBe(true)
    expect(tree.isNodeRed(node4)).toBe(true)
    expect(tree.isNodeRed(node5)).toBe(true)

    const node6 = tree.insert(17)

    expect(tree.toString()).toBe('-10,7,10,15,17,20')
    expect(tree.root.height).toBe(2)

    expect(tree.isNodeBlack(node1)).toBe(true)
    expect(tree.isNodeBlack(node2)).toBe(true)
    expect(tree.isNodeBlack(node6)).toBe(true)
    expect(tree.isNodeRed(node4)).toBe(true)
    expect(tree.isNodeRed(node5)).toBe(true)
    expect(tree.isNodeRed(node3)).toBe(true)
  })

  it('должен выполнить перекрашивание, левый-левый и левый-правый повороты', () => {
    const tree = new RedBlackTree()

    const node1 = tree.insert(10)
    const node2 = tree.insert(-10)
    const node3 = tree.insert(20)
    const node4 = tree.insert(-20)
    const node5 = tree.insert(6)
    const node6 = tree.insert(15)
    const node7 = tree.insert(30)
    const node8 = tree.insert(1)
    const node9 = tree.insert(9)

    expect(tree.toString()).toBe('-20,-10,1,6,9,10,15,20,30')
    expect(tree.root.height).toBe(3)

    expect(tree.isNodeBlack(node1)).toBe(true)
    expect(tree.isNodeRed(node2)).toBe(true)
    expect(tree.isNodeBlack(node3)).toBe(true)
    expect(tree.isNodeBlack(node4)).toBe(true)
    expect(tree.isNodeBlack(node5)).toBe(true)
    expect(tree.isNodeRed(node6)).toBe(true)
    expect(tree.isNodeRed(node7)).toBe(true)
    expect(tree.isNodeRed(node8)).toBe(true)
    expect(tree.isNodeRed(node9)).toBe(true)

    tree.insert(4)

    expect(tree.toString()).toBe('-20,-10,1,4,6,9,10,15,20,30')
    expect(tree.root.height).toBe(3)
  })

  it('должен выполнить правый-левый поворот', () => {
    const tree = new RedBlackTree()

    const node1 = tree.insert(10)
    const node2 = tree.insert(-10)
    const node3 = tree.insert(20)
    const node4 = tree.insert(-20)
    const node5 = tree.insert(6)
    const node6 = tree.insert(30)

    expect(tree.toString()).toBe('-20,-10,6,10,20,30')
    expect(tree.root.height).toBe(2)

    expect(tree.isNodeBlack(node1)).toBe(true)
    expect(tree.isNodeBlack(node2)).toBe(true)
    expect(tree.isNodeBlack(node3)).toBe(true)
    expect(tree.isNodeRed(node4)).toBe(true)
    expect(tree.isNodeRed(node5)).toBe(true)
    expect(tree.isNodeRed(node6)).toBe(true)

    const node7 = tree.insert(25)

    const rightNode = tree.root.right
    const rightLeftNode = rightNode.left
    const rightRightNode = rightNode.right

    expect(rightNode.value).toBe(node7.value)
    expect(rightLeftNode.value).toBe(node3.value)
    expect(rightRightNode.value).toBe(node6.value)

    expect(tree.toString()).toBe('-20,-10,6,10,20,25,30')
    expect(tree.root.height).toBe(2)

    expect(tree.isNodeBlack(node1)).toBe(true)
    expect(tree.isNodeBlack(node2)).toBe(true)
    expect(tree.isNodeBlack(node7)).toBe(true)
    expect(tree.isNodeRed(node4)).toBe(true)
    expect(tree.isNodeRed(node5)).toBe(true)
    expect(tree.isNodeRed(node3)).toBe(true)
    expect(tree.isNodeRed(node6)).toBe(true)
  })

  it('должен выполнить левый-левый поворот с левым дедушкой', () => {
    const tree = new RedBlackTree()

    tree.insert(20)
    tree.insert(15)
    tree.insert(25)
    tree.insert(10)
    tree.insert(5)

    expect(tree.toString()).toBe('5,10,15,20,25')
    expect(tree.root.height).toBe(2)
  })

  it('должен выполнить правый-правый поворот с левым дедушкой', () => {
    const tree = new RedBlackTree()

    tree.insert(20)
    tree.insert(15)
    tree.insert(25)
    tree.insert(17)
    tree.insert(19)

    expect(tree.toString()).toBe('15,17,19,20,25')
    expect(tree.root.height).toBe(2)
  })

  it('должен выбросить исключение при попытке удалить узел', () => {
    const removeNodeFromRedBlackTree = () => {
      const tree = new RedBlackTree()

      tree.remove(1)
    }

    expect(removeNodeFromRedBlackTree).toThrowError()
  })
})
```

</details>

Запускаем тесты:

```bash
npm run test ./data-structures/tree/__tests__/red-black-tree.test.js
```

<img src="https://habrastorage.org/webt/lj/oa/5y/ljoa5ya9dikiiey10dnthwcff5u.png" />

## Дерево отрезков

__Описание__

- [Википедия](https://ru.wikipedia.org/wiki/%D0%94%D0%B5%D1%80%D0%B5%D0%B2%D0%BE_%D0%BE%D1%82%D1%80%D0%B5%D0%B7%D0%BA%D0%BE%D0%B2)
- [YouTube](https://www.youtube.com/watch?v=LEkEPE_BKQY)

Дерево отрезков (сегментов) (segment tree), также известное как статистическое дерево (statistic tree) - это структура данных, которая используется для хранения информации об отрезках (сегментах, диапазонах). Эта структура данных позволяет запрашивать, какой сегмент содержит определенное значение. По сути, дерево отрезков является статичной структурой данных - ее структура не может меняться после создания.

Дерево отрезков - это двоичное дерево (binary tree, см. часть 3, раздел 9). Корень дерева представляет весь массив. Потомки дерева представляют левую и правую половины массива. Аналогично, потомки каждого узла представляют половины массива, соответствующего узлу.

Дерево строится снизу вверх. Значение предка - это значение минимального потомка (или другое значение в зависимости от переданной функции). Построение дерева занимает время `O(n log n)`. Количество операций - это высота дерева и равняется `O(n log n)`. Для выполнения запросов диапазона (range queries) каждый узел разбивает запрос на две части, по одному подзапросу для каждого потомка. Если запрос содержит весь подмассив узла, мы можем вернуть предварительно вычисленное значение узла. Эта оптимизация позволяет добиться `O(n log n)` операций.

<img src="https://habrastorage.org/webt/gi/i6/uy/gii6uyehmtmmktqk9hlkz8zj0_w.png" />
<br />

<img src="https://habrastorage.org/webt/kw/ah/sd/kwahsdixbt1ir6lu1uvpgaph3ak.png" />
<br />

__Случаи применения__

Дерево отрезков - это структура данных, спроектированная для эффективного выполнения некоторых операций с массивами, особенно, операций, включающих запросы диапазона.

Такие деревья часто применяются в вычислительной геометрии и географических информационных системах.

Наша реализация дерева отрезков будет принимать любую функцию (принимающую два параметра), позволяя выполнять разные запросы диапазона.

Интерактивную визуализацию дерева отрезков можно посмотреть [здесь](https://visualgo.net/en/segmenttree).

__Сложность__

_Временная_

| Поиск       | Запрос диапазона |
|-------------|------------------|
| `O(log(n))` | `O(log(n))`      |

_Пространственная_

`O(n)`

__Реализация__

Начнем с реализации вспомогательной функции определения того, является ли переданное число результатом возведения числа 2 в какую-либо степень:

```javascript
// algorithms/math/is-power-of-two.js
export default function isPowerOfTwo(n) {
  // 1 (2^0) - это наименьший результат возведения числа 2 в какую-либо степень
  if (n < 1) return false

  // Выясняем, можем ли мы разделить переданное число на 2 без остатка
  let _n = n
  while (_n !== 1) {
    // Ненулевой остаток свидетельствует о том,
    // что переданное число не может быть результатом возведения числа 2
    // в какую - либо степень
    if (_n % 2 !== 0) return false
    _n /= 2
  }

  return true
}
```

Напишем тест для этой функции:

```javascript
// algorithms/math/__tests__/is-power-of-two.test.js
import isPowerOfTwo from '../is-power-of-two'

describe('isPowerOfTwo', () => {
  it('должен проверить, является ли переданное число результатом возведения числа 2 в какую-либо степень', () => {
    expect(isPowerOfTwo(-1)).toBe(false)
    expect(isPowerOfTwo(0)).toBe(false)
    expect(isPowerOfTwo(1)).toBe(true)
    expect(isPowerOfTwo(2)).toBe(true)
    expect(isPowerOfTwo(3)).toBe(false)
    expect(isPowerOfTwo(4)).toBe(true)
    expect(isPowerOfTwo(5)).toBe(false)
    expect(isPowerOfTwo(6)).toBe(false)
    expect(isPowerOfTwo(7)).toBe(false)
    expect(isPowerOfTwo(8)).toBe(true)
    expect(isPowerOfTwo(10)).toBe(false)
    expect(isPowerOfTwo(12)).toBe(false)
    expect(isPowerOfTwo(16)).toBe(true)
    expect(isPowerOfTwo(31)).toBe(false)
    expect(isPowerOfTwo(64)).toBe(true)
    expect(isPowerOfTwo(1024)).toBe(true)
    expect(isPowerOfTwo(1023)).toBe(false)
  })
})
```

Запускаем этот тест:

```bash
npm run test ./algorithms/math/__tests__/is-power-of-two
```

<img src="https://habrastorage.org/webt/v6/mp/f2/v6mpf2eclwiht3s28ion_rwa-e0.png" />
<br />

Приступаем к реализации дерева:

```javascript
// data-structures/tree/segment-tree.js
// Функция определения того, является ли переданное число
// результатом возведения числа 2 в какую-либо степень
// (далее - степенью 2)
import isPowerOfTwo from '../../algorithms/math/is-power-of-two'

export default class SegmentTree {
  constructor(arr, fn, fb) {
    this.arr = arr
    // Основная операция
    this.fn = fn
    // Резервная операция
    this.fb = fb
    // Инициализируем представление дерева в виде массива
    this.tree = this.initTree(arr)
    // Строим дерево
    this.buildTree()
  }
}
```

Метод инициализации дерева в виде массива:

```javascript
// Инициализирует представление дерева в виде массива
initTree(arr) {
  let treeLength
  const arrLength = arr.length

  if (isPowerOfTwo(arrLength)) {
    // Если длина массива является степенью 2
    treeLength = arrLength * 2 - 1
  } else {
    // Если длина массива не является степенью 2,
    // нужно найти следующее число, которое является таковым,
    // и использовать его для вычисления длины дерева.
    // Это обусловлено тем, что пустые потомки идеального
    // бинарного дерева должны быть заполнены `null`
    const currentPower = Math.floor(Math.log2(arrLength))
    const nextPower = currentPower + 1
    const nextPowerOfTwoN = 2 ** nextPower

    treeLength = nextPowerOfTwoN * 2 - 1
  }

  return new Array(treeLength).fill(null)
}
```

Метод построения дерева:

```javascript
// Строит дерево
buildTree() {
  const leftIndex = 0
  const rightIndex = this.arr.length - 1
  const position = 0
  // Обращаемся к рекурсии
  this.buildTreeRecursively(leftIndex, rightIndex, position)
}

// Строит дерево рекурсивно
buildTreeRecursively(leftIndex, rightIndex, position) {
  // Если левый и правый индексы совпадают, значит,
  // мы закончили деление пополам и добрались до листового узла.
  // Значение листа нужно копировать из массива в дерево
  if (leftIndex === rightIndex) {
    this.tree[position] = this.arr[leftIndex]
    return
  }

  // Делим массив на две равные части и обрабатываем каждую рекурсивно
  const middleIndex = Math.floor((leftIndex + rightIndex) / 2)
  // Обрабатываем левую половину
  this.buildTreeRecursively(
    leftIndex,
    middleIndex,
    this.getLeftChildIndex(position),
  )
  // Обрабатываем правую половину
  this.buildTreeRecursively(
    middleIndex + 1,
    rightIndex,
    this.getRightChildIndex(position),
  )

  // После заполнения всех листьев,
  // мы можем построить дерево снизу вверх
  // с помощью переданной функции
  this.tree[position] = this.fn(
    this.tree[this.getLeftChildIndex(position)],
    this.tree[this.getRightChildIndex(position)],
  )
}
```

Метод выполнения запроса диапазона:

```javascript
// Выполняет запрос диапазона
rangeQuery(queryLeftIndex, queryRightIndex) {
  const leftIndex = 0
  const rightIndex = this.arr.length - 1
  const position = 0
  // Обращаемся к рекурсии
  return this.rangeQueryRecursively(
    queryLeftIndex,
    queryRightIndex,
    leftIndex,
    rightIndex,
    position,
  )
}

// Выполняет запрос диапазона рекурсивно
rangeQueryRecursively(
  queryLeftIndex,
  queryRightIndex,
  leftIndex,
  rightIndex,
  position,
) {
  if (queryLeftIndex <= leftIndex && queryRightIndex >= rightIndex) {
    // Полное перекрытие
    return this.tree[position]
  }

  if (queryLeftIndex > rightIndex || queryRightIndex < leftIndex) {
    // Перекрытие отсутствует
    return this.fb
  }

  // Частичное перекрытие
  const middleIndex = Math.floor((leftIndex + rightIndex) / 2)
  const leftFnResult = this.rangeQueryRecursively(
    queryLeftIndex,
    queryRightIndex,
    leftIndex,
    middleIndex,
    this.getLeftChildIndex(position),
  )
  const rightFnResult = this.rangeQueryRecursively(
    queryLeftIndex,
    queryRightIndex,
    middleIndex + 1,
    rightIndex,
    this.getRightChildIndex(position),
  )

  // Обрабатываем узлы с помощью переданной функции
  // и возвращаем результат
  return this.fn(leftFnResult, rightFnResult)
}
```

Вспомогательные методы получения индексов потомков:

```javascript
// Возвращает индекс левого потомка
getLeftChildIndex(parentIndex) {
  return parentIndex * 2 + 1
}

// Возвращает индекс правого потомка
getRightChildIndex(parentIndex) {
  return parentIndex * 2 + 2
}
```

<details>
<summary>Полный код дерева отрезков</summary>

```javascript
// Функция определения того, является ли переданное число
// результатом возведения числа 2 в какую-либо степень
// (далее - степенью 2)
import isPowerOfTwo from '../../algorithms/math/is-power-of-two'

export default class SegmentTree {
  constructor(arr, fn, fb) {
    this.arr = arr
    // Основная операция
    this.fn = fn
    // Резервная операция
    this.fb = fb
    // Инициализируем представление дерева в виде массива
    this.tree = this.initTree(arr)
    // Строим дерево
    this.buildTree()
  }

  // Инициализирует представление дерева в виде массива
  initTree(arr) {
    let treeLength
    const arrLength = arr.length

    if (isPowerOfTwo(arrLength)) {
      // Если длина массива является степенью 2
      treeLength = arrLength * 2 - 1
    } else {
      // Если длина массива не является степенью 2,
      // нужно найти следующее число, которое является таковым,
      // и использовать его для вычисления длины дерева.
      // Это обусловлено тем, что пустые потомки идеального
      // бинарного дерева должны быть заполнены `null`
      const currentPower = Math.floor(Math.log2(arrLength))
      const nextPower = currentPower + 1
      const nextPowerOfTwoN = 2 ** nextPower

      treeLength = nextPowerOfTwoN * 2 - 1
    }

    return new Array(treeLength).fill(null)
  }

  // Строит дерево
  buildTree() {
    const leftIndex = 0
    const rightIndex = this.arr.length - 1
    const position = 0
    // Обращаемся к рекурсии
    this.buildTreeRecursively(leftIndex, rightIndex, position)
  }

  // Строит дерево рекурсивно
  buildTreeRecursively(leftIndex, rightIndex, position) {
    // Если левый и правый индексы совпадают, значит,
    // мы закончили деление пополам и добрались до листового узла.
    // Значение листа нужно копировать из массива в дерево
    if (leftIndex === rightIndex) {
      this.tree[position] = this.arr[leftIndex]
      return
    }

    // Делим массив на две равные части и обрабатываем каждую рекурсивно
    const middleIndex = Math.floor((leftIndex + rightIndex) / 2)
    // Обрабатываем левую половину
    this.buildTreeRecursively(
      leftIndex,
      middleIndex,
      this.getLeftChildIndex(position),
    )
    // Обрабатываем правую половину
    this.buildTreeRecursively(
      middleIndex + 1,
      rightIndex,
      this.getRightChildIndex(position),
    )

    // После заполнения всех листьев,
    // мы можем построить дерево снизу вверх
    // с помощью переданной функции
    this.tree[position] = this.fn(
      this.tree[this.getLeftChildIndex(position)],
      this.tree[this.getRightChildIndex(position)],
    )
  }

  // Выполняет запрос диапазона
  rangeQuery(queryLeftIndex, queryRightIndex) {
    const leftIndex = 0
    const rightIndex = this.arr.length - 1
    const position = 0
    // Обращаемся к рекурсии
    return this.rangeQueryRecursively(
      queryLeftIndex,
      queryRightIndex,
      leftIndex,
      rightIndex,
      position,
    )
  }

  // Выполняет запрос диапазона рекурсивно
  rangeQueryRecursively(
    queryLeftIndex,
    queryRightIndex,
    leftIndex,
    rightIndex,
    position,
  ) {
    if (queryLeftIndex <= leftIndex && queryRightIndex >= rightIndex) {
      // Полное перекрытие
      return this.tree[position]
    }

    if (queryLeftIndex > rightIndex || queryRightIndex < leftIndex) {
      // Перекрытие отсутствует
      return this.fb
    }

    // Частичное перекрытие
    const middleIndex = Math.floor((leftIndex + rightIndex) / 2)
    const leftFnResult = this.rangeQueryRecursively(
      queryLeftIndex,
      queryRightIndex,
      leftIndex,
      middleIndex,
      this.getLeftChildIndex(position),
    )
    const rightFnResult = this.rangeQueryRecursively(
      queryLeftIndex,
      queryRightIndex,
      middleIndex + 1,
      rightIndex,
      this.getRightChildIndex(position),
    )

    // Обрабатываем узлы с помощью переданной функции
    // и возвращаем результат
    return this.fn(leftFnResult, rightFnResult)
  }

  // Возвращает индекс левого потомка
  getLeftChildIndex(parentIndex) {
    return parentIndex * 2 + 1
  }

  // Возвращает индекс правого потомка
  getRightChildIndex(parentIndex) {
    return parentIndex * 2 + 2
  }
}
```

</details>

<details>
<summary>Тесты</summary>

```javascript
// data-structures/tree/__tests__/segment-tree.test.js
import SegmentTree from '../segment-tree'

describe('SegmentTree', () => {
  it('должен построить дерево для массива #0 с длиной, являющейся степенью 2', () => {
    const array = [-1, 2]
    const segmentTree = new SegmentTree(array, Math.min, Infinity)

    expect(segmentTree.tree).toEqual([-1, -1, 2])
    expect(segmentTree.tree.length).toBe(2 * array.length - 1)
  })

  it('должен построить дерево для массива #1 с длиной, являющейся степень 2', () => {
    const array = [-1, 2, 4, 0]
    const segmentTree = new SegmentTree(array, Math.min, Infinity)

    expect(segmentTree.tree).toEqual([-1, -1, 0, -1, 2, 4, 0])
    expect(segmentTree.tree.length).toBe(2 * array.length - 1)
  })

  it('должен построить дерево для массива #0 с длиной, НЕ являющейся степень 2', () => {
    const array = [0, 1, 2]
    const segmentTree = new SegmentTree(array, Math.min, Infinity)

    expect(segmentTree.tree).toEqual([0, 0, 2, 0, 1, null, null])
    expect(segmentTree.tree.length).toBe(2 * 4 - 1)
  })

  it('должен построить дерево для массива #1 с длиной, НЕ являющейся степень 2', () => {
    const array = [-1, 3, 4, 0, 2, 1]
    const segmentTree = new SegmentTree(array, Math.min, Infinity)

    expect(segmentTree.tree).toEqual([
      -1,
      -1,
      0,
      -1,
      4,
      0,
      1,
      -1,
      3,
      null,
      null,
      0,
      2,
      null,
      null,
    ])
    expect(segmentTree.tree.length).toBe(2 * 8 - 1)
  })

  it('должен построить максимальное дерево (предок является максимальным потомком)', () => {
    const array = [-1, 2, 4, 0]
    const segmentTree = new SegmentTree(array, Math.max, -Infinity)

    expect(segmentTree.tree).toEqual([4, 2, 4, -1, 2, 4, 0])
    expect(segmentTree.tree.length).toBe(2 * array.length - 1)
  })

  it('должен построить суммарное дерево (редок является суммой потомков)', () => {
    const array = [-1, 2, 4, 0]
    const segmentTree = new SegmentTree(array, (a, b) => a + b, 0)

    expect(segmentTree.tree).toEqual([5, 1, 4, -1, 2, 4, 0])
    expect(segmentTree.tree.length).toBe(2 * array.length - 1)
  })

  it('должен выполнить минимальный запрос диапазона на массиве с длиной, являющейся степенью 2', () => {
    const array = [-1, 3, 4, 0, 2, 1]
    const segmentTree = new SegmentTree(array, Math.min, Infinity)

    expect(segmentTree.rangeQuery(0, 5)).toBe(-1)
    expect(segmentTree.rangeQuery(0, 2)).toBe(-1)
    expect(segmentTree.rangeQuery(1, 3)).toBe(0)
    expect(segmentTree.rangeQuery(2, 4)).toBe(0)
    expect(segmentTree.rangeQuery(4, 5)).toBe(1)
    expect(segmentTree.rangeQuery(2, 2)).toBe(4)
  })

  it('должен выполнить минимальный запрос диапазона на массиве с длиной, НЕ являющейся степенью 2', () => {
    const array = [-1, 2, 4, 0]
    const segmentTree = new SegmentTree(array, Math.min, Infinity)

    expect(segmentTree.rangeQuery(0, 4)).toBe(-1)
    expect(segmentTree.rangeQuery(0, 1)).toBe(-1)
    expect(segmentTree.rangeQuery(1, 3)).toBe(0)
    expect(segmentTree.rangeQuery(1, 2)).toBe(2)
    expect(segmentTree.rangeQuery(2, 3)).toBe(0)
    expect(segmentTree.rangeQuery(2, 2)).toBe(4)
  })

  it('должен выполнить максимальный запрос диапазона', () => {
    const array = [-1, 3, 4, 0, 2, 1]
    const segmentTree = new SegmentTree(array, Math.max, -Infinity)

    expect(segmentTree.rangeQuery(0, 5)).toBe(4)
    expect(segmentTree.rangeQuery(0, 1)).toBe(3)
    expect(segmentTree.rangeQuery(1, 3)).toBe(4)
    expect(segmentTree.rangeQuery(2, 4)).toBe(4)
    expect(segmentTree.rangeQuery(4, 5)).toBe(2)
    expect(segmentTree.rangeQuery(3, 3)).toBe(0)
  })

  it('должен выполнить суммарный запрос диапазона', () => {
    const array = [-1, 3, 4, 0, 2, 1]
    const segmentTree = new SegmentTree(array, (a, b) => a + b, 0)

    expect(segmentTree.rangeQuery(0, 5)).toBe(9)
    expect(segmentTree.rangeQuery(0, 1)).toBe(2)
    expect(segmentTree.rangeQuery(1, 3)).toBe(7)
    expect(segmentTree.rangeQuery(2, 4)).toBe(6)
    expect(segmentTree.rangeQuery(4, 5)).toBe(3)
    expect(segmentTree.rangeQuery(3, 3)).toBe(0)
  })
})
```

</details>

Запускаем тесты:

```bash
npm run test ./data-structures/tree/__tests__/segment-tree
```

<img src="https://habrastorage.org/webt/0m/kn/cj/0mkncjga7hmkci-0ebhg_ae7yy4.png" />

## Дерево Фенвика

__Описание__

- [Википедия](https://ru.wikipedia.org/wiki/%D0%94%D0%B5%D1%80%D0%B5%D0%B2%D0%BE_%D0%A4%D0%B5%D0%BD%D0%B2%D0%B8%D0%BA%D0%B0)
- [YouTube](https://www.youtube.com/watch?v=muW1tOyqUZ4)

Дерево Фенвика (Fenwick tree) или двоичное индексированное дерево (ДИД, binary indexed tree, BIT) - это структура данных, которая позволяет эффективно обновлять элементы и вычислять их суммы.

По сравнению с обычным массивом, ДИД позволяет достичь лучшего баланса между двумя операциями: обновлением элементов и вычислением суммы элементов. В массиве `n` чисел можно хранить либо сами числа, либо их суммы. В первом случае вычисление суммы чисел занимает линейное время. Во втором случае обновление элемента занимает линейное время. Противоположные операции выполняются за константное время. ДИД позволяет выполнять обе операции за время `O(log n)`. Это достигается за счет представления чисел в виде дерева, где значением каждого узла является сумма чисел поддерева. Структура дерева позволяет выполнять операции за `O(log n)` доступов к узлам.

__Особенности реализации__

ДИД представлено в виде массива. Каждый узел дерева хранит сумму узлов некоторого поддерева. Размер ДИД равен `n`, где `n` - размер исходного массива. В нашей реализации будет использоваться размер `n+1` для простоты. Индексация начинается с 1.

<img src="https://habrastorage.org/webt/v-/ox/oz/v-oxozce98rjgk36iyylbb3kgiu.png" />
<br />

_Пример получения суммы элементов с помощью ДИД_

- каждый узел имеет индекс (синий) и значение по индексу (зеленый)
- при запросе суммы `i`, возвращается сумма `BITree[i]` и всех предков `i`
- индекс предка `i` может быть получен с помощью следующей формулы: `parent(i) = i - i & (-i)`. Данная операция удаляет последний установленный бит `i`. Например, если `i=12`, то `parent(i)` вернет `8`

Анимированный пример создания ДИД для массива `[1, 2, 3, 4, 5]` путем добавления элементов одного за другим:

<img src="https://habrastorage.org/webt/pv/8v/1o/pv8v1o_ftl9czbpx9v49fhpafwq.gif" />
<br />

Интерактивную визуализацию ДИД можно посмотреть [здесь](https://visualgo.net/en/fenwicktree).

__Сложность__

_Временная_

| Запрос суммы | Обновление  |
|--------------|-------------|
| `O(log(n))`  | `O(log(n))` |

_Пространственная_

`O(n)`

__Реализация__

Приступаем к реализации дерева Фенвика:

```javascript
// data-structures/tree/fenwick-tree.js
export default class FenwickTree {
  // Конструктор создает дерево Фенвика размера `size`,
  // однако, размер дерева `n+1`, потому что индексация начинается с `1`
  constructor(size) {
    this.size = size
    // Заполняем массив нулями
    this.tree = new Array(size + 1).fill(0)
  }
}
```

Метод добавления значения к существующему на определенной позиции:

```javascript
// Прибавляет значение к существующему на указанной позиции
increase(position, value) {
  if (position < 1 || position > this.size) {
    throw new Error('Позиция находится за пределами разрешенного диапазона')
  }

  // magic! :D
  for (let i = position; i <= this.size; i += i & -i) {
    this.tree[i] += value
  }

  return this
}
```

Метод получения суммы от индекса 1 до определенной позиции:

```javascript
// Возвращает сумму от индекса 1 до указанной позиции
query(position) {
  if (position < 1 || position > this.size) {
    throw new Error('Позиция находится за пределами разрешенного диапазона')
  }

  let sum = 0

  // magic! :D
  for (let i = position; i > 0; i -= i & -i) {
    sum += this.tree[i]
  }

  return sum
}
```

Метод получения суммы между двумя индексами:

```javascript
// Возвращает сумму от `leftIndex` до `rightIndex`
queryRange(leftIndex, rightIndex) {
  if (leftIndex > rightIndex) {
    throw new Error('Левый индекс не может превышать правый')
  }

  if (leftIndex === 1) {
    return this.query(rightIndex)
  }

  return this.query(rightIndex) - this.query(leftIndex - 1)
}
```

<details>
<summary>Полный код дерева Фенвика</summary>

```javascript
export default class FenwickTree {
  // Конструктор создает дерево Фенвика размера `size`,
  // однако, размер дерева `n+1`, потому что индексация начинается с `1`
  constructor(size) {
    this.size = size
    // Заполняем массив нулями
    this.tree = new Array(size + 1).fill(0)
  }

  // Прибавляет значение к существующему на указанной позиции
  increase(position, value) {
    if (position < 1 || position > this.size) {
      throw new Error('Позиция находится за пределами разрешенного диапазона')
    }

    // magic! :D
    for (let i = position; i <= this.size; i += i & -i) {
      this.tree[i] += value
    }

    return this
  }

  // Возвращает сумму от индекса 1 до указанной позиции
  query(position) {
    if (position < 1 || position > this.size) {
      throw new Error('Позиция находится за пределами разрешенного диапазона')
    }

    let sum = 0

    // magic! :D
    for (let i = position; i > 0; i -= i & -i) {
      sum += this.tree[i]
    }

    return sum
  }

  // Возвращает сумму от `leftIndex` до `rightIndex`
  queryRange(leftIndex, rightIndex) {
    if (leftIndex > rightIndex) {
      throw new Error('Левый индекс не может превышать правый')
    }

    if (leftIndex === 1) {
      return this.query(rightIndex)
    }

    return this.query(rightIndex) - this.query(leftIndex - 1)
  }
}
```

</details>

<details>
<summary>Тесты</summary>

```javascript
// data-structures/tree/__tests__/fenwick-tree.test.js
import FenwickTree from '../fenwick-tree'

describe('FenwickTree', () => {
  it('должен создать деревья правильного размера', () => {
    const tree1 = new FenwickTree(5)
    expect(tree1.tree.length).toBe(5 + 1)

    for (let i = 0; i < 5; i += 1) {
      expect(tree1.tree[i]).toBe(0)
    }

    const tree2 = new FenwickTree(50)
    expect(tree2.tree.length).toBe(50 + 1)
  })

  it('должен создать правильное дерево', () => {
    const inputArray = [3, 2, -1, 6, 5, 4, -3, 3, 7, 2, 3]

    const tree = new FenwickTree(inputArray.length)
    expect(tree.tree.length).toBe(inputArray.length + 1)

    inputArray.forEach((value, index) => {
      tree.increase(index + 1, value)
    })

    expect(tree.tree).toEqual([0, 3, 5, -1, 10, 5, 9, -3, 19, 7, 9, 3])

    expect(tree.query(1)).toBe(3)
    expect(tree.query(2)).toBe(5)
    expect(tree.query(3)).toBe(4)
    expect(tree.query(4)).toBe(10)
    expect(tree.query(5)).toBe(15)
    expect(tree.query(6)).toBe(19)
    expect(tree.query(7)).toBe(16)
    expect(tree.query(8)).toBe(19)
    expect(tree.query(9)).toBe(26)
    expect(tree.query(10)).toBe(28)
    expect(tree.query(11)).toBe(31)

    expect(tree.queryRange(1, 1)).toBe(3)
    expect(tree.queryRange(1, 2)).toBe(5)
    expect(tree.queryRange(2, 4)).toBe(7)
    expect(tree.queryRange(6, 9)).toBe(11)

    tree.increase(3, 1)

    expect(tree.query(1)).toBe(3)
    expect(tree.query(2)).toBe(5)
    expect(tree.query(3)).toBe(5)
    expect(tree.query(4)).toBe(11)
    expect(tree.query(5)).toBe(16)
    expect(tree.query(6)).toBe(20)
    expect(tree.query(7)).toBe(17)
    expect(tree.query(8)).toBe(20)
    expect(tree.query(9)).toBe(27)
    expect(tree.query(10)).toBe(29)
    expect(tree.query(11)).toBe(32)

    expect(tree.queryRange(1, 1)).toBe(3)
    expect(tree.queryRange(1, 2)).toBe(5)
    expect(tree.queryRange(2, 4)).toBe(8)
    expect(tree.queryRange(6, 9)).toBe(11)
  })

  it('должен правильно выполнить запросы', () => {
    const tree = new FenwickTree(5)

    tree.increase(1, 4)
    tree.increase(3, 7)

    expect(tree.query(1)).toBe(4)
    expect(tree.query(3)).toBe(11)
    expect(tree.query(5)).toBe(11)
    expect(tree.queryRange(2, 3)).toBe(7)

    tree.increase(2, 5)
    expect(tree.query(5)).toBe(16)

    tree.increase(1, 3)
    expect(tree.queryRange(1, 1)).toBe(7)
    expect(tree.query(5)).toBe(19)
    expect(tree.queryRange(1, 5)).toBe(19)
  })

  it('должен выбросить исключения', () => {
    const tree = new FenwickTree(5)

    const increaseAtInvalidLowIndex = () => {
      tree.increase(0, 1)
    }

    const increaseAtInvalidHighIndex = () => {
      tree.increase(10, 1)
    }

    const queryInvalidLowIndex = () => {
      tree.query(0)
    }

    const queryInvalidHighIndex = () => {
      tree.query(10)
    }

    const rangeQueryInvalidIndex = () => {
      tree.queryRange(3, 2)
    }

    expect(increaseAtInvalidLowIndex).toThrowError()
    expect(increaseAtInvalidHighIndex).toThrowError()
    expect(queryInvalidLowIndex).toThrowError()
    expect(queryInvalidHighIndex).toThrowError()
    expect(rangeQueryInvalidIndex).toThrowError()
  })
})
```

</details>

Запускаем тесты:

```bash
npm run test ./data-structures/tree/__tests__/fenwick-tree
```

<img src="https://habrastorage.org/webt/wd/at/id/wdatid69rzmiw0ysf9pyveyvqqm.png" />
