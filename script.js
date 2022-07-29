'use strict';

const form = document.forms['form'];
const currentTasksList = document.getElementById('currentTasks');
const completedTaskList = document.getElementById('completedTasks');

drawTasksInit();

form.onsubmit = changeTaskList;

currentTasksList.addEventListener('click', completeTask);
currentTasksList.addEventListener('click', editTask);
currentTasksList.addEventListener('click', deleteTask);
completedTaskList.onclick = deleteTask;

function changeTaskList(event) {
    event.preventDefault();

    const taskInfo = {
        id: generateId(),
        title: form['title'].value,
        text: form['text'].value,
        priority: form['priority'].value,
        color: form['color'].value,
        timestamp: Date.now(),
        current: true
    }

    localStorage.setItem(taskInfo.id, JSON.stringify(taskInfo));
    addTasksToList(taskInfo);

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
                <h5 class="mb-1">${title}</h5>
                <div>
                    <small class="mr-2">${priority} priority</small>
                    <small>${showCurrentDate(timestamp)}</small>
                </div>
            </div>
            <p class="mb-1 w-100">${text}</p>
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
        currentTasksList.append(task);
    } else {
        task.querySelector('[data-delete-after-complete]').remove();
        completedTaskList.append(task);
    }
}

function drawTasksInit() {
    (Object.values(localStorage))
        .forEach(taskJSON => addTasksToList(JSON.parse(taskJSON)));
}

function completeTask(event) {
    const btnComplete = event.target;

    if (!btnComplete.closest('.btn-success')) {
        return;
    }

    const task = btnComplete.closest('.list-group-item');
    const taskInfo = JSON.parse(localStorage.getItem(task.id));

    task.querySelector('[data-delete-after-complete]').remove();
    localStorage.setItem(task.id, JSON.stringify({...taskInfo, current: false}));
    completedTaskList.append(task);
}

function editTask(event) {
    const btnEdit = event.target;

    if (!btnEdit.closest('.btn-info')) {
        return;
    }

    const task = btnEdit.closest('.list-group-item');

    showForm(task.id);
}

function showForm(taskId) {
    const formLabel = document.getElementById('exampleModalLabel');
    const formBtn = document.getElementById('btn-submit');

    if (taskId) {
        const {title, text, priority, color} = JSON.parse(localStorage.getItem(taskId));

        form['title'].value = title;
        form['text'].value = text;
        form['priority'].value = priority;
        form['color'].value = color;
        formLabel.textContent = formBtn.textContent = 'Edit task'
    } else {
        form.reset();
        formLabel.textContent = formBtn.textContent = 'Add task'
    }
    $("#exampleModal").modal("show");
}

function deleteTask(event) {
    const btnDelete = event.target;

    if (!btnDelete.closest('.btn-danger')) {
        return;
    }

    const task = btnDelete.closest('.list-group-item');

    localStorage.removeItem(task.id);
    task.remove();
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