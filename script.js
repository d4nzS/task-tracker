'use strict';

const form = document.forms['form'];

const btnAddTask = document.getElementById('btnAddTask');
const btnSortNewToOld = document.getElementById('btnSort');
const btnSortOldToNew = document.getElementById('btnSortReverse');
const btnThemeColor = document.getElementById('btnThemeColor');

const currentTasksList = document.getElementById('currentTasks');
const completedTaskList = document.getElementById('completedTasks');

init();

btnAddTask.onclick = onShowForm.bind(null, null);
btnSortNewToOld.onclick = onSortTasks.bind(null, true);
btnSortOldToNew.onclick = onSortTasks.bind(null, false);
btnThemeColor.oninput = onChangeTheme;

form.onsubmit = onChangeTaskList;

currentTasksList.addEventListener('click', onCompleteTask);
currentTasksList.addEventListener('click', onEditTask);
currentTasksList.addEventListener('click', onDeleteTask);
completedTaskList.onclick = onDeleteTask;

function onChangeTaskList(event) {
    event.preventDefault();

    const taskInfo = {
        id: form.id ? form.id : generateId(),
        title: form['title'].value,
        text: form['text'].value,
        priority: form['priority'].value,
        color: form['color'].value,
        timestamp: form.id ? JSON.parse(localStorage.getItem(form.id)).timestamp
            : Date.now(),
        current: true
    }

    localStorage.setItem(taskInfo.id, JSON.stringify(taskInfo));

    if (form.id) {
        editTask(taskInfo)
    } else {
        addTasksToList(taskInfo);
        showTasksAmount();
    }

    form.reset();
    $("#exampleModal").modal("hide");
}

function addTasksToList({id, title, text, priority, color, timestamp, current}) {
    const task = document.createElement('li');

    task.id = id;
    task.style.backgroundColor = color;
    task.classList.add('list-group-item', 'd-flex', 'w-100', 'mb-2');
    task.innerHTML = `
        <div class="w-100 mr-2">
            <div class="d-flex w-100 justify-content-between">
                <h5 class="mb-1" data-title>${title}</h5>
                <div>
                    <small class="mr-2"><span data-priority>${priority}</span> priority</small>
                    <small>${showCurrentDate(timestamp)}</small>
                </div>
            </div>
            <p class="mb-1 w-100" data-text>${text}</p>
        </div>
        <div class="dropdown m-2 dropleft">
            <button class="btn btn-secondary h-100" type="button" id="dropdownMenuItem1"
                    data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                <i class="fas fa-ellipsis-v"></i>
            </button>
            <div class="dropdown-menu p-2 flex-column" aria-labelledby="dropdownMenuItem1">
                <div data-delete-after-complete>
                    <button type="button" class="btn btn-success w-100">Complete</button>
                    <button type="button" class="btn btn-info w-100 my-2">Edit</button>
                </div>
                <button type="button" class="btn btn-danger w-100">Delete</button>
            </div>
        </div>
    `;

    if (current) {
        currentTasksList.prepend(task);
    } else {
        task.querySelector('[data-delete-after-complete]').remove();
        completedTaskList.prepend(task);
    }
}

function init() {
    document.body.style.backgroundColor = localStorage.getItem('theme');

    const initialSort = localStorage.getItem('sort')
        ? JSON.parse(localStorage.getItem('sort'))
        : true;
    onSortTasks(initialSort);
    showTasksAmount();
}

function onSortTasks(boolean) {
    localStorage.setItem('sort', JSON.stringify(boolean));

    currentTasksList.innerHTML = '';
    completedTaskList.innerHTML = '';

    const taskList = (Object.keys(localStorage))
        .filter(key => key.startsWith('_'))
        .map(key => JSON.parse(localStorage.getItem(key)));

    boolean
        ? taskList.sort((prevTask, task) => prevTask.timestamp - task.timestamp)
        : taskList.sort((prevTask, task) => task.timestamp - prevTask.timestamp);

    taskList.forEach(task => addTasksToList(task));
}

function onChangeTheme() {
    const themeColor = btnThemeColor.value;

    document.body.style.backgroundColor = themeColor;
    localStorage.setItem('theme', themeColor);
}

function onCompleteTask(event) {
    const btnComplete = event.target;

    if (!btnComplete.closest('.btn-success')) {
        return;
    }

    const task = btnComplete.closest('.list-group-item');
    const taskInfo = JSON.parse(localStorage.getItem(task.id));

    task.querySelector('[data-delete-after-complete]').remove();
    localStorage.setItem(task.id, JSON.stringify({...taskInfo, current: false}));
    completedTaskList.append(task);
    showTasksAmount();
}

function onEditTask(event) {
    const btnEdit = event.target;

    if (!btnEdit.closest('.btn-info')) {
        return;
    }

    const task = btnEdit.closest('.list-group-item');

    onShowForm(task.id);
}

function editTask({id, title, text, priority, color}) {
    const task = document.getElementById(id);

    task.querySelector('[data-title]').textContent = title;
    task.querySelector('[data-text]').textContent = text;
    task.querySelector('[data-priority]').textContent = priority;
    task.style.backgroundColor = color;
}

function onDeleteTask(event) {
    const btnDelete = event.target;

    if (!btnDelete.closest('.btn-danger')) {
        return;
    }

    const task = btnDelete.closest('.list-group-item');

    localStorage.removeItem(task.id);
    task.remove();
    showTasksAmount();
}

function onShowForm(taskId) {
    const formLabel = document.getElementById('exampleModalLabel');
    const formBtn = document.getElementById('btn-submit');

    if (taskId) {
        const {id, title, text, priority, color} = JSON.parse(localStorage.getItem(taskId));

        form.id = id;
        form['title'].value = title;
        form['text'].value = text;
        form['priority'].value = priority;
        form['color'].value = color;
        formLabel.textContent = formBtn.textContent = 'Edit task';
    } else {
        form.removeAttribute('id');
        form.reset();
        formLabel.textContent = formBtn.textContent = 'Add task';
    }

    $("#exampleModal").modal("show");
}

function showTasksAmount() {
    document.getElementById('currentTasksAmount').textContent = currentTasksList.children.length;
    document.getElementById('completedTasksAmount').textContent = completedTaskList.children.length;
}

/**
 * Generate id for task
 * @returns {string}
 */
function generateId() {
    return "_" + Math.random().toString(36).substr(2, 9);
}

/**
 * Date format hh:mm dd.mm.yyyy
 * @returns {string}
 */
function showCurrentDate(timestamp) {
    const date = new Date(timestamp);

    let times = [
        date.getHours(),
        date.getMinutes(),
        date.getDate(),
        date.getMonth() + 1,
        date.getFullYear(),
    ];
    times = times.map(item => item < 10 ? "0" + item : item);

    return `${times[0]}:${times[1]} ${times[2]}.${times[3]}.${times[4]}`;
}