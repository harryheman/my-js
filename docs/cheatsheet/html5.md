---
sidebar_position: 2
title: Шпаргалка по тегам HTML5
description: Шпаргалка по тегам HTML5
keywords: ['html5', 'html', 'tags', 'tag', 'cheatsheet', 'шпаргалка', 'теги', 'тег']
tags: ['html5', 'html', 'tags', 'tag', 'cheatsheet', 'шпаргалка', 'теги', 'тег']
---

# HTML5

## `abbr`

Тег `abbr` определяет <a href="https://ru.wikipedia.org/wiki/%D0%90%D0%B1%D0%B1%D1%80%D0%B5%D0%B2%D0%B8%D0%B0%D1%82%D1%83%D1%80%D0%B0">аббревиатуру</a> или <a href="https://ru.wikipedia.org/wiki/%D0%90%D0%BA%D1%80%D0%BE%D0%BD%D0%B8%D0%BC">акроним</a>. Аббревиатура или акроним расшифровываются с помощью атрибута `title`.

```html
<abbr title="HyperText Markup Language">HTML</abbr> был разработан британским ученым Тимом Бернерсом-Ли приблизительно в 1986—1991 годах.
```

`abbr` часто используется совместно с тегом `dfn`, идентифицирующим понятие или термин:

```html
<p><dfn><abbr title="Cascading Style Sheets">CSS</abbr></dfn> - формальный язык описания внешнего вида документа (веб-страницы).</p>
```

## `address`

Тег `address` определяет контактную информацию об авторе или владельце документа или статьи. Контактная информацию может включать в себя адрес электронной почты, адрес сайта, физический адрес, номер телефона, ссылки на аккаунты в социальных сетях и т.д.

```html
<address>
Автор статьи: <a href="mailto:ivan@mail.com">Иван Иванов</a><br />
Официальный сайт: <a href="http://example.com" target="_blank" rel="noopener noreferrer">Example.com</a><br />
Адрес: некоторое царство, некоторое государство
<address>
```

## `audio`

Тег `audio` используется для встраивания аудио-контента (музыка и др.) в веб-страницу.

Для определения аудио-источника используется либо атрибут `src`, либо тег `source`. Последний используется для определения нескольких источников, из которых браузер выбирает наиболее подходящий (для определения типа аудио-контента используется атрибут `type`).

Текст между `<audio>` и `</audio>` отображается только в случае, когда браузер не поддерживает элемент `audio`.

В настоящее время поддерживается три формата аудио: `MP3`, `WAV` и `OGG`.

Атрибуты:

- `autoplay` - автовоспроизведение (блокируется большинством браузеров)
- `controls` - панель управления (без этого атрибута элемент `audio`, скорее всего, не будет отображаться на странице)
- `loop` - определяет, что воспроизведение, после завершения, начнется сначала
- `muted` - воспроизведение без звука (позволяет преодолеть блокировку `autoplay`)
- `preload` - определяет, должен ли аудио-контент загружаться после загрузки страницы. Возможные значения: `auto`, `metadata`, `none`. Значение `none` не позволит работать с аудио с помощью `JavaScript`
- `src` - путь к аудиофайлу

```html
<audio controls>
  <source src="music.ogg" type="audio/ogg">
  <source src="music.mp3" type="audio/mpeg">
  Ваш браузер не поддерживает элемент "audio".
</audio>

<!-- или -->
<audio src="music.mp3" preload="metadata" controls muted loop>Ваш браузер не поддерживает элемент "audio".</audio>
```

## `video`

Тег `video` используется для встраивания видео-контента (видеоклип и др.) в веб-страницу.

Для определения видео-источника используется либо атрибут `src`, либо тег `source`. Последний используется для определения нескольких источников, из которых браузер выбирает наиболее подходящий (для определения типа видео-контента используется атрибут `type`).

Текст между `<video>` и `</video>` отображается только в случае, когда браузер не поддерживает элемент `video`.

