'use strict';
import {deleteTodo, addTodo} from "./storage.js"
import {tasks, rerender} from "../index.js"

export async function headerAddTask(event) {
  event.preventDefault();

  const todo_input = document.querySelector('.todo__input')
  const form = event.target;
  const data = new FormData(form);
  const newTask = data.get('title');
  todo_input.value = '';
  const todo = await addTodo(newTask)
  tasks.push(todo)
  rerender();
}

export async function hendlerDeleteTodo(taskId){
  deleteTodo(taskId);
  tasks.splice(taskId - 1, 1)
}

