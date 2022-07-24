---
slug: sass-style
title: Разрабатываем дизайн-систему с помощью Sass
description: Туториал по разработке дизайн системы с помощью Sass
authors: harryheman
tags: [sass, scss, css, "design system", "css framework", styles, "дизайн-система", "css-фреймворк", стили]
image: https://habrastorage.org/webt/wx/8b/pq/wx8bpqxqrxavaxnglljyptwnpme.jpeg
---

<img src="https://habrastorage.org/webt/wx/8b/pq/wx8bpqxqrxavaxnglljyptwnpme.jpeg" />

Привет, друзья!

В данной статье мы разработаем простую, но относительно полноценную дизайн-систему для веб-приложения средствами [Sass](https://sass-scss.ru/).

Почему `Sass`? Потому что, кроме полной поддержки `CSS`, `Sass` предоставляет несколько интересных инструментов, позволяющих существенно сократить шаблонный код, в чем вы сами скоро убедитесь. На мой взгляд, несмотря на стремительное развитие `CSS` в последние годы, `Sass` продолжает оставаться актуальным, по крайней мере, при работе над серьезными проектами.

При разработке дизайн-системы в части терминологии, названий, значений переменных и т.п. я буду ориентироваться, в основном, на [Bootstrap](https://getbootstrap.com/) и немного на [Tailwind](https://tailwindcss.com/).

[Код проекта на GitHub](https://github.com/harryheman/Blog-Posts/tree/master/sass-style).

<!--truncate-->

Для работы с зависимостями будет использоваться [Yarn](https://yarnpkg.com/).

Для тестирования дизайн-системы можно воспользоваться одним из готовых шаблонов приложений, предоставляемых [Vite](https://vitejs.dev/), например:

```bash
# создаем шаблон приложения
# sass-style - название приложения и директории проекта
# --template vanilla - используемый шаблон
yarn create vite sass-style --template vanilla
# переходим в созданную директорию и устанавливаем зависимости
cd sass-style && yarn
# устанавливаем `sass` в качестве зависимости для разработки
yarn add -D sass
# запускаем приложение в режиме разработки
yarn dev
```

Создаем в корне проекта директорию `styles` и в ней - файл `index.scss`. Это основной файл стилей нашего приложения. Убедитесь, что он импортируется в файле `main.js`:

```javascript
import "./styles/index.scss";
```

## Сброс стилей

Реализуем минимальный сброс стилей.

Создаем директорию `styles/utils` и в ней - файл `_reset.scss` следующего содержания:

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}

body,
h1,
h2,
h3,
h4,
h5,
p,
figure,
picture {
  margin: 0;
}

h1,
h2,
h3,
h4,
h5,
h6,
p {
  font-weight: 400;
}

img,
picture {
  display: block;
  max-width: 100%;
}

input,
button,
textarea,
select {
  font: inherit;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }
}
```

Импортируем этот файл в `index.scss` и определяем еще парочку дефолтных стилей для `html` и `body`:

```css
@import "./utils/reset";

html {
  // о переменных см. ниже
  font-size: $fs-base;
}

body {
  font-family: Helvetica, sans-serif;
  color: $dark;
  line-height: 1.5;
}
```

## Переменные / Variables

Создаем файл `styles/_vars.scss` и определяем в нем несколько переменных:

```css
// минимальная и максимальная ширина области просмотра
$min-w: 375px;
$max-w: 1536px;

// отступы
$spacer-base: 30px;

$spacer-xxs: 0.25 * $spacer-base;
$spacer-xs: 0.5 * $spacer-base;
$spacer-s: 0.75 * $spacer-base;
$spacer-m: $spacer-base;
$spacer-l: 1.5 * $spacer-base;
$spacer-xl: 2 * $spacer-base;
$spacer-xxl: 2.25 * $spacer-base;

// шрифты
$fs-base: 16px;

$fs-xxs: 11px;
$fs-xs: 12px;
$fs-s: 14px;
$fs-m: $fs-base;
$fs-l: 22px;
$fs-xl: 24px;
$fs-xxl: 26px;

// цвета
// bootstrap
$primary: #0275d8;
$success: #5cb85c;
$info: #5bc0de;
$warning: #f0ad4e;
$danger: #d9534f;
$light: #f7f7f7;
$dark: #292b2c;
// дополнительно
$gray100: #fefefe;
$gray200: #fbfbfb;
$gray300: #fafafa;
$gray400: #f3f3f3;
$gray500: #eeeeee;
$gray600: #a3a3a3;
$gray700: #8c8c8c;
$gray800: #555555;
$gray900: #333333;
$white: #fff;
$black: #000;

// контрольные точки
// bootstrap
$sm: 576px;
$md: 768px;
$lg: 992px;
$xl: 1200px;
$xxl: 1400px;
```

Импортируем этот файл в начале `index.scss`:

```css
@import "./vars";
```

Это делает переменные доступными глобально - переменные будут доступны всем импортируемым в `index.scss` модулям.

Подробнее о переменных `Sass` можно почитать [здесь](https://sass-lang.com/documentation/variables).

## Отступы

Создаем файл `utils/_spacing.scss` следующего содержания:

```css
// перечисление отступов
$spacers: (
  "0": 0,
  xxs: $spacer-xxs,
  xs: $spacer-xs,
  s: $spacer-s,
  m: $spacer-m,
  l: $spacer-l,
  xl: $spacer-xl,
  xxl: $spacer-xxl
);

// типы отступов
$types: (
  "m": "margin",
  "p": "padding"
);

// стороны
$sides: (
  "": "",
  t: "-top",
  r: "-right",
  b: "-bottom",
  l: "-left"
);

// перебираем перечисление
@each $key-spacer, $factor in $spacers {
  // перебираем типы
  @each $key-type, $type in $types {
    // перебираем стороны
    @each $key-side, $side in $sides {
      // для всех и каждой стороны
      .#{$key-type}#{$key-side}-#{$key-spacer} {
        #{$type}#{$side}: $factor;
      }
    }

    // для горизонтального отступа
    .#{$key-type}x-#{$key-spacer} {
      #{$type}-left: $factor;
      #{$type}-right: $factor;
    }

    // для вертикального отступа
    .#{$key-type}y-#{$key-spacer} {
      #{$type}-bottom: $factor;
      #{$type}-top: $factor;
    }
  }

  // дополнительно
  // пространство между гридами или флексами
  .gap-#{$key-spacer} {
    gap: $factor;
  }
}
```

О директиве `@each` можно почитать [здесь](https://sass-lang.com/documentation/at-rules/control/each).

Это позволяет определять внешние (margin) и внутренние (padding) отступы следующим образом:

- `m` или `p` (в дальнейшем паддинг предполагается) - для отступов по всем сторонам, внешним или внутренним, соответственно. Например, `m-xs` компилируется в:

```css
margin-top: 15px;
margin-right: 15px;
margin-bottom: 15px;
margin-left: 15px;
```

- `mx/my` - для отступов по горизонтали/вертикали. Например, `mx-s` компилируется в:

```css
margin-right: 15px;
margin-left: 15px;
```

- `mt/mr/mb/ml` - для отступов с соответствующей стороны. Например, `mt-s` компилируется в:

```css
margin-top: 15px;
```

## Цвета

Создаем файл `utils/_colors.scss` следующего содержания:

```css
// перечисление цветов
$colors: (
  'gray100': $gray100,
  'gray200': $gray200,
  'gray300': $gray300,
  'gray400': $gray400,
  'gray500': $gray500,
  'gray600': $gray600,
  'gray700': $gray700,
  'gray800': $gray800,
  'gray900': $gray900,
  'primary': $primary,
  'success': $success,
  'info': $info,
  'warning': $warning,
  'danger': $danger,
  'light': $light,
  'dark': $dark,
  'white': $white,
  'black': $black
);

