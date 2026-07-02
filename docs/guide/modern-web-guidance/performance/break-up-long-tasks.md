# Разделение длинных задач

Тяжелые вычисления или длинные циклы могут блокировать основной поток, делая страницу неотзывчивой. Для предотвращения этого мы можем периодически возвращать управление браузеру. API `scheduler.yield()` позволяет приостановить выполнение длинной задачи и позволить браузеру обработать пользовательский ввод или выполнить рендеринг перед продолжением выполнения задачи.

## Разделение длинных задач

Используйте `scheduler.yield()` внутри асинхронной функции для разделения работы.

```javascript
async function processLargeArray(items) {
  // Устанавливаем дедлайн в 50 миллисекунд от настоящего времени. 50
  // мс - это порог, после которого задача становится длинной.
  let deadline = performance.now() + 50;

  for (const item of items) {
    // Обрабатываем элемент
    processItem(item);

    // Периодически возвращаем управление основному потоку, чтобы UI
    // оставался отзывчивым. Это делается путем проверки истечения дедлайна,
    // установленного ранее. После возврата управления, дедлайн сбрасывается.
    if (performance.now() >= deadline) {
      await scheduler.yield();
      deadline = performance.now() + 50;
    }
  }
}
```

## Поддержка

Scheduler API имеет ограниченную поддержку браузеров. Поддерживается в Chrome 129+, Edge 129+ (с сентября 2024 года) и Firefox 142+ (с августа 2025 года). Не поддерживается в Safari.

### Резерв `scheduler.yield()`

```javascript
async function processLargeArrayWithFallback(items) {
  // Устанавливаем дедлайн в 50 мс
  let deadline = performance.now() + 50;

  for (const item of items) {
    processItem(item);

    // Периодически возвращаем управление основному потоку, чтобы UI оставался отзывчивым
    if (performance.now() >= deadline) {
      // Определение поддержки scheduler.yield
      if ('scheduler' in window && 'yield' in window.scheduler) {
        await scheduler.yield();
      } else {
        // Откатываемся к setTimeout в старых браузерах
        await new Promise(resolve => setTimeout(resolve, 0));
      }
      deadline = performance.now() + 50;
    }
  }
}
```