В настоящее время поддерживается три формата видео: `MP4`, `WebM` и `OGG`.

Атрибуты:

- `autoplay` - автовоспроизведение (блокируется большинством браузеров)
- `controls` - панель управления
- `loop` - определяет, что воспроизведение, после завершения, начнется сначала
- `muted` - воспроизведение без звука (позволяет преодолеть блокировку `autoplay`)
- `preload` - определяет, должен ли видео-контент загружаться после загрузки страницы. Возможные значения: `auto`, `metadata`, `none`. Значение `none` не позволит работать с видео с помощью `JavaScript`
- `src` - путь к видеофайлу
- `poster` - изображение, отображаемое при загрузке видео или до нажатия пользователем кнопки воспроизведения
- `width` - ширина элемента в пикселях
- `height` - высота элемента в пикселях

```html
<video width="320" height="240" controls>
  <source src="movie.mp4" type="video/mp4">
  <source src="movie.ogg" type="video/ogg">
  Ваш браузер не поддерживает элемент "видео".
</video>

<!-- или -->
<!-- Такой вариант может использоваться для воспроизведения видео в качестве фона страницы -->
<video src="movie.mp4" autoplay muted loop>Ваш браузер не поддерживает элемент "видео".</video>
```

`DOM API` предоставляет множество <a href="https://www.w3schools.com/TAGS/ref_av_dom.asp">свойств, методов и событий</a> для работы с элементами `audio` и `video`.

## `base`

Тег `base` определяет основной путь (`URL`) и/или цель (`target`) для всех относительных путей в документе. Он должен размещаться в теге `head` и иметь хотя бы один из следующих атрибутов:

- `href` - основной путь
- `target` - определяет значение по умолчанию атрибута `target` всех гиперссылок и форм на странице. Возможные значения: `_blank`, `_parent`, `_self` и `_top`

```html
<head>
  <base href="http://example.com/" target="_blank">
</head>

<body>
  <header>
    <nav>
      <!-- http://example.com/product.html -->
      <a href="product.html">Продукт</a>
    </nav>
  </header>
  <main>
    <!-- http://example.com/images/happy_face.png -->
    <img src="images/happy_face.png" alt="" />
  </main>
  <footer>
    <nav>
      <!-- http://example.com/contacts.html -->
      <a href="contacts.html">Контакты</a>
    </nav>
  </footer>
</body>
```

## `blockquote` и `cite`

Тег `blockquote` определяет раздел страницы, заимствованный из другого источника. Источник указывается в атрибуте `cite`.

```html
<blockquote cite="https://ru.wikipedia.org/wiki/JavaScript">
JavaScript - мультипарадигменный язык программирования. Поддерживает объектно-ориентированный, императивный и функциональный стили. Является реализацией спецификации ECMAScript (стандарт ECMA-262).
</blockquote>
```

Тег `cite` определяет название какой-либо работы (книги, стихотворения, песни, фильма, картины, скульптуры и т.д.). Он также может представлять из себя ссылку на источник цитаты.

```html
<p>Для более глубокого изучения JavaScript советую взглянуть на <cite>"Вы не знаете JS"</cite> Кайла Симпсона.</p>
```

## `code`

Тег `code` используется для определения части компьютерного кода:

```html
<p>HTML-тег <code>button</code> определяет кликабельную кнопку.</p>

<p>CSS-свойство <code>background-color</code> определяет цвет фона элемента.</p>
```

Для форматирования блока кода `code` часто используется совместно с тегом `pre`:

```html
<pre>
  <code>
    const name = prompt('Как Вас зовут?')
    if (name?.trim()) alert(`Привет, ${name}!`)
    else console.info('Пользователь пожелал остаться неизвестным')
  </code>
</pre>
```

## `datalist`

