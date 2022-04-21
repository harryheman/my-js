---
sidebar_position: 27
---

# Markdown

_Обратите внимание_: во многих случах в `MD-файлах` можно использовать обычный `HTML` - "парсеры" неплохо справляются с его преобразованием в `MD`.

## Заголовки

```
# Heading level 1
## Heading level 2 etc.
```

Или

```
Heading level 1
===
Heading level 2
---
```

---

## Параграфы

```
Paragraph

Multiline <br />
paragraph
```

---

## Стилизация текста

Полужирный

```
**Bold**
__Bold__
```

Курсив

```
*Italic*
_Italic_
```

Полужирный курсив

```
***BoldItalic***
___BoldItalic___
```

Перечеркнутый

```
~~Linethrough~~
```

---

## Цитаты

```
> Blockquote
>> NestedBlockquote
```

---

## Списки

Упорядоченный (нумерованный) список

```
1. Ordered
2. List
   1. Nested
   2. Ordered
   3. List
```

Неупорядоченный

```
- Unordered
- List

* Unordered
* List
```

```
+ Unordered
+ List
  - Nested
  * Unordered
  + List
```

Экранирование

```
\- Not
\* Unordered
\+ List
```

---

## Изображения

```
![image](path/to/image.png)
```

---

## Горизонтальные линии

```
***
---
___
```

---

## Ссылки

```
[link](http://example.com)
[link](http://example.com 'Title')

// как правило, ссылки генерируются автоматически

http://example.com

<http://example.com>
<email@whatever.com>

[link](#id)

# <a name="#id"></a> Anchor

<div align="right">
  <b><a href="#">↥ Top</a></b>
</div>
```

Изображения-ссылки (ссылки в виде изображений)

```
[![image&link](path/to/image.png 'Title')](http://example.com)
```

---

## Таблицы

```
| This | is    |
| ---  | ---   |
| a    | Table |

// отступы в строках (колонках) таблицы особого значения не имеют

| Left | Center | Right |
| :-- | :-: | --: |
| O | M | G |
```

---

## Код


```
`code`
```

Обратный слеш используется для экранирования

```
\```
{
  name: 'John',
  age: 30
}
\```
```

```json
\```json
{
  "name": "John",
  "age": 30
}
\```
```

```html
<!-- html вместо json после трех обратных кавычек (```) -->
<body>
  <figure class="user_card">
    <img src="path/to/image.png" alt="#" />
    <figcaption>{user.name}</figcaption>
  </figure>
</body>
```

```js
// javascript вместо json...
const user = {
  name: 'John',
  age: 30
}
```

---

## Сноски

```
Footnote?[^1]

[^1]: Yes, it is.
```

## Термины и определения

```
First term
: First definition
Second term
: Second definition
```

## Списки задач

```
- [x] Eat
- [ ] Sleep
- [ ] Repeat
```

## Эмоджи (эмодзи, смайлы) :smile:

```
:smile:
```

[Список эмодзи для Github](https://gist.github.com/rxaviers/7360908)
