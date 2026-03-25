# Этап 16. CI/CD: автоматизация сборки и деплоя

## Зачем автоматизировать

В предыдущих главах мы проделали большой путь: написали
`docker-compose.yml`, настроили nginx, WordPress, MariaDB и
отправили проект в GitLab. Но каждый раз, когда нужно обновить
сайт, мы действуем вручную:

1. Изменяем файлы на локальной машине.
2. Делаем `git push`.
3. Заходим на сервер по SSH.
4. Выполняем `git pull`.
5. Запускаем `docker compose up -d`.

Пять шагов — и ни один нельзя пропустить. Забыли `git pull` —
на сервере старая версия. Ошиблись в конфиге — сайт лёг, а вы
узнали об этом от пользователей.

**CI/CD** решает эту проблему: после `git push` всё остальное
происходит автоматически.

> **Привязка к проекту.** В главе 13 мы отправили
> `wordpress-project` в GitLab, в главе 15 описали весь стек
> в `docker-compose.yml`. Теперь мы свяжем эти два шага:
> каждый push в GitLab будет запускать автоматическую проверку
> и деплой нашего WordPress-стека.

## Что такое CI/CD

CI/CD — это две связанные практики:

**CI — Continuous Integration** (непрерывная интеграция):
автоматическая проверка кода после каждого push. Цель — как
можно раньше обнаружить ошибку.

**CD — Continuous Delivery / Deployment** (непрерывная поставка /
развёртывание): автоматический деплой проверенного кода на сервер.
Цель — чтобы изменения попадали в продакшен быстро и без ручных
шагов.

```
                        CI/CD-конвейер (pipeline)

  git push ──→ [ Сборка ] ──→ [ Тестирование ] ──→ [ Деплой ]
                  │                  │                  │
              Собрать образ    Проверить, что     Обновить стек
              Docker           конфиг корректен   на сервере
```

Каждый блок — это **этап** (stage). Если этап упал — конвейер
останавливается, следующие этапы не запускаются. Разработчик
получает уведомление и может исправить ошибку до того, как
сломанный код попадёт на сервер.

### CI/CD-системы

Существует много инструментов для CI/CD: Jenkins, GitHub Actions,
GitLab CI/CD, Drone, CircleCI и другие. Мы будем использовать
**GitLab CI/CD**, потому что наш репозиторий уже хранится
в GitLab (глава 13) — ничего дополнительного устанавливать
не нужно.

> **Принцип тот же.** Если вы позже перейдёте на GitHub Actions
> или Jenkins — концепции останутся прежними: конвейер, этапы,
> задачи, переменные окружения. Изменится только синтаксис
> конфигурационного файла.

## Как устроен GitLab CI/CD

GitLab CI/CD состоит из двух частей:

1. **Файл `.gitlab-ci.yml`** в корне репозитория — описывает,
   что и в каком порядке делать.
2. **GitLab Runner** — программа, которая выполняет задачи
   из конвейера. Runner может работать на том же сервере, где
   развёрнут проект, или на отдельной машине.

```
  GitLab.com                          Ваш сервер
┌────────────────┐               ┌─────────────────┐
│  Репозиторий   │   webhook     │  GitLab Runner   │
│  wordpress-    │──────────────→│                  │
│  project       │               │  Выполняет       │
│                │               │  задачи из       │
│  .gitlab-ci.yml│               │  .gitlab-ci.yml  │
└────────────────┘               └─────────────────┘
```

При каждом `git push` GitLab читает `.gitlab-ci.yml` и отправляет
задачи свободному Runner. Runner клонирует репозиторий, выполняет
команды и сообщает результат обратно в GitLab.

## Установка GitLab Runner

GitLab Runner устанавливается на сервер, где будет выполняться
конвейер. В нашем случае — на тот же сервер, где работает
Docker Compose.

### Шаг 1: добавление репозитория и установка

```bash
curl -L "https://packages.gitlab.com/install/repositories/runner/gitlab-runner/script.deb.sh" | sudo bash
sudo apt install gitlab-runner
```

Проверим установку:

```bash
gitlab-runner --version
```

```
Version:      17.7.0
Git revision: 12345abc
Git branch:   main
GO version:   go1.22.5
Built:        2025-01-15T10:00:00+0000
OS/Arch:      linux/amd64
```

### Шаг 2: регистрация Runner в GitLab

Runner нужно связать с вашим проектом. Для этого:

