# Этап 11. Установка и настройка nginx + PHP-FPM + WordPress

## Что мы будем делать

Это кульминация второй части курса. Мы соберём все знания вместе
и развернём полноценный веб-сайт на WordPress. Для этого нам нужны
четыре компонента:

```
Браузер (клиент)
    │
    ▼
  nginx (веб-сервер, порт 80)
    │
    ├── статика (.html, .css, .js, картинки) → отдаёт сам
    │
    └── динамика (.php) → передаёт в PHP-FPM
                              │
                              ▼
                          WordPress (PHP-код)
                              │
                              ▼
                          MariaDB (база данных)
```

- **nginx** — веб-сервер. Принимает HTTP-запросы от браузера.
  Статические файлы (картинки, CSS) отдаёт сам, а PHP-скрипты
  передаёт в PHP-FPM.
- **PHP-FPM** — обработчик PHP-кода. Выполняет скрипты WordPress
  и возвращает результат nginx.
- **MariaDB** — база данных. WordPress хранит в ней статьи,
  пользователей, настройки.
- **WordPress** — CMS (система управления контентом), написанная
  на PHP. Генерирует HTML-страницы на основе данных из базы.

> **Привязка к проекту.** Все предыдущие главы готовили нас к этому
> моменту: мы умеем работать с файлами, управлять правами, устанавливать
> пакеты, настраивать пользователей и сервисы, работать с сетью
> и файрволом. Теперь применим всё на практике.

---

## Врезка: клиент-серверная модель и HTTP

### Клиент и сервер

Когда вы открываете сайт в браузере, происходит следующее:

1. **Браузер** (клиент) отправляет **запрос** на сервер.
2. **Сервер** (nginx) обрабатывает запрос и отправляет **ответ**.

Это называется **клиент-серверной моделью**. Клиент всегда инициирует
общение, сервер всегда отвечает.

### HTTP-запрос

Запрос состоит из:

- **Метод** — что хочет клиент:
  - `GET` — получить страницу (самый частый)
  - `POST` — отправить данные (форма, логин)
- **URL** — какую страницу запрашивают (`/`, `/about`, `/wp-login.php`)
- **Заголовки** — дополнительная информация (тип браузера, язык и т.д.)

Пример:

```
GET /index.html HTTP/1.1
Host: mysite.local
```

### HTTP-ответ

Ответ содержит:

- **Код состояния** — результат обработки
- **Тело** — содержимое страницы (HTML, JSON, картинка)

Основные коды:

| Код | Значение |
|-----|----------|
| `200 OK` | Всё хорошо, страница найдена |
| `301 Moved Permanently` | Страница переехала на другой адрес |
| `403 Forbidden` | Доступ запрещён |
| `404 Not Found` | Страница не найдена |
| `500 Internal Server Error` | Ошибка на сервере (например, в PHP-коде) |

### Статика и динамика

- **Статический контент** — файлы, которые отдаются как есть:
  HTML, CSS, JavaScript, картинки. Nginx отлично справляется с этим сам.
- **Динамический контент** — страницы, которые генерируются
  программой (PHP, Python и т.д.) на основе данных. Для WordPress
  каждая страница — результат выполнения PHP-кода, который читает
  данные из базы и собирает HTML.

---

## Установка nginx

### Устанавливаем и проверяем

```bash
sudo apt update
sudo apt install nginx
```

nginx запускается автоматически после установки. Проверяем:

```bash
systemctl status nginx
```

Вы должны увидеть `active (running)`. Теперь проверим, что
веб-сервер отвечает:

```bash
curl http://localhost
```

Вы увидите HTML-код стартовой страницы nginx: «Welcome to nginx!».

Проверим, что nginx слушает порт 80:

```bash
sudo ss -tlnp | grep :80
```

### Структура каталогов nginx

| Каталог / файл | Назначение |
|-----------------|-----------|
| `/etc/nginx/nginx.conf` | Главный конфигурационный файл |
| `/etc/nginx/sites-available/` | Доступные конфигурации сайтов |
| `/etc/nginx/sites-enabled/` | Включённые конфигурации (симлинки) |
| `/var/www/html/` | Каталог по умолчанию для файлов сайта |
| `/var/log/nginx/` | Логи (access.log, error.log) |

Механизм работы: в `sites-available/` лежат файлы конфигурации
сайтов, а в `sites-enabled/` — символические ссылки на те из них,
которые должны быть активны. Это позволяет быстро включать
и отключать сайты без удаления конфигурации.

