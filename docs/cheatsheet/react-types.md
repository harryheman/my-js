---
sidebar_position: 14
title: Выдержки из определений типов TypeScript для React
description: Выдержки из определений типов TypeScript для React
keywords: ['javascript', 'js', 'react.js', 'reactjs', 'react', 'typescript', 'ts', 'type definitions', 'types', 'cheatsheet', 'шпаргалка', 'определения типов', 'типы']
tags: ['javascript', 'js', 'react.js', 'reactjs', 'react', 'typescript', 'ts', 'type definitions', 'types', 'cheatsheet', 'шпаргалка', 'определения типов', 'типы']
---

# React Types

> [Источник](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/react/index.d.ts).

## Хуки

### Общие типы

```ts
//  В отличие от `setState` в классовых компонентах обновления в функциональных компонентах не могут быть частичными
// S - state, состояние, prevState - previousState, предыдущее состояние
type SetStateAction<S> = S | ((prevState: S) => S)

type Dispatch<A> = (value: A) => void

// Поскольку `action` может иметь значение `undefined`, `dispatch` может вызываться без параметров
type DispatchWithoutAction = () => void

// В отличие от `redux`, операции могут быть чем угодно (могут иметь любую форму, т.е. не обязательно должны содержать свойства `type` и `payload`)
type Reducer<S, A> = (prevState: S, action: A) => S

// Если `useReducer` принимает редуктора без операции, `dispatch` может вызываться без параметров
type ReducerWithoutAction<S> = (prevState: S) => S

type ReducerState<R extends Reducer<any, any>> = R extends Reducer<infer S, any> ? S : never
type ReducerAction<R extends Reducer<any, any>> = R extends Reducer<any, infer A> ? A : never

// Проверка идентичности осуществляется с помощью алгоритма `SameValue` (Object.is), который является более строгим, чем `===`
type ReducerStateWithoutAction<R extends ReducerWithoutAction<any>> =
    R extends ReducerWithoutAction<infer S> ? S : never

// Массив зависимостей
type DependencyList = ReadonlyArray<unknown>

// Обратите внимание: колбеки могут возвращать только `void` или `destructor`
type EffectCallback = () => (void | Destructor)

// Изменяемый (мутабельный) объект, на который указывает ссылка (ref)
interface MutableRefObject<T> {
    current: T
}
```

### useContext

```ts
/**
  * Принимает объект контекста (значение, возвращаемое `React.createContext`) и возвращает текущее
  * значение контекста, полученное от ближайшего провайдера контекста
  *
  * https://reactjs.org/docs/hooks-reference.html#usecontext
  */
function useContext<T>(context: Context<T>): T
```

### useState

```ts
/**
  * Возвращает значение состояния и функцию для его обновления
  * Принимает один аргумент - значение начального состояния
  * в виде примитива, объекта или функции
  *
  * https://reactjs.org/docs/hooks-reference.html#usestate
  */
function useState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>]

// В случае вызова `useState` без аргументов, возвращается `undefined`
function useState<S = undefined>(): [S | undefined, Dispatch<SetStateAction<S | undefined>>]
```

## useReducer

```ts
/**
  * Альтернатива `useState`.
  *
  * Обычно, `useReducer` используется при наличии сложного состояния, включающего
  * вложенные свойства. Он также позволяет оптимизировать производительность компонентов, запускающих глубокие
  * обновления за счет передачи `dispatch` вместо колбеков
  *
  * Принимает редуктора, значение начального состояния и функцию "ленивой" инициализации состояния
  *
  * https://reactjs.org/docs/hooks-reference.html#usereducer
  */
// `useReducer` может вызываться без аргументов
function useReducer<R extends ReducerWithoutAction<any>, I>(
    reducer: R,
    initializerArg: I,
    initializer: (arg: I) => ReducerStateWithoutAction<R>
): [ReducerStateWithoutAction<R>, DispatchWithoutAction]

// или
function useReducer<R extends Reducer<any, any>, I>(
    reducer: R,
    initializerArg: I & ReducerState<R>,
    initializer: (arg: I & ReducerState<R>) => ReducerState<R>
): [ReducerState<R>, Dispatch<ReducerAction<R>>]

// `I` может быть подмножеством `ReducerState<R>`, используется для автозавершения.
// Если `I` полностью совпадает с `ReducerState<R>`, тогда функция инициализации будет опущена:
// в этом случае предполагается, что инициализатором является функция идентификации `(x => x)`
function useReducer<R extends Reducer<any, any>, I>(
    reducer: R,
    initializerArg: I & ReducerState<R>,
    initializer: (arg: I & ReducerState<R>) => ReducerState<R>
): [ReducerState<R>, Dispatch<ReducerAction<R>>]

// `I` может иметь любое значение, инициализатор преобразует его в `ReducerState<R>`
function useReducer<R extends Reducer<any, any>, I>(
    reducer: R,
    initializerArg: I,
    initializer: (arg: I) => ReducerState<R>
): [ReducerState<R>, Dispatch<ReducerAction<R>>]
```

### useRef