Тег `datalist` определяет список возможных вариантов для заполнения поля для ввода текста. Он позволяет реализовать "автозавершение" для элемента `input`: при установке фокуса на такое поле пользователь видит выпадающий список.

Атрибут `id` тега `datalist` должен совпадать с атрибутом `list` тега `input`.

```html
<!-- Атрибут `for` тега `label` должен совпадать с атрибутом `id` тега `input` -->
<label for="browser">Выберите Ваш браузер из списка:</label>
<input list="browsers" id="browser">

<datalist id="browsers">
  <option value="Edge">
  <option value="Firefox">
  <option value="Chrome">
  <option value="Opera">
  <option value="Safari">
</datalist>
```

Свойство `options` объекта `Datalist` возвращает коллекцию всех элементов списка.

## `dl`, `dt` и `dd`

Тег `dl` определяет список описаний (определений, извиняюсь за тавтологию). Он используется совместно с тегами `dt`, определяющим понятие или термин, и `dd`, определяющим описание термина.

Внутри `dd` могут размещаться параграфы, изображения, ссылки, списки и т.д.

```html
<dl>
  <dt>Кофе</dt>
  <dd>Черный горячий напиток</dd>
  <dt>Молоко</dt>
  <dd>Белый холодный напиток</dd>
</dl>
```

## `details`

Тег `details` определяет раскрывающийся список с дополнительной информацией. Он часто используется для создания интерактивных виджетов, которые можно открывать и закрывать без использования `JavaScript`. В открытом состоянии он расширяется и показывает скрытый контент.

По умолчанию `details` находится в закрытом состоянии.

Внутри `details` могут размещаться любые теги.

Для отображения заголовка `details` используется тег `summary`.

Индикатором открытого состояния `details` является атрибут `open` (этот атрибут может использоваться в качестве CSS-селектора - `details[open]` или JavaScript-селектора - `document.querySelector('[open]')`).

```html
<details>
  <summary>Заголовок - видимая часть элемента "details"</summary>
  <p>Скрытый контент - дополнительная информация</p>
</details>
```

## `dialog`

Тег `dialog` определяет диалоговое окно. Он используется для создания "попапов" и модальных окон.

По умолчанию `dialog` находится в неактивном состоянии.

Индикатором активного состояния `dialog` является атрибут `open`.

```html
<dialog open>Открытое диалоговое окно</dialog>
```

Для управления объектом `Dialog` с помощью `JavaScript` используются такие методы как `show()`, `close()` и `showModal()`, а также свойство `open`.

## `figure`

Тег `figure` определяет обособленный (автономный) контент, такой как иллюстрации, диаграммы, фотографии, примеры кода и т.д.

Несмотря на то, что контент элемента `figure` формально относится к основному потоку (main flow), его позиция (местонахождение) не зависит от этого потока. Поэтому удаление элемента `figure` не должно влиять на поток документа.

Для добавление подписи к `figure` используется тег `figcaption`.

```html
<figure>
  <img src="v8-compiler-pipeline.png" alt="V8 compiler pipeline" style="width:100%">
  <figcaption>Рис. 1 - Процесс компиляции кода "движком" JavaScript V8.</figcaption>
</figure>
```

## `meter`

Тег `meter` определяет скалярное значение в пределах известного диапазона или дробного значения. Другими словами, `meter` определяет меру чего-либо (gauge).

Этот тег не должен использоваться в качестве индикатора прогресса.

Для обеспечения доступности совместно с `meter` рекомендуется использовать тег `label`.

Атрибуты:

- `value` - текущее числовое значение между `min` и `max`
- `min` - нижняя числовая граница диапазона
- `max` - верхняя числовая граница диапазона
- `low` - верхняя числовая граница нижнего предела диапазона. Должна быть больше `min`, но меньше `high` и `max`
- `high` - нижняя числовая граница верхнего предела диапазона
- `optimum` - оптимальное числовое значение между `min` и `max`. Расположение этого атрибута определяет предпочтительную часть диапазона. Например, если `optimum` находится между `min` и `low`, значит, предпочтительным является нижний диапазон
- `form` - определяет элемент `form`, с которым связан `meter`

