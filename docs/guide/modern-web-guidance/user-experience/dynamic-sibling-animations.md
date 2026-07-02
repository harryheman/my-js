# Создание каскадной анимации

Каскадная анимация предоставляет интересный эффект, когда несколько упорядоченных элементов анимируются последовательно с небольшой задержкой между ними, в отличие от анимации всех элементов одновременно. Эта техника часто используется в списках, галереях или меню навигации для направления взгляда пользователя и придания взаимодействиям отточенный, ритмичный характер.

## Реализация

Используйте функцию `sibling-index()` в свойстве `animation-delay`, чтобы анимация каждого элемента была смещена на величину, пропорциональную его позиции внутри родительского элемента. `sibling-index()` возвращает целое число, которое должно быть умножено на единицу времени для преобразования ее во время:

```css
#stagger-list > .item {
  --stagger-time: 0.1s;
  /* Сначала определяем анимацию */
  animation: fade-in 0.4s;
  /* Устанавливаем `animation-delay` в значение времени, умноженного на `sibling-index()` */
  animation-delay: calc(sibling-index() * var(--stagger-time))
}
```

Учитывайте предпочтения пользователей по снижению движения:

```css
@media (prefers-reduced-motion: reduce){
  #stagger-list > .item {
    animation: none;
  }
}
```

## Поддержка и страховка

Функции `sibling-count()` и `sibling-index()` имеют ограниченную поддержку браузеров. Поддерживаются в Chrome 138+, Edge 138+ (с июня 2025 года) и Safari 26.2+ (с декабря 2025 года). Не поддерживаются в Firefox.

Проверяйте поддержку для `sibling-index()` с помощью CSS через помощью `@supports (animation-delay: calc(sibling-index() * 0.1s)){}` или JavaScript через `!CSS.supports('animation-delay: calc(sibling-index() * 0.1s)')`.

Для поддержки каскадной анимации в старых браузерах используйте JavaScript для добавления кастомного свойства `--sibling-index` к каждому сиблингу. Оберните это в проверку `CSS.supports('animation-delay: calc(sibling-index() * 0.1s)')` во избежание запуска лишнего JavaScript:

```js
if(!CSS.supports('animation-delay: calc(sibling-index() * 0.1s)')){
  const staggerList = document.getElementById('stagger-list');
  [...staggerList.children].forEach((el, index)=>el.style.setProperty('--sibling-index', index + 1));
}
```

Добавьте объявление `animation-delay`, в котором используется кастомное свойство `--sibling-index`. Оно должно находиться перед объявлением `animation-delay`, в котором используется функция `sibling-index()`. Это не требует обертки `@supports` - старые браузеры не будут парсить второе объявление, а будут использовать первое:

```css
#stagger-list > .item {
  animation-delay: calc(var(--sibling-index) * var(--stagger-time));
  animation-delay: calc(sibling-index() * var(--stagger-time));
}
```