1. Откройте проект `wordpress-project` на gitlab.com.
2. Перейдите в **Settings → CI/CD → Runners**.
3. Нажмите **New project runner**.
4. Выберите **Linux** как платформу.
5. В поле **Tags** введите `deploy` (по этому тегу мы будем
   обращаться к Runner из конвейера).
6. Нажмите **Create runner** — GitLab покажет токен регистрации.

На сервере выполните:

```bash
sudo gitlab-runner register
```

Runner задаст несколько вопросов:

```
Enter the GitLab instance URL (for example, https://gitlab.com/):
https://gitlab.com/

Enter the registration token:
<вставьте токен из GitLab>

Enter a description for the runner:
wordpress-deploy

Enter tags for the runner (comma-separated):
deploy

Enter optional maintenance note for the runner:
<нажмите Enter>

Enter an executor:
docker
```

> **Почему executor `docker`?** Runner с Docker-executor
> выполняет каждую задачу внутри отдельного контейнера. Это
> обеспечивает изоляцию: задачи не могут повлиять на хост-систему
> и не зависят от установленных на хосте пакетов.

Когда Runner спросит образ по умолчанию:

```
Enter the default Docker image:
docker:27
```

Проверим, что Runner зарегистрирован и работает:

```bash
sudo gitlab-runner list
```

```
Listing configured runners          ConfigFile=/etc/gitlab-runner/config.toml
wordpress-deploy                    Executor=docker Token=glrt-... URL=https://gitlab.com/
```

### Шаг 3: настройка Docker-in-Docker

Наш конвейер будет запускать команды Docker (собирать образы,
запускать `docker compose`). Для этого Runner должен иметь доступ
к Docker. Самый простой способ — подключить Docker-сокет хоста.

Откроем конфигурацию Runner:

```bash
sudo nano /etc/gitlab-runner/config.toml
```

Найдите секцию `[runners.docker]` и добавьте строку `volumes`:

```toml
[runners.docker]
  image = "docker:27"
  privileged = false
  volumes = ["/var/run/docker.sock:/var/run/docker.sock", "/cache"]
```

> **Внимание.** Монтирование Docker-сокета даёт Runner полный
> доступ к Docker на хосте. Это допустимо для учебного сервера,
> но в продакшене стоит рассмотреть более безопасные варианты:
> Docker-in-Docker (DinD) с `privileged: true` или использование
> rootless Docker.

Перезапустим Runner, чтобы он подхватил новый конфиг:

```bash
sudo systemctl restart gitlab-runner
```

Проверим статус:

```bash
sudo systemctl status gitlab-runner
```

```
● gitlab-runner.service - GitLab Runner
     Active: active (running)
```

## Первый конвейер

Начнём с простого конвейера, чтобы убедиться, что всё работает.

Перейдём в каталог проекта и создадим файл `.gitlab-ci.yml`:

```bash
cd ~/wordpress-project
nano .gitlab-ci.yml
```

```yaml
stages:
  - test

check-config:
  stage: test
  image: docker:27
  tags:
    - deploy
  script:
    - docker compose config --quiet
    - echo "Конфигурация корректна"
```

Разберём каждую строку:

| Ключ | Описание |
|------|----------|
| `stages` | Список этапов конвейера в порядке выполнения |
| `check-config` | Имя задачи (job) — произвольное |
| `stage: test` | К какому этапу относится задача |
| `image: docker:27` | Образ Docker, внутри которого выполняется задача |
| `tags: - deploy` | Запускать только на Runner с тегом `deploy` |
| `script` | Список команд, которые выполнятся последовательно |
| `docker compose config --quiet` | Проверяет `docker-compose.yml` на синтаксические ошибки |

Отправим изменения в GitLab:

```bash
git add .gitlab-ci.yml
git commit -m "Добавить CI/CD: проверка конфигурации"
git push
```

Теперь откройте проект на gitlab.com и перейдите в **Build →
Pipelines**. Вы увидите запущенный конвейер:

```
Pipeline #1       check-config ✓       passed       1 minute ago
```

Нажмите на имя задачи, чтобы увидеть лог выполнения. Если всё
настроено правильно — задача пройдёт успешно, и вы увидите
зелёную галочку.

> **Совет.** Если конвейер не запускается, проверьте: 1) Runner
> зарегистрирован и онлайн (Settings → CI/CD → Runners); 2) тег
> `deploy` в `.gitlab-ci.yml` совпадает с тегом Runner;
> 3) файл `.gitlab-ci.yml` находится в корне репозитория.