```ts
/**
  * `useRef` возвращает изменяемый (мутируемый) объект, на который указывает ссылка. Свойство `current` данного объекта инициализируется с помощью передаваемого аргумента
  * (`initialValue`). Этот объект сохраняется на протяжении всего жизненного цикла компонента
  *
  * Обратите внимание, что `useRef()` может использоваться не только для получения ссылок на DOM-элементы с помощью атрибута `ref`. В нем можно сохранять любое изменяемое
  * значение по аналогии с тем, как используются поля экземпляров в классах
  *
  * https://reactjs.org/docs/hooks-reference.html#useref
  */
function useRef<T extends unknown>(initialValue: T): MutableRefObject<T>

// `useRef`, как правило, вызывается с аргументом `null`
function useRef<T extends unknown>(initialValue: T | null): RefObject<T>

// В случае, когда `useRef` вызывается без аргументов, возвращается `undefined`
function useRef<T extends unknown = undefined>(): MutableRefObject<T | undefined>
```

### useEffect

```ts
/**
  * Принимает функцию, содержащую императивный код с возможными побочными (посторонними) эффектами
  *
  * `effect` - императивная функция, которая может возвращать функцию очистки
  * `deps` - массив зависимостей, если присутствует, эффект будет запускаться только при изменении элементов-значений
  *
  * https://reactjs.org/docs/hooks-reference.html#useeffect
  */
function useEffect(effect: EffectCallback, deps?: DependencyList): void
```

### useLayoutEffect

```ts
/**
  * Сигнатура идентична `useEffect`, но данная функция запускается синхронно после завершения всех манипуляций с DOM.
  * Используется для "чтения" слоя DOM и синхронного повторного рендеринга. Обновления, запланированные в
  * `useLayoutEffect` выполняются синхронно перед отрисовкой макета страницы браузером
  *
  * По-возможности, следует использовать `useEffect` во избежание блокировки визуальных обновлений
  *
  * https://reactjs.org/docs/hooks-reference.html#uselayouteffect
  */
function useLayoutEffect(effect: EffectCallback, deps?: DependencyList): void
```

### useCallback

```ts
// В случае с `useCallback` и `useMemo`, массив зависимостей или входных значений (deps, inputs) является обязательным, поскольку нет смысла выполнять мемоизацию без мемоизируемых значений
// useCallback(X) идентичен использованию X, useMemo(() => Y) идентичен использованию Y.
/**
  * `useCallback` возвращает мемоизированную (сохраненную, записанную в оперативную память) версию колбека, который меняется только при изменении входных значений
  *
  * https://reactjs.org/docs/hooks-reference.html#usecallback
  */
function useCallback<T extends (...args: never[]) => unknown>(callback: T, deps: DependencyList): T
```

### useMemo

```ts
/**
  * `useMemo` повторно вычисляет мемоизированное значение только при изменении зависимостей.
  *
  * При вызове `useMemo` со ссылкой на функцию, данная функция должна быть указана в качестве зависимости
  *
  * ```ts
  * function expensive () { ... }
  *
  * function Component () {
  *   const expensiveResult = useMemo(expensive, [expensive])
  *   return ...
  * }
  * ```
  *
  * https://reactjs.org/docs/hooks-reference.html#usememo
  */
// Несмотря на то, что массив зависимостей технически может иметь значение `undefined`, скорее всего, это ошибка
function useMemo<T>(factory: () => T, deps: DependencyList | undefined): T
```

### createContext

```ts
interface ExoticComponent<P = {}> {
  (props: P): (ReactElement | null)
  readonly $$typeof: symbol
}

interface ProviderExoticComponent<P> extends ExoticComponent<P> {
  propTypes?: WeakValidationMap<P>
}

type ContextType<C extends Context<any>> = C extends Context<infer T> ? T : never

type Provider<T> = ProviderExoticComponent<ProviderProps<T>>
type Consumer<T> = ExoticComponent<ConsumerProps<T>>

// !
interface Context<T> {
  Provider: Provider<T>
  Consumer: Consumer<T>
  displayName?: string
}

function createContext<T>(
  defaultValue: T,
): Context<T>
```

### createRef

```ts
interface RefObject<T> {
  readonly current: T | null
}

function createRef<T>(): RefObject<T>
```

## Система событий

