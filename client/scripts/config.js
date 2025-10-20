// Конфигурация API URL в зависимости от окружения
const API_CONFIG = {
  // Для локальной разработки
  development: "http://localhost:3000/todos",
  // Для Netlify Functions
  production: "/.netlify/functions/todos"
};

// Определяем окружение
const isDevelopment = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1';

export const API_URL = isDevelopment ? API_CONFIG.development : API_CONFIG.production;
