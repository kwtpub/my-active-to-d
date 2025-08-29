"use strict";
import { getTodos, setTodos, updateTodo, addTodo, deleteTodo} from "./module/storage.js";

const page = {
  todo: {
    list: document.querySelector('.todo__list'),
    items: document.querySelectorAll('.todo__item') 
  },
  done: {
    list: document.querySelector('.done__list')
  }
}
const tasks =  await getTodos();

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
  console.log(event)
  if(event.target.type === 'checkbox') {
    const taskId = Number(event.target.id)
    const task = tasks.find(t => t.id === taskId)
    task.done = !task.done;
    rerender();
    updateTodo(task)
  }
}


window.hendlerDeleteTodo = function(taskId) {
  deleteTodo(taskId);
  tasks.splice(taskId - 1, 1)
}


const todo_form = document.querySelector('.todo__form')
const todo_input = document.querySelector('.todo__input')

// todo_form.addEventListener('submit', (e) => {
//   e.preventDefault()
//   }
// )
window.headerAddTask = async function(event) {
  const form = event.target;
  event.preventDefault();
  const data = new FormData(form);
  const newTask = data.get('title');
  todo_input.value = '';
  const todo = await addTodo(newTask)
  tasks.push({id: tasks.length + 1, title: newTask, done: false})
  rerender();
}


export function rerender() {
  renderLists();
  console.log('rerender')
};

(() => {
  rerender();
  setupEventListeners();
})();
