# Денис Воронков — сайт и резюме

Портфолио контент-менеджера: контент, оформление, печать и сайты.
Пять страниц на чистом HTML, CSS и JavaScript — без сборки, фреймворков и сторонних библиотек.

**Адрес:** https://askuyr.github.io/

Оформление: тёмный монохромный фон, костяная светлая полоса, крупная сжатая типографика.
Один акцент — светлая бирюза для фокуса и ссылок. Скруглений и теней нет: глубина — сменой тона.

## Страницы

| Файл | Содержание |
|---|---|
| `index.html` | первый экран с именем и портретом, факты, пять работ, блок «о себе», контакты |
| `works.html` | пять работ с описанием, ссылками и просмотром крупнее |
| `about.html` | навыки, процесс, опыт, образование, общественная работа |
| `contacts.html` | почта, телефон, GitHub, резюме PDF/DOCX, копирование почты |
| `branding.html` | брендинг «Нового поколения»: знак в пяти вариантах, палитра |
| `kit.html` | дизайн-система: цвета, типографика, компоненты, иконки, сетка (`noindex`) |
| `404.html` | страница ошибки |

Меню в шапке: Работы, О себе, Контакты. Текущая страница отмечена `aria-current="page"`.

## Дизайн-система

Всё оформление собрано на токенах в `assets/css/tokens.css`; раскладка и компоненты — в
`assets/css/style.css`. Разметка цветов и размеров не задаёт.

| Что | Значение |
|---|---|
| Фон | `#0B0C0C`, панели `#141616` |
| Светлая полоса | `#EDEAE3`, текст на ней `#0B0C0C` |
| Основной текст | `#EDEAE3`, второстепенный `#B8B6AD`, подписи `#8B8E88` |
| Акцент | `#8FD6CD` — фокус и ссылки |
| Линии | `rgb(237 234 227 / .16)`, усиленные `.34` |
| Дисплей | Oswald 500–600, uppercase, трекинг −0.015…−0.03em |
| Текст | Jost 300–600, 16–18 px, интерлиньяж 1.55 |
| Кегли | `--s-xs` 13 / `--s-s` 15 / body / lead / h3 / h2 / h1 / `--s-mega` |
| Радиусы | 0 |
| Тени | нет |
| Брейкпоинты | 960 px и 820 px |

Страница `kit.html` показывает те же токены и компоненты вживую.

## Шрифты

Лежат локально в `assets/fonts/`, сторонних запросов нет.

| Семейство | Роль | Лицензия |
|---|---|---|
| Oswald 300–700 | заголовки, подписи | SIL Open Font License 1.1 — [Google Fonts](https://fonts.google.com/specimen/Oswald) |
| Jost 300–600 | основной текст | SIL Open Font License 1.1 — [Google Fonts](https://fonts.google.com/specimen/Jost) |

Кириллица и латиница — отдельные файлы `woff2`. Текст лицензии:
https://openfontlicense.org/open-font-license-official-text/

## Файлы

```
index.html                 главная
works.html                 работы
about.html                 о себе
contacts.html              контакты
branding.html              брендинг «Нового поколения»
kit.html                   дизайн-система (noindex)
404.html                   страница ошибки
manifest.webmanifest       установка на телефон
sitemap.xml                карта сайта
robots.txt                 правила обхода
assets/css/fonts.css       подключение шрифтов
assets/css/tokens.css      цвета, кегли, отступы
assets/css/style.css       раскладка и компоненты
assets/js/main.js          меню, появление блоков, просмотр, копирование почты
assets/fonts/*.woff2       Oswald и Jost
assets/img/*               портрет, снимки работ, OG-картинка, иконки
assets/img/brand/*         знак «Нового поколения» в вариантах
assets/docs/*.pdf|docx     резюме
```

## Как править

- Тексты лежат в разметке, секции подписаны комментариями.
- Цвета, кегли и отступы меняются в `assets/css/tokens.css`, не в разметке.
- Новая страница копируется с любой существующей: шапка и подвал одинаковые,
  меняется `<main>`, `<title>` и мета-теги.
- Снимки работ обновляются заменой файлов в `assets/img/`: `work-novo.jpg`,
  `work-law.jpg`, `work-sarto.jpg`, `brand-board.jpg`, `forum-light.jpg`.
- Портрет — `assets/img/portrait.jpg` (используется на главной, «О себе» и в OG).

## Резюме

Исходник — `assets/docs/voronkov-resume-2026.html`, собирается в PDF через Edge:

```powershell
& 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe' --headless=new --disable-gpu `
  --no-pdf-header-footer --user-data-dir="$env:TEMP\edge-pdf" `
  "--print-to-pdf=assets/docs/voronkov-resume.pdf" `
  "file:///C:/Users/askuyr/Documents/GitHub/askuyr.github.io/assets/docs/voronkov-resume-2026.html"
```

Сайт ссылается на `assets/docs/voronkov-resume.pdf`; исходник макета — `voronkov-resume-2026.html`.
Версия DOCX осталась прежней и требует пересборки.

## Локальный просмотр

Открывать через локальный сервер, иначе браузер блокирует шрифты по `file://`:

```bash
python -m http.server 8000
```

Затем открыть http://localhost:8000. На Windows в этом репозитории есть `.serve.py`.

## Публикация

Сайт лежит в корне ветки `main` репозитория `askuyr/askuyr.github.io`. GitHub Pages
раздаёт его как user pages: https://askuyr.github.io/.

```bash
git add .
git commit -m "site: тёмный редакционный редизайн"
git push origin main
```

Резервная копия прежней версии — ветка `backup-2026-11-24`.

## Принципы

- Никаких вымышленных проектов, метрик и технологий.
- Имена и контакты публикуются только с согласия людей.
- Политическая символика в оформлении не используется.
- Сайт работает без JavaScript: текст, ссылки и картинки остаются доступными.
- Внешних запросов нет: шрифты и изображения — собственные.

© 2026 Денис Воронков
