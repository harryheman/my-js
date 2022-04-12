---
sidebar_position: 4
---

# Styled Components

> [Styled Components](https://styled-components.com/) - одно из самых популярных решений `CSS-in-JS` для `React-приложений`.

## Установка

```bash
yarn add styled-components
# или
npm i styled-components
```

## Импорт

```js
import styled, { createGlobalStyle, keyframes } from 'styled-components'
// styled - стилизация компонента
// createGlobalStyle - глобальные стили
// keyframes - анимация
```

## Использование

### Глобальные стили

```js
const GlobalStyle = createGlobalStyle`
*,
*::before,
*::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  min-height: 100vh;
  background: radial-gradient(yellow, orange);
  display: grid;
  place-content: center;
  text-align: center;
}
`
```

### Стилизация компонента

```js
const StyledComponent = styled.tagName`
  prop: value;
`

// пример
const Button = styled.button`
  margin: 0.5em;
  padding: 0.5em 0;
  width: 132px;
  background: #f0f0f0;
  outline: none;
  border: none;
  border-radius: 4px;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.25);
  font-family: Audiowide;
  font-size: 1em;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #1c1c1c;
  cursor: pointer;
  user-select: none;
`
```

### Вложенность (по аналогии с SASS)

```js
const StyledComponent = styled.tagName`
  &:hover {
    prop: value;
  }
`

// пример
const Button = styled.button`
  // ...
  transition: 0.2s;

  &:hover {
    transform: scale(1.05);
  }

  &:active {
    box-shadow: none;
  }
`
```

### Расширение стилей компонента с помощью пропов

```js
const StyledComponent = styled.tagName`
  prop: ${props => props.propName ? 'ifTrueValue' : 'ifFalseValue'};
`

// пример
const Button = styled.button`
  // ...
  background: ${(props) => (props.primary ? '#337ab7' : '#f0f0f0f')};
  color: ${(props) => (props.primary ? '#f0f0f0' : '#1c1c1c')};
`
```

### Расширение стилей базового компонента

```js
const StyledComponent = styled(BaseStyledComponent)`
  prop: value;
`

// пример
const SuccessButton = styled(Button)`
  background: #5cb85c;
  color: #f0f0f0;
`
```

### Изменение пропов компонента

```js
const StyledComponent = (props) => (
  <WrappedStyledComponent {...props} children={props.children.methodName} />
)

// пример
const ReversedButton = (props) => (
  <Button {...props} children={props.chidren.reverse()} />
)
```

### Работа с атрибутами компонента

```js
const StyledComponent = styled.tagName.attrs((props) => ({
  attr1: 'value1',
  attr2: 'value2' || 'defaultValue'
}))`
  //...
  prop: ${(props) => props.attr2};
`

// пример
const Input = styled.input.attrs((props) => ({
  type: 'text',
  placeholder: 'Some text...',
  size: props.size || '1em'
}))`
  border: none;
  border-radius: 4px;
  box-shadow: 0 0 2px inset rgba(0, 0, 0, 0.5);
  font-family: Audiowide;
  font-size: ${(props) => props.size};
  text-align: center;
  color: rgba(0, 0, 0, 0.5);
  margin: 0.5rem;
  padding: 0.5rem 0;
`
```

### Перезапись атрибутов компонента

```js
const StyledComponent = styled(BaseStyledComponent).attrs({
  attr1: 'value1',
  attr2: 'value2'
})``

// пример
const PasswordInput = styled(Input).attrs({
  type: 'password',
  placeholder: 'Secret key...'
})``
```

### Анимация

```js
const animationName = keyframes`
  from {
    prop: value;
  }

  to {
    prop: value;
  }
`
const StyledComponent = styled.tagName`
  animation: ${animationName} other values;
`

// пример
const fade = keyframes`
  from {
    opacity: 1;
  }

  to {
    opacity: 0;
  }
`

const FadeButton = styled(Button)`
  animation: ${fade} 2s linear infinite alternate;
`
```

### Полный пример

Обратите внимание на атрибут "as" компонента "Button". Он позволяет изменять HTML-тег, сохраняя стилизацию.

```js
import styled, { createGlobalStyle, keyframes } from 'styled-components'

const GlobalStyle = createGlobalStyle`
*,
*::before,
*::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  min-height: 100vh;
  background: radial-gradient(yellow, orange);
  display: grid;
  place-content: center;
  text-align: center;
}
`

const Button = styled.button`
  margin: 0.5em;
  padding: 0.5em 0;
  width: 132px;
  background: ${(props) => (props.primary ? '#337ab7' : '#f0f0f0f')};
  outline: none;
  border: none;
  border-radius: 4px;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.25);
  font-family: Audiowide;
  font-size: 1em;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: ${(props) => (props.primary ? '#f0f0f0' : '#1c1c1c')};
  cursor: pointer;
  user-select: none;
  transition: 0.2s;

  &:hover {
    transform: scale(1.05);
  }

  &:active {
    box-shadow: none;
  }
`

const SuccessButton = styled(Button)`
  background: #5cb85c;
  color: #f0f0f0;
`

const ReversedButton = (props) => (
  <Button {...props} children={props.children.split('').reverse()} />
)

const Input = styled.input.attrs((props) => ({
  type: 'text',
  placeholder: 'Some text...',
  size: props.size || '1em'
}))`
  border: none;
  border-radius: 4px;
  box-shadow: 0 0 2px inset rgba(0, 0, 0, 0.5);
  font-family: Audiowide;
  font-size: ${(props) => props.size};
  text-align: center;
  color: rgba(0, 0, 0, 0.5);
  margin: 0.5rem;
  padding: 0.5rem 0;
`

const PasswordInput = styled(Input).attrs({
  type: 'password',
  placeholder: 'Secret key...'
})``

const fade = keyframes`
  from {
    opacity: 1;
  }

  to {
    opacity: 0;
  }
`

const FadeButton = styled(Button)`
  animation: ${fade} 2s linear infinite alternate;
`

export default function App() {
  return (
    <>
      <GlobalStyle />
      <Button>base</Button>
      <br />
      <Button primary>primary</Button>
      <br />
      <SuccessButton>success</SuccessButton>
      <br />
      <Button
        primary
        as='a'
        href='#'
        style={{
          textDecoration: 'none',
          display: 'inline-block',
          textAlign: 'center'
        }}
      >
        link
      </Button>
      <br />
      <Button as={ReversedButton}>reversed</Button>
      <br />
      <Input />
      <br />
      <Input size='1.25em' />
      <br />
      <PasswordInput />
      <br />
      <FadeButton primary>fade</FadeButton>
    </>
  )
}
```
