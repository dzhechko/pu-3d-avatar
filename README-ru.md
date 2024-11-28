# 🤖 AI-Powered Talking Avatar

<div align="center">
  <img src="docs/avatar-preview.gif" alt="Avatar Preview" width="300"/>
  
  <p align="center">
    <b>Интерактивный 3D-аватар с искусственным интеллектом для практики английского языка</b>
  </p>
</div>

## 📖 О проекте

Это современное веб-приложение, которое предоставляет интерактивного 3D-аватара с искусственным интеллектом для практики разговорного английского языка. Аватар может понимать как текстовые, так и голосовые сообщения, отвечая естественным голосом с синхронизированной анимацией губ.

### ✨ Основные возможности

- 🎤 Поддержка голосового и текстового ввода
- 🧠 Интеграция с OpenAI для умных ответов
- 🗣️ Реалистичный синтез речи через ElevenLabs
- 👄 Синхронизация движения губ с речью
- 🌓 Темная и светлая темы оформления
- 💬 Интерактивный чат-интерфейс

## 🏗️ Архитектура

Проект построен на современном стеке технологий и разделен на два основных компонента:

### Frontend (apps/frontend)
- React + Vite для быстрой разработки
- Three.js для 3D-рендеринга
- Tailwind CSS для стилизации
- WebSocket для real-time коммуникации

### Backend (apps/backend)
- Node.js + Express
- Интеграция с AI-сервисами:
  - OpenAI для обработки сообщений
  - Whisper для распознавания речи
  - ElevenLabs для синтеза речи
- Rhubarb для синхронизации губ

## 🚀 Запуск проекта

### Предварительные требования

```bash
# Необходимые компоненты
- Node.js 18+
- Yarn
- Git
```

### Настройка окружения

1. Клонируйте репозиторий:
```bash
git clone https://github.com/your-username/talking-avatar-with-ai.git
cd talking-avatar-with-ai
```

2. Создайте файл .env в корне проекта:
```env
# OPENAI
OPENAI_MODEL=<YOUR_GPT_MODEL>
OPENAI_API_KEY=<YOUR_OPENAI_API_KEY>

# Elevenlabs
ELEVEN_LABS_API_KEY=<YOUR_ELEVEN_LABS_API_KEY>
ELVEN_LABS_VOICE_ID=<YOUR_ELEVEN_LABS_VOICE_ID>
ELEVEN_LABS_MODEL_ID=<YOUR_ELEVEN_LABS_MODEL_ID>
```

3. Установите зависимости:
```bash
yarn install
```

### Запуск приложения

```bash
# Запуск всего проекта (frontend + backend)
yarn dev

# Запуск только frontend
yarn client

# Запуск только backend
yarn server
```

## 🛠️ Режим отладки

В проекте реализована система отладки, которую можно включить, установив переменную `DEBUG=true` в файлах:
- `apps/frontend/src/hooks/useDarkMode.js`
- `apps/frontend/src/components/ThinkingIndicator.jsx`
- Другие компоненты, где требуется отладка

## 📝 Структура проекта

```
talking-avatar-with-ai/
├── apps/
│   ├── frontend/          # React приложение
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── constants/
│   │   └── package.json
│   │
│   └── backend/           # Node.js сервер
│       ├── src/
│       │   ├── modules/
│       │   ├── utils/
│       │   └── server.js
│       └── package.json
│
└── package.json          # Корневой package.json
```

## 🤝 Вклад в проект

Мы приветствуем вклад в развитие проекта! Если вы хотите помочь:

1. Форкните репозиторий
2. Создайте ветку для ваших изменений
3. Внесите изменения и создайте Pull Request

## 📄 Лицензия

MIT License - подробности в файле [LICENSE](LICENSE)

## 🙏 Благодарности

- OpenAI за GPT API
- ElevenLabs за синтез речи
- Сообществу Three.js
- Всем контрибьюторам проекта 