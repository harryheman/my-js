---
sidebar_position: 3
title: Двоичный поиск
description: Двоичный поиск
keywords: ['javascript', 'js', 'algorithms', 'алгоритмы']
tags: ['javascript', 'js', 'algorithms', 'алгоритмы']
---

# Двоичный поиск

__Описание__

- [Википедия](https://ru.wikipedia.org/wiki/%D0%94%D0%B2%D0%BE%D0%B8%D1%87%D0%BD%D1%8B%D0%B9_%D0%BF%D0%BE%D0%B8%D1%81%D0%BA)
- [YouTube](https://www.youtube.com/watch?v=aFoaeA2tsVQ)
- [GitHub](https://github.com/harryheman/algorithms-data-structures/blob/main/src/algorithms/searches/binary-search.js)

Двоичный (бинарный) поиск (метод деления пополам или дихотомия) (binary/half-interval/logarithmic search, binary chop) -это классический алгоритм поиска элемента в отсортированном массиве (векторе), использующий дробление массива на половины. Суть такая: мы сравниваем целевое значение с центральным элементом массива. Если они неравны, половина, в которой точно нет целевого значения, отбрасывается, и поиск продолжается в другой половине по такому же принципу. Если поиск завершился пустым массивом, значит, целевое значение в массиве отсутствует.

<img src="https://habrastorage.org/webt/c0/_y/ns/c0_ynsayhjh1msnteus7dydzuzo.png" />
<br />

_Временная сложность_ алгоритма составляет `O(log(n))`, поскольку мы уменьшаем площадь поиска вдвое на каждой итерации.

__Реализация__

```javascript
// algorithms/searches/binary-search.js
import Comparator from '../../utils/comparator'

export default function binarySearch(sortedArr, target, fn) {
  const comparator = new Comparator(fn)

  let start = 0
  let end = sortedArr.length - 1

  while (start <= end) {
    // Вычисляем индекс центрального элемента
    let middle = start + Math.floor((end - start) / 2)

    if (comparator.equal(sortedArr[middle], target)) {
      return middle
    }

    // Если целевое значение меньше центрального элемента
    if (comparator.lessThan(sortedArr[middle], target)) {
      // Переходим к правой половине массива
      start = middle + 1
    } else {
      // Переходим к левой половине массива
      end = middle - 1
    }
  }

  return -1
}
```

__Тестирование__

```javascript
// algorithms/searches/__tests__/binary-search.test.js
import binarySearch from '../binary-search'

describe('binarySearch', () => {
  it('должен найти числа в отсортированных массивах', () => {
    expect(binarySearch([], 1)).toBe(-1)
    expect(binarySearch([1], 1)).toBe(0)
    expect(binarySearch([1, 2], 1)).toBe(0)
    expect(binarySearch([1, 2], 2)).toBe(1)
    expect(binarySearch([1, 5, 10, 12], 1)).toBe(0)
    expect(binarySearch([1, 5, 10, 12, 14, 17, 22, 100], 17)).toBe(5)
    expect(binarySearch([1, 5, 10, 12, 14, 17, 22, 100], 1)).toBe(0)
    expect(binarySearch([1, 5, 10, 12, 14, 17, 22, 100], 100)).toBe(7)
    expect(binarySearch([1, 5, 10, 12, 14, 17, 22, 100], 0)).toBe(-1)
  })

  it('должен найти объекты в отсортированном массиве', () => {
    const sortedArrayOfObjects = [
      { key: 1, value: 'value1' },
      { key: 2, value: 'value2' },
      { key: 3, value: 'value3' },
    ]

    const comparator = (a, b) => {
      if (a.key === b.key) return 0
      return a.key < b.key ? -1 : 1
    }

    expect(binarySearch([], { key: 1 }, comparator)).toBe(-1)
    expect(binarySearch(sortedArrayOfObjects, { key: 4 }, comparator)).toBe(-1)
    expect(binarySearch(sortedArrayOfObjects, { key: 1 }, comparator)).toBe(0)
    expect(binarySearch(sortedArrayOfObjects, { key: 2 }, comparator)).toBe(1)
    expect(binarySearch(sortedArrayOfObjects, { key: 3 }, comparator)).toBe(2)
  })
})
```

Запускаем тестирование:

```bash
npm run test ./algorithms/searches/__tests__/binary-search
```

Результат:

<img src="https://habrastorage.org/webt/eu/zu/ok/euzuoklqoskn2emaveuxx_b7wws.png" />
<br />

Такие варианты двоичного поиска предлагают разработчики VSCode:

```javascript
// https://github.com/microsoft/vscode/blob/main/src/vs/base/common/arrays.ts#L73
export function binarySearch(array, key, comparator) {
	return binarySearch2(array.length, i => comparator(array[i], key));
}

export function binarySearch2(length, compareToKey) {
	let low = 0,
		high = length - 1;

	while (low <= high) {
		const mid = ((low + high) / 2) | 0;
		const comp = compareToKey(mid);
		if (comp < 0) {
			low = mid + 1;
		} else if (comp > 0) {
			high = mid - 1;
		} else {
			return mid;
		}
	}
	return -(low + 1);
}

// Тоже самое, но в форме одной функции
// https://github.com/microsoft/vscode/blob/main/extensions/html-language-features/server/src/utils/arrays.ts#L60
export function binarySearch(array, key, comparator) {
	let low = 0,
		high = array.length - 1;

	while (low <= high) {
		const mid = ((low + high) / 2) | 0;
		const comp = comparator(array[mid], key);
		if (comp < 0) {
			low = mid + 1;
		} else if (comp > 0) {
			high = mid - 1;
		} else {
			return mid;
		}
	}
	return -(low + 1);
}
```
