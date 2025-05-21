---
sidebar_position: 1
title: Линейный поиск
description: Линейный поиск
keywords: ['javascript', 'js', 'algorithms', 'алгоритмы']
tags: ['javascript', 'js', 'algorithms', 'алгоритмы']
---

# Линейный поиск

__Описание__

- [Википедия](https://ru.wikipedia.org/wiki/%D0%9B%D0%B8%D0%BD%D0%B5%D0%B9%D0%BD%D1%8B%D0%B9_%D0%BF%D0%BE%D0%B8%D1%81%D0%BA)
- [YouTube](https://www.youtube.com/watch?v=bmhWdD0hK7s)
- [GitHub](https://github.com/harryheman/algorithms-data-structures/blob/main/src/algorithms/searches/linear-search.js)

Линейный (последовательный) поиск (linear search) - это метод поиска целевого значения в списке (массиве). Он последовательно проверяет каждый элемент списка на предмет совпадения с целевым значением до тех пор, пока либо не будет найдено совпадение, либо не закончатся элементы. Линейный поиск в худшем случае выполняется за линейное время и выполняет `n` сравнений, где `n` - это длина массива. Таким образом, _временная сложность_ данного алгоритма составляет `O(n)`.

<img src="https://habrastorage.org/webt/lu/s9/29/lus929vsniktif5sj_snhvt4aau.gif" />
<br />

__Реализация__

Для сравнения элементов списка с целевым значением будет использоваться кастомная функция, которую мы рассматривали в самой первой статье серии. Напомню, как она выглядит:

```javascript
// utils/Comparator.js
export default class Comparator {
  constructor(fn) {
    this.compare = fn || Comparator.defaultCompare
  }

  // Дефолтная функция сравнения узлов
  static defaultCompare(a, b) {
    if (a === b) {
      return 0
    }
    return a < b ? -1 : 1
  }

  // Проверка на равенство
  equal(a, b) {
    return this.compare(a, b) === 0
  }

  // Меньше чем
  lessThan(a, b) {
    return this.compare(a, b) < 0
  }

  // Больше чем
  greaterThan(a, b) {
    return this.compare(a, b) > 0
  }

  // Меньше или равно
  lessThanOrEqual(a, b) {
    return this.lessThan(a, b) || this.equal(a, b)
  }

  // Больше или равно
  greaterThanOrEqual(a, b) {
    return this.greaterThan(a, b) || this.equal(a, b)
  }

  // Инверсия сравнения
  reverse() {
    const original = this.compare
    this.compare = (a, b) => original(b, a)
  }
}
```

Эта функция позволяет сравнивать не только примитивные значение, но и объекты.

Используем ее для реализации алгоритма линейного поиска:

```javascript
// algorithms/searches/linear-search.js
import Comparator from '../../utils/comparator'

export default function linearSearch(arr, target, fn) {
  const comparator = new Comparator(fn)
  const result = []

  arr.forEach((item, index) => {
    if (comparator.equal(item, target)) {
      result.push(index)
    }
  })

  return result
}
```

__Тестирование__

```javascript
// algorithms/searches/__tests__/linear-search.test.js
import linearSearch from '../linear-search'

describe('linearSearch', () => {
  it('должен найти числа в массиве', () => {
    const array = [1, 2, 4, 6, 2]

    expect(linearSearch(array, 10)).toEqual([])
    expect(linearSearch(array, 1)).toEqual([0])
    expect(linearSearch(array, 2)).toEqual([1, 4])
  })

  it('должен найти символы в массиве', () => {
    const array = ['a', 'b', 'a']

    expect(linearSearch(array, 'c')).toEqual([])
    expect(linearSearch(array, 'b')).toEqual([1])
    expect(linearSearch(array, 'a')).toEqual([0, 2])
  })

  it('должен найти объекты в массиве', () => {
    const comparatorCallback = (a, b) => {
      if (a.key === b.key) {
        return 0
      }

      return a.key <= b.key ? -1 : 1
    }

    const array = [{ key: 5 }, { key: 6 }, { key: 7 }, { key: 6 }]

    expect(linearSearch(array, { key: 10 }, comparatorCallback)).toEqual([])
    expect(linearSearch(array, { key: 5 }, comparatorCallback)).toEqual([0])
    expect(linearSearch(array, { key: 6 }, comparatorCallback)).toEqual([1, 3])
  })
})
```

Запускаем тесты:

```bash
npm run test ./algorithms/searches/__tests__/linear-search
```

<img src="https://habrastorage.org/webt/uv/vc/nf/uvvcnfwtt6jog8c3o18253emqrm.png" />