## Настройка серверного блока для WordPress

### Создаём каталог для сайта

```bash
sudo mkdir -p /var/www/wordpress
sudo chown -R webmaster:webdev /var/www/wordpress
```

Мы используем пользователя `webmaster` и группу `webdev` из главы 08.

### Создаём конфигурацию сайта

Создадим файл конфигурации:

```bash
sudo nano /etc/nginx/sites-available/wordpress
```

Содержимое:

```nginx
server {
    listen 80;
    server_name _;

    root /var/www/wordpress;
    index index.php index.html;

    location / {
        try_files $uri $uri/ /index.php?$args;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php-fpm.sock;
    }

    location ~ /\.ht {
        deny all;
    }
}
```

Разберём по частям:

| Директива | Значение |
|-----------|----------|
| `listen 80` | Слушать порт 80 (HTTP) |
| `server_name _` | Отвечать на любое имя хоста |
| `root /var/www/wordpress` | Корневой каталог сайта |
| `index index.php index.html` | Файлы по умолчанию (в порядке приоритета) |

Блоки `location` определяют, как обрабатывать разные запросы:

- **`location /`** — для всех запросов: сначала ищем файл (`$uri`),
  потом каталог (`$uri/`), если ничего не найдено — передаём
  в `index.php` (так работают «красивые» URL WordPress).
- **`location ~ \.php$`** — для PHP-файлов: передаём запрос
  в PHP-FPM через Unix-сокет.
- **`location ~ /\.ht`** — запрещаем доступ к файлам `.htaccess`
  и `.htpasswd` (они не нужны в nginx, но WordPress может их
  создать).

### Включаем сайт

Создаём символическую ссылку в `sites-enabled` и убираем дефолтный
сайт:

```bash
sudo ln -s /etc/nginx/sites-available/wordpress /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
```

Проверяем конфигурацию на ошибки:

```bash
sudo nginx -t
```

```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

Перезагружаем nginx:

```bash
sudo systemctl reload nginx
```

## Установка PHP-FPM

### Устанавливаем PHP и необходимые модули

```bash
sudo apt install php-fpm php-mysql php-xml php-mbstring php-curl php-gd php-intl php-zip
```

| Пакет | Зачем нужен |
|-------|-------------|
| `php-fpm` | Обработчик PHP (FastCGI Process Manager) |
| `php-mysql` | Подключение к MariaDB |
| `php-xml` | Работа с XML (нужен WordPress) |
| `php-mbstring` | Поддержка многобайтовых строк (кириллица) |
| `php-curl` | HTTP-запросы из PHP |
| `php-gd` | Обработка изображений |
| `php-intl` | Интернационализация |
| `php-zip` | Работа с ZIP-архивами |

Проверяем, что PHP-FPM запущен:

```bash
systemctl status php*-fpm
```

### Как nginx взаимодействует с PHP-FPM

nginx и PHP-FPM общаются через **Unix-сокет** — специальный файл
в файловой системе, который работает как канал связи между
программами:

```
/run/php/php-fpm.sock
```

Когда nginx получает запрос к `.php`-файлу, он передаёт его
через этот сокет в PHP-FPM. PHP-FPM выполняет скрипт и возвращает
результат обратно в nginx, который отправляет его клиенту.

> **Почему сокет, а не сетевой порт?** Unix-сокет быстрее TCP-порта,
> потому что данные не проходят через сетевой стек. Это имеет смысл,
> когда nginx и PHP-FPM работают на одной машине.

### Проверяем связку nginx + PHP-FPM

Создадим тестовый PHP-файл:

```bash
echo '<?php phpinfo(); ?>' | sudo tee /var/www/wordpress/info.php
```

Проверяем:

```bash
curl http://localhost/info.php
```

Если вы видите длинный HTML-вывод с информацией о PHP — всё работает.
Если видите текст `<?php phpinfo(); ?>` — значит, nginx не передаёт
запрос в PHP-FPM (проверьте конфигурацию).

После проверки **обязательно удалите** этот файл — он раскрывает
информацию о сервере:

```bash
sudo rm /var/www/wordpress/info.php
```

## Установка MariaDB

### Устанавливаем и защищаем

```bash
sudo apt install mariadb-server
```

MariaDB запустится автоматически. Теперь запустим скрипт начальной
настройки безопасности:

```bash
sudo mysql_secure_installation
```

Скрипт задаст несколько вопросов:

| Вопрос | Рекомендуемый ответ |
|--------|-------------------|
| Enter current password for root | Нажмите Enter (пароля нет) |
| Switch to unix_socket authentication | `n` (уже настроено) |
| Change the root password | `n` (для MariaDB root используется unix-сокет) |
| Remove anonymous users | `Y` |
| Disallow root login remotely | `Y` |
| Remove test database | `Y` |
| Reload privilege tables | `Y` |

### Создаём базу данных и пользователя

Подключаемся к MariaDB от root:

```bash
sudo mariadb
```

Создаём базу данных, пользователя и даём права:

```sql
CREATE DATABASE wordpress CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'wpuser'@'localhost' IDENTIFIED BY 'SecurePassword123';
GRANT ALL PRIVILEGES ON wordpress.* TO 'wpuser'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

