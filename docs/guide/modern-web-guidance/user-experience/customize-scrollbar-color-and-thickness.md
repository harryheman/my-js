# Кастомизация цвета и толщины полосы прокрутки

Внешний вид полосы прокрутки можно кастомизировать с помощью стандартных свойств CSS `scrollbar-color` и `scrollbar-width`.

* `scrollbar-color`: принимает два значения `<color>`. Первый цвет применяется к ползунку (thumb) (движущаяся часть), а второй - к дорожке (track) (фиксированный фон).
* `scrollbar-width`: принимает `auto` (по умолчанию), `thin` (более тонкий вариант) или `none` (полностью скрывает скроллбар, сохраняя функционал прокрутки).

## Применение `scrollbar-color` и `scrollbar-width`

Используйте `scrollbar-color` и `scrollbar-width` на прокручиваемом контейнере.

Для `scrollbar-color` используйте переменные CSS для цветового разделения ползунка и дорожки для повышения читаемости и доступности (особенно, при использовании резервных вариантов).

```css
.scroller {
  --scrollbar-thumb: var(--color-neutral-70);
  --scrollbar-track: var(--color-neutral-90);

  scrollbar-color: var(--scrollbar-thumb) var(--scrollbar-track);
}
```

## Поддержка и страховка

`scrollbar-width` поддерживается всеми основными браузерами с 11.12.2024.
`scrollbar-color` - c 12.12.2025.

Эти свойства являются прогрессивными улучшениями и не всегда требуют страховки. В качестве таковой следует использовать нестандартные псевдоэлементы `::-webkit-scrollbar`.

Оборачивайте страховку в блок `@supports not (scrollbar-color: auto)` для предотвращения конфликтов между стандартными свойствами и устаревшими селекторами WebKit в современных браузерах.

Пользовательские свойства цвета автоматически передаются устаревшим селекторам WebKit. Дублировать их не нужно.

```css
@supports not (scrollbar-color: auto) {
  .scroller::-webkit-scrollbar {
    /* Необходимо определить базовый размер, чтобы кастомные цвета были видимыми */
    width: 12px;
    height: 12px;
  }

  .scroller::-webkit-scrollbar-thumb {
    background: var(--scrollbar-thumb);
  }

  .scroller::-webkit-scrollbar-track {
    background: var(--scrollbar-track);
  }
}
```
