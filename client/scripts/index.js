"use strict";
import { getTodos,updateTodo} from "./module/storage.js";
import {hendlerDeleteTodo, headerAddTask} from "./module/to-do.js"
export const tasks = await getTodos();

const page = {
  todo: {
    list: document.querySelector('.todo__list'),
    items: document.querySelectorAll('.todo__item') 
  },
  done: {
    list: document.querySelector('.done__list')
  }
}

window.hendlerDeleteTodo = hendlerDeleteTodo
window.headerAddTask = headerAddTask

function renderLists() {
  page.todo.list.innerHTML = "";
  page.done.list.innerHTML = "";

  for (const task of tasks) {
    const element = document.createElement('div')
    if (!task.done) {
    element.classList.add('todo__item')
    element.setAttribute('task-id', task.id)
    element.innerHTML = `
            <label id="${task.id}">
              <input type="checkbox" id="${task.id}" />
              ${task.title}
            </label>
            <button class="delete__button" onclick="hendlerDeleteTodo(${task.id})">
              <img src="./assets/icons8-trash-can-96.png" alt="Кнопка удаления задачи">
            </button>
            `;
    page.todo.list.appendChild(element)
    } else {
    element.classList.add('todo__item')
    element.classList.add('done__item')
    element.setAttribute('task-id', task.id)
    element.innerHTML = `
<label>
  <input type="checkbox" id="${task.id}" checked />
  ${task.title}
</label>
  <button class="delete__button" onclick="hendlerDeleteTodo(${task.id})">
      <img src="./assets/icons8-trash-can-96.png" alt="Кнопка удаления задачи">
  </button>
`
    page.done.list.appendChild(element)

    };
  };
  
};

function setupEventListeners() {
  page.todo.list.addEventListener('click', handleCheckboxClick);
  page.done.list.addEventListener('click', handleCheckboxClick);
}



function handleCheckboxClick(event) {
  if(event.target.type === 'checkbox') {
    const taskId = Number(event.target.id)
    const task = tasks.find(t => t.id === taskId)
    task.done = !task.done;

    rerender();
    updateTodo(task)
  }
}


export function rerender() {
  renderLists();
  console.log('rerender')
};

(() => {
  rerender();
  setupEventListeners();
})();


