---
sidebar_position: 3
title: АВЛ-дерево
description: АВЛ-дерево
keywords: ['javascript', 'js', 'data structures', 'структуры данных']
tags: ['javascript', 'js', 'data structures', 'структуры данных']
---

# АВЛ-дерево

__Описание__

- [Википедия](https://ru.wikipedia.org/wiki/%D0%90%D0%92%D0%9B-%D0%B4%D0%B5%D1%80%D0%B5%D0%B2%D0%BE)
- [YouTube](https://www.youtube.com/watch?v=DB1HFCEdLxA)
- [GitHub](https://github.com/harryheman/algorithms-data-structures/blob/main/src/data-structures/tree/avl-tree.js)

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
