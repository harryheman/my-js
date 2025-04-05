---
sidebar_position: 8
title: Префиксное дерево
description: Префиксное дерево
keywords: ['javascript', 'js', 'data structures', 'структуры данных']
tags: ['javascript', 'js', 'data structures', 'структуры данных']
---

# Префиксное дерево

- [Википедия](https://ru.wikipedia.org/wiki/%D0%9F%D1%80%D0%B5%D1%84%D0%B8%D0%BA%D1%81%D0%BD%D0%BE%D0%B5_%D0%B4%D0%B5%D1%80%D0%B5%D0%B2%D0%BE)
- [YouTube](https://www.youtube.com/watch?v=fqfkeJ09G0c)

Префиксное дерево (или бор, или луч, или нагруженное дерево) (trie) - структура данных, позволяющая хранить ассоциативный массив (или другое динамическое множество), ключами которого чаще всего являются строки. Представляет собой корневое дерево, каждое ребро которого помечено каким-то символом так, что для любого узла все ребра, соединяющие этот узел с его потомками, помечены разными символами. Некоторые узлы префиксного дерева выделены и считается, что префиксное дерево содержит данную строку-ключ тогда и только тогда, когда эту строку можно прочитать на пути из корня до некоторого (единственного для этой строки) выделенного узла.

Таким образом, в отличие от бинарных деревьев поиска (binary search tree), ключ, идентифицирующий конкретный узел дерева, не явно хранится в данном узле, а задается положением данного узла в дереве. Получить ключ можно выписыванием символов, помечающих ребра на пути от корня до узла. Ключ корневого узла - пустая строка. Часто в выделенных узлах хранят дополнительную информацию, связанную с ключом, и обычно выделенными являются только листья, а иногда и некоторые внутренние узлы.

<img src="https://habrastorage.org/webt/tk/yc/-w/tkyc-wz6y5jcnie6zzpjpsk3_oi.png" />
<br />

__Сложность__

Временная сложность префиксного дерева составляет O(n) (при использовании хэш-таблицы).

__Реализация__

Для реализации префиксного дерева мы будем использовать хэш-таблицу (см. раздел 5).

Начнем с узла дерева:

```javascript
// data-structures/trie/node.js
// Импортируем конструктор хэш-таблицы
import HashTable from '../hash-table'

// Последний (завершающий) символ
export const HEAD_CHARACTER = '*'

// Узел префиксного дерева
export default class Node {
  constructor(char, isCompleteWord = false) {
    // Символ
    this.char = char
    // Индикатор завершающего символа
    this.isCompleteWord = isCompleteWord
    // Хэш-таблица потомков
    this.children = new HashTable()
  }
}
```

Методы добавления и удаления узлов-потомков:

```javascript
// Добавляет потомка в дерево
addChild(char, isCompleteWord = false) {
  // Добавляем узел при отсутствии
  if (!this.hasChild(char)) {
    this.children.set(char, new Node(char, isCompleteWord))
  }

  // Извлекаем узел
  const node = this.getChild(char)

  // Обновляем флаг `isCompleteWord` при необходимости,
  // например, при добавлении слова "car" после слова "carpet",
  // букву "r" нужно пометить как завершающую
  node.isCompleteWord = node.isCompleteWord || isCompleteWord

  // Возвращаем узел
  return node
}

// Удаляет потомка
removeChild(char) {
  // Извлекаем узел
  const node = this.getChild(char)

  // Удаляем узел, только если:
  // - у него нет потомков
  // - node.isCompleteWord === false
  if (node && !node.isCompleteWord && !node.hasChildren()) {
    this.children.remove(char)
  }

  return this
}
```

Вспомогательные методы для работы с потомками:

```javascript
// Возвращает потомка
getChild(char) {
  return this.children.get(char)
}

// Определяет наличие потомка
hasChild(char) {
  return this.children.has(char)
}

// Определяет наличие потомков
hasChildren() {
  return this.children.getKeys().length > 0
}

// Автодополнение (предложение следующих символов)
suggestChildren() {
  return [...this.children.getKeys()]
}
```

Метод преобразования потомков в строку:

```javascript
// Преобразует потомков в строку
// с указанием признака завершающего символа
toString() {
  let childrenAsString = this.suggestChildren().toString()
  childrenAsString = childrenAsString ? `:${childrenAsString}` : ''
  const isCompleteString = this.isCompleteWord ? HEAD_CHARACTER : ''

  return `${this.char}${isCompleteString}${childrenAsString}`
}
```

<details>
<summary>Полный код узла префиксного дерева</summary>

```javascript
// Импортируем конструктор хэш-таблицы
import HashTable from '../hash-table'

// Последний (завершающий) символ
export const HEAD_CHARACTER = '*'

// Узел префиксного дерева
export default class Node {
  constructor(char, isCompleteWord = false) {
    // Символ
    this.char = char
    // Индикатор завершающего символа
    this.isCompleteWord = isCompleteWord
    // Хэш-таблица потомков
    this.children = new HashTable()
  }

  // Добавляет потомка в дерево
  addChild(char, isCompleteWord = false) {
    // Добавляем узел при отсутствии
    if (!this.hasChild(char)) {
      this.children.set(char, new Node(char, isCompleteWord))
    }

    // Извлекаем узел
    const node = this.getChild(char)

    // Обновляем флаг `isCompleteWord` при необходимости,
    // например, при добавлении слова "car" после слова "carpet",
    // букву "r" нужно пометить как завершающую
    node.isCompleteWord = node.isCompleteWord || isCompleteWord

    // Возвращаем узел
    return node
  }

  // Удаляет потомка
  removeChild(char) {
    // Извлекаем узел
    const node = this.getChild(char)

    // Удаляем узел, только если:
    // - у него нет потомков
    // - node.isCompleteWord === false
    if (node && !node.isCompleteWord && !node.hasChildren()) {
      this.children.remove(char)
    }

    return this
  }

  // Возвращает потомка
  getChild(char) {
    return this.children.get(char)
  }

  // Определяет наличие потомка
  hasChild(char) {
    return this.children.has(char)
  }

  // Определяет наличие потомков
  hasChildren() {
    return this.children.getKeys().length > 0
  }

  // Автодополнение (предложение следующих символов)
  suggestChildren() {
    return [...this.children.getKeys()]
  }

  // Преобразует потомков в строку
  // с указанием признака завершающего символа
  toString() {
    let childrenAsString = this.suggestChildren().toString()
    childrenAsString = childrenAsString ? `:${childrenAsString}` : ''
    const isCompleteString = this.isCompleteWord ? HEAD_CHARACTER : ''

    return `${this.char}${isCompleteString}${childrenAsString}`
  }
}
```

</details>

Отлично! Приступаем к реализации самого дерева:

```javascript
// data-structures/trie/index.js
import TrieNode, { HEAD_CHARACTER } from './node'

// Префиксное дерево
export default class Trie {
  constructor() {
    // Головной (корневой) узел
    this.head = new TrieNode(HEAD_CHARACTER)
  }
}
```

Методы добавления и удаления слова (ключа) в/из дерева:

```javascript
// Добавляет слово (ключ) в дерево
addWord(word) {
  // Преобразуем строку (слово) в массив символов
  // (вопрос на засыпку: почему лучше не использовать `split('')`?
  // Подсказка: попробуйте преобразовать "Hello, 👋!")
  const chars = [...word]

  // Текущий узел (начинаем с головного)
  let node = this.head

  // Перебираем символы и добавляем каждый в дерево
  for (let i = 0; i < chars.length; i++) {
    // Индикатор завершающего символа
    const isComplete = i === chars.length - 1
    // Добавляем потомка
    node = node.addChild(chars[i], isComplete)
  }

  return this
}

// Удаляет слово (ключ) из дерева
removeWord(word) {
  // Удаляет слово рекурсивно ("сначала в глубину")
  const depthFirstRemove = (node, i = 0) => {
    // Если удаляемый символ находится за пределами слова,
    // ничего не делаем
    if (i >= word.length) return

    // Символ
    const char = word[i]
    // Следующий узел
    const nextNode = node.getChild(char)

    // Если следующий узел отсутствует,
    // ничего не делаем
    if (!nextNode) return

    // Погружаемся глубже
    depthFirstRemove(nextNode, i + 1)

    // Поскольку мы удаляем слово,
    // необходимо обновить флаг `isCompleteWord`
    // его последнего символа
    if (i === word.length - 1) {
      nextNode.isCompleteWord = false
    }

    // Узел удаляется, только если:
    // - у него нет потомков
    // - nextNode.isCompleteWord === false
    node.removeChild(char)
  }

  // Начинаем с головного узла
  depthFirstRemove(this.head)

  return this
}
```

Метод автодополнения:

```javascript
// Автодополнение (предложение следующих символов)
suggestNextCharacters(word) {
  // Получаем последний символ
  const lastChar = this.getLastCharNode(word)

  // Если последний символ отсутствует
  if (!lastChar) {
    return null
  }

  // Возвращаем массив следующих символов
  return lastChar.suggestChildren()
}
```

Вспомогательный метод определения наличия слова в дереве:

```javascript
// Определяет наличие слова в дереве
doesWordExist(word) {
  // Получаем последний символ
  const lastChar = this.getLastCharNode(word)

  return Boolean(lastChar) && lastChar.isCompleteWord
}
```

Наконец, метод получения последнего символа:

```javascript
// Возвращает последний символ
getLastCharNode(word) {
  // Разбиваем слово на символы
  const chars = [...word]
  // Текущий узел (начинаем с головного)
  let node = this.head

  // Перебираем символы
  for (let i = 0; i < chars.length; i++) {
    // Если символ отсутствует
    if (!node.hasChild(chars[i])) {
      return null
    }

    // Извлекаем потомка
    node = node.getChild(chars[i])
  }

  // Возвращаем последний узел
  return node
}
```

<details>
<summary>Полный код префиксного дерева</summary>

```javascript
import TrieNode, { HEAD_CHARACTER } from './node'

// Префиксное дерево
export default class Trie {
  constructor() {
    // Головной (корневой) узел
    this.head = new TrieNode(HEAD_CHARACTER)
  }

  // Добавляет слово (ключ) в дерево
  addWord(word) {
    // Преобразуем строку (слово) в массив символов
    // (вопрос на засыпку: почему лучше не использовать `split()`?
    // Подсказка: попробуйте преобразовать "Hello, 👋!")
    const chars = [...word]

    // Текущий узел (начинаем с головного)
    let node = this.head

    // Перебираем символы и добавляем каждый в дерево
    for (let i = 0; i < chars.length; i++) {
      // Индикатор последнего (завершающего) символа
      const isComplete = i === chars.length - 1
      // Добавляем потомка
      node = node.addChild(chars[i], isComplete)
    }

    return this
  }

  // Удаляет слово (ключ) из дерева
  removeWord(word) {
    // Удаляет слово рекурсивно ("сначала в глубину")
    const depthFirstRemove = (node, i = 0) => {
      // Если удаляемый символ находится за пределами слова,
      // ничего не делаем
      if (i >= word.length) return

      // Символ
      const char = word[i]
      // Следующий узел
      const nextNode = node.getChild(char)

      // Если следующий узел отсутствует,
      // ничего не делаем
      if (!nextNode) return

      // Погружаемся глубже
      depthFirstRemove(nextNode, i + 1)

      // Поскольку мы удаляем слово,
      // необходимо обновить флаг `isCompleteWord`
      // его последнего символа
      if (i === word.length - 1) {
        nextNode.isCompleteWord = false
      }

      // Узел удаляется, только если:
      // - у него нет потомков
      // - nextNode.isCompleteWord === false
      node.removeChild(char)
    }

    // Начинаем с головного узла
    depthFirstRemove(this.head)

    return this
  }

  // Автодополнение (предложение следующих символов)
  suggestNextCharacters(word) {
    // Получаем последний символ
    const lastChar = this.getLastCharNode(word)

    // Если последний символ отсутствует
    if (!lastChar) {
      return null
    }

    // Возвращаем массив следующих символов
    return lastChar.suggestChildren()
  }

  // Определяет наличие слова в дереве
  doesWordExist(word) {
    // Получаем последний символ
    const lastChar = this.getLastCharNode(word)

    return Boolean(lastChar) && lastChar.isCompleteWord
  }

  // Возвращает последний символ
  getLastCharNode(word) {
    // Разбиваем слово на символы
    const chars = [...word]
    // Текущий узел (начинаем с головного)
    let node = this.head

    // Перебираем символы
    for (let i = 0; i < chars.length; i++) {
      // Если символ отсутствует
      if (!node.hasChild(chars[i])) {
        return null
      }

      // Извлекаем потомка
      node = node.getChild(chars[i])
    }

    // Возвращаем последний узел
    return node
  }
}
```

</details>

__Тестирование__

Проверяем, что наше префиксное дерево работает, как ожидается.

<details>
<summary>Тесты для узла</summary>

```javascript
// data-structures/trie/__tests__/node.test.js
import TrieNode from '../node'

describe('TrieNode', () => {
  it('должен создать узел префиксного дерева', () => {
    const trieNode = new TrieNode('c', true)

    expect(trieNode.char).toBe('c')
    expect(trieNode.isCompleteWord).toBe(true)
    expect(trieNode.toString()).toBe('c*')
  })

  it('должен добавить потомков', () => {
    const trieNode = new TrieNode('c')

    trieNode.addChild('a', true)
    trieNode.addChild('o')

    expect(trieNode.toString()).toBe('c:a,o')
  })

  it('должен извлечь потомков', () => {
    const trieNode = new TrieNode('c')

    trieNode.addChild('a')
    trieNode.addChild('o')

    expect(trieNode.getChild('a').toString()).toBe('a')
    expect(trieNode.getChild('a').char).toBe('a')
    expect(trieNode.getChild('o').toString()).toBe('o')
    expect(trieNode.getChild('b')).toBeNull()
  })

  it('должен определить наличие потомков', () => {
    const trieNode = new TrieNode('c')

    expect(trieNode.hasChildren()).toBe(false)

    trieNode.addChild('a')

    expect(trieNode.hasChildren()).toBe(true)
  })

  it('должен определить наличие конкретного потомка', () => {
    const trieNode = new TrieNode('c')

    trieNode.addChild('a')
    trieNode.addChild('o')

    expect(trieNode.hasChild('a')).toBe(true)
    expect(trieNode.hasChild('o')).toBe(true)
    expect(trieNode.hasChild('b')).toBe(false)
  })

  it('должен получить следующие символы', () => {
    const trieNode = new TrieNode('c')

    trieNode.addChild('a')
    trieNode.addChild('o')

    expect(trieNode.suggestChildren()).toEqual(['a', 'o'])
  })

  it('должен удалить потомка, если у него НЕТ потомков', () => {
    const trieNode = new TrieNode('c')
    trieNode.addChild('a')
    expect(trieNode.hasChild('a')).toBe(true)

    trieNode.removeChild('a')
    expect(trieNode.hasChild('a')).toBe(false)
  })

  it('НЕ должен удалять потомков, у которых есть потомки', () => {
    const trieNode = new TrieNode('c')
    trieNode.addChild('a')
    const childNode = trieNode.getChild('a')
    childNode.addChild('r')

    trieNode.removeChild('a')
    expect(trieNode.hasChild('a')).toEqual(true)
  })

  it('НЕ должен удалять потомков, которые являются завершающими символами', () => {
    const trieNode = new TrieNode('c')
    const IS_COMPLETE_WORD = true
    trieNode.addChild('a', IS_COMPLETE_WORD)

    trieNode.removeChild('a')
    expect(trieNode.hasChild('a')).toEqual(true)
  })
})
```

</details>

<details>
<summary>Тесты для дерева</summary>

```javascript
// data-structures/trie/__tests__/trie.test.js
import Trie from '..'

describe('Trie', () => {
  it('должен создать префиксное дерево', () => {
    const trie = new Trie()

    expect(trie).toBeDefined()
    expect(trie.head.toString()).toBe('*')
  })

  it('должен добавить слова в дерево', () => {
    const trie = new Trie()

    trie.addWord('cat')

    expect(trie.head.toString()).toBe('*:c')
    expect(trie.head.getChild('c').toString()).toBe('c:a')

    trie.addWord('car')
    expect(trie.head.toString()).toBe('*:c')
    expect(trie.head.getChild('c').toString()).toBe('c:a')
    expect(trie.head.getChild('c').getChild('a').toString()).toBe('a:t,r')
    expect(trie.head.getChild('c').getChild('a').getChild('t').toString()).toBe(
      't*',
    )
  })

  it('должен удалить слова из дерева', () => {
    const trie = new Trie()

    trie.addWord('carpet')
    trie.addWord('car')
    trie.addWord('cat')
    trie.addWord('cart')
    expect(trie.doesWordExist('carpet')).toBe(true)
    expect(trie.doesWordExist('car')).toBe(true)
    expect(trie.doesWordExist('cart')).toBe(true)
    expect(trie.doesWordExist('cat')).toBe(true)

    // Пытаемся удалить несуществующее слово
    trie.removeWord('carpool')
    expect(trie.doesWordExist('carpet')).toBe(true)
    expect(trie.doesWordExist('car')).toBe(true)
    expect(trie.doesWordExist('cart')).toBe(true)
    expect(trie.doesWordExist('cat')).toBe(true)

    trie.removeWord('carpet')
    expect(trie.doesWordExist('carpet')).toEqual(false)
    expect(trie.doesWordExist('car')).toEqual(true)
    expect(trie.doesWordExist('cart')).toBe(true)
    expect(trie.doesWordExist('cat')).toBe(true)

    trie.removeWord('cat')
    expect(trie.doesWordExist('car')).toEqual(true)
    expect(trie.doesWordExist('cart')).toBe(true)
    expect(trie.doesWordExist('cat')).toBe(false)

    trie.removeWord('car')
    expect(trie.doesWordExist('car')).toEqual(false)
    expect(trie.doesWordExist('cart')).toBe(true)

    trie.removeWord('cart')
    expect(trie.doesWordExist('car')).toEqual(false)
    expect(trie.doesWordExist('cart')).toBe(false)
  })

  it('должен получить следующие символы', () => {
    const trie = new Trie()

    trie.addWord('cat')
    trie.addWord('cats')
    trie.addWord('car')
    trie.addWord('caption')

    expect(trie.suggestNextCharacters('ca')).toEqual(['t', 'r', 'p'])
    expect(trie.suggestNextCharacters('cat')).toEqual(['s'])
    expect(trie.suggestNextCharacters('cab')).toBeNull()
  })

  it('должен определить наличие слов', () => {
    const trie = new Trie()

    trie.addWord('cat')
    trie.addWord('cats')
    trie.addWord('carpet')
    trie.addWord('car')
    trie.addWord('caption')

    expect(trie.doesWordExist('cat')).toBe(true)
    expect(trie.doesWordExist('cats')).toBe(true)
    expect(trie.doesWordExist('carpet')).toBe(true)
    expect(trie.doesWordExist('car')).toBe(true)
    expect(trie.doesWordExist('cap')).toBe(false)
    expect(trie.doesWordExist('call')).toBe(false)
  })
})
```

</details>

Запускаем тесты:

```bash
npm run test ./data-structures/trie
```

<img src="https://habrastorage.org/webt/ts/gq/ga/tsgqgakqf8qoyy5vgj7qbluxk3m.png" />
