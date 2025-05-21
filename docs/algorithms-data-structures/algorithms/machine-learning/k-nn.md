---
sidebar_position: 3
title: Метод k ближайших соседей
description: Метод k ближайших соседей
keywords: ['javascript', 'js', 'algorithms', 'алгоритмы']
tags: ['javascript', 'js', 'algorithms', 'алгоритмы']
---

# Метод k ближайших соседей

__Описание__

- [Википедия](https://ru.wikipedia.org/wiki/%D0%9C%D0%B5%D1%82%D0%BE%D0%B4_k_%D0%B1%D0%BB%D0%B8%D0%B6%D0%B0%D0%B9%D1%88%D0%B8%D1%85_%D1%81%D0%BE%D1%81%D0%B5%D0%B4%D0%B5%D0%B9)
- [GeekForGeeks](https://www.geeksforgeeks.org/k-nearest-neighbours/)
- [Habr (код на Python)](https://habr.com/ru/articles/801885/)
- [YouTube](https://www.youtube.com/watch?v=wsUqBJ0zXYE)
- [GitHub](https://github.com/harryheman/algorithms-data-structures/blob/main/src/algorithms/machine-learning/k-nn.js)

Метод k ближайших соседей (k-nearest neighbors algorithm, k-NN) - метрический алгоритм для автоматической классификации объектов или регрессии. Он относится к методам машинного обучения с учителем (supervised).

В случае использования метода для классификации объект присваивается тому классу, который является наиболее распространённым среди `k` соседей данного элемента, классы которых уже известны. В случае использования метода для регрессии, объекту присваивается среднее значение по `k` ближайшим к нему объектам, значения которых уже известны. Мы будем говорить в основном о классификации.

Алгоритм может быть применим к выборкам с большим количеством атрибутов (многомерным). Для этого перед применением нужно определить функцию расстояния; классический вариант такой функции - [евклидова метрика](https://ru.wikipedia.org/wiki/%D0%95%D0%B2%D0%BA%D0%BB%D0%B8%D0%B4%D0%BE%D0%B2%D0%B0_%D0%BC%D0%B5%D1%82%D1%80%D0%B8%D0%BA%D0%B0).

<img src="https://habrastorage.org/webt/i_/4h/ql/i_4hqliq67go16a3922u6nv1b9q.png" />
_Использование теоремы Пифагора для вычисления евклидова расстояния на плоскости_
<br />

__Принцип работы__

- проверяется валидность данных и меток
- вычисляется евклидово расстояние между тестовым (целевым) и всеми обучающими образцами
- расстояния вместе с классами сортируются в возрастающем порядке
- выбирается `k` ближайших образцов (соседей), где число `k` задается заранее (как правило, выбирается нечетное число - 3, 5 и т.д.)
- итоговым прогнозом среди выбранных `k` ближайших соседей будет мода в случае классификации и среднее арифметическое в случае регрессии
- возвращается наиболее похожий класс (для классификации) или среднее значение (для регрессии)

Визуализация k-NN для лучшего понимания:

<img src="https://habrastorage.org/webt/i_/ow/ws/i_owwskzajk-3eyl7ok2cjl4dwg.png" />
_Пример классификации методом k-NN: тестовый образец (зеленый круг) должен быть классифицирован как синий квадрат (класс 1) или как красный треугольник (класс 2); если k=3, то он классифицируется как 2-й класс, потому что внутри меньшего круга 2 треугольника и только 1 квадрат; если k=5, то он будет классифицирован как 1-й класс (3 квадрата против 2 треугольников внутри большего круга)_
<br />

Еще одна визуализация:

<img src="https://habrastorage.org/webt/ar/gt/ai/argtaipkmpfxghwvkauvjqfgl6w.gif" />
_Здесь k = 7, поэтому тестовый образец классифицируется как зеленый треугольник_
<br />

И еще одна:

<img src="https://habrastorage.org/webt/rb/y6/cb/rby6cbeenzlbh8y5mopfhz7aa9m.png" />
_Звездочкой обозначен целевой образец_
<img src="https://habrastorage.org/webt/y5/ni/g9/y5nig9m7j9ss7n2frdfx_6r23ue.png" />
_k=3_
<img src="https://habrastorage.org/webt/kn/nr/ks/knnrksemprmbzb6bhzwynhhq1p0.png" />
_k=10_
<img src="https://habrastorage.org/webt/yv/ec/lv/yveclvo5luhp1_raoevkpeixwde.png" />
_k=20_

Как видим, во всех трех случаях целевой образец классифицируется как синий круг.

__Реализация__

```javascript
// algorithms/machine-learning/k-nn.js
// Функция для вычисления евклидова расстояния
import euclideanDistance from '../math/euclidean-distance'

/** Функция принимает:
 * data   - данные
 * labels - метки
 * target - тестовый/целевой образец
 * k      - количество ближайших соседей
 */
export default function kNN(data, labels, target, k = 3) {
  if (!data || !labels || !target) {
    throw new Error('Отсутствует обязательный параметр')
  }

  // Вычисляем расстояние от `target` до каждой точки `data`.
  // Сохраняем расстояние и метку точки в списке
  const distances = []

  for (let i = 0; i < data.length; i++) {
    distances.push({
      distance: euclideanDistance([data[i]], [target]),
      label: labels[i],
    })
  }

  // Сортируем расстояния по возрастанию (от ближайшего к дальнему).
  // Берем `k` значений
  const kn = distances
    .sort((a, b) => {
      if (a.distance === b.distance) {
        return 0
      }
      return a.distance < b.distance ? -1 : 1
    })
    .slice(0, k)

  // Считаем количество экземпляров каждого класса
  const _labels = {}
  let topClass = 0
  let topClassCount = 0

  for (let i = 0; i < kn.length; i++) {
    if (kn[i].label in _labels) {
      _labels[kn[i].label] += 1
    } else {
      _labels[kn[i].label] = 1
    }

    if (_labels[kn[i].label] > topClassCount) {
      topClassCount = _labels[kn[i].label]
      topClass = kn[i].label
    }
  }

  // Возвращает класс с наибольшим количеством экземпляров
  return topClass
}
```

<spoiler title="Тесты:">

```javascript
// algorithms/machine-learning/__tests__/k-nn.test.js
import kNN from '../k-nn'

describe('kNN', () => {
  it('при неправильных данных должно выбрасываться исключение', () => {
    expect(() => {
      kNN()
    }).toThrowError('Отсутствует обязательный параметр')
  })

  it('при неправильных метках должно выбрасываться исключение', () => {
    const noLabels = () => {
      kNN([[1, 1]])
    }
    expect(noLabels).toThrowError('Отсутствует обязательный параметр')
  })

  it('при отсутствии целевого образца должно выбрасываться исключение #1', () => {
    const noClassification = () => {
      kNN([[1, 1]], [1])
    }
    expect(noClassification).toThrowError('Отсутствует обязательный параметр')
  })

  it('при отсутствии целевого образца должно выбрасываться исключение #2', () => {
    const inconsistent = () => {
      kNN([[1, 1]], [1], [1])
    }
    expect(inconsistent).toThrowError('Матрицы имеют разную форму')
  })

  it('должен выполнить классификацию целевых образцов', () => {
    let dataSet
    let labels
    let toClassify
    let expectedClass

    dataSet = [
      [1, 1],
      [2, 2],
    ]
    labels = [1, 2]
    toClassify = [1, 1]
    expectedClass = 1
    expect(kNN(dataSet, labels, toClassify)).toBe(expectedClass)

    dataSet = [
      [1, 1],
      [6, 2],
      [3, 3],
      [4, 5],
      [9, 2],
      [2, 4],
      [8, 7],
    ]
    labels = [1, 2, 1, 2, 1, 2, 1]
    toClassify = [1.25, 1.25]
    expectedClass = 1
    expect(kNN(dataSet, labels, toClassify)).toBe(expectedClass)

    dataSet = [
      [1, 1],
      [6, 2],
      [3, 3],
      [4, 5],
      [9, 2],
      [2, 4],
      [8, 7],
    ]
    labels = [1, 2, 1, 2, 1, 2, 1]
    toClassify = [1.25, 1.25]
    expectedClass = 2
    expect(kNN(dataSet, labels, toClassify, 5)).toBe(expectedClass)
  })

  it('должен выполнить классификацию целевого образца с соседями на одинаковых расстояниях', () => {
    const dataSet = [
      [0, 0],
      [1, 1],
      [0, 2],
    ]
    const labels = [1, 3, 3]
    const toClassify = [0, 1]
    const expectedClass = 3
    expect(kNN(dataSet, labels, toClassify)).toBe(expectedClass)
  })

  it('должен выполнить классификацию целевого образца с соседями в трехмерном пространстве', () => {
    const dataSet = [
      [0, 0, 0],
      [0, 1, 1],
      [0, 0, 2],
    ]
    const labels = [1, 3, 3]
    const toClassify = [0, 0, 1]
    const expectedClass = 3
    expect(kNN(dataSet, labels, toClassify)).toBe(expectedClass)
  })
})
```

</spoiler>

Запускаем тесты:

```bash
npm run test ./algorithms/machine-learning/__tests__/k-nn
```

<img src="https://habrastorage.org/webt/zy/4m/is/zy4misoszeia7nn7y1whwvv0h-a.png" />
<br />
