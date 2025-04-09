---
sidebar_position: 2
title: Двоичное дерево поиска
description: Двоичное дерево поиска
keywords: ['javascript', 'js', 'data structures', 'структуры данных']
tags: ['javascript', 'js', 'data structures', 'структуры данных']
---

# Двоичное дерево поиска

__Описание__

- [Википедия](https://ru.wikipedia.org/wiki/%D0%94%D0%B2%D0%BE%D0%B8%D1%87%D0%BD%D0%BE%D0%B5_%D0%B4%D0%B5%D1%80%D0%B5%D0%B2%D0%BE_%D0%BF%D0%BE%D0%B8%D1%81%D0%BA%D0%B0)
- [YouTube](https://www.youtube.com/watch?v=9o_i0zzxk1s)
- [GitHub](https://github.com/harryheman/algorithms-data-structures/blob/main/src/data-structures/tree/binary-search-tree.js)

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
