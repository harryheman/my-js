# Этап 15. Docker Compose: оркестрация в контейнерах

## Зачем нужен Docker Compose

В предыдущей главе мы запускали один контейнер nginx командой
`docker run` с несколькими флагами. Для полного стека WordPress
нужно **три контейнера**: MariaDB, WordPress (с PHP-FPM) и nginx.
У каждого свои порты, volumes, переменные окружения.

Представьте три команды `docker run`, каждая на несколько строк:

```bash
docker run -d --name db \
  -e MYSQL_ROOT_PASSWORD=secret \
  -e MYSQL_DATABASE=wordpress \
  -v db_data:/var/lib/mysql \
  mariadb:11

docker run -d --name wordpress \
  -e WORDPRESS_DB_HOST=db \
  -e WORDPRESS_DB_PASSWORD=secret \
  --link db \
  -v wp_data:/var/www/html \
  wordpress:6-fpm

docker run -d --name nginx \
  -p 80:80 \
  -v ./nginx/default.conf:/etc/nginx/conf.d/default.conf:ro \
  -v wp_data:/var/www/html:ro \
  --link wordpress \
  nginx:1.27
```

Запускать, останавливать и обновлять три контейнера по отдельности —
неудобно и легко ошибиться. **Docker Compose** решает эту проблему:
весь стек описывается в одном YAML-файле, а управляется одной
командой.

> **Привязка к проекту.** В главе 11 мы разворачивали nginx +
> PHP-FPM + MariaDB + WordPress вручную — устанавливали пакеты,
> редактировали конфиги, создавали базу данных. Сейчас мы получим
> тот же результат одной командой `docker compose up`.

## Установка

Docker Compose — это плагин Docker. Установим его:

```bash
sudo apt install docker-compose-plugin
```

Проверим:

```bash
docker compose version
```

```
Docker Compose version v2.32.4
```

> **Примечание.** Старая версия инструмента называлась
> `docker-compose` (через дефис) и устанавливалась отдельно.
> Новая — `docker compose` (через пробел) — встроенный плагин
> Docker. В интернете вы ещё встретите старый синтаксис, но
> используйте новый.

## Подготовка структуры проекта

Перестроим каталог `wordpress-project/` для контейнерного деплоя:

```bash
cd ~/wordpress-project
mkdir -p nginx
```

Итоговая структура будет такой:

```
wordpress-project/
├── docker-compose.yml    ← описание всего стека
├── .env                  ← пароли и настройки (не в Git!)
├── nginx/
│   └── default.conf      ← конфигурация nginx
├── .gitignore
└── .dockerignore
```

WordPress и MariaDB будут работать из готовых образов Docker Hub.
Для nginx нужен только кастомный конфиг.

## Шаг 1: база данных (MariaDB)

Начнём с одного сервиса — базы данных. Создадим файл
`docker-compose.yml`:

```bash
nano docker-compose.yml
```

```yaml
services:
  db:
    image: mariadb:11
    restart: unless-stopped
    env_file:
      - .env
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: ${DB_NAME}
      MYSQL_USER: ${DB_USER}
      MYSQL_PASSWORD: ${DB_PASSWORD}
    volumes:
      - db_data:/var/lib/mysql

volumes:
  db_data:
```

Разберём ключевые элементы:

| Ключ | Описание |
|------|----------|
| `services` | Список сервисов (контейнеров) |
| `db` | Имя сервиса — будет использоваться как сетевое имя |
| `image: mariadb:11` | Образ из Docker Hub |
| `restart: unless-stopped` | Перезапускать контейнер, если он упал (кроме ручной остановки) |
| `env_file` | Файл с переменными окружения |
| `environment` | Переменные окружения для контейнера |
| `${DB_ROOT_PASSWORD}` | Подстановка значения из `.env` |
| `volumes` | Привязка томов (volumes) |
| `db_data:/var/lib/mysql` | Именованный том для хранения данных БД |

В секции `volumes:` на верхнем уровне мы **объявляем** именованный
том `db_data`. Docker создаст его автоматически. Данные в именованном
томе сохраняются даже после удаления контейнера — пока вы явно
не удалите том.

### Где хранятся данные тома

Именованные тома Docker хранит в своём внутреннем каталоге. Найти
путь к данным можно командой:

```bash
docker volume inspect wordpress-project_db_data
```

```json
[
    {
        "Name": "wordpress-project_db_data",
        "Mountpoint": "/var/lib/docker/volumes/wordpress-project_db_data/_data",
        ...
    }
]
```

