---
sidebar_position: 2
title: Вопросы по JavaScript. Версия 2
description: Вопросы по JavaScript для подготовки к собеседованию
keywords: ['javascript', 'js', 'interview', 'questions', 'question', 'собеседование', 'интервью', 'вопросы', 'вопрос']
---

# Вопросы по JavaScript. Версия 2

> WIP

## Почему значение атрибута `id` элемента `HTML` должно быть уникальным?

Потому что любой `HTML-элемент` с атрибутом `id` становится свойством глобального объекта `window`. Это, с одной стороны, приводит к загрязнению глобального пространства имен, что плохо, с другой - к возможности получать доступ к таким элементам в скрипте напрямую, т.е. без предварительного получения ссылки на элемент с помощью таких методов как `querySelector`, что хорошо:

```html
<div id="box"></div>
```

```js
console.log(box === window.box) // true
```

_Обратите внимание_: получение прямого доступа к элементу с идентификатором не работает во фреймворках, абстрагирующих работу с `DOM`, например, через виртуальный `DOM` (`React`).

## В чем разница между методами `preventDefault` и `stopPropagation`?

Метод `preventDefault` отключает стандартную обработку события браузером, а метод `stopPropagation` - распространение события, т.е. запуск родительских по отношению к элементу, в котором возникло событие, обработчиков.

Например, "дефолтная" обработка события `submit` элемента `form` предполагает отправку данных формы и перезагрузку страницы.

```html
<form id="formEl">
  <input type="text" id="inputEl" />
  <button>Отправить</button>
</form>
```

```js
formEl.onsubmit = (e) => {
  e.preventDefault()
  alert(inputEl.value || 'hello world')
}
```

Событие поднимается от целевого элемента до `window` через всех его предков. Элементы, через которые проходит событие (путь события), содержится в свойстве `event.path`.

```html
<div id="outerBox">
  <div id="innerBox">
    <button id="firstButtonEl">Сначала нажми на меня</button>
    <button id="secondButtonEl">А потом на меня</button>
  </div>
</div>
```

```js
window.onclick = (e) => {
  console.log(`Событие #${e.eventNum} достигло объекта "window"`)
}

outerBox.onclick = (e) => {
  console.log(`Событие #${e.eventNum} достигло внешнего контейнера`)
}

innerBox.onclick = (e) => {
  console.log(`Событие #${e.eventNum} достигло внутреннего контейнера`)
}

firstButtonEl.onclick = (e) => {
  console.log('Возникло событие нажатия первой кнопки')
  e.eventNum = '1'
}

secondButtonEl.onclick = (e) => {
  // !
  e.stopPropagation()
  console.log('Возникло событие нажатия второй кнопки')
  e.eventNum = '2'
}

firstButtonEl.click()
/*
  Возникло событие нажатия первой кнопки
  Событие #1 достигло внутреннего контейнера
  Событие #1 достигло внешнего контейнера
  Событие #1 достигло объекта "window"
*/

secondButtonEl.click()
// Возникло событие нажатия второй кнопки
```

## В чем разница между методами `stopPropagation` и `stopImmediatePropagation`?

Метод `stopPropagation` отключает только родительские обработчики события, а метод `stopImmediatePropagation` - все обработчики, кроме текущего.

```html
<div id="outerBox">
  <div id="innerBox">
    <button id="firstButtonEl">Сначала нажми на меня</button>
    <button id="secondButtonEl">А потом на меня</button>
  </div>
</div>
```

```js
outerBox.onclick = (e) => {
  console.log(`Событие достигло внешнего контейнера`)
}

innerBox.onclick = (e) => {
  console.log(`Событие достигло внутреннего контейнера`)
}

firstButtonEl.addEventListener('click', (e) => {
  e.stopPropagation()
  console.log('Первый обработчик нажатия первой кнопки')
})

firstButtonEl.addEventListener('click', (e) => {
  console.log('Второй обработчик нажатия первой кнопки')
})

secondButtonEl.addEventListener('click', (e) => {
  // !
  e.stopImmediatePropagation()
  console.log('Первый обработчик нажатия второй кнопки')
})

secondButtonEl.addEventListener('click', (e) => {
  console.log('Второй обработчик нажатия второй кнопки')
})