```ts
// Общий интерфейс событий
interface BaseSyntheticEvent<E = object, C = any, T = any> {
  nativeEvent: E
  currentTarget: C
  target: T
  bubbles: boolean
  cancelable: boolean
  defaultPrevented: boolean
  eventPhase: number
  isTrusted: boolean
  preventDefault(): void
  isDefaultPrevented(): boolean
  stopPropagation(): void
  isPropagationStopped(): boolean
  persist(): void
  timeStamp: number
  type: string
}

/**
* currentTarget - ссылка на элемент, на котором зарегистрирован обработчик
*
* target - сыллка на элемент, вызвавший событие.
* Обычно, это потомок элемента, на котором зарегистрирован обработчик
*/
interface SyntheticEvent<T = Element, E = Event> extends BaseSyntheticEvent<E, EventTarget & T, EventTarget> {}

// Буфер обмена
interface ClipboardEvent<T = Element> extends SyntheticEvent<T, NativeClipboardEvent> {
  clipboardData: DataTransfer
}

// Композиция
interface CompositionEvent<T = Element> extends SyntheticEvent<T, NativeCompositionEvent> {
  data: string
}

// Перетаскивание и бросание
interface DragEvent<T = Element> extends MouseEvent<T, NativeDragEvent> {
  dataTransfer: DataTransfer
}

// Указатель
interface PointerEvent<T = Element> extends MouseEvent<T, NativePointerEvent> {
  pointerId: number
  pressure: number
  tangentialPressure: number
  tiltX: number
  tiltY: number
  twist: number
  width: number
  height: number
  pointerType: 'mouse' | 'pen' | 'touch'
  isPrimary: boolean
}

// Фокус
interface FocusEvent<T = Element> extends SyntheticEvent<T, NativeFocusEvent> {
  relatedTarget: EventTarget | null
  target: EventTarget & T
}

// Форма
interface FormEvent<T = Element> extends SyntheticEvent<T> {
}

// Провал валидации
interface InvalidEvent<T = Element> extends SyntheticEvent<T> {
  target: EventTarget & T
}

// Изменение
interface ChangeEvent<T = Element> extends SyntheticEvent<T> {
  target: EventTarget & T
}

// Клавиатура
interface KeyboardEvent<T = Element> extends SyntheticEvent<T, NativeKeyboardEvent> {
  altKey: boolean
  /** признано устаревшим */
  charCode: number
  ctrlKey: boolean
  code: string
  /**
    * [DOM Level 3 Events spec](https://www.w3.org/TR/uievents-key/#keys-modifier) - список валидных (чувствительных к регистру) аргументов для данного метода
    */
  getModifierState(key: string): boolean
  /**
    * [DOM Level 3 Events spec](https://www.w3.org/TR/uievents-key/#named-key-attribute-values) - возможные значения
    */
  key: string
  /** признано устаревшим */
  keyCode: number
  locale: string
  location: number
  metaKey: boolean
  repeat: boolean
  shiftKey: boolean
  /** признано устаревшим */
  which: number
}

// Мышь
interface MouseEvent<T = Element, E = NativeMouseEvent> extends UIEvent<T, E> {
  altKey: boolean
  button: number
  buttons: number
  clientX: number
  clientY: number
  ctrlKey: boolean
  /**
    * [DOM Level 3 Events spec](https://www.w3.org/TR/uievents-key/#keys-modifier) - список валидных (чувствительных к регистру) аргументов для данного метода
    */
  getModifierState(key: string): boolean
  metaKey: boolean
  movementX: number
  movementY: number
  pageX: number
  pageY: number
  relatedTarget: EventTarget | null
  screenX: number
  screenY: number
  shiftKey: boolean
}

// Прикосновение, касание
interface TouchEvent<T = Element> extends UIEvent<T, NativeTouchEvent> {
  altKey: boolean
  changedTouches: TouchList
  ctrlKey: boolean
  /**
    * [DOM Level 3 Events spec](https://www.w3.org/TR/uievents-key/#keys-modifier) - список валидных (чувствительных к регистру) аргументов для данного метода
    */
  getModifierState(key: string): boolean
  metaKey: boolean
  shiftKey: boolean
  targetTouches: TouchList
  touches: TouchList
}

// Пользовательский интерфейс
interface UIEvent<T = Element, E = NativeUIEvent> extends SyntheticEvent<T, E> {
  detail: number
  view: AbstractView
}

// Колесо мыши
interface WheelEvent<T = Element> extends MouseEvent<T, NativeWheelEvent> {
  deltaMode: number
  deltaX: number
  deltaY: number
  deltaZ: number
}

// Анимация
interface AnimationEvent<T = Element> extends SyntheticEvent<T, NativeAnimationEvent> {
  animationName: string
  elapsedTime: number
  pseudoElement: string
}

// Переход
interface TransitionEvent<T = Element> extends SyntheticEvent<T, NativeTransitionEvent> {
  elapsedTime: number
  propertyName: string
  pseudoElement: string
}
```

## Пропы и атрибуты

### Пропы

```ts
interface Props<T> {
  children?: ReactNode
  key?: Key
  ref?: LegacyRef<T>
}
```

### DOM-атрибуты