Поле `Mountpoint` — путь к файлам тома на хосте. Однако этот
каталог принадлежит Docker, и работать с ним напрямую не очень
удобно.

Если вы хотите, чтобы данные лежали прямо в каталоге проекта
(например, чтобы скопировать весь проект на другой сервер или
на флешку), используйте **локальный путь** вместо именованного тома:

```yaml
    volumes:
      - ./db_data:/var/lib/mysql
```

В этом случае данные БД окажутся в `~/wordpress-project/db_data/`.
Достаточно выполнить `docker compose down`, скопировать весь
каталог `wordpress-project/` — и на другом сервере
`docker compose up -d` поднимет стек с теми же данными.

> **Компромисс.** Именованные тома работают быстрее (особенно
> на macOS и Windows) и управляются Docker. Локальные пути
> удобнее для переноса и резервного копирования. В этом курсе мы
> используем именованные тома, но для своих проектов выбирайте
> то, что подходит под задачу.

### Файл .env

Создадим файл с паролями и настройками:

```bash
nano .env
```

```
DB_ROOT_PASSWORD=SuperSecret123
DB_NAME=wordpress
DB_USER=wp_user
DB_PASSWORD=WpPassword456
```

> **Важно.** Файл `.env` содержит пароли — он **не должен** попадать
> в Git. Добавьте его в `.gitignore` (мы разбирали это в главе 13):
>
> ```bash
> echo ".env" >> .gitignore
> ```

### Запуск и проверка

```bash
docker compose up -d
```

```
[+] Running 2/2
 ✔ Network wordpress-project_default  Created
 ✔ Container wordpress-project-db-1   Started
```

Обратите внимание: Docker Compose автоматически создал **сеть**
`wordpress-project_default`. Все сервисы из одного compose-файла
попадают в эту сеть и могут обращаться друг к другу **по имени
сервиса** (например, `db`). Это работает благодаря встроенному
DNS — не нужно знать IP-адреса контейнеров.

Проверим статус:

```bash
docker compose ps
```

```
NAME                        IMAGE        ...  STATUS          PORTS
wordpress-project-db-1      mariadb:11   ...  Up 10 seconds   3306/tcp
```

Посмотрим логи:

```bash
docker compose logs db
```

Если видите строку `ready for connections` — MariaDB запустилась
успешно.

## Шаг 2: WordPress

Добавим сервис `wordpress` в `docker-compose.yml`. Откройте файл
и допишите сервис:

```bash
nano docker-compose.yml
```

```yaml
services:
  db:
    image: mariadb:11
    restart: unless-stopped
    env_file:
      - .env
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: ${DB_NAME}
      MYSQL_USER: ${DB_USER}
      MYSQL_PASSWORD: ${DB_PASSWORD}
    volumes:
      - db_data:/var/lib/mysql

  wordpress:
    image: wordpress:6-fpm
    restart: unless-stopped
    depends_on:
      - db
    env_file:
      - .env
    environment:
      WORDPRESS_DB_HOST: db
      WORDPRESS_DB_NAME: ${DB_NAME}
      WORDPRESS_DB_USER: ${DB_USER}
      WORDPRESS_DB_PASSWORD: ${DB_PASSWORD}
    volumes:
      - wordpress_data:/var/www/html

volumes:
  db_data:
  wordpress_data:
```

Что нового:

| Ключ | Описание |
|------|----------|
| `wordpress:6-fpm` | Официальный образ WordPress с PHP-FPM (без встроенного веб-сервера) |
| `depends_on: - db` | WordPress запускается **после** MariaDB |
| `WORDPRESS_DB_HOST: db` | Адрес базы данных — имя сервиса `db` (внутренний DNS Compose) |
| `wordpress_data` | Том для файлов WordPress (`/var/www/html`) |

> **Почему `wordpress:6-fpm`, а не `wordpress:6`?** Образ
> `wordpress:6` содержит Apache — встроенный веб-сервер. Нам он
> не нужен, потому что мы используем nginx. Образ с тегом `fpm`
> содержит только PHP-FPM, который обрабатывает PHP-файлы и
> отдаёт результат через FastCGI.

Применим изменения:

```bash
docker compose up -d
```

```
[+] Running 3/3
 ✔ Container wordpress-project-db-1          Running
 ✔ Container wordpress-project-wordpress-1   Started
```

Docker Compose не перезапустил `db` — он видит, что сервис не
изменился. Запустился только новый сервис `wordpress`.

