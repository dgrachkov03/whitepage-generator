# WhitePage Generator

Генератор одностраничных сайтов с библиотекой готовых секций, дизайн-токенами и случайной сборкой макета. Стек: **Pug**, **Tailwind CSS v4**, **Vite 8**, ванильный JavaScript.

После клонирования репозитория **сначала запустите генератор** — он соберёт главную страницу, тему и оформление. Контент по умолчанию — нейтральные плейсхолдеры в `site.json`, замените их под свой проект.

## Возможности

- **Главная страница** с настраиваемым набором секций: hero, about, stats, features, services, why-us, process, pricing, reviews, faq, contact
- **Юридические страницы**: Privacy, Terms, Cookies
- **Генератор дизайна** (`npm run generate`) — случайный выбор палитры, типографики, блоков, фона страницы, стилей кнопок и мобильного меню
- **Дизайн-система**: палитры, скругления, тени, отступы секций, ритм типографики, микро-анимации
- **Компоненты**: sticky header, cookie banner, карусель (Swiper), контактная форма (intl-tel-input)
- **Иконки**: Lucide и Tabler (SVG inline)
- **Статическая сборка** в `dist/` — готова к загрузке на любой хостинг

## Требования

- [Node.js](https://nodejs.org/) **20+** (рекомендуется LTS)
- npm 10+

## Быстрый старт

```bash
# Клонировать репозиторий
git clone <url-репозитория> whitepage-generator
cd whitepage-generator

# Установить зависимости
npm install

# Собрать случайный лендинг (обязательный первый шаг)
npm run generate

# Режим разработки (http://localhost:5173)
npm run dev
```

До `npm run generate` на главной отображается заглушка. Юридические страницы (`privacy`, `terms`, `cookies`) работают сразу — их контент берётся из `site.json`.

## Команды

| Команда | Описание |
|---------|----------|
| `npm run dev` | Dev-сервер с hot reload |
| `npm run generate` | Случайная сборка дизайна и блоков (перезаписывает файлы, см. ниже) |
| `npm run build` | Production-сборка в `dist/` |
| `npm run preview` | Локальный просмотр собранного `dist/` |

### Production-сборка

```bash
npm run build
```

Результат — папка `dist/`:

```
dist/
  index.html
  privacy.html
  terms.html
  cookies.html
  assets/
    styles/    # CSS
    scripts/   # JS (code-split по компонентам)
    fonts/     # Локальные шрифты
    images/
```

При сборке автоматически создаётся пустой `dist/assets/styles/custom.css` и подключается ко всем HTML-страницам — туда можно добавить свои стили без правки шаблонов.

## Структура проекта

```
src/
  pug/
    pages/           # Страницы (index, privacy, terms, cookies)
    layouts/         # theme.pug, legal.pug, overlays.pug, main.pug
    blocks/          # Варианты секций по категориям
    mixins/          # Переиспользуемые фрагменты
    data/
      site.json      # Контент сайта (тексты, навигация, формы)
      site.schema.json
    design/          # Палитры, shapes, shadows, spacing, typography
    interactions/    # Hover-эффекты ссылок и кнопок
    legal/           # Шаблоны юридических документов и chrome
  styles/            # Глобальные CSS-компоненты
  scripts/           # Header, форма, карусель, cookie banner
  assets/            # Шрифты, изображения
plugins/pug-pages/   # Vite-плагин: рендер Pug → HTML
scripts/
  generate.js        # CLI генератора
  generator/         # Логика выбора блоков и дизайна + тесты
```

## Редактирование контента

Основной файл данных — **`src/pug/data/site.json`**. В нём:

- метаданные страницы (`title`, `description`, `lang`)
- бренд и навигация
- тексты всех секций (hero, services, faq и т.д.)
- контактная форма и контактные данные
- юридические тексты

Файл валидируется по `site.schema.json` при сборке. После правок `site.json` достаточно сохранить файл — dev-сервер пересоберёт страницы.

### Ручная настройка дизайна

Если не нужен случайный генератор, отредактируйте вручную:

- **`src/pug/layouts/theme.pug`** — `pageAppearance`: фон, кнопки, header (menu/burger/sticky), шрифты, палитра, shapes
- **`src/pug/pages/index.pug`** — список `include` блоков и `blockAppearance` (тон секций)
- **`src/pug/layouts/legal.pug`** — варианты header/footer юридических страниц
- **`src/pug/layouts/overlays.pug`** — вариант cookie banner

Комментарии в `theme.pug` и `index.pug` описывают допустимые значения.

## Генератор (`npm run generate`)

Генератор случайно собирает лендинг из библиотеки блоков и дизайн-токенов.

**Перезаписывает файлы:**

- `src/pug/pages/index.pug`
- `src/pug/layouts/theme.pug`
- `src/pug/layouts/legal.pug`
- `src/pug/layouts/overlays.pug`

Если вы вручную настраивали эти файлы — сделайте backup или закоммитьте изменения перед запуском `generate`.

После генерации в консоли выводится лог выбранных вариантов (палитра, блоки, типографика и т.д.). Если Pug не компилируется, файлы **откатываются** к предыдущему состоянию.

### Что выбирается случайно

- Палитра (светлая/тёмная, сбалансированное распределение)
- Типографика (10 пресетов шрифтов)
- 4–6 опциональных секций из 7 (stats, features, services, why-us, process, pricing, faq) + обязательные hero, about, reviews, contact
- Вариант каждого блока в своей категории (равная вероятность)
- Фон страницы, стили контролов, eyebrow, header menu/burger/sticky
- Юридический документ, header/footer legal, cookie banner

## Обновление с GitHub

Когда выходит новая версия шаблона, обновите локальную копию так:

```bash
# 1. Сохраните свои изменения
git status
git stash push -m "my customizations"   # или закоммитьте в отдельную ветку

# 2. Получите обновления
git fetch origin
git pull origin main

# 3. Обновите зависимости (если изменился package-lock.json)
npm install

# 4. Проверьте работоспособность
npm test
npm run build

# 5. Верните свои правки при необходимости
git stash pop
```

## Страницы

| URL (dev) | Файл | Описание |
|-----------|------|----------|
| `/` | `index.pug` | Главная |
| `/privacy.html` | `privacy.pug` | Политика конфиденциальности |
| `/terms.html` | `terms.pug` | Условия использования |
| `/cookies.html` | `cookies.pug` | Политика cookies |

## Шрифты

Шрифты лежат в `src/assets/fonts/` под лицензиями OFL (см. `OFL.txt` в папках семейств). Noto Sans подключается как fallback для недостающих глифов.

## Лицензия

Код шаблона распространяется под [MIT License](LICENSE).

Сторонние зависимости (Swiper, intl-tel-input, иконки Iconify) и шрифты в `src/assets/fonts/` (OFL) — на своих условиях, см. соответствующие `LICENSE` / `OFL.txt`.