```ts
interface DOMAttributes<T> {
  children?: ReactNode
  dangerouslySetInnerHTML?: {
      __html: string
  }

  // Буфер обмена
  onCopy?: ClipboardEventHandler<T>
  onCopyCapture?: ClipboardEventHandler<T>
  onCut?: ClipboardEventHandler<T>
  onCutCapture?: ClipboardEventHandler<T>
  onPaste?: ClipboardEventHandler<T>
  onPasteCapture?: ClipboardEventHandler<T>

  // Композиция
  onCompositionEnd?: CompositionEventHandler<T>
  onCompositionEndCapture?: CompositionEventHandler<T>
  onCompositionStart?: CompositionEventHandler<T>
  onCompositionStartCapture?: CompositionEventHandler<T>
  onCompositionUpdate?: CompositionEventHandler<T>
  onCompositionUpdateCapture?: CompositionEventHandler<T>

  // Фокус
  onFocus?: FocusEventHandler<T>
  onFocusCapture?: FocusEventHandler<T>
  onBlur?: FocusEventHandler<T>
  onBlurCapture?: FocusEventHandler<T>

  // Форма
  onChange?: FormEventHandler<T>
  onChangeCapture?: FormEventHandler<T>
  onBeforeInput?: FormEventHandler<T>
  onBeforeInputCapture?: FormEventHandler<T>
  onInput?: FormEventHandler<T>
  onInputCapture?: FormEventHandler<T>
  onReset?: FormEventHandler<T>
  onResetCapture?: FormEventHandler<T>
  onSubmit?: FormEventHandler<T>
  onSubmitCapture?: FormEventHandler<T>
  onInvalid?: FormEventHandler<T>
  onInvalidCapture?: FormEventHandler<T>

  // Изображение
  onLoad?: ReactEventHandler<T>
  onLoadCapture?: ReactEventHandler<T>
  onError?: ReactEventHandler<T> // also a Media Event
  onErrorCapture?: ReactEventHandler<T> // also a Media Event

  // Клавиатура
  onKeyDown?: KeyboardEventHandler<T>
  onKeyDownCapture?: KeyboardEventHandler<T>
  onKeyPress?: KeyboardEventHandler<T>
  onKeyPressCapture?: KeyboardEventHandler<T>
  onKeyUp?: KeyboardEventHandler<T>
  onKeyUpCapture?: KeyboardEventHandler<T>

  // Медиа
  onAbort?: ReactEventHandler<T>
  onAbortCapture?: ReactEventHandler<T>
  onCanPlay?: ReactEventHandler<T>
  onCanPlayCapture?: ReactEventHandler<T>
  onCanPlayThrough?: ReactEventHandler<T>
  onCanPlayThroughCapture?: ReactEventHandler<T>
  onDurationChange?: ReactEventHandler<T>
  onDurationChangeCapture?: ReactEventHandler<T>
  onEmptied?: ReactEventHandler<T>
  onEmptiedCapture?: ReactEventHandler<T>
  onEncrypted?: ReactEventHandler<T>
  onEncryptedCapture?: ReactEventHandler<T>
  onEnded?: ReactEventHandler<T>
  onEndedCapture?: ReactEventHandler<T>
  onLoadedData?: ReactEventHandler<T>
  onLoadedDataCapture?: ReactEventHandler<T>
  onLoadedMetadata?: ReactEventHandler<T>
  onLoadedMetadataCapture?: ReactEventHandler<T>
  onLoadStart?: ReactEventHandler<T>
  onLoadStartCapture?: ReactEventHandler<T>
  onPause?: ReactEventHandler<T>
  onPauseCapture?: ReactEventHandler<T>
  onPlay?: ReactEventHandler<T>
  onPlayCapture?: ReactEventHandler<T>
  onPlaying?: ReactEventHandler<T>
  onPlayingCapture?: ReactEventHandler<T>
  onProgress?: ReactEventHandler<T>
  onProgressCapture?: ReactEventHandler<T>
  onRateChange?: ReactEventHandler<T>
  onRateChangeCapture?: ReactEventHandler<T>
  onSeeked?: ReactEventHandler<T>
  onSeekedCapture?: ReactEventHandler<T>
  onSeeking?: ReactEventHandler<T>
  onSeekingCapture?: ReactEventHandler<T>
  onStalled?: ReactEventHandler<T>
  onStalledCapture?: ReactEventHandler<T>
  onSuspend?: ReactEventHandler<T>
  onSuspendCapture?: ReactEventHandler<T>
  onTimeUpdate?: ReactEventHandler<T>
  onTimeUpdateCapture?: ReactEventHandler<T>
  onVolumeChange?: ReactEventHandler<T>
  onVolumeChangeCapture?: ReactEventHandler<T>
  onWaiting?: ReactEventHandler<T>
  onWaitingCapture?: ReactEventHandler<T>

  // Мышь
  onAuxClick?: MouseEventHandler<T>
  onAuxClickCapture?: MouseEventHandler<T>
  onClick?: MouseEventHandler<T>
  onClickCapture?: MouseEventHandler<T>
  onContextMenu?: MouseEventHandler<T>
  onContextMenuCapture?: MouseEventHandler<T>
  onDoubleClick?: MouseEventHandler<T>
  onDoubleClickCapture?: MouseEventHandler<T>
  onDrag?: DragEventHandler<T>
  onDragCapture?: DragEventHandler<T>
  onDragEnd?: DragEventHandler<T>
  onDragEndCapture?: DragEventHandler<T>
  onDragEnter?: DragEventHandler<T>
  onDragEnterCapture?: DragEventHandler<T>
  onDragExit?: DragEventHandler<T>
  onDragExitCapture?: DragEventHandler<T>
  onDragLeave?: DragEventHandler<T>
  onDragLeaveCapture?: DragEventHandler<T>
  onDragOver?: DragEventHandler<T>
  onDragOverCapture?: DragEventHandler<T>
  onDragStart?: DragEventHandler<T>
  onDragStartCapture?: DragEventHandler<T>
  onDrop?: DragEventHandler<T>
  onDropCapture?: DragEventHandler<T>
  onMouseDown?: MouseEventHandler<T>
  onMouseDownCapture?: MouseEventHandler<T>
  onMouseEnter?: MouseEventHandler<T>
  onMouseLeave?: MouseEventHandler<T>
  onMouseMove?: MouseEventHandler<T>
  onMouseMoveCapture?: MouseEventHandler<T>
  onMouseOut?: MouseEventHandler<T>
  onMouseOutCapture?: MouseEventHandler<T>
  onMouseOver?: MouseEventHandler<T>
  onMouseOverCapture?: MouseEventHandler<T>
  onMouseUp?: MouseEventHandler<T>
  onMouseUpCapture?: MouseEventHandler<T>

  // Выделение
  onSelect?: ReactEventHandler<T>
  onSelectCapture?: ReactEventHandler<T>

  // Касание
  onTouchCancel?: TouchEventHandler<T>
  onTouchCancelCapture?: TouchEventHandler<T>
  onTouchEnd?: TouchEventHandler<T>
  onTouchEndCapture?: TouchEventHandler<T>
  onTouchMove?: TouchEventHandler<T>
  onTouchMoveCapture?: TouchEventHandler<T>
  onTouchStart?: TouchEventHandler<T>
  onTouchStartCapture?: TouchEventHandler<T>

  // Указатель
  onPointerDown?: PointerEventHandler<T>
  onPointerDownCapture?: PointerEventHandler<T>
  onPointerMove?: PointerEventHandler<T>
  onPointerMoveCapture?: PointerEventHandler<T>
  onPointerUp?: PointerEventHandler<T>
  onPointerUpCapture?: PointerEventHandler<T>
  onPointerCancel?: PointerEventHandler<T>
  onPointerCancelCapture?: PointerEventHandler<T>
  onPointerEnter?: PointerEventHandler<T>
  onPointerEnterCapture?: PointerEventHandler<T>
  onPointerLeave?: PointerEventHandler<T>
  onPointerLeaveCapture?: PointerEventHandler<T>
  onPointerOver?: PointerEventHandler<T>
  onPointerOverCapture?: PointerEventHandler<T>
  onPointerOut?: PointerEventHandler<T>
  onPointerOutCapture?: PointerEventHandler<T>
  onGotPointerCapture?: PointerEventHandler<T>
  onGotPointerCaptureCapture?: PointerEventHandler<T>
  onLostPointerCapture?: PointerEventHandler<T>
  onLostPointerCaptureCapture?: PointerEventHandler<T>

  // UI
  onScroll?: UIEventHandler<T>
  onScrollCapture?: UIEventHandler<T>

  // Колесо мыши
  onWheel?: WheelEventHandler<T>
  onWheelCapture?: WheelEventHandler<T>

  // Анимация
  onAnimationStart?: AnimationEventHandler<T>
  onAnimationStartCapture?: AnimationEventHandler<T>
  onAnimationEnd?: AnimationEventHandler<T>
  onAnimationEndCapture?: AnimationEventHandler<T>
  onAnimationIteration?: AnimationEventHandler<T>
  onAnimationIterationCapture?: AnimationEventHandler<T>

  // Переход
  onTransitionEnd?: TransitionEventHandler<T>
  onTransitionEndCapture?: TransitionEventHandler<T>
}
```