firstButtonEl.click()
/*
  Первый обработчик нажатия первой кнопки
  Второй обработчик нажатия первой кнопки
*/

secondButtonEl.click()
// Первый обработчик нажатия второй кнопки
```

## В чем разница между `target` и `currentTarget`?

Свойство `target` содержит ссылку на элемент, в котором возникло событие (инициатор события), а `currentTarget` - ссылку на элемент, в котором событие обрабатывается в данный момент.

```html
<div id="divEl">
  <button id="buttonEl">Нажми на меня</button>
</div>
```

```js
buttonEl.onclick = (e) => {
  console.log(`
    Событие возникло в "${e.target.id}".
    В данный момент событие обрабатывается в "${e.currentTarget.id}".
  `)
}

divEl.onclick = (e) => {
  console.log(`
    Событие возникло в "${e.target.id}".
    В данный момент событие обрабатывается в "${e.currentTarget.id}".
  `)
}

buttonEl.click()
/*
  Событие возникло в "buttonEl".
  В данный момент событие обрабатывается в "buttonEl".

  Событие возникло в "buttonEl".
  В данный момент событие обрабатывается в "divEl".
*/
```

## В чем разница между `target` и `relatedTarget`?

Свойство `relatedTarget` содержит доступную только для чтения ссылку на производный целевой элемент (secondary target) событий мыши или установки фокуса, если таковой имеется. Значение данного свойства зависит от типа события.

Для события мыши:

| Тип события                         | target                                                | relatedTarget                                         |
| ----------------------------------- | ----------------------------------------------------- | ----------------------------------------------------- |
| `mouseenter`, `mouseover` или `dragenter` | элемент, над которым курсор находится в данный момент | элемент, над которым курсор находился ранее           |
| `mouseleave`, `mouseout` или `dragleave`  | элемент, над которым курсор находился ранее           | элемент, над которым курсор находится в данный момент |

Для события установки фокуса:

| Тип события       | target                    | relatedTarget             |
| ----------------- | ------------------------- | ------------------------- |
| `blur` или `focusout` | элемент, потерявший фокус | элемент, получивший фокус |
| `focus` или `focusin` | элемент, получивший фокус | элемент, потерявший фокус |

Пример для события мыши:

```html
<div id="greenBox"></div>
<div id="blueBox"></div>
<p id="enterLog"></p>
<p id="leaveLog"></p>
```

```css
div {
  width: 100px;
  height: 100px;
}
div:first-of-type {
  background-color: green;
}
div:last-of-type {
  background-color: blue;
}
```

```js
greenBox.addEventListener('mouseenter', onMouseEnter)
greenBox.addEventListener('mouseleave', onMouseLeave)

blueBox.addEventListener('mouseenter', onMouseEnter)
blueBox.addEventListener('mouseleave', onMouseLeave)

const getRelatedTarget = (e) =>
  !e.relatedTarget
    ? 'unknown'
    : e.relatedTarget.id
    ? e.relatedTarget.id
    : e.relatedTarget.localName

function onMouseEnter(e) {
  enterLog.textContent = `В "${e.target.id}" из "${getRelatedTarget(e)}"`
}

function onMouseLeave(e) {
  leaveLog.textContent = `Из "${e.target.id}" в "${getRelatedTarget(e)}"`
}
```

## Какие настройки принимает метод `addEventListener`?

В качестве третьего опционального параметра метод `addEventListener` принимает объект `options` со следующими настройками:

- `capture` - если имеет значение `true`, событие перехватывается на стадии погружения, перед обработкой в целевом элементе:

```html
<div id="firstDivEl">
  <button id="firstButtonEl">Первая кнопка</button>
</div>
<div id="secondDivEl">
  <button id="secondButtonEl">Вторая кнопка</button>
</div>
```

```js
function onClick(e) {
  console.log(e.currentTarget.id)
}

firstDivEl.addEventListener('click', onClick)
firstButtonEl.addEventListener('click', onClick)

// !
secondDivEl.addEventListener('click', onClick, { capture: true })
secondButtonEl.addEventListener('click', onClick)

firstButtonEl.click()
/*
  firstButtonEl
  firstDivEl
*/