// перебираем перечисление
@each $name, $color in $colors {
  // цвет текста
  .color-#{$name} {
    color: $color;
  }

  // цвет фона
  .bg-#{$name} {
    background-color: $color;
  }

  // заливка `svg`
  .fill-#{$name} {
    svg {
      color: $color;
    }
  }
}
```

Это позволяет определять цвет текста, фона или заливки для `SVG`. Например, `color-primary` компилируется в:

```css
color: #0275d8;
```

`bg-success` в:

```css
background-color: #5cb85c;
```

## Размеры шрифтов и блоков

Создаем файл `utils/_font.scss` следующего содержания:

```css
// перечисление размеров шрифта
$font-sizes: (
  "0": 0,
  xxs: $fs-xxs,
  xs: $fs-xs,
  s: $fs-s,
  m: $fs-m,
  l: $fs-l,
  xl: $fs-xl,
  xxl: $fs-xxl
);

// перебираем перечисление
@each $size, $factor in $font-sizes {
  .fs-#{$size} {
    font-size: $factor;
  }
}

// перебираем возможные значения свойства `font-weight`
@each $v in 100, 200, 300, 400, 500, 600, 700, 800, 900 {
  .fw-#{$v} {
    font-weight: $v;
  }
}
```

`fs-s` компилируется в:

```css
font-size: 14px;
```

`fw-600` в:

```css
font-weight: 600;
```

Создаем файл `utils/_sizing.scss` следующего содержания:

```css
@each $v in 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 {
  .w-#{$v} {
    width: calc(100% / 12 * $v);
  }

  .h-#{$v} {
    height: calc(100% / 12 * $v);
  }
}