## Полный конвейер: проверка и деплой

Теперь создадим конвейер из двух этапов: **test** (проверка)
и **deploy** (развёртывание).

```bash
nano .gitlab-ci.yml
```

```yaml
stages:
  - test
  - deploy

# --- Этап 1: проверка ---
validate:
  stage: test
  image: docker:27
  tags:
    - deploy
  script:
    - docker compose config --quiet
    - echo "docker-compose.yml — OK"

lint-nginx:
  stage: test
  image: nginx:1.27
  tags:
    - deploy
  script:
    - cp nginx/default.conf /etc/nginx/conf.d/default.conf
    - nginx -t
    - echo "nginx.conf — OK"

# --- Этап 2: деплой ---
deploy-production:
  stage: deploy
  image: docker:27
  tags:
    - deploy
  only:
    - main
  script:
    - docker compose down
    - docker compose pull
    - docker compose up -d
    - docker compose ps
  environment:
    name: production
```

Разберём новые элементы:

### Два этапа

```
stages:
  - test       ← выполняется первым
  - deploy     ← выполняется, только если test пройден
```

Задачи внутри одного этапа запускаются **параллельно** (если есть
свободные Runner). Задачи следующего этапа — только после
успешного завершения всех задач предыдущего.

```
  Pipeline
  ┌──────────────────────────┐    ┌────────────────────┐
  │       test               │    │      deploy         │
  │  ┌──────────┐            │    │  ┌────────────────┐ │
  │  │ validate │            │───→│  │ deploy-        │ │
  │  └──────────┘            │    │  │ production     │ │
  │  ┌───────────┐           │    │  └────────────────┘ │
  │  │ lint-nginx│           │    │                     │
  │  └───────────┘           │    │                     │
  └──────────────────────────┘    └────────────────────-┘
```

### Проверка конфигурации nginx

Задача `lint-nginx` использует образ `nginx:1.27` — в нём есть
утилита `nginx -t`, которая проверяет конфигурацию на ошибки,
не запуская сам сервер. Если в конфиге опечатка — конвейер
остановится до деплоя.

### Деплой только из main

```yaml
only:
  - main
```

Это значит: задача `deploy-production` выполняется **только**
при push в ветку `main`. Если вы работаете в feature-ветке —
проверки запустятся, но деплой нет. Это важная защита: сырой код
из экспериментальной ветки не попадёт на сервер.

### Окружение (environment)

```yaml
environment:
  name: production
```

GitLab запоминает деплои и показывает их на странице
**Operate → Environments**. Вы видите, когда и какая версия
была развёрнута — удобно для отслеживания.

Отправим обновлённый конвейер:

```bash
git add .gitlab-ci.yml
git commit -m "CI/CD: добавить проверку nginx и деплой"
git push
```

В GitLab вы увидите конвейер с двумя этапами:

```
Pipeline #2    validate ✓  lint-nginx ✓  │  deploy-production ✓    passed
```

## Переменные окружения и секреты

Файл `.env` содержит пароли — он не должен храниться в Git
(мы добавили его в `.gitignore` в главе 15). Но тогда как
конвейер получит пароли для деплоя?

**GitLab CI/CD Variables** — безопасное хранилище для секретов.

### Настройка переменных

1. Откройте проект на gitlab.com.
2. Перейдите в **Settings → CI/CD → Variables**.
3. Нажмите **Add variable** и создайте четыре переменные:

| Ключ | Значение (пример) | Настройки |
|------|-------------------|-----------|
| `DB_ROOT_PASSWORD` | `SuperStr0ng!Root` | Masked, Protected |
| `DB_NAME` | `wordpress` | Protected |
| `DB_USER` | `wp_user` | Protected |
| `DB_PASSWORD` | `Wp_S3cur3_Pass!` | Masked, Protected |

Флаги:

- **Masked** — значение скрыто в логах конвейера (вместо пароля
  отображается `[MASKED]`).
- **Protected** — переменная доступна только в protected-ветках
  (по умолчанию `main`). Это ещё один уровень защиты — из
  случайной ветки пароли не достать.

> **Важно.** Никогда не выводите секреты через `echo` в `script`.
> Даже если переменная masked — лучше не рисковать. Относитесь
> к секретам как к паролям: чем меньше мест, где они видны,
> тем лучше.