secondButtonEl.click()
/*
  secondDivEl
  secondButtonEl
*/
```

- `once` - если имеет значение `true`, обработчик запускается только один раз. В этом случае обработчик автоматически удаляется после вызова:

```html
<button id="firstButtonEl">Первая кнопка</button>
<button id="secondButtonEl">Вторая кнопка</button>
```

```js
function onClick(e) {
  console.log(e.currentTarget.id)
}

firstButtonEl.addEventListener('click', onClick)
secondButtonEl.addEventListener('click', onClick, { once: true })

firstButtonEl.click()
firstButtonEl.click()
firstButtonEl.click()
/*
  firstButtonEl
  firstButtonEl
  firstButtonEl
*/

secondButtonEl.click()
secondButtonEl.click()
secondButtonEl.click()
/*
  secondButtonEl
*/
```

- `passive` - данная настройка предназначена для управления блокировкой рендеринга обработкой события прокрутки, но ни один современный браузер не позволит вам этого сделать, так что просто забудьте про нее.

Вместо `options` методу `addEventListener` может быть передано логическое значение для настройки `capture`. Данный параметр называется `useCapture`.

## В чем заключаются преимущества использования `addEventListener` перед `onclick`, например?

Во-первых, `addEventListener` в отличие от `onlick` позволяет добавить к элементу несколько обработчиков:

```html
<button id="buttonEl">Click me</button>
```

```js
buttonEl.onclick = () => {
  console.log('hi')
}
buttonEl.onclick = () => {
  console.log('bye')
}
buttonEl.click() // bye
// первый обработчик был перезаписан

buttonEl.addEventListener('click', () => {
  console.log('hi')
})
buttonEl.addEventListener('click', () => {
  console.log('bye')
})
buttonEl.click()
/*
  hi
  bye
*/
```

Во-вторых, синтаксис `addEventListener` является более декларативным, хотя и более многословным:

```js
function sayHi() {
  console.log('hi')
}
buttonEl.onclick = sayHi
buttonEl.removeEventListener('click', sayHi)
buttonEl.click() // hi
// для того, чтобы удалить обработчик, требуется перезаписать свойство `onclick`
// об этом легко забыть, в результате возникнет утечка памяти
buttonEl.onclick = null
buttonEl.click()

buttonEl.addEventListener('click', sayHi)
buttonEl.removeEventListener('click', sayHi)
buttonEl.click()
```

## В чем разница между `requestAnimationFrame` и `requestIdleCallback`?

Метод `requestAnimationFrame` предоставляет доступ к жизненному циклу кадра (фрейма), позволяя выполнять операции перед вычислением стилей и формированием макета (layout) документа браузером. Поэтому данный метод отлично подходит для реализации анимации. Собственно, для этого он и предназначен. Во-первых, он вызывается не чаще и не реже, чем браузер вычисляет макет (правильная частота). Во-вторых, он вызывается перед вычислением макета (правильное время). Поэтому `rAF` также отлично подходит для внесения изменений в `DOM` или `CSSOM`. `rAF` синхронизирован с [`vsync`](https://en.wikipedia.org/wiki/Vsync_(computing)), как и любой другой механизм рендеринга, используемый браузером.

Простой пример использования `rAF` для анимирования элемента:

```html
<div id="box"></div>
```

```css
body {
  margin: 0;
  overflow: hidden;
}

#box {
  width: 100px;
  height: 100px;
  background-color: deepskyblue;
}
```

```js
let start = null

const requestId = window.requestAnimationFrame(moveFromLeftToRight)

function moveFromLeftToRight(timestamp) {
  if (!start) {
    start = timestamp
  }

  const progress = timestamp - start

  box.style.transform = `translateX(${progress / 5}px)`

  // добавляем ширину контейнера
  const x = box.getBoundingClientRect().x + 100

  if (x <= window.innerWidth) {
    window.requestAnimationFrame(moveFromLeftToRight)
  } else {
    window.cancelAnimationFrame(requestId)
  }
}
```

На практике `rAF` часто используется для оптимизации обработчиков прокрутки. Делается это следующим образом ([источник](https://developers.google.com/web/fundamentals/performance/rendering/debounce-your-input-handlers)):

```js
let scheduledAnimationFrame

