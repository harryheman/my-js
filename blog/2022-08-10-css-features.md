---
slug: css-features
title: Заметка о полезных возможностях современного CSS
description: Заметка о полезных возможностях современного CSS
authors: harryheman
tags: [css, modern css, future css, features]
---

Привет, друзья!

В данной заметке я расскажу вам о некоторых полезных возможностях, предоставляемых современным `CSS`. Также мы немного поговорим о полезных "фичах", которые ждут нас в ближайшие 2 года.

"Полезный" означает, что я либо часто использую фичу в своих проектах, либо с нетерпением жду такой возможности.

<!--truncate-->

## Существующие возможности

Начнем с существующих возможностей, поддерживаемых большинством браузеров.

### :not()

Функция-псевдокласс [:not()](https://developer.mozilla.org/en-US/docs/Web/CSS/:not) позволяет стилизовать элементы, которые не совпадают ни с одним селектором из указанного списка. Список может состоять как из одного, так и из нескольких селекторов, разделенных запятыми. Селекторы могут быть как простыми, так и сложными.

__Синтаксис__

```css
:not(selector1, selector2, ...selectorN) {}
```

[Поддержка - 93.04%](https://caniuse.com/css-not-sel-list).

__Пример__

Предположим, что у нас имеется такой инпут:

```html
<input type="text" placeholder="Enter some text..." required />
```

Мы хотим, чтобы в невалидном состоянии границы этого поля были красного цвета. "Невалидность" поля можно стилизовать с помощью псевдокласса [:invalid](https://developer.mozilla.org/en-US/docs/Web/CSS/:invalid). При этом, стилизация невалидности не должна влиять на стилизацию наведения и фокусировки. Это можно реализовать следующим образом:

```css
input:invalid:not(:hover, :focus) {
  border-color: red;
}

/* отключаем подсветку */
:invalid {
  box-shadow: none;
}

:-moz-submit-invalid {
  box-shadow: none;
}

:-moz-ui-invalid {
  box-shadow: none;
}
```

__Лирическое отступление: стилизация `placeholder`__

Раньше заменители текста приходилось стилизовать так:

```css
input.placeholder {
  color: #0275d8;
  font-size: 0.8rem;
  opacity: 0.8;
}
input:-moz-placeholder {
  color: #0275d8;
  font-size: 0.8rem;
  opacity: 0.8;
}
input::-moz-placeholder {
  color: #0275d8;
  font-size: 0.8rem;
  opacity: 0.8;
}
input:-ms-input-placeholder {
  color: #0275d8;
  font-size: 0.8rem;
  opacity: 0.8;
}
input::-webkit-input-placeholder {
  color: #0275d8;
  font-size: 0.8rem;
  opacity: 0.8;
}
```

Сейчас это можно делать с помощью псевдокласса [::placeholder](https://developer.mozilla.org/ru/docs/Web/CSS/::placeholder) (спасибо @dynamicult):

```css
input::placeholder {
  color: #0275d8;
  font-size: 0.8rem;
  opacity: 0.8;
}
```

[Поддержка - 96.26%](https://caniuse.com/css-placeholder).

### :empty

Псевдокласс [:empty](https://developer.mozilla.org/en-US/docs/Web/CSS/:empty) позволяет стилизовать элементы, которые не имеют потомков. К потомкам относятся элементы, текст и (sic!) пробелы.

__Синтаксис__

```css
:empty {}
```

[Поддержка - 97.65%](https://caniuse.com/mdn-css_selectors_empty).

__Пример__

Предположим, что у нас имеется такой список ссылок:

```html
<ul>
  <li><a href="#">Link 1</a></li>
  <li>
    <a href="#" target="_blank" rel="noopener noreferrer">Link 2</a>
  </li>
  <li></li>
</ul>
```

С такими стилями:

```css
ul {
  display: inline-flex;
  flex-direction: column;
  /* отступы между элементами списка */
  gap: 0.5rem;
  list-style: none;
}
```

Допустим, что список формируется динамически и последний элемент по какой-то причине оказался пустым, например, в объекте не было `url` для ссылки. Тогда после второго элемента получим лишний отступ:

<img src="https://habrastorage.org/webt/3r/3v/sr/3r3vsrbkhsjahdahix94mkbx5aq.png" />
<br />

Скрываем пустые элементы списка с помощью `:empty`:

```css
li:empty {
  display: none;
}
```

Лишнего отступа больше нет:

<img src="https://habrastorage.org/webt/cd/gx/xi/cdgxxi-3ezzltby-jx98fhw3c1g.png" />
<br />

__Лирическое отступление: невидимый контент__

`display: none;` полностью скрывает элемент. Сделать элемент невидимым, но доступным для устройств чтения с экрана, можно следующим образом:

```css
.sr-only {
  background: none;
  border: none;
  color: none;
  cursor: none;
  height: 0;
  margin: 0;
  opacity: 0;
  outline: none;
  overflow: hidden;
  padding: 0;
  pointer-events: none;
  position: absolute;
  user-select: none;
  visibility: hidden;
  white-space: nowrap;
  width: 0;
  z-index: -1;
}
```

### :is() и :where()

Функции-псевдоклассы [:is()](https://developer.mozilla.org/en-US/docs/Web/CSS/:is) и [:where()](https://developer.mozilla.org/en-US/docs/Web/CSS/:where) позволяют стилизовать элементы, совпадающие с любым селектором из указанного списка. Список может состоять как из одного, так и из нескольких селекторов, разделенных запятыми. Селекторы могут быть как простыми, так и сложными.

Разница между `:is()` и `:where()` заключается в том, что `:is()` принимает специфичность самого конкретного селектора из списка, а специфичность `:where()` всегда равняется `0`.

__Синтаксис__

```css
:is(selector1, selector2, ...selectorN) {}
:where(selector1, selector2, ...selectorN) {}
```

[Поддержка :is() - 94.9%](https://caniuse.com/css-matches-pseudo).
[Поддержка :where() - 91.61%](https://caniuse.com/mdn-css_selectors_where).

__Пример__

Предположим, что мы хотим стилизовать ссылки, находящиеся только в шапке или подвале страницы:

```css
:is(header, footer) a:hover {
  color: green;
}
```

Для понимания того, насколько `:is()` и `:where()` могут уменьшить количество шаблонного кода, рекомендую взглянуть на [этот пример](https://developer.mozilla.org/en-US/docs/Web/CSS/:is#simplifying_list_selectors).

### :focus-within

Псевдокласс [:focus-within](https://developer.mozilla.org/ru/docs/Web/CSS/:focus-within) позволяет стилизовать элементы, которые либо сами находятся в фокусе (в этом случае `:focus-within` аналогичен псевдоклассу `:focus`), либо имеют потомков, находящихся в фокусе.

__Синтаксис__

```css
:focus-within {}
```

[Поддержка - 95.32%](https://caniuse.com/css-focus-within).

__Пример__

Предположим, что у нас имеется такой инпут с подписью и иконкой:

```html
<div class="form-field">
  <label>
    <span>Some text:</span>
    <input type="text" placeholder="Enter some text..." required />
  </label>
  <svg viewBox="0 0 60 60">
    <path
      d="M48.014,42.889l-9.553-4.776C37.56,37.662,37,36.756,37,35.748v-3.381c0.229-0.28,0.47-0.599,0.719-0.951
c1.239-1.75,2.232-3.698,2.954-5.799C42.084,24.97,43,23.575,43,22v-4c0-0.963-0.36-1.896-1-2.625v-5.319
c0.056-0.55,0.276-3.824-2.092-6.525C37.854,1.188,34.521,0,30,0s-7.854,1.188-9.908,3.53C17.724,6.231,17.944,9.506,18,10.056
v5.319c-0.64,0.729-1,1.662-1,2.625v4c0,1.217,0.553,2.352,1.497,3.109c0.916,3.627,2.833,6.36,3.503,7.237v3.309
c0,0.968-0.528,1.856-1.377,2.32l-8.921,4.866C8.801,44.424,7,47.458,7,50.762V54c0,4.746,15.045,6,23,6s23-1.254,23-6v-3.043
C53,47.519,51.089,44.427,48.014,42.889z"
      fill="currentColor"
    />
  </svg>
</div>
```

_Обратите внимание_ на значение атрибута `fill` элемента `path`.

И такими стилями:

```css
.form-field {
  color: darkslategray;
  position: relative;
  width: max-content;
}

.form-field label {
  align-items: center;
  display: flex;
}

.form-field input {
  border: 2px solid darkslategray;
  margin-left: 0.5rem;
  outline: none;
  padding: 0.5rem;
  /* отступ для иконки - 20px + 5px + 5px */
  padding-right: 30px;
}

.form-field svg {
  height: 20px;
  position: absolute;
  right: 5px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
}
```

<img src="https://habrastorage.org/webt/eo/sw/bs/eoswbsaynnllhvka3iayc-g-ur8.png" />
<br />

Допустим, что при наведении и фокусировке мы хотим менять цвет подписи, границы поля и заливки иконки.

С инпутом все просто:

```css
.form-field input:hover {
  border-color: deepskyblue;
}

.form-field input:focus {
  border-color: mediumseagreen;
}
```

С наведением тоже:

```css
.form-field:hover {
  color: deepskyblue;
}
```

<img src="https://habrastorage.org/webt/nx/5x/1-/nx5x1-wb4gqjxjcubojukrfsztu.png" />
<br />

Но следующее работать не будет, поскольку элемент `div` не является фокусируемым (focusable):

```css
.form-field:focus {
  color: mediumseagreen;
}
```

Здесь на помощь приходит `:focus-within`:

```css
.form-field:focus-within {
  color: mediumseagreen;
}
```

<iframe height="300" style={{width: '100%'}} scrolling="no" title="form-field" src="https://codepen.io/harryheman/embed/ZExvKWJ?default-tab=html%2Cresult" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href="https://codepen.io/harryheman/pen/ZExvKWJ">
  form-field</a> by Igor Agapov (<a href="https://codepen.io/harryheman">@harryheman</a>)
  on <a href="https://codepen.io">CodePen</a>.
</iframe>

### Scroll Snap

[Scroll Snap](https://drafts.csswg.org/css-scroll-snap/) позволяет реализовывать прокручиваемые слайдеры (scrollable sliders). Основными свойствами данной модели являются:

- [scroll-snap-type](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-snap-type) - определяет строгость привязки контейнера к контрольным точкам;
- [scroll-snap-align](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-snap-align) - определяет контрольные точки для прокрутки.

__Синтаксис (основные значения)__

```css
scroll-snap-type: x | y | both [mandatory | proximity];
scroll-snap-align: start | center | end;
```

[Поддержка scroll-snap-type - 94.98%](https://caniuse.com/mdn-css_properties_scroll-snap-type).
[Поддержка scroll-snap-align - 94.75%](https://caniuse.com/mdn-css_properties_scroll-snap-align).

__Пример__

Прокручиваемый слайдер с тремя изображениями котиков:

```html
<div class="slider">
  <img
    src="https://images.unsplash.com/photo-1529257414772-1960b7bea4eb?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80"
    alt=""
  />
  <img
    src="https://images.unsplash.com/photo-1598188306155-25e400eb5078?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1548&q=80"
    alt=""
  />
  <img
    src="https://images.unsplash.com/photo-1517331156700-3c241d2b4d83?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1768&q=80"
    alt=""
  />
</div>
```

```css
* {
  margin: 0;
}

body {
  align-items: center;
  display: flex;
  height: 100vh;
  justify-content: center;
  overflow: hidden;
}

.slider {
  display: flex;
  overflow-x: scroll;
  position: relative;
  /* ! */
  scroll-snap-type: x mandatory;
  /* стилизация скроллбара для Firefox */
  scrollbar-color: hotpink whitesmoke;
  scrollbar-width: thin;
  width: 480px;
}

.slider > img {
  object-fit: cover;
  /* ! */
  scroll-snap-align: start;
  width: 100%;
}

/* стилизация скроллбара для Webkit */
.slider::-webkit-scrollbar {
  height: 6px;
}

.slider::-webkit-scrollbar-track {
  background-color: whitesmoke;
}

.slider::-webkit-scrollbar-thumb {
  background-color: hotpink;
}
```

<iframe height="300" style={{width: '100%'}} scrolling="no" title="scroll-snap" src="https://codepen.io/harryheman/embed/ZExveNe?default-tab=html%2Cresult" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href="https://codepen.io/harryheman/pen/ZExveNe">
  scroll-snap</a> by Igor Agapov (<a href="https://codepen.io/harryheman">@harryheman</a>)
  on <a href="https://codepen.io">CodePen</a>.
</iframe>

### scroll-behavior

Свойство [scroll-behavior](https://developer.mozilla.org/ru/docs/Web/CSS/scroll-behavior), как следует из названия, определяет поведение прокрутки.

__Синтаксис (основные значения)__

```css
scroll-behavior: auto | smooth;
```

[Поддержка - 91.01%](https://caniuse.com/css-scroll-behavior).

__Пример__

Рассматриваемое свойство позволяет легко реализовать прокрутку к определенной позиции на странице без помощи `JavaScript`:

```html
<!-- якорь -->
<a id="top"></a>

<div class="page-content">
  <p>1</p>
  <p>2</p>
  <p>3</p>
  <p>4</p>
  <p>5</p>
</div>

<a href="#top" class="top-link">
  <img src="https://cdn-icons-png.flaticon.com/512/892/892692.png" alt="" />
</a>
```

```css
* {
  margin: 0;
}

html,
body {
  /* ! */
  scroll-behavior: smooth;
}

.page-content {
  display: flex;
  flex-direction: column;
}

p {
  display: grid;
  font-size: 4rem;
  height: 100vh;
  place-content: center;
}

.top-link {
  bottom: 1rem;
  left: 50%;
  position: fixed;
  transform: translateX(-50%);
}

.top-link img {
  width: 40px;
}
```

<iframe height="300" style={{width: '100%'}} scrolling="no" title="scroll-to-top" src="https://codepen.io/harryheman/embed/qBopmEK?default-tab=html%2Cresult" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href="https://codepen.io/harryheman/pen/qBopmEK">
  scroll-to-top</a> by Igor Agapov (<a href="https://codepen.io/harryheman">@harryheman</a>)
  on <a href="https://codepen.io">CodePen</a>.
</iframe>

### accent-color

Свойство [accent-color](https://developer.mozilla.org/en-US/docs/Web/CSS/accent-color) позволяет менять цвет таких элементов, как `<input type="checkbox" />`, `<input type="radio" />`, `<input type="range" />` и `<progress />`.

__Синтаксис__

```css
accent-color: auto | <color>;
```

[Поддержка - 87.04%](https://caniuse.com/mdn-css_properties_accent-color).

__Пример__

```html
<input type="checkbox" checked />
<input type="radio" checked />
<input type="range" min="0" max="10" value="5" />
<progress max="100" value="50"></progress>
```

```css
body {
  /* ! */
  accent-color: deepskyblue;
  align-items: start;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
```

<img src="https://habrastorage.org/webt/8_/rm/kr/8_rmkrgaqm8aq9iju4lmzl4h6bg.png" />
<br />

Теперь в простых случаях можно обходиться без создания кастомных чекбоксов, радио-кнопок и т.д.

## Будущие возможности

Теперь поговорим о наиболее интересных возможностях, которые ждут нас в ближайшем будущем.

### Вложенность

[Вложенность](https://www.w3.org/TR/css-nesting-1/) - одна из самых ожидаемых возможностей, давно реализованных в таких `CSS-препроцессорах`, как [Sass](https://sass-scss.ru/) и [Less](https://lesscss.org/).

Синтаксис похож на `Sass`, за исключением того, что использование символа `&` в качестве родительского селектора является обязательным.

__Пример__

```html
<article class="article">
  <h2 class="title">Title</h2>
  <div class="info">
    <p class="author">Author</p>
    <time datetime="2022-08-01" class="date">01.08.2022</time>
  </div>
  <p class="summary">Summary</p>
</article>
```

```css
/* стилизуем информацию об авторе статьи */
.article {
    & .info {
        /* .article .info .author */
        & .author {
          /* ... */
        }
    }
}
/* в Sass можно опускать `&` */
.article {
    .info {
        .author {
          /* ... */
        }
    }
}
```

Еще одно отличие от `Sass` состоит в том, что, судя по всему, в `CSS` нельзя будет "склеивать" селекторы. Например, если у нас имеется такая разметка:

```html
<article class="article">
  <h2 class="article__title">Title</h2>
</article>
```

В `Sass` стилизовать заголовок можно следующим образом:

```css
.article {
  &__title {
    /* ... */
  }
}
```

Если вас интересует более подробная информация о вложенности, рекомендую взглянуть на [эту статью](https://web-standards.ru/articles/css-nesting/).

### :has()

Функция-псевдокласс [:has()](https://developer.mozilla.org/ru/docs/Web/CSS/:has) предназначена для стилизации элементов, совпадающих хотя бы с одним селектором из списка, переданного в качестве аргумента. Прелесть данной функции состоит в том, что она позволяет стилизовать родительские элементы.

__Синтаксис__

```css
:has(selector1, selector2, ...selectorN) {}
```

__Примеры__

```css
/* стилизуем ссылки, которые содержат изображения в качестве непосредственных потомков */
a:has(> img) {}

/* стилизуем `img`, которые находятся в `figure`, которые имеют `figcaption` */
figure:has(figcaption) img {}
```

### color-mix()

Функция [color-mix](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color-mix) принимает 2 цвета и возвращает результат их смешивания в указанном цветовом пространстве и на указанный процент. Дефолтным цветовым пространством является `LCH`.

Синтаксис:

```css
color-mix(in <colorspace>?, <color1> <percentage>?, <color2> <percentage>?)
```

__Пример__

```html
<div class="box brand"></div>
<div class="box darken"></div>
<div class="box lighter"></div>
```

```css
:root {
  --brand: deepskyblue;
  /* ! */
  --darken: color-mix(var(--brand) 25%, #333);
  --lighter: color-mix(var(--brand) 25%, #eee);
}

.box {
  width: 100px;
  height: 100px;
}

.box.brand {
  background-color: var(--brand);
}

.box.darken {
  background-color: var(--darken);
}

.box.lighter {
  background-color: var(--lighter);
}
```

### @scope

Директива [@scope](https://www.w3.org/TR/css-scoping-1/) предназначена для определения области видимости стилей.

__Синтаксис__

```css
@scope <selector> {
  <stylesheet>
}
```

__Пример__

Вернемся к примеру из раздела про вложенность:

```css
.article {
    & .info {
        & .author {
          /* ... */
        }
    }
}
```

Если после этих стилей будет определено что-то вроде:

```css
.section {
    & .info {
        & .author {
          /* ... */
        }
    }
}
```

То специфичность селекторов `.article .info .author` и `.section .info .author` будет одинаковой и стили, определенные в `.section`, перезапишут стили, определенные в `.article`. `@scope` позволяет решить данную проблему за счет инкапсуляции стилей в собственной области видимости:

```css
@scope .article {
  /* стили применяются только к элементам, находящимся в элементе с классом `article` */
  & .info {
      & .author {
        /* ... */
      }
  }
}

@scope .section {
  /* стили применяются только к элементам, находящимся в элементе с классом `section` */
  & .info {
      & .author {
        /* ... */
      }
  }
}
```

Справедливости ради следует отметить, что на сегодняшний день существует еще одно средство для решения проблемы правильного порядка определения стилей - директива [@layer](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer), позволяющая определять так называемые каскадные слои стилей (cascade layers). Однако, на мой взгляд, эта директива больше подходит для использования в `CSS-фреймворках`, чем для локального применения. Например, `@layer` активно используется в таком фреймворке, как [TailwindCSS](https://tailwindcss.com/).

### selectmenu

Элемент [selectmenu](https://open-ui.org/prototypes/selectmenu) - это своего рода стилизуемый вариант элемента `select`.

__Синтаксис__

```css
selectmenu::part(<part>) {}
```

__Пример__

```html
<selectmenu class="select-menu">
  <option>Option 1</option>
  <option>Option 2</option>
  <option>Option 3</option>
</selectmenu>
```

```css
.select-menu::part(button) {
  background-color: #f00;
  border-radius: 5px;
  color: white;
  padding: 5px;
}

.select-menu::part(listbox) {
  border-radius: 5px;
  border: 1px solid red;
  margin-top: 5px;
  padding: 10px;
}
```

### anchor()

Последняя возможность, о которой я хочу рассказать, это функция [anchor()](https://github.com/MicrosoftEdge/MSEdgeExplainers/blob/main/CSSAnchoredPositioning/explainer.md).

Данная функция является альтернативой позиционированию элементов с помощью `position: relative` и `position: absolute`. Она позволяет привязывать одни элементы к другим независимо от их места в иерархии `DOM`.

`anchor()` также будет предоставлять возможность определять границы позиционирования и другие интересные фичи. Перейдите по ссылке, если хотите получить более подробную информацию о рассматриваемом интерфейсе (да, это целый интерфейс, а не одна функция).

Подробнее о новых и ожидаемых возможностях `CSS` можно почитать в [этой замечательной статье](https://web.dev/state-of-css-2022/).

Благодарю за внимание и happy coding!