### Использование переменных в конвейере

GitLab автоматически передаёт переменные как переменные окружения
внутрь каждой задачи. Docker Compose, в свою очередь, умеет
подставлять переменные окружения вместо `${...}` в
`docker-compose.yml`.

Обновим задачу деплоя — создадим файл `.env` из переменных
GitLab прямо перед запуском:

```yaml
deploy-production:
  stage: deploy
  image: docker:27
  tags:
    - deploy
  only:
    - main
  script:
    - |
      cat > .env << EOF
      DB_ROOT_PASSWORD=${DB_ROOT_PASSWORD}
      DB_NAME=${DB_NAME}
      DB_USER=${DB_USER}
      DB_PASSWORD=${DB_PASSWORD}
      EOF
    - docker compose down
    - docker compose pull
    - docker compose up -d
    - docker compose ps
  environment:
    name: production
```

Конструкция `cat > .env << EOF ... EOF` создаёт файл `.env`
из переменных, которые GitLab передал задаче. Файл существует
только на время выполнения задачи — после завершения контейнер
Runner удаляется вместе с файлом.

## Конвейер с уведомлениями

Полезно знать, успешно ли прошёл деплой, не заходя каждый раз
в GitLab. Добавим задачу, которая отправляет уведомление
после деплоя:

```yaml
notify-success:
  stage: deploy
  image: alpine:3.20
  tags:
    - deploy
  needs:
    - deploy-production
  script:
    - echo "Деплой завершён успешно"
    - echo "Коммит — $CI_COMMIT_SHORT_SHA"
    - echo "Автор — $CI_COMMIT_AUTHOR"
    - echo "Сообщение — $CI_COMMIT_MESSAGE"
```

Здесь мы используем **встроенные переменные** GitLab CI/CD:

| Переменная | Описание |
|-----------|----------|
| `CI_COMMIT_SHORT_SHA` | Короткий хеш коммита (например, `a1b2c3d`) |
| `CI_COMMIT_AUTHOR` | Автор коммита |
| `CI_COMMIT_MESSAGE` | Текст коммита |
| `CI_PIPELINE_URL` | Ссылка на конвейер в GitLab |
| `CI_PROJECT_NAME` | Имя проекта |
| `CI_COMMIT_BRANCH` | Имя ветки |

> **Примечание.** В реальных проектах уведомления обычно
> отправляют в Telegram, Slack или по email. GitLab также умеет
> отправлять email-уведомления автоматически — это настраивается
> в **Settings → Integrations**.

## Ключевое слово `needs` и граф зависимостей

По умолчанию задачи одного этапа запускаются параллельно,
а следующий этап ждёт завершения всех задач предыдущего.
Ключевое слово `needs` позволяет точнее описать зависимости:

```yaml
notify-success:
  needs:
    - deploy-production
```

Это означает: `notify-success` запустится сразу после
`deploy-production`, не дожидаясь остальных задач этапа `deploy`
(если бы они были). Для нашего проекта разница небольшая, но
в крупных конвейерах `needs` позволяет существенно сократить время
выполнения.

## Финальная версия конвейера

Соберём всё вместе — полный файл `.gitlab-ci.yml`:

```bash
nano .gitlab-ci.yml
```

```yaml
stages:
  - test
  - deploy

# --- Этап 1: проверка ---
validate:
  stage: test
  image: docker:27
  tags:
    - deploy
  script:
    - docker compose config --quiet
    - echo "docker-compose.yml — OK"

lint-nginx:
  stage: test
  image: nginx:1.27
  tags:
    - deploy
  script:
    - cp nginx/default.conf /etc/nginx/conf.d/default.conf
    - nginx -t
    - echo "nginx.conf — OK"

# --- Этап 2: деплой ---
deploy-production:
  stage: deploy
  image: docker:27
  tags:
    - deploy
  only:
    - main
  script:
    - |
      cat > .env << EOF
      DB_ROOT_PASSWORD=${DB_ROOT_PASSWORD}
      DB_NAME=${DB_NAME}
      DB_USER=${DB_USER}
      DB_PASSWORD=${DB_PASSWORD}
      EOF
    - docker compose pull
    - docker compose up -d
    - docker compose ps
  environment:
    name: production
```

> **Почему нет `docker compose down` перед `up`?** Команда
> `docker compose up -d` достаточно умна: если образ обновился —
> контейнер будет пересоздан; если нет — останется работать.
> Явный `down` вызывает кратковременный простой, который можно
> избежать. Для нашего учебного проекта разница невелика, но
> это хорошая привычка.

