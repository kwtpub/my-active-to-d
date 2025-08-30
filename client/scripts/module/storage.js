const API_URL = "http://localhost:3000/todos";
import { rerender } from "../index.js";

export async function getTodos() {
  const res = await fetch(API_URL);     // ждём ответа от сервера
  const todos = await res.json();       // преобразуем JSON в объект/массив
  return todos;                         // возвращаем массив задач
}
// Сохранение всех задач
export async function setTodos(todos) {
  const response = await fetch('http://localhost:3000/todos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(todos)
  });
  
  return await response.json();
}

// Обновление одной задачи
export async function updateTodo(todo) {
  const response = await fetch(`http://localhost:3000/todos/${todo.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(todo)
  });
  
  return await response.json();
}

export async function addTodo(title) {
    const response = await fetch('http://localhost:3000/todos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: title }) // Отправляем только title
    });
    return await response.json()  // Возвращаем созданную задачу
}

export async function deleteTodo(taskId) {
  const response = await fetch(`http://localhost:3000/todos/${taskId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    }
  })
  rerender();
  return await response.json();
}