> **Важно:** замените `SecurePassword123` на надёжный пароль.
> Запишите его — он понадобится при настройке WordPress.

Проверяем, что подключение работает:

```bash
mariadb -u wpuser -p wordpress
```

Введите пароль. Если вы увидели приглашение `MariaDB [wordpress]>` —
всё работает. Наберите `EXIT;` для выхода.

## Установка WordPress

### Скачиваем и распаковываем

```bash
cd /tmp
curl -LO https://wordpress.org/latest.tar.gz
sudo tar -xzf latest.tar.gz -C /var/www/
```

Команда `tar -xzf` распакует архив, и в `/var/www/` появится каталог
`wordpress` с файлами CMS. Мы указали именно этот путь, потому что
наш серверный блок nginx настроен на `root /var/www/wordpress`.

> **Если каталог /var/www/wordpress уже существует** (мы создали его
> ранее для тестового `info.php`), `tar` распакует файлы прямо в него.
> Если вы хотите начать с чистого каталога, предварительно удалите
> его: `sudo rm -rf /var/www/wordpress`.

### Настраиваем права

```bash
sudo chown -R webmaster:www-data /var/www/wordpress
sudo find /var/www/wordpress -type d -exec chmod 755 {} \;
sudo find /var/www/wordpress -type f -exec chmod 644 {} \;
```

Здесь:

- **Владелец** — `webmaster` (может редактировать файлы).
- **Группа** — `www-data` (под этим пользователем работает PHP-FPM,
  ему нужен доступ на чтение).
- **Каталоги** — `755` (rwxr-xr-x): владелец может всё, остальные
  только читают и входят.
- **Файлы** — `644` (rw-r--r--): владелец читает и пишет, остальные
  только читают.

WordPress нужно разрешить запись в некоторые каталоги (для загрузки
медиафайлов и обновлений):

```bash
sudo chmod -R g+w /var/www/wordpress/wp-content
```

### Настраиваем wp-config.php

WordPress хранит настройки подключения к базе данных в файле
`wp-config.php`. Создадим его из шаблона:

```bash
cd /var/www/wordpress
sudo cp wp-config-sample.php wp-config.php
sudo nano wp-config.php
```

Найдите и измените строки:

```php
define( 'DB_NAME', 'wordpress' );
define( 'DB_USER', 'wpuser' );
define( 'DB_PASSWORD', 'SecurePassword123' );
define( 'DB_HOST', 'localhost' );
```

Укажите те имя базы, пользователя и пароль, которые вы создали
в MariaDB.

Также найдите блок с «солями» (Authentication Unique Keys and Salts)
и замените его. Сгенерировать уникальные значения можно командой:

```bash
curl -s https://api.wordpress.org/secret-key/1.1/salt/
```

Скопируйте вывод и вставьте в `wp-config.php` вместо строк-заглушек.

### Завершаем установку через браузер

Если вы работаете на виртуальной машине, откройте в браузере
на своём компьютере:

```
http://IP-адрес-сервера
```

Где `IP-адрес-сервера` — адрес, который вы узнали в главе 10
через `ip addr show`.

Если всё настроено правильно, вы увидите мастер установки WordPress.
Выберите язык, задайте название сайта, имя администратора и пароль.

> **Нет доступа к браузеру?** Если вы работаете только через
> терминал, можно проверить, что WordPress отвечает, с помощью curl:
>
> ```bash
> curl -I http://localhost
> ```
>
> Код `200` или `302` (перенаправление на установку) означает, что
> WordPress работает.

