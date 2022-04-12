module.exports = () => {
  const data = { users: [] }
  // Создаем 10 пользователей
  for (let i = 0; i < 10; i++) {
    data.users.push({ id: i, name: `user-${i}` })
  }
  return data
}
