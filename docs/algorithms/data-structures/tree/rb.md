---
sidebar_position: 4
title: Красно-черное дерево
description: Красно-черное дерево
keywords: ['javascript', 'js', 'data structures', 'структуры данных']
tags: ['javascript', 'js', 'data structures', 'структуры данных']
---

# Красно-черное дерево

__Описание__

- [Википедия](https://ru.wikipedia.org/wiki/%D0%9A%D1%80%D0%B0%D1%81%D0%BD%D0%BE-%D1%87%D1%91%D1%80%D0%BD%D0%BE%D0%B5_%D0%B4%D0%B5%D1%80%D0%B5%D0%B2%D0%BE)
- [YouTube](https://www.youtube.com/watch?v=qvZGUFHWChY)
- [GitHub](https://github.com/harryheman/algorithms-data-structures/blob/main/src/data-structures/tree/red-black-tree.js)

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
