# `CSS & SASS` Cheatsheet :metal:

[На главную](../README.md)

### Содержание

- [CSS](#css)
  - [Bootstrap Colors & Breakpoints](#bootstrap-colors--breakpoints)
  - [Custom Checkbox & Radio](#custom-checkbox--radio)
  - [Custom Scrollbar](#custom-scrollbar)
  - [Custom Placeholder](#custom-placeholder)
  - [Visually Hidden](#visually-hidden)
- [SASS](#sass)
  - [Bootstrap Colors & Breakpoints](#bootstrap-colors--breakpoints-1)
  - [Strip Unit Function](#strip-unit-function)
  - [Rem Function](#rem-function)
  - [Reset Mixin](#reset-mixin)
  - [Flex Center Mixin](#flex-center-mixin)
  - [Placeholder Mixin](#placeholder-mixin)
  - [Fluid Font Mixin](#fluid-font-mixin)
  - [Arrow Mixin](#arrow-mixin)
  - [Respond Above Mixin](#respond-above-mixin)

## CSS

### Bootstrap Colors & Breakpoints

```css
:root {
  --primary: #0275d8;
  --success: #5cb85c;
  --info: #5bc0de;
  --warning: #f0ad4e;
  --danger: #d9534f;
  --light: #f7f7f7;
  --dark: #292b2c;

  --sm: 576px;
  --md: 768px;
  --lg: 992px;
  --xl: 1200px;
  --xxl: 1400;
}
```

### Custom Checkbox & Radio

__Checkbox__

```html
<input type="checkbox" class="custom-checkbox" id="happy" name="happy" value="yes">
<label for="happy">Happy</label>
```

```css
.custom-checkbox {
  position: absolute;
  z-index: -1;
  opacity: 0;
}

.custom-checkbox + label {
  display: inline-flex;
  align-items: center;
  user-select: none;
  cursor: pointer;
}

.custom-checkbox + label::before {
  margin-right: 0.5em;
  content: '';
  display: inline-block;
  width: 1em;
  height: 1em;
  flex-shrink: 0;
  flex-grow: 0;
  border: 1px solid #adb5bd;
  border-radius: 0.25em;
  background-repeat: no-repeat;
  background-position: center center;
  background-size: 75% 75%;
  transition: 0.1s ease-in-out;
}

.custom-checkbox:checked + label::before {
  border-color: #0b76ef;
  background-color: #0b76ef;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'%3e%3cpath fill='%23fff' d='M6.564.75l-3.59 3.612-1.538-1.55L0 4.26 2.974 7.25 8 2.193z'/%3e%3c/svg%3e");
}

/* hover */
.custom-checkbox:not(:disabled):not(:checked) + label:hover::before {
  border-color: #b3d7ff;
}
/* active */
.custom-checkbox:not(:disabled):active + label::before {
  background-color: #b3d7ff;
  border-color: #b3d7ff;
}
/* focus */
.custom-checkbox:focus + label::before {
  box-shadow: 0 0 0 0.1rem rgba(0, 123, 255, 0.25);
}
/* focus & !checked */
.custom-checkbox:focus:not(:checked) + label::before {
  border-color: #80bdff;
}
/* disabled */
.custom-checkbox:disabled + label::before {
  background-color: #e9ecef;
}
```

__Radio__

```html
<div>
  <input
    class="custom-radio"
    name="color"
    type="radio"
    id="color-red"
    value="red"
  />
  <label for="color-red">Red</label>
</div>
<div>
  <input
    class="custom-radio"
    name="color"
    type="radio"
    id="color-green"
    value="green"
  />
  <label for="color-green">Green</label>
</div>
<div>
  <input
    class="custom-radio"
    name="color"
    type="radio"
    id="color-blue"
    value="blue"
  />
  <label for="color-blue">Blue</label>
</div>
```

```css
.custom-radio {
  position: absolute;
  z-index: -1;
  opacity: 0;
}

.custom-radio + label {
  display: inline-flex;
  align-items: center;
  user-select: none;
  cursor: pointer;
}

.custom-radio + label::before {
  margin-right: 0.5em;
  content: '';
  display: inline-block;
  width: 1em;
  height: 1em;
  flex-shrink: 0;
  flex-grow: 0;
  border: 1px solid #adb5bd;
  border-radius: 50%;
  background-repeat: no-repeat;
  background-position: center center;
  background-size: 60% 60%;
  transition: 0.1s ease-in-out;
}
/* hover */
.custom-radio:not(:disabled):not(:checked) + label:hover::before {
  border-color: #b3d7ff;
}
/* active */
.custom-radio:not(:disabled):active + label::before {
  background-color: #b3d7ff;
  border-color: #b3d7ff;
}
/* focus */
.custom-radio:focus + label::before {
  box-shadow: 0 0 0 0.1rem rgba(0, 123, 255, 0.25);
}
/* focus & !checked */
.custom-radio:focus:not(:checked) + label::before {
  border-color: #80bdff;
}
/* checked */
.custom-radio:checked + label::before {
  border-color: #0b76ef;
  background-color: #0b76ef;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='-4 -4 8 8'%3e%3ccircle r='3' fill='%23fff'/%3e%3c/svg%3e");
}
/* disabled */
.custom-radio:disabled + label::before {
  background-color: #e9ecef;
}
```

### Custom Scrollbar

```css
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background-color: #e0e0e0;
}

::-webkit-scrollbar-thumb {
  box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);
  background-color: deepskyblue;
  border-radius: 2px;
}
```

### Custom Placeholder

```css
::-webkit-input-placeholder {
  font-size: 0.8rem;
  opacity: 0.8;
}
::-moz-placeholder {
  font-size: 0.8rem;
  opacity: 0.8;
}
:-moz-placeholder {
  font-size: 0.8rem;
  opacity: 0.8;
}
:-ms-input-placeholder {
  font-size: 0.8rem;
  opacity: 0.8;
}
```

### Visually Hidden

```css
.visually-hidden {
  position: absolute;
  top: -150%;
  z-index: -100;
  width: 0;
  height: 0;
  opacity: 0;
  visibility: hidden;
  user-select: none;
  pointer-events: none;
  cursor: none;
  margin: 0;
  padding: 0;
  overflow: hidden;
  border: none;
  outline: none;
  white-space: nowrap;
}
```

## SASS

### Bootstrap Colors & Breakpoints

```scss
$primary: #0275d8;
$success: #5cb85c;
$info: #5bc0de;
$warning: #f0ad4e;
$danger: #d9534f;
$light: #f7f7f7;
$dark: #292b2c;

$sm: 576px;
$md: 768px;
$lg: 992px;
$xl: 1200px;
$xxl: 1400;
```

### Strip Unit Function

```scss
@function strip-unit($value) {
  @return $value / ($value * 0 + 1);
}
```

### Rem Function

```scss
$base-font-size: 16px;

@function rem($size) {
  @return #{strip-unit($size / $base-font-size)} + rem;
}

div.box {
  width: rem(320);
  height: rem(320);
  background-color: deepskyblue;
}
```

### Reset Mixin

```scss
@mixin reset($font-family, $font-size, $color) {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  @if $font-family {
    font-family: $font-family;
  }
  @if $font-size {
    font-size: $font-size;
  }
  @if $color {
    color: $color;
  }
}

* {
  @include reset('Montserrat', 1rem, $dark);
}
```

### Flex Center Mixin

```html
<ul className='row'>
  <li>1</li>
  <li>2</li>
  <li>3</li>
</ul>
<ul className='col'>
  <li>1</li>
  <li>2</li>
  <li>3</li>
</ul>
```

```scss
@mixin flex-center($column: false) {
  display: flex;
  justify-content: center;
  align-items: center;

  @if $column {
    & {
      flex-direction: column;
    }
  }
}

ul {
  list-style: none;
  gap: 1rem;

  &.row {
    @include flex-center;
  }

  &.col {
    @include flex-center(true);
  }
}
```

### Placeholder Mixin

```scss
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

input,
textarea {
  @include placeholder {
    font-size: 0.8rem;
    opacity: 0.8;
  }
}
```

### Fluid Font Mixin

```scss
@mixin fluid-type($min-vw, $max-vw, $min-font-size, $max-font-size) {
  $u1: unit($min-vw);
  $u2: unit($max-vw);
  $u3: unit($min-font-size);
  $u4: unit($max-font-size);

  @if $u1 == $u2 and $u1 == $u3 and $u1 == $u4 {
    & {
      font-size: $min-font-size;

      @media (min-width: $min-vw) {
        font-size: calc(
          #{$min-font-size} + #{strip-unit($max-font-size - $min-font-size)} *
            ((100vw - #{$min-vw}) / #{strip-unit($max-vw - $min-vw)})
        );
      }

      @media (min-width: $max-vw) {
        font-size: $max-font-size;
      }
    }
  }
}

$min_width: 320px;
$max_width: 1280px;
$min_font: 16px;
$max_font: 24px;

html {
  @include fluid-type($min_width, $max_width, $min_font, $max_font);
}
```

### Arrow Mixin

```html
<div className='arrow'>
  <div className='top'></div>
  <div className='inner'>
    <div className='left'></div>
    <div className='right'></div>
  </div>
  <div className='bottom'></div>
</div>
```

```scss
@mixin arrow($dir: left, $size: 10px, $color: #3c3c3c) {
  width: 0;
  height: 0;

  @if ($dir == left) {
    border-top: $size solid transparent;
    border-bottom: $size solid transparent;
    border-right: $size solid $color;
  } @else if ($dir == right) {
    border-top: $size solid transparent;
    border-bottom: $size solid transparent;
    border-left: $size solid $color;
  } @else if ($dir == bottom) {
    border-left: $size solid transparent;
    border-right: $size solid transparent;
    border-top: $size solid $color;
  } @else {
    border-left: $size solid transparent;
    border-right: $size solid transparent;
    border-bottom: $size solid $color;
  }
}

.arrow {
  @include flex-center(true);
  .inner {
    @include flex-center;
    gap: 1rem;
  }
  .left {
    @include arrow;
  }
  .right {
    @include arrow(right);
  }
  .top {
    @include arrow(top);
  }
  .bottom {
    @include arrow(bottom);
  }
}
```

### Respond Above Mixin

```scss
$breakpoints: (
  'sm': $sm,
  'md': $md,
  'lg': $lg,
  'xl': $xl,
  'xxl': $xxl
);

@mixin respond-above($breakpoint) {
  @if map-has-key($breakpoints, $breakpoint) {
    $breakpoint-value: map-get($breakpoints, $breakpoint);

    @media (min-width: $breakpoint-value) {
      @content;
    }
  }
}

h1 {
  font-size: rem(18px);
  line-height: 150%;
  font-weight: normal;

  @include respond-above(md) {
    font-size: rem(24px);
    font-weight: bold;
  }

  @include respond-above(lg) {
    font-size: rem(30px);
  }
}
```