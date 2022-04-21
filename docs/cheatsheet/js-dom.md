---
sidebar_position: 3
title: Шпаргалка по методам JavaScript для работы с DOM
description: Шпаргалка по методам JavaScript для работы с DOM
keywords: ['javascript', 'js', 'document object model', 'dom', 'methods', 'method', 'cheatsheet', 'шпаргалка', 'объектная модель документа', 'методы', 'метод']
---

# JavaScript DOM

Основные источники:

- [DOM Living Standart](https://dom.spec.whatwg.org/)
- [HTML Living Standart](https://html.spec.whatwg.org/multipage/dom.html)
- [Document Object Model (DOM) Level 3 Core Specification](https://www.w3.org/TR/2004/REC-DOM-Level-3-Core-20040407/)
- [DOM Parsing and Serialization](https://w3c.github.io/DOM-Parsing/#extensions-to-the-element-interface)

## Введение

`JavaScript` предоставляет множество методов для работы с `Document Object Model` или сокращенно `DOM` (объектной моделью документа): одни из них являются более полезными, чем другие; одни используются часто, другие почти никогда; одни являются относительно новыми, другие признаны устаревшими.

Я постараюсь дать вам исчерпывающее представление об этих методах, а также покажу парочку полезных приемов, которые сделают вашу жизнь веб-разработчика немного легче.

Размышляя над подачей материала, я пришел к выводу, что оптимальным будет следование спецификациям с промежуточными и заключительными выводами, сопряженными с небольшими лирическими отступлениями.

Сильно погружаться в теорию мы не будем. Вместо этого, мы сосредоточимся на практической составляющей.

Для того, чтобы получить максимальную пользу от данной шпаргалки, пишите код вместе со мной и внимательно следите за тем, что происходит в консоли инструментов разработчика и на странице.

Вот как будет выглядеть наша начальная разметка:

```html
<ul id="list" class="list">
  <li id="item1" class="item">1</li>
  <li id="item2" class="item">2</li>
  <li id="item3" class="item">3</li>
</ul>
```

У нас есть список (`ul`) с тремя элементами (`li`). Список и каждый элемент имеют идентификатор (`id`) и CSS-класс (`class`). `id` и `class` - это атрибуты элемента. Существует множество других атрибутов: одни из них являются глобальными, т.е. могут добавляться к любому элементу, другие - локальными, т.е. могут добавляться только к определенным элементам.

Мы часто будем выводить данные в консоль, поэтому создадим такую "утилиту":

```js
const log = console.log
```

## Миксин `NonElementParentNode`

Данный миксин предназначен для обработки (браузером) родительских узлов, которые не являются элементами.

В чем разница между узлами (nodes) и элементами (elements)? Если кратко, то "узлы" - это более общее понятие, чем "элементы". Узел может быть представлен элементом, текстом, комментарием и т.д. Элемент - это узел, представленный разметкой (HTML-тегами (открывающим и закрывающим) или, соответственно, одним тегом).

У рассматриваемого миксина есть метод, наследуемый от объекта `Document`, с которого удобно начать разговор.

Небольшая оговорка: разумеется, мы могли бы создать список и элементы программным способом.

Для создания элементов используется метод `createElement(tag)` объекта `Document`:

```js
const listEl = document.createElement('ul')
```

Такой способ создания элементов называется императивным. Он является не очень удобным и слишком многословным: создаем родительский элемент, добавляет к нему атрибуты по одному, внедряем его в `DOM`, создаем первый дочерний элемент и т.д. Следует отметить, что существует и другой, более изысканный способ создания элементов - шаблонные или строковые литералы (template literals), но о них мы поговорим позже.

Одним из основных способов получения элемента (точнее, ссылки на элемент) является метод `getElementById(id)` объекта `Document`:

```js
// получаем ссылку на наш список
const listEl = document.getElementById('list')
log(listEl)
// ul#list.list - такая запись означает "элемент `ul` с `id === list`" и таким же `class`
```

Почему идентификаторы должны быть уникальными в пределах приложения (страницы)? Потому что элемент с `id` становится значением одноименного свойства глобального объекта `window`:

```js
log(listEl === window.list) // true
```

Как мы знаем, при обращении к свойствам и методам `window`, слово `window` можно опускать, например, вместо `window.localStorage` можно писать просто `localStorage`. Следовательно, для доступа к элементу с `id` достаточно обратиться к соответствующему свойству `window`:

```js
log(list) // ul#list.list
```

Обратите внимание, что это не работает в `React` и других фреймворках, абстрагирующих работу с `DOM`, например, с помощью `Virtual DOM`. Более того, там иногда невозможно обратиться к нативным свойствам и методам `window` без `window`.

## Миксин ParentNode

Данный миксин предназначен для обработки родительских элементов (предков), т.е. элементов, содержащих одного и более потомка (дочерних элементов).

- `children` - потомки элемента

```js
const { children } = list // list.children
log(children)
/*
HTMLCollection(3)
  0: li#item1.item
  1: li#item2.item
  2: li#item3.item
  length: 3
*/
```

Такая структура называется <a href="https://dom.spec.whatwg.org/#interface-htmlcollection">коллекцией HTML</a> и представляет собой массивоподобный объект (псевдомассив). Существует еще одна похожая структура - <a href="https://dom.spec.whatwg.org/#interface-nodelist">список узлов (`NodeList`)</a>.

Массивоподобные объекты имеют свойство `length` с количеством потомков, метод `forEach()` (`NodeList`), позволяющий перебирать узлы (делать по ним итерацию). Такие объекты позволяют получать элементы по индексу, по названию (`HTMLCollection`) и т.д. Однако, у них отсутствуют методы настоящих массивов, такие как `map()`, `filter()`, `reduce()` и др., что делает работу с ними не очень удобной. Поэтому массивоподобные объекты рекомендуется преобразовывать в массивы с помощью метода `Array.from()` или spread-оператора:

```js
const children = Array.from(list.children)
// или
const children = [...list.children]
log(children) // [li#item1.item, li#item2.item, li#item3.item] - обычный массив
```

- `firstElementChild` - первый потомок - элемент
- `lastElementChild` - последний потомок - элемент

```js
log(list.firstElementChild) // li#item1.item
log(list.lastElementChild) // li#item2.item
```

Для дальнейших манипуляций нам потребуется периодически создавать новые элементы, поэтому создадим еще одну утилиту:

```js
const createEl = (id, text, tag = 'li', _class = 'item') => {
  const el = document.createElement(tag)
  el.id = id
  el.className = _class
  el.textContent = text
  return el
}
```

Наша утилита принимает 4 аргумента: идентификатор, текст, название тега и CSS-класс. 2 аргумента (тег и класс) имеют значения по умолчанию. Функция возвращает готовый к работе элемент. Впоследствии, мы реализует более универсальный вариант данной утилиты.

- `prepend(newNode)` - добавляет элемент в начало списка
- `append(newNode)` - добавляет элемент в конец списка

```js
// создаем новый элемент
const newItem = createEl('item0', 0)
// и добавляем его в начало списка
list.prepend(newItem)

// создаем еще один элемент
const newItem2 = createEl('item4', 4)
// и добавляем его в конец списка
list.append(newItem2)

log(children)
/*
HTMLCollection(5)
  0: li#item0.item
  1: li#item1.item
  2: li#item2.item
  3: li#item3.item
  4: li#item4.item
*/
```

Одной из интересных особенностей `HTMLCollection` является то, что она является "живой", т.е. элементы, возвращаемые по ссылке, и их количество обновляются автоматически. Однако, эту особенность нельзя использовать, например, для автоматического добавления обработчиков событий.

- `replaceChildren(nodes)` - заменяет потомков новыми элементами

```js
const newItems = [newItem, newItem2]
// заменяем потомков новыми элементами
list.replaceChildren(...newItems) // list.replaceChildren(newItem, newItem2)

log(children) // 2
```

Наиболее универсальными способами получения ссылок на элементы являются методы `querySelector(selector)` и `querySelectorAll(selector)`. Причем, в отличие от `getElementById()`, они могут вызываться на любом родительском элементе, а не только на `document`. В качестве аргумента названным методам передается любой валидный CSS-селектор (`id`, `class`, `tag` и т.д.):

```js
// получаем элемент `li` с `id === item0`
const itemWithId0 = list.querySelector('#item0')
log(itemWithId0) // li#item0.item

// получаем все элементы `li` с `class === item`
const allItems = list.querySelectorAll('.item')
log(allItems) // массивоподобный объект
/*
NodeList(2)
  0: li#item0.item
  1: li#item4.item
  length: 2
*/
```

Создадим универсальную утилиту для получения элементов:

```js
const getEl = (selector, parent = document, single = true) => single ? parent.querySelector(selector) : [...parent.querySelectorAll(selector)]
```

Наша утилита принимает 3 аргумента: CSS-селектор, родительский элемент и индикатор количества элементов (один или все). 2 аргумента (предок и индикатор) имеют значения по умолчанию. Функция возвращает либо один, либо все элементы (в виде обычного массива), совпадающие с селектором, в зависимости от значения индикатора:

```js
const itemWithId0 = getEl('#item0', list)
log(itemWithId0) // li#item0.item

const allItems = getEl('.item', list, false)
log(allItems) // [li#item0.item, li#item4.item]
```

## Миксин `NonDocumentTypeChildNode`

Данный миксин предназначен для обработки дочерних узлов, которые не являются документом, т.е. всех узлов, кроме `document`.

- `previousElementSibling` - предыдущий элемент
- `nextElementSibling` - следующий элемент

```js
log(itemWithId0.previousElementSibling) // null
log(itemWithId0.nextElementSibling) // #item4
```

## Миксин `ChildNode`

Данный миксин предназначен для обработки дочерних элементов, т.е. элементов, являющихся потомками других элементов.

- `before(newNode)` - вставляет новый элемент перед текущим
- `after(newNode)`- вставляет новый элемент после текущего

```js
// получаем `li` с `id === item4`
const itemWithId4 = getEl('#item4', list)
// создаем новый элемент
const newItem3 = createEl('item3', 3)
// и вставляем его перед `itemWithId4`
itemWithId4.before(newItem3)

// создаем еще один элемент
const newItem4 = createEl('item2', 2)
// и вставляем его после `itemWithId0`
itemWithId0.after(newItem4)
```

- `replaceWith(newNode)` - заменяет текущий элемент новым

```js
// создаем новый элемент
const newItem5 = createEl('item1', 1)
// и заменяем им `itemWithId0`
itemWithId0.replaceWith(newItem5)
```

- `remove()` - удаляет текущий элемент

```js
itemWithId4.remove()
```

## Интерфейс `Node`

Данный интерфейс предназначен для обработки узлов.

- `nodeType` - тип узла

```js
log(list.nodeType) // 1

// другие варианты
/*
 1 -> ELEMENT_NODE (элемент)
 3 -> TEXT_NODE (текст)
 8 -> COMMENT_NODE (комментарий)
 9 -> DOCUMENT_NODE (document)
 10 -> DOCUMENT_TYPE_NODE (doctype)
 11 -> DOCUMENT_FRAGMENT_NODE (фрагмент) и т.д.
*/
```

- `nodeName` - название узла

```js
log(list.nodeName) // UL

// другие варианты
/*
  - квалифицированное название HTML-элемента прописными (заглавными) буквами
  - квалифицированное название атрибута
  - #text
  - #comment
  - #document
  - название doctype
  - #document-fragment
*/
```

- `baseURI` - основной путь

```js
log(list.baseURI) // .../dom/index.html
```

- `parentNode` - родительский узел
- `parentElement` - родительский элемент

```js
const itemWithId1 = getEl('#item1', list)

log(itemWithId1.parentNode) // #list
log(itemWithId1.parentElement) // #list
```

- `hasChildNodes()` - возвращает `true`, если элемент имеет хотя бы одного потомка
- `childNodes` - дочерние узлы

```js
log(list.hasChildNodes()) // true
log(list.childNodes)
/*
NodeList(3)
  0: li#item1.item
  1: li#item2.item
  2: li#item3.item
*/
```

- `firstChild` - первый потомок - узел
- `lastChild` - последний потомок - узел

```js
log(list.firstChild) // #item1
log(list.lastChild) // #item3
```

- `nextSibling` - следующий узел
- `previousSibling` - предыдущий узел

```js
log(itemWithId1.nextSibling) // #item2
log(itemWithId1.previousSibling) // null
```

- `textContent` - геттер/сеттер для извлечения/записи текста

```js
// получаем текст
log(itemWithId1.textContent) // 1
// меняем текст
itemWithId1.textContent = 'item1'
log(itemWithId1.textContent) // item1

// получаем текстовое содержимое всех потомков
log(list.textContent) // item123
```

Для извлечения/записи текста существует еще один (устаревший) геттер/сеттер - `innerText`.

- `cloneNode(deep)` - копирует узел. Принимает логическое значение, определяющее характер копирования: поверхностное - копируется только сам узел, глубокое - копируется сам узел и все его потомки

```js
// создаем новый список посредством копирования существующего
const newList = list.cloneNode(false)
// удаляем у него `id` во избежание коллизий
newList.removeAttribute('id')
// меняем его текстовое содержимое
newList.textContent = 'new list'
// и вставляем его после существующего списка
list.after(newList)

// создаем еще один список
const newList2 = newList.cloneNode(true)
newList.after(newList2)
```

- `isEqualNode(node)` - сравнивает узлы
- `isSameNode(node)` - определяет идентичность узлов

```js
log(newList.isEqualNode(newList2)) // true
log(newList.isSameNode(newList2)) // false
```

- `contains(node)` - возвращает `true`, если элемент содержит указанный узел

```js
log(list.contains(itemWithId1)) // true
```

- `insertBefore(newNode, existingNode)` - добавляет новый узел (`newNode`) перед существующим (`existingNode`)

```js
// создаем новый элемент
const itemWithIdA = createEl('#item_a', 'a')
// и вставляем его перед `itemWithId1`
list.insertBefore(itemWithIdA, itemWithId1)
```

- `appendChild(node)` - добавляет узел в конец списка

```js
// создаем новый элемент
const itemWithIdC = createEl('#item_c', 'c')
// и добавляем его в конец списка
list.appendChild(itemWithIdC)
```

- `replaceChild(newNode, existingNode)` - заменяет существующий узел (`existingNode`) новым (`newNode`):

```js
// создаем новый элемент
const itemWithIdB = createEl('item_b', 'b')
// и заменяем им `itemWithId1`
list.replaceChild(itemWithIdB, itemWithId1)
```

- `removeChild(node)` - удаляет указанный дочерний узел

```js
// получаем `li` с `id === item2`
const itemWithId2 = getEl('#item2', list)
// и удаляем его
list.removeChild(itemWithId2)
```

## Интерфейс `Document`

Данный интерфейс предназначен для обработки объекта `Document`.

- `URL` и `documentURI` - адрес документа

```js
log(document.URL) // .../dom/index.html
log(document.documentURI) // ^
```

- `documentElement`:

```js
log(document.documentElement) // html
```

- `getElementsByTagName(tag)` - возвращает все элементы с указанным тегом

```js
const itemsByTagName = document.getElementsByTagName('li')
log(itemsByTagName)
/*
HTMLCollection(4)
  0: li##item_a.item
  1: li#item_b.item
  2: li#item3.item
  3: li##item_c.item
*/
```

- `getElementsByClassName(className)` - возвращает все элементы с указанным CSS-классом

```js
const itemsByClassName = list.getElementsByClassName('item')
log(itemsByClassName) // ^
```

- `createDocumentFragment()` - возвращает фрагмент документа:

```js
// создаем фрагмент
const fragment = document.createDocumentFragment()
// создаем новый элемент
const itemWithIdD = createEl('item_d', 'd')
// добавляем элемент во фрагмент
fragment.append(itemWithIdD)
// добавляем фрагмент в список
list.append(fragment)
```

Фрагменты позволяют избежать создания лишних элементов. Они часто используются при работе с разметкой, скрытой от пользователя с помощью тега `template` (метод `cloneNode()` возвращает `DocumentFragment`).

- `createTextNode(data)` - создает текст

- `createComment(data)` - создает комментарий

- `importNode(existingNode, deep)` - создает новый узел на основе существующего

```js
// создаем новый список на основе существующего
const newList3 = document.importNode(list, true)
// вставляем его перед существующим списком
list.before(newList3)
// и удаляем во избежание коллизий
newList3.remove()
```

- `createAttribute(attr)` - создает указанный атрибут

## Интерфейсы `NodeIterator` и `TreeWalker`

Интерфейсы <a href="https://dom.spec.whatwg.org/#interface-nodeiterator">`NodeIterator`</a> и <a href="https://dom.spec.whatwg.org/#interface-treewalker">`TreeWalker`</a> предназначены для обхода (traverse) деревьев узлов. Я не сталкивался с примерами их практического использования, поэтому ограничусь парочкой примеров:

```js
// createNodeIterator(root, referenceNode, pointerBeforeReferenceNode, whatToShow, filter)
const iterator = document.createNodeIterator(list)
log(iterator)
log(iterator.nextNode()) // #list
log(iterator.nextNode()) // #item_a
log(iterator.previousNode()) // #item_a
log(iterator.previousNode()) // #list
log(iterator.previousNode()) // null

// createTreeWalker(root, whatToShow, filter)
// применяем фильтры - https://dom.spec.whatwg.org/#interface-nodefilter
const walker = document.createTreeWalker(list, '0x1', { acceptNode: () => 1 })
log(walker)
log(walker.parentNode()) // null
log(walker.firstChild()) // #item_a
log(walker.lastChild()) // null
log(walker.previousSibling()) // null
log(walker.nextSibling()) // #item_b
log(walker.nextNode()) // #item3
log(walker.previousNode()) // #item_b
```

## Интерфейс `Element`

Данный интерфейс предназначен для обработки элементов.

- `localName` и `tagName` - название тега

```js
log(list.localName) // ul
log(list.tagName) // UL
```

- `id` - геттер/сеттер для идентификатора
- `className` - геттер/сеттер для CSS-класса

```js
log(list.id) // list
list.id = 'LIST'
log(LIST.className) // list
```

- `classList` - все CSS-классы элемента (объект `DOMTokenList`)

```js
const button = createEl('button', 'Click me', 'my_button', 'btn btn-primary')
log(button.classList)
/*
DOMTokenList(2)
  0: "btn"
  1: "btn-primary"
  length: 2
  value: "btn btn-primary"
*/
```

### Работа с `classList`

- `classList.add(newClass)` - добавляет новый класс к существующим
- `classList.remove(existingClass)` - удаляет указанный класс
- `classList.toggle(className, force?)` - удаляет существующий класс или добавляет новый. Если опциональный аргумент `force` имеет значение `true`, данный метод только добавляет новый класс при отсутствии, но не удаляет существующий класс (в этом случае `toggle() === add()`). Если `force` имеет значение `false`, данный метод только удаляет существующий класс при наличии, но не добавляет отсутствующий класс (в этом случае `toggle() === remove()`)
- `classList.replace(existingClass, newClass)` - заменяет существующий класс (`existingClass`) на новый (`newClass`)
- `classList.contains(className)` - возвращает `true`, если указанный класс обнаружен в списке классов элемента (данный метод идентичен `className.includes(className)`)

```js
// добавляем к кнопке новый класс
button.classList.add('btn-lg')
// удаляем существующий класс
button.classList.remove('btn-primary')
// у кнопки есть класс `btn-lg`, поэтому он удаляется
button.classList.toggle('btn-lg')
// заменяем существующий класс на новый
button.classList.replace('btn', 'btn-success')

log(button.className) // btn-success
log(button.classList.contains('btn')) // false
log(button.className.includes('btn-success')) // true
```

### Работа с атрибутами

- `hasAttributes()` - возвращает `true`, если у элемента имеются какие-либо атрибуты
- `getAttributesNames()` - возвращает названия атрибутов элемента
- `getAttribute(attrName)` - возвращает значение указанного атрибута
- `setAttribute(name, value)` - добавляет указанные атрибут и его значение к элементу
- `removeAttribute(attrName)` - удаляет указанный атрибут
- `hasAttribute(attrName)` - возвращает `true` при наличии у элемента указанного атрибута
- `toggleAttribute(name, force)` - добавляет новый атрибут при отсутствии или удаляет существующий атрибут. Аргумент `force` аналогичен одноименному атрибуту `classList.toggle()`

```js
log(button.hasAttributes()) // true
log(button.getAttributeNames()) // ['id', 'class']
log(button.getAttribute('id')) // button
button.setAttribute('type', 'button')
button.removeAttribute('class')
log(button.hasAttribute('class')) // false
```

В использовании перечисленных методов для работы с атрибутами нет особой необходимости, поскольку многие атрибуты являются геттерами/сеттерами, т.е. позволяют извлекать/записывать значения напрямую. Единственным исключением является метод `removeAttribute()`, поскольку существуют атрибуты без значений: например, если кнопка имеет атрибут `disabled`, установка значения данного атрибута в `false` не приведет к снятию блокировки - для этого нужно полностью удалить атрибут `disabled` с помощью `removeAttribute()`.

Отдельного упоминания заслуживает атрибут `data-*`, где символ `*` означает любую строку. Он предназначен для определения пользовательских атрибутов. Например, в нашей начальной разметке для уникальной идентификации элементов используется атрибут `id`. Однако, это приводит к загрязнению глобального пространства имен, что чревато коллизиями между нашими переменными и, например, переменными используемой нами библиотеки - когда какой-либо объект библиотеки пытается записаться в свойство `window`, которое уже занято нашим `id`.

Вместо этого, мы могли бы использовать атрибут `data-id` и получать ссылки на элементы с помощью `getEl('[data-id="id"]')`.

Название data-атрибута после символа `-` становится одноименным свойством объекта `dataset`. Например, значение атрибута `data-id` можно получить через свойство `dataset.id`.

- `closest(selectors)` - возвращает первый родительский элемент, совпавший с селекторами

```js
LIST.append(button)
log(button.closest('#LIST', 'document.body')) // #LIST
```

- `matches(selectors)` - возвращает `true`, если элемент совпадает хотя бы с одним селектором

```js
log(button.matches('.btn', '[type="button"]'))
// у кнопки нет класса `btn`, но есть атрибут `type` со значением `button`,
// поэтому возвращается `true`
```

- `insertAdjacentElement(where, newElement)` - универсальный метод для вставки новых элементов перед/в начало/в конец/после текущего элемента. Аргумент `where` определяет место вставки. Возможные значения:
  - `beforebegin` - перед открывающим тегом
  - `afterbegin` - после открывающего тега
  - `beforeend` - перед закрывающим тегом
  - `afterend` - после закрывающего тега

- `insertAdjacentText(where, data)` - универсальный метод для вставки текста

- `Text` - конструктор для создания текста
- `Comment` - конструктор для создания комментария

```js
const text = new Text('JavaScript')
log(text) // "JavaScript"

const part = text.splitText(4)
log(part) // "Script"
log(part.wholeText()) // Script

const comment = new Comment('TODO')
log(comment) // <!--TODO-->
```

## Объект `Document`

- `location` - объект с информацией о текущей локации документа

```js
log(document.location)
```

Свойства объекта `location`:

- `hash` - хэш-часть URL (символ `#` и все, что следует за ним), например, `#top`
- `host` - название хоста и порт, например, `localhost:3000`
- `hostname` - название хоста, например, `localhost`
- `href` - полный путь
- `origin` - `protocol` + `host`
- `pathname` - путь без протокола
- `port` - порт, например, `3000`
- `protocol` - протокол, например, `https`
- `search` - строка запроса (символ `?` и все, что следует за ним), например, `?name=John&age=30`

Методы `location`:

- `reload()` - перезагружает текущую локацию
- `replace()` - заменяет текущую локацию на новую

- `title` - заголовок документа

```js
log(document.title) // DOM
```

- `head` - метаданные документа
- `body` - тело документа

- `images` - псевдомассив (`HTMLCollection`), содержащий все изображения, имеющиеся в документе

```js
const image = document.createElement('img')
image.className = 'my_image'
image.src = 'https://miro.medium.com/max/875/1*ZIH_wjqDfZn6NRKsDi9mvA.png'
image.alt = "V8's compiler pipeline"
image.width = 480
document.body.append(image)
log(document.images[0]) // .my_image
```

- `links` - псевдомассив, содержащий все ссылки, имеющиеся в документе

```js
const link = document.createElement('a')
link.className = 'my_link'
link.href = 'https://github.com/azat-io/you-dont-know-js-ru'
link.target = '_blank'
link.rel = 'noopener noreferrer'
link.textContent = 'Вы не знаете JS'
document.body.append(link)
log(document.links[0]) // .my_link
```

- `forms` - псевдомассив, содержащий все формы, имеющиеся в документе

```js
const form = document.createElement('form')
form.className = 'my_form'
document.body.append(form)
log(document.forms[0]) // .my_form
```

Следующие методы и свойство считаются устаревшими:

- `open()` - открывает документ для записи. При этом документ полностью очищается
- `close()` - закрывает документ для записи
- `write()` - записывает данные (текст, разметку) в документ
- `writeln()` - записывает данные в документ с переносом на новую строку
- `designMode` - управление режимом редактирования документа. Возможные значения: `on` и `off`. Наберите `document.designMode = 'on'` в консоли `DevTools` и нажмите `Enter`. Вуаля, страница стала редактируемой: можно удалять/добавлять текст, перетаскивать изображения и т.д.
- `execCommand()` - выполняет переданные команды. Со списоком доступных команд можно ознакомиться <a href="https://developer.mozilla.org/ru/docs/Web/API/Document/execCommand">здесь</a>. Раньше этот метод активно использовался для записи/извлечения данных из буфера обмена (команды `copy` и `paste`). Сейчас для этого используются методы `navigator.clipboard.writeText()`, `navigator.clipboard.readText()` и др.

## Миксин `InnerHTML`

Геттер/сеттер `innerHTML` позволяет извлекать/записывать разметку в элемент. Для подготовки разметки удобно пользоваться шаблонными литералами:

```js
const itemsTemplate = `
  <li data-id="item1" class="item">1</li>
  <li data-id="item2" class="item">2</li>
  <li data-id="item3" class="item">3</li>
`
LIST.innerHTML = itemsTemplate
log(LIST.innerHTML)
/*
<li data-id="item1" class="item">1</li>
<li data-id="item2" class="item">2</li>
<li data-id="item3" class="item">3</li>
*/
```

## Расширения интерфейса `Element`

- `outerHTML` - геттер/сеттер для извлечения/записи внешней разметки элемента: то, что возвращает `innerHTML` + разметка самого элемента

```js
log(LIST.outerHTML)
/*
<ul id="LIST" class="list">
  <li data-id="item1" class="item">1</li>
  <li data-id="item2" class="item">2</li>
  <li data-id="item3" class="item">3</li>
</ul>
*/
```

- `insertAdjacentHTML(where, string)` - универсальный метод для вставки разметки в виде строки. Аргумент `where` аналогичен одноименному аргументу метода `insertAdjacentElement()`

Метод `insertAdjacentHTML()` в сочетании с шаблонными литералами и их продвинутой версией - тегированными шаблонными литералами (tagged template literals) предоставляет много интересных возможностей по манипулированию разметкой документа. По сути, данный метод представляет собой движок шаблонов (template engine) на стороне клиента, похожий на `Pug`, `Handlebars` и др. серверные движки. С его помощью (при участии `History API`) можно, например, реализовать полноценное одностраничное приложение (`Single Page Application` или сокращенно `SPA`). Разумеется, для этого придется написать чуть больше кода, чем при использовании какого-либо фронтенд-фреймворка.

Вот несколько полезных ссылок, с которых можно начать изучение этих замечательных инструментов:

- [Element.insertAdjacentHTML() - MDN](https://developer.mozilla.org/ru/docs/Web/API/Element/insertAdjacentHTML)
- [Изменение документа - JSR](https://learn.javascript.ru/modifying-document#prepend-append-before-after)
- [Шаблонные строки - MDN](https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Template_literals)
- [Template Literals - ECMAScript 2022](https://tc39.es/ecma262/#sec-template-literals)

Иногда требуется создать элемент на основе шаблонной строки. Как это можно сделать? Вот соответствующая утилита:

```js
const createElFromStr = (str) => {
  // создаем временный элемент
  const el = document.createElement('div')
  // записываем в него переданную строку - разметку
  el.innerHTML = str
  // извлекаем наш элемент
  // если мы используем здесь метод `firstChild()`, может вернуться `#text`
  // одна из проблем шаблонных строк заключается в большом количестве лишних пробелов
  const child = el.fisrtElementChild
  // удаляем временный элемент
  el.remove()
  // и возвращаем наш элемент
  return child
}

// шаблон списка
const listTemplate = `
<ul id="list">
  <li data-id="item1" class="item">1</li>
  <li data-id="item2" class="item">2</li>
  <li data-id="item3" class="item">3</li>
</ul>
`

// создаем список на основе шаблона
const listEl = createElFromStr(listTemplate)
// и вставляем его в тело документа
document.body.append(listEl)
```

Существует более экзотический способ создания элемента на основе шаблонной строки. Он предполагает использование конструктора <a href="https://html.spec.whatwg.org/multipage/dynamic-markup-insertion.html#dom-parsing-and-serialization">`DOMParser()`</a>:

```js
const createElFromStr = (str) => {
  // создаем новый парсер
  const parser = new DOMParser()
  // парсер возвращает новый документ
  const {
    body: { children }
  } = parser.parseFromString(str, 'text/html')
  // нас интересует первый дочерний элемент тела нового документа
  return children[0]
}

const listTemplate = `
<ul id="list">
  <li data-id="item1" class="item">1</li>
  <li data-id="item2" class="item">2</li>
  <li data-id="item3" class="item">3</li>
</ul>
`

const listEl = createElFromStr(listTemplate)
document.body.append(listEl)

```

Еще более экзотический, но при этом самый короткий способ предполагает использование <a href="https://w3c.github.io/DOM-Parsing/#extensions-to-the-range-interface">расширения для объекта `Range`</a> - метода `createContextualFragment()`:

```js
const createElFromStr = (str) => {
  // создаем новый диапазон
  const range = new Range()
  // создаем фрагмент
  const fragment = range.createContextualFragment(str)
  // и возвращаем его
  return fragment
}

// или в одну строку
const createFragment = (str) => new Range().createContextualFragment(str)

const listTemplate = `
<ul id="list">
  <li data-id="item1" class="item">1</li>
  <li data-id="item2" class="item">2</li>
  <li data-id="item3" class="item">3</li>
</ul>
`

document.body.append(createFragment(listTemplate))
```

В завершение, как и обещал, универсальная утилита для создания элементов:

```js
// функция принимает название тега и объект с настройками
const createEl = (tag, opts) => {
  const el = document.createElement(tag)
  // перебираем ключи объекта и записывает соответствующие свойства в элемент
  for (const key in opts) {
    el[key] = opts[key]
  }
  // возвращаем готовый элемент
  return el
}

const button = createEl('button', {
  // настройками могут быть атрибуты
  id: 'my_button',
  className: 'btn btn-primary',
  textContent: 'Click me',

  title: 'My button',
  autofocus: true,

  // стили
  style: 'color: red; cursor: pointer;',

  // обработчики и т.д.
  onmouseenter: function () {
    this.style.color = 'green'
  },
  onmouseout: function () {
    this.style.color = 'blue'
  },

  onclick: () => alert('Привет!')
})

document.body.append(button)
```