// читаем и обновляем страницу
function readAndUpdatePage(){
  console.log('read and update')

  scheduledAnimationFrame = false
}

function onScroll () {
  // сохраняем значение прокрутки для будущего использования
  const lastScrollY = window.scrollY

  // предотвращаем множественный вызов колбека, переданного `rAF`
  if (scheduledAnimationFrame) {
    return
  }

  scheduledAnimationFrame = true

  window.requestAnimationFrame(readAndUpdatePage)
}

window.addEventListener('scroll', onScroll)
```

В теории использование этого паттерна откладывает выполнение операции (`readAndUpdatePage`), как минимум, до следующего кадра - изменять макет чаще, чем браузер его рендерит, не имеет смысла.

Однако индикатор `scheduledAnimationFrame` бесполезен, поскольку событие `scroll` возникает при рендеринге позиции прокрутки браузером. Это означает, что данное событие синхронизировано с рендерингом. По сути, это то, что делает `rAF` - позволяет синхронизировать запуск колбека с рендерингом страницы.

Вот как можно в этом убедиться:

```js
// предотвращаем множественный вызов колбека
if (scheduledAnimationFrame) {
  console.log('prevented rAF callback')
  return
}
```

Сообщение `prevented rAF callback` никогда не попадет в консоль.

Для настоящей задержки запуска колбека с помощью `rAF` имеет смысл выполнять какую-либо проверку, например:

```css
body {
  margin: 0;
  height: 500vh;
}

#box {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: -200%;
  width: 100px;
  height: 100px;
  background-color: deepskyblue;
}
```

```js
function readAndUpdatePage() {
  console.log('read and update')
}

function onScroll() {
  const { top } = box.getBoundingClientRect()

  if (top <= window.scrollY) {
    window.requestAnimationFrame(readAndUpdatePage)
  }
}

window.addEventListener('scroll', onScroll)
```

Метод `requestIdleCallback` позволяет выполнять низкоприоритетные операции в период простоя браузера (отсюда `idle`) внутри кадра (обычно, это происходит после вычисления браузером макета и его перерисовки, когда осталось какое-то время перед синхронизацией). Даже если с точки зрения пользователя страница "подвисает", могут быть периоды, когда браузер находится в режиме ожидания. Максимальная продолжительность времени, предоставляемая `rIC` для выполнения задачи, на сегодняшний день составляет `50 мс`. Фактически же в нашем распоряжении имеется `0.5-10 мс`. Поэтому, если внутри `rIC` вызывается функция для изменения `DOM`, ее следует вызывать с помощью `requestAnimationFrame`.

Обработку события прокрутки вполне можно отнести к низкоприоритетным задачам. Поэтому для задержки вызова таких обработчиков можно использовать `rIC`. При этом, для реализации дополнительной задержки можно использовать функцию `setTimeout`.

Пример использования `rIC` и `rAF` для выполнения низкоприоритетной, но потенциально продолжительной задачи по рендерингу нового элемента:

```html
<button id="renderButtonEl">Render box</button>
```

```js
// единица работы
let nextUnitOfWork = null
// элемент для рендеринга
let elementToRender = null

// рабочий цикл
function workLoop(deadline) {
  // если имеется единица работы и на ее выполнение осталось свободное время
  while (nextUnitOfWork && deadline.timeRemaining() > 0) {
    // выполняем единицу работы и получаем следующую при наличии таковой
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
  }

  // если единиц работы не осталось и имеется элемент для рендеринга
  if (!nextUnitOfWork && elementToRender) {
    // вносим изменения в `DOM`
    requestAnimationFrame(updateDom)
  }

  // снова запускаем рабочий цикл
  requestIdleCallback(workLoop)
}

// запускаем рабочий цикл
window.requestIdleCallback(workLoop)

// функция для выполнения единицы работы
function performUnitOfWork() {
  const el = document.createElement('div')
  el.id = 'box'
  elementToRender = el

  return null
}

// функция для обновления `DOM`
function updateDom() {
  document.body.append(elementToRender)

  elementToRender = null
}

renderButtonEl.addEventListener(
  'click',
  () => {
    console.log('ok')
    nextUnitOfWork = true
  },
  {
    once: true
  }
)
```