// дополнительно
.w-full {
  width: 100vw;
}

.h-full {
  height: 100vh;
}
```

Это позволяет распределять ширину и высоту блоков по сетке, состоящей из 12 равных частей. Об этом можно думать так: сколько колонок/строк должен занимать блок? Например, `w-4` компилируется в:

```css
width: 33.3333333333%;
```

`h-2` в:

```css
height: 16.6666666667%;
```

Пример:

```html
<div style="display: flex" class="w-full h-full">
  <div class="w-2 h-4 bg-primary"></div>
  <div class="w-6 h-4 bg-success"></div>
  <div class="w-4 h-4 bg-danger"></div>
</div>
```

Результат:

<img src="https://habrastorage.org/webt/af/jh/nc/afjhnc3pubavljxx4ljgehnko2s.png" />
<br />

## Флекс

Создаем файл `utils/_flex.scss` следующего содержания:

```css
// justify-content
@each $v in start, end, center, stretch, between, around, evenly {
  .justify-#{$v} {
    @if ($v == start) or ($v == end) {
      justify-content: flex-#{$v};
    } @else if ($v == between) or ($v == around) or ($v == evenly) {
      justify-content: space-#{$v};
    } @else {
      justify-content: $v;
    }
  }
}

// align-items
@each $v in start, end, center, stretch {
  .items-#{$v} {
    @if ($v == start) or ($v == end) {
      align-items: flex-#{$v};
    } @else {
      align-items: $v;
    }
  }
}

// дополнительно
.flex-center {
  // о миксинах см. ниже
  @include flex-center();
}

.flex-center-column {
  @include flex-center(column);
}

.flex-wrap {
  flex-wrap: wrap;
}

.flex {
  flex: 1;
}
```

При желании, таким же способом можно определить `justify-items`, `align-content`, `justify-self` и `align-self`.

## Утилиты

Создаем файл `utils/_utils.scss` следующего содержания:

```css
// display
@each $v in none, inline, block, inline-block, flex, inline-flex, grid,
  inline-grid
{
  .d-#{$v} {
    display: $v;
  }
}

// position
@each $v in relative, absolute, fixed, sticky {
  .p-#{$v} {
    position: $v;
  }
}

// контент для читалок
// visually-hidden
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