```html
<label for="disk_d">Использование диска "D":</label>
<meter id="disk_d" min="0" max="100" value="60">60%</meter>
```

Так можно записать уровень заряда батареи вашего устройства в значение `meter`:

```js
// <meter id="meter" max="100"></meter>
if ('getBattery' in navigator) {
  navigator.getBattery()
    .then(({ level }) => {
      meter.value = level * 100
    })
}
```

## `progress`

Тег `progress` определяет процесс выполнения задачи.

Этот тег не должен использоваться для определения меры чего-либо.

Для обеспечения доступности совместно с `progress` рекомендуется использовать тег `label`.

Атрибуты:

- `max` - максимальное значение. По умолчанию равняется `1`
- `value` - текущее значение

```html
<label for="file">Процесс загрузки:</label>
<progress id="file" max="100" value="32">32%</progress>
```

Так можно реализовать десятисекундный таймер:

```js
// <progress id="progress" value="0" max="10"></progress>
const timerId = setInterval(() => {
  progress.value += 1
  if (progress.value === progress.max) {
    progress.remove()
    clearInterval(timerId)
  }
}, 1000)
```

## `output`

Тег `output` используется для представления результата вычислений.

Атрибуты:

- `for` - определяет связь между результатом и элементами, используемыми для его выичсления
- `form` - определяет элемент `form`, которому принадлежит `output`
- `name` - название элемента `output`

```html
<form oninput="x.value=parseInt(a.value)+parseInt(b.value)">
  <input type="number" id="a" value="25" />
  +
  <input type="number" id="b" value="50" />
  =
  <output name="x" for="a b">75</output>
</form>
```

## `picture`

Тег `picture` предоставляет возможность использования нескольких источников для изображения (нескольких изображений).

Этот тег позволяет использовать разные изображения в зависимости от ширины области просмотра (viewport width) вместо масштабирования одного изображения.

Элемент `picture` содержит два тега: один или более `source` и один `img`.

Браузер выбирает элемент `source` с медиа-запросом, совпадающим с текущей шириной области просмотра. Элемент `img` указывается в качестве последнего дочернего элемента на случай отсутствия совпадений с `source`.

Путь к изображению указывается в атрибуте `srcset`, а медиа-запрос - в атрибуте `media`.

```html
<picture>
  <source media="(min-width:768px)" srcset="big.jpg">
  <source media="(min-width:480px)" srcset="small.jpg">
  <img src="default.jpg" alt="" style="width:auto;">
</picture>
```

## `template`

Тег `template` используется в качестве контейнера для разметки, которая не отображается при загрузке страницы.

Этот тег предназначен для хранения разметки, которая используется часто, но в определенных случаях (по запросу).

Контент внутри `template` может быть отрендерен с помощью `JavaScript`.

```html
<template>
  <h1>Заголовок</h1>
  <p>И какой-то текст</p>
</template>

<button id="button">Это не кнопка</button>
```

```js
((body, { content }) => {
  button.onclick = () => {
    body.append(content.cloneNode(true))
  }
})(document.body, document.querySelector('template'))
```

## `time`

Тег `time` определяет конкретное время (или дату и время).

Атрибут `datetime` используется для представления времени в машиночитаемом формате.

```html
<p>Некоторые люди искренне верили в то, что в <time datetime="2000-01-01 00:01">полночь 2000 года</time> наступит конец света, но, как видите, свет продолжается. Возможно, он закончится в <time datetime="3000-01-01 00:01">полночь 3000 года</time>, но это не точно</p>
```

## `noscript`

Тег `noscript` определяет резервный контент, который отображается в случае, если в браузере отключен `JavaScript`. Он может использоваться как в теге `head`, так и в теге `body`. В первом случае `noscript` может содержать только такие теги как `link`, `style` и `meta`.