Проверим, что WordPress видит базу данных:

```bash
docker compose logs wordpress
```

Если нет ошибок подключения к БД — всё работает.

## Шаг 3: nginx

Сначала создадим конфигурацию nginx. Он должен:

- отдавать статические файлы (CSS, JS, картинки) самостоятельно;
- передавать PHP-запросы на WordPress через FastCGI.

```bash
nano nginx/default.conf
```

```nginx
server {
    listen 80;
    server_name localhost;

    root /var/www/html;
    index index.php index.html;

    location / {
        try_files $uri $uri/ /index.php?$args;
    }

    location ~ \.php$ {
        fastcgi_pass wordpress:9000;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 30d;
        access_log off;
    }
}
```

Ключевая строка — `fastcgi_pass wordpress:9000`. Здесь `wordpress` —
имя сервиса из `docker-compose.yml`, а `9000` — порт, на котором
PHP-FPM слушает соединения внутри контейнера.

Теперь добавим сервис nginx в `docker-compose.yml`:

```bash
nano docker-compose.yml
```

Финальная версия файла:

```yaml
services:
  db:
    image: mariadb:11
    restart: unless-stopped
    env_file:
      - .env
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: ${DB_NAME}
      MYSQL_USER: ${DB_USER}
      MYSQL_PASSWORD: ${DB_PASSWORD}
    volumes:
      - db_data:/var/lib/mysql

  wordpress:
    image: wordpress:6-fpm
    restart: unless-stopped
    depends_on:
      - db
    env_file:
      - .env
    environment:
      WORDPRESS_DB_HOST: db
      WORDPRESS_DB_NAME: ${DB_NAME}
      WORDPRESS_DB_USER: ${DB_USER}
      WORDPRESS_DB_PASSWORD: ${DB_PASSWORD}
    volumes:
      - wordpress_data:/var/www/html

  nginx:
    image: nginx:1.27
    restart: unless-stopped
    depends_on:
      - wordpress
    ports:
      - "80:80"
    volumes:
      - ./nginx/default.conf:/etc/nginx/conf.d/default.conf:ro
      - wordpress_data:/var/www/html:ro

volumes:
  db_data:
  wordpress_data:
```

Что нового в сервисе `nginx`:

| Ключ | Описание |
|------|----------|
| `ports: - "80:80"` | Проброс порта 80 хоста на порт 80 контейнера |
| `./nginx/default.conf:...` | Монтирование нашего конфига (путь на хосте → путь в контейнере) |
| `wordpress_data:/var/www/html:ro` | Тот же том, что у WordPress — nginx читает статические файлы |
| `:ro` | Read-only — nginx только читает файлы, не изменяет их |

Обратите внимание: сервисы `wordpress` и `nginx` используют
**один и тот же том** `wordpress_data`. WordPress записывает
PHP-файлы в `/var/www/html`, а nginx читает оттуда статику.

## Запуск и проверка

Запустим весь стек:

```bash
docker compose up -d
```

```
[+] Running 4/4
 ✔ Network wordpress-project_default         Created
 ✔ Container wordpress-project-db-1          Started
 ✔ Container wordpress-project-wordpress-1   Started
 ✔ Container wordpress-project-nginx-1       Started
```

Проверим, что все три контейнера работают:

```bash
docker compose ps
```

```
NAME                             IMAGE              STATUS          PORTS
wordpress-project-db-1           mariadb:11         Up 5 seconds    3306/tcp
wordpress-project-nginx-1        nginx:1.27         Up 3 seconds    0.0.0.0:80->80/tcp
wordpress-project-wordpress-1    wordpress:6-fpm    Up 4 seconds    9000/tcp
```

Проверим через curl:

```bash
curl -I http://localhost
```

```
HTTP/1.1 302 Found
Location: http://localhost/wp-admin/install.php
...
```

Код 302 и редирект на `/wp-admin/install.php` — WordPress работает
и предлагает пройти мастер установки. Это тот же результат, что
в главе 11, но вместо ручной установки пакетов, настройки конфигов
и создания базы данных — **одна команда** `docker compose up -d`.

Схема взаимодействия сервисов:

```
                    ┌─────────────────────────────────────────┐
                    │         Docker Compose сеть              │
                    │                                         │
Браузер ──► nginx:80 ──► wordpress:9000 (PHP-FPM) ──► db:3306 │
                    │                                (MariaDB)│
                    └─────────────────────────────────────────┘
```