Отправим финальную версию:

```bash
git add .gitlab-ci.yml
git commit -m "CI/CD: финальный конвейер с проверкой и деплоем"
git push
```

## Что происходит после push

Проследим путь кода от `git push` до работающего сайта:

```
1. Вы делаете git push в ветку main
          │
2. GitLab получает изменения и читает .gitlab-ci.yml
          │
3. GitLab отправляет задачи Runner
          │
4. Runner запускает этап test:
   ├── validate:  проверяет docker-compose.yml
   └── lint-nginx: проверяет конфигурацию nginx
          │
5. Все проверки пройдены → Runner запускает этап deploy:
   └── deploy-production:
       ├── Создаёт .env из переменных GitLab
       ├── Скачивает свежие образы (docker compose pull)
       └── Обновляет контейнеры (docker compose up -d)
          │
6. Сайт обновлён. GitLab показывает зелёный статус ✓
```

Если на шаге 4 проверка упадёт (например, опечатка в
`nginx/default.conf`), конвейер остановится — деплой не случится.
Вы увидите красный статус ✗ и сможете прочитать лог ошибки
прямо в GitLab.

## Работа с ветками

CI/CD особенно полезен при работе в команде. Типичный сценарий:

```bash
# Создаём ветку для новой функции
git switch -c feature-caching

# Вносим изменения в nginx/default.conf
nano nginx/default.conf

# Коммитим и пушим
git add nginx/default.conf
git commit -m "Добавить кэширование статики"
git push -u origin feature-caching
```

После push GitLab запустит конвейер для ветки `feature-caching`.
Этап `test` выполнится — вы узнаете, корректен ли новый конфиг.
Этап `deploy` будет пропущен (он срабатывает только для `main`).

Когда проверки пройдены, вы создаёте **Merge Request** (запрос
на слияние) в GitLab:

1. Откройте проект на gitlab.com.
2. GitLab предложит создать Merge Request для свежей ветки —
   нажмите **Create merge request**.
3. Заполните описание и нажмите **Submit**.
4. После ревью нажмите **Merge**.

GitLab сольёт ветку в `main` и автоматически запустит конвейер
деплоя. Конфиг, проверенный в feature-ветке, попадёт на сервер
без единого ручного шага.

> **Merge Request vs. Pull Request.** В GitLab используется
> термин Merge Request (MR), в GitHub — Pull Request (PR).
> Суть одна: предложить изменения для слияния в основную ветку.

## Отладка конвейера

Конвейеры не всегда работают с первого раза. Типичные проблемы
и способы их решения:

### Runner не подхватывает задачу

Симптом: задача висит в статусе «Pending» с пометкой
«This job is stuck because the project doesn't have any
runners online».

Проверьте:

```bash
sudo gitlab-runner status
sudo gitlab-runner list
```

Если Runner не запущен — запустите:

```bash
sudo systemctl start gitlab-runner
```

Если Runner работает, но задача висит — проверьте совпадение
тегов. Тег в `.gitlab-ci.yml` (`tags: - deploy`) должен
совпадать с тегом, указанным при регистрации Runner.

### Ошибка «docker: not found»

Runner с Docker-executor запускает задачи в контейнере. Если
Docker-сокет не подключён — внутри контейнера не будет доступа
к Docker.

Проверьте `/etc/gitlab-runner/config.toml`:

```toml
volumes = ["/var/run/docker.sock:/var/run/docker.sock", "/cache"]
```

После изменения перезапустите Runner:

```bash
sudo systemctl restart gitlab-runner
```

### Ошибка в .gitlab-ci.yml

GitLab проверяет синтаксис файла при получении push. Если в файле
ошибка — конвейер не запустится.

Проверить синтаксис можно заранее, не делая push. В GitLab
есть встроенный инструмент: **Build → Pipeline editor** → вкладка
**Validate**.

Или через API:

```bash
curl --request POST \
  --header "PRIVATE-TOKEN: <ваш-токен>" \
  "https://gitlab.com/api/v4/ci/lint" \
  --form "content=@.gitlab-ci.yml"
```

## Справочник: структура .gitlab-ci.yml

