// Netlify Function для работы с задачами
import fs from 'fs';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
};

// Путь к файлу данных в /tmp (единственное место где можно писать в Netlify Functions)
const DATA_FILE = '/tmp/data.json';

// Инициализация данных
const initializeData = () => {
  if (!fs.existsSync(DATA_FILE)) {
    const initialData = [
      { id: 1, title: "Create icons for a dashboard", done: true },
      { id: 2, title: "Prepare a design presentation", done: false },
      { id: 3, title: "Stretch for 15 minutes", done: false },
      { id: 4, title: "Plan your meal", done: false },
      { id: 5, title: "Review daily goals before sleeping. Add some new if time permits", done: false },
      { id: 6, title: "Water indoor plants", done: true }
    ];
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
  }
};

export const handler = async (event, context) => {
  // Инициализируем данные
  initializeData();
  
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
    if (event.httpMethod === 'GET') {
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
    if (event.httpMethod === 'POST') {
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
    if (event.httpMethod === 'PUT') {
      const id = event.path.split('/').pop();
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
    if (event.httpMethod === 'DELETE') {
      const id = event.path.split('/').pop();
      
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

    // Если метод не поддерживается
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      },
      body: JSON.stringify({ error: 'Method not allowed' })
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