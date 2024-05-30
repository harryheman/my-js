---
sidebar_position: 20
title: Книга рецептов Rust
description: Книга рецептов Rust
keywords: [rust]
tags: [rust]
---

# Rust Cookbook

Hello world!

[Книга рецептов](https://rust-lang-nursery.github.io/rust-cookbook/) - это коллекция простых примеров, демонстрирующих хорошие практики решения распространенных задач программирования с помощью крейтов экосистемы `Rust`.

_Обратите внимание_: для запуска примеров вам потребуется примерно такой файл `Cargo.toml` (версии крейтов могут отличаться):

```toml
[package]
name = "rust_cookbook"
version = "0.1.0"
edition = "2021"

[dependencies]
chrono = "0.4.31"
crossbeam = "0.8.3"
crossbeam-channel = "0.5.10"
csv = "1.3.0"
env_logger = "0.11.3"
error-chain = "0.12.4"
glob = "0.3.1"
image = "0.25.0"
lazy_static = "1.4.0"
log = "0.4.20"
mime = "0.3.17"
num = "0.4.1"
num_cpus = "1.16.0"
postgres = "0.19.7"
rand = "0.8.5"
rayon = "1.8.0"
regex = "1.10.2"
reqwest = {version = "0.11.23", features = ["blocking", "json"]}
same-file = "1.0.6"
select = "0.6.0"
serde = {version = "1.0.193", features = ["derive"]}
serde_json = "1.0.110"
threadpool = "1.8.1"
tokio = { version = "1.35.1", features = ["full"] }
unicode-segmentation = "1.10.1"
url = "2.5.0"
walkdir = "2.4.0"
dotenv = "0.15.0"
tempfile = "3.9.0"
data-encoding = "2.5.0"
ring = "0.17.7"
clap = "4.5.2"
ansi_term = "0.12.1"
flate2 = "1.0.28"
tar = "0.4.40"
semver = "1.0.22"
percent-encoding = "2.3.1"
base64 = "0.22.0"
toml = "0.8.12"
memmap = "0.7.0"

[dependencies.rusqlite]
version = "0.31.0"
features = ["bundled"]
```

Также _обратите внимание_, что некоторые примеры работают только на Linux.

## 1. Алгоритмы

### 1.1. Генерация произвольных значений

__Генерация произвольных чисел__

Генерация произвольных чисел выполняется с помощью метода [rand::thread_rng](https://docs.rs/rand/*/rand/fn.thread_rng.html) генератора [rand::Rng](https://docs.rs/rand/*/rand/trait.Rng.html). Генератор создается отдельно для каждого потока (thread). Целые числа равномерно распределяются (uniform distribution) по диапазону типа, числа с плавающей запятой/точкой равномерно распределяются от 0 до, но не включая 1.

```rust
use rand::Rng;

fn main() {
    let mut rng = rand::thread_rng();

    let n1: u8 = rng.gen();
    let n2: u16 = rng.gen();
    println!("Произвольное u8: {}", n1);
    println!("Произвольное u16: {}", n2);
    println!("Произвольное u32: {}", rng.gen::<u32>());
    println!("Произвольное i32: {}", rng.gen::<i32>());
    println!("Произвольное число с плавающей точкой: {}", rng.gen::<f64>());
}
```

__Генерация произвольных чисел в заданном диапазоне__

Пример генерации произвольного числа в диапазоне `[0, 10)` (не включая `10`) с помощью метода [Rng::gen_range](https://doc.rust-lang.org/rand/*/rand/trait.Rng.html#method.gen_range):

```rust
use rand::Rng;

fn main() {
    let mut rng = rand::thread_rng();
    println!("Целое число: {}", rng.gen_range(0..10));
    println!("Число с плавающей точкой: {}", rng.gen_range(0.0..10.0));
}
```

Структура [Uniform](https://docs.rs/rand/*/rand/distributions/uniform/struct.Uniform.html) позволяет генерировать равномерно распределенные значения. Результат такой же, но операция может выполняться быстрее при повторной генерации чисел в аналогичном диапазоне.

```rust
use rand::distributions::{Distribution, Uniform};

fn main() {
    let mut rng = rand::thread_rng();
    let die = Uniform::from(1..7);

    loop {
        let throw = die.sample(&mut rng);
        println!("Результат броска кубика: {}", throw);
        if throw == 6 {
            break;
        }
    }
}
```

__Генерация произвольных чисел с заданным распределением__

По умолчанию произвольные числа в крейте `rand` имеют равномерное распределение (uniform distribution). Крейт [rand_distr](https://docs.rs/rand_distr/*/rand_distr/index.html) предоставляет другие виды распределения. Сначала создается экземпляр распределения, затем - образец распределения с помощью метода [Distribution::sample](https://docs.rs/rand/*/rand/distributions/trait.Distribution.html#tymethod.sample), которому передается генератор [rand::Rang](https://docs.rs/rand/*/rand/trait.Rng.html).

[Список доступных распределений](https://docs.rs/rand_distr/*/rand_distr/index.html).

Пример использования нормального распределения:

```rust
use rand_distr::{Distribution, Normal, NormalError};
use rand::thread_rng;

fn main() -> Result<(), NormalError> {
    let mut rng = thread_rng();
    let normal = Normal::new(2.0, 3.0)?;
    let v = normal.sample(&mut rng);
    println!("{} из N(2, 9) распределения", v);
    Ok(())
}
```

__Генерация произвольных значений кастомного типа__

Пример произвольной генерации кортежа `(i32, bool, f64)` и переменной пользовательского типа `Point`. Для произвольной генерации на типе `Point` реализуется трейт [Distribution](https://docs.rs/rand/*/rand/distributions/trait.Distribution.html) для структуры [Standard](https://docs.rs/rand/*/rand/distributions/struct.Standard.html).

```rust
use rand::Rng;
use rand::distributions::{Distribution, Standard};

#[derive(Debug)]
struct Point {
    x: i32,
    y: i32,
}

impl Distribution<Point> for Standard {
    fn sample<R: Rng + ?Sized>(&self, rng: &mut R) -> Point {
        let (rand_x, rand_y) = rng.gen();

        Point {
            x: rand_x,
            y: rand_y,
        }
    }
}

fn main() {
    let mut rng = rand::thread_rng();
    let rand_tuple = rng.gen::<(i32, bool, f64)>();
    let rand_point: Point = rng.gen();
    println!("Произвольный кортеж: {:?}", rand_tuple);
    println!("Произвольная структура Point: {:?}", rand_point);
}
```

__Генерация произвольного пароля из набора букв и чисел__

Пример генерации строки заданной длины, состоящей из символов `ASCII` в диапазоне `A-Z, a-z, 0-9`, с помощью образца [Alphanumeric](https://docs.rs/rand/*/rand/distributions/struct.Alphanumeric.html):

```rust
use rand::{thread_rng, Rng};
use rand::distributions::Alphanumeric;

fn main() {
    let rand_string: String = thread_rng()
        .sample_iter(&Alphanumeric)
        .take(30)
        .map(char::from)
        .collect();

    println!("{}", rand_string);
}
```

__Генерация произвольного пароля из набора пользовательских символов__

Пример генерации строки заданной длины, состоящей из символов `ASCII` кастомной пользовательской байтовой строкой, с помощью метода [Rng::gen_range](https://docs.rs/rand/*/rand/trait.Rng.html#method.gen_range):

```rust
fn main() {
    use rand::Rng;
    // Набор пользовательских символов
    const CHARSET: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZ\
                            abcdefghijklmnopqrstuvwxyz\
                            0123456789)(*&^%$#@!~";
    const PASSWORD_LEN: usize = 30;
    let mut rng = rand::thread_rng();

    let password: String = (0..PASSWORD_LEN)
        .map(|_| {
            let idx = rng.gen_range(0..CHARSET.len());
            CHARSET[idx] as char
        })
        .collect();

    println!("{:?}", password);
}
```

Несколько утилит, которые могут оказаться полезными:

```rust
use rand::distributions::{
    uniform::{SampleRange, SampleUniform},
    Distribution,
    Standard,
};
use rand::Rng;

/// Генерирует произвольное число указанного типа
pub fn generate_random_number<T>() -> T
where
    Standard: Distribution<T>,
{
    let mut rng = rand::thread_rng();
    rng.gen::<T>()
}

/// Генерирует произвольное число в указанном диапазоне
pub fn generate_random_number_in_range<T, R>(range: R) -> T
where
    T: SampleUniform,
    R: SampleRange<T>,
{
    let mut rng = rand::thread_rng();
    rng.gen_range(range)
}

#[derive(Debug)]
pub struct Point {
    pub x: i32,
    pub y: i32,
}

impl Distribution<Point> for Standard {
    fn sample<R: Rng + ?Sized>(&self, rng: &mut R) -> Point {
        let (rand_x, rand_y) = rng.gen();
        Point {
            x: rand_x,
            y: rand_y,
        }
    }
}

/// Генерирует произвольную структуру `Point`
pub fn generate_random_point() -> Point {
    let mut rng = rand::thread_rng();
    rng.gen()
}

const CHARSET: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZ\
                            abcdefghijklmnopqrstuvwxyz\
                            0123456789)(*&^%$#@!~";

// Генерирует произвольную строку
pub fn generate_random_string(length: u8) -> String {
    let mut rng = rand::thread_rng();
    let len = CHARSET.len();

    (0..length)
        .map(|_| {
            let i = rng.gen_range(0..len);
            CHARSET[i] as char
        })
        .collect()
}

/// Генерирует произвольный вектор
pub fn generate_random_vector<T>(n: usize) -> Vec<T>
where
    Standard: Distribution<T>,
{
    let mut numbers = Vec::new();
    for _ in 0..n {
        numbers.push(generate_random_number());
    }
    numbers
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_generate_random_number() {
        let n1 = generate_random_number::<i8>();
        assert!(n1 >= -128 && n1 < 127);
        let n2 = generate_random_number::<u16>();
        assert!(n2 > 0);
    }

    #[test]
    fn test_generate_random_number_range() {
        let n1 = generate_random_number_range(0..10);
        assert!(n1 >= 0 && n1 < 10);
        let n2 = generate_random_number_range(10..=20);
        assert!(n2 > 0 && n2 <= 20);
    }

    #[test]
    fn test_generate_random_point() {
        let rand_point: Point = generate_random_point();
        assert!(
            rand_point.x >= -2_147_483_648
                && rand_point.x < 2_147_483_647
                && rand_point.y >= -2_147_483_648
                && rand_point.y < 2_147_483_647
        );
    }

    #[test]
    fn test_generate_random_string() {
        let rand_string = generate_random_string(10);
        assert!(rand_string.len() == 10 && rand_string.is_ascii());
    }

    #[test]
    fn test_generate_random_vec() {
        let rand_vec = generate_random_vector::<u16>(10);
        assert!(rand_vec.len() == 10);
    }
}
```

### 1.2. Сортировка векторов

__Сортировка вектора целых чисел__

Пример сортировки вектора целых чисел с помощью метода [vec::sort](https://doc.rust-lang.org/std/vec/struct.Vec.html#method.sort). Метод [vec::sort_unstable](https://doc.rust-lang.org/std/vec/struct.Vec.html#method.sort_unstable) может быть быстрее, но не гарантирует порядок одинаковых элементов.

```rust
fn main() {
    let mut vec = vec![1, 5, 10, 2, 15];

    vec.sort();

    assert_eq!(vec, vec![1, 2, 5, 10, 15]);
}
```

__Сортировка вектора чисел с плавающей точкой__

Вектор чисел с плавающей точкой может быть отсортирован с помощью методов [vec::sort_by](https://doc.rust-lang.org/std/primitive.slice.html#method.sort_by) и [PartialOrd::partial_cmp](https://doc.rust-lang.org/std/cmp/trait.PartialOrd.html#tymethod.partial_cmp):

```rust
fn main() {
    let mut vec = vec![1.1, 1.15, 5.5, 1.123, 2.0];

    vec.sort_by(|a, b| a.partial_cmp(b).unwrap());

    assert_eq!(vec, vec![1.1, 1.123, 1.15, 2.0, 5.5]);
}
```

__Сортировка вектора структур__

Пример сортировки вектора структур `Person` со свойствами `name` и `age` в естественном порядке (по имени и возрасту). Для того, чтобы сделать `Person` сортируемой, требуется реализация четырех трейтов: [Eq](https://doc.rust-lang.org/std/cmp/trait.Eq.html), [PartialEq](https://doc.rust-lang.org/std/cmp/trait.PartialEq.html), [Ord](https://doc.rust-lang.org/std/cmp/trait.Ord.html) и [PartialOrd](https://doc.rust-lang.org/std/cmp/trait.PartialOrd.html). Эти трейты могут быть реализованы автоматически (derived). Для сортировки только по возрасту с помощью метода [vec::sort_by](https://doc.rust-lang.org/std/vec/struct.Vec.html#method.sort_by) необходимо реализовать кастомную функцию сравнения.

```rust
#[derive(Debug, Eq, Ord, PartialEq, PartialOrd)]
struct Person {
    name: String,
    age: u32
}

impl Person {
    pub fn new(name: String, age: u32) -> Self {
        Person {
            name,
            age
        }
    }
}

fn main() {
    let mut people = vec![
        Person::new("Zoe".to_string(), 25),
        Person::new("Al".to_string(), 60),
        Person::new("John".to_string(), 1),
    ];

    // Сортируем людей в естественном порядке (по имени и возрасту)
    people.sort();

    assert_eq!(
        people,
        vec![
            Person::new("Al".to_string(), 60),
            Person::new("John".to_string(), 1),
            Person::new("Zoe".to_string(), 25),
        ]);

    // Сортируем людей по возрасту
    people.sort_by(|a, b| b.age.cmp(&a.age));

    assert_eq!(
        people,
        vec![
            Person::new("Al".to_string(), 60),
            Person::new("Zoe".to_string(), 25),
            Person::new("John".to_string(), 1),
        ]);

}
```

Несколько утилит, которые могут оказаться полезными:

```rust
/// Сортирует целые числа
pub fn sort_integers<T: std::cmp::Ord>(numbers: &mut Vec<T>) {
    numbers.sort();
}

/// Сортирует числа с плавающей точкой
pub fn sort_floats<T: std::cmp::PartialOrd>(numbers: &mut Vec<T>) {
    numbers.sort_by(|a, b| a.partial_cmp(b).unwrap());
}

/// Сортирует по полю
pub fn sort_by_field<T, F>(vector: &mut Vec<T>, compare: F)
where
    F: FnMut(&T, &T) -> core::cmp::Ordering,
{
    vector.sort_by(compare)
}

#[derive(Debug, Eq, Ord, PartialEq, PartialOrd)]
pub struct Person {
    pub name: String,
    pub age: u32,
}

impl Person {
    pub fn new(name: String, age: u32) -> Self {
        Person { name, age }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sort_integers() {
        let mut numbers = vec![3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5];
        sort_integers(&mut numbers);
        assert_eq!(numbers, vec![1, 1, 2, 3, 3, 4, 5, 5, 5, 6, 9]);
    }

    #[test]
    fn test_sort_floats() {
        let mut numbers = vec![3.0, 1.0, 4.0, 1.0, 5.0, 9.0, 2.0, 6.0, 5.0, 3.0, 5.0];
        sort_floats(&mut numbers);
        assert_eq!(
            numbers,
            vec![1.0, 1.0, 2.0, 3.0, 3.0, 4.0, 5.0, 5.0, 5.0, 6.0, 9.0]
        );
    }

    #[test]
    fn test_sort_persons() {
        let mut people = vec![
            Person::new("Zoe".to_string(), 25),
            Person::new("Al".to_string(), 60),
            Person::new("John".to_string(), 1),
        ];
        sort_integers(&mut people);
        assert_eq!(
            people,
            vec![
                Person::new("Al".to_string(), 60),
                Person::new("John".to_string(), 1),
                Person::new("Zoe".to_string(), 25),
            ]
        )
    }

    #[test]
    fn test_sort_by_field() {
        let mut people = vec![
            Person::new("Zoe".to_string(), 25),
            Person::new("Al".to_string(), 60),
            Person::new("John".to_string(), 1),
        ];
        sort_by_field(&mut people, |a, b| b.age.cmp(&a.age));
        assert_eq!(
            people,
            vec![
                Person::new("Al".to_string(), 60),
                Person::new("Zoe".to_string(), 25),
                Person::new("John".to_string(), 1),
            ]
        )
    }
}
```

## 2. Командная строка

__Разбор аргументов командной строки__

Пример разбора (parsing) аргументов командной строки с помощью крейта [clap](https://docs.rs/clap):

```rust
use clap::{Arg, Command};

fn main() {
    let matches = Command::new("My Test Program")
        .version("0.1.0")
        .author("Harry Heman")
        .about("Command line argument parsing")
        // файл
        .arg(
            Arg::new("file")
                // короткий флаг -f
                .short('f')
                // длинный флаг --file
                .long("file")
                .help("Файл"),
        )
        // число
        .arg(
            Arg::new("num")
                .short('n')
                .long("number")
                .help("Ваше любимое число"),
        )
        .get_matches();

    let myfile = matches.get_one::<String>("file").unwrap();
    println!("Файл: {}", myfile);

    let num_str = matches.get_one::<String>("num");
    match num_str {
        None => println!("Ваше любимое число неизвестно"),
        Some(s) => match s.parse::<i32>() {
            Ok(n) => println!("Ваше любимое число: {}", n),
            Err(_) => println!("Это не число: {}", s),
        },
    }
}
```

Команда для запуска программы:

```bash
cargo run -- -f myfile.txt -n 42
```

Вывод:

```bash
Файл: myfile.txt
Ваше любимое число: 42
```

Большое количество примеров `Rust CLI` можно найти [здесь](https://github.com/kyclark/command-line-rust).

__Терминал ANSI__

Пример использования крейта [ansi_term](https://docs.rs/ansi_term) для управления цветом и форматированием текста в терминале.

`ansi_term` предоставляет две основные структуры: [ANSIString](https://docs.rs/ansi_term/*/ansi_term/type.ANSIString.html) и [Style](https://docs.rs/ansi_term/*/ansi_term/struct.Style.html). `Style` содержит информацию о стилях: цвет, вес текста и др. Существуют также варианты `Colour` (британский вариант `color`), представляющие простые цвета текста. `ANSIString` - это пара из строки и `Style`.

__Печать цветного текста__

```rust
use ansi_term::Colour;

fn main() {
    println!("This is {} in color, {} in color and {} in color",
        Colour::Red.paint("red"),
        Colour::Blue.paint("blue"),
        Colour::Green.paint("green"));
}
```

__Печать жирного текста__

Для более сложной стилизации, чем изменение цвета, необходимо использовать экземпляр `Style`. Он создается с помощью метода [Style::new](https://docs.rs/ansi_term/0.11.0/ansi_term/struct.Style.html#method.new).

```rust
use ansi_term::Style;

fn main() {
    println!("{} and this is not",
        Style::new().bold().paint("This is Bold"));
}
```

__Печать жирного и цветного текста__

`Colour` реализует множество методов, похожих на методы `Style`.

```rust
use ansi_term::Colour;
use ansi_term::Style;

fn main(){
    println!("{}, {} and {}",
        Colour::Yellow.paint("This is colored"),
        Style::new().bold().paint("this is bold"),
        Colour::Yellow.bold().paint("this is bold and colored"));
}
```

## 3. Сжатие

### 3.2. Работа с tarball

__Распаковка tarball__

Пример распаковки ([GzDecoder](https://docs.rs/flate2/*/flate2/read/struct.GzDecoder.html)) и извлечения ([Archive::unpack](https://docs.rs/tar/*/tar/struct.Archive.html#method.unpack)) всех файлов из сжатого tarball `archive.tar.gz`, находящего в текущей рабочей директории:

```rust
use flate2::read::GzDecoder;
use std::fs::File;
use tar::Archive;

fn main() -> Result<(), std::io::Error> {
    // Название архива (путь к нему)
    let path = "archive.tar.gz";
    // Открываем файл (создаем дескриптор файла)
    let tar_gz = File::open(path)?;
    // Создаем экземпляр "распаковщика" архива, передавая в конструктор дескриптор файла
    let tar = GzDecoder::new(tar_gz);
    // Создаем экземпляр дескриптора архива
    let mut archive = Archive::new(tar);
    // Извлекаем файлы из архива в текущую директорию
    archive.unpack(".")?;

    Ok(())
}
```

__Сжатие директории директорию в tarball__

Пример сжатия директории `/var/log` в `archive.tar.gz`.

Создаем [File](https://doc.rust-lang.org/std/fs/struct.File.html), обернутый в [GzEncoder](https://docs.rs/flate2/*/flate2/write/struct.GzEncoder.html) и [tar::Builder](https://docs.rs/tar/*/tar/struct.Builder.html). Рекурсивно помещаем содержимое директории `/var/log` в архив, находящийся в `backup/logs` с помощью [Builder::append_dir_all](https://docs.rs/tar/*/tar/struct.Builder.html#method.append_dir_all). `GzEncoder` отвечает за сжатие данных перед их записью в `archive.tar.gz`.

```rust
use flate2::write::GzEncoder;
use flate2::Compression;
use std::fs::File;

fn main() -> Result<(), std::io::Error> {
    // Создаем дескриптор файла
    let tar_gz = File::create("archive.tar.gz")?;
    // Создаем экземпляр "упаковщика" архива, передавая в конструктор
    // дескриптор файла и метод сжатия
    let enc = GzEncoder::new(tar_gz, Compression::default());
    // Создаем дескриптор архива
    let mut tar = tar::Builder::new(enc);
    // Записываем файлы из директории `backup/logs` в архив `archive.tar.gz` и
    // помещаем его в директорию `/var/log`
    tar.append_dir_all("backup/logs", "/var/log")?;
    Ok(())
}
```

__Распаковка tarball с удалением префикса пути__

Перебираем файлы с помощью метода [Archive::entries](https://docs.rs/tar/*/tar/struct.Archive.html#method.entries). Используем метод [Path::strip_prefix](https://doc.rust-lang.org/std/path/struct.Path.html#method.strip_prefix) для удаления префикса пути (`bundle/logs`). Наконец, извлекаем [tar::Entry](https://docs.rs/tar/*/tar/struct.Entry.html) с помощью метода [Entry::unpack](https://docs.rs/tar/*/tar/struct.Entry.html#method.unpack).

```rust
use error_chain::error_chain;
use std::fs::File;
use std::path::PathBuf;
use flate2::read::GzDecoder;
use tar::Archive;

error_chain! {
  foreign_links {
    Io(std::io::Error);
    StripPrefixError(std::path::StripPrefixError);
  }
}

fn main() -> Result<()> {
    let file = File::open("archive.tar.gz")?;
    let mut archive = Archive::new(GzDecoder::new(file));
    let prefix = "bundle/logs";

    println!("Extracted the following files:");
    archive
        // перебираем файлы
        .entries()?
        .filter_map(|e| e.ok())
        // для каждого файла
        .map(|mut entry| -> Result<PathBuf> {
            // удаляем префикс пути
            let path = entry.path()?.strip_prefix(prefix)?.to_owned();
            // распаковываем
            entry.unpack(&path)?;
            // возвращаем путь
            Ok(path)
        })
        .filter_map(|e| e.ok())
        .for_each(|x| println!("> {}", x.display()));

    Ok(())
}
```

## 4. Параллелизм

### 4.1. Явные потоки

В следующем примере используется крейт [crossbeam](https://docs.rs/crossbeam/), который предоставляет структуры данных и функции для конкурентного (concurrent) и параллельного (parallel) программирования. Метод [Scope::spawn](https://docs.rs/crossbeam/*/crossbeam/thread/struct.Scope.html#method.spawn) создает (выделяет) новый поток с ограниченной областью видимости (scoped thread), который гарантированно завершается до возврата из замыкания, передаваемого в функцию [crossbeam::scope](https://docs.rs/crossbeam/*/crossbeam/fn.scope.html), позволяя безопасно ссылаться на данные из вызывающей функции.

Делим массив пополам и обрабатываем половины в отдельных потоках:

```rust
fn main() {
    let arr = &[1, 25, -4, 10];
    let max = find_max(arr);
    assert_eq!(max, Some(25));
}

fn find_max(arr: &[i32]) -> Option<i32> {
    const THRESHOLD: usize = 2;

    if arr.len() <= THRESHOLD {
        // `iter()` создает итератор массива (тип значения - `Some(&i32)`)
        // `cloned()` - создает новый итератор, клонирующий значения предыдущего итератора
        //  (`&T` преобразуется в `T`, типом значения становится - `Some(i32)`)
        // `max()` - возвращает максимальный элемент итератора
        return arr.iter().cloned().max();
    }

    // Делим массив пополам
    let mid = arr.len() / 2;
    let (left, right) = arr.split_at(mid);

    crossbeam::scope(|s| {
        // Создаем параллельные потоки для обработки левой и правой частей массива
        let thread_l = s.spawn(|_| find_max(left));
        let thread_r = s.spawn(|_| find_max(right));

        // Получаем максимальные значения из потоков
        // `join()` - ожидает завершения потока
        // (заставляет основной поток ждать завершения выделенного потока)
        // и возвращает его результат
        let max_l = thread_l.join().unwrap()?;
        let max_r = thread_r.join().unwrap()?;

        // `max()` сравнивает и возвращает максимальное из двух значений
        Some(max_l.max(max_r))
    })
    .unwrap()
}
```

__Создание параллельного конвейера__

В следующем примере используются крейты [crossbeam](https://docs.rs/crossbeam/) и [crossbeam_channel](https://docs.rs/crossbeam-channel/*/crossbeam_channel/index.html) для создания параллельного конвейера (pipeline). Есть источник данных (`sender`), приемник данных (`receiver`) и данные, которые обрабатываются двумя параллельными рабочими потоками (worker threads, workers) на пути от источника к приемнику.

Мы используем связанные (bounded) каналы с емкостью равной `1`, создаваемые с помощью метода [crossbeam_channel::bounded](https://docs.rs/crossbeam-channel/*/crossbeam_channel/fn.bounded.html). Производитель должен находиться в собственном потоке, поскольку он производит сообщения чаще, чем "воркеры" могут их обработать (они спят в течение 500 мс). Это означает, что производитель блокируется на 500 мс при вызове [crossbeam_channel::Sender::send](https://docs.rs/crossbeam/latest/crossbeam/channel/struct.Sender.html#method.send), пока один из воркеров не обработает данные в канале. Также _обратите внимание_, что данные потребляются любым воркером, который получил их первым, поэтому каждое сообщение доставляется какому-то одному воркеру, а не обоим.

Чтение из каналов через итератор [crossbeam_channel::Receiver::iter](https://docs.rs/crossbeam-channel/*/crossbeam_channel/struct.Receiver.html#method.iter) блокируется в ожидании новых сообщений или закрытия канала. Поскольку каналы были созданы с помощью [crossbeam::scope](https://docs.rs/crossbeam/*/crossbeam/fn.scope.html), они должны закрываться вручную с помощью `drop` во избежание блокировки всей программы циклами `for` воркеров. О вызовах `drop` можно думать как о сигналах того, что сообщений в канале больше не будет.

```rust
use std::thread;
use std::time::Duration;
use crossbeam_channel::bounded;

fn main() {
    let (snd1, rcv1) = bounded(1);
    let (snd2, rcv2) = bounded(1);
    let n_msgs = 4;
    let n_workers = 2;

    crossbeam::scope(|s| {
        // Поток производителя
        s.spawn(|_| {
            for i in 0..n_msgs {
                snd1.send(i).unwrap();
                println!("Source sent {}", i);
            }
            // Закрываем канал - это необходимо для выхода
            // из цикла `for` в воркере
            drop(snd1);
        });

        // Параллельная обработка двумя потоками/воркерами
        for _ in 0..n_workers {
            // Отправляем в приемник, получаем из источника
            let (sendr, recvr) = (snd2.clone(), rcv1.clone());
            // Создаем воркеров в отдельных потоках
            s.spawn(move |_| {
                thread::sleep(Duration::from_millis(500));
                // Получаем сообщения до закрытия канала
                for msg in recvr.iter() {
                    println!("Worker {:?} received {}", thread::current().id(), msg);
                    sendr.send(msg * 2).unwrap();
                }
            });
        }
        // Закрываем канал, иначе приемник никогда не выйдет из цикла `for`
        drop(snd2);

        // Приемник
        for msg in rcv2.iter() {
            println!("Sink received {}", msg);
        }
    }).unwrap();
}
```

__Передача данных между потоками__

Следующий пример демонстрирует использование крейта [crossbeam_channel](https://docs.rs/crossbeam-channel/*/crossbeam_channel/index.html) в схеме "один производитель - один потребитель" (single producer - single consumer, SPSC). Методы [crossbeam::scope](https://docs.rs/crossbeam/*/crossbeam/fn.scope.html) и [Scope::spawn](https://docs.rs/crossbeam/*/crossbeam/fn.scope.html) используются для управления потоком производителя. Данные передаются из одного потока в другой через канал [crossbeam_channel::unbounded](https://docs.rs/crossbeam-channel/*/crossbeam_channel/fn.unbounded.html). Это означает, что количество валидных (пригодных для хранения) сообщений не ограничено. Поток производителя спит 100 мс между сообщениями.

```rust
use std::{thread, time};
use crossbeam_channel::unbounded;

fn main() {
    let (snd, rcv) = unbounded();
    let n_msgs = 5;

    crossbeam::scope(|s| {
        s.spawn(|_| {
            for i in 0..n_msgs {
                snd.send(i).unwrap();
                thread::sleep(time::Duration::from_millis(100));
            }
        });
    }).unwrap();

    for _ in 0..n_msgs {
        let msg = rcv.recv().unwrap();
        println!("{}", msg);
    }
}
```

__Глобальное мутабельное состояние__

Пример создания глобального состояния с помощью крейта [lazy_static](https://docs.rs/lazy_static/). Макрос `lazy_static!` создает доступную глобально `static ref`, мутирование которой требует [Mutex](https://doc.rust-lang.org/std/sync/struct.Mutex.html) (см. также [RwLock](https://doc.rust-lang.org/std/sync/struct.RwLock.html)). Обертка `Mutex` гарантирует, что состояние может быть одновременно доступно только одному потоку, что позволяет избежать гонки за данными. Для чтения или изменения значения, хранящегося в `Mutex`, используется [MutexGuard](https://doc.rust-lang.org/std/sync/struct.MutexGuard.html).

```rust
use error_chain::error_chain;
use lazy_static::lazy_static;
use std::sync::Mutex;

error_chain! {}

lazy_static! {
    static ref FRUIT: Mutex<Vec<String>> = Mutex::new(Vec::new());
}

fn insert(fruit: &str) -> Result<()> {
    let mut db = FRUIT.lock().map_err(|_| "Failed to acquire MutexGuard")?;
    db.push(fruit.to_string());
    Ok(())
}

fn main() -> Result<()> {
    insert("apple")?;
    insert("orange")?;
    insert("peach")?;
    {
        // Блокируем запись новых значений
        let db = FRUIT.lock().map_err(|_| "Failed to acquire MutexGuard")?;

        db.iter()
            .enumerate()
            .for_each(|(i, item)| println!("{}: {}", i, item));
    }
    insert("grape")?;
    Ok(())
}
```

### 4.2. Параллельная обработка данных

__Параллельная модификация элементов массива__

В следующем примере используется [rayon](https://docs.rs/rayon/latest/rayon/) - библиотека `Rust` для параллельной обработки данных. `rayon` предоставляет метод [par_iter_mut](https://docs.rs/rayon/*/rayon/iter/trait.IntoParallelRefMutIterator.html#tymethod.par_iter_mut) для любого параллельно перебираемого типа данных. `par_iter_mut` возвращает подобную итератору цепочку (iterator-like chain), которая потенциально выполняется параллельно.

```rust
use rayon::prelude::*;

fn main() {
    let mut arr = [0, 7, 9, 11];
    arr.par_iter_mut().for_each(|p| *p -= 1);
    println!("{:?}", arr);
}
```

__Параллельный поиск совпадения элемента коллекции с предикатом__

Следующий пример демонстрирует использование методов [rayon::any](https://docs.rs/rayon/*/rayon/iter/trait.ParallelIterator.html#method.any) и [rayon::all](https://docs.rs/rayon/*/rayon/iter/trait.ParallelIterator.html#method.all), которые являются "параллельными" аналогами [std::any](https://doc.rust-lang.org/std/iter/trait.Iterator.html#method.any) и [std::all](https://doc.rust-lang.org/std/iter/trait.Iterator.html#method.all). `rayon::any` параллельно проверяет, совпадает ли какой-нибудь элемент итератора с предикатом и возвращается, как только такой элемент обнаружен. `rayon::all` параллельно проверяет, совпадают ли все элементы итератора с предикатом и возвращается, как только обнаружен несовпадающий элемент.

```rust
use rayon::prelude::*;

fn main() {
    let mut vec = vec![2, 4, 6, 8];

    assert!(!vec.par_iter().any(|n| (*n % 2) != 0));
    assert!(vec.par_iter().all(|n| (*n % 2) == 0));
    assert!(!vec.par_iter().any(|n| *n > 8 ));
    assert!(vec.par_iter().all(|n| *n <= 8 ));

    vec.push(9);

    assert!(vec.par_iter().any(|n| (*n % 2) != 0));
    assert!(!vec.par_iter().all(|n| (*n % 2) == 0));
    assert!(vec.par_iter().any(|n| *n > 8 ));
    assert!(!vec.par_iter().all(|n| *n <= 8 ));
}
```

__Параллельный поиск элемента__

В следующем примере мы используем методы [rayon::find_any](https://docs.rs/rayon/*/rayon/iter/trait.ParallelIterator.html#method.find_any) и [par_iter](https://docs.rs/rayon/*/rayon/iter/trait.IntoParallelRefIterator.html#tymethod.par_iter) для поиска элемента в векторе, который удовлетворяет предикату в замыкании.

`rayon::find_any` возвращает первый элемент, совпавший с предикатом.

_Обратите внимание_, что аргумент в замыкании - это ссылка на ссылку (`&&x`). См. обсуждение этого в [std::find](https://doc.rust-lang.org/std/iter/trait.Iterator.html#method.find).

```rust
use rayon::prelude::*;

fn main() {
    let v = vec![6, 2, 1, 9, 3, 8, 11];

    let f1 = v.par_iter().find_any(|&&x| x == 9);
    let f2 = v.par_iter().find_any(|&&x| x % 2 == 0 && x > 6);
    let f3 = v.par_iter().find_any(|&&x| x > 8);

    assert_eq!(f1, Some(&9));
    assert_eq!(f2, Some(&8));
    assert!(f3 > Some(&8));
}
```

__Параллельная сортировка вектора__

Следующий пример является демонстрацией параллельной сортировки вектора строк.

Создаем вектор пустых строк. Метод `par_iter_mut().for_each` параллельно заполняет вектор произвольными значениями. Хотя существует [несколько вариантов](https://docs.rs/rayon/*/rayon/slice/trait.ParallelSliceMut.html) сортировки перечисляемого типа данных, [par_iter_unstable](https://docs.rs/rayon/*/rayon/slice/trait.ParallelSliceMut.html#method.par_sort_unstable), обычно, быстрее, чем алгоритмы [стабильной сортировки](https://docs.rs/rayon/*/rayon/slice/trait.ParallelSliceMut.html#method.par_sort).

```rust
use rand::distributions::Alphanumeric;
use rand::{thread_rng, Rng};
use rayon::prelude::*;

fn main() {
    let mut vec = vec![String::new(); 100];
    vec.par_iter_mut().for_each(|p| {
        let mut rng = thread_rng();

        *p = (0..5)
            // Заполняем вектор произвольными значениями
            .map(|_| rng.sample(&Alphanumeric))
            .map(char::from)
            .collect()
    });
    vec.par_sort_unstable();
    println!("{:?}", vec);
}
```

__Параллельный map-reduce__

В следующем примере мы используем методы [rayon::filter](https://docs.rs/rayon/*/rayon/iter/trait.ParallelIterator.html#method.filter), [rayon::map](https://docs.rs/rayon/*/rayon/iter/trait.ParallelIterator.html#method.map) и [rayon::reduce](https://docs.rs/rayon/*/rayon/iter/trait.ParallelIterator.html#method.reduce) для вычисления среднего возраста людей (объект `Person`) старше 30 (поле `age`).

`rayon::filter` возвращает элементы коллекции, удовлетворяющие предикату. `rayon::map` выполняет операцию с каждым элементом, создавая новую итерацию. `rayon::reduce` выполняет операцию с результатом предыдущих операций и текущим элементом. Применение метода [rayon::sum](https://docs.rs/rayon/*/rayon/iter/trait.ParallelIterator.html#method.sum) приводит к аналогичному результату.

```rust
use rayon::prelude::*;

struct Person {
    age: u32,
}

fn main() {
    let v: Vec<Person> = vec![
        Person { age: 23 },
        Person { age: 19 },
        Person { age: 42 },
        Person { age: 17 },
        Person { age: 17 },
        Person { age: 31 },
        Person { age: 30 },
    ];

    let num_over_30 = v.par_iter().filter(|&x| x.age > 30).count() as f32;
    let sum_over_30 = v.par_iter()
        .map(|x| x.age)
        .filter(|&x| x > 30)
        .reduce(|| 0, |x, y| x + y);

    let alt_sum_30: u32 = v.par_iter()
        .map(|x| x.age)
        .filter(|&x| x > 30)
        .sum();

    let avg_over_30 = sum_over_30 as f32 / num_over_30;
    let alt_avg_over_30 = alt_sum_30 as f32/ num_over_30;

    // Особенности арифметики чисел с плавающей точкой
    assert!((avg_over_30 - alt_avg_over_30).abs() < std::f32::EPSILON);
    println!("The average age of people older than 30 is {}", avg_over_30);
}
```

__Параллельная генерация миниатюр в формате JPG__

В следующем примере мы генерируем миниатюры для всех файлов `.jpg` в текущей директории и сохраняем их в директории `thumbnails`.

Метод [glob::glob_with](https://docs.rs/glob/*/glob/fn.glob_with.html) ищет файлы `.jpg` в текущей директории. [rayon](https://docs.rs/rayon/1.8.1/rayon) меняет размеры изображений с помощью метода [DynamicImage::resize](https://docs.rs/image/*/image/enum.DynamicImage.html#method.resize). Он делает это параллельно с помощью метода [par_iter](https://docs.rs/rayon/*/rayon/iter/trait.IntoParallelRefIterator.html#tymethod.par_iter).

```rust
use error_chain::error_chain;

use std::fs::create_dir_all;
use std::path::Path;

use error_chain::ChainedError;
use glob::{glob_with, MatchOptions};
use image::{imageops::FilterType, ImageError};
use rayon::prelude::*;

error_chain! {
    foreign_links {
        Image(ImageError);
        Io(std::io::Error);
        Glob(glob::PatternError);
    }
}

fn main() -> Result<()> {
    let options: MatchOptions = Default::default();
    // Находим все файлы JPG в текущей директории
    let files: Vec<_> = glob_with("*.jpg", options)?
        .filter_map(|x| x.ok())
        .collect();

    // Если таких файлов нет
    if files.len() == 0 {
        error_chain::bail!("No .jpg files found in current directory");
    }

    // Создаем директорию назначения
    let thumb_dir = "thumbnails";
    create_dir_all(thumb_dir)?;

    println!("Saving {} thumbnails into '{}'...", files.len(), thumb_dir);

    // Вектор провалов создания миниатюр
    let image_failures: Vec<_> = files
        .par_iter()
        .map(|path| {
            // Создаем миниатюру изображения
            make_thumbnail(path, thumb_dir, 300)
                .map_err(|e| e.chain_err(|| path.display().to_string()))
        })
        .filter_map(|x| x.err())
        .collect();

    image_failures
        .iter()
        .for_each(|x| println!("{}", x.display_chain()));

    println!(
        "{} thumbnails saved successfully",
        files.len() - image_failures.len()
    );
    Ok(())
}

fn make_thumbnail<PA, PB>(original: PA, thumb_dir: PB, longest_edge: u32) -> Result<()>
where
    PA: AsRef<Path>,
    PB: AsRef<Path>,
{
    // Дескриптор изображения
    let img = image::open(original.as_ref())?;
    // Путь к файлу
    let file_path = thumb_dir.as_ref().join(original);

    // Пропорционально меняем размер изображения до 300 пикселей и
    // записываем его в директорию назначения
    Ok(img
        .resize(longest_edge, longest_edge, FilterType::Nearest)
        .save(file_path)?)
}
```

## 5. Криптография

### 5.1. Хеширование

__Вычисление контрольной суммы файла с помощью алгоритма SHA-256__

Записываем данные в файл, затем вычисляем SHA-256 [digest::Digest](https://briansmith.org/rustdoc/ring/digest/struct.Digest.html) содержимого файла с помощью [digest::Context](https://briansmith.org/rustdoc/ring/digest/struct.Context.html):

```rust
use error_chain::error_chain;
use data_encoding::HEXUPPER;
use ring::digest::{Context, Digest, SHA256};
use std::fs::File;
use std::io::{BufReader, Read, Write};

error_chain! {
    foreign_links {
        Io(std::io::Error);
        Decode(data_encoding::DecodeError);
    }
}

/// Создает digest содержимого файла с помощью алгоритма SHA-256
fn sha256_digest<R: Read>(mut reader: R) -> Result<Digest> {
    let mut context = Context::new(&SHA256);
    let mut buffer = [0; 1024];

    loop {
        let count = reader.read(&mut buffer)?;
        if count == 0 {
            break;
        }
        context.update(&buffer[..count]);
    }

    Ok(context.finish())
}

fn main() -> Result<()> {
    let path = "file.txt";

    // Создаем дескриптор файла
    let mut output = File::create(path)?;
    // Записываем данные в файл
    write!(output, "We will generate a digest of this text")?;

    let input = File::open(path)?;
    // Читаем данные из файла
    let reader = BufReader::new(input);
    // Создаем digest
    let digest = sha256_digest(reader)?;

    println!("SHA-256 digest is {}", HEXUPPER.encode(digest.as_ref()));

    Ok(())
}
```

__Подпись и подтверждение сообщения с помощью HMAC digest__

Используем [ring::hmac](https://briansmith.org/rustdoc/ring/hmac/) для создания структуры [hmac::Signature](https://briansmith.org/rustdoc/ring/hmac/struct.Signature.html) из строки, затем проверяем корректность подписи:

```rust
use ring::{hmac, rand};
use ring::rand::SecureRandom;
use ring::error::Unspecified;

fn main() -> Result<(), Unspecified> {
    let mut key_value = [0u8; 48];
    let rng = rand::SystemRandom::new();
    rng.fill(&mut key_value)?;
    let key = hmac::Key::new(hmac::HMAC_SHA256, &key_value);

    let message = "Legitimate important message";
    // Подписываем строку
    let signature = hmac::sign(&key, message.as_bytes());
    // Проверяем корректность подписи
    hmac::verify(&key, message.as_bytes(), signature.as_ref())?;

    Ok(())
}
```

### 5.2. Шифрование

__Соление и хеширование пароля с помощью PBKDF2__

Используем [ring::pbkdf2](https://briansmith.org/rustdoc/ring/pbkdf2/index.html) для хеширования "засоленного" (salted) пароля с помощью функции получения ключа [pbkdf2::derive](https://briansmith.org/rustdoc/ring/pbkdf2/fn.derive.html). Проверяем корректность хеша с помощью метода [pbkdf2::verify](https://briansmith.org/rustdoc/ring/pbkdf2/fn.verify.html). Соль генерируется с помощью функции [SecureRandom::fill](https://briansmith.org/rustdoc/ring/rand/trait.SecureRandom.html#tymethod.fill), которая заполняет массив байтов соли безопасно сгенерированными числами.

```rust
use data_encoding::HEXUPPER;
use ring::error::Unspecified;
use ring::rand::SecureRandom;
use ring::{digest, pbkdf2, rand};
use std::num::NonZeroU32;

fn main() -> Result<(), Unspecified> {
    const CREDENTIAL_LEN: usize = digest::SHA512_OUTPUT_LEN;
    let n_iter = NonZeroU32::new(100_000).unwrap();
    let rng = rand::SystemRandom::new();

    let mut salt = [0u8; CREDENTIAL_LEN];
    rng.fill(&mut salt)?;

    let password = "Guess Me If You Can!";
    let mut pbkdf2_hash = [0u8; CREDENTIAL_LEN];
    // Хешируем пароль
    pbkdf2::derive(
        pbkdf2::PBKDF2_HMAC_SHA512,
        n_iter,
        &salt,
        password.as_bytes(),
        &mut pbkdf2_hash,
    );
    println!("Salt: {}", HEXUPPER.encode(&salt));
    println!("PBKDF2 hash: {}", HEXUPPER.encode(&pbkdf2_hash));
    // Проверяем корректность хеша
    let should_succeed = pbkdf2::verify(
        pbkdf2::PBKDF2_HMAC_SHA512,
        n_iter,
        &salt,
        password.as_bytes(),
        &pbkdf2_hash,
    );
    let wrong_password = "Definitely not the correct password";
    let should_fail = pbkdf2::verify(
        pbkdf2::PBKDF2_HMAC_SHA512,
        n_iter,
        &salt,
        wrong_password.as_bytes(),
        &pbkdf2_hash,
    );

    assert!(should_succeed.is_ok());
    assert!(!should_fail.is_ok());

    Ok(())
}
```

## 7. База данных

### 7.1. SQLite

__Создание БД SQLite__

Пример использования крейта [rusqlite](https://docs.rs/rusqlite/latest/rusqlite/) для подключения/создания БД `SQLite`. При возникновении проблем с компиляцией кода в `Windows`, ищите решение [здесь](https://github.com/jgallagher/rusqlite#user-content-notes-on-building-rusqlite-and-libsqlite3-sys).

Метод [Connection::open](https://docs.rs/rusqlite/*/rusqlite/struct.Connection.html#method.open) создает БД при отсутствии.

```rust
use rusqlite::{Connection, Result};

fn main() -> Result<()> {
    // Подключаемся к/создаем БД `cats`
    let conn = Connection::open("cats.sqlite")?;

    // Создаем таблицу `cat_colors`
    conn.execute(
        "create table if not exists cat_colors (
             id integer primary key,
             name text not null unique
         )",
        (),
    )?;
    // Создаем таблицу `cats`
    conn.execute(
        "create table if not exists cats (
             id integer primary key,
             name text not null,
             color_id integer not null references cat_colors(id)
         )",
        (),
    )?;

    Ok(())
}
```

__Добавление и извлечение данных__

Метод [Connection::open](https://docs.rs/rusqlite/*/rusqlite/struct.Connection.html#method.open) открывает БД `cats`, созданную в предыдущем примере. Метод [Connection::execute](https://docs.rs/rusqlite/*/rusqlite/struct.Connection.html#method.execute) добавляет данные в таблицы `cat_colors` и `cats`. После добавления записи о цвете, метод [Connection::last_insert_rowid](https://docs.rs/rusqlite/*/rusqlite/struct.Connection.html#method.last_insert_rowid) используется для получения `id` последней добавленной записи. Этот `id` используется для добавления записи в таблицу `cats`. Затем с помощью метода [prepare](https://docs.rs/rusqlite/*/rusqlite/struct.Connection.html#method.prepare) готовится запрос выборки данных (select query). `prepare` возвращает структуру [Statement](https://docs.rs/rusqlite/*/rusqlite/struct.Statement.html). Выборка выполняется с помощью метода [Statement::query_map](https://docs.rs/rusqlite/*/rusqlite/struct.Statement.html#method.query_map).

```rust
use rusqlite::{Connection, Result};
use std::collections::HashMap;

#[derive(Debug)]
struct Cat {
    name: String,
    color: String,
}

fn main() -> Result<()> {
    // Подключаемся к БД `cats`
    let conn = Connection::open("cats.sqlite")?;

    let mut cat_colors = HashMap::new();
    cat_colors.insert(String::from("Blue"), vec!["Tigger", "Sammy"]);
    cat_colors.insert(String::from("Black"), vec!["Oreo", "Biscuit"]);

    // Перебираем записи карты
    for (color, catnames) in &cat_colors {
        // Записываем данные в таблицу `cat_colors`
        conn.execute(
            "INSERT INTO cat_colors (name) values (?1)",
            &[&color.to_string()],
        )?;
        let last_id: String = conn.last_insert_rowid().to_string();

        // Перебираем имена кошек
        for cat in catnames {
            // Записываем данные в таблицу `cats`
            conn.execute(
                "INSERT INTO cats (name, color_id) values (?1, ?2)",
                &[&cat.to_string(), &last_id],
            )?;
        }
    }
    // Запрос выборки данных
    let mut stmt = conn.prepare(
        "SELECT c.name, cc.name from cats c
         INNER JOIN cat_colors cc
         ON cc.id = c.color_id;",
    )?;
    // Извлекаем данные
    let cats = stmt.query_map((), |row| {
        Ok(Cat {
            name: row.get(0)?,
            color: row.get(1)?,
        })
    })?;

    for cat in cats {
        println!("Found cat {:?}", cat);
    }

    Ok(())
}
```

__Использование транзакций__

Метод [Connection::open](https://docs.rs/rusqlite/*/rusqlite/struct.Connection.html#method.open) выполняет подключение к БД `cats`.

Метод [Connection::transaction](https://docs.rs/rusqlite/*/rusqlite/struct.Connection.html#method.transaction) запускает транзакцию. Транзакции откатываются, если не фиксируются явно с помощью метода [Transaction::commit](https://docs.rs/rusqlite/*/rusqlite/struct.Transaction.html#method.commit).

В следующем примере цвета добавляются в таблицу, которая имеет уникальное ограничение на название цвета. При попытке добавить дублирующийся цвет транзакция откатывается (roll back).

_Обратите внимание_, что для корректной работы примера необходимо заново создать БД `cats`.

```rust
use rusqlite::{Connection, Result};

#[derive(Debug)]
struct Cat {
    name: String,
    color: String,
}

fn main() -> Result<()> {
    // Подключаемся к БД `cats`
    let mut conn = Connection::open("cats.sqlite")?;
    // Выполняем успешную транзакцию
    successful_tx(&mut conn)?;
    // Выполняем "откатывающуюся" транзакцию
    let res = rolled_back_tx(&mut conn);
    assert!(res.is_err());

    Ok(())
}

// Успешная транзакция
fn successful_tx(conn: &mut Connection) -> Result<()> {
    let tx = conn.transaction()?;

    tx.execute("delete from cat_colors", ())?;
    tx.execute("insert into cat_colors (name) values (?1)", &[&"lavender"])?;
    tx.execute("insert into cat_colors (name) values (?1)", &[&"blue"])?;

    tx.commit()
}
// Откатывающаяся транзакция
fn rolled_back_tx(conn: &mut Connection) -> Result<()> {
    let tx = conn.transaction()?;

    tx.execute("delete from cat_colors", ())?;
    tx.execute("insert into cat_colors (name) values (?1)", &[&"lavender"])?;
    tx.execute("insert into cat_colors (name) values (?1)", &[&"blue"])?;
    // Попытка добавить дубликат приводит к ошибке и откату транзакции
    tx.execute("insert into cat_colors (name) values (?1)", &[&"lavender"])?;

    tx.commit()
}
```

### 7.2. Postgres

__Создание таблицы__

Для работы с БД `PostgreSQL` используется крейт [postgres](https://docs.rs/postgres/0.17.2/postgres/).

Метод [Client::connect](https://docs.rs/postgres/0.17.2/postgres/struct.Client.html#method.connect) используется для подключения к существующей БД. В следующем примере для подключения к БД используется URL БД в виде строки. Предполагается наличие БД `library`, для доступа к которой используются имя пользователя `postgres` и пароль `postgres`.

```rust
use postgres::{Client, NoTls, Error};

fn main() -> Result<(), Error> {
    // Подключаемся к БД `library`
    let mut client = Client::connect("postgresql://postgres:postgres@localhost/library", NoTls)?;

    // Создаем таблицу `author`
    client.batch_execute("
        CREATE TABLE IF NOT EXISTS author (
            id              SERIAL PRIMARY KEY,
            name            VARCHAR NOT NULL,
            country         VARCHAR NOT NULL
            )
    ")?;
    // Создаем таблицу `book`
    client.batch_execute("
        CREATE TABLE IF NOT EXISTS book  (
            id              SERIAL PRIMARY KEY,
            title           VARCHAR NOT NULL,
            author_id       INTEGER NOT NULL REFERENCES author
            )
    ")?;

    Ok(())
}
```

__Добавление и извлечение данных__

Для добавления данных в таблицу используется метод [Client::execute](https://docs.rs/postgres/0.17.2/postgres/struct.Client.html#method.execute). Для извлечения данных - метод [Client::query](https://docs.rs/postgres/0.17.2/postgres/struct.Client.html#method.query):

```rust
use postgres::{Client, Error, NoTls};
use std::collections::HashMap;

struct Author {
    _id: i32,
    name: String,
    country: String,
}

fn main() -> Result<(), Error> {
    // Подключаемся к БД `library`
    let mut client = Client::connect("postgresql://postgres:postgres@localhost/library", NoTls)?;

    let mut authors = HashMap::new();
    authors.insert(String::from("Chinua Achebe"), "Nigeria");
    authors.insert(String::from("Rabindranath Tagore"), "India");
    authors.insert(String::from("Anita Nair"), "India");
    // Очищаем таблицу `author`
    client.execute("DELETE FROM author", &[])?;
    // Перебираем записи карты авторов
    for (key, value) in &authors {
        let author = Author {
            _id: 0,
            name: key.to_string(),
            country: value.to_string(),
        };
        // Добавляем данные в таблицу `author`
        client.execute(
            "INSERT INTO author (name, country) VALUES ($1, $2)",
            &[&author.name, &author.country],
        )?;
    }

    // Перебираем сущности выборки данных
    for row in client.query("SELECT id, name, country FROM author", &[])? {
        let author = Author {
            _id: row.get(0),
            name: row.get(1),
            country: row.get(2),
        };
        println!("Author {} is from {}", author.name, author.country);
    }

    Ok(())
}
```

## 8. Дата и время

### 8.1. Продолжительность и вычисление даты и времени

__Измерение прошедшего времени__

Пример измерения [time::Instant::elapsed](https://doc.rust-lang.org/std/time/struct.Instant.html#method.elapsed), прошедшего с [time::Instant::now](https://doc.rust-lang.org/std/time/struct.Instant.html#method.now).

Метод `time::Instant::elapsed` возвращает [time::Duration](https://doc.rust-lang.org/std/time/struct.Duration.html). Вызов этого метода не меняет и не сбрасывает объект [time::Instant](https://doc.rust-lang.org/std/time/struct.Instant.html).

```rust
use std::time::{Duration, Instant};
use std::thread;

// "Дорогая" с точки зрения вычислений функция
fn expensive_function() {
    // Искусственная задержка в 1 сек
    thread::sleep(Duration::from_secs(1));
}

fn main() {
    let start = Instant::now();
    expensive_function();
    // Измеряем продолжительность выполнения функции
    let duration = start.elapsed();

    println!("Time elapsed in expensive_function() is: {:?}", duration);
}
```

__Вычисление даты и времени__

Пример вычисления даты и времени через две недели от текущих с помощью [DateTime::checked_add_signed](https://docs.rs/chrono/*/chrono/struct.Date.html#method.checked_add_signed) и даты предшествующего дня с помощью [DateTime::checked_sub_signed](https://docs.rs/chrono/*/chrono/struct.Date.html#method.checked_sub_signed). Эти методы возвращают `None`, если дата и время не могут быть вычислены.

Escape-последовательности, доступные для [DateTime::format](https://docs.rs/chrono/*/chrono/struct.DateTime.html#method.format), можно найти в [Chronic::format::strftime](https://docs.rs/chrono/*/chrono/format/strftime/index.html).

```rust
use chrono::{DateTime, Duration, Utc};

// Функция вычисления даты предшествующего дня
fn day_earlier(date_time: DateTime<Utc>) -> Option<DateTime<Utc>> {
    date_time.checked_sub_signed(Duration::days(1))
}

fn main() {
    let now = Utc::now();
    println!("{}", now);

    // Добавляем 2 недели
    let almost_three_weeks_from_now = now.checked_add_signed(Duration::weeks(2))
            // добавляем неделю
            .and_then(|in_2weeks| in_2weeks.checked_add_signed(Duration::weeks(1)))
            // вычитаем день
            .and_then(day_earlier);

    match almost_three_weeks_from_now {
        Some(x) => println!("{}", x),
        None => eprintln!("Almost three weeks from now overflows!"),
    }

    // Пытаемся добавить к текущей дате максимальную продолжительность
    match now.checked_add_signed(Duration::max_value()) {
        Some(x) => println!("{}", x),
        None => eprintln!("We can't use chrono to tell the time for the Solar System to complete more than one full orbit around the galactic center."),
    }
}
```

__Преобразование локального времени в другую временную зону__

Пример получения локального времени с помощью [offset::Local::now](https://docs.rs/chrono/*/chrono/offset/struct.Local.html#method.now) и его преобразование в `UTC` с помощью [DateTime::from_utc](https://docs.rs/chrono/*/chrono/struct.DateTime.html#method.from_utc). Затем `UTC-время` преобразуется в `UTC+8` и `UTC-2` с помощью [offset:FixedOffset](https://docs.rs/chrono/*/chrono/offset/struct.FixedOffset.html).

```rust
use chrono::{DateTime, FixedOffset, Local, Utc};

fn main() {
    // Локальное время
    let local_time = Local::now();
    // Время в формате UTC
    let utc_time = DateTime::<Utc>::from_utc(local_time.naive_utc(), Utc);
    // Время UTC+8
    let china_timezone = FixedOffset::east(8 * 3600);
    // Время UTC-2
    let rio_timezone = FixedOffset::west(2 * 3600);
    println!("Local time now is {}", local_time);
    println!("UTC time now is {}", utc_time);
    println!(
        "Time in Hong Kong now is {}",
        utc_time.with_timezone(&china_timezone)
    );
    println!("Time in Rio de Janeiro now is {}", utc_time.with_timezone(&rio_timezone));
}
```

### 8.2. Разбор и отображение даты и времени

__Получение даты и времени__

Пример получения текущего [DateTime](https://docs.rs/chrono/*/chrono/struct.DateTime.html) в формате UTC, его часов/минут/секунд через [Timelike](https://docs.rs/chrono/*/chrono/trait.Timelike.html) и лет/месяцев/дней недели через [Datelike](https://docs.rs/chrono/*/chrono/trait.Datelike.html):

```rust
use chrono::{Datelike, Timelike, Utc};

fn main() {
    let now = Utc::now();

    let (is_pm, hour) = now.hour12();
    println!(
        "The current UTC time is {:02}:{:02}:{:02} {}",
        hour,
        now.minute(),
        now.second(),
        if is_pm { "PM" } else { "AM" }
    );
    // Количество секунд, прошедшее с полуночи
    println!(
        "And there have been {} seconds since midnight",
        now.num_seconds_from_midnight()
    );

    let (is_common_era, year) = now.year_ce();
    println!(
        "The current UTC date is {}-{:02}-{:02} {:?} ({})",
        year,
        now.month(),
        now.day(),
        now.weekday(),
        if is_common_era { "CE" } else { "BCE" }
    );
    // Количество дней, прошедших с начала новой эры
    println!(
        "And the Common Era began {} days ago",
        now.num_days_from_ce()
    );
}
```

__Преобразование даты в метку времени UNIX и наоборот__

Пример преобразования даты из [NaiveDate::from_ymd](https://docs.rs/chrono/*/chrono/naive/struct.NaiveDate.html#method.from_ymd) и [NaiveTime::from_hms](https://docs.rs/chrono/*/chrono/naive/struct.NaiveTime.html#method.from_hms) в [метку времени (timestamp) UNIX](https://en.wikipedia.org/wiki/Unix_time) с помощью [NaiveDateTime::timestamp](https://docs.rs/chrono/*/chrono/naive/struct.NaiveDateTime.html#method.timestamp) и вычисления даты спустя миллиард секунд после `1970-01-01 0:00:00 UTC` с помощью [NaiveDateTime::from_timestamp](https://docs.rs/chrono/*/chrono/naive/struct.NaiveDateTime.html#method.from_timestamp).

```rust
use chrono::{NaiveDate, NaiveDateTime};

fn main() {
    let date_time: NaiveDateTime = NaiveDate::from_ymd(2017, 11, 12).and_hms(17, 33, 44);
    println!(
        "Количество секунд между 1970-01-01 00:00:00 и {} равняется {}.",
        date_time, date_time.timestamp());

    let date_time_after_a_billion_seconds = NaiveDateTime::from_timestamp(1_000_000_000, 0);
    println!(
        "Дата через миллиард секунд после 1970-01-01 00:00:00: {}.",
        date_time_after_a_billion_seconds);
}
```

__Форматирование даты и времени__

Пример получения текущей даты в формате `UTC` с помощью [Utc::now](https://docs.rs/chrono/*/chrono/offset/struct.Utc.html#method.now) и ее форматирование в популярные форматы [RFC 2822](https://www.ietf.org/rfc/rfc2822.txt) с помощью [DateTime::to_rfc2822](https://docs.rs/chrono/*/chrono/struct.DateTime.html#method.to_rfc2822) и [RFC 3339](https://www.ietf.org/rfc/rfc3339.txt) с помощью [DateTime::to_rfc3339](https://docs.rs/chrono/*/chrono/struct.DateTime.html#method.to_rfc3339), а также в кастомный формат с помощью [DateTime::format](https://docs.rs/chrono/*/chrono/struct.DateTime.html#method.format):

```rust
use chrono::{DateTime, Utc};

fn main() {
    let now: DateTime<Utc> = Utc::now();

    println!("UTC now is: {}", now);
    println!("UTC now in RFC 2822 is: {}", now.to_rfc2822());
    println!("UTC now in RFC 3339 is: {}", now.to_rfc3339());
    println!("UTC now in a custom format is: {}", now.format("%a %b %e %T %Y"));
}
```

__Преобразование строки в структуру DateTime__

Пример преобразования строк в структуры [DateTime](https://docs.rs/chrono/*/chrono/struct.DateTime.html), представляющие популярные форматы `RFC 2822`, `RFC 3339` и кастомный формат с помощью [DateTime::parse_from_rfc2822](https://docs.rs/chrono/*/chrono/struct.DateTime.html#method.parse_from_rfc2822), [DateTime::parse_from_rfc3339](https://docs.rs/chrono/*/chrono/struct.DateTime.html#method.parse_from_rfc3339) и [DateTime::parse_from_str](https://docs.rs/chrono/*/chrono/struct.DateTime.html#method.parse_from_str), соответственно.

Escape-последовательности, доступные для [DateTime::parse_from_str](https://docs.rs/chrono/*/chrono/struct.DateTime.html#method.parse_from_str) можно найти в [chrono::format::strftime](https://docs.rs/chrono/*/chrono/format/strftime/index.html). _Обратите внимание_, что [DateTime::parse_from_str](https://docs.rs/chrono/*/chrono/struct.DateTime.html#method.parse_from_str) требует, чтобы создаваемая структура `DateTime` однозначно идентифицировала дату и время. Для разбора даты и времени без часовых поясов используются [NaiveDate](https://docs.rs/chrono/*/chrono/naive/struct.NaiveDate.html), [NaiveTime](https://docs.rs/chrono/*/chrono/naive/struct.NaiveTime.html) и [NaiveDateTime](https://docs.rs/chrono/*/chrono/naive/struct.NaiveDateTime.html).

```rust
use chrono::{DateTime, NaiveDate, NaiveDateTime, NaiveTime};
use chrono::format::ParseError;

fn main() -> Result<(), ParseError> {
    let rfc2822 = DateTime::parse_from_rfc2822("Tue, 1 Jul 2003 10:52:37 +0200")?;
    println!("{}", rfc2822);

    let rfc3339 = DateTime::parse_from_rfc3339("1996-12-19T16:39:57-08:00")?;
    println!("{}", rfc3339);

    let custom = DateTime::parse_from_str("5.8.1994 8:00 am +0000", "%d.%m.%Y %H:%M %P %z")?;
    println!("{}", custom);

    let time_only = NaiveTime::parse_from_str("23:56:04", "%H:%M:%S")?;
    println!("{}", time_only);

    let date_only = NaiveDate::parse_from_str("2015-09-05", "%Y-%m-%d")?;
    println!("{}", date_only);

    let no_timezone = NaiveDateTime::parse_from_str("2015-09-05 23:56:04", "%Y-%m-%d %H:%M:%S")?;
    println!("{}", no_timezone);

    Ok(())
}
```

## 9. Инструменты для разработки

### 9.1. Отладка

__Вывод сообщения об отладке в консоль__

Крейт [log](https://docs.rs/log/0.4.20/log/) предоставляет разные утилиты логирования. Крейт [env_logger](https://docs.rs/env_logger/latest/env_logger/) позволяет настраивать логирование через переменные среды окружения. Макрос [log::debug!](https://docs.rs/log/*/log/macro.debug.html) работает аналогично [std::fmt](https://doc.rust-lang.org/std/fmt/).

```rust
fn execute_query(query: &str) {
    log::debug!("Выполнение запроса: {}", query);
}

fn main() {
    env_logger::init();

    execute_query("DROP TABLE students");
}
```

При запуске этого кода в консоль ничего не выводится, поскольку дефолтным уровнем логирования является `error`, а уровни ниже игнорируются.

Для печати сообщений нужно установить переменную среды окружения `RUST_LOG` в значение `debug`:

```bash
RUST_LOG=debug cargo run
```

__Вывод сообщения об ошибке в консоль__

Пример вывода в консоль сообщения об ошибке с помощью макроса [log::error!](https://docs.rs/log/*/log/macro.error.html):

```rust

fn execute_query(_query: &str) -> Result<(), &'static str> {
    Err("Боюсь, я не могу этого сделать")
}

fn main() {
    env_logger::init();

    let response = execute_query("DROP TABLE students");
    if let Err(err) = response {
        log::error!("Выполнить запрос не удалось: {}", err);
    }
}
```

__Вывод сообщения в stdout вместо stderr__

Пример кастомной настройки логера с помощью [Builder::target](https://docs.rs/env_logger/*/env_logger/struct.Builder.html#method.target) - установка цели вывода сообщения на [Target::Stdout](https://docs.rs/env_logger/*/env_logger/fmt/enum.Target.html):

```rust
use env_logger::{Builder, Target};

fn main() {
    Builder::new()
        .target(Target::Stdout)
        .init();

    log::error!("Эта ошибка выводится в stdout");
}
```

__Вывод сообщения с помощью кастомного логера__

Пример реализации кастомного логера `ConsoleLogger`, который выводит сообщения в stdout. `ConsoleLogger` реализует трейт [log::Log](https://docs.rs/log/*/log/trait.Log.html) для того, чтобы иметь возможность использовать макросы логирования. [log::set_logger](https://docs.rs/log/*/log/fn.set_logger.html) используется для установки `ConsoleLogger`.

```rust
use log::{Record, Level, Metadata, LevelFilter, SetLoggerError};

static CONSOLE_LOGGER: ConsoleLogger = ConsoleLogger;

struct ConsoleLogger;

impl log::Log for ConsoleLogger {
    fn enabled(&self, metadata: &Metadata) -> bool {
        metadata.level() <= Level::Info
    }

    fn log(&self, record: &Record) {
        if self.enabled(record.metadata()) {
            println!("Rust говорит: {} - {}", record.level(), record.args());
        }
    }

    fn flush(&self) {}
}

fn main() -> Result<(), SetLoggerError> {
    log::set_logger(&CONSOLE_LOGGER)?;
    log::set_max_level(LevelFilter::Info);

    log::info!("привет");
    log::warn!("предупреждение");
    log::error!("упс");
    Ok(())
}
```

__Определение уровня логирования для модуля__

Создаем два модуля: `foo` и вложенный `foo::bar`. Определяем уровни логирования для каждого модуля через директивы логирования с помощью переменной среды окружения [RUST_LOG](https://docs.rs/env_logger/*/env_logger/#enabling-logging).

```rust
mod foo {
    mod bar {
        pub fn run() {
            log::warn!("[bar] warn");
            log::info!("[bar] info");
            log::debug!("[bar] debug");
        }
    }

    pub fn run() {
        log::warn!("[foo] warn");
        log::info!("[foo] info");
        log::debug!("[foo] debug");
        bar::run();
    }
}

fn main() {
    env_logger::init();
    log::warn!("[root] warn");
    log::info!("[root] info");
    log::debug!("[root] debug");
    foo::run();
}
```

`RUST_LOG` управляет выводом [env_logger](https://docs.rs/env_logger/). Команда для запуска примера может выглядеть так (предполагается, что проект называется `test`):

```rust
RUST_LOG="warn,test::foo=info,test::foo::bar=debug" ./test
```

Эта команда устанавливает дефолтный [log::level](https://docs.rs/log/*/log/enum.Level.html) в значение `warn`, уровни логирования в модулях `foo` и `foo::bar` в значения `info` и `debug`, соответственно.

Вывод:

```rust
WARN:test: [root] warn
WARN:test::foo: [foo] warn
INFO:test::foo: [foo] info
WARN:test::foo::bar: [bar] warn
INFO:test::foo::bar: [bar] info
DEBUG:test::foo::bar: [bar] debug
```

__Использование кастомной переменной среды окружения для настройки логирования__

Для настройки логирования используется структура [Builder](https://docs.rs/env_logger/*/env_logger/struct.Builder.html).

Метод [Builder::parse](https://docs.rs/env_logger/*/env_logger/struct.Builder.html#method.parse) разбирает переменную среды окружения `MY_APP_LOG` в синтаксис [RUST_LOG](https://docs.rs/env_logger/*/env_logger/#enabling-logging). Затем метод [Builder::init](https://docs.rs/env_logger/*/env_logger/struct.Builder.html#method.init) инициализирует логер. Обычно, все это делается автоматически при вызове метода [env_logger::init](https://docs.rs/env_logger/*/env_logger/fn.init.html).

```rust
use std::env;
use env_logger::Builder;

fn main() {
    Builder::new()
        .parse(&env::var("MY_APP_LOG").unwrap_or_default())
        .init();

    log::info!("информация");
    log::warn!("предупреждение");
    log::error!("сообщение об {}", "ошибке");
}
```

__Добавление метки времени в сообщение об отладке__

Создаем кастомную настройку логера с помощью [Builder](https://docs.rs/env_logger/*/env_logger/struct.Builder.html). Каждая сущность логирования вызывает [Local::now](https://docs.rs/chrono/*/chrono/offset/struct.Local.html#method.now) для получения текущего [DateTime](https://docs.rs/chrono/*/chrono/datetime/struct.DateTime.html) в локальной временной зоне и использует [DateTime::format](https://docs.rs/chrono/*/chrono/struct.DateTime.html#method.format) с [strftime:specifiers](https://docs.rs/chrono/*/chrono/format/strftime/index.html#specifiers) для формирования метки времени, которая используется в финальном выводе.

Метод [Builder::format](https://docs.rs/env_logger/*/env_logger/struct.Builder.html#method.format) вызывается для установки замыкания, которое форматирует каждое сообщение, добавляя в него метку времени, [Record::level](https://docs.rs/log/*/log/struct.Record.html#method.level) и тело ([Record::args](https://docs.rs/log/*/log/struct.Record.html#method.args)).

```rust
use std::io::Write;
use chrono::Local;
use env_logger::Builder;
use log::LevelFilter;

fn main() {
    Builder::new()
        .format(|buf, record| {
            writeln!(buf,
                "{} [{}] - {}",
                Local::now().format("%Y-%m-%dT%H:%M:%S"),
                record.level(),
                record.args()
            )
        })
        .filter(None, LevelFilter::Info)
        .init();

    log::warn!("warn");
    log::info!("info");
    log::debug!("debug");
}
```

### 9.2. Версионирование

__Разбор и увеличение версии__

Создаем структуру [semver::Version](https://docs.rs/semver/*/semver/struct.Version.html) из строкового литерала с помощью метода [Version::parse](https://docs.rs/semver/*/semver/struct.Version.html#method.parse), затем увеличиваем патчевый, минорный и мажорный номера версии один за другим.

```rust
use semver::{BuildMetadata, Error, Prerelease, Version};

fn main() -> Result<(), Error> {
    let parsed_version = Version::parse("0.2.6")?;

    assert_eq!(
        parsed_version,
        Version {
            major: 0,
            minor: 2,
            patch: 6,
            pre: Prerelease::EMPTY,
            build: BuildMetadata::EMPTY,
        }
    );

    Ok(())
}
```

__Разбор сложной версии__

Создаем [semver::Version](https://docs.rs/semver/*/semver/struct.Version.html) из сложной строки с помощью [Version::parse](https://docs.rs/semver/*/semver/struct.Version.html#method.parse). Строка содержит номер предрелиза (pre-release) и метаданные о сборке (build metadata) согласно [спецификации семантического версионирования](http://semver.org/).

```rust
use semver::{BuildMetadata, Error, Prerelease, Version};

fn main() -> Result<(), Error> {
    let version_str = "1.0.49-125+g72ee7853";
    let parsed_version = Version::parse(version_str)?;

    assert_eq!(
        parsed_version,
        Version {
            major: 1,
            minor: 0,
            patch: 49,
            pre: Prerelease::new("125").unwrap(),
            build: BuildMetadata::new("g72ee7853").unwrap()
        }
    );

    let serialized_version = parsed_version.to_string();
    assert_eq!(&serialized_version, version_str);

    Ok(())
}
```

__Поиск последней версии, входящей в диапазон__

Имеется список версий, необходимо найти последнюю версию, удовлетворяющую условию. Структура [semver::VersionReq](https://docs.rs/semver/*/semver/struct.VersionReq.html) фильтрует список с помощью метода [VersionReq::matches](https://docs.rs/semver/*/semver/struct.VersionReq.html#method.matches).

```rust
use semver::{Error, Version, VersionReq};

fn find_max_matching_version<'a, I>(
    version_req_str: &str,
    iterable: I,
) -> Result<Option<Version>, Error>
where
    I: IntoIterator<Item = &'a str>,
{
    let vreq = VersionReq::parse(version_req_str)?;

    Ok(iterable
        .into_iter()
        .filter_map(|s| Version::parse(s).ok())
        .filter(|s| vreq.matches(s))
        .max())
}

fn main() -> Result<(), Error> {
    assert_eq!(
        find_max_matching_version("<= 1.0.0", vec!["0.9.0", "1.0.0", "1.0.1"])?,
        Some(Version::parse("1.0.0")?)
    );

    assert_eq!(
        find_max_matching_version(
            ">1.2.3-alpha.3",
            vec![
                "1.2.3-alpha.3",
                "1.2.3-alpha.4",
                "1.2.3-alpha.10",
                "1.2.3-beta.4",
                "3.4.5-alpha.9",
            ]
        )?,
        Some(Version::parse("1.2.3-beta.4")?)
    );

    Ok(())
}
```

__Проверка внешней версии команды на совместимость__

Запускаем `git --version` с помощью структуры [Command](https://doc.rust-lang.org/std/process/struct.Command.html), затем разбираем номер версии в структуру [semver::Version](https://docs.rs/semver/*/semver/struct.Version.html) с помощью метода [Version::parse](https://docs.rs/semver/*/semver/struct.Version.html#method.parse). Метод [Version::matches](https://docs.rs/semver/*/semver/struct.VersionReq.html#method.matches) сравнивает структуру [semver:VersionReq](https://docs.rs/semver/*/semver/struct.VersionReq.html) с разобранной версией. Программа печатает "git version x.y.z".

```rust
use error_chain::error_chain;

use semver::{Version, VersionReq};
use std::process::Command;

error_chain! {
    foreign_links {
        Io(std::io::Error);
        Utf8(std::string::FromUtf8Error);
        SemVer(semver::Error);
    }
}

fn main() -> Result<()> {
    let version_constraint = ">=2.39.2";
    let version_test = VersionReq::parse(version_constraint)?;
    let output = Command::new("git").arg("--version").output()?;

    if !output.status.success() {
        error_chain::bail!("Выполнение команды завершилось ошибкой");
    }

    let stdout = String::from_utf8(output.stdout)?;
    let version = stdout
        .split(" ")
        .last()
        .ok_or_else(|| "Невалидный вывод команды")?;
    // Версия Git может иметь вид 2.39.2.windows.1, разбор которой завершается ошибкой
    let version = version.split(".").take(3).collect::<Vec<_>>().join(".");
    let parsed_version = Version::parse(&version)?;

    if !version_test.matches(&parsed_version) {
        error_chain::bail!(
            "Версия команды ниже минимальной поддерживаемой версии (обнаружена {}, требуется {})",
            parsed_version,
            version_constraint
        );
    }

    Ok(())
}
```

## 10. Кодирование

### 10.1. Наборы символов

__Процентное кодирование строки__

Пример [процентного кодирования](https://en.wikipedia.org/wiki/Percent-encoding) строки с помощью функции [uft8_percent_encode](https://docs.rs/percent-encoding/*/percent_encoding/fn.utf8_percent_encode.html) из крейта [percent-encoding](https://docs.rs/percent-encoding). Декодирование строки выполняется в помощью функции [percent_decode](https://docs.rs/percent-encoding/*/percent_encoding/fn.percent_decode.html).

```rust
use percent_encoding::{utf8_percent_encode, percent_decode, AsciiSet, CONTROLS};
use std::str::Utf8Error;

/// https://url.spec.whatwg.org/#fragment-percent-encode-set
const FRAGMENT: &AsciiSet = &CONTROLS.add(b' ').add(b'"').add(b'<').add(b'>').add(b'`');

fn main() -> Result<(), Utf8Error> {
    let input = "confident, productive systems programming";

    // Кодируем и собираем строку
    let iter = utf8_percent_encode(input, FRAGMENT);
    let encoded: String = iter.collect();
    assert_eq!(encoded, "confident,%20productive%20systems%20programming");

    // Декодируем строку
    let iter = percent_decode(encoded.as_bytes());
    let decoded = iter.decode_utf8()?;
    assert_eq!(decoded, "confident, productive systems programming");

    Ok(())
}
```

Набор кодировок (`FRAGMENT`) определяет, какие байты (помимо байтов, отличных от ASCII, и элементов управления (controls)) должны кодироваться. Состав этого набора зависит от контекста. Например, `url` кодирует `?` в пути (path) URL, но не в строке запроса (query string).

`utf8_percent_encode` возвращает итератор срезов `&str`, которые собираются (collect) в `String`.

__Кодирование строки в application/x-www-form-urlencoded__

Пример кодирования строки в [application/x-www-form-urlencoded](https://url.spec.whatwg.org/#application/x-www-form-urlencoded) с помощью метода [form_urlencoded::byte_serialize](https://docs.rs/url/*/url/form_urlencoded/fn.byte_serialize.html). Декодирование выполняется с помощью метода [form_urlencoded::parse](https://docs.rs/url/*/url/form_urlencoded/fn.byte_serialize.html). Обе функции возвращают итераторы, которые собираются (collect) в `String`.

```rust
use url::form_urlencoded::{byte_serialize, parse};

fn main() {
    // Кодируем строку
    let urlencoded: String = byte_serialize("What is ❤?".as_bytes()).collect();
    assert_eq!(urlencoded, "What+is+%E2%9D%A4%3F");

    // Декодируем строку
    let decoded: String = parse(urlencoded.as_bytes())
        .map(|(key, val)| [key, val].concat())
        .collect();
    assert_eq!(decoded, "What is ❤?");
}
```

__Шестнадцатеричное кодирование и декодирование__

Крейт [data_encoding](https://docs.rs/data-encoding/latest/data_encoding/) предоставляет метод `HEXUPPER::encode`, который принимает `&[u8]` и возвращает `String`, содержащую шестнадцатеричное представление данных.

Этот крейт также предоставляет метод `HEXUPPER::decode`, который принимает `&[u8]` и возвращает `Vec<u8>` при успешном декодировании данных.

```rust
use data_encoding::{DecodeError, HEXUPPER};

fn main() -> Result<(), DecodeError> {
    let original = b"The quick brown fox jumps over the lazy dog.";
    let expected = "54686520717569636B2062726F776E20666F78206A756D7073206F76\
        657220746865206C617A7920646F672E";

    // Кодируем данные
    let encoded = HEXUPPER.encode(original);
    assert_eq!(encoded, expected);

    // Декодируем данные
    let decoded = HEXUPPER.decode(&encoded.into_bytes())?;
    assert_eq!(decoded, original);

    Ok(())
}
```

__base64 кодирование и декодирование__

Крейт [base64](https://docs.rs/base64) предоставляет методы [encode](https://docs.rs/base64/*/base64/fn.encode.html) и [decode](https://docs.rs/base64/*/base64/fn.decode.html) для кодирования и декодирования байтовых срезов в [base64](https://ru.wikipedia.org/wiki/Base64):

```rust
use error_chain::error_chain;

use base64::{engine::general_purpose::STANDARD, Engine as _};
use std::str;

error_chain! {
    foreign_links {
        Base64(base64::DecodeError);
        Utf8Error(str::Utf8Error);
    }
}

fn main() -> Result<()> {
    let hello = b"hello rustaceans";
    let encoded = STANDARD.encode(hello);
    let decoded = STANDARD.decode(&encoded)?;

    println!("origin: {}", str::from_utf8(hello)?);
    println!("base64 encoded: {}", encoded);
    println!("back to origin: {}", str::from_utf8(&decoded)?);

    Ok(())
}
```

### 10.2. Обработка CSV

__Чтение записей CSV__

Пример чтения стандартных записей CSV в структуру [csv::StringRecord](https://docs.rs/csv/*/csv/struct.StringRecord.html) - слаботипизированное представление данных, которое ожидает валидные строки UTF-8. В качестве альтернативы можно использовать структуру [ByteRecord](https://docs.rs/csv/*/csv/struct.ByteRecord.html), которая не проверяет строки.

```rust
use csv::Error;

fn main() -> Result<(), Error> {
    let csv = "year,make,model,description
1948,Porsche,356,Luxury sports car
1967,Ford,Mustang fastback 1967,American car";

    let mut reader = csv::Reader::from_reader(csv.as_bytes());
    for record in reader.records() {
        let record = record?;
        println!(
            "In {}, {} built the {} model. It is a {}.",
            &record[0], &record[1], &record[2], &record[3]
        );
    }

    Ok(())
}
```

Метод [csv::Reader::deserialize](https://docs.rs/csv/*/csv/struct.Reader.html#method.deserialize) десериализует данные в строготипизированные структуры. _Обратите внимание_ на явную типизацию десериализуемой записи.

```rust
use serde::Deserialize;

#[derive(Deserialize)]
struct Record {
    year: u16,
    make: String,
    model: String,
    description: String,
}

fn main() -> Result<(), csv::Error> {
    let csv = "year,make,model,description
1948,Porsche,356,Luxury sports car
1967,Ford,Mustang fastback 1967,American car";

    let mut reader = csv::Reader::from_reader(csv.as_bytes());

    for record in reader.deserialize() {
        // Типизация записи
        let record: Record = record?;
        println!(
            "In {}, {} built the {} model. It is a {}.",
            record.year,
            record.make,
            record.model,
            record.description
        );
    }

    Ok(())
}
```

__Чтение записей CSV с другим разделителем__

Пример чтения записей CSV, [разделителем](https://docs.rs/csv/1.0.0-beta.3/csv/struct.ReaderBuilder.html#method.delimiter) которых является таб:

```rust
use csv::Error;
use serde::Deserialize;

#[derive(Debug, Deserialize)]
struct Record {
    name: String,
    place: String,
    #[serde(deserialize_with = "csv::invalid_option")]
    id: Option<u64>,
}

use csv::ReaderBuilder;

fn main() -> Result<(), Error> {
    let data = "name\tplace\tid
Mark\tMelbourne\t46
Ashley\tZurich\t92";

    let mut reader = ReaderBuilder::new()
        // указываем разделитель
        .delimiter(b'\t')
        .from_reader(data.as_bytes());
    // Другой способ типизации записи
    for result in reader.deserialize::<Record>() {
        println!("{:?}", result?);
    }

    Ok(())
}
```

__Фильтрация записей CSV, совпадающих с предикатом__

В следующем примере возвращаются только те строки `data`, которые совпадают с `query`:

```rust
use error_chain::error_chain;

use std::io;

error_chain! {
    foreign_links {
        Io(std::io::Error);
        CsvError(csv::Error);
    }
}

fn main() -> Result<()> {
    let query = "CA";
    let data = "\
City,State,Population,Latitude,Longitude
Kenai,AK,7610,60.5544444,-151.2583333
Oakman,AL,,33.7133333,-87.3886111
Sandfort,AL,,32.3380556,-85.2233333
West Hollywood,CA,37031,34.0900000,-118.3608333";

    // Средство чтения CSV
    let mut rdr = csv::ReaderBuilder::new().from_reader(data.as_bytes());
    // Средство записи данных в stdout (терминал)
    let mut wtr = csv::Writer::from_writer(io::stdout());

    // Пишем в терминал заголовки CSV
    wtr.write_record(rdr.headers()?)?;

    for result in rdr.records() {
        let record = result?;
        // Пишем в терминал запись, содержащую поле, совпадающее с `query` (`CA`)
        if record.iter().any(|field| field == query) {
            wtr.write_record(&record)?;
        }
    }

    // `writer` использует внутренний буфер, см. ниже
    wtr.flush()?;
    Ok(())
}
```

__Обработка невалидных данных с помощью serde__

Файлы CSV часто содержат невалидные данные. Для таких случаяв крейт `csv` предоставляет кастомный десериализатор, [csv::invalid_option](https://docs.rs/csv/*/csv/fn.invalid_option.html), который автоматически преобразует невалидные данные в значения `None`:

```rust
use csv::Error;
use serde::Deserialize;

#[derive(Debug, Deserialize)]
struct Record {
    name: String,
    place: String,
    #[serde(deserialize_with = "csv::invalid_option")]
    id: Option<u64>,
}

fn main() -> Result<(), Error> {
    // Последняя запись содержит невалидный ID
    let data = "name,place,id
mark,sydney,46.5
ashley,zurich,92
akshat,delhi,37
alisha,colombo,xyz";

    let mut rdr = csv::Reader::from_reader(data.as_bytes());
    for result in rdr.deserialize() {
        let record: Record = result?;
        // Результат десериализации последней записи выглядит как
        // `Record { name: "alisha", place: "colombo", id: None }`
        println!("{:?}", record);
    }

    Ok(())
}
```

__Сериализация записей в CSV__

Пример сериализации кортежей `Rust`. Структура [csv::writer](https://docs.rs/csv/*/csv/struct.Writer.html) поддерживает автоматическую сериализацию типов `Rust` в записи CSV. Метод [write_record](https://docs.rs/csv/*/csv/struct.Writer.html#method.write_record) предназначен для работы с простыми записями, содержащими только строковые данные. Для работы с данными, содержащими более сложные значения, такие как целые числа, числа с плавающей точкой и опциональные значения, используются метод [serialize](https://docs.rs/csv/*/csv/struct.Writer.html#method.serialize). Поскольку в средстве записи (writer) используется внутренний буфер, необходимо явно вызывать метод [flush](https://docs.rs/csv/*/csv/struct.Writer.html#method.flush) для его очистки.

```rust
use error_chain::error_chain;

use std::io;

error_chain! {
    foreign_links {
        CSVError(csv::Error);
        IOError(std::io::Error);
   }
}

fn main() -> Result<()> {
    let mut wtr = csv::Writer::from_writer(io::stdout());

    wtr.write_record(&["Name", "Place", "ID"])?;

    wtr.serialize(("Mark", "Sydney", 87))?;
    wtr.serialize(("Ashley", "Dublin", 32))?;
    wtr.serialize(("Akshat", "Delhi", 11))?;

    wtr.flush()?;
    Ok(())
}
```

__Сериализация записей в CSV с помощью serde__

Пример сериализации кастомной структуры в запись CSV с помощью крейта [serde](https://docs.rs/serde/):

```rust
use error_chain::error_chain;
use serde::Serialize;
use std::io;

error_chain! {
   foreign_links {
       IOError(std::io::Error);
       CSVError(csv::Error);
   }
}

#[derive(Serialize)]
struct Record<'a> {
    name: &'a str,
    place: &'a str,
    id: u64,
}

fn main() -> Result<()> {
    let mut wtr = csv::Writer::from_writer(io::stdout());

    let rec1 = Record {
        name: "Mark",
        place: "Melbourne",
        id: 56,
    };
    let rec2 = Record {
        name: "Ashley",
        place: "Sydney",
        id: 64,
    };
    let rec3 = Record {
        name: "Akshat",
        place: "Delhi",
        id: 98,
    };

    wtr.serialize(rec1)?;
    wtr.serialize(rec2)?;
    wtr.serialize(rec3)?;

    wtr.flush()?;

    Ok(())
}
```

### 10.3. Структурированные данные

__Сериализация и десериализация неструктурированного JSON__

Крейт [serde_json](https://docs.serde.rs/serde_json/) предоставляет функцию [from_str](https://docs.serde.rs/serde_json/fn.from_str.html) для разбора `&str` в формате JSON.

Неструктурированный JSON разбирается в универсальный тип [serde_json::Value](https://docs.serde.rs/serde_json/enum.Value.html), который может представлять любой валидный JSON.

Следующим пример демонстрирует разбор `&str` JSON. Макрос [json!](https://docs.serde.rs/serde_json/macro.json.html) используется для определения ожидаемого значения.

```rust
use serde_json::json;
use serde_json::{Value, Error};

fn main() -> Result<(), Error> {
    let j = r#"{
                 "userid": 103609,
                 "verified": true,
                 "access_privileges": [
                   "user",
                   "admin"
                 ]
               }"#;

    let parsed: Value = serde_json::from_str(j)?;

    let expected = json!({
        "userid": 103609,
        "verified": true,
        "access_privileges": [
            "user",
            "admin"
        ]
    });

    assert_eq!(parsed, expected);

    Ok(())
}
```

__Десериализация TOML__

Пример разбора TOML в универсальное [toml::Value](https://docs.rs/toml/latest/toml/value/enum.Value.html), которое может представлять любые валидные данные в формате TOML:

```rust
use toml::{Value, de::Error};

fn main() -> Result<(), Error> {
    let toml_content = r#"
          [package]
          name = "your_package"
          version = "0.1.0"
          authors = ["You! <you@example.org>"]

          [dependencies]
          serde = "1.0"
          "#;

    let package_info: Value = toml::from_str(toml_content)?;

    assert_eq!(package_info["dependencies"]["serde"].as_str(), Some("1.0"));
    assert_eq!(package_info["package"]["name"].as_str(),
               Some("your_package"));

    Ok(())
}
```

Крейт [serde](https://docs.rs/serde/) позволяет разбирать TOML в кастомные структуры:

```rust
use serde::Deserialize;
use std::collections::HashMap;
use toml::de::Error;

#[derive(Deserialize)]
struct Config {
    package: Package,
    dependencies: HashMap<String, String>,
}

#[derive(Deserialize)]
struct Package {
    name: String,
    version: String,
    authors: Vec<String>,
}

fn main() -> Result<(), Error> {
    let toml_content = r#"
          [package]
          name = "your_package"
          version = "0.1.0"
          authors = ["You! <you@example.org>"]

          [dependencies]
          serde = "1.0"
          "#;

    let package_info: Config = toml::from_str(toml_content)?;

    assert_eq!(package_info.package.name, "your_package");
    assert_eq!(package_info.package.version, "0.1.0");
    assert_eq!(package_info.package.authors, vec!["You! <you@example.org>"]);
    assert_eq!(package_info.dependencies["serde"], "1.0");

    Ok(())
}
```

# 11. Обработка ошибок

__Правильная обработка ошибок в main__

Пример обработки ошибки, возникающей при попытке открыть несуществующий файл. Для этого используется [error-chain](https://docs.rs/error-chain/), библиотека, которая инкапсулирует большое количество шаблонного кода, необходимого для [обработки ошибок в Rust](https://doc.rust-lang.org/book/second-edition/ch09-00-error-handling.html).

`Io(std::io::Error)` внутри [foreign_links](https://docs.rs/error-chain/*/error_chain/#foreign-links) автоматически преобразует структуру [std::io::Error](https://doc.rust-lang.org/std/io/struct.Error.html) в тип, определенный макросом [error_chain!](https://docs.rs/error-chain/*/error_chain/macro.error_chain.html) и реализующий трейт [Error](https://doc.rust-lang.org/std/error/trait.Error.html).

В следующем примере мы пытаемся выяснить, сколько времени работает система путем открытия файла Unix `/proc/uptime` и разбора его содержимого для извлечения первого числа. Функция `read_uptime` возвращает время безотказной работы или ошибку.

```rust
use error_chain::error_chain;

use std::fs::File;
use std::io::Read;

error_chain!{
    foreign_links {
        Io(std::io::Error);
        ParseInt(std::num::ParseIntError);
    }
}

fn read_uptime() -> Result<u64> {
    let mut uptime = String::new();
    File::open("/proc/uptime")?.read_to_string(&mut uptime)?;

    Ok(uptime
        .split('.')
        .next()
        .ok_or("Невозможно разобрать данные")?
        .parse()?)
}

fn main() {
    match read_uptime() {
        Ok(uptime) => println!("Время безотказной работы: {} секунд", uptime),
        Err(err) => eprintln!("Ошибка: {}", err),
    };
}
```

__Обработка всех возможных ошибок__

Крейт [error-chain](https://docs.rs/error-chain/) делает возможным и относительно компактным [сопоставление](https://docs.rs/error-chain/*/error_chain/#matching-errors) разных типов ошибок, возвращаемых функцией. Тип ошибки определяется перечислением [ErrorKind](https://docs.rs/error-chain/*/error_chain/example_generated/enum.ErrorKind.html).

Используем [reqwest::blocking](https://docs.rs/reqwest/*/reqwest/blocking/index.html) для получения произвольного целого числа из веб-сервиса. Преобразуем строку из ответа в целое число. Стандартная библиотека `Rust`, [reqwest](https://docs.rs/reqwest/) и веб-сервис могут генерировать ошибки. Мы определяем ошибки с помощью [foreign_links](https://docs.rs/error-chain/*/error_chain/#foreign-links). Дополнительный вариант `ErrorKind` для веб-сервиса использует блок `errors` макроса [error_chain!](https://docs.rs/error-chain/*/error_chain/macro.error_chain.html).

```rust
use error_chain::error_chain;

error_chain! {
    foreign_links {
        Io(std::io::Error);
        Reqwest(reqwest::Error);
        ParseIntError(std::num::ParseIntError);
    }
    errors { RandomResponseError(t: String) }
}

fn parse_response(response: reqwest::blocking::Response) -> Result<u32> {
    let mut body = response.text()?;
    body.pop();
    body.parse::<u32>()
        .chain_err(|| ErrorKind::RandomResponseError(body))
}

fn run() -> Result<()> {
    let url =
        format!("https://www.random.org/integers/?num=1&min=0&max=10&col=1&base=10&format=plain");
    let response = reqwest::blocking::get(&url)?;
    let random_value: u32 = parse_response(response)?;
    println!("Произвольное целое число между 0 и 10: {}", random_value);
    Ok(())
}

fn main() {
    if let Err(error) = run() {
        match *error.kind() {
            ErrorKind::Io(_) => println!("Стандартная ошибка ввода/вывода: {:?}", error),
            ErrorKind::Reqwest(_) => println!("Ошибка Reqwest: {:?}", error),
            ErrorKind::ParseIntError(_) => {
                println!("Стандартная ошибка разбора целого числа: {:?}", error)
            }
            ErrorKind::RandomResponseError(_) => println!("Кастомная ошибка: {:?}", error),
            _ => println!("Другая ошибка: {:?}", error),
        }
    }
}
```

__Получение трассировки сложной ошибки__

Следующий пример демонстрирует обработку сложной ошибки и вывод ее трассировки. [chain_err](https://docs.rs/error-chain/*/error_chain/index.html#chaining-errors) используется для расширения списка возможных ошибок путем добавления новых ошибок. Стек ошибки может быть распутан (unwound), что предоставляет лучший контекст для понимания того, почему возникла ошибка.

В примере мы пытаемся десериализовать значение `256` в `u8`. Ошибка всплывает (bubble up) из `serde` через `csv` в пользовательский код.

```rust
use error_chain::error_chain;
use serde::Deserialize;

use std::fmt;

error_chain! {
    foreign_links {
        Reader(csv::Error);
    }
}

#[derive(Debug, Deserialize)]
struct Rgb {
    red: u8,
    blue: u8,
    green: u8,
}

impl Rgb {
    fn from_reader(csv_data: &[u8]) -> Result<Rgb> {
        let color: Rgb = csv::Reader::from_reader(csv_data)
            .deserialize()
            .nth(0)
            .ok_or("Невозможно разобрать первую запись CSV")?
            .chain_err(|| "Невозможно разобрать цвет RGB")?;

        Ok(color)
    }
}

impl fmt::UpperHex for Rgb {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        let hexa = u32::from(self.red) << 16 | u32::from(self.blue) << 8 | u32::from(self.green);
        write!(f, "{:X}", hexa)
    }
}

fn run() -> Result<()> {
    let csv = "red,blue,green
102,256,204";

    let rgb = Rgb::from_reader(csv.as_bytes()).chain_err(|| "Невозможно прочитать данные CSV")?;
    println!("{:?} в шестнадцатеричном формате: #{:X}", rgb, rgb);

    Ok(())
}

fn main() {
    if let Err(ref errors) = run() {
        eprintln!("Уровень ошибки - описание");
        errors
            .iter()
            .enumerate()
            .for_each(|(index, error)| eprintln!("└> {} - {}", index, error));

        if let Some(backtrace) = errors.backtrace() {
            eprintln!("{:?}", backtrace);
        }

        // В реальном приложении ошибки должны обрабатываться. Например, так:
        // std::process::exit(1);
    }
}
```

Обратная трассировка ошибки:

```
Уровень ошибки - описание
└> 0 - Невозможно прочитать данные CSV
└> 1 - Невозможно разобрать цвет RGB
└> 2 - CSV deserialize error: record 1 (line: 2, byte: 15): field 1: number too large to fit in target type
```

Запустите пример с `RUST_BACKTRACE=1` для отображения подробной [обратной трассировки](https://docs.rs/error-chain/*/error_chain/trait.ChainedError.html#tymethod.backtrace) этой ошибки.

## 12. Файловая система

### 12.1. Чтение и запись

__Чтение линий строк из файла__

Записываем сообщение, состоящее из трех строк, в файл, затем читаем его построчно с помощью итератора [Lines](https://doc.rust-lang.org/std/io/struct.Lines.html), созданного с помощью метода [BufRead::lines](https://doc.rust-lang.org/std/io/trait.BufRead.html#method.lines). Структура [File](https://doc.rust-lang.org/std/fs/struct.File.html) реализует трейт [Read](https://doc.rust-lang.org/std/io/trait.Read.html), который предоставляет трейт [BufReader](https://doc.rust-lang.org/std/io/struct.BufReader.html). Метод [File::create](https://doc.rust-lang.org/std/fs/struct.File.html#method.create) открывает файл для записи, а метод [File::open](https://doc.rust-lang.org/std/fs/struct.File.html#method.open) - для чтения.

```rust
use std::fs::File;
use std::io::{Write, BufReader, BufRead, Error};

fn main() -> Result<(), Error> {
    let path = "lines.txt";

    let mut output = File::create(path)?;
    write!(output, "Rust\n💖\nFun")?;

    let input = File::open(path)?;
    let buffered = BufReader::new(input);

    for line in buffered.lines() {
        println!("{}", line?);
    }

    Ok(())
}
```

__Блокировка одновременного чтения и записи файла__

Структура [same_file::Handle](https://docs.rs/same-file/*/same_file/struct.Handle.html) используется для сравнения обработчика файла с другими обработчиками. В следующем примере сравниваются обработчики чтения и записи файла:

```rust
use same_file::Handle;
use std::fs::File;
use std::io::{BufRead, BufReader, Error, ErrorKind};
use std::path::Path;

fn main() -> Result<(), Error> {
    let path_to_read = Path::new("message.txt");

    let stdout_handle = Handle::stdout()?;
    let handle = Handle::from_path(path_to_read)?;

    if stdout_handle == handle {
        return Err(Error::new(
            ErrorKind::Other,
            "Вы читаете и пишете в один и тот же файл",
        ));
    } else {
        let file = File::open(&path_to_read)?;
        let file = BufReader::new(file);
        for (num, line) in file.lines().enumerate() {
            println!("{} : {}", num, line?.to_uppercase());
        }
    }

    Ok(())
}
```

`cargo run` отображает содержимое файла `message.txt`, а `cargo run >> ./message.txt` завершается ошибкой, поскольку операции чтения и записи выполняются над одним файлом.

__Произвольный доступ к файлу с помощью карты памяти__

Создаем карту памяти (memory map) с помощью [memmap](https://docs.rs/memmap/) и имитируем произвольные чтения файла. Использование карты памяти означает, что мы индексируем фрагмент, а не [пытаемся](https://doc.rust-lang.org/std/fs/struct.File.html#method.seek) перемещаться по файлу.

Функция [Mmap::map](https://docs.rs/memmap/*/memmap/struct.Mmap.html#method.map) предполагает, что файл из карты памяти не модифицируется в то же время другим процессом. Иначе возникнет [гонка за данными](https://en.wikipedia.org/wiki/Race_condition#File_systems).

```rust
use memmap::Mmap;
use std::fs::File;
use std::io::{Write, Error};

fn main() -> Result<(), Error> {
    write!(File::create("content.txt")?, "My hovercraft is full of eels!")?;

    let file = File::open("content.txt")?;
    let map = unsafe { Mmap::map(&file)? };

    let random_indexes = [0, 1, 2, 19, 22, 10, 11, 29];
    assert_eq!(&map[3..13], b"hovercraft");
    let random_bytes: Vec<u8> = random_indexes.iter()
        .map(|&idx| map[idx])
        .collect();
    assert_eq!(&random_bytes[..], b"My loaf!");
    Ok(())
}
```

### 12.2. Обход директории

__Получение названий файлов, модифицированных в течение последних 24 часов__

Получаем текущую рабочую директорию путем вызова [env::current_dir](https://doc.rust-lang.org/std/env/fn.current_dir.html), затем для каждой сущности в [fs::read_dir](https://doc.rust-lang.org/std/fs/fn.read_dir.html), извлекаем [DirEntry::path](https://doc.rust-lang.org/std/fs/struct.DirEntry.html#method.path) и получаем метаданные через [fs::Metadata](https://doc.rust-lang.org/std/fs/struct.Metadata.html). [Metadata::modified](https://doc.rust-lang.org/std/fs/struct.Metadata.html#method.modified) возвращает [SystemTime::elapsed](https://doc.rust-lang.org/std/time/struct.SystemTime.html#method.elapsed) - время, прошедшее с момента последней модификации. [Duration::as_secs](https://doc.rust-lang.org/std/time/struct.Duration.html#method.as_secs) преобразует время в секунды и сравнивает его с 24 часами (24 * 60 * 60). [Metadata::is_file](https://doc.rust-lang.org/std/fs/struct.Metadata.html#method.is_file) отфильтровывает директории.

```rust
use error_chain::error_chain;

use std::{env, fs};

error_chain! {
    foreign_links {
        Io(std::io::Error);
        SystemTimeError(std::time::SystemTimeError);
    }
}

fn main() -> Result<()> {
    // Получаем текущую директорию
    let current_dir = env::current_dir()?;
    println!(
        "Файлы, модифицированные в течение последних 24 часов в {:?}:",
        current_dir
    );

    // Перебираем сущности, находящиеся в текущей директории
    for entry in fs::read_dir(current_dir)? {
        let entry = entry?;
        // Получаем путь сущности
        let path = entry.path();
        // Извлекаем метаданные сущности
        let metadata = fs::metadata(&path)?;
        // Получаем время последней модификации и преобразуем его в секунды
        let last_modified = metadata.modified()?.elapsed()?.as_secs();

        // Если с момента последней модификации прошло меньше 24 часов и
        // сущность является файлом
        if last_modified < 24 * 3600 && metadata.is_file() {
            println!(
                "Файл: {:?}, с момента последней модификации прошло {:?} секунд, файл доступен только для чтения: {:?}, размер: {:?} байтов.",
                path.file_name().ok_or("Название файла отсутствует")?,
                last_modified,
                metadata.permissions().readonly(),
                metadata.len(),
            );
        }
    }

    Ok(())
}
```

__Рекурсивный поиск дубликатов__

Пример рекурсивного поиска повторяющихся файлов, находящихся в текущей директории:

```rust
use std::collections::HashMap;
use walkdir::WalkDir;

fn main() {
    let mut filenames = HashMap::new();

    // Перебираем сущности, находящиеся в текущей директории
    for entry in WalkDir::new(".")
            .into_iter()
            .filter_map(Result::ok)
            // игнорируем директории
            .filter(|e| !e.file_type().is_dir()) {
        // Получаем название файла
        let f_name = String::from(entry.file_name().to_string_lossy());
        // Счетчик количества названий файлов
        let counter = filenames.entry(f_name.clone()).or_insert(0);
        *counter += 1;
        // Если название файла дублируется
        if *counter == 2 {
            println!("{}", f_name);
        }
    }
}
```

__Рекурсивный поиск файлов с заданным предикатом__

Пример поиска всех файлов JSON, находящихся в текущей директории и модифицированных в течение последних 24 часов. Метод [follow_links](https://docs.rs/walkdir/*/walkdir/struct.WalkDir.html#method.follow_links) считает символические ссылки обычными директориями и файлами.

```rust
use error_chain::error_chain;

use walkdir::WalkDir;

error_chain! {
    foreign_links {
        WalkDir(walkdir::Error);
        Io(std::io::Error);
        SystemTime(std::time::SystemTimeError);
    }
}

fn main() -> Result<()> {
    for entry in WalkDir::new(".")
            // учитываем символические ссылки
            .follow_links(true)
            .into_iter()
            .filter_map(|e| e.ok()) {
        let f_name = entry.file_name().to_string_lossy();
        let sec = entry.metadata()?.modified()?;

        // Если мы имеем дело с файлом JSON и с момента его
        //  последнего изменения прошло меньше 24 часов
        if f_name.ends_with(".json") && sec.elapsed()?.as_secs() < 86400 {
            println!("{}", f_name);
        }
    }

    Ok(())
}
```

__Обход директорий с пропуском файлов, название которых начинается с точки__

Используем метод [filter_entry](https://docs.rs/walkdir/*/walkdir/struct.IntoIter.html#method.filter_entry) для рекурсивного перебора сущностей. Функция `is_not_hidden` возвращает индикатор того, является ли файл или директория скрытыми (если название сущности начинается с точки, значит сущность является скрытой). [Iterator::filter](https://doc.rust-lang.org/std/iter/trait.Iterator.html#method.filter) применяется к каждой [WalkDir::DirEntry](https://docs.rs/walkdir/*/walkdir/struct.DirEntry.html), даже если предком сущности является скрытая директория.

Корневая директория не считается скрытой благодаря использованию [WalkDir::depth](https://docs.rs/walkdir/*/walkdir/struct.DirEntry.html#method.depth) в `is_not_hidden`.

```rust
use walkdir::{DirEntry, WalkDir};

fn is_not_hidden(entry: &DirEntry) -> bool {
    entry
        .file_name()
        .to_str()
        // сущность является корневой директорией или ее название начинается с точки
        .map(|s| entry.depth() == 0 || !s.starts_with("."))
        .unwrap_or(false)
}

fn main() {
    WalkDir::new(".")
        .into_iter()
        // отфильтровываем скрытые сущности
        .filter_entry(|e| is_not_hidden(e))
        .filter_map(|v| v.ok())
        .for_each(|x| println!("{}", x.path().display()));
}
```

__Рекурсивное вычисление размера файлов до заданной глубины__

Глубина рекурсии может быть гибко установлена с помощью методов [WalkDir::min_depth](https://docs.rs/walkdir/*/walkdir/struct.WalkDir.html#method.min_depth) и [WalkDir::max_depth](https://docs.rs/walkdir/*/walkdir/struct.WalkDir.html#method.max_depth). Вычисляем размер файлов на глубине трех поддиректорий, игнорируя файлы в корневой директории:

```rust
use walkdir::WalkDir;

fn main() {
    let total_size = WalkDir::new(".")
        .min_depth(1)
        .max_depth(3)
        .into_iter()
        .filter_map(|entry| entry.ok())
        .filter_map(|entry| entry.metadata().ok())
        .filter(|metadata| metadata.is_file())
        .fold(0, |acc, m| acc + m.len());

    println!("Общий размер: {} байтов.", total_size);
}
```

__Рекурсивный поиск всех файлов PNG__

Пример рекурсивного поиска всех файлов PNG в текущей директории. В данном случае паттерн `**` совпадает с текущей директорией и всеми ее поддиректориями.

Паттерн `**` может использоваться в любом месте пути. Например, `/media/**/*.png` совпадает со всеми файлами PNG в директории `media` и всех вложенных директориях.

```rust
use error_chain::error_chain;

use glob::glob;

error_chain! {
    foreign_links {
        Glob(glob::GlobError);
        Pattern(glob::PatternError);
    }
}

fn main() -> Result<()> {
    for entry in glob("**/*.png")? {
        println!("{}", entry?.display());
    }

    Ok(())
}
```

__Поиск всех файлов PNG, совпадающий с заданным паттерном, независимо от регистра__

Пример поиска всех изображений в директории `media`, совпадающих с паттерном `img_[0-9]*.png`.

В функцию [glob_with](https://docs.rs/glob/*/glob/fn.glob_with.html) передается структура [MatchOptions](https://docs.rs/glob/*/glob/struct.MatchOptions.html) с настройкой `case_sensitive: false`, что делает поиск нечувствительным к регистру. Остальные настройки остаются [дефолтными](https://doc.rust-lang.org/std/default/trait.Default.html).

```rust
use error_chain::error_chain;
use glob::{glob_with, MatchOptions};

error_chain! {
    foreign_links {
        Glob(glob::GlobError);
        Pattern(glob::PatternError);
    }
}

fn main() -> Result<()> {
    let options = MatchOptions {
        case_sensitive: false,
        ..Default::default()
    };

    for entry in glob_with("/media/img_[0-9]*.png", options)? {
        println!("{}", entry?.display());
    }

    Ok(())
}
```

# 13. Разное

__Проверка количества логических ядер центрального процессора__

```rust
fn main() {
    println!("Количество логических ядер ЦП: {}", num_cpus::get());
}
```

__Определение лениво оцениваемой константы__

Пример определения лениво оцениваемой (lazy evaluated) константной [HashMap](https://doc.rust-lang.org/std/collections/struct.HashMap.html). `HashMap` оценивается один раз и хранится за глобальной статической ссылкой.

```rust
use lazy_static::lazy_static;
use std::collections::HashMap;

lazy_static! {
    static ref PRIVILEGES: HashMap<&'static str, Vec<&'static str>> = {
        let mut map = HashMap::new();
        map.insert("Игорь", vec!["user", "admin"]);
        map.insert("Алекс", vec!["user"]);
        map
    };
}

fn show_access(name: &str) {
    let access = PRIVILEGES.get(name);
    println!("{}: {:?}", name, access);
}

fn main() {
    let access = PRIVILEGES.get("Игорь");
    println!("Игорь: {:?}", access);

    show_access("Алекс");
}
```

__Обработка запросов на неиспользуемом порту__

В следующем примере порт отображается в терминале и программа принимает подключения до получения запроса. При установке порта в значение 0, [SocketAddrV4](https://doc.rust-lang.org/std/net/struct.SocketAddrV4.html) присваивает произвольный порт.

```rust
use std::net::{SocketAddrV4, Ipv4Addr, TcpListener};
use std::io::{Read, Error};

fn main() -> Result<(), Error> {
    let loopback = Ipv4Addr::new(127, 0, 0, 1);
    let socket = SocketAddrV4::new(loopback, 0);
    let listener = TcpListener::bind(socket)?;
    let port = listener.local_addr()?;
    println!("Listening on {}, access this port to end the program", port);
    let (mut tcp_stream, addr) = listener.accept()?; // блокировка до получения запроса
    println!("Connection received! {:?} is sending data.", addr);
    let mut input = String::new();
    let _ = tcp_stream.read_to_string(&mut input)?;
    println!("{:?} says {}", addr, input);
    Ok(())
}
```

## 14. Операционная система

### 14.1. Внешняя команда

__Запуск внешней команды и обработка stdout__

Запускаем `git log --oneline` как внешнюю [Command](https://doc.rust-lang.org/std/process/struct.Command.html) и исследуем ее [Output](https://doc.rust-lang.org/std/process/struct.Output.html) с помощью [Regex](https://docs.rs/regex/*/regex/struct.Regex.html) для получения хеша и сообщений последних 5 коммитов:

```rust
use error_chain::error_chain;

use std::process::Command;
use regex::Regex;

error_chain!{
    foreign_links {
        Io(std::io::Error);
        Regex(regex::Error);
        Utf8(std::string::FromUtf8Error);
    }
}

#[derive(PartialEq, Default, Clone, Debug)]
struct Commit {
    hash: String,
    message: String,
}

fn main() -> Result<()> {
    let output = Command::new("git").arg("log").arg("--oneline").output()?;

    if !output.status.success() {
        error_chain::bail!("Выполнение команды завершилось кодом ошибки");
    }

    let pattern = Regex::new(r"(?x)
                               ([0-9a-fA-F]+) # хеш коммита
                               (.*)           # сообщение коммита")?;

    String::from_utf8(output.stdout)?
        .lines()
        .filter_map(|line| pattern.captures(line))
        .map(|cap| {
                 Commit {
                     hash: cap[1].to_string(),
                     message: cap[2].trim().to_string(),
                 }
             })
        .take(5)
        .for_each(|x| println!("{:?}", x));

    Ok(())
}
```

_Обратите внимание_: эта программа должна выполняться в директории с инициализированным GIT (`fatal: not a git repository (or any of the parent directories): .git`), содержащим хотя бы один коммит (`fatal: your current branch 'master' does not have any commits yet`).

__Запуск внешней команды, передача ей stdin и проверка кода ошибки__

Запускаем интерпретатор `python` с помощью внешней [Command](https://doc.rust-lang.org/std/process/struct.Command.html) и передаем ему инструкцию для выполнения. Затем разбираем [Output](https://doc.rust-lang.org/std/process/struct.Output.html).

```rust
use error_chain::error_chain;

use std::collections::HashSet;
use std::io::Write;
use std::process::{Command, Stdio};

error_chain!{
    errors { CmdError }
    foreign_links {
        Io(std::io::Error);
        Utf8(std::string::FromUtf8Error);
    }
}

fn main() -> Result<()> {
    let mut child = Command::new("python").stdin(Stdio::piped())
        .stderr(Stdio::piped())
        .stdout(Stdio::piped())
        .spawn()?;

    child.stdin
        .as_mut()
        .ok_or("stdin дочернего процесса не был перехвачен")?
        .write_all(b"import this; copyright(); credits(); exit()")?;

    let output = child.wait_with_output()?;

    if output.status.success() {
        let raw_output = String::from_utf8(output.stdout)?;
        let words = raw_output.split_whitespace()
            .map(|s| s.to_lowercase())
            .collect::<HashSet<_>>();
        println!("Найдено {} уникальных слов:", words.len());
        println!("{:#?}", words);
        Ok(())
    } else {
        let err = String::from_utf8(output.stderr)?;
        error_chain::bail!("Выполнение внешней команды провалилось:\n {}", err)
    }
}
```

_Обратите внимание_: для успешного выполнения этой программы на вашей машине должен быть установлен [Python](https://www.python.org/downloads/).

__Запуск внешних команд в конвейере__

Получаем список из 10 самых больших файлов и директорий, находящихся в текущей рабочей директории с помощью команды `du -ah . | sort -hr | head -n 10`, выполняемой программно.

[Command](https://doc.rust-lang.org/std/process/struct.Command.html) представляет процесс. Вывод (output) дочернего процесса перехватывается с помощью [Stdio::piped](https://doc.rust-lang.org/std/process/struct.Stdio.html) между предком и ребенком.

```rust
use error_chain::error_chain;

use std::process::{Command, Stdio};

error_chain! {
    foreign_links {
        Io(std::io::Error);
        Utf8(std::string::FromUtf8Error);
    }
}

fn main() -> Result<()> {
    // Путь к текущей директории
    let directory = std::env::current_dir()?;
    // du -ah .
    let mut du_output_child = Command::new("du")
        .arg("-ah")
        .arg(&directory)
        .stdout(Stdio::piped())
        .spawn()?;

    if let Some(du_output) = du_output_child.stdout.take() {
        // sort -hr
        let mut sort_output_child = Command::new("sort")
            .arg("-hr")
            .stdin(du_output)
            .stdout(Stdio::piped())
            .spawn()?;

        du_output_child.wait()?;

        if let Some(sort_output) = sort_output_child.stdout.take() {
            // head -n 10
            let head_output_child = Command::new("head")
                .args(&["-n", "10"])
                .stdin(sort_output)
                .stdout(Stdio::piped())
                .spawn()?;

            let head_stdout = head_output_child.wait_with_output()?;

            sort_output_child.wait()?;

            println!(
                "10 самых больших файлов и директорий в '{}':\n{}",
                directory.display(),
                String::from_utf8(head_stdout.stdout).unwrap()
            );
        }
    }

    Ok(())
}
```

_Обратите внимание_: эта программа предназначена для выполнения в системах `Unix`. В `Windows` аналогичную команду можно выполнить с помощью `bash -c "du -ah . | sort -hr | head -n 10"`.

__Перенаправление stdout и stderr дочернего процесса в один файл__

Создаем (spawn) дочерний процесс и перенаправляем `stdout` и `stderr` в один и тот же файл. Этот пример похож на предыдущий, за исключением того, что [process::Stdio](https://doc.rust-lang.org/std/process/struct.Stdio.html) пишет в указанный файл. [File::try_clone](https://doc.rust-lang.org/std/fs/struct.File.html#method.try_clone) ссылается на один обработчик для `stdout` и `stderr`. Это гарантирует, что оба дескриптора пишут с одной и той же позиции курсора. Выполнение этой программы аналогично выполнению команды `ls . oops >out.txt 2>&1`.

```rust
use std::fs::File;
use std::io::Error;
use std::process::{Command, Stdio};

fn main() -> Result<(), Error> {
    let outputs = File::create("out.txt")?;
    let errors = outputs.try_clone()?;

    Command::new("ls")
        // вызываем ошибку
        .args(&[".", "oops"])
        .stdout(Stdio::from(outputs))
        .stderr(Stdio::from(errors))
        .spawn()?
        .wait_with_output()?;

    Ok(())
}
```

_Обратите внимание_: эта программа предназначена для выполнения в системах `Unix`. В `Windows` аналогичную команду можно выполнить с помощью `bash -c "ls . oops >out.txt 2>&1"`.

__Непрерывная обработка входных данных дочернего процесса__

В примере "Запуск внешней команды и обработка stdout" обработка начиналась только после завершения выполнения внешней [Command](https://doc.rust-lang.org/std/process/struct.Command.html). В следующем примере мы создаем конвейер с помощью [Stdio::piped](https://doc.rust-lang.org/std/process/struct.Stdio.html) и непрерывно (continuously) читаем `stdout` при обновлении [BufReader](https://doc.rust-lang.org/std/io/struct.BufReader.html). Выполнение этой программы эквивалентно выполнению команды `journalctl | grep usb`.

```rust
use std::process::{Command, Stdio};
use std::io::{BufRead, BufReader, Error, ErrorKind};

fn main() -> Result<(), Error> {
    let stdout = Command::new("journalctl")
        .stdout(Stdio::piped())
        .spawn()?
        .stdout
        .ok_or_else(|| Error::new(ErrorKind::Other, "Невозможно перехватить stdout"))?;

    let reader = BufReader::new(stdout);

    reader
        .lines()
        .filter_map(|line| line.ok())
        .filter(|line| line.find("usb").is_some())
        .for_each(|line| println!("{}", line));

     Ok(())
}
```

_Обратите внимание_: эта программа предназначена для выполнения в системах `Unix`. В `Windows` аналогичную команду можно выполнить с помощью `bash -c "journalctl | grep usb"`.

__Чтение переменных среды окружения__

Пример чтения переменной среды окружения с помощью [std::env::var](https://doc.rust-lang.org/std/env/fn.var.html):

```rust
use std::env;
use std::fs;
use std::io::Error;

fn main() -> Result<(), Error> {
    // Читаем `config_path` из переменной среды окружения `CONFIG`.
    // Если переменная `CONFIG` не установлена, используется дефолтный путь
    let config_path = env::var("CONFIG")
        .unwrap_or("/etc/myapp/config".to_string());

    let config: String = fs::read_to_string(config_path)?;
    println!("Настройки: {}", config);

    Ok(())
}
```

Для чтения переменных из файлов `.env*` используется крейт [dotenv](https://docs.rs/dotenv).

## 15. Обработка текста

### 15.1. Регулярные выражения

__Проверка и извлечение логина из адреса email__

Пример валидации email и извлечения всего, что предшествует `@`:

```rust
use lazy_static::lazy_static;
use regex::Regex;

// Функция извлечения логина
fn extract_login(input: &str) -> Option<&str> {
    // Лениво оцениваемая статическая ссылка - регулярное выражение
    lazy_static! {
        static ref RE: Regex = Regex::new(r"(?x)
            ^(?P<login>[^@\s]+)@
            ([[:word:]]+\.)*
            [[:word:]]+$
            ").unwrap();
    }
    RE.captures(input).and_then(|cap| {
        // login - захваченная группа (capture group)
        cap.name("login").map(|login| login.as_str())
    })
}

fn main() {
    assert_eq!(extract_login(r"I❤email@example.com"), Some(r"I❤email"));
    assert_eq!(
        extract_login(r"sdf+sdsfsd.as.sdsd@jhkk.d.rl"),
        Some(r"sdf+sdsfsd.as.sdsd")
    );
    assert_eq!(extract_login(r"More@Than@One@at.com"), None);
    assert_eq!(extract_login(r"Not an email@email"), None);
}
```

__Извлечение списка уникальных хештегов из текста__

Пример извлечения, сортировки и удаления дублирующихся хештегов из текста.

Регулярное выражение для проверки хештега учитывает только латинские хештеги, которые начинаются с буквы. Полная [регулярка проверки хештегов Twitter](https://github.com/twitter/twitter-text/blob/c9fc09782efe59af4ee82855768cfaf36273e170/java/src/com/twitter/Regex.java#L255) гораздо сложнее.

```rust
use lazy_static::lazy_static;

use regex::Regex;
use std::collections::HashSet;

// Функция извлечения хештегов
fn extract_hashtags(text: &str) -> HashSet<&str> {
    // Лениво оцениваемая статическая ссылка - регулярное выражение
    lazy_static! {
        static ref RE: Regex = Regex::new(
                r"\#[a-zA-Z][0-9a-zA-Z_]*"
            ).unwrap();
    }
    RE.find_iter(text).map(|mat| mat.as_str()).collect()
}

fn main() {
    let tweet = "Hey #world, I just got my new #dog, say hello to Till. #dog #forever #2 #_ ";
    let tags = extract_hashtags(tweet);
    assert!(tags.contains("#dog") && tags.contains("#forever") && tags.contains("#world"));
    assert_eq!(tags.len(), 3);
}
```

__Извлечение из текста номеров телефона__

Пример обработки текста с помощью [Regex::captures_iter](https://docs.rs/regex/*/regex/struct.Regex.html#method.captures_iter) для захвата нескольких номеров телефона. Регулярное выражение учитывает только американские номера.

```rust
use error_chain::error_chain;

use regex::Regex;
use std::fmt;

error_chain!{
    foreign_links {
        Regex(regex::Error);
        Io(std::io::Error);
    }
}

struct PhoneNumber<'a> {
    area: &'a str,
    exchange: &'a str,
    subscriber: &'a str,
}

impl<'a> fmt::Display for PhoneNumber<'a> {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "1 ({}) {}-{}", self.area, self.exchange, self.subscriber)
    }
}

fn main() -> Result<()> {
    let phone_text = "
    +1 505 881 9292 (v) +1 505 778 2212 (c) +1 505 881 9297 (f)
    (202) 991 9534
    Alex 5553920011
    1 (800) 233-2010
    1.299.339.1020";

    let re = Regex::new(
        r#"(?x)
          (?:\+?1)?                       # опциональный код страны
          [\s\.]?
          (([2-9]\d{2})|\(([2-9]\d{2})\)) # код региона
          [\s\.\-]?
          ([2-9]\d{2})                    # код обмена
          [\s\.\-]?
          (\d{4})                         # код подписчика"#,
    )?;

    let phone_numbers = re.captures_iter(phone_text).filter_map(|cap| {
        let groups = (cap.get(2).or(cap.get(3)), cap.get(4), cap.get(5));
        match groups {
            (Some(area), Some(ext), Some(sub)) => Some(PhoneNumber {
                area: area.as_str(),
                exchange: ext.as_str(),
                subscriber: sub.as_str(),
            }),
            _ => None,
        }
    });

    assert_eq!(
        phone_numbers.map(|m| m.to_string()).collect::<Vec<_>>(),
        vec![
            "1 (505) 881-9292",
            "1 (505) 778-2212",
            "1 (505) 881-9297",
            "1 (202) 991-9534",
            "1 (555) 392-0011",
            "1 (800) 233-2010",
            "1 (299) 339-1020",
        ]
    );

    Ok(())
}
```

__Замена всех подстрок в строке__

Пример замены всех стандартных дат ISO 8601 YYYY-MM-DD эквивалентными датами в привычном нам формате. Например `2013-01-15` становится `15.01.2013`.

Метод [Regex::replace_all](https://docs.rs/regex/*/regex/struct.Regex.html#method.replace_all) заменяет все вхождения всего регулярного выражения. `&str` реализует трейт `Replacer`, который позволяет переменным вроде `$abcde` ссылаться на соответствующие захваченные группы (`?P<abcde>REGEX`) из результатов поиска регулярки. См. [синтаксис замены в строке](https://docs.rs/regex/*/regex/struct.Regex.html#replacement-string-syntax) для примеров и деталей экранирования.

```rust
use lazy_static::lazy_static;

use std::borrow::Cow;
use regex::Regex;

// Функция форматирования даты
fn reformat_dates(before: &str) -> Cow<str> {
    // Лениво оцениваемая статическая ссылка - регулярное выражение
    lazy_static! {
        static ref RE : Regex = Regex::new(
            r"(?P<y>\d{4})-(?P<m>\d{2})-(?P<d>\d{2})"
            ).unwrap();
    }
    RE.replace_all(before, "$d.$m.$y")
}

fn main() {
    let before = "2012-03-14, 2013-01-15 и 2014-07-05";
    let after = reformat_dates(before);
    assert_eq!(after, "14.03.2012, 15.01.2013 и 05.07.2014");
}
```

### 15.3. Разбор строки

__Сбор графем Юникода__

Собираем индивидуальные графемы [Юникода](https://habr.com/ru/companies/timeweb/articles/785668/) из UTF-8 строки с помощью метода [UnicodeSegmentation::graphemes](https://docs.rs/unicode-segmentation/*/unicode_segmentation/trait.UnicodeSegmentation.html#tymethod.graphemes) из крейта [unicode-segmentation](https://docs.rs/unicode-segmentation/1.2.1/unicode_segmentation/):

```rust
use unicode_segmentation::UnicodeSegmentation;

fn main() {
    let name = "Йогурт захватил мир\r\n";
    let graphemes = UnicodeSegmentation::graphemes(name, true)
    	.collect::<Vec<&str>>();
    assert_eq!(graphemes[0], "Й");
}
```

__Реализация трейта FromStr для кастомной структуры__

Создаем кастомную структуру `RGB` и реализуем на ней трейт `FromStr` для преобразования цвета HEX в цвет RGB:

```rust
use std::str::FromStr;

#[derive(Debug, PartialEq)]
struct RGB {
    r: u8,
    g: u8,
    b: u8,
}

impl FromStr for RGB {
    type Err = std::num::ParseIntError;

    // Преобразует цвет HEX `#rRgGbB` в экземпляр `RGB`
    fn from_str(hex_code: &str) -> Result<Self, Self::Err> {
        // `u8::from_str_radix(src: &str, radix: u32)` преобразует строковый срез
        // в u8 в указанной системе счисления
        let r: u8 = u8::from_str_radix(&hex_code[1..3], 16)?;
        let g: u8 = u8::from_str_radix(&hex_code[3..5], 16)?;
        let b: u8 = u8::from_str_radix(&hex_code[5..7], 16)?;

        Ok(RGB { r, g, b })
    }
}

fn main() {
    let code = "#fa7268";
    match RGB::from_str(code) {
        Ok(rgb) => {
            println!(
                "The RGB color code is: R: {} G: {} B: {}",
                rgb.r, rgb.g, rgb.b
            );
        }
        Err(_) => {
            println!("{} is not a valid color hex code!", code);
        }
    }

    assert_eq!(
        RGB::from_str(&r"#fa7268").unwrap(),
        RGB {
            r: 250,
            g: 114,
            b: 104
        }
    );
}
```

## 16. Веб-разработка

### 16.1. Извлечение ссылок

__Извлечение всех ссылок из HTML-страницы__

Выполняем GET-запрос HTTP с помощью [reqwest::get](https://docs.rs/reqwest/*/reqwest/fn.get.html) и разбираем ответ в документ HTML с помощью [Document::from_read](https://docs.rs/select/*/select/document/struct.Document.html#method.from_read). [find](https://docs.rs/select/*/select/document/struct.Document.html#method.find) с `a` в [Name](https://docs.rs/select/*/select/predicate/struct.Name.html) извлекает все ссылки. Вызов [filter_map](https://doc.rust-lang.org/core/iter/trait.Iterator.html#method.filter_map) на [Selection](https://docs.rs/select/*/select/selection/struct.Selection.html) извлекает URL из ссылок, имеющих [attr](https://docs.rs/select/*/select/node/struct.Node.html#method.attr) (атрибут) `href`.

```rust
use error_chain::error_chain;
use select::document::Document;
use select::predicate::Name;

error_chain! {
      foreign_links {
          ReqError(reqwest::Error);
          IoError(std::io::Error);
      }
}

#[tokio::main]
async fn main() -> Result<()> {
    // Выполняем GET-запрос
    let res = reqwest::get("https://www.rust-lang.org/en-US/")
        .await?
        // преобразуем ответ в текст
        .text()
        .await?;

    // Разбираем текст ответа
    Document::from(res.as_str())
        // находим ссылки
        .find(Name("a"))
        // отфильтровываем ссылки без атрибута `href`
        .filter_map(|n| n.attr("href"))
        .for_each(|x| println!("{}", x));

  Ok(())
}
```

__Поиск сломанных ссылок на веб-странице__

Вызываем `get_base_url` для извлечения базового URL. Если документ имеет базовый тег, получаем из него значение [attr](https://docs.rs/select/*/select/node/struct.Node.html#method.attr) (атрибута) `href`. По умолчанию используется [Position::BeforePath](https://docs.rs/url/*/url/enum.Position.html#variant.BeforePath) оригинального URL.

Перебираем ссылки документа и создаем задачу с помощью [tokio::spawn](https://docs.rs/tokio/*/tokio/fn.spawn.html) для разбора индивидуальной ссылки с помощью [url::ParseOptions](https://docs.rs/url/*/url/struct.ParseOptions.html) и [Url::parse](https://docs.rs/url/*/url/struct.Url.html#method.parse). Задача выполняет запрос с помощью [reqwest](https://docs.rs/reqwest/) и проверяет [StatusCode](https://docs.rs/reqwest/*/reqwest/struct.StatusCode.html) ответа. Программа `await` (ожидает) выполнения задач перед завершением.

```rust
use error_chain::error_chain;
use reqwest::StatusCode;
use select::document::Document;
use select::predicate::Name;
use std::collections::HashSet;
use url::{Position, Url};

error_chain! {
  foreign_links {
      ReqError(reqwest::Error);
      IoError(std::io::Error);
      UrlParseError(url::ParseError);
      JoinError(tokio::task::JoinError);
  }
}

// Функция получения базового URL
async fn get_base_url(url: &Url, doc: &Document) -> Result<Url> {
  let base_tag_href = doc.find(Name("base")).filter_map(|n| n.attr("href")).nth(0);
  let base_url =
    base_tag_href.map_or_else(|| Url::parse(&url[..Position::BeforePath]), Url::parse)?;
  Ok(base_url)
}

// Функция проверки ссылки
async fn check_link(url: &Url) -> Result<bool> {
  let res = reqwest::get(url.as_ref()).await?;
  // Проверяем только отсутствующие страницы (ошибка 404)
  Ok(res.status() != StatusCode::NOT_FOUND)
}

#[tokio::main]
async fn main() -> Result<()> {
  let url = Url::parse("https://www.rust-lang.org/en-US/")?;
  let res = reqwest::get(url.as_ref()).await?.text().await?;
  let document = Document::from(res.as_str());
  let base_url = get_base_url(&url, &document).await?;
  let base_parser = Url::options().base_url(Some(&base_url));
  let links: HashSet<Url> = document
    .find(Name("a"))
    .filter_map(|n| n.attr("href"))
    .filter_map(|link| base_parser.parse(link).ok())
    .collect();
    let mut tasks = vec![];

    for link in links {
        tasks.push(tokio::spawn(async move {
            if check_link(&link).await.unwrap() {
                println!("Ссылка `{}` в порядке", link);
            } else {
                println!("Ссылка `{}` сломана", link);
            }
        }));
    }

    for task in tasks {
        task.await?
    }

  Ok(())
}
```

__Извлечение уникальных ссылок из разметки MediaWiki__

Получаем страницу MediaWiki с помощью [reqwest::get](https://docs.rs/reqwest/*/reqwest/fn.get.html) и ищем все внутренние и внешние ссылки с помощью [Regex::captures_iter](https://docs.rs/regex/*/regex/struct.Regex.html#method.captures_iter). Использование [Cow](https://doc.rust-lang.org/std/borrow/enum.Cow.html) позволяет избежать чрезмерного выделения (allocation) [String](https://doc.rust-lang.org/std/string/struct.String.html).

Описание синтаксиса MediaWiki можно найти [здесь](https://www.mediawiki.org/wiki/Help:Links).

```rust
use lazy_static::lazy_static;
use regex::Regex;
use std::borrow::Cow;
use std::collections::HashSet;
use std::error::Error;

// Функция извлечения ссылок с помощью регулярного выражения
fn extract_links(content: &str) -> HashSet<Cow<str>> {
  lazy_static! {
    static ref WIKI_REGEX: Regex = Regex::new(
        r"(?x)
            \[\[(?P<internal>[^\[\]|]*)[^\[\]]*\]\]    # внутренние ссылки
            |
            (url=|URL\||\[)(?P<external>http.*?)[ \|}] # внешние ссылки
        "
    )
    .unwrap();
  }

  let links: HashSet<_> = WIKI_REGEX
    // ищем ссылки на странице
    .captures_iter(content)
    // ищем совпадение с образцом-кортежем
    .map(|c| match (c.name("internal"), c.name("external")) {
      (Some(val), None) => Cow::from(val.as_str().to_lowercase()),
      (None, Some(val)) => Cow::from(val.as_str()),
      _ => unreachable!(),
    })
    .collect();

  links
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
  let content = reqwest::get(
    "https://en.wikipedia.org/w/index.php?title=Rust_(programming_language)&action=raw",
  )
  .await?
  .text()
  .await?;

  println!("{:#?}", extract_links(content.as_str()));

  Ok(())
}
```

### 16.2. URL

__Разбор URL из строки в тип Url__

Метод [parse](https://docs.rs/url/*/url/struct.Url.html#method.parse) крейта [url](https://docs.rs/url/) валидирует и разбирает `&str` в структуру [Url](https://docs.rs/url/*/url/struct.Url.html). Строка может быть повреждена, поэтому `parse` возвращает `Result<Url, ParseError>`.

```rust
use url::{Url, ParseError};

fn main() -> Result<(), ParseError> {
    let s = "https://github.com/rust-lang/rust/issues?labels=E-easy&state=open";

    let parsed = Url::parse(s)?;
    println!("Путь URL: {}", parsed.path());
    // Путь URL: /rust-lang/rust/issues

    Ok(())
}
```

__Создание базового URL путем удаления сегментов пути__

Базовый URL включает протокол и домен. Такие URL не содержат директорий, файлов и строк запроса (query string). Метод [PathSegmentsMut::clear](https://docs.rs/url/*/url/struct.PathSegmentsMut.html#method.clear) удаляет пути, а метод [Url::set_query](https://docs.rs/url/*/url/struct.Url.html#method.set_query) удаляет строку запроса.

```rust
use error_chain::error_chain;
use url::Url;

error_chain! {
    foreign_links {
        UrlParse(url::ParseError);
    }
    errors {
        CannotBeABase
    }
}

fn main() -> Result<()> {
    let full = "https://github.com/rust-lang/cargo?asdf";

    let url = Url::parse(full)?;
    let base = base_url(url)?;

    println!("Базовый URL: {}", base);
    // Базовый URL: https://github.com/

    Ok(())
}

fn base_url(mut url: Url) -> Result<Url> {
    match url.path_segments_mut() {
        Ok(mut path) => {
            path.clear();
        }
        Err(_) => {
            return Err(Error::from_kind(ErrorKind::CannotBeABase));
        }
    }

    url.set_query(None);

    Ok(url)
}
```

__Создание новых URL из базового__

Метод [join](https://docs.rs/url/*/url/struct.Url.html#method.join) позволяет создавать новые URL из базового и относительного путей:

```rust
use url::{Url, ParseError};

fn main() -> Result<(), ParseError> {
    let path = "/rust-lang/cargo";

    let gh = build_github_url(path)?;

    println!("Объединенный URL: {}", gh);
    // Объединенный URL: https://github.com/rust-lang/cargo

    Ok(())
}

fn build_github_url(path: &str) -> Result<Url, ParseError> {
    const GITHUB: &'static str = "https://github.com";

    let base = Url::parse(GITHUB)?;
    let joined = base.join(path)?;

    Ok(joined)
}
```

__Извлечение источника (схема / хост / порт)__

Структура [Url](https://docs.rs/url/*/url/struct.Url.html) предоставляет разные методы для извлечения информации об URL, который она представляет:

```rust
use url::{Url, Host, ParseError};

fn main() -> Result<(), ParseError> {
    let s = "ftp://rust-lang.org/examples";

    let url = Url::parse(s)?;

    assert_eq!(url.scheme(), "ftp");
    assert_eq!(url.host(), Some(Host::Domain("rust-lang.org")));
    assert_eq!(url.port_or_known_default(), Some(21));

    Ok(())
}
```

Аналогичный результат можно получить с помощью метода [origin](https://docs.rs/url/*/url/struct.Url.html#method.origin):

```rust
use error_chain::error_chain;
use url::{Url, Origin, Host};

error_chain! {
    foreign_links {
        UrlParse(url::ParseError);
    }
}

fn main() -> Result<()> {
    let s = "ftp://rust-lang.org/examples";

    let url = Url::parse(s)?;

    let expected_scheme = "ftp".to_owned();
    let expected_host = Host::Domain("rust-lang.org".to_owned());
    let expected_port = 21;
    let expected = Origin::Tuple(expected_scheme, expected_host, expected_port);

    let origin = url.origin();
    assert_eq!(origin, expected);

    Ok(())
}
```

__Удаление идентификаторов фрагментов и пар запросов из URL__

Разбираем строку в структуру [Url](https://docs.rs/url/*/url/struct.Url.html) и обрезаем URL с помощью [url::Position](https://docs.rs/url/*/url/enum.Position.html) для удаления лишних частей:

```rust
use url::{Url, Position, ParseError};

fn main() -> Result<(), ParseError> {
    let parsed = Url::parse("https://github.com/rust-lang/rust/issues?labels=E-easy&state=open")?;
    let cleaned: &str = &parsed[..Position::AfterPath];
    println!("Очищенный URL: {}", cleaned);
    // Очищенный URL: https://github.com/rust-lang/rust/issues
    Ok(())
}
```

### 16.3. Типы медиа

__Извлечение MIME-типа из строки__

Следующий пример демонстрирует разбор строки в тип [MIME](https://docs.rs/mime/*/mime/struct.Mime.html) с помощью крейта [mime](https://docs.rs/mime/). Структура [FromStrError](https://docs.rs/mime/*/mime/struct.FromStrError.html) генерирует дефолтный [MIME-тип](https://developer.mozilla.org/ru/docs/Glossary/MIME_type) в методе `unwrap_or`.

```rust
use mime::{Mime, APPLICATION_OCTET_STREAM};

fn main() {
    let invalid_mime_type = "i n v a l i d";
    // Дефолтный [MIME-тип]
    let default_mime = invalid_mime_type
        .parse::<Mime>()
        .unwrap_or(APPLICATION_OCTET_STREAM);

    println!(
        "MIME для {:?} - дефолтный {:?}",
        invalid_mime_type, default_mime
    );
    // MIME для "i n v a l i d" - дефолтный "application/octet-stream"

    let valid_mime_type = "TEXT/PLAIN";
    let parsed_mime = valid_mime_type
        .parse::<Mime>()
        .unwrap_or(APPLICATION_OCTET_STREAM);

    println!(
        "MIME для {:?} был разобран как {:?}",
        valid_mime_type, parsed_mime
    );
    // MIME для "TEXT/PLAIN" был разобран как "text/plain"
}
```

__Извлечение MIME-типа из названия файла__

Следующий пример демонстрирует извлечение корректного MIME-типа из названия файла с помощью крейта [mime](https://docs.rs/mime/). Программа проверяет расширение файла и ищет совпадение с известным списком. Возвращаемым значением является [mime::Mime](https://docs.rs/mime/*/mime/struct.Mime.html).

```rust
use mime::Mime;

fn find_mimetype (filename : &String) -> Mime {
    //  Разбиваем название файла на части по точке
    let parts : Vec<&str> = filename.split('.').collect();

    // Ищем совпадение с последней частью названия файла - его расширением
    let res = match parts.last() {
            Some(v) =>
                match *v {
                    "png" => mime::IMAGE_PNG,
                    "jpg" => mime::IMAGE_JPEG,
                    "json" => mime::APPLICATION_JSON,
                    _ => mime::TEXT_PLAIN,
                },
            None => mime::TEXT_PLAIN,
        };

    return res;
}

fn main() {
    let filenames = vec!("foobar.jpg", "foo.bar", "foobar.png");
    for file in filenames {
        let mime = find_mimetype(&file.to_owned());
     	println!("MIME для {}: {}", file, mime);
     }
}
```

__Извлечение MIME-типа из ответа HTTP__

При получении ответа HTTP с помощью [reqwest](https://docs.rs/reqwest) MIME-тип можно найти в заголовке [Content-Type](https://developer.mozilla.org/docs/Web/HTTP/Headers/Content-Type). Метод [reqwest::header::HeaderMap::get](https://docs.rs/reqwest/*/reqwest/header/struct.HeaderMap.html#method.get) извлекает заголовок как [reqwest::header::HeaderValue](https://docs.rs/reqwest/*/reqwest/header/struct.HeaderValue.html), которое может быть преобразовано в строку. Крейт [mime](https://docs.rs/mime/*/mime/struct.Mime.html) затем может разобрать эту строку в значение [mime::Mime](https://docs.rs/mime/*/mime/struct.Mime.html).

Крейт `mime` определяет некоторые распространенные MIME-типы.

_Обратите внимание_, что модуль [reqwest::header](https://docs.rs/reqwest/*/reqwest/header/index.html) экспортируется из крейта [http](https://docs.rs/http/*/http/).

```rust
use error_chain::error_chain;
use mime::Mime;
use std::str::FromStr;
use reqwest::header::CONTENT_TYPE;

error_chain! {
    foreign_links {
        Reqwest(reqwest::Error);
        Header(reqwest::header::ToStrError);
        Mime(mime::FromStrError);
    }
}

#[tokio::main]
async fn main() -> Result<()> {
    let response = reqwest::get("https://www.rust-lang.org/logos/rust-logo-32x32.png").await?;
    // Извлекает заголовки из ответа
    let headers = response.headers();

    match headers.get(CONTENT_TYPE) {
        None => {
            println!("Ответ не содердит заголовка `Content-Type`");
        }
        Some(content_type) => {
            let content_type = Mime::from_str(content_type.to_str()?)?;
            let media_type = match (content_type.type_(), content_type.subtype()) {
                (mime::TEXT, mime::HTML) => "документ HTML",
                (mime::TEXT, _) => "текст",
                (mime::IMAGE, mime::PNG) => "изображение PNG",
                (mime::IMAGE, _) => "изображение",
                _ => "не текст и не изображение",
            };

            println!("Ответ содержит {}", media_type);
            // Ответ содержит изображение PNG
        }
    };

    Ok(())
}
```

### 16.3. Клиенты

__Отправка запроса HTTP__

Отправляем синхронный GET-запрос HTTP с помощью метода [reqwest::blocking::get](https://docs.rs/reqwest/*/reqwest/blocking/fn.get.html), получаем структуру [reqwest::blocking::Response](https://docs.rs/reqwest/*/reqwest/blocking/struct.Response.html), читаем тело ответа в `String` с помощью метода [read_to_string](https://doc.rust-lang.org/std/io/trait.Read.html#method.read_to_string), печатаем статус, заголовки и тело ответа:

```rust
use error_chain::error_chain;
use std::io::Read;

error_chain! {
    foreign_links {
        Io(std::io::Error);
        HttpRequest(reqwest::Error);
    }
}

fn main() -> Result<()> {
    // Отправляем запрос/получаем ответ
    let mut res = reqwest::blocking::get("http://httpbin.org/get")?;
    let mut body = String::new();
    // Читаем тело ответа в строку
    res.read_to_string(&mut body)?;

    println!("Статус: {}", res.status());
    println!("Заголовки:\n{:#?}", res.headers());
    println!("Тело ответа:\n{}", body);

    Ok(())
}
```

__Async__

Асинхронный вариант предыдущего примера с использованием крейта [tokio](https://tokio.rs/):

```rust
use error_chain::error_chain;

error_chain! {
    foreign_links {
        Io(std::io::Error);
        HttpRequest(reqwest::Error);
    }
}

#[tokio::main]
async fn main() -> Result<()> {
    let res = reqwest::get("http://httpbin.org/get").await?;
    println!("Статус: {}", res.status());
    println!("Заголовки:\n{:#?}", res.headers());

    // Читаем тело запроса как текст
    let body = res.text().await?;
    println!("Тело ответа:\n{}", body);
    Ok(())
}
```

__Обращение к GitHub API__

Отправляем запрос к [stargazers API v3](https://developer.github.com/v3/activity/starring/#list-stargazers) с помощью [reqwest::get](https://docs.rs/reqwest/*/reqwest/fn.get.html) для получения списка пользователей, поставивших звезду проекту GitHub. Структура [reqwest::Response](https://docs.rs/reqwest/*/reqwest/struct.Response.html) десериализуется в структуру `User`, реализующую трейт [serde::Deserialize](https://docs.rs/serde/*/serde/trait.Deserialize.html).

[tokio::main](https://docs.rs/tokio/latest/tokio/attr.main.html) используется для установки асинхронного исполнителя (executor). Процесс ждет (`await`) завершения запроса перед обработкой ответа.

```rust
use reqwest::{header::USER_AGENT, Error};
use serde::Deserialize;

#[derive(Deserialize, Debug)]
struct User {
    login: String,
    id: u32,
}

#[tokio::main]
async fn main() -> Result<(), Error> {
    // Формируем URL
    let request_url = format!(
        "https://api.github.com/repos/{owner}/{repo}/stargazers",
        owner = "harryheman",
        repo = "my-js"
    );
    println!("{}", request_url);

    let client = reqwest::Client::new();
    // Отправляем запрос
    let response = client
        .get(request_url)
        // Обязательный заголовок
        .header(USER_AGENT, "")
        .send()
        .await?;

    // Преобразуем тело ответа в формате JSON в объекты `User`
    let users: Vec<User> = response.json().await?;
    println!("{:?}", users);
    Ok(())
}
```

__Проверка существования ресурса API__

Отправляем HEAD-запрос HTTP ([Client::head](https://docs.rs/reqwest/*/reqwest/struct.Client.html#method.head)) в конечную точку пользователей GitHub и определяем успех по статусу ответа. Так можно быстро проверить существование ресурса без получения тела ответа. Настройка [reqwest::Client](https://docs.rs/reqwest/*/reqwest/struct.Client.html) с помощью метода [ClientBuilder::timeout](https://docs.rs/reqwest/*/reqwest/struct.ClientBuilder.html#method.timeout) отменяет запрос, если он выполняется дольше 5 секунд.

Поскольку методы [ClientBuilder::build](https://docs.rs/reqwest/*/reqwest/struct.ClientBuilder.html#method.build) и [ReqwestBuilder::send](https://docs.rs/reqwest/latest/reqwest/struct.RequestBuilder.html#method.send) возвращают типы [reqwest::Error](https://docs.rs/reqwest/*/reqwest/struct.Error.html), в качестве типа значения, возвращаемого функцией `main`, используется [reqwest::Result](https://docs.rs/reqwest/*/reqwest/type.Result.html).

```rust
use reqwest::header::USER_AGENT;
use reqwest::ClientBuilder;
use reqwest::Result;
use std::time::Duration;

#[tokio::main]
async fn main() -> Result<()> {
    // Имя пользователя
    let user = "harryheman";
    // Конечная точка
    let request_url = format!("https://api.github.com/users/{}", user);
    println!("{}", request_url);

    // Таймаут, по истечении которого запрос отменяется
    let timeout = Duration::new(5, 0);
    // Создаем и настраиваем экземпляр клиента
    let client = ClientBuilder::new().timeout(timeout).build()?;
    // Отправляем HEAD-запрос
    let response = client
        .head(&request_url)
        // Обязательный заголовок
        .header(USER_AGENT, "")
        .send()
        .await?;

    // Определяем успех запроса по статусу ответа (200 ОК)
    if response.status().is_success() {
        println!("{} является пользователем", user);
    } else {
        println!("{} не является пользователем", user);
    }

    Ok(())
}
```

__Создание и удаление Gist с помощью GitHub API__

Создаем gist с помощью POST-запроса HTTP ([Client::post](https://docs.rs/reqwest/*/reqwest/struct.Client.html#method.post)) к [gists API v3](https://developer.github.com/v3/gists/) и удаляем его с помощью DELETE-запроса ([Client::delete](https://docs.rs/reqwest/*/reqwest/struct.Client.html#method.delete)).

Структура [reqwest::Client](https://docs.rs/reqwest/*/reqwest/struct.Client.html) отвечает за формирование запроса, включая URL, тело и аутентификацию. Тело запроса в формате JSON формируется с помощью макроса [serde_json::json!](https://docs.rs/serde_json/*/serde_json/macro.json.html). Оно устанавливается с помощью метода [RequestBuilder::json](https://docs.rs/reqwest/*/reqwest/struct.RequestBuilder.html#method.json). Заголовок авторизации устанавливается с помощью метода [RequestBuilder::header](https://docs.rs/reqwest/0.11.24/reqwest/struct.RequestBuilder.html#method.header). Метод [RequestBuilder::send](https://docs.rs/reqwest/*/reqwest/struct.RequestBuilder.html#method.send) отправляет запрос.

Для авторизации в GitHub API необходимо создать [токен доступа](https://github.com/settings/tokens) (не забудьте поставить галочку `gist`), и добавить его в файл `.env` в корне проекта (`GH_TOKEN=ghp_...`). Для доступа к переменным среды окружения из этого файла используется крейт [dotenv](https://docs.rs/dotenv).

```rust
use dotenv::dotenv;
use error_chain::error_chain;
use reqwest::{
    header::{AUTHORIZATION, USER_AGENT},
    Client,
};
use serde::Deserialize;
use serde_json::json;
use std::env;

error_chain! {
    foreign_links {
        EnvVar(env::VarError);
        HttpRequest(reqwest::Error);
    }
}

#[derive(Deserialize, Debug)]
struct Gist {
    id: String,
    html_url: String,
}

#[tokio::main]
async fn main() -> Result<()> {
    // Получаем переменные среды окружения из файла `.env`,
    // находящего в корневой директории
    dotenv().ok();

    // Тело запроса
    let gist_body = json!({
        "description": "описание gist",
        "public": true,
        "files": {
            "main.rs": {
            "content": r#"fn main() { println!("всем привет!");}"#
            }
    }});

    // Конечная точка
    let request_url = "https://api.github.com/gists";
    // Отправляем POST-запрос на создание gist
    let response = Client::new()
        .post(request_url)
        // Обязательный заголовок
        .header(USER_AGENT, "")
        // Заголовок авторизации
        .header(AUTHORIZATION, format!("Bearer {}", env::var("GH_TOKEN")?))
        // Добавляем тело
        .json(&gist_body)
        .send()
        .await?;

    if response.status().is_success() {
        let gist: Gist = response.json().await?;
        println!("Создан {:?}", gist);

        // Конечная точка
        let request_url = format!("{}/{}", request_url, gist.id);
        // Отправляем DELETE-запрос на удаление gist
        let response = Client::new()
            .delete(&request_url)
            // Обязательный заголовок
            .header(USER_AGENT, "")
            // Заголовок авторизации
            .header(AUTHORIZATION, format!("Bearer {}", env::var("GH_TOKEN")?))
            .send()
            .await?;

        if response.status().is_success() {
            println!(
                "Gist {} удален. Статус-код: {}",
                gist.id,
                response.status()
            );
        } else {
            println!("Запрос провалился. Статус-код: {}", response.status());
        }
    } else {
        println!("Запрос провалился. Статус-код: {}", response.status());
    }

    Ok(())
}
```

__Скачивание файла во временную директорию__

Создаем временную директорию с помощью структуры [tempfile::Builder](https://docs.rs/tempfile/*/tempfile/struct.Builder.html) и асинхронно скачиваем в нее файл через HTTP с помощью метода [reqwest::get](https://docs.rs/reqwest/*/reqwest/fn.get.html).

Создаем целевой [File](https://doc.rust-lang.org/std/fs/struct.File.html) с названием, извлеченным из [Response::url](https://docs.rs/reqwest/*/reqwest/struct.Response.html#method.url), внутри метода [tempdir](https://docs.rs/tempfile/3.1.0/tempfile/struct.Builder.html#method.tempdir), и копируем в нее скачанные данные с помощью метода [io::copy](https://doc.rust-lang.org/std/io/fn.copy.html). Временная директория автоматически удаляется после завершения программы.

```rust
use error_chain::error_chain;
use std::fs::File;
use std::io::copy;
use tempfile::Builder;

error_chain! {
     foreign_links {
         Io(std::io::Error);
         HttpRequest(reqwest::Error);
     }
}

#[tokio::main]
async fn main() -> Result<()> {
    // Временная директория
    let tmp_dir = Builder::new().prefix("example").tempdir()?;
    // Целевой файл
    let target = "https://www.rust-lang.org/logos/rust-logo-512x512.png";
    // Отправляем запрос
    let response = reqwest::get(target).await?;

    let mut dest = {
        let fname = response
            .url()
            .path_segments()
            .and_then(|segments| segments.last())
            .and_then(|name| if name.is_empty() { None } else { Some(name) })
            .unwrap_or("tmp.bin");
        // Названием файла является последняя часть пути или `tmp.bin`
        println!("файл для скачивания: '{}'", fname);
        let fname = tmp_dir.path().join(fname);
        // Путь к временной директории + название файла
        println!("будет находиться в: '{:?}'", fname);
        // Создаем и возвращаем дескриптор файла
        File::create(fname)?
    };
    // Читаем тело ответа как текст
    let content = response.text().await?;
    // Копируем содержимое в файл
    copy(&mut content.as_bytes(), &mut dest)?;
    // Файл и временная директория будут существовать на протяжении 5 секунд,
    // после чего автоматически удалятся
    std::thread::sleep(std::time::Duration::from_secs(5));
    Ok(())
}
```

__Отправка файла в paste-rs__

[reqwest::Client](https://docs.rs/reqwest/*/reqwest/struct.Client.html) устанавливает соединение с `https://paste.rs` с помощью паттерна [reqwest::RequestBuilder](https://docs.rs/reqwest/*/reqwest/struct.RequestBuilder.html). [Client::post](https://docs.rs/reqwest/*/reqwest/struct.Client.html#method.post) определяет назначение POST-запроса HTTP, [RequestBuilder::body](https://docs.rs/reqwest/*/reqwest/struct.RequestBuilder.html#method.body) устанавливает тело запроса, а [RequestBuilder::send](https://docs.rs/reqwest/*/reqwest/struct.RequestBuilder.html#method.send) отправляет запрос, блокирует поток до загрузки файла и получения ответа.

```rust
use error_chain::error_chain;
use std::fs::File;
use std::io::Read;

error_chain! {
    foreign_links {
        HttpRequest(reqwest::Error);
        IoError(::std::io::Error);
    }
}

#[tokio::main]
async fn main() -> Result<()> {
    // Конечная точка
    let paste_api = "https://paste.rs";
    // Дескриптор файла
    let mut file = File::open("message.txt")?;

    let mut contents = String::new();
    // Читаем содержимое файла в строку
    file.read_to_string(&mut contents)?;

    // Создаем клиента
    let client = reqwest::Client::new();
    // Отправляем запрос
    let res = client.post(paste_api).body(contents).send().await?;
    // Читаем ответ как текст
    let response_text = res.text().await?;
    println!("{}", response_text);
    Ok(())
}
```

_Обратите внимание_: для корректной работы программы нужно создать непустой файл `message.txt` в корне проекта.

__Частичная загрузка файла по HTTP с помощью заголовка диапазона__

Используем [reqwest::blocking::Client::head](https://docs.rs/reqwest/*/reqwest/blocking/struct.Client.html#method.head) для получения [Content-Length](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Length) (размера содержимого) ответа.

Используем [reqwest::blocking::Client::get](https://docs.rs/reqwest/*/reqwest/blocking/struct.Client.html#method.get) для загрузки содержимого по частям размером 10240 байт с отслеживанием прогресса. Часть и позиция определяются с помощью заголовка [Range](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Range), который определяется в [RFC7233](https://tools.ietf.org/html/rfc7233#section-3.1).

```rust
use error_chain::error_chain;
use reqwest::header::{HeaderValue, CONTENT_LENGTH, RANGE};
use reqwest::StatusCode;
use std::fs::File;
use std::str::FromStr;

error_chain! {
    foreign_links {
        Io(std::io::Error);
        Reqwest(reqwest::Error);
        Header(reqwest::header::ToStrError);
    }
}

struct PartialRangeIter {
    start: u64,
    end: u64,
    buffer_size: u32,
}

impl PartialRangeIter {
    pub fn new(start: u64, end: u64, buffer_size: u32) -> Result<Self> {
        if buffer_size == 0 {
            Err("невалидный `buffer_size`, размер буфера должен превышать 0")?;
        }
        Ok(PartialRangeIter {
            start,
            end,
            buffer_size,
        })
    }
}

impl Iterator for PartialRangeIter {
    type Item = HeaderValue;

    fn next(&mut self) -> Option<Self::Item> {
        if self.start > self.end {
            None
        } else {
            let prev_start = self.start;

            self.start += std::cmp::min(self.buffer_size as u64, self.end - self.start + 1);

            Some(
                HeaderValue::from_str(&format!("bytes={}-{}", prev_start, self.start - 1)).unwrap(),
            )
        }
    }
}

fn main() -> Result<()> {
    // Конечная точка
    let url = "https://httpbin.org/range/102400?duration=2";
    // Размер части
    const CHUNK_SIZE: u32 = 10240;

    let client = reqwest::blocking::Client::new();
    // Отправляем HEAD-запрос
    let response = client.head(url).send()?;
    // Получаем заголовок `Content-Length`
    let length = response
        .headers()
        .get(CONTENT_LENGTH)
        .ok_or("Ответ не содержит размера содержимого")?;
    // Получаем размер содержимого
    let length =
        u64::from_str(length.to_str()?).map_err(|_| "Невалидный заголовок `Content-Length`")?;

    // Дескриптор файла
    let mut output_file = File::create("download.bin")?;

    println!("Начинаем загрузку...");
    for range in PartialRangeIter::new(0, length - 1, CHUNK_SIZE)? {
        println!("Диапазон {:?}", range);
        // Отправляем GET-запрос с заголовком `Range`
        let mut response = client.get(url).header(RANGE, range).send()?;

        let status = response.status();
        if !(status == StatusCode::OK || status == StatusCode::PARTIAL_CONTENT) {
            error_chain::bail!("Неожиданный ответ сервера: {}", status)
        }
        // Копируем содержимое ответа в файл
        std::io::copy(&mut response, &mut output_file)?;
    }

    // Читаем ответ как текст
    let content = response.text()?;
    // Копируем байты ответа в файл
    std::io::copy(&mut content.as_bytes(), &mut output_file)?;

    println!("Загрузка успешно завершена");

    Ok(())
}
```

_Обратите внимание_: в результате выполнения программы в корне проекта должен появиться файл `download.bin`.

__Базовая аутентификация__

Для выполнения базовой аутентификации HTTP используется метод [reqwest::RequestBuilder::basic_auth](https://docs.rs/reqwest/*/reqwest/struct.RequestBuilder.html#method.basic_auth):

```rust
use reqwest::blocking::Client;
use reqwest::Error;

fn main() -> Result<(), Error> {
    let client = Client::new();

    let user_name = "testuser".to_string();
    let password: Option<String> = None;

    // Отправляем GET-запрос с базовой аутентификацией
    let response = client
        .get("https://httpbin.org/")
        .basic_auth(user_name, password)
        .send()?;

    println!("{:?}", response);

    Ok(())
}
```

Happy coding!