// дополнительно
.text-overflow {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.text-center {
  text-align: center;
}

// ваши классы-утилиты
```

Перепишем последний пример:

```html
<div class="w-full h-full d-flex gap-xxs">
  <div class="w-2 h-4 bg-primary flex-center">
    <p class="fs-xl color-success">box#1</p>
  </div>
  <div class="w-6 h-4 bg-success d-flex justify-end items-end">
    <p class="pr-s fs-xl color-primary">box#2</p>
  </div>
  <div class="w-4 h-4 bg-danger d-flex items-end">
    <p class="pl-s fs-xl color-gray300">box#3</p>
  </div>
</div>
```

Результат:

<img src="https://habrastorage.org/webt/qz/lk/zc/qzlkzcx2euctmbz6p6ywz6mjqca.png" />
<br />

Не забываем импортировать все утилиты в `index.scss`.

На этом с основами дизайн-системы мы закончили. Остальное зависит от потребностей конкретного приложения и личных предпочтений разработчика.

## Бонус

### Функции / Functions

В числе прочего, `Sass` позволяет создавать функции для выполнения операций над значениями свойств `CSS`.

Определим функцию для преобразования `px` в `rem`.

Создаем файл `styles/_fns.scss` следующего содержания:

```css
@function strip-unit($v) {
  @return $v / ($v * 0 + 1);
}

@function rem($v) {
  @return #{strip-unit($v / $fs-base)} + rem;
}
```

Функция `strip-unit` позволяет игнорировать `px` в передаваемом функции значении.

Пример использования функции `rem`:

```css
p {
  font-size: rem(16);
  // или
  font-size: rem(16px);
  // или
  font-size: rem($fs-m);
}

// после компиляции
p {
  font-size: 0.8888888889rem
}
```

Подробнее о функциях можно почитать [здесь](https://sass-lang.com/documentation/at-rules/function).

## Миксины / Mixins

Миксин - это блок готовых стилей, которые включаются в другие стили.

Миксин определяется с помощью директивы `@mixin` и внедряется с помощью директивы `@include`.

Создаем файл `styles/_mixins.scss`.

Определяем миксин для выравнивания элемента по центру с помощью `display: flex`:

```css
@mixin flex-center($d: row) {
  display: flex;
  justify-content: center;
  align-items: center;

  @if ($d == column) {
    flex-direction: column;
  }
}
```

Мы видели пример использования данного миксина в `utils/_flex.scss`.

О директивах `@if` и `@else` можно почитать [здесь](https://sass-lang.com/documentation/at-rules/control/if).

Определяем миксин для стилизации плейсхолдера:

```css
@mixin placeholder {
  &.placeholder {
    @content;
  }
  &:-moz-placeholder {
    @content;
  }
  &::-moz-placeholder {
    @content;
  }
  &:-ms-input-placeholder {
    @content;
  }
  &::-webkit-input-placeholder {
    @content;
  }
}
```

Директива-переменная `@content` содержит стили, передаваемые миксину.

Пример использования:

```css
input {
  @include placeholder {
    color: $primary;
    font-size: 0.8rem;
    opacity: 0.8;
  }
}
```

Результат после компиляции:

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

Определяем миксин для стилизации прокрутки:

```css
@mixin scrollbar($scrollbar-width, $thumb-color, $track-color) {
  &::-webkit-scrollbar {
    width: #{$scrollbar-width} + px;
  }

  &::-webkit-scrollbar-track {
    background-color: $track-color;
  }

  &::-webkit-scrollbar-thumb {
    background-color: $thumb-color;
  }

  // firefox
  & {
    @if ($scrollbar-width == 0) {
      scrollbar-width: none;
      // приблизительное значение
    } @else if ($scrollbar-width < 19) {
      scrollbar-width: thin;
    } @else {
      scrollbar-width: auto;
    }
    scrollbar-color: $thumb-color $track-color;
  }
}
```

Пример использования:

```css
@use "sass:color";

html {
  @include scrollbar(12, lighten($primary, 25), $gray500);
}
```

Функция `lighten` из [встроенного модуля](https://sass-lang.com/documentation/modules) `sass:color` позволяет осветлять цвета.

Определяем миксины - альтернативу медиа-запросам:

```css
// перечисление контрольных точек
$breakpoints: (
  "sm": $sm,
  "md": $md,
  "lg": $lg,
  "xl": $xl,
  "xxl": $xxl
);

// от указанной точки и шире
@mixin up($b) {
  @if map-has-key($breakpoints, $b) {
    $v: map-get($breakpoints, $b);

    @media (min-width: $v) {
      @content;
    }
  }
}

// от указанной точки и уже
@mixin down($b) {
  @if map-has-key($breakpoints, $b) {
    $v: map-get($breakpoints, $b);

    @media (max-width: $v) {
      @content;
    }
  }
}
```

Пример использования `up`:

```css
h1 {
  font-size: rem(18);

  // > 768px
  @include up(md) {
    font-size: rem(24);
    font-weight: bold;
  }

  // > 1200px
  @include up(xl) {
    font-size: rem(30);
  }
}
```

В качестве последнего упражнения - миксин для изменения размера шрифта пропорционально изменению ширины области просмотра:

```css
@mixin fluid-fs($min-w, $max-w, $min-fs, $max-fs) {
  $u1: unit($min-w);
  $u2: unit($max-w);
  $u3: unit($min-fs);
  $u4: unit($max-fs);

  @if $u1 == $u2 and $u1 == $u3 and $u1 == $u4 {
    & {
      font-size: $min-fs;

      @media (min-width: $min-w) {
        font-size: calc(
          #{$min-fs} + #{strip-unit($max-fs - $min-fs)} *
            ((100vw - #{$min-w}) / #{strip-unit($max-w - $min-w)})
        );
      }

      @media (min-width: $max-w) {
        font-size: $max-fs;
      }
    }
  }
}
```

Пример использования:

```css
html {
  @include fluid-fs($min-w, $max-w, $fs-xs, $fs-xl);
}
```

При изменении ширины области просмотра размер шрифта элемента `html` (`:root`) будет пропорционально меняться от `12` до `24px`. В случае применения единиц измерения `rem`, размер шрифта вычисляется от базового, т.е. размера шрифта `html`. Таким образом, заранее позаботившись об установке размеров в `rem` или применении одноименной функции, можно автоматически получить гибкую систему шрифтов во всем приложении.

Пожалуй, это все, чем я хотел поделиться с вами в данной статье. Надеюсь, вы узнали для себя что-то новое и не зря потратили время.

Благодарю за внимание и happy coding!
