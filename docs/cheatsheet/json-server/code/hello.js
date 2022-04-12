// Добавляем в ответ кастомный заголовок
module.exports = (_, res, next) => {
  res.header('X-Hello', 'World')
  next()
}