### ARIA-атрибуты

```ts
// https://www.w3.org/TR/wai-aria-1.1/
interface AriaAttributes {
  /** Определяет текущий активный элемент-потомка, когда фокус находится на сложносоставном виджете, контейнере с текстом, группе или приложении в целом */
  'aria-activedescendant'?: string

  /** Определяет, все ли вспомогательные технологии поддерживаются */
  'aria-atomic'?: boolean | 'false' | 'true'

  /**
    * Определяет, может ли ввод текста повлечь автозавершение и то, как это автозавершение будет выполняться
    */
  'aria-autocomplete'?: 'none' | 'inline' | 'list' | 'both'

  /** Определяет модифицируемый элемент, чтобы вспомогательные технологии могли ждать завершения модификации перед передачей информации пользователю */
  'aria-busy'?: boolean | 'false' | 'true'

  /**
    * Определяет текущее состояние "выбранности" для флажков, радио-кнопок и других виджетов
    * см. также aria-pressed и aria-selected
    */
  'aria-checked'?: boolean | 'false' | 'mixed' | 'true'

  /**
    * Определяет общее количество колонок в таблице, гриде или древовидном гриде (гриде с вложенными гридами)
    * см. также aria-colindex
    */
  'aria-colcount'?: number

  /**
    * Определяет индекс колонки, в которой находится элемент, или позицию элемента по отношению к общему количеству колонок в таблице и т.д.
    * см. также aria-colcount и aria-colspan
    */
  'aria-colindex'?: number

  /**
    * Определяет количество колонок, объединенных в одну ячейку таблицы и т.д.
    * см. тажке aria-colindex и aria-rowspan
    */
  'aria-colspan'?: number

  /**
    * Определяет элемент или элементы, чей контент или присутствие на странице контролируется текущим элементом
    * см. также aria-owns
    */
  'aria-controls'?: string

  /** Определяет элемент, представляющий текущий элемент в контейнере или наборе связанных элементов */
  'aria-current'?: boolean | 'false' | 'true' | 'page' | 'step' | 'location' | 'date' | 'time'

  /**
    * Определяет элемент (или элементы), описывающий объект
    * см. также aria-labelledby
    */
  'aria-describedby'?: string

  /**
    * Определяет элемент, предоставляющий подробное описание объекта
    * см. также aria-describedby
    */
  'aria-details'?: string

  /**
    * Определяет, что элемент присутствует на странице, но является недоступным для редактирования и других операций (элемент отключен)
    * см. также aria-hidden и aria-readonly
    */
  'aria-disabled'?: boolean | 'false' | 'true'

  /**
    * Определяет элемент, содержащий сообщение об ошибке для объекта
    * см. также aria-invalid и aria-describedby
    */
  'aria-errormessage'?: string

  /** Определяет является ли в данный момент сам элемент или элемент, находящийся под его контролем, расширенным или сжатым (раскрытым или закрытым) */
  'aria-expanded'?: boolean | 'false' | 'true'

  /**
    * Определяет следующий элемент (или элементы) при альтернативном порядке чтения контента
    */
  'aria-flowto'?: string

  /** Определяет доступность и тип интерактивного элемента, такого как всплывающая подсказка, меню или диалог, которые могут "запускаться" с помощью элемента */
  'aria-haspopup'?: boolean | 'false' | 'true' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog'

  /**
    * Определяет доступность элемента для вспомогательных технологий
    * см. также aria-disabled
    */
  'aria-hidden'?: boolean | 'false' | 'true'

  /**
    * Определяет, что введенное значение не соответствует ожидаемому формату
    * см. также aria-errormessage
    */
  'aria-invalid'?: boolean | 'false' | 'true' | 'grammar' | 'spelling'

  /** Определяет кастомные сочетания клавиш для активации или фокусировке на элементе */
  'aria-keyshortcuts'?: string

  /**
    * Определяет строковое значение подписи к текущему элементу
    * см. также aria-labelledby
    */
  'aria-label'?: string

  /**
    * Определяет элемент (или элементы), который служит подписью к текущему элементу
    * см. также aria-describedby
    */
  'aria-labelledby'?: string

  /** Определяет иерархический уровень элемента в структуре */
  'aria-level'?: number

  /** Определяет, что элемент будет обновлен, и характер обновления, которого следует ждать пользовательскому агенту, вспомогательным технологиям и самому пользователю */
  'aria-live'?: 'off' | 'assertive' | 'polite'

  /** Определяет, является ли отображаемый элемент модальным окном */
  'aria-modal'?: boolean | 'false' | 'true'

  /** Определяет, сколько строк принимает контейнер с текстом, одну или несколько */
  'aria-multiline'?: boolean | 'false' | 'true'

  /** Определяет, может ли пользователь выделить несколько потомков текущего элемента */
  'aria-multiselectable'?: boolean | 'false' | 'true'

  /** Определяет ориентацию элемента: горизонтальная, вертикальная или неизвестная */
  'aria-orientation'?: 'horizontal' | 'vertical'

  /**
    * Определяет порядок элемента (или элементов) с точки зрения реализации визуальных, функциональных или контекстуальных взаимоотношений предок/потомок
    * между DOM-элементами, когда иерархия DOM не может быть использована для этой цели
    * см. также aria-controls.
    */
  'aria-owns'?: string

  /**
    * Определяет краткую подсказку (слово или короткую фразу) для помощи пользователю при вводе данных
    * Подсказка может быть простым значением или кратким описанием ожидаемого формата
    */
  'aria-placeholder'?: string

  /**
    * Определяет номер или позицию элемента в текущем наборе элементов списка или узлов дерева. При этом, не обязательно, чтобы все элементы набора присуствовали в DOM
    * см. также aria-setsize
    */
  'aria-posinset'?: number

  /**
    * Определяет состояние нажатия кнопки-переключателя
    * см. также aria-checked и aria-selected
    */
  'aria-pressed'?: boolean | 'false' | 'mixed' | 'true'

  /**
    * Определяет, что элемент недоступен для редактирования, но доступен для других операций
    * см. также aria-disabled
    */
  'aria-readonly'?: boolean | 'false' | 'true'

  /**
    * Определяет, какие уведомления отправляет пользовательский агент при модификации дерева доступности (accessibility tree)
    * см. также aria-atomic
    */
  'aria-relevant'?: 'additions' | 'additions removals' | 'additions text' | 'all' | 'removals' | 'removals additions' | 'removals text' | 'text' | 'text additions' | 'text removals'

  /** Определяет, что поле формы является обязательным для заполнения */
  'aria-required'?: boolean | 'false' | 'true'

  /** Определяет человекочитаемое, авторское описание роли (назначения) элемента */
  'aria-roledescription'?: string

  /**
    * Определяет общее количество строк в таблице и т.д.
    * см. также aria-rowindex
    */
  'aria-rowcount'?: number

  /**
    * Определяет индекс строки, в которой находится элемент, или позицию элемента по отношению к общему количеству строк в таблице и т.д.
    * см. также aria-rowcount и aria-rowspan
    */
  'aria-rowindex'?: number

  /**
    * Определяет количество строк, объединенных в одну ячейку в таблице и т.д.
    * см. также aria-rowindex и aria-colspan
    */
  'aria-rowspan'?: number

  /**
    * Определяет текущее состояние выделяемых (выбираемых) виджетов
    * см. также aria-checked и aria-pressed
    */
  'aria-selected'?: boolean | 'false' | 'true'

  /**
    * Определяет количество элементов в текущем наборе элементов списка или узлов дерева. При этом, не обязательно, чтобы все элементы набора присутствовали в DOM
    * см. также aria-posinset
    */
  'aria-setsize'?: number

  /** Определяет порядок сортировки элементов в таблице или гриде */
  'aria-sort'?: 'none' | 'ascending' | 'descending' | 'other'

  /** Определяет максимально допустимое значение диапазона */
  'aria-valuemax'?: number

  /** Определяет минимально допустимое значение диапазона */
  'aria-valuemin'?: number

  /**
    * Определяет текущее значение диапазона
    * см. также aria-valuetext
    */
  'aria-valuenow'?: number

  /** Определяет человекочитаемый альтернативный текст для `aria-valuenow` */
  'aria-valuetext'?: string
}
```