```html
<script>
document.write('Одни дивы да спаны... Где семантика?')
</script>
<noscript>Пожалуйста, включите JavaScript</noscript>
```

## Другие теги в форме шпагралок

### Семантическое "секционирование" страницы

```html
<body>
  <header>
    <h1>Page Title</h1>
    <nav>
      <ul>
        <li><a href="#">Link1</a></li>
        <li><a href="#">Link2</a></li>
      </ul>
    </nav>
    <img src="images/logo.png" alt="" />
  </header>

  <aside>
    <h2>Aside Title</h2>
    <p>Aside Content</p>
  </aside>

  <main>
    <article>
      <h2>Atricle Title</h2>
      <section>
        <h3>Section Title</h3>
        <p>Section Content</p>
      </section>
    </article>

    <div>
      <section>
        <h2>Section2 Title</h2>
        <p>Section2 Content</p>
      </section>
      <section>
        <p>Section3 Content</p>
      </section>
    </div>
  </main>

  <footer>
    <nav>
      <ol>
        <li><a href="#">Link3</a></li>
        <li><a href="#">Link4</a></li>
      </ol>
    </nav>
    <div>
      <p>Block text &amp; <span>inline text</span></p>
    </div>
  </footer>
</body>
```

### Стилизация текста

```html
<p>
  Текст может быть
    <b>полужирным</b>,
    <strong>полужирным и "важным"</strong>,
    <i>"наклонным"</i>,
    <em>наклонным и важным</em>,
    <small>маленьким</small>,
    <del>удаленным из документа</del>,
    <ins>вставленным в документ</ins>,
    <u>подчеркнутым</u>
    <s>неправильным</s>.

  Он может представлять собой
    <q>короткую цитату</q>,
    <kbd>ввод с клавиатуры</kbd>,
    <samp>вывод программы</samp>.

  Текст может находиться
    <sup>над строкой</sup> и
    <sub>под ней</sub>.

  Наконец, он может быть <mark>помеченным</mark>.

  Длинныйтекстможноразделять<wbr />внужномместе.

  Его можно переносить<br />на новую строку и разделять<hr />горизонтальной чертой.
</p>
```

### Форма

Символ `/` означает `или`.

```html
<form
  action="URL"
  autocomplete="on / off"
  enctype=""
  id="form"
  method="GET / POST"
  name="form"
  novalidate
>
  <fieldset>
    <legend>Title</legend>

    <label for="first_name">Имя:</label>
    <input type="text" id="first_name">

    <label>Фамилия:
      <input type="text">
    </label>
  </fieldset>

  <select
    autofocus
    disabled
    form="form"
    multiple
    name="select"
    required
    size="10"
  >
    <optgroup label="Group1">
      <option
        value="option1"
        disabled
        label="option1"
      ></option>
      <option value="option2" selected></option>
    </optgroup>

    <optgroup label="Group2" disabled>
      <option value="option3"></option>
    </optgroup>

    <option value="option4"></option>
  </select>

  <textarea
    autofocus
    cols="30"
    disabled
    form="form"
    maxlength="50"
    name="textarea"
    placeholder="Введите текст..."
    readonly
    required
    rows="10"
    wrap="hard / soft"
  ></textarea>

  <button
    type="submit"
    autofocus
    disabled
    form="form"
    formaction="URL"
    formenctype=""
    formmethod="GET / POST"
    formnovalidate
    name="submit"
  >
    Кнопка для отправки формы
  </button>
  <button type="reset">Кнопка для сброса формы (очистки полей для ввода данных)</button>
  <button type="button">Просто кнопка</button>
</form>
```

### Поля для ввода данных

