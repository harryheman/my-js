---
slug: miller-review
title: Краткое руководство по работе с данными с помощью Miller
description: Краткое руководство по работе с данными с помощью Miller
authors: harryheman
tags: [command line interface, cli, terminal, miller, data manipulation, json, csv]
---

Привет, друзья!

Представляю вашему вниманию перевод [этой замечательной статьи](https://www.smashingmagazine.com/2022/12/guide-command-line-data-manipulation-cli-miller/), в которой рассказывается о [Miller](https://miller.readthedocs.io/en/latest/) - автономном, легковесном и мощном интерфейсе командной строки (Command Line Interface, CLI) для работы с данными в форматах CSV, JSON и некоторых других.

<!--truncate-->

## Установка

- Linux: `apt-get install miller`
- macOS: `brew install miller`
- Windows: `choco install miller`

Для того, чтобы убедиться в корректной установке Miller, открываем терминал и выполняем следующую команду:

```bash
mlr --version
```

Результат:

<img src="https://habrastorage.org/webt/le/vm/az/levmazu6dybibmyrxmg8keoruck.png" />
<br />

Команда для получения помощи (списка доступных команд):

```bash
mlr help topics
```

## Сигнатура команды

Сигнатура команды Miller выглядит следующим образом:

```bash
mlr [input/output file formats] [verbs] [file]
# например
mlr --csv filter '$color != "red"' example.csv
```

Здесь:

- `--csv` определяет, что форматом входного (обрабатываемого) файла является CSV;
- `filter` определяет операцию, выполняемую с файлом (глагол - verb). В данном случае мы удаляем строки, которые не содержат поля `color` со значением `red`. Существуют и другие глаголы, например, `sort` и `cut` (см. ниже);
- `example.csv` определяет обрабатываемый файл.

## Обзор операций

### Данные

Скачиваем [Рейтинг IMDb американских сериалов](https://raw.githubusercontent.com/smashingmagazine/command-line-data-manipulation/main/tv_ratings.csv).

Глагол [head](https://miller.readthedocs.io/en/latest/reference-verbs/#head) позволяет получить первые 10 строк файла:

```bash
mlr ---csv head ./tv_ratings.csv
```

Результат:

<img src="https://habrastorage.org/webt/le/ip/aa/leipaajdzuszznkr5t_sggo20ci.png" />
<br />

Для форматирования вывода используется флаг `--opprint`:

```bash
mlr --csv --opprint head ./tv_ratings.csv
```

Результат:

<img src="https://habrastorage.org/webt/lr/ny/xf/lrnyxf5wpprwf5zuqrs3y-e4-p4.png" />
<br />

Флаг `--c2p` является сокращением для флагов `--csv --opprint`.

### Цепочка команд

Ключевое слово `then` позволяет объединять глаголы в цепочку, т.е. выполнять несколько операций за один раз (см. ниже).

### Удаление колонок

Колонка `titleId` не несет никакой смысловой нагрузки. Удалим ее с помощью глагола [cut](https://miller.readthedocs.io/en/latest/reference-verbs/#cut):

```bash
mlr --c2p cut -x -f titleId then head ./tv_ratings.csv
```

Здесь:

- `-f` определяет удаляемые поля (перечисляются через запятую);
- `-x` определяет, что удаляемые поля исключаются из вывода, а не включаются в него (поведение по умолчанию).

Результат:

<img src="https://habrastorage.org/webt/nn/v9/9d/nnv99dbpvj5wu2u5eslvfddpjio.png" />
<br />

### Фильтрация

Для фильтрации полей используется глагол [filter](https://miller.readthedocs.io/en/latest/reference-verbs/#filter). Получим первые 10 (по порядку в файле) серий первого сезона:

```bash
mlr --c2p filter '$seasonNumber == 1' then head ./tv_ratings.csv
```

Результат:

<img src="https://habrastorage.org/webt/0-/rz/tf/0-rztfztjscjrcth_pyekdv6trs.png" />
<br />

### Сортировка

Для сортировки полей используется глагол [sort](https://miller.readthedocs.io/en/latest/reference-verbs/#sort). Получим первые 10 серий с самыми высокими рейтингами:

```bash
mlr --c2p sort -nr av_rating then head ./tv_ratings.csv
```

Здесь:

- `-nr` определяет числовой нисходящий (от большего к меньшему) порядок сортировки (нули сортируются первыми).

Результат:

<img src="https://habrastorage.org/webt/rx/nv/n3/rxnvn32ekmd-hybrtgnh8o-t5ec.png" />
<br />

### Сохранение результата операций

Оператор `>` позволяет выполнять запись результата операций в файл:

```bash
mlr --csv sort -nr av_rating ./tv_ratings.csv > ./sorted_tv_ratings.csv
```

Результат:

<img src="https://habrastorage.org/webt/cx/s2/hh/cxs2hhtejf2ojz14owcooindfb0.png" />
<br />

### Преобразование CSV в JSON

Для преобразования CSV в JSON используется флаг `--c2j`:

```bash
mlr --c2j sort -nr av_rating ./tv_ratings.csv > ./sorted_tv_ratings.json
```

Результат:

<img src="https://habrastorage.org/webt/ui/cd/bo/uicdbokesqguhax2y3oxdqxnr70.png" />
<br />

## Задача

Рассмотрим пример практического использования Miller - получение списка 5 спортсменов, завоевавших наибольшее количество медалей на олимпиаде в Рио-де-Жанейро в 2016 году.

Скачиваем [этот файл в формате CSV](https://raw.githubusercontent.com/flother/rio2016/master/athletes.csv).

Взглянем на него:

```bash
mlr --c2p head ./athletes.csv
```

Результат:

<img src="https://habrastorage.org/webt/wx/9k/c1/wx9kc1njzyrn5pzmix-dszcf6jw.png" />
<br />

Удаляем лишние поля:

```bash
mlr --csv -I cut -x -f id,info,weight,height,date_of_birth ./athletes.csv
```

Здесь:

- `-I` означает, что файл обрабатывается на месте, т.е. сначала создается временный файл, в который записывается результат операций, затем оригинальный файл перезаписывается временным.

_Прим. пер.:_ я не буду перезаписывать оригинальный файл, а запишу результат операции в файл `athletes_formatted.csv` с помощью следующей команды:

```bash
mlr -c cut -x -f id,info,weight,height,date_of_birth ./athletes.csv > ./athletes_formatted.csv
```

Здесь:

- `-c` - это сокращение для `--csv`.

Результат:

<img src="https://habrastorage.org/webt/zd/mh/li/zdmhliqjzcmr2ylft9tvz0gfdtc.png" />
<br />

У нас имеется статистика по количеству золотых, серебряных и бронзовых медалей. Общее количество медалей можно вычислить с помощью глагола [put](https://miller.readthedocs.io/en/latest/reference-verbs/#put) следующим образом:

```bash
mlr --c2p put '$medals=$bronze+$silver+$gold' then head ./athletes_formatted.csv
```

Результат:

<img src="https://habrastorage.org/webt/kk/ma/-r/kkma-rabz3en9_iyemifqjqcjie.png" />
<br />

Сортируем список по количеству медалей от большего с меньшему:

```bash
mlr --c2p put '$medals=$bronze+$silver+$gold' \
then sort -nr medals \
then head ./athletes_formatted.csv
```

Результат:

<img src="https://habrastorage.org/webt/vl/g2/yw/vlg2yw4f5jqmdpxv3h6sebrsrvk.png" />
<br />

Ограничиваем вывод пятью спортсменами с помощью флага `-n`:

```bash
mlr --c2p put '$medals=$bronze+$silver+$gold' \
then sort -nr medals \
then head -n 5 ./athletes_formatted.csv
```

Результат:

<img src="https://habrastorage.org/webt/lz/es/zt/lzesztakos0n6setbxqmvbzz-gw.png" />
<br />

Записываем результат в JSON-файл:

```bash
mlr --c2j put '$medals=$bronze+$silver+$gold' \
then sort -nr medals \
then head -n 5 ./athletes.csv > ./top5_athletes.json
```

Результат:

<img src="https://habrastorage.org/webt/e8/cu/wp/e8cuwp1vnjzxf_zsrjsy_j23kfs.png" />
<br />

Здесь:

- `-j` - это сокращение для `--json`

Что если мы хотим получить пятерку лучших атлетов среди женщин? Проще простого:

```bash
mlr --c2p put '$medals=$bronze+$silver+$gold' \
then sort -nr medals \
then filter '$sex == "female"' \
then head -n 5 ./athletes_formatted.csv
```

Результат:

<img src="https://habrastorage.org/webt/jw/-u/zx/jw-uzxtfztlbkjne0kq4yk-ijao.png" />
<br />

Надеюсь, что вы, как и я, узнали что-то новое и не зря потратили время.

Благодарю за внимание и happy coding!