### Атрибуты HTML

#### Общие

```ts
interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
  // Специфичные для React
  defaultChecked?: boolean
  defaultValue?: string | number | ReadonlyArray<string>
  suppressContentEditableWarning?: boolean
  suppressHydrationWarning?: boolean

  // Стандартные
  accessKey?: string
  className?: string
  contentEditable?: Booleanish | "inherit"
  contextMenu?: string
  dir?: string
  draggable?: Booleanish
  hidden?: boolean
  id?: string
  lang?: string
  placeholder?: string
  slot?: string
  spellCheck?: Booleanish
  style?: CSSProperties
  tabIndex?: number
  title?: string
  translate?: 'yes' | 'no'

  // Неизвестные
  radioGroup?: string // <command>, <menuitem>

  // WAI-ARIA
  role?: string

  // RDFa
  about?: string
  datatype?: string
  inlist?: any
  prefix?: string
  property?: string
  resource?: string
  typeof?: string
  vocab?: string

  // Нестандартные
  autoCapitalize?: string
  autoCorrect?: string
  autoSave?: string
  color?: string
  itemProp?: string
  itemScope?: boolean
  itemType?: string
  itemID?: string
  itemRef?: string
  results?: number
  security?: string
  unselectable?: 'on' | 'off'

  // Живой стандарт
  /**
    * Показывает допустимый тип данных во время ввода или редактирования контента
    * https://html.spec.whatwg.org/multipage/interaction.html#input-modalities:-the-inputmode-attribute
    */
  inputMode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search'
  /**
    * Определяет, что обычный элемент должен вести себя как определенный кастомный встроенный элемент
    * https://html.spec.whatwg.org/multipage/custom-elements.html#attr-is
    */
  is?: string
}

interface AllHTMLAttributes<T> extends HTMLAttributes<T> {
  //Обычные
  accept?: string
  acceptCharset?: string
  action?: string
  allowFullScreen?: boolean
  allowTransparency?: boolean
  alt?: string
  as?: string
  async?: boolean
  autoComplete?: string
  autoFocus?: boolean
  autoPlay?: boolean
  capture?: boolean | string
  cellPadding?: number | string
  cellSpacing?: number | string
  charSet?: string
  challenge?: string
  checked?: boolean
  cite?: string
  classID?: string
  cols?: number
  colSpan?: number
  content?: string
  controls?: boolean
  coords?: string
  crossOrigin?: string
  data?: string
  dateTime?: string
  default?: boolean
  defer?: boolean
  disabled?: boolean
  download?: any
  encType?: string
  form?: string
  formAction?: string
  formEncType?: string
  formMethod?: string
  formNoValidate?: boolean
  formTarget?: string
  frameBorder?: number | string
  headers?: string
  height?: number | string
  high?: number
  href?: string
  hrefLang?: string
  htmlFor?: string
  httpEquiv?: string
  integrity?: string
  keyParams?: string
  keyType?: string
  kind?: string
  label?: string
  list?: string
  loop?: boolean
  low?: number
  manifest?: string
  marginHeight?: number
  marginWidth?: number
  max?: number | string
  maxLength?: number
  media?: string
  mediaGroup?: string
  method?: string
  min?: number | string
  minLength?: number
  multiple?: boolean
  muted?: boolean
  name?: string
  nonce?: string
  noValidate?: boolean
  open?: boolean
  optimum?: number
  pattern?: string
  placeholder?: string
  playsInline?: boolean
  poster?: string
  preload?: string
  readOnly?: boolean
  rel?: string
  required?: boolean
  reversed?: boolean
  rows?: number
  rowSpan?: number
  sandbox?: string
  scope?: string
  scoped?: boolean
  scrolling?: string
  seamless?: boolean
  selected?: boolean
  shape?: string
  size?: number
  sizes?: string
  span?: number
  src?: string
  srcDoc?: string
  srcLang?: string
  srcSet?: string
  start?: number
  step?: number | string
  summary?: string
  target?: string
  type?: string
  useMap?: string
  value?: string | ReadonlyArray<string> | number
  width?: number | string
  wmode?: string
  wrap?: string
}
```

