# Инструкция по деплою на Netlify

## Подготовка проекта

Проект уже настроен для деплоя на Netlify. Включены следующие компоненты:

### 1. Конфигурация Netlify
- `netlify.toml` - основная конфигурация
- `client/_redirects` - редиректы для SPA

### 2. Netlify Functions
- `netlify/functions/todos.js` - API для работы с задачами
- Автоматически обрабатывает CORS

### 3. Переменные окружения
- `client/scripts/config.js` - автоматическое определение API URL
- Локальная разработка: `http://localhost:3000/todos`
- Продакшен: `/.netlify/functions/todos`

## Шаги деплоя

### Вариант 1: Через Netlify CLI
```bash
# Установка Netlify CLI
npm install -g netlify-cli

# Логин в Netlify
netlify login

# Деплой
netlify deploy --prod --dir=client
```

### Вариант 2: Через GitHub
1. Загрузите проект в GitHub репозиторий
2. Войдите в [Netlify](https://netlify.com)
3. Нажмите "New site from Git"
4. Выберите ваш репозиторий
5. Настройки:
   - Build command: `cd client && npm run build`
   - Publish directory: `client`
   - Functions directory: `netlify/functions`

### Вариант 3: Drag & Drop
1. Соберите проект: `cd client && npm run build`
2. Перетащите папку `client` в Netlify Dashboard

## Локальная разработка

```bash
# Запуск клиента
cd client
npm run dev

# Запуск сервера (для локальной разработки)
cd server
node server.js
```

## Структура проекта

```
├── client/                 # Фронтенд приложение
│   ├── _redirects         # Netlify редиректы
│   ├── scripts/
│   │   ├── config.js      # Конфигурация API
│   │   └── module/
│   │       └── storage.js # API клиент
├── netlify/
│   └── functions/
│       └── todos.js       # Netlify Function (API)
├── server/                # Локальный сервер (для разработки)
└── netlify.toml          # Конфигурация Netlify
```

## Важные замечания

1. **Данные**: Netlify Functions используют файл `server/data.json` для хранения данных
2. **CORS**: Настроен автоматически для всех запросов
3. **Редиректы**: SPA роутинг настроен через `_redirects`
4. **Окружение**: API URL определяется автоматически

## Проверка деплоя

После деплоя проверьте:
- [ ] Сайт открывается
- [ ] Задачи загружаются
- [ ] Можно добавлять новые задачи
- [ ] Можно отмечать задачи как выполненные
- [ ] Можно удалять задачи
