---
slug: has-css-selector
title: Прокачиваем навыки CSS с помощью селектора :has()
description: Прокачиваем навыки CSS с помощью селектора :has()
authors: harryheman
tags: [css, selector, has, not, where, is]
---

Привет, друзья!

Представляю вашему вниманию перевод [этой замечательной статьи](https://www.smashingmagazine.com/2023/01/level-up-css-skills-has-selector), посвященной продвинутому использованию нового CSS-селектора [:has()](https://developer.mozilla.org/en-US/docs/Web/CSS/:has).

`:has()` предоставляет возможность "заглядывать вперед" с помощью CSS и стилизовать родительский элемент (предка). Этот селектор может быть легко расширен для стилизации одного или нескольких дочерних элементов (потомков). Регистрация состояний или позиций элемента позволяет стилизовать почти любую комбинацию элементов как уникальных или входящих в определенный диапазон.

_Обратите внимание_: на сегодняшний день `:has()` [поддерживается не всеми браузерами](https://caniuse.com/css-has), поэтому использовать его в производственных приложениях пока рано.

<!--truncate-->

## Взаимодействие `:has()` с комбинаторами и псевдоклассами

Комбинатор (combinator) - это специальный символ, определяющий тип отношений между частями селектора. Основными комбинаторами являются:

- пробел - комбинатор любых потомков (descendent combinator) (как прямых, так и вложенных);
- `>` - комбинатор прямых потомков (direct child combinator);
- `+` - комбинатор смежного сиблинга (adjacent sibling combinator) (одного следующего элемента);
- `~` - комбинатор общих сиблингов (general sibling combinator) (всех следующих элементов).

Первым этапом создания сложного селектора является добавление псевдокласса к одной или более частям селектора. Псевдокласс определяет специальное состояние элемента, например `:hover`. Псевдокласс `:has()` считается функциональным, поскольку принимает параметр. Точнее, он принимает список селекторов, как простых вроде `img`, так и сложных (с комбинаторами) вроде `img + p`.

`:has()` - это один из четырех функциональных псевдоклассов, наряду с [:is()](https://developer.mozilla.org/en-US/docs/Web/CSS/:is), [:where()](https://developer.mozilla.org/en-US/docs/Web/CSS/:where) и [:not()](https://developer.mozilla.org/en-US/docs/Web/CSS/:not).

`:is()` и `:where()` предназначены для группировки селекторов и управления специфичностью.

При использовании `:is()` вес всего селектора определяется селектором из списка с наивысшей специфичностью. При использовании `:where()` специфичность всего селектора является нулевой, что облегчает его перезапись более поздними правилами в каскаде.

Кроме того, `:is()` и `:where()` являются прощающими селекторами. Это означает, что браузер "прощает" присутствие в списке невалидных селекторов, т.е. селекторов, которые он не понимает. Браузер просто обрабатывает селекторы, которые понимает вместо того, чтобы игнорировать всю группу.

Пример использования `:is()` для группировки селекторов: `article :is(h1, h2, h3)` - выбираем все элементы `h1`, `h2` и `h3`, которые являются потомками элемента `article`.

Псевдокласс `:not()` раньше принимал только один селектор. Спецификация Selectors Level 4 разрешила ему принимать список селекторов. Определение специфичности `:not()` аналогично `:is()`.

Еще одна важная особенность: символ `*` (универсальный селектор - universal selector) в `:is()`, `:where()` и `:not()` фактически указывает на цель селектора. Это позволяет проверять предыдущих сиблингов или предков цели селектора. Например, в `img:not(h1 + *)` мы выбираем изображения, которые _не_ следуют непосредственно за `h1`, а в `p:is(h2 + *)` мы выбираем параграфы, _только_ если они следуют непосредственно за `h2`.

_Прим. пер.:_ с вашего позволения я пропущу раздел ["Полифил для `:only-of-selector`"](https://www.smashingmagazine.com/2023/01/level-up-css-skills-has-selector#polyfill-for-only-of-selector), поскольку параграфы, стилизуемые [в примере](https://codepen.io/smashingmag/pen/qByprrp) с помощью селектора `.highlight:not(:has(~ .highlight)):not(.highlight ~  *)` могут быть стилизованы просто через `.highlight`.

## Селектор предыдущих сиблингов

`:has()` позволяет стилизовать предыдущих сиблингов на основе того, что следует за ними. Для демонстрации этой возможности создадим список элементов. При наведении курсора на элемент списка, он увеличивается в размерах. Элементы перед и после него также немного увеличиваются. Оставшиеся элементы уменьшаются в размерах. Все элементы, кроме "наведенного", становятся немного прозрачными.

Первый селектор должен совпадать с элементом списка перед наведенным. Этого можно достичь с помощью `:has()`. Следующее правило гласит "выбери элемент списка, за которым непосредственно следует наведенный элемент":

```css
li:has(+ li:hover)
```

Добавляем к этому селектор следующего непосредственного сиблинга и применяем стили:

```css
/* выбираем элемент перед наведенным */
/* второй `li` можно опустить */
li:has(+ li:hover),
/* выбираем элемент после наведенного */
/* вместо второго `li` можно использовать `*` */
li:hover + li {
  /* модифицируем масштаб и прозрачность */
}
```

Третий сложный селектор представляет собой комбинацию `:has()` и `:not()`. Этот селектор применяется в случае, когда курсор наведен на одного из прямых потомков `ul` (элемент списка), ко всем элементам списка, кроме наведенного и элементов, перед и после него.

```css
ul:has(> :hover) li:not(:hover, :has(+ :hover), li:hover + *) {
  /* модифицируем масштаб и прозрачность */
}
```

<iframe height="300" width="100%" scrolling="no" title="Previous/Next Sibling Animation with :has()" src="https://codepen.io/smashingmag/embed/rNrpymj?default-tab=html%2Cresult" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href="https://codepen.io/smashingmag/pen/rNrpymj">
  Previous/Next Sibling Animation with :has()</a> by Smashing Magazine (<a href="https://codepen.io/smashingmag">@smashingmag</a>)
  on <a href="https://codepen.io">CodePen</a>.
</iframe>

## Выбор диапазона элементов

Рассмотрим пример диапазона потомков, таких как элементы между `h2` и `hr` в следующем примере:

```html
<article>
  <h2>Lorem, ipsum.</h2>
  <!-- начала диапазона h2 -->
  <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit.</p>
  <p>Nobis iusto voluptates reiciendis molestias, illo inventore ipsum?</p>
  <!-- конец диапазона h2 -->
  <h2>Lorem, ipsum dolor.</h2>
  <p>Lorem ipsum dolor sit amet.</p>
  <hr>
  <!-- начало диапазона hr -->
  <p>Lorem ipsum dolor sit.</p>
  <p>Dolor animi nisi ut?</p>
  <p>Sunt consectetur esse quia.</p>
  <!-- конец диапазона hr -->
  <hr>
  <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
</article>
```

С помощью `:has()` мы можем стилизовать:

- первый элемент диапазона;
- последний элемент диапазона;
- все элементы диапазона.

Эти селекторы будут во многом полагаться на комбинатор общих сиблингов, который позволяет "заглядывать вперед" и стилизовать несколько сиблингов за раз.

__Выбор первого элемента диапазона__

Следующее правило гласит "выбери сиблинга, следующего непосредственно за `h2` при условии, что за ним следует другой `h2`", что совпадает с параграфом, следующем непосредственно за первым `h2` в примере:

```css
article h2 + :has(~ h2)
```

__Выбор последнего элемента в диапазоне__

Следующее правило гласит "выбери элемент, следующий за `h2` при условии, что за ним непосредственно следует другой `h2`", что совпадает с параграфом перед вторым `h2` в примере:

```css
article h2 ~ :has(+ h2)
```

__Выбор всех элементов диапазона__

Следующее правило гласит "выбери все элементы, следующие за `hr`, при условии, что за ними следует `hr`", что совпадает с тремя параграфами между `hr` в примере:

```css
article hr ~ :has(~ hr)
```

_Обратите внимание:_ это работает только для одного диапазона внутри родительского элемента.

<iframe height="300" width="100%" scrolling="no" title="Select within an element range with :has() (limited)" src="https://codepen.io/smashingmag/embed/KKBZWqd?default-tab=html%2Cresult" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href="https://codepen.io/smashingmag/pen/KKBZWqd">
  Select within an element range with :has() (limited)</a> by Smashing Magazine (<a href="https://codepen.io/smashingmag">@smashingmag</a>)
  on <a href="https://codepen.io">CodePen</a>.
</iframe>

## Выбор одного полного диапазона

Предположим, что у нас имеется список элементов, в котором два элемента имеют атрибут `data-range`:

```html
<ul>
  <li>Lorem</li>
  <li data-range>Veritatis</li>
  <li>Eos</li>
  <li>Debitis</li>
  <li>Autem</li>
  <li data-range>Atque</li>
  <li>Eius</li>
  <li>Lorem</li>
  <li>Nostrum</li>
</ul>
```

Для выбора начала и конца диапазона мы можем использовать атрибут `data-range`.

Затем мы можем использовать созданный нами в предыдущем разделе селектор для выбора всех сиблингов внутри диапазона:

```css
[data-range] ~ :has(~ [data-range])
```

Следующее правило гласит "выбери элемент с атрибутом `data-range`, за которым следует сиблинг с таким же атрибутом", что совпадает с первым элементом диапазона:

```css
[data-range]:has(~ [data-range])
```

Следующее правило гласит "выбери элемент с атрибутом `data-range`, за которым _непосредственно_ следует элемент с таким же атрибутом", что совпадает с последним элементом диапазона:

```css
[data-range] ~ [data-range]
```

<iframe height="300" width="100%" scrolling="no" title="Single range element selectors with :has()" src="https://codepen.io/smashingmag/embed/RwBxpgq?default-tab=html%2Cresult" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href="https://codepen.io/smashingmag/pen/RwBxpgq">
  Single range element selectors with :has()</a> by Smashing Magazine (<a href="https://codepen.io/smashingmag">@smashingmag</a>)
  on <a href="https://codepen.io">CodePen</a>.
</iframe>

## Выбор нескольких диапазонов

Ключом для стилизации нескольких диапазонов является различение начала и конца диапазонов.

Мы снова используем атрибуты `data-range`, но в этот раз со значениями `start` и `end`:

```html
<ul>
  <li>Lorem</li>
  <li data-range="start">Veritatis</li>
  <li>Eos</li>
  <li>Debitis</li>
  <li>Autem</li>
  <li data-range="end">Atque</li>
  <li>Eius</li>
  <li>Lorem</li>
  <li>Nostrum</li>
</ul>
```

Это позволяет упростить селекторы первого и последнего элементов диапазона:

```css
/* первый и последний элементы диапазона */
[data-range]

/* начало диапазона */
[data-range="start"]

/* конец диапазона */
[data-range="end"]
```

Стилизуем первый и последний элементы внутри диапазона. Сначала добавляем значения дата-атрибутов `start` и `end`. Затем добавляем условие, что стили не должны применяться к началу и концу диапазона, с помощью `:not([data-range])`:

```css
/* первый элемент внутри диапазона */
[data-range="start"] + :has(~ [data-range="end"]):not([data-range])

/* последний элемент внутри диапазона */
[data-range="start"] ~ :has(+ [data-range="end"]):not([data-range])
```

Как нам выбрать элементы внутри диапазона? Попробуем так:

```css
[data-range="start"] ~ :has(~ [data-range="end"]):not([data-range])
```

Результат:

<img src="https://habrastorage.org/webt/oh/p3/hs/ohp3hsnwo7s5onekg4pxbes6gce.png" />
<br />

Селектор работает не так, как ожидается: стили применяются к элементам за пределами диапазона.

Для решения этой проблемы нужно добавить сложное условие `AND` с помощью `:not()` для исключения элементов за пределами диапазона.

Следующее правило гласит "_не_ выбирать элементы, следующие за `[data-range="end"]`, за которыми следует `[data-range="start"]`":

```css
/* обратите внимание: это часть предыдущего селектора */
:not([data-range="end"] ~ :has(~ [data-range="start"]))
```

Полный селектор выглядит так (несмотря на то, что он длинный и сложный, до `:has()` такое вообще нельзя было провернуть):

```css
/* выбираем все элементы внутри диапазона */
[data-range="start"] ~ :has(~ [data-range="end"]):not([data-range]):not([data-range="end"] ~ :has(~ [data-range="start"]))
```

<iframe height="300" width="100%" scrolling="no" title="Multi-range element selectors with :has()" src="https://codepen.io/smashingmag/embed/VwBypzB?default-tab=html%2Cresult" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href="https://codepen.io/smashingmag/pen/VwBypzB">
  Multi-range element selectors with :has()</a> by Smashing Magazine (<a href="https://codepen.io/smashingmag">@smashingmag</a>)
  on <a href="https://codepen.io">CodePen</a>.
</iframe>

## Линейный выбор диапазона на основе состояния

Создадим компонент "звездного" рейтинга.

"Звезда" будет элементов `input` типа `radio` (радио-кнопкой), обладающей состоянием `:checked`:

```html
<div class="star-rating">
  <fieldset>
    <legend>Rate this demo</legend>
    <div class="stars">
      <label class="star">
        <input type="radio" name="rating" value="1">
        <span>1</span>
      </label>
      <!-- еще 4 звезды -->
    </div>
  </fieldset>
</div>
```

Функционал рейтинга:

- когда пользователь наводит курсор на звезду, звезды с первой по наведенную (диапазон) заливаются синим цветом;
- при выборе звезды, звезда и ее подпись увеличиваются в размерах, а заливка диапазона фиксируется;
- когда пользователь наводит курсор на звезду после выбранной, диапазон от выбранной звезды до наведенной заливается цветом;
- когда пользователь наводит курсор на звезду до выбранной, заливка диапазона от наведенной звезды до выбранной становится немного светлее.

Следующий набор селекторов применяется ко всем состояниям, где мы хотим заливать цветом звезду или звезды до выбранной звезды (`:checked`). Правило обновляет набор кастомных свойств, влияющих на фигуру звезды, созданную с помощью комбинации псевдоэлементов `::before` и `::after` на `label.star`.

Проще говоря, это правило выбирает диапазон звезд от первой до наведенной или от первой до выбранной:

```css
/* наведенная звезда */
.star:hover,
/* предыдущие сиблинги наведенной звезды */
.star:has(~ .star:hover),
/* выбранная звезда */
.star:has(:checked),
/* предыдущие сиблинги выбранной звезды */
.star:has(~ .star :checked) {
  --star-rating-bg: dodgerblue;
}
```

Далее мы хотим, чтобы цвет заливки диапазона звезд от наведенной до выбранной и самой выбранной звезды был немного светлее:

```css
/* сиблинги между наведенной и выбранной звездами */
.star:hover ~ .star:has(~ .star :checked),
/* выбранная звезда после наведенной */
.star:hover ~ .star:has(:checked) {
  --star-rating-bg: lightblue;
}
```

<iframe height="300" width="100%" scrolling="no" title="Star Rating Component with :has()" src="https://codepen.io/smashingmag/embed/ExpoWwv?default-tab=html%2Cresult" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href="https://codepen.io/smashingmag/pen/ExpoWwv">
  Star Rating Component with :has()</a> by Smashing Magazine (<a href="https://codepen.io/smashingmag">@smashingmag</a>)
  on <a href="https://codepen.io">CodePen</a>.
</iframe>

## Выбор нескольких диапазонов на основе состояния

`:has()` также позволяет визуализировать границы элементов на основе их состояния.

Если у нас имеется набор чекбоксов (`<input type="checkbox">`), мы можем использовать состояние `:checked` для определения границ вокруг выбранных и невыбранных элементов.

Допустим, что мы хотим, чтобы выбранный чекбокс имел границы и зеленый фон. При этом, группа выбранных чекбоксов должна иметь общие границы: первый чекбокс группы должен иметь только верхнюю границу, последний - только нижнюю, остальные - только боковые. Границы должны быть скругленными. Последний чекбокс группы также должен иметь небольшую тень.

Нам необходимо создать правила для обработки верхнего, нижнего и промежуточных чекбоксов в выбранной группе. Одиночные элементы должны получать все стили.

В нашей разметке все чекбоксы будут обернуты в подпись (`<label>`), поэтому все селекторы будут начинаться с `label:has(:checked)` для определения того, что подпись содержит выбранный чекбокс.

Следующее правило гласит "выбери выбранный элемент, перед которым _нет_ другого выбранного элемента", что совпадает с верхним выбранным чекбоксом группы и одиночным выбранным чекбоксом:

```css
label:has(:checked):not(label:has(:checked) + label)
```

Следующее правило гласит "выбери выбранный элемент, который _не_ следует за другим выбранным элементом", что совпадает с нижним выбранным чекбоксом и одиночным выбранным чекбоксом:

```css
label:has(:checked):not(label:has(+ label :checked))
```

Для стилизации промежуточных выбранных чекбоксом можно использовать просто `label:has(:checked)`, но давайте воспользуемся расширенным селектором, который уже имеется в нашем распоряжении.

Следующее правило гласит "выбери подписи с выбранными чекбоксами, которые следуют за сиблингами с выбранными чекбоксами", что совпадает со всеми выбранными чекбоксами, кроме последнего. Для выбора последнего чекбокса мы добавляем к этому только что созданный нами селектор:

```css
label:has(:checked):has(~ label :checked),
label:has(:checked):not(label:has(+ label :checked))
```

<iframe height="300" width="100%" scrolling="no" title="Stateful multi-range selection groups with :has()" src="https://codepen.io/smashingmag/embed/RwBxpjE?default-tab=html%2Cresult" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href="https://codepen.io/smashingmag/pen/RwBxpjE">
  Stateful multi-range selection groups with :has()</a> by Smashing Magazine (<a href="https://codepen.io/smashingmag">@smashingmag</a>)
  on <a href="https://codepen.io">CodePen</a>.
</iframe>

Все демонстрации из статьи доступны в [этой коллекции](https://codepen.io/collection/wapNEJ/327b65e9704d65901e397025ea2d51ba) на CodePen.

Ссылки на материалы для дополнительного изучения:

- Bramus Van Damme:
  - [Создание количественных запросов для "островков элементов" с помощью одного класса благодаря `:has()`](https://www.bram.us/2022/12/13/quantity-queries-for-islands-of-elements-with-the-same-class-thanks-to-css-has/);
  - [Реализация полифила `:nth-child(An+B [of S]?) с помощью `:has()` и `:not()`](https://www.bram.us/2022/12/14/a-nth-childanb-of-s-polyfill-thanks-to-css-has/);
  - [Стилизация родительского элемента на основе количества дочерних элементов с помощью `:has()`](https://www.bram.us/2022/11/17/style-a-parent-element-based-on-its-number-of-children-using-css-has/);
- Jhey Tompkins исследует практические и забавные возможности использования `:has()` в статье [`:has()`: семейный селектор](https://developer.chrome.com/blog/has-m105/);
- Jen Simmons рассматривает различные варианты совместного использования `:has()` и комбинаторов в статье [Использование `:has()` в качестве родительского селектора и не только](https://webkit.org/blog/13096/css-has-pseudo-class/);
- Adrian Bece рассматривает продвинутые возможности использования `:has()` в статье [Встречайте `:has`, нативный родительский селектор CSS (и не только)](https://www.smashingmagazine.com/2021/06/has-native-css-parent-selector/);
- Estelle Weyl исследует особенности поведения `:has()` в статье [CSS `:has()`](https://12daysofweb.dev/2022/css-has-selector/);
- Manuel Matuzović  рассматривает важное отличие между [`:has(:not())` и `:not(:has)`](https://www.matuzo.at/blog/2022/100daysof-day50/).

Надеюсь, что вы, как и я узнали что-то новое и не зря потратили время.

Благодарю за внимание и happy coding!