## Проверка всего стека

После установки убедимся, что все компоненты работают:

```bash
# Статус сервисов
systemctl status nginx
systemctl status php*-fpm
systemctl status mariadb

# Открытые порты
sudo ss -tlnp

# Ответ от сайта
curl -I http://localhost

# Логи (если что-то не работает)
journalctl -u nginx --since "10 minutes ago"
journalctl -u php*-fpm --since "10 minutes ago"
```

Вы должны увидеть:

- nginx, PHP-FPM и MariaDB — `active (running)`
- Порты 80 (nginx), 3306 (MariaDB) — в списке `ss`
- `curl` возвращает `HTTP/1.1 200 OK` или `HTTP/1.1 302 Found`

## Справочник команд

### nginx

| Команда | Описание |
|---------|----------|
| `sudo apt install nginx` | Установить nginx |
| `sudo nginx -t` | Проверить конфигурацию |
| `sudo systemctl reload nginx` | Перечитать конфигурацию |
| `sudo ln -s /etc/nginx/sites-available/сайт /etc/nginx/sites-enabled/` | Включить сайт |

### PHP-FPM

| Команда | Описание |
|---------|----------|
| `sudo apt install php-fpm php-mysql ...` | Установить PHP-FPM и модули |
| `systemctl status php*-fpm` | Статус PHP-FPM |
| `php -v` | Версия PHP |

### MariaDB

| Команда | Описание |
|---------|----------|
| `sudo apt install mariadb-server` | Установить MariaDB |
| `sudo mysql_secure_installation` | Начальная настройка безопасности |
| `sudo mariadb` | Подключиться к MariaDB от root |
| `mariadb -u пользователь -p база` | Подключиться под указанным пользователем |

### WordPress

| Команда | Описание |
|---------|----------|
| `curl -LO https://wordpress.org/latest.tar.gz` | Скачать WordPress |
| `sudo tar -xzf latest.tar.gz -C /var/www/` | Распаковать в /var/www/ |
| `curl -s https://api.wordpress.org/secret-key/1.1/salt/` | Сгенерировать соли |

## Практические задания

1. Выполните `curl -I http://localhost`. Какой код ответа вы
   получили? Какой сервер указан в заголовке `Server`?

2. Посмотрите лог доступа nginx: `sudo tail -5 /var/log/nginx/access.log`.
   Найдите свой запрос от `curl`. Какой метод, URL и код ответа
   записаны в логе?

3. Выполните `sudo ss -tlnp`. Найдите все процессы, связанные
   с нашим стеком: nginx (порт 80), MariaDB (порт 3306). На каких
   адресах они слушают?

4. Посмотрите unit-файл nginx: `systemctl cat nginx`. Найдите
   директиву `ExecStart`. Сравните с тем, что мы разбирали в главе 09
   для ssh.service — какие общие элементы?

5. Подключитесь к MariaDB (`sudo mariadb`) и выполните
   `SHOW DATABASES;`. Видна ли база `wordpress`? Выполните
   `USE wordpress; SHOW TABLES;` — какие таблицы создал WordPress?

6. Остановите PHP-FPM: `sudo systemctl stop php*-fpm`. Попробуйте
   открыть сайт через `curl http://localhost`. Какую ошибку вы
   получите? Запустите PHP-FPM обратно и убедитесь, что сайт снова
   работает.

7. Посмотрите файл `/etc/nginx/sites-available/wordpress`. Измените
   директиву `index`, убрав `index.php` из списка. Выполните
   `sudo nginx -t` и `sudo systemctl reload nginx`. Что произойдёт
   при обращении к `http://localhost`? Верните настройку обратно.

## Итоги

В этой главе вы:

- разобрались с клиент-серверной моделью, HTTP-запросами и ответами;
- установили и настроили nginx — создали серверный блок для WordPress;
- установили PHP-FPM и связали его с nginx через Unix-сокет;
- установили MariaDB, создали базу данных и пользователя;
- скачали и настроили WordPress, прошли мастер установки;
- проверили работу всего стека: nginx + PHP-FPM + WordPress + MariaDB;
- **развернули полноценный веб-сайт** — главную цель сквозного
  проекта.

В следующей главе мы разберём **логирование и мониторинг** — научимся
анализировать логи nginx и системные журналы, чтобы находить
проблемы и следить за работой сервера.
