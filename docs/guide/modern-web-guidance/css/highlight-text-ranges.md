# Подсветка диапазона текста

CSS Custom Highlight API позволяет стилизовать диапазоны текста на странице без модификации структуры DOM. Это позволяет реализовать подсветку результатов поиска, подсветку синтаксиса, стилизацию курсоров при совместном редактировании документа или маркеров проверки правописания или грамматики без оборачивания текста в дополнительные элементы или использования `innerHTML`.

## Основы

Для подсветки текстовых диапазонов необходимо собрать целевые текстовые узлы, создать объекты `Range` и `Highlight`, зарегистрировать их в `HighlightRegistry` и стилизовать их с помощью псевдоэлемента `::highlight()`.

### 1. Сбор текстовых узлов и создание диапазонов

Используйте `TreeWalker` для сбора всех текстовых узлов в целевом элементе, затем создайте объекты `Range`, указывающие на символы для подсветки:

```javascript
const article = document.querySelector("article");

// Используйте TreeWalker для сбора текстовых узлов - не манипулируйте innerHTML.
const treeWalker = document.createTreeWalker(article, NodeFilter.SHOW_TEXT);
const allTextNodes = [];
let currentNode = treeWalker.nextNode();
while (currentNode) {
  allTextNodes.push(currentNode);
  currentNode = treeWalker.nextNode();
}

// Устанавливайте начало/конец диапазона на текстовых узлах, а не на элементах.
const range = new Range();
range.setStart(textNode, matchStartIndex);
range.setEnd(textNode, matchEndIndex);
```

Кешируйте список текстовых узлов и повторно собирайте его только при реальном изменении содержимого DOM, поскольку обход дерева является дорогой операцией.

### 2. Создание Highlight на основе диапазонов

Сгруппируйте один или несколько объектов `Range` в объект `Highlight`. Несколько диапазонов, использующих одинаковые стили, принадлежат одной подсветке.

```javascript
const searchHighlight = new Highlight(...matchingRanges);
```

### 3. Регистрация подсветки в реестре

Зарегистрируйте каждый `Highlight` с уникальным названием с помощью `CSS.highlights`, который является `HighlightRegistry`, похожим на `Map`:

```javascript
// Очищаем предыдущие подсветки перед регистрацией новых
// во избежание сохранения на странице устаревших диапазонов.
CSS.highlights.clear();

CSS.highlights.set("search-results", searchHighlight);
```

При наложении нескольких подсветок, используйте свойство `priority` для управления стеком. Подсветка с более высоким приоритетом рисуется сверху:

```javascript
const primary = new Highlight(...primaryRanges);
primary.priority = 1;

const secondary = new Highlight(...secondaryRanges);
secondary.priority = 0; // рисуется первым (под primary)

CSS.highlights.set("primary", primary);
CSS.highlights.set("secondary", secondary);
```

### 4. Стилизация с помощью `::highlight()`

Используйте псевдоэлемент `::highlight()` CSS для стилизации каждой зарегистрированной подсветки по имени:

```css
::highlight(search-results) {
  background-color: #ffdd00;
  color: black;
}
```

Внутри `::highlight()` работает только ограниченный набор свойств CSS: `color`, `background-color`, `text-decoration` и их аналоги, `text-shadow`, `-webkit-text-stroke-color`, `-webkit-text-fill-color` и `-webkit-text-stroke-width`. Такие свойства, как `background-image`, `font-size` или `padding`, игнорируются.

## Поддержка и страховка

Данный API поддерживается всеми основными браузерами с марта 2026 года.

Поддержку можно определить следующим образом:

```javascript
if (CSS.highlights) {
  // CSS Custom Highlight API поддерживается.
} else {
  // Резерв: оборачиваем совпадения в элементы <mark>.
}
```

Если подсветка является критичной для пользовательского опыта, резервом является оборачивание совпавшего текста в элементы `<mark>`. Это модифицирует DOM, поэтому позаботьтесь о сохранении обработчиков событий и избежании поломки структуры документа.

```javascript
if (!CSS.highlights) {
  // Обходим текстовые узлы и оборачиваем совпадения в <mark>, сохраняя структуру.
  const walker = document.createTreeWalker(article, NodeFilter.SHOW_TEXT);
  const nodes = [];
  for (let n = walker.nextNode(); n; n = walker.nextNode()) nodes.push(n);

  const term = searchTerm.toLowerCase();
  for (const textNode of nodes) {
    const text = textNode.textContent;
    let pos = text.toLowerCase().indexOf(term);
    if (pos === -1) continue;

    const frag = document.createDocumentFragment();
    let last = 0;
    while (pos !== -1) {
      frag.append(text.slice(last, pos));
      const mark = document.createElement("mark");
      // Использование textContent позволяет избежать инъекций HTML.
      mark.textContent = text.slice(pos, pos + term.length);
      frag.append(mark);
      last = pos + term.length;
      pos = text.toLowerCase().indexOf(term, last);
    }
    frag.append(text.slice(last));
    textNode.replaceWith(frag);
  }
}
```
