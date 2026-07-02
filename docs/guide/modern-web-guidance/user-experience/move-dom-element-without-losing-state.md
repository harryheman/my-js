# Перемещение элемента DOM без потери состояния

При перемещении элементов DOM с помощью традиционных методов, таких как `appendChild()` или `insertBefore()`, браузер неявно удаляет элемент из DOM и затем добавляет его в новую локацию. Эта операция "удаления и вставки" сбрасывает много внутренних состояний: элементы `<iframe>` перезагружаются, анимация CSS перезапускается, а поля ввода теряют фокус.

Для перемещения элемента с сохранением фокуса следует использовать метод `moveBefore()`. Он выполняет атомарное перемещение, полностью пропуская шаги удаления и вставки.

## Перемещение элемента с сохранением состояния

Используйте `moveBefore()` точно также, как используете `insertBefore()`. Он принимает два аргумента: узел для перемещения и ссылку на узел, перед которым вставляется первый узел (или `null` для добавления узла в конец нового предка):

```javascript
const newParent = document.getElementById('new-parent');
const elementWithState = document.getElementById('iframe-or-focused-input');

// Используем `moveBefore()` для сохранения состояния.
// Передаем `null` в качестве второго аргумента для добавления элемента в конец нового предка
newParent.moveBefore(elementWithState, null);
```

## Поддержка и страховка

`moveBefore()` имеет ограниченную поддержку браузеров. Поддерживается в Chrome 133+, Edge 133+ (с февраля 2025 года) и Firefox 144+ (с октября 2025 года). Не поддерживается в Safari.

Поскольку `moveBefore()` - это прогрессивное улучшение, следует определять его поддержку перед вызовом, "откатываясь" к традиционным операциям `insertBefore()` или `appendChild()` в старых браузерах:

```javascript
const targetParent = document.getElementById('target-container');
const nodeToMove = document.getElementById('moving-element');

// Проверяем поддержку
if ('moveBefore' in Element.prototype) {
  targetParent.moveBefore(nodeToMove, null);
} else {
  // Резерв: традиционное перемещение.
  // Обратите внимание: это сбросит <iframe>, анимацию и состояние фокуса
  targetParent.insertBefore(nodeToMove, null);
}
```