1. Браузер отправляет запрос на порт 80 хоста.
2. nginx принимает запрос. Если это статический файл (CSS, JS,
   картинка) — отдаёт сам. Если PHP — передаёт на `wordpress:9000`.
3. PHP-FPM обрабатывает PHP-код WordPress, при необходимости
   обращается к базе данных `db:3306`.
4. Ответ идёт обратно по цепочке в браузер.

## Управление стеком

### Основные команды

| Команда | Описание |
|---------|----------|
| `docker compose up -d` | Запустить все сервисы в фоне |
| `docker compose down` | Остановить и удалить контейнеры и сети |
| `docker compose down -v` | То же + удалить тома (все данные!) |
| `docker compose ps` | Статус сервисов |
| `docker compose logs` | Логи всех сервисов |
| `docker compose logs -f nginx` | Следить за логами одного сервиса |
| `docker compose restart` | Перезапустить все сервисы |
| `docker compose restart nginx` | Перезапустить один сервис |
| `docker compose exec wordpress bash` | Войти внутрь контейнера |
| `docker compose pull` | Обновить образы до последних версий |

### stop vs. down

- `docker compose stop` — **останавливает** контейнеры, но не
  удаляет их. При следующем `docker compose start` контейнеры
  запустятся с прежними данными.
- `docker compose down` — **останавливает и удаляет** контейнеры
  и сети. Тома (volumes) сохраняются — данные БД не пропадут.
- `docker compose down -v` — удаляет **всё**, включая тома.
  Используйте с осторожностью: данные базы данных будут потеряны
  безвозвратно.

### Просмотр логов

Логи всех сервисов одновременно:

```bash
docker compose logs
```

Следить за логами nginx в реальном времени:

```bash
docker compose logs -f nginx
```

Показать последние 50 строк логов WordPress:

```bash
docker compose logs --tail 50 wordpress
```

### Выполнение команд внутри контейнера

Войти в контейнер WordPress:

```bash
docker compose exec wordpress bash
```

Проверить версию PHP:

```bash
docker compose exec wordpress php -v
```

Подключиться к MariaDB:

```bash
docker compose exec db mariadb -u wp_user -p wordpress
```

## Практические задания

1. Установите `docker-compose-plugin`. Проверьте версию командой
   `docker compose version`.

2. Создайте файл `.env` с переменными `DB_ROOT_PASSWORD`,
   `DB_NAME`, `DB_USER`, `DB_PASSWORD`. Добавьте `.env` в
   `.gitignore`.

3. Создайте `docker-compose.yml` с одним сервисом `db`
   (MariaDB). Запустите его и проверьте логи — найдите строку
   `ready for connections`.

4. Добавьте сервис `wordpress` с образом `wordpress:6-fpm`.
   Запустите `docker compose up -d` и убедитесь, что WordPress
   подключился к базе данных (проверьте логи на отсутствие ошибок).

5. Создайте файл `nginx/default.conf` с конфигурацией для
   проксирования PHP-запросов. Добавьте сервис `nginx` в
   compose-файл. Запустите и проверьте `curl -I http://localhost`.

6. Посмотрите логи всех сервисов (`docker compose logs`).
   Зайдите внутрь контейнера WordPress и проверьте версию PHP
   (`docker compose exec wordpress php -v`).

7. Остановите стек командой `docker compose down` (без `-v`).
   Запустите снова. Убедитесь, что данные сохранились — WordPress
   не предлагает повторную установку.

8. Выполните `docker compose down -v`. Запустите стек снова.
   Убедитесь, что WordPress снова показывает мастер установки —
   данные были удалены вместе с томами.

## Итоги

В этой главе вы:

- узнали, зачем нужен Docker Compose и как он упрощает управление
  несколькими контейнерами;
- пошагово собрали `docker-compose.yml` из трёх сервисов: MariaDB,
  WordPress (PHP-FPM) и nginx;
- научились хранить пароли в файле `.env` и не допускать их попадания
  в Git;
- разобрали, как контейнеры взаимодействуют через внутреннюю сеть
  Docker Compose (обращение по имени сервиса);
- освоили управление стеком: запуск, остановка, логи, выполнение
  команд внутри контейнеров.

Весь стек из главы 11 — nginx + PHP-FPM + MariaDB + WordPress —
теперь запускается одной командой `docker compose up -d` и может
быть развёрнут на любом сервере с Docker.

**В следующей главе** мы настроим **CI/CD на GitLab** — автоматическую
сборку и деплой, чтобы при каждом push в репозиторий стек
обновлялся автоматически.
