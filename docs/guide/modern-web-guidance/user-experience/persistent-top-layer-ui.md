# Сохранение состояния UI верхнего уровня

При перемещении открытого `<dialog>`, `popover` или полноэкранного элемента в DOM с помощью традиционных методов, вроде `appendChild()` или `insertBefore()`, браузер неявно удаляет элемент из DOM и повторно вставляет его. Это удаление сбрасывает состояние, что приводит к резкому закрытию открытых модальных окон, поповеров и полноэкранных элементов.

Для изменения предка (reparenting) верхнеуровневого (top-layer) элемента без ухудшения пользовательского опыта или закрытия элемента используйте атомарный API `moveBefore()`.

## Изменение предка открытого верхнеуровневого элемента

`moveBefore()` принимает два аргумента: узел для перемещения и ссылку на узел, перед которым нужно вставить первый (или `null` для добавления в конец нового предка):

```javascript
const newParent = document.getElementById('new-container');
const dialogElement = document.getElementById('my-dialog');

// Используйте `moveBefore()` для сохранения открытости `<dialog>` или поповера.
// Передача `null` добавляет элемент в конец `newParent`
newParent.moveBefore(dialogElement, null);
```

## Поддержка и страховка

`moveBefore()` имеет ограниченную поддержку браузеров. Поддерживается в Chrome 133+, Edge 133+ (с февраля 2025 года) и Firefox 144+ (с октября 2025 года). Не поддерживается в Safari.

Поскольку `moveBefore()` - это прогрессивное улучшение, нужно использовать определение поддержки перед его вызовом. В старых браузерах будет происходить обычное изменение предка.

Для элементов `<dialog>` в браузерах без поддержки обычное перемещение закроет диалог. Для того, чтобы он остался открытым, нужно вручную открыть его повторно после перемещения:

```javascript
const targetParent = document.getElementById('target-container');
const popoverOrDialog = document.getElementById('my-top-layer-element');

// Проверяем поддержку `moveBefore()`
if ('moveBefore' in Element.prototype) {
  targetParent.moveBefore(popoverOrDialog, null);
} else {
  // Резерв: обычное перемещение.
  // Обратите внимание: это закроет `<dialog>`, поповер и полноэкранный элемент
  const wasOpen = popoverOrDialog.hasAttribute('open') || popoverOrDialog.matches(':popover-open');
  targetParent.insertBefore(popoverOrDialog, null);

  // Вручную восстанавливаем состояние, если возможно
  if (wasOpen && typeof popoverOrDialog.showModal === 'function') {
    popoverOrDialog.showModal();
  } else if (wasOpen && typeof popoverOrDialog.showPopover === 'function') {
    popoverOrDialog.showPopover();
  }
}
```