```html
<input type="button">
<input type="checkbox">
<input type="color">
<input type="date">
<input type="datetime-local">
<input type="email">
<input type="file">
<input type="hidden">
<input type="image">
<input type="month">
<input type="number">
<input type="password">
<input type="radio">
<input type="range">
<input type="reset">
<input type="search">
<input type="submit">
<input type="tel">
<input type="text"> (значение по умолчанию)
<input type="time">
<input type="url">
<input type="week">
```

Атрибуты:

- `accept` - MIME-тип принимаемых файлов (только для `type="file"`). Значения: `расширение, например, .png`, `audio/*`, `video/*`, `image/*`, `медиа тип, например, json`
- `alt` - подпись
- `autocomplete` - `on / off`
- `autofocus`
- `checked` - только для `type="checked"` или `type="radio"`
- `disabled`
- `form`
- `formaction` - только для `type="submit"` или `type="image"`
- `formenctype` - только для `type="submit"` или `type="image"`. Значения: `application/x-www-form-urlencoded`, `multipart/form-data`, `text/plain`
- `formmethod` - только для `type="submit"` или `type="image"` (`get / post`)
- `formnovalidate` - отключает проверку элементов формы
- `formtarget` - определяет, где отображается ответ, полученный после отправки формы (только для `type="submit"` или `type="image"`). Значения: `_blank`, `_self`, `_parent`, `_top`, `название фрейма`
- `height` - высота в пикселях (только для `type="image"`)
- `list`
- `max` - максимальное значение (число или дата)
- `maxlength` - максимальная длина строки (количество символов)
- `min` - минимальное значение (число или дата)
- `minlength` - минимальная длина строки (количество символов)
- `multiple` - позволяет пользователю выбирать несколько значений или отправлять несколько файлов
- `name`
- `pattern` - регулярное выражение для проверки значения поля
- `placeholder`
- `readonly`
- `required`
- `size` - количество символов, определяющее ширину поля
- `src` - путь к изображению, используемому в качестве кнопки для отправки формы (только для `type="image"`)
- `step` - интервал (шаг) между `min` и `max`
- `type`
- `value`
- `width` - ширина поля в пикселях (только для `type="image"`)

Пример валидации адреса электронной почты и пароля:

```html
<form>
  <input
    type="email"
    id="email"
    name="email"
    pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
    required
  />

  <input
    type="password"
    id="password"
    name="password"
    pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
    title="Пароль не может быть меньше 8 символов и должен содержать одну цифру, одну прописную (заглавную) букву и одну строчкую букву"
    required
  />
  <input type="submit" />
</form>
```

### Таблица

```html
<table>
  <caption>
    Table Title
  </caption>
  <colgroup>
    <col span="2" />
    <col />
  </colgroup>
  <thead>
    <tr>
      <th
        abbr="H1"
        colspan="2"
        rowspan="2"
        scope="col / colgroup / row / rowgroup"
      >
        Heading1
      </th>
      <th>Heading2</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td colspan="2" rowspan="2">1-1</td>
      <td>1-2</td>
    </tr>
    <tr>
      <td>2-1</td>
      <td>2-2</td>
    </tr>
  </tbody>
  <tfoot>
    <tr>
      <td>3-1</td>
      <td>3-2</td>
    </tr>
  </tfoot>
</table>
```

Теги `colgroup` и `col` могут использоваться для стилизации определенных колонок таблицы целиком вместо стилизации каждой ячейки и строки по отдельности.

Здесь представлены почти все существующие теги `HTML5`. С полным списком можно ознакомиться <a href="https://www.w3schools.com/TAGS/default.ASP">здесь</a> или <a href="https://developer.mozilla.org/ru/docs/Web/HTML/Element">здесь</a>. Во многих публикациях упоминаются теги `map` и `area`, но с их использованием сопряжено несколько проблем (сложность реализации карты, зависимость областей от координат и т.д.), поэтому я оставил их без внимания. Также существуют такие теги, как `svg` и `canvas`, предназначенные для работы с графикой, но для рассказа о каждом из них требуется отдельное руководство.