#### Для отдельных элементов

```js
interface AnchorHTMLAttributes<T> extends HTMLAttributes<T> {
  download?: any
  href?: string
  hrefLang?: string
  media?: string
  ping?: string
  rel?: string
  target?: string
  type?: string
  referrerPolicy?: HTMLAttributeReferrerPolicy
}

interface BaseHTMLAttributes<T> extends HTMLAttributes<T> {
  href?: string
  target?: string
}

interface ButtonHTMLAttributes<T> extends HTMLAttributes<T> {
  autoFocus?: boolean
  disabled?: boolean
  form?: string
  formAction?: string
  formEncType?: string
  formMethod?: string
  formNoValidate?: boolean
  formTarget?: string
  name?: string
  type?: 'submit' | 'reset' | 'button'
  value?: string | ReadonlyArray<string> | number
}

interface DetailsHTMLAttributes<T> extends HTMLAttributes<T> {
  open?: boolean
  onToggle?: ReactEventHandler<T>
}

interface DialogHTMLAttributes<T> extends HTMLAttributes<T> {
  open?: boolean
}

interface FieldsetHTMLAttributes<T> extends HTMLAttributes<T> {
  disabled?: boolean
  form?: string
  name?: string
}

interface FormHTMLAttributes<T> extends HTMLAttributes<T> {
  acceptCharset?: string
  action?: string
  autoComplete?: string
  encType?: string
  method?: string
  name?: string
  noValidate?: boolean
  target?: string
}

interface ImgHTMLAttributes<T> extends HTMLAttributes<T> {
  alt?: string
  crossOrigin?: "anonymous" | "use-credentials" | ""
  decoding?: "async" | "auto" | "sync"
  height?: number | string
  loading?: "eager" | "lazy"
  referrerPolicy?: HTMLAttributeReferrerPolicy
  sizes?: string
  src?: string
  srcSet?: string
  useMap?: string
  width?: number | string
}

interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
  accept?: string
  alt?: string
  autoComplete?: string
  autoFocus?: boolean
  capture?: boolean | string // https://www.w3.org/TR/html-media-capture/#the-capture-attribute
  checked?: boolean
  crossOrigin?: string
  disabled?: boolean
  enterKeyHint?: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send'
  form?: string
  formAction?: string
  formEncType?: string
  formMethod?: string
  formNoValidate?: boolean
  formTarget?: string
  height?: number | string
  list?: string
  max?: number | string
  maxLength?: number
  min?: number | string
  minLength?: number
  multiple?: boolean
  name?: string
  pattern?: string
  placeholder?: string
  readOnly?: boolean
  required?: boolean
  size?: number
  src?: string
  step?: number | string
  type?: string
  value?: string | ReadonlyArray<string> | number
  width?: number | string

  onChange?: ChangeEventHandler<T>
}

interface LabelHTMLAttributes<T> extends HTMLAttributes<T> {
  form?: string
  htmlFor?: string
}

interface LiHTMLAttributes<T> extends HTMLAttributes<T> {
  value?: string | ReadonlyArray<string> | number
}

interface MetaHTMLAttributes<T> extends HTMLAttributes<T> {
  charSet?: string
  content?: string
  httpEquiv?: string
  name?: string
}

interface OlHTMLAttributes<T> extends HTMLAttributes<T> {
  reversed?: boolean
  start?: number
  type?: '1' | 'a' | 'A' | 'i' | 'I'
}

interface OptgroupHTMLAttributes<T> extends HTMLAttributes<T> {
  disabled?: boolean
  label?: string
}

interface OptionHTMLAttributes<T> extends HTMLAttributes<T> {
  disabled?: boolean
  label?: string
  selected?: boolean
  value?: string | ReadonlyArray<string> | number
}

interface ScriptHTMLAttributes<T> extends HTMLAttributes<T> {
  async?: boolean
  /** признаное устаревшим */
  charSet?: string
  crossOrigin?: string
  defer?: boolean
  integrity?: string
  noModule?: boolean
  nonce?: string
  referrerPolicy?: HTMLAttributeReferrerPolicy
  src?: string
  type?: string
}

interface SelectHTMLAttributes<T> extends HTMLAttributes<T> {
  autoComplete?: string
  autoFocus?: boolean
  disabled?: boolean
  form?: string
  multiple?: boolean
  name?: string
  required?: boolean
  size?: number
  value?: string | ReadonlyArray<string> | number
  onChange?: ChangeEventHandler<T>
}

interface StyleHTMLAttributes<T> extends HTMLAttributes<T> {
  media?: string
  nonce?: string
  scoped?: boolean
  type?: string
}

interface TableHTMLAttributes<T> extends HTMLAttributes<T> {
  cellPadding?: number | string
  cellSpacing?: number | string
  summary?: string
  width?: number | string
}

interface TextareaHTMLAttributes<T> extends HTMLAttributes<T> {
  autoComplete?: string
  autoFocus?: boolean
  cols?: number
  dirName?: string
  disabled?: boolean
  form?: string
  maxLength?: number
  minLength?: number
  name?: string
  placeholder?: string
  readOnly?: boolean
  required?: boolean
  rows?: number
  value?: string | ReadonlyArray<string> | number
  wrap?: string

  onChange?: ChangeEventHandler<T>
}

interface TdHTMLAttributes<T> extends HTMLAttributes<T> {
  align?: "left" | "center" | "right" | "justify" | "char"
  colSpan?: number
  headers?: string
  rowSpan?: number
  scope?: string
  abbr?: string
  height?: number | string
  width?: number | string
  valign?: "top" | "middle" | "bottom" | "baseline"
}

interface ThHTMLAttributes<T> extends HTMLAttributes<T> {
  align?: "left" | "center" | "right" | "justify" | "char"
  colSpan?: number
  headers?: string
  rowSpan?: number
  scope?: string
  abbr?: string
}

interface TimeHTMLAttributes<T> extends HTMLAttributes<T> {
  dateTime?: string
}

interface VideoHTMLAttributes<T> extends MediaHTMLAttributes<T> {
  height?: number | string
  playsInline?: boolean
  poster?: string
  width?: number | string
  disablePictureInPicture?: boolean
  disableRemotePlayback?: boolean
}
```