| Ключевое слово | Описание |
|---------------|----------|
| `stages` | Список этапов в порядке выполнения |
| `stage` | К какому этапу относится задача |
| `image` | Docker-образ для выполнения задачи |
| `tags` | На каком Runner запускать (по тегам) |
| `script` | Команды для выполнения |
| `before_script` | Команды, которые выполняются перед `script` |
| `after_script` | Команды, которые выполняются после `script` (даже при ошибке) |
| `only` | В каких ветках запускать задачу |
| `except` | В каких ветках **не** запускать |
| `needs` | Зависимости от других задач (для ускорения) |
| `environment` | Имя окружения для отслеживания деплоев |
| `variables` | Локальные переменные задачи |
| `artifacts` | Файлы, которые нужно сохранить после задачи |
| `when` | Условие запуска: `on_success` (по умолчанию), `on_failure`, `always`, `manual` |

## Практические задания

1. Установите GitLab Runner на сервер. Зарегистрируйте его
   в своём проекте с тегом `deploy`. Убедитесь, что Runner
   отображается как онлайн в Settings → CI/CD → Runners.

2. Создайте `.gitlab-ci.yml` с одной задачей, которая выводит
   `echo "Hello CI/CD"`. Сделайте push и убедитесь, что конвейер
   запустился и прошёл успешно.

3. Добавьте задачу `validate`, которая проверяет
   `docker-compose.yml` командой `docker compose config --quiet`.
   Проверьте, что при корректном файле задача проходит.

4. Внесите намеренную ошибку в `docker-compose.yml` (например,
   неверный отступ). Сделайте push и убедитесь, что конвейер
   упал. Посмотрите лог ошибки в GitLab. Исправьте ошибку
   и отправьте исправление — конвейер должен пройти.

5. Добавьте задачу `lint-nginx`, которая проверяет конфигурацию
   nginx командой `nginx -t`. Убедитесь, что обе задачи этапа
   `test` запускаются параллельно.

6. Создайте переменные `DB_ROOT_PASSWORD`, `DB_NAME`, `DB_USER`
   и `DB_PASSWORD` в Settings → CI/CD → Variables. Включите
   флаги Masked и Protected.

7. Добавьте этап `deploy` с задачей `deploy-production`,
   которая создаёт `.env` из переменных GitLab и запускает
   `docker compose up -d`. Ограничьте задачу веткой `main`
   с помощью `only`.

8. Создайте ветку `feature-test`, внесите изменение в
   `nginx/default.conf`, сделайте push. Убедитесь, что
   проверки прошли, а деплой был пропущен. Создайте Merge
   Request и выполните слияние — убедитесь, что деплой
   запустился автоматически.

9. Сделайте `curl -I http://localhost` после деплоя и убедитесь,
   что WordPress отвечает. Поздравляем — ваш сайт
   разворачивается автоматически!

## Итоги

В этой главе вы:

- узнали, что такое CI/CD и зачем нужна автоматизация сборки
  и деплоя;
- установили и зарегистрировали GitLab Runner на сервере;
- написали `.gitlab-ci.yml` — конфигурацию конвейера с двумя
  этапами: проверка (валидация `docker-compose.yml` и конфига
  nginx) и деплой (`docker compose up -d`);
- научились хранить секреты (пароли базы данных) в переменных
  GitLab CI/CD, а не в репозитории;
- увидели, как работа с ветками и Merge Request позволяет
  проверить изменения до того, как они попадут на сервер.

Теперь весь путь от изменения в коде до работающего сайта
автоматизирован: вы делаете `git push` — GitLab проверяет
конфигурацию и обновляет стек на сервере. Ручные шаги —
SSH, `git pull`, `docker compose up` — больше не нужны.

---

Это последняя глава курса. Давайте оглянемся назад.

В главе 1 вы впервые подключились к Linux-серверу по SSH и
не знали ни одной команды. Сейчас вы умеете работать с файловой
системой, редактировать конфигурации, управлять пользователями
и сервисами, настраивать сеть и файрвол. Вы развернули
полноценный веб-сайт на nginx + PHP-FPM + WordPress — сначала
вручную, потом упаковали его в Docker-контейнеры, описали
в Docker Compose и настроили автоматический деплой через CI/CD.

Это фундамент. Дальше — мониторинг (Prometheus, Grafana),
оркестрация контейнеров (Kubernetes), инфраструктура как код
(Ansible, Terraform), облачные платформы. Но все эти инструменты
опираются на то, что вы уже знаете: командную строку, Linux,
контейнеры и автоматизацию.

Удачи!
