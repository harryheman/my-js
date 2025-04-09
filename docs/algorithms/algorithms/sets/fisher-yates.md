---
sidebar_position: 3
title: Тасование Фишера-Йетса
description: Тасование Фишера-Йетса
keywords: ['javascript', 'js', 'algorithms', 'алгоритмы']
tags: ['javascript', 'js', 'algorithms', 'алгоритмы']
---

# Тасование Фишера-Йетса

__Описание__

- [Википедия](https://ru.wikipedia.org/wiki/%D0%A2%D0%B0%D1%81%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D0%B5_%D0%A4%D0%B8%D1%88%D0%B5%D1%80%D0%B0_%E2%80%94_%D0%99%D0%B5%D1%82%D1%81%D0%B0)
- [GitHub](https://github.com/harryheman/algorithms-data-structures/blob/main/src/algorithms/sets/fisher-yates.js)

Тасование Фишера-Йетса (Fisher-Yates shuffle) - это алгоритм создания произвольных перестановок конечного множества, проще говоря, для произвольного тасования множества. Правильно реализованный алгоритм несмещенный, так что каждая перестановка генерируется с одинаковой вероятностью. Современная версия алгоритма очень эффективна и требует время, пропорциональное числу элементов множества, а также не требует дополнительной памяти.

Основная процедура тасования Фишера-Йетса аналогична случайному вытаскиванию записок с числами из шляпы или карт из колоды, один элемент за другим, пока элементы не кончатся. Алгоритм обеспечивает эффективный и строгий метод таких операций, гарантирующий несмещенный результат.

__Реализация__

```javascript
// algorithms/sets/fisher-yates.js
export default function fisherYates(arr) {
  // Эффективно создаем глубокую копию массива
  // https://developer.mozilla.org/en-US/docs/Web/API/structuredClone
  const arrCopy = structuredClone(arr)

  for (let i = arrCopy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arrCopy[i], arrCopy[j]] = [arrCopy[j], arrCopy[i]]
  }

  return arrCopy
}
```

__Тестирование__

```javascript
// algorithms/sets/__tests__/fisher-yates.test.js
import fisherYates from '../fisher-yates'

const sortedArr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

describe('fisherYates', () => {
  it('должен тасовать маленькие массивы', () => {
    expect(fisherYates([])).toEqual([])
    expect(fisherYates([1])).toEqual([1])
  })

  it('должен произвольно перетасовать элементы массива', () => {
    const shuffledArray = fisherYates(sortedArr)

    expect(shuffledArray.length).toBe(sortedArr.length)
    expect(shuffledArray).not.toEqual(sortedArr)
    expect(shuffledArray.sort()).toEqual(sortedArr)
  })
})
```

Запускаем тесты:

```bash
npm run test ./algorithms/sets/__tests__/fisher-yates
```

<img src="https://habrastorage.org/webt/8t/au/l-/8taul-rkccjrttzxanud84soauc.png" />