`React` также поддерживает все `SVG-атрибуты`, `HTML` и `SVG-элементы`.

### PropTypes

```ts
 interface ReactPropTypes {
  any: typeof PropTypes.any
  array: typeof PropTypes.array
  bool: typeof PropTypes.bool
  func: typeof PropTypes.func
  number: typeof PropTypes.number
  object: typeof PropTypes.object
  string: typeof PropTypes.string
  node: typeof PropTypes.node
  element: typeof PropTypes.element
  instanceOf: typeof PropTypes.instanceOf
  oneOf: typeof PropTypes.oneOf
  oneOfType: typeof PropTypes.oneOfType
  arrayOf: typeof PropTypes.arrayOf
  objectOf: typeof PropTypes.objectOf
  shape: typeof PropTypes.shape
  exact: typeof PropTypes.exact
}
```

### Children

```ts
interface ReactChildren {
  map<T, C>(children: C | C[], fn: (child: C, index: number) => T):
      C extends null | undefined ? C : Array<Exclude<T, boolean | null | undefined>>
  forEach<C>(children: C | C[], fn: (child: C, index: number) => void): void
  count(children: any): number
  only<C>(children: C): C extends any[] ? never : C
  toArray(children: ReactNode | ReactNode[]): Array<Exclude<ReactNode, boolean | null | undefined>>
}
```
