// Netlify Function для работы с задачами
const fs = require('fs');
const path = require('path');

// Путь к файлу данных
const DATA_FILE = path.join(__dirname, '..', '..', 'server', 'data.json');

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
};

exports.handler = async (event, context) => {
  // Обработка preflight OPTIONS запросов
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: corsHeaders,
      body: ''
    };
  }

  try {
    // GET /todos - получение всех задач
    if (event.httpMethod === 'GET' && event.path === '/todos') {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        },
        body: data
      };
    }

    // POST /todos - создание новой задачи
    if (event.httpMethod === 'POST' && event.path === '/todos') {
      const newTodo = JSON.parse(event.body);
      
      // Читаем текущие задачи
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      const todos = JSON.parse(data);
      
      // Генерируем новый ID
      const newId = Math.max(...todos.map(t => t.id), 0) + 1;
      
      // Создаем новую задачу
      const todoToAdd = {
        id: newId,
        title: newTodo.title,
        done: false
      };

      // Добавляем в массив
      todos.push(todoToAdd);

      // Сохраняем обратно в файл
      fs.writeFileSync(DATA_FILE, JSON.stringify(todos, null, 2));

      return {
        statusCode: 201,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        },
        body: JSON.stringify(todoToAdd)
      };
    }

    // PUT /todos/:id - обновление задачи
    if (event.httpMethod === 'PUT' && event.path.startsWith('/todos/')) {
      const id = event.path.split('/')[2];
      const updatedTodo = JSON.parse(event.body);
      
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      const todos = JSON.parse(data);
      const todoIndex = todos.findIndex(todo => todo.id.toString() === id.toString());

      if (todoIndex === -1) {
        return {
          statusCode: 404,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          },
          body: JSON.stringify({ error: 'Задача не найдена' })
        };
      }

      todos[todoIndex] = { ...todos[todoIndex], ...updatedTodo };
      fs.writeFileSync(DATA_FILE, JSON.stringify(todos, null, 2));

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        },
        body: JSON.stringify(todos[todoIndex])
      };
    }

    // DELETE /todos/:id - удаление задачи
    if (event.httpMethod === 'DELETE' && event.path.startsWith('/todos/')) {
      const id = event.path.split('/')[2];
      
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      const todos = JSON.parse(data);
      const todoIndex = todos.findIndex(todo => todo.id.toString() === id.toString());

      if (todoIndex === -1) {
        return {
          statusCode: 404,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          },
          body: JSON.stringify({ error: 'Задача не найдена' })
        };
      }

      const deletedTodo = todos.splice(todoIndex, 1)[0];
      fs.writeFileSync(DATA_FILE, JSON.stringify(todos, null, 2));

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        },
        body: JSON.stringify({ 
          success: true, 
          message: 'Задача удалена',
          deleted: deletedTodo 
        })
      };
    }

    // Если маршрут не найден
    return {
      statusCode: 404,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      },
      body: JSON.stringify({ error: 'Not Found' })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      },
      body: JSON.stringify({ error: 'Внутренняя ошибка сервера' })
    };
  }
};
